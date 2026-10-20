---
example_description: "Ejercicio: el manejador de una lista de canciones favoritas compila sin errores porque está lleno de as, y cuatro comprobaciones lo delatan (el clic en el icono, el contador que no cambia, el clic fuera de los botones). Quita todos los as y estrecha de verdad"
example_tags: "typescript|ejercicio|dom|eventos|delegacion|event-target|asercion|instanceof"
exercise: true
exercise_title: "Un manejador de eventos sin as"
exercise_instructions: "Al abrirlo no hay errores de tipos, pero las cuatro comprobaciones salen ✗: cada as del script es una afirmación que nadie comprueba || Escribe la función $(selector, Tipo) de la lección 2, que comprueba con instanceof, y úsala para la lista y el contador (mira en el HTML qué etiqueta es cada uno) || En el listener, sustituye event.target as HTMLButtonElement por una comprobación real: event.target instanceof Element y después closest('button') || Si no hay botón o no tiene data-song, el clic no hace nada (return) || El objetivo: las cuatro comprobaciones ✓, ningún error de tipos y ningún as en el script"
exercise_hints: "El contador es un <span>, no un <output>: un <span> no tiene value, así que hay que escribir su textContent || closest('button') devuelve HTMLButtonElement | null: con un if (!button) return; el resto del código ya sabe que existe || dataset.song es string | undefined: compruébalo antes de usarlo como clave del Set"
exercise_solution_example: 07-ej-manejador-sin-as-solucion.md
exercise_locked_files: index.html,styles.css
example_stage: exercise
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

// TODO 1: escribe $(selector, Tipo) con instanceof y úsala en estas dos líneas, sin as.
const playlist = document.querySelector('#playlist') as HTMLUListElement;
const counter = document.querySelector('#count') as HTMLOutputElement;

// TODO 2: sin as. Comprueba event.target y sube hasta el botón con closest.
playlist.addEventListener('click', (event) => {
  const button = event.target as HTMLButtonElement;
  const song = button.dataset.song as string;
  if (favorites.has(song)) favorites.delete(song);
  else favorites.add(song);
  button.setAttribute('aria-pressed', String(favorites.has(song)));
  counter.value = String(favorites.size);
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
