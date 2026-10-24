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

$$('.value-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const key = tab.dataset.value;
    $$('.value-tab').forEach((item) => item.classList.remove('active'));
    $$('.value-panel').forEach((panel) => panel.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector(`[data-panel="${key}"]`)?.classList.add('active');
  });
});

$$('.accordion-list details').forEach((detail) => {
  const icon = $('summary i', detail);
  const syncIcon = () => { if (icon) icon.textContent = detail.open ? '×' : '+'; };
  syncIcon();
  detail.addEventListener('toggle', () => {
    if (detail.open) {
      $$('.accordion-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    }
    $$('.accordion-list details').forEach((item) => {
      const itemIcon = $('summary i', item);
      if (itemIcon) itemIcon.textContent = item.open ? '×' : '+';
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

$$('.reveal-item, .reveal-section').forEach((el) => revealObserver.observe(el));

const animateCount = (el) => {
  if (el.dataset.counted === 'true') return;
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target)) return;
  el.dataset.counted = 'true';
  const suffix = el.dataset.suffix || '';
  const duration = 850;
  const start = performance.now();
  const frame = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
$$('[data-count]').forEach((el) => countObserver.observe(el));

const calloutCopy = {
  sensor: { label: '01 / SENSOR', title: '환경을 먼저 읽습니다.', text: '토양·온도·습도·CO₂ 상태를 확인해 현재 환경을 판단할 입력값을 만듭니다.' },
  water: { label: '02 / WATER', title: '필요한 순간에 관수합니다.', text: '설정 시간과 센서 조건을 함께 확인해 펌프와 관수 장치를 작동시키는 구조입니다.' },
  air: { label: '03 / AIR', title: '환기와 가습을 조절합니다.', text: '팬과 가습 장치를 조건에 맞춰 운전해 내부 환경의 급격한 편차를 줄이는 방향으로 설계합니다.' },
  control: { label: '04 / CONTROL', title: '시간 + 센서로 결정합니다.', text: '한 가지 값에만 의존하지 않고 타이머 조건과 센서 기준을 함께 확인하는 이중 제어 방식입니다.' }
};

const calloutPanel = $('#calloutPanel');
$$('.product-callout').forEach((button) => {
  button.addEventListener('click', () => {
    const data = calloutCopy[button.dataset.callout];
    if (!data || !calloutPanel) return;
    $$('.product-callout').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    calloutPanel.innerHTML = `<small>${data.label}</small><strong>${data.title}</strong><p>${data.text}</p>`;
    calloutPanel.classList.add('active');
  });
});

const heroStage = $('.hero-stage');
const heroMachine = $('#heroMachine');
heroStage?.addEventListener('pointermove', (event) => {
  if (!heroMachine || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = heroStage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
  heroMachine.style.transform = `translate3d(${x}px, ${y}px, 0)`;
});
heroStage?.addEventListener('pointerleave', () => { if (heroMachine) heroMachine.style.transform = ''; });

const controlFlow = $('#controlFlow');
if (controlFlow) {
  const states = ['sense', 'decide', 'control'];
  let flowIndex = 0;
  const setFlow = () => {
    states.forEach((state) => controlFlow.classList.toggle(`flow-${state}-active`, state === states[flowIndex]));
    flowIndex = (flowIndex + 1) % states.length;
  };
  setFlow();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(setFlow, 1700);
}

$$('[data-carousel]').forEach((carousel) => {
  const track = $('.spectrum-track', carousel);
  const cards = $$('.spectrum-card', carousel);
  const prev = $('.carousel-arrow.prev', carousel);
  const next = $('.carousel-arrow.next', carousel);
  const progress = $('.carousel-progress i', carousel);
  const count = $('.carousel-count', carousel);
  if (!track || !cards.length) return;

  const pad = (n) => String(n).padStart(2, '0');
  const step = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };
  const update = () => {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const ratio = max ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 0;
    const current = Math.min(cards.length, Math.max(1, Math.round(track.scrollLeft / step()) + 1));
    if (progress) progress.style.width = `${(100 / cards.length) + ratio * (100 - 100 / cards.length)}%`;
    if (count) count.textContent = `${pad(current)} / ${pad(cards.length)}`;
  };
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  update();
});

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

const cropDescriptions = {
  '인삼': '장기 육묘와 초기 환경 관리가 중요한 작물로, 온도·습도·토양 상태를 일정하게 확인하는 흐름에 맞춰 적용합니다.',
  '비트': '발아와 초기 생육 단계의 수분 편차를 줄이는 방향으로 환경 조건을 세팅합니다.',
  '아스파라거스': '초기 묘 생육 단계의 온습도와 관수 조건을 반복적으로 관리하는 데 초점을 둡니다.',
  '더덕': '육묘부터 재배 장비 적용까지 두 라인 모두에서 테스트 대상으로 활용할 수 있는 작물입니다.',
  '셀러리': '수분과 온도 변화에 민감한 초기 생육 환경을 일정하게 유지하는 방향으로 적용합니다.',
  '우엉': '초기 뿌리 발달을 방해하지 않도록 토양 수분과 관수 조건을 관리하는 흐름으로 접근합니다.',
  '스테비아': '초기 생육 단계의 수분·온습도 조건을 안정적으로 반복 관리하는 데 초점을 둡니다.',
  '꽈리고추': '관수와 내부 온습도 변화가 반복되는 재배 환경을 자동화 장치로 보조하는 구성을 검토합니다.',
  '청양고추': '온도·습도와 관수 조건을 기준으로 환기·급수 동작을 연결하는 방식으로 적용합니다.',
  '가지': '초기 생육과 재배 중 수분 관리가 지속되는 작물로 자동 관수·환기 구성을 중심으로 적용합니다.',
  '시금치': '짧은 생육 주기 안에서 환경 편차를 줄이기 위한 반복 관리 자동화에 초점을 둡니다.',
  '콩': '초기 생육 단계에서 토양 수분과 온도를 확인하며 필요한 관수 동작을 연결합니다.',
  '생강': '토양 수분과 내부 온습도를 지속적으로 확인하는 환경 관리 흐름에 맞춰 적용합니다.'
};

const openDrawer = (card) => {
  if (!drawer) return;
  const crop = card.dataset.crop || $('h4', card)?.textContent || '작물';
  const category = card.dataset.categoryName || '제품';
  const product = card.dataset.product || crop;
  const image = card.dataset.image || $('img', card)?.getAttribute('src') || '';
  if (drawerImage) { drawerImage.src = image; drawerImage.alt = crop; }
  if (drawerCategory) drawerCategory.textContent = category.toUpperCase();
  if (drawerTitle) drawerTitle.textContent = crop;
  if (drawerDescription) drawerDescription.textContent = cropDescriptions[crop] || '작물별 환경 조건을 확인해 SeedSync 적용 구성을 제안합니다.';
  if (drawerLine) drawerLine.textContent = category;
  if (selectedProduct) { selectedProduct.hidden = false; selectedProduct.textContent = `선택 상품 · ${product}`; }
  if (consultCrop) consultCrop.value = crop;
  if (consultProduct) consultProduct.value = category === '묘 구매' ? '묘 구매' : '작물별 기기 구매';
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  drawerBackdrop?.classList.add('open');
  document.body.classList.add('drawer-open');
};

const closeDrawer = () => {
  drawer?.classList.remove('open');
  drawer?.setAttribute('aria-hidden', 'true');
  drawerBackdrop?.classList.remove('open');
  document.body.classList.remove('drawer-open');
};

$$('.spectrum-card').forEach((card) => card.addEventListener('click', () => openDrawer(card)));
drawerClose?.addEventListener('click', closeDrawer);
drawerBackdrop?.addEventListener('click', closeDrawer);
drawerCta?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeDrawer(); });

const quotes = $$('.quote-item');
let quoteIndex = 0;
const showQuote = (index) => {
  if (!quotes.length) return;
  quoteIndex = (index + quotes.length) % quotes.length;
  quotes.forEach((quote, i) => quote.classList.toggle('active', i === quoteIndex));
};
$('.quote-prev')?.addEventListener('click', () => showQuote(quoteIndex - 1));
$('.quote-next')?.addEventListener('click', () => showQuote(quoteIndex + 1));

const consultForm = $('#consultForm');
const formStatus = $('#formStatus');
consultForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!consultForm.reportValidity()) return;
  if (formStatus) formStatus.textContent = '입력 확인 완료 · 현재 MVP 데모에서는 서버 전송 기능이 연결되지 않았습니다.';
  consultForm.classList.add('validated');
});

window.addEventListener('resize', () => {
  $$('[data-carousel] .spectrum-track').forEach((track) => track.dispatchEvent(new Event('scroll')));
  if (window.innerWidth > 1100) setMenuState(false);
});
