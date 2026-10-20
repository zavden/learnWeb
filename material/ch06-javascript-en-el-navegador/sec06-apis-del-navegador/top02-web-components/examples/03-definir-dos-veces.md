---
example_description: "Registrar dos veces el mismo nombre lanza NotSupportedError (pasa cuando el script de un componente se carga dos veces), y también registrar la misma clase con otro nombre; la guarda customElements.get(nombre) antes de define lo evita, y una subclase permite un segundo nombre"
example_tags: "javascript|web-components|custom-elements|customelements-get|notsupportederror|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Reseñas de la tienda</h1>
  <p>Café de Chiapas <star-rating value="4"></star-rating></p>
  <p>Cacao de Tabasco <star-rating value="5"></star-rating></p>
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
star-rating {
  color: #92400e;
  letter-spacing: 0.1em;
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

class StarRating extends HTMLElement {
  connectedCallback() {
    const value = Number(this.getAttribute('value'));
    this.textContent = '★'.repeat(value) + '☆'.repeat(5 - value);
    this.setAttribute('role', 'img');
    this.setAttribute('aria-label', `${value} de 5 estrellas`);
  }
}

// Imagina que esto está en star-rating.js, y que dos partes de la web lo
// incluyen (dos paquetes de scripts, un widget pegado dos veces…).
function loadRatingScript(label) {
  try {
    customElements.define('star-rating', StarRating);
    logLine(`✅ ${label} → define('star-rating') ok`);
  } catch (error) {
    logLine(`🐛 ${label} → ${error.name}: ${error.message}`);
  }
}
loadRatingScript('primera carga');
loadRatingScript('segunda carga');

// 🐛 La misma clase tampoco puede tener dos nombres.
try {
  customElements.define('rating-stars', StarRating);
} catch (error) {
  logLine(`🐛 misma clase, otro nombre → ${error.name}: ${error.message}`);
}

// ✅ La guarda: pregunta antes de registrar.
function loadRatingScriptSafely(label) {
  if (customElements.get('star-rating')) {
    logLine(`✅ ${label} → ya estaba registrado: no hago nada`);
    return;
  }
  customElements.define('star-rating', StarRating);
}
loadRatingScriptSafely('carga con guarda');

// ✅ ¿Otro nombre para el mismo componente? Una subclase vacía.
customElements.define('rating-stars', class extends StarRating {});
logLine(`✅ subclase → define('rating-stars') ok · ¿definido? ${customElements.get('rating-stars') !== undefined}`);
```
