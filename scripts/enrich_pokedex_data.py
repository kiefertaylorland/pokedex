#!/usr/bin/env python3
"""Enrich existing pokedex_data.json with move damage class and evolution methods."""

import argparse
import json
import time
from typing import Dict, Any, List, Optional

import requests

BASE_URL = "https://pokeapi.co/api/v2/"


def get_json(url: str, cache: Dict[str, Any], sleep_time: float = 0.0) -> Optional[Dict[str, Any]]:
    if url in cache:
        return cache[url]

    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        payload = response.json()
        cache[url] = payload
        if sleep_time > 0:
            time.sleep(sleep_time)
        return payload
    except requests.RequestException:
        cache[url] = None
        return None


def to_slug(title_name: str) -> str:
    return title_name.strip().lower().replace(" ", "-")


def format_evolution_method(detail: Dict[str, Any]) -> Dict[str, Any]:
    def nested_name(key: str) -> Optional[str]:
        value = detail.get(key)
        if isinstance(value, dict):
            return value.get("name")
        return None

    trigger = detail.get("trigger", {}).get("name")
    item = nested_name("item")
    held_item = nested_name("held_item")
    known_move = nested_name("known_move")
    known_move_type = nested_name("known_move_type")
    location = nested_name("location")
    trade_species = nested_name("trade_species")

    method = {
        "trigger": trigger,
        "min_level": detail.get("min_level"),
        "item": item,
        "held_item": held_item,
        "known_move": known_move,
        "known_move_type": known_move_type,
        "location": location,
        "min_happiness": detail.get("min_happiness"),
        "min_beauty": detail.get("min_beauty"),
        "min_affection": detail.get("min_affection"),
        "time_of_day": detail.get("time_of_day"),
        "gender": detail.get("gender"),
        "relative_physical_stats": detail.get("relative_physical_stats"),
        "needs_overworld_rain": detail.get("needs_overworld_rain"),
        "party_species": nested_name("party_species"),
        "party_type": nested_name("party_type"),
        "trade_species": trade_species,
        "turn_upside_down": detail.get("turn_upside_down", False)
    }

    parts: List[str] = []
    if trigger == "level-up":
        parts.append(f"Level {method['min_level']}" if method["min_level"] else "Level-up")
    elif trigger == "use-item":
        parts.append(f"Use {item.replace('-', ' ').title()}" if item else "Use item")
    elif trigger == "trade":
        parts.append("Trade")
    else:
        parts.append(trigger.replace("-", " ").title() if trigger else "Special")

    if method["time_of_day"]:
        parts.append(method["time_of_day"].title())
    if method["held_item"]:
        parts.append(f"Holding {method['held_item'].replace('-', ' ').title()}")
    if method["known_move"]:
        parts.append(f"Knows {method['known_move'].replace('-', ' ').title()}")
    if method["known_move_type"]:
        parts.append(f"{method['known_move_type'].replace('-', ' ').title()} move")
    if method["location"]:
        parts.append(f"At {method['location'].replace('-', ' ').title()}")
    if method["min_happiness"]:
        parts.append(f"Happiness {method['min_happiness']}+")
    if method["min_beauty"]:
        parts.append(f"Beauty {method['min_beauty']}+")
    if method["min_affection"]:
        parts.append(f"Affection {method['min_affection']}+")
    if method["trade_species"]:
        parts.append(f"for {method['trade_species'].replace('-', ' ').title()}")
    if method["needs_overworld_rain"]:
        parts.append("While raining")
    if method["turn_upside_down"]:
        parts.append("Upside-down device")

    method["description"] = ", ".join(parts)
    return method


def build_evolution_graph(evolution_chain_payload: Dict[str, Any]) -> Dict[str, Any]:
    nodes: List[Dict[str, Any]] = []
    transitions: List[Dict[str, Any]] = []
    seen = set()

    def walk(node: Dict[str, Any], parent_id: Optional[int] = None) -> None:
        species_name = node["species"]["name"]
        species_id = int(node["species"]["url"].rstrip("/").split("/")[-1])

        if species_id not in seen:
            nodes.append({"name": species_name.capitalize(), "id": species_id})
            seen.add(species_id)

        if parent_id is not None:
            details = node.get("evolution_details") or []
            methods = [format_evolution_method(detail) for detail in details]
            if not methods:
                methods = [{"trigger": None, "description": "Unknown method"}]
            transitions.append({
                "from_id": parent_id,
                "to_id": species_id,
                "methods": methods
            })

        for child in node.get("evolves_to", []):
            walk(child, species_id)

    walk(evolution_chain_payload["chain"])
    return {"nodes": nodes, "transitions": transitions}


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich pokedex_data.json with Milestone 3 metadata")
    parser.add_argument("--input", default="pokedex_data.json", help="Input JSON file")
    parser.add_argument("--output", default="pokedex_data.json", help="Output JSON file")
    parser.add_argument("--sleep", type=float, default=0.0, help="Sleep time between API calls")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as fh:
        pokemon_data = json.load(fh)

    cache: Dict[str, Any] = {}
    evolution_graph_cache: Dict[str, Dict[str, Any]] = {}
    move_damage_cache: Dict[str, Optional[str]] = {}

    # Resolve move damage classes once per unique move.
    unique_move_slugs = sorted({
        to_slug(move["name_en"])
        for pokemon in pokemon_data
        for move in (pokemon.get("moves") or [])
        if move.get("name_en")
    })

    print(f"Resolving damage class for {len(unique_move_slugs)} unique moves...")
    for idx, move_slug in enumerate(unique_move_slugs, 1):
        move_url = f"{BASE_URL}move/{move_slug}"
        move_payload = get_json(move_url, cache, args.sleep)
        if move_payload and move_payload.get("damage_class"):
            move_damage_cache[move_slug] = move_payload["damage_class"]["name"]
        else:
            move_damage_cache[move_slug] = None
        if idx % 100 == 0 or idx == len(unique_move_slugs):
            print(f"  {idx}/{len(unique_move_slugs)} moves processed")

    # Resolve evolution graph once per evolution chain URL.
    print(f"Resolving evolution chains for {len(pokemon_data)} Pokémon...")
    for idx, pokemon in enumerate(pokemon_data, 1):
        species_url = f"{BASE_URL}pokemon-species/{pokemon['id']}"
        species_payload = get_json(species_url, cache, args.sleep)
        if species_payload and species_payload.get("evolution_chain", {}).get("url"):
            chain_url = species_payload["evolution_chain"]["url"]
            if chain_url not in evolution_graph_cache:
                chain_payload = get_json(chain_url, cache, args.sleep)
                if chain_payload:
                    evolution_graph_cache[chain_url] = build_evolution_graph(chain_payload)
                else:
                    evolution_graph_cache[chain_url] = {"nodes": [], "transitions": []}
            pokemon["evolution_chain"] = evolution_graph_cache[chain_url]

        for move in pokemon.get("moves", []):
            move_slug = to_slug(move.get("name_en", ""))
            raw_damage_class = move_damage_cache.get(move_slug)
            move["damage_class"] = raw_damage_class
            move["damage_class_en"] = raw_damage_class.replace("-", " ").title() if raw_damage_class else None

        if idx % 100 == 0 or idx == len(pokemon_data):
            print(f"  {idx}/{len(pokemon_data)} Pokémon processed")

    with open(args.output, "w", encoding="utf-8") as fh:
        json.dump(pokemon_data, fh, ensure_ascii=False, indent=2)

    print(f"Done. Wrote enriched data to {args.output}")
    print(f"Evolution chains cached: {len(evolution_graph_cache)}")


if __name__ == "__main__":
    main()
