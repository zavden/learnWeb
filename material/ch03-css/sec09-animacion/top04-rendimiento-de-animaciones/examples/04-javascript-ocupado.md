---
example_description: "Una animación de CSS de transform (o translate) sigue moviéndose aunque JavaScript tenga ocupado el hilo principal, porque la mueve el compositor en otro hilo; una de left se congela. Un botón ocupa el hilo principal en tres bloques de 350 ms (adelanto de JavaScript) mientras tres cajas van y vienen"
example_tags: "css|rendimiento|compositor|hilo-principal|transform|left|javascript|animaciones"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<p class="caption">Marca la casilla (las cajas van y vienen durante 8 s) y pulsa el botón: JavaScript ocupa el hilo principal tres veces seguidas, 350 ms cada vez. Mira qué caja se congela a tirones y cuáles siguen como si nada. (Con «reducir movimiento», las cajas no se mueven.)</p>
<p class="controls">
  <label class="control"><input type="checkbox" id="run"> Mover las cajas</label>
  <button type="button" onclick="blockMainThread()">Ocupar JavaScript 3 × 350 ms</button>
</p>
<div class="track"><div class="box is-left">left</div></div>
<div class="track"><div class="box is-transform">transform</div></div>
<div class="track"><div class="box is-translate">translate</div></div>
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

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.control,
button {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
}

button {
  border-color: #be123c;
  background: #be123c;
  color: #ffffff;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.track {
  position: relative;
  height: 36px;
  margin-top: 10px;
  border-radius: 6px;
  background: #f1f5f9;
}

.box {
  position: absolute;
  top: 4px;
  left: 0;
  width: 90px;
  padding: 6px 0;
  border-radius: 6px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.75rem;
  text-align: center;
}

/* Tres animaciones con el mismo recorrido (200px), la misma curva y la misma
   duración. Solo cambia la propiedad. */
@keyframes move-left      { to { left: 200px; } }
@keyframes move-transform { to { transform: translateX(200px); } }
@keyframes move-translate { to { translate: 200px 0; } }

/* left: layout y paint en cada fotograma, en el HILO PRINCIPAL, el mismo que
   ejecuta JavaScript. Si JavaScript no lo suelta, no hay fotogramas nuevos.
   transform y translate: el compositor mueve la capa ya pintada en su propio
   hilo; no necesita al hilo principal para nada. */
@media (prefers-reduced-motion: no-preference) {
  body:has(#run:checked) .is-left {
    animation: move-left 1s ease-in-out 8 alternate;
  }

  body:has(#run:checked) .is-transform {
    animation: move-transform 1s ease-in-out 8 alternate;
  }

  body:has(#run:checked) .is-translate {
    animation: move-translate 1s ease-in-out 8 alternate;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). onclick="blockMainThread()" llama a
// esta función al pulsar el botón. El bucle, performance.now() y setTimeout son del
// capítulo 5 (asincronía y event loop).

// Ocupa el hilo principal durante `ms` milisegundos sin hacer nada útil.
function busyFor(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // esperar activamente: mientras tanto no hay layout, ni paint, ni clics
  }
}

// Tres bloques de 350 ms. Entre bloque y bloque, setTimeout(…, 0) devuelve el
// control al event loop, y el navegador puede pintar algún fotograma suelto.
function blockMainThread() {
  let block = 1;
  const runBlock = () => {
    busyFor(350);
    console.log(`Bloque ${block} de 3: hilo principal ocupado 350 ms`);
    block += 1;
    if (block <= 3) {
      setTimeout(runBlock, 0);
    }
  };
  runBlock();
}
```
