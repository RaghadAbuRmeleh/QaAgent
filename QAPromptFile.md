# 🧪 End-to-End QA Workflow Prompt  
## MathQuest Game (User Stories → STD → Automation → Results)

This prompt demonstrates a complete and professional QA workflow using **natural language**, **AI agents**, and **Playwright**, starting strictly from **User Stories** and ending with a stable automated test suite, populated test cases, and a final QA report.

The workflow follows real-world QA best practices:

User Stories → Manual Test Design (STD) → Automation → Execution → Results → Report

---

## 🎯 STEP 1: Read & Analyze User Stories

### Prompt
Read the user stories from the following file:

user-stories/userstoriesv1.md

For each user story:
- Identify the user goal
- Extract acceptance criteria
- Identify all testable behaviors
- Identify in-scope features

### Expected Output
- Summary of all user stories
- Acceptance criteria per user story
- List of features to be tested, including:
  - Gameplay flow
  - Question rendering
  - Answer validation
  - Scoring and coins
  - Timer behavior
  - Lives management
  - Game over and restart
  - UI feedback and validations

### Output File
analysis/mathquest-user-stories-analysis.md

---

## 📝 STEP 2: Write Manual Test Cases (STD – Software Test Document)

### Prompt
Based ONLY on the analyzed user stories and their acceptance criteria:

Create a complete **Software Test Document (STD)** with manual test cases.

Each test case must include:
- Test Case ID
- Related User Story ID
- Test Case Title
- Preconditions
- Step-by-step Execution Steps
- Expected Result
- Test Data
- Priority (High / Medium / Low)

Do NOT include execution results at this stage.

### Test Coverage Must Include

#### Functional Scenarios
- Start game
- Question display
- Correct answer handling
- Incorrect answer handling
- Score calculation
- Lives decrease
- Timer countdown
- Game over
- Restart game

#### Negative Scenarios
- Empty answer submission
- Non-numeric input
- Invalid input formats
- Rapid repeated submissions

#### Edge & Boundary Cases
- Last-second answer submission
- Zero and negative values
- Maximum score or level behavior

#### UI & Validation
- Score visibility
- Lives indicator
- Timer visibility
- Button enable/disable states
- Feedback messages (correct / incorrect)

### Output File (Main QA Artifact)
test-cases/mathquest-test-cases.md

> This file represents **test design only**  
> No execution, no PASS/FAIL, no Actual Results yet.

---

## 🧾 STEP 3: Prepare STD for Execution (No Execution Yet)

### Prompt
Prepare the Software Test Document (STD) for execution.

Update the existing test cases file to include the following additional columns/sections:
- Actual Result (empty)
- Status (empty)
- Notes / Defects (empty)

Do NOT execute any tests.
Do NOT mark PASS or FAIL.

The purpose of this step is to ensure the STD is execution-ready
and can later be populated with results after automated execution.

### Output File
test-cases/mathquest-test-cases.md

---

## ⚙️ STEP 4: Create Automation Scripts

### Prompt
Using the prepared manual test cases (STD):

Generate automated tests using **Playwright (JavaScript)**.

Automation rules:
- Automate only:
  - High-priority
  - Stable
  - Repetitive test cases
- One automated test must map to one manual test case
- Test names must match Test Case IDs
- Use stable selectors:
  - role
  - label
  - data-testid
- Handle dynamic elements (questions, timers, scores) carefully
- Add comments for complex logic (timers, randomness)

### Browser Coverage
- Chromium
- Firefox
- WebKit (Safari)

### Output Folder
tests/mathquest/

---

## 🧪 STEP 5: Execute Automated Tests

### Prompt
Execute all Playwright tests under:

tests/mathquest/

For each automated test:
- Capture execution result (PASS / FAIL)
- Capture failure reason if applicable
- Collect screenshots or logs for failed tests

Map each automated test result to its corresponding
manual Test Case ID.

### Output Files
- Raw execution output:
  test-results/automation-run-output.md
- Screenshots (if any):
  screenshots/

---

## 📝 STEP 6: Populate STD with Execution Results

### Prompt
Using the automated test execution results:

Update the Software Test Document (STD):

For each test case:
- Fill in the Actual Result
- Mark Status (PASS / FAIL)
- Add Notes or defect references if failed

Ensure the STD accurately reflects the real execution
results of the automated test suite.

### Output File
test-cases/mathquest-test-cases.md

> The STD is now a **living document** containing:
> - Test design
> - Execution results
> - Defect references

---

## 📊 STEP 7: Create Final QA Test Report

### Prompt
Create a comprehensive QA test report summarizing all testing activities.

The report must include:
1. Executive Summary
2. Test Scope
3. Test Case Design Summary
4. Automated Test Execution Results
5. Defects Log
6. Test Coverage Analysis
7. Risks & Recommendations

### Output File
test-results/MATHQUEST-test-report.md

---

## 🚀 STEP 8: Commit to Git Repository

### Prompt
Commit all QA artifacts to the Git repository.

Include:
- User story analysis
- Manual test cases (STD with results)
- Automation scripts
- Execution summaries
- Final test report
- Screenshots (if any)

Use a clear folder structure and a descriptive commit message.

### Example Commit Message
feat(qa): add user-story-based QA workflow for MathQuest game

---

## ✅ Final QA Flow

User Stories  
↓  
Manual Test Design (STD)  
↓  
Prepare STD for Execution  
↓  
Automation  
↓  
Automated Execution  
↓  
Populate STD with Results  
↓  
Final QA Report  
↓  
Git Commit