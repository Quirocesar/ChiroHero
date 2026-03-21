# ChiroHero Playtest Builds

## Web Playtest (fastest)

1. Install dependencies:
   - `npm install`
2. Build web bundle:
   - `npm run build:web`
3. Optional PWA package:
   - `npm run build:pwa`
4. Serve `dist/` locally (example):
   - `npx serve dist`

## Android Internal (EAS)

1. Login in Expo account:
   - `npx eas login`
2. Build preview APK:
   - `npm run build:android:preview`
3. Expo dashboard returns the install link/QR for testers.

## iOS Internal (EAS)

1. Login in Expo account:
   - `npx eas login`
2. Build preview:
   - `npm run build:ios:preview`

## Pre-flight checklist

- `npm run quality`
- Verify tutorial -> 3 days -> monthly close flow
- Verify save/load in at least 2 slots
- Verify rescue loan appears when cash goes below threshold
