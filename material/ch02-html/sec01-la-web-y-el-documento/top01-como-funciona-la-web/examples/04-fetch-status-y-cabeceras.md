---
example_description: "Una petición HTTP de verdad: status, cabeceras y cuerpo de la respuesta"
example_tags: "http|fetch|cabeceras|status"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// fetch() hace una petición HTTP desde JavaScript, igual que la que hace el navegador
// al cargar una imagen o un CSS. Se estudia a fondo en el capítulo de red; aquí solo
// miramos la respuesta. («await» espera a que llegue: también se explica más adelante.)

const response = await fetch('data.json');   // ruta relativa → assets/ de este tema

console.log('URL pedida     →', response.url);
console.log('status         →', response.status, response.statusText);
console.log('ok             →', response.ok);   // true si el status está entre 200 y 299
console.log('Content-Type   →', response.headers.get('content-type'));
console.log('Content-Length →', response.headers.get('content-length'), 'bytes');
console.log('Last-Modified  →', response.headers.get('last-modified'));

// El cuerpo llega DESPUÉS de las cabeceras: se lee aparte, aquí como texto.
const body = await response.text();
console.log('cuerpo         →', body);
```
