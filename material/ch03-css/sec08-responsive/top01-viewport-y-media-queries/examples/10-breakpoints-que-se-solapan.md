---
example_description: "max-width: 320px y min-width: 320px se cumplen las dos a la vez cuando el viewport mide exactamente 320px: se ven el botón de menú y los enlaces. Con la sintaxis de rangos (width < 320px / width >= 320px) siempre se cumple solo una"
example_tags: "css|responsive|media-queries|breakpoints|rangos|min-width|max-width|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Tres «mini viewports»: cada <code>iframe</code> es una ventana del ancho exacto que dice su rótulo, con la misma cabecera dentro. En móvil debe verse <strong>solo «☰ Menú»</strong>; en escritorio, <strong>solo los enlaces</strong>.</p>

<p class="label">❌ <code>max-width: 320px</code> + <code>min-width: 320px</code>, a 300px: bien</p>
<iframe class="mini" style="width: 300px" title="Cabecera con max-width y min-width, a 300px" srcdoc="
<div class='bar'><strong>Vivero</strong><span class='menu'>☰ Menú</span><span class='links'>Plantas · Macetas · Cursos</span></div>
<style>
  body { margin: 0; font: 13px system-ui, sans-serif; color: #1e293b; }
  .bar { display: flex; gap: 12px; align-items: center; padding: 10px; }
  .menu, .links { display: none; }
  @media (max-width: 320px) { .menu { display: inline; } }
  @media (min-width: 320px) { .links { display: inline; } }
</style>"></iframe>

<p class="label">❌ Las mismas dos media queries, a <strong>320px exactos</strong>: se cumplen las dos</p>
<iframe class="mini" style="width: 320px" title="Cabecera con max-width y min-width, a 320px" srcdoc="
<div class='bar'><strong>Vivero</strong><span class='menu'>☰ Menú</span><span class='links'>Plantas · Macetas · Cursos</span></div>
<style>
  body { margin: 0; font: 13px system-ui, sans-serif; color: #1e293b; }
  .bar { display: flex; gap: 12px; align-items: center; padding: 10px; }
  .menu, .links { display: none; }
  @media (max-width: 320px) { .menu { display: inline; } }
  @media (min-width: 320px) { .links { display: inline; } }
</style>"></iframe>

<p class="label">✅ <code>width &lt; 320px</code> + <code>width &gt;= 320px</code>, a 320px: solo una</p>
<iframe class="mini" style="width: 320px" title="Cabecera con sintaxis de rangos, a 320px" srcdoc="
<div class='bar'><strong>Vivero</strong><span class='menu'>☰ Menú</span><span class='links'>Plantas · Macetas · Cursos</span></div>
<style>
  body { margin: 0; font: 13px system-ui, sans-serif; color: #1e293b; }
  .bar { display: flex; gap: 12px; align-items: center; padding: 10px; }
  .menu, .links { display: none; }
  @media (width < 320px) { .menu { display: inline; } }
  @media (width >= 320px) { .links { display: inline; } }
</style>"></iframe>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

/* El ancho del iframe (sin contar el borde) es el viewport de su documento:
   las media queries de dentro miden ESE ancho, no el de esta página. */
.mini {
  display: block;
  height: 40px;
  border: 2px solid #64748b;
  border-radius: 6px;
  background: #ffffff;
}

/* 🐛 min-width y max-width INCLUYEN el valor: max-width: 320px es «≤ 320» y
   min-width: 320px es «≥ 320». A 320px exactos se cumplen las dos y se aplican
   las reglas de ambas: aparecen el botón y los enlaces.
   El parche clásico, max-width: 319px, abre el problema contrario: con zoom o
   en pantallas de alta densidad el viewport puede medir 319.5px, y entonces
   no se cumple NINGUNA. Por eso se veía max-width: 319.98px.
   ✅ La sintaxis de rangos dice exactamente lo que quieres: < y >= no se
   solapan ni dejan huecos. */
```
