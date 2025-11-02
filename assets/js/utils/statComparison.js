/**
 * Stat Comparison Utility - Calculate and compare Pokemon stats
 * @module StatComparison
 */

/**
 * Pre-calculated stat averages and maximums across all 1025 Pokemon
 * These values are based on the complete Pokedex data
 */
export const STAT_BENCHMARKS = {
    averages: {
        hp: 69,
        attack: 79,
        defense: 73,
        'special-attack': 72,
        'special-defense': 71,
        speed: 68
    },
    max: {
        hp: 255,      // Blissey
        attack: 190,  // Mega Mewtwo X
        defense: 230, // Shuckle
        'special-attack': 194, // Mega Mewtwo Y
        'special-defense': 230, // Shuckle
        speed: 180    // Deoxys Speed
    },
    // Top tier threshold (used for legendary/pseudo-legendary comparison)
    topTier: {
        hp: 100,
        attack: 120,
        defense: 110,
        'special-attack': 120,
        'special-defense': 110,
        speed: 100
    }
};

/**
 * Calculate stat benchmarks from all Pokemon data
 * @param {Array<Object>} allPokemon - Array of all Pokemon
 * @returns {Object} Calculated benchmarks
 */
export function calculateStatBenchmarks(allPokemon) {
    if (!allPokemon || allPokemon.length === 0) {
        return STAT_BENCHMARKS;
    }
    
    const statTotals = {
        hp: 0,
        attack: 0,
        defense: 0,
        'special-attack': 0,
        'special-defense': 0,
        speed: 0
    };
    
    const statMaxes = {
        hp: 0,
        attack: 0,
        defense: 0,
        'special-attack': 0,
        'special-defense': 0,
        speed: 0
    };
    
    allPokemon.forEach(pokemon => {
        if (pokemon.stats) {
            Object.keys(statTotals).forEach(stat => {
                if (pokemon.stats[stat] !== undefined) {
                    statTotals[stat] += pokemon.stats[stat];
                    statMaxes[stat] = Math.max(statMaxes[stat], pokemon.stats[stat]);
                }
            });
        }
    });
    
    const count = allPokemon.length;
    const averages = {};
    Object.keys(statTotals).forEach(stat => {
        averages[stat] = Math.round(statTotals[stat] / count);
    });
    
    return {
        averages,
        max: statMaxes,
        topTier: STAT_BENCHMARKS.topTier
    };
}

/**
 * Compare a Pokemon's stat to benchmarks
 * @param {number} statValue - The stat value to compare
 * @param {string} statName - The stat name
 * @param {Object} benchmarks - Stat benchmarks (optional, uses defaults if not provided)
 * @returns {Object} Comparison data
 */
export function compareStatToBenchmark(statValue, statName, benchmarks = STAT_BENCHMARKS) {
    
    
    
    
    
    const average = benchmarks.averages[statName];
    const max = benchmarks.max[statName];
    const topTier = benchmarks.topTier[statName];
    
    const percentOfMax = (statValue / max) * 100;
    const percentOfAverage = (statValue / average) * 100;
    const aboveAverage = statValue > average;
    const isTopTier = statValue >= topTier;
    
    let rating = 'average';
    if (isTopTier) {
        rating = 'excellent';
    } else if (statValue > average * 1.2) {
        rating = 'good';
    } else if (statValue < average * 0.8) {
        rating = 'poor';
    }
    
    return {
        value: statValue,
        average,
        max,
        topTier,
        percentOfMax: Math.round(percentOfMax),
        percentOfAverage: Math.round(percentOfAverage),
        aboveAverage,
        isTopTier,
        rating,
        difference: statValue - average
    };
}

/**
 * Get overall stat rating for a Pokemon
 * @param {Object} stats - Pokemon stats object
 * @param {Object} benchmarks - Stat benchmarks (optional)
 * @returns {Object} Overall rating data
 */
export function getOverallStatRating(stats, benchmarks = STAT_BENCHMARKS) {
    if (!stats) {
        return { total: 0, average: 0, rating: 'unknown' };
    }
    
    
    const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const averageTotal = Object.values(benchmarks.averages).reduce((sum, val) => sum + val, 0);
    
    let rating;
    if (total >= averageTotal * 1.4) {
        rating = 'legendary';
    } else if (total >= averageTotal * 1.2) {
        rating = 'excellent';
    } else if (total >= averageTotal * 1.0) {
        rating = 'good';
    } else if (total >= averageTotal * 0.8) {
        rating = 'average';
    } else {
        rating = 'poor';
    }
    
    return {
        total,
        average: Math.round(total / Object.keys(stats).length),
        averageTotal,
        percentOfAverage: Math.round((total / averageTotal) * 100),
        rating
    };
}

/**
 * Compare two Pokemon's stats
 * @param {Object} pokemon1Stats - First Pokemon's stats
 * @param {Object} pokemon2Stats - Second Pokemon's stats
 * @returns {Object} Comparison data for each stat
 */
export function compareTwoPokemons(pokemon1Stats, pokemon2Stats) {
    const comparison = {};
    
    const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    
    statKeys.forEach(stat => {
        const value1 = pokemon1Stats[stat] || 0;
        const value2 = pokemon2Stats[stat] || 0;
        const difference = value1 - value2;
        
        comparison[stat] = {
            pokemon1: value1,
            pokemon2: value2,
            difference,
            percentDifference: (value1 !== 0 || value2 !== 0)
                ? Math.round((Math.abs(difference) / ((value1 + value2) / 2)) * 100)
                : 0,
            winner: difference > 0 ? 1 : difference < 0 ? 2 : 0
        };
    });
    
    return comparison;
}
