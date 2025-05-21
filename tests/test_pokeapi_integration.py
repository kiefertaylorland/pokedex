"""
Integration tests for PokeAPI interactions.
These tests make actual API calls and should be run sparingly.
"""
import unittest
import os
import sys
import time
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/../'))
from pokeapi_fetch import get_data, fetch_and_build_pokedex

class TestPokeAPIIntegration(unittest.TestCase):
    def setUp(self):
        # Add a delay between tests to avoid rate limiting
        delay = float(os.getenv("TEST_DELAY", 1))
        time.sleep(delay)

    def test_get_pokemon_data(self):
        """Test that we can fetch data for a specific Pokémon"""
        data = get_data("pokemon/1")
        self.assertIsNotNone(data)
        self.assertEqual(data["name"], "bulbasaur")
        self.assertEqual(data["id"], 1)

    def test_get_species_data(self):
        """Test that we can fetch species data"""
        data = get_data("pokemon-species/1")
        self.assertIsNotNone(data)
        self.assertEqual(data["id"], 1)
        # Check that the names list contains entries
        self.assertTrue(len(data["names"]) > 0)

    def test_build_minimal_pokedex(self):
        """Test building a minimal Pokédex with real API data"""
        # Only fetch data for a single Pokémon to minimize API usage
        result = fetch_and_build_pokedex(pokemon_count=1)
        self.assertEqual(len(result), 1)
        pokemon = result[0]
        self.assertEqual(pokemon["id"], 1)
        self.assertEqual(pokemon["name_en"].lower(), "bulbasaur")

if __name__ == "__main__":
    unittest.main()
