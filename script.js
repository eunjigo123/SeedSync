const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header + mobile navigation */
const header = $('#header');
const menuButton = $('#menuButton');
const mobileNav = $('#mobileNav');
const scrollProgress = $('#scrollProgress');

const closeMenu = () => {
  mobileNav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = 'MENU';
};

menuButton?.addEventListener('click', () => {
  const open = !mobileNav?.classList.contains('open');
  mobileNav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'CLOSE' : 'MENU';
});
$$('.mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));

const syncScrollUI = () => {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 24);
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if (scrollProgress) scrollProgress.style.width = `${Math.min(100, Math.max(0, y / max * 100))}%`;

  if (!reduceMotion) {
    const hero = $('#hero');
    const product = $('#heroProduct');
    if (hero && product) {
      const rect = hero.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, hero.offsetHeight)));
      const machine = $('.machine-svg', product);
      if (machine) {
        machine.style.setProperty('--hero-y', `${progress * -34}px`);
        machine.style.setProperty('--hero-scale', String(1 - progress * 0.035));
      }
    }
  }
};
window.addEventListener('scroll', () => requestAnimationFrame(syncScrollUI), { passive: true });
window.addEventListener('resize', syncScrollUI);
syncScrollUI();

/* Reveal only supports the story. It no longer defines the story. */
if (reduceMotion) {
  $$('.reveal').forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));
}

/* Products: one choice gets visual priority, without moving DOM. */
const productSplit = $('#productSplit');
$$('[data-product-choice]').forEach((choice) => {
  const activate = () => productSplit?.setAttribute('data-active', choice.dataset.productChoice || '');
  choice.addEventListener('pointerenter', activate);
  choice.addEventListener('focusin', activate);
});
productSplit?.addEventListener('pointerleave', () => productSplit.removeAttribute('data-active'));

/* Sticky value story */
const valueSteps = $$('.value-step');
const valueNumber = $('#valueNumber');
const valueTitle = $('#valueTitle');
const valueDescription = $('#valueDescription');
const valueProgressDots = $$('.value-progress i');
let currentValueIndex = 0;

const setValueStep = (index) => {
  const step = valueSteps[index];
  if (!step || index === currentValueIndex && valueNumber?.textContent === step.dataset.valueNumber) return;
  currentValueIndex = index;
  if (valueNumber) valueNumber.textContent = step.dataset.valueNumber || '';
  if (valueTitle) valueTitle.textContent = step.dataset.valueTitle || '';
  if (valueDescription) valueDescription.textContent = step.dataset.valueDescription || '';
  valueProgressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  valueSteps.forEach((item, i) => item.classList.toggle('is-current', i === index));
};
setValueStep(0);

if (valueSteps.length > 1) {
  const valueObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const index = valueSteps.indexOf(visible.target);
    if (index >= 0) setValueStep(index);
  }, { threshold: [0.2, 0.45, 0.7], rootMargin: '-38% 0px -38% 0px' });
  valueSteps.forEach((step) => valueObserver.observe(step));
}

/* Technology: cycle through system stages, user click takes control. */
const techCallouts = $$('.tech-callout');
let techIndex = 0;
let techTimer = null;
const setTech = (index) => {
  if (!techCallouts.length) return;
  techIndex = (index + techCallouts.length) % techCallouts.length;
  techCallouts.forEach((item, i) => item.classList.toggle('active', i === techIndex));
};
const startTechCycle = () => {
  if (reduceMotion || techTimer || !techCallouts.length) return;
  techTimer = window.setInterval(() => setTech(techIndex + 1), 1900);
};
const stopTechCycle = () => {
  if (techTimer) window.clearInterval(techTimer);
  techTimer = null;
};
techCallouts.forEach((item, index) => {
  item.tabIndex = 0;
  const choose = () => { stopTechCycle(); setTech(index); };
  item.addEventListener('click', choose);
  item.addEventListener('focus', choose);
});
const techStage = $('#techStage');
if (techStage) {
  const techObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) startTechCycle(); else stopTechCycle();
  }, { threshold: 0.35 });
  techObserver.observe(techStage);
}

/* Accordion: one open item, clear + / − state. */
const accordionItems = $$('.accordion details');
const syncAccordionIcons = () => {
  accordionItems.forEach((item) => {
    const icon = $('summary i', item);
    if (icon) icon.textContent = item.open ? '−' : '+';
  });
};
accordionItems.forEach((detail) => detail.addEventListener('toggle', () => {
  if (detail.open) accordionItems.forEach((other) => { if (other !== detail) other.open = false; });
  syncAccordionIcons();
}));
syncAccordionIcons();

/* Native dialogs */
const productDialog = $('#productDialog');
const consultDialog = $('#consultDialog');
const productDialogImage = $('#productDialogImage');
const productDialogCategory = $('#productDialogCategory');
const productDialogTitle = $('#productDialogTitle');
const productDialogDescription = $('#productDialogDescription');
const productDialogLine = $('#productDialogLine');
const consultCrop = $('#consultCrop');
const consultProduct = $('#consultProduct');
let selectedProduct = '';
let selectedCrop = '';
let selectedCategory = '';

const openDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
};
const closeDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
};
$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
[productDialog, consultDialog].forEach((dialog) => dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog(dialog);
}));

const openProductDialog = (card) => {
  selectedCrop = card.dataset.crop || $('h4', card)?.textContent || '작물';
  selectedProduct = card.dataset.product || selectedCrop;
  selectedCategory = card.dataset.category || '제품';
  const image = card.dataset.image || $('img', card)?.src || '';
  if (productDialogImage) { productDialogImage.src = image; productDialogImage.alt = selectedCrop; }
  if (productDialogCategory) productDialogCategory.textContent = selectedCategory.toUpperCase();
  if (productDialogTitle) productDialogTitle.textContent = selectedCrop;
  if (productDialogLine) productDialogLine.textContent = selectedCategory;
  if (productDialogDescription) productDialogDescription.textContent = selectedCategory === '묘 구매'
    ? `${selectedCrop} 묘의 초기 생육과 환경 관리 방향을 상담할 수 있습니다.`
    : `${selectedCrop} 재배 환경에 맞춘 센서·시간 제어 구성을 상담할 수 있습니다.`;
  openDialog(productDialog);
};

const openConsult = (product = '', crop = '') => {
  if (consultProduct && product) consultProduct.value = product;
  if (consultCrop && crop) consultCrop.value = crop;
  openDialog(consultDialog);
};
$$('[data-open-consult]').forEach((button) => button.addEventListener('click', () => openConsult(button.dataset.openConsult || '')));
$('#dialogConsultButton')?.addEventListener('click', () => {
  closeDialog(productDialog);
  const mapped = selectedCategory === '묘 구매' ? '묘 구매' : selectedCategory === '기기 구매' ? '작물별 기기 구매' : selectedProduct;
  window.setTimeout(() => openConsult(mapped, selectedCrop), reduceMotion ? 0 : 120);
});

/* Carousels: 5:4 photography, drag momentum, center state and real progress. */
$$('[data-carousel]').forEach((carousel) => {
  const track = $('.crop-track', carousel);
  const cards = $$('.crop-card', carousel);
  const prev = $('.carousel-arrow.prev', carousel);
  const next = $('.carousel-arrow.next', carousel);
  const count = $('.carousel-count', carousel);
  const fill = $('.carousel-progress-fill', carousel);
  if (!track || !cards.length) return;

  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let inertiaFrame = 0;

  const cardStep = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };
  const currentIndex = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const d = Math.abs(center - cardCenter);
      if (d < distance) { distance = d; best = index; }
    });
    return best;
  };
  const updateCarousel = () => {
    const index = currentIndex();
    cards.forEach((card, i) => card.classList.toggle('is-current', i === index));
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    const max = Math.max(1, track.scrollWidth - track.clientWidth);
    if (fill) fill.style.width = `${Math.min(100, Math.max(0, track.scrollLeft / max * 100))}%`;
  };
  const snapToNearest = () => {
    const index = currentIndex();
    const card = cards[index];
    if (!card) return;
    const left = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const inertia = () => {
    velocity *= .92;
    track.scrollLeft += velocity * 16;
    updateCarousel();
    if (Math.abs(velocity) > .08) inertiaFrame = requestAnimationFrame(inertia);
    else snapToNearest();
  };

  prev?.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: reduceMotion ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(updateCarousel), { passive: true });

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    cancelAnimationFrame(inertiaFrame);
    dragging = true;
    startX = lastX = event.clientX;
    startScroll = track.scrollLeft;
    lastTime = performance.now();
    velocity = 0;
    track.classList.add('dragging');
    track.setPointerCapture?.(event.pointerId);
  });
  track.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = event.clientX - startX;
    track.scrollLeft = startScroll - dx;
    const dt = Math.max(1, now - lastTime);
    velocity = -(event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastTime = now;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    if (reduceMotion) snapToNearest(); else inertiaFrame = requestAnimationFrame(inertia);
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', () => { if (dragging) endDrag(); });

  cards.forEach((card) => card.addEventListener('click', (event) => {
    if (Math.abs(track.scrollLeft - startScroll) > 8) { event.preventDefault(); return; }
    openProductDialog(card);
  }));
  updateCarousel();
});

/* Consultation form */
const consultForm = $('#consultForm');
const formStatus = $('#formStatus');
consultForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!consultForm.reportValidity()) return;
  if (formStatus) formStatus.textContent = '입력 내용은 확인되었습니다. 현재 서버 전송 기능은 연결 전이므로 실제 문의가 전송되지는 않습니다.';
});
