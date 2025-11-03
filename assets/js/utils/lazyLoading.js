/**
 * Lazy Loading Utility - Uses Intersection Observer for efficient image loading
 * @module LazyLoading
 */

/**
 * Lazy loading manager using Intersection Observer API
 */
export class LazyLoadManager {
    constructor(options = {}) {
        this.options = {
            root: options.root || null,
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.01,
            ...options
        };

        this.observer = null;
        this.images = new Set();
        this._initObserver();
    }

    /**
     * Initializes the Intersection Observer
     * @private
     */
    _initObserver() {
        // Check if Intersection Observer is supported
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, falling back to immediate loading');
            this.observer = null;
            return;
        }

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this._loadImage(entry.target);
                }
            });
        }, this.options);
    }

    /**
     * Observes an image element for lazy loading
     * @param {HTMLImageElement} img - Image element to observe
     */
    observe(img) {
        if (!img || !(img instanceof HTMLImageElement)) {
            console.warn('Invalid image element provided to lazy loader');
            return;
        }

        // If no observer support, load immediately
        if (!this.observer) {
            this._loadImage(img);
            return;
        }

        this.images.add(img);
        this.observer.observe(img);
    }

    /**
     * Stops observing an image element
     * @param {HTMLImageElement} img - Image element to unobserve
     */
    unobserve(img) {
        if (this.observer && img) {
            this.observer.unobserve(img);
            this.images.delete(img);
        }
    }

    /**
     * Loads an image by setting its src from data-src
     * @private
     * @param {HTMLImageElement} img - Image element to load
     */
    _loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (!src) {
            console.warn('No data-src attribute found on lazy-loaded image');
            return;
        }

        // Set up load and error handlers
        const handleLoad = () => {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            this.unobserve(img);
            
            // Dispatch custom event for tracking
            img.dispatchEvent(new CustomEvent('lazyloaded', {
                detail: { src }
            }));
        };

        const handleError = () => {
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
            this.unobserve(img);
            
            // Dispatch custom event for error tracking
            img.dispatchEvent(new CustomEvent('lazyerror', {
                detail: { src }
            }));
        };

        // Add event listeners
        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });

        // Mark as loading
        img.classList.add('lazy-loading');

        // Set the actual src to trigger loading
        if (srcset) {
            img.srcset = srcset;
        }
        img.src = src;

        // Remove data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;
    }

    /**
     * Loads all observed images immediately (useful for print, etc.)
     */
    loadAll() {
        this.images.forEach(img => {
            this._loadImage(img);
        });
    }

    /**
     * Disconnects the observer and clears all tracked images
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.images.clear();
    }

    /**
     * Gets the number of images currently being observed
     * @returns {number} Number of observed images
     */
    getObservedCount() {
        return this.images.size;
    }
}

/**
 * Singleton instance of LazyLoadManager
 */
let lazyLoadManagerInstance = null;

/**
 * Gets or creates the singleton LazyLoadManager instance
 * @param {Object} options - Options for LazyLoadManager
 * @returns {LazyLoadManager} Lazy load manager instance
 */
export function getLazyLoadManager(options) {
    if (!lazyLoadManagerInstance) {
        lazyLoadManagerInstance = new LazyLoadManager(options);
    }
    return lazyLoadManagerInstance;
}

/**
 * Helper function to set up an image for lazy loading
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Image source URL
 * @param {string} [srcset] - Optional srcset for responsive images
 * @param {string} [placeholder] - Optional placeholder image
 */
export function setupLazyImage(img, src, srcset = null, placeholder = null) {
    if (!img || !(img instanceof HTMLImageElement)) {
        console.warn('Invalid image element provided to setupLazyImage');
        return;
    }

    // Store actual src in data attribute
    img.dataset.src = src;
    if (srcset) {
        img.dataset.srcset = srcset;
    }

    // Set placeholder if provided
    if (placeholder) {
        img.src = placeholder;
    } else {
        // Use a tiny transparent placeholder
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }

    // Add lazy class for styling
    img.classList.add('lazy');

    // Get manager and observe
    const manager = getLazyLoadManager();
    manager.observe(img);
}

/**
 * Preloads images that are likely to be needed soon
 * @param {Array<string>} urls - Array of image URLs to preload
 * @returns {Promise<Array>} Promise that resolves when all images are loaded
 */
export function preloadImages(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    });

    return Promise.allSettled(promises);
}
