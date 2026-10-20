---
example_description: "Sin flex-wrap, los elementos encogen hasta su palabra más larga y después se salen del contenedor; con wrap pasan a la línea siguiente"
example_tags: "css|flexbox|flex-wrap|desbordamiento|responsive|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ <code>flex-wrap: nowrap</code> (por defecto): todas en una línea; encogen y, cuando ya no pueden, se salen</p>
<ul class="tags">
  <li>HTML</li><li>CSS</li><li>Flexbox</li><li>Accesibilidad</li><li>Rendimiento</li>
  <li>JavaScript</li><li>Diseño responsive</li><li>Tipografía</li><li>Git</li><li>DevTools</li>
</ul>

<p class="label">✅ <code>flex-wrap: wrap</code>: lo que no cabe baja a la línea siguiente. Estrecha la vista previa y verás cómo se recolocan.</p>
<ul class="tags is-wrapping">
  <li>HTML</li><li>CSS</li><li>Flexbox</li><li>Accesibilidad</li><li>Rendimiento</li>
  <li>JavaScript</li><li>Diseño responsive</li><li>Tipografía</li><li>Git</li><li>DevTools</li>
</ul>
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

/* Una nube de etiquetas en una columna lateral de 26rem como mucho. */
.tags {
  display: flex;
  gap: 6px;
  max-width: 26rem;
  margin: 0 0 16px;
  padding: 6px;
  border: 2px dashed #7c3aed;
  list-style: none;
}

.tags li {
  padding: 2px 8px;
  border: 1px solid #4338ca;
  border-radius: 999px;
  background: #e0e7ff;
  font-size: 0.8rem;
}

/* 🐛 Por defecto, flex-wrap: nowrap: UNA sola línea pase lo que pase. Si no caben,
   los elementos encogen (flex-shrink, lección 3) hasta su ancho mínimo: su palabra más
   larga (min-content). «Diseño responsive» se parte en dos líneas y, cuando ninguna
   puede encoger más, la fila entera se sale del contenedor por la derecha. */

/* ✅ wrap: cuando el siguiente elemento no cabe, empieza una línea nueva.
   Cada línea se reparte su propio espacio, sin mirar a las demás.
   Es responsive sin media queries: el número de etiquetas por línea depende del ancho.
   (flex-flow: row wrap es el atajo de flex-direction + flex-wrap.) */
.is-wrapping {
  flex-wrap: wrap;
}
```
