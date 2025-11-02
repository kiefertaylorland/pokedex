/**
 * Evolution Tree View Component - Visual evolution chain display
 * @module EvolutionTreeView
 */

import { createSafeElement } from '../utils/security.js';
import { createImageWithFallback } from '../utils/imageUtils.js';

/**
 * Creates a visual evolution tree
 */
export class EvolutionTreeView {
    /**
     * Creates the evolution tree element
     * @param {Array<Object>} evolutionChain - Evolution chain data
     * @param {number} currentPokemonId - Current Pokemon's ID
     * @param {Function} onPokemonClick - Callback when evolution is clicked
     * @returns {HTMLElement} Evolution tree element
     */
    static createEvolutionTree(evolutionChain, currentPokemonId, onPokemonClick) {
        const container = createSafeElement('div');
        container.classList.add('evolution-tree');
        
        if (!evolutionChain || evolutionChain.length <= 1) {
            return container; // Don't show for Pokemon without evolutions
        }
        
        const title = createSafeElement('h4', 'Evolution Chain');
        title.classList.add('evolution-tree-title');
        container.appendChild(title);
        
        const chainContainer = createSafeElement('div');
        chainContainer.classList.add('evolution-chain-container');
        
        evolutionChain.forEach((evolution, index) => {
            // Create evolution stage
            const stage = this._createEvolutionStage(
                evolution, 
                evolution.id === currentPokemonId,
                onPokemonClick
            );
            chainContainer.appendChild(stage);
            
            // Add arrow between stages (except after last one)
            if (index < evolutionChain.length - 1) {
                const arrow = this._createEvolutionArrow();
                chainContainer.appendChild(arrow);
            }
        });
        
        container.appendChild(chainContainer);
        return container;
    }
    
    /**
     * Creates an evolution stage (Pokemon in the chain)
     * @private
     * @param {Object} evolution - Evolution data
     * @param {boolean} isCurrent - Whether this is the current Pokemon
     * @param {Function} onClick - Click callback
     * @returns {HTMLElement} Evolution stage element
     */
    static _createEvolutionStage(evolution, isCurrent, onClick) {
        const stage = createSafeElement('div');
        stage.classList.add('evolution-stage');
        if (isCurrent) {
            stage.classList.add('evolution-stage-current');
        }
        
        // Make it clickable if not the current Pokemon
        if (!isCurrent && onClick) {
            stage.classList.add('evolution-stage-clickable');
            stage.setAttribute('role', 'button');
            stage.setAttribute('tabindex', '0');
            stage.addEventListener('click', () => onClick(evolution.id));
            stage.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(evolution.id);
                }
            });
        }
        
        // Pokemon image
        const imageContainer = createSafeElement('div');
        imageContainer.classList.add('evolution-image-container');
        
        const img = createImageWithFallback(
            `https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${evolution.id}.png`,
            evolution.name,
            {
                className: 'evolution-image',
                onError: (failedImg) => {
                    failedImg.style.display = 'none';
                    const fallback = createSafeElement('div', '?');
                    fallback.classList.add('evolution-image-fallback');
                    imageContainer.appendChild(fallback);
                }
            }
        );
        
        imageContainer.appendChild(img);
        stage.appendChild(imageContainer);
        
        // Pokemon name and ID
        const nameContainer = createSafeElement('div');
        nameContainer.classList.add('evolution-name-container');
        
        const name = createSafeElement('div', evolution.name);
        name.classList.add('evolution-name');
        
        const id = createSafeElement('div', `#${String(evolution.id).padStart(3, '0')}`);
        id.classList.add('evolution-id');
        
        nameContainer.appendChild(name);
        nameContainer.appendChild(id);
        stage.appendChild(nameContainer);
        
        return stage;
    }
    
    /**
     * Creates an evolution arrow
     * @private
     * @returns {HTMLElement} Arrow element
     */
    static _createEvolutionArrow() {
        const arrow = createSafeElement('div');
        arrow.classList.add('evolution-arrow');
        arrow.textContent = '→';
        arrow.setAttribute('aria-hidden', 'true');
        return arrow;
    }
}
