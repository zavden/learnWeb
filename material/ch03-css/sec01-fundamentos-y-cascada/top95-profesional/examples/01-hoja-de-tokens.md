---
example_description: "Hoja de tokens de un sistema de diseño: colores, espacios, escala tipográfica y radios como custom properties, organizados en capas"
example_tags: "css|profesional|design-tokens|custom-properties|layer"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="page-header">
  <p class="eyebrow">Sistema de diseño Brisa · versión 1.0</p>
  <h1>Tokens de diseño</h1>
  <p class="lead">Los valores básicos de la interfaz, definidos una sola vez como custom properties. Los componentes los leen; ninguno escribe un color o una medida a mano.</p>
</header>

<main class="page">
  <section aria-labelledby="color-title">
    <h2 id="color-title">Color</h2>
    <p>Todos los colores se definen en <code>oklch()</code> a partir de un tono de marca, <code>--brand-hue</code>. Los nombres describen la función, no el aspecto.</p>
    <table>
      <caption>Colores semánticos</caption>
      <thead>
        <tr><th scope="col">Muestra</th><th scope="col">Token</th><th scope="col">Uso</th></tr>
      </thead>
      <tbody>
        <tr><td><span class="chip" style="--chip: var(--color-bg)"></span></td><td><code>--color-bg</code></td><td>Fondo de la página</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-surface)"></span></td><td><code>--color-surface</code></td><td>Tarjetas, tablas y zonas destacadas</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-border)"></span></td><td><code>--color-border</code></td><td>Bordes y separadores</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-text)"></span></td><td><code>--color-text</code></td><td>Texto principal (15,5:1 sobre el fondo)</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-text-muted)"></span></td><td><code>--color-text-muted</code></td><td>Texto secundario (7,1:1 sobre el fondo)</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-brand)"></span></td><td><code>--color-brand</code></td><td>Enlaces y acciones principales (6:1)</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-success)"></span></td><td><code>--color-success</code></td><td>Confirmaciones</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-warning)"></span></td><td><code>--color-warning</code></td><td>Avisos</td></tr>
        <tr><td><span class="chip" style="--chip: var(--color-danger)"></span></td><td><code>--color-danger</code></td><td>Errores y acciones destructivas</td></tr>
      </tbody>
    </table>
  </section>

  <section aria-labelledby="space-title">
    <h2 id="space-title">Espaciado</h2>
    <p>Una escala de múltiplos de <code>0.25rem</code>. En <code>rem</code>, crece con el tamaño de letra que elige cada persona.</p>
    <ul class="scale" role="list">
      <li style="--size: var(--space-1)"><span class="bar"></span><code>--space-1</code> · 0.25rem</li>
      <li style="--size: var(--space-2)"><span class="bar"></span><code>--space-2</code> · 0.5rem</li>
      <li style="--size: var(--space-3)"><span class="bar"></span><code>--space-3</code> · 1rem</li>
      <li style="--size: var(--space-4)"><span class="bar"></span><code>--space-4</code> · 1.5rem</li>
      <li style="--size: var(--space-5)"><span class="bar"></span><code>--space-5</code> · 2.5rem</li>
    </ul>
  </section>

  <section aria-labelledby="type-title">
    <h2 id="type-title">Tipografía</h2>
    <p>Una escala de razón 1,25. Los pasos grandes usan <code>clamp()</code> para crecer con el ancho sin salirse de sus límites.</p>
    <p class="type-sample" style="--size: var(--step-3)">Titular principal <code>--step-3</code></p>
    <p class="type-sample" style="--size: var(--step-2)">Título de sección <code>--step-2</code></p>
    <p class="type-sample" style="--size: var(--step-1)">Subtítulo <code>--step-1</code></p>
    <p class="type-sample" style="--size: var(--step-0)">Texto de lectura <code>--step-0</code></p>
    <p class="type-sample" style="--size: var(--step--1)">Notas y leyendas <code>--step--1</code></p>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Hoja de tokens de diseño
   Arquitectura: los tokens viven en su propia capa y nada más los define.
   Nota: margin, padding, border, display, line-height y algunas propiedades de
   texto se usan de forma básica; se estudian en los módulos del modelo de cajas
   y de tipografía. Lo que importa aquí es la arquitectura.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, components;

@layer tokens {
  :root {
    /* Color: un tono de marca y luminosidades fijas (oklch es perceptual,
       así que el contraste no depende del tono). */
    --brand-hue: 260;
    --color-bg: oklch(98.5% 0.005 var(--brand-hue));
    --color-surface: oklch(96% 0.01 var(--brand-hue));
    --color-border: oklch(85% 0.02 var(--brand-hue));
    --color-text: oklch(25% 0.03 var(--brand-hue));
    --color-text-muted: oklch(45% 0.03 var(--brand-hue));
    --color-brand: oklch(50% 0.18 var(--brand-hue));
    --color-success: oklch(45% 0.12 150);
    --color-warning: oklch(50% 0.12 70);
    --color-danger: oklch(50% 0.19 27);

    /* Espaciado: múltiplos de 0.25rem */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 1rem;
    --space-4: 1.5rem;
    --space-5: 2.5rem;

    /* Tipografía: razón 1,25; los pasos grandes son fluidos */
    --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --step--1: 0.875rem;
    --step-0: 1rem;
    --step-1: 1.25rem;
    --step-2: clamp(1.4rem, 1.2rem + 1vw, 1.563rem);
    --step-3: clamp(1.6rem, 1.2rem + 2vw, 1.953rem);

    --radius: 0.375rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    line-height: 1.5;
  }

  :where(h1, h2) {
    line-height: 1.2;
    margin-block: var(--space-5) var(--space-2);
  }

  :where(code) {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }

  :where(table) {
    border-collapse: collapse;
  }

  :where(caption) {
    text-align: start;
    font-weight: bold;
    padding-block: var(--space-2);
  }

  :where(th, td) {
    text-align: start;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
  }
}

@layer components {
  .page-header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-4) var(--space-3);
  }

  .page-header h1 {
    font-size: var(--step-3);
    margin: 0;
  }

  .page {
    max-width: 48rem;
    padding-inline: var(--space-3);
  }

  .eyebrow {
    margin: 0 0 var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--step--1);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .lead {
    max-width: 60ch;
    margin-bottom: 0;
    color: var(--color-text-muted);
  }

  /* Muestra de color: el atributo style del HTML le da --chip.
     (display: inline-block deja dar tamaño a un elemento en línea: modelo de cajas) */
  .chip {
    display: inline-block;
    width: 2.5rem;
    height: 1.5rem;
    background: var(--chip);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    vertical-align: middle;
  }

  /* Escala de espacios: cada barra mide lo que su --size */
  .scale {
    list-style: none;
    padding: 0;
  }

  .scale li {
    margin-block: var(--space-2);
  }

  .bar {
    display: inline-block;
    width: var(--size);
    height: 1rem;
    margin-inline-end: var(--space-3);
    background: var(--color-brand);
    vertical-align: middle;
  }

  .type-sample {
    font-size: var(--size);
    line-height: 1.2;
    margin-block: var(--space-3);
  }

  .type-sample code {
    color: var(--color-text-muted);
    font-size: var(--step--1);
  }
}
```
