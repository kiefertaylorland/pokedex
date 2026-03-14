# Copilot Instructions for Pokedex Project

## Architecture Overview

**Tech Stack:** Vanilla JavaScript ES6 modules + Python 3.12+ scripts
**Data Flow:** PokéAPI → `scripts/pokeapi_fetch.py` → `pokedex_data.json` → Frontend
**Deployment:** Static site on GitHub Pages (no build step)

### Key Architectural Decisions

1. **No frontend frameworks** - Vanilla JS for lightweight, dependency-free operation
2. **Module-based architecture** - Components, managers, controllers, and utils organized by responsibility
3. **Two-phase data pipeline** - Generate once (Python), consume many times (JavaScript)
4. **Service Worker PWA** - Offline-first with versioned caching

## Project Structure

```
assets/js/
├── pokedexApp.js           # Main orchestrator - initializes all components
├── constants.js            # Single source of truth for configs, IDs, events
├── components/             # UI components (cards, detail views, comparisons)
├── controllers/            # User input handlers (search, sort)
├── managers/               # Core services (data, UI state)
└── utils/                  # Helpers (caching, routing, type effectiveness)

scripts/
├── pokeapi_fetch.py        # [372 lines] Full API fetcher - generates pokedex_data.json
├── generate_type_effectiveness.py  # Generates typeEffectiveness.js from Python data
├── generate_sitemap.py     # Generates sitemap.xml from pokedex_data.json
├── validate_seo_files.py   # Validates robots.txt and sitemap.xml
├── add_romaji.py           # Adds romaji to Japanese Pokémon names in data
└── transform_pokemon_data.py  # Data transformation utilities

docs/                       # Project documentation
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

### Data Generation

**`scripts/pokeapi_fetch.py`** - Full API fetcher for data generation:
```bash
python scripts/pokeapi_fetch.py          # Fetches all 1025 Pokémon (~10 min)
python scripts/pokeapi_fetch.py -c 151   # Gen 1 only
```

### Type Effectiveness

`assets/js/utils/typeEffectiveness.js` is **auto-generated** — never edit it manually:
```bash
python scripts/generate_type_effectiveness.py
```

### Data Files

- **`pokedex_data.json`** (2.9MB) - Production data, loaded by frontend
- **Never manually edit JSON files** - regenerate via `python scripts/pokeapi_fetch.py`

## Development Workflows

### Setup
```bash
# One-time setup
pip install -r requirements.txt

# Development server (always port 8000)
python3 -m http.server 8000
```

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

### Bilingual Support Pattern
All text must support English/Japanese toggle:
```javascript
{ name_en: "pikachu", name_ja: "ピカチュウ", name_ja_romaji: "pikachuu" }

const name = this.uiController.currentLanguage === 'en'
    ? pokemon.name_en
    : pokemon.name_ja;
```

### Service Worker Caching Strategy
- **Static assets** cached on install (HTML, CSS, JS, icons)
- **Data files** cached separately with versioning
- **Cache version** in `service-worker.js` must be bumped on every deploy

## Common Tasks

### Adding a UI Feature
1. Create component in `assets/js/components/myFeature.js`
2. Export named class: `export class MyFeature { }`
3. Import in `pokedexApp.js` and initialize
4. Add custom event to `constants.js` if needed
5. Add the new file to `service-worker.js` static assets list
6. Verify keyboard navigation and screen reader support

### Modifying Pokémon Data
1. Update `scripts/pokeapi_fetch.py` to fetch new fields
2. Run `python scripts/pokeapi_fetch.py` to regenerate (~10 minutes)
3. Update frontend code to use new fields

### Fixing Type Effectiveness Issues
Type effectiveness has a single source of truth in `scripts/pokeapi_fetch.py`.
Run `python scripts/generate_type_effectiveness.py` to sync to JavaScript.

## Deployment

GitHub Actions auto-deploys on push to `main`:
- Validates SEO files and Python syntax before deploying
- No build step - static files deployed as-is

**Service Worker Cache Busting:** Update version in `service-worker.js` when deploying:
```javascript
const CACHE_NAME = 'pokedex-v1.1.0'; // Increment this
```

## Known Constraints

- **`pokemonDetailView.js`** is 1200+ lines — large but intentional; avoid growing it further
- **`pokedex_data.json`** (2.9MB) committed to git — acceptable at this size
- **No tests currently** — Playwright tests planned for future

## Style Guide

- **JavaScript:** camelCase (functions/vars), kebab-case (HTML IDs/classes), single quotes, semicolons
- **Python:** snake_case, PEP 8, type hints on public functions, `logging` module (not `print`)
- **JSDoc comments** for all exported functions
- **Async/await** preferred over `.then()/.catch()`

## Quick Reference

```bash
# Essential Commands
python3 -m http.server 8000                    # Dev server
python scripts/pokeapi_fetch.py                # Regenerate data (~10 min)
python scripts/generate_type_effectiveness.py  # Sync type data to JS
npm run lint                                   # Lint JS files
npm run validate                               # Validate SEO files
pre-commit run --all-files                     # Run all pre-commit hooks

# Key Files
assets/js/constants.js                         # All IDs, events, configs
assets/js/pokedexApp.js                        # Main orchestrator
assets/js/components/pokemonDetailView.js      # Largest component (1200+ lines)
pokedex_data.json                              # Production data (2.9MB)
```

**Live Site:** [www.pokedex.tech](https://www.pokedex.tech)
**Repo:** github.com/kiefertaylorland/pokedex
