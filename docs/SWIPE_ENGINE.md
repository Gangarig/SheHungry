# SheHungry — Swipe Engine Specification

## Purpose
The swipe deck is the product. It must feel immediate on touch, mouse and trackpad and remain independent from network latency.

## Semantic actions
- LEFT = skip/pass.
- RIGHT = like/save intent.
- Release below threshold = snap back, no decision.
Buttons trigger the same semantic actions as gestures.

## Interaction model
Pointer/finger movement maps directly to horizontal card translation. A small rotation follows horizontal displacement. Feedback becomes progressively visible as the card approaches a decision threshold. On accepted release the card completes its exit quickly; otherwise it springs to center.

Do not copy Tinder branding or visual assets. We borrow the familiar interaction grammar only.

## Deck model
Maintain:
- active card
- next visible card
- small preloaded buffer
- exhausted/loading state

Only the top card accepts gestures. Upcoming cards are inert and visually stacked.

## Decision algorithm
A swipe is accepted when configured displacement and/or velocity criteria are met. Thresholds are centralized constants and tuned on real phone + desktop; never scatter magic numbers through components.

## State machine
READY -> DRAGGING -> COMMITTING_LEFT/COMMITTING_RIGHT -> ADVANCING -> READY.
READY -> DRAGGING -> CANCELLING -> READY.
When buffer is low, discovery refill occurs independently.

## Persistence
Animation commits immediately. Persistence happens asynchronously after semantic decision. Network failure must not block the animation. Failed writes enter a bounded retry/error path.

## Right swipe behavior
For guests, record the decision locally and keep the session fluid. If persistent favourites require authentication, prompt at the product-defined moment and migrate eligible local likes after successful sign-in.

## Duplicate prevention
Candidate selection excludes restaurants already present in the active deck and, where available, previously swiped IDs for the relevant session/user. Reset behavior is an explicit product action, never accidental refetching.

## Performance
- no provider API call per swipe
- preload upcoming images only
- render a small number of cards
- gesture updates should not trigger expensive React tree work
- test low-end/mobile Safari behavior as well as native
- reduced-motion mode receives simpler transitions

## Accessibility
Skip and Like buttons are always available. Labels communicate meaning independent of color. Keyboard equivalents should work on web.

## Tests
- threshold below/above
- high-velocity commit
- cancel/snapback
- left/right callback exactly once
- deck advances exactly once
- duplicate IDs not shown concurrently
- refill does not interrupt gesture
- persistence failure does not restore an already-dismissed card
- button and gesture actions have identical semantics

## Definition of done
A user can continuously swipe a realistic deck on iPhone and desktop without visible loading between normal cards, accidental double decisions, or input-mode differences.