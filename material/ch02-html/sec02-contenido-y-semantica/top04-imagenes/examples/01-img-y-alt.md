---
example_description: "img es un elemento vacío con src y alt; si la imagen no carga, el navegador muestra el texto alternativo"
example_tags: "html|imagenes|img|alt"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- img es un elemento vacío (void): no tiene etiqueta de cierre ni contenido. -->
<img src="mountain-480.svg" alt="Montañas verdes bajo un cielo azul con el sol a la derecha">

<!-- Si el archivo no existe, el navegador muestra el alt en su lugar (y un icono de imagen rota). -->
<p>Imagen con una ruta equivocada:</p>
<img src="no-existe.png" alt="Gráfica de ventas de 2026: suben un 12 % respecto a 2025" width="320" height="120">

<!-- Imagen decorativa: alt vacío (no ausente). Los lectores de pantalla la saltan. -->
<p><img src="logo.svg" alt="" width="24" height="24"> Logo puramente decorativo junto a un texto que ya dice lo importante.</p>
```
