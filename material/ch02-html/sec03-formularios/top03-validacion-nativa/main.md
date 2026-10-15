# Validación nativa

## Por qué importa

Antes de enviar un formulario, el navegador puede comprobar que los datos tienen sentido: que no falte nada obligatorio, que un correo tenga forma de correo, que un número esté entre sus límites. Con unos pocos atributos, sin JavaScript, el usuario se entera del error **antes** de esperar la respuesta del servidor, y el campo que falla recibe el foco.

Pero la validación del navegador es una ayuda para quien rellena el formulario, **no una medida de seguridad**. Cualquiera puede quitar un `required` con DevTools o enviar una petición sin pasar por tu página. El servidor tiene que volver a comprobarlo todo. En esta lección verás qué comprueba el navegador, qué no comprueba (más de lo que parece) y cómo el CSS y JavaScript leen el resultado.

## Cómo valida el navegador

Al enviar, el navegador revisa cada control con sus **restricciones** (los atributos que verás en esta lección). Si alguno no las cumple:

1. **cancela el envío**: no hay petición, ni siquiera evento `submit`;
2. lanza un evento `invalid` en cada campo que falla;
3. lleva el **foco** al primero y muestra junto a él un aviso.

Ese aviso tiene limitaciones: aparece de uno en uno, desaparece a los pocos segundos, no se puede cambiar de aspecto y está escrito en el **idioma del navegador**, no en el de la página. Con un Chrome en inglés, una página en español mostrará «Please fill out this field.». En la próxima lección verás cómo sustituirlo por mensajes propios.

No todos los controles se validan: los `disabled`, los `readonly`, los `type="hidden"` y los botones nunca bloquean un envío, tengan los atributos que tengan.

## Campos obligatorios: `required`

`required` (un atributo booleano) obliga a que el campo tenga valor. Su significado depende del control: en un campo de texto, que no esté vacío; en una casilla, que esté marcada; en un grupo de radio, que alguno esté elegido (basta con ponerlo en uno); en un `select`, que la opción elegida no tenga `value=""`, por eso la primera opción suele ser un «Elige una opción» vacío.

[[exercise:01-required.md-]]

Con el formulario vacío no aparece nada en la consola: el envío ni siquiera empieza. Con un Chrome en inglés, los avisos son «Please fill out this field.», «Please select one of these options.», «Please select an item in the list.» y «Please check this box if you want to proceed.». Cuando todo está completo:

```text
Form submitted (navigation blocked in preview): POST https://huerta.example/talleres/inscripcion (application/x-www-form-urlencoded) {full_name: 'Lucía', shift: 'morning', level: 'pots', rules: 'on'}
```

Un lector de pantalla anuncia los campos con `required` como «obligatorio», pero quien ve la pantalla también necesita saberlo antes de enviar: dilo en el texto («Todos los campos son obligatorios», o «(obligatorio)» en cada etiqueta).

## Formatos: `type="email"` y `type="url"`

Algunos tipos traen su propia comprobación de formato, que falla con el motivo `typeMismatch`. Es una comprobación **mínima**, a propósito:

[[exercise:02-email-y-url.md-]]

```text
✅ email ana@huerta.example
✅ email ana@localhost
✅ email ana..lopez@huerta.example
❌ email ana@
❌ email begoña@huerta.example
✅ url   https://huerta.example
❌ url   huerta.example
✅ url   mailto:ana@huerta.example
✅ url   javascript:alert(1)
```

Tres conclusiones. La primera: `type="email"` comprueba la **forma** (algo, una `@`, un dominio), no que el correo exista; `ana@localhost` es válido porque el dominio no necesita punto. La segunda: antes de la `@` solo admite letras **sin tilde**, cifras y unos pocos signos, así que `begoña@…` no pasa, aunque algunos proveedores ya admiten esas direcciones. La tercera: `type="url"` acepta cualquier URL absoluta, incluida `javascript:alert(1)`, así que nunca pongas en un `href` una URL escrita por un usuario sin comprobar su esquema en el servidor.

## Patrones: `pattern`

`pattern` contiene una **expresión regular** que el valor debe cumplir (`patternMismatch` si no). Las expresiones regulares se estudian en el capítulo de JavaScript; para los formularios basta con unas pocas piezas:

| Pieza | Significa | Ejemplo | Lo cumple |
|---|---|---|---|
| `[0-9]` | una cifra | `[0-9][0-9]` | `42` |
| `[A-Z]`, `[a-z]` | una letra mayúscula o minúscula (sin ñ ni tildes) | `[A-Z]` | `B` |
| `{5}`, `{3,20}` | exactamente 5 veces, entre 3 y 20 veces | `[0-9]{5}` | `50001` |
| `?` | lo anterior es opcional | `[0-9]{4} ?[A-Z]{3}` | `1234 BCD`, `1234BCD` |
| `+` | una vez o más | `[a-z]+` | `huerta` |
| `\|` | una cosa u otra | `ES\|PT` | `ES`, `PT` |
| `\-` | un guion literal (dentro de `[ ]`) | `[a-z\-]+` | `san-juan` |

Dos detalles que confunden: el patrón debe cumplirse con el valor **entero** (el navegador añade los anclajes de principio y fin), y distingue mayúsculas de minúsculas.

[[exercise:03-pattern.md-]]

```text
postal_code: '5000' ❌ no cumple [0-9]{5}
member: 'hu-0042' ❌ no cumple HU-[0-9]{4}
```

Al corregir los valores, cada tecla escribe una línea nueva hasta llegar a `postal_code: '50001' ✅ cumple [0-9]{5}`. Explica siempre el formato en una pista **visible**, unida al campo con `aria-describedby` (lo viste en la lección de accesibilidad): el aviso del navegador solo dice «Please match the requested format.», que no ayuda a nadie. El atributo `title` añade su texto a ese aviso en algunos navegadores, pero no sustituye a la pista.

> **Desde Python:** `pattern="[0-9]{5}"` funciona como `re.fullmatch(r"[0-9]{5}", value)`, no como `re.search`: el valor completo debe encajar. La sintaxis básica (clases, cuantificadores, `|`) es la misma que en el módulo `re`.

### Un patrón inválido se ignora

Si el `pattern` no es una expresión regular válida, el navegador lo **ignora** sin avisar en la página (solo escribe una advertencia en la consola de DevTools) y el campo acepta cualquier cosa. Desde 2023, los navegadores compilan `pattern` con el modo `v` de las expresiones regulares, más estricto, y patrones que llevaban años funcionando dejaron de hacerlo. El caso más común es un guion suelto dentro de corchetes, como en `[a-z0-9_-]`: hay que escaparlo, `[a-z0-9_\-]`.

[[exercise:04-pattern-invalido.md-]]

```text
user-bug → pattern [a-z0-9_-]{3,20} · patternMismatch: false
user-ok → pattern [a-z0-9_\-]{3,20} · patternMismatch: true
```

El primer formulario envía «¡Hola, mundo!» como nombre de usuario; el segundo lo rechaza.

## Rangos: `min`, `max` y `step`

En números, fechas y horas, `min` y `max` marcan los límites (`rangeUnderflow` y `rangeOverflow`) y `step` el intervalo entre valores válidos (`stepMismatch`), contado desde `min`. No impiden **escribir** otro valor, pero lo vuelven inválido; las flechas del campo, en cambio, solo producen valores válidos. En las fechas, `min` y `max` se escriben con el formato del valor (`2026-10-13`) y `step` se cuenta en días; en las horas, en segundos (por eso `step="60"` es el valor por defecto de `time`).

[[exercise:05-min-max-step.md-]]

```text
guests = 15 ❌
budget = 62 ❌
check_in = 2026-10-01 ❌
```

## Longitud: `minlength` y `maxlength`

`maxlength` impide escribir más caracteres de los indicados, así que casi nunca produce un error. `minlength` marca como inválido (`tooShort`) un texto más corto, pero con un matiz: solo comprueba lo que **el usuario ha escrito**. Un valor demasiado corto que ya venía en el HTML no cuenta como error hasta que alguien lo edita.

### Un campo vacío es válido

Y el matiz más importante de toda la lección: `type="email"`, `pattern`, `minlength`, `min`… solo comprueban un valor que **existe**. Un campo vacío y opcional es válido, por muchas restricciones que tenga. Si el dato es obligatorio, necesitas `required` además de las otras restricciones.

[[exercise:06-campo-vacio-es-valido.md-]]

```text
Form submitted (navigation blocked in preview): POST https://huerta.example/socios/alta (application/x-www-form-urlencoded) {email: '', postal_code: '', password: ''}
```

Esa línea es del formulario ❌; el ✅ muestra el aviso en el primer campo y no envía nada.

## El estado de validez, en el CSS

El formulario **expone su estado** al CSS mediante pseudoclases, que el navegador activa y desactiva solo, sin JavaScript. Los selectores se estudian a fondo en el primer módulo de CSS; estas son las que pertenecen a los formularios:

| Pseudoclase | Se cumple cuando… |
|---|---|
| `:required`, `:optional` | el campo tiene o no tiene `required` |
| `:valid`, `:invalid` | el valor cumple o no sus restricciones (en cualquier momento) |
| `:user-valid`, `:user-invalid` | igual, pero solo después de que el usuario haya interactuado con el campo o intentado enviar |
| `:in-range`, `:out-of-range` | el valor está dentro o fuera de `min` y `max` |
| `:checked` | una casilla o un radio está marcado (o una opción elegida) |
| `:disabled`, `:enabled` | el control está desactivado o no |
| `:read-write`, `:read-only` | el control se puede editar o no (`readonly`, `disabled`) |
| `:placeholder-shown` | el campo está vacío y muestra su `placeholder` |
| `:focus-visible` | el control tiene el foco y conviene que se vea (teclado) |
| `:default` | el botón de envío por defecto, la opción o casilla marcada de inicio |

`:invalid` tiene un problema: un campo obligatorio vacío ya es inválido, así que un formulario recién abierto aparece lleno de errores. `:user-invalid` espera a que el usuario cambie el campo y salga de él, o a que intente enviar. También `form` y `fieldset` cumplen `:invalid` cuando alguno de sus controles lo hace.

[[exercise:07-valid-invalid-user-invalid.md]]

## Desactivar la validación: `formnovalidate` y `novalidate`

A veces un envío no debe validarse. `formnovalidate` en un botón de envío salta la validación solo para ese botón (un «Guardar borrador» puede estar a medias). `novalidate` en el `<form>` la desactiva del todo: el navegador no comprueba nada al enviar ni muestra avisos. Las restricciones siguen existiendo (`:invalid` y la API de JavaScript las ven), y por eso `novalidate` se usa para mostrar **mensajes propios** en lugar de los del navegador.

[[exercise:08-formnovalidate-y-novalidate.md-]]

```text
Form submitted (navigation blocked in preview): POST https://blog.example/entradas (application/x-www-form-urlencoded) {title: 'Mi primera cosecha de calabazas', summary: '', status: 'draft'}
¿válido? → false
Form submitted (navigation blocked in preview): POST https://blog.example/entradas (application/x-www-form-urlencoded) {title: 'Mi primera cosecha de calabazas', summary: '', status: 'published'}
```

«Publicar» en el primer formulario muestra el aviso y no escribe nada; en el segundo, el formulario se envía aunque `checkValidity()` diga que no es válido.

## La API de validación (adelanto de JavaScript)

Todo lo que el navegador sabe de la validez de un campo está disponible desde JavaScript, que verás en su capítulo:

| Miembro | Qué hace |
|---|---|
| `campo.validity` | un objeto con un indicador por motivo: `valueMissing`, `typeMismatch`, `patternMismatch`, `tooShort`, `tooLong`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`, `badInput`, `customError`, y `valid` |
| `campo.validationMessage` | el aviso que mostraría el navegador, en su idioma |
| `checkValidity()` | devuelve `true` o `false` (y lanza `invalid`), sin mostrar nada; existe en campos y formularios |
| `reportValidity()` | lo mismo, pero muestra el aviso como al enviar |
| `setCustomValidity(texto)` | marca el campo como inválido con tu mensaje; con `''` lo vuelve a dar por bueno |

[[exercise:09-validity.md-]]

```text
nickname = '' → valid: false · valueMissing · «Please fill out this field.»
email = 'ana@' → valid: false · typeMismatch · «Please enter a part following '@'. 'ana@' is incomplete.»
guests = '15' → valid: false · rangeOverflow · «Value must be less than or equal to 12.»
```

Los mensajes salen en inglés porque es el idioma de tu Chrome. Y prueba lo que propone el comentario: al escribir `1e` en un campo numérico, el texto no es un número, el indicador es `badInput` y `value` devuelve una cadena **vacía**. Una página no puede leer lo que hay escrito en un campo numérico si no es un número.

Las restricciones que HTML no puede expresar (que dos campos coincidan, que una fecha sea posterior a otra, que un nombre de usuario esté libre) se añaden con `setCustomValidity`, y entonces el navegador las trata como a las demás:

[[exercise:10-setcustomvalidity.md-]]

```text
checkValidity → false
checkValidity → true
Form submitted (navigation blocked in preview): POST https://huerta.example/cuenta/contrasena (application/x-www-form-urlencoded) {new_password: 'tomates-en-octubre', confirmation: 'tomates-en-octubre'}
```

La primera pulsación de «Comprobar sin enviar» muestra el aviso «Las contraseñas no coinciden.», esta vez en español, porque es tu texto.

## Bestiario

- **El `pattern` no hace nada.** Síntoma: el campo acepta cualquier valor y DevTools muestra una advertencia sobre la expresión regular. Causa: el patrón no es válido (desde 2023, un guion sin escapar dentro de `[ ]` basta) y el navegador lo ignora. Solución: escapa el guion (`\-`) y prueba el patrón con un valor incorrecto. → [ver ejemplo](04-pattern-invalido.md)
- **El formulario se envía vacío.** Síntoma: un campo con `type="email"`, `pattern` o `minlength` llega vacío al servidor. Causa: las restricciones solo comprueban un valor que existe; un campo vacío y opcional es válido. Solución: `required` en los campos obligatorios. → [ver ejemplo](06-campo-vacio-es-valido.md)
- **Un correo con ñ o con tilde no pasa.** Síntoma: `begoña@…` muestra un error de formato. Causa: `type="email"` solo admite caracteres ASCII antes de la `@`. Solución: si tu público usa esas direcciones, `type="text"` con `inputmode="email"` y la comprobación en el servidor. → [ver ejemplo](02-email-y-url.md)
- **Un campo sigue inválido aunque ya está bien.** Síntoma: el aviso propio no desaparece al corregir el valor. Causa: `setCustomValidity` con un texto marca el campo como inválido hasta que lo vacías. Solución: llama a `setCustomValidity('')` cuando el valor sea correcto. → [ver ejemplo](10-setcustomvalidity.md)

## Resumen

- El navegador valida al enviar: si algo falla, cancela el envío, enfoca el primer campo y muestra un aviso en su idioma.
- `required` obliga a tener valor; `type="email"`/`"url"`, `pattern`, `min`/`max`/`step` y `minlength`/`maxlength` comprueban su forma, pero un campo vacío y opcional siempre es válido.
- `pattern` debe cumplirse con el valor entero; si el patrón es inválido, se ignora en silencio.
- `:user-invalid` marca los errores cuando el usuario ya ha interactuado; `:invalid`, desde el primer momento.
- `formnovalidate` y `novalidate` desactivan la validación al enviar, no las restricciones.
- `validity`, `checkValidity`, `reportValidity` y `setCustomValidity` dan acceso a todo desde JavaScript.
- La validación del navegador es comodidad para el usuario; la seguridad está en el servidor.

## Para profundizar

- [MDN: Validación de formularios del lado del cliente](https://developer.mozilla.org/es/docs/Learn/Forms/Form_validation)
- [MDN: ValidityState](https://developer.mozilla.org/es/docs/Web/API/ValidityState)
- [web.dev: Learn Forms (validación)](https://web.dev/learn/forms/validation)
- [MDN: `:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid)
- [V8: el modo `v` de las expresiones regulares](https://v8.dev/features/regexp-v-flag)
