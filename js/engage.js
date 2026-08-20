import { localDateKey, localYesterdayKey } from './datetime.js';

const STREAK_KEY = 'rtobuddy.v5.streak';
const ATTEMPTS_KEY = 'rtobuddy.v5.attempts';

const FUN_FACTS = [
  "India has over 142 types of official road signs defined under IRC:67.",
  "The first driving licence in India was issued in 1907 in Kolkata.",
  "India has the second largest road network in the world — over 6.3 million km.",
  "The national speed limit on expressways in India is 120 km/h.",
  "Zebra crossings are named after the animal because of their alternating black & white stripes.",
  "The red octagon shape for STOP signs is used in 175+ countries worldwide.",
  "In India, honking near hospitals and schools is a punishable offence.",
  "The first traffic signal in India was installed at Egmore Junction, Chennai in 1953.",
  "A learner\u2019s licence is valid for only 6 months from the date of issue.",
  "Yellow road markings indicate no parking or no stopping zones.",
  "The penalty for drunk driving in India can be up to \u20B910,000 and/or 6 months jail.",
  "Indian highways use km stones — odd-numbered highways go North-South, even go East-West.",
];

export function getStreak() {
  try {
    const data = JSON.parse(localStorage.getItem(STREAK_KEY)) || {};
    const today = localDateKey();
    const yesterday = localYesterdayKey();
    if (data.lastDate === today || data.lastDate === yesterday) return data.count || 0;
    return 0;
  } catch { return 0; }
}

export function recordLearningActivity() {
  const today = localDateKey();
  let data;
  try {
    data = JSON.parse(localStorage.getItem(STREAK_KEY)) || {};
  } catch { data = {}; }

  if (data.lastDate === today) return data.count || 1;

  const yesterday = localYesterdayKey();
  const count = data.lastDate === yesterday ? (data.count || 0) + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ lastDate: today, count }));
  return count;
}

export function renderStreak(container) {
  if (!container) return;
  const count = getStreak();
  container.innerHTML = count > 0
    ? `<span class="streak-badge">🔥 ${count} day${count > 1 ? 's' : ''}</span>`
    : '';
}

export function renderSparkline(container) {
  if (!container) return;
  let attempts;
  try { attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]'); } catch { attempts = []; }
  const last5 = attempts.slice(0, 5).reverse();
  if (last5.length < 2) {
    container.innerHTML = '<span class="spark-empty">Take 2+ exams to see trends</span>';
    return;
  }
  const scores = last5.map(a => a.percent || 0);
  const max = 100;
  const w = 120, h = 36, pad = 4;
  const step = (w - pad * 2) / (scores.length - 1);
  const pts = scores.map((s, i) => `${pad + i * step},${h - pad - (s / max) * (h - pad * 2)}`);
  const polyline = pts.join(' ');
  const color = scores[scores.length - 1] >= 70 ? 'var(--th-ok-border)' : 'var(--th-accent)';
  container.innerHTML = `<svg class="sparkline-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${pts.map((p) => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3" fill="${color}"/>`).join('')}</svg><span class="spark-label">Last ${scores.length} exams</span>`;
}

export function confetti(container) {
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'confetti-burst';
  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];
  let html = '';
  for (let i = 0; i < 40; i++) {
    const c = colors[i % colors.length];
    const x = Math.random() * 100;
    const d = Math.random() * 0.6 + 0.4;
    const rot = Math.random() * 360;
    html += `<i class="confetti-piece" style="left:${x}%;background:${c};animation-duration:${d + 0.8}s;animation-delay:${d * 0.2}s;transform:rotate(${rot}deg)"></i>`;
  }
  el.innerHTML = html;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

export function showToast() {
  if (sessionStorage.getItem('rtobuddy.toast.shown')) return;
  sessionStorage.setItem('rtobuddy.toast.shown', '1');
  const fact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
  const el = document.createElement('div');
  el.className = 'dyk-toast';
  el.innerHTML = `<b>Did you know?</b> ${fact}`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 4500);
}
