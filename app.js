(() => {
  'use strict';

  const config = window.SF_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const html = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const heart = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 4.5a5 5 0 0 0-7 0L12 6l-1.5-1.5a5 5 0 0 0-7 7L12 20l8.5-8.5a5 5 0 0 0 0-7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  const languageKey = 'sf-test4-lang';
  const shortlistKey = 'sf-test4-shortlist';
  const number = String(config.whatsappNumber || '').replace(/\D/g, '');
  const validWhatsApp = /^[1-9]\d{9,14}$/.test(number);
  let language = 'ur';
  try { const stored = window.localStorage.getItem(languageKey); if (stored === 'en' || stored === 'ur') language = stored; } catch { /* Language switching still works without browser storage. */ }
  window.SF_LANG = language;

  const copy = {
    en: {
      brand: config.brand || 'Shahbaz Furniture', pageTitle: 'Shahbaz Furniture — Pakistani Woodwork, Made Personal',
      view: 'View design', made: 'Made to order', saved: 'Saved', save: 'Save design', remove: 'Remove', clear: 'Clear list',
      designs: 'designs', design: 'design', saveAria: 'Save to your shortlist', removeAria: 'Remove from your shortlist',
      emptySaved: 'Your favourite designs belong here.', emptySavedHint: 'Save a few pieces from the collection, then bring them together in a project inquiry.',
      toastSaved: 'Design saved to your shortlist.', toastRemoved: 'Design removed from your shortlist.', toastCleared: 'Your shortlist is clear.',
      selected: 'Selected designs', noSelection: 'No catalogue designs selected. Tell us about your project below.', studioBrief: 'Your design direction',
      width: 'cm wide', materialNote: 'Final wood, finish, dimensions and availability are agreed with your quotation.',
      styleConcept: 'Generated design concept for inspiration; final specifications are agreed for your order.',
      galleryShow: 'Show design inspiration', galleryCaption: 'Generated design concept. Materials, dimensions and final details are confirmed before an order.',
      inquiryHeading: 'PROJECT INQUIRY', name: 'Name', phone: 'Phone', city: 'City', project: 'Project', details: 'Project details', notSpecified: 'Not specified',
      orderNote: 'Please discuss final measurements, materials, finish, price, production time and delivery with me before confirming an order.',
      inquiryReady: 'Your inquiry is ready. Review it, then choose WhatsApp to share. Nothing has been sent yet.',
      inquiryChanged: 'Your brief has changed. Review it again to update the WhatsApp message.',
      copied: 'Project inquiry copied. Paste it into your preferred messaging app.', copyFailed: 'Copy is unavailable. Select the inquiry text above to copy it manually.',
      missingWhatsApp: 'Your inquiry is ready to copy. A valid WhatsApp contact needs to be configured before sharing through WhatsApp.',
      checkFields: 'Please check the highlighted fields before continuing.', requiredName: 'Please enter your name.', requiredPhone: 'Please enter your phone number.',
      requiredProject: 'Please choose a project type.', requiredMessage: 'Please tell us a little about your project.', required: 'Please complete this field.',
      invalidPhone: 'Enter a phone number with 7–15 digits. You may include +, spaces, brackets and hyphens.',
      minimum: 'Please enter at least {count} characters.', maximum: 'Please use no more than {count} characters.',
      openMenu: 'Open navigation', closeMenu: 'Close navigation', switchLanguage: 'Switch to Urdu',
      whatsappMessage: `Assalam-o-Alaikum! I would like to discuss a furniture or custom woodwork project with ${config.brand || 'Shahbaz Furniture'}.`,
    },
    ur: {
      brand: config.brandUrdu || 'شہباز فرنیچر', pageTitle: 'شہباز فرنیچر — پاکستانی ہنر، آپ کی پسند',
      view: 'ڈیزائن دیکھیں', made: 'آپ کی فرمائش پر', saved: 'محفوظ شدہ', save: 'ڈیزائن محفوظ کریں', remove: 'ہٹائیں', clear: 'فہرست خالی کریں',
      designs: 'ڈیزائن', design: 'ڈیزائن', saveAria: 'پسندیدہ فہرست میں محفوظ کریں', removeAria: 'پسندیدہ فہرست سے ہٹائیں',
      emptySaved: 'آپ کے پسندیدہ ڈیزائن یہاں محفوظ ہوں گے۔', emptySavedHint: 'مجموعے سے اپنی پسند کے چند ڈیزائن محفوظ کریں، پھر کام کی تفصیل میں انہیں شامل کریں۔',
      toastSaved: 'ڈیزائن پسندیدہ فہرست میں محفوظ ہو گیا۔', toastRemoved: 'ڈیزائن پسندیدہ فہرست سے ہٹا دیا گیا۔', toastCleared: 'پسندیدہ فہرست خالی کر دی گئی۔',
      selected: 'منتخب ڈیزائن', noSelection: 'ابھی کوئی ڈیزائن منتخب نہیں کیا گیا۔ اپنے کام کی تفصیل نیچے لکھیں۔', studioBrief: 'آپ کی پسند کی تفصیل',
      width: 'سینٹی میٹر چوڑائی', materialNote: 'حتمی لکڑی، پالش، پیمائش اور دستیابی کوٹیشن کے ساتھ طے ہوں گی۔',
      styleConcept: 'یہ ڈیزائن کی تصوراتی تصویر ہے؛ حتمی تفصیلات آپ کے آرڈر کے لیے باہمی مشاورت سے طے ہوں گی۔',
      galleryShow: 'ڈیزائن کی تصویر دیکھیں', galleryCaption: 'ڈیزائن کی تصوراتی تصویر۔ لکڑی، پیمائش اور حتمی تفصیلات آرڈر سے پہلے طے ہوں گی۔',
      inquiryHeading: 'کام کی تفصیل', name: 'نام', phone: 'فون', city: 'شہر', project: 'کام کی نوعیت', details: 'آپ کے کام کی تفصیل', notSpecified: 'درج نہیں کیا گیا',
      orderNote: 'آرڈر کی تصدیق سے پہلے حتمی پیمائش، لکڑی، پالش، قیمت، تیاری کا وقت اور ترسیل کی تفصیلات باہمی مشاورت سے طے کریں۔',
      inquiryReady: 'آپ کے کام کی تفصیل تیار ہے۔ اسے دیکھ کر واٹس ایپ پر شیئر کرنے کا انتخاب کریں۔ ابھی کچھ بھی نہیں بھیجا گیا۔',
      inquiryChanged: 'تفصیل تبدیل ہوئی ہے۔ واٹس ایپ کا پیغام تازہ کرنے کے لیے اسے دوبارہ دیکھیں۔',
      copied: 'کام کی تفصیل کاپی ہو گئی۔ اسے اپنی پسند کی پیغام رسانی کی ایپ میں پیسٹ کریں۔', copyFailed: 'کاپی نہیں ہو سکی۔ اوپر دیا گیا متن منتخب کر کے خود کاپی کر لیں۔',
      missingWhatsApp: 'کام کی تفصیل کاپی کرنے کے لیے تیار ہے۔ واٹس ایپ پر شیئر کرنے کے لیے درست رابطہ نمبر درج ہونا ضروری ہے۔',
      checkFields: 'آگے بڑھنے سے پہلے نشان زدہ خانوں کی معلومات درست کریں۔', requiredName: 'براہِ کرم اپنا نام لکھیں۔', requiredPhone: 'براہِ کرم اپنا فون نمبر لکھیں۔',
      requiredProject: 'براہِ کرم کام کی نوعیت منتخب کریں۔', requiredMessage: 'براہِ کرم اپنے کام کے بارے میں کچھ تفصیل لکھیں۔', required: 'براہِ کرم یہ خانہ پُر کریں۔',
      invalidPhone: 'سات سے پندرہ ہندسوں کا درست فون نمبر لکھیں۔ جمع کا نشان، خالی جگہ، قوسین اور ڈیش استعمال کر سکتے ہیں۔',
      minimum: 'براہِ کرم کم از کم {count} حروف لکھیں۔', maximum: 'براہِ کرم {count} سے زیادہ حروف نہ لکھیں۔',
      openMenu: 'مینو کھولیں', closeMenu: 'مینو بند کریں', switchLanguage: 'انگریزی زبان منتخب کریں',
      whatsappMessage: `السلام علیکم! مجھے ${config.brandUrdu || 'شہباز فرنیچر'} سے فرنیچر اور لکڑی کے حسبِ فرمائش کام کے بارے میں معلومات درکار ہیں۔`,
    },
  };
  const t = (key, replacements = {}) => Object.entries(replacements).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), copy[language][key] || copy.en[key] || key);
  const localNumber = (value) => language === 'ur' ? String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]) : String(value);
  const latinNumber = (value) => String(value).replace(/[۰-۹٠-٩]/g, (digit) => {
    const urdu = '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit);
    return String(urdu >= 0 ? urdu : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
  });
  const normalize = (value) => String(value).normalize('NFKC').toLocaleLowerCase().replace(/[ًٌٍَُِّْٰـ]/g, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک');
  const categories = {
    living: { en: 'Living & baithak', ur: 'بیٹھک' }, dining: { en: 'Dining', ur: 'ڈائننگ' }, bedroom: { en: 'Bedroom', ur: 'بیڈروم' },
    storage: { en: 'Storage & wardrobes', ur: 'الماریاں اور شیلف' }, doors: { en: 'Doors', ur: 'دروازے' }, office: { en: 'Office', ur: 'دفتر' }, custom: { en: 'A custom project', ur: 'حسبِ فرمائش کام' },
  };
  const woods = { sheesham: { en: 'Sheesham', ur: 'شیشم' }, deodar: { en: 'Deodar', ur: 'دیودار' }, ash: { en: 'Ash', ur: 'ایش' } };
  const finishes = { natural: { en: 'Natural finish', ur: 'قدرتی رنگ' }, walnut: { en: 'Walnut tone', ur: 'اخروٹی پالش' }, dark: { en: 'Dark finish', ur: 'گہری پالش' } };
  const products = [
    {
      id: 'chiniot-bed', category: 'bedroom', defaultImage: 'assets/design-1.jpg',
      title: { en: 'Chiniot Carved Bed', ur: 'چنیوٹی نقش دار بیڈ' },
      description: { en: 'A bed direction inspired by the carved forms associated with Chinioti furniture. Discuss the headboard, timber, finish and mattress dimensions to plan a piece for your bedroom.', ur: 'چنیوٹی فرنیچر کی نقش و نگاری سے متاثر بیڈ کا ایک انداز۔ اپنے بیڈروم کے لیے سرہانے، لکڑی، پالش اور گدے کی پیمائش پر بات کر کے تفصیلات طے کریں۔' },
      specs: { en: ['Headboard carving and proportions to discuss', 'Frame sized around your mattress', 'Wood, finish and bedside options by agreement'], ur: ['سرہانے کی نقش و نگاری اور تناسب آپ کی پسند سے', 'گدے کی پیمائش کے مطابق بیڈ کا سائز', 'لکڑی، پالش اور سائیڈ میز کی تفصیلات باہمی مشاورت سے'] },
      tags: 'chiniot chinioti bed palang carved bedroom چنیوٹ پلنگ نقش بیڈ',
    },
    {
      id: 'carved-dining', category: 'dining', defaultImage: 'assets/design-2.jpg',
      title: { en: 'Carved Dining Set', ur: 'نقش دار ڈائننگ سیٹ' },
      description: { en: 'A traditional dining direction for family meals and special gatherings. Choose a table size, seating count and carved details that work with your dining space.', ur: 'گھر کے کھانوں اور خاص دعوتوں کے لیے روایتی ڈائننگ کا انداز۔ اپنی جگہ کے مطابق میز کی پیمائش، کرسیوں کی تعداد اور نقش و نگاری منتخب کریں۔' },
      specs: { en: ['Table size and seating count to your brief', 'Carving and chair-back details to discuss', 'Timber, upholstery and polish options'], ur: ['آپ کی ضرورت کے مطابق میز اور نشستوں کی تعداد', 'نقش و نگاری اور کرسی کی پشت کا انداز', 'لکڑی، نشست کے کپڑے اور پالش کے انتخاب'] },
      tags: 'dining table chairs family carved dinner mez kursi ڈائننگ میز کرسیاں دعوت',
    },
    {
      id: 'baithak-seating', category: 'living', defaultImage: 'assets/design-3.jpg',
      title: { en: 'Traditional Baithak Seating', ur: 'روایتی بیٹھک سیٹ' },
      description: { en: 'Make room for chai, guests and a good mehfil. Explore wooden seating and companion tables in a traditional direction, with upholstery and proportions suited to your baithak.', ur: 'چائے، مہمانوں اور اچھی محفل کے لیے جگہ بنائیں۔ اپنی بیٹھک کے مطابق روایتی لکڑی کی نشستیں، میزیں، کپڑا اور سائز منتخب کرنے پر بات کریں۔' },
      specs: { en: ['Seating arrangement planned around your room', 'Wood detailing and upholstery options', 'Companion tables can be discussed'], ur: ['کمرے کے مطابق نشستوں کی ترتیب', 'لکڑی کی بناوٹ اور نشست کے کپڑے کا انتخاب', 'ساتھ کی میزوں کا انداز بھی طے کیا جا سکتا ہے'] },
      tags: 'baithak sofa seating lounge mehfil chai diwan بیٹھک صوفہ دیوان محفل نشست',
    },
    {
      id: 'wooden-charpai', category: 'living', defaultImage: 'assets/design-4.jpg',
      title: { en: 'Wooden Charpai', ur: 'لکڑی کی چارپائی' },
      description: { en: 'A familiar Pakistani form with room for your own details. Discuss the frame, leg design, weaving and intended setting before choosing suitable materials and a finish.', ur: 'پاکستانی گھروں کی جانی پہچانی چارپائی، آپ کی پسند کی تفصیلات کے ساتھ۔ لکڑی، پائیوں، بنائی اور استعمال کی جگہ کے مطابق موزوں مواد اور پالش پر بات کریں۔' },
      specs: { en: ['Frame dimensions to your requirements', 'Leg shape and weaving style to discuss', 'Material and finish chosen for the intended setting'], ur: ['آپ کی ضرورت کے مطابق لمبائی اور چوڑائی', 'پائیوں اور بنائی کا انداز آپ کی پسند سے', 'استعمال کی جگہ کے لیے موزوں لکڑی اور پالش'] },
      tags: 'charpai manji khaat woven traditional aangan چارپائی کھاٹ منجی آنگن',
    },
    {
      id: 'sheesham-wardrobe', category: 'storage', defaultImage: 'assets/design-5.jpg',
      title: { en: 'Traditional Wooden Wardrobe', ur: 'لکڑی کی روایتی الماری' },
      description: { en: 'A wardrobe direction with traditional character and storage planned for daily life. Sheesham is one material preference to discuss; final timber and construction depend on the agreed specification.', ur: 'روایتی انداز کی الماری جس کی اندرونی ترتیب روزمرہ کی ضرورت کے مطابق طے ہو۔ شیشم ایک تجویز کردہ لکڑی ہے؛ حتمی لکڑی اور بناوٹ باہمی مشاورت سے منتخب ہوں گی۔' },
      specs: { en: ['Hanging, shelves and drawers to your brief', 'Door details and hardware to discuss', 'Suggested timber: sheesham, subject to confirmation'], ur: ['ضرورت کے مطابق کپڑے لٹکانے کی جگہ، شیلف اور دراز', 'دروازوں کی بناوٹ اور ہینڈل کا انتخاب', 'تجویز کردہ لکڑی: شیشم، حتمی تصدیق کے بعد'] },
      tags: 'wardrobe almirah storage cupboard sheesham cabinet الماری شیشم کپڑے دراز',
    },
    {
      id: 'entrance-door', category: 'doors', defaultImage: 'assets/design-6.jpg',
      title: { en: 'Carved Entrance Door', ur: 'نقش دار داخلی دروازہ' },
      description: { en: 'A considered welcome at the dehleez of your home. Explore panel proportions and carved details for an entrance door, with site dimensions, exposure and hardware discussed before making.', ur: 'گھر کی دہلیز پر ایک خوبصورت استقبال۔ داخلی دروازے کی نقش و نگاری اور پینل کا تناسب منتخب کریں؛ تیاری سے پہلے موقع کی پیمائش، موسم کے اثرات اور ہارڈویئر پر بات ضروری ہے۔' },
      specs: { en: ['Opening measurements confirmed for your site', 'Panel and carving details to your brief', 'Timber, hardware and exposure requirements to discuss'], ur: ['موقع پر دروازے کی پیمائش کی تصدیق', 'آپ کی پسند کے پینل اور نقش و نگاری', 'لکڑی، ہارڈویئر اور موسم کے اثرات کے مطابق تفصیلات'] },
      tags: 'door entrance darwaza dehleez carved panel دروازہ دہلیز داخلی نقش',
    },
    {
      id: 'office-table', category: 'office', defaultImage: 'assets/design-7.jpg',
      title: { en: 'Wooden Office Table', ur: 'لکڑی کی دفتری میز' },
      description: { en: 'A work surface with the warmth of wood and space for your routine. Discuss a desk with the dimensions, drawers and detailing suited to your office or study.', ur: 'لکڑی کی خوبصورتی کے ساتھ کام کرنے کے لیے موزوں میز۔ اپنے دفتر یا مطالعے کی جگہ کے مطابق پیمائش، درازوں اور بناوٹ کی تفصیلات طے کریں۔' },
      specs: { en: ['Width and depth planned around your workspace', 'Drawer and storage options to discuss', 'Timber tone, finish and details to your brief'], ur: ['کام کی جگہ کے مطابق لمبائی اور گہرائی', 'ضرورت کے مطابق دراز اور سامان رکھنے کی جگہ', 'آپ کی پسند کی لکڑی، پالش اور بناوٹ'] },
      tags: 'office desk table study work daftar mez دفتر میز مطالعہ کام',
    },
    {
      id: 'carved-console', category: 'storage', defaultImage: 'assets/design-8.jpg',
      title: { en: 'Carved Console Table', ur: 'نقش دار کنسول میز' },
      description: { en: 'A decorative and practical direction for a hallway, entrance or sitting room. Plan the console depth, carved details and any storage around the way you use the space.', ur: 'راہداری، داخلی حصے یا بیٹھک کے لیے خوبصورت اور کارآمد کنسول میز۔ اپنی جگہ اور استعمال کے مطابق گہرائی، نقش و نگاری اور سامان رکھنے کی سہولت طے کریں۔' },
      specs: { en: ['Dimensions planned for your room or hallway', 'Carved details and legs to discuss', 'Shelf or drawer options by agreement'], ur: ['کمرے یا راہداری کے مطابق پیمائش', 'نقش و نگاری اور پائیوں کا انداز', 'باہمی مشاورت سے شیلف یا دراز کا انتخاب'] },
      tags: 'console hallway entry table storage carved sideboard کنسول میز راہداری دراز',
    },
  ];
  const productMap = new Map(products.map((product) => [product.id, product]));
  const imageFor = (product) => config.designImages?.[product.id] || product.defaultImage;
  const imageAlt = (product) => `${product.title[language]} — ${t('styleConcept')}`;
  const validIds = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string' && productMap.has(id)))] : [];
  let savedIds = [];
  try { savedIds = validIds(JSON.parse(window.localStorage.getItem(shortlistKey) || '[]')); } catch { /* A temporary shortlist remains available when storage is blocked or invalid. */ }
  let activeCategory = 'all';
  let selectedDesign = null;
  let quoteDesignIds = [];
  let quoteStudio = null;
  let preparedSnapshot = null;
  let preparedText = '';
  let quoteStatus = '';
  let toastMessage = '';
  let toastTimer;
  let managedPrompts = [];
  const origins = new WeakMap();
  const skipReturn = new WeakSet();

  function focusOrigin(source, unwrapDialog = true) {
    if (!(source instanceof HTMLElement)) return { element: null, selector: '' };
    const parentDialog = source.closest('dialog');
    if (unwrapDialog && parentDialog && origins.has(parentDialog)) return origins.get(parentDialog);
    let selector = source.id ? `#${CSS.escape(source.id)}` : '';
    if (source.dataset.teamRole) selector = `[data-team-role="${CSS.escape(source.dataset.teamRole)}"][data-quote-open]`;
    if (source.dataset.id && productMap.has(source.dataset.id)) {
      const kind = source.matches('.saved-remove') ? '.saved-remove'
        : source.matches('.saved-image') ? '.saved-image'
        : parentDialog?.id === 'saved-dialog' ? '.saved-copy .product-open'
        : source.matches('.save-design') ? '.save-design'
        : source.matches('.design-photo-button') ? '.design-photo-button' : '.design-title .product-open';
      selector = `${kind}[data-id="${source.dataset.id}"]`;
    }
    return { element: source, selector };
  }
  function returnFocus(record) {
    if (!record) return;
    const original = record.element;
    const target = original instanceof HTMLElement && original.isConnected && original.getClientRects().length ? original : record.selector && document.querySelector(record.selector);
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }
  function closeDialog(dialog, restore = true) {
    if (!dialog?.open) return;
    if (!restore) skipReturn.add(dialog);
    dialog.close();
  }
  function openDialog(dialog, source = document.activeElement) {
    if (!dialog || dialog.open) return;
    const origin = focusOrigin(source);
    document.querySelectorAll('dialog[open]').forEach((other) => { if (other !== dialog) closeDialog(other, false); });
    origins.set(dialog, origin);
    dialog.showModal();
    document.documentElement.classList.add('dialog-open');
  }
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      document.documentElement.classList.toggle('dialog-open', !!document.querySelector('dialog[open]'));
      if (skipReturn.has(dialog)) { skipReturn.delete(dialog); return; }
      returnFocus(origins.get(dialog));
    });
  });

  function showToast(key) {
    toastMessage = key;
    if (!$('toast')) return;
    window.clearTimeout(toastTimer);
    $('toast').textContent = t(key);
    $('toast').classList.add('is-visible');
    toastTimer = window.setTimeout(() => { $('toast')?.classList.remove('is-visible'); toastMessage = ''; }, 3200);
  }
  function renderCatalogue() {
    const search = normalize($('design-search')?.value || '').trim();
    const sort = $('design-sort')?.value || 'featured';
    const visible = products.filter((product) => (activeCategory === 'all' || product.category === activeCategory)
      && (!search || normalize(`${product.title.en} ${product.title.ur} ${product.description.en} ${product.description.ur} ${product.tags} ${categories[product.category].en} ${categories[product.category].ur}`).includes(search)));
    if (sort === 'az') visible.sort((a, b) => a.title[language].localeCompare(b.title[language], language === 'ur' ? 'ur-PK' : 'en-PK'));
    if ($('design-grid')) $('design-grid').innerHTML = visible.map((product) => `
      <article class="design-card">
        <div class="design-photo"><button type="button" class="design-photo-button product-open" data-id="${product.id}" aria-label="${html(`${product.title[language]} — ${t('view')}`)}"><img src="${html(imageFor(product))}" alt="${html(imageAlt(product))}" loading="lazy" decoding="async" width="900" height="1100"><span class="design-photo-action">${html(t('view'))} ${arrow}</span></button><button type="button" class="save-design${savedIds.includes(product.id) ? ' is-saved' : ''}" data-id="${product.id}" aria-pressed="${savedIds.includes(product.id)}" aria-label="${html(`${product.title[language]} — ${t(savedIds.includes(product.id) ? 'removeAria' : 'saveAria')}`)}">${heart}</button></div>
        <div class="design-info"><div class="design-meta"><small>${html(categories[product.category][language])}</small><span>${html(t('made'))}</span></div><h3 class="design-title"><button type="button" class="product-open" data-id="${product.id}">${html(product.title[language])}</button></h3><button type="button" class="design-more product-open" data-id="${product.id}">${html(t('view'))}${arrow}</button></div>
      </article>
    `).join('');
    if ($('design-count')) $('design-count').textContent = `${localNumber(visible.length)} ${t(visible.length === 1 ? 'design' : 'designs')}`;
    if ($('design-empty')) $('design-empty').hidden = visible.length > 0;
    document.querySelectorAll('button[data-category]').forEach((button) => {
      const active = button.dataset.category === activeCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function renderDetail() {
    if (!selectedDesign) return;
    if ($('detail-title')) $('detail-title').textContent = selectedDesign.title[language];
    if ($('detail-category')) $('detail-category').textContent = categories[selectedDesign.category][language];
    if ($('detail-description')) $('detail-description').textContent = selectedDesign.description[language];
    if ($('detail-image')) { $('detail-image').src = imageFor(selectedDesign); $('detail-image').alt = imageAlt(selectedDesign); }
    if ($('detail-specs')) $('detail-specs').replaceChildren(...selectedDesign.specs[language].map((specification) => {
      const item = document.createElement('li'); item.textContent = specification; return item;
    }));
    if ($('detail-save')) {
      const saved = savedIds.includes(selectedDesign.id);
      $('detail-save').setAttribute('aria-pressed', String(saved));
      $('detail-save').classList.toggle('is-saved', saved);
      $('detail-save').textContent = t(saved ? 'saved' : 'save');
    }
  }
  function showDesign(id, source) {
    const design = productMap.get(id);
    if (!design) return;
    selectedDesign = design;
    renderDetail();
    openDialog($('design-dialog'), source);
  }
  function renderSaved() {
    if ($('saved-items')) $('saved-items').innerHTML = savedIds.length ? savedIds.map((id) => {
      const product = productMap.get(id);
      return `<article class="saved-item"><button type="button" class="saved-image product-open" data-id="${id}" aria-label="${html(`${product.title[language]} — ${t('view')}`)}"><img src="${html(imageFor(product))}" alt="${html(imageAlt(product))}" loading="lazy" width="160" height="180"></button><div class="saved-copy"><small>${html(categories[product.category][language])}</small><h3><button type="button" class="product-open" data-id="${id}">${html(product.title[language])}</button></h3><button type="button" class="saved-remove" data-id="${id}" aria-label="${html(`${product.title[language]} — ${t('removeAria')}`)}">${html(t('remove'))}</button></div></article>`;
    }).join('') : `<div class="saved-empty"><h3>${html(t('emptySaved'))}</h3><p>${html(t('emptySavedHint'))}</p></div>`;
    document.querySelectorAll('[data-saved-count]').forEach((element) => { element.textContent = localNumber(savedIds.length); });
    if ($('saved-clear')) $('saved-clear').disabled = savedIds.length === 0;
    if ($('saved-inquire')) $('saved-inquire').disabled = savedIds.length === 0;
    document.querySelectorAll('.save-design[data-id]').forEach((button) => {
      const product = productMap.get(button.dataset.id);
      if (!product) return;
      const saved = savedIds.includes(product.id);
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('is-saved', saved);
      button.setAttribute('aria-label', `${product.title[language]} — ${t(saved ? 'removeAria' : 'saveAria')}`);
    });
    renderDetail();
  }
  function persistSaved() {
    try { window.localStorage.setItem(shortlistKey, JSON.stringify(savedIds)); } catch { /* Only the current-visit shortlist is used when storage is unavailable. */ }
    renderSaved();
  }
  function toggleSaved(id) {
    if (!productMap.has(id)) return;
    const saved = savedIds.includes(id);
    savedIds = saved ? savedIds.filter((item) => item !== id) : [...savedIds, id];
    persistSaved();
    showToast(saved ? 'toastRemoved' : 'toastSaved');
  }

  function studioState() {
    const project = $('studio-design')?.value;
    const wood = $('studio-wood')?.value;
    const finish = $('studio-finish')?.value;
    const rawWidth = Number($('studio-width')?.value || 180);
    return {
      project: Object.hasOwn(categories, project) ? project : 'custom', wood: Object.hasOwn(woods, wood) ? wood : 'sheesham',
      finish: Object.hasOwn(finishes, finish) ? finish : 'natural', width: Number.isFinite(rawWidth) ? Math.min(300, Math.max(100, Math.round(rawWidth / 10) * 10)) : 180,
    };
  }
  function studioText(state) {
    return `${categories[state.project][language]} · ${woods[state.wood][language]} · ${finishes[state.finish][language]} · ${localNumber(state.width)} ${t('width')}`;
  }
  function updateStudio() {
    const state = studioState();
    if ($('studio-width-output')) $('studio-width-output').textContent = `${localNumber(state.width)} ${language === 'ur' ? 'سینٹی میٹر' : 'cm'}`;
    if ($('studio-summary')) $('studio-summary').textContent = `${studioText(state)}. ${t('materialNote')}`;
    const swatch = $('studio-swatch');
    if (swatch) { swatch.dataset.finish = state.finish; swatch.setAttribute('aria-label', finishes[state.finish][language]); }
  }
  function renderQuoteSelection() {
    quoteDesignIds = validIds(quoteDesignIds);
    const parts = [];
    if (quoteDesignIds.length) parts.push(`${t('selected')}: ${quoteDesignIds.map((id) => productMap.get(id).title[language]).join(language === 'ur' ? '، ' : ', ')}`);
    if (quoteStudio) parts.push(`${t('studioBrief')}: ${studioText(quoteStudio)}`);
    if ($('quote-selection')) $('quote-selection').textContent = parts.length ? parts.join('\n') : t('noSelection');
  }
  function setQuoteStatus(key) {
    quoteStatus = key;
    if ($('quote-status')) $('quote-status').textContent = key ? t(key) : '';
  }
  function invalidateQuote() {
    if (!preparedSnapshot) return;
    preparedSnapshot = null;
    preparedText = '';
    if ($('quote-preview')) $('quote-preview').hidden = true;
    $('quote-wa')?.removeAttribute('href');
    setQuoteStatus('inquiryChanged');
  }
  function appendSourcePrompt(source) {
    const field = $('quote-message');
    const current = source?.dataset.quoteMessage?.trim();
    if (!field || !current) return;
    const prompt = { en: source.dataset.enQuoteMessage || current, ur: source.dataset.urQuoteMessage || current, current };
    if ([prompt.en, prompt.ur].some((text) => field.value.includes(text))) return;
    field.value = field.value.trim() ? `${field.value.trim()}\n\n${current}` : current;
    managedPrompts.push(prompt);
  }
  function translateManagedPrompts() {
    const field = $('quote-message');
    if (!field) return;
    managedPrompts = managedPrompts.filter((prompt) => {
      if (!field.value.includes(prompt.current)) return false;
      const next = prompt[language];
      field.value = field.value.replace(prompt.current, next);
      prompt.current = next;
      return true;
    });
  }
  function openQuote({ project, productId, studio, source } = {}) {
    quoteDesignIds = validIds([...savedIds, ...(productId ? [productId] : [])]);
    quoteStudio = studio ? { ...studio } : null;
    const product = productMap.get(productId);
    const nextProject = project || product?.category || studio?.project;
    if ($('quote-project') && Object.hasOwn(categories, nextProject)) $('quote-project').value = nextProject;
    appendSourcePrompt(source);
    renderQuoteSelection();
    invalidateQuote();
    openDialog($('quote-dialog'), source || document.activeElement);
    if ($('quote-dialog')) $('quote-dialog').scrollTop = 0;
    $('quote-name')?.focus({ preventScroll: true });
  }
  function bidiPhone(value) { return language === 'ur' ? `\u2066${value}\u2069` : value; }
  function buildQuote(snapshot) {
    return [
      `${t('brand')} — ${t('inquiryHeading')}`, '',
      `${t('name')}: ${snapshot.name}`, `${t('phone')}: ${bidiPhone(snapshot.phone)}`, `${t('city')}: ${snapshot.city || t('notSpecified')}`,
      `${t('project')}: ${categories[snapshot.project]?.[language] || snapshot.project}`,
      ...(snapshot.designIds.length ? ['', `${t('selected')}:`, ...snapshot.designIds.map((id) => `• ${productMap.get(id).title[language]}`)] : []),
      ...(snapshot.studio ? ['', `${t('studioBrief')}:`, studioText(snapshot.studio)] : []),
      '', `${t('details')}:`, snapshot.message, '', t('orderNote'),
    ].join('\n');
  }
  function renderPreparedQuote() {
    if (!preparedSnapshot) return;
    preparedText = buildQuote(preparedSnapshot);
    if ($('quote-summary')) { $('quote-summary').textContent = preparedText; $('quote-summary').dir = language === 'ur' ? 'rtl' : 'ltr'; $('quote-summary').lang = language; }
    if ($('quote-preview')) $('quote-preview').hidden = false;
    const link = $('quote-wa');
    if (link) {
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      if (validWhatsApp) { link.href = `https://wa.me/${number}?text=${encodeURIComponent(preparedText)}`; link.removeAttribute('aria-disabled'); }
      else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
    }
    setQuoteStatus(validWhatsApp ? 'inquiryReady' : 'missingWhatsApp');
  }

  const quoteForm = $('quote-form');
  const quoteFields = () => quoteForm ? [...quoteForm.querySelectorAll('input, select, textarea')].filter((field) => field.willValidate) : [];
  function fieldMessage(field) {
    const value = field.value.trim();
    if (field.required && !value) return t(({ 'quote-name': 'requiredName', 'quote-phone': 'requiredPhone', 'quote-project': 'requiredProject', 'quote-message': 'requiredMessage' })[field.id] || 'required');
    if (field.id === 'quote-phone' && value) {
      const digits = latinNumber(value).replace(/\D/g, '');
      if (!/^\+?[0-9 ()-]+$/.test(latinNumber(value)) || digits.length < 7 || digits.length > 15) return t('invalidPhone');
    }
    if (value && field.minLength > 0 && value.length < field.minLength) return t('minimum', { count: localNumber(field.minLength) });
    if (field.maxLength > 0 && value.length > field.maxLength) return t('maximum', { count: localNumber(field.maxLength) });
    if (field.validity.patternMismatch || field.validity.typeMismatch) return field.id === 'quote-phone' ? t('invalidPhone') : t('checkFields');
    if (field.validity.valueMissing) return t('required');
    return '';
  }
  function refreshFieldError(field) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
    field.setCustomValidity('');
    field.setCustomValidity(fieldMessage(field));
  }
  quoteForm?.addEventListener('invalid', (event) => { refreshFieldError(event.target); setQuoteStatus('checkFields'); }, true);
  quoteForm?.addEventListener('input', (event) => {
    if (event.target.id === 'quote-phone') event.target.value = latinNumber(event.target.value);
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
    invalidateQuote();
  });
  quoteForm?.addEventListener('change', invalidateQuote);
  quoteForm?.addEventListener('reset', () => {
    managedPrompts = [];
    quoteFields().forEach((field) => field.setCustomValidity(''));
    invalidateQuote();
  });
  quoteForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    ['quote-name', 'quote-phone', 'quote-city', 'quote-message'].forEach((id) => { if ($(id)) $(id).value = $(id).value.trim(); });
    if ($('quote-phone')) $('quote-phone').value = latinNumber($('quote-phone').value);
    quoteFields().forEach(refreshFieldError);
    if (!quoteForm.reportValidity()) { setQuoteStatus('checkFields'); return; }
    const data = new FormData(quoteForm);
    const value = (name) => String(data.get(name) || '').trim();
    preparedSnapshot = { name: value('name'), phone: value('phone'), city: value('city'), project: value('project'), message: value('message'), designIds: [...quoteDesignIds], studio: quoteStudio ? { ...quoteStudio } : null };
    renderPreparedQuote();
    $('quote-preview')?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
  });
  if ($('quote-phone')) { $('quote-phone').dir = 'ltr'; $('quote-phone').inputMode = 'tel'; }
  function fallbackCopy(text) {
    const field = document.createElement('textarea');
    field.value = text; field.setAttribute('readonly', ''); field.setAttribute('aria-label', t('details'));
    field.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';
    ($('quote-dialog')?.open ? $('quote-dialog') : document.body).append(field);
    field.focus(); field.select();
    try { return document.execCommand('copy'); } finally { field.remove(); }
  }
  $('quote-copy')?.addEventListener('click', async (event) => {
    event.preventDefault();
    if (!preparedText) return;
    const button = event.currentTarget;
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(preparedText); } catch { if (!fallbackCopy(preparedText)) throw new Error('Copy unavailable'); }
      } else if (!fallbackCopy(preparedText)) throw new Error('Copy unavailable');
      setQuoteStatus('copied');
    } catch { setQuoteStatus('copyFailed'); }
    if (button instanceof HTMLElement) button.focus({ preventScroll: true });
  });

  const galleryProducts = ['chiniot-bed', 'carved-dining', 'baithak-seating', 'wooden-charpai', 'entrance-door', 'carved-console'];
  let galleryIndex = 0;
  function galleryImage(index) { return config.galleryImages?.[index] || imageFor(productMap.get(galleryProducts[index])); }
  function renderGallery() {
    const product = productMap.get(galleryProducts[galleryIndex]);
    if ($('gallery-image')) { $('gallery-image').src = galleryImage(galleryIndex); $('gallery-image').alt = imageAlt(product); }
    if ($('gallery-title')) $('gallery-title').textContent = product.title[language];
    if ($('gallery-caption')) $('gallery-caption').textContent = t('galleryCaption');
    if ($('gallery-index')) $('gallery-index').textContent = `${localNumber(String(galleryIndex + 1).padStart(2, '0'))} / ${localNumber(String(galleryProducts.length).padStart(2, '0'))}`;
    document.querySelectorAll('#gallery-dots button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === galleryIndex));
      button.setAttribute('aria-label', `${t('galleryShow')} ${localNumber(index + 1)}: ${productMap.get(galleryProducts[index]).title[language]}`);
      button.classList.toggle('active', index === galleryIndex);
    });
  }
  function showGallery(index) { galleryIndex = (index + galleryProducts.length) % galleryProducts.length; renderGallery(); }
  if ($('gallery-dots')) $('gallery-dots').replaceChildren(...galleryProducts.map((id, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'gallery-dot';
    button.addEventListener('click', () => showGallery(index)); return button;
  }));
  $('gallery-prev')?.addEventListener('click', () => showGallery(galleryIndex - 1));
  $('gallery-next')?.addEventListener('click', () => showGallery(galleryIndex + 1));
  const galleryStage = $('gallery-stage');
  if (galleryStage && !galleryStage.hasAttribute('tabindex')) galleryStage.tabIndex = 0;
  galleryStage?.addEventListener('keydown', (event) => {
    if (event.target instanceof Element && event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1) * (language === 'ur' ? -1 : 1));
    }
  });
  let swipe = null;
  galleryStage?.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('button, a')) return;
    swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  galleryStage?.addEventListener('pointerup', (event) => {
    if (!swipe || swipe.id !== event.pointerId) return;
    const x = event.clientX - swipe.x, y = event.clientY - swipe.y;
    swipe = null;
    if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.4) showGallery(galleryIndex + (x < 0 ? 1 : -1) * (language === 'ur' ? -1 : 1));
  });
  galleryStage?.addEventListener('pointercancel', () => { swipe = null; });

  function applyStaticLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.title = t('pageTitle');
    document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = localNumber(new Date().getFullYear()); });
    document.querySelectorAll('[data-en][data-ur]').forEach((element) => { element.textContent = element.dataset[language]; });
    document.querySelectorAll('[data-en-placeholder][data-ur-placeholder]').forEach((element) => { element.setAttribute('placeholder', element.getAttribute(`data-${language}-placeholder`)); });
    document.querySelectorAll('[data-en-label][data-ur-label]').forEach((element) => { element.setAttribute('aria-label', element.getAttribute(`data-${language}-label`)); });
    const toggle = $('language-toggle');
    if (toggle) { toggle.textContent = language === 'ur' ? 'English' : 'اردو'; toggle.setAttribute('aria-label', t('switchLanguage')); toggle.lang = language === 'ur' ? 'en' : 'ur'; }
    document.querySelectorAll('[data-wa]').forEach((link) => {
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      if (validWhatsApp) { link.href = `https://wa.me/${number}?text=${encodeURIComponent(t('whatsappMessage'))}`; link.removeAttribute('aria-disabled'); }
      else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
    });
    if ($('menu-toggle')) $('menu-toggle').setAttribute('aria-label', t($('menu-toggle').getAttribute('aria-expanded') === 'true' ? 'closeMenu' : 'openMenu'));
  }
  function setLanguage(next, persist = true) {
    if (next !== 'ur' && next !== 'en') return;
    const active = document.activeElement;
    const activeOrigin = focusOrigin(active, false);
    language = next; window.SF_LANG = next;
    if (persist) { try { window.localStorage.setItem(languageKey, language); } catch { /* The current language is kept in memory. */ } }
    applyStaticLanguage();
    translateManagedPrompts();
    renderCatalogue(); renderSaved(); updateStudio(); renderGallery(); renderQuoteSelection();
    if (preparedSnapshot) { preparedSnapshot.message = $('quote-message')?.value.trim() || preparedSnapshot.message; renderPreparedQuote(); }
    else if (quoteStatus) setQuoteStatus(quoteStatus);
    if (toastMessage && $('toast')) $('toast').textContent = t(toastMessage);
    quoteFields().forEach((field) => { if (field.validity.customError) refreshFieldError(field); });
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
    if (active instanceof HTMLElement && !active.isConnected) returnFocus(activeOrigin);
  }
  window.SF_SET_LANGUAGE = setLanguage;
  $('language-toggle')?.addEventListener('click', () => setLanguage(language === 'ur' ? 'en' : 'ur'));

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const closer = target?.closest('[data-close-dialog]');
    if (closer) { event.preventDefault(); closeDialog(closer.closest('dialog')); return; }
    const save = target?.closest('.save-design[data-id]');
    if (save) { event.preventDefault(); toggleSaved(save.dataset.id); return; }
    const product = target?.closest('.product-open[data-id]');
    if (product) { event.preventDefault(); showDesign(product.dataset.id, product); return; }
    const remove = target?.closest('.saved-remove[data-id]');
    if (remove) {
      event.preventDefault(); toggleSaved(remove.dataset.id);
      ($('saved-items')?.querySelector('.saved-remove') || $('saved-dialog')?.querySelector('[data-close-dialog]'))?.focus();
      return;
    }
    const savedOpener = target?.closest('.saved-open');
    if (savedOpener) { event.preventDefault(); renderSaved(); openDialog($('saved-dialog'), savedOpener); return; }
    const quoteOpener = target?.closest('[data-quote-open]');
    if (quoteOpener) { event.preventDefault(); closeMenu(); openQuote({ project: quoteOpener.dataset.project, source: quoteOpener }); return; }
    const filter = target?.closest('button[data-category]');
    if (filter) {
      const category = filter.dataset.category;
      if (category === 'all' || Object.hasOwn(categories, category)) { activeCategory = category; renderCatalogue(); }
    }
  });
  $('design-search')?.addEventListener('input', renderCatalogue);
  $('design-sort')?.addEventListener('change', renderCatalogue);
  $('detail-save')?.addEventListener('click', () => { if (selectedDesign) toggleSaved(selectedDesign.id); });
  $('detail-inquire')?.addEventListener('click', () => { if (selectedDesign) openQuote({ productId: selectedDesign.id, source: $('detail-inquire') }); });
  $('saved-inquire')?.addEventListener('click', () => openQuote({ source: $('saved-inquire') }));
  $('saved-clear')?.addEventListener('click', () => {
    savedIds = []; persistSaved(); showToast('toastCleared'); $('saved-dialog')?.querySelector('[data-close-dialog]')?.focus();
  });
  $('studio-form')?.addEventListener('input', updateStudio);
  $('studio-form')?.addEventListener('change', updateStudio);
  $('studio-form')?.addEventListener('submit', (event) => event.preventDefault());
  $('studio-inquire')?.addEventListener('click', (event) => { event.preventDefault(); openQuote({ studio: studioState(), source: event.currentTarget }); });
  window.addEventListener('storage', (event) => {
    if (event.key === languageKey && (event.newValue === 'ur' || event.newValue === 'en')) setLanguage(event.newValue, false);
    if (event.key === shortlistKey) { try { savedIds = validIds(JSON.parse(event.newValue || '[]')); } catch { savedIds = []; } renderSaved(); }
  });

  const menu = $('menu-toggle'), navigation = $('site-nav');
  function closeMenu() { navigation?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', t('openMenu')); }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', t(open ? 'closeMenu' : 'openMenu')); navigation?.classList.toggle('is-open', open);
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', (event) => { if (menu?.getAttribute('aria-expanded') === 'true' && !menu.contains(event.target) && !navigation?.contains(event.target)) closeMenu(); });
  $('search-jump')?.addEventListener('click', () => {
    closeMenu(); ($('collection') || $('design-grid'))?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }); $('design-search')?.focus({ preventScroll: true });
  });
  let scrollQueued = false;
  function updateScroll() { $('site-header')?.classList.toggle('is-scrolled', window.scrollY > 20); scrollQueued = false; }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScroll); } }, { passive: true });
  document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = localNumber(new Date().getFullYear()); });
  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => item.addEventListener('toggle', () => { if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; }); }));
  setLanguage(language, false);
  updateScroll();
  document.documentElement.classList.add('js-ready');
})();
