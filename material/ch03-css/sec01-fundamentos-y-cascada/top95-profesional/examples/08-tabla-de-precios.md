---
example_description: "Tabla comparativa de precios: una tabla semántica de verdad, columna destacada con col, valores sí/no marcados con atributos y ::before, y especificidad controlada"
example_tags: "css|profesional|tablas|selectores|especificidad"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <h1>Planes y precios</h1>
  <p class="lead">Precios sin IVA. Puedes cambiar de plan o cancelar cuando quieras, sin permanencia.</p>

  <div class="table-scroll" role="region" aria-labelledby="pricing-caption" tabindex="0">
    <table class="pricing">
      <caption id="pricing-caption">Comparativa de planes de alojamiento</caption>
      <colgroup>
        <col>
        <col>
        <col class="is-featured">
        <col>
      </colgroup>
      <thead>
        <tr>
          <td></td>
          <th scope="col">Básico</th>
          <th scope="col">Pro <span class="badge">Más elegido</span></th>
          <th scope="col">Equipo</th>
        </tr>
        <tr class="price-row">
          <th scope="row">Precio</th>
          <td><span class="amount">0 €</span> <span class="period">siempre</span></td>
          <td><span class="amount">12 €</span> <span class="period">al mes</span></td>
          <td><span class="amount">29 €</span> <span class="period">al mes</span></td>
        </tr>
      </thead>
      <tbody>
        <tr><th scope="row">Sitios web</th><td>1</td><td>5</td><td>Ilimitados</td></tr>
        <tr><th scope="row">Almacenamiento</th><td>1 GB</td><td>20 GB</td><td>100 GB</td></tr>
        <tr><th scope="row">Dominio propio</th><td data-value="no">No incluido</td><td data-value="yes">Incluido</td><td data-value="yes">Incluido</td></tr>
        <tr><th scope="row">Certificado HTTPS</th><td data-value="yes">Incluido</td><td data-value="yes">Incluido</td><td data-value="yes">Incluido</td></tr>
        <tr><th scope="row">Copias de seguridad</th><td data-value="no">No incluidas</td><td>Semanales</td><td>Diarias</td></tr>
        <tr><th scope="row">Soporte</th><td>Foro de la comunidad</td><td>Correo electrónico</td><td>Prioritario 24 h</td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td></td>
          <td><a class="cta" href="#">Empezar gratis</a></td>
          <td><a class="cta cta--primary" href="#">Elegir Pro</a></td>
          <td><a class="cta" href="#">Hablar con ventas</a></td>
        </tr>
      </tfoot>
    </table>
  </div>

  <p class="note">¿Necesitas algo distinto? Escríbenos a <a href="mailto:ventas@example.com">ventas@example.com</a>.</p>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tabla de precios
   Estrategia de especificidad:
   - base con :where() → (0,0,0); componentes con una clase → (0,1,x);
   - los estados de cada celda van en atributos (data-value) y en variables,
     no en clases nuevas ni en selectores largos. Ningún id, ningún !important.
   Una comparativa de planes ES una tabla de datos: filas = características,
   columnas = planes. Por eso no hace falta ninguna técnica de maquetación.
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer tokens, base, components;

@layer tokens {
  :root {
    --color-bg: oklch(98.5% 0.005 260);
    --color-border: oklch(88% 0.02 260);
    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-brand: oklch(50% 0.18 260);
    --color-brand-strong: oklch(42% 0.18 260);
    --color-featured: color-mix(in oklch, var(--color-brand) 7%, white);
    --color-yes: oklch(45% 0.12 150);
    --radius: 0.375rem;
  }
}

@layer base {
  body {
    margin: 0;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    max-width: 52rem;
    margin-inline: auto;
    padding: 1rem;
  }

  .lead,
  .note {
    color: var(--color-text-muted);
  }

  /* En pantallas estrechas la tabla se desplaza dentro de su contenedor en lugar de
     romper la página. tabindex="0" permite desplazarla también con el teclado.
     (overflow se estudia en el módulo del modelo de cajas.) */
  .table-scroll {
    overflow-x: auto;
  }

  .pricing {
    border-collapse: collapse;
    width: 100%;
    min-width: 36rem;
  }

  .pricing caption {
    text-align: start;
    font-weight: 700;
    padding-block: 0.5rem;
  }

  .pricing :is(th, td) {
    padding: 0.7rem 1rem;
    border-bottom: 1px solid var(--color-border);
    text-align: center;
  }

  /* Los encabezados de fila (características) van alineados al inicio */
  .pricing th[scope="row"] {
    text-align: start;
    font-weight: 600;
  }

  .pricing thead th[scope="col"] {
    font-size: 1.125rem;
  }

  /* Columna destacada: el fondo de <col> se pinta detrás de todas sus celdas.
     (Por eso no hay bandas en las filas: el fondo de un <tr> taparía el de la columna.) */
  .pricing .is-featured {
    background: var(--color-featured);
  }

  .badge {
    display: block;                       /* la insignia, en su propia línea */
    margin-top: 0.25rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-brand-strong);
  }

  .amount {
    font-size: 1.75rem;
    font-weight: 800;
  }

  .period {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* Sí / No: el texto se queda (es lo que lee un lector de pantalla) y el símbolo
     es decorativo, con texto alternativo vacío. */
  .pricing [data-value="yes"]::before {
    content: "✓ " / "";
    color: var(--color-yes);
    font-weight: 800;
  }

  .pricing [data-value="no"] {
    color: var(--color-text-muted);
  }

  .pricing [data-value="no"]::before {
    content: "✕ " / "";
  }

  .pricing tfoot td {
    border-bottom: 0;
    padding-top: 1rem;
  }

  /* Enlaces con aspecto de botón (llevan a otra página: por eso son <a>, no <button>) */
  .cta {
    display: inline-block;
    border: 2px solid var(--color-brand);
    border-radius: var(--radius);
    padding: 0.45rem 0.9rem;
    font-weight: 600;
    text-decoration: none;
  }

  .cta:hover {
    background: color-mix(in oklch, var(--color-brand) 10%, white);
  }

  /* El modificador solo cambia colores; la forma la pone .cta */
  .cta--primary {
    background: var(--color-brand);
    color: #ffffff;
  }

  .cta--primary:hover {
    background: var(--color-brand-strong);
  }
}
```
