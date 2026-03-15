# Repository Guidelines

## Project Structure & Module Organization
This repository is a static Pokedex app with no frontend build step. `index.html`, `service-worker.js`, `manifest.json`, and `pokedex_data.json` are served directly from the repo root. Frontend code lives in `assets/js`: `components/` for UI, `controllers/` for user input, `managers/` for shared services, and `utils/` for helpers. Styles and screenshots live in `assets/style.css` and `assets/screenshots/`. Python data and maintenance scripts are in `scripts/`, and longer-form reference docs are in `docs/`.

## Build, Test, and Development Commands
Use `python3 -m http.server 8000` or `npm run serve` to run locally at `http://localhost:8000`. Run `npm run lint` for the full JavaScript lint pass and `npm run lint:changed` before a PR to check only files changed from `origin/main`. Run `npm run validate` to verify SEO files. Python helpers are used directly, for example `python scripts/pokeapi_fetch.py` to regenerate `pokedex_data.json` and `python scripts/generate_type_effectiveness.py` to rebuild the generated type chart module.

## Coding Style & Naming Conventions
JavaScript uses ES modules with named exports only. Follow the existing ESLint rules: 4-space indentation, single quotes, semicolons, no trailing spaces, and avoid `console.log` in production code. Use `camelCase` for variables/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants, and `kebab-case` for HTML IDs/classes. Python should follow PEP 8, `snake_case`, and keep public functions typed where practical.

## Testing Guidelines
There is no maintained `tests/` suite at the moment. Quality gates are linting, `python scripts/validate_seo_files.py`, Python syntax checks, and manual browser QA. For UI changes, verify search, detail view, keyboard navigation, English/Japanese toggle, and both light/dark themes. If you touch generated assets, regenerate them instead of editing by hand.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `chore:`, `docs:`, `fix:`, `feat:`, and `test:`. Keep commit subjects short and imperative, for example `fix: guard missing cry audio`. PRs should explain the user-visible change, list any regenerated files, link related issues, and include screenshots for UI updates.

## Repository-Specific Notes
Do not hand-edit `pokedex_data.json` or `assets/js/utils/typeEffectiveness.js`; regenerate them from `scripts/`. If you change cached assets, bump the cache version in `service-worker.js` before release.
