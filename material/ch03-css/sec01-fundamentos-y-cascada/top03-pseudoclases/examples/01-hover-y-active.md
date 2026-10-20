---
example_description: ":hover (puntero encima) y :active (mientras se pulsa); por qué :active tiene que ir después"
example_tags: "css|pseudoclases|hover|active"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p>Pasa el ratón por encima del botón y después mantenlo pulsado.</p>
<button type="button" class="demo-button">Pruébame</button>
<p class="card">Esta tarjeta también reacciona a <code>:hover</code>: no es solo cosa de enlaces y botones.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.demo-button {
  padding: 8px 16px;
  background: #e2e8f0;
  border: 2px solid #475569;
}

/* :hover → el puntero está encima del elemento (o encima de uno de sus descendientes) */
.demo-button:hover {
  background: #bfdbfe;
}

/* :active → mientras se mantiene pulsado.
   Va DESPUÉS de :hover a propósito: las dos reglas tienen la misma especificidad
   y al pulsar se cumplen las dos (sigues encima), así que gana la última.
   Si la pusieras antes, :hover la taparía y nunca verías el azul oscuro. */
.demo-button:active {
  background: #1d4ed8;
  color: #ffffff;
}

.card {
  border: 2px dashed #94a3b8;
  padding: 8px;
}

.card:hover {
  border-color: #16a34a;
  background: #f0fdf4;
}
```
