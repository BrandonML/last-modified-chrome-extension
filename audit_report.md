# Architectural Audit & Documentation Sync Report

## 1. Logic & Hierarchy Audit
Based on the implementation in `content.js` (`window.findTimestamps()`), the exact sequence of reliability for date extraction is as follows:

1. **Schema.org Structured Data (`ld+json`)**: Highest priority, checks for `dateModified` and `datePublished`.
2. **Meta Tags**: Next priority, looks for standard HTML meta tags and Open Graph (OG) tags like `article:modified_time`, `og:updated_time`, `article:published_time`. Includes HTTP-equiv `Last-Modified`.
3. **HTML `<time>` Tags**: Looks for `datetime` attribute or text content, using class names and text to distinguish between modified and published dates.
4. **DOM Classes & Regex Scan**: As a fallback, uses class names like `.post-date`, `.updated` and a regex scan over the body text to find dates.
5. **HTTP Header `Last-Modified`**: Only if a modified timestamp is still missing, it makes a HEAD request to check the `last-modified` header (with a 5-minute threshold from now to avoid false positives).

**Optimizations Identified:**
- To improve finding timestamps on "stubborn" pages that lack standard metadata, we can add a URL pattern extraction step before the full body regex scan. Often blogs and news articles include the publication date in the URL (e.g., `https://example.com/2023/04/15/my-article/`). We can parse `window.location.pathname` for regex `/(20\d{2})\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])/` to find dates.
- To avoid false positives (e.g., parsing system time or other errant strings), we should add a safety check in `findDate()` to ensure that parsed dates are strictly not in the future.

## 2. README Accuracy Check
The "How It Works" section of the `README.md` contains discrepancies with the actual execution flow in `content.js`.

**Discrepancy:**
- The `README.md` claims **Meta Tags** are Priority 1 and **Schema.org Structured Data** is Priority 2.
- The actual code implements **Schema.org Structured Data** as Priority 1 and **Meta Tags** as Priority 2.

**Action Required:**
- Update `README.md` to reorder the "How It Works" list, making Schema.org step 1 and Meta Tags step 2.
- Additionally, `README.md` does not mention the deliberate exclusion of `document.lastModified` and the HTTP `Date` header to avoid the "current system time" fallback bug. This should be explicitly documented.
