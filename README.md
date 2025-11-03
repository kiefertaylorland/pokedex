# Pokédex

An interactive web application showcasing all 1025 Pokémon (Generations I-IX) with detailed information, bilingual support, and modern accessibility features.

**Live Demo:** [www.pokedex.tech](https://www.pokedex.tech)

## Screenshots

### Main Interface
![Pokedex Main UI](assets/screenshots/pokedex-main-ui.png)

### Pokemon Details
![Pokemon Detail View](assets/screenshots/pokedex-detail-view.png)

## Features

### Core Features
- 🎮 **Complete Pokédex**: All 1025 Pokémon (Generations I-IX) with comprehensive data
- 🔊 **Authentic Cries**: Pokémon cries for authentic experience
- 🌍 **Bilingual Support**: Full English/Japanese language toggle with romaji
- 🎨 **Theme Support**: Light and dark theme toggle with persistent preferences
- 🔍 **Advanced Search**: Search by name, ID, or type with real-time filtering
- 📊 **Sorting Options**: Sort by ID, name, height, weight, or stats
- ♿ **Accessibility**: Full keyboard navigation and screen reader support
- 📱 **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)

### Advanced Features
- ⚔️ **Pokémon Comparison**: Side-by-side comparison of stats, types, and abilities (compare up to 3 Pokémon)
- 👥 **Team Builder**: Build and manage teams of up to 6 Pokémon with type coverage analysis
- 🔗 **URL Routing**: Deep linking support with shareable URLs for specific Pokémon details
- 🔄 **Evolution Chains**: Visual evolution trees with branching paths and evolution methods
- 📈 **Type Matchup Chart**: Interactive type effectiveness calculator showing strengths and weaknesses
- 🎯 **Move Details**: Complete move lists with power, accuracy, type, and damage class
- 🔍 **SEO Optimized**: Structured data (JSON-LD) for search engine indexing and rich snippets
- 💾 **Offline Support**: Progressive Web App with service worker caching for offline access
- ⌨️ **Keyboard Shortcuts**: Full keyboard navigation with shortcut help (press '?' for help)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/kiefertaylorland/pokedex.git
cd pokedex

# Start local server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000
```

## Development

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Run tests:**
```bash
python run_tests.py

# Run with coverage reporting
make coverage

# See KNOWN_TEST_FAILURES.md for environment-specific test issues
```

**Regenerate data from PokéAPI:**
```bash
python pokeapi_fetch.py
```
This will fetch data for all 1025 Pokémon (Generations I-IX) from the PokeAPI, including their stats, types, moves, evolution chains, and cries.

## Technology Stack

- HTML5, CSS3, JavaScript (ES6 modules)
- Data from [PokéAPI](https://pokeapi.co/)
- Python for data processing and testing
- GitHub Pages for deployment

## License

This project is not currently licensed. Feel free to use for personal projects.
