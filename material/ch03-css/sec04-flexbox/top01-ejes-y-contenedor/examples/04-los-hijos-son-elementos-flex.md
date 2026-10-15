---
example_description: "Los hijos de un contenedor flex cambian de reglas: un span acepta width (se «bloquifica») y los márgenes ya no colapsan ni se escapan"
example_tags: "css|flexbox|elementos-flex|margenes|display"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="label">Mismo HTML y mismo CSS en los hijos. Lo naranja es <strong>margen</strong> (color de DevTools).</p>

<div class="column">
  <p class="caption">Flujo normal</p>
  <div class="box">
    <span class="pill">span · width: 140px</span>
    <p class="note">Párrafo con margin: 12px</p>
    <p class="note">Párrafo con margin: 12px</p>
  </div>
  <p class="result">El span ignora <code>width</code>. Entre párrafos, 12px: los márgenes colapsan.</p>
</div>

<div class="column">
  <p class="caption">Contenedor flex (<code>column</code>)</p>
  <div class="box is-flex">
    <span class="pill">span · width: 140px</span>
    <p class="note">Párrafo con margin: 12px</p>
    <p class="note">Párrafo con margin: 12px</p>
  </div>
  <p class="result">El span mide 140px. Entre párrafos, 24px: los márgenes se suman.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption,
.result {
  margin: 0 0 4px;
  font-size: 0.75rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: calc(50% - 12px);
  margin-right: 8px;
}

/* El fondo naranja del padre deja ver los márgenes (transparentes) de los hijos. */
.box {
  border: 2px dashed #7c3aed;
  background: #fed7aa;
}

.pill {
  width: 140px;
  background: #e0e7ff;
  font-size: 0.75rem;
}

.note {
  margin: 12px;
  padding: 2px 6px;
  background: #ffffff;
  font-size: 0.75rem;
}

/* Al hacerse flex, cada hijo directo es un ELEMENTO FLEX y cambian sus reglas:
   - Se «bloquifica»: el span (inline) pasa a ser de bloque y acepta width y height.
     En DevTools → Computed verás display: block aunque nadie lo haya escrito.
   - Los márgenes NO colapsan: entre los párrafos hay 12 + 12 = 24px. Tampoco colapsan
     con los del contenedor ni se escapan de él, aunque no tenga borde ni padding.
   - float, clear y vertical-align se ignoran en los elementos flex.
   Los NIETOS (el texto dentro de cada párrafo) siguen en su flujo normal de siempre. */
.is-flex {
  display: flex;
  flex-direction: column;
  align-items: flex-start;   /* que no se estiren a lo ancho: así se ve el width del span */
}
```
