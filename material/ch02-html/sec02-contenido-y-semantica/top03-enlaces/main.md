# Enlaces

## Por qué importa

Los enlaces son lo que convierte un montón de documentos en una **web**: la «H» de HTML viene de *hypertext*, texto que lleva a otros textos. Un enlace parece lo más sencillo del mundo, pero esconde varias decisiones: a dónde lleva (y cómo se resuelve esa dirección), dónde se abre, qué puede saber la página de destino de la tuya, qué dice su texto y, sobre todo, si de verdad tiene que ser un enlace o es un botón disfrazado. Equivocarse en esto último es uno de los errores de accesibilidad más comunes de la web.

## El elemento `a` y su `href`

Un enlace es un elemento `<a>` (de *anchor*, «ancla») con un atributo `href` (*hypertext reference*): la dirección a la que lleva. El contenido del `<a>` es lo que se ve y se pulsa.

```html
<a href="https://developer.mozilla.org/es/">Documentación de MDN</a>
```

El `href` puede escribirse de varias formas, que ya conoces de la lección «Cómo funciona la web»:

| Tipo | Ejemplo | Se resuelve como… | Úsalo para |
|---|---|---|---|
| absoluta | `https://developer.mozilla.org/es/` | tal cual | enlazar a otros sitios |
| relativa | `pages/contact.html`, `../index.html` | contra la URL del documento actual | páginas de tu propio sitio |
| desde la raíz | `/contacto` | contra la raíz del servidor | sitios que viven en la raíz del dominio |
| fragmento | `#legal` | la URL actual + `#legal` | saltar dentro de la misma página |
| otros esquemas | `mailto:…`, `tel:…` | lo abre otro programa | correo, teléfono |

El navegador pinta los enlaces en azul y subrayados, en morado los que ya visitaste, con el cursor de «mano» encima y un contorno al recibir el foco con el teclado. Todo eso es la hoja de estilos del navegador, y lo podrás cambiar con CSS; lo que no debes cambiar es que se reconozcan como enlaces.

Como con las imágenes y los scripts, la propiedad `href` de un enlace (JavaScript) devuelve la URL ya resuelta, la que se pedirá al hacer clic; `getAttribute('href')` devuelve lo que escribiste:

[[exercise:01-anatomia-de-un-enlace.md-]]

```text
https://developer.mozilla.org/es/docs/Web/HTML/Element/a → https://developer.mozilla.org/es/docs/Web/HTML/Element/a
pages/contact.html → http://localhost:3001/preview/…/pages/contact.html
/ → http://localhost:3001/
#legal → http://localhost:3001/preview/…/index.html#legal
```

Las URL exactas dependen de dónde se ejecute el ejemplo (el editor y el diálogo de la teoría usan bases distintas), pero la idea es la misma: un `href` relativo siempre se completa con la URL del documento. Si pulsas «página de contacto» en la vista previa, navegarás a otra página de la carpeta `assets/` del tema; su botón «← Volver» te trae de vuelta.

## Fragmentos: enlaces dentro de la página

Un `href` que empieza por `#` lleva a un elemento **de la misma página** cuyo `id` coincide: `href="#returns"` desplaza la página hasta el elemento con `id="returns"`. No se descarga nada, y la URL de la barra de direcciones termina en `#returns`, así que se puede compartir o guardar en marcadores y abrirá la página en ese punto. También puedes enlazar a un fragmento de otra página: `faq.html#returns`.

Algunos detalles:

- Si ningún elemento tiene ese `id`, no pasa nada: ni error ni desplazamiento.
- `#top` es especial: si no hay ningún `id="top"`, lleva al principio de la página. Lo mismo hace `href="#"`, el fragmento vacío (recuerda esto, porque es la causa de un bicho de esta lección).
- El elemento de destino se puede resaltar con CSS gracias a la pseudoclase `:target`, que verás en el capítulo de CSS.

[[exercise:02-fragmentos.md]]

Los índices al principio de un artículo largo, el «↑ Volver arriba» del final y las notas al pie con su enlace de vuelta (como en la lección de texto) son fragmentos.

## Dónde se abre: `target` y `rel`

Por defecto, un enlace se abre en la misma pestaña (`target="_self"`). Con `target="_blank"` se abre en una pestaña nueva. Existen también `_parent` y `_top`, para páginas dentro de marcos (`<iframe>`), que verás en el módulo de contenido embebido.

Abrir una pestaña nueva tiene una historia de seguridad. La página abierta recibía una referencia a la tuya, `window.opener`, y con ella podía cambiar tu pestaña de dirección a escondidas: el usuario volvía a tu pestaña y se encontraba una copia falsa de tu página pidiéndole la contraseña (un ataque llamado *tabnabbing*). La protección era añadir `rel="noopener"`. Desde 2021 todos los navegadores aplican `noopener` automáticamente a cualquier `target="_blank"`, pero verás `rel="noopener noreferrer"` en casi todo el código existente, y no sobra.

El atributo `rel` describe la relación entre tu página y la de destino:

| `rel` | Efecto |
|---|---|
| `noopener` | la página nueva no recibe `window.opener` (implícito con `_blank`) |
| `opener` | lo contrario: la página nueva sí lo recibe |
| `noreferrer` | no envía la cabecera `Referer` (la URL de tu página) y, además, implica `noopener` |
| `nofollow` | pide a los buscadores que no tengan en cuenta el enlace (comentarios de usuarios, enlaces pagados) |

Este ejemplo abre la misma página de `assets/` con tres combinaciones; la página nueva muestra lo que puede ver. Necesita poder abrir pestañas, así que pruébalo en el editor («Open in editor») o en su propia pestaña con el botón ↗:

[[exercise:03-target-blank-y-rel.md-]]

| Enlace | `window.opener` en la pestaña nueva | `document.referrer` |
|---|---|---|
| 1. `target="_blank"` | `null` | la URL de la vista previa |
| 2. `rel="opener"` | existe | la URL de la vista previa |
| 3. `rel="noopener noreferrer"` | `null` | vacío |

Más allá de la seguridad, piensa si de verdad quieres abrir otra pestaña. Rompe el botón «Atrás», desorienta a quien usa lector de pantalla o lupa, y quien quiera abrir un enlace aparte ya sabe hacerlo (<kbd>⌘</kbd>/<kbd>Ctrl</kbd> + clic, o clic con la rueda). Resérvalo para cuando perder la página actual haría daño (un formulario a medio rellenar con un enlace a la ayuda) y avísalo en el texto: «(se abre en una pestaña nueva)».

## Descargas: `download`

Si un enlace apunta a un archivo que el navegador sabe mostrar (texto, imágenes, PDF), lo **abre**. El atributo `download` le pide que lo **descargue**; su valor, opcional, es el nombre de archivo que propondrá al guardarlo.

Por seguridad, `download` solo funciona con archivos del mismo origen que la página (y con URL `blob:` y `data:` que verás en JavaScript); en enlaces a otros sitios se ignora. Las tarjetas de la teoría son documentos aislados que no pueden descargar: pruébalo en el editor o con ↗.

[[exercise:04-download.md-]]

```text
Ver el horario (TXT)             → download: ""
Descargar el horario (TXT, 1 KB) → download: "horario-biblioteca.txt"
```

El servidor también puede forzar una descarga con la cabecera `Content-Disposition: attachment`, y entonces da igual que el enlace tenga `download` o no.

## Correo y teléfono: `mailto:` y `tel:`

Un `href` no tiene por qué empezar por `http`. Con `mailto:` el enlace abre el programa de correo con un mensaje nuevo, y con `tel:` el móvil marca el número (en un ordenador, abre la aplicación de llamadas si hay alguna).

```html
<a href="mailto:reservas@ejemplo.com?subject=Reserva&amp;body=Hola">Reservar por correo</a>
<a href="tel:+34910000000">910 00 00 00</a>
```

Son URL como cualquier otra: el asunto (`subject`), el cuerpo (`body`) y las copias (`cc`, `bcc`) van en la query, con los espacios y caracteres especiales codificados (`%20` es un espacio). El `&` que separa los datos se escribe `&amp;` dentro del HTML, como aprendiste con las entidades. En `tel:`, el número va en formato internacional y sin espacios; el texto visible, como se lee.

[[exercise:05-mailto-y-tel.md-]]

```text
protocolo    → mailto:
destinatario → reservas@ejemplo.com
asunto       → Reserva de mesa
cuerpo       → Hola, quiero reservar para 4 personas.
teléfono     → tel:+34910000000
```

Escribe también la dirección o el número a la vista: mucha gente no tiene un programa de correo configurado y prefiere copiarla.

> **Desde Python:** `urllib.parse.quote("Reserva de mesa")` devuelve `'Reserva%20de%20mesa'`, y `urlencode({"subject": "Reserva", "body": "Hola, mesa para 4"}, quote_via=quote)` construye la query entera. Es exactamente la codificación que espera un `mailto:`.

## El texto del enlace

El texto de un enlace tiene que decir **a dónde lleva**, y entenderse solo. No es un capricho: quien usa un lector de pantalla suele pedir la lista de todos los enlaces de la página (NVDA: <kbd>Insert</kbd> + <kbd>F7</kbd>; VoiceOver: el rotor) o saltar de enlace en enlace con <kbd>Tab</kbd>, y en los dos casos oye el texto del enlace **sin** el párrafo que lo rodea. Y quien mira la página por encima, sin leerla, salta de enlace en enlace con la vista.

- Nada de «haz clic aquí», «aquí», «leer más» o «enlace».
- Dos enlaces con el mismo texto deben llevar al mismo sitio.
- Si es un archivo, di su formato y su tamaño: «Horario (PDF, 240 KB)».
- No uses la URL como texto, salvo que la URL sea lo que quieres comunicar: un lector de pantalla la deletrea entera.
- `title` no lo arregla: casi nadie lo ve ni lo oye.

[[exercise:06-texto-del-enlace.md-]]

```text
❌ Noticias
   🔗 Leer más
   🔗 Leer más
   🔗 aquí
✅ Noticias
   🔗 El ayuntamiento amplía el horario de las bibliotecas
   🔗 Abre el plazo para las becas de comedor
   🔗 Descarga el horario de la biblioteca (TXT, 1 KB)
```

## Lo que puede (y no puede) haber dentro de un enlace

El modelo de contenido de `<a>` es *transparente*: admite lo mismo que admitiría su padre. Dentro de un párrafo solo puede llevar texto y contenido de frase, pero dentro de un `<div>` puede envolver bloques enteros, como una tarjeta completa con su título, su imagen y su texto.

La única prohibición es el **contenido interactivo**: dentro de un enlace no puede haber otro enlace, ni un botón, ni un campo de formulario. Y en el caso de un `<a>` dentro de otro, el parser no se limita a protestar: al ver el segundo `<a>` **cierra el primero**. Pasa en cuanto alguien convierte una tarjeta entera en enlace y luego añade, dentro, un enlace al autor o a la categoría:

[[exercise:07-enlace-dentro-de-enlace.md]]

```text
❌ #broken →
  <a href="pages/library-hours.html">
    Noticia: la biblioteca amplía su horario. Publicada por
    </a><a href="pages/contact.html">la Concejalía de Cultura</a>
    el 20 de octubre.
  
✅ #fixed  →
  <a href="pages/library-hours.html">Noticia: la biblioteca amplía su horario.</a>
  Publicada por <a href="pages/contact.html">la Concejalía de Cultura</a>
  el 20 de octubre.
```

El primer enlace termina antes de lo que creías, «el 20 de octubre» se queda fuera de cualquier enlace y el `</a>` del final se ignora porque ya no queda ningún `<a>` abierto.

## ¿Enlace o botón?

Es la decisión más importante de esta lección. Un enlace y un botón pueden tener el mismo aspecto (el CSS lo permite todo), pero no se comportan igual:

| | Enlace `<a href>` | Botón `<button>` |
|---|---|---|
| Para qué | **ir** a otro sitio: otra página u otra parte de esta | **hacer** algo aquí: enviar, añadir, abrir, borrar |
| ¿Tiene URL? | sí: se puede abrir en otra pestaña, copiar, guardar | no |
| Teclado | <kbd>Enter</kbd> | <kbd>Enter</kbd> y <kbd>Espacio</kbd> |
| Historial | crea una entrada: «Atrás» vuelve | no |
| Lector de pantalla | «enlace» | «botón» |

La pregunta para decidir: **¿cambia la URL?** Si sí, es un enlace. Si la acción ocurre en la página actual, es un botón. «Ver el producto» es un enlace; «Añadir al carrito», un botón. «Iniciar sesión» que lleva a la página de login es un enlace; el «Iniciar sesión» que envía el formulario, un botón.

Un `<a>` sin `href` no es un enlace: no se pinta como enlace, no recibe el foco con <kbd>Tab</kbd> y el teclado no lo activa. Es un hueco para un enlace que aún no existe (por ejemplo, la página actual dentro de un menú).

[[exercise:08-enlace-o-boton.md]]

El error clásico es el **botón falso**: un `<a href="#">` (o `href="javascript:void(0)"`) con un `onclick`, porque «así ya tiene aspecto clicable». Hace su trabajo, sí; pero después el navegador sigue el enlace, y `#` lleva al principio de la página. Quien estaba leyendo los comentarios al final del artículo pulsa «Me gusta» y aparece arriba del todo. Además, <kbd>Espacio</kbd> no lo activa, y el lector de pantalla anuncia «enlace» para algo que no lleva a ninguna parte.

[[exercise:09-href-almohadilla.md-]]

```text
❌ enlace → me gusta: 1 | desplazamiento vertical: 0 px
✅ botón → me gusta: 2 | desplazamiento vertical: 812 px
```

El número de píxeles depende del tamaño de tu vista previa; lo importante es que el enlace te devuelve a 0. El error opuesto también existe, un `<button>` que navega a otra página: pierde el clic con la rueda, el «copiar enlace» y el historial. Cada elemento para lo suyo.

## Bestiario

**🐛 La lista de enlaces dice «Leer más, Leer más, aquí».**
- *Síntoma:* fuera de su párrafo (en la lista de enlaces de un lector de pantalla, al saltar con <kbd>Tab</kbd>) los enlaces no dicen a dónde llevan.
- *Causa:* el texto del enlace depende del texto que lo rodea.
- *Solución:* que el propio texto del enlace describa el destino (y el formato y tamaño, si es un archivo). → [ver ejemplo](06-texto-del-enlace.md)

**🐛 Una tarjeta que es un enlace queda partida en dos.**
- *Síntoma:* parte del texto de la tarjeta deja de ser clicable, o el clic lleva a un sitio inesperado; en **Elements** aparecen dos `<a>` hermanos donde escribiste uno dentro de otro.
- *Causa:* un enlace no puede contener otro; el parser cierra el primero al encontrar el segundo.
- *Solución:* enlaces hermanos, nunca anidados (con CSS se puede ampliar la zona clicable sin anidar). → [ver ejemplo](07-enlace-dentro-de-enlace.md)

**🐛 Al pulsar un «botón», la página salta al principio.**
- *Síntoma:* una acción funciona, pero la página vuelve arriba y la URL termina en `#`; además <kbd>Espacio</kbd> no la activa.
- *Causa:* es un `<a href="#">` haciendo de botón: tras el `onclick`, el navegador sigue el enlace al fragmento vacío, que es el principio de la página.
- *Solución:* las acciones son `<button type="button">`; los enlaces, solo para ir a otro sitio. → [ver ejemplo](09-href-almohadilla.md)

## Resumen

- `<a href>` es un enlace; el `href` puede ser absoluto, relativo (contra la URL del documento), desde la raíz, un fragmento (`#id`) u otro esquema (`mailto:`, `tel:`).
- Un fragmento desplaza la página hasta el `id` y cambia la URL; `#top` y `#` llevan al principio.
- `target="_blank"` abre otra pestaña, hoy con `noopener` implícito; `rel` controla `opener`, `Referer` y `nofollow`. Úsalo poco y avísalo.
- `download` descarga en lugar de abrir (solo en el mismo origen); `mailto:` y `tel:` son URL con sus datos codificados.
- El texto del enlace dice a dónde lleva y se entiende fuera de contexto.
- Un enlace no puede contener contenido interactivo: un `<a>` dentro de otro parte el primero.
- **Enlace para ir, botón para hacer.** Un `<a href="#">` con `onclick` es un botón roto.

## Para profundizar

- [MDN — `<a>`: el elemento ancla](https://developer.mozilla.org/es/docs/Web/HTML/Element/a)
- [MDN — `rel="noopener"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener)
- [WebAIM — Links and Hypertext (texto de los enlaces accesible)](https://webaim.org/techniques/hypertext/)
- [WHATWG — Links: hipervínculos, `download` y tipos de `rel`](https://html.spec.whatwg.org/multipage/links.html)
