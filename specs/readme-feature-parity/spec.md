# Spec: README Feature Parity

## Context
`README.md` currently claims features that are partially implemented or not user-visible in runtime. `TODO.md` defines 8 gaps that must be resolved or downgraded in docs.

## Problem Statement
Feature claims and runtime behavior are out of sync, creating contributor confusion and misleading project scope.

## Goals
1. Make all claimed Core/Advanced features either fully user-visible or explicitly corrected in docs.
2. Keep architecture consistent with existing vanilla JS modular design.
3. Ship each gap with deterministic acceptance criteria.

## Non-Goals
- Redesigning UI visual style.
- Migrating to a framework.
- Rewriting the data model beyond fields required by the listed gaps.

## Scope (from TODO.md)
1. Add sort by height and weight.
2. Render stats comparison indicators in detail modal.
3. Implement true keyboard card navigation (Arrow/Home/End) and fix broken language shortcut constant.
4. Wire Pokemon comparison into runtime and support up to 3 (or update README if intentionally limited to 2).
5. Wire Team Builder into runtime.
6. Add team type coverage analysis view.
7. Add evolution method metadata + branching method display.
8. Add move damage class in data pipeline and detail view.

## Functional Requirements
- `FR-1` Sorting UI includes Height (asc/desc) and Weight (asc/desc) with working behavior.
- `FR-2` Detail modal shows stat comparison indicators for all base stats.
- `FR-3` Keyboard shortcuts modal reflects actual behavior only.
- `FR-4` `?`, `/`, `T`, `L`, `S`, Arrow/Home/End work as documented.
- `FR-5` Comparison flow is reachable from card/detail interactions and supports 3-way comparison.
- `FR-6` Team Builder is reachable, persistent, and supports add/remove/clear with max 6.
- `FR-7` Team Builder shows computed type coverage analysis.
- `FR-8` Evolution UI displays branching paths and evolution methods when available.
- `FR-9` Move list displays damage class (Physical/Special/Status, localized if available).

## Acceptance Criteria
- Every TODO item is either implemented or accompanied by a README claim change in same PR.
- Manual QA passes for:
  - search/sort/theme/language/detail modal
  - comparison/team flows
  - keyboard shortcuts and focus behavior
  - deep links and service worker unaffected
- `README.md` feature list matches runtime behavior exactly.

## Quality Constraints
- No regressions to accessibility labels and focus management.
- No circular imports introduced.
- Data regeneration scripts remain idempotent and deterministic.
