---
example_description: "Lo que cuesta animar cada propiedad: width obliga a rehacer layout, paint y composite en cada fotograma (y empuja al vecino); background-color y box-shadow, paint y composite; translate y opacity, solo composite. Para verlo, Paint flashing y el panel Performance de DevTools"
example_tags: "css|rendimiento|layout|paint|composite|devtools|paint-flashing|animaciones"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="caption">Tres animaciones de ida y vuelta (3 s en total) que se parecen, pero cuestan muy distinto. Para verlo: abre el ejemplo en su pestaña con ↗, en DevTools activa <strong>Rendering → Paint flashing</strong> y marca la casilla. Las filas 1 y 2 se pintan de verde en cada fotograma; la 3, no.</p>
<label class="control"><input type="checkbox" id="play"> Animar</label>
<ol class="rows">
  <li><p class="row"><span class="box is-layout">width</span><span class="neighbor">vecino</span></p><p class="cost">layout → paint → composite</p></li>
  <li><p class="row"><span class="box is-paint">background-color, box-shadow</span><span class="neighbor">vecino</span></p><p class="cost">paint → composite</p></li>
  <li><p class="row"><span class="box is-composite">translate, opacity</span><span class="neighbor">vecino</span></p><p class="cost">solo composite</p></li>
</ol>
<p class="caption">Con «reducir movimiento», las filas 1 y 3 no se animan; la 2, que solo cambia de color, sí.</p>
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

.rows {
  margin: 12px 0;
  padding-left: 1.2rem;
}

.rows li {
  margin-bottom: 10px;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
}

.cost {
  margin: 2px 0 0;
  color: #475569;
  font-size: 0.7rem;
}

.box {
  width: 150px;
  padding: 8px;
  border-radius: 6px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.7rem;
}

.neighbor {
  padding: 8px;
  border-radius: 6px;
  background: #e2e8f0;
  font-size: 0.7rem;
}

/* 1. width cambia la geometría: en cada fotograma el navegador recalcula el
      layout (el vecino se mueve), vuelve a pintar y compone. */
@keyframes grow {
  to { width: 230px; }
}

/* 2. Colores y sombras no mueven nada, pero hay que volver a pintar la caja
      en cada fotograma. */
@keyframes glow {
  to {
    background-color: #b45309;
    box-shadow: 0 0 0 6px rgb(180 83 9 / 0.35);
  }
}

/* 3. translate y opacity: la caja se pinta UNA vez en su capa, y en cada
      fotograma el compositor solo la mueve y la hace más transparente, en la
      GPU y en otro hilo. El vecino ni se entera. */
@keyframes slide {
  to {
    translate: 80px 0;
    opacity: 0.5;
  }
}

body:has(#play:checked) .is-paint {
  animation: glow 1s ease-in-out 3 alternate;
}

@media (prefers-reduced-motion: no-preference) {
  body:has(#play:checked) .is-layout {
    animation: grow 1s ease-in-out 3 alternate;
  }

  body:has(#play:checked) .is-composite {
    animation: slide 1s ease-in-out 3 alternate;
  }
}
```
