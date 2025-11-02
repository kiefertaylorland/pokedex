/**
 * Filter Controller - Handles advanced Pokemon filtering
 * @module FilterController
 */


/**
 * Manages advanced filtering functionality
 */
export class FilterController {
    constructor(dataManager, uiController, onFilterResults) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.onFilterResults = onFilterResults;
        
        // Current filter state
        this.filters = {
            ability: 'all',
            minStatTotal: 0,
            maxStatTotal: 999,
            moveType: 'all',
            evolutionStage: 'all'
        };
        
        this._bindEvents();
    }

    /**
     * Binds filter UI events
     * @private
     */
    _bindEvents() {
        // Ability filter
        const abilityFilter = document.getElementById('filter-ability');
        if (abilityFilter) {
            abilityFilter.addEventListener('change', () => {
                this.filters.ability = abilityFilter.value;
                this._applyFilters();
            });
        }

        // Base stat total range
        const minStatFilter = document.getElementById('filter-min-stat');
        const maxStatFilter = document.getElementById('filter-max-stat');
        if (minStatFilter) {
            minStatFilter.addEventListener('input', () => {
                this.filters.minStatTotal = parseInt(minStatFilter.value, 10) || 0;
                this._updateStatRangeDisplay();
                this._applyFilters();
            });
        }
        if (maxStatFilter) {
            maxStatFilter.addEventListener('input', () => {
                this.filters.maxStatTotal = parseInt(maxStatFilter.value, 10) || 999;
                this._updateStatRangeDisplay();
                this._applyFilters();
            });
        }

        // Move type filter
        const moveTypeFilter = document.getElementById('filter-move-type');
        if (moveTypeFilter) {
            moveTypeFilter.addEventListener('change', () => {
                this.filters.moveType = moveTypeFilter.value;
                this._applyFilters();
            });
        }

        // Evolution stage filter
        const evolutionStageFilter = document.getElementById('filter-evolution-stage');
        if (evolutionStageFilter) {
            evolutionStageFilter.addEventListener('change', () => {
                this.filters.evolutionStage = evolutionStageFilter.value;
                this._applyFilters();
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }
    }

    /**
     * Updates the stat range display
     * @private
     */
    _updateStatRangeDisplay() {
        const display = document.getElementById('stat-range-display');
        if (display) {
            display.textContent = `${this.filters.minStatTotal} - ${this.filters.maxStatTotal}`;
        }
    }

    /**
     * Applies current filters to Pokemon data
     * @private
     */
    _applyFilters() {
        if (!this.dataManager.isDataLoaded()) {
            return;
        }

        const allPokemon = this.dataManager.getAllPokemon();
        const currentLanguage = this.uiController.getCurrentLanguage();
        
        const filtered = allPokemon.filter(pokemon => {
            // Filter by ability
            if (this.filters.ability && this.filters.ability !== 'all') {
                const abilities = currentLanguage === 'jp' ? pokemon.abilities_jp : pokemon.abilities_en;
                if (!abilities || !abilities.some(ability => 
                    ability.toLowerCase().includes(this.filters.ability.toLowerCase())
                )) {
                    return false;
                }
            }

            // Filter by base stat total
            const baseStatTotal = pokemon.base_stat_total || 0;
            if (baseStatTotal < this.filters.minStatTotal || baseStatTotal > this.filters.maxStatTotal) {
                return false;
            }

            // Filter by move type
            if (this.filters.moveType && this.filters.moveType !== 'all') {
                const moves = pokemon.moves || [];
                const moveTypes = currentLanguage === 'jp' 
                    ? moves.map(m => m.type_jp) 
                    : moves.map(m => m.type_en);
                
                if (!moveTypes.some(type => 
                    type && type.toLowerCase() === this.filters.moveType.toLowerCase()
                )) {
                    return false;
                }
            }

            // Filter by evolution stage
            if (this.filters.evolutionStage && this.filters.evolutionStage !== 'all') {
                const stage = this._getEvolutionStage(pokemon);
                if (stage !== this.filters.evolutionStage) {
                    return false;
                }
            }

            return true;
        });

        // Call the results callback
        if (typeof this.onFilterResults === 'function') {
            this.onFilterResults(filtered, this.filters);
        }

        // Announce results to screen readers
        this._announceFilterResults(filtered.length);
    }

    /**
     * Determines the evolution stage of a Pokemon
     * @private
     * @param {Object} pokemon - Pokemon data
     * @returns {string} Evolution stage: 'basic', 'stage1', 'stage2', or 'all'
     */
    _getEvolutionStage(pokemon) {
        const evolutionChain = pokemon.evolution_chain || [];
        
        if (evolutionChain.length === 0) {
            return 'basic'; // No evolution data = basic
        }

        // Find position in evolution chain
        const position = evolutionChain.findIndex(evo => evo.id === pokemon.id);
        
        if (position === -1) {
            return 'basic'; // Not in chain = basic
        }

        // Determine stage based on position
        if (position === 0) {
            return 'basic'; // First in chain
        } else if (position === 1) {
            return 'stage1'; // Second in chain
        } else {
            return 'stage2'; // Third or later in chain
        }
    }

    /**
     * Announces filter results to screen readers
     * @private
     * @param {number} resultCount - Number of filtered results
     */
    _announceFilterResults(resultCount) {
        const currentLang = this.uiController.getCurrentLanguage();
        const message = currentLang === 'jp' 
            ? `フィルター適用後: ${resultCount}匹のポケモン`
            : `Filtered results: ${resultCount} Pokémon`;
        
        this.uiController.announceToScreenReader(message);
    }

    /**
     * Clears all filters
     */
    clearFilters() {
        // Reset filter state
        this.filters = {
            ability: 'all',
            minStatTotal: 0,
            maxStatTotal: 999,
            moveType: 'all',
            evolutionStage: 'all'
        };

        // Reset UI elements
        const abilityFilter = document.getElementById('filter-ability');
        if (abilityFilter) abilityFilter.value = 'all';

        const minStatFilter = document.getElementById('filter-min-stat');
        if (minStatFilter) minStatFilter.value = '0';

        const maxStatFilter = document.getElementById('filter-max-stat');
        if (maxStatFilter) maxStatFilter.value = '999';

        const moveTypeFilter = document.getElementById('filter-move-type');
        if (moveTypeFilter) moveTypeFilter.value = 'all';

        const evolutionStageFilter = document.getElementById('filter-evolution-stage');
        if (evolutionStageFilter) evolutionStageFilter.value = 'all';

        this._updateStatRangeDisplay();
        this._applyFilters();
    }

    /**
     * Gets unique abilities from all Pokemon
     * @returns {Array<string>} Array of unique abilities
     */
    getUniqueAbilities() {
        const allPokemon = this.dataManager.getAllPokemon();
        const currentLanguage = this.uiController.getCurrentLanguage();
        const abilities = new Set();

        allPokemon.forEach(pokemon => {
            const pokemonAbilities = currentLanguage === 'jp' ? pokemon.abilities_jp : pokemon.abilities_en;
            if (pokemonAbilities) {
                pokemonAbilities.forEach(ability => abilities.add(ability));
            }
        });

        return Array.from(abilities).sort();
    }

    /**
     * Gets unique move types from all Pokemon
     * @returns {Array<string>} Array of unique move types
     */
    getUniqueMoveTypes() {
        const allPokemon = this.dataManager.getAllPokemon();
        const currentLanguage = this.uiController.getCurrentLanguage();
        const types = new Set();

        allPokemon.forEach(pokemon => {
            const moves = pokemon.moves || [];
            moves.forEach(move => {
                const moveType = currentLanguage === 'jp' ? move.type_jp : move.type_en;
                if (moveType) {
                    types.add(moveType);
                }
            });
        });

        return Array.from(types).sort();
    }

    /**
     * Populates filter dropdowns with options
     */
    populateFilterOptions() {
        const currentLanguage = this.uiController.getCurrentLanguage();
        
        // Populate abilities
        const abilityFilter = document.getElementById('filter-ability');
        if (abilityFilter) {
            const abilities = this.getUniqueAbilities();
            abilityFilter.innerHTML = `<option value="all">${currentLanguage === 'jp' ? 'すべての特性' : 'All Abilities'}</option>`;
            abilities.forEach(ability => {
                if (ability && ability !== 'Unknown' && ability !== '不明') {
                    const option = document.createElement('option');
                    option.value = ability;
                    option.textContent = ability;
                    abilityFilter.appendChild(option);
                }
            });
        }

        // Populate move types
        const moveTypeFilter = document.getElementById('filter-move-type');
        if (moveTypeFilter) {
            const types = this.getUniqueMoveTypes();
            moveTypeFilter.innerHTML = `<option value="all">${currentLanguage === 'jp' ? 'すべてのタイプ' : 'All Move Types'}</option>`;
            types.forEach(type => {
                if (type) {
                    const option = document.createElement('option');
                    option.value = type;
                    option.textContent = type;
                    moveTypeFilter.appendChild(option);
                }
            });
        }

        this._updateStatRangeDisplay();
    }

    /**
     * Gets current filter state
     * @returns {Object} Current filters
     */
    getCurrentFilters() {
        return { ...this.filters };
    }

    /**
     * Checks if any filters are active
     * @returns {boolean} True if filters are active
     */
    hasActiveFilters() {
        return this.filters.ability !== 'all' ||
               this.filters.minStatTotal > 0 ||
               this.filters.maxStatTotal < 999 ||
               this.filters.moveType !== 'all' ||
               this.filters.evolutionStage !== 'all';
    }
}
