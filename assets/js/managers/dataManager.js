/**
 * Pokemon Data Manager - Handles data fetching, caching, and management
 * @module PokemonDataManager
 */

import { DATA } from '../constants.js';
import { CacheManager } from '../utils/cacheManager.js';

/**
 * Manages Pokemon data operations including fetching and caching
 */
export class PokemonDataManager {
    constructor() {
        this.allPokemonData = [];
        this.isLoaded = false;
        this.loadingPromise = null;
        this.searchCache = new Map(); // In-memory search cache for current session
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
        // Try to get data from cache first
        const cachedData = CacheManager.getCachedPokemonData();
        if (cachedData && cachedData.length > 0) {
            return cachedData;
        }

        // Cache miss - fetch from network
        try {
            console.log('📡 Fetching Pokemon data from network...');
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
     * Searches Pokemon by name or ID
     * @param {string} searchTerm - Search term
     * @param {string} language - Current language ('en' or 'jp')
     * @returns {Array} Filtered Pokemon array
     */
    searchPokemon(searchTerm, language = 'en') {
        if (!searchTerm || searchTerm.trim() === '') {
            return this.allPokemonData;
        }

        const normalizedTerm = searchTerm.toLowerCase().trim();
        const cacheKey = `${normalizedTerm}:${language}`;
        
        // Check in-memory cache first
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }

        // Check localStorage cache
        const cachedIds = CacheManager.getCachedSearchResults(cacheKey);
        if (cachedIds) {
            const results = cachedIds.map(id => this.getPokemonById(id)).filter(p => p !== null);
            this.searchCache.set(cacheKey, results);
            return results;
        }
        
        // Perform search
        const results = this.allPokemonData.filter(pokemon => {
            // Search by English name
            const nameEn = pokemon.name_en?.toLowerCase() || '';
            
            // Search by Japanese name
            const nameJp = pokemon.name_jp?.toLowerCase() || '';
            
            // Search by ID (with zero padding)
            const idString = String(pokemon.id).padStart(3, '0');
            
            // Search by types
            const typesEn = pokemon.types_en?.join(' ').toLowerCase() || '';
            const typesJp = pokemon.types_jp?.join(' ').toLowerCase() || '';

            return nameEn.includes(normalizedTerm) ||
                   nameJp.includes(normalizedTerm) ||
                   idString.includes(normalizedTerm) ||
                   typesEn.includes(normalizedTerm) ||
                   typesJp.includes(normalizedTerm);
        });

        // Cache the results
        this.searchCache.set(cacheKey, results);
        CacheManager.cacheSearchResults(cacheKey, results);

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
        CacheManager.clearAllCaches();
    }
}
