# SheHungry

Guest-first restaurant discovery for Vienna, with 24 curated restaurants in Supabase. Web and native apps save confirmed swipes and favourites, collect private feedback, export guest data and offer permanent self-deletion.

The web beta is publicly available at [gangarig.github.io/SheHungry](https://gangarig.github.io/SheHungry/) and deploys automatically from `main` through GitHub Pages. It remains a friends beta, not a public-launch-approved service. See `docs/PRODUCTION_RUNBOOK.md` for verified checks and launch gates.

## Development

Use Node 22.13+ and `npm ci`. Copy `apps/web/.env.example` to `.env.local` and `apps/mobile/.env.example` to `.env` in their respective directories. Supply only a Supabase project URL and publishable key, never a service-role key. Anonymous sign-in is already enabled in the existing SheHungry project.

```sh
npm run web
npm run mobile
```

## Validation

```sh
npm test
npm run typecheck
npm audit --audit-level=moderate
npm run build:web
```

From `apps/mobile`, run `npx expo-doctor` and `npx expo export --platform ios --platform android --output-dir dist`. Live backend checks use `npm run test:backend`; read the runbook before executing because they create and delete isolated test identities.

## Architecture

- `apps/web`: Next static web app, keyboard/touch discovery, optional on-device location sorting, accessible dialogs.
- `apps/mobile`: Expo native app, secure chunked keychain sessions, confirmed persistence and feedback/data tools.
- `supabase/migrations`: five migrations matching remote history, RLS, atomic idempotent saves, per-user quotas, feedback and data export.
- `supabase/functions/delete-account`: authenticated hard deletion of the caller's guest identity and dependent data.
- `.github/workflows/verify.yml`: automated validation on each push and pull request.

The catalogue does not invent ratings, opening hours, travel times or photos. Permanent Google/Apple sign-in, CAPTCHA activation, licensed photos, legal contact details, tested backups/monitoring and device/store distribution remain incomplete. No paid services were purchased.
