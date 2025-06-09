/**
 * Security utilities for safe DOM manipulation and input handling
 * Provides XSS protection and input sanitization
 * @module Security
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param {string} html - The HTML content to sanitize
 * @returns {string} Sanitized HTML content
 */
export function sanitizeHTML(html) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = html;
    return tempDiv.innerHTML;
}

/**
 * Creates safe DOM elements with text content
 * @param {string} tagName - The HTML tag name
 * @param {string} textContent - The text content to set
 * @param {Object} attributes - Optional attributes to set
 * @returns {HTMLElement} Safe DOM element
 */
export function createSafeElement(tagName, textContent = '', attributes = {}) {
    const element = document.createElement(tagName);
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (typeof value === 'string') {
            element.setAttribute(key, sanitizeHTML(value));
        }
    });
    
    return element;
}

/**
 * Safely sets innerHTML with sanitization
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content to set
 */
export function safeSetInnerHTML(element, html) {
    // For now, we'll use a simple approach. In production, consider using DOMPurify
    const sanitized = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    
    element.innerHTML = sanitized;
}

/**
 * Validates and sanitizes search input
 * @param {string} input - User search input
 * @returns {string} Sanitized search input
 */
export function sanitizeSearchInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    return input
        .trim()
        .slice(0, 100) // Limit length
        .replace(/[<>]/g, '') // Remove potential HTML brackets
        .toLowerCase();
}

/**
 * Debounces a function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validates Pokemon ID to prevent manipulation
 * @param {*} id - Pokemon ID to validate
 * @returns {number|null} Valid Pokemon ID or null
 */
export function validatePokemonId(id) {
    const numId = parseInt(id, 10);
    return (numId && numId > 0 && numId <= 10000) ? numId : null;
}
