---
example_description: "El origen se compara antes que la especificidad: tu regla a (0,0,1) gana a la del navegador a:link (0,1,1)"
example_tags: "css|cascada|origenes|user-agent"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p>Un <a href="#">enlace</a> dentro de un párrafo.</p>
<ul class="legend">
  <li class="swatch-blue">Navegador: <code>a:link</code> → (0, 1, 1), azul</li>
  <li class="swatch-green">Tú: <code>a</code> → (0, 0, 1), verde</li>
</ul>
<p>El enlace es verde: tu regla es menos específica, pero pertenece a un origen con más prioridad.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

/* La hoja del navegador (origen «user agent») trae, más o menos:
     a:link { color: #0000ee; text-decoration: underline; }    → (0,1,1)
   Esta es tu regla (origen «autor»): */
a {
  color: #15803d;               /* (0,0,1): menos específica… y aun así gana */
}

/* El ORIGEN se compara ANTES que la especificidad: autor > navegador.
   La especificidad solo desempata entre declaraciones del mismo origen.
   Fíjate en que el subrayado sigue: tu regla no declara text-decoration,
   así que esa propiedad la sigue poniendo el navegador. */

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-blue { background: #dbeafe; }
.swatch-green { background: #bbf7d0; }
```
