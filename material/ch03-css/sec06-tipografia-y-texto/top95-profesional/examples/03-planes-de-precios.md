---
example_description: "Los planes de una suscripción de pan a domicilio: precios grandes con cifras tabulares y la caja recortada con text-box, el precio anterior tachado con su propio color, etiqueta en mayúsculas espaciadas, ventajas alineadas con subgrid y botones con el padding medido desde la letra"
example_tags: "css|profesional|tipografia|tabular-nums|text-box|text-decoration|subgrid|precios"
example_stage: professional
example_importance: important
---

# HTML

```html
<section class="pricing" aria-labelledby="pricing-title">
  <h2 id="pricing-title">Pan recién hecho en tu puerta</h2>
  <p class="intro">Elige cada cuánto quieres recibirlo. Cancelas cuando quieras, sin llamadas.</p>

  <ul class="plans">
    <li class="plan">
      <h3>Básico</h3>
      <p class="price"><span class="amount">$289</span> <span class="period">al mes</span></p>
      <ul class="perks">
        <li>Una entrega a la semana</li>
        <li>6 piezas de bolillo o telera</li>
      </ul>
      <a class="button" href="/suscripcion/basico">Elegir Básico</a>
    </li>

    <li class="plan is-featured">
      <h3>Familiar <span class="badge">Más elegido</span></h3>
      <p class="price"><span class="amount">$529</span> <span class="period">al mes</span> <span class="old">antes <s>$589</s></span></p>
      <ul class="perks">
        <li>Dos entregas a la semana</li>
        <li>12 piezas a elegir, dulces o saladas</li>
        <li>Pan de temporada sin costo extra</li>
      </ul>
      <a class="button" href="/suscripcion/familiar">Elegir Familiar</a>
    </li>

    <li class="plan">
      <h3>Restaurante</h3>
      <p class="price"><span class="amount">$1,249</span> <span class="period">al mes</span></p>
      <ul class="perks">
        <li>Entrega diaria antes de las 7:00</li>
        <li>Hasta 40 piezas por entrega</li>
        <li>Factura mensual</li>
      </ul>
      <a class="button" href="/suscripcion/restaurante">Elegir Restaurante</a>
    </li>
  </ul>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Planes de precios
   - Columnas auto-fit con el mínimo protegido; cada plan ocupa 4 filas
     compartidas con subgrid (nombre, precio, ventajas, botón).
   - Precio: cifras tabulares (los tres importes se comparan) y text-box para
     que su caja empiece en la altura de las cifras y termine en la línea
     base, sin el aire que una letra de 38px reserva por encima y por debajo.
   - Precio anterior: <s> («ya no es válido»), con la raya de un color más
     claro que el texto para que el número se siga leyendo.
   - Etiqueta y nombre en la misma línea, con flexbox; la etiqueta, en
     mayúsculas escritas con CSS y letter-spacing en em.
   - Botones con text-box: 12px de padding desde la letra, arriba y abajo.
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
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-line: #cbd5e1;
    --color-brand: #3730a3;
    --color-brand-soft: #e0e7ff;
    --color-strike: #94a3b8;
    --color-focus: #1d4ed8;
  }
}

@layer base {
  body {
    padding: 16px;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.5;
  }

  a:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 3px;
  }
}

@layer components {
  .pricing > h2 {
    font-size: 1.6rem;
    line-height: 1.2;
    text-align: center;
    text-wrap: balance;
  }

  .intro {
    max-inline-size: 40ch;
    margin: 4px auto 16px;
    color: var(--color-muted);
    text-align: center;
    text-wrap: balance;
  }

  .plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 16px 12px;
    padding: 0;
    list-style: none;
  }

  .plan {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
    row-gap: 14px;
    padding: 16px;
    border: 1px solid var(--color-line);
    border-radius: 12px;
  }

  .plan.is-featured {
    border: 2px solid var(--color-brand);
    background: #f8fafc;
  }

  .plan h3 {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    align-items: center;
    font-size: 1.1rem;
  }

  .badge {
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* ─── Precio ─── */
  .price {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 6px;
    align-items: baseline;
    color: var(--color-muted);
  }

  .amount {
    color: var(--color-text);
    font-size: 2.4rem;
    font-variant-numeric: tabular-nums;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
    text-box: trim-both cap alphabetic;
  }

  .old {
    font-size: 0.85rem;
  }

  .old s {
    text-decoration-color: var(--color-strike);
    text-decoration-thickness: 2px;
  }

  /* ─── Ventajas ─── */
  .perks {
    display: grid;
    gap: 6px;
    padding-inline-start: 1.2em;
    font-size: 0.9rem;
    text-wrap: pretty;
  }

  .perks li::marker {
    content: "✓  " / "";
    color: var(--color-brand);
    font-weight: 700;
  }

  /* ─── Botón ─── */
  .button {
    align-self: end;
    padding: 12px 16px;
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand);
    font-weight: 700;
    text-align: center;
    text-decoration: none;
    text-box: trim-both cap alphabetic;
  }

  .is-featured .button {
    background: var(--color-brand);
    color: #ffffff;
  }
}
```
