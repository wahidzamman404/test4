"""Simultaneous English/Urdu catalogue checks; never contacts WhatsApp.

Requires Playwright and Chromium. Start a static server, then run:
    python tests/smoke.py --url http://127.0.0.1:8014
"""

import argparse
import json
import re
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright


DESIGNS = [
    ('chiniot-bed', 'bedroom', 'Chiniot Carved Bed', 'چنیوٹی نقش دار بیڈ'),
    ('carved-dining', 'dining', 'Carved Dining Set', 'نقش دار ڈائننگ سیٹ'),
    ('baithak-seating', 'living', 'Traditional Baithak Seating', 'روایتی بیٹھک سیٹ'),
    ('wooden-charpai', 'living', 'Wooden Charpai', 'لکڑی کی چارپائی'),
    ('sheesham-wardrobe', 'storage', 'Traditional Wooden Wardrobe', 'لکڑی کی روایتی الماری'),
    ('entrance-door', 'doors', 'Carved Entrance Door', 'نقش دار داخلی دروازہ'),
    ('office-table', 'office', 'Wooden Office Table', 'لکڑی کی دفتری میز'),
    ('carved-console', 'storage', 'Carved Console Table', 'نقش دار کنسول میز'),
]
ARABIC = re.compile(r'[\u0600-\u06ff]')


def settle(page):
    page.evaluate('async()=>{await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);}')


def assert_pair(region):
    english, urdu = region.locator('.bi-en').first, region.locator('.bi-ur').first
    assert english.count() and urdu.count(), region.inner_text()
    assert re.search('[A-Za-z]', english.inner_text()), english.inner_text()
    assert ARABIC.search(urdu.inner_text()), urdu.inner_text()
    expect(english).to_have_attribute('lang', 'en')
    expect(urdu).to_have_attribute('lang', 'ur')
    expect(urdu).to_have_attribute('dir', 'rtl')


def assert_bilingual_text(value):
    assert re.search('[A-Za-z]', value) and ARABIC.search(value), value


def run(url, chromium):
    groups = []

    def passed(message):
        groups.append(message)
        print('PASS ' + message, flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chromium, headless=True, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce', has_touch=True)
        context.route('https://wa.me/**', lambda route: route.abort())
        page = context.new_page()
        errors, failures, popups = [], [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        page.on('requestfailed', lambda request: failures.append(request.url))
        page.on('popup', lambda popup: popups.append(popup))
        page.goto(url, wait_until='networkidle')
        expect(page.locator('html')).to_have_attribute('lang', 'en')
        expect(page.locator('html')).to_have_attribute('dir', 'ltr')
        expect(page.locator('#language-toggle')).to_have_count(0)
        expect(page.locator('.design-card')).to_have_count(8)
        fonts = page.evaluate('''async()=>{
            const declared=[...document.fonts];
            const groups=await Promise.all(declared.map(face=>{
                const family=JSON.stringify(face.family.replace(/^['"]|['"]$/g,''));
                const weight=face.weight.split(' ')[0];
                return document.fonts.load(`${face.style} ${weight} 16px ${family}`,'آپ کا گھر ABC');
            }));
            await document.fonts.ready;
            return declared.length>0&&groups.every(group=>group.length&&group.every(face=>face.status==='loaded'));
        }''')
        assert fonts, 'A Latin or Urdu font did not load'
        for card in page.locator('.design-card').all():
            assert_pair(card.locator('.design-title'))
            assert_pair(card.locator('.design-meta small'))
        passed('simultaneous English/Urdu cards and local fonts; no language toggle')

        for category, count in [('bedroom',1),('dining',1),('living',2),('storage',2),('doors',1),('office',1),('all',8)]:
            button=page.locator(f'button[data-category="{category}"]')
            button.click()
            expect(page.locator('.design-card')).to_have_count(count)
            expect(button).to_have_attribute('aria-pressed','true')
            assert_pair(page.locator('#design-count'))
            expect(page.locator('#design-count .bi-en')).to_have_text(f'{count} {"design" if count==1 else "designs"}')
        search=page.locator('#design-search')
        for query,count in [('charpai',1),('الماری',2),('door',1),('no-match-design-6472',0)]:
            search.fill(query)
            expect(page.locator('.design-card')).to_have_count(count)
            assert page.locator('#design-empty').is_visible()==(count==0)
        search.fill('')
        page.locator('#design-sort').select_option('az')
        names=page.locator('.design-title .bi-en').all_text_contents()
        assert names==sorted(names,key=str.casefold)
        page.locator('#design-sort').select_option('featured')
        for category,count in [('living',2),('bedroom',1),('dining',1)]:
            link=page.locator(f'[data-shop-category="{category}"]').first
            assert link.count(), f'Missing editorial link for {category}'
            search.fill('no-match-design-6472')
            link.click()
            expect(search).to_have_value('')
            expect(page.locator(f'button[data-category="{category}"]')).to_have_attribute('aria-pressed','true')
            expect(page.locator('.design-card')).to_have_count(count)
        page.locator('button[data-category="all"]').click()
        passed('room filters, English/Urdu search, sorting and editorial category links')

        detail,quote,saved=page.locator('#design-dialog'),page.locator('#quote-dialog'),page.locator('#saved-dialog')
        for index,(design_id,category,english,urdu) in enumerate(DESIGNS):
            opener=page.locator(f'.design-photo-button[data-id="{design_id}"]')
            opener.click()
            expect(detail).to_be_visible()
            expect(page.locator('#detail-title .bi-en')).to_have_text(english)
            expect(page.locator('#detail-title .bi-ur')).to_have_text(urdu)
            assert_pair(page.locator('#detail-description'))
            expect(page.locator('#detail-specs li')).to_have_count(3)
            for item in page.locator('#detail-specs li').all():
                assert_pair(item)
            page.locator('#detail-image').evaluate('image=>image.decode()')
            assert page.locator('#detail-image').get_attribute('src').split('?', 1)[0].endswith(f'design-{index+1}.jpg')
            page.keyboard.press('Escape')
            expect(opener).to_be_focused()
            title=page.locator(f'.design-title .product-open[data-id="{design_id}"]')
            title.click()
            detail.locator('[data-close-dialog]').click()
            expect(title).to_be_focused()
            title.click()
            page.locator('#detail-inquire').click()
            expect(detail).not_to_be_visible()
            expect(quote).to_be_visible()
            expect(page.locator('#quote-project')).to_have_value(category)
            expect(page.locator('#quote-selection .bi-en')).to_contain_text(english)
            expect(page.locator('#quote-selection .bi-ur')).to_contain_text(urdu)
            expect(page.locator('#quote-name')).to_be_focused()
            page.keyboard.press('Escape')
            expect(title).to_be_focused()
        passed('eight photo/title/detail/inquiry paths with both languages and focus return')

        page.locator('.design-photo-button').first.click()
        page.locator('#detail-save').click()
        expect(page.locator('#detail-save')).to_have_attribute('aria-pressed','true')
        assert_pair(page.locator('#detail-save'))
        page.locator('#detail-save').click()
        page.keyboard.press('Escape')
        for design_id in ['chiniot-bed','carved-dining']:
            button=page.locator(f'.save-design[data-id="{design_id}"]')
            button.click()
            expect(button).to_be_focused()
            expect(button).to_have_attribute('aria-pressed','true')
        assert_pair(page.locator('#toast'))
        page.reload(wait_until='networkidle')
        expect(page.locator('.save-design[aria-pressed="true"]')).to_have_count(2)
        assert json.loads(page.evaluate('localStorage.getItem("sf-test4-shortlist")'))==['chiniot-bed','carved-dining']
        saved_opener=page.locator('.saved-open').first
        saved_opener.click()
        expect(page.locator('.saved-item')).to_have_count(2)
        assert_pair(page.locator('.saved-copy h3').first)
        page.locator('.saved-item .product-open').first.click()
        expect(detail).to_be_visible()
        page.keyboard.press('Escape')
        expect(saved_opener).to_be_focused()
        saved_opener.click()
        page.locator('#saved-inquire').click()
        assert_pair(page.locator('#quote-selection'))
        expect(page.locator('#quote-selection .bi-en')).to_contain_text('Chiniot Carved Bed')
        page.keyboard.press('Escape')
        saved_opener.click()
        page.locator('.saved-remove').first.click()
        expect(page.locator('.saved-item')).to_have_count(1)
        page.locator('#saved-clear').click()
        expect(page.locator('.saved-item')).to_have_count(0)
        expect(page.locator('#saved-inquire')).to_be_disabled()
        page.keyboard.press('Escape')
        passed('modal/card saving, ID-only persistence, shortlist transitions, removal and clear')

        page.locator('.save-design').first.click()
        page.locator('#studio-design').select_option('doors')
        for wood in ['sheesham','deodar','ash']:
            page.locator('#studio-wood').select_option(wood)
            assert_pair(page.locator('#studio-summary'))
        for finish in ['natural','walnut','dark']:
            page.locator('#studio-finish').select_option(finish)
            assert_pair(page.locator('#studio-summary'))
        width=page.locator('#studio-width')
        width.evaluate('input=>{input.value="240";input.dispatchEvent(new Event("input",{bubbles:true}));}')
        width.focus()
        width.press('ArrowRight')
        expect(width).to_have_value('250')
        expect(page.locator('#studio-width-output .bi-en')).to_have_text('250 cm')
        expect(page.locator('#studio-width-output .bi-ur')).to_have_text('۲۵۰ سینٹی میٹر')
        page.locator('#studio-inquire').click()
        expect(page.locator('#quote-project')).to_have_value('doors')
        expect(page.locator('#quote-selection .bi-en')).to_contain_text('Ash')
        expect(page.locator('#quote-selection .bi-ur')).to_contain_text('ایش')
        form=page.locator('#quote-form')
        submit=form.locator('[type=submit]')
        form.evaluate('form=>form.reset()')
        submit.click()
        for field_id in ['quote-name','quote-phone','quote-project','quote-message']:
            assert_bilingual_text(page.locator('#'+field_id).evaluate('field=>field.validationMessage'))
        page.locator('#quote-name').fill('   ')
        page.locator('#quote-phone').fill('0300 1234567')
        page.locator('#quote-project').select_option('doors')
        page.locator('#quote-message').fill('                    ')
        submit.click()
        assert page.locator('#quote-name').input_value()=='' and page.locator('#quote-message').input_value()==''
        page.locator('#quote-name').fill('Ahmed Ali')
        page.locator('#quote-message').fill('short')
        submit.click()
        error=page.locator('#quote-message').evaluate('field=>field.validationMessage')
        assert 'at least' in error and 'کم از کم' in error
        page.locator('#quote-message').fill('A carved entrance door with the requested finish and dimensions.')
        page.locator('#quote-phone').fill('not a phone')
        submit.click()
        assert_bilingual_text(page.locator('#quote-phone').evaluate('field=>field.validationMessage'))
        passed('bilingual studio choices/range and bilingual native required, whitespace, length and phone validation')

        name='Ahmed <script>alert("test")</script>'
        message='A 250 cm wooden entrance door. <img src=x onerror="alert(1)">'
        page.locator('#quote-name').fill(name)
        page.locator('#quote-phone').fill('۰۳۱۳۴۶۸۳۷۸۶')
        expect(page.locator('#quote-phone')).to_have_value('03134683786')
        assert page.locator('#quote-phone').evaluate('field=>getComputedStyle(field).direction')=='ltr'
        page.locator('#quote-city').fill('Lahore / لاہور')
        page.locator('#quote-message').fill(message)
        submit.click()
        expect(page.locator('#quote-preview')).to_be_visible()
        summary=page.locator('#quote-summary')
        assert_bilingual_text(summary.inner_text())
        expect(summary).to_contain_text(name)
        expect(summary).to_contain_text(message)
        expect(summary.locator('img,script')).to_have_count(0)
        for expected in ['PROJECT INQUIRY','کام کی تفصیل','Chiniot Carved Bed','چنیوٹی نقش دار بیڈ','Ash','ایش','250','۲۵۰']:
            expect(summary).to_contain_text(expected)
        assert_pair(page.locator('#quote-status'))
        link=page.locator('#quote-wa')
        parsed=urlparse(link.get_attribute('href'))
        assert parsed.scheme=='https' and parsed.netloc=='wa.me' and parsed.path=='/923134683786'
        assert parse_qs(parsed.query)['text']==[summary.inner_text()]
        expect(link).to_have_attribute('target','_blank')
        assert 'noopener' in link.get_attribute('rel')
        context.grant_permissions(['clipboard-read','clipboard-write'])
        page.locator('#quote-copy').click()
        assert page.evaluate('navigator.clipboard.readText()')==summary.inner_text()
        assert_pair(page.locator('#quote-status'))
        page.evaluate('Object.defineProperty(navigator,"clipboard",{value:undefined,configurable:true})')
        page.locator('#quote-copy').click()
        expect(page.locator('#quote-copy')).to_be_focused()
        expect(page.locator('#quote-status .bi-en')).to_contain_text('copied')
        page.locator('#quote-city').fill('Karachi / کراچی')
        expect(page.locator('#quote-preview')).not_to_be_visible()
        assert link.get_attribute('href') is None
        page.keyboard.press('Escape')
        assert not popups
        assert name not in page.evaluate('JSON.stringify(localStorage)')
        for direct in page.locator('[data-wa]').all():
            url_parts=urlparse(direct.get_attribute('href'))
            assert url_parts.netloc=='wa.me' and url_parts.path=='/923134683786'
            assert_bilingual_text(parse_qs(url_parts.query)['text'][0])
        passed('safe bilingual WhatsApp preview/encoding, Urdu digits, clipboard/fallback and stale-link protection')

        team=page.locator('.team-contact[data-team-role]').first
        assert team.count()
        team.click()
        expect(page.locator('#quote-name')).to_be_focused()
        assert_bilingual_text(page.locator('#quote-message').input_value())
        name_before=page.locator('#quote-name').input_value()
        message_before=page.locator('#quote-message').input_value()
        page.keyboard.press('Escape')
        expect(team).to_be_focused()
        team.click()
        expect(page.locator('#quote-name')).to_have_value(name_before)
        expect(page.locator('#quote-message')).to_have_value(message_before)
        page.keyboard.press('Escape')
        passed('delegated bilingual team inquiry, retained input and staff focus restoration')

        def position():
            return int(page.locator('#gallery-index .bi-en').inner_text().split('/')[0])

        page.locator('#gallery-dots button').first.click()
        assert position()==1
        page.locator('#gallery-prev').click()
        assert position()==6
        page.locator('#gallery-next').click()
        assert position()==1
        page.locator('#gallery-dots button').nth(2).click()
        assert position()==3
        assert_pair(page.locator('#gallery-title'))
        assert_pair(page.locator('#gallery-caption'))
        stage=page.locator('#gallery-stage')
        stage.focus()
        stage.press('ArrowRight')
        assert position()==4
        stage.press('ArrowLeft')
        assert position()==3
        search.focus()
        search.press('ArrowRight')
        assert position()==3
        stage.scroll_into_view_if_needed()
        bounds=stage.bounding_box()
        x=bounds['x']+bounds['width']*.5
        y=bounds['y']+min(150,bounds['height']*.25)
        touch=context.new_cdp_session(page)
        touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y}]})
        touch.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x-120,'y':y}]})
        touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
        assert position()==4
        touch.detach()
        passed('six bilingual gallery slides, wrapping, dots, focused keyboard control and touch swipe')

        for image in page.locator('main img').all():
            image.scroll_into_view_if_needed()
            image.evaluate('image=>image.decode()')
        assert not page.locator('img').evaluate_all('images=>images.filter(image=>!image.complete||!image.naturalWidth).map(image=>image.src)')
        passed('all furniture, hero, gallery and staff photos decode')

        for width in [320,360,390,414,600,700,768,1024,1440]:
            page.set_viewport_size({'width':width,'height':1000})
            settle(page)
            page.evaluate('scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
            hero=page.locator('#hero-title')
            assert hero.evaluate('element=>element.scrollWidth<=element.clientWidth+1'),width
            page.locator('.design-photo-button').first.click()
            settle(page)
            box=detail.evaluate('element=>({scroll:element.scrollWidth,width:element.clientWidth,left:element.getBoundingClientRect().left,right:element.getBoundingClientRect().right})')
            assert box['scroll']<=box['width']+1 and box['left']>=0 and box['right']<=width+1,(width,box)
            page.locator('#detail-inquire').click()
            settle(page)
            box=quote.evaluate('element=>({scroll:element.scrollWidth,width:element.clientWidth,left:element.getBoundingClientRect().left,right:element.getBoundingClientRect().right})')
            assert box['scroll']<=box['width']+1 and box['left']>=0 and box['right']<=width+1,(width,box)
            submit.scroll_into_view_if_needed()
            assert submit.evaluate('element=>{const b=element.getBoundingClientRect();return element.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}'),width
            page.keyboard.press('Escape')
        page.set_viewport_size({'width':390,'height':900})
        settle(page)
        page.evaluate('scrollTo(0,0)')
        menu,nav=page.locator('#menu-toggle'),page.locator('#site-nav')
        menu.click()
        expect(nav).to_be_visible()
        nav.locator('a[href="#collection"]').first.click()
        expect(nav).not_to_be_visible()
        menu.click()
        page.keyboard.press('Escape')
        expect(menu).to_be_focused()
        expect(nav).not_to_be_visible()
        creator=page.locator('.creator-float')
        expect(creator).to_be_visible()
        expect(creator).to_have_attribute('href','https://wzdev.pk')
        assert creator.evaluate('element=>getComputedStyle(element).position')=='fixed'
        creator_box=creator.bounding_box()
        assert creator_box['x']<30
        wa_boxes=page.locator('a[data-wa]').evaluate_all('elements=>elements.filter(element=>getComputedStyle(element).position==="fixed"&&element.getClientRects().length).map(element=>{const b=element.getBoundingClientRect();return {left:b.left,right:b.right};})')
        assert wa_boxes and all(creator_box['x']+creator_box['width']<box['left'] for box in wa_boxes),wa_boxes
        for anchor in [creator]:
            assert anchor.evaluate('element=>{const b=element.getBoundingClientRect();return element.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}')
        passed('nine mobile/desktop widths, usable dialogs/nav and separate clickable WZDEV/WhatsApp floating links')

        blocked_context=browser.new_context(viewport={'width':390,'height':900},reduced_motion='reduce')
        blocked_context.add_init_script('Object.defineProperty(window,"localStorage",{get(){throw new DOMException("Storage blocked","SecurityError");}})')
        blocked=blocked_context.new_page()
        blocked_errors=[]
        blocked.on('pageerror',lambda error:blocked_errors.append(str(error)))
        blocked.goto(url,wait_until='networkidle')
        expect(blocked.locator('.design-card')).to_have_count(8)
        blocked.locator('.save-design').first.click()
        expect(blocked.locator('.save-design').first).to_have_attribute('aria-pressed','true')
        assert_pair(blocked.locator('#toast'))
        assert not blocked_errors,blocked_errors
        blocked_context.close()
        passed('saved designs remain usable when browser storage is blocked')

        assert not errors,errors
        assert not failures,failures
        assert not popups,'External window opened without sharing-link click'
        passed('zero console/page errors, failed requests or external contact navigation')
        context.close()
        browser.close()
    print(f'\n{len(groups)} simultaneous-bilingual functional groups passed.',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--url',default='http://127.0.0.1:8014')
    parser.add_argument('--chromium',default='/usr/bin/chromium')
    args=parser.parse_args()
    run(args.url,args.chromium)
