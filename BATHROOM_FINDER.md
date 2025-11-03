# Bathroom Finder

A web application that helps you find the nearest public restrooms based on your current location.

## Features

- 🎯 **Location-based search**: Uses your device's GPS to find nearby bathrooms
- 🗺️ **Interactive map**: Visual display of bathroom locations with markers
- 📏 **Distance calculations**: Shows how far each bathroom is from your location
- ♿ **Accessibility info**: Displays wheelchair accessibility and other amenities
- 📱 **Mobile-friendly**: Responsive design works on all devices
- 🌐 **OpenStreetMap data**: Uses reliable public data from OpenStreetMap

## How to Use

1. Visit the Bathroom Finder page: [bathroom-finder.html](bathroom-finder.html)
2. Click the "Find Bathrooms Near Me" button
3. Grant location permissions when prompted
4. View results on the interactive map and in the list below
5. Click on markers or list items to see more details

## Data Source

Bathroom data is fetched in real-time from [OpenStreetMap](https://www.openstreetmap.org/) via the [Overpass API](https://overpass-api.de/). This includes:

- Public toilets
- Restrooms in public buildings
- Facilities with accessibility information
- Operating hours (when available)

## Privacy

- Your location is only used temporarily to find nearby bathrooms
- No location data is stored or transmitted to any server
- All location processing happens in your browser

## Technical Details

- **Geolocation API**: Browser native geolocation for user position
- **Overpass API**: Query OpenStreetMap data for nearby amenities
- **Leaflet.js**: Interactive map library
- **Haversine formula**: Calculate distances between coordinates

## Limitations

- Requires GPS/location services to be enabled
- Accuracy depends on OpenStreetMap data quality in your area
- Search radius limited to 2km by default
- Requires internet connection to fetch data

## Access

- **Standalone page**: [bathroom-finder.html](bathroom-finder.html)
- **From Pokédex**: Link in footer of main Pokédex page
- **GitHub Pages**: Will be deployed when merged to main branch
