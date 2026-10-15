---
example_description: "Dentro de un contexto 3D (preserve-3d), el orden de pintado lo decide la profundidad, no el z-index: la tarjeta con z-index: 10 pero más lejos queda detrás, y dos planos que se cruzan se cortan de verdad. En un contenedor plano, manda el z-index y el orden del HTML"
example_tags: "css|transformaciones-3d|preserve-3d|z-index|translateZ|profundidad"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Dos tarjetas que se solapan: la ámbar tiene <code>z-index: 10</code> pero está 80px más lejos (<code>translateZ(-80px)</code>); la azul, <code>z-index: 1</code> y en el plano de la pantalla.</p>
<div class="grid">
  <figure class="scene">
    <div class="space">
      <div class="card is-far">z-index: 10<br>lejos</div>
      <div class="card is-near">z-index: 1<br>cerca</div>
    </div>
    <figcaption>Contenedor plano: la ámbar se ve lejos (más pequeña)… y encima, por su <code>z-index</code></figcaption>
  </figure>
  <figure class="scene">
    <div class="space is-3d">
      <div class="card is-far">z-index: 10<br>lejos</div>
      <div class="card is-near">z-index: 1<br>cerca</div>
    </div>
    <figcaption><code>preserve-3d</code>: gana la que está más cerca</figcaption>
  </figure>
</div>

<p class="caption">Dos planos que se cruzan en el centro, girados ±40° en Y</p>
<div class="grid">
  <figure class="scene">
    <div class="space">
      <div class="plane is-a"></div>
      <div class="plane is-b"></div>
    </div>
    <figcaption>Plano: el azul (después en el HTML) tapa al ámbar en toda la zona común</figcaption>
  </figure>
  <figure class="scene">
    <div class="space is-3d">
      <div class="plane is-a"></div>
      <div class="plane is-b"></div>
    </div>
    <figcaption><code>preserve-3d</code>: se atraviesan como una X</figcaption>
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
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 12px;
}

.scene {
  margin: 0;
  padding-bottom: 6px;
  background: #e2e8f0;
}

.scene figcaption {
  margin: 4px 6px 0;
  font-size: 0.7rem;
}

/* La perspectiva va en el contenedor de las tarjetas en los dos casos: la
   ámbar siempre se ve más pequeña, porque está más lejos.
   El contenedor NO tiene fondo (el gris es de la figura): con preserve-3d, su
   fondo sería un plano más en z = 0, y taparía todo lo que está detrás,
   como la tarjeta ámbar. */
.space {
  position: relative;
  height: 140px;
  perspective: 500px;
}

/* ✅ preserve-3d: los hijos comparten un mismo espacio 3D. El navegador los
   ordena por su profundidad (z) y, si se cruzan, los corta por la línea de
   intersección. El z-index solo desempata entre planos a la misma distancia. */
.space.is-3d {
  transform-style: preserve-3d;
}

.card {
  position: absolute;
  top: 25px;
  display: grid;
  place-items: center;
  width: 100px;
  height: 80px;
  border: 2px solid #1e293b;
  box-sizing: border-box;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
}

.is-far {
  left: 30px;
  z-index: 10;
  background: #fbbf24;
  transform: translateZ(-80px);
}

.is-near {
  left: 80px;
  z-index: 1;
  background: #93c5fd;
}

.plane {
  position: absolute;
  top: 20px;
  left: 50px;
  width: 100px;
  height: 100px;
  border: 2px solid #1e293b;
  box-sizing: border-box;
}

.is-a { background: rgb(251 191 36 / 0.9); transform: rotateY(40deg); }
.is-b { background: rgb(147 197 253 / 0.9); transform: rotateY(-40deg); }
```
