# Uniones y estrechamiento

## Por qué importa

En JavaScript es normal que un valor pueda ser de varios tipos: un número de pedido antiguo o un código nuevo, un elemento o `null`, una canción o un pódcast, un pago con tarjeta, en efectivo o por transferencia. TypeScript lo expresa con **uniones** (`string | number`), y luego hace algo muy útil: sigue los `if`, `switch` y `return` de tu código para saber, en cada línea, cuál de esos tipos puede tener el valor. Eso se llama **estrechamiento** (*narrowing*), y es lo que permite usar uniones sin llenar el código de comprobaciones inútiles. Las uniones discriminadas que verás al final son, probablemente, la herramienta de modelado más útil de TypeScript.

## Uniones

Una **unión** `A | B` es el tipo de los valores que son `A` **o** `B`. Ya has visto algunas: `string | null` en la lección 2, `'GET' | 'POST'`, `(string | number)[]`. Una unión admite cualquier valor de sus miembros, pero solo deja **usar** lo que tienen todos ellos en común:

[[exercise:01-uniones.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 8: TS2339: Property 'toUpperCase' does not exist on type 'string | number'.
  Property 'toUpperCase' does not exist on type 'number'.
línea 20: TS2345: Argument of type 'boolean' is not assignable to parameter of type 'string | number'.
// Consola:
#1042 #web-2026-001
string → WEB-2026-001
⛔ number → TypeError: ref.toUpperCase is not a function
#true
refs → #1042 #web-2026-001 #1043
```

El primer mensaje tiene dos líneas: la general («`toUpperCase` no existe en `string | number`») y, sangrada, la razón concreta («no existe en `number`»). Es la forma de razonar de TypeScript con las uniones: una operación es válida solo si lo es para **cada** miembro. `toString` funciona porque existe en los dos; `toUpperCase`, solo en uno. Y el `TypeError` de la consola es justo el fallo que el error de tipos anunciaba.

> **Desde Python:** `string | number` es `str | int` (o `Union[str, int]`). mypy razona igual: sobre un `str | int` solo deja usar lo que tienen los dos tipos.

## Estrechar con `typeof`

Para usar lo que solo tiene uno de los miembros, primero hay que comprobar cuál es. La comprobación es JavaScript de toda la vida, `typeof ref === 'string'`, y TypeScript la entiende: dentro del `if`, `ref` es `string`.

[[exercise:02-estrechar-con-typeof.md-]]

```text
WEB-2026-001
PEDIDO-001042
1.3 kg
medio kilo
peso sin indicar
```

TypeScript no mira solo el interior del `if`: sigue el **flujo** del código. Si la rama del `string` termina con `return`, lo que viene después solo puede ser `number`, sin `else`. Lo mismo vale para los ternarios, `&&`, `||` y cualquier combinación. A este seguimiento se le llama **análisis del flujo de control**, y es la razón de que el código de TypeScript se parezca tanto al de JavaScript: las comprobaciones que harías de todos modos son las que estrechan los tipos.

## Estrechar por *truthiness*

La comprobación más corta es `if (valor)`, que descarta los valores *falsy*: `null`, `undefined`, `false`, `0`, `NaN` y `''`. TypeScript la acepta como estrechamiento (quita `undefined` y `null` del tipo), y ahí está la trampa: también descarta el `0` y el texto vacío, que suelen ser valores válidos.

[[exercise:03-truthiness-pierde-el-cero.md-]]

```text
🐛 Mole negro: sin dato de existencias
🐛 (sin nota)
✅ Mole negro: 0 uds.
✅ ""
✅ Tasajo: sin dato de existencias
```

No hay ningún error de tipos: para TypeScript, `if (line.units)` es un estrechamiento correcto. El fallo es de lógica, y es el mismo `||` frente a `??` del capítulo 5. Cuando lo que quieres descartar es «que no esté», compara con eso (`!== undefined`) o usa `??`, que solo sustituye `null` y `undefined`.

## Estrechar con `in` e `instanceof`

`typeof` no distingue entre objetos: una canción y un pódcast son los dos `'object'`. Para una unión de tipos de objeto, el operador `in` comprueba si existe una propiedad, y si esa propiedad solo está en uno de los tipos, TypeScript estrecha a ese tipo:

[[exercise:04-estrechar-con-in.md-]]

```text
🎵 La Llorona — Lila Downs (5 min)
🎙️ Historias del metro · episodio 12 con Ana Ruiz
```

Fíjate en que `item.title` se puede usar sin comprobar nada, porque está en los dos tipos. En cambio, leer `item.artist` antes del `if` sería un error (`TS2339`, con la misma explicación de dos líneas que en el primer ejemplo).

Cuando los tipos son **clases**, `instanceof` hace el mismo trabajo, y es el estrechamiento natural para `Date`, para los elementos del DOM y para los errores:

[[exercise:05-estrechar-con-instanceof.md-]]

```text
entrega → 2 de noviembre
entrega → pendiente de confirmar
⚠️ avisar al proveedor de MOL-02
⛔ RangeError | Hay que reservar al menos 1 unidad
```

En el `catch`, `error` es `unknown` (lección 1), y cada `instanceof` lo estrecha a una clase concreta: dentro de la rama de `OutOfStockError`, la propiedad `sku` existe. Recuerda que `instanceof` solo funciona con clases, porque un `type` no existe en ejecución.

## Estrechar con igualdad

Comparar con `===` también estrecha: `x === null` separa el `null` del resto, y `zone === 'local'` deja `zone` en `'local'` dentro del `if` (y en los demás valores fuera de él). Con esta herramienta hay un caso que merece atención, porque TypeScript detecta un fallo clásico de JavaScript:

[[exercise:06-igualdad-y-null.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 7: TS18047: 'contact' is possibly 'null'.
// Consola:
objeto → ana@example.com
⛔ null → TypeError: Cannot read properties of null (reading 'email')
✅ sin contacto | sin contacto | ivan@example.com
entrega hoy | entrega en 3 días | sin zona
```

`typeof null` es `'object'`, una rareza del capítulo 5, así que `typeof contact === 'object'` deja pasar el `null`, y TypeScript lo sabe. La forma idiomática de descartar los dos valores vacíos a la vez es `contact != null`: con `!=` (igualdad débil), `null` y `undefined` son iguales entre sí y distintos de todo lo demás. Es la única excepción razonable a la regla de usar siempre `===`.

## Uniones discriminadas

Las uniones más útiles son las de tipos de objeto que comparten una propiedad con un **valor literal distinto** en cada miembro, como `kind: 'card'`, `kind: 'cash'` y `kind: 'transfer'`. Esa propiedad se llama **discriminante**, y basta con mirarla para saber de qué tipo es el objeto:

```ts
type Payment =
  | { kind: 'card'; last4: string; installments: number }
  | { kind: 'cash'; amountGiven: number }
  | { kind: 'transfer'; reference: string };
```

Un `switch` sobre `payment.kind` estrecha `payment` en cada `case`, y dentro de cada uno solo existen las propiedades de ese tipo:

[[exercise:07-uniones-discriminadas.md-]]

```text
Tarjeta •••• 4821 a 3 meses
Efectivo: cambio de $150
Transferencia, referencia SPEI-889210
```

Compáralo con un único tipo con todas las propiedades opcionales (`last4?`, `amountGiven?`, `reference?`): ahí nada impediría un pago en efectivo con `last4`, y habría que comprobar cada propiedad antes de usarla. La unión discriminada hace **imposibles** las combinaciones sin sentido. La verás en estados de carga (`'loading' | 'ok' | 'error'`), mensajes entre partes de una aplicación, eventos y acciones.

> **Desde Python:** el patrón equivalente es una unión de `TypedDict` con un campo `Literal` (mypy las llama *tagged unions*): mypy estrecha la unión cuando compruebas ese campo, por ejemplo con `if payment["kind"] == "card":`.

## Exhaustividad con `never`

El `switch` del ejemplo anterior tiene un punto débil: ¿qué pasa cuando alguien añade un cuarto método de pago y se olvida de tratarlo? El truco es usar `never`, el tipo sin valores de la lección 2. Si todos los casos están cubiertos, en el `default` ya no queda ningún tipo posible, y el valor es `never`. Una función que **solo acepta** `never` falla en cuanto queda un caso sin tratar:

[[exercise:08-exhaustividad-con-never.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 24: TS2345: Argument of type '{ kind: "voucher"; code: string; }' is not assignable to parameter of type 'never'.
// Consola:
tarjeta → 0.035
⛔ Error: Forma de pago no prevista: {"kind":"voucher","code":"BUENFIN-26"}
```

El mensaje dice exactamente qué caso falta: el tipo con `kind: "voucher"`. Y el error sale en el `switch` que hay que completar, no en la línea que añadió el nuevo tipo ni en producción. Además, `assertNever` lanza un error claro en ejecución, por si llega un valor que el verificador no podía prever (de un JSON, por ejemplo). Este patrón es la forma estándar de que el verificador te avise de todos los sitios que hay que actualizar cuando crece una unión.

## Cuando el estrechamiento se pierde

El estrechamiento sigue el flujo del código, pero un callback rompe ese flujo: TypeScript no sabe **cuándo** se ejecutará la función que pasas a `map`, `setTimeout` o `addEventListener`. Para una propiedad como `order.coupon`, alguien podría cambiarla entre la comprobación y la ejecución del callback, así que dentro de él TypeScript vuelve al tipo original:

[[exercise:09-estrechamiento-en-callbacks.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 10: TS18048: 'order.coupon' is possibly 'undefined'.
// Consola:
cupón → OTONO26
(2) ['Tlayuda [OTONO26]', 'Mezcal [OTONO26]']
['Tasajo [OTONO26]']
```

La solución es copiar el valor a una `const` antes de comprobarlo. Una `const` no puede cambiar, así que su estrechamiento sí llega al callback. Con las variables locales y los parámetros que no se reasignan, TypeScript ya conserva el estrechamiento dentro de los callbacks; el problema es exclusivo de las propiedades.

## Bestiario

- **Usar lo que solo tiene un miembro de la unión.**
  Síntoma: `TS2339: Property 'toUpperCase' does not exist on type 'string | number'.` (con una segunda línea que nombra el miembro problemático).
  Causa: sobre una unión solo se puede usar lo que existe en todos sus miembros.
  Solución: estrecha primero (`typeof`, `in`, `instanceof`, `===`) y usa el método dentro de la rama correcta.
  → [ver ejemplo](01-uniones.md)
- **El cero y el texto vacío que desaparecen.**
  Síntoma: existencias `0` mostradas como «sin dato», una nota `''` sustituida por el texto por defecto; ningún error de tipos.
  Causa: `if (valor)` y `||` descartan todos los *falsy*, no solo `undefined` y `null`.
  Solución: compara con lo que quieres descartar (`!== undefined`, `!= null`) y usa `??` en lugar de `||`.
  → [ver ejemplo](03-truthiness-pierde-el-cero.md)
- **`typeof x === 'object'` deja pasar `null`.**
  Síntoma: `TS18047: 'contact' is possibly 'null'.` dentro del `if`; en ejecución, `Cannot read properties of null`.
  Causa: `typeof null` es `'object'`.
  Solución: `contact != null` (descarta `null` y `undefined`) o `contact !== null`.
  → [ver ejemplo](06-igualdad-y-null.md)
- **El caso que nadie trató.**
  Síntoma: `TS2345: Argument of type '{ kind: "voucher"; … }' is not assignable to parameter of type 'never'.`
  Causa: se añadió un miembro a una unión discriminada y un `switch` no lo trata.
  Solución: añade el `case` que falta; mantén el `default` con `assertNever` para que el próximo caso nuevo también se detecte.
  → [ver ejemplo](08-exhaustividad-con-never.md)
- **El estrechamiento que no llega al callback.**
  Síntoma: `TS18048: 'order.coupon' is possibly 'undefined'.` dentro de una flecha, justo después de un `if (order.coupon)`.
  Causa: TypeScript no sabe cuándo se ejecutará el callback, y una propiedad puede cambiar entre medias.
  Solución: copia la propiedad a una `const` y comprueba esa `const`.
  → [ver ejemplo](09-estrechamiento-en-callbacks.md)

## Resumen

- Una unión `A | B` admite valores de cualquier miembro, pero solo deja usar lo que tienen todos.
- Estrechar es comprobar con JavaScript normal; TypeScript sigue el flujo (`if`, `return`, ternarios, `switch`) y sabe qué tipo queda en cada línea.
- `typeof` para primitivos, `in` para uniones de objetos, `instanceof` para clases, `===`/`!=` para valores concretos y `null`.
- `if (valor)` también descarta `0` y `''`: compara con `undefined` o usa `??`.
- Una unión discriminada usa una propiedad literal (`kind`) para distinguir sus miembros; con un `switch`, cada `case` tiene su tipo.
- Un `default` con `assertNever(value: never)` convierte un caso olvidado en un error de tipos.
- El estrechamiento de una propiedad no llega a los callbacks: cópiala antes a una `const`.

## Para profundizar

- [Manual de TypeScript: estrechamiento (en inglés)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Manual de TypeScript: uniones (en inglés)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types)
- [Manual de TypeScript: uniones discriminadas y exhaustividad (en inglés)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
