# Contributing to Pokédex

Thank you for your interest in contributing to the Pokédex project! This guide will help you get started.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style Guide](#code-style-guide)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pokedex.git
   cd pokedex
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Python 3.12+
- Modern web browser (Chrome/Firefox/Safari)
- Git

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start development server:**
   ```bash
   python3 -m http.server 8000
   ```

3. **Access the application:**
   Open http://localhost:8000 in your browser

### Data Management

The project uses pre-generated data from PokéAPI. You typically don't need to regenerate it, but if you do:

```bash
# Regenerate all data (takes ~10 minutes)
python pokeapi_fetch.py

# Fetch specific number of Pokémon
python pokeapi_fetch.py --count 151  # Gen 1 only

# Use test data for faster development
# The app automatically uses pokedex_data.json
```

See `DATA_FILES.md` for more information about data file variants.

## Project Structure

```
pokedex/
├── assets/
│   ├── js/
│   │   ├── components/      # UI components (cards, detail views, etc.)
│   │   ├── controllers/     # User input handlers (search, sort)
│   │   ├── managers/        # Core services (data, UI state)
│   │   └── utils/           # Helper functions (caching, routing, etc.)
│   └── style.css           # Global styles
├── tests/                  # Selenium-based integration tests
├── pokeapi_fetch.py       # Data generation script
├── pokeapi.py             # Data loader utility
└── index.html             # Main entry point
```

See `.github/copilot-instructions.md` for detailed architecture documentation.

## Code Style Guide

### JavaScript

- **Naming Conventions:**
  - Variables/Functions: `camelCase`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - HTML IDs/Classes: `kebab-case`

- **Modules:**
  - Use ES6 modules with named exports
  - Import constants from `constants.js`
  - Avoid circular dependencies

- **Example:**
  ```javascript
  // ✅ Good
  import { EVENTS, ELEMENT_IDS } from './constants.js';
  
  export class MyComponent {
      constructor() {
          this.element = document.getElementById(ELEMENT_IDS.MY_ELEMENT);
      }
      
      init() {
          // Implementation
      }
  }
  
  // ❌ Bad
  export default class MyComponent { ... }  // Don't use default exports
  const myElement = document.getElementById('my-element');  // Don't hardcode IDs
  ```

- **Async/Await:**
  - Always use `async/await` over `.then()/.catch()`
  - Handle errors with try-catch blocks

- **Comments:**
  - Use JSDoc for all exported functions
  - Include type information where helpful
  
  ```javascript
  /**
   * Fetches Pokemon data from cache or API
   * @param {number} id - Pokemon ID
   * @returns {Promise<Object>} Pokemon data object
   */
  async fetchPokemon(id) { ... }
  ```

### Python

- **Style:**
  - Follow PEP 8
  - Use `snake_case` for variables and functions
  - Use type hints for all functions

- **Example:**
  ```python
  # ✅ Good
  from typing import Dict, List, Optional
  
  def fetch_pokemon(pokemon_id: int) -> Optional[Dict[str, Any]]:
      """Fetch Pokemon data by ID."""
      # Implementation
  
  # ❌ Bad
  def fetchPokemon(pokemonId):  # Use snake_case, add type hints
      pass
  ```

- **Logging:**
  - Use the `logging` module, not `print()`
  - Use appropriate log levels: `info()`, `warning()`, `error()`

### HTML/CSS

- **Accessibility:**
  - Always include ARIA labels on interactive elements
  - Use semantic HTML (nav, main, article, section, etc.)
  - Support keyboard navigation (Tab, Enter, Escape)
  - Include screen reader only text with `.sr-only` class

- **Example:**
  ```html
  <!-- ✅ Good -->
  <button aria-label="Close modal" class="close-btn">
      <span aria-hidden="true">×</span>
  </button>
  
  <!-- ❌ Bad -->
  <div onclick="close()">X</div>
  ```

### Bilingual Support

All user-facing text must support both English and Japanese:

```javascript
// ✅ Store both languages
const pokemon = {
    name_en: "pikachu",
    name_ja: "ピカチュウ",
    name_ja_romaji: "pikachuu"
};

// Use UIController to get current language
const name = this.uiController.currentLanguage === 'en' 
    ? pokemon.name_en 
    : pokemon.name_ja;
```

## Testing

### Running Tests

```bash
# Run all tests
python run_tests.py

# Run specific test file
python run_tests.py tests/test_ui.py

# Run with coverage
make coverage

# Keep server running for debugging
python run_tests.py --keep-server
```

### Writing Tests

- Tests use pytest with unittest.TestCase (hybrid approach)
- Use shared fixtures from `tests/conftest.py`
- Test files should follow the pattern `test_*.py`

```python
import unittest
from tests.conftest import *

class TestMyFeature(unittest.TestCase):
    @pytest.mark.usefixtures('driver', 'app_url')
    def test_something(self, driver, app_url):
        driver.get(app_url)
        # Test implementation
```

See `KNOWN_TEST_FAILURES.md` for known environment-specific issues.

## Submitting Changes

### Before Submitting

1. **Run tests:**
   ```bash
   python run_tests.py
   ```

2. **Check for errors:**
   - Test in multiple browsers
   - Verify keyboard navigation works
   - Test both light and dark themes
   - Test both English and Japanese languages

3. **Run pre-commit hooks:**
   ```bash
   pre-commit run --all-files
   ```

### Pull Request Process

1. **Update documentation:**
   - Update README.md if adding features
   - Add JSDoc comments to new functions
   - Update CHANGELOG.md with your changes

2. **Create descriptive commit messages:**
   ```bash
   git commit -m "feat: add Pokemon comparison feature"
   git commit -m "fix: correct type effectiveness calculation"
   git commit -m "docs: update API documentation"
   ```

   Use conventional commit prefixes:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation only
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding/updating tests
   - `chore:` - Maintenance tasks

3. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a Pull Request:**
   - Describe what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes
   - Mark as draft if work is in progress

### Pull Request Checklist

- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commit messages are descriptive
- [ ] No console.log statements in production code
- [ ] Accessibility requirements met (ARIA labels, keyboard nav)
- [ ] Works in light and dark themes
- [ ] Works in both English and Japanese

## Reporting Issues

### Bug Reports

Include:
- **Description:** Clear description of the bug
- **Steps to Reproduce:** Numbered steps
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** Browser, OS, screen size
- **Screenshots:** If applicable

### Feature Requests

Include:
- **Problem:** What problem does this solve?
- **Proposed Solution:** How would you solve it?
- **Alternatives:** Other solutions considered
- **Additional Context:** Any other relevant information

## Common Issues

### Port Already in Use
If port 8000 is in use, try a different port:
```bash
python3 -m http.server 8001
```

### Tests Failing
See `KNOWN_TEST_FAILURES.md` for known environment-specific test issues.

### Data Loading Slow
Use the test data file for faster development:
```bash
# The app uses pokedex_data.json by default
# For testing with smaller dataset, temporarily rename files
mv pokedex_data.json pokedex_data_full.json
mv pokedex_data_test.json pokedex_data.json
```

## Questions?

- Check existing [issues](https://github.com/kiefertaylorland/pokedex/issues)
- Review `.github/copilot-instructions.md` for architectural details
- Read `DATA_SCHEMA.md` for data structure documentation

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

Thank you for contributing! 🎉
