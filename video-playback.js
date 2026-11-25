/* SeedSync homepage videos: main hero + lazy-loaded middle and last scenes. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero-background-video');
  const videos = Array.from(document.querySelectorAll('.hero-background-video, .seed-video-break-media'));
  if (!videos.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const inViewport = (video) => {
    const rect = video.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  };
  const loadVideo = (video) => {
    if (reducedMotion.matches) return;
    const source = video.querySelector('source[data-src]');
    if (!source) return;
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    video.load();
  };
  const safePlay = (video) => {
    if (document.hidden || reducedMotion.matches) return;
    loadVideo(video);
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') promise.catch(() => {});
  };

  if (hero) {
    const markPlaying = () => hero.classList.add('is-ready');
    const markFailed = () => hero.classList.remove('is-ready');
    hero.addEventListener('playing', markPlaying);
    hero.addEventListener('error', markFailed);
    hero.querySelector('source')?.addEventListener('error', markFailed);
    if (hero.readyState >= 2 && !hero.paused) markPlaying();
  }

  // Autoplay only in the visible portion of the page.
  const updatePlayback = () => {
    for (const video of videos) {
      if (!document.hidden && !reducedMotion.matches && inViewport(video)) safePlay(video);
      else video.pause();
    }
  };

  if ('IntersectionObserver' in window) {
    const preloadObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '500px 0px' });

    const playbackObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !document.hidden && !reducedMotion.matches) safePlay(entry.target);
        else entry.target.pause();
      }
    }, { threshold: 0.05 });

    for (const video of videos) {
      if (video.querySelector('source[data-src]')) preloadObserver.observe(video);
      playbackObserver.observe(video);
    }
  } else {
    // Older browsers still load and play videos when needed.
    window.addEventListener('scroll', updatePlayback, { passive:true });
    window.addEventListener('resize', updatePlayback);
    updatePlayback();
  }

  document.addEventListener('visibilitychange', updatePlayback);
  if (typeof reducedMotion.addEventListener === 'function')
    reducedMotion.addEventListener('change', updatePlayback);
  else if (typeof reducedMotion.addListener === 'function')
    reducedMotion.addListener(updatePlayback);
  if (reducedMotion.matches) videos.forEach(video => video.pause());
})();
