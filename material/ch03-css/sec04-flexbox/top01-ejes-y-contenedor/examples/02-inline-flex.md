---
example_description: "inline-flex coloca a los hijos igual que flex, pero la caja sigue en la línea de texto: ideal para etiquetas y botones con icono"
example_tags: "css|flexbox|inline-flex|display"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label"><code>display: flex</code>: un bloque por fuera, rompe la línea y ocupa todo el ancho</p>
<p class="text">Mochila de 30 litros <span class="tag is-flex"><img src="icon-truck.svg" alt="" width="16" height="16">Envío gratis</span> en tres colores.</p>

<p class="label"><code>display: inline-flex</code>: en la línea por fuera, flex por dentro</p>
<p class="text">Mochila de 30 litros <span class="tag is-inline-flex"><img src="icon-truck.svg" alt="" width="16" height="16">Envío gratis</span> en tres colores.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.text {
  margin: 0 0 12px;
}

.tag {
  padding: 2px 8px;
  border: 1px solid #166534;
  border-radius: 999px;
  background: #dcfce7;
  color: #14532d;
  font-size: 0.8rem;
  /* Dentro, las dos versiones son iguales: el icono y el texto son elementos flex,
     centrados en vertical (align-items, próxima lección) y separados por gap.
     Sin vertical-align ni desplazamientos en em como en el módulo anterior. */
  align-items: center;
  gap: 4px;
}

/* El tipo EXTERIOR decide cómo se comporta la caja entre sus hermanos:
   flex = block flex: empieza en una línea nueva y llena el ancho. */
.is-flex {
  display: flex;
}

/* inline-flex = inline flex: se queda dentro de la línea como un inline-block.
   Se apoya en la línea base de la frase con la línea base de su PRIMER elemento; aquí es
   el icono, que no tiene texto, así que usa su borde inferior (como una imagen). */
.is-inline-flex {
  display: inline-flex;
}
```
