/* ================================================
   MAIN.JS — Lógica global del sitio
   · Carga de componentes (navbar / footer)
   · Hamburger menu
   · Scroll reveal
   · Navbar scroll shrink
   Tusuy Ñan
   ================================================ */

'use strict';

/* ── 1. CARGA DE COMPONENTES ──────────────────────
   Inyecta navbar.html y footer.html automáticamente
   en cualquier página que tenga los placeholders:
   <div id="navbar-placeholder"></div>
   <div id="footer-placeholder"></div>
   ────────────────────────────────────────────── */
async function loadComponent(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res  = await fetch(url);
    const html = await res.text();
    el.outerHTML = html;
    // Después de inyectar, inicializar el menú
    if (id === 'navbar-placeholder') initNavbar();
    // Marcar link activo
    markActiveNav();
  } catch (e) {
    console.warn(`No se pudo cargar ${url}`, e);
  }
}

/* ── 2. HAMBURGER MENU ────────────────────────── */
function initNavbar() {
  const toggle  = document.getElementById('navToggle');
  const menu    = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !menu) return;

  function openMenu() {
    toggle.classList.add('open');
    menu.classList.add('open');
    overlay?.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggle.classList.remove('open');
    menu.classList.remove('open');
    overlay?.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    toggle.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay?.addEventListener('click', closeMenu);

  // Cerrar al hacer clic en un link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Cerrar con ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ── 3. NAVBAR SCROLL SHRINK ─────────────────── */
function initNavbarScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    // Ocultar/mostrar al scroll rápido
    if (current > lastScroll && current > 120) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }

    // Añadir clase scrolled para estilos adicionales
    nav.classList.toggle('scrolled', current > 40);

    lastScroll = current;
  }, { passive: true });
}

/* ── 4. SCROLL REVEAL ────────────────────────── */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(el => observer.observe(el));
}

/* ── 5. MARCAR LINK ACTIVO EN NAV ────────────── */
function markActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    // Coincidencia exacta de pathname
    if (href && !href.includes('#') && path.endsWith(href.replace(/^\//, ''))) {
      link.classList.add('active');
    }
  });
}

/* ── 6. FORM BÁSICO ──────────────────────────── */
function initForm() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const original = btn.textContent;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Aquí conectas tu backend / Formspree / Netlify Forms
    // Por ahora simula el envío
    await new Promise(r => setTimeout(r, 1200));

    btn.textContent = '¡Mensaje enviado! ✓';
    btn.style.background = '#2a6e3a';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}


/* ── 7. HERO FADE + PARALLAX AL SCROLL ──────────
   - La imagen de fondo se desvanece suavemente
     conforme el usuario baja la página.
   - Ligero efecto parallax (se mueve más lento
     que el scroll) para sensación de profundidad.
   - Se desactiva en móviles con prefers-reduced-motion.
───────────────────────────────────────────────── */
function initHeroScroll() {
  const hero    = document.getElementById('hero');
  const bgImg   = document.getElementById('heroBgImg');
  const hint    = document.querySelector('.hero-scroll-hint');
  if (!hero || !bgImg) return;

  // Respeta preferencia de movimiento reducido
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY    = window.scrollY;
      const heroH      = hero.offsetHeight;
      // Progreso: 0 (arriba del todo) → 1 (pie del hero)
      const progress   = Math.min(scrollY / heroH, 1);

      // 1. Fade: la imagen pasa de opacity 1 a 0
      //    empieza a desvanecerse desde el 20% del scroll
      const fadeStart  = 0.15;
      const fadeOpacity = progress < fadeStart
        ? 1
        : Math.max(0, 1 - (progress - fadeStart) / (1 - fadeStart));
      bgImg.style.opacity = fadeOpacity;

      // 2. Parallax suave: la imagen sube más despacio que la página
      //    (se mueve la mitad de velocidad del scroll)
      const parallaxY = scrollY * 0.35;
      bgImg.style.transform = `scale(1.08) translateY(${parallaxY}px)`;

      // 3. Ocultar el indicador de scroll tras empezar a bajar
      if (hint) {
        hint.style.opacity = progress > 0.08 ? '0' : '1';
      }

      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ── INIT ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Cargar componentes (si existen los placeholders)
  loadComponent('navbar-placeholder', '/components/navbar.html');
  loadComponent('footer-placeholder', '/components/footer.html');

  // Si el navbar ya está en el HTML (no placeholder), inicializar directo
  if (document.getElementById('navToggle')) {
    initNavbar();
    markActiveNav();
  }

  initNavbarScroll();
  initHeroScroll();
  initScrollReveal();
  initForm();
});
