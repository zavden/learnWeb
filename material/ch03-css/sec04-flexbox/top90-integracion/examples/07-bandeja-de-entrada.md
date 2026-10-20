---
example_description: "Una bandeja de correo: cada fila es un flex dentro de otro flex, con casilla y avatar rígidos, remitente de ancho fijo, asunto recortado con «…» y fecha que nunca se parte"
example_tags: "css|flexbox|ellipsis|min-width|flex-basis|flex-shrink|correo"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<section class="inbox" aria-labelledby="inbox-title">
  <header class="inbox-header">
    <h2 id="inbox-title">Recibidos</h2>
    <p class="unread">2 sin leer</p>
    <a class="compose" href="/correo/redactar">Redactar</a>
  </header>

  <ul class="mail-list">
    <li class="mail is-unread">
      <input type="checkbox" aria-label="Seleccionar: Tu paquete está en camino">
      <a class="mail-link" href="/correo/8231">
        <img class="mail-avatar" src="avatar-1.svg" alt="" width="32" height="32">
        <span class="mail-from">Paquetería Estafeta Mexicana</span>
        <span class="mail-summary"><strong>Tu paquete está en camino</strong> · Llegará el jueves 15 entre las 9:00 y las 14:00. Puedes seguirlo con el número de guía 7723 4410 9981.</span>
        <time datetime="2026-10-13T09:12">9:12</time>
      </a>
    </li>
    <li class="mail is-unread">
      <input type="checkbox" aria-label="Seleccionar: Factura de octubre">
      <a class="mail-link" href="/correo/8229">
        <img class="mail-avatar" src="avatar-2.svg" alt="" width="32" height="32">
        <span class="mail-from">CFE</span>
        <span class="mail-summary"><strong>Factura de octubre</strong> · Tu recibo por 486,00 MXN ya está disponible. Fecha límite de pago: 28 de octubre.</span>
        <span class="attachment" role="img" aria-label="Con archivo adjunto">📎</span>
        <time datetime="2026-10-12">ayer</time>
      </a>
    </li>
    <li class="mail">
      <input type="checkbox" aria-label="Seleccionar: Fotos del viaje">
      <a class="mail-link" href="/correo/8217">
        <img class="mail-avatar" src="avatar-3.svg" alt="" width="32" height="32">
        <span class="mail-from">Carmen Ortiz</span>
        <span class="mail-summary"><strong>Fotos del viaje a Oaxaca</strong> · ¡Por fin las subí! Las del mercado de Tlacolula quedaron preciosas.</span>
        <time datetime="2026-10-10">10 oct.</time>
      </a>
    </li>
    <li class="mail">
      <input type="checkbox" aria-label="Seleccionar: Tu taller del sábado">
      <a class="mail-link" href="/correo/8202">
        <img class="mail-avatar" src="avatar-4.svg" alt="" width="32" height="32">
        <span class="mail-from">Vivero Xochi</span>
        <span class="mail-summary"><strong>Tu taller del sábado</strong> · Trae guantes y una maceta de 15 cm.</span>
        <time datetime="2026-10-08">8 oct.</time>
      </a>
    </li>
  </ul>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.inbox {
  max-width: 30rem;
  font-size: 0.8rem;
}

/* Título y contador por la línea base; «Redactar» al final. */
.inbox-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.inbox-header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.unread {
  margin: 0;
  color: #475569;
}

.compose {
  margin-left: auto;
  padding: 4px 12px;
  border-radius: 999px;
  background: #1d4ed8;
  color: #ffffff;
  text-decoration: none;
}

.mail-list {
  margin: 0;
  padding: 0;
  border-top: 1px solid #cbd5e1;
  list-style: none;
}

/* Nivel 1: la fila. Punto de «no leído» (un pseudoelemento, que también es un
   elemento flex), casilla y enlace. */
.mail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border-bottom: 1px solid #cbd5e1;
}

.mail::before {
  content: "";
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.mail.is-unread::before {
  background: #1d4ed8;
}

.mail input {
  flex: none;
  margin: 0;
}

/* Nivel 2: el enlace es elemento flex de la fila Y contenedor flex de su contenido.
   Necesita su propio min-width: 0: si no, su mínimo sería el asunto entero en una
   línea y ningún «…» de dentro aparecería (lección 4). */
.mail-link {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.mail-avatar {
  flex: none;
  border-radius: 50%;
}

/* El remitente: una «columna» de ancho fijo (base de 7rem, sin crecer ni encoger),
   para que los asuntos empiecen todos a la misma altura. */
.mail-from {
  flex: 0 0 7rem;
}

/* El asunto se queda con el resto. Remitente y asunto se recortan con «…»; los dos
   son elementos flex con overflow: hidden, así que pueden encoger. */
.mail-from,
.mail-summary {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.mail-summary {
  flex: 1;
  color: #475569;
}

.mail-summary strong {
  color: #1e293b;
  font-weight: 600;
}

.is-unread .mail-from,
.is-unread .mail-summary strong {
  font-weight: 800;
}

/* Lo que no debe encoger ni partirse: el clip y la fecha. */
.attachment,
.mail time {
  flex: none;
}

.mail time {
  color: #475569;
  font-size: 0.75rem;
}

.mail-link:hover .mail-summary strong {
  text-decoration: underline;
}
```
