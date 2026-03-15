/**
 * Pokemon Detail View - Handles the detailed Pokemon modal/overlay
 * @module PokemonDetailView
 */

import { ELEMENT_IDS, CSS_CLASSES, DATA, ANIMATION, EVENTS, KEYS } from '../constants.js';
import { createSafeElement, validatePokemonId } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
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
        this.onCompare = normalizedOptions.onCompare || null;
        this.onTeamToggle = normalizedOptions.onTeamToggle || null;
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
        listItem.classList.add('move-item');

        const moveHeader = createSafeElement('div');
        moveHeader.classList.add('move-header');

        const moveNameContainer = createSafeElement('div');
        moveNameContainer.classList.add('move-name-container');

        const nameElement = createSafeElement('strong', moveName);
        moveNameContainer.appendChild(nameElement);

        // Add romaji for move name if in Japanese mode
        if (currentLang === 'jp' && move.name_romaji) {
            const romajiElement = createSafeElement('span', ` (${move.name_romaji})`);
            romajiElement.classList.add('move-name-romaji');
            moveNameContainer.appendChild(romajiElement);
        }

        // Add level indicator if available
        if (move.level !== undefined && move.level !== null) {
            const levelBadge = createSafeElement('span',
                move.level === 0 ? '—' : `${uiText.moveLevel || 'Lv.'} ${move.level}`
            );
            levelBadge.classList.add('move-level-badge');
            moveNameContainer.appendChild(levelBadge);
        }

        const typeElement = createSafeElement('span', ' ');
        const typeTextSpan = createSafeElement('span', moveType);
        typeElement.appendChild(typeTextSpan);

        // Add romaji for move type if in Japanese mode
        if (currentLang === 'jp' && move.type_romaji) {
            const typeRomajiSpan = createSafeElement('span', ` (${move.type_romaji})`);
            typeRomajiSpan.classList.add('move-type-romaji');
            typeElement.appendChild(typeRomajiSpan);
        }

        moveHeader.appendChild(moveNameContainer);
        moveHeader.appendChild(typeElement);

        const detailsElement = createSafeElement('small');

        const power = move.power || 'N/A';
        const accuracy = move.accuracy || 'N/A';
        const pp = move.pp || 'N/A';
        const damageClass = this._formatMoveDamageClass(move, uiText);

        detailsElement.textContent = `${uiText.movePower}: ${power}, ${uiText.moveAccuracy}: ${accuracy}, ${uiText.movePP}: ${pp}${damageClass ? `, ${uiText.moveDamageClass || 'Class'}: ${damageClass}` : ''}`;

        listItem.appendChild(moveHeader);
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
        const heading = createSafeElement('h4', uiText.evolutionChain || 'Evolution Chain');
        const content = createSafeElement('div');
        content.classList.add('evolution-chain-content', 'expanded');
        content.setAttribute('role', 'region');
        content.setAttribute('aria-label', 'Evolution chain details');
        const normalized = this._normalizeEvolutionChain(pokemon.evolution_chain);
        const tree = this._createEvolutionTree(normalized, pokemon.id, uiText);
        content.appendChild(tree);

        section.appendChild(heading);
        section.appendChild(content);
        return section;
    }

    /**
     * Normalizes legacy and enriched evolution data into a single shape.
     * @private
     * @param {Array|Object} evolutionChain - Evolution chain payload
     * @returns {{nodes: Array, transitions: Array}} Normalized chain
     */
    _normalizeEvolutionChain(evolutionChain) {
        if (evolutionChain && !Array.isArray(evolutionChain)) {
            return {
                nodes: evolutionChain.nodes || [],
                transitions: evolutionChain.transitions || []
            };
        }

        const nodes = Array.isArray(evolutionChain) ? evolutionChain : [];
        const transitions = [];
        for (let i = 1; i < nodes.length; i += 1) {
            transitions.push({
                from_id: nodes[i - 1].id,
                to_id: nodes[i].id,
                methods: [{ description: 'Unknown method' }]
            });
        }
        return { nodes, transitions };
    }

    /**
     * Creates a branch-capable evolution tree.
     * @private
     * @param {Object} chain - Normalized chain data
     * @param {number} currentPokemonId - Current Pokemon ID
     * @param {Object} uiText - Localized UI text
     * @returns {HTMLElement} Tree element
     */
    _createEvolutionTree(chain, currentPokemonId, uiText) {
        const container = createSafeElement('div');
        container.classList.add('evolution-tree');

        const nodesById = new Map(chain.nodes.map((node) => [node.id, node]));
        const childrenByParent = new Map();
        const childIds = new Set();

        chain.transitions.forEach((transition) => {
            if (!childrenByParent.has(transition.from_id)) {
                childrenByParent.set(transition.from_id, []);
            }
            childrenByParent.get(transition.from_id).push(transition);
            childIds.add(transition.to_id);
        });

        const rootNodes = chain.nodes.filter((node) => !childIds.has(node.id));
        const roots = rootNodes.length > 0 ? rootNodes : chain.nodes.slice(0, 1);

        roots.forEach((root) => {
            container.appendChild(
                this._renderEvolutionNode(root, nodesById, childrenByParent, currentPokemonId, uiText)
            );
        });

        return container;
    }

    /**
     * Renders one node and its child branches recursively.
     * @private
     */
    _renderEvolutionNode(node, nodesById, childrenByParent, currentPokemonId, uiText) {
        const wrapper = createSafeElement('div');
        wrapper.classList.add('evolution-node-wrapper');
        wrapper.appendChild(this._createEvolutionItem(node, currentPokemonId));

        const transitions = childrenByParent.get(node.id) || [];
        if (transitions.length === 0) {
            return wrapper;
        }

        const branches = createSafeElement('div');
        branches.classList.add('evolution-branches');

        transitions.forEach((transition) => {
            const child = nodesById.get(transition.to_id);
            if (!child) {
                return;
            }

            const branch = createSafeElement('div');
            branch.classList.add('evolution-branch');

            const edge = createSafeElement('div');
            edge.classList.add('evolution-branch-edge');
            const methodLabel = this._formatEvolutionMethods(transition.methods, uiText);
            edge.textContent = `→ ${methodLabel}`;

            branch.appendChild(edge);
            branch.appendChild(
                this._renderEvolutionNode(child, nodesById, childrenByParent, currentPokemonId, uiText)
            );
            branches.appendChild(branch);
        });

        wrapper.appendChild(branches);
        return wrapper;
    }

    /**
     * Formats evolution method text for display.
     * @private
     */
    _formatEvolutionMethods(methods, uiText) {
        if (!methods || methods.length === 0) {
            return `${uiText.evolutionMethod || 'Method'}: Unknown`;
        }

        const descriptions = methods
            .map((method) => method.description)
            .filter(Boolean);

        if (descriptions.length === 0) {
            return `${uiText.evolutionMethod || 'Method'}: Unknown`;
        }

        return `${uiText.evolutionMethod || 'Method'}: ${descriptions.join(' / ')}`;
    }

    /**
     * Localizes move damage class text.
     * @private
     * @param {Object} move - Move data
     * @param {Object} uiText - Localized text
     * @returns {string|null} Formatted class name
     */
    _formatMoveDamageClass(move, uiText) {
        const damageClass = (move.damage_class || '').toLowerCase();
        if (!damageClass) {
            return null;
        }

        if (damageClass === 'physical') {
            return uiText.damageClassPhysical || 'Physical';
        }
        if (damageClass === 'special') {
            return uiText.damageClassSpecial || 'Special';
        }
        if (damageClass === 'status') {
            return uiText.damageClassStatus || 'Status';
        }

        return move.damage_class_en || move.damage_class;
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
        } else {
            // Make non-current evolution items clickable
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `View ${evolution.name} details`);
            item.style.cursor = 'pointer';

            // Add click handler
            item.addEventListener(EVENTS.CLICK, (event) => {
                event.stopPropagation();
                this._handleEvolutionClick(evolution.id);
            });

            // Add keyboard handler for accessibility
            item.addEventListener(EVENTS.KEYDOWN, (event) => {
                if (event.key === KEYS.ENTER || event.key === KEYS.SPACE) {
                    event.preventDefault();
                    event.stopPropagation();
                    this._handleEvolutionClick(evolution.id);
                }
            });
        }

        // Create image with error handling and CDN fallback
        const img = createImageWithFallback(
            `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${evolution.id}.png`,
            evolution.name,
            {
                onError: (failedImg) => {
                    const errorContainer = this._createImageErrorFallback(evolution.name);
                    item.replaceChild(errorContainer, failedImg);
                }
            }
        );
        img.loading = 'lazy';

        const nameSpan = createSafeElement('span', evolution.name);
        nameSpan.classList.add('evolution-name');

        item.appendChild(img);
        item.appendChild(nameSpan);

        return item;
    }

    /**
     * Handles evolution item click
     * @private
     * @param {number} pokemonId - Pokemon ID to show
     */
    _handleEvolutionClick(pokemonId) {
        const pokemon = this.dataManager.getPokemonById(pokemonId);
        if (pokemon) {
            this.showPokemonDetail(pokemon);
        }
    }

    /**
     * Creates a generic type effectiveness grid section
     * @private
     */
    _createTypeGridSection({ sectionClass, headingText, entries, multiplierText, titleBuilder }) {
        const section = createSafeElement('div');
        section.classList.add('detail-section');

        const heading = createSafeElement('h4', headingText);
        const grid = createSafeElement('div');
        grid.classList.add('weaknesses-grid');

        Object.entries(entries).forEach(([type, multiplier]) => {
            const item = createSafeElement('div');
            item.classList.add(sectionClass);
            item.classList.add(`type-${type.toLowerCase()}`);

            const typeText = createSafeElement('span', type);
            const multiplierSpan = createSafeElement('span', multiplierText(multiplier));
            multiplierSpan.classList.add('multiplier');

            item.appendChild(typeText);
            item.appendChild(multiplierSpan);
            item.setAttribute('title', titleBuilder(type, multiplier));

            grid.appendChild(item);
        });

        section.appendChild(heading);
        section.appendChild(grid);
        return section;
    }

    /**
     * Creates compact weaknesses section
     * @private
     * @param {Object} weaknesses - Weaknesses object
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Weaknesses section
     */
    _createWeaknessesSection(weaknesses, uiText) {
        return this._createTypeGridSection({
            sectionClass: 'weakness-item',
            headingText: uiText.weaknesses || 'Weaknesses',
            entries: weaknesses,
            multiplierText: (multiplier) => `${multiplier}×`,
            titleBuilder: (type, multiplier) => `Takes ${multiplier}× damage from ${type} type moves`
        });
    }

    /**
     * Creates type effectiveness section with weaknesses, resistances, and immunities
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement|null} Type effectiveness section or null
     */
    _createTypeEffectivenessSection(pokemon, uiText) {
        const hasWeaknesses = pokemon.weaknesses && Object.keys(pokemon.weaknesses).length > 0;
        const hasResistances = pokemon.resistances && Object.keys(pokemon.resistances).length > 0;
        const hasImmunities = pokemon.immunities && Object.keys(pokemon.immunities).length > 0;

        if (!hasWeaknesses && !hasResistances && !hasImmunities) {
            return null;
        }

        const container = createSafeElement('div');
        container.classList.add('type-effectiveness-container');

        if (hasWeaknesses) {
            container.appendChild(this._createWeaknessesSection(pokemon.weaknesses, uiText));
        }

        if (hasResistances) {
            container.appendChild(this._createResistancesSection(pokemon.resistances, uiText));
        }

        if (hasImmunities) {
            container.appendChild(this._createImmunitiesSection(pokemon.immunities, uiText));
        }

        return container;
    }

    /**
     * Creates resistances section
     * @private
     * @param {Object} resistances - Resistances object
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement} Resistances section
     */
    _createResistancesSection(resistances, uiText) {
        return this._createTypeGridSection({
            sectionClass: 'resistance-item',
            headingText: uiText.resistances || 'Resistances',
            entries: resistances,
            multiplierText: (multiplier) => `${multiplier}×`,
            titleBuilder: (type, multiplier) => `Takes ${multiplier}× damage from ${type} type moves`
        });
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
     * Creates comparison/team actions for detail view
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {Object} uiText - UI text object
     * @returns {HTMLElement|null} Action section
     */
    _createActionSection(pokemon, uiText) {
        if (!this.teamBuilder && !this.pokemonComparison) {
            return null;
        }

        const section = createSafeElement('div');
        section.classList.add('detail-section', 'detail-action-section');

        const buttonRow = createSafeElement('div');
        buttonRow.classList.add('detail-action-buttons');

        if (this.pokemonComparison) {
            const compareButton = createSafeElement('button', uiText.comparePokemon || 'Compare');
            compareButton.classList.add('detail-action-btn', 'detail-action-compare');
            compareButton.setAttribute('type', 'button');
            compareButton.addEventListener(EVENTS.CLICK, () => {
                if (typeof this.onCompare === 'function') {
                    this.onCompare(pokemon);
                } else if (this.pokemonComparison.isSelecting()) {
                    this.pokemonComparison.addToComparison(pokemon.id);
                } else {
                    this.pokemonComparison.startComparison(pokemon.id);
                }
            });
            buttonRow.appendChild(compareButton);
        }

        if (this.teamBuilder) {
            const inTeam = this.teamBuilder.isInTeam(pokemon.id);
            const teamButton = createSafeElement(
                'button',
                inTeam ? (uiText.removeFromTeam || 'Remove from Team') : (uiText.addToTeam || 'Add to Team')
            );
            teamButton.classList.add('detail-action-btn', 'detail-action-team');
            teamButton.setAttribute('type', 'button');
            teamButton.addEventListener(EVENTS.CLICK, () => {
                if (typeof this.onTeamToggle === 'function') {
                    this.onTeamToggle(pokemon);
                } else if (inTeam) {
                    this.teamBuilder.removeFromTeam(pokemon.id);
                } else {
                    this.teamBuilder.addToTeam(pokemon.id);
                }
                this._renderDetailContent(pokemon);
            });
            buttonRow.appendChild(teamButton);
        }

        section.appendChild(buttonRow);
        return section;
    }

    /**
     * Shows detail modal for a pokemon
     * @param {Object} pokemon - Pokemon data
     */
    showPokemonDetail(pokemon) {
        if (!pokemon || !this.detailView || !this.detailContent) {
            return;
        }

        this.currentPokemon = pokemon;
        this.detailView.setAttribute('data-pokemon-id', String(pokemon.id));
        this._renderDetailContent(pokemon);
        this._showModal();
        this._playPokemonCry(pokemon.id);
    }

    /**
     * Renders all detail content for selected pokemon
     * @private
     * @param {Object} pokemon - Pokemon data
     */
    _renderDetailContent(pokemon) {
        if (!this.detailContent) {
            return;
        }

        const currentLang = this.uiController.getCurrentLanguage();
        const uiText = this.uiController.getCurrentUIText();
        const { name, types, bio } = getLocalizedPokemonSnapshot(this.dataManager, pokemon, currentLang);

        this.detailContent.innerHTML = '';

        const modalContent = createSafeElement('div');
        modalContent.classList.add('detail-modal-content');

        const closeButton = createSafeElement('button', uiText.close || 'Close');
        closeButton.id = ELEMENT_IDS.CLOSE_DETAIL;
        closeButton.classList.add('close-detail-btn');
        closeButton.setAttribute('aria-label', uiText.close || 'Close details');

        const header = createSafeElement('div');
        header.classList.add('detail-header');

        const imageWrap = createSafeElement('div');
        imageWrap.classList.add('detail-image-wrap');
        const img = createImageWithFallback(pokemon.sprite, name, {
            className: 'detail-pokemon-image',
            onError: (failedImg) => {
                const fallback = this._createImageErrorFallback(name);
                imageWrap.replaceChild(fallback, failedImg);
            }
        });
        imageWrap.appendChild(img);

        const meta = createSafeElement('div');
        meta.classList.add('detail-meta');
        meta.appendChild(createSafeElement('h2', formatPokemonHeader(name, pokemon.id)));

        const typesWrap = createSafeElement('div');
        typesWrap.classList.add('pokemon-types');
        types.forEach((type) => {
            const t = createSafeElement('span', type);
            t.classList.add(`type-${getTypeClassName(type)}`);
            typesWrap.appendChild(t);
        });
        meta.appendChild(typesWrap);

        header.appendChild(imageWrap);
        header.appendChild(meta);

        modalContent.appendChild(closeButton);
        modalContent.appendChild(header);

        const bioSection = createSafeElement('div');
        bioSection.classList.add('detail-section');
        bioSection.appendChild(createSafeElement('h4', uiText.bio || 'Bio'));
        bioSection.appendChild(createSafeElement('p', bio || 'No description available.'));
        modalContent.appendChild(bioSection);

        const actionSection = this._createActionSection(pokemon, uiText);
        if (actionSection) {
            modalContent.appendChild(actionSection);
        }

        if (pokemon.stats) {
            modalContent.appendChild(EnhancedStatsDisplay.createStatsSection(pokemon.stats, uiText));
        }

        if (pokemon.height || pokemon.weight || pokemon.genus_en || pokemon.genus_jp) {
            modalContent.appendChild(this._createPhysicalInfoSection(pokemon, uiText));
        }

        if (pokemon.abilities?.length) {
            modalContent.appendChild(this._createAbilitiesSection(pokemon.abilities, uiText));
        }

        if (pokemon.sprites) {
            modalContent.appendChild(this._createSpritesSection(pokemon.sprites, name, uiText));
        }

        const typeSection = this._createTypeEffectivenessSection(pokemon, uiText);
        if (typeSection) {
            modalContent.appendChild(typeSection);
        }

        modalContent.appendChild(this._createMovesSection(pokemon.moves, uiText));

        const hasEvolutionChain =
            (Array.isArray(pokemon.evolution_chain) && pokemon.evolution_chain.length > 0) ||
            (
                pokemon.evolution_chain &&
                !Array.isArray(pokemon.evolution_chain) &&
                Array.isArray(pokemon.evolution_chain.nodes) &&
                pokemon.evolution_chain.nodes.length > 0
            );

        if (hasEvolutionChain) {
            modalContent.appendChild(this._createEvolutionChainSection(pokemon, uiText));
        }

        this.detailContent.appendChild(modalContent);
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
