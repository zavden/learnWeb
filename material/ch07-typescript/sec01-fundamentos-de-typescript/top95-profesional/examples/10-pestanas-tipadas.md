---
example_description: "Pestañas accesibles (patrón WAI-ARIA) con los identificadores como unión sacada de un array as const: las teclas se traducen a una unión de movimientos, el destino se calcula con un switch exhaustivo y los enlaces internos validan su data-tab antes de usarlo"
example_tags: "typescript|profesional|as-const|tipos-literales|never|pestanas|roving-tabindex|teclado|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Museo Casa del Barro · Tonalá</h1>
  <div role="tablist" aria-label="Información para tu visita" id="tablist">
    <button type="button" role="tab" id="tab-hours" data-tab="hours" aria-controls="panel-hours" aria-selected="true">Horario</button>
    <button type="button" role="tab" id="tab-prices" data-tab="prices" aria-controls="panel-prices" aria-selected="false" tabindex="-1">Precios</button>
    <button type="button" role="tab" id="tab-access" data-tab="access" aria-controls="panel-access" aria-selected="false" tabindex="-1">Accesibilidad</button>
    <button type="button" role="tab" id="tab-directions" data-tab="directions" aria-controls="panel-directions" aria-selected="false" tabindex="-1">Cómo llegar</button>
  </div>
  <section role="tabpanel" id="panel-hours" aria-labelledby="tab-hours" tabindex="0">
    <p>De martes a domingo, de 10:00 a 18:00. Los lunes, cerrado.</p>
    <p>La taquilla cierra a las 17:30. ¿Vienes en grupo? <button type="button" class="link" data-goto="prices">Mira los precios para grupos</button></p>
  </section>
  <section role="tabpanel" id="panel-prices" aria-labelledby="tab-prices" tabindex="0" hidden>
    <ul><li>General: $90</li><li>Estudiantes y docentes: $45</li><li>Grupos de 10 o más: $60 por persona</li><li>Domingos: entrada libre</li></ul>
  </section>
  <section role="tabpanel" id="panel-access" aria-labelledby="tab-access" tabindex="0" hidden>
    <p>Rampa en la entrada, elevador a las dos salas y sillas de ruedas en préstamo. Visitas en Lengua de Señas Mexicana el primer sábado de cada mes.</p>
    <p><button type="button" class="link" data-goto="museum-shop">Ver la tienda del museo</button> (un enlace roto a propósito)</p>
  </section>
  <section role="tabpanel" id="panel-directions" aria-labelledby="tab-directions" tabindex="0" hidden>
    <p>A dos calles de la plaza principal de Tonalá. Desde Guadalajara, línea 3 del tren ligero y 15 minutos en autobús.</p>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --clay: #9a3412; --clay-soft: #ffedd5; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: var(--ink); background: #fff8f0; }
.app { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
[role="tablist"] { display: flex; flex-wrap: wrap; gap: 0.25rem; border-bottom: 2px solid var(--clay); }
[role="tab"] { font: inherit; padding: 0.45rem 0.85rem; border: 1px solid var(--line); border-bottom: 0; border-radius: 0.5rem 0.5rem 0 0; background: #fff; color: var(--ink); cursor: pointer; }
[role="tab"][aria-selected="true"] { background: var(--clay); border-color: var(--clay); color: #fff; font-weight: 700; }
[role="tabpanel"] { padding: 0.5rem 1rem; background: #fff; border: 1px solid var(--line); border-top: 0; }
[role="tabpanel"][hidden] { display: none; }
.link { font: inherit; padding: 0; border: 0; background: none; color: #1d4ed8; text-decoration: underline; cursor: pointer; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// Las pestañas que existen, escritas una vez; el tipo sale del array (lección 5).
const TAB_IDS = ['hours', 'prices', 'access', 'directions'] as const;
type TabId = (typeof TAB_IDS)[number]; // operadores de tipo: módulo 2
type Move = 'next' | 'previous' | 'first' | 'last';
type Reason = 'clic' | 'teclado' | 'enlace';

function assertNever(value: never): never {
  throw new Error(`Caso no previsto: ${String(value)}`);
}
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}

// Del texto del HTML (data-tab, data-goto) a la unión, o null si no es una pestaña.
const toTabId = (value: string | null | undefined): TabId | null => TAB_IDS.find((id) => id === value) ?? null;

function toMove(key: string): Move | null {
  switch (key) {
    case 'ArrowRight':
      return 'next';
    case 'ArrowLeft':
      return 'previous';
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    default:
      return null;
  }
}

function destination(current: TabId, move: Move): TabId {
  const index = TAB_IDS.indexOf(current);
  const last = TAB_IDS.length - 1;
  switch (move) {
    case 'next':
      return TAB_IDS[index === last ? 0 : index + 1];
    case 'previous':
      return TAB_IDS[index === 0 ? last : index - 1];
    case 'first':
      return TAB_IDS[0];
    case 'last':
      return TAB_IDS[last];
    default:
      return assertNever(move);
  }
}

const tablist = byId('tablist');
const logList = byId('log');
let selected: TabId = 'hours';

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

function selectTab(next: TabId, reason: Reason, moveFocus: boolean): void {
  if (next === selected) return;
  const previous = selected;
  selected = next;
  for (const id of TAB_IDS) {
    const tab = byId(`tab-${id}`);
    const isSelected = id === next;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1; // roving tabindex: solo la activa entra en el orden de Tab
    byId(`panel-${id}`).hidden = !isSelected;
  }
  if (moveFocus) byId(`tab-${next}`).focus();
  report(`📑 ${previous} → ${next} (${reason})`);
}

tablist.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const id = toTabId(event.target.closest('[role="tab"]')?.getAttribute('data-tab'));
  if (id !== null) selectTab(id, 'clic', false);
});

tablist.addEventListener('keydown', (event) => {
  const move = toMove(event.key);
  if (move === null) return;
  event.preventDefault();
  selectTab(destination(selected, move), 'teclado', true);
});

// Los enlaces internos: su data-goto es texto libre y puede estar mal escrito.
document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('button[data-goto]');
  if (!(link instanceof HTMLButtonElement)) return;
  const id = toTabId(link.dataset.goto);
  if (id === null) {
    report(`⚠️ «${link.dataset.goto ?? ''}» no es una pestaña: el enlace se ignora`);
    return;
  }
  selectTab(id, 'enlace', true);
});

console.log('Listo: pulsa una pestaña, o Tab hasta «Horario» y usa ← → Inicio Fin; prueba los enlaces de los paneles');
```
