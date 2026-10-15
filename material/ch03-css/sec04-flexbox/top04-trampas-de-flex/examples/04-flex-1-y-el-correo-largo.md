---
example_description: "Tres columnas con flex: 1 dejan de ser iguales cuando una contiene un correo largo que no se puede partir; min-width: 0 las iguala y overflow-wrap: anywhere parte el correo"
example_tags: "css|flexbox|flex|min-width|overflow-wrap|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ <code>flex: 1</code> en las tres: deberían medir 133,33… pero el correo no baja de su ancho</p>
<dl class="contact">
  <div class="field a"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field b"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field c"><dt>Teléfono</dt><dd>55 1234 5678</dd></div>
</dl>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">⚠️ <code>min-width: 0</code>: ya miden 133,33, pero el correo se sale de su columna y la del teléfono lo tapa</p>
<dl class="contact is-zero">
  <div class="field a"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field b"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field c"><dt>Teléfono</dt><dd>55 1234 5678</dd></div>
</dl>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">✅ <code>min-width: 0</code> + <code>overflow-wrap: anywhere</code>: iguales y el correo se parte</p>
<dl class="contact is-zero is-wrapping">
  <div class="field a"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field b"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field c"><dt>Teléfono</dt><dd>55 1234 5678</dd></div>
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
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.contact {
  display: flex;
  width: 400px;
  margin: 0;
  outline: 2px dashed #7c3aed;
  font-size: 0.75rem;
}

.ruler {
  display: block;
  margin-top: 3px;
}

/* El mismo padding en las tres: así flex: 1 las deja exactamente iguales. */
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

/* 🐛 flex: 1 es 1 1 0%: base 0 y el contenedor entero se reparte a partes iguales.
   Pero el paso 4 sigue ahí: min-width: auto no deja a la columna del correo bajar
   del ancho de su contenido, y una dirección de correo no tiene ningún punto donde
   partirse. La columna se congela en ese ancho y las otras dos se reparten el resto. */

/* ⚠️ min-width: 0 quita el suelo y las columnas vuelven a ser iguales. Pero el correo
   sigue sin poder partirse y desborda su columna. No lo ves entero porque los
   elementos flex se pintan uno tras otro, como los inline-block: el fondo de la
   tercera columna se pinta después y tapa lo que sobresale de la segunda. */
.is-zero .field {
  min-width: 0;
}

/* ✅ overflow-wrap: anywhere permite partir una palabra en cualquier letra cuando no
   cabe (se explica en el módulo de tipografía). Además rebaja el ancho mínimo del
   contenido a una letra, así que aquí bastaría sola; min-width: 0 se deja porque es
   la regla general para columnas que deben medir lo mismo pase lo que pase. */
.is-wrapping dd {
  overflow-wrap: anywhere;
}
```
