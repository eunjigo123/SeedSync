const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const mobileNav = $('#mobileNav');
const menuOpen = $('#menuOpen');

menuOpen?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
});

$$('.mobile-nav a').forEach((link) => {
  link.addEventListener('click', () => mobileNav?.classList.remove('open'));
});

$$('.benefit-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const key = tab.dataset.benefit;

    $$('.benefit-tab').forEach((item) => item.classList.remove('active'));
    $$('.benefit-panel').forEach((panel) => panel.classList.remove('active'));

    tab.classList.add('active');
    document.querySelector(`[data-panel="${key}"]`)?.classList.add('active');
  });
});

$$('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.spectrum-track');
  const cards = [...carousel.querySelectorAll('.spectrum-card')];
  const prev = carousel.querySelector('.carousel-arrow.prev');
  const next = carousel.querySelector('.carousel-arrow.next');
  const progress = carousel.querySelector('.carousel-progress i');
  const count = carousel.querySelector('.carousel-count');
  const category = carousel.dataset.category || '제품';

  if (!track || !cards.length) return;

  const pad = (number) => String(number).padStart(2, '0');

  const getStep = () => {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };

  const updateCarousel = () => {
    const step = getStep();
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const ratio = maxScroll ? Math.min(1, Math.max(0, track.scrollLeft / maxScroll)) : 0;
    const current = Math.min(cards.length, Math.max(1, Math.round(track.scrollLeft / step) + 1));
    const base = 100 / cards.length;

    if (progress) progress.style.width = `${base + ratio * (100 - base)}%`;
    if (count) count.textContent = `${pad(current)} / ${pad(cards.length)}`;
  };

  prev?.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });

  next?.addEventListener('click', () => {
    track.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      updateCarousel();
      ticking = false;
    });
  });

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const selected = $('#selectedProduct');
      const product = card.dataset.product || card.querySelector('h4')?.textContent || '선택 상품';

      if (selected) {
        selected.hidden = false;
        selected.textContent = `선택 상품 · ${category} · ${product}`;
      }
    });
  });

  updateCarousel();
});

window.addEventListener('resize', () => {
  $$('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.spectrum-track');
    if (track) track.dispatchEvent(new Event('scroll'));
  });
});
