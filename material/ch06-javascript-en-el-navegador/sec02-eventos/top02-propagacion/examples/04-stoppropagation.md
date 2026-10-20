---
example_description: "stopPropagation() corta el viaje del evento: un clic en la estrella de una tarjeta también llega a la tarjeta (que abre su detalle) salvo que la estrella lo detenga; los listeners de los antepasados ya no se enteran"
example_tags: "javascript|eventos|propagacion|stoppropagation|burbuja"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tablero · En curso</h1>
  <article class="card" id="card-a">
    <h2>Rediseñar el menú de la cafetería</h2>
    <button type="button" class="star">⭐ Destacar (sin stopPropagation)</button>
  </article>
  <article class="card" id="card-b">
    <h2>Pedir presupuesto de tazas</h2>
    <button type="button" class="star" data-stop>⭐ Destacar (con stopPropagation)</button>
  </article>
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
  font-size: 1.1rem;
  margin-top: 0;
}
h2 {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}
.card {
  margin-bottom: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  cursor: pointer;
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
button:focus-visible {
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// La tarjeta entera abre su detalle al pulsarla (un atajo para el ratón).
for (const card of document.querySelectorAll('.card')) {
  card.addEventListener('click', () => logLine(`📂 abro el detalle de #${card.id}`));
}

for (const star of document.querySelectorAll('.star')) {
  star.addEventListener('click', (event) => {
    logLine(`⭐ destacada: #${star.closest('.card').id}`);
    // stopPropagation(): el evento no sigue subiendo. La tarjeta (y document,
    // y window) ya no reciben este clic.
    if (star.hasAttribute('data-stop')) event.stopPropagation();
  });
}
logLine('Listo: pulsa las dos estrellas');

// stopPropagation NO cancela nada más: el resto de listeners del MISMO
// elemento se ejecutan igual, y la acción por defecto (seguir un enlace,
// enviar un formulario) también. Úsalo con cuidado: en el ejemplo siguiente
// verás lo que rompe.
```
