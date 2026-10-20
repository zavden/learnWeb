---
example_description: "mask-image usa una imagen como máscara: donde la máscara es opaca el elemento se ve, donde es transparente desaparece, y en medio queda semitransparente. Con degradados: una foto que se funde con la página y una fila con scroll que se desvanece en los bordes"
example_tags: "css|mascaras|mask-image|degradados|scroll"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Una foto que se funde con el fondo de la página: <code>mask-image: linear-gradient(black 55%, transparent)</code></p>
<div class="page">
  <div class="cover"></div>
  <p class="cover-title">Valle de México</p>
</div>

<p class="caption">Una fila de etiquetas con scroll horizontal (desplázala): los bordes se desvanecen para avisar de que hay más</p>
<ul class="chips">
  <li>Paisaje</li><li>Siglo XIX</li><li>Óleo</li><li>Volcanes</li><li>Lago de Texcoco</li><li>Museo Nacional de Arte</li><li>Academia de San Carlos</li>
</ul>
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
  margin: 10px 0 6px;
  font-size: 0.72rem;
}

.page {
  max-width: 440px;
  padding-bottom: 8px;
  background: #fef3c7;
}

/* La máscara es una IMAGEN (aquí, un degradado) que se pone encima del
   elemento: lo que importa de ella es su transparencia (canal alfa).
   Opaco (black, o cualquier color opaco) → se ve. Transparente → no se ve.
   Hasta el 55 % de la altura, la foto se ve entera; después se desvanece y
   deja ver el fondo de la página, sea del color que sea. */
.cover {
  height: 170px;
  background: url("velasco-valle-de-mexico.jpg") center 30% / cover;
  mask-image: linear-gradient(black 55%, transparent);
}

.cover-title {
  margin: -24px 0 0 16px;
  position: relative;         /* encima de la foto (orden de pintado) */
  /* Contraste en el peor caso (un píxel negro al 31 % sobre el crema):
     3.8:1, suficiente para texto grande (20,8px en negrita pide 3:1). */
  color: #78350f;
  font-size: 1.3rem;
  font-weight: 700;
}

.chips {
  display: flex;
  gap: 8px;
  max-width: 440px;
  margin: 0;
  padding: 4px 32px;          /* la primera y la última empiezan fuera del desvanecido */
  box-sizing: border-box;
  overflow-x: auto;
  list-style: none;
  /* Transparente en los 32px de cada extremo, opaca en medio. La máscara se
     aplica a la caja del contenedor, no a su contenido: al desplazar, las
     etiquetas pasan por debajo de los bordes desvanecidos. */
  mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 32px), transparent);
}

.chips li {
  flex: none;
  padding: 6px 12px;
  border-radius: 999px;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.8rem;
}
```
