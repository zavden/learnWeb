---
example_description: "Una tabla comparativa de planes con la fila de planes y la columna de características sticky dentro de un contenedor con scroll, la esquina por encima de ambas, la columna recomendada resaltada y una etiqueta centrada con position"
example_tags: "css|profesional|sticky|z-index|tablas|scroll|position"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="pricing">
  <h1 class="pricing-title">Compara los planes de Nube Fotos</h1>
  <p class="pricing-lede">Todos incluyen copias automáticas desde el móvil. Puedes cambiar de plan cuando quieras.</p>

  <div class="compare" tabindex="0" role="region" aria-labelledby="compare-caption">
    <table>
      <caption id="compare-caption">Características de cada plan, precio por mes</caption>
      <thead>
        <tr>
          <th scope="col" class="corner">Característica</th>
          <th scope="col">
            <span class="plan-name">Básico</span>
            <span class="plan-price">0 €</span>
            <a class="plan-action" href="#">Empezar</a>
          </th>
          <th scope="col" class="is-featured">
            <span class="pill">Recomendado</span>
            <span class="plan-name">Familiar</span>
            <span class="plan-price">4,99 €</span>
            <a class="plan-action plan-action--primary" href="#">Elegir Familiar</a>
          </th>
          <th scope="col">
            <span class="plan-name">Profesional</span>
            <span class="plan-price">9,99 €</span>
            <a class="plan-action" href="#">Elegir Profesional</a>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="group"><th scope="colgroup" colspan="4">Almacenamiento</th></tr>
        <tr><th scope="row">Espacio</th><td>15 GB</td><td class="is-featured">200 GB</td><td>2 TB</td></tr>
        <tr><th scope="row">Calidad original</th><td><img class="mark" src="icon-minus.svg" alt="No incluido"></td><td class="is-featured"><img class="mark" src="icon-check.svg" alt="Incluido"></td><td><img class="mark" src="icon-check.svg" alt="Incluido"></td></tr>
        <tr><th scope="row">Vídeos en 4K</th><td><img class="mark" src="icon-minus.svg" alt="No incluido"></td><td class="is-featured"><img class="mark" src="icon-check.svg" alt="Incluido"></td><td><img class="mark" src="icon-check.svg" alt="Incluido"></td></tr>
        <tr class="group"><th scope="colgroup" colspan="4">Compartir</th></tr>
        <tr><th scope="row">Personas en el plan</th><td>1</td><td class="is-featured">hasta 6</td><td>1</td></tr>
        <tr><th scope="row">Álbumes compartidos</th><td>3</td><td class="is-featured">ilimitados</td><td>ilimitados</td></tr>
        <tr><th scope="row">Enlaces con contraseña</th><td><img class="mark" src="icon-minus.svg" alt="No incluido"></td><td class="is-featured"><img class="mark" src="icon-check.svg" alt="Incluido"></td><td><img class="mark" src="icon-check.svg" alt="Incluido"></td></tr>
        <tr class="group"><th scope="colgroup" colspan="4">Soporte</th></tr>
        <tr><th scope="row">Atención</th><td>Foro</td><td class="is-featured">Correo en 24 h</td><td>Teléfono y correo</td></tr>
        <tr><th scope="row">Historial de versiones</th><td>7 días</td><td class="is-featured">30 días</td><td>1 año</td></tr>
      </tbody>
    </table>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tabla comparativa de planes
   - Un único contenedor de scroll en los dos ejes (max-height + overflow: auto):
     así la fila de planes puede pegarse arriba Y la columna de características
     a la izquierda. Con solo overflow-x: auto, la cabecera no se pegaría nunca.
   - border-collapse: separate, porque los bordes colapsados no acompañan a las
     celdas sticky.
   - z-index: celdas de la columna (1) < fila de planes (2) < esquina (3).
   - La etiqueta «Recomendado» se centra en su celda con left/right: 0 y margin
     auto: una celda sticky también es una caja posicionada, y sirve de referencia.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-brand: #6d28d9;
    --color-featured: #f5f3ff;
    --color-group: #f1f5f9;
    --color-focus: #1d4ed8;

    --z-cell: 1;
    --z-head: 2;
    --z-corner: 3;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .pricing {
    width: min(100% - 2rem, 52rem);
    margin: 1.5rem auto 3rem;
  }

  .pricing-title {
    font-size: clamp(1.4rem, 4vw, 1.9rem);
    line-height: 1.2;
  }

  .pricing-lede {
    margin-block: 0.5rem 1rem;
    color: var(--color-text-muted);
  }

  /* El contenedor de scroll: enfocable y con nombre, para recorrerlo con el teclado. */
  .compare {
    max-height: min(26rem, 75vh);
    overflow: auto;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
  }

  table {
    width: 100%;
    min-width: 38rem;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.9rem;
  }

  caption {
    padding: 0.6rem 1rem;
    color: var(--color-text-muted);
    text-align: start;
  }

  th,
  td {
    padding: 0.6rem 0.9rem;
    border-bottom: 1px solid var(--color-border);
    text-align: center;
  }

  /* ─── Fila de planes: sticky arriba ─── */
  thead th {
    position: sticky;
    top: 0;
    z-index: var(--z-head);
    padding-top: 1.75rem;                /* sitio para la etiqueta */
    border-bottom: 2px solid var(--color-text);
    background: var(--color-surface);
    vertical-align: bottom;
  }

  .plan-name,
  .plan-price {
    display: block;
  }

  .plan-name {
    font-size: 1rem;
  }

  .plan-price {
    margin-bottom: 0.4rem;
    font-size: 1.4rem;
    font-weight: 800;
  }

  .plan-action {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand);
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
  }

  .plan-action--primary {
    background: var(--color-brand);
    color: #ffffff;
  }

  /* Centrada en la parte de arriba de su celda: left y right a 0, un ancho que
     se ajusta al texto (fit-content) y margin-inline: auto. */
  .pill {
    position: absolute;
    top: 0.4rem;
    right: 0;
    left: 0;
    width: fit-content;
    margin-inline: auto;
    padding: 0 0.6rem;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  /* ─── Columna de características: sticky a la izquierda ─── */
  tbody th {
    position: sticky;
    left: 0;
    z-index: var(--z-cell);
    border-right: 1px solid var(--color-border);
    background: var(--color-surface);
    font-weight: 500;
    text-align: start;
  }

  /* La esquina se pega en los dos ejes y queda encima de todo. */
  thead .corner {
    left: 0;
    z-index: var(--z-corner);
    text-align: start;
  }

  /* Filas de grupo: un título que ocupa toda la fila. */
  .group th {
    background: var(--color-group);
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 700;
  }

  /* Columna recomendada. Las celdas sticky necesitan un fondo opaco: este lo es. */
  .is-featured {
    background: var(--color-featured);
  }

  thead th.is-featured {
    background: var(--color-featured);
  }

  /* Iconos de 1.25rem centrados en la línea de la celda. */
  .mark {
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    vertical-align: middle;
  }
}
```
