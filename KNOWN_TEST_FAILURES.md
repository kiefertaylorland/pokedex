# Known Test Failures

**Document Created:** November 2, 2025  
**Purpose:** Document expected test failures and environment-specific issues

## Overview

This document tracks known test failures that may occur in specific environments or under certain conditions. These failures are typically related to timing issues, browser behavior differences, or environment-specific constraints rather than actual bugs in the application.

---

## Environment-Specific Failures

### 1. Focus Management Tests (test_transitions.py)

**Test:** `test_focus_management_in_modal`  
**Status:** May fail in headless mode or CI environments  
**Severity:** Low  
**Environment:** Headless Chrome, CI/CD pipelines

**Issue:**
Browser focus policies in headless mode may prevent automatic focus setting when modals open. The test verifies that the close button can receive focus manually if auto-focus fails.

**Expected Behavior:**
- In normal browser: Focus automatically moves to close button when modal opens
- In headless mode: Auto-focus may not work, but manual focus should succeed

**Workaround:**
Test is designed to pass in both scenarios - it accepts either automatic focus or successful manual focus as passing conditions.

**Example Error:**
```
AssertionError: Close button should either auto-focus or be manually focusable
```

**Fix:** None needed - test design accommodates this behavior

---

### 2. Server Port Conflicts

**Test:** Any test using HTTP server  
**Status:** May fail if port is already in use  
**Severity:** Medium  
**Environment:** Local development, CI environments with parallel tests

**Issue:**
Tests may fail if the default ports (8000-8009) are already in use by other processes.

**Expected Behavior:**
Tests should automatically find an available port in the range 8000-8009.

**Workaround:**
- Stop other processes using ports 8000-8009
- Use `run_tests.py --port <number>` to specify different port range
- Tests now use shared pytest fixtures which manage ports centrally

**Example Error:**
```
RuntimeError: Could not start HTTP server on ports 8000-8009
```

**Fix:** Ensure ports are available or kill processes:
```bash
# Find process using port
lsof -ti:8000

# Kill process (if safe to do so)
kill -9 $(lsof -ti:8000)
```

---

### 3. WebDriver Timeout Issues

**Test:** Various tests, especially in slow CI environments  
**Status:** May fail with timeout errors  
**Severity:** Low  
**Environment:** Slow machines, overloaded CI runners, network issues

**Issue:**
Tests use generous timeouts (10-20 seconds) but may still timeout on very slow systems or during heavy load.

**Expected Behavior:**
Page elements should load within timeout period.

**Workaround:**
- Increase WebDriverWait timeout values in tests
- Run tests on less loaded systems
- Check network connectivity for asset loading

**Example Error:**
```
TimeoutException: Message: 
selenium.common.exceptions.TimeoutException
```

**Fix:** Environment-specific - improve system performance or network speed

---

### 4. Chrome/Chromium Binary Not Found

**Test:** All Selenium tests  
**Status:** Fails if Chrome/Chromium not installed  
**Severity:** High  
**Environment:** Fresh installations, minimal Docker containers

**Issue:**
Selenium WebDriver requires Chrome or Chromium browser binary to be installed and in PATH.

**Expected Behavior:**
Chrome/Chromium should be available in system PATH.

**Workaround:**
Install Chrome or Chromium:

**macOS:**
```bash
brew install --cask google-chrome
# or
brew install chromium
```

**Linux:**
```bash
# Ubuntu/Debian
apt-get install chromium-browser

# Fedora
dnf install chromium
```

**Example Error:**
```
WebDriverException: Message: 'chromedriver' executable needs to be in PATH
```

**Fix:** Install Chrome/Chromium and ensure it's in PATH

---

### 5. Data Loading Race Conditions

**Test:** Tests that rely on Pokemon card rendering  
**Status:** Rare race condition failures  
**Severity:** Very Low  
**Environment:** Very slow systems or during high CPU load

**Issue:**
Tests wait for at least one Pokemon card to load, but on extremely slow systems, the 20-second timeout may be insufficient.

**Expected Behavior:**
Data file (pokedex_data.json) should load and render cards within 20 seconds.

**Workaround:**
- Use test data file (`pokedex_data_test.json`) for faster loading
- Increase timeout in test setup methods
- Check that HTTP server is serving files correctly

**Example Error:**
```
TimeoutException: No Pokemon cards loaded within timeout period
```

**Fix:** Use test data or increase timeout:
```python
WebDriverWait(self.driver, 30).until(  # Increased from 20
    lambda d: len(d.find_elements(By.CLASS_NAME, "pokemon-card")) > 0
)
```

---

## Platform-Specific Issues

### macOS

**Issue:** Chromium vs Chrome binary names  
**Impact:** WebDriver may not find browser  
**Fix:** Install Google Chrome (preferred) or set CHROME_BIN environment variable

### Linux

**Issue:** Missing display in headless environments  
**Impact:** Selenium fails to start  
**Fix:** Use Xvfb or ensure --headless flag is set (already configured in tests)

### Windows

**Issue:** File path separators in test setup  
**Impact:** Potential path resolution issues  
**Fix:** Tests use `os.path.join()` for cross-platform compatibility (already implemented)

---

## Test Data Issues

### Large Data File Performance

**Test:** All tests  
**Status:** Slower with production data  
**Severity:** Low  
**Environment:** All environments

**Issue:**
Using `pokedex_data.json` (2.9MB, 1025 Pokemon) causes slower test execution than `pokedex_data_test.json` (146KB, subset).

**Expected Behavior:**
Tests work with both files but are faster with test data.

**Workaround:**
Configure tests to use test data file for faster execution. This is currently not implemented but could be added.

**Future Enhancement:**
```python
# In conftest.py, add environment variable support
TEST_DATA_FILE = os.getenv('TEST_DATA_FILE', 'pokedex_data.json')
```

---

## CI/CD Specific Issues

### GitHub Actions

**Issue:** No pre-deployment test execution  
**Impact:** Broken code could deploy to production  
**Status:** Documented in issues.md #38  
**Fix:** Add test step to deployment workflow (pending)

---

## Running Tests Successfully

### Recommended Test Execution

**Quick tests (with test data):**
```bash
python run_tests.py tests/test_ui.py::TestPokedexUI::test_pokedex_interface_loads
```

**Full test suite:**
```bash
python run_tests.py
```

**With coverage:**
```bash
make coverage
```

**Keep server running for debugging:**
```bash
python run_tests.py --keep-server
```

### Debugging Test Failures

1. **Run specific failing test:**
   ```bash
   python run_tests.py tests/test_ui.py::TestPokedexUI::test_specific_test
   ```

2. **Remove headless mode for visual debugging:**
   Edit `tests/conftest.py` and comment out:
   ```python
   # options.add_argument("--headless")
   ```

3. **Check server is running:**
   ```bash
   curl http://localhost:8000
   ```

4. **Verify data file exists:**
   ```bash
   ls -lh pokedex_data.json
   ```

---

## Updating This Document

When adding new known failures:

1. Identify the specific test(s) affected
2. Document the environment/conditions where it fails
3. Provide clear workaround or fix instructions
4. Include example error messages
5. Rate severity: Very Low / Low / Medium / High

When a known failure is fixed:
1. Move entry to "Fixed Issues" section with date
2. Reference the commit/PR that fixed it

---

## Fixed Issues

None yet - this document was created on November 2, 2025.

---

## Statistics

- **Total Known Failures:** 5
- **Critical:** 1 (Chrome binary not found)
- **Medium:** 1 (Port conflicts)
- **Low:** 3 (Focus management, timeouts, data loading)
- **Very Low:** 0

---

## Additional Resources

- Main issues tracker: `issues.md`
- Test runner documentation: `run_tests.py --help`
- Copilot instructions: `.github/copilot-instructions.md`
- Data file documentation: `DATA_FILES.md`

**Last Updated:** November 2, 2025
