---
example_description: "Solución: $(selector, Tipo) comprueba con instanceof la lista y el contador (un <span>, así que se escribe su textContent); el listener estrecha event.target con instanceof Element y sube con closest('button'), y comprueba dataset.song antes de usarlo. Cuatro comprobaciones ✓ y ningún as"
example_tags: "typescript|ejercicio|solucion|dom|eventos|delegacion|event-target|instanceof"
example_stage: final-solution
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Tus favoritas · <span id="count">0</span></h1>
  <ul id="playlist" class="playlist">
    <li>La Llorona · Chavela Vargas
      <button type="button" data-song="la-llorona" aria-pressed="false" aria-label="Favorita: La Llorona"><span class="icon" aria-hidden="true">★</span> Favorita</button></li>
    <li>Cucurrucucú paloma · Lola Beltrán
      <button type="button" data-song="cucurrucucu" aria-pressed="false" aria-label="Favorita: Cucurrucucú paloma"><span class="icon" aria-hidden="true">★</span> Favorita</button></li>
  </ul>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2933; background: #f5f7fa; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.15rem; margin: 0 0 0.5rem; }
.playlist { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.4rem; }
.playlist li { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; border: 1px solid #cbd2d9; border-radius: 0.5rem; background: #fff; }
button { font: inherit; color: inherit; padding: 0.2rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: #fff; cursor: pointer; }
button[aria-pressed="true"] { background: #fef3c7; border-color: #92400e; }
.icon { font-size: 1.2rem; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
```

# TypeScript

```typescript
const favorites = new Set<string>();

// $ comprueba lo que promete: existe y es de la clase pedida.
function $<T extends Element>(selector: string, type: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Falta «${selector}» o no es un ${type.name}`);
  return element;
}
const playlist = $('#playlist', HTMLUListElement);
const counter = $('#count', HTMLSpanElement); // un <span>: no tiene value

playlist.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return; // descarta null y los nodos que no son elementos
  const button = event.target.closest('button'); // HTMLButtonElement | null: el icono sube hasta su botón
  const song = button?.dataset.song; // string | undefined
  if (!button || song === undefined) return; // un clic fuera de los botones
  if (favorites.has(song)) favorites.delete(song);
  else favorites.add(song);
  button.setAttribute('aria-pressed', String(favorites.has(song)));
  counter.textContent = String(favorites.size);
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
// Simulan clics: en el icono de La Llorona, en el texto de su botón y fuera de los botones.
function check(description: string, actual: unknown, expected: unknown): void {
  if (Object.is(actual, expected)) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}
function clickOn(element: Element | null): void {
  element?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}
const firstButton = document.querySelector('[data-song="la-llorona"]');
clickOn(document.querySelector('[data-song="la-llorona"] .icon'));
check('un clic en el icono marca la canción', firstButton?.getAttribute('aria-pressed'), 'true');
check('el contador muestra 1 favorita', document.getElementById('count')?.textContent, '1');
clickOn(firstButton);
check('un clic en el botón la desmarca', firstButton?.getAttribute('aria-pressed'), 'false');
clickOn(document.querySelector('#playlist li'));
check('un clic fuera de los botones no marca nada', document.querySelectorAll('[aria-pressed="true"]').length, 0);
```
