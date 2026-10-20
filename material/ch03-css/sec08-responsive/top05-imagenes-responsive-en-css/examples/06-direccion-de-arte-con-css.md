---
example_description: "Dirección de arte con CSS: la misma foto con otro encuadre según el sitio. aspect-ratio, object-fit: cover y object-position cambian dentro de una container query: un recorte vertical del cerro en un hueco estrecho y una franja panorámica del valle en uno ancho"
example_tags: "css|responsive|imagenes|aspect-ratio|object-fit|object-position|container-queries|direccion-de-arte"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">La misma portada de exposición en un hueco de 200px y en uno de 440px. Por debajo de 22rem (352px), recorte vertical 4:5 centrado en el cerro; desde 22rem, franja panorámica 21:9 del valle.</p>
<div class="slots">
  <div class="hero-slot" style="width: 200px">
    <figure class="hero"><img src="velasco-valle-de-mexico.jpg" alt="Valle de México: un cerro en primer plano y el valle con sus lagos al fondo" width="960" height="660"><figcaption>Velasco y el Valle de México · MUNAL</figcaption></figure>
  </div>
  <div class="hero-slot" style="width: 440px">
    <figure class="hero"><img src="velasco-valle-de-mexico.jpg" alt="Valle de México: un cerro en primer plano y el valle con sus lagos al fondo" width="960" height="660"><figcaption>Velasco y el Valle de México · MUNAL</figcaption></figure>
  </div>
</div>
<p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 0 0 8px; font-size: 0.72rem; }
.slots { display: grid; gap: 12px; }
.hero-slot { container-type: inline-size; max-width: 100%; }
.hero { margin: 0; }
.hero figcaption { padding: 4px 0; font-size: 0.75rem; font-weight: 700; }

/* Mobile-first: un recorte vertical. La foto mide 3:2 (más o menos): con
   4:5 sobra mucho ancho, y object-position elige quedarse con el cerro, que
   está hacia el 25 % desde la izquierda. */
.hero img {
  display: block;
  width: 100%;
  height: auto;                  /* imprescindible: si no, el atributo height manda */
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 25% 50%;
}

/* Con sitio: una franja panorámica. Ahora sobra alto, y 60% en vertical
   quita casi todo el cielo y deja el valle con el lago. */
@container (width >= 22rem) {
  .hero img {
    aspect-ratio: 21 / 9;
    object-position: 50% 60%;
  }
}

/* ¿Y <picture> (lección de imágenes de HTML)? Hace falta cuando el móvil
   necesita OTRO ARCHIVO: otro encuadre fotografiado aparte, o un archivo más
   ligero. Aquí los dos huecos descargan la misma foto de 960px; recortar con
   CSS no ahorra bytes. */
```
