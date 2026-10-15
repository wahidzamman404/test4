/* Bilingual demonstration profiles and browser-session reviews. */
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

  const isUrdu = () => window.SF_LANG !== 'en';
  const tr = (english, urdu) => isUrdu() ? urdu : english;
  const number = (value) => isUrdu() ? String(value).replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]) : String(value);

  const profiles = [
    {
      id: 'designer',
      title: { en: 'Design consultant', ur: 'ڈیزائن مشیر' },
      role: { en: 'Ideas & room planning', ur: 'خیالات اور جگہ کی منصوبہ بندی' },
      description: {
        en: 'Talk through your room, preferred style, and the furniture proportions that make your space work beautifully.',
        ur: 'اپنے کمرے، پسندیدہ انداز اور فرنیچر کے مناسب سائز پر بات کریں، تاکہ ہر چیز آپ کی جگہ کے مطابق ہو۔',
      },
      action: { en: 'Discuss your design', ur: 'اپنے ڈیزائن پر بات کریں' },
      image: 'assets/staff-designer.jpg',
      inquiry: {
        en: 'I would like to speak with your design consultant about my furniture project. My idea is: ',
        ur: 'میں اپنے فرنیچر کے منصوبے کے بارے میں آپ کے ڈیزائن مشیر سے بات کرنا چاہتا/چاہتی ہوں۔ میرا خیال یہ ہے: ',
      },
    },
    {
      id: 'maker',
      title: { en: 'Workshop specialist', ur: 'کاریگر' },
      role: { en: 'Materials & craftsmanship', ur: 'لکڑی اور کاریگری کی تفصیلات' },
      description: {
        en: 'Explore timber choices, construction details, and finishes before deciding on the right direction for your piece.',
        ur: 'اپنی پسند کا فرنیچر طے کرنے سے پہلے لکڑی، بناوٹ، جوڑوں اور پالش کی تفصیلات سمجھیں۔',
      },
      action: { en: 'Ask about the details', ur: 'کاریگری کے بارے میں پوچھیں' },
      image: 'assets/staff-maker.jpg',
      inquiry: {
        en: 'I would like to speak with your workshop specialist about materials, construction, and finishes. My question is: ',
        ur: 'میں لکڑی، بناوٹ اور پالش کے بارے میں آپ کے کاریگر سے بات کرنا چاہتا/چاہتی ہوں۔ میرا سوال یہ ہے: ',
      },
    },
    {
      id: 'coordinator',
      title: { en: 'Project coordinator', ur: 'پروجیکٹ کوآرڈینیٹر' },
      role: { en: 'Your project, clearly planned', ur: 'آپ کے کام کی واضح منصوبہ بندی' },
      description: {
        en: 'Prepare measurements, discuss your requirements, and understand the next steps for a made-to-order furniture project.',
        ur: 'ناپ اور ضروریات تیار کریں، اپنے کام کی تفصیل بتائیں اور آرڈر پر بننے والے فرنیچر کے اگلے مراحل سمجھیں۔',
      },
      action: { en: 'Plan your project', ur: 'اپنے کام کی منصوبہ بندی کریں' },
      image: 'assets/staff-support.jpg',
      inquiry: {
        en: 'I would like to speak with your project coordinator about planning a furniture project. My requirements are: ',
        ur: 'میں فرنیچر کے کام کی منصوبہ بندی کے لیے آپ کے پروجیکٹ کوآرڈینیٹر سے بات کرنا چاہتا/چاہتی ہوں۔ میری ضروریات یہ ہیں: ',
      },
    },
  ];

  const sampleReviews = [
    {
      name: 'A. K.', initials: 'AK', rating: 5,
      city: { en: 'Lahore', ur: 'لاہور' },
      text: {
        en: 'Seeing the different wood tones and designs together made it much easier to imagine the right furniture for our home.',
        ur: 'لکڑی کے مختلف رنگ اور ڈیزائن ایک ساتھ دیکھ کر یہ سمجھنا آسان ہو گیا کہ ہمارے گھر کے لیے کون سا فرنیچر مناسب ہوگا۔',
      },
      sample: true,
    },
    {
      name: 'M. A.', initials: 'MA', rating: 4,
      city: { en: 'Islamabad', ur: 'اسلام آباد' },
      text: {
        en: 'I liked being able to shortlist a few ideas and include the details in one clear project inquiry. A very helpful starting point.',
        ur: 'چند پسندیدہ ڈیزائن محفوظ کر کے ایک ہی پیغام میں اپنی ضروریات لکھنا اچھا لگا۔ کام شروع کرنے کا یہ طریقہ بہت مددگار ہے۔',
      },
      sample: true,
    },
    {
      name: 'S. R.', initials: 'SR', rating: 5,
      city: { en: 'Karachi', ur: 'کراچی' },
      text: {
        en: 'The balance of simple modern shapes and warm wooden details feels right for a Pakistani family home.',
        ur: 'سادہ جدید انداز اور لکڑی کی گرمجوشی کا امتزاج پاکستانی گھر کے لیے بہت موزوں محسوس ہوتا ہے۔',
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

  function localize(value) {
    return typeof value === 'string' ? value : tr(value.en, value.ur);
  }

  function createProfile(profile) {
    const card = element('article', 'team-card');
    const photo = element('div', 'team-photo');
    const image = element('img');
    image.src = profile.image;
    image.alt = tr(`Illustrative ${profile.title.en.toLowerCase()} portrait`, `${profile.title.ur} کی مثالی تصویر`);
    image.loading = 'lazy';
    image.decoding = 'async';
    image.width = 720;
    image.height = 900;
    photo.append(image, element('span', 'demo-tag', tr('Demo profile', 'نمونہ پروفائل')));

    const content = element('div', 'team-content');
    content.append(
      element('p', 'team-role', localize(profile.role)),
      element('h3', 'team-title', localize(profile.title)),
      element('p', 'team-description', localize(profile.description)),
    );
    const contact = element('button', 'team-contact', localize(profile.action));
    contact.type = 'button';
    contact.dataset.quoteOpen = '';
    contact.dataset.teamRole = profile.id;
    contact.dataset.quoteMessage = localize(profile.inquiry);
    contact.dataset.enQuoteMessage = profile.inquiry.en;
    contact.dataset.urQuoteMessage = profile.inquiry.ur;
    contact.setAttribute('aria-haspopup', 'dialog');
    const arrow = icon('i-arrow');
    arrow.classList.add('directional');
    contact.append(arrow);
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
    stars.setAttribute('aria-label', tr(`${review.rating} out of 5 stars`, `۵ میں سے ${number(review.rating)} ستارے`));
    for (let index = 0; index < 5; index += 1) {
      const star = icon('i-star');
      star.style.fill = index < review.rating ? 'currentColor' : 'none';
      stars.append(star);
    }
    const badge = element('span', 'demo-tag', review.sample ? tr('Sample review', 'نمونہ تبصرہ') : tr('On this device', 'اسی ڈیوائس پر'));

    const text = element('blockquote', 'review-text', localize(review.text));
    const author = element('div', 'review-author');
    const initials = element('span', 'review-initials', review.initials || initialsFor(review.name));
    initials.setAttribute('aria-hidden', 'true');
    initials.dir = 'auto';
    const person = element('div', 'review-person');
    const name = element('strong', 'review-name', review.name);
    name.dir = 'auto';
    person.append(name);
    const cityText = localize(review.city);
    if (cityText) {
      const city = element('span', 'review-city', cityText);
      city.dir = 'auto';
      person.append(city);
    }
    if (!review.sample) text.dir = 'auto';
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
      counter.textContent = tr(`${currentIndex + 1} / ${cards.length}`, `${number(currentIndex + 1)} / ${number(cards.length)}`);
      counter.setAttribute('aria-label', tr(`Review ${currentIndex + 1} of ${cards.length}`, `کل ${number(cards.length)} میں سے تبصرہ ${number(currentIndex + 1)}`));
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
    status.textContent = hasSubmitted
      ? tr('Your review was added to this browser session. It has not been posted publicly.', 'آپ کا تبصرہ اسی براؤزر سیشن میں شامل ہو گیا ہے۔ اسے عوامی طور پر شائع نہیں کیا گیا۔')
      : tr('Sample reviews show the layout. They are not verified customer testimonials.', 'یہ نمونہ تبصرے صرف ویب سائٹ کا انداز دکھاتے ہیں؛ یہ تصدیق شدہ صارفین کے تبصرے نہیں ہیں۔');
  }

  function renderReviews() {
    if (!reviewTrack) return;
    reviewTrack.replaceChildren(...[...sessionReviews, ...sampleReviews].map(createReview));
    // Both LTR and RTL tracks begin at scrollLeft 0. Navigation itself uses
    // scrollIntoView, so it does not depend on browsers' RTL scroll conventions.
    reviewTrack.scrollTo({ left: 0, behavior: 'instant' });
    currentIndex = 0;
    scheduleReviewUpdate();
    updateReviewStatus();
  }

  function renderLocalizedContent() {
    const focusedRole = document.activeElement?.closest?.('[data-team-role]')?.dataset.teamRole;
    if (teamGrid) teamGrid.replaceChildren(...profiles.map(createProfile));
    if (focusedRole) teamGrid?.querySelector(`[data-team-role="${focusedRole}"]`)?.focus({ preventScroll: true });
    renderReviews();
    if (reviewForm) {
      for (const field of [reviewName, reviewRating, reviewMessage]) {
        if (field?.validity.customError) field.setCustomValidity(validationMessage(field));
      }
    }
    const status = document.querySelector('#review-status');
    if (status) status.textContent = '';
  }

  function validationMessage(field) {
    if (field === reviewName && !field.value.trim()) return tr('Please enter your name.', 'براہِ کرم اپنا نام لکھیں۔');
    if (field === reviewMessage && field.value.trim().length < 20) return tr('Please write at least 20 characters about your experience.', 'براہِ کرم اپنے تجربے کے بارے میں کم از کم ۲۰ حروف لکھیں۔');
    if (field === reviewRating && !/^[1-5]$/.test(field.value)) return tr('Please choose a rating from 1 to 5.', 'براہِ کرم ۱ سے ۵ تک درجہ بندی منتخب کریں۔');
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
    const field = event.target;
    if (typeof field.setCustomValidity === 'function') field.setCustomValidity(validationMessage(field));
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
  document.addEventListener('languagechange', event => {
    const language = event.detail?.language;
    if (language === 'en' || language === 'ur') window.SF_LANG = language;
    renderLocalizedContent();
  });
  renderLocalizedContent();
})();
