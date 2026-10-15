---
example_description: "animation-timeline: view() liga la animación a la posición de cada elemento dentro del área visible de su contenedor: las tarjetas de un catálogo aparecen mientras entran por abajo, con animation-range: entry. Con reducir movimiento, solo se funden, sin subir"
example_tags: "css|scroll-driven|view-timeline|animation-timeline|view|animation-range|entry|prefers-reduced-motion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Desplaza el catálogo despacio: cada tarjeta aparece mientras asoma por abajo y termina de aparecer justo cuando ha entrado entera. Si subes, el efecto se deshace: va con el scroll, no con el tiempo.</p>
<ul class="catalog">
  <li class="plant"><span class="plant__icon" aria-hidden="true">🌵</span><h3>Nopal</h3><p>$185</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🪴</span><h3>Echeveria</h3><p>$95</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🌿</span><h3>Helecho</h3><p>$210</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🌱</span><h3>Albahaca</h3><p>$45</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🌸</span><h3>Bugambilia</h3><p>$320</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🍋</span><h3>Limonero enano</h3><p>$540</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🌻</span><h3>Girasol</h3><p>$60</p></li>
  <li class="plant"><span class="plant__icon" aria-hidden="true">🌾</span><h3>Pasto limón</h3><p>$70</p></li>
</ul>
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

/* El contenedor de scroll. */
.catalog {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  height: 230px;
  max-width: 380px;
  margin: 0;
  padding: 12px;
  overflow-y: auto;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  list-style: none;
}

.plant {
  padding: 10px;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.2);
  font-size: 0.8rem;
}

.plant__icon {
  font-size: 1.6rem;
}

.plant h3 {
  margin: 4px 0 2px;
  font-size: 0.9rem;
}

.plant p {
  margin: 0;
  color: #166534;
  font-weight: 700;
}

@keyframes reveal-fade {
  from { opacity: 0; }
}

@keyframes reveal-rise {
  from {
    opacity: 0;
    translate: 0 24px;
  }
}

/* view(): una línea de tiempo de VISTA. Su progreso es la posición del
   propio elemento dentro del área visible de su contenedor de scroll.
   animation-range dice qué tramo de ese recorrido ocupa la animación:
   «entry» = desde que asoma el primer píxel por abajo (0 %) hasta que ha
   entrado entero (100 %). Antes, el primer fotograma; después, el último
   (gracias a both). Las de la primera fila ya han entrado: se ven enteras. */
.plant {
  animation: reveal-fade auto linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

/* Con movimiento: además, sube 24px. Solo cambia el nombre de los keyframes. */
@media (prefers-reduced-motion: no-preference) {
  .plant {
    animation-name: reveal-rise;
  }
}
```
