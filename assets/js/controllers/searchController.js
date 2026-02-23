/**
 * Search Controller - Handles Pokemon search functionality
 * @module SearchController
 */

import { ELEMENT_IDS, DATA } from '../constants.js';
import { sanitizeSearchInput } from '../utils/security.js';
import { debounce } from '../utils/debounce.js';
import { buildSearchAnnouncement } from '../utils/searchAnnouncements.js';

/**
 * Manages search functionality with debouncing and validation
 */
export class SearchController {
    constructor(dataManager, uiController, onSearchResults) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.onSearchResults = onSearchResults;
        this.searchInput = document.getElementById(ELEMENT_IDS.SEARCH_INPUT);
        this.currentSearchTerm = '';
        this.boundInputHandler = null;
        this.boundPasteHandler = null;
        this.boundKeydownHandler = null;

        // Create debounced search function
        this.debouncedSearch = debounce(
            this._performSearch.bind(this), 
            DATA.SEARCH_DEBOUNCE_MS
        );
        
        this._bindEvents();
    }

    /**
     * Binds search input events
     * @private
     */
    _bindEvents() {
        if (!this.searchInput) {
            // Critical error - search input element not found
            console.error('Search input element not found');
            return;
        }

        this.boundInputHandler = (event) => {
            this._handleSearchInput(event.target.value);
        };
        this.boundPasteHandler = (event) => {
            setTimeout(() => {
                this._handleSearchInput(event.target.value);
            }, 0);
        };
        this.boundKeydownHandler = (event) => {
            if (event.key === 'Escape') {
                this.clearSearch();
                event.target.blur();
            }
        };

        this.searchInput.addEventListener('input', this.boundInputHandler);
        this.searchInput.addEventListener('paste', this.boundPasteHandler);
        this.searchInput.addEventListener('keydown', this.boundKeydownHandler);
    }

    /**
     * Handles search input with sanitization
     * @private
     * @param {string} rawInput - Raw user input
     */
    _handleSearchInput(rawInput) {
        const sanitizedInput = sanitizeSearchInput(rawInput || '');
        
        if (sanitizedInput === this.currentSearchTerm) {
            return; // No change, skip search
        }

        this.currentSearchTerm = sanitizedInput;
        this.debouncedSearch(sanitizedInput);
    }

    /**
     * Performs the actual search
     * @private
     * @param {string} searchTerm - Search term to use
     */
    _performSearch(searchTerm) {
        if (!this.dataManager.isDataLoaded()) {
            return;
        }

        try {
            const currentLanguage = this.uiController.getCurrentLanguage();
            const results = this.dataManager.searchPokemon(searchTerm, currentLanguage);
            
            // Call the results callback
            if (typeof this.onSearchResults === 'function') {
                this.onSearchResults(results, searchTerm);
            }

            // Announce results to screen readers
            this._announceSearchResults(results.length, searchTerm);

        } catch (error) {
            // Critical error during search
            console.error('Search error:', error);
            this.uiController.showError('Search failed. Please try again.');
        }
    }

    /**
     * Announces search results to screen readers
     * @private
     * @param {number} resultCount - Number of results found
     * @param {string} searchTerm - Search term used
     */
    _announceSearchResults(resultCount, searchTerm) {
        const message = buildSearchAnnouncement({
            language: this.uiController.getCurrentLanguage(),
            resultCount,
            searchTerm
        });

        this.uiController.announceToScreenReader(message);
    }

    /**
     * Clears the search input and results
     */
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.currentSearchTerm = '';
            this._performSearch(''); // Show all results
        }
    }

    /**
     * Sets search term programmatically
     * @param {string} searchTerm - Search term to set
     */
    setSearchTerm(searchTerm) {
        const sanitized = sanitizeSearchInput(searchTerm);
        
        if (this.searchInput) {
            this.searchInput.value = sanitized;
        }
        
        this.currentSearchTerm = sanitized;
        this._performSearch(sanitized);
    }

    /**
     * Gets current search term
     * @returns {string} Current search term
     */
    getCurrentSearchTerm() {
        return this.currentSearchTerm;
    }

    /**
     * Focuses the search input
     */
    focusSearch() {
        if (this.searchInput) {
            this.searchInput.focus();
        }
    }

    /**
     * Highlights search results (if needed for future enhancement)
     * @param {string} text - Text to potentially highlight
     * @param {string} searchTerm - Term to highlight
     * @returns {string} Text with highlighting (currently just returns original text)
     */
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm || !text) {
            return text;
        }

        // For now, just return the original text
        // In the future, could implement highlighting with proper XSS protection
        return text;
    }

    /**
     * Validates if search is ready
     * @returns {boolean} True if search is ready to use
     */
    isSearchReady() {
        return this.dataManager.isDataLoaded() && this.searchInput !== null;
    }

    /**
     * Gets search input element for external access
     * @returns {HTMLElement|null} Search input element
     */
    getSearchInput() {
        return this.searchInput;
    }

    /**
     * Disables search functionality
     */
    disable() {
        if (this.searchInput) {
            this.searchInput.disabled = true;
            this.searchInput.placeholder = 'Loading...';
        }
    }

    /**
     * Enables search functionality
     */
    enable() {
        if (this.searchInput) {
            this.searchInput.disabled = false;
            const uiText = this.uiController.getCurrentUIText();
            this.searchInput.placeholder = uiText.searchPlaceholder;
        }
    }

    /**
     * Updates search placeholder text for language changes
     */
    updatePlaceholder() {
        if (this.searchInput) {
            const uiText = this.uiController.getCurrentUIText();
            this.searchInput.placeholder = uiText.searchPlaceholder;
            this.searchInput.setAttribute('aria-label', uiText.searchPlaceholder);
        }
    }
    /**
     * Removes event listeners and releases references
     */
    destroy() {
        if (!this.searchInput) {
            return;
        }

        if (this.boundInputHandler) {
            this.searchInput.removeEventListener('input', this.boundInputHandler);
        }
        if (this.boundPasteHandler) {
            this.searchInput.removeEventListener('paste', this.boundPasteHandler);
        }
        if (this.boundKeydownHandler) {
            this.searchInput.removeEventListener('keydown', this.boundKeydownHandler);
        }
    }

}
