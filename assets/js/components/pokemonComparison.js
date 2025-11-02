/**
 * Pokemon Comparison Component - Side-by-side Pokemon comparison
 * @module PokemonComparison
 */

import { createSafeElement } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
import { compareTwoPokemons } from '../utils/statComparison.js';

/**
 * Manages Pokemon comparison functionality
 */
export class PokemonComparison {
    constructor(dataManager, uiController) {
        this.dataManager = dataManager;
        this.uiController = uiController;
        this.comparisonModal = null;
        this.selectedPokemon = [];
    }
    
    /**
     * Initialize comparison for a Pokemon
     * @param {number} pokemonId - Pokemon ID to start comparison with
     */
    startComparison(pokemonId) {
        this.selectedPokemon = [pokemonId];
        this._showPokemonSelector();
    }
    
    /**
     * Add a Pokemon to comparison
     * @param {number} pokemonId - Pokemon ID to compare
     */
    addToComparison(pokemonId) {
        if (this.selectedPokemon.length < 2 && !this.selectedPokemon.includes(pokemonId)) {
            this.selectedPokemon.push(pokemonId);
            
            if (this.selectedPokemon.length === 2) {
                this._showComparison();
            }
        }
    }
    
    /**
     * Shows the Pokemon selector
     * @private
     */
    _showPokemonSelector() {
        // Create selector modal
        const modal = createSafeElement('div');
        modal.classList.add('comparison-selector-modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        const content = createSafeElement('div');
        content.classList.add('comparison-selector-content');
        
        const title = createSafeElement('h3', 'Select a Pokemon to Compare');
        content.appendChild(title);
        
        const instruction = createSafeElement('p', 'Click on any Pokemon card to compare with the selected Pokemon');
        instruction.classList.add('comparison-instruction');
        content.appendChild(instruction);
        
        const closeButton = createSafeElement('button', '×');
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => this._closeSelector());
        content.appendChild(closeButton);
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        this.comparisonModal = modal;
        
        // Show modal
        setTimeout(() => modal.classList.add('visible'), 10);
    }
    
    /**
     * Closes the Pokemon selector
     * @private
     */
    _closeSelector() {
        if (this.comparisonModal) {
            this.comparisonModal.classList.remove('visible');
            setTimeout(() => {
                this.comparisonModal.remove();
                this.comparisonModal = null;
            }, 300);
        }
        this.selectedPokemon = [];
    }
    
    /**
     * Shows the comparison view
     * @private
     */
    _showComparison() {
        const pokemon1 = this.dataManager.getPokemonById(this.selectedPokemon[0]);
        const pokemon2 = this.dataManager.getPokemonById(this.selectedPokemon[1]);
        
        if (!pokemon1 || !pokemon2) {
            console.error('Could not find Pokemon for comparison');
            return;
        }
        
        const modal = createSafeElement('div');
        modal.classList.add('comparison-modal');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        const content = this._createComparisonContent(pokemon1, pokemon2);
        modal.appendChild(content);
        
        document.body.appendChild(modal);
        this.comparisonModal = modal;
        
        setTimeout(() => modal.classList.add('visible'), 10);
        
        // Close on escape or click outside
        const handleClose = (e) => {
            if (e.key === 'Escape' || e.target === modal) {
                this._closeComparison();
                document.removeEventListener('keydown', handleClose);
            }
        };
        document.addEventListener('keydown', handleClose);
        modal.addEventListener('click', handleClose);
    }
    
    /**
     * Creates comparison content
     * @private
     * @param {Object} pokemon1 - First Pokemon
     * @param {Object} pokemon2 - Second Pokemon
     * @returns {HTMLElement} Comparison content
     */
    _createComparisonContent(pokemon1, pokemon2) {
        const content = createSafeElement('div');
        content.classList.add('comparison-content');
        
        // Stop propagation on content clicks
        content.addEventListener('click', (e) => e.stopPropagation());
        
        // Close button
        const closeButton = createSafeElement('button', '×');
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => this._closeComparison());
        content.appendChild(closeButton);
        
        // Title
        const title = createSafeElement('h2', 'Pokemon Comparison');
        title.classList.add('comparison-title');
        content.appendChild(title);
        
        // Comparison grid
        const grid = createSafeElement('div');
        grid.classList.add('comparison-grid');
        
        // Headers
        grid.appendChild(this._createPokemonHeader(pokemon1, 1));
        grid.appendChild(this._createPokemonHeader(pokemon2, 2));
        
        // Stats comparison
        const statsComparison = compareTwoPokemons(pokemon1.stats, pokemon2.stats);
        grid.appendChild(this._createStatsComparison(pokemon1.stats, pokemon2.stats, statsComparison));
        
        // Types comparison
        grid.appendChild(this._createTypesComparison(pokemon1, pokemon2));
        
        content.appendChild(grid);
        return content;
    }
    
    /**
     * Creates Pokemon header for comparison
     * @private
     * @param {Object} pokemon - Pokemon data
     * @param {number} position - Position (1 or 2)
     * @returns {HTMLElement} Header element
     */
    _createPokemonHeader(pokemon, position) {
        const header = createSafeElement('div');
        header.classList.add('comparison-pokemon-header', `comparison-pokemon-${position}`);
        
        const img = createSafeElement('img');
        img.src = pokemon.sprite;
        img.alt = pokemon.name_en;
        img.classList.add('comparison-pokemon-image');
        
        const name = createSafeElement('h3', `${pokemon.name_en} #${String(pokemon.id).padStart(3, '0')}`);
        name.classList.add('comparison-pokemon-name');
        
        header.appendChild(img);
        header.appendChild(name);
        
        return header;
    }
    
    /**
     * Creates stats comparison section
     * @private
     * @param {Object} stats1 - First Pokemon's stats
     * @param {Object} stats2 - Second Pokemon's stats
     * @param {Object} comparison - Comparison data
     * @returns {HTMLElement} Stats comparison section
     */
    _createStatsComparison(stats1, stats2, comparison) {
        const section = createSafeElement('div');
        section.classList.add('comparison-stats-section');
        
        const title = createSafeElement('h4', 'Stats Comparison');
        section.appendChild(title);
        
        const statsGrid = createSafeElement('div');
        statsGrid.classList.add('comparison-stats-grid');
        
        const statNames = {
            hp: 'HP',
            attack: 'Attack',
            defense: 'Defense',
            'special-attack': 'Sp. Atk',
            'special-defense': 'Sp. Def',
            speed: 'Speed'
        };
        
        Object.entries(statNames).forEach(([key, label]) => {
            const row = createSafeElement('div');
            row.classList.add('comparison-stat-row');
            
            const stat1Value = createSafeElement('div', String(stats1[key] || 0));
            stat1Value.classList.add('comparison-stat-value');
            if (comparison[key].winner === 1) {
                stat1Value.classList.add('comparison-winner');
            }
            
            const statLabel = createSafeElement('div', label);
            statLabel.classList.add('comparison-stat-label');
            
            const stat2Value = createSafeElement('div', String(stats2[key] || 0));
            stat2Value.classList.add('comparison-stat-value');
            if (comparison[key].winner === 2) {
                stat2Value.classList.add('comparison-winner');
            }
            
            row.appendChild(stat1Value);
            row.appendChild(statLabel);
            row.appendChild(stat2Value);
            
            statsGrid.appendChild(row);
        });
        
        section.appendChild(statsGrid);
        return section;
    }
    
    /**
     * Creates types comparison section
     * @private
     * @param {Object} pokemon1 - First Pokemon
     * @param {Object} pokemon2 - Second Pokemon
     * @returns {HTMLElement} Types comparison section
     */
    _createTypesComparison(pokemon1, pokemon2) {
        const section = createSafeElement('div');
        section.classList.add('comparison-types-section');
        
        const title = createSafeElement('h4', 'Types');
        section.appendChild(title);
        
        const typesGrid = createSafeElement('div');
        typesGrid.classList.add('comparison-types-grid');
        
        // Pokemon 1 types
        const types1Container = createSafeElement('div');
        types1Container.classList.add('comparison-types-container');
        pokemon1.types_en.forEach(type => {
            const typeSpan = createSafeElement('span', type);
            const cssClass = getTypeClassName(type);
            typeSpan.classList.add('type-badge', `type-${cssClass}`);
            types1Container.appendChild(typeSpan);
        });
        
        // Pokemon 2 types
        const types2Container = createSafeElement('div');
        types2Container.classList.add('comparison-types-container');
        pokemon2.types_en.forEach(type => {
            const typeSpan = createSafeElement('span', type);
            const cssClass = getTypeClassName(type);
            typeSpan.classList.add('type-badge', `type-${cssClass}`);
            types2Container.appendChild(typeSpan);
        });
        
        typesGrid.appendChild(types1Container);
        typesGrid.appendChild(types2Container);
        section.appendChild(typesGrid);
        
        return section;
    }
    
    /**
     * Closes the comparison view
     * @private
     */
    _closeComparison() {
        if (this.comparisonModal) {
            this.comparisonModal.classList.remove('visible');
            setTimeout(() => {
                this.comparisonModal.remove();
                this.comparisonModal = null;
            }, 300);
        }
        this.selectedPokemon = [];
    }
    
    /**
     * Check if in comparison mode
     * @returns {boolean} True if in comparison mode
     */
    isComparing() {
        return this.selectedPokemon.length === 1;
    }
}
