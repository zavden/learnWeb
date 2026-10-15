---
example_description: "image-set() es el srcset de los fondos: ofrece varias versiones de una imagen con su densidad (1x, 2x) y el navegador elige según la pantalla. Dos archivos rotulados enseñan cuál eligió; debajo, una portada con la foto de 480 y la de 960px"
example_tags: "css|responsive|imagenes|image-set|background-image|densidad|resolution"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Tu pantalla, según <code>@media (resolution)</code>: <strong class="density"></strong>. La caja de abajo tiene de fondo <code>image-set()</code> con dos archivos rotulados: el rótulo dice cuál ha elegido el navegador.</p>
<div class="which-file" role="img" aria-label="El archivo que eligió image-set()"></div>

<p class="caption">En la práctica, dos versiones de la misma foto: 480px para pantallas de densidad 1, 960px para las de densidad 2 (un Mac, casi cualquier móvil).</p>
<section class="hero">
  <h2>Velasco y el Valle de México</h2>
  <p>Museo Nacional de Arte · del 4 de noviembre al 15 de marzo</p>
</section>
<p class="credit">Fondo: José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 8px 0 4px; font-size: 0.72rem; }

/* La densidad, preguntada con una media query (1x = 1 píxel de pantalla por
   píxel CSS; 2x = 2 × 2). dppx («puntos por px») y x son la misma unidad. */
.density::after { content: "densidad 1 (1x)"; }
@media (resolution >= 2dppx) { .density::after { content: "densidad 2 o más (2x)"; } }

/* image-set(archivo densidad, archivo densidad, …): el navegador elige el
   que mejor encaja con la pantalla. En la vida real serían dos fotos; aquí
   son dos SVG con un rótulo, para que veas cuál cargó. */
.which-file {
  width: 240px;
  aspect-ratio: 3 / 1;
  background-image: image-set("density-1x.svg" 1x, "density-2x.svg" 2x);
  background-size: cover;
  outline: 1px solid #94a3b8;
}

/* La portada: un velo oscuro encima (lección de degradados) y la foto en dos
   densidades. La primera declaración es la reserva para navegadores que no
   entiendan image-set() (ejemplo siguiente). También se puede ofrecer el
   formato: image-set("foto.avif" type("image/avif"), "foto.jpg" type("image/jpeg")). */
.hero {
  padding: 48px 16px 16px;
  color: #ffffff;
  background-image:
    linear-gradient(transparent, rgb(15 23 42 / 0.8) 45%),
    url("velasco-valle-de-mexico-480.jpg");
  background-image:
    linear-gradient(transparent, rgb(15 23 42 / 0.8) 45%),
    image-set("velasco-valle-de-mexico-480.jpg" 1x, "velasco-valle-de-mexico.jpg" 2x);
  background-size: cover;
  background-position: 50% 40%;
}

.hero h2 { margin: 0 0 4px; font-size: 1.3rem; }
.hero p { margin: 0; font-size: 0.8rem; }
```
