# Aparcamientos para Motos

Aplicación web sencilla para localizar aparcamientos de motos cercanos mediante Leaflet.

## Uso

1. Abre `index.html` en un navegador moderno. Funciona mejor desde un servidor estático, pero también puedes abrirlo directamente.
2. Al cargar la página se muestran en el mapa todos los aparcamientos incluidos en `parking_data.json`.
3. Introduce una dirección o utiliza el botón **Usar mi ubicación** para obtener aparcamientos cercanos ordenados por distancia.

Los datos de los aparcamientos se cargan desde `parking_data.json`. Si el archivo no se puede leer (por ejemplo al abrir la página sin servidor), la aplicación usa una copia integrada de esos datos. El archivo incluye aparcamientos de Logroño (La Rioja), pero puedes actualizarlo con ubicaciones más recientes.

La aplicación utiliza la API de Nominatim de OpenStreetMap para geocodificar direcciones.
