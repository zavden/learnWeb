---
example_description: "Ejercicio: un aviso de pedidos nuevos se oculta con una animación con fill: 'forwards'. Funciona una vez, pero después showBanner no consigue mostrarlo: la animación terminada sigue aplicando opacity: 0. Al terminar, hay que pasar el valor final al estilo (commitStyles) y quitar la animación (cancel)"
example_tags: "javascript|web-animations|fill|commitstyles|cancel|finished|ejercicio"
exercise: true
exercise_title: "El aviso que no vuelve"
exercise_instructions: "Ejecuta el ejemplo: tres de las cuatro comprobaciones salen ✗; pulsa «Ocultar» y luego «Mostrar»: el aviso no vuelve || En hideBanner, cuando la animación termine (ya hay un await de finished), escribe su valor final en el atributo style con commitStyles() || Justo después, quita la animación con cancel(), para que deje de ganar en la cascada || Ejecuta hasta que las cuatro comprobaciones salgan ✓, y prueba los botones"
exercise_hints: "Una animación con fill: 'forwards' sigue viva en estado finished: getAnimations() la devuelve y su último fotograma gana a element.style || commitStyles() necesita que la animación siga existiendo: llámalo antes de cancel(), nunca después"
exercise_solution_example: 09-ej-el-aviso-que-no-vuelve-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Cocina · pedidos</h1>
  <p id="banner" class="banner" role="status">🔔 Hay 3 pedidos nuevos</p>
  <p>
    <button id="hide" type="button">Ocultar</button>
    <button id="show" type="button">Mostrar</button>
  </p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.banner {
  padding: 0.6rem 0.9rem;
  border-radius: 0.5rem;
  background: #fef3c7;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
async function hideBanner(banner) {
  const fade = banner.animate({ opacity: [1, 0] }, { duration: 400, fill: 'forwards' });
  await fade.finished;
  // TODO 1: escribe en style el valor final de la animación
  // TODO 2: y quita la animación
}

function showBanner(banner) {
  banner.style.opacity = '1';
}

const banner = document.querySelector('#banner');
document.querySelector('#hide').addEventListener('click', async () => {
  await hideBanner(banner);
  console.log('Ocultar → se ve', getComputedStyle(banner).opacity);
});
document.querySelector('#show').addEventListener('click', () => {
  showBanner(banner);
  console.log('Mostrar → se ve', getComputedStyle(banner).opacity);
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', JSON.stringify(actual));
}
const hiding = hideBanner(banner);
banner.getAnimations().forEach((animation) => animation.finish()); // sin esperar los 400 ms
await hiding;
check('tras ocultarlo, se ve con opacity 0', getComputedStyle(banner).opacity, '0');
check('tras ocultarlo, no le queda ninguna animación', banner.getAnimations().length, 0);
check('el valor final está en su atributo style', banner.style.opacity, '0');
showBanner(banner);
check('showBanner lo vuelve a mostrar (opacity 1)', getComputedStyle(banner).opacity, '1');
```
