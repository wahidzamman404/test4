"""Browser checks for simultaneously bilingual staff and session reviews.

Only local demo reviews are submitted. No external message is sent.
"""

import argparse
import re

from playwright.sync_api import expect, sync_playwright


def settle(page):
    page.evaluate("() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))")


def no_overflow(page):
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1"), page.evaluate(
        "({viewport:innerWidth,document:document.documentElement.scrollWidth})"
    )


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
        expect(page.locator("html")).to_have_attribute("lang", "en")
        expect(page.locator("html")).to_have_attribute("dir", "ltr")

        expect(page.locator("#team-grid .team-card")).to_have_count(3)
        expect(page.locator("#team-grid .team-title .bi-en")).to_have_text(
            ["Furniture design adviser", "Workshop specialist", "Project coordinator"]
        )
        expect(page.locator("#team-grid .team-title .bi-ur")).to_have_text(
            ["فرنیچر ڈیزائن مشیر", "لکڑی اور کاریگری کے ماہر", "آپ کے کام کی رہنمائی"]
        )
        for index, role in enumerate(("designer", "maker", "coordinator")):
            card = page.locator("#team-grid .team-card").nth(index)
            expect(card.locator(".demo-tag .bi-en")).to_have_text("Demo profile")
            expect(card.locator(".demo-tag .bi-ur")).to_have_text("نمونہ پروفائل")
            for selector in (".team-title", ".team-description", ".team-role", ".team-contact-label"):
                expect(card.locator(f"{selector} .bi-en")).to_be_visible()
                expect(card.locator(f"{selector} .bi-ur")).to_be_visible()
                expect(card.locator(f"{selector} .bi-ur")).to_have_attribute("lang", "ur")
                expect(card.locator(f"{selector} .bi-ur")).to_have_attribute("dir", "rtl")
            image = card.locator("img")
            image.scroll_into_view_if_needed()
            page.wait_for_function(
                "selector => { const image = document.querySelector(selector); return image.complete && image.naturalWidth > 0; }",
                arg=f"#team-grid .team-card:nth-child({index + 1}) img",
            )
            button = card.locator(".team-contact")
            prompt = button.get_attribute("data-quote-message").strip()
            assert "\n" in prompt and re.search(r"[\u0600-\u06ff]", prompt)
            button.click()
            expect(page.locator("#quote-dialog")).to_be_visible()
            expect(page.locator("#quote-name")).to_be_focused()
            expect(page.locator("#quote-message")).to_have_value(prompt)
            page.keyboard.press("Escape")
            expect(page.locator("#quote-dialog")).not_to_be_visible()
            expect(button).to_be_focused()
            button.click()
            expect(page.locator("#quote-message")).to_have_value(prompt)
            page.locator("#quote-message").fill("")
            page.locator('#quote-dialog [data-close-dialog]').click()
            expect(button).to_be_focused()
        checks.append("Three loaded staff profiles show both languages and demo labels together; bilingual inquiries, deduplication, Escape and focus return")

        expect(page.locator("#reviews-track .review-card")).to_have_count(3)
        expect(page.locator("#reviews-track .review-text .bi-en")).to_have_count(3)
        expect(page.locator("#reviews-track .review-text .bi-ur")).to_have_count(3)
        expect(page.locator("#reviews-track .review-card > .demo-tag .bi-en")).to_have_text(["Sample review"] * 3)
        expect(page.locator("#reviews-track .review-card > .demo-tag .bi-ur")).to_have_text(["نمونہ تبصرہ"] * 3)
        expect(page.locator("#reviews-track .review-city .bi-en")).to_have_text(["Lahore", "Islamabad", "Karachi"])
        expect(page.locator("#reviews-track .review-city .bi-ur")).to_have_text(["لاہور", "اسلام آباد", "کراچی"])
        expect(page.locator("#reviews-track .review-stars svg")).to_have_count(15)
        expect(page.locator("#reviews-track .review-stars").nth(1)).to_have_attribute("aria-label", re.compile("4 out of 5 stars.*۵ میں سے 4"))
        expect(page.locator("#reviews-track .review-stars").nth(1).locator("svg").last).to_have_css("fill", "none")
        checks.append("Initial sample reviews, cities and labels appear in Urdu and English together with accessible SVG ratings")

        page.locator("#review-open").click()
        expect(page.locator("#review-dialog")).to_be_visible()
        expect(page.locator("#review-name")).to_be_focused()
        expect(page.locator("html")).to_have_class(re.compile(r"\bdialog-open\b"))
        page.locator('#review-form [type="submit"]').click()
        message = page.locator("#review-name").evaluate("field => field.validationMessage")
        assert "name" in message and "نام" in message
        expect(page.locator("#reviews-track .review-card")).to_have_count(3)
        page.locator("#review-name").fill("Test Reviewer")
        for invalid in ("short", " " * 30):
            page.locator("#review-message").fill(invalid)
            page.locator('#review-form [type="submit"]').click()
            expect(page.locator("#review-dialog")).to_be_visible()
            expect(page.locator("#review-message")).to_be_focused()
            message = page.locator("#review-message").evaluate("field => field.validationMessage")
            assert "20" in message and "۲۰" in message
            expect(page.locator("#reviews-track .review-card")).to_have_count(3)
        page.keyboard.press("Escape")
        expect(page.locator("#review-dialog")).not_to_be_visible()
        expect(page.locator("#review-open")).to_be_focused()
        expect(page.locator("html")).not_to_have_class(re.compile(r"\bdialog-open\b"))
        checks.append("Required, short and whitespace reviews rejected with bilingual errors; modal focus, Escape and scroll lock work")

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
        first = page.locator("#reviews-track .review-card").first
        expect(first.locator(".review-name")).to_have_text(malicious_name)
        expect(first.locator(".review-text")).to_have_text(malicious_review)
        expect(first.locator(".review-city")).to_have_text("<b>لاہور</b>")
        expect(first.locator(".demo-tag .bi-en")).to_have_text("On this device")
        expect(first.locator(".demo-tag .bi-ur")).to_have_text("اسی ڈیوائس پر")
        expect(first.locator("img, script, b")).to_have_count(0)
        assert page.evaluate("window.reviewPwned === undefined")
        expect(page.locator("#reviews-status .bi-en")).to_contain_text("not been posted publicly")
        expect(page.locator("#reviews-status .bi-ur")).to_contain_text("عوامی")
        expect(page.locator("#reviews-status")).to_have_attribute("role", "status")
        page.wait_for_function("document.querySelector('#reviews-track').scrollLeft < 2")
        checks.append("Submitted HTML is safe literal text, review appears first, and bilingual labels/status make session-only behavior clear")

        page.locator("#review-open").click()
        page.locator("#review-name").fill("Hira")
        page.locator("#review-city").fill("Lahore")
        page.locator("#review-message").fill("I like the carved bed designs and would discuss the dimensions for our room.")
        page.locator('#review-form [type="submit"]').click()
        expect(page.locator("#reviews-track .review-card")).to_have_count(5)
        expect(page.locator("#reviews-track .review-card").first.locator(".review-text .bi-en")).to_be_visible()
        expect(page.locator("#reviews-track .review-card").nth(1).locator(".review-text .bi-ur")).to_be_visible()
        checks.append("English and Urdu user-written reviews retain the submitted language while interface labels remain bilingual")

        page.reload(wait_until="networkidle")
        expect(page.locator("#reviews-track .review-card")).to_have_count(3)
        assert not page.evaluate("[...Object.values(localStorage),...Object.values(sessionStorage)].some(value=>value.includes('reviewPwned')||value.includes('Hira'))")
        checks.append("Reload clears demo submissions; personal review content is not saved in localStorage or sessionStorage")

        for width in (360, 390, 768, 1440):
            page.set_viewport_size({"width": width, "height": 900})
            track = page.locator("#reviews-track")
            track.evaluate("element=>element.scrollTo({left:0,behavior:'instant'})")
            track.scroll_into_view_if_needed()
            settle(page)
            expect(page.locator("#reviews-prev")).to_be_disabled()
            no_overflow(page)
            if page.locator("#reviews-next").is_enabled():
                page.locator("#reviews-next").click()
                settle(page)
                expect(page.locator("#reviews-prev")).to_be_enabled()
                for _ in range(4):
                    if page.locator("#reviews-next").is_disabled():
                        break
                    page.locator("#reviews-next").click()
                    settle(page)
                expect(page.locator("#reviews-next")).to_be_disabled()
                track.focus()
                page.keyboard.press("Home")
                expect(page.locator("#reviews-prev")).to_be_disabled()
                page.keyboard.press("ArrowRight")
                expect(page.locator("#reviews-prev")).to_be_enabled()
                page.keyboard.press("End")
                expect(page.locator("#reviews-next")).to_be_disabled()
                page.keyboard.press("Home")
                expect(page.locator("#reviews-prev")).to_be_disabled()
            else:
                assert track.evaluate("element=>element.scrollWidth <= element.clientWidth+3")
            no_overflow(page)
            for card in page.locator("#team-grid .team-card").all():
                assert card.evaluate("element=>element.scrollWidth <= element.clientWidth+1")
            checks.append(f"{width}px: carousel arrows/keyboard/endpoints; both-language team/review layout stays within the page")

        assert not errors, f"Browser errors: {errors}"
        browser.close()

    for check in checks:
        print(f"PASS: {check}")
    print(f"{len(checks)} simultaneous-bilingual team/review check groups passed; no browser errors.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8014")
    parser.add_argument("--chromium", default="/usr/bin/chromium")
    args = parser.parse_args()
    run(args.url, args.chromium)
