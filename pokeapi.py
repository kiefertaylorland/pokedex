import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), "pokedex_data.json")

with open(DATA_FILE, "r", encoding="utf-8") as f:
    POKEDEX = json.load(f)

def fetch_pokemon(query):
    """
    Fetch a Pokemon by its English name (case-insensitive) or id.
    Returns the Pokemon data dictionary if found; otherwise returns None.
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