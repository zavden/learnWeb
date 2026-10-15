---
example_description: "Una galería de 1, 2 o 3 columnas (media queries a 28rem y 50rem) cuyo atributo sizes describe exactamente ese layout, para que el navegador elija entre la foto de 480 y la de 960px; miniaturas iguales con aspect-ratio, object-fit y el punto de interés de cada obra en --focus"
example_tags: "css|responsive|integracion|srcset|sizes|media-queries|object-fit|object-position|galeria"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">A 480px: dos columnas de unos 230px; con una pantalla de densidad 2 hacen falta unos 460 píxeles, y basta el archivo de 480. Estrecha la vista previa por debajo de 28rem (448px): una columna, y el navegador pide el de 960. (Al volver a ensanchar se queda con el grande: ya lo tiene.)</p>
<ul class="gallery">
  <li><figure><img src="hokusai-gran-ola-480.jpg" srcset="hokusai-gran-ola-480.jpg 480w, hokusai-gran-ola.jpg 960w" sizes="(width >= 50rem) 33vw, (width >= 28rem) 50vw, 100vw" alt="La gran ola de Kanagawa" width="480" height="323" style="--focus: 30% 50%"><figcaption>Hokusai, <cite>La gran ola</cite>, c. 1831 · <output></output></figcaption></figure></li>
  <li><figure><img src="velasco-valle-de-mexico-480.jpg" srcset="velasco-valle-de-mexico-480.jpg 480w, velasco-valle-de-mexico.jpg 960w" sizes="(width >= 50rem) 33vw, (width >= 28rem) 50vw, 100vw" alt="Valle de México" width="480" height="330" style="--focus: 28% 55%"><figcaption>Velasco, <cite>Valle de México</cite>, 1877 · <output></output></figcaption></figure></li>
  <li><figure><img src="tierra-apolo-17-480.jpg" srcset="tierra-apolo-17-480.jpg 480w, tierra-apolo-17.jpg 960w" sizes="(width >= 50rem) 33vw, (width >= 28rem) 50vw, 100vw" alt="La Tierra vista desde el Apolo 17" width="480" height="480" style="--focus: 50% 50%"><figcaption>NASA, Apolo 17, 1972 · <output></output></figcaption></figure></li>
  <li><figure><img src="aldrin-apolo-11-480.jpg" srcset="aldrin-apolo-11-480.jpg 480w, aldrin-apolo-11.jpg 960w" sizes="(width >= 50rem) 33vw, (width >= 28rem) 50vw, 100vw" alt="Buzz Aldrin en la Luna" width="480" height="483" style="--focus: 50% 15%"><figcaption>NASA, Apolo 11, 1969 · <output></output></figcaption></figure></li>
</ul>
<p class="caption">Todas las obras son de dominio público.</p>
```

# CSS

```css
body { margin: 8px; font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption { margin: 0 0 8px; font-size: 0.72rem; }

/* El layout y sizes cuentan la MISMA historia: 100vw, 50vw, 33vw. Si el CSS
   cambia, sizes también. (Los números son aproximados: el margen del body y
   los huecos no cuentan; al navegador le basta una estimación.) */
.gallery { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }

@media (width >= 28rem) {
  .gallery { grid-template-columns: repeat(2, 1fr); }
}

@media (width >= 50rem) {
  .gallery { grid-template-columns: repeat(3, 1fr); }
}

figure { margin: 0; }
figcaption { margin-top: 4px; font-size: 0.7rem; }
figcaption output { color: #475569; }

/* Miniaturas iguales (lección 5): caja 4:3 y la obra recortada en torno a
   su punto de interés. */
.gallery img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: var(--focus, 50% 50%);
  border-radius: 6px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript (capítulos 5 y 6). Escribe en cada pie el archivo que
// eligió el navegador (currentSrc) y lo actualiza cuando cambia.
for (const img of document.querySelectorAll('.gallery img')) {
  const output = img.closest('figure').querySelector('output');
  const show = () => { output.textContent = img.currentSrc.split('/').pop(); };
  img.addEventListener('load', show);
  if (img.complete) show();
}
```
