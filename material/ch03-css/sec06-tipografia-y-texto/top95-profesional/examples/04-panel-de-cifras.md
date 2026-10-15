---
example_description: "El panel de cifras de una cadena de panaderías: indicadores grandes con cifras tabulares y caja recortada, variaciones con el signo menos tipográfico, rótulos en mayúsculas espaciadas, una lista de productos con nombres recortados y una tabla con las cifras alineadas al final"
example_tags: "css|profesional|tipografia|tabular-nums|text-box|text-overflow|panel|tablas"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="dashboard">
  <header class="dash-header">
    <h1>Resumen de octubre</h1>
    <p>Datos hasta el <time datetime="2026-10-13">13 de octubre</time> a las 9:00</p>
  </header>

  <ul class="kpis">
    <li class="kpi">
      <p class="kpi-label">Ingresos</p>
      <p class="kpi-value">$503,190</p>
      <p class="kpi-change is-up">+4.6&nbsp;% <span>frente a septiembre</span></p>
    </li>
    <li class="kpi">
      <p class="kpi-label">Piezas vendidas</p>
      <p class="kpi-value">33,546</p>
      <p class="kpi-change is-up">+2.9&nbsp;% <span>frente a septiembre</span></p>
    </li>
    <li class="kpi">
      <p class="kpi-label">Ticket medio</p>
      <p class="kpi-value">$118.40</p>
      <p class="kpi-change is-down">−1.2&nbsp;% <span>frente a septiembre</span></p>
    </li>
  </ul>

  <div class="panels">
    <section class="panel" aria-labelledby="top-title">
      <h2 id="top-title">Lo más vendido</h2>
      <ol class="top">
        <li><span class="top-row"><span class="top-name">Concha de vainilla</span><span class="top-count">4,812</span></span></li>
        <li><span class="top-row"><span class="top-name">Pan de muerto con azahar, pieza individual de 120&nbsp;g</span><span class="top-count">3,977</span></span></li>
        <li><span class="top-row"><span class="top-name">Bolillo</span><span class="top-count">3,140</span></span></li>
        <li><span class="top-row"><span class="top-name">Cuernito de mantequilla relleno de crema pastelera</span><span class="top-count">1,066</span></span></li>
      </ol>
    </section>

    <section class="panel" aria-labelledby="branches-title">
      <h2 id="branches-title">Por sucursal</h2>
      <table class="branches">
        <thead><tr><th scope="col">Sucursal</th><th scope="col">Ingresos</th><th scope="col">Var.</th></tr></thead>
        <tbody>
          <tr><th scope="row">Roma Norte</th><td>$187,200</td><td class="is-up">+8.4&nbsp;%</td></tr>
          <tr><th scope="row">Coyoacán</th><td>$136,726</td><td class="is-down">−2.1&nbsp;%</td></tr>
          <tr><th scope="row">Santa María</th><td>$105,915</td><td class="is-up">+11.0&nbsp;%</td></tr>
          <tr><th scope="row">Tlalpan</th><td>$73,350</td><td class="is-down">−0.7&nbsp;%</td></tr>
        </tbody>
      </table>
    </section>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de cifras
   - Todas las cifras con tabular-nums: los valores se comparan en vertical y,
     cuando se actualicen, no bailarán de ancho.
   - Indicadores: rótulo en mayúsculas pequeñas, valor grande con text-box
     (la caja va de la altura de las cifras a la línea base) y variación con
     el signo menos tipográfico (−, U+2212), del mismo ancho que el +.
   - La variación no depende solo del color: lleva su signo escrito.
   - Lista de productos: nombre y cifra en una fila flex; el nombre, elemento
     flex con min-width: 0, se recorta con «…» en una línea.
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
    --color-bg: #f1f5f9;
    --color-card: #ffffff;
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-up: #15803d;
    --color-down: #b91c1c;
  }
}

@layer base {
  body {
    padding: 16px;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    font-variant-numeric: tabular-nums;
    line-height: 1.45;
  }
}

@layer components {
  .dashboard {
    display: grid;
    gap: 16px;
    max-inline-size: 60rem;
    margin-inline: auto;
  }

  .dash-header h1 {
    font-size: 1.4rem;
  }

  .dash-header p {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  /* ─── Indicadores ─── */
  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
    gap: 12px;
    padding: 0;
    list-style: none;
  }

  .kpi {
    display: grid;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--color-card);
  }

  .kpi-label {
    color: var(--color-muted);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .kpi-value {
    font-size: 2rem;
    font-weight: 750;
    line-height: 1;
    letter-spacing: -0.02em;
    text-box: trim-both cap alphabetic;
  }

  .kpi-change {
    font-size: 0.85rem;
    font-weight: 700;
  }

  .kpi-change span {
    color: var(--color-muted);
    font-weight: 400;
  }

  .is-up   { color: var(--color-up); }
  .is-down { color: var(--color-down); }

  /* ─── Paneles ─── */
  .panels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    gap: 12px;
  }

  .panel {
    padding: 14px 16px;
    border-radius: 12px;
    background: var(--color-card);
  }

  .panel h2 {
    margin-block-end: 8px;
    font-size: 1rem;
  }

  /* Lista: el li sigue siendo list-item (conserva su número, ::marker) y
     dentro lleva una fila flex con el nombre y la cifra. */
  .top {
    display: grid;
    gap: 6px;
    padding-inline-start: 1.4em;
    font-size: 0.9rem;
  }

  .top li::marker {
    color: var(--color-muted);
  }

  .top-row {
    display: flex;
    gap: 8px;
  }

  /* El nombre es un elemento flex: sin min-width: 0 no bajaría del ancho de su
     frase entera (nowrap) y no habría nada que recortar. */
  .top-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .top-count {
    flex: none;
    font-weight: 700;
  }

  /* ─── Tabla ─── */
  .branches {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .branches th,
  .branches td {
    padding: 4px 6px;
    border-block-end: 1px solid var(--color-line);
    text-align: end;
  }

  .branches thead th {
    color: var(--color-muted);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .branches th:first-child {
    font-weight: 400;
    text-align: start;
  }

  .branches thead th:first-child {
    font-weight: 600;
  }
}
```
