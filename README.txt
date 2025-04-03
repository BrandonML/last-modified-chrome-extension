last updated timestamp:
* if falling back to HTTP response header, if the timestamp is the current time then NOT FOUND
* test against a page that has the last mod or published timestamp in the HTML (visible to readers). See if it gets picked up by the extension
* does it properly pick up a published timestamp in lieu of a modified?

https://www.collegehunkshaulingjunk.com/blog/clear-clutter-spread-kindness-donate/
- no metas
- does have schema blog post w/ updated and published

* update logic to look at schema as well as OG


The search priority is now:

Meta last-modified tag
Other meta timestamps (article, etc.)
Document's lastModified property
Schema.org structured data (JSON-LD or microdata)
HTML content timestamps (time elements, date classes)
HTTP headers (with validation against current time)
Fall back to any previously found timestamp or show "not found"