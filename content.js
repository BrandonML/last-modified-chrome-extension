// content.js - Content script that runs on demand

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;

        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function findStructuredData() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
        try {
            const data = JSON.parse(script.textContent);
            let result = processStructuredData(data);
            if (result) return result;
        } catch (e) {
            console.error('Error parsing structured data:', e);
        }
    }
    return null;
}

function processStructuredData(data) {
    if (Array.isArray(data)) {
        for (const item of data) {
            const result = processStructuredData(item);
            if (result) return result;
        }
        return null;
    }
    if (!data || typeof data !== 'object') return null;
    if (data['@type']) {
        const type = Array.isArray(data['@type']) ? data['@type'][0] : data['@type'];
        if (data.dateModified) {
            return { timestamp: data.dateModified, type: type };
        }
        if (data.datePublished) {
            return { timestamp: data.datePublished, type: type };
        }
    }
    for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null) {
            const result = processStructuredData(data[key]);
            if (result) return result;
        }
    }
    return null;
}

// This function will be executed when the extension icon is clicked
window.checkLastModified = function () {
    let finalTimestamp = null;
    let timestampSource = null;

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

    // Step 1: Check for <meta> last-modified tag
    const metaTags = document.querySelectorAll('meta');
    for (const meta of metaTags) {
        const httpEquiv = meta.getAttribute('http-equiv');
        if (httpEquiv && httpEquiv.toLowerCase() === 'last-modified') {
            finalTimestamp = meta.getAttribute('content');
            timestampSource = 'Meta Tag';
            break;
        }
    }

    // Step 2: Check for other timestamps in meta tags
    if (!finalTimestamp) {
        let fallbackTimestamp = null;
        for (const meta of metaTags) {
            const property = meta.getAttribute('property') || meta.getAttribute('name');
            if (property) {
                const lowerProp = property.toLowerCase();
                if (lowerProp === 'article:modified_time' || lowerProp === 'og:updated_time') {
                    finalTimestamp = meta.getAttribute('content');
                    timestampSource = 'Meta property';
                    break;
                } else if (lowerProp === 'article:published_time' || lowerProp === 'og:published_time' ||
                    lowerProp === 'published_time' || lowerProp === 'publication_date' ||
                    lowerProp === 'date' || lowerProp === 'dc.date') {
                    fallbackTimestamp = meta.getAttribute('content');
                }
            }
        }
        if (!finalTimestamp && fallbackTimestamp) {
            finalTimestamp = fallbackTimestamp;
            timestampSource = 'Meta Tag Fallback';
        }
    }

    // Step 3: Check for Schema.org structured data
    if (!finalTimestamp) {
        const structuredData = findStructuredData();
        if (structuredData) {
            finalTimestamp = structuredData.timestamp;
            timestampSource = `Schema.org (${structuredData.type})`;
        }
    }

    // Step 4: Look for common timestamp patterns in HTML
    if (!finalTimestamp) {
        const datePatterns = [
            document.querySelector('.post-date, .article-date, .publish-date, .timestamp, [itemprop="dateModified"], [itemprop="datePublished"]'),
            document.querySelector('time')
        ];
        for (const element of datePatterns) {
            if (element) {
                let foundDate = element.getAttribute('datetime') || element.textContent.trim();
                if (foundDate) {
                    finalTimestamp = foundDate;
                    timestampSource = 'Page Content';
                    break;
                }
            }
        }
    }

    // Step 5: Check HTTP headers using fetch (only Last-Modified) if no timestamp found yet
    if (!finalTimestamp) {
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                const lastModifiedHeader = response.headers.get('last-modified');
                const now = new Date();

                if (lastModifiedHeader) {
                    const lastModDate = new Date(lastModifiedHeader);
                    const diffInMinutes = (now - lastModDate) / (1000 * 60);
                    if (diffInMinutes > 5) {
                        finalTimestamp = lastModifiedHeader;
                        timestampSource = 'HTTP Last-Modified Header';
                    }
                }

                // Finally, display the timestamp
                if (finalTimestamp) {
                    displayTimestamp(finalTimestamp, timestampSource, overlay);
                } else {
                    overlay.textContent = 'No reliable timestamp found';
                    overlay.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
                    chrome.runtime.sendMessage({ timestamp: null });
                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            if (overlay.parentNode) {
                                overlay.parentNode.removeChild(overlay);
                            }
                        }, 500);
                    }, 5000);
                }
            })
            .catch(error => {
                console.error('Error checking HTTP headers:', error);
                if (!finalTimestamp) {
                    overlay.textContent = 'No timestamp found';
                    overlay.style.backgroundColor = 'rgba(244, 67, 54, 0.9)';
                    chrome.runtime.sendMessage({ timestamp: null });
                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            if (overlay.parentNode) {
                                overlay.parentNode.removeChild(overlay);
                            }
                        }, 500);
                    }, 5000);
                }
            });
    } else {
        // If we found a timestamp in the DOM, display it immediately
        displayTimestamp(finalTimestamp, timestampSource, overlay);
    }

    function displayTimestamp(date, source, overlayElement) {
        const formattedDate = formatDate(date);
        overlayElement.innerHTML = `<strong>Last Modified:</strong><br><br>${formattedDate}<br><br><small>(${source})</small>`;
        overlayElement.style.backgroundColor = 'rgba(33, 150, 243, 0.9)';
        chrome.runtime.sendMessage({ timestamp: formattedDate });
        setTimeout(() => {
            overlayElement.style.opacity = '0';
            setTimeout(() => {
                if (overlayElement.parentNode) {
                    overlayElement.parentNode.removeChild(overlayElement);
                }
            }, 500);
        }, 5000);
    }
};
