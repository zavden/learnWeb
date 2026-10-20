---
example_description: "overflow: hidden (y también filter, opacity, clip-path, mask o isolation) en un elemento con preserve-3d lo obliga a ser plano: sus hijos se aplastan contra su plano antes de girarlo, y la caja de producto en 3D se convierte en una tarjeta inclinada"
example_tags: "css|transformaciones-3d|preserve-3d|overflow|aplanado|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">La misma caja de chocolate, con sus tres caras visibles. A la derecha, alguien ha añadido <code>overflow: hidden</code> a la caja «para recortar lo que sobresale».</p>
<div class="stage">
  <figure class="scene">
    <div class="box">
      <div class="face is-front">Chocolate<br>de Oaxaca</div>
      <div class="face is-right">70 % cacao</div>
      <div class="face is-top"></div>
    </div>
    <figcaption>✅ <code>preserve-3d</code></figcaption>
  </figure>
  <figure class="scene">
    <div class="box is-clipped">
      <div class="face is-front">Chocolate<br>de Oaxaca</div>
      <div class="face is-right">70 % cacao</div>
      <div class="face is-top"></div>
    </div>
    <figcaption>❌ <code>preserve-3d</code> + <code>overflow: hidden</code></figcaption>
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

.scene {
  display: grid;
  place-items: center;
  width: 200px;
  height: 190px;
  margin: 0;
  background: #fef3c7;
  perspective: 500px;
}

.scene figcaption {
  grid-area: 1 / 1;
  align-self: end;
  padding-bottom: 6px;
  font-size: 0.7rem;
}

.box {
  position: relative;
  grid-area: 1 / 1;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  transform: rotateX(-25deg) rotateY(-35deg);
}

.face {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 2px solid #451a03;
  font-family: Georgia, serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}

.is-front { background: #b45309; color: #ffffff; transform: translateZ(50px); }
.is-right { background: #92400e; color: #ffffff; transform: rotateY(90deg) translateZ(50px); }
.is-top   {
  background: repeating-linear-gradient(45deg, #78350f 0 6px, #92400e 6px 12px);
  transform: rotateX(90deg) translateZ(50px);
}

/* 🐛 Hay propiedades que necesitan pintar el elemento como un grupo plano
   (la especificación las llama «propiedades de agrupación»): overflow
   hidden, scroll o auto, opacity < 1, filter, clip-path, mask,
   mix-blend-mode e isolation: isolate. Con cualquiera de ellas, preserve-3d
   pasa a valer flat: los hijos se proyectan sobre el plano de la caja ANTES de
   girarla. La cara de la derecha y la de arriba, giradas 90°, quedan de canto
   (invisibles), y solo queda la de delante, como una tarjeta inclinada.
   Solución: esas propiedades en las CARAS (que no tienen hijos en 3D), nunca
   en el elemento con preserve-3d. */
.is-clipped {
  overflow: hidden;
}
```
