/**
 * Cache Manager - Handles localStorage/IndexedDB caching with expiry
 * @module CacheManager
 */

import { CACHE, APP_VERSION } from '../constants.js';

/**
 * Manages local caching of Pokemon data to reduce network requests
 */
export class CacheManager {
    /**
     * Saves Pokemon data to localStorage with version and timestamp
     * @param {Array} pokemonData - Pokemon data array to cache
     * @returns {boolean} Success status
     */
    static savePokemonData(pokemonData) {
        try {
            const cacheData = {
                version: APP_VERSION,
                timestamp: Date.now(),
                data: pokemonData
            };
            
            localStorage.setItem(CACHE.POKEMON_DATA_KEY, JSON.stringify(cacheData));
            localStorage.setItem(CACHE.POKEMON_DATA_VERSION_KEY, APP_VERSION);
            
            console.log(`✅ Cached ${pokemonData.length} Pokemon (v${APP_VERSION})`);
            return true;
        } catch (error) {
            console.warn('Failed to cache Pokemon data:', error);
            // Quota exceeded or other error - clear cache and continue
            this.clearPokemonCache();
            return false;
        }
    }

    /**
     * Retrieves Pokemon data from cache if valid
     * @returns {Array|null} Cached Pokemon data or null if invalid/expired
     */
    static getCachedPokemonData() {
        try {
            const cachedVersion = localStorage.getItem(CACHE.POKEMON_DATA_VERSION_KEY);
            
            // Check version mismatch
            if (cachedVersion !== APP_VERSION) {
                console.log('🔄 Cache version mismatch - clearing cache');
                this.clearPokemonCache();
                return null;
            }

            const cachedString = localStorage.getItem(CACHE.POKEMON_DATA_KEY);
            if (!cachedString) {
                return null;
            }

            const cacheData = JSON.parse(cachedString);
            
            // Validate cache structure
            if (!cacheData.version || !cacheData.timestamp || !Array.isArray(cacheData.data)) {
                console.warn('Invalid cache structure - clearing cache');
                this.clearPokemonCache();
                return null;
            }

            // Check if cache has expired
            const cacheAge = Date.now() - cacheData.timestamp;
            const maxAge = CACHE.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
            
            if (cacheAge > maxAge) {
                console.log('⏰ Cache expired - clearing cache');
                this.clearPokemonCache();
                return null;
            }

            console.log(`✅ Using cached Pokemon data (${cacheData.data.length} Pokemon, ${Math.round(cacheAge / (1000 * 60 * 60))}h old)`);
            return cacheData.data;
        } catch (error) {
            console.warn('Error reading cache:', error);
            this.clearPokemonCache();
            return null;
        }
    }

    /**
     * Clears Pokemon data cache
     */
    static clearPokemonCache() {
        localStorage.removeItem(CACHE.POKEMON_DATA_KEY);
        localStorage.removeItem(CACHE.POKEMON_DATA_VERSION_KEY);
    }

    /**
     * Gets or creates search cache
     * @private
     * @returns {Object} Search cache object
     */
    static _getSearchCache() {
        try {
            const cacheString = localStorage.getItem(CACHE.SEARCH_CACHE_KEY);
            return cacheString ? JSON.parse(cacheString) : {};
        } catch (error) {
            return {};
        }
    }

    /**
     * Saves search cache
     * @private
     * @param {Object} cache - Search cache object
     */
    static _saveSearchCache(cache) {
        try {
            // Limit cache size - keep only most recent entries
            const entries = Object.entries(cache);
            if (entries.length > CACHE.MAX_SEARCH_CACHE_SIZE) {
                // Sort by timestamp (most recent first)
                entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
                // Keep only the most recent entries
                const limitedCache = Object.fromEntries(
                    entries.slice(0, CACHE.MAX_SEARCH_CACHE_SIZE)
                );
                localStorage.setItem(CACHE.SEARCH_CACHE_KEY, JSON.stringify(limitedCache));
            } else {
                localStorage.setItem(CACHE.SEARCH_CACHE_KEY, JSON.stringify(cache));
            }
        } catch (error) {
            console.warn('Failed to save search cache:', error);
            // Clear cache if quota exceeded
            this.clearSearchCache();
        }
    }

    /**
     * Caches search results
     * @param {string} searchKey - Search term + language as key
     * @param {Array} results - Search results to cache
     */
    static cacheSearchResults(searchKey, results) {
        const cache = this._getSearchCache();
        cache[searchKey] = {
            timestamp: Date.now(),
            results: results.map(p => p.id) // Store only IDs to save space
        };
        this._saveSearchCache(cache);
    }

    /**
     * Gets cached search results
     * @param {string} searchKey - Search term + language as key
     * @returns {Array|null} Array of Pokemon IDs or null if not cached
     */
    static getCachedSearchResults(searchKey) {
        try {
            const cache = this._getSearchCache();
            const cached = cache[searchKey];
            
            if (!cached) {
                return null;
            }

            // Check if cache entry is still valid (1 hour)
            const cacheAge = Date.now() - cached.timestamp;
            if (cacheAge > 60 * 60 * 1000) {
                delete cache[searchKey];
                this._saveSearchCache(cache);
                return null;
            }

            return cached.results;
        } catch (error) {
            return null;
        }
    }

    /**
     * Clears search cache
     */
    static clearSearchCache() {
        localStorage.removeItem(CACHE.SEARCH_CACHE_KEY);
    }

    /**
     * Clears all caches
     */
    static clearAllCaches() {
        this.clearPokemonCache();
        this.clearSearchCache();
        console.log('🗑️ All caches cleared');
    }

    /**
     * Gets cache statistics
     * @returns {Object} Cache stats including size and entry counts
     */
    static getCacheStats() {
        const pokemonCache = localStorage.getItem(CACHE.POKEMON_DATA_KEY);
        const searchCache = localStorage.getItem(CACHE.SEARCH_CACHE_KEY);
        
        return {
            pokemonCacheSize: pokemonCache ? pokemonCache.length : 0,
            searchCacheSize: searchCache ? searchCache.length : 0,
            pokemonCached: pokemonCache !== null,
            searchCacheEntries: searchCache ? Object.keys(JSON.parse(searchCache)).length : 0,
            totalSize: (pokemonCache?.length || 0) + (searchCache?.length || 0)
        };
    }
}
