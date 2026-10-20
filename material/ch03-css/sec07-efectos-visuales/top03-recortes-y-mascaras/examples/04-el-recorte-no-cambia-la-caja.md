---
example_description: "Un botón recortado en rombo sigue ocupando su caja rectangular en el layout (los vecinos no se acercan), pero solo la parte visible recibe el ratón y los clics: las esquinas recortadas no reaccionan"
example_tags: "css|recortes|clip-path|layout|hit-testing|hover|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Tres botones de 140 × 70 en una fila flex con <code>gap: 8px</code>. El del medio tiene <code>clip-path</code> en forma de rombo; su recuadro discontinuo es su caja.</p>
<div class="toolbar">
  <button class="action" type="button">Guardar</button>
  <span class="frame"><button class="action is-diamond" type="button">Publicar</button></span>
  <button class="action" type="button">Borrar</button>
</div>
<ul class="notes">
  <li><strong>Layout:</strong> «Guardar» y «Borrar» no se acercan al rombo. El recorte no cambia el tamaño de la caja: sigue midiendo 140 × 70.</li>
  <li><strong>Ratón:</strong> pasa el puntero por las esquinas vacías del recuadro. El botón no se oscurece ni cambia el cursor, y un clic ahí no lo pulsa: lo recortado no existe para el ratón.</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 10px;
  font-size: 0.72rem;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.frame {
  display: block;
  outline: 1px dashed #64748b;
}

.action {
  display: block;
  width: 140px;
  height: 70px;
  border: 0;
  background: #1d4ed8;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* El estado :hover cambia al instante (las transiciones llegan en el módulo de
   animación): así se ve exactamente qué zona responde al ratón. */
.action:hover {
  background: #1e3a8a;
}

/* 🐛 clip-path solo cambia lo que se PINTA y lo que se puede TOCAR: la caja
   sigue en el layout con su tamaño completo, y las zonas recortadas no
   reciben eventos del ratón (ni :hover ni clics).
   Ojo con los botones pequeños: recortar un botón de 44 × 44 en círculo le
   quita las esquinas, y el área que se puede pulsar se reduce un 21 %. */
.is-diamond {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}
```
