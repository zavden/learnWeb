---
example_description: "Un panel de datos animado solo con CSS: tres anillos se llenan y su número sube de 0 al valor gracias a una custom property registrada como <integer> (conic-gradient y counter-reset la leen), y las barras de cosecha crecen con scale desde la izquierda, escalonadas. Un botón de «reproducir» cambia el nombre de las animaciones para repetirlas. Los datos están en el texto; con reducir movimiento, las barras solo se funden"
example_tags: "css|profesional|property|integer|counter|conic-gradient|keyframes|scale|datos|prefers-reduced-motion"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="dashboard">
  <header class="dashboard__head">
    <h1>Huerto en cifras · octubre</h1>
    <label class="replay"><input type="checkbox" id="replay"> ↻ Reproducir la animación</label>
  </header>

  <section aria-labelledby="gauges-title">
    <h2 id="gauges-title">Estado de hoy</h2>
    <ul class="gauges">
      <li class="gauge" style="--value: 62">
        <span class="gauge__ring" aria-hidden="true"></span>
        <span class="gauge__label">Humedad del suelo <strong class="visually-hidden">62 %</strong></span>
      </li>
      <li class="gauge is-warning" style="--value: 38">
        <span class="gauge__ring" aria-hidden="true"></span>
        <span class="gauge__label">Agua en el tanque <strong class="visually-hidden">38 %</strong> · rellenar pronto</span>
      </li>
      <li class="gauge" style="--value: 85">
        <span class="gauge__ring" aria-hidden="true"></span>
        <span class="gauge__label">Cosecha frente al objetivo <strong class="visually-hidden">85 %</strong></span>
      </li>
    </ul>
  </section>

  <section aria-labelledby="harvest-title">
    <h2 id="harvest-title">Cosecha por bancal (kg)</h2>
    <ul class="bars">
      <li style="--kg: 12; --i: 0"><span class="bars__name">Bancal 1 · tomate</span><span class="bars__track"><span class="bars__fill"></span></span><span class="bars__value">12 kg</span></li>
      <li style="--kg: 7; --i: 1"><span class="bars__name">Bancal 2 · rábano</span><span class="bars__track"><span class="bars__fill"></span></span><span class="bars__value">7 kg</span></li>
      <li style="--kg: 18; --i: 2"><span class="bars__name">Bancal 3 · calabaza</span><span class="bars__track"><span class="bars__fill"></span></span><span class="bars__value">18 kg</span></li>
      <li style="--kg: 4; --i: 3"><span class="bars__name">Bancal 4 · cilantro</span><span class="bars__track"><span class="bars__fill"></span></span><span class="bars__value">4 kg</span></li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Huerto en cifras
   - Los valores vienen del HTML (--value, --kg) y están escritos también
     como texto: los gráficos son aria-hidden o decoración de un texto que
     ya dice el dato.
   - Anillos: --value está registrada como <integer>. La animación va de 0 al
     valor del elemento (sin «to»: el final es su propio --value). Al ser un
     entero, pasa por 0, 1, 2… y lo leen a la vez el conic-gradient (el arco)
     y counter-reset (el número del centro).
   - Barras: miden siempre el 100 % de la pista y se escalan desde la
     izquierda hasta --kg / 20 (el máximo del eje), escalonadas con --i.
     El número va fuera de la barra para no aplastarse.
   - Repetir sin JavaScript: la casilla «Reproducir» cambia el NOMBRE de las
     animaciones (dos @keyframes iguales); un nombre nuevo es una animación
     nueva, que empieza de cero.
   - Movimiento reducido: --motion = 0. Las barras no crecen (empiezan ya en
     su escala final) y solo se funden; los anillos se rellenan igual (es color, no
     desplazamiento).
   ────────────────────────────────────────────────────────────────────────── */
@property --value {
  syntax: "<integer>";
  inherits: false;
  initial-value: 0;
}

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-good: #15803d;
  --color-warning: #b45309;
  --color-track: #e2e8f0;
  --color-surface: #ffffff;
  --color-focus: #1d4ed8;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --motion: 0;
}

@media (prefers-reduced-motion: no-preference) {
  :root {
    --motion: 1;
  }
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f8fafc;
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.4;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.dashboard {
  max-width: 44rem;
  margin-inline: auto;
  padding: 1rem;
}

.dashboard__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem 1rem;
}

.dashboard h1 {
  margin: 0;
  font-size: 1.3rem;
}

.dashboard h2 {
  margin: 1.25rem 0 0.5rem;
  font-size: 1rem;
}

.replay {
  padding: 0.35rem 0.8rem;
  border: 1px solid #64748b;
  border-radius: 999px;
  background: var(--color-surface);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.replay:has(:focus-visible) {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* ── Anillos ── */
.gauges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gauge {
  --color: var(--color-good);
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  background: var(--color-surface);
  text-align: center;
}

.gauge.is-warning {
  --color: var(--color-warning);
}

.gauge__ring {
  display: grid;
  place-items: center;
  width: 5.5rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle, var(--color-surface) 0 62%, transparent 63%),
    conic-gradient(var(--color) calc(var(--value) * 1%), var(--color-track) 0);
  counter-reset: value var(--value);
  animation: gauge-fill 1.2s var(--ease-out) both;
}

.gauge__ring::after {
  content: counter(value) "%";
  font-size: 1.2rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.gauge__label {
  font-size: 0.85rem;
}

@keyframes gauge-fill {
  from { --value: 0; }
}

@keyframes gauge-fill-again {
  from { --value: 0; }
}

/* ── Barras ── */
.bars {
  display: grid;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bars li {
  display: grid;
  grid-template-columns: 9.5rem 1fr 3rem;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.85rem;
}

.bars__track {
  height: 0.9rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-track);
}

.bars__fill {
  display: block;
  height: 100%;
  background: var(--color-good);
  transform-origin: left;
  scale: calc(var(--kg) / 20) 1;
  animation: bar-grow 0.8s var(--ease-out) calc(200ms + var(--i) * 90ms) both;
}

.bars__value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Sin «to»: el final es la escala del propio elemento (--kg / 20). El
   principio es 0 con movimiento y la misma escala final sin él (--motion =
   0): entonces la barra no crece y solo queda el fundido. */
@keyframes bar-grow {
  from {
    opacity: 0;
    scale: calc((1 - var(--motion)) * var(--kg) / 20) 1;
  }
}

@keyframes bar-grow-again {
  from {
    opacity: 0;
    scale: calc((1 - var(--motion)) * var(--kg) / 20) 1;
  }
}

/* Repetir: otro nombre = otra animación, que empieza desde el principio. */
body:has(#replay:checked) .gauge__ring {
  animation-name: gauge-fill-again;
}

body:has(#replay:checked) .bars__fill {
  animation-name: bar-grow-again;
}

@media (width < 30rem) {
  .bars li {
    grid-template-columns: 1fr 3rem;
  }

  .bars__name {
    grid-column: 1 / -1;
  }
}
```
