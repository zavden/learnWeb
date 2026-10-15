---
example_description: "Un panel de indicadores de un museo: medidores semicirculares hechos con un conic-gradient (el valor en una custom property) y una máscara radial que los convierte en arco, barras horizontales con paradas duras, y todos los valores en texto, con el estado dicho en palabras y no solo en color"
example_tags: "css|profesional|conic-gradient|mask-image|custom-properties|panel|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="dashboard">
  <header class="dashboard__header">
    <h1>Panel del museo</h1>
    <p>Semana del 3 al 9 de noviembre</p>
  </header>

  <section class="kpis" aria-label="Indicadores de la semana">
    <article class="kpi" style="--value: 72">
      <h2 class="kpi__title">Ocupación de las salas</h2>
      <div class="kpi__gauge" aria-hidden="true"></div>
      <p class="kpi__value">72&nbsp;%</p>
      <p class="kpi__status is-ok">En objetivo (meta: 70&nbsp;%)</p>
    </article>
    <article class="kpi" style="--value: 48; --fill: #b45309">
      <h2 class="kpi__title">Entradas vendidas en línea</h2>
      <div class="kpi__gauge" aria-hidden="true"></div>
      <p class="kpi__value">48&nbsp;%</p>
      <p class="kpi__status is-warn">Por debajo de la meta (60&nbsp;%)</p>
    </article>
    <article class="kpi" style="--value: 91">
      <h2 class="kpi__title">Visitantes satisfechos</h2>
      <div class="kpi__gauge" aria-hidden="true"></div>
      <p class="kpi__value">91&nbsp;%</p>
      <p class="kpi__status is-ok">En objetivo (meta: 85&nbsp;%)</p>
    </article>
  </section>

  <section class="daily" aria-labelledby="daily-title">
    <h2 id="daily-title">Visitantes por día</h2>
    <ul class="bars">
      <li style="--value: 46"><span class="bars__day">Mar</span><span class="bars__track" aria-hidden="true"></span><span class="bars__num">412</span></li>
      <li style="--value: 52"><span class="bars__day">Mié</span><span class="bars__track" aria-hidden="true"></span><span class="bars__num">468</span></li>
      <li style="--value: 61"><span class="bars__day">Jue</span><span class="bars__track" aria-hidden="true"></span><span class="bars__num">549</span></li>
      <li style="--value: 74"><span class="bars__day">Vie</span><span class="bars__track" aria-hidden="true"></span><span class="bars__num">666</span></li>
      <li style="--value: 100"><span class="bars__day">Sáb</span><span class="bars__track" aria-hidden="true"></span><span class="bars__num">900</span></li>
      <li style="--value: 93"><span class="bars__day">Dom</span><span class="bars__track" aria-hidden="true"></span><span class="bars__num">837</span></li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de indicadores
   - Cada indicador recibe su valor (0-100) en --value desde el HTML; el CSS
     lo convierte en grados (× 1.8deg: media vuelta) o en porcentaje.
   - Medidor: una caja 2:1 con las esquinas de arriba redondeadas (un
     semicírculo). conic-gradient desde -90deg (la izquierda) y con el centro
     abajo en medio: el color llena el arco hasta el valor y el gris, el
     resto. Una máscara radial (farthest-side, desde el mismo centro) quita el
     60 % interior: queda un arco.
   - El valor y el estado van en texto; el medidor es aria-hidden. El estado
     se dice en palabras (y con un símbolo), no solo con el color.
   - Barras: una pista con un degradado con parada dura en --value %.
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
    --color-track: #e2e8f0;
    --color-ok: #15803d;
    --color-warn: #b45309;
    --color-fill: #1d4ed8;
    --radius: 12px;
  }
}

@layer base {
  body {
    padding: 16px;
    background: #f8fafc;
    color: var(--color-text);
    font-family: system-ui, sans-serif;
    line-height: 1.4;
  }
}

@layer components {
  .dashboard {
    display: grid;
    gap: 18px;
    max-width: 56rem;
  }

  .dashboard__header h1 {
    font-size: 1.4rem;
  }

  .dashboard__header p {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    gap: 12px;
  }

  .kpi {
    --fill: var(--color-fill);
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: 14px;
    border-radius: var(--radius);
    background: #ffffff;
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.12);
    text-align: center;
  }

  .kpi__title {
    min-height: 2.6em;
    font-size: 0.9rem;
    text-wrap: balance;
  }

  .kpi__gauge {
    width: 140px;
    aspect-ratio: 2 / 1;
    margin-top: 6px;
    border-radius: 999px 999px 0 0;
    background: conic-gradient(
      from -90deg at 50% 100%,
      var(--fill) 0 calc(var(--value) * 1.8deg),
      var(--color-track) 0 180deg,
      transparent 0
    );
    mask-image: radial-gradient(circle farthest-side at 50% 100%, transparent 60%, black 60.5%);
  }

  /* El número sube y se mete en el hueco del arco. */
  .kpi__value {
    margin-top: -34px;
    font-size: 1.6rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  .kpi__status {
    font-size: 0.8rem;
    font-weight: 600;
  }

  .kpi__status.is-ok   { color: var(--color-ok); }
  .kpi__status.is-warn { color: var(--color-warn); }

  .kpi__status.is-ok::before   { content: "✔ " / ""; }
  .kpi__status.is-warn::before { content: "▲ " / ""; }

  .daily {
    padding: 14px;
    border-radius: var(--radius);
    background: #ffffff;
    box-shadow: 0 1px 3px rgb(15 23 42 / 0.12);
  }

  .daily h2 {
    margin-bottom: 8px;
    font-size: 1rem;
  }

  .bars {
    display: grid;
    gap: 6px;
    padding: 0;
    list-style: none;
    font-size: 0.85rem;
  }

  .bars li {
    display: grid;
    grid-template-columns: 2.5rem 1fr 3rem;
    gap: 8px;
    align-items: center;
  }

  .bars__track {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(to right, var(--color-fill) calc(var(--value) * 1%), var(--color-track) 0);
  }

  .bars__num {
    font-variant-numeric: tabular-nums;
    text-align: end;
  }
}
```
