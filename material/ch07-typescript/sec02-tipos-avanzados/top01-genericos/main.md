# Genéricos

## Por qué importa

En el módulo 1 cada función tenía tipos fijos: `formatPrice(cents: number): string`. Pero muchas funciones útiles no dependen del tipo de los datos: devolver el primer elemento de una lista, buscar algo por `id`, paginar resultados, guardar cosas en una caché. Con tipos fijos tendrías que elegir entre escribir una versión por tipo o usar `any` y perder toda la ayuda del verificador.

Los **genéricos** resuelven ese dilema: son tipos con **parámetros**, igual que las funciones tienen parámetros para los valores. Ya has visto algunos (`Array<string>`, `Promise<string>`), y son la base del resto del módulo: los tipos mapeados, los condicionales y los de utilidad de las lecciones siguientes son tipos genéricos.

## Una función para muchos tipos

Imagina una función que devuelve el primer elemento de una lista. Sin genéricos hay tres opciones, y ninguna es buena: escribir una sobrecarga por cada tipo de lista (la lección 6 del módulo 1), aceptar `any[]` y devolver `any`, o aceptar `unknown[]` y devolver `unknown`. La cuarta opción es un **parámetro de tipo**, que se declara entre `< >` después del nombre:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

Léelo así: «para cualquier tipo `T`, `first` recibe un array de `T` y devuelve un `T` o `undefined`». `T` es un nombre, como el de un parámetro normal; la costumbre es usar una mayúscula (`T` de *type*, `K` de *key*, `V` de *value*) o un nombre descriptivo (`TItem`). Lo importante es que `T` aparece **dos veces**: relaciona el tipo de la entrada con el de la salida.

[[exercise:01-por-que-genericos.md-]]

```text
🐛 any → TypeError: fromAny.toUpperCase is not a function
unknown → AMOR PROHIBIDO
✅ T = string → AMOR PROHIBIDO
✅ T = number → 349.00
function first(items) {
```

Con `any`, el verificador deja de mirar: `fromAny.toUpperCase()` no sale en rojo y falla al ejecutar. Con `unknown` todo es seguro, pero cada uso exige un `typeof`. Con `first<T>`, TypeScript sabe que `first(titles)` es un `string | undefined` y que `first(prices)` es un `number | undefined`, sin que nadie lo escriba.

La última línea recuerda el borrado de tipos de la lección 1 del módulo anterior: `<T>` desaparece del JavaScript generado (pestaña `compiled.js`). Los genéricos no existen en ejecución, así que no cuestan nada, pero tampoco puedes preguntar «¿qué es `T`?» dentro de la función.

Así se cumple también lo que anunciaba la lección de funciones del módulo 1: cuando las sobrecargas solo cambian el tipo y no la forma (`first(items: string[]): string`, `first(items: number[]): number`…), una sola firma genérica las sustituye todas.

## Inferencia y argumentos de tipo explícitos

Al llamar a una función genérica casi nunca escribes `T`: TypeScript lo **deduce** de los argumentos, igual que deduce el tipo de una variable a partir de su valor. Cuando hay varios parámetros de tipo, cada uno sale del argumento donde aparece:

[[exercise:02-inferencia-y-argumentos-explicitos.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 33: TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
// Consola:
1043 → Re
selena → Amor prohibido
deseos → ['Re'] | reproducciones → 3
(2) [1042, 'web-7']
(2) [1042, 'web-7']
```

En `indexBy(albums, (album) => album.code)`, `V` sale del array (`Album`) y `K` de lo que devuelve la flecha (`number`). Fíjate en que dentro de la flecha `album` ya es un `Album`: TypeScript deduce `V` primero y lo usa para tipar el callback, el tipado contextual del módulo 1.

Cuando no hay ningún argumento del que deducir, el tipo se escribe entre `< >` en la llamada: `new Set<string>()`, `new Map<string, number>()`. Es importante con las colecciones vacías, porque `new Map()` sin nada es `Map<any, any>`, y ese `any` se cuela en todo lo que leas del mapa sin un solo aviso.

La última parte del ejemplo muestra cómo deduce TypeScript cuando un mismo `T` aparece en dos argumentos: el primero (`1042`) fija `T = number`, y el segundo ya no encaja. No elige la unión por su cuenta, porque casi siempre mezclar tipos es un error. Si es lo que quieres, dilo explícitamente con `pair<number | string>(…)`.

> **Desde Python:** un parámetro de tipo es un `TypeVar`. Con la sintaxis de Python 3.12 (PEP 695) la función se escribe casi igual: `def first[T](items: list[T]) -> T | None:`. Antes de 3.12 había que declararlo aparte: `T = TypeVar("T")`. La gran diferencia es que en Python no se pueden pasar argumentos de tipo al llamar a una función (`first[str](…)` no existe); en TypeScript sí.

## Restricciones con `extends`

Dentro de una función genérica, TypeScript no sabe nada de `T`: puede ser un número, un texto o `null`. Por eso, en una función que busca por `id`, `item.id` sería un error. Una **restricción** dice qué debe tener `T` como mínimo, con `extends`:

[[exercise:03-restricciones.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 29: TS2345: Argument of type '{ label: string; }[]' is not assignable to parameter of type '{ id: number; }[]'.
  Property 'id' is missing in type '{ label: string; }' but required in type '{ id: number; }'.
// Consola:
Cielito lindo · 182 s
Museo Textil de Oaxaca · Oaxaca
undefined
```

`T extends { id: number }` se lee «`T` es cualquier tipo que tenga, **al menos**, un `id` numérico»; es el tipado estructural de la lección 3 del módulo 1. La diferencia con un parámetro normal `items: { id: number }[]` es lo que sale: con el genérico, `findById(songs, 2)` devuelve un `Song` completo, con `title` y `seconds`. Sin él, devolvería un `{ id: number }` y habrías perdido el resto. La restricción pide un mínimo, no recorta el tipo.

Aquí `extends` no tiene nada que ver con la herencia de clases: dentro de `< >` significa «es asignable a». Lo verás mucho, porque es la forma de relacionar dos parámetros: en la lección 2, `K extends keyof T` (`K` es una de las claves de `T`).

> **Desde Python:** es un `TypeVar` con límite: `T = TypeVar("T", bound=HasId)` o, en 3.12, `def find_by_id[T: HasId](items: list[T], id: int) -> T | None:`, donde `HasId` sería un `Protocol` con un atributo `id: int`. Los `Protocol` de Python son estructurales, como todos los tipos de TypeScript.

## Valores por defecto

Un parámetro de tipo puede tener un **valor por defecto**, con `=`, que se usa cuando no se escribe y no hay nada de lo que deducirlo:

[[exercise:04-valores-por-defecto.md-]]

```text
Nombre → Carmen Vidal (string)
Personas → 4 (number)
Terraza → true (boolean)
Notas → cumpleaños (string)
```

El orden de preferencia es: lo que escribes entre `< >`, después lo que se deduce de los argumentos y, solo si no hay nada, el valor por defecto. En los tipos, el valor por defecto ahorra escribir el caso más común: `Field` a secas es `Field<string>`. Puede combinarse con una restricción: `<T extends { id: number } = Song>`.

## Los genéricos que ya usabas

Ahora puedes leer los tipos de la biblioteca estándar que aparecían en el módulo 1. `Array<T>` es el nombre genérico de `T[]`; los dos se escriben de forma distinta, pero son **el mismo tipo**. El módulo 1 prometía explicar `Promise<string>`: es «una promesa que, al cumplirse, da un `string`».

[[exercise:05-array-promise-y-map.md-]]

```text
géneros → 3 | solo lectura → bolero, cumbia, son jarocho
reproducciones → 12 | ¿favorita? → true
pending → true
canciones → 3
```

Una función `async` siempre devuelve una promesa, así que su tipo de retorno es `Promise<…>` aunque el `return` sea un `number`, y `await` hace el camino inverso: de `Promise<string[]>` saca un `string[]`. Las lecciones 3 y 4 enseñan a escribir esa operación como un tipo (`infer` y `Awaited`).

Las definiciones de estos tipos están escritas en TypeScript, en los archivos de la biblioteca que trae el compilador (`lib.es5.d.ts` y compañía). Su forma, simplificada, explica muchas cosas que ya habías visto funcionar:

```ts
interface Array<T> {
  push(...items: T[]): number;
  find(predicate: (value: T, index: number) => boolean): T | undefined;
  map<U>(callback: (value: T, index: number) => U): U[];
}
interface Map<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): this;
}
```

`find` devuelve `T | undefined` porque puede no encontrar nada, y `map` tiene **su propio** parámetro de tipo, `U`, que se deduce de lo que devuelve el callback: por eso `prices.map((p) => p.toFixed(2))` es un `string[]`. En el editor de un proyecto real, «Ir a la definición» sobre `map` abre exactamente esto.

## Tipos, interfaces y clases genéricas

Los alias `type` y las `interface` también aceptan parámetros. Un tipo genérico es una plantilla: `Result<T>` no es un tipo hasta que le das un `T`, y `Result<number>` y `Result<Museum>` son tipos distintos hechos con la misma plantilla.

[[exercise:06-tipos-genericos-propios.md-]]

```text
página 2/2 → ['Puebla']
página 1/1 → (2) [1919, 1875]
✅ 12 visitantes
⚠️ «doce» no es un número de visitantes
```

`Result<T>` es una unión discriminada (lección 4 del módulo 1) con un hueco para el valor; la usarás mucho para funciones que pueden fallar sin lanzar errores. `Page<T>` describe una página de resultados de cualquier cosa, y la misma `paginate` sirve para museos y para obras.

Las clases funcionan igual. El parámetro va después del nombre de la clase y lo pueden usar los campos y todos los métodos. Cada instancia tiene su propio `T`, que se escribe con `new` o se deduce de los argumentos del constructor:

[[exercise:07-clases-genericas.md-]]

```text
canción 7 → Cucurrucucú paloma
total entradas → 175
¿instancia de Repository? → true
```

`Repository<T extends { id: number }>` junta las dos ideas: es genérica y tiene una restricción, porque necesita leer `item.id` para guardar cada elemento. Un repositorio, una caché o una cola tipada son los usos más típicos de una clase genérica. Y aunque `<T>` se borra, la clase sigue existiendo en ejecución: `instanceof Repository` funciona, pero no hay forma de preguntar si es un repositorio **de canciones**.

> **Desde Python:** es `class Repository(Generic[T]):` o, desde 3.12, `class Repository[T: HasId]:`. Al crear la instancia, Python acepta `Repository[Song]()`; TypeScript escribe el tipo antes de los paréntesis: `new Repository<Song>()`.

## Parámetros de tipo `const`

En el módulo 1 viste que TypeScript infiere los literales «anchos»: `['S', 'M']` es un `string[]`, salvo que escribas `as const`. Lo mismo pasa al deducir `T`. Desde TypeScript 5.0, quien **escribe** la función puede pedir la inferencia estrecha con `<const T>`, sin que quien la llama tenga que acordarse de `as const`:

[[exercise:08-parametros-de-tipo-const.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 16: TS2345: Argument of type '"/tiend"' is not assignable to parameter of type '"/" | "/tienda" | "/carrito"'.
// Consola:
navegando a /tiend
navegando a /tienda
navegando a /tiend
rutas → / · /tienda · /carrito
```

Con `createNavLoose`, `T` es `string[]` y `go` acepta cualquier texto, erratas incluidas. Con `createNav`, `T` es la tupla `readonly ['/', '/tienda', '/carrito']`, y el mensaje de error te enseña el tipo que dedujo TypeScript para `go`: la unión exacta de las tres rutas. La restricción `readonly string[]` es la recomendada, porque una tupla `as const` es `readonly`.

## Cuándo no usar un genérico

Un parámetro de tipo sirve para **relacionar** tipos: la entrada con la salida, un argumento con otro. Si no relaciona nada, sobra. La regla práctica: cada parámetro de tipo debe aparecer al menos **dos veces** en la firma.

[[exercise:09-genericos-que-no-relacionan-nada.md-]]

```text
precio → 349
$349 MXN | $1,299.00 MXN
🐛 parseJson<Order> → TypeError: order.total.toFixed is not a function
✅ total → 89.90
```

Los dos primeros casos son solo ruido: `logPrice<T>(price: T)` equivale a `price: unknown`, y un `T extends number | string` usado una vez equivale a la unión. El tercero es peligroso. En `parseJson<T>(text: string): T`, `T` solo está en el retorno, así que quien llama elige el tipo que quiera y nadie lo comprueba. `parseJson<Order>(…)` es un `as Order` disfrazado, y por eso el `TypeError` llega sin ningún aviso. Si una función no sabe qué devuelve, su tipo de retorno honesto es `unknown`, y validar ese `unknown` es el tema de la lección 6.

> **Desde Python:** mypy detecta el tercer caso: «A function returning TypeVar should receive at least one argument containing the same TypeVar». TypeScript no lo marca; en proyectos reales lo hace el *linter* (la regla `no-unnecessary-type-parameters` de typescript-eslint).

El otro error frecuente es una restricción demasiado amplia. `object` parece significar «objeto con propiedades», pero en TypeScript es «cualquier cosa que no sea un primitivo», y eso incluye arrays, funciones y fechas:

[[exercise:10-t-extends-object.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 21: TS2345: Argument of type 'string[]' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'string[]'.
línea 31: TS2345: Argument of type 'Profile' is not assignable to parameter of type 'Record<string, unknown>'.
  Index signature for type 'string' is missing in type 'Profile'.
// Consola:
perfil → 2/3
🐛 array → 2/3
🐛 función → 0/0
🐛 fecha → 0/0
✅ perfil → 2/3
```

`Record<string, unknown>` (lección 4; equivale a la firma de índice `{ [key: string]: unknown }` del módulo 1) describe un objeto con claves de texto, y rechaza arrays, funciones y fechas. Tiene una pega que el segundo error enseña: los tipos declarados con `interface` no tienen la firma de índice **implícita** que sí tienen los alias `type`, así que tampoco encajan. Si tus datos son interfaces, mantén `object` y descarta en ejecución lo que no quieras (`Array.isArray`, `typeof value === 'function'`).

## Bestiario

- **El segundo argumento no encaja en `T`.**
  Síntoma: `TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.` en `pair(1042, 'web-7')`.
  Causa: con un solo `T` para dos argumentos, TypeScript lo deduce del primero y no forma la unión por su cuenta.
  Solución: si de verdad aceptas los dos tipos, escríbelo (`pair<number | string>(…)`), o usa dos parámetros de tipo.
  → [ver ejemplo](02-inferencia-y-argumentos-explicitos.md)
- **Una colección vacía llena de `any`.**
  Síntoma: lo que lees de un `new Map()` o de un array vacío sin anotar no tiene comprobación ninguna.
  Causa: sin argumentos de los que deducir, `new Map()` es `Map<any, any>`.
  Solución: escribe el tipo al crearla: `new Map<string, number>()`, `const queue: Song[] = []`.
  → [ver ejemplo](02-inferencia-y-argumentos-explicitos.md)
- **Un tipo que no cumple la restricción.**
  Síntoma: `TS2345: Argument of type '{ label: string; }[]' is not assignable to parameter of type '{ id: number; }[]'.`, con una segunda línea que dice qué falta (`Property 'id' is missing…`).
  Causa: la función pide `T extends { id: number }` y los datos no tienen `id`.
  Solución: lee la segunda línea del mensaje; añade la propiedad a los datos o usa una función pensada para ellos.
  → [ver ejemplo](03-restricciones.md)
- **Una errata que el genérico deja pasar.**
  Síntoma: `go('/tiend')` se acepta sin error aunque la ruta no existe.
  Causa: sin `const`, `T` se deduce como `string[]` y `T[number]` es `string`.
  Solución: declara `<const T extends readonly string[]>`; entonces el error de tipos enseña la unión exacta de rutas.
  → [ver ejemplo](08-parametros-de-tipo-const.md)
- **Genéricos que no relacionan nada.**
  Síntoma: un `TypeError` con datos que «tenían» un tipo, como `parseJson<Order>(…)`; o firmas llenas de `<T>` que no aportan nada.
  Causa: un `T` que aparece una vez es `unknown`; uno que solo está en el retorno es una aserción que nadie comprueba.
  Solución: cada parámetro de tipo, al menos dos veces en la firma; si no sabes qué devuelves, devuelve `unknown` y valida.
  → [ver ejemplo](09-genericos-que-no-relacionan-nada.md)
- **`T extends object` deja pasar arrays y funciones.**
  Síntoma: resultados absurdos (`2/3` para un array, `0/0` para una función) sin ningún error de tipos.
  Causa: `object` es cualquier valor no primitivo.
  Solución: una restricción con la forma que necesitas (`Record<string, unknown>`, `{ id: number }`) o una comprobación en ejecución; ojo, `Record<string, unknown>` rechaza las `interface`.
  → [ver ejemplo](10-t-extends-object.md)

## Resumen

- Un parámetro de tipo (`<T>`) relaciona tipos: la entrada con la salida o unos argumentos con otros. Si no relaciona nada, sobra.
- TypeScript deduce los parámetros de tipo de los argumentos; cuando no puede, se escriben en la llamada (`new Map<string, number>()`).
- `T extends X` pide un mínimo (`{ id: number }`) sin recortar el tipo; `<T = string>` da un valor por defecto.
- `Array<T>` es `T[]`; `Promise<T>` es una promesa que da un `T`; `Map<K, V>` y `Set<T>` son genéricos de la biblioteca, igual que `map<U>`.
- Alias, interfaces y clases aceptan parámetros: `Result<T>`, `Page<T>`, `Repository<T>`.
- `<const T>` infiere los argumentos como `as const`.
- Los genéricos se borran: no hay `T` en ejecución.

## Para profundizar

- [Manual de TypeScript: genéricos (en inglés)](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Manual de TypeScript: reglas para escribir buenas funciones genéricas (en inglés)](https://www.typescriptlang.org/docs/handbook/2/functions.html#guidelines-for-writing-good-generic-functions)
- [Notas de TypeScript 5.0: parámetros de tipo const (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters)
- [Documentación de Python: genéricos y PEP 695 (en inglés)](https://docs.python.org/3/library/typing.html#generics)
