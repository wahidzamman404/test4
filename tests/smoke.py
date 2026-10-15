"""Bilingual browser checks. Never opens or sends a WhatsApp message.

Run with Playwright and Chromium against a static server:
    python tests/smoke.py --url http://127.0.0.1:8014
"""

import argparse
import json
import re
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright


DESIGNS = [
    ("chiniot-bed", "bedroom", "Chiniot Carved Bed", "چنیوٹی نقش دار بیڈ"),
    ("carved-dining", "dining", "Carved Dining Set", "نقش دار ڈائننگ سیٹ"),
    ("baithak-seating", "living", "Traditional Baithak Seating", "روایتی بیٹھک سیٹ"),
    ("wooden-charpai", "living", "Wooden Charpai", "لکڑی کی چارپائی"),
    ("sheesham-wardrobe", "storage", "Traditional Wooden Wardrobe", "لکڑی کی روایتی الماری"),
    ("entrance-door", "doors", "Carved Entrance Door", "نقش دار داخلی دروازہ"),
    ("office-table", "office", "Wooden Office Table", "لکڑی کی دفتری میز"),
    ("carved-console", "storage", "Carved Console Table", "نقش دار کنسول میز"),
]
ARABIC = re.compile(r"[\u0600-\u06ff]")
DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")


def settle(page):
    page.evaluate("async () => {await document.fonts.ready; await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);}")


def set_language(page, language):
    page.evaluate("language => window.SF_SET_LANGUAGE(language)", language)
    expect(page.locator("html")).to_have_attribute("lang", language)
    expect(page.locator("html")).to_have_attribute("dir", "rtl" if language == "ur" else "ltr")
    settle(page)


def localized(text, language):
    assert bool(ARABIC.search(text)) == (language == "ur"), (language, text)


def static_labels(page, language):
    mismatches = page.evaluate("""language => {
        const failures=[];
        for (const node of document.querySelectorAll('[data-en][data-ur]'))
            if(node.textContent !== node.getAttribute('data-'+language)) failures.push(node.tagName+' '+node.id+' text');
        for (const node of document.querySelectorAll('[data-en-placeholder][data-ur-placeholder]'))
            if(node.getAttribute('placeholder') !== node.getAttribute('data-'+language+'-placeholder')) failures.push(node.id+' placeholder');
        for (const node of document.querySelectorAll('[data-en-label][data-ur-label]'))
            if(node.getAttribute('aria-label') !== node.getAttribute('data-'+language+'-label')) failures.push(node.id+' aria-label');
        return failures;
    }""", language)
    assert not mismatches, mismatches


def run(url, chromium):
    groups = []

    def passed(message):
        groups.append(message)
        print(f"PASS {message}", flush=True)

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=chromium, headless=True, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce", has_touch=True)
        context.route("https://wa.me/**", lambda route: route.abort())
        page = context.new_page()
        errors, failed_requests, popups = [], [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.on("requestfailed", lambda request: failed_requests.append(f"{request.url}: {request.failure}"))
        page.on("popup", lambda popup: popups.append(popup))
        page.goto(url, wait_until="networkidle")
        expect(page.locator("html")).to_have_attribute("lang", "ur")
        expect(page.locator("html")).to_have_attribute("dir", "rtl")
        expect(page.locator("#language-toggle")).to_have_text("English")
        expect(page.locator(".design-card")).to_have_count(8)
        fonts = page.evaluate("""async () => {
            const result=await Promise.all([
                document.fonts.load('400 16px "DM Sans"'),
                document.fonts.load('400 16px Cormorant'),
                document.fonts.load('italic 400 16px Cormorant'),
                document.fonts.load('400 16px Nastaliq', 'آپ کا گھر'),
                document.fonts.load('600 16px Nastaliq', 'آپ کا گھر'),
            ]);
            return result.every(fonts=>fonts.length && fonts.every(font=>font.status==='loaded'));
        }""")
        assert fonts, "Required Latin or Urdu font did not load"
        static_labels(page, "ur")
        page.locator("#language-toggle").click()
        expect(page.locator("html")).to_have_attribute("lang", "en")
        expect(page.locator("#language-toggle")).to_have_text("اردو")
        page.reload(wait_until="networkidle")
        expect(page.locator("html")).to_have_attribute("lang", "en")
        page.locator("#language-toggle").click()
        expect(page.locator("html")).to_have_attribute("lang", "ur")
        passed("Urdu default, working/persistent language toggle and all local fonts")

        detail, quote, saved = page.locator("#design-dialog"), page.locator("#quote-dialog"), page.locator("#saved-dialog")
        for language in ["ur", "en"]:
            set_language(page, language)
            static_labels(page, language)
            for category, count in [("bedroom",1),("dining",1),("living",2),("storage",2),("doors",1),("office",1),("all",8)]:
                button = page.locator(f"button[data-category='{category}']")
                button.click()
                expect(page.locator(".design-card")).to_have_count(count)
                expect(button).to_have_attribute("aria-pressed", "true")
                expect(page.locator("button[data-category][aria-pressed='true']")).to_have_count(1)
                assert int(page.locator("#design-count").inner_text().split()[0].translate(DIGITS)) == count
                localized(page.locator("#design-count").inner_text(), language)
            search = page.locator("#design-search")
            for query, count in [("charpai",1),("الماری",2),("door",1),("missing-design-1647",0)]:
                search.fill(query)
                expect(page.locator(".design-card")).to_have_count(count)
                expect(page.locator("#design-empty")).to_be_visible() if not count else expect(page.locator("#design-empty")).not_to_be_visible()
            search.fill("")
            page.locator("#design-sort").select_option("az")
            names = page.locator(".design-title").all_text_contents()
            expected_names = page.evaluate("""({names,language})=>[...names].sort((a,b)=>a.localeCompare(b,language==='ur'?'ur-PK':'en-PK'))""", {"names":names,"language":language})
            assert names == expected_names
            page.locator("#design-sort").select_option("featured")
            for index, (design_id, category, english, urdu) in enumerate(DESIGNS):
                title = urdu if language == "ur" else english
                opener = page.locator(f".design-photo-button[data-id='{design_id}']")
                opener.click()
                expect(detail).to_be_visible()
                expect(page.locator("#detail-title")).to_have_text(title)
                localized(page.locator("#detail-description").inner_text(), language)
                localized(page.locator("#detail-specs").inner_text(), language)
                expect(page.locator("#detail-specs li")).to_have_count(3)
                page.locator("#detail-image").evaluate("image=>image.decode()")
                assert page.locator("#detail-image").get_attribute("src").endswith(f"design-{index+1}.jpg")
                assert page.locator("#detail-image").evaluate("image=>image.naturalWidth>0")
                page.keyboard.press("Escape")
                expect(opener).to_be_focused()
                title_button = page.locator(f".design-title .product-open[data-id='{design_id}']")
                title_button.click()
                detail.locator("[data-close-dialog]").click()
                expect(title_button).to_be_focused()
                title_button.click()
                page.locator("#detail-inquire").click()
                expect(detail).not_to_be_visible()
                expect(quote).to_be_visible()
                expect(page.locator("#quote-project")).to_have_value(category)
                expect(page.locator("#quote-selection")).to_contain_text(title)
                expect(page.locator("#quote-name")).to_be_focused()
                page.keyboard.press("Escape")
                expect(title_button).to_be_focused()
            passed(f"{language}: all filters, bilingual search/sort and eight localized product/photo/inquiry paths")

        set_language(page, "ur")
        page.locator("button[data-category='living']").click()
        page.locator("#design-search").fill("charpai")
        page.locator("#design-sort").select_option("az")
        page.locator("#language-toggle").click()
        expect(page.locator("#design-search")).to_have_value("charpai")
        expect(page.locator("#design-sort")).to_have_value("az")
        expect(page.locator("button[data-category='living']")).to_have_attribute("aria-pressed", "true")
        expect(page.locator(".design-card")).to_have_count(1)
        expect(page.locator(".design-title")).to_have_text("Wooden Charpai")
        page.locator("#design-search").fill("")
        page.locator("button[data-category='all']").click()
        page.locator("#design-sort").select_option("featured")
        for design_id in ["chiniot-bed", "carved-dining"]:
            button = page.locator(f".save-design[data-id='{design_id}']")
            button.click()
            expect(button).to_have_attribute("aria-pressed", "true")
            expect(button).to_be_focused()
        localized(page.locator("#toast").inner_text(), "en")
        set_language(page, "ur")
        localized(page.locator("#toast").inner_text(), "ur")
        page.reload(wait_until="networkidle")
        expect(page.locator(".save-design[aria-pressed='true']")).to_have_count(2)
        assert json.loads(page.evaluate("localStorage.getItem('sf-test4-shortlist')")) == ["chiniot-bed","carved-dining"]
        opener = page.locator(".saved-open").first
        opener.click()
        expect(page.locator(".saved-item")).to_have_count(2)
        remove = page.locator(".saved-remove").first
        remove.focus()
        set_language(page, "en")
        expect(page.locator(".saved-remove").first).to_be_focused()
        expect(page.locator(".saved-copy h3").first).to_have_text("Chiniot Carved Bed")
        saved.locator(".product-open").first.click()
        expect(detail).to_be_visible()
        set_language(page, "ur")
        expect(page.locator("#detail-title")).to_have_text("چنیوٹی نقش دار بیڈ")
        page.locator("#detail-save").click()
        expect(page.locator("#detail-save")).to_have_attribute("aria-pressed", "false")
        page.locator("#detail-save").click()
        expect(page.locator("#detail-save")).to_have_attribute("aria-pressed", "true")
        page.keyboard.press("Escape")
        expect(opener).to_be_focused()
        opener.click()
        page.locator("#saved-inquire").click()
        expect(page.locator("#quote-selection")).to_contain_text("چنیوٹی نقش دار بیڈ")
        expect(page.locator("#quote-selection")).to_contain_text("نقش دار ڈائننگ سیٹ")
        page.keyboard.press("Escape")
        opener.click()
        page.locator(".saved-remove").first.click()
        expect(page.locator(".saved-item")).to_have_count(1)
        page.locator("#saved-clear").click()
        expect(page.locator(".saved-item")).to_have_count(0)
        expect(page.locator("#saved-inquire")).to_be_disabled()
        expect(page.locator("#saved-clear")).to_be_disabled()
        page.keyboard.press("Escape")
        passed("locale changes retain filters/search/sort, localized toast, saved IDs, detail selection and saved-list focus")

        page.locator(".save-design").first.click()
        page.locator("#studio-design").select_option("doors")
        for wood in ["sheesham","deodar","ash"]:
            page.locator("#studio-wood").select_option(wood)
            localized(page.locator("#studio-summary").inner_text(), "ur")
        for finish in ["natural","walnut","dark"]:
            page.locator("#studio-finish").select_option(finish)
            localized(page.locator("#studio-summary").inner_text(), "ur")
        width = page.locator("#studio-width")
        width.evaluate("input=>{input.value='240';input.dispatchEvent(new Event('input',{bubbles:true}));}")
        width.focus()
        # In RTL, ArrowLeft increases the native range value.
        width.press("ArrowLeft")
        expect(width).to_have_value("250")
        expect(page.locator("#studio-width-output")).to_have_text("۲۵۰ سینٹی میٹر")
        page.locator("#studio-inquire").click()
        expect(page.locator("#quote-project")).to_have_value("doors")
        expect(page.locator("#quote-selection")).to_contain_text("ایش")
        expect(page.locator("#quote-selection")).to_contain_text("۲۵۰")
        selected_brief = page.locator("#quote-selection").inner_text()
        form = page.locator("#quote-form")
        submit = form.locator("[type='submit']")
        for language in ["ur","en"]:
            set_language(page, language)
            form.evaluate("form=>form.reset()")
            submit.click()
            for field_id in ["quote-name","quote-phone","quote-project","quote-message"]:
                message = page.locator(f"#{field_id}").evaluate("field=>field.validationMessage")
                assert message
                localized(message, language)
            page.locator("#quote-name").fill("   ")
            page.locator("#quote-phone").fill("0300 1234567")
            page.locator("#quote-project").select_option("doors")
            page.locator("#quote-message").fill("                    ")
            submit.click()
            assert page.locator("#quote-name").input_value() == ""
            assert page.locator("#quote-message").input_value() == ""
            localized(page.locator("#quote-name").evaluate("field=>field.validationMessage"), language)
            page.locator("#quote-name").fill("Ahmed Ali")
            page.locator("#quote-message").fill("short")
            submit.click()
            short_error = page.locator("#quote-message").evaluate("field=>field.validationMessage")
            localized(short_error, language)
            assert ("کم از کم" if language == "ur" else "at least") in short_error
            page.locator("#quote-message").fill("A carved entrance door for my home, approximately 250 cm wide.")
            page.locator("#quote-phone").fill("not a phone")
            submit.click()
            localized(page.locator("#quote-phone").evaluate("field=>field.validationMessage"), language)
            other = "en" if language == "ur" else "ur"
            set_language(page, other)
            localized(page.locator("#quote-phone").evaluate("field=>field.validationMessage"), other)
            set_language(page, language)
        passed("studio material/finish/range brief and native required, whitespace, minlength and phone errors in both languages")

        set_language(page, "ur")
        name = 'احمد <script>alert("test")</script>'
        message = 'دروازے کی چوڑائی تقریباً ۲۵۰ سینٹی میٹر ہو۔ <img src=x onerror="alert(1)">'
        page.locator("#quote-name").fill(name)
        page.locator("#quote-phone").fill("۰۳۱۳۴۶۸۳۷۸۶")
        expect(page.locator("#quote-phone")).to_have_value("03134683786")
        assert page.locator("#quote-phone").evaluate("field=>getComputedStyle(field).direction") == "ltr"
        page.locator("#quote-city").fill("لاہور")
        page.locator("#quote-project").select_option("doors")
        page.locator("#quote-message").fill(message)
        submit.click()
        expect(page.locator("#quote-preview")).to_be_visible()
        summary = page.locator("#quote-summary")
        expect(summary).to_contain_text(name)
        expect(summary).to_contain_text(message)
        expect(summary.locator("script,img")).to_have_count(0)
        expect(summary).to_contain_text("چنیوٹی نقش دار بیڈ")
        expect(summary).to_contain_text("ایش")
        expect(summary).to_contain_text("۲۵۰")
        values_before = form.evaluate("form=>Object.fromEntries(new FormData(form))")
        for language in ["en","ur"]:
            set_language(page, language)
            assert form.evaluate("form=>Object.fromEntries(new FormData(form))") == values_before
            expect(page.locator("#quote-preview")).to_be_visible()
            localized(page.locator("#quote-status").inner_text(), language)
            expect(summary).to_contain_text("PROJECT INQUIRY" if language == "en" else "کام کی تفصیل")
            expect(summary).to_contain_text("Ash" if language == "en" else "ایش")
            link = page.locator("#quote-wa")
            parsed = urlparse(link.get_attribute("href"))
            assert parsed.scheme == "https" and parsed.netloc == "wa.me" and parsed.path == "/923134683786"
            assert parse_qs(parsed.query)["text"] == [summary.inner_text()]
            expect(link).to_have_attribute("target","_blank")
            assert "noopener" in link.get_attribute("rel")
            expect(summary).to_have_attribute("dir","rtl" if language == "ur" else "ltr")
            static_labels(page, language)
        context.grant_permissions(["clipboard-read","clipboard-write"])
        page.locator("#quote-copy").click()
        assert page.evaluate("navigator.clipboard.readText()") == summary.inner_text()
        localized(page.locator("#quote-status").inner_text(), "ur")
        page.evaluate("Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true})")
        page.locator("#quote-copy").click()
        expect(page.locator("#quote-copy")).to_be_focused()
        expect(page.locator("#quote-status")).to_contain_text("کاپی ہو گئی")
        page.locator("#quote-city").fill("کراچی")
        expect(page.locator("#quote-preview")).not_to_be_visible()
        assert page.locator("#quote-wa").get_attribute("href") is None
        page.keyboard.press("Escape")
        assert not popups
        assert "Ahmed" not in page.evaluate("JSON.stringify(localStorage)")
        assert "احمد" not in page.evaluate("JSON.stringify(localStorage)")
        passed("Urdu phone normalization, safe bilingual reviewed WhatsApp messages, retained form/selection, copy and no automatic navigation")

        team = page.locator(".team-contact[data-team-role]").first
        if team.count():
            team.click()
            expect(page.locator("#quote-name")).to_be_focused()
            page.locator("#quote-message").fill("")
            page.keyboard.press("Escape")
            team.click()
            team_prompt = page.locator("#quote-message").input_value()
            localized(team_prompt,"ur")
            set_language(page,"en")
            localized(page.locator("#quote-message").input_value(),"en")
            page.locator("#quote-message").fill(page.locator("#quote-message").input_value()+"\nCUSTOM NOTE: retain my measurements.")
            set_language(page,"ur")
            assert "CUSTOM NOTE: retain my measurements." in page.locator("#quote-message").input_value()
            page.keyboard.press("Escape")
            expect(page.locator(".team-contact[data-team-role]").first).to_be_focused()
            passed("team inquiry delegation, managed prompt translation and stable staff focus after locale rerender")

        def position():
            return int(page.locator("#gallery-index").inner_text().split('/')[0].strip().translate(DIGITS))

        for language in ["ur","en"]:
            set_language(page,language)
            page.locator("#gallery-dots button").nth(0).click()
            assert position()==1
            page.locator("#gallery-prev").click()
            assert position()==6
            page.locator("#gallery-next").click()
            assert position()==1
            page.locator("#gallery-dots button").nth(2).click()
            assert position()==3
            localized(page.locator("#gallery-title").inner_text(),language)
            localized(page.locator("#gallery-caption").inner_text(),language)
            expect(page.locator("#gallery-dots [aria-pressed='true']")).to_have_count(1)
            stage = page.locator("#gallery-stage")
            stage.focus()
            stage.press("ArrowLeft" if language=="ur" else "ArrowRight")
            assert position()==4
            stage.press("ArrowRight" if language=="ur" else "ArrowLeft")
            assert position()==3
            stage.scroll_into_view_if_needed()
            bounds=stage.bounding_box()
            x=bounds["x"]+bounds["width"]*0.5
            y=bounds["y"]+min(150,bounds["height"]*0.25)
            touch=context.new_cdp_session(page)
            touch.send("Input.dispatchTouchEvent",{"type":"touchStart","touchPoints":[{"x":x,"y":y}]})
            touch.send("Input.dispatchTouchEvent",{"type":"touchMove","touchPoints":[{"x":x+(120 if language=="ur" else -120),"y":y}]})
            touch.send("Input.dispatchTouchEvent",{"type":"touchEnd","touchPoints":[]})
            assert position()==4
            touch.detach()
        passed("six manual gallery slides, localized dots/captions and correctly mirrored RTL/LTR keyboard/touch gestures")

        for image in page.locator("main img").all():
            image.scroll_into_view_if_needed()
            image.evaluate("image=>image.decode()")
        assert not page.locator("img").evaluate_all("images=>images.filter(image=>!image.complete||!image.naturalWidth).map(image=>image.src)")
        passed("all original furniture, gallery, hero and staff images decode")

        for language in ["ur","en"]:
            set_language(page,language)
            page.set_viewport_size({"width":390,"height":900})
            settle(page)
            page.evaluate("scrollTo(0,0)")
            menu,nav=page.locator("#menu-toggle"),page.locator("#site-nav")
            menu.click()
            expect(nav).to_be_visible()
            nav.locator("a[href='#collection']").click()
            expect(nav).not_to_be_visible()
            menu.click()
            page.keyboard.press("Escape")
            expect(menu).to_be_focused()
            expect(nav).not_to_be_visible()
            for width in [320,360,390,414,600,700,768,1024,1440]:
                page.set_viewport_size({"width":width,"height":1000})
                settle(page)
                page.evaluate("scrollTo(0,0)")
                layout=page.evaluate("""() => {
                    const hero=document.querySelector('#hero-title'),brand=document.querySelector('.site-header .brand'),strong=brand.querySelector('strong'),actions=document.querySelector('.header-actions');
                    const b=brand.getBoundingClientRect(),a=actions.getBoundingClientRect();
                    return {width:innerWidth,scroll:document.documentElement.scrollWidth,hero:hero.scrollWidth,heroBox:hero.clientWidth,brand:strong.scrollWidth,brandBox:strong.clientWidth,overlap:b.left<a.right&&b.right>a.left&&b.top<a.bottom&&b.bottom>a.top};
                }""")
                assert layout["scroll"]<=width, (language,width,layout)
                assert layout["hero"]<=layout["heroBox"]+1, (language,width,layout)
                assert layout["brand"]<=layout["brandBox"]+1 and not layout["overlap"], (language,width,layout)
                page.locator(".design-photo-button").first.click()
                settle(page)
                modal=detail.evaluate("element=>({scroll:element.scrollWidth,width:element.clientWidth,left:element.getBoundingClientRect().left,right:element.getBoundingClientRect().right})")
                assert modal["scroll"]<=modal["width"]+1 and modal["left"]>=0 and modal["right"]<=width+1,(language,width,modal)
                page.locator("#detail-inquire").click()
                settle(page)
                modal=quote.evaluate("element=>({scroll:element.scrollWidth,width:element.clientWidth,left:element.getBoundingClientRect().left,right:element.getBoundingClientRect().right,dir:getComputedStyle(element).direction})")
                assert modal["scroll"]<=modal["width"]+1 and modal["left"]>=0 and modal["right"]<=width+1,(language,width,modal)
                assert modal["dir"]==("rtl" if language=="ur" else "ltr")
                submit.scroll_into_view_if_needed()
                expect(submit).to_be_visible()
                assert submit.evaluate("element=>{const b=element.getBoundingClientRect();return element.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}")
                page.keyboard.press("Escape")
            static_labels(page,language)
        passed("both languages: mobile navigation, nine viewport widths, unclipped brand/hero and usable RTL/LTR detail/quote dialogs")

        blocked_context=browser.new_context(viewport={"width":390,"height":900},reduced_motion="reduce")
        blocked_context.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}})")
        blocked=blocked_context.new_page()
        blocked_errors=[]
        blocked.on("pageerror",lambda error:blocked_errors.append(str(error)))
        blocked.goto(url,wait_until="networkidle")
        expect(blocked.locator("html")).to_have_attribute("lang","ur")
        blocked.locator("#language-toggle").click()
        expect(blocked.locator("html")).to_have_attribute("lang","en")
        blocked.locator(".save-design").first.click()
        expect(blocked.locator(".save-design").first).to_have_attribute("aria-pressed","true")
        blocked.locator(".mobile-tabs .saved-open").click()
        expect(blocked.locator(".saved-item")).to_have_count(1)
        assert not blocked_errors,blocked_errors
        blocked_context.close()
        passed("language and favourites work when localStorage is unavailable")

        assert not errors,errors
        assert not failed_requests,failed_requests
        assert not popups,"A popup opened without an explicit sharing-link click"
        passed("zero console/page errors, failed requests or external contact navigation")
        context.close()
        browser.close()
    print(f"\n{len(groups)} bilingual functional groups passed.",flush=True)


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--url",default="http://127.0.0.1:8014")
    parser.add_argument("--chromium",default="/usr/bin/chromium")
    args=parser.parse_args()
    run(args.url,args.chromium)
