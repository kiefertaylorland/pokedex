"""
This file contains unit tests for pokeapi_fetch.py helper functions using both unittest and pytest styles.
We use both styles to demonstrate compatibility and flexibility for different developer preferences.
"""
import json
import pytest
import requests
import sys
import os
from unittest.mock import patch
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/../'))
from pokeapi_fetch import get_data, get_localized_name, get_localized_flavor_text

# --- get_data tests ---
def test_get_data_normal():
    class MockResponse:
        def raise_for_status(self):
            pass
        def json(self):
            return {"result": "ok"}
    with patch("requests.get", return_value=MockResponse()):
        assert get_data("pokemon/1") == {"result": "ok"}

def test_get_data_http_error():
    class MockResponse:
        def raise_for_status(self):
            raise requests.exceptions.HTTPError("404")
    with patch("requests.get", return_value=MockResponse()):
        assert get_data("bad/endpoint") is None

def test_get_data_json_error():
    class MockResponse:
        def raise_for_status(self):
            pass
        def json(self):
            raise json.JSONDecodeError("Expecting value", "", 0)
    with patch("requests.get", return_value=MockResponse()):
        assert get_data("pokemon/1") is None

# --- get_localized_name tests ---
def test_get_localized_name_normal():
    names = [
        {"language": {"name": "en"}, "name": "Bulbasaur"},
        {"language": {"name": "ja-Hrkt"}, "name": "フシギダネ"}
    ]
    assert get_localized_name(names, "ja-Hrkt") == "フシギダネ"
    assert get_localized_name(names, "en") == "Bulbasaur"

def test_get_localized_name_fallback():
    names = [
        {"language": {"name": "en"}, "name": "Bulbasaur"},
        {"language": {"name": "ja"}, "name": "フシギダネAlt"}
    ]
    assert get_localized_name(names, "ja-Hrkt") == "フシギダネAlt"

def test_get_localized_name_none():
    names = [
        {"language": {"name": "en"}, "name": "Bulbasaur"}
    ]
    assert get_localized_name(names, "ja-Hrkt") is None

# --- get_localized_flavor_text tests ---
def test_get_localized_flavor_text_normal():
    entries = [
        {"language": {"name": "en"}, "version": {"name": "red"}, "flavor_text": "Test Red"},
        {"language": {"name": "en"}, "version": {"name": "blue"}, "flavor_text": "Test Blue"}
    ]
    assert get_localized_flavor_text(entries, "en", "red") == "Test Red"

def test_get_localized_flavor_text_fallback():
    entries = [
        {"language": {"name": "en"}, "version": {"name": "blue"}, "flavor_text": "Test Blue"}
    ]
    assert get_localized_flavor_text(entries, "en", "red") == "Test Blue"

def test_get_localized_flavor_text_none():
    entries = [
        {"language": {"name": "ja"}, "version": {"name": "red"}, "flavor_text": "テスト"}
    ]
    assert get_localized_flavor_text(entries, "en", "red") == "No description available."

# --- fetch_and_build_pokedex tests ---
def test_fetch_and_build_pokedex_empty():
    from pokeapi_fetch import fetch_and_build_pokedex
    import pokeapi_fetch
    from unittest.mock import patch
    with patch.object(pokeapi_fetch, "get_data", lambda endpoint: None):
        result = fetch_and_build_pokedex(pokemon_count=3)
        assert result == []

def test_fetch_and_build_pokedex_minimal():
    from pokeapi_fetch import fetch_and_build_pokedex
    import pokeapi_fetch
    from unittest.mock import patch
    def fake_get_data(endpoint):
        if endpoint.startswith("pokemon/"):
            return {
                "id": 1,
                "name": "bulbasaur",
                "types": [{"type": {"name": "grass"}}],
                "stats": [
                    {"stat": {"name": "hp"}, "base_stat": 45},
                    {"stat": {"name": "attack"}, "base_stat": 49},
                    {"stat": {"name": "defense"}, "base_stat": 49},
                    {"stat": {"name": "special-attack"}, "base_stat": 65},
                    {"stat": {"name": "special-defense"}, "base_stat": 65},
                    {"stat": {"name": "speed"}, "base_stat": 45}
                ],
                "sprites": {"front_default": "url"},
                "moves": []
            }
        elif endpoint.startswith("pokemon-species/"):
            return {
                "names": [
                    {"language": {"name": "en"}, "name": "Bulbasaur"},
                    {"language": {"name": "ja-Hrkt"}, "name": "フシギダネ"}
                ],
                "flavor_text_entries": [
                    {"language": {"name": "en"}, "version": {"name": "red"}, "flavor_text": "Test Red"},
                    {"language": {"name": "ja"}, "version": {"name": "red"}, "flavor_text": "テスト"}
                ]
            }
        elif endpoint.startswith("type/"):
            return {"names": [{"language": {"name": "ja"}, "name": "くさ"}]}
        return None
    with patch.object(pokeapi_fetch, "get_data", fake_get_data):
        result = fetch_and_build_pokedex(pokemon_count=1)
        assert len(result) == 1
        poke = result[0]
        assert poke["name_en"] == "Bulbasaur"
        assert poke["types_en"] == ["Grass"]
        assert poke["types_jp"] == ["くさ"]
        assert poke["bio_en"] == "Test Red"
        assert poke["bio_jp"] == "テスト"
