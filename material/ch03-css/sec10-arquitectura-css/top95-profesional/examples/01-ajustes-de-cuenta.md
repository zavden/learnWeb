---
example_description: "La página de ajustes de una app de citas médicas como un pequeño sistema de diseño: capas declaradas primero, tokens en tres niveles con light-dark() y un selector de tema, componentes anidados (campos, interruptores, botones) y una zona de peligro que solo redefine el token de acento para volver rojo todo lo que contiene"
example_tags: "css|profesional|arquitectura|layer|design-tokens|light-dark|anidamiento|formularios|switch"
example_stage: professional
example_importance: important
---

# HTML

```html
<div class="app">
  <header class="app__bar">
    <p class="app__brand">Agenda Clara</p>
    <p class="app__theme">Tema activo: <span class="is-light-label">claro</span><span class="is-dark-label">oscuro</span></p>
  </header>

  <nav class="settings-nav" aria-label="Ajustes">
    <ul role="list">
      <li><a href="/ajustes/perfil" aria-current="page">Perfil</a></li>
      <li><a href="/ajustes/avisos">Avisos</a></li>
      <li><a href="/ajustes/facturacion">Facturación</a></li>
      <li><a href="/ajustes/seguridad">Seguridad</a></li>
    </ul>
  </nav>

  <main class="settings">
    <h1>Perfil del consultorio</h1>

    <form class="panel" action="/ajustes/perfil" method="post">
      <h2>Datos públicos</h2>
      <div class="field">
        <label for="clinic">Nombre del consultorio</label>
        <input id="clinic" name="clinic" value="Consultorio Dra. Lucía Méndez" autocomplete="organization">
      </div>
      <div class="field">
        <label for="email">Correo para avisos</label>
        <input id="email" name="email" type="email" value="citas@consultoriomendez.mx" autocomplete="email" aria-describedby="email-help">
        <p class="field__help" id="email-help">Aquí llegan las cancelaciones y los recordatorios.</p>
      </div>
      <button class="button" type="submit">Guardar cambios</button>
    </form>

    <section class="panel" aria-labelledby="notify-title">
      <h2 id="notify-title">Avisos a pacientes</h2>
      <label class="switch"><input type="checkbox" role="switch" checked> Recordatorio por SMS 24 h antes</label>
      <label class="switch"><input type="checkbox" role="switch"> Encuesta después de la consulta</label>
    </section>

    <fieldset class="panel theme-picker">
      <legend>Tema de la aplicación</legend>
      <label><input type="radio" name="theme" value="system" checked> Como el sistema</label>
      <label><input type="radio" name="theme" value="light"> Claro</label>
      <label><input type="radio" name="theme" value="dark"> Oscuro</label>
    </fieldset>

    <section class="panel danger-zone" aria-labelledby="danger-title">
      <h2 id="danger-title">Zona de peligro</h2>
      <p>Cerrar la cuenta borra las citas y el historial de pacientes. No se puede deshacer.</p>
      <label class="check"><input type="checkbox"> Entiendo que se borrarán 1,284 citas</label>
      <button class="button" type="button">Cerrar la cuenta</button>
    </section>
  </main>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Ajustes de cuenta
   - Capas: reset < tokens < base < layout < components < utilities. Nada
     fuera de una capa y ningún !important salvo la red de movimiento.
   - Tokens: primitivos, semánticos con light-dark() y de componente. El
     selector de tema solo cambia color-scheme en la raíz (:has()).
   - La zona de peligro redefine UN token, --color-accent: su botón, su
     casilla y su anillo de foco se vuelven rojos. Para que funcione, los
     derivados no se calculan en :root: accent-color y el color del foco se
     declaran en cada control, que lee el acento de su zona.
   - Componentes en BEM, anidados a un nivel (estados y contexto).
   - Mobile-first: desde 48rem, el menú es una columna lateral.
   ────────────────────────────────────────────────────────────────────────── */
@layer reset, tokens, base, layout, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  * { margin: 0; }
  :where(dialog, [popover]) { margin: auto; }
  body { min-height: 100dvh; line-height: 1.5; }
  input, button, select, textarea { font: inherit; }
  h1, h2 { text-wrap: balance; }
  :where(ul, ol)[role="list"] { padding: 0; list-style: none; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer tokens {
  :root {
    /* Primitivos */
    --slate-50: #f8fafc;
    --slate-100: #f1f5f9;
    --slate-300: #cbd5e1;
    --slate-400: #94a3b8;
    --slate-500: #64748b;
    --slate-600: #475569;
    --slate-700: #334155;
    --slate-800: #1e293b;
    --slate-900: #0f172a;
    --slate-950: #020617;
    --indigo-300: #a5b4fc;
    --indigo-700: #4338ca;
    --indigo-950: #1e1b4b;
    --red-300: #fca5a5;
    --red-700: #b91c1c;
    --red-950: #450a0a;
    --radius-8: 8px;
    --radius-12: 12px;
    --radius-full: 999px;

    /* Semánticos */
    color-scheme: light dark;
    --color-page: light-dark(var(--slate-100), var(--slate-950));
    --color-surface: light-dark(#ffffff, var(--slate-900));
    --color-text: light-dark(var(--slate-900), var(--slate-100));
    --color-muted: light-dark(var(--slate-600), var(--slate-400));
    --color-border: light-dark(var(--slate-300), var(--slate-700));
    --color-control: light-dark(var(--slate-500), var(--slate-400));
    --color-accent: light-dark(var(--indigo-700), var(--indigo-300));
    --color-on-accent: light-dark(#ffffff, var(--indigo-950));
    --color-danger: light-dark(var(--red-700), var(--red-300));
    --color-on-danger: light-dark(#ffffff, var(--red-950));
    --duration-fast: 150ms;
  }

  :root:has(input[name="theme"][value="light"]:checked) { color-scheme: light; }
  :root:has(input[name="theme"][value="dark"]:checked) { color-scheme: dark; }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-page);
  }

  h1 { font-size: 1.4rem; line-height: 1.2; }
  h2 { font-size: 1.05rem; }
  a { color: var(--color-accent); }

  /* Declarados en el propio elemento: leen el acento de su zona. */
  input { accent-color: var(--color-accent); }

  :focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }
}

@layer layout {
  .app {
    display: grid;
    grid-template-areas: "bar" "nav" "main";
  }

  .app__bar { grid-area: bar; }
  .settings-nav { grid-area: nav; }
  .settings { grid-area: main; }

  @media (width >= 48rem) {
    .app {
      grid-template-areas: "bar bar" "nav main";
      grid-template-columns: 13rem 1fr;
    }
  }
}

@layer components {
  .app__bar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .app__brand { font-weight: 800; }
  .app__theme { color: var(--color-muted); font-size: 0.8rem; }

  .is-dark-label { display: none; }

  :root:has(input[name="theme"][value="dark"]:checked) {
    .is-light-label { display: none; }
    .is-dark-label { display: inline; }
  }

  @media (prefers-color-scheme: dark) {
    :root:has(input[name="theme"][value="system"]:checked) {
      .is-light-label { display: none; }
      .is-dark-label { display: inline; }
    }
  }

  .settings-nav {
    padding: 8px 16px;

    ul { display: flex; flex-wrap: wrap; gap: 4px; }

    a {
      display: block;
      padding: 6px 10px;
      border-radius: var(--radius-8);
      color: var(--color-text);
      text-decoration: none;

      &:hover { background: var(--color-surface); }

      &[aria-current="page"] {
        background: var(--color-accent);
        color: var(--color-on-accent);
        font-weight: 700;
      }
    }

    @media (width >= 48rem) {
      ul { flex-direction: column; }
    }
  }

  .settings {
    display: grid;
    gap: 16px;
    max-width: 40rem;
    padding: 8px 16px 24px;
  }

  .panel {
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-12);
    background: var(--color-surface);
  }

  .field {
    display: grid;
    gap: 4px;

    input {
      padding: 6px 10px;
      border: 1px solid var(--color-control);
      border-radius: var(--radius-8);
      background: var(--color-surface);
      color: var(--color-text);
    }
  }

  .field__help { color: var(--color-muted); font-size: 0.8rem; }

  .button {
    justify-self: start;
    padding: 8px 16px;
    border: 0;
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: var(--color-on-accent);
    font-weight: 700;
    cursor: pointer;
  }

  /* Interruptor: la casilla real (role="switch"), dibujada como pista. */
  .switch {
    display: flex;
    gap: 10px;
    align-items: center;

    input {
      appearance: none;
      flex: none;
      width: 2.5rem;
      height: 1.4rem;
      border: 2px solid var(--color-control);
      border-radius: var(--radius-full);
      background: var(--color-surface);
      cursor: pointer;
      transition: background-color var(--duration-fast);

      &::before {
        content: "";
        display: block;
        width: calc(1.4rem - 8px);
        aspect-ratio: 1;
        margin: 2px;
        border-radius: 50%;
        background: var(--color-control);
      }

      &:checked {
        border-color: var(--color-accent);
        background: var(--color-accent);

        &::before {
          background: var(--color-on-accent);
          translate: calc(2.5rem - 1.4rem) 0;
        }
      }
    }

    @media (prefers-reduced-motion: no-preference) {
      input::before { transition: translate var(--duration-fast); }
    }
  }

  .theme-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;

    legend { padding-inline: 4px; font-weight: 700; }
  }

  .check { display: flex; gap: 8px; align-items: baseline; }

  /* La zona de peligro: el acento es el rojo. Todo lo de dentro lo lee. */
  .danger-zone {
    --color-accent: var(--color-danger);
    --color-on-accent: var(--color-on-danger);
    border-color: var(--color-danger);
  }
}
```
