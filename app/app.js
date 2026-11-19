// Leonida Trophy Guide — Grand Theft Auto VI trophy tracker (PS5).
// Loads app/data/trophies.json (the official 55, verified 2026-11-19) and renders
// a searchable, filterable checklist with a spoiler setting, a platinum roadmap,
// missable-trophy warnings and per-trophy guides with sources. Progress lives in
// localStorage only; export/import move it as a JSON file. No network requests
// beyond the app's own files, no Rockstar artwork, no external fonts or images.

const STORE_KEY = 'gta6-trophy-guide-progress-v1';
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', side: 'Side strand', robbery: 'Robbery', activity: 'Activity',
  collectible: 'Collectible', exploration: 'Exploration', combat: 'Combat',
  misc: 'Misc', completion: '100% completion', platinum: 'Platinum',
};

const params = new URLSearchParams(location.search);
const state = {
  trophies: [],
  earned: new Set(),
  view: params.get('view') || 'checklist',
  selectedId: params.get('id') ? Number(params.get('id')) : null,
  search: params.get('q') || '',
  grade: params.get('grade') || 'all',
  kind: params.get('kind') || 'all',
  status: params.get('status') || 'all',
  spoilersHidden: params.get('spoilers') ? params.get('spoilers') !== 'off' : true,
};

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPanel');

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
}

function isHidden(t) {
  return state.spoilersHidden && t.hidden && !state.earned.has(t.id);
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.status === 'earned' && !state.earned.has(t.id)) return false;
    if (state.status === 'missing' && state.earned.has(t.id)) return false;
    if (state.status === 'missable' && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function gradeBadge(t) {
  const short = { platinum: 'PLAT', gold: 'GOLD', silver: 'SILV', bronze: 'BRNZ' }[t.grade];
  return `<span class="grade-badge grade-${t.grade}">${short}</span>`;
}

function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length || 55;
  $('earnedCount').textContent = earned;
  $('percent').textContent = `${Math.round((earned / total) * 100)}%`;
  $('progressFill').style.width = `${(earned / total) * 100}%`;
  const counts = {};
  for (const t of state.trophies) {
    counts[t.grade] = counts[t.grade] || [0, 0];
    counts[t.grade][1] += 1;
    if (state.earned.has(t.id)) counts[t.grade][0] += 1;
  }
  $('gradeCounts').innerHTML = Object.keys(GRADE_LABEL)
    .map((g) => `<span>${GRADE_LABEL[g]} <b>${(counts[g] || [0, 0])[0]}/${(counts[g] || [0, 0])[1]}</b></span>`)
    .join('');
}

function renderList() {
  const shown = visibleTrophies();
  $('listMeta').textContent = `Showing ${shown.length} of ${state.trophies.length} trophies` +
    (state.spoilersHidden ? ' · story spoilers hidden' : ' · story spoilers shown');
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (state.earned.has(t.id) ? ' earned' : '') +
      (state.selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) state.earned.add(t.id);
      else state.earned.delete(t.id);
      saveEarned();
      renderProgress();
      renderList();
      renderDetail();
    });
    const hidden = isHidden(t);
    const mid = document.createElement('div');
    mid.innerHTML = hidden
      ? `<div class="t-name hidden-name">Hidden trophy</div><div class="t-desc">A story trophy — earn it, or turn spoilers off to see it.</div>`
      : `<div class="t-name"></div><div class="t-desc"></div>`;
    if (!hidden) {
      mid.querySelector('.t-name').textContent = t.name;
      mid.querySelector('.t-desc').textContent = t.description;
    }
    const tags = document.createElement('div');
    tags.className = 't-tags';
    tags.innerHTML = `<span class="tag">${KIND_LABEL[t.kind]}</span>` +
      (t.missable ? '<span class="tag missable">⚠ Missable</span>' : '') +
      (t.hidden ? '<span class="tag hidden-tag">Hidden</span>' : '');
    mid.append(tags);
    const link = document.createElement('span');
    link.className = 't-guide-link';
    link.textContent = state.selectedId === t.id ? 'Guide ▾' : 'Guide ▸';
    li.append(box, (() => { const s = document.createElement('span'); s.innerHTML = gradeBadge(t); return s; })(), mid, link);
    li.addEventListener('click', (e) => {
      if (e.target === box) return;
      state.selectedId = state.selectedId === t.id ? null : t.id;
      renderList();
      renderDetail();
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const t = state.trophies.find((x) => x.id === state.selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="empty-detail">Select a trophy to read its guide — what to do, where, how, and when it can be missed — with its sources.</p>';
    return;
  }
  if (isHidden(t)) {
    detailEl.innerHTML = `<h3>Hidden trophy</h3><p class="d-desc">This is a story trophy. Earn it in the game, or turn “Hide story spoilers” off to read its guide.</p>`;
    return;
  }
  detailEl.innerHTML = `
    <h3></h3>
    <p class="d-desc"></p>
    <div>${gradeBadge(t)} <span class="tag">${KIND_LABEL[t.kind]}</span>${t.missable ? ' <span class="tag missable">⚠ Missable</span>' : ''}</div>
    ${t.missable ? '<div class="missable-box"><strong>Missable.</strong> See the Missable &amp; saves tab for the save strategy — do this one before the chapter ends.</div>' : ''}
    <h4>Guide</h4>
    <p class="d-guide"></p>
    <h4>Sources</h4>
    <ul class="d-sources"></ul>`;
  detailEl.querySelector('h3').textContent = t.name;
  detailEl.querySelector('.d-desc').textContent = t.description;
  detailEl.querySelector('.d-guide').textContent = t.guide;
  const ul = detailEl.querySelector('.d-sources');
  for (const s of t.sources) {
    const li = document.createElement('li');
    li.textContent = s;
    ul.append(li);
  }
}

function setView(view) {
  state.view = view;
  for (const b of document.querySelectorAll('#tabs button')) {
    b.classList.toggle('active', b.dataset.view === view);
  }
  $('checklistView').hidden = view !== 'checklist';
  $('roadmapView').hidden = view !== 'roadmap';
  $('missableView').hidden = view !== 'missable';
  $('sourcesView').hidden = view !== 'sources';
  $('toolbar').style.display = view === 'checklist' ? '' : 'none';
}

function bindControls() {
  for (const b of document.querySelectorAll('#tabs button')) {
    b.addEventListener('click', () => setView(b.dataset.view));
  }
  $('search').value = state.search;
  $('search').addEventListener('input', () => { state.search = $('search').value; renderList(); });
  $('gradeFilter').value = state.grade;
  $('gradeFilter').addEventListener('change', () => { state.grade = $('gradeFilter').value; renderList(); });
  $('kindFilter').value = state.kind;
  $('kindFilter').addEventListener('change', () => { state.kind = $('kindFilter').value; renderList(); });
  $('statusFilter').value = state.status;
  $('statusFilter').addEventListener('change', () => { state.status = $('statusFilter').value; renderList(); });
  $('spoilerToggle').checked = state.spoilersHidden;
  $('spoilerToggle').addEventListener('change', () => {
    state.spoilersHidden = $('spoilerToggle').checked;
    renderList();
    renderDetail();
  });
  $('exportBtn').addEventListener('click', () => {
    const payload = { game: 'Grand Theft Auto VI', platform: 'PlayStation 5', earned: [...state.earned].sort((a, b) => a - b), exportedAt: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'gta6-trophy-progress.json';
    a.click();
  });
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data) ? data : data.earned;
      const valid = new Set(state.trophies.map((t) => t.id));
      state.earned = new Set((Array.isArray(ids) ? ids : []).filter((n) => valid.has(n)));
      saveEarned();
      renderProgress();
      renderList();
      renderDetail();
    } catch {
      alert('That file is not a trophy progress export from this guide.');
    }
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear every tick on this checklist?')) {
      state.earned = new Set();
      saveEarned();
      renderProgress();
      renderList();
      renderDetail();
    }
  });
}

async function init() {
  state.earned = loadEarned();
  // Screenshot scenes: ?earn=1,2,3 pre-ticks some trophies for the shot.
  if (params.get('earn')) {
    for (const n of params.get('earn').split(',')) {
      const id = Number(n);
      if (Number.isInteger(id)) state.earned.add(id);
    }
    saveEarned();
  }
  bindControls();
  setView(state.view);
  try {
    const res = await fetch('data/trophies.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = await res.json();
    state.trophies = doc.trophies;
  } catch (err) {
    $('main').innerHTML = `<p class="load-error">Could not load data/trophies.json (${err.message}). Open this guide through a local server — for example, run <code>node serve.ts</code> in the repository and open http://localhost:8080 — or use the hosted page.</p>`;
    window.__ready = true;
    return;
  }
  renderProgress();
  renderList();
  renderDetail();
  window.__ready = true;
}

init();
