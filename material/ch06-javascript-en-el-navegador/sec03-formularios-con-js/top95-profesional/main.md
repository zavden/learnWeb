# Ejemplos profesionales

## Por qué importa

Los formularios son la parte de una web donde más se nota la calidad: el alta que no acepta tu nombre con tilde, el pago que borra el número de tarjeta al pegarlo, el pedido que falla sin decir qué campo está mal, la reserva que cuenta una noche de menos. Las librerías de formularios (React Hook Form, Formik, Felte…) y los sistemas de diseño de los servicios públicos resuelven exactamente lo que verás aquí, y lo hacen con las mismas piezas del módulo: `FormData`, la Constraint Validation API, los eventos `input`, `change`, `beforeinput` y `formdata`, y expresiones regulares bien escritas.

Esta página reúne doce formularios completos, escritos con todo lo que has visto hasta ahora en el curso: HTML (incluidos sus formularios y su validación nativa), CSS, el lenguaje JavaScript, el DOM, los eventos y este módulo. Algunos envían los datos al servidor de pruebas de LearnWeb con `fetch`, como adelanto del módulo siguiente. Úsalos en la tarjeta para ver la interfaz, pero ábrelos con **«▶ Run»** (o en el editor) para enviarlos y ver la consola: en las tarjetas, un iframe aislado, los formularios no se envían, y la propia página lo avisa. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **La validación nativa, completada.** Las restricciones están en el HTML (`required`, `type`, `pattern`, `min`, `step`) y el script añade lo que HTML no sabe expresar con `setCustomValidity`, siempre limpiándolo con `''`.
- **Mensajes en tu idioma y en su sitio.** Con `novalidate`, cada error se escribe junto a su campo (`aria-describedby`), el campo se marca con `aria-invalid` y el foco va al primer error; los avisos se dan al salir del campo o al enviar y se quitan en cuanto el valor es correcto.
- **Cada valor con su tipo.** `valueAsNumber` para los números, el string `AAAA-MM-DD` (o UTC) para las fechas, `getAll` para las listas, centavos para el dinero; los JSON que salen de los formularios llevan números, arrays y booleanos de verdad.
- **Regex para personas reales.** `\p{L}` con el flag `v` para los nombres, una regla por regex para poder decir qué falta, `RegExp.escape` para todo texto que venga de fuera y patrones comprobados antes de asignarlos.
- **Nada se pierde.** Ni el cursor al formatear, ni lo escrito al añadir una pregunta, ni el foco al quitar una fila, ni el botón que envió (`new FormData(form, submitter)`).
- **Una autocomprobación.** Al cargar, cada ejemplo prueba su propio formulario con valores y envíos simulados (un `SubmitEvent` sin burbuja, para que la vista previa no lo intercepte), sin red ni foco, y lo deja como estaba. Las líneas `✓` de la consola son esa prueba.

## Alta con medidor de contraseña

**Objetivo:** un alta de cuenta que exige una contraseña segura y ayuda a conseguirla. **Técnicas:** una regex por regla (`\d`, `\p{Lu}`, `[^\p{L}\d]`, longitud) para la lista de requisitos y el `<meter>` de fuerza; la misma política en un `pattern` con *lookaheads* que el navegador compila con el flag `v`; un botón conmutador «Mostrar contraseña» con `aria-pressed`; la confirmación como `customError`; validación en vivo que castiga tarde y premia pronto. **Fíjate en** que la lista y el medidor están en `aria-describedby` en lugar de en una región viva (no se anuncia cada tecla), en que la autocomprobación verifica que el `pattern` y las cuatro reglas dicen lo mismo, y en que la contraseña nunca se imprime: solo su longitud.

[[exercise:01-alta-con-medidor-de-contrasena.md]]

```text
Autocomprobación (simulada):
  ✓ «tomates-en-octubre» cumple 2 de 4 reglas (regular)
  ✓ «Tomates-en-octubre1» cumple las 4 (fuerte)
  ✓ el pattern con lookaheads coincide con las 4 reglas en 6 ejemplos
  ✓ la confirmación distinta es un customError y deja de serlo al coincidir
  ✓ «Mostrar contraseña» alterna el tipo y aria-pressed
  ✓ enviar vacío marca 4 campos
Listo: escribe tu nombre y correo; teclea una contraseña y mira la lista y el medidor; repítela y pulsa «Crear cuenta»
// Tras Lucía Méndez, lucia@ejemplo.mx y Tomates-en-octubre1 (la lista se completa, el medidor dice «fuerte»),
// escribir «Tomates» en la confirmación y salir del campo:
❌ password_confirm · al salir → «Las dos contraseñas no coinciden.»
// Tras completar la confirmación y pulsar «Crear cuenta»:
✅ password_confirm · en vivo → corregido
📨 cuenta para lucia@ejemplo.mx · contraseña de 19 caracteres (no se imprime)
```

## Dirección según el país

**Objetivo:** una dirección de envío internacional que no rechaza códigos postales válidos de otros países. **Técnicas:** las reglas de cada país como datos (`pattern`, ejemplo, formato, nombre de la región, `inputmode`); el `pattern` se compila con `new RegExp('^(?:…)$', 'v')` antes de asignarlo; normalización en `input` (sin espacios; mayúsculas en Argentina); revalidación inmediata al cambiar de país si el campo ya tenía valor. **Fíjate en** que la pista visible cambia con el país y da un ejemplo, y en que el mensaje de error dice el formato esperado en lugar de un «inválido» sin más; la etiqueta de la región («Estado», «Provincia», «Departamento») también cambia.

[[exercise:02-direccion-segun-el-pais.md]]

```text
Autocomprobación (simulada):
  ✓ los 5 patrones compilan con el flag v
  ✓ México: 06700 sí, 6700 no
  ✓ España: 28013 sí, 53001 no
  ✓ Argentina: «c1043 aaz» se normaliza a C1043AAZ y vale
  ✓ Estados Unidos: 94103-1234 sí; Colombia: 06700 no
  ✓ Colombia cambia la región a «Departamento»
Listo: escribe 6700 en el código postal y sal del campo; cambia el país a Argentina y escribe c1043aaz
// Tras escribir 6700 y salir del campo:
❌ postal_code · al salir → «Revisa el formato: 5 cifras (por ejemplo, 06700).»
// Tras elegir Argentina:
🌎 Argentina: Código postal (CPA) → una letra, 4 cifras y 3 letras
❌ postal_code · al cambiar de país → «Revisa el formato: una letra, 4 cifras y 3 letras (por ejemplo, C1043AAZ).»
// Tras sustituir 6700 por c1043aaz (aparece en mayúsculas):
✅ postal_code · en vivo → corregido
```

## Pago con tarjeta formateada

**Objetivo:** un campo de tarjeta que se agrupa solo sin estorbar al escribir, al pegar ni al borrar. **Técnicas:** el formato se calcula sobre las cifras (todo lo demás fuera con `\D`) y el cursor se recoloca contando cifras; con un IME (`isComposing`) se espera a `compositionend`; `beforeinput` cancela el Retroceso que solo borraría un espacio y borra la cifra anterior; la marca sale de una regex sobre los primeros dígitos (y cambia la agrupación y el `pattern` del código de seguridad); el dígito de control (Luhn) es un `customError`; la caducidad `MM/AA` se escribe sola. **Fíjate en** el cálculo del cursor (`caretAfterDigits`) y en que los datos de la tarjeta nunca se imprimen enteros: solo los cuatro últimos dígitos.

[[exercise:03-pago-con-tarjeta-formateada.md]]

```text
Autocomprobación (simulada):
  ✓ Visa en grupos de 4: 4242 4242 4242 4242
  ✓ American Express en 4-6-5: 3782 822463 10005
  ✓ el cursor tras la 5.ª cifra va en la posición 6
  ✓ Luhn: 4242 4242 4242 4242 sí, …4241 no
  ✓ lo pegado con guiones se reformatea y es válido
  ✓ Retroceso tras un espacio borra la cifra anterior: «4244»
  ✓ caducidad: 09/26 caducada y 10/26 vigente (en octubre de 2026)
Listo: escribe 4242424242424242 (mira el cursor), borra con Retroceso tras un espacio; pega 3782-822463-10005; caducidad 1228
// Tras completar el titular, 4242 4242 4242 4242, 12/28 y 123, y pulsar «Pagar $565.00»:
💳 Visa •••• 4242 · caduca 12/28 · pago enviado
```

## Constructor de encuestas

**Objetivo:** crear una encuesta y recoger sus respuestas como JSON. **Técnicas:** un formulario constructor cuyas opciones se trocean con `split(/\s*[\n,]\s*/)` y se validan con `setCustomValidity` («al menos 2 distintas»); un `<fieldset disabled>` apaga las opciones cuando el tipo no las usa (ni se validan ni se envían); la encuesta se genera con el DOM (`textContent` para todo lo que escribe quien la crea); las respuestas se serializan con su tipo: `getAll` para las múltiples, `valueAsNumber` para la escala, `null` para lo vacío. **Fíjate en** que cada pregunta nueva se inserta antes del botón de envío, sin volver a pintar la encuesta: las respuestas ya dadas no se pierden.

[[exercise:04-constructor-de-encuestas.md]]

```text
Autocomprobación (simulada):
  ✓ 4 preguntas generadas, cada una en su fieldset
  ✓ «Sí, No» y «Tal vez» en otra línea dan 3 opciones
  ✓ una sola opción es un error propio
  ✓ con «Escala», las opciones no se validan ni se envían (fieldset disabled)
  ✓ respuestas con su tipo: string, array, número y null
Listo: responde la encuesta y pulsa «Enviar respuestas»; abre «Añadir una pregunta», crea una de varias opciones y vuelve a enviar
// Tras marcar «Redes sociales» y «Textiles», poner la escala en 5 y pulsar «Enviar respuestas»:
📨 4 respuestas → ["Redes sociales",["Textiles"],5,null]
// Tras crear «¿Qué día prefieres?» de varias opciones (Sábado, Domingo):
➕ pregunta 5: «¿Qué día prefieres?» (Varias opciones)
// Tras marcar «Sábado» y volver a enviar:
📨 5 respuestas → ["Redes sociales",["Textiles"],5,null,["Sábado"]]
```

## Pedido con errores del servidor

**Objetivo:** un pedido que se envía sin recargar y entiende los errores que solo conoce el servidor. **Técnicas:** validación propia antes de enviar; estado pendiente con `<fieldset disabled>`, `aria-busy` y `role="status"`; `fetch` con `FormData` al servidor de pruebas (adelanto); una respuesta 422 con un error por campo que se convierte en `setCustomValidity`, mensaje junto al campo y `aria-invalid`, con el foco en el primero; cada error del servidor caduca en cuanto se edita su campo. **Fíjate en** que el servidor de pruebas solo devuelve lo que recibe: las reglas «del servidor» (existencias y zona de reparto) están simuladas en `serverRules`, y el comentario lo dice. La forma de la respuesta, un objeto con un mensaje por nombre de campo, es la habitual en las APIs reales.

[[exercise:05-pedido-con-errores-del-servidor.md]]

```text
Autocomprobación (simulada):
  ✓ 5 cafés y el CP 97000: el «servidor» rechaza la cantidad y el código postal
  ✓ cada error del servidor queda en su campo (customError, aria-invalid, mensaje)
  ✓ al editar el campo, su error del servidor desaparece
  ✓ mientras se envía: fieldset desactivado y aria-busy
  ✓ un correo vacío se detiene antes de enviar
Listo: pulsa «Hacer pedido» (5 cafés al CP 97000); corrige la cantidad (3) y el código postal (06700) y vuelve a pulsar
// Tras pulsar «Hacer pedido» (el formulario queda desactivado unos 0,7 s):
📤 enviando… (formulario desactivado)
📥 422 → 2 error(es) del servidor
❌ quantity · servidor → «Solo quedan 3 unidades de ese producto.»
❌ postal_code · servidor → «Por ahora solo repartimos en la Ciudad de México (01000 a 16999).»
🎯 foco en quantity
// Tras cambiar la cantidad a 3 y el código postal a 06700:
✅ quantity · en vivo → corregido
✅ postal_code · en vivo → corregido
// Tras pulsar «Hacer pedido»:
📤 enviando… (formulario desactivado)
📥 200 → ✅ pedido recibido: 3 × CAF-500 para 06700
```

## Inventario editable

**Objetivo:** editar y guardar las filas de una tabla de una en una. **Técnicas:** un `<form>` por fila, vacío y fuera de la tabla, al que cada control se asocia con el atributo `form` (un `<form>` no puede ir dentro de un `<tr>`); `FormData`, la validación y el botón de envío respetan esa asociación; validación por fila con el estado en una celda y el foco en el primer error; «SKU único» como regla entre filas con `setCustomValidity`; «cambios sin guardar» comparando `value` con `defaultValue`, y guardar copia los valores en `defaultValue`; filas nuevas desde un `<template>`. **Fíjate en** que los nombres accesibles de los campos incluyen el número de fila, y en que un único `role="status"` anuncia los guardados.

[[exercise:06-inventario-editable.md]]

```text
Autocomprobación (simulada):
  ✓ 3 filas; cada control pertenece al formulario de su fila
  ✓ FormData de la fila 1 tiene sus 4 datos
  ✓ un SKU repetido marca las dos filas
  ✓ precio 0: la fila no se guarda y su estado lo dice
  ✓ al guardar, value pasa a defaultValue (sin cambios pendientes)
Listo: cambia el precio de la olla a 0 y pulsa su «Guardar»; luego pon 520 y guarda; escribe ALE-204 como SKU del rebozo
// Tras poner 0 en el precio de la olla y pulsar su «Guardar»:
❌ row-1 → ⚠ Precio: mayor que 0.
// Tras cambiarlo a 520 y pulsar su «Guardar»:
💾 row-1 → {"name":"Olla de barro negro","sku":"BAR-101","price":"520","stock":"6"}
// Tras escribir ALE-204 como SKU del rebozo y pulsar su «Guardar»:
❌ row-3 → ⚠ SKU: ya existe en otra fila.
```

## Buscador con filtros en la URL

**Objetivo:** un catálogo filtrable cuya búsqueda se puede compartir como enlace. **Técnicas:** un formulario GET de verdad (funcionaría sin JavaScript) cuyo `submit` se cancela; `new URLSearchParams` a partir del `FormData`, sin los campos vacíos ni los valores por defecto; el camino inverso, de una *query* al formulario, con `get` y `getAll`; filtros inmediatos en `change` y texto con *debounce* en `input`; búsqueda sin tildes ni mayúsculas (`normalize('NFD')` y `\p{M}`) con lo escrito escapado por `RegExp.escape`. **Fíjate en** que `URLSearchParams` y cambiar la URL de la página (`history.pushState`) son del módulo «Red y almacenamiento»: aquí la URL compartible se muestra, porque la de la vista previa no es tuya. El buscador funciona también en la tarjeta: no necesita enviar el formulario.

[[exercise:07-buscador-con-filtros-en-la-url.md]]

```text
Autocomprobación (simulada):
  ✓ sin filtros, la query está vacía (los campos vacíos no viajan)
  ✓ una query compartida marca las dos casillas y el precio
  ✓ …y vuelve a dar la misma query
  ✓ textil y madera hasta $1000: 3 productos
  ✓ «CANTARO» encuentra «Cántaro de barro negro» (sin tildes ni mayúsculas)
  ✓ lo escrito se escapa: «(2.ª» no rompe la búsqueda
🔎 al cargar → /catalogo · 8 producto(s)
Listo: marca «Barro» y ordena de menor a mayor; escribe «negro»; luego pulsa el enlace «Textil y madera hasta $1000»
// Tras marcar «Barro» y elegir «Precio: de menor a mayor»:
🔎 al cambiar un filtro → /catalogo?cat=barro · 3 producto(s)
🔎 al cambiar un filtro → /catalogo?cat=barro&sort=price-asc · 3 producto(s)
// Tras escribir «negro» (una línea, 300 ms después de la última tecla):
🔎 al escribir → /catalogo?q=negro&cat=barro&sort=price-asc · 2 producto(s)
// Tras pulsar «Textil y madera hasta $1000»:
🔎 enlace «Textil y madera hasta $1000» → /catalogo?cat=textil&cat=madera&max=1000 · 3 producto(s)
```

## Contacto con resumen de errores

**Objetivo:** que nadie se quede sin saber por qué no se envió su mensaje. **Técnicas:** el patrón de resumen de errores de los servicios públicos (como GOV.UK): al enviar con errores aparece arriba una lista de enlaces, uno por error, que recibe el foco (`tabindex="-1"`), y el título de la pestaña empieza por «Error:»; cada enlace pone el foco en su campo (un enlace a un `#id` solo desplazaría), el del grupo de radios en el primero; los mensajes se repiten entre la etiqueta y el control; el resumen se actualiza al corregir. **Fíjate en** el grupo de radios: un solo «campo» para el resumen, con `role="radiogroup"` para que su `aria-invalid` tenga sentido, y en la longitud mínima del mensaje como regla propia (con `minlength`, el navegador solo protesta si el usuario ha editado el campo).

[[exercise:08-contacto-con-resumen-de-errores.md]]

```text
Autocomprobación (simulada):
  ✓ enviar vacío muestra el resumen con 5 enlaces
  ✓ cada enlace apunta a un control que existe (el tema, al primer radio)
  ✓ el título de la pestaña empieza por «Error:»
  ✓ un mensaje de 4 caracteres pide al menos 20
  ✓ todo correcto: sin resumen y con el título original
Listo: pulsa «Enviar mensaje» con todo vacío; usa el enlace «Elige un tema.»; completa (Ana López, ana@ejemplo.mx, un mensaje de 20 o más caracteres, la casilla) y vuelve a enviar
// Tras pulsar «Enviar mensaje» con todo vacío (el foco va al resumen):
📨 submit → resumen con 5 error(es): visitor, email, topic, message, consent
// Tras pulsar el enlace «Elige un tema.» y elegir «Visitas guiadas»:
🔗 del resumen al campo topic
✅ corregido: quedan 4 error(es)
// Tras completar el resto (una línea «✅ corregido» por campo), con el mensaje «Quisiera visitar el museo con mi familia.», y enviar:
📨 enviado → {"visitor":"Ana López","email":"ana@ejemplo.mx","topic":"visit","message":"Quisiera visitar el museo con mi familia.","consent":"on"}
```

## Reserva de noches en UTC

**Objetivo:** una reserva de hotel que nunca cuenta una noche de más ni de menos. **Técnicas:** dos `type="date"` tratados en UTC de principio a fin: las noches salen de restar `valueAsNumber` (medianoches UTC, sin cambios de hora de por medio), el día de la semana de cada noche con `getUTCDay` y las fechas se muestran con `Intl` y `timeZone: 'UTC'`; la salida se mueve sola si queda antes de la llegada (y se anuncia), y más de 14 noches es un `customError`. **Fíjate en** que se envían los strings `AAAA-MM-DD` de `value`, y en la autocomprobación que comprueba que la llegada se muestra como «viernes 20» y no como el «jueves 19» que daría una conversión a hora de México.

[[exercise:09-reserva-de-noches-en-utc.md]]

```text
Autocomprobación (simulada):
  ✓ del 20 al 23 de noviembre: 3 noches
  ✓ viernes y sábado son fin de semana: $5,600.00 en doble
  ✓ la llegada se muestra con Intl en UTC: viernes 20, no jueves 19
  ✓ una llegada posterior mueve la salida a la noche siguiente
  ✓ 19 noches: error propio (customError)
Listo: elige la habitación sencilla; cambia la llegada al 25 de noviembre (con el calendario); luego pulsa «Reservar»
// Tras elegir «Sencilla»:
🛏️ cambio en room → 2026-11-20 a 2026-11-23: 3 noche(s), $4,200.00
// Tras elegir el 25 de noviembre como llegada:
↪️ salida ajustada a 2026-11-26
🛏️ cambio en check_in → 2026-11-25 a 2026-11-26: 1 noche(s), $1,200.00
// Tras pulsar «Reservar»:
📨 reserva → {"check_in":"2026-11-25","check_out":"2026-11-26","room":"single"} · 1 noche(s) · $1,200.00
```

## Borrador automático con el evento `formdata`

**Objetivo:** que una reseña larga no se pierda nunca y que publicarla siga validando. **Técnicas:** «Guardar borrador» es un botón de envío con `formnovalidate`, y el autoguardado (con *debounce*, 1,5 s después de la última tecla y solo si hubo cambios) llama a `requestSubmit` con ese botón, así que pasa por el mismo `submit`; el evento `formdata` añade a cualquier envío el número de palabras (contadas con `[\p{L}\p{N}]+`) y la versión del borrador; los envíos van al servidor de pruebas con `fetch`. **Fíjate en** que el envío usa `new FormData(form, event.submitter)`, que dispara `formdata` y lleva `intent=draft` o `intent=publish`, y en que la autocomprobación sustituye la función de envío para probarlo todo sin red.

[[exercise:10-borrador-con-el-evento-formdata.md]]

```text
Autocomprobación (simulada):
  ✓ cualquier FormData lleva word_count (10 palabras) y draft_version
  ✓ «Guardar borrador» no valida (formnovalidate), y con el titular vacío el formulario no es válido
  ✓ un borrador envía intent=draft y la versión 1
  ✓ «Ñandú, café y té» son 4 palabras (la ñ y las tildes cuentan)
Listo: escribe un titular y espera 1,5 s (autoguardado); escribe más y pulsa «Publicar»
// Tras escribir «Hilos que cuentan historias» en el titular y esperar 1,5 s:
⏱️ 1,5 s sin escribir: autoguardado
💾 draft → el servidor recibió versión 1, 10 palabras
// Tras añadir « Me encantó.» al final de la reseña y pulsar «Publicar» enseguida:
📣 publish → el servidor recibió versión 1, 12 palabras
```

## Factura con conceptos

**Objetivo:** una factura con tantos conceptos como haga falta y unos totales que siempre cuadran. **Técnicas:** filas desde un `<template>` con los **mismos nombres** (`item_desc`, `item_qty`, `item_price`), que `FormData` devuelve en orden con `getAll` y se juntan en objetos con números; totales en centavos (enteros) con `valueAsNumber` e IVA del 16 %; un total «—» cuando falta una cantidad, en lugar de un cero inventado; el RFC normalizado en `input` y validado con su `pattern`. **Fíjate en** el foco al quitar una fila: pasa al botón «Quitar» de la fila vecina, o a «Añadir concepto» si no queda ninguna, en lugar de perderse en el `<body>`.

[[exercise:11-factura-con-conceptos.md]]

```text
Autocomprobación (simulada):
  ✓ 3500 + 500 × 4.20: subtotal 5600, IVA 896, total 6496
  ✓ getAll junta las filas en objetos con números
  ✓ «mea 190312 ab3» se normaliza a MEA190312AB3 y cumple el pattern
  ✓ «MEA-190312» no es un RFC
  ✓ una cantidad vacía deja el total en «—»
Listo: cambia la cantidad de etiquetas a 1000; añade un concepto «Envío» de $150; quita el diseño y pulsa «Emitir factura»
// Tras cambiar 500 por 1000, añadir «Envío» (1 × 150) y quitar el diseño:
➕ concepto 3
➖ concepto quitado; quedan 2
// Tras pulsar «Emitir factura»:
📨 factura → {"client":"Mezcalería El Agave","rfc":"MEA190312AB3","items":[{"desc":"Impresión de etiquetas","qty":1000,"price":4.2},{"desc":"Envío","qty":1,"price":150}],"subtotal":4350,"tax":696,"total":5046}
```

## Soporte con archivos adjuntos

**Objetivo:** una solicitud de soporte que acepta fotos y documentos sin sorpresas. **Técnicas:** `input.files` se valida en `change` (como mucho 3, 2 MB cada uno, solo PNG, JPG o PDF) y el resultado es un `customError`, porque `accept` solo filtra el diálogo de archivos; la lista muestra nombre y tamaño (con `Intl` y la unidad `kilobyte`); un número de pedido opcional con `pattern`; envío *multipart* con `FormData` al servidor de pruebas, que devuelve el nombre, el tamaño y el tipo de cada archivo. **Fíjate en** la autocomprobación: crea archivos en memoria (`new File`) y los mete en el campo con un `DataTransfer`, la única forma de rellenar `input.files` desde JavaScript; leer el contenido de un archivo es la File API del módulo «APIs modernas del navegador».

[[exercise:12-soporte-con-adjuntos.md]]

```text
Autocomprobación (simulada):
  ✓ una foto y un PDF pequeños son válidos
  ✓ la lista muestra nombre y tamaño: «molino.jpg · 1.5 kB»
  ✓ un vídeo de 3 MB: tipo y tamaño, dos problemas y customError
  ✓ 4 archivos son demasiados
  ✓ FormData lleva el archivo con su nombre
  ✓ «PED-12345» no cumple el pattern del pedido
Listo: adjunta una o dos fotos y pulsa «Enviar solicitud»; prueba también con un vídeo o con 4 archivos
// Tras adjuntar una foto JPG:
📎 1 archivo(s) · correctos
// Tras pulsar «Enviar solicitud» (el tamaño depende de tu archivo):
📨 200 · multipart/form-data · adjuntos → {"name":"foto.jpg","size":183406,"type":"image/jpeg"}
// Tras elegir un vídeo (uno o dos problemas, según su tamaño):
📎 1 archivo(s) · ⚠ 2 problema(s)
```

## Resumen

- Las restricciones viven en el HTML; JavaScript añade las que faltan con `setCustomValidity` y las limpia siempre.
- Los mensajes, en tu idioma y junto al campo: `aria-describedby`, `aria-invalid`, foco al primer error, un resumen cuando hay varios y avisos que no persiguen al usuario mientras escribe.
- Cada valor con su tipo: números con `valueAsNumber`, fechas de calendario en UTC o como strings, listas con `getAll`, dinero en centavos.
- `FormData` lo recoge todo, también lo que se asocia con el atributo `form`, los nombres repetidos, los archivos y lo que añade el evento `formdata`; `new FormData(form, submitter)` incluye el botón.
- Las regex de un formulario: `\p{L}` con `v`, una regla por regex, `RegExp.escape` para el texto ajeno y patrones probados antes de asignarlos.
- Enviar sin recargar: `preventDefault()` antes del primer `await`, estado pendiente accesible y los errores del servidor devueltos a sus campos.

## Para profundizar

- [GOV.UK Design System: resumen de errores (en inglés)](https://design-system.service.gov.uk/components/error-summary/)
- [web.dev: Sign-up form best practices (en inglés)](https://web.dev/articles/sign-up-form-best-practices)
- [web.dev: Payment and address form best practices (en inglés)](https://web.dev/articles/payment-and-address-form-best-practices)
- [MDN: Uso de FormData](https://developer.mozilla.org/es/docs/Web/API/FormData/Using_FormData_Objects)
- [W3C WAI: Form instructions y validación (en inglés)](https://www.w3.org/WAI/tutorials/forms/)
