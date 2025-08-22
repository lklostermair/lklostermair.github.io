// script.js — tabs + CV rendering (split into Academics / Professional)

// Last updated in footer
const updated = document.getElementById('updated');
if (updated) updated.textContent = new Date(document.lastModified).toLocaleDateString();

// --- Tabs (top-nav) ---
const tabs = [...document.querySelectorAll('.top-nav [role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

function activateTab(tab, pushHash = true) {
  tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  panels.forEach(p =>
    p.classList.toggle('active', p.id === tab.getAttribute('aria-controls'))
  );
  if (pushHash) {
    const hash = tab.id.replace('tab-', ''); // e.g., cv
    history.replaceState(null, '', `#${hash}`);
  }
}
function getTabByHash(hash) {
  return tabs.find(t => t.id === `tab-${hash}`);
}
tabs.forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(tab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = tabs[(i + 1) % tabs.length];
      next.focus(); activateTab(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = tabs[(i - 1 + tabs.length) % tabs.length];
      prev.focus(); activateTab(prev);
    } else if (e.key === 'Home') {
      e.preventDefault(); tabs[0].focus(); activateTab(tabs[0]);
    } else if (e.key === 'End') {
      e.preventDefault(); tabs[tabs.length - 1].focus(); activateTab(tabs[tabs.length - 1]);
    }
  });
});
function initFromHash() {
  const raw = (location.hash || '').replace('#','').trim();
  const valid = raw && getTabByHash(raw);
  activateTab(valid || tabs[0], false);
}
window.addEventListener('hashchange', initFromHash);
initFromHash();

// --- CV rendering (split) ---
const cvListAcademic = document.getElementById('cv-list-academic');
const cvListProfessional = document.getElementById('cv-list-professional');
// Robust normalizer for keys used in logoMap lookups
function norm(s='') {
  return s
    .normalize('NFKC')                 // unify Unicode forms
    .replace(/\u00A0/g, ' ')           // NBSP -> space
    .toLowerCase()
    .trim()
    .replace(/[\u2010-\u2015]/g, '-')  // all hyphen/dash variants -> '-'
    .replace(/\s+/g, ' ');             // collapse spaces
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

const logoMap = Object.fromEntries(
  Object.entries(rawLogoMap).map(([k, v]) => [norm(k), v])
);

function guessLogoPath(name) {
  const key = norm(name || '');
  // prefer mapped path if present
  if (logoMap[key]) return logoMap[key];
  // consistent fallback filename: spaces -> underscores, keep () & dots
  const fallback = key.replace(/\s/g, '_');
  return `assets/companies/${fallback}.png`;
}

function mapCV(data) {
  return data.map(item => ({
    company: item.institution || item.company || '',
    position: item.position || item.role || '',
    timeframe: item.year || item.timeframe || '',
    description: item.description || '',
    image: guessLogoPath(item.institution || item.company || ''),
    category: (item.category || '').toLowerCase()
  }));
}

// No heuristics — trust cv.json
function classifyItem(it) {
  return it.category === 'academic' ? 'academic' : 'professional';
}

function rowHTML(item) {
  const img = item.image
    ? `<img src="${item.image}" alt="${item.company} logo" onerror="this.style.display='none'">`
    : '';
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
    const res = await fetch('assets/cv.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json)) throw new Error('cv.json must be an array');

    const mapped = mapCV(json);
    const academic = mapped.filter(it => classifyItem(it) === 'academic');
    const professional = mapped.filter(it => classifyItem(it) === 'professional');

    renderList(cvListAcademic, academic);
    renderList(cvListProfessional, professional);
  } catch (err) {
    console.error('CV load failed', err);
    if (cvListAcademic) cvListAcademic.innerHTML = `<li><em>Could not load CV (see console).</em></li>`;
    if (cvListProfessional) cvListProfessional.innerHTML = '';
  }
}
loadCV();

// --- Projects rendering ---
const projectsList = document.getElementById('projects-list');

function projectMediaHTML(media) {
  if (!media) return '';
  if (media.youtubeId) {
    const id = encodeURIComponent(media.youtubeId.trim());
    return `
      <div class="project-media">
        <div class="video-wrap">
          <iframe
            src="https://www.youtube.com/embed/${id}"
            title="YouTube video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen></iframe>
        </div>
      </div>`;
  }
  if (Array.isArray(media.images) && media.images.length > 0) {
    const imgs = media.images.map(src => `<img src="${src}" loading="lazy" alt="">`).join('');
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
        <div class="project-meta">
          <span class="project-timeframe">${p.year || ''}</span>
        </div>
        ${projectTagsHTML(p.tags)}
      </div>
      <div class="project-summary">${p.summary || ''}</div>
      ${projectMediaHTML(p.media)}
      ${projectLinksHTML(p.links)}
    `;
    frag.appendChild(li);
  });

  projectsList.appendChild(frag);
}

async function loadProjects() {
  try {
    const res = await fetch('assets/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('projects.json must be an array');
    renderProjects(data);
  } catch (err) {
    console.error('Projects load failed', err);
    if (projectsList) {
      projectsList.innerHTML = `<li><em>Could not load projects (see console).</em></li>`;
    }
  }
}

loadProjects();

