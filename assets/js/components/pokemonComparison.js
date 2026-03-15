/**
 * Pokemon Comparison Component - Side-by-side Pokemon comparison
 * @module PokemonComparison
 */

import { createSafeElement } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
import { calculateTypeEffectiveness } from '../utils/typeEffectiveness.js';

const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

/**
 * Manages Pokemon comparison functionality
 */
export class PokemonComparison {
    constructor(dataManager, uiController) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.modal = null;
        this.selectedPokemon = [];
        this.maxComparisonSize = 3;
        this.mode = 'idle';
        this.boundEscapeHandler = null;
    }

    /**
     * Initialize comparison for a Pokemon
     * @param {number} pokemonId - Pokemon ID to start comparison with
     */
    startComparison(pokemonId) {
        this.selectedPokemon = [pokemonId];
        this.mode = 'selecting';
        this._showSelectorModal();
    }

    /**
     * Add a Pokemon to comparison
     * @param {number} pokemonId - Pokemon ID to compare
     */
    addToComparison(pokemonId) {
        if (!pokemonId || this.selectedPokemon.includes(pokemonId)) {
            return;
        }

        if (this.selectedPokemon.length >= this.maxComparisonSize) {
            const uiText = this._getUIText();
            this._announce(uiText.comparisonFull || 'Comparison is already full (3 Pokémon).');
            return;
        }

        this.selectedPokemon.push(pokemonId);

        if (this.selectedPokemon.length >= 2) {
            this.mode = 'comparing';
            this._showComparisonModal();
        } else {
            this.mode = 'selecting';
            this._showSelectorModal();
        }
    }

    /**
     * Check if in selection mode
     * @returns {boolean} True if selecting additional pokemon
     */
    isSelecting() {
        return this.mode === 'selecting';
    }

    /**
     * Get selected pokemon ids
     * @returns {number[]} Selected Pokemon IDs
     */
    getSelectedPokemonIds() {
        return [...this.selectedPokemon];
    }

    /**
     * Close current comparison flow
     */
    close() {
        this.mode = 'idle';
        this.selectedPokemon = [];
        this._removeModal();
        this._detachEscapeHandler();
    }

    /**
     * Destroy component
     */
    destroy() {
        this.close();
    }

    _showSelectorModal() {
        this._removeModal();

        const modal = createSafeElement('div');
        modal.classList.add('comparison-modal-overlay', 'comparison-selector-overlay');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'false');
        modal.setAttribute('aria-labelledby', 'comparison-selector-title');

        const content = createSafeElement('div');
        content.classList.add('comparison-modal-content');
        content.addEventListener('click', (event) => event.stopPropagation());
        const uiText = this._getUIText();

        const title = createSafeElement('h3', uiText.comparisonSelectTitle || 'Select Pokémon to Compare');
        title.id = 'comparison-selector-title';

        const instruction = createSafeElement(
            'p',
            this._formatText(
                uiText.comparisonSelectedCount || '{selected}/{max} selected. Click a card to add another Pokémon.',
                {
                    selected: this.selectedPokemon.length,
                    max: this.maxComparisonSize
                }
            )
        );
        instruction.classList.add('comparison-instruction');

        const actions = createSafeElement('div');
        actions.classList.add('comparison-actions');

        const cancelButton = createSafeElement('button', uiText.comparisonCancel || 'Cancel');
        cancelButton.classList.add('comparison-btn');
        cancelButton.addEventListener('click', () => this.close());

        actions.appendChild(cancelButton);
        content.appendChild(title);
        content.appendChild(instruction);
        content.appendChild(actions);
        modal.appendChild(content);

        document.body.appendChild(modal);
        this.modal = modal;
        this._attachEscapeHandler();
        cancelButton.focus();
    }

    _showComparisonModal() {
        this._removeModal();

        const pokemons = this.selectedPokemon
            .map((pokemonId) => this.dataManager.getPokemonById(pokemonId))
            .filter(Boolean);

        if (pokemons.length < 2) {
            this.mode = 'selecting';
            this._showSelectorModal();
            return;
        }

        const modal = createSafeElement('div');
        modal.classList.add('comparison-modal-overlay');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'comparison-title');

        const content = createSafeElement('div');
        content.classList.add('comparison-modal-content');
        content.addEventListener('click', (event) => event.stopPropagation());
        const uiText = this._getUIText();

        const title = createSafeElement('h2', uiText.comparisonTitle || 'Pokémon Comparison');
        title.id = 'comparison-title';
        title.classList.add('comparison-title');

        const headers = this._createPokemonHeaders(pokemons, uiText);
        const stats = this._createStatsTable(pokemons, uiText, headers.headerCards);
        const controls = this._createComparisonControls(uiText);

        content.appendChild(title);
        content.appendChild(headers.container);
        content.appendChild(stats);
        content.appendChild(controls);
        modal.appendChild(content);

        modal.addEventListener('click', () => this.close());
        document.body.appendChild(modal);
        this.modal = modal;
        this._attachEscapeHandler();

        const closeButton = controls.querySelector('.comparison-btn-close');
        if (closeButton) {
            closeButton.focus();
        }
    }

    _createPokemonHeaders(pokemons, uiText) {
        const container = createSafeElement('div');
        container.classList.add('comparison-header-grid');
        const headerCards = [];

        pokemons.forEach((pokemon, index) => {
            const card = createSafeElement('div');
            card.classList.add('comparison-pokemon-header');
            card.setAttribute('data-column-index', String(index));

            const image = createSafeElement('img');
            image.src = pokemon.sprite;
            image.alt = this._getPokemonName(pokemon);
            image.classList.add('comparison-pokemon-image');

            const name = createSafeElement('h3', `${this._getPokemonName(pokemon)} #${String(pokemon.id).padStart(3, '0')}`);
            name.classList.add('comparison-pokemon-name');

            const typeContainer = createSafeElement('div');
            typeContainer.classList.add('comparison-types-container');
            this._getPokemonTypes(pokemon).forEach((type) => {
                const badge = createSafeElement('span', type);
                badge.classList.add('type-badge', `type-${getTypeClassName(type)}`);
                typeContainer.appendChild(badge);
            });

            const matchupContainer = this._createMatchupChips(pokemons, index, uiText);

            card.appendChild(image);
            card.appendChild(name);
            card.appendChild(typeContainer);
            card.appendChild(matchupContainer);
            container.appendChild(card);
            headerCards.push(card);
        });

        return { container, headerCards };
    }

    _createStatsTable(pokemons, uiText, headerCards = []) {
        const section = createSafeElement('section');
        section.classList.add('comparison-stats-section');

        const heading = createSafeElement('h4', uiText.comparisonStats || 'Stats');
        heading.classList.add('comparison-section-title');
        section.appendChild(heading);

        const table = createSafeElement('table');
        table.classList.add('comparison-stats-table');

        const headerRow = createSafeElement('tr');
        headerRow.appendChild(createSafeElement('th', uiText.comparisonStatLabel || 'Stat'));
        const columnHeaders = [];
        pokemons.forEach((pokemon) => {
            const headerCell = createSafeElement('th', this._getPokemonName(pokemon));
            headerCell.classList.add('comparison-pokemon-column-header');
            headerRow.appendChild(headerCell);
            columnHeaders.push(headerCell);
        });
        table.appendChild(headerRow);
        const columnWinCounts = new Array(pokemons.length).fill(0);
        const columnCells = new Array(pokemons.length).fill(null).map(() => []);

        STAT_KEYS.forEach((statKey) => {
            const row = createSafeElement('tr');
            row.appendChild(createSafeElement('td', this._getStatLabel(statKey, uiText)));

            const values = pokemons.map((pokemon) => pokemon.stats?.[statKey] || 0);
            const maxValue = Math.max(...values);

            values.forEach((value, index) => {
                const cell = createSafeElement('td', String(value));
                if (value === maxValue && maxValue > 0) {
                    cell.classList.add('comparison-winner');
                    columnWinCounts[index] += 1;
                }
                columnCells[index].push(cell);
                row.appendChild(cell);
            });

            table.appendChild(row);
        });

        const topWinCount = Math.max(...columnWinCounts);
        if (topWinCount > 0) {
            columnWinCounts.forEach((wins, index) => {
                if (wins === topWinCount) {
                    columnHeaders[index]?.classList.add('comparison-column-winner');
                    headerCards[index]?.classList.add('comparison-column-winner');
                    columnCells[index].forEach((cell) => cell.classList.add('comparison-column-winner'));
                }
            });
        }

        section.appendChild(table);
        return section;
    }

    _createMatchupChips(pokemons, currentIndex, uiText) {
        const chipsContainer = createSafeElement('div');
        chipsContainer.classList.add('comparison-matchup-chips');

        const sourcePokemon = pokemons[currentIndex];
        const sourceTypes = sourcePokemon?.types_en || [];
        if (!sourceTypes.length) {
            return chipsContainer;
        }

        pokemons.forEach((targetPokemon, targetIndex) => {
            if (targetIndex === currentIndex) {
                return;
            }

            const targetTypes = targetPokemon?.types_en || [];
            if (!targetTypes.length) {
                return;
            }

            const multipliers = sourceTypes.map((type) => calculateTypeEffectiveness(type, targetTypes));
            const bestMultiplier = multipliers.length ? Math.max(...multipliers) : 1;
            const category = this._getMatchupCategory(bestMultiplier);
            const chipLabelTemplate = this._getMatchupLabel(category, uiText);
            const chipLabel = this._formatText(chipLabelTemplate, { name: this._getPokemonName(targetPokemon) });
            const chip = createSafeElement('span', `${chipLabel} (${bestMultiplier}×)`);

            chip.classList.add('comparison-matchup-chip', `comparison-matchup-${category}`);
            chipsContainer.appendChild(chip);
        });

        return chipsContainer;
    }

    _getMatchupCategory(multiplier) {
        if (multiplier > 1) {
            return 'strong';
        }
        if (multiplier < 1) {
            return 'weak';
        }
        return 'neutral';
    }

    _getMatchupLabel(category, uiText) {
        if (category === 'strong') {
            return uiText.comparisonStrongVs || 'Strong vs {name}';
        }
        if (category === 'weak') {
            return uiText.comparisonWeakVs || 'Weak vs {name}';
        }
        return uiText.comparisonNeutralVs || 'Neutral vs {name}';
    }

    _createComparisonControls(uiText) {
        const controls = createSafeElement('div');
        controls.classList.add('comparison-controls');

        if (this.selectedPokemon.length < this.maxComparisonSize) {
            const addButton = createSafeElement('button', uiText.comparisonAddThird || 'Add Third Pokémon');
            addButton.classList.add('comparison-btn');
            addButton.addEventListener('click', () => {
                this.mode = 'selecting';
                this._showSelectorModal();
            });
            controls.appendChild(addButton);
        }

        const resetButton = createSafeElement('button', uiText.comparisonStartOver || 'Start Over');
        resetButton.classList.add('comparison-btn');
        resetButton.addEventListener('click', () => {
            const firstPokemon = this.selectedPokemon[0];
            if (firstPokemon) {
                this.startComparison(firstPokemon);
            } else {
                this.close();
            }
        });

        const closeButton = createSafeElement('button', uiText.comparisonClose || 'Close');
        closeButton.classList.add('comparison-btn', 'comparison-btn-close');
        closeButton.addEventListener('click', () => this.close());

        controls.appendChild(resetButton);
        controls.appendChild(closeButton);
        return controls;
    }

    _attachEscapeHandler() {
        this._detachEscapeHandler();
        this.boundEscapeHandler = (event) => {
            if (event.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.boundEscapeHandler);
    }

    _detachEscapeHandler() {
        if (this.boundEscapeHandler) {
            document.removeEventListener('keydown', this.boundEscapeHandler);
            this.boundEscapeHandler = null;
        }
    }

    _removeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    _announce(message) {
        if (message && this.uiController && typeof this.uiController.announceToScreenReader === 'function') {
            this.uiController.announceToScreenReader(message);
        }
    }

    _getUIText() {
        if (this.uiController && typeof this.uiController.getCurrentUIText === 'function') {
            return this.uiController.getCurrentUIText();
        }
        return {};
    }

    _getLanguage() {
        if (this.uiController && typeof this.uiController.getCurrentLanguage === 'function') {
            return this.uiController.getCurrentLanguage();
        }
        return 'en';
    }

    _getPokemonName(pokemon) {
        return this.dataManager.getPokemonName(pokemon, this._getLanguage());
    }

    _getPokemonTypes(pokemon) {
        return this.dataManager.getPokemonTypes(pokemon, this._getLanguage());
    }

    _getStatLabel(statKey, uiText) {
        const labels = {
            hp: uiText.hp || 'HP',
            attack: uiText.attack || 'Attack',
            defense: uiText.defense || 'Defense',
            'special-attack': uiText.specialAttack || 'Sp. Atk',
            'special-defense': uiText.specialDefense || 'Sp. Def',
            speed: uiText.speed || 'Speed'
        };
        return labels[statKey] || statKey;
    }

    _formatText(template, values) {
        return Object.entries(values).reduce(
            (text, [key, value]) => text.replace(`{${key}}`, String(value)),
            template
        );
    }

    /**
     * Refreshes open comparison UI after language changes.
     */
    refreshUI() {
        if (!this.modal) {
            return;
        }

        if (this.mode === 'selecting') {
            this._showSelectorModal();
            return;
        }

        if (this.mode === 'comparing') {
            this._showComparisonModal();
        }
    }
}
