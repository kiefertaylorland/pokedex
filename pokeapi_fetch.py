import requests
import json
import time

BASE_URL = "https://pokeapi.co/api/v2/"
POKEMON_COUNT = 151 # First generation

# Type effectiveness chart - damage multipliers
TYPE_EFFECTIVENESS = {
    "normal": {"rock": 0.5, "ghost": 0, "steel": 0.5},
    "fire": {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 2, "bug": 2, "rock": 0.5, "dragon": 0.5, "steel": 2},
    "water": {"fire": 2, "water": 0.5, "grass": 0.5, "ground": 2, "rock": 2, "dragon": 0.5},
    "electric": {"water": 2, "electric": 0.5, "grass": 0.5, "ground": 0, "flying": 2, "dragon": 0.5},
    "grass": {"fire": 0.5, "water": 2, "grass": 0.5, "poison": 0.5, "ground": 2, "flying": 0.5, "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5},
    "ice": {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 0.5, "ground": 2, "flying": 2, "dragon": 2, "steel": 0.5},
    "fighting": {"normal": 2, "ice": 2, "poison": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "ghost": 0, "dark": 2, "steel": 2, "fairy": 0.5},
    "poison": {"grass": 2, "poison": 0.5, "ground": 0.5, "rock": 0.5, "ghost": 0.5, "steel": 0, "fairy": 2},
    "ground": {"fire": 2, "electric": 2, "grass": 0.5, "poison": 2, "flying": 0, "bug": 0.5, "rock": 2, "steel": 2},
    "flying": {"electric": 0.5, "grass": 2, "fighting": 2, "bug": 2, "rock": 0.5, "steel": 0.5},
    "psychic": {"fighting": 2, "poison": 2, "psychic": 0.5, "dark": 0, "steel": 0.5},
    "bug": {"fire": 0.5, "grass": 2, "fighting": 0.5, "poison": 0.5, "flying": 0.5, "psychic": 2, "ghost": 0.5, "dark": 2, "steel": 0.5, "fairy": 0.5},
    "rock": {"fire": 2, "ice": 2, "fighting": 0.5, "ground": 0.5, "flying": 2, "bug": 2, "steel": 0.5},
    "ghost": {"normal": 0, "psychic": 2, "ghost": 2, "dark": 0.5},
    "dragon": {"dragon": 2, "steel": 0.5, "fairy": 0},
    "dark": {"fighting": 0.5, "psychic": 2, "ghost": 2, "dark": 0.5, "fairy": 0.5},
    "steel": {"fire": 0.5, "water": 0.5, "electric": 0.5, "ice": 2, "rock": 2, "steel": 0.5, "fairy": 2},
    "fairy": {"fire": 0.5, "fighting": 2, "poison": 0.5, "dragon": 2, "dark": 2, "steel": 0.5}
}

def get_data(endpoint):
    """Helper function to get data from PokeAPI and handle errors."""
    try:
        response = requests.get(BASE_URL + endpoint)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {endpoint}: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {endpoint}: {e}")
        return None

def get_localized_name(names_list, lang_code="ja-Hrkt"): # ja-Hrkt for Katakana/Hiragana
    """Extracts a localized name from a list of names."""
    for name_entry in names_list:
        if name_entry["language"]["name"] == lang_code:
            return name_entry["name"]
    # Fallback if specific lang_code not found
    if lang_code == "ja-Hrkt": # try "ja" if "ja-Hrkt" fails
        for name_entry in names_list:
            if name_entry["language"]["name"] == "ja":
                return name_entry["name"]
    return None

def get_localized_flavor_text(flavor_text_entries, lang_code="en", version="red"):
    """Extracts a localized Pokedex entry for a specific game version."""
    for entry in flavor_text_entries:
        if entry["language"]["name"] == lang_code and entry["version"]["name"] == version:
            return entry["flavor_text"].replace("\n", " ").replace("\f", " ")
    # Fallback to any entry if specific version not found
    for entry in flavor_text_entries:
        if entry["language"]["name"] == lang_code:
            return entry["flavor_text"].replace("\n", " ").replace("\f", " ")
    return "No description available."

def calculate_weaknesses(pokemon_types):
    """Calculate type weaknesses based on Pokemon types."""
    weaknesses = {}
    
    # For each attacking type, calculate the combined effectiveness
    all_types = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", 
                 "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
                 "dragon", "dark", "steel", "fairy"]
    
    for attacking_type in all_types:
        multiplier = 1.0
        
        # Calculate combined multiplier for all defending types
        for defending_type in pokemon_types:
            defending_type_lower = defending_type.lower()
            if attacking_type in TYPE_EFFECTIVENESS:
                type_matchup = TYPE_EFFECTIVENESS[attacking_type]
                if defending_type_lower in type_matchup:
                    multiplier *= type_matchup[defending_type_lower]
        
        # Only include weaknesses (2x or 4x damage)
        if multiplier >= 2.0:
            weaknesses[attacking_type.capitalize()] = multiplier
    
    return weaknesses

def fetch_evolution_chain(evolution_chain_url):
    """Fetch and parse evolution chain data."""
    if not evolution_chain_url:
        return []
    
    try:
        chain_data = get_data(evolution_chain_url.replace(BASE_URL, ""))
        if not chain_data:
            return []
        
        
        def parse_chain(chain_link):
            """Recursively parse evolution chain."""
            species_name = chain_link["species"]["name"]
            species_id = int(chain_link["species"]["url"].rstrip('/').split('/')[-1])
            
            current = [{
                "name": species_name.capitalize(),
                "id": species_id
            }]
            
            # Parse evolutions
            if chain_link.get("evolves_to"):
                for evolution in chain_link["evolves_to"]:
                    current.extend(parse_chain(evolution))
            return current
        
        return parse_chain(chain_data["chain"])
        
    except Exception as e:
        print(f"Error fetching evolution chain: {e}")
        return []

def fetch_and_build_pokedex(pokemon_count=POKEMON_COUNT, base_url=BASE_URL, sleep_time=0.2):
    all_pokemon_data = []
    type_cache = {}
    for i in range(1, pokemon_count + 1):
        pokemon_main_data = get_data(f"pokemon/{i}")
        pokemon_species_data = get_data(f"pokemon-species/{i}")
        if not pokemon_main_data or not pokemon_species_data:
            time.sleep(sleep_time)
            continue
        name_en = pokemon_main_data["name"].capitalize()
        name_jp = get_localized_name(pokemon_species_data["names"]) or name_en
        types_en = []
        types_jp = []
        for type_entry in pokemon_main_data["types"]:
            type_name_en = type_entry["type"]["name"].capitalize()
            types_en.append(type_name_en)
            if type_name_en not in type_cache:
                type_detail_data = get_data(f"type/{type_entry['type']['name']}")
                if type_detail_data:
                    type_name_jp = get_localized_name(type_detail_data["names"]) or type_name_en
                    type_cache[type_name_en] = type_name_jp
                else:
                    type_cache[type_name_en] = type_name_en
                time.sleep(0.1)
            types_jp.append(type_cache[type_name_en])
        stats = {"hp": 0, "attack": 0, "defense": 0, "special-attack": 0, "special-defense": 0, "speed": 0}
        for stat in pokemon_main_data["stats"]:
            stats[stat["stat"]["name"]] = stat["base_stat"]
        bio_en = get_localized_flavor_text(pokemon_species_data["flavor_text_entries"], "en", "red")
        if bio_en == "No description available.":
            bio_en = get_localized_flavor_text(pokemon_species_data["flavor_text_entries"], "en", "blue")
        if bio_en == "No description available.":
            bio_en = get_localized_flavor_text(pokemon_species_data["flavor_text_entries"], "en", "yellow")
        bio_jp = get_localized_flavor_text(pokemon_species_data["flavor_text_entries"], "ja", "red")
        if bio_jp == "No description available.":
            bio_jp = get_localized_flavor_text(pokemon_species_data["flavor_text_entries"], "ja", "blue")
        if bio_jp == "No description available.":
            bio_jp = get_localized_flavor_text(pokemon_species_data["flavor_text_entries"], "ja", "yellow")
        moves_data = []
        gen1_level_up_moves = []
        for move_entry in pokemon_main_data["moves"]:
            for version_group_detail in move_entry["version_group_details"]:
                if version_group_detail["version_group"]["name"] == "red-blue" and \
                   version_group_detail["move_learn_method"]["name"] == "level-up" and \
                   version_group_detail["level_learned_at"] > 0:
                    gen1_level_up_moves.append({
                        "name": move_entry["move"]["name"],
                        "url": move_entry["move"]["url"],
                        "level": version_group_detail["level_learned_at"]
                    })
                    break
        gen1_level_up_moves.sort(key=lambda m: m["level"])
        for move_info in gen1_level_up_moves[:4]:
            move_detail_data = get_data(move_info["url"].replace(base_url, ""))
            if move_detail_data:
                move_name_en = move_detail_data["name"].replace("-", " ").title()
                move_name_jp = get_localized_name(move_detail_data["names"]) or move_name_en
                move_type_en = move_detail_data["type"]["name"].capitalize()
                move_type_jp = type_cache.get(move_type_en, move_type_en)
                if move_type_jp == move_type_en and move_type_en not in type_cache:
                    type_detail = get_data(f"type/{move_detail_data['type']['name']}")
                    if type_detail:
                        move_type_jp = get_localized_name(type_detail["names"]) or move_type_en
                        type_cache[move_type_en] = move_type_jp
                    time.sleep(0.1)
                moves_data.append({
                    "name_en": move_name_en,
                    "name_jp": move_name_jp,
                    "type_en": move_type_en,
                    "type_jp": move_type_jp,
                    "power": move_detail_data["power"],
                    "accuracy": move_detail_data["accuracy"],
                    "pp": move_detail_data["pp"]
                })
                time.sleep(0.1)
            if len(moves_data) >= 4:
                break
        # Fetch evolution chain
        evolution_chain = []
        if pokemon_species_data.get("evolution_chain"):
            evolution_chain_url = pokemon_species_data["evolution_chain"]["url"]
            evolution_chain = fetch_evolution_chain(evolution_chain_url)
            time.sleep(0.1)
        
        # Calculate type weaknesses
        weaknesses = calculate_weaknesses(types_en)
        
        pokemon_obj = {
            "id": pokemon_main_data["id"],
            "name_en": name_en,
            "name_jp": name_jp,
            "sprite": pokemon_main_data["sprites"]["front_default"],
            "types_en": types_en,
            "types_jp": types_jp,
            "stats": stats,
            "bio_en": bio_en,
            "bio_jp": bio_jp,
            "moves": moves_data,
            "evolution_chain": evolution_chain,
            "weaknesses": weaknesses
        }
        all_pokemon_data.append(pokemon_obj)
        print(f"Processed: #{i} {name_en}")
        time.sleep(sleep_time)
    return all_pokemon_data

def save_pokedex_to_json(pokedex_data, output_filename="pokedex_data.json"):
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(pokedex_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print("Starting data fetching process...")
    pokedex_data = fetch_and_build_pokedex()
    save_pokedex_to_json(pokedex_data)
    print(f"\nAll Pokemon data fetched and saved to pokedex_data.json")
    print(f"Total Pokemon processed: {len(pokedex_data)}")
