---
example_description: "Del servidor al DOM: un HTML descargado por HTTP pasa por el parser y sale reparado"
example_tags: "integracion|http|fetch|parser|quirks-mode"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<h1>Del servidor al DOM</h1>
<p>Este ejemplo descarga <code>legacy-page.html</code> (está en <code>assets/</code>), una página antigua sin DOCTYPE y con errores, y la pasa por el parser. Mira la consola.</p>
```

# JavaScript

```javascript
// fetch, await y DOMParser son JavaScript que verás más adelante; aquí solo miramos.

// 1. HTTP: el navegador pide el archivo y el servidor responde
const response = await fetch('legacy-page.html');
console.log('1. HTTP →', response.status, response.statusText, '|', response.headers.get('content-type'));

// 2. Lo que llega es TEXTO (bytes decodificados como UTF-8): todavía no hay etiquetas
const source = await response.text();
console.log('2. Texto recibido →\n' + source);

// 3. DOMParser pasa ese texto por el mismo parser que usa el navegador con las páginas
const parsed = new DOMParser().parseFromString(source, 'text/html');
console.log('3. Modo →', parsed.compatMode, '(no tiene DOCTYPE)');
console.log('   head →', parsed.head.innerHTML);
console.log('   body →', parsed.body.innerHTML);
```
