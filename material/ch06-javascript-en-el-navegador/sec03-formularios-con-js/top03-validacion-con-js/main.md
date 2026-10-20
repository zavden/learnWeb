# Validación con JavaScript

## Por qué importa

En la lección «Validación nativa» del capítulo de HTML viste lo que el navegador comprueba solo: `required`, `type="email"`, `pattern`, `min` y `max`… Funciona sin una línea de código, pero tiene límites que se notan enseguida: los avisos salen de uno en uno, desaparecen a los pocos segundos, no se pueden cambiar de aspecto y están en el **idioma del navegador** (en tu Chrome, en inglés), no en el de la página. Tampoco sabe comparar dos campos ni avisar mientras el usuario escribe.

JavaScript no sustituye esa validación: la **completa**. La *Constraint Validation API* te da acceso al mismo motor (el estado de cada campo, sus motivos, sus mensajes) para añadir reglas propias, escribir los errores en tu idioma y en tu diseño, y avisar en el momento justo, también a quien usa un lector de pantalla. Y una regla que no cambia: todo esto es comodidad para quien rellena el formulario; el servidor tiene que volver a comprobarlo todo, porque cualquiera puede saltarse tu JavaScript.

Como en la lección anterior, los ejemplos que envían el formulario se abren con «▶ Run» o en el editor: en las tarjetas de la galería el navegador no envía formularios.

## El estado de cada campo: `validity`

Cada control tiene una propiedad **`validity`**, un objeto `ValidityState` con un indicador booleano por cada motivo de error, y `valid`, que es `true` cuando no hay ninguno:

| Indicador | El campo… | Restricción |
|-----------|-----------|-------------|
| `valueMissing` | está vacío y es obligatorio | `required` |
| `typeMismatch` | no tiene la forma de su tipo | `type="email"`, `type="url"` |
| `patternMismatch` | no cumple el patrón | `pattern` |
| `tooShort`, `tooLong` | es más corto o más largo de lo permitido (solo tras editarlo el usuario) | `minlength`, `maxlength` |
| `rangeUnderflow`, `rangeOverflow` | se sale del rango | `min`, `max` |
| `stepMismatch` | no cae en un escalón | `step` |
| `badInput` | contiene algo que el navegador no puede convertir (`1e` en un número) | el tipo del campo |
| `customError` | tiene un mensaje propio | `setCustomValidity()` |

Junto a `validity` están `validationMessage` (el aviso que mostraría el navegador, en su idioma) y `willValidate` (`false` en los controles que nunca se validan: los `disabled`, los `readonly`, los `type="hidden"` y los botones que no son de envío):

[[exercise:01-validity-campo-a-campo.md-(script.js)]]

```text
❌ runner '' → valueMissing · «Please fill out this field.»
❌ email 'ana@' → typeMismatch · «Please enter a part following '@'. 'ana@' is incomplete.»
❌ age '15' → rangeUnderflow · «Value must be greater than or equal to 16.»
❌ bib 'ana' → patternMismatch · «Please match the requested format.»
form.checkValidity() → false
Listo: corrige los campos uno a uno (Lucía, ana@huerta.mx, 34, ANA)
// Tras escribir «Lucía» en el nombre (la última de sus cinco líneas):
✅ runner 'Lucía' → valid
// Tras añadir «h» al correo:
✅ email 'ana@h' → valid
// Tras cambiar la edad a 34 (con el «3», todavía rangeUnderflow):
❌ age '3' → rangeUnderflow · «Value must be greater than or equal to 16.»
✅ age '34' → valid
```

Fíjate en `ana@h`: para el navegador ya es un correo válido (el dominio no necesita punto), como viste en el capítulo de HTML. La validación nativa comprueba la forma, no que el correo exista. Y fíjate en los mensajes: son útiles para depurar, pero no para enseñárselos a tu usuario hispanohablante; enseguida los sustituirás.

## `checkValidity()` y `reportValidity()`

Los dos métodos existen en cada campo y en el formulario entero, y los dos devuelven `true` o `false`. La diferencia es lo que ve el usuario:

- `checkValidity()` comprueba **en silencio**: nada cambia en la pantalla.
- `reportValidity()` comprueba **y avisa**, como al enviar: muestra el aviso del primer campo inválido y le da el foco.

Los dos disparan además un evento **`invalid`** en cada campo inválido. Es fácil escucharlo mal: `invalid` **no burbujea**, como `focus` (lección «Propagación»), así que un listener en el formulario solo lo oye en la fase de **captura**:

[[exercise:02-checkvalidity-y-reportvalidity.md-(script.js)]]

```text
Listo: pulsa «Comprobar en silencio» y después «Comprobar y avisar»
// Tras pulsar «Comprobar en silencio»:
▶ checkValidity()
   invalid (captura) en email
   invalid (captura) en guests
→ false (nada cambia en la pantalla)
// Tras pulsar «Comprobar y avisar» (aparece «Please fill out this field.» junto al correo):
▶ reportValidity()
   invalid (captura) en email
   invalid (captura) en guests
→ false (aviso y foco en email)
```

La línea `🐛 invalid (burbuja)` no aparece nunca. Llamar a `preventDefault()` en un evento `invalid` impide que el navegador muestre su aviso para ese campo; es otra forma de poner los tuyos, aunque la que verás más abajo (`novalidate`) es más sencilla de controlar.

## Reglas propias: `setCustomValidity`

Hay reglas que HTML no puede expresar: que la fecha de salida sea posterior a la de llegada, que dos contraseñas coincidan, que un nombre de usuario esté libre. **`setCustomValidity(mensaje)`** las añade al motor: con un texto, el campo pasa a ser inválido (`customError`) con ese mensaje, y el navegador lo trata como a cualquier otro error, también al enviar. La trampa: el campo **sigue inválido** hasta que llamas a `setCustomValidity('')`. Si solo lo llamas cuando hay error, el usuario corrige el valor y el formulario no se envía nunca:

[[exercise:03-setcustomvalidity-sin-limpiar.md-(script.js)]]

```text
🐛 salida 2026-11-18 → customError: true · válido: false
✅ salida 2026-11-18 → customError: true · válido: false
Listo: cambia la salida de los dos formularios al 23 de noviembre y pulsa «Reservar»
// Tras elegir el 23 en el calendario de la salida del 🐛:
🐛 salida 2026-11-23 → customError: true · válido: false
// Tras elegir el 23 en el ✅:
✅ salida 2026-11-23 → customError: false · válido: true
// Tras pulsar «Reservar» en el 🐛 (aviso «La salida debe ser posterior a la llegada.», sin submit) y en el ✅:
📨 submit → reserva del 2026-11-20 al 2026-11-23
```

La regla, siempre en una línea: `campo.setCustomValidity(hayError ? mensaje : '')`. Y como los valores que escribe el HTML no disparan eventos, comprueba también al cargar la página. Las fechas se comparan como strings `AAAA-MM-DD`, que ordenan bien y te ahorran el problema de las zonas horarias de la lección anterior.

## Mensajes propios: `novalidate`

Para escribir los errores en tu idioma y en tu diseño, desactiva los avisos del navegador con **`novalidate`** en el `<form>` (capítulo de HTML). Las restricciones siguen ahí: `validity` las sigue calculando. Al enviar, tu script recorre los campos, traduce cada indicador a un mensaje claro y lo coloca junto al campo:

[[exercise:04-novalidate-y-mensajes-propios.md-(index.html|script.js)]]

```text
Listo: pulsa «Reservar»; luego corrige los tres campos y vuelve a pulsar
// Tras pulsar «Reservar»:
📨 submit (con novalidate, el navegador no ha comprobado nada)
❌ email → Escribe tu correo para enviarte la confirmación. (navegador: «Please fill out this field.»)
❌ phone → Escribe las 10 cifras seguidas, sin espacios. (navegador: «Please match the requested format.»)
❌ guests → Reservamos mesas de 1 a 12 personas. (navegador: «Value must be less than or equal to 12.»)
🎯 foco en email
// Tras escribir lucia@ejemplo.mx, 5512345678 y 4, y pulsar «Reservar»:
📨 submit (con novalidate, el navegador no ha comprobado nada)
✅ todo correcto → {"email":"lucia@ejemplo.mx","phone":"5512345678","guests":"4"}
```

Las piezas de accesibilidad son las de la lección «Experiencia de usuario en formularios», ahora conectadas con el código:

- Cada mensaje vive en un párrafo **unido al campo con `aria-describedby`**: un lector de pantalla lo lee al llegar al campo. El párrafo existe siempre (vacío si no hay error), en lugar de crearse y destruirse.
- **`aria-invalid="true"`** marca el campo como erróneo para las tecnologías de apoyo, y el CSS lo usa para el borde: un solo estado, que decide el script.
- El mensaje empieza por «⚠» y dice cómo arreglarlo, no solo que está mal: el color no es la única pista.
- El **foco** va al primer campo con error, y un resumen en una región `role="status"` dice cuántos hay.

Los textos de cada mensaje están en atributos `data-*` del HTML, junto al campo al que pertenecen; el script solo decide cuál toca.

## Validar en vivo sin agobiar

Validar mientras el usuario escribe parece amable, y hecho sin cuidado es lo contrario. Quien escribe `lu@mx` pasa por `l`, `lu` y `lu@`, tres valores inválidos, y un formulario que valida en cada tecla le grita tres errores antes de que termine. Si además el mensaje está en una región `aria-live`, el lector de pantalla interrumpe a la persona en cada pulsación:

[[exercise:05-errores-en-cada-tecla.md-(script.js)]]

```text
Listo: escribe «lu@mx» en el correo, despacio
// Tras escribir «lu@mx» (una línea por tecla; el contador de anuncios acaba en 3):
🐛 'l' → 📢 «Falta la @ del correo.»
🐛 'lu' → 📢 «Falta la @ del correo.»
🐛 'lu@' → 📢 «Falta lo que va después de la @.»
🐛 'lu@m' → sin error
🐛 'lu@mx' → sin error
```

El patrón que funciona tiene un nombre en inglés, ***reward early, punish late***: premiar pronto, castigar tarde.

- **Castigar tarde**: el primer error de un campo aparece cuando el usuario **sale** de él (`focusout`, que burbujea) o al enviar, nunca mientras escribe por primera vez.
- **Premiar pronto**: un campo que ya muestra un error se revisa en **cada tecla** (`input`), para quitar el error en cuanto el valor es correcto.
- **Sin gritar**: los mensajes de cada campo van en `aria-describedby`, no en una región viva. Solo el resumen del envío se anuncia, una vez y con cortesía (`role="status"`, que es `aria-live="polite"`).

[[exercise:06-premiar-pronto-castigar-tarde.md]]

[[exercise:06-premiar-pronto-castigar-tarde.md-(script.js)]]

```text
Listo: escribe «lu» en el correo, pulsa Tab, vuelve y completa «lu@mx»; luego pulsa «Suscribirme»
// Tras escribir «lu» (nada: no se castiga mientras escribes) y pulsar Tab:
❌ email · al salir → «Escribe un correo completo, como lucia@ejemplo.mx.»
// Tras volver con Mayús + Tab y escribir «@mx» (el error se va con la «m»):
✅ email · en vivo → corregido
// Tras pulsar «Suscribirme» con el código postal vacío:
❌ postal_code · al enviar → «Escribe tu código postal.»
📨 submit → 📢 «Revisa 1 campo(s) del formulario.»
```

El código postal vacío no se marcó al pasar por él con Tab: un campo vacío que el usuario no ha tocado no es un error todavía, solo un campo pendiente. Es la misma idea que `:user-invalid` en CSS (capítulo de HTML), llevada al JavaScript.

## Patrones construidos en JavaScript

El atributo `pattern` se puede escribir desde JavaScript, y eso permite construir el patrón a partir de **datos**: los códigos de descuento activos, los prefijos de las sedes, los formatos que acepta tu servidor. Aquí entra todo lo de la lección «Expresiones regulares» del capítulo de JavaScript:

- El navegador compila `pattern` como `^(?:patrón)$` con el **flag `v`**: anclado al valor entero, con la alternancia dentro de un grupo y con las reglas estrictas de `v` dentro de los corchetes.
- El texto que viene de datos puede traer metacaracteres (`.`, `+`, `(`…), así que se escapa con **`RegExp.escape`** (en Chrome desde la versión 136) antes de unirlo con `|`.
- Un `pattern` inválido se ignora **en silencio**. Prueba el patrón con `new RegExp(…, 'v')` antes de asignarlo: el `SyntaxError` sale ahí, con su mensaje.

[[exercise:07-patrones-construidos-en-js.md-(script.js)]]

```text
'ENVIO+GRATIS' → 🐛 false · ✅ true
'BUENXFIN' → 🐛 true · ✅ false
'OTOÑO-10' → 🐛 true · ✅ true
⚠️ patrón rechazado → Invalid regular expression: /^(?:[A-Z0-9_-]{4,12})$/v: Invalid character in character class
pattern = \x4fTOÑO\x2d10|\x42UEN\.FIN|\x45NVIO\+GRATIS
Listo: escribe BUENXFIN y pulsa «Aplicar»; luego escribe BUEN.FIN
// Tras escribir BUENXFIN (la última de sus líneas) y pulsar «Aplicar» (aviso «Please match the requested format.»):
'BUENXFIN' → patternMismatch: true
// Tras borrarlo, escribir BUEN.FIN y pulsar «Aplicar»:
'BUEN.FIN' → patternMismatch: false
📨 cupón BUEN.FIN aplicado
```

Sin escapar, el código `ENVIO+GRATIS` que escribe el cliente, letra a letra, es rechazado (para la regex, `+` significa «la O, una o más veces») y `BUENXFIN` es aceptado (el punto encaja con cualquier carácter). Es el error de la lección de expresiones regulares, ahora con dinero de por medio.

## Filtrar lo que se escribe: `beforeinput`

A veces no basta con avisar: un campo de teléfono no debería admitir letras. En la lección anterior viste el orden `beforeinput` → `input`: **`beforeinput`** llega antes de que cambie el valor y es el único de los dos que se puede cancelar. Su `inputType` dice qué edición está a punto de ocurrir:

| `inputType` | Lo provoca |
|-------------|------------|
| `insertText` | una tecla que escribe (en `data`, el carácter) |
| `insertFromPaste`, `insertFromDrop` | pegar, soltar un texto arrastrado |
| `deleteContentBackward`, `deleteContentForward` | Retroceso, Suprimir |
| `insertCompositionText` | escribir con un IME (japonés, chino, acentos con tecla muerta en algunos sistemas) |
| `historyUndo`, `historyRedo` | Cmd/Ctrl + Z y su contrario |

El filtro ingenuo cancela cualquier inserción que no sean cifras, y castiga justo a quien pega su teléfono tal como lo tiene apuntado, con espacios:

[[exercise:08-beforeinput-y-sus-limites.md-(script.js)]]

```text
Listo: escribe «55a» en cada campo; luego vacíalos y pega 55 1234 5678 en cada uno
// Tras escribir «55a» en el 🐛 y en el ✅ (la «a» no aparece en ninguno):
🐛 insertText '5' → pasa
🐛 insertText '5' → pasa
🐛 insertText 'a' → cancelado
✅ insertText '5' → pasa
✅ insertText '5' → pasa
✅ insertText 'a' → cancelado
// Tras seleccionar todo en el 🐛 (Cmd + A), borrarlo y pegar (el campo se queda vacío):
🐛 deleteContentBackward '' → pasa
🐛 insertFromPaste '55 1234 5678' → cancelado
// Tras hacer lo mismo en el ✅:
✅ deleteContentBackward '' → pasa
✅ insertFromPaste '55 1234 5678' → pasa
✅ input: limpiado a '5512345678'
```

Los límites de `beforeinput`, y por qué el filtro amable solo cancela teclas sueltas:

- **Pegar y arrastrar** traen texto con formato humano (espacios, guiones, paréntesis). Es mejor aceptarlo y **limpiarlo en `input`** con una regex (`/\D/g`) que rechazarlo entero.
- La escritura con un **IME** (`isComposing` es `true`, `inputType` `insertCompositionText`) no se puede cancelar de forma fiable; tocarla rompe la escritura de quien la usa. Déjala pasar.
- Un valor asignado por código no pasa por `beforeinput` (ni por `input`, como viste en la lección anterior).

Por eso un filtro es una ayuda de escritura, nunca la validación: la comprobación definitiva sigue siendo `pattern` (o tu regla) al enviar, y la del servidor.

## Bestiario

- **El campo sigue inválido aunque ya está bien.**
  Síntoma: tras corregir el valor, el formulario no se envía y sigue mostrando el mensaje propio; `validity.customError` es `true`.
  Causa: `setCustomValidity(mensaje)` deja el campo inválido hasta que se llama con `''`.
  Solución: `campo.setCustomValidity(hayError ? mensaje : '')` en cada comprobación, también al cargar.
  → [ver ejemplo](03-setcustomvalidity-sin-limpiar.md)
- **El formulario no oye el evento `invalid`.**
  Síntoma: un listener de `invalid` en el `<form>` no se ejecuta nunca.
  Causa: `invalid` se dispara en cada campo y no burbujea.
  Solución: escúchalo en el formulario con `{ capture: true }`, o en cada campo.
  → [ver ejemplo](02-checkvalidity-y-reportvalidity.md)
- **El formulario grita mientras escribo.**
  Síntoma: el error aparece con la primera letra y el lector de pantalla interrumpe en cada pulsación.
  Causa: validación en `input` desde el principio y mensajes en una región `aria-live`.
  Solución: primer error al salir del campo o al enviar, revisión en vivo solo de los campos ya marcados, mensajes en `aria-describedby` y un único resumen `role="status"`.
  → [ver ejemplo](05-errores-en-cada-tecla.md)
- **El código de descuento correcto no pasa (y uno falso sí).**
  Síntoma: `ENVIO+GRATIS` da `patternMismatch` y `BUENXFIN` no.
  Causa: los códigos se unieron en el `pattern` sin escapar sus metacaracteres.
  Solución: `RegExp.escape` en cada texto; prueba el patrón con `new RegExp('^(?:…)$', 'v')` antes de asignarlo.
  → [ver ejemplo](07-patrones-construidos-en-js.md)
- **No me deja pegar mi teléfono.**
  Síntoma: al pegar un número con espacios o guiones, el campo se queda como estaba.
  Causa: un filtro en `beforeinput` cancela toda inserción con caracteres que no son cifras, también `insertFromPaste`.
  Solución: cancela solo las teclas sueltas (`insertText`), deja pasar lo demás y límpialo en `input`; no toques la composición de un IME; valida al final.
  → [ver ejemplo](08-beforeinput-y-sus-limites.md)

## Resumen

- `validity` da un indicador por motivo de error (`valueMissing`, `typeMismatch`, `patternMismatch`, `rangeOverflow`…) y `valid`; `validationMessage`, el aviso del navegador en su idioma.
- `checkValidity()` comprueba en silencio; `reportValidity()` avisa y enfoca; los dos disparan `invalid`, que no burbujea.
- `setCustomValidity(mensaje)` añade reglas propias; `''` las quita, y hay que llamarlo siempre.
- `novalidate` apaga los avisos del navegador, no las restricciones: tus mensajes van junto al campo, con `aria-describedby` y `aria-invalid`, y el foco al primer error.
- En vivo: castiga tarde (al salir o al enviar), premia pronto (quita el error en cuanto se corrige) y no anuncies cada tecla.
- `pattern` se compila como `^(?:…)$` con el flag `v`: escapa los datos con `RegExp.escape` y prueba el patrón antes de asignarlo.
- `beforeinput` filtra teclas; pegar, arrastrar e IME necesitan limpieza en `input`; la validación final no se negocia (ni la del servidor).

## Para profundizar

- [MDN: Validación de formularios del lado del cliente](https://developer.mozilla.org/es/docs/Learn/Forms/Form_validation)
- [MDN: Constraint Validation API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation)
- [web.dev: Learn Forms, validación (en inglés)](https://web.dev/learn/forms/validation)
- [Smashing Magazine: A Complete Guide To Live Validation UX (en inglés)](https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux/)
- [W3C: Input Events Level 2, los valores de inputType (en inglés)](https://w3c.github.io/input-events/#interface-InputEvent-Attributes)
