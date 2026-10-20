---
example_description: "Entre capas no se mira la especificidad: p (0,0,1) en una capa posterior gana a #main .text (1,1,0) en una anterior"
example_tags: "css|cascada|layer|capas"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<main id="main">
  <p class="text">¿Rojo (selector fuerte en la capa «base») o verde (selector débil en la capa «components»)?</p>
</main>
<ul class="legend">
  <li class="swatch-red"><code>#main .text</code> → (1, 1, 0) en <code>@layer base</code></li>
  <li class="swatch-green"><code>p</code> → (0, 0, 1) en <code>@layer components</code></li>
</ul>
```

# CSS

```css
/* 1) Una sentencia @layer declara el orden de las capas: de MENOS a MÁS prioridad. */
@layer base, components;

/* 2) Cada bloque @layer mete sus reglas en una capa. */
@layer base {
  #main .text {
    background: #fecaca;     /* (1,1,0), pero en «base», la capa con menos prioridad */
  }
}

@layer components {
  p {
    background: #bbf7d0;     /* (0,0,1), en «components», que va después → GANA */
  }
}

/* Las capas se comparan ANTES que la especificidad.
   La especificidad solo desempata entre reglas de la MISMA capa. */

body {
  font-family: system-ui, sans-serif;
}

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

.swatch-red { background: #fecaca; }
.swatch-green { background: #bbf7d0; }
```
