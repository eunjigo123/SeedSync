(() => {
  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

  const icon = (name) => {
    const icons = {
      sensor: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 8v8"/><path d="M24 32v8"/><path d="M8 24h8"/><path d="M32 24h8"/><circle cx="24" cy="24" r="8"/><circle cx="24" cy="24" r="2"/></svg>',
      control: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="10" width="30" height="28" rx="2"/><path d="M15 18h18"/><path d="M15 25h8"/><path d="M29 25h4"/><path d="M15 32h5"/><path d="M25 32h8"/></svg>',
      water: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7s-11 13-11 22a11 11 0 0 0 22 0C35 20 24 7 24 7Z"/><path d="M19 31c1.5 2.2 3.2 3.3 5 3.3"/></svg>',
      fan: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="3"/><path d="M24 21c-2-7 1-12 5-12 4 0 5 5 2 9-2 3-4 4-7 3Z"/><path d="M27 24c7-2 12 1 12 5 0 4-5 5-9 2-3-2-4-4-3-7Z"/><path d="M24 27c2 7-1 12-5 12-4 0-5-5-2-9 2-3 4-4 7-3Z"/><path d="M21 24c-7 2-12-1-12-5 0-4 5-5 9-2 3 2 4 4 3 7Z"/></svg>',
      consult: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M8 10h32v24H21l-9 6v-6H8Z"/><path d="M15 18h18"/><path d="M15 25h12"/></svg>',
      install: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M11 36h26"/><path d="M16 36V20h16v16"/><path d="M13 20h22l-4-8H17Z"/><path d="M21 27h6"/></svg>',
      start: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="15"/><path d="m21 17 10 7-10 7Z"/></svg>',
      service: '<svg class="line-icon" viewBox="0 0 48 48" aria-hidden="true"><path d="M29 10a9 9 0 0 0-10 12L9 32l7 7 10-10a9 9 0 0 0 12-10l-6 6-7-2-2-7Z"/></svg>'
    };
    return icons[name] || icons.sensor;
  };

  // Products: remove the redundant intro screen and make the two product choices immediate.
  const intro = q('.products-overview');
  const seedling = q('#seedlings');
  const system = q('#system');
  if (seedling && system && !q('.product-duo-stage')) {
    const duo = document.createElement('div');
    duo.className = 'product-duo-stage reveal-section';
    duo.id = 'products';
    intro?.parentNode?.insertBefore(duo, intro.nextSibling);
    const systemVisual = q('.system-visual', system);
    const systemCopy = q('.product-feature-copy', system);
    if (systemVisual && systemCopy) system.insertBefore(systemVisual, systemCopy);
    duo.append(seedling, system);
    intro?.remove();
    requestAnimationFrame(() => duo.classList.add('is-visible'));
  }

  // Technology: keep SENSE / DECIDE / CONTROL, but anchor it to the machine itself.
  const technology = q('#technologyVisual');
  if (technology && !technology.classList.contains('tech-cutaway')) {
    technology.classList.add('tech-cutaway');
    technology.innerHTML = `
      <div class="tech-cutaway-frame" aria-hidden="true">
        <div class="tech-cutaway-roof"></div>
        <div class="tech-cutaway-body">
          <div class="tech-cutaway-deck">
            <i class="tech-cutaway-pot"></i><i class="tech-cutaway-pot"></i><i class="tech-cutaway-pot"></i><i class="tech-cutaway-pot"></i>
          </div>
          <div class="tech-cutaway-controller"><span>SOIL</span><span>AIR</span><span>WATER</span><span>CTRL</span></div>
        </div>
      </div>
      <div class="flow-step flow-step-1">${icon('sensor')}<b>SENSE</b><small>SOIL · TEMP · HUMIDITY · CO₂</small></div>
      <div class="flow-step flow-step-2">${icon('control')}<b>DECIDE</b><small>TIME + SENSOR CONDITION</small></div>
      <div class="flow-step flow-step-3">${icon('water')}<b>CONTROL</b><small>WATER · FAN · HUMIDIFIER</small></div>`;
  }

  // Validation: same evidence items, reinterpreted as a progress track rather than placeholder cards.
  const validationGrid = q('.validation-grid');
  if (validationGrid) validationGrid.classList.add('validation-timeline');

  // Support: one coherent stroke-icon family, no dashboard boxes.
  const supportIcons = ['consult', 'install', 'start', 'service'];
  qa('.support-grid article').forEach((article, index) => {
    if (q('.support-icon', article)) return;
    const wrap = document.createElement('div');
    wrap.className = 'support-icon icon-wrap';
    wrap.innerHTML = icon(supportIcons[index] || 'service');
    article.prepend(wrap);
  });

  // Contact: brand ending first. Reveal the detailed form only after the user asks for it.
  const contact = q('.contact-section');
  const contactCopy = q('.contact-copy');
  const consultForm = q('#consultForm');
  if (contact && contactCopy && consultForm && !q('.contact-primary-actions')) {
    const actions = document.createElement('div');
    actions.className = 'contact-primary-actions';
    actions.innerHTML = `
      <button class="button button-accent contact-open-form" type="button">도입 상담 시작 ↗</button>
      <button class="button contact-test-farm" type="button">테스트 농가 참여 ↗</button>`;
    contactCopy.append(actions);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'consult-form-close';
    close.textContent = 'FORM CLOSE ×';
    consultForm.prepend(close);

    const openForm = (product) => {
      contact.classList.add('form-open');
      if (product) {
        const select = q('#consultProduct');
        if (select) select.value = product;
      }
      requestAnimationFrame(() => consultForm.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    };

    q('.contact-open-form')?.addEventListener('click', () => openForm('Seed Optima Bed'));
    q('.contact-test-farm')?.addEventListener('click', () => openForm('테스트 농가 참여'));
    close.addEventListener('click', () => contact.classList.remove('form-open'));

    qa('a[href="#contact"]').forEach((anchor) => {
      anchor.addEventListener('click', () => {
        window.setTimeout(() => contact.classList.add('form-open'), 250);
      });
    });
  }
})();
