---
example_description: "container-type: size contiene el tamaño en los dos ejes: sin un alto explícito, el contenedor mide 0 de alto y su contenido se derrama sobre lo que viene después. Para preguntar solo por el ancho, inline-size; size, solo con un alto fijado (y entonces cqb funciona)"
example_tags: "css|responsive|container-queries|container-type|size|cqb|contencion|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="label">❌ <code>container-type: size</code> sin alto: el banner (borde morado) mide 0px de alto y su texto pisa el párrafo siguiente</p>
<section class="banner is-size"><h3>Venta de otoño</h3><p>Hasta 40 % en macetas de barro</p></section>
<p class="next">Párrafo siguiente: las ofertas terminan el 2 de noviembre.</p>

<p class="label">✅ <code>container-type: inline-size</code>: el alto sale del contenido, como siempre</p>
<section class="banner is-inline-size"><h3>Venta de otoño</h3><p>Hasta 40 % en macetas de barro</p></section>
<p class="next">Párrafo siguiente: las ofertas terminan el 2 de noviembre.</p>

<p class="label">✅ <code>container-type: size</code> con <code>block-size: 7rem</code>: ahora el título puede medirse en <code>cqb</code> (el 28 % del alto)</p>
<section class="banner is-size has-height"><h3>Venta de otoño</h3><p>Hasta 40 % en macetas de barro</p></section>
<p class="next">Párrafo siguiente: las ofertas terminan el 2 de noviembre.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.label { margin: 12px 0 4px; font-size: 0.72rem; }

.banner {
  padding: 0 12px;
  outline: 2px solid #7c3aed;
  background: #ffedd5;
}

.banner h3 { margin: 0; padding-top: 8px; color: #9a3412; }
.banner p { margin: 0; padding-bottom: 8px; font-size: 0.85rem; }
.next { margin: 0; padding: 4px 8px; background: #e2e8f0; font-size: 0.8rem; }

/* 🐛 size = contención de tamaño en los DOS ejes: el alto también se calcula
   como si el contenedor estuviera vacío. Sin un height, mide 0 (más su
   relleno, aquí ninguno) y lo de dentro se desborda. */
.is-size { container-type: size; }

/* ✅ La mayoría de las veces solo importa el ancho. */
.is-inline-size { container-type: inline-size; }

/* ✅ size tiene sentido cuando el alto ya está fijado desde fuera (una
   portada de 7rem, un panel de alto fijo): entonces cqb (y las consultas de
   alto, @container (height > …)) tienen algo que medir. */
.has-height { block-size: 7rem; }
.has-height h3 { font-size: 28cqb; }      /* 28 % de 112px ≈ 31px */
```
