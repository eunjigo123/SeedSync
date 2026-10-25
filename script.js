(() => {
  const replaceDepthLabels = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue?.includes('30cm')) node.nodeValue = node.nodeValue.replaceAll('30cm', '20cm');
    }
  };

  const seedlingCarousel = document.querySelector('.crop-section.seedling[data-carousel]');
  if (seedlingCarousel) {
    const head = seedlingCarousel.querySelector('.crop-head');
    if (head && !head.querySelector('.carousel-controls')) {
      const controls = document.createElement('div');
      controls.className = 'carousel-controls seedling-carousel-controls';
      controls.innerHTML = `
        <button class="carousel-arrow prev" type="button" aria-label="이전 묘">←</button>
        <button class="carousel-arrow next" type="button" aria-label="다음 묘">→</button>
      `;
      head.appendChild(controls);
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .seedling-carousel-controls{display:flex;align-items:center;gap:10px;margin-left:auto;flex:0 0 auto}
    .seedling-carousel-controls .carousel-arrow{width:58px;height:58px;display:grid;place-items:center;padding:0;border:3px solid #15324A;background:#F5F7F4;color:#15324A;font:inherit;font-size:28px;line-height:1;transition:transform .2s ease,background .2s ease,color .2s ease}
    .seedling-carousel-controls .carousel-arrow:hover,.seedling-carousel-controls .carousel-arrow:focus-visible{background:#15324A;color:#F5F7F4;transform:translateY(-2px)}
    @media(max-width:760px){.seedling-carousel-controls{width:100%;justify-content:flex-end;margin-top:18px}.seedling-carousel-controls .carousel-arrow{width:52px;height:52px}}
  `;
  document.head.appendChild(style);

  replaceDepthLabels();

  const core = document.createElement('script');
  core.src = 'script-core.js?v=20261025-depth20-carousel-controls';
  core.async = false;
  document.body.appendChild(core);
})();
