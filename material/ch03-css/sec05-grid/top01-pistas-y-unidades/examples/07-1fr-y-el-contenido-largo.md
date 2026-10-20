---
example_description: "Tres columnas de 1fr dejan de ser iguales cuando una contiene un correo largo: 1fr es minmax(auto, 1fr) y su mínimo es el contenido; minmax(0, 1fr) las iguala y overflow-wrap: anywhere parte el correo"
example_tags: "css|grid|fr|minmax|min-content|overflow-wrap|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ <code>repeat(3, 1fr)</code> + <code>gap: 20px</code>: deberían medir (400 − 40) ÷ 3 = 120… pero el correo no baja de su ancho</p>
<dl class="contact">
  <div class="field"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field"><dt>Teléfono</dt><dd>55 1234 5678</dd></div>
</dl>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">⚠️ <code>repeat(3, minmax(0, 1fr))</code>: ya miden 120, pero el correo se sale de su columna y la del teléfono lo tapa</p>
<dl class="contact is-zero">
  <div class="field"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field"><dt>Teléfono</dt><dd>55 1234 5678</dd></div>
</dl>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">✅ <code>minmax(0, 1fr)</code> + <code>overflow-wrap: anywhere</code>: iguales y el correo se parte</p>
<dl class="contact is-zero is-wrapping">
  <div class="field"><dt>Nombre</dt><dd>Ana Lucía Méndez</dd></div>
  <div class="field"><dt>Correo</dt><dd>facturacion@distribuidoranorte.mx</dd></div>
  <div class="field"><dt>Teléfono</dt><dd>55 1234 5678</dd></div>
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 400px;
  margin: 0;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
  font-size: 0.75rem;
}

.ruler {
  display: block;
  margin-top: 3px;
}

.field {
  padding: 4px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
}

.field dt {
  color: #334155;
}

.field dd {
  margin: 0;
  font-weight: bold;
}

/* 🐛 1fr no es «una fracción y punto»: es minmax(auto, 1fr). El mínimo auto es el
   mínimo automático de los elementos de la pista: su min-content, igual que el
   min-width: auto de flexbox. Una dirección de correo no tiene ningún punto donde
   partirse, así que su columna no puede bajar de su ancho (unos 230px). El navegador
   la trata como fija y reparte el resto entre las otras dos: (360 − 230) ÷ 2 ≈ 65. */

/* ⚠️ minmax(0, 1fr) pone el mínimo a 0: las tres vuelven a medir 120. Pero el correo
   sigue sin poder partirse y desborda su celda; el fondo de la tercera celda se pinta
   después y lo tapa. (min-width: 0 en .field haría lo mismo que el 0 de minmax.) */
.is-zero {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* ✅ overflow-wrap: anywhere permite partir una palabra en cualquier letra cuando no
   cabe (se explica en el módulo de tipografía). */
.is-wrapping dd {
  overflow-wrap: anywhere;
}
```
