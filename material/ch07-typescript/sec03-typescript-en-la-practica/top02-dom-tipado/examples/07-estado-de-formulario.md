---
example_description: "Un estado de formulario tipado (BookingForm) unido a los controles en los dos sentidos: un tipo mapeado Bindings<T> obliga a que cada clave tenga un control que lea y escriba exactamente su tipo (texto, número, una unión de literales, un booleano); readForm y writeForm son genéricos"
example_tags: "typescript|dom|formularios|estado|tipos-mapeados|keyof|genericos|valueasnumber"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Clase de cocina oaxaqueña</h1>
  <form id="booking" class="card" novalidate>
    <p class="field"><label for="guest">Nombre</label><input id="guest" autocomplete="name"></p>
    <p class="field"><label for="seats">Plazas</label><input id="seats" type="number" min="1" max="8"></p>
    <p class="field">
      <label for="menu">Menú</label>
      <select id="menu">
        <option value="traditional">Tradicional (mole negro)</option>
        <option value="vegetarian">Vegetariano (mole de flor de calabaza)</option>
      </select>
    </p>
    <p class="check"><input id="newsletter" type="checkbox"><label for="newsletter">Quiero recibir el recetario mensual</label></p>
  </form>
  <p class="actions">
    <button type="button" id="load">Cargar la reserva de Lucía</button>
    <button type="button" id="reset">Restablecer</button>
  </p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.card { padding: 0.25rem 0.75rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
.field { display: grid; gap: 0.15rem; margin: 0.4rem 0; }
.check { display: flex; gap: 0.4rem; align-items: center; margin: 0.4rem 0; }
label { font-weight: 600; }
.check label { font-weight: 400; }
input, select, button { font: inherit; color: inherit; }
input:not([type="checkbox"]), select { padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
.actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
button { padding: 0.3rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# TypeScript

```typescript
// ── El estado: un tipo, y el resto calculado a partir de él (módulo 2) ─────
const MENUS = ['traditional', 'vegetarian'] as const;
type Menu = (typeof MENUS)[number];
type BookingForm = { guest: string; seats: number; menu: Menu; newsletter: boolean };

// Un control sabe leer y escribir UN tipo concreto.
type Binding<V> = { element: HTMLInputElement | HTMLSelectElement; read: () => V; write: (value: V) => void };
// Tipo mapeado: cada clave del formulario, con un control de SU tipo.
type Bindings<T> = { [K in keyof T]: Binding<T[K]> };

function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}

const textBinding = (input: HTMLInputElement): Binding<string> => ({
  element: input, read: () => input.value.trim(), write: (value) => { input.value = value; },
});
const numberBinding = (input: HTMLInputElement): Binding<number> => ({
  element: input,
  read: () => (Number.isNaN(input.valueAsNumber) ? 0 : input.valueAsNumber), // NaN si está vacío
  write: (value) => { input.valueAsNumber = value; },
});
const checkboxBinding = (input: HTMLInputElement): Binding<boolean> => ({
  element: input, read: () => input.checked, write: (value) => { input.checked = value; },
});
// select.value es un string cualquiera: se comprueba antes de convertirlo en Menu.
const isMenu = (value: string): value is Menu => (MENUS as readonly string[]).includes(value);
const menuBinding = (select: HTMLSelectElement): Binding<Menu> => ({
  element: select, read: () => (isMenu(select.value) ? select.value : 'traditional'), write: (value) => { select.value = value; },
});

const bindings: Bindings<BookingForm> = {
  guest: textBinding($('#guest', HTMLInputElement)),
  seats: numberBinding($('#seats', HTMLInputElement)), // textBinding aquí sería un error: Binding<string> no es Binding<number>
  menu: menuBinding($('#menu', HTMLSelectElement)),
  newsletter: checkboxBinding($('#newsletter', HTMLInputElement)),
};

// ── Leer y escribir todo el formulario, para cualquier T ──────────────────
function keysOf<T extends object>(value: T): (keyof T)[] {
  return Object.keys(value) as (keyof T)[]; // Object.keys da string[]: as, explicado en el módulo 2
}
function readForm<T>(all: Bindings<T>): T {
  const state = {} as T; // se rellena clave a clave justo debajo
  for (const key of keysOf(all)) state[key] = all[key].read();
  return state;
}
function writeForm<T>(all: Bindings<T>, state: T): void {
  for (const key of keysOf(all)) all[key].write(state[key]);
}

// ── La página ─────────────────────────────────────────────────────────────
const EMPTY: BookingForm = { guest: '', seats: 2, menu: 'traditional', newsletter: false };
const LUCIA: BookingForm = { guest: 'Lucía Méndez', seats: 3, menu: 'vegetarian', newsletter: true };
const logList = $('ol', HTMLOListElement);
const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};

$('#booking', HTMLFormElement).addEventListener('input', (event) => {
  const field = keysOf(bindings).find((key) => bindings[key].element === event.target);
  if (field) report(`✏️ ${field} → ${JSON.stringify(readForm(bindings))}`);
});
$('#load', HTMLButtonElement).addEventListener('click', () => {
  writeForm(bindings, LUCIA);
  report(`📥 ${JSON.stringify(readForm(bindings))}`);
});
$('#reset', HTMLButtonElement).addEventListener('click', () => {
  writeForm(bindings, EMPTY);
  report(`↩️ ${JSON.stringify(readForm(bindings))}`);
});

writeForm(bindings, EMPTY);
report(`estado → ${JSON.stringify(readForm(bindings))}`);
report('Listo: cambia los campos, pulsa «Cargar la reserva de Lucía» o «Restablecer»');
```
