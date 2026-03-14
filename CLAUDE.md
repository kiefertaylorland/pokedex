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

# Data management
python scripts/pokeapi_fetch.py              # Regenerate all Pokédex data from PokéAPI (~10 min)
python scripts/generate_type_effectiveness.py # Regenerate typeEffectiveness.js from Python source

# Validation
npm run validate          # Validate SEO files and structured data
```

## Architecture

### Module Dependency Hierarchy

```
pokedexApp.js (orchestrator)
├── PokemonDataManager      — data loading + IndexedDB caching
├── UIController            — theme, language, DOM state
├── PokemonCardRenderer     — main grid rendering
├── PokemonDetailView       — detail modal (1200+ lines, largest file)
├── SearchController        — search + filtering
├── SortController          — sorting by ID, name, height, weight, stats
├── URLRouter               — deep linking and page state
└── StructuredDataGenerator — SEO metadata
```

**Key architectural decisions:**
- No frontend frameworks — vanilla JS for zero dependencies
- No build step — native ES6 modules over HTTP/2 (cached by service worker)
- `constants.js` is the single source of truth for all event names, element IDs, and configs

### Critical Pattern: Event-Driven Communication

All inter-component communication uses custom events defined in `constants.js`:

```javascript
// Always dispatch through document
document.dispatchEvent(new CustomEvent(EVENTS.POKEMON_SELECTED, { detail: { pokemon } }));

// Always listen on document
document.addEventListener(EVENTS.POKEMON_SELECTED, (e) => { /* ... */ });
```

**Never add event types outside `constants.js`.**

### Environment Configuration

`assets/js/utils/config.js` detects environment (dev/prod/test) via hostname and controls debug logging, service worker behavior, and error reporting. Use `config.isDevelopment()` / `config.isProduction()` rather than hardcoding environment checks.

## Data Management

### Two Python Modules (Different Purposes)

**`scripts/pokeapi_fetch.py`** — Full API fetcher (372 lines), generates `pokedex_data.json`:
```bash
python scripts/pokeapi_fetch.py          # All 1025 Pokémon (~10 min)
python scripts/pokeapi_fetch.py -c 151   # Gen 1 only
```

### Type Effectiveness

Type data exists in `scripts/pokeapi_fetch.py` (Python dict `TYPE_EFFECTIVENESS`) as the **single source of truth**. `assets/js/utils/typeEffectiveness.js` is **auto-generated** — never edit it manually:

```bash
python scripts/generate_type_effectiveness.py  # Regenerates typeEffectiveness.js
```

## JavaScript Patterns

### Module Structure

```javascript
// Named exports only — no default exports
export class MyComponent {
    constructor() {
        this.elements = {};  // Cache DOM elements in constructor
    }
}

// Always import IDs, events, configs from constants
import { EVENTS, ELEMENT_IDS, CSS_CLASSES } from './constants.js';
```

### Bilingual Support

All text must support English/Japanese toggle:

```javascript
// Data always has both
{ name_en: "pikachu", name_ja: "ピカチュウ", name_ja_romaji: "pikachuu" }

// Select via UIController
const name = this.uiController.currentLanguage === 'en' ? pokemon.name_en : pokemon.name_ja;
```

### Accessibility (Non-Negotiable)

- **ARIA labels** on all interactive elements
- **Keyboard navigation**: Tab, Enter, Escape, Arrow keys
- **Screen reader support**: Use `sr-only` class for visually hidden labels
- **Theme support**: All styles work in both light and dark themes
- **Semantic HTML**: Proper heading hierarchy (h1 → h2 → h3)

```html
<label for="search-input" class="sr-only">Search Pokémon</label>
<input id="search-input" aria-describedby="search-help" />
```

## Feature Development Checklist

**Adding a new JS component:**
1. Create in `assets/js/components/`, export as named class
2. Initialize in `pokedexApp.js`
3. Add any new event types to `constants.js`
4. Add the new file to the service worker cache list in `service-worker.js`
5. Verify keyboard navigation and screen reader support

**Adding new data fields:**
1. Update `scripts/pokeapi_fetch.py`
2. Regenerate: `python scripts/pokeapi_fetch.py`
3. Update frontend to use new fields

**Deploying:**
- Increment `CACHE_NAME` in `service-worker.js` (e.g. `pokedex-v1.1.0` → `v1.2.0`)
- GitHub Actions validates SEO files + Python syntax, then auto-deploys to GitHub Pages on push to `main`

## Known Constraints

- **`pokemonDetailView.js`** is 1200+ lines — large but intentional; avoid growing it further
- **`pokedex_data.json`** (2.9MB) is committed to git — this is acceptable for this project size
- **Lint**: New/refactored files must pass `npm run lint`; legacy debt tracked in `LINTING.md`
- **Don't fix unrelated issues** — focus on the task at hand

## Style Guide

- **JavaScript**: camelCase functions/variables, kebab-case HTML IDs/classes, single quotes, semicolons
- **Python**: snake_case, PEP 8, type hints on public functions, `logging` module (not `print`)
- **JSDoc**: Required on all exported functions

## Documentation Files

All app docs live in `docs/`:

- `docs/DATA_SCHEMA.md` — Complete field-by-field schema for `pokedex_data.json`
- `docs/POKEAPI_MODULES.md` — `scripts/pokeapi_fetch.py` explained
- `docs/MODULE_DEPENDENCIES.md` — Full dependency graph and data flow diagrams
- `docs/API.md` — JS module API docs (generated from JSDoc comments)
- `docs/LINTING.md` — Linting strategy and legacy debt
- `docs/CHANGELOG.md` — Version history
- `docs/DATA_FILES.md` — Data file variants and usage
