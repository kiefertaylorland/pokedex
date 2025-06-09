/**
 * UI Controller - Manages user interface state, theme, and language
 * @module UIController
 */

import { STORAGE_KEYS, THEMES, LANGUAGES, UI_TEXT, CSS_CLASSES, ELEMENT_IDS } from '../constants.js';

/**
 * Manages UI state, theme switching, and language switching
 */
export class UIController {
    constructor() {
        this.currentLanguage = this._getStoredLanguage();
        this.currentTheme = this._getStoredTheme();
        this.elements = {};
        this._cacheElements();
    }

    /**
     * Initialize UI controller and apply stored preferences
     */
    initialize() {
        this.applyTheme(this.currentTheme);
        this.applyLanguage(this.currentLanguage);
    }

    /**
     * Cache frequently used DOM elements
     * @private
     */
    _cacheElements() {
        this.elements = {
            body: document.body,
            appTitle: document.getElementById(ELEMENT_IDS.APP_TITLE),
            searchInput: document.getElementById(ELEMENT_IDS.SEARCH_INPUT),
            footerText: document.getElementById(ELEMENT_IDS.FOOTER_TEXT),
            themeToggle: document.getElementById(ELEMENT_IDS.THEME_TOGGLE),
            langToggle: document.getElementById(ELEMENT_IDS.LANG_TOGGLE),
            pokedexGrid: document.getElementById(ELEMENT_IDS.POKEDEX_GRID),
            detailView: document.getElementById(ELEMENT_IDS.DETAIL_VIEW)
        };
    }

    /**
     * Gets stored language from localStorage
     * @private
     * @returns {string} Language code
     */
    _getStoredLanguage() {
        const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
        return stored === LANGUAGES.JAPANESE ? LANGUAGES.JAPANESE : LANGUAGES.ENGLISH;
    }

    /**
     * Gets stored theme from localStorage
     * @private
     * @returns {string} Theme name
     */
    _getStoredTheme() {
        const stored = localStorage.getItem(STORAGE_KEYS.THEME);
        return stored === THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
    }

    /**
     * Applies theme to the interface
     * @param {string} theme - Theme name (light/dark)
     */
    applyTheme(theme) {
        const isDark = theme === THEMES.DARK;
        
        this.elements.body.classList.toggle(CSS_CLASSES.DARK_MODE, isDark);
        this.currentTheme = theme;
        
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.textContent = isDark ? '☀️' : '🌓';
            this.elements.themeToggle.setAttribute('aria-label', 
                isDark ? 'Switch to light mode' : 'Switch to dark mode');
        }
    }

    /**
     * Toggles between light and dark theme
     */
    toggleTheme() {
        const newTheme = this.currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        this.applyTheme(newTheme);
    }

    /**
     * Applies language to the interface
     * @param {string} language - Language code (en/jp)
     */
    applyLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
        
        this._updateUIText(language);
        this._updateLanguageToggle(language);
    }

    /**
     * Updates UI text based on language
     * @private
     * @param {string} language - Language code
     */
    _updateUIText(language) {
        const text = UI_TEXT[language];
        
        if (this.elements.appTitle) {
            this.elements.appTitle.textContent = text.title;
        }
        
        if (this.elements.searchInput) {
            this.elements.searchInput.placeholder = text.searchPlaceholder;
            this.elements.searchInput.setAttribute('aria-label', text.searchPlaceholder);
        }
        
        if (this.elements.footerText) {
            this.elements.footerText.textContent = text.footer;
        }
    }

    /**
     * Updates language toggle button
     * @private
     * @param {string} language - Current language
     */
    _updateLanguageToggle(language) {
        if (this.elements.langToggle) {
            this.elements.langToggle.textContent = language === LANGUAGES.ENGLISH ? 'EN/日本語' : 'EN/JP';
            this.elements.langToggle.setAttribute('aria-label', 
                language === LANGUAGES.ENGLISH ? 'Switch to Japanese' : 'Switch to English');
        }
    }

    /**
     * Toggles between English and Japanese
     */
    toggleLanguage() {
        const newLanguage = this.currentLanguage === LANGUAGES.ENGLISH ? 
            LANGUAGES.JAPANESE : LANGUAGES.ENGLISH;
        this.applyLanguage(newLanguage);
    }

    /**
     * Shows loading state
     * @param {string} message - Loading message (optional)
     */
    showLoading(message) {
        const text = UI_TEXT[this.currentLanguage];
        const loadingMessage = message || text.loading;
        
        if (this.elements.pokedexGrid) {
            this.elements.pokedexGrid.innerHTML = `
                <div class="loading-container">
                    <p class="loading-message">${loadingMessage}</p>
                </div>
            `;
        }
    }

    /**
     * Shows error state
     * @param {string} message - Error message (optional)
     */
    showError(message) {
        const text = UI_TEXT[this.currentLanguage];
        const errorMessage = message || text.error;
        
        if (this.elements.pokedexGrid) {
            this.elements.pokedexGrid.innerHTML = `
                <div class="error-container">
                    <p class="error-message">${errorMessage}</p>
                </div>
            `;
        }
    }

    /**
     * Enables modal state (prevents body scroll)
     */
    enableModalState() {
        this.elements.body.classList.add(CSS_CLASSES.MODAL_OPEN);
    }

    /**
     * Disables modal state (restores body scroll)
     */
    disableModalState() {
        this.elements.body.classList.remove(CSS_CLASSES.MODAL_OPEN);
    }

    /**
     * Gets current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Gets current theme
     * @returns {string} Current theme name
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Gets UI text for current language
     * @returns {Object} UI text object
     */
    getCurrentUIText() {
        return UI_TEXT[this.currentLanguage];
    }

    /**
     * Gets cached DOM element
     * @param {string} elementKey - Key for cached element
     * @returns {HTMLElement|null} DOM element or null
     */
    getElement(elementKey) {
        return this.elements[elementKey] || null;
    }

    /**
     * Updates page title
     * @param {string} title - New page title
     */
    updatePageTitle(title) {
        document.title = title || UI_TEXT[this.currentLanguage].title;
    }

    /**
     * Announces content change to screen readers
     * @param {string} message - Message to announce
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}
