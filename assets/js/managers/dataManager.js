/**
 * Pokemon Data Manager - Handles data fetching, caching, and management
 * @module PokemonDataManager
 */

import { DATA } from '../constants.js';
import { CacheManager } from '../utils/cacheManager.js';
import { fuzzyMatchScore } from '../utils/fuzzySearch.js';

/**
 * Manages Pokemon data operations including fetching and caching
 */
export class PokemonDataManager {
    constructor() {
        this.allPokemonData = [];
        this.isLoaded = false;
        this.loadingPromise = null;
        this.searchCache = new Map(); // In-memory search cache for current session
        this.pokemonById = new Map();
        this.searchCorpus = [];
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
            this._rebuildIndexes();
            this.searchCache.clear();
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
        // Try to get data from cache first
        const cachedData = CacheManager.getCachedPokemonData();
        if (cachedData && cachedData.length > 0) {
            return cachedData;
        }

        // Cache miss - fetch from network
        try {
            const response = await fetch(DATA.JSON_FILE);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format: expected array');
            }

            // Cache the fetched data
            CacheManager.savePokemonData(data);

            return data;
        } catch (error) {
            throw new Error('Could not load Pokémon data. Please check your connection and try again.');
        }
    }


    /**
     * Rebuilds lookup indexes after data load
     * @private
     */
    _rebuildIndexes() {
        this.pokemonById.clear();
        this.searchCorpus = this.allPokemonData.map(pokemon => {
            this.pokemonById.set(pokemon.id, pokemon);
            return {
                pokemon,
                idString: String(pokemon.id).padStart(3, '0'),
                nameEn: (pokemon.name_en || '').toLowerCase(),
                nameJp: (pokemon.name_jp || '').toLowerCase(),
                typesEn: (pokemon.types_en || []).join(' ').toLowerCase(),
                typesJp: (pokemon.types_jp || []).join(' ').toLowerCase()
            };
        });
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
        return this.pokemonById.get(parseInt(id, 10)) || null;
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
        const cacheKey = `${normalizedTerm}:${language}`;

        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }

        // Create array of pokemon with match scores
        const pokemonWithScores = this.searchCorpus.map(({ pokemon, idString, nameEn, nameJp, typesEn, typesJp }) => {
            const scores = [
                fuzzyMatchScore(normalizedTerm, nameEn),
                fuzzyMatchScore(normalizedTerm, nameJp),
                idString.includes(normalizedTerm) ? 950 : 0,
                fuzzyMatchScore(normalizedTerm, typesEn) * 0.5,
                fuzzyMatchScore(normalizedTerm, typesJp) * 0.5
            ];

            return {
                pokemon,
                score: Math.max(...scores)
            };
        });

        // Filter out non-matches and sort by score (descending)
        const results = pokemonWithScores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(item => item.pokemon);

        // prevent unbounded growth in long sessions
        if (this.searchCache.size > 100) {
            const firstKey = this.searchCache.keys().next().value;
            this.searchCache.delete(firstKey);
        }
        this.searchCache.set(cacheKey, results);

        return results;
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
     * Gets a random Pokemon from the loaded data
     * @returns {Object|null} Random Pokemon data or null if no data loaded
     */
    getRandomPokemon() {
        if (!this.isLoaded || this.allPokemonData.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.allPokemonData.length);
        return this.allPokemonData[randomIndex];
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
        this.searchCache.clear();
        this.pokemonById.clear();
        this.searchCorpus = [];
        CacheManager.clearAllCaches();
    }
}
