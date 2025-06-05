from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
import unittest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

class TestPokedexUI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize Chrome WebDriver with file access enabled and headless mode for CI
        chrome_options = Options()
        chrome_options.add_argument("--allow-file-access-from-files")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument(f"--user-data-dir=/tmp/chrome-user-data-{os.getpid()}")
        cls.driver = webdriver.Chrome(options=chrome_options)

        # Use localhost server instead of file:// protocol to avoid CORS issues
        cls.index_path = "http://localhost:8001"

    def setUp(self):
        self.driver.get(self.index_path)
        # Wait for the page to load completely
        WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.ID, "pokedex-grid"))
        )
        # Wait until at least one Pokémon card is loaded instead of fixed sleep
        WebDriverWait(self.driver, 10).until(
            lambda d: len(d.find_elements(By.CLASS_NAME, "pokemon-card")) > 0
        )

    def test_pokedex_interface_loads(self):
        """Test that the Pokédex interface loads properly"""
        # Verify essential elements are present
        self.assertTrue(self.driver.find_element(By.ID, "app-title").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "search-input").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "theme-toggle").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "lang-toggle").is_displayed())

        # Verify the grid has loaded with Pokémon cards
        pokemon_cards = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")
        self.assertGreater(len(pokemon_cards), 0, "No Pokémon cards were loaded")

    def test_search_functionality(self):
        """Test that the search bar filters Pokémon correctly"""
        search_input = self.driver.find_element(By.ID, "search-input")

        # Test searching for "pikachu"
        search_input.send_keys("pikachu")
        # Wait until only one visible card is present
        WebDriverWait(self.driver, 10).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, ".pokemon-card:not([style*='display: none'])")) == 1
        )

        # Check that Pikachu is visible and other Pokémon are filtered out
        visible_cards = self.driver.find_elements(By.CSS_SELECTOR, ".pokemon-card:not([style*='display: none'])")
        self.assertEqual(len(visible_cards), 1, "Search should show only Pikachu")
        card_text = visible_cards[0].text.lower()
        self.assertTrue("pikachu" in card_text or "ピカチュウ" in card_text,
                    "Search result should contain Pikachu in either English or Japanese")

        # Clear search and dispatch an input event to trigger update
        search_input.clear()
        # Manually dispatching the 'input' event is necessary to trigger JavaScript listeners
        self.driver.execute_script("arguments[0].dispatchEvent(new Event('input'));", search_input)
        # Wait until more than one card is shown after clearing search
        WebDriverWait(self.driver, 10).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, ".pokemon-card:not([style*='display: none'])")) > 1
        )
        visible_cards = self.driver.find_elements(By.CSS_SELECTOR, ".pokemon-card:not([style*='display: none'])")
        self.assertGreater(len(visible_cards), 1, "Clearing search should show all Pokémon")

    def test_pokemon_detail_view(self):
        """Test that clicking on a Pokémon card shows the detail view"""
        # Click the first Pokémon card
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")
        first_card.click()

        # Verify detail view is shown with the 'show' class
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )
        self.assertIn("show", detail_view.get_attribute("class"), "Detail view should have 'show' class")

        # Verify detail content is loaded
        detail_content = self.driver.find_element(By.ID, "detail-content")
        self.assertNotEqual(detail_content.text.strip(), "", "Detail content should not be empty")

        # Test closing the detail view
        close_button = self.driver.find_element(By.ID, "close-detail-view")
        close_button.click()

        # Wait until detail view loses the 'show' class
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" not in detail_view.get_attribute("class")
        )
        self.assertNotIn("show", detail_view.get_attribute("class"), "Detail view should not have 'show' class after closing")

    def test_theme_toggle(self):
        """Test that the theme toggle button changes between light and dark modes"""
        theme_toggle = self.driver.find_element(By.ID, "theme-toggle")

        # Get initial theme
        initial_is_dark = "dark-mode" in self.driver.find_element(By.TAG_NAME, "body").get_attribute("class")

        # Click theme toggle
        theme_toggle.click()
        # Wait until theme changes
        WebDriverWait(self.driver, 10).until(
            lambda d: ("dark-mode" in d.find_element(By.TAG_NAME, "body").get_attribute("class")) != initial_is_dark
        )

        # Verify theme changed
        new_is_dark = "dark-mode" in self.driver.find_element(By.TAG_NAME, "body").get_attribute("class")
        self.assertNotEqual(initial_is_dark, new_is_dark, "Theme should toggle between light and dark")

    def test_language_toggle(self):
        """Test that the language toggle button switches between English and Japanese"""
        lang_toggle = self.driver.find_element(By.ID, "lang-toggle")

        # Get initial language state (check the search placeholder)
        search_input = self.driver.find_element(By.ID, "search-input")
        initial_placeholder = search_input.get_attribute("placeholder")

        # Click language toggle
        lang_toggle.click()
        # Wait until the placeholder changes
        WebDriverWait(self.driver, 10).until(
            lambda d: search_input.get_attribute("placeholder") != initial_placeholder
        )

        # Verify language changed (placeholder should be different)
        new_placeholder = search_input.get_attribute("placeholder")
        self.assertNotEqual(initial_placeholder, new_placeholder, "Language should toggle between EN and JP")

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

if __name__ == "__main__":
    unittest.main()
