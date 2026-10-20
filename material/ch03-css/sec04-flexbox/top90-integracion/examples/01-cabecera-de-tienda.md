---
example_description: "La cabecera de una tienda: logo rígido, buscador que ocupa lo que sobra, cuenta y carrito empujados a la derecha, y una barra de categorías que se reparte en varias líneas"
example_tags: "css|flexbox|cabecera|flex-wrap|margin-auto|min-width|formularios"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<header class="site-header">
  <div class="topbar">
    <a class="brand" href="/">
      <svg class="brand-icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20C4 9 11 4 20 4c0 9-5 16-16 16Zm0 0 9-9" fill="#bbf7d0" stroke="#14532d" stroke-width="2" stroke-linecap="round"/></svg>
      Xochi
    </a>
    <form class="search" role="search" action="/buscar">
      <input class="search-input" type="search" name="q" aria-label="Buscar plantas" placeholder="Buscar plantas…">
      <button class="search-button">Buscar</button>
    </form>
    <nav class="account" aria-label="Tu cuenta">
      <a href="/entrar">Entrar</a>
      <a class="cart" href="/carrito" aria-label="Carrito, 3 productos">Carrito <span class="cart-count" aria-hidden="true">3</span></a>
    </nav>
  </div>
  <nav class="categories" aria-label="Categorías">
    <ul>
      <li><a href="/plantas/interior" aria-current="page">Interior</a></li>
      <li><a href="/plantas/exterior">Exterior</a></li>
      <li><a href="/suculentas">Suculentas</a></li>
      <li><a href="/macetas">Macetas</a></li>
      <li><a href="/herramientas">Herramientas</a></li>
      <li class="deals"><a href="/ofertas">Ofertas −20 %</a></li>
    </ul>
  </nav>
</header>

<main class="page">
  <h1>Plantas de interior</h1>
  <p>↔ Estrecha la vista previa (o ábrela con ↗ y cambia el ancho de la ventana): la cuenta y el carrito bajan a otra línea sin salirse de la derecha, y el buscador nunca empuja nada fuera.</p>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

a {
  color: inherit;
}

a:focus-visible,
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.site-header {
  border-bottom: 1px solid #cbd5e1;
  background: #f0fdf4;
  font-size: 0.85rem;
}

/* Fila 1: tres piezas. Si no caben, se parten en líneas (lección 1) en lugar de
   aplastarse. gap: 8px entre líneas y 16px entre piezas. */
.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  padding: 8px 12px;
}

/* El logo: inline-flex para centrar icono y texto (lección 1) y rígido (lección 4). */
.brand {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  color: #14532d;
  font-size: 1.05rem;
  font-weight: 800;
  text-decoration: none;
}

/* El buscador es a la vez elemento flex de la fila y contenedor flex de su campo y
   su botón. Base de 10rem: crece con todo lo que sobre (lección 3). */
.search {
  display: flex;
  flex: 1 1 10rem;
  min-width: 0;
}

/* El campo se queda con lo que deje el botón; min-width: 0 le permite bajar de su
   ancho por defecto (lección 5). */
.search-input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-right: 0;
  border-radius: 6px 0 0 6px;
  font: inherit;
}

.search-button {
  padding: 6px 12px;
  border: 1px solid #166534;
  border-radius: 0 6px 6px 0;
  background: #166534;
  color: #ffffff;
  font: inherit;
}

/* Cuenta y carrito: empujados al final de la línea en la que caigan (lección 2). */
.account {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.cart {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* La cifra, centrada en un círculo que crece con ella (patrón de centrado). */
.cart-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: bold;
}

/* Fila 2: las categorías. Se parten en varias líneas con el mismo gap y «Ofertas»
   se queda siempre al final de su línea. */
.categories ul {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0;
  padding: 0 12px 8px;
  list-style: none;
}

.categories a {
  text-decoration: none;
}

.categories a[aria-current="page"] {
  font-weight: bold;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.deals {
  margin-left: auto;
}

.deals a {
  color: #b91c1c;
  font-weight: bold;
}

.page {
  padding: 4px 12px;
  font-size: 0.85rem;
}

.page h1 {
  font-size: 1.3rem;
}
```
