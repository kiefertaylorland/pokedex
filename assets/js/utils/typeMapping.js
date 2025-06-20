/**
 * Type Mapping Utility - Maps Pokemon type names to consistent CSS classes
 * @module TypeMapping
 */

/**
 * Mapping of Pokemon type names (both English and Japanese) to CSS class names
 * This ensures consistent styling regardless of display language
 */
const TYPE_TO_CLASS_MAP = {
    // English type names
    'grass': 'grass',
    'poison': 'poison',
    'fire': 'fire',
    'flying': 'flying',
    'water': 'water',
    'bug': 'bug',
    'normal': 'normal',
    'electric': 'electric',
    'ground': 'ground',
    'fairy': 'fairy',
    'fighting': 'fighting',
    'psychic': 'psychic',
    'rock': 'rock',
    'steel': 'steel',
    'ice': 'ice',
    'ghost': 'ghost',
    'dragon': 'dragon',
    'dark': 'dark',
    
    // Japanese type names mapped to English class names
    'くさ': 'grass',        // Grass
    'どく': 'poison',       // Poison
    'ほのお': 'fire',       // Fire
    'ひこう': 'flying',     // Flying
    'みず': 'water',        // Water
    'むし': 'bug',          // Bug
    'ノーマル': 'normal',   // Normal
    'でんき': 'electric',   // Electric
    'じめん': 'ground',     // Ground
    'フェアリー': 'fairy',  // Fairy
    'かくとう': 'fighting', // Fighting
    'エスパー': 'psychic',  // Psychic
    'いわ': 'rock',         // Rock
    'はがね': 'steel',      // Steel
    'こおり': 'ice',        // Ice
    'ゴースト': 'ghost',    // Ghost
    'ドラゴン': 'dragon',   // Dragon
    'あく': 'dark'          // Dark
};

/**
 * Gets the CSS class name for a Pokemon type
 * @param {string} typeName - The type name (in any language)
 * @returns {string} CSS class name for the type
 */
export function getTypeClassName(typeName) {
    if (!typeName || typeof typeName !== 'string') {
        return 'normal'; // fallback to normal type
    }
    
    const normalizedType = typeName.toLowerCase().trim();
    return TYPE_TO_CLASS_MAP[normalizedType] || normalizedType.replace(/\s+/g, '-');
}

/**
 * Gets CSS class names for multiple types
 * @param {Array<string>} types - Array of type names
 * @returns {Array<string>} Array of CSS class names
 */
export function getTypeClassNames(types) {
    if (!Array.isArray(types)) {
        return ['normal'];
    }
    
    return types.map(type => getTypeClassName(type));
}
