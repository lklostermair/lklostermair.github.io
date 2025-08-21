// script.js — tabs swap content in-place
// Last updated is shown in footer.
const updated = document.getElementById('updated');
if (updated) updated.textContent = new Date(document.lastModified).toLocaleDateString();

// --- Tabs (top-nav) ---
const tabs = [...document.querySelectorAll('.top-nav [role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

// --- Data placeholders ---
// Add your CV entries here. Each item requires:
// image, timeframe, position, company, description
const cvData = [
  /* {
    image: 'assets/companies/company.png',
    timeframe: '2020-2022',
    position: 'Job Title',
    company: 'Company Name',
    description: 'Short description of your role.'
  } */
];

// Add your projects here. Each item requires:
// image, timeframe, name, description
const projectData = [
  /* {
    image: 'assets/projects/project.png',
    timeframe: '2024',
    name: 'Project Name',
    description: 'Short description of the project.'
  } */
];

function activateTab(tab, pushHash = true) {
  // aria state
  tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
  // panels
  panels.forEach(p => p.classList.toggle('active', p.id === tab.getAttribute('aria-controls')));
  // URL state (no scroll)
  if (pushHash) {
    const hash = tab.id.replace('tab-',''); // e.g., cv
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

// Hash deep-link support (e.g., /#projects)
function initFromHash() {
  const raw = (location.hash || '').replace('#','').trim();
  const valid = raw && getTabByHash(raw);
  activateTab(valid || tabs[0], false);
}
window.addEventListener('hashchange', initFromHash);
initFromHash();

// --- Render helpers ---
const cvList = document.getElementById('cv-list');
const projectsList = document.getElementById('projects-list');

function renderCV() {
  if (!cvList) return;
  const frag = document.createDocumentFragment();
  cvData.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cv-item';
    li.innerHTML = `
      <img src="${item.image}" alt="">
      <div class="cv-details">
        <div><strong>${item.position}</strong> at ${item.company}</div>
        <div class="cv-timeframe">${item.timeframe}</div>
        <p>${item.description}</p>
      </div>
    `;
    frag.appendChild(li);
  });
  cvList.appendChild(frag);
}

function renderProjects() {
  if (!projectsList) return;
  const frag = document.createDocumentFragment();
  projectData.forEach(item => {
    const li = document.createElement('li');
    li.className = 'project-item';
    li.innerHTML = `
      <img src="${item.image}" alt="">
      <div><strong>${item.name}</strong> <span class="project-timeframe">${item.timeframe}</span></div>
      <p>${item.description}</p>
    `;
    frag.appendChild(li);
  });
  projectsList.appendChild(frag);
}

renderCV();
renderProjects();

