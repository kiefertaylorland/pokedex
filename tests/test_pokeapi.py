"""
This file contains unit tests for pokeapi.py using both unittest and pytest styles.
We use both styles to demonstrate compatibility and flexibility for different developer preferences.
"""
import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/../'))
from pokeapi import fetch_pokemon

class TestFetchPokemonUnittest(unittest.TestCase):
    def test_fetch_by_id(self):
        result = fetch_pokemon(25)  # Pikachu
        self.assertIsNotNone(result)
        self.assertEqual(result["name_en"].lower(), "pikachu")

    def test_fetch_by_name(self):
        result = fetch_pokemon("bulbasaur")
        self.assertIsNotNone(result)
        self.assertEqual(result["id"], 1)

    def test_fetch_invalid(self):
        result = fetch_pokemon("notapokemon")
        self.assertIsNone(result)

def test_fetch_by_id_pytest():
    result = fetch_pokemon(1)
    assert result is not None
    assert result["name_en"].lower() == "bulbasaur"

def test_fetch_by_name_pytest():
    result = fetch_pokemon("pikachu")
    assert result is not None
    assert result["id"] == 25

def test_fetch_invalid_pytest():
    result = fetch_pokemon("xyznotapokemon")
    assert result is None
