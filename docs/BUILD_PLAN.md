# SheHungry build plan

The repository has two interfaces: the root Expo app is the native mobile product, while `apps/web` is the standalone Next.js web product. Both will share the restaurant domain contract and Supabase backend, but not their interface code.

Next: connect Supabase guest identity and persistence, then add a server-side Google Places adapter. Provider keys must remain out of the apps.
