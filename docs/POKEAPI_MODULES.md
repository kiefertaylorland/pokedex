# PokéAPI Modules Documentation

This document explains the purpose and usage of the two PokéAPI-related Python modules.

## Module Overview

### `pokeapi.py` - Data Loader (Simple)
**Purpose:** Provides fast, read-only access to pre-generated Pokémon data  
**Size:** ~30 lines  
**Use case:** Quick queries, testing, local data access

**Key Features:**
- Loads data from `pokedex_data.json` into memory
- Provides lookup by ID or name
- No network calls - instant access
- Minimal dependencies (just `json`)

**API:**
```python
from pokeapi import fetch_pokemon

# Fetch by ID
pokemon = fetch_pokemon(25)  # Returns Pikachu

# Fetch by name (case-insensitive)
pokemon = fetch_pokemon("charizard")  # Returns Charizard
```

**Used by:**
- `tests/test_pokeapi.py` - Unit tests for data access

---

### `pokeapi_fetch.py` - API Fetcher (Full-Featured)
**Purpose:** Fetches fresh data from PokéAPI and generates `pokedex_data.json`  
**Size:** ~372 lines  
**Use case:** Data regeneration, updates, initial setup

**Key Features:**
- Fetches all 1025 Pokémon from PokéAPI
- Retrieves comprehensive data:
  - Basic info (name, types, stats)
  - Moves (with filtering and deduplication)
  - Evolution chains
  - Type effectiveness calculations
  - Localized names (English/Japanese)
  - Pokémon cries
- Handles rate limiting and errors
- Saves formatted JSON output

**API:**
```python
from pokeapi_fetch import fetch_and_build_pokedex

# Fetch all Pokémon data from API
pokedex_data = fetch_and_build_pokedex()
```

**Used by:**
- Command-line execution: `python pokeapi_fetch.py`
- `tests/test_pokeapi_fetch.py` - Unit tests for fetching logic
- `tests/test_pokeapi_integration.py` - Integration tests

---

## When to Use Each Module

### Use `pokeapi.py` when:
- ✅ You need quick access to existing data
- ✅ You're writing tests that need Pokémon data
- ✅ You want zero network dependencies
- ✅ You need fast lookups by name or ID

### Use `pokeapi_fetch.py` when:
- ✅ Setting up the project for the first time
- ✅ Updating data after new Pokémon releases
- ✅ Regenerating data after schema changes
- ✅ You need fresh data from PokéAPI

---

## Module Relationship

```
┌─────────────────────┐
│   pokeapi_fetch.py  │  Fetches from API
│   (Data Generator)  │  ─────────────────┐
└─────────────────────┘                   │
                                          ▼
                                ┌──────────────────────┐
                                │ pokedex_data.json    │
                                │ (Generated Data)     │
                                └──────────────────────┘
                                          │
                                          │ Loads
                                          ▼
┌─────────────────────┐        ┌──────────────────────┐
│   Your Application  │◄───────│    pokeapi.py        │
│   (Frontend)        │        │    (Data Loader)     │
└─────────────────────┘        └──────────────────────┘
```

---

## Typical Workflow

### Initial Setup
```bash
# 1. Fetch data from PokéAPI (one-time setup)
python pokeapi_fetch.py

# 2. Data is now available for the application
# 3. pokeapi.py can be used for quick data access
```

### Testing
```python
# Use pokeapi.py for fast, offline tests
from pokeapi import fetch_pokemon

def test_pokemon_data():
    pikachu = fetch_pokemon(25)
    assert pikachu["name_en"] == "pikachu"
```

### Data Updates
```bash
# When new Pokémon are released or data needs updating:
python pokeapi_fetch.py

# This regenerates pokedex_data.json with fresh data
```

---

## Why Two Modules?

1. **Separation of Concerns**
   - `pokeapi_fetch.py`: Complex data fetching and transformation
   - `pokeapi.py`: Simple data access interface

2. **Performance**
   - Fetching 1025 Pokémon from API takes several minutes
   - Loading from JSON takes milliseconds

3. **Offline Development**
   - Once data is fetched, no internet needed
   - Tests run faster without API calls

4. **Flexibility**
   - Can regenerate data without changing application code
   - Can use different data sources (test data, backups)

---

## Future Improvements

To reduce confusion, consider:

1. **Rename modules for clarity:**
   - `pokeapi.py` → `pokedex_loader.py`
   - `pokeapi_fetch.py` → `pokedex_generator.py`

2. **Move to package structure:**
   ```
   pokeapi/
     __init__.py
     loader.py      # Simple data access
     generator.py   # API fetching
     types.py       # Type effectiveness
     evolution.py   # Evolution chains
   ```

3. **Add CLI interface:**
   ```bash
   python -m pokeapi generate  # Fetch from API
   python -m pokeapi get 25    # Get Pikachu
   ```

---

## Summary

- **`pokeapi.py`** = Simple data loader for quick access (30 lines)
- **`pokeapi_fetch.py`** = Full API fetcher for data generation (372 lines)
- Both are needed and serve different purposes
- No duplication - complementary functionality
