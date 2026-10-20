---
example_description: "role=status (aria-live) hace que un lector de pantalla anuncie un mensaje que cambia sin mover el foco, como «Añadido al carrito»"
example_tags: "html|accesibilidad|aria-live|role-status"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<button type="button" onclick="document.getElementById('cart-status').textContent = `Añadido al carrito (${new Date().toLocaleTimeString('es-ES')})`">
  Añadir al carrito
</button>

<!-- La región debe existir (vacía) ANTES de cambiar su texto: el lector vigila los cambios.
     role="status" equivale a aria-live="polite": espera a que el usuario termine lo que está oyendo.
     Para errores urgentes existe role="alert" (aria-live="assertive"), que interrumpe. -->
<p id="cart-status" role="status"></p>

<p class="hint">No lo oirás sin un lector de pantalla: en macOS actívalo con ⌘ F5 (VoiceOver) y pulsa el botón.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

button {
  font: inherit;
  padding: 6px 12px;
}

#cart-status {
  min-height: 1.5em;
  color: #15803d;
  font-weight: 600;
}

.hint {
  color: #475569;
  font-size: 0.85rem;
}
```
