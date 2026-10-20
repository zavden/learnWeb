---
example_description: "Dos bandejas de mensajes: área con scroll limitada con max-height y min(), scrollbar-gutter estable, asuntos recortados con «…» y un foco que el overflow no recorta"
example_tags: "css|overflow|scrollbar-gutter|text-overflow|max-height|foco"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="inbox" aria-labelledby="inbox-title">
  <h2 class="inbox-header" id="inbox-title">Entrada <span class="count">3 sin leer</span></h2>
  <ul class="inbox-list">
    <li><a class="message is-unread" href="#"><span class="sender">Ayuntamiento de Valladolid</span><span class="subject">Tu solicitud de parcela en el huerto municipal ha sido aprobada</span><span class="date">Hoy, 09:41</span></a></li>
    <li><a class="message is-unread" href="#"><span class="sender">Marta Gil</span><span class="subject">¿Te sobran plantones de tomate? Yo tengo semillas de calabaza</span><span class="date">Hoy, 08:12</span></a></li>
    <li><a class="message is-unread" href="#"><span class="sender">Asociación Vecinal La Rondilla</span><span class="subject">Orden del día de la asamblea del jueves y propuesta de turnos de riego</span><span class="date">Ayer</span></a></li>
    <li><a class="message" href="#"><span class="sender">Vivero El Pinar</span><span class="subject">Tu pedido de 20 kg de compost está listo para recoger</span><span class="date">Ayer</span></a></li>
    <li><a class="message" href="#"><span class="sender">Luis Herrero</span><span class="subject">Fotos del taller de poda</span><span class="date">Lunes</span></a></li>
    <li><a class="message" href="#"><span class="sender">Agencia Estatal de Meteorología</span><span class="subject">Aviso amarillo por heladas en la meseta norte esta madrugada</span><span class="date">Domingo</span></a></li>
    <li><a class="message" href="#"><span class="sender">Biblioteca Municipal</span><span class="subject">Ya puedes recoger «El huerto ecológico en casa»</span><span class="date">12 nov</span></a></li>
  </ul>
</section>

<section class="inbox" aria-labelledby="archive-title">
  <h2 class="inbox-header" id="archive-title">Archivados</h2>
  <ul class="inbox-list">
    <li><a class="message" href="#"><span class="sender">Marta Gil</span><span class="subject">Gracias por las semillas</span><span class="date">3 nov</span></a></li>
    <li><a class="message" href="#"><span class="sender">Vivero El Pinar</span><span class="subject">Factura de octubre</span><span class="date">31 oct</span></a></li>
  </ul>
</section>

<p class="hint">La segunda bandeja no tiene scroll, pero reserva el mismo hueco para la barra: con barras clásicas (Windows, Linux) el texto de las dos mide igual.</p>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f1f5f9;
}

.inbox {
  display: inline-block;
  vertical-align: top;             /* vertical-align llega en el módulo de flujo; alinea los paneles por arriba */
  width: 20rem;
  max-width: 100%;
  margin: 0 1rem 1rem 0;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
}

.inbox-header {
  margin: 0;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #cbd5e1;
  font-size: 1rem;
}

.count {
  display: inline-block;           /* lección 2: inline-block respeta su padding vertical */
  margin-left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1e3a8a;
  font-size: 0.75rem;
}

/* El área con scroll:
   - max-height (lección 4) con min(): como mucho 17rem, o el 60 % del alto de la ventana;
   - overflow-y: auto (lección 5): barra solo si hace falta;
   - scrollbar-gutter: stable: el hueco de la barra está reservado, haya scroll o no.
   Además, como es un contenedor de scroll, crea un BFC: ningún margen se escapa de él. */
.inbox-list {
  max-height: min(17rem, 60vh);
  overflow-y: auto;
  scrollbar-gutter: stable;
  margin: 0;
  padding: 0;
  list-style: none;
  /* Un contenedor de scroll recorta su contenido con la forma de su border-radius:
     redondeamos sus esquinas de abajo como las del panel (12px − 1px de borde). */
  border-radius: 0 0 11px 11px;
}

/* Cada mensaje es un enlace de bloque: toda la fila es clicable (lección 2).
   El borde izquierdo está SIEMPRE ahí (transparente): marcar «sin leer» solo cambia
   su color y el texto no se desplaza. */
.message {
  display: block;
  padding: 0.6rem 0.75rem 0.6rem 0.85rem;
  border-left: 4px solid transparent;
  border-bottom: 1px solid #e2e8f0;
  color: inherit;
  text-decoration: none;
}

.message:hover {
  background: #f8fafc;
}

.message.is-unread {
  border-left-color: #1d4ed8;
  background: #eff6ff;
}

/* 🐛 Un outline por fuera se cortaría en los bordes del área de scroll: overflow recorta
   todo lo que sale de su caja (lección 5). outline-offset negativo lo dibuja por dentro. */
.message:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

/* Recorte con «…»: las tres propiedades a la vez, en cajas de bloque (lección 5) */
.sender,
.subject {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-unread .sender {
  font-weight: 700;
}

.subject {
  font-size: 0.9rem;
}

.date {
  display: block;
  font-size: 0.8rem;
  color: #475569;
}

.hint {
  max-width: 40rem;
  font-size: 0.875rem;
  color: #475569;
}
```
