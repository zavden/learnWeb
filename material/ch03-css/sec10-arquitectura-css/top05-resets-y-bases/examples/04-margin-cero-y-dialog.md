---
example_description: "* { margin: 0 } también quita el margin: auto con el que la hoja del navegador centra <dialog> y [popover]: el diálogo abierto se pega a la izquierda de su marco y el popover, a la esquina de la ventana. El reset debe devolverles margin: auto"
example_tags: "css|arquitectura|reset|dialog|popover|margin|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<div class="frame">
  <p class="label">❌ Con <code>* { margin: 0 }</code></p>
  <dialog open>Pedido 1042 confirmado.</dialog>
</div>
<div class="frame is-fixed">
  <p class="label">✅ Con <code>margin: auto</code> devuelto</p>
  <dialog open>Pedido 1042 confirmado.</dialog>
</div>
<p class="row">
  <button type="button" popovertarget="tip-broken">Abrir aviso ❌</button>
  <button type="button" popovertarget="tip-fixed">Abrir aviso ✅</button>
</p>
<div id="tip-broken" popover>❌ Pegado a la esquina. Pulsa <kbd>Esc</kbd> o fuera para cerrar.</div>
<div id="tip-fixed" class="is-fixed" popover>✅ Centrado en la ventana. Pulsa <kbd>Esc</kbd> o fuera para cerrar.</div>
```

# CSS

```css
/* 🐛 El reset clásico: fuera todos los márgenes. */
* {
  margin: 0;
}

/* La hoja del navegador centra un <dialog> con
     position: absolute; inset-inline: 0; width: fit-content; margin: auto;
   y un [popover] con
     position: fixed; inset: 0; width: fit-content; height: fit-content; margin: auto;
   Es el margin: auto el que reparte el sitio sobrante a los dos lados.
   Las reglas del autor ganan a las del navegador (aunque * pese cero):
   margin: 0 deja el diálogo pegado a la izquierda de su marco, y el
   popover, en la esquina superior izquierda de la ventana. */

/* ✅ La línea que falta en el reset. En tu reset va sin .is-fixed:
   :where(dialog, [popover]) { margin: auto; }
   Aquí se limita a la mitad corregida para comparar. */
.is-fixed dialog,
[popover].is-fixed {
  margin: auto;
}

body {
  padding: 8px;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.frame {
  position: relative;                  /* el marco de referencia del diálogo */
  height: 96px;
  margin-bottom: 12px;
  padding: 6px;
  border: 1px dashed #64748b;
  border-radius: 8px;
}

.label {
  font-size: 0.72rem;
}

dialog,
[popover] {
  padding: 8px 12px;
  border: 2px solid #15803d;
  border-radius: 8px;
  font-size: 0.85rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

button {
  font: inherit;
}
```
