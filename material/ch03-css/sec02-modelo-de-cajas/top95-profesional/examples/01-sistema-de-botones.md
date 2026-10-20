---
example_description: "Un sistema de botones completo: variantes, tres tamaños en em, estados que no mueven nada, iconos de fondo, botones solo icono cuadrados, un grupo con bordes compartidos y foco visible"
example_tags: "css|profesional|botones|box-shadow|outline|em|accesibilidad"
example_stage: professional
example_importance: critical
---

# HTML

```html
<main class="specimen">
  <h1>Botones</h1>
  <p class="lead">Todos los botones de la aplicación salen de una sola clase, <code>.btn</code>, y de modificadores que solo cambian variables. Ningún estado cambia el tamaño de la caja.</p>

  <section class="specimen-section" aria-labelledby="variants-title">
    <h2 id="variants-title">Variantes</h2>
    <p class="row">
      <button class="btn btn--primary" type="button">Guardar cambios</button>
      <button class="btn" type="button">Vista previa</button>
      <button class="btn btn--quiet" type="button">Cancelar</button>
      <button class="btn btn--danger" type="button">Eliminar cuenta</button>
      <a class="btn btn--link" href="#">Ver el historial</a>
    </p>
  </section>

  <section class="specimen-section" aria-labelledby="sizes-title">
    <h2 id="sizes-title">Tamaños</h2>
    <p class="row">
      <button class="btn btn--primary btn--sm" type="button">Pequeño</button>
      <button class="btn btn--primary" type="button">Mediano</button>
      <button class="btn btn--primary btn--lg" type="button">Grande</button>
    </p>
    <p class="note">Solo cambia <code>font-size</code>: el relleno, el radio, el icono y la altura mínima están en <code>em</code>. El mediano mide 44px de alto, el mínimo recomendado para tocar con el dedo.</p>
  </section>

  <section class="specimen-section" aria-labelledby="states-title">
    <h2 id="states-title">Estados</h2>
    <p class="row">
      <button class="btn btn--primary" type="button" disabled>Enviando…</button>
      <button class="btn" type="button" aria-pressed="true">Negrita activada</button>
      <button class="btn" type="button" aria-pressed="false">Cursiva</button>
    </p>
    <p class="note">Pasa el ratón (la sombra crece), mantén pulsado (sombra interior) y recorre la página con <kbd>Tab</kbd> (anillo doble).</p>
  </section>

  <section class="specimen-section" aria-labelledby="icons-title">
    <h2 id="icons-title">Con icono y solo icono</h2>
    <p class="row">
      <button class="btn btn--primary btn--with-icon icon-plus" type="button">Nueva factura</button>
      <a class="btn btn--with-icon icon-download" href="#">Descargar PDF</a>
      <button class="btn btn--icon-only icon-edit" type="button" aria-label="Editar"></button>
      <button class="btn btn--icon-only icon-share" type="button" aria-label="Compartir"></button>
      <button class="btn btn--icon-only btn--danger-quiet icon-trash" type="button" aria-label="Eliminar"></button>
    </p>
    <p class="note">Los botones sin texto llevan <code>aria-label</code>: el icono es una imagen de fondo y no tiene texto alternativo.</p>
  </section>

  <section class="specimen-section" aria-labelledby="group-title">
    <h2 id="group-title">Grupo</h2>
    <div class="btn-group" role="group" aria-label="Vista del calendario">
      <button class="btn" type="button" aria-pressed="false">Día</button><button class="btn" type="button" aria-pressed="true">Semana</button><button class="btn" type="button" aria-pressed="false">Mes</button>
    </div>
    <p class="note">Los botones del grupo están escritos sin espacios entre ellos en el HTML: entre cajas en línea, un salto de línea sería un hueco visible.</p>
  </section>

  <section class="specimen-section" aria-labelledby="block-title">
    <h2 id="block-title">De ancho completo</h2>
    <div class="narrow">
      <button class="btn btn--primary btn--block" type="button">Pagar 48,90 €</button>
      <button class="btn btn--quiet btn--block" type="button">Seguir comprando</button>
    </div>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Sistema de botones
   - Una clase base (.btn) define la CAJA: display, relleno, borde, radio, altura
     mínima. Los modificadores solo cambian variables (--btn-*), nunca medidas.
   - Todo en em: un botón con otro font-size escala relleno, radio e icono.
   - Ningún estado cambia el tamaño: el borde existe siempre (transparente si hace
     falta) y el resto son sombras y outline, que no ocupan espacio.
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

  button,
  input {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border-strong: #64748b;
    --color-brand: #1d4ed8;
    --color-brand-strong: #1e40af;
    --color-brand-soft: #dbeafe;
    --color-danger: #b91c1c;
    --color-danger-strong: #991b1b;
    --color-danger-soft: #fee2e2;
    --color-disabled-bg: #e2e8f0;
    --color-disabled-fg: #475569;
    --color-focus: #1d4ed8;
    --color-focus-halo: #bfdbfe;

    --radius-md: 0.5em;
    --shadow-rest: 0 1px 2px rgb(15 23 42 / 0.12), 0 1px 3px rgb(15 23 42 / 0.08);
    --shadow-raised: 0 2px 4px rgb(15 23 42 / 0.12), 0 8px 16px rgb(15 23 42 / 0.12);
    --shadow-pressed: inset 0 2px 4px rgb(15 23 42 / 0.3);
  }
}

@layer base {
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.5;
  }

  :where(a) {
    color: var(--color-brand);
  }

  :where(code, kbd) {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.9em;
  }
}

@layer components {
  /* ─── Página del muestrario ─── */
  .specimen {
    width: min(100% - 2rem, 48rem);
    margin: 2rem auto;
  }

  .lead {
    max-width: 60ch;
    margin-block: 0.5rem 2rem;
    color: var(--color-text-muted);
  }

  .specimen-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-disabled-bg);
  }

  .specimen-section h2 {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
  }

  .note {
    max-width: 60ch;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .narrow {
    max-width: 20rem;
  }

  /* ─── La caja del botón ─── */
  .btn {
    --btn-bg: var(--color-surface);
    --btn-fg: var(--color-text);
    --btn-border: var(--color-border-strong);
    --btn-shadow: var(--shadow-rest);

    display: inline-block;              /* también para los <a>: aceptan relleno vertical */
    vertical-align: middle;             /* vertical-align llega en el módulo de flujo: alinea botones con y sin texto */
    min-height: 2.75em;                 /* 44px con 16px de letra (zona táctil) */
    margin: 0 0.5rem 0.75rem 0;         /* separa las filas cuando los botones saltan de línea */
    padding: 0.625em 1.125em;           /* 10px + 20px de línea + 10px + 2 × 2px de borde = 44px */
    border: 2px solid var(--btn-border);
    border-radius: var(--radius-md);
    background-color: var(--btn-bg);
    color: var(--btn-fg);
    box-shadow: var(--btn-shadow);
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }

  /* Los estados solo tocan variables, así que valen para todas las variantes */
  .btn:hover {
    --btn-shadow: var(--shadow-raised);
  }

  .btn:active {
    --btn-shadow: var(--shadow-pressed);
  }

  /* Anillo doble: claro pegado a la caja y oscuro por fuera. Se ve sobre fondos claros
     y oscuros. outline no ocupa sitio; outline-offset lo separa del borde. */
  .btn:focus-visible {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
    box-shadow: 0 0 0 2px var(--color-focus-halo);
  }

  /* ─── Variantes: solo colores ─── */
  .btn--primary {
    --btn-bg: var(--color-brand);
    --btn-fg: #ffffff;
    --btn-border: var(--color-brand);
  }

  .btn--primary:hover {
    --btn-bg: var(--color-brand-strong);
    --btn-border: var(--color-brand-strong);
  }

  .btn--danger {
    --btn-bg: var(--color-danger);
    --btn-fg: #ffffff;
    --btn-border: var(--color-danger);
  }

  .btn--danger:hover {
    --btn-bg: var(--color-danger-strong);
    --btn-border: var(--color-danger-strong);
  }

  /* Sin borde visible, pero el borde SIGUE ahí (transparente): mide lo mismo que los demás */
  .btn--quiet,
  .btn--link,
  .btn--danger-quiet {
    --btn-bg: transparent;
    --btn-border: transparent;
    --btn-shadow: none;
  }

  .btn--quiet:hover {
    --btn-bg: var(--color-disabled-bg);
    --btn-shadow: none;
  }

  .btn--link {
    --btn-fg: var(--color-brand);
    text-decoration: underline;
  }

  .btn--link:hover {
    --btn-shadow: none;
    --btn-fg: var(--color-brand-strong);
  }

  .btn--danger-quiet:hover {
    --btn-bg: var(--color-danger-soft);
    --btn-shadow: none;
  }

  /* Botón conmutable: el estado activo se dibuja con una sombra interior y un fondo */
  .btn[aria-pressed="true"] {
    --btn-bg: var(--color-brand-soft);
    --btn-border: var(--color-brand);
    --btn-fg: var(--color-brand-strong);
    --btn-shadow: var(--shadow-pressed);
  }

  .btn:disabled {
    --btn-bg: var(--color-disabled-bg);
    --btn-fg: var(--color-disabled-fg);
    --btn-border: var(--color-disabled-bg);
    --btn-shadow: none;
    cursor: not-allowed;
  }

  /* ─── Tamaños: solo font-size ─── */
  .btn--sm {
    font-size: 0.875rem;
  }

  .btn--lg {
    font-size: 1.125rem;
  }

  /* ─── Iconos de fondo ─── */
  /* El relleno inicial reserva el hueco del icono; background-position lo coloca dentro */
  .btn--with-icon {
    padding-inline-start: 2.75em;
    background-repeat: no-repeat;
    background-position: left 1em center;
    background-size: 1.25em;
  }

  /* Solo icono: un cuadrado (aspect-ratio) con el icono centrado. Sin relleno lateral,
     el ancho lo marcan min-height y la proporción. */
  .btn--icon-only {
    width: 2.75em;
    aspect-ratio: 1;
    padding: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 1.25em;
  }

  .icon-plus     { background-image: url("icon-plus.svg"); }
  .icon-download { background-image: url("icon-download.svg"); }
  .icon-edit     { background-image: url("icon-edit.svg"); }
  .icon-share    { background-image: url("icon-share.svg"); }
  .icon-trash    { background-image: url("icon-trash.svg"); }

  /* ─── Grupo: los bordes vecinos se solapan con un margen negativo ─── */
  .btn-group {
    margin-bottom: 0.75rem;
  }

  .btn-group .btn {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }

  /* −2px: cada botón se monta sobre el borde del anterior; en lugar de 4px de línea
     entre dos botones queda una sola de 2px. */
  .btn-group .btn + .btn {
    margin-left: -2px;
  }

  .btn-group .btn:first-child {
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }

  .btn-group .btn:last-child {
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }

  /* Dentro del grupo, el activo conserva el borde gris: si fuera azul, el botón de su
     derecha (pintado después) taparía la mitad de ese borde al solaparse. */
  .btn-group .btn[aria-pressed="true"] {
    --btn-border: var(--color-border-strong);
    box-shadow: var(--shadow-pressed);
  }

  /* El anillo de foco (outline) se pinta por encima de los vecinos aunque se solapen */
  .btn-group .btn:focus-visible {
    box-shadow: 0 0 0 2px var(--color-focus-halo);
  }

  /* ─── De ancho completo: un bloque ya llena su contenedor ─── */
  .btn--block {
    display: block;
    width: 100%;                        /* <button> no se estira solo aunque sea block */
    margin-right: 0;
  }
}
```
