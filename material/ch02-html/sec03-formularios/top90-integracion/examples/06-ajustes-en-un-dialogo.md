---
example_description: "Unos ajustes en un dialog modal: radio, casilla y select en un form method=\"dialog\", returnValue para saber si se guardó y FormData para leer lo elegido"
example_tags: "integracion|formularios|dialog|method-dialog|returnvalue|formdata"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- Abre los ajustes, elige «Grande» y guarda. Ábrelos otra vez, cambia algo y cancela (o
     pulsa Escape): no se aplica, y al volver a abrir aparece lo guardado.
     (onclick y onclose: los eventos llegan en el capítulo de JavaScript.) -->
<h1>Tomates asados con tomillo</h1>
<p id="settings-summary" role="status">Texto normal · animaciones activadas · avisos por correo</p>
<button type="button" onclick="openSettings()">Ajustes de lectura</button>
<p>Corta los tomates por la mitad, colócalos en una bandeja con la cara cortada hacia arriba, riégalos con aceite, añade sal y unas ramas de tomillo, y ásalos 40 minutos a 180 °C.</p>

<dialog id="settings" aria-labelledby="settings-title" onclose="applySettings(this)">
  <!-- method="dialog": enviar cierra el diálogo y deja el value del botón en returnValue -->
  <form method="dialog">
    <h2 id="settings-title">Ajustes de lectura</h2>
    <fieldset>
      <legend>Tamaño del texto</legend>
      <label><input type="radio" name="text_size" value="normal" checked> Normal</label>
      <label><input type="radio" name="text_size" value="large"> Grande</label>
      <label><input type="radio" name="text_size" value="x-large"> Muy grande</label>
    </fieldset>
    <p><label><input type="checkbox" name="reduce_motion" value="yes"> Reducir las animaciones</label></p>
    <p>
      <label for="alerts">Avisos de recetas nuevas</label>
      <select id="alerts" name="alerts">
        <option value="email">Por correo</option>
        <option value="none">Ninguno</option>
      </select>
    </p>
    <button type="submit" value="cancel">Cancelar</button>
    <button type="submit" value="save">Guardar</button>
  </form>
</dialog>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 36rem;
}

dialog::backdrop {
  background: rgb(15 23 42 / 0.6);
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
const SIZE_NAMES = { normal: 'Texto normal', large: 'Texto grande', 'x-large': 'Texto muy grande' };
const FONT_SIZES = { normal: '1rem', large: '1.25rem', 'x-large': '1.5rem' };
let saved = { text_size: 'normal', reduce_motion: false, alerts: 'email' };

function openSettings() {
  const dialog = document.getElementById('settings');
  const form = dialog.querySelector('form');
  // Mostramos lo GUARDADO: si la vez anterior se cancelaron cambios, no deben seguir ahí
  form.elements.text_size.value = saved.text_size;
  form.elements.reduce_motion.checked = saved.reduce_motion;
  form.elements.alerts.value = saved.alerts;
  dialog.returnValue = ''; // que un cierre sin valor no repita el último «save» (lección 5)
  dialog.showModal();
}

function applySettings(dialog) {
  if (dialog.returnValue !== 'save') {
    console.log(`Sin cambios (returnValue: '${dialog.returnValue}')`);
    return;
  }
  const data = new FormData(dialog.querySelector('form'));
  saved = { text_size: data.get('text_size'), reduce_motion: data.has('reduce_motion'), alerts: data.get('alerts') };
  document.body.style.fontSize = FONT_SIZES[saved.text_size];
  document.getElementById('settings-summary').textContent =
    `${SIZE_NAMES[saved.text_size]} · animaciones ${saved.reduce_motion ? 'reducidas' : 'activadas'} · avisos ${saved.alerts === 'email' ? 'por correo' : 'desactivados'}`;
  console.log('Guardado:', saved);
}
```
