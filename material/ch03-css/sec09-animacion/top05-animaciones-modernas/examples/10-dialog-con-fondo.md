---
example_description: "Un diálogo modal (abierto con command=\"show-modal\", sin JavaScript) que entra y sale con transiciones, igual que el popover: @starting-style, display y overlay con allow-discrete. El fondo ::backdrop se funde con su propia transición. Con reducir movimiento, el diálogo solo se funde, sin crecer"
example_tags: "css|dialog|backdrop|starting-style|overlay|allow-discrete|command|transiciones|prefers-reduced-motion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- dialog, showModal y los invoker commands (commandfor + command): lección de elementos
     interactivos del capítulo de HTML. Ábrelo y ciérralo con un botón o con Escape.
     (Sin JavaScript, «Vaciar» solo cierra el diálogo: aquí importa la animación.) -->
<h2>Tu cesta</h2>
<p>Nopal en maceta · $185</p>
<button type="button" commandfor="confirm" command="show-modal">Vaciar la cesta</button>

<dialog id="confirm" aria-labelledby="confirm-title">
  <h3 id="confirm-title">¿Vaciar la cesta?</h3>
  <p>Se quitarán los productos que añadiste. Esta acción no se puede deshacer.</p>
  <div class="buttons">
    <button type="button" commandfor="confirm" command="close">Cancelar</button>
    <button type="button" class="is-danger" commandfor="confirm" command="close">Vaciar</button>
  </div>
</dialog>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

h2 {
  margin: 0 0 4px;
  font-size: 1.1rem;
}

button {
  padding: 6px 12px;
  border: 1px solid #64748b;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.is-danger {
  border-color: #be123c;
  background: #be123c;
  color: #ffffff;
}

dialog {
  max-width: 300px;
  padding: 16px;
  border: 0;
  border-radius: 12px;
  background: #ffffff;
  color: #1e293b;
  box-shadow: 0 20px 40px rgb(15 23 42 / 0.3);
}

dialog h3 {
  margin: 0 0 8px;
}

dialog p {
  margin: 0 0 14px;
  font-size: 0.9rem;
}

.buttons {
  display: flex;
  gap: 8px;
  justify-content: end;
}

/* El diálogo cerrado tiene display: none; abierto, el atributo open. La misma
   receta que el popover: fundido, display y overlay con allow-discrete
   (para salir) y @starting-style (para entrar). */
dialog {
  opacity: 0;
  transition:
    opacity 250ms,
    overlay 250ms allow-discrete,
    display 250ms allow-discrete;
}

dialog[open] {
  opacity: 1;
}

@starting-style {
  dialog[open] {
    opacity: 0;
  }
}

/* El fondo es otro elemento (un pseudoelemento en la capa superior), con su
   propia transición. Se anima su color, de transparente a oscuro. */
dialog::backdrop {
  background-color: rgb(15 23 42 / 0);
  transition:
    background-color 250ms,
    overlay 250ms allow-discrete,
    display 250ms allow-discrete;
}

dialog[open]::backdrop {
  background-color: rgb(15 23 42 / 0.55);
}

@starting-style {
  dialog[open]::backdrop {
    background-color: rgb(15 23 42 / 0);
  }
}

/* Con movimiento: además, crece desde 0.94. Al cerrar, encoge. */
@media (prefers-reduced-motion: no-preference) {
  dialog {
    scale: 0.94;
    transition:
      opacity 250ms,
      scale 250ms cubic-bezier(0.2, 0, 0, 1),
      overlay 250ms allow-discrete,
      display 250ms allow-discrete;
  }

  dialog[open] {
    scale: 1;
  }

  @starting-style {
    dialog[open] {
      scale: 0.94;
    }
  }
}
```
