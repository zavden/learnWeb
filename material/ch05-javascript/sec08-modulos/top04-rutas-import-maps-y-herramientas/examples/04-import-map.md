---
example_description: "Un import map (<script type=\"importmap\">) enseña al navegador a qué URL lleva un nombre como 'money' o un prefijo como 'shop/'; vale para todos los módulos de la página"
example_tags: "javascript|html|modulos|import-maps|especificadores"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- El import map va ANTES de los módulos que lo usan. Es JSON:
     "nombre": "URL" para un nombre, y "prefijo/": "carpeta/" para todo lo
     que empiece por ese prefijo. Las URL relativas se resuelven contra la
     página (aquí, la carpeta assets/ del tema). -->
<script type="importmap">
{
  "imports": {
    "money": "./04-mapa/money.js",
    "shop/": "./04-mapa/shop/"
  }
}
</script>
<p>Abre la consola: los productos se describen con módulos importados por nombre.</p>
```

# JavaScript

```javascript
// Archivos que usa (assets/04-mapa/):
//   money.js        → formatPrice
//   shop/catalog.js → también importa 'money' (el mapa vale para todos)
import { formatPrice } from 'money';
import { describeProduct } from 'shop/catalog.js';

console.log('formatPrice(21000) →', formatPrice(21000));
console.log(describeProduct('MOL-001'));

// import.meta.resolve aplica el mapa sin cargar nada.
const resolved = import.meta.resolve('money');
console.log("'money' →", resolved.slice(resolved.indexOf('04-mapa/')));
const resolvedShop = import.meta.resolve('shop/catalog.js');
console.log("'shop/catalog.js' →", resolvedShop.slice(resolvedShop.indexOf('04-mapa/')));

// Es la pieza que faltaba en el ejemplo 02: con un mapa, 'lodash' podría
// llevar a ./vendor/lodash.js o a https://esm.sh/lodash-es@4.17.21. Así, el
// código importa por nombre, como en Node.js, y el mapa decide de dónde
// sale cada paquete (y su versión) en un solo sitio.
```
