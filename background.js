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
    if (tab.url.startsWith("http")) { // Ensure the tab is a valid webpage
        try {
            console.log("Injecting content.js into tab:", tab.id);
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Call the checkLastModified function
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    if (window.checkLastModified) {
                        window.checkLastModified();
                    } else {
                        console.error("checkLastModified function not found.");
                    }
                }
            });
        } catch (error) {
            console.error("Error injecting content script:", error);
        }
    } else {
        console.warn("Cannot inject script into this tab:", tab.url);
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.timestamp) {
        // Update the extension badge with info
        chrome.action.setBadgeText({
            text: "✓",
            tabId: sender.tab.id
        });

        chrome.action.setBadgeBackgroundColor({
            color: "#4CAF50",
            tabId: sender.tab.id
        });

        chrome.action.setTitle({
            title: `Last Modified: ${message.timestamp}`,
            tabId: sender.tab.id
        });
    } else {
        chrome.action.setBadgeText({
            text: "✗",
            tabId: sender.tab.id
        });

        chrome.action.setBadgeBackgroundColor({
            color: "#F44336",
            tabId: sender.tab.id
        });

        chrome.action.setTitle({
            title: "No timestamp found",
            tabId: sender.tab.id
        });
    }
});