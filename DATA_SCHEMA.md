# Pokemon Data Schema

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Data File:** `pokedex_data.json`

## Overview

This document describes the complete structure of the Pokemon data stored in `pokedex_data.json`. The file contains an array of Pokemon objects, each with comprehensive information fetched from the PokéAPI.

## File Structure

```json
[
  {
    // Pokemon object 1
  },
  {
    // Pokemon object 2
  }
  // ... (1025 total Pokemon objects)
]
```

## Pokemon Object Schema

Each Pokemon object in the array has the following structure:

### Root Level Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | integer | National Pokedex number | `25` |
| `name_en` | string | English name (capitalized) | `"Pikachu"` |
| `name_jp` | string | Japanese name (Katakana/Hiragana) | `"ピカチュウ"` |
| `sprite` | string | URL to default sprite image (jsDelivr CDN) | `"https://cdn.jsdelivr.net/gh/..."` |
| `sprites` | object | Collection of sprite URLs (see below) | `{...}` |
| `types_en` | array[string] | Pokemon types in English | `["Electric"]` |
| `types_jp` | array[string] | Pokemon types in Japanese | `["でんき"]` |
| `stats` | object | Base stat values (see below) | `{...}` |
| `bio_en` | string | Pokedex entry text in English | `"When several of these..."` |
| `bio_jp` | string | Pokedex entry text in Japanese | `"なんびきか..."` |
| `abilities` | array[object] | Pokemon abilities (see below) | `[{...}]` |
| `height` | float | Height in meters | `0.4` |
| `weight` | float | Weight in kilograms | `6.0` |
| `genus_en` | string | Pokemon category in English | `"Mouse Pokemon"` |
| `genus_jp` | string | Pokemon category in Japanese | `"ねずみポケモン"` |
| `moves` | array[object] | Move set (up to 4 moves, see below) | `[{...}]` |
| `evolution_chain` | array[object] | Evolution chain (see below) | `[{...}]` |
| `weaknesses` | object | Type weaknesses (multiplier ≥ 2.0) | `{"Ground": 2.0}` |
| `resistances` | object | Type resistances (0 < multiplier < 1.0) | `{"Electric": 0.5}` |
| `immunities` | object | Type immunities (multiplier = 0) | `{"Ghost": 0}` |

### Sprites Object

```json
{
  "front_default": "https://cdn.jsdelivr.net/gh/.../25.png",
  "front_shiny": "https://cdn.jsdelivr.net/gh/.../shiny/25.png",
  "back_default": "https://cdn.jsdelivr.net/gh/.../back/25.png",
  "back_shiny": "https://cdn.jsdelivr.net/gh/.../back/shiny/25.png",
  "official_artwork": "https://cdn.jsdelivr.net/gh/.../official-artwork/25.png"
}
```

**Note:** All sprite URLs are converted to use jsDelivr CDN for better reliability and caching.

### Stats Object

```json
{
  "hp": 35,
  "attack": 55,
  "defense": 40,
  "special-attack": 50,
  "special-defense": 50,
  "speed": 90
}
```

All stat values are integers representing base stats.

### Abilities Array

Each ability object contains:

```json
{
  "name_en": "Static",
  "name_jp": "せいでんき",
  "is_hidden": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name_en` | string | Ability name in English (title case) |
| `name_jp` | string | Ability name in Japanese |
| `is_hidden` | boolean | Whether this is a hidden ability |

### Moves Array

Up to 4 level-up moves, prioritizing recent game versions. Each move object:

```json
{
  "name_en": "Thunder Shock",
  "name_jp": "でんきショック",
  "type_en": "Electric",
  "type_jp": "でんき",
  "power": 40,
  "accuracy": 100,
  "pp": 30,
  "level": 1
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name_en` | string | Move name in English (title case) |
| `name_jp` | string | Move name in Japanese |
| `type_en` | string | Move type in English |
| `type_jp` | string | Move type in Japanese |
| `power` | integer or null | Base power of the move (null for status moves) |
| `accuracy` | integer or null | Accuracy percentage (null for moves that never miss) |
| `pp` | integer | Power Points (number of times move can be used) |
| `level` | integer | Level at which move is learned |

### Evolution Chain Array

Complete evolution chain for the Pokemon's family:

```json
[
  {
    "name": "Pichu",
    "id": 172
  },
  {
    "name": "Pikachu",
    "id": 25
  },
  {
    "name": "Raichu",
    "id": 26
  }
]
```

**Note:** All Pokemon in the same evolutionary family share the same evolution chain array.

### Type Effectiveness Objects

Type effectiveness is calculated based on the Pokemon's type(s) using competitive Pokemon type chart rules.

**Weaknesses** - Types that deal 2x or 4x damage:
```json
{
  "Ground": 2.0,
  "Rock": 2.0
}
```

**Resistances** - Types that deal 0.25x or 0.5x damage:
```json
{
  "Electric": 0.5,
  "Flying": 0.5,
  "Steel": 0.5
}
```

**Immunities** - Types that deal 0x damage:
```json
{
  "Ghost": 0
}
```

## Data Sources

All data is fetched from [PokéAPI v2](https://pokeapi.co/docs/v2):

- **Main Pokemon Data:** `/pokemon/{id}`
- **Species Data:** `/pokemon-species/{id}`
- **Type Data:** `/type/{type_name}`
- **Ability Data:** `/ability/{ability_name}`
- **Move Data:** `/move/{move_name}`
- **Evolution Chain:** `/evolution-chain/{id}`

## Generation Ranges

| Generation | Pokemon IDs | Count |
|------------|-------------|-------|
| Gen 1 | 1-151 | 151 |
| Gen 2 | 152-251 | 100 |
| Gen 3 | 252-386 | 135 |
| Gen 4 | 387-493 | 107 |
| Gen 5 | 494-649 | 156 |
| Gen 6 | 650-721 | 72 |
| Gen 7 | 722-809 | 88 |
| Gen 8 | 810-905 | 96 |
| Gen 9 | 906-1025 | 120 |

**Total:** 1025 Pokemon (as of November 2025)

## Usage Examples

### Loading the Data (Python)

```python
import json

with open('pokedex_data.json', 'r', encoding='utf-8') as f:
    pokemon_data = json.load(f)

# Access specific Pokemon
pikachu = pokemon_data[24]  # Index 24 = ID 25 (0-indexed)
print(pikachu['name_en'])  # "Pikachu"
print(pikachu['stats']['speed'])  # 90
```

### Loading the Data (JavaScript)

```javascript
// Using fetch
fetch('pokedex_data.json')
  .then(response => response.json())
  .then(data => {
    const pikachu = data.find(p => p.id === 25);
    console.log(pikachu.name_en);  // "Pikachu"
  });

// Using ES6 modules (already loaded in app)
import pokemonData from './pokedex_data.json' assert { type: 'json' };
const pikachu = pokemonData.find(p => p.id === 25);
```

### Filtering Examples

```javascript
// Find all Electric-type Pokemon
const electricTypes = pokemonData.filter(p => 
  p.types_en.includes('Electric')
);

// Find Pokemon with high speed (>= 100)
const fastPokemon = pokemonData.filter(p => 
  p.stats.speed >= 100
);

// Find Pokemon weak to Ground-type attacks
const groundWeak = pokemonData.filter(p => 
  p.weaknesses.Ground
);
```

## Validation

The data generation script (`pokeapi_fetch.py`) includes validation to ensure all required fields are present. Missing fields will trigger warnings during generation.

### Required Fields Validation

The validation function checks for:

1. **Root fields:** All fields listed in the Root Level Fields table
2. **Nested stats:** All six stat types (hp, attack, defense, special-attack, special-defense, speed)
3. **Nested sprites:** All five sprite types (front_default, front_shiny, back_default, back_shiny, official_artwork)

## File Size and Performance

- **Full Dataset:** ~2.9 MB (1025 Pokemon)
- **Test Dataset:** ~146 KB (50 Pokemon in `pokedex_data_test.json`)
- **Compression:** Consider gzip compression for production (reduces to ~500 KB)
- **Loading Time:** Typically < 1 second on modern browsers

## Version History

- **v1.0** (Nov 2, 2025) - Initial schema documentation

## Related Documentation

- [DATA_FILES.md](./DATA_FILES.md) - Explains different data file variants
- [POKEAPI_MODULES.md](./POKEAPI_MODULES.md) - Explains data fetching modules
- [README.md](./README.md) - Project overview and setup

## Notes

- All sprite URLs use jsDelivr CDN for reliability
- Japanese names use the "ja-Hrkt" locale (Katakana/Hiragana mix)
- Flavor text is taken from Red/Blue/Yellow games when available
- Move selection prioritizes recent game versions (Scarlet/Violet first)
- Evolution chains are cached to avoid duplicate API calls
- Type effectiveness calculations follow standard competitive Pokemon rules
