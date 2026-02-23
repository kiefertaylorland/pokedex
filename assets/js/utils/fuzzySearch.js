/**
 * Fuzzy search scoring utilities.
 */

export function fuzzyMatchScore(searchTerm, target) {
    if (!searchTerm || !target) {
        return 0;
    }

    if (target === searchTerm) {
        return 1000;
    }

    if (target.includes(searchTerm)) {
        if (target.startsWith(searchTerm)) {
            return 900 + (100 / target.length);
        }
        return 700 + (100 / target.length);
    }

    let searchIndex = 0;
    let targetIndex = 0;
    const matchedPositions = [];

    while (searchIndex < searchTerm.length && targetIndex < target.length) {
        if (searchTerm[searchIndex] === target[targetIndex]) {
            matchedPositions.push(targetIndex);
            searchIndex++;
        }
        targetIndex++;
    }

    if (searchIndex < searchTerm.length) {
        return 0;
    }

    let score = 500;

    if (matchedPositions[0] === 0) {
        score += 100;
    }

    if (matchedPositions.length > 1) {
        let totalDistance = 0;
        for (let i = 1; i < matchedPositions.length; i++) {
            totalDistance += matchedPositions[i] - matchedPositions[i - 1];
        }
        const avgDistance = totalDistance / (matchedPositions.length - 1);
        score -= Math.min(avgDistance * 10, 200);
    }

    score += 100 / target.length;
    return Math.max(score, 1);
}
