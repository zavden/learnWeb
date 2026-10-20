---
example_description: "Cada view-transition-name tiene que ser único en la página: si dos elementos visibles comparten nombre, el navegador cancela la View Transition (la promesa ready se rechaza con InvalidStateError) y el cambio ocurre de golpe. Con un nombre por elemento, y view-transition-class para el estilo común, las plantas se reordenan deslizándose"
example_tags: "css|view-transitions|view-transition-name|view-transition-class|match-element|javascript|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<!-- 1. Pulsa «Invertir el orden»: la lista se invierte de golpe y la consola dice por qué.
     2. Marca «Un nombre por planta» y vuelve a pulsar: las plantas se deslizan a su sitio.
     (Con «reducir movimiento» no hay nombres y la lista se funde: el fallo no aparece.) -->
<p class="controls">
  <button type="button" onclick="reverseList()">Invertir el orden</button>
  <label><input type="checkbox" id="fix"> Un nombre por planta</label>
</p>
<ol class="plants">
  <li style="--vt: plant-nopal">🌵 Nopal</li>
  <li style="--vt: plant-echeveria">🪴 Echeveria</li>
  <li style="--vt: plant-helecho">🌿 Helecho</li>
  <li style="--vt: plant-limonero">🍋 Limonero enano</li>
</ol>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  font-size: 0.85rem;
}

button {
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #1e293b;
  outline-offset: 2px;
}

.plants {
  display: grid;
  gap: 6px;
  max-width: 260px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}

.plants li {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f0fdf4;
  font-size: 0.85rem;
}

@media (prefers-reduced-motion: no-preference) {
  /* 🐛 El nombre identifica a UN elemento en la foto de antes y en la de
     después: así sabe el navegador qué foto vieja va con qué foto nueva. Con
     cuatro elementos llamados «plant», no hay forma de emparejarlos: la
     transición se cancela entera (el cambio del DOM sí se hace, sin animar). */
  .plants li {
    view-transition-name: plant;
  }

  /* ✅ Un nombre distinto por elemento (aquí, el de una custom property en
     línea; en Chrome 137+ también vale view-transition-name: match-element,
     que da a cada elemento un nombre único automático). Lo común va en una
     CLASE, que no tiene por qué ser única: view-transition-class. */
  body:has(#fix:checked) .plants li {
    view-transition-name: var(--vt);
    view-transition-class: plant;
  }

  ::view-transition-group(*.plant) {
    animation-duration: 350ms;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). onclick llama a reverseList();
// append() con los mismos hijos en orden inverso los vuelve a colocar al revés.
function reverseList() {
  const list = document.querySelector('.plants');
  const update = () => list.append(...[...list.children].reverse());

  if (!document.startViewTransition) {
    update();
    return;
  }

  const transition = document.startViewTransition(update);
  // transition.ready es una promesa (capítulo 5): se cumple cuando la animación va a
  // empezar y se rechaza si la transición se cancela.
  transition.ready
    .then(() => console.log('✅ La transición empieza'))
    .catch((error) => console.warn(`❌ Transición cancelada → ${error.name}: ${error.message}`));
}
```
