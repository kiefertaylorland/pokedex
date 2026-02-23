/**
 * Safe localStorage wrapper with fallback defaults.
 */

export const Storage = {
    get(key, fallback = null) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (_error) {
            return fallback;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (_error) {
            return false;
        }
    }
};
