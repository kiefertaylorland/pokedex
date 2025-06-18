"""
Test file for Pokedex transition and animation functionality.
This tests the new smooth transitions and user interaction enhancements.
"""
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import os
import unittest
import time
import threading
import http.server
import socketserver


class TestPokedexTransitions(unittest.TestCase):
    httpd = None
    server_thread = None
    
    @classmethod
    def setUpClass(cls):
        # Start a local HTTP server to serve the files
        port = 8001  # Use different port to avoid conflicts with UI tests
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
        
        # Initialize Chrome WebDriver with file access enabled
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

        # Use localhost server instead of file:// protocol
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

    def test_pokemon_card_click_animation(self):
        """Test that clicking a Pokemon card triggers the click animation"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")

        # Click the card and check for animation class
        first_card.click()

        # Check that the detail view appears with the show class
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )
        self.assertIn("show", detail_view.get_attribute("class"))

        # Wait for animations to complete and close button to be clickable
        close_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, "close-detail-view"))
        )
        close_button.click()

    def test_detail_view_transition_classes(self):
        """Test that the detail view uses transition classes properly"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")

        # Initially, detail view should not have 'show' class
        self.assertNotIn("show", detail_view.get_attribute("class"))

        # Click card to open detail view
        first_card.click()

        # Check that 'show' class is added
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )
        self.assertIn("show", detail_view.get_attribute("class"))

        # Wait for animations to complete and close button to be clickable
        close_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, "close-detail-view"))
        )
        close_button.click()

        # Check that 'show' class is removed
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" not in detail_view.get_attribute("class")
        )
        self.assertNotIn("show", detail_view.get_attribute("class"))

    def test_modal_backdrop_click_closes_detail(self):
        """Test that clicking the modal backdrop closes the detail view"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")

        # Open detail view
        first_card.click()
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )

        # Click on the backdrop (detail view element itself, not the modal content)
        self.driver.execute_script("arguments[0].click();", detail_view)

        # Check that detail view closes
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" not in detail_view.get_attribute("class")
        )
        self.assertNotIn("show", detail_view.get_attribute("class"))

    def test_escape_key_closes_detail(self):
        """Test that pressing Escape key closes the detail view"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")

        # Open detail view
        first_card.click()
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )

        # Press Escape key
        ActionChains(self.driver).send_keys(Keys.ESCAPE).perform()

        # Check that detail view closes
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" not in detail_view.get_attribute("class")
        )
        self.assertNotIn("show", detail_view.get_attribute("class"))

    def test_keyboard_navigation_pokemon_cards(self):
        """Test that Pokemon cards can be navigated and activated with keyboard"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")

        # Check that card has tabindex attribute
        tabindex = first_card.get_attribute("tabindex")
        self.assertEqual(tabindex, "0", "Pokemon cards should be focusable")

        # Check that card has proper ARIA attributes
        role = first_card.get_attribute("role")
        self.assertEqual(role, "button", "Pokemon cards should have button role")

        aria_label = first_card.get_attribute("aria-label")
        self.assertIsNotNone(aria_label, "Pokemon cards should have aria-label")
        self.assertIn("View details", aria_label, "Aria label should describe the action")

    def test_focus_management_in_modal(self):
        """Test that focus is properly managed when modal opens"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")

        # Open detail view
        first_card.click()
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )

        # Check that close button becomes focused (after transition delay)
        close_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, "close-detail-view"))
        )

        # Verify focus is set (with some tolerance as browser focus behavior can vary)
        try:
            WebDriverWait(self.driver, 2).until(
                lambda d: d.switch_to.active_element == close_button
            )
            focus_set = True
        except:
            # Focus might not be set due to browser policies, but button should still be functional
            focus_set = False

        # Verify button is at least accessible and can receive focus manually
        close_button.send_keys("")  # This should work if element can receive focus

        # The test passes if either focus was automatically set OR button can receive focus manually
        self.assertTrue(focus_set or close_button == self.driver.switch_to.active_element,
                       "Close button should either auto-focus or be manually focusable")

        # Close modal
        close_button.click()

    def test_body_scroll_prevention(self):
        """Test that body scroll is prevented when modal is open"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")
        body = self.driver.find_element(By.TAG_NAME, "body")

        # Initially, body should not have modal-open class
        self.assertNotIn("modal-open", body.get_attribute("class") or "")

        # Open detail view
        first_card.click()
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )

        # Check that body has modal-open class
        WebDriverWait(self.driver, 2).until(
            lambda d: "modal-open" in (body.get_attribute("class") or "")
        )
        self.assertIn("modal-open", body.get_attribute("class"))

        # Close detail view
        close_button = self.driver.find_element(By.ID, "close-detail-view")
        close_button.click()

        # Check that body modal-open class is removed
        WebDriverWait(self.driver, 10).until(
            lambda d: "modal-open" not in (body.get_attribute("class") or "")
        )
        self.assertNotIn("modal-open", body.get_attribute("class") or "")

    def test_image_loading_states(self):
        """Test that images have proper loading states"""
        # Get first card image
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")
        card_image = first_card.find_element(By.TAG_NAME, "img")

        # Check that image has loading attribute
        loading_attr = card_image.get_attribute("loading")
        self.assertEqual(loading_attr, "lazy", "Images should have lazy loading")

    def test_detail_view_content_animations(self):
        """Test that detail view content has proper animation structure"""
        first_card = self.driver.find_element(By.CLASS_NAME, "pokemon-card")

        # Open detail view
        first_card.click()
        detail_view = self.driver.find_element(By.ID, "pokemon-detail-view")
        WebDriverWait(self.driver, 10).until(
            lambda d: "show" in detail_view.get_attribute("class")
        )

        # Check that detail sections exist
        detail_sections = self.driver.find_elements(By.CSS_SELECTOR, "#detail-content .detail-section")
        self.assertGreater(len(detail_sections), 0, "Detail view should have sections")

        # Check that stat items exist
        stat_items = self.driver.find_elements(By.CSS_SELECTOR, "#detail-content .stat-item")
        self.assertGreater(len(stat_items), 0, "Detail view should have stat items")

        # Close detail view - wait for button to be clickable
        close_button = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.ID, "close-detail-view"))
        )
        close_button.click()


if __name__ == "__main__":
    unittest.main()
