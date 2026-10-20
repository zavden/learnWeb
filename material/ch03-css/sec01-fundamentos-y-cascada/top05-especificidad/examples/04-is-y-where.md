---
example_description: ":is() vale lo que su argumento más específico; :where() vale siempre cero y se sobrescribe con cualquier regla"
example_tags: "css|especificidad|is|where"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p>Imagina que las dos primeras reglas vienen de una librería y la tercera es tuya.</p>
<p><button type="button" class="btn-a">.btn-a, estilo de la librería con :is() → (0, 1, 0)</button></p>
<p><button type="button" class="btn-b">.btn-b, estilo de la librería con :where() → (0, 0, 0)</button></p>
<ul class="legend">
  <li class="swatch-red">Rojo ← la librería</li>
  <li class="swatch-green">Verde ← tu regla <code>button</code> → (0, 0, 1)</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* --- Librería --- */
:is(.btn-a)    { background: #fecaca; }   /* (0,1,0): :is() vale lo que su argumento MÁS específico */
:where(.btn-b) { background: #fecaca; }   /* (0,0,0): :where() vale siempre cero */

/* --- Tu CSS, escrito después --- */
button {                                  /* (0,0,1) */
  background: #bbf7d0;
  padding: 8px 12px;
  border: 1px solid #475569;
}

/* (0,0,1) < (0,1,0) → tu regla no puede con .btn-a: sigue rojo.
   (0,0,1) > (0,0,0) → tu regla sí puede con .btn-b: verde.
   Por eso :where() es ideal para estilos base y resets: cualquier regla los sobrescribe. */

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-red { background: #fecaca; }
.swatch-green { background: #bbf7d0; }
```
