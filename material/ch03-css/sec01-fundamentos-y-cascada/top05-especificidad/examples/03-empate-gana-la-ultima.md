---
example_description: "Con la misma especificidad gana la regla escrita después; el orden de las clases en el atributo class no influye"
example_tags: "css|especificidad|orden|cascada"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="note warning"><code>class="note warning"</code></p>
<p class="warning note"><code>class="warning note"</code> (las mismas clases, en otro orden)</p>
<ul class="legend">
  <li class="swatch-yellow"><code>.warning</code> → (0, 1, 0), escrita primero</li>
  <li class="swatch-blue"><code>.note</code> → (0, 1, 0), escrita después</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* Las dos reglas tienen especificidad (0,1,0): empate.
   Desempata el ORDEN DE APARICIÓN: gana la que aparece más tarde en la hoja. */
.warning { background: #fde68a; }
.note    { background: #bfdbfe; }   /* ← va después: gana en LOS DOS párrafos */

/* El orden de las clases dentro del atributo class NO importa:
   class="note warning" y class="warning note" son lo mismo para CSS.
   Prueba a intercambiar las dos reglas de arriba y mira los dos párrafos. */

p {
  padding: 8px;
}

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-yellow { background: #fde68a; }
.swatch-blue { background: #bfdbfe; }
```
