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

// App version for cache management and update notifications
export const APP_VERSION = '1.1.2';

// Cache settings
export const CACHE = {
    POKEMON_DATA_KEY: 'pokedex-pokemon-data',
    POKEMON_DATA_VERSION_KEY: 'pokedex-data-version',
    SEARCH_CACHE_KEY: 'pokedex-search-cache',
    CACHE_EXPIRY_DAYS: 7,
    MAX_SEARCH_CACHE_SIZE: 50
};

// Local storage keys
export const STORAGE_KEYS = {
    LANGUAGE: 'pokedex-language',
    THEME: 'pokedex-theme',
    APP_VERSION: 'pokedex-app-version',
    LAST_UPDATE_CHECK: 'pokedex-last-update-check'
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
        surpriseButton: "Surprise me!",
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
        moveDamageClass: "Class",
        damageClassPhysical: "Physical",
        damageClassSpecial: "Special",
        damageClassStatus: "Status",
        evolutionChain: "Evolution Chain",
        evolutionMethod: "Method",
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
        viewDetails: "View details for",
        sortBy: "Sort by",
        sortNumberAsc: "Number (Low to High)",
        sortNumberDesc: "Number (High to Low)",
        sortNameAsc: "Name (A-Z)",
        sortNameDesc: "Name (Z-A)",
        sortHeightAsc: "Height (Low to High)",
        sortHeightDesc: "Height (High to Low)",
        sortWeightAsc: "Weight (Low to High)",
        sortWeightDesc: "Weight (High to Low)",
        sortStatTotal: "Stat Total",
        comparePokemon: "Compare",
        addToTeam: "Add to Team",
        removeFromTeam: "Remove from Team",
        comparisonSelectTitle: "Select Pokémon to Compare",
        comparisonSelectedCount: "{selected}/{max} selected. Click a card to add another Pokémon.",
        comparisonTitle: "Pokémon Comparison",
        comparisonAddThird: "Add Third Pokémon",
        comparisonStartOver: "Start Over",
        comparisonClose: "Close",
        comparisonCancel: "Cancel",
        comparisonStats: "Stats",
        comparisonTypes: "Types",
        comparisonStatLabel: "Stat",
        comparisonFull: "Comparison is already full (3 Pokémon).",
        comparisonStrongVs: "Strong vs {name}",
        comparisonWeakVs: "Weak vs {name}",
        comparisonNeutralVs: "Neutral vs {name}",
        quickJumpRailLabel: "Quick jump by letter",
        quickJumpRailLabelGeneration: "Quick jump by generation",
        quickJumpRailLabelHeight: "Quick jump by height",
        quickJumpRailLabelWeight: "Quick jump by weight",
        quickJumpRailLabelStatTotal: "Quick jump by stat total",
        quickJumpToLetter: "Jump to {letter}",
        quickJumpToNumber: "Jump to #{value}",
        quickJumpToGeneration: "Jump to Generation {value}",
        quickJumpToBucket: "Jump to range {value}",
        teamTitle: "My Team",
        teamToggle: "Toggle team panel",
        teamViewTitle: "View your team",
        teamPanelOpen: "Open team panel",
        teamPanelClose: "Close team panel",
        teamCountLabel: "{count}/6 Pokemon",
        clearTeam: "Clear Team",
        teamSlotLabel: "Slot {slot}",
        teamCoverageTitle: "Type Coverage",
        teamCoverageEmpty: "Add Pokémon to see coverage analysis.",
        teamOffensiveCoverage: "Offensive coverage: {covered}/{total}",
        teamSharedWeaknesses: "Shared weaknesses: {value}",
        teamSharedWeaknessesNone: "None",
        teamUncoveredTypes: "Uncovered types: {value}",
        teamUncoveredTypesNone: "None",
        teamFull: "Team is full! Maximum 6 Pokémon allowed.",
        teamAlreadyAdded: "This Pokémon is already in your team!",
        teamAdded: "Pokémon added to team!",
        teamRemoved: "Pokémon removed from team!",
        teamCleared: "Team cleared!",
        teamClearConfirm: "Are you sure you want to clear your entire team?",
        teamRemoveAria: "Remove {name} from team"
    },
    [LANGUAGES.JAPANESE]: {
        title: "ポケモン図鑑", // Pokemon Zukan
        searchPlaceholder: "名前または番号で検索...",
        surpriseButton: "ランダム", // Random
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
        moveDamageClass: "分類",
        damageClassPhysical: "ぶつり",
        damageClassSpecial: "とくしゅ",
        damageClassStatus: "へんか",
        evolutionChain: "進化チェーン", // Shinka Chain
        evolutionMethod: "進化条件",
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
        viewDetails: "詳細を見る",
        sortBy: "並び替え",
        sortNumberAsc: "番号 (昇順)",
        sortNumberDesc: "番号 (降順)",
        sortNameAsc: "名前 (A-Z)",
        sortNameDesc: "名前 (Z-A)",
        sortHeightAsc: "高さ (昇順)",
        sortHeightDesc: "高さ (降順)",
        sortWeightAsc: "重さ (昇順)",
        sortWeightDesc: "重さ (降順)",
        sortStatTotal: "合計能力値",
        comparePokemon: "比較する",
        addToTeam: "チームに追加",
        removeFromTeam: "チームから削除",
        comparisonSelectTitle: "比較するポケモンを選択",
        comparisonSelectedCount: "{selected}/{max} 匹選択中。カードをクリックして追加してください。",
        comparisonTitle: "ポケモン比較",
        comparisonAddThird: "3匹目を追加",
        comparisonStartOver: "最初からやり直す",
        comparisonClose: "閉じる",
        comparisonCancel: "キャンセル",
        comparisonStats: "能力",
        comparisonTypes: "タイプ",
        comparisonStatLabel: "能力値",
        comparisonFull: "比較はすでに3匹でいっぱいです。",
        comparisonStrongVs: "{name} に有利",
        comparisonWeakVs: "{name} に不利",
        comparisonNeutralVs: "{name} に等倍",
        quickJumpRailLabel: "頭文字でクイックジャンプ",
        quickJumpRailLabelGeneration: "世代でクイックジャンプ",
        quickJumpRailLabelHeight: "高さでクイックジャンプ",
        quickJumpRailLabelWeight: "重さでクイックジャンプ",
        quickJumpRailLabelStatTotal: "合計能力でクイックジャンプ",
        quickJumpToLetter: "{letter} へジャンプ",
        quickJumpToNumber: "No.{value} へジャンプ",
        quickJumpToGeneration: "第{value}世代へジャンプ",
        quickJumpToBucket: "{value} の範囲へジャンプ",
        teamTitle: "マイチーム",
        teamToggle: "チームパネルを切り替え",
        teamViewTitle: "チームを表示",
        teamPanelOpen: "チームパネルを開く",
        teamPanelClose: "チームパネルを閉じる",
        teamCountLabel: "{count}/6 匹",
        clearTeam: "チームをクリア",
        teamSlotLabel: "スロット {slot}",
        teamCoverageTitle: "タイプ相性分析",
        teamCoverageEmpty: "ポケモンを追加すると相性分析を表示します。",
        teamOffensiveCoverage: "攻撃範囲: {covered}/{total}",
        teamSharedWeaknesses: "共通の弱点: {value}",
        teamSharedWeaknessesNone: "なし",
        teamUncoveredTypes: "未カバータイプ: {value}",
        teamUncoveredTypesNone: "なし",
        teamFull: "チームは満員です（最大6匹）。",
        teamAlreadyAdded: "そのポケモンはすでにチームにいます。",
        teamAdded: "ポケモンをチームに追加しました。",
        teamRemoved: "ポケモンをチームから外しました。",
        teamCleared: "チームをクリアしました。",
        teamClearConfirm: "チームをすべてクリアしますか？",
        teamRemoveAria: "{name} をチームから外す"
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
    SURPRISE_BUTTON: 'surprise-button',
    THEME_TOGGLE: 'theme-toggle',
    LANG_TOGGLE: 'lang-toggle',
    SORT_SELECT: 'sort-select',
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
    ESCAPE: 'Escape',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    HOME: 'Home',
    END: 'End'
};

// Sort options
export const SORT_OPTIONS = {
    NUMBER_ASC: 'number-asc',
    NUMBER_DESC: 'number-desc',
    NAME_ASC: 'name-asc',
    NAME_DESC: 'name-desc',
    HEIGHT_ASC: 'height-asc',
    HEIGHT_DESC: 'height-desc',
    WEIGHT_ASC: 'weight-asc',
    WEIGHT_DESC: 'weight-desc',
    STAT_TOTAL: 'stat-total'
};

// Local storage keys for sort
export const STORAGE_KEYS_SORT = {
    SORT_ORDER: 'pokedex-sort-order'
};
