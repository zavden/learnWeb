---
example_description: "SVG accesible en sus tres casos: gráfico informativo (role=\"img\" + title + desc), icono decorativo (aria-hidden) y botón de solo icono (el nombre va en el botón)"
example_tags: "html|svg|accesibilidad|title|desc|aria|role"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<!-- Compruébalo en DevTools → Elements → pestaña Accessibility: selecciona cada svg y mira
     su rol (Role) y su nombre (Name). Pasa también el ratón por el gráfico: title es su tooltip. -->

<!-- 1. Informativo: role="img" lo presenta como UNA imagen (sus formas no se leen una a una);
     title da el nombre y desc una descripción más larga. aria-labelledby y aria-describedby
     los enlazan de forma explícita, para que todos los lectores de pantalla los lean. -->
<svg viewBox="0 0 220 120" width="220" height="120" role="img" aria-labelledby="harvest-title" aria-describedby="harvest-desc">
  <title id="harvest-title">Cosecha de tomates por mes</title>
  <desc id="harvest-desc">Julio 12 kg, agosto 30 kg y septiembre 18 kg.</desc>
  <rect x="20" y="76" width="50" height="24" fill="#be123c"/>
  <rect x="85" y="40" width="50" height="60" fill="#be123c"/>
  <rect x="150" y="64" width="50" height="36" fill="#be123c"/>
  <text x="45" y="115" text-anchor="middle">jul</text>
  <text x="110" y="115" text-anchor="middle">ago</text>
  <text x="175" y="115" text-anchor="middle">sep</text>
</svg>

<!-- 2. Decorativo: el texto de al lado ya lo dice todo; aria-hidden lo quita del árbol de
     accesibilidad para que no se anuncie «imagen» sin más -->
<p>
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill="currentColor"/>
  </svg>
  Riego automático activado
</p>

<!-- 3. Botón de solo icono: el NOMBRE va en el botón (aria-label), y el icono, oculto -->
<button type="button" aria-label="Borrar la tarea «Regar los tomates»">
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7 H20 M9 7 V4 H15 V7 M6 7 L7 21 H17 L18 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  </svg>
</button>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

text {
  font-size: 13px;
  fill: #1e293b;
}

.icon {
  width: 1.25em;
  height: 1.25em;
  vertical-align: -0.25em;
  color: #0369a1;
}

button {
  padding: 0.4em;
  line-height: 0;
}

button:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```
