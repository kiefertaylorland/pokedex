#!/usr/bin/env python3
"""
Test runner for the Pokedex application.
Automatically starts and stops the HTTP server needed for Selenium tests.
"""

import os
import sys
import time
import signal
import subprocess
import threading
import http.server
import socketserver
from contextlib import contextmanager
import requests

class TestRunner:
    def __init__(self, port=8001):
        self.port = port
        self.server_process = None
        self.server_url = f"http://localhost:{port}"

    def is_server_running(self):
        """Check if the server is already running on the port"""
        try:
            response = requests.get(self.server_url, timeout=2)
            return response.status_code == 200
        except requests.exceptions.RequestException:
            return False

    def start_server(self):
        """Start the HTTP server in a subprocess"""
        if self.is_server_running():
            print(f"Server already running on {self.server_url}")
            return True

        print(f"Starting HTTP server on port {self.port}...")

        try:
            # Start server as subprocess
            self.server_process = subprocess.Popen(
                [sys.executable, "-m", "http.server", str(self.port)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=os.path.dirname(os.path.abspath(__file__))
            )

            # Wait for server to start
            for i in range(30):  # Wait up to 30 seconds
                if self.is_server_running():
                    print(f"✓ Server started successfully at {self.server_url}")
                    return True
                time.sleep(1)

            print("✗ Failed to start server")
            self.stop_server()
            return False

        except Exception as e:
            print(f"✗ Error starting server: {e}")
            return False

    def stop_server(self):
        """Stop the HTTP server"""
        if self.server_process:
            print("Stopping HTTP server...")
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.server_process.kill()
                self.server_process.wait()
            except Exception as e:
                print(f"Warning: Error stopping server: {e}")
            finally:
                self.server_process = None

    def run_tests(self, test_args=None):
        """Run the test suite"""
        if test_args is None:
            test_args = []

        cmd = [sys.executable, "-m", "pytest", "tests/", "-v"] + test_args
        print(f"Running tests: {' '.join(cmd)}")

        try:
            result = subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
            return result.returncode == 0
        except Exception as e:
            print(f"✗ Error running tests: {e}")
            return False

@contextmanager
def test_environment():
    """Context manager for test environment setup and teardown"""
    runner = TestRunner()
    server_started = False

    try:
        # Check if server is already running
        if not runner.is_server_running():
            if not runner.start_server():
                raise RuntimeError("Failed to start HTTP server")
            server_started = True

        yield runner

    finally:
        # Only stop server if we started it
        if server_started:
            runner.stop_server()

def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Run Pokedex tests with automatic server management")
    parser.add_argument("--port", type=int, default=8001, help="HTTP server port (default: 8001)")
    parser.add_argument("--keep-server", action="store_true", help="Keep server running after tests")

    # Parse known args to allow pytest arguments to pass through
    args, unknown_args = parser.parse_known_args()

    # Combine any remaining arguments as test arguments
    test_args = unknown_args

    if args.keep_server:
        # Run tests with persistent server
        runner = TestRunner(args.port)
        if not runner.start_server():
            sys.exit(1)

        success = runner.run_tests(test_args)
        print(f"\nServer is still running at http://localhost:{args.port}")
        print("Press Ctrl+C to stop the server when done.")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            runner.stop_server()
            print("\nServer stopped.")

        sys.exit(0 if success else 1)
    else:
        # Run tests with automatic server lifecycle
        try:
            with test_environment() as runner:
                runner.port = args.port
                success = runner.run_tests(test_args)
                sys.exit(0 if success else 1)
        except Exception as e:
            print(f"✗ Test execution failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()
