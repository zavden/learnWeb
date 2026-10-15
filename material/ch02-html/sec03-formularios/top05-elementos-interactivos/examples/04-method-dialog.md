---
example_description: "Un formulario con method=\"dialog\" cierra su diálogo en lugar de enviarse, y dialog.returnValue guarda el value del botón pulsado"
example_tags: "html|interactivos|dialog|method-dialog|returnvalue|formularios"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<!-- Pulsa «Vaciar la cesta» y elige una opción. Ábrelo otra vez y elige la otra.
     (onclick y onclose: los eventos llegan en el capítulo de JavaScript.) -->
<p>Tu cesta: 3 productos.</p>
<button type="button" onclick="document.getElementById('confirm-empty').showModal()">Vaciar la cesta</button>

<dialog id="confirm-empty" aria-labelledby="confirm-title" onclose="handleClose(this)">
  <h2 id="confirm-title">¿Vaciar la cesta?</h2>
  <p>Se quitarán los 3 productos. No se puede deshacer.</p>
  <!-- method="dialog": enviar este formulario CIERRA el diálogo en lugar de navegar.
       No hay petición: la consola no muestra ningún «Form submitted». -->
  <form method="dialog">
    <!-- autofocus: ante una acción que no se puede deshacer, el foco empieza en la opción segura -->
    <button type="submit" value="cancel" autofocus>Cancelar</button>
    <button type="submit" value="empty">Sí, vaciar la cesta</button>
  </form>
</dialog>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

dialog::backdrop {
  background: rgb(15 23 42 / 0.6);
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Al cerrarse, returnValue es el value
// del botón que envió el formulario del diálogo.
function handleClose(dialog) {
  console.log('returnValue →', dialog.returnValue);
  if (dialog.returnValue === 'empty') console.log('🧺 Cesta vaciada');
}
```
