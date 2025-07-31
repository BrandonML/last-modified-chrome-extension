// options.js

const dateFormatSelect = document.getElementById('date-format');
const timeFormatSelect = document.getElementById('time-format');
const saveButton = document.getElementById('save-button');
const statusDiv = document.getElementById('status');

// Saves options to chrome.storage
function saveOptions() {
    const dateFormat = dateFormatSelect.value;
    const timeFormat = timeFormatSelect.value;

    chrome.storage.sync.set({
        dateFormat: dateFormat,
        timeFormat: timeFormat
    }, () => {
        // Update status to let user know options were saved.
        statusDiv.textContent = 'Options saved.';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 1500);
    });
}

// Restores select box state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    // Use default values
    chrome.storage.sync.get({
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24-hour'
    }, (items) => {
        dateFormatSelect.value = items.dateFormat;
        timeFormatSelect.value = items.timeFormat;
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
