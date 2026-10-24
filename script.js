const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const header = $('#header');
const mobileNav = $('#mobileNav');
const menuOpen = $('#menuOpen');

const setMenuState = (open) => {
  mobileNav?.classList.toggle('open', open);
  menuOpen?.setAttribute('aria-expanded', String(open));
  if (menuOpen) menuOpen.textContent = open ? 'CLOSE' : 'MENU';
};

menuOpen?.addEventListener('click', () => setMenuState(!mobileNav?.classList.contains('open')));
$$('.mobile-nav a').forEach((link) => link.addEventListener('click', () => setMenuState(false)));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 24), { passive: true });

// Reveal motion
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

$$('.reveal-item, .reveal-section').forEach((el) => revealObserver.observe(el));

// Hero machine subtle parallax
const heroScene = $('.hero-machine-scene');
const heroMachine = $('#heroMachine');
heroScene?.addEventListener('pointermove', (event) => {
  if (!heroMachine || window.matchMedia('(pointer: coarse)').matches) return;
  const rect = heroScene.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  heroMachine.style.transform = `translate(calc(-50% + ${x * 10}px), calc(-47% + ${y * 8}px))`;
});
heroScene?.addEventListener('pointerleave', () => {
  if (heroMachine) heroMachine.style.transform = 'translate(-50%,-47%)';
});

// Value tabs
$$('.value-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const key = tab.dataset.value;
    $$('.value-tab').forEach((item) => item.classList.remove('active'));
    $$('.value-panel').forEach((panel) => panel.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-panel="${key}"]`)?.classList.add('active');
  });
});

// Accordion
$$('.accordion-list details').forEach((detail) => {
  const syncIcons = () => {
    $$('.accordion-list details').forEach((item) => {
      const icon = $('summary i', item);
      if (icon) icon.textContent = item.open ? '×' : '+';
    });
  };
  syncIcons();
  detail.addEventListener('toggle', () => {
    if (detail.open) {
      $$('.accordion-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    }
    syncIcons();
  });
});

// Technology flow animation
const technologyVisual = $('#technologyVisual');
let technologyTimer = null;
const startTechnologyFlow = () => {
  if (!technologyVisual || technologyTimer) return;
  const steps = $$('.flow-step', technologyVisual);
  let index = 0;
  const tick = () => {
    steps.forEach((step, i) => step.classList.toggle('active', i === index));
    index = (index + 1) % steps.length;
  };
  tick();
  technologyTimer = window.setInterval(tick, 1400);
};

if (technologyVisual) {
  const techObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) startTechnologyFlow();
    });
  }, { threshold: 0.3 });
  techObserver.observe(technologyVisual);
}

// Drawer
const drawer = $('#productDrawer');
const drawerBackdrop = $('#drawerBackdrop');
const drawerClose = $('#drawerClose');
const drawerImage = $('#drawerImage');
const drawerCategory = $('#drawerCategory');
const drawerTitle = $('#drawerTitle');
const drawerDescription = $('#drawerDescription');
const drawerLine = $('#drawerLine');
const drawerCta = $('#drawerCta');
const selectedProduct = $('#selectedProduct');
const consultCrop = $('#consultCrop');
const consultProduct = $('#consultProduct');

const closeDrawer = () => {
  drawer?.classList.remove('open');
  drawerBackdrop?.classList.remove('open');
  drawer?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('drawer-open');
};

const openDrawer = (card) => {
  const crop = card.dataset.crop || $('h4', card)?.textContent || '작물';
  const product = card.dataset.product || crop;
  const category = card.dataset.categoryName || '제품';
  const image = card.dataset.image || $('img', card)?.getAttribute('src') || '';

  if (drawerImage) {
    drawerImage.src = image;
    drawerImage.alt = crop;
  }
  if (drawerCategory) drawerCategory.textContent = category.toUpperCase();
  if (drawerTitle) drawerTitle.textContent = crop;
  if (drawerLine) drawerLine.textContent = category;
  if (drawerDescription) {
    drawerDescription.textContent = category === '묘 구매'
      ? `${crop} 묘의 초기 생육과 환경 관리 방향을 상담할 수 있습니다.`
      : `${crop} 재배 환경에 맞춘 센서·시간 제어 구성을 상담할 수 있습니다.`;
  }
  if (selectedProduct) {
    selectedProduct.hidden = false;
    selectedProduct.textContent = `선택 상품 · ${product}`;
  }
  if (consultCrop) consultCrop.value = crop;
  if (consultProduct) consultProduct.value = category === '묘 구매' ? '묘 구매' : '작물별 기기 구매';

  drawer?.classList.add('open');
  drawerBackdrop?.classList.add('open');
  drawer?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
};

drawerClose?.addEventListener('click', closeDrawer);
drawerBackdrop?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeDrawer();
});
drawerCta?.addEventListener('click', closeDrawer);

// Crop carousels
$$('[data-carousel]').forEach((carousel) => {
  const track = $('.crop-track', carousel);
  const cards = $$('.crop-card', carousel);
  const prev = $('.carousel-arrow.prev', carousel);
  const next = $('.carousel-arrow.next', carousel);
  const count = $('.carousel-count', carousel);

  if (!track || !cards.length) return;

  const pad = (n) => String(n).padStart(2, '0');
  const step = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };
  const update = () => {
    const current = Math.min(cards.length, Math.max(1, Math.round(track.scrollLeft / step()) + 1));
    if (count) count.textContent = `${pad(current)} / ${pad(cards.length)}`;
  };

  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  cards.forEach((card) => card.addEventListener('click', () => openDrawer(card)));
  update();
});

window.addEventListener('resize', () => {
  $$('[data-carousel] .crop-track').forEach((track) => track.dispatchEvent(new Event('scroll')));
});

// Consultation form UI only
const consultForm = $('#consultForm');
const formStatus = $('#formStatus');
consultForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!consultForm.reportValidity()) return;
  consultForm.classList.add('validated');
  if (formStatus) formStatus.textContent = '입력 내용은 확인되었습니다. 현재 서버 전송 기능은 연결 전이므로 실제 문의가 전송되지는 않습니다.';
});
