/**
 * Pokemon Detail View - Handles the detailed Pokemon modal/overlay
 * @module PokemonDetailView
 */

import { ELEMENT_IDS, CSS_CLASSES, DATA, ANIMATION, EVENTS, KEYS } from '../constants.js';
import { createSafeElement, safeSetInnerHTML, validatePokemonId } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';

/**
 * Manages the Pokemon detail modal view
 */
export class PokemonDetailView {
    constructor(dataManager, uiController) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.detailView = document.getElementById(ELEMENT_IDS.DETAIL_VIEW);
        this.detailContent = document.getElementById(ELEMENT_IDS.DETAIL_CONTENT);
        this.currentPokemon = null;
        this.isVisible = false;
        
        this._bindEvents();
    }

    /**
     * Shows Pokemon detail view
     * @param {Object} pokemon - Pokemon data object
     */
    showPokemonDetail(pokemon) {
        if (!this.dataManager.validatePokemonData(pokemon)) {
            console.error('Invalid Pokemon data provided to detail view');
            return;
        }

        this.currentPokemon = pokemon;
        this._renderDetailContent(pokemon);
        this._showModal();
        this._playPokemonCry(pokemon.id);
    }

    /**
     * Renders the detail content
     * @private
     * @param {Object} pokemon - Pokemon data
     */
    _renderDetailContent(pokemon) {
        if (!this.detailContent) {
            console.error('Detail content element not found');
            return;
        }

        const currentLang = this.uiController.getCurrentLanguage();
        const uiText = this.uiController.getCurrentUIText();
        
        const name = this.dataManager.getPokemonName(pokemon, currentLang);
        const types = this.dataManager.getPokemonTypes(pokemon, currentLang);
        const bio = this.dataManager.getPokemonBio(pokemon, currentLang);

        // Create modal content container
        const modalContent = createSafeElement('div');
        modalContent.classList.add('detail-modal-content');

        // Create and append components
        modalContent.appendChild(this._createCloseButton());
        modalContent.appendChild(this._createPokemonImage(pokemon, name));
        modalContent.appendChild(this._createPokemonHeader(pokemon, name));
        modalContent.appendChild(this._createTypesSection(types, uiText));
        modalContent.appendChild(this._createBioSection(bio, uiText));
        modalContent.appendChild(this._createStatsSection(pokemon.stats, uiText));
        modalContent.appendChild(this._createMovesSection(pokemon.moves, uiText));

        // Clear previous content and add new content
        this.detailContent.innerHTML = '';
        this.detailContent.appendChild(modalContent);

        // Store Pokemon ID for language switching
        this.detailView.dataset.pokemonId = pokemon.id;
    }

    /**
     * Creates close button
     * @private
     * @returns {HTMLElement} Close button element
     */
    _createCloseButton() {
        const closeButton = createSafeElement('button', '×');
        closeButton.id = ELEMENT_IDS.CLOSE_DETAIL;
        closeButton.classList.add('close-button');
        closeButton.setAttribute('aria-label', 'Close detail view');
        closeButton.setAttribute('title', 'Close (Esc)');
        return closeButton;
    }

    /**
     * Creates Pokemon image with shake animation
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {string} name - Pokemon name
     * @returns {HTMLElement} Image element
     */
    _createPokemonImage(pokemon, name) {
        const img = createSafeElement('img');
        img.src = pokemon.sprite;
        img.alt = name;
        img.style.width = '120px';
        img.style.height = '120px';
        img.classList.add('pokemon-detail-image');
        
        // Add shake animation
        setTimeout(() => {
            img.classList.add(CSS_CLASSES.SPRITE_SHAKE);
            img.addEventListener(EVENTS.ANIMATION_END, () => {
                img.classList.remove(CSS_CLASSES.SPRITE_SHAKE);
            }, { once: true });
        }, ANIMATION.TRANSITION_DELAY_MS);

        return img;
    }

    /**
     * Creates Pokemon header (name and ID)
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {string} name - Pokemon name
     * @returns {HTMLElement} Header element
     */
    _createPokemonHeader(pokemon, name) {
        const header = createSafeElement('h2', 
            `${name} (#${String(pokemon.id).padStart(3, '0')})`);
        header.classList.add('pokemon-detail-name');
        return header;
    }

    /**
     * Creates types section
     * @private
     * @param {Array} types - Pokemon types
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Types section
     */
    _createTypesSection(types, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section');

        const heading = createSafeElement('h4', uiText.types);
        const typesContainer = createSafeElement('div');
        typesContainer.classList.add('pokemon-types');

        types.forEach(type => {
            const typeSpan = createSafeElement('span', type);
            // Use consistent CSS class name regardless of display language
            const cssClassName = getTypeClassName(type);
            typeSpan.classList.add(`type-${cssClassName}`);
            typesContainer.appendChild(typeSpan);
        });

        section.appendChild(heading);
        section.appendChild(typesContainer);
        return section;
    }

    /**
     * Creates bio section
     * @private
     * @param {string} bio - Pokemon bio text
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Bio section
     */
    _createBioSection(bio, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section');

        const heading = createSafeElement('h4', uiText.bio);
        const bioText = createSafeElement('p', bio || uiText.noBio);
        bioText.classList.add('pokemon-bio');

        section.appendChild(heading);
        section.appendChild(bioText);
        return section;
    }

    /**
     * Creates stats section
     * @private
     * @param {Object} stats - Pokemon stats
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Stats section
     */
    _createStatsSection(stats, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section');

        const heading = createSafeElement('h4', uiText.stats);
        const statsGrid = createSafeElement('div');
        statsGrid.classList.add('stats-grid');

        const statLabels = {
            hp: uiText.hp,
            attack: uiText.attack,
            defense: uiText.defense,
            'special-attack': uiText.specialAttack,
            'special-defense': uiText.specialDefense,
            speed: uiText.speed
        };

        Object.entries(statLabels).forEach(([statKey, statLabel]) => {
            if (stats[statKey] !== undefined) {
                const statItem = createSafeElement('div');
                statItem.classList.add('stat-item');
                
                const label = createSafeElement('strong', `${statLabel}:`);
                const value = createSafeElement('span', ` ${stats[statKey]}`);
                
                statItem.appendChild(label);
                statItem.appendChild(value);
                statsGrid.appendChild(statItem);
            }
        });

        section.appendChild(heading);
        section.appendChild(statsGrid);
        return section;
    }

    /**
     * Creates moves section
     * @private
     * @param {Array} moves - Pokemon moves array
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Moves section
     */
    _createMovesSection(moves, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section');

        const heading = createSafeElement('h4', uiText.moves);
        const movesList = createSafeElement('ul');
        movesList.classList.add('moves-list');

        if (!moves || moves.length === 0) {
            const noMovesItem = createSafeElement('li', uiText.noMoves);
            movesList.appendChild(noMovesItem);
        } else {
            moves.forEach(move => {
                const moveItem = this._createMoveItem(move, uiText);
                movesList.appendChild(moveItem);
            });
        }

        section.appendChild(heading);
        section.appendChild(movesList);
        return section;
    }

    /**
     * Creates individual move item
     * @private
     * @param {Object} move - Move data
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Move item element
     */
    _createMoveItem(move, uiText) {
        const currentLang = this.uiController.getCurrentLanguage();
        const moveName = currentLang === 'jp' ? (move.name_jp || move.name_en) : move.name_en;
        const moveType = currentLang === 'jp' ? (move.type_jp || move.type_en) : move.type_en;

        const listItem = createSafeElement('li');
        
        const nameElement = createSafeElement('strong', moveName);
        const typeElement = createSafeElement('span', ` (${moveType})`);
        const detailsElement = createSafeElement('small');
        
        const power = move.power || 'N/A';
        const accuracy = move.accuracy || 'N/A';
        const pp = move.pp || 'N/A';
        
        detailsElement.innerHTML = `<br>${uiText.movePower}: ${power}, ${uiText.moveAccuracy}: ${accuracy}, ${uiText.movePP}: ${pp}`;

        listItem.appendChild(nameElement);
        listItem.appendChild(typeElement);
        listItem.appendChild(detailsElement);

        return listItem;
    }

    /**
     * Shows the modal with transition
     * @private
     */
    _showModal() {
        if (!this.detailView) return;

        this.detailView.classList.add(CSS_CLASSES.SHOW);
        this.uiController.enableModalState();
        this.isVisible = true;

        // Focus management for accessibility
        setTimeout(() => {
            const closeButton = this.detailContent.querySelector(`#${ELEMENT_IDS.CLOSE_DETAIL}`);
            if (closeButton) {
                closeButton.focus();
            }
        }, ANIMATION.TRANSITION_DELAY_MS);
    }

    /**
     * Closes the detail view
     */
    closeDetailView() {
        if (!this.isVisible) return;

        this.detailView.classList.remove(CSS_CLASSES.SHOW);
        this.uiController.disableModalState();
        this.isVisible = false;

        // Clean up after transition
        setTimeout(() => {
            this.detailView.removeAttribute('data-pokemon-id');
            this.currentPokemon = null;
        }, ANIMATION.DURATION_MS);
    }

    /**
     * Plays Pokemon cry sound
     * @private
     * @param {number} pokemonId - Pokemon ID
     */
    _playPokemonCry(pokemonId) {
        const validId = validatePokemonId(pokemonId);
        if (!validId) return;

        try {
            const cryAudio = new Audio(`${DATA.CRY_AUDIO_PATH}${validId}.ogg`);
            cryAudio.volume = 0.3; // Set reasonable volume
            cryAudio.play().catch(error => {
                console.warn('Could not play Pokemon cry:', error);
            });
        } catch (error) {
            console.warn('Error creating audio element:', error);
        }
    }

    /**
     * Binds event listeners
     * @private
     */
    _bindEvents() {
        if (!this.detailView) return;

        // Modal click handling (delegation)
        this.detailView.addEventListener(EVENTS.CLICK, (event) => {
            if (event.target.id === ELEMENT_IDS.CLOSE_DETAIL || event.target === this.detailView) {
                this.closeDetailView();
            }
        });

        // Keyboard handling
        document.addEventListener(EVENTS.KEYDOWN, (event) => {
            if (event.key === KEYS.ESCAPE && this.isVisible) {
                this.closeDetailView();
            }
        });
    }

    /**
     * Refreshes detail view content (useful for language changes)
     */
    refreshContent() {
        if (this.currentPokemon && this.isVisible) {
            this._renderDetailContent(this.currentPokemon);
        }
    }

    /**
     * Gets current Pokemon being displayed
     * @returns {Object|null} Current Pokemon data or null
     */
    getCurrentPokemon() {
        return this.currentPokemon;
    }

    /**
     * Checks if detail view is currently visible
     * @returns {boolean} True if visible
     */
    isDetailVisible() {
        return this.isVisible;
    }
}
