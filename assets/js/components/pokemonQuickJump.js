/**
 * Pokemon Quick Jump Component - Alphabetical fast navigation rail
 * @module PokemonQuickJump
 */

import { SORT_OPTIONS } from '../constants.js';
import { createSafeElement } from '../utils/security.js';

const MIN_ITEMS_TO_SHOW = 20;
const MODE_NONE = 'none';
const MODE_NAME = 'name';
const MODE_NUMBER = 'number';
const MODE_HEIGHT = 'height';
const MODE_WEIGHT = 'weight';
const MODE_STAT_TOTAL = 'stat-total';
const NAME_SORT_OPTIONS = new Set([SORT_OPTIONS.NAME_ASC, SORT_OPTIONS.NAME_DESC]);
const NUMBER_SORT_OPTIONS = new Set([SORT_OPTIONS.NUMBER_ASC, SORT_OPTIONS.NUMBER_DESC]);
const HEIGHT_SORT_OPTIONS = new Set([SORT_OPTIONS.HEIGHT_ASC, SORT_OPTIONS.HEIGHT_DESC]);
const WEIGHT_SORT_OPTIONS = new Set([SORT_OPTIONS.WEIGHT_ASC, SORT_OPTIONS.WEIGHT_DESC]);
const GENERATION_RANGES = [
    { generation: 1, start: 1, end: 151 },
    { generation: 2, start: 152, end: 251 },
    { generation: 3, start: 252, end: 386 },
    { generation: 4, start: 387, end: 493 },
    { generation: 5, start: 494, end: 649 },
    { generation: 6, start: 650, end: 721 },
    { generation: 7, start: 722, end: 809 },
    { generation: 8, start: 810, end: 905 },
    { generation: 9, start: 906, end: 1025 }
];
const HEIGHT_BUCKETS = [
    { label: '<0.5m', min: 0, max: 0.5 },
    { label: '0.5-0.9m', min: 0.5, max: 1.0 },
    { label: '1.0-1.4m', min: 1.0, max: 1.5 },
    { label: '1.5-1.9m', min: 1.5, max: 2.0 },
    { label: '2.0-2.9m', min: 2.0, max: 3.0 },
    { label: '3.0m+', min: 3.0, max: null }
];
const WEIGHT_BUCKETS = [
    { label: '<10kg', min: 0, max: 10 },
    { label: '10-24.9kg', min: 10, max: 25 },
    { label: '25-49.9kg', min: 25, max: 50 },
    { label: '50-99.9kg', min: 50, max: 100 },
    { label: '100-199.9kg', min: 100, max: 200 },
    { label: '200kg+', min: 200, max: null }
];
const STAT_TOTAL_BUCKETS = [
    { label: '<300', min: 0, max: 300 },
    { label: '300-399', min: 300, max: 400 },
    { label: '400-499', min: 400, max: 500 },
    { label: '500-599', min: 500, max: 600 },
    { label: '600+', min: 600, max: null }
];

/**
 * Provides an A-Z quick jump rail for long result sets
 */
export class PokemonQuickJump {
    constructor(dataManager, uiController, cardRenderer) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.cardRenderer = cardRenderer;
        this.railElement = null;
        this.jumpEntries = [];
        this.lastPokemonList = [];
        this.lastSortOption = '';
        this.mode = MODE_NONE;
    }

    /**
     * Initializes quick-jump UI and listeners
     */
    initialize() {
        if (this.railElement) {
            return;
        }

        const rail = createSafeElement('nav');
        rail.id = 'quick-jump-rail';
        rail.classList.add('quick-jump-rail', 'quick-jump-hidden');
        rail.setAttribute('aria-label', this._getRailLabel());
        document.body.appendChild(rail);
        this.railElement = rail;

    }

    /**
     * Rebuilds quick-jump entries from current render data
     * @param {Array<Object>} pokemonList - Rendered list
     * @param {string} sortOption - Current sort option
     */
    refresh(pokemonList, sortOption) {
        if (!this.railElement) {
            this.initialize();
        }

        this.lastPokemonList = Array.isArray(pokemonList) ? pokemonList : [];
        this.lastSortOption = sortOption || '';

        this.mode = this._resolveMode(this.lastSortOption);
        this.jumpEntries = this._buildEntries(this.lastPokemonList, this.mode);

        this._renderButtons();
        this._updateVisibility();
    }

    /**
     * Refreshes labels after language changes
     */
    refreshUI() {
        if (!this.railElement) {
            return;
        }

        this.railElement.setAttribute('aria-label', this._getRailLabel());
        this.refresh(this.lastPokemonList, this.lastSortOption);
    }

    /**
     * Removes listeners and created DOM
     */
    destroy() {
        if (this.railElement) {
            this.railElement.remove();
            this.railElement = null;
        }
        this.jumpEntries = [];
    }

    _resolveMode(sortOption) {
        if (NAME_SORT_OPTIONS.has(sortOption)) {
            return MODE_NAME;
        }
        if (NUMBER_SORT_OPTIONS.has(sortOption)) {
            return MODE_NUMBER;
        }
        if (HEIGHT_SORT_OPTIONS.has(sortOption)) {
            return MODE_HEIGHT;
        }
        if (WEIGHT_SORT_OPTIONS.has(sortOption)) {
            return MODE_WEIGHT;
        }
        if (sortOption === SORT_OPTIONS.STAT_TOTAL) {
            return MODE_STAT_TOTAL;
        }
        return MODE_NONE;
    }

    _buildEntries(pokemonList, mode) {
        if (mode === MODE_NAME) {
            return this._buildNameEntries(pokemonList);
        }
        if (mode === MODE_NUMBER) {
            return this._buildGenerationEntries(pokemonList);
        }
        if (mode === MODE_HEIGHT) {
            return this._buildBucketEntries(pokemonList, HEIGHT_BUCKETS, (pokemon) => Number(pokemon?.height));
        }
        if (mode === MODE_WEIGHT) {
            return this._buildBucketEntries(pokemonList, WEIGHT_BUCKETS, (pokemon) => Number(pokemon?.weight));
        }
        if (mode === MODE_STAT_TOTAL) {
            return this._buildBucketEntries(
                pokemonList,
                STAT_TOTAL_BUCKETS,
                (pokemon) => Object.values(pokemon?.stats || {}).reduce(
                    (sum, statValue) => sum + (typeof statValue === 'number' ? statValue : 0),
                    0
                )
            );
        }
        return [];
    }

    _resolveJumpLetter(pokemon) {
        const nameSource = String(pokemon?.name_en || pokemon?.name_romaji || '').trim();
        if (!nameSource) {
            return '';
        }

        const letter = nameSource.charAt(0).toUpperCase();
        return /^[A-Z]$/.test(letter) ? letter : '';
    }

    _buildNameEntries(pokemonList) {
        const targetByLetter = new Map();
        pokemonList.forEach((pokemon) => {
            const letter = this._resolveJumpLetter(pokemon);
            if (letter && !targetByLetter.has(letter)) {
                targetByLetter.set(letter, pokemon.id);
            }
        });

        return Array.from(targetByLetter.keys())
            .sort((a, b) => a.localeCompare(b))
            .map((label) => ({ label, targetId: targetByLetter.get(label) }));
    }

    _buildGenerationEntries(pokemonList) {
        return GENERATION_RANGES
            .map(({ generation, start, end }) => {
                const firstMatch = pokemonList.find((pokemon) => {
                    const id = Number(pokemon?.id);
                    return Number.isFinite(id) && id >= start && id <= end;
                });

                if (!firstMatch) {
                    return null;
                }

                return { label: `G${generation}`, targetId: firstMatch.id, generation, ariaValue: String(generation) };
            })
            .filter(Boolean);
    }

    _buildBucketEntries(pokemonList, bucketDefs, valueSelector) {
        const orderedBuckets = this._isDescendingSort() ? [...bucketDefs].reverse() : bucketDefs;
        return orderedBuckets
            .map((bucket) => {
                const firstMatch = pokemonList.find((pokemon) => {
                    const value = valueSelector(pokemon);
                    if (!Number.isFinite(value)) {
                        return false;
                    }
                    if (bucket.max === null) {
                        return value >= bucket.min;
                    }
                    return value >= bucket.min && value < bucket.max;
                });

                if (!firstMatch) {
                    return null;
                }

                return { label: bucket.label, targetId: firstMatch.id, ariaValue: bucket.label };
            })
            .filter(Boolean);
    }

    _renderButtons() {
        if (!this.railElement) {
            return;
        }

        this.railElement.replaceChildren();
        this.jumpEntries.forEach(({ label, targetId, ariaValue }) => {
            const button = createSafeElement('button', label);
            button.classList.add('quick-jump-btn');
            if (label.length <= 2) {
                button.classList.add('quick-jump-btn-compact');
            }
            button.type = 'button';
            const ariaTemplate = this._getAriaTemplateByMode();
            const resolvedAriaValue = ariaValue || label;
            button.setAttribute('aria-label', this._formatText(ariaTemplate, { value: resolvedAriaValue, letter: label }));
            button.title = this._formatText(ariaTemplate, { value: resolvedAriaValue, letter: label });
            button.addEventListener('click', () => {
                if (!targetId || !this.cardRenderer) {
                    return;
                }
                this.cardRenderer.scrollToCard(targetId);
            });
            this.railElement.appendChild(button);
        });
    }

    _updateVisibility() {
        if (!this.railElement) {
            return;
        }

        const shouldShow = this.mode !== MODE_NONE
            && this.jumpEntries.length > 0
            && this.lastPokemonList.length >= MIN_ITEMS_TO_SHOW;

        this.railElement.classList.toggle('quick-jump-visible', shouldShow);
        this.railElement.classList.toggle('quick-jump-hidden', !shouldShow);
        this.railElement.setAttribute('aria-hidden', String(!shouldShow));
    }

    _getRailLabel() {
        const uiText = this.uiController.getCurrentUIText();
        if (this.mode === MODE_NUMBER) {
            return uiText.quickJumpRailLabelGeneration || 'Quick jump by generation';
        }
        if (this.mode === MODE_HEIGHT) {
            return uiText.quickJumpRailLabelHeight || 'Quick jump by height';
        }
        if (this.mode === MODE_WEIGHT) {
            return uiText.quickJumpRailLabelWeight || 'Quick jump by weight';
        }
        if (this.mode === MODE_STAT_TOTAL) {
            return uiText.quickJumpRailLabelStatTotal || 'Quick jump by stat total';
        }
        return uiText.quickJumpRailLabel || 'Quick jump by letter';
    }

    _getJumpLetterAriaLabel() {
        const uiText = this.uiController.getCurrentUIText();
        return uiText.quickJumpToLetter || 'Jump to {letter}';
    }

    _getJumpNumberAriaLabel() {
        const uiText = this.uiController.getCurrentUIText();
        return uiText.quickJumpToGeneration || 'Jump to Generation {value}';
    }

    _getJumpBucketAriaLabel() {
        const uiText = this.uiController.getCurrentUIText();
        return uiText.quickJumpToBucket || 'Jump to range {value}';
    }

    _getAriaTemplateByMode() {
        if (this.mode === MODE_NAME) {
            return this._getJumpLetterAriaLabel();
        }
        if (this.mode === MODE_NUMBER) {
            return this._getJumpNumberAriaLabel();
        }
        return this._getJumpBucketAriaLabel();
    }

    _isDescendingSort() {
        return this.lastSortOption === SORT_OPTIONS.NUMBER_DESC
            || this.lastSortOption === SORT_OPTIONS.HEIGHT_DESC
            || this.lastSortOption === SORT_OPTIONS.WEIGHT_DESC
            || this.lastSortOption === SORT_OPTIONS.STAT_TOTAL;
    }

    _formatText(template, values) {
        return Object.entries(values).reduce(
            (text, [key, value]) => text.replace(`{${key}}`, String(value)),
            template
        );
    }
}
