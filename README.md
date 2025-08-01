# Last Modified Timestamp

> <strong>Published in Chrome Web Store</strong>: 4/7/2025.

Tired of hunting around for when a webpage was published or last updated? This Chrome extension has you covered!

**The Goal:** To surface the most reliable **published** and **last modified** timestamps of any webpage, even if they're not explicitly displayed. We dig deep so you don't have to!

## Features

*   **Finds Both Published and Modified Dates:** The extension doesn't just look for when a page was last changed; it also finds the original publication date, giving you a complete picture of the content's timeline.
*   **Intelligent Scanning:** It intelligently scans the webpage, checking meta tags, structured data (JSON-LD), visible content patterns, and even HTTP headers to find the most accurate dates.
*   **Customizable Date/Time Format:** You can choose your preferred date and time format (e.g., YYYY-MM-DD vs. MM/DD/YYYY, 24-hour vs. 12-hour clock) from the options page.
*   **Simple Interface:** Just click the extension icon to get the timestamps. A clear overlay provides the information without being intrusive.

## How It Works

We intelligently scan the webpage for both **published** and **modified** timestamps, checking various locations where a date might be hiding. Our approach follows a logical sequence, prioritizing the most reliable sources first:

1.  **Meta Tags:** We start by looking for direct indicators in the page's meta tags. This includes standard tags like `<meta name="last-modified" ...>` as well as [Open Graph (OG)](https://ogp.me/) tags like `og:updated_time` (for modified) and `og:published_time` (for published).
2.  **Schema.org Structured Data:** Next, we analyze any [Schema.org](https://schema.org/) structured data (in JSON-LD or microdata format) embedded in the page. This often contains accurate `datePublished` and `dateModified` properties.
3.  **HTML Content Patterns:** If the above checks don't yield a result, we start looking at the visible content of the page. We search for HTML5 `<time>` elements and common phrases or CSS classes (like `.post-date` or `.updated`) that often indicate dates.
4.  **HTTP `Last-Modified` Header:** As a final fallback for the *modified* date, we examine the `Last-Modified` header sent by the web server. While this can sometimes be less precise, it can still provide a useful indication.

## Configuration

You can customize the date and time format to match your preference.

1.  **Right-click** on the extension icon in your Chrome toolbar.
2.  Select **"Options"**.
3.  Choose your desired format for the date (e.g., `YYYY-MM-DD`, `DD/MM/YYYY`) and time (24-hour or 12-hour).
4.  Click **"Save"**.

## To Use

Simply install the extension. When you're on a webpage and want to know the timestamps, just **click the extension icon**. You'll need to click the icon each time you want to check a page.

Let us know if you have any feedback or suggestions!