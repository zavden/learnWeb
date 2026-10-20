# FormData y envío

## Por qué importa

En la lección anterior leíste los controles de uno en uno. Para enviar un formulario entero eso no escala: tendrías que recorrer cada campo, saltarte los desactivados, saber qué casillas cuentan y repetir las reglas que el navegador ya aplica al enviar. **`FormData`** hace ese trabajo: construye exactamente la lista de pares nombre/valor que enviaría el formulario. Con ella, el evento `submit` y `preventDefault()` (que viste en la lección «Acciones por defecto»), puedes enviar los datos como quieras sin recargar la página.

Esta lección cumple las promesas del módulo de eventos (`FormData` y `requestSubmit()`) y enseña las trampas del camino: lo que `FormData` deja fuera, los valores que se pierden al convertirla en objeto, el botón que envía sin querer y el método `submit()`, que se salta la validación y tu propio listener.

Casi todos los ejemplos envían el formulario, así que ábrelos con **«▶ Run»** o en el editor. Las tarjetas de la galería son copias aisladas de la página (un iframe con `sandbox` sin `allow-forms`, como viste en la lección «Iframes y contenido embebido»), y en ellas el navegador no envía formularios: el botón no hace nada. Cuando un ejemplo no cancela el envío, la vista previa de LearnWeb bloquea la navegación y escribe en la consola la línea `Form submitted (navigation blocked in preview): …` con lo que se habría enviado; te servirá para ver la petición real.

## `FormData`: lo que enviaría el formulario

`new FormData(form)` recorre el formulario como lo haría el navegador al enviarlo y guarda cada par nombre/valor, en el orden del documento. Se puede construir en cualquier momento, no solo al enviar:

| Método | Qué hace |
|--------|----------|
| `get(nombre)` | el **primer** valor con ese nombre, o `null` |
| `getAll(nombre)` | todos los valores con ese nombre, en un array (vacío si no hay) |
| `has(nombre)` | si hay alguno |
| `set(nombre, valor)` | sustituye todos los valores de ese nombre por uno |
| `append(nombre, valor)` | añade un par más (los nombres pueden repetirse) |
| `delete(nombre)` | quita todos los pares con ese nombre |
| `for (const [nombre, valor] of formData)` | recorre los pares en orden (también `entries()`, `keys()`, `values()`) |

[[exercise:01-formdata-lee-el-formulario.md-(script.js)]]

```text
get('customer') → Lucía Méndez
get('quantity') → '2' (un string, como value)
get('extras') → cinnamon · getAll('extras') → ["cinnamon","piloncillo"]
has('gift') → false · get('gift') → null
  customer = Lucía Méndez
  quantity = 2
  extras = cinnamon
  extras = piloncillo
  notes = Entregar por la tarde
como query → customer=Luc%C3%ADa+M%C3%A9ndez&quantity=2&extras=cinnamon&extras=piloncillo&notes=Entregar+por+la+tarde
Listo: cambia algún campo (marca «Clavo», desmarca la canela…) y pulsa «Hacer el pedido»
// Tras desmarcar «Canela» y pulsar «Hacer el pedido»:
📨 submit cancelado; esto es lo que se habría enviado:
get('customer') → Lucía Méndez
get('quantity') → '2' (un string, como value)
get('extras') → piloncillo · getAll('extras') → ["piloncillo"]
has('gift') → false · get('gift') → null
  customer = Lucía Méndez
  quantity = 2
  extras = piloncillo
  notes = Entregar por la tarde
como query → customer=Luc%C3%ADa+M%C3%A9ndez&quantity=2&extras=piloncillo&notes=Entregar+por+la+tarde
```

Todos los valores son strings (o archivos, en un `type="file"`): `FormData` no sabe que `quantity` es un número. La última línea usa `URLSearchParams`, que verás en el módulo «Red y almacenamiento»: convierte los pares en la *query* que llevaría la URL de un formulario con `method="get"`, con los espacios como `+` y las letras con tilde codificadas.

> **Desde Python:** un `FormData` se parece al `MultiDict` con el que Flask entrega `request.form`: un nombre puede tener varios valores, `get` da el primero y `getAll` es su `getlist`. Es una lista de pares, no un diccionario.

## Lo que `FormData` no ve

`FormData` aplica las mismas reglas que el envío, y algunas sorprenden. Solo entran los controles con `name`, no desactivados y, si son casillas o radios, marcados:

[[exercise:02-lo-que-formdata-no-ve.md-(index.html|script.js)]]

```text
FormData → [["member_name","Lucía Méndez"],["member_id","HU-0042"],["newsletter","on"]]
🐛 coupon (disabled) → null
invoice → null · billing_street → null
✅ member_id (readonly) → HU-0042
Listo: marca «Quiero factura» y mira qué entra
// Tras marcar «Quiero factura»:
FormData → [["member_name","Lucía Méndez"],["member_id","HU-0042"],["invoice","on"],["newsletter","on"],["billing_street","Calle Morelos 12"]]
🐛 coupon (disabled) → null
invoice → on · billing_street → Calle Morelos 12
✅ member_id (readonly) → HU-0042
```

Cuatro reglas, que el capítulo de HTML ya anunciaba para el envío:

- **`disabled` no se envía**, tampoco lo que está dentro de un `<fieldset disabled>`. Si un valor debe viajar pero no editarse, usa `readonly`.
- **Una casilla sin marcar no envía nada**: ni `false`, ni su nombre. En el servidor, «no está» significa «no marcada».
- **Un control sin `name` no existe** para `FormData`, por mucho `id` que tenga.
- Los botones solo cuentan si son **el que envió** el formulario (lo verás enseguida).

## `Object.fromEntries` y los nombres repetidos

Para trabajar con los datos (o enviarlos como JSON) apetece convertir el `FormData` en un objeto con `Object.fromEntries(formData)`, que viste en la lección «Objetos literales». Funciona… hasta que un nombre se repite. Un objeto no puede tener dos claves `days`, así que cada par pisa al anterior y solo queda el **último**:

[[exercise:03-fromentries-pierde-repetidos.md-(script.js)]]

```text
entradas → [["student","Bruno Díaz"],["days","sat"],["days","sun"]]
🐛 Object.fromEntries → {"student":"Bruno Díaz","days":"sun"}
✅ con getAll → {"student":"Bruno Díaz","days":["sat","sun"]}
Listo: marca el viernes; luego desmarca los tres días
// Tras marcar «Viernes»:
entradas → [["student","Bruno Díaz"],["days","fri"],["days","sat"],["days","sun"]]
🐛 Object.fromEntries → {"student":"Bruno Díaz","days":"sun"}
✅ con getAll → {"student":"Bruno Díaz","days":["fri","sat","sun"]}
// Tras desmarcar los tres días (la última tanda de líneas):
entradas → [["student","Bruno Díaz"]]
🐛 Object.fromEntries → {"student":"Bruno Díaz"}
✅ con getAll → {"student":"Bruno Díaz","days":[]}
```

Los nombres que se repiten son los de los grupos de casillas y los `<select multiple>`. Pídelos con `getAll`, que devuelve **siempre** un array. No conviertas en array «lo que aparezca dos veces»: con un día marcado tendrías un string, y con dos, un array; el código que lo recibe tendría que comprobar los dos casos.

> **Desde Python:** `dict([('days', 'sat'), ('days', 'sun')])` también da `{'days': 'sun'}`: el último gana. Es el mismo error que `request.form.to_dict()` en Flask.

## El evento `submit` y quién lo disparó

Como viste en «Acciones por defecto», el envío se escucha con `submit` **en el formulario**: llega tanto si se pulsa un botón como si se pulsa Enter en un campo, y solo después de que la validación nativa lo permita. Dos detalles del HTML se vuelven trampas en cuanto hay JavaScript.

El primero: un `<button>` dentro de un formulario es, si no dice otra cosa, **`type="submit"`** (lo viste en la lección «Los controles»). Un botón «+» que solo debía sumar uno también envía el formulario. Y hay algo peor: al pulsar Enter en un campo, el navegador «pulsa» el **primer botón de envío** del formulario, que puede ser el «−»:

[[exercise:04-boton-sin-type-envia.md-(script.js)]]

```text
Listo: pulsa «+» en los dos carritos; luego escribe en cada cantidad y pulsa Enter
// Tras pulsar «+» en el carrito 🐛:
🐛 + → cantidad 3
🐛 📨 submit · lo disparó «+»
Form submitted (navigation blocked in preview): POST /carrito (application/x-www-form-urlencoded) {quantity: '3'}
// Tras pulsar «+» en el carrito ✅:
✅ + → cantidad 3
// Tras escribir 5 en la cantidad del 🐛 y pulsar Enter (el navegador «pulsa» el «−»):
🐛 − → cantidad 4
🐛 📨 submit · lo disparó «−»
Form submitted (navigation blocked in preview): POST /carrito (application/x-www-form-urlencoded) {quantity: '4'}
// Tras escribir 5 en la cantidad del ✅ y pulsar Enter:
✅ 📨 submit · lo disparó «Actualizar»
Form submitted (navigation blocked in preview): POST /carrito (application/x-www-form-urlencoded) {quantity: '5'}
```

En una página real, cada uno de esos envíos recargaría la página y el carrito volvería a su estado inicial. La regla: **todo `<button>` lleva `type`**: `type="button"` para los que ejecutan JavaScript y `type="submit"` para el que envía.

El segundo detalle: un formulario puede tener varios botones de envío, cada uno con su `name` y su `value` («Guardar borrador», «Publicar») o con su propio destino (`formaction`, `formmethod`, `formenctype`). El evento lleva el botón en **`event.submitter`**, y el envío real incluye su par nombre/valor. Pero `new FormData(form)` no sabe qué botón se pulsó: para incluirlo, pásaselo como segundo argumento, `new FormData(form, event.submitter)` (en Chrome desde la versión 112):

[[exercise:05-submitter-y-formaction.md-(index.html|script.js)]]

```text
Listo: pulsa los cuatro botones y compara las líneas «Form submitted» de la consola
// Tras pulsar «Publicar»:
📨 «Publicar» → intent=publish
   new FormData(form).get('intent') → null
   new FormData(form, submitter).get('intent') → publish
Form submitted (navigation blocked in preview): POST /recetas (application/x-www-form-urlencoded) {title: 'Pozole rojo', servings: '6', intent: 'publish'}
// Tras pulsar «Vista previa»:
📨 «Vista previa» → sin name
   new FormData(form).get('intent') → null
   new FormData(form, submitter).get('intent') → null
Form submitted (navigation blocked in preview): GET /recetas/vista-previa?title=Pozole+rojo&servings=6 {title: 'Pozole rojo', servings: '6'}
// Tras pulsar «Publicar (multipart)»:
📨 «Publicar (multipart)» → intent=publish
   new FormData(form).get('intent') → null
   new FormData(form, submitter).get('intent') → publish
Form submitted (navigation blocked in preview): POST /recetas (multipart/form-data) {title: 'Pozole rojo', servings: '6', intent: 'publish'}
```

Las líneas `Form submitted` son las que escribe LearnWeb y resumen lo que viste en el capítulo de HTML: con `GET`, los datos viajan en la *query* de la URL (y sustituyen a la que tuviera el `action`); con `POST`, en el cuerpo de la petición, codificados según el `enctype` (`application/x-www-form-urlencoded` por defecto, `multipart/form-data` cuando hay archivos).

## `submit()` frente a `requestSubmit()`

A veces el envío lo decide tu código: un formulario que se guarda solo al cambiar un filtro, un atajo de teclado, un botón que está fuera del `<form>`. Hay dos métodos para eso, y **no** hacen lo mismo:

- `form.submit()` envía el formulario **tal cual**: no valida, no dispara el evento `submit` (tu listener no se ejecuta) y no hay `submitter`. Es un método antiguo que se salta todo lo que has aprendido en este módulo.
- `form.requestSubmit(botón)` hace lo mismo que pulsar ese botón: valida (y muestra el aviso del primer campo inválido), dispara `submit` con ese botón como `submitter` y, si nadie lo cancela, envía. Sin argumento, se comporta como un envío sin botón.

[[exercise:06-submit-frente-a-requestsubmit.md-(script.js)]]

```text
Listo: pulsa «form.submit()» y «form.requestSubmit()»; luego completa el formulario y repite
// Tras pulsar «form.submit() 🐛» (el iframe muestra la respuesta del servidor de pruebas):
🐛 form.submit() con checkValidity() → false: se envía igual
🐛 el servidor recibió → {"email":"","seats":"6"}
// Tras pulsar «form.requestSubmit(reservar) ✅» (aparece el aviso del correo vacío; no hay submit):
✅ form.requestSubmit(reservar)
// Tras escribir un correo, poner 2 plazas y pulsar el mismo botón:
✅ form.requestSubmit(reservar)
📨 submit · submitter: «Reservar»
```

El ejemplo envía el formulario a `/api/demo/echo`, el **servidor de pruebas** de LearnWeb, que responde con un JSON que describe lo que recibió, y carga la respuesta en un iframe gracias al atributo `target`. Así se ve la consecuencia real: un correo vacío y seis plazas de cuatro han llegado al servidor sin que tu código interviniera. La regla: **`requestSubmit()` siempre**; `submit()` solo si de verdad quieres saltarte la validación y los listeners.

## Serializar a JSON

Muchas APIs no reciben formularios, sino JSON. El atajo `JSON.stringify(Object.fromEntries(formData))` produce un JSON, pero no el que espera el servidor: todos los valores son strings (la edad, `"34"`), los nombres repetidos se quedan con el último y las casillas sin marcar desaparecen en lugar de valer `false`. Para un JSON fiable, construye el objeto campo a campo, con el tipo de cada uno:

[[exercise:07-serializar-a-json.md-(script.js)]]

```text
🐛 atajo → {"reader":"Marta Ruiz","age":"34","genres":"poetry"}
✅ con tipos → {"reader":"Marta Ruiz","age":34,"genres":["novel","poetry"],"newsletter":false}
Listo: pulsa «Darme de alta»; prueba también a marcar «Ensayo» o vaciar la edad
// Tras pulsar «Darme de alta»:
📤 enviando → {"reader":"Marta Ruiz","age":34,"genres":["novel","poetry"],"newsletter":false}
📥 200 · content-type: application/json
📥 body.age → 34 (number) · body.genres → ["novel","poetry"]
// Tras vaciar la edad y volver a enviar:
📤 enviando → {"reader":"Marta Ruiz","age":null,"genres":["novel","poetry"],"newsletter":false}
📥 200 · content-type: application/json
📥 body.age → null (object) · body.genres → ["novel","poetry"]
```

`valueAsNumber` da `NaN` con la edad vacía, y `JSON.stringify` escribe `NaN` como `null` (lo viste en la lección «JSON y copias»). Si la edad es obligatoria, eso no debería llegar al servidor: es trabajo de la validación, en la lección siguiente.

La segunda mitad del ejemplo es un **adelanto** del módulo siguiente, «Red y almacenamiento»: `fetch(url, { method, headers, body })` envía una petición sin salir de la página y `await response.json()` lee la respuesta. Basta con eso para entender el flujo; los detalles (`response.ok`, los errores de red, las cabeceras) llegan allí. Fíjate en el orden del listener: `preventDefault()` va **antes** del primer `await`, porque después el navegador ya habría enviado el formulario.

## Enviar sin recargar

`fetch` acepta como `body` el propio `FormData` o un `URLSearchParams`, y elige la codificación por ti, como haría el `enctype` del formulario:

| `body` | `Content-Type` que se envía | Archivos |
|--------|-----------------------------|----------|
| `formData` | `multipart/form-data; boundary=…` | sí, con su nombre, tamaño y tipo |
| `new URLSearchParams(formData)` | `application/x-www-form-urlencoded;charset=UTF-8` | no: un archivo se convertiría en el texto `[object File]` |
| `JSON.stringify(objeto)` + cabecera `Content-Type: application/json` | `application/json` | no |

No escribas tú la cabecera de un `FormData`: el `boundary` es la marca que separa las partes del cuerpo y la genera el navegador; si pones `multipart/form-data` a mano, falta y el servidor no puede leer nada.

[[exercise:08-enviar-formdata-con-fetch.md-(script.js)]]

```text
Listo: envía de las dos formas; luego elige un archivo, o marca «Simular un error 422»
// Tras pulsar «Enviar como FormData» (el formulario queda desactivado casi un segundo):
📤 multipart → enviando…
✅ 200 · multipart: true · urlencoded: false
   body → {"applicant":"Lucía Méndez","position":"barista","skills":["latte-art","cupping"]}
// Tras pulsar «Enviar como URLSearchParams»:
📤 urlencoded → enviando…
✅ 200 · multipart: false · urlencoded: true
   body → {"applicant":"Lucía Méndez","position":"barista","skills":["latte-art","cupping"]}
// Tras elegir un archivo (aquí, un cv.pdf de 24 KB) y pulsar «Enviar como FormData»:
📤 multipart → enviando…
✅ 200 · multipart: true · urlencoded: false
   body → {"applicant":"Lucía Méndez","position":"barista","skills":["latte-art","cupping"],"cv":{"name":"cv.pdf","size":24576,"type":"application/pdf"}}
// Tras marcar «Simular un error 422» y enviar:
📤 multipart → enviando…
⚠️ 422: aquí mostrarías los errores del servidor junto a cada campo
```

Mientras la petición está en camino, el ejemplo desactiva el `<fieldset>` que envuelve los campos (así no hay dobles envíos ni cambios a medias), marca el formulario con `aria-busy` y anuncia el estado en una región `role="status"`; al terminar, pase lo que pase (`finally`), lo reactiva y devuelve el foco al botón, que lo perdió al desactivarse. Un campo de archivo sin archivo entra en `FormData` como un archivo vacío sin nombre: el ejemplo lo quita antes de enviar. El servidor de pruebas acepta `?status=422` para responder con ese código de error («los datos no son válidos») y `?delay=800` para tardar 800 ms.

## Añadir datos al envío: el evento `formdata`

A veces el envío necesita datos que no están en ningún control: un carrito que vive en un array, un valor calculado, el estado de un componente propio. El evento **`formdata`** llega al formulario cada vez que se construye su lista de datos, en el envío normal y en cada `new FormData(form)`, y su `event.formData` se puede modificar:

[[exercise:09-el-evento-formdata.md-(script.js)]]

```text
formdata → añadidos cart y total
new FormData(form).get('total') → 565.00
Listo: pulsa «Pagar» (o Enter en la dirección); el envío no se cancela
// Tras pulsar «Pagar»:
formdata → añadidos cart y total
Form submitted (navigation blocked in preview): POST /pedidos (application/x-www-form-urlencoded) {address: 'Calle Morelos 12, Oaxaca', cart: '[{"sku":"CAF-500","qty":2},{"sku":"CAC-250","qty":1}]', total: '565.00'}
```

Así el formulario sigue funcionando **sin** `preventDefault` ni `fetch`: el navegador lo envía de la forma normal, con los datos extra dentro. Para componentes propios hay una solución más completa, los *custom elements* asociados a formularios, que se comportan como un control más; los verás con los Web Components en el módulo «APIs modernas del navegador».

## Bestiario

- **Faltan campos en lo que se envía.**
  Síntoma: un campo visible no aparece en `FormData` ni en el servidor.
  Causa: está `disabled` (o dentro de un `<fieldset disabled>`), no tiene `name`, o es una casilla sin marcar.
  Solución: `readonly` en lugar de `disabled` si debe viajar; `name` en todo lo que se envía; en el servidor, «no está» es «no marcada».
  → [ver ejemplo](02-lo-que-formdata-no-ve.md)
- **De dos casillas marcadas, llega una.**
  Síntoma: `Object.fromEntries(formData)` guarda un solo valor de un grupo de casillas o de un `<select multiple>`.
  Causa: un objeto no admite claves repetidas; cada par pisa al anterior y gana el último.
  Solución: `formData.getAll(nombre)` para los campos que pueden repetirse.
  → [ver ejemplo](03-fromentries-pierde-repetidos.md)
- **El botón «+» envía el formulario.**
  Síntoma: un botón que solo debía ejecutar JavaScript recarga la página; Enter en un campo ejecuta la acción de otro botón.
  Causa: un `<button>` sin `type` dentro de un formulario es de envío, y Enter «pulsa» el primer botón de envío.
  Solución: `type="button"` en los botones que no envían y `type="submit"` en el que sí.
  → [ver ejemplo](04-boton-sin-type-envia.md)
- **El botón pulsado no está en los datos.**
  Síntoma: con `preventDefault()` y `new FormData(form)`, falta el `name`/`value` del botón que envió («intent=publish»).
  Causa: el formulario no sabe qué botón se pulsó; solo el evento lo sabe.
  Solución: `new FormData(form, event.submitter)`.
  → [ver ejemplo](05-submitter-y-formaction.md)
- **El formulario se envía sin validar y sin pasar por mi listener.**
  Síntoma: tras `form.submit()`, llegan al servidor datos inválidos y el código del evento `submit` no se ejecuta.
  Causa: `submit()` envía directamente, sin validación ni evento.
  Solución: `form.requestSubmit(botón)`.
  → [ver ejemplo](06-submit-frente-a-requestsubmit.md)

## Resumen

- `new FormData(form)` construye los pares nombre/valor del envío: `get` (el primero), `getAll`, `has`, `set`, `append`, `delete`, y se recorre con `for…of`.
- No entran los controles `disabled`, los que no tienen `name` ni las casillas sin marcar; `readonly` sí.
- `Object.fromEntries(formData)` pierde los valores repetidos: `getAll` para las listas.
- Todo `<button>` lleva `type`; Enter «pulsa» el primer botón de envío.
- `event.submitter` es el botón que envió; `new FormData(form, submitter)` incluye su par nombre/valor.
- `form.submit()` no valida ni dispara `submit`; `form.requestSubmit(botón)` sí.
- Para JSON, construye el objeto con los tipos de cada campo; para enviar sin recargar, `preventDefault()` antes del primer `await` y `fetch` con `FormData`, `URLSearchParams` o JSON.
- El evento `formdata` añade datos al envío normal.

## Para profundizar

- [MDN: FormData](https://developer.mozilla.org/es/docs/Web/API/FormData)
- [MDN: HTMLFormElement.requestSubmit() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit)
- [MDN: SubmitEvent.submitter (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter)
- [javascript.info: FormData](https://es.javascript.info/formdata)
- [MDN: el evento formdata (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/formdata_event)
