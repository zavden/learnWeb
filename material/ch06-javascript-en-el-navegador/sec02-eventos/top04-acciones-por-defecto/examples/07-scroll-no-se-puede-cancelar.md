---
example_description: "El evento scroll no se puede cancelar (cancelable → false): llega DESPUÉS de desplazar y preventDefault() no hace nada; para bloquear el scroll de la página mientras hay un panel abierto se usa CSS (overflow: hidden)"
example_tags: "javascript|eventos|scroll|preventdefault|cancelable|overflow|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Términos del servicio</h1>
  <div class="controls">
    <label><input type="checkbox" id="block-js"> 🐛 Bloquear el scroll con <code>preventDefault</code> en <code>scroll</code></label>
    <label><input type="checkbox" id="block-css"> ✅ Bloquear el scroll con <code>overflow: hidden</code></label>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
  <section class="long-text">
    <h2>1. Pedidos</h2>
    <p>Los pedidos se confirman por correo en un plazo de 24 horas hábiles.</p>
    <h2>2. Envíos</h2>
    <p>Enviamos a toda la República Mexicana. Los productos refrigerados solo se envían a la Ciudad de México.</p>
    <h2>3. Devoluciones</h2>
    <p>Puedes devolver un producto sin abrir en los 15 días siguientes a la entrega.</p>
    <h2>4. Pagos</h2>
    <p>Aceptamos tarjeta, transferencia y pago en tiendas de conveniencia.</p>
  </section>
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
/* ✅ La forma correcta: sin barra de desplazamiento, no hay scroll que bloquear. */
html.no-scroll {
  overflow: hidden;
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
.controls {
  position: sticky;
  top: 0;
  display: grid;
  gap: 0.35rem;
  padding: 0.5rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
.long-text h2 {
  font-size: 1rem;
  margin-top: 4rem;
}
.long-text p {
  margin-bottom: 12rem;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
const blockJs = document.querySelector('#block-js');
const blockCss = document.querySelector('#block-css');
const logList = document.querySelector('#log');
let reported = false;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 🐛 scroll avisa de que la página YA se ha desplazado: no hay nada que
//    cancelar. preventDefault() no hace nada (y no da ningún error).
function blockScroll(event) {
  event.preventDefault();
  if (reported) return; // scroll llega muchas veces por segundo: avisamos una
  reported = true;
  logLine(`🐛 scroll · cancelable: ${event.cancelable} · defaultPrevented: ${event.defaultPrevented} · la página se movió igual`);
}
blockJs.addEventListener('change', () => {
  reported = false;
  if (blockJs.checked) window.addEventListener('scroll', blockScroll);
  else window.removeEventListener('scroll', blockScroll);
});

// ✅ Mientras un panel o un modal está abierto, quita el desplazamiento con CSS.
blockCss.addEventListener('change', () => {
  document.documentElement.classList.toggle('no-scroll', blockCss.checked);
  logLine(`✅ overflow: hidden ${blockCss.checked ? 'activado: la página ya no se desplaza' : 'desactivado'}`);
});
logLine('Listo: marca la primera casilla y desplaza la página; luego, prueba la segunda');

// ¿Y cancelar la rueda (wheel)? Se puede, pero no basta: el usuario también
// desplaza con el teclado, la barra o arrastrando en una pantalla táctil.
// Un <dialog> abierto con showModal() no bloquea el scroll de la página por
// sí solo; la clase en <html> es la forma habitual de hacerlo.
```
