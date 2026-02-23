/**
 * Pokemon Detail View - Handles the detailed Pokemon modal/overlay
 * @module PokemonDetailView
 */

import { ELEMENT_IDS, CSS_CLASSES, DATA, ANIMATION, EVENTS, KEYS } from '../constants.js';
import { createSafeElement, safeSetInnerHTML, validatePokemonId } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
import { TypeMatchupChart } from './typeMatchupChart.js';
import { EnhancedStatsDisplay } from './enhancedStatsDisplay.js';
import { createImageWithFallback } from '../utils/imageUtils.js';
import { formatPokemonHeader, getLocalizedPokemonSnapshot } from '../utils/pokemonPresentation.js';

/**
 * Manages the Pokemon detail modal view
 */
export class PokemonDetailView {
    constructor(dataManager, uiController, options = {}) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.detailView = document.getElementById(ELEMENT_IDS.DETAIL_VIEW);
        this.detailContent = document.getElementById(ELEMENT_IDS.DETAIL_CONTENT);
        this.currentPokemon = null;
        this.isVisible = false;

        const normalizedOptions = typeof options === 'function'
            ? { onClose: options }
            : options;

        this.teamBuilder = normalizedOptions.teamBuilder || null;
        this.pokemonComparison = normalizedOptions.pokemonComparison || null;
        this.onClose = normalizedOptions.onClose || null;

        this._boundModalClick = (event) => {
            if (event.target.id === ELEMENT_IDS.CLOSE_DETAIL || event.target === this.detailView) {
                this.closeDetailView();
            }
        };

        this._boundKeydown = (event) => {
            if (event.key === KEYS.ESCAPE && this.isVisible) {
                this.closeDetailView();
            }
        };

        this._bindEvents();
    }





    /**
     * Creates immunities section
     * @private
     * @param {Object} immunities - Immunities object
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Immunities section
     */
    _createImmunitiesSection(immunities, uiText) {
        return this._createTypeGridSection({
            sectionClass: 'immunity-item',
            headingText: uiText.immunities || 'Immunities',
            entries: immunities,
            multiplierText: () => '0×',
            titleBuilder: (type) => `Immune to ${type} type moves`
        });
    }

    /**
     * Creates abilities section
     * @private
     * @param {Array} abilities - Abilities array
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Abilities section
     */
    _createAbilitiesSection(abilities, uiText) {
        const currentLang = this.uiController.getCurrentLanguage();
        const section = createSafeElement('div');
        section.classList.add('detail-section', 'abilities-section');

        const heading = createSafeElement('h4', uiText.abilities || 'Abilities');
        const abilitiesList = createSafeElement('div');
        abilitiesList.classList.add('abilities-list');

        abilities.forEach(ability => {
            const abilityItem = createSafeElement('div');
            abilityItem.classList.add('ability-item');
            
            if (ability.is_hidden) {
                abilityItem.classList.add('hidden-ability');
            }
            
            const abilityName = currentLang === 'jp' ? 
                (ability.name_jp || ability.name_en) : ability.name_en;
            
            const nameSpan = createSafeElement('span', abilityName);
            nameSpan.classList.add('ability-name');
            
            abilityItem.appendChild(nameSpan);
            
            if (ability.is_hidden) {
                const hiddenBadge = createSafeElement('span', uiText.hiddenAbility || 'Hidden');
                hiddenBadge.classList.add('hidden-badge');
                abilityItem.appendChild(hiddenBadge);
            }
            
            abilitiesList.appendChild(abilityItem);
        });

        section.appendChild(heading);
        section.appendChild(abilitiesList);
        return section;
    }

    /**
     * Creates physical info section (height, weight, category)
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Physical info section
     */
    _createPhysicalInfoSection(pokemon, uiText) {
        const currentLang = this.uiController.getCurrentLanguage();
        const section = createSafeElement('div');
        section.classList.add('detail-section', 'physical-info-section');

        const heading = createSafeElement('h4', uiText.physicalInfo || 'Physical Info');
        const infoGrid = createSafeElement('div');
        infoGrid.classList.add('physical-info-grid');

        if (pokemon.genus_en || pokemon.genus_jp) {
            const categoryItem = createSafeElement('div');
            categoryItem.classList.add('info-item');
            
            const categoryLabel = createSafeElement('span', `${uiText.category}:`);
            categoryLabel.classList.add('info-label');
            
            const genus = currentLang === 'jp' ? 
                (pokemon.genus_jp || pokemon.genus_en) : pokemon.genus_en;
            const categoryValue = createSafeElement('span', genus);
            categoryValue.classList.add('info-value');
            
            categoryItem.appendChild(categoryLabel);
            categoryItem.appendChild(categoryValue);
            infoGrid.appendChild(categoryItem);
        }

        if (pokemon.height !== undefined && pokemon.height !== null) {
            const heightItem = createSafeElement('div');
            heightItem.classList.add('info-item');
            
            const heightLabel = createSafeElement('span', `${uiText.height}:`);
            heightLabel.classList.add('info-label');
            
            const heightValue = createSafeElement('span', `${pokemon.height} m`);
            heightValue.classList.add('info-value');
            
            heightItem.appendChild(heightLabel);
            heightItem.appendChild(heightValue);
            infoGrid.appendChild(heightItem);
        }

        if (pokemon.weight !== undefined && pokemon.weight !== null) {
            const weightItem = createSafeElement('div');
            weightItem.classList.add('info-item');
            
            const weightLabel = createSafeElement('span', `${uiText.weight}:`);
            weightLabel.classList.add('info-label');
            
            const weightValue = createSafeElement('span', `${pokemon.weight} kg`);
            weightValue.classList.add('info-value');
            
            weightItem.appendChild(weightLabel);
            weightItem.appendChild(weightValue);
            infoGrid.appendChild(weightItem);
        }

        section.appendChild(heading);
        section.appendChild(infoGrid);
        return section;
    }

    /**
     * Creates sprites section
     * @private
     * @param {Object} sprites - Sprites object
     * @param {string} name - Pokemon name
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Sprites section
     */
    _createSpritesSection(sprites, name, uiText) {
        const section = createSafeElement('div');
        section.classList.add('detail-section', 'sprites-section');

        const heading = createSafeElement('h4', uiText.sprites || 'Sprites');
        const spritesGrid = createSafeElement('div');
        spritesGrid.classList.add('sprites-grid');

        // Official artwork (if available)
        if (sprites.official_artwork) {
            const artworkContainer = createSafeElement('div');
            artworkContainer.classList.add('sprite-item', 'artwork-item');
            
            const artworkLabel = createSafeElement('div', uiText.officialArtwork || 'Official Artwork');
            artworkLabel.classList.add('sprite-label');
            
            const artworkImg = createSafeElement('img');
            artworkImg.src = sprites.official_artwork;
            artworkImg.alt = `${name} official artwork`;
            artworkImg.classList.add('sprite-image', 'artwork-image');
            
            artworkImg.addEventListener('error', () => {
                artworkContainer.style.display = 'none';
            });
            
            artworkContainer.appendChild(artworkLabel);
            artworkContainer.appendChild(artworkImg);
            spritesGrid.appendChild(artworkContainer);
        }

        // Normal sprites
        const normalContainer = createSafeElement('div');
        normalContainer.classList.add('sprite-group');
        
        if (sprites.front_default) {
            const frontItem = this._createSpriteItem(
                sprites.front_default, 
                `${name} front`, 
                uiText.normalSprite || 'Normal'
            );
            normalContainer.appendChild(frontItem);
        }
        
        if (sprites.back_default) {
            const backItem = this._createSpriteItem(
                sprites.back_default, 
                `${name} back`, 
                `${uiText.normalSprite || 'Normal'} (Back)`
            );
            normalContainer.appendChild(backItem);
        }
        
        if (normalContainer.children.length > 0) {
            spritesGrid.appendChild(normalContainer);
        }

        // Shiny sprites
        const shinyContainer = createSafeElement('div');
        shinyContainer.classList.add('sprite-group');
        
        if (sprites.front_shiny) {
            const shinyFrontItem = this._createSpriteItem(
                sprites.front_shiny, 
                `${name} shiny front`, 
                uiText.shinySprite || 'Shiny'
            );
            shinyFrontItem.classList.add('shiny-sprite');
            shinyContainer.appendChild(shinyFrontItem);
        }
        
        if (sprites.back_shiny) {
            const shinyBackItem = this._createSpriteItem(
                sprites.back_shiny, 
                `${name} shiny back`, 
                `${uiText.shinySprite || 'Shiny'} (Back)`
            );
            shinyBackItem.classList.add('shiny-sprite');
            shinyContainer.appendChild(shinyBackItem);
        }
        
        if (shinyContainer.children.length > 0) {
            spritesGrid.appendChild(shinyContainer);
        }

        section.appendChild(heading);
        section.appendChild(spritesGrid);
        return section;
    }

    /**
     * Creates individual sprite item
     * @private
     * @param {string} src - Image source URL
     * @param {string} alt - Alt text
     * @param {string} label - Sprite label
     * @returns {HTMLElement} Sprite item element
     */
    _createSpriteItem(src, alt, label) {
        const item = createSafeElement('div');
        item.classList.add('sprite-item');
        
        const labelDiv = createSafeElement('div', label);
        labelDiv.classList.add('sprite-label');
        
        const img = createSafeElement('img');
        img.src = src;
        img.alt = alt;
        img.classList.add('sprite-image');
        img.loading = 'lazy';
        
        img.addEventListener('error', () => {
            item.style.display = 'none';
        });
        
        item.appendChild(labelDiv);
        item.appendChild(img);
        
        return item;
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

        // Notify parent app that detail view is closing
        if (this.onClose && typeof this.onClose === 'function') {
            this.onClose();
        }

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
        if (!this.detailView) {
            return;
        }

        this.detailView.addEventListener(EVENTS.CLICK, this._boundModalClick);
        document.addEventListener(EVENTS.KEYDOWN, this._boundKeydown);
    }

    /**
     * Removes event listeners and clears references
     */
    destroy() {
        if (this.detailView) {
            this.detailView.removeEventListener(EVENTS.CLICK, this._boundModalClick);
        }
        document.removeEventListener(EVENTS.KEYDOWN, this._boundKeydown);
        this.currentPokemon = null;
        this.isVisible = false;
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
