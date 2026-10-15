---
example_description: "Combinadores de hermanos: + elige solo el siguiente y ~ todos los siguientes; ninguno mira hacia atrás"
example_tags: "css|selectores|combinadores|hermanos"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="legend">Fondo verde ← <code>h2 + p</code> · Barra azul ← <code>h2 ~ p</code></div>
<p>p antes del h2 → ninguno: los combinadores de hermanos solo miran hacia delante</p>
<h2>El h2</h2>
<p>1.er p justo después del h2 → <code>+</code> ✅ · <code>~</code> ✅</p>
<p>2.º p → <code>+</code> ❌ · <code>~</code> ✅</p>
<div>Un div en medio (no es un p: ninguna regla lo marca)</div>
<p>3.er p, después del div → <code>~</code> ✅ (salta lo que haya en medio)</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* + (hermano adyacente): el p que va INMEDIATAMENTE después de un h2, con el mismo padre */
h2 + p {
  background: #bbf7d0;
}

/* ~ (hermanos siguientes): TODOS los p que van después de un h2, con el mismo padre */
h2 ~ p {
  border-left: 6px solid #2563eb;
  padding-left: 6px;
}
```
