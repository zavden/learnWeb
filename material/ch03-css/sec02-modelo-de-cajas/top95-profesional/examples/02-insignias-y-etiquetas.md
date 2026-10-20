---
example_description: "Insignias de estado, contadores que pasan de círculo a píldora, etiquetas con botón para quitarlas y recorte de texto largo, todo con cajas inline-block, min-width y border-radius"
example_tags: "css|profesional|insignias|inline-block|min-width|text-overflow"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="page">
  <h1>Insignias y etiquetas</h1>

  <section class="panel" aria-labelledby="status-title">
    <h2 id="status-title">Estado de los pedidos</h2>
    <table class="orders">
      <caption>Últimos pedidos de la tienda</caption>
      <thead>
        <tr><th scope="col">Pedido</th><th scope="col">Cliente</th><th scope="col">Estado</th></tr>
      </thead>
      <tbody>
        <tr><td>2026-1184</td><td>Paula Navarro</td><td><span class="badge badge--success">Entregado</span></td></tr>
        <tr><td>2026-1183</td><td>Andrés Molina</td><td><span class="badge badge--info">En camino</span></td></tr>
        <tr><td>2026-1182</td><td>Lucía Serrano</td><td><span class="badge badge--warning">Pago pendiente</span></td></tr>
        <tr><td>2026-1181</td><td>Hugo Castillo</td><td><span class="badge badge--danger">Devuelto</span></td></tr>
        <tr><td>2026-1180</td><td>Elena Prieto</td><td><span class="badge">Borrador</span></td></tr>
      </tbody>
    </table>
  </section>

  <section class="panel" aria-labelledby="counters-title">
    <h2 id="counters-title">Contadores</h2>
    <p class="row">
      <a class="nav-link" href="#">Bandeja de entrada <span class="counter">3</span></a>
      <a class="nav-link" href="#">Menciones <span class="counter">12</span></a>
      <a class="nav-link" href="#">Revisiones <span class="counter counter--muted">128</span></a>
    </p>
    <p class="row">
      <button class="icon-button" type="button" aria-label="Notificaciones: 9 sin leer"></button><span class="counter counter--overlap" aria-hidden="true">9</span>
      <button class="icon-button" type="button" aria-label="Notificaciones: 42 sin leer"></button><span class="counter counter--overlap" aria-hidden="true">42</span>
    </p>
    <p class="note">El número de las campanas se monta sobre el botón con un margen izquierdo negativo, sin posicionamiento. El botón ya anuncia la cifra en su <code>aria-label</code>, así que la insignia se oculta a los lectores de pantalla.</p>
  </section>

  <section class="panel" aria-labelledby="tags-title">
    <h2 id="tags-title">Etiquetas de un artículo</h2>
    <ul class="tag-list" aria-label="Etiquetas">
      <li class="tag"><span class="tag-label">Huerto urbano</span><button class="tag-remove" type="button" aria-label="Quitar la etiqueta Huerto urbano">×</button></li>
      <li class="tag"><span class="tag-label">Otoño</span><button class="tag-remove" type="button" aria-label="Quitar la etiqueta Otoño">×</button></li>
      <li class="tag"><span class="tag-label" title="Compostaje doméstico en pisos sin terraza ni balcón">Compostaje doméstico en pisos sin terraza ni balcón</span><button class="tag-remove" type="button" aria-label="Quitar la etiqueta Compostaje doméstico en pisos sin terraza ni balcón">×</button></li>
      <li class="tag"><span class="tag-label">Riego</span><button class="tag-remove" type="button" aria-label="Quitar la etiqueta Riego">×</button></li>
    </ul>
    <p class="note">La etiqueta larga se recorta con «…» a partir de 12rem; el texto completo está en su <code>title</code> y en el nombre accesible del botón.</p>
  </section>

  <section class="panel" aria-labelledby="misc-title">
    <h2 id="misc-title">Otras insignias</h2>
    <p class="row">
      <span class="badge badge--dot badge--success">En línea</span>
      <span class="badge badge--dot badge--warning">Ausente</span>
      <span class="badge badge--dot">Desconectada</span>
    </p>
    <p class="row">
      <span class="version">v2.4.1</span>
      <span class="badge badge--solid">Nuevo</span>
      <span class="badge badge--outline">Beta</span>
      Guarda con <kbd>Ctrl</kbd> + <kbd>S</kbd>
    </p>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Insignias y etiquetas
   - Todas son cajas inline-block: viven dentro del texto, pero respetan su
     relleno vertical, su ancho mínimo y su radio.
   - Medidas en em: una insignia dentro de un título crece con el título.
   - Los tonos son pares de variables (--tone-bg / --tone-fg) con contraste
     medido (≥ 4,5:1); las variantes solo cambian esas variables.
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

  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-border-strong: #64748b;
    --color-brand: #1d4ed8;
    --color-focus: #1d4ed8;

    --tone-neutral-bg: #e2e8f0;  --tone-neutral-fg: #334155;
    --tone-info-bg: #dbeafe;     --tone-info-fg: #1e40af;
    --tone-success-bg: #dcfce7;  --tone-success-fg: #166534;
    --tone-warning-bg: #fef3c7;  --tone-warning-fg: #92400e;
    --tone-danger-bg: #fee2e2;   --tone-danger-fg: #991b1b;

    --radius-sm: 0.375rem;
    --radius-pill: 999px;
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

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  .page {
    width: min(100% - 2rem, 46rem);
    margin: 2rem auto;
  }

  .page h1 {
    margin-bottom: 1.5rem;
  }

  .panel {
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-surface);
  }

  .panel h2 {
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
  }

  .row {
    margin-bottom: 0.75rem;
  }

  .note {
    max-width: 60ch;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  /* ─── Insignia ─── */
  .badge {
    --tone-bg: var(--tone-neutral-bg);
    --tone-fg: var(--tone-neutral-fg);

    display: inline-block;
    padding: 0.125em 0.625em;
    border: 1px solid transparent;      /* reservado: la variante outline solo le da color */
    border-radius: var(--radius-pill);
    background: var(--tone-bg);
    color: var(--tone-fg);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;                /* «Pago pendiente» nunca se parte en dos líneas */
  }

  .badge--info    { --tone-bg: var(--tone-info-bg);    --tone-fg: var(--tone-info-fg); }
  .badge--success { --tone-bg: var(--tone-success-bg); --tone-fg: var(--tone-success-fg); }
  .badge--warning { --tone-bg: var(--tone-warning-bg); --tone-fg: var(--tone-warning-fg); }
  .badge--danger  { --tone-bg: var(--tone-danger-bg);  --tone-fg: var(--tone-danger-fg); }

  .badge--solid {
    --tone-bg: var(--color-brand);
    --tone-fg: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .badge--outline {
    --tone-bg: transparent;
    --tone-fg: var(--tone-info-fg);
    border-color: currentColor;
  }

  /* Punto de estado: un pseudoelemento inline-block cuadrado y redondo.
     Es decoración (el texto ya dice el estado), por eso content va vacío. */
  .badge--dot::before {
    content: "";
    display: inline-block;
    width: 0.5em;
    aspect-ratio: 1;
    margin-right: 0.4em;
    border-radius: 50%;
    background: currentColor;
    vertical-align: 0.1em;              /* vertical-align llega en el módulo de flujo: sube el punto al centro de la letra */
  }

  /* ─── Tabla de pedidos ─── */
  .orders {
    width: 100%;
    border-collapse: collapse;
  }

  .orders caption {
    margin-bottom: 0.5rem;
    color: var(--color-text-muted);
    text-align: start;
  }

  .orders th,
  .orders td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    text-align: start;
  }

  /* ─── Contador: min-width + radio de píldora ─── */
  /* Con una cifra, min-width manda y la caja es un círculo; con más cifras,
     el contenido la ensancha y el mismo radio la convierte en píldora. */
  .counter {
    display: inline-block;
    min-width: 1.5em;
    padding: 0 0.4em;
    border-radius: var(--radius-pill);
    background: var(--color-brand);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.5em;
    text-align: center;
  }

  .counter--muted {
    background: var(--tone-neutral-bg);
    color: var(--tone-neutral-fg);
  }

  .nav-link {
    display: inline-block;
    margin: 0 1rem 0.5rem 0;
    padding: 0.25rem 0;
  }

  /* Botón cuadrado con un icono de fondo */
  .icon-button {
    width: 2.75rem;
    aspect-ratio: 1;
    padding: 0;
    border: 1px solid var(--color-border-strong);
    border-radius: 10px;
    background: var(--color-surface) url("icon-bell.svg") center / 1.25rem no-repeat;
    cursor: pointer;
    vertical-align: middle;             /* vertical-align llega en el módulo de flujo */
  }

  /* El margen izquierdo negativo mete el contador dentro del botón de su izquierda;
     el derecho devuelve el espacio para que el siguiente botón no se pegue.
     Las cajas en línea se pintan en el orden del HTML: el contador queda encima. */
  .counter--overlap {
    margin: 0 1.25rem 0 -1rem;
    border: 2px solid var(--color-surface);   /* aro que lo separa del icono */
    vertical-align: top;                      /* lo sube a la esquina de arriba */
  }

  /* ─── Etiquetas que se pueden quitar ─── */
  .tag-list {
    padding: 0;
    list-style: none;
  }

  .tag {
    display: inline-block;
    max-width: 100%;
    margin: 0 0.375rem 0.5rem 0;
    padding: 0.125rem 0.25rem 0.125rem 0.75rem;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    white-space: nowrap;                /* texto y botón siempre en la misma línea */
  }

  /* Recorte con «…»: un inline-block con ancho máximo y la receta de tres propiedades.
     Ojo: un inline-block con overflow distinto de visible pone su línea base en el
     borde inferior y se desalinea; vertical-align lo corrige (módulo de flujo). */
  .tag-label {
    display: inline-block;
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }

  .tag-remove {
    width: 1.5rem;
    aspect-ratio: 1;
    margin-left: 0.25rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--color-text-muted);
    font-size: 1.125rem;
    line-height: 1;
    cursor: pointer;
    vertical-align: middle;
  }

  .tag-remove:hover {
    background: var(--tone-danger-bg);
    color: var(--tone-danger-fg);
  }

  /* ─── Versión y teclas ─── */
  .version {
    display: inline-block;
    margin-right: 0.25rem;
    padding: 0 0.4em;
    border-radius: var(--radius-sm);
    background: #0f172a;
    color: #e2e8f0;
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.8125rem;
  }

  /* Una tecla: el borde inferior más grueso hace de «canto». Es un borde,
     así que ocupa sitio, pero nunca cambia: no hay saltos. */
  kbd {
    display: inline-block;
    min-width: 1.75em;
    padding: 0 0.35em;
    border: 1px solid var(--color-border-strong);
    border-bottom-width: 3px;
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 0.8125rem;
    text-align: center;
  }
}
```
