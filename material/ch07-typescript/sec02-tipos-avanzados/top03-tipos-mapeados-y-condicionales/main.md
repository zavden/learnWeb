# Tipos mapeados y condicionales

## Por qué importa

Un formulario de reserva tiene sus campos, pero también necesita saber qué campos ha tocado el usuario, qué error tiene cada uno y qué tipo de `<input>` corresponde a cada campo. Son tres tipos con **las mismas claves** que el formulario y valores distintos. Escritos a mano, se desincronizan en cuanto alguien añade un campo.

Esta lección enseña las dos herramientas con las que TypeScript **calcula** tipos nuevos a partir de otros. Los **tipos mapeados** recorren las claves de un tipo, como un bucle `for…in` pero de tipos. Los **tipos condicionales** eligen un tipo según otro, como un `if` (o un ternario) de tipos. Con ellas, más `infer`, están escritos casi todos los tipos de utilidad de la lección siguiente.

> **Desde Python:** aquí no hay puente posible. El sistema de tipos de Python no tiene tipos mapeados, ni condicionales, ni `infer`: lo más parecido es escribir cada `TypedDict` a mano o generar código. Es una de las diferencias más grandes entre los dos lenguajes, y la razón de que las bibliotecas de TypeScript puedan deducir tanto a partir de tan poco.

## Tipos mapeados

Un **tipo mapeado** crea un tipo de objeto recorriendo una unión de claves, casi siempre `keyof T`:

```ts
type Touched<T> = { [K in keyof T]: boolean };
```

Se lee «para cada clave `K` de `T`, una propiedad `K` de tipo `boolean`». Dentro de los corchetes, `K` toma por turnos cada clave (`'guest'`, `'email'`, `'party'`), y a la derecha de los dos puntos puedes usarla: `T[K]` es el tipo original de esa propiedad, el tipo indexado de la lección 2.

[[exercise:01-tipos-mapeados.md-]]

```text
⚠️ email: Escribe tu correo
tocados → {guest: true, email: true, party: false}
```

Las comprobaciones `Expect<Equal<…>>` de la lección 2 muestran lo que calcula cada tipo. `Drafts<T>` usa `T[K] | ''` para decir que cada campo puede estar vacío mientras se escribe: `guest` queda como `string` (el `''` ya cabía en `string`) y `party` pasa a `number | ''`. Fíjate también en el `as` del bucle: `Object.keys` devuelve `string[]` y no `(keyof T)[]`, porque en ejecución un objeto puede tener más propiedades de las que dice su tipo (el tipado estructural del módulo 1).

## Modificadores: `readonly` y `?`

Un tipo mapeado puede **añadir** los modificadores que conoces del módulo 1 (`readonly` delante, `?` detrás de los corchetes) y también **quitarlos**, con un signo menos: `-readonly` y `-?`.

[[exercise:02-modificadores.md-]]

```text
La Casa del Mole · MXN · 8 %
```

Dos detalles importantes. Primero, cuando un tipo mapeado recorre `keyof T` **conserva** los modificadores de `T`: `Complete<ShopOptions>` quita los `?`, pero `currency` sigue siendo `readonly` porque nadie dijo `-readonly`. Segundo, `-?` también quita el `undefined` que acompañaba a la propiedad opcional: en `Complete<ShopOptions>`, `taxRate` es `number`, no `number | undefined`. `MyReadonly` y `MyPartial` son, salvo el nombre de la variable (la biblioteca usa `P`), exactamente como están definidos `Readonly` y `Partial` en TypeScript.

## Tipos condicionales

Un **tipo condicional** tiene la forma de un ternario:

```ts
type InputKind<T> = T extends boolean ? 'checkbox' : T extends number ? 'number' : 'text';
```

`T extends U ? X : Y` significa «si `T` es asignable a `U`, el tipo `X`; si no, `Y`». Es el mismo `extends` de las restricciones de la lección 1: no habla de herencia, sino de «cabe en». Los condicionales se encadenan como los ternarios, y la última rama recoge todo lo demás. Combinados con un tipo mapeado, aplican la condición a cada propiedad:

[[exercise:03-tipos-condicionales.md-]]

```text
<input type="text" name="guest">
<input type="number" name="party">
<input type="checkbox" name="terrace">
<input type="text" name="notes">
```

`FormInputs<Reservation>` es un objeto con las mismas claves que la reserva y, en cada una, el único tipo de input que tiene sentido para ese campo. Si alguien cambia `party` a `string` en `Reservation`, el objeto `INPUTS` sale en rojo hasta que se corrija. Los condicionales se evalúan cuando `T` es conocido; dentro de una función genérica, con `T` todavía sin decidir, TypeScript deja el condicional pendiente.

### Cómo funciona `Equal`

Ya puedes leer la herramienta de comprobación de la lección 2. La primera idea sería «iguales si cada uno es asignable al otro»:

```ts
type NaiveEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
```

Falla en dos casos que importan en este módulo: `NaiveEqual<any, string>` da `true` (`any` es asignable a todo y todo a `any`), y `NaiveEqual<{ readonly a: 1 }, { a: 1 }>` también, porque `readonly` no afecta a la asignabilidad. La versión del curso compara dos funciones genéricas que contienen un condicional sobre `A` y otro sobre `B`. Para decidir si esas funciones son compatibles, TypeScript exige que los dos condicionales sean **idénticos**, una regla interna mucho más estricta que «asignable», que distingue `any`, `readonly` y `?`. Tiene una pega: también distingue formas que describen lo mismo, como `{ a: 1 } & { b: 2 }` y `{ a: 1; b: 2 }`. Si alguna vez una comprobación falla por eso, compara con la intersección.

## `infer`: capturar una parte de un tipo

Dentro de la condición de un tipo condicional, `infer` declara una variable de tipo que TypeScript rellena al comparar. Es como un patrón con un hueco:

```ts
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
```

«Si `T` tiene la forma de un array de algo, llama `E` a ese algo y devuélvelo; si no, `never`.» El mismo truco sirve para lo que devuelve una función o para el valor de una promesa:

[[exercise:04-infer.md-]]

```text
Tlayuda $120 · Mole negro $165 🌶️
```

El tipo del menú se saca de la función que lo carga, en tres pasos: `MyReturnType` da `Promise<Dish[]>`, `Unwrap` le quita la promesa y `ElementOf` se queda con un plato. Así se cumple lo que anunciaba la lección 1: escribir como tipo lo que hace `await`. `MyReturnType` es exactamente el `ReturnType` de la biblioteca, y `Unwrap` es una versión simple de `Awaited`, que además desenvuelve promesas anidadas (lección 4). El `readonly` de `ElementOf` hace que funcione también con tuplas `as const`.

## La distributividad

Hay una regla de los tipos condicionales que sorprende a todo el mundo. Cuando la condición se aplica a un parámetro de tipo **desnudo** (`T extends …`, sin nada alrededor) y ese parámetro recibe una unión, el condicional se aplica a **cada miembro por separado** y los resultados se unen. A eso se le llama **distributividad**:

```text
ToArray<string | number>
  = ToArray<string> | ToArray<number>
  = string[] | number[]                    ← no (string | number)[]
```

[[exercise:05-distributividad.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 13: TS2322: Type '(string | number)[]' is not assignable to type 'Codes'.
  Type '(string | number)[]' is not assignable to type 'string[]'.
    Type 'string | number' is not assignable to type 'string'.
      Type 'number' is not assignable to type 'string'.
// Consola:
codes → (2) ['MOL-01', 1043]
mixed → (2) ['MOL-01', 1043]
tipos de los códigos → (2) ['string', 'number']
```

El mensaje se lee de arriba abajo: el array mixto no cabe en `Codes`; en concreto, no cabe en el primer miembro, `string[]`, porque un `number` no es un `string` (y tampoco cabría en `number[]`). Para tratar la unión **entera** hay que «vestir» el parámetro: `[T] extends [unknown]` compara tuplas de un elemento, y entonces no hay reparto. La distributividad también explica que `IsText<'MOL-01' | 1043>` sea `boolean`: `true` para un miembro, `false` para el otro, y `true | false` es `boolean`.

## `never` en las uniones

`never` es la unión **vacía**, el tipo sin valores, así que desaparece al unirlo con cualquier cosa: `'paid' | never` es `'paid'`. Junto con la distributividad, eso convierte a un condicional en un **filtro** de uniones: los miembros que deben irse se convierten en `never` y se esfuman.

[[exercise:06-never-en-las-uniones.md-]]

```text
pending → cobrar
paid → enviar
shipped → esperar la entrega
```

`Without<OrderStatus, 'cancelled'>` reparte el condicional por los cuatro estados; `'cancelled'` da `never` y los otros tres se quedan. Estos dos filtros ya existen en TypeScript con los nombres `Exclude` y `Extract`, y los verás en la lección 4. El detalle de la última comprobación es una consecuencia curiosa: aplicado a `never` (una unión de cero miembros), un condicional distributivo no tiene nada que repartir y da `never`, sin mirar ninguna de sus ramas.

## Remapear claves con `as`

Desde TypeScript 4.1, un tipo mapeado puede **cambiar el nombre** de cada clave con `as`: `[K in keyof T as NuevoNombre]`. Si el nuevo nombre es `never`, la clave desaparece, y así se filtran propiedades por su tipo. Si es un texto calculado, la clave se renombra:

[[exercise:07-remapear-claves.md-]]

```text
gráfica → {price: 210, stock: 8}
Café de Chiapas → 210
```

`NumericFields` usa un condicional en el `as`: las claves cuyo valor es un `number` se quedan y el resto se convierte en `never`. `Getters` adelanta la lección 5: `` `get${Capitalize<K & string>}` `` construye el texto `'getName'` a partir de `'name'` (el `& string` de la lección 2 hace falta porque una clave también podría ser un `number` o un `symbol`). `Pick` es de la lección 4; aquí solo recorta `Product` a dos propiedades.

## Tipos recursivos

Un alias de tipo puede usarse a sí mismo, como una función recursiva. Es la forma de arreglar, a nivel de tipos, un fallo del módulo 1: `readonly` y `Readonly<T>` son **superficiales**, y un array dentro de un objeto de solo lectura sigue aceptando `push`.

[[exercise:08-deep-readonly.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 20: TS2339: Property 'push' does not exist on type 'readonly DeepReadonly<{ name: string; seconds: number; }>[]'.
línea 21: TS2540: Cannot assign to 'country' because it is a read-only property.
// Consola:
🐛 Readonly → 2 pistas
⚠️ DeepReadonly → 3 pistas, ES
✅ deepFreeze → TypeError: Cannot add property 1, object is not extensible
```

`DeepReadonly<T>` marca cada propiedad como `readonly` y, si su valor es un objeto, se aplica a sí mismo un nivel más abajo. Con los arrays funciona porque un tipo mapeado sobre un array da otro array (aquí, `readonly DeepReadonly<…>[]`, como dice el mensaje). Pero sigue siendo un tipo: la línea del `push` y la de `country` se **ejecutan**. Para que nadie pueda cambiar el objeto en ejecución está el `deepFreeze` del capítulo 5, y la versión del ejemplo lleva un tipo que describe lo que hace: entra un `T`, sale un `DeepReadonly<T>`. El `push` sobre el array congelado lanza un `TypeError` incluso en modo no estricto.

Un aviso sobre esta versión de `DeepReadonly`: las funciones también son objetos, así que las mapea, y el resultado ya no se puede llamar. Con una propiedad `Date`, `when.getTime()` da `TS2349: This expression is not callable.`. Es una herramienta para datos (pedidos, configuraciones, respuestas de una API); las versiones de las bibliotecas añaden una rama para dejar las funciones como están.

## Bestiario

- **El condicional que reparte la unión.**
  Síntoma: `ToArray<string | number>` no admite `['MOL-01', 1043]`: `TS2322: Type '(string | number)[]' is not assignable to type 'Codes'.`, con tres líneas más; un `IsText<…>` que da `boolean`.
  Causa: un condicional sobre un parámetro desnudo se aplica a cada miembro de la unión y une los resultados.
  Solución: si quieres tratar la unión entera, envuelve el parámetro: `[T] extends [unknown] ? T[] : never`.
  → [ver ejemplo](05-distributividad.md)
- **`readonly` que no llega a los objetos anidados.**
  Síntoma: `push` sobre un array dentro de un `Readonly<Album>` compila; con `DeepReadonly`, el error aparece, pero el código se ejecuta igual y el objeto cambia.
  Causa: `Readonly` es superficial, y cualquier tipo, también uno recursivo, se borra antes de ejecutar.
  Solución: `DeepReadonly<T>` para el verificador y `deepFreeze` para la ejecución; la función `deepFreeze<T>(value: T): DeepReadonly<T>` une las dos cosas.
  → [ver ejemplo](08-deep-readonly.md)

## Resumen

- Un tipo mapeado `{ [K in keyof T]: … }` recorre las claves de `T`; `T[K]` es el tipo original de cada una.
- Los modificadores se añaden (`readonly`, `?`) y se quitan (`-readonly`, `-?`); al recorrer `keyof T`, se conservan los de `T`.
- `T extends U ? X : Y` elige un tipo; `extends` significa «es asignable a».
- `infer` captura una parte de un tipo dentro de la condición: elemento de un array, retorno de una función, valor de una promesa.
- Un condicional sobre un parámetro desnudo se reparte por las uniones; `[T] extends [U]` lo evita.
- `never` desaparece de las uniones: un condicional que devuelve `never` filtra (así funcionan `Exclude` y `Extract`).
- `as` en un tipo mapeado renombra claves o, con `never`, las borra.
- Un tipo puede ser recursivo (`DeepReadonly`), pero sigue siendo solo una comprobación: en ejecución, `deepFreeze`.

## Para profundizar

- [Manual de TypeScript: tipos mapeados (en inglés)](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [Manual de TypeScript: tipos condicionales, infer y distributividad (en inglés)](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [Notas de TypeScript 4.1: remapeo de claves con as (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#key-remapping-in-mapped-types)
- [Discusión sobre el truco de Equal en el repositorio de TypeScript (en inglés)](https://github.com/microsoft/TypeScript/issues/27024)
