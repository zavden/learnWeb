---
example_description: "Una conversación de mensajería: cabecera sticky, etiquetas de día sticky que se empujan entre sí, avatares colocados junto al último mensaje de cada grupo, un separador de mensajes nuevos y un redactor fijo abajo que nunca tapa lo que se lee"
example_tags: "css|profesional|sticky|fixed|position|scroll-padding|chat"
example_stage: professional
example_importance: important
---

# HTML

```html
<header class="chat-header">
  <a class="back" href="#" aria-label="Volver a las conversaciones">←</a>
  <span class="avatar"><img src="avatar-3.svg" width="96" height="96" alt=""><span class="presence" aria-hidden="true"></span></span>
  <span class="contact"><strong>Carmen Ortiz</strong> <span class="status">en línea</span></span>
</header>

<main class="conversation" aria-label="Conversación con Carmen Ortiz">
  <section class="day" aria-labelledby="day-yesterday">
    <h2 class="day-label" id="day-yesterday"><span>Ayer</span></h2>
    <div class="group group--theirs">
      <img class="group-avatar" src="avatar-3.svg" width="96" height="96" alt="Carmen">
      <p class="bubble">¿Te viene bien que pasemos a ver el piso el sábado por la mañana?</p>
      <p class="bubble">El agente dice que hay otra pareja interesada 😬 <time class="time" datetime="2026-10-11T19:42">19:42</time></p>
    </div>
    <div class="group group--mine">
      <p class="bubble">¡Sí! A las 11 me va perfecto.</p>
      <p class="bubble">Llevo la cinta métrica para lo del sofá <time class="time" datetime="2026-10-11T19:50">19:50</time></p>
    </div>
  </section>

  <section class="day" aria-labelledby="day-today">
    <h2 class="day-label" id="day-today"><span>Hoy</span></h2>
    <div class="group group--mine">
      <p class="bubble">Ya he medido el salón: 4,20 × 3,60. El sofá cabe con 30 cm de sobra.</p>
      <p class="bubble">Y la cocina tiene más luz de lo que parecía en las fotos <time class="time" datetime="2026-10-12T09:05">9:05</time></p>
    </div>
    <p class="new-divider"><span>Mensajes nuevos</span></p>
    <div class="group group--theirs">
      <img class="group-avatar" src="avatar-3.svg" width="96" height="96" alt="Carmen">
      <p class="bubble">¡Genial! Acabo de hablar con el agente.</p>
      <p class="bubble">Si nos decidimos antes del lunes, nos dejan el primer mes a mitad de precio.</p>
      <p class="bubble">¿Lo hablamos esta noche? <time class="time" datetime="2026-10-12T09:31">9:31</time></p>
    </div>
  </section>
</main>

<form class="composer" action="#" method="post">
  <input class="composer-input" type="text" name="message" aria-label="Mensaje para Carmen Ortiz" placeholder="Escribe un mensaje" autocomplete="off">
  <button class="composer-send" type="submit">Enviar</button>
</form>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Chat con redactor fijo
   - La cabecera es sticky (top: 0) y las etiquetas de día también, justo
     debajo de ella: cada etiqueta vive en su <section>, así que cuando su día
     termina se va con él y la del día siguiente ocupa su sitio.
   - El redactor es fixed abajo. No ocupa sitio: la conversación le reserva su
     hueco con padding-bottom, y scroll-padding-bottom evita que tape lo que
     recibe el foco al navegar con el teclado.
   - Cada grupo de mensajes es la referencia de su avatar, que se coloca abajo
     a la izquierda, junto al último mensaje.
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

  input,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-bg: #f1f5f9;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-mine: #1d4ed8;
    --color-theirs: #ffffff;
    --color-new: #b91c1c;
    --color-focus: #1d4ed8;

    --header-h: 3.5rem;
    --composer-h: 4rem;
    --avatar: 2rem;

    --z-day: 10;
    --z-header: 20;
    --z-composer: 20;
  }
}

@layer base {
  html {
    scroll-padding-top: calc(var(--header-h) + 2.5rem);
    scroll-padding-bottom: calc(var(--composer-h) + 1rem);
  }

  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.45;
  }

  :where(:focus-visible) {
    outline: 3px solid var(--color-focus);
    outline-offset: 2px;
  }
}

@layer components {
  /* ─── Cabecera ─── */
  .chat-header {
    position: sticky;
    top: 0;
    z-index: var(--z-header);
    height: var(--header-h);
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
    line-height: calc(var(--header-h) - 1rem);
    white-space: nowrap;
  }

  .back {
    margin-right: 0.5rem;
    color: var(--color-text);
    font-size: 1.25rem;
    text-decoration: none;
  }

  /* Avatar inline-block centrado en la línea; referencia de su punto de presencia. */
  .avatar {
    position: relative;
    display: inline-block;
    width: 2.25rem;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  .avatar img {
    border-radius: 50%;
  }

  .presence {
    position: absolute;
    right: -0.1rem;
    bottom: -0.1rem;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid var(--color-surface);
    border-radius: 50%;
    background: #16a34a;
  }

  .contact {
    display: inline-block;
    vertical-align: middle;
    line-height: 1.25;
  }

  .status {
    display: block;
    color: #166534;
    font-size: 0.8rem;
  }

  /* ─── Conversación ─── */
  .conversation {
    width: min(100% - 1.5rem, 40rem);
    margin-inline: auto;
    padding-bottom: calc(var(--composer-h) + 1rem);   /* el hueco del redactor fijo */
  }

  /* Etiqueta de día: sticky debajo de la cabecera, dentro de su sección. */
  .day-label {
    position: sticky;
    top: calc(var(--header-h) + 0.5rem);
    z-index: var(--z-day);
    margin-block: 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
  }

  .day-label span {
    display: inline-block;
    padding: 0.15rem 0.75rem;
    border-radius: 999px;
    background: #e2e8f0;
    color: var(--color-text);
  }

  /* ─── Grupos de mensajes ─── */
  .group {
    position: relative;
    margin-bottom: 1rem;
  }

  .group--theirs {
    padding-left: calc(var(--avatar) + 0.5rem);
  }

  /* El avatar se coloca abajo a la izquierda del grupo, junto al último mensaje. */
  .group-avatar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: var(--avatar);
    border-radius: 50%;
  }

  .bubble {
    width: fit-content;
    max-width: min(85%, 28rem);
    margin-bottom: 0.2rem;
    padding: 0.45rem 0.75rem;
    border-radius: 16px;
    overflow-wrap: break-word;           /* módulo de tipografía: parte palabras larguísimas */
  }

  .group--theirs .bubble {
    border: 1px solid var(--color-border);
    background: var(--color-theirs);
  }

  .group--mine .bubble {
    margin-left: auto;                   /* empujada a la derecha */
    background: var(--color-mine);
    color: #ffffff;
  }

  /* La hora, pequeña y al final de la última línea, apoyada en su línea base. */
  .time {
    margin-left: 0.4rem;
    font-size: 0.7rem;
  }

  /* ─── Separador de mensajes nuevos ───
     Una raya a media altura (absolute, top: 50%) y el texto encima, con fondo,
     para que la raya no lo atraviese: el texto está posicionado y se pinta después. */
  .new-divider {
    position: relative;
    margin-block: 1rem;
    color: var(--color-new);
    font-size: 0.8rem;
    font-weight: 700;
    text-align: center;
  }

  .new-divider::before {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    left: 0;
    border-top: 1px solid currentColor;
  }

  .new-divider span {
    position: relative;
    padding-inline: 0.6rem;
    background: var(--color-bg);
  }

  /* ─── Redactor fijo ───
     left y right a 0: ocupa todo el ancho de la ventana. El botón va encima, a la
     derecha, centrado en vertical con top/bottom: 0 + height: fit-content + margin auto. */
  .composer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--z-composer);
    height: var(--composer-h);
    padding: 0.75rem 6.5rem 0.75rem 1rem;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .composer-input {
    width: 100%;
    height: 100%;
    padding: 0 1rem;
    border: 1px solid #64748b;
    border-radius: 999px;
  }

  .composer-send {
    position: absolute;
    top: 0;
    right: 1rem;
    bottom: 0;
    height: fit-content;
    margin-block: auto;
    padding: 0.5rem 1rem;
    border: 0;
    border-radius: 999px;
    background: var(--color-mine);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }
}
```
