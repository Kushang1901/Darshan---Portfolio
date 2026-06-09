/* =============================================
   3D PORTFOLIO — script.js
   Interactive & Animated Engine
   ============================================= */

'use strict';

/* ─── Three.js CDN Loader ─── */
(function loadThreeJS() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  script.onload = initThreeBackground;
  document.head.appendChild(script);
})();

/* ═══════════════════════════════════════
   THREE.JS — 3D Particle Background
═══════════════════════════════════════ */
function initThreeBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 120;

  /* ── Particles ── */
  const PARTICLE_COUNT = window.innerWidth < 768 ? 800 : 1800;
  const positions  = new Float32Array(PARTICLE_COUNT * 3);
  const colors     = new Float32Array(PARTICLE_COUNT * 3);
  const sizes      = new Float32Array(PARTICLE_COUNT);

  const colorPalette = [
    new THREE.Color('#00d4ff'),  // cyan
    new THREE.Color('#a855f7'),  // purple
    new THREE.Color('#ff6b35'),  // orange
    new THREE.Color('#10b981'),  // green
    new THREE.Color('#ffffff'),  // white
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 300;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    sizes[i] = Math.random() * 1.5 + 0.3;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  /* ── Wireframe Torus ── */
  const torusGeo = new THREE.TorusKnotGeometry(25, 5, 120, 16);
  const torusMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff,
    wireframe: true,
    transparent: true,
    opacity: 0.03,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(60, -30, -60);
  scene.add(torus);

  /* ── Icosahedron ── */
  const icoGeo = new THREE.IcosahedronGeometry(15, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    wireframe: true,
    transparent: true,
    opacity: 0.04,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-70, 40, -50);
  scene.add(ico);

  /* ── Mouse Parallax ── */
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.4;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Animate ── */
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.004;

    // Smooth camera parallax
    targetX += (mouseX - targetX) * 0.06;
    targetY += (mouseY - targetY) * 0.06;
    camera.position.x = targetX * 30;
    camera.position.y = -targetY * 20;
    camera.lookAt(scene.position);

    // Rotate particle cloud slowly
    particles.rotation.y = frame * 0.15;
    particles.rotation.x = frame * 0.06;

    // Spin geometries
    torus.rotation.x = frame * 0.4;
    torus.rotation.y = frame * 0.25;
    ico.rotation.x   = -frame * 0.3;
    ico.rotation.z   =  frame * 0.2;

    renderer.render(scene, camera);
  }
  animate();
}

/* ═══════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

/* Scroll-aware navbar */
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  const currentY = window.scrollY;
  navbar.classList.toggle('scrolled', currentY > 60);

  // Hide on fast scroll-down, show on scroll-up
  if (currentY > lastScrollY + 5 && currentY > 200) {
    navbar.style.transform = 'translateY(-100%)';
  } else if (currentY < lastScrollY - 5) {
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = currentY;
});

/* Mobile toggle */
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

/* Close menu on link click */
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

/* Active link on scroll */
function updateActiveLink() {
  const sections  = document.querySelectorAll('section[id]');
  const allLinks  = document.querySelectorAll('.nav-links a');
  let current = '';

  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 150) current = sec.id;
  });

  allLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* Smooth Scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ═══════════════════════════════════════
   TYPED TEXT ANIMATION
═══════════════════════════════════════ */
const phrases = [
  'AutoCAD Design',
  'SolidWorks Modeling',
  'Quality Control',
  'Thermal Engineering',
  'Manufacturing Processes',
];

let pIdx = 0, cIdx = 0, deleting = false, pauseTimeout = null;
const typedEl = document.getElementById('typed-text');

function typeWriter() {
  if (!typedEl) return;
  const current = phrases[pIdx];

  if (deleting) {
    typedEl.textContent = current.slice(0, --cIdx);
    if (cIdx === 0) {
      deleting = false;
      pIdx = (pIdx + 1) % phrases.length;
      pauseTimeout = setTimeout(typeWriter, 400);
      return;
    }
    pauseTimeout = setTimeout(typeWriter, 40);
  } else {
    typedEl.textContent = current.slice(0, ++cIdx);
    if (cIdx === current.length) {
      deleting = true;
      pauseTimeout = setTimeout(typeWriter, 2200);
      return;
    }
    pauseTimeout = setTimeout(typeWriter, 75);
  }
}

setTimeout(typeWriter, 1000);

/* ═══════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Animate skill bars inside
        entry.target.querySelectorAll('.skill-bar').forEach(bar => {
          bar.classList.add('animate');
        });
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Also trigger skill bar animation on its own section reveal */
const skillObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-bar').forEach(bar => {
          setTimeout(() => bar.classList.add('animate'), 300);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.skills-grid').forEach(el => skillObserver.observe(el));

/* ═══════════════════════════════════════
   3D CARD TILT
═══════════════════════════════════════ */
function initCardTilt() {
  const tiltCards = document.querySelectorAll('.skill-card, .project-card, .edu-card, .exp-card, .personal-card');

  tiltCards.forEach(card => {
    const MAX = 10;

    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -MAX;
      const rotateY = ((x - centerX) / centerX) *  MAX;

      card.style.transform = `
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateZ(6px)
      `;
      card.style.transition = 'transform 0.08s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    });
  });
}

/* Interest cards — heavier tilt */
function initInterestTilt() {
  document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect    = card.getBoundingClientRect();
      const x       = e.clientX - rect.left;
      const y       = e.clientY - rect.top;
      const rX      = ((y - rect.height / 2) / rect.height) * -18;
      const rY      = ((x - rect.width  / 2) / rect.width ) *  18;

      card.style.transform = `
        perspective(600px)
        rotateX(${rX}deg)
        rotateY(${rY}deg)
        translateZ(12px)
        scale(1.04)
      `;
      card.style.transition = 'transform 0.08s linear';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
    });
  });
}

/* ═══════════════════════════════════════
   PROFILE CARD PARALLAX
═══════════════════════════════════════ */
function initProfileParallax() {
  const wrapper = document.getElementById('profile-card-3d');
  if (!wrapper) return;

  wrapper.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    const x    = (e.clientX - rect.left - rect.width  / 2) / rect.width;
    const y    = (e.clientY - rect.top  - rect.height / 2) / rect.height;

    wrapper.style.transform = `
      perspective(900px)
      rotateY(${x * 14}deg)
      rotateX(${-y * 10}deg)
      translateZ(10px)
    `;
    wrapper.style.transition = 'transform 0.1s linear';
  });

  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = '';
    wrapper.style.transition = 'transform 0.6s cubic-bezier(0.4,0,0.2,1)';
  });
}

/* ═══════════════════════════════════════
   COUNTER ANIMATION
═══════════════════════════════════════ */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target = parseFloat(counter.textContent);
    if (isNaN(target)) return;

    const isDecimal = counter.textContent.includes('.');
    const suffix    = counter.textContent.replace(/[0-9.]/g, '');
    let current     = 0;
    const step      = target / 40;
    const timer     = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.textContent = isDecimal
        ? current.toFixed(1) + suffix
        : Math.ceil(current) + suffix;
    }, 40);
  });
}

/* Run counter when hero is visible */
const heroEl = document.querySelector('.hero');
if (heroEl) {
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      heroObserver.disconnect();
    }
  }, { threshold: 0.3 });
  heroObserver.observe(heroEl);
}

/* ═══════════════════════════════════════
   CURSOR GLOW (Desktop Only)
═══════════════════════════════════════ */
function initCursorGlow() {
  if (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed',
    width:  '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: '9998',
    transform: 'translate(-50%, -50%)',
    transition: 'opacity 0.3s ease',
    mixBlendMode: 'screen',
  });
  document.body.appendChild(glow);

  let glowX = 0, glowY = 0;
  let targetGX = 0, targetGY = 0;

  document.addEventListener('mousemove', e => {
    targetGX = e.clientX;
    targetGY = e.clientY;
  });

  (function moveGlow() {
    glowX += (targetGX - glowX) * 0.1;
    glowY += (targetGY - glowY) * 0.1;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(moveGlow);
  })();
}

/* ═══════════════════════════════════════
   PARTICLE BURST on click
═══════════════════════════════════════ */
function initClickBurst() {
  document.addEventListener('click', e => {
    if (window.innerWidth < 768) return;
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('div');
      const angle  = (i / 8) * 360;
      const radius = 40 + Math.random() * 30;
      Object.assign(dot.style, {
        position: 'fixed',
        width:  '6px',
        height: '6px',
        borderRadius: '50%',
        background: Math.random() > 0.5 ? '#00d4ff' : '#a855f7',
        left: e.clientX + 'px',
        top:  e.clientY + 'px',
        pointerEvents: 'none',
        zIndex: '99999',
        transition: 'all 0.5s ease-out',
        opacity: '1',
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 6px ${Math.random() > 0.5 ? '#00d4ff' : '#a855f7'}`,
      });
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        const rad = (angle * Math.PI) / 180;
        dot.style.transform = `translate(calc(-50% + ${Math.cos(rad) * radius}px), calc(-50% + ${Math.sin(rad) * radius}px))`;
        dot.style.opacity   = '0';
      });
      setTimeout(() => dot.remove(), 500);
    }
  });
}

/* ═══════════════════════════════════════
   INIT ALL
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initCardTilt();
  initInterestTilt();
  initProfileParallax();
  initCursorGlow();
  initClickBurst();
  updateActiveLink();
});