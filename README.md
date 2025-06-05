# Aparcamientos para Motos

Aplicación web para localizar aparcamientos de motos cercanos con ayuda de
Leaflet. Utiliza datos de OpenStreetMap mediante la API Overpass para mostrar
aparcamientos reales. Al abrirla se cargan automáticamente los aparcamientos de
Logroño (La Rioja).

## Uso

1. Abre `index.html` en un navegador moderno. Para que la geolocalización
   funcione correctamente se recomienda servir la carpeta con un servidor
   estático (por ejemplo `npx serve`).
2. Nada más cargar la página verás los aparcamientos de Logroño. Puedes
   introducir otra dirección o usar el botón **Usar mi ubicación** para buscar en
   tu zona.

La aplicación utiliza las API de Nominatim y Overpass de OpenStreetMap para geocodificar direcciones y obtener aparcamientos reales. Es posible que estas APIs impongan límites de uso, así que se recomienda no realizar búsquedas masivas.
