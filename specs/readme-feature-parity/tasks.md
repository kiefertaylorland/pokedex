# Tasks: README Feature Parity

## Traceability
- T1: TODO Core sorting gap
- T2: TODO Core stats indicators gap
- T3: TODO Core accessibility/keyboard gap
- T4: TODO Advanced comparison wiring + count gap
- T5: TODO Advanced team builder wiring gap
- T6: TODO Advanced type coverage analysis gap
- T7: TODO Advanced evolution methods gap
- T8: TODO Advanced move damage class gap

## Milestone 1: Keyboard + Sorting + Stats
- [x] T1.1 Add height/weight sort constants and labels.
- [x] T1.2 Add height/weight options to sort dropdown.
- [x] T1.3 Implement sorter utility functions and controller mapping.
- [x] T1.4 Verify sorting in both languages.
- [x] T2.1 Integrate `EnhancedStatsDisplay` in detail modal render path.
- [x] T2.2 Ensure stat labels and values are localized correctly.
- [x] T3.1 Implement Arrow/Home/End card focus navigation.
- [x] T3.2 Fix language toggle shortcut constant (`LANG_TOGGLE`).
- [x] T3.3 Align shortcuts modal content with implemented keys.

## Milestone 2: Runtime Wiring for Advanced Features
- [x] T4.1 Instantiate and store `PokemonComparison` in app orchestration.
- [x] T4.2 Add entry actions from detail/card UI to launch comparison.
- [x] T4.3 Extend comparison state for 3-Pokemon mode.
- [x] T4.4 Add compare modal accessibility and keyboard-close checks.
- [x] T5.1 Instantiate `TeamBuilder` in app startup.
- [x] T5.2 Wire add/remove team actions in detail/card interactions.
- [x] T5.3 Handle `showPokemonDetail` event from team slots.
- [x] T5.4 Validate localStorage persistence across reload.
- [x] T6.1 Define team coverage algorithm from member types.
- [x] T6.2 Add coverage analysis section to team panel.
- [x] T6.3 Validate coverage updates on add/remove/clear.

## Milestone 3: Data Pipeline + Detail UI Enhancements
- [x] T8.1 Add `damage_class` extraction to `pokeapi_fetch.py`.
- [x] T7.1 Add evolution method extraction to `pokeapi_fetch.py`.
- [x] T7.2 Regenerate `pokedex_data.json` and verify schema compatibility.
- [x] T8.2 Render move damage class in detail move items.
- [x] T7.3 Render evolution transition methods with branching paths.

## Milestone 4: Parity Validation + Docs
- [x] T9.1 Run lint/validation commands (`npm run lint`, `npm run validate`).
- [x] T9.2 Manual QA checklist:
  - search, language, theme
  - keyboard shortcuts and focus
  - comparison/team flows
  - detail view moves/evolution sections
- [x] T9.3 Update `README.md` feature bullets to exact behavior.
- [x] T9.4 Close matching entries in `TODO.md`.

## Definition of Done
- All TODO feature gaps are closed by implementation or explicit README claim reductions.
- No broken shortcuts, dead UI controls, or unreachable feature modules remain.
- README feature sections are accurate for current runtime behavior.
