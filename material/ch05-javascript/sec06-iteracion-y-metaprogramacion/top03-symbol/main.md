# Symbol

## Por qué importa

En la lección «Tipos primitivos» conociste `symbol`, el séptimo primitivo, con una promesa: servía para crear claves de propiedad que no chocan con nada. Desde entonces lo has usado sin detenerte en él: `[Symbol.iterator]()` en tus clases, `Symbol.toPrimitive`, `Symbol.toStringTag`. Esta lección lo estudia a fondo.

Los símbolos resuelven un problema que Python resuelve con convenciones de nombres. Cuando el lenguaje, una librería y tu código quieren poner métodos en los mismos objetos, los nombres de texto pueden chocar: dos librerías que añaden `format` se pisan, y un método `values` tuyo podría tapar uno estándar. Un símbolo es un nombre que **nadie más puede escribir por accidente**. Por eso JavaScript los usa para sus protocolos, los **símbolos bien conocidos**, que son el equivalente de los métodos mágicos `__iter__`, `__str__` o `__instancecheck__` de Python.

## Valores únicos

`Symbol('descripción')` crea un valor **nuevo** cada vez que se llama. Dos símbolos con la misma descripción son distintos: la descripción solo sirve para depurar (la ves en la consola y en `sym.description`), no los identifica. Es un primitivo, como `number` o `string`, así que no se crea con `new`:

[[exercise:01-simbolos-unicos.md-]]

```text
typeof → symbol
orderId === userId → false
orderId === orderId → true
description → id
en la consola → Symbol(id) Symbol(id)
new Symbol → TypeError | Symbol is not a constructor
/api/precio/cafe → en caché: 210
/api/precio/agotado → en caché: undefined
/api/precio/pan → hay que pedirlo al servidor
```

La segunda parte del ejemplo muestra un uso que no tiene que ver con claves: un **centinela**, un valor especial que una función devuelve para decir «no hay nada» cuando `undefined` y `null` podrían ser datos válidos. Como el símbolo solo es igual a sí mismo, ningún dato puede confundirse con él.

> **Desde Python:** Python no tiene un tipo `symbol`. El centinela se escribe `_MISSING = object()`, un objeto que solo es igual a sí mismo: la misma idea.

## Símbolos como claves

Un símbolo puede ser la **clave** de una propiedad: `obj[sym] = valor`, o `{ [sym]: valor }` en un literal (los corchetes son un nombre calculado, como en `[Symbol.iterator]()`). Las claves symbol son invisibles para todo lo que recorre claves de texto: `Object.keys`, `Object.entries`, `for…in` y `JSON.stringify`. Para verlas hay que pedirlas a propósito, con `Object.getOwnPropertySymbols(obj)` o con `Reflect.ownKeys(obj)`, que devuelve las de texto y las symbol juntas (`Reflect` es el tema de la lección «Proxy y Reflect»):

[[exercise:02-claves-symbol.md-]]

```text
order → {id: 'P-2041', total: 870, [Symbol(validatedAt)]: '2026-10-13T15:00:00Z'}
order[validatedAt] → 2026-10-13T15:00:00Z
validatedAt in order → true
Object.keys → (2) ['id', 'total']
Object.entries → [["id","P-2041"],["total",870]]
for…in → (2) ['id', 'total']
JSON → {"id":"P-2041","total":870}
getOwnPropertySymbols → [Symbol(validatedAt)]
Reflect.ownKeys → (3) ['id', 'total', Symbol(validatedAt)]
spread → [Symbol(validatedAt)]
structuredClone → []
tras «hackear» → falsificado
```

Ojo con dos detalles. El spread y `Object.assign` **sí** copian las claves symbol enumerables, mientras que `structuredClone` las descarta. Y «oculta» no significa «privada»: `getOwnPropertySymbols` encuentra la clave y cualquiera puede usarla. Las claves symbol sirven para **evitar choques**, no para proteger datos; para eso están los campos `#privados` (lección «Encapsulación»). Es lo que hacía el inspector de prototipos del módulo «Objetos y prototipos» cuando listaba las claves con `getOwnPropertySymbols`.

## Métodos que no chocan

Esa es la aplicación principal: añadir métodos o datos a objetos que **no son tuyos**, o que comparten varias partes del código, sin riesgo de pisar a nadie. Dos librerías que añaden un método `format` al mismo objeto se pisan (gana la última en cargarse); con un símbolo cada una, conviven. Del mismo modo puedes definir **protocolos propios**: una función de log que usa el método `[describe]()` de un objeto si lo tiene, sin miedo a que un objeto tenga un `describe` de texto con otro significado:

[[exercise:03-metodos-sin-colisiones.md-]]

```text
🐛 la de precios → <b>Café de Chiapas</b>
✅ precios → Café de Chiapas: $210.00
✅ HTML → <b>Café de Chiapas</b>
✅ claves de texto intactas → (2) ['name', 'cents']
  log: {"table":4}
  log: Mesa 4 🍽️
steps[last]() → filtrar
for…in → (3) ['0', '1', '2']
```

La última parte cumple lo que prometía la lección «Prototipos nativos»: un método añadido a `Array.prototype` con clave symbol no aparece en ningún `for…in` (aunque se añada con una asignación normal, enumerable) y no puede chocar con un método que el estándar añada mañana. Sigue siendo un cambio en un objeto que comparte toda la página, así que resérvalo para tu propio código. Node.js usa esta técnica para que tus objetos personalicen cómo los imprime: su `util.inspect` busca un método con la clave `Symbol.for('nodejs.util.inspect.custom')`.

## `Symbol.for`: el registro global

Si cada parte del código crea su símbolo con `Symbol('…')`, cada una tiene el **suyo**, aunque la descripción sea la misma. Dos módulos que acuerdan «guardar el precio original en la clave symbol `tienda.precioOriginal`» y la crean por separado no se encuentran nunca: el dato existe, pero es inalcanzable. Para compartir un símbolo sin pasarlo de mano en mano está **`Symbol.for(clave)`**, que busca en un registro global: la primera llamada crea el símbolo y las siguientes, desde cualquier parte, devuelven el mismo. `Symbol.keyFor(sym)` hace el camino inverso:

[[exercise:04-symbol-for.md-]]

```text
🐛 precio original → 12000
🐛 ¿iguales? → false
🐛 claves symbol → [Symbol(tienda.precioOriginal)]
✅ precio original → 9000 | rebajado → 6750
✅ ¿iguales? → true
keyFor(registrado) → tienda.precioOriginal
keyFor(local) → undefined
keyFor(Symbol.iterator) → undefined
```

El registro es único para toda la página, incluidos sus `<iframe>` del mismo origen, que tienen sus propios `Array` y `Object` pero comparten los símbolos registrados. Su desventaja es la misma que la de los nombres de texto: es un espacio compartido, así que usa claves con prefijo (`'tienda.precioOriginal'`). Los símbolos bien conocidos no están en el registro (`Symbol.keyFor(Symbol.iterator)` es `undefined`), pero también son los mismos en todos los marcos.

> **Desde Python:** `Symbol.for` se parece a `sys.intern` para strings: el mismo texto da siempre el mismo objeto. La diferencia es que un símbolo registrado sigue sin poder confundirse con un string.

## Los símbolos no son texto

Casi todos los primitivos se convierten solos en texto: `'Total: ' + 42` o `` `${true}` `` funcionan. Los símbolos **no**: concatenarlos, meterlos en una plantilla o usarlos en una operación aritmética lanza un `TypeError`. Solo las conversiones **explícitas** funcionan: `String(sym)`, `sym.toString()` y `sym.description`. Y `JSON.stringify` se comporta como con las funciones: descarta las claves symbol y los valores symbol (dentro de un array, los cambia por `null`):

[[exercise:05-los-simbolos-no-son-texto.md-]]

```text
🐛 concatenar → TypeError | Cannot convert a Symbol value to a string
🐛 plantilla → TypeError | Cannot convert a Symbol value to a string
🐛 aritmética → TypeError | Cannot convert a Symbol value to a number
✅ String() → Symbol(urgente)
✅ toString() → Symbol(urgente)
✅ description → Prioridad: urgente
🐛 JSON → {"id":"T-381","subject":"La impresora no imprime"}
🐛 en un array → [null]
✅ JSON → {"id":"T-381","subject":"La impresora no imprime","priority":"urgente"}
```

Es una decisión de diseño: un símbolo es un **identificador**, y convertirlo sin querer en el texto `'Symbol(urgente)'` casi siempre es un bug. Si un símbolo es un dato que hay que guardar o enviar, tradúcelo tú (con un `toJSON`, lección «JSON y copias») y reconstrúyelo al leer.

## Los símbolos bien conocidos

El lenguaje define una quincena de símbolos, guardados como propiedades de `Symbol`, que usa como claves de sus **protocolos**: cuando necesita recorrer un objeto, busca `obj[Symbol.iterator]`; cuando necesita convertirlo, `obj[Symbol.toPrimitive]`. Los objetos nativos están escritos con esos mismos protocolos (el iterador de un array **es** su método `values`, la etiqueta de un `Map` es una propiedad `Map.prototype[Symbol.toStringTag]`), así que tus clases pueden comportarse exactamente como ellos:

[[exercise:06-simbolos-bien-conocidos.md-]]

```text
15 símbolos bien conocidos → asyncDispose, asyncIterator, dispose, hasInstance, isConcatSpreadable, iterator, match, matchAll, replace, search, species, split, toPrimitive, toStringTag, unscopables
Array.prototype[Symbol.iterator] === values → true
Map.prototype[Symbol.toStringTag] → Map
Date.prototype[Symbol.toPrimitive] → function
Function.prototype[Symbol.hasInstance] → function
Array[Symbol.species] === Array → true
spread → (3) ['09:00', '09:30', '11:00']
plantilla → Dra. Ramírez: 09:00, 09:30, 11:00
número de citas → 3 | ¿más de 2? → true
etiqueta → [object Timetable]
concat → ["09:00","17:00","17:30"]
concat sin abrir → ["09:00",["17:00","17:30"]]
```

La tabla resume cada uno con lo que lo dispara y su pariente en Python. Ya conoces `Symbol.iterator`, `Symbol.toPrimitive` y `Symbol.toStringTag` (lección «Polimorfismo y protocolos») y `Symbol.species` (lección «Herencia con extends»):

| Símbolo | Lo usa… | Python |
|---------|---------|--------|
| `Symbol.iterator` | `for…of`, spread, desestructuración, `Array.from` | `__iter__` |
| `Symbol.asyncIterator` | `for await…of` (módulo de asincronía) | `__aiter__` |
| `Symbol.toPrimitive` | `+`, `` `${x}` ``, `<`, `==`, `String(x)`, `Number(x)` | `__str__`, `__int__`, `__float__`, `__format__` |
| `Symbol.toStringTag` | `Object.prototype.toString` | `type(x).__name__` |
| `Symbol.hasInstance` | `instanceof` | `__instancecheck__` |
| `Symbol.species` | `map`, `filter`, `slice`… de las subclases de `Array` | — |
| `Symbol.isConcatSpreadable` | `concat`: ¿abrir el objeto o meterlo entero? | — |
| `Symbol.dispose`, `Symbol.asyncDispose` | `using`, `await using` | `__exit__`, `__aexit__` |
| `Symbol.match`, `matchAll`, `replace`, `search`, `split` | los métodos de los strings con expresiones regulares | — |
| `Symbol.unscopables` | la sentencia obsoleta `with` | — |

La diferencia con Python es de fondo: Python busca los métodos mágicos por su **nombre**, y por eso reserva los nombres con doble guion bajo. JavaScript los busca por un **símbolo**, así que un método tuyo llamado `iterator` o `toPrimitive` nunca choca con el protocolo.

### `Symbol.hasInstance`: cómo funciona `instanceof`

En la lección «Funciones constructoras y new» escribiste `myInstanceOf`, que recorría la cadena de prototipos buscando `C.prototype`, y quedó pendiente cómo cambiar `instanceof`. La respuesta: `x instanceof C` llama a `C[Symbol.hasInstance](x)`. Todas las funciones heredan de `Function.prototype` una versión que hace el recorrido de `myInstanceOf`, y una clase puede redefinirla con un método **estático**:

[[exercise:07-symbol-hasinstance.md-]]

```text
instanceof → true
llamado a mano → true
¿propio de Product? → false
descriptor heredado → {value: ƒ, writable: false, enumerable: false, configurable: false}
tras asignar → true | ¿propio? → false
4 instanceof EvenNumber → true
7 y "4" → false false
instanceof Priced → (3) ['Atole: true', 'Muestra gratis: false', 'Lámpara de barro: false']
```

Fíjate en la línea «tras asignar». La versión heredada tiene `writable: false`, y una asignación que encuentra en la cadena una propiedad de solo lectura no crea la propia: falla en silencio en un script clásico (la segunda excepción de la lección «La cadena de prototipos»). `static` no asigna, **define** la propiedad, por eso funciona. Con `Symbol.hasInstance`, `instanceof` puede responder incluso para primitivos (`4 instanceof EvenNumber`), algo que la versión normal nunca hace.

> **Desde Python:** es `__instancecheck__`, pero Python lo busca en la **metaclase** (`type(cls)`), así que hace falta una metaclase o una ABC con `__subclasshook__`; JavaScript lo busca en la propia clase.

### Nuevo: `using` y `Symbol.dispose`

El protocolo más reciente resuelve un problema que hasta ahora se resolvía con `try/finally`: liberar un recurso (cerrar una conexión, un archivo, un temporizador) pase lo que pase. Un objeto **desechable** tiene un método `[Symbol.dispose]()`, y una declaración `using` (como `const`, pero con limpieza) lo llama al salir del bloque, también si sale por un error. Si hay varios, se liberan en orden **inverso** al de su creación:

[[exercise:08-using-y-symbol-dispose.md-]]

```text
▶ salida normal
  🔌 abro ventas
  🔌 abro inventario
  consulta → ventas ← total de octubre
  consulta → inventario ← productos agotados
  🔌 cierro inventario
  🔌 cierro ventas
  resultado → informe listo
▶ con un error
  🔌 abro ventas
  🔌 cierro ventas
  ⛔ la consulta tardó demasiado (la conexión ya estaba cerrada)
▶ lo mismo con try/finally
  🔌 abro ventas
  consulta → ventas ← total de octubre
  🔌 cierro ventas
```

`using` llegó a Chrome en la versión 134 (marzo de 2025), así que verás mucho código que todavía usa `try/finally`. En un script clásico, `using` solo puede ir dentro de un bloque o de una función (en el nivel superior es un `SyntaxError`). Existe también `DisposableStack`, que agrupa varias limpiezas, y la versión asíncrona, `await using` con `Symbol.asyncDispose`, que verás en el módulo de asincronía.

> **Desde Python:** es el `with`: `[Symbol.dispose]()` hace de `__exit__`, y no hay `__enter__` (la variable recibe el propio objeto). `DisposableStack` es el `contextlib.ExitStack`.

## Bestiario

- **Dos símbolos «iguales» que no se encuentran.**
  Síntoma: una parte del código guarda un dato en una clave symbol y otra, que crea «el mismo» símbolo con la misma descripción, lee `undefined`.
  Causa: cada `Symbol('x')` crea un valor nuevo; la descripción no lo identifica.
  Solución: comparte la variable con el símbolo, o usa `Symbol.for('prefijo.clave')`, que devuelve siempre el mismo.
  → [ver ejemplo](04-symbol-for.md)
- **El símbolo que rompe un mensaje y desaparece del JSON.**
  Síntoma: `TypeError: Cannot convert a Symbol value to a string` al concatenar o al usar una plantilla; claves o valores que faltan tras `JSON.stringify`.
  Causa: los símbolos no se convierten solos en texto ni en número, y JSON los ignora.
  Solución: convierte explícitamente con `String(sym)` o `sym.description`, y serializa con un `toJSON` que los traduzca.
  → [ver ejemplo](05-los-simbolos-no-son-texto.md)

## Resumen

- `Symbol('desc')` crea un primitivo único; la descripción es para depurar. Sirve de centinela y de clave.
- Las claves symbol no salen en `Object.keys`, `for…in` ni JSON; sí en `getOwnPropertySymbols` y `Reflect.ownKeys`. Ocultas, no privadas.
- Con claves symbol, varias librerías pueden añadir métodos a los mismos objetos sin pisarse.
- `Symbol.for(clave)` devuelve el mismo símbolo en toda la página; `Symbol.keyFor` da su clave.
- Los símbolos no se convierten solos en texto: `String(sym)` o `sym.description`.
- Los símbolos bien conocidos son las claves de los protocolos: el equivalente de los métodos mágicos de Python, sin choques de nombres.
- `instanceof` llama a `C[Symbol.hasInstance]`; se redefine con `static`. `using` llama a `[Symbol.dispose]()` al salir del bloque.

## Para profundizar

- [MDN: Symbol](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [javascript.info: el tipo Symbol](https://es.javascript.info/symbol)
- [MDN: Symbol.hasInstance (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance)
- [MDN: using (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using)
- [V8: explicit resource management (en inglés)](https://v8.dev/features/explicit-resource-management)
