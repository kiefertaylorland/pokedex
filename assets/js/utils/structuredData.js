/**
 * Structured Data Generator - Creates JSON-LD markup for SEO
 * @module StructuredData
 */

/**
 * Generates structured data (JSON-LD) for Pokemon
 */
export class StructuredDataGenerator {
    /**
     * Generates JSON-LD structured data for a Pokemon
     * @param {Object} pokemon - Pokemon data object
     * @param {string} language - Current language
     * @returns {Object} JSON-LD object
     */
    static generatePokemonSchema(pokemon, language = 'en') {
        const name = language === 'jp' ? (pokemon.name_jp || pokemon.name_en) : pokemon.name_en;
        const types = language === 'jp' ? 
            (pokemon.types_jp || pokemon.types_en) : 
            pokemon.types_en;
        const bio = language === 'jp' ? (pokemon.bio_jp || pokemon.bio_en) : pokemon.bio_en;
        
        const baseUrl = window.location.origin + window.location.pathname;
        const pokemonUrl = `${baseUrl}#pokemon/${pokemon.id}/${this._createSlug(name)}`;

        return {
            "@context": "https://schema.org",
            "@type": "Thing",
            "name": name,
            "identifier": pokemon.id,
            "description": bio || `${name} is a ${types.join('/')} type Pokémon.`,
            "url": pokemonUrl,
            "image": pokemon.sprite ? `${baseUrl}${pokemon.sprite}` : undefined,
            "additionalProperty": [
                {
                    "@type": "PropertyValue",
                    "name": "National Pokédex Number",
                    "value": pokemon.id
                },
                {
                    "@type": "PropertyValue",
                    "name": "Type",
                    "value": types.join(', ')
                },
                {
                    "@type": "PropertyValue",
                    "name": "HP",
                    "value": pokemon.stats?.hp || 0
                },
                {
                    "@type": "PropertyValue",
                    "name": "Attack",
                    "value": pokemon.stats?.attack || 0
                },
                {
                    "@type": "PropertyValue",
                    "name": "Defense",
                    "value": pokemon.stats?.defense || 0
                }
            ]
        };
    }

    /**
     * Generates JSON-LD for the Pokedex application
     * @returns {Object} JSON-LD object
     */
    static generateWebApplicationSchema() {
        const baseUrl = window.location.origin + window.location.pathname;
        
        return {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Pokédex",
            "description": "Interactive Pokédex featuring all 1025 Pokémon across all generations with detailed stats, types, and multilingual support.",
            "url": baseUrl,
            "applicationCategory": "EntertainmentApplication",
            "operatingSystem": "Any",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "author": {
                "@type": "Person",
                "name": "Kiefer Land"
            }
        };
    }

    /**
     * Generates breadcrumb list schema
     * @param {Object} [pokemon] - Optional Pokemon data for breadcrumb
     * @param {string} [language] - Current language
     * @returns {Object} JSON-LD breadcrumb object
     */
    static generateBreadcrumbSchema(pokemon, language = 'en') {
        const baseUrl = window.location.origin + window.location.pathname;
        const items = [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
            }
        ];

        if (pokemon) {
            const name = language === 'jp' ? (pokemon.name_jp || pokemon.name_en) : pokemon.name_en;
            items.push({
                "@type": "ListItem",
                "position": 2,
                "name": name,
                "item": `${baseUrl}#pokemon/${pokemon.id}/${this._createSlug(name)}`
            });
        }

        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": items
        };
    }

    /**
     * Injects or updates JSON-LD script in page head
     * @param {Object} schema - JSON-LD schema object
     * @param {string} id - ID for the script element
     */
    static injectSchema(schema, id = 'structured-data') {
        let scriptTag = document.getElementById(id);
        
        if (scriptTag) {
            scriptTag.textContent = JSON.stringify(schema);
        } else {
            scriptTag = document.createElement('script');
            scriptTag.id = id;
            scriptTag.type = 'application/ld+json';
            scriptTag.textContent = JSON.stringify(schema);
            document.head.appendChild(scriptTag);
        }
    }

    /**
     * Removes JSON-LD script from page
     * @param {string} id - ID of script element to remove
     */
    static removeSchema(id = 'structured-data') {
        const scriptTag = document.getElementById(id);
        if (scriptTag) {
            scriptTag.remove();
        }
    }

    /**
     * Updates all structured data for a Pokemon view
     * @param {Object} pokemon - Pokemon data
     * @param {string} language - Current language
     */
    static updateForPokemon(pokemon, language) {
        // Inject Pokemon schema
        const pokemonSchema = this.generatePokemonSchema(pokemon, language);
        this.injectSchema(pokemonSchema, 'pokemon-structured-data');

        // Update breadcrumb
        const breadcrumbSchema = this.generateBreadcrumbSchema(pokemon, language);
        this.injectSchema(breadcrumbSchema, 'breadcrumb-structured-data');
    }

    /**
     * Updates structured data for main view (no Pokemon selected)
     */
    static updateForMainView() {
        // Remove Pokemon-specific schema
        this.removeSchema('pokemon-structured-data');

        // Update breadcrumb for home
        const breadcrumbSchema = this.generateBreadcrumbSchema();
        this.injectSchema(breadcrumbSchema, 'breadcrumb-structured-data');
    }

    /**
     * Initializes base structured data
     */
    static initialize() {
        // Inject web application schema
        const appSchema = this.generateWebApplicationSchema();
        this.injectSchema(appSchema, 'app-structured-data');

        // Inject initial breadcrumb
        const breadcrumbSchema = this.generateBreadcrumbSchema();
        this.injectSchema(breadcrumbSchema, 'breadcrumb-structured-data');
    }

    /**
     * Creates URL-friendly slug
     * @private
     * @param {string} name - Name to slugify
     * @returns {string} URL slug
     */
    static _createSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
}
