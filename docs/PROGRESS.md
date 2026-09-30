# SheHungry production work — durable checkpoint

Updated 2026-09-30. User authorizes production improvements and deployment, public beta after checks, no purchases; wants friends' feedback. Supabase/Google/GitHub/Expo/Cloudflare accounts available. Legal operator/address is not fully supplied; do not invent it. Sources/ read-only.

- Workspace is a project mirror with no .git. GitHub Pages is now the selected web release path, with Supabase retained as the backend. The prepared repository name is `shehungry`; see `docs/GITHUB_PAGES_RELEASE.md` for the short activation checklist. Do not use the former ChatGPT Sites deployment for release or tester sharing.
- Supabase project: lagbygpgoscuehulquwi, EU Central, 24 restaurant records.
- Anonymous sign-ins enabled and Save clicked in Supabase dashboard on Sep 30. Still needs API verification.
- Partial prior edits: web lib/discovery.ts expects new record_swipe(p_request_id), export_my_data RPC and delete-account Edge Function, but UI/schema not yet updated. Mobile chunked SecureStore adapter added. Nothing newly deployed yet.
- Remote migration versions: 20260929194917 initial_schema, 20260929194922 vienna_manual_catalog, 20260929194929 secure_catalogue_and_guest_access, 20260929195034 add_interaction_foreign_key_indexes. Local names differ; reconcile by verified statement comparison, no replay.
- Resume automation successfully created: continue-shehungry-production-work, every 6 hours. Must preserve/update/pause upon completion. Prior Sep 29 attempt failed; there is only one successful automation.

Next: implement/test idempotency, limits, feedback, self export/delete and client persistence; browser QA; dependency upgrade; configure CAPTCHA if usable; build/deploy exact source with Sites; native bundle/export; legal/editorial/operations runbooks and accurate final blockers. No real-device QA or store signing has been completed. Google/Apple providers remain disabled.

## Sep 30 implementation checkpoint
- Anonymous sign-in API fully verified with real temporary users (both removed).
- Migration production_beta_safety applied as remote version 20260930040108 and local renamed to match. All previous migration SQL compared after comment/whitespace normalization: exact matches, all local filenames reconciled to remote.
- Backend tests passed: 24 public restaurants, no unauthenticated interaction read, two-guest isolation, foreign-owner insert rejection, immutable catalogue, idempotent retry, quota checks on RPC and direct insertion, private feedback, export, deletion and stale-token rejection. Tests remove their own created users.
- delete-account Edge Function version 1 deployed; validates auth.getUser and active session in body, so gateway verify_jwt=false is intentional (supports current signing keys). Hard user delete cascades Auth sessions/refresh tokens/application data; RLS active-session helper denies surviving JWT immediately.
- Web UI implemented (not built/deployed yet): confirmed saves, request UUID retry, native accessible dialogs, feedback, data export/delete, filters, optional Turnstile component and gated Google/Apple providers. Private draft privacy/support pages; legal identity/address still unresolved.
- Mobile equivalent rewritten with confirmed saves, saved-list accessible at end, scrollable modals, secure token chunks, export/delete/feedback. Dependencies being upgraded to Expo57 / RN0.86.3 / React19.2.3 / Next16.3.7. Fresh install in progress; prior node_modules and lockfile preserved under /private/tmp/shehungry-dependency-backup due stale @types resolution.
- 4 unit tests for secure storage passed (large Unicode, failed write rollback, concurrent writes/legacy migration, incomplete tokens).
- The former ChatGPT-hosted Turnstile widget was limited to its retired hostname. CAPTCHA remains off in Supabase because native challenge flow still needs implementation and verification. Add the GitHub Pages hostname before any later CAPTCHA rollout.
- EAS CLI says Not logged in, despite signed-in Expo browser. Need supported browser login or user CLI login. No paid actions taken.

## Deployment completed Sep 30 09:59 UTC
- A previous private web release used ChatGPT Sites; it is superseded by the GitHub Pages release path and must not be shared or updated.
- Source commit c3e49941c6f679a1d286c6a9875ce8a37c152898 pushed to existing Sites repository. Native save/deploy returned succeeded.
- Version appgprj_6abc1de62c9c819190e8b62df541c1e6~appgver_812691998f6c8191b33d3729870123e4; deployment appgdep_6abcdd6a6cac8191a022ccae51a8c754.
- Verified archive /private/tmp/shehungry-verified-release.tar.gz generated through sites workflow script. Checkout /private/tmp/shehungry-site-release.
- Chrome local production app loads all catalogue, Save &flora advanced to Amador and Saved 1. Further refresh/dialog/feedback testing underway.
- Mobile iOS + Android JavaScript/Hermes bundles successfully exported on Expo57; typechecks passed after adapting removed RN absoluteFillObject API.
- Expo doctor 17/18 passed; required TS6 update is now installing. npm audit after Expo upgrade: 13 moderate, 0 high/critical (router decode-uri-component and build-tool uuid). xcode uuid11.1.1 compatible override now installing.
- EAS browser login is at approval screen for account-wide official eas-cli access. User confirmation requested via async question; no answer yet. Do not click Approve until specifically authorized. Current CLI session may expire; restart browser login if needed.
- Cloudflare widget created but not activated. Legal public page remains draft/private. Source has no .git in original mirror; stage checkout carries history. Use Sites workflow with fresh short-lived credential, never store token in files.

## Sep 30 latest verification
- Removed unused Expo Router and related dependencies; native entry now registers the screen directly. iOS and Android Hermes exports both passed (about 2.2 MB each), Expo doctor passed 18/18, root secure-storage tests 4/4, both typechecks and Next production build passed.
- Dependency audit now reports zero vulnerabilities after supported upgrades and a compatible xcode/uuid override.
- Chrome feedback form showed confirmed saved message. Saved 1 persisted after browser refresh; modal Escape/focus checked earlier.
- Original icon/favicon, proposed app IDs, EAS profiles and GitHub CI workflow prepared. CI is not active until GitHub push. No store or signed-device build exists.
- README, release plan, production runbook and editorial workflow rewritten to match actual deployed/verified state. Legal identity/address, CAPTCHA across native/web, monitoring/backups and real-device QA remain public gates.

## Sep 30 10:11 UTC release
- Final beta update deployed successfully: commit 14b282b166eb9773ee36cbffa60732b3edf990e2; version appgprj_6abc1de62c9c819190e8b62df541c1e6~appgver_fbba402f85d08191b8480f6f59a24499; deployment appgdep_6abce03702308191969dd0df77365b23. Owner-private URL unchanged.
- iOS simulator installed Expo Go but initial local connection failed because Expo's simulator-window activation exited. Restarting Metro without --ios to test via the already-open simulator. This is not a passed native runtime check.

## Sep 30 follow-up
- The iPhone 15 Pro simulator successfully loaded the production-connected native discovery screen and its first restaurant. This confirms startup and catalogue loading in Expo Go; a full interaction/restart/offline device matrix still remains.
- Removed the deprecated Supabase JS session `lock` option after Expo Go reported it at runtime. Typechecking and all secure-storage tests passed; iOS and Android exports passed again from the mobile workspace.
- Fresh Supabase advisors show expected anonymous-access notices for the intentionally guest-first tables and two unused foreign-key indexes that should remain until real traffic is analysed. Leaked-password protection is disabled, but password login is not offered; CAPTCHA must remain off until the native challenge flow is implemented and tested.
