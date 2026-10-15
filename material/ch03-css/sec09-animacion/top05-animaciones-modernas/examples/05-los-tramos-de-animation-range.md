---
example_description: "Los tramos de animation-range, medidos: una maceta recorre una ventana con scroll y, fuera, cuatro medidores ligados a su línea de tiempo de vista (view-timeline con nombre y timeline-scope) se llenan cada uno en su tramo: cover, contain, entry y exit"
example_tags: "css|scroll-driven|animation-range|view-timeline|timeline-scope|cover|contain|entry|exit"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Desplaza la ventana despacio y mira cuándo se llena cada medidor mientras la maceta entra por abajo, la cruza y sale por arriba.</p>
<div class="lab">
  <div class="window">
    <p class="hint">↓ desplaza</p>
    <div class="subject">🪴 maceta</div>
    <p class="hint">↑ ha salido</p>
  </div>
  <ul class="meters">
    <li><code>cover</code> asoma → ha salido entera<span class="meter"><span class="is-cover"></span></span></li>
    <li><code>contain</code> está dentro entera<span class="meter"><span class="is-contain"></span></span></li>
    <li><code>entry</code> va entrando por abajo<span class="meter"><span class="is-entry"></span></span></li>
    <li><code>exit</code> va saliendo por arriba<span class="meter"><span class="is-exit"></span></span></li>
  </ul>
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

/* El antepasado común: el nombre --pot es visible para todo lo que hay dentro. */
.lab {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: start;
  timeline-scope: --pot;
}

/* La ventana con scroll: 180px de alto. */
.window {
  width: 150px;
  height: 180px;
  overflow-y: auto;
  border: 2px solid #1e293b;
  border-radius: 8px;
  background: #f1f5f9;
}

.hint {
  height: 200px;
  margin: 0;
  padding: 8px;
  color: #475569;
  font-size: 0.75rem;
}

.hint:last-child {
  display: flex;
  align-items: end;
}

/* La maceta: 60px de alto. view-timeline le da una línea de tiempo de vista
   con nombre, para que la usen elementos que no están dentro de ella. */
.subject {
  display: grid;
  place-items: center;
  height: 60px;
  margin-inline: 10px;
  border-radius: 8px;
  background: #fde68a;
  font-size: 0.85rem;
  view-timeline: --pot block;
}

.meters {
  flex: 1 1 200px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.75rem;
}

.meters li {
  margin-bottom: 10px;
}

.meter {
  display: block;
  height: 10px;
  margin-top: 3px;
  overflow: hidden;
  border-radius: 5px;
  background: #e2e8f0;
}

.meter span {
  display: block;
  height: 100%;
  background: #1d4ed8;
  transform-origin: left;
  scale: 0 1;
  animation: fill-meter auto linear both;
  animation-timeline: --pot;
}

@keyframes fill-meter {
  to { scale: 1 1; }
}

/* Los tramos se miden con la caja de la maceta y el área visible de la ventana:
   - cover:   desde que asoma su primer píxel hasta que sale el último
              (es el tramo por defecto, «normal»).
   - contain: mientras está dentro ENTERA (si fuera más alta que la ventana,
              mientras la cubre entera).
   - entry:   mientras va entrando: del primer píxel dentro a entera dentro.
   - exit:    mientras va saliendo: de empezar a salir a haber salido.
   Cada tramo admite porcentajes: «entry 50% cover 50%» empieza a mitad de la
   entrada y termina cuando la maceta está en el centro.
   (Con .meter delante, estas reglas ganan en especificidad a la que tiene el
   atajo animation: escribe los longhands de scroll siempre detrás del atajo
   o con más especificidad, como en el ejemplo 03.) */
.meter .is-cover   { animation-range: cover; }
.meter .is-contain { animation-range: contain; }
.meter .is-entry   { animation-range: entry; }
.meter .is-exit    { animation-range: exit; }
```
