# SheHungry — Product Blueprint

## One-line product
**SheHungry helps you answer “What should we eat?” by swiping through nearby restaurants until something feels right.**

The recurring joke behind the product is simple: choosing where to eat together can take longer than eating. SheHungry turns that indecision into a fast, playful decision loop.

## Core experience
Open → location → lightweight preferences → swipe nearby restaurant cards → left skips → right likes/saves → open the restaurant and go.

The swipe is the product, not decoration. Everything else exists to supply good cards or act on the decision.

## MVP
- guest-first discovery; no account wall
- location permission with graceful denial/manual-area fallback when implemented
- responsive restaurant card deck
- touch swipe on phone; click-drag/pointer on web; accessible buttons/keyboard alternative
- left = skip, right = like/save intent
- restaurant photo, name, cuisine/category, useful distance context, rating/price where legitimately available
- small lightweight filters
- favourites with authentication when persistence is needed
- restaurant detail/action screen
- real-device iPhone + responsive web support

## Product principles
1. One obvious action per moment.
2. Food photography is the visual hero.
3. Immediate feedback; network latency never drives gesture animation.
4. Guest first, identity later.
5. Simple enough to explain in one sentence.
6. Provider/API costs are bounded by architecture, not hope.
7. Privacy: do not build unnecessary location history.
8. Familiar swipe interaction, original SheHungry branding.

## Important scope decision
A radius/distance filter is not the same as “15 minutes walking/driving.” True travel-time filtering requires routing/travel-time data. The architecture keeps that capability replaceable; MVP must not label straight-line estimates as real travel time.

## Business model — later
Users remain free. Restaurants may later purchase clearly identified boosted placement. Paid ranking must not silently masquerade as organic discovery. Stripe and restaurant billing are outside MVP.

## Later versions
- restaurant boosts/subscriptions
- group mode: friends/partners join a room, swipe the same candidate pool and reveal shared likes / a winner
- reservation, delivery and call actions
- richer vertical short-form food discovery presentation

## Non-goals for MVP
Social feed, creators, comments, restaurant dashboards, payments, recommendation ML, chat, complex profiles, delivery ordering, group mode.

## MVP definition of success
A person in Vienna can open SheHungry, get relevant nearby cards, swipe continuously without waiting between ordinary cards, save a place and reach the information needed to go eat. The experience works naturally with a finger on iPhone and click-drag on web.

## Source of truth
Detailed decisions live in the focused files in /docs. Keep them small and load only the relevant file(s) during implementation to reduce context/token usage.