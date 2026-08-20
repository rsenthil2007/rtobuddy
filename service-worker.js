const CACHE = 'rtobuddy-v8.5';
const CORE = [
  './',
  './assets/icon.svg',
  './css/theme-tokens.css',
  './css/theme-balanced.css',
  './css/theme-hardcore.css',
  './css/theme-classic.css',
  './css/app.css',
  './data/common/jurisdiction_overlays.json',
  './data/common/national_baseline.json',
  './index.html',
  './js/app.js',
  './js/data.js',
  './js/exam.js',
  './js/jurisdiction.js',
  './js/learning.js',
  './js/rules.js',
  './js/tools.js',
  './js/theme.js',
  './js/datetime.js',
  './js/animations.js',
  './js/engage.js',
  './manifest.json',
  'assets/signs/TS-I-001.svg',
  'assets/signs/TS-I-002.svg',
  'assets/signs/TS-I-003.svg',
  'assets/signs/TS-I-004.svg',
  'assets/signs/TS-I-005.svg',
  'assets/signs/TS-I-006.svg',
  'assets/signs/TS-I-007.svg',
  'assets/signs/TS-I-008.svg',
  'assets/signs/TS-M-001.svg',
  'assets/signs/TS-M-002.svg',
  'assets/signs/TS-M-003.svg',
  'assets/signs/TS-M-004.svg',
  'assets/signs/TS-M-005.svg',
  'assets/signs/TS-M-006.svg',
  'assets/signs/TS-M-007.svg',
  'assets/signs/TS-M-008.svg',
  'assets/signs/TS-M-009.svg',
  'assets/signs/TS-M-010.svg',
  'assets/signs/TS-W-001.svg',
  'assets/signs/TS-W-002.svg',
  'assets/signs/TS-W-003.svg',
  'assets/signs/TS-W-004.svg',
  'assets/signs/TS-W-005.svg',
  'assets/signs/TS-W-006.svg',
  'assets/signs/TS-W-007.svg',
  'assets/signs/TS-W-008.svg',
  'assets/signs/TS-W-009.svg',
  'assets/signs/TS-W-010.svg',
  'data/common/cross_state_compliance.json',
  'data/common/documents.json',
  'data/common/jurisdiction_overlays.json',
  'data/common/learner_rules.json',
  'data/common/licensing_process.json',
  'data/common/mock_questions.json',
  'data/common/national_baseline.json',
  'data/common/official_services.json',
  'data/common/quiz_schema.json',
  'data/common/road_markings.json',
  'data/common/rules.json',
  'data/common/sources.json',
  'data/common/traffic_signals.json',
  'data/common/traffic_signs.json',
  'data/common/vehicle_classes.json',
  'data/jurisdictions/an_andaman_and_nicobar_islands.json',
  'data/jurisdictions/ap_andhra_pradesh.json',
  'data/jurisdictions/ar_arunachal_pradesh.json',
  'data/jurisdictions/as_assam.json',
  'data/jurisdictions/br_bihar.json',
  'data/jurisdictions/cg_chhattisgarh.json',
  'data/jurisdictions/ch_chandigarh.json',
  'data/jurisdictions/dl_delhi.json',
  'data/jurisdictions/dnhdd_dadra_and_nagar_haveli_and_daman_and_diu.json',
  'data/jurisdictions/ga_goa.json',
  'data/jurisdictions/gj_gujarat.json',
  'data/jurisdictions/hp_himachal_pradesh.json',
  'data/jurisdictions/hr_haryana.json',
  'data/jurisdictions/jh_jharkhand.json',
  'data/jurisdictions/jk_jammu_and_kashmir.json',
  'data/jurisdictions/ka_karnataka.json',
  'data/jurisdictions/kl_kerala.json',
  'data/jurisdictions/la_ladakh.json',
  'data/jurisdictions/ld_lakshadweep.json',
  'data/jurisdictions/mh_maharashtra.json',
  'data/jurisdictions/ml_meghalaya.json',
  'data/jurisdictions/mn_manipur.json',
  'data/jurisdictions/mp_madhya_pradesh.json',
  'data/jurisdictions/mz_mizoram.json',
  'data/jurisdictions/nl_nagaland.json',
  'data/jurisdictions/od_odisha.json',
  'data/jurisdictions/pb_punjab.json',
  'data/jurisdictions/py_puducherry.json',
  'data/jurisdictions/rj_rajasthan.json',
  'data/jurisdictions/sk_sikkim.json',
  'data/jurisdictions/tn_tamil_nadu.json',
  'data/jurisdictions/tr_tripura.json',
  'data/jurisdictions/ts_telangana.json',
  'data/jurisdictions/uk_uttarakhand.json',
  'data/jurisdictions/up_uttar_pradesh.json',
  'data/jurisdictions/wb_west_bengal.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  const isAsset = url.pathname.includes('/assets/') || url.pathname.endsWith('.svg');

  if (isAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((r) => {
        if (r.ok) caches.open(CACHE).then((c) => c.put(event.request, r.clone()));
        return r;
      })),
    );
  } else {
    event.respondWith(
      fetch(event.request).then((r) => {
        if (r.ok) caches.open(CACHE).then((c) => c.put(event.request, r.clone()));
        return r;
      }).catch(() => caches.match(event.request)),
    );
  }
});
