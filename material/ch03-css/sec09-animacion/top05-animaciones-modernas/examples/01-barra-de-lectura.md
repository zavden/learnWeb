---
example_description: "Una barra de progreso de lectura sin JavaScript: animation-timeline: scroll() cambia el reloj de la animación por la posición del scroll del contenedor más cercano. Al principio del artículo, la barra está vacía; al final, llena; a la mitad, a la mitad"
example_tags: "css|scroll-driven|animation-timeline|scroll|barra-de-progreso|scale|sticky"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Desplaza el artículo: la barra verde de arriba se llena según lo que llevas leído. No hay ni una línea de JavaScript.</p>
<article class="reader">
  <div class="progress" aria-hidden="true"><div class="progress__fill"></div></div>
  <h2>Cómo trasplantar un cactus sin pincharte</h2>
  <p>Trasplanta en primavera, cuando el cactus empieza a crecer: las raíces se recuperan antes. Riégalo una semana antes, nunca el mismo día.</p>
  <p>Envuelve el cactus con una tira de periódico doblada varias veces o con una toalla vieja: será tu asa. Unas pinzas de cocina largas sirven para los pequeños.</p>
  <p>Inclina la maceta y golpea los bordes hasta que el cepellón se suelte. Si se resiste, pasa un cuchillo sin filo por el borde interior.</p>
  <p>Revisa las raíces: corta las secas o blandas con unas tijeras limpias y deja secar los cortes al aire un par de días.</p>
  <p>Usa una maceta solo un poco más grande, con agujero, y un sustrato para cactus. Coloca la planta a la misma altura que tenía.</p>
  <p>No riegues hasta una semana después: las raíces dañadas necesitan cerrar sus heridas antes de recibir agua.</p>
</article>
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

/* El contenedor de scroll: alto fijo y overflow. */
.reader {
  height: 240px;
  max-width: 420px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 14px 14px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.reader h2 {
  margin: 10px 0 6px;
  font-size: 1rem;
}

/* La pista se queda pegada arriba mientras el texto pasa por debajo. */
.progress {
  position: sticky;
  top: 0;
  height: 6px;
  margin-inline: -14px;
  background: #e2e8f0;
}

/* El relleno: un scale de 0 a 1 desde la izquierda (lección de rendimiento). */
.progress__fill {
  height: 100%;
  background: #15803d;
  transform-origin: left;
  scale: 0 1;
}

@keyframes grow-progress {
  to { scale: 1 1; }
}

/* animation-timeline: scroll() cambia el RELOJ de la animación: en lugar del
   tiempo, la posición del scroll de su contenedor de scroll más cercano
   (aquí, el artículo). Arriba del todo = 0 %; abajo del todo = 100 %.
   - La duración no significa nada: «auto» reparte la animación en todo el
     recorrido del scroll.
   - animation-timeline va DESPUÉS del atajo animation (ejemplo 03). */
.progress__fill {
  animation: grow-progress auto linear both;
  animation-timeline: scroll();
}

/* La barra informa de algo (cuánto queda) y no desplaza nada: se mantiene
   también con «reducir movimiento». */
```
