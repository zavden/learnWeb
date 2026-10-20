---
example_description: "La misma página da resultados distintos según dónde se ejecute: en el editor vive en http://localhost:3001; en una tarjeta de la teoría es un iframe aislado (sandbox) con origen «null», para el que TODA petición es de otro origen y un servidor sin CORS no responde"
example_tags: "javascript|cors|origen|null|iframe|sandbox|vista-previa"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>¿Desde qué origen me ejecuto?</h1>
  <p>Origen de esta página: <output id="page-origin">…</output></p>
  <table>
    <caption>Tres peticiones al servidor de prueba</caption>
    <thead>
      <tr><th scope="col">Petición</th><th scope="col">Resultado</th></tr>
    </thead>
    <tbody id="results"></tbody>
  </table>
  <p class="hint">Compara esta tarjeta con el mismo ejemplo abierto en el editor (o con ▶).</p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
output {
  font-family: Menlo, Consolas, monospace;
  font-weight: 700;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  font-size: 0.85rem;
}
caption {
  text-align: start;
  font-weight: 700;
  padding-bottom: 0.4rem;
}
th,
td {
  padding: 0.35rem 0.5rem;
  border: 1px solid #cbd2d9;
  text-align: start;
  vertical-align: top;
}
td:first-child {
  font-family: Menlo, Consolas, monospace;
  overflow-wrap: anywhere;
}
.hint {
  color: #52606d;
  font-size: 0.9rem;
}
```

# JavaScript

```javascript
const resultsBody = document.querySelector('#results');
document.querySelector('#page-origin').textContent = location.origin;
console.log('location.origin →', location.origin);

const requests = [
  '/api/demo/echo?cors=no',             // sin cabeceras CORS
  '/api/demo/echo',                     // con Access-Control-Allow-Origin: *
  'http://127.0.0.1:3001/api/demo/echo', // otro host, con *
];

for (const url of requests) {
  let result;
  try {
    const response = await fetch(url);
    result = `✅ ${response.status} · type ${response.type}`;
  } catch (error) {
    result = `⛔ ${error.name}: ${error.message}`;
  }
  console.log(`${url} → ${result}`);
  const row = resultsBody.insertRow();
  row.insertCell().textContent = url;
  row.insertCell().textContent = result;
}

// En el editor (y con ▶) la página es un documento de verdad servido desde
// http://localhost:3001: las dos primeras son del mismo origen ('basic').
// Las tarjetas de la teoría son iframes con sandbox y SIN allow-same-origin
// (lección «Iframes y contenido embebido»): su origen es
// OPACO, «null», distinto de todos. Para ellas, cada petición es de otro
// origen ('cors') y la que no lleva cabeceras CORS falla.
```
