import requests
import json
import time

BASE_URL = "https://pokeapi.co/api/v2/"
POKEMON_COUNT = 151 # First generation

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


all_pokemon_data = []
type_cache = {} # Cache for type data to avoid redundant API calls for Japanese names

print("Starting data fetching process...")

for i in range(1, POKEMON_COUNT + 1):
    print(f"Fetching data for Pokemon #{i}...")
    pokemon_main_data = get_data(f"pokemon/{i}")
    pokemon_species_data = get_data(f"pokemon-species/{i}")

    if not pokemon_main_data or not pokemon_species_data:
        print(f"Skipping Pokemon #{i} due to missing main or species data.")
        time.sleep(0.2) # Be nice to the API
        continue

    # Basic Info
    name_en = pokemon_main_data["name"].capitalize()
    name_jp = get_localized_name(pokemon_species_data["names"]) or name_en # Fallback to English name

    # Types (English and Japanese)
    types_en = []
    types_jp = []
    for type_entry in pokemon_main_data["types"]:
        type_name_en = type_entry["type"]["name"].capitalize()
        types_en.append(type_name_en)

        # Fetch Japanese type name if not already cached
        if type_name_en not in type_cache:
            type_detail_data = get_data(f"type/{type_entry['type']['name']}")
            if type_detail_data:
                type_name_jp = get_localized_name(type_detail_data["names"]) or type_name_en
                type_cache[type_name_en] = type_name_jp
            else:
                type_cache[type_name_en] = type_name_en # Fallback
            time.sleep(0.1) # Be nice to the API
        types_jp.append(type_cache[type_name_en])


    # Stats
    stats = {
        "hp": 0, "attack": 0, "defense": 0,
        "special-attack": 0, "special-defense": 0, "speed": 0
    }
    for stat in pokemon_main_data["stats"]:
        stats[stat["stat"]["name"]] = stat["base_stat"]

    # Bio/Description
    # Try 'red', then 'blue', then 'yellow' for Gen 1 flavor text
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


    # Moves (Signature - first 4 Gen 1 level-up moves from red-blue)
    moves_data = []
    # Filter moves for 'red-blue' version group and 'level-up' method
    gen1_level_up_moves = []
    for move_entry in pokemon_main_data["moves"]:
        for version_group_detail in move_entry["version_group_details"]:
            if version_group_detail["version_group"]["name"] == "red-blue" and \
               version_group_detail["move_learn_method"]["name"] == "level-up" and \
               version_group_detail["level_learned_at"] > 0: # Only actual learned moves
                gen1_level_up_moves.append({
                    "name": move_entry["move"]["name"],
                    "url": move_entry["move"]["url"],
                    "level": version_group_detail["level_learned_at"]
                })
                break # Found for red-blue, no need to check other version groups for this move

    # Sort by level learned, then take up to 4
    gen1_level_up_moves.sort(key=lambda m: m["level"])

    for move_info in gen1_level_up_moves[:4]:
        move_detail_data = get_data(move_info["url"].replace(BASE_URL, "")) # Pass relative URL
        if move_detail_data:
            move_name_en = move_detail_data["name"].replace("-", " ").title()
            move_name_jp = get_localized_name(move_detail_data["names"]) or move_name_en

            move_type_en = move_detail_data["type"]["name"].capitalize()
            # Use cached Japanese type name if available
            move_type_jp = type_cache.get(move_type_en, move_type_en)
            # If not in cache (e.g., a new type encountered in moves not in Pokemon's own types), fetch it
            if move_type_jp == move_type_en and move_type_en not in type_cache:
                type_detail = get_data(f"type/{move_detail_data['type']['name']}")
                if type_detail:
                    move_type_jp = get_localized_name(type_detail["names"]) or move_type_en
                    type_cache[move_type_en] = move_type_jp # Cache it
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
            time.sleep(0.1) # Be nice to the API
        if len(moves_data) >= 4:
            break

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
        "moves": moves_data
    }
    all_pokemon_data.append(pokemon_obj)
    print(f"Successfully processed Pokemon #{i}: {name_en}")
    time.sleep(0.2) # Be respectful to the API between Pokemon fetches

# Save to JSON
output_filename = "pokedex_data.json"
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(all_pokemon_data, f, ensure_ascii=False, indent=2)

print(f"\nAll Pokemon data fetched and saved to {output_filename}")
print(f"Total Pokemon processed: {len(all_pokemon_data)}")

# Example of cached types
# print("\nCached Type Translations (English -> Japanese):")
# for en, jp in type_cache.items():
# print(f"  {en}: {jp}")