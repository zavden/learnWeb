---
example_description: "base64url cambia + y / por - y _ y quita el relleno = para poder viajar en una URL: una lista de reproducción compartida en el fragmento de un enlace; y una URL data: con base64 mete una imagen SVG entera dentro de un src"
example_tags: "javascript|base64url|data-url|url|svg|tobase64"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Compartir sin servidor</h1>
  <p>Enlace a la lista: <code id="share-link"></code></p>
  <p class="icon-row"><img id="icon" width="48" height="48" alt="Botón de reproducir rosa"> Icono servido desde una URL <code>data:</code></p>
  <ul id="log" class="log" aria-live="polite"></ul>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
code { overflow-wrap: anywhere; font-size: 0.8rem; }
.icon-row { display: flex; align-items: center; gap: 0.75rem; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 1. Una lista de reproducción guardada en el propio enlace, sin servidor.
const playlist = { name: 'Domingo tranquilo', songs: ['Bésame mucho', 'La llorona', '¿Quién será?'] };
const bytes = new TextEncoder().encode(JSON.stringify(playlist));

// base64 normal usa + / y =, que en una URL tienen significado (+ es un espacio en
// una query, / separa rutas). base64url los cambia por - y _ y quita el relleno.
const standard = bytes.toBase64();
const urlSafe = bytes.toBase64({ alphabet: 'base64url', omitPadding: true }); // en Chrome
logLine(`base64 → …${standard.slice(-28)} (${standard.length} caracteres)`);
logLine(`base64url → …${urlSafe.slice(-26)} (${urlSafe.length} caracteres)`);
// Sin los métodos nuevos: standard.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
logLine(`¿iguales con replace? → ${standard.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '') === urlSafe}`);

const link = `/listas/compartida#datos=${urlSafe}`;
document.querySelector('#share-link').textContent = link;
// Quien abre el enlace hace el camino inverso:
const received = new URL(link, 'https://musica.example').hash.slice('#datos='.length);
const restored = JSON.parse(new TextDecoder().decode(Uint8Array.fromBase64(received, { alphabet: 'base64url' })));
logLine(`recuperada → ${restored.name}: ${restored.songs.join(' · ')}`);

// 2. Una URL data: lleva los bytes DENTRO de la propia URL (aquí, un SVG en base64).
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#e4007c"/><path d="M9 7v10l8-5z" fill="#ffffff"/></svg>';
const svgBytes = new TextEncoder().encode(svg);
const dataUrl = `data:image/svg+xml;base64,${svgBytes.toBase64()}`;
document.querySelector('#icon').src = dataUrl;
logLine(`data: URL → ${dataUrl.slice(0, 32)}… (${dataUrl.length} caracteres para ${svgBytes.length} bytes)`);
// Una URL data: es autónoma (se puede guardar en un JSON o en un CSS) pero ocupa un 33 %
// más; una URL blob: (ejemplo 7) es una referencia corta que solo vale en esta página.
```
