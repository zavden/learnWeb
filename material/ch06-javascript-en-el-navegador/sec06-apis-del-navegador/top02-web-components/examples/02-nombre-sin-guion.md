---
example_description: "El nombre de un custom element necesita un guion (y minúsculas): customElements.define('card', …) lanza SyntaxError; una etiqueta <card> en el HTML es un HTMLUnknownElement para siempre, mientras que <recipe-card> es un HTMLElement que espera su definición"
example_tags: "javascript|web-components|custom-elements|nombres|syntaxerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Recetas de la semana</h1>
  <card title="Pozole rojo">🐛 &lt;card&gt;: no se puede registrar</card>
  <recipe-card title="Sopa de lima">✅ &lt;recipe-card&gt;</recipe-card>
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
card,
recipe-card {
  display: block;
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd2d9;
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

class RecipeCard extends HTMLElement {
  connectedCallback() {
    this.textContent = `🍲 ${this.getAttribute('title')} · registrado como <${this.localName}>`;
  }
}

// Sin definir todavía: ¿qué ha creado el parser con cada etiqueta?
logLine(`<card> → ${document.querySelector('card').constructor.name}`);
logLine(`<recipe-card> → ${document.querySelector('recipe-card').constructor.name} (esperando su definición)`);

// 🐛 Un nombre sin guion no es válido para un elemento propio.
for (const tagName of ['card', 'recipeCard']) {
  try {
    customElements.define(tagName, class extends RecipeCard {});
  } catch (error) {
    logLine(`🐛 define('${tagName}') → ${error.name}: ${error.message}`);
  }
}

// ✅ Con guion y en minúsculas.
customElements.define('recipe-card', RecipeCard);
logLine(`✅ define('recipe-card') → ${document.querySelector('recipe-card').constructor.name}`);

// Por qué el guion: ninguna etiqueta de HTML lo tendrá nunca (<card> podría
// existir mañana), y el parser sabe de un vistazo que es un elemento propio.
// Tampoco valen los nombres reservados con guion de SVG y MathML, como
// font-face o color-profile.
```
