# MathQuest Software Test Document (STD)

This STD maps user stories to manual test cases. Execution fields are left blank for later population.

| ID | User Story | Title | Preconditions | Steps | Expected Result | Test Data | Priority | Actual Result | Status | Notes/Defects |
|----|------------|-------|---------------|-------|-----------------|-----------|----------|---------------|--------|---------------|
| TC-001 | US-01 | Child login with credentials | Frontend running | 1. Go to /login
2. Enter child email/password
3. Submit | Child authenticated, redirected to /game, session role=child | child credentials | High |  |  |  |
| TC-002 | US-04 | Start game presents problem | Child logged in | 1. Click Start
2. Observe problem card | Problem card displays flavor + stem and input visible |  | High |  |  |  |
| TC-003 | US-05 | Correct answer handling | On a problem | 1. Submit correct answer
2. Observe next problem and coin award | Coins increased per criteria, next problem shown |  | High |  |  |  |
| TC-004 | US-06 | Incorrect answer handling | On a problem | 1. Submit incorrect answer
2. Observe restated problem and no health reduction | Problem restated; cooldown after 3 wrong answers |  | High |  |  |  |
| TC-005 | US-07 | Coin balance persistence | Child logged in | 1. Earn coins
2. Refresh page | Coin balance persisted and visible |  | Medium |  |  |  |
| TC-006 | US-11 | Streak bonuses awarded | Child logged in | 1. Answer consecutively to form streaks (3,5,10) | Streak bonuses awarded per criteria |  | Medium |  |  |  |
| TC-007 | US-12 | Session management and time limits | Child logged in | 1. Play until near limit
2. Observe soft and hard warnings | Soft warning at 80%, hard save/exit at 100% |  | Medium |  |  |  |

> This file is execution-ready: Actual Result, Status and Notes/Defects columns are intentionally blank for later population after automated runs.
