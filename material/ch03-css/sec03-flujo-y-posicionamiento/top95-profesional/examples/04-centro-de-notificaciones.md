---
example_description: "Un centro de notificaciones: campana con contador en la esquina, panel desplegable con cabecera sticky y scroll propio, avatares con punto de presencia y elementos con el avatar flotante junto a un texto BFC; el contenido aislado nunca tapa el panel"
example_tags: "css|profesional|position|sticky|z-index|isolation|float|flow-root"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="app-header">
  <a class="brand" href="#">Obrador</a>
  <nav class="app-nav" aria-label="Principal">
    <a href="#" aria-current="page">Proyectos</a>
    <a href="#">Equipo</a>
  </nav>

  <details class="notifications" open>
    <summary class="bell" aria-label="Notificaciones: 3 sin leer">
      <img src="icon-bell.svg" width="24" height="24" alt="">
      <span class="bell-count" aria-hidden="true">3</span>
    </summary>

    <section class="panel" aria-labelledby="panel-title">
      <header class="panel-header">
        <h2 class="panel-title" id="panel-title">Notificaciones</h2>
        <a class="panel-action" href="#">Marcar todo como leído</a>
      </header>
      <ul class="notification-list">
        <li class="notification is-unread">
          <span class="avatar"><img src="avatar-1.svg" width="96" height="96" alt=""><span class="presence" aria-hidden="true"></span></span>
          <div class="notification-body">
            <p><strong>Paula Navarro</strong> comentó en <a href="#">Reforma de la cocina</a>: «¿Podemos mover la isla 20 cm a la izquierda?»</p>
            <p class="notification-meta"><time datetime="2026-10-12T09:41">hace 5 min</time> · <span class="unread">Sin leer</span></p>
          </div>
        </li>
        <li class="notification is-unread">
          <span class="avatar"><img src="avatar-2.svg" width="96" height="96" alt=""></span>
          <div class="notification-body">
            <p><strong>Andrés Molina</strong> subió 4 fotos a <a href="#">Baño principal</a>.</p>
            <p class="notification-meta"><time datetime="2026-10-12T08:15">hace 1 h</time> · <span class="unread">Sin leer</span></p>
          </div>
        </li>
        <li class="notification is-unread">
          <span class="avatar"><img src="avatar-3.svg" width="96" height="96" alt=""><span class="presence" aria-hidden="true"></span></span>
          <div class="notification-body">
            <p><strong>Lucía Serrano</strong> aprobó el presupuesto de <a href="#">Terraza</a>.</p>
            <p class="notification-meta"><time datetime="2026-10-11T18:02">ayer</time> · <span class="unread">Sin leer</span></p>
          </div>
        </li>
        <li class="notification">
          <span class="avatar"><img src="avatar-2.svg" width="96" height="96" alt=""></span>
          <div class="notification-body">
            <p><strong>Andrés Molina</strong> te asignó la tarea <a href="#">Pedir azulejos</a>.</p>
            <p class="notification-meta"><time datetime="2026-10-10T12:30">10 de octubre</time></p>
          </div>
        </li>
      </ul>
    </section>
  </details>
</header>

<main class="content">
  <h1>Proyectos activos</h1>
  <ul class="projects">
    <li class="project"><span class="project-flag">Urgente</span><h2>Reforma de la cocina</h2><p>Entrega prevista: 30 de octubre</p></li>
    <li class="project"><h2>Baño principal</h2><p>Entrega prevista: 14 de noviembre</p></li>
    <li class="project"><h2>Terraza</h2><p>Entrega prevista: 2 de diciembre</p></li>
  </ul>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Centro de notificaciones
   - La campana es el summary de un details. Su contador va en la esquina
     (summary relative + contador absolute con desplazamientos negativos).
   - El panel cuelga de la campana (absolute, top: 100%, right: 0), con altura
     máxima y scroll propio. Su cabecera es sticky DENTRO del panel.
   - Cada notificación es un «media object» de los de antes de flexbox: el avatar
     flota y el texto es un BFC (flow-root) que se coloca a su lado sin rodearlo.
   - Escala de z-index: el panel (dropdown) sobre el contenido, que además está
     aislado: la insignia «Urgente» no puede salir a competir con el panel.
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
    --color-bg: #f1f5f9;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-brand: #0f766e;
    --color-unread-bg: #f0fdfa;
    --color-alert: #b91c1c;
    --color-focus: #1d4ed8;

    --radius: 12px;
    --z-raised: 1;
    --z-header: 150;
    --z-dropdown: 160;
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
  /* ─── Cabecera ───
     relative + z-index: crea un contexto por encima del contenido (que está aislado
     en la capa 0), y con él todo lo que cuelga de ella, panel incluido. */
  .app-header {
    position: relative;
    z-index: var(--z-header);
    display: flow-root;                  /* contiene la campana flotante */
    padding: 0.5rem clamp(1rem, 4vw, 2rem);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    line-height: 2.75rem;
  }

  .brand {
    margin-right: 1.5rem;
    color: var(--color-text);
    font-size: 1.15rem;
    font-weight: 800;
    text-decoration: none;
  }

  .app-nav a {
    margin-right: 1rem;
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .app-nav [aria-current="page"] {
    color: var(--color-text);
    font-weight: 600;
  }

  /* La campana flota a la derecha y es la referencia del panel. */
  .notifications {
    position: relative;
    float: right;
    line-height: 1.5;
  }

  .bell {
    position: relative;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    list-style: none;                    /* sin el triángulo del details */
    cursor: pointer;
  }

  .bell-count {
    position: absolute;
    top: -0.3rem;
    right: -0.4rem;
    min-width: 1.3rem;
    padding: 0 0.3rem;
    border: 2px solid var(--color-surface);
    border-radius: 999px;
    background: var(--color-alert);
    color: #ffffff;
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1.1rem;
    text-align: center;
  }

  /* ─── Panel ───
     Alineado con el borde derecho de la campana y con un ancho que nunca pasa de la
     ventana. Su altura máxima y su scroll hacen que la cabecera sticky tenga recorrido. */
  .panel {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    z-index: var(--z-dropdown);
    width: min(22rem, 100vw - 2rem);
    max-height: min(24rem, 70vh);
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    box-shadow: 0 16px 40px rgb(15 23 42 / 0.18);
  }

  .panel-header {
    position: sticky;
    top: 0;
    z-index: var(--z-raised);            /* por encima de los elementos que pasan por debajo */
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .panel-title {
    display: inline;
    margin-right: 0.5rem;
    font-size: 1rem;
  }

  .panel-action {
    font-size: 0.85rem;
  }

  .notification-list {
    padding: 0;
    list-style: none;
  }

  .notification {
    display: flow-root;                  /* contiene el avatar flotante */
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
    font-size: 0.9rem;
  }

  .notification.is-unread {
    background: var(--color-unread-bg);
  }

  /* El avatar flota y es la referencia de su punto de presencia. */
  .avatar {
    position: relative;
    float: left;
    width: 2.5rem;
    margin-right: 0.75rem;
  }

  .avatar img {
    border-radius: 50%;
  }

  .presence {
    position: absolute;
    right: -0.1rem;
    bottom: -0.1rem;
    width: 0.85rem;
    height: 0.85rem;
    border: 2px solid var(--color-surface);
    border-radius: 50%;
    background: #16a34a;
  }

  /* Un BFC no se mete debajo del flotante: las líneas largas no rodean al avatar,
     todo el texto queda en su propia columna. */
  .notification-body {
    display: flow-root;
  }

  .notification-meta {
    margin-top: 0.15rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
  }

  .unread {
    display: inline-block;
    padding: 0 0.45rem;
    border-radius: 999px;
    background: #ccfbf1;
    color: #115e59;
    font-weight: 600;
  }

  /* ─── Contenido ─── */
  .content {
    isolation: isolate;                  /* nada de aquí dentro puede tapar el panel */
    width: min(100% - 2rem, 48rem);
    margin: 1.5rem auto;
  }

  .content h1 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }

  .projects {
    padding: 0;
    list-style: none;
  }

  .project {
    position: relative;
    margin-bottom: 0.75rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  .project h2 {
    font-size: 1.05rem;
  }

  .project p {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  /* Alguien le puso un z-index alto «por si acaso»: el aislamiento de .content lo deja sin efecto fuera. */
  .project-flag {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 500;
    padding: 0 0.6rem;
    border-radius: 999px;
    background: #fee2e2;
    color: #991b1b;
    font-size: 0.8rem;
    font-weight: 700;
  }
}
```
