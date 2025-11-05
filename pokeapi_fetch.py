import requests
import json
import time
import argparse
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

BASE_URL: str = "https://pokeapi.co/api/v2/"
POKEMON_COUNT: int = 1025  # All generations (1-9) - default value


class RateLimiter:
    """Rate limiter to prevent API abuse and respect rate limits.
    
    Tracks API calls over time and introduces delays when necessary
    to stay within specified rate limits.
    """
    
    def __init__(self, calls_per_minute: int = 100):
        """Initialize rate limiter.
        
        Args:
            calls_per_minute: Maximum number of API calls allowed per minute
        """
        self.calls_per_minute = calls_per_minute
        self.calls: List[datetime] = []
        
    def wait_if_needed(self) -> None:
        """Wait if necessary to respect rate limits.
        
        Removes old calls outside the time window and sleeps if
        we've reached the rate limit.
        """
        now = datetime.now()
        
        # Remove calls older than 1 minute
        self.calls = [call_time for call_time in self.calls 
                      if now - call_time < timedelta(minutes=1)]
        
        # If we've hit the limit, wait until the oldest call is > 1 minute old
        if len(self.calls) >= self.calls_per_minute:
            oldest_call = self.calls[0]
            sleep_time = 60 - (now - oldest_call).total_seconds()
            if sleep_time > 0:
                logger.warning(f"Rate limit reached. Waiting {sleep_time:.1f} seconds...")
                time.sleep(sleep_time)
                # Re-check after sleeping
                now = datetime.now()
                self.calls = [call_time for call_time in self.calls 
                             if now - call_time < timedelta(minutes=1)]
        
        # Record this call
        self.calls.append(now)
        
    def get_stats(self) -> Dict[str, Any]:
        """Get current rate limiter statistics.
        
        Returns:
            Dictionary with calls_in_window and calls_per_minute
        """
        now = datetime.now()
        recent_calls = [call_time for call_time in self.calls 
                       if now - call_time < timedelta(minutes=1)]
        
        return {
            'calls_in_window': len(recent_calls),
            'calls_per_minute': self.calls_per_minute,
            'window_utilization': f"{len(recent_calls) / self.calls_per_minute * 100:.1f}%"
        }

# Version groups in priority order (latest to oldest within each generation)
# Used for selecting which game version to fetch moves from
VERSION_PRIORITY = [
    "scarlet-violet", "sword-shield", "ultra-sun-ultra-moon", "sun-moon",
    "omega-ruby-alpha-sapphire", "x-y", "black-2-white-2", "black-white",
    "heartgold-soulsilver", "platinum", "diamond-pearl",
    "firered-leafgreen", "emerald", "ruby-sapphire",
    "crystal", "gold-silver", "yellow", "red-blue"
]

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

# Global rate limiter instance (100 calls per minute by default)
rate_limiter = RateLimiter(calls_per_minute=100)

def get_data(endpoint: str, use_rate_limiter: bool = True) -> Optional[Dict[str, Any]]:
    """Helper function to get data from PokeAPI and handle errors.
    
    Args:
        endpoint: API endpoint to fetch from
        use_rate_limiter: Whether to apply rate limiting (default: True)
        
    Returns:
        JSON data as dictionary if successful, None otherwise
    """
    try:
        # Apply rate limiting before making the request
        if use_rate_limiter:
            rate_limiter.wait_if_needed()
            
        response = requests.get(BASE_URL + endpoint)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching {endpoint}: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON from {endpoint}: {e}")
        return None

def validate_pokemon_data(pokemon_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """Validate that pokemon data has all required fields.
    
    Args:
        pokemon_data: Dictionary containing pokemon data
        
    Returns:
        Tuple of (is_valid, missing_fields) where is_valid is bool and missing_fields is list
    """
    required_fields = [
        'id', 'name_en', 'name_jp', 'sprite', 'sprites', 
        'types_en', 'types_jp', 'stats', 'bio_en', 'bio_jp',
        'abilities', 'height', 'weight', 'genus_en', 'genus_jp',
        'moves', 'evolution_chain', 'weaknesses', 'resistances', 'immunities'
    ]
    
    missing_fields = [field for field in required_fields if field not in pokemon_data]
    
    # Additional validation for nested structures
    if 'stats' in pokemon_data and pokemon_data['stats']:
        required_stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed']
        missing_stats = [stat for stat in required_stats if stat not in pokemon_data['stats']]
        if missing_stats:
            missing_fields.append(f"stats.{', stats.'.join(missing_stats)}")
    
    if 'sprites' in pokemon_data and pokemon_data['sprites']:
        required_sprites = ['front_default', 'front_shiny', 'back_default', 'back_shiny', 'official_artwork']
        missing_sprites = [sprite for sprite in required_sprites if sprite not in pokemon_data['sprites']]
        if missing_sprites:
            missing_fields.append(f"sprites.{', sprites.'.join(missing_sprites)}")
    
    return (len(missing_fields) == 0, missing_fields)

def get_localized_name(names_list: List[Dict[str, Any]], lang_code: str = "ja-Hrkt") -> Optional[str]:
    """Extracts a localized name from a list of names.
    
    Args:
        names_list: List of name dictionaries from API
        lang_code: Language code (default: "ja-Hrkt" for Katakana/Hiragana)
        
    Returns:
        Localized name string if found, None otherwise
    """
    for name_entry in names_list:
        if name_entry["language"]["name"] == lang_code:
            return name_entry["name"]
    # Fallback if specific lang_code not found
    if lang_code == "ja-Hrkt": # try "ja" if "ja-Hrkt" fails
        for name_entry in names_list:
            if name_entry["language"]["name"] == "ja":
                return name_entry["name"]
    return None

def get_localized_flavor_text(flavor_text_entries: List[Dict[str, Any]], lang_code: str = "en", version: str = "red") -> Optional[str]:
    """Extracts a localized Pokedex entry for a specific game version.
    
    Args:
        flavor_text_entries: List of flavor text dictionaries from API
        lang_code: Language code (default: "en")
        version: Game version (default: "red")
        
    Returns:
        Localized flavor text if found, None otherwise
    """
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

def calculate_resistances(pokemon_types):
    """Calculate type resistances and immunities based on Pokemon types."""
    resistances = {}
    immunities = {}
    
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
        
        # Separate immunities (0x) and resistances (0.25x or 0.5x)
        if multiplier == 0:
            immunities[attacking_type.capitalize()] = 0
        elif multiplier < 1.0:
            resistances[attacking_type.capitalize()] = multiplier
    
    return resistances, immunities

def fetch_evolution_chain(evolution_chain_url):
    """Fetch and parse evolution chain data."""
    if not evolution_chain_url:
        return []
    
    try:
        chain_data = get_data(evolution_chain_url.replace(BASE_URL, ""))
        if not chain_data:
            return []
        
        evolution_list = []
        
        def parse_chain(chain_link):
            """Recursively parse evolution chain."""
            species_name = chain_link["species"]["name"]
            species_id = int(chain_link["species"]["url"].rstrip('/').split('/')[-1])
            
            evolution_list.append({
                "name": species_name.capitalize(),
                "id": species_id
            })
            
            # Parse evolutions
            if chain_link.get("evolves_to"):
                for evolution in chain_link["evolves_to"]:
                    parse_chain(evolution)
        
        parse_chain(chain_data["chain"])
        return evolution_list
        
    except Exception as e:
        logger.error(f"Error fetching evolution chain: {e}")
        return []

def fetch_and_build_pokedex(pokemon_count=POKEMON_COUNT, base_url=BASE_URL, sleep_time=0.2):
    all_pokemon_data = []
    type_cache = {}
    evolution_chain_cache = {}  # Cache to store complete evolution chains
    validation_errors = []  # Track validation errors
    
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
        # Fetch abilities
        abilities_data = []
        for ability_entry in pokemon_main_data["abilities"]:
            ability_detail = get_data(ability_entry["ability"]["url"].replace(base_url, ""))
            if ability_detail:
                ability_name_en = ability_detail["name"].replace("-", " ").title()
                ability_name_jp = get_localized_name(ability_detail["names"]) or ability_name_en
                abilities_data.append({
                    "name_en": ability_name_en,
                    "name_jp": ability_name_jp,
                    "is_hidden": ability_entry["is_hidden"]
                })
                time.sleep(0.1)
        
        # Fetch genus (category) like "Seed Pokemon"
        genus_en = "Unknown"
        genus_jp = "Unknown"
        for genus_entry in pokemon_species_data.get("genera", []):
            if genus_entry["language"]["name"] == "en":
                genus_en = genus_entry["genus"]
            elif genus_entry["language"]["name"] == "ja":
                genus_jp = genus_entry["genus"]
        
        # Get height (in decimeters) and weight (in hectograms)
        height_dm = pokemon_main_data["height"]  # decimeters
        weight_hg = pokemon_main_data["weight"]  # hectograms
        height_m = height_dm / 10  # convert to meters
        weight_kg = weight_hg / 10  # convert to kilograms
        
        # Get additional sprites and convert to jsDelivr CDN
        def convert_sprite_url(url):
            if url and "raw.githubusercontent.com" in url:
                return url.replace(
                    "https://raw.githubusercontent.com/",
                    "https://cdn.jsdelivr.net/gh/"
                ).replace("/master/", "@master/")
            return url
        
        sprites = {
            "front_default": convert_sprite_url(pokemon_main_data["sprites"]["front_default"]),
            "front_shiny": convert_sprite_url(pokemon_main_data["sprites"]["front_shiny"]),
            "back_default": convert_sprite_url(pokemon_main_data["sprites"]["back_default"]),
            "back_shiny": convert_sprite_url(pokemon_main_data["sprites"]["back_shiny"]),
            "official_artwork": convert_sprite_url(pokemon_main_data["sprites"]["other"]["official-artwork"]["front_default"]) if pokemon_main_data["sprites"].get("other", {}).get("official-artwork") else None
        }
        
        moves_data = []
        level_up_moves = []
        
        # Try to get level-up moves from any version, prioritizing more recent games
        for move_entry in pokemon_main_data["moves"]:
            best_version = None
            best_priority = len(VERSION_PRIORITY)
            best_level = 0
            
            for version_group_detail in move_entry["version_group_details"]:
                if version_group_detail["move_learn_method"]["name"] == "level-up":
                    version_name = version_group_detail["version_group"]["name"]
                    level = version_group_detail["level_learned_at"]
                    
                    # Find priority for this version
                    try:
                        priority = VERSION_PRIORITY.index(version_name)
                    except ValueError:
                        priority = len(VERSION_PRIORITY)  # Unknown version gets lowest priority
                    
                    # Prefer versions with higher priority (lower index) and level > 0
                    if level > 0 and priority < best_priority:
                        best_version = version_name
                        best_priority = priority
                        best_level = level
            
            # If we found a valid level-up move, add it
            if best_version is not None:
                level_up_moves.append({
                    "name": move_entry["move"]["name"],
                    "url": move_entry["move"]["url"],
                    "level": best_level
                })
        
        level_up_moves.sort(key=lambda m: m["level"])
        for move_info in level_up_moves[:4]:
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
                    "pp": move_detail_data["pp"],
                    "level": move_info["level"]
                })
                time.sleep(0.1)
        # Fetch evolution chain (use cache to avoid duplicate fetches)
        evolution_chain = []
        if pokemon_species_data.get("evolution_chain"):
            evolution_chain_url = pokemon_species_data["evolution_chain"]["url"]
            
            # Check if we've already fetched this evolution chain
            if evolution_chain_url not in evolution_chain_cache:
                evolution_chain_cache[evolution_chain_url] = fetch_evolution_chain(evolution_chain_url)
                time.sleep(0.1)
            
            # Get the complete chain from cache
            evolution_chain = evolution_chain_cache[evolution_chain_url]
        
        # Calculate type weaknesses, resistances, and immunities
        weaknesses = calculate_weaknesses(types_en)
        resistances, immunities = calculate_resistances(types_en)
        
        # Convert sprite URLs to jsDelivr CDN for better reliability
        sprite_url = pokemon_main_data["sprites"]["front_default"]
        if sprite_url:
            parsed_url = urlparse(sprite_url)
            if parsed_url.hostname == "raw.githubusercontent.com":
                sprite_url = sprite_url.replace(
                    "https://raw.githubusercontent.com/",
                    "https://cdn.jsdelivr.net/gh/"
                ).replace("/master/", "@master/")
        
        pokemon_obj = {
            "id": pokemon_main_data["id"],
            "name_en": name_en,
            "name_jp": name_jp,
            "sprite": sprite_url,
            "sprites": sprites,
            "types_en": types_en,
            "types_jp": types_jp,
            "stats": stats,
            "bio_en": bio_en,
            "bio_jp": bio_jp,
            "abilities": abilities_data,
            "height": height_m,
            "weight": weight_kg,
            "genus_en": genus_en,
            "genus_jp": genus_jp,
            "moves": moves_data,
            "evolution_chain": evolution_chain,
            "weaknesses": weaknesses,
            "resistances": resistances,
            "immunities": immunities
        }
        # Validate Pokemon data before adding
        is_valid, missing_fields = validate_pokemon_data(pokemon_obj)
        if not is_valid:
            validation_errors.append({
                "id": pokemon_obj.get("id", i),
                "name": pokemon_obj.get("name_en", "Unknown"),
                "missing_fields": missing_fields
            })
            logger.warning(f"Validation warning for #{i} {name_en}: Missing fields: {', '.join(missing_fields)}")
        
        all_pokemon_data.append(pokemon_obj)
        logger.info(f"Processed: #{i} {name_en}")
        time.sleep(sleep_time)
    
    # Log validation summary
    if validation_errors:
        logger.warning(f"\nValidation Summary: {len(validation_errors)} Pokemon had missing or incomplete data")
        for error in validation_errors[:5]:  # Show first 5 errors
            logger.warning(f"  - #{error['id']} {error['name']}: {', '.join(error['missing_fields'])}")
        if len(validation_errors) > 5:
            logger.warning(f"  ... and {len(validation_errors) - 5} more")
    else:
        logger.info("\n✓ All Pokemon data validated successfully!")
    
    return all_pokemon_data

def save_pokedex_to_json(pokedex_data: List[Dict[str, Any]], output_filename: str = "pokedex_data.json") -> None:
    """Save Pokemon data to JSON file.
    
    Args:
        pokedex_data: List of Pokemon dictionaries
        output_filename: Output file path (default: "pokedex_data.json")
    """
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(pokedex_data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Fetch Pokemon data from PokeAPI and save to JSON file',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pokeapi_fetch.py                    # Fetch all 1025 Pokemon (default)
  python pokeapi_fetch.py --count 151        # Fetch first 151 Pokemon (Gen 1)
  python pokeapi_fetch.py --count 251        # Fetch first 251 Pokemon (Gen 1-2)
  python pokeapi_fetch.py --output test.json # Save to custom filename
  python pokeapi_fetch.py --count 10 --sleep 0.5  # Fetch 10 with longer delay
        """
    )
    parser.add_argument(
        '--count', '-c',
        type=int,
        default=POKEMON_COUNT,
        help=f'Number of Pokemon to fetch (default: {POKEMON_COUNT})'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='pokedex_data.json',
        help='Output filename (default: pokedex_data.json)'
    )
    parser.add_argument(
        '--sleep', '-s',
        type=float,
        default=0.2,
        help='Sleep time between requests in seconds (default: 0.2)'
    )
    
    args = parser.parse_args()
    
    logger.info(f"Starting data fetching process...")
    logger.info(f"Fetching {args.count} Pokemon with {args.sleep}s delay between requests")
    logger.info(f"Output file: {args.output}")
    logger.info("-" * 60)
    
    pokedex_data = fetch_and_build_pokedex(
        pokemon_count=args.count,
        sleep_time=args.sleep
    )
    save_pokedex_to_json(pokedex_data, args.output)
    
    # Log rate limiter statistics
    stats = rate_limiter.get_stats()
    logger.info(f"\nAll Pokemon data fetched and saved to {args.output}")
    logger.info(f"Total Pokemon processed: {len(pokedex_data)}")
    logger.info(f"Rate limiter stats: {stats['calls_in_window']} calls in current window "
                f"(utilization: {stats['window_utilization']})")
