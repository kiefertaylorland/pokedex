# Pokédex

![Pokemon Pokedex logo](https://henryjimenezp.github.io/P4-Pokedex/img/pokedex-logo.png)

**An interactive Pokédex application showcasing Generation I Pokémon with modern web features.**

## Features

- **Complete Gen I Data**: All 151 original Pokémon with detailed information
- **Bilingual Support**: English and Japanese names, types, and descriptions
- **Interactive UI**: Responsive design with light/dark themes
- **Smooth Animations**: Fluid transitions and loading states
- **Accessibility**: Full keyboard navigation and screen reader support
- **Search**: Find Pokémon by name, ID, or type
- **Audio**: Authentic Pokémon cries

## Technologies

- **Frontend**: HTML5, CSS3, Modern JavaScript (ES6 modules)
- **Data Source**: [PokéAPI](https://pokeapi.co/)
- **Backend**: Python for data processing
- **Testing**: Python unittest and pytest

## Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/kiefertaylorland/pokedex.git
   cd pokedex
   ```

2. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Start the local server:**

   ```bash
   python3 -m http.server 8000
   ```

4. **Open in browser:**

   ```text
   http://localhost:8000
   ```

## Usage

- **Search**: Type Pokémon names, IDs, or types in the search bar
- **Navigate**: Click cards to view detailed information
- **Controls**: Use theme toggle (🌙) and language toggle (🌐) in the header
- **Keyboard**: Tab to navigate, Enter/Space to select, Escape to close modals

## Testing

Run all tests with the automated test runner:

```bash
python run_tests.py
```

For specific test categories:

```bash
pytest tests/test_ui.py          # UI functionality
pytest tests/test_pokeapi.py     # API integration
python validate_frontend.py     # Code quality & security
```

## Architecture

The application uses a modern modular JavaScript architecture:

- **Frontend**: ES6 modules with separation of concerns
- **Security**: XSS protection and input validation
- **Accessibility**: WCAG 2.1 AA compliance with full keyboard support
- **Performance**: Debounced search, lazy loading, and DOM optimization

### Key Files

- `index.html` - Main application entry point
- `assets/js/pokedexApp.js` - Main application controller
- `assets/js/managers/dataManager.js` - Data handling and search
- `assets/js/components/` - UI components (cards, modals, etc.)
- `pokedex_data.json` - Pre-fetched Pokémon data
- `tests/` - Comprehensive test suite

## Development

### Data Generation

To regenerate the Pokémon data from PokéAPI:

```bash
python pokeapi_fetch.py
```

### Code Quality

Validate frontend code quality and security:

```bash
python validate_frontend.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests with `python run_tests.py`
5. Submit a pull request

## License

This project is not currently licensed. Feel free to use for personal projects.
