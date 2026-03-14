# Data Pipeline: scripts/pokeapi_fetch.py

This document explains the data generation script that powers the Pokédex.

## Overview

**`scripts/pokeapi_fetch.py`** fetches data from [PokéAPI](https://pokeapi.co/) and generates `pokedex_data.json`, the static data file loaded by the frontend.

## Usage

```bash
# Fetch all 1025 Pokémon (~10 minutes)
python scripts/pokeapi_fetch.py

# Fetch only Gen 1 (faster, for development)
python scripts/pokeapi_fetch.py --count 151

# Save to a custom filename
python scripts/pokeapi_fetch.py --output my_data.json

# Adjust API request delay (default 0.1s)
python scripts/pokeapi_fetch.py --sleep 0.5
```

## What It Fetches

For each Pokémon, the script retrieves:

- Basic info (name, ID, types, height, weight)
- Stats (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
- Abilities (with hidden ability flag)
- Moves (filtered and deduplicated)
- Evolution chains
- Type effectiveness calculations
- Localized names (English and Japanese with romaji)
- Sprites (default, shiny, official artwork)
- Pokémon cries

## Data Validation

The script validates all required fields after fetching. Missing fields trigger
warnings but do not abort the run, allowing partial data recovery.

## Rate Limiting

A built-in `RateLimiter` class caps requests at 100/minute by default to
respect PokéAPI's fair-use policy.

## Output

Generates `pokedex_data.json` (2.9MB) at the project root. This file is
committed to the repository and served directly to the frontend.

See `docs/DATA_SCHEMA.md` for the complete field-by-field schema.

## Related Scripts

- `scripts/generate_type_effectiveness.py` — syncs type data from this script to `assets/js/utils/typeEffectiveness.js`
- `scripts/generate_sitemap.py` — generates `sitemap.xml` from the output of this script
