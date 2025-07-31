// content.js - Content script that runs on demand
console.log("Content script successfully injected and running.");

async function formatDate(dateString) {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;

        const settings = await new Promise(resolve => {
            chrome.storage.sync.get({
                dateFormat: 'YYYY-MM-DD',
                timeFormat: '24-hour'
            }, items => resolve(items));
        });

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        let datePart;
        switch (settings.dateFormat) {
            case 'DD/MM/YYYY':
                datePart = `${day}/${month}/${year}`;
                break;
            case 'MM/DD/YYYY':
                datePart = `${month}/${day}/${year}`;
                break;
            case 'YYYY-MM-DD':
            default:
                datePart = `${year}-${month}-${day}`;
                break;
        }

        let timePart;
        if (settings.timeFormat === '12-hour') {
            let hours = date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // hour '0' should be '12'
            timePart = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        } else {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            timePart = `${hours}:${minutes}`;
        }

        return `${datePart} ${timePart}`;
    } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
    }
}

function findStructuredData() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    let results = { modified: null, published: null, type: null };
    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent);
            processStructuredData(data, results);
        } catch (e) {
            console.error('Error parsing structured data:', e);
        }
    }
    return results.modified || results.published ? results : null;
}

function processStructuredData(data, results) {
    if (Array.isArray(data)) {
        for (const item of data) {
            processStructuredData(item, results);
        }
        return;
    }
    if (!data || typeof data !== 'object') return;

    if (data['@type']) {
        const type = Array.isArray(data['@type']) ? data['@type'][0] : data['@type'];
        if (!results.type) results.type = type;
        if (data.dateModified && !results.modified) {
            results.modified = data.dateModified;
        }
        if (data.datePublished && !results.published) {
            results.published = data.datePublished;
        }
    }

    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
            processStructuredData(data[key], results);
        }
    }
}

// This function will be executed when the extension icon is clicked
window.findTimestamps = async function () {
    let modifiedTimestamp = null, publishedTimestamp = null;
    let modifiedSource = null, publishedSource = null;

    // Create overlay element
    let overlay = document.getElementById('last-modified-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'last-modified-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            max-width: 300px;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(overlay);
    }

    const metaTags = document.querySelectorAll('meta');

    // Step 1: Check for <meta> last-modified tag
    for (const meta of metaTags) {
        const httpEquiv = meta.getAttribute('http-equiv');
        if (httpEquiv && httpEquiv.toLowerCase() === 'last-modified') {
            modifiedTimestamp = meta.getAttribute('content');
            modifiedSource = 'Meta Tag';
            break;
        }
    }

    // Step 2: Check for other timestamps in meta tags
    for (const meta of metaTags) {
        const property = meta.getAttribute('property') || meta.getAttribute('name');
        if (property) {
            const lowerProp = property.toLowerCase();
            if (!modifiedTimestamp && (lowerProp === 'article:modified_time' || lowerProp === 'og:updated_time')) {
                modifiedTimestamp = meta.getAttribute('content');
                modifiedSource = 'Meta Property';
            }
            if (!publishedTimestamp && (lowerProp === 'article:published_time' || lowerProp === 'og:published_time' || lowerProp === 'published_time' || lowerProp === 'publication_date' || lowerProp === 'date' || lowerProp === 'dc.date')) {
                publishedTimestamp = meta.getAttribute('content');
                publishedSource = 'Meta Property';
            }
        }
    }

    // Step 3: Check for Schema.org structured data
    const structuredData = findStructuredData();
    if (structuredData) {
        if (!modifiedTimestamp && structuredData.modified) {
            modifiedTimestamp = structuredData.modified;
            modifiedSource = `Schema.org (${structuredData.type})`;
        }
        if (!publishedTimestamp && structuredData.published) {
            publishedTimestamp = structuredData.published;
            publishedSource = `Schema.org (${structuredData.type})`;
        }
    }

    // Step 4: Look for common timestamp patterns in HTML
    if (!modifiedTimestamp) {
        const modElement = document.querySelector('[itemprop="dateModified"], .post-date, .article-date, .updated, .date-modified');
        if (modElement) {
            modifiedTimestamp = modElement.getAttribute('datetime') || modElement.textContent.trim();
            modifiedSource = 'Page Content';
        }
    }
    if (!publishedTimestamp) {
        const pubElement = document.querySelector('[itemprop="datePublished"], .publish-date, .timestamp, .date-published');
        if (pubElement) {
            publishedTimestamp = pubElement.getAttribute('datetime') || pubElement.textContent.trim();
            publishedSource = 'Page Content';
        }
    }
    if (!modifiedTimestamp && !publishedTimestamp) {
        const timeElement = document.querySelector('time');
        if (timeElement) {
            const timestamp = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
            if (!publishedTimestamp) {
                publishedTimestamp = timestamp;
                publishedSource = 'Page Content (time tag)';
            }
        }
    }

    // Step 5: Check HTTP headers for Last-Modified (only if modified is still missing)
    if (!modifiedTimestamp) {
        try {
            const response = await fetch(window.location.href, { method: 'HEAD' });
            const lastModifiedHeader = response.headers.get('last-modified');
            if (lastModifiedHeader) {
                const now = new Date();
                const lastModDate = new Date(lastModifiedHeader);
                if ((now - lastModDate) / (1000 * 60) > 5) { // 5 minute threshold
                    modifiedTimestamp = lastModifiedHeader;
                    modifiedSource = 'HTTP Header';
                }
            }
        } catch (error) {
            console.error('Error checking HTTP headers:', error);
        }
    }

    await displayTimestamps(overlay, publishedTimestamp, publishedSource, modifiedTimestamp, modifiedSource);
};

async function displayTimestamps(overlayElement, publishedTimestamp, publishedSource, modifiedTimestamp, modifiedSource) {
    if (publishedTimestamp || modifiedTimestamp) {
        await displayTimestamp(publishedTimestamp, publishedSource, modifiedTimestamp, modifiedSource, overlayElement);
    } else {
        overlayElement.textContent = 'No reliable timestamp found';
        overlayElement.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
        chrome.runtime.sendMessage({ published: null, modified: null });
        setTimeout(() => {
            overlayElement.style.opacity = '0';
            setTimeout(() => {
                if (overlayElement.parentNode) {
                    overlayElement.parentNode.removeChild(overlayElement);
                }
            }, 500);
        }, 5000);
    }
}

async function displayTimestamp(pubDate, pubSource, modDate, modSource, overlayElement) {
    let html = '';
    const formattedPubDate = await formatDate(pubDate);
    if (formattedPubDate) {
        html += `<strong>Published:</strong><br>${formattedPubDate}<br><small>(${pubSource})</small><br><br>`;
    } else {
         html += `<strong>Published:</strong><br>Not found<br><br>`;
    }

    const formattedModDate = await formatDate(modDate);
    if (formattedModDate) {
        html += `<strong>Last Modified:</strong><br>${formattedModDate}<br><small>(${modSource})</small>`;
    } else {
        html += `<strong>Last Modified:</strong><br>Not found`;
    }

    overlayElement.innerHTML = html;
    overlayElement.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
    chrome.runtime.sendMessage({ published: pubDate, modified: modDate });

    setTimeout(() => {
        overlayElement.style.opacity = '0';
        setTimeout(() => {
            if (overlayElement.parentNode) {
                overlayElement.parentNode.removeChild(overlayElement);
            }
        }, 500);
    }, 5000);
}
