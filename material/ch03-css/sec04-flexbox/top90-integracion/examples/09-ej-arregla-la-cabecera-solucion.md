---
example_stage: final-solution
example_description: "Solución: flex-wrap en la cabecera y en su lista, margin-left: auto en «Entrar», flex-shrink: 0 en el icono y min-width: 0 en el campo"
example_tags: "css|solucion|flexbox|flex-wrap|margin-auto|flex-shrink|min-width"
console: true
---

# HTML

```html
<header class="site-header">
  <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">CA</span> Café Altura</a>
  <a class="login" href="/entrar">Entrar</a>
  <nav class="nav" aria-label="Principal">
    <ul class="nav-links">
      <li><a href="/menu">Menú</a></li>
      <li><a href="/cafe-en-grano">Café en grano</a></li>
      <li><a href="/cursos">Cursos de barismo</a></li>
      <li><a href="/sucursales">Sucursales</a></li>
    </ul>
  </nav>
</header>

<p class="notice"><span class="notice-icon" aria-hidden="true"></span><span>Envío gratis en pedidos desde 499 MXN a toda la zona metropolitana de Guadalajara.</span></p>

<form class="search" role="search" action="/buscar">
  <input type="search" name="q" aria-label="Buscar en la tienda" placeholder="Buscar café…">
  <button>Buscar</button>
</form>

<ul class="checklist">
  <li>La cabecera no se desborda: <output id="check-overflow">…</output></li>
  <li>«Entrar», al final de su línea: <output id="check-login">…</output></li>
  <li>El icono del aviso, de 24 × 24: <output id="check-icon">…</output></li>
  <li>El botón «Buscar», dentro del buscador: <output id="check-search">…</output></li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: 0.85rem;
}

a {
  color: #422006;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* La cabecera de un móvil de 340px de ancho. */
.site-header {
  display: flex;
  flex-wrap: wrap;           /* ✅ 1: el logo y «Entrar» en una línea; la navegación, en otra */
  align-items: center;
  gap: 8px 16px;
  max-width: 340px;
  padding: 8px 12px;
  border: 2px dashed #7c3aed;
  background: #fef3c7;
}


.brand {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  text-decoration: none;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #422006;
  color: #fef3c7;
  font-size: 0.7rem;
}

/* ✅ 2: el margen automático se queda con el espacio libre de la línea. */
.login {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 999px;
  background: #422006;
  color: #ffffff;
  text-decoration: none;
}

/* La navegación ocupa siempre una línea entera, debajo del logo y de «Entrar». */
.nav {
  flex-basis: 100%;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;           /* ✅ 1: los enlaces también se reparten en líneas */
  gap: 4px 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links a {
  white-space: nowrap;
}

.notice {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 340px;
  padding: 8px 12px;
  border: 2px dashed #7c3aed;
  background: #f0fdf4;
}

/* ✅ 3: width solo es la base; flex-shrink: 0 impide que encoja. */
.notice-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23166534' stroke-width='2' stroke-linejoin='round'%3E%3Cpath d='M2 6h12v10H2zM14 10h4l3 3v3h-7'/%3E%3C/svg%3E") center / contain no-repeat;
}

/* Un buscador en una columna lateral de 220px. */
.search {
  display: flex;
  gap: 6px;
  max-width: 220px;
  padding: 6px;
  border: 2px dashed #7c3aed;
}

.search input,
.search button {
  font: inherit;
  padding: 4px 8px;
}

/* ✅ 4: sin min-width: 0, el ancho por defecto del campo es su mínimo. */
.search input {
  flex: 1;
  min-width: 0;
}

.checklist {
  padding-left: 1.2em;
  color: #475569;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas y
// escribe ✅ o ❌ en la lista (y en la consola). No hace falta tocarlo: se vuelve a
// ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const box = (selector) => document.querySelector(selector).getBoundingClientRect();

const header = document.querySelector('.site-header');
const overflow = header.scrollWidth - header.clientWidth;
check('check-overflow', overflow <= 0, overflow <= 0 ? 'cabe en sus 340px' : `se sale ${overflow}px`);

const headerStyle = getComputedStyle(header);
const contentRight = box('.site-header').right - parseFloat(headerStyle.borderRightWidth) - parseFloat(headerStyle.paddingRight);
const loginGap = Math.round(contentRight - box('.login').right);
check('check-login', loginGap === 0, `a ${loginGap}px del borde derecho (objetivo: 0)`);

const icon = box('.notice-icon');
check('check-icon', Math.round(icon.width) === 24, `${icon.width.toFixed(1)} × ${icon.height.toFixed(1)}px`);

const searchOverflow = Math.round(box('.search button').right - (box('.search').right - 8));
check('check-search', searchOverflow <= 0, searchOverflow <= 0 ? 'dentro' : `se sale ${searchOverflow}px`);
```
