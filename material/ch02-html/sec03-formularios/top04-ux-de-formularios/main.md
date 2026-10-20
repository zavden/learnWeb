# Experiencia de usuario en formularios

## Por qué importa

Los formularios son el punto de la web donde más gente **abandona**: en un pago, en un registro, en una solicitud. Cada campo que hay que escribir a mano, cada teclado equivocado en el móvil, cada error que no se entiende cuesta usuarios. Y lo que estorba a cualquiera, a quien usa un lector de pantalla, la voz o un solo dedo le cierra el paso.

La buena noticia es que HTML trae casi todo lo necesario para un buen formulario: el navegador puede rellenarlo solo, elegir el teclado adecuado, unir pistas y errores a cada campo y llevar el foco donde hace falta. Esta lección reúne esas herramientas y los errores de diseño más comunes.

## Autorrelleno: `autocomplete`

El atributo `autocomplete` dice al navegador **qué dato** pide un campo, con un token estándar. Con esa información, Chrome, Safari, Firefox y los gestores de contraseñas rellenan el formulario con un clic. Sin ella, tienen que adivinarlo por el `name` o el texto de la etiqueta, y a menudo fallan.

| Dato | Token |
|---|---|
| nombre completo, nombre de pila, apellidos | `name`, `given-name`, `family-name` |
| correo, teléfono | `email`, `tel` |
| dirección entera (en un `<textarea>`) o por líneas (en campos de una línea) | `street-address`; `address-line1`, `address-line2` |
| localidad, provincia, código postal, país | `address-level2`, `address-level1`, `postal-code`, `country-name` |
| fecha de nacimiento (entera o por partes) | `bday`, `bday-day`, `bday-month`, `bday-year` |
| usuario, contraseña actual, contraseña nueva | `username`, `current-password`, `new-password` |
| código de un solo uso (SMS) | `one-time-code` |
| tarjeta: titular, número, caducidad, código | `cc-name`, `cc-number`, `cc-exp`, `cc-csc` |

Los tokens admiten prefijos de sección para formularios con dos direcciones: `autocomplete="shipping postal-code"` y `autocomplete="billing postal-code"`. `new-password` hace que el gestor de contraseñas proponga una contraseña segura, y `current-password`, que ofrezca la guardada.

[[exercise:01-autocomplete.md-]]

Si tienes una dirección guardada en Chrome y la eliges, todos los campos se rellenan a la vez, se marcan con el contorno verde de `:autofill` y la consola escribe una línea por campo, con tus datos:

```text
full_name (autocomplete="name") → Ana García López
email (autocomplete="email") → ana@correo.es
phone (autocomplete="tel") → 600 123 456
address_line1 (autocomplete="address-line1") → Calle del Olmo, 14
…
```

`autocomplete="off"` pide que no haya sugerencias, pero los navegadores lo ignoran en los campos de inicio de sesión (y a menudo en las direcciones), porque muchas webs lo usaban para impedir los gestores de contraseñas. Resérvalo para datos que no tiene sentido recordar, como el código de una verificación.

## El teclado del móvil: `type`, `inputmode` y `enterkeyhint`

En un móvil, el teclado virtual cambia según el campo. El `type` ya lo elige (`email` muestra la `@`, `tel` el teclado del teléfono), pero a veces el tipo no puede cambiar: un código postal o un código de verificación son **texto** formado por cifras. Para eso existe `inputmode`, que elige el teclado sin cambiar nada más:

| `inputmode` | Teclado |
|---|---|
| `numeric` | solo cifras (códigos, PIN) |
| `decimal` | cifras y separador decimal (importes) |
| `tel` | el del teléfono, con `+`, `*` y `#` |
| `email`, `url` | con `@` y `.`, o con `/` y `.com` |
| `search` | normal, con la tecla Intro como «Buscar» |
| `none` | ninguno (la página muestra su propio teclado) |

`enterkeyhint` cambia el texto o el icono de la tecla Intro: `next` (siguiente campo), `done`, `go`, `search`, `send`, `previous` o `enter`. No cambia lo que hace la tecla, solo lo que anuncia.

[[exercise:02-inputmode-y-enterkeyhint.md-]]

```text
(index)  campo                                inputmode  enterkeyhint
0        Importe (€)                          decimal    next
1        Concepto                             (texto)    next
2        Código que te hemos enviado por SMS  numeric    done
```

En el ordenador no verás ninguna diferencia, ni siquiera con el modo de dispositivo de DevTools, que no dibuja un teclado virtual. Hay que probarlo en un móvil de verdad.

### `type="number"` no es para códigos

Un código postal, un número de tarjeta o un PIN se escriben con cifras, pero no son **cantidades**: no se suman ni tiene sentido «subirlos uno». Con `type="number"` las flechas y la rueda del ratón los cambian sin querer (y desaparecen los ceros iniciales), `maxlength` deja de funcionar y se acepta la letra `e`, porque `1e5` es un número. La solución es un campo de texto con `inputmode="numeric"`:

[[exercise:03-type-number-para-codigos.md-]]

```text
postal-bug: '8002'
postal-bug: '80021'
postal-bug: '800213'
postal-bug: ''
```

La última línea es la `e`: `800213e` no es un número, así que el campo devuelve una cadena vacía (lo viste en la validación con `badInput`). El campo ✅ se queda en `08001`, no pasa de cinco cifras y no reacciona a las flechas.

## `placeholder` no es una etiqueta

`placeholder` muestra un texto de ejemplo dentro del campo vacío. Parece una forma elegante de ahorrarse la etiqueta, y es uno de los errores más extendidos:

- **Desaparece al escribir**: a mitad de un formulario ya no sabes qué pedía cada campo, ni puedes revisar lo que has escrito antes de enviar.
- **Parece un valor**: un campo con `ana@correo.es` en gris puede tomarse por un campo ya relleno.
- **Se lee mal**: el gris por defecto tiene poco contraste, y si lo oscureces se confunde aún más con un valor.
- **No es un nombre fiable**: Chrome lo usa como nombre accesible de último recurso, pero otras tecnologías de asistencia no siempre lo hacen.

[[exercise:04-placeholder-no-es-label.md]]

El fondo amarillo del primer formulario usa `:placeholder-shown`, la pseudoclase de un campo vacío que muestra su placeholder: así se ve que esos campos «rellenos» están en realidad vacíos. La alternativa es una etiqueta siempre visible y, si hace falta un ejemplo, una **pista** unida al campo con `aria-describedby`.

## Decir antes lo que hace falta

Un error que se puede evitar es mejor que el mejor mensaje de error. Antes de que la persona escriba, el formulario debería decirle:

- **Qué es obligatorio y qué no.** Si casi todo es obligatorio, dilo una vez y marca lo opcional con «(opcional)» en la etiqueta. Si usas el asterisco, explícalo al principio del formulario («Los campos con * son obligatorios»).
- **Qué formato se espera**, con un ejemplo en una pista visible: «Por ejemplo, 27 3 1985».
- **Qué requisitos tiene** el valor (una contraseña, un nombre de usuario), antes de escribir y no en el mensaje de error.
- **Para qué** se pide un dato que no parece necesario («Solo te llamaremos si queda libre una parcela»).

[[exercise:05-obligatorios-y-pistas.md]]

Cada pista se une a su campo con `aria-describedby` (lo viste en la lección de accesibilidad), así que un lector de pantalla la lee justo después del nombre del campo. El ancho del campo también informa: `size` o un ancho en CSS parecido a la longitud del dato dicen sin palabras «aquí van cinco cifras».

## Mensajes de error accesibles

Los avisos del navegador cumplen, pero tienen límites: van de uno en uno, desaparecen a los pocos segundos, no se pueden adaptar y salen en el idioma del navegador. Para mostrar mensajes propios se desactiva el aviso con `novalidate` (la validación sigue funcionando) y se muestran los errores en la página. Un buen mensaje de error:

1. **Dice qué pasa y cómo arreglarlo**, en el idioma de la página: «Escribe tu correo completo, con @ y dominio: por ejemplo, ana@correo.es», no «Campo no válido».
2. **Está junto al campo** y unido a él con `aria-describedby`, y el campo lleva `aria-invalid="true"`: al llegar a él, un lector de pantalla anuncia el nombre, «no válido» y el mensaje.
3. **No depende solo del color**: lleva texto y, mejor, un icono.
4. **Aparece en el momento justo**: al enviar (o al salir de un campo ya tocado, como `:user-invalid`), nunca mientras se escribe por primera vez. Una vez mostrado, desaparece en cuanto el valor es correcto.
5. **Lleva el foco** donde hace falta: al primer campo con error o a un resumen de errores.

[[exercise:06-mensajes-de-error-en-linea.md]]

Envía el formulario vacío: los dos mensajes aparecen, el foco salta a «Nombre» y, en el editor, la consola escribe `Campos con error: full_name, email`. Al escribir en un campo marcado, su error se actualiza con cada tecla y desaparece en cuanto el valor es válido. El CSS lee el mismo `aria-invalid` que el lector de pantalla, así que el aspecto y lo que se anuncia no pueden contradecirse.

### Un resumen de errores

En un formulario largo, los errores pueden quedar fuera de la pantalla. Un **resumen** al principio dice cuántos errores hay y enlaza cada uno con su campo. Al enviar, el foco va al resumen (con `tabindex="-1"`, enfocable solo por código), así que un lector de pantalla lo lee entero, y cada enlace lleva el foco a su campo. En formularios largos se combinan el resumen y los mensajes junto a cada campo.

[[exercise:07-resumen-de-errores.md]]

## Agrupar y ordenar

El orden y los grupos de un formulario son parte de su diseño:

- **Una columna**, de arriba abajo: dos campos lado a lado hacen que uno se pase por alto.
- **El orden de una conversación**: primero quién eres, luego qué quieres, al final cómo pagas.
- **Grupos con nombre**: `<fieldset>` y `<legend>` para los campos que van juntos (una dirección, unos datos de contacto).
- **Una pregunta, un grupo**: la `<legend>` es la pregunta («¿Qué tamaño de parcela prefieres?») y los radio, sus respuestas.
- **Las fechas que se saben de memoria** (nacimiento, caducidad) se escriben más rápido en campos cortos que buscándolas en un calendario; las fechas que se eligen (una reserva), con `type="date"`.
- **Pide solo lo necesario**: cada campo opcional que quitas es un motivo menos para abandonar.

[[exercise:08-agrupar-y-preguntar.md]]

## No desactives el botón de enviar

Un patrón muy extendido es desactivar el botón de envío hasta que todo es válido. Parece amable, pero el botón gris no dice **qué** falta, Tab se lo salta (un botón `disabled` no recibe el foco), así que quien usa el teclado o un lector de pantalla ni siquiera lo encuentra, y Enter en un campo no hace nada. Deja el botón siempre activo y, al pulsarlo, di qué falta.

[[exercise:09-boton-desactivado.md]]

En el formulario ❌ no pasa nada al pulsar el botón ni al pulsar Enter, y nada explica que falta marcar la casilla; en el ✅, el navegador lleva el foco a la casilla y lo dice.

## Bestiario

- **El código postal cambia solo.** Síntoma: `08001` se convierte en `8002` al girar la rueda del ratón o pulsar una flecha; se pueden escribir más cifras de las permitidas. Causa: `type="number"` en un dato que no es una cantidad. Solución: `inputmode="numeric"` con `pattern` y `maxlength`. → [ver ejemplo](03-type-number-para-codigos.md)
- **«¿Qué iba en este campo?»** Síntoma: al escribir desaparece la única indicación; los campos vacíos parecen rellenos. Causa: un `placeholder` en lugar de un `<label>`. Solución: etiqueta siempre visible y el ejemplo en una pista con `aria-describedby`. → [ver ejemplo](04-placeholder-no-es-label.md)
- **El botón de enviar no hace nada.** Síntoma: el botón está gris, Tab se lo salta y no se sabe por qué. Causa: se desactivó hasta que el formulario fuera válido. Solución: botón siempre activo y errores explícitos al pulsarlo. → [ver ejemplo](09-boton-desactivado.md)

## Resumen

- `autocomplete` con tokens estándar (`name`, `email`, `postal-code`, `new-password`…) permite rellenar el formulario con un clic.
- `inputmode` elige el teclado virtual sin cambiar el tipo; `enterkeyhint`, el texto de la tecla Intro. `type="number"` solo para cantidades.
- El `placeholder` no sustituye al `<label>`: etiqueta visible y pista con `aria-describedby`.
- Di antes de escribir qué es opcional, qué formato se espera y qué requisitos hay.
- Errores propios: mensaje útil junto al campo, `aria-describedby` + `aria-invalid`, no solo color, el foco en el primer error o en un resumen.
- Una columna, el orden de una conversación, grupos con `<fieldset>` y `<legend>`, y el botón de envío siempre activo.

## Para profundizar

- [MDN: el atributo `autocomplete`](https://developer.mozilla.org/es/docs/Web/HTML/Attributes/autocomplete)
- [web.dev: Sign-in form best practices](https://web.dev/articles/sign-in-form-best-practices)
- [W3C WAI: Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- [GOV.UK Design System: Error message y Error summary](https://design-system.service.gov.uk/components/error-summary/)
- [Nielsen Norman Group: Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/)
