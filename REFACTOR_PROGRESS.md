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
