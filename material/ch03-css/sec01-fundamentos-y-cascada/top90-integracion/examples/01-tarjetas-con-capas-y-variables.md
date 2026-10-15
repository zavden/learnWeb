---
example_description: "Tarjetas con @layer, custom properties como interfaz del componente, color-mix(), :has() y una utilidad que gana por capa, sin !important"
example_tags: "css|layer|custom-properties|has|color-mix"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="card">
  <h3 class="card-title">Plan Básico</h3>
  <p>Para empezar a publicar tu web.</p>
  <a class="card-link" href="#">Ver detalles</a>
</article>

<article class="card card--featured">
  <h3 class="card-title">Plan Profesional <span class="badge">Recomendado</span></h3>
  <p>Dominio propio, copias de seguridad diarias y soporte prioritario.</p>
  <a class="card-link" href="#">Ver detalles</a>
</article>

<article class="card card--featured u-muted">
  <h3 class="card-title">Plan Clásico <span class="badge">Retirado</span></h3>
  <p>Ya no se ofrece. La utilidad <code>.u-muted</code> (0,1,0) gana a <code>.card--featured</code> y a
    <code>.card:has(.badge)</code> (0,2,0) porque está en una capa posterior.</p>
</article>
```

# CSS

```css
/* Orden de las capas, declarado en la primera línea (lección 6) */
@layer base, components, utilities;

@layer base {
  :root {
    --hue: 260;
    --color-text: oklch(25% 0.03 var(--hue));
    --color-accent: oklch(50% 0.18 var(--hue));
    --color-muted: oklch(45% 0.03 var(--hue));
    --space: 1rem;
  }

  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);        /* se hereda en toda la página */
  }
}

@layer components {
  /* --card-accent es la «interfaz» del componente: las variantes solo cambian la variable */
  .card {
    --card-accent: var(--color-accent);
    border: 2px solid color-mix(in oklch, var(--card-accent) 30%, white);
    border-left-width: 6px;
    border-left-color: var(--card-accent);
    background: color-mix(in oklch, var(--card-accent) 5%, white);
    padding: 0 var(--space) var(--space);
    margin-block: var(--space);
  }

  .card--featured {
    --card-accent: oklch(48% 0.13 150);
  }

  /* :has(): la tarjeta que contiene una insignia se tiñe algo más (0,2,0) */
  .card:has(.badge) {
    background: color-mix(in oklch, var(--card-accent) 12%, white);
  }

  .card-title,
  .card-link {
    color: var(--card-accent);
  }

  .badge {
    background: var(--card-accent);
    color: #ffffff;
    padding: 0.1em 0.5em;
    font-size: 0.75em;               /* em: relativa al título que la contiene */
  }
}

@layer utilities {
  /* Una sola clase, (0,1,0), en la última capa: gana a todo lo de «components»,
     sea cual sea su especificidad. No hace falta !important. */
  .u-muted {
    --card-accent: var(--color-muted);
    background: oklch(97% 0.005 var(--hue));
  }
}
```
