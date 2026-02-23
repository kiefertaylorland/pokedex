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
import { URLRouter } from './utils/urlRouter.js';
import { StructuredDataGenerator } from './utils/structuredData.js';
import { KeyboardShortcutsModal } from './components/keyboardShortcutsModal.js';
import { debounce } from './utils/debounce.js';
import { AppState } from './utils/appState.js';

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
        this.keyboardShortcutsModal = null;
        this.isInitialized = false;
        this.appState = new AppState();
        this.boundHandlers = new Map();
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
            
            // Initialize structured data for SEO
            StructuredDataGenerator.initialize();
            
            // Load Pokemon data
            await this.dataManager.loadPokemonData();
            
            // Initial render
            this._renderInitialData();
            
            // Hide loading state after successful initialization
            this.uiController.hideLoading();
            
            // Bind global events
            this._bindGlobalEvents();
            
            // Check if URL has a Pokemon route and show it
            this._checkInitialRoute();
            
            this.isInitialized = true;
            this.appState.set({ isInitialized: true });
            
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
        // Initialize URL router
        this.urlRouter = new URLRouter((pokemonId) => {
            this._handlePokemonRoute(pokemonId);
        });

        // Initialize card renderer
        this.cardRenderer = new PokemonCardRenderer(
            this.dataManager, 
            this.uiController
        );

        // Initialize detail view with close callback
        this.detailView = new PokemonDetailView(
            this.dataManager, 
            this.uiController,
            () => this._handleDetailViewClose()
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
        
        // Initialize keyboard shortcuts modal
        this.keyboardShortcutsModal = new KeyboardShortcutsModal();
    }

    /**
     * Renders pokemon list with unified click handling
     * @private
     * @param {Array} pokemonList - List to render
     */
    _renderPokemonList(pokemonList) {
        this.cardRenderer.renderPokemonCards(
            pokemonList,
            (pokemon) => this._handlePokemonCardClick(pokemon)
        );
    }

    /**
     * Gets current filtered pokemon based on search and language
     * @private
     * @returns {Array} Filtered pokemon list
     */
    _getCurrentFilteredPokemon() {
        const currentSearchTerm = this.searchController.getCurrentSearchTerm();
        const currentLanguage = this.uiController.getCurrentLanguage();
        return this.dataManager.searchPokemon(currentSearchTerm, currentLanguage);
    }

    /**
     * Applies current filters/sort and re-renders pokemon list
     * @private
     */
    _applyFiltersAndRender() {
        const results = this._getCurrentFilteredPokemon();
        const sortedResults = this.sortController.sortPokemon(results);
        this._renderPokemonList(sortedResults);
    }

    /**
     * Renders initial Pokemon data
     * @private
     */
    _renderInitialData() {
        const allPokemon = this.dataManager.getAllPokemon();
        const sortedPokemon = this.sortController.sortPokemon(allPokemon);
        this._renderPokemonList(sortedPokemon);

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
        this.appState.set({ searchTerm });
        const sortedResults = this.sortController.sortPokemon(results);
        this._renderPokemonList(sortedResults);
    }

    /**
     * Handles sort change
     * @private
     * @param {string} sortOption - Sort option that was selected
     */
    _handleSortChange(sortOption) {
        this.appState.set({ sortOption });
        this._applyFiltersAndRender();
    }

    /**
     * Handles Pokemon card click events
     * @private
     * @param {Object} pokemon - Pokemon data
     */
    _handlePokemonCardClick(pokemon) {
        if (this.detailView) {
            this.detailView.showPokemonDetail(pokemon);
            this.appState.set({ detailViewVisible: true, currentPokemon: pokemon });
            
            // Update URL and SEO metadata
            const name = this.dataManager.getPokemonName(pokemon, this.uiController.getCurrentLanguage());
            this.urlRouter.pushPokemonRoute(pokemon.id, name);
            
            // Update meta description
            const metaDesc = this.urlRouter.generateMetaDescription(pokemon, this.uiController.getCurrentLanguage());
            this.urlRouter.updateMetaDescription(metaDesc);
            
            // Update structured data
            StructuredDataGenerator.updateForPokemon(pokemon, this.uiController.getCurrentLanguage());
        }
    }

    /**
     * Handles Pokemon route from URL
     * @private
     * @param {number} pokemonId - Pokemon ID from URL
     */
    _handlePokemonRoute(pokemonId) {
        const pokemon = this.dataManager.getPokemonById(pokemonId);
        if (pokemon && this.detailView) {
            this.detailView.showPokemonDetail(pokemon);
            this.appState.set({ detailViewVisible: true, currentPokemon: pokemon });
            
            // Update SEO metadata
            const name = this.dataManager.getPokemonName(pokemon, this.uiController.getCurrentLanguage());
            const metaDesc = this.urlRouter.generateMetaDescription(pokemon, this.uiController.getCurrentLanguage());
            this.urlRouter.updateMetaDescription(metaDesc);
            this.urlRouter.updatePageTitle(pokemon.id, name);
            
            // Update structured data
            StructuredDataGenerator.updateForPokemon(pokemon, this.uiController.getCurrentLanguage());
        }
    }

    /**
     * Checks initial route on app load
     * @private
     */
    _checkInitialRoute() {
        if (this.urlRouter && this.urlRouter.hasPokemonRoute()) {
            const pokemonId = this.urlRouter.getPokemonIdFromURL();
            if (pokemonId) {
                this._handlePokemonRoute(pokemonId);
            }
        }
    }

    /**
     * Handles detail view close event
     * @private
     */
    _handleDetailViewClose() {
        this.appState.set({ detailViewVisible: false, currentPokemon: null });
        // Update URL when closing detail view
        if (this.urlRouter) {
            this.urlRouter.popPokemonRoute();
        }
        
        // Update structured data back to main view
        StructuredDataGenerator.updateForMainView();
    }

    /**
     * Binds global application events
     * @private
     */
    _bindGlobalEvents() {
        this._bindClickAction(ELEMENT_IDS.SURPRISE_BUTTON, () => this._handleSurpriseClick());
        this._bindClickAction(ELEMENT_IDS.THEME_TOGGLE, () => this.uiController.toggleTheme());
        this._bindClickAction(ELEMENT_IDS.LANG_TOGGLE, () => this._handleLanguageToggle());

        // Window resize handling for responsive design
        window.addEventListener('resize', debounce(() => {
            this._handleWindowResize();
        }, 250));

        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            this._handleVisibilityChange();
        });
    }


    /**
     * Binds click action and tracks handler references for cleanup
     * @private
     * @param {string} elementId - Element id from constants
     * @param {Function} handler - Click handler
     */
    _bindClickAction(elementId, handler) {
        const element = document.getElementById(elementId);
        if (!element) {
            return;
        }

        element.addEventListener(EVENTS.CLICK, handler);
        this.boundHandlers.set(`${elementId}:${EVENTS.CLICK}`, { element, handler, event: EVENTS.CLICK });
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
        this._applyFiltersAndRender();
        
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
        const state = this.appState.getState();
        return {
            ...state,
            isInitialized: this.isInitialized,
            dataLoaded: this.dataManager.isDataLoaded(),
            currentLanguage: this.uiController.getCurrentLanguage(),
            currentTheme: this.uiController.getCurrentTheme(),
            searchTerm: this.searchController ? this.searchController.getCurrentSearchTerm() : state.searchTerm,
            sortOption: this.sortController ? this.sortController.getCurrentSortOption() : state.sortOption,
            detailViewVisible: this.detailView ? this.detailView.isDetailVisible() : state.detailViewVisible,
            currentPokemon: this.detailView ? this.detailView.getCurrentPokemon() : state.currentPokemon
        };
    }

    /**
     * Subscribes to app state changes
     * @param {Function} listener - Listener callback (prevState, nextState)
     * @returns {Function} Unsubscribe function
     */
    subscribeToState(listener) {
        return this.appState.subscribe(listener);
    }

    /**
     * Destroys the application and cleans up resources
     */
    destroy() {
        // Clean up tracked event listeners
        this.boundHandlers.forEach(({ element, handler, event }) => {
            element.removeEventListener(event, handler);
        });
        this.boundHandlers.clear();

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

/**
 * Boots app once DOM is ready and attaches instance to window.
 * @param {Window} targetWindow - Window-like object for dependency injection in tests
 */
export function bootPokedexApp(targetWindow = window) {
    const start = async () => {
        try {
            targetWindow.pokedexApp = await createPokedexApp();
        } catch (error) {
            console.error('Failed to auto-initialize Pokedex app:', error);
        }
    };

    if (typeof targetWindow !== 'undefined' && targetWindow.document.readyState === 'loading') {
        targetWindow.document.addEventListener(EVENTS.DOM_CONTENT_LOADED, start);
        return;
    }

    setTimeout(start, 0);
}
