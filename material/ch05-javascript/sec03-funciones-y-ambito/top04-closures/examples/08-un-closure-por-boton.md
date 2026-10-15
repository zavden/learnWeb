---
example_description: "Tres botones de valoración, cada uno con su propio contador guardado en un closure: estado por elemento sin variables globales"
example_tags: "javascript|closures|estado|dom|botones"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main class="poll">
  <h1>¿Qué te pareció el taller?</h1>
  <div class="options">
    <button type="button" data-option="Muy útil">👍 Muy útil <output>0</output></button>
    <button type="button" data-option="Regular">😐 Regular <output>0</output></button>
    <button type="button" data-option="Poco útil">👎 Poco útil <output>0</output></button>
  </div>
  <p class="hint">Pulsa varias veces: cada botón lleva su propia cuenta.</p>
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
.poll {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
h1 {
  font-size: 1.3rem;
}
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.5rem 0.9rem;
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
output {
  font-weight: 700;
  margin-left: 0.35rem;
}
.hint {
  color: #52606d;
}
```

# JavaScript

```javascript
// querySelectorAll y addEventListener se estudian en el capítulo 6 (el DOM y los
// eventos); aquí basta con saber que el callback se llama en cada clic.

// La fábrica crea un closure por botón: cada uno con SU variable votes.
function makeVoteHandler(button) {
  let votes = 0;                              // privada de este botón
  const counter = button.querySelector('output');
  return () => {
    votes += 1;
    counter.textContent = votes;
    console.log(`${button.dataset.option}: ${votes}`);
  };
}

for (const button of document.querySelectorAll('[data-option]')) {
  button.addEventListener('click', makeVoteHandler(button));
}
// No hay ningún objeto ni variable global con los votos: cada cuenta vive
// dentro del closure de su botón.
```
