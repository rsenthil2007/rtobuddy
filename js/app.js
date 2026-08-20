import { loadCommon, loadJurisdiction, JURISDICTIONS } from './data.js';
import { resolveKnowledge, getQualityLabel } from './jurisdiction.js';
import { renderLearning } from './learning.js';
import { renderRules, populateCategories, renderSigns, renderSignals, renderMarkings, renderCrossState, registerAnimationRenderer } from './rules.js';
import { renderAnimation } from './animations.js';
import { createExam, renderQuestion, nextQuestion, startDrill, startReplay, startSpotIt, getLatestWeakCategory, registerCompleteHook } from './exam.js';
import { renderHeroReadiness, renderMissionPanel, renderReadiness, renderDailyLoop, renderConfidenceMap, renderAchievements, renderSevenDayPlan, renderServices, renderJurisdictionPanel, checkVehicleAge, trackSignView, trackStateRuleView, trackExamComplete, getMissionProgress } from './tools.js';
import { initTheme, renderThemePicker } from './theme.js';
import { renderStreak, renderSparkline, showToast } from './engage.js';
import { dailyIndex } from './datetime.js';

const $ = (id) => document.getElementById(id);
let common = null;
let db = null;
let jurisdiction = null;

const e = {
  region: $('region'),
  status: $('status'),
  daily: $('daily'),
  rc: $('rc'),
  sc: $('sc'),
  mc: $('mc'),
  qc: $('qc'),
  ls: $('ls'),
  la: $('la'),
  ll: $('ll'),
  learnMode: $('learnMode'),
  rs: $('rs'),
  cat: $('cat'),
  rl: $('rl'),
  ss: $('ss'),
  sl: $('sl'),
  ms: $('ms'),
  ml: $('ml'),
  sigSearch: $('sigSearch'),
  sigList: $('sigList'),
  crossSearch: $('crossSearch'),
  crossState: $('crossState'),
  setup: $('setup'),
  examArea: $('examArea'),
  result: $('result'),
  prog: $('prog'),
  qq: $('qq'),
  opts: $('opts'),
  exp: $('exp'),
  next: $('next'),
  n: $('n'),
  examCategory: $('examCategory'),
  examMode: $('examMode'),
  challengeTarget: $('challengeTarget'),
  examModeNote: $('examModeNote'),
  replayRecent: $('replayRecent'),
  vy: $('vy'),
  ar: $('ar'),
  heroReadiness: $('heroReadiness'),
  missionPanel: $('missionPanel'),
  readiness: $('readiness'),
  dailyLoop: $('dailyLoop'),
  confidenceMap: $('confidenceMap'),
  achievements: $('achievements'),
  sevenDayPlan: $('sevenDayPlan'),
  launchSpotIt: $('launchSpotIt'),
  jurisdictionPanel: $('jurisdictionPanel'),
  services: $('services'),
  continueTraining: $('continueTraining'),
  launchSigns: $('launchSigns'),
  launchExam: $('launchExam'),
  launchState: $('launchState'),
  launchSignals: $('launchSignals'),
  qsMeta: $('qsMeta'),
  qeMeta: $('qeMeta'),
  qrMeta: $('qrMeta'),
  qgMeta: $('qgMeta'),
  learnMeta: $('learnMeta'),
  rulesMeta: $('rulesMeta'),
  examMeta: $('examMeta'),
  rulesCount: $('rulesCount'),
  crossCount: $('crossCount'),
  signsCount: $('signsCount'),
  signalsCount: $('signalsCount'),
  markingsCount: $('markingsCount'),
};

const EE = {
  setup: e.setup,
  examArea: e.examArea,
  result: e.result,
  progress: e.prog,
  progressBar: $('examProgressBar'),
  visual: $('qvisual'),
  question: e.qq,
  options: e.opts,
  explanation: e.exp,
  next: e.next,
};

function showStatus(html, tone = 'info') {
  e.status.className = tone === 'bad' ? 'section-note bad' : 'section-note';
  e.status.innerHTML = html;
}

function refreshHomePanels() {
  renderStreak($('streakBadge'));
  renderHeroReadiness(e.heroReadiness, db);
  renderMissionPanel(e.missionPanel, db, jurisdiction);
  renderReadiness(e.readiness, db);
  renderDailyLoop(e.dailyLoop, db);
  renderConfidenceMap(e.confidenceMap, db);
  renderAchievements(e.achievements);
  renderSevenDayPlan(e.sevenDayPlan);
}

function onExamComplete(meta) {
  if (meta?.total >= 10) trackExamComplete(meta.total);
  refreshHomePanels();
}

function updateExamModeNote() {
  if (!e.examModeNote || !e.examMode) return;
  const notes = {
    practice: 'Practice gives instant feedback after each answer.',
    simulator: 'Simulator hides detailed review until the end, like a real test.',
    challenge: `Challenge mode pushes you to beat ${e.challengeTarget?.value || '80'}% and share the result.`,
  };
  e.examModeNote.textContent = notes[e.examMode.value] || notes.practice;
}

async function init() {
  initTheme();
  renderThemePicker($('themePicker'));
  registerAnimationRenderer(renderAnimation);
  registerCompleteHook(onExamComplete);
  renderStreak($('streakBadge'));
  renderSparkline($('sparkline'));
  showToast();
  if (location.protocol === 'file:') {
    showStatus(
      '<b>Local web server required.</b> Browsers block JSON loading from <code>file://</code>. Run <code>start.bat</code> or <code>python -m http.server 8080</code>, then open <code>http://localhost:8080</code>.',
      'bad',
    );
    populateRegions();
    bind();
    return;
  }

  try {
    common = await loadCommon();
    populateRegions();
    populateCategories(common, e.cat);
    bind();
    if (common._failed?.length) {
      showStatus(
        `<b>Partial load.</b> ${common._failed.length} optional file(s) missing. Core content is available.`,
      );
    }
    await selectRegion(localStorage.getItem('rtobuddy.v5.region') || 'TN');
  } catch (err) {
    console.error(err);
    showStatus(
      `<b>Dataset failed to load.</b> ${esc(err.message || 'Unknown error')} Run <code>start.bat</code> from this folder.`,
      'bad',
    );
    populateRegions();
    bind();
  }
}

function populateRegions() {
  e.region.innerHTML = Object.entries(JURISDICTIONS)
    .sort((a, b) => a[1][1].localeCompare(b[1][1]))
    .map(([c, [, n]]) => `<option value="${c}">${n}</option>`)
    .join('');
}

async function selectRegion(code) {
  if (!common) return;
  showStatus('Loading jurisdiction…');
  try {
    jurisdiction = await loadJurisdiction(code, common.jurisdictionOverlays);
    db = resolveKnowledge(common, jurisdiction);
    localStorage.setItem('rtobuddy.v5.region', code);
    e.region.value = code;
    showStatus(`<b>${esc(jurisdiction.jurisdiction.name)}</b> · <span class="quality">${esc(getQualityLabel(jurisdiction))}</span>`);
    stats();
    all();
  } catch (err) {
    console.error(err);
    db = resolveKnowledge(common, null);
    stats();
    all();
    showStatus('Jurisdiction file unavailable; national baseline remains active.', 'bad');
  }
}

function stats() {
  if (!db) return;
  if (e.qsMeta) e.qsMeta.textContent = '5 sign questions';
  if (e.qeMeta) e.qeMeta.textContent = '5 mixed questions';
  if (e.qrMeta) e.qrMeta.textContent = `${db.rules.length} rules`;
  if (e.qgMeta) e.qgMeta.textContent = '5 signal questions';
  if (e.learnMeta) e.learnMeta.textContent = `${db.rules.length} rules · ${db.licensing.length} journey steps · ${db.documents.length} documents`;
  if (e.rulesMeta) e.rulesMeta.textContent = `${db.rules.length} rules · ${db.signs.length} signs · ${db.markings.length} markings`;
  if (e.examMeta) e.examMeta.textContent = `${db.questions.length} questions available`;
  if (e.rulesCount) e.rulesCount.textContent = `${db.rules.length} rules`;
  if (e.crossCount) e.crossCount.textContent = `${db.crossState.length} topics`;
  if (e.signsCount) e.signsCount.textContent = `${db.signs.length} signs`;
  if (e.signalsCount) e.signalsCount.textContent = `${db.signals.length} signals`;
  if (e.markingsCount) e.markingsCount.textContent = `${db.markings.length} markings`;
}

function all() {
  if (!db) return;
  renderLearning(db, e.ll, e.ls.value, e.la.value, e.learnMode.value);
  renderRules(db, e.rl, e.rs.value, e.cat.value);
  renderSigns(db, e.sl, e.ss.value);
  renderSignals(db, e.sigList, e.sigSearch.value);
  renderCrossState(db, e.crossState, e.crossSearch.value);
  renderMarkings(db, e.ml, e.ms.value);
  daily();
  refreshHomePanels();
  renderJurisdictionPanel(e.jurisdictionPanel, db, jurisdiction);
  renderServices(db, e.services, jurisdiction?._code);
}

function daily() {
  if (!e.daily) return;
  if (!db?.rules?.length) {
    e.daily.innerHTML = '<div class="empty">Daily rule is temporarily unavailable.</div>';
    return;
  }
  const r = db.rules[dailyIndex(db.rules.length)] || db.rules[0];
  const title = r?.title || 'Road Rule';
  const summary = r?.summary || 'Review this rule in the Road Rules section.';
  e.daily.innerHTML = `<div class="mc-daily"><b>${esc(title)}</b><br>${esc(summary)}<div class="small">${esc(r?.category || 'general')} · ${esc(r?.legal_reference || '')}</div></div>`;
}

function go(v, b) {
  document.querySelectorAll('.view').forEach((x) => { x.classList.remove('no-anim'); x.classList.toggle('active', x.id === v); });
  document.querySelectorAll('.nav button').forEach((x) => {
    const active = x.dataset.view === v;
    x.classList.toggle('active', active);
    if (active) x.setAttribute('aria-current', 'page');
    else x.removeAttribute('aria-current');
  });
  b?.classList.add('active');
  if (v === 'home') {
    daily();
    refreshHomePanels();
  }
  if (v === 'rules') trackStateRuleView();
  scrollTo({ top: 0, behavior: 'smooth' });
}

function bind() {
  e.region.addEventListener('change', (x) => selectRegion(x.target.value));
  e.ls.addEventListener('input', () => renderLearning(db, e.ll, e.ls.value, e.la.value, e.learnMode.value));
  e.la.addEventListener('change', () => renderLearning(db, e.ll, e.ls.value, e.la.value, e.learnMode.value));
  e.learnMode.addEventListener('change', () => renderLearning(db, e.ll, e.ls.value, e.la.value, e.learnMode.value));
  e.rs.addEventListener('input', () => renderRules(db, e.rl, e.rs.value, e.cat.value));
  e.cat.addEventListener('change', () => renderRules(db, e.rl, e.rs.value, e.cat.value));
  e.ss.addEventListener('input', () => renderSigns(db, e.sl, e.ss.value));
  e.ms.addEventListener('input', () => renderMarkings(db, e.ml, e.ms.value));
  e.sigSearch.addEventListener('input', () => renderSignals(db, e.sigList, e.sigSearch.value));
  e.crossSearch.addEventListener('input', () => { trackStateRuleView(); renderCrossState(db, e.crossState, e.crossSearch.value); refreshHomePanels(); });
  e.examMode?.addEventListener('change', updateExamModeNote);
  e.challengeTarget?.addEventListener('change', updateExamModeNote);
  e.sl?.addEventListener('click', (ev) => {
    const card = ev.target.closest('[data-sign-id]');
    if (!card) return;
    trackSignView(card.dataset.signId);
    refreshHomePanels();
  });
  $('startExam').addEventListener('click', startExam);
  e.replayRecent?.addEventListener('click', replayRecentMistakes);
  e.next.addEventListener('click', () => nextQuestion(db, EE, startExam));
  $('checkAge').addEventListener('click', () => checkVehicleAge(e.vy.value, e.ar));
  document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => go(b.dataset.view, b)));
  e.continueTraining?.addEventListener('click', () => quickLaunch('continue'));
  e.launchSigns?.addEventListener('click', () => quickLaunch('signs'));
  e.launchExam?.addEventListener('click', () => quickLaunch('quick5'));
  e.launchState?.addEventListener('click', () => quickLaunch('state'));
  e.launchSignals?.addEventListener('click', () => quickLaunch('signals'));
  e.launchSpotIt?.addEventListener('click', () => quickLaunch('spotit'));
  e.sevenDayPlan?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-plan-action]');
    if (!btn) return;
    quickLaunch(btn.dataset.planAction);
  });
  updateExamModeNote();
}

function startExam() {
  if (!db?.questions?.length) {
    showStatus('No practice questions loaded. Reload the page or check data files.', 'bad');
    go('home', document.querySelector('.nav button[data-view="home"]'));
    return;
  }
  const wanted = Math.max(Number(e.n.value) || 20, 1);
  const mode = e.examMode?.value || 'practice';
  const challengeMode = mode === 'challenge';
  const count = Math.min(challengeMode ? 5 : wanted, db.questions.length);
  const exam = createExam(db, count, e.examCategory.value, mode);
  if (!exam.items.length) {
    showStatus('No questions match that focus category.', 'bad');
    return;
  }
  e.setup.classList.add('hide');
  e.result.classList.add('hide');
  e.examArea.classList.remove('hide');
  renderQuestion(db, EE, startExam);
}

function replayRecentMistakes() {
  if (!db?.questions?.length) {
    showStatus('No practice questions loaded.', 'bad');
    return;
  }
  go('exam', navButton('exam'));
  const ok = startReplay(db, EE, startExam);
  if (!ok) showStatus('No recent mistakes are available yet. Finish a test first.', 'bad');
}

function startSpotItFlow() {
  if (!db?.questions?.length) {
    showStatus('No practice questions loaded.', 'bad');
    return;
  }
  go('exam', navButton('exam'));
  const ok = startSpotIt(db, EE, startExam, 5);
  if (!ok) showStatus('No animated scenarios are available yet.', 'bad');
}

function startDrillFlow(category, count = 5) {
  if (!db?.questions?.length) {
    showStatus('No practice questions loaded.', 'bad');
    return;
  }
  go('exam', navButton('exam'));
  const ok = startDrill(db, EE, count, category, () => startDrillFlow(category, count));
  if (!ok) showStatus('No questions available for this drill.', 'bad');
}

function quickLaunch(kind) {
  if (kind === 'continue') {
    const mission = getMissionProgress();
    const weak = getLatestWeakCategory();
    if (weak) {
      startDrillFlow(weak, 5);
      return;
    }
    if (!mission.exam10) {
      go('exam', navButton('exam'));
      e.n.value = '10';
      e.examCategory.value = 'all';
      startExam();
      return;
    }
    if (!mission.signs) {
      go('rules', navButton('rules'));
      e.ss?.focus();
      return;
    }
    if (!mission.stateRule) {
      go('rules', navButton('rules'));
      e.crossSearch?.focus();
      return;
    }
    go('exam', navButton('exam'));
    e.examCategory.value = 'all';
    startExam();
    return;
  }
  if (kind === 'signs') {
    startDrillFlow('traffic_sign', 5);
    return;
  }
  if (kind === 'quick5') {
    startDrillFlow('all', 5);
    return;
  }
  if (kind === 'state') {
    go('rules', navButton('rules'));
    trackStateRuleView();
    e.crossSearch?.focus();
    refreshHomePanels();
    return;
  }
  if (kind === 'signals') {
    startDrillFlow('traffic_signal', 5);
    return;
  }
  if (kind === 'markings') {
    startDrillFlow('road_marking', 5);
    return;
  }
  if (kind === 'rules') {
    startDrillFlow('road_rule', 5);
    return;
  }
  if (kind === 'mock') {
    go('exam', navButton('exam'));
    e.examMode.value = 'practice';
    e.n.value = '10';
    e.examCategory.value = 'all';
    updateExamModeNote();
    startExam();
    return;
  }
  if (kind === 'simulator') {
    go('exam', navButton('exam'));
    e.examMode.value = 'simulator';
    e.n.value = '20';
    e.examCategory.value = 'all';
    updateExamModeNote();
    startExam();
    return;
  }
  if (kind === 'spotit') {
    startSpotItFlow();
  }
}

function navButton(view) {
  return document.querySelector(`.nav button[data-view="${view}"]`);
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

window.RTOBuddy = { go };
init();
