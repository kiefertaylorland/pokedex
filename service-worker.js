/**
 * Service Worker for Pokedex PWA
 * Provides offline support and caching strategies
 */

const CACHE_NAME = 'pokedex-v1.1.0';
const DATA_CACHE_NAME = 'pokedex-data-v1.1.0';

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
    '/assets/Poke_Ball_icon.png'
];

// Data files to cache separately
const DATA_ASSETS = [
    '/pokedex_data.json'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache data assets
            caches.open(DATA_CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching data assets');
                return cache.addAll(DATA_ASSETS);
            })
        ]).then(() => {
            console.log('[Service Worker] Install complete');
            // Force the waiting service worker to become the active service worker
            return self.skipWaiting();
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        // Delete old caches
                        return cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME;
                    })
                    .map((cacheName) => {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            // Take control of all clients
            return self.clients.claim();
        })
    );
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
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    // Update cache with fresh data
                    caches.open(DATA_CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request);
                })
        );
        return;
    }
    
    // Handle Pokemon images and cries (cache first, fallback to network)
    if (request.url.includes('/assets/pokemon/')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Not in cache, fetch and cache
                return fetch(request).then((response) => {
                    // Only cache successful responses
                    if (response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }
    
    // For all other requests (cache first, fallback to network)
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return fetch(request).then((response) => {
                // Only cache successful responses for same-origin requests
                if (response.status === 200 && url.origin === location.origin) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            });
        }).catch(() => {
            // Return a custom offline page if available
            if (request.destination === 'document') {
                return caches.match('/index.html');
            }
        })
    );
});

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                // Notify client that cache is cleared
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});
