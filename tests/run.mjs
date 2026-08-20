import './env.mjs';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { resetStorage } from './env.mjs';
import { localDateKey, localYesterdayKey, localDateTimeISO, dailyIndex, hashDateKey } from '../js/datetime.js';
import { createExam, startDrill, startReplay, startSpotIt, renderQuestion, readinessLevel, computeWeakAreas, getLatestWeakCategory, registerCompleteHook } from '../js/exam.js';
import { resolveKnowledge, getQualityLabel } from '../js/jurisdiction.js';
import { renderExamVisual, getExamVisualLabel, registerAnimationRenderer } from '../js/rules.js';
import { renderAnimation, hasAnimation, ANIMATIONS } from '../js/animations.js';
import { THEMES, currentTheme, setTheme, initTheme, renderThemePicker } from '../js/theme.js';
import { getStreak, recordLearningActivity, renderStreak } from '../js/engage.js';
import { trackSignView, trackStateRuleView, trackExamComplete, getMissionProgress, checkVehicleAge, renderMissionPanel, renderHeroReadiness, renderReadiness, renderDailyLoop, renderConfidenceMap, renderAchievements, renderSevenDayPlan } from '../js/tools.js';
import { renderLearning } from '../js/learning.js';
import { JURISDICTIONS } from '../js/data.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORIES = ['traffic_sign', 'traffic_signal', 'road_marking', 'road_rule', 'learner_and_process'];

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
  if (cond) {
    passed++;
    return;
  }
  failed++;
  failures.push(msg);
  console.error('  FAIL  ' + msg);
}

function assertEqual(actual, expected, msg) {
  assert(actual === expected, `${msg} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
}

function loadJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function classList() {
  const set = new Set();
  return {
    add: (...c) => c.forEach((x) => set.add(x)),
    remove: (...c) => c.forEach((x) => set.delete(x)),
    toggle(c, force) {
      if (force === true) set.add(c);
      else if (force === false) set.delete(c);
      else if (set.has(c)) set.delete(c);
      else set.add(c);
    },
    contains: (c) => set.has(c),
    toArray: () => [...set],
  };
}

function makeEls() {
  const options = {
    _html: '',
    buttons: [],
    set innerHTML(v) {
      this._html = v;
      this.buttons = [...String(v).matchAll(/data-index="(\d+)"/g)].map((m) => {
        const listeners = [];
        const classes = classList();
        return {
          dataset: { index: m[1] },
          disabled: false,
          classList: classes,
          addEventListener(_type, fn) { listeners.push(fn); },
          click() { listeners.forEach((fn) => fn()); },
        };
      });
    },
    get innerHTML() { return this._html; },
    querySelectorAll() { return this.buttons; },
  };
  return {
    setup: { classList: classList() },
    examArea: { classList: classList() },
    result: { classList: classList(), innerHTML: '', querySelector() { return { addEventListener() {} }; }, querySelectorAll() { return []; } },
    progress: { textContent: '' },
    progressBar: { style: {} },
    visual: { innerHTML: '', classList: classList() },
    question: { textContent: '' },
    options,
    explanation: { innerHTML: '' },
    next: { classList: classList() },
  };
}

function loadCommon() {
  return {
    rules: loadJson('data/common/rules.json').rules,
    signs: loadJson('data/common/traffic_signs.json').signs,
    signals: loadJson('data/common/traffic_signals.json').signals,
    markings: loadJson('data/common/road_markings.json').markings,
    questions: loadJson('data/common/mock_questions.json').questions,
    licensing: loadJson('data/common/licensing_process.json').steps,
    documents: loadJson('data/common/documents.json').documents,
    learnerRules: loadJson('data/common/learner_rules.json').rules,
    vehicleClasses: loadJson('data/common/vehicle_classes.json').classes,
    services: loadJson('data/common/official_services.json').services,
    crossState: loadJson('data/common/cross_state_compliance.json').items,
    sources: loadJson('data/common/sources.json'),
    baseline: loadJson('data/common/national_baseline.json'),
    jurisdictionOverlays: loadJson('data/common/jurisdiction_overlays.json').overlays || {},
  };
}

registerAnimationRenderer(renderAnimation);

console.log('\n=== Unit: local datetime ===');
{
  const d = new Date(2026, 7, 20, 0, 30, 5);
  assertEqual(localDateKey(d), '2026-08-20', 'localDateKey uses local calendar date');
  assertEqual(localYesterdayKey(d), '2026-08-19', 'localYesterdayKey is previous local day');
  assertEqual(localDateTimeISO(d), '2026-08-20T00:30:05', 'localDateTimeISO is local, not UTC');
  const utcMidnightish = new Date(Date.UTC(2026, 7, 19, 20, 0, 0));
  const utcKey = utcMidnightish.toISOString().slice(0, 10);
  const localKey = localDateKey(utcMidnightish);
  assertEqual(localKey, `${utcMidnightish.getFullYear()}-${String(utcMidnightish.getMonth() + 1).padStart(2, '0')}-${String(utcMidnightish.getDate()).padStart(2, '0')}`, 'localDateKey matches getFullYear/Month/Date');
  if (utcMidnightish.getTimezoneOffset() !== 0) {
    assert(localKey !== utcKey, `local date (${localKey}) must differ from UTC (${utcKey}) when offset is not 0`);
  } else {
    passed++;
  }
  const a = dailyIndex(40, d);
  const b = dailyIndex(40, d);
  assertEqual(a, b, 'dailyIndex is stable for the same local date');
  assert(a >= 0 && a < 40, 'dailyIndex stays in range');
  assert(hashDateKey('2026-08-20') !== hashDateKey('2026-08-21'), 'date hash changes by day');
}

console.log('\n=== Unit: readiness scoring ===');
{
  assertEqual(readinessLevel(59).label, 'Keep Practising', 'below 60');
  assertEqual(readinessLevel(60).label, 'Improving', '60 is Improving');
  assertEqual(readinessLevel(79).label, 'Improving', '79 is Improving');
  assertEqual(readinessLevel(80).label, 'Exam Ready', '80 is Exam Ready');
  assertEqual(readinessLevel(89).label, 'Exam Ready', '89 is Exam Ready');
  assertEqual(readinessLevel(90).label, 'Strong', '90 is Strong');
  assertEqual(readinessLevel(100).label, 'Strong', '100 is Strong');
}

console.log('\n=== Unit: weak areas & continue training hint ===');
{
  const weak = computeWeakAreas(
    [{ category: 'road_marking' }, { category: 'road_marking' }, { category: 'traffic_sign' }],
    10,
  );
  assertEqual(weak[0].category, 'road_marking', 'worst category sorts first');
  assertEqual(weak[0].percent, 80, '2 misses of 10 = 80% remaining');
  resetStorage();
  assertEqual(getLatestWeakCategory(), null, 'no attempts => no weak category');
  localStorage.setItem('rtobuddy.v5.attempts', JSON.stringify([{ weakDetails: [{ category: 'traffic_signal' }] }]));
  assertEqual(getLatestWeakCategory(), 'traffic_signal', 'reads weakDetails[0]');
  localStorage.setItem('rtobuddy.v5.attempts', JSON.stringify([{ weak: ['Road markings'] }]));
  assertEqual(getLatestWeakCategory(), 'road_marking', 'maps legacy weak labels');
}

console.log('\n=== Unit: exam pool / drills ===');
{
  const db = loadCommon();
  const mixed = createExam(db, 5, 'all', 'drill');
  assertEqual(mixed.items.length, 5, 'Quick 5 returns 5 questions');
  assertEqual(mixed.mode, 'drill', 'drill mode is set');
  const signs = createExam(db, 5, 'traffic_sign');
  assert(signs.items.every((q) => q.category === 'traffic_sign'), 'Signs Drill uses only traffic_sign');
  const signals = createExam(db, 5, 'traffic_signal');
  assert(signals.items.every((q) => q.category === 'traffic_signal'), 'Signals Sprint uses only traffic_signal');
  assertEqual(signals.items.length, 5, 'Signals Sprint can fill 5 from 5 available');
  const empty = createExam({ questions: [] }, 10, 'all');
  assertEqual(empty.items.length, 0, 'empty bank yields no items');
}

console.log('\n=== Unit: spot it and replay ===');
{
  resetStorage();
  const db = loadCommon();
  const els = makeEls();
  const ok = startSpotIt(db, els, () => {}, 4);
  assert(ok, 'Spot It starts when animated questions exist');
  assert(els.progress.textContent.includes('Spot It'), 'Spot It label appears in progress');
  localStorage.setItem('rtobuddy.v5.recentMistakes', JSON.stringify([db.questions.find((q) => q.id)?.id]));
  const replayOk = startReplay(db, els, () => {});
  assert(replayOk, 'Replay starts when recent mistakes exist');
  localStorage.removeItem('rtobuddy.v5.recentMistakes');
  assertEqual(startReplay(db, els, () => {}), false, 'Replay returns false without saved mistakes');
}

console.log('\n=== Unit: quiz answer leak ===');
{
  const db = loadCommon();
  const q = db.questions.find((x) => x.sign_id);
  const hidden = renderExamVisual(db, q, false);
  const shown = renderExamVisual(db, q, true);
  const label = getExamVisualLabel(db, q);
  assert(Boolean(label), 'visual questions have a label');
  assert(!hidden.includes(label), 'sign name is hidden before answer');
  assert(hidden.includes('<img'), 'visual still shows the sign image');
  assert(shown.includes(label), 'sign name is revealed after answer');
  const mq = db.questions.find((x) => x.marking_id);
  if (mq) {
    const mHidden = renderExamVisual(db, mq, false);
    const mLabel = getExamVisualLabel(db, mq);
    assert(!mHidden.includes(mLabel), 'marking name is hidden before answer');
  }
  const sq = db.questions.find((x) => x.signal_id && !x.animation);
  if (sq) {
    const sHidden = renderExamVisual(db, sq, false);
    const sLabel = getExamVisualLabel(db, sq);
    assert(!sHidden.includes(sLabel), 'signal name is hidden before answer');
  }
}

console.log('\n=== Unit: streak (activity, not app open) ===');
{
  resetStorage();
  assertEqual(getStreak(), 0, 'streak starts at 0');
  const n = recordLearningActivity();
  assertEqual(n, 1, 'first activity starts streak at 1');
  assertEqual(getStreak(), 1, 'getStreak reads stored count');
  assertEqual(recordLearningActivity(), 1, 'second activity same local day does not increment');
  const yesterday = localYesterdayKey();
  localStorage.setItem('rtobuddy.v5.streak', JSON.stringify({ lastDate: yesterday, count: 4 }));
  assertEqual(recordLearningActivity(), 5, 'activity after yesterday continues streak');
  const badge = { innerHTML: '' };
  renderStreak(badge);
  assert(badge.innerHTML.includes('5 day'), 'streak badge renders after activity');
}

console.log('\n=== Unit: automatic daily mission ===');
{
  resetStorage();
  let m = getMissionProgress();
  assertEqual(m.signs, false, 'signs mission starts incomplete');
  assertEqual(m.exam10, false, 'exam mission starts incomplete');
  assertEqual(m.stateRule, false, 'state mission starts incomplete');
  ['A', 'B', 'C', 'D', 'E'].forEach(trackSignView);
  m = getMissionProgress();
  assertEqual(m.signs, true, '5 unique sign views complete signs mission');
  assertEqual(m.signsCount, 5, 'sign count is 5');
  trackSignView('A');
  assertEqual(getMissionProgress().signsCount, 5, 'duplicate sign views are not counted twice');
  trackExamComplete(5);
  assertEqual(getMissionProgress().exam10, false, '5-question drill does not complete 10Q mission');
  trackExamComplete(10);
  assertEqual(getMissionProgress().exam10, true, '10-question test completes exam mission');
  trackStateRuleView();
  assertEqual(getMissionProgress().stateRule, true, 'state browse completes state mission');
}

console.log('\n=== Unit: theme picker ===');
{
  resetStorage();
  initTheme();
  assertEqual(currentTheme(), 'balanced', 'default theme is balanced');
  setTheme('hardcore');
  assertEqual(currentTheme(), 'hardcore', 'setTheme persists hardcore');
  setTheme('nope');
  assertEqual(document.documentElement.getAttribute('data-theme'), 'balanced', 'invalid theme falls back to balanced');
  assertEqual(THEMES.length, 3, 'three themes available');
  const box = { innerHTML: '', addEventListener() {} };
  renderThemePicker(box);
  assert(box.innerHTML.includes('data-theme-id="classic"'), 'theme picker renders classic');
}

console.log('\n=== Unit: jurisdiction overlay ===');
{
  const common = loadCommon();
  const tn = loadJson('data/jurisdictions/tn_tamil_nadu.json');
  tn._code = 'TN';
  const db = resolveKnowledge(common, tn);
  assert(db.questions.length === common.questions.length, 'questions pass through resolver');
  assert(db.signs.length === common.signs.length, 'signs pass through resolver');
  assert(getQualityLabel(tn).length > 0, 'quality label is present');
  const national = resolveKnowledge(common, null);
  assert(national.rules.length === common.rules.length, 'null jurisdiction keeps national rules');
}

console.log('\n=== Unit: vehicle age + learning render ===');
{
  const root = { innerHTML: '' };
  checkVehicleAge('abc', root);
  assert(root.innerHTML.includes('valid'), 'invalid year is rejected');
  checkVehicleAge('2020', root);
  assert(root.innerHTML.includes('Approximate vehicle age'), 'valid year shows age');
  const db = loadCommon();
  renderLearning(db, root, '', 'all', 'rules');
  assert(root.innerHTML.includes('rule') || root.innerHTML.includes('<article'), 'learning rules render');
  renderLearning(db, root, 'zzzz-no-match', 'all', 'rules');
  assert(root.innerHTML.includes('No matching'), 'empty search shows empty state');
}

console.log('\n=== Integration: exam answer + reveal + save ===');
{
  resetStorage();
  const db = loadCommon();
  const q = db.questions.find((x) => x.sign_id && Array.isArray(x.options) && x.options.length);
  const exam = createExam({ questions: [q, q] }, 1, 'all', 'exam');
  assertEqual(exam.items.length, 1, 'forced 1-question exam');
  const els = makeEls();
  let hookMeta = null;
  registerCompleteHook((meta) => { hookMeta = meta; });
  renderQuestion(db, els, () => {});
  const label = getExamVisualLabel(db, q);
  assert(!els.visual.innerHTML.includes(label), 'caption hidden on question render');
  assert(els.options.buttons.length === q.options.length, 'all options rendered');
  const wrongIdx = q.answer_index === 0 ? 1 : 0;
  els.options.buttons[wrongIdx].click();
  assert(els.explanation.innerHTML.includes('Why'), 'explanation appears after answer');
  assert(els.visual.innerHTML.includes(label), 'name revealed after answer');
  assert(!els.next.classList.contains('hide'), 'next shown after answer');
}

console.log('\n=== Integration: simulator answer flow ===');
{
  resetStorage();
  const db = loadCommon();
  const q = db.questions.find((x) => Array.isArray(x.options) && x.options.length > 1);
  createExam({ questions: [q] }, 1, 'all', 'simulator');
  const els = makeEls();
  renderQuestion(db, els, () => {});
  els.options.buttons[q.answer_index].click();
  assert(els.explanation.innerHTML.includes('Answer locked'), 'simulator defers detailed review until end');
}

console.log('\n=== Integration: startDrill + mission hook ===');
{
  resetStorage();
  const db = loadCommon();
  const els = makeEls();
  const ok = startDrill(db, els, 5, 'traffic_sign', () => {});
  assert(ok, 'Signs Drill starts');
  assertEqual(els.progress.textContent.includes('Drill'), true, 'progress label says Drill');
}

console.log('\n=== Integration: new home panels render ===');
{
  resetStorage();
  const db = loadCommon();
  const loop = { innerHTML: '' };
  const confidence = { innerHTML: '' };
  const achievements = { innerHTML: '' };
  const plan = { innerHTML: '' };
  renderDailyLoop(loop, db);
  assert(loop.innerHTML.includes('2-minute daily flow'), 'daily loop renders');
  renderConfidenceMap(confidence, db);
  assert(confidence.innerHTML.includes('Traffic signs'), 'confidence map renders categories');
  renderAchievements(achievements);
  assert(achievements.innerHTML.includes('Earn badges') || achievements.innerHTML.includes('First Test'), 'achievements render');
  renderSevenDayPlan(plan);
  assert(plan.innerHTML.includes('Day 1'), '7-day plan renders day labels');
  assert(plan.innerHTML.includes('data-plan-action="simulator"'), '7-day plan includes simulator launch');
}

console.log('\n=== Integration: home panels render ===');
{
  resetStorage();
  const db = loadCommon();
  const mission = { innerHTML: '' };
  const hero = { innerHTML: '' };
  const ready = { innerHTML: '' };
  renderMissionPanel(mission, db, { jurisdiction: { name: 'Tamil Nadu' } });
  assert(mission.innerHTML.includes('Review 5 traffic signs'), 'mission panel lists sign task');
  assert(!mission.innerHTML.includes('data-mission-id'), 'missions are not manual checkboxes');
  renderHeroReadiness(hero, db);
  assert(hero.innerHTML.includes('Keep Practising') || hero.innerHTML.includes('ready'), 'hero readiness renders');
  renderReadiness(ready, db);
  assert(ready.innerHTML.includes('day streak'), 'readiness grid renders');
}

console.log('\n=== Regression: datasets ===');
{
  const schema = loadJson('data/common/quiz_schema.json');
  const questions = loadJson('data/common/mock_questions.json').questions;
  const signs = loadJson('data/common/traffic_signs.json').signs;
  const signals = loadJson('data/common/traffic_signals.json').signals;
  const markings = loadJson('data/common/road_markings.json').markings;
  const rules = loadJson('data/common/rules.json').rules;
  const signIds = new Set(signs.map((s) => s.id));
  const signalIds = new Set(signals.map((s) => s.id));
  const markingIds = new Set(markings.map((m) => m.id));
  const ruleIds = new Set(rules.map((r) => r.id));
  const qIds = new Set();

  assert(questions.length >= 100, `question bank size (${questions.length})`);
  for (const q of questions) {
    assert(!qIds.has(q.id), `unique question id ${q.id}`);
    qIds.add(q.id);
    for (const field of schema.required_fields) {
      assert(q[field] !== undefined && q[field] !== null && q[field] !== '', `${q.id} has ${field}`);
    }
    assert(CATEGORIES.includes(q.category), `${q.id} category is known`);
    assert(Array.isArray(q.options) && q.options.length >= 2, `${q.id} has options`);
    assert(Number.isInteger(q.answer_index) && q.answer_index >= 0 && q.answer_index < q.options.length, `${q.id} answer_index in range`);
    if (q.sign_id) assert(signIds.has(q.sign_id), `${q.id} sign_id ${q.sign_id} exists`);
    if (q.signal_id) assert(signalIds.has(q.signal_id), `${q.id} signal_id exists`);
    if (q.marking_id) assert(markingIds.has(q.marking_id), `${q.id} marking_id exists`);
    for (const rid of q.rule_ids || []) {
      assert(ruleIds.has(rid), `${q.id} rule_id ${rid} exists`);
    }
    if (q.animation) assert(hasAnimation(q.animation), `${q.id} animation ${q.animation} is registered`);
  }

  const byCat = Object.fromEntries(CATEGORIES.map((c) => [c, questions.filter((q) => q.category === c).length]));
  assert(byCat.traffic_signal >= 5, 'at least 5 traffic_signal questions');
  assert(byCat.traffic_sign >= 5, 'enough sign questions for Signs Drill');

  for (const s of signs) {
    if (s.image_asset) {
      assert(existsSync(join(ROOT, 'assets/signs', s.image_asset)), `sign asset exists: ${s.image_asset}`);
    }
  }
}

console.log('\n=== Regression: animations ===');
{
  for (const key of Object.keys(ANIMATIONS)) {
    const html = renderAnimation(key);
    assert(html.includes('<svg'), `animation ${key} returns SVG`);
  }
  assertEqual(renderAnimation('not_a_scene'), '', 'unknown animation returns empty');
}

console.log('\n=== Regression: jurisdictions + UI files ===');
{
  const files = readdirSync(join(ROOT, 'data/jurisdictions')).filter((f) => f.endsWith('.json'));
  const mapped = Object.values(JURISDICTIONS).map((x) => x[0]);
  for (const file of mapped) {
    assert(files.includes(file), `jurisdiction file present: ${file}`);
  }
  assertEqual(mapped.length, 36, '36 State/UT entries');
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  assert(html.includes('value="traffic_signal"'), 'exam selector includes Traffic signals');
  assert(html.includes('Quick 5'), 'Quick 5 tile is in home UI');
  assert(html.includes('Can You Spot It?'), 'Spot It card is in home UI');
  assert(html.includes('Pass in 7 Days'), '7-day plan is in home UI');
  assert(!html.includes('Sources → National Baseline'), 'internal architecture badge removed from home');
  const sw = readFileSync(join(ROOT, 'service-worker.js'), 'utf8');
  assert(sw.includes('datetime.js'), 'service worker precaches datetime.js');
  const jsFiles = ['app.js', 'exam.js', 'tools.js', 'engage.js'];
  for (const f of jsFiles) {
    const src = readFileSync(join(ROOT, 'js', f), 'utf8');
    assert(!src.includes('toISOString()'), `${f} no longer uses UTC toISOString`);
  }
}

const total = passed + failed;
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${total} assertions`);
if (failures.length) {
  console.log('\nFailed checks:');
  failures.forEach((f) => console.log(' - ' + f));
  process.exit(1);
}
console.log('All unit, integration, and regression checks passed.');
