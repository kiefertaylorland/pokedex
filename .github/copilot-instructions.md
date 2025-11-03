# Copilot Instructions for Pokedex Project

## Architecture Overview

**Tech Stack:** Vanilla JavaScript ES6 modules + Python 3.12+ scripts  
**Data Flow:** PokéAPI → `pokeapi_fetch.py` → `pokedex_data.json` → Frontend  
**Deployment:** Static site on GitHub Pages (no build step)

### Key Architectural Decisions

1. **No frontend frameworks** - Vanilla JS for lightweight, dependency-free operation
2. **Module-based architecture** - Components, managers, controllers, and utils organized by responsibility
3. **Two-phase data pipeline** - Generate once (Python), consume many times (JavaScript)
4. **Service Worker PWA** - Offline-first with versioned caching (`v1.1.0`)

## Project Structure

```
assets/js/
├── pokedexApp.js           # Main orchestrator - initializes all components
├── constants.js            # Single source of truth for configs, IDs, events
├── components/             # UI components (cards, detail views, comparisons)
├── controllers/            # User input handlers (search, sort)
├── managers/               # Core services (data, UI state)
└── utils/                  # Helpers (caching, routing, type effectiveness)

Python Scripts:
├── pokeapi_fetch.py        # [372 lines] Full API fetcher - generates pokedex_data.json
├── pokeapi.py              # [30 lines] Simple loader - fast read-only access
├── run_tests.py            # Test runner with HTTP server lifecycle management
└── transform_pokemon_data.py, add_romaji.py  # Data transformation utilities
```

### Module Dependencies

```
PokedexApp (orchestrator)
├── PokemonDataManager (data loading + caching)
├── UIController (theme, language, DOM state)
├── PokemonCardRenderer (grid view rendering)
├── PokemonDetailView (detail modal - 1200+ lines, largest file)
├── SearchController (search + filtering)
├── SortController (sorting logic)
├── URLRouter (deep linking)
└── StructuredDataGenerator (SEO metadata)
```

**Critical:** All JS modules use named exports. Import from `constants.js` for all IDs, events, and configs.

## Data Management

### Two Python Modules (Complementary, Not Redundant)

**`pokeapi.py`** - Simple data loader for quick queries:
```python
from pokeapi import fetch_pokemon
pokemon = fetch_pokemon(25)  # Returns Pikachu from pokedex_data.json
```

**`pokeapi_fetch.py`** - Full API fetcher for data generation:
```bash
python pokeapi_fetch.py  # Fetches all 1025 Pokémon, takes several minutes
```

See `POKEAPI_MODULES.md` and `DATA_FILES.md` for complete documentation.

### Data Files

- **`pokedex_data.json`** (2.9MB) - Production data, loaded by frontend
- **`pokedex_data_test.json`** (146KB) - Test subset for faster testing
- **`pokedex_data.json.backup`** - Auto-generated backup (in `.gitignore`)
- **`pokedex_data_original_backup.json`** - Historical backup (consider removing)

**Never manually edit JSON files** - regenerate via `python pokeapi_fetch.py`

## Development Workflows

### Setup & Testing
```bash
# One-time setup
pip install -r requirements.txt
python pokeapi_fetch.py  # If pokedex_data.json doesn't exist

# Development server (always port 8000)
python3 -m http.server 8000

# Run tests (auto-manages HTTP server)
python run_tests.py
python run_tests.py tests/test_ui.py  # Specific file
python run_tests.py --keep-server --port 8080  # Custom options
```

### Test Infrastructure

- **Framework:** pytest + Selenium WebDriver (Chrome/Chromium)
- **Pattern:** Tests use `unittest.TestCase` despite pytest being installed (known inconsistency)
- **Server Management:** `run_tests.py` handles HTTP server lifecycle automatically
- **Known Issue:** Tests have hardcoded ports (8000, 8001, 8003) and duplicate server setup code

**Test files:**
- `test_ui.py` - Search, theme switching, UI interactions
- `test_transitions.py` - Animations, image loading
- `test_pokeapi.py` - Data loader tests
- `test_pokeapi_fetch.py`, `test_pokeapi_integration.py` - API fetching
- `test_evolution_chain.py` - Evolution chain logic

**Some tests may fail** due to timing/environment issues. Focus on tests related to your changes.

## Critical Patterns & Conventions

### JavaScript Module Pattern
```javascript
// All modules export named classes/constants
export class MyComponent {
    constructor() {
        // Cache DOM elements in constructor
        this.elements = {};
    }
}

// Always import from constants.js
import { EVENTS, ELEMENT_IDS, CSS_CLASSES } from './constants.js';
```

### Event-Driven Communication
Components communicate via custom events defined in `constants.js`:
```javascript
// constants.js defines all events
export const EVENTS = {
    POKEMON_SELECTED: 'pokemon-selected',
    SEARCH_UPDATE: 'search-update',
    // ...
};

// Dispatch events instead of direct coupling
document.dispatchEvent(new CustomEvent(EVENTS.POKEMON_SELECTED, { 
    detail: { pokemon } 
}));
```

### Accessibility Requirements (Non-Negotiable)
- **ARIA labels** on all interactive elements
- **Keyboard navigation**: Tab, Enter, Escape, Arrow keys
- **Screen reader support**: Use `sr-only` class for visually hidden labels
- **Theme support**: All styles work in both light and dark themes
- **Semantic HTML**: Use proper heading hierarchy (h1 → h2 → h3)

Example from `index.html`:
```html
<label for="search-input" class="sr-only">Search Pokémon</label>
<input id="search-input" aria-describedby="search-help" />
<div id="search-help" class="sr-only">Search by name, number, or type</div>
```

### Bilingual Support Pattern
All text must support English/Japanese toggle:
```javascript
// Store both languages in data
{ name_en: "pikachu", name_ja: "ピカチュウ", name_ja_romaji: "pikachuu" }

// Use UIController.currentLanguage to select
const name = this.uiController.currentLanguage === 'en' 
    ? pokemon.name_en 
    : pokemon.name_ja;
```

### Service Worker Caching Strategy
- **Static assets** cached on install (HTML, CSS, JS, icons)
- **Data files** cached separately with versioning
- **Cache version** in `service-worker.js` must be bumped on updates
- Current version: `v1.1.0`

## Common Tasks

### Adding a UI Feature
1. Create component in `assets/js/components/myFeature.js`
2. Export named class: `export class MyFeature { }`
3. Import in `pokedexApp.js` and initialize
4. Add custom event to `constants.js` if needed
5. Update `service-worker.js` to cache new file
6. Test keyboard navigation and screen reader support

### Modifying Pokemon Data
1. Update `pokeapi_fetch.py` to fetch new fields
2. Run `python pokeapi_fetch.py` to regenerate (takes ~10 minutes)
3. Backup existing data first: `cp pokedex_data.json pokedex_data.json.backup`
4. Update frontend code to use new fields
5. Update `pokedex_data_test.json` if tests need new fields

### Fixing Type Effectiveness Issues
Type effectiveness data exists in TWO places (known duplication):
- `pokeapi_fetch.py` - Python dict `TYPE_EFFECTIVENESS`
- `assets/js/utils/typeEffectiveness.js` - JavaScript object

**Keep both in sync** when modifying type matchups.

## Deployment

GitHub Actions auto-deploys on push to `main`:
```yaml
# .github/workflows/deploy.yml
# No tests run before deploy (known issue - see issues.md #38)
# No build step - static files deployed as-is
```

**Service Worker Cache Busting:** Update version in `service-worker.js` when deploying changes:
```javascript
const CACHE_NAME = 'pokedex-v1.1.0'; // Increment this
```

## Known Issues & Constraints

See `issues.md` for comprehensive list (45 tracked issues). Key ones:

- **Issue #7:** Console logging in production code (remove debug statements)
- **Issue #11:** Tests use unittest despite pytest in requirements
- **Issue #17:** `pokemonDetailView.js` is 1200+ lines (needs refactoring)
- **Issue #25:** No lazy loading - all 1025 cards render at once
- **Issue #29:** Type effectiveness duplicated in Python and JavaScript
- **Issue #38:** No pre-deploy tests in CI/CD pipeline

**Don't fix unrelated issues** - focus on the task at hand.

## Style Guide

- **JavaScript:** camelCase (functions/vars), kebab-case (HTML IDs/classes)
- **Python:** snake_case, PEP 8 compliant
- **JSDoc comments** for all exported functions
- **No type hints in Python** (known gap, low priority to add)
- **Async/await** preferred over `.then()/.catch()`

## Documentation Files

- `README.md` - User-facing setup and features
- `DATA_FILES.md` - Explains all data file variants
- `POKEAPI_MODULES.md` - Explains pokeapi.py vs pokeapi_fetch.py
- `issues.md` - Comprehensive issue tracker (45 issues documented)
- `.github/copilot-instructions.md` - This file

## Quick Reference

```bash
# Essential Commands
python3 -m http.server 8000      # Dev server (always port 8000)
python run_tests.py               # Run all tests
python pokeapi_fetch.py          # Regenerate data (~10 min)
pre-commit run --all-files       # Lint (whitespace only)

# Key Files
assets/js/constants.js           # All IDs, events, configs
assets/js/pokedexApp.js          # Main orchestrator
assets/js/components/pokemonDetailView.js  # Largest component (1200+ lines)
pokedex_data.json                # Production data (2.9MB)
run_tests.py                     # Test runner (manages HTTP server)
```

**Live Site:** [www.pokedex.tech](https://www.pokedex.tech)  
**Repo:** github.com/kiefertaylorland/pokedex
