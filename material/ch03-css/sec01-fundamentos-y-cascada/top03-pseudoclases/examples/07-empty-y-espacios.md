---
example_description: ":empty ignora los comentarios pero no los espacios: un div con un solo espacio ya no está vacío"
example_tags: "css|pseudoclases|empty|espacios"
example_stage: common-error
example_importance: useful
---

# HTML

```html
<p>Las cajas con fondo rojo y borde discontinuo coinciden con <code>.slot:empty</code>.</p>

<p>1 · <code>&lt;div class="slot"&gt;&lt;/div&gt;</code> → nada dentro</p>
<div class="slot"></div>

<p>2 · <code>&lt;div class="slot"&gt;&lt;!-- nota --&gt;&lt;/div&gt;</code> → solo un comentario</p>
<div class="slot"><!-- nota --></div>

<p>3 · ❌ <code>&lt;div class="slot"&gt; &lt;/div&gt;</code> → solo un espacio… y ya no cuenta como vacío</p>
<div class="slot"> </div>

<p>4 · <code>&lt;div class="slot"&gt;texto&lt;/div&gt;</code> → tiene texto</p>
<div class="slot">texto</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

p {
  margin: 12px 0 4px;
}

.slot {
  border: 2px solid #94a3b8;
  padding: 10px;
}

/* :empty → el elemento no tiene ningún hijo: ni elementos ni texto.
   Los comentarios no cuentan… pero un espacio o un salto de línea SÍ:
   son un nodo de texto (lo viste en «El parser de HTML»). */
.slot:empty {
  background: #fecaca;
  border-style: dashed;
  border-color: #dc2626;
}

/* La especificación (Selectors 4) propuso que :empty ignorase los espacios, pero los
   navegadores no lo han adoptado: la caja 3 te muestra lo que hace el tuyo.
   Solución: escribe las etiquetas que deben quedar vacías pegadas, sin espacios
   ni saltos de línea dentro: <div class="slot"></div>. */
```
