# ChiroHero Store Submission Checklist

## 1. Product metadata

- App/Game name validated in each store.
- Short description and full description finalized in ES + EN.
- Keywords prepared (ASO/SEO).
- Category/subcategory selected (Simulation/Casual/Management).
- Contact email and support URL configured.

## 2. Legal and compliance

- Privacy policy URL published and accessible.
- Terms of use / EULA reviewed.
- Age rating questionnaire completed (Google Play + App Store + Steam).
- Data collection declaration completed (analytics, crash reports, local storage).
- Third-party asset and audio licenses documented.

## 3. Visual assets

- App icon final (1024x1024 source).
- Feature graphic / promo banner (Google Play).
- Screenshots per device family:
  - Phone portrait
  - Tablet (if supported)
  - Optional desktop captures for Steam
- Short gameplay video trailer ready (15-30s).

## 4. Build quality gates

- `npm run quality` passes.
- `npm run build:pwa` passes.
- Android preview build installs and launches on mid-range device.
- iOS preview build launches on test device.
- Save/load tested in at least 2 slots.
- Tutorial Walmer -> day loop -> monthly close tested end-to-end.

## 5. Performance and UX

- Stable target FPS on mobile (>=55 average).
- No blocking loading states.
- UI touch targets verified on small screens.
- Audio levels balanced (music/SFX/UI).
- No critical mojibake or corrupted strings in runtime.

## 6. Monetization readiness (if enabled)

- Economy balance reviewed for first 30 days.
- Reward loops validated (daily reward/objectives).
- No paywall dead-end in core progression.
- Price points tested in A/B sheet before launch.

## 7. Release operations

- Versioning updated in `app.json`.
- Release notes prepared per store.
- Internal QA sign-off.
- External playtest feedback triaged and fixed.
- Rollout plan:
  - Phase 1: internal (closed)
  - Phase 2: limited countries
  - Phase 3: global

## 8. Post-launch instrumentation

- Telemetry events validated:
  - `day_start`
  - `patient_resolved`
  - `day_end`
  - `rescue_applied`
  - `app_crash`
  - `session_end`
- Crash-free rate dashboard prepared.
- Retention dashboard (D1/D7) prepared.
