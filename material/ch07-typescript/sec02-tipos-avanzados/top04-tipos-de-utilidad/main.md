# Tipos de utilidad

## Por qué importa

Un mismo producto aparece en una aplicación con muchas formas: completo, como lo guarda el servidor; sin `id`, cuando se crea; con todo opcional, cuando se edita solo el precio; recortado a tres campos, en un listado. Escribir cada forma a mano es repetir el tipo cuatro veces, y es fácil que se desincronicen.

TypeScript trae una colección de **tipos de utilidad** (*utility types*) que hacen estas transformaciones: `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`, `NonNullable`, `ReturnType`, `Parameters`, `Awaited`, `InstanceType`… No son magia: están escritos en TypeScript con los tipos mapeados y condicionales de la lección 3, y al final de esta lección los escribirás tú. Esta lección enseña para qué sirve cada uno y, sobre todo, dónde engañan.

## `Partial` y `Required`

`Partial<T>` hace **opcionales** todas las propiedades de `T`. Su uso estrella es el cuerpo de una petición `PATCH`, que solo envía lo que cambia. `Required<T>` hace lo contrario: todas **obligatorias**, sin `?` y sin el `undefined` que lo acompaña. Encaja con unas opciones que ya tienen aplicados sus valores por defecto:

[[exercise:01-partial-y-required.md-]]

```text
precio → {id: 7, name: 'Mole negro', price: 175, stock: 12}
existencias → 0
20 por página, por name ↑
20 por página, por price ↓
```

Dentro de `describeList`, `settings` es un `Required<ListOptions>`, así que `settings.pageSize` es un `number` y no hace falta comprobar `undefined`. Es el patrón de siempre para opciones: la función acepta un objeto parcial y lo completa con los valores por defecto antes de usarlo.

> **Desde Python:** `Partial<T>` es lo que en un `TypedDict` se consigue con `total=False` (todas las claves opcionales), y `NotRequired[...]`/`Required[...]` marcan claves sueltas. La diferencia es que en Python escribes otra clase; en TypeScript, `Partial<Product>` se calcula a partir de `Product` y cambia con él.

`Partial` tiene una trampa que no se ve en los tipos. «Opcional» admite dos cosas: que la clave no esté y que esté con el valor `undefined`. Un formulario de edición que construye el parche con todas las claves, y deja las vacías como `undefined`, borra datos al mezclarlo con `...`:

[[exercise:02-undefined-en-un-partial.md-]]

```text
🐛 precio → undefined
🐛 TypeError: Cannot read properties of undefined (reading 'toFixed')
✅ Mole negro oaxaqueño → 165.00
```

Lo peor es que TypeScript asegura que el resultado de `{ ...product, ...patch }` tiene `price: number`: para calcular el tipo de un `...`, supone que una propiedad opcional no está, no que valga `undefined`. La solución práctica es limpiar el parche antes de mezclarlo. La opción `exactOptionalPropertyTypes` de `tsconfig` distingue los dos casos y convertiría `price: undefined` en un error, pero no forma parte de `strict` y LearnWeb no la activa.

## `Pick`, `Omit` y `Readonly`

`Pick<T, K>` se queda con las propiedades `K` de `T`; `Omit<T, K>` se queda con todas **menos** esas. `Readonly<T>` las marca todas como de solo lectura (de forma superficial, como viste en la lección 3). Entre los tres describen las versiones de un tipo que aparecen en una API:

[[exercise:03-pick-y-omit.md-]]

```text
creado → {name: 'Café de Chiapas', price: 210, stock: 40, id: 101, createdAt: '2026-10-14'}
ficha → {id: 101, name: 'Café de Chiapas', price: 210}
```

`NewProduct` es lo que se envía para crear un producto (el servidor pone el `id` y la fecha) y `ProductCard` lo que necesita una tarjeta del listado. Si mañana `Product` gana un campo `weight`, `NewProduct` lo incluye sin tocarlo, y `ProductCard` no, porque `Pick` nombra sus claves.

Hay una diferencia entre los dos que muerde a menudo. `Pick` exige que las claves existan (`K extends keyof T`), pero `Omit` acepta **cualquier** clave:

[[exercise:04-omit-no-comprueba-la-clave.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 6: TS2741: Property 'email' is missing in type '{ id: number; fullName: string; }' but required in type 'PublicUser'.
línea 10: TS2344: Type '"emial" | "fullName"' does not satisfy the constraint 'keyof User'.
  Type '"emial"' is not assignable to type 'keyof User'. Did you mean '"email"'?
// Consola:
🐛 perfil → {id: 1, fullName: 'Ana Ruiz'}
✅ público → {id: 1, fullName: 'Ana Ruiz'}
```

Con la errata `'emial'`, `Omit` no quita nada más que `passwordHash`, y el correo sigue en el tipo del perfil público. El primer aviso (`TS2741`, «falta `email`») aparece lejos de la errata, y solo porque alguien construyó un perfil sin correo. Si el código copiara el usuario entero, el correo se publicaría sin un solo error. `Omit` se diseñó así a propósito, para poder quitar claves de tipos genéricos que todavía no se conocen; la solución, cuando el tipo sí se conoce, es una línea: `type StrictOmit<T, K extends keyof T> = Omit<T, K>`.

## `Record`

`Record<K, V>` es un objeto con claves `K` y valores `V`. Cuando `K` es una unión de literales, es un tipo mapeado que exige **todas** las claves, y eso lo convierte en la tabla perfecta para «un valor por cada caso»:

[[exercise:05-record.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 13: TS2741: Property 'L' is missing in type '{ S: number; M: number; }' but required in type 'SizePrices'.
// Consola:
playera S → $199
playera M → $219
playera L → $239
🐛 borrador L → undefined
lunes → cerrado | viernes → 10–20
```

Si mañana se añade `'XL'` a `SIZES`, todas las tablas `Record<Size, …>` del programa salen en rojo hasta que tengan su precio para `XL`. Es la misma idea que la exhaustividad con `never` del módulo 1, aplicada a objetos.

> **Desde Python:** `Record<Size, number>` sería un `dict[Size, int]` con `Size = Literal["S", "M", "L"]`, pero mypy no exige que estén todas las claves. Un `TypedDict` con las tres sí, escrito a mano.

Con `K = string` todo cambia. `Record<string, number>` es la firma de índice del módulo 1 con otro nombre, y dice algo que casi nunca es verdad: que **cualquier** texto es una clave con un número.

[[exercise:06-record-de-string.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 16: TS18048: 'mole' is possibly 'undefined'.
// Consola:
🐛 TAS-04 → TypeError: Cannot read properties of undefined (reading 'toFixed')
MOL-01 → 12
✅ TAS-04 → SKU desconocido
✅ MOL-01 → 12
✅ ¿TAS-04? → false
```

Leer una clave que falta da `undefined` en ejecución, pero para TypeScript es un `number`. Existe una opción, `noUncheckedIndexedAccess`, que añade `| undefined` a todas esas lecturas (y a los índices de los arrays); no forma parte de `strict`, **está apagada en LearnWeb** y muchos proyectos no la activan. Sin ella, tienes dos arreglos: `Partial<Record<string, number>>`, que hace que cada lectura sea `number | undefined` y obliga a comprobarla (incluso para las claves que sí existen), o un `Map`, cuyo `get` ya devuelve `number | undefined` y que además tiene `has`.

## Utilidades para uniones

Las tres siguientes trabajan sobre uniones, y son los filtros de la lección 3 con nombre oficial:

[[exercise:07-exclude-extract-nonnullable.md-]]

```text
•••• 4821
pago: cash
se pueden cancelar → (2) ['pending', 'paid']
```

`Exclude<T, U>` quita de `T` los miembros asignables a `U`; `Extract<T, U>` se queda con ellos. Con una unión discriminada, `Extract<Payment, { kind: 'card' }>` saca un miembro por su discriminante sin escribirlo otra vez, algo muy útil para tipar la función que trata un solo caso. `NonNullable<T>` quita `null` y `undefined`. No confundas `Exclude` (uniones) con `Omit` (propiedades de un objeto).

## Utilidades para funciones y clases

Muchas funciones, sobre todo las de bibliotecas, devuelven tipos sin nombre. Estas utilidades los sacan de la propia función con `typeof`:

[[exercise:08-tipos-de-funciones.md-]]

```text
📝 reserva para Lucía Méndez · 2 noches
📝 reserva para Iván Soto · 3 noches
R-41 Lucía Méndez → $2400
R-42 Iván Soto → $4350
```

| Utilidad | Da | Ejemplo |
|---|---|---|
| `ReturnType<F>` | lo que devuelve la función | `Promise<{ id: string; … }>` |
| `Awaited<T>` | lo que da una promesa (como `await`, también anidadas) | `{ id: string; … }` |
| `Parameters<F>` | los parámetros como tupla, con sus nombres | `[guest: string, nights: number, options?: …]` |
| `InstanceType<C>` | lo que crea una clase con `new` | `BookingBook` |

`Awaited<ReturnType<typeof f>>` es la combinación más frecuente: el tipo del resultado de una función `async`. Y `Parameters` permite escribir una función envoltorio, como `createBookingLogged`, que acepta exactamente los mismos argumentos que la original: si cambia la firma de `createBooking`, el envoltorio cambia con ella. `InstanceType` solo tiene sentido cuando tienes la clase como valor (una función que recibe clases, por ejemplo); con el nombre de la clase ya tienes su tipo.

> **Desde Python:** el envoltorio que acepta los mismos argumentos es lo que en Python se tipa con `ParamSpec` en un decorador (`Callable[P, R]`). TypeScript no necesita una construcción aparte: `Parameters` y `ReturnType` son tipos condicionales normales.

## Escritos con lo que ya sabes

Todos estos tipos están definidos en los archivos de la biblioteca de TypeScript (`lib.es5.d.ts`) con tipos mapeados, condicionales e `infer`. Escribirlos a mano es el mejor ejercicio para entenderlos, y las comprobaciones `Expect<Equal<…>>` confirman que los tuyos son idénticos a los de verdad:

[[exercise:09-implementarlos-a-mano.md-]]

```text
pick → {title: 'Cielito lindo', seconds: 182}
formato → Cielito lindo (3 min)
```

Fíjate en tres detalles. `keyof any` es la forma de decir «cualquier clave posible» (`string | number | symbol`), y es la restricción de la `K` de `Omit`: por eso no comprueba las claves. `MyPick` conserva el `?` de `lyrics`, porque recorre claves de `T`. Y `MyAwaited` es recursivo, para desenvolver una promesa dentro de otra. La versión real de `NonNullable` es hoy `T & {}`, un truco equivalente; la condicional se entiende mejor. La función `pick` muestra el patrón habitual para construir un objeto de un tipo calculado: empezar con `{} as MyPick<T, K>` y rellenarlo en un bucle.

## Todo junto: el estado de un formulario

En el código real, las utilidades se combinan. El estado de un formulario necesita los valores (todos, como texto), los errores (solo de algunos campos) y una forma de aplicar cambios parciales:

[[exercise:10-estado-de-un-formulario.md-]]

```text
⚠️ fullName: Escribe tu nombre | ⚠️ email: El correo necesita una @
⚠️ email: El correo necesita una @ | ⚠️ bags: Entre 1 y 6 bolsas
✅ listo para enviar
```

Todo sale de `SignupForm`: `Record<Field, string>` para los valores, `Partial<Record<Field, string>>` para los errores y `Partial<FormValues>` para los cambios. Si alguien añade un campo `phone` al formulario, `validate` y el estado inicial salen en rojo hasta que lo traten. En el módulo 3 conectarás un estado así con inputs reales del DOM.

## Bestiario

- **El `undefined` que borra datos.**
  Síntoma: tras aplicar un `Partial` con `...`, una propiedad vale `undefined` aunque el tipo diga `number`; `Cannot read properties of undefined` más adelante.
  Causa: una propiedad opcional admite el valor `undefined`, y el tipo de un `...` supone que las opcionales simplemente no están.
  Solución: quita las claves con `undefined` antes de mezclar (o activa `exactOptionalPropertyTypes` en un proyecto propio).
  → [ver ejemplo](02-undefined-en-un-partial.md)
- **`Omit` con una errata.**
  Síntoma: `Omit<User, 'emial'>` compila; el campo que querías quitar sigue en el tipo, y solo un `TS2741` lejano lo delata.
  Causa: la `K` de `Omit` es `keyof any` (cualquier clave), no `keyof T`.
  Solución: `type StrictOmit<T, K extends keyof T> = Omit<T, K>`; o `Pick`, que sí comprueba.
  → [ver ejemplo](04-omit-no-comprueba-la-clave.md)
- **Una tabla a la que le falta un caso.**
  Síntoma: `TS2741: Property 'L' is missing in type '{ S: number; M: number; }' but required in type 'SizePrices'.`
  Causa: `Record<Size, number>` con una unión exige todas las claves.
  Solución: añade la que falta; es la protección que querías al usar `Record` con una unión.
  → [ver ejemplo](05-record.md)
- **`Record<string, T>` promete claves que no existen.**
  Síntoma: `stock['TAS-04'].toFixed(0)` no sale en rojo y lanza `Cannot read properties of undefined`.
  Causa: `Record<string, T>` dice que toda clave de texto tiene un `T`, y `noUncheckedIndexedAccess` (apagada en LearnWeb) es lo único que lo cambiaría.
  Solución: `Partial<Record<string, T>>` (cada lectura es `T | undefined`) o un `Map` con `get`/`has`.
  → [ver ejemplo](06-record-de-string.md)

## Resumen

- `Partial<T>` y `Required<T>` hacen todas las propiedades opcionales u obligatorias; un `Partial` también admite `undefined` explícito.
- `Pick<T, K>` y `Omit<T, K>` eligen o quitan propiedades; `Pick` comprueba las claves y `Omit` no (`StrictOmit`).
- `Readonly<T>` es superficial.
- `Record<Unión, V>` exige todas las claves; `Record<string, V>` finge que existen todas (usa `Partial<Record<…>>` o `Map`).
- `Exclude`, `Extract` y `NonNullable` filtran uniones; `Extract` saca un miembro de una unión discriminada.
- `ReturnType`, `Parameters`, `Awaited` e `InstanceType` sacan tipos de funciones y clases con `typeof`.
- Todos están escritos con tipos mapeados, condicionales e `infer`, y puedes escribirlos tú.

## Para profundizar

- [Manual de TypeScript: referencia de los tipos de utilidad (en inglés)](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Referencia de tsconfig: noUncheckedIndexedAccess (en inglés)](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
- [Referencia de tsconfig: exactOptionalPropertyTypes (en inglés)](https://www.typescriptlang.org/tsconfig/#exactOptionalPropertyTypes)
- [Las definiciones reales: lib.es5.d.ts en el repositorio de TypeScript (en inglés)](https://github.com/microsoft/TypeScript/blob/main/src/lib/es5.d.ts)
