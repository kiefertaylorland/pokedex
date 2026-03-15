/**
 * Pokemon Card Renderer - Handles rendering Pokemon cards in the grid
 * @module PokemonCardRenderer
 */

import { ELEMENT_IDS, CSS_CLASSES, KEYS } from '../constants.js';
import { createSafeElement } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
import { getLocalizedPokemonSnapshot } from '../utils/pokemonPresentation.js';
import { createImageWithFallback } from '../utils/imageUtils.js';

/**
 * Handles rendering Pokemon cards with proper security and accessibility
 */
export class PokemonCardRenderer {
    constructor(dataManager, uiController) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.pokedexGrid = document.getElementById(ELEMENT_IDS.POKEDEX_GRID);
    }

    /**
     * Renders all Pokemon cards
     * @param {Array} pokemonArray - Array of Pokemon data
     * @param {Function} onCardClick - Callback for card click events
     */
    renderPokemonCards(pokemonArray, onCardClick, actionHandlers = {}) {
        if (!this.pokedexGrid) {
            console.error('Pokedex grid element not found');
            return;
        }

        // Clear existing cards
        this.pokedexGrid.innerHTML = '';

        if (!Array.isArray(pokemonArray) || pokemonArray.length === 0) {
            this._renderEmptyState();
            return;
        }

        // Render each Pokemon card
        pokemonArray.forEach(pokemon => {
            if (this.dataManager.validatePokemonData(pokemon)) {
                const card = this._createPokemonCard(pokemon, onCardClick, actionHandlers);
                this.pokedexGrid.appendChild(card);
            }
        });

        // Announce to screen readers
        const message = `${pokemonArray.length} Pokémon loaded`;
        this.uiController.announceToScreenReader(message);
    }

    /**
     * Creates a single Pokemon card element
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {Function} onCardClick - Click handler
     * @returns {HTMLElement} Pokemon card element
     */
    _createPokemonCard(pokemon, onCardClick, actionHandlers = {}) {
        const currentLang = this.uiController.getCurrentLanguage();
        const { name, types, number } = getLocalizedPokemonSnapshot(this.dataManager, pokemon, currentLang);
        const uiText = this.uiController.getCurrentUIText();

        // Create card container
        const card = createSafeElement('div');
        card.classList.add('pokemon-card');
        card.dataset.id = pokemon.id;
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${uiText.viewDetails} ${name}`);
        card.setAttribute('data-testid', `pokemon-card-${pokemon.id}`);

        // Create image element
        const img = this._createPokemonImage(pokemon, name, uiText);

        // Create name element with optional romaji
        const nameContainer = createSafeElement('div');
        nameContainer.classList.add('pokemon-name-container');
        const nameElement = createSafeElement('h3', name);
        nameContainer.appendChild(nameElement);

        // Add romaji if in Japanese mode
        if (currentLang === 'jp' && pokemon.name_romaji) {
            const romajiElement = createSafeElement('span', pokemon.name_romaji);
            romajiElement.classList.add('pokemon-name-romaji');
            nameContainer.appendChild(romajiElement);
        }

        // Create ID element
        const idElement = createSafeElement('p', number);
        idElement.classList.add('pokemon-id');

        // Create types container with romaji
        const typesContainer = this._createTypesContainer(types, pokemon, currentLang);

        // Assemble card
        card.appendChild(img);
        card.appendChild(nameContainer);
        card.appendChild(idElement);
        card.appendChild(typesContainer);

        const actions = this._createCardActions(pokemon, actionHandlers);
        if (actions) {
            card.appendChild(actions);
        }

        // Add event listeners
        this._addCardEventListeners(card, pokemon, onCardClick);

        return card;
    }

    /**
     * Creates card-level comparison/team actions
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {Object} actionHandlers - Action callbacks and dependencies
     * @returns {HTMLElement|null} Action row
     */
    _createCardActions(pokemon, actionHandlers) {
        const { onCompare, onTeamToggle, teamBuilder } = actionHandlers;
        if (typeof onCompare !== 'function' && typeof onTeamToggle !== 'function') {
            return null;
        }

        const uiText = this.uiController.getCurrentUIText();
        const row = createSafeElement('div');
        row.classList.add('pokemon-card-actions');

        if (typeof onCompare === 'function') {
            const compareBtn = createSafeElement('button', uiText.comparePokemon || 'Compare');
            compareBtn.classList.add('pokemon-card-action-btn');
            compareBtn.type = 'button';
            compareBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                onCompare(pokemon);
            });
            row.appendChild(compareBtn);
        }

        if (typeof onTeamToggle === 'function') {
            const inTeam = Boolean(teamBuilder && teamBuilder.isInTeam(pokemon.id));
            const label = inTeam ? (uiText.removeFromTeam || 'Remove from Team') : (uiText.addToTeam || 'Add to Team');
            const teamBtn = createSafeElement('button', label);
            teamBtn.classList.add('pokemon-card-action-btn');
            teamBtn.type = 'button';
            teamBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                onTeamToggle(pokemon);
            });
            row.appendChild(teamBtn);
        }

        return row;
    }

    /**
     * Creates Pokemon image element with lazy loading and error handling
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {string} name - Pokemon name
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Image element or error container
     */
    _createPokemonImage(pokemon, name, uiText) {
        const container = createSafeElement('div');
        container.classList.add('pokemon-image-container');

        const img = createImageWithFallback(pokemon.sprite, name, {
            className: CSS_CLASSES.LOADING,
            onLoad: (loadedImg) => {
                loadedImg.classList.remove(CSS_CLASSES.LOADING);
            },
            onError: (failedImg) => {
                // Create error fallback
                const errorContainer = createSafeElement('div');
                errorContainer.classList.add('image-error-container');

                const icon = createSafeElement('div', '⚠️');
                icon.classList.add('image-error-icon');
                icon.setAttribute('aria-hidden', 'true');

                const text = createSafeElement('div', 'No Image');
                text.classList.add('image-error-text');

                errorContainer.appendChild(icon);
                errorContainer.appendChild(text);
                errorContainer.setAttribute('role', 'img');
                errorContainer.setAttribute('aria-label', `${name} ${uiText.imageNotAvailable}`);

                container.replaceChild(errorContainer, failedImg);
            }
        });

        // Use native lazy loading for better browser support
        img.loading = 'lazy';
        img.alt = name;

        container.appendChild(img);
        return container;
    }

    /**
     * Creates types container with type badges
     * @private
     * @param {Array} types - Pokemon types array
     * @param {Object} pokemon - Full pokemon object (optional, for romaji)
     * @param {string} currentLang - Current language setting
     * @returns {HTMLElement} Types container
     */
    _createTypesContainer(types, pokemon = null, currentLang = 'en') {
        const typesContainer = createSafeElement('div');
        typesContainer.classList.add('pokemon-types');

        types.forEach((type, index) => {
            const typeWrapper = createSafeElement('div');
            typeWrapper.classList.add('type-wrapper');

            const typeSpan = createSafeElement('span', type);
            // Use consistent CSS class name regardless of display language
            const cssClassName = getTypeClassName(type);
            typeSpan.classList.add(`type-${cssClassName}`);
            typeWrapper.appendChild(typeSpan);

            // Add romaji if in Japanese mode and romaji is available
            if (currentLang === 'jp' && pokemon && pokemon.types_romaji && pokemon.types_romaji[index]) {
                const romajiSpan = createSafeElement('span', pokemon.types_romaji[index]);
                romajiSpan.classList.add('type-romaji');
                typeWrapper.appendChild(romajiSpan);
            }

            typesContainer.appendChild(typeWrapper);
        });

        return typesContainer;
    }

    /**
     * Adds event listeners to a Pokemon card
     * @private
     * @param {HTMLElement} card - Card element
     * @param {Object} pokemon - Pokemon data
     * @param {Function} onCardClick - Click handler
     */
    _addCardEventListeners(card, pokemon, onCardClick) {
        // Click event
        card.addEventListener('click', () => {
            this._handleCardClick(card, pokemon, onCardClick);
        });

        // Keyboard navigation
        card.addEventListener('keydown', (event) => {
            if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) {
                event.preventDefault();
                this._handleCardClick(card, pokemon, onCardClick);
                return;
            }

            if (
                event.key === KEYS.ARROW_LEFT ||
                event.key === KEYS.ARROW_RIGHT ||
                event.key === KEYS.ARROW_UP ||
                event.key === KEYS.ARROW_DOWN ||
                event.key === KEYS.HOME ||
                event.key === KEYS.END
            ) {
                event.preventDefault();
                this._handleCardNavigationKey(card, event.key);
            }
        });

        // Focus management for accessibility
        card.addEventListener('focus', () => {
            card.classList.add('focused');
        });

        card.addEventListener('blur', () => {
            card.classList.remove('focused');
        });
    }

    /**
     * Handles keyboard focus movement between cards
     * @private
     * @param {HTMLElement} currentCard - Currently focused card
     * @param {string} key - Keyboard key
     */
    _handleCardNavigationKey(currentCard, key) {
        if (!this.pokedexGrid) {
            return;
        }

        const cards = Array.from(this.pokedexGrid.querySelectorAll('.pokemon-card'));
        if (cards.length === 0) {
            return;
        }

        const currentIndex = cards.indexOf(currentCard);
        if (currentIndex === -1) {
            return;
        }

        const columnCount = this._getColumnCount(cards);
        let nextIndex = currentIndex;

        if (key === KEYS.HOME) {
            nextIndex = 0;
        } else if (key === KEYS.END) {
            nextIndex = cards.length - 1;
        } else if (key === KEYS.ARROW_LEFT) {
            nextIndex = Math.max(0, currentIndex - 1);
        } else if (key === KEYS.ARROW_RIGHT) {
            nextIndex = Math.min(cards.length - 1, currentIndex + 1);
        } else if (key === KEYS.ARROW_UP) {
            nextIndex = Math.max(0, currentIndex - columnCount);
        } else if (key === KEYS.ARROW_DOWN) {
            nextIndex = Math.min(cards.length - 1, currentIndex + columnCount);
        } else {
            return;
        }

        const nextCard = cards[nextIndex];
        if (nextCard) {
            nextCard.focus();
        }
    }

    /**
     * Estimates visible grid column count for Arrow Up/Down movement
     * @private
     * @param {HTMLElement[]} cards - Rendered cards
     * @returns {number} Column count
     */
    _getColumnCount(cards) {
        if (cards.length <= 1) {
            return 1;
        }

        const firstRowTop = cards[0].offsetTop;
        const firstSecondRowIndex = cards.findIndex((card) => card.offsetTop !== firstRowTop);
        return firstSecondRowIndex === -1 ? cards.length : firstSecondRowIndex;
    }

    /**
     * Handles card click with animation
     * @private
     * @param {HTMLElement} card - Card element
     * @param {Object} pokemon - Pokemon data
     * @param {Function} onCardClick - Click handler
     */
    _handleCardClick(card, pokemon, onCardClick) {
        // Add visual feedback
        card.classList.add(CSS_CLASSES.CLICKED);

        setTimeout(() => {
            card.classList.remove(CSS_CLASSES.CLICKED);
        }, 300);

        // Call the provided click handler
        if (typeof onCardClick === 'function') {
            onCardClick(pokemon);
        }
    }

    /**
     * Renders empty state when no Pokemon found
     * @private
     */
    _renderEmptyState() {
        const currentLang = this.uiController.getCurrentLanguage();
        const message = currentLang === 'jp' ? 'ポケモンが見つかりません' : 'No Pokémon found';

        const emptyContainer = createSafeElement('div');
        emptyContainer.classList.add('empty-state');

        const emptyMessage = createSafeElement('p', message);
        emptyMessage.classList.add('empty-message');

        emptyContainer.appendChild(emptyMessage);
        this.pokedexGrid.appendChild(emptyContainer);
    }

    /**
     * Gets the grid container element
     * @returns {HTMLElement|null} Grid element
     */
    getGridElement() {
        return this.pokedexGrid;
    }

    /**
     * Clears all cards from the grid
     */
    clearGrid() {
        if (this.pokedexGrid) {
            this.pokedexGrid.innerHTML = '';
        }
    }

    /**
     * Gets card element by Pokemon ID
     * @param {number} pokemonId - Pokemon ID
     * @returns {HTMLElement|null} Card element or null
     */
    getCardById(pokemonId) {
        if (!this.pokedexGrid) return null;
        return this.pokedexGrid.querySelector(`[data-id="${pokemonId}"]`);
    }

    /**
     * Scrolls to a specific Pokemon card
     * @param {number} pokemonId - Pokemon ID
     */
    scrollToCard(pokemonId) {
        const card = this.getCardById(pokemonId);
        if (card) {
            card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            card.focus();
        }
    }
}
