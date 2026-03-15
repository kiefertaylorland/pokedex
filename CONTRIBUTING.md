# Contributing to Pokédex

Thanks for contributing. Keep changes small, testable, and accessible.

## Setup

```bash
git clone https://github.com/kiefertaylorland/pokedex.git
cd pokedex
pip install -r requirements.txt
npm install
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Development Standards

- JavaScript: ES modules, named exports, `camelCase` vars/functions, `PascalCase` classes
- Python scripts: `snake_case`, PEP 8 style
- Keep user-facing text localized via `assets/js/constants.js` (EN + JP)
- Preserve keyboard and screen reader behavior for UI changes
- Prefer reusable utilities over duplicated logic

## Validate Before PR

```bash
npm run lint
npm run test:e2e
```

Also verify manually:
- Light and dark themes
- English and Japanese text paths
- Keyboard flows (`/`, `Esc`, arrows, `Home`, `End`)

## Commits and PRs

- Use conventional commit prefixes (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`)
- Keep commit messages explicit about behavior change
- PR description should include:
  - What changed
  - Why it changed
  - How it was tested
  - Screenshots/GIFs for UI updates

## Issues

When reporting bugs, include reproduction steps, expected vs actual behavior, and browser/device details.
