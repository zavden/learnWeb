---
example_description: "Una aplicación de correo: carpetas que pasan de columna lateral a fila cuando falta sitio, barra de herramientas con el contador a la derecha y filas con remitente de ancho fijo, asunto recortado, etiquetas, adjuntos y fecha"
example_tags: "css|profesional|flexbox|correo|ellipsis|flex-basis|flex-wrap|sidebar"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="mail-app">
  <nav class="folders" aria-label="Carpetas">
    <a class="compose" href="/correo/redactar">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
      Redactar
    </a>
    <ul class="folder-list">
      <li><a href="/correo/recibidos" aria-current="page"><span>Recibidos</span> <span class="folder-count">12</span></a></li>
      <li><a href="/correo/destacados"><span>Destacados</span></a></li>
      <li><a href="/correo/enviados"><span>Enviados</span></a></li>
      <li><a href="/correo/borradores"><span>Borradores</span> <span class="folder-count">2</span></a></li>
      <li><a href="/correo/spam"><span>Spam</span></a></li>
      <li><a href="/correo/papelera"><span>Papelera</span></a></li>
    </ul>
  </nav>

  <main class="mailbox" aria-labelledby="mailbox-title">
    <div class="mailbox-header">
      <h1 id="mailbox-title">Recibidos</h1>
      <p class="range">1–25 de 312</p>
      <div class="pager">
        <a class="icon-button" href="/correo/recibidos?pagina=1" aria-label="Página anterior">‹</a>
        <a class="icon-button" href="/correo/recibidos?pagina=2" aria-label="Página siguiente">›</a>
      </div>
    </div>

    <div class="toolbar">
      <label class="select-all"><input type="checkbox" name="todos"> Todos</label>
      <button type="button">Archivar</button>
      <button type="button">Eliminar</button>
      <button type="button">Marcar como leído</button>
    </div>

    <ul class="mail-list">
      <li class="mail is-unread">
        <input type="checkbox" aria-label="Seleccionar: Tu paquete está en camino">
        <button class="star" type="button" aria-pressed="true" aria-label="Destacar">★</button>
        <a class="mail-link" href="/correo/8231">
          <span class="mail-from">Paquetería Estafeta Mexicana</span>
          <span class="mail-body"><span class="label is-orders">Pedidos</span><strong>Tu paquete está en camino</strong> · Llegará el jueves 15 entre las 9:00 y las 14:00. Guía 7723 4410 9981.</span>
          <time datetime="2026-10-13T09:12">9:12</time>
        </a>
      </li>
      <li class="mail is-unread">
        <input type="checkbox" aria-label="Seleccionar: Factura de octubre">
        <button class="star" type="button" aria-pressed="false" aria-label="Destacar">★</button>
        <a class="mail-link" href="/correo/8229">
          <span class="mail-from">CFE</span>
          <span class="mail-body"><span class="label is-bills">Facturas</span><strong>Factura de octubre</strong> · Tu recibo por 486,00 MXN ya está disponible. Fecha límite: 28 de octubre.</span>
          <span class="clip" role="img" aria-label="Con archivo adjunto">📎</span>
          <time datetime="2026-10-12">ayer</time>
        </a>
      </li>
      <li class="mail">
        <input type="checkbox" aria-label="Seleccionar: Fotos del viaje a Oaxaca">
        <button class="star" type="button" aria-pressed="false" aria-label="Destacar">★</button>
        <a class="mail-link" href="/correo/8217">
          <span class="mail-from">Carmen Ortiz</span>
          <span class="mail-body"><strong>Fotos del viaje a Oaxaca</strong> · ¡Por fin las subí! Las del mercado de Tlacolula quedaron preciosas.</span>
          <span class="clip" role="img" aria-label="Con archivo adjunto">📎</span>
          <time datetime="2026-10-10">10 oct.</time>
        </a>
      </li>
      <li class="mail">
        <input type="checkbox" aria-label="Seleccionar: Tu taller del sábado">
        <button class="star" type="button" aria-pressed="false" aria-label="Destacar">★</button>
        <a class="mail-link" href="/correo/8202">
          <span class="mail-from">Vivero Xochi</span>
          <span class="mail-body"><span class="label is-orders">Pedidos</span><strong>Tu taller del sábado</strong> · Trae guantes y una maceta de 15 cm; nosotros ponemos la tierra.</span>
          <time datetime="2026-10-08">8 oct.</time>
        </a>
      </li>
      <li class="mail">
        <input type="checkbox" aria-label="Seleccionar: Confirmación de cita">
        <button class="star" type="button" aria-pressed="false" aria-label="Destacar">★</button>
        <a class="mail-link" href="/correo/8188">
          <span class="mail-from">Clínica Dental Sonrisa del Bajío</span>
          <span class="mail-body"><strong>Confirmación de cita</strong> · Te esperamos el martes 21 a las 17:30. Si no puedes venir, avísanos con 24 horas.</span>
          <time datetime="2026-10-06">6 oct.</time>
        </a>
      </li>
    </ul>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Bandeja de correo
   - Esqueleto: barra lateral que se apila (carpetas: base 11rem; bandeja:
     base 22rem y flex-grow 999). Las carpetas van primero en el HTML.
   - Truco de las carpetas: la lista es una fila con flex-wrap y cada carpeta
     tiene base de 9rem. En la columna lateral de 11rem solo cabe una por línea
     (parece una columna); cuando la barra se apila arriba y tiene todo el
     ancho, caben varias por línea. Un solo CSS, dos formas.
   - Cada fila es un flex dentro de otro: casilla, estrella y enlace; el enlace
     lleva remitente (0 0 8rem), cuerpo (flex: 1) y fecha. Los dos niveles
     llevan min-width: 0 para que los «…» de dentro puedan aparecer.
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

  svg {
    display: block;
    flex: none;
  }

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #e2e8f0;
    --color-surface: #ffffff;
    --color-soft: #f1f5f9;
    --color-accent: #1d4ed8;
    --color-accent-soft: #dbeafe;
    --color-star: #a16207;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --radius: 0.5rem;
  }
}

@layer base {
  body {
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  a {
    color: inherit;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Esqueleto ─── */
  .mail-app {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-4);
    max-width: 64rem;
    margin-inline: auto;
    padding: var(--space-4);
  }

  .folders {
    flex: 1 1 11rem;
  }

  .mailbox {
    flex: 999 1 22rem;
    min-width: 0;
  }

  /* ─── Carpetas ─── */
  .compose {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    padding: var(--space-2) var(--space-4);
    border-radius: 999px;
    background: var(--color-accent);
    color: #ffffff;
    font-weight: 600;
    text-decoration: none;
  }

  .folder-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    padding: 0;
    list-style: none;
  }

  .folder-list li {
    flex: 1 1 9rem;
  }

  /* Nombre a la izquierda y recuento a la derecha. */
  .folder-list a {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    border-radius: 999px;
    text-decoration: none;
  }

  .folder-list a:hover {
    background: var(--color-soft);
  }

  .folder-list a[aria-current="page"] {
    background: var(--color-accent-soft);
    font-weight: 700;
  }

  .folder-count {
    margin-left: auto;
    font-size: 0.8rem;
  }

  /* ─── Cabecera y barra de herramientas ─── */
  .mailbox-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
  }

  .mailbox-header h1 {
    font-size: 1.4rem;
  }

  .range {
    margin-left: auto;
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .pager {
    display: flex;
    gap: var(--space-1);
    align-self: center;
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    font-size: 1.25rem;
    line-height: 1;
    text-decoration: none;
  }

  .icon-button:hover {
    background: var(--color-soft);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    padding-block: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.85rem;
  }

  .select-all {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-right: var(--space-2);
    padding-left: var(--space-2);
  }

  .toolbar button {
    padding: var(--space-1) var(--space-3);
    border: 1px solid #64748b;
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
  }

  /* ─── Filas ─── */
  .mail-list {
    padding: 0;
    list-style: none;
  }

  .mail {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-bottom: 1px solid var(--color-border);
    font-size: 0.85rem;
  }

  .mail:hover {
    background: var(--color-soft);
  }

  .mail input {
    flex: none;
  }

  .star {
    flex: none;
    padding: 0;
    border: 0;
    background: none;
    color: #64748b;
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
  }

  .star[aria-pressed="true"] {
    color: var(--color-star);
  }

  .mail-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex: 1;
    min-width: 0;
    text-decoration: none;
  }

  .mail-from {
    flex: 0 0 8rem;
  }

  .mail-from,
  .mail-body {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .mail-body {
    flex: 1;
    color: var(--color-muted);
  }

  .mail-body strong {
    color: var(--color-text);
    font-weight: 600;
  }

  .is-unread .mail-from,
  .is-unread .mail-body strong {
    font-weight: 800;
  }

  /* Etiqueta delante del asunto, dentro de la línea recortada. */
  .label {
    margin-right: var(--space-2);
    padding: 0 var(--space-2);
    border-radius: 999px;
    font-size: 0.75rem;
  }

  .label.is-orders {
    background: #dcfce7;
    color: #14532d;
  }

  .label.is-bills {
    background: #fef3c7;
    color: #92400e;
  }

  .clip,
  .mail time {
    flex: none;
  }

  .mail time {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .mail-link:hover strong {
    text-decoration: underline;
  }
}
```
