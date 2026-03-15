const updated = document.getElementById('updated');
if (updated) updated.textContent = new Date(document.lastModified).toLocaleDateString();

const tabs = [...document.querySelectorAll('.top-nav [role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function activateTab(tab, pushHash = true) {
  tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  panels.forEach(p => p.classList.toggle('active', p.id === tab.getAttribute('aria-controls')));
  if (pushHash) {
    const hash = tab.id.replace('tab-', '');
    history.replaceState(null, '', `#${hash}`);
    const target = document.querySelector('.panels-area');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
function getTabByHash(hash) {
  return tabs.find(t => t.id === `tab-${hash}`);
}
tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', e => {
    const i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); const next = tabs[(i + 1) % tabs.length]; next.focus(); activateTab(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); const prev = tabs[(i - 1 + tabs.length) % tabs.length]; prev.focus(); activateTab(prev);
    } else if (e.key === 'Home') {
      e.preventDefault(); tabs[0].focus(); activateTab(tabs[0]);
    } else if (e.key === 'End') {
      e.preventDefault(); tabs[tabs.length - 1].focus(); activateTab(tabs[tabs.length - 1]);
    }
  });
});
function initFromHash() {
  const raw = (location.hash || '').replace('#', '').trim();
  const valid = raw && getTabByHash(raw);
  activateTab(valid || tabs[0], false);
}
window.addEventListener('hashchange', initFromHash);
initFromHash();

const cvListAcademic = document.getElementById('cv-list-academic');
const cvListProfessional = document.getElementById('cv-list-professional');

function norm(s = '') {
  return s.normalize('NFKC').replace(/\u00A0/g, ' ').toLowerCase().trim().replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ');
}
const rawLogoMap = {
  'Baind AG': 'assets/companies/baind.jpg',
  'Munich Institute of Robotics and Machine Intelligence': 'assets/companies/MIRMI.png',
  'TU Munich': 'assets/companies/TUM.png',
  'F. Hoffmann La Roche AG': 'assets/companies/Roche.svg',
  'Syskron GmbH / Krones AG': 'assets/companies/Krones.svg',
  'BMW AG': 'assets/companies/BMW.png',
  'University of Applied Sciences Regensburg': 'assets/companies/OTHR.png',
  'Universidad EAN, Bogotá': 'assets/companies/EAN.png',
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
      position: item.position || item.role || '',
      timeframe: item.year || item.timeframe || '',
      description: item.description || '',
      image: guessLogoPath(company),
      category: (item.category || '').toLowerCase()
    };
  });
}
function classifyItem(it) {
  return it.category === 'academic' ? 'academic' : 'professional';
}
function rowHTML(item) {
  const img = item.image ? `<img src="${item.image}" alt="${item.company} logo" onerror="this.style.display='none'">` : '';
  return `
    ${img}
    <div class="cv-block">
      <div class="cv-headline">
        <span class="cv-title">${item.position || ''}</span>
        ${item.company ? `<span class="cv-company">at ${item.company}</span>` : ''}
        ${item.timeframe ? `<span class="cv-timeframe">— ${item.timeframe}</span>` : ''}
      </div>
      ${item.description ? `<div class="cv-desc">${item.description}</div>` : ''}
    </div>
  `;
}
function renderList(targetUL, items) {
  if (!targetUL) return;
  targetUL.innerHTML = '';
  const frag = document.createDocumentFragment();
  items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = rowHTML(item);
    frag.appendChild(li);
  });
  targetUL.appendChild(frag);
}
async function loadCV() {
  try {
    const res = await fetch('assets/cv.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json)) throw new Error('cv.json must be an array');
    const mapped = mapCV(json);
    renderList(cvListAcademic, mapped.filter(it => classifyItem(it) === 'academic'));
    renderList(cvListProfessional, mapped.filter(it => classifyItem(it) === 'professional'));
  } catch (err) {
    if (cvListAcademic) cvListAcademic.innerHTML = `<li><em>Could not load CV (see console).</em></li>`;
    if (cvListProfessional) cvListProfessional.innerHTML = '';
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
      `<img src="${src}" loading="lazy" alt="${title || 'Project'} - image ${i + 1}" class="gallery-img">`
    ).join('');
    return `<div class="project-media"><div class="media-gallery">${imgs}</div></div>`;
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
    li.className = 'project-card';
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
  const gallery = img.closest('.media-gallery');
  galleryImages = gallery ? [...gallery.querySelectorAll('.gallery-img')] : [img];
  currentIndex = galleryImages.indexOf(img);
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

document.addEventListener('click', e => {
  if (e.target.classList.contains('gallery-img')) openLightbox(e.target);
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
