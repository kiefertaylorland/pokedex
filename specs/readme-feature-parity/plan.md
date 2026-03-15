# Plan: README Feature Parity

## Implementation Strategy (SDD)
Deliver in vertical slices, each ending with runnable behavior + acceptance checks before moving on.

## Phase 1: Low-Risk Runtime Wiring + Keyboard/Sort
- Add new sort options (height/weight asc/desc):
  - update `constants.js` sort options
  - update `index.html` select options
  - extend `utils/sorters.js`
  - route in `controllers/sortController.js`
- Render enhanced stat indicators in detail view:
  - integrate `EnhancedStatsDisplay` in `PokemonDetailView`
- Keyboard parity:
  - implement card grid Arrow/Home/End navigation in `PokemonCardRenderer`
  - fix `keyboardShortcutsModal` language shortcut to `ELEMENT_IDS.LANG_TOGGLE`
  - ensure shortcut help text matches actual behavior

## Phase 2: Feature Wiring (Comparison + Team Builder)
- Comparison:
  - instantiate `PokemonComparison` in `PokedexApp`
  - pass into `PokemonDetailView` options and expose actions
  - support selection flow for 3-way comparison
- Team Builder:
  - instantiate `TeamBuilder` in `PokedexApp`
  - pass to detail view actions (add/remove)
  - wire `showPokemonDetail` event dispatch listener to app detail display

## Phase 3: Data + Domain Enhancements
- Extend `scripts/pokeapi_fetch.py` to include:
  - move `damage_class`
  - evolution method metadata (condition, trigger, item/level, etc.)
- Regenerate `pokedex_data.json`.
- Update `PokemonDetailView` rendering:
  - damage class badge in move list
  - branching evolution methods display for each transition

## Phase 4: Documentation Parity Gate
- Update `README.md` features to exact shipped behavior.
- If any item remains intentionally out-of-scope, explicitly reduce claim language.
- Add changelog entry for parity effort.

## Design Decisions
- Preserve existing module boundaries:
  - sorting in controller + utility sorters
  - feature orchestration in `PokedexApp`
  - view rendering in components
- Prefer additive changes to avoid breaking current deep-link/detail behavior.
- Keep keyboard handling centralized where possible, but card movement logic stays with renderer to preserve DOM awareness.

## Risks and Mitigations
- Risk: 3-way comparison UX complexity.
  - Mitigation: define explicit state machine (`idle`, `selecting`, `comparing`).
- Risk: larger JSON payload from added move/evolution metadata.
  - Mitigation: include only required fields, avoid nested raw API blobs.
- Risk: accessibility regressions in new interactive controls.
  - Mitigation: run focused keyboard/screen-reader smoke checks per phase.
