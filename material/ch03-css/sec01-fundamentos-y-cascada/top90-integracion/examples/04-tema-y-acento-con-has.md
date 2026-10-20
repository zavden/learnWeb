---
example_description: "Tema claro/oscuro y color de acento elegidos con controles de formulario: :has() + :checked redefinen variables; todo el color sale de oklch() y --hue"
example_tags: "css|custom-properties|has|oklch|color-scheme"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<fieldset class="theme-picker">
  <legend>Apariencia</legend>
  <p><label><input type="checkbox" id="dark-mode"> Tema oscuro</label></p>
  <fieldset class="accent-picker">
    <legend>Color de acento</legend>
    <label><input type="radio" name="accent" id="accent-blue" checked> Azul</label>
    <label><input type="radio" name="accent" id="accent-green"> Verde</label>
    <label><input type="radio" name="accent" id="accent-purple"> Morado</label>
  </fieldset>
</fieldset>

<article class="profile">
  <h2>Marta Ortega</h2>
  <p>Diseñadora de interfaces. Escribe sobre <a href="#">accesibilidad y color</a>.</p>
  <button type="button" class="btn">Seguir</button>
</article>
```

# CSS

```css
/* 1) Los datos: un tono y los colores que se derivan de él (lección 10) */
:root {
  --hue: 260;
  --bg: oklch(98.5% 0.005 var(--hue));
  --surface: oklch(96% 0.02 var(--hue));
  --text: oklch(25% 0.03 var(--hue));
  --accent: oklch(50% 0.18 var(--hue));
  --on-accent: #ffffff;
}

/* 2) Los controles solo cambian datos. Un radio marcado cambia el tono… */
:root:has(#accent-green:checked)  { --hue: 150; }
:root:has(#accent-purple:checked) { --hue: 300; }

/* …y la casilla de tema oscuro cambia la luminosidad, no el tono.
   Como oklch() es perceptual, el contraste se mantiene con cualquier --hue. */
:root:has(#dark-mode:checked) {
  --bg: oklch(20% 0.02 var(--hue));
  --surface: oklch(26% 0.03 var(--hue));
  --text: oklch(93% 0.01 var(--hue));
  --accent: oklch(80% 0.12 var(--hue));
  --on-accent: oklch(20% 0.02 var(--hue));
  color-scheme: dark;                     /* controles nativos en oscuro (lección 9) */
}

/* 3) El resto del CSS solo lee variables */
body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.theme-picker {
  border: 1px solid color-mix(in oklch, var(--text) 25%, transparent);
}

/* El grupo de radios va anidado en su propio fieldset (semántica de formularios) */
.accent-picker {
  border: 0;
  padding: 0;
}

.profile {
  background: var(--surface);
  border-left: 6px solid var(--accent);
  padding: 0 1rem 1rem;
  margin-top: 1rem;
}

.profile a {
  color: var(--accent);
}

.btn {
  font: inherit;
  background: var(--accent);
  color: var(--on-accent);
  border: 0;
  padding: 0.4rem 1rem;
}

:is(a, button, input):focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
```
