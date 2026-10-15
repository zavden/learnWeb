---
example_stage: final-solution
example_description: "Solución: colores en variables de :root y un tema oscuro que solo redefine esas variables con :root:has(#dark-mode:checked)"
example_tags: "css|solucion|custom-properties|has|tema-oscuro"
---

# HTML

```html
<p><label><input type="checkbox" id="dark-mode"> Tema oscuro</label></p>

<article class="post">
  <h2>Notas de la versión 2.0</h2>
  <p>Hemos rediseñado el editor y añadido <a href="#">atajos de teclado</a> para las acciones más comunes.</p>
  <p class="meta">Publicado el 12 de octubre</p>
</article>
```

# CSS

```css
/* ✅ 1: los colores, con nombre de FUNCIÓN (no «--blue»), en un solo sitio */
:root {
  --bg: oklch(98.5% 0.005 260);
  --surface: oklch(96% 0.02 260);
  --text: oklch(25% 0.03 260);
  --muted: oklch(45% 0.03 260);
  --accent: oklch(50% 0.18 260);
}

/* ✅ 3: el tema oscuro no toca ningún selector: solo cambia los datos */
:root:has(#dark-mode:checked) {
  --bg: oklch(20% 0.02 260);
  --surface: oklch(26% 0.03 260);
  --text: oklch(93% 0.01 260);
  --muted: oklch(75% 0.02 260);
  --accent: oklch(80% 0.12 260);
  color-scheme: dark;
}

/* ✅ 2: las reglas solo leen variables */
body {
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.post {
  background: var(--surface);
  border-left: 6px solid var(--accent);
  padding: 0 1rem 1rem;
}

.post a {
  color: var(--accent);
}

.meta {
  color: var(--muted);
}
```
