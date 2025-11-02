import json

# Load existing data
with open('pokedex_data.json', 'r', encoding='utf-8') as f:
    pokemon_data = json.load(f)

# Common Pokemon abilities mapping (from known Pokemon data)
# Format: pokemon_id: [ability_en, ability_jp]
abilities_map = {
    1: (["Overgrow"], ["しんりょく"]),
    2: (["Overgrow"], ["しんりょく"]),
    3: (["Overgrow"], ["しんりょく"]),
    4: (["Blaze"], ["もうか"]),
    5: (["Blaze"], ["もうか"]),
    6: (["Blaze"], ["もうか"]),
    7: (["Torrent"], ["げきりゅう"]),
    8: (["Torrent"], ["げきりゅう"]),
    9: (["Torrent"], ["げきりゅう"]),
    25: (["Static"], ["せいでんき"]),
    26: (["Static"], ["せいでんき"]),
}

# Add abilities and base_stat_total to each Pokemon
for pokemon in pokemon_data:
    pokemon_id = pokemon['id']
    
    # Add base_stat_total
    if 'stats' in pokemon and 'base_stat_total' not in pokemon:
        stats = pokemon['stats']
        base_stat_total = sum(stats.values())
        pokemon['base_stat_total'] = base_stat_total
    
    # Add abilities with fallback
    if pokemon_id in abilities_map:
        abilities_en, abilities_jp = abilities_map[pokemon_id]
        pokemon['abilities_en'] = abilities_en
        pokemon['abilities_jp'] = abilities_jp
    else:
        # Generic fallback abilities
        pokemon['abilities_en'] = ["Unknown"]
        pokemon['abilities_jp'] = ["不明"]

# Save updated data
with open('pokedex_data.json', 'w', encoding='utf-8') as f:
    json.dump(pokemon_data, f, ensure_ascii=False, indent=2)

print(f"Updated {len(pokemon_data)} Pokemon with abilities and base_stat_total")
print("\nSample Pokemon:")
print(json.dumps(pokemon_data[0], indent=2, ensure_ascii=False))
