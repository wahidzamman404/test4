"""Bilingual staff and session-review browser checks. No external messages are sent."""

import argparse
import re

from playwright.sync_api import expect, sync_playwright


ROLES = {
    "ur": ["ڈیزائن مشیر", "کاریگر", "پروجیکٹ کوآرڈینیٹر"],
    "en": ["Design consultant", "Workshop specialist", "Project coordinator"],
}


def language(page, locale):
    if page.locator("html").get_attribute("lang") != locale:
        page.locator("#language-toggle").click()
    expect(page.locator("html")).to_have_attribute("lang", locale)
    expect(page.locator("html")).to_have_attribute("dir", "rtl" if locale == "ur" else "ltr")


def check_no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), page.evaluate(
        "({viewport:innerWidth,document:document.documentElement.scrollWidth})"
    )


def settle_carousel(page):
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")


def run(url, chromium):
    checks, errors = [], []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=chromium, headless=True, args=["--no-sandbox"]
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 1000}, reduced_motion="reduce"
        )
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(url, wait_until="networkidle")
        page.evaluate("document.fonts.ready")

        for locale in ("ur", "en"):
            language(page, locale)
            expect(page.locator(".team-title")).to_have_text(ROLES[locale])
            expect(page.locator("#team-grid .demo-tag")).to_have_text(
                ["نمونہ پروفائل" if locale == "ur" else "Demo profile"] * 3
            )
            for index, role in enumerate(("designer", "maker", "coordinator")):
                image = page.locator("#team-grid .team-card").nth(index).locator("img")
                image.scroll_into_view_if_needed()
                page.wait_for_function(
                    "selector => { const image = document.querySelector(selector); return image.complete && image.naturalWidth > 0; }",
                    arg=f"#team-grid .team-card:nth-child({index + 1}) img",
                )
                button = page.locator(f'.team-contact[data-team-role="{role}"]')
                prompt = button.get_attribute(f"data-{locale}-quote-message").strip()
                button.click()
                expect(page.locator("#quote-dialog")).to_be_visible()
                expect(page.locator("#quote-name")).to_be_focused()
                expect(page.locator("#quote-message")).to_have_value(prompt)
                page.locator("#quote-message").fill("")
                page.keyboard.press("Escape")
                expect(page.locator("#quote-dialog")).not_to_be_visible()
                expect(page.locator(f'.team-contact[data-team-role="{role}"]')).to_be_focused()
            checks.append(f"{locale}: three role profiles, demo labels, loaded portraits, locale-correct quote prompts, focus and Escape")

        language(page, "ur")
        designer = page.locator('[data-team-role="designer"]')
        en_prompt = designer.get_attribute("data-en-quote-message").strip()
        designer.click()
        page.evaluate("window.SF_SET_LANGUAGE('en')")
        expect(page.locator("#quote-message")).to_have_value(re.compile(re.escape(en_prompt)))
        page.keyboard.press("Escape")
        expect(page.locator('[data-team-role="designer"]')).to_be_focused()
        expect(page.locator('[data-team-role="designer"]')).to_have_text("Discuss your design")
        page.locator('[data-team-role="designer"]').click()
        page.locator("#quote-message").fill("")
        page.locator('#quote-dialog [data-close-dialog]').click()
        expect(page.locator('[data-team-role="designer"]')).to_be_focused()
        checks.append("Quote origin survives a language change; managed staff prompt localizes and both close methods return focus")

        for locale in ("ur", "en"):
            language(page, locale)
            page.locator("#review-open").click()
            expect(page.locator("#review-dialog")).to_be_visible()
            expect(page.locator("#review-name")).to_be_focused()
            expect(page.locator("html")).to_have_class(re.compile(r"\bdialog-open\b"))
            page.locator('#review-form [type="submit"]').click()
            name_error = page.locator("#review-name").evaluate("field => field.validationMessage")
            assert ("نام" in name_error) if locale == "ur" else ("name" in name_error)
            expect(page.locator("#reviews-track .review-card")).to_have_count(3)
            page.locator("#review-name").fill("Test Reviewer")
            for invalid_text in ("short", " " * 30):
                page.locator("#review-message").fill(invalid_text)
                page.locator('#review-form [type="submit"]').click()
                expect(page.locator("#review-dialog")).to_be_visible()
                expect(page.locator("#review-message")).to_be_focused()
                message = page.locator("#review-message").evaluate("field => field.validationMessage")
                assert ("۲۰" in message) if locale == "ur" else ("20" in message)
                expect(page.locator("#reviews-track .review-card")).to_have_count(3)
            page.keyboard.press("Escape")
            expect(page.locator("#review-dialog")).not_to_be_visible()
            expect(page.locator("#review-open")).to_be_focused()
            page.locator("#review-open").click()
            page.locator("#review-name").fill("")
            page.locator("#review-message").fill("")
            page.locator('#review-dialog [data-close-dialog]').click()
            expect(page.locator("#review-open")).to_be_focused()
            expect(page.locator("html")).not_to_have_class(re.compile(r"\bdialog-open\b"))
            checks.append(f"{locale}: required, short and whitespace reviews rejected with localized validation; modal focus and scroll lock")

        language(page, "ur")
        page.locator("#review-open").click()
        malicious_name = '<img src=x onerror="window.reviewPwned=true">'
        malicious_review = '<script>window.reviewPwned=true</script> یہ صرف ایک محفوظ آزمائشی تبصرہ ہے۔'
        page.locator("#review-name").fill(malicious_name)
        page.locator("#review-city").fill("<b>لاہور</b>")
        page.locator("#review-rating").select_option("4")
        page.locator("#review-message").fill(malicious_review)
        page.locator('#review-form [type="submit"]').click()
        expect(page.locator("#review-dialog")).not_to_be_visible()
        expect(page.locator("#review-open")).to_be_focused()
        expect(page.locator("#reviews-track .review-card")).to_have_count(4)

        for locale in ("ur", "en", "ur"):
            language(page, locale)
            first = page.locator("#reviews-track .review-card").first
            expect(first.locator(".review-name")).to_have_text(malicious_name)
            expect(first.locator(".review-text")).to_have_text(malicious_review)
            expect(first.locator(".review-city")).to_have_text("<b>لاہور</b>")
            expect(first.locator(".demo-tag")).to_have_text("اسی ڈیوائس پر" if locale == "ur" else "On this device")
            expect(first.locator("img, script, b")).to_have_count(0)
            expect(page.locator("#reviews-track .review-card:not(:first-child) > .demo-tag")).to_have_text(
                ["نمونہ تبصرہ" if locale == "ur" else "Sample review"] * 3
            )
            expect(page.locator("#reviews-track .review-stars svg")).to_have_count(20)
            assert page.evaluate("window.reviewPwned === undefined")
        checks.append("Safe HTML review stays literal and first, retains its text through two language switches, and is clearly session-only")

        page.reload(wait_until="networkidle")
        expect(page.locator("#reviews-track .review-card")).to_have_count(3)
        assert not page.evaluate(
            "[...Object.values(localStorage),...Object.values(sessionStorage)].some(value=>value.includes('reviewPwned'))"
        )
        checks.append("Reload clears submitted reviews; personal review content is absent from localStorage and sessionStorage")

        for width in (360, 390, 768, 1440):
            page.set_viewport_size({"width": width, "height": 900})
            for locale in ("ur", "en"):
                language(page, locale)
                page.locator("#reviews-track").scroll_into_view_if_needed()
                expect(page.locator("#reviews-prev")).to_be_disabled()
                check_no_overflow(page)
                track = page.locator("#reviews-track")
                if page.locator("#reviews-next").is_enabled():
                    page.locator("#reviews-next").click()
                    settle_carousel(page)
                    expect(page.locator("#reviews-prev")).to_be_enabled()
                    for _ in range(4):
                        if page.locator("#reviews-next").is_disabled():
                            break
                        page.locator("#reviews-next").click()
                        settle_carousel(page)
                    expect(page.locator("#reviews-next")).to_be_disabled()
                    track.focus()
                    page.keyboard.press("Home")
                    expect(page.locator("#reviews-prev")).to_be_disabled()
                    page.keyboard.press("ArrowLeft" if locale == "ur" else "ArrowRight")
                    expect(page.locator("#reviews-prev")).to_be_enabled()
                    page.keyboard.press("End")
                    expect(page.locator("#reviews-next")).to_be_disabled()
                    page.keyboard.press("Home")
                    expect(page.locator("#reviews-prev")).to_be_disabled()
                else:
                    assert track.evaluate("element=>element.scrollWidth <= element.clientWidth+3")
                check_no_overflow(page)
            checks.append(f"{width}px: RTL/LTR review carousel arrows, keyboard navigation, endpoints and no page overflow")

        assert not errors, f"Browser errors: {errors}"
        browser.close()

    for check in checks:
        print(f"PASS: {check}")
    print(f"{len(checks)} bilingual team/review check groups passed; no browser errors.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8014")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()
    run(args.url, args.chromium)
