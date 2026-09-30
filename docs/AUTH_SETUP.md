# Google and Apple sign-in setup

The apps already call Supabase OAuth for Google and Apple. Enable the providers before release; their client secrets belong in the provider dashboards, never in this repository or a public environment variable.

## Supabase

1. In **Authentication → URL Configuration**, set the production Site URL to `https://gangarig.github.io/shehungry/` and add that exact URL plus `shehungry://auth` to the Redirect URLs list.
2. In **Authentication → Providers**, enable Google and paste its Client ID and Client Secret. Enable Apple and paste its Services ID, Team ID, Key ID, and private key.
3. Keep anonymous sign-in disabled once this version is released. The application signs out any legacy anonymous browser or app session before loading the deck.

## Google Cloud

Create a Web OAuth client. Add `https://gangarig.github.io` as an authorized JavaScript origin, and add the Supabase Google callback URL shown on the Google provider page as an authorized redirect URI. Configure `openid`, email, and profile scopes, plus the consent screen branding.

## Apple Developer

Create a Services ID for the web sign-in and enable Sign in with Apple for the iOS bundle identifier `com.gangarig.shehungry`. Register the Supabase Apple callback URL shown on the provider page as Apple’s Return URL, then create the Sign in with Apple key used in the Supabase provider form.

## Check

On web, complete each button’s consent flow and confirm the third swipe works after returning to the card. On iOS or Android, confirm the same flow returns to `shehungry://auth` and the next swipe is accepted. Do this with separate test accounts so each provider is exercised independently.
