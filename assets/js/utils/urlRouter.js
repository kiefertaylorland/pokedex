/**
 * URL Router - Handles URL routing for deep linking to Pokemon
 * @module URLRouter
 */

/**
 * Manages URL routing for SEO and deep linking
 */
export class URLRouter {
    /**
     * Initializes URL routing
     * @param {Function} onPokemonRoute - Callback when Pokemon route is detected
     */
    constructor(onPokemonRoute) {
        this.onPokemonRoute = onPokemonRoute;
        this._bindEvents();
    }

    /**
     * Binds popstate event for browser back/forward
     * @private
     */
    _bindEvents() {
        window.addEventListener('popstate', (event) => {
            this._handleRouteChange(event.state);
        });
    }

    /**
     * Handles route changes
     * @private
     * @param {Object} state - History state object
     */
    _handleRouteChange(state) {
        const pokemonId = this.getPokemonIdFromURL();
        
        if (pokemonId && this.onPokemonRoute) {
            this.onPokemonRoute(pokemonId);
        }
    }

    /**
     * Gets Pokemon ID from current URL hash
     * @returns {number|null} Pokemon ID or null
     */
    getPokemonIdFromURL() {
        const hash = window.location.hash;
        
        // Support formats: #pokemon/25 or #pokemon-25 or #25
        const match = hash.match(/#(?:pokemon[/-])?(\d+)/);
        
        if (match && match[1]) {
            return parseInt(match[1], 10);
        }
        
        return null;
    }

    /**
     * Updates URL to show specific Pokemon
     * @param {number} pokemonId - Pokemon ID
     * @param {string} pokemonName - Pokemon name for SEO
     */
    pushPokemonRoute(pokemonId, pokemonName) {
        const slug = this._createSlug(pokemonName);
        const newHash = `#pokemon/${pokemonId}/${slug}`;
        
        // Update URL without reloading page
        history.pushState(
            { pokemonId, pokemonName }, 
            `Pokémon #${pokemonId} - ${pokemonName}`,
            newHash
        );

        // Update page title for SEO
        this.updatePageTitle(pokemonId, pokemonName);
    }

    /**
     * Updates URL when closing Pokemon detail
     */
    popPokemonRoute() {
        history.pushState(null, 'Pokédex - Complete Pokemon Database', '#');
        this.updatePageTitle();
    }

    /**
     * Creates URL-friendly slug from Pokemon name
     * @private
     * @param {string} name - Pokemon name
     * @returns {string} URL slug
     */
    _createSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Updates page title dynamically
     * @param {number} [pokemonId] - Pokemon ID (optional)
     * @param {string} [pokemonName] - Pokemon name (optional)
     */
    updatePageTitle(pokemonId, pokemonName) {
        if (pokemonId && pokemonName) {
            document.title = `#${pokemonId} ${pokemonName} - Pokédex`;
        } else {
            document.title = 'Pokédex - Complete Pokemon Database (All Generations)';
        }
    }

    /**
     * Generates meta description for Pokemon
     * @param {Object} pokemon - Pokemon data
     * @param {string} language - Current language
     * @returns {string} Meta description
     */
    generateMetaDescription(pokemon, language = 'en') {
        const name = language === 'jp' ? (pokemon.name_jp || pokemon.name_en) : pokemon.name_en;
        const types = language === 'jp' ? 
            (pokemon.types_jp || pokemon.types_en) : 
            pokemon.types_en;
        
        return `${name} (#${pokemon.id}) - ${types.join('/')} type Pokémon. View detailed stats, moves, evolution chain, and more in our complete Pokédex.`;
    }

    /**
     * Updates meta description tag
     * @param {string} description - New description
     */
    updateMetaDescription(description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description);
        } else {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            metaDesc.content = description;
            document.head.appendChild(metaDesc);
        }
    }

    /**
     * Checks if current URL has a Pokemon route
     * @returns {boolean} True if Pokemon route exists
     */
    hasPokemonRoute() {
        return this.getPokemonIdFromURL() !== null;
    }
}
