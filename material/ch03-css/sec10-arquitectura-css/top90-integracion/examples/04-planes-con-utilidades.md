---
example_description: "Los planes de una huerta comunitaria con componentes BEM anidados y utilidades de composición (.stack, .cluster, .u-text-center, .visually-hidden) en la última capa: ganan a los componentes sin !important. La base usa :where() y el precio lleva un texto oculto para el lector de pantalla"
example_tags: "css|integracion|utilidades|bem|anidamiento|layer|where|visually-hidden"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<main class="stack" style="--stack-space: 16px">
  <header class="stack u-text-center" style="--stack-space: 4px">
    <h1>Renta tu espacio en la Huerta Tlatelolco</h1>
    <p class="lead">Herramientas, agua y composta incluidas en todos los planes.</p>
  </header>
  <ul class="plans" role="list">
    <li class="plan stack">
      <h2 class="plan__name">Maceta</h2>
      <p class="plan__price">$90<span class="visually-hidden"> pesos</span> <small>al mes</small></p>
      <ul class="plan__features stack" role="list" style="--stack-space: 4px">
        <li>Tres macetas en la azotea</li>
        <li>Riego los fines de semana</li>
      </ul>
      <a class="button button--ghost" href="/huerta/planes/maceta">Elegir <span class="visually-hidden">el plan Maceta</span></a>
    </li>
    <li class="plan plan--featured stack">
      <p class="plan__tag u-text-center">El más elegido</p>
      <h2 class="plan__name">Bancal</h2>
      <p class="plan__price">$180<span class="visually-hidden"> pesos</span> <small>al mes</small></p>
      <ul class="plan__features stack" role="list" style="--stack-space: 4px">
        <li>Un bancal de 2 × 1 m</li>
        <li>Riego por goteo diario</li>
        <li>Taller mensual de siembra</li>
      </ul>
      <a class="button" href="/huerta/planes/bancal">Elegir <span class="visually-hidden">el plan Bancal</span></a>
    </li>
  </ul>
  <p class="cluster note"><span>Sin permanencia</span> <span>·</span> <span>Factura disponible</span> <span>·</span> <span>Primer mes con 50 % de descuento</span></p>
</main>
```

# CSS

```css
@layer reset, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  body { line-height: 1.5; }
  :where(ul, ol)[role="list"] { padding: 0; list-style: none; }
  h1, h2 { text-wrap: balance; }
}

@layer base {
  body {
    padding: 16px;
    font-family: system-ui, sans-serif;
    color: #0f172a;
    background: #f8fafc;
  }

  h1 { font-size: 1.35rem; line-height: 1.2; }

  :focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

@layer components {
  .lead,
  .note { color: #475569; font-size: 0.85rem; }

  .plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    gap: 12px;
    align-items: start;
  }

  .plan {
    padding: 16px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background: #ffffff;
    text-align: start;

    &.plan--featured {
      border: 2px solid #15803d;
      box-shadow: 0 6px 18px rgb(15 23 42 / 0.12);
    }
  }

  .plan__tag {
    padding: 2px 8px;
    border-radius: 999px;
    background: #dcfce7;
    color: #14532d;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .plan__name { font-size: 1.1rem; }

  .plan__price {
    font-size: 1.6rem;
    font-weight: 700;

    small { color: #475569; font-size: 0.8rem; font-weight: 400; }
  }

  .plan__features {
    font-size: 0.85rem;

    li::before { content: "✓ "; color: #15803d; font-weight: 700; }
  }

  .button {
    display: inline-block;
    padding: 8px 16px;
    border: 2px solid #15803d;
    border-radius: 999px;
    background: #15803d;
    color: #ffffff;
    font-weight: 700;
    text-align: center;
    text-decoration: none;

    &.button--ghost { background: transparent; color: #15803d; }
  }
}

/* Utilidades de composición: colocan, no decoran. Leen una custom
   property con respaldo para ajustar el hueco desde el HTML. Están en la
   última capa: .u-text-center gana al text-align: start de .plan, y
   .stack al display de cualquier componente, sin !important. */
@layer utilities {
  .stack {
    display: flex;
    flex-direction: column;
    gap: var(--stack-space, 12px);
  }

  .cluster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--cluster-space, 6px);
    align-items: center;
  }

  .u-text-center { text-align: center; }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
```
