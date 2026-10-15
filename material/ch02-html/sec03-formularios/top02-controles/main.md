# Los controles

## Por qué importa

HTML tiene un control nativo para casi cualquier dato: textos, correos, números, fechas, colores, listas, archivos. Elegir el adecuado te da gratis muchas cosas que costaría semanas programar: el teclado correcto en el móvil, un calendario para elegir fechas, la validación del formato, el manejo con teclado y lo que anuncia un lector de pantalla. Elegir mal (o fabricar un control con `<div>`) te quita todo eso.

En esta lección verás cada control útil, qué **valor** envía (que no siempre es lo que se ve) y el error más repetido de los formularios: un `<button>` que envía cuando no debía.

## `label`: el nombre de cada campo

Todo control necesita una etiqueta visible, un `<label>`. Hay dos formas de asociarla:

- **Explícita**: `<label for="email">` apunta al `id` del campo. La etiqueta puede estar en cualquier parte.
- **Implícita**: el campo va **dentro** del `<label>`. Es cómoda para casillas: `<label><input type="checkbox"> Acepto</label>`.

La asociación hace tres cosas: el texto de la etiqueta pasa a ser el **nombre accesible** del campo (lo que viste en la lección de accesibilidad), pulsar el texto **enfoca** el campo o marca la casilla (un área mucho más fácil de acertar, sobre todo en el móvil), y el navegador sabe qué texto describe qué campo. El error clásico es escribir en `for` el `name` del campo en lugar de su `id`: la etiqueta se ve, pero no está asociada a nada.

[[exercise:01-label-implicito-y-explicito.md]]

Si abres el ejemplo en el diálogo (pulsa la tarjeta) o en el editor, la consola muestra la etiqueta de cada campo, que es lo que anunciaría un lector de pantalla:

```text
email → «Correo electrónico»
weekly → «Quiero el resumen semanal»
city → (sin label: se anuncia solo «campo de texto»)
```

Dentro de un `<label>` no pongas otros elementos interactivos (enlaces, botones), porque pulsarlos activaría también el campo. Y un texto de ejemplo (`placeholder`) no sustituye a la etiqueta: lo verás en la lección de experiencia de usuario.

## Campos de texto

`<input>` cambia por completo según su atributo `type`. Todos estos envían **texto**, pero cada tipo añade algo:

| `type` | Qué añade |
|---|---|
| `text` | nada: es el valor por defecto |
| `email` | comprueba al enviar que tenga forma de correo; en el móvil, teclado con `@` |
| `url` | exige una dirección completa, con esquema (`https://…`) |
| `tel` | no valida nada (cada país escribe los teléfonos a su manera), pero abre el teclado numérico |
| `search` | una ✕ para borrar y Escape para vaciar; en el móvil, la tecla Intro dice «Buscar» |
| `password` | tapa los caracteres en pantalla y avisa de que es una contraseña (gestores de contraseñas) |

Para textos de varias líneas existe `<textarea>`. Su valor es su **contenido**, no un atributo `value`, y su tamaño inicial se da con `rows` y `cols`. Como `<pre>` (lo viste en la lección de texto), el parser borra el salto de línea que va justo después de `<textarea>`, y todo lo demás, espacios incluidos, forma parte del valor: escribe el contenido pegado a la etiqueta.

[[exercise:02-campos-de-texto.md]]

Pulsa «Guardar perfil» en la vista previa: el correo `marta@` y la web sin `https://` no pasan la comprobación de su tipo, y el navegador te lo dice antes de enviar nada. La validación tiene su propia lección.

El primer formulario está dentro de `<search>`, un elemento que marca la **región de búsqueda** de la página (rol `search`), igual que `<nav>` marca la navegación.

## Números: `number` y `range`

- `type="number"` muestra flechas para subir y bajar (también con ↑ y ↓). `min`, `max` y `step` limitan los valores (por defecto `step` vale 1; `step="any"` admite cualquier decimal).
- `type="range"` es un deslizador para valores aproximados. No muestra el número elegido y nunca está vacío: si no le das `value`, empieza en el punto medio entre `min` y `max` (por defecto, 0 y 100).

[[exercise:03-number-y-range.md-]]

```text
guests: value → '2' (string) · valueAsNumber → 2
max_price: value → '120' (string) · valueAsNumber → 120
```

Aunque el control sea numérico, su valor es **texto**, y como texto se envía. JavaScript ofrece `valueAsNumber` para leerlo ya convertido.

> **Desde Python:** es lo mismo que `input()`, que devuelve siempre un `str` aunque escribas `42`. En el servidor tendrás que convertirlo (`int(request.form['guests'])`) y comprobar que de verdad es un número: nadie te garantiza que la petición venga de tu formulario.

`number` es para **cantidades**: personas, unidades, años. Un código postal, un número de tarjeta o un PIN no son cantidades (no se suman ni tiene sentido «subirlos uno»), y `type="number"` les causa problemas que verás en la lección de experiencia de usuario.

## Fechas, horas y colores

| `type` | Qué se ve | Qué se envía |
|---|---|---|
| `date` | un calendario | `2026-10-24` |
| `time` | horas y minutos | `17:30` (siempre 24 horas) |
| `datetime-local` | fecha y hora | `2026-10-23T20:00` (sin zona horaria) |
| `month`, `week` | mes o semana del año | `2026-10`, `2026-W43` (no todos los navegadores los muestran con selector) |
| `color` | un selector de color | `#15803d` (siempre en minúsculas) |

Lo que ves en el campo depende del **idioma del navegador**, no del `lang` de la página; lo que se envía, nunca. Así el servidor siempre recibe el mismo formato, venga de quien venga.

[[exercise:04-fecha-hora-y-color.md-]]

```text
Idioma del navegador: en-US
day → '2026-10-24'
arrival → '17:30'
reminder → '2026-10-23T20:00'
tag_color → '#15803d'
```

Con un Chrome en inglés de Estados Unidos, el campo de fecha muestra `10/24/2026` y la hora `05:30 PM`; con uno en español, `24/10/2026` y `17:30`. El valor es el mismo en los dos casos. Recuerda también que `datetime-local` no incluye la zona horaria: si el servidor necesita el instante exacto, tiene que saber en qué zona está el usuario.

## Casillas y botones de opción

- `type="checkbox"`: una casilla **independiente**, que se marca o se desmarca. Varias casillas pueden compartir `name`, y entonces la clave se repite una vez por casilla marcada.
- `type="radio"`: una opción de un **grupo**. Los botones con el mismo `name` forman el grupo y solo uno puede estar marcado.

El atributo `checked` (un atributo booleano, como `disabled`) decide cuál empieza marcado. Y aquí está lo que más sorprende: una casilla **desmarcada no envía nada**, ni `off` ni `false`; simplemente su clave no aparece. Una marcada sin `value` envía `on`.

[[exercise:05-checkbox-y-radio.md-]]

```text
size = m
extras = oat-milk
extras = cinnamon
takeaway = on
getAll("extras") → (2) ['oat-milk', 'cinnamon']
Form submitted (navigation blocked in preview): POST https://cafeteria.example/pedido (application/x-www-form-urlencoded) {size: 'm', extras: Array(2), takeaway: 'on'}
```

Al desmarcar «Para llevar» y volver a enviar, la línea `takeaway = on` desaparece. Con el teclado, Tab entra en un grupo de radio una sola vez (en el marcado) y las flechas cambian la elección; en una casilla, Espacio la marca o la desmarca.

El CSS del ejemplo pone en negrita las opciones marcadas con `:checked`: el formulario **expone su estado** al CSS, que puede leerlo sin una línea de JavaScript. Verás muchas más pseudoclases de este tipo en la lección de validación.

> **Desde Python:** en Flask, `request.form.get('takeaway')` devuelve `None` si la casilla no estaba marcada, y `request.form.getlist('extras')` devuelve `['oat-milk', 'cinnamon']`. Comprueba la **presencia** de la clave, no su valor.

## Listas: `select`, `optgroup` y `datalist`

`<select>` ofrece una lista **cerrada** de `<option>`. Se envía el `value` de la opción elegida o, si no lo tiene, su texto. `<optgroup label="…">` agrupa opciones bajo un título que no se puede elegir, y `multiple` permite varias elecciones (cada una, un par con el mismo `name`). Sin `selected`, empieza elegida la primera opción.

`<datalist>`, en cambio, solo **sugiere**: se conecta a un campo de texto con `list="id"` y el usuario puede escribir cualquier otra cosa.

[[exercise:06-select-optgroup-y-datalist.md-]]

```text
course = pruning
days = tue
days = thu
district = Delicias
Form submitted (navigation blocked in preview): POST https://huerta.example/cursos/inscripcion (application/x-www-form-urlencoded) {course: 'pruning', days: Array(2), district: 'Delicias'}
```

¿Radio o `select`? Si hay pocas opciones (hasta cinco o seis), los botones de opción las muestran todas sin tener que abrir nada. Si hay muchas, un `select`. Si la lista es larga pero abierta (un barrio, una marca), un campo de texto con `datalist`.

## Agrupar: `fieldset` y `legend`

`<fieldset>` agrupa controles relacionados y `<legend>`, su primer hijo, le da nombre al grupo. No es decoración: un lector de pantalla anuncia la leyenda al entrar en el grupo («Dirección de envío, grupo»), así que dos campos llamados «Localidad» se distinguen por su grupo. Un grupo de radio **necesita** un `fieldset`: sin leyenda, «Pequeño, Mediano, Grande» no dice de qué.

Un `fieldset` con `disabled` desactiva todos los controles de dentro, que dejan de recibir el foco y de enviarse. La pseudoclase `:disabled` permite al CSS reflejarlo.

[[exercise:07-fieldset-y-legend.md]]

Si envías el formulario con la casilla marcada, solo viajan la dirección de envío y `same_address=on`: los campos de facturación están desactivados.

## Resultados: `output`

`<output>` muestra un **resultado** calculado a partir de otros campos: un total, una conversión, el valor de un deslizador. Su atributo `for` lista los `id` de los campos de los que depende, y su rol implícito es `status`, el de una región viva: un lector de pantalla anuncia el nuevo valor cuando cambia. Tiene `name`, pero **no se envía**: el servidor nunca debe fiarse de un total que calculó el navegador.

[[exercise:08-output.md]]

## Archivos

`<input type="file">` abre el selector de archivos del sistema. `accept` filtra por tipo (`image/*`, `image/png`) o por extensión (`.pdf`), `multiple` permite elegir varios y, en el móvil, `capture="environment"` propone usar la cámara. Recuerda la lección anterior: para enviar el contenido hacen falta `method="post"` y `enctype="multipart/form-data"`.

[[exercise:09-archivos.md-]]

```text
value → C:\fakepath\tomates.jpg
tomates.jpg · image/jpeg · 248113 bytes
calabacines.webp · image/webp · 96420 bytes
```

Los nombres y los tamaños serán los de tus archivos. Si eliges una sola foto y envías, la línea de la vista previa la describe como `photos: 'File "tomates.jpg" (242 KB, image/jpeg)'`; con varias, `photos` es una lista con una entrada por archivo. Lo que siempre verás es `C:\fakepath\`: por privacidad, una página nunca conoce la ruta real de un archivo en tu disco, ni siquiera en macOS. Y `accept` es una ayuda, no una garantía: el servidor tiene que comprobar qué ha recibido.

## Campos ocultos

`<input type="hidden" name="order" value="A-1042">` no se ve ni se edita, pero se envía como cualquier otro campo. Sirve para datos que el formulario necesita y el usuario no tiene que tocar: el identificador de lo que se edita, un parámetro fijo (lo viste con la query del `action`) o un token de seguridad. No es secreto: está en el HTML y se puede cambiar con DevTools.

## Botones

`<button>` tiene tres tipos:

| `type` | Qué hace |
|---|---|
| `submit` | envía su formulario. **Es el valor por defecto** |
| `reset` | devuelve todos los campos a sus valores iniciales del HTML (rara vez es buena idea: se pulsa sin querer) |
| `button` | nada por sí mismo: para acciones de JavaScript |

Que `submit` sea el valor por defecto provoca uno de los errores más comunes de la web. Un botón para sumar uno, mostrar la contraseña o añadir otra fila, escrito sin `type` dentro de un formulario, **envía el formulario** además de hacer su trabajo. Y como pulsar Enter en un campo de texto «pulsa» el **primer** botón de envío, ese botón de «−» se activa cada vez que alguien pulsa Enter en otro campo.

[[exercise:10-button-es-submit-por-defecto.md-]]

```text
Añadir uno → cantidad: 2
Form submitted (navigation blocked in preview): POST https://huerta.example/carrito (application/x-www-form-urlencoded) {product: 'Semillas de tomate cherry', quantity: '2'}
Quitar uno → cantidad: 1
Form submitted (navigation blocked in preview): POST https://huerta.example/carrito (application/x-www-form-urlencoded) {product: 'Semillas de tomate cherry', quantity: '1'}
Añadir uno → cantidad: 2
Form submitted (navigation blocked in preview): POST https://huerta.example/carrito (application/x-www-form-urlencoded) {product: 'Semillas de tomate cherry', quantity: '2'}
```

Las cuatro primeras líneas son del formulario ❌ (pulsar + y luego Enter en «Producto»); las dos últimas, del ✅: el + solo suma, y Enter envía con el botón «Añadir al carrito». La regla: **escribe siempre el `type` de un `<button>`**.

Verás también `<input type="submit" value="Enviar">`, la forma antigua de hacer un botón de envío. Funciona igual, pero `<button>` admite contenido HTML (un icono y un texto, por ejemplo) y es más fácil de leer.

Los controles nativos se dibujan con el estilo del sistema operativo y cambian de un navegador a otro. En el capítulo de CSS verás cómo adaptarlos a tu diseño (`accent-color`, `appearance`) sin perder lo que traen de serie.

## Bestiario

- **Un botón envía el formulario sin querer.** Síntoma: pulsar «+», «Mostrar contraseña» o «Añadir fila» recarga la página o envía los datos; pulsar Enter en un campo activa un botón que no es el de enviar. Causa: un `<button>` sin `type` dentro de un formulario es `type="submit"`, y Enter pulsa el primero. Solución: `type="button"` en todo botón que no envía, y `type="submit"` explícito en el que sí. → [ver ejemplo](10-button-es-submit-por-defecto.md)
- **Pulsar la etiqueta no hace nada.** Síntoma: el clic en el texto no enfoca el campo y el lector de pantalla lo anuncia sin nombre. Causa: `for` apunta al `name` (o a un `id` que no existe). Solución: `for` igual al `id` del campo, o el campo dentro del `<label>`. → [ver ejemplo](01-label-implicito-y-explicito.md)

## Resumen

- Cada campo necesita un `<label>`, asociado con `for="id"` o envolviendo el campo: es su nombre accesible y amplía la zona que se puede pulsar.
- El `type` de un `<input>` cambia el teclado del móvil, la validación y el aspecto, pero el valor siempre viaja como texto.
- Fechas, horas y colores se muestran según el idioma del navegador y se envían en un formato fijo (`2026-10-24`, `17:30`, `#15803d`).
- Las casillas desmarcadas no envían nada; las marcadas sin `value` envían `on`. Los radio con el mismo `name` forman un grupo.
- `select` es una lista cerrada, `datalist` solo sugiere; `fieldset` + `legend` agrupan y nombran; `output` muestra un resultado que no se envía.
- Un `<button>` es `submit` por defecto: escribe siempre su `type`.

## Para profundizar

- [MDN: Los tipos de `<input>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/input#tipos_de_input)
- [MDN: Controles de formulario nativos](https://developer.mozilla.org/es/docs/Learn/Forms/Basic_native_form_controls)
- [web.dev: Learn Forms (controles)](https://web.dev/learn/forms/form-fields)
- [W3C WAI: Grouping Controls](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [HTML Living Standard: the input element](https://html.spec.whatwg.org/multipage/input.html)
