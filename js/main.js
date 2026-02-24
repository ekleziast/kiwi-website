// main.js - Kiwi Voice website interactivity
// Requires i18n.js to be loaded first

// --- DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
  initScrollReveal();
  initMobileMenu();
  initParticles();
  initTerminalAnimation();
  initSmoothScroll();
  initNavHighlight();
  initCopyButtons();
  initOsTabs();
  initUnifiedScroll();
  initBackToTop();
  initThemeToggle();
  initNumberAnimation();
  initFAQ();
});

// --- Scroll Reveal (Intersection Observer) ---
// Adds .active class to elements when they scroll into view
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    observer.observe(el);
  });
}

// --- Unified Scroll Handler ---
// Single scroll listener with rAF-gate for nav, progress bar, and back-to-top
function initUnifiedScroll() {
  const nav = document.getElementById('navbar');
  const progressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Nav background
        if (nav) {
          nav.classList.toggle('nav-scrolled', scrollY > 50);
        }

        // Scroll progress
        if (progressBar) {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          progressBar.style.width = (docHeight > 0 ? (scrollY / docHeight) * 100 : 0) + '%';
        }

        // Back to top visibility
        if (backToTopBtn) {
          backToTopBtn.classList.toggle('visible', scrollY > 600);
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// --- Mobile Menu ---
// Toggles mobile navigation overlay and hamburger/X icon
function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('mobile-toggle-icon');
  if (!toggle || !menu) return;

  const links = menu.querySelectorAll('a');

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    document.body.classList.toggle('overflow-hidden', isOpen);
    if (icon) {
      icon.className = isOpen ? 'fa-solid fa-xmark text-xl' : 'fa-solid fa-bars text-xl';
    }
  });

  // Close menu when clicking a link
  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.classList.remove('overflow-hidden');
      if (icon) {
        icon.className = 'fa-solid fa-bars text-xl';
      }
    });
  });
}

// --- Particle Background (Canvas) ---
// Lightweight particle network animation for the hero section
// Pauses when offscreen via IntersectionObserver; uses distSq + batched strokes
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 50;
  const MAX_DIST = 150;
  const MAX_DIST_SQ = MAX_DIST * MAX_DIST;
  let animationId = null;
  let isVisible = false;
  let resizeTimer = null;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  function debouncedResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
    ctx.fill();
  }

  // Batched connections: group by alpha bands to minimize stroke() calls
  function drawConnections() {
    const bands = [[], [], [], []];
    const alphas = [0.08, 0.06, 0.035, 0.015];

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < MAX_DIST_SQ) {
          const band = Math.min(3, (distSq / MAX_DIST_SQ * 4) | 0);
          bands[band].push(i, j);
        }
      }
    }

    ctx.lineWidth = 0.5;
    for (let b = 0; b < 4; b++) {
      if (bands[b].length === 0) continue;
      ctx.strokeStyle = `rgba(16, 185, 129, ${alphas[b]})`;
      ctx.beginPath();
      for (let k = 0; k < bands[b].length; k += 2) {
        const pi = particles[bands[b][k]];
        const pj = particles[bands[b][k + 1]];
        ctx.moveTo(pi.x, pi.y);
        ctx.lineTo(pj.x, pj.y);
      }
      ctx.stroke();
    }
  }

  function update() {
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
  }

  function animate() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    update();
    drawConnections();
    particles.forEach(drawParticle);
    animationId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!isVisible) {
      isVisible = true;
      animationId = requestAnimationFrame(animate);
    }
  }

  function stopAnimation() {
    isVisible = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Pause/resume when canvas scrolls in/out of viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });
  }, { threshold: 0 });

  init();
  observer.observe(canvas);

  window.addEventListener('resize', debouncedResize);
}

// --- Terminal Typing Animation ---
// Re-triggers CSS typing animations when the terminal scrolls into view
function initTerminalAnimation() {
  const terminal = document.getElementById('terminal-content');
  if (!terminal) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lines = entry.target.querySelectorAll('.terminal-line');
        // Batch: clear all animations first
        lines.forEach(line => { line.style.animation = 'none'; });
        // Single reflow for the batch
        void entry.target.offsetHeight;
        // Restore all animations
        lines.forEach(line => { line.style.animation = ''; });
      }
    });
  }, { threshold: 0.5 });

  observer.observe(terminal);
}

// --- Smooth Scroll for Anchor Links ---
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ block: 'start' });
      }
    });
  });
}

// --- Active Navigation Highlighting ---
// Highlights the nav link corresponding to the currently visible section
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));
}

// --- OS Tabs (Quick Start) ---
// Switches between Linux/macOS and Windows install instructions
function initOsTabs() {
  const tabs = document.querySelectorAll('.os-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const os = tab.dataset.os;

      // Update tab styles
      tabs.forEach(t => {
        if (t.dataset.os === os) {
          t.classList.add('active');
          t.classList.remove('bg-white/5', 'border-white/10', 'text-slate-400');
          t.classList.add('bg-kiwi-500/10', 'border-kiwi-500/20', 'text-kiwi-400');
        } else {
          t.classList.remove('active');
          t.classList.add('bg-white/5', 'border-white/10', 'text-slate-400');
          t.classList.remove('bg-kiwi-500/10', 'border-kiwi-500/20', 'text-kiwi-400');
        }
      });

      // Show/hide content
      document.querySelectorAll('.os-content').forEach(content => {
        content.classList.toggle('hidden', content.dataset.os !== os);
      });
    });
  });
}

// --- Copy Code Buttons ---
// Copies code block content to clipboard on button click
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const codeEl = document.getElementById(targetId);
      if (!codeEl) return;

      const text = codeEl.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = 'fa-solid fa-check';
          setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
          }, 2000);
        }
      }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    });
  });
}

// --- Back to Top Button ---
// Click handler only — visibility is managed by initUnifiedScroll
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0 });
  });
}

// --- Theme Toggle ---
// Switches between dark and light themes, persists to localStorage
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!toggle || !icon) return;

  // Restore saved theme
  const saved = localStorage.getItem('kiwi-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    icon.className = 'fa-solid fa-moon text-base';
  }

  toggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      icon.className = 'fa-solid fa-sun text-base';
      localStorage.setItem('kiwi-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      icon.className = 'fa-solid fa-moon text-base';
      localStorage.setItem('kiwi-theme', 'light');
    }
  });
}

// --- Number Animation ---
// Animates stat numbers from 0 to their target value when scrolled into view
function initNumberAnimation() {
  const numbers = document.querySelectorAll('.stat-number[data-value]');
  if (!numbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        animateNumber(entry.target);
      }
    });
  }, { threshold: 0.5 });

  numbers.forEach(el => observer.observe(el));
}

function animateNumber(el) {
  const target = parseInt(el.dataset.value, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = prefix + target + suffix;
    }
  }

  requestAnimationFrame(update);
}

// --- FAQ Accordion ---
// Toggles FAQ items open/closed on click
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const toggle = item.querySelector('.faq-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      items.forEach(other => {
        if (other !== item) other.classList.remove('open');
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
    });
  });
}

