# RTOBuddy (prototype)

Web-based learner-licence and road-safety companion for India. Static HTML/JS — no build step.

## Run locally

Browsers block JSON loading from `file://`. Always serve the folder:

```bat
start.bat
```

Or:

```bash
python -m http.server 8080
```

Then open **http://localhost:8080**

## Features

- Home dashboard with jurisdiction selector (36 States/UTs)
- Learn: road rules, licence journey, documents, learner rules, vehicle classes
- Rules: signs, signals, markings, cross-state compliance
- LLR practice exam with explanations and progress tracking
- Tools: vehicle-age guidance, official service links, accident quick guide

## Android wrap

- PWA manifest + service worker included (`manifest.json`, `service-worker.js`)
- For TWA/Cordova/WebView: load the hosted URL or bundle static files and allow `file`/`https` access to `data/`

## Data model

- National baseline: `data/common/*.json`
- Jurisdiction overlays: `data/jurisdictions/*.json`
- Resolver merges national rules with state/UT overrides in `js/jurisdiction.js`

## Disclaimer

Educational companion only. Verify legal details with official State/UT transport authorities before applying.
