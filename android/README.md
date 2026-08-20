# RTOBuddy Native Android

This folder contains the native Kotlin/Compose implementation scaffold for the full RTOBuddy product. It lives inside the web app repo so web and Android stay in one git push.

## Product goals

- Native Android app, not a web wrapper
- Full feature parity with the web app
- Offline-first behavior
- Online sync/update support when connectivity is available

## Planned modules

- `app`
  - Compose UI
  - Navigation
  - ViewModels
  - Screens: Home, Learn, Exam, Tools
- `data`
  - Room database
  - JSON seed import
  - DataStore preferences
  - Retrofit sync layer
- `domain`
  - exam engine
  - missions
  - streaks
  - confidence map
  - achievements

## Next implementation slices

1. Import bundled offline datasets from the existing web product
2. Add Room entities and DAOs
3. Build real Home / Learn / Exam / Tools screens
4. Port the exam engine:
   - practice
   - simulator
   - challenge
   - replay mistakes
   - Spot It
5. Add state overlays and local source panels
6. Add background sync for online refresh

## Current status

- Gradle multi-module scaffold added
- Compose app shell added
- Offline-first repository interface added
- Home screen product-section placeholders added
- Hilt app setup added
