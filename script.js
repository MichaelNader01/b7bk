(() => {
  const introEl = document.getElementById('intro');
  const heartSceneEl = document.getElementById('heartScene');
  const heartParticlesEl = document.getElementById('heartParticles');

  const stageEl = document.getElementById('stage');
  const pageWelcome = document.getElementById('page-welcome');
  const pageNext = document.getElementById('page-next');
  const pageThird = document.getElementById('page-third');

  const mainTitle = document.getElementById('mainTitle');
  const startBtn = document.getElementById('startBtn');
  const backBtn = document.getElementById('backBtn');
  const backToGameBtn = document.getElementById('backToGameBtn');

  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  const choiceArea = document.getElementById('choiceArea');
  const gameCard = document.getElementById('gameCard');

  const galleryEl = document.getElementById('gallery');
  const bgMusic = document.getElementById('bgMusic');

  const welcomeCard = document.getElementById('welcomeCard');

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function startMusicOnce() {
    if (!bgMusic) return;
    if (prefersReducedMotion()) return;
    if ((bgMusic.dataset && bgMusic.dataset.started) === 'true') return;

    bgMusic.dataset.started = 'true';
    bgMusic.volume = 0.12;

    const p = bgMusic.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        bgMusic.dataset.started = 'false';
      });
    }
  }

  function initGallery() {
    if (!galleryEl) return;
    const frames = Array.from(galleryEl.querySelectorAll('.frame'));

    frames.forEach((frame, idx) => {
      frame.style.setProperty('--stagger', `${idx * 150}ms`);

      // Enhanced hover effect
      frame.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion()) {
          frame.style.transform = 'scale(1.05) translateY(-4px)';
        }
      });

      frame.addEventListener('mouseleave', () => {
        if (!frame.classList.contains('is-active')) {
          frame.style.transform = '';
        }
      });

      frame.addEventListener('click', (e) => {
        e.preventDefault();
        startMusicOnce();

        frames.forEach((f) => {
          f.classList.remove('is-active');
          f.style.transform = '';
        });
        frame.classList.add('is-active');

        const rect = frame.getBoundingClientRect();
        popHearts(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          prefersReducedMotion() ? 8 : 16
        );

        const dest = frame.getAttribute('data-dest') || frame.getAttribute('href') || '';
        window.setTimeout(() => {
          if (dest) window.location.href = dest;
        }, prefersReducedMotion() ? 200 : 600);
      });
    });
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setIntroAriaHidden(hidden) {
    if (!introEl) return;
    introEl.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    introEl.classList.toggle('is-hidden', hidden);
  }

  function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x, y };
  }

  function buildHeartParticles() {
    if (!heartParticlesEl) return { totalMs: 0 };
    heartParticlesEl.innerHTML = '';

    const reduced = prefersReducedMotion();
    const count = reduced ? 50 : 100;

    const containerSize = Math.min(window.innerWidth, 430) * 0.76;
    const scale = containerSize / 40;

    let maxEnd = 0;
    for (let i = 0; i < count; i += 1) {
      const p = document.createElement('div');
      p.className = 'heart-p';

      const t = (i / count) * Math.PI * 2;
      const base = heartPoint(t);

      const jitter = reduced ? 0.7 : 1.5;
      const ex = base.x * scale + rand(-jitter, jitter) * 2.8;
      const ey = -base.y * scale + rand(-jitter, jitter) * 2.8;

      const sx = rand(-containerSize * 0.65, containerSize * 0.65);
      const sy = rand(-containerSize * 0.75, containerSize * 0.75);

      const delay = reduced ? rand(150, 500) : rand(200, 1000);
      const dur = reduced ? rand(600, 1000) : rand(850, 1500);

      p.style.setProperty('--sx', `${sx.toFixed(1)}px`);
      p.style.setProperty('--sy', `${sy.toFixed(1)}px`);
      p.style.setProperty('--ex', `${ex.toFixed(1)}px`);
      p.style.setProperty('--ey', `${ey.toFixed(1)}px`);
      p.style.setProperty('--delay', `${delay.toFixed(0)}ms`);
      p.style.setProperty('--dur', `${dur.toFixed(0)}ms`);

      const bdelay = rand(0, 150);
      const angle = rand(0, Math.PI * 2);
      const dist = rand(containerSize * 0.2, containerSize * 0.55);
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;
      p.style.setProperty('--bdelay', `${bdelay.toFixed(0)}ms`);
      p.style.setProperty('--bx', `${bx.toFixed(1)}px`);
      p.style.setProperty('--by', `${by.toFixed(1)}px`);

      const end = delay + dur;
      if (end > maxEnd) maxEnd = end;

      heartParticlesEl.appendChild(p);
    }

    return { totalMs: maxEnd };
  }

  function getTextForTyping(el) {
    const raw = (el.textContent || '').trim();
    return raw;
  }

  function setTypingText(el, text) {
    el.textContent = text;

    const heart = document.createElement('span');
    heart.className = 'title__heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = '🤍';
    el.appendChild(document.createTextNode(' '));
    el.appendChild(heart);
  }

  function runTyping(el, fullText) {
    if (!el) return;

    if (prefersReducedMotion()) {
      setTypingText(el, fullText);
      return;
    }

    el.classList.add('typing');

    let i = 0;
    const stepMs = 45;

    const baseText = fullText.replace('🤍', '').trim();
    const timer = window.setInterval(() => {
      i += 1;
      const slice = baseText.slice(0, i);
      el.textContent = slice;

      if (i >= baseText.length) {
        window.clearInterval(timer);
        el.classList.remove('typing');
        setTypingText(el, baseText);
      }
    }, stepMs);
  }

  function setActivePage(nextId) {
    const pages = stageEl ? stageEl.querySelectorAll('.page') : [];
    pages.forEach((p) => {
      const isActive = p.id === nextId;
      p.classList.toggle('page--active', isActive);
      p.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function popHearts(x, y, count) {
    const reduced = prefersReducedMotion();
    const n = reduced ? Math.min(5, count) : count;
    const symbols = ['❤', '🤍', '💕'];

    for (let i = 0; i < n; i += 1) {
      const b = document.createElement('div');
      b.className = 'burst';
      b.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      const angle = rand(0, Math.PI * 2);
      const dist = rand(20, 70);
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;

      b.style.left = `${x}px`;
      b.style.top = `${y}px`;
      b.style.setProperty('--bx', `${bx.toFixed(1)}px`);
      b.style.setProperty('--by', `${by.toFixed(1)}px`);
      b.style.fontSize = `${rand(14, 20).toFixed(0)}px`;

      document.body.appendChild(b);
      window.setTimeout(() => b.remove(), 750);
    }
  }

  function resetGameState() {
    pageNext?.classList.remove('game-win');
    gameCard?.classList.remove('game-win');

    if (noBtn) {
      noBtn.hidden = false;
      noBtn.removeAttribute('aria-hidden');
      noBtn.style.opacity = '';
      noBtn.style.pointerEvents = '';

      noBtn.classList.remove('is-escaped');
      noBtn.style.left = '';
      noBtn.style.top = '';

      if (choiceArea && !choiceArea.contains(noBtn)) {
        choiceArea.prepend(noBtn);
      }
    }
  }

  function escapeNoButtonFirstTime() {
    if (!noBtn || !choiceArea) return;
    if (noBtn.classList.contains('is-escaped')) return;

    choiceArea.removeChild(noBtn);
    document.body.appendChild(noBtn);
    noBtn.classList.add('is-escaped');
  }

  function moveNoButton() {
    if (!noBtn) return;
    if (pageNext && !pageNext.classList.contains('page--active')) return;
    if (pageNext?.classList.contains('game-win')) return;

    if (!noBtn.classList.contains('is-escaped')) {
      escapeNoButtonFirstTime();
    }

    const prevRect = noBtn.getBoundingClientRect();
    const prevX = prevRect.left + prevRect.width / 2;
    const prevY = prevRect.top + prevRect.height / 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const buttonWidth = prevRect.width;
    const buttonHeight = prevRect.height;

    const padding = 10;
    const maxX = viewportWidth - buttonWidth - padding;
    const maxY = viewportHeight - buttonHeight - padding;

    const safeMaxX = Math.max(0, maxX);
    const safeMaxY = Math.max(0, maxY);

    let left = rand(padding, safeMaxX);
    let top = rand(padding, safeMaxY);

    const dx = Math.abs(left - prevRect.left);
    const dy = Math.abs(top - prevRect.top);
    if (dx < 60 && dy < 60) {
      left = rand(padding, safeMaxX);
      top = rand(padding, safeMaxY);
    }

    left = clamp(left, padding, Math.max(padding, maxX));
    top = clamp(top, padding, Math.max(padding, maxY));

    popHearts(prevX, prevY, 6);

    noBtn.classList.add('no-pop');
    window.setTimeout(() => noBtn.classList.remove('no-pop'), 300);

    noBtn.style.left = `${left.toFixed(0)}px`;
    noBtn.style.top = `${top.toFixed(0)}px`;
  }

  function resetIntroState() {
    heartSceneEl?.classList.remove('is-breaking', 'is-floating', 'is-complete');
    welcomeCard?.classList.remove('is-visible');

    if (mainTitle) {
      const fullText = getTextForTyping(mainTitle);
      mainTitle.textContent = fullText;
    }
  }

  function init() {
    if (window.location.hash === '#gallery') {
      setIntroAriaHidden(true);
      setActivePage('page-third');
      initGallery();
      return;
    }

    setIntroAriaHidden(false);

    resetIntroState();

    const { totalMs } = buildHeartParticles();
    const settleMs = prefersReducedMotion() ? 300 : 450;

    window.setTimeout(() => {
      heartSceneEl?.classList.add('is-complete');
    }, Math.max(0, totalMs - 250));

    window.setTimeout(() => {
      heartSceneEl?.classList.add('is-floating');
    }, totalMs + settleMs);

    window.setTimeout(() => {
      welcomeCard?.classList.add('is-visible');

      setIntroAriaHidden(true);

      if (mainTitle && mainTitle.hasAttribute('data-typing')) {
        const fullText = getTextForTyping(mainTitle);
        mainTitle.textContent = '';
        runTyping(mainTitle, fullText);
      }
    }, totalMs + settleMs + 250);

    // Enhanced button interactions
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const rect = startBtn.getBoundingClientRect();
        popHearts(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);

        if (heartSceneEl) {
          heartSceneEl.classList.add('is-breaking');
        }
        window.setTimeout(() => {
          setActivePage('page-next');
          resetGameState();
        }, prefersReducedMotion() ? 300 : 800);
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        setActivePage('page-welcome');
        setIntroAriaHidden(false);
        resetIntroState();
        buildHeartParticles();
        heartSceneEl?.classList.add('is-complete');
      });
    }

    if (backToGameBtn) {
      backToGameBtn.addEventListener('click', () => {
        setActivePage('page-next');
        resetGameState();
      });
    }
 
    document.addEventListener(
      'pointerdown',
      () => {
        startMusicOnce();
      },
      { passive: true, once: true }
    );

    const noHandlers = ['pointerdown', 'touchstart', 'click'];
    noHandlers.forEach((evt) => {
      noBtn?.addEventListener(
        evt,
        (e) => {
          e.preventDefault();
          moveNoButton();
        },
        { passive: false }
      );
    });

    if (yesBtn) {
      yesBtn.addEventListener('click', () => {
        if (!pageNext) return;
        pageNext.classList.add('game-win');

        startMusicOnce();

        if (noBtn) {
          noBtn.hidden = true;
          noBtn.setAttribute('aria-hidden', 'true');
          noBtn.style.opacity = '0';
          noBtn.style.pointerEvents = 'none';
        }

        const rect = pageNext.getBoundingClientRect();
        popHearts(
          rect.left + rect.width / 2,
          rect.top + rect.height * 0.4,
          prefersReducedMotion() ? 12 : 24
        );

        window.setTimeout(() => {
          setActivePage('page-third');
          initGallery();
        }, prefersReducedMotion() ? 500 : 1000);
      });
    }

    window.addEventListener(
      'resize',
      () => {
        if (
          !heartSceneEl?.classList.contains('is-breaking') &&
          pageWelcome?.classList.contains('page--active')
        ) {
          buildHeartParticles();
        }
      },
      { passive: true }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();