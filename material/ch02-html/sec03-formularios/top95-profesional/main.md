# Formularios profesionales

## Por qué importa

Un formulario es el momento en que una persona deja de leer una web y empieza a **usarla**: crea una cuenta, paga, pide una cita, envía una transferencia. Si algo falla ahí, se pierde un cliente, una solicitud o la confianza. Con los tres módulos de HTML que llevas ya puedes construir formularios que muchas webs reales hacen mal: que se rellenan con un clic, que dicen antes qué esperan, que explican los errores donde se ven y donde se oyen, y que funcionan con el teclado, con un lector de pantalla y en un móvil.

Estas trece páginas son de calidad de producción y con contenido realista: el alta de una cuenta, el pago de un pedido, una candidatura de empleo, una cita previa, un aviso de avería, una solicitud por pasos, la inscripción en unas jornadas, las preferencias de un boletín, una transferencia bancaria, la renovación de un carné, un inicio de sesión, un panel de filtros y los ajustes de una cuenta. Todavía no usan CSS de verdad (llega en el capítulo 3): una hoja común, [css/base.css](css/base.css), las hace legibles y cómodas, con un comentario de una línea cuando aparece algo que estudiarás más adelante (`flex`, `position`). El JavaScript que aparece es siempre un adelanto corto y comentado; la mitad de las páginas no lo necesitan.

## Cómo estudiarlas

- **Lee el HTML de arriba abajo.** Los comentarios numerados explican cada decisión: por qué un campo es texto y no número, por qué un enlace está fuera de su etiqueta, por qué un formulario va por POST.
- **Mira la consola.** Cada página carga con `defer` la herramienta del curso [js/form-audit.js](js/form-audit.js), que revisa los formularios con lo aprendido en el módulo y escribe dos informes: una lista de comprobaciones con ✅ o ❌ (etiquetas, `name`, grupos de radio con `legend`, `type` de los botones, tokens de `autocomplete`, ningún código con `type="number"`, `pattern` válidos, diálogos con nombre…) y el **mapa** de cada formulario, desplegable: cómo se envía y, para cada pregunta, su grupo, su etiqueta, su `name`, su token, si es obligatoria y su pista. Las vistas previas de esta teoría no tienen consola; púlsalas para abrirlas en un diálogo con la consola debajo.
- **Envíalos.** La vista previa bloquea la navegación y escribe en la consola la petición que se habría hecho: el método, la URL (con la query en un GET) y los pares. Compara lo que ves con lo que viaja.
- **Recórrelos con el teclado.** Haz clic en la vista previa y pulsa <kbd>Tab</kbd>: primero aparece «Saltar al contenido», y después cada campo en el orden en que se lee, con el foco siempre visible. Prueba también <kbd>Enter</kbd> dentro de un campo y <kbd>Escape</kbd> en los diálogos.
- **Ábrelos como páginas de verdad.** El botón ↗ abre cada página en su propia pestaña. Allí, si tienes direcciones guardadas en Chrome, verás el autocompletado; y en DevTools, el panel **Elements → Accessibility** muestra el nombre y la descripción de cada campo.

Todas las páginas comparten el esqueleto del módulo anterior: enlace para saltar al contenido, `<header>` con su `<nav aria-label="Principal">`, un `<main id="content" tabindex="-1">` y un `<footer>`. Los enlaces a otras páginas usan dominios de ejemplo (`.example`) y se abren en una pestaña nueva.

## 01 · El alta de una cuenta

**Objetivo:** crear una cuenta en una tienda sin que nadie se atasque. **Técnicas:** nombre y apellidos por separado con `given-name` y `family-name`; el correo con `autocomplete="username"`, para que el gestor de contraseñas lo guarde con la contraseña; los requisitos de la contraseña en una pista **antes** de escribir y `new-password`; `novalidate` con mensajes propios elegidos según el motivo de `validity`, junto a cada campo, con `aria-invalid`; un resumen de errores que recibe el foco y enlaza con cada campo. **Fíjate en** el enlace a las condiciones de uso: está **fuera** del `<label>` de la casilla, porque dentro, al pulsarlo, también se marcaría la casilla.

[[exercise:01-alta-de-cuenta.md]]

## 02 · El pago de un pedido

**Objetivo:** el último paso de una compra, el que más abandonos tiene. **Técnicas:** el resumen del pedido en una `<table>`; tokens con sección (`shipping postal-code`, `billing name`) para que el autocompletado distinga las dos direcciones; la forma de envío como una pregunta con radio que incluyen el precio en su etiqueta; una casilla de interfaz (`data-ui`, sin `name`) que desactiva el `<fieldset>` de facturación; los datos de tarjeta con sus tokens (`cc-name`, `cc-number`, `cc-exp`, `cc-csc`) como texto con `inputmode="numeric"`; el total en un `<output>`. **Fíjate en** que el total no se envía: el servidor calcula el suyo, nunca se fía del que le manda el navegador.

[[exercise:02-pago-del-pedido.md]]

## 03 · Una candidatura de empleo

**Objetivo:** enviar un currículum y documentos. **Técnicas:** `method="post"` y `enctype="multipart/form-data"` porque hay archivos; `accept` para filtrar el selector y `multiple` para los certificados; un límite de 5 MB con `setCustomValidity`, porque HTML no puede expresarlo; una región viva que anuncia los archivos elegidos; el puesto en un `select` con `optgroup`; un grupo de radio dentro de otro `<fieldset>`; una carta con contador. **Fíjate en** la consola al elegir archivos y en la línea del envío, que describe cada archivo con su nombre, su tamaño y su tipo.

[[exercise:03-solicitud-de-empleo.md]]

## 04 · Una cita previa

**Objetivo:** reservar una cita en una oficina municipal. **Técnicas:** el trámite en un `select` con `optgroup`; la oficina como una pregunta con radio, cada uno con su dirección en una pista unida por `aria-describedby`; el día con `min` y `max` y una regla propia (solo días laborables) con `setCustomValidity` sobre `valueAsDate`; la hora con `step="900"`, turnos de un cuarto de hora; DNI o NIE con `pattern`; los documentos que hay que llevar, plegados en un `<details>`. **Fíjate en** que cada restricción está explicada en una pista antes de que el usuario pueda equivocarse.

[[exercise:04-cita-previa.md]]

## 05 · Un aviso de avería

**Objetivo:** que un cliente sin conexión pueda contar qué pasa, desde el móvil. **Técnicas:** ni una línea de JavaScript; categorías en un `select` con `optgroup`; `datetime-local` para el momento en que empezó; `minlength` con la pista de lo que conviene contar; fotos con `accept="image/*"` y `multiple`; la ayuda para encontrar el número de cliente en un `popover`; un grupo de radio para la franja de llamada; qué pasa después, en un `<details>`. **Fíjate en** el aviso de urgencias con un enlace `tel:` antes del formulario: lo más importante, antes que lo largo.

[[exercise:05-soporte-tecnico.md]]

## 06 · Una solicitud por pasos

**Objetivo:** una solicitud larga que no abrume. **Técnicas:** un índice de pasos con enlaces a fragmentos y un `<fieldset>` por paso cuya `<legend>` dice «Paso 1 de 4»; grupos dentro de los pasos; la fecha de nacimiento en tres campos con `bday-day`, `bday-month` y `bday-year`; parcelas adaptadas como casillas; la declaración final y el reglamento enlazado fuera de la etiqueta. **Fíjate en** que no hay asistente de JavaScript: todo está en una página, se puede revisar entero antes de enviar y funciona aunque falle el script. Un asistente de verdad (un paso por pantalla) necesita JavaScript y lo verás en su capítulo.

[[exercise:06-solicitud-por-pasos.md]]

## 07 · La inscripción en unas jornadas

**Objetivo:** apuntarse a un evento con entrada, talleres y comida. **Técnicas:** el tipo de entrada como radio con el precio en la etiqueta y el importe en un `<output>`; talleres con un máximo de dos (casillas con el mismo `name` y una regla con `setCustomValidity` en la primera); el menú como radio y las alergias como casillas en un grupo anidado; `autocomplete="organization"`; una pregunta abierta sobre apoyos de accesibilidad. **Fíjate en** que la etiqueta del nombre dice para qué se usa («como quieres que aparezca en tu acreditación»), y en la consola al marcar talleres.

[[exercise:07-inscripcion-en-unas-jornadas.md]]

## 08 · Las preferencias de un boletín

**Objetivo:** elegir qué correos llegan, y darse de baja sin trampas. **Técnicas:** temas como casillas con el mismo `name`; frecuencia y formato como radio; una pausa opcional con `type="date"`; la baja en un `<dialog>` modal que se abre con un invoker command (`command="show-modal"`, sin JavaScript; Chrome y Edge desde la versión 135). Dentro del diálogo, un formulario que **sí** se envía por POST, con un botón «Seguir suscrita» que lo cierra sin enviar gracias a `formmethod="dialog"` y `formnovalidate`. **Fíjate en** que el foco empieza en la opción segura (`autofocus`) y en que no hay ninguna pregunta obligatoria: darse de baja debe ser tan fácil como suscribirse.

[[exercise:08-preferencias-del-boletin.md]]

## 09 · Una transferencia bancaria

**Objetivo:** enviar dinero con una confirmación antes del envío definitivo (todo ficticio). **Técnicas:** IBAN con un `pattern` que admite los espacios; importe como texto con `inputmode="decimal"`; la fecha solo cuando se programa, en un `<fieldset>` que se activa; una confirmación en un `<dialog>` cuyo código SMS (`one-time-code`) y cuyo botón «Confirmar» pertenecen al formulario principal gracias al atributo `form="transfer"`; `event.submitter` para distinguir «Revisar» de «Confirmar»; el resumen construido con `textContent`, nunca con `innerHTML`, porque son datos que ha escrito el usuario. **Fíjate en** que el código solo pasa a ser obligatorio al abrir la confirmación: si lo fuera desde el principio, el primer envío fallaría por un campo escondido en un diálogo cerrado.

[[exercise:09-transferencia-bancaria.md]]

## 10 · La renovación de un carné

**Objetivo:** renovar el carné de biblioteca en un minuto. **Técnicas:** los datos actuales en campos `readonly`, que se ven, se pueden copiar y **sí** se envían; un campo oculto con el motivo; la identidad comprobada con la fecha de nacimiento en tres campos; el cambio de domicilio plegado en un `<details>`, porque casi nadie lo necesita; el formato del carné como pregunta, y la biblioteca de recogida en un `<fieldset>` que se desactiva si el carné es digital. **Fíjate en** la línea del envío: el número de carné y el titular viajan aunque no se puedan editar.

[[exercise:10-renovacion-del-carne.md]]

## 11 · Un inicio de sesión

**Objetivo:** entrar sin pelearse con el formulario. **Técnicas:** `autocomplete="username"` y `current-password` para el gestor de contraseñas; el usuario como texto (no `email`) porque también vale el número de cliente, con `autocapitalize="none"` y `spellcheck="false"`; una casilla «Mostrar la contraseña» que cambia el `type` del campo con un adelanto mínimo de JavaScript, sin `name` porque no debe enviarse; «¿Has olvidado tu contraseña?» como enlace, porque lleva a otra página; una segunda forma de entrar, con un código de un solo uso, en otro formulario con su propio nombre dentro de un `<details>`. **Fíjate en** el mapa de la consola: aparecen dos formularios, cada uno con su nombre.

[[exercise:11-inicio-de-sesion.md]]

## 12 · Un panel de filtros

**Objetivo:** buscar entre los pedidos de una tienda, en el panel interno. **Técnicas:** filtrar es consultar, así que el formulario va por GET dentro de `<search>` y cada combinación de filtros tiene su URL; texto, estado, un intervalo de fechas en un grupo, un importe mínimo con `range` y su `<output>`, casillas y orden; «Quitar todos los filtros» como enlace a la URL sin query; los resultados en una tabla con su número en una región viva. **Fíjate en** la URL de la consola al aplicar los filtros: las casillas marcadas repiten la clave (`shipping=standard&shipping=express`) y el `<output>` no aparece.

[[exercise:12-panel-de-filtros.md]]

## 13 · Los ajustes de una cuenta

**Objetivo:** cambiar datos, contraseña y avisos, y poder irse. **Técnicas:** un formulario por sección, para que cada botón guarde solo lo suyo; una explicación en un `popover`; `current-password` y `new-password` juntos; una casilla `disabled` para el aviso que no se puede quitar, con su motivo como pista; la eliminación en un `<dialog>` que exige escribir ELIMINAR (`pattern` exacto) y se cancela con `formmethod="dialog"` y `formnovalidate`; `returnValue` vaciado antes de abrir. **Fíjate en** qué pasa si quitas `formnovalidate` de «Cancelar»: con el campo vacío, el navegador no deja cerrar el diálogo.

[[exercise:13-ajustes-de-la-cuenta.md]]

## Resumen

- Cada campo tiene su etiqueta visible, su `name`, su token de `autocomplete` cuando es un dato personal y, si hace falta, una pista unida con `aria-describedby`.
- Las preguntas con varias respuestas son grupos con `<legend>`; los formularios largos se dividen en grupos y pasos, en el orden de una conversación.
- El tipo de cada campo sale de lo que **es** el dato: los códigos, los IBAN y los importes son texto con `inputmode`; `number`, solo para cantidades.
- La validación nativa cubre casi todo; lo demás (un tamaño de archivo, un día laborable, un máximo de casillas) se añade con `setCustomValidity`, y los mensajes propios se eligen según `validity`.
- `<dialog>`, `popover` y `<details>` resuelven las confirmaciones, la ayuda y la información opcional sin fabricar nada a mano.
- Una herramienta como [js/form-audit.js](js/form-audit.js) detecta lo automático; el teclado, el zoom y un lector de pantalla detectan el resto.
