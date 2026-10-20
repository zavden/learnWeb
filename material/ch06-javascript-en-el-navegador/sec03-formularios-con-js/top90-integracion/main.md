# Integración: formularios con JavaScript

## Por qué importa

Las tres lecciones del módulo enseñan piezas sueltas: leer y escribir cada control, recoger y enviar los datos con `FormData`, y validar con mensajes propios y en el momento justo. Un formulario de verdad las usa todas a la vez, y casi siempre con expresiones regulares de por medio: un teléfono que se limpia mientras se escribe, un código que se construye con datos, un nombre con tildes que `\w` rechazaría.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones en cada programa, incluida la lección «Expresiones regulares» del capítulo de JavaScript. Como en las lecciones, casi todos envían el formulario: ábrelos con **«▶ Run»** o en el editor, porque en las tarjetas de la galería (un iframe aislado, sin permiso para enviar formularios) el botón de envío no hace nada; los que lo necesitan lo avisan en la propia página. Todos imprimen al cargar una línea `Listo: …` con lo que hay que probar, y llevan su propio registro en la página.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| un número de un campo | `valueAsNumber` (y comprueba `NaN`) | «Leer y escribir controles» |
| una fecha de calendario | el string de `value`; si es un `Date`, `getUTC*` o `timeZone: 'UTC'` | «Leer y escribir controles» |
| que «Descartar» vuelva a lo guardado | cargar los datos en `defaultValue`, `defaultChecked`, `defaultSelected` | «Leer y escribir controles» |
| saber si hay cambios sin guardar | comparar cada control con su `default*` | «Leer y escribir controles» |
| los datos del formulario | `new FormData(form, event.submitter)`; `getAll` para los nombres repetidos | «FormData y envío» |
| enviar sin recargar | `preventDefault()` antes del primer `await` y `fetch` (adelanto) | «FormData y envío» |
| enviar desde el código | `form.requestSubmit(botón)`, nunca `submit()` | «FormData y envío» |
| una regla que HTML no tiene | `setCustomValidity(hayError ? mensaje : '')` | «Validación con JavaScript» |
| mensajes en tu idioma | `novalidate`, `validity` → texto, `aria-describedby`, `aria-invalid`, foco al primero | «Validación con JavaScript» |
| validar en vivo sin agobiar | castigar tarde (`focusout`, envío) y premiar pronto (`input` en los campos marcados) | «Validación con JavaScript» |
| filtrar lo que se escribe | cancelar teclas en `beforeinput`, limpiar el resto en `input` | «Validación con JavaScript» |
| letras de cualquier idioma | `\p{L}` con el flag `v` (y `\-` dentro de los corchetes) | «Expresiones regulares» |
| texto del usuario dentro de una regex | `RegExp.escape` | «Expresiones regulares» |

## Ejemplos combinados

### Una reserva con validación en vivo

Cinco campos con `novalidate` y mensajes propios para cada indicador de `validity`: horario de 13:00 a 22:00 cada media hora (`min`, `max` y `step` en un `type="time"`), días de noviembre, de 1 a 12 personas. El nombre se comprueba con una regex Unicode (`\p{L}` con el flag `v`) a través de `setCustomValidity`, y el teléfono acepta cualquier formato humano porque se limpia en `input` con `\D`. Castiga tarde (al salir del campo o al enviar), premia pronto (los campos marcados se revisan en cada cambio) y al enviar lleva el foco al primer error. Los datos salen con su tipo: las personas como número, el día y la hora como los strings del campo.

[[exercise:01-reserva-con-validacion-en-vivo.md-(script.js)]]

```text
Listo: pulsa «Reservar»; luego pega 55 1234 5678 en el teléfono, cambia la hora a 13:30 y vuelve a reservar
// Tras pulsar «Reservar»:
❌ phone · al enviar → «Escribe un teléfono para confirmarte la mesa.»
❌ time · al enviar → «Reservamos cada media hora (13:00, 13:30…).»
📨 submit → 📢 «Revisa 2 campo(s).» · foco en phone
// Tras pegar 55 1234 5678 en el teléfono (el foco ya está ahí):
✅ phone · en vivo → corregido
// Tras cambiar los minutos de la hora a 30:
✅ time · en vivo → corregido
// Tras pulsar «Reservar»:
📨 submit → ✅ {"customer":"Lucía Méndez","phone":"5512345678","date":"2026-11-20","time":"13:30","guests":4}
```

### Una calculadora de pedido

Tres cantidades leídas con `valueAsNumber` en cada `input` (una vacía deja el total pendiente en lugar de sumar un cero que nadie escribió), un envío que depende de un `<select>` y un cupón reconocido con una regex con grupo (`/^PAN(\d{2})$/`, el grupo es el porcentaje). El «pedido habitual» se carga en los valores **iniciales**, así que «Descartar cambios» (`reset()`) vuelve a él; como `reset()` no dispara `input`, el total se recalcula a mano. «Guardar como habitual» copia lo actual en los `default*`. El registro solo escribe cuando cambia el resultado, no en cada letra del cupón.

[[exercise:02-calculadora-de-pedido.md-(script.js)]]

```text
📦 cargado tu pedido habitual
💰 subtotal $468.00 · envío $0.00 · descuento $0.00 · total $468.00
Listo: sube las conchas a 13 con la flecha, escribe el cupón PAN10, pulsa «Descartar cambios»; luego cambia algo y «Guardar como habitual»
// Tras subir las conchas a 13 con la flecha del campo:
💰 subtotal $486.00 · envío $0.00 · descuento $0.00 · total $486.00
// Tras escribir PAN10 (la línea sale con el «0»):
💰 subtotal $486.00 · envío $0.00 · descuento $48.60 · total $437.40
// Tras pulsar «Descartar cambios»:
↩️ cambios descartados
💰 subtotal $468.00 · envío $0.00 · descuento $0.00 · total $468.00
// Tras elegir «A domicilio» y pulsar «Guardar como habitual»:
💰 subtotal $468.00 · envío $60.00 · descuento $0.00 · total $528.00
💾 guardado como habitual → {"conchas":"12","bolillos":"30","orejas":"6","delivery":"delivery","coupon":""}
```

### Una compra en pasos que conserva sus datos

Cada paso es su propio `<form>`, así que la validación nativa decide si llega el `submit` del paso (sin `required` cumplido o con un código postal que no encaja en `\d{5}`, no hay evento). Cada paso vuelca su `FormData` en uno acumulado: primero borra (`delete`) lo que ese paso guardó antes, para que una casilla desmarcada al volver atrás desaparezca, y después añade con `append`, que admite nombres repetidos. «Atrás» solo cambia qué formulario se ve: lo escrito sigue en sus campos. El foco va al título de cada paso, y el último envía el `FormData` acumulado al servidor de pruebas con `fetch` (adelanto del módulo siguiente).

[[exercise:03-compra-en-pasos-con-formdata.md-(script.js)]]

```text
Listo: pulsa «Siguiente»; escribe nombre y código postal (06700); vuelve «Atrás» hasta el paso 1, quita la canela y sigue hasta «Confirmar pedido»
// Tras pulsar «Siguiente»:
➡️ paso 1 guardado → {"grind":"espresso","extras":["cinnamon","piloncillo"]}
// Tras escribir «Lucía Méndez» y 06700 y pulsar «Siguiente»:
➡️ paso 2 guardado → {"grind":"espresso","extras":["cinnamon","piloncillo"],"customer":"Lucía Méndez","postal_code":"06700"}
// Tras «Atrás» dos veces, desmarcar «Canela» y pulsar «Siguiente» dos veces:
➡️ paso 1 guardado → {"customer":"Lucía Méndez","postal_code":"06700","grind":"espresso","extras":["piloncillo"]}
➡️ paso 2 guardado → {"grind":"espresso","extras":["piloncillo"],"customer":"Lucía Méndez","postal_code":"06700"}
// Tras pulsar «Confirmar pedido»:
📤 enviando 4 pares…
✅ 200 · el servidor recibió → {"grind":"espresso","extras":"piloncillo","customer":"Lucía Méndez","postal_code":"06700"}
```

Fíjate en dos detalles. Al volver a guardar un paso, sus claves pasan al **final** del `FormData` (se borraron y se añadieron de nuevo); el orden no importa al servidor, pero explica el JSON. Y en la última línea, `extras` llega como string: con un solo valor, el servidor de pruebas no puede saber que era una lista. Es la ambigüedad de la lección «FormData y envío», ahora del lado del servidor.

### Cambios sin guardar

Un perfil que sabe si tiene cambios: cada control se compara con su valor **inicial**, y cada tipo guarda el suyo (`defaultValue`, `defaultChecked`, `defaultSelected` en cada opción). El estado se anuncia en una región `role="status"` y activa «Guardar» y «Descartar». Si hay cambios, el enlace para salir cancela su navegación y pregunta en un `<dialog>` modal; guardar copia lo actual en los `default*`, y el evento `beforeunload` (el aviso del navegador al cerrar la pestaña) solo se escucha mientras hay cambios. Un detalle de `reset`: el evento llega **antes** de restaurar los valores, así que la comprobación se hace en la siguiente tarea, con `setTimeout`.

[[exercise:04-cambios-sin-guardar.md-(script.js)]]

```text
✔️ sin cambios
Listo: añade « Envíos a todo México.» a la descripción y marca «Reseñas»; pulsa «← Volver al catálogo»; luego «Guardar»
// Tras escribir en la descripción y marcar «Reseñas»:
✏️ cambios en: bio
✏️ cambios en: bio, notify
// Tras pulsar «← Volver al catálogo» y elegir «Seguir editando»:
🚪 diálogo → stay
// Tras pulsar «Guardar»:
💾 guardado → {"shop":"Barro Negro de Coyotepec","bio":"Piezas de barro negro hechas a mano en Oaxaca. Envíos a todo México.","city":"oaxaca","notify":["orders","reviews"]}
✔️ sin cambios
```

### Un buscador con resaltado

El catálogo se filtra en cada `input`. Lo que escribe el usuario es **texto**, no un patrón: `RegExp.escape` hace que `2.ª)` busque un punto y un paréntesis de verdad. La regex lleva los flags `i` y `v`, y con «Palabra completa» se rodea de un *lookbehind* y un *lookahead* que hacen de frontera de palabra Unicode (la que `\b` no sabe trazar con tildes). Para resaltar, `split` con un grupo que captura devuelve el texto y las coincidencias alternados, y cada coincidencia se envuelve en un `<mark>` creado con el DOM: ni una línea de `innerHTML`.

[[exercise:05-buscador-con-resaltado.md]]

[[exercise:05-buscador-con-resaltado.md-(script.js)]]

```text
🔎 '' → 6 de 6
Listo: escribe «café» (prueba también «2.ª)»); luego marca «Palabra completa»
// Tras escribir «café» (una línea por cambio del campo; la última):
🔎 'café' → 3 de 6
// Tras marcar «Palabra completa» («Cafés» ya no cuenta):
🔎 'café' (palabra completa) → 2 de 6
// Tras desmarcarla y cambiar la búsqueda por «2.ª)» (la última línea):
🔎 '2.ª)' → 1 de 6
```

### Un campo de etiquetas

Las etiquetas de una receta se escriben en un campo y se separan con coma o Enter. `beforeinput` cancela la coma (`inputType` `insertText`, `data` `','`) y crea la etiqueta; Enter se cancela en `keydown`, porque si no «pulsaría» el botón de envío. Lo pegado se trocea con `split(/\s*[,;]\s*/)`. Cada etiqueta se normaliza (espacios y minúsculas) y se valida con `\p{L}` y `\p{N}`; un error deja el campo inválido con `setCustomValidity` (así el formulario no se envía con una etiqueta rechazada a medias) y se quita en cuanto se edita. Cada etiqueta viaja como un `<input type="hidden" name="tags">`, y `FormData` las recoge con `getAll`.

[[exercise:06-campo-de-etiquetas.md-(script.js)]]

```text
🏷️ + mexicana → ["mexicana"]
🏷️ + caldos → ["mexicana","caldos"]
Listo: escribe «Sin gluten,»; luego «caldos» y Enter, y bórralo; pega «maíz, chile guajillo,» y pulsa «Publicar receta»
// Tras escribir «Sin gluten,»:
🏷️ + sin gluten → ["mexicana","caldos","sin gluten"]
// Tras escribir «caldos» y pulsar Enter:
⚠️ «caldos» ya está.
// Tras borrarlo y pegar «maíz, chile guajillo,»:
🏷️ + maíz → ["mexicana","caldos","sin gluten","maíz"]
🏷️ + chile guajillo → ["mexicana","caldos","sin gluten","maíz","chile guajillo"]
// Tras pulsar «Publicar receta»:
📨 {"title":"Pozole rojo","tags":["mexicana","caldos","sin gluten","maíz","chile guajillo"]}
```

### Importar contactos pegados

Una lista de socios pegada en un `<textarea>`, un socio por línea. Cada línea se parte con `split(/\s*;\s*/)` y cada dato se comprueba con **su** regex, para que el error diga qué falla y en qué línea: `\p{L}` para el nombre, una regex sencilla para el correo y las cifras del teléfono contadas después de quitar `\D`. Mientras haya errores, el `textarea` es inválido (`setCustomValidity`), los errores se listan en el elemento al que apunta su `aria-describedby` y el envío lleva el foco al campo; tras el primer aviso, se revisa en cada cambio. Los mensajes no repiten el valor escrito, así no cambian en cada tecla y el registro solo escribe cuando cambia el resultado.

[[exercise:07-importar-contactos.md-(script.js)]]

```text
📋 4 líneas → 2 correctas, 2 con errores
❌ línea 2: el correo está incompleto (falta la @, el dominio o su punto)
❌ línea 4: el teléfono no tiene 10 cifras
Listo: corrige la línea 2 (bruno@huerta.mx) y la 4 (33 1111 2222); luego pulsa «Importar»
// Tras añadir «.mx» al correo de la línea 2 (el error se va con la «m»):
📋 4 líneas → 3 correctas, 1 con errores
❌ línea 4: el teléfono no tiene 10 cifras
// Tras cambiar 12345 por 33 1111 2222 en la línea 4:
📋 4 líneas → 4 correctas, 0 con errores
// Tras pulsar «Importar»:
📨 importados 4 socios: Lucía Méndez, Bruno Díaz, José Ñúñez, Ana
```

## Ejercicios

Los tres ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Las comprobaciones rellenan los campos desde JavaScript y, cuando hace falta enviar, despachan un evento `submit` simulado que no burbujea (así la vista previa de LearnWeb no lo intercepta en `window`). Al abrirlos, todas salen en rojo.

### Lee bien el pedido

`readOrder` devuelve los datos de un pedido con cinco errores, uno por control, todos del Bestiario de la lección «Leer y escribir controles»: un número que es un string, una casilla leída por su `value`, el primer radio del grupo, un `<select multiple>` leído con `value` y un `valueAsDate` leído en hora local. La última comprobación espera el día 20 «en cualquier zona horaria»: en Ciudad de México, la versión con `getDate()` da 19. Cinco comprobaciones.

[[exercise:08-ej-lee-bien-el-pedido.md]]

### Envía bien el formulario

El alta en un club de lectura pierde datos y se envía cuando no debe: un número de socio `disabled`, un botón «+1 invitado» sin `type`, `Object.fromEntries` con un grupo de casillas, un `FormData` que no sabe qué botón se pulsó y un atajo de teclado (Ctrl/⌘ + Enter) que llama a `form.submit()`. Dos de los arreglos están en el HTML. La última comprobación sustituye un momento `submit` y `requestSubmit` por funciones espía para ver cuál se llama, sin enviar nada. Cinco comprobaciones.

[[exercise:09-ej-envia-bien-el-formulario.md]]

### Mensajes de error accesibles

Un alta de vendedoras con `novalidate` y mensajes propios a medio hacer: un `setCustomValidity` que nunca se limpia, una regex construida con un prefijo con puntos (`B.N.`) sin escapar, campos que no marcan `aria-invalid` ni escriben su mensaje en el párrafo de `aria-describedby`, y un envío que no resume los errores ni lleva el foco al primero. Cinco comprobaciones.

[[exercise:10-ej-mensajes-de-error-accesibles.md]]

## Resumen

- Cada control con su propiedad: `valueAsNumber`, `checked`, el `value` del `RadioNodeList`, `selectedOptions`, el string de las fechas.
- Los `default*` son el estado «guardado»: `reset()` vuelve a ellos y compararlos con lo actual dice si hay cambios.
- `FormData` es la lista de lo que se envía: `delete` y `append` la reconstruyen, `getAll` lee las listas y `new FormData(form, submitter)` incluye el botón.
- La validación nativa decide si llega el `submit`; con `novalidate`, decides tú, con mensajes en tu idioma, `aria-invalid`, `aria-describedby` y el foco en el primer error.
- En vivo: castigar tarde, premiar pronto, y los anuncios, de uno en uno.
- Las regex de los formularios usan `\p{L}` con el flag `v`, una regla por regex y `RegExp.escape` para todo texto que venga de fuera.

## Para profundizar

- [web.dev: Learn Forms (en inglés)](https://web.dev/learn/forms)
- [GOV.UK Design System: validación y mensajes de error (en inglés)](https://design-system.service.gov.uk/components/error-message/)
- [MDN: FormData](https://developer.mozilla.org/es/docs/Web/API/FormData)
- [MDN: Window: evento beforeunload (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
