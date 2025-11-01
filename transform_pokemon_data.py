#!/usr/bin/env python3
"""
Transform Pokemon data from external source to our pokedex_data.json format.
This script converts Pokemon data from Purukitto/pokemon-data.json format
to the format used by this Pokédex application.
"""

import json
import sys
import os

def transform_pokemon(raw_pokemon):
    """Transform a Pokemon entry from external format to our format"""
    pokemon_id = raw_pokemon['id']
    
    # Extract names
    name_en = raw_pokemon['name']['english']
    name_jp = raw_pokemon['name']['japanese']
    
    # Extract types
    types_en = raw_pokemon['type']
    # Map English types to Japanese (common type names)
    type_map_jp = {
        'Normal': 'ノーマル', 'Fire': 'ほのお', 'Water': 'みず', 
        'Electric': 'でんき', 'Grass': 'くさ', 'Ice': 'こおり',
        'Fighting': 'かくとう', 'Poison': 'どく', 'Ground': 'じめん',
        'Flying': 'ひこう', 'Psychic': 'エスパー', 'Bug': 'むし',
        'Rock': 'いわ', 'Ghost': 'ゴースト', 'Dragon': 'ドラゴン',
        'Dark': 'あく', 'Steel': 'はがね', 'Fairy': 'フェアリー'
    }
    types_jp = [type_map_jp.get(t, t) for t in types_en]
    
    # Extract stats
    base_stats = raw_pokemon.get('base', {})
    stats = {
        'hp': base_stats.get('HP', 50),
        'attack': base_stats.get('Attack', 50),
        'defense': base_stats.get('Defense', 50),
        'special-attack': base_stats.get('Sp. Attack', 50),
        'special-defense': base_stats.get('Sp. Defense', 50),
        'speed': base_stats.get('Speed', 50)
    }
    
    # Bio
    bio_en = raw_pokemon.get('description', f'{name_en}, the {raw_pokemon.get("species", "Pokemon")}.')
    bio_jp = f'{name_jp}。{raw_pokemon.get("species", "ポケモン")}。'
    
    # Sprite URL
    sprite = f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png'
    
    # Evolution chain - simplified version
    evolution_chain = [{'name': name_en, 'id': pokemon_id}]
    if 'evolution' in raw_pokemon:
        evo_data = raw_pokemon['evolution']
        if 'next' in evo_data and evo_data['next']:
            for next_evo in evo_data['next']:
                if isinstance(next_evo, list) and len(next_evo) > 0:
                    next_id = int(next_evo[0])
                    # We'll just add the ID, name will be filled when processing that Pokemon
                    evolution_chain.append({'name': f'Pokemon{next_id:04d}', 'id': next_id})
    
    # Calculate basic weaknesses (simplified - real calculation would use type effectiveness)
    weaknesses = calculate_weaknesses(types_en)
    
    return {
        'id': pokemon_id,
        'name_en': name_en,
        'name_jp': name_jp,
        'sprite': sprite,
        'types_en': types_en,
        'types_jp': types_jp,
        'stats': stats,
        'bio_en': bio_en,
        'bio_jp': bio_jp,
        'moves': [],  # Will be empty for now, can be fetched from PokeAPI later
        'evolution_chain': evolution_chain,
        'weaknesses': weaknesses
    }

def calculate_weaknesses(pokemon_types):
    """Calculate type weaknesses (simplified version)"""
    # This is a simplified weakness calculator
    # For a complete implementation, use the TYPE_EFFECTIVENESS from pokeapi_fetch.py
    weaknesses = {}
    
    # Basic type matchups (simplified)
    type_weaknesses = {
        'Normal': ['Fighting'],
        'Fire': ['Water', 'Ground', 'Rock'],
        'Water': ['Electric', 'Grass'],
        'Electric': ['Ground'],
        'Grass': ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
        'Ice': ['Fire', 'Fighting', 'Rock', 'Steel'],
        'Fighting': ['Flying', 'Psychic', 'Fairy'],
        'Poison': ['Ground', 'Psychic'],
        'Ground': ['Water', 'Grass', 'Ice'],
        'Flying': ['Electric', 'Ice', 'Rock'],
        'Psychic': ['Bug', 'Ghost', 'Dark'],
        'Bug': ['Fire', 'Flying', 'Rock'],
        'Rock': ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
        'Ghost': ['Ghost', 'Dark'],
        'Dragon': ['Ice', 'Dragon', 'Fairy'],
        'Dark': ['Fighting', 'Bug', 'Fairy'],
        'Steel': ['Fire', 'Fighting', 'Ground'],
        'Fairy': ['Poison', 'Steel']
    }
    
    # Collect all weaknesses
    all_weaknesses = {}
    for ptype in pokemon_types:
        if ptype in type_weaknesses:
            for weakness in type_weaknesses[ptype]:
                all_weaknesses[weakness] = all_weaknesses.get(weakness, 0) + 2.0
    
    # If same weakness from both types, it's 4x
    # This is simplified - real calculation is more complex
    return {k: v for k, v in all_weaknesses.items() if v >= 2.0}

def create_minimal_pokemon(pokemon_id):
    """Create a minimal Pokemon entry for IDs not in external data"""
    return {
        'id': pokemon_id,
        'name_en': f'Pokemon {pokemon_id}',
        'name_jp': f'ポケモン{pokemon_id}',
        'sprite': f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{pokemon_id}.png',
        'types_en': ['Normal'],
        'types_jp': ['ノーマル'],
        'stats': {
            'hp': 50,
            'attack': 50,
            'defense': 50,
            'special-attack': 50,
            'special-defense': 50,
            'speed': 50
        },
        'bio_en': f'Pokemon #{pokemon_id}. Full data will be available when fetched from PokeAPI.',
        'bio_jp': f'ポケモン #{pokemon_id}。完全なデータはPokeAPIから取得可能です。',
        'moves': [],
        'evolution_chain': [{'name': f'Pokemon {pokemon_id}', 'id': pokemon_id}],
        'weaknesses': {'Fighting': 2.0}
    }

def main():
    input_file = '/tmp/pokemon_raw.json'
    output_file = 'pokedex_data.json'
    
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        print("Please download Pokemon data first using:")
        print('curl -L -o /tmp/pokemon_raw.json "https://raw.githubusercontent.com/Purukitto/pokemon-data.json/master/pokedex.json"')
        sys.exit(1)
    
    print("Loading external Pokemon data...")
    with open(input_file, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    print(f"Found {len(raw_data)} Pokemon in external data")
    
    # Transform all Pokemon from external source
    transformed_data = []
    for raw_pokemon in raw_data:
        try:
            pokemon = transform_pokemon(raw_pokemon)
            transformed_data.append(pokemon)
            if pokemon['id'] % 100 == 0:
                print(f"Processed Pokemon #{pokemon['id']}: {pokemon['name_en']}")
        except Exception as e:
            print(f"Error processing Pokemon ID {raw_pokemon.get('id', '?')}: {e}")
    
    # Get the maximum ID we have
    max_id = max(p['id'] for p in transformed_data)
    print(f"Maximum Pokemon ID from external data: {max_id}")
    
    # Add minimal entries for Pokemon beyond what we have (up to 1025)
    if max_id < 1025:
        print(f"Adding minimal entries for Pokemon {max_id + 1} to 1025...")
        for pokemon_id in range(max_id + 1, 1026):
            minimal_pokemon = create_minimal_pokemon(pokemon_id)
            transformed_data.append(minimal_pokemon)
            if pokemon_id % 100 == 0:
                print(f"Added minimal entry for Pokemon #{pokemon_id}")
    
    # Sort by ID
    transformed_data.sort(key=lambda p: p['id'])
    
    # Save to output file
    print(f"\nSaving {len(transformed_data)} Pokemon to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(transformed_data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ Successfully created {output_file} with {len(transformed_data)} Pokemon")
    print(f"  - Pokemon 1-{max_id}: Full data from external source")
    print(f"  - Pokemon {max_id+1}-1025: Minimal data (run pokeapi_fetch.py to complete)")

if __name__ == '__main__':
    main()
