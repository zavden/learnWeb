---
example_description: "La calidad del aire por alcaldía: una tabla de verdad en contenedores de 26rem o más (dentro de una región con scroll horizontal accesible y la primera columna pegada) y fichas en contenedores estrechos, con la cabecera de cada dato desde attr(data-label). El estado se dice con texto, no solo con color"
example_tags: "css|profesional|responsive|container-queries|tablas|subgrid|sticky|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <section class="air" aria-labelledby="air-title">
    <h1 id="air-title">Calidad del aire, hoy a las 13:00</h1>
    <p class="air__note">Índice IMECA por alcaldía. Por debajo de 50, el aire es bueno; por encima de 100, conviene evitar el ejercicio al aire libre.</p>
    <div class="air__scroll" role="region" aria-labelledby="air-title" tabindex="0">
      <table class="air__table" role="table">
        <thead role="rowgroup">
          <tr role="row"><th role="columnheader" scope="col">Alcaldía</th><th role="columnheader" scope="col">IMECA</th><th role="columnheader" scope="col">Calidad</th><th role="columnheader" scope="col">Contaminante</th></tr>
        </thead>
        <tbody role="rowgroup">
          <tr role="row"><th role="rowheader" scope="row">Coyoacán</th><td role="cell" data-label="IMECA">42</td><td role="cell" data-label="Calidad"><span class="status is-good">Buena</span></td><td role="cell" data-label="Contaminante">O₃</td></tr>
          <tr role="row"><th role="rowheader" scope="row">Iztapalapa</th><td role="cell" data-label="IMECA">78</td><td role="cell" data-label="Calidad"><span class="status is-fair">Aceptable</span></td><td role="cell" data-label="Contaminante">PM2.5</td></tr>
          <tr role="row"><th role="rowheader" scope="row">Gustavo A. Madero</th><td role="cell" data-label="IMECA">112</td><td role="cell" data-label="Calidad"><span class="status is-bad">Mala</span></td><td role="cell" data-label="Contaminante">O₃</td></tr>
          <tr role="row"><th role="rowheader" scope="row">Tlalpan</th><td role="cell" data-label="IMECA">35</td><td role="cell" data-label="Calidad"><span class="status is-good">Buena</span></td><td role="cell" data-label="Contaminante">O₃</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <aside class="widget" aria-labelledby="mine-title">
    <h2 id="mine-title">Tus alcaldías</h2>
    <div class="air__scroll" role="region" aria-labelledby="mine-title" tabindex="0">
      <table class="air__table" role="table">
        <thead role="rowgroup">
          <tr role="row"><th role="columnheader" scope="col">Alcaldía</th><th role="columnheader" scope="col">IMECA</th><th role="columnheader" scope="col">Calidad</th><th role="columnheader" scope="col">Contaminante</th></tr>
        </thead>
        <tbody role="rowgroup">
          <tr role="row"><th role="rowheader" scope="row">Coyoacán</th><td role="cell" data-label="IMECA">42</td><td role="cell" data-label="Calidad"><span class="status is-good">Buena</span></td><td role="cell" data-label="Contaminante">O₃</td></tr>
          <tr role="row"><th role="rowheader" scope="row">Gustavo A. Madero</th><td role="cell" data-label="IMECA">112</td><td role="cell" data-label="Calidad"><span class="status is-bad">Mala</span></td><td role="cell" data-label="Contaminante">O₃</td></tr>
        </tbody>
      </table>
    </div>
  </aside>
</main>
<p class="caption">A 480px: la tabla principal (unos 440px de contenedor) es una tabla y la de la barra (17rem), fichas. Desde 56rem, la barra se pone al lado.</p>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Calidad del aire
   - El contenedor es la región con scroll (.air__scroll), que recibe su
     ancho de la columna. Por debajo de 26rem, FICHAS: tabla, cuerpo y filas
     pasan a bloque/rejilla; cada celda ocupa las dos columnas de su fila y
     las comparte con subgrid (su ::before con la cabecera, a la izquierda).
     La cabecera de la tabla queda solo para lectores de pantalla.
   - Desde 26rem, TABLA: si no cabe, la región se desplaza en horizontal; la
     región tiene tabindex="0", role="region" y nombre, para poder
     desplazarla con el teclado. La primera columna se pega (sticky).
   - Roles ARIA en las piezas de la tabla: al cambiar su display, algunos
     navegadores dejarían de anunciarla como tabla.
   - El estado («Buena», «Mala») es texto con un color de apoyo.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, layout;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-border: #cbd5e1;
    --color-head: #f1f5f9;
    --space-xs: clamp(0.75rem, 0.6818rem + 0.3409vw, 0.9375rem);
    --space-s: clamp(1rem, 0.9091rem + 0.4545vw, 1.25rem);
    --space-s-l: clamp(1rem, 0.4545rem + 2.7273vw, 2.5rem);
  }
}

@layer base {
  body { padding: var(--space-s-l); background: #ffffff; color: var(--color-text); font-family: system-ui, sans-serif; line-height: 1.4; }
  h1 { font-size: 1.3rem; }
  h2 { font-size: 1rem; }
  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
}

@layer components {
  .air__note { max-inline-size: 60ch; margin: 4px 0 var(--space-s); color: var(--color-muted); font-size: 0.85rem; }

  /* El contenedor no puede consultarse a sí mismo: su overflow va fuera de
     la consulta (en modo fichas no hay nada que desplazar). */
  .air__scroll { container: data / inline-size; overflow-x: auto; }

  .status { display: inline-block; padding: 0 8px; border-radius: 999px; font-weight: 700; }
  .status.is-good { background: #dcfce7; color: #166534; }
  .status.is-fair { background: #fef9c3; color: #854d0e; }
  .status.is-bad { background: #fee2e2; color: #991b1b; }

  /* ── FICHAS (base) ── */
  .air__table, .air__table tbody { display: block; }
  .air__table { font-size: 0.85rem; font-variant-numeric: tabular-nums; }

  .air__table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

  .air__table tbody tr {
    display: grid;
    grid-template-columns: 7rem 1fr;
    gap: 2px 8px;
    margin-bottom: 8px;
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
  }

  .air__table tbody th { grid-column: 1 / -1; font-size: 1rem; text-align: start; }
  .air__table td { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; }
  .air__table td::before { content: attr(data-label); color: var(--color-muted); }
  .air__table td > .status { justify-self: start; }   /* la etiqueta abraza su texto */

  /* ── TABLA (con sitio en el contenedor) ── */
  @container data (width >= 26rem) {
    .air__table { display: table; width: 100%; min-width: 26rem; border-collapse: collapse; }
    .air__table tbody { display: table-row-group; }
    .air__table thead { position: static; width: auto; height: auto; overflow: visible; clip-path: none; }
    .air__table tbody tr { display: table-row; margin: 0; padding: 0; border: 0; }
    .air__table td { display: table-cell; }
    .air__table td::before { content: none; }
    .air__table th, .air__table td { padding: 6px 10px; border-bottom: 1px solid var(--color-border); text-align: start; }
    .air__table thead th { background: var(--color-head); font-size: 0.8rem; }
    .air__table td[data-label="IMECA"] { text-align: end; }

    /* La primera columna se queda a la vista al desplazar en horizontal. */
    .air__table tbody th, .air__table thead th:first-child { position: sticky; left: 0; background: #ffffff; }
    .air__table thead th:first-child { background: var(--color-head); }
  }
}

@layer layout {
  .page { display: grid; gap: var(--space-s-l); }
  .widget { max-inline-size: 17rem; padding: var(--space-xs); border-radius: 12px; background: #f8fafc; }
  .widget h2 { margin-bottom: 8px; }
  .caption { margin-top: var(--space-s); color: var(--color-muted); font-size: 0.72rem; }

  @media (width >= 56rem) {
    .page { grid-template-columns: minmax(0, 1fr) 17rem; align-items: start; }
  }
}
```
