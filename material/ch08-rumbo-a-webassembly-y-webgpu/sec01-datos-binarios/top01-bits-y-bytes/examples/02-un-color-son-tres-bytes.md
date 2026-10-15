---
example_description: "Un byte son 8 bits, de 0 a 255, y se escribe con dos cifras hexadecimales: un color CSS como #1e40af son tres bytes (rojo, verde, azul) que el selector descompone en hex, decimal y binario"
example_tags: "javascript|bytes|hexadecimal|binario|color|css"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Un color son tres bytes</h1>
  <p class="pick">
    <label for="picker">Elige un color</label>
    <input id="picker" type="color" value="#1e40af">
    <span class="swatch" id="swatch" aria-hidden="true"></span>
  </p>
  <table>
    <caption id="code">#1e40af</caption>
    <thead>
      <tr><th scope="col">Canal</th><th scope="col">Hex</th><th scope="col">Decimal</th><th scope="col">Binario</th></tr>
    </thead>
    <tbody id="channels"></tbody>
  </table>
  <p id="status" aria-live="polite"></p>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
.pick { display: flex; align-items: center; gap: 0.75rem; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.swatch { inline-size: 3rem; block-size: 2rem; border: 1px solid #64748b; border-radius: 0.4rem; }
table { border-collapse: collapse; inline-size: 100%; font-variant-numeric: tabular-nums; }
caption { text-align: start; font-weight: 600; padding-block: 0.25rem; }
th, td { border: 1px solid #cbd5e1; padding: 0.3rem 0.5rem; text-align: start; }
td:nth-child(n + 2) { font-family: Menlo, Consolas, monospace; }
```

# JavaScript

```javascript
const picker = document.querySelector('#picker');
const channelRows = document.querySelector('#channels');

// '#1e40af' → [30, 64, 175]: cada pareja de cifras hexadecimales es UN byte.
function toBytes(hexColor) {
  return [1, 3, 5].map((start) => parseInt(hexColor.slice(start, start + 2), 16));
}

function show(hexColor) {
  const names = ['Rojo', 'Verde', 'Azul'];
  const bytes = toBytes(hexColor);
  channelRows.replaceChildren(...bytes.map((byte, index) => {
    const row = document.createElement('tr');
    for (const text of [names[index], byte.toString(16).padStart(2, '0'), byte, byte.toString(2).padStart(8, '0')]) {
      row.append(Object.assign(document.createElement('td'), { textContent: text }));
    }
    return row;
  }));
  document.querySelector('#code').textContent = hexColor;
  document.querySelector('#swatch').style.background = hexColor;
  const summary = `${hexColor} → [${bytes.join(', ')}] = ${bytes.length} bytes = ${bytes.length * 8} bits`;
  document.querySelector('#status').textContent = summary;
  return summary;
}

console.log(show(picker.value));
// 'input' se dispara mientras arrastras; 'change', al cerrar el selector.
picker.addEventListener('input', () => show(picker.value));
picker.addEventListener('change', () => console.log(show(picker.value)));
console.log('Listo: elige otro color; cada canal es un byte (00-ff, 0-255)');
```
