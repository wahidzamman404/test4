/* Staff profiles and safe, browser-session reviews in English and Urdu together. */
(() => {
  'use strict';

  const teamGrid = document.querySelector('#team-grid');
  const reviewTrack = document.querySelector('#reviews-track');
  const previousButton = document.querySelector('#reviews-prev');
  const nextButton = document.querySelector('#reviews-next');
  const counter = document.querySelector('#reviews-index');
  const reviewDialog = document.querySelector('#review-dialog');
  const reviewForm = document.querySelector('#review-form');
  const reviewOpen = document.querySelector('#review-open');
  const reviewName = document.querySelector('#review-name');
  const reviewCity = document.querySelector('#review-city');
  const reviewRating = document.querySelector('#review-rating');
  const reviewMessage = document.querySelector('#review-message');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sessionReviews = [];
  let currentIndex = 0;
  let pendingFrame = 0;
  let hasSubmitted = false;

  const profiles = [
    {
      id: 'designer',
      title: { en: 'Furniture design adviser', ur: 'فرنیچر ڈیزائن مشیر' },
      role: { en: 'Your room. Your family. Your style.', ur: 'آپ کا کمرہ، آپ کی پسند' },
      description: {
        en: 'Plan a family baithak, a carved Chinioti bed, or a dining set around your room and the way your family uses it.',
        ur: 'گھر کی بیٹھک، چنیوٹی نقش دار پلنگ یا ڈائننگ سیٹ اپنے کمرے اور گھر والوں کی ضرورت کے مطابق بنوانے پر بات کریں۔',
      },
      action: { en: 'Discuss your design', ur: 'اپنے ڈیزائن پر بات کریں' },
      image: 'assets/staff-designer.jpg',
      inquiry: {
        en: 'I would like to speak with your furniture design adviser about my room and preferred furniture style. My idea is:',
        ur: 'میں اپنے کمرے اور پسندیدہ فرنیچر کے بارے میں آپ کے ڈیزائن مشیر سے بات کرنا چاہتا/چاہتی ہوں۔ میرا خیال یہ ہے:',
      },
    },
    {
      id: 'maker',
      title: { en: 'Workshop specialist', ur: 'لکڑی اور کاریگری کے ماہر' },
      role: { en: 'Sheesham. Carving. The right finish.', ur: 'شیشم، نقش و نگار اور پسند کی پالش' },
      description: {
        en: 'Discuss sheesham grain, carved details, charpai frames, joinery, and the polish that suits your furniture.',
        ur: 'شیشم کی لکڑی، نقش و نگار، چارپائی کے فریم، مضبوط جوڑوں اور فرنیچر کے لیے مناسب پالش کی تفصیلات سمجھیں۔',
      },
      action: { en: 'Ask about the woodwork', ur: 'کاریگری کے بارے میں پوچھیں' },
      image: 'assets/staff-maker.jpg',
      inquiry: {
        en: 'I would like to discuss timber, carving, construction, and polish with your workshop specialist. My question is:',
        ur: 'میں لکڑی، نقش و نگار، بناوٹ اور پالش کے بارے میں آپ کے ماہر کاریگر سے بات کرنا چاہتا/چاہتی ہوں۔ میرا سوال یہ ہے:',
      },
    },
    {
      id: 'coordinator',
      title: { en: 'Project coordinator', ur: 'آپ کے کام کی رہنمائی' },
      role: { en: 'From one piece to a complete home.', ur: 'ایک خاص چیز سے پورے گھر تک' },
      description: {
        en: 'Organize sizes, quantities, a budget in PKR, and your delivery or fitting requirements before a furniture order.',
        ur: 'آرڈر سے پہلے سائز، تعداد، پاکستانی روپے میں بجٹ، ترسیل اور فٹنگ کی ضروریات پر واضح بات کریں۔',
      },
      action: { en: 'Plan your project', ur: 'اپنے کام کی منصوبہ بندی کریں' },
      image: 'assets/staff-support.jpg',
      inquiry: {
        en: 'I would like help planning the sizes, quantities, budget, and delivery requirements for my furniture project. My requirements are:',
        ur: 'میں اپنے فرنیچر کے کام کے سائز، تعداد، بجٹ اور ترسیل کی منصوبہ بندی کے لیے رہنمائی چاہتا/چاہتی ہوں۔ میری ضروریات یہ ہیں:',
      },
    },
  ];

  const sampleReviews = [
    {
      name: 'A. K.', initials: 'AK', rating: 5,
      city: { en: 'Lahore', ur: 'لاہور' },
      text: {
        en: 'The carved bedroom designs helped us picture a Chinioti-style bed in our own room. Having the wood and polish details together was useful.',
        ur: 'نقش دار بیڈروم ڈیزائن دیکھ کر اپنے کمرے کے لیے چنیوٹی انداز کا پلنگ سوچنا آسان ہو گیا۔ لکڑی اور پالش کی تفصیلات ایک ساتھ دیکھنا اچھا لگا۔',
      },
      sample: true,
    },
    {
      name: 'M. A.', initials: 'MA', rating: 4,
      city: { en: 'Islamabad', ur: 'اسلام آباد' },
      text: {
        en: 'I could save a few baithak and dining ideas, then put our measurements and budget into one clear inquiry.',
        ur: 'بیٹھک اور ڈائننگ کے چند پسندیدہ ڈیزائن محفوظ کر کے اپنے ناپ اور بجٹ کی تفصیل ایک ہی درخواست میں لکھ سکا۔',
      },
      sample: true,
    },
    {
      name: 'S. R.', initials: 'SR', rating: 5,
      city: { en: 'Karachi', ur: 'کراچی' },
      text: {
        en: 'The traditional woodwork feels familiar to a Pakistani home. The design gallery is a good place to start a conversation with the family.',
        ur: 'روایتی لکڑی کا کام پاکستانی گھر کا اپنا سا احساس دیتا ہے۔ گھر والوں کے ساتھ ڈیزائن پسند کرنے کی شروعات کے لیے یہ گیلری اچھی ہے۔',
      },
      sample: true,
    },
  ];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function bilingual(tag, className, english, urdu) {
    const wrapper = element(tag, className);
    const en = element('span', 'bi-en', english);
    en.lang = 'en';
    en.dir = 'ltr';
    const ur = element('span', 'bi-ur', urdu);
    ur.lang = 'ur';
    ur.dir = 'rtl';
    wrapper.append(en, ur);
    return wrapper;
  }

  function icon(id) {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    const use = document.createElementNS(namespace, 'use');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  }

  function createProfile(profile) {
    const card = element('article', 'team-card');
    const photo = element('div', 'team-photo');
    const image = element('img');
    image.src = profile.image;
    image.alt = `${profile.title.en}, illustrative profile — ${profile.title.ur} کی مثالی تصویر`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 720;
    image.height = 900;
    photo.append(image, bilingual('span', 'demo-tag', 'Demo profile', 'نمونہ پروفائل'));

    const content = element('div', 'team-content');
    content.append(
      bilingual('p', 'team-role', profile.role.en, profile.role.ur),
      bilingual('h3', 'team-title', profile.title.en, profile.title.ur),
      bilingual('p', 'team-description', profile.description.en, profile.description.ur),
    );
    const contact = element('button', 'team-contact');
    contact.type = 'button';
    contact.dataset.quoteOpen = '';
    contact.dataset.teamRole = profile.id;
    contact.dataset.quoteMessage = `${profile.inquiry.en}\n${profile.inquiry.ur}`;
    contact.setAttribute('aria-haspopup', 'dialog');
    contact.append(bilingual('span', 'team-contact-label', profile.action.en, profile.action.ur), icon('i-arrow'));
    content.append(contact);
    card.append(photo, content);
    return card;
  }

  function initialsFor(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0] || '').join('').toLocaleUpperCase();
  }

  function createReview(review) {
    const card = element('article', 'review-card');
    const stars = element('div', 'review-stars');
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `${review.rating} out of 5 stars — ۵ میں سے ${review.rating} ستارے`);
    for (let index = 0; index < 5; index += 1) {
      const star = icon('i-star');
      star.style.fill = index < review.rating ? 'currentColor' : 'none';
      stars.append(star);
    }
    const badge = review.sample
      ? bilingual('span', 'demo-tag', 'Sample review', 'نمونہ تبصرہ')
      : bilingual('span', 'demo-tag', 'On this device', 'اسی ڈیوائس پر');

    let text;
    if (review.sample) text = bilingual('blockquote', 'review-text', review.text.en, review.text.ur);
    else {
      text = element('blockquote', 'review-text');
      const typed = element('span', /[\u0600-\u06ff]/.test(review.text) ? 'bi-ur user-review-text' : 'bi-en user-review-text', review.text);
      typed.dir = 'auto';
      if (/[\u0600-\u06ff]/.test(review.text)) typed.lang = 'ur';
      text.append(typed);
    }

    const author = element('div', 'review-author');
    const initials = element('span', 'review-initials', review.initials || initialsFor(review.name));
    initials.setAttribute('aria-hidden', 'true');
    initials.dir = 'auto';
    const person = element('div', 'review-person');
    const name = element('strong', 'review-name', review.name);
    name.dir = 'auto';
    person.append(name);
    if (review.sample) person.append(bilingual('span', 'review-city', review.city.en, review.city.ur));
    else if (review.city) {
      const city = element('span', 'review-city', review.city);
      city.dir = 'auto';
      person.append(city);
    }
    author.append(initials, person);
    card.append(stars, badge, text, author);
    return card;
  }

  function updateReviewControls() {
    pendingFrame = 0;
    if (!reviewTrack) return;
    const cards = Array.from(reviewTrack.querySelectorAll('.review-card'));
    const trackBounds = reviewTrack.getBoundingClientRect();
    const rtl = getComputedStyle(reviewTrack).direction === 'rtl';
    const first = cards[0]?.getBoundingClientRect();
    const last = cards.at(-1)?.getBoundingClientRect();
    const start = rtl ? trackBounds.right : trackBounds.left;
    let nearest = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const bounds = card.getBoundingClientRect();
      const distance = Math.abs((rtl ? bounds.right : bounds.left) - start);
      if (distance < nearest) {
        nearest = distance;
        currentIndex = index;
      }
    });
    const previousAvailable = first && (rtl ? first.right > trackBounds.right + 3 : first.left < trackBounds.left - 3);
    const nextAvailable = last && (rtl ? last.left < trackBounds.left - 3 : last.right > trackBounds.right + 3);
    if (previousButton) previousButton.disabled = !previousAvailable;
    if (nextButton) nextButton.disabled = !nextAvailable;
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${cards.length}`;
      counter.setAttribute('aria-label', `Review ${currentIndex + 1} of ${cards.length} — کل ${cards.length} میں سے تبصرہ ${currentIndex + 1}`);
    }
  }

  function scheduleReviewUpdate() {
    if (!pendingFrame) pendingFrame = window.requestAnimationFrame(updateReviewControls);
  }

  function moveReview(direction) {
    if (!reviewTrack) return;
    updateReviewControls();
    const cards = Array.from(reviewTrack.querySelectorAll('.review-card'));
    const index = Math.max(0, Math.min(cards.length - 1, currentIndex + direction));
    cards[index]?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    scheduleReviewUpdate();
  }

  function updateReviewStatus() {
    const status = document.querySelector('#reviews-status');
    if (!status) return;
    status.setAttribute('role', 'status');
    const message = hasSubmitted
      ? bilingual('span', 'review-status-copy', 'Your review was added to this browser session. It has not been posted publicly.', 'آپ کا تبصرہ اسی براؤزر سیشن میں شامل ہو گیا ہے۔ اسے عوامی طور پر شائع نہیں کیا گیا۔')
      : bilingual('span', 'review-status-copy', 'Sample reviews demonstrate the layout. They are not verified customer testimonials.', 'یہ نمونہ تبصرے صرف ویب سائٹ کا انداز دکھاتے ہیں؛ یہ تصدیق شدہ صارفین کے تبصرے نہیں ہیں۔');
    status.replaceChildren(message);
  }

  function renderReviews() {
    if (!reviewTrack) return;
    reviewTrack.replaceChildren(...[...sessionReviews, ...sampleReviews].map(createReview));
    reviewTrack.scrollTo({ left: 0, behavior: 'instant' });
    currentIndex = 0;
    scheduleReviewUpdate();
    updateReviewStatus();
  }

  function validationMessage(field) {
    if (field === reviewName && !field.value.trim()) return 'Please enter your name.\nبراہِ کرم اپنا نام لکھیں۔';
    if (field === reviewMessage && field.value.trim().length < 20) return 'Please write at least 20 characters about your experience.\nبراہِ کرم اپنے تجربے کے بارے میں کم از کم ۲۰ حروف لکھیں۔';
    if (field === reviewRating && !/^[1-5]$/.test(field.value)) return 'Please choose a rating from 1 to 5.\nبراہِ کرم ۱ سے ۵ تک درجہ بندی منتخب کریں۔';
    return '';
  }

  reviewOpen?.addEventListener('click', () => {
    const status = document.querySelector('#review-status');
    if (status) status.textContent = '';
    if (reviewDialog && !reviewDialog.open) {
      reviewDialog.showModal();
      document.documentElement.classList.add('dialog-open');
      reviewName?.focus({ preventScroll: true });
    }
  });

  reviewForm?.addEventListener('invalid', event => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity(validationMessage(event.target));
  }, true);

  reviewForm?.addEventListener('input', event => {
    if (typeof event.target.setCustomValidity === 'function') event.target.setCustomValidity('');
  });

  reviewForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!reviewName || !reviewRating || !reviewMessage || !reviewTrack) return;
    for (const field of [reviewName, reviewRating, reviewMessage]) field.setCustomValidity(validationMessage(field));
    if (!reviewForm.reportValidity()) return;

    sessionReviews.unshift({
      name: reviewName.value.trim(),
      city: reviewCity?.value.trim() || '',
      rating: Number(reviewRating.value),
      text: reviewMessage.value.trim(),
      sample: false,
    });
    hasSubmitted = true;
    renderReviews();
    reviewForm.reset();
    reviewDialog?.close();
    reviewOpen?.focus({ preventScroll: true });
  });

  previousButton?.addEventListener('click', () => moveReview(-1));
  nextButton?.addEventListener('click', () => moveReview(1));
  reviewTrack?.addEventListener('scroll', scheduleReviewUpdate, { passive: true });
  reviewTrack?.addEventListener('keydown', event => {
    if (event.target !== reviewTrack || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') {
      const cards = reviewTrack.querySelectorAll('.review-card');
      const card = event.key === 'Home' ? cards[0] : cards[cards.length - 1];
      card?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
      scheduleReviewUpdate();
    } else {
      const rtl = getComputedStyle(reviewTrack).direction === 'rtl';
      moveReview((event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1));
    }
  });
  if (reviewTrack && 'ResizeObserver' in window) new ResizeObserver(scheduleReviewUpdate).observe(reviewTrack);
  window.addEventListener('resize', scheduleReviewUpdate, { passive: true });
  document.fonts?.ready.then(scheduleReviewUpdate);

  if (teamGrid) teamGrid.replaceChildren(...profiles.map(createProfile));
  renderReviews();
})();
