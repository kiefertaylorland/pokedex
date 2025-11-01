#!/usr/bin/env python3
"""
Generate extended Pokedex data for Pokemon 152-1025 with minimal placeholders.
This script creates basic data entries that maintain the required structure
but use placeholder values that should be replaced with real PokeAPI data later.
"""

import json
import sys

def load_existing_data(filename="pokedex_data.json"):
    """Load existing Pokemon data"""
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_pokemon_name(pokemon_id):
    """Get basic Pokemon name based on ID - using common knowledge"""
    # This is a minimal implementation - real names should come from PokeAPI
    return f"Pokemon{pokemon_id:04d}"

def get_basic_types():
    """Return placeholder types"""
    return ["Normal"]

def create_minimal_pokemon_entry(pokemon_id):
    """Create a minimal Pokemon entry with the required structure"""
    return {
        "id": pokemon_id,
        "name_en": get_pokemon_name(pokemon_id),
        "name_jp": f"ポケモン{pokemon_id}",  # Placeholder Japanese name
        "sprite": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png",
        "types_en": get_basic_types(),
        "types_jp": ["ノーマル"],  # Normal type in Japanese
        "stats": {
            "hp": 50,
            "attack": 50,
            "defense": 50,
            "special-attack": 50,
            "special-defense": 50,
            "speed": 50
        },
        "bio_en": f"Pokemon #{pokemon_id}. Data to be fetched from PokeAPI.",
        "bio_jp": f"ポケモン #{pokemon_id}。PokeAPIからデータを取得予定。",
        "moves": [],
        "evolution_chain": [{"name": get_pokemon_name(pokemon_id), "id": pokemon_id}],
        "weaknesses": {}
    }

def generate_extended_data(start_id=152, end_id=1025):
    """Generate minimal data for Pokemon from start_id to end_id"""
    existing_data = load_existing_data()
    print(f"Loaded {len(existing_data)} existing Pokemon")
    
    # Get the maximum ID in existing data
    max_existing_id = max(p['id'] for p in existing_data)
    print(f"Maximum existing Pokemon ID: {max_existing_id}")
    
    # Generate new entries
    new_entries = []
    for pokemon_id in range(max_existing_id + 1, end_id + 1):
        entry = create_minimal_pokemon_entry(pokemon_id)
        new_entries.append(entry)
        if pokemon_id % 100 == 0:
            print(f"Generated entry for Pokemon #{pokemon_id}")
    
    # Combine existing and new data
    all_data = existing_data + new_entries
    
    return all_data

def save_pokedex_data(data, filename="pokedex_data.json"):
    """Save the extended Pokedex data"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(data)} Pokemon to {filename}")

def main():
    print("Generating extended Pokedex data...")
    print("Note: This creates placeholder entries for Pokemon 152-1025.")
    print("Run pokeapi_fetch.py to replace with actual PokeAPI data.\n")
    
    extended_data = generate_extended_data(start_id=152, end_id=1025)
    save_pokedex_data(extended_data)
    
    print(f"\nTotal Pokemon in database: {len(extended_data)}")
    print("Each Pokemon has a cry file available in assets/pokemon/cries/latest/")

if __name__ == "__main__":
    main()
