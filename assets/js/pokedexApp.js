/**
 * Main Pokedex Application Controller
 * Orchestrates all components and manages application state
 * @module PokedexApp
 */

import { EVENTS, ELEMENT_IDS } from './constants.js';
import { PokemonDataManager } from './managers/dataManager.js';
import { UIController } from './managers/uiController.js';
import { PokemonCardRenderer } from './components/pokemonCardRenderer.js';
import { PokemonDetailView } from './components/pokemonDetailView.js';
import { SearchController } from './controllers/searchController.js';
import { FilterController } from './controllers/filterController.js';

/**
 * Main application class that coordinates all components
 */
export class PokedexApp {
    constructor() {
        this.dataManager = new PokemonDataManager();
        this.uiController = new UIController();
        this.cardRenderer = null;
        this.detailView = null;
        this.searchController = null;
        this.filterController = null;
        this.isInitialized = false;
        this.currentSearchTerm = '';
    }

    /**
     * Initializes the application
     */
    async initialize() {
        try {
            // Initialize UI controller first
            this.uiController.initialize();
            
            // Show loading state
            this.uiController.showLoading();
            
            // Initialize components
            this._initializeComponents();
            
            // Load Pokemon data
            await this.dataManager.loadPokemonData();
            
            // Initial render
            this._renderInitialData();
            
            // Hide loading state after successful initialization
            this.uiController.hideLoading();
            
            // Bind global events
            this._bindGlobalEvents();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Failed to initialize Pokedex application:', error);
            this.uiController.showError(
                'Failed to load Pokémon data. Please refresh the page and try again.'
            );
        }
    }

    /**
     * Initializes all component instances
     * @private
     */
    _initializeComponents() {
        // Initialize card renderer
        this.cardRenderer = new PokemonCardRenderer(
            this.dataManager, 
            this.uiController
        );

        // Initialize detail view
        this.detailView = new PokemonDetailView(
            this.dataManager, 
            this.uiController
        );

        // Initialize search controller
        this.searchController = new SearchController(
            this.dataManager,
            this.uiController,
            (results, searchTerm) => this._handleSearchResults(results, searchTerm)
        );

        // Initialize filter controller
        this.filterController = new FilterController(
            this.dataManager,
            this.uiController,
            (results, filters) => this._handleFilterResults(results, filters)
        );
    }

    /**
     * Renders initial Pokemon data
     * @private
     */
    _renderInitialData() {
        const allPokemon = this.dataManager.getAllPokemon();
        this.cardRenderer.renderPokemonCards(
            allPokemon, 
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
        
        // Enable search
        this.searchController.enable();
        
        // Populate filter options
        this.filterController.populateFilterOptions();
    }

    /**
     * Handles search results
     * @private
     * @param {Array} results - Search results
     * @param {string} searchTerm - Search term used
     */
    _handleSearchResults(results, searchTerm) {
        this.currentSearchTerm = searchTerm;
        
        // Apply filters to search results
        if (this.filterController && this.filterController.hasActiveFilters()) {
            const filtered = this._applyFiltersToResults(results);
            this.cardRenderer.renderPokemonCards(
                filtered, 
                (pokemon) => this._handlePokemonCardClick(pokemon)
            );
        } else {
            this.cardRenderer.renderPokemonCards(
                results, 
                (pokemon) => this._handlePokemonCardClick(pokemon)
            );
        }
    }

    /**
     * Handles filter results
     * @private
     * @param {Array} results - Filtered results
     * @param {Object} filters - Applied filters
     */
    _handleFilterResults(results, filters) {
        // If there's an active search, apply it to filter results
        if (this.currentSearchTerm) {
            const currentLanguage = this.uiController.getCurrentLanguage();
            const searchFiltered = this.searchController.search(
                this.currentSearchTerm,
                results,
                currentLanguage
            );
            this.cardRenderer.renderPokemonCards(
                searchFiltered, 
                (pokemon) => this._handlePokemonCardClick(pokemon)
            );
        } else {
            this.cardRenderer.renderPokemonCards(
                results, 
                (pokemon) => this._handlePokemonCardClick(pokemon)
            );
        }
    }

    /**
     * Applies filters to a result set
     * @private
     * @param {Array} results - Results to filter
     * @returns {Array} Filtered results
     */
    _applyFiltersToResults(results) {
        if (!this.filterController || !this.filterController.hasActiveFilters()) {
            return results;
        }

        const filters = this.filterController.getCurrentFilters();
        const currentLanguage = this.uiController.getCurrentLanguage();

        return results.filter(pokemon => {
            // Filter by ability
            if (filters.ability && filters.ability !== 'all') {
                const abilities = currentLanguage === 'jp' ? pokemon.abilities_jp : pokemon.abilities_en;
                if (!abilities || !abilities.some(ability => 
                    ability.toLowerCase().includes(filters.ability.toLowerCase())
                )) {
                    return false;
                }
            }

            // Filter by base stat total
            const baseStatTotal = pokemon.base_stat_total || 0;
            if (baseStatTotal < filters.minStatTotal || baseStatTotal > filters.maxStatTotal) {
                return false;
            }

            // Filter by move type
            if (filters.moveType && filters.moveType !== 'all') {
                const moves = pokemon.moves || [];
                const moveTypes = currentLanguage === 'jp' 
                    ? moves.map(m => m.type_jp) 
                    : moves.map(m => m.type_en);
                
                if (!moveTypes.some(type => 
                    type && type.toLowerCase() === filters.moveType.toLowerCase()
                )) {
                    return false;
                }
            }

            // Filter by evolution stage
            if (filters.evolutionStage && filters.evolutionStage !== 'all') {
                const stage = this._getEvolutionStage(pokemon);
                if (stage !== filters.evolutionStage) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Gets evolution stage for a Pokemon
     * @private
     * @param {Object} pokemon - Pokemon data
     * @returns {string} Evolution stage
     */
    _getEvolutionStage(pokemon) {
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
     * Handles Pokemon card click events
     * @private
     * @param {Object} pokemon - Pokemon data
     */
    _handlePokemonCardClick(pokemon) {
        if (this.detailView) {
            this.detailView.showPokemonDetail(pokemon);
        }
    }

    /**
     * Binds global application events
     * @private
     */
    _bindGlobalEvents() {
        // Theme toggle
        const themeToggle = document.getElementById(ELEMENT_IDS.THEME_TOGGLE);
        if (themeToggle) {
            themeToggle.addEventListener(EVENTS.CLICK, () => {
                this.uiController.toggleTheme();
            });
        }

        // Language toggle
        const langToggle = document.getElementById(ELEMENT_IDS.LANG_TOGGLE);
        if (langToggle) {
            langToggle.addEventListener(EVENTS.CLICK, () => {
                this._handleLanguageToggle();
            });
        }

        // Filter toggle
        const filterToggle = document.getElementById('filter-toggle');
        const filterPanel = document.getElementById('filter-panel');
        if (filterToggle && filterPanel) {
            filterToggle.addEventListener(EVENTS.CLICK, () => {
                const isHidden = filterPanel.hasAttribute('hidden');
                if (isHidden) {
                    filterPanel.removeAttribute('hidden');
                    filterToggle.setAttribute('aria-expanded', 'true');
                } else {
                    filterPanel.setAttribute('hidden', '');
                    filterToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Window resize handling for responsive design
        window.addEventListener('resize', this._debounce(() => {
            this._handleWindowResize();
        }, 250));

        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            this._handleVisibilityChange();
        });
    }

    /**
     * Handles language toggle with UI updates
     * @private
     */
    _handleLanguageToggle() {
        this.uiController.toggleLanguage();
        
        // Update search placeholder
        this.searchController.updatePlaceholder();
        
        // Repopulate filter options for new language
        if (this.filterController) {
            this.filterController.populateFilterOptions();
        }
        
        // Re-render current search results with filters
        const currentSearchTerm = this.searchController.getCurrentSearchTerm();
        const currentLanguage = this.uiController.getCurrentLanguage();
        let results = this.dataManager.searchPokemon(currentSearchTerm, currentLanguage);
        
        // Apply filters if active
        if (this.filterController && this.filterController.hasActiveFilters()) {
            results = this._applyFiltersToResults(results);
        }
        
        this.cardRenderer.renderPokemonCards(
            results, 
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
        
        // Refresh detail view if open
        if (this.detailView.isDetailVisible()) {
            this.detailView.refreshContent();
        }
    }

    /**
     * Handles window resize events
     * @private
     */
    _handleWindowResize() {
        // Handle responsive behavior if needed
    }

    /**
     * Handles page visibility changes for performance optimization
     * @private
     */
    _handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - could pause animations or reduce activity
        } else {
            // Page is visible - resume normal activity
        }
    }

    /**
     * Simple debounce utility
     * @private
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    _debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Gets a Pokemon by ID (public API)
     * @param {number} id - Pokemon ID
     * @returns {Object|null} Pokemon data or null
     */
    getPokemonById(id) {
        return this.dataManager.getPokemonById(id);
    }

    /**
     * Performs a search (public API)
     * @param {string} searchTerm - Search term
     */
    search(searchTerm) {
        if (this.searchController) {
            this.searchController.setSearchTerm(searchTerm);
        }
    }

    /**
     * Shows a specific Pokemon's details (public API)
     * @param {number} pokemonId - Pokemon ID to show
     */
    showPokemonDetails(pokemonId) {
        const pokemon = this.dataManager.getPokemonById(pokemonId);
        if (pokemon && this.detailView) {
            this.detailView.showPokemonDetail(pokemon);
        }
    }

    /**
     * Scrolls to a specific Pokemon card (public API)
     * @param {number} pokemonId - Pokemon ID
     */
    scrollToPokemon(pokemonId) {
        if (this.cardRenderer) {
            this.cardRenderer.scrollToCard(pokemonId);
        }
    }

    /**
     * Gets current application state
     * @returns {Object} Application state object
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            dataLoaded: this.dataManager.isDataLoaded(),
            currentLanguage: this.uiController.getCurrentLanguage(),
            currentTheme: this.uiController.getCurrentTheme(),
            searchTerm: this.searchController ? this.searchController.getCurrentSearchTerm() : '',
            detailViewVisible: this.detailView ? this.detailView.isDetailVisible() : false,
            currentPokemon: this.detailView ? this.detailView.getCurrentPokemon() : null
        };
    }

    /**
     * Destroys the application and cleans up resources
     */
    destroy() {
        // Clean up event listeners
        // (In a real app, we'd need to track and remove all listeners)
        
        // Clear data
        if (this.dataManager) {
            this.dataManager.clearCache();
        }
        
        // Reset UI
        if (this.uiController) {
            this.uiController.disableModalState();
        }
        
        this.isInitialized = false;
    }
}

/**
 * Factory function to create and initialize the Pokedex app
 * @returns {Promise<PokedexApp>} Initialized Pokedex application
 */
export async function createPokedexApp() {
    const app = new PokedexApp();
    await app.initialize();
    return app;
}

// Auto-initialize when DOM is ready (if this script is loaded as main)
if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener(EVENTS.DOM_CONTENT_LOADED, async () => {
        try {
            window.pokedexApp = await createPokedexApp();
        } catch (error) {
            console.error('Failed to auto-initialize Pokedex app:', error);
        }
    });
} else if (typeof window !== 'undefined') {
    // DOM already loaded
    setTimeout(async () => {
        try {
            window.pokedexApp = await createPokedexApp();
        } catch (error) {
            console.error('Failed to auto-initialize Pokedex app:', error);
        }
    }, 0);
}
