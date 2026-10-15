---
example_description: "Los planes de socio de un museo sobre la pintura de Velasco: tarjetas de cristal con backdrop-filter (fondo calculado para el peor caso y @supports de reserva), el plan recomendado opaco con un borde degradado hecho con dos capas de fondo (padding-box y border-box) y una cinta recortada con clip-path"
example_tags: "css|profesional|backdrop-filter|supports|background-clip|degradados|clip-path|precios"
example_stage: professional
example_importance: important
---

# HTML

```html
<section class="pricing" aria-labelledby="pricing-title">
  <h1 id="pricing-title" class="pricing__title">Hazte amigo del museo</h1>
  <p class="pricing__lead">Entradas sin fila, visitas guiadas y descuentos en la tienda durante todo el año.</p>

  <ul class="plans">
    <li class="plan">
      <h2 class="plan__name">Estudiante</h2>
      <p class="plan__price"><strong>$150</strong> al año</p>
      <ul class="plan__perks">
        <li>Entrada sin fila</li>
        <li>Boletín mensual</li>
      </ul>
      <a class="plan__cta" href="/amigos/estudiante">Elegir Estudiante</a>
    </li>
    <li class="plan plan--featured">
      <p class="plan__ribbon">Recomendado</p>
      <h2 class="plan__name">Individual</h2>
      <p class="plan__price"><strong>$450</strong> al año</p>
      <ul class="plan__perks">
        <li>Entrada sin fila</li>
        <li>Dos visitas guiadas</li>
        <li>10&nbsp;% en la tienda</li>
      </ul>
      <a class="plan__cta" href="/amigos/individual">Elegir Individual</a>
    </li>
    <li class="plan">
      <h2 class="plan__name">Familiar</h2>
      <p class="plan__price"><strong>$900</strong> al año</p>
      <ul class="plan__perks">
        <li>Hasta 4 personas</li>
        <li>Talleres infantiles</li>
        <li>15&nbsp;% en la tienda</li>
      </ul>
      <a class="plan__cta" href="/amigos/familiar">Elegir Familiar</a>
    </li>
  </ul>
  <p class="pricing__credit">Fondo: José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Planes de socio
   - La sección: la pintura con un velo azul noche al 70 % encima (dos capas
     de fondo). El texto blanco tiene 6.6:1 incluso sobre un píxel blanco.
   - Tarjetas de cristal: blanco al 72 % + blur. Peor caso, un píxel negro
     detrás: el fondo queda en rgb(184 184 184) y el texto #0f172a tiene 9:1.
     Con @supports, si no hay backdrop-filter, el blanco sube al 95 %.
   - El plan recomendado es OPACO: así destaca entre los de cristal, y su
     borde degradado funciona. El truco: un borde transparente y dos capas de
     fondo, una blanca recortada a la caja del relleno (padding-box) y el
     degradado debajo, en toda la caja (border-box): solo asoma en el borde.
     (Con un relleno semitransparente, el degradado se vería a través.)
   - La cinta: un elemento recortado con un polígono con muesca.
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
    --color-muted: #334155;
    --color-accent: #be185d;
    --glass: rgb(255 255 255 / 0.72);
    --radius: 14px;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }

  a:focus-visible {
    outline: 3px solid #fde68a;
    outline-offset: 3px;
  }
}

@layer components {
  .pricing {
    display: grid;
    gap: 10px;
    padding: 24px 16px 14px;
    background:
      linear-gradient(rgb(15 23 42 / 0.7), rgb(15 23 42 / 0.7)),
      url("velasco-valle-de-mexico.jpg") center / cover;
    color: #ffffff;
  }

  .pricing__title {
    font-family: Georgia, serif;
    font-size: 1.8rem;
    line-height: 1.1;
    text-wrap: balance;
  }

  .pricing__lead {
    max-width: 40ch;
  }

  .plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 14px;
    max-width: 52rem;
    margin-top: 8px;
    padding: 0;
    list-style: none;
  }

  .plan {
    position: relative;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 8px;
    padding: 16px;
    border: 2px solid rgb(255 255 255 / 0.5);
    border-radius: var(--radius);
    background: var(--glass);
    backdrop-filter: blur(16px) saturate(1.2);
    color: var(--color-text);
  }

  @supports not (backdrop-filter: blur(1px)) {
    .plan {
      background: rgb(255 255 255 / 0.95);
    }
  }

  .plan--featured {
    border-color: transparent;
    background:
      linear-gradient(#ffffff, #ffffff) padding-box,
      linear-gradient(135deg, #f59e0b, var(--color-accent)) border-box;
    box-shadow: 0 10px 24px rgb(0 0 0 / 0.35);
  }

  .plan__ribbon {
    position: absolute;
    top: -12px;
    left: 12px;
    padding: 3px 18px 3px 10px;
    background: var(--color-accent);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%);
  }

  .plan__name {
    font-size: 1.1rem;
  }

  .plan__price {
    color: var(--color-muted);
  }

  .plan__price strong {
    color: var(--color-text);
    font-size: 1.7rem;
    font-variant-numeric: tabular-nums;
  }

  .plan__perks {
    padding-inline-start: 1.1em;
    font-size: 0.85rem;
  }

  .plan__cta {
    justify-self: start;
    padding: 8px 14px;
    border-radius: 999px;
    background: var(--color-text);
    color: #ffffff;
    font-size: 0.85rem;
    font-weight: 700;
    text-decoration: none;
  }

  .plan--featured .plan__cta {
    background: var(--color-accent);
  }

  /* Dentro de las tarjetas claras, el anillo de foco oscuro (más de 3:1). */
  .plan__cta:focus-visible {
    outline-color: var(--color-text);
  }

  .pricing__credit {
    font-size: 0.72rem;
  }
}
```
