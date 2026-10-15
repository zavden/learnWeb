---
exercise: true
exercise_title: "Arregla los anillos de foco que mueven el diseño"
exercise_instructions: "Reserva desde el principio el borde de 2px de las pestañas (transparente) y cambia solo su color en :hover y en la pestaña actual (TODO 1) || Devuelve a las pestañas un foco visible con outline y outline-offset (TODO 2) || Marca el foco del buscador con un anillo de box-shadow en lugar de engordar el borde (TODO 3) || Hunde el botón al pulsarlo con una sombra inset en lugar de con un margen (TODO 4) || Haz que el anillo de foco de los pedidos no quede recortado por el overflow de la lista (TODO 5) || Recorre la página con Tab y pasa el ratón: nada debe moverse"
exercise_hints: "Un borde transparente ocupa su sitio aunque no se vea || outline-offset separa el anillo de la caja; con un valor negativo lo mete dentro || Una sombra con extensión y sin desenfoque (0 0 0 3px) es un anillo que no ocupa espacio || Si quitas el outline, deja uno transparente: en el modo de alto contraste de Windows las sombras desaparecen y el outline transparente se vuelve visible"
exercise_solution_example: 11-ej-anillos-de-foco-sin-saltos-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: pestañas que saltan en hover, focos eliminados, un borde que engorda, anillos recortados por overflow y un botón que se hunde con margin; todo se arregla con outline y box-shadow"
example_tags: "css|ejercicio|outline|box-shadow|foco|accesibilidad"
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

/* TODO 1: al pasar el ratón, la pestaña gana un borde de 2px: crece 4px a lo ancho
   y empuja a todas las de su derecha. Reserva el borde desde el principio
   (transparente) y cambia solo su color. */
.tab {
  display: inline-block;
  margin: 0 0.25rem 0.5rem 0;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  color: #334155;
  text-decoration: none;
}

.tab:hover,
.tab[aria-current="page"] {
  border: 2px solid #1d4ed8;
  color: #1d4ed8;
}

.tab[aria-current="page"] {
  background: #eff6ff;
}

/* TODO 2: quitar el outline deja a quien usa el teclado sin saber dónde está.
   Sustitúyelo por un anillo visible que no ocupe sitio. */
.tab:focus {
  outline: none;
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

/* TODO 3: el borde pasa de 1px a 3px y el campo, el botón y lo de debajo saltan.
   Deja el borde como está y dibuja el anillo con box-shadow. */
.search input:focus {
  outline: none;
  border: 3px solid #1d4ed8;
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

/* TODO 4: un margen superior al pulsar «hunde» el botón… y baja toda la línea.
   Usa una sombra inset en su lugar. */
.search-button:active {
  margin-top: 3px;
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

/* TODO 5: overflow: hidden recorta este anillo en los bordes de la lista.
   Haz que se dibuje por dentro de cada fila. */
.orders a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.hint {
  max-width: 28rem;
  color: #475569;
}
```
