# SheHungry

SheHungry helps people decide where to eat through fast, local restaurant discovery.

## Project structure

```text
SheHungry/
├── App.tsx                 # Expo mobile experience (iOS and Android)
├── apps/web/               # Standalone Next.js web experience
├── packages/core/          # Shared restaurant model and discovery fixtures
├── supabase/               # Canonical schema migrations and server configuration
└── docs/                   # Product, design, architecture and delivery notes
```

The two applications keep their own interface layers. Shared code is intentionally limited to business concepts, types, discovery rules, and API contracts—rather than forcing a single UI across web and native platforms.

## Run locally

```bash
npm install
npm run mobile       # Expo / iPhone and Android
npm run web          # Next.js at http://localhost:3000
```

Run `npm run check` before a pull request. Never commit `.env` files or service-role keys.

## Backend

Both apps will use the `shehungry` Supabase project (`lagbygpgoscuehulquwi`). The initial database schema is in `supabase/migrations`; it must be applied to the project before persistence is enabled.
