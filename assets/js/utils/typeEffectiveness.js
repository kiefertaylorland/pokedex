/**
 * Type Effectiveness Utility - Pokemon type matchup data and calculations
 * @module TypeEffectiveness
 */

/**
 * Type effectiveness chart
 * Maps attacking type -> defending type -> effectiveness multiplier
 * 2.0 = super effective, 0.5 = not very effective, 0 = no effect
 */
export const TYPE_CHART = {
    'normal': {
        'rock': 0.5, 'ghost': 0, 'steel': 0.5
    },
    'fire': {
        'fire': 0.5, 'water': 0.5, 'grass': 2.0, 'ice': 2.0, 'bug': 2.0, 'rock': 0.5, 'dragon': 0.5, 'steel': 2.0
    },
    'water': {
        'fire': 2.0, 'water': 0.5, 'grass': 0.5, 'ground': 2.0, 'rock': 2.0, 'dragon': 0.5
    },
    'electric': {
        'water': 2.0, 'electric': 0.5, 'grass': 0.5, 'ground': 0, 'flying': 2.0, 'dragon': 0.5
    },
    'grass': {
        'fire': 0.5, 'water': 2.0, 'grass': 0.5, 'poison': 0.5, 'ground': 2.0, 'flying': 0.5, 'bug': 0.5, 'rock': 2.0, 'dragon': 0.5, 'steel': 0.5
    },
    'ice': {
        'fire': 0.5, 'water': 0.5, 'grass': 2.0, 'ice': 0.5, 'ground': 2.0, 'flying': 2.0, 'dragon': 2.0, 'steel': 0.5
    },
    'fighting': {
        'normal': 2.0, 'ice': 2.0, 'poison': 0.5, 'flying': 0.5, 'psychic': 0.5, 'bug': 0.5, 'rock': 2.0, 'ghost': 0, 'dark': 2.0, 'steel': 2.0, 'fairy': 0.5
    },
    'poison': {
        'grass': 2.0, 'poison': 0.5, 'ground': 0.5, 'rock': 0.5, 'ghost': 0.5, 'steel': 0, 'fairy': 2.0
    },
    'ground': {
        'fire': 2.0, 'electric': 2.0, 'grass': 0.5, 'poison': 2.0, 'flying': 0, 'bug': 0.5, 'rock': 2.0, 'steel': 2.0
    },
    'flying': {
        'electric': 0.5, 'grass': 2.0, 'fighting': 2.0, 'bug': 2.0, 'rock': 0.5, 'steel': 0.5
    },
    'psychic': {
        'fighting': 2.0, 'poison': 2.0, 'psychic': 0.5, 'dark': 0, 'steel': 0.5
    },
    'bug': {
        'fire': 0.5, 'grass': 2.0, 'fighting': 0.5, 'poison': 0.5, 'flying': 0.5, 'psychic': 2.0, 'ghost': 0.5, 'dark': 2.0, 'steel': 0.5, 'fairy': 0.5
    },
    'rock': {
        'fire': 2.0, 'ice': 2.0, 'fighting': 0.5, 'ground': 0.5, 'flying': 2.0, 'bug': 2.0, 'steel': 0.5
    },
    'ghost': {
        'normal': 0, 'psychic': 2.0, 'ghost': 2.0, 'dark': 0.5
    },
    'dragon': {
        'dragon': 2.0, 'steel': 0.5, 'fairy': 0
    },
    'dark': {
        'fighting': 0.5, 'psychic': 2.0, 'ghost': 2.0, 'dark': 0.5, 'fairy': 0.5
    },
    'steel': {
        'fire': 0.5, 'water': 0.5, 'electric': 0.5, 'ice': 2.0, 'rock': 2.0, 'steel': 0.5, 'fairy': 2.0
    },
    'fairy': {
        'fire': 0.5, 'fighting': 2.0, 'poison': 0.5, 'dragon': 2.0, 'dark': 2.0, 'steel': 0.5
    }
};

/**
 * Get effectiveness of attacking type against defending type(s)
 * @param {string} attackingType - The attacking type
 * @param {Array<string>} defendingTypes - Array of defending types
 * @returns {number} Combined effectiveness multiplier
 */
export function getEffectiveness(attackingType, defendingTypes) {
    const normalizedAttacking = attackingType.toLowerCase().trim();
    
    if (!TYPE_CHART[normalizedAttacking]) {
        return 1.0; // Neutral if type not found
    }
    
    let effectiveness = 1.0;
    defendingTypes.forEach(defendingType => {
        const normalizedDefending = defendingType.toLowerCase().trim();
        const typeMatchup = TYPE_CHART[normalizedAttacking][normalizedDefending];
        
        if (typeMatchup !== undefined) {
            effectiveness *= typeMatchup;
        }
    });
    
    return effectiveness;
}

/**
 * Get all type matchups for a Pokemon's types
 * @param {Array<string>} pokemonTypes - Pokemon's types
 * @returns {Object} Object with weaknesses, resistances, and immunities
 */
export function getTypeMatchups(pokemonTypes) {
    const matchups = {
        weaknesses: {},      // > 1.0
        resistances: {},     // < 1.0 but > 0
        immunities: [],      // = 0
        neutral: []          // = 1.0
    };
    
    // All possible types
    const allTypes = Object.keys(TYPE_CHART);
    
    allTypes.forEach(attackingType => {
        const effectiveness = getEffectiveness(attackingType, pokemonTypes);
        
        if (effectiveness === 0) {
            matchups.immunities.push(attackingType);
        } else if (effectiveness > 1.0) {
            matchups.weaknesses[attackingType] = effectiveness;
        } else if (effectiveness < 1.0) {
            matchups.resistances[attackingType] = effectiveness;
        } else {
            matchups.neutral.push(attackingType);
        }
    });
    
    return matchups;
}

/**
 * Get effectiveness description text
 * @param {number} effectiveness - Effectiveness multiplier
 * @returns {string} Description text
 */
export function getEffectivenessText(effectiveness) {
    if (effectiveness === 0) return 'No Effect';
    if (effectiveness >= 4.0) return 'Super Effective (4x)';
    if (effectiveness >= 2.0) return 'Super Effective (2x)';
    if (effectiveness <= 0.25) return 'Highly Resistant (0.25x)';
    if (effectiveness <= 0.5) return 'Resistant (0.5x)';
    return 'Normal';
}

/**
 * Get all types list
 * @returns {Array<string>} Array of all type names
 */
export function getAllTypes() {
    return Object.keys(TYPE_CHART);
}
