---
example_description: "filter acepta una lista de funciones que se aplican en orden, cada una sobre el resultado de la anterior: sepia y luego gris da una foto gris; gris y luego sepia, una foto sepia; brightness(0) invert(1) da una silueta blanca, y al revés, negra"
example_tags: "css|filtros|filter|orden|grayscale|sepia|invert"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Las mismas dos funciones en distinto orden. Se leen de izquierda a derecha: cada una recibe lo que dejó la anterior.</p>
<div class="pair">
  <figure>
    <img class="sepia-then-gray" src="velasco-valle-de-mexico.jpg" alt="" width="200" height="138">
    <figcaption><code>sepia(1) grayscale(1)</code><br>el gris va al final y borra el sepia</figcaption>
  </figure>
  <figure>
    <img class="gray-then-sepia" src="velasco-valle-de-mexico.jpg" alt="" width="200" height="138">
    <figcaption><code>grayscale(1) sepia(1)</code><br>el sepia tiñe una foto ya gris: foto antigua</figcaption>
  </figure>
</div>

<p class="caption">Un truco clásico para cambiar el color de un logotipo:</p>
<div class="pair">
  <figure class="swatch">
    <img src="nopal.svg" alt="" width="60" height="70">
    <img class="dark-then-invert" src="nopal.svg" alt="" width="60" height="70">
    <figcaption><code>brightness(0) invert(1)</code><br>todo negro, después el negativo: silueta blanca</figcaption>
  </figure>
  <figure class="swatch">
    <img src="nopal.svg" alt="" width="60" height="70">
    <img class="invert-then-dark" src="nopal.svg" alt="" width="60" height="70">
    <figcaption><code>invert(1) brightness(0)</code><br>el negativo no sirve de nada: silueta negra</figcaption>
  </figure>
</div>
<p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.pair {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

figure {
  width: 200px;
  margin: 0;
}

figure img {
  display: block;
  margin-bottom: 4px;
}

figcaption {
  font-size: 0.7rem;
}

/* Una lista de filtros es una tubería: la salida de cada función es la
   entrada de la siguiente, como f(g(x)). El orden cambia el resultado. */
.sepia-then-gray { filter: sepia(1) grayscale(1); }
.gray-then-sepia { filter: grayscale(1) sepia(1); }

/* El dibujo original a la izquierda y el filtrado a la derecha, sobre un gris
   en el que se ven tanto el blanco como el negro. */
.swatch {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: #64748b;
}

.swatch figcaption {
  padding: 4px 6px;
  border-radius: 4px;
  background: #ffffff;
}

/* brightness(0) pone cada píxel en negro sin tocar su transparencia; invert(1)
   convierte ese negro en blanco. Al revés, el negro llega al final y gana. */
.dark-then-invert { filter: brightness(0) invert(1); }
.invert-then-dark { filter: invert(1) brightness(0); }
```
