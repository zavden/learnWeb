---
example_description: "Un CustomEvent despachado dentro de un shadow root no sale del componente aunque burbujee: hace falta composed: true; fuera, event.target se redirige al host (retargeting) y composedPath() enseña el camino completo; los clics nativos ya son composed"
example_tags: "javascript|web-components|shadow-dom|composed|retargeting|composedpath|customevent|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Valora tu café</h1>
  <p class="row">🐛 Café de Chiapas <rating-stars id="buggy-rating"></rating-stars></p>
  <p class="row">✅ Café de Veracruz <rating-stars id="fixed-rating" composed></rating-stars></p>
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
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 0.4rem;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  background: #ffffff;
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
const nodeName = (node) => node === window ? 'window'
  : node instanceof ShadowRoot ? '#shadow-root'
  : node.nodeName.toLowerCase();

const STYLES = `
  .stars { display: flex; }
  button { font: inherit; font-size: 1.3rem; padding: 0 0.15rem; border: 0; background: none; color: #92400e; cursor: pointer; }
  button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 1px; }
`;

class RatingStars extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = STYLES;
    const stars = document.createElement('div');
    stars.className = 'stars';
    for (let value = 1; value <= 5; value += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.value = value;
      button.textContent = '☆';
      button.setAttribute('aria-label', `${value} de 5 estrellas`);
      stars.append(button);
    }
    root.append(style, stars);
    root.addEventListener('click', (event) => this.#choose(event));
  }

  #choose(event) {
    const button = event.target.closest('button');
    if (!button) return;
    const value = Number(button.dataset.value);
    for (const star of this.shadowRoot.querySelectorAll('button')) {
      const on = Number(star.dataset.value) <= value;
      star.textContent = on ? '★' : '☆';
      star.setAttribute('aria-pressed', String(on));
    }
    heardByDocument = false;
    // Se despacha desde el botón, DENTRO del shadow root.
    // 🐛 Sin composed, el evento burbujea… hasta el shadow root, y ahí se queda.
    button.dispatchEvent(new CustomEvent('rating:change', {
      bubbles: true,
      composed: this.hasAttribute('composed'), // ✅ composed: true cruza la frontera
      detail: { value },
    }));
    const mark = this.hasAttribute('composed') ? '✅' : '🐛';
    logLine(`${mark} #${this.id} · composed: ${this.hasAttribute('composed')} → ¿lo oyó document? ${heardByDocument}`);
  }
}
customElements.define('rating-stars', RatingStars);

let heardByDocument = false;
document.addEventListener('rating:change', (event) => {
  heardByDocument = true;
  // Fuera del componente, target es el host: el interior queda oculto.
  logLine(`   document → target: ${nodeName(event.target)}#${event.target.id} · valor ${event.detail.value}`);
  logLine(`   composedPath() → ${event.composedPath().map(nodeName).join(', ')}`);
});

// Los eventos nativos de interacción (click, keydown, input…) son composed.
document.addEventListener('click', (event) => {
  logLine(`   click en document → target: ${nodeName(event.target)}#${event.target.id} · composed: ${event.composed}`);
}, { once: true });

logLine('— simulado: clic en la 4.ª estrella de cada componente —');
for (const id of ['buggy-rating', 'fixed-rating']) {
  document.querySelector(`#${id}`).shadowRoot.querySelector('[data-value="4"]').click();
}
logLine('Listo: pulsa las estrellas de los dos cafés');

// Alternativa muy usada: despachar desde el propio host,
// this.dispatchEvent(new CustomEvent('rating:change', { bubbles: true })):
// el evento nace fuera del shadow root y no necesita composed.
```
