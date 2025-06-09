# Pokédex

![Pokemon Pokedex logo](https://henryjimenezp.github.io/P4-Pokedex/img/pokedex-logo.png)

**A simple Pokédex application using data from the [PokéAPI](https://pokeapi.co/).**

![PokeAPI logo](https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi_256.png)

## Features

- Fetches data for the original 151 Pokémon (Generation I).
- Displays detailed Pokémon information, including:
  - Names in English and Japanese.
  - Types, stats, and moves.
  - Bios/Flavor texts from games.
- **Modern Modular Architecture**:
  - Clean separation of concerns with 8 focused JavaScript modules
  - Maintainable, testable, and extensible codebase
  - ES6 modules with proper import/export structure
  - Comprehensive JSDoc documentation
- **Security & Performance**:
  - XSS protection with input sanitization
  - Debounced search to prevent excessive API calls
  - Lazy loading for images and optimized DOM manipulation
  - Content Security Policy headers
- **Accessibility Compliance**:
  - Full ARIA support with landmarks, labels, and live regions
  - Keyboard navigation (Tab, Enter, Space, Escape)
  - Screen reader compatibility with announcements
  - Skip links and focus management
  - High contrast and reduced motion support
- **Smooth Transitions & Animations**:
  - Fluid modal transitions with backdrop blur effects
  - Staggered content animations for stats and moves
  - Card click animations with scale transformations
  - Hardware-accelerated animations for optimal performance
- **Enhanced User Experience**:
  - Keyboard navigation support (Enter/Space to open, Escape to close)
  - Focus management for accessibility compliance
  - Body scroll prevention when modal is open
  - Click animation feedback on interactive elements
- Responsive design with light and dark themes.
- Multi-language support (English and Japanese).
- Search functionality to find Pokémon by name or ID.
- Interactive UI for viewing Pokémon details.

## Technologies Used

- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6+ modules)
- **Architecture**: Modular JavaScript with separation of concerns
- **Security**: XSS protection, input validation, CSP headers
- **Accessibility**: ARIA, WCAG 2.1 AA compliance, keyboard navigation
- **Backend/Logic**: Python for fetching and processing data from the PokéAPI
- **Testing**: Python's unittest and pytest modules for comprehensive testing
- **Quality Assurance**: Automated frontend validation and code quality checks

## Project Structure

- `pokedex/`
  - `index.html` - Main HTML file with accessibility features
  - `script.js` - Legacy compatibility layer
  - `Makefile` - Build and test automation
  - `pokeapi_fetch.py` - Data fetching utilities
  - `pokeapi.py` - API interaction module
  - `pokedex_data.json` - Pre-fetched Pokemon data
  - `README.md` - Project documentation
  - `REFACTORING_DOCUMENTATION.md` - Detailed refactoring guide
  - `requirements.txt` - Python dependencies
  - `run_tests.py` - Automated test runner
  - `validate_frontend.py` - Frontend validation script
  - `assets/`
    - `style.css` - Enhanced CSS with accessibility features
    - `Poke_Ball_icon.png` - App favicon
    - `js/` - **Modular JavaScript Architecture**
      - `constants.js` - Application constants and configuration
      - `pokedexApp.js` - Main application orchestrator
      - `components/`
        - `pokemonCardRenderer.js` - Pokemon card rendering logic
        - `pokemonDetailView.js` - Detail modal management
      - `controllers/`
        - `searchController.js` - Search functionality controller
      - `managers/`
        - `dataManager.js` - Pokemon data management
        - `uiController.js` - UI state and theme management
      - `utils/`
        - `security.js` - Security utilities and XSS protection
    - `pokemon/`
      - `cries/latest/` - Pokemon sound files
  - `tests/`
    - `test_pokeapi_fetch.py` - API fetching tests
    - `test_pokeapi_integration.py` - Integration tests
    - `test_pokeapi.py` - API unit tests
    - `test_transitions.py` - Animation and transition tests
    - `test_ui.py` - UI functionality tests

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**

    ```bash
    git clone https://github.com/kiefertaylorland/pokedex.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd pokedex
    ```

3. **Set up a Python virtual environment (recommended):**

    This helps manage project dependencies without affecting your global Python installation.

    - Create a virtual environment (e.g., named `venv`):

        ```bash
        python3 -m venv venv
        ```

        (Use `python -m venv venv` if `python3` is not available)

    - Activate the virtual environment:
        - On macOS and Linux:

            ```bash
            source venv/bin/activate
            ```

        - On Windows (Git Bash or similar):

            ```bash
            source venv/Scripts/activate
            ```

        - On Windows (Command Prompt or PowerShell):

            ```bash
            .\venv\Scripts\activate
            ```

        Your command prompt should now indicate that you are in the `(venv)` environment.

    - **Important:** Ensure `venv/` (or your chosen virtual environment directory name) is added to your `.gitignore` file to prevent it from being committed to version control.

4. **Install dependencies:**

    With the virtual environment activated, install the required Python packages:

    ```bash
    pip install -r requirements.txt
    ```

5. **Host the application locally:**

    ```bash
    python3 -m http.server 8000
    ```

    (Use `python -m http.server 8000` if `python3` is not available)

6. **Open a web browser and navigate to:**

    ```bash
    localhost:8000
    ```

7. **Stop the local server** once you are done exploring the application:

    Press `Ctrl + C` in the terminal where the server is running.

8. **Deactivate the virtual environment** when you're finished working:

    ```bash
    deactivate
    ```

## Frontend Architecture

The application features a modern, modular JavaScript architecture designed for maintainability, security, and accessibility:

### Module Structure

- **`pokedexApp.js`** - Main application controller that orchestrates all components
- **`constants.js`** - Centralized configuration, UI text, and application constants
- **`dataManager.js`** - Handles Pokemon data loading, caching, and search functionality
- **`uiController.js`** - Manages UI state, themes, language switching, and loading states
- **`pokemonCardRenderer.js`** - Renders Pokemon cards with optimized DOM manipulation
- **`pokemonDetailView.js`** - Manages the detail modal with animations and accessibility
- **`searchController.js`** - Debounced search with input validation and suggestions
- **`security.js`** - XSS protection utilities and input sanitization

### Key Features

- **Security**: XSS protection, input validation, and secure DOM manipulation
- **Performance**: Debounced search, lazy loading, cached DOM queries
- **Accessibility**: Full ARIA support, keyboard navigation, screen reader compatibility
- **Maintainability**: Modular design with clear separation of concerns
- **Documentation**: Comprehensive JSDoc comments throughout

### Development Tools

- **`validate_frontend.py`** - Automated validation for security, accessibility, and code quality
- **`REFACTORING_DOCUMENTATION.md`** - Complete guide to the modular architecture
- **Backward Compatibility**: `script.js` provides legacy support for existing integrations

## Usage

- Use the search bar to find a Pokémon by name or ID.
- Toggle themes and language using the buttons in the header.
- Click on a Pokémon card to view detailed information.

## Data Source

This project uses the [PokéAPI](https://pokeapi.co/) to fetch data.

- The file `pokedex_data.json` contains pre-fetched data for the original 151 Pokémon. It is generated by running the data fetch scripts in Python and is used by the frontend for fast, offline access.

## Testing

The project includes comprehensive tests for all functionality including frontend architecture, smooth transitions, and UI interactions.

### Frontend Validation

Use the automated frontend validation script to check for security, accessibility, and code quality issues:

```bash
python validate_frontend.py
```

This validates:

- Modular JavaScript structure and exports
- Security measures (XSS protection, input validation)
- Accessibility features (ARIA, semantic HTML)
- Code quality (documentation, error handling)

### Automated Test Runner (Recommended)

Use the automated test runner that handles HTTP server management:

```bash
python run_tests.py
```

The test runner will automatically:

- Start an HTTP server on port 8001
- Run all 34 tests (20 core + 9 transition + 5 UI tests)
- Stop the server when tests complete

Additional options:

```bash
python run_tests.py --help                 # Show all options
python run_tests.py --keep-server          # Keep server running after tests
python run_tests.py --port 8080            # Use custom port
python run_tests.py tests/test_ui.py -v    # Run specific test file with verbose output
```

### Manual Testing

If you prefer to manage the server manually:

1. Start the HTTP server:

   ```bash
   python -m http.server 8001
   ```

2. Run tests in another terminal:

   ```bash
   pytest tests/ -v
   ```

### Test Coverage

- **Frontend Validation**: Security, accessibility, and code quality checks
- **API Tests**: Unit and integration tests for PokéAPI interactions
- **UI Tests**: Selenium tests for interface functionality
- **Transition Tests**: Specialized tests for smooth animation features

Test categories include:

- Pokédex interface loading and responsiveness
- Search functionality and filtering
- Pokemon detail view with smooth transitions
- Theme and language toggle functionality
- Keyboard navigation and accessibility
- Modal animations and focus management
- Card click animations and hover effects
- Modular architecture integrity

## API Testing

The project includes both unit tests and integration tests for API interactions.

Integration tests require network access and may run slower due to deliberate rate limiting.

### Unit Tests

Run the unit tests with mock API responses:

```bash
pytest tests/test_pokeapi_fetch.py
```

### Integration Tests

Run integration tests that make real API calls (use sparingly to avoid rate limiting):

```bash
python -m unittest tests/test_pokeapi_integration.py
```

## Running All Tests and Coverage

You can use the Makefile for convenience:

```bash
make test         # Runs all tests with pytest
make coverage     # Generates a coverage report
```

## Development & Refactoring

This project has undergone a comprehensive frontend refactoring to implement modern best practices:

### What Changed

- **Modular Architecture**: Transformed monolithic JavaScript into 8 focused modules
- **Security Enhancements**: Added XSS protection and input validation
- **Accessibility Compliance**: Implemented full WCAG 2.1 AA accessibility features
- **Performance Optimization**: Added debouncing, lazy loading, and DOM optimization
- **Developer Experience**: Added comprehensive documentation and validation tools

### Migration Guide

The refactoring maintains **full backward compatibility**. Existing integrations continue to work unchanged, while new development can leverage the modular architecture.

For detailed information about the refactoring process, architecture decisions, and migration strategies, see:

- **`REFACTORING_DOCUMENTATION.md`** - Complete technical documentation
- **`validate_frontend.py`** - Quality assurance tool for ongoing development

### Code Quality

The project follows modern JavaScript best practices:

- ES6+ modules with proper import/export
- Comprehensive JSDoc documentation
- Security-first approach with input validation
- Accessibility-first design with ARIA support
- Performance-optimized DOM manipulation

## Future Enhancements

- Expand to include Pokémon from other generations
- Add a database for offline data storage
- Implement Progressive Web App (PWA) features
- Add unit tests for individual JavaScript modules
- Implement advanced search filters (by type, generation, stats)
- Add Pokemon comparison feature
- Integrate Pokemon evolution chains
- Add battle simulator functionality

## Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

## License

This project is currently not licensed. Feel free to use it for personal projects.
