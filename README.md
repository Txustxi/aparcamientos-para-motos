# Aparcamientos para Motos

Aplicación web sencilla para localizar aparcamientos de motos cercanos mediante Leaflet.

## Uso

1. Abre `index.html` en un navegador moderno. Se recomienda servir el proyecto con un servidor estático.
2. Introduce una dirección o utiliza el botón **Usar mi ubicación** para obtener aparcamientos cercanos.

Los datos de los aparcamientos se cargan desde `parking_data.json`. Actualmente
este archivo incluye ubicaciones de Logroño (La Rioja). Puedes actualizarlo con
nuevas ubicaciones si dispones de información más reciente.

La aplicación utiliza la API de Nominatim de OpenStreetMap para geocodificar direcciones.
