---
example_description: "image-set() no acepta los descriptores w de srcset: image-set(\"a.jpg\" 480w, …) es inválido, la declaración entera se ignora y la caja se queda sin fondo. Un background-image de reserva antes salva la foto; las densidades 1x/2x son la forma correcta"
example_tags: "css|responsive|imagenes|image-set|srcset|reserva|cascada|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ Copiado de un <code>srcset</code>: <code>image-set("…-480.jpg" 480w, "….jpg" 960w)</code>. Sin fondo.</p>
<div class="banner is-broken"><span>Valle de México</span></div>

<p class="label">❌ Lo mismo, con un <code>background-image</code> de reserva antes: al menos se ve la foto (la de 480px, también en pantallas 2x)</p>
<div class="banner is-broken-with-fallback"><span>Valle de México</span></div>

<p class="label">✅ Reserva + <code>image-set()</code> con densidades: <code>1x</code> y <code>2x</code></p>
<div class="banner is-fixed"><span>Valle de México</span></div>
<p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.label, .credit { margin: 8px 0 4px; font-size: 0.72rem; }

.banner {
  display: flex;
  align-items: end;
  height: 90px;
  padding: 8px;
  background-color: #e2e8f0;      /* el color: lo único que queda si falla la imagen */
  background-size: cover;
  background-position: 50% 45%;
}

.banner span { padding: 2px 8px; border-radius: 4px; background: rgb(15 23 42 / 0.85); color: #ffffff; font-size: 0.8rem; }

/* 🐛 image-set() solo entiende DENSIDADES (1x, 2x, 2dppx…), no anchos. El
   descriptor 480w de srcset no existe aquí: la función es inválida, y una
   declaración inválida se ignora ENTERA, en silencio (como cualquier CSS que el
   navegador no entiende). Queda el color de fondo. */
.is-broken {
  background-image: image-set("velasco-valle-de-mexico-480.jpg" 480w, "velasco-valle-de-mexico.jpg" 960w);
}

/* La cascada como red: si la segunda declaración se ignora, queda la primera.
   Es la misma reserva que protege a los navegadores que no conocen image-set(). */
.is-broken-with-fallback {
  background-image: url("velasco-valle-de-mexico-480.jpg");
  background-image: image-set("velasco-valle-de-mexico-480.jpg" 480w, "velasco-valle-de-mexico.jpg" 960w);
}

/* ✅ La reserva, y después image-set() con densidades. Para elegir por ANCHO
   (un archivo para la columna estrecha, otro para la ancha) se usan media o
   container queries con distintos background-image, o un <img> con srcset y
   sizes. */
.is-fixed {
  background-image: url("velasco-valle-de-mexico-480.jpg");
  background-image: image-set("velasco-valle-de-mexico-480.jpg" 1x, "velasco-valle-de-mexico.jpg" 2x);
}
```
