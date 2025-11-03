# Pokédex JavaScript API Documentation

**Auto-generated from JSDoc comments**  
**Last Updated:** 2025-11-02 17:15:59

This document provides API documentation for all exported JavaScript modules.

## Table of Contents
- [Components](#components)
- [Managers](#managers)
- [Controllers](#controllers)
- [Utilities](#utilities)

---

## Components

### Components

#### `EnhancedStatsDisplay` (class)

**File:** `assets/js/components/enhancedStatsDisplay.js`

Creates an enhanced stats display with comparisons /

---

#### `EvolutionTreeView` (class)

**File:** `assets/js/components/evolutionTreeView.js`

Creates a visual evolution tree /

---

#### `KeyboardShortcutsModal` (class)

**File:** `assets/js/components/keyboardShortcutsModal.js`

Keyboard Shortcuts Help Modal Displays keyboard shortcuts when user presses '?' key Provides comprehensive list of all keyboard navigation options / import { ELEMENT_IDS } from '../constants.js';

---

#### `PokemonCardRenderer` (class)

**File:** `assets/js/components/pokemonCardRenderer.js`

Handles rendering Pokemon cards with proper security and accessibility /

---

#### `PokemonComparison` (class)

**File:** `assets/js/components/pokemonComparison.js`

Manages Pokemon comparison functionality /

---

#### `PokemonDetailView` (class)

**File:** `assets/js/components/pokemonDetailView.js`

Manages the Pokemon detail modal view /

---

#### `TeamBuilder` (class)

**File:** `assets/js/components/teamBuilder.js`

Manages Pokemon team building and persistence /

---

#### `TypeMatchupChart` (class)

**File:** `assets/js/components/typeMatchupChart.js`

Creates an interactive type matchup chart /

---

## Managers

### Managers

#### `PokemonDataManager` (class)

**File:** `assets/js/managers/dataManager.js`

Manages Pokemon data operations including fetching and caching /

---

#### `UIController` (class)

**File:** `assets/js/managers/uiController.js`

Manages UI state, theme switching, and language switching /

---

## Controllers

### Controllers

#### `SearchController` (class)

**File:** `assets/js/controllers/searchController.js`

Manages search functionality with debouncing and validation /

---

#### `SortController` (class)

**File:** `assets/js/controllers/sortController.js`

Manages sorting functionality for Pokemon display /

---

## Utilities

### Utilities

#### `CacheManager` (class)

**File:** `assets/js/utils/cacheManager.js`

Manages local caching of Pokemon data to reduce network requests /

---

#### `STAT_BENCHMARKS` (const)

**File:** `assets/js/utils/statComparison.js`

Pre-calculated stat averages and maximums across all 1025 Pokemon These values are based on the complete Pokedex data /

---

#### `StructuredDataGenerator` (class)

**File:** `assets/js/utils/structuredData.js`

Generates structured data (JSON-LD) for Pokemon /

---

#### `TYPE_EFFECTIVENESS` (const)

**File:** `assets/js/utils/typeEffectiveness.js`

Type effectiveness multipliers for Pokemon type matchups Structure: {attacking_type: {defending_type: multiplier}} Multipliers: - 2.0: Super effective - 1.0: Normal damage (not listed) - 0.5: Not very effective - 0: No effect (immune) /

**Type:** {Object.<string, Object.<string, number>>}

---

#### `URLRouter` (class)

**File:** `assets/js/utils/urlRouter.js`

Manages URL routing for SEO and deep linking /

---

#### `calculateStatBenchmarks` (function)

**File:** `assets/js/utils/statComparison.js`

Calculate stat benchmarks from all Pokemon data /

**Parameters:**
- {Array<Object>} allPokemon - Array of all Pokemon

**Returns:** {Object} Calculated benchmarks

---

#### `calculateTypeEffectiveness` (function)

**File:** `assets/js/utils/typeEffectiveness.js`

Calculate damage multiplier for an attacking type against defending types /

**Parameters:**
- {string} attackingType - The type of the attacking move
- {Array<string>} defendingTypes - Array of defending Pokemon's types

**Returns:** {number} Combined damage multiplier

---

#### `compareStatToBenchmark` (function)

**File:** `assets/js/utils/statComparison.js`

Compare a Pokemon's stat to benchmarks /

**Parameters:**
- {number} statValue - The stat value to compare
- {string} statName - The stat name
- {Object} benchmarks - Stat benchmarks (optional, uses defaults if not provided)

**Returns:** {Object} Comparison data

---

#### `compareTwoPokemons` (function)

**File:** `assets/js/utils/statComparison.js`

Compare two Pokemon's stats /

**Parameters:**
- {Object} pokemon1Stats - First Pokemon's stats
- {Object} pokemon2Stats - Second Pokemon's stats

**Returns:** {Object} Comparison data for each stat

---

#### `convertToJsDelivrUrl` (function)

**File:** `assets/js/utils/imageUtils.js`

Converts a githubusercontent URL to a jsDelivr CDN URL for better reliability /

**Parameters:**
- {string} url - Original GitHub raw content URL

**Returns:** {string} - jsDelivr CDN URL

---

#### `createImageWithFallback` (function)

**File:** `assets/js/utils/imageUtils.js`

Creates an image element with automatic fallback to alternative CDN /

**Parameters:**
- {string} primaryUrl - Primary image URL (usually githubusercontent)
- {string} alt - Alt text for the image
- {Object} options - Additional options
- {Function} options.onError - Custom error handler
- {Function} options.onLoad - Custom load handler
- {string} options.className - CSS class to add

**Returns:** {HTMLImageElement} - Image element with fallback configured

---

#### `createSafeElement` (function)

**File:** `assets/js/utils/security.js`

Creates safe DOM elements with text content /

**Parameters:**
- {string} tagName - The HTML tag name
- {string} textContent - The text content to set
- {Object} attributes - Optional attributes to set

**Returns:** {HTMLElement} Safe DOM element

---

#### `debounce` (function)

**File:** `assets/js/utils/debounce.js`

Debounces a function to limit execution frequency /

**Parameters:**
- {Function} func - Function to debounce
- {number} wait - Wait time in milliseconds

**Returns:** {Function} Debounced function

---

#### `getEffectivenessCategory` (function)

**File:** `assets/js/utils/typeEffectiveness.js`

Get effectiveness category for a multiplier /

**Parameters:**
- {number} multiplier - Damage multiplier

**Returns:** {string} Category: 'immune', 'not-very-effective', 'normal', or 'super-effective'

---

#### `getNoEffectAgainst` (function)

**File:** `assets/js/utils/typeEffectiveness.js`

Get all types that a given type has no effect against /

**Parameters:**
- {string} attackingType - The attacking type

**Returns:** {Array<string>} Array of type names

---

#### `getNotVeryEffectiveAgainst` (function)

**File:** `assets/js/utils/typeEffectiveness.js`

Get all types that a given type is not very effective against /

**Parameters:**
- {string} attackingType - The attacking type

**Returns:** {Array<string>} Array of type names

---

#### `getOverallStatRating` (function)

**File:** `assets/js/utils/statComparison.js`

Get overall stat rating for a Pokemon /

**Parameters:**
- {Object} stats - Pokemon stats object
- {Object} benchmarks - Stat benchmarks (optional)

**Returns:** {Object} Overall rating data

---

#### `getPokemonSpriteUrl` (function)

**File:** `assets/js/utils/imageUtils.js`

Get the Pokemon sprite URL with CDN fallback /

**Parameters:**
- {number|string} pokemonId - Pokemon ID
- {Object} options - Options for sprite URL
- {boolean} options.shiny - Whether to get shiny sprite
- {boolean} options.back - Whether to get back sprite

**Returns:** {string} - Sprite URL

---

#### `getSuperEffectiveAgainst` (function)

**File:** `assets/js/utils/typeEffectiveness.js`

Get all types that a given type is super effective against /

**Parameters:**
- {string} attackingType - The attacking type

**Returns:** {Array<string>} Array of type names

---

#### `getTypeClassName` (function)

**File:** `assets/js/utils/typeMapping.js`

Gets the CSS class name for a Pokemon type /

**Parameters:**
- {string} typeName - The type name (in any language)

**Returns:** {string} CSS class name for the type

---

#### `getTypeClassNames` (function)

**File:** `assets/js/utils/typeMapping.js`

Gets CSS class names for multiple types /

**Parameters:**
- {Array<string>} types - Array of type names

**Returns:** {Array<string>} Array of CSS class names

---

#### `preloadImages` (function)

**File:** `assets/js/utils/imageUtils.js`

Preload multiple images with fallback /

**Parameters:**
- {Array<string>} urls - Array of image URLs to preload

**Returns:** {Promise<Array>} - Promise that resolves when all images are loaded or failed

---

#### `safeSetInnerHTML` (function)

**File:** `assets/js/utils/security.js`

Safely sets innerHTML with sanitization /

**Parameters:**
- {HTMLElement} element - Target element
- {string} html - HTML content to set

**Note:** For best security, use DOMPurify (https://github.com/cure53/DOMPurify) in production.

---

#### `sanitizeHTML` (function)

**File:** `assets/js/utils/security.js`

Sanitizes HTML content to prevent XSS attacks /

**Parameters:**
- {string} html - The HTML content to sanitize

**Returns:** {string} Sanitized HTML content

---

#### `sanitizeSearchInput` (function)

**File:** `assets/js/utils/security.js`

Validates and sanitizes search input /

**Parameters:**
- {string} input - User search input

**Returns:** {string} Sanitized search input

---

#### `validatePokemonId` (function)

**File:** `assets/js/utils/security.js`

Validates Pokemon ID to prevent manipulation /

**Parameters:**
- {*} id - Pokemon ID to validate

**Returns:** {number|null} Valid Pokemon ID or null

---


## Related Documentation

- **Module Dependencies:** See `MODULE_DEPENDENCIES.md`
- **Data Schema:** See `DATA_SCHEMA.md`
- **Contributing:** See `CONTRIBUTING.md`
- **Architecture:** See `.github/copilot-instructions.md`

---

*This documentation is auto-generated. To update, run:*
```bash
python generate_api_docs.py
```
