---
example_description: "Un origen es esquema + host + puerto: new URL(…).origin lo calcula. La ruta y la query no cuentan, el puerto por defecto sí se normaliza, y localhost y 127.0.0.1 son orígenes distintos aunque lleven al mismo servidor"
example_tags: "javascript|origen|url|same-origin|localhost|seguridad"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El origen de una URL: esquema + host + puerto. La ruta, la query y el
// fragmento NO forman parte de él.
const pageUrl = 'https://tienda.example/catalogo/cafe.html';
const pageOrigin = new URL(pageUrl).origin;
console.log('origen de la página →', pageOrigin);

const candidates = [
  ['https://tienda.example/carrito?id=7', 'cambia la ruta'],
  ['https://tienda.example:443/ofertas', '443 es el puerto por defecto de https'],
  ['http://tienda.example/catalogo/cafe.html', 'cambia el esquema'],
  ['https://www.tienda.example/', 'un subdominio es otro host'],
  ['https://tienda.example:8443/', 'cambia el puerto'],
  ['https://pagos.example/checkout', 'otro host'],
];
for (const [url, reason] of candidates) {
  const candidateOrigin = new URL(url).origin;
  const same = candidateOrigin === pageOrigin;
  console.log(`${same ? '✅ mismo' : '⛔ otro'} origen · ${candidateOrigin} — ${reason}`);
}

// El mismo servidor con dos nombres: para el navegador son dos orígenes.
const viaName = new URL('http://localhost:3001/api/demo/echo').origin;
const viaIp = new URL('http://127.0.0.1:3001/api/demo/echo').origin;
console.log('localhost:3001 y 127.0.0.1:3001, ¿mismo origen? →', viaName === viaIp);

// Y el origen de ESTA página (la vista previa del editor o una tarjeta).
console.log('location.origin →', location.origin);

// El navegador no compara IPs ni servidores: compara TEXTO (esquema, host y
// puerto). Dos nombres que llevan a la misma máquina son dos orígenes, cada
// uno con sus cookies, su localStorage y sus permisos.
```
