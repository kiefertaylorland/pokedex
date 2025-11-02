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
import { SortController } from './controllers/sortController.js';

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
        this.sortController = null;
        this.isInitialized = false;
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

        // Initialize sort controller
        this.sortController = new SortController(
            this.dataManager,
            this.uiController,
            (sortOption) => this._handleSortChange(sortOption)
        );
    }

    /**
     * Renders initial Pokemon data
     * @private
     */
    _renderInitialData() {
        const allPokemon = this.dataManager.getAllPokemon();
        const sortedPokemon = this.sortController.sortPokemon(allPokemon);
        this.cardRenderer.renderPokemonCards(
            sortedPokemon, 
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
        
        // Enable search and sort
        this.searchController.enable();
        this.sortController.enable();
    }

    /**
     * Handles search results
     * @private
     * @param {Array} results - Search results
     * @param {string} searchTerm - Search term used
     */
    _handleSearchResults(results, searchTerm) {
        const sortedResults = this.sortController.sortPokemon(results);
        this.cardRenderer.renderPokemonCards(
            sortedResults, 
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
    }

    /**
     * Handles sort change
     * @private
     * @param {string} sortOption - Sort option that was selected
     */
    _handleSortChange(sortOption) {
        // Re-apply current search with new sort
        const currentSearchTerm = this.searchController.getCurrentSearchTerm();
        const currentLanguage = this.uiController.getCurrentLanguage();
        const results = this.dataManager.searchPokemon(currentSearchTerm, currentLanguage);
        const sortedResults = this.sortController.sortPokemon(results);
        
        this.cardRenderer.renderPokemonCards(
            sortedResults, 
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
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
        // Surprise button
        const surpriseButton = document.getElementById(ELEMENT_IDS.SURPRISE_BUTTON);
        if (surpriseButton) {
            surpriseButton.addEventListener(EVENTS.CLICK, () => {
                this._handleSurpriseClick();
            });
        }

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
     * Handles surprise button click to show random Pokemon
     * @private
     */
    _handleSurpriseClick() {
        const randomPokemon = this.dataManager.getRandomPokemon();
        if (randomPokemon) {
            // Show the Pokemon detail view
            this.detailView.showPokemonDetail(randomPokemon);
            
            // Announce to screen readers
            const currentLanguage = this.uiController.getCurrentLanguage();
            const pokemonName = this.dataManager.getPokemonName(randomPokemon, currentLanguage);
            const message = currentLanguage === 'jp' 
                ? `${pokemonName}が表示されました！`
                : `Showing ${pokemonName}!`;
            this.uiController.announceToScreenReader(message);
        }
    }

    /**
     * Handles language toggle with UI updates
     * @private
     */
    _handleLanguageToggle() {
        this.uiController.toggleLanguage();
        
        // Update search placeholder and sort labels
        this.searchController.updatePlaceholder();
        this.sortController.updateSortLabels();
        
        // Re-render current search results with sort
        const currentSearchTerm = this.searchController.getCurrentSearchTerm();
        const currentLanguage = this.uiController.getCurrentLanguage();
        const results = this.dataManager.searchPokemon(currentSearchTerm, currentLanguage);
        const sortedResults = this.sortController.sortPokemon(results);
        
        this.cardRenderer.renderPokemonCards(
            sortedResults, 
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
        
        // Refresh detail view if open
        if (this.detailView.isDetailVisible()) {
            this.detailView.refreshContent();
        }
    }

    /**
     * Updates the surprise button text based on current language
     * @private
     */
    _updateSurpriseButtonText() {
        const surpriseButton = document.getElementById(ELEMENT_IDS.SURPRISE_BUTTON);
        if (surpriseButton) {
            const uiText = this.uiController.getCurrentUIText();
            surpriseButton.textContent = `🎲 ${uiText.surpriseButton}`;
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
            sortOption: this.sortController ? this.sortController.getCurrentSortOption() : 'number-asc',
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
