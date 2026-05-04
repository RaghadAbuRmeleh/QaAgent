MathQuest
User Stories & Acceptance Criteria
By User Type: Child & Parent
Based on PRD v1.1  ·  WADANA AI  ·  CONFIDENTIAL

16 Features
Child Stories
Parent Stories
Edge Cases
PRD Coverage
Defined
Defined
Documented



Reading Guide

👶  Child User Story
Goals and acceptance criteria relevant to the child playing the game.


👨‍👩‍👦  Parent User Story
Goals and acceptance criteria relevant to the parent managing the experience.


⚠  Edge Cases
Unusual or boundary scenarios the team must handle.


📌  Assumptions
Explicitly stated assumptions grounded in the PRD.




F01
Authentication & Account Management


👶  Child User Stories




US-01
As a child, I want to log in using the credentials my parent set up for me so that I can access my personal game progress without managing my own account.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Child can log in with email and password created by the parent.
2
Child session is tagged with role = "child"; child-only endpoints are accessible; parent-only endpoints return 403.
3
Child cannot self-register — no registration page is presented to child users.
4
Child session persists across browser refreshes until explicitly signed out.
5
Child cannot view or change account credentials.


👨‍👩‍👦  Parent User Stories




US-02
As a parent, I want to create my own account with email and password so that I can manage my child's experience securely.


US-03
As a parent, I want to create and manage one or more child accounts linked to my account so that each child has a separate, safe profile.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can register with email and password via Supabase Auth.
2
Parent can create a child account (display name, credentials) from the parent dashboard.
3
Each child account is linked to the parent via parent_id FK; parent can view all their children.
4
Parent can log in and access a session with role = "parent".
5
Parent cannot access another parent's child data (row-level security enforced).
6
No child can register independently — child accounts must be created by a parent.


⚠  Edge Cases
Parent tries to log in with a child's credentials — the session role prevents access to parent features.
Parent creates two children with the same display name — the system should allow it (different IDs) but the dashboard should differentiate them clearly.


📌  Assumptions
Authentication is handled by Supabase Auth (email + password only in MVP).
No social login or SSO is in scope for MVP.




F02
Core Game Loop — Problem Presentation & Answer Submission


👶  Child User Stories




US-04
As a child, I want to see a math problem presented inside a narrative game context (flavor text + stem) so that the problem feels like part of an adventure rather than a worksheet.


US-05
As a child, I want to type and submit my answer so that I can attempt to solve the problem and immediately find out if I am right.


US-06
As a child, I want incorrect answers to restate the problem (not reduce health or shame me) so that I can keep trying without feeling punished.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Each problem displays flavor_text (narrative context) and the problem stem on a styled problem card.
2
An answer input field accepts numeric input; submission is triggered by button click or Enter key.
3
On correct answer: the world event resolves, coins are awarded, and the next event begins.
4
On incorrect answer: the problem is restated with no negative animation, no health reduction, and no public failure message.
5
The correct answer is NEVER present in the DOM, component state, or any client-side variable.
6
After 3 consecutive wrong answers, a 10-second cooldown is applied before the next attempt is accepted.
7
Answer submission is rate-limited to 1 attempt per 3 seconds (server-enforced).
8
Every session ends at a stable state — no mid-problem exits are possible.


👨‍👩‍👦  Parent User Stories




ℹ  This feature applies to the Child user only. No parent-facing interaction is involved in the core problem loop.


⚠  Edge Cases
Child submits an empty answer — the server rejects with a validation error; no attempt is recorded.
Child refreshes the browser mid-problem — session state is restored; the same problem is re-served.
Child inspects network responses — the correct answer field must never appear in any API response.


📌  Assumptions
Answer validation is always server-side. The API returns only correct: true/false and coins_delta.
The game canvas is rendered via Phaser.js inside a React portal; problem cards are React UI overlaid on the canvas.





F03
Coin Economy


👶  Child User Stories




US-07
As a child, I want to earn coins when I answer correctly so that I feel tangibly rewarded for my math effort.


US-08
As a child, I want to spend coins in the in-game shop on cosmetics and upgrades so that I have goals to work toward.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Correct, first attempt, insight detected (fast answer): +30 coins.
2
Correct, first attempt, normal speed: +10 coins.
3
Correct after Hint 1 (free): +7 coins.
4
Correct after Hint 2 (5-coin cost): +4 coins.
5
Correct after Hint 3 (15-coin cost): +1 coin.
6
Coin balance is displayed in the game UI and updates immediately after each problem.
7
Coin balance is persisted server-side in the children table.
8
Daily coin cap is 300 coins — further correct answers yield 0 coins once the cap is hit.
9
Coin balance cannot go below 0 (spending is blocked if balance is insufficient).
10
Available spends: Hint 2 (5 coins), Hint 3 (15 coins), cosmetic skin (100–300 coins), pet companion (400 coins), zone theme swap (150 coins), story chapter early unlock (250 coins), trick card art upgrade (50 coins each).
11
Stars accumulate and never expire; the child can see their star count in the UI.


👨‍👩‍👦  Parent User Stories




US-09
As a parent, I want to set the coin threshold required to earn one star so that I can control what level of achievement earns a real-world reward.


US-10
As a parent, I want to mark a star as redeemed when my child uses it so that the star balance accurately reflects unused rewards.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can set the coin-per-star threshold in the dashboard (default: 500 coins = 1 star).
2
When a child accumulates the threshold amount, a star is automatically awarded and visible on the parent dashboard.
3
Parent can mark a star as "redeemed"; the star balance decrements immediately.
4
Stars accumulate indefinitely and do not expire.
5
No real-money mechanics or third-party integrations are involved.
6
The app never assigns a real-world value to a star — that is the parent's decision.


⚠  Edge Cases
Child hits the 300-coin daily cap mid-session — further correct answers show 0 coin delta; the cap resets at the start of the next day.
Parent lowers the star threshold after a star has already been earned — existing stars are unaffected.
Child tries to purchase an item costing more coins than their balance — the purchase is blocked with a clear message.


📌  Assumptions
Daily coin cap resets at midnight UTC.
Coin balance and star balance are persisted in the children and parent_settings tables respectively.




F04
Streak System


👶  Child User Stories




US-11
As a child, I want to earn bonus coins for answering multiple problems correctly in a row so that sustained focus is visibly more rewarding than sporadic correct answers.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
A streak is defined as consecutive correct answers within a single session.
2
3-problem streak awards +20 bonus coins.
3
5-problem streak awards +40 bonus coins.
4
10-problem streak awards +100 bonus coins + a streak badge.
5
Any incorrect answer resets both the streak count and the bonus milestone counter.
6
Using a hint within a streak resets the bonus milestone counter but does NOT break the streak count.
7
Streak counter is visible in the game UI and updates in real time.
8
Streak bonuses count toward the 300-coin daily cap.


👨‍👩‍👦  Parent User Stories




ℹ  This feature applies to the Child user only.


⚠  Edge Cases
Child uses Hint 1 (free) on problem 3 of a streak — streak count stays at 3 but the bonus milestone counter resets to 0.
Session ends mid-streak — streak does not carry over to the next session.


📌  Assumptions
Streaks are per-session, not cross-session.





F05
Session Management & Time Limits


👶  Child User Stories




US-12
As a child, I want my game progress (coins, zone, tricks) to be saved automatically during and after every session so that I never lose progress due to a browser close or refresh.


US-13
As a child, I want to receive a warning when I am approaching my daily time limit so that I have time to finish my current problem before the session ends.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Session start creates a record in the sessions table with start_ts.
2
Session end closes the record with end_ts and persists final stats (coins earned, problems correct, insight flags).
3
Progress (zone, coin balance, trick discoveries) is fully restored when the child logs back in.
4
A soft warning is displayed at 80% of the daily and per-session time limit.
5
A hard save-and-exit is triggered at 100% of the limit; the child is returned to a stable state.
6
The child cannot override the time limit.
7
Sessions never end mid-problem — the current problem is resolved before the exit is enforced.


👨‍👩‍👦  Parent User Stories




US-14
As a parent, I want to set a daily maximum playtime and a per-session maximum so that I control how long my child plays without needing to supervise in real time.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can set daily_limit_mins (default: 45) and session_limit_mins (default: 30) in the Parent Control Panel.
2
Changes take effect from the next session start.
3
The system enforces both limits server-side — client-side display is for UX only.
4
Parent receives a summary of actual session durations in the analytics dashboard.


⚠  Edge Cases
Child closes the browser without formally ending the session — the session record is closed automatically when a new session is started, or via a server-side timeout.
Parent sets per-session limit lower than remaining daily limit — the shorter limit (per-session) applies.


📌  Assumptions
Session timing is tracked server-side using start_ts and end_ts in the sessions table.




F06
Zone Progression & Auto-Scaling


👶  Child User Stories




US-15
As a child, I want to advance to the next zone when I demonstrate mastery of the current zone so that the game always challenges me at the right level.


US-16
As a child, I want to explore a fantasy world (The Number Wilds) across multiple zones, each with distinct themes and increasing difficulty, so that the game remains engaging over time.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Zones 1, 2, and 3 are fully playable in MVP (Pebble Shore, Echo Caves, Iron Summit).
2
Zone progression is triggered automatically when the child achieves ≥ 80% correct rate over 10 consecutive problems at the current difficulty (when auto-scaling is enabled).
3
Each zone has a distinct visual theme and introduces new trick categories appropriate to the zone.
4
Zone transition is confirmed with a zone-unlock screen and persisted in the children table.
5
The child cannot manually skip a zone.
6
Zones 4 and 5 data model is scaffolded but content is not available in MVP.


👨‍👩‍👦  Parent User Stories




US-17
As a parent, I want to toggle auto-scaling on or off so that I can manually control when my child advances to a harder zone.


US-18
As a parent, I want to set a maximum difficulty ceiling (1–10) per zone so that the system never serves problems harder than I have approved.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Auto-scaling is ON by default; parent can disable it in the Parent Control Panel.
2
When auto-scaling is OFF, zone advancement requires a manual action by the parent in the dashboard.
3
Parent can set difficulty_ceiling (1–10) per zone; the system will not serve problems above this ceiling.
4
Parent can pin difficulty to a specific level for a fixed-difficulty session.
5
Changes to difficulty ceiling take effect at the start of the next problem fetch.


⚠  Edge Cases
Child achieves 80% correct rate but parent has auto-scaling disabled — zone does not advance until parent manually approves.
Parent lowers the difficulty ceiling below the child's current problem difficulty mid-session — the next problem fetched respects the new ceiling.


📌  Assumptions
Auto-scaling uses a rolling window of the last 10 problems at the current difficulty level.





F07
Mathematical Insight System & Trick Discovery


👶  Child User Stories




US-19
As a child, I want the game to detect when I am using a mathematical shortcut (rather than brute force) and reward me more coins so that clever thinking is visibly more powerful than grinding.


US-20
As a child, I want to see a special "Aha moment" animation when I discover a trick for the third time so that the moment of insight feels like a genuine achievement.


US-21
As a child, I want to browse my Trick Journal to revisit all the shortcuts I have discovered so that I can reflect on and retain what I have learned.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Insight detection is based on: (1) time-to-answer vs. shortcut_threshold_ms, (2) first-attempt correctness, (3) hint rejection (tertiary signal).
2
When insight_detected = true: child earns 3× base coins (30 coins) instead of 1× (10 coins).
3
When the same trick's insight flag is raised 3× the trick unlock animation plays and the trick card is added to the Trick Journal.
4
Trick unlock awards +75 coins (one-time per trick).
5
The Trick Journal displays all 25 tricks organised by category (A: Pattern Shortcuts, B: Invariants, C: Mental Acceleration, D: Structural Thinking).
6
Locked/undiscovered tricks are hidden or shown as locked — descriptions are not revealed before discovery.
7
The insight multiplier degrades if the same trick is applied to repetitive identical problems — the system requires novel trick applications.
8
Shortcut paths are never included in API responses to the child.


👨‍👩‍👦  Parent User Stories




US-22
As a parent, I want to see a log of which tricks my child has discovered so that I can understand the depth of their mathematical insight.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
The Trick Discovery Log in the parent analytics dashboard shows each discovered trick with its name, category, discovery date, and total applications.
2
Undiscovered tricks are listed as "Not yet discovered" in the parent view.


⚠  Edge Cases
Child answers correctly at fast speed due to a lucky guess rather than trick application — the system accepts the inference (this is a known limitation; detection is probabilistic).
Insight threshold is miscalibrated — threshold is stored as a DB parameter and can be updated without redeployment.


📌  Assumptions
Insight detection is heuristic in MVP (time-threshold); a more accurate ML model is a post-MVP enhancement.
All 25 tricks are discoverable in Zones 1–3 in MVP.




F08
3-Tier Hint System


👶  Child User Stories




US-23
As a child, I want to request a hint when I am stuck so that I can get progressively useful guidance without having the answer given to me directly.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Hint 1 is free; does not deduct coins.
2
Hint 2 costs 5 coins; deducted from balance immediately on request.
3
Hint 3 costs 15 coins; deducted from balance immediately on request.
4
Each hint tier provides more guidance but never reveals the direct answer.
5
Hints are rate-limited: max 1 hint request per 5 seconds (server-enforced).
6
A child cannot request Hint 3 without having first requested Hints 1 and 2 on the same problem.
7
Using any hint after Hint 1 resets the streak bonus milestone counter (but not the streak count).
8
Using any hint reduces the coin reward for that problem (see Coin Economy feature).
9
No insight flag is raised on a problem where Hint 3 was used.


👨‍👩‍👦  Parent User Stories




ℹ  This feature applies to the Child user only. Hint costs are set by the PRD and are not configurable by the parent in MVP.


⚠  Edge Cases
Child requests Hint 2 but has fewer than 5 coins — the hint is blocked with a message explaining insufficient coins.
Child requests a hint on the same problem after a correct answer — hint requests are only valid while the problem is unsolved.


📌  Assumptions
Hint text content is curated by the Data/AI intern and stored in the hints JSONB field of each problem record.
Hints reduce the search space but never eliminate it — this is a content design constraint.





F09
Boss Encounters


👶  Child User Stories




US-24
As a child, I want to face a multi-phase boss battle at the end of each zone so that my mastery of the zone's math tricks is tested in a high-stakes, rewarding challenge.


US-25
As a child, I want to receive major rewards (coins, costume fragments, story chapter unlocks) for defeating a boss so that boss victories feel like the biggest achievements in the game.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Each zone boss unlocks after the child has accumulated the required number of insight triggers within that zone.
2
Boss encounters have 3 phases: Phase 1 (recognise and apply the primary trick), Phase 2 (apply under constraint: time pressure, multi-step, or combined trick), Phase 3 (apply in a novel context — true transfer).
3
Phases are gated — Phase 2 cannot start before Phase 1 is cleared.
4
Boss problems are structured so that brute-force solving is prohibitively slow.
5
Boss Phase 1 clear: +60 coins. Phase 2 clear: +100 coins. Full boss clear: +200 coins + costume fragment.
6
Full boss clear also triggers a parent notification event.
7
Boss rewards are non-repeatable — re-clearing a boss does not re-award coins or costume fragments.
8
Story chapter unlocks may also be awarded as boss rewards (per zone configuration).
9
MVP includes bosses for Zones 1 (The Tidal Sentinel), 2 (The Cave Resonator), and 3 (The Granite Colossus).


👨‍👩‍👦  Parent User Stories




US-26
As a parent, I want to receive a notification when my child defeats a boss so that I am informed of major milestones without needing to monitor the session.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
A notification is triggered in the parent dashboard (or via email if configured) when the child completes a full boss encounter.
2
The notification includes the boss name, zone, date/time, and coins earned.
3
Boss completion events are visible in the parent analytics dashboard under the Boss Completion Log.


⚠  Edge Cases
Child closes the browser mid-boss fight — session state is preserved; the child resumes from the start of the current boss phase on next login.
Child attempts the boss before the required insight count is reached — the boss encounter UI is not accessible until the unlock condition is met.


📌  Assumptions
Boss unlock condition (number of required insight triggers per zone) is configurable in the zone design data, not hardcoded.




F10
Story System — Upload & Reading


👶  Child User Stories




US-27
As a child, I want to read story chapters in a storybook UI that my parent has prepared for me so that the game has a personal, narrative dimension beyond the math puzzles.


US-28
As a child, I want to solve math problems to turn each page of a story so that reading time is connected to my math progress.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Child can only access stories with status = "approved"; pending and rejected stories are invisible.
2
Stories are presented in a storybook UI, one page at a time.
3
To advance to the next page, the child must solve 1 problem (Zone 1 chapters) or 2 problems (Zone 2–3 chapters).
4
Problems for the story mini-game are drawn from the zone matching the chapter's unlock zone.
5
The page-turn gate is enforced server-side — the child cannot skip pages or bypass the math gate.
6
Hints are available under the standard 3-tier cost structure during the mini-game.
7
Completing a story chapter awards +50 coins and a story badge.
8
Each story chapter is unlocked by completing the corresponding zone.


👨‍👩‍👦  Parent User Stories




US-29
As a parent, I want to upload a text or PDF story file (up to 5000 words) so that my child can read a personalised story as part of the game.


US-30
As a parent, I want the system to split my story into chapters so that each chapter unlocks progressively as my child advances through zones.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can upload a plain text or PDF file with a maximum of 5000 words.
2
The system auto-splits the file into chapters by paragraph count, or the parent can define custom breakpoints.
3
Each chapter is mapped to a zone unlock event — the chapter becomes readable after the corresponding zone is completed.
4
Uploaded stories are stored in private Supabase Storage; pre-signed URLs expire in 1 hour.
5
Parent can view, replace, or delete uploaded story files from the dashboard.


⚠  Edge Cases
Child reaches the last page of a chapter without completing all required problems — the chapter remains open at the last unlocked page.
Parent uploads a file exceeding 5000 words — upload is rejected with a clear error message.
Parent deletes a story mid-read — the child's progress for that story is preserved but the story becomes unavailable.
📌  Assumptions
Story files are stored in private Supabase Storage buckets with pre-signed URLs (1-hour expiry).




F11
Story System — AI Generation & Approval Workflow


👶  Child User Stories




US-31
As a child, I want to read an AI-generated story that my parent has personalised and approved for me so that the narrative feels relevant to my interests.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Child can only see AI-generated stories after a parent has approved them (status = "approved").
2
The child has no direct interaction with the AI at any point.
3
AI-generated stories appear in the same storybook UI as uploaded stories, with the same page-turn math gate.
4
All AI-generated content is static and fixed once approved — the child cannot modify it.


👨‍👩‍👦  Parent User Stories




US-32
As a parent, I want to request an AI-generated story by providing a style example and optional notes so that I can create a custom story without writing it myself.


US-33
As a parent, I want to review, edit, and approve or reject the AI-generated story before my child can read it so that I maintain full control over the content.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent submits an example story (max 800 words) and optional style notes via the dashboard.
2
The AI generation is triggered server-side only; the Claude API key is never exposed to the client.
3
Generated story is returned with status = "pending_approval" and is not visible to the child.
4
Parent receives a notification when a new AI story is ready for review.
5
Parent can: (a) Approve as-is — story enters the library with status = "approved"; (b) Edit then approve — parent modifies in a text editor, then approves; (c) Reject — story is discarded.
6
Parent can request a maximum of 2 new AI story generations per 7-day rolling window.
7
The Content Approval Queue in the dashboard shows: full story text, style notes used, generation date, and status label (pending / approved / rejected).
8
All AI-generated content is logged with generation timestamp, input parameters, and approval status.


⚠  Edge Cases
Parent has already used 2 generations this week and tries to request a third — the request is blocked with a message showing when the next generation slot is available.
AI-generated story contains content that conflicts with the hardcoded system prompt constraints — the system prompt is designed to prevent this; output is always reviewed by parent before reaching child.


📌  Assumptions
The AI system prompt is hardcoded server-side (stored in an environment variable) and is not editable by parents or children.
Story generation uses Anthropic Claude API (claude-sonnet-4-5), server-side only.




F12
Music System


👶  Child User Stories




US-34
As a child, I want to hear music during gameplay that my parent has selected for me so that the game atmosphere is personalised.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
Music plays automatically in the correct context: menu, victory, ambient (during gameplay), or rest (after 3+ minutes of inactivity).
2
The child cannot change the volume or switch the audio tracks.
3
If no audio file has been uploaded for a context, silence is the default — no error is shown.
4
Audio files are served via pre-signed URLs from Supabase Storage (1-hour expiry).


👨‍👩‍👦  Parent User Stories




US-35
As a parent, I want to upload music files (MP3, M4A, or WAV) and map them to specific game contexts so that my child hears music I have chosen during different moments in the game.


US-36
As a parent, I want to set the default volume and toggle audio on or off per context so that I control the audio experience without technical knowledge.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can upload up to 4 audio files (one per context: menu, victory, ambient, rest) with a maximum of 10MB each.
2
Parent can preview, replace, or delete each audio file per context.
3
Parent can set the default volume (0–100) for all audio.
4
Parent can toggle audio on or off per context independently.
5
Accepted formats: MP3, M4A, WAV only. Invalid formats are rejected with a clear error.
6
No external music streaming APIs are used.
7
Total storage per parent account is capped at 50MB.


⚠  Edge Cases
Parent uploads a file exceeding 10MB — upload is rejected with a clear size-limit error.
Parent uploads an unsupported audio format — upload is rejected with a format error.
Child is inactive for 3+ minutes — the rest audio context plays automatically; resumes ambient on activity.


📌  Assumptions
No streaming is used — files are uploaded to Supabase Storage and served via pre-signed URLs.



F13
Parent Analytics Dashboard


👶  Child User Stories




ℹ  Child User Stories: Not applicable for this feature.


👨‍👩‍👦  Parent User Stories




US-37
As a parent, I want to see a dashboard showing my child's problem attempts, correct rates, and hint usage over the last 7 and 30 days so that I can assess genuine learning progress.


US-38
As a parent, I want the dashboard to surface my child's weakest mathematical concepts so that I can make informed decisions about difficulty and content.


US-39
As a parent, I want to see my child's session duration history and boss completion log so that I have a full picture of their engagement and achievement.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Dashboard displays for the last 7 and 30 days: problems attempted, problems correct, problems hinted, and correct rate per concept/trick category.
2
Weakest concepts are auto-ranked by hint rate and error rate (not raw problem count).
3
Trick Discovery Log lists all discovered tricks with name, category, and discovery date.
4
Session durations are listed per session with date and total time.
5
Boss Completion Log lists completed bosses with zone, date, and coins earned.
6
All analytics data is scoped to the authenticated parent's children; no cross-family data is accessible.
7
Data is presented in a readable, non-technical format suitable for a non-developer parent.


⚠  Edge Cases
Child has no sessions in the last 7 days — dashboard shows empty state with a clear message rather than zeroes.
Multiple children linked to one parent — parent can switch between children's dashboards.


📌  Assumptions
Analytics data is derived from the attempts, sessions, trick_discoveries, and rewards tables.




F14
Difficulty Ceiling & Auto-Scaling Controls


👶  Child User Stories




ℹ  Child User Stories: Not applicable for this feature.


👨‍👩‍👦  Parent User Stories




US-40
As a parent, I want to set a maximum difficulty level (1–10) per zone so that the system never serves problems harder than I have approved for my child.


US-41
As a parent, I want to toggle difficulty auto-scaling on or off so that I decide when my child moves to harder problems versus advancing manually.


✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can set a difficulty ceiling from 1 (basic) to 10 (competition-level) per zone.
2
The system will not serve problems above the ceiling regardless of the child's performance.
3
Parent can pin difficulty to a single level for a fixed-difficulty experience.
4
Auto-scaling is ON by default (advances when ≥ 80% correct over 10 problems at current level).
5
Parent can disable auto-scaling; when disabled, difficulty only changes via manual parent action.
6
Changes take effect from the next problem fetch.


⚠  Edge Cases
Parent sets ceiling to 1 in a zone that has already served difficulty-5 problems — the ceiling applies to future problems only; past attempt data is not affected.


📌  Assumptions
Difficulty is a 1–10 integer scale stored per problem and per child settings.


F15
Child Account Reset


👶  Child User Stories




ℹ  Child User Stories: Not applicable for this feature.


👨‍👩‍👦  Parent User Stories




US-42
As a parent, I want to reset my child's zone progress, coin balance, or trick discovery log so that I can restart their experience if needed.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent can independently reset: (a) zone progress, (b) coin balance, (c) trick discovery log.
2
Each reset action requires a double confirmation (two-step confirm) before executing.
3
Reset actions are destructive and irreversible — this is clearly stated in the confirmation UI.
4
After reset, the corresponding data is zeroed or cleared immediately.
5
Reset events are logged server-side for audit purposes.


⚠  Edge Cases
Child is actively in a session when the parent triggers a reset — the reset applies at the end of the active session to avoid mid-session data corruption.


📌  Assumptions
No undo mechanism exists for reset actions — the double confirmation is the only safeguard.




F16
Mobile-Responsive UI


👶  Child User Stories




US-43
As a child, I want the game to work smoothly on my tablet (iPad or similar) so that I can play comfortably without a desktop computer.



✓  Acceptance Criteria (Child)




#
Acceptance Criteria
1
All game UI components render correctly at tablet viewport width (768px and above).
2
Problem cards, hint buttons, coin counter, streak display, and Trick Journal are all usable on a touch screen.
3
The game canvas (Phaser.js) performs acceptably on iPad-class hardware.
4
Lighthouse performance score is ≥ 85 on mobile.
5
No horizontal scrolling occurs on any game screen at tablet width.
6
Touch targets meet minimum size guidelines (≥ 44×44px).


👨‍👩‍👦  Parent User Stories




US-44
As a parent, I want the Parent Control Panel to be usable on a tablet or desktop browser so that I can manage settings from any device.



✓  Acceptance Criteria (Parent)




#
Acceptance Criteria
1
Parent dashboard is fully functional and readable on desktop browsers and tablet viewports.
2
All upload forms (audio, story) work correctly on tablet browsers.
3
No functionality is locked to a specific device or browser in MVP.


⚠  Edge Cases
Parent accesses the dashboard from a mobile phone (small screen) — the UI should be functional even if not optimised for sub-768px viewports.


📌  Assumptions
Primary device is iPad or equivalent tablet. Desktop is secondary. Native iOS/Android apps are out of scope for MVP.


