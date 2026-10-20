---
example_description: "Un filter en una cabecera con foto de fondo desenfoca y oscurece también su texto, y ningún hijo puede deshacerlo; la foto filtrada va en un ::before detrás del contenido"
example_tags: "css|filtros|filter|blur|pseudoelementos|contexto-de-apilamiento|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>filter: blur(3px) brightness(0.4)</code> en la cabecera: el texto también se desenfoca</p>
<header class="hero is-broken">
  <h2>Valle de México</h2>
  <p>José María Velasco, 1877</p>
</header>

<p class="caption">✅ El mismo filtro en un <code>::before</code> que lleva la foto, detrás del texto</p>
<header class="hero is-fixed">
  <h2>Valle de México</h2>
  <p>José María Velasco, 1877</p>
</header>
<p class="credit">Pintura de dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.hero {
  max-width: 440px;
  padding: 36px 16px;
  color: #ffffff;
}

.hero h2 {
  margin: 0;
  font-size: 1.6rem;
}

.hero p {
  margin: 0;
  font-size: 0.9rem;
}

/* 🐛 filter procesa la imagen COMPLETA del elemento: su fondo, su borde y todo
   su contenido, hijos incluidos. El texto se desenfoca y se oscurece con la
   foto, y no hay nada que un hijo pueda hacer para «quitarse» el filtro
   (como pasaba con opacity en la lección de color). */
.is-broken {
  background: url("velasco-valle-de-mexico.jpg") center / cover;
  filter: blur(3px) brightness(0.4);
}

/* ✅ La foto va en una capa aparte, un ::before que llena la cabecera, y el
   filtro se aplica solo a esa capa. Con z-index: -1 queda detrás del texto;
   isolation: isolate crea un contexto de apilamiento en la cabecera para que
   ese -1 no se vaya detrás del fondo de la página (módulo de flujo y posición). */
.is-fixed {
  position: relative;
  isolation: isolate;
  overflow: hidden;                /* recorta el desenfoque que se sale */
  background: #1e293b;
}

.is-fixed::before {
  content: "";
  position: absolute;
  inset: -12px;                    /* más grande que la caja: el desenfoque
                                      aclara los bordes, y así quedan fuera */
  z-index: -1;
  background: url("velasco-valle-de-mexico.jpg") center / cover;
  /* brightness(0.4) convierte el blanco más puro en un gris de 102: el texto
     blanco tiene al menos 5.7:1 sobre cualquier zona de la foto. */
  filter: blur(3px) brightness(0.4);
}
```
