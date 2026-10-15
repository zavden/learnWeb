---
example_description: "Un efecto escalonado con transition-delay: los pasos del seguimiento de un pedido aparecen uno detrás de otro, con un retardo de 80 ms por posición calculado con calc() y una custom property; al cerrar, todos se van a la vez porque el retardo solo está en el estado abierto"
example_tags: "css|transiciones|transition-delay|escalonado|calc|custom-properties|visibility"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Marca la casilla: los cuatro pasos aparecen en cascada, 80 ms uno detrás de otro. Desmárcala: se van todos a la vez.</p>
<label class="control"><input type="checkbox" id="tracking"> Ver el seguimiento del pedido 1042</label>
<ol class="steps">
  <li style="--i: 0"><strong>Pedido recibido</strong> · lunes, 10:12</li>
  <li style="--i: 1"><strong>Preparando tu caja</strong> · lunes, 16:40</li>
  <li style="--i: 2"><strong>En camino</strong> · martes, 08:05</li>
  <li style="--i: 3"><strong>Entrega prevista</strong> · miércoles, de 9:00 a 14:00</li>
</ol>
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

.steps {
  display: grid;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}

.steps li {
  padding: 8px 12px;
  border-left: 4px solid #15803d;
  background: #f0fdf4;
  /* Cerrado: invisible y fuera del árbol de accesibilidad (visibility). */
  opacity: 0;
  visibility: hidden;
  transition: opacity 250ms, visibility 250ms;
}

body:has(#tracking:checked) .steps li {
  opacity: 1;
  visibility: visible;
  /* El retardo va SOLO en el estado abierto: la transición que manda es la
     del estado de llegada. Al abrir, cada paso espera 80 ms por posición
     (0, 80, 160 y 240 ms). Al cerrar, el estado de llegada es la regla base,
     sin retardo: se van todos juntos. */
  transition-delay: calc(var(--i) * 80ms);
}

/* visibility es un caso especial: se anima «a saltos» de forma que el
   elemento es visible durante toda la transición si uno de los dos extremos
   es visible. Al cerrar, sigue visible mientras la opacidad baja a 0. */

@media (prefers-reduced-motion: no-preference) {
  .steps li {
    translate: -12px 0;
    transition: opacity 250ms, visibility 250ms, translate 250ms ease-out;
  }

  body:has(#tracking:checked) .steps li {
    translate: 0 0;
  }
}
```
