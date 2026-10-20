---
example_description: "Un centro de notificaciones: cabecera con acción a la derecha, filtros con contadores, grupos por día y notificaciones como media objects con indicador de no leída, icono de tipo sobre el avatar y acciones que se reparten en líneas"
example_tags: "css|profesional|flexbox|notificaciones|media-object|margin-auto|flex-wrap"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="notifications" aria-labelledby="notifications-title">
  <header class="notifications-header">
    <h1 id="notifications-title">Notificaciones</h1>
    <p class="unread-count">3 sin leer</p>
    <button class="link-button" type="button">Marcar todo como leído</button>
  </header>

  <nav aria-label="Filtrar notificaciones">
    <ul class="filters">
      <li><a href="/notificaciones" aria-current="page">Todas <span class="count">9</span></a></li>
      <li><a href="/notificaciones?tipo=menciones">Menciones <span class="count">2</span></a></li>
      <li><a href="/notificaciones?tipo=pedidos">Pedidos <span class="count">4</span></a></li>
      <li><a href="/notificaciones?tipo=talleres">Talleres <span class="count">3</span></a></li>
    </ul>
  </nav>

  <section aria-labelledby="today-title">
    <h2 id="today-title" class="day">Hoy</h2>
    <ul class="list">
      <li class="notification is-unread">
        <span class="figure">
          <img src="avatar-1.svg" alt="" width="40" height="40">
          <span class="type is-mention" aria-hidden="true">@</span>
        </span>
        <div class="body">
          <p><strong>Marta García</strong> te mencionó en «Hojas amarillas en la monstera»: «@ana, ¿a la tuya también le pasó tras el trasplante?»</p>
          <p class="meta"><time datetime="2026-10-13T10:20">hace 15 min</time> · Blog</p>
          <div class="actions">
            <a class="button is-primary" href="/blog/monstera-hojas-amarillas#comentario-311">Responder</a>
          </div>
        </div>
        <span class="unread-dot" role="img" aria-label="Sin leer"></span>
      </li>
      <li class="notification is-unread">
        <span class="figure">
          <span class="figure-icon" aria-hidden="true">🚚</span>
        </span>
        <div class="body">
          <p>Tu pedido <strong>4821</strong> salió del vivero. Llega el jueves 15 entre las 9:00 y las 14:00.</p>
          <p class="meta"><time datetime="2026-10-13T09:12">hace 1 h</time> · Pedidos</p>
          <div class="actions">
            <a class="button" href="/cuenta/pedidos/4821">Seguir el envío</a>
          </div>
        </div>
        <span class="unread-dot" role="img" aria-label="Sin leer"></span>
      </li>
    </ul>
  </section>

  <section aria-labelledby="week-title">
    <h2 id="week-title" class="day">Esta semana</h2>
    <ul class="list">
      <li class="notification is-unread">
        <span class="figure">
          <img src="avatar-3.svg" alt="" width="40" height="40">
          <span class="type is-invite" aria-hidden="true">+</span>
        </span>
        <div class="body">
          <p><strong>Luis Gómez</strong> te invitó al taller <strong>Kokedamas para principiantes</strong>, el sábado 18 a las 11:00.</p>
          <p class="meta"><time datetime="2026-10-11T18:40">sábado</time> · Talleres · 4 lugares libres</p>
          <div class="actions">
            <button class="button is-primary" type="button">Aceptar</button>
            <button class="button" type="button">Ahora no</button>
            <a class="button is-quiet" href="/talleres/kokedamas">Ver detalles</a>
          </div>
        </div>
        <span class="unread-dot" role="img" aria-label="Sin leer"></span>
      </li>
      <li class="notification">
        <span class="figure">
          <img src="avatar-2.svg" alt="" width="40" height="40">
          <span class="type is-like" aria-hidden="true">♥</span>
        </span>
        <div class="body">
          <p>A <strong>Laura Méndez</strong> y 11 personas más les gustó tu foto «Mi rincón de suculentas».</p>
          <p class="meta"><time datetime="2026-10-09T12:05">jueves</time> · Comunidad</p>
        </div>
      </li>
    </ul>
  </section>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Centro de notificaciones
   - Cabecera: título y contador por la línea base; la acción, al final con
     margin-left: auto (y en su propia línea si no cabe).
   - Filtros: fila que se parte en líneas; cada filtro centra su texto y su
     contador con inline-flex.
   - Notificación: media object de tres piezas. Figura rígida (con el icono de
     tipo colocado en su esquina con position), cuerpo flexible con min-width: 0
     y el punto de «sin leer» rígido al final, todos alineados arriba.
   - Acciones: botones y enlaces que se reparten en líneas con gap.
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
  }

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
    --color-unread: #eff6ff;
    --color-accent: #1d4ed8;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --radius: 0.75rem;
    --figure: 2.5rem;
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
  .notifications {
    max-width: 40rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4);
  }

  /* ─── Cabecera ─── */
  .notifications-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-3);
    margin-bottom: var(--space-3);
  }

  .notifications-header h1 {
    font-size: 1.6rem;
  }

  .unread-count {
    color: var(--color-muted);
  }

  .link-button {
    margin-left: auto;
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-weight: 600;
    text-decoration: underline;
    cursor: pointer;
  }

  /* ─── Filtros ─── */
  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    padding: 0;
    list-style: none;
  }

  .filters a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    border: 1px solid #64748b;
    border-radius: 999px;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .filters a[aria-current="page"] {
    border-color: var(--color-text);
    background: var(--color-text);
    color: #ffffff;
  }

  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4rem;
    height: 1.4rem;
    padding: 0 0.35rem;
    border-radius: 999px;
    background: var(--color-border);
    color: var(--color-text);
    font-size: 0.75rem;
    font-weight: 700;
  }

  /* ─── Grupos por día ─── */
  .day {
    margin-block: var(--space-4) var(--space-2);
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: 0;
    list-style: none;
  }

  /* ─── Notificación ─── */
  .notification {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  .notification.is-unread {
    border-color: #bfdbfe;
    background: var(--color-unread);
  }

  /* La figura: rígida y referencia del icono de tipo de su esquina. */
  .figure {
    position: relative;
    flex: none;
  }

  .figure img {
    border-radius: 50%;
  }

  .figure-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--figure);
    height: var(--figure);
    border-radius: 50%;
    background: #dcfce7;
    font-size: 1.2rem;
  }

  .type {
    position: absolute;
    right: -0.25rem;
    bottom: -0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--color-surface);
    border-radius: 50%;
    color: #ffffff;
    font-size: 0.65rem;
    font-weight: 800;
  }

  .type.is-mention {
    background: var(--color-accent);
  }

  .type.is-invite {
    background: #166534;
  }

  .type.is-like {
    background: #b91c1c;
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    flex: 1;
    min-width: 0;
    font-size: 0.9rem;
  }

  .meta {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .button {
    padding: var(--space-1) var(--space-3);
    border: 1px solid #64748b;
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }

  .button.is-primary {
    border-color: var(--color-accent);
    background: var(--color-accent);
    color: #ffffff;
  }

  .button.is-quiet {
    border-color: transparent;
    background: none;
    color: var(--color-accent);
    text-decoration: underline;
  }

  /* El punto de «sin leer», rígido y centrado en la primera línea. */
  .unread-dot {
    flex: none;
    width: 0.6rem;
    height: 0.6rem;
    margin-top: calc((1lh - 0.6rem) / 2);
    border-radius: 50%;
    background: var(--color-accent);
  }
}
```
