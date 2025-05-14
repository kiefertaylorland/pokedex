# Pokédex

A simple Pokédex application using data from the [PokéAPI](https://pokeapi.co/).

## Features

- Fetches data for the original 151 Pokémon (Generation I).
- Displays detailed Pokémon information, including:
  - Names in English and Japanese.
  - Types, stats, and moves.
  - Bios/Flavor texts from games.
- Responsive design with light and dark themes.
- Multi-language support (English and Japanese).
- Search functionality to find Pokémon by name or ID.
- Interactive UI for viewing Pokémon details.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend/Logic**: Python for fetching and processing data from the PokéAPI.
- **Testing**: Python's unittest module for API validation.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kiefertaylorland/pokedex.git
   ```
2. Navigate to the project directory:
   ```bash
   cd pokedex
   ```
3. Install dependencies (if any Python scripts require them):
   ```bash
   pip install -r requirements.txt
   ```
4. Open `index.html` in your browser to run the application locally.

## Usage

- Use the search bar to find a Pokémon by name or ID.
- Toggle themes and language using the buttons in the header.
- Click on a Pokémon card to view detailed information.

## Data Source

This project uses the [PokéAPI](https://pokeapi.co/) to fetch data.

## Testing

Run tests for the Pokémon API fetch functionality:
```bash
python -m unittest discover -s tests
```

## Future Enhancements

- Expand to include Pokémon from other generations.
- Add a database for offline data storage.
- Improve the UI/UX for mobile devices.

## Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

## License

This project is currently not licensed. Feel free to use it for personal projects.
