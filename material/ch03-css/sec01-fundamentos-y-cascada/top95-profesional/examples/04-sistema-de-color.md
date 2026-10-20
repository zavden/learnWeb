---
example_description: "Un sistema de color con oklch(): escala tonal de la marca con su contraste real, colores semánticos derivados con color-mix() y alertas con currentColor"
example_tags: "css|profesional|color|oklch|color-mix|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <h1>Sistema de color</h1>
  <p class="lead">Toda la paleta sale de un tono de marca, <code>--brand-hue</code>, y de luminosidades fijas en <code>oklch()</code>. Cambia ese número en el CSS y la escala entera se recalcula con un contraste casi idéntico.</p>

  <h2>Escala tonal de la marca</h2>
  <table>
    <caption>Cada paso con el color de texto que cumple WCAG AA (4,5:1) sobre él</caption>
    <thead>
      <tr><th scope="col">Token</th><th scope="col">Muestra</th><th scope="col">Texto que cumple</th><th scope="col">Contraste</th></tr>
    </thead>
    <tbody>
      <tr><td><code>--brand-97</code></td><td class="swatch" style="--swatch: var(--brand-97)" data-on="dark">Aa</td><td>oscuro</td><td>16,6:1</td></tr>
      <tr><td><code>--brand-90</code></td><td class="swatch" style="--swatch: var(--brand-90)" data-on="dark">Aa</td><td>oscuro</td><td>13,4:1</td></tr>
      <tr><td><code>--brand-80</code></td><td class="swatch" style="--swatch: var(--brand-80)" data-on="dark">Aa</td><td>oscuro</td><td>9,7:1</td></tr>
      <tr><td><code>--brand-70</code></td><td class="swatch" style="--swatch: var(--brand-70)" data-on="dark">Aa</td><td>oscuro</td><td>6,7:1</td></tr>
      <tr><td><code>--brand-60</code></td><td class="swatch" style="--swatch: var(--brand-60)" data-on="dark">Aa</td><td>oscuro (el blanco solo llega a 4:1)</td><td>4,5:1</td></tr>
      <tr><td><code>--brand-50</code></td><td class="swatch" style="--swatch: var(--brand-50)" data-on="light">Aa</td><td>blanco</td><td>6,2:1</td></tr>
      <tr><td><code>--brand-40</code></td><td class="swatch" style="--swatch: var(--brand-40)" data-on="light">Aa</td><td>blanco</td><td>9,5:1</td></tr>
      <tr><td><code>--brand-30</code></td><td class="swatch" style="--swatch: var(--brand-30)" data-on="light">Aa</td><td>blanco</td><td>13,9:1</td></tr>
      <tr><td><code>--brand-20</code></td><td class="swatch" style="--swatch: var(--brand-20)" data-on="light">Aa</td><td>blanco</td><td>18,2:1</td></tr>
    </tbody>
  </table>
  <p class="note">Contrastes medidos con el tono 260. Como oklch() es perceptual, con otro tono varían muy poco, pero conviene volver a medirlos en DevTools.</p>

  <h2>Colores semánticos</h2>
  <p>Cada alerta define un único color, <code>--tone</code>. El fondo y el texto se derivan de él con <code>color-mix()</code>, y el borde y el icono usan <code>currentColor</code>.</p>
  <p class="alert" data-tone="info"><strong>Información:</strong> el mantenimiento programado será el domingo de 2:00 a 4:00.</p>
  <p class="alert" data-tone="success"><strong>Hecho:</strong> tus cambios se han guardado correctamente.</p>
  <p class="alert" data-tone="warning"><strong>Atención:</strong> tu suscripción caduca dentro de 3 días.</p>
  <p class="alert" data-tone="danger"><strong>Error:</strong> no se ha podido procesar el pago. Revisa los datos de la tarjeta.</p>

  <h2>Estados derivados</h2>
  <p>El estado <code>:hover</code> no es un color nuevo: es el mismo botón mezclado con un 20 % de negro.</p>
  <p>
    <button type="button" class="btn">Guardar cambios</button>
    <button type="button" class="btn" data-tone="danger">Eliminar cuenta</button>
  </p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Sistema de color
   - Escala: luminosidad fija + croma que baja en los extremos (donde la
     pantalla no puede mostrar colores intensos) + un tono común.
   - Semánticos: un solo color por intención; el resto se deriva con color-mix().
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, components;

@layer tokens {
  :root {
    --brand-hue: 260;

    --brand-97: oklch(97% 0.02 var(--brand-hue));
    --brand-90: oklch(90% 0.05 var(--brand-hue));
    --brand-80: oklch(80% 0.09 var(--brand-hue));
    --brand-70: oklch(70% 0.13 var(--brand-hue));
    --brand-60: oklch(60% 0.16 var(--brand-hue));
    --brand-50: oklch(50% 0.18 var(--brand-hue));
    --brand-40: oklch(40% 0.16 var(--brand-hue));
    --brand-30: oklch(30% 0.12 var(--brand-hue));
    --brand-20: oklch(20% 0.07 var(--brand-hue));

    /* Semánticos: un color de luminosidad media por intención */
    --color-info: var(--brand-50);
    --color-success: oklch(50% 0.13 150);
    --color-warning: oklch(55% 0.13 70);
    --color-danger: oklch(50% 0.19 27);

    --color-text: oklch(20% 0.02 var(--brand-hue));
    --color-text-muted: oklch(45% 0.03 var(--brand-hue));
    --color-bg: oklch(98.5% 0.005 var(--brand-hue));
    --color-border: oklch(85% 0.02 var(--brand-hue));
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(h1, h2) {
    line-height: 1.2;
    margin-block: 2rem 0.5rem;
  }

  :where(code) {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 0.9em;
  }

  :where(table) {
    border-collapse: collapse;
  }

  :where(caption) {
    text-align: start;
    color: var(--color-text-muted);
    padding-block: 0.5rem;
  }

  :where(th, td) {
    text-align: start;
    padding: 0.4rem 0.8rem;
    border-bottom: 1px solid var(--color-border);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--brand-50);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    max-width: 50rem;
    margin-inline: auto;
    padding: 1rem;
  }

  .lead,
  .note {
    color: var(--color-text-muted);
  }

  .note {
    font-size: 0.875rem;
  }

  /* Muestra: el fondo viene del atributo style; el texto, del atributo data-on */
  .swatch {
    background: var(--swatch);
    font-weight: bold;
    min-width: 6rem;
  }

  .swatch[data-on="dark"]  { color: var(--color-text); }
  .swatch[data-on="light"] { color: #ffffff; }

  /* Alertas: --tone es la única entrada; todo lo demás se calcula */
  .alert {
    --tone: var(--color-info);
    color: color-mix(in oklch, var(--tone) 70%, black);       /* ≈ luminosidad 35 % */
    background: color-mix(in oklch, var(--tone) 12%, white);  /* ≈ luminosidad 94 % */
    border-left: 4px solid currentColor;
    padding: 0.6rem 0.9rem;
  }

  [data-tone="success"] { --tone: var(--color-success); }
  [data-tone="warning"] { --tone: var(--color-warning); }
  [data-tone="danger"]  { --tone: var(--color-danger); }

  /* Icono decorativo: usa el color del texto y no se lee (la palabra en negrita ya informa) */
  .alert::before {
    content: "● " / "";
  }

  .btn {
    --tone: var(--color-info);
    background: var(--tone);
    color: #ffffff;
    border: 0;
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    font: inherit;
  }

  .btn:hover {
    background: color-mix(in oklch, var(--tone) 80%, black);
  }
}
```
