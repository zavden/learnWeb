---
example_description: "Un contenedor que solo tiene hijos flotantes mide 0 de alto: su fondo desaparece, su borde se queda en una línea y el texto siguiente se mete al lado"
example_tags: "css|float|bfc|flow-root|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ La tarjeta solo contiene flotantes: mide 0 de alto y el texto siguiente sube</p>
<div class="product">
  <img class="product-photo" src="bread.svg" alt="Hogaza de centeno" width="160" height="120">
  <p class="product-price">4,20 €</p>
</div>
<p class="after">Envío gratis a partir de 30 €.</p>

<p class="label">✅ Con <code>display: flow-root</code> la tarjeta crea un BFC y su altura incluye a los flotantes</p>
<div class="product is-fixed">
  <img class="product-photo" src="bread.svg" alt="Hogaza de centeno" width="160" height="120">
  <p class="product-price">4,20 €</p>
</div>
<p class="after">Envío gratis a partir de 30 €.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  clear: both;                     /* cada caso empieza por debajo de los flotantes del anterior */
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.product {
  max-width: 300px;
  padding: 6px;
  border: 3px solid #1d4ed8;
  background: #bfdbfe;
}

.product-photo {
  float: left;
  width: 88px;
  height: auto;
}

.product-price {
  float: right;
  margin: 0;
  font-size: 1.1rem;
  font-weight: bold;
}

.after {
  margin: 4px 0;
  padding: 2px 6px;
  background: #fde68a;
}

/* 🐛 Los flotantes están fuera del flujo, así que no cuentan para la altura de su padre.
   Si el padre SOLO tiene flotantes, su contenido mide 0: queda el relleno (12px) y el borde,
   la foto y el precio se salen por debajo, y el párrafo siguiente se coloca a su lado. */

/* ✅ Un BFC contiene a sus flotantes: su altura llega hasta el final del flotante más bajo.
   Es lo que la lección de overflow anunciaba con «la caja pasa a contener sus flotantes». */
.is-fixed {
  display: flow-root;
}
```
