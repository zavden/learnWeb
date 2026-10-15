---
example_description: "Clases de utilidad: .visually-hidden (texto que no se ve pero lee el lector de pantalla), .flow (el espacio entre hermanos con el selector búho * + *), .stack y .cluster (columnas y filas con gap). Un solo propósito cada una, configurables con una custom property"
example_tags: "css|arquitectura|utilidades|visually-hidden|flow|stack|cluster|accesibilidad"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="flow">
  <h2>Cómo regar un cactus</h2>
  <p>Riega a fondo y espera a que la tierra se seque del todo antes de volver a regar.</p>
  <p>En invierno, una vez al mes basta: la planta descansa y casi no bebe.</p>
  <div class="cluster">
    <span class="tag">Cactus</span>
    <span class="tag">Riego</span>
    <span class="tag">Interior</span>
    <!-- Un botón de icono: el texto existe para el lector de pantalla,
         pero no se ve. -->
    <button class="icon-button" type="button">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>
      <span class="visually-hidden">Guardar en favoritos</span>
    </button>
  </div>
</article>

<form class="stack" action="/consulta" method="post">
  <label for="question">Tu pregunta para el vivero</label>
  <textarea id="question" name="question" rows="2"></textarea>
  <button class="send" type="submit">Enviar</button>
</form>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

h2,
p {
  margin: 0;                           /* el espacio lo pone .flow */
}

/* ── Utilidades: una clase, un propósito ──────────────────────────────── */

/* El texto existe en el árbol de accesibilidad, pero no ocupa nada en la
   pantalla. NO es display: none (eso lo oculta también al lector). */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* «Flujo»: espacio vertical entre hermanos seguidos. * + * es el «selector
   búho» (parece una cara): cada elemento que sigue a otro. El primero no
   recibe margen, así que no empuja el contenedor. */
.flow > * + * {
  margin-block-start: var(--flow-space, 1em);
}

/* Una columna con hueco uniforme: gap en lugar de márgenes. */
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--stack-space, 0.5rem);
  max-width: 22rem;
  margin-top: 20px;
}

/* Una fila que se reparte en líneas: etiquetas, botones, iconos. */
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--cluster-space, 0.5rem);
  align-items: center;
}

/* ── Componentes pequeños ─────────────────────────────────────────────── */
.tag {
  padding: 2px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-size: 0.8rem;
}

.icon-button,
.send {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.icon-button {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fce7f3;
  color: #9d174d;
}

.send {
  align-self: start;
  padding: 6px 16px;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font-weight: 700;
}

textarea {
  font: inherit;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
