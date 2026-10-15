---
example_description: "Revelar al desplazar: cada paso aparece con una transición cuando al menos un 25 % entra en el panel (threshold e intersectionRatio) y deja de observarse con unobserve; sin JavaScript o con movimiento reducido, todo se ve desde el principio"
example_tags: "javascript|intersectionobserver|threshold|unobserve|scroll-reveal|prefers-reduced-motion"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Del cafetal a la taza</h1>
  <p class="toolbar">
    <button id="to-end" type="button">⤓ Ir al final</button>
    <button id="to-start" type="button">⤒ Volver al inicio</button>
  </p>
  <div id="steps-panel" class="panel" tabindex="0" role="region" aria-label="Pasos del café">
    <ol class="steps">
      <li><strong>1. Cosecha</strong> Se recogen a mano solo las cerezas rojas.</li>
      <li><strong>2. Despulpado</strong> Una máquina separa la pulpa del grano.</li>
      <li><strong>3. Fermentación</strong> De 12 a 36 horas en tanques de agua.</li>
      <li><strong>4. Lavado</strong> Se quita el mucílago que queda pegado.</li>
      <li><strong>5. Secado al sol</strong> Dos semanas en patios, removiendo a diario.</li>
      <li><strong>6. Tueste</strong> A 200 °C el grano cruje, crece y se oscurece.</li>
      <li><strong>7. Molienda</strong> Gruesa para prensa francesa, fina para espresso.</li>
      <li><strong>8. En la taza</strong> Agua a 93 °C y cuatro minutos de paciencia.</li>
    </ol>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
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
  margin: 0 0 0.5rem;
}
.toolbar {
  display: flex;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.panel {
  height: 12rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.steps {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0 0.5rem;
  list-style: none;
}
.steps li {
  box-sizing: border-box;
  height: 6rem;
  padding: 0.75rem 1rem;
  border-left: 6px solid #92400e;
  border-radius: 0.375rem;
  background: #fdf6e3;
}
.steps strong {
  display: block;
}
/* El estado oculto solo existe si JS ha marcado la página (.js-reveal) y la
   persona no ha pedido menos movimiento: sin JS, todo se ve. */
@media (prefers-reduced-motion: no-preference) {
  .js-reveal .steps li {
    transition: opacity 0.6s ease-out, translate 0.6s ease-out;
  }
  .js-reveal .steps li:not(.is-visible) {
    opacity: 0;
    translate: 0 1.5rem;
  }
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const panel = document.querySelector('#steps-panel');
const steps = [...panel.querySelectorAll('li')];
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

document.documentElement.classList.add('js-reveal');
let revealed = 0;
let watching = steps.length;

const observer = new IntersectionObserver((entries) => {
  let changed = false;
  for (const entry of entries) {
    // threshold: 0.25 pide un aviso al cruzar el 25 %. Pero también avisa
    // cuando asoma el primer píxel (isIntersecting cambia): comprueba el ratio.
    if (entry.intersectionRatio < 0.25) continue;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target); // ya revelado: no hace falta seguir mirándolo
    revealed += 1;
    watching -= 1;
    changed = true;
    logLine(`✨ revelo → ${entry.target.querySelector('strong').textContent}`);
  }
  if (changed) logLine(`reveladas: ${revealed} de ${steps.length} · sigo observando ${watching}`);
}, { root: panel, threshold: 0.25 });

for (const step of steps) observer.observe(step);

document.querySelector('#to-end').addEventListener('click', () => {
  panel.scrollTop = panel.scrollHeight;
});
document.querySelector('#to-start').addEventListener('click', () => {
  panel.scrollTop = 0;
});
logLine('Listo: desplaza el panel poco a poco o usa «Ir al final»');

// Con movimiento reducido, el CSS no oculta ni mueve nada; la lógica sigue
// igual (marca .is-visible), por si sirve para otra cosa, como la analítica.
// Para un efecto solo visual existe también animation-timeline: view() en CSS.
```
