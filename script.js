document.addEventListener('DOMContentLoaded', () => {
    const pokedexGrid = document.getElementById('pokedex-grid');
    const searchInput = document.getElementById('search-input');
    const themeToggleButton = document.getElementById('theme-toggle');
    const langToggleButton = document.getElementById('lang-toggle');
    const detailView = document.getElementById('pokemon-detail-view');
    const detailContent = document.getElementById('detail-content');

    const appTitle = document.getElementById('app-title');
    const searchPlaceholder = document.getElementById('search-input');
    const footerText = document.getElementById('footer-text');


    let allPokemonData = [];
    let currentLanguage = localStorage.getItem('pokedex-language') || 'en'; // 'en' or 'jp'
    let currentTheme = localStorage.getItem('pokedex-theme') || 'light';

    // Animation constants
    const ANIMATION_DURATION_MS = 300;

    // UI Text translations
    const uiText = {
        en: {
            title: "Pokédex",
            searchPlaceholder: "Search Pokémon by name or #...",
            footer: "Data from PokéAPI. App by You!",
            hp: "HP",
            attack: "Attack",
            defense: "Defense",
            specialAttack: "Sp. Attack",
            specialDefense: "Sp. Defense",
            speed: "Speed",
            bio: "Bio",
            types: "Types",
            stats: "Stats",
            moves: "Moves",
            movePower: "Power",
            moveAccuracy: "Accuracy",
            movePP: "PP"
        },
        jp: {
            title: "ポケモン図鑑", // Pokemon Zukan
            searchPlaceholder: "名前または番号で検索...",
            footer: "データ元: PokéAPI。作成者: あなた！",
            hp: "HP",
            attack: "こうげき", // Kougeki
            defense: "ぼうぎょ", // Bougyo
            specialAttack: "とくこう", // Tokukou
            specialDefense: "とくぼう", // Tokubou
            speed: "すばやさ", // Subayasa
            bio: "説明", // Setsumei
            types: "タイプ", // Taipu
            stats: "能力", // Nouryoku
            moves: "わざ", // Waza
            movePower: "威力", // Iryoku
            moveAccuracy: "命中", // Meichuu
            movePP: "PP"
        }
    };

    // Apply initial theme
    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        currentTheme = theme;
        localStorage.setItem('pokedex-theme', theme);
        themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌓';
    }

    // Apply initial language
    function applyLanguage(lang) {
        currentLanguage = lang;
        localStorage.setItem('pokedex-language', lang);
        langToggleButton.textContent = lang === 'en' ? 'EN/日本語' : 'EN/JP';
        updateUIText(lang);
        // Re-render Pokemon list if data is already loaded
        if (allPokemonData.length > 0) {
            displayPokemon(allPokemonData);
        }
        // If detail view is open, re-render it
        if (detailView.classList.contains('show') && detailView.dataset.pokemonId) {
             const pokemon = allPokemonData.find(p => p.id === parseInt(detailView.dataset.pokemonId));
             if (pokemon) showPokemonDetail(pokemon);
        }
    }

    function updateUIText(lang) {
        appTitle.textContent = uiText[lang].title;
        searchPlaceholder.placeholder = uiText[lang].searchPlaceholder;
        footerText.textContent = uiText[lang].footer;
    }


    // Fetch Pokémon data
    async function loadPokemonData() {
        try {
            const response = await fetch('./pokedex_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPokemonData = await response.json();
            applyLanguage(currentLanguage); // This will call displayPokemon
        } catch (error) {
            console.error("Could not load Pokémon data:", error);
            pokedexGrid.innerHTML = "<p>Error loading Pokémon data. Please try again later.</p>";
        }
    }

    // Display Pokémon in the grid
    function displayPokemon(pokemonArray) {
        pokedexGrid.innerHTML = ''; // Clear existing entries
        pokemonArray.forEach(pokemon => {
            const card = document.createElement('div');
            const name = currentLanguage === 'jp' ? pokemon.name_jp : pokemon.name_en;
            const types = currentLanguage === 'jp' ? pokemon.types_jp : pokemon.types_en;

            card.classList.add('pokemon-card');
            card.dataset.id = pokemon.id;
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${name}`);

            let typesHtml = types.map(type =>
                `<span class="type-${type.toLowerCase().replace(' ', '-')}">${type}</span>`
            ).join('');


            card.innerHTML = `
                <img src="${pokemon.sprite}" alt="${name}" loading="lazy">
                <h3>${name}</h3>
                <p class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
                <div class="pokemon-types">${typesHtml}</div>
            `;

            // Add image loading event listeners
            const img = card.querySelector('img');
            img.addEventListener('load', () => {
                img.classList.remove('loading');
            });
            img.addEventListener('error', () => {
                img.alt = `${name} (Image not available)`;
                img.classList.remove('loading');
            });
            img.classList.add('loading');

            card.addEventListener('click', () => {
                showPokemonDetailWithAnimation(card, pokemon);
            });

            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    showPokemonDetailWithAnimation(card, pokemon);
                }
            });
            pokedexGrid.appendChild(card);
        });
    }

    // Show detailed view
    function showPokemonDetail(pokemon) {
        detailView.dataset.pokemonId = pokemon.id; // Store ID for language change
        const name = currentLanguage === 'jp' ? pokemon.name_jp : pokemon.name_en;
        const types = currentLanguage === 'jp' ? pokemon.types_jp : pokemon.types_en;
        const bio = currentLanguage === 'jp' ? pokemon.bio_jp : pokemon.bio_en;

        // Play Pokémon cry
        const cryAudio = new Audio(`assets/pokemon/cries/latest/${pokemon.id}.ogg`);
        cryAudio.play().catch(error => console.error("Error playing cry:", error)); // Added error handling

        let typesHtml = types.map(type =>
            `<span class="type-${type.toLowerCase().replace(' ', '-')}">${type}</span>`
        ).join(' ');

        let statsHtml = `
            <div class="stat-item"><strong>${uiText[currentLanguage].hp}:</strong> ${pokemon.stats.hp}</div>
            <div class="stat-item"><strong>${uiText[currentLanguage].attack}:</strong> ${pokemon.stats.attack}</div>
            <div class="stat-item"><strong>${uiText[currentLanguage].defense}:</strong> ${pokemon.stats.defense}</div>
            <div class="stat-item"><strong>${uiText[currentLanguage].specialAttack}:</strong> ${pokemon.stats['special-attack']}</div>
            <div class="stat-item"><strong>${uiText[currentLanguage].specialDefense}:</strong> ${pokemon.stats['special-defense']}</div>
            <div class="stat-item"><strong>${uiText[currentLanguage].speed}:</strong> ${pokemon.stats.speed}</div>
        `;

        let movesHtml = pokemon.moves.map(move => {
            const moveName = currentLanguage === 'jp' ? move.name_jp : move.name_en;
            const moveType = currentLanguage === 'jp' ? move.type_jp : move.type_en;
            return `
                <li>
                    <strong>${moveName}</strong> (${moveType})<br>
                    <small>${uiText[currentLanguage].movePower}: ${move.power || 'N/A'}, ${uiText[currentLanguage].moveAccuracy}: ${move.accuracy || 'N/A'}, ${uiText[currentLanguage].movePP}: ${move.pp || 'N/A'}</small>
                </li>`;
        }).join('');
        if (pokemon.moves.length === 0) {
            movesHtml = `<li>No specific moves data available.</li>`;
        }


        detailContent.innerHTML = `
            <div class="detail-modal-content">
                <button id="close-detail-view">X</button>
                <img src="${pokemon.sprite}" alt="${name}" style="width: 120px; height: 120px;">
                <h2>${name} (#${String(pokemon.id).padStart(3, '0')})</h2>

                <div class="detail-section">
                    <h4>${uiText[currentLanguage].types}</h4>
                    <p class="pokemon-types">${typesHtml}</p>
                </div>

                <div class="detail-section">
                    <h4>${uiText[currentLanguage].bio}</h4>
                    <p>${bio || (currentLanguage === 'jp' ? '説明なし' : 'No bio available.')}</p>
                </div>

                <div class="detail-section">
                    <h4>${uiText[currentLanguage].stats}</h4>
                    <div class="stats-grid">${statsHtml}</div>
                </div>

                <div class="detail-section">
                    <h4>${uiText[currentLanguage].moves}</h4>
                    <ul class="moves-list">${movesHtml}</ul>
                </div>
            </div>
        `;

        // Show the detail view with transition
        detailView.classList.add('show');

        // Prevent body scroll
        document.body.classList.add('modal-open');

        // Focus the close button for accessibility
        setTimeout(() => {
            const closeButton = document.getElementById('close-detail-view');
            if (closeButton) {
                closeButton.focus();
            }
        }, 100);

        // Shake the sprite
        const spriteImage = detailContent.querySelector('img');
        if (spriteImage) {
            spriteImage.classList.add('sprite-shake-animation');
            spriteImage.addEventListener('animationend', () => {
                spriteImage.classList.remove('sprite-shake-animation');
            }, { once: true }); // Remove listener after it runs once
        }
    }

    // Helper function to show Pokemon detail with card animation
    function showPokemonDetailWithAnimation(card, pokemon) {
        // Add click animation to the card
        card.classList.add('clicked');
        setTimeout(() => card.classList.remove('clicked'), ANIMATION_DURATION_MS);

        showPokemonDetail(pokemon);
    }

    // Close detailed view using event delegation
    detailView.addEventListener('click', (event) => {
        if (event.target.id === 'close-detail-view') {
            closePokemonDetail();
        } else if (event.target === detailView) { // Clicked on the backdrop
            closePokemonDetail();
        }
    });

    // Function to close detail view with transition
    function closePokemonDetail() {
        detailView.classList.remove('show');
        document.body.classList.remove('modal-open');

        // Wait for transition to complete before clearing content
        setTimeout(() => {
            detailView.removeAttribute('data-pokemon-id');
        }, 300);
    }


    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const filteredPokemon = allPokemonData.filter(pokemon => {
            const nameEn = pokemon.name_en.toLowerCase();
            const nameJp = pokemon.name_jp ? pokemon.name_jp.toLowerCase() : '';
            const idString = String(pokemon.id).padStart(3, '0');

            return nameEn.includes(searchTerm) ||
                   (nameJp && nameJp.includes(searchTerm)) ||
                   idString.includes(searchTerm);
        });
        displayPokemon(filteredPokemon);
    });

    // Theme toggle
    themeToggleButton.addEventListener('click', () => {
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    // Language toggle
    langToggleButton.addEventListener('click', () => {
        const newLanguage = currentLanguage === 'en' ? 'jp' : 'en';
        applyLanguage(newLanguage);
    });


    // Keyboard support for closing detail view
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && detailView.classList.contains('show')) {
            closePokemonDetail();
        }
    });

    // Initial setup
    applyTheme(currentTheme); // Apply saved or default theme on load
    loadPokemonData();      // Load data, then applies language and displays Pokemon
});
