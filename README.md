# SheHungry

Minimal restaurant discovery for Vienna, with 24 curated restaurants in Supabase. Web and native apps give visitors two trial swipes, then require Google or Apple sign-in before any further swipe is recorded.

The web release path is GitHub Pages, with Supabase as the backend. The prepared target is https://gangarig.github.io/shehungry/; it will be available after the repository is pushed, Pages is enabled and the two public Supabase variables are configured. The former ChatGPT Sites deployment is not part of the release path. See `docs/GITHUB_PAGES_RELEASE.md` for setup, `docs/PRODUCTION_RUNBOOK.md` for launch gates, and `docs/PROGRESS.md` for the continuation checkpoint.

## Development

Use Node 22.13+ and `npm ci`. Copy `apps/web/.env.example` to `.env.local` and `apps/mobile/.env.example` to `.env` in their respective directories. Supply only a Supabase project URL and publishable key, never a service-role key. Anonymous sign-in is already enabled in the existing SheHungry project.

```sh
npm run web
npm run mobile
```

## Validation

```sh
npm test
npm run security:check
npm run typecheck
npm audit --audit-level=moderate
npm run build:web
```

From `apps/mobile`, run `npx expo-doctor` and `npx expo export --platform ios --platform android --output-dir dist`. Live backend checks use `npm run test:backend`; read the runbook before executing because they create and delete isolated test identities.

## Architecture

- `apps/web`: Next static web app, keyboard/touch discovery, cuisine filter, optional on-device location sorting, accessible dialogs.
- `apps/mobile`: Expo native app, secure chunked keychain sessions, confirmed persistence and feedback/data tools.
- `supabase/migrations`: five migrations matching remote history, RLS, atomic idempotent saves, per-user quotas, feedback and data export.
- `supabase/functions/delete-account`: authenticated hard deletion of the caller's guest identity and dependent data.
- `scripts/security-checkup.mjs`: repeatable shared-Supabase checkup for both client boundaries, the shared contract, RLS, RPC privileges and deletion controls.
- `.github/workflows/verify.yml`: prepared automated validation; activation requires a GitHub push.

The catalogue does not invent ratings, opening hours, travel times or photos. Google and Apple sign-in code is ready; provider credentials still need to be entered in Supabase as described in `docs/AUTH_SETUP.md`. CAPTCHA activation, licensed photos, legal contact details, tested backups/monitoring and device/store distribution remain incomplete. No paid services were purchased.
