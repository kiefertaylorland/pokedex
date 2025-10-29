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
        
        // Add evolution chain if available
        if (pokemon.evolution_chain && pokemon.evolution_chain.length > 1) {
            modalContent.appendChild(this._createEvolutionChainSection(pokemon, uiText));
        }
        
        // Add weaknesses if available
        if (pokemon.weaknesses && Object.keys(pokemon.weaknesses).length > 0) {
            modalContent.appendChild(this._createWeaknessesSection(pokemon.weaknesses, uiText));
        }
        
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
        closeButton.setAttribute('data-testid', 'close-detail-button');
        return closeButton;
    }

    /**
     * Creates Pokemon image with shake animation and error handling
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {string} name - Pokemon name
     * @returns {HTMLElement} Image element or error container
     */
    _createPokemonImage(pokemon, name) {
        const container = createSafeElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.minHeight = '120px';
        
        const img = createSafeElement('img');
        img.src = pokemon.sprite;
        img.alt = name;
        img.style.width = '120px';
        img.style.height = '120px';
        img.classList.add('pokemon-detail-image');
        
        // Add error handler
        img.addEventListener('error', () => {
            const errorFallback = this._createImageErrorFallback(name);
            errorFallback.style.width = '120px';
            errorFallback.style.height = '120px';
            container.replaceChild(errorFallback, img);
        }, { once: true });
        
        // Add shake animation
        setTimeout(() => {
            if (img.parentNode) { // Check if image is still in DOM (not replaced by error)
                img.classList.add(CSS_CLASSES.SPRITE_SHAKE);
                img.addEventListener(EVENTS.ANIMATION_END, () => {
                    img.classList.remove(CSS_CLASSES.SPRITE_SHAKE);
                }, { once: true });
            }
        }, ANIMATION.TRANSITION_DELAY_MS);

        container.appendChild(img);
        return container;
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
     * Creates evolution chain section
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Evolution chain section
     */
    _createEvolutionChainSection(pokemon, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section', 'evolution-chain-container');

        // Create toggle button
        const toggleButton = createSafeElement('button');
        toggleButton.classList.add('evolution-chain-toggle');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Toggle evolution chain');
        toggleButton.setAttribute('data-testid', 'evolution-chain-toggle');
        toggleButton.setAttribute('type', 'button');
        
        const titleSpan = createSafeElement('span', uiText.evolutionChain || 'Evolution Chain');
        const arrowSpan = createSafeElement('span', '▶');
        arrowSpan.classList.add('arrow');
        
        toggleButton.appendChild(titleSpan);
        toggleButton.appendChild(arrowSpan);

        // Create content container
        const content = createSafeElement('div');
        content.classList.add('evolution-chain-content');
        content.setAttribute('role', 'region');
        content.setAttribute('aria-label', 'Evolution chain details');

        const chainList = createSafeElement('div');
        chainList.classList.add('evolution-chain-list');

        // Add evolution items
        pokemon.evolution_chain.forEach((evo, index) => {
            if (index > 0) {
                const arrow = createSafeElement('span', '→');
                arrow.classList.add('evolution-arrow');
                arrow.setAttribute('aria-hidden', 'true');
                chainList.appendChild(arrow);
            }

            const evoItem = this._createEvolutionItem(evo, pokemon.id);
            chainList.appendChild(evoItem);
        });

        content.appendChild(chainList);

        // Add toggle event
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            toggleButton.setAttribute('aria-expanded', !isExpanded);
            toggleButton.classList.toggle('expanded');
            content.classList.toggle('expanded');
        });

        section.appendChild(toggleButton);
        section.appendChild(content);
        return section;
    }

    /**
     * Creates individual evolution item
     * @private
     * @param {Object} evolution - Evolution data
     * @param {number} currentPokemonId - Current Pokemon ID
     * @returns {HTMLElement} Evolution item element
     */
    _createEvolutionItem(evolution, currentPokemonId) {
        const item = createSafeElement('div');
        item.classList.add('evolution-item');
        
        if (evolution.id === currentPokemonId) {
            item.classList.add('current');
            item.setAttribute('aria-current', 'true');
        }

        // Create image with error handling
        const img = createSafeElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.id}.png`;
        img.alt = evolution.name;
        img.loading = 'lazy';
        
        // Add error handler
        img.addEventListener('error', () => {
            const errorContainer = this._createImageErrorFallback(evolution.name);
            item.replaceChild(errorContainer, img);
        });

        const nameSpan = createSafeElement('span', evolution.name);
        nameSpan.classList.add('evolution-name');

        item.appendChild(img);
        item.appendChild(nameSpan);

        return item;
    }

    /**
     * Creates weaknesses section
     * @private
     * @param {Object} weaknesses - Weaknesses object
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Weaknesses section
     */
    _createWeaknessesSection(weaknesses, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section');

        const heading = createSafeElement('h4', uiText.weaknesses || 'Weaknesses');
        const weaknessesGrid = createSafeElement('div');
        weaknessesGrid.classList.add('weaknesses-grid');

        Object.entries(weaknesses).forEach(([type, multiplier]) => {
            const weaknessItem = createSafeElement('div');
            weaknessItem.classList.add('weakness-item');
            weaknessItem.classList.add(`type-${type.toLowerCase()}`);
            
            const typeName = createSafeElement('div', type);
            const multiplierSpan = createSafeElement('span', `${multiplier}×`);
            multiplierSpan.classList.add('multiplier');
            
            weaknessItem.appendChild(typeName);
            weaknessItem.appendChild(multiplierSpan);
            weaknessItem.setAttribute('title', `Takes ${multiplier}× damage from ${type} type moves`);
            
            weaknessesGrid.appendChild(weaknessItem);
        });

        section.appendChild(heading);
        section.appendChild(weaknessesGrid);
        return section;
    }

    /**
     * Creates image error fallback
     * @private
     * @param {string} pokemonName - Pokemon name
     * @returns {HTMLElement} Error fallback element
     */
    _createImageErrorFallback(pokemonName) {
        const container = createSafeElement('div');
        container.classList.add('image-error-container');
        
        const icon = createSafeElement('div', '⚠️');
        icon.classList.add('image-error-icon');
        icon.setAttribute('aria-hidden', 'true');
        
        const text = createSafeElement('div', 'Image not available');
        text.classList.add('image-error-text');
        
        container.appendChild(icon);
        container.appendChild(text);
        container.setAttribute('role', 'img');
        container.setAttribute('aria-label', `${pokemonName} image not available`);
        
        return container;
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
