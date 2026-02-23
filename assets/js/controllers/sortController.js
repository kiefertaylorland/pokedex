/**
 * Sort Controller - Handles Pokemon sorting functionality
 * @module SortController
 */

import { ELEMENT_IDS, SORT_OPTIONS, STORAGE_KEYS_SORT } from '../constants.js';
import { Storage } from '../utils/storage.js';
import { sortByNumberAsc, sortByNumberDesc, sortByName, sortByStatTotal } from '../utils/sorters.js';

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
        this.boundChangeHandler = null;

        this._bindEvents();
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
            return Storage.get(STORAGE_KEYS_SORT.SORT_ORDER, SORT_OPTIONS.NUMBER_ASC);
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
            Storage.set(STORAGE_KEYS_SORT.SORT_ORDER, sortOption);
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
        if (!Object.values(SORT_OPTIONS).includes(sortOption)) {
            return;
        }

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
    /**
     * Removes sort listeners and internal references
     */
    destroy() {
        if (this.sortSelect && this.boundChangeHandler) {
            this.sortSelect.removeEventListener('change', this.boundChangeHandler);
        }
    }

}
