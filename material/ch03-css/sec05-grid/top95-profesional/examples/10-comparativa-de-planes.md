---
example_description: "Una comparativa de planes: cada plan ocupa nueve filas compartidas con subgrid, y su lista de ventajas es otra subrejilla anidada, así cada ventaja queda a la misma altura en los tres planes aunque los textos midan distinto"
example_tags: "css|profesional|grid|subgrid|subgrid-anidado|auto-fit|capas|precios"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="pricing">
  <header class="pricing-header">
    <h1>Una caja de plantas a tu medida</h1>
    <p>Cambia de plan o cancela cuando quieras. Precios en pesos mexicanos, con IVA.</p>
  </header>

  <ul class="plans">
    <li class="plan">
      <h2>Básica</h2>
      <p class="price"><strong>0 MXN</strong> <span>al mes</span></p>
      <p class="description">Para empezar: aprende a cuidar lo que ya tienes.</p>
      <ul class="perks" aria-label="Qué incluye la Básica">
        <li class="yes">Guía mensual por correo</li>
        <li class="no">Sin plantas nuevas</li>
        <li class="no">Sin sustrato ni abono</li>
        <li class="no">Sin chat con experta</li>
        <li class="no">Sin visitas</li>
      </ul>
      <a class="button" href="/suscripcion/basica">Empezar gratis</a>
    </li>
    <li class="plan is-featured">
      <h2>Huerto</h2>
      <p class="badge">Más elegido</p>
      <p class="price"><strong>89 MXN</strong> <span>al mes</span></p>
      <p class="description">Una planta de temporada al mes, con todo lo que necesita para crecer.</p>
      <ul class="perks" aria-label="Qué incluye Huerto">
        <li class="yes">Guía mensual por correo</li>
        <li class="yes">1 planta de temporada al mes</li>
        <li class="yes">Sustrato y abono para esa planta</li>
        <li class="yes">Chat con una experta, de lunes a viernes</li>
        <li class="no">Sin visitas</li>
      </ul>
      <a class="button" href="/suscripcion/huerto">Elegir Huerto</a>
    </li>
    <li class="plan">
      <h2>Invernadero</h2>
      <p class="price"><strong>199 MXN</strong> <span>al mes</span></p>
      <p class="description">Para quien ya tiene un rincón verde y quiere llenarlo.</p>
      <ul class="perks" aria-label="Qué incluye Invernadero">
        <li class="yes">Guía mensual por correo</li>
        <li class="yes">3 plantas al mes</li>
        <li class="yes">Sustrato, abono y macetas</li>
        <li class="yes">Chat con una experta todos los días</li>
        <li class="yes">1 visita al año a domicilio</li>
      </ul>
      <a class="button" href="/suscripcion/invernadero">Elegir Invernadero</a>
    </li>
  </ul>

  <p class="guarantee">¿No te convence? Te devolvemos el primer mes sin preguntas.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Comparativa de planes
   - Columnas: auto-fit de al menos 12rem (con min()): tres planes lado a lado
     o uno debajo de otro.
   - Cada plan ocupa 9 filas de la rejilla: nombre, precio, descripción, las 5
     ventajas y el botón. Las comparte con subgrid.
   - La lista de ventajas ocupa 5 de esas filas y es OTRA subrejilla: cada li cae
     en su fila, compartida con los li de los otros planes. «Chat con una experta
     todos los días» puede ocupar dos líneas: su fila crece en los tres planes y
     la comparación se sigue leyendo en horizontal.
   - Nombre y etiqueta «Más elegido» en la misma celda (grid-area: 1 / 1).
   - Las ventajas que no incluye un plan lo dicen con texto («Sin…»), no solo
     con un símbolo: se entienden igual sin ver el icono ni el color.
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
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #cbd5e1;
    --color-brand: #0f766e;
    --color-brand-dark: #134e4a;
    --color-brand-soft: #f0fdfa;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 1rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .pricing {
    max-width: 60rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  .pricing-header {
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    text-align: center;
  }

  .pricing-header h1 {
    font-size: clamp(1.5rem, 1.1rem + 2vw, 2.2rem);
    line-height: 1.15;
  }

  .pricing-header p {
    max-width: 32rem;
    color: var(--color-muted);
  }

  /* ─── La rejilla de planes ─── */
  .plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: var(--space-6) var(--space-4);
    padding: 0;
    list-style: none;
  }

  .plan {
    display: grid;
    grid-row: span 9;
    grid-template-rows: subgrid;
    row-gap: var(--space-2);
    padding: var(--space-4);
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
  }

  .plan.is-featured {
    border: 2px solid var(--color-brand);
    background: var(--color-brand-soft);
  }

  .plan h2,
  .badge {
    grid-area: 1 / 1;
  }

  .plan h2 {
    font-size: 1.15rem;
  }

  .badge {
    justify-self: end;
    align-self: start;
    padding: 0 var(--space-2);
    border-radius: 999px;
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .price {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1);
  }

  .price strong {
    font-size: 1.8rem;
    line-height: 1;
  }

  .price span,
  .description {
    color: var(--color-muted);
  }

  .description {
    font-size: 0.9rem;
  }

  /* ─── Ventajas: subrejilla dentro de la subrejilla ─── */
  .perks {
    display: grid;
    grid-row: span 5;
    grid-template-rows: subgrid;
    padding: var(--space-2) 0 0;
    border-top: 1px solid var(--color-line);
    list-style: none;
    font-size: 0.9rem;
  }

  .perks li {
    display: grid;
    grid-template-columns: 1.25rem minmax(0, 1fr);
    align-items: baseline;
    gap: var(--space-2);
  }

  .perks li::before {
    font-weight: 700;
    text-align: center;
  }

  .perks .yes::before {
    content: "✓" / "";
    color: var(--color-brand);
  }

  .perks .no {
    color: var(--color-muted);
  }

  .perks .no::before {
    content: "—" / "";
  }

  .button {
    align-self: end;
    padding: var(--space-2);
    border: 2px solid var(--color-brand);
    border-radius: 999px;
    color: var(--color-brand-dark);
    font-weight: 700;
    text-align: center;
    text-decoration: none;
  }

  .is-featured .button {
    background: var(--color-brand);
    color: #ffffff;
  }

  .guarantee {
    margin-top: var(--space-6);
    color: var(--color-muted);
    text-align: center;
  }
}
```
