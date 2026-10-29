// Shared page interactions. Lead delivery is isolated in lead-form.js.
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileViewport = window.matchMedia('(max-width: 768px)');
  const mobileNavigation = window.matchMedia('(max-width: 850px)');
  const nav = document.getElementById('mainNav');
  const contact = document.getElementById('contact');
  const serviceSelect = document.getElementById('service');
  const locationSelect = document.getElementById('location');
  const menuButton = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const closeButton = document.getElementById('mobileDrawerClose');
  let drawerOpen = false;
  let previousFocus = null;
  let previousOverflow = '';
  let backgroundState = [];

  function drawerFocusables() {
    return Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]'))
      .filter(element => element.getClientRects().length > 0);
  }

  function openDrawer() {
    if (!drawer || drawerOpen) return;
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    drawerOpen = true;
    drawer.inert = false;
    drawer.removeAttribute('aria-hidden');
    drawer.classList.add('active');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Keep keyboard and assistive-technology navigation inside the open menu.
    backgroundState = Array.from(document.body.children)
      .filter(element => element !== drawer && !element.contains(drawer))
      .map(element => ({ element, inert: element.inert }));
    backgroundState.forEach(({ element }) => { element.inert = true; });
    (closeButton || drawerFocusables()[0] || drawer).focus();
    updateDock();
  }

  function closeDrawer() {
    if (!drawer || !drawerOpen) return;
    drawerOpen = false;
    backgroundState.forEach(({ element, inert }) => { element.inert = inert; });
    backgroundState = [];
    document.body.style.overflow = previousOverflow;
    drawer.classList.remove('active');
    if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    drawer.inert = true;
    drawer.setAttribute('aria-hidden', 'true');
    updateDock();
  }

  // Existing page links call these helpers directly.
  window.openDrawer = openDrawer;
  window.closeDrawer = closeDrawer;

  if (drawer) {
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Site navigation');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.tabIndex = -1;
    drawer.inert = true;
    drawer.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
      } else if (event.key === 'Tab') {
        const items = drawerFocusables();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) {
          event.preventDefault();
          drawer.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === drawer)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === drawer)) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    drawer.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', closeDrawer));
  }
  if (menuButton) {
    menuButton.type = 'button';
    menuButton.setAttribute('aria-controls', 'mobileDrawer');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.addEventListener('click', openDrawer);
  }
  if (closeButton) {
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close navigation menu');
    closeButton.addEventListener('click', closeDrawer);
  }

  function setKnownOption(select, value) {
    if (!select || !value || !Array.from(select.options).some(option => option.value === value)) return false;
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  function scrollEstimateIntoFullView() {
    if (!contact) return;
    closeDrawer();
    if (window.location.hash !== '#contact') {
      // Preserve the page and query string while making Back return to the previous section.
      try { window.history.pushState(null, '', '#contact'); } catch (_) { /* Local previews may restrict history. */ }
    }
    const target = document.getElementById('estimateConsole') || contact;
    const offset = (nav ? nav.getBoundingClientRect().height : 0) + 24;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
    const firstField = contact.querySelector('#fname, input:not([type="hidden"]):not([disabled]), select:not([disabled])');
    if (firstField) firstField.focus({ preventScroll: true });
    window.scrollTo({ top, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  window.scrollEstimateIntoFullView = scrollEstimateIntoFullView;
  window.selectServiceAndEstimate = (value, event) => {
    if (event) event.preventDefault();
    setKnownOption(serviceSelect, value);
    scrollEstimateIntoFullView();
  };
  window.selectAreaAndEstimate = (value, event) => {
    if (event) event.preventDefault();
    setKnownOption(locationSelect, value);
    scrollEstimateIntoFullView();
  };
  const params = new URLSearchParams(window.location.search);
  setKnownOption(serviceSelect, params.get('service'));
  setKnownOption(locationSelect, params.get('location'));

  // One quiet mobile action. It disappears as soon as the form is in view.
  let dock = document.getElementById('mobileThumbDock');
  if (!dock) {
    dock = document.createElement('div');
    dock.id = 'mobileThumbDock';
    dock.className = 'mobile-thumb-dock';
    document.body.appendChild(dock);
  }
  const estimateLink = document.createElement('a');
  estimateLink.href = contact ? '#contact' : 'estimate.html';
  estimateLink.className = 'mtd-btn mtd-estimate';
  estimateLink.textContent = 'Request a free estimate';
  dock.replaceChildren(estimateLink);

  function updateDock() {
    const rect = contact ? contact.getBoundingClientRect() : null;
    const contactVisible = Boolean(rect && rect.bottom > 0 && rect.top < window.innerHeight);
    const editing = document.activeElement && document.activeElement.matches('input, select, textarea');
    const show = mobileViewport.matches && window.scrollY > 600 && !contactVisible && !editing && !drawerOpen;
    dock.classList.toggle('dock-active', show);
    dock.hidden = !show;
    dock.inert = !show;
  }

  document.querySelectorAll('a[href="#contact"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.defaultPrevented || !contact) return;
      event.preventDefault();
      scrollEstimateIntoFullView();
    });
  });
  let scrollPending = false;
  function updateScrollState() {
    scrollPending = false;
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 40);
      nav.classList.remove('nav-hidden');
    }
    updateDock();
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });
  document.addEventListener('focusin', updateDock);
  document.addEventListener('focusout', () => window.requestAnimationFrame(updateDock));
  if ('IntersectionObserver' in window && contact) {
    new IntersectionObserver(updateDock).observe(contact);
  }
  updateScrollState();

  // Pointer and keyboard comparison controls; vertical touch gestures still scroll.
  document.querySelectorAll('.ba-frame').forEach((frame, index) => {
    const handle = frame.querySelector('.ba-handle');
    const after = frame.querySelector('.ba-after-img');
    if (!handle || !after) return;
    let percentage = 50;
    let drag = null;
    handle.tabIndex = 0;
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', `Before and after comparison ${index + 1}`);
    handle.setAttribute('aria-orientation', 'horizontal');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    frame.style.touchAction = 'pan-y pinch-zoom';
    handle.style.touchAction = 'pan-y pinch-zoom';

    function render(value) {
      percentage = Math.max(0, Math.min(100, value));
      after.style.clipPath = `inset(0 0 0 ${percentage}%)`;
      after.style.webkitClipPath = `inset(0 0 0 ${percentage}%)`;
      handle.style.left = `${percentage}%`;
      handle.setAttribute('aria-valuenow', String(Math.round(percentage)));
      handle.setAttribute('aria-valuetext', `${Math.round(percentage)}% before, ${100 - Math.round(percentage)}% after`);
    }
    function setFromPointer(clientX) {
      const rect = frame.getBoundingClientRect();
      if (rect.width) render((clientX - rect.left) / rect.width * 100);
    }
    frame.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: event.pointerType === 'mouse' };
      if (drag.horizontal) {
        frame.setPointerCapture(event.pointerId);
        handle.focus({ preventScroll: true });
        setFromPointer(event.clientX);
      }
    });
    frame.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      if (!drag.horizontal) {
        const dx = Math.abs(event.clientX - drag.x);
        const dy = Math.abs(event.clientY - drag.y);
        if (dy > 8 && dy > dx) {
          drag = null;
          return;
        }
        if (dx < 8 || dx <= dy) return;
        drag.horizontal = true;
        frame.setPointerCapture(event.pointerId);
      }
      setFromPointer(event.clientX);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => {
      frame.addEventListener(name, () => { drag = null; });
    });
    handle.addEventListener('keydown', event => {
      const steps = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 };
      if (Object.prototype.hasOwnProperty.call(steps, event.key)) {
        event.preventDefault();
        render(percentage + steps[event.key]);
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        render(event.key === 'Home' ? 0 : 100);
      }
    });
    render(percentage);
  });

  document.querySelectorAll('.faq-q').forEach((button, index) => {
    const item = button.closest('.faq-item');
    const answer = item && item.querySelector('.faq-a');
    if (!answer) return;
    button.type = 'button';
    answer.id = answer.id || `faq-answer-${index + 1}`;
    button.setAttribute('aria-controls', answer.id);
    function setExpanded(expanded) {
      button.setAttribute('aria-expanded', String(expanded));
      answer.hidden = !expanded;
      item.classList.toggle('open', expanded);
      const icon = button.querySelector('span');
      if (icon) {
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = expanded ? '−' : '+';
      }
    }
    setExpanded(item.classList.contains('open'));
    button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
  });

  const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  filterButtons.forEach(button => {
    button.type = 'button';
    button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    button.addEventListener('click', () => {
      filterButtons.forEach(other => {
        other.classList.toggle('active', other === button);
        other.setAttribute('aria-pressed', String(other === button));
      });
      portfolioCards.forEach(card => {
        const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.hidden = !show;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  const desktopVideo = document.getElementById('heroVideoDesktop');
  const mobileVideo = document.getElementById('heroVideoMobile');
  let videoPaused = reducedMotion.matches;
  const hero = document.querySelector('.hero');
  const videoControl = hero && (desktopVideo || mobileVideo) ? document.createElement('button') : null;
  if (videoControl) {
    videoControl.type = 'button';
    videoControl.className = 'video-control';
    videoControl.addEventListener('click', () => {
      videoPaused = !videoPaused;
      updateHeroVideo();
    });
    hero.appendChild(videoControl);
  }
  function updateHeroVideo() {
    [desktopVideo, mobileVideo].forEach(video => {
      if (!video) return;
      const selected = mobileViewport.matches ? video === mobileVideo : video === desktopVideo;
      video.style.display = selected ? 'block' : 'none';
      video.autoplay = false;
      video.setAttribute('aria-hidden', 'true');
      video.tabIndex = -1;
      if (!selected || videoPaused || document.hidden) {
        video.pause();
      } else {
        video.muted = true;
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') playing.catch(() => {});
      }
    });
    if (videoControl) videoControl.textContent = videoPaused ? 'Play background video' : 'Pause background video';
  }
  mobileViewport.addEventListener('change', () => {
    updateHeroVideo();
    updateDock();
  });
  mobileNavigation.addEventListener('change', () => { if (!mobileNavigation.matches) closeDrawer(); });
  reducedMotion.addEventListener('change', () => { videoPaused = reducedMotion.matches; updateHeroVideo(); });
  document.addEventListener('visibilitychange', updateHeroVideo);
  updateHeroVideo();

  document.querySelectorAll('img').forEach(img => {
    if (!img.closest('.hero, .page-hero, .nav') && img.getBoundingClientRect().top >= window.innerHeight) {
      if (!img.hasAttribute('loading')) img.loading = 'lazy';
      if (!img.hasAttribute('decoding')) img.decoding = 'async';
    }
  });

    // ── Thank-You Modal ───────────────────────────────────────────────────────
  // Injected entirely via JS — zero static HTML in the page, so it can never
  // appear in the source or render below the footer in any browser mode.
  (function () {
    var formSuccessEl = document.getElementById('formSuccess');
    if (!formSuccessEl) return; // page has no lead form

    // Build the modal and append it to body
    var overlay = document.createElement('div');
    overlay.className = 'ty-modal-overlay';
    overlay.id = 'tyModal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'tyModalTitle');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = [
      '<div class="ty-modal">',
        '<button class="ty-modal-close" id="tyModalClose" aria-label="Close this message">&times;</button>',
        '<div class="ty-icon-wrap" aria-hidden="true">',
          '<svg class="ty-check-svg" viewBox="0 0 52 52" aria-hidden="true"><polyline points="14,26 22,34 38,18"/></svg>',
        '</div>',
        '<span class="ty-label-pill"><span class="ty-label-dot" aria-hidden="true"></span>Request Received</span>',
        '<h2 id="tyModalTitle">Thank You &mdash; We\'ll Be In Touch!</h2>',
        '<p class="ty-modal-sub">Your free estimate request has been received by Alaska Handyman Services. Our Anchorage team will review your project details and follow up promptly.</p>',
        '<div class="ty-next-steps" aria-label="What happens next">',
          '<div class="ty-step"><span class="ty-step-num" aria-hidden="true">1</span><span><strong>Review</strong> &mdash; We\'ll review your service request and project notes right away.</span></div>',
          '<div class="ty-step"><span class="ty-step-num" aria-hidden="true">2</span><span><strong>Contact</strong> &mdash; Expect a call or email to confirm details and schedule your visit.</span></div>',
          '<div class="ty-step"><span class="ty-step-num" aria-hidden="true">3</span><span><strong>Estimate</strong> &mdash; You\'ll receive a 100% free, no-obligation written estimate.</span></div>',
        '</div>',
        '<div class="ty-modal-actions">',
          '<button class="ty-btn-primary" id="tyModalDone">Done &mdash; Got It!</button>',
          '<a href="tel:+19077448725" class="ty-btn-secondary">&#128222; Call Us Now</a>',
        '</div>',
        '<p class="ty-modal-footer-note">Need to reach us sooner? Email us at <a href="mailto:alaskahandymanservices907@gmail.com">alaskahandymanservices907@gmail.com</a> or call <a href="tel:+19077448725">(907) 744-8725</a>.</p>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    var tyClose = document.getElementById('tyModalClose');
    var tyDone  = document.getElementById('tyModalDone');

    function openModal() {
      overlay.classList.add('ty-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var first = overlay.querySelector('button, a[href]');
      if (first) first.focus();
    }

    function closeModal() {
      overlay.classList.remove('ty-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (tyClose) tyClose.addEventListener('click', closeModal);
    if (tyDone)  tyDone.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('ty-open')) {
        e.preventDefault();
        closeModal();
      }
    });

    // Watch formSuccess becoming visible → open the modal
    if ('MutationObserver' in window) {
      var obs = new MutationObserver(function () {
        if (!formSuccessEl.hidden) openModal();
      });
      obs.observe(formSuccessEl, { attributes: true, attributeFilter: ['hidden', 'style'] });
    }
  }());
})();
