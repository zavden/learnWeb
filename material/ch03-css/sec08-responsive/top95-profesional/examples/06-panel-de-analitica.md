---
example_description: "El panel de visitas de un museo: menú lateral que pasa a barra superior en pantallas estrechas (media query), widgets en una rejilla auto-fit, cada uno contenedor con nombre que decide su propio layout, cifras en cqi, un medidor de aforo en un contenedor de tipo size medido con cqmin y tema claro u oscuro con light-dark()"
example_tags: "css|profesional|responsive|container-queries|container-name|cqi|cqmin|light-dark|dashboard"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="app">
  <nav class="app__nav" aria-label="Panel">
    <p class="app__brand">MUNAL · Panel</p>
    <ul>
      <li><a href="/panel" aria-current="page">Hoy</a></li>
      <li><a href="/panel/semana">Semana</a></li>
      <li><a href="/panel/taquilla">Taquilla</a></li>
      <li><a href="/panel/salas">Salas</a></li>
    </ul>
  </nav>

  <main class="app__main">
    <h1>Visitas de hoy</h1>
    <div class="widgets">
      <section class="widget" aria-labelledby="w-visits">
        <h2 id="w-visits">Visitantes</h2>
        <p class="kpi">2&nbsp;184</p>
        <p class="delta is-up">▲ 9 % frente al miércoles pasado</p>
      </section>

      <section class="widget" aria-labelledby="w-online">
        <h2 id="w-online">Entradas en línea</h2>
        <p class="kpi">61 %</p>
        <p class="delta is-down">▼ 3 puntos</p>
      </section>

      <section class="widget widget--gauge" aria-labelledby="w-capacity">
        <h2 id="w-capacity">Aforo ahora</h2>
        <div class="gauge" style="--value: 72">
          <div class="gauge__ring" aria-hidden="true"></div>
          <p class="gauge__label"><strong>72 %</strong> de 900 personas</p>
        </div>
      </section>

      <section class="widget widget--wide" aria-labelledby="w-rooms">
        <h2 id="w-rooms">Salas más visitadas</h2>
        <ol class="ranking">
          <li style="--share: 100%"><span class="ranking__name">Velasco y el Valle de México</span> <span class="ranking__value">812</span></li>
          <li style="--share: 74%"><span class="ranking__name">Arte novohispano</span> <span class="ranking__value">601</span></li>
          <li style="--share: 52%"><span class="ranking__name">Escultura del siglo XIX</span> <span class="ranking__value">423</span></li>
          <li style="--share: 31%"><span class="ranking__name">Gráfica popular</span> <span class="ranking__value">252</span></li>
        </ol>
      </section>
    </div>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de visitas
   - Esqueleto (media query, lección 1): por debajo de 56rem, el menú es una
     barra arriba; desde 56rem, una columna a la izquierda.
   - Widgets: rejilla auto-fit sin consultas (columnas de 12rem como mínimo).
     El área principal es un contenedor (main): desde 25rem, el ranking ocupa
     dos columnas. Cada widget es otro contenedor (widget): sus cifras crecen
     con cqi y el ranking pone el número al lado de la barra desde 18rem.
   - Medidor: su caja es un contenedor de tipo SIZE con alto fijo (10rem),
     así que tiene ancho y alto definidos y el anillo se mide con cqmin (el
     lado menor): siempre redondo y siempre cabe. Un conic-gradient con
     parada dura en --value y una máscara radial que quita el centro.
   - Tema: light-dark() en todos los tokens. Los datos están en el texto; los
     dibujos llevan aria-hidden.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
}

@layer tokens {
  :root {
    color-scheme: light dark;
    --color-page: light-dark(#f1f5f9, #0b1120);
    --color-card: light-dark(#ffffff, #1e293b);
    --color-text: light-dark(#0f172a, #e2e8f0);
    --color-muted: light-dark(#475569, #94a3b8);
    --color-accent: light-dark(#4338ca, #a5b4fc);
    --color-track: light-dark(#e2e8f0, #334155);
    --color-up: light-dark(#15803d, #86efac);
    --color-down: light-dark(#b91c1c, #fca5a5);
    --radius: 12px;
  }
}

@layer base {
  body { background: var(--color-page); color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.4; }
  a { color: inherit; }
  :focus-visible { outline: 3px solid var(--color-accent); outline-offset: 2px; }
  h1 { font-size: 1.3rem; }
  h2 { color: var(--color-muted); font-size: 0.8rem; font-weight: 600; }
}

@layer components {
  .app__nav { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; padding: 10px 16px; background: var(--color-card); }
  .app__brand { font-weight: 700; }
  .app__nav ul { display: flex; flex-wrap: wrap; gap: 4px; padding: 0; list-style: none; }
  .app__nav a { display: block; padding: 6px 10px; border-radius: 8px; text-decoration: none; }
  .app__nav a[aria-current="page"] { background: var(--color-accent); color: var(--color-card); font-weight: 700; }

  .widgets {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  .widget {
    container: widget / inline-size;
    padding: 12px;
    border-radius: var(--radius);
    background: var(--color-card);
  }

  .kpi { font-size: clamp(1.75rem, 1rem + 10cqi, 3rem); font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .delta { font-size: 0.8rem; }
  .delta.is-up { color: var(--color-up); }
  .delta.is-down { color: var(--color-down); }

  /* El medidor: un contenedor de tipo size, con su alto fijado. */
  .gauge {
    container-type: size;
    block-size: 10rem;
    display: grid;
    place-items: center;
  }

  .gauge__ring,
  .gauge__label { grid-area: 1 / 1; }

  .gauge__ring {
    width: 90cqmin;
    aspect-ratio: 1;
    border-radius: 50%;
    background: conic-gradient(var(--color-accent) calc(var(--value) * 1%), var(--color-track) 0);
    mask-image: radial-gradient(farthest-side, transparent 72%, #000000 73%);
  }

  .gauge__label { max-width: 55cqmin; font-size: 0.75rem; text-align: center; }
  .gauge__label strong { display: block; font-size: 18cqmin; line-height: 1; }

  .ranking { display: grid; gap: 8px; padding: 0; list-style: none; font-size: 0.85rem; }
  .ranking li { display: grid; gap: 2px; }

  /* La barra es un pseudoelemento; su largo, --share. Decorativa: el número
     está en el texto. */
  .ranking li::after {
    content: "";
    width: var(--share);
    height: 8px;
    border-radius: 4px;
    background: var(--color-accent);
  }

  .ranking__value { font-weight: 700; font-variant-numeric: tabular-nums; }

  /* En un widget ancho: nombre y número en una fila, la barra debajo. */
  @container widget (width >= 18rem) {
    .ranking li { grid-template-columns: 1fr auto; }
    .ranking li::after { grid-column: 1 / -1; }
  }
}

@layer layout {
  .app__main { container: main / inline-size; padding: 16px; }

  /* El área principal decide cuánto ocupa el ranking. 25rem (400px)
     asegura dos columnas de 12rem más el hueco (2 × 192 + 12 = 396px) antes
     de pedir span 2: con una sola, crearía una columna implícita. */
  @container main (width >= 25rem) {
    .widget--wide { grid-column: span 2; }
  }

  @media (width >= 56rem) {
    .app { display: grid; grid-template-columns: 13rem minmax(0, 1fr); min-height: 100dvh; }
    .app__nav { flex-direction: column; align-items: stretch; }
    .app__nav ul { flex-direction: column; }
  }
}
```
