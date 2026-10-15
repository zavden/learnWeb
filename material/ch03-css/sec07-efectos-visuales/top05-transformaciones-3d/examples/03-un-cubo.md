---
example_description: "Un cubo de seis caras con CSS: cada cara se gira hacia su lado y se adelanta 50px con translateZ; transform-style: preserve-3d mantiene las caras en el espacio del cubo para que el giro del conjunto se vea en 3D"
example_tags: "css|transformaciones-3d|preserve-3d|translateZ|rotateX|rotateY|cubo"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Un cubo de 100px. La escena tiene la perspectiva; el cubo, <code>preserve-3d</code> y su propio giro; cada cara, su sitio.</p>
<div class="stage">
  <figure class="scene">
    <div class="cube">
      <div class="face is-front">Frente</div>
      <div class="face is-back">Atrás</div>
      <div class="face is-right">Derecha</div>
      <div class="face is-left">Izquierda</div>
      <div class="face is-top">Arriba</div>
      <div class="face is-bottom">Abajo</div>
    </div>
    <figcaption><code>rotateX(-25deg) rotateY(-35deg)</code></figcaption>
  </figure>
  <figure class="scene">
    <div class="cube is-turned">
      <div class="face is-front">Frente</div>
      <div class="face is-back">Atrás</div>
      <div class="face is-right">Derecha</div>
      <div class="face is-left">Izquierda</div>
      <div class="face is-top">Arriba</div>
      <div class="face is-bottom">Abajo</div>
    </div>
    <figcaption><code>rotateX(30deg) rotateY(145deg)</code></figcaption>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.72rem;
}

.stage {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* La escena pone el ojo a 500px de la pantalla. */
.scene {
  display: grid;
  place-items: center;
  width: 200px;
  height: 200px;
  margin: 0;
  background: #0f172a;
  perspective: 500px;
}

.scene figcaption {
  grid-area: 1 / 1;                 /* en la misma celda que el cubo, abajo */
  align-self: end;
  padding-bottom: 6px;
  color: #e2e8f0;
  font-size: 0.7rem;
}

/* preserve-3d: las caras viven en el espacio 3D del cubo. Sin él, cada cara
   se aplastaría contra el plano del cubo antes de girarlo (ejemplo 05). */
.cube {
  position: relative;
  grid-area: 1 / 1;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  transform: rotateX(-25deg) rotateY(-35deg);
}

.cube.is-turned {
  transform: rotateX(30deg) rotateY(145deg);
}

.face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 2px solid #ffffff;
  color: #0f172a;
  font-weight: 700;
  font-size: 0.85rem;
}

/* Cada cara empieza en el plano de la pantalla, en el centro del cubo. Se
   gira para mirar hacia su lado y después AVANZA 50px por su eje z (la mitad
   del lado): rotate primero, translateZ después, porque el orden importa. */
.is-front  { background: #fbbf24; transform: translateZ(50px); }
.is-back   { background: #fda4af; transform: rotateY(180deg) translateZ(50px); }
.is-right  { background: #93c5fd; transform: rotateY(90deg) translateZ(50px); }
.is-left   { background: #86efac; transform: rotateY(-90deg) translateZ(50px); }
.is-top    { background: #c4b5fd; transform: rotateX(90deg) translateZ(50px); }
.is-bottom { background: #fdba74; transform: rotateX(-90deg) translateZ(50px); }
```
