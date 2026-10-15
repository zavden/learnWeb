---
example_description: "Un botón que solo contiene un icono no tiene nombre: el lector de pantalla dice «botón» sin más. aria-label o un texto oculto visualmente lo arreglan"
example_tags: "html|accesibilidad|iconos|aria-label|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<!-- 🐛 Sin nombre: un lector de pantalla anuncia solo «botón». -->
<button class="icon"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M8 5V3h4v2m-6 0 1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>

<!-- ✅ Opción 1: aria-label en el botón. -->
<button class="icon" aria-label="Eliminar"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M8 5V3h4v2m-6 0 1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>

<!-- ✅ Opción 2: texto real, oculto visualmente pero presente para los lectores (y para traducir). -->
<button class="icon"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M8 5V3h4v2m-6 0 1 12h6l1-12" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="visually-hidden">Eliminar</span></button>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.icon {
  padding: 8px;
  margin-right: 8px;
}

/* Patrón estándar «visually hidden»: invisible en pantalla, presente en el árbol de
   accesibilidad. (display: none o hidden lo quitarían para TODOS, también para los lectores.) */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Aproximamos el nombre de cada botón
// (aria-label, o si no su texto). Un nombre vacío es un botón mudo.
document.querySelectorAll('button').forEach((button, index) => {
  const name = button.getAttribute('aria-label') ?? button.textContent.trim();
  console.log(`botón ${index + 1} →`, name ? `«${name}»` : '❌ sin nombre');
});
```
