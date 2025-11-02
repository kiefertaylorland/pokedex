/**
 * Enhanced Stats Display Component - Stats with comparison visualization
 * @module EnhancedStatsDisplay
 */

import { createSafeElement } from '../utils/security.js';
import { compareStatToBenchmark, getOverallStatRating, STAT_BENCHMARKS } from '../utils/statComparison.js';

/**
 * Creates an enhanced stats display with comparisons
 */
export class EnhancedStatsDisplay {
    /**
     * Creates the enhanced stats section
     * @param {Object} stats - Pokemon stats
     * @param {Object} uiText - UI text object for localization
     * @param {Object} benchmarks - Optional stat benchmarks
     * @returns {HTMLElement} Enhanced stats section
     */
    static createStatsSection(stats, uiText, benchmarks = STAT_BENCHMARKS) {
        const section = createSafeElement('div');
        section.classList.add('detail-section', 'enhanced-stats-section');
        
        const heading = createSafeElement('h4', uiText.stats || 'Stats');
        section.appendChild(heading);
        
        // Overall rating
        const overallRating = getOverallStatRating(stats, benchmarks);
        const ratingBadge = this._createOverallRating(overallRating);
        section.appendChild(ratingBadge);
        
        const statsGrid = createSafeElement('div');
        statsGrid.classList.add('enhanced-stats-grid');
        
        const statLabels = {
            hp: uiText.hp || 'HP',
            attack: uiText.attack || 'Attack',
            defense: uiText.defense || 'Defense',
            'special-attack': uiText.specialAttack || 'Sp. Atk',
            'special-defense': uiText.specialDefense || 'Sp. Def',
            speed: uiText.speed || 'Speed'
        };
        
        Object.entries(statLabels).forEach(([statKey, statLabel]) => {
            if (stats[statKey] !== undefined) {
                const comparison = compareStatToBenchmark(stats[statKey], statKey, benchmarks);
                const statItem = this._createEnhancedStatItem(statLabel, comparison);
                statsGrid.appendChild(statItem);
            }
        });
        
        section.appendChild(statsGrid);
        return section;
    }
    
    /**
     * Creates overall rating display
     * @private
     * @param {Object} overallRating - Overall rating data
     * @returns {HTMLElement} Rating element
     */
    static _createOverallRating(overallRating) {
        const container = createSafeElement('div');
        container.classList.add('overall-rating');
        
        const totalLabel = createSafeElement('span', 'Total: ');
        totalLabel.classList.add('rating-label');
        
        const totalValue = createSafeElement('span', `${overallRating.total}`);
        totalValue.classList.add('rating-value');
        
        const ratingBadge = createSafeElement('span', overallRating.rating.toUpperCase());
        ratingBadge.classList.add('rating-badge', `rating-${overallRating.rating}`);
        
        container.appendChild(totalLabel);
        container.appendChild(totalValue);
        container.appendChild(ratingBadge);
        
        return container;
    }
    
    /**
     * Creates an enhanced stat item with comparison visualization
     * @private
     * @param {string} label - Stat label
     * @param {Object} comparison - Comparison data
     * @returns {HTMLElement} Enhanced stat item
     */
    static _createEnhancedStatItem(label, comparison) {
        const item = createSafeElement('div');
        item.classList.add('enhanced-stat-item');
        
        // Label and value row
        const headerRow = createSafeElement('div');
        headerRow.classList.add('stat-header-row');
        
        const labelSpan = createSafeElement('span', `${label}:`);
        labelSpan.classList.add('stat-label');
        
        const valueSpan = createSafeElement('span', `${comparison.value}`);
        valueSpan.classList.add('stat-value', `stat-rating-${comparison.rating}`);
        
        const compareSpan = createSafeElement('span', 
            `${comparison.aboveAverage ? '+' : ''}${comparison.difference}`
        );
        compareSpan.classList.add('stat-difference', 
            comparison.aboveAverage ? 'stat-above' : 'stat-below'
        );
        compareSpan.title = `Average: ${comparison.average}`;
        
        headerRow.appendChild(labelSpan);
        headerRow.appendChild(valueSpan);
        headerRow.appendChild(compareSpan);
        
        // Progress bar with dual indicators
        const barContainer = createSafeElement('div');
        barContainer.classList.add('stat-bar-container');
        
        // Average indicator line
        const averageIndicator = createSafeElement('div');
        averageIndicator.classList.add('stat-average-indicator');
        averageIndicator.style.setProperty('--average-position', `${(comparison.average / comparison.max) * 100}%`);
        averageIndicator.title = `Average: ${comparison.average}`;
        
        // Stat bar
        const statBar = createSafeElement('div');
        statBar.classList.add('stat-bar');
        
        const statFill = createSafeElement('div');
        statFill.classList.add('stat-bar-fill', `stat-rating-${comparison.rating}`);
        statFill.style.width = `${comparison.percentOfMax}%`;
        
        statBar.appendChild(statFill);
        barContainer.appendChild(averageIndicator);
        barContainer.appendChild(statBar);
        
        // Percentage indicator
        const percentSpan = createSafeElement('span', `${comparison.percentOfMax}%`);
        percentSpan.classList.add('stat-percent');
        
        item.appendChild(headerRow);
        item.appendChild(barContainer);
        item.appendChild(percentSpan);
        
        return item;
    }
}
