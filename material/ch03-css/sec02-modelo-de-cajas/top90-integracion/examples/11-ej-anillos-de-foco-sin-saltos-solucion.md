---
example_stage: final-solution
example_description: "Solución: bordes reservados que solo cambian de color, outline con offset (también negativo) y anillos e hundimientos con box-shadow, que no ocupan espacio"
example_tags: "css|solucion|outline|box-shadow|foco|accesibilidad"
---

# HTML

```html
<nav class="tabs" aria-label="Secciones de tu cuenta">
  <a class="tab" href="#" aria-current="page">Resumen</a>
  <a class="tab" href="#">Pedidos</a>
  <a class="tab" href="#">Direcciones</a>
  <a class="tab" href="#">Métodos de pago</a>
</nav>

<form class="search" role="search">
  <label for="order-search">Buscar un pedido</label>
  <input id="order-search" type="search" placeholder="Número de pedido o producto">
  <button class="search-button" type="button">Buscar</button>
</form>

<ul class="orders" aria-label="Pedidos recientes">
  <li><a href="#">Pedido 2026-1184 · Entregado el 9 de noviembre</a></li>
  <li><a href="#">Pedido 2026-1177 · En camino</a></li>
  <li><a href="#">Pedido 2026-1150 · Devuelto</a></li>
</ul>

<p class="hint">Pasa el ratón por «Pedidos» y mira las pestañas de su derecha. Después recorre la página con <kbd>Tab</kbd>, pulsa el botón y fíjate en la lista de pedidos.</p>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.tabs {
  margin-bottom: 1rem;
}

/* ✅ 1: el borde existe siempre (transparente): todas las pestañas miden lo mismo
   y en :hover solo cambia el color. */
.tab {
  display: inline-block;
  margin: 0 0.25rem 0.5rem 0;
  padding: 0.4rem 0.9rem;
  border: 2px solid transparent;
  border-radius: 999px;
  color: #334155;
  text-decoration: none;
}

.tab:hover,
.tab[aria-current="page"] {
  border-color: #1d4ed8;
  color: #1d4ed8;
}

.tab[aria-current="page"] {
  background: #eff6ff;
}

/* ✅ 2: outline se dibuja por fuera del borde y no ocupa sitio (lección 1).
   :focus-visible lo muestra al usar el teclado, no al hacer clic con el ratón. */
.tab:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.search {
  max-width: 28rem;
  margin-bottom: 1.5rem;
}

.search label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

.search input {
  display: inline-block;
  width: 70%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #64748b;
  border-radius: 8px;
  font: inherit;
}

/* ✅ 3: el borde solo cambia de color y el anillo es una sombra de extensión.
   El outline transparente no se ve… salvo en el modo de alto contraste de Windows,
   que elimina las sombras y pinta los outline con un color del sistema. */
.search input:focus {
  outline: 2px solid transparent;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px #93c5fd, 0 0 0 5px #1d4ed8;   /* claro por dentro, oscuro por fuera: contraste sobre cualquier fondo */
}

.search-button {
  padding: 0.5rem 1rem;
  border: 1px solid #1d4ed8;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.search-button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* ✅ 4: la sombra inset oscurece el borde de arriba por dentro: parece hundido
   y la caja no se mueve. */
.search-button:active {
  box-shadow: inset 0 3px 5px rgb(15 23 42 / 0.45);
}

/* La lista recorta su contenido para que las filas respeten las esquinas redondeadas */
.orders {
  max-width: 28rem;
  margin: 0 0 1rem;
  padding: 0;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  list-style: none;
}

.orders a {
  display: block;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
  text-decoration: none;
}

.orders a:hover {
  background: #f1f5f9;
}

/* ✅ 5: con outline-offset negativo el anillo se dibuja DENTRO de la fila,
   donde el overflow de la lista ya no lo recorta (lección 5). */
.orders a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

.hint {
  max-width: 28rem;
  color: #475569;
}
```
