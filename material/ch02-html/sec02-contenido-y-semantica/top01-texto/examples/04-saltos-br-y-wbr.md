---
example_description: "br para saltos que forman parte del texto; wbr y &shy; para partir palabras largas"
example_tags: "html|texto|br|wbr|shy"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<!-- br: un salto de línea DENTRO de un mismo texto, cuando el salto es parte del
     contenido: versos, direcciones postales. -->
<p>
  Caminante, son tus huellas<br>
  el camino y nada más;<br>
  caminante, no hay camino,<br>
  se hace camino al andar.
</p>
<p>Biblioteca Municipal<br>Calle Mayor, 12<br>28013 Madrid</p>

<!-- ❌ br NO sirve para separar párrafos ni para dejar hueco (<br><br>): eso es un
     <p> nuevo y un margen de CSS. -->

<!-- wbr: un punto donde la línea PUEDE partirse si no cabe. No dibuja nada. -->
<div class="narrow">
  <p>Sin wbr: <code>obtenerPreferenciasDeNotificacion()</code></p>
  <p>Con wbr: <code>obtener<wbr>Preferencias<wbr>De<wbr>Notificacion()</code></p>
  <!-- &shy; (guion opcional): como wbr, pero si la palabra se parte, dibuja un guion -->
  <p>Con &amp;shy;: Otorrino&shy;laringología</p>
</div>
```

# CSS

```css
/* Solo para forzar una columna estrecha y ver qué cabe y qué no (CSS: capítulo 3) */
.narrow {
  width: 9em;
  padding: 8px;
  border: 1px dashed #64748b;
}
```
