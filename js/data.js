const COMMON = {
  rules: 'data/common/rules.json',
  signs: 'data/common/traffic_signs.json',
  signals: 'data/common/traffic_signals.json',
  markings: 'data/common/road_markings.json',
  questions: 'data/common/mock_questions.json',
  licensing: 'data/common/licensing_process.json',
  documents: 'data/common/documents.json',
  learnerRules: 'data/common/learner_rules.json',
  vehicleClasses: 'data/common/vehicle_classes.json',
  services: 'data/common/official_services.json',
  crossState: 'data/common/cross_state_compliance.json',
  jurisdictionOverlays: 'data/common/jurisdiction_overlays.json',
  baseline: 'data/common/national_baseline.json',
  manifest: 'data/metadata/dataset_manifest.json',
  sources: 'data/common/sources.json',
};

export const JURISDICTIONS = {
  AN: ['an_andaman_and_nicobar_islands.json', 'Andaman and Nicobar Islands'],
  AP: ['ap_andhra_pradesh.json', 'Andhra Pradesh'],
  AR: ['ar_arunachal_pradesh.json', 'Arunachal Pradesh'],
  AS: ['as_assam.json', 'Assam'],
  BR: ['br_bihar.json', 'Bihar'],
  CH: ['ch_chandigarh.json', 'Chandigarh'],
  CG: ['cg_chhattisgarh.json', 'Chhattisgarh'],
  DNHDD: ['dnhdd_dadra_and_nagar_haveli_and_daman_and_diu.json', 'Dadra and Nagar Haveli and Daman and Diu'],
  DL: ['dl_delhi.json', 'Delhi'],
  GA: ['ga_goa.json', 'Goa'],
  GJ: ['gj_gujarat.json', 'Gujarat'],
  HR: ['hr_haryana.json', 'Haryana'],
  HP: ['hp_himachal_pradesh.json', 'Himachal Pradesh'],
  JK: ['jk_jammu_and_kashmir.json', 'Jammu and Kashmir'],
  JH: ['jh_jharkhand.json', 'Jharkhand'],
  KA: ['ka_karnataka.json', 'Karnataka'],
  KL: ['kl_kerala.json', 'Kerala'],
  LA: ['la_ladakh.json', 'Ladakh'],
  LD: ['ld_lakshadweep.json', 'Lakshadweep'],
  MP: ['mp_madhya_pradesh.json', 'Madhya Pradesh'],
  MH: ['mh_maharashtra.json', 'Maharashtra'],
  MN: ['mn_manipur.json', 'Manipur'],
  ML: ['ml_meghalaya.json', 'Meghalaya'],
  MZ: ['mz_mizoram.json', 'Mizoram'],
  NL: ['nl_nagaland.json', 'Nagaland'],
  OD: ['od_odisha.json', 'Odisha'],
  PY: ['py_puducherry.json', 'Puducherry'],
  PB: ['pb_punjab.json', 'Punjab'],
  RJ: ['rj_rajasthan.json', 'Rajasthan'],
  SK: ['sk_sikkim.json', 'Sikkim'],
  TN: ['tn_tamil_nadu.json', 'Tamil Nadu'],
  TS: ['ts_telangana.json', 'Telangana'],
  TR: ['tr_tripura.json', 'Tripura'],
  UK: ['uk_uttarakhand.json', 'Uttarakhand'],
  UP: ['up_uttar_pradesh.json', 'Uttar Pradesh'],
  WB: ['wb_west_bengal.json', 'West Bengal'],
};

async function getJson(path) {
  const r = await fetch(path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Failed to load ${path} (${r.status})`);
  return r.json();
}

async function getJsonSafe(path) {
  try {
    return await getJson(path);
  } catch (err) {
    console.warn('RTOBuddy: failed to load', path, err);
    return null;
  }
}

function packCommon(x, failed = []) {
  return {
    rules: x.rules?.rules || [],
    signs: x.signs?.signs || [],
    signals: x.signals?.signals || [],
    markings: x.markings?.markings || [],
    questions: x.questions?.questions || [],
    licensing: x.licensing?.steps || [],
    documents: x.documents?.documents || [],
    learnerRules: x.learnerRules?.rules || [],
    vehicleClasses: x.vehicleClasses?.classes || [],
    services: x.services?.services || [],
    crossState: x.crossState?.items || [],
    jurisdictionOverlays: x.jurisdictionOverlays?.overlays || {},
    baseline: x.baseline || null,
    sources: x.sources || [],
    manifest: x.manifest || {},
    _failed: failed,
  };
}

export async function loadCommon() {
  const keys = Object.keys(COMMON);
  const vals = await Promise.all(keys.map((k) => getJsonSafe(COMMON[k])));
  const x = {};
  const failed = [];
  keys.forEach((k, i) => {
    if (vals[i] == null) failed.push(COMMON[k]);
    else x[k] = vals[i];
  });
  const out = packCommon(x, failed);
  const coreMissing = !out.rules.length && !out.questions.length;
  if (coreMissing) {
    const hint = location.protocol === 'file:'
      ? ' Do not open index.html directly — run start.bat or python -m http.server.'
      : '';
    throw new Error(`Core datasets unavailable.${hint}`);
  }
  return out;
}

export async function loadJurisdiction(code, overlays = {}) {
  const [file, name] = JURISDICTIONS[code] || JURISDICTIONS.TN;
  const data = await getJson(`data/jurisdictions/${file}`);
  const extra = overlays[code] || {};
  return {
    ...data,
    _code: code,
    _name: name,
    services: [...(data.services || []), ...(extra.services || [])],
    rules: {
      national_overrides: data.rules?.national_overrides || [],
      state_ut_rules: [...(data.rules?.state_ut_rules || []), ...(extra.state_ut_rules || [])],
      local_rules: data.rules?.local_rules || [],
    },
    dynamic_data: mergeDynamic(data.dynamic_data, extra.dynamic_data),
  };
}

function mergeDynamic(base = {}, extra = {}) {
  const out = { ...base };
  for (const [key, val] of Object.entries(extra || {})) {
    out[key] = [...(base?.[key] || []), ...(val || [])];
  }
  return out;
}
