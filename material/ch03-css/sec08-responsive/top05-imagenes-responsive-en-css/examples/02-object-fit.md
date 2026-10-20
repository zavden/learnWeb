---
example_description: "object-fit decide cómo se coloca la imagen dentro de la caja del <img> cuando sus proporciones no coinciden: fill (estira), contain (cabe entera), cover (llena y recorta), none (tamaño natural) y scale-down"
example_tags: "css|responsive|imagenes|object-fit|cover|contain"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">La misma lámina (480 × 323, apaisada) en cinco cajas cuadradas de 110 × 110. El fondo gris es la caja del <code>&lt;img&gt;</code>.</p>
<div class="grid">
  <figure><img class="fit-fill" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, deformada" width="480" height="323"><figcaption><code>fill</code> (inicial): estirada</figcaption></figure>
  <figure><img class="fit-contain" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, entera" width="480" height="323"><figcaption><code>contain</code>: entera, con bandas</figcaption></figure>
  <figure><img class="fit-cover" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, recortada" width="480" height="323"><figcaption><code>cover</code>: llena, recorta los lados</figcaption></figure>
  <figure><img class="fit-none" src="hokusai-gran-ola-480.jpg" alt="Un fragmento de La gran ola de Kanagawa" width="480" height="323"><figcaption><code>none</code>: a 480px, se ve el centro</figcaption></figure>
  <figure><img class="fit-scale-down" src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa, entera" width="480" height="323"><figcaption><code>scale-down</code>: el menor de <code>none</code> y <code>contain</code></figcaption></figure>
</div>
<p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 0 0 8px; font-size: 0.72rem; }
.grid { display: flex; flex-wrap: wrap; gap: 10px; }
figure { width: 110px; margin: 0; }
figcaption { margin-top: 4px; font-size: 0.65rem; }

/* La CAJA del <img> mide 110 × 110 (la decide el CSS). La IMAGEN de dentro
   es 480 × 323. object-fit dice cómo encajar la segunda en la primera, como
   background-size hace con un fondo (cover y contain significan lo mismo). */
img {
  display: block;
  width: 110px;
  height: 110px;
  background: #cbd5e1;
}

.fit-fill { object-fit: fill; }             /* se estira a 110 × 110 */
.fit-contain { object-fit: contain; }       /* 110 × 74: bandas arriba y abajo */
.fit-cover { object-fit: cover; }           /* 164 × 110: se recortan unos 27px por lado */
.fit-none { object-fit: none; }             /* 480 × 323, centrada: solo el centro */
.fit-scale-down { object-fit: scale-down; } /* más grande que la caja: como contain */
```
