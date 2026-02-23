/**
 * Lightweight centralized app state with pub/sub updates.
 * Keeps cross-component state transitions explicit and testable.
 */

const DEFAULT_STATE = Object.freeze({
    isInitialized: false,
    searchTerm: '',
    sortOption: 'number-asc',
    detailViewVisible: false,
    currentPokemon: null
});

export class AppState {
    constructor(initialState = {}) {
        this.state = { ...DEFAULT_STATE, ...initialState };
        this.listeners = new Set();
    }

    getState() {
        return { ...this.state };
    }

    get(key) {
        return this.state[key];
    }

    set(patch) {
        const prev = this.getState();
        this.state = { ...this.state, ...patch };
        this._notify(prev, this.getState());
    }

    subscribe(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }

        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    _notify(prev, next) {
        this.listeners.forEach(listener => {
            try {
                listener(prev, next);
            } catch (error) {
                console.warn('AppState listener error:', error);
            }
        });
    }
}
