---
example_description: "Interpolables frente a discretas: width, background-color, border-radius y opacity pasan por valores intermedios durante 1,5 s; justify-content y font-style no tienen término medio y cambian al instante, o a mitad de camino con transition-behavior: allow-discrete"
example_tags: "css|transiciones|animable|interpolacion|discreta|transition-behavior|allow-discrete"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Todas las muestras tienen <code>transition: all 1.5s linear</code>. Marca la casilla y mira cuándo cambia cada una.</p>
<label class="control"><input type="checkbox" id="change"> Cambiar el estado</label>
<div class="lab">
  <section>
    <h3>Interpolables: pasan por valores intermedios</h3>
    <p class="sample"><span class="bar"></span><code>width</code></p>
    <p class="sample"><span class="swatch"></span><code>background-color</code></p>
    <p class="sample"><span class="corner"></span><code>border-radius</code></p>
    <p class="sample"><span class="ghost"></span><code>opacity</code></p>
  </section>
  <section>
    <h3>Discretas: no hay término medio</h3>
    <p class="sample"><span class="slot"><span class="dot"></span></span><code>justify-content</code>: salta al instante</p>
    <p class="sample"><span class="word">Oferta</span><code>font-style</code>: salta al instante</p>
    <p class="sample is-allowed"><span class="slot"><span class="dot"></span></span>con <code>allow-discrete</code>: salta a los 0,75 s</p>
    <p class="sample is-allowed"><span class="word">Oferta</span>con <code>allow-discrete</code>: salta a los 0,75 s</p>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.control {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.lab {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

h3 {
  margin: 0 0 8px;
  font-size: 0.8rem;
}

.sample {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 32px;
  margin: 0 0 6px;
  font-size: 0.72rem;
}

/* Un laboratorio: aquí «all» es justo lo que queremos (todas las propiedades
   que cambien, durante 1,5 s y a velocidad constante). En una interfaz real,
   lista las propiedades: lo verás en el ejemplo de transition: all. */
.sample * {
  transition: all 1.5s linear;
}

.bar    { display: block; width: 30px; height: 14px; background: #1d4ed8; }
.swatch { display: block; width: 30px; height: 30px; background: #1d4ed8; }
.corner { display: block; width: 30px; height: 30px; background: #1d4ed8; }
.ghost  { display: block; width: 30px; height: 30px; background: #1d4ed8; }

.slot {
  display: flex;
  justify-content: flex-start;
  width: 60px;
  padding: 2px;
  border-radius: 999px;
  background: #e2e8f0;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #be123c;
}

.word {
  width: 60px;
  font-size: 0.9rem;
  font-style: normal;
  font-weight: 700;
}

/* Interpolables: entre 30px y 120px hay infinitos valores (inicio + (fin −
   inicio) · progreso), y el navegador calcula uno en cada fotograma. Lo mismo
   con los colores, los radios y la opacidad. */
body:has(#change:checked) .bar    { width: 120px; }
body:has(#change:checked) .swatch { background: #f59e0b; }
body:has(#change:checked) .corner { border-radius: 50%; }
body:has(#change:checked) .ghost  { opacity: 0.15; }

/* 🐛 Discretas: entre flex-start y flex-end, o entre normal e italic, no hay
   nada en medio. Sin más, no se animan: el valor nuevo llega al instante,
   aunque estén en la transición (con all o por su nombre). */
body:has(#change:checked) .slot { justify-content: flex-end; }
body:has(#change:checked) .word { font-style: italic; }

/* transition-behavior: allow-discrete las mete en la transición: siguen sin
   valores intermedios, pero el cambio espera a la MITAD de la duración
   (0,75 s de 1,5 s). Es lo que permite animar la salida de display: none
   (ejemplo 06). */
.is-allowed * {
  transition-behavior: allow-discrete;
}
```
