---
example_description: "Barra de navegación con flexbox: logo, enlaces en su propia fila flex y el carrito empujado a la derecha con margin-left: auto; con flex-wrap se reparte en dos líneas cuando no cabe"
example_tags: "css|flexbox|navegacion|margin-auto|flex-wrap|patrones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">En 440px: todo en una línea; el carrito, al final</p>
<header class="site-header">
  <a class="brand" href="/">
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20C4 9 11 4 20 4c0 9-5 16-16 16Zm0 0 9-9" fill="#bbf7d0" stroke="#14532d" stroke-width="2" stroke-linecap="round"/></svg>
    Vivero Xochi
  </a>
  <nav aria-label="Principal">
    <ul class="nav-links">
      <li><a href="/plantas" aria-current="page">Plantas</a></li>
      <li><a href="/macetas">Macetas</a></li>
      <li><a href="/talleres">Talleres</a></li>
    </ul>
  </nav>
  <a class="cart" href="/carrito">Carrito (2)</a>
</header>

<p class="label">En 300px: <code>flex-wrap</code> baja los enlaces a otra línea, y el margen automático sigue empujando el carrito dentro de su línea</p>
<header class="site-header is-narrow">
  <a class="brand" href="/">
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20C4 9 11 4 20 4c0 9-5 16-16 16Zm0 0 9-9" fill="#bbf7d0" stroke="#14532d" stroke-width="2" stroke-linecap="round"/></svg>
    Vivero Xochi
  </a>
  <nav aria-label="Principal, versión estrecha">
    <ul class="nav-links">
      <li><a href="/plantas" aria-current="page">Plantas</a></li>
      <li><a href="/macetas">Macetas</a></li>
      <li><a href="/talleres">Talleres</a></li>
    </ul>
  </nav>
  <a class="cart" href="/carrito">Carrito (2)</a>
</header>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

/* El borde discontinuo violeta marca los contenedores flex. */
.site-header,
.nav-links {
  outline: 2px dashed #7c3aed;
  outline-offset: 2px;
}

/* La barra: una fila que se puede partir. Todos centrados en vertical, aunque el logo
   y los enlaces tengan alturas distintas. gap: 8px entre líneas, 12px entre piezas. */
.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  max-width: 440px;
  padding: 8px 10px;
  background: #f0fdf4;
  font-size: 0.8rem;
}

.is-narrow {
  max-width: 300px;
}

/* inline-flex: el icono y el texto, centrados entre sí (lección 1). */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #14532d;
  font-weight: 800;
  text-decoration: none;
}

/* Los enlaces son una lista, y la lista es OTRO contenedor flex dentro de un elemento
   flex: los layouts flex se anidan sin problema. */
.nav-links {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links a {
  color: #14532d;
}

.nav-links a[aria-current="page"] {
  font-weight: bold;
  text-decoration-thickness: 2px;
}

/* El margen automático se queda con todo el espacio libre de su línea (lección 2).
   Si la barra se parte, actúa dentro de la línea en la que caiga el carrito. */
.cart {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 6px;
  background: #166534;
  color: #ffffff;
  text-decoration: none;
}

a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
