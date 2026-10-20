---
example_description: "Adelanto de JavaScript: un control deslizante cambia una sola variable (--hue) y el CSS recalcula todos los colores"
example_tags: "css|custom-properties|javascript|oklch"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p>
  <label for="hue">Tono</label>
  <input id="hue" type="range" min="0" max="360" value="260">
  <output id="hue-value" for="hue">260</output>
</p>
<div class="card">
  <h3 class="title">Una tarjeta con su propio tono</h3>
  <p>Todos los colores salen de <code>--hue</code>: el fondo, el borde y el título.</p>
</div>
```

# CSS

```css
:root {
  --hue: 260;
}

body {
  font-family: system-ui, sans-serif;
}

/* Tres colores derivados de UN número. oklch() mantiene la misma luminosidad
   en cualquier tono (lección de color), así que el contraste no cambia. */
.card {
  background: oklch(95% 0.03 var(--hue));
  border: 3px solid oklch(60% 0.15 var(--hue));
  padding: 0 12px;
}

.title {
  color: oklch(40% 0.15 var(--hue));
}
```

# JavaScript

```javascript
// Adelanto: esto se explica en el capítulo de JavaScript.
// Al mover el control, escribimos el nuevo valor de --hue en <html>.
// El JavaScript solo cambia UN número; el CSS hace todo lo demás.
const slider = document.querySelector('#hue');
const output = document.querySelector('#hue-value');

slider.addEventListener('input', () => {
  document.documentElement.style.setProperty('--hue', slider.value);
  output.textContent = slider.value;
});
```
