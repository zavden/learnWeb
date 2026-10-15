---
example_description: "Pistas que miden según su contenido: min-content (la palabra más larga), max-content (todo en una línea), fit-content(10rem) (como max-content, con techo) y auto junto a una pista fr"
example_tags: "css|grid|min-content|max-content|fit-content|auto|grid-template-columns"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption"><code>min-content 1fr</code>: la columna mide la palabra más larga y el texto se parte en todas las líneas que puede</p>
<div class="grid is-min">
  <div class="sized">Envío gratis en pedidos desde 999 MXN</div><div>1fr: el resto</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>max-content 1fr</code>: el texto entero en una línea; la columna fr se queda con lo que sobra</p>
<div class="grid is-max">
  <div class="sized">Envío gratis en pedidos desde 999 MXN</div><div>1fr: el resto</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>fit-content(10rem) 1fr</code>: como <code>max-content</code>, pero sin pasar de 10rem (160px): el texto se parte</p>
<div class="grid is-fit">
  <div class="sized">Envío gratis en pedidos desde 999 MXN</div><div>1fr: el resto</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>auto 1fr</code>: <code>auto</code> va de <code>min-content</code> a <code>max-content</code>; con sitio de sobra, llega a <code>max-content</code></p>
<div class="grid is-auto">
  <div class="sized">Envío gratis en pedidos desde 999 MXN</div><div>1fr: el resto</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.grid {
  display: grid;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.ruler {
  display: block;
  margin-top: 3px;
}

.grid > div {
  padding: 4px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
}

.grid > .sized {
  border-color: #b45309;
  background: #fef3c7;
}

/* Las palabras clave de tamaño intrínseco que viste en la lección de tamaños
   (min-content, max-content, fit-content) también valen como tamaño de pista:
   la pista mide lo que pida el contenido de sus elementos. */
.is-min {
  grid-template-columns: min-content 1fr;      /* la palabra más larga: «pedidos» */
}

.is-max {
  grid-template-columns: max-content 1fr;      /* la frase sin cortes */
}

.is-fit {
  grid-template-columns: fit-content(10rem) 1fr;   /* min(max-content, 10rem) */
}

/* auto: mínimo = min-content, máximo = max-content. Las pistas auto crecen hasta su
   máximo ANTES de que las fr repartan lo que sobra. (Sin ninguna pista fr, las auto
   se estirarían además para llenar el contenedor.) */
.is-auto {
  grid-template-columns: auto 1fr;
}
```
