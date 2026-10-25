const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header, mobile navigation, active section and hero transition */
const header = $('#header');
const hero = $('#hero');
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
  menuButton?.setAttribute('aria-expanded', String(open));
  if (menuButton) menuButton.textContent = open ? 'CLOSE' : 'MENU';
});
$$('.mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));

$$('.mobile-nav details').forEach((detail) => detail.addEventListener('toggle', () => {
  const icon = $('summary span', detail);
  if (icon) icon.textContent = detail.open ? '−' : '+';
}));

const syncScrollUI = () => {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 42);
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  if (scrollProgress) scrollProgress.style.width = `${Math.min(100, Math.max(0, y / max * 100))}%`;

  if (!reduceMotion && hero) {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, hero.offsetHeight * .72)));
    const product = $('#heroProduct');
    const machine = $('.machine-svg', product || document);
    const copy = $('.hero-copy');
    if (machine) {
      machine.style.setProperty('--hero-y', `${progress * -42}px`);
      machine.style.setProperty('--hero-scale', String(1 + progress * .08));
    }
    if (copy) {
      copy.style.transform = `translateY(${progress * -78}px)`;
      copy.style.opacity = String(Math.max(.08, 1 - progress * 1.15));
    }
  }
};
window.addEventListener('scroll', () => requestAnimationFrame(syncScrollUI), { passive: true });
window.addEventListener('resize', syncScrollUI);
syncScrollUI();

const navLinks = $$('[data-nav-section]');
const sectionTargets = $$('[data-section]');
if (sectionTargets.length && navLinks.length) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const key = visible.target.dataset.section;
    navLinks.forEach((link) => link.classList.toggle('active', link.dataset.navSection === key));
  }, { threshold: [0.18, 0.35, 0.55], rootMargin: '-30% 0px -55% 0px' });
  sectionTargets.forEach((section) => navObserver.observe(section));
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    $('#productsMega')?.classList.remove('open');
  }
});

/* Reveal supports the story, but never defines it. */
if (reduceMotion) {
  $$('.reveal').forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));
}

/* Problem: three problems, then the UI clears for the brand statement. */
const problemData = [
  {
    number: '01', label: 'DIFFERENT CROPS', title: '작물마다 다릅니다.',
    description: '인삼과 고추가 같은 환경을 필요로 하지 않듯, 종자마다 발아와 초기 생육에 필요한 조건이 다릅니다.',
    meta: '온도 · 수분 · 습도 · 광 환경'
  },
  {
    number: '02', label: 'ENVIRONMENT CHANGE', title: '환경은 계속 변합니다.',
    description: '과습은 곰팡이와 입고병 위험을 높이고, 수분이 부족하면 발아와 초기 생육이 불안정해질 수 있습니다. 기온과 습도 역시 하루 동안 계속 달라집니다.',
    meta: '변화하는 환경을 반복적으로 확인해야 합니다.'
  },
  {
    number: '03', label: 'REPETITIVE MANAGEMENT', title: '관리는 반복됩니다.',
    description: '확인하고, 물을 주고, 환기하고, 다시 상태를 확인합니다. 기존 육묘에서는 이러한 관리가 작업자의 경험과 반복 노동에 크게 의존합니다.',
    meta: 'CHECK → WATER → VENTILATE → CHECK'
  }
];
const problemSteps = $$('.problem-step');
const problemStage = $('#problemStage');
const problemNumber = $('#problemNumber');
const problemLabel = $('#problemLabel');
const problemTitle = $('#problemTitle');
const problemDescription = $('#problemDescription');
const problemMeta = $('#problemMeta');
const problemIcons = $$('[data-problem-icon]');
let currentProblem = 0;

const setProblem = (index) => {
  if (!problemStage) return;
  if (index >= problemData.length) {
    problemStage.style.opacity = '0';
    problemStage.style.pointerEvents = 'none';
    return;
  }
  problemStage.style.opacity = '1';
  problemStage.style.pointerEvents = '';
  currentProblem = index;
  const data = problemData[index];
  if (problemNumber) problemNumber.textContent = data.number;
  if (problemLabel) problemLabel.textContent = data.label;
  if (problemTitle) problemTitle.textContent = data.title;
  if (problemDescription) problemDescription.textContent = data.description;
  if (problemMeta) problemMeta.textContent = data.meta;
  problemIcons.forEach((icon, i) => icon.classList.toggle('active', i === index));
};
setProblem(0);
if (problemSteps.length) {
  const problemObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    setProblem(Number(active.target.dataset.problem || 0));
  }, { threshold: [.2, .5, .75], rootMargin: '-25% 0px -35% 0px' });
  problemSteps.forEach((step) => problemObserver.observe(step));
}

/* Products keep the existing split, but give the flagship priority. */
const productSplit = $('#productSplit');
$$('[data-product-choice]').forEach((choice) => {
  const activate = () => productSplit?.setAttribute('data-active', choice.dataset.productChoice || '');
  choice.addEventListener('pointerenter', activate);
  choice.addEventListener('focusin', activate);
});
productSplit?.addEventListener('pointerleave', () => productSplit.setAttribute('data-active', 'system'));

const hotspotPanel = $('#hotspotPanel');
$$('.hotspot').forEach((hotspot) => {
  const choose = () => {
    $$('.hotspot').forEach((item) => item.classList.toggle('active', item === hotspot));
    if (!hotspotPanel) return;
    const number = hotspot.textContent?.trim() || '';
    hotspotPanel.innerHTML = `<b>${number}</b><span>${hotspot.dataset.hotspot || ''}</span>`;
  };
  hotspot.addEventListener('click', choose);
  hotspot.addEventListener('focus', choose);
});

/* Built for Real Farming: sticky product, feature layers change with scroll. */
const farmTechStage = $('#farmTechStage');
const farmTechSteps = $$('.farm-tech-step');
const setFarmFeature = (index) => farmTechStage?.setAttribute('data-feature', String(index));
if (farmTechSteps.length) {
  const farmObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    const index = farmTechSteps.indexOf(active.target);
    if (index >= 0) setFarmFeature(index);
  }, { threshold: [.25, .5, .7], rootMargin: '-34% 0px -36% 0px' });
  farmTechSteps.forEach((step) => farmObserver.observe(step));
}

/* Why SeedOptima: existing sticky value engine + clickable tabs. */
const valueSteps = $$('.value-step');
const valueNumber = $('#valueNumber');
const valueTitle = $('#valueTitle');
const valueDescription = $('#valueDescription');
const valueProgressDots = $$('.value-progress i');
const valueTabs = $$('.value-tab');
let currentValueIndex = 0;

const setValueStep = (index) => {
  const step = valueSteps[index];
  if (!step) return;
  currentValueIndex = index;
  if (valueNumber) valueNumber.textContent = step.dataset.valueNumber || '';
  if (valueTitle) valueTitle.textContent = step.dataset.valueTitle || '';
  if (valueDescription) valueDescription.textContent = step.dataset.valueDescription || '';
  valueProgressDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  valueTabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
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
valueTabs.forEach((tab, index) => tab.addEventListener('click', () => {
  setValueStep(index);
  valueSteps[index]?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
}));

/* Native dialogs */
const productDialog = $('#productDialog');
const proofDialog = $('#proofDialog');
const productDialogImage = $('#productDialogImage');
const productDialogCategory = $('#productDialogCategory');
const productDialogTitle = $('#productDialogTitle');
const productDialogDescription = $('#productDialogDescription');
const productDialogLine = $('#productDialogLine');

const openDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
};
const closeDialog = (dialog) => {
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
};
$$('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => closeDialog(button.closest('dialog'))));
[productDialog, proofDialog].forEach((dialog) => dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog(dialog);
}));

const openProductDialog = (card) => {
  const crop = card.dataset.crop || $('h4', card)?.textContent || '작물';
  const category = card.dataset.category || '제품';
  const image = card.dataset.image || $('img', card)?.src || '';
  if (productDialogImage) { productDialogImage.src = image; productDialogImage.alt = crop; }
  if (productDialogCategory) productDialogCategory.textContent = category.toUpperCase();
  if (productDialogTitle) productDialogTitle.textContent = crop;
  if (productDialogLine) productDialogLine.textContent = category;
  if (productDialogDescription) productDialogDescription.textContent = category === '묘 구매'
    ? `${crop} 묘의 주요 생육환경과 현재 생산·검증 방향을 확인할 수 있습니다.`
    : `${crop} 재배 환경에 맞춘 센서·시간 제어 구성을 상담할 수 있습니다.`;
  openDialog(productDialog);
};

/* Carousels: preserve 5:4 photos, drag momentum, current-card emphasis and data sync. */
const cropDataName = $('#cropDataName');
const cropTemp = $('#cropTemp');
const cropHumidity = $('#cropHumidity');
const cropCo2 = $('#cropCo2');
const cropLight = $('#cropLight');
const syncCropData = (card) => {
  if (!card || !card.closest('[data-crop-data]')) return;
  if (cropDataName) cropDataName.textContent = card.dataset.crop || '';
  if (cropTemp) cropTemp.textContent = card.dataset.temp || '-';
  if (cropHumidity) cropHumidity.textContent = card.dataset.humidity || '-';
  if (cropCo2) cropCo2.textContent = card.dataset.co2 || '-';
  if (cropLight) cropLight.textContent = card.dataset.light || '-';
};

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
  let draggedDistance = 0;

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
    syncCropData(cards[index]);
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    const max = Math.max(1, track.scrollWidth - track.clientWidth);
    if (fill) fill.style.width = `${Math.min(100, Math.max(3, track.scrollLeft / max * 100))}%`;
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
    draggedDistance = 0;
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
    draggedDistance = Math.max(draggedDistance, Math.abs(dx));
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
    if (draggedDistance > 8) { event.preventDefault(); return; }
    openProductDialog(card);
  }));
  updateCarousel();
});

/* How it Works: the scroll position directly controls the machine animation state. */
const howStage = $('#howStage');
const howSteps = $$('[data-process-step]');
const setProcess = (index) => howStage?.setAttribute('data-process', String(index));
if (howSteps.length) {
  const processObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    const index = Number(active.target.dataset.processStep || 0);
    setProcess(index);
  }, { threshold: [.25, .5, .75], rootMargin: '-35% 0px -35% 0px' });
  howSteps.forEach((step) => processObserver.observe(step));
}

/* Field Proof: count-up only for measured counts, never for target values. */
const countElements = $$('[data-count]');
if (countElements.length) {
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count || 0);
      if (reduceMotion) element.textContent = String(target);
      else {
        const start = performance.now();
        const duration = 700;
        const tick = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      observer.unobserve(element);
    });
  }, { threshold: .55 });
  countElements.forEach((element) => countObserver.observe(element));
}

const proofContent = {
  farms: { title: '현재 MVP 및 현장 검증', items: ['이천 농가', '평택 농가', '아산 스마트팜'] },
  tests: { title: '현재 진행 중인 주요 데이터 테스트', items: ['종자 발아력', '온·습도', 'CO₂', '토양수분', 'EC'] },
  interviews: { title: '추가 농가 인터뷰 예정', items: ['당진 8,000평 농가', '김해 농가'] }
};
$$('[data-proof]').forEach((button) => button.addEventListener('click', () => {
  const data = proofContent[button.dataset.proof];
  if (!data || !proofDialog) return;
  const title = $('#proofDialogTitle');
  const content = $('#proofDialogContent');
  if (title) title.textContent = data.title;
  if (content) content.innerHTML = `<div class="proof-detail-list">${data.items.map((item) => `<div>${item}</div>`).join('')}</div>`;
  openDialog(proofDialog);
}));

/* Rental: same reliable sticky-story engine, different content and ownership line. */
const rentalSteps = $$('.rental-steps article');
const rentalNumber = $('#rentalNumber');
const rentalTitle = $('#rentalTitle');
const rentalDescription = $('#rentalDescription');
const ownershipLines = $$('.ownership-line i');
const setRental = (index) => {
  const step = rentalSteps[index];
  if (!step) return;
  if (rentalNumber) rentalNumber.textContent = step.dataset.rentalNumber || '';
  if (rentalTitle) rentalTitle.textContent = step.dataset.rentalTitle || '';
  if (rentalDescription) rentalDescription.textContent = step.dataset.rentalDescription || '';
  ownershipLines.forEach((line, i) => line.style.setProperty('--line-progress', index > i ? '1' : '0'));
};
setRental(0);
if (rentalSteps.length) {
  const rentalObserver = new IntersectionObserver((entries) => {
    const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active) return;
    const index = rentalSteps.indexOf(active.target);
    if (index >= 0) setRental(index);
  }, { threshold: [.25, .5, .75], rootMargin: '-38% 0px -38% 0px' });
  rentalSteps.forEach((step) => rentalObserver.observe(step));
}

/* Field Stories: one farm at a time, swipe/arrow friendly. */
const storyTrack = $('#storyTrack');
const storySlides = $$('.story-slide');
const storyPrev = $('#storyPrev');
const storyNext = $('#storyNext');
const storyCount = $('#storyCount');
const storyProgress = $('#storyProgress');
let storyIndex = 0;
const setStory = (index) => {
  if (!storyTrack || !storySlides.length) return;
  storyIndex = (index + storySlides.length) % storySlides.length;
  storyTrack.style.transform = `translateX(${-storyIndex * 100}%)`;
  storySlides.forEach((slide, i) => slide.classList.toggle('active', i === storyIndex));
  if (storyCount) storyCount.textContent = `${String(storyIndex + 1).padStart(2, '0')} / ${String(storySlides.length).padStart(2, '0')}`;
  if (storyProgress) {
    storyProgress.style.width = `${100 / storySlides.length}%`;
    storyProgress.style.transform = `translateX(${storyIndex * 100}%)`;
  }
};
storyPrev?.addEventListener('click', () => setStory(storyIndex - 1));
storyNext?.addEventListener('click', () => setStory(storyIndex + 1));
let storyStartX = null;
storyTrack?.addEventListener('pointerdown', (event) => { storyStartX = event.clientX; });
storyTrack?.addEventListener('pointerup', (event) => {
  if (storyStartX == null) return;
  const dx = event.clientX - storyStartX;
  if (Math.abs(dx) > 50) setStory(storyIndex + (dx < 0 ? 1 : -1));
  storyStartX = null;
});
setStory(0);

/* Newsletter */
const newsletterForm = $('#newsletterForm');
const newsletterEmail = $('#newsletterEmail');
const newsletterStatus = $('#newsletterStatus');
newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!newsletterEmail?.checkValidity()) {
    newsletterEmail?.reportValidity();
    return;
  }
  if (newsletterStatus) newsletterStatus.textContent = '구독 입력을 확인했습니다. 현재 뉴스레터 발송 시스템 연결 전이라 실제 등록은 아직 되지 않습니다.';
  newsletterForm.classList.add('submitted');
});
