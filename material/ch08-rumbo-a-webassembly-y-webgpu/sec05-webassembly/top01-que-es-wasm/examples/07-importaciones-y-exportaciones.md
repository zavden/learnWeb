---
example_description: "Importaciones y exportaciones: el módulo exporta checkout(unidades, precio) e importa env.notify, una función de JavaScript a la que llama con el total; WebAssembly no ve la página, así que es JavaScript quien la actualiza"
example_tags: "javascript|webassembly|wasm|imports|exports|dom|interactivo"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main class="shop">
  <h1>Café de Chiapas, 250 g</h1>
  <p>Precio por bolsa: <strong>$24.50</strong></p>
  <label>Cantidad <input id="units" type="number" min="1" max="99" value="3"></label>
  <p class="total">Total: <output id="total" for="units" aria-live="polite">—</output></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.shop { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
label { display: inline-grid; gap: 0.2rem; }
input { inline-size: 6rem; font: inherit; padding: 0.3rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.total { font-size: 1.1rem; }
output { font-weight: 700; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// El módulo IMPORTA una función (env.notify) y EXPORTA otra (checkout):
//   (module
//     (import "env" "notify" (func $notify (param i32)))           ;; función 0
//     (func (export "checkout") (param $units i32) (param $cents i32) (result i32)
//       (local $total i32)                                           ;; función 1
//       local.get $units  local.get $cents  i32.mul
//       local.tee $total                 ;; guarda el total y lo deja en la pila
//       call $notify                     ;; ← aquí WebAssembly llama a JavaScript
//       local.get $total))
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 0b 02 60 01 7f 00 60 02 7f 7f 01 7f 02 0e 01
  03 65 6e 76 06 6e 6f 74 69 66 79 00 00 03 02 01 01 07 0c 01 08 63 68 65
  63 6b 6f 75 74 00 01 0a 11 01 0f 01 01 7f 20 00 20 01 6c 22 02 10 00 20
  02 0b
`);
const PRICE_CENTS = 2450;
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const unitsInput = document.querySelector('#units');
const totalOutput = document.querySelector('#total');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// El objeto de importaciones: dos niveles de nombres, como en el (import "env" "notify").
// WebAssembly no puede tocar el DOM; esta función de JavaScript lo hace por él.
const imports = {
  env: {
    notify(totalCents) {
      totalOutput.textContent = money.format(totalCents / 100);
      logLine(`notify(${totalCents}) ← lo llamó WebAssembly`);
    },
  },
};
const { module, instance } = await WebAssembly.instantiate(bytes, imports);
const describe = (entries) => entries.map((entry) => `${entry.module ? `${entry.module}.` : ''}${entry.name} (${entry.kind})`).join(', ');
logLine(`importa → ${describe(WebAssembly.Module.imports(module))}`);
logLine(`exporta → ${describe(WebAssembly.Module.exports(module))}`);

function update() {
  const units = unitsInput.valueAsNumber;
  if (!Number.isInteger(units) || units < 1 || units > 99) return; // cantidades de 1 a 99
  logLine(`checkout(${units}, ${PRICE_CENTS}) → ${instance.exports.checkout(units, PRICE_CENTS)}`);
}
unitsInput.addEventListener('input', update);
update();
logLine('Listo: cambia la cantidad; WebAssembly calcula y llama a notify');

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}
```
