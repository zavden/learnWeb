---
example_description: "Una aplicación de chat de soporte a pantalla completa: cabecera, conversación con scroll que ocupa exactamente el alto restante, burbujas a cada lado, un archivo adjunto y una ficha de pedido, respuestas rápidas y un redactor que nunca tapa nada"
example_tags: "css|profesional|flexbox|chat|columna|min-height|align-self|overflow"
example_stage: professional
example_importance: critical
---

# HTML

```html
<div class="app">
  <header class="chat-header">
    <a class="icon-button" href="/soporte" aria-label="Volver a soporte">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
    </a>
    <span class="avatar">
      <img src="avatar-2.svg" alt="" width="40" height="40">
      <span class="presence" aria-hidden="true"></span>
    </span>
    <div class="contact">
      <h1>Laura Méndez</h1>
      <p>Soporte de Vivero Xochi · en línea</p>
    </div>
    <a class="icon-button" href="tel:+523312345678" aria-label="Llamar a soporte">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
    </a>
  </header>

  <main class="conversation" tabindex="0" aria-label="Conversación con Laura Méndez">
    <p class="day">Hoy</p>

    <div class="group is-theirs">
      <p class="bubble">¡Hola, Ana! Soy Laura, de soporte. ¿En qué te ayudo?</p>
      <p class="time">9:41</p>
    </div>

    <div class="group is-mine">
      <p class="bubble">Hola. Mi pedido 4821 dice «entregado», pero no me ha llegado nada.</p>
      <p class="bubble">Vivo en un edificio con recepción, por si sirve.</p>
      <p class="time">9:42</p>
    </div>

    <div class="group is-theirs">
      <p class="bubble">Lo reviso ahora mismo. Es este, ¿verdad?</p>
      <article class="bubble order-card">
        <img src="plant-monstera.svg" alt="" width="56" height="56">
        <div class="order-card-text">
          <h2>Pedido 4821</h2>
          <p>Monstera deliciosa y 2 productos más</p>
          <a href="/cuenta/pedidos/4821">Ver el pedido</a>
        </div>
      </article>
      <p class="bubble">La paquetería lo dejó en la recepción a las 13:05. Te paso el comprobante con la firma:</p>
      <article class="bubble attachment">
        <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6V2Z" fill="#fee2e2" stroke="#b91c1c" stroke-width="1.5"/><text x="7.5" y="18" font-size="5.5" font-family="system-ui" font-weight="700" fill="#b91c1c">PDF</text></svg>
        <span class="file-name">comprobante-entrega-pedido-4821-estafeta.pdf</span>
        <span class="file-size">212 KB</span>
        <a class="file-download" href="/soporte/adjuntos/comprobante-4821.pdf" download aria-label="Descargar el comprobante">↓</a>
      </article>
      <p class="time">9:44</p>
    </div>

    <div class="group is-mine">
      <p class="bubble">¡Ahí estaba! Muchas gracias, Laura.</p>
      <p class="time">9:46 · Leído</p>
    </div>
  </main>

  <ul class="quick-replies" aria-label="Respuestas rápidas">
    <li><button type="button">Todo resuelto</button></li>
    <li><button type="button">Cambiar la dirección</button></li>
    <li><button type="button">Hablar por teléfono</button></li>
  </ul>

  <form class="composer" action="/soporte/mensajes" method="post">
    <button class="icon-button" type="button" aria-label="Adjuntar un archivo">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="m20 11-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>
    <input class="composer-input" name="message" aria-label="Mensaje para Laura" placeholder="Escribe un mensaje…" autocomplete="off">
    <button class="composer-send">Enviar</button>
  </form>
</div>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Chat de soporte a pantalla completa
   - La aplicación es una columna de 100dvh: cabecera, conversación, respuestas
     rápidas y redactor. La conversación tiene flex: 1 y se queda EXACTAMENTE
     con el alto que dejan los demás; con overflow-y: auto, se desplaza ella
     sola. Nada es fixed ni sticky, así que nada tapa nada y no hay huecos que
     reservar (compáralo con el chat del módulo de posicionamiento).
   - min-height: 0 en la conversación: aquí no es imprescindible (ya es un
     contenedor de scroll), pero la protege si un día el scroll pasa a un hijo.
   - Cada grupo de mensajes es una columna; los propios se alinean al final del
     eje cruzado. Los mensajes no se aplastan para caber: su min-height: auto.
   - Adjunto y ficha de pedido son media objects dentro de una burbuja.
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

  img,
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
    --color-bg: #f1f5f9;
    --color-surface: #ffffff;
    --color-text: #1e293b;
    --color-muted: #475569;
    --color-border: #cbd5e1;
    --color-mine: #1d4ed8;
    --color-accent: #1e3a8a;
    --color-online: #16a34a;
    --color-focus: #1d4ed8;

    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --radius-bubble: 1rem;
  }
}

@layer base {
  body {
    background: var(--color-bg);
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
  /* ─── La aplicación: una columna del alto de la ventana ─── */
  .app {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    max-width: 44rem;
    margin-inline: auto;
    background: var(--color-surface);
  }

  /* ─── Cabecera ─── */
  .chat-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
  }

  .icon-button {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--color-accent);
    cursor: pointer;
  }

  .icon-button:hover {
    background: var(--color-bg);
  }

  /* El avatar es la referencia de su punto de presencia (módulo de posicionamiento). */
  .avatar {
    position: relative;
    flex: none;
  }

  .avatar img {
    border-radius: 50%;
  }

  .presence {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid var(--color-surface);
    border-radius: 50%;
    background: var(--color-online);
  }

  /* El contacto ocupa lo que sobra; su estado se recorta si no cabe. */
  .contact {
    flex: 1;
    min-width: 0;
  }

  .contact h1 {
    font-size: 1rem;
  }

  .contact p {
    overflow: hidden;
    color: var(--color-muted);
    font-size: 0.8rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* ─── Conversación ─── */
  .conversation {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--space-4) var(--space-3);
    background: var(--color-bg);
  }

  /* «Hoy», con una raya a cada lado que se reparte el sitio libre. */
  .day {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: var(--color-muted);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .day::before,
  .day::after {
    content: "";
    flex: 1;
    border-top: 1px solid var(--color-border);
  }

  .group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .group.is-mine {
    align-items: flex-end;
  }

  .bubble {
    max-width: min(85%, 26rem);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-bubble);
    background: var(--color-surface);
  }

  .is-mine .bubble {
    border-color: var(--color-mine);
    background: var(--color-mine);
    color: #ffffff;
  }

  .time {
    padding-inline: var(--space-2);
    color: var(--color-muted);
    font-size: 0.7rem;
  }

  /* ─── Ficha de pedido: media object dentro de una burbuja ─── */
  .order-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .order-card img {
    border-radius: 0.5rem;
  }

  .order-card-text {
    min-width: 0;
    font-size: 0.85rem;
  }

  .order-card h2 {
    font-size: 0.9rem;
  }

  .order-card a {
    color: var(--color-mine);
    font-weight: 600;
  }

  /* ─── Adjunto: icono, nombre recortado, tamaño y botón de descarga ─── */
  .attachment {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: min(85%, 26rem);
    font-size: 0.85rem;
  }

  .file-name {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .file-size {
    flex: none;
    color: var(--color-muted);
    font-size: 0.75rem;
  }

  .file-download {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-bg);
    font-weight: 700;
    text-decoration: none;
  }

  /* ─── Respuestas rápidas: se reparten en líneas ─── */
  .quick-replies {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-top: 1px solid var(--color-border);
    list-style: none;
  }

  .quick-replies button {
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-mine);
    border-radius: 999px;
    background: var(--color-surface);
    color: var(--color-mine);
    font-size: 0.85rem;
    cursor: pointer;
  }

  /* ─── Redactor: botón rígido, campo flexible, botón de enviar ─── */
  .composer {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3) var(--space-3);
  }

  .composer-input {
    flex: 1;
    min-width: 0;
    height: 2.5rem;
    padding: 0 var(--space-4);
    border: 1px solid #64748b;
    border-radius: 999px;
  }

  .composer-send {
    flex: none;
    height: 2.5rem;
    padding: 0 var(--space-4);
    border: 0;
    border-radius: 999px;
    background: var(--color-mine);
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }
}
```
