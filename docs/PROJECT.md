# SheHungry — Product Specification

## Product idea
SheHungry answers one question quickly: **What should I eat nearby?**

The product is a visual restaurant/food discovery experience inspired by the simplicity of swipe and short-form content interfaces, without becoming a social network.

## Core loop
1. Open SheHungry.
2. Allow location access.
3. Choose travel mode/time and lightweight food preferences.
4. See one nearby restaurant/food card at a time.
5. Swipe left to skip or right to like/save.
6. Continue until something looks good.
7. Open the restaurant details/location and go eat.

## MVP principles
- Guest-first: browsing works without signup.
- One primary interaction: left/right swipe.
- Mouse drag and touch swipe use the same behavior.
- Fast, image-first, minimal UI.
- Few screens and few decisions.
- No social feed, comments, creator system, or unnecessary features in V1.

## MVP features
- Guest browsing.
- Location permission.
- Travel mode: walk, cycle, drive.
- Travel-time filter up to 60 minutes.
- Restaurant card with photo, name, cuisine, distance/travel context.
- Swipe left = skip.
- Swipe right = like/save.
- Drag below threshold = snap back.
- Google/Apple authentication only when needed for persistent favourites or after the configured guest swipe limit.
- Favourites list.

## Business model
Users use the discovery product for free. Restaurants are listed normally by default. A later version may let restaurants pay for clearly identified boosted placement. Payments are not part of MVP.

## Later — explicitly outside MVP
- Restaurant boosts and Stripe subscriptions.
- Group mode: friends join with a code, swipe, and see the most-voted restaurant.
- Reservation links.
- Delivery links.
- Call action.
- More immersive vertical food discovery/feed presentation.

## Product constraint
Every feature must support the core job: helping a nearby user decide what to eat with minimal effort.