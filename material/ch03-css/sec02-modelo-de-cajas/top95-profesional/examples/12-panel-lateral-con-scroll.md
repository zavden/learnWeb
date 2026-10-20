---
example_description: "Un panel lateral de filtros pegado a la derecha con margin-inline-start: auto: cabecera y pie siempre visibles porque solo el cuerpo tiene scroll, grupos plegables, campos al 48 % y muestras de color redondas con un anillo de box-shadow"
example_tags: "css|profesional|overflow|scrollbar-gutter|formularios|margin"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="page">
  <p class="page-context">Resultados de búsqueda: <strong>«chaqueta impermeable»</strong> · 214 productos</p>

  <aside class="filters" aria-labelledby="filters-title">
    <header class="filters-header">
      <h2 class="filters-title" id="filters-title">Filtros</h2>
      <a class="filters-close" href="#">Volver a los resultados</a>
    </header>

    <form class="filters-body" id="filters-form" action="#" aria-labelledby="filters-title">
      <details class="group" open>
        <summary>Precio</summary>
        <div class="group-content">
          <label class="range-field">Desde (€)<input type="number" name="min" min="0" step="5" value="20" inputmode="numeric"></label><label class="range-field">Hasta (€)<input type="number" name="max" min="0" step="5" value="120" inputmode="numeric"></label>
        </div>
      </details>

      <details class="group" open>
        <summary>Categoría</summary>
        <ul class="group-content option-list">
          <li><label><input type="checkbox" name="category" value="hiking" checked> Montaña y senderismo <span class="count">(86)</span></label></li>
          <li><label><input type="checkbox" name="category" value="city"> Ciudad <span class="count">(54)</span></label></li>
          <li><label><input type="checkbox" name="category" value="running"> Correr <span class="count">(31)</span></label></li>
          <li><label><input type="checkbox" name="category" value="cycling"> Ciclismo <span class="count">(23)</span></label></li>
          <li><label><input type="checkbox" name="category" value="kids"> Infantil, de la talla 2 a la 16 <span class="count">(20)</span></label></li>
        </ul>
      </details>

      <details class="group" open>
        <summary>Color</summary>
        <div class="group-content swatches">
          <label class="swatch" style="--swatch: #1e293b"><input type="radio" name="color" value="black" checked> Negro</label>
          <label class="swatch" style="--swatch: #1d4ed8"><input type="radio" name="color" value="blue"> Azul</label>
          <label class="swatch" style="--swatch: #15803d"><input type="radio" name="color" value="green"> Verde</label>
          <label class="swatch" style="--swatch: #b91c1c"><input type="radio" name="color" value="red"> Rojo</label>
          <label class="swatch" style="--swatch: #ca8a04"><input type="radio" name="color" value="mustard"> Mostaza</label>
        </div>
      </details>

      <details class="group">
        <summary>Valoración</summary>
        <ul class="group-content option-list">
          <li><label><input type="radio" name="rating" value="4"> 4 estrellas o más</label></li>
          <li><label><input type="radio" name="rating" value="3"> 3 estrellas o más</label></li>
        </ul>
      </details>

      <details class="group" open>
        <summary>Disponibilidad</summary>
        <ul class="group-content option-list">
          <li><label><input type="checkbox" name="stock" checked> Solo productos en stock</label></li>
          <li><label><input type="checkbox" name="pickup"> Recogida hoy en tienda</label></li>
        </ul>
      </details>
    </form>

    <footer class="filters-footer">
      <button class="btn btn--quiet" type="reset" form="filters-form">Borrar todo</button>
      <button class="btn btn--primary" type="submit" form="filters-form">Ver 128 productos</button>
    </footer>
  </aside>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel lateral de filtros
   - Tres cajas apiladas: cabecera, cuerpo y pie. Solo el cuerpo tiene scroll
     (max-height + overflow-y: auto), así que el título y los botones están siempre
     a la vista sin position: sticky.
   - Con flexbox, el cuerpo ocuparía exactamente el alto que dejen la cabecera y el
     pie; en flujo normal le damos un máximo razonable con min().
   - El panel se pega a la derecha con margin-inline-start: auto (ancho limitado).
   - Ningún control cambia de tamaño al marcarlo: las muestras de color dibujan su
     anillo con box-shadow.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-page: #e7e5e4;
    --color-surface: #ffffff;
    --color-text: #1c1917;
    --color-text-muted: #57534e;
    --color-border: #e7e5e4;
    --color-border-strong: #78716c;
    --color-brand: #0f766e;
    --color-brand-strong: #115e59;
    --color-brand-soft: #f0fdfa;
    --color-focus: #0f766e;

    --panel-width: 22rem;
    --panel-radius: 16px;
    --body-max-height: min(24rem, 60vh);
    --pad: 1.25rem;
  }
}

@layer base {
  body {
    background: var(--color-page);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand-strong);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    padding: 1rem;
  }

  .page-context {
    margin-bottom: 1rem;
    color: var(--color-text-muted);
  }

  /* ─── El panel ─── */
  .filters {
    width: min(100%, var(--panel-width));
    margin-inline-start: auto;          /* todo el espacio libre a la izquierda: pegado a la derecha */
    border: 1px solid var(--color-border-strong);
    border-radius: var(--panel-radius);
    background: var(--color-surface);
    box-shadow: 0 2px 4px rgb(28 25 23 / 0.08), 0 24px 48px rgb(28 25 23 / 0.18);
  }

  .filters-header {
    padding: 1rem var(--pad);
    border-bottom: 1px solid var(--color-border);
  }

  .filters-title {
    font-size: 1.25rem;
  }

  .filters-close {
    font-size: 0.875rem;
  }

  /* ─── Cuerpo con scroll ─── */
  /* Un contenedor de scroll recorta su contenido con la forma de su border-radius:
     aquí no tiene radio, así que nada se sale por las esquinas del panel. El foco de
     los controles queda dentro gracias al relleno lateral. */
  .filters-body {
    max-height: var(--body-max-height);
    overflow-y: auto;
    scrollbar-gutter: stable;           /* marcar un grupo que añade scroll no mueve nada */
    padding: 0 var(--pad);
  }

  /* ─── Grupos plegables ─── */
  .group {
    border-bottom: 1px solid var(--color-border);
  }

  .group:last-child {
    border-bottom: 0;
  }

  /* summary como bloque con relleno: toda la fila es la zona de clic */
  .group summary {
    padding-block: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }

  .group summary:focus-visible {
    outline-offset: -3px;               /* dentro del área de scroll, para que no se recorte */
    border-radius: 6px;
  }

  .group-content {
    padding-bottom: 1rem;
  }

  /* ─── Rango de precio: dos cajas al 47 % ─── */
  /* 47 % + 4 % de margen + 47 % = 98 %: el 2 % que sobra absorbe el espacio en blanco
     que habría entre las dos cajas en línea si el HTML tuviera un salto de línea.
     (Con flexbox y gap, en el módulo siguiente, no hace falta esta cuenta.) */
  .range-field {
    display: inline-block;
    width: 47%;
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  .range-field + .range-field {
    margin-left: 4%;
  }

  .range-field input {
    display: block;
    width: 100%;                        /* con border-box, el relleno no lo saca de su caja */
    margin-top: 0.25rem;
    padding: 0.4rem 0.6rem;
    border: 1px solid var(--color-border-strong);
    border-radius: 8px;
    color: var(--color-text);
    font-size: 1rem;
  }

  /* ─── Listas de opciones ─── */
  .option-list {
    padding-left: 0;
    list-style: none;
  }

  .option-list label {
    display: block;                     /* toda la fila es clicable */
    padding: 0.3rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
  }

  .option-list label:hover {
    background: var(--color-brand-soft);
  }

  .option-list input {
    margin-right: 0.375rem;
  }

  .count {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* ─── Muestras de color ─── */
  /* Cada etiqueta es una caja inline-block de ancho fijo con la muestra encima
     (::before) y, debajo, el botón de opción y el nombre: el botón real sigue
     visible porque es lo que se enfoca con el teclado y lo que anuncia el lector. */
  .swatch {
    display: inline-block;
    width: 3.75rem;
    margin: 0 0.25rem 0.5rem 0;
    font-size: 0.75rem;
    text-align: center;
    cursor: pointer;
  }

  /* El círculo: cuadrado por aspect-ratio y redondo por border-radius. El anillo de
     «marcado» es una sombra doble (blanco + color): no cambia ningún tamaño. */
  .swatch::before {
    content: "";
    display: block;
    width: 2rem;
    aspect-ratio: 1;
    margin: 0 auto 0.25rem;
    border: 1px solid rgb(28 25 23 / 0.25);
    border-radius: 50%;
    background: var(--swatch);
  }

  .swatch:has(:checked)::before {
    box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-text);
  }

  .swatch:has(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 0;
    border-radius: 8px;
  }

  .swatch input {
    margin: 0 0 0.125rem;
  }

  /* ─── Pie, siempre visible ─── */
  .filters-footer {
    padding: 0.75rem var(--pad) 1rem;
    border-top: 1px solid var(--color-border);
    text-align: end;
  }

  .btn {
    display: inline-block;
    margin: 0.25rem 0 0 0.5rem;
    padding: 0.55rem 1rem;
    border: 2px solid transparent;
    border-radius: 999px;
    font-weight: 700;
    cursor: pointer;
  }

  .btn--quiet {
    background: transparent;
    color: var(--color-brand-strong);
  }

  .btn--quiet:hover {
    border-color: var(--color-border);
  }

  .btn--primary {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
  }

  .btn--primary:hover {
    border-color: var(--color-brand-strong);
    background: var(--color-brand-strong);
  }

  .btn:active {
    box-shadow: inset 0 2px 4px rgb(28 25 23 / 0.3);
  }
}
```
