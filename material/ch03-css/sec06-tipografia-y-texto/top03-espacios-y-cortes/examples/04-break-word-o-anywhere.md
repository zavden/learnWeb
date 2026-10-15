---
example_description: "overflow-wrap: break-word y anywhere parten igual un correo largo en un bloque, pero solo anywhere rebaja el ancho mínimo del contenido: en una fila flex con flex: 1, break-word deja la columna ancha y anywhere la iguala"
example_tags: "css|tipografia|overflow-wrap|break-word|anywhere|min-content|flexbox|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">En un bloque de 120px, las dos partes el correo; sin nada, se sale</p>
<div class="blocks">
  <p class="block">❌ <code>normal</code><br>facturacion@distribuidoranorte.mx</p>
  <p class="block is-break-word">✅ <code>break-word</code><br>facturacion@distribuidoranorte.mx</p>
  <p class="block is-anywhere">✅ <code>anywhere</code><br>facturacion@distribuidoranorte.mx</p>
</div>

<p class="caption">❌ En tres columnas <code>flex: 1</code> de 400px, <code>break-word</code> no sirve: deberían medir 133 y la del correo no baja de su ancho</p>
<dl class="contact is-break-word">
  <div class="field a"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field b"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field c"><dt>Teléfono</dt><dd>55&nbsp;1234&nbsp;5678</dd></div>
</dl>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">✅ <code>anywhere</code>: las tres columnas miden 133 y el correo se parte</p>
<dl class="contact is-anywhere">
  <div class="field a"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field b"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field c"><dt>Teléfono</dt><dd>55&nbsp;1234&nbsp;5678</dd></div>
</dl>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 4px;
  font-size: 0.75rem;
}

.blocks {
  display: flex;
  gap: 12px;
  align-items: start;
}

.block {
  flex: none;
  inline-size: 120px;
  margin: 0;
  padding: 4px;
  outline: 1px dashed #4338ca;
  font-size: 0.75rem;
}

.contact {
  display: flex;
  width: 400px;
  margin: 0;
  outline: 2px dashed #4338ca;
  font-size: 0.75rem;
}

.field {
  flex: 1;
  padding: 4px 6px;
}

.field dt {
  color: #334155;
}

.field dd {
  margin: 0;
  font-weight: bold;
}

.a { background: #c7d2fe; }
.b { background: #fbcfe8; }
.c { background: #a7f3d0; }

.ruler {
  display: block;
  margin-top: 3px;
}

/* Las dos dicen lo mismo: «si una palabra no cabe en la línea, pártela por
   cualquier letra». Las dos parten el correo en el bloque de 120px. */

/* 🐛 break-word solo actúa al colocar el texto en una caja que YA tiene ancho.
   No cambia el ancho mínimo del contenido (min-content), que sigue siendo el
   correo entero. Y ese mínimo es justo lo que miran el min-width: auto de los
   elementos flex (y grid), las celdas de tabla y width: min-content: la columna
   no baja del correo, el correo cabe en ella y no se parte nada. */
.is-break-word dd,
.is-break-word.block {
  overflow-wrap: break-word;
}

/* ✅ anywhere tiene en cuenta los cortes también al calcular min-content (pasa a
   ser la letra más ancha). La columna puede encoger hasta 133 y, entonces, el
   correo se parte. Es la opción segura para correos, URL y códigos largos. */
.is-anywhere dd,
.is-anywhere.block {
  overflow-wrap: anywhere;
}
```
