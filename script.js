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
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    $$('.accordion-list details').forEach((other) => {
      if (other !== detail) other.open = false;
    });
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
  track.addEventListener('scroll', () => requestAnimationFrame(update));

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const selected = $('#selectedProduct');
      if (!selected) return;
      selected.hidden = false;
      selected.textContent = `선택 상품 · ${category} · ${card.dataset.product || card.querySelector('h4')?.textContent || '선택 상품'}`;
    });
  });

  update();
});

window.addEventListener('resize', () => {
  $$('[data-carousel] .spectrum-track').forEach((track) => {
    track.dispatchEvent(new Event('scroll'));
  });
});