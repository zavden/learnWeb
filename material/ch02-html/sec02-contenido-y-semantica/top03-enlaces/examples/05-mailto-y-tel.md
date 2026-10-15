---
example_description: "Enlaces mailto: y tel: abren el correo o el teléfono; sus datos van codificados en la URL"
example_tags: "html|enlaces|mailto|tel|url"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<!-- mailto: abre el programa de correo con un mensaje preparado. Asunto (subject) y
     cuerpo (body) van en la query, codificados como en cualquier URL: %20 = espacio,
     %2C = coma. Y el & que separa los datos se escribe &amp; dentro del HTML. -->
<p>
  <a id="mail-link" href="mailto:reservas@ejemplo.com?subject=Reserva%20de%20mesa&amp;body=Hola%2C%20quiero%20reservar%20para%204%20personas.">Reservar por correo</a>
  (reservas@ejemplo.com)
</p>

<!-- tel: en el móvil, marca el número; en el ordenador, abre la aplicación de llamadas
     si hay alguna. En el href, formato internacional y sin espacios; el texto, como se lee. -->
<p>Teléfono: <a id="phone-link" href="tel:+34910000000">910 00 00 00</a></p>

<!-- Escribe también la dirección y el número a la vista: no todo el mundo tiene un
     programa de correo configurado, y quizá quiera copiarlos. -->
```

# JavaScript

```javascript
// Un enlace mailto: es una URL como cualquier otra y el navegador la descompone.
// URLSearchParams (lo viste en «Cómo funciona la web») decodifica los %20 y %2C.
const mailLink = document.querySelector('#mail-link');
const params = new URLSearchParams(mailLink.search);
console.log('protocolo    →', mailLink.protocol);
console.log('destinatario →', mailLink.pathname);
console.log('asunto       →', params.get('subject'));
console.log('cuerpo       →', params.get('body'));
console.log('teléfono     →', document.querySelector('#phone-link').href);
```
