let _renderAnimation = null;
export function registerAnimationRenderer(fn) { _renderAnimation = fn; }

export function renderRules(db,root,query,category){
  if(!db){root.innerHTML='<div class="empty">Content not loaded yet.</div>';return}
  const q=(query||'').trim().toLowerCase();
  const list=(db.rules||[]).filter(r=>{
    const t=[r.title,r.summary,r.category,r.subcategory,r.legal_reference].join(' ').toLowerCase();
    return (!q||t.includes(q))&&(category==='all'||r.category===category);
  });
  root.innerHTML=list.length?list.map(card).join(''):'<div class="empty">No matching road rules.</div>';
}

export function populateCategories(db,select){
  const cats=[...new Set((db?.rules||[]).map(r=>r.category).filter(Boolean))].sort();
  select.innerHTML='<option value="all">All categories</option>'+
    cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
}

export function renderSignals(db,root,query){
  if(!db){root.innerHTML='<div class="empty">Content not loaded yet.</div>';return}
  const q=(query||'').trim().toLowerCase();
  const list=(db.signals||[]).filter(s=>!q||[s.name,s.meaning].join(' ').toLowerCase().includes(q));
  root.innerHTML=list.length?list.map(signal).join(''):'<div class="empty">No traffic signals found.</div>';
}

export function renderSigns(db,root,query){
  if(!db){root.innerHTML='<div class="empty">Content not loaded yet.</div>';return}
  const q=(query||'').trim().toLowerCase();
  const list=(db.signs||[]).filter(s=>!q||[s.name,s.meaning,s.category].join(' ').toLowerCase().includes(q));
  root.innerHTML=list.length?list.map(sign).join(''):'<div class="empty">No signs found.</div>';
}

export function renderMarkings(db,root,query=''){
  if(!db){root.innerHTML='<div class="empty">Content not loaded yet.</div>';return}
  const q=(query||'').trim().toLowerCase();
  const list=(db.markings||[]).filter(m=>!q||[m.name,m.meaning,m.category].join(' ').toLowerCase().includes(q));
  root.innerHTML=list.length?list.map(mark).join(''):'<div class="empty">No road markings found.</div>';
}

function card(r){
  return `<article class="rule">
    <h3>${esc(r.title)} <span class="pill">${esc(r.category||'general')}</span></h3>
    <p>${esc(r.summary)}</p>
    <div class="meta">${esc(r.subcategory||'')} · ${esc(r.legal_reference||'')}</div>
  </article>`;
}

function sign(s){
  const image=s.image_asset
    ? `<div class="sign-image"><img src="assets/signs/${esc(s.image_asset)}" alt="${esc(s.name)}" loading="lazy"></div>`
    : '<div class="sign-image"><div class="sign-placeholder">Sign image unavailable</div></div>';

  return `<article class="sign" data-sign-id="${esc(s.id)}">
    ${image}
    <b>${esc(s.name)}</b>
    <span class="pill">${esc(s.category||'')}</span>
    <div class="small">${esc(s.meaning)}</div>
  </article>`;
}

function signal(s){
  const active=signalState(s);
  const lamp=(color,on,flash)=>`<span class="lamp ${color}${on?' on':''}${flash?' flash':''}"></span>`;
  return `<article class="signal">
    <div class="signal-head" aria-hidden="true">
      ${lamp('red',active==='red'||active==='flashing_red',active==='flashing_red')}
      ${lamp('amber',active==='amber'||active==='flashing_amber',active==='flashing_amber')}
      ${lamp('green',active==='green',false)}
    </div>
    <h3>${esc(s.name)} <span class="pill">traffic signal</span></h3>
    <p>${esc(s.meaning)}</p>
    <div class="small">Source: ${esc((s.source_ids||[]).join(', '))}</div>
  </article>`;
}

function signalState(s){
  const state=s.states?.[0]?.state;
  if(state) return state;
  const id=String(s.id||'').toUpperCase();
  if(id==='SIG-001') return 'red';
  if(id==='SIG-002') return 'amber';
  if(id==='SIG-003') return 'green';
  if(id==='SIG-004') return 'flashing_red';
  if(id==='SIG-005') return 'flashing_amber';
  const n=String(s.name||'').toLowerCase();
  if(n.includes('flashing red')) return 'flashing_red';
  if(n.includes('flashing amber')||n.includes('flashing yellow')) return 'flashing_amber';
  if(n==='red') return 'red';
  if(n.includes('amber')||n.includes('yellow')) return 'amber';
  if(n==='green') return 'green';
  return 'red';
}

function mark(m){
  return `<article class="sign">
    <div class="marking-visual">${markingSvg(m)}</div>
    <b>${esc(m.name)}</b>
    <span class="pill">${esc(m.category||'')}</span>
    <div class="small">${esc(m.meaning)}</div>
  </article>`;
}

function markingSvg(m, hideName = false){
  const id=String(m?.id||'').toUpperCase();
  const bg='<rect width="240" height="70" rx="8" fill="#394150"/>';
  const byId={
    'RM-001':'<path d="M120 8v54" stroke="#f7d154" stroke-width="5" stroke-dasharray="12 10"/>',
    'RM-002':'<path d="M120 8v54" stroke="#f7d154" stroke-width="5" stroke-dasharray="14 12"/>',
    'RM-003':'<path d="M120 8v54" stroke="#f7d154" stroke-width="5"/>',
    'RM-004':'<path d="M112 8v54M128 8v54" stroke="#f7d154" stroke-width="4"/>',
    'RM-005':'<path d="M120 8v54" stroke="#fff" stroke-width="4"/>',
    'RM-006':'<path d="M120 8v54" stroke="#fff" stroke-width="4" stroke-dasharray="12 10"/>',
    'RM-007':'<path d="M28 35H212" stroke="#fff" stroke-width="4"/><path d="M28 8v54" stroke="#fff" stroke-width="3"/>',
    'RM-008':'<path d="M18 48H222" stroke="#fff" stroke-width="10"/>',
    'RM-009':'<path d="M18 48H222" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/><polygon points="55,48 70,38 70,58" fill="#fff"/><polygon points="95,48 110,38 110,58" fill="#fff"/><polygon points="135,48 150,38 150,58" fill="#fff"/><polygon points="175,48 190,38 190,58" fill="#fff"/>',
    'RM-010':'<g fill="#fff">'+Array.from({length:8},(_,i)=>`<rect x="${24+i*26}" y="18" width="14" height="34" rx="1"/>`).join('')+'</g>',
    'RM-011':'<path d="M48 52l16-24 16 24M88 52l16-24 16 24M128 52l16-24 16 24M168 52l16-24 16 24" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>',
    'RM-012':'<path d="M120 52V22M120 22l-16 16M120 22l16 16" stroke="#f7d154" stroke-width="6" fill="none" stroke-linecap="round"/>',
    'RM-013':'<path d="M48 35H170M48 35l18-14M48 35l18 14" stroke="#f7d154" stroke-width="6" fill="none" stroke-linecap="round"/>',
    'RM-014':'<path d="M192 35H70M192 35l-18-14M192 35l-18 14" stroke="#f7d154" stroke-width="6" fill="none" stroke-linecap="round"/>',
    'RM-015':'<path d="M120 52V28M120 28l-12 12M120 28l12 12M92 35H148" stroke="#f7d154" stroke-width="5" fill="none" stroke-linecap="round"/>',
    'RM-016':'<path d="M120 52V28M120 28l-12 12M120 28l12 12M148 35H92M148 35l-14-10M148 35l-14 10" stroke="#f7d154" stroke-width="5" fill="none" stroke-linecap="round"/>',
    'RM-017':'<path d="M24 12v46M216 12v46" stroke="#f7d154" stroke-width="5"/>',
    'RM-018':'<path d="M24 12v46" stroke="#f7d154" stroke-width="5"/><path d="M34 18l8 8-8 8M34 36l8 8-8 8" stroke="#f7d154" stroke-width="3" fill="none"/>',
    'RM-019':'<path d="M24 20v34M34 20v34" stroke="#f7d154" stroke-width="4"/>',
    'RM-020':'<rect x="52" y="16" width="136" height="38" fill="none" stroke="#f7d154" stroke-width="4"/><path d="M92 16v38M148 16v38M52 35h136" stroke="#f7d154" stroke-width="3"/>',
    'RM-021':`<rect x="70" y="12" width="100" height="46" fill="url(#hatch-${id})" stroke="#fff" stroke-width="2"/>`,
    'RM-022':'<path d="M78 54L102 16M102 54l24-38M126 54l24-38M150 54l24-38" stroke="#fff" stroke-width="4" fill="none"/>',
    'RM-023':'<rect x="48" y="22" width="144" height="26" rx="4" fill="none" stroke="#fff" stroke-width="3"/><text x="120" y="41" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#fff">BUS</text>',
    'RM-024':'<circle cx="120" cy="28" r="8" fill="none" stroke="#fff" stroke-width="3"/><path d="M108 38c0-8 24-8 24 0v8H108zM112 52h16" stroke="#fff" stroke-width="3" fill="none"/><circle cx="112" cy="52" r="4" fill="#fff"/><circle cx="128" cy="52" r="4" fill="#fff"/>',
    'RM-025':'<rect x="58" y="18" width="52" height="34" fill="none" stroke="#fff" stroke-width="3"/><rect x="130" y="18" width="52" height="34" fill="none" stroke="#fff" stroke-width="3"/><text x="84" y="41" text-anchor="middle" font-family="Arial" font-size="13" font-weight="700" fill="#fff">P</text>'
  };
  const defs=id==='RM-021'?`<defs><pattern id="hatch-${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#fff" stroke-width="2"/></pattern></defs>`:'';
  const inner=byId[id]||markingSvgFallback(m);
  return `<svg viewBox="0 0 240 70" class="mark-svg" role="img" aria-label="${esc(hideName ? 'Road marking' : (m?.name||'Road marking'))}">${defs}${bg}${inner}</svg>`;
}

function markingSvgFallback(m){
  const cat=m?.category||'';
  const n=String(m?.name||'').toLowerCase();
  if(cat==='stop_line') return '<path d="M18 48H222" stroke="#fff" stroke-width="10"/>';
  if(cat==='give_way_line') return '<path d="M18 48H222" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/>';
  if(n.includes('straight')&&n.includes('left')) return byIdPath('RM-015');
  if(n.includes('straight')&&n.includes('right')) return byIdPath('RM-016');
  if(n.includes('left')) return byIdPath('RM-013');
  if(n.includes('right')) return byIdPath('RM-014');
  if(n.includes('straight')) return byIdPath('RM-012');
  if(cat.includes('arrow')) return byIdPath('RM-014');
  if(n.includes('solid')) return '<path d="M120 8v54" stroke="#f7d154" stroke-width="5"/>';
  if(n.includes('broken')||n.includes('dashed')) return '<path d="M120 8v54" stroke="#f7d154" stroke-width="5" stroke-dasharray="14 12"/>';
  if(cat==='pedestrian'&&n.includes('zebra')) return byIdPath('RM-010');
  return '<path d="M120 8v54" stroke="#f7d154" stroke-width="5" stroke-dasharray="14 12"/>';
}

function byIdPath(id){
  const map={
    'RM-010':'<g fill="#fff">'+Array.from({length:8},(_,i)=>`<rect x="${24+i*26}" y="18" width="14" height="34" rx="1"/>`).join('')+'</g>',
    'RM-012':'<path d="M120 52V22M120 22l-16 16M120 22l16 16" stroke="#f7d154" stroke-width="6" fill="none" stroke-linecap="round"/>',
    'RM-013':'<path d="M48 35H170M48 35l18-14M48 35l18 14" stroke="#f7d154" stroke-width="6" fill="none" stroke-linecap="round"/>',
    'RM-014':'<path d="M192 35H70M192 35l-18-14M192 35l-18 14" stroke="#f7d154" stroke-width="6" fill="none" stroke-linecap="round"/>',
    'RM-015':'<path d="M120 52V28M120 28l-12 12M120 28l12 12M92 35H148" stroke="#f7d154" stroke-width="5" fill="none" stroke-linecap="round"/>',
    'RM-016':'<path d="M120 52V28M120 28l-12 12M120 28l12 12M148 35H92M148 35l-14-10M148 35l-14 10" stroke="#f7d154" stroke-width="5" fill="none" stroke-linecap="round"/>'
  };
  return map[id]||'';
}

export function getExamVisualLabel(db, q) {
  if (!q || !db) return '';
  if (q.sign_id) {
    const sign = (db.signs || []).find((s) => s.id === q.sign_id);
    if (sign) return sign.name;
  }
  if (q.marking_id) {
    const marking = (db.markings || []).find((m) => m.id === q.marking_id);
    if (marking) return marking.name;
  }
  if (q.signal_id) {
    const signal = (db.signals || []).find((s) => s.id === q.signal_id);
    if (signal) return signal.name;
  }
  return '';
}

export function renderExamVisual(db, q, reveal = false) {
  if (!q || !db) return '';
  if (q.animation && _renderAnimation) {
    const anim = _renderAnimation(q.animation);
    if (anim) return anim;
  }
  const caption = (name) => reveal ? `<div class="small exam-caption">${esc(name)}</div>` : '';
  if (q.sign_id) {
    const sign = (db.signs || []).find((s) => s.id === q.sign_id);
    if (sign?.image_asset) {
      return `<div class="sign-image exam-sign"><img src="assets/signs/${esc(sign.image_asset)}" alt="Traffic sign" loading="lazy">${caption(sign.name)}</div>`;
    }
  }
  if (q.marking_id) {
    const marking = (db.markings || []).find((m) => m.id === q.marking_id);
    if (marking) {
      return `<div class="marking-visual exam-mark">${markingSvg(marking, !reveal)}${caption(marking.name)}</div>`;
    }
  }
  if (q.signal_id) {
    const signal = (db.signals || []).find((s) => s.id === q.signal_id);
    if (signal) {
      const active = signalState(signal);
      const lamp = (color, on, flash) => `<span class="lamp ${color}${on ? ' on' : ''}${flash ? ' flash' : ''}"></span>`;
      return `<div class="exam-signal"><div class="signal-head">${lamp('red', active === 'red' || active === 'flashing_red', active === 'flashing_red')}${lamp('amber', active === 'amber' || active === 'flashing_amber', active === 'flashing_amber')}${lamp('green', active === 'green', false)}</div>${caption(signal.name)}</div>`;
    }
  }
  return '';
}

export function renderCrossState(db,root,query){
  if(!db){root.innerHTML='<div class="empty">Content not loaded yet.</div>';return}
  const q=(query||'').trim().toLowerCase();
  const list=(db.crossState||[]).filter(x=>!q||[x.topic,x.category,x.baseline,x.state_difference,x.owner_action].join(' ').toLowerCase().includes(q));
  root.innerHTML=list.length?list.map(crossCard).join(''):'<div class="empty">No State/UT difference topics found.</div>';
}
function crossCard(x){
  const status=x.verification_status==='source_verified'?'Source verified':'Requires jurisdiction review';
  return `<article class="cross-card">
    <div class="cross-top"><h3>${esc(x.topic)}</h3><span class="pill">${esc(status)}</span></div>
    <div class="small">${esc(x.category)} · ${esc(x.scope)}</div>
    <p><b>National baseline:</b> ${esc(x.baseline)}</p>
    <p><b>State/UT difference:</b> ${esc(x.state_difference)}</p>
    <p><b>What the owner/rider should do:</b> ${esc(x.owner_action)}</p>
    <div class="small">Sources: ${esc((x.source_ids||[]).join(', '))}</div>
  </article>`;
}

function esc(v){
  return String(v??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[c]));
}
