# MathQuest — Standards / Test Definition (STD)

This STD converts the full set of user stories (US-01..US-44) from `user-stories/userstoriesv1.md` into executable test cases. Each row below is an actionable test case with concise steps, expected result, and priority.

Notes:
 - Base URL: http://localhost:3000 (use `BASE_URL` env in CI).
 - Auth: Supabase Auth (email/password) used in MVP.
 - Canvas-first UI: when problem UI is canvas-driven, tests may accept `canvas` presence or network evidence (Supabase POST) as a signal. Use the helper `startAndNavigateToProblem(page)` to reliably reach problem state.
 - Network assertions: prefer asserting on `coins_delta`, `correct` booleans and HTTP statuses when DOM selectors are unavailable.

| TC ID | User Story | Title | High-level Steps | Expected result | Priority |
|---|---|---|---|---|---|
| TC-01 | US-01 | Child login via parent-created credentials | Navigate to /login → enter child email/password → submit | Logged in; session role = child; redirect to /game; session persists after refresh | High |
| TC-02 | US-02 | Parent registration (email/password) | Register parent → confirm email (if required) → login | Parent account created and can login; role=parent session | High |
| TC-03 | US-03 | Parent creates/manages child accounts | Login as parent → create child (display name + credentials) → view children list | Child created, linked to parent_id, visible in dashboard | High |
| TC-04 | US-01/02 | Role separation & access control | Login as child → request parent-only API / UI | Child receives 403 or redirect; parent-only endpoints inaccessible | High |
| TC-05 | US-04 | Problem presentation in narrative context | Start game → trigger problem card (movement) → locate problem card | Problem card displays flavor_text + stem and styled card UI | Critical |
| TC-06 | US-05 | Type & submit answer | Focus input or canvas → type numeric answer → press Enter / click Submit | Submission sent to server; receives correct boolean; UI transitions accordingly | Critical |
| TC-07 | US-06 | Incorrect answer restates problem (no punishment) | Submit incorrect answer | Problem restated; no health reduction or negative animation; next attempt allowed | High |
| TC-08 | US-05 | Server-side validation & response shape | Submit answer → inspect network response | API returns { correct: boolean, coins_delta: int } ; correct answer not leaked | Critical |
| TC-09 | US-06 | Wrong-answer cooldown & rate limit | Submit 3 wrong answers quickly → attempt another | After 3 wrong: 10s cooldown; server enforces 1 attempt / 3s | Medium |
| TC-10 | US-07 | Coins for correct answers (award rules) | Solve problems under different conditions (fast/normal/after hints) | coins_delta conforms (+30/+10/+7/+4/+1) and UI balance updates; persisted | Critical |
| TC-11 | US-08 | Spend coins in shop & block insufficient balance | Attempt to purchase with insufficient balance | Purchase blocked; balance unchanged; clear message shown | Medium |
| TC-12 | US-09 | Parent sets coin->star threshold | Parent sets threshold → child accumulates coins → star awarded | When threshold hit, star awarded and visible in parent dashboard | Medium |
| TC-13 | US-10 | Parent redeems star | Parent marks star redeemed | Star balance decremented immediately; persisted | Medium |
| TC-14 | US-11 | Streak bonus awarding | Answer correctly in sequence (3,5,10) | 3→+20,5→+40,10→+100 + badge; UI shows streak counter | Medium |
| TC-15 | US-12 | Session record creation & persistence | Start session → perform actions → refresh → resume | Session row has start_ts; refresh restores session state (coins, zone) | High |
| TC-16 | US-13 | Time-limit warnings & hard save | Play to 80% of time limit → reach 100% | Soft warning at 80%; hard save-and-exit at 100%; session persists | High |
| TC-17 | US-14 | Parent sets daily/session limits | Parent updates limits → new session starts | Limits enforced server-side; parent sees summary analytics | Medium |
| TC-18 | US-15 | Zone progression on mastery | Achieve ≥80% correct over 10 problems → verify zone advance | Zone changes and unlock screen appears; progression persisted | Medium |
| TC-19 | US-16 | Zones & themes playable | Play Zones 1–3 and verify themes | Zones 1–3 playable; distinct visuals and trick categories | Medium |
| TC-20 | US-17 | Parent toggles auto-scaling | Parent disables auto-scaling → child performance meets threshold | Zone does NOT auto-advance until parent approves | Medium |
| TC-21 | US-18 | Parent sets difficulty ceiling per zone | Parent sets ceiling → start new problems | System does not serve problems above ceiling; enforcement verified server-side | Medium |
| TC-22 | US-19 | Insight detection awards extra coins | Solve with fast/shortcut pattern → verify insight flag | insight_detected=true triggers 3× base coins (30) and trick journal update | Medium |
| TC-23 | US-20 | Trick discovery animation & journal entry | Discover same trick 3× → check UI | Aha animation plays on 3rd, trick card added to Trick Journal, +75 coins | Medium |
| TC-24 | US-21 | Trick Journal browsing | Open Trick Journal → inspect entries | Journal lists discovered tricks by category; locked tricks hidden or shown as locked | Low-Medium |
| TC-25 | US-22 | Parent views trick discovery log | Parent dashboard → open trick log | Each discovered trick shown with name, category, discovery date | Low-Medium |
| TC-26 | US-23 | Hint system - request hint tiers | On a problem request Hint1/Hint2/Hint3 respecting order & costs | Hint1 free; Hint2 costs 5; Hint3 costs 15; hints never reveal direct answer; hints rate-limited | High |
| TC-27 | US-24 | Boss encounter unlock & phases | Trigger boss unlock conditions → start boss → clear phases | Boss unlocks after required insights; 3 phases gated; rewards distributed per phase | Medium-High |
| TC-28 | US-25 | Boss rewards & parent notification | Clear full boss → inspect rewards and parent notification | Coins and costume fragments awarded once; parent notification logged | Medium |
| TC-29 | US-26 | Parent notified on boss defeat | Parent dashboard & optional email check | Notification present with boss name, zone, date/time, coins earned | Low-Medium |
| TC-30 | US-27 | Child reads uploaded story chapters | Parent uploads approved story → child reads and turns pages via problems | Child sees storybook UI; page-turn math gate enforced server-side; completing chapter awards +50 coins | Low-Medium |
| TC-31 | US-28 | Story page-turning via problem solves | Solve required problems to advance pages | Page turns only after solving required problems per chapter rules | Low-Medium |
| TC-32 | US-29 | Parent uploads story file | Parent uploads .txt/.pdf ≤5000 words | Upload accepted; file stored in private storage; pre-signed URLs created | Low |
| TC-33 | US-30 | Auto-split story into chapters | Parent uploads long text → system splits or parent sets breakpoints | Chapters created and mapped to zones for unlock | Low |
| TC-34 | US-31 | Child reads AI-generated story (post-approval) | Parent requests AI story → approves → child accesses | Child sees approved AI story in storybook UI only after parent approval | Low |
| TC-35 | US-32 | Parent requests AI-generated story | Parent submits prompt and notes → generation occurs server-side | Generated story created with status=pending_approval; API key not exposed to client | Low |
| TC-36 | US-33 | Parent reviews/approves AI story | Parent edits or approves generated story | Approve makes story visible to child; reject discards; audit logged | Low |
| TC-37 | US-34 | Music plays per context (parent-selected) | Parent uploads audio → child plays game in each context | Music plays automatically per context; silence if none; child cannot change volume | Low |
| TC-38 | US-35 | Parent uploads audio files | Parent uploads up to 4 audio files per context, ≤10MB each | Uploads accepted and previewable; invalid formats rejected | Low |
| TC-39 | US-36 | Parent toggles audio and sets default volume | Parent sets default volume / toggles per context | Settings saved and applied to child playback | Low |
| TC-40 | US-37 | Parent analytics - activity & progress | Parent opens dashboard → inspects 7/30-day metrics | Dashboard shows attempts, correct rates, hint usage for 7/30 days scoped per child | Medium |
| TC-41 | US-38 | Analytics surface weakest concepts | Dashboard ranking by hint & error rates | Weak concepts auto-ranked and visible | Medium |
| TC-42 | US-39 | Session & boss logs in analytics | Parent inspects session durations & boss completion log | Session list with durations and Boss Completion Log exist and are accurate | Medium |
| TC-43 | US-40/41 | Difficulty ceiling & auto-scaling controls | Parent sets ceiling / toggles auto-scaling → start session | System respects ceiling; auto-scaling behavior follows setting | Medium |
| TC-44 | US-42 | Parent resets child account data | Parent triggers reset (zone/coins/tricks) with confirmation | Reset applies (after session ends if active); data cleared; event logged | Medium |
| TC-45 | US-43/44 | Mobile/tablet responsiveness | Set viewport to tablet sizes → play through UI flows | UI components render correctly; touch targets usable; no horizontal scroll; parent dashboard usable on tablet | Medium |

### Usage & next steps
- Convert rows into Playwright tests under `tests/mathquest/` (many already scaffolded). Use `setAuthCookie` and `startAndNavigateToProblem` helpers for stability.
- After running tests, populate 'actual result' evidence (screenshots, network captures) into this STD or a results file.
- For deterministic tests requiring exact problem answers, consider a test-only Supabase seed endpoint or a service-role key in a secure CI environment.

If you'd like, I will now (pick one):
1) scaffold missing Playwright specs for high-priority test cases (Critical/High), or
2) run all tests and populate results in this STD, or
3) add a results column template to this file where we can fill pass/fail/evidence.
# MathQuest — Standards / Test Definition (STD)

This STD maps user stories from `user-stories/userstoriesv1.md` into executable test cases. Each row is a test case with concise steps, expected results, priority, and notes.

Notes:
- Environment: frontend at http://localhost:3000. Tests assume Supabase Auth used for authentication and that the game renders a Phaser canvas with overlaid React problem cards.
- Where UI is canvas-first, tests accept either a visible problem card or a game canvas as evidence the game started; network evidence (Supabase REST auth/answer POST) is used as a fallback for answer submission checks.

| TC ID | User Story | Title | Test Steps (high level) | Expected Result / Pass Criteria | Priority | Notes / Edge Cases |
|-------|------------|-------|-------------------------|----------------------------------|----------|-------------------|
| TC-AUTH-01 | US-01 (Child) | Child login via parent-created credentials | 1. Navigate to /login 2. Enter child email & password 3. Submit | User is logged in; session contains role=child; redirect away from /login (e.g., /game) | High | Verify no registration link visible; session persists after refresh |
| TC-AUTH-02 | US-02 / US-03 (Parent) | Parent registration and child creation | 1. Register parent account 2. Login 3. Create child account in dashboard | Parent can create child; child row linked by parent_id; parent sees child in dashboard | High | Use Supabase test project or test-only API keys in CI |
| TC-AUTH-03 | US-01 / US-02 | Role separation & access control | 1. Login as child 2. Attempt to access parent-only dashboard URL | Child receives 403 or is redirected; parent-only endpoints inaccessible | High | Test both API responses and UI-level access |
| TC-CORE-01 | US-04 / US-05 | Problem appears in narrative context & answer input | 1. Start game / ensure canvas present 2. Trigger problem card (movement) 3. Locate problem card and answer input | Problem card displays flavor_text + stem; input accepts numeric answer; Enter or Submit triggers submission | Critical | If no DOM input, fallback to keyboard typing into focused canvas and wait for Supabase POST response |
| TC-CORE-02 | US-06 | Incorrect answer restates problem (no punishment) | 1. Submit an incorrect answer 2. Observe UI and health | Problem is restated; no health reduction; no negative animation; next attempt allowed | High | After 3 wrong answers enforce 10s cooldown (see TC-CORE-04) |
| TC-CORE-03 | US-05 | Answer submission is server-validated | 1. Submit answer 2. Inspect network response to answer POST | Server returns correct: true/false and coins_delta; correct answer never leaked in responses | Critical | Test also inspects that client does not expose correct answer in DOM or JS memory |
| TC-CORE-04 | US-06 (rate limits & cooldown) | Wrong-answer cooldown and rate limiting | 1. Submit wrong answer 3 times rapidly 2. Attempt immediate 4th submission | After 3 wrong attempts: server rejects attempts for 10s; server enforces 1 attempt per 3s rate limit | Medium | Validate server error codes and that client UI indicates cooldown where applicable |
| TC-ECON-01 | US-07 / US-08 | Coin awarding on correct answers | 1. Submit correct answer (first attempt) 2. Observe coin delta and balance | Coin delta matches rule (fast/normal/after-hints) and balance updates in UI and persisted server-side | Critical | Use deterministic problem where correct answer is known to verifier (server-only knowledge). Use network 'coins_delta' to assert values if UI is ambiguous |
| TC-ECON-02 | US-08 | Shop spending blocks insufficient balance | 1. Attempt to buy item costing > balance | Purchase blocked; balance unchanged; clear message shown | Medium | Verify server-side validation as well as UI message |
| TC-STREAK-01 | US-11 | Streak bonuses awarded correctly | 1. Answer correctly in sequence (3,5,10) 2. Observe bonus coins awarded and badge at 10 | 3 => +20, 5 => +40, 10 => +100 + badge; streak UI updates real-time | Medium | Using automated answers: rely on network 'coins_delta' events to assert precise amounts |
| TC-SESSION-01 | US-12 / US-13 | Session persistence & time limit warnings | 1. Start session and perform actions 2. Refresh page mid-session 3. Advance to 80% of daily/session time | Session row exists; refresh restores state (coins, zone); 80% shows soft warning; 100% triggers hard save-and-exit | High | Time can be simulated via test-only endpoint or mocking server clock in integration tests |
| TC-SEC-01 | Security / Edge | Correct answer not leaked in API or client | 1. Intercept API responses and inspect client-side variables after problem load | No response or window/global stores include the correct answer; API returns boolean only | Critical | Use test tools to inspect network and page.evaluate to scan for unexpected fields |

## How to use these test cases
- Convert each row into a Playwright spec in `tests/mathquest/` if not already implemented.
- Prefer network-backed assertions (Supabase REST/POSTs) where the canvas UI lacks DOM hooks.
- For flaky canvas interactions: adopt a helper `startAndNavigateToProblem(page)` (already added) that clicks canvas center, simulates movement (arrow keys), and watches for problem card selectors and Supabase POSTs.

## Next steps I can take
1. Convert each STD row into concrete Playwright test files (if you want I'll scaffold tests where missing).
2. Populate the 'actual result' column after running tests and update this STD with pass/fail and evidence (screenshots, network captures).
3. Propose or add a test-only backend endpoint or Supabase test keys to deterministically seed problem state for tests that require specific answers.

---
Generated from `user-stories/userstoriesv1.md` (selected features F01-F05). If you'd like, I can expand the STD to cover all 16 features included in the file.
