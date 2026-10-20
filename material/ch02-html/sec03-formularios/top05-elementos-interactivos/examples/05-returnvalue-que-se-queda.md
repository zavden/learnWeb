---
example_description: "close() sin argumento cierra el dialog sin cambiar returnValue: conserva la respuesta de la vez anterior, y una acción se repite sin que nadie la pida"
example_tags: "html|interactivos|dialog|returnvalue|close|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 1. Pulsa ❌ y luego «Borrar». 2. Pulsa ❌ otra vez y cierra con la ✕: ¡se borra otra foto!
     3. Pulsa ✅ y cierra con la ✕: esta vez no se borra nada.
     (onclick y onclose: los eventos llegan en el capítulo de JavaScript.) -->
<p>Galería del huerto: <output id="photo-count">5</output> fotos.</p>
<button type="button" onclick="openBug()">❌ Borrar la última foto</button>
<button type="button" onclick="openOk()">✅ Borrar la última foto</button>

<dialog id="confirm-delete" aria-labelledby="delete-title" onclose="handleClose(this)">
  <!-- 🐛 close() SIN argumento cierra el diálogo sin tocar returnValue -->
  <button type="button" aria-label="Cerrar" onclick="document.getElementById('confirm-delete').close()">✕</button>
  <h2 id="delete-title">¿Borrar la foto?</h2>
  <form method="dialog">
    <button type="submit" value="cancel" autofocus>Cancelar</button>
    <button type="submit" value="delete">Borrar</button>
  </form>
</dialog>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo.
let photos = 5;

function handleClose(dialog) {
  if (dialog.returnValue === 'delete') {
    photos -= 1;
    document.getElementById('photo-count').value = photos;
    console.log(`🗑 Foto borrada (returnValue: '${dialog.returnValue}'). Quedan ${photos}.`);
  } else {
    console.log(`Nada que borrar (returnValue: '${dialog.returnValue}')`);
  }
}

// 🐛 Abrimos sin más: si se cierra con la ✕, returnValue sigue valiendo la respuesta anterior
function openBug() {
  document.getElementById('confirm-delete').showModal();
}

// ✅ Vaciamos returnValue antes de abrir: la ✕ deja '' y no se borra nada.
// (Otra solución: que la ✕ cierre con un valor explícito, close('cancel').)
// Escape, en el Chrome actual, ya deja '', pero navegadores anteriores conservaban el
// valor anterior: otra razón para vaciarlo siempre.
function openOk() {
  const dialog = document.getElementById('confirm-delete');
  dialog.returnValue = '';
  dialog.showModal();
}
```
