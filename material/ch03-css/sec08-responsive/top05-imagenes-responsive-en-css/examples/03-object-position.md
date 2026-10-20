---
example_description: "Con object-fit: cover, object-position elige qué parte de la imagen se queda al recortar (como background-position): en una franja ancha, el casco de Aldrin en lugar de sus piernas; en una columna estrecha, el monte Fuji en lugar del centro vacío"
example_tags: "css|responsive|imagenes|object-position|object-fit|recorte"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Franja de 440 × 110 con <code>cover</code>. Por defecto, <code>object-position: 50% 50%</code>: el centro</p>
<img class="banner" src="aldrin-apolo-11-480.jpg" alt="Buzz Aldrin en la Luna, recortado a la altura de las piernas" width="480" height="483">
<p class="label">✅ <code>object-position: 50% 6%</code>: casi arriba del todo, donde está el casco</p>
<img class="banner is-helmet" src="aldrin-apolo-11-480.jpg" alt="Buzz Aldrin en la Luna, con el reflejo de su visor" width="480" height="483">

<div class="columns">
  <figure><img class="column" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, el centro" width="480" height="323"><figcaption>Columna de 120 × 200, al centro</figcaption></figure>
  <figure><img class="column is-wave" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, la cresta" width="480" height="323"><figcaption><code>15% 50%</code>: la cresta</figcaption></figure>
  <figure><img class="column is-fuji" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, el monte Fuji" width="480" height="323"><figcaption><code>68% 50%</code>: el Fuji</figcaption></figure>
</div>
<p class="credit">NASA, Apolo 11, 1969; Katsushika Hokusai, c. 1831. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.label, .credit { margin: 8px 0 4px; font-size: 0.72rem; }
img { display: block; object-fit: cover; }

/* La foto (480 × 483) escalada para cubrir 440px de ancho mide 440 × 443:
   sobran 333px de alto. object-position reparte ese sobrante: 50% deja la
   mitad arriba y la mitad abajo; 6%, casi nada arriba. */
.banner { width: 440px; max-width: 100%; height: 110px; }
.is-helmet { object-position: 50% 6%; }

.columns { display: flex; gap: 10px; margin-top: 8px; }
figure { margin: 0; }
figcaption { width: 120px; margin-top: 4px; font-size: 0.65rem; }

/* En horizontal: la lámina escalada a 200px de alto mide 297 de ancho y
   sobran 177px. Los porcentajes funcionan como en background-position: 0%
   alinea el borde izquierdo, 100% el derecho, 68% deja a la vista el Fuji. */
.column { width: 120px; height: 200px; }
.is-wave { object-position: 15% 50%; }
.is-fuji { object-position: 68% 50%; }
```
