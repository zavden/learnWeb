---
example_description: "calc() mezcla unidades distintas en una sola cuenta: % menos rem, divisiones y multiplicaciones"
example_tags: "css|funciones|calc"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="bar minus">width: calc(100% - 4rem) → todo el ancho menos 4rem</div>
<div class="bar third">width: calc(100% / 3) → un tercio</div>
<div class="bar mixed">width: calc(2 * 6rem + 20px) → 2 × 96px + 20px = 212px</div>
<p>Cambia el ancho de la vista previa: las dos primeras barras se recalculan; la tercera no depende del contenedor.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.bar {
  background: #bfdbfe;
  margin: 6px 0;
  padding: 4px 0;
  font-size: 0.85rem;
}

/* calc() hace la cuenta en el momento del diseño, cuando ya se sabe cuánto es 100%.
   Puede mezclar % con rem, px, vw… algo imposible de escribir a mano. */
.minus {
  width: calc(100% - 4rem);
}

.third {
  width: calc(100% / 3);
}

/* En * hace falta un número sin unidad en uno de los lados (2 * 6rem);
   en /, el divisor sin unidad (100% / 3). */
.mixed {
  width: calc(2 * 6rem + 20px);
}
```
