---
example_description: "La carta de una fonda poblana: el platillo del día con texto sobre la foto, secciones en columnas auto-fit y cada platillo como una rejilla de tres columnas (nombre, línea de puntos y precio) alineada por la última línea del nombre"
example_tags: "css|profesional|grid|minmax|baseline|auto-fit|capas|menu|restaurante"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="menu-header">
  <h1>Fonda Doña Lupe</h1>
  <p>Cocina poblana desde 1987 · 5 de Mayo 214, Centro, Puebla</p>
</header>

<main class="menu">
  <article class="special" aria-labelledby="special-title">
    <div class="special-photo" role="img" aria-label="Enchiladas verdes con crema, queso y cebolla en un plato blanco"></div>
    <div class="special-text">
      <p class="special-kicker">Platillo del día</p>
      <h2 id="special-title">Enchiladas verdes de pollo</h2>
      <p>Con arroz rojo y frijoles de la olla · <strong>145 MXN</strong></p>
    </div>
  </article>

  <div class="sections">
    <section class="menu-section" aria-labelledby="breakfast-title">
      <h2 id="breakfast-title">Desayunos</h2>
      <ul class="dishes">
        <li class="dish">
          <h3>Chilaquiles verdes <abbr title="vegetariano">V</abbr></h3>
          <span class="leader"></span>
          <p class="dish-price">95 MXN</p>
          <p class="dish-desc">Con crema, queso fresco y frijoles; con huevo o pollo, +20.</p>
        </li>
        <li class="dish">
          <h3>Molletes</h3>
          <span class="leader"></span>
          <p class="dish-price">70 MXN</p>
          <p class="dish-desc">Bolillo, frijoles, queso gratinado y pico de gallo.</p>
        </li>
        <li class="dish">
          <h3>Huevos al gusto con salsa de molcajete</h3>
          <span class="leader"></span>
          <p class="dish-price">85 MXN</p>
          <p class="dish-desc">Revueltos, estrellados o a la mexicana.</p>
        </li>
      </ul>
    </section>

    <section class="menu-section" aria-labelledby="mains-title">
      <h2 id="mains-title">Platos fuertes</h2>
      <ul class="dishes">
        <li class="dish">
          <h3>Mole poblano</h3>
          <span class="leader"></span>
          <p class="dish-price">185 MXN</p>
          <p class="dish-desc">Pierna de pollo, ajonjolí tostado y arroz.</p>
        </li>
        <li class="dish">
          <h3>Chiles en nogada <abbr title="de temporada">T</abbr></h3>
          <span class="leader"></span>
          <p class="dish-price">260 MXN</p>
          <p class="dish-desc">Hasta finales de septiembre, mientras haya granada.</p>
        </li>
        <li class="dish">
          <h3>Tinga de pollo</h3>
          <span class="leader"></span>
          <p class="dish-price">140 MXN</p>
          <p class="dish-desc">Tres tostadas con frijoles, crema y aguacate.</p>
        </li>
      </ul>
    </section>

    <section class="menu-section" aria-labelledby="drinks-title">
      <h2 id="drinks-title">Bebidas</h2>
      <ul class="dishes">
        <li class="dish">
          <h3>Café de olla</h3>
          <span class="leader"></span>
          <p class="dish-price">35 MXN</p>
        </li>
        <li class="dish">
          <h3>Agua de jamaica</h3>
          <span class="leader"></span>
          <p class="dish-price">30 MXN</p>
        </li>
        <li class="dish">
          <h3>Chocolate caliente <abbr title="vegetariano">V</abbr></h3>
          <span class="leader"></span>
          <p class="dish-price">45 MXN</p>
        </li>
      </ul>
    </section>
  </div>

  <footer class="menu-footer">
    <p><abbr title="vegetariano">V</abbr> vegetariano · <abbr title="de temporada">T</abbr> de temporada · Precios con IVA incluido.</p>
    <dl class="hours">
      <dt>Lunes a viernes</dt><dd>8:00 a 18:00</dd>
      <dt>Sábado y domingo</dt><dd>9:00 a 17:00</dd>
    </dl>
  </footer>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Carta de restaurante
   - Platillo del día: foto y texto en la misma celda (capas grid).
   - Secciones: columnas auto-fit de al menos 16rem (con min()).
   - Cada platillo es una rejilla de tres columnas: nombre (minmax(0,
     max-content): a su medida, pero puede partirse), puntos (1fr, al menos
     1.5rem) y precio (auto). Los puntos empiezan justo donde acaba cada nombre
     y todos los precios terminan en el borde derecho. La descripción va en una
     segunda fila, a todo el ancho (1 / -1).
     (Aquí NO conviene subgrid: compartir la columna del nombre haría que los
     puntos empezaran todos donde acaba el nombre más largo.)
   - align-items: last baseline: los puntos y el precio se apoyan en la ÚLTIMA
     línea del nombre, como en las cartas impresas. Los puntos son el borde de
     un span vacío, cuya línea base es su borde inferior.
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
    --color-text: #292524;
    --color-muted: #57534e;
    --color-paper: #fffbeb;
    --color-accent: #9a3412;
    --color-line: #d6d3d1;
    --color-focus: #1d4ed8;
    --font-serif: Georgia, "Times New Roman", serif;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
  }
}

@layer base {
  body {
    background: var(--color-paper);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  abbr {
    text-decoration: none;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .menu-header {
    padding: var(--space-6) var(--space-4) var(--space-4);
    text-align: center;
  }

  .menu-header h1 {
    color: var(--color-accent);
    font-family: var(--font-serif);
    font-size: clamp(1.8rem, 1.2rem + 3vw, 3rem);
  }

  .menu-header p {
    color: var(--color-muted);
    font-size: 0.9rem;
  }

  .menu {
    display: grid;
    gap: var(--space-6);
    max-width: 60rem;
    margin-inline: auto;
    padding: 0 var(--space-4) var(--space-6);
  }

  /* ─── Platillo del día ─── */
  .special {
    display: grid;
    min-height: 12rem;
    overflow: hidden;
    border-radius: 12px;
  }

  .special > * {
    grid-area: 1 / 1;
  }

  .special-photo {
    background: #7c2d12 url(dish-enchiladas.svg) center / cover;
  }

  .special-text {
    justify-self: start;
    align-self: end;
    max-width: 24rem;
    margin: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: 8px;
    background: rgb(255 251 235 / 0.94);
  }

  .special-kicker {
    color: var(--color-accent);
    font-size: 0.8rem;
    font-weight: 700;
  }

  .special-text h2 {
    font-family: var(--font-serif);
    font-size: 1.3rem;
  }

  /* ─── Secciones ─── */
  .sections {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: var(--space-6) var(--space-6);
  }

  /* Título con una raya que llena el resto de la línea (flexbox). */
  .menu-section h2 {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
    color: var(--color-accent);
    font-family: var(--font-serif);
    font-size: 1.3rem;
  }

  .menu-section h2::after {
    content: "";
    flex: 1;
    border-top: 2px solid var(--color-accent);
  }

  /* ─── Platillos: nombre, puntos y precio ─── */
  .dishes {
    display: grid;
    gap: var(--space-3);
    padding: 0;
    list-style: none;
  }

  .dish {
    display: grid;
    grid-template-columns: minmax(0, max-content) minmax(1.5rem, 1fr) auto;
    align-items: last baseline;
    column-gap: var(--space-2);
  }

  .dish h3 {
    font-family: var(--font-serif);
    font-size: 1rem;
    line-height: 1.25;
  }

  .dish abbr {
    padding: 0 var(--space-1);
    border: 1px solid var(--color-accent);
    border-radius: 4px;
    color: var(--color-accent);
    font-family: system-ui, sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
  }

  .leader {
    border-bottom: 2px dotted var(--color-muted);
  }

  .dish-price {
    font-weight: 700;
  }

  .dish-desc {
    grid-column: 1 / -1;
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  /* ─── Pie: leyenda y horario ─── */
  .menu-footer {
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-line);
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .hours {
    display: grid;
    grid-template-columns: max-content max-content;
    gap: var(--space-1) var(--space-4);
    margin-top: var(--space-2);
  }

  .hours dt {
    font-weight: 700;
  }

  .hours dd {
    margin: 0;
  }
}
```
