---
example_description: "display: flex en el padre pone a sus hijos en fila, cada uno a la medida de su contenido y todos igual de altos"
example_tags: "css|flexbox|display|contenedor"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Sin <code>display: flex</code>: flujo normal, cada bloque en su línea y de todo el ancho</p>
<div class="week">
  <div class="day"><strong>Lunes</strong> Yoga 8:00</div>
  <div class="day"><strong>Martes</strong> Libre</div>
  <div class="day"><strong>Miércoles</strong> Inglés 18:00<br>Cine 21:00</div>
</div>

<p class="label">Con <code>display: flex</code> en el padre: en fila, a la medida de su contenido y todos igual de altos</p>
<div class="week is-flex">
  <div class="day"><strong>Lunes</strong> Yoga 8:00</div>
  <div class="day"><strong>Martes</strong> Libre</div>
  <div class="day"><strong>Miércoles</strong> Inglés 18:00<br>Cine 21:00</div>
</div>
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

/* El borde discontinuo violeta marca el contenedor, como el overlay de flexbox de DevTools. */
.week {
  padding: 4px;
  border: 2px dashed #7c3aed;
}

.day {
  margin: 2px;
  padding: 4px 8px;
  border: 1px solid #4338ca;
  border-radius: 6px;
  background: #e0e7ff;
  font-size: 0.8rem;
}

/* Una sola declaración en el PADRE. El padre pasa a ser un contenedor flex y sus hijos
   directos, elementos flex:
   - se colocan en fila (el eje principal es horizontal por defecto);
   - cada uno mide lo que su contenido, aunque sean div (ya no llenan el ancho);
   - todos se estiran hasta la altura del más alto (align-items: stretch, lección 2);
   - el contenedor sigue siendo un bloque por fuera: display: flex = display: block flex. */
.is-flex {
  display: flex;
}
```
