---
example_description: "Capas y composición: una animación de transform sigue viva con el hilo principal bloqueado"
example_tags: "render|composite|capas|animacion|hilo-principal"
example_stage: intermediate
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<!-- Dos cajas con la misma animación de ida y vuelta, programada de dos formas:
     la de arriba cambia left (layout + paint en cada fotograma, en el hilo principal);
     la de abajo cambia transform (el compositor mueve su capa, en otro hilo).
     Pulsa el botón: bloquea el hilo principal 1 segundo. ¿Cuál se congela? -->
<button type="button" onclick="blockMainThread()">Bloquear el hilo principal 1 s</button>

<div class="track"><div class="box by-left">left</div></div>
<div class="track"><div class="box by-transform">transform</div></div>
```

# CSS

```css
/* @keyframes y animation se estudian en el capítulo de animaciones */
.track {
  position: relative;
  height: 48px;
  margin-block: 12px;
  background: #f3f4f6;
}

.box {
  position: absolute;
  width: 96px;
  padding: 12px 0;
  background: #93c5fd;
  text-align: center;
}

.by-left {
  animation: slide-left 2s ease-in-out infinite alternate;
}

.by-transform {
  animation: slide-transform 2s ease-in-out infinite alternate;
}

@keyframes slide-left {
  from { left: 0; }
  to { left: 200px; }
}

@keyframes slide-transform {
  from { transform: translateX(0); }
  to { transform: translateX(200px); }
}

/* Si tu sistema pide reducir el movimiento, las cajas se quedan quietas */
@media (prefers-reduced-motion: reduce) {
  .box {
    animation-play-state: paused;
  }
}
```

# JavaScript

```javascript
// Un bucle que no hace nada durante 1 segundo: mientras dura, el hilo principal no puede
// calcular layout ni pintar (el bucle while y Date.now se explican en JavaScript).
// El compositor trabaja en otro hilo y sigue moviendo la capa de la caja con transform.
function blockMainThread() {
  console.log('Hilo principal bloqueado…');
  const end = Date.now() + 1000;
  while (Date.now() < end) {
    // esperar sin hacer nada
  }
  console.log('…hilo principal libre otra vez');
}
```
