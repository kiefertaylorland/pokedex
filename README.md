# Pokédex

Interactive Pokédex for all 1025 Pokémon (Gen I-IX), with bilingual UI (EN/JP), accessibility-first interactions, and no build step.

Live: [www.pokedex.tech](https://www.pokedex.tech)

## What It Includes

- Complete Pokédex data with stats, abilities, moves, evolution chain, and type matchups
- Pokémon detail modal with enhanced stat bars and sprite gallery
- Quick navigation rails:
  - A-Z for name sorts
  - Generation jump for number sorts
  - Range buckets for height, weight, and stat-total sorts
- Team Builder (up to 6 Pokémon) with type coverage analysis
- 2-3 Pokémon comparison modal with stat winners and type matchup chips
- Light/dark theme and English/Japanese toggle with persisted preferences
- Keyboard support (`/`, `?`, `T`, `L`, `S`, arrows, `Home`, `End`, `Esc`)
- PWA support via service worker

## Quick Start

```bash
git clone https://github.com/kiefertaylorland/pokedex.git
cd pokedex
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Development Commands

```bash
# JS lint
npm run lint

# E2E tests
npm run test:e2e

# Fetch/regenerate Pokédex data
python scripts/pokeapi_fetch.py
```

## Project Layout

```text
assets/js/components/   UI components (cards, detail modal, team, comparison, quick jump)
assets/js/controllers/  Search/sort controllers
assets/js/managers/     Data/UI managers
assets/js/utils/        Shared utilities
assets/style.css        Global styles
tests/e2e/              Playwright smoke tests
scripts/                Data pipeline and tooling scripts
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, coding standards, and PR expectations.

## License

This project is currently unlicensed (personal/open reference use).
