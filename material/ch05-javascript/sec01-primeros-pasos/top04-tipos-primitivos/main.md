# Tipos primitivos

## Por qué importa

Como Python, JavaScript es de **tipado dinámico**: las variables no tienen tipo, los valores sí. Pero el catálogo de tipos es distinto: hay un solo tipo para todos los números, dos valores «vacíos» en lugar de `None`, un tipo que Python no tiene (`symbol`) y un operador, `typeof`, con un error histórico que nunca se corregirá. Conocer bien los tipos es la base de la lección siguiente, donde verás cómo JavaScript los convierte entre sí sin pedir permiso.

## Siete primitivos y los objetos

Un **primitivo** es un valor simple e inmutable, que no es un objeto. JavaScript tiene siete tipos primitivos; todo lo demás (arrays, funciones, fechas, objetos literales…) es un **objeto**.

| Tipo | Ejemplos | Equivalente en Python |
|------|----------|-----------------------|
| `number` | `42`, `3.14`, `-0`, `Infinity`, `NaN` | `int` y `float` a la vez |
| `bigint` | `10n`, `2n ** 64n` | `int` (sin límite) |
| `string` | `'hola'`, `"hola"`, `` `hola ${x}` `` | `str` |
| `boolean` | `true`, `false` | `bool` (`True`, `False`) |
| `undefined` | `undefined` | — (lo más parecido es `None`) |
| `null` | `null` | `None` |
| `symbol` | `Symbol('id')` | — |
| *objeto* | `{ a: 1 }`, `[1, 2]`, `function () {}` | `dict`, `list`, funciones, instancias… |

## El operador `typeof`

`typeof valor` devuelve un **string** con el nombre del tipo. Es un operador (como `not` en Python), no una función, así que no necesita paréntesis:

[[exercise:01-typeof-de-cada-tipo.md-]]

> **Desde Python:** `type(x)` devuelve la clase del valor y distingue `list` de `dict`. `typeof` es mucho más grueso: casi todo lo que no es primitivo da `'object'`. Para saber si algo es un array se usa `Array.isArray(x)`; para saber si es una instancia de una clase, `instanceof` (lo usarás en la lección de errores y lo entenderás por dentro en «Objetos y prototipos»).

### `typeof null` es `'object'`

El resultado más famoso de la tabla es un error. En la primera implementación de JavaScript (1995), cada valor se guardaba con una etiqueta de tipo en sus bits bajos; la etiqueta de los objetos era `0`, y `null` se representaba como el puntero nulo: todo ceros. Así que `typeof null` leía la etiqueta `0` y respondía `'object'`. Hubo una propuesta para corregirlo, pero rompía demasiadas webs y se descartó.

[[exercise:02-typeof-null.md-]]

La consecuencia práctica: `typeof x === 'object'` no garantiza que puedas leer propiedades de `x`. Para detectar `null`, compara directamente: `x === null`.

## `number`: un solo tipo para todos los números

No hay `int` y `float` separados: todos los números son decimales de 64 bits en formato IEEE-754 (el mismo formato que el `float` de Python). `5` y `5.0` son exactamente el mismo valor. Esto tiene consecuencias que sorprenden viniendo de Python:

[[exercise:03-un-solo-tipo-number.md-]]

| Operación | Python | JavaScript |
|-----------|--------|------------|
| `7 / 2` | `3.5` | `3.5` |
| `1 / 0` | `ZeroDivisionError` | `Infinity` |
| `0 / 0` | `ZeroDivisionError` | `NaN` |
| `'hola' * 2` | `'holahola'` | `NaN` |
| `2 ** 53 + 1` | `9007199254740993` | `9007199254740992` (se pierde el `+1`) |

`NaN` («Not a Number») es el resultado de una operación numérica sin sentido, y aunque su nombre diga lo contrario, es de tipo `number`. Las rarezas de los decimales (`0.1 + 0.2`), de `NaN` y de `-0` tienen su propia lección en el módulo «Números, texto y colecciones».

## `bigint`: enteros sin límite

Si necesitas enteros exactos más allá de `2 ** 53` (identificadores de 64 bits, criptografía, factoriales grandes), usa `bigint`: un entero de tamaño arbitrario, como el `int` de Python, que se escribe con una `n` al final. No se mezcla con `number` en la aritmética: hay que convertir de forma explícita.

[[exercise:04-bigint.md-]]

## `string`: texto inmutable

Los strings se escriben con comillas simples, dobles o invertidas (*backticks*). Las invertidas son las **plantillas** (*template literals*): admiten `${expresión}` dentro, como las f-strings, y pueden ocupar varias líneas. No existe un tipo «carácter»: `'hola'[0]` es otro string, de longitud 1.

Como en Python, los strings son **inmutables**: ningún método los modifica, todos devuelven un string nuevo. La diferencia está en qué pasa si intentas cambiar un carácter:

[[exercise:05-strings-inmutables.md-]]

> **Desde Python:** `s[0] = "p"` lanza `TypeError: 'str' object does not support item assignment`. En JavaScript, en un script clásico, la asignación **se ignora sin avisar**. Solo en modo estricto lanza un `TypeError`. Es el primer ejemplo de una idea que verás muchas veces: el JavaScript antiguo prefería seguir adelante antes que fallar.

## `boolean`

`true` y `false`, en minúsculas. Lo interesante de los booleanos no es el tipo en sí, sino cómo convierte JavaScript cualquier valor a booleano cuando lo usas en un `if` (*truthy* y *falsy*): lo verás en la lección siguiente, y hay sorpresas.

## `undefined` y `null`: dos formas de «nada»

Python tiene `None`. JavaScript tiene dos valores vacíos con intenciones distintas:

- **`undefined`**: «aquí todavía no hay valor». Normalmente lo produce el motor.
- **`null`**: «aquí no hay valor, a propósito». Lo escribes tú.

[[exercise:06-null-y-undefined.md-]]

| Situación | Python | JavaScript |
|-----------|--------|------------|
| Variable declarada sin valor | (no existe esa situación) | `undefined` |
| Propiedad o clave que no existe | `KeyError` / `AttributeError` | `undefined` |
| Índice fuera de rango | `IndexError` | `undefined` |
| Función sin `return` | `None` | `undefined` |
| Argumento que no se pasó | `TypeError` | `undefined` |
| «Vacío a propósito» | `None` | `null` |

Fíjate en la tabla: donde Python lanza una excepción, JavaScript muchas veces devuelve `undefined` y sigue. Es cómodo, pero significa que un error de escritura (`user.emial`) no avisa: el `undefined` viaja por tu programa hasta romper algo lejos de su origen. En la lección siguiente verás `?.` y `??`, las herramientas para manejar estos vacíos.

## `symbol`: identificadores únicos

Un `symbol` es un valor único: dos símbolos creados con la misma descripción son distintos. Su uso principal es servir de clave de propiedad sin riesgo de chocar con ninguna otra. El propio lenguaje los usa para sus protocolos internos (`Symbol.iterator` es lo que hace que `for…of` funcione).

[[exercise:07-symbol.md-]]

## Primitivos frente a objetos

La diferencia de fondo entre un primitivo y un objeto aparece al copiar y al comparar:

- Los primitivos se comparan **por valor**: dos strings con el mismo texto son iguales.
- Los objetos se comparan **por identidad**: `===` pregunta si son *el mismo objeto*, no si tienen el mismo contenido.
- Asignar un objeto a otra variable no lo copia: las dos variables apuntan al mismo objeto.

[[exercise:08-primitivo-vs-objeto.md-]]

> **Desde Python:** el modelo de memoria es el mismo que ya conoces (nombres que apuntan a objetos). Lo que cambia es el operador: en Python `[1, 2] == [1, 2]` es `True` porque `==` compara el contenido, y para la identidad usas `is`. En JavaScript, `===` con objetos se comporta como `is`, y no hay un operador para comparar contenido.

## Métodos en primitivos: los envoltorios

Si los primitivos no son objetos, ¿cómo es posible `'hola'.toUpperCase()`? Cuando pides una propiedad a un primitivo, el motor crea al vuelo un **objeto envoltorio** (`String`, `Number`, `Boolean`, `BigInt`, `Symbol`), busca el método en él y lo descarta. `null` y `undefined` no tienen envoltorio, por eso `null.x` lanza un `TypeError`.

[[exercise:09-envoltorios.md-]]

Nunca crees envoltorios con `new String(…)`, `new Number(…)` o `new Boolean(…)`: obtienes objetos que se parecen a primitivos pero se comparan y se comportan como objetos. Para **convertir** un valor, llama a la función sin `new`: `String(42)`, `Number('42')`.

## Bestiario

- **`typeof null === 'object'`.**
  Síntoma: un valor que «es un objeto» según `typeof` lanza `Cannot read properties of null`.
  Causa: error histórico de la primera implementación, conservado por compatibilidad.
  Solución: comprueba `x === null` aparte; para arrays, `Array.isArray(x)`.
  → [ver ejemplo](02-typeof-null.md)
- **El carácter que no cambia.**
  Síntoma: `word[0] = 'p'` no hace nada y no hay error.
  Causa: los strings son inmutables y, fuera del modo estricto, la asignación se ignora en silencio.
  Solución: crea un string nuevo (`'p' + word.slice(1)`) y reasigna la variable.
  → [ver ejemplo](05-strings-inmutables.md)
- **Dos arrays iguales que no son iguales.**
  Síntoma: `[1, 2] === [1, 2]` es `false`.
  Causa: los objetos se comparan por identidad, no por contenido.
  Solución: compara el contenido elemento a elemento (o con `JSON.stringify` en casos simples).
  → [ver ejemplo](08-primitivo-vs-objeto.md)
- **El string que no es un string.**
  Síntoma: `typeof new String('a')` es `'object'` y `new String('a') === 'a'` es `false`.
  Causa: `new` crea un objeto envoltorio permanente.
  Solución: no uses `new` con `String`, `Number` ni `Boolean`; para convertir, llámalas sin `new`.
  → [ver ejemplo](09-envoltorios.md)

## Resumen

- Siete primitivos: `number`, `bigint`, `string`, `boolean`, `undefined`, `null` y `symbol`; todo lo demás es objeto.
- `typeof` devuelve un string; `typeof null` es `'object'` (error histórico) y los arrays también dan `'object'`.
- Un solo `number` para enteros y decimales: dividir entre cero da `Infinity` o `NaN`, no un error; los enteros son exactos hasta `2 ** 53`.
- `bigint` para enteros sin límite; no se mezcla con `number`.
- Los strings son inmutables; fuera del modo estricto, modificarlos se ignora en silencio.
- `undefined` = «todavía no hay valor»; `null` = «vacío a propósito».
- Primitivos por valor, objetos por identidad: `===` con objetos es el `is` de Python.

## Para profundizar

- [MDN: tipos de datos y estructuras de datos en JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Data_structures)
- [MDN: typeof](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/typeof)
- [javascript.info: tipos de datos](https://es.javascript.info/types)
- [javascript.info: métodos en tipos primitivos](https://es.javascript.info/primitives-methods)
- [Axel Rauschmayer: la historia de `typeof null`](https://2ality.com/2013/10/typeof-null.html)
