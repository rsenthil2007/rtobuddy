import { localDateKey, localYesterdayKey } from './datetime.js';

const ACTIVITY_KEY = 'rtobuddy.v5.activity';

export function renderHeroReadiness(root, db) {
  if (!root) return;
  const stats = getAttemptStats(db);
  const level = readinessLevel(stats.best);
  root.innerHTML = `<div class="mc-hero-readiness"><div class="mc-readiness-ring" style="--pct:${stats.best}%"><b>${stats.best}%</b><span>ready</span></div><div class="mc-readiness-note">${esc(level.label)}</div></div>`;
}

export function renderMissionPanel(root, db, jurisdiction) {
  if (!root) return;
  const mission = getMissionProgress();
  const name = jurisdiction?.jurisdiction?.name || jurisdiction?._name || 'your State/UT';
  const items = [
    { id: 'signs', title: 'Review 5 traffic signs', detail: mission.signsCount >= 5 ? 'Done!' : `${mission.signsCount}/5 viewed` },
    { id: 'exam10', title: 'Finish a 10-question test', detail: mission.exam10 ? 'Done!' : 'Complete any 10+ question test' },
    { id: 'stateRule', title: `Review 1 ${name} rule`, detail: mission.stateRule ? 'Done!' : 'Browse State / UT differences' },
  ];
  const done = items.filter((x) => mission[x.id]).length;
  root.innerHTML = `<ul class="mc-mission-list">${items.map((item) => `<li><div class="mc-mission-item${mission[item.id] ? ' done' : ''}"><span class="mc-check${mission[item.id] ? ' done' : ''}" aria-hidden="true"></span><span><b>${esc(item.title)}</b><small>${esc(item.detail)}</small></span></div></li>`).join('')}</ul><div class="mc-mission-progress"><div class="mc-progress-bar"><i style="width:${Math.round((done / items.length) * 100)}%"></i></div><div class="small">${done} of ${items.length} complete today</div></div>`;
}

export function trackSignView(signId) {
  if (!signId) return;
  const activity = getActivity();
  if (!activity.signIds.includes(signId)) {
    activity.signIds.push(signId);
    saveActivity(activity);
  }
}

export function trackStateRuleView() {
  const activity = getActivity();
  if (!activity.stateRule) {
    activity.stateRule = true;
    saveActivity(activity);
  }
}

export function trackExamComplete(total) {
  const activity = getActivity();
  if (total >= 10) activity.exam10 = true;
  saveActivity(activity);
}

export function getMissionProgress() {
  const activity = getActivity();
  return {
    signs: activity.signIds.length >= 5,
    signsCount: activity.signIds.length,
    exam10: activity.exam10,
    stateRule: activity.stateRule,
  };
}

export function renderDailyLoop(root, db) {
  if (!root) return;
  const stats = getAttemptStats(db);
  const mission = getMissionProgress();
  const progress = [mission.signs, mission.exam10, mission.stateRule].filter(Boolean).length;
  const next = !mission.exam10 ? 'Finish today’s 10-question test.'
    : !mission.signs ? 'Review 5 traffic signs.'
    : !mission.stateRule ? 'Check one State / UT difference.'
    : stats.attempts ? 'Replay mistakes or push for a stronger score.' : 'Start your first learning session.';
  root.innerHTML = `<div class="daily-loop-card"><b>2-minute daily flow</b><p>${esc(next)}</p><div class="small">Session progress: ${progress}/3 complete today</div></div>`;
}

export function renderConfidenceMap(root, db) {
  if (!root) return;
  const items = buildConfidenceMap();
  root.innerHTML = `<div class="confidence-grid">${items.map((item) => `<div class="confidence-item"><b>${esc(item.label)}</b><span class="pill">${esc(item.status)}</span><small>${esc(item.note)}</small></div>`).join('')}</div>`;
}

export function renderAchievements(root) {
  if (!root) return;
  const list = buildAchievements();
  root.innerHTML = list.length
    ? `<div class="achievement-grid">${list.map((item) => `<div class="achievement-item"><b>${esc(item.title)}</b><small>${esc(item.detail)}</small></div>`).join('')}</div>`
    : '<div class="empty">Earn badges by taking tests, viewing signs, and reviewing State rules.</div>';
}

export function renderSevenDayPlan(root) {
  if (!root) return;
  const attempts = loadAttempts();
  const mission = getMissionProgress();
  const completed = {
    day1: mission.signs,
    day2: attempts.some((x) => x.category === 'traffic_signal' || x.category === 'all'),
    day3: attempts.some((x) => x.category === 'road_marking' || x.category === 'all'),
    day4: attempts.some((x) => x.category === 'road_rule' || x.category === 'all'),
    day5: mission.stateRule,
    day6: attempts.some((x) => x.total >= 10),
    day7: attempts.some((x) => x.mode === 'simulator'),
  };
  const steps = [
    ['day1', 'Day 1', 'Signs Drill', 'signs'],
    ['day2', 'Day 2', 'Signals Sprint', 'signals'],
    ['day3', 'Day 3', 'Road Markings', 'markings'],
    ['day4', 'Day 4', 'Road Rules', 'rules'],
    ['day5', 'Day 5', 'State specifics', 'state'],
    ['day6', 'Day 6', 'Mock test', 'mock'],
    ['day7', 'Day 7', 'Final simulator', 'simulator'],
  ];
  root.innerHTML = `<div class="plan-grid">${steps.map(([id, day, label, action]) => `<button type="button" class="plan-step${completed[id] ? ' done' : ''}" data-plan-action="${action}"><b>${esc(day)}</b><span>${esc(label)}</span><small>${completed[id] ? 'Complete' : 'Start'}</small></button>`).join('')}</div>`;
}

export function renderJurisdictionPanel(root, db, jurisdiction) {
  if (!root) return;
  if (!db || !jurisdiction) {
    root.innerHTML = '<div class="empty">Select a State/UT to see local guidance.</div>';
    return;
  }
  const name = jurisdiction.jurisdiction?.name || jurisdiction._name || 'Selected region';
  const code = jurisdiction._code || jurisdiction.jurisdiction?.code || '';
  const dynamic = db.dynamic || {};
  const procedures = dynamic.administrative_procedures || [];
  const speedNotes = dynamic.speed_limits || [];
  const stateRules = (db.rules || []).filter((r) => String(r.id || '').startsWith(`${code}-R-LOC`));
  const localServices = (db.services || []).filter((s) => String(s.id || '').startsWith(`${code}-SVC`));
  const rule = stateRules[0];
  const procedure = procedures[0];
  const speed = speedNotes[0];
  const svcHtml = localServices.slice(0, 2).map((s) =>
    `<a class="service mc-service" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(s.name)}</b><span>${esc(s.purpose || '')}</span><small>Official source</small></a>`,
  ).join('');
  root.innerHTML = `<div class="mc-jurisdiction-head"><span class="mc-badge">Today in ${esc(name)}</span><span class="small">${localServices.length} local service link${localServices.length === 1 ? '' : 's'}</span></div>${rule ? `<div class="small mc-jurisdiction-copy"><b>Local rule to remember:</b> ${esc(rule.title)} — ${esc(rule.summary)}</div>` : ''}${procedure ? `<div class="notice section-note"><b>${esc(procedure.topic)}</b><br>${esc(procedure.summary)}${procedure.official_url ? `<br><a href="${esc(procedure.official_url)}" target="_blank" rel="noopener noreferrer">Open official portal</a>` : ''}</div>` : ''}${speed ? `<div class="small section-note"><b>Local note:</b> ${esc(speed.summary)}</div>` : ''}${svcHtml || '<div class="small">Use Tools → Official Services for national portals.</div>'}`;
}

export function checkVehicleAge(year, root) {
  const y = Number(year);
  const now = new Date().getFullYear();
  if (!Number.isFinite(y) || y < 1900 || y > now) {
    root.innerHTML = '<div class="bad">Enter a valid registration year.</div>';
    return;
  }
  const age = now - y;
  root.innerHTML = `<div class="notice"><b>Approximate vehicle age: ${age} year${age === 1 ? '' : 's'}.</b><br>Age alone is not a universal scrappage rule. Check the selected jurisdiction, vehicle class and current applicable orders.</div>`;
}

export function renderReadiness(root, db) {
  const stats = getAttemptStats(db);
  const level = readinessLevel(stats.best);
  root.innerHTML = `<div class="mc-progress-grid"><div class="mc-progress-stat"><b>${stats.streak}</b><span>day streak</span></div><div class="mc-progress-stat"><b>${stats.attempts}</b><span>attempts</span></div><div class="mc-progress-stat"><b>${stats.best}%</b><span>best score</span></div><div class="mc-progress-stat"><b>${esc(level.label)}</b><span>status</span></div></div><div class="${stats.best >= 60 ? 'ok' : 'notice'} section-note"><b>${esc(level.label)}</b><br>${stats.latest ? `Latest: ${stats.latest.percent}%${stats.latest.weak?.length ? ' · Review ' + stats.latest.weak.join(', ') : ''}` : 'Take your first mock test to start tracking progress.'}</div>`;
}

export function renderServices(db, root, code) {
  const list = (db?.services || []).filter((s) => s.scope === 'national' || s.scope === code);
  if (!list.length) {
    root.innerHTML = '<div class="empty">No official service links for this selection.</div>';
    return;
  }
  root.innerHTML = list.map((s) => `<a class="service mc-service" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(s.name)}</b><span>${esc(s.purpose)}</span><small>Official source</small></a>`).join('');
}

function readinessLevel(percent) {
  if (percent >= 90) return { label: 'Strong', message: 'Excellent! You are well prepared.' };
  if (percent >= 80) return { label: 'Exam Ready', message: 'Great work — you are exam ready!' };
  if (percent >= 60) return { label: 'Improving', message: 'Good progress. Focus on weak areas.' };
  return { label: 'Keep Practising', message: 'Build your knowledge with Learning and Rules.' };
}

function getAttemptStats(db) {
  let attempts = [];
  try {
    attempts = JSON.parse(localStorage.getItem('rtobuddy.v5.attempts') || '[]');
  } catch {
    attempts = [];
  }
  const best = attempts.reduce((m, x) => Math.max(m, x.percent || 0), 0);
  const latest = attempts[0] || null;
  const streak = getStreakFromActivity();
  return {
    attempts: attempts.length,
    best,
    latest,
    streak,
    qCount: db?.questions?.length || 0,
  };
}

function buildConfidenceMap() {
  const attempts = loadAttempts();
  const latest = attempts[0] || {};
  const weakSet = new Set((latest.weakDetails || []).map((x) => x.category));
  const attempted = new Set(attempts.map((x) => x.category).filter(Boolean));
  const defs = [
    ['traffic_sign', 'Traffic signs'],
    ['traffic_signal', 'Traffic signals'],
    ['road_marking', 'Road markings'],
    ['road_rule', 'Road rules'],
    ['learner_and_process', 'Learner & process'],
  ];
  return defs.map(([category, label]) => {
    const practised = attempted.has(category) || attempts.some((x) => x.category === 'all');
    if (weakSet.has(category)) return { label, status: 'Needs work', note: 'Recent mistakes showed up here.' };
    if (practised && latest.percent >= 80) return { label, status: 'Strong', note: 'Recent performance looks steady.' };
    if (practised) return { label, status: 'Improving', note: 'Keep building speed and accuracy.' };
    return { label, status: 'Fresh', note: `Start a ${label.toLowerCase()} session.` };
  });
}

function buildAchievements() {
  const attempts = loadAttempts();
  const mission = getMissionProgress();
  const best = attempts.reduce((m, x) => Math.max(m, x.percent || 0), 0);
  const items = [];
  if (attempts.length) items.push({ title: 'First Test', detail: 'Completed your first practice run.' });
  if (attempts.length >= 3) items.push({ title: 'Drill Runner', detail: 'Built momentum across multiple sessions.' });
  if (best >= 80) items.push({ title: 'Exam Ready', detail: 'Crossed the 80% readiness mark.' });
  if (best >= 90) items.push({ title: 'Road Ace', detail: 'Reached strong mock-test territory.' });
  if (mission.signs) items.push({ title: 'Sign Spotter', detail: 'Reviewed 5 signs in one day.' });
  if (mission.stateRule) items.push({ title: 'Local Rule Aware', detail: 'Checked State / UT-specific guidance.' });
  if (attempts.some((x) => x.mode === 'challenge')) items.push({ title: 'Challenge Accepted', detail: 'Took on challenge mode.' });
  return items.slice(0, 6);
}

function loadAttempts() {
  try {
    return JSON.parse(localStorage.getItem('rtobuddy.v5.attempts') || '[]');
  } catch {
    return [];
  }
}

function getStreakFromActivity() {
  try {
    const data = JSON.parse(localStorage.getItem('rtobuddy.v5.streak') || '{}');
    const today = localDateKey();
    const yesterday = localYesterdayKey();
    if (data.lastDate === today || data.lastDate === yesterday) return data.count || 0;
    return 0;
  } catch { return 0; }
}

function getActivity() {
  const today = localDateKey();
  try {
    const stored = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '{}');
    if (stored.date === today) return stored;
  } catch {}
  return { date: today, signIds: [], exam10: false, stateRule: false };
}

function saveActivity(activity) {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  } catch {}
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
