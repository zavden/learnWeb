---
example_description: "Un degradado oscuro apilado encima de la foto en el mismo background hace legible el texto blanco: es la capa de arriba de la lista, y se funde con transparent sin franjas grises en los navegadores actuales"
example_tags: "css|degradados|fondos-multicapa|contraste|accesibilidad|transparent"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">❌ Texto blanco directamente sobre la pintura: en las zonas claras, el contraste no llega ni a 3:1</p>
<section class="hero is-bare">
  <h2>El paisaje mexicano del siglo XIX</h2>
  <p>Ciclo de charlas · jueves a las 18:00</p>
</section>

<p class="caption">✅ La misma foto con un degradado oscuro encima, como primera capa del fondo</p>
<section class="hero is-scrim">
  <h2>El paisaje mexicano del siglo XIX</h2>
  <p>Ciclo de charlas · jueves a las 18:00</p>
</section>

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
  margin: 10px 0 4px;
  font-size: 0.72rem;
}

.hero {
  display: flex;
  flex-direction: column;
  justify-content: end;
  max-width: 440px;
  aspect-ratio: 2 / 1;
  padding: 14px 16px;
  box-sizing: border-box;
  background-color: #475569;                  /* por si la imagen no llega */
  background-position: center 70%;
  background-size: cover;
  color: #ffffff;
}

.hero h2 {
  margin: 0 0 2px;
  font-size: 1.2rem;
}

.hero p {
  margin: 0;
  font-size: 0.85rem;
}

.is-bare {
  background-image: url("velasco-valle-de-mexico.jpg");
}

/* ✅ Dos capas: la PRIMERA de la lista (el degradado) se pinta encima de la
   segunda (la pintura). Abajo, donde está el texto, el velo es casi opaco; a
   partir del 75 % de la altura ya no hay velo y la pintura se ve tal cual.
   Contraste: con un 70 % de opacidad, este azul noche deja el blanco por
   encima de 4.5:1 incluso sobre un píxel blanco (el peor caso posible), y bajo
   todo el texto el velo tiene al menos ese 70 %.
   transparent es rgb(0 0 0 / 0): un negro transparente. Los navegadores
   antiguos mezclaban el color y el alfa por separado, y a mitad de camino salía
   un gris oscuro semitransparente; por eso en código viejo verás
   rgb(15 23 42 / 0) en lugar de transparent. Hoy se mezcla con el alfa
   premultiplicado y transparent no añade ningún color. */
.is-scrim {
  background-image:
    linear-gradient(to top, rgb(15 23 42 / 0.85), rgb(15 23 42 / 0.7) 45%, transparent 75%),
    url("velasco-valle-de-mexico.jpg");
}
```
