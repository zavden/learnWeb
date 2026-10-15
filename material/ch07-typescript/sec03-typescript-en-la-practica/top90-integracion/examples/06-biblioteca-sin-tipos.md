---
example_description: "Una página que usa una biblioteca JavaScript sin tipos (assets/sucursales/sucursales.js) y una configuración que deja el servidor en window: un bloque declare module le da tipos a la biblioteca (con un tipo de plantilla para las horas) y declare global a la configuración, así que el código de la página se comprueba entero"
example_tags: "typescript|integracion|modulos|declare-module|declare-global|window|template-literal-types|dom"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<script>
  // Lo que escribe el servidor en la página.
  window.__STORE_CONFIG__ = { pickupDays: 2, results: 2 };
</script>
<main>
  <h1>Recoge en tienda</h1>
  <form id="search" class="row" novalidate>
    <p class="field"><label for="postal">Código postal</label><input id="postal" inputmode="numeric" maxlength="5" value="06600"></p>
    <p class="field"><label for="time">Hora</label><input id="time" type="time" value="19:30"></p>
    <p><button type="button" id="find">Buscar</button></p>
  </form>
  <ul id="branches" class="branches" aria-live="polite"></ul>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.row { display: flex; flex-wrap: wrap; align-items: end; gap: 0.75rem; }
.row p { margin: 0; }
.field { display: grid; gap: 0.15rem; }
label { font-weight: 600; }
input, button { font: inherit; color: inherit; }
input { width: 7rem; padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
button { padding: 0.3rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.branches { list-style: none; margin: 0.75rem 0 0; padding: 0; display: grid; gap: 0.4rem; }
.branches li { padding: 0.4rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
.open { color: #166534; font-weight: 600; }
.closed { color: #b91c1c; font-weight: 600; }
```

# TypeScript

```typescript
// Usa assets/sucursales/sucursales.js: JavaScript sin tipos (ábrelo con «Assets»).
import { nearestBranches, isOpen } from './sucursales/sucursales.js';

// Lo que diría sucursales.d.ts (el verificador de LearnWeb no lee archivos).
type Clock = `${number}:${number}`; // «09:00»: un tipo de plantilla (módulo 2)
declare module './sucursales/sucursales.js' {
  export type Branch = { id: string; name: string; city: string; postalCode: string; hours: { open: Clock; close: Clock } };
  export function nearestBranches(postalCode: string, limit?: number): Array<Branch & { distance: number }>;
  export function isOpen(branch: Branch, time: Clock): boolean;
}
// Y lo que deja el servidor en la página.
declare global {
  interface Window {
    __STORE_CONFIG__: { pickupDays: number; results: number };
  }
}

function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const postalInput = $('#postal', HTMLInputElement);
const timeInput = $('#time', HTMLInputElement);
const list = $('#branches', HTMLUListElement);
const isClock = (value: string): value is Clock => /^\d{2}:\d{2}$/.test(value);

function search(): void {
  const postalCode = postalInput.value.trim();
  const time = timeInput.value; // string: el tipo de plantilla hay que ganárselo
  if (!/^\d{5}$/.test(postalCode) || !isClock(time)) {
    list.replaceChildren(Object.assign(document.createElement('li'), { textContent: '⚠️ Escribe un código postal de 5 cifras y una hora' }));
    console.log('⚠️ datos incompletos');
    return;
  }
  const { pickupDays, results } = window.__STORE_CONFIG__;
  const branches = nearestBranches(postalCode, results); // Array<Branch & { distance: number }>
  list.replaceChildren(...branches.map((branch) => {
    const item = document.createElement('li');
    const state = Object.assign(document.createElement('span'), {
      className: isOpen(branch, time) ? 'open' : 'closed',
      textContent: isOpen(branch, time) ? 'abierta' : 'cerrada',
    });
    item.append(`${branch.name}, ${branch.city} (CP ${branch.postalCode}) · ${branch.hours.open}–${branch.hours.close} · `, state);
    return item;
  }));
  console.log(`📍 ${postalCode} a las ${time} → ${branches.map((branch) => `${branch.name}, ${branch.city} (${isOpen(branch, time) ? 'abierta' : 'cerrada'})`).join(', ')} · recoge en ${pickupDays} días`);
}

$('#find', HTMLButtonElement).addEventListener('click', search);
$('#search', HTMLFormElement).addEventListener('submit', (event) => { // Enter en un campo
  event.preventDefault();
  search();
});
search();
console.log('Listo: cambia el código postal o la hora y pulsa «Buscar»');
```
