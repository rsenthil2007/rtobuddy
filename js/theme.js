const THEME_KEY = 'rtobuddy.v5.theme';
const THEMES = [
  { id: 'balanced',  label: 'Balanced',  icon: '⚖️' },
  { id: 'hardcore',  label: 'Hardcore',  icon: '🎮' },
  { id: 'classic',   label: 'Classic',   icon: '📄' },
];
const DEFAULT = 'balanced';

function stored() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function applyTheme(id) {
  if (!THEMES.some(t => t.id === id)) id = DEFAULT;
  document.documentElement.setAttribute('data-theme', id);
  if (document.body) document.body.setAttribute('data-theme', id);
  try { localStorage.setItem(THEME_KEY, id); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue('--th-meta-color').trim();
    if (color) meta.setAttribute('content', color);
  }
}

export function initTheme() {
  applyTheme(stored() || DEFAULT);
}

export function currentTheme() {
  return stored() || DEFAULT;
}

export function setTheme(id) {
  applyTheme(id);
}

export function renderThemePicker(container) {
  if (!container) return;
  const current = currentTheme();
  container.innerHTML = THEMES.map(t =>
    `<button type="button" class="theme-btn${t.id === current ? ' active' : ''}" data-theme-id="${t.id}" title="${t.label}"><span aria-hidden="true">${t.icon}</span></button>`
  ).join('');
  container.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-theme-id]');
    if (!btn) return;
    setTheme(btn.dataset.themeId);
    container.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.themeId === btn.dataset.themeId));
  });
}

export { THEMES };
