// Configuraci\u00f3n inicial del mapa
// Vista inicial centrada en Logroño (La Rioja)
const map = L.map('map').setView([42.4668, -2.45], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\u00a9 OpenStreetMap contributors'
}).addTo(map);

const locationInput = document.getElementById('locationInput');
const searchForm = document.getElementById('searchForm');
const searchButton = document.getElementById('searchButton');
const geoButton = document.getElementById('geoButton');
const parkingList = document.getElementById('parkingList');
const message = document.getElementById('message');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const PARKING_DATA_URL = 'parking_data.json';

async function fetchParkingData() {
    try {
        const res = await fetch(PARKING_DATA_URL, {
            headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
    } catch (err) {
        console.error('Error cargando datos de aparcamientos:', err);
        return [];
    }
}

async function getCoordinates(address) {
    try {
        const res = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`, {
            headers: { 'Accept-Language': 'es', 'User-Agent': 'aparcamiento-motos-demo' }
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

async function showAllParkingLots() {
    const parkingLots = await fetchParkingData();
    parkingLots.forEach(p => {
        L.marker([p.lat, p.lon])
            .bindPopup(`${p.name}<br>${p.address}`)
            .addTo(map);
    });
    if (parkingLots.length) {
        map.fitBounds(parkingLots.map(p => [p.lat, p.lon]), { padding: [20, 20] });
    }
}

async function searchParkingLots(userLocation) {
    try {
        const parkingLots = await fetchParkingData();

        const filtered = parkingLots
            .map(p => ({
                ...p,
                distance: calculateDistance(userLocation.lat, userLocation.lon, p.lat, p.lon)
            }))
            .sort((a, b) => a.distance - b.distance);

        updateMap(userLocation, filtered);
        updateParkingList(filtered);
        if (!filtered.length) {
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

    const bounds = [
        [userLocation.lat, userLocation.lon],
        ...parkingLots.map(p => [p.lat, p.lon])
    ];
    map.fitBounds(bounds, { padding: [20, 20] });
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

showAllParkingLots();
