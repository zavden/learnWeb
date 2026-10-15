---
example_description: "El CSSOM y el estilo computado: lo que el navegador entendió de tu CSS"
example_tags: "cssom|estilo-computado|devtools|user-agent"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<h1>Un título sin estilos propios</h1>
<p class="intro">Un párrafo con estilos.</p>
```

# CSS

```css
.intro {
  color: #1d4ed8;
  font-size: 20px;
  margin-left: 2em;
}
```

# JavaScript

```javascript
// CSSOM: el navegador convierte el CSS en objetos, igual que convierte el HTML en el DOM.
// document.styleSheets (JavaScript) los expone. Esta página solo tiene una hoja de estilos.
const sheet = document.styleSheets[0];
for (const rule of sheet.cssRules) {
  console.log('regla →', rule.selectorText, '{', rule.style.cssText, '}');
}

// Estilo computado: el valor FINAL de cada propiedad para un elemento, mezclando tus
// reglas, las del navegador y la herencia. Es lo que enseña DevTools → Computed.
const title = document.querySelector('h1');
const intro = document.querySelector('.intro');
console.log('h1 font-size  (el navegador pone 2em) →', getComputedStyle(title).fontSize);
console.log('.intro margin-left (2em × 20px)       →', getComputedStyle(intro).marginLeft);
console.log('.intro color (#1d4ed8)                →', getComputedStyle(intro).color);
console.log('.intro display (nadie lo escribió)    →', getComputedStyle(intro).display);
```
