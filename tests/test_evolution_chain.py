"""
Test evolution chain functionality - clicking evolution items should update detail view
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import os
import unittest
import time
import threading
import http.server
import socketserver


class TestEvolutionChain(unittest.TestCase):
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
        
        # Initialize Chrome WebDriver
        chrome_options = Options()
        chrome_options.add_argument("--allow-file-access-from-files")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument(f"--user-data-dir=/tmp/chrome-user-data-{os.getpid()}")
        cls.driver = webdriver.Chrome(options=chrome_options)

        # Use localhost server
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
        # Wait for the page to load completely
        WebDriverWait(self.driver, 20).until(
            EC.presence_of_element_located((By.ID, "pokedex-grid"))
        )
        # Wait until at least one Pokémon card is loaded
        WebDriverWait(self.driver, 20).until(
            lambda d: len(d.find_elements(By.CLASS_NAME, "pokemon-card")) > 0
        )

    def test_evolution_chain_items_are_clickable(self):
        """Test that non-current evolution items are clickable"""
        # Find and click a Pokemon card (Charmander #4 has an evolution chain)
        cards = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")
        charmander_card = None
        for card in cards:
            if "Charmander" in card.text or "#004" in card.text:
                charmander_card = card
                break
        
        if not charmander_card:
            self.skipTest("Charmander card not found")
        
        charmander_card.click()
        
        # Wait for detail view to appear
        detail_view = WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "pokemon-detail-view"))
        )
        
        # Wait for evolution chain to load
        evolution_items = WebDriverWait(self.driver, 10).until(
            lambda d: d.find_elements(By.CLASS_NAME, "evolution-item")
        )
        
        self.assertGreater(len(evolution_items), 1, "Evolution chain should have multiple items")
        
        # Find a non-current evolution item (should have role="button")
        clickable_evolution = None
        for item in evolution_items:
            if item.get_attribute('role') == 'button':
                clickable_evolution = item
                break
        
        self.assertIsNotNone(clickable_evolution, "Should have at least one clickable evolution item")
        
        # Verify cursor pointer style
        cursor_style = clickable_evolution.value_of_css_property('cursor')
        self.assertEqual(cursor_style, 'pointer', "Clickable evolution item should have pointer cursor")

    def test_clicking_evolution_item_updates_detail_view(self):
        """Test that clicking an evolution item updates the detail view"""
        # Find and click a Pokemon card (Charmander #4)
        cards = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")
        charmander_card = None
        for card in cards:
            if "Charmander" in card.text or "#004" in card.text:
                charmander_card = card
                break
        
        if not charmander_card:
            self.skipTest("Charmander card not found")
        
        charmander_card.click()
        
        # Wait for detail view to appear
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "pokemon-detail-view"))
        )
        
        # Get the current Pokemon name
        initial_name = self.driver.find_element(By.CLASS_NAME, "pokemon-detail-name").text
        self.assertIn("Charmander", initial_name)
        
        # Wait for evolution chain to load
        evolution_items = WebDriverWait(self.driver, 10).until(
            lambda d: d.find_elements(By.CLASS_NAME, "evolution-item")
        )
        
        # Find a clickable evolution item (not current)
        clickable_evolution = None
        for item in evolution_items:
            if item.get_attribute('role') == 'button':
                clickable_evolution = item
                break
        
        if not clickable_evolution:
            self.skipTest("No clickable evolution item found")
        
        # Get the evolution name before clicking
        evolution_name = clickable_evolution.find_element(By.CLASS_NAME, "evolution-name").text
        
        # Click the evolution item
        clickable_evolution.click()
        
        # Wait for the detail view to update (small delay for transition)
        time.sleep(0.5)
        
        # Check that the Pokemon name has changed
        updated_name = self.driver.find_element(By.CLASS_NAME, "pokemon-detail-name").text
        self.assertIn(evolution_name, updated_name, 
                     f"Detail view should now show {evolution_name}")
        self.assertNotEqual(initial_name, updated_name, 
                          "Pokemon name should have changed after clicking evolution")

    def test_keyboard_navigation_on_evolution_items(self):
        """Test that evolution items can be activated via keyboard (Enter key)"""
        # Find and click a Pokemon card (Charmander #4)
        cards = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")
        charmander_card = None
        for card in cards:
            if "Charmander" in card.text or "#004" in card.text:
                charmander_card = card
                break
        
        if not charmander_card:
            self.skipTest("Charmander card not found")
        
        charmander_card.click()
        
        # Wait for detail view
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "pokemon-detail-view"))
        )
        
        # Get initial name
        initial_name = self.driver.find_element(By.CLASS_NAME, "pokemon-detail-name").text
        
        # Wait for evolution chain
        evolution_items = WebDriverWait(self.driver, 10).until(
            lambda d: d.find_elements(By.CLASS_NAME, "evolution-item")
        )
        
        # Find a clickable evolution item
        clickable_evolution = None
        for item in evolution_items:
            if item.get_attribute('role') == 'button':
                clickable_evolution = item
                break
        
        if not clickable_evolution:
            self.skipTest("No clickable evolution item found")
        
        # Get the evolution name
        evolution_name = clickable_evolution.find_element(By.CLASS_NAME, "evolution-name").text
        
        # Focus and press Enter
        clickable_evolution.send_keys(Keys.ENTER)
        
        # Wait for update
        time.sleep(0.5)
        
        # Check that the Pokemon name has changed
        updated_name = self.driver.find_element(By.CLASS_NAME, "pokemon-detail-name").text
        self.assertIn(evolution_name, updated_name, 
                     f"Detail view should now show {evolution_name} after Enter key")

    def test_current_evolution_item_is_not_clickable(self):
        """Test that the current Pokemon in evolution chain is not clickable"""
        # Find and click a Pokemon card
        cards = self.driver.find_elements(By.CLASS_NAME, "pokemon-card")
        charmander_card = None
        for card in cards:
            if "Charmander" in card.text or "#004" in card.text:
                charmander_card = card
                break
        
        if not charmander_card:
            self.skipTest("Charmander card not found")
        
        charmander_card.click()
        
        # Wait for detail view
        WebDriverWait(self.driver, 10).until(
            EC.visibility_of_element_located((By.ID, "pokemon-detail-view"))
        )
        
        # Wait for evolution chain
        evolution_items = WebDriverWait(self.driver, 10).until(
            lambda d: d.find_elements(By.CLASS_NAME, "evolution-item")
        )
        
        # Find the current evolution item (should have class 'current')
        current_item = None
        for item in evolution_items:
            if 'current' in item.get_attribute('class'):
                current_item = item
                break
        
        self.assertIsNotNone(current_item, "Should have a current evolution item")
        
        # Verify it doesn't have role="button"
        role = current_item.get_attribute('role')
        self.assertNotEqual(role, 'button', 
                          "Current evolution item should not be a button")
        
        # Verify it doesn't have tabindex
        tabindex = current_item.get_attribute('tabindex')
        self.assertIsNone(tabindex, 
                        "Current evolution item should not be focusable via tab")


if __name__ == '__main__':
    unittest.main()
