/* SeedSync media playback: avoid loading the middle video until it nears the viewport. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero-background-video');
  const middle = document.querySelector('.seed-video-break-media');
  if (!hero && !middle) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const safePlay = (video) => {
    if (!video || reduceMotion.matches || document.hidden) return;
    const result = video.play();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  };

  if (hero) {
    const markReady = () => hero.classList.add('is-ready');
    hero.addEventListener('playing', markReady);
    hero.addEventListener('error', () => hero.classList.remove('is-ready'));
    // Catch media errors from <source> as well as the video element.
    hero.querySelector('source')?.addEventListener('error', () => hero.classList.remove('is-ready'));
    if (hero.readyState >= 2 && !hero.paused) markReady();
    if (reduceMotion.matches) hero.pause();
  }

  let middleLoaded = false;
  const loadMiddle = () => {
    if (!middle || middleLoaded || reduceMotion.matches) return;
    const source = middle.querySelector('source[data-src]');
    if (!source) return;
    source.src = source.dataset.src;
    source.removeAttribute('data-src');
    middleLoaded = true;
    middle.load();
  };

  if ('IntersectionObserver' in window) {
    if (middle) {
      const preloadObserver = new IntersectionObserver((entries, observer) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMiddle();
          observer.disconnect();
        }
      }, { rootMargin: '500px 0px' });
      preloadObserver.observe(middle);
    }
    const playbackObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const video = entry.target;
        if (entry.isIntersecting && !reduceMotion.matches) {
          if (video === middle) loadMiddle();
          if (video !== middle || middleLoaded) safePlay(video);
        } else {
          video.pause();
        }
      }
    }, { threshold: 0.05 });
    if (hero) playbackObserver.observe(hero);
    if (middle) playbackObserver.observe(middle);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        hero?.pause();
        middle?.pause();
      } else {
        for (const video of [hero, middle]) {
          if (video && video.getBoundingClientRect().bottom > 0 &&
              video.getBoundingClientRect().top < window.innerHeight) safePlay(video);
        }
      }
    });
    const onMotionChange = () => {
      if (reduceMotion.matches) {
        hero?.pause();
        middle?.pause();
      } else if (!document.hidden) {
        for (const video of [hero, middle]) {
          if (video && video.getBoundingClientRect().bottom > 0 &&
              video.getBoundingClientRect().top < window.innerHeight) {
            if (video === middle) loadMiddle();
            safePlay(video);
          }
        }
      }
    };
    reduceMotion.addEventListener?.('change', onMotionChange);
  } else {
    // Older browsers: load the second video immediately rather than leaving it blank.
    loadMiddle();
    if (hero && !reduceMotion.matches) safePlay(hero);
    if (middle && !reduceMotion.matches) safePlay(middle);
  }
})();
