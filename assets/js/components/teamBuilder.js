/**
 * Team Builder Component - Build and manage Pokemon teams
 * @module TeamBuilder
 */

import { createSafeElement } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
import { TYPE_EFFECTIVENESS } from '../utils/typeEffectiveness.js';

/**
 * Manages Pokemon team building and persistence
 */
export class TeamBuilder {
    constructor(dataManager, uiController) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.team = this._loadTeam();
        this.maxTeamSize = 6;
        this.teamPanel = null;
        this.teamEdgeTab = null;
        this.teamToggleButton = null;
        this.panelToggleButton = null;
        this.isPanelOpen = false;
    }

    /**
     * Initialize the team builder UI
     */
    initialize() {
        this._createTeamPanel();
        this._updateTeamDisplay();
    }

    /**
     * Add a Pokemon to the team
     * @param {number} pokemonId - Pokemon ID to add
     * @returns {boolean} True if added successfully
     */
    addToTeam(pokemonId) {
        const uiText = this._getUIText();
        if (this.team.length >= this.maxTeamSize) {
            this._showNotification(uiText.teamFull || 'Team is full! Maximum 6 Pokémon allowed.');
            return false;
        }

        if (this.team.includes(pokemonId)) {
            this._showNotification(uiText.teamAlreadyAdded || 'This Pokémon is already in your team!');
            return false;
        }

        this.team.push(pokemonId);
        this._saveTeam();
        this._updateTeamDisplay();
        this._showNotification(uiText.teamAdded || 'Pokémon added to team!');
        return true;
    }

    /**
     * Remove a Pokemon from the team
     * @param {number} pokemonId - Pokemon ID to remove
     */
    removeFromTeam(pokemonId) {
        const index = this.team.indexOf(pokemonId);
        if (index !== -1) {
            this.team.splice(index, 1);
            this._saveTeam();
            this._updateTeamDisplay();
            const uiText = this._getUIText();
            this._showNotification(uiText.teamRemoved || 'Pokémon removed from team!');
        }
    }

    /**
     * Check if a Pokemon is in the team
     * @param {number} pokemonId - Pokemon ID to check
     * @returns {boolean} True if in team
     */
    isInTeam(pokemonId) {
        return this.team.includes(pokemonId);
    }

    /**
     * Get current team
     * @returns {Array<number>} Array of Pokemon IDs
     */
    getTeam() {
        return [...this.team];
    }

    /**
     * Clear the entire team
     */
    clearTeam() {
        const uiText = this._getUIText();
        if (confirm(uiText.teamClearConfirm || 'Are you sure you want to clear your entire team?')) {
            this.team = [];
            this._saveTeam();
            this._updateTeamDisplay();
            this._showNotification(uiText.teamCleared || 'Team cleared!');
        }
    }

    /**
     * Toggle team panel visibility
     */
    toggleTeamPanel() {
        this.setTeamPanelOpen(!this.isPanelOpen);
    }

    /**
     * Set team panel open state and sync all controls
     * @param {boolean} isOpen - Desired panel visibility
     */
    setTeamPanelOpen(isOpen) {
        if (!this.teamPanel) {
            return;
        }

        this.isPanelOpen = Boolean(isOpen);
        this.teamPanel.classList.toggle('team-panel-visible', this.isPanelOpen);
        this.teamPanel.classList.toggle('team-panel-hidden', !this.isPanelOpen);
        this._syncToggleAccessibility();
    }

    /**
     * Creates the team panel UI
     * @private
     */
    _createTeamPanel() {
        const uiText = this._getUIText();
        const panel = createSafeElement('div');
        panel.classList.add('team-panel');
        panel.id = 'team-panel';

        // Header
        const header = createSafeElement('div');
        header.classList.add('team-panel-header');

        const title = createSafeElement('h3', uiText.teamTitle || 'My Team');
        title.classList.add('team-panel-title');

        const toggleButton = createSafeElement('button', '◀');
        toggleButton.classList.add('team-panel-toggle');
        toggleButton.type = 'button';
        toggleButton.setAttribute('aria-label', uiText.teamPanelClose || 'Close team panel');
        toggleButton.addEventListener('click', () => this.toggleTeamPanel());
        this.panelToggleButton = toggleButton;

        header.appendChild(title);
        header.appendChild(toggleButton);
        panel.appendChild(header);

        // Team slots container
        const slotsContainer = createSafeElement('div');
        slotsContainer.classList.add('team-slots-container');
        slotsContainer.id = 'team-slots';
        panel.appendChild(slotsContainer);

        // Team info
        const infoContainer = createSafeElement('div');
        infoContainer.classList.add('team-info-container');

        const countSpan = createSafeElement('span', this._formatText(uiText.teamCountLabel || '{count}/6 Pokemon', { count: 0 }));
        countSpan.classList.add('team-count');
        countSpan.id = 'team-count';

        const clearButton = createSafeElement('button', uiText.clearTeam || 'Clear Team');
        clearButton.classList.add('team-clear-button');
        clearButton.addEventListener('click', () => this.clearTeam());

        infoContainer.appendChild(countSpan);
        infoContainer.appendChild(clearButton);
        panel.appendChild(infoContainer);

        const coverageContainer = createSafeElement('div');
        coverageContainer.classList.add('team-coverage-container');
        coverageContainer.id = 'team-coverage';
        panel.appendChild(coverageContainer);

        // Add to DOM
        document.body.appendChild(panel);
        this.teamPanel = panel;
        this.teamPanel.classList.add('team-panel-hidden');

        // Add toggle button to header
        this._addTeamToggleButton();
        this._createTeamEdgeTab();
        this._syncToggleAccessibility();
    }

    /**
     * Adds team toggle button to main header
     * @private
     */
    _addTeamToggleButton() {
        const uiText = this._getUIText();
        const header = document.querySelector('header .toggles');
        if (header) {
            const teamButton = createSafeElement('button', '👥');
            teamButton.id = 'team-toggle';
            teamButton.type = 'button';
            teamButton.setAttribute('aria-label', uiText.teamToggle || 'Toggle team panel');
            teamButton.title = uiText.teamViewTitle || 'View your team';
            teamButton.addEventListener('click', () => this.toggleTeamPanel());
            header.appendChild(teamButton);
            this.teamToggleButton = teamButton;
        }
    }

    /**
     * Creates the persistent edge tab used to open/close team panel
     * @private
     */
    _createTeamEdgeTab() {
        const uiText = this._getUIText();
        const edgeTab = createSafeElement('button');
        edgeTab.id = 'team-edge-tab';
        edgeTab.type = 'button';
        edgeTab.classList.add('team-edge-tab');
        edgeTab.addEventListener('click', () => this.toggleTeamPanel());

        const icon = createSafeElement('span', '👥');
        icon.classList.add('team-edge-tab-icon');
        const label = createSafeElement('span', uiText.teamTitle || 'My Team');
        label.classList.add('team-edge-tab-label');
        const count = createSafeElement('span', String(this.team.length));
        count.classList.add('team-edge-tab-count');
        count.id = 'team-edge-tab-count';
        const chevron = createSafeElement('span', '◀');
        chevron.classList.add('team-edge-tab-chevron');

        edgeTab.appendChild(icon);
        edgeTab.appendChild(label);
        edgeTab.appendChild(count);
        edgeTab.appendChild(chevron);
        document.body.appendChild(edgeTab);
        this.teamEdgeTab = edgeTab;
    }

    /**
     * Updates the team display
     * @private
     */
    _updateTeamDisplay() {
        const slotsContainer = document.getElementById('team-slots');
        const countSpan = document.getElementById('team-count');
        const uiText = this._getUIText();

        if (!slotsContainer || !countSpan) return;

        // Clear existing slots
        slotsContainer.replaceChildren();

        // Create slots
        for (let i = 0; i < this.maxTeamSize; i++) {
            const slot = createSafeElement('div');
            slot.classList.add('team-slot');

            if (i < this.team.length) {
                const pokemonId = this.team[i];
                const pokemon = this.dataManager.getPokemonById(pokemonId);

                if (pokemon) {
                    this._fillTeamSlot(slot, pokemon);
                }
            } else {
                this._createEmptySlot(slot, i + 1);
            }

            slotsContainer.appendChild(slot);
        }

        // Update count
        countSpan.textContent = this._formatText(uiText.teamCountLabel || '{count}/6 Pokemon', { count: this.team.length });
        const edgeTabCount = document.getElementById('team-edge-tab-count');
        if (edgeTabCount) {
            edgeTabCount.textContent = String(this.team.length);
        }
        this._updateCoverageAnalysis();
        this._syncToggleAccessibility();
    }

    /**
     * Fills a team slot with Pokemon data
     * @private
     * @param {HTMLElement} slot - Slot element
     * @param {Object} pokemon - Pokemon data
     */
    _fillTeamSlot(slot, pokemon) {
        const uiText = this._getUIText();
        const language = this._getLanguage();
        const pokemonName = this.dataManager.getPokemonName(pokemon, language);
        slot.classList.add('team-slot-filled');

        // Image
        const img = createSafeElement('img');
        img.src = pokemon.sprite;
        img.alt = pokemonName;
        img.classList.add('team-slot-image');
        slot.appendChild(img);

        // Name
        const name = createSafeElement('div', pokemonName);
        name.classList.add('team-slot-name');
        slot.appendChild(name);

        // Types
        const typesContainer = createSafeElement('div');
        typesContainer.classList.add('team-slot-types');
        this.dataManager.getPokemonTypes(pokemon, language).forEach(type => {
            const typeSpan = createSafeElement('span');
            const cssClass = getTypeClassName(type);
            typeSpan.classList.add('team-type-badge', `type-${cssClass}`);
            typeSpan.textContent = type;
            typesContainer.appendChild(typeSpan);
        });
        slot.appendChild(typesContainer);

        // Remove button
        const removeButton = createSafeElement('button', '×');
        removeButton.classList.add('team-slot-remove');
        removeButton.setAttribute(
            'aria-label',
            this._formatText(uiText.teamRemoveAria || 'Remove {name} from team', { name: pokemonName })
        );
        removeButton.addEventListener('click', () => this.removeFromTeam(pokemon.id));
        slot.appendChild(removeButton);

        // Click to view details
        slot.style.cursor = 'pointer';
        slot.addEventListener('click', (e) => {
            if (!e.target.classList.contains('team-slot-remove')) {
                // Trigger detail view (will be handled by main app)
                const event = new CustomEvent('showPokemonDetail', { detail: { id: pokemon.id } });
                document.dispatchEvent(event);
            }
        });
    }

    /**
     * Creates an empty team slot
     * @private
     * @param {HTMLElement} slot - Slot element
     * @param {number} slotNumber - Slot number
     */
    _createEmptySlot(slot, slotNumber) {
        const uiText = this._getUIText();
        slot.classList.add('team-slot-empty');

        const placeholder = createSafeElement('div', '+');
        placeholder.classList.add('team-slot-placeholder');
        slot.appendChild(placeholder);

        const label = createSafeElement(
            'div',
            this._formatText(uiText.teamSlotLabel || 'Slot {slot}', { slot: slotNumber })
        );
        label.classList.add('team-slot-label');
        slot.appendChild(label);
    }

    /**
     * Updates team type coverage analysis section
     * @private
     */
    _updateCoverageAnalysis() {
        const coverageContainer = document.getElementById('team-coverage');
        const uiText = this._getUIText();
        if (!coverageContainer) {
            return;
        }

        coverageContainer.replaceChildren();

        const title = createSafeElement('h4', uiText.teamCoverageTitle || 'Type Coverage');
        title.classList.add('team-coverage-title');
        coverageContainer.appendChild(title);

        const analysis = this.getCoverageAnalysis();
        if (this.team.length === 0) {
            const empty = createSafeElement('p', uiText.teamCoverageEmpty || 'Add Pokémon to see coverage analysis.');
            empty.classList.add('team-coverage-empty');
            coverageContainer.appendChild(empty);
            return;
        }

        const offensive = createSafeElement(
            'p',
            this._formatText(
                uiText.teamOffensiveCoverage || 'Offensive coverage: {covered}/{total}',
                { covered: analysis.offensiveCovered.length, total: analysis.totalTypes }
            )
        );
        offensive.classList.add('team-coverage-summary');

        const noneText = uiText.teamSharedWeaknessesNone || 'None';
        const weak = createSafeElement(
            'p',
            this._formatText(
                uiText.teamSharedWeaknesses || 'Shared weaknesses: {value}',
                {
                    value: analysis.commonWeaknesses.length
                        ? analysis.commonWeaknesses.map((entry) => `${this._localizeType(entry.type)} (${entry.count})`).join(', ')
                        : noneText
                }
            )
        );
        weak.classList.add('team-coverage-summary');

        const uncovered = createSafeElement(
            'p',
            this._formatText(
                uiText.teamUncoveredTypes || 'Uncovered types: {value}',
                {
                    value: analysis.offensiveUncovered.length
                        ? analysis.offensiveUncovered.map((type) => this._localizeType(type)).join(', ')
                        : (uiText.teamUncoveredTypesNone || 'None')
                }
            )
        );
        uncovered.classList.add('team-coverage-summary');

        coverageContainer.appendChild(offensive);
        coverageContainer.appendChild(weak);
        coverageContainer.appendChild(uncovered);
    }

    /**
     * Calculates team offensive and defensive coverage
     * @returns {Object} Coverage analysis
     */
    getCoverageAnalysis() {
        const allTypes = Object.keys(TYPE_EFFECTIVENESS);
        const offensiveCovered = new Set();
        const weaknessCounts = {};

        this.team.forEach((pokemonId) => {
            const pokemon = this.dataManager.getPokemonById(pokemonId);
            if (!pokemon) {
                return;
            }

            (pokemon.types_en || []).forEach((attackType) => {
                const effectiveness = TYPE_EFFECTIVENESS[attackType.toLowerCase()] || {};
                allTypes.forEach((defendingType) => {
                    if ((effectiveness[defendingType] || 1) > 1) {
                        offensiveCovered.add(defendingType);
                    }
                });
            });

            Object.keys(pokemon.weaknesses || {}).forEach((weakType) => {
                weaknessCounts[weakType] = (weaknessCounts[weakType] || 0) + 1;
            });
        });

        const offensiveUncovered = allTypes.filter((type) => !offensiveCovered.has(type));
        const commonWeaknesses = Object.entries(weaknessCounts)
            .filter(([, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({ type, count }));

        return {
            totalTypes: allTypes.length,
            offensiveCovered: Array.from(offensiveCovered).sort(),
            offensiveUncovered,
            commonWeaknesses
        };
    }

    /**
     * Converts lower-case type id to title-case display
     * @private
     * @param {string} value - Raw value
     * @returns {string} Title-cased value
     */
    _toTitleCase(value) {
        if (!value) {
            return '';
        }
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    /**
     * Saves team to localStorage
     * @private
     */
    _saveTeam() {
        try {
            localStorage.setItem('pokedex_team', JSON.stringify(this.team));
        } catch (error) {
            console.error('Failed to save team:', error);
        }
    }

    /**
     * Loads team from localStorage
     * @private
     * @returns {Array<number>} Team array
     */
    _loadTeam() {
        try {
            const saved = localStorage.getItem('pokedex_team');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load team:', error);
            return [];
        }
    }

    /**
     * Shows a notification message
     * @private
     * @param {string} message - Notification message
     */
    _showNotification(message) {
        const notification = createSafeElement('div', message);
        notification.classList.add('team-notification');
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('visible'), 10);

        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * Cleanup UI and references
     */
    destroy() {
        if (this.teamPanel) {
            this.teamPanel.remove();
            this.teamPanel = null;
        }

        if (this.teamToggleButton) {
            this.teamToggleButton.remove();
            this.teamToggleButton = null;
        }
        if (this.teamEdgeTab) {
            this.teamEdgeTab.remove();
            this.teamEdgeTab = null;
        }
        this.panelToggleButton = null;
    }

    /**
     * Refreshes team panel text after language changes.
     */
    refreshUI() {
        const uiText = this._getUIText();
        if (this.teamToggleButton) {
            this.teamToggleButton.setAttribute('aria-label', uiText.teamToggle || 'Toggle team panel');
            this.teamToggleButton.title = uiText.teamViewTitle || 'View your team';
        }

        if (this.panelToggleButton) {
            this.panelToggleButton.setAttribute(
                'aria-label',
                this.isPanelOpen
                    ? (uiText.teamPanelClose || 'Close team panel')
                    : (uiText.teamPanelOpen || 'Open team panel')
            );
            this.panelToggleButton.textContent = this.isPanelOpen ? '▶' : '◀';
        }

        if (this.teamEdgeTab) {
            const label = this.teamEdgeTab.querySelector('.team-edge-tab-label');
            if (label) {
                label.textContent = uiText.teamTitle || 'My Team';
            }
        }

        this._updateTeamDisplay();
    }

    _syncToggleAccessibility() {
        const uiText = this._getUIText();
        const expanded = String(this.isPanelOpen);
        const toggleLabel = this.isPanelOpen
            ? (uiText.teamPanelClose || 'Close team panel')
            : (uiText.teamPanelOpen || 'Open team panel');

        if (this.teamToggleButton) {
            this.teamToggleButton.setAttribute('aria-expanded', expanded);
            this.teamToggleButton.setAttribute('aria-controls', 'team-panel');
        }

        if (this.teamEdgeTab) {
            this.teamEdgeTab.setAttribute('aria-label', toggleLabel);
            this.teamEdgeTab.setAttribute('aria-expanded', expanded);
            this.teamEdgeTab.setAttribute('aria-controls', 'team-panel');
            this.teamEdgeTab.classList.toggle('team-edge-tab-open', this.isPanelOpen);
        }

        if (this.panelToggleButton) {
            this.panelToggleButton.textContent = this.isPanelOpen ? '▶' : '◀';
            this.panelToggleButton.setAttribute('aria-label', toggleLabel);
            this.panelToggleButton.setAttribute('aria-expanded', expanded);
            this.panelToggleButton.setAttribute('aria-controls', 'team-panel');
        }
    }

    _getLanguage() {
        if (this.uiController && typeof this.uiController.getCurrentLanguage === 'function') {
            return this.uiController.getCurrentLanguage();
        }
        return 'en';
    }

    _getUIText() {
        if (this.uiController && typeof this.uiController.getCurrentUIText === 'function') {
            return this.uiController.getCurrentUIText();
        }
        return {};
    }

    _localizeType(typeName) {
        const language = this._getLanguage();
        if (language !== 'jp') {
            return this._toTitleCase(typeName);
        }

        const lower = String(typeName || '').toLowerCase();
        const typeMap = {
            normal: 'ノーマル',
            fire: 'ほのお',
            water: 'みず',
            electric: 'でんき',
            grass: 'くさ',
            ice: 'こおり',
            fighting: 'かくとう',
            poison: 'どく',
            ground: 'じめん',
            flying: 'ひこう',
            psychic: 'エスパー',
            bug: 'むし',
            rock: 'いわ',
            ghost: 'ゴースト',
            dragon: 'ドラゴン',
            dark: 'あく',
            steel: 'はがね',
            fairy: 'フェアリー'
        };
        return typeMap[lower] || this._toTitleCase(typeName);
    }

    _formatText(template, values) {
        return Object.entries(values).reduce(
            (text, [key, value]) => text.replace(`{${key}}`, String(value)),
            template
        );
    }
}
