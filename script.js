const updated = document.getElementById('updated');
if (updated) updated.textContent = new Date(document.lastModified).toLocaleDateString();

// Scroll reveal observer
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

function observeItems(selector) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0 });
  document.querySelectorAll(selector).forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 0.05}s`);
    obs.observe(el);
  });
}

// Active section tracker for sticky nav
(function setupActiveNav() {
  const navLinks = document.querySelectorAll('.section-nav a');
  const sections = document.querySelectorAll('.page-section');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-20% 0px -60% 0px' });
  sections.forEach(s => obs.observe(s));
})();

// Auto-hide nav on scroll down, show on scroll up
(function setupNavAutoHide() {
  const nav = document.querySelector('.section-nav');
  if (!nav) return;
  let lastY = 0, ticking = false;
  const navTop = nav.offsetTop;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle('hidden', y > lastY && y > navTop);
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


const cvTimeline = document.getElementById('cv-timeline');

function norm(s = '') {
  return s.normalize('NFKC').replace(/\u00A0/g, ' ').toLowerCase().trim().replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ');
}
const rawLogoMap = {
  'Baind AG': 'assets/companies/baind.png',
  'Munich Institute of Robotics and Machine Intelligence': 'assets/companies/MIRMI.png',
  'TU Munich': 'assets/companies/TUM.png',
  'F. Hoffmann La Roche AG': 'assets/companies/Roche.svg',
  'Syskron GmbH / Krones AG': 'assets/companies/Krones.svg',
  'BMW AG': 'assets/companies/BMW.png',
  'University of Applied Sciences Regensburg': 'assets/companies/OTHR.png',
  'Universidad EAN, Bogota': 'assets/companies/EAN.png',
  'Stanford BDML (Prof. Cutkosky)': 'assets/companies/Stanford.png',
  'TUM IN-HAND Lab (Prof. Piazza)': 'assets/companies/IN-HAND-Logo.png'
};
const logoMap = Object.fromEntries(Object.entries(rawLogoMap).map(([k, v]) => [norm(k), v]));

function guessLogoPath(name) {
  const key = norm(name || '');
  if (logoMap[key]) return logoMap[key];
  return `assets/companies/${key.replace(/\s/g, '_')}.png`;
}

function mapCV(data) {
  return data.map(item => {
    const company = item.institution || item.company || '';
    return {
      company,
      url: item.url || '',
      position: item.position || item.role || '',
      timeframe: item.year || item.timeframe || '',
      description: item.description || '',
      image: guessLogoPath(company),
      category: (item.category || '').toLowerCase()
    };
  });
}
function parseStartYear(timeframe) {
  const m = (timeframe || '').match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}
function rowHTML(item) {
  const img = item.image ? `<img src="${item.image}" alt="${item.company} logo" onerror="this.style.display='none'">` : '';
  const companyHTML = item.url
    ? `<a href="${item.url}" target="_blank" rel="noopener" class="cv-company">${item.company || ''}</a>`
    : `<span class="cv-company">${item.company || ''}</span>`;
  return `
    <div class="cv-logo">${img}</div>
    <div class="cv-block">
      <div class="cv-title">${item.position || ''}</div>
      ${item.company ? `<div class="cv-meta">${companyHTML}${item.timeframe ? ` -- ${item.timeframe}` : ''}</div>` : ''}
      ${item.description ? `<div class="cv-desc">${item.description}</div>` : ''}
    </div>
    <div class="cv-spacer"></div>`;
}
function renderTimeline(target, items) {
  if (!target) return;
  items.sort((a, b) => parseStartYear(b.timeframe) - parseStartYear(a.timeframe));
  target.innerHTML = '';
  const frag = document.createDocumentFragment();
  items.forEach(item => {
    const li = document.createElement('li');
    li.dataset.side = item.category === 'academic' ? 'left' : 'right';
    li.innerHTML = rowHTML(item);
    frag.appendChild(li);
  });
  target.appendChild(frag);
}
async function loadCV() {
  try {
    const res = await fetch('assets/cv.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json)) throw new Error('cv.json must be an array');
    const mapped = mapCV(json);
    renderTimeline(cvTimeline, mapped);
    observeItems('.timeline li');
  } catch (err) {
    if (cvTimeline) cvTimeline.innerHTML = `<li><em>Could not load CV.</em></li>`;
    console.error('CV load failed', err);
  }
}
loadCV();

const projectsList = document.getElementById('projects-list');

function projectMediaHTML(media, title) {
  if (!media) return '';
  if (media.youtubeId) {
    const id = encodeURIComponent(media.youtubeId.trim());
    return `
      <div class="project-media">
        <div class="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/${id}"
            title="${title || 'Project'} video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen></iframe>
        </div>
      </div>`;
  }
  if (Array.isArray(media.images) && media.images.length > 0) {
    const imgs = media.images.map((src, i) =>
      `<img src="${src}" loading="lazy" alt="${title || 'Project'} - image ${i + 1}" class="gallery-img${i === 0 ? ' active' : ''}">`
    ).join('');
    const nav = media.images.length > 1
      ? `<button class="carousel-btn carousel-prev" aria-label="Previous image">&lsaquo;</button><button class="carousel-btn carousel-next" aria-label="Next image">&rsaquo;</button><div class="carousel-dots">${media.images.map((_, i) => `<span class="carousel-dot${i === 0 ? ' active' : ''}" data-i="${i}"></span>`).join('')}</div>`
      : '';
    return `<div class="project-media"><div class="carousel"><div class="carousel-inner">${imgs}</div>${nav}</div></div>`;
  }
  return '';
}
function projectLinksHTML(links) {
  if (!Array.isArray(links) || links.length === 0) return '';
  return `<div class="project-links">
    ${links.map(l => `<a href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
  </div>`;
}
function projectTagsHTML(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return '';
  return `<div class="project-tags">
    ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
  </div>`;
}
function renderProjects(items) {
  if (!projectsList) return;
  projectsList.innerHTML = '';
  const frag = document.createDocumentFragment();
  items.forEach(p => {
    const li = document.createElement('li');
    li.className = 'project-card' + (p.featured ? ' featured' : '');
    li.innerHTML = `
      <div class="project-header">
        <div class="project-title">${p.title || ''}</div>
        <div class="project-meta"><span class="project-timeframe">${p.year || ''}</span></div>
        ${projectTagsHTML(p.tags)}
      </div>
      <div class="project-summary">${p.summary || ''}</div>
      ${projectMediaHTML(p.media, p.title)}
      ${projectLinksHTML(p.links)}
    `;
    frag.appendChild(li);
  });
  projectsList.appendChild(frag);
}
async function loadProjects() {
  try {
    const res = await fetch('assets/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('projects.json must be an array');
    renderProjects(data);
    observeItems('.projects-list li');
    document.querySelectorAll('.carousel').forEach(c => {
      const imgs = c.querySelectorAll('.gallery-img');
      if (imgs.length < 2) return;
      let timer = setInterval(() => {
        const cur = [...imgs].findIndex(img => img.classList.contains('active'));
        carouselGo(c, cur + 1);
      }, 5000);
      c.addEventListener('mouseenter', () => clearInterval(timer));
      c.addEventListener('mouseleave', () => {
        timer = setInterval(() => {
          const cur = [...imgs].findIndex(img => img.classList.contains('active'));
          carouselGo(c, cur + 1);
        }, 5000);
      });
    });
  } catch (err) {
    if (projectsList) projectsList.innerHTML = `<li><em>Could not load projects (see console).</em></li>`;
    console.error('Projects load failed', err);
  }
}
loadProjects();

const themeToggle = document.querySelector('.theme-toggle');
const sunIcon = themeToggle?.querySelector('.icon-sun');
const moonIcon = themeToggle?.querySelector('.icon-moon');

function getEffectiveTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (sunIcon && moonIcon) {
    sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
    moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
  }
}
applyTheme(getEffectiveTheme());
themeToggle?.addEventListener('click', () => {
  const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!localStorage.getItem('theme')) applyTheme(getEffectiveTheme());
});

document.body.insertAdjacentHTML('beforeend', `
  <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-nav prev" aria-label="Previous">&lsaquo;</button>
    <img alt="">
    <button class="lightbox-nav next" aria-label="Next">&rsaquo;</button>
  </div>`);

const lightbox = document.getElementById('lightbox');
const lbImg = lightbox.querySelector('img');
const lbPrev = lightbox.querySelector('.prev');
const lbNext = lightbox.querySelector('.next');
let galleryImages = [];
let currentIndex = 0;
let triggerElement = null;

function openLightbox(img) {
  triggerElement = img;
  const inner = img.closest('.carousel-inner') || img.closest('.carousel');
  galleryImages = inner ? [...inner.querySelectorAll('.gallery-img')] : [img];
  currentIndex = galleryImages.indexOf(img);
  if (currentIndex < 0) currentIndex = 0;
  showImage(currentIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('.lightbox-close').focus();
}
function showImage(i) {
  currentIndex = (i + galleryImages.length) % galleryImages.length;
  lbImg.src = galleryImages[currentIndex].src;
  lbImg.alt = galleryImages[currentIndex].alt;
  lbPrev.style.display = galleryImages.length > 1 ? '' : 'none';
  lbNext.style.display = galleryImages.length > 1 ? '' : 'none';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  if (triggerElement) triggerElement.focus();
  triggerElement = null;
}

function carouselGo(carousel, idx) {
  const imgs = [...carousel.querySelectorAll('.gallery-img')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const i = (idx + imgs.length) % imgs.length;
  imgs.forEach((img, j) => img.classList.toggle('active', j === i));
  dots.forEach((d, j) => d.classList.toggle('active', j === i));
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('gallery-img') && e.target.classList.contains('active')) {
    openLightbox(e.target);
    return;
  }
  const prev = e.target.closest('.carousel-prev');
  const next = e.target.closest('.carousel-next');
  if (prev || next) {
    e.stopPropagation();
    const carousel = e.target.closest('.carousel');
    const imgs = [...carousel.querySelectorAll('.gallery-img')];
    const cur = imgs.findIndex(img => img.classList.contains('active'));
    carouselGo(carousel, cur + (prev ? -1 : 1));
    return;
  }
  if (e.target.classList.contains('carousel-dot')) {
    carouselGo(e.target.closest('.carousel'), parseInt(e.target.dataset.i, 10));
  }
});
lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
lbPrev.addEventListener('click', e => { e.stopPropagation(); showImage(currentIndex - 1); });
lbNext.addEventListener('click', e => { e.stopPropagation(); showImage(currentIndex + 1); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  if (e.key === 'Tab') {
    const focusable = lightbox.querySelectorAll('button:not([style*="display: none"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
});

// Space invader gutter decorations
(function setupInvaders() {
  const types = [
    { frames: ['assets/invaders/typeA1.png', 'assets/invaders/typeA2.png'] },
    { frames: ['assets/invaders/typeB1.png', 'assets/invaders/typeB2.png'] },
    { frames: ['assets/invaders/typeC1.png', 'assets/invaders/typeC2.png'] },
  ];
  const EXPLODE_SRC = 'assets/invaders/explode.png';

  const leftGutter = document.createElement('div');
  leftGutter.className = 'invader-gutter invader-gutter--left';
  leftGutter.setAttribute('aria-hidden', 'true');
  const rightGutter = document.createElement('div');
  rightGutter.className = 'invader-gutter invader-gutter--right';
  rightGutter.setAttribute('aria-hidden', 'true');
  document.body.appendChild(leftGutter);
  document.body.appendChild(rightGutter);

  // Score counter
  let score = 0;
  const scoreEl = document.createElement('div');
  scoreEl.className = 'invader-score';
  scoreEl.setAttribute('aria-hidden', 'true');
  scoreEl.textContent = '0000';
  document.body.appendChild(scoreEl);

  function bumpScore() {
    score++;
    scoreEl.textContent = String(score).padStart(4, '0');
  }

  const allSprites = [];
  function rand(min, max) { return min + Math.random() * (max - min); }

  function resetSprite(img, scatter) {
    const t = Math.floor(Math.random() * types.length);
    img.dataset.type = t;
    img.dataset.frame = '0';
    img.dataset.dead = '0';
    img.src = types[t].frames[0];
    img.classList.remove('invader-explode');
    img.style.left = rand(5, 75) + '%';
    img.style.setProperty('--march-dist', rand(40, 80) + 'px');
    img.style.setProperty('--march-dur', rand(2.5, 3.5) + 's');
    img.style.setProperty('--march-delay', -rand(0, 3) + 's');
    img._y = scatter ? rand(-600, -40) : -40;
    img.style.top = img._y + 'px';
    img._speed = rand(0.15, 0.35);
  }

  function createSprite(container, idx, total) {
    const img = document.createElement('img');
    img.className = 'invader-sprite';
    img.alt = '';
    img._container = container;
    resetSprite(img, false);
    // Stagger start positions above viewport so they drop in evenly spaced
    const spacing = window.innerHeight / total;
    img._y = -(idx * spacing) - 40;
    img.style.top = img._y + 'px';
    container.appendChild(img);
    allSprites.push(img);

    img.addEventListener('click', () => {
      if (img.dataset.dead === '1') return;
      img.dataset.dead = '1';
      bumpScore();
      // Freeze position: read bounding rect, set left in px
      const rect = img.getBoundingClientRect();
      const gutterRect = img._container.getBoundingClientRect();
      img.style.left = (rect.left - gutterRect.left) + 'px';
      img.src = EXPLODE_SRC;
      img.classList.add('invader-explode');
      setTimeout(() => {
        img.style.left = '';
        resetSprite(img, false);
      }, 500);
    });
  }

  const spritesPerSide = 5;
  for (let i = 0; i < spritesPerSide; i++) {
    createSprite(leftGutter, i, spritesPerSide);
    createSprite(rightGutter, i, spritesPerSide);
  }

  // Frame swap
  setInterval(() => {
    allSprites.forEach(img => {
      if (img.dataset.dead === '1') return;
      const t = parseInt(img.dataset.type);
      const f = img.dataset.frame === '0' ? 1 : 0;
      img.dataset.frame = String(f);
      img.src = types[t].frames[f];
    });
  }, 500);

  // Vertical drift via JS (allows regeneration)
  function tick() {
    allSprites.forEach(img => {
      if (img.dataset.dead === '1') return;
      img._y += img._speed;
      if (img._y > window.innerHeight + 40) {
        resetSprite(img, false);
      }
      img.style.top = img._y + 'px';
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Fade out earlier as CV section ends
  const projects = document.getElementById('projects');
  let fadeTicking = false;
  function updateFade() {
    if (!projects) return;
    const rect = projects.getBoundingClientRect();
    const fade = Math.max(0, Math.min(1, rect.top / (window.innerHeight * 1.8)));
    leftGutter.style.opacity = fade;
    rightGutter.style.opacity = fade;
    scoreEl.style.opacity = fade;
  }
  window.addEventListener('scroll', () => {
    if (!fadeTicking) {
      requestAnimationFrame(() => { updateFade(); fadeTicking = false; });
      fadeTicking = true;
    }
  }, { passive: true });
  updateFade();
})();
