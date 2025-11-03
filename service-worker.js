/**
 * Service Worker for Pokedex PWA
 * Provides offline support and caching strategies with size limits
 */

const CACHE_NAME = 'pokedex-v1.1.1';
const DATA_CACHE_NAME = 'pokedex-data-v1.1.1';

// Cache configuration
const CACHE_CONFIG = {
    // Maximum number of items in image cache
    MAX_IMAGE_CACHE_ITEMS: 500,
    // Maximum age for cached images (30 days in milliseconds)
    MAX_IMAGE_AGE: 30 * 24 * 60 * 60 * 1000,
    // Maximum total cache size (50MB in bytes)
    MAX_CACHE_SIZE: 50 * 1024 * 1024
};

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/assets/style.css',
    '/assets/js/pokedexApp.js',
    '/assets/js/constants.js',
    '/assets/js/managers/dataManager.js',
    '/assets/js/managers/uiController.js',
    '/assets/js/components/pokemonCardRenderer.js',
    '/assets/js/components/pokemonDetailView.js',
    '/assets/js/controllers/searchController.js',
    '/assets/js/utils/security.js',
    '/assets/js/utils/debounce.js',
    '/assets/js/utils/typeMapping.js',
    '/assets/js/utils/cacheManager.js',
    '/assets/js/utils/urlRouter.js',
    '/assets/js/utils/structuredData.js',
    '/assets/js/utils/lazyLoading.js',
    '/assets/js/utils/config.js',
    '/assets/Poke_Ball_icon.png'
];

// Data files to cache separately
const DATA_ASSETS = [
    '/pokedex_data.json'
];

/**
 * Manages cache size by implementing LRU eviction
 * @param {string} cacheName - Name of the cache to manage
 * @param {number} maxItems - Maximum number of items to keep
 */
async function manageCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        // Remove oldest items (LRU eviction)
        const itemsToDelete = keys.length - maxItems;
        for (let i = 0; i < itemsToDelete; i++) {
            await cache.delete(keys[i]);
        }
    }
}

/**
 * Gets the total size of a cache
 * @param {string} cacheName - Name of the cache
 * @returns {Promise<number>} Total size in bytes
 */
async function getCacheSize(cacheName) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    
    for (const request of keys) {
        try {
            const response = await cache.match(request);
            if (response && response.body) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        } catch (error) {
            // Skip if unable to get size
            continue;
        }
    }
    
    return totalSize;
}

/**
 * Cleans up old cache entries based on age
 * @param {string} cacheName - Name of the cache to clean
 * @param {number} maxAge - Maximum age in milliseconds
 */
async function cleanupOldCacheEntries(cacheName, maxAge) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    const now = Date.now();
    
    for (const request of keys) {
        try {
            const response = await cache.match(request);
            if (response && response.headers) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const cacheDate = new Date(dateHeader).getTime();
                    const age = now - cacheDate;
                    
                    if (age > maxAge) {
                        await cache.delete(request);
                    }
                }
            }
        } catch (error) {
            // Skip if unable to process entry
            continue;
        }
    }
}

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        // Cache static assets
        const staticCache = await caches.open(CACHE_NAME);
        await staticCache.addAll(STATIC_ASSETS);
        
        // Cache data assets
        const dataCache = await caches.open(DATA_CACHE_NAME);
        await dataCache.addAll(DATA_ASSETS);
        
        // Force the waiting service worker to become the active service worker
        await self.skipWaiting();
    })());
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        
        // Delete old caches
        await Promise.all(
            cacheNames
                .filter((cacheName) => {
                    return cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME;
                })
                .map((cacheName) => caches.delete(cacheName))
        );
        
        // Clean up old cache entries based on age
        await cleanupOldCacheEntries(CACHE_NAME, CACHE_CONFIG.MAX_IMAGE_AGE);
        
        // Manage cache size (LRU eviction)
        await manageCacheSize(CACHE_NAME, CACHE_CONFIG.MAX_IMAGE_CACHE_ITEMS);
        
        // Take control of all clients
        await self.clients.claim();
    })());
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle data requests differently (network first, fallback to cache)
    if (request.url.includes('/pokedex_data.json')) {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);
                
                // Clone the response
                const responseToCache = response.clone();
                
                // Update cache with fresh data
                const cache = await caches.open(DATA_CACHE_NAME);
                await cache.put(request, responseToCache);
                
                return response;
            } catch (error) {
                // Network failed, try cache
                return await caches.match(request);
            }
        })());
        return;
    }
    
    // Handle Pokemon images and cries (cache first, fallback to network)
    if (request.url.includes('/assets/pokemon/')) {
        event.respondWith((async () => {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // Not in cache, fetch and cache
            const response = await fetch(request);
            
            // Only cache successful responses
            if (response.status === 200) {
                const responseToCache = response.clone();
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, responseToCache);
                
                // Manage cache size after adding new item
                await manageCacheSize(CACHE_NAME, CACHE_CONFIG.MAX_IMAGE_CACHE_ITEMS);
            }
            
            return response;
        })());
        return;
    }
    
    // For all other requests (cache first, fallback to network)
    event.respondWith((async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        try {
            const response = await fetch(request);
            
            // Only cache successful responses for same-origin requests
            if (response.status === 200 && url.origin === location.origin) {
                const responseToCache = response.clone();
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, responseToCache);
            }
            
            return response;
        } catch (error) {
            // Return a custom offline page if available
            if (request.destination === 'document') {
                return await caches.match('/index.html');
            }
            throw error;
        }
    })());
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil((async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
            
            // Notify client that cache is cleared
            event.ports[0].postMessage({ success: true });
        })());
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATS') {
        event.waitUntil((async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                const keys = await cache.keys();
                const totalSize = await getCacheSize(CACHE_NAME);
                
                const stats = {
                    success: true,
                    itemCount: keys.length,
                    totalSize: totalSize,
                    maxItems: CACHE_CONFIG.MAX_IMAGE_CACHE_ITEMS,
                    maxSize: CACHE_CONFIG.MAX_CACHE_SIZE,
                    utilization: (totalSize / CACHE_CONFIG.MAX_CACHE_SIZE * 100).toFixed(2) + '%'
                };
                
                event.ports[0].postMessage(stats);
            } catch (error) {
                event.ports[0].postMessage({ success: false, error: error.message });
            }
        })());
    }
});
