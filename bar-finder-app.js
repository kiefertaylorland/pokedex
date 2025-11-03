// Bar Finder Application
// This app finds bars with cheap drinks near the user's location

class BarFinderApp {
    constructor() {
        this.userLocation = null;
        this.bars = [];
        this.currentSort = 'price-asc';
        
        this.elements = {
            findLocationBtn: document.getElementById('find-location-btn'),
            locationStatus: document.getElementById('location-status'),
            loading: document.getElementById('loading'),
            resultsContainer: document.getElementById('results-container'),
            barsList: document.getElementById('bars-list'),
            errorMessage: document.getElementById('error-message'),
            sortSelect: document.getElementById('sort-select')
        };

        this.initEventListeners();
        this.generateMockBarData();
    }

    initEventListeners() {
        this.elements.findLocationBtn.addEventListener('click', () => {
            this.findUserLocation();
        });

        this.elements.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.sortAndDisplayBars();
        });
    }

    findUserLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser.');
            return;
        }

        this.elements.findLocationBtn.disabled = true;
        this.elements.locationStatus.textContent = 'Getting your location...';
        this.elements.loading.classList.remove('hidden');
        this.elements.errorMessage.classList.add('hidden');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                this.elements.locationStatus.textContent = `Location found! (${this.userLocation.lat.toFixed(4)}, ${this.userLocation.lng.toFixed(4)})`;
                
                // Calculate distances for all bars
                this.calculateDistances();
                
                // Display results after a short delay to simulate API call
                setTimeout(() => {
                    this.elements.loading.classList.add('hidden');
                    this.sortAndDisplayBars();
                }, 1000);
            },
            (error) => {
                this.elements.loading.classList.add('hidden');
                this.elements.findLocationBtn.disabled = false;
                this.elements.locationStatus.textContent = '';
                
                let errorMsg = 'Unable to get your location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg += 'Permission denied. Please enable location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMsg += 'Location request timed out.';
                        break;
                    default:
                        errorMsg += 'An unknown error occurred.';
                }
                this.showError(errorMsg);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    generateMockBarData() {
        // Generate realistic mock bar data
        // In a real app, this would come from an API or database
        const barNames = [
            "The Happy Hour Tavern",
            "Downtown Draft House",
            "Sunset Cocktail Lounge",
            "The Budget Bar",
            "Craft Corner Pub",
            "Night Owl Saloon",
            "The Local Watering Hole",
            "Cheers Sports Bar",
            "The Tipsy Goat",
            "Moonlight Mixers",
            "The Thirsty Penguin",
            "Hoppy Place Brewery",
            "The Corner Pocket",
            "Dive Bar Deluxe",
            "Metro Social Club"
        ];

        const drinkTypes = [
            { name: 'Draft Beer', priceRange: [3, 8] },
            { name: 'Well Cocktail', priceRange: [5, 12] },
            { name: 'House Wine', priceRange: [6, 14] },
            { name: 'Shot', priceRange: [4, 10] },
            { name: 'Margarita', priceRange: [7, 15] },
            { name: 'Craft Beer', priceRange: [5, 10] }
        ];

        this.bars = barNames.map((name, index) => {
            // Generate random location near user (or default location)
            const baseLat = 40.7128; // Default: NYC
            const baseLng = -74.0060;
            
            const lat = baseLat + (Math.random() - 0.5) * 0.1;
            const lng = baseLng + (Math.random() - 0.5) * 0.1;

            // Generate drink deals
            const numDeals = Math.floor(Math.random() * 3) + 2; // 2-4 deals
            const deals = [];
            const usedDrinks = new Set();
            
            for (let i = 0; i < numDeals; i++) {
                let drink;
                do {
                    drink = drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
                } while (usedDrinks.has(drink.name) && usedDrinks.size < drinkTypes.length);
                
                usedDrinks.add(drink.name);
                const price = Math.random() * (drink.priceRange[1] - drink.priceRange[0]) + drink.priceRange[0];
                deals.push({
                    name: drink.name,
                    price: price.toFixed(2)
                });
            }

            // Sort deals by price for display
            deals.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

            return {
                id: index + 1,
                name: name,
                location: { lat, lng },
                address: `${100 + index * 12} Main Street, Downtown`,
                rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
                cheapestDrink: parseFloat(deals[0].price),
                deals: deals,
                distance: null // Will be calculated when user shares location
            };
        });
    }

    calculateDistances() {
        if (!this.userLocation) return;

        this.bars.forEach(bar => {
            bar.distance = this.calculateDistance(
                this.userLocation.lat,
                this.userLocation.lng,
                bar.location.lat,
                bar.location.lng
            );
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula to calculate distance between two points
        const R = 3959; // Earth's radius in miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    sortAndDisplayBars() {
        let sortedBars = [...this.bars];

        switch(this.currentSort) {
            case 'price-asc':
                sortedBars.sort((a, b) => a.cheapestDrink - b.cheapestDrink);
                break;
            case 'price-desc':
                sortedBars.sort((a, b) => b.cheapestDrink - a.cheapestDrink);
                break;
            case 'distance':
                if (this.userLocation) {
                    sortedBars.sort((a, b) => a.distance - b.distance);
                }
                break;
            case 'rating':
                sortedBars.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
                break;
        }

        this.displayBars(sortedBars);
    }

    displayBars(bars) {
        this.elements.barsList.innerHTML = '';
        this.elements.resultsContainer.classList.remove('hidden');

        bars.forEach(bar => {
            const barCard = this.createBarCard(bar);
            this.elements.barsList.appendChild(barCard);
        });
    }

    createBarCard(bar) {
        const card = document.createElement('div');
        card.className = 'bar-card';

        const distanceText = bar.distance 
            ? `${bar.distance.toFixed(1)} miles away`
            : 'Distance unknown';

        card.innerHTML = `
            <div class="bar-header">
                <div>
                    <div class="bar-name">${this.escapeHtml(bar.name)}</div>
                    <div class="bar-distance">📍 ${distanceText}</div>
                </div>
                <div class="price-badge">$${bar.cheapestDrink}</div>
            </div>
            
            <div class="bar-details">
                <div class="detail-row">
                    <span class="rating">⭐ ${bar.rating}</span>
                    <span style="color: #999;">•</span>
                    <span>${bar.deals.length} drink deals</span>
                </div>
            </div>
            
            <div class="bar-address">
                ${this.escapeHtml(bar.address)}
            </div>
            
            <div class="drink-deals">
                <h4>🍹 Current Deals:</h4>
                ${bar.deals.map(deal => `
                    <div class="drink-item">
                        <span class="drink-name">${this.escapeHtml(deal.name)}</span>
                        <span class="drink-price">$${deal.price}</span>
                    </div>
                `).join('')}
            </div>
        `;

        return card;
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BarFinderApp();
    });
} else {
    new BarFinderApp();
}
