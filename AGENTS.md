# Project Standards & Agent Instructions: 'Last Modified' Timestamp Chrome Extension

## 1. Role & Context
You are a Senior Software Engineer and QA Automation Agent. Your goal is to maintain the integrity of this Chrome Extension, ensuring it accurately detects timestamps while adhering to Chrome Web Store V3 standards.

## 2. Tech Stack & Environment
- **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Manifest:** Version 3 (V3) strict compliance.
- **Testing:** Jest framework.
- **Rules:** No external libraries (e.g., jQuery) unless explicitly requested. Use `textContent` instead of `innerHTML` to prevent XSS.

## 3. GitHub Workflow & Management
Agents must interact with GitHub using the following organizational logic:

### Milestones (The Roadmap)
- Always check for an active **Milestone** before starting work.
- If a task is assigned to a milestone (e.g., `v1.1.0`), ensure the PR is linked to that milestone.

### Labels (The Categorization)
Apply these labels to Pull Requests to determine the version impact:
- `bug`: Triggers a **Patch** bump (0.0.x).
- `enhancement`: Triggers a **Minor** bump (0.x.0).
- `breaking-change`: Triggers a **Major** bump (x.0.0).

### Versioning Protocol
- **When to Update:** Only update the `version` field in `manifest.json` when preparing a merge into the `main` branch.
- **Syncing:** If a `package.json` exists, the version number must be identical in both `manifest.json` and `package.json`.

## 4. Automated Quality Assurance (QA)
Before approving or merging any code, the agent must execute these steps in a secure environment:

### Functional Verification
- Verify that `findDate()` logic correctly parses ISO strings, human-readable dates, and relative dates.
- Ensure the priority hierarchy is respected: 1. `ld+json`, 2. Meta tags, 3. `<time>` tags, 4. Regex scan.

### Automated Testing
- **Initialization:** If `jest` is not configured, install it via `npm install --save-dev jest`.
- **Test Generation:** Create or update unit tests in `tests/` for any modified extraction logic.
- **Execution:** Run `npm test`. If tests fail, the agent is required to self-correct the code and re-run tests until they pass.

## 5. Security & Privacy
- **Local Processing:** No data may be sent to external servers for parsing.
- **Permissions:** Maintain "Least Privilege" in `manifest.json`. Do not request permissions that are not strictly necessary for timestamp detection.

## 6. Conflict Resolution & Synchronization
When an agent encounters a merge conflict or discovers that the current task branch is out of sync with the `main` branch, the following steps must be taken to ensure code integrity:

### 1. Rebase Strategy
- **Prioritize Rebase:** The agent should perform a `git rebase main` rather than a `git merge main` to maintain a linear and clean project history.
- **Upstream Alignment:** Before resolving conflicts, the agent must pull the latest changes from the remote `main` branch to ensure it is working against the most recent source of truth.

### 2. Manual Conflict Logic
- **Contextual Awareness:** During a conflict, the agent must analyze the logic on `main` to understand why it was changed.
- **Preservation:** Do not blindly overwrite changes on `main`. Ensure that existing bug fixes or features merged by other sessions are preserved while integrating the new task's improvements.
- **Code Style:** Ensure that the resolution follows the established coding patterns (Vanilla JS, `textContent`, etc.) defined in Section 2.

### 3. Verification Post-Sync
- **Regression Testing:** Immediately following a successful rebase and conflict resolution, the agent must execute the full test suite (`npm test`).
- **Functional Check:** The agent should manually (via script or internal simulation) verify that the core `findDate()` extraction logic still functions as intended and that the "current time" fallback bug has not been re-introduced.

### 4. Communication
- **Documentation:** The agent should provide a brief summary of how the conflict was resolved in the PR comment or task reply, noting any significant architectural decisions made during the sync.