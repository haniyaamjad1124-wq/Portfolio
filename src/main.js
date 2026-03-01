import './style.css'

// ── DATA STORE (localStorage-backed) ──
const DEFAULT_CS = [
  { id: 'cs1', title: 'Project Title One', desc: 'Brief description of the project, the problem it addressed, your role, and the key outcome or insight.', body: 'This is the full case study content for Project One. Replace this with your detailed write-up covering the problem, approach, solution, and results.', tag: 'product', date: 'March 2026', image: '', link: '' },
  { id: 'cs2', title: 'Project Title Two', desc: 'Brief description of the project, the problem it addressed, your role, and the key outcome or insight.', body: 'This is the full case study content for Project Two. Replace this with your detailed write-up.', tag: 'business', date: 'February 2026', image: '', link: '' },
  { id: 'cs3', title: 'Project Title Three', desc: 'Brief description of the project, the problem it addressed, your role, and the key outcome or insight.', body: 'This is the full case study content for Project Three. Replace this with your detailed write-up.', tag: 'data-viz', date: 'January 2026', image: '', link: '' }
];
const DEFAULT_EXP = [
  { id: 'exp1', title: 'Post Title One', desc: 'A short preview of your thought or essay goes here. What question were you wrestling with?', body: 'This is the full experiment post content. Replace with your actual writing — your thoughts, analysis, and reflections.', tag: '', date: 'March 2026', image: '', link: '' },
  { id: 'exp2', title: 'Post Title Two', desc: 'A short preview of your data-driven analysis or observation goes here.', body: 'Full content of your second experiment post. What patterns did you notice? What does the data reveal?', tag: '', date: 'February 2026', image: '', link: '' },
  { id: 'exp3', title: 'Post Title Three', desc: 'A short preview of your political thought or commentary goes here.', body: 'Full content of your third experiment post. What position are you examining? What is the nuance?', tag: '', date: 'January 2026', image: '', link: '' }
];

function getData(key, defaults) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : [...defaults]; }
  catch(e) { return [...defaults]; }
}
function setData(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) {} }

let caseStudies = getData('ha_cs', DEFAULT_CS);
let experiments = getData('ha_exp', DEFAULT_EXP);
let currentCMSTab = 'case-studies';
let navigationHistory = [];

// ── PAGE SWITCHING ──
function switchPage(pageId) {
  if (pageId !== 'detail') navigationHistory.push(pageId);
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + pageId).classList.add('active');
  document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
  const navLink = document.querySelector('.main-nav a[data-page="' + pageId + '"]');
  if (navLink) navLink.classList.add('active');
  const titles = { about: 'About Me', 'case-studies': 'Case Studies', experiments: 'Experiments', detail: 'Reading' };
  document.title = (titles[pageId] || 'Haniya Amjad') + ' — Haniya Amjad';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageId === 'case-studies') renderCaseStudies();
  if (pageId === 'experiments') renderExperiments();
}

function goBack(fallback) {
  navigationHistory.pop();
  const prev = navigationHistory.length ? navigationHistory[navigationHistory.length - 1] : (fallback || 'about');
  switchPage(prev);
}

// ── RENDER: CASE STUDIES ──
let activeCSFilter = 'all';
function renderCaseStudies(filter) {
  if (filter !== undefined) activeCSFilter = filter;
  const tags = ['all', ...new Set(caseStudies.map(c => c.tag).filter(Boolean))];
  document.getElementById('cs-filters').innerHTML = tags.map(t =>
    '<span class="topic-tag' + (t === activeCSFilter ? ' active' : '') + '" onclick="renderCaseStudies(\'' + t + '\')">' + (t === 'all' ? 'All' : tagLabel(t)) + '</span>'
  ).join('');
  const filtered = activeCSFilter === 'all' ? caseStudies : caseStudies.filter(c => c.tag === activeCSFilter);
  document.getElementById('cs-list').innerHTML = filtered.map(cs =>
    '<article class="case-study" onclick="openDetail(\'cs\',\'' + cs.id + '\')">' +
      '<div class="case-study-img">' + (cs.image ? '<img src="' + cs.image + '" alt="' + esc(cs.title) + '" />' : '<span>Image</span>') + '</div>' +
      '<div><h3 class="case-study-title">' + esc(cs.title) + '</h3>' +
      '<p class="case-study-desc">' + esc(cs.desc) + '</p>' +
      (cs.link ? '<span class="case-study-link"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg> Live Dashboard</span>' : '') +
      '</div>' +
    '</article>'
  ).join('') || '<p style="color:var(--muted);padding:2rem 0">No case studies in this category.</p>';
}

// ── RENDER: EXPERIMENTS ──
function renderExperiments() {
  document.getElementById('exp-list').innerHTML = experiments.map(ex =>
    '<article class="post" onclick="openDetail(\'exp\',\'' + ex.id + '\')">' +
      '<div class="post-meta"><span class="post-date">' + esc(ex.date) + '</span></div>' +
      '<h3 class="post-title">' + esc(ex.title) + '</h3>' +
      '<p class="post-excerpt">' + esc(ex.desc) + '</p>' +
    '</article>'
  ).join('') || '<p style="color:var(--muted);padding:2rem 0">No experiments yet.</p>';
}

// ── DETAIL VIEW ──
function openDetail(type, id) {
  const source = type === 'cs' ? caseStudies : experiments;
  const item = source.find(i => i.id === id);
  if (!item) return;
  const backPage = type === 'cs' ? 'case-studies' : 'experiments';
  const backLabel = type === 'cs' ? 'Case Studies' : 'Experiments';
  document.getElementById('detail-back').setAttribute('onclick', "goBack('" + backPage + "')");
  document.getElementById('detail-back-label').textContent = backLabel;
  document.getElementById('detail-title').textContent = item.title;
  document.getElementById('detail-date').textContent = item.date || '';
  // Hero image
  const heroEl = document.getElementById('detail-hero');
  if (item.image) {
    heroEl.innerHTML = '<img src="' + item.image + '" alt="' + esc(item.title) + '" />';
    heroEl.style.display = 'flex';
  } else {
    heroEl.innerHTML = '<span>Image</span>';
    heroEl.style.display = 'flex';
  }
  // Tag
  const tagEl = document.getElementById('detail-tag');
  if (item.tag) { tagEl.textContent = tagLabel(item.tag); tagEl.style.display = 'inline'; }
  else { tagEl.style.display = 'none'; }
  // Dashboard link
  const linkWrap = document.getElementById('detail-link-wrap');
  if (item.link) {
    linkWrap.innerHTML = '<a class="detail-link" href="' + esc(item.link) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg> Open Live Dashboard</a>';
  } else {
    linkWrap.innerHTML = '';
  }
  // Body
  const bodyHtml = item.body.split('\n').filter(p => p.trim()).map(p => '<p>' + esc(p) + '</p>').join('');
  document.getElementById('detail-body').innerHTML = bodyHtml;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');
  document.title = item.title + ' — Haniya Amjad';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── CMS AUTH ──
// Simple hash that works everywhere (including file:// protocol)
let cmsAuthenticated = false;

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  return 'h' + Math.abs(hash).toString(36);
}

function authenticateCMS() {
  if (cmsAuthenticated) return true;
  const pwd = prompt('Enter CMS password:');
  if (!pwd) return false;
  const hash = simpleHash(pwd);
  const storedHash = localStorage.getItem('ha_cms_hash');
  if (!storedHash) {
    // First-time setup: whatever you type becomes your password
    localStorage.setItem('ha_cms_hash', hash);
    cmsAuthenticated = true;
    alert('CMS password set! Remember this password.');
    return true;
  }
  if (hash === storedHash) {
    cmsAuthenticated = true;
    return true;
  }
  alert('Incorrect password.');
  return false;
}

function changeCMSPassword() {
  const current = prompt('Enter current password:');
  if (!current) return;
  const storedHash = localStorage.getItem('ha_cms_hash');
  if (storedHash && simpleHash(current) !== storedHash) { alert('Incorrect current password.'); return; }
  const newPwd = prompt('Enter new password:');
  if (!newPwd) return;
  const confirmPwd = prompt('Confirm new password:');
  if (newPwd !== confirmPwd) { alert('Passwords do not match.'); return; }
  localStorage.setItem('ha_cms_hash', simpleHash(newPwd));
  alert('CMS password updated successfully.');
}

// ── CMS ──
function toggleCMS() {
  const panel = document.getElementById('cms-panel');
  const overlay = document.getElementById('cms-overlay');
  const isOpen = panel.classList.contains('open');
  if (!isOpen) {
    const ok = authenticateCMS();
    if (!ok) return;
  }
  panel.classList.toggle('open'); overlay.classList.toggle('open');
  if (!isOpen) { renderCMSList(); closeCMSForm(); }
}
function switchCMSTab(tab) {
  currentCMSTab = tab;
  document.querySelectorAll('.cms-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('cms-tag-row').style.display = tab === 'case-studies' ? 'block' : 'none';
  renderCMSList(); closeCMSForm();
}
function renderCMSList() {
  const items = currentCMSTab === 'case-studies' ? caseStudies : experiments;
  document.getElementById('cms-content').innerHTML = items.map(item =>
    '<div class="cms-item">' +
      '<span class="cms-item-title">' + esc(item.title) +
        (item.image ? ' <span style="font-size:0.65rem;color:var(--green)" title="Has image">&#9679; img</span>' : '') +
        (item.link ? ' <span style="font-size:0.65rem;color:var(--blue)" title="Has link">&#9679; link</span>' : '') +
      '</span>' +
      '<div class="cms-item-actions">' +
        '<button class="cms-btn-sm" onclick="editCMSItem(\'' + item.id + '\')">Edit</button>' +
        '<button class="cms-btn-sm danger" onclick="deleteCMSItem(\'' + item.id + '\')">Delete</button>' +
      '</div>' +
    '</div>'
  ).join('') || '<p style="color:var(--muted);font-size:0.88rem;padding:1rem 0">No items yet.</p>';
}
function openCMSForm() {
  document.getElementById('cms-form').classList.add('open');
  document.getElementById('cms-edit-id').value = '';
  document.getElementById('cms-title').value = '';
  document.getElementById('cms-desc').value = '';
  document.getElementById('cms-body').value = '';
  document.getElementById('cms-image-data').value = '';
  document.getElementById('cms-image').value = '';
  document.getElementById('cms-link').value = '';
  document.getElementById('cms-tag').value = '';
  document.getElementById('cms-date').value = '';
  document.getElementById('cms-img-preview').style.display = 'none';
  document.getElementById('cms-tag-row').style.display = currentCMSTab === 'case-studies' ? 'block' : 'none';
}
function closeCMSForm() { document.getElementById('cms-form').classList.remove('open'); }
function editCMSItem(id) {
  const items = currentCMSTab === 'case-studies' ? caseStudies : experiments;
  const item = items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('cms-form').classList.add('open');
  document.getElementById('cms-edit-id').value = item.id;
  document.getElementById('cms-title').value = item.title;
  document.getElementById('cms-desc').value = item.desc;
  document.getElementById('cms-body').value = item.body;
  document.getElementById('cms-image-data').value = item.image || '';
  document.getElementById('cms-image').value = '';
  document.getElementById('cms-link').value = item.link || '';
  document.getElementById('cms-tag').value = item.tag || '';
  document.getElementById('cms-date').value = item.date || '';
  // Show existing image preview
  const preview = document.getElementById('cms-img-preview');
  if (item.image) {
    document.getElementById('cms-img-thumb').src = item.image;
    preview.style.display = 'inline-block';
  } else {
    preview.style.display = 'none';
  }
  document.getElementById('cms-tag-row').style.display = currentCMSTab === 'case-studies' ? 'block' : 'none';
}
// ── IMAGE UPLOAD HANDLER ──
function handleCMSImage(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2 MB for localStorage storage.'); input.value = ''; return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('cms-image-data').value = e.target.result;
    document.getElementById('cms-img-thumb').src = e.target.result;
    document.getElementById('cms-img-preview').style.display = 'inline-block';
  };
  reader.readAsDataURL(file);
}
function removeCMSImage() {
  document.getElementById('cms-image-data').value = '';
  document.getElementById('cms-image').value = '';
  document.getElementById('cms-img-preview').style.display = 'none';
}
function saveCMSItem() {
  const editId = document.getElementById('cms-edit-id').value;
  const title = document.getElementById('cms-title').value.trim();
  const desc = document.getElementById('cms-desc').value.trim();
  const body = document.getElementById('cms-body').value.trim();
  const image = document.getElementById('cms-image-data').value;
  const link = document.getElementById('cms-link').value.trim();
  const tag = document.getElementById('cms-tag').value;
  const date = document.getElementById('cms-date').value.trim();
  if (!title) { alert('Title is required'); return; }
  const items = currentCMSTab === 'case-studies' ? caseStudies : experiments;
  if (editId) {
    const item = items.find(i => i.id === editId);
    if (item) { item.title = title; item.desc = desc; item.body = body; item.image = image; item.link = link; item.tag = tag; item.date = date; }
  } else {
    const prefix = currentCMSTab === 'case-studies' ? 'cs' : 'exp';
    items.unshift({ id: prefix + Date.now(), title, desc, body, image, link, tag, date });
  }
  setData(currentCMSTab === 'case-studies' ? 'ha_cs' : 'ha_exp', items);
  renderCMSList(); closeCMSForm();
}
function deleteCMSItem(id) {
  if (!confirm('Delete this item?')) return;
  if (currentCMSTab === 'case-studies') {
    caseStudies = caseStudies.filter(i => i.id !== id); setData('ha_cs', caseStudies);
  } else {
    experiments = experiments.filter(i => i.id !== id); setData('ha_exp', experiments);
  }
  renderCMSList();
}

// ── HELPERS ──
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function tagLabel(t) { return { product: 'Product', business: 'Business', 'data-viz': 'Data Viz' }[t] || t; }

// ── SECRET CMS ACCESS ──
// Press Ctrl+Shift+E (Windows/Linux) or Cmd+Shift+E (Mac) to open the CMS
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
    e.preventDefault();
    toggleCMS();
  }
});

// ── EXPOSE FUNCTIONS TO WINDOW (for inline onclick handlers) ──
window.switchPage = switchPage;
window.goBack = goBack;
window.renderCaseStudies = renderCaseStudies;
window.renderExperiments = renderExperiments;
window.openDetail = openDetail;
window.toggleCMS = toggleCMS;
window.switchCMSTab = switchCMSTab;
window.openCMSForm = openCMSForm;
window.closeCMSForm = closeCMSForm;
window.editCMSItem = editCMSItem;
window.saveCMSItem = saveCMSItem;
window.deleteCMSItem = deleteCMSItem;
window.handleCMSImage = handleCMSImage;
window.removeCMSImage = removeCMSImage;
window.changeCMSPassword = changeCMSPassword;
