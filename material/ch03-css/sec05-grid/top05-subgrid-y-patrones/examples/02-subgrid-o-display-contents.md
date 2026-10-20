---
example_description: "Las filas de un resumen de pedido alinean sus columnas de tres formas: rejillas independientes (no se alinean), display: contents (se alinean, pero cada fila pierde su caja) y subgrid (se alinean y la fila conserva su caja)"
example_tags: "css|grid|subgrid|display-contents|columnas|lista"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">❌ Cada <code>li</code> con su propia rejilla <code>1fr auto auto</code>: las columnas <code>auto</code> miden distinto en cada fila</p>
<ul class="order is-separate">
  <li><span>Monstera deliciosa</span><span>× 1</span><span>420 MXN</span></li>
  <li><span>Pothos dorado</span><span>× 12</span><span>1 920 MXN</span></li>
  <li><span>Maceta de barro 30 cm</span><span>× 2</span><span>360 MXN</span></li>
</ul>

<p class="caption">⚠️ <code>display: contents</code> en cada <code>li</code>: alineadas, pero el <code>li</code> ya no tiene caja (sin fondo ni borde)</p>
<ul class="order is-contents">
  <li><span>Monstera deliciosa</span><span>× 1</span><span>420 MXN</span></li>
  <li><span>Pothos dorado</span><span>× 12</span><span>1 920 MXN</span></li>
  <li><span>Maceta de barro 30 cm</span><span>× 2</span><span>360 MXN</span></li>
</ul>

<p class="caption">✅ <code>grid-template-columns: subgrid</code>: alineadas, y cada <code>li</code> conserva su fondo y su borde</p>
<ul class="order is-subgrid">
  <li><span>Monstera deliciosa</span><span>× 1</span><span>420 MXN</span></li>
  <li><span>Pothos dorado</span><span>× 12</span><span>1 920 MXN</span></li>
  <li><span>Maceta de barro 30 cm</span><span>× 2</span><span>360 MXN</span></li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.order {
  max-width: 400px;
  margin: 0;
  padding: 0;
  outline: 2px dashed #0f766e;
  list-style: none;
  font-size: 0.8rem;
}

.order li {
  padding: 4px 8px;
  border-bottom: 1px solid #0f766e;
  background: #ccfbf1;
}

.order li:nth-child(even) {
  background: #ffffff;
}

/* Cantidad y precio, a la derecha de su celda. */
.order span + span {
  justify-self: end;
}

/* ❌ Tres rejillas independientes: cada li calcula sus columnas auto con SU
   contenido. «× 12» y «1 920 MXN» son más anchos que los demás, y su fila
   tiene las columnas en otro sitio. */
.is-separate li {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
}

/* La rejilla común, en el ul, para las dos versiones siguientes. */
.is-contents,
.is-subgrid {
  display: grid;
  grid-template-columns: 1fr auto auto;
  column-gap: 12px;
}

/* ⚠️ display: contents borra la caja del li (lección de display): sus span pasan a
   ser elementos grid del ul y comparten columnas. Pero sin caja no hay fondo, ni
   borde, ni padding: las rayas de la tabla desaparecen. Y algunos navegadores han
   tenido fallos que también borraban el significado de lista del li. */
.is-contents li {
  display: contents;
}

/* ✅ subgrid: el li ocupa todas las columnas del ul (1 / -1), es él mismo una
   rejilla y, en vez de definir columnas propias, usa las del ul. Sus span se
   alinean con los de las otras filas y el li conserva su caja. */
.is-subgrid li {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
}
```
