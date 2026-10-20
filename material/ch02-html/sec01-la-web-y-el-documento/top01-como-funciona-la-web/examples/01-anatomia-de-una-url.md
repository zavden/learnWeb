---
example_description: "Las partes de una URL: esquema, host, puerto, ruta, query y fragmento"
example_tags: "url|origen|puerto|fragmento"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Este capítulo es de HTML: aquí JavaScript solo sirve para «mirar dentro».
// new URL(...) y console.log se explican en el capítulo de JavaScript;
// por ahora basta con leer la consola.

const url = new URL('https://tienda.ejemplo.com:8443/zapatos/running.html?talla=42&color=rojo#opiniones');

console.log('URL completa →', url.href);
console.log('esquema      →', url.protocol);  // cómo hablar con el servidor (https = HTTP cifrado)
console.log('host         →', url.hostname);  // a qué máquina (el DNS lo traduce a una IP)
console.log('puerto       →', url.port);      // a qué programa de esa máquina
console.log('ruta         →', url.pathname);  // qué recurso dentro del servidor
console.log('query        →', url.search);    // parámetros extra: también viajan al servidor
console.log('fragmento    →', url.hash);      // NO viaja al servidor: solo lo usa el navegador
console.log('origen       →', url.origin);    // esquema + host + puerto = «identidad» del sitio

// Sin puerto escrito se usa el del esquema: 443 para https, 80 para http.
// Por eso url.port sale vacío (JSON.stringify muestra las comillas de la cadena vacía).
const plain = new URL('https://ejemplo.com/');
console.log('puerto de https://ejemplo.com/ →', JSON.stringify(plain.port), '(se usa el 443)');
```
