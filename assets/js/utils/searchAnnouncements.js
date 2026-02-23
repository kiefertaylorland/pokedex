/**
 * Search result announcement text helpers.
 */

export function buildSearchAnnouncement({ language, resultCount, searchTerm }) {
    const hasTerm = Boolean(searchTerm && searchTerm.trim() !== '');

    if (hasTerm) {
        return language === 'jp'
            ? `「${searchTerm}」で${resultCount}匹のポケモンが見つかりました`
            : `Found ${resultCount} Pokémon for "${searchTerm}"`;
    }

    return language === 'jp'
        ? `${resultCount}匹のポケモンを表示中`
        : `Showing ${resultCount} Pokémon`;
}
