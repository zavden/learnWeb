---
example_description: "Un título fluido en vw mide lo mismo en la columna principal que en una barra lateral estrecha, porque vw es la ventana. cqi sin ningún contenedor tampoco lo arregla: recurre al viewport pequeño (svi). Con container-type en cada columna, cada título se adapta a la suya"
example_tags: "css|responsive|container-queries|cqi|vw|tipografia-fluida|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">Columna principal (312px) y barra lateral (144px), con 6px de relleno. Los títulos deberían ser más pequeños en la barra.</p>

<p class="label">❌ <code>6vw</code>: los dos títulos miden 32px (el máximo): el de la barra, enorme para su columna</p>
<div class="layout uses-vw"><section><h3>Recetas de temporada</h3></section><aside><h3>Lo más leído</h3></aside></div>

<p class="label">❌ <code>6cqi</code> sin contenedor: igual, porque sin contenedor cqi vale lo que svi (la ventana)</p>
<div class="layout uses-cqi"><section><h3>Recetas de temporada</h3></section><aside><h3>Lo más leído</h3></aside></div>

<p class="label">✅ <code>6cqi</code> y <code>container-type</code> en cada columna: 26px y 16px</p>
<div class="layout uses-cqi has-containers"><section><h3>Recetas de temporada</h3></section><aside><h3>Lo más leído</h3></aside></div>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .label { margin: 8px 0 4px; font-size: 0.72rem; }

.layout {
  display: grid;
  grid-template-columns: 1fr 9rem;
  gap: 8px;
}

.layout > * { padding: 6px; background: #f1f5f9; }
.layout aside { background: #ede9fe; }
.layout h3 { margin: 0; line-height: 1.1; }

/* ❌ vw es la VENTANA: 480px en esta tarjeta, para todos los títulos de la
   página. 8 + 6 × 4.8 = 36.8px → clamp() lo deja en 32px, en las dos columnas. */
.uses-vw h3 { font-size: clamp(1rem, 0.5rem + 6vw, 2rem); }

/* cqi mide el CONTENEDOR más cercano… */
.uses-cqi h3 { font-size: clamp(1rem, 0.5rem + 6cqi, 2rem); }

/* 🐛 …pero si no hay ninguno, cqi vale lo mismo que svi: el 1 % del viewport
   pequeño. En un escritorio, lo mismo que vw. Sin aviso.
   ✅ Con container-type, cada columna es un contenedor (su ancho lo pone la
   rejilla, así que es seguro). cqi mide el ancho de CONTENIDO del contenedor:
   8 + 6 % de 300 = 26px; 8 + 6 % de 132 = 15.9 → el mínimo, 16px. */
.has-containers > * { container-type: inline-size; }
```
