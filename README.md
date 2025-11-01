# Pokédex

An interactive web application showcasing all 151 Generation I Pokémon with detailed information, bilingual support, and modern accessibility features.

**Live Demo:** [www.pokedex.tech](https://www.pokedex.tech)

## Screenshots

### Main Interface
![Pokedex Main UI](assets/screenshots/pokedex-main-ui.png)

### Pokemon Details
![Pokemon Detail View](assets/screenshots/pokedex-detail-view.png)

## Features

- 🎮 All 151 original Pokémon with comprehensive data
- 🌍 Bilingual support (English/Japanese)
- 🎨 Light and dark theme toggle
- 🔍 Search by name, ID, or type
- ♿ Full keyboard navigation and screen reader support
- 📱 Responsive design for all devices

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
```

**Regenerate data from PokéAPI:**
```bash
python pokeapi_fetch.py
```

## Technology Stack

- HTML5, CSS3, JavaScript (ES6 modules)
- Data from [PokéAPI](https://pokeapi.co/)
- Python for data processing and testing
- GitHub Pages for deployment

## License

This project is not currently licensed. Feel free to use for personal projects.
