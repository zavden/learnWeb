---
example_description: "Dónde está la línea base de un inline-block: la de su última línea de texto, o su borde inferior si está vacío o tiene overflow distinto de visible"
example_tags: "css|contexto-inline|inline-block|baseline|overflow"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="legend">Las cuatro cajas tienen <code>vertical-align: baseline</code> (el valor por defecto). La raya roja es la línea base de la línea.</p>

<p class="line"><span class="baseline-ruler" aria-hidden="true"></span>Texto
  <span class="box">① Una línea</span>
  <span class="box">② Línea 1<br>Línea 2<br>Línea 3</span>
  <span class="box is-empty"></span>
  <span class="box is-clipped">④ Con overflow</span></p>

<ol class="notes">
  <li>Con una línea de texto: se apoya con la línea base de ese texto.</li>
  <li>Con varias: con la de su <strong>última</strong> línea, así que la caja crece hacia arriba.</li>
  <li>Vacía: no tiene texto, así que se apoya con su <strong>borde inferior</strong> (del margen).</li>
  <li>Con <code>overflow</code> distinto de <code>visible</code>: también con su borde inferior, aunque tenga texto. Por eso sube.</li>
</ol>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend,
.notes {
  font-size: 0.8rem;
}

.notes {
  margin: 8px 0 0;
  padding-left: 1.4em;
}

.line {
  margin: 0;
  font-size: 20px;
  white-space: nowrap;
  background: #e0e7ff;
}

.box {
  display: inline-block;
  padding: 4px 8px;
  border: 2px solid #1d4ed8;
  background: #bfdbfe;
  font-size: 14px;
}

/* ③ Sin contenido no hay «última línea»: la caja usa su borde inferior como línea base. */
.is-empty {
  width: 40px;
  height: 40px;
}

/* ④ Regla heredada de CSS 2: si la caja es un contenedor de scroll (overflow hidden,
   auto o scroll), su línea base es su borde inferior aunque tenga texto. Es lo que
   descoloca las etiquetas recortadas con «…» y las tarjetas con overflow: hidden. */
.is-clipped {
  overflow: hidden;
}

/* Regla visual de la línea base: es, a su vez, un inline-block vacío (caso ③). */
.baseline-ruler {
  display: inline-block;
  width: 100%;
  margin-right: -100%;
  border-top: 2px dashed #dc2626;
}
```
