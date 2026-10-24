const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

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
