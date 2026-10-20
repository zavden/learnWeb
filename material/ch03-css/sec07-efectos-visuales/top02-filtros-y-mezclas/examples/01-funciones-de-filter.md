---
example_description: "Las funciones de filter aplicadas a la misma pintura: blur, brightness, contrast, grayscale, sepia, saturate, hue-rotate, invert y opacity; cada una procesa los píxeles ya pintados del elemento"
example_tags: "css|filtros|filter|blur|grayscale|hue-rotate"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<ul class="grid">
  <li><img src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>none</code></li>
  <li><img class="f-blur" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>blur(3px)</code></li>
  <li><img class="f-brightness" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>brightness(1.5)</code></li>
  <li><img class="f-contrast" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>contrast(1.8)</code></li>
  <li><img class="f-grayscale" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>grayscale(1)</code></li>
  <li><img class="f-sepia" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>sepia(1)</code></li>
  <li><img class="f-saturate" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>saturate(3)</code></li>
  <li><img class="f-hue" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>hue-rotate(180deg)</code></li>
  <li><img class="f-invert" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>invert(1)</code></li>
  <li><img class="f-opacity" src="velasco-valle-de-mexico.jpg" alt="" width="140" height="96"><code>opacity(0.35)</code></li>
</ul>
<p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público. (Las imágenes son decorativas: <code>alt=""</code>.)</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.grid img {
  display: block;
  margin-bottom: 2px;
}

.credit {
  margin: 10px 0 0;
  font-size: 0.72rem;
}

/* filter trabaja sobre los PÍXELES ya pintados del elemento (y de todos sus
   descendientes), como un programa de retoque. No cambia el tamaño de la caja
   ni mueve nada en el layout. */

/* blur: desenfoque con un radio. Los bordes también se difuminan y el
   resultado se sale un poco de la caja. */
.f-blur       { filter: blur(3px); }

/* Factores: 1 deja la imagen igual; 0 la lleva al extremo. Por encima de 1,
   más brillo, más contraste, más saturación. */
.f-brightness { filter: brightness(1.5); }
.f-contrast   { filter: contrast(1.8); }

/* Cantidades: de 0 (nada) a 1 (efecto completo). También valen porcentajes. */
.f-grayscale  { filter: grayscale(1); }
.f-sepia      { filter: sepia(1); }
.f-saturate   { filter: saturate(3); }

/* Gira todos los tonos del círculo de color: el cielo azul se vuelve naranja. */
.f-hue        { filter: hue-rotate(180deg); }

/* El negativo de una foto. */
.f-invert     { filter: invert(1); }

/* Como la propiedad opacity, pero dentro de la lista de filtros. */
.f-opacity    { filter: opacity(0.35); }
```
