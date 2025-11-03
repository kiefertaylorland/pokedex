import json
import os
from typing import Dict, List, Any, Optional, Union

DATA_FILE: str = os.path.join(os.path.dirname(__file__), "pokedex_data.json")

with open(DATA_FILE, "r", encoding="utf-8") as f:
    POKEDEX: List[Dict[str, Any]] = json.load(f)

# Build lookup dictionaries for fast access by id and name
POKEDEX_BY_ID: Dict[int, Dict[str, Any]] = {p["id"]: p for p in POKEDEX}
POKEDEX_BY_NAME: Dict[str, Dict[str, Any]] = {p["name_en"].lower(): p for p in POKEDEX}

def fetch_pokemon(query: Union[int, str]) -> Optional[Dict[str, Any]]:
    """
    Fetch a Pokemon by its English name (case-insensitive) or id.
    
    Args:
        query: Pokemon name (str) or ID (int)
        
    Returns:
        Pokemon data dictionary if found; otherwise None.
    """
    # Try id first
    try:
        pokemon_id = int(query)
        return POKEDEX_BY_ID.get(pokemon_id)
    except ValueError:
        # Not an integer, so treat as a name
        query_lower = query.lower()
        return POKEDEX_BY_NAME.get(query_lower)
    return None
