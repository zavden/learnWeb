---
example_description: "Los planes de socio de un museo que se reacomodan por contenedor: el mismo componente, a todo el ancho (tres columnas alineadas con subgrid desde 26rem) y en una barra lateral de 18rem (apilado). Cada plan es a su vez contenedor y su precio crece con cqi"
example_tags: "css|profesional|responsive|container-queries|container-name|subgrid|cqi|precios"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <section class="pricing" aria-labelledby="pricing-title">
    <h1 id="pricing-title">Hazte amigo del museo</h1>
    <p class="pricing__intro">Entrada libre todo el año y una forma de cuidar la colección.</p>
    <div class="plans">
      <article class="plan">
        <h2 class="plan__name">Estudiante</h2>
        <p class="plan__price">250 <span>MXN al año</span></p>
        <ul class="plan__features"><li>Entrada libre</li><li>Boletín mensual</li></ul>
        <a class="plan__cta" href="/amigos/estudiante">Elegir<span class="visually-hidden"> el plan Estudiante</span></a>
      </article>
      <article class="plan is-featured">
        <h2 class="plan__name">Amigo <span class="plan__badge">El más elegido</span></h2>
        <p class="plan__price">600 <span>MXN al año</span></p>
        <ul class="plan__features"><li>Entrada libre con un acompañante</li><li>Visitas guiadas</li><li>10 % en la tienda</li></ul>
        <a class="plan__cta" href="/amigos/amigo">Elegir<span class="visually-hidden"> el plan Amigo</span></a>
      </article>
      <article class="plan">
        <h2 class="plan__name">Mecenas</h2>
        <p class="plan__price">2&nbsp;400 <span>MXN al año</span></p>
        <ul class="plan__features"><li>Todo lo de Amigo</li><li>Inauguraciones privadas</li><li>Tu nombre en el muro de mecenas</li></ul>
        <a class="plan__cta" href="/amigos/mecenas">Elegir<span class="visually-hidden"> el plan Mecenas</span></a>
      </article>
    </div>
  </section>

  <aside class="sidebar" aria-label="En la barra lateral del blog">
    <p class="sidebar__label">El mismo componente en una barra lateral de 18rem:</p>
    <section class="pricing" aria-label="Planes de socio">
      <div class="plans">
        <article class="plan">
          <h2 class="plan__name">Estudiante</h2>
          <p class="plan__price">250 <span>MXN al año</span></p>
          <ul class="plan__features"><li>Entrada libre</li><li>Boletín mensual</li></ul>
          <a class="plan__cta" href="/amigos/estudiante">Elegir<span class="visually-hidden"> el plan Estudiante</span></a>
        </article>
        <article class="plan is-featured">
          <h2 class="plan__name">Amigo <span class="plan__badge">El más elegido</span></h2>
          <p class="plan__price">600 <span>MXN al año</span></p>
          <ul class="plan__features"><li>Entrada libre con un acompañante</li><li>Visitas guiadas</li><li>10 % en la tienda</li></ul>
          <a class="plan__cta" href="/amigos/amigo">Elegir<span class="visually-hidden"> el plan Amigo</span></a>
        </article>
      </div>
    </section>
  </aside>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Planes de socio
   - El componente .pricing es un contenedor con nombre. Por debajo de 26rem
     (416px), los planes se apilan; desde 26rem, tres columnas cuyas filas
     (nombre, precio, ventajas, botón) se alinean entre planes con subgrid
     (módulo de grid): cada plan ocupa 4 filas de la rejilla de fuera.
   - Cada plan es también un contenedor (plan): el precio mide con cqi su
     propia columna, no la ventana ni el componente.
   - A 480px de ventana, el componente principal mide unos 440px (tres
     columnas) y el de la barra lateral, 18rem (apilado). Al ensanchar, la
     barra se pone al lado desde 56rem (media query del esqueleto).
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
}

@layer tokens {
  :root {
    --color-text: #1c1917;
    --color-muted: #57534e;
    --color-accent: #7c2d12;
    --color-accent-soft: #ffedd5;
    --color-border: #d6d3d1;
    --radius: 12px;
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body {
    padding: var(--space-s-l);
    background: #ffffff;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }

  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
}

@layer components {
  .pricing { container: pricing / inline-size; }
  .pricing h1 { font-family: Georgia, serif; font-size: 1.5rem; }
  .pricing__intro { margin: 4px 0 var(--space-s); color: var(--color-muted); }

  /* Mobile-first: los planes, uno debajo de otro. */
  .plans { display: grid; gap: var(--space-xs); }

  .plan {
    container: plan / inline-size;
    display: grid;
    gap: 8px;
    align-content: start;
    padding: var(--space-xs);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  .plan.is-featured { border: 2px solid var(--color-accent); background: var(--color-accent-soft); }
  .plan__name { font-size: 1rem; }
  .plan__badge { display: inline-block; padding: 1px 8px; border-radius: 999px; background: var(--color-accent); color: #ffffff; font-size: 0.7rem; vertical-align: 2px; }

  /* El precio mide su plan: 8.8px + 7 % del ancho del plan, entre 20 y 32px. */
  .plan__price { font-size: clamp(1.25rem, 0.55rem + 7cqi, 2rem); font-weight: 700; line-height: 1; }
  .plan__price span { display: block; margin-top: 2px; color: var(--color-muted); font-size: 0.8rem; font-weight: 400; }

  .plan__features { display: grid; gap: 2px; padding: 0; list-style: none; font-size: 0.85rem; }
  .plan__features li::before { content: "✓ "; color: #166534; font-weight: 700; }

  /* El enlace dice «Elegir» a la vista y «Elegir el plan Amigo» a un lector
     de pantalla (patrón visually-hidden del capítulo de HTML). */
  .visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

  .plan__cta { justify-self: start; padding: 6px 14px; border: 2px solid var(--color-accent); border-radius: 999px; color: var(--color-accent); font-weight: 700; text-decoration: none; }
  .is-featured .plan__cta { background: var(--color-accent); color: #ffffff; }

  /* Con sitio: tres columnas con las filas compartidas. */
  @container pricing (width >= 26rem) {
    .plans {
      grid-template-rows: auto auto 1fr auto;
      grid-auto-flow: column;              /* cada plan, una columna nueva… */
      grid-auto-columns: minmax(0, 1fr);   /* …todas iguales, tantas como planes */
      column-gap: var(--space-xs);
    }

    .plan { grid-row: span 4; grid-template-rows: subgrid; row-gap: 8px; }
    .plan__cta { align-self: end; }
  }
}

@layer layout {
  .page { display: grid; gap: var(--space-s-l); }
  .sidebar { max-inline-size: 18rem; padding: var(--space-xs); border-radius: var(--radius); background: #f5f5f4; }
  .sidebar__label { margin-bottom: 8px; color: var(--color-muted); font-size: 0.8rem; }

  @media (width >= 56rem) {
    .page { grid-template-columns: minmax(0, 1fr) 18rem; align-items: start; }
  }
}
```
