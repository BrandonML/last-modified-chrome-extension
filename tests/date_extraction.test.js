// Set up global mocks before importing
global.chrome = {
    storage: {
        sync: {
            get: jest.fn((defaults, callback) => callback(defaults))
        }
    },
    runtime: {
        sendMessage: jest.fn()
    }
};

// jest-environment-jsdom provides global.window and global.document

// Mock window.location for HTTP headers check in findTimestamps
delete window.location;
window.location = new URL('http://localhost');

global.fetch = jest.fn(() => Promise.resolve({
    headers: { get: () => null }
}));

const fs = require('fs');
const path = require('path');
const contentScriptContent = fs.readFileSync(path.resolve(__dirname, '../content.js'), 'utf-8');

// Run the script in the global context
const contentModule = eval(`(function() {
    var module = {exports: {}};
    ${contentScriptContent};
    return module.exports;
})()`);

describe('Date Extraction Logic (findDate)', () => {
    test('parses ISO strings', async () => {
        const isoString = '2026-03-16T15:00:00Z';
        const formatted = await contentModule.formatDate(isoString);
        // Default format is YYYY-MM-DD
        expect(formatted).toContain('2026-03-16');
    });

    test('parses human readable strings', async () => {
        const readableString = 'March 16, 2026';
        const formatted = await contentModule.formatDate(readableString);
        expect(formatted).toContain('2026-03-16');
    });

    test('parses relative dates', async () => {
        // "2 days ago"
        const formatted = await contentModule.formatDate('2 days ago');

        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - 2);
        const year = expectedDate.getFullYear();
        const month = String(expectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(expectedDate.getDate()).padStart(2, '0');

        expect(formatted).toContain(`${year}-${month}-${day}`);
    });
});

describe('Priority Hierarchy Validation', () => {
    beforeEach(() => {
        // Clear DOM
        document.head.innerHTML = '';
        document.body.innerHTML = '';

        // Reset mocks
        global.chrome.runtime.sendMessage.mockClear();
    });

    test('Priority 1: ld+json schema is prioritized over meta tags', async () => {
        document.head.innerHTML = `
            <meta property="article:modified_time" content="2023-01-01T00:00:00Z">
            <script type="application/ld+json">
                {
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "dateModified": "2024-01-01T00:00:00Z"
                }
            </script>
        `;

        await window.findTimestamps();

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                modified: "2024-01-01T00:00:00Z"
            })
        );
    });

    test('Priority 2: meta tags prioritized over <time> tags', async () => {
        document.head.innerHTML = `
            <meta property="article:modified_time" content="2023-01-01T00:00:00Z">
        `;
        document.body.innerHTML = `
            <time class="updated" datetime="2022-01-01T00:00:00Z">Jan 1, 2022</time>
        `;

        await window.findTimestamps();

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                modified: "2023-01-01T00:00:00Z"
            })
        );
    });

    test('Priority 3: <time> tags prioritized over regex scan', async () => {
        document.body.innerHTML = `
            <time class="updated" datetime="2022-01-01T00:00:00Z">Jan 1, 2022</time>
            <div>Updated on 2021-01-01</div>
        `;

        await window.findTimestamps();

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                modified: "2022-01-01T00:00:00Z"
            })
        );
    });

    test('Priority 4: Regex scan as fallback', async () => {
        document.body.innerHTML = `
            <div>Updated on 2021-01-01</div>
            <div>Published on 2020-01-01</div>
        `;
        // Manually update innerText for JSDOM
        document.body.innerText = "Updated on 2021-01-01\\nPublished on 2020-01-01";

        await window.findTimestamps();

        expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                modified: "2021-01-01",
                published: "2020-01-01"
            })
        );
    });
});
