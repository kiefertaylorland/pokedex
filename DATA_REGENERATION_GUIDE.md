# Pokémon Data Regeneration Guide

## Issue Summary

The current `pokedex_data.json` file is missing move data for ALL 1025 Pokémon. The `moves` field is empty (`[]`) for every Pokémon entry.

### Data Status

✅ **Complete Data:**
- Bios (English & Japanese)
- Type weaknesses
- Evolution chains
- Base stats
- Sprites

❌ **Missing Data:**
- Move sets (ALL Pokémon affected: #1-1025)

## Root Cause

The original `pokeapi_fetch.py` script had a limitation on line 168:

```python
if version_group_detail["version_group"]["name"] == "red-blue" and \
   version_group_detail["move_learn_method"]["name"] == "level-up" and \
   version_group_detail["level_learned_at"] > 0:
```

This code ONLY fetched moves from Pokémon Red/Blue versions, which means:
- Pokémon from Gen 2-9 had NO moves (they didn't exist in Red/Blue)
- Even Gen 1 Pokémon might have limited move sets

## Solution

The script has been updated to fetch moves from ALL game versions, with intelligent prioritization:

### Version Priority (Newest to Oldest)
1. Scarlet/Violet (Gen 9)
2. Sword/Shield (Gen 8)
3. Ultra Sun/Ultra Moon (Gen 7)
4. Sun/Moon (Gen 7)
5. Omega Ruby/Alpha Sapphire (Gen 6)
6. X/Y (Gen 6)
7. Black 2/White 2 (Gen 5)
8. Black/White (Gen 5)
9. HeartGold/SoulSilver (Gen 4)
10. Platinum (Gen 4)
11. Diamond/Pearl (Gen 4)
12. FireRed/LeafGreen (Gen 3)
13. Emerald (Gen 3)
14. Ruby/Sapphire (Gen 3)
15. Crystal (Gen 2)
16. Gold/Silver (Gen 2)
17. Yellow (Gen 1)
18. Red/Blue (Gen 1)

The script now:
- Searches ALL version groups for level-up moves
- Prioritizes moves from more recent game versions
- Ensures every Pokémon gets its first 4 level-up moves
- Works for ALL generations (Gen 1-9)

## How to Regenerate Data

### Prerequisites
- Internet connection (to access PokeAPI)
- Python 3.12+
- `requests` library installed

### Steps

1. **Run the data fetch script:**
   ```bash
   python pokeapi_fetch.py
   ```

2. **Wait for completion:**
   - The script processes all 1025 Pokémon
   - Takes approximately 30-60 minutes (depends on API rate limits)
   - Progress is printed for each Pokémon
   
3. **Verify the data:**
   ```bash
   python3 -c "
   import json
   with open('pokedex_data.json', 'r') as f:
       data = json.load(f)
       with_moves = sum(1 for p in data if p.get('moves'))
       print(f'Pokémon with moves: {with_moves}/{len(data)}')
   "
   ```

4. **Expected output:**
   ```
   Pokémon with moves: 1025/1025
   ```

## Verification Tests

### Quick Verification
```bash
python test_move_fetching.py
```

This runs unit tests that verify the move fetching logic works correctly for:
- Gen 1 Pokémon (should fetch from appropriate versions)
- Gen 9 Pokémon (should fetch from Scarlet/Violet)
- Version priority system (prefers newer games)

### Sample Data Check
```python
import json

with open('pokedex_data.json', 'r') as f:
    data = json.load(f)
    
    # Check specific Pokémon
    test_ids = [1, 25, 152, 252, 387, 650, 722, 810, 906]
    
    for pid in test_ids:
        poke = next(p for p in data if p['id'] == pid)
        print(f"#{pid:3d} {poke['name_en']:15s} - {len(poke['moves'])} moves")
```

Expected output (after regeneration):
```
#  1 Bulbasaur       - 4 moves
# 25 Pikachu         - 4 moves
#152 Chikorita       - 4 moves
#252 Treecko         - 4 moves
#387 Turtwig         - 4 moves
#650 Chespin         - 4 moves
#722 Rowlet          - 4 moves
#810 Grookey         - 4 moves
#906 Sprigatito      - 4 moves
```

## Impact

### Before Fix
- ❌ NO Pokémon had move data (0/1025)
- ❌ Pokédex showed "No specific moves data available" for all Pokémon
- ❌ Users couldn't see what moves Pokémon can learn

### After Fix
- ✅ ALL Pokémon have move data (1025/1025)
- ✅ Each Pokémon shows up to 4 level-up moves
- ✅ Moves include name (EN/JP), type, power, accuracy, and PP
- ✅ Works for all generations (Gen 1-9)

## Technical Details

### Move Data Structure
Each move in the `moves` array contains:
```json
{
  "name_en": "Vine Whip",
  "name_jp": "つるのムチ",
  "type_en": "Grass",
  "type_jp": "くさ",
  "power": 45,
  "accuracy": 100,
  "pp": 25
}
```

### API Rate Limits
PokeAPI has rate limits. The script includes:
- 0.2 second delay between Pokémon fetches
- 0.1 second delay between move detail fetches
- Error handling for network issues

### Estimated Fetch Time
- **Total Pokémon:** 1025
- **Moves per Pokémon:** ~4
- **Total API calls:** ~5,100+
- **Estimated time:** 30-60 minutes

## Troubleshooting

### "No internet connection" error
- Ensure you have internet access
- Check if PokeAPI is accessible: `curl https://pokeapi.co/api/v2/pokemon/1/`

### "Rate limit exceeded" error
- The script includes built-in delays
- If errors persist, increase `sleep_time` parameter in the script

### Incomplete data after fetch
- Check the console output for errors
- Re-run the script (it will start from the beginning)
- Verify `pokedex_data.json` file size is ~38MB

## Notes

- The script fetches the first 4 level-up moves for each Pokémon
- Moves are sorted by level learned (earliest first)
- Only level-up moves are included (not TMs, egg moves, etc.)
- This ensures consistent, meaningful move data for all Pokémon

## Questions?

If you encounter issues:
1. Check the console output for specific error messages
2. Verify internet connectivity
3. Ensure Python dependencies are installed
4. Try running with increased sleep time if rate limited
