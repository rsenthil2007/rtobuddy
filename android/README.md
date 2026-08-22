# RTOBuddy Native Android

Offline-first Kotlin/Compose app with packaged datasets from the web product.

## Included now

- Bundled offline JSON (signs, signals, markings, rules, questions, services, State/UT overlays)
- Bundled SVG traffic signs
- Home: readiness, streak, daily missions, daily rule, jurisdiction, 7-day plan, quick drills
- Learn: signs / signals / markings / rules / state overlays
- Exam: practice, simulator, challenge, replay misses
- Tools: official services + about/sources

## Build

GitHub Actions workflow `.github/workflows/android-debug-apk.yml` builds a debug APK on push.

CI reuses a **stable debug signing key** (cached in GitHub Actions), so new APKs **install over** the previous build without uninstalling — as long as you always install from CI and `versionCode` increases.

If you still see “App not installed”, uninstall once (old random debug signature), then install the latest CI APK; later updates should upgrade normally.
