---
example_description: "El directorio del equipo de una empresa: tarjetas en una sola rejilla auto-fill con los títulos de departamento a todo el ancho (1 / -1), filas alineadas con subgrid y un punto de estado superpuesto a cada foto"
example_tags: "css|profesional|grid|auto-fill|subgrid|lineas-negativas|capas|directorio"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="team">
  <header class="team-header">
    <h1>Equipo</h1>
    <p>18 personas en Querétaro y en remoto. Escríbenos directamente: respondemos en un día laborable.</p>
  </header>

  <nav class="filters" aria-label="Departamentos">
    <a href="/equipo" aria-current="page">Todos</a>
    <a href="/equipo/producto">Producto</a>
    <a href="/equipo/atencion">Atención al cliente</a>
  </nav>

  <div class="directory">
    <h2 class="dept">Producto</h2>

    <article class="person">
      <div class="photo"><img src="avatar-1.svg" alt="" width="48" height="48"><span class="dot is-online" aria-hidden="true"></span></div>
      <h3>Marta García</h3>
      <p class="role">Directora de producto</p>
      <p class="contact"><a href="mailto:marta@riegolisto.mx">marta@riegolisto.mx</a><span class="state">Disponible</span></p>
    </article>

    <article class="person">
      <div class="photo"><img src="avatar-3.svg" alt="" width="48" height="48"><span class="dot is-away" aria-hidden="true"></span></div>
      <h3>Luis Gómez Arreola</h3>
      <p class="role">Ingeniero de hardware y sensores de humedad</p>
      <p class="contact"><a href="mailto:luis@riegolisto.mx">luis@riegolisto.mx</a><span class="state">De vacaciones hasta el 20 de octubre</span></p>
    </article>

    <article class="person">
      <div class="photo"><img src="avatar-2.svg" alt="" width="48" height="48"><span class="dot is-online" aria-hidden="true"></span></div>
      <h3>Laura Méndez</h3>
      <p class="role">Diseñadora</p>
      <p class="contact"><a href="mailto:laura@riegolisto.mx">laura@riegolisto.mx</a><span class="state">Disponible</span></p>
    </article>

    <h2 class="dept">Atención al cliente</h2>

    <article class="person">
      <div class="photo"><img src="avatar-4.svg" alt="" width="48" height="48"><span class="dot is-online" aria-hidden="true"></span></div>
      <h3>Jorge Treviño</h3>
      <p class="role">Responsable de atención</p>
      <p class="contact"><a href="mailto:jorge@riegolisto.mx">jorge@riegolisto.mx</a><span class="state">Disponible</span></p>
    </article>

    <article class="person">
      <div class="photo"><img src="avatar-2.svg" alt="" width="48" height="48"><span class="dot is-busy" aria-hidden="true"></span></div>
      <h3>Paola Ríos</h3>
      <p class="role">Soporte técnico</p>
      <p class="contact"><a href="mailto:paola@riegolisto.mx">paola@riegolisto.mx</a><span class="state">En una llamada</span></p>
    </article>
  </div>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Directorio del equipo
   - UNA sola rejilla para todo el directorio: las tarjetas de todos los
     departamentos comparten columnas. Los títulos de departamento ocupan la
     fila entera con grid-column: 1 / -1 (funciona con cualquier número de
     columnas, porque auto-fill las crea explícitas).
   - Cada tarjeta ocupa 4 filas (foto, nombre, cargo y contacto) compartidas con
     subgrid: los nombres y los cargos de dos líneas no desalinean los correos.
   - Foto y punto de estado en la misma celda; el punto, abajo a la derecha. Es
     decorativo: el estado también va escrito en la tarjeta.
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
  }
}

@layer tokens {
  :root {
    --color-text: #0f172a;
    --color-muted: #475569;
    --color-line: #e2e8f0;
    --color-card: #ffffff;
    --color-bg: #f8fafc;
    --color-brand: #0f766e;
    --color-online: #16a34a;
    --color-away: #d97706;
    --color-busy: #dc2626;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 0.75rem;
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.4;
  }

  a {
    color: var(--color-brand);
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .team {
    max-width: 64rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .team-header h1 {
    font-size: clamp(1.5rem, 1.1rem + 2vw, 2.2rem);
  }

  .team-header p {
    max-width: 36rem;
    color: var(--color-muted);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: var(--space-4) 0;
  }

  .filters a {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-line);
    border-radius: 999px;
    background: var(--color-card);
    color: var(--color-text);
    font-size: 0.85rem;
    text-decoration: none;
  }

  .filters [aria-current="page"] {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
    font-weight: 700;
  }

  /* ─── El directorio: una rejilla ─── */
  .directory {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 11rem), 1fr));
    gap: var(--space-4);
  }

  .dept {
    grid-column: 1 / -1;
    margin-top: var(--space-2);
    padding-bottom: var(--space-1);
    border-bottom: 2px solid var(--color-text);
    font-size: 1.1rem;
  }

  .person {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
    row-gap: var(--space-1);
    padding: var(--space-4);
    border: 1px solid var(--color-line);
    border-radius: var(--radius);
    background: var(--color-card);
  }

  /* Foto y punto: misma celda. */
  .photo {
    display: grid;
    justify-self: start;
    margin-bottom: var(--space-2);
  }

  .photo > * {
    grid-area: 1 / 1;
  }

  .photo img {
    width: 4rem;
    border-radius: 50%;
  }

  .dot {
    justify-self: end;
    align-self: end;
    width: 1rem;
    height: 1rem;
    border: 3px solid var(--color-card);
    border-radius: 50%;
  }

  .dot.is-online { background: var(--color-online); }
  .dot.is-away   { background: var(--color-away); }
  .dot.is-busy   { background: var(--color-busy); }

  .person h3 {
    font-size: 1rem;
  }

  .role {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .contact {
    display: grid;
    gap: var(--space-1);
    align-self: end;
    font-size: 0.8rem;
  }

  .contact a {
    overflow-wrap: anywhere;
  }

  .state {
    color: var(--color-muted);
  }
}
```
