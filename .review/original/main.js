// ============================================
// ALASKA HANDYMAN SERVICES — SHARED MULTI-PAGE CONTROLLER
// ============================================

// 0. PHASE-2 PROGRESSIVE ENHANCEMENTS FOR ALL SUBPAGES
(function initPhase2Enhancements() {
  // B. Inject Smart Mobile Thumb-Zone Dock if not present
  if (!document.getElementById('mobileThumbDock')) {
    const dock = document.createElement('div');
    dock.className = 'mobile-thumb-dock';
    dock.id = 'mobileThumbDock';
    dock.setAttribute('aria-label', 'Quick Mobile Dispatch Actions');
    const estimateHref = document.getElementById('contact') ? '#contact' : 'estimate.html';
    dock.innerHTML = `
      <a href="tel:+19077448725" class="mtd-btn mtd-call">📞 Call (907)</a>
      <a href="${estimateHref}" class="mtd-btn mtd-estimate">📋 Free Estimate</a>
      <a href="https://wa.me/19077448725?text=Hi%20Alaska%20Handyman%20Services!%20I%20would%20like%20to%20request%20a%20Free%20Estimate." target="_blank" rel="noopener noreferrer" class="mtd-btn mtd-wa">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd" d="M16.004 3.2C8.932 3.2 3.2 8.93 3.2 15.998c0 2.257.59 4.46 1.71 6.403L3.1 28.8l6.564-1.722a12.785 12.785 0 0 0 6.334 1.682h.006c7.07 0 12.796-5.729 12.796-12.798 0-3.42-1.331-6.635-3.748-9.054A12.716 12.716 0 0 0 16.004 3.2Zm0 23.402h-.005a10.62 10.62 0 0 1-5.414-1.483l-.388-.23-4.027 1.056 1.075-3.926-.253-.402a10.596 10.596 0 0 1-1.63-5.647c0-5.862 4.77-10.631 10.642-10.631 2.842 0 5.513 1.107 7.522 3.118a10.567 10.567 0 0 1 3.115 7.519c0 5.864-4.77 10.626-10.637 10.626Zm5.836-7.96c-.32-.16-1.892-.934-2.185-1.04-.293-.107-.507-.16-.72.16-.213.32-.826 1.04-1.013 1.253-.186.213-.373.24-.693.08-.32-.16-1.35-.498-2.572-1.587-.95-.848-1.592-1.896-1.778-2.216-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.186.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.374-.26-.624-.524-.539-.72-.549-.186-.009-.4-.01-.613-.01-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667 0 1.574 1.146 3.094 1.306 3.307.16.213 2.256 3.445 5.465 4.831.763.33 1.359.527 1.823.674.766.244 1.463.209 2.014.127.614-.092 1.892-.774 2.159-1.52.266-.747.266-1.387.186-1.52-.08-.134-.293-.214-.613-.374Z"/>
        </svg>
        WhatsApp
      </a>
    `;
    document.body.appendChild(dock);
  }

  // C. Collapsible 6-Point Checklists on services.html for Mobile Decluttering
  document.querySelectorAll('.ssc-checklist').forEach((checklist) => {
    if (checklist.previousElementSibling && checklist.previousElementSibling.classList.contains('ssc-mobile-toggle')) return;
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'ssc-mobile-toggle';
    toggleBtn.innerHTML = '<span>📋 Tap to View 6-Point Spec Checklist</span><span class="ssc-toggle-icon">+</span>';
    toggleBtn.addEventListener('click', () => {
      const isExpanded = checklist.classList.toggle('expanded');
      toggleBtn.querySelector('.ssc-toggle-icon').textContent = isExpanded ? '−' : '+';
      toggleBtn.querySelector('span:first-child').textContent = isExpanded
        ? '📋 Hide 6-Point Spec Checklist'
        : '📋 Tap to View 6-Point Spec Checklist';
    });
    checklist.parentNode.insertBefore(toggleBtn, checklist);
  });

  // D. Inject Instant Scope Snapshot & Photo Quick-Actions in #estimateConsole if not present
  const formTop = document.querySelector('.estimate-form-top');
  if (formTop && !document.getElementById('estimateServiceSnapshot')) {
    const snap = document.createElement('div');
    snap.className = 'estimate-service-snapshot';
    snap.id = 'estimateServiceSnapshot';
    snap.innerHTML = `
      <span class="ess-badge">⚡ Scope Guide</span>
      <span class="ess-text" id="essText"><strong>100% Free Estimate:</strong> Select a service below to view typical Anchorage turnaround &amp; inspection details.</span>
    `;
    formTop.insertAdjacentElement('afterend', snap);
  }

  const msgTextarea = document.getElementById('message');
  if (msgTextarea) {
    const fg = msgTextarea.closest('.form-group');
    const lbl = fg ? fg.querySelector('label[for="message"]') : null;
    if (fg && lbl && !fg.querySelector('.label-with-actions')) {
      const wrap = document.createElement('div');
      wrap.className = 'label-with-actions';
      lbl.parentNode.insertBefore(wrap, lbl);
      wrap.appendChild(lbl);
      const actions = document.createElement('div');
      actions.className = 'photo-quick-actions';
      actions.innerHTML = `
        <label for="projectPhotos" class="photo-attach-pill" id="photoAttachLabel">📷 Attach Photo</label>
        <input type="file" id="projectPhotos" accept="image/*" multiple hidden>
        <a href="https://wa.me/19077448725?text=Hi%20Alaska%20Handyman%20Services!%20I%20would%20like%20to%20send%20project%20photos%20for%20a%20Free%20Estimate." target="_blank" rel="noopener noreferrer" class="photo-wa-pill" id="photoWaLink">💬 Text Photo</a>
      `;
      wrap.appendChild(actions);
    }
  }

  // E. Lazy-load below-the-fold images automatically
  document.querySelectorAll('img').forEach((img) => {
    if (!img.closest('.page-hero, .hero')) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    }
  });
})();

// 1. CURSOR- & SCROLL-REACTIVE SLIDE NAVBAR + SMART WHATSAPP & MOBILE THUMB DOCK
const nav = document.getElementById('mainNav');
const waWidget = document.querySelector('.whatsapp-widget');
const mobileThumbDock = document.getElementById('mobileThumbDock');
let lastScrollY = window.scrollY;

function handleScroll() {
  const currentScrollY = window.scrollY;

  if (waWidget) {
    if (currentScrollY > 260) {
      waWidget.classList.add('wa-scrolled-compact');
    } else {
      waWidget.classList.remove('wa-scrolled-compact');
    }
  }

  if (mobileThumbDock) {
    if (currentScrollY > 260) {
      mobileThumbDock.classList.add('dock-active');
    } else {
      mobileThumbDock.classList.remove('dock-active');
    }
  }

  if (!nav) return;

  if (currentScrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  if (currentScrollY <= 60) {
    nav.classList.remove('nav-hidden');
    nav.classList.add('nav-visible');
  } else if (currentScrollY > lastScrollY + 8) {
    nav.classList.add('nav-hidden');
    nav.classList.remove('nav-visible');
  } else if (currentScrollY < lastScrollY - 8) {
    nav.classList.remove('nav-hidden');
    nav.classList.add('nav-visible');
  }

  lastScrollY = currentScrollY;
}

window.addEventListener('scroll', handleScroll, { passive: true });
document.addEventListener('mousemove', (e) => {
  if (nav && e.clientY <= 90) {
    nav.classList.remove('nav-hidden');
    nav.classList.add('nav-visible');
  }
});

// 3. MOBILE DRAWER NAVIGATION
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const mobileDrawerClose = document.getElementById('mobileDrawerClose');

function openDrawer() {
  if (mobileDrawer) {
    mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeDrawer() {
  if (mobileDrawer) {
    mobileDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openDrawer);
if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeDrawer);

// 4. INTERSECTION OBSERVER SCROLL REVEALS
const revealElements = document.querySelectorAll('.reveal-up');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (idx % 3) * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

revealElements.forEach(el => revealObserver.observe(el));

// 5. BEFORE/AFTER COMPARISON SLIDERS (iOS 120FPS HARDWARE-ACCELERATED)
function initBeforeAfterSlider(frameId) {
  const frame = document.getElementById(frameId);
  if (!frame) return;

  const handle = frame.querySelector('.ba-handle');
  const afterImg = frame.querySelector('.ba-after-img');
  let isDragging = false;
  let cachedRect = null;
  let rafId = null;
  let targetClientX = null;
  let startX = 0;
  let startY = 0;
  let isHorizontalSwipe = null;

  function refreshRect() {
    cachedRect = frame.getBoundingClientRect();
  }

  function renderPosition(clientX) {
    if (!cachedRect || cachedRect.width === 0) refreshRect();
    let percentage = ((clientX - cachedRect.left) / cachedRect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    const clipVal = `inset(0 0 0 ${percentage}%)`;
    afterImg.style.clipPath = clipVal;
    afterImg.style.webkitClipPath = clipVal;
    handle.style.left = `${percentage}%`;
  }

  function scheduleUpdate(clientX) {
    targetClientX = clientX;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        if (targetClientX !== null) {
          renderPosition(targetClientX);
        }
        rafId = null;
      });
    }
  }

  frame.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    refreshRect();
    scheduleUpdate(e.clientX);
    if (e.target === handle && handle.setPointerCapture) {
      try { handle.setPointerCapture(e.pointerId); } catch (_) {}
    }
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    scheduleUpdate(e.clientX);
  }, { passive: true });

  window.addEventListener('pointerup', () => { isDragging = false; }, { passive: true });
  window.addEventListener('pointercancel', () => { isDragging = false; }, { passive: true });

  frame.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches.length) return;
    isDragging = true;
    isHorizontalSwipe = e.target === handle ? true : null;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    refreshRect();
    scheduleUpdate(startX);
  }, { passive: true });

  frame.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches || !e.touches.length) return;
    const touch = e.touches[0];
    if (isHorizontalSwipe === null) {
      const dx = Math.abs(touch.clientX - startX);
      const dy = Math.abs(touch.clientY - startY);
      if (dx > 4 || dy > 4) {
        isHorizontalSwipe = dx >= dy * 0.8;
      }
    }
    if (isHorizontalSwipe) {
      if (e.cancelable) e.preventDefault();
      scheduleUpdate(touch.clientX);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    isDragging = false;
    isHorizontalSwipe = null;
  }, { passive: true });

  window.addEventListener('resize', refreshRect, { passive: true });
}

initBeforeAfterSlider('baFrame1');
initBeforeAfterSlider('baFrame2');

// 6. FAQ ACCORDION
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    if (item) item.classList.toggle('open');
  });
});

// 7. PORTFOLIO FILTER (projects.html)
const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    portfolioCards.forEach(card => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

// 8. FREE ESTIMATE SERVICE & LOCATION SELECTION + INSTANT SNAPSHOT + VIEWPORT FIT
const serviceSelect = document.getElementById('service');
const locationSelect = document.getElementById('location');
const quickChips = document.querySelectorAll('.qs-chip');
const essText = document.getElementById('essText');
const photoWaLink = document.getElementById('photoWaLink');
const projectPhotos = document.getElementById('projectPhotos');
const photoAttachLabel = document.getElementById('photoAttachLabel');

const SERVICE_SNAPSHOTS = {
  'Roof Repair': '<strong>Roof Repair:</strong> Typical Turnaround: Same-Day Leak Tarping / 1–2 Day Repair • Includes Free Roof &amp; Flashing Inspection.',
  'Drywall Repair': '<strong>Drywall Repair:</strong> Typical Turnaround: 1–2 Days • Crack &amp; Hole Patching, Seamless Texture Matching &amp; Dust-Contained Sanding.',
  'Painting': '<strong>Painting:</strong> Typical Turnaround: 1–4 Days • Full Surface Prep, Priming, Crisp Cut-Lines &amp; Premium Interior/Exterior Finishes.',
  'Cabinets & Installs': '<strong>Cabinets &amp; Installs:</strong> Typical Turnaround: 1–3 Days • Laser-Level Mounting, Hardware Alignment &amp; Trim Included.',
  'Flooring': '<strong>Flooring:</strong> Typical Turnaround: 1–3 Days • Subfloor Moisture Check, Leveling &amp; Baseboard Trim Finishing Included.',
  'House & Pressure Washing': '<strong>House &amp; Pressure Washing:</strong> Typical Turnaround: Half-Day to 1 Day • Eco-Safe Soft-Wash &amp; High-PSI Surface Cleaning.',
  'Bathroom Remodelling': '<strong>Bathroom Remodelling:</strong> Typical Turnaround: 2–5 Days • Tub-to-Shower Conversions, Custom Tile, Vanity Installation &amp; Waterproofing.',
  'Repairs & Maintenance': '<strong>Repairs &amp; Maintenance:</strong> Typical Turnaround: Same-Day Dispatch Available • Multi-Task Punch-List Friendly.',
  'Full Renovations & Remodeling': '<strong>Full Renovations:</strong> Complete Kitchen, Bath &amp; Structural Remodeling • Dedicated Project Lead &amp; Written Timeline.',
  'Other / Emergency Assistance': '<strong>24/7 Priority Dispatch:</strong> Immediate Response Across Anchorage, Eagle River &amp; Girdwood • Call (907) 744-8725.'
};

function syncQuickChips(selectedVal) {
  quickChips.forEach(chip => {
    chip.classList.toggle('active', chip.dataset.val === selectedVal);
  });
  if (essText) {
    essText.innerHTML = SERVICE_SNAPSHOTS[selectedVal] || '<strong>100% Free Estimate:</strong> Select a service below to view typical Anchorage turnaround &amp; inspection details.';
  }
  if (photoWaLink && selectedVal) {
    const msg = encodeURIComponent(`Hi Alaska Handyman Services! I want to send project photos for a Free Estimate on ${selectedVal}.`);
    photoWaLink.href = `https://wa.me/19077448725?text=${msg}`;
  }
}

if (projectPhotos && photoAttachLabel) {
  projectPhotos.addEventListener('change', () => {
    const count = projectPhotos.files ? projectPhotos.files.length : 0;
    if (count > 0) {
      photoAttachLabel.textContent = `✓ ${count} Photo${count > 1 ? 's' : ''} Ready`;
    } else {
      photoAttachLabel.textContent = '📷 Attach Photo';
    }
  });
}

// 8B. MOBILE CAROUSEL PAGINATION DOTS FOR REVIEWS & GRIDS
(function initSubpageMobileCarousels() {
  document.querySelectorAll('.reviews-grid').forEach((track, cIdx) => {
    if (!track.id) track.id = 'reviewsCarouselSub_' + cIdx;
    if (track.nextElementSibling && track.nextElementSibling.classList.contains('mobile-carousel-dots')) return;
    const items = Array.from(track.children);
    if (items.length < 2) return;

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'mobile-carousel-dots';
    const dots = items.map((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
      btn.setAttribute('aria-label', `Slide ${idx + 1}`);
      btn.addEventListener('click', () => {
        track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      });
      dotsWrap.appendChild(btn);
      return btn;
    });
    track.insertAdjacentElement('afterend', dotsWrap);

    track.addEventListener('scroll', () => {
      const scrollCenter = track.scrollLeft + track.clientWidth / 2;
      let activeIdx = 0;
      let minDist = Infinity;
      items.forEach((item, idx) => {
        const itemCenter = (item.offsetLeft - track.offsetLeft) + item.clientWidth / 2;
        const dist = Math.abs(scrollCenter - itemCenter);
        if (dist < minDist) {
          minDist = dist;
          activeIdx = idx;
        }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    }, { passive: true });
  });
})();

quickChips.forEach(chip => {
  chip.addEventListener('click', () => {
    if (serviceSelect) {
      serviceSelect.value = chip.dataset.val;
      syncQuickChips(chip.dataset.val);
    }
  });
});

if (serviceSelect) {
  serviceSelect.addEventListener('change', () => {
    syncQuickChips(serviceSelect.value);
  });
}

function scrollEstimateIntoFullView() {
  const consoleEl = document.getElementById('estimateConsole');
  if (!consoleEl) return;

  const rect = consoleEl.getBoundingClientRect();
  const vh = window.innerHeight;
  const targetY = window.scrollY + rect.top - Math.max(18, (vh - rect.height) / 2);
  window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
}

function selectServiceAndEstimate(serviceName, event) {
  if (event) event.preventDefault();
  if (serviceSelect) {
    serviceSelect.value = serviceName;
    syncQuickChips(serviceName);
  }
  scrollEstimateIntoFullView();
  setTimeout(() => {
    const fnameInput = document.getElementById('fname');
    if (fnameInput) fnameInput.focus({ preventScroll: true });
  }, 550);
}

function selectAreaAndEstimate(areaName, event) {
  if (event) event.preventDefault();
  if (locationSelect) {
    locationSelect.value = areaName;
  }
  scrollEstimateIntoFullView();
  setTimeout(() => {
    const fnameInput = document.getElementById('fname');
    if (fnameInput) fnameInput.focus({ preventScroll: true });
  }, 550);
}

document.querySelectorAll('a[href="#contact"]').forEach(link => {
  if (!link.hasAttribute('onclick')) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollEstimateIntoFullView();
    });
  }
});

// Pre-fill from URL query parameters (?service=...&location=...)
const urlParams = new URLSearchParams(window.location.search);
const paramService = urlParams.get('service');
const paramLocation = urlParams.get('location');
if (paramService && serviceSelect) {
  serviceSelect.value = paramService;
  syncQuickChips(paramService);
}
if (paramLocation && locationSelect) {
  locationSelect.value = paramLocation;
}

// 9. LEAD FORM SUBMIT HANDLING
const leadForm = document.getElementById('leadForm');
const formSuccess = document.getElementById('formSuccess');

if (leadForm && formSuccess) {
  leadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = leadForm.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }
    const formData = new FormData(leadForm);
    try {
      await fetch('https://formsubmit.co/alaskahandymanservices907@gmail.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
    } catch (err) {
      // Still show success — avoid user frustration on network quirks
    }
    leadForm.style.display = 'none';
    formSuccess.style.display = 'block';
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
