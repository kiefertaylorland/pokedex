/**
 * Image utility functions for handling sprite URLs and fallbacks
 * @module ImageUtils
 */

/**
 * Converts a githubusercontent URL to a jsDelivr CDN URL for better reliability
 * @param {string} url - Original GitHub raw content URL
 * @returns {string} - jsDelivr CDN URL
 */
export function convertToJsDelivrUrl(url) {
    if (!url || typeof url !== 'string') {
        return url;
    }
    
    // Pattern: https://raw.githubusercontent.com/USER/REPO/BRANCH/path/to/file
    // Convert to: https://cdn.jsdelivr.net/gh/USER/REPO@BRANCH/path/to/file
    const githubRawPattern = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/;
    const match = url.match(githubRawPattern);
    
    if (match) {
        const [, user, repo, branch, path] = match;
        return `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${path}`;
    }
    
    return url;
}

/**
 * Creates an image element with automatic fallback to alternative CDN
 * @param {string} primaryUrl - Primary image URL (usually githubusercontent)
 * @param {string} alt - Alt text for the image
 * @param {Object} options - Additional options
 * @param {Function} options.onError - Custom error handler
 * @param {Function} options.onLoad - Custom load handler  
 * @param {string} options.className - CSS class to add
 * @returns {HTMLImageElement} - Image element with fallback configured
 */
export function createImageWithFallback(primaryUrl, alt, options = {}) {
    const img = document.createElement('img');
    img.alt = alt || '';
    
    if (options.className) {
        img.className = options.className;
    }
    
    let attemptedUrls = [];
    
    const tryNextUrl = () => {
        attemptedUrls.push(img.src);
        
        // Try jsDelivr CDN if we haven't already
        const jsdelivrUrl = convertToJsDelivrUrl(primaryUrl);
        if (jsdelivrUrl !== primaryUrl && !attemptedUrls.includes(jsdelivrUrl)) {
            console.log(`Falling back to jsDelivr CDN: ${jsdelivrUrl}`);
            img.src = jsdelivrUrl;
            return;
        }
        
        // Try constructing URL from Pokemon ID if we can extract it
        const idMatch = primaryUrl.match(/\/pokemon\/(\d+)\.png/);
        if (idMatch) {
            const pokemonId = idMatch[1];
            const backupUrl = `https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
            if (!attemptedUrls.includes(backupUrl)) {
                console.log(`Falling back to constructed URL: ${backupUrl}`);
                img.src = backupUrl;
                return;
            }
        }
        
        // All attempts failed, call custom error handler
        if (options.onError) {
            options.onError(img, attemptedUrls);
        }
    };
    
    img.addEventListener('error', tryNextUrl, { once: false });
    
    if (options.onLoad) {
        img.addEventListener('load', () => options.onLoad(img), { once: true });
    }
    
    // Start with jsDelivr URL as primary (more reliable than githubusercontent)
    const jsdelivrUrl = convertToJsDelivrUrl(primaryUrl);
    img.src = jsdelivrUrl;
    
    return img;
}

/**
 * Preload multiple images with fallback
 * @param {Array<string>} urls - Array of image URLs to preload
 * @returns {Promise<Array>} - Promise that resolves when all images are loaded or failed
 */
export function preloadImages(urls) {
    const promises = urls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ url, success: true });
            img.onerror = () => {
                // Try jsDelivr fallback
                const fallbackUrl = convertToJsDelivrUrl(url);
                if (fallbackUrl !== url) {
                    const fallbackImg = new Image();
                    fallbackImg.onload = () => resolve({ url: fallbackUrl, success: true });
                    fallbackImg.onerror = () => resolve({ url, success: false });
                    fallbackImg.src = fallbackUrl;
                } else {
                    resolve({ url, success: false });
                }
            };
            img.src = url;
        });
    });
    
    return Promise.all(promises);
}

/**
 * Get the Pokemon sprite URL with CDN fallback
 * @param {number|string} pokemonId - Pokemon ID
 * @param {Object} options - Options for sprite URL
 * @param {boolean} options.shiny - Whether to get shiny sprite
 * @param {boolean} options.back - Whether to get back sprite
 * @returns {string} - Sprite URL
 */
export function getPokemonSpriteUrl(pokemonId, options = {}) {
    const { shiny = false, back = false } = options;
    const id = String(pokemonId);
    
    let path = 'sprites/pokemon';
    if (shiny && back) {
        path += '/back/shiny';
    } else if (shiny) {
        path += '/shiny';
    } else if (back) {
        path += '/back';
    }
    
    // Use jsDelivr CDN for better reliability
    return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites/master/${path}/${id}.png`;
}
