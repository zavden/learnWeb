---
example_description: "Con shape-outside: circle() el texto rodea la forma redonda de un flotante en lugar de su caja rectangular"
example_tags: "css|float|shape-outside|texto"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="label">❌ Solo <code>border-radius</code>: el texto rodea la CAJA cuadrada (fíjate en las esquinas vacías)</p>
<div class="interview">
  <img class="portrait" src="avatar.svg" alt="Retrato de Marta Ibáñez" width="120" height="120">
  <p>Marta Ibáñez lleva veinte años modelando barro en un taller de Talavera. «Empecé reparando platos rotos de mi abuela», cuenta mientras centra una pieza en el torno. Hoy enseña a cuarenta alumnos por trimestre y sus cuencos se venden en tres continentes.</p>
</div>

<p class="label">✅ Con <code>shape-outside: circle(50%)</code>: el texto sigue la curva</p>
<div class="interview">
  <img class="portrait is-shaped" src="avatar.svg" alt="Retrato de Marta Ibáñez" width="120" height="120">
  <p>Marta Ibáñez lleva veinte años modelando barro en un taller de Talavera. «Empecé reparando platos rotos de mi abuela», cuenta mientras centra una pieza en el torno. Hoy enseña a cuarenta alumnos por trimestre y sus cuencos se venden en tres continentes.</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.interview {
  display: flow-root;
  max-width: 440px;
}

.interview p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* border-radius solo cambia cómo se PINTA la imagen. Para el texto, el flotante
   sigue siendo un rectángulo de 96 × 96 px (más su margen). */
.portrait {
  float: left;
  width: 96px;
  height: 96px;
  margin-right: 12px;
  border-radius: 50%;
}

/* shape-outside define la forma que rodea el texto. Solo funciona en flotantes.
   circle(50%) es el círculo inscrito en la caja del flotante, contando su margen: el texto
   entra en las esquinas y sigue la curva. shape-margin añadiría aire alrededor de la forma
   (sin salir nunca de esa caja).
   Hay más formas (ellipse(), polygon()…): las verás con clip-path en el módulo de efectos visuales. */
.is-shaped {
  shape-outside: circle(50%);
}
```
