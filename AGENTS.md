# Agent Instructions: 'Last Modified' Timestamp Chrome Extension

## Project Overview
This extension scans webpages for published and modified timestamps. It prioritizes reliability by checking JSON-LD, Meta tags, and finally, visual DOM text.

## Tech Stack
- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Manifest Version: V3
- Testing Framework: Jest (to be initialized by the agent)

## Development & Security Standards
- **Vanilla JS Only:** No external libraries (jQuery, etc.) unless requested.
- **Privacy:** All processing must remain local; no external API calls for date parsing.
- **Security:** Avoid `innerHTML`. Use `textContent` to prevent XSS vulnerabilities.
- **Permissions:** Maintain "Least Privilege" in `manifest.json`.

## Quality Assurance & Automated Review Protocol
Jules must perform the following checks for every PR or code change:

### 1. Functional Testing (The "Date Check")
Jules is authorized to create and run a test suite using Jest. It must verify that the `findDate()` logic correctly parses:
- ISO Strings: `2026-03-16T15:00:00Z`
- Human Readable: `March 16, 2026`
- Relative Dates: `2 days ago` (if supported)

### 2. Priority Hierarchy Validation
Ensure the script respects this order of operations:
1. `ld+json` schema (most reliable)
2. `article:modified_time` or `og:updated_time` meta tags
3. `<time>` HTML tags
4. Regex scan of header/body text (fallback)

### 3. Chrome Extension Compliance
- Verify `manifest.json` matches V3 specs.
- Ensure background service workers are non-persistent.

### 4. Self-Correction & Testing
Before approving any change, Jules must:
- Check if `jest` is installed. If not, Jules should run `npm install --save-dev jest`.
- Create or update a `tests/date_extraction.test.js` file to cover any new logic.
- Run `npm test` in its virtual environment.
- If tests fail, Jules must attempt to fix the code and re-run tests until they pass.