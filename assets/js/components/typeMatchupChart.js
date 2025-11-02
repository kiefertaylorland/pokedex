/**
 * Type Matchup Chart Component - Interactive type effectiveness visualization
 * @module TypeMatchupChart
 */

import { createSafeElement } from '../utils/security.js';
import { getTypeClassName } from '../utils/typeMapping.js';
import { getTypeMatchups } from '../utils/typeEffectiveness.js';

/**
 * Creates an interactive type matchup chart
 */
export class TypeMatchupChart {
    /**
     * Creates the type matchup chart element
     * @param {Array<string>} pokemonTypes - Pokemon's types
     * @param {Object} uiText - UI text object for localization
     * @returns {HTMLElement} Type matchup chart element
     */
    static createChart(pokemonTypes, uiText) {
        const container = createSafeElement('div');
        container.classList.add('type-matchup-chart');
        
        const matchups = getTypeMatchups(pokemonTypes);
        
        // Title
        const title = createSafeElement('h4', 'Type Matchups');
        title.classList.add('type-matchup-title');
        container.appendChild(title);
        
        // Create sections for weaknesses, resistances, and immunities
        if (Object.keys(matchups.weaknesses).length > 0) {
            container.appendChild(
                this._createMatchupSection('Weak to', matchups.weaknesses, 'weakness')
            );
        }
        
        if (Object.keys(matchups.resistances).length > 0) {
            container.appendChild(
                this._createMatchupSection('Resistant to', matchups.resistances, 'resistance')
            );
        }
        
        if (matchups.immunities.length > 0) {
            container.appendChild(
                this._createImmunitiesSection('Immune to', matchups.immunities)
            );
        }
        
        return container;
    }
    
    /**
     * Creates a matchup section (weaknesses or resistances)
     * @private
     * @param {string} title - Section title
     * @param {Object} matchups - Matchup data with effectiveness values
     * @param {string} className - CSS class name for styling
     * @returns {HTMLElement} Matchup section
     */
    static _createMatchupSection(title, matchups, className) {
        const section = createSafeElement('div');
        section.classList.add('matchup-section', `matchup-${className}`);
        
        const sectionTitle = createSafeElement('h5', title);
        sectionTitle.classList.add('matchup-section-title');
        section.appendChild(sectionTitle);
        
        const typeList = createSafeElement('div');
        typeList.classList.add('matchup-type-list');
        
        // Sort by effectiveness (highest first for weaknesses, lowest first for resistances)
        const sortedTypes = Object.entries(matchups).sort((a, b) => {
            return className === 'weakness' ? b[1] - a[1] : a[1] - b[1];
        });
        
        sortedTypes.forEach(([type, effectiveness]) => {
            const typeItem = this._createTypeItem(type, effectiveness);
            typeList.appendChild(typeItem);
        });
        
        section.appendChild(typeList);
        return section;
    }
    
    /**
     * Creates immunities section
     * @private
     * @param {string} title - Section title
     * @param {Array<string>} types - Immune types
     * @returns {HTMLElement} Immunities section
     */
    static _createImmunitiesSection(title, types) {
        const section = createSafeElement('div');
        section.classList.add('matchup-section', 'matchup-immunity');
        
        const sectionTitle = createSafeElement('h5', title);
        sectionTitle.classList.add('matchup-section-title');
        section.appendChild(sectionTitle);
        
        const typeList = createSafeElement('div');
        typeList.classList.add('matchup-type-list');
        
        types.forEach(type => {
            const typeItem = this._createTypeItem(type, 0);
            typeList.appendChild(typeItem);
        });
        
        section.appendChild(typeList);
        return section;
    }
    
    /**
     * Creates a type item with effectiveness indicator
     * @private
     * @param {string} type - Type name
     * @param {number} effectiveness - Effectiveness multiplier
     * @returns {HTMLElement} Type item
     */
    static _createTypeItem(type, effectiveness) {
        const item = createSafeElement('div');
        item.classList.add('matchup-type-item');
        
        const typeSpan = createSafeElement('span', type.charAt(0).toUpperCase() + type.slice(1));
        const cssClassName = getTypeClassName(type);
        typeSpan.classList.add('type-badge', `type-${cssClassName}`);
        
        const multiplierSpan = createSafeElement('span', this._formatMultiplier(effectiveness));
        multiplierSpan.classList.add('matchup-multiplier');
        
        item.appendChild(typeSpan);
        item.appendChild(multiplierSpan);
        
        return item;
    }
    
    /**
     * Formats effectiveness multiplier for display
     * @private
     * @param {number} effectiveness - Effectiveness multiplier
     * @returns {string} Formatted multiplier text
     */
    static _formatMultiplier(effectiveness) {
        if (effectiveness === 0) return '×0';
        if (effectiveness === 4.0) return '×4';
        if (effectiveness === 2.0) return '×2';
        if (effectiveness === 0.5) return '×½';
        if (effectiveness === 0.25) return '×¼';
        return '×1';
    }
}
