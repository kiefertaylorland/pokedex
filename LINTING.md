# Linting Strategy

This repo has significant historical lint debt. During refactor, use a staged approach:

## Commands

- Full lint (legacy + new):
  - `npm run lint`
- Lint only files changed in branch:
  - `npm run lint:changed`
  - Optional custom base: `npm run lint:changed -- origin/main`

## Policy

1. New/refactored files must pass lint.
2. Legacy lint debt is tracked and reduced incrementally.
3. Prefer small lint-only cleanup commits near the area you're touching.
