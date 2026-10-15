---
example_description: "Un chat de soporte de alto fijo: cabecera, mensajes con scroll alineados a cada lado con align-self, respuestas rápidas que se reparten en líneas y un redactor que nunca se sale"
example_tags: "css|flexbox|columna|min-height|align-self|overflow|chat"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<section class="chat" aria-label="Chat con soporte">
  <header class="chat-header">
    <img src="avatar-2.svg" alt="" width="32" height="32">
    <p class="contact"><strong>Laura · Soporte Xochi</strong><span>Suele responder en 5 minutos</span></p>
    <button class="close" type="button" aria-label="Cerrar el chat">✕</button>
  </header>

  <div class="chat-body">
    <ol class="messages" tabindex="0" aria-label="Mensajes">
      <li class="divider">Hoy</li>
      <li class="msg is-theirs">¡Hola! Soy Laura. ¿En qué te ayudo?</li>
      <li class="msg is-mine">Hola. Mi pedido 4821 dice «entregado», pero no me ha llegado nada.</li>
      <li class="msg is-theirs">Lo reviso. ¿Me confirmas el código postal de entrega?</li>
      <li class="msg is-mine">44100, Guadalajara.</li>
      <li class="msg is-theirs">Gracias. La paquetería lo dejó en la recepción del edificio a las 13:05.</li>
      <li class="msg is-mine">¡Ahí está! No sabía que lo recibían en recepción.</li>
      <li class="msg is-theirs">Perfecto. ¿Te ayudo con algo más?</li>
    </ol>
    <ul class="quick-replies" aria-label="Respuestas rápidas">
      <li><button type="button">No, gracias</button></li>
      <li><button type="button">Cambiar dirección</button></li>
      <li><button type="button">Hablar por teléfono</button></li>
    </ul>
  </div>

  <form class="composer" action="/soporte/mensajes" method="post">
    <button class="attach" type="button" aria-label="Adjuntar archivo">📎</button>
    <input name="message" aria-label="Mensaje para Laura" placeholder="Escribe un mensaje…">
    <button class="send">Enviar</button>
  </form>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

button,
input {
  font: inherit;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

/* El panel: una columna de alto fijo (en una página real, 100dvh). */
.chat {
  display: flex;
  flex-direction: column;
  max-width: 24rem;
  height: 340px;
  border: 1px solid #94a3b8;
  border-radius: 12px;
  overflow: hidden;            /* recorta las esquinas; no es elemento flex de nadie */
  font-size: 0.8rem;
}

/* Cabecera: avatar rígido, contacto que se recorta, botón al final. */
.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #1e3a8a;
  color: #ffffff;
}

.chat-header img {
  flex: none;
  border-radius: 50%;
}

.contact {
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin: 0;
}

.contact span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #dbeafe;
}

.close {
  flex: none;
  margin-left: auto;
  border: 0;
  background: none;
  color: #ffffff;
  font-size: 1rem;
}

/* El cuerpo es el elemento INTERMEDIO de la lección 4: elemento flex del panel y
   columna de la lista y las respuestas rápidas. Sin min-height: 0 no encoge y la
   lista nunca tiene scroll. */
.chat-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #f1f5f9;
}

/* La lista: otra columna, con scroll. Cada mensaje mide lo que su texto
   (align-items: flex-start) y no encoge en vertical gracias a su min-height: auto:
   aquí el mínimo automático es justo lo que queremos. */
.messages {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  flex: 1;
  margin: 0;
  padding: 10px;
  overflow-y: auto;
  list-style: none;
}

.msg {
  max-width: 80%;
  padding: 6px 10px;
  border-radius: 12px;
  background: #ffffff;
}

/* Los míos, al otro lado del eje cruzado (lección 2). */
.msg.is-mine {
  align-self: flex-end;
  background: #1d4ed8;
  color: #ffffff;
}

/* Separador con raya a cada lado: dos pseudoelementos con flex: 1 se reparten el
   espacio que deja el texto. */
.divider {
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 8px;
  color: #475569;
  font-size: 0.75rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-top: 1px solid #cbd5e1;
}

/* Respuestas rápidas: se reparten en líneas con gap (lección 5). */
.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 6px 10px;
  list-style: none;
}

.quick-replies button {
  padding: 3px 10px;
  border: 1px solid #1d4ed8;
  border-radius: 999px;
  background: #ffffff;
  color: #1d4ed8;
}

/* Redactor: botón rígido, campo flexible que puede encoger, botón de enviar. */
.composer {
  display: flex;
  gap: 6px;
  padding: 8px;
  border-top: 1px solid #cbd5e1;
  background: #ffffff;
}

.composer input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid #64748b;
  border-radius: 999px;
}

.attach {
  flex: none;
  border: 0;
  background: none;
}

.send {
  padding: 6px 12px;
  border: 0;
  border-radius: 999px;
  background: #1d4ed8;
  color: #ffffff;
}
```
