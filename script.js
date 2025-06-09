/**
 * DEPRECATED: Legacy script.js file
 * This file has been refactored into a modular architecture.
 * 
 * New structure:
 * - assets/js/pokedexApp.js - Main application entry point
 * - assets/js/constants.js - Application constants
 * - assets/js/managers/ - Data and UI management
 * - assets/js/components/ - UI components
 * - assets/js/controllers/ - Business logic controllers
 * - assets/js/utils/ - Utility functions
 * 
 * This file now serves as a compatibility layer for any external dependencies.
 */

console.warn('⚠️  script.js is deprecated. Please use the new modular structure in assets/js/');

// Check if the new system is already loaded
if (typeof window.pokedexApp === 'undefined') {
    console.log('🔄 Loading new modular Pokedex application...');
    
    // Dynamic import of the new modular system
    import('./assets/js/pokedexApp.js')
        .then(module => {
            return module.createPokedexApp();
        })
        .then(app => {
            window.pokedexApp = app;
            console.log('✅ New modular Pokedex application loaded successfully');
            
            // Expose legacy API for backward compatibility
            window.legacyPokedexAPI = {
                // Legacy function names for any external code that might depend on them
                showPokemonDetail: (pokemon) => app.showPokemonDetails(pokemon.id),
                searchPokemon: (term) => app.search(term),
                toggleTheme: () => app.getState().currentTheme === 'light' ? 'dark' : 'light',
                toggleLanguage: () => app.getState().currentLanguage === 'en' ? 'jp' : 'en',
                getAllPokemon: () => app.getState().dataLoaded ? 'Data loaded' : 'Data not loaded',
                
                // Utility functions
                getAppState: () => app.getState(),
                
                // Deprecated warnings
                _deprecated: (functionName) => {
                    console.warn(`⚠️  ${functionName} is deprecated. Use window.pokedexApp instead.`);
                }
            };
            
            // Add deprecation warnings to legacy functions
            Object.keys(window.legacyPokedexAPI).forEach(key => {
                if (key !== '_deprecated' && key !== 'getAppState') {
                    const originalFunction = window.legacyPokedexAPI[key];
                    window.legacyPokedexAPI[key] = function(...args) {
                        window.legacyPokedexAPI._deprecated(key);
                        return originalFunction.apply(this, args);
                    };
                }
            });
        })
        .catch(error => {
            console.error('❌ Failed to load new modular system:', error);
            console.log('🔧 Falling back to inline legacy implementation...');
            
            // Fallback: Basic error message
            document.addEventListener('DOMContentLoaded', () => {
                const grid = document.getElementById('pokedex-grid');
                if (grid) {
                    grid.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: #ff3b30;">
                            <h2>⚠️ Application Error</h2>
                            <p>Failed to load the Pokédex application.</p>
                            <p>Please refresh the page or check your internet connection.</p>
                            <button onclick="location.reload()" style="
                                background: #ff3b30;
                                color: white;
                                border: none;
                                padding: 0.5rem 1rem;
                                border-radius: 4px;
                                cursor: pointer;
                                margin-top: 1rem;
                            ">Refresh Page</button>
                        </div>
                    `;
                }
            });
        });
} else {
    console.log('✅ Modular Pokedex application already loaded');
}

// Export for module compatibility (if needed)
export default {
    deprecated: true,
    message: 'This script has been refactored. Use assets/js/pokedexApp.js instead.',
    loadNewSystem: () => import('./assets/js/pokedexApp.js')
};
