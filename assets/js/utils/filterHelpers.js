/**
 * Filter Helper Utilities
 * Shared filtering logic used by FilterController and PokedexApp
 * @module FilterHelpers
 */

/**
 * Filters a Pokemon by ability
 * @param {Object} pokemon - Pokemon data
 * @param {string} abilityFilter - Ability to filter by
 * @param {string} language - Current language ('en' or 'jp')
 * @returns {boolean} True if Pokemon matches the ability filter
 */
export function filterByAbility(pokemon, abilityFilter, language) {
    if (!abilityFilter || abilityFilter === 'all') {
        return true;
    }
    
    const abilities = language === 'jp' ? pokemon.abilities_jp : pokemon.abilities_en;
    if (!abilities) {
        return false;
    }
    
    return abilities.some(ability => 
        ability.toLowerCase().includes(abilityFilter.toLowerCase())
    );
}

/**
 * Filters a Pokemon by base stat total range
 * @param {Object} pokemon - Pokemon data
 * @param {number} minStatTotal - Minimum base stat total
 * @param {number} maxStatTotal - Maximum base stat total
 * @returns {boolean} True if Pokemon matches the stat total range
 */
export function filterByBaseStatTotal(pokemon, minStatTotal, maxStatTotal) {
    const baseStatTotal = pokemon.base_stat_total || 0;
    return baseStatTotal >= minStatTotal && baseStatTotal <= maxStatTotal;
}

/**
 * Filters a Pokemon by move type
 * @param {Object} pokemon - Pokemon data
 * @param {string} moveTypeFilter - Move type to filter by
 * @param {string} language - Current language ('en' or 'jp')
 * @returns {boolean} True if Pokemon matches the move type filter
 */
export function filterByMoveType(pokemon, moveTypeFilter, language) {
    if (!moveTypeFilter || moveTypeFilter === 'all') {
        return true;
    }
    
    const moves = pokemon.moves || [];
    const moveTypes = language === 'jp' 
        ? moves.map(m => m.type_jp) 
        : moves.map(m => m.type_en);
    
    return moveTypes.some(type => 
        type && type.toLowerCase() === moveTypeFilter.toLowerCase()
    );
}

/**
 * Gets the evolution stage of a Pokemon
 * @param {Object} pokemon - Pokemon data
 * @returns {string} Evolution stage: 'basic', 'stage1', or 'stage2'
 */
export function getEvolutionStage(pokemon) {
    const evolutionChain = pokemon.evolution_chain || [];
    
    if (evolutionChain.length === 0) {
        return 'basic';
    }

    const position = evolutionChain.findIndex(evo => evo.id === pokemon.id);
    
    if (position === -1) {
        return 'basic';
    }

    if (position === 0) {
        return 'basic';
    } else if (position === 1) {
        return 'stage1';
    } else {
        return 'stage2';
    }
}

/**
 * Filters a Pokemon by evolution stage
 * @param {Object} pokemon - Pokemon data
 * @param {string} evolutionStageFilter - Evolution stage to filter by
 * @returns {boolean} True if Pokemon matches the evolution stage filter
 */
export function filterByEvolutionStage(pokemon, evolutionStageFilter) {
    if (!evolutionStageFilter || evolutionStageFilter === 'all') {
        return true;
    }
    
    const stage = getEvolutionStage(pokemon);
    return stage === evolutionStageFilter;
}

/**
 * Applies all filters to a Pokemon
 * @param {Object} pokemon - Pokemon data
 * @param {Object} filters - Filter configuration object
 * @param {string} language - Current language ('en' or 'jp')
 * @returns {boolean} True if Pokemon passes all filters
 */
export function applyAllFilters(pokemon, filters, language) {
    // Filter by ability
    if (!filterByAbility(pokemon, filters.ability, language)) {
        return false;
    }

    // Filter by base stat total
    if (!filterByBaseStatTotal(pokemon, filters.minStatTotal, filters.maxStatTotal)) {
        return false;
    }

    // Filter by move type
    if (!filterByMoveType(pokemon, filters.moveType, language)) {
        return false;
    }

    // Filter by evolution stage
    if (!filterByEvolutionStage(pokemon, filters.evolutionStage)) {
        return false;
    }

    return true;
}
