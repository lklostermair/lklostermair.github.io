// script.js — tabs + CV rendering
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
      next.focus();
      activateTab(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = tabs[(i - 1 + tabs.length) % tabs.length];
      prev.focus();
      activateTab(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      tabs[0].focus();
      activateTab(tabs[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      tabs[tabs.length - 1].focus();
      activateTab(tabs[tabs.length - 1]);
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

// --- CV rendering ---
const cvList = document.getElementById('cv-list');
const projectsList = document.getElementById('projects-list');

// Known logos map
const logoMap = {
  'Baind AG': 'assets/companies/baind.jpg',
  'Intelligent Neuroprosthetics and Human Robotics Lab, Prof. Cristina Piazza': 'assets/companies/MIRMI.png',
  'Technical University of Munich': 'assets/companies/TUM.png',
  'F. Hoffmann La Roche AG': 'assets/companies/Roche.svg',
  'Syskron GmbH / Krones AG': 'assets/companies/Krones.svg',
  'BMW AG': 'assets/companies/BMW.png',
  'University of Applied Sciences Regensburg': 'assets/companies/OTHR.png',
  'Universidad EAN, Bogotá': 'assets/companies/EAN.svg',
  'Ilmtalkliniken GmbH': 'assets/companies/Ilmtalkliniken.svg'
};

function guessLogoPath(name) {
  if (logoMap[name]) return logoMap[name];
  const safeName = name.replace(/\s+/g, '_');
  const candidates = ['svg', 'png', 'jpg', 'jpeg']
    .map(ext => `assets/companies/${safeName}.${ext}`);
  return candidates[0];
}

function mapCV(data) {
  return data.map(item => ({
    image: guessLogoPath(item.institution || item.company || ''),
    timeframe: item.year || item.timeframe || '',
    position: item.position || item.role || '',
    company: item.institution || item.company || '',
    description: item.description || ''
  }));
}

function renderCV(items) {
  if (!cvList) return;
  cvList.innerHTML = '';
  const frag = document.createDocumentFragment();

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cv-item';

    const img = item.image
      ? `<img src="${item.image}" alt="${item.company} logo" onerror="this.style.display='none'">`
      : '';
    li.innerHTML = `
      ${img}
      <div class="cv-details">
        <div><strong>${item.position}</strong>${item.company ? ` at ${item.company}` : ''}</div>
        <div class="cv-timeframe">${item.timeframe}</div>
        <p>${item.description}</p>
      </div>
    `;
    frag.appendChild(li);
  });

  cvList.appendChild(frag);
}

async function loadCV() {
  try {
    const res = await fetch('assets/cv.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('cv.json must be an array');
    renderCV(mapCV(data));
  } catch (err) {
    console.error('CV load failed', err);
    if (cvList) {
      cvList.innerHTML = `<li><em>Could not load CV (see console).</em></li>`;
    }
  }
}

// Projects placeholder
function renderProjects() {
  if (!projectsList) return;
  projectsList.innerHTML = '';
}

loadCV();
renderProjects();
