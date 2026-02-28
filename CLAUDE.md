# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pokédex** is an interactive web application showcasing all 1025 Pokémon (Generations I-IX) with detailed information, bilingual support (English/Japanese), and modern accessibility features.

- **Tech Stack**: Vanilla JavaScript ES6 modules + Python 3.12+ scripts
- **Data Source**: [PokéAPI](https://pokeapi.co/)
- **Deployment**: Static site on GitHub Pages (no build step)
- **Architecture**: Event-driven components with service worker PWA support
- **Live Site**: [www.pokedex.tech](https://www.pokedex.tech)

## Essential Commands

```bash
# Development server (port 8000)
npm run serve
# or: python3 -m http.server 8000

# Linting
npm run lint              # Full lint report
npm run lint:fix          # Auto-fix lint issues
npm run lint:changed      # Lint only files changed in current branch

# Testing
npm run test              # Run all tests (pytest + Selenium)
npm run test:js           # Run JavaScript unit tests only

# Data management
npm run generate:types    # Regenerate type effectiveness data
python pokeapi_fetch.py   # Regenerate all Pokédex data from PokéAPI (~10 min)

# Validation
npm run validate          # Validate SEO files and structured data
```

### Running Specific Tests
```bash
python run_tests.py tests/test_ui.py    # Single test file
python run_tests.py --keep-server       # Keep HTTP server running after tests
```

## Project Structure

```
pokedex/
├── assets/
│   ├── js/
│   │   ├── pokedexApp.js               # Main orchestrator
│   │   ├── constants.js                # IDs, events, configs (source of truth)
│   │   ├── components/                 # UI components (cards, details, modals)
│   │   ├── controllers/                # User input handlers (search, sort)
│   │   ├── managers/                   # Core services (data, UI state)
│   │   └── utils/                      # Helpers (caching, routing, type logic)
│   └── css/                            # Styles (light/dark theme support)
├── pokedex_data.json                   # Main data (2.9MB, don't edit manually)
├── pokedex_data_test.json              # Test data subset (146KB)
├── tests/                              # Selenium + unit tests
├── pokeapi_fetch.py                    # Data fetcher (~372 lines)
├── pokeapi.py                          # Simple data loader (~30 lines)
└── run_tests.py                        # Test runner with HTTP server management
```

## Architecture

### Data Flow
```
PokéAPI → pokeapi_fetch.py → pokedex_data.json → Frontend (JavaScript)
```

### Module Organization

**Core Manager Classes** (initialized in `pokedexApp.js`):
- `PokemonDataManager` - Data loading and caching
- `UIController` - Theme, language, DOM state management
- `URLRouter` - Deep linking and page state persistence

**Components** (UI rendering):
- `PokemonCardRenderer` - Main grid view
- `pokemonDetailView.js` - Detail modal (1200+ lines, largest component)
- `PokemonComparison` - Side-by-side comparison view
- `TeamBuilder` - Team builder with type coverage
- `EvolutionTreeView` - Evolution chain visualization

**Controllers** (User input):
- `SearchController` - Search and filtering logic
- `SortController` - Sorting by ID, name, height, weight, stats

**Utils** (Helpers):
- `typeEffectiveness.js` - Type matchup logic
- `fuzzySearch.js` - Search algorithm
- `cacheManager.js` - IndexedDB caching
- `structuredData.js` - SEO metadata generation

### Critical Pattern: Event-Driven Communication

All components communicate via custom events defined in `constants.js`:

```javascript
// Dispatch events
document.dispatchEvent(new CustomEvent(EVENTS.POKEMON_SELECTED, {
    detail: { pokemon }
}));

// Listen to events
document.addEventListener(EVENTS.POKEMON_SELECTED, (e) => {
    console.log(e.detail.pokemon);
});
```

**All event types must be defined in `constants.js`** - this is the single source of truth for inter-component communication.

## Data Management

### Two Python Modules (Different Purposes)

**`pokeapi.py`** - Simple, fast data loader for queries:
```python
from pokeapi import fetch_pokemon
pokemon = fetch_pokemon(25)  # Returns Pikachu from pokedex_data.json
```

**`pokeapi_fetch.py`** - Full API fetcher for generating fresh data:
```bash
python pokeapi_fetch.py  # Fetches all 1025 Pokémon (takes ~10 minutes)
```

### Data Files

- **`pokedex_data.json`** - Production data (2.9MB), loaded by frontend
- **`pokedex_data_test.json`** - Test subset (146KB), used by tests
- **Never manually edit JSON files** - regenerate via `python pokeapi_fetch.py`

## JavaScript Patterns

### Module Structure

All JavaScript files export named classes/constants:

```javascript
// DO: Named export
export class MyComponent {
    constructor() {
        this.elements = {};  // Cache DOM elements
    }
}

// DO: Always import from constants
import { EVENTS, ELEMENT_IDS } from './constants.js';

// DON'T: Default exports or direct DOM queries in module scope
```

### Bilingual Support

All text must support English/Japanese with optional romaji:

```javascript
// Data contains both languages
{ name_en: "pikachu", name_ja: "ピカチュウ", name_ja_romaji: "pikachuu" }

// Use UIController.currentLanguage to select
const name = this.uiController.currentLanguage === 'en'
    ? pokemon.name_en
    : pokemon.name_ja;
```

### Accessibility (Non-Negotiable)

- **ARIA labels** on all interactive elements
- **Keyboard navigation**: Tab, Enter, Escape, Arrow keys
- **Screen reader support**: Use `sr-only` class for visually hidden labels
- **Theme support**: All styles work in both light and dark themes
- **Semantic HTML**: Proper heading hierarchy (h1 → h2 → h3)

Example:
```html
<label for="search-input" class="sr-only">Search Pokémon</label>
<input id="search-input" aria-describedby="search-help" />
```

## Testing

### Test Framework
- **Framework**: pytest + Selenium WebDriver (Chrome/Chromium)
- **Pattern**: Tests use `unittest.TestCase` (despite pytest being installed)
- **Server Management**: `run_tests.py` handles HTTP server lifecycle automatically

### Test Files
- `test_ui.py` - Search, theme switching, UI interactions
- `test_transitions.py` - Animations, image loading, transitions
- `test_pokeapi.py` - Data loader tests
- `test_pokeapi_fetch.py`, `test_pokeapi_integration.py` - API fetching
- `test_evolution_chain.py` - Evolution chain logic

### Known Test Issues
- Some tests may fail due to timing or environment-specific issues
- Check `KNOWN_TEST_FAILURES.md` for documented failures
- Tests have hardcoded ports (8000, 8001, 8003) and duplicate server setup code
- Focus tests on the feature you're changing

## Style Guide

- **JavaScript**: camelCase for functions/variables, kebab-case for HTML IDs/classes
- **Python**: snake_case, PEP 8 compliant
- **JSDoc comments** for all exported functions
- **Async/await** preferred over `.then()/.catch()`

## Known Issues & Constraints

See `issues.md` for the complete list (45 tracked issues). Key ones relevant to development:

- **Issue #7**: Console logging in production code - remove debug statements
- **Issue #17**: `pokemonDetailView.js` is 1200+ lines (needs refactoring)
- **Issue #25**: No lazy loading - all 1025 cards render at once
- **Issue #29**: Type effectiveness duplicated in Python and JavaScript (keep both in sync)
- **Issue #38**: No pre-deploy tests in CI/CD pipeline

**Don't fix unrelated issues** - focus on the task at hand.

## Deployment

- GitHub Actions auto-deploys to GitHub Pages on push to `main`
- No build step - static files deployed as-is
- **Service Worker Cache Busting**: Update version in `service-worker.js` when deploying:
  ```javascript
  const CACHE_NAME = 'pokedex-v1.1.0';  // Increment this
  ```

## Important Notes for Feature Development

1. **Adding a new component**: Create in `assets/js/components/`, export as named class, initialize in `pokedexApp.js`
2. **Adding new data fields**: Update `pokeapi_fetch.py`, regenerate with `python pokeapi_fetch.py`, then update frontend code
3. **Type effectiveness changes**: Keep both `pokeapi_fetch.py` and `assets/js/utils/typeEffectiveness.js` in sync
4. **Linting**: New/refactored files must pass lint; legacy debt tracked separately in `LINTING.md`
5. **Cache busting**: Increment `service-worker.js` version when deploying updates

## Documentation Files

- `README.md` - User-facing features and quick start
- `CONTRIBUTING.md` - Contribution guidelines
- `.github/copilot-instructions.md` - Extended architecture documentation
- `POKEAPI_MODULES.md` - Detailed explanation of `pokeapi.py` vs `pokeapi_fetch.py`
- `DATA_FILES.md` - Data file variants and usage
- `LINTING.md` - Linting strategy
- `issues.md` - Issue tracking and TODOs
- `KNOWN_TEST_FAILURES.md` - Environment-specific test issues
