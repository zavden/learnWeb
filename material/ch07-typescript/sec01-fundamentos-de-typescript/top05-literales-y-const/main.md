# Literales y `as const`

## Por qué importa

Muchos datos no son «un texto cualquiera», sino uno de unos pocos valores: una talla (`'S'`, `'M'`, `'L'`), un estado de pedido, una moneda, un método HTTP. En JavaScript, una errata en uno de esos textos (`'pagado'` en vez de `'paid'`) pasa desapercibida hasta que un `if` deja de cumplirse. TypeScript permite escribir la lista exacta de valores válidos como un tipo. Esta lección enseña cómo (tipos literales, `as const` y los `enum`), y también cómo **saltarse** el verificador con las aserciones `as` y `!`, y por qué casi nunca conviene hacerlo.

## Tipos literales

Un **tipo literal** es un tipo con un único valor posible: el tipo `'M'` solo admite el texto `'M'`, y el tipo `5`, solo el número 5. Solos no sirven de mucho, pero unidos con `|` forman una lista cerrada:

```ts
type Size = 'S' | 'M' | 'L';
type Stars = 1 | 2 | 3 | 4 | 5;
```

[[exercise:01-tipos-literales.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 10: TS2345: Argument of type '"XL"' is not assignable to parameter of type 'Size'.
línea 17: TS2345: Argument of type '6' is not assignable to parameter of type 'Stars'.
// Consola:
2 × playera talla M
1 × playera talla XL
Tlayuda: ★★★★★
⛔ RangeError: Invalid count value: -1
```

Fíjate en cómo escribe TypeScript los literales de texto en los mensajes: con comillas dobles dentro de las simples (`'"XL"'`). Y en la última línea: el 6 no era solo un valor raro, rompía el cálculo de estrellas vacías. Además de detectar valores fuera de la lista, los tipos literales hacen que el editor autocomplete las opciones válidas.

> **Desde Python:** es `Literal["S", "M", "L"]` del módulo `typing`. La diferencia es de estilo: en TypeScript las uniones de literales están por todas partes, en las APIs del navegador incluidas (`'click' | 'keydown' | …`).

Ya viste en la lección 2 de dónde salen los tipos literales: `const method = 'GET'` tiene tipo `'GET'`, y `let method = 'GET'`, tipo `string`. Con los objetos pasa algo que sorprende a todo el mundo la primera vez.

## Las propiedades de un objeto se ensanchan

`const` protege la **variable**, no el objeto: `order.status = 'otro texto'` es válido aunque `order` sea `const`. Por eso TypeScript infiere las propiedades de un objeto como lo haría con un `let`, con el tipo ensanchado:

[[exercise:02-los-objetos-ensanchan.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 10: TS2345: Argument of type 'string' is not assignable to parameter of type 'OrderStatus'.
// Consola:
🐛 true
order.status → perdido en la paquetería
✅ true
```

En ejecución, `order.status` vale `'paid'` y la función devuelve `true`, pero su **tipo** es `string`, y eso no encaja con `OrderStatus`. La solución habitual es anotar el objeto con un tipo que diga que `status` es un `OrderStatus`, como `typedOrder`. La otra es `as const`.

## `as const`

`as const` detrás de un literal (de array, de objeto o de texto) le pide a TypeScript la inferencia **más estrecha posible**: todos los valores como literales, todos los arrays como tuplas, y todo `readonly`, a cualquier profundidad:

```ts
const plainSizes = ['S', 'M', 'L'];     // string[]
const SIZES = ['S', 'M', 'L'] as const;  // readonly ['S', 'M', 'L']
```

[[exercise:03-as-const.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 20: TS2339: Property 'push' does not exist on type 'readonly ["S", "M", "L"]'.
línea 21: TS2540: Cannot assign to 'local' because it is a read-only property.
// Consola:
playera talla S
playera talla M
playera talla L
envío local: $99 MXN
SIZES → (4) ['S', 'M', 'L', 'XL'] | local → 0
```

Lo más útil de `as const` está en la línea `type Size = (typeof SIZES)[number]`: la lista de tallas se escribe **una sola vez**, como un array que existe en ejecución (para recorrerlo o llenar un `<select>`), y el tipo `'S' | 'M' | 'L'` se saca de él. Si mañana añades `'XL'` al array, el tipo cambia solo. La sintaxis `typeof` y `[number]` dentro de un tipo pertenece a los operadores de tipo del módulo 2; de momento, léela como «la unión de los valores de este array».

Y la última línea de la consola repite la lección de `readonly`: `as const` solo existe para el verificador. Si necesitas que el array no cambie en ejecución, `Object.freeze`.

A pesar de su forma, `as const` no es una aserción de las que verás al final de la lección: no le pide a TypeScript que se fíe de ti, solo que infiera de otra manera. Es seguro.

## `enum`

TypeScript tiene una construcción propia para las listas de valores con nombre, `enum`. Es una de las pocas cosas de TypeScript que **genera código**: un `enum` no se borra, sino que se convierte en un objeto de verdad. Este enum numérico (cada miembro vale un número, empezando en 0):

```ts
enum OrderStatus {
  Pending,
  Paid,
  Shipped,
  Delivered,
}
```

se convierte en este JavaScript, que es lo que se ejecuta:

```js
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["Pending"] = 0] = "Pending";
    OrderStatus[OrderStatus["Paid"] = 1] = "Paid";
    OrderStatus[OrderStatus["Shipped"] = 2] = "Shipped";
    OrderStatus[OrderStatus["Delivered"] = 3] = "Delivered";
})(OrderStatus || (OrderStatus = {}));
```

Cada línea hace dos asignaciones a la vez: `OrderStatus["Pending"] = 0` (del nombre al número), y como una asignación devuelve el valor asignado, `OrderStatus[0] = "Pending"` (del número al nombre). Ese segundo sentido se llama **mapeo inverso**, y explica que el objeto tenga 8 claves y no 4:

[[exercise:04-enum-numerico.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 18: TS2322: Type '7' is not assignable to type 'OrderStatus'.
// Consola:
OrderStatus.Paid → 1
OrderStatus → {0: 'Pending', 1: 'Paid', 2: 'Shipped', 3: 'Delivered', Pending: 0, Paid: 1, Shipped: 2, Delivered: 3}
OrderStatus[1] → Paid
claves → 8
🐛 current → 9 | nombre → undefined
```

Desde TypeScript 5.0, asignar un número **literal** que no corresponde a ningún miembro (`current = 7`) es un error. Pero un valor de tipo `number` cualquiera, como uno que llega de una API, se acepta sin protestar, y el resultado es un estado sin nombre. Los enums numéricos tienen este agujero por diseño, para permitir combinaciones de valores con operadores de bits.

Los **enums de texto** asignan a cada miembro un string explícito. No tienen mapeo inverso, y tienen una particularidad: son la gran excepción al tipado estructural de la lección 3.

[[exercise:05-enum-de-texto.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 18: TS2345: Argument of type '"MXN"' is not assignable to parameter of type 'Currency'.
// Consola:
250.00 MXN
Currency.MXN → MXN | string
Currency → {MXN: 'MXN', USD: 'USD', EUR: 'EUR'}
250.00 MXN
✅ 14.50 USD
```

`Currency.MXN` vale `'MXN'` en ejecución, pero el texto `'MXN'` no se acepta donde se pide un `Currency`: para TypeScript, un miembro de un enum de texto solo es compatible consigo mismo. Es intencionado (obliga a escribir `Currency.MXN` en todo el código), pero complica trabajar con los textos que llegan de fuera.

> **Desde Python:** un `enum` numérico se parece a `enum.IntEnum`, y uno de texto a `enum.StrEnum` (o a una clase `Enum` con valores de texto). Como en Python, el enum existe en ejecución y puedes recorrer sus miembros, aunque en TypeScript `Object.keys` de un enum numérico devuelve también los números.

## Alternativas a `enum`

Muchos equipos evitan `enum` y usan las herramientas de los apartados anteriores, que no generan código propio de TypeScript:

[[exercise:06-alternativas-al-enum.md-]]

```text
250.00 MXN
pagado ✅
estado: shipped
todos → (3) ['pending', 'paid', 'shipped']
```

| | `enum` numérico | `enum` de texto | unión de literales | objeto `as const` |
|---|---|---|---|---|
| Existe en ejecución | sí (con mapeo inverso) | sí | no | sí (un objeto normal) |
| Acepta el valor suelto (`'MXN'`) | acepta cualquier `number` | no | sí | sí |
| Se puede recorrer | sí, mezclando nombres y números | sí | no | sí, con `Object.values` |
| Código generado | IIFE especial | IIFE especial | ninguno | el objeto que escribes |

Hay otra razón práctica: cada vez más herramientas ejecutan TypeScript **quitando los tipos sin más**, sin transformar nada. Node.js lo hace con los archivos `.ts` desde 2025, y TypeScript 5.8 añadió la opción `erasableSyntaxOnly` para avisar de todo lo que no se puede quitar así. `enum` es justo lo que esas herramientas no admiten (las *parameter properties* del módulo 3 tampoco). Para código nuevo, una unión de literales, o un objeto `as const` si necesitas los valores en ejecución, es la opción más sencilla.

## Aserciones: `as` y `!`

Una **aserción de tipo** le dice al verificador «yo sé más que tú: trata este valor como de este tipo». Hay dos:

- `valor as Tipo`: cambia el tipo de una expresión.
- `valor!`: quita `null` y `undefined` del tipo (lo viste en la lección 2).

Las dos se **borran** como cualquier tipo. No convierten, no comprueban y no cambian nada en ejecución: solo hacen callar al verificador. Si lo que afirmas es falso, el error que TypeScript habría detectado vuelve, como un `TypeError`, cuando el código se ejecuta.

[[exercise:07-as-miente.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS2352: Conversion of type 'string' to type 'number' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
// Consola:
draft → {}
⛔ TypeError: Cannot read properties of undefined (reading 'toUpperCase')
🐛 fromInput + 50 → 45050
🐛 forced + 50 → 45050
✅ Alebrije → 500
```

`as` tiene un límite: si los dos tipos no tienen nada que ver (`string` y `number`), TypeScript protesta con `TS2352`. Pero el propio mensaje explica cómo saltárselo, pasando antes por `unknown`, y `as unknown as number` compila sin error y falla igual. `as` **no es una conversión**: `'450' as number` sigue siendo el texto `'450'`. Para convertir está `Number()`, y para crear un objeto, escribirlo completo con su anotación.

El `!` tiene el mismo problema con `null` y `undefined`:

[[exercise:08-el-signo-de-exclamacion.md-]]

```text
tla → 120
⛔ TypeError: Cannot read properties of undefined (reading 'price')
✅ Error: No hay ningún platillo con id «pozole»
```

Sin errores de tipos y con un fallo en ejecución cuyo mensaje no dice qué faltaba. La versión segura comprueba y lanza un error con sentido, o devuelve `undefined` y deja que quien llama decida, con el tipo de retorno obligándole a comprobarlo.

¿Hay usos legítimos? Sí, pocos: cuando de verdad sabes algo que TypeScript no puede saber. El caso típico es el DOM: si un `<input id="email">` está escrito en el mismo HTML, `document.querySelector('#email')` nunca será `null`, y TypeScript no sabe que es un `<input>`. Aun así, el módulo 3 enseña formas más seguras (`querySelector<T>` y comprobaciones con `instanceof`). Regla práctica: cada `as` o `!` de tu código es una afirmación que nadie comprueba; si puedes sustituirla por una comprobación real, hazlo.

## Bestiario

- **El valor fuera de la lista.**
  Síntoma: `TS2345: Argument of type '"XL"' is not assignable to parameter of type 'Size'.`
  Causa: el tipo es una unión de literales y el valor no está en ella (o tiene una errata, o mayúsculas distintas).
  Solución: usa un valor de la lista, o amplía la lista si el valor nuevo es válido.
  → [ver ejemplo](01-tipos-literales.md)
- **El objeto `const` con propiedades `string`.**
  Síntoma: `TS2345: Argument of type 'string' is not assignable to parameter of type 'OrderStatus'.` al pasar `order.status`, aunque valga `'paid'`.
  Causa: `const` no protege las propiedades, así que TypeScript las infiere ensanchadas.
  Solución: anota el objeto (`const order: Order = …`) o usa `as const`.
  → [ver ejemplo](02-los-objetos-ensanchan.md)
- **`as const` no congela nada.**
  Síntoma: `TS2339`/`TS2540` en rojo y, en ejecución, el array o el objeto cambian igual.
  Causa: `as const` (como `readonly`) solo existe para el verificador.
  Solución: no ignores esos errores; usa `Object.freeze` si necesitas inmutabilidad en ejecución.
  → [ver ejemplo](03-as-const.md)
- **El enum numérico con un valor sin nombre.**
  Síntoma: un estado que vale `9` y cuyo nombre (`OrderStatus[9]`) es `undefined`, sin ningún error de tipos.
  Causa: cualquier valor de tipo `number` se puede asignar a un enum numérico; solo los literales fuera de rango dan `TS2322`.
  Solución: comprueba los números que llegan de fuera, o usa un enum de texto o una unión de literales.
  → [ver ejemplo](04-enum-numerico.md)
- **El texto que no encaja en su propio enum.**
  Síntoma: `TS2345: Argument of type '"MXN"' is not assignable to parameter of type 'Currency'.`
  Causa: los enums de texto no son estructurales: solo `Currency.MXN` es un `Currency`.
  Solución: usa el miembro del enum, convierte los textos de fuera buscándolos en `Object.values(Currency)`, o cambia el enum por una unión de literales.
  → [ver ejemplo](05-enum-de-texto.md)
- **`as` que miente.**
  Síntoma: un `TypeError` en un código sin errores rojos, o un texto que se concatena aunque su tipo diga `number`; a veces, `TS2352`.
  Causa: `as` cambia el tipo sin convertir ni comprobar nada; `as unknown as` silencia incluso a `TS2352`.
  Solución: convierte con `Number()`, `String()`…, crea los objetos completos con anotación y comprueba los datos de fuera en lugar de afirmarlos.
  → [ver ejemplo](07-as-miente.md)
- **El `!` que no comprueba.**
  Síntoma: `TypeError: Cannot read properties of undefined (reading 'price')` en una línea con `!`.
  Causa: `!` quita `undefined` del tipo, no del valor.
  Solución: comprueba con un `if` y lanza un error que diga qué faltaba, o devuelve `undefined` en el tipo de retorno.
  → [ver ejemplo](08-el-signo-de-exclamacion.md)

## Resumen

- Un tipo literal tiene un solo valor (`'M'`, `5`); una unión de literales es una lista cerrada de valores válidos, como `Literal` en Python.
- `const` da tipos literales a las variables, pero las propiedades de un objeto se ensanchan: anota el objeto o usa `as const`.
- `as const` infiere todo como literal y `readonly`; con `(typeof ARR)[number]` se saca la unión de un array.
- `enum` genera un objeto real; los numéricos tienen mapeo inverso y aceptan cualquier `number`, los de texto no aceptan el texto suelto.
- Alternativas sin código especial: unión de literales, u objeto `as const` si necesitas los valores en ejecución.
- `as` y `!` son aserciones: se borran, no convierten ni comprueban, y si mienten el error vuelve en ejecución.

## Para profundizar

- [Manual de TypeScript: tipos literales (en inglés)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types)
- [Manual de TypeScript: enums (en inglés)](https://www.typescriptlang.org/docs/handbook/enums.html)
- [Manual de TypeScript: aserciones de tipo (en inglés)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)
- [Referencia de tsconfig: erasableSyntaxOnly (en inglés)](https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly)
