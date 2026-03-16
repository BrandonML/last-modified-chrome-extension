// Mock globals before requiring content.js
global.window = {};
global.document = {
    querySelectorAll: jest.fn()
};
global.chrome = {
    storage: {
        sync: {
            get: jest.fn()
        }
    },
    runtime: {
        sendMessage: jest.fn()
    }
};

const { findStructuredData, processStructuredData } = require('../content');

describe('findStructuredData error handling', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        document.querySelectorAll.mockReset();
        chrome.storage.sync.get.mockReset();
        chrome.runtime.sendMessage.mockReset();
    });

    test('should catch and log error when JSON.parse fails', () => {
        const mockScript = {
            textContent: 'invalid json'
        };
        document.querySelectorAll.mockReturnValue([mockScript]);

        const results = findStructuredData();

        expect(results).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error parsing structured data:',
            expect.any(Error)
        );
    });

    test('should continue processing other scripts when one fails', () => {
        const invalidScript = {
            textContent: 'invalid json'
        };
        const validScript = {
            textContent: JSON.stringify({
                '@type': 'Article',
                'datePublished': '2023-01-01'
            })
        };
        document.querySelectorAll.mockReturnValue([invalidScript, validScript]);

        const results = findStructuredData();

        expect(results).not.toBeNull();
        expect(results.published).toBe('2023-01-01');
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
