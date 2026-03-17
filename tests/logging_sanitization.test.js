/**
 * @jest-environment node
 */
const { sanitizeUrl } = require('../content.js');

describe('URL Sanitization', () => {
    test('should remove query parameters', () => {
        const url = 'https://example.com/page?query=secret&token=123';
        expect(sanitizeUrl(url)).toBe('https://example.com/page');
    });

    test('should remove fragments', () => {
        const url = 'https://example.com/page#section1';
        expect(sanitizeUrl(url)).toBe('https://example.com/page');
    });

    test('should remove both query parameters and fragments', () => {
        const url = 'https://example.com/page?query=secret#section1';
        expect(sanitizeUrl(url)).toBe('https://example.com/page');
    });

    test('should handle URLs with no query or fragment', () => {
        const url = 'https://example.com/page';
        expect(sanitizeUrl(url)).toBe('https://example.com/page');
    });

    test('should handle root URLs', () => {
        const url = 'https://example.com/';
        expect(sanitizeUrl(url)).toBe('https://example.com/');
    });

    test('should handle invalid URLs', () => {
        const url = 'not-a-url';
        expect(sanitizeUrl(url)).toBe('[INVALID URL]');
    });

    test('should handle empty, null, or undefined input', () => {
        expect(sanitizeUrl('')).toBe('');
        expect(sanitizeUrl(null)).toBe('');
        expect(sanitizeUrl(undefined)).toBe('');
    });
});
