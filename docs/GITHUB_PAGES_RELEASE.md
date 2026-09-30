# GitHub Pages release

SheHungry's web app is a static Next export. GitHub Pages is the frontend host; Supabase remains the only backend for the catalogue, anonymous guest sessions, swipes, favourites, feedback and account deletion. Do not deploy the web app through ChatGPT Sites again.

## One-time repository setup

1. Use the `SheHungry` repository under the `gangarig` GitHub account and push this project to its `main` branch. The expected URL is `https://gangarig.github.io/SheHungry/`.
2. In **Settings → Pages**, set the publishing source to **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions → Variables**, add the existing public values `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. They are public client configuration and must never be replaced by a service-role or secret key.
4. Let the **Deploy SheHungry web** workflow finish, then open the resulting Pages URL and complete the friends-beta smoke test below.

The workflow derives the Pages subpath from the repository name. If the repository name changes, the deployment URL and `EXPO_PUBLIC_WEB_URL` must use that repository name instead.

## First release smoke test

- The deck loads all curated restaurants.
- A new guest can save a restaurant; the Saved count survives refresh.
- Feedback sends once and shows confirmation.
- Data export downloads valid JSON.
- Account deletion requires the explicit `DELETE` confirmation and prevents access with the old session.
- `/privacy/` and `/support/` load correctly from the Pages URL.

## Before enabling CAPTCHA or permanent sign-in

Add the GitHub Pages hostname to the Cloudflare Turnstile widget first. Do not enable Supabase CAPTCHA enforcement until the native challenge flow is implemented and verified. If Google or Apple sign-in is enabled later, add the exact GitHub Pages URL to Supabase Auth redirect URLs before releasing it.
