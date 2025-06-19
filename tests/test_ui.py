from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import os
import unittest
import time
import threading
import http.server
import socketserver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

class TestPokedexUI(unittest.TestCase):
    httpd = None
    server_thread = None
    
    @classmethod
    def setUpClass(cls):
        # Start a local HTTP server to serve the files
        port = 8000
        handler = http.server.SimpleHTTPRequestHandler
        
        # Change to the project root directory
        project_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
        os.chdir(project_root)
        
        # Find an available port
        for attempt_port in range(port, port + 10):
            try:
                cls.httpd = socketserver.TCPServer(("", attempt_port), handler)
                port = attempt_port
                break
            except OSError:
                continue
        
        if cls.httpd is None:
            raise RuntimeError("Could not start HTTP server on any port")
        
        # Start the server in a separate thread
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()
        
        # Give the server a moment to start
        time.sleep(1)
        
        # Initialize Chrome WebDriver with file access enabled and headless mode for CI
        chrome_options = Options()
        chrome_options.add_argument("--allow-file-access-from-files")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-background-timer-throttling")
        chrome_options.add_argument("--disable-backgrounding-occluded-windows")
        chrome_options.add_argument("--disable-renderer-backgrounding")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument(f"--user-data-dir=/tmp/chrome-user-data-{os.getpid()}")
        cls.driver = webdriver.Chrome(options=chrome_options)

        # Use localhost server instead of file:// protocol to avoid CORS issues
        cls.index_path = f"http://localhost:{port}"
    
    @classmethod
    def tearDownClass(cls):
        # Clean up the driver
        if cls.driver:
            cls.driver.quit()
        
        # Stop the HTTP server
        if cls.httpd:
            cls.httpd.shutdown()
            cls.httpd.server_close()
        
        # Wait for the server thread to finish
        if cls.server_thread:
            cls.server_thread.join(timeout=5)

    def setUp(self):
        self.driver.get(self.index_path)
        # Wait for the page to load completely with increased timeout for CI
        WebDriverWait(self.driver, 20).until(
            EC.presence_of_element_located((By.ID, "pokedex-grid"))
        )
        # Wait until at least one Pokémon card is loaded with increased timeout
        WebDriverWait(self.driver, 20).until(
            lambda d: len(d.find_elements(By.CLASS_NAME, "pokemon-card")) > 0
        )

    def test_pokedex_interface_loads(self):
        """Test that the Pokédex interface loads properly"""
        # Verify essential elements are present
        self.assertTrue(self.driver.find_element(By.ID, "app-title").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "search-input").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "theme-toggle").is_displayed())
        self.assertTrue(self.driver.find_element(By.ID, "lang-toggle").is_displayed())

        # Verify Pokémon cards are loaded
        pokemon_cards = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")
        self.assertGreater(len(pokemon_cards), 0, "At least one Pokémon card should be loaded")

        # Verify the grid exists and contains cards
        pokedex_grid = self.driver.find_element(By.ID, "pokedex-grid")
        self.assertTrue(pokedex_grid.is_displayed())

    def test_search_functionality(self):
        """Test that the search functionality filters Pokémon correctly"""
        search_input = self.driver.find_element(By.ID, "search-input")

        # Verify all cards are visible initially
        initial_cards = self.driver.find_elements(By.CSS_SELECTOR, ".pokemon-card:not(.hidden)")
        self.assertGreater(len(initial_cards), 0, "Should have visible cards initially")

        # Search for "Pikachu"
        search_input.clear()
        search_input.send_keys("Pikachu")

        # Wait until the search filters are applied and fewer cards remain
        WebDriverWait(self.driver, 15).until(
            lambda d: len(d.find_elements(By.CSS_SELECTOR, ".pokemon-card:not(.hidden)")) < len(initial_cards)
        )

        # Verify that search results are displayed
        visible_cards = self.driver.find_elements(By.CSS_SELECTOR, ".pokemon-card:not(.hidden)")
        self.assertGreater(len(visible_cards), 0, "Should have at least one card matching 'Pikachu'")
        
        # Verify the visible card contains "Pikachu" (in either English or Japanese)
        card_names = [card.find_element(By.CSS_SELECTOR, "h3").text for card in visible_cards]
        has_pikachu = any("pikachu" in name.lower() or "ピカチュウ" in name for name in card_names)
        self.assertTrue(has_pikachu, f"Should find Pikachu in search results. Found: {card_names}")

    def test_pokemon_detail_view(self):
        """Test that clicking a Pokémon card opens the detail view"""
        # Click on the first Pokémon card
        first_card = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")[0]
        first_card.click()

        # Wait until detail view appears with increased timeout
        detail_view = WebDriverWait(self.driver, 15).until(
            EC.presence_of_element_located((By.ID, "pokemon-detail-view"))
        )

        # Wait until detail view has the 'show' class
        WebDriverWait(self.driver, 15).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )

        # Verify detail view is visible and contains expected elements
        self.assertIn("show", detail_view.get_attribute("class"), "Detail view should have 'show' class")
        self.assertTrue(self.driver.find_element(By.CSS_SELECTOR, "#pokemon-detail-view h2").is_displayed())
        self.assertTrue(self.driver.find_element(By.CSS_SELECTOR, "#pokemon-detail-view img").is_displayed())

        # Test closing the detail view
        close_button = self.driver.find_element(By.ID, "close-detail-view")
        close_button.click()

        # Wait until detail view loses the 'show' class
        WebDriverWait(self.driver, 15).until(
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
        WebDriverWait(self.driver, 15).until(
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
        WebDriverWait(self.driver, 15).until(
            lambda d: search_input.get_attribute("placeholder") != initial_placeholder
        )

        # Verify language changed (placeholder should be different)
        new_placeholder = search_input.get_attribute("placeholder")
        self.assertNotEqual(initial_placeholder, new_placeholder, "Language should toggle between EN and JP")

if __name__ == '__main__':
    unittest.main()
