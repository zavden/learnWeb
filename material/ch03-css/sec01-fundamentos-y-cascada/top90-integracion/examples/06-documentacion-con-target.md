---
example_description: "Una página de documentación: contadores para numerar secciones, :target para resaltar la sección enlazada y avisos con selectores de atributo"
example_tags: "css|target|contadores|atributo|pseudoelementos"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<nav aria-label="Contenido">
  <ol class="toc">
    <li><a href="#install">Instalación</a></li>
    <li><a href="#config">Configuración</a></li>
    <li><a href="#deploy">Publicación</a></li>
  </ol>
</nav>

<main class="docs">
  <section id="install">
    <h2>Instalación</h2>
    <p>Descarga el paquete desde la <a href="https://example.com/descargas">página oficial</a>.</p>
  </section>
  <section id="config">
    <h2>Configuración</h2>
    <p data-callout="warning">No guardes contraseñas en el archivo de configuración.</p>
  </section>
  <section id="deploy">
    <h2>Publicación</h2>
    <p data-callout="tip">Revisa la sección de <a href="#config">configuración</a> antes de publicar.</p>
  </section>
</main>
```

# CSS

```css
:root {
  --accent: oklch(50% 0.18 260);
  --warning: oklch(50% 0.12 70);
  --tip: oklch(48% 0.13 150);
}

body {
  font-family: system-ui, sans-serif;
  color: oklch(25% 0.03 260);
}

/* Numeración automática de las secciones (lección 4) */
.docs {
  counter-reset: section;
}

.docs h2 {
  counter-increment: section;
}

.docs h2::before {
  content: counter(section) ". ";
  color: var(--accent);
}

section {
  border-left: 4px solid transparent;
  padding-inline-start: 1rem;
}

/* :target: la sección a la que apunta la URL (#config…) se resalta (lección 3) */
section:target {
  border-left-color: var(--accent);
  background: oklch(97% 0.015 260);
}

section:target h2::after {
  content: " ← estás aquí";
  font-size: 0.6em;
  font-weight: normal;
  color: oklch(45% 0.03 260);
}

/* Enlaces externos: los que empiezan por http (lección 2) */
a[href^="http"]::after {
  content: " ↗" / " (sitio externo)";
}

/* Avisos: el atributo elige el color; una sola regla dibuja el aviso */
[data-callout] {
  --callout-color: var(--accent);
  border-left: 4px solid var(--callout-color);
  background: color-mix(in oklch, var(--callout-color) 8%, white);
  padding: 0.5rem 0.75rem;
}

[data-callout="warning"] { --callout-color: var(--warning); }
[data-callout="tip"]     { --callout-color: var(--tip); }

[data-callout]::before {
  font-weight: bold;
  color: var(--callout-color);
}

[data-callout="warning"]::before { content: "Atención: "; }
[data-callout="tip"]::before     { content: "Consejo: "; }
```
