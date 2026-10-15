---
example_description: "En columnas flex anidadas, la lista con overflow: auto no muestra scroll y el panel se desborda: el elemento flex intermedio necesita min-height: 0"
example_tags: "css|flexbox|min-height|overflow|scroll|columnas|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">↕ Intenta desplazar los mensajes de cada chat. El panel mide 210px.</p>

<div class="column">
  <p class="caption">❌ Sin <code>min-height: 0</code>: no hay scroll y el campo de escribir se sale por abajo</p>
  <section class="chat" aria-label="Chat con soporte, versión con el error">
    <header class="chat-header">Soporte · Laura</header>
    <div class="conversation">
      <ol class="messages" tabindex="0" aria-label="Mensajes">
        <li>Hola, mi pedido 4821 llegó sin el cargador.</li>
        <li class="is-agent">¡Hola! Lo siento. ¿Me confirmas la dirección de entrega?</li>
        <li>Av. Juárez 120, depto. 3, Guadalajara.</li>
        <li class="is-agent">Listo: te enviamos el cargador mañana sin costo.</li>
        <li>¡Gracias!</li>
      </ol>
      <form class="composer" action="/soporte/mensajes" method="post">
        <input name="message" aria-label="Escribe un mensaje" placeholder="Escribe…">
        <button>Enviar</button>
      </form>
    </div>
  </section>
</div>

<div class="column">
  <p class="caption">✅ <code>min-height: 0</code> en <code>.conversation</code>: la lista se desplaza</p>
  <section class="chat is-fixed" aria-label="Chat con soporte, versión corregida">
    <header class="chat-header">Soporte · Laura</header>
    <div class="conversation">
      <ol class="messages" tabindex="0" aria-label="Mensajes">
        <li>Hola, mi pedido 4821 llegó sin el cargador.</li>
        <li class="is-agent">¡Hola! Lo siento. ¿Me confirmas la dirección de entrega?</li>
        <li>Av. Juárez 120, depto. 3, Guadalajara.</li>
        <li class="is-agent">Listo: te enviamos el cargador mañana sin costo.</li>
        <li>¡Gracias!</li>
      </ol>
      <form class="composer" action="/soporte/mensajes" method="post">
        <input name="message" aria-label="Escribe un mensaje" placeholder="Escribe…">
        <button>Enviar</button>
      </form>
    </div>
  </section>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 0 0 4px;
  font-size: 0.8rem;
}

.column {
  display: inline-block;
  vertical-align: top;
  width: 205px;
  margin-right: 8px;
}

.caption {
  min-height: 3.9em;
  font-size: 0.75rem;
}

/* Nivel 1: el panel, una columna de alto fijo. La cabecera mide lo suyo y
   .conversation se queda con el resto (flex: 1). */
.chat {
  display: flex;
  flex-direction: column;
  height: 210px;
  outline: 2px dashed #7c3aed;
  font-size: 0.75rem;
}

.chat-header {
  padding: 6px 8px;
  background: #1e3a8a;
  color: #ffffff;
  font-weight: bold;
}

/* Nivel 2: .conversation es elemento flex del panel Y contenedor flex de la lista y
   el formulario. La lista se queda con lo que deje el formulario. */
.conversation {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.messages {
  flex: 1;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  list-style: none;
  background: #f1f5f9;
}

.messages li {
  width: fit-content;
  max-width: 85%;
  margin-bottom: 4px;
  padding: 4px 6px;
  border-radius: 6px;
  background: #ffffff;
}

.messages li.is-agent {
  margin-left: auto;
  background: #e0e7ff;
}

.composer {
  display: flex;
  gap: 4px;
  padding: 6px;
  background: #ffffff;
}

.composer input {
  flex: 1;
  min-width: 0;          /* un campo también tiene ancho mínimo (lección 5) */
  font: inherit;
}

.composer button {
  font: inherit;
}

.messages:focus-visible,
.composer :focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

/* 🐛 En una columna, el suelo es min-height: auto: el alto de su contenido.
   .conversation es un elemento flex SIN overflow, así que no puede ser más baja que
   todos sus mensajes juntos más el formulario. No encoge, se sale del panel, y la
   lista, que mide lo que su contenido, nunca necesita su scroll.
   La lista sí tiene overflow: auto (su mínimo es 0), pero eso no basta: el suelo que
   estorba es el de su padre, el elemento flex intermedio. */

/* ✅ min-height: 0 en el intermedio. Ahora .conversation mide lo que deja la cabecera,
   la lista se queda con lo que deja el formulario y su overflow-y: auto se activa. */
.is-fixed .conversation {
  min-height: 0;
}
```
