/**
 * Bathroom Finder Application
 * Finds nearby bathrooms using OpenStreetMap data via Overpass API
 */

class BathroomFinder {
    constructor() {
        this.map = null;
        this.userMarker = null;
        this.bathroomMarkers = [];
        this.userLocation = null;
        
        this.initElements();
        this.attachEventListeners();
    }

    initElements() {
        this.findBtn = document.getElementById('find-bathrooms-btn');
        this.statusMessage = document.getElementById('status-message');
        this.mapContainer = document.getElementById('map-container');
        this.resultsContainer = document.getElementById('results-container');
        this.resultsList = document.getElementById('results-list');
        this.loadingIndicator = document.getElementById('loading-indicator');
    }

    attachEventListeners() {
        this.findBtn.addEventListener('click', () => this.findNearbyBathrooms());
    }

    showStatus(message, type = 'info') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = type;
        this.announce(message);
    }

    announce(message) {
        const announcements = document.getElementById('announcements');
        announcements.textContent = message;
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
        this.findBtn.disabled = show;
    }

    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            this.showStatus('Getting your location...', 'info');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to get your location. ';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Please allow location access to use this feature.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred.';
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    async fetchNearbyBathrooms(lat, lon, radius = 2000) {
        // Overpass API query for toilets and bathrooms
        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        
        // Query for various bathroom/toilet amenities
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="toilets"](around:${radius},${lat},${lon});
                way["amenity"="toilets"](around:${radius},${lat},${lon});
                node["amenity"="public_bath"](around:${radius},${lat},${lon});
                way["amenity"="public_bath"](around:${radius},${lat},${lon});
                node["toilets"="yes"](around:${radius},${lat},${lon});
                way["toilets"="yes"](around:${radius},${lat},${lon});
            );
            out center;
        `;

        try {
            const response = await fetch(overpassUrl, {
                method: 'POST',
                body: query,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.elements || [];
        } catch (error) {
            console.error('Error fetching bathrooms:', error);
            throw error;
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula to calculate distance between two points
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    formatDistance(meters) {
        if (meters < 1000) {
            return `${Math.round(meters)} m`;
        } else {
            return `${(meters / 1000).toFixed(2)} km`;
        }
    }

    processBathroomData(bathrooms) {
        return bathrooms.map(bathroom => {
            const lat = bathroom.lat || (bathroom.center ? bathroom.center.lat : null);
            const lon = bathroom.lon || (bathroom.center ? bathroom.center.lon : null);

            if (!lat || !lon) return null;

            const distance = this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lon,
                lat,
                lon
            );

            return {
                id: bathroom.id,
                lat: lat,
                lon: lon,
                distance: distance,
                name: bathroom.tags?.name || 'Public Restroom',
                type: bathroom.tags?.amenity || 'toilets',
                access: bathroom.tags?.access || 'unknown',
                fee: bathroom.tags?.fee || 'unknown',
                wheelchair: bathroom.tags?.wheelchair || 'unknown',
                opening_hours: bathroom.tags?.opening_hours || 'unknown',
                operator: bathroom.tags?.operator || '',
                description: bathroom.tags?.description || '',
                tags: bathroom.tags || {}
            };
        }).filter(b => b !== null)
          .sort((a, b) => a.distance - b.distance);
    }

    initMap() {
        if (this.map) {
            this.map.remove();
        }

        this.mapContainer.style.display = 'block';
        
        // Initialize Leaflet map centered on user location
        this.map = L.map('map').setView([this.userLocation.lat, this.userLocation.lon], 14);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add user location marker
        const userIcon = L.divIcon({
            className: 'user-marker',
            html: '<div style="background-color: #2196F3; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        this.userMarker = L.marker([this.userLocation.lat, this.userLocation.lon], {
            icon: userIcon,
            title: 'Your Location'
        }).addTo(this.map);

        this.userMarker.bindPopup('<b>You are here</b>').openPopup();
    }

    addBathroomMarkers(bathrooms) {
        // Clear existing markers
        this.bathroomMarkers.forEach(marker => marker.remove());
        this.bathroomMarkers = [];

        // Add markers for each bathroom
        bathrooms.forEach((bathroom, index) => {
            const icon = L.divIcon({
                className: 'bathroom-marker',
                html: `<div style="background-color: #4CAF50; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([bathroom.lat, bathroom.lon], {
                icon: icon,
                title: bathroom.name
            }).addTo(this.map);

            // Create popup content
            const popupContent = `
                <div class="popup-content">
                    <h3>${bathroom.name}</h3>
                    <p><strong>Distance:</strong> ${this.formatDistance(bathroom.distance)}</p>
                    ${bathroom.access !== 'unknown' ? `<p><strong>Access:</strong> ${bathroom.access}</p>` : ''}
                    ${bathroom.fee !== 'unknown' ? `<p><strong>Fee:</strong> ${bathroom.fee}</p>` : ''}
                    ${bathroom.wheelchair !== 'unknown' ? `<p><strong>Wheelchair accessible:</strong> ${bathroom.wheelchair}</p>` : ''}
                    ${bathroom.opening_hours !== 'unknown' ? `<p><strong>Hours:</strong> ${bathroom.opening_hours}</p>` : ''}
                    ${bathroom.operator ? `<p><strong>Operator:</strong> ${bathroom.operator}</p>` : ''}
                </div>
            `;

            marker.bindPopup(popupContent);

            // Click handler to highlight corresponding result
            marker.on('click', () => {
                const resultItem = document.getElementById(`result-${bathroom.id}`);
                if (resultItem) {
                    resultItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    resultItem.style.backgroundColor = '#E8F5E9';
                    setTimeout(() => {
                        resultItem.style.backgroundColor = '';
                    }, 2000);
                }
            });

            this.bathroomMarkers.push(marker);
        });

        // Fit map to show all markers
        if (bathrooms.length > 0) {
            const bounds = L.latLngBounds(
                bathrooms.map(b => [b.lat, b.lon]).concat([[this.userLocation.lat, this.userLocation.lon]])
            );
            this.map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    displayResults(bathrooms) {
        this.resultsContainer.style.display = 'block';
        this.resultsList.innerHTML = '';

        if (bathrooms.length === 0) {
            this.resultsList.innerHTML = '<p style="text-align: center; color: #757575;">No bathrooms found nearby. Try increasing the search radius.</p>';
            return;
        }

        bathrooms.forEach((bathroom, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.id = `result-${bathroom.id}`;
            resultItem.setAttribute('role', 'listitem');

            const amenities = [];
            if (bathroom.wheelchair === 'yes') amenities.push('♿ Wheelchair Accessible');
            if (bathroom.fee === 'no') amenities.push('🆓 Free');
            if (bathroom.access === 'public') amenities.push('🌐 Public');

            resultItem.innerHTML = `
                <h3>${index + 1}. ${bathroom.name}</h3>
                <div class="result-distance">${this.formatDistance(bathroom.distance)} away</div>
                ${bathroom.operator ? `<div class="result-details">Operated by: ${bathroom.operator}</div>` : ''}
                ${bathroom.opening_hours !== 'unknown' ? `<div class="result-details">Hours: ${bathroom.opening_hours}</div>` : ''}
                ${bathroom.description ? `<div class="result-details">${bathroom.description}</div>` : ''}
                ${amenities.length > 0 ? `
                    <div class="result-amenities">
                        ${amenities.map(a => `<span class="amenity-badge">${a}</span>`).join('')}
                    </div>
                ` : ''}
            `;

            // Click to center map on this bathroom
            resultItem.addEventListener('click', () => {
                this.map.setView([bathroom.lat, bathroom.lon], 17);
                this.bathroomMarkers[index].openPopup();
            });

            this.resultsList.appendChild(resultItem);
        });

        this.announce(`Found ${bathrooms.length} bathroom${bathrooms.length !== 1 ? 's' : ''} nearby`);
    }

    async findNearbyBathrooms() {
        try {
            this.showLoading(true);
            
            // Get user location
            this.userLocation = await this.getUserLocation();
            this.showStatus('Found your location! Searching for nearby bathrooms...', 'success');

            // Fetch nearby bathrooms
            const rawBathrooms = await this.fetchNearbyBathrooms(
                this.userLocation.lat,
                this.userLocation.lon
            );

            // Process and sort bathrooms by distance
            const bathrooms = this.processBathroomData(rawBathrooms);

            if (bathrooms.length === 0) {
                this.showStatus('No bathrooms found within 2km. Try a different location.', 'error');
                this.showLoading(false);
                return;
            }

            // Initialize map
            this.initMap();

            // Add bathroom markers to map
            this.addBathroomMarkers(bathrooms);

            // Display results list
            this.displayResults(bathrooms);

            this.showStatus(`Found ${bathrooms.length} bathroom${bathrooms.length !== 1 ? 's' : ''} near you!`, 'success');
            
        } catch (error) {
            console.error('Error finding bathrooms:', error);
            this.showStatus(error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BathroomFinder();
});
