---
example_description: "Un File es un Blob con nombre y fecha; URL.createObjectURL le da una dirección blob: que un <img> o un enlace de descarga pueden usar, y revokeObjectURL la libera cuando ya no hace falta"
example_tags: "javascript|file|blob|createobjecturl|revokeobjecturl|descargas|svg"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tu entrada</h1>
  <img id="ticket" width="240" height="120" alt="Entrada para el Museo Frida Kahlo, sábado 17 de octubre a las 11:00">
  <p><button id="download" type="button">Descargar entrada</button></p>
  <p class="note">En las tarjetas de la galería y de la teoría la descarga no funciona (iframe aislado sin permiso de descargas): ábrelo con ▶ o en el editor.</p>
  <ul id="log" class="log" aria-live="polite"></ul>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
button { font: inherit; padding: 0.4rem 0.8rem; border: 1px solid #64748b; border-radius: 0.5rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.note { font-size: 0.85rem; color: #475569; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// La entrada es una imagen SVG escrita como texto.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120">
  <rect width="240" height="120" rx="12" fill="#1e40af"/>
  <text x="16" y="40" fill="#ffffff" font-family="system-ui" font-size="18">Museo Frida Kahlo</text>
  <text x="16" y="70" fill="#fde68a" font-family="system-ui" font-size="14">Sábado 17 de octubre · 11:00</text>
  <text x="16" y="100" fill="#ffffff" font-family="system-ui" font-size="12">Entrada general · 1 persona</text>
</svg>`;

// Un File es un Blob con nombre y fecha de modificación (los que elige el usuario en
// un <input type="file"> también lo son: módulo «APIs modernas del navegador»).
const ticket = new File([svg], 'entrada-museo.svg', {
  type: 'image/svg+xml',
  lastModified: Date.UTC(2026, 9, 14, 17, 0),
});
logLine(`File → ${ticket.name} · ${ticket.size} bytes · ${ticket.type}`);
logLine(`¿es un Blob? → ${ticket instanceof Blob} · lastModified → ${new Date(ticket.lastModified).toISOString()}`);

// createObjectURL da una dirección «blob:<origen>/<identificador>» que apunta a esos bytes.
// La URL mantiene el Blob en memoria hasta que la liberas con revokeObjectURL.
const imageUrl = URL.createObjectURL(ticket);
logLine(`URL de objeto → ¿empieza por «blob:»? ${imageUrl.startsWith('blob:')}`);
const image = document.querySelector('#ticket');
image.addEventListener('load', () => {
  URL.revokeObjectURL(imageUrl); // la imagen ya está cargada: la URL sobra
  logLine('<img> cargada; URL liberada');
}, { once: true });
image.src = imageUrl;

// Descargar: un <a download> temporal con su propia URL, liberada un poco después.
document.querySelector('#download').addEventListener('click', () => {
  const url = URL.createObjectURL(ticket);
  const link = Object.assign(document.createElement('a'), { href: url, download: ticket.name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  logLine(`Descarga: ${ticket.name} (${ticket.size} bytes)`);
});
logLine('Listo: pulsa «Descargar entrada»');
```
