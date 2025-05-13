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
        for pokemon in POKEDEX:
            if pokemon["id"] == pokemon_id:
                return pokemon
    except ValueError:
        # Not an integer, so treat as a name
        query_lower = query.lower()
        for pokemon in POKEDEX:
            if pokemon["name_en"].lower() == query_lower:
                return pokemon
    return None