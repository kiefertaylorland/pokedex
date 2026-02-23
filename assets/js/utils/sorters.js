/**
 * Pure sort utilities for Pokemon collections.
 */

export function sortByNumberAsc(pokemonArray) {
    return pokemonArray.sort((a, b) => a.id - b.id);
}

export function sortByNumberDesc(pokemonArray) {
    return pokemonArray.sort((a, b) => b.id - a.id);
}

export function sortByName(pokemonArray, language = 'en', ascending = true) {
    const nameKey = language === 'jp' ? 'name_jp' : 'name_en';

    return pokemonArray.sort((a, b) => {
        const nameA = (a[nameKey] || '').toLowerCase();
        const nameB = (b[nameKey] || '').toLowerCase();

        return ascending
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
    });
}

export function sortByStatTotal(pokemonArray) {
    return pokemonArray.sort((a, b) => totalStats(b) - totalStats(a));
}

export function totalStats(pokemon) {
    if (!pokemon || !pokemon.stats) {
        return 0;
    }

    return Object.values(pokemon.stats).reduce((total, stat) => {
        return total + (typeof stat === 'number' ? stat : 0);
    }, 0);
}
