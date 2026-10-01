# SheHungry production runbook

Verified 30 September 2026. Status: private friends-beta candidate, not public-launch approved.

## Deployed services

- Web: deploy from the `main` branch through Cloudflare Pages. Keep the preview private until launch gates are complete.
- Supabase: `lagbygpgoscuehulquwi`, EU Central. Anonymous sign-in is enabled; 24 published Vienna restaurants.
- Web: Next 16.3.7. Mobile: Expo 57.0.26 / React Native 0.86.3. Both use React 19.2.3 and Supabase JS 2.117.2.
- Only public project URL/publishable keys belong in client builds. Never use service-role/secret keys.

## Release checks

From repository root on Node 22.13 or later:

```sh
npm ci
npm test
npm run typecheck
npm audit --audit-level=moderate
npm run build:web
cd apps/mobile
npx expo-doctor
npx expo export --platform ios --platform android --output-dir dist
```

All checks above passed locally on 30 September. Audit reported zero vulnerabilities. Native export verifies JavaScript compilation, not installation, signing, or device behavior. The GitHub Actions workflow is prepared locally; do not describe it as active until pushed to a GitHub repository and its run succeeds.

`npm run test:backend` performs live integration checks using the public settings in `apps/mobile/.env`. It creates two temporary guests, checks isolated reads/writes, retry idempotency, quota enforcement, export and deletion, and removes its test guests. It consumes anonymous-auth quota; run deliberately, never in a tight loop or against an unspecified project. This suite passed against the project above.

## Data and security

All five migration filenames match the remote history after SQL comparison. Do not replay the original schema. For future changes, generate a new migration and inspect a linked-project dry run before applying it. Never repair migration history merely to suppress an error.

- RLS separates each guest's swipes, favourites and feedback.
- `record_swipe` writes the event and favourite atomically. A request UUID prevents repeated events on a network retry.
- Database triggers limit swipes to 60/minute and 500/day per user; feedback to 5/day. These do not replace CAPTCHA or IP-level abuse protection.
- `export_my_data` returns only the caller's data.
- `delete-account` validates the bearer token and active session, then deletes that user and related data. Its gateway JWT check is disabled intentionally; authentication is performed inside the function for compatibility with current signing keys. Do not remove those body checks.
- Security advisor anonymous-role notices are expected for guest-first access. Recheck unexpected warnings; no claim of an independent security audit is made.

## Feedback and support

Testers use **Share feedback**; messages are private to their guest and the owner. Read them in Supabase Table Editor → `beta_feedback`. Treat messages as untrusted user content. Do not put guest IDs or message text into public logs/screenshots. The app supports in-app export and deletion; an external support email and manual identity-verification/deletion procedure still need an owner decision.

## Public-launch gates

1. Confirm the actual legal operator, postal address, support/privacy email, lawful basis and retention periods; finish the privacy notice and legal review. Existing privacy/support pages explicitly remain beta drafts. Do not invent contact details or claim GDPR compliance.
2. Activate and verify abuse protection. A managed Turnstile widget exists for the web hostname, but CAPTCHA is **not enabled in Supabase**. Native has no completed challenge flow; switching it on now can block mobile guests. Site key is public; keep the widget secret in service settings only.
3. Choose backup ownership, encrypted storage, retention and a restore drill. Free-plan availability does not establish a tested backup. No off-site backup or recovery drill has yet been completed.
4. Add health monitoring and alert ownership, including auth/signup failures, database errors and quota/billing thresholds. No external monitor is currently active.
5. Complete Chrome/Safari/Firefox, narrow viewport, iPhone and Android install/restart/offline tests. Chrome saving across refresh, modal Escape and feedback were checked. Real devices remain unverified.
6. Review restaurant facts and obtain licensed photographs. Current cards use honest fallback artwork; no restaurant-photo licence is implied. Follow `EDITORIAL.md`.
7. Only after these gates pass, deliberately change the site audience. Owner-private hosting is not a shareable friends link. Invitation-only access can be considered earlier after confirming tester emails and privacy information.

## Mobile distribution

`apps/mobile/eas.json` contains internal Android APK, iOS simulator and production profiles. Original icon artwork is included. IDs `com.gangarig.shehungry` are configured but not registered or store-approved. EAS account authorization is pending; no signed build, TestFlight upload or store submission exists. Do not incur charges. Google/Apple permanent sign-in also remains disabled; web code is gated until providers, redirects and guest-linking behavior are verified.

## Incidents and rollback

Keep the Cloudflare Pages deployment private or roll back to the last known good GitHub commit if a release is broken. Database migrations require a reviewed forward fix or tested restore; reverting the website does not reverse schema changes. For suspected exposure, restrict affected API access, preserve relevant logs securely, investigate scope and follow the owner's applicable notification obligations. Never delete user data as a diagnostic shortcut.
