---
example_description: "url.searchParams está vivo: cambiarlo reescribe url.href, y cambiar url.search lo actualiza. new URLSearchParams(url.search) es una COPIA que no toca la URL. Tampoco una URL creada a partir de location cambia la barra de direcciones"
example_tags: "javascript|url|urlsearchparams|vivo|copia|location"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const url = new URL('https://tienda.example/catalogo?pagina=1');
const live = url.searchParams;                // ligado a url
const copy = new URLSearchParams(url.search); // una copia suelta

// Cambiar el objeto vivo reescribe la URL…
live.set('pagina', '2');
live.set('orden', 'precio');
console.log('tras live.set →', url.href);

// …y la copia no la toca.
copy.set('pagina', '99');
console.log('tras copy.set →', url.href, '| copia:', copy.toString());

// En sentido contrario: cambiar url.search actualiza el objeto vivo.
url.search = '?pagina=3';
console.log('tras url.search = … → live:', live.get('pagina'), '| ¿y orden?', live.get('orden'), '| copia:', copy.get('pagina'));

// Lo mismo pasa con la dirección de la página: new URL(location.href) es una
// URL NUEVA, no la barra de direcciones. Cambiarla no mueve la página.
const pageUrl = new URL(location.href);
pageUrl.searchParams.set('vista', 'carrito');
console.log('¿cambió location.search? →', location.search.includes('vista=carrito'));

// Para que la barra de direcciones refleje un filtro sin recargar la página
// hace falta history.replaceState(…, pageUrl) (siguiente ejemplo). Asignar
// location.search = '…', en cambio, NAVEGA: recarga la página entera.
```
