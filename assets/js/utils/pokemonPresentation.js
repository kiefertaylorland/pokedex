/**
 * Presentation helpers for consistent Pokemon UI text formatting.
 */

export function formatPokemonNumber(id) {
    return `#${String(id).padStart(3, '0')}`;
}

export function formatPokemonHeader(name, id) {
    return `${name} (${formatPokemonNumber(id)})`;
}

export function getLocalizedPokemonSnapshot(dataManager, pokemon, language) {
    return {
        name: dataManager.getPokemonName(pokemon, language),
        types: dataManager.getPokemonTypes(pokemon, language),
        bio: dataManager.getPokemonBio(pokemon, language),
        number: formatPokemonNumber(pokemon.id)
    };
}
