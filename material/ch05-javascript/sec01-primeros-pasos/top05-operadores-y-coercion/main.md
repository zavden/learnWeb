# Operadores y coerción

## Por qué importa

Python es estricto con los tipos: `'5' + 3` lanza un `TypeError` y te obliga a decidir. JavaScript nació para que los formularios de los años 90 «funcionaran sin más», así que **convierte los tipos por su cuenta** cuando un operador no recibe lo que espera. Esa conversión automática se llama **coerción**. No es magia ni azar: sigue unas pocas reglas fijas. Si las conoces, puedes predecir cada resultado «absurdo» de esta lección; y si escribes las conversiones de forma explícita, no tendrás que predecir nada.

## Aritmética

Los operadores aritméticos son casi los de Python: `+`, `-`, `*`, `/` (siempre con decimales), `%` y `**`. Hay `++` y `--` para sumar o restar 1, que Python no tiene. Y faltan dos cosas: la división entera `//` (ya viste que es un comentario) y el `%` de Python, que con negativos da otro resultado:

[[exercise:01-aritmetica-y-resto.md-]]

> **Desde Python:** el `%` de Python es un **módulo** (el resultado lleva el signo del divisor: `-7 % 3 == 2`) y el de JavaScript es un **resto** (signo del dividendo: `-7 % 3 === -1`). Si lo usas para dar la vuelta a un índice circular, en JavaScript necesitas `((i % n) + n) % n`. Otra diferencia pequeña: `-2 ** 2` es `-4` en Python y un `SyntaxError` en JavaScript, que te obliga a escribir `(-2) ** 2` o `-(2 ** 2)`.

## El `+` con strings

`+` es el único operador aritmético con dos trabajos: suma números y concatena strings. La regla es simple y despiadada: **si cualquiera de los dos operandos es un string, concatena**. Los demás operadores (`-`, `*`, `/`, `%`) solo saben trabajar con números, así que convierten sus operandos a número:

[[exercise:02-mas-con-strings.md-]]

Este error es frecuentísimo porque **todo lo que entra a una página es texto**: el `value` de un `<input>`, los parámetros de la URL, lo que devuelve `prompt()`, el contenido de un archivo. Convierte a número en cuanto recibas el dato (`Number(valor)`), no en el momento de sumar.

## Las tres conversiones

Toda la coerción de JavaScript se apoya en tres conversiones internas. Las puedes invocar tú mismo con `Number()`, `String()` y `Boolean()` (sin `new`):

| Conversión | La usan… | Para hacerla tú |
|------------|----------|-----------------|
| ToNumber | `-`, `*`, `/`, `%`, `<`, `>`, `==` entre tipos distintos, `+` unario | `Number(x)` o `+x` |
| ToString | `+` con un string, plantillas `` `${x}` `` | `String(x)` |
| ToBoolean | `if`, `while`, `!`, `&&`, `\|\|`, `? :` | `Boolean(x)` o `!!x` |

Los objetos (y los arrays) primero se convierten a primitivo: el motor llama a su `valueOf()` y, si eso no devuelve un primitivo, a su `toString()`. Para un array, `toString()` une sus elementos con comas, así que `[]` se convierte en `''` y `[7]` en `'7'`. Eso explica casi todas las rarezas de la tabla de `Number()`:

[[exercise:03-convertir-a-numero.md-]]

Observa que Python prefiere lanzar `ValueError` o `TypeError`, mientras que JavaScript siempre devuelve un número… o `NaN`. Y los casos más traicioneros son los que dan `0` sin quejarse: el string vacío, un string de espacios, `null` y el array vacío.

## Igualdad: `===` frente a `==`

JavaScript tiene dos operadores de igualdad (y sus negaciones, `!==` y `!=`):

- **`===` (estricta)**: devuelve `true` solo si los dos valores tienen el mismo tipo y el mismo valor. Nunca convierte.
- **`==` (laxa)**: si los tipos son distintos, convierte siguiendo un algoritmo y después compara.

El algoritmo de `==`, simplificado:

1. Si los tipos coinciden, compara como `===`.
2. `null == undefined` es `true`, y ninguno de los dos es `==` a nada más.
3. Número frente a string: el string se convierte a número.
4. Booleano frente a cualquier cosa: el booleano se convierte a número (`true` → 1, `false` → 0).
5. Objeto frente a primitivo: el objeto se convierte a primitivo y se vuelve a empezar.

Con esas cinco reglas sale cada fila de esta tabla, incluidas las absurdas:

[[exercise:04-igualdad-estricta-y-laxa.md-]]

Por ejemplo, `[] == false`: por la regla 4, `false` pasa a `0`; por la regla 5, `[]` pasa a `''`; por la regla 3, `''` pasa a `0`; y `0 == 0` es `true`. Nadie quiere hacer ese cálculo cada vez que lee un `==`, así que la regla de la industria es **usar siempre `===` y `!==`**. La única excepción aceptada es `x == null`, que es una forma corta de preguntar «¿es `null` o `undefined`?».

> **Desde Python:** el `==` de Python compara valores sin convertir tipos entre sí (salvo entre números: `1 == 1.0`) y con listas y diccionarios compara el **contenido**. El `===` de JavaScript se parece más al `==` de Python con primitivos, y al `is` con objetos.

Y un caso especial: `NaN` no es igual a nada, ni siquiera a sí mismo. Lo verás a fondo (junto con `Object.is` y `-0`) en el módulo «Números, texto y colecciones».

## Truthy y falsy

Cuando un valor se usa como condición, se convierte a booleano con ToBoolean. Solo hay **ocho valores falsy**: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` y `NaN`. Todo lo demás es truthy, incluidos los strings `'0'` y `'false'`, el array vacío y el objeto vacío:

[[exercise:05-truthy-y-falsy.md-]]

> **Desde Python:** en Python los contenedores vacíos (`[]`, `{}`, `set()`) son falsos y el idioma `if items:` significa «si hay elementos». En JavaScript **todos los objetos son truthy**, estén vacíos o no. Pregunta lo que de verdad quieres saber: `items.length > 0` para arrays y strings, `Object.keys(obj).length > 0` para objetos.

## Operadores lógicos

`&&`, `||` y `!` son los `and`, `or` y `not` de Python, con el mismo comportamiento de fondo: `&&` y `||` **devuelven uno de sus operandos** (no necesariamente un booleano) y **cortocircuitan**: si el primer operando decide el resultado, el segundo ni se evalúa.

[[exercise:06-and-or-devuelven-operandos.md-]]

| Expresión | Devuelve |
|-----------|----------|
| `a \|\| b` | `a` si `a` es truthy; si no, `b` |
| `a && b` | `a` si `a` es falsy; si no, `b` |
| `!a` | `true` o `false` (siempre booleano) |

### `??`: valor por defecto solo para «nada»

Durante años, el patrón para dar un valor por defecto fue `valor || porDefecto`. Funciona… hasta que el valor legítimo es `0`, `''` o `false`, que también son falsy. El operador `??` (*nullish coalescing*) solo recurre al valor por defecto cuando el de la izquierda es `null` o `undefined`:

[[exercise:07-or-frente-a-nullish.md-]]

Regla práctica: para valores por defecto, usa `??`. Reserva `||` para cuando de verdad quieras tratar `0` y `''` como «vacío».

### `?.`: leer sin romperse

En la lección anterior viste que JavaScript devuelve `undefined` en lugar de lanzar `KeyError`. Pero si intentas leer una propiedad **de** ese `undefined` (o de `null`), sí obtienes un `TypeError`. El *optional chaining* `?.` corta la cadena en cuanto encuentra `null` o `undefined` y devuelve `undefined`:

[[exercise:08-encadenamiento-opcional.md-]]

Funciona con propiedades (`a?.b`), con corchetes (`a?.[i]`) y con llamadas (`a.f?.()`). Combinado con `??` cubre el caso típico de datos opcionales: `user.address?.city ?? 'sin dirección'`.

## Comparaciones

`<`, `>`, `<=` y `>=` comparan números o, si los dos operandos son strings, los comparan alfabéticamente (por códigos de carácter, igual que Python). Si hay un string y un número, convierten a número. Y no hay comparaciones encadenadas:

[[exercise:09-comparaciones-encadenadas.md-]]

> **Desde Python:** `18 <= age <= 65` es en Python una forma corta de `18 <= age and age <= 65`. En JavaScript es `(18 <= age) <= 65`: el primer resultado (`true` o `false`) se convierte en `1` o `0` y se compara con 65, así que la expresión es `true` para **cualquier** edad. No hay error ni aviso.

El último caso del ejemplo muestra que `==` y los relacionales no siguen las mismas reglas: `null >= 0` es `true` (el relacional convierte `null` a `0`), pero `null == 0` es `false` (la regla 2 de `==` no convierte `null`). Otra razón para no comparar con valores que pueden ser `null` sin comprobarlo antes.

## Ternario y asignación lógica

El **operador ternario** `condición ? a : b` es el `a if condición else b` de Python, con el orden cambiado: la condición va primero. Es una expresión, así que cabe dentro de una plantilla o de un argumento.

Las **asignaciones lógicas** `??=`, `||=` y `&&=` abrevian el patrón «asigna solo si…»:

[[exercise:10-ternario-y-asignacion-logica.md-]]

## Precedencia

Cuando mezclas operadores, se aplican de mayor a menor precedencia. Lo esencial (de más a menos):

| Nivel | Operadores |
|-------|------------|
| Agrupación y acceso | `( )`, `.`, `?.`, `[ ]`, llamadas `f()` |
| Unarios | `!`, `+x`, `-x`, `++`, `--`, `typeof` |
| Potencia | `**` (asocia por la derecha) |
| Multiplicativos | `*`, `/`, `%` |
| Aditivos | `+`, `-` |
| Relacionales | `<`, `>`, `<=`, `>=` |
| Igualdad | `===`, `!==`, `==`, `!=` |
| Lógicos | `&&`, luego `\|\|` y `??` |
| Ternario | `? :` |
| Asignación | `=`, `+=`, `??=`… |

Ante la duda, paréntesis: no cuestan nada y el siguiente que lea tu código te lo agradecerá.

## Bestiario

- **`'5' + 3` da `'53'`.**
  Síntoma: una «suma» que concatena (`'2' + 1` → `'21'`).
  Causa: con un string en cualquiera de los lados, `+` concatena.
  Solución: convierte a número al recibir el dato: `Number(valor)`.
  → [ver ejemplo](02-mas-con-strings.md)
- **El resto negativo.**
  Síntoma: `-7 % 3` da `-1` y un índice circular se sale del rango.
  Causa: el `%` de JavaScript conserva el signo del dividendo.
  Solución: `((i % n) + n) % n`.
  → [ver ejemplo](01-aritmetica-y-resto.md)
- **`==` y sus resultados absurdos.**
  Síntoma: `[] == false` es `true`, `'' == 0` es `true`, y `==` no es transitiva.
  Causa: `==` convierte los operandos con reglas que encadenan conversiones.
  Solución: usa siempre `===` y `!==` (excepción: `x == null`).
  → [ver ejemplo](04-igualdad-estricta-y-laxa.md)
- **El array vacío que pasa el `if`.**
  Síntoma: `if (items)` entra aunque `items` sea `[]`; `'0'` también es «verdadero».
  Causa: todos los objetos son truthy; solo hay ocho valores falsy.
  Solución: `items.length > 0`.
  → [ver ejemplo](05-truthy-y-falsy.md)
- **El valor por defecto que pisa el 0.**
  Síntoma: un volumen `0` se convierte en `50` con `volume || 50`.
  Causa: `||` trata `0`, `''` y `false` como «vacío».
  Solución: `volume ?? 50`.
  → [ver ejemplo](07-or-frente-a-nullish.md)
- **La comparación encadenada que siempre es `true`.**
  Síntoma: `18 <= age <= 65` es `true` con `age = 70`.
  Causa: se evalúa como `(18 <= age) <= 65`, con el booleano convertido en número.
  Solución: `18 <= age && age <= 65`.
  → [ver ejemplo](09-comparaciones-encadenadas.md)
- **`null >= 0` es `true` pero `null == 0` es `false`.**
  Síntoma: comparaciones con `null` que se contradicen.
  Causa: los relacionales convierten `null` a `0`; `==` no.
  Solución: comprueba `null` explícitamente antes de comparar.
  → [ver ejemplo](09-comparaciones-encadenadas.md)

## Resumen

- JavaScript convierte tipos automáticamente (coerción) con tres conversiones: ToNumber, ToString y ToBoolean.
- `+` concatena si hay un string; `-`, `*`, `/` y `%` siempre convierten a número.
- `Number('')`, `Number(null)` y `Number([])` son `0`; `Number('42px')` es `NaN`.
- Usa `===` y `!==`; `==` convierte con reglas que producen resultados absurdos.
- Solo ocho valores son falsy; `[]`, `{}` y `'0'` son truthy.
- `&&` y `||` devuelven un operando y cortocircuitan; `??` da un valor por defecto solo para `null` y `undefined`; `?.` lee propiedades sin romperse.
- No hay comparaciones encadenadas: `a < b && b < c`.

## Para profundizar

- [MDN: expresiones y operadores](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Expressions_and_operators)
- [MDN: comparaciones de igualdad e identidad](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- [MDN: coerción de tipos (glosario)](https://developer.mozilla.org/es/docs/Glossary/Type_coercion)
- [javascript.info: conversiones de tipos](https://es.javascript.info/type-conversions)
- [javascript.info: operador nullish coalescing](https://es.javascript.info/nullish-coalescing-operator)
