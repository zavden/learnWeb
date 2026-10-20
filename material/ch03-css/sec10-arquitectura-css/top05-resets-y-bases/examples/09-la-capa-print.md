---
example_description: "La capa print, la última de la lista: dentro, una @media print con la base de papel de cualquier página (tema claro, letra en puntos, sin navegación ni botones, la dirección de cada enlace, sin cortar un día del itinerario entre dos hojas y márgenes con @page). Gana a los componentes sin subir la especificidad. Se ve con ↗ y ⌘P"
example_tags: "css|arquitectura|print|layer|capas|page|estilos-base"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<header class="site-header">
  <p class="site-header__brand">Rutas por Oaxaca</p>
  <nav class="site-header__nav" aria-label="Principal"><a href="/rutas">Rutas</a> · <a href="/mapa">Mapa</a> · <a href="/contacto">Contacto</a></nav>
</header>
<main class="itinerary">
  <h1>Un sábado en la ciudad de Oaxaca</h1>
  <p class="itinerary__hint">Para llevarlo en papel: ↗ y <kbd>⌘</kbd> <kbd>P</kbd>.</p>
  <section class="day">
    <h2>Mañana</h2>
    <p>Desayuno en el <a href="/lugares/mercado-20-de-noviembre">mercado 20 de Noviembre</a> y paseo hasta el <a href="/lugares/santo-domingo">templo de Santo Domingo</a>.</p>
  </section>
  <section class="day">
    <h2>Tarde</h2>
    <p>Comida en el andador turístico y visita al <a href="/lugares/jardin-etnobotanico">Jardín Etnobotánico</a> (reserva antes).</p>
  </section>
  <div class="actions">
    <button class="button" type="button">Guardar ruta</button>
    <button class="button is-ghost" type="button">Compartir</button>
  </div>
</main>
```

# CSS

```css
/* print va la ÚLTIMA: sus reglas ganan a todo lo anterior sin necesitar
   selectores más pesados ni !important. */
@layer reset, tokens, base, components, print;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    color-scheme: light dark;
    --color-page: light-dark(#ffffff, #0f172a);
    --color-text: light-dark(#1e293b, #e2e8f0);
    --color-muted: light-dark(#475569, #94a3b8);
    --color-accent: light-dark(#9a3412, #fdba74);
    --color-surface: light-dark(#fff7ed, #1e293b);
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    color: var(--color-text);
    background: var(--color-page);
  }

  a {
    color: var(--color-accent);
  }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer components {
  .site-header {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--color-muted);
    font-size: 0.85rem;
  }

  .site-header__brand {
    font-weight: 700;
  }

  .itinerary {
    display: grid;
    gap: 12px;
    max-width: 34rem;
    padding: 16px;
  }

  .itinerary__hint {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .day {
    display: grid;
    gap: 4px;
    padding: 12px;
    border-radius: 10px;
    background: var(--color-surface);
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .button {
    padding: 6px 14px;
    border: 2px solid var(--color-accent);
    border-radius: 999px;
    background: var(--color-accent);
    color: var(--color-page);
    font-weight: 700;
    cursor: pointer;
  }

  .button.is-ghost {
    background: transparent;
    color: var(--color-accent);
  }
}

/* ── LA BASE DE PAPEL ──────────────────────────────────────────────────
   Lo que necesita cualquier página al imprimirse. Los componentes que
   quieran algo especial en papel añaden su propia @media print dentro de
   esta capa. */
@layer print {
  @media print {
    /* Márgenes de la HOJA. */
    @page {
      margin: 1.5cm;
    }

    /* Tinta negra sobre papel blanco, aunque la pantalla esté en oscuro:
       con color-scheme: light, light-dark() elige los valores claros. */
    :root {
      color-scheme: light;
    }

    body {
      color: #000000;
      background: #ffffff;
      font-family: Georgia, serif;
      font-size: 11pt;
    }

    /* Lo que en papel no sirve para nada. Gana al display: flex de
       .actions porque esta capa va después. */
    .site-header__nav,
    .itinerary__hint,
    .actions {
      display: none;
    }

    /* En papel no se puede hacer clic: escribe la dirección. */
    .itinerary a::after {
      content: " (rutasoaxaca.mx" attr(href) ")";
      font-size: 0.85em;
    }

    a {
      color: #000000;
    }

    /* El fondo crema no se imprime (ni hace falta): un borde fino. Y un día
       no se parte entre dos hojas; un título no se queda solo al pie. */
    .day {
      border: 0.5pt solid #000000;
      background: none;
      break-inside: avoid;
    }

    h1,
    h2 {
      break-after: avoid;
    }

    p {
      orphans: 3;
      widows: 3;
    }
  }
}
```
