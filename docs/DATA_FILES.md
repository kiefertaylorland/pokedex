# Data Files Documentation

This document explains the purpose of each data file in the project.

## Active Data File

### `pokedex_data.json`
**Purpose:** The authoritative, production data file used by the application.  
**Size:** ~2.9MB  
**Content:** Complete data for all 1025 Pokémon including:
- Basic info (name, ID, types)
- Stats (HP, Attack, Defense, etc.)
- Moves
- Evolution chains
- Type effectiveness
- Cries URLs

**When to update:** Run `python pokeapi_fetch.py` to regenerate from PokéAPI when:
- New Pokémon generations are released
- Data needs to be refreshed from the API
- Structural changes to data format are needed

## Backup and Test Files

### `pokedex_data.json.backup`
**Purpose:** Automatic backup created before regenerating data  
**Status:** Should be in `.gitignore` (see note below)  
**Usage:** Safety net in case data regeneration fails

### `pokedex_data_original_backup.json`
**Purpose:** Historical backup of original data structure  
**Size:** ~954KB (smaller than current data)  
**Usage:** Reference for data migration or rollback if needed  
**Note:** May be safe to delete if no longer needed

### `pokedex_data_test.json`
**Purpose:** Test data file for development and testing  
**Size:** ~146KB (subset of full data)  
**Usage:** Used by test suite to avoid loading full dataset  
**Note:** Should be maintained when data structure changes

## Best Practices

1. **Before regenerating data:**
   ```bash
   cp pokedex_data.json pokedex_data.json.backup
   python pokeapi_fetch.py
   ```

2. **To test data changes:**
   - Use `pokedex_data_test.json` in test environment
   - Update test data when structure changes

3. **Cleaning up backups:**
   - `.backup` files should be automatically ignored by git
   - Old backups can be safely deleted after verifying new data works

## File Management

### Files that should be in git:
- ✅ `pokedex_data.json` (production data)
- ✅ `pokedex_data_test.json` (test data)
- ⚠️ `pokedex_data_original_backup.json` (historical reference - consider removing)

### Files that should NOT be in git:
- ❌ `pokedex_data.json.backup` (temporary backup - already in `.gitignore`)

## Cleanup Recommendations

The following files can potentially be removed:
1. `pokedex_data_original_backup.json` - if no longer needed as historical reference
2. `pokedex_data.json.backup` - temporary file that should be regenerated as needed

To remove backup files:
```bash
# Remove if no longer needed
git rm pokedex_data_original_backup.json
rm pokedex_data.json.backup

# Commit the cleanup
git commit -m "Clean up obsolete backup data files"
```
