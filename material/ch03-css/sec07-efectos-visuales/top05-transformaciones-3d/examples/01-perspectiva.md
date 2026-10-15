---
example_description: "rotateY gira una caja alrededor del eje vertical; sin perspectiva solo parece más estrecha. perspective en el padre pone el ojo a una distancia: cuanto menor, más se acerca el lado que viene hacia ti; perspective-origin mueve el punto de vista"
example_tags: "css|transformaciones-3d|perspective|perspective-origin|rotateY"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">La misma estampa con <code>transform: rotateY(50deg)</code>. Solo cambia la <code>perspective</code> de su contenedor (el recuadro gris).</p>
<ul class="grid">
  <li><div class="scene is-flat"><div class="card"></div></div><code>perspective: none</code><br>parece más estrecha, nada más</li>
  <li><div class="scene is-far"><div class="card"></div></div><code>perspective: 800px</code><br>el ojo lejos: efecto suave</li>
  <li><div class="scene is-near"><div class="card"></div></div><code>perspective: 250px</code><br>el ojo cerca: efecto fuerte</li>
</ul>

<p class="caption"><code>perspective: 250px</code> con el punto de vista desplazado (<code>perspective-origin</code>)</p>
<ul class="grid">
  <li><div class="scene is-near is-from-left"><div class="card"></div></div><code>perspective-origin: left</code></li>
  <li><div class="scene is-near is-from-top"><div class="card"></div></div><code>perspective-origin: top</code></li>
</ul>
<p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.scene {
  display: grid;
  place-items: center;
  height: 110px;
  margin-bottom: 4px;
  background: #e2e8f0;
}

.card {
  width: 110px;
  height: 74px;
  background: url("hokusai-gran-ola.jpg") center / cover;
  box-shadow: 0 0 0 2px #1e293b;
  /* rotateY gira alrededor del eje vertical (Y): el lado derecho se aleja
     hacia el fondo de la pantalla y el izquierdo se acerca. */
  transform: rotateY(50deg);
}

/* Sin perspectiva, el navegador proyecta en paralelo: la profundidad no se
   ve, y una caja girada en Y solo se estrecha (cos 50° ≈ 0,64 de su ancho). */
.is-flat { perspective: none; }

/* perspective es la distancia del ojo a la pantalla (el plano z = 0). Lo que
   se acerca crece y lo que se aleja encoge; cuanto más cerca el ojo, más. */
.is-far  { perspective: 800px; }
.is-near { perspective: 250px; }

/* perspective-origin coloca el ojo: por defecto, frente al centro del
   contenedor. Desde la izquierda o desde arriba, la caja se ve de lado. */
.is-from-left { perspective-origin: left; }
.is-from-top  { perspective-origin: top; }
```
