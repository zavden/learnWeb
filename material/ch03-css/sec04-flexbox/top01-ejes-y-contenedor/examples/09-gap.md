---
example_description: "gap separa los elementos flex solo entre ellos, sin el margen sobrante en los bordes que dejan los márgenes; con dos valores, separa filas y columnas"
example_tags: "css|flexbox|gap|row-gap|column-gap|margenes"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Con <code>margin-right</code> y <code>margin-bottom</code> en cada foto: sobra margen a la derecha y abajo (en naranja)</p>
<div class="gallery is-margins">
  <span>Playa</span><span>Bosque</span><span>Desierto</span><span>Volcán</span><span>Glaciar</span><span>Selva</span><span>Pradera</span>
</div>

<p class="label">✅ Con <code>gap: 8px</code>: el mismo hueco, pero solo ENTRE las fotos</p>
<div class="gallery is-gap">
  <span>Playa</span><span>Bosque</span><span>Desierto</span><span>Volcán</span><span>Glaciar</span><span>Selva</span><span>Pradera</span>
</div>

<p class="label">✅ <code>gap: 16px 4px</code>: 16px entre filas (<code>row-gap</code>) y 4px entre columnas (<code>column-gap</code>)</p>
<div class="gallery is-two-gaps">
  <span>Playa</span><span>Bosque</span><span>Desierto</span><span>Volcán</span><span>Glaciar</span><span>Selva</span><span>Pradera</span>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* Una galería estrecha para que siempre haga dos filas. El naranja del fondo es
   el color de los márgenes en DevTools: aquí se ve el espacio que no ocupa nadie. */
.gallery {
  display: flex;
  flex-wrap: wrap;
  width: 290px;
  border: 2px dashed #7c3aed;
  background: #fed7aa;
}

.gallery span {
  width: 64px;
  padding: 4px 0;
  border: 1px solid #4338ca;
  background: #e0e7ff;
  font-size: 0.75rem;
  text-align: center;
}

/* Antes de gap: márgenes en cada elemento. Sobra el margen del último de cada fila y
   el de la última fila, y para quitarlos hacen falta trucos (:last-child, márgenes
   negativos en el padre…). Fíjate también en que caben 3 fotos por fila y con gap 4:
   el margen sobrante del último también ocupa sitio. */
.is-margins span {
  margin: 0 8px 8px 0;
}

/* ✅ gap pone espacio solo ENTRE elementos (y entre líneas), nunca en los bordes.
   No es un margen: no colapsa ni se suma con los márgenes del contenedor.
   Cuenta como espacio ocupado al repartir el sitio libre (lección 3). */
.is-gap {
  gap: 8px;
}

/* gap es el atajo de row-gap (entre filas) y column-gap (entre columnas), en ese orden. */
.is-two-gaps {
  gap: 16px 4px;
}
```
