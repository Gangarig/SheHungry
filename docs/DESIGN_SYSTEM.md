# SheHungry — Visual Identity & Design System

## Brand direction
Simple, energetic, food-first, playful without looking childish. The interface should make restaurant photography the visual hero while using a small number of strong accent colors for actions and feedback.

## Logo concept
**SheHungry** wordmark + a minimal bite/swipe mark.

The mark should work as:
- app icon,
- favicon,
- compact header logo,
- social/avatar mark.

Do not build the identity around copied Tinder/Instagram/TikTok symbols. The interaction inspiration is swipe simplicity; SheHungry keeps its own visual identity.

## Color tokens
Use semantic tokens instead of hardcoding colors in components.

### Light theme
- `background`: #FFF9F5 — warm off-white
- `surface`: #FFFFFF
- `text`: #201A17 — near-black warm neutral
- `textMuted`: #756A64
- `primary`: #FF4F64 — energetic coral/red
- `primaryPressed`: #E63F54
- `accent`: #FFB547 — warm appetite/orange accent
- `like`: #20B486 — positive green
- `skip`: #6E6872 — neutral skip
- `border`: #EEE5DF

### Usage rule
Restaurant imagery supplies most visual variety. Strong colors are reserved for brand, interaction feedback, CTAs, and small highlights. Avoid rainbow UI or large competing gradients.

## Typography
Use one clean sans-serif family throughout the MVP. Prefer a cross-platform/system-friendly font strategy so typography does not become an early performance or build dependency.

Roles:
- Display: bold, compact headlines.
- Title: restaurant/card names.
- Body: descriptions/filter text.
- Label: cuisine, distance, metadata.

## Shape
- Cards: large rounded corners.
- Buttons: circular or pill-shaped depending on context.
- Chips: pill-shaped.
- Shadows: subtle; card depth should come primarily from stacking and movement.

## Swipe feedback
- Drag right: progressively reveal LIKE feedback.
- Drag left: progressively reveal SKIP feedback.
- Below threshold: card returns to center.
- Above threshold: card exits naturally with modest rotation/velocity.
- Never make feedback obscure the restaurant photo.

## Motion
Motion should feel responsive rather than decorative.
- Direct 1:1 drag tracking.
- Small rotation based on horizontal displacement.
- Spring snap-back.
- Fast off-screen completion after accepted swipe.
- Next card already visible beneath current card.

## Responsive behavior
The swipe experience is centered and constrained on wide desktop screens instead of stretching the card. On mobile it uses most available width/height. Mouse, trackpad, pointer, and touch should map to the same interaction model.

## Accessibility
- Do not rely only on red/green color to communicate swipe meaning.
- Provide visible/tappable Skip and Like controls as an alternative to gestures.
- Maintain readable contrast.
- Respect reduced-motion preferences where supported.
- Interactive targets must remain comfortably tappable.

## Design principle
The UI should create energy through great food photography, fast motion, and a few strong semantic colors—not through visual clutter.