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

            // Call the findTimestamps function
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
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
    } else {
        console.warn("Cannot inject script into this tab:", tab.url);
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