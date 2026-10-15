# Asincronía tipada

## Por qué importa

Casi todo el código asíncrono de una página habla con algo que TypeScript no controla: un servidor que contesta lo que quiere, una red que falla, un usuario que cancela. En el capítulo 5 aprendiste promesas, `async/await` y cancelación, y en el capítulo 6, `fetch`. Esta lección les pone tipos, y descubre que los tipos de la asincronía tienen tres agujeros famosos: `response.json()` devuelve `any`, el error de un `catch` puede ser cualquier cosa y una promesa olvidada no da ningún aviso.

La lección cumple dos promesas del módulo 2: el ayudante de `fetch` tipado que anunciaba «Guardas y validación» y una forma de tratar los errores que el tipo de una función deje ver. Los ejemplos usan el servidor de prueba de LearnWeb (`/api/demo/echo` con `?status=` y `?delay=`, y `/api/demo/stream`) y dos archivos de esta lección, `catalog.json` y `catalog-v1.json`, que puedes abrir con «Assets».

## `Promise<T>` y las funciones `async`

Una función `async` **siempre** devuelve una promesa, aunque su `return` entregue un objeto normal: `async` lo envuelve. Por eso su tipo de retorno se escribe `Promise<Product>`, la promesa de un producto, y no `Product`. Si anotas el tipo «de dentro», TypeScript lo rechaza con `TS1064` y te sugiere la anotación correcta:

[[exercise:01-promise-de-t.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS1064: The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<number>'?
// Consola:
sin await → true
con await → Mole negro 165
existencias → 12
reseñas → 1
```

`await` hace con los valores lo que `Awaited<T>` (de la lección «Tipos de utilidad» del módulo 2) hace con los tipos: quita el `Promise`, todas las capas que haya. Sin anotar el retorno, TypeScript infiere `Promise<…>` a partir de los `return`, como en `loadReviews`; en funciones que forman parte de la API de un módulo conviene escribirlo, para que un `return` equivocado salga en rojo dentro de la función y no en quien la llama.

> **Desde Python:** aquí las dos lenguas difieren. En Python anotas el valor de dentro (`async def load_product(sku: str) -> Product:`) y mypy entiende que la llamada da un `Coroutine[Any, Any, Product]`. En TypeScript anotas lo que devuelve la llamada, `Promise<Product>`. Es justo el error `TS1064` que comete todo el que llega desde Python.

## Varias promesas a la vez

`Promise.all` con un array escrito en el sitio devuelve una **tupla**: cada posición conserva el tipo de su promesa, así que la desestructuración da un `Product`, un `number` y un `Review[]`. Con un array de promesas iguales (el resultado de un `map`), da un array. La firma de `lib.es2015.promise.d.ts` usa dos herramientas del módulo 2, un tipo mapeado que quita el `readonly` y `Awaited`:

```ts
all<T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;
```

[[exercise:02-promise-all-con-tuplas.md-]]

```text
Mole negro · $165 · 12 en almacén · 2 reseñas
precios → (2) [165, 210]
✅ Café de Chiapas
⚠️ Error: No existe el producto XXX-99
```

`Promise.allSettled` nunca rechaza y devuelve un resultado por promesa: una unión discriminada por `status` (`'fulfilled'` con `value` o `'rejected'` con `reason`), que se estrecha con un `if` como las del módulo 1. Fíjate en el tipo de `reason`: es `any`, porque una promesa puede rechazarse con cualquier valor. Ese mismo problema vuelve dentro de unos apartados con el `catch`.

> **Desde Python:** `asyncio.gather(a(), b(), c())` también se tipa por posiciones en mypy, y `return_exceptions=True` se parece a `allSettled`, aunque mezcla valores y excepciones en la misma lista en vez de usar una unión discriminada.

## `fetch` y el `any` de `json()`

La lección «Guardas y validación» del módulo 2 ya lo dijo: `response.json()` devuelve `any`. Así está en `lib.dom.d.ts`:

```ts
interface Body {
    readonly body: ReadableStream<Uint8Array<ArrayBuffer>> | null;
    readonly bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    blob(): Promise<Blob>;
    bytes(): Promise<Uint8Array<ArrayBuffer>>;
    formData(): Promise<FormData>;
    json(): Promise<any>;
    text(): Promise<string>;
}
```

Es `any` y no `unknown` por historia: cuando se escribió, `unknown` no existía, y cambiarlo hoy pondría en rojo millones de líneas de código. Ese `any` se cuela por todas partes, incluido el ayudante «tipado» que aparece en muchos tutoriales, `fetchJson<T>(url): Promise<T>`. Compila sin un solo error, y su `<T>` es una aserción: el `parseJson<T>` de la lección «Genéricos» del módulo 2, que solo usa `T` en el retorno, o el `querySelector<T>` de la lección anterior:

[[exercise:03-fetch-json-generico-miente.md-]]

```text
🐛 total → 0165.00210.0095.00 | typeof → string
🐛 TypeError: product.price.toFixed is not a function
🐛 404 → {error: 'Asset not found'} | ¿array? → false | length → undefined
```

El catálogo antiguo tiene los precios en texto, y el total concatena. Peor aún, una errata en el nombre del archivo da un `404` cuyo cuerpo de error (`{error: 'Asset not found'}`) se convierte, sin que nada avise, en una «lista de productos» sin `length`. Las dos cosas que el capítulo 6 enseñó a comprobar en cada `fetch`, `response.ok` y la forma de los datos, siguen siendo responsabilidad tuya: los tipos no las hacen.

## Un `getJson<T>` que no miente

La versión honrada del ayudante junta tres piezas que ya conoces: comprobar `response.ok` (capítulo 6), guardar el JSON como `unknown` y convertirlo con un validador (módulo 2), y lanzar errores propios con los datos que necesite quien los trate (capítulo 5). El validador es un predicado de tipo con un segundo parámetro donde apunta los problemas, `(data: unknown, problems: string[]) => data is T`, y de él deduce TypeScript el `T`: quien llama a `getJson(url, isProductList)` recibe un `Product[]` sin escribir ningún tipo.

[[exercise:04-getjson-con-validador.md-]]

```text
✅ catalog.json → 3 productos · total $470
⚠️ catalog-v1.json no tiene la forma esperada (3 problemas): [0].price debe ser un número, llegó "165.00" | [1].price debe ser un número, llegó "210.00" | [2].price debe ser un número, llegó "95.00"
⛔ HttpError 404 · catalogo.json
```

Dentro de `getJson`, la única forma de llegar al `return data` es pasar el validador, así que no hay ningún `as`. Los errores propios usan las *parameter properties* de la lección 1 (`readonly status: number`) y sobrescriben `name` con `override name = 'HttpError'`, así que en la consola y en `String(error)` se ven con su nombre. Quien llama trata los dos fallos esperados con `instanceof`, que estrecha al tipo de cada clase (`error.status` es un `number`, `error.problems` un `string[]`), y deja subir todo lo demás.

## Los errores tipados

### El error de un `catch` es `unknown`

La lección 1 del módulo 1 lo anunció: con `strict` (la opción `useUnknownInCatchVariables`), la variable de un `catch` es `unknown`, y `error.message` es `TS18046`. En el código asíncrono se entiende por qué: a un mismo `catch` llegan cosas muy distintas, y algunas ni siquiera son errores.

[[exercise:05-catch-es-unknown.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 16: TS18046: 'error' is of type 'unknown'.
// Consola:
🐛 error.message → undefined
⚠️ biblioteca antigua → no es un Error: "Sin existencias de MOL-01"
⚠️ sin servidor → TypeError: Failed to fetch
⚠️ plazo de 50 ms → DOMException «TimeoutError»: signal timed out
⚠️ pedido inexistente → HttpError 404: HTTP 404 al pedir el pedido P-9999
⚠️ JSON roto → SyntaxError: Expected double-quoted property name in JSON at position 17 (line 1 column 18)
```

| Lo que falla | Lo que llega al `catch` | Cómo se reconoce |
|---|---|---|
| código que hace `throw 'texto'` | un `string` | `typeof error === 'string'` |
| `fetch` sin red, servidor apagado o CORS | `TypeError` | `instanceof TypeError` |
| un plazo (`AbortSignal.timeout`) o una cancelación | `DOMException` con `name` `'TimeoutError'` o `'AbortError'` | `instanceof DOMException` y su `name` |
| tus errores (`throw new HttpError(…)`) | tu clase | `instanceof HttpError` |
| `JSON.parse` o `response.json()` con texto roto | `SyntaxError` | `instanceof SyntaxError` |

El orden de las comprobaciones importa: `DOMException` hereda de `Error` en Chrome, y un `HttpError` también es un `Error`, así que lo más concreto va primero. `describe(error: unknown)` es una función que conviene tener en cualquier proyecto, porque convierte cualquier valor en un texto útil.

TypeScript no tiene forma de decir **qué** errores lanza una función: no hay nada parecido a las excepciones declaradas de Java (`throws HttpError`). Una firma `Promise<Product[]>` promete productos y calla todo lo demás. Si los fallos forman parte de lo que la función debe comunicar, hay otra opción.

> **Desde Python:** `except Exception as error:` ya filtra por clase, y mypy sabe que `error` es una `Exception`. En JavaScript no hay `except` por clase: el `catch` lo recibe todo, y por eso su tipo es `unknown` y el filtro se escribe con `instanceof`.

### `Result`: los fallos en el tipo

En vez de lanzar, una función puede **devolver** el fallo: un `Result<T, E>`, la unión discriminada de la lección 4 del módulo 1 (`{ ok: true; value: T } | { ok: false; error: E }`), con un caso de `E` por cada fallo esperado. Ya la usaste en los ejemplos profesionales del módulo 2. Aquí la clave es que cada caso lleve justo los datos que necesita quien lo trata (el `status` de un error HTTP, la lista de problemas de unos datos inválidos), y que un `switch` exhaustivo con `never` obligue a tratarlos todos:

[[exercise:06-result-en-vez-de-lanzar.md-]]

```text
Listo: pulsa cada botón para ver un resultado distinto
// Tras pulsar «Catálogo»:
✅ catalog.json → 3 productos: Mole negro, Café de Chiapas, Chocolate de metate
// Tras pulsar «Error 404» y «Error 500»:
⚠️ /api/demo/echo?status=404 → no existe (404)
⚠️ /api/demo/echo?status=500 → el servidor falló (500): reinténtalo en un momento
// Tras pulsar «Respuesta lenta (3 s)» (el aviso llega al cabo de 1 s):
⚠️ /api/demo/echo?delay=3000 → sin respuesta en 1 s: la petición se canceló
// Tras pulsar «Formato antiguo»:
⚠️ catalog-v1.json → datos inesperados: [0].price debe ser un número, llegó "165.00" (y 2 más)
// Tras pulsar «Sin servidor»:
⚠️ http://localhost:59999/ → no hay conexión con el servidor
```

La firma `Promise<Result<T>>` dice ahora todo lo que puede pasar, y quien llama no puede usar `result.value` sin mirar antes `result.ok`. Fíjate en que `requestJson` sigue lanzando lo **inesperado** (un error de programación no es un resultado). ¿Cuándo usar cada estilo? Lanzar es cómodo cuando casi nadie puede hacer nada con el fallo y basta con que suba hasta un `catch` general; un `Result` es mejor cuando cada llamada debe decidir qué hacer (mostrar un aviso, reintentar, marcar un campo), como en una interfaz.

## Cancelar y poner plazos

`AbortController`, `AbortSignal.timeout` y `AbortSignal.any` son los del capítulo 5, y con tipos se pueden escribir piezas reutilizables. Una tarea cancelable es una función `(signal: AbortSignal) => Promise<T>`, y `withDeadline<T>` le añade un plazo sin saber qué hace por dentro:

[[exercise:07-cancelar-con-tipos.md-]]

```text
✅ plazo de 2 s → 200
⏹️ plazo de 300 ms → TimeoutError: signal timed out
⏹️ cancelado a los 100 ms → AbortError: signal is aborted without reason
❓ cerrado con un motivo propio → Error: el usuario cerró el panel
panel.signal.reason → Error: el usuario cerró el panel
```

| Cancelación | `fetch` rechaza con |
|---|---|
| `AbortSignal.timeout(ms)` agotado | `DOMException` llamada `TimeoutError`: `signal timed out` |
| `controller.abort()` | `DOMException` llamada `AbortError`: `signal is aborted without reason` |
| `controller.abort(motivo)` | el `motivo`, tal cual |

La última fila es la razón de los tipos: `abort(reason?: any)` acepta cualquier valor y `signal.reason` es `any`, así que una cancelación puede llegar al `catch` como un `Error` normal, un texto o lo que sea. El predicado `isCancellation` solo reconoce las dos `DOMException` estándar; un motivo propio pasa a la rama siguiente.

## Promesas olvidadas

El fallo asíncrono más común es olvidar un `await`. TypeScript lo detecta **cuando usas el valor**: una `Promise<number>` no se puede sumar (`TS2365`), no tiene las propiedades del objeto (`TS2339`) y un `if (promesa)` siempre es cierto (`TS2801: This condition will always return true since this 'Promise<…>' is always defined.`). Pero si la llamada está sola en una línea y su resultado se ignora, no hay nada que comprobar:

[[exercise:08-promesa-flotante.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 22: TS2365: Operator '+' cannot be applied to types 'Promise<number>' and '1'.
// Consola:
🐛 unidades + 1 → [object Promise]1
✅ unidades + 1 → 4
✅ catch → HttpError: HTTP 500 al guardar el pedido P-1042
🐛 ¡pedido confirmado! (sin saber si se guardó)
🐛 el try terminó sin errores
Uncaught (in promise) HttpError: HTTP 500 al guardar el pedido P-1042
```

`saveOrder(pending)` sin `await` es una **promesa flotante**: `checkout` sigue sin esperar, anuncia un pedido confirmado y termina con éxito, así que el `try` de fuera no ve nada. Cuando la petición falla, nadie está escuchando y el rechazo acaba como `Uncaught (in promise)`. Con estas opciones del compilador, TypeScript no lo marca; en proyectos reales lo hace la regla `@typescript-eslint/no-floating-promises` de ESLint, que exige `await`, un `.catch(…)` o un `void` explícito. Ese `void promesa` es la forma de decir «no espero a propósito», y conviene que la promesa ya trate sus propios errores, como el `void send(…)` del último ejemplo profesional del módulo 2.

## Generadores asíncronos

Un generador asíncrono (`async function*`) produce valores de uno en uno, esperando entre medias, y se recorre con `for await`. Su tipo es `AsyncGenerator<T, TReturn, TNext>`: lo que produce, lo que devuelve al terminar y lo que recibe en cada `next()`. En la práctica solo importa el primero. Es una buena forma de tipar datos que llegan por partes, como las líneas de NDJSON que viste en «Streams y progreso»:

[[exercise:09-generador-asincrono.md-]]

```text
📦 1/4 · Bloque 1 de 4
📦 2/4 · Bloque 2 de 4
📦 3/4 · Bloque 3 de 4
📦 4/4 · Bloque 4 de 4
✅ bloques recibidos → 4
```

`readJsonLines` produce `unknown` (cada línea es un JSON que nadie ha comprobado) y `onlyValid<T>` lo convierte en `T` con un predicado, así que el `for await` final recibe objetos `Chunk` sin un solo `as`. Hay un detalle de LearnWeb: en el capítulo 6 recorriste `response.body` con `for await`, y aquí eso es `TS2504` («Type 'ReadableStream<…>' must have a '[Symbol.asyncIterator]()' method…»). Chrome lo permite, pero los tipos de que un `ReadableStream` sea iterable viven en una librería aparte, `DOM.AsyncIterable`, que LearnWeb no carga. En un proyecto propio se añade a la opción `lib` del `tsconfig.json` (lección 4); aquí, `getReader()` dentro de un generador hace el mismo trabajo.

> **Desde Python:** es `AsyncIterator[Chunk]` (o `AsyncGenerator[Chunk, None]`) con `async for`. La diferencia es el orden de los parámetros: en Python `AsyncGenerator[YieldType, SendType]`, y en TypeScript `AsyncGenerator<T, TReturn, TNext>`.

## Bestiario

- **`async function load(): Product`.**
  Síntoma: `TS1064: The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<number>'?`
  Causa: una función `async` siempre devuelve una promesa; la anotación describe lo que devuelve la llamada, no el `return`.
  Solución: `Promise<Product>`, o deja que TypeScript lo infiera.
  → [ver ejemplo](01-promise-de-t.md)
- **El `fetchJson<T>` que no comprueba nada.**
  Síntoma: un total que concatena o una «lista» sin `length`, sin ningún error de tipos.
  Causa: `response.json()` devuelve `Promise<any>`, y `any` cabe en cualquier `T`; el genérico es una aserción.
  Solución: `getJson<T>(url, validate)`: comprobar `response.ok`, guardar el JSON como `unknown` y devolver `T` solo si el validador lo confirma.
  → [ver ejemplo](03-fetch-json-generico-miente.md)
- **`error.message` en un `catch`.**
  Síntoma: `TS18046: 'error' is of type 'unknown'.`; sin el error, `undefined` cuando alguien lanzó un texto.
  Causa: a un `catch` llega cualquier valor: textos, `TypeError` de red, `DOMException` de cancelación, tus clases, `SyntaxError`.
  Solución: estrecha con `instanceof` (lo más concreto primero) o usa una función `describe(error: unknown): string`.
  → [ver ejemplo](05-catch-es-unknown.md)
- **La promesa flotante.**
  Síntoma: la página confirma algo que luego falla, el `try` no captura nada y aparece `Uncaught (in promise)`.
  Causa: una llamada `async` sin `await` cuyo resultado se ignora; TypeScript solo la detecta cuando se usa el valor (`TS2365`, `TS2339`, `TS2801`).
  Solución: `await` dentro del `try`; si no quieres esperar, `void promesa.catch(…)`; en tus proyectos, la regla `no-floating-promises` de ESLint.
  → [ver ejemplo](08-promesa-flotante.md)

## Resumen

- Una función `async` devuelve `Promise<T>`; `await` y `Awaited<T>` quitan el `Promise` del valor y del tipo.
- `Promise.all` con un array literal da una tupla con el tipo de cada posición; `allSettled`, una unión discriminada por `status`.
- `response.json()` es `Promise<any>`: un `fetchJson<T>` sin validación es una aserción. Guarda el JSON como `unknown` y valida.
- `getJson<T>(url, validate)` deduce `T` del predicado y lanza errores propios (`HttpError`, `ValidationError`) que se distinguen con `instanceof`.
- El error de un `catch` es `unknown`: textos, `TypeError`, `DOMException` (`TimeoutError`, `AbortError`), tus clases o `SyntaxError`.
- Un `Result<T, E>` pone los fallos esperados en el tipo, y un `switch` con `never` obliga a tratarlos todos.
- Una promesa sin `await` cuyo valor se ignora no da ningún aviso; usa `await`, `void` con su propio `.catch`, o `no-floating-promises`.
- `AsyncGenerator<T>` tipa datos que llegan por partes; con un predicado, el `for await` recibe valores ya comprobados.

## Para profundizar

- [Manual de TypeScript: la opción useUnknownInCatchVariables (en inglés)](https://www.typescriptlang.org/tsconfig/#useUnknownInCatchVariables)
- [MDN: AbortSignal.timeout() y AbortSignal.any() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
- [typescript-eslint: la regla no-floating-promises (en inglés)](https://typescript-eslint.io/rules/no-floating-promises/)
- [Notas de TypeScript 3.6: tipos más estrictos para generadores (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-6.html#stricter-generators)
- [MDN: for await…of (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)
