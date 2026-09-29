# SheHungry — Design System

## Personality
Warm, playful, appetizing, fast and modern. Not childish, not a Tinder clone, not a generic delivery app. Food photos carry most of the visual emotion.

## Brand idea
SheHungry turns “I don’t know what I want” into a playful swipe. The visual mark should suggest appetite + choice/motion without copying another app’s iconography.

## Logo direction
Primary: **SheHungry** wordmark with a compact original food/swipe mark. The mark must survive at app-icon/favicon size. Maintain a simple one-color fallback.

The generated concept image in this planning session is visual exploration, not a final trademark/production asset. Final logo should be redrawn as clean vector artwork before release.

## Core palette
- background #FFF9F5 warm cream
- surface #FFFFFF
- text #201A17
- textMuted #756A64
- primary #FF4F64 coral
- primaryPressed #E63F54
- accent #FFB547 warm amber
- like #20B486
- skip #6E6872
- border #EEE5DF

Use semantic tokens; never hardcode brand values in feature components.

## Typography
One clean sans-serif family/system strategy for MVP. Strong compact restaurant titles, highly readable metadata. Avoid adding font dependencies merely for decoration.

## Components
Foundation: AppText, Button, IconButton, Chip, Sheet/Modal, LoadingState, EmptyState.
Discovery: RestaurantCard, SwipeCard, SwipeDeck, SwipeActions, FilterBar, LocationControl.
Restaurant: RestaurantHero, MetadataRow, ActionBar.
Favourites: FavouriteCard/List.

## Card anatomy
Large food image → subtle readable gradient if needed → restaurant name → concise cuisine/metadata → distance/travel info → minimal action affordances. Avoid paragraphs on the swipe card.

## Swipe feedback
Right reveals a clear LIKE/heart treatment; left reveals SKIP/pass. Color is supportive, never the only cue. Under threshold snaps back. Accepted card exits quickly. Next card is already visible.

## Motion
Direct drag, restrained rotation, spring return, quick commit. Motion communicates state rather than decorating the screen. Respect reduced-motion settings.

## Responsive
Mobile: card uses most useful viewport while preserving safe areas/actions.
Desktop: centered constrained phone-like discovery column; do not stretch card across the browser. Pointer drag and buttons behave like touch semantics.

## Accessibility
Readable contrast, large targets, screen-reader labels, button alternatives to gestures, keyboard support on web, reduced motion.

## Visual restraint
No rainbow gradients, excessive glass effects, multiple competing CTAs or dense navigation. The dopamine/energy comes from great food imagery, fast tactile motion and satisfying feedback.

## Initial screens
1. Entry/permission
2. Discover/swipe
3. Filters/location sheet
4. Restaurant detail
5. Favourites
6. Sign-in prompt

Keep bottom navigation minimal or omit it until multiple destinations genuinely need it.