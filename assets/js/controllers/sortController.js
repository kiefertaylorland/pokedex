/**
 * Sort Controller - Handles Pokemon sorting functionality
 * @module SortController
 */

import { ELEMENT_IDS, SORT_OPTIONS, STORAGE_KEYS_SORT } from '../constants.js';

/**
 * Manages sorting functionality for Pokemon display
 */
export class SortController {
    constructor(dataManager, uiController, onSortChange) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.onSortChange = onSortChange;
        this.sortSelect = document.getElementById(ELEMENT_IDS.SORT_SELECT);
        this.currentSortOption = this._loadSortPreference();
        
        this._bindEvents();
    }

    /**
     * Binds sort select events
     * @private
     */
    _bindEvents() {
        if (!this.sortSelect) {
            console.error('Sort select element not found');
            return;
        }

        this.sortSelect.addEventListener('change', (event) => {
            this._handleSortChange(event.target.value);
        });
    }

    /**
     * Handles sort option change
     * @private
     * @param {string} sortOption - Selected sort option
     */
    _handleSortChange(sortOption) {
        if (!sortOption || sortOption === this.currentSortOption) {
            return;
        }

        this.currentSortOption = sortOption;
        this._saveSortPreference(sortOption);

        // Trigger sort callback
        if (typeof this.onSortChange === 'function') {
            this.onSortChange(sortOption);
        }

        // Announce to screen readers
        this._announceSortChange(sortOption);
    }

    /**
     * Sorts an array of Pokemon based on current sort option
     * @param {Array} pokemonArray - Array of Pokemon to sort
     * @returns {Array} Sorted array
     */
    sortPokemon(pokemonArray) {
        if (!pokemonArray || pokemonArray.length === 0) {
            return pokemonArray;
        }

        const sorted = [...pokemonArray]; // Create a copy to avoid mutating original

        switch (this.currentSortOption) {
            case SORT_OPTIONS.NUMBER_ASC:
                return sorted.sort((a, b) => a.id - b.id);
            
            case SORT_OPTIONS.NUMBER_DESC:
                return sorted.sort((a, b) => b.id - a.id);
            
            case SORT_OPTIONS.NAME_ASC:
                return this._sortByName(sorted, true);
            
            case SORT_OPTIONS.NAME_DESC:
                return this._sortByName(sorted, false);
            
            case SORT_OPTIONS.STAT_TOTAL:
                return this._sortByStatTotal(sorted);
            
            default:
                return sorted.sort((a, b) => a.id - b.id); // Default to number ascending
        }
    }

    /**
     * Sorts Pokemon by name based on current language
     * @private
     * @param {Array} pokemonArray - Array to sort
     * @param {boolean} ascending - Sort ascending or descending
     * @returns {Array} Sorted array
     */
    _sortByName(pokemonArray, ascending = true) {
        const currentLanguage = this.uiController.getCurrentLanguage();
        const nameKey = currentLanguage === 'jp' ? 'name_jp' : 'name_en';

        return pokemonArray.sort((a, b) => {
            const nameA = (a[nameKey] || '').toLowerCase();
            const nameB = (b[nameKey] || '').toLowerCase();
            
            if (ascending) {
                return nameA.localeCompare(nameB);
            } else {
                return nameB.localeCompare(nameA);
            }
        });
    }

    /**
     * Sorts Pokemon by total stats (descending - highest first)
     * @private
     * @param {Array} pokemonArray - Array to sort
     * @returns {Array} Sorted array
     */
    _sortByStatTotal(pokemonArray) {
        return pokemonArray.sort((a, b) => {
            const totalA = this._calculateStatTotal(a);
            const totalB = this._calculateStatTotal(b);
            return totalB - totalA; // Descending order
        });
    }

    /**
     * Calculates total stats for a Pokemon
     * @private
     * @param {Object} pokemon - Pokemon object
     * @returns {number} Total stats
     */
    _calculateStatTotal(pokemon) {
        if (!pokemon.stats) {
            return 0;
        }

        return Object.values(pokemon.stats).reduce((total, stat) => {
            return total + (typeof stat === 'number' ? stat : 0);
        }, 0);
    }

    /**
     * Announces sort change to screen readers
     * @private
     * @param {string} sortOption - Sort option that was selected
     */
    _announceSortChange(sortOption) {
        const currentLang = this.uiController.getCurrentLanguage();
        const uiText = this.uiController.getCurrentUIText();
        
        let sortText = '';
        switch (sortOption) {
            case SORT_OPTIONS.NUMBER_ASC:
                sortText = uiText.sortNumberAsc;
                break;
            case SORT_OPTIONS.NUMBER_DESC:
                sortText = uiText.sortNumberDesc;
                break;
            case SORT_OPTIONS.NAME_ASC:
                sortText = uiText.sortNameAsc;
                break;
            case SORT_OPTIONS.NAME_DESC:
                sortText = uiText.sortNameDesc;
                break;
            case SORT_OPTIONS.STAT_TOTAL:
                sortText = uiText.sortStatTotal;
                break;
        }

        const message = currentLang === 'jp' 
            ? `並び替え: ${sortText}` 
            : `Sorted by: ${sortText}`;
        
        this.uiController.announceToScreenReader(message);
    }

    /**
     * Loads sort preference from local storage
     * @private
     * @returns {string} Sort option
     */
    _loadSortPreference() {
        try {
            return localStorage.getItem(STORAGE_KEYS_SORT.SORT_ORDER) || SORT_OPTIONS.NUMBER_ASC;
        } catch (error) {
            console.warn('Failed to load sort preference:', error);
            return SORT_OPTIONS.NUMBER_ASC;
        }
    }

    /**
     * Saves sort preference to local storage
     * @private
     * @param {string} sortOption - Sort option to save
     */
    _saveSortPreference(sortOption) {
        try {
            localStorage.setItem(STORAGE_KEYS_SORT.SORT_ORDER, sortOption);
        } catch (error) {
            console.warn('Failed to save sort preference:', error);
        }
    }

    /**
     * Gets current sort option
     * @returns {string} Current sort option
     */
    getCurrentSortOption() {
        return this.currentSortOption;
    }

    /**
     * Sets sort option programmatically
     * @param {string} sortOption - Sort option to set
     */
    setSortOption(sortOption) {
        if (this.sortSelect) {
            this.sortSelect.value = sortOption;
            this._handleSortChange(sortOption);
        }
    }

    /**
     * Updates sort select options text for language changes
     */
    updateSortLabels() {
        if (!this.sortSelect) {
            return;
        }

        const uiText = this.uiController.getCurrentUIText();
        const options = this.sortSelect.options;

        for (let option of options) {
            switch (option.value) {
                case SORT_OPTIONS.NUMBER_ASC:
                    option.textContent = uiText.sortNumberAsc;
                    break;
                case SORT_OPTIONS.NUMBER_DESC:
                    option.textContent = uiText.sortNumberDesc;
                    break;
                case SORT_OPTIONS.NAME_ASC:
                    option.textContent = uiText.sortNameAsc;
                    break;
                case SORT_OPTIONS.NAME_DESC:
                    option.textContent = uiText.sortNameDesc;
                    break;
                case SORT_OPTIONS.STAT_TOTAL:
                    option.textContent = uiText.sortStatTotal;
                    break;
            }
        }
    }

    /**
     * Enables sort functionality
     */
    enable() {
        if (this.sortSelect) {
            this.sortSelect.disabled = false;
            // Set initial value
            this.sortSelect.value = this.currentSortOption;
            // Ensure labels are in the correct language
            this.updateSortLabels();
        }
    }

    /**
     * Disables sort functionality
     */
    disable() {
        if (this.sortSelect) {
            this.sortSelect.disabled = true;
        }
    }
}
