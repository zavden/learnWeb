---
exercise: true
exercise_title: "Arregla la cabecera del móvil"
exercise_instructions: "La cabecera y su lista de enlaces se salen por la derecha: haz que se repartan en varias líneas (TODO 1) || Lleva «Entrar» al final de su línea; justify-self no funciona (TODO 2) || El icono del camión del aviso sale estrecho: que no encoja nunca (TODO 3) || En el buscador de 220px, el botón se sale: deja que el campo encoja (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "Un contenedor flex es de una sola línea hasta que se le dice lo contrario. La lista de enlaces es otro contenedor flex, con su propia línea || En el eje principal no hay alineación individual: un margen automático se queda con el espacio libre || width: 24px solo es la base; el factor que decide si un elemento encoge es otro || Un campo de texto tiene un ancho por defecto, y para flexbox ese ancho es su contenido"
exercise_solution_example: 09-ej-arregla-la-cabecera-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una cabecera de móvil con cuatro errores de flexbox (sin wrap, justify-self, un icono que encoge y un campo que no encoge) que un pequeño script comprueba en directo"
example_tags: "css|ejercicio|flexbox|flex-wrap|margin-auto|flex-shrink|min-width"
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
  align-items: center;
  gap: 8px 16px;
  max-width: 340px;
  padding: 8px 12px;
  border: 2px dashed #7c3aed;
  background: #fef3c7;
}

/* TODO 1: la cabecera y su lista de enlaces son de una sola línea. Como los enlaces
   no se parten (nowrap), todo se sale por la derecha. Deja que las DOS se repartan
   en varias líneas. */

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

/* TODO 2: «Entrar» debería ir al final de su línea, pero justify-self se ignora en
   un elemento flex. Cámbialo por lo que sí funciona. */
.login {
  justify-self: end;
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

/* TODO 3: el icono mide 24 × 24, pero el texto largo lo hace encoger. */
.notice-icon {
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

/* TODO 4: el campo ocupa lo que deja el botón… pero no baja de su ancho por defecto,
   y en 220px el botón se sale. */
.search input {
  flex: 1;
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
