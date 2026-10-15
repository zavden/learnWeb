---
example_description: "display: contents en un envoltorio hace que sus hijos (los nietos del contenedor) pasen a ser elementos flex y compartan el gap"
example_tags: "css|flexbox|display-contents|gap"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="label">El grupo de formato viene envuelto en un <code>div</code> (por ejemplo, porque lo genera otro componente).</p>

<p class="caption">Sin más: el <code>div</code> es UN elemento flex y sus botones van en línea dentro de él</p>
<div class="toolbar">
  <button type="button">Deshacer</button>
  <div class="format-group">
    <button type="button">Negrita</button>
    <button type="button">Cursiva</button>
    <button type="button">Subrayado</button>
  </div>
  <button type="button">Guardar</button>
</div>

<p class="caption">Con <code>display: contents</code> en el <code>div</code>: los cinco botones son elementos flex</p>
<div class="toolbar">
  <button type="button">Deshacer</button>
  <div class="format-group is-contents">
    <button type="button">Negrita</button>
    <button type="button">Cursiva</button>
    <button type="button">Subrayado</button>
  </div>
  <button type="button">Guardar</button>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.toolbar {
  display: flex;
  gap: 12px;
  padding: 6px;
  border: 2px dashed #7c3aed;
}

.toolbar button {
  padding: 4px 8px;
  border: 1px solid #4338ca;
  border-radius: 6px;
  background: #e0e7ff;
  color: #1e293b;
  font: inherit;
  font-size: 0.8rem;
}

.toolbar button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.format-group {
  background: #fed7aa;      /* para ver la caja del grupo cuando existe */
}

/* Solo los hijos DIRECTOS de un contenedor flex son elementos flex. En la primera
   barra, el div es un elemento y sus botones son cajas inline-block DENTRO de él:
   el gap de la barra no les llega y los separa el espacio en blanco del HTML.

   display: contents borra la caja del div (y su fondo naranja), pero no a sus hijos:
   los botones pasan a ser hijos de la barra a efectos de layout, con el mismo gap.
   Úsalo en div y span; en elementos con significado (ul, button, table…) algunos
   navegadores han tenido fallos de accesibilidad (lección de display). */
.is-contents {
  display: contents;
}
```
