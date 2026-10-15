---
example_description: "Cada control tiene un nombre accesible: sale de su texto, de su label, de aria-labelledby o de aria-label, por ese orden de prioridad"
example_tags: "html|accesibilidad|nombre-accesible|aria-label|aria-labelledby"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- 1. Del contenido: el texto del botón ES su nombre. -->
<button>Guardar borrador</button>

<!-- 2. De un <label> asociado (lo verás a fondo en el módulo de formularios). -->
<p><label for="city">Ciudad</label> <input id="city"></p>

<!-- 3. De aria-labelledby: el nombre es el texto de OTRO elemento (por su id). -->
<h2 id="newsletter-title">Recibe nuestro boletín</h2>
<p><input aria-labelledby="newsletter-title" placeholder="tu@correo.es"></p>

<!-- 4. De aria-label: un texto que solo leen las tecnologías de asistencia. -->
<button aria-label="Cerrar el aviso">✕</button>

<!-- Prioridad: aria-labelledby > aria-label > label/contenido.
     Este botón se anuncia como «Eliminar pedido 1042», no como «Borrar». -->
<button aria-label="Eliminar pedido 1042">Borrar</button>
<p class="hint">Compruébalo en DevTools: Elements → pestaña Accessibility → «Name».</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.hint {
  color: #475569;
  font-size: 0.85rem;
}
```
