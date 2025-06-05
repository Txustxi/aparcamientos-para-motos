// Configuración inicial del mapa centrado en Logroño
const map = L.map('map').setView([42.4667, -2.45], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\u00a9 OpenStreetMap contributors'
}).addTo(map);

const locationInput = document.getElementById('locationInput');
const searchForm = document.getElementById('searchForm');
const geoButton = document.getElementById('geoButton');
const parkingList = document.getElementById('parkingList');
const message = document.getElementById('message');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const SEARCH_RADIUS = 3000; // metros
const DEFAULT_CITY = 'Logroño, La Rioja';

async function getCoordinates(address) {
    try {
        const res = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`, {
            headers: {
                'Accept-Language': 'es',
                'User-Agent': 'AparcamientosMotos/1.0 (example@example.com)'
            }
        });
        const data = await res.json();
        if (data && data.length) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
    } catch (err) {
        console.error('Error obteniendo coordenadas:', err);
    }
    return null;
}

function formatAddress(tags) {
    const street = tags['addr:street'];
    const number = tags['addr:housenumber'];
    if (street) {
        return number ? `${street} ${number}` : street;
    }
    return 'Direcci\u00f3n no disponible';
}

async function fetchParkingLots(coords) {
    const query = `[out:json];node[amenity=motorcycle_parking](around:${SEARCH_RADIUS},${coords.lat},${coords.lon});out;`;
    const url = `${OVERPASS_URL}?data=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'AparcamientosMotos/1.0 (example@example.com)' }
        });
        const data = await res.json();
        return data.elements.map(el => ({
            name: el.tags && el.tags.name ? el.tags.name : 'Aparcamiento para motos',
            address: el.tags ? formatAddress(el.tags) : 'Direcci\u00f3n no disponible',
            lat: el.lat,
            lon: el.lon
        }));
    } catch (err) {
        console.error('Error consultando Overpass:', err);
        return [];
    }
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function searchParkingLots(userLocation) {
    try {
        const lots = await fetchParkingLots(userLocation);
        const sorted = lots
            .map(p => ({
                ...p,
                distance: calculateDistance(userLocation.lat, userLocation.lon, p.lat, p.lon)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20);

        updateMap(userLocation, sorted);
        updateParkingList(sorted);
        if (!sorted.length) {
            showMessage('No se encontraron aparcamientos cercanos');
        } else {
            clearMessage();
        }
    } catch (err) {
        console.error('Error buscando aparcamientos:', err);
        showMessage('Error al buscar aparcamientos cercanos');
    }
}

function updateMap(userLocation, parkingLots) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    L.marker([userLocation.lat, userLocation.lon])
        .bindPopup('Tu ubicaci\u00f3n')
        .addTo(map);

    parkingLots.forEach(p => {
        L.marker([p.lat, p.lon])
            .bindPopup(`${p.name}<br>${p.address}<br>Distancia: ${p.distance.toFixed(2)} km`)
            .addTo(map);
    });

    if (parkingLots.length) {
        const bounds = [
            [userLocation.lat, userLocation.lon],
            ...parkingLots.map(p => [p.lat, p.lon])
        ];
        map.fitBounds(bounds, { padding: [20, 20] });
    } else {
        map.setView([userLocation.lat, userLocation.lon], 14);
    }
}

function updateParkingList(parkingLots) {
    parkingList.innerHTML = '';
    parkingLots.forEach(p => {
        const item = document.createElement('div');
        item.className = 'parking-item';
        item.innerHTML = `
            <h3>${p.name}</h3>
            <p>${p.address}</p>
            <p>Distancia: <span class="distance">${p.distance.toFixed(2)} km</span></p>
        `;
        parkingList.appendChild(item);
    });
}

function showMessage(text) {
    if (message) {
        message.textContent = text;
        message.style.display = 'block';
    }
}

function clearMessage() {
    if (message) {
        message.textContent = '';
        message.style.display = 'none';
    }
}

async function handleSearch() {
    const address = locationInput.value.trim();
    if (!address) {
        showMessage('Por favor, introduce una ubicación');
        return;
    }
    clearMessage();
    const coords = await getCoordinates(address);
    if (coords) {
        searchParkingLots(coords);
        clearMessage();
    } else {
        showMessage('No se pudo encontrar la ubicación especificada');
    }
}

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    handleSearch();
});

geoButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        showMessage('La geolocalización no está disponible');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            const coords = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
            };
            clearMessage();
            searchParkingLots(coords);
        },
        () => {
            showMessage('No se pudo obtener tu ubicación');
        }
    );
});

// Cargar automáticamente los aparcamientos de Logroño al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    locationInput.value = DEFAULT_CITY;
    const coords = await getCoordinates(DEFAULT_CITY);
    if (coords) {
        searchParkingLots(coords);
    }
});
