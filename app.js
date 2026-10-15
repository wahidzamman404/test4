(() => {
  'use strict';

  const config = window.SF_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const bi = (en, ur) => `<span class="bi-en" lang="en" dir="ltr">${escapeHTML(en)}</span><span class="bi-ur" lang="ur" dir="rtl">${escapeHTML(ur)}</span>`;
  const pairText = (en, ur) => `${en}\n${ur}`;
  const setBi = (id, en, ur) => { if ($(id)) $(id).innerHTML = bi(en, ur); };
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const heart = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.5 4.5a5 5 0 0 0-7 0L12 6l-1.5-1.5a5 5 0 0 0-7 7L12 20l8.5-8.5a5 5 0 0 0 0-7Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  const shortlistKey = 'sf-test4-shortlist';
  const whatsappNumber = String(config.whatsappNumber || '').replace(/\D/g, '');
  const validWhatsApp = /^[1-9]\d{9,14}$/.test(whatsappNumber);

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

  const text = (key, language) => copy[language][key] || copy.en[key] || key;
  const textPair = (key) => bi(text(key, 'en'), text(key, 'ur'));
  const localizedNumber = (value) => String(value).replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]);
  const latinNumber = (value) => String(value).replace(/[۰-۹٠-٩]/g, (digit) => {
    const index = '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit);
    return String(index >= 0 ? index : '٠١٢٣٤٥٦٧٨٩'.indexOf(digit));
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
  const imageAlt = (product) => `${product.title.en} / ${product.title.ur} — Generated design concept / تصوراتی ڈیزائن`;
  const validIds = (value) => Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string' && productMap.has(id)))] : [];
  let savedIds = [];
  try { savedIds = validIds(JSON.parse(window.localStorage.getItem(shortlistKey) || '[]')); } catch { /* A current-visit shortlist remains available without storage. */ }
  let activeCategory = 'all';
  let selectedDesign = null;
  let quoteDesignIds = [];
  let quoteStudio = null;
  let preparedSnapshot = null;
  let preparedText = '';
  let toastTimer;
  const origins = new WeakMap();
  const skipReturn = new WeakSet();

  function focusOrigin(source) {
    if (!(source instanceof HTMLElement)) return { element: null, selector: '' };
    const dialog = source.closest('dialog');
    if (dialog && origins.has(dialog)) return origins.get(dialog);
    let selector = source.id ? `#${CSS.escape(source.id)}` : '';
    if (source.dataset.teamRole) selector = `[data-team-role="${CSS.escape(source.dataset.teamRole)}"][data-quote-open]`;
    if (source.dataset.id && productMap.has(source.dataset.id)) {
      const kind = source.matches('.save-design') ? '.save-design' : source.matches('.design-photo-button') ? '.design-photo-button' : '.design-title .product-open';
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
    if (!$('toast')) return;
    window.clearTimeout(toastTimer);
    $('toast').innerHTML = textPair(key);
    $('toast').classList.add('is-visible');
    toastTimer = window.setTimeout(() => $('toast')?.classList.remove('is-visible'), 3200);
  }
  function renderCatalogue() {
    const search = normalize($('design-search')?.value || '').trim();
    const sort = $('design-sort')?.value || 'featured';
    const visible = products.filter((product) => (activeCategory === 'all' || product.category === activeCategory)
      && (!search || normalize(`${product.title.en} ${product.title.ur} ${product.description.en} ${product.description.ur} ${product.tags} ${categories[product.category].en} ${categories[product.category].ur}`).includes(search)));
    if (sort === 'az') visible.sort((a, b) => a.title.en.localeCompare(b.title.en, 'en-PK'));
    if ($('design-grid')) $('design-grid').innerHTML = visible.map((product) => `
      <article class="design-card">
        <div class="design-photo"><button type="button" class="design-photo-button product-open" data-id="${product.id}" aria-label="${escapeHTML(`View ${product.title.en} / ${product.title.ur} — ڈیزائن دیکھیں`)}"><img src="${escapeHTML(imageFor(product))}" alt="${escapeHTML(imageAlt(product))}" loading="lazy" decoding="async" width="900" height="1100"><span class="design-photo-action">${textPair('view')}${arrow}</span></button><button type="button" class="save-design${savedIds.includes(product.id) ? ' is-saved' : ''}" data-id="${product.id}" aria-pressed="${savedIds.includes(product.id)}" aria-label="${escapeHTML(`${text(savedIds.includes(product.id) ? 'removeAria' : 'saveAria', 'en')}: ${product.title.en} / ${product.title.ur} — ${text(savedIds.includes(product.id) ? 'removeAria' : 'saveAria', 'ur')}`)}">${heart}</button></div>
        <div class="design-info"><div class="design-meta"><small>${bi(categories[product.category].en, categories[product.category].ur)}</small><span>${textPair('made')}</span></div><h3 class="design-title"><button type="button" class="product-open" data-id="${product.id}">${bi(product.title.en, product.title.ur)}</button></h3><button type="button" class="design-more product-open" data-id="${product.id}">${textPair('view')}${arrow}</button></div>
      </article>
    `).join('');
    setBi('design-count', `${visible.length} ${text(visible.length === 1 ? 'design' : 'designs', 'en')}`, `${localizedNumber(visible.length)} ڈیزائن`);
    if ($('design-empty')) $('design-empty').hidden = visible.length > 0;
    document.querySelectorAll('button[data-category]').forEach((button) => {
      const active = button.dataset.category === activeCategory;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function renderDetail() {
    if (!selectedDesign) return;
    setBi('detail-title', selectedDesign.title.en, selectedDesign.title.ur);
    setBi('detail-category', categories[selectedDesign.category].en, categories[selectedDesign.category].ur);
    setBi('detail-description', selectedDesign.description.en, selectedDesign.description.ur);
    if ($('detail-image')) { $('detail-image').src = imageFor(selectedDesign); $('detail-image').alt = imageAlt(selectedDesign); }
    if ($('detail-specs')) $('detail-specs').innerHTML = selectedDesign.specs.en.map((specification, index) => `<li>${bi(specification, selectedDesign.specs.ur[index])}</li>`).join('');
    if ($('detail-save')) {
      const saved = savedIds.includes(selectedDesign.id);
      $('detail-save').setAttribute('aria-pressed', String(saved));
      $('detail-save').classList.toggle('is-saved', saved);
      $('detail-save').innerHTML = textPair(saved ? 'saved' : 'save');
    }
  }
  function showDesign(id, source) {
    const product = productMap.get(id);
    if (!product) return;
    selectedDesign = product;
    renderDetail();
    openDialog($('design-dialog'), source);
  }
  function renderSaved() {
    if ($('saved-items')) $('saved-items').innerHTML = savedIds.length ? savedIds.map((id) => {
      const product = productMap.get(id);
      return `<article class="saved-item"><button type="button" class="saved-image product-open" data-id="${id}" aria-label="${escapeHTML(`View ${product.title.en} / ${product.title.ur}`)}"><img src="${escapeHTML(imageFor(product))}" alt="${escapeHTML(imageAlt(product))}" loading="lazy" width="160" height="180"></button><div class="saved-copy"><small>${bi(categories[product.category].en, categories[product.category].ur)}</small><h3><button type="button" class="product-open" data-id="${id}">${bi(product.title.en, product.title.ur)}</button></h3><button type="button" class="saved-remove" data-id="${id}" aria-label="${escapeHTML(`Remove ${product.title.en} / ${product.title.ur} — فہرست سے ہٹائیں`)}">${textPair('remove')}</button></div></article>`;
    }).join('') : `<div class="saved-empty"><h3>${textPair('emptySaved')}</h3><p>${textPair('emptySavedHint')}</p></div>`;
    document.querySelectorAll('[data-saved-count]').forEach((element) => { element.textContent = String(savedIds.length); });
    if ($('saved-clear')) $('saved-clear').disabled = savedIds.length === 0;
    if ($('saved-inquire')) $('saved-inquire').disabled = savedIds.length === 0;
    document.querySelectorAll('.save-design[data-id]').forEach((button) => {
      const product = productMap.get(button.dataset.id);
      if (!product) return;
      const saved = savedIds.includes(product.id);
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('is-saved', saved);
      button.setAttribute('aria-label', `${text(saved ? 'removeAria' : 'saveAria', 'en')}: ${product.title.en} / ${product.title.ur} — ${text(saved ? 'removeAria' : 'saveAria', 'ur')}`);
    });
    renderDetail();
  }
  function persistSaved() {
    try { window.localStorage.setItem(shortlistKey, JSON.stringify(savedIds)); } catch { /* Only saved design IDs are kept, and the current visit still works without storage. */ }
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
    const project = $('studio-design')?.value, wood = $('studio-wood')?.value, finish = $('studio-finish')?.value;
    const rawWidth = Number($('studio-width')?.value || 180);
    return {
      project: Object.hasOwn(categories, project) ? project : 'custom', wood: Object.hasOwn(woods, wood) ? wood : 'sheesham', finish: Object.hasOwn(finishes, finish) ? finish : 'natural',
      width: Number.isFinite(rawWidth) ? Math.min(300, Math.max(100, Math.round(rawWidth / 10) * 10)) : 180,
    };
  }
  function studioText(state, language) {
    return `${categories[state.project][language]} · ${woods[state.wood][language]} · ${finishes[state.finish][language]} · ${language === 'ur' ? localizedNumber(state.width) : state.width} ${text('width', language)}`;
  }
  function updateStudio() {
    const state = studioState();
    setBi('studio-width-output', `${state.width} cm`, `${localizedNumber(state.width)} سینٹی میٹر`);
    setBi('studio-summary', `${studioText(state, 'en')}. ${text('materialNote', 'en')}`, `${studioText(state, 'ur')}۔ ${text('materialNote', 'ur')}`);
    if ($('studio-swatch')) { $('studio-swatch').dataset.finish = state.finish; $('studio-swatch').setAttribute('aria-label', `${finishes[state.finish].en} / ${finishes[state.finish].ur}`); }
  }
  function renderQuoteSelection() {
    quoteDesignIds = validIds(quoteDesignIds);
    const en = [], ur = [];
    if (quoteDesignIds.length) {
      en.push(`${text('selected', 'en')}: ${quoteDesignIds.map((id) => productMap.get(id).title.en).join(', ')}`);
      ur.push(`${text('selected', 'ur')}: ${quoteDesignIds.map((id) => productMap.get(id).title.ur).join('، ')}`);
    }
    if (quoteStudio) { en.push(`${text('studioBrief', 'en')}: ${studioText(quoteStudio, 'en')}`); ur.push(`${text('studioBrief', 'ur')}: ${studioText(quoteStudio, 'ur')}`); }
    setBi('quote-selection', en.length ? en.join('\n') : text('noSelection', 'en'), ur.length ? ur.join('\n') : text('noSelection', 'ur'));
  }
  function setQuoteStatus(key) {
    if ($('quote-status')) $('quote-status').innerHTML = key ? textPair(key) : '';
  }
  function invalidateQuote() {
    if (!preparedSnapshot) return;
    preparedSnapshot = null; preparedText = '';
    if ($('quote-preview')) $('quote-preview').hidden = true;
    $('quote-wa')?.removeAttribute('href');
    setQuoteStatus('inquiryChanged');
  }
  function openQuote({ project, productId, studio, source, message } = {}) {
    quoteDesignIds = validIds([...savedIds, ...(productId ? [productId] : [])]);
    quoteStudio = studio ? { ...studio } : null;
    const product = productMap.get(productId);
    const nextProject = project || product?.category || studio?.project;
    if ($('quote-project') && Object.hasOwn(categories, nextProject)) $('quote-project').value = nextProject;
    const prompt = String(message || source?.dataset.quoteMessage || '').trim();
    const field = $('quote-message');
    if (field && prompt && !field.value.includes(prompt)) field.value = field.value.trim() ? `${field.value.trim()}\n\n${prompt}` : prompt;
    renderQuoteSelection(); invalidateQuote();
    openDialog($('quote-dialog'), source || document.activeElement);
    if ($('quote-dialog')) $('quote-dialog').scrollTop = 0;
    $('quote-name')?.focus({ preventScroll: true });
  }
  window.SF_OPEN_QUOTE = openQuote;
  function buildQuote(snapshot) {
    return [
      `${text('brand', 'en')} / ${text('brand', 'ur')}`, 'PROJECT INQUIRY / کام کی تفصیل', '',
      `Name / نام: ${snapshot.name}`, `Phone / فون: \u2066${snapshot.phone}\u2069`, `City / شہر: ${snapshot.city || 'Not specified / درج نہیں کیا گیا'}`,
      `Project / کام کی نوعیت: ${categories[snapshot.project]?.en || snapshot.project} / ${categories[snapshot.project]?.ur || snapshot.project}`,
      ...(snapshot.designIds.length ? ['', 'Selected designs / منتخب ڈیزائن:', ...snapshot.designIds.map((id) => `${productMap.get(id).title.en} / ${productMap.get(id).title.ur}`)] : []),
      ...(snapshot.studio ? ['', 'Your design direction / آپ کی پسند کی تفصیل:', studioText(snapshot.studio, 'en'), studioText(snapshot.studio, 'ur')] : []),
      '', 'Project details / آپ کے کام کی تفصیل:', snapshot.message, '', text('orderNote', 'en'), text('orderNote', 'ur'),
    ].join('\n');
  }
  function renderPreparedQuote() {
    if (!preparedSnapshot) return;
    preparedText = buildQuote(preparedSnapshot);
    if ($('quote-summary')) { $('quote-summary').textContent = preparedText; $('quote-summary').dir = 'ltr'; }
    if ($('quote-preview')) $('quote-preview').hidden = false;
    const link = $('quote-wa');
    if (link) {
      link.target = '_blank'; link.rel = 'noopener noreferrer';
      if (validWhatsApp) { link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(preparedText)}`; link.removeAttribute('aria-disabled'); }
      else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
    }
    setQuoteStatus(validWhatsApp ? 'inquiryReady' : 'missingWhatsApp');
  }

  const quoteForm = $('quote-form');
  const fields = () => quoteForm ? [...quoteForm.querySelectorAll('input, select, textarea')].filter((field) => field.willValidate) : [];
  function validationText(key, count) {
    const en = text(key, 'en').replace('{count}', String(count));
    const ur = text(key, 'ur').replace('{count}', localizedNumber(count));
    return pairText(en, ur);
  }
  function fieldMessage(field) {
    const value = field.value.trim();
    if (field.required && !value) return validationText(({ 'quote-name': 'requiredName', 'quote-phone': 'requiredPhone', 'quote-project': 'requiredProject', 'quote-message': 'requiredMessage' })[field.id] || 'required');
    if (field.id === 'quote-phone' && value) {
      const digits = latinNumber(value).replace(/\D/g, '');
      if (!/^\+?[0-9 ()-]+$/.test(latinNumber(value)) || digits.length < 7 || digits.length > 15) return validationText('invalidPhone');
    }
    if (value && field.minLength > 0 && value.length < field.minLength) return validationText('minimum', field.minLength);
    if (field.maxLength > 0 && value.length > field.maxLength) return validationText('maximum', field.maxLength);
    if (field.validity.patternMismatch || field.validity.typeMismatch) return validationText(field.id === 'quote-phone' ? 'invalidPhone' : 'checkFields');
    if (field.validity.valueMissing) return validationText('required');
    return '';
  }
  function refreshFieldError(field) {
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
    field.setCustomValidity(''); field.setCustomValidity(fieldMessage(field));
  }
  quoteForm?.addEventListener('invalid', (event) => { refreshFieldError(event.target); setQuoteStatus('checkFields'); }, true);
  quoteForm?.addEventListener('input', (event) => {
    if (event.target.id === 'quote-phone') event.target.value = latinNumber(event.target.value);
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
    invalidateQuote();
  });
  quoteForm?.addEventListener('change', invalidateQuote);
  quoteForm?.addEventListener('reset', () => { fields().forEach((field) => field.setCustomValidity('')); invalidateQuote(); });
  quoteForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    ['quote-name', 'quote-phone', 'quote-city', 'quote-message'].forEach((id) => { if ($(id)) $(id).value = $(id).value.trim(); });
    if ($('quote-phone')) $('quote-phone').value = latinNumber($('quote-phone').value);
    fields().forEach(refreshFieldError);
    if (!quoteForm.reportValidity()) { setQuoteStatus('checkFields'); return; }
    const data = new FormData(quoteForm), value = (name) => String(data.get(name) || '').trim();
    preparedSnapshot = { name: value('name'), phone: value('phone'), city: value('city'), project: value('project'), message: value('message'), designIds: [...quoteDesignIds], studio: quoteStudio ? { ...quoteStudio } : null };
    renderPreparedQuote();
    $('quote-preview')?.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
  });
  if ($('quote-phone')) { $('quote-phone').dir = 'ltr'; $('quote-phone').inputMode = 'tel'; }
  ['quote-name', 'quote-city', 'quote-message'].forEach((id) => { if ($(id)) $(id).dir = 'auto'; });
  function fallbackCopy(value) {
    const field = document.createElement('textarea');
    field.value = value; field.setAttribute('readonly', ''); field.setAttribute('aria-label', 'Project inquiry / کام کی تفصیل');
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
  document.querySelectorAll('[data-wa]').forEach((link) => {
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    if (validWhatsApp) { link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(pairText(text('whatsappMessage', 'en'), text('whatsappMessage', 'ur')))}`; link.removeAttribute('aria-disabled'); }
    else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
  });

  const galleryProducts = ['chiniot-bed', 'carved-dining', 'baithak-seating', 'wooden-charpai', 'entrance-door', 'carved-console'];
  let galleryIndex = 0;
  function renderGallery() {
    const product = productMap.get(galleryProducts[galleryIndex]);
    if ($('gallery-image')) { $('gallery-image').src = config.galleryImages?.[galleryIndex] || imageFor(product); $('gallery-image').alt = imageAlt(product); }
    setBi('gallery-title', product.title.en, product.title.ur);
    setBi('gallery-caption', text('galleryCaption', 'en'), text('galleryCaption', 'ur'));
    const position = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryProducts.length).padStart(2, '0')}`;
    setBi('gallery-index', position, localizedNumber(position));
    document.querySelectorAll('#gallery-dots button').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === galleryIndex));
      button.setAttribute('aria-label', `Show design ${index + 1}: ${productMap.get(galleryProducts[index]).title.en} / ${productMap.get(galleryProducts[index]).title.ur} — تصویر دیکھیں`);
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
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  let swipe = null;
  galleryStage?.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('button, a')) return;
    swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  galleryStage?.addEventListener('pointerup', (event) => {
    if (!swipe || swipe.id !== event.pointerId) return;
    const x = event.clientX - swipe.x, y = event.clientY - swipe.y; swipe = null;
    if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.4) showGallery(galleryIndex + (x < 0 ? 1 : -1));
  });
  galleryStage?.addEventListener('pointercancel', () => { swipe = null; });

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const closer = target?.closest('[data-close-dialog]');
    if (closer) { event.preventDefault(); closeDialog(closer.closest('dialog')); return; }
    const save = target?.closest('.save-design[data-id]');
    if (save) { event.preventDefault(); toggleSaved(save.dataset.id); return; }
    const product = target?.closest('.product-open[data-id]');
    if (product) { event.preventDefault(); showDesign(product.dataset.id, product); return; }
    const remove = target?.closest('.saved-remove[data-id]');
    if (remove) { event.preventDefault(); toggleSaved(remove.dataset.id); ($('saved-items')?.querySelector('.saved-remove') || $('saved-dialog')?.querySelector('[data-close-dialog]'))?.focus(); return; }
    const saved = target?.closest('.saved-open');
    if (saved) { event.preventDefault(); renderSaved(); openDialog($('saved-dialog'), saved); return; }
    const quote = target?.closest('[data-quote-open]');
    if (quote) { event.preventDefault(); closeMenu(); openQuote({ project: quote.dataset.project, source: quote }); return; }
    const shop = target?.closest('[data-shop-category]');
    if (shop) {
      const category = shop.dataset.shopCategory;
      if (Object.hasOwn(categories, category)) { activeCategory = category; if ($('design-search')) $('design-search').value = ''; renderCatalogue(); closeMenu(); }
      return;
    }
    const filter = target?.closest('button[data-category]');
    if (filter && (filter.dataset.category === 'all' || Object.hasOwn(categories, filter.dataset.category))) { activeCategory = filter.dataset.category; renderCatalogue(); }
  });
  $('design-search')?.addEventListener('input', renderCatalogue);
  $('design-sort')?.addEventListener('change', renderCatalogue);
  $('detail-save')?.addEventListener('click', () => { if (selectedDesign) toggleSaved(selectedDesign.id); });
  $('detail-inquire')?.addEventListener('click', () => { if (selectedDesign) openQuote({ productId: selectedDesign.id, source: $('detail-inquire') }); });
  $('saved-inquire')?.addEventListener('click', () => openQuote({ source: $('saved-inquire') }));
  $('saved-clear')?.addEventListener('click', () => { savedIds = []; persistSaved(); showToast('toastCleared'); $('saved-dialog')?.querySelector('[data-close-dialog]')?.focus(); });
  $('studio-form')?.addEventListener('input', updateStudio);
  $('studio-form')?.addEventListener('change', updateStudio);
  $('studio-form')?.addEventListener('submit', (event) => event.preventDefault());
  $('studio-inquire')?.addEventListener('click', (event) => { event.preventDefault(); openQuote({ studio: studioState(), source: event.currentTarget }); });
  window.addEventListener('storage', (event) => {
    if (event.key !== shortlistKey) return;
    try { savedIds = validIds(JSON.parse(event.newValue || '[]')); } catch { savedIds = []; }
    renderSaved();
  });

  const menu = $('menu-toggle'), navigation = $('site-nav');
  function closeMenu() { navigation?.classList.remove('is-open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', 'Open navigation / مینو کھولیں'); }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation / مینو بند کریں' : 'Open navigation / مینو کھولیں'); navigation?.classList.toggle('is-open', open);
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', (event) => { if (menu?.getAttribute('aria-expanded') === 'true' && !menu.contains(event.target) && !navigation?.contains(event.target)) closeMenu(); });
  $('search-jump')?.addEventListener('click', () => { closeMenu(); ($('collection') || $('design-grid'))?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' }); $('design-search')?.focus({ preventScroll: true }); });
  let scrollQueued = false;
  function updateScroll() { $('site-header')?.classList.toggle('is-scrolled', window.scrollY > 20); scrollQueued = false; }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScroll); } }, { passive: true });
  document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => item.addEventListener('toggle', () => { if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; }); }));
  document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr';
  renderCatalogue(); renderSaved(); updateStudio(); renderGallery(); renderQuoteSelection(); updateScroll();
  document.documentElement.classList.add('js-ready');
})();
