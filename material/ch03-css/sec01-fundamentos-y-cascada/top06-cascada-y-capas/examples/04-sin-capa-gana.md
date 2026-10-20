---
example_description: "Los estilos sin capa forman una capa implícita con más prioridad que todas las capas declaradas"
example_tags: "css|cascada|layer|capas"
example_stage: minimal
example_importance: important
---

# HTML

```html
<main id="main">
  <p class="text">¿Rojo (selector fuerte dentro de una capa) o verde (selector débil sin capa)?</p>
</main>
<ul class="legend">
  <li class="swatch-red"><code>#main .text</code> → (1, 1, 0) en <code>@layer components</code></li>
  <li class="swatch-green"><code>p</code> → (0, 0, 1) sin capa, escrita ANTES</li>
</ul>
```

# CSS

```css
/* Sin capa, y escrita al principio: ni la especificidad ni el orden la ayudan… */
p {
  background: #bbf7d0;        /* (0,0,1) */
}

@layer components {
  #main .text {
    background: #fecaca;      /* (1,1,0) dentro de una capa */
  }
}

/* …y aun así gana. Todo el CSS sin capa forma una capa implícita que va la ÚLTIMA,
   la de más prioridad. Orden real de este archivo:
     components  <  (sin capa)
   Consecuencia práctica: si metes tu CSS en capas pero cargas una librería sin capa,
   la librería ganará a todo lo tuyo. La solución está en el ejemplo 08. */

body {
  font-family: system-ui, sans-serif;
}

#main .text {
  padding: 8px;               /* otra propiedad: no compite */
}

.legend {
  list-style: none;
  padding: 0;
}

.legend li {
  padding: 4px 8px;
  margin: 4px 0;
}

.swatch-red { background: #fecaca; }
.swatch-green { background: #bbf7d0; }
```
