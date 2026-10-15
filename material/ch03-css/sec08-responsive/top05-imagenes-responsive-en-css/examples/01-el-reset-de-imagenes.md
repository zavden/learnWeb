---
example_description: "El reset de imágenes de casi todos los proyectos, línea a línea, en marcos de 160px: sin nada, la foto de 480px se sale; con max-width: 100% encoge pero se deforma (el atributo height sigue mandando); con height: auto recupera la proporción; con display: block desaparece el hueco de debajo"
example_tags: "css|responsive|imagenes|max-width|height-auto|display-block|reset"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">La misma foto (480 × 330, con sus atributos <code>width</code> y <code>height</code>) en cuatro marcos de 160px. El fondo amarillo es el marco.</p>
<div class="frames">
  <figure><div class="frame is-clipped"><img class="step-0" src="velasco-valle-de-mexico-480.jpg" alt="Valle de México, de José María Velasco" width="480" height="330"></div><figcaption>0. Sin reset: se sale (el marco la recorta)</figcaption></figure>
  <figure><div class="frame"><img class="step-1" src="velasco-valle-de-mexico-480.jpg" alt="" width="480" height="330"></div><figcaption>1. <code>max-width: 100%</code>: 160 de ancho, pero 330 de alto</figcaption></figure>
  <figure><div class="frame"><img class="step-2" src="velasco-valle-de-mexico-480.jpg" alt="" width="480" height="330"></div><figcaption>2. + <code>height: auto</code>: proporcionada, con un hueco debajo</figcaption></figure>
  <figure><div class="frame"><img class="step-3" src="velasco-valle-de-mexico-480.jpg" alt="" width="480" height="330"></div><figcaption>3. + <code>display: block</code>: sin hueco</figcaption></figure>
</div>
<p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 0 0 8px; font-size: 0.72rem; }
.frames { display: flex; flex-wrap: wrap; gap: 12px; align-items: start; }
figure { width: 160px; margin: 0; }
figcaption { margin-top: 4px; font-size: 0.68rem; }
.frame { background: #fde68a; outline: 1px solid #b45309; }
.is-clipped { overflow: clip; }

/* EL RESET, línea a línea (en un proyecto real va en un solo selector, img):

   max-width: 100%
     Nunca más ancha que su contenedor. (No width: 100%, que AGRANDARÍA las
     imágenes pequeñas hasta llenarlo y las vería borrosas.)
     Ojo: los atributos width="480" height="330" equivalen a width: 480px y
     height: 330px. max-width limita el ancho… y el alto se queda en 330. */
.step-1,
.step-2,
.step-3 { max-width: 100%; }

/* height: auto
     El alto sale del ancho y de la proporción. ¿Qué proporción, si la imagen
     aún no ha cargado? La de los atributos: el navegador los convierte en
     aspect-ratio: auto 480 / 330 y reserva el hueco exacto antes de la descarga
     (por eso conviene escribirlos siempre, lección de imágenes de HTML). */
.step-2,
.step-3 { height: auto; }

/* display: block
     Una imagen es inline: se apoya en la línea base y deja debajo el sitio de
     las letras con rabo (la g, la p). Como bloque, ya no hay línea. */
.step-3 { display: block; }
```
