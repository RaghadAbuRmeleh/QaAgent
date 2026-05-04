# MathQuest User Stories Analysis

Summary derived from `user-stories/userstoriesv1.md`.

## High-level Goals
- Provide a safe, parent-managed math game for children.
- Deliver engaging gameplay with problem presentation, scoring, streaks, and an in-game economy.
- Parent roles include account creation and child management; Supabase is used for auth and data persistence.

## Key Acceptance Criteria (selected)
- Child and parent accounts: login, role-based access, session persistence.
- Core game loop: problem presentation (flavor text + stem), answer submission, server-side validation, coin awards.
- Coin economy rules (awards based on timing/attempts, daily cap, spend options).
- Streaks, timers, session management and time limits.
- No exposure of correct answers in client or network responses.

## Testable Behaviors
- Login flows for parent/child.
- Game start and problem rendering.
- Correct/incorrect submission handling and coin updates.
- Edge cases for empty input, non-numeric input, rapid submissions.
- Timer warnings and session persistence on refresh.

## Notes
- Backend uses Supabase (auth + REST); network POSTs to Supabase REST are reliable submission signals.
- The game UI is primarily canvas-based; DOM-based selectors are limited for in-game state.


---
