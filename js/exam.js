import { renderExamVisual, getExamVisualLabel } from './rules.js';
import { confetti, renderSparkline, recordLearningActivity } from './engage.js';
import { localDateTimeISO } from './datetime.js';

const RECENT_MISTAKES_KEY = 'rtobuddy.v5.recentMistakes';
const CATEGORY_LABELS = {
  traffic_sign: 'Traffic signs',
  road_marking: 'Road markings',
  road_rule: 'Road rules',
  traffic_signal: 'Traffic signals',
  learner_and_process: 'Learner & process',
};
const CONSEQUENCE_COPY = {
  traffic_sign: 'On the road: missing a sign can put you into the wrong lane, restricted road, or hazard zone.',
  road_marking: 'On the road: road markings control position, overtaking, and lane discipline even when signs are absent.',
  road_rule: 'On the road: this rule affects both safety and legal compliance during everyday driving.',
  traffic_signal: 'On the road: reading the signal incorrectly can create a direct collision risk at the junction.',
  learner_and_process: 'On the road: these basics help you stay legal, prepared, and exam-ready.',
};

let state = {
  items: [],
  index: 0,
  score: 0,
  answered: false,
  wrong: [],
  category: 'all',
  mode: 'practice',
  label: 'Practice',
};
let _onCompleteHook = null;

export function registerCompleteHook(fn) {
  _onCompleteHook = fn;
}

function formatCategory(v) {
  return CATEGORY_LABELS[v] || String(v || 'general').replace(/_/g, ' ');
}

function modeLabel(mode) {
  return {
    practice: 'Practice',
    simulator: 'Simulator',
    challenge: 'Challenge',
    drill: 'Drill',
    replay: 'Replay',
    spot: 'Spot It',
  }[mode] || 'Practice';
}

function buildState(items, category, mode) {
  return {
    items,
    index: 0,
    score: 0,
    answered: false,
    wrong: [],
    category,
    mode,
    label: modeLabel(mode),
  };
}

export function createExam(db, count, category = 'all', mode = 'practice') {
  const all = db?.questions || [];
  const pool = category === 'all' ? all : all.filter((q) => q.category === category);
  const source = pool.length ? pool : all;
  state = buildState(shuffle(source).slice(0, count), category, mode);
  return state;
}

export function startDrill(db, els, count, category, onComplete, mode = 'drill') {
  const exam = createExam(db, count, category, mode);
  if (!exam.items.length) return false;
  els.setup?.classList.add('hide');
  els.result?.classList.add('hide');
  els.examArea?.classList.remove('hide');
  renderQuestion(db, els, onComplete);
  return true;
}

export function startReplay(db, els, onComplete) {
  const recent = loadRecentMistakes();
  if (!recent.length) return false;
  const items = recent
    .map((id) => (db?.questions || []).find((q) => q.id === id))
    .filter(Boolean);
  if (!items.length) return false;
  state = buildState(items, 'all', 'replay');
  els.setup?.classList.add('hide');
  els.result?.classList.add('hide');
  els.examArea?.classList.remove('hide');
  renderQuestion(db, els, onComplete);
  return true;
}

export function startSpotIt(db, els, onComplete, count = 5) {
  const items = shuffle((db?.questions || []).filter((q) => q.animation)).slice(0, count);
  if (!items.length) return false;
  state = buildState(items, 'all', 'spot');
  els.setup?.classList.add('hide');
  els.result?.classList.add('hide');
  els.examArea?.classList.remove('hide');
  renderQuestion(db, els, onComplete);
  return true;
}

export function renderQuestion(db, els, onComplete) {
  const q = state.items[state.index];
  if (!q) return result(db, els, onComplete);
  state.answered = false;
  const pct = state.items.length ? Math.round((state.index / state.items.length) * 100) : 0;
  els.progress.textContent = `${state.label} ${state.index + 1} of ${state.items.length} · ${formatCategory(q.category)}`;
  if (els.progressBar) els.progressBar.style.width = `${pct}%`;

  const visual = renderExamVisual(db, q, false);
  if (els.visual) {
    if (visual) {
      els.visual.innerHTML = visual;
      els.visual.classList.remove('hide');
    } else {
      els.visual.innerHTML = '';
      els.visual.classList.add('hide');
    }
  }

  const prompt = visual && q.animation ? 'Watch the scenario and answer:'
    : visual && q.sign_id ? 'What does this traffic sign indicate?'
    : visual && q.marking_id ? 'What does this road marking mean?'
    : visual && q.signal_id ? 'What does this traffic signal indicate?'
    : q.question;
  els.question.textContent = prompt;
  els.explanation.innerHTML = '';
  els.next.classList.add('hide');
  els.options.innerHTML = (q.options || []).map((x, i) => `<button class="option" data-index="${i}">${esc(x)}</button>`).join('');
  els.options.querySelectorAll('.option').forEach((b) => b.addEventListener('click', () => answer(db, b, +b.dataset.index, q, els, onComplete)));
}

export function nextQuestion(db, els, onComplete) {
  state.index++;
  renderQuestion(db, els, onComplete);
}

function answer(db, btn, index, q, els, onComplete) {
  if (state.answered) return;
  state.answered = true;
  const bs = [...els.options.querySelectorAll('.option')];
  const correct = index === q.answer_index;
  bs.forEach((b) => { b.disabled = true; });
  if (correct) {
    btn.classList.add('correct');
    state.score++;
  } else {
    btn.classList.add('wrong');
    bs[q.answer_index]?.classList.add('correct');
    state.wrong.push(q);
  }

  const label = getExamVisualLabel(db, q);
  const revealVisual = label ? renderExamVisual(db, q, true) : '';
  if (revealVisual && els.visual) {
    els.visual.innerHTML = revealVisual;
    els.visual.classList.remove('hide');
  }

  if (state.mode === 'simulator') {
    els.explanation.innerHTML = `<div class="notice simulator-note"><b>Answer locked.</b> Detailed review will appear after the simulator ends.</div>`;
  } else {
    let explainHtml = `<div class="notice"><b>Why:</b> ${esc(q.explanation)}`;
    if (label) explainHtml += `<br><b>${esc(label)}</b>`;
    if (!correct) explainHtml += `<br><span class="small">${esc(consequenceMessage(q.category))}</span>`;
    explainHtml += '</div>';
    els.explanation.innerHTML = explainHtml;
  }
  els.next.classList.remove('hide');
}

function result(db, els, onComplete) {
  els.examArea.classList.add('hide');
  els.result.classList.remove('hide');
  if (els.visual) {
    els.visual.innerHTML = '';
    els.visual.classList.add('hide');
  }

  const total = state.items.length;
  const p = total ? Math.round((state.score / total) * 100) : 0;
  const weakCounts = {};
  state.wrong.forEach((q) => {
    weakCounts[q.category] = (weakCounts[q.category] || 0) + 1;
  });
  const weak = Object.keys(weakCounts);
  const weakDetails = computeWeakAreas(state.wrong, total);
  const mistakes = [...new Set(state.wrong.map((q) => q.id))];
  saveRecentMistakes(mistakes);
  save({ score: state.score, total, percent: p, category: state.category, weak, weakDetails, mode: state.mode });

  recordLearningActivity();
  if (_onCompleteHook) _onCompleteHook({ score: state.score, total, percent: p, category: state.category, mode: state.mode });

  const level = readinessLevel(p);
  const reviewHtml = state.mode === 'simulator' && state.wrong.length
    ? `<div class="replay-list">${state.wrong.slice(0, 5).map((q) => `<div class="replay-item"><b>${esc(formatCategory(q.category))}</b><span>${esc(q.explanation)}</span></div>`).join('')}</div>`
    : '';
  const weakHtml = weakDetails.length
    ? `<div class="weak-area-list">${weakDetails.map((w) =>
      `<div class="weak-area-row"><span>${esc(w.label)}: <b>${w.percent}%</b></span><button type="button" class="weak-practice-btn" data-cat="${esc(w.category)}">Practice 5</button></div>`,
    ).join('')}</div>`
    : '';
  const challengeHtml = state.mode === 'challenge'
    ? `<div class="challenge-card"><b>Challenge result</b><span>${esc(buildChallengeText(p, total))}</span><button type="button" id="shareChallenge" class="weak-practice-btn">Share result</button></div>`
    : '';
  const replayBtn = mistakes.length ? `<button id="replayMistakes" class="exam-secondary-btn" type="button">Replay mistakes</button>` : '';

  els.result.innerHTML = `<div class="${p >= 70 ? 'ok' : 'bad'}"><h3>${esc(state.label)} score: ${state.score}/${total} (${p}%)</h3><p>${level.message}</p></div>${state.mode === 'simulator' ? `<div class="notice"><b>Simulator review</b><br>${state.wrong.length ? `You missed ${state.wrong.length} question${state.wrong.length === 1 ? '' : 's'}. Review them below.` : 'Strong run. No mistakes recorded in this simulator.'}</div>${reviewHtml}` : ''}${weakHtml}${challengeHtml}<div class="exam-result-actions">${replayBtn}<button id="retake" class="accent exam-start">${state.mode === 'drill' || state.mode === 'replay' ? 'Try again' : 'Retake test'}</button></div>`;

  els.result.querySelector('#retake')?.addEventListener('click', () => onComplete());
  els.result.querySelector('#replayMistakes')?.addEventListener('click', () => {
    els.result.classList.add('hide');
    startReplay(db, els, onComplete);
  });
  els.result.querySelector('#shareChallenge')?.addEventListener('click', async () => {
    const text = buildChallengeText(p, total);
    try {
      if (navigator.share) await navigator.share({ title: 'RTOBuddy Challenge', text });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    } catch {}
  });
  els.result.querySelectorAll('.weak-practice-btn[data-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      els.result.classList.add('hide');
      startDrill(db, els, 5, btn.dataset.cat, onComplete);
    });
  });

  if (p >= 70) confetti(document.body);
  renderSparkline(document.getElementById('sparkline'));
}

export function readinessLevel(percent) {
  if (percent >= 90) return { label: 'Strong', message: 'Excellent! You are well prepared.' };
  if (percent >= 80) return { label: 'Exam Ready', message: 'Great work — you are exam ready!' };
  if (percent >= 60) return { label: 'Improving', message: 'Good progress. Focus on weak areas and retake.' };
  return { label: 'Keep Practising', message: 'Use Learning and Rules before trying again.' };
}

export function computeWeakAreas(wrong, total) {
  const counts = {};
  wrong.forEach((q) => { counts[q.category] = (counts[q.category] || 0) + 1; });
  return Object.entries(counts)
    .map(([category, missed]) => ({
      category,
      label: formatCategory(category),
      percent: Math.round(((total - missed) / total) * 100),
      missed,
    }))
    .sort((a, b) => a.percent - b.percent);
}

export function getLatestWeakCategory() {
  try {
    const attempts = JSON.parse(localStorage.getItem('rtobuddy.v5.attempts') || '[]');
    const latest = attempts[0];
    if (latest?.weakDetails?.length) return latest.weakDetails[0].category;
    if (latest?.weak?.length) {
      const map = { 'traffic signs': 'traffic_sign', 'road markings': 'road_marking', 'road rules': 'road_rule', 'traffic signals': 'traffic_signal', 'learner & process': 'learner_and_process' };
      return map[latest.weak[0].toLowerCase()] || null;
    }
  } catch {}
  return null;
}

function consequenceMessage(category) {
  return CONSEQUENCE_COPY[category] || CONSEQUENCE_COPY.road_rule;
}

function buildChallengeText(percent, total) {
  return `I scored ${percent}% in the RTOBuddy ${state.label.toLowerCase()} challenge (${total} questions). Can you beat it?`;
}

function saveRecentMistakes(ids) {
  try {
    localStorage.setItem(RECENT_MISTAKES_KEY, JSON.stringify(ids.slice(0, 10)));
  } catch {}
}

function loadRecentMistakes() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_MISTAKES_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(a) {
  try {
    const k = 'rtobuddy.v5.attempts';
    const arr = JSON.parse(localStorage.getItem(k) || '[]');
    arr.unshift({ ...a, at: localDateTimeISO() });
    localStorage.setItem(k, JSON.stringify(arr.slice(0, 20)));
  } catch (err) {
    console.warn('RTOBuddy: could not save attempt', err);
  }
}

function shuffle(a) {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function esc(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
