---
example_description: "Tres formas de que un contenedor encierre a sus flotantes: el clearfix clásico, overflow (que recorta la insignia) y display: flow-root"
example_tags: "css|float|clearfix|flow-root|overflow|bfc"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Clearfix: un <code>::after</code> con <code>clear: both</code> al final</p>
<div class="product clearfix">
  <span class="badge">Nuevo</span>
  <img class="product-photo" src="bread.svg" alt="Hogaza de espelta" width="160" height="120">
  <p class="product-price">5,10 €</p>
</div>

<p class="label">❌ <code>overflow: auto</code>: encierra los flotantes, pero recorta la insignia</p>
<div class="product is-overflow">
  <span class="badge">Nuevo</span>
  <img class="product-photo" src="bread.svg" alt="Hogaza de espelta" width="160" height="120">
  <p class="product-price">5,10 €</p>
</div>

<p class="label">✅ <code>display: flow-root</code>: encierra los flotantes y nada más</p>
<div class="product is-flow-root">
  <span class="badge">Nuevo</span>
  <img class="product-photo" src="bread.svg" alt="Hogaza de espelta" width="160" height="120">
  <p class="product-price">5,10 €</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 14px 0 12px;
  font-size: 0.8rem;
}

.product {
  max-width: 300px;
  padding: 6px;
  border: 3px solid #1d4ed8;
  background: #bfdbfe;
}

/* La insignia es un flotante que sobresale por arriba y por la derecha de la tarjeta
   gracias a sus márgenes negativos, como una pegatina. */
.badge {
  float: right;
  margin: -16px -16px 0 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
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

/* El CLEARFIX, el truco de la época de los layouts con float: un pseudoelemento vacío al
   final del contenedor que se coloca por debajo de todos los flotantes y estira al padre.
   Funciona, pero NO crea un BFC (los márgenes de los hijos aún pueden escaparse).
   Lo encontrarás en mucho código antiguo. */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

/* ❌ overflow distinto de visible crea un BFC… y recorta todo lo que sale del borde. */
.is-overflow {
  overflow: auto;
}

/* ✅ La forma moderna: un BFC sin efectos secundarios. */
.is-flow-root {
  display: flow-root;
}
```
