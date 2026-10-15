---
example_description: "Por defecto, una máscara de CSS mira la transparencia, no el color: un degradado de blanco a negro es opaco de punta a punta y no oculta nada. Se usa un degradado hacia transparent, o mask-mode: luminance para que el blanco muestre y el negro oculte"
example_tags: "css|mascaras|mask-image|mask-mode|luminance|alfa|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">La estampa debería desvanecerse hacia la derecha. Debajo de cada una, su máscara.</p>
<ul class="grid">
  <li>
    <div class="print is-white-black"></div>
    ❌ <code>linear-gradient(to right, white, black)</code>: como en una máscara de capa de Photoshop… y no pasa nada
  </li>
  <li>
    <div class="print is-alpha"></div>
    ✅ <code>linear-gradient(to right, black, transparent)</code>: lo que cuenta es el alfa
  </li>
  <li>
    <div class="print is-luminance"></div>
    ✅ El degradado blanco-negro con <code>mask-mode: luminance</code>: el blanco muestra, el negro oculta
  </li>
</ul>
<p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #e0f2fe;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.caption,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.print {
  height: 135px;
  margin-bottom: 4px;
  background: url("hokusai-gran-ola.jpg") center / cover;
}

/* 🐛 mask-mode vale match-source: con una imagen o un degradado, la máscara se
   lee en modo ALFA. Blanco y negro son los dos opacos (alfa 1): la máscara
   deja ver todo, igual que si no estuviera. */
.is-white-black {
  mask-image: linear-gradient(to right, white, black);
}

/* ✅ En modo alfa, el color da igual: «black» es la costumbre para decir
   «opaco». Lo que oculta es transparent. */
.is-alpha {
  mask-image: linear-gradient(to right, black, transparent);
}

/* ✅ mask-mode: luminance lee la LUZ de la máscara: blanco = se ve,
   negro = no se ve, gris = a medias. Es el modelo de las máscaras de capa de
   los programas de retoque (y el de los <mask> de SVG). */
.is-luminance {
  mask-image: linear-gradient(to right, white, black);
  mask-mode: luminance;
}
```
