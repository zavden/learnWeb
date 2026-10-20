---
example_description: "Página de una biblioteca de componentes: botones, insignias, alertas, tarjeta, acordeón y popover, con @layer components/utilities y variables como interfaz de cada componente"
example_tags: "css|profesional|componentes|layer|custom-properties"
example_stage: professional
example_importance: critical
---

# HTML

```html
<header class="page-header">
  <h1>Componentes de Brisa</h1>
  <p class="u-text-muted u-mt-0">Cada componente expone variables (<code>--btn-bg</code>, <code>--tone</code>…) como interfaz. Las variantes solo cambian esas variables.</p>
</header>

<main class="page">
  <section class="demo" aria-labelledby="buttons-title">
    <h2 id="buttons-title">Botones</h2>
    <p>
      <button type="button" class="btn">Guardar</button>
      <button type="button" class="btn btn--secondary">Cancelar</button>
      <button type="button" class="btn btn--danger">Eliminar</button>
      <button type="button" class="btn btn--ghost">Más opciones</button>
      <button type="button" class="btn" disabled>No disponible</button>
    </p>
    <p>
      <button type="button" class="btn btn--small">Pequeño</button>
      <button type="button" class="btn">Normal</button>
      <button type="button" class="btn btn--large">Grande</button>
    </p>
  </section>

  <section class="demo" aria-labelledby="badges-title">
    <h2 id="badges-title">Insignias</h2>
    <p>
      <span class="badge">Borrador</span>
      <span class="badge" data-tone="success">Publicado</span>
      <span class="badge" data-tone="warning">Pendiente</span>
      <span class="badge" data-tone="danger">Rechazado</span>
    </p>
  </section>

  <section class="demo" aria-labelledby="alerts-title">
    <h2 id="alerts-title">Alertas</h2>
    <div class="alert" data-tone="success">
      <p class="alert-title">Cambios guardados</p>
      <p class="u-mt-0">La nueva versión ya es visible para todo el equipo.</p>
    </div>
    <div class="alert" data-tone="danger">
      <p class="alert-title">No se ha podido publicar</p>
      <p class="u-mt-0">Revisa tu conexión e inténtalo de nuevo.</p>
    </div>
  </section>

  <section class="demo" aria-labelledby="card-title">
    <h2 id="card-title">Tarjeta</h2>
    <article class="card">
      <p class="card-eyebrow">Guía · 8 minutos</p>
      <h3 class="card-title">Cómo organizar el CSS con capas</h3>
      <p>Reset, tokens, base, componentes y utilidades: cada capa con un papel claro.</p>
      <a class="card-link" href="#">Leer la guía</a>
    </article>
  </section>

  <section class="demo" aria-labelledby="accordion-title">
    <h2 id="accordion-title">Acordeón</h2>
    <!-- El atributo name agrupa los details: al abrir uno, se cierra el otro -->
    <details class="accordion" name="plans" open>
      <summary>¿Puedo cambiar de plan?</summary>
      <p>Sí, en cualquier momento. El cambio se aplica en la siguiente factura.</p>
    </details>
    <details class="accordion" name="plans">
      <summary>¿Hay permanencia?</summary>
      <p>No. Puedes cancelar cuando quieras desde la configuración de tu cuenta.</p>
    </details>
  </section>

  <section class="demo" aria-labelledby="popover-title">
    <h2 id="popover-title">Ventana emergente</h2>
    <button type="button" class="btn btn--secondary" popovertarget="help">¿Qué es una capa?</button>
    <div id="help" class="popover" popover>
      <h3 class="u-mt-0">Capas de cascada</h3>
      <p>Un grupo de reglas con prioridad propia. Entre capas no cuenta la especificidad, solo el orden.</p>
      <button type="button" class="btn btn--small" popovertarget="help" popovertargetaction="hide">Entendido</button>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Biblioteca de componentes
   Capas, de menos a más prioridad:
     reset      → deshace lo que estorba del navegador
     tokens     → colores, espacios y radios (custom properties)
     base       → elementos HTML sueltos, con :where() (especificidad 0)
     components → una clase por componente; las variantes cambian variables
     utilities  → ajustes de una sola propiedad que deben ganar siempre:
                  ganan por capa, sin !important
   Nota: las propiedades de caja y de texto se usan de forma básica.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, components, utilities;

@layer reset {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: oklch(98.5% 0.005 260);
    --color-surface: oklch(96% 0.01 260);
    --color-border: oklch(85% 0.02 260);
    --color-text: oklch(25% 0.03 260);
    --color-text-muted: oklch(45% 0.03 260);
    --color-brand: oklch(50% 0.18 260);
    --color-success: oklch(50% 0.13 150);
    --color-warning: oklch(55% 0.13 70);
    --color-danger: oklch(50% 0.19 27);
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 1rem;
    --space-4: 1.5rem;
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

  :where(code) {
    font-family: ui-monospace, Menlo, Consolas, monospace;
    font-size: 0.9em;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-brand);
    outline-offset: 2px;
  }
}

@layer components {
  .page-header,
  .page {
    max-width: 46rem;
    margin-inline: auto;
    padding-inline: var(--space-3);
  }

  .page-header {
    padding-block: var(--space-4) 0;
  }

  .demo {
    border-top: 1px solid var(--color-border);
    padding-block: var(--space-2) var(--space-3);
  }

  .demo h2 {
    font-size: 1.125rem;
  }

  /* ── Botón ──────────────────────────────────────────────
     Interfaz: --btn-bg, --btn-fg, --btn-border. El tamaño sale de font-size:
     el relleno y el radio están en em, así que escalan solos. */
  .btn {
    --btn-bg: var(--color-brand);
    --btn-fg: #ffffff;
    --btn-border: var(--btn-bg);
    background: var(--btn-bg);
    color: var(--btn-fg);
    border: 2px solid var(--btn-border);
    border-radius: 0.4em;
    padding: 0.45em 1em;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 var(--space-1) var(--space-2) 0;
  }

  .btn:hover {
    --btn-bg: color-mix(in oklch, var(--color-brand) 80%, black);
  }

  .btn--secondary {
    --btn-bg: transparent;
    --btn-fg: var(--color-brand);
    --btn-border: var(--color-brand);
  }

  .btn--secondary:hover {
    --btn-bg: color-mix(in oklch, var(--color-brand) 10%, white);
  }

  .btn--danger {
    --btn-bg: var(--color-danger);
  }

  .btn--danger:hover {
    --btn-bg: color-mix(in oklch, var(--color-danger) 80%, black);
  }

  .btn--ghost {
    --btn-bg: transparent;
    --btn-fg: var(--color-brand);
    --btn-border: transparent;
  }

  .btn--ghost:hover {
    --btn-bg: var(--color-surface);
  }

  .btn--small { font-size: 0.875rem; }
  .btn--large { font-size: 1.25rem; }

  /* Desactivado: gris, sin reaccionar al ratón. Va al final para ganar a :hover. */
  .btn:disabled {
    --btn-bg: var(--color-surface);
    --btn-fg: var(--color-text-muted);
    --btn-border: var(--color-border);
    cursor: not-allowed;
  }

  /* ── Insignia y alerta: un solo color de entrada, --tone ── */
  :where(.badge, .alert) {
    --tone: var(--color-text-muted);
  }

  [data-tone="success"] { --tone: var(--color-success); }
  [data-tone="warning"] { --tone: var(--color-warning); }
  [data-tone="danger"]  { --tone: var(--color-danger); }

  .badge {
    color: color-mix(in oklch, var(--tone) 70%, black);
    background: color-mix(in oklch, var(--tone) 14%, white);
    border: 1px solid color-mix(in oklch, var(--tone) 40%, white);
    border-radius: 999px;
    padding: 0.1em 0.6em;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .alert {
    color: color-mix(in oklch, var(--tone) 70%, black);
    background: color-mix(in oklch, var(--tone) 10%, white);
    border-left: 4px solid currentColor;
    border-radius: 0 var(--radius) var(--radius) 0;
    padding: var(--space-2) var(--space-3);
    margin-bottom: var(--space-2);
  }

  .alert p {
    margin: var(--space-1) 0;
  }

  .alert-title {
    font-weight: 700;
  }

  /* ── Tarjeta ── */
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: var(--space-3) var(--space-4);
  }

  .card-eyebrow {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .card-title {
    margin: var(--space-1) 0 var(--space-2);
    font-size: 1.25rem;
  }

  .card-link {
    font-weight: 600;
  }

  .card-link::after {
    content: " →" / "";
  }

  /* ── Acordeón ── */
  .accordion {
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: var(--space-2) var(--space-3);
    margin-bottom: var(--space-2);
    background: #ffffff;
  }

  .accordion summary {
    font-weight: 600;
    cursor: pointer;
  }

  .accordion summary::marker {
    color: var(--color-brand);
  }

  .accordion[open] {
    border-color: var(--color-brand);
  }

  /* ── Popover ── */
  .popover {
    max-width: 22rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg);
    color: var(--color-text);
  }

  .popover::backdrop {
    background: color-mix(in oklch, var(--color-text) 35%, transparent);
  }
}

@layer utilities {
  /* (0,1,0) y en la última capa: ganan a cualquier regla de los componentes */
  .u-mt-0 {
    margin-top: 0;
  }

  .u-text-muted {
    color: var(--color-text-muted);
  }
}
```
