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