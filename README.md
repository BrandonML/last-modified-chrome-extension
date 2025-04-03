# Last Modified Timestamp

Tired of hunting around for when a webpage was last updated, only to come up empty? This Chrome extension has you covered!

**The Goal:** To surface the last modified timestamp of any webpage, even if it's not explicitly displayed. We dig deep so you don't have to!

**How It Works:** We intelligently scan the webpage, checking various locations where a last modified date might be hiding. Our approach follows a logical sequence, prioritizing the most reliable sources first:

1.  **`<meta name="last-modified" content="...">` tag:** We first look for the most direct indicator.
2.  **Other Meta Timestamps:** We then explore other meta tags that might contain relevant "updated" or "modified" timestamps. This includes looking at [Open Graph (OG)](https://ogp.me/) tags like `og:updated_time` and `og:modified_time`. If we don't find a "modified" timestamp, we'll also search for a "published" timestamp (e.g., `og:published_time`).
3.  **Schema.org Structured Data:** Next up, we analyze any [Schema.org](https://schema.org/) structured data (in JSON-LD or microdata format) embedded in the page. This often contains accurate publication or modification dates.
4.  **HTML Content Patterns and Timestamps:** If the above checks don't yield a result, we start looking at the visible content of the page. We search for HTML5 `<time>` elements and common CSS classes that often indicate dates.
5.  **HTTP `Last-Modified` Header:** As a final fallback, we examine the `Last-Modified` header sent by the web server. While this can sometimes be less precise (reflecting changes to the server configuration rather than the content itself), it can still provide a useful indication.

**In short, we go from the most authoritative sources to the less direct, giving you the best possible estimate of when a page was last changed.**

**To Use:** Simply install the extension. When you're on a webpage and want to know the last modified date, click the extension icon. We'll do the rest!

Let us know if you have any feedback or suggestions!