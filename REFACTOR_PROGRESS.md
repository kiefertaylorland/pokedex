# Pokedex Refactor Progress

## Completed

- Centralized app state (`AppState`) and state subscription API
- Unified render pipeline in app controller
- Centralized detail open + SEO/route update flow
- Extracted fuzzy matching utility (`fuzzySearch`)
- Added data indexes for faster lookup/search (`pokemonById`, `searchCorpus`)
- Added safe storage wrapper and migrated UI/sort persistence
- Added lifecycle cleanup (`destroy`) for detail/search/sort/ui components
- Extracted pure presentation helpers (`pokemonPresentation`)
- Extracted pure sorting helpers (`sorters`)
- Extracted search announcement builder (`searchAnnouncements`)
- Separated bootstrap entrypoint (`assets/js/bootstrap.js`)
- Removed dead legacy detail section builders

## Remaining High-Value Refactors

1. Split `pokemonDetailView` into smaller feature modules:
   - media/sprites
   - moves rendering
   - evolution rendering
   - type-effectiveness rendering
2. Add focused unit tests for pure utilities:
   - `fuzzySearch`
   - `sorters`
   - `searchAnnouncements`
3. Add smoke test for app bootstrap + controller wiring
4. Introduce lint-baseline strategy (pre-existing repo debt)
5. Normalize constants/text ownership to reduce cross-module coupling


## Finalized in this pass

- Added JS unit tests for core pure modules and bootstrap smoke checks
- Added incremental lint workflow (`lint:changed`) and linting policy docs
- Simplified sort controller with pure sort strategy utilities
- Extracted search announcement text helper
- Restored and deduplicated type effectiveness section builders in detail view

## Current status

Refactor objectives completed for architecture, lifecycle cleanup, and testable utility boundaries.
Remaining work is optional polish (legacy lint debt reduction and UI micro-optimizations).
