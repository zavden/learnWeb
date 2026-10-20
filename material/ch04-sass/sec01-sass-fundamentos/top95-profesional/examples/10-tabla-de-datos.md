---
example_description: "La piel de una tabla de datos: contenedor con desplazamiento accesible, cabecera fija, bandas, columnas numéricas con cifras tabulares, estados generados desde un mapa y dos densidades con custom properties"
example_tags: "sass|profesional|tablas|mapas|each|custom-properties|sticky|accesibilidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <h1>Pedidos de octubre</h1>
  <p class="page__intro">8 pedidos · 6 742 MXN en total. Desplaza la tabla si no cabe en la pantalla.</p>

  <div class="table-scroll" role="region" aria-labelledby="orders-caption" tabindex="0">
    <table class="data-table data-table--compact">
      <caption id="orders-caption">Pedidos de octubre de 2026, del más reciente al más antiguo</caption>
      <thead>
        <tr>
          <th scope="col">Pedido</th>
          <th scope="col">Cliente</th>
          <th scope="col">Fecha</th>
          <th scope="col" class="num">Artículos</th>
          <th scope="col" class="num">Importe (MXN)</th>
          <th scope="col">Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">#20424</th><td>Lucía Hernández</td><td>12 oct</td><td class="num">3</td><td class="num">1 245,00</td><td><span class="status" data-status="paid">Pagado</span></td></tr>
        <tr><th scope="row">#20423</th><td>Andrés Pérez</td><td>11 oct</td><td class="num">1</td><td class="num">189,00</td><td><span class="status" data-status="shipped">Enviado</span></td></tr>
        <tr><th scope="row">#20422</th><td>Sofía Ramírez</td><td>10 oct</td><td class="num">5</td><td class="num">2 310,50</td><td><span class="status" data-status="delivered">Entregado</span></td></tr>
        <tr><th scope="row">#20421</th><td>Diego Torres</td><td>9 oct</td><td class="num">2</td><td class="num">430,00</td><td><span class="status" data-status="pending">Pago pendiente</span></td></tr>
        <tr><th scope="row">#20420</th><td>Valeria Cruz</td><td>8 oct</td><td class="num">1</td><td class="num">99,00</td><td><span class="status" data-status="cancelled">Cancelado</span></td></tr>
        <tr><th scope="row">#20419</th><td>Emilio Navarro</td><td>6 oct</td><td class="num">4</td><td class="num">980,00</td><td><span class="status" data-status="delivered">Entregado</span></td></tr>
        <tr><th scope="row">#20418</th><td>Regina Flores</td><td>4 oct</td><td class="num">2</td><td class="num">1 220,00</td><td><span class="status" data-status="delivered">Entregado</span></td></tr>
        <tr><th scope="row">#20417</th><td>Tomás Medina</td><td>2 oct</td><td class="num">1</td><td class="num">268,50</td><td><span class="status" data-status="delivered">Entregado</span></td></tr>
      </tbody>
      <tfoot>
        <tr><th scope="row" colspan="3">Total</th><td class="num">19</td><td class="num">6 742,00</td><td></td></tr>
      </tfoot>
    </table>
  </div>
</main>
```

# SCSS

```scss
// ─────────────────────────────────────────────────────────────────────────────
// Tabla de datos
// - El contenedor .table-scroll desplaza la tabla en horizontal (y en vertical,
//   con una altura máxima) sin romper la página. Como puede recibir el foco
//   (tabindex="0", role="region" con nombre), se desplaza con el teclado.
// - La cabecera es sticky DENTRO del contenedor: overflow crea el contexto de
//   desplazamiento al que se pega (módulo de posicionamiento).
// - Densidad con custom properties: --compact y --comfortable cambian dos
//   valores, no reescriben la tabla.
// - Estados desde un mapa con @each, en [data-status]: el texto ya dice el
//   estado; el color solo lo refuerza.
// - Números: alineados a la derecha y con cifras tabulares, para comparar
//   importes de un vistazo.
// ─────────────────────────────────────────────────────────────────────────────
@use "sass:color";
@use "sass:map";
@use "sass:math";

$table: (
  border: #e2e8f0,
  stripe: #f8fafc,
  hover: #eff6ff,
  head: #f1f5f9,
  text: #0f172a,
  muted: #475569,
) !default;

$densities: (
  compact: (padding-block: 0.375rem, font-size: 0.875rem),
  comfortable: (padding-block: 0.875rem, font-size: 1rem),
) !default;

$statuses: (
  paid: #1d4ed8,
  shipped: #0369a1,
  delivered: #15803d,
  pending: #b45309,
  cancelled: #b91c1c,
) !default;

@function t($name) {
  @if not map.has-key($table, $name) {
    @error "t(): no existe «#{$name}». Opciones: #{map.keys($table)}.";
  }
  @return map.get($table, $name);
}

@function tidy($color) {
  @return rgb(
    math.round(color.channel($color, "red", $space: rgb)),
    math.round(color.channel($color, "green", $space: rgb)),
    math.round(color.channel($color, "blue", $space: rgb))
  );
}

// ── Página ───────────────────────────────────────────────────────────────────
body {
  margin: 0;
  color: t(text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.page {
  max-width: 56rem;
  margin-inline: auto;
  padding: 2rem 1rem;

  h1 {
    margin: 0;
  }

  &__intro {
    color: t(muted);
  }
}

// ── Contenedor ───────────────────────────────────────────────────────────────
.table-scroll {
  max-height: 22rem;
  overflow: auto;
  border: 1px solid t(border);
  border-radius: 8px;

  &:focus-visible {
    outline: 3px solid #1d4ed8;
    outline-offset: 2px;
  }
}

// ── Tabla ────────────────────────────────────────────────────────────────────
.data-table {
  --cell-padding-block: 0.625rem;
  --cell-font-size: 0.9375rem;

  width: 100%;
  min-width: 40rem;            // por debajo, mejor desplazar que apretar
  border-collapse: collapse;
  font-size: var(--cell-font-size);

  @each $name, $settings in $densities {
    &--#{$name} {
      --cell-padding-block: #{map.get($settings, padding-block)};
      --cell-font-size: #{map.get($settings, font-size)};
    }
  }

  caption {
    padding: 0.75rem 1rem;
    color: t(muted);
    font-size: 0.875rem;
    text-align: start;
  }

  th,
  td {
    padding: var(--cell-padding-block) 1rem;
    border-bottom: 1px solid t(border);
    text-align: start;
    white-space: nowrap;
  }

  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: t(head);
    font-size: 0.8125rem;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  tbody {
    tr:nth-child(even) {
      background: t(stripe);
    }

    tr:hover {
      background: t(hover);
    }

    th {
      font-weight: 600;
    }
  }

  tfoot {
    th,
    td {
      border-top: 2px solid t(text);
      border-bottom: 0;
      font-weight: 700;
    }
  }

  .num {
    font-variant-numeric: tabular-nums;
    text-align: end;
  }
}

// ── Estados ──────────────────────────────────────────────────────────────────
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--status-tint);
  color: var(--status-ink);
  font-size: 0.8125rem;
  font-weight: 600;

  // Un punto de color además del texto.
  &::before {
    content: "";
    width: 0.5rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--status-color);
  }
}

@each $name, $color in $statuses {
  [data-status="#{$name}"] {
    --status-color: #{$color};
    --status-tint: #{tidy(color.scale($color, $lightness: 90%))};
    --status-ink: #{tidy(color.scale($color, $lightness: -40%))};
  }
}
```
