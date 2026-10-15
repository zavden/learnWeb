---
example_description: "addEventListener deduce el tipo del evento a partir de su nombre con HTMLElementEventMap: 'keydown' da un KeyboardEvent (event.key), 'click' un PointerEvent y 'input' un Event sin datos propios. En una función normal, this es el elemento"
example_tags: "typescript|dom|eventos|addeventlistener|htmlelementeventmap|keyboardevent|pointerevent|this"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Buscar recetas</h1>
  <p class="row">
    <label for="search">Receta</label>
    <input id="search" type="search" maxlength="40" autocomplete="off">
    <button type="button">Buscar</button>
  </p>
  <p class="hint"><span id="count">0/40</span> · Enter busca, Escape borra</p>
  <ol class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 0; }
label { font-weight: 600; }
input, button { font: inherit; color: inherit; }
input { padding: 0.25rem 0.4rem; border: 1px solid #7b8794; border-radius: 0.4rem; background: #fff; }
button { padding: 0.3rem 0.8rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
.hint { color: #52606d; font-size: 0.9rem; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; min-height: 1.2rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// El mapa que usa addEventListener: nombre del evento → tipo del objeto evento.
type Checks = [
  Expect<Equal<HTMLElementEventMap['keydown'], KeyboardEvent>>,
  Expect<Equal<HTMLElementEventMap['click'], PointerEvent>>, // no MouseEvent: un clic es un PointerEvent
  Expect<Equal<HTMLElementEventMap['input'], Event>>, // sin datos propios
  Expect<Equal<HTMLElementEventMap['submit'], SubmitEvent>>,
];

const search = document.querySelector('input');
const searchButton = document.querySelector('button');
const counter = document.getElementById('count'); // HTMLElement | null
const logList = document.querySelector('ol');
if (!search || !searchButton || !counter || !logList) throw new Error('Falta un elemento de la página');

const report = (text: string): void => {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
};
const runSearch = (): string => (search.value.trim() === '' ? '⚠️ escribe algo' : `🔎 buscar «${search.value.trim()}»`);

// 'keydown' → event: KeyboardEvent, sin anotar nada (tipado contextual).
search.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') report(`⌨️ keydown · key: ${event.key} → ${runSearch()}`);
  if (event.key === 'Escape') {
    search.value = '';
    counter.textContent = '0/40';
    report(`⌨️ keydown · key: ${event.key} → campo vacío`);
  }
});

// 'click' → event: PointerEvent (event.key sería TS2339: no es un evento de teclado).
searchButton.addEventListener('click', (event) => {
  report(`🖱️ ${event.type} · ¿PointerEvent? ${event instanceof PointerEvent} → ${runSearch()}`);
});

// Con function (no flecha), this es el elemento: la firma dice (this: HTMLInputElement, ev) => any.
search.addEventListener('input', function () {
  counter.textContent = `${this.value.length}/40`;
});
report('Listo: escribe una receta y pulsa Enter, Escape o «Buscar»');
```
