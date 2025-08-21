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

// Known logos in your repo
const logoMap = {
  'Baind AG': 'assets/companies/baind.jpg',
  'Munich Institute of Robotics and Machine Intelligence': 'assets/companies/MIRMI.png',
  'Technical University of Munich': 'assets/companies/TUM.png',
  'F. Hoffmann La Roche AG': 'assets/companies/Roche.svg',
  'Syskron GmbH / Krones AG': 'assets/companies/Krones.svg',
  'BMW AG': 'assets/companies/BMW.png',
  'University of Applied Sciences Regensburg': 'assets/companies/OTHR.png',
  'Universidad EAN, Bogotá': 'assets/companies/EAN.png',
  'Stanford University': 'assets/companies/Stanford.png',
  'IN-HAND Lab (Prof. Piazza)': 'assets/companies/IN-HAND-Logo.png'
};

function guessLogoPath(name) {
  if (!name) return '';
  if (logoMap[name]) return logoMap[name];
  const safe = name.replace(/\s+/g, '_');
  // adjust extension if most of yours are .png/.jpg
  return `assets/companies/${safe}.png`;
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

renderProjects();
