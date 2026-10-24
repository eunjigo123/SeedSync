const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Palette correction for the Technology section.
// #F5F7F4 is used as a background only, never as text.
const technologyPalette = document.createElement('style');
technologyPalette.textContent = `
  .technology {
    background: #F5F7F4;
    color: #15324A;
  }

  .technology .section-kicker.light,
  .technology .overline,
  .technology .logic-row small,
  .technology .logic-index,
  .technology .logic-row > i {
    color: #86B7C5;
  }

  .technology h2,
  .technology .logic-row b {
    color: #15324A;
  }

  .technology-copy > p:not(.overline),
  .technology .logic-row p {
    color: #5B7F63;
  }

  .technology .light-btn {
    background: #15324A;
    color: #86B7C5;
  }

  .technology .logic-panel {
    background: #F5F7F4;
    border-color: #86B7C5;
  }

  .technology .logic-row {
    border-bottom-color: #86B7C5;
  }

  .technology .logic-note {
    background: #86B7C5;
  }

  .technology .logic-note span {
    background: #5B7F63;
    box-shadow: 0 0 0 5px #86B7C5;
  }

  .technology .logic-note p {
    color: #15324A;
  }
`;
document.head.appendChild(technologyPalette);

const header = $('#header');
const mobileNav = $('#mobileNav');
const menuOpen = $('#menuOpen');
const searchModal = $('#searchModal');
const searchOpen = $('#searchOpen');
const searchClose = $('#searchClose');
const searchInput = $('#searchInput');

menuOpen?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
});

$$('.mobile-nav a').forEach((link) => {
  link.addEventListener('click', () => mobileNav?.classList.remove('open'));
});

const openSearch = () => {
  searchModal?.classList.add('active');
  setTimeout(() => searchInput?.focus(), 60);
};

const closeSearch = () => {
  searchModal?.classList.remove('active');
};

searchOpen?.addEventListener('click', openSearch);
searchClose?.addEventListener('click', closeSearch);

$$('.search-hints a').forEach((link) => {
  link.addEventListener('click', closeSearch);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSearch();
});

searchInput?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;

  const keyword = searchInput.value.trim().toLowerCase();
  let target = '#products';

  if (/(센서|관수|가습|환기|기술|자동)/.test(keyword)) target = '#technology';
  if (/(인삼|더덕|고추|가지|아스파라거스|비트|셀러리|작물)/.test(keyword)) target = '#applications';
  if (/(서비스|a\/s|as|설치|상담|도입)/.test(keyword)) target = '#service';
  if (/(문의|견적|가격)/.test(keyword)) target = '#support';

  closeSearch();
  document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
});

window.addEventListener('scroll', () => {
  if (!header) return;
  header.style.boxShadow = window.scrollY > 20
    ? '0 8px 28px #15324A'
    : 'none';
});
