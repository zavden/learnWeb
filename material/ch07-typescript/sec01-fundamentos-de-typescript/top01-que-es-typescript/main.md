# Qué es TypeScript

## Por qué importa

Repasa los Bestiarios del capítulo 5: una errata en una propiedad que devuelve `undefined` sin avisar, un `+` que concatena en vez de sumar, un `null` que revienta una línea más abajo, una función llamada con un argumento de menos. Todos tienen algo en común: JavaScript solo los descubre **al ejecutar** la línea, y a veces ni eso. TypeScript es JavaScript con una capa de **tipos** que una herramienta comprueba **antes** de ejecutar nada, mientras escribes. Casi todos esos fallos pasan a ser un subrayado rojo en el editor.

Hoy la mayoría de los proyectos web grandes están escritos en TypeScript, y las APIs que verás al final del curso (WebGPU, los módulos de WebAssembly) se documentan con sus tipos. Esta lección explica qué es exactamente, qué pasa con los tipos cuando el código se ejecuta (desaparecen) y cómo te enseña LearnWeb los errores.

## JavaScript con tipos

TypeScript es un **superconjunto** de JavaScript: todo lo que sabes del capítulo 5 sigue valiendo, con la misma sintaxis y el mismo comportamiento. Lo que añade son **anotaciones de tipo**, que se escriben con dos puntos después de un nombre, y unas pocas declaraciones nuevas, como `type`:

```ts
function formatPrice(cents: number, currency: string = 'MXN'): string {
  return `$${(cents / 100).toFixed(2)} ${currency}`;
}
```

`cents: number` dice que el parámetro es un número; el `: string` tras los paréntesis, que la función devuelve un texto. Si borras las anotaciones, lo que queda es JavaScript normal. El ejemplo añade un tipo con nombre para los productos y deja que TypeScript deduzca el resto:

[[exercise:01-de-javascript-a-typescript.md-]]

```text
Café de Chiapas · $210.00 MXN · orgánico, en grano
en dólares → $12.50 USD
3 bolsas → $630.00 MXN
```

Fíjate en `bags` y `total`: no llevan anotación y no la necesitan. TypeScript **infiere** su tipo a partir del valor inicial (`3` es un `number`, y un número por otro da un `number`). Anotar solo lo imprescindible y dejar que la inferencia haga el resto es el estilo habitual; la lección siguiente lo explica.

> **Desde Python:** TypeScript es a JavaScript lo que las *type hints* más **mypy** son a Python. En los dos casos las anotaciones no cambian lo que hace el programa, y una herramienta aparte las comprueba: `mypy programa.py` en Python, `tsc` (el compilador de TypeScript) o el propio editor en TypeScript.

La traducción de los tipos más comunes:

| Python | TypeScript | Notas |
|---|---|---|
| `int`, `float` | `number` | JavaScript tiene un solo tipo de número |
| `str` | `string` | |
| `bool` | `boolean` | |
| `list[str]` | `string[]` | lección 2 |
| `tuple[str, int]` | `[string, number]` | lección 2 |
| `Optional[str]` / `str \| None` | `string \| null` | lecciones 2 y 4 |
| `Any` | `any` (y mejor `unknown`) | lección 2 |
| `-> None` | `: void` | lección 2 |
| `TypedDict`, `Protocol` | `type`, `interface` | lección 3 |
| `Literal["S", "M"]` | `'S' \| 'M'` | lección 5 |
| `Callable[[int], str]` | `(n: number) => string` | lección 6 |

## Dos trabajos distintos: comprobar y borrar

El navegador no entiende TypeScript: solo ejecuta JavaScript. Por eso, antes de ejecutar un archivo `.ts`, alguien tiene que hacer dos trabajos, que son **independientes**:

```text
                ┌──► verificador de tipos ──► lista de errores (en rojo)
script.ts ──────┤
                └──► borrado de tipos ──► script.js ──► navegador
```

El **verificador** lee el código y busca contradicciones entre tipos y valores. El **transpilador** quita las anotaciones y los `type`, y deja el JavaScript que se ejecuta. Lo importante es que el segundo no espera al primero: el JavaScript se genera y se ejecuta **aunque haya errores de tipos**. Es lo que hace `tsc` con su configuración por defecto, y lo que hace LearnWeb (con TypeScript 5.9, generando JavaScript moderno, ES2022).

El ejemplo enseña el resultado del borrado. `toString()` de una función devuelve su código fuente, que aquí es el JavaScript que generó TypeScript:

[[exercise:02-los-tipos-se-borran.md-]]

```text
Lucía Méndez: 3 noches, $4350
function nightsLabel(booking, nightlyRate) {
    const total = booking.nights * nightlyRate;
    return `${booking.guest}: ${booking.nights} noches, $${total}`;
}
¿existe 'nightsLabel'? → true
¿existe 'Booking'? → false
```

Las anotaciones han desaparecido, y la sangría también ha cambiado (TypeScript reescribe el código con cuatro espacios). El tipo `Booking` no ha dejado nada en la página. A esto se le llama **borrado de tipos** (*type erasure*): los tipos solo existen mientras escribes. Casi todo lo que verás en este capítulo se borra igual; las dos excepciones, `enum` y las *parameter properties* de las clases, generan código de verdad y se verán en la lección 5 y en el módulo 3. Para verlo sin `toString()`, los bloques de código de los ejemplos en TypeScript de esta teoría tienen, junto a la pestaña `script.ts`, una pestaña `compiled.js` con el JavaScript que genera TypeScript: el que de verdad se ejecuta. Empieza por `"use strict";`, que añade la configuración `strict` (la verás al final de la lección).

> **Desde Python:** aquí hay una diferencia real. En Python las anotaciones se guardan en ejecución (`nights_label.__annotations__` las devuelve) aunque nadie las compruebe. En TypeScript no queda ni rastro.

El JavaScript que ejecuta LearnWeb es un script clásico, como en los capítulos anteriores, así que la regla de los nombres globales sigue valiendo (nada de `name`, `status` o `top` como variables globales). El verificador, en cambio, analiza cada ejemplo como un módulo independiente.

## Los errores de tipos en LearnWeb

Cuando el verificador encuentra un problema, LearnWeb lo muestra en varios sitios:

- En el **editor**: la línea se subraya en rojo, aparece una marca en el margen y la lista «Compile» de la barra de estado da el mensaje con su posición, por ejemplo `TS2322: Type 'string' is not assignable to type 'number'.` en `script.ts:5:7` (línea 5, columna 7).
- En el diálogo **«▶ Run»** de la teoría: una franja titulada «Errores de tipos (el código se ejecuta igual)», encima de la consola, con una línea por error.
- Las tarjetas de la galería y las vistas previas incrustadas en la teoría **no** muestran errores de tipos: ábrelas con «▶ Run» o en el editor.

En todos los casos, el código **se ejecuta igual**. Este ejemplo tiene un error de tipos a propósito, y su consola enseña lo que pasa al ejecutarlo de todos modos:

[[exercise:03-error-en-rojo-pero-corre.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 5: TS2322: Type 'string' is not assignable to type 'number'.
// Consola:
quantity → 2 | string
subtotal → 420
🐛 una bolsa más → 21
✅ una bolsa más → 3
```

A partir de este ejemplo, los bloques de salida de este capítulo siguen ese formato: primero los errores de tipos, tal como los escribe TypeScript, y después la consola. Los ejemplos sin errores muestran solo la consola.

Los mensajes de TypeScript están en inglés y tienen siempre la misma estructura: un **código** (`TS2322`) y una frase. Este dice «el tipo `string` no se puede asignar al tipo `number`». Merece la pena aprender a leer los más frecuentes, porque buscar el código en internet lleva directo a explicaciones y soluciones. Fíjate también en que, después del error, TypeScript **se cree la anotación**: para él `quantity` es un `number`, así que `unitPrice * quantity` y `quantity + 1` no salen en rojo, aunque el segundo concatene. Un error de tipos se corrige donde aparece, no más abajo.

En los ejemplos del curso, cada línea con un error de tipos hecho a propósito lleva un comentario `// ❌ Error TS2322 a propósito: …` que explica qué falla.

## Lo que TypeScript detecta

¿Qué tipo de fallos encuentra el verificador? Los que en JavaScript dan `undefined`, `NaN` o un `TypeError` al ejecutar. El ejemplo tiene cuatro, cada uno con su código de error:

[[exercise:04-lo-que-typescript-detecta.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 9: TS2551: Property 'titel' does not exist on type 'Product'. Did you mean 'title'?
línea 12: TS2554: Expected 2 arguments, but got 1.
línea 15: TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
línea 19: TS2551: Property 'toUppercase' does not exist on type 'string'. Did you mean 'toUpperCase'?
// Consola:
1 → undefined
2 → $180.00 undefined
3 → NaN
4 → ⛔ TypeError: mug.title.toUppercase is not a function
✅ TAZA DE BARRO $180.00 MXN
```

Los tres primeros son fallos silenciosos: JavaScript sigue adelante con un `undefined` o un `NaN` que aparecerá, mucho después, en la pantalla del usuario. TypeScript los marca en la línea exacta, e incluso sugiere el nombre correcto («Did you mean…?»). Además, como conoce el tipo de cada valor, el editor puede autocompletar propiedades y métodos.

## Los tipos no existen en ejecución

El borrado de tipos tiene una consecuencia que sorprende al principio: **no puedes preguntar por un tipo mientras el código se ejecuta**. `typeof` sigue siendo el operador de JavaScript, que solo conoce sus ocho respuestas (`'string'`, `'number'`, `'object'`…), e `instanceof` necesita una clase o una función constructora, algo que exista en la página:

[[exercise:05-typeof-no-conoce-tus-tipos.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 7: TS2367: This comparison appears to be unintentional because the types '"string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function"' and '"Order"' have no overlap.
línea 13: TS2693: 'Order' only refers to a type, but is being used as a value here.
// Consola:
typeof order → object
⛔ ReferenceError: Order is not defined
✅ instanceof Invoice → true
✅ typeof Invoice → function
```

TypeScript avisa en los dos casos. El primer mensaje dice que `typeof` solo puede dar uno de esos ocho textos, así que compararlo con `'Order'` no tiene sentido. El segundo, que `Order` es solo un tipo y se está usando como un valor. Las clases son distintas: una clase es JavaScript, existe en ejecución y funciona con `instanceof`.

### Los datos de fuera

La segunda consecuencia es más peligrosa. Los datos que llegan de fuera del programa (una respuesta de `fetch`, `localStorage`, un archivo) son texto que se convierte en objetos **cuando el código ya se está ejecutando**, y TypeScript no puede saber qué contendrán. Por eso `JSON.parse` devuelve `any`, un tipo que desactiva el verificador, y TypeScript acepta cualquier anotación sobre su resultado:

[[exercise:06-json-es-any.md-]]

```text
typeof order.total → string
⛔ TypeError: order.total.toFixed is not a function
✅ P-1042 → 350.50
```

No hay ningún error rojo y el programa falla igual: la anotación `Order` es una promesa que nadie ha comprobado. Los tipos describen lo que **esperas**, no lo que llega. La defensa es comprobar y convertir los datos en la frontera, justo al recibirlos, como hace la parte ✅ del ejemplo; el módulo 2 enseña a hacerlo de forma sistemática.

## `strict`: el modo que usa este curso

TypeScript se configura con un archivo `tsconfig.json`, y su opción más importante es `strict: true`. No es un solo control, sino un paquete de comprobaciones que, sin ella, están apagadas. LearnWeb las activa todas, como `tsc --init` en un proyecto nuevo:

| Opción incluida en `strict` | Qué comprueba | Dónde se ve |
|---|---|---|
| `noImplicitAny` | un parámetro sin tipo no puede quedar como `any` en silencio | esta lección |
| `strictNullChecks` | `null` y `undefined` no caben en cualquier tipo | lección 2 |
| `useUnknownInCatchVariables` | el error de un `catch` es `unknown`, no `any` | esta lección |
| `strictFunctionTypes`, `strictBindCallApply` | tipos de funciones y llamadas con `call`/`apply`/`bind` | lección 6 |
| `noImplicitThis` | un `this` sin tipo conocido es un error | lección 6 |
| `strictPropertyInitialization` | cada campo de una clase recibe valor en el constructor | módulo 3 |
| `alwaysStrict` | analiza el código como JavaScript en modo estricto y empieza el JavaScript generado por `"use strict";` (un módulo, con `import`/`export`, ya lo es) | lecciones 3 y 6 |

La lista completa (hay alguna opción más) está en la referencia de `tsconfig`. Sin `strict`, TypeScript es mucho más permisivo y deja pasar justo los fallos que más interesan. Dos de estas opciones aparecen ya en esta lección. La primera, `noImplicitAny`: TypeScript no adivina el tipo de un parámetro a partir de cómo llamas a la función, así que hay que anotarlo:

[[exercise:07-parametro-sin-tipo.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 2: TS7006: Parameter 'subtotal' implicitly has an 'any' type.
línea 2: TS7006: Parameter 'shipping' implicitly has an 'any' type.
línea 14: TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
// Consola:
🐛 → 50099
✅ → 599
🐛 → 50099
```

Con los parámetros anotados, el error se mueve a donde está el fallo de verdad: la llamada que pasa `'500'`. Esa es la idea de todo el capítulo: que el rojo aparezca en la línea que hay que cambiar.

La segunda, `useUnknownInCatchVariables`, afecta a un patrón que usaste en muchos ejemplos del capítulo 5. En JavaScript se puede lanzar **cualquier** valor (`throw 'Sin existencias'` es legal), así que la variable de un `catch` es `unknown`, un tipo que no deja hacer nada hasta comprobar qué es:

[[exercise:08-catch-recibe-unknown.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS18046: 'error' is of type 'unknown'.
// Consola:
🐛 Cantidad no válida: «dos»
✅ RangeError | Cantidad no válida: «0»
✅ Sin existencias
```

En los ejemplos de este capítulo verás las dos soluciones: `if (error instanceof Error)` antes de leer `.message`, o `String(error)`, que convierte cualquier valor en texto (`"TypeError: …"` para un error). La lección 2 explica `unknown` frente a `any`.

## Bestiario

- **El rojo que no frena nada.**
  Síntoma: un error de tipos en el editor (`TS2322: Type 'string' is not assignable to type 'number'.`) y, aun así, el programa se ejecuta y da resultados raros (`'21'` en vez de `3`).
  Causa: verificar y generar JavaScript son trabajos independientes; el JavaScript se ejecuta aunque haya errores, y después del error TypeScript se fía de la anotación.
  Solución: trata cada error de tipos como un fallo y corrígelo en la línea que marca (aquí, `Number('2')`).
  → [ver ejemplo](03-error-en-rojo-pero-corre.md)
- **Erratas, argumentos olvidados y operaciones imposibles.**
  Síntoma: `TS2551 … Did you mean 'title'?`, `TS2554: Expected 2 arguments, but got 1.`, `TS2362` en una multiplicación.
  Causa: es el código que en JavaScript daría `undefined`, `NaN` o un `TypeError` al ejecutar.
  Solución: lee el mensaje (y la sugerencia «Did you mean…?») y corrige la línea; no lo silencies.
  → [ver ejemplo](04-lo-que-typescript-detecta.md)
- **Preguntar por un tipo en ejecución.**
  Síntoma: `TS2367` al comparar `typeof x === 'Order'`; `TS2693: 'Order' only refers to a type…` y un `ReferenceError` con `x instanceof Order`.
  Causa: los tipos se borran antes de ejecutar; `typeof` solo conoce los tipos de JavaScript e `instanceof` necesita un valor real.
  Solución: usa una clase si necesitas `instanceof`; para objetos sueltos, comprueba sus propiedades (lección 4).
  → [ver ejemplo](05-typeof-no-conoce-tus-tipos.md)
- **Los datos de fuera mienten y nadie avisa.**
  Síntoma: `TypeError: order.total.toFixed is not a function` en un código sin ningún error rojo.
  Causa: `JSON.parse` devuelve `any`; cualquier anotación sobre su resultado se acepta sin comprobar nada.
  Solución: comprueba y convierte los datos al recibirlos (`Number(raw.total)`, `typeof raw.id === 'string'`); el módulo 2 lo hace de forma sistemática.
  → [ver ejemplo](06-json-es-any.md)
- **Parámetros sin tipo.**
  Síntoma: `TS7006: Parameter 'subtotal' implicitly has an 'any' type.`
  Causa: con `strict` (`noImplicitAny`), TypeScript no deduce los tipos de los parámetros.
  Solución: anota cada parámetro; el resto (variables locales, retornos) se puede dejar a la inferencia.
  → [ver ejemplo](07-parametro-sin-tipo.md)
- **`error.message` en un `catch`.**
  Síntoma: `TS18046: 'error' is of type 'unknown'.`
  Causa: en JavaScript se puede lanzar cualquier valor; con `strict`, la variable del `catch` es `unknown`.
  Solución: `if (error instanceof Error)` antes de usar sus propiedades, o `String(error)`.
  → [ver ejemplo](08-catch-recibe-unknown.md)

## Resumen

- TypeScript es JavaScript con anotaciones de tipo (`cents: number`, `): string`) y declaraciones como `type`; sin ellas, queda JavaScript normal.
- Lo que no anotas, TypeScript lo infiere del valor inicial.
- Comprobar los tipos y generar el JavaScript son trabajos independientes: el código se ejecuta **aunque haya errores de tipos**.
- En LearnWeb los errores salen en rojo en el editor (y en la lista «Compile») y en la franja del diálogo «▶ Run»; las tarjetas no los muestran.
- Los tipos se borran: no existen en ejecución, `typeof` no los conoce e `instanceof` solo funciona con clases.
- Los datos de fuera (`JSON.parse`) son `any`: los tipos no validan nada, hay que comprobar al recibir.
- `strict` activa un paquete de comprobaciones; con él, los parámetros necesitan tipo y el error de un `catch` es `unknown`.

## Para profundizar

- [Manual de TypeScript: TypeScript para programadores de JavaScript (en inglés)](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [Manual de TypeScript: lo básico, borrado de tipos y strict (en inglés)](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [Referencia de tsconfig: strict (en inglés)](https://www.typescriptlang.org/tsconfig/#strict)
- [TypeScript Playground: ve el JavaScript generado y los errores (en inglés)](https://www.typescriptlang.org/play)
