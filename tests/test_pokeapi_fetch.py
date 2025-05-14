import unittest

from pokeapi import fetch_pokemon  # Import fetch_pokemon from the appropriate module


class TestPokeAPIFetch(unittest.TestCase):
    def test_fetch_pokemon(self):
        response = fetch_pokemon('pikachu')
        # Compare lower-case values to account for any capitalization differences
        self.assertEqual(response['name_en'].lower(), 'pikachu')
        self.assertEqual(response['id'], 25)

    def test_fetch_invalid_pokemon(self):
        response = fetch_pokemon('invalid_pokemon')
        self.assertIsNone(response)


if __name__ == '__main__':
    unittest.main()