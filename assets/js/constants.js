/**
 * Constants and configuration for the Pokedex application
 * @module Constants
 */

// Animation settings
export const ANIMATION = {
    DURATION_MS: 300,
    SHAKE_DURATION_MS: 500,
    TRANSITION_DELAY_MS: 100
};

// API and data settings
export const DATA = {
    JSON_FILE: './pokedex_data.json',
    CRY_AUDIO_PATH: 'assets/pokemon/cries/latest/',
    MAX_POKEMON_ID: 10000,
    SEARCH_DEBOUNCE_MS: 250
};

// Local storage keys
export const STORAGE_KEYS = {
    LANGUAGE: 'pokedex-language',
    THEME: 'pokedex-theme'
};

// Supported languages
export const LANGUAGES = {
    ENGLISH: 'en',
    JAPANESE: 'jp'
};

// Supported themes
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// UI text translations
export const UI_TEXT = {
    [LANGUAGES.ENGLISH]: {
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
        movePP: "PP",
        moveLevel: "Lv.",
        evolutionChain: "Evolution Chain",
        weaknesses: "Weaknesses",
        resistances: "Resistances",
        immunities: "Immunities",
        abilities: "Abilities",
        hiddenAbility: "Hidden Ability",
        physicalInfo: "Physical Info",
        height: "Height",
        weight: "Weight",
        category: "Category",
        sprites: "Sprites",
        officialArtwork: "Official Artwork",
        normalSprite: "Normal",
        shinySprite: "Shiny",
        noBio: "No bio available.",
        noMoves: "No specific moves data available.",
        noAbilities: "No abilities data available.",
        imageNotAvailable: "(Image not available)",
        loading: "Loading...",
        error: "Error loading Pokémon data. Please try again later.",
        viewDetails: "View details for"
    },
    [LANGUAGES.JAPANESE]: {
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
        movePP: "PP",
        moveLevel: "Lv.",
        evolutionChain: "進化チェーン", // Shinka Chain
        weaknesses: "弱点", // Jakuten
        resistances: "耐性", // Taisei
        immunities: "無効", // Mukou
        abilities: "とくせい", // Tokusei
        hiddenAbility: "かくれとくせい", // Kakure Tokusei
        physicalInfo: "基本情報", // Kihon Jouhou
        height: "高さ", // Takasa
        weight: "重さ", // Omosa
        category: "分類", // Bunrui
        sprites: "スプライト", // Supuraito
        officialArtwork: "公式アート", // Koushiki Aato
        normalSprite: "通常", // Tsuujou
        shinySprite: "色違い", // Irochigai
        noBio: "説明なし",
        noMoves: "わざデータなし",
        noAbilities: "とくせいデータなし",
        imageNotAvailable: "(画像なし)",
        loading: "読み込み中...",
        error: "ポケモンデータの読み込みエラー。再試行してください。",
        viewDetails: "詳細を見る"
    }
};

// CSS classes and selectors
export const CSS_CLASSES = {
    DARK_MODE: 'dark-mode',
    MODAL_OPEN: 'modal-open',
    SHOW: 'show',
    LOADING: 'loading',
    CLICKED: 'clicked',
    SPRITE_SHAKE: 'sprite-shake-animation'
};

// DOM element IDs (for better maintainability)
export const ELEMENT_IDS = {
    POKEDEX_GRID: 'pokedex-grid',
    LOADING_INDICATOR: 'loading-indicator',
    SEARCH_INPUT: 'search-input',
    THEME_TOGGLE: 'theme-toggle',
    LANG_TOGGLE: 'lang-toggle',
    DETAIL_VIEW: 'pokemon-detail-view',
    DETAIL_CONTENT: 'detail-content',
    APP_TITLE: 'app-title',
    FOOTER_TEXT: 'footer-text',
    CLOSE_DETAIL: 'close-detail-view'
};

// Event types
export const EVENTS = {
    DOM_CONTENT_LOADED: 'DOMContentLoaded',
    CLICK: 'click',
    KEYDOWN: 'keydown',
    INPUT: 'input',
    LOAD: 'load',
    ERROR: 'error',
    ANIMATION_END: 'animationend'
};

// Keyboard codes
export const KEYS = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape'
};
