# Module Dependencies

**Document Version:** 1.0  
**Last Updated:** November 2, 2025

This document outlines the module structure, dependencies, and data flow in the Pokédex application.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Module Structure](#module-structure)
- [Dependency Graph](#dependency-graph)
- [Data Flow](#data-flow)
- [Module Responsibilities](#module-responsibilities)
- [Adding New Modules](#adding-new-modules)

## Architecture Overview

The Pokédex application uses a **modular, event-driven architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      PokedexApp                             │
│                  (Main Orchestrator)                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
      ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Managers │ │Components│ │Controllers│
└──────────┘ └──────────┘ └──────────┘
      │            │            │
      └────────────┴────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  Utilities      │
          └─────────────────┘
```

### Key Principles

1. **Single Source of Truth**: `constants.js` contains all IDs, events, and configuration
2. **Event-Driven Communication**: Modules communicate via custom events, not direct coupling
3. **Dependency Injection**: Components receive dependencies through constructors
4. **No Circular Dependencies**: Clear hierarchy prevents circular imports

## Module Structure

```
assets/js/
├── pokedexApp.js              # Main orchestrator
├── constants.js               # Configuration & constants
│
├── managers/                  # Core services
│   ├── dataManager.js         # Pokemon data loading & caching
│   └── uiController.js        # UI state & theme management
│
├── components/                # UI components
│   ├── pokemonCardRenderer.js      # Grid view cards
│   ├── pokemonDetailView.js        # Detail modal (large!)
│   ├── pokemonComparison.js        # Side-by-side comparison
│   ├── teamBuilder.js              # Team management
│   ├── evolutionTreeView.js        # Evolution chains
│   ├── typeMatchupChart.js         # Type effectiveness
│   ├── enhancedStatsDisplay.js     # Stats visualization
│   └── keyboardShortcutsModal.js   # Keyboard help
│
├── controllers/               # User input handlers
│   ├── searchController.js    # Search & filtering
│   └── sortController.js      # Sorting logic
│
└── utils/                     # Helper functions
    ├── cacheManager.js        # Browser caching
    ├── urlRouter.js           # Deep linking
    ├── structuredData.js      # SEO metadata
    ├── typeEffectiveness.js   # Type matchup calculations
    ├── typeMapping.js         # Type name translations
    ├── imageUtils.js          # Image loading & fallbacks
    ├── security.js            # Input sanitization
    ├── debounce.js            # Function debouncing
    ├── statComparison.js      # Stats calculation
    └── errorBoundary.js       # Global error handling
```

## Dependency Graph

### Level 0: Foundation (No Dependencies)

```
constants.js
    ↓
    Exports: EVENTS, ELEMENT_IDS, CSS_CLASSES, CONFIG
```

### Level 1: Utilities (Depend on constants only)

```
utils/security.js
utils/debounce.js
utils/typeEffectiveness.js     ← Auto-generated from Python
utils/typeMapping.js
utils/errorBoundary.js          ← Standalone, no imports
```

### Level 2: Managers (Depend on constants + utils)

```
managers/dataManager.js
    ├── constants.js
    ├── utils/cacheManager.js
    └── utils/security.js

managers/uiController.js
    ├── constants.js
    └── utils/imageUtils.js
```

### Level 3: Controllers & Components (Depend on managers)

```
controllers/searchController.js
    ├── constants.js
    ├── managers/dataManager.js
    ├── managers/uiController.js
    └── utils/debounce.js

controllers/sortController.js
    ├── constants.js
    ├── managers/dataManager.js
    └── managers/uiController.js

components/pokemonCardRenderer.js
    ├── constants.js
    ├── managers/dataManager.js
    ├── managers/uiController.js
    └── utils/typeMapping.js

components/pokemonDetailView.js
    ├── constants.js
    ├── managers/dataManager.js
    ├── managers/uiController.js
    ├── utils/typeEffectiveness.js
    ├── utils/typeMapping.js
    └── utils/imageUtils.js

components/pokemonComparison.js
    ├── constants.js
    └── managers/dataManager.js

components/teamBuilder.js
    ├── constants.js
    └── managers/dataManager.js

components/evolutionTreeView.js
    ├── constants.js
    └── managers/dataManager.js

components/keyboardShortcutsModal.js
    └── constants.js
```

### Level 4: Application Orchestrator

```
pokedexApp.js
    ├── constants.js
    ├── managers/dataManager.js
    ├── managers/uiController.js
    ├── components/pokemonCardRenderer.js
    ├── components/pokemonDetailView.js
    ├── components/keyboardShortcutsModal.js
    ├── controllers/searchController.js
    ├── controllers/sortController.js
    ├── utils/urlRouter.js
    └── utils/structuredData.js
```

## Data Flow

### 1. Application Initialization

```
index.html
    │
    ├─► errorBoundary.js (loads first, catches all errors)
    │
    └─► pokedexApp.js
            │
            ├─► UIController.initialize()
            │       └─► Sets up theme, language from localStorage
            │
            ├─► DataManager.loadPokemonData()
            │       ├─► Checks CacheManager for cached data
            │       └─► Falls back to fetch('pokedex_data.json')
            │
            ├─► Components initialize with data
            │       ├─► CardRenderer.initialize()
            │       ├─► DetailView.initialize()
            │       ├─► SearchController.initialize()
            │       └─► SortController.initialize()
            │
            └─► URLRouter checks for initial route
                    └─► If /pokemon/:id exists, show detail view
```

### 2. User Interaction Flow

#### Search Flow
```
User types in search box
    │
    ▼
SearchController (debounced)
    │
    ├─► DataManager.searchPokemon(query)
    │       └─► Returns filtered results
    │
    └─► Dispatch SEARCH_UPDATE event
            │
            ▼
        PokedexApp handles event
            │
            └─► CardRenderer.render(filteredData)
```

#### Pokemon Selection Flow
```
User clicks Pokemon card
    │
    ▼
CardRenderer dispatches POKEMON_SELECTED event
    │
    ▼
PokedexApp handles event
    │
    ├─► URLRouter.navigate('/pokemon/:id')
    │       └─► Updates browser history
    │
    └─► DetailView.show(pokemon)
            │
            ├─► Fetches additional data if needed
            ├─► Generates structured data (SEO)
            └─► Renders detail modal
```

#### Sort Flow
```
User selects sort option
    │
    ▼
SortController
    │
    ├─► DataManager.sortPokemon(sortOption)
    │       └─► Returns sorted array
    │
    └─► Dispatch SORT_CHANGE event
            │
            ▼
        PokedexApp handles event
            │
            └─► CardRenderer.render(sortedData)
```

### 3. Event-Based Communication

All inter-module communication uses custom events defined in `constants.js`:

```javascript
// constants.js
export const EVENTS = {
    POKEMON_SELECTED: 'pokemon-selected',
    SEARCH_UPDATE: 'search-update',
    SORT_CHANGE: 'sort-change',
    THEME_TOGGLE: 'theme-toggle',
    LANGUAGE_TOGGLE: 'language-toggle',
    // ...
};

// Module A: Dispatch event
document.dispatchEvent(new CustomEvent(EVENTS.POKEMON_SELECTED, {
    detail: { pokemon: pokemonData }
}));

// Module B: Listen for event
document.addEventListener(EVENTS.POKEMON_SELECTED, (e) => {
    const pokemon = e.detail.pokemon;
    // Handle event
});
```

## Module Responsibilities

### Managers

**DataManager** (`managers/dataManager.js`)
- Load and cache Pokemon data
- Search and filter operations
- Sort operations
- Data transformation
- Single source of truth for Pokemon data

**UIController** (`managers/uiController.js`)
- Theme management (light/dark)
- Language management (English/Japanese)
- Loading states
- Error messages
- DOM element caching

### Components

**PokemonCardRenderer** (`components/pokemonCardRenderer.js`)
- Render Pokemon cards in grid
- Handle card clicks
- Lazy loading images
- Accessibility attributes

**PokemonDetailView** (`components/pokemonDetailView.js`)
- ⚠️ **LARGE FILE** (1200+ lines - see Issue #17)
- Render detailed Pokemon modal
- Tabs for stats, moves, evolution
- Audio playback (cries)
- Evolution chain display
- Type matchup display

**PokemonComparison** (`components/pokemonComparison.js`)
- Side-by-side stat comparison
- Type effectiveness comparison
- Visual stat bars

**TeamBuilder** (`components/teamBuilder.js`)
- Manage team of up to 6 Pokemon
- Persist team to localStorage
- Team type coverage analysis

**KeyboardShortcutsModal** (`components/keyboardShortcutsModal.js`)
- Display keyboard shortcuts (press '?')
- Handle global keyboard shortcuts
- Accessibility focus trapping

### Controllers

**SearchController** (`controllers/searchController.js`)
- Handle search input
- Debounce search queries
- Filter by name, ID, type
- Emit search results

**SortController** (`controllers/sortController.js`)
- Handle sort dropdown
- Apply sort options
- Emit sort changes

### Utilities

**cacheManager.js** - Browser cache management  
**urlRouter.js** - Deep linking (/pokemon/:id)  
**structuredData.js** - SEO metadata generation  
**typeEffectiveness.js** - Type matchup calculations (auto-generated)  
**security.js** - XSS prevention, input sanitization  
**errorBoundary.js** - Global error handling with user-friendly messages  

## Adding New Modules

### Step-by-Step Guide

1. **Choose appropriate directory:**
   - `components/` - UI elements
   - `managers/` - Core services
   - `controllers/` - User input handlers
   - `utils/` - Helper functions

2. **Create module with named exports:**
   ```javascript
   // ✅ Good
   export class MyComponent { }
   
   // ❌ Bad - don't use default exports
   export default class MyComponent { }
   ```

3. **Import constants:**
   ```javascript
   import { EVENTS, ELEMENT_IDS } from '../constants.js';
   ```

4. **Use dependency injection:**
   ```javascript
   export class MyComponent {
       constructor(dataManager, uiController) {
           this.dataManager = dataManager;
           this.uiController = uiController;
       }
   }
   ```

5. **Communicate via events:**
   ```javascript
   // Dispatch events
   document.dispatchEvent(new CustomEvent(EVENTS.MY_EVENT, {
       detail: { data }
   }));
   
   // Don't call other components directly
   // ❌ otherComponent.handleMyData(data);
   ```

6. **Add to main app:**
   ```javascript
   // pokedexApp.js
   import { MyComponent } from './components/myComponent.js';
   
   // In constructor
   this.myComponent = null;
   
   // In _initializeComponents()
   this.myComponent = new MyComponent(
       this.dataManager,
       this.uiController
   );
   ```

7. **Update service worker cache:**
   ```javascript
   // service-worker.js
   const STATIC_ASSETS = [
       // ...
       '/assets/js/components/myComponent.js',
   ];
   ```

## Preventing Circular Dependencies

### ❌ Bad: Circular Dependency

```
componentA.js → imports componentB.js
componentB.js → imports componentA.js
```

### ✅ Good: Event-Driven

```
componentA.js → dispatches event
componentB.js → listens for event
```

### ✅ Good: Shared Parent

```
pokedexApp.js
    ├─► creates componentA
    └─► creates componentB
        └─► passes reference if needed
```

## Testing Module Dependencies

Run this command to check for circular dependencies:

```bash
# Using madge (install: npm install -g madge)
madge --circular assets/js/

# Expected output: No circular dependencies found
```

## Performance Considerations

### Module Loading Order

1. **ErrorBoundary** - Loads first to catch initialization errors
2. **Constants** - Minimal, loads quickly
3. **Utilities** - Small, independent functions
4. **Managers** - Core services
5. **Controllers & Components** - Heavier modules
6. **PokedexApp** - Orchestrates everything

### Lazy Loading Opportunities

Currently all modules load on page load. Future optimization:

- Lazy load `pokemonComparison.js` (only when comparison opened)
- Lazy load `teamBuilder.js` (only when team builder opened)
- Lazy load `evolutionTreeView.js` (only when evolution tab clicked)

## Related Documentation

- **Architecture**: `.github/copilot-instructions.md`
- **Data Schema**: `DATA_SCHEMA.md`
- **Code Style**: `CONTRIBUTING.md`
- **Issues**: `issues.md` (see Issue #17, #18, #19, #20)

---

**Last Updated:** November 2, 2025  
**Maintainer:** Kiefer Land
