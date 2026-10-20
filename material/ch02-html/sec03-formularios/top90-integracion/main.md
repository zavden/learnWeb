# Integración: formularios

## Por qué importa

En las lecciones de este módulo has visto cada pieza por separado: el envío, los controles, la validación, la experiencia de usuario y los elementos interactivos. Un formulario real las usa todas a la vez y cada una depende de las demás: un campo sin `name` no llega aunque esté perfectamente validado; un mensaje de error impecable no sirve si no está unido a su campo; un diálogo de confirmación bonito repite una acción si nadie vacía su `returnValue`.

Dos preguntas guían todos estos ejemplos: **¿qué recibe el servidor?** y **¿qué oye alguien que no ve la pantalla?** La consola responde a la primera: la vista previa escribe cada envío con su URL y sus pares, y algunos ejemplos añaden un pequeño script (un adelanto de JavaScript) que imprime el «mapa» del formulario. La segunda la responden las etiquetas, los grupos, las pistas y los mensajes que verás en cada uno.

Aquí tienes ocho ejemplos que combinan varias lecciones y tres ejercicios que se corrigen solos: su consola marca cada requisito con ✅ o ❌.

## Qué combina cada ejemplo

| Ejemplo | Envío | Controles | Validación | Experiencia de usuario | Interactivos |
|---|---|---|---|---|---|
| 01 Alta de socio | ✔ | ✔ | ✔ | ✔ | |
| 02 Direcciones de envío y facturación | ✔ | ✔ | ✔ | ✔ | |
| 03 Encuesta de un taller | ✔ | ✔ | | | |
| 04 Buscador del catálogo | ✔ | ✔ | | ✔ | |
| 05 Reserva de un taller | | ✔ | ✔ | ✔ | |
| 06 Ajustes en un diálogo | ✔ | ✔ | | | ✔ |
| 07 Ayuda y envío sin repeticiones | ✔ | ✔ | ✔ | ✔ | ✔ |
| 08 Errores accesibles | ✔ | ✔ | ✔ | ✔ | |

Las vistas previas de esta página no tienen consola: pulsa cualquiera de ellas para abrirla en un diálogo con la consola debajo, o ábrela en el editor.

## Alta de socio

El formulario de alta de una asociación, con todo lo básico bien hecho. Los campos se agrupan en `<fieldset>` con su `<legend>` («Tus datos», «Tu cuenta») y la pregunta de la cuota es la `<legend>` de sus radio. Cada campo lleva su token de `autocomplete` (`name`, `email`, `tel`, `postal-code`, `new-password`), las pistas están unidas con `aria-describedby`, el código postal es texto con `inputmode="numeric"` y un `pattern`, y la página dice al principio qué es opcional. Los errores se marcan con `:user-invalid`, así que el formulario no aparece en rojo antes de que lo toques.

[[exercise:01-alta-de-socio.md]]

```text
Tus datos › Nombre y apellidos → full_name · autocomplete=name · obligatorio
Tus datos › Correo electrónico → email · autocomplete=email · obligatorio
Tus datos › Teléfono (opcional) → phone · autocomplete=tel
Tus datos › Código postal → postal_code · autocomplete=postal-code · obligatorio
Tu cuenta › Contraseña → password · autocomplete=new-password · obligatorio
¿Qué cuota prefieres? › (elige una opción) → fee · obligatorio
— › He leído las normas del huerto → rules · obligatorio
— › Quiero recibir el boletín mensual (opcional) → newsletter
```

Ese mapa reúne en una línea por pregunta lo que necesitan tres máquinas distintas: el lector de pantalla (grupo y etiqueta), el servidor (`name`) y el autocompletado (el token).

## Direcciones de envío y facturación

El paso de las direcciones de una tienda. Como hay dos direcciones, los tokens llevan **sección**: `shipping postal-code` y `billing postal-code` son el mismo tipo de dato en dos sitios distintos, y el autocompletado puede rellenar cada uno con una dirección diferente. La casilla «la misma dirección» desactiva el `<fieldset>` de facturación, así que sus campos dejan de recibir el foco, de validarse y de enviarse, y el CSS lo refleja con `fieldset:disabled`.

[[exercise:02-direcciones-de-envio-y-facturacion.md]]

```text
(index)  campo                         name              autocomplete
0        Nombre de quien recibe        ship_name         shipping name
1        Calle y número                ship_line1        shipping address-line1
2        Piso, puerta… (opcional)      ship_line2        shipping address-line2
3        Código postal                 ship_postal_code  shipping postal-code
4        Localidad                     ship_city         shipping address-level2
5        Teléfono para el repartidor   ship_phone        shipping tel
6        Nombre o razón social         bill_name         billing name
7        Calle y número                bill_line1        billing address-line1
8        Código postal                 bill_postal_code  billing postal-code
```

Con la casilla marcada, el envío solo lleva los campos `ship_*` y `same_address: 'on'`; al desmarcarla, los de facturación pasan a ser obligatorios y viajan también. El NIF no tiene token: ningún navegador lo guarda.

## Encuesta de un taller

Una encuesta con un poco de todo: una pregunta de cinco radio, casillas opcionales con el mismo `name`, un deslizador cuyo valor muestra un `<output>`, un `<textarea>` con un contador de caracteres y un campo oculto con el taller al que responde. El contador **no** es un `<output>`: como región viva, un lector de pantalla anunciaría cada tecla; es una pista con `aria-describedby`, que se lee al llegar al campo.

[[exercise:03-encuesta-de-un-taller.md]]

```text
workshop = compost-2026-10-24
rating = 4
useful = practice
recommend = 8
improve = Más tiempo para preguntas
Form submitted (navigation blocked in preview): POST https://huerta.example/talleres/encuesta (application/x-www-form-urlencoded) {workshop: 'compost-2026-10-24', rating: '4', useful: 'practice', recommend: '8', improve: 'Más tiempo para preguntas'}
```

Esa es la salida tras elegir «Bien», marcar «Montar el compostador» y escribir una mejora. Compárala con la pantalla: el `<output>` no viaja, las dos casillas sin marcar tampoco, y el campo oculto sí, aunque nadie lo haya visto.

## Buscador del catálogo

Un buscador que hace lo que debe hacer un buscador: GET, para que cada búsqueda tenga su propia URL y se pueda compartir o volver a ella con «Atrás». Está dentro de `<search>`, la región de búsqueda; el campo sugiere búsquedas frecuentes con `<datalist>` y en el móvil muestra «Buscar» en la tecla Intro (`enterkeyhint`). Los filtros son un `select`, dos radio y una casilla con `value="1"`, para que la URL diga `available=1` en lugar de `available=on`.

[[exercise:04-buscador-del-catalogo.md]]

```text
Form submitted (navigation blocked in preview): GET https://biblioteca.example/catalogo/buscar?q=huerto+en+casa&format=book&sort=relevance&available=1 {q: 'huerto en casa', format: 'book', sort: 'relevance', available: '1'}
Form submitted (navigation blocked in preview): GET https://biblioteca.example/catalogo/buscar?q=huerto+en+casa&format=&sort=relevance {q: 'huerto en casa', format: '', sort: 'relevance'}
```

La segunda línea es con «Cualquier formato» y la casilla desmarcada: el `select` envía su valor aunque esté vacío (`format=`), mientras que la casilla desaparece. El servidor tiene que entender las dos formas de «sin filtro».

## Reserva de un taller

Una reserva con fecha, hora y número de plazas limitados. Las restricciones nativas cubren casi todo: `min` y `max` en la fecha, turnos de media hora con `step="1800"` en la hora (en segundos, contados desde `min`) y un máximo de cuatro personas. Lo que HTML no puede expresar (los talleres son los sábados) se añade con `setCustomValidity`, y entonces el navegador lo trata como a cualquier otra regla. Cada restricción se explica **antes** con una pista.

[[exercise:05-reserva-de-un-taller.md]]

```text
day = 2026-10-23 → ❌ customError · «Los talleres son los sábados: elige un sábado.»
time = 10:15 → ❌ stepMismatch
people = 6 → ❌ rangeOverflow
```

Los tres valores iniciales fallan, pero ningún campo aparece en rojo hasta que intentas reservar o los tocas: es `:user-invalid`. Al elegir el 24 de octubre, las 10:30 y 2 personas, las tres líneas pasan a ✅. La regla del sábado usa `getUTCDay()` sobre `valueAsDate`, que es el día a medianoche UTC: así el resultado no depende de la zona horaria de quien lo usa.

## Ajustes en un diálogo

Unos ajustes de lectura en un `<dialog>` modal. Su formulario usa `method="dialog"`, así que «Guardar» y «Cancelar» lo cierran y dejan su `value` en `returnValue`; al cerrarse, el script solo aplica los cambios si la respuesta es `save`, y los lee con `FormData` como si fuera un envío. Dos detalles que suelen olvidarse: al abrir se vacía `returnValue` (lección de elementos interactivos) y se vuelven a mostrar los valores **guardados**, para que unos cambios cancelados no aparezcan la vez siguiente.

[[exercise:06-ajustes-en-un-dialogo.md]]

```text
Guardado: {text_size: 'large', reduce_motion: false, alerts: 'email'}
Sin cambios (returnValue: 'cancel')
Sin cambios (returnValue: '')
```

La primera línea es al guardar «Grande»; la segunda, al cancelar; la tercera, al cerrar con Escape. El resumen de la página es una región viva (`role="status"`), así que un lector de pantalla anuncia los ajustes nuevos al guardar.

## Ayuda y envío sin repeticiones

Una solicitud con la ayuda donde hace falta. La explicación larga de un campo («¿Dónde lo encuentro?») está en un `popover`, que no ocupa sitio ni bloquea la página, y las preguntas frecuentes en `<details>` con el mismo `name`. Al enviar, el formulario queda `inert` mientras llega la respuesta, que aquí se simula: no se puede pulsar dos veces ni cambiar nada a medias. El mensaje de estado está **fuera** del formulario, porque lo que está dentro de algo inerte desaparece del árbol de accesibilidad y no se anunciaría.

[[exercise:07-ayuda-y-envio-sin-repeticiones.md]]

```text
Cuerpo de la petición: full_name=Marta+Ruiz+Gil&census_number=20260417&plot_size=medium
✔ Respuesta (simulada): solicitud recibida
```

## Errores accesibles

La versión completa de los errores de la lección de experiencia de usuario, en un formulario de soporte. El navegador sigue validando (con `novalidate` solo se desactivan sus avisos), y el script elige un mensaje **por motivo**: no es lo mismo un campo vacío que un número de pedido mal escrito o un mensaje demasiado corto. Los mensajes se guardan en atributos `data-*` de cada campo. Cada error aparece junto a su campo, unido con `aria-describedby` y marcado con `aria-invalid`, y además en un resumen al principio que recibe el foco y enlaza con cada campo. El número de pedido es opcional: vacío es válido; mal escrito, no.

[[exercise:08-errores-accesibles.md]]

```text
Errores: topic (Elige el tema de tu consulta.) · email (Escribe tu correo electrónico.) · message (Cuéntanos qué ha pasado.)
```

Esa es la salida al enviar el formulario vacío. Prueba después con un pedido como `sr-2045` y un mensaje corto: el pedido muestra el mensaje de formato y el textarea el de longitud (`tooShort`, que solo cuenta lo que ha escrito el usuario).

## Ejercicios

Los tres ejercicios incluyen un script de comprobación que no tienes que tocar (está bloqueado, igual que el CSS): tras cada cambio, la vista previa se vuelve a ejecutar y la consola marca cada requisito con ✅ o ❌. Ábrelos en el editor para trabajar con la consola a la vista y, cuando todo esté en verde, compara tu versión con la solución.

**Arregla el formulario de contacto.** Un formulario que parece correcto y no lo es: envía por GET, la etiqueta del nombre apunta a un `id` que no existe, dos campos no tienen `name`, el correo solo tiene un `placeholder`, las dos formas de respuesta no forman un grupo y los botones no dicen su `type`, así que «Vista previa» envía el formulario. La consola lista también qué llegaría al servidor.

[[exercise:09-ej-arregla-el-formulario-de-contacto.md]]

**Valida la inscripción.** Una inscripción sin ninguna restricción. Añade las que faltan: obligatorios, el formato del correo, un código postal que no sea `type="number"`, una edad entre 16 y 99, un número de socio opcional con su formato y un nombre de usuario cuyo `pattern` el navegador ignora. La consola prueba valores en cada campo, así que sabrás exactamente qué acepta todavía y no debería.

[[exercise:10-ej-valida-la-inscripcion.md]]

**Completa el diálogo de baja.** Un diálogo que se abre sin ser modal, no tiene nombre, navega al pulsar sus botones (mira la consola) y no dice qué se eligió; y unas preguntas frecuentes que no se pliegan. Cuando esté terminado, prueba las dos respuestas y Escape.

[[exercise:11-ej-completa-el-dialogo.md]]

## Resumen

- Cada pieza depende de las demás: sin `name` no hay dato, sin `<label>` no hay nombre, sin `aria-describedby` la pista y el error no se oyen.
- Un formulario largo se agrupa con `<fieldset>` y `<legend>`, dice antes qué es opcional y qué formato se espera, y lleva los tokens de `autocomplete`, con sección (`shipping`, `billing`) si hay dos direcciones.
- GET para consultar (la URL se comparte), POST para cambiar algo; un `select` vacío envía su clave vacía y una casilla sin marcar no envía nada.
- Las restricciones nativas cubren casi todo; lo demás se añade con `setCustomValidity`, y los mensajes propios se eligen según el motivo de `validity`.
- Un diálogo con `method="dialog"` se lee con `returnValue` y `FormData`; vacía `returnValue` y muestra lo guardado al abrir.
- `popover`, `<details>` e `inert` resuelven la ayuda, las preguntas frecuentes y el doble envío sin fabricar nada a mano.
