/**
 * Sort Controller - Handles Pokemon sorting functionality
 * @module SortController
 */

import { ELEMENT_IDS, SORT_OPTIONS, STORAGE_KEYS_SORT } from '../constants.js';
import { Storage } from '../utils/storage.js';
import {
    sortByNumberAsc,
    sortByNumberDesc,
    sortByName,
    sortByStatTotal,
    sortByHeight,
    sortByWeight
} from '../utils/sorters.js';

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
     * Binds sort select events
     * @private
     */
    _bindEvents() {
        if (!this.sortSelect) {
            console.error('Sort select element not found');
            return;
        }

        this.boundChangeHandler = (event) => {
            this._handleSortChange(event.target.value);
        };

        this.sortSelect.addEventListener('change', this.boundChangeHandler);
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

        if (typeof this.onSortChange === 'function') {
            this.onSortChange(sortOption);
        }

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

        const sorted = [...pokemonArray];
        const currentLanguage = this.uiController.getCurrentLanguage();

        const sorters = {
            [SORT_OPTIONS.NUMBER_ASC]: () => sortByNumberAsc(sorted),
            [SORT_OPTIONS.NUMBER_DESC]: () => sortByNumberDesc(sorted),
            [SORT_OPTIONS.NAME_ASC]: () => sortByName(sorted, currentLanguage, true),
            [SORT_OPTIONS.NAME_DESC]: () => sortByName(sorted, currentLanguage, false),
            [SORT_OPTIONS.HEIGHT_ASC]: () => sortByHeight(sorted, true),
            [SORT_OPTIONS.HEIGHT_DESC]: () => sortByHeight(sorted, false),
            [SORT_OPTIONS.WEIGHT_ASC]: () => sortByWeight(sorted, true),
            [SORT_OPTIONS.WEIGHT_DESC]: () => sortByWeight(sorted, false),
            [SORT_OPTIONS.STAT_TOTAL]: () => sortByStatTotal(sorted)
        };

        const sorter = sorters[this.currentSortOption] || sorters[SORT_OPTIONS.NUMBER_ASC];
        return sorter();
    }

    /**
     * Announces sort change to screen readers
     * @private
     * @param {string} sortOption - Sort option that was selected
     */
    _announceSortChange(sortOption) {
        const currentLang = this.uiController.getCurrentLanguage();
        const uiText = this.uiController.getCurrentUIText();
        const sortLabelMap = {
            [SORT_OPTIONS.NUMBER_ASC]: uiText.sortNumberAsc,
            [SORT_OPTIONS.NUMBER_DESC]: uiText.sortNumberDesc,
            [SORT_OPTIONS.NAME_ASC]: uiText.sortNameAsc,
            [SORT_OPTIONS.NAME_DESC]: uiText.sortNameDesc,
            [SORT_OPTIONS.HEIGHT_ASC]: uiText.sortHeightAsc,
            [SORT_OPTIONS.HEIGHT_DESC]: uiText.sortHeightDesc,
            [SORT_OPTIONS.WEIGHT_ASC]: uiText.sortWeightAsc,
            [SORT_OPTIONS.WEIGHT_DESC]: uiText.sortWeightDesc,
            [SORT_OPTIONS.STAT_TOTAL]: uiText.sortStatTotal
        };
        const sortText = sortLabelMap[sortOption] || uiText.sortNumberAsc;

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
        return Storage.get(STORAGE_KEYS_SORT.SORT_ORDER, SORT_OPTIONS.NUMBER_ASC);
    }

    /**
     * Saves sort preference to local storage
     * @private
     * @param {string} sortOption - Sort option to save
     */
    _saveSortPreference(sortOption) {
        Storage.set(STORAGE_KEYS_SORT.SORT_ORDER, sortOption);
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
        const sortLabelMap = {
            [SORT_OPTIONS.NUMBER_ASC]: uiText.sortNumberAsc,
            [SORT_OPTIONS.NUMBER_DESC]: uiText.sortNumberDesc,
            [SORT_OPTIONS.NAME_ASC]: uiText.sortNameAsc,
            [SORT_OPTIONS.NAME_DESC]: uiText.sortNameDesc,
            [SORT_OPTIONS.HEIGHT_ASC]: uiText.sortHeightAsc,
            [SORT_OPTIONS.HEIGHT_DESC]: uiText.sortHeightDesc,
            [SORT_OPTIONS.WEIGHT_ASC]: uiText.sortWeightAsc,
            [SORT_OPTIONS.WEIGHT_DESC]: uiText.sortWeightDesc,
            [SORT_OPTIONS.STAT_TOTAL]: uiText.sortStatTotal
        };

        for (const option of options) {
            if (sortLabelMap[option.value]) {
                option.textContent = sortLabelMap[option.value];
            }
        }
    }

    /**
     * Enables sort functionality
     */
    enable() {
        if (this.sortSelect) {
            this.sortSelect.disabled = false;
            this.sortSelect.value = this.currentSortOption;
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
