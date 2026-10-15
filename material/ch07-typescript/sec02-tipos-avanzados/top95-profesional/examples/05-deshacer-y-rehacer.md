---
example_description: "Un editor de recetas con deshacer y rehacer: el estado es DeepReadonly y además está congelado, cada cambio es una acción de una unión discriminada que un reductor convierte en un estado nuevo, y una clase genérica History<T> guarda el pasado y el futuro; botones y Ctrl/⌘ + Z"
example_tags: "typescript|profesional|tipos-recursivos|readonly|uniones-discriminadas|genericos|clases|never|dom|teclado|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Editor de recetas</h1>
  <section class="card">
    <p class="field"><label for="title">Receta</label><input id="title" autocomplete="off"></p>
    <div class="servings" role="group" aria-labelledby="servings-label">
      <span id="servings-label">Porciones</span>
      <button type="button" id="less" aria-label="Una porción menos">−</button>
      <output id="servings" aria-live="polite"></output>
      <button type="button" id="more" aria-label="Una porción más">+</button>
    </div>
    <h2 id="ingredients-title" tabindex="-1">Ingredientes</h2>
    <ul id="ingredients" class="ingredients"></ul>
    <button type="button" id="add-glaze">Añadir azúcar glas</button>
  </section>
  <p class="history">
    <button type="button" id="undo" aria-keyshortcuts="Control+Z Meta+Z">↩️ Deshacer</button>
    <button type="button" id="redo" aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z">↪️ Rehacer</button>
    <span id="counter" class="counter"></span>
  </p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #9a3412; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #fff8f0; }
.app { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.75rem; }
h2 { font-size: 1rem; margin: 0.75rem 0 0.3rem; }
.card { padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--line); border-radius: 0.75rem; }
.field { display: grid; gap: 0.15rem; margin: 0 0 0.5rem; }
input, button { font: inherit; }
input { padding: 0.3rem 0.45rem; border: 1px solid var(--line); border-radius: 0.4rem; }
.servings { display: flex; align-items: center; gap: 0.6rem; }
output { min-width: 2ch; text-align: center; font-weight: 700; font-size: 1.15rem; }
button { padding: 0.3rem 0.7rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
.ingredients { list-style: none; margin: 0 0 0.6rem; padding: 0; display: grid; gap: 0.3rem; }
.ingredients li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.25rem 0.5rem; border: 1px solid var(--soft); border-radius: 0.4rem; }
.history { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.counter { color: var(--muted); font-size: 0.9rem; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Estado de solo lectura, también en ejecución ──────────────────────────
type DeepReadonly<T> = T extends string | number | boolean | null | undefined ? T : { readonly [K in keyof T]: DeepReadonly<T[K]> };

function freezeDeep<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeDeep(child);
    Object.freeze(value);
  }
  return value;
}
// Congelar y declararlo en el tipo: el único as del estado.
const deepFreeze = <T>(value: T): DeepReadonly<T> => freezeDeep(value) as DeepReadonly<T>;

// ── Un historial genérico: sirve para cualquier estado (History ya es del DOM) ─
class UndoHistory<T> {
  #past: DeepReadonly<T>[] = [];
  #present: DeepReadonly<T>;
  #future: DeepReadonly<T>[] = [];
  readonly #limit: number;

  constructor(initial: T, limit = 50) {
    this.#present = deepFreeze(initial);
    this.#limit = limit;
  }
  get present(): DeepReadonly<T> {
    return this.#present;
  }
  get counts(): { past: number; future: number } {
    return { past: this.#past.length, future: this.#future.length };
  }
  commit(next: DeepReadonly<T>): void {
    this.#past = [...this.#past, this.#present].slice(-this.#limit);
    this.#present = freezeDeep(next);
    this.#future = [];
  }
  undo(): boolean {
    const previous = this.#past.at(-1);
    if (previous === undefined) return false;
    this.#future = [this.#present, ...this.#future];
    this.#past = this.#past.slice(0, -1);
    this.#present = previous;
    return true;
  }
  redo(): boolean {
    const [next, ...rest] = this.#future;
    if (next === undefined) return false;
    this.#past = [...this.#past, this.#present];
    this.#future = rest;
    this.#present = next;
    return true;
  }
}

// ── La receta y sus acciones ──────────────────────────────────────────────
type Ingredient = { name: string; grams: number }; // gramos para BASE_SERVINGS porciones
type Recipe = { title: string; servings: number; ingredients: Ingredient[] };
type Action =
  | { type: 'rename'; title: string }
  | { type: 'servings'; delta: 1 | -1 }
  | { type: 'add'; ingredient: Ingredient }
  | { type: 'remove'; name: string };

const BASE_SERVINGS = 8;
const assertNever = (value: never): never => {
  throw new Error(`Acción no prevista: ${JSON.stringify(value)}`);
};

// El reductor no modifica nada: devuelve una receta nueva (y el tipo lo garantiza).
function applyAction(recipe: DeepReadonly<Recipe>, action: Action): DeepReadonly<Recipe> {
  switch (action.type) {
    case 'rename':
      return { ...recipe, title: action.title.trim() || recipe.title };
    case 'servings':
      return { ...recipe, servings: Math.min(24, Math.max(1, recipe.servings + action.delta)) };
    case 'add':
      return { ...recipe, ingredients: [...recipe.ingredients, action.ingredient] };
    case 'remove':
      return { ...recipe, ingredients: recipe.ingredients.filter((item) => item.name !== action.name) };
    default:
      return assertNever(action);
  }
}
function label(action: Action): string {
  switch (action.type) {
    case 'rename': return `título «${action.title}»`;
    case 'servings': return action.delta > 0 ? '+1 porción' : '−1 porción';
    case 'add': return `añadir ${action.ingredient.name.toLowerCase()}`;
    case 'remove': return `quitar ${action.name.toLowerCase()}`;
    default: return assertNever(action);
  }
}

const editor = new UndoHistory<Recipe>({
  title: 'Pan de muerto',
  servings: 8,
  ingredients: [
    { name: 'Harina', grams: 500 }, { name: 'Azúcar', grams: 100 }, { name: 'Mantequilla', grams: 120 },
    { name: 'Huevo', grams: 150 }, { name: 'Levadura', grams: 10 }, { name: 'Agua de azahar', grams: 15 },
  ],
});
// editor.present.ingredients.push(…) sería un error de tipos (readonly) y, en ejecución, un TypeError.

// ── La interfaz ───────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const titleInput = byId('title', HTMLInputElement);
const list = byId('ingredients', HTMLUListElement);
const undoButton = byId('undo', HTMLButtonElement);
const redoButton = byId('redo', HTMLButtonElement);
const logList = byId('log', HTMLOListElement);
const scaled = (grams: number, servings: number): number => Math.round((grams * servings) / BASE_SERVINGS);

function summary(recipe: DeepReadonly<Recipe>): string {
  const flour = recipe.ingredients.find((item) => item.name === 'Harina');
  return `${recipe.servings} porciones · ${recipe.ingredients.length} ingredientes${flour ? ` · harina ${scaled(flour.grams, recipe.servings)} g` : ''}`;
}
function report(message: string): void {
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
}

function render(): void {
  const recipe = editor.present;
  titleInput.value = recipe.title;
  byId('servings', HTMLOutputElement).textContent = String(recipe.servings);
  list.replaceChildren(...recipe.ingredients.map((item) => {
    const row = Object.assign(document.createElement('li'), { textContent: `${item.name}: ${scaled(item.grams, recipe.servings)} g ` });
    const remove = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Quitar' });
    remove.setAttribute('aria-label', `Quitar ${item.name.toLowerCase()}`);
    remove.addEventListener('click', () => {
      dispatch({ type: 'remove', name: item.name });
      byId('ingredients-title', HTMLHeadingElement).focus(); // el botón pulsado ya no existe
    });
    row.append(remove);
    return row;
  }));
  byId('add-glaze', HTMLButtonElement).disabled = recipe.ingredients.some((item) => item.name === 'Azúcar glas');
  const { past, future } = editor.counts;
  undoButton.disabled = past === 0;
  redoButton.disabled = future === 0;
  byId('counter', HTMLSpanElement).textContent = `${past} para deshacer · ${future} para rehacer`;
}

function dispatch(action: Action): void {
  const next = applyAction(editor.present, action);
  if (JSON.stringify(next) === JSON.stringify(editor.present)) return; // sin cambios, sin historial
  editor.commit(next);
  render();
  report(`✏️ ${label(action)} → ${summary(editor.present)}`);
}
function travel(direction: 'undo' | 'redo'): void {
  const used = direction === 'undo' ? undoButton : redoButton;
  const hadFocus = document.activeElement === used;
  if (!(direction === 'undo' ? editor.undo() : editor.redo())) return;
  render();
  if (hadFocus && used.disabled) (used === undoButton ? redoButton : undoButton).focus(); // no perder el foco
  report(`${direction === 'undo' ? '↩️ deshacer' : '↪️ rehacer'} → ${summary(editor.present)}`);
}

byId('less', HTMLButtonElement).addEventListener('click', () => dispatch({ type: 'servings', delta: -1 }));
byId('more', HTMLButtonElement).addEventListener('click', () => dispatch({ type: 'servings', delta: 1 }));
byId('add-glaze', HTMLButtonElement).addEventListener('click', () => dispatch({ type: 'add', ingredient: { name: 'Azúcar glas', grams: 40 } }));
titleInput.addEventListener('change', () => dispatch({ type: 'rename', title: titleInput.value }));
undoButton.addEventListener('click', () => travel('undo'));
redoButton.addEventListener('click', () => travel('redo'));
document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() !== 'z' || !(event.ctrlKey || event.metaKey)) return;
  if (event.target instanceof HTMLInputElement) return; // en el campo de texto, el deshacer del navegador
  event.preventDefault();
  travel(event.shiftKey ? 'redo' : 'undo');
});

render();
console.log('Listo: cambia las porciones, quita o añade ingredientes y usa «Deshacer»/«Rehacer» (o Ctrl/⌘ + Z)');
```
