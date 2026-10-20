---
example_description: "Carga bajo demanda: el módulo pesado de exportar a PDF se pide la primera vez que alguien pulsa el botón; las siguientes pulsaciones reutilizan el mismo módulo, que no se vuelve a evaluar"
example_tags: "javascript|modulos|import-dinamico|carga-diferida|rendimiento"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<article class="order">
  <h2>Pedido P-1042</h2>
  <p>48 líneas · Mariana Gómez</p>
  <button type="button" id="pdf">Descargar factura en PDF</button>
  <p id="status" role="status"></p>
</article>
```

# CSS

```css
body { font-family: system-ui, sans-serif; margin: 1.5rem; color: #1f2937; }
.order { max-width: 24rem; padding: 1rem 1.25rem; border: 1px solid #cbd5e1; border-radius: 0.75rem; }
.order h2 { margin-block: 0 0.25rem; font-size: 1.15rem; }
button { font: inherit; padding: 0.5rem 0.9rem; border: 0; border-radius: 0.5rem; background: #1d4ed8; color: #fff; cursor: pointer; }
button:disabled { background: #64748b; cursor: progress; }
button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
#status { min-height: 1.5em; }
```

# JavaScript

```javascript
// Archivo que usa: assets/02-pdf/pdf-export.js (avisa cuando se evalúa).
// querySelector, textContent, disabled y addEventListener son del capítulo 6.
const order = { id: 'P-1042', lines: 48 };
const pdfButton = document.querySelector('#pdf');
const statusLine = document.querySelector('#status');

async function downloadPdf() {
  statusLine.textContent = 'Preparando el PDF…';
  pdfButton.disabled = true;
  try {
    // La primera vez: descarga y evalúa el módulo. Las demás: ya está en el
    // mapa de módulos y la promesa se cumple enseguida.
    const { renderPdf } = await import('./02-pdf/pdf-export.js');
    const pdf = renderPdf(order);
    statusLine.textContent = `📄 ${pdf.filename} · ${pdf.pages} páginas`;
    console.log(`  📄 ${pdf.filename} · ${pdf.pages} páginas`);
  } finally {
    pdfButton.disabled = false;
  }
}
pdfButton.addEventListener('click', downloadPdf);

// Demostración: dos «clics» seguidos, sin ratón.
async function demo() {
  console.log('al abrir la página, pdf-export.js no se ha pedido');
  console.log('clic 1');
  await downloadPdf();
  console.log('clic 2');
  await downloadPdf();
  const first = await import('./02-pdf/pdf-export.js');
  const second = await import('./02-pdf/pdf-export.js');
  console.log('¿import() devuelve siempre el mismo módulo? →', first === second);
}
demo();

// Ábrelo con ↗ y mira la pestaña «Red» de DevTools: pdf-export.js no
// aparece hasta el primer clic. Así se adelgaza la carga inicial de una
// aplicación: lo que casi nadie usa se pide solo cuando alguien lo usa.
```
