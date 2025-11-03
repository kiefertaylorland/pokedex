# Pokédex

An interactive web application showcasing all 1025 Pokémon (Generations I-IX) with detailed information, bilingual support, and modern accessibility features.

**Live Demo:** [www.pokedex.tech](https://www.pokedex.tech)

## Screenshots

### Main Interface
![Pokedex Main UI](assets/screenshots/pokedex-main-ui.png)

### Pokemon Details
![Pokemon Detail View](https://github.com/user-attachments/assets/01ff5d8e-d20b-4201-8e04-bbb99ae207dd)

## Features

### Core Features
- 🎮 **Complete Pokédex**: All 1025 Pokémon (Generations I-IX) with comprehensive information
- 📖 **Detailed Pokémon Info**: View physical stats (category, height, weight), abilities, sprites (including shinies), stats with comparison indicators, type effectiveness, learnable moves, and evolution chains
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
- 🔗 **URL Routing**: Deep linking support with shareable URLs for specific Pokémon
- 🔄 **Evolution Chains**: Interactive evolution trees with branching paths and evolution methods
- 📈 **Type Effectiveness**: Visual weaknesses and resistances for each Pokémon type
- 🎯 **Move Details**: Complete learnable moves with power, accuracy, and damage class
- 🔍 **SEO Optimized**: Structured data for search engine indexing and rich snippets
- 💾 **Offline Support**: Progressive Web App with service worker caching
- ⌨️ **Keyboard Shortcuts**: Full keyboard navigation (press '?' for help)

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
