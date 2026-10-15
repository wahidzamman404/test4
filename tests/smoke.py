"""Simultaneous English/Urdu catalogue checks; never contacts WhatsApp.

Requires Playwright and Chromium. Start a static server, then run:
    python tests/smoke.py --url http://127.0.0.1:8014
"""

import argparse
import json
import re
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
CATALOGUE_SOURCE = (ROOT / 'catalogue.js').read_text()
DESIGNS = json.loads(CATALOGUE_SOURCE.split('=', 1)[1].strip().rstrip(';'))
EXPECTED_IDS = [
    'black-quilted-bed', 'marble-finish-wardrobe', 'grey-bedroom-set',
    'illuminated-wardrobe', 'grey-gold-carved-bed', 'cream-sectional',
    'burgundy-gold-sofa', 'grey-upholstered-chair', 'glass-front-cabinet',
    'classic-carved-bed', 'double-entrance-door', 'solene-cane-sofa',
    'island-kitchen', 'upholstered-bedroom-suite', 'geometric-mesh-door',
    'mustard-sectional', 'black-gold-carved-bed', 'floral-panel-bed',
    'gloss-kitchen-installation', 'tall-fitted-cupboard', 'highback-rocking-chair',
    'gold-accent-chairs', 'fitted-storage-installation', 'carved-dressing-table',
    'teal-sectional', 'woodgrain-kitchen-installation', 'timber-frame-armchair',
    'wooden-screen-door', 'jali-panel-door', 'fluted-media-wall',
    'fitted-display-wall', 'carved-wood-panels', 'taupe-fitted-kitchen',
    'dream-big-bedroom',
]
CATEGORY_COUNTS = {'bedroom': 9, 'living': 9, 'storage': 7, 'doors': 4, 'kitchen': 4, 'custom': 1}
EXPECTED_PHOTOS = {f'assets/real/photo-{n:02}.jpg' for n in range(1, 43) if n not in [13, 29]}
assert len(DESIGNS) == 34 and [design['id'] for design in DESIGNS] == EXPECTED_IDS
assert {image for design in DESIGNS for image in design['images']} == EXPECTED_PHOTOS
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
        expect(page.locator('.design-card')).to_have_count(12)
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
        assert page.evaluate('SF_CATALOGUE.length') == 34
        assert page.evaluate('SF_CATALOGUE.map(product=>product.id)') == EXPECTED_IDS
        expect(page.locator('#catalogue-shown .bi-en')).to_have_text('Showing 12 of 34 designs')
        expect(page.locator('#catalogue-more')).to_be_visible()
        assert page.locator('.team-symbol').count() == 3
        expect(page.locator('#team img')).to_have_count(0)
        passed('34 supplied-photo designs, simultaneous bilingual labels/fonts and icon-based team roles')

        def expand_all():
            while page.locator('#catalogue-more').is_visible():
                previous=page.locator('.design-card').count()
                page.locator('#catalogue-more').click()
                expect(page.locator('.design-photo-button').nth(previous)).to_be_focused()

        page.locator('#catalogue-more').click()
        expect(page.locator('.design-card')).to_have_count(24)
        expect(page.locator('.design-photo-button').nth(12)).to_be_focused()
        expect(page.locator('#catalogue-shown .bi-en')).to_have_text('Showing 24 of 34 designs')
        page.locator('#catalogue-more').click()
        expect(page.locator('.design-card')).to_have_count(34)
        expect(page.locator('.design-photo-button').nth(24)).to_be_focused()
        expect(page.locator('#catalogue-more')).not_to_be_visible()
        for category, count in [*CATEGORY_COUNTS.items(), ('all',34)]:
            button=page.locator(f'button[data-category="{category}"]')
            button.click()
            expect(page.locator('.design-card')).to_have_count(min(count,12))
            expect(button).to_have_attribute('aria-pressed','true')
            assert_pair(page.locator('#design-count'))
            expect(page.locator('#design-count .bi-en')).to_have_text(f'{count} {"design" if count==1 else "designs"}')
            expect(page.locator('#catalogue-shown .bi-en')).to_have_text(f'Showing {min(count,12)} of {count} designs')
        search=page.locator('#design-search')
        for query,count in [('Teal Sofa & Ottoman',1),('کوئلٹڈ',1),('rocking',1),('no-match-design-6472',0)]:
            search.fill(query)
            expect(page.locator('.design-card')).to_have_count(count)
            assert page.locator('#design-empty').is_visible()==(count==0)
            expect(page.locator('#catalogue-more')).not_to_be_visible()
        search.fill('')
        page.locator('#design-sort').select_option('az')
        expect(page.locator('.design-card')).to_have_count(12)
        expand_all()
        names=page.locator('.design-title .bi-en').all_text_contents()
        assert names==sorted(names,key=str.casefold)
        page.locator('#design-sort').select_option('featured')
        expect(page.locator('.design-card')).to_have_count(12)
        for category in ['bedroom','doors','kitchen']:
            link=page.locator(f'[data-shop-category="{category}"]').first
            assert link.count(), f'Missing editorial link for {category}'
            search.fill('no-match-design-6472')
            link.click()
            expect(search).to_have_value('')
            expect(page.locator(f'button[data-category="{category}"]')).to_have_attribute('aria-pressed','true')
            expect(page.locator('.design-card')).to_have_count(CATEGORY_COUNTS[category])
        page.locator('button[data-category="all"]').click()
        expand_all()
        assert page.locator('.design-photo-button').evaluate_all('buttons=>buttons.map(button=>button.dataset.id)')==EXPECTED_IDS
        passed('12/24/34 pagination with focus/reset, six filters, English/Urdu search, sorting and room links')

        detail,quote,saved=page.locator('#design-dialog'),page.locator('#quote-dialog'),page.locator('#saved-dialog')
        decoded_photos, decoded_thumbs=set(), set()
        for design in DESIGNS:
            design_id,category=design['id'],design['category']
            english,urdu=design['title']['en'],design['title']['ur']
            opener=page.locator(f'.design-photo-button[data-id="{design_id}"]')
            expected_thumb=design['defaultImage'].replace('assets/real/','assets/real/thumbs/')
            assert opener.locator('img').get_attribute('src').split('?',1)[0]==expected_thumb
            opener.click()
            expect(detail).to_be_visible()
            expect(page.locator('#detail-title .bi-en')).to_have_text(english)
            expect(page.locator('#detail-title .bi-ur')).to_have_text(urdu)
            assert_pair(page.locator('#detail-description'))
            expect(page.locator('#detail-description .bi-en')).to_have_text(design['description']['en'])
            expect(page.locator('#detail-description .bi-ur')).to_have_text(design['description']['ur'])
            expect(page.locator('#detail-specs li')).to_have_count(3)
            for item in page.locator('#detail-specs li').all():
                assert_pair(item)
            thumbnails=page.locator('#detail-thumbnails button')
            expect(thumbnails).to_have_count(len(design['images']))
            assert page.locator('#detail-thumbnails').is_visible()==(len(design['images'])>1)
            for photo_index,photo in enumerate(design['images']):
                if len(design['images'])>1:
                    thumbnails.nth(photo_index).click()
                image=page.locator('#detail-image')
                image.evaluate('image=>image.decode()')
                assert image.get_attribute('src').split('?',1)[0]==photo
                assert 'Generated' not in image.get_attribute('alt') and 'تصوراتی' not in image.get_attribute('alt')
                assert page.locator('#detail-fullsize').get_attribute('href').split('?',1)[0]==photo
                expect(page.locator('#detail-photo-count .bi-en')).to_have_text(f'{photo_index+1} / {len(design["images"])} photos')
                expect(thumbnails.nth(photo_index)).to_have_attribute('aria-pressed','true')
                thumb=thumbnails.nth(photo_index).locator('img')
                expected_thumb=photo.replace('assets/real/','assets/real/thumbs/')
                assert thumb.get_attribute('src').split('?',1)[0]==expected_thumb
                thumb.evaluate('async image=>{image.loading="eager";await image.decode();}')
                decoded_thumbs.add(expected_thumb)
                decoded_photos.add(photo)
            if len(design['images'])>1:
                thumbnails.last.focus()
                thumbnails.last.press('Home')
                expect(thumbnails.first).to_be_focused()
                expect(thumbnails.first).to_have_attribute('aria-pressed','true')
                thumbnails.first.press('ArrowLeft')
                expect(thumbnails.last).to_be_focused()
                thumbnails.last.press('ArrowRight')
                expect(thumbnails.first).to_be_focused()
                thumbnails.first.press('End')
                expect(thumbnails.last).to_be_focused()
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
        assert decoded_photos==EXPECTED_PHOTOS
        assert decoded_thumbs=={photo.replace('assets/real/','assets/real/thumbs/') for photo in EXPECTED_PHOTOS}
        passed('all 34 bilingual detail/inquiry paths, all 40 supplied master photos/40 optimized thumbnails, thumbnail controls/fullsize links and focus return')

        page.locator('.design-photo-button').first.click()
        page.locator('#detail-save').click()
        expect(page.locator('#detail-save')).to_have_attribute('aria-pressed','true')
        assert_pair(page.locator('#detail-save'))
        page.locator('#detail-save').click()
        page.keyboard.press('Escape')
        for design_id in ['black-quilted-bed','marble-finish-wardrobe']:
            button=page.locator(f'.save-design[data-id="{design_id}"]')
            button.click()
            expect(button).to_be_focused()
            expect(button).to_have_attribute('aria-pressed','true')
        assert_pair(page.locator('#toast'))
        page.reload(wait_until='networkidle')
        expect(page.locator('.save-design[aria-pressed="true"]')).to_have_count(2)
        assert json.loads(page.evaluate('localStorage.getItem("sf-test4-shortlist")'))==['black-quilted-bed','marble-finish-wardrobe']
        saved_opener=page.locator('.saved-open').first
        saved_opener.click()
        expect(page.locator('.saved-item')).to_have_count(2)
        assert_pair(page.locator('.saved-copy h3').first)
        for image in page.locator('.saved-item img').all():
            assert '/assets/real/thumbs/' in image.evaluate('image=>image.src')
            image.evaluate('image=>image.decode()')
        page.locator('.saved-item .product-open').first.click()
        expect(detail).to_be_visible()
        page.keyboard.press('Escape')
        expect(saved_opener).to_be_focused()
        saved_opener.click()
        page.locator('#saved-inquire').click()
        assert_pair(page.locator('#quote-selection'))
        expect(page.locator('#quote-selection .bi-en')).to_contain_text('Black Quilted Bed')
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
        for expected in ['PROJECT INQUIRY','کام کی تفصیل','Black Quilted Bed','سیاہ کوئلٹڈ بیڈ','Ash','ایش','250','۲۵۰']:
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
        for image in page.locator('main img').all():
            assert '/assets/real/' in image.evaluate('image=>image.src'), image.get_attribute('src')
        passed('all furniture/hero/room/gallery photos decode and every displayed photo uses assets/real')

        for width in [320,360,390,414,600,700,768,1024,1440]:
            page.set_viewport_size({'width':width,'height':1000})
            settle(page)
            page.evaluate('scrollTo(0,0)')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
            hero=page.locator('#hero-title')
            assert hero.evaluate('element=>element.scrollWidth<=element.clientWidth+1'),width
            assert page.locator('#site-header .brand').evaluate('element=>{const b=element.getBoundingClientRect();return b.left>=0&&b.right<=innerWidth+1&&element.scrollWidth<=element.clientWidth+1;}'),width
            if width<=700:
                assert page.locator('#site-header .brand').evaluate('element=>element.getBoundingClientRect().right<=document.getElementById("menu-toggle").getBoundingClientRect().left+1'),width
            page.locator('.design-photo-button[data-id="grey-bedroom-set"]').click()
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
        expect(blocked.locator('.design-card')).to_have_count(12)
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
