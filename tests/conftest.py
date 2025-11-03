"""
Pytest configuration and shared fixtures for Pokedex tests.
Provides reusable test fixtures for HTTP server management and WebDriver setup.
"""
import os
import time
import threading
import http.server
import socketserver
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


class HTTPServerManager:
    """Manages HTTP server lifecycle for testing"""
    
    def __init__(self, port=8000):
        self.port = port
        self.httpd = None
        self.server_thread = None
        self.project_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
    
    def start(self):
        """Start the HTTP server on an available port"""
        handler = http.server.SimpleHTTPRequestHandler
        
        # Change to the project root directory
        os.chdir(self.project_root)
        
        # Find an available port
        for attempt_port in range(self.port, self.port + 10):
            try:
                self.httpd = socketserver.TCPServer(("", attempt_port), handler)
                self.port = attempt_port
                break
            except OSError:
                continue
        
        if self.httpd is None:
            raise RuntimeError(f"Could not start HTTP server on ports {self.port}-{self.port + 9}")
        
        # Start the server in a separate thread
        self.server_thread = threading.Thread(target=self.httpd.serve_forever)
        self.server_thread.daemon = True
        self.server_thread.start()
        
        # Give the server a moment to start
        time.sleep(1)
        
        return f"http://localhost:{self.port}"
    
    def stop(self):
        """Stop the HTTP server"""
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
        
        if self.server_thread:
            self.server_thread.join(timeout=5)


@pytest.fixture(scope="session")
def http_server():
    """
    Session-scoped fixture that provides an HTTP server.
    Automatically starts and stops the server for all tests.
    
    Returns:
        str: Base URL of the HTTP server (e.g., "http://localhost:8000")
    """
    server = HTTPServerManager(port=8000)
    base_url = server.start()
    yield base_url
    server.stop()


@pytest.fixture(scope="session")
def chrome_options():
    """
    Session-scoped fixture that provides Chrome options for headless testing.
    
    Returns:
        Options: Configured Chrome options
    """
    options = Options()
    options.add_argument("--allow-file-access-from-files")
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--window-size=1920,1080")
    options.add_argument(f"--user-data-dir=/tmp/chrome-user-data-{os.getpid()}")
    return options


@pytest.fixture(scope="class")
def driver(chrome_options):
    """
    Class-scoped fixture that provides a Chrome WebDriver instance.
    Automatically quits the driver after all tests in the class complete.
    
    Args:
        chrome_options: Chrome options from the chrome_options fixture
    
    Returns:
        WebDriver: Configured Chrome WebDriver instance
    """
    driver_instance = webdriver.Chrome(options=chrome_options)
    yield driver_instance
    driver_instance.quit()


@pytest.fixture(scope="function")
def app_url(http_server):
    """
    Function-scoped fixture that provides the application URL.
    Can be used by individual tests that need the base URL.
    
    Args:
        http_server: HTTP server fixture providing the base URL
    
    Returns:
        str: Base URL of the application
    """
    return http_server
