---
example_description: "minmax(mín, máx) da a una pista un intervalo: con sitio llega al máximo, sin sitio no baja del mínimo aunque se salga; y las pistas con máximo fijo crecen antes de que fr reparta"
example_tags: "css|grid|minmax|fr|desbordamiento"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption"><code>repeat(3, minmax(100px, 1fr))</code> con <code>gap: 20px</code> en 400: (400 − 40) ÷ 3 = <strong>120</strong>, más que el mínimo</p>
<div class="grid is-three">
  <div>120</div><div>120</div><div>120</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">Lo mismo en un contenedor de <strong>280</strong>: (280 − 40) ÷ 3 = 80 no llega a 100 → cada una <strong>100</strong>, y la rejilla (340) se sale</p>
<div class="grid is-three is-narrow">
  <div>100</div><div>100</div><div>100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>minmax(100px, 200px) 1fr</code>: la primera llega a su máximo (<strong>200</strong>) y la fr se queda con el resto (<strong>200</strong>)</p>
<div class="grid is-sidebar">
  <div class="capped">minmax · 200</div><div>1fr · 200</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.grid {
  display: grid;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.ruler {
  display: block;
  margin-top: 3px;
}

.grid > div {
  padding: 4px 0;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.grid > .capped {
  border-color: #b45309;
  background: #fef3c7;
}

/* minmax(mínimo, máximo): la pista mide lo que le toque, pero nunca menos que el
   mínimo ni más que el máximo. Con 1fr de máximo: «reparte, pero no bajes de 100». */
.is-three {
  grid-template-columns: repeat(3, minmax(100px, 1fr));
  gap: 20px;
}

/* El mínimo manda aunque no quepa: tres de 100 + dos gaps = 340 en un contenedor
   de 280. Las pistas se salen por la derecha. (La próxima vez que veas esto,
   piensa en auto-fill: cambia el NÚMERO de columnas para que quepan.) */
.is-narrow {
  width: 280px;
}

/* Orden del reparto: primero, cada pista llega a su máximo si hay sitio
   (minmax(100px, 200px) → 200); DESPUÉS, las fr se reparten lo que quede
   (400 − 200 = 200). fr nunca le quita sitio a una pista que puede crecer. */
.is-sidebar {
  grid-template-columns: minmax(100px, 200px) 1fr;
}
```
