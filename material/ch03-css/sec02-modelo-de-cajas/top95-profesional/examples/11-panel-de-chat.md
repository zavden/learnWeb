---
example_description: "Un panel de chat: registro con scroll de alto fijo y scrollbar-gutter, burbujas con fit-content y margin-inline-start: auto, radios asimétricos, adjuntos con aspect-ratio, enlaces largos que no desbordan y un compositor de ancho completo"
example_tags: "css|profesional|chat|overflow|fit-content|margin"
example_stage: professional
example_importance: critical
---

# HTML

```html
<section class="chat" aria-labelledby="chat-title">
  <header class="chat-header">
    <img class="chat-avatar" src="avatar-javier.svg" width="160" height="160" alt="">
    <h1 class="chat-title" id="chat-title">Javier Ruiz</h1>
    <p class="chat-status">En línea · Huerto de la Rondilla</p>
  </header>

  <ol class="chat-log" role="log" aria-label="Mensajes con Javier Ruiz" tabindex="0">
    <li class="day"><span>Ayer</span></li>
    <li class="msg msg--them">
      <p>¿Vienes el sábado al taller de compost? Empieza a las 10:30.</p>
      <p class="msg-time"><time datetime="2026-11-13T19:02">19:02</time></p>
    </li>
    <li class="msg msg--me">
      <p>¡Claro! ¿Llevo algo?</p>
      <p class="msg-time"><time datetime="2026-11-13T19:05">19:05</time> · Leído</p>
    </li>
    <li class="msg msg--them">
      <p>Guantes y, si tienes, posos de café. Aquí está la lista completa de lo que se puede echar:</p>
      <p><a href="#">https://huerto-rondilla.example.es/talleres/2026/compost-casero/lista-de-residuos-admitidos.pdf</a></p>
      <p class="msg-time"><time datetime="2026-11-13T19:07">19:07</time></p>
    </li>
    <li class="day"><span>Hoy</span></li>
    <li class="msg msg--them">
      <figure class="attachment">
        <img src="photo-3.svg" width="320" height="240" alt="Bancal de tierra recién removida con brotes verdes">
        <figcaption>El bancal 12 ya está listo</figcaption>
      </figure>
      <p class="msg-time"><time datetime="2026-11-14T09:12">9:12</time></p>
    </li>
    <li class="msg msg--me">
      <p>¡Qué bien ha quedado!</p>
    </li>
    <li class="msg msg--me">
      <p>Llevo también semillas de habas: las sembramos al terminar el taller, que la luna menguante es buena para las legumbres (o eso dice mi abuela).</p>
      <p class="msg-time"><time datetime="2026-11-14T09:15">9:15</time> · Entregado</p>
    </li>
    <li class="typing"><span class="typing-dots"></span> Javier está escribiendo…</li>
  </ol>

  <form class="composer" action="#">
    <label class="composer-label" for="chat-message">Escribe un mensaje</label>
    <textarea class="composer-input" id="chat-message" rows="2" placeholder="Mensaje para Javier"></textarea>
    <p class="composer-actions">
      <span class="composer-hint">Javier recibirá un aviso en el móvil.</span>
      <button class="composer-send" type="submit">Enviar</button>
    </p>
  </form>
</section>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Panel de chat
   - Tres cajas apiladas: cabecera, registro y compositor. Solo el registro tiene
     scroll (alto fijo + overflow-y: auto), así que la cabecera y el compositor se
     ven siempre sin necesidad de position: sticky.
   - Burbujas: width: fit-content (miden lo que su texto) con max-width; las propias
     se empujan a la derecha con margin-inline-start: auto. Un radio más pequeño
     en una esquina indica quién habla.
   - Agrupación con combinadores: dos mensajes seguidos de la misma persona se
     acercan (margen pequeño) y el segundo pierde la «cola».
   - En una aplicación real, JavaScript desplazaría el registro al último mensaje.
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

  textarea,
  button {
    font: inherit;
  }
}

@layer tokens {
  :root {
    --color-page: #e2e8f0;
    --color-surface: #ffffff;
    --color-log: #f8fafc;
    --color-text: #0f172a;
    --color-text-muted: #475569;
    --color-border: #e2e8f0;
    --color-border-strong: #64748b;
    --color-them: #ffffff;
    --color-me: #1d4ed8;
    --color-me-text: #ffffff;
    --color-me-muted: #dbeafe;
    --color-focus: #1d4ed8;

    --radius-panel: 20px;
    --radius-bubble: 18px;
    --radius-tail: 6px;
    --log-height: min(26rem, 65vh);
    --space-group: 0.75rem;
    --space-follow: 0.25rem;
  }
}

@layer base {
  body {
    background: var(--color-page);
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
  /* El panel: centrado, con un ancho máximo y esquinas redondeadas. overflow: clip
     recorta a la curva las esquinas de la cabecera y del compositor sin crear un
     contenedor de scroll (lección de overflow). */
  .chat {
    width: min(100% - 1rem, 30rem);
    margin: 1.5rem auto;
    overflow: clip;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-panel);
    background: var(--color-surface);
    box-shadow: 0 2px 4px rgb(15 23 42 / 0.06), 0 24px 48px rgb(15 23 42 / 0.16);
  }

  /* ─── Cabecera ─── */
  /* El avatar va a la izquierda con inline-block; el nombre y el estado son bloques
     con un margen izquierdo igual al avatar + su separación. */
  .chat-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .chat-avatar {
    width: 2.75rem;
    aspect-ratio: 1;
    margin-bottom: -2.75rem;            /* no ocupa alto en el flujo: el texto sube a su lado */
    border-radius: 50%;
  }

  .chat-title,
  .chat-status {
    margin-left: 3.5rem;
  }

  .chat-title {
    font-size: 1.0625rem;
  }

  .chat-status {
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  /* ─── Registro con scroll ─── */
  .chat-log {
    height: var(--log-height);
    overflow-y: auto;
    scrollbar-gutter: stable;           /* el texto no salta cuando aparece la barra */
    padding: 0.5rem 1rem 1rem;
    background: var(--color-log);
    list-style: none;
  }

  /* El foco del registro va por dentro: el panel lo recortaría por fuera (overflow: clip) */
  .chat-log:focus-visible {
    outline-offset: -3px;
  }

  .day {
    margin-block: 1rem 0.25rem;
    text-align: center;
  }

  .day span {
    display: inline-block;
    padding: 0.125rem 0.75rem;
    border-radius: 999px;
    background: var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* ─── Burbujas ─── */
  .msg {
    width: fit-content;                 /* mide lo que su texto… */
    max-width: min(85%, 22rem);         /* …hasta un límite */
    margin-top: var(--space-group);
    padding: 0.5rem 0.75rem 0.375rem;
    border-radius: var(--radius-bubble);
  }

  .msg > * + * {
    margin-top: 0.25rem;
  }

  .msg--them {
    border: 1px solid var(--color-border);
    border-bottom-left-radius: var(--radius-tail);
    background: var(--color-them);
  }

  /* margin-inline-start: auto se queda con todo el espacio libre de la izquierda */
  .msg--me {
    margin-inline-start: auto;
    border: 1px solid var(--color-me);
    border-bottom-right-radius: var(--radius-tail);
    background: var(--color-me);
    color: var(--color-me-text);
  }

  /* Mensajes seguidos de la misma persona: más juntos y sin la cola en el anterior */
  .msg--me + .msg--me,
  .msg--them + .msg--them {
    margin-top: var(--space-follow);
  }

  .msg--me:has(+ .msg--me) {
    border-bottom-right-radius: var(--radius-bubble);
  }

  .msg--them:has(+ .msg--them) {
    border-bottom-left-radius: var(--radius-bubble);
  }

  .msg a {
    color: inherit;
  }

  /* Una URL no tiene espacios donde partirse y empujaría la burbuja fuera del panel.
     overflow-wrap se estudia en el módulo de tipografía; aquí permite cortarla. */
  .msg p {
    overflow-wrap: anywhere;
  }

  .msg-time {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    text-align: end;
  }

  .msg--me .msg-time {
    color: var(--color-me-muted);
  }

  /* Adjunto: la foto llena la burbuja; el hueco 4/3 existe antes de que cargue */
  .attachment img {
    width: 18rem;
    aspect-ratio: 4 / 3;
    border-radius: calc(var(--radius-bubble) - 8px);
    background: var(--color-border);
  }

  .attachment figcaption {
    margin-top: 0.375rem;
    font-size: 0.875rem;
  }

  /* «Escribiendo…»: tres puntos hechos con UN punto de fondo repetido en horizontal,
     en una caja de exactamente tres puntos de ancho (3 × 0.75rem). */
  .typing {
    width: fit-content;
    margin-top: var(--space-group);
    padding: 0.375rem 0.875rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-bubble);
    border-bottom-left-radius: var(--radius-tail);
    background: var(--color-them);
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  .typing-dots {
    display: inline-block;
    width: 2.25rem;
    height: 0.75rem;
    margin-right: 0.25rem;
    background: url("dot.svg") 0 0 / 0.75rem repeat-x;
  }

  /* ─── Compositor ─── */
  .composer {
    padding: 0.75rem 1rem 1rem;
    border-top: 1px solid var(--color-border);
  }

  .composer-label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  /* 100 % con relleno y borde: border-box lo mantiene dentro del panel */
  .composer-input {
    display: block;
    width: 100%;
    min-height: 3.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border-strong);
    border-radius: 12px;
  }

  .composer-input:focus-visible {
    outline-offset: 1px;
    border-color: var(--color-focus);
  }

  /* Pista y botón en la misma fila, alineados a la derecha con text-align (los dos son
     cajas en línea). Si no caben juntos, el botón salta a la línea siguiente. */
  .composer-actions {
    margin-top: 0.5rem;
    text-align: end;
  }

  .composer-hint {
    display: inline-block;
    margin-right: 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.8125rem;
  }

  .composer-send {
    min-height: 2.5rem;
    padding: 0 1.25rem;
    border: 0;
    border-radius: 999px;
    background: var(--color-me);
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }

  .composer-send:hover {
    background: #1e40af;
  }

  .composer-send:active {
    box-shadow: inset 0 2px 4px rgb(15 23 42 / 0.35);
  }
}
```
