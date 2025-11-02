/**
 * Pokemon Data Manager - Handles data fetching, caching, and management
 * @module PokemonDataManager
 */

import { DATA } from '../constants.js';

/**
 * Manages Pokemon data operations including fetching and caching
 */
export class PokemonDataManager {
    constructor() {
        this.allPokemonData = [];
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Loads Pokemon data from JSON file
     * @returns {Promise<Array>} Array of Pokemon data
     * @throws {Error} If data loading fails
     */
    async loadPokemonData() {
        // Prevent multiple concurrent loads
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        if (this.isLoaded) {
            return this.allPokemonData;
        }

        this.loadingPromise = this._fetchPokemonData();
        
        try {
            this.allPokemonData = await this.loadingPromise;
            this.isLoaded = true;
            return this.allPokemonData;
        } catch (error) {
            this.loadingPromise = null;
            throw error;
        }
    }

    /**
     * Private method to fetch Pokemon data
     * @private
     * @returns {Promise<Array>} Pokemon data array
     */
    async _fetchPokemonData() {
        try {
            const response = await fetch(DATA.JSON_FILE);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid data format: expected array');
            }

            return data;
        } catch (error) {
            console.error('Failed to load Pokemon data:', error);
            throw new Error('Could not load Pokémon data. Please check your connection and try again.');
        }
    }

    /**
     * Gets all Pokemon data (must call loadPokemonData first)
     * @returns {Array} Array of Pokemon data
     */
    getAllPokemon() {
        return this.allPokemonData;
    }

    /**
     * Finds a Pokemon by ID
     * @param {number} id - Pokemon ID
     * @returns {Object|null} Pokemon data or null if not found
     */
    getPokemonById(id) {
        return this.allPokemonData.find(pokemon => pokemon.id === parseInt(id, 10)) || null;
    }

    /**
     * Calculates fuzzy match score between search term and target string
     * @private
     * @param {string} searchTerm - Search term (lowercase)
     * @param {string} target - Target string to match (lowercase)
     * @returns {number} Match score (higher is better, 0 means no match)
     */
    _fuzzyMatchScore(searchTerm, target) {
        if (!searchTerm || !target) {
            return 0;
        }

        // Exact match gets highest score
        if (target === searchTerm) {
            return 1000;
        }

        // Substring match (consecutive characters) gets high score
        if (target.includes(searchTerm)) {
            // Bonus if it starts with the search term
            if (target.startsWith(searchTerm)) {
                return 900 + (100 / target.length); // Shorter names rank higher
            }
            return 700 + (100 / target.length);
        }

        // Fuzzy match (non-consecutive characters in order)
        let searchIndex = 0;
        let targetIndex = 0;
        let matchedPositions = [];

        while (searchIndex < searchTerm.length && targetIndex < target.length) {
            if (searchTerm[searchIndex] === target[targetIndex]) {
                matchedPositions.push(targetIndex);
                searchIndex++;
            }
            targetIndex++;
        }

        // If we didn't match all search characters, no match
        if (searchIndex < searchTerm.length) {
            return 0;
        }

        // Calculate score based on how close together the matched characters are
        // and bonus for matches at the start
        let score = 500; // Base fuzzy match score
        
        // Bonus if first character matches
        if (matchedPositions[0] === 0) {
            score += 100;
        }

        // Calculate average distance between matched characters (lower is better)
        if (matchedPositions.length > 1) {
            let totalDistance = 0;
            for (let i = 1; i < matchedPositions.length; i++) {
                totalDistance += matchedPositions[i] - matchedPositions[i - 1];
            }
            const avgDistance = totalDistance / (matchedPositions.length - 1);
            // Subtract score based on average distance (max 200 points)
            score -= Math.min(avgDistance * 10, 200);
        }

        // Prefer shorter strings
        score += 100 / target.length;

        return Math.max(score, 1); // Ensure at least 1 for valid fuzzy matches
    }

    /**
     * Searches Pokemon by name or ID with fuzzy matching
     * @param {string} searchTerm - Search term
     * @param {string} language - Current language ('en' or 'jp')
     * @returns {Array} Filtered and sorted Pokemon array
     */
    searchPokemon(searchTerm, language = 'en') {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.allPokemonData;
        }

        const normalizedTerm = searchTerm.toLowerCase().trim();
        
        // Create array of pokemon with match scores
        const pokemonWithScores = this.allPokemonData.map(pokemon => {
            // Search by English name
            const nameEn = pokemon.name_en?.toLowerCase() || '';
            
            // Search by Japanese name
            const nameJp = pokemon.name_jp?.toLowerCase() || '';
            
            // Search by ID (with zero padding)
            const idString = String(pokemon.id).padStart(3, '0');
            
            // Search by types
            const typesEn = pokemon.types_en?.join(' ').toLowerCase() || '';
            const typesJp = pokemon.types_jp?.join(' ').toLowerCase() || '';

            // Calculate match scores for each field
            const scores = [
                this._fuzzyMatchScore(normalizedTerm, nameEn),
                this._fuzzyMatchScore(normalizedTerm, nameJp),
                idString.includes(normalizedTerm) ? 950 : 0, // ID matches are prioritized
                this._fuzzyMatchScore(normalizedTerm, typesEn) * 0.5, // Type matches count but less
                this._fuzzyMatchScore(normalizedTerm, typesJp) * 0.5
            ];

            // Use the highest score
            const maxScore = Math.max(...scores);

            return {
                pokemon,
                score: maxScore
            };
        });

        // Filter out non-matches and sort by score (descending)
        return pokemonWithScores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.pokemon);
    }

    /**
     * Gets Pokemon name in specified language
     * @param {Object} pokemon - Pokemon data object
     * @param {string} language - Language code ('en' or 'jp')
     * @returns {string} Pokemon name
     */
    getPokemonName(pokemon, language) {
        return language === 'jp' ? (pokemon.name_jp || pokemon.name_en) : pokemon.name_en;
    }

    /**
     * Gets Pokemon types in specified language
     * @param {Object} pokemon - Pokemon data object
     * @param {string} language - Language code ('en' or 'jp')
     * @returns {Array} Pokemon types array
     */
    getPokemonTypes(pokemon, language) {
        return language === 'jp' ? (pokemon.types_jp || pokemon.types_en) : pokemon.types_en;
    }

    /**
     * Gets Pokemon bio in specified language
     * @param {Object} pokemon - Pokemon data object
     * @param {string} language - Language code ('en' or 'jp')
     * @returns {string} Pokemon bio
     */
    getPokemonBio(pokemon, language) {
        return language === 'jp' ? (pokemon.bio_jp || pokemon.bio_en) : pokemon.bio_en;
    }

    /**
     * Validates Pokemon data structure
     * @param {Object} pokemon - Pokemon data to validate
     * @returns {boolean} True if valid
     */
    validatePokemonData(pokemon) {
        return pokemon &&
               typeof pokemon.id === 'number' &&
               typeof pokemon.name_en === 'string' &&
               typeof pokemon.sprite === 'string' &&
               Array.isArray(pokemon.types_en) &&
               typeof pokemon.stats === 'object';
    }

    /**
     * Checks if data is loaded
     * @returns {boolean} True if data is loaded
     */
    isDataLoaded() {
        return this.isLoaded;
    }

    /**
     * Clears cached data (useful for testing)
     */
    clearCache() {
        this.allPokemonData = [];
        this.isLoaded = false;
        this.loadingPromise = null;
    }
}
