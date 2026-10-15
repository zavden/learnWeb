---
example_description: "Una infografía del riego del huerto: iconos de un sprite (symbol + use) con currentColor, tarjetas generadas desde un <template> y un gráfico SVG accesible con title y desc"
example_tags: "integracion|svg|sprite|symbol|use|currentcolor|template|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<!-- 1. El sprite: cada icono se define UNA vez como symbol, con su viewBox. No se dibuja. -->
<svg class="sprite" aria-hidden="true">
  <symbol id="icon-drop" viewBox="0 0 24 24">
    <path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2 Z" fill="currentColor"/>
  </symbol>
  <symbol id="icon-sun" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="5" fill="currentColor"/>
    <path d="M12 1 V4 M12 20 V23 M1 12 H4 M20 12 H23 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M4.2 19.8 L6.3 17.7 M17.7 6.3 L19.8 4.2" stroke="currentColor" stroke-width="2"/>
  </symbol>
  <symbol id="icon-leaf" viewBox="0 0 24 24">
    <path d="M4 20 C4 9 11 4 21 3 C20 13 15 20 4 20 Z M4 20 L13 11" fill="none" stroke="currentColor" stroke-width="2"/>
  </symbol>
</svg>

<h1>El riego del huerto en verano</h1>

<!-- 2. La plantilla de una tarjeta: el icono es decorativo (el texto lo dice todo) -->
<template id="stat-card">
  <li class="stat">
    <svg class="icon" aria-hidden="true"><use href="#icon-drop"/></svg>
    <strong class="value"></strong>
    <span class="label"></span>
  </li>
</template>
<ul id="stats" class="stats"></ul>

<!-- 3. El gráfico: informativo → role="img" + title + desc con los datos -->
<figure>
  <svg viewBox="0 0 300 130" width="300" height="130" role="img" aria-labelledby="chart-title" aria-describedby="chart-desc">
    <title id="chart-title">Litros de agua por mes</title>
    <desc id="chart-desc">Julio 1200 litros, agosto 1500 litros, septiembre 900 litros.</desc>
    <g fill="#0369a1">
      <rect x="20" y="40" width="70" height="60"/>
      <rect x="115" y="25" width="70" height="75"/>
      <rect x="210" y="55" width="70" height="45"/>
    </g>
    <g class="chart-text" text-anchor="middle">
      <text x="55" y="34">1200 l</text><text x="150" y="19">1500 l</text><text x="245" y="49">900 l</text>
      <text x="55" y="120">jul</text><text x="150" y="120">ago</text><text x="245" y="120">sep</text>
    </g>
  </svg>
  <figcaption>Agosto fue el mes de más riego: la ola de calor duró dos semanas.</figcaption>
</figure>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 42rem;
  padding: 0 1rem;
}

/* El sprite no ocupa sitio: solo guarda los moldes */
.sprite {
  display: none;
}

/* Tarjetas en fila (flexbox: capítulo de CSS) */
.stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0;
  list-style: none;
}

.stat {
  display: grid;
  justify-items: start;
  gap: 0.25rem;
  min-width: 9rem;
  padding: 0.75rem 1rem;
  border: 1px solid #64748b;
  border-radius: 8px;
}

/* currentColor: cada tarjeta decide el color de su icono con color */
.icon {
  width: 2rem;
  height: 2rem;
}

.stat.water { color: #0369a1; }
.stat.sun { color: #b45309; }
.stat.harvest { color: #15803d; }

.value {
  font-size: 1.4rem;
}

.chart-text {
  font-size: 12px;
  fill: #1e293b;
}

svg[role="img"] {
  max-width: 100%;
  height: auto;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Una copia de la plantilla por dato.
const stats = [
  { icon: 'icon-drop', value: '3600 l', label: 'de agua en tres meses', kind: 'water' },
  { icon: 'icon-sun', value: '14 días', label: 'por encima de 35 °C', kind: 'sun' },
  { icon: 'icon-leaf', value: '86 kg', label: 'de tomates recogidos', kind: 'harvest' },
];
const template = document.getElementById('stat-card');
const list = document.getElementById('stats');

for (const stat of stats) {
  const card = template.content.cloneNode(true);
  card.querySelector('.stat').classList.add(stat.kind);
  card.querySelector('use').setAttribute('href', `#${stat.icon}`); // cambia el molde del icono
  card.querySelector('.value').textContent = stat.value;
  card.querySelector('.label').textContent = stat.label;
  list.append(card);
}

console.log('tarjetas →', list.children.length, '· iconos usados →', [...list.querySelectorAll('use')].map((use) => use.getAttribute('href')).join(' '));
```
