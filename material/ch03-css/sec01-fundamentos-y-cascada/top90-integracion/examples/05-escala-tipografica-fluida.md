---
example_description: "Una escala tipográfica con custom properties y clamp(), márgenes en em, ancho en ch y estilos base de especificidad cero con :where()"
example_tags: "css|unidades|clamp|custom-properties|where"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="prose">
  <h1>Cómo elegir una tipografía</h1>
  <p class="lead">Una buena escala tipográfica hace que la jerarquía se entienda antes de leer una sola palabra.</p>
  <h2>Empieza por el texto</h2>
  <p>El tamaño base del párrafo marca todo lo demás. Los títulos se calculan multiplicándolo por una razón fija; aquí, 1,25.</p>
  <h3>Y después, los títulos</h3>
  <p>Estrecha la vista previa: los títulos se reducen con el ancho, pero nunca bajan de su mínimo ni pasan de su máximo.</p>
</article>
```

# CSS

```css
/* La escala: cada paso es un clamp(MÍNIMO, PREFERIDO, MÁXIMO) (lección 8).
   El preferido mezcla rem (respeta la letra del usuario) y vw (sigue al ancho). */
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  --step-2: clamp(1.5rem, 1.25rem + 1.2vw, 2rem);
  --step-3: clamp(1.8rem, 1.4rem + 2vw, 2.75rem);
  --measure: 65ch;
}

body {
  font-family: Georgia, "Times New Roman", serif;
  font-size: var(--step-0);
  line-height: 1.6;             /* sin unidad: cada hijo lo recalcula con su propia letra */
  color: oklch(25% 0.03 260);
}

/* Estilos base con :where(): especificidad (0,0,0), cualquier regla posterior los ajusta */
:where(h1, h2, h3) {
  font-family: system-ui, sans-serif;
  line-height: 1.2;
  margin-block: 1.5em 0.5em;    /* em: proporcional al tamaño de CADA título */
}

:where(h1) { font-size: var(--step-3); }
:where(h2) { font-size: var(--step-2); }
:where(h3) { font-size: var(--step-1); }

.prose {
  max-width: var(--measure);    /* líneas cómodas de leer */
}

/* El primer título no necesita margen superior */
.prose > :first-child {
  margin-top: 0;
}

.lead {
  font-size: var(--step-1);
  color: oklch(45% 0.03 260);
}
```
