---
example_description: "Una página de ajustes: pestañas que se reparten en líneas, filas de etiqueta y control que bajan el control debajo cuando no cabe, interruptores accesibles hechos con casillas, una zona de peligro y una barra de acciones sticky"
example_tags: "css|profesional|flexbox|ajustes|formularios|interruptor|flex-wrap|sticky"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="settings">
  <h1>Ajustes de la cuenta</h1>

  <nav aria-label="Secciones de ajustes">
    <ul class="tabs">
      <li><a href="/cuenta/ajustes/perfil">Perfil</a></li>
      <li><a href="/cuenta/ajustes/notificaciones" aria-current="page">Notificaciones</a></li>
      <li><a href="/cuenta/ajustes/privacidad">Privacidad</a></li>
      <li><a href="/cuenta/ajustes/facturacion">Facturación</a></li>
    </ul>
  </nav>

  <form class="settings-form" action="/cuenta/ajustes/notificaciones" method="post">
    <section class="group" aria-labelledby="email-title">
      <h2 id="email-title">Correo electrónico</h2>

      <div class="setting">
        <div class="setting-text">
          <p class="setting-name" id="orders-name">Estado de mis pedidos</p>
          <p class="setting-help" id="orders-help">Te avisamos cuando tu pedido salga del vivero y cuando llegue.</p>
        </div>
        <label class="switch">
          <input type="checkbox" role="switch" name="pedidos" checked aria-labelledby="orders-name" aria-describedby="orders-help">
          <span class="switch-track" aria-hidden="true"></span>
        </label>
      </div>

      <div class="setting">
        <div class="setting-text">
          <p class="setting-name" id="tips-name">Guía semanal de cuidados</p>
          <p class="setting-help" id="tips-help">Un correo cada martes con lo que necesitan tus plantas según la temporada.</p>
        </div>
        <label class="switch">
          <input type="checkbox" role="switch" name="guia" checked aria-labelledby="tips-name" aria-describedby="tips-help">
          <span class="switch-track" aria-hidden="true"></span>
        </label>
      </div>

      <div class="setting">
        <div class="setting-text">
          <p class="setting-name" id="offers-name">Ofertas y novedades</p>
          <p class="setting-help" id="offers-help">Como mucho, dos correos al mes.</p>
        </div>
        <label class="switch">
          <input type="checkbox" role="switch" name="ofertas" aria-labelledby="offers-name" aria-describedby="offers-help">
          <span class="switch-track" aria-hidden="true"></span>
        </label>
      </div>
    </section>

    <section class="group" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Horario</h2>

      <div class="setting">
        <div class="setting-text">
          <label class="setting-name" for="zone">Zona horaria</label>
          <p class="setting-help" id="zone-help">Para enviarte los recordatorios de riego a una hora razonable.</p>
        </div>
        <select id="zone" name="zona" aria-describedby="zone-help">
          <option value="America/Mexico_City" selected>Ciudad de México (UTC−6)</option>
          <option value="America/Cancun">Cancún (UTC−5)</option>
          <option value="America/Tijuana">Tijuana (UTC−8 / −7)</option>
        </select>
      </div>

      <div class="setting">
        <div class="setting-text">
          <label class="setting-name" for="reminder">Hora de los recordatorios</label>
          <p class="setting-help" id="reminder-help">Los avisos de «toca regar» llegan a esta hora.</p>
        </div>
        <input id="reminder" type="time" name="hora" value="08:30" aria-describedby="reminder-help">
      </div>
    </section>

    <section class="group is-danger" aria-labelledby="danger-title">
      <h2 id="danger-title">Zona de peligro</h2>
      <div class="setting">
        <div class="setting-text">
          <p class="setting-name">Darse de baja de todos los correos</p>
          <p class="setting-help">Seguirás recibiendo los avisos legales y los de tus pedidos en curso.</p>
        </div>
        <button class="button is-danger" type="submit" name="accion" value="baja-total">Darme de baja</button>
      </div>
    </section>

    <div class="form-bar">
      <p class="form-status">Los cambios se aplican al guardar.</p>
      <button class="button" type="reset">Descartar</button>
      <button class="button is-primary" type="submit" name="accion" value="guardar">Guardar cambios</button>
    </div>
  </form>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Página de ajustes
   - Cada ajuste es una fila con flex-wrap: el texto quiere 14rem y crece con
     todo lo que sobra (flex-grow 999); el control mide lo suyo. Si no caben
     juntos, el control baja debajo del texto. Sin media queries.
   - Interruptor: una casilla de verdad (role="switch") que ocupa toda la pista
     con opacity: 0; la pista y la bola se dibujan con un span y su ::before.
     El foco y el estado se leen de la casilla con :has().
   - Barra de acciones sticky abajo: estado a la izquierda (flex: 1) y botones
     a la derecha; si no cabe, se parte en líneas.
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

  input,
  button,
  select {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #e2e8f0;
    --color-surface: #ffffff;
    --color-soft: #f8fafc;
    --color-brand: #166534;
    --color-off: #64748b;
    --color-danger: #b91c1c;
    --color-danger-soft: #fef2f2;
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
  .settings {
    max-width: 44rem;
    margin-inline: auto;
    padding: var(--space-6) var(--space-4) 0;
  }

  .settings h1 {
    margin-bottom: var(--space-3);
    font-size: 1.6rem;
  }

  /* ─── Pestañas ─── */
  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-4);
    margin-bottom: var(--space-4);
    padding: 0;
    border-bottom: 1px solid var(--color-border);
    list-style: none;
  }

  .tabs a {
    display: block;
    padding-block: var(--space-2);
    color: var(--color-muted);
    text-decoration: none;
  }

  .tabs a[aria-current="page"] {
    box-shadow: inset 0 -3px var(--color-brand);
    color: var(--color-text);
    font-weight: 700;
  }

  /* ─── Grupos y filas ─── */
  .settings-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .group {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  .group h2 {
    padding-block: var(--space-2);
    font-size: 1.05rem;
  }

  .setting {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    padding-block: var(--space-3);
    border-top: 1px solid var(--color-border);
  }

  .setting-text {
    flex: 999 1 14rem;
  }

  .setting-name {
    display: block;
    font-weight: 600;
  }

  .setting-help {
    color: var(--color-muted);
    font-size: 0.85rem;
  }

  .setting select,
  .setting input[type="time"] {
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--color-off);
    border-radius: 0.5rem;
  }

  /* ─── Interruptor ─── */
  .switch {
    position: relative;
    display: inline-flex;
    flex: none;
    cursor: pointer;
  }

  /* La casilla cubre la pista: se pulsa y se enfoca ella, pero no se ve. */
  .switch input {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  /* La pista: la bola (::before) se coloca al inicio o al final con justify-content. */
  .switch-track {
    display: flex;
    align-items: center;
    width: 2.75rem;
    height: 1.5rem;
    padding: 0.2rem;
    border-radius: 999px;
    background: var(--color-off);
  }

  .switch-track::before {
    content: "";
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 50%;
    background: #ffffff;
  }

  .switch:has(:checked) .switch-track {
    justify-content: flex-end;
    background: var(--color-brand);
  }

  .switch:has(:focus-visible) .switch-track {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }

  /* ─── Zona de peligro ─── */
  .group.is-danger {
    border-color: #fca5a5;
    background: var(--color-danger-soft);
  }

  .is-danger h2 {
    color: var(--color-danger);
  }

  /* ─── Botones y barra de acciones ─── */
  .button {
    flex: none;
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-off);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-text);
    font-weight: 600;
    cursor: pointer;
  }

  .button.is-primary {
    border-color: var(--color-brand);
    background: var(--color-brand);
    color: #ffffff;
  }

  .button.is-danger {
    border-color: var(--color-danger);
    color: var(--color-danger);
  }

  .form-bar {
    position: sticky;
    bottom: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin-inline: calc(var(--space-4) * -1);
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .form-status {
    flex: 1 1 10rem;
    color: var(--color-muted);
    font-size: 0.85rem;
  }
}
```
