# Leer y escribir controles

## Por qué importa

En el capítulo de HTML, los formularios funcionaban solos: el navegador recogía los valores, los validaba y los enviaba. Con JavaScript, tu código necesita leerlos antes: para calcular un total mientras el usuario elige, para mostrar una vista previa, para rellenar un campo con una dirección guardada o para enviar los datos sin recargar la página. Este módulo, «Formularios con JavaScript», cumple lo que te prometimos en los dos anteriores: `valueAsNumber`, `defaultValue` y `form.reset()` (desde «Atributos y propiedades»), y la diferencia entre `input` y `change` (desde «Escuchar eventos» y «Delegación de eventos»).

Leer un control parece trivial, `campo.value`, y casi nunca lo es. `value` es siempre un string, así que `2 + 1` personas dan «21». Una fecha leída como `Date` sale un día antes en México. Una casilla sin marcar tiene `value` `'on'`. El `value` de un radio no dice cuál está marcado. Y si tu código cambia un campo, nadie se entera. Esta lección recorre cada control con su trampa.

Los ejemplos de este módulo escriben cada paso en la consola **y** en una lista de la propia página. Imprimen al cargar lo que pueden comprobar sin ti y una línea `Listo: …` con lo que debes probar; los bloques de salida muestran después lo que aparece tras cada interacción.

## Llegar a los controles: `form.elements`

Puedes seleccionar cada campo con `querySelector`, como cualquier elemento. Pero un formulario ya trae una colección con todos sus controles, **`form.elements`**, en la que cada uno se pide por su `name` (o por su `id`): `form.elements.quantity`, o `form.elements['postal_code']` si el nombre no es un identificador válido. El camino inverso también existe: cada control sabe a qué formulario pertenece (`campo.form`), y `document.forms` lista los formularios de la página.

Lo que cambia de un control a otro es **qué propiedad** leer:

| Control | Propiedad | Tipo |
|---------|-----------|------|
| `text`, `email`, `search`, `tel`, `url`, `password`, `<textarea>` | `value` | string |
| `number`, `range` | `valueAsNumber` (y `value`, como string) | number (`NaN` si está vacío) |
| `date`, `month`, `week`, `time` | `value` (`'2026-11-20'`), `valueAsDate`, `valueAsNumber` | string, `Date` en UTC, ms |
| `checkbox` | `checked` | boolean |
| grupo de `radio` | `form.elements.nombre.value` | string (`''` si no hay ninguno) |
| `<select>` | `value`, `selectedIndex`, `selectedOptions` | string, number, colección |
| `<select multiple>` | `selectedOptions` | colección de `<option>` |
| `file` | `files` (verás la File API en «APIs modernas del navegador») | `FileList` |

[[exercise:01-leer-cada-control.md]]

[[exercise:01-leer-cada-control.md-(script.js)]]

```text
customer.value → 'Lucía Méndez'
quantity.value → '2' · valueAsNumber → 2
grind.value → 'beans' (el radio marcado del grupo)
origin.value → 'veracruz' · texto → 'Veracruz'
gift.checked → false
notes.value → 'Entregar por la tarde'
Listo: cambia los campos y pulsa «Leer el formulario»
```

Fíjate en el nombre del campo: `customer`, no `name`. Los controles con nombre también aparecen como propiedades del propio `<form>` (`form.customer`), y uno llamado `name`, `action`, `method` o `submit` **tapa** la propiedad del formulario con ese nombre: con un `<input name="submit">`, `form.submit` ya no es la función, sino el campo. Por eso, para pedir controles, usa siempre `form.elements`, y no les pongas nombres que choquen.

> **Desde Python:** en Tkinter, `entry.get()` devuelve un `str` aunque el usuario escriba cifras, y para un número haces `int(entry.get())`, o usas un `IntVar`. En el navegador es igual: `value` es el `get()`, y `valueAsNumber` y `checked` son los «`IntVar`» y «`BooleanVar`» que ya traen el tipo.

## `value` es siempre un string

Lo viste en «Atributos y propiedades»: `value` es un string, también en un `type="number"`. Y con strings, `+` concatena: dos adultos y un niño dan una mesa para «21». `valueAsNumber` devuelve el número ya convertido, o `NaN` si el campo está vacío o no contiene un número. `Number(campo.value)` también convierte, pero con una diferencia peligrosa: `Number('')` es `0`, así que un campo vacío se convierte en un cero que nadie escribió.

[[exercise:02-value-siempre-es-string.md-(script.js)]]

```text
🐛 value + value → '21'
✅ valueAsNumber + valueAsNumber → 3
   Number(value) + Number(value) → 3
Listo: cambia las cantidades; luego vacía «Niños»
// Tras subir «Adultos» a 3 con la flecha del campo:
🐛 value + value → '31'
✅ valueAsNumber + valueAsNumber → 4
   Number(value) + Number(value) → 4
// Tras vaciar «Niños»:
🐛 value + value → '3'
✅ valueAsNumber + valueAsNumber → NaN
   Number(value) + Number(value) → 3
```

El `NaN` es honesto: dice «falta un dato», y `Number.isNaN` te deja reaccionar (el ejemplo escribe «completa los dos campos»). El `3` de `Number` es una respuesta equivocada que parece buena. `valueAsNumber` solo funciona en los tipos numéricos y de fecha (en un campo de texto vale siempre `NaN`); en un campo de texto con cifras, como un código postal, convierte tú y comprueba el resultado.

## Fechas: `valueAsDate` es medianoche en UTC

Un `<input type="date">` guarda la fecha como string, `'2026-11-20'`, y la ofrece también como `Date` en `valueAsDate`. Ese `Date` es la **medianoche UTC** de ese día: el mismo caso que `new Date('2026-11-20')` en la lección «Fechas e Intl». Y en Ciudad de México (UTC−6), la medianoche UTC son las seis de la tarde **del día anterior**: `getDate()`, `toLocaleDateString()` o un `Intl` sin zona muestran el 19.

[[exercise:03-valueasdate-y-el-dia-anterior.md-(script.js)]]

```text
tu zona → America/Mexico_City
value → '2026-11-20' (un string AAAA-MM-DD)
valueAsDate → 2026-11-20T00:00:00.000Z (medianoche UTC)
🐛 getDate() → 19 · toLocaleDateString → 19/11/2026
✅ getUTCDate() → 20 · Intl en UTC → viernes, 20 de noviembre de 2026
Listo: elige otra fecha de llegada
```

En una zona al este de Greenwich (Madrid, por ejemplo), la cuarta línea dice `20 · 20/11/2026`: el error solo aparece al oeste, y por eso pasa desapercibido a quien programa en Europa. Al revés pasa lo mismo: `campo.valueAsDate = new Date()` escribe la fecha **UTC** de ahora, que a las siete de la tarde en México ya es mañana. La regla para fechas de calendario (una llegada, un cumpleaños): trabaja con el string de `value`, que es además lo que envía el formulario; si necesitas un `Date`, léelo con los métodos `getUTC*` o con `Intl` y `timeZone: 'UTC'`.

## Casillas: `checked`, no `value`

El `value` de una casilla no cambia al marcarla. Es el texto que se **envía** cuando está marcada, y si el HTML no le da uno, vale `'on'`. Como `'on'` es un string no vacío, `if (casilla.value)` es siempre verdadero:

[[exercise:04-checkbox-value-es-on.md-(script.js)]]

```text
newsletter: value → 'on' · checked → false
offers: value → 'yes' · checked → true
🐛 if (newsletter.value) → suscrita
✅ if (newsletter.checked) → sin suscribir
Listo: marca y desmarca las casillas
// Tras marcar «Quiero recibir el boletín de novedades»:
newsletter: value → 'on' · checked → true
// Tras desmarcar «Avísame de las ofertas»:
offers: value → 'yes' · checked → false
```

Para saber si está marcada, `checked`. Una casilla sin marcar no envía nada, ni siquiera su nombre; lo verás con `FormData` en la lección siguiente.

## Grupos de radio: el `value` del grupo

Un grupo de radio no es un control, sino **varios** `<input>` con el mismo `name`, cada uno con su `value` fijo. Por eso `querySelector('[name=size]').value` devuelve el valor del primero, esté marcado o no. `form.elements.size`, en cambio, devuelve el grupo entero, un **`RadioNodeList`**, y su `value` es el del radio marcado (`''` si no hay ninguno). Asignarle un valor marca el radio correspondiente.

[[exercise:05-radios-con-form-elements.md-(script.js)]]

```text
🐛 querySelector('[name=size]').value → 'small'
✅ form.elements.size → RadioNodeList con 3 radios
✅ form.elements.size.value → 'medium'
leche sin elegir → '' · :checked → null
Listo: elige una leche y otro tamaño; luego pulsa «Hazlo grande»
// Tras elegir «De avena» y luego «Chico»:
change en milk → 'oat'
change en size → 'small'
// Tras pulsar «Hazlo grande»:
sizes.value = 'large' → marcado: Grande
```

La alternativa sin `form.elements` es el selector `[name=size]:checked`, que devuelve el radio marcado o `null`; de ahí el `?.value` que verás en muchos códigos.

## Listas: `value`, `selectedIndex` y `selectedOptions`

En un `<select>` normal, `value` es el `value` de la opción elegida y `selectedIndex` su posición. Para el texto visible, pide la opción: `select.selectedOptions[0].text`. Con `multiple`, el usuario puede elegir varias, pero `value` sigue devolviendo **una sola**, la primera. Todas están en `selectedOptions`, una colección viva de elementos `<option>`:

[[exercise:06-select-multiple-y-selectedoptions.md-(script.js)]]

```text
size.value → 'family' · selectedIndex → 1 · texto → 'Familiar'
🐛 extras.value → 'sesame'
✅ valores → ["sesame","filling"]
✅ textos → Ajonjolí, Relleno de nata
Listo: añade «Anís» con Cmd + clic (Ctrl + clic en Windows)
// Tras Cmd + clic en «Anís»:
🐛 extras.value → 'sesame'
✅ valores → ["sesame","anise","filling"]
✅ textos → Ajonjolí, Anís, Relleno de nata
```

Un `<select multiple>` es difícil de usar: hay que saber que existe Cmd o Ctrl + clic, y con un clic normal se pierde la selección anterior. Para pocas opciones, un grupo de casillas con el mismo `name` es más claro para todos.

## `input` frente a `change`

Los controles avisan de sus cambios con dos eventos que suenan igual y no lo son:

- **`input`** llega con **cada** cambio del valor: cada tecla, cada pegado, cada borrado, cada clic en las flechas de un número.
- **`change`** llega cuando el cambio se **confirma**. En casillas, radios y listas eso es en el acto; en un campo de texto, al salir de él (o al pulsar Enter), y solo si el valor es distinto del que tenía al entrar.

Antes de cada `input` de un campo de texto llega además **`beforeinput`**, con el valor todavía sin cambiar y un `inputType` que describe la edición (`insertText`, `deleteContentBackward`, `insertFromPaste`…). Es el único de los tres que se puede cancelar; lo usarás para filtrar lo que se escribe en la lección de validación. El orden es siempre `beforeinput` → `input` → (al confirmar) `change`:

[[exercise:07-input-frente-a-change.md]]

[[exercise:07-input-frente-a-change.md-(script.js)]]

```text
Listo: escribe «Ana» en la dedicatoria y pulsa Tab; luego marca la casilla y cambia el diseño
// Tras escribir «Ana» (la vista previa ✅ ya dice «Ana»; la 🐛 sigue en «—»):
beforeinput · insertText · 'A' · value aún ''
input · value 'A'
beforeinput · insertText · 'n' · value aún 'A'
input · value 'An'
beforeinput · insertText · 'a' · value aún 'An'
input · value 'Ana'
// Tras pulsar Tab (el campo pierde el foco):
change · value 'Ana'
// Tras marcar «Papel kraft» y elegir «Papel picado»:
change en kraft → true
change en design → papel-picado
```

La regla: `input` para lo que debe seguir al usuario mientras escribe (vistas previas, contadores de caracteres, filtros de una lista); `change` para lo que solo importa cuando ha terminado (guardar un ajuste, recalcular algo caro). Y recuerda la lección «Acciones por defecto»: `input` y `change` avisan de algo que **ya** ha pasado y no se pueden cancelar.

## Escribir desde JavaScript no avisa a nadie

Leer es la mitad del trabajo; la otra mitad es escribir: rellenar un campo con datos guardados, autocompletar una dirección, corregir un formato. Se hace asignando la misma propiedad (`value`, `checked`, `valueAsNumber`, `selectedIndex`). Pero un cambio hecho por código **no dispara** `input` ni `change`: esos eventos describen lo que hace el usuario. Si otra parte de la página escucha esos eventos para recalcular algo, no se entera:

[[exercise:08-asignar-value-no-avisa.md-(script.js)]]

```text
Listo: escribe un código postal, o pulsa los dos botones
// Tras pulsar «Usar mi dirección de casa (🐛)»:
🐛 value = '06700' → sin eventos; el envío sigue diciendo «escribe tu código postal»
// Tras pulsar «Usar mi dirección del trabajo (✅)»:
✅ value = '64000' y dispatchEvent(new Event('input', { bubbles: true }))
📦 input (isTrusted: false) → CP '64000': $99.00
// Tras borrar el último 0 y escribir un 1:
📦 input (isTrusted: true) → CP '6400': escribe tu código postal
📦 input (isTrusted: true) → CP '64001': $99.00
```

Si alguien escucha, avísale tú con `dispatchEvent`, como en la lección «Eventos personalizados»: `new Event('input', { bubbles: true })` (y `'change'` si los oyentes esperan ese). Sin `bubbles: true`, un listener delegado en el formulario no lo recibiría. Esos eventos llevan `isTrusted: false`, y es justo: no los hizo el usuario.

## Valor inicial y `form.reset()`

En «Atributos y propiedades» viste que el atributo `value` es el valor **inicial** del campo (la propiedad `defaultValue`) y la propiedad `value`, el actual. Las casillas y las opciones tienen la misma pareja: `defaultChecked` refleja el atributo `checked` y `defaultSelected`, el atributo `selected`. Te prometimos qué hace `form.reset()` con ellos: devuelve **cada control a su valor inicial**, el del HTML. No al último estado guardado, ni al de hace un momento:

[[exercise:09-reset-vuelve-al-html.md-(script.js)]]

```text
A cargado → Lucía Méndez · monthly · PDF: true · defaultValue 'Lucía'
B cargado → Lucía Méndez · monthly · PDF: true · defaultValue 'Lucía Méndez'
Listo: cambia algo en cada formulario y pulsa sus «Descartar cambios»
// Tras pulsar «Descartar cambios» en A (con cambios o sin ellos):
🐛 A tras reset() → Lucía · weekly · PDF: false
// Tras cambiar el nombre en B y pulsar su «Descartar cambios»:
✅ B tras reset() → Lucía Méndez · monthly · PDF: true
```

Un formulario de ajustes suele cargarse con datos del servidor, y su botón «Descartar cambios» debe volver a **esos** datos. Si los cargas en `value`, `checked` y `select.value`, `reset()` los borra y enseña lo que traía el HTML. Cárgalos también en `defaultValue`, `defaultChecked` y `defaultSelected` (que reescriben los atributos), y `reset()` hará lo que el usuario espera. Un `<button type="reset">` hace lo mismo que `form.reset()`. Y como cualquier cambio por código, `reset()` no dispara `input` ni `change` en los campos: si algo depende de ellos, vuelve a calcularlo después.

## Bestiario

- **La mesa para «21».**
  Síntoma: sumar dos campos numéricos concatena (`'2' + '1'`).
  Causa: `value` es siempre un string, también en `type="number"`.
  Solución: `valueAsNumber` (y comprueba `NaN`); evita `Number(value)` si un campo vacío debe ser un error, porque da `0`.
  → [ver ejemplo](02-value-siempre-es-string.md)
- **La fecha elegida sale un día antes.**
  Síntoma: con `valueAsDate`, `getDate()` o `toLocaleDateString()` muestran el día anterior (en América).
  Causa: `valueAsDate` es la medianoche UTC de ese día, y los métodos locales la convierten a tu zona.
  Solución: usa el string de `value`, o `getUTC*` e `Intl` con `timeZone: 'UTC'`.
  → [ver ejemplo](03-valueasdate-y-el-dia-anterior.md)
- **Todos están suscritos al boletín.**
  Síntoma: una casilla sin marcar se trata como marcada.
  Causa: su `value` es `'on'` (o el de su atributo) y no cambia al marcarla.
  Solución: lee `checked`.
  → [ver ejemplo](04-checkbox-value-es-on.md)
- **Siempre sale el primer radio.**
  Síntoma: `querySelector('[name=size]').value` devuelve la primera opción aunque el usuario eligiera otra.
  Causa: devuelve el primer `<input>` del grupo, y su `value` es fijo.
  Solución: `form.elements.size.value` (el `RadioNodeList`) o `[name=size]:checked`.
  → [ver ejemplo](05-radios-con-form-elements.md)
- **De varias opciones, llega una.**
  Síntoma: en un `<select multiple>`, `value` devuelve solo la primera opción elegida.
  Causa: `value` es una propiedad de valor único.
  Solución: `[...select.selectedOptions].map((option) => option.value)`.
  → [ver ejemplo](06-select-multiple-y-selectedoptions.md)
- **La vista previa va por detrás.**
  Síntoma: lo que se calcula en `change` no se actualiza mientras el usuario escribe.
  Causa: en campos de texto, `change` solo llega al confirmar (salir del campo o Enter).
  Solución: `input` para lo que debe seguir cada tecla.
  → [ver ejemplo](07-input-frente-a-change.md)
- **Relleno el campo y nada se actualiza.**
  Síntoma: tras `campo.value = …`, lo que dependía de `input` o `change` sigue igual.
  Causa: los cambios por código no disparan eventos.
  Solución: `campo.dispatchEvent(new Event('input', { bubbles: true }))` (y `'change'` si hace falta), o llama directamente a la función que recalcula.
  → [ver ejemplo](08-asignar-value-no-avisa.md)
- **«Descartar cambios» borra los datos guardados.**
  Síntoma: `form.reset()` muestra los valores del HTML, no los que se cargaron.
  Causa: `reset()` vuelve a `defaultValue`, `defaultChecked` y `defaultSelected`, los atributos.
  Solución: carga los datos guardados también en esas propiedades.
  → [ver ejemplo](09-reset-vuelve-al-html.md)

## Resumen

- `form.elements.nombre` da cada control; no pongas a un control un nombre como `submit`, `action` o `name`, que tapan las propiedades del formulario.
- `value` es siempre un string; `valueAsNumber` da el número (o `NaN`), y `Number('')` es `0`.
- `valueAsDate` es medianoche UTC: para fechas de calendario, el string de `value`, `getUTC*` o `Intl` con `timeZone: 'UTC'`.
- Casillas: `checked`. Radios: el `value` del `RadioNodeList`. Listas múltiples: `selectedOptions`.
- `beforeinput` → `input` en cada cambio; `change` al confirmar (en el acto en casillas y listas).
- Asignar `value` no dispara eventos: `dispatchEvent` si alguien escucha.
- `reset()` vuelve a los atributos (`default*`), no al último estado guardado.

## Para profundizar

- [MDN: HTMLInputElement (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement)
- [MDN: HTMLFormElement.elements](https://developer.mozilla.org/es/docs/Web/API/HTMLFormElement/elements)
- [javascript.info: propiedades y métodos de formularios](https://es.javascript.info/form-elements)
- [javascript.info: eventos change, input, cut, copy, paste](https://es.javascript.info/events-change-input)
- [MDN: el evento beforeinput (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforeinput_event)
