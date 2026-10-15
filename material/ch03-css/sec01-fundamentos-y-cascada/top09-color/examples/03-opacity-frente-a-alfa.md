---
example_description: "opacity vuelve transparente el elemento entero, texto incluido; un color con alfa solo afecta al fondo"
example_tags: "css|color|alfa|opacity"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="stage">
  <div class="card with-opacity">❌ <code>opacity: 0.5</code>: querías un fondo translúcido… y también se ha aclarado el texto.</div>
  <div class="card with-alpha">✅ <code>background: rgb(96 165 250 / 0.5)</code>: solo el fondo deja ver el amarillo; el texto sigue nítido.</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Un fondo amarillo detrás, para ver la transparencia */
.stage {
  background: #fde68a;
  padding: 12px;
}

.card {
  color: #0f172a;
  padding: 10px;
  margin: 8px 0;
}

/* 🐛 opacity se aplica al elemento ENTERO: fondo, borde, texto y todos sus hijos.
   El texto oscuro se mezcla con el amarillo y pierde contraste. */
.with-opacity {
  background: rgb(96 165 250);
  opacity: 0.5;
}

/* ✅ El alfa del COLOR (tras la barra) solo afecta a esa propiedad: el fondo. */
.with-alpha {
  background: rgb(96 165 250 / 0.5);
}
```
