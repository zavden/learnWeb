---
example_description: "Cuatro columnas de 25% con gap se salen del contenedor (4 × 100 + 3 × 16 = 448 en 400); con 1fr el gap se descuenta antes de repartir y caben"
example_tags: "css|grid|porcentajes|fr|gap|desbordamiento|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>25% 25% 25% 25%</code> + <code>gap: 16px</code>: 4 × 100 + 3 × 16 = <strong>448</strong> → la última columna se sale 48px</p>
<div class="grid is-percent">
  <div>25% · 100</div><div>25% · 100</div><div>25% · 100</div><div>25% · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption">✅ <code>1fr 1fr 1fr 1fr</code> + <code>gap: 16px</code>: (400 − 48) ÷ 4 = <strong>88</strong> cada una</p>
<div class="grid is-fr">
  <div>1fr · 88</div><div>1fr · 88</div><div>1fr · 88</div><div>1fr · 88</div>
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
  gap: 16px;
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

/* 🐛 Un porcentaje se calcula sobre el ancho del contenedor (400 → 25% = 100)
   sin mirar el gap. Cuatro cuartos ya suman el 100 %, y los tres gaps se añaden
   encima: la rejilla mide 448 y se sale por la derecha (el contenedor no crece;
   las pistas sobresalen, como cualquier desbordamiento). */
.is-percent {
  grid-template-columns: 25% 25% 25% 25%;
}

/* ✅ fr reparte el espacio LIBRE, que ya descuenta los gaps: siempre cabe.
   (El arreglo antiguo era calc((100% - 3 * 16px) / 4) en cada columna.) */
.is-fr {
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
```
