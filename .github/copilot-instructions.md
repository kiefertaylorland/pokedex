# Copilot Instructions for Pokedex Project

## Project Overview

This is an interactive web application showcasing all 1025 Pokémon (Generations I-IX) with detailed information, bilingual support (English/Japanese), and modern accessibility features. The application is deployed on GitHub Pages at [www.pokedex.tech](https://www.pokedex.tech).

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6 modules)
- **Data Source**: [PokéAPI](https://pokeapi.co/)
- **Backend/Scripts**: Python 3.12+
- **Testing**: pytest with Selenium for UI tests
- **Deployment**: GitHub Pages (automated via GitHub Actions)

## Project Structure

```
pokedex/
├── .github/
│   ├── workflows/deploy.yml    # GitHub Pages deployment workflow
│   └── agents/                 # Custom agent configurations
├── assets/
│   ├── pokemon/               # Pokémon images and cries
│   └── screenshots/           # Documentation screenshots
├── tests/                     # Test suite (pytest + Selenium)
├── index.html                 # Main application entry point
├── script.js                  # Frontend JavaScript logic
├── pokedex_data.json         # Pokémon data (generated from PokéAPI)
├── pokeapi_fetch.py          # Script to fetch data from PokéAPI
├── transform_pokemon_data.py # Data transformation utilities
├── add_romaji.py             # Adds Japanese romanization to data
├── run_tests.py              # Test runner with automatic server management
└── requirements.txt          # Python dependencies
```

## Key Features

- 1025 Pokémon with comprehensive data (stats, types, moves, evolution chains)
- Pokémon cries for authentic experience
- Bilingual support (English/Japanese)
- Light and dark theme toggle
- Search by name, ID, or type
- Full keyboard navigation and screen reader support
- Responsive design for all devices

## Development Workflow

### Initial Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start local development server
python3 -m http.server 8000

# Access the application
# Open http://localhost:8000 in your browser
```

### Running Tests

```bash
# Run all tests (automatically starts/stops HTTP server)
python run_tests.py

# Run specific test file
python run_tests.py tests/test_ui.py

# Keep server running after tests
python run_tests.py --keep-server

# Run tests with custom port
python run_tests.py --port 8080
```

### Data Management

```bash
# Regenerate Pokémon data from PokéAPI
# This fetches data for all 1025 Pokémon including stats, types, moves, evolution chains, and cries
python pokeapi_fetch.py
```

### Code Quality

```bash
# Run linting with pre-commit hooks
pre-commit run --all-files

# The project uses:
# - trailing-whitespace: Ensures no trailing whitespace
# - end-of-file-fixer: Ensures files end with a newline
```

## Testing Guidelines

### Test Infrastructure

- **Framework**: pytest with Selenium WebDriver
- **Browser**: Chrome/Chromium (headless mode in CI)
- **Test Runner**: `run_tests.py` provides automatic HTTP server lifecycle management
- **Test Location**: All tests are in the `tests/` directory

### Test Categories

1. **UI Tests** (`test_ui.py`): Test the main user interface, search functionality, theme switching
2. **Transitions** (`test_transitions.py`): Test animations, image loading, and view transitions
3. **API Tests** (`test_pokeapi.py`, `test_pokeapi_fetch.py`): Test data fetching and API integration
4. **Integration Tests** (`test_pokeapi_integration.py`): Test end-to-end data flows

### Known Test Status

Some tests may fail due to timing issues or environment-specific conditions. Focus on:
- Not breaking passing tests
- Fixing only tests related to your changes
- Using appropriate wait conditions for Selenium tests

## Coding Conventions

### JavaScript

- Use ES6 modules and modern JavaScript features
- Use `const` and `let` instead of `var`
- Follow existing naming conventions:
  - camelCase for functions and variables
  - kebab-case for CSS classes and HTML IDs
- Add JSDoc comments for complex functions
- Maintain accessibility features (ARIA labels, keyboard navigation)

### Python

- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for classes and functions
- Keep functions focused and single-purpose

### HTML/CSS

- Use semantic HTML5 elements
- Maintain responsive design principles
- Support both light and dark themes
- Ensure accessibility (WCAG 2.1 AA compliance)
- Use BEM-like naming for CSS classes when adding new components

### Accessibility Requirements

- Always include proper ARIA labels and roles
- Ensure keyboard navigation works (Tab, Enter, Escape, Arrow keys)
- Support screen readers
- Maintain proper heading hierarchy
- Provide text alternatives for images

## Common Development Tasks

### Adding a New Pokémon Feature

1. Update data fetching logic in `pokeapi_fetch.py` if needed
2. Modify data transformation in `transform_pokemon_data.py`
3. Update frontend JavaScript in `script.js`
4. Add/update HTML structure in `index.html` if needed
5. Write tests in appropriate test file
6. Verify accessibility features

### Modifying the UI

1. Make changes to HTML/CSS/JavaScript
2. Test in both light and dark themes
3. Verify keyboard navigation still works
4. Test on different screen sizes (responsive design)
5. Add/update Selenium tests if needed
6. Run full test suite to ensure nothing broke

### Updating Data

1. Modify `pokeapi_fetch.py` to change what data is fetched
2. Update `transform_pokemon_data.py` if data structure changes
3. Run `python pokeapi_fetch.py` to regenerate `pokedex_data.json`
4. Update frontend code to handle new data structure
5. Test thoroughly with real data

## Important Files

- **index.html**: Main application structure and layout
- **script.js**: All frontend JavaScript logic, event handlers, search, filtering
- **pokedex_data.json**: Pre-generated Pokémon data (don't manually edit)
- **pokeapi_fetch.py**: Data fetching script (run to update data)
- **run_tests.py**: Test runner with built-in HTTP server management

## Dependencies

### Python Dependencies

- `requests`: HTTP library for API calls
- `selenium`: Browser automation for UI testing
- `pytest`: Testing framework

### Frontend Dependencies

No external JavaScript libraries - vanilla JavaScript only. This is intentional to:
- Keep the application lightweight
- Minimize external dependencies
- Maintain full control over functionality

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow is defined in `.github/workflows/deploy.yml`.

### Deployment Process

1. Push to `main` branch
2. GitHub Actions runs the deploy workflow
3. Static files are uploaded to GitHub Pages
4. Site is live at www.pokedex.tech

No build step is required as the application uses vanilla HTML/CSS/JavaScript.

## Best Practices for Changes

1. **Keep it minimal**: Make the smallest possible changes to achieve your goal
2. **Test early and often**: Run tests after making changes
3. **Maintain accessibility**: Never compromise keyboard navigation or screen reader support
4. **Preserve bilingual support**: Ensure both English and Japanese text work correctly
5. **Check both themes**: Test changes in both light and dark mode
6. **Verify responsiveness**: Test on different screen sizes
7. **Don't break the data pipeline**: If modifying data scripts, verify `pokeapi_fetch.py` still works
8. **Follow existing patterns**: Look at existing code for style and structure guidance

## Troubleshooting

### Tests Failing

- Ensure HTTP server is running (run_tests.py handles this automatically)
- Check that Chrome/Chromium is installed for Selenium tests
- Some tests may have timing issues - focus on tests related to your changes

### Data Issues

- Regenerate data with `python pokeapi_fetch.py` if data seems corrupted
- Check network connectivity for PokéAPI access
- Verify `pokedex_data.json` is valid JSON

### UI Issues

- Check browser console for JavaScript errors
- Verify data is loading correctly (check Network tab)
- Test in different browsers if behavior is inconsistent

## Notes for AI Assistants

- The project has some existing test failures unrelated to new changes - don't fix unrelated issues
- Always verify accessibility features when modifying the UI
- The application uses vanilla JavaScript intentionally - don't add frameworks like React or Vue
- Data in `pokedex_data.json` is generated - modify the fetch scripts instead of editing directly
- Pre-commit hooks check for trailing whitespace and end-of-file issues
- The custom doc-sync-agent handles documentation-related tasks
