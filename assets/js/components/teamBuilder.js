/**
 * Team Builder Component - Build and manage Pokemon teams
 * @module TeamBuilder
 */

import { createSafeElement } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';

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
        if (this.team.length >= this.maxTeamSize) {
            this._showNotification('Team is full! Maximum 6 Pokemon allowed.');
            return false;
        }
        
        if (this.team.includes(pokemonId)) {
            this._showNotification('This Pokemon is already in your team!');
            return false;
        }
        
        this.team.push(pokemonId);
        this._saveTeam();
        this._updateTeamDisplay();
        this._showNotification('Pokemon added to team!');
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
            this._showNotification('Pokemon removed from team!');
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
        if (confirm('Are you sure you want to clear your entire team?')) {
            this.team = [];
            this._saveTeam();
            this._updateTeamDisplay();
            this._showNotification('Team cleared!');
        }
    }
    
    /**
     * Toggle team panel visibility
     */
    toggleTeamPanel() {
        if (this.teamPanel) {
            this.teamPanel.classList.toggle('team-panel-visible');
        }
    }
    
    /**
     * Creates the team panel UI
     * @private
     */
    _createTeamPanel() {
        const panel = createSafeElement('div');
        panel.classList.add('team-panel');
        panel.id = 'team-panel';
        
        // Header
        const header = createSafeElement('div');
        header.classList.add('team-panel-header');
        
        const title = createSafeElement('h3', 'My Team');
        title.classList.add('team-panel-title');
        
        const toggleButton = createSafeElement('button', '◀');
        toggleButton.classList.add('team-panel-toggle');
        toggleButton.setAttribute('aria-label', 'Toggle team panel');
        toggleButton.addEventListener('click', () => this.toggleTeamPanel());
        
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
        
        const countSpan = createSafeElement('span', '0/6 Pokemon');
        countSpan.classList.add('team-count');
        countSpan.id = 'team-count';
        
        const clearButton = createSafeElement('button', 'Clear Team');
        clearButton.classList.add('team-clear-button');
        clearButton.addEventListener('click', () => this.clearTeam());
        
        infoContainer.appendChild(countSpan);
        infoContainer.appendChild(clearButton);
        panel.appendChild(infoContainer);
        
        // Add to DOM
        document.body.appendChild(panel);
        this.teamPanel = panel;
        
        // Add toggle button to header
        this._addTeamToggleButton();
    }
    
    /**
     * Adds team toggle button to main header
     * @private
     */
    _addTeamToggleButton() {
        const header = document.querySelector('header .toggles');
        if (header) {
            const teamButton = createSafeElement('button', '👥');
            teamButton.id = 'team-toggle';
            teamButton.type = 'button';
            teamButton.setAttribute('aria-label', 'Toggle team panel');
            teamButton.title = 'View your team';
            teamButton.addEventListener('click', () => this.toggleTeamPanel());
            header.appendChild(teamButton);
        }
    }
    
    /**
     * Updates the team display
     * @private
     */
    _updateTeamDisplay() {
        const slotsContainer = document.getElementById('team-slots');
        const countSpan = document.getElementById('team-count');
        
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
        countSpan.textContent = `${this.team.length}/6 Pokemon`;
    }
    
    /**
     * Fills a team slot with Pokemon data
     * @private
     * @param {HTMLElement} slot - Slot element
     * @param {Object} pokemon - Pokemon data
     */
    _fillTeamSlot(slot, pokemon) {
        slot.classList.add('team-slot-filled');
        
        // Image
        const img = createSafeElement('img');
        img.src = pokemon.sprite;
        img.alt = pokemon.name_en;
        img.classList.add('team-slot-image');
        slot.appendChild(img);
        
        // Name
        const name = createSafeElement('div', pokemon.name_en);
        name.classList.add('team-slot-name');
        slot.appendChild(name);
        
        // Types
        const typesContainer = createSafeElement('div');
        typesContainer.classList.add('team-slot-types');
        pokemon.types_en.forEach(type => {
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
        removeButton.setAttribute('aria-label', `Remove ${pokemon.name_en} from team`);
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
        slot.classList.add('team-slot-empty');
        
        const placeholder = createSafeElement('div', '+');
        placeholder.classList.add('team-slot-placeholder');
        slot.appendChild(placeholder);
        
        const label = createSafeElement('div', `Slot ${slotNumber}`);
        label.classList.add('team-slot-label');
        slot.appendChild(label);
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
}
