---
example_description: "fill=\"currentColor\" pinta el icono con el color del texto que lo rodea: cambia solo al pasar el ratón, con el foco o sobre un fondo oscuro"
example_tags: "html|svg|currentcolor|iconos|fill|stroke"
example_stage: minimal
example_importance: important
---

# HTML

```html
<!-- Pasa el ratón por el enlace y recorre los botones con Tab: el icono cambia de color con
     el texto, porque su fill o su stroke es currentColor («el color del texto de aquí»). -->
<p>
  <a href="calendar.ics" download>
    <!-- aria-hidden: el icono es decorativo, el texto del enlace ya dice qué es -->
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 V15 M6 10 L12 16 L18 10 M4 20 H20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Descargar el calendario de riego
  </a>
</p>

<p class="actions">
  <button type="button">
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill="currentColor"/>
    </svg>
    Regar ahora
  </button>
</p>

<!-- Sobre un fondo oscuro, el color del texto es claro… y el icono también, sin tocar el SVG -->
<p class="dark">
  <button type="button">
    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill="currentColor"/>
    </svg>
    Regar ahora
  </button>
</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* El icono mide lo que la letra (1em) y se alinea con el texto (unidades: capítulo de CSS) */
.icon {
  width: 1.25em;
  height: 1.25em;
  vertical-align: -0.25em;
}

/* Solo se cambia color: el icono lo sigue (pseudoclases :hover y :focus-visible: capítulo de CSS) */
a {
  color: #1d4ed8;
}

a:hover {
  color: #be123c;
}

button {
  font: inherit;
  color: #0f766e;
  background: #f0fdfa;
  border: 2px solid currentColor;
  border-radius: 6px;
  padding: 0.4em 0.8em;
}

button:hover,
button:focus-visible {
  color: #f0fdfa;
  background: #0f766e;
  outline: 3px solid #b45309;
  outline-offset: 2px;
}

.dark {
  background: #0f172a;
  padding: 1rem;
}

.dark button {
  color: #a5f3fc;
  background: transparent;
}
```
