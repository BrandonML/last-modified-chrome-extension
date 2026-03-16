// background.js - Background service worker
// Open onboarding page on install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    const url = tab?.url || '';
    const tabId = tab?.id;

    let protocol = '';

    try {
        protocol = new URL(url).protocol;
    } catch (error) {
        console.warn('Unsupported page for extension action: invalid or missing URL.', {
            tabId,
            url,
            error
        });
        return;
    }

    if (!tabId || (protocol !== 'http:' && protocol !== 'https:')) {
        console.warn('Unsupported page for extension action: only http/https tabs with valid IDs are supported.', {
            tabId,
            url,
            protocol
        });
        return;
    }

    try {
        console.log("Injecting content.js into tab:", tabId);
        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });

        // Call the findTimestamps function
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                if (window.findTimestamps) {
                    window.findTimestamps();
                } else {
                    console.error("findTimestamps function not found.");
                }
            }
        });
    } catch (error) {
        console.error("Error injecting content script:", error);
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const tabId = sender.tab.id;
    if (message.published || message.modified) {
        chrome.action.setBadgeText({ text: "✓", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId: tabId });

        let title = [];
        if (message.published) {
            title.push(`Published: ${new Date(message.published).toLocaleString()}`);
        }
        if (message.modified) {
            title.push(`Modified: ${new Date(message.modified).toLocaleString()}`);
        }
        chrome.action.setTitle({ title: title.join('\n'), tabId: tabId });

    } else {
        chrome.action.setBadgeText({ text: "✗", tabId: tabId });
        chrome.action.setBadgeBackgroundColor({ color: "#F44336", tabId: tabId });
        chrome.action.setTitle({ title: "No timestamp found", tabId: tabId });
    }
});
