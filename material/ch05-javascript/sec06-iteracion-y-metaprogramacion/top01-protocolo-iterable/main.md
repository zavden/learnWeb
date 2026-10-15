# Protocolo iterable

## Por qué importa

`for…of` recorre arrays, strings, `Map` y `Set`, y desde la lección «Polimorfismo y protocolos» también tus clases. No es que el bucle conozca cada tipo: todos ellos cumplen un **protocolo**, un acuerdo de dos métodos (`[Symbol.iterator]()` y `next()`) que cualquier objeto puede implementar. Allí lo usaste con una receta; en esta lección lo verás completo.

Entender el protocolo explica sorpresas que aparecen en cuanto se sale de los arrays: por qué un objeto literal no entra en un `for…of`, por qué un `map.entries()` recorrido dos veces no da nada la segunda vez, o cómo un bucle que se interrumpe con `break` puede avisar para cerrar un recurso. Y prepara la lección siguiente, donde los **generadores** escriben todo esto por ti.

## Qué consume iterables

Un valor es **iterable** si tiene un método con la clave `Symbol.iterator`. Lo tienen los arrays, los strings, `Map`, `Set`, `arguments`, los arrays tipados y las listas de nodos del DOM (capítulo 6). Y muchas partes del lenguaje aceptan **cualquier** iterable, no solo arrays:

| Consumidor | Ejemplo |
|------------|---------|
| `for…of` | `for (const [product, units] of stock)` |
| spread en arrays y en llamadas | `[...word]`, `Math.max(...set)` |
| desestructuración de arrays | `const [first, ...others] = cities` |
| `Array.from(iterable, fn?)` | `Array.from(tags, (t) => t.toUpperCase())` |
| constructores y funciones de colecciones | `new Map(pares)`, `new Set(iterable)`, `Object.fromEntries(pares)` |
| `yield*` y `Promise.all` | lección «Generadores» y módulo de asincronía |

[[exercise:01-que-consume-iterables.md-]]

```text
¿cities es iterable? → true
¿word es iterable? → true
¿stock es iterable? → true
¿tags es iterable? → true
¿literal es iterable? → false
for…of → café 12
for…of → pan 0
spread → (4) ['o', 'l', 'é', '👍'] | length → 5 | piezas → 4
Math.max(...set) → 9
desestructuración → Oaxaca (2) ['Puebla', 'Mérida']
Array.from → (2) ['VEGANO', 'SIN GLUTEN']
new Set(string) → Set(3) {'b', 'a', 'n'}
Object.fromEntries(map) → {café: 12, pan: 0}
new Map(pares) → Map(2) {'lunes' => 'tamales', 'martes' => 'pozole'}
```

Fíjate en el string: su iterador entrega **code points**, así que `[...'olé👍']` tiene 4 piezas aunque `length` diga 5 (el emoji ocupa dos unidades UTF-16, como viste en la lección «Strings»). Recorrer un string con `for…of` nunca parte un code point por la mitad; para lo que una persona ve como un carácter (un emoji con tono de piel, una bandera) sigue haciendo falta `Intl.Segmenter`.

> **Desde Python:** es exactamente la noción de iterable de Python: `for`, `list(x)`, `set(x)`, `dict(pares)`, el desempaquetado `a, *b = x` y el `*` de las llamadas aceptan cualquier objeto con `__iter__`.

## El protocolo, paso a paso

El protocolo tiene dos papeles:

- Un **iterable** tiene un método `[Symbol.iterator]()` que devuelve un **iterador** nuevo.
- Un **iterador** tiene un método `next()` que, en cada llamada, devuelve un objeto `{ value, done }`: el siguiente valor con `done: false`, o `done: true` cuando no quedan más.

```text
for (const x of steps)
        │
        ├─ it = steps[Symbol.iterator]()     una vez, al empezar
        │
        └─ repetir: r = it.next()
                    r.done === true  → salir
                    x = r.value      → ejecutar el cuerpo
```

`Symbol.iterator` es un **símbolo**, un valor único que sirve de clave de propiedad sin chocar con ningún nombre de texto; los conocerás a fondo en la lección «Symbol». El ejemplo pide el iterador de un array, llama a `next()` a mano y reescribe `for…of` con un `while`:

[[exercise:02-el-protocolo-a-mano.md-]]

```text
1 → {value: 'moler el café', done: false}
2 → {value: 'calentar el agua', done: false}
3 → {value: 'filtrar', done: false}
4 → {value: undefined, done: true}
5 → {value: undefined, done: true}
Map → {value: Array(2), done: false}
letra → o
letra → l
letra → é
plato → tamal 25
plato → atole 18
Set vacío → sin valor
```

Un iterador terminado sigue respondiendo `{ value: undefined, done: true }` a cada `next()`, sin error. El final es un **dato**, no una excepción.

> **Desde Python:** `steps[Symbol.iterator]()` es `iter(steps)` y `it.next()` es `next(it)`. La diferencia está en el final: Python lanza `StopIteration`, que el `for` atrapa por ti; JavaScript devuelve `done: true`. Tampoco existe el `next(it, default)` de Python: al terminar, `value` es `undefined`, y se completa con `??`.

## Los objetos literales no son iterables

Un objeto literal **no** tiene `[Symbol.iterator]`: no lo hereda de `Object.prototype`. Así que `for…of`, el spread de arrays, la desestructuración de arrays y `new Map(obj)` lanzan `TypeError: … is not iterable`. Y hay un consumidor que ni siquiera lanza: `Array.from` trata lo que no es iterable como un *array-like* (un objeto con `length` e índices, como `arguments`), y un objeto sin `length` tiene longitud 0, así que devuelve `[]` en silencio:

[[exercise:03-los-objetos-no-son-iterables.md-]]

```text
🐛 for…of → TypeError | settings is not iterable
🐛 desestructuración → TypeError | settings is not iterable
🐛 new Map → TypeError | object is not iterable (cannot read property Symbol(Symbol.iterator))
🐛 Array.from → []
{...settings} → {theme: 'oscuro', fontSize: 16, language: 'es-MX'}
✅ theme = oscuro
✅ fontSize = 16
✅ language = es-MX
✅ claves → (3) ['theme', 'fontSize', 'language']
✅ valores → (3) ['oscuro', 16, 'es-MX']
✅ Map → (3) ['theme', 'fontSize', 'language']
```

No es un descuido del lenguaje: un objeto puede ser un registro (un usuario con `name` y `email`) o un diccionario, y JavaScript no adivina qué querrías recorrer. Tú eliges con `Object.keys`, `Object.values` u `Object.entries` (lección «Objetos literales»), que devuelven arrays. Si los datos son de verdad una colección clave → valor, un `Map` es iterable de serie. Ojo con el spread de **objetos**, `{ ...settings }`: se parece, pero no itera, copia propiedades.

## Tu propio iterable

Una clase se vuelve iterable con un método `[Symbol.iterator]()` que crea un iterador **nuevo** cada vez, con su propio cursor. La cola de pedidos del ejemplo es una **lista enlazada**: cada nodo guarda un pedido y apunta al siguiente, así que no hay índices, y el protocolo es la forma natural de ofrecer un recorrido. El iterador guarda el nodo actual en una variable del closure y avanza en cada `next()`:

[[exercise:04-un-iterable-propio.md-]]

```text
mesa 4 → café de olla
mesa 2 → chocolate
mesa 7 → horchata
mesas → (3) [4, 2, 7]
siguiente → café de olla | esperan → 2
size → 3 | otra vez → café de olla, chocolate, horchata
sale → café de olla | quedan → (2) ['chocolate', 'horchata']
```

Como cada consumidor pide su propio iterador, recorrer la cola no la gasta: el `for…of`, el `Array.from`, la desestructuración y el spread empiezan cada uno por la cabeza. Un detalle del código: dentro de `next()`, `this` es el objeto iterador, no la cola (regla del método, lección «La palabra clave this»), por eso el método copia `this.#head` a una variable antes de crear el iterador.

## Iteradores que también son iterables

`for…of` recibe un **iterable**, no un iterador: lo primero que hace es llamar a `[Symbol.iterator]()`. Un iterador con solo `next()` no entra en el bucle. La solución estándar es que el iterador sea también iterable y se devuelva **a sí mismo**: `[Symbol.iterator]() { return this; }`. Así son todos los iteradores nativos, y por eso puedes escribir tanto `for (… of map)` como `for (… of map.entries())`:

[[exercise:05-iteradores-que-son-iterables.md-]]

```text
next() funciona → 3 2
for…of → TypeError | countdown is not a function or its return value is not iterable
despegue en → 3
despegue en → 2
despegue en → 1
spread → (5) [5, 4, 3, 2, 1]
iterador: it[Symbol.iterator]() === it → true
iterable: flavors[Symbol.iterator]() === flavors[Symbol.iterator]() → false
1. nuez
2. mamey
3. guanábana
```

La comparación con `===` es la forma de distinguir los dos papeles:

| | Iterable (`array`, `map`, `set`, tu `OrderQueue`) | Iterador (`map.entries()`, `array.values()`) |
|---|---|---|
| `x[Symbol.iterator]()` | devuelve un iterador **nuevo** cada vez | devuelve **el mismo** objeto |
| ¿Se puede recorrer varias veces? | sí | no: se gasta |
| ¿Tiene `next()`? | no | sí |

> **Desde Python:** la misma regla: un iterador de Python tiene `__iter__` que devuelve `self` (`iter(it) is it`), y por eso funciona `for x in iter(lista)`.

## Los iteradores se gastan

Un iterador tiene **un** cursor que solo avanza. Cuando llega al final, se queda ahí: un segundo `for…of` sobre el mismo iterador no hace ninguna vuelta, sin error ni aviso. El caso típico es una función que recorre su argumento dos veces (una para el máximo y otra para la media) y recibe `prices.values()` en vez de un array: el segundo bucle no ve nada y la media sale `NaN`:

[[exercise:06-los-iteradores-se-gastan.md-]]

```text
🐛 con un iterador → {max: 210, average: NaN}
✅ con un array → {max: 210, average: 138.33333333333334}
primera vez → 3 pares
🐛 segunda vez → 0 pares
✅ pidiendo otro → 3 pares
✅ reusable → {max: 210, average: 138.33333333333334}
```

Tres formas de evitarlo: guarda y pasa el **iterable** (`prices`) y pide `entries()` o `values()` cada vez que lo recorras; convierte el iterador a array **una** vez con `[...it]`; o, en una función que recibe datos de fuera y necesita varias pasadas, detecta el iterador (`x[Symbol.iterator]() === x`) y conviértelo, como hace `reusable`.

> **Desde Python:** cuidado con la analogía, porque aquí Python y JavaScript se separan. `d.values()` de Python es una **vista** que se puede recorrer muchas veces; `map.values()` de JavaScript es un iterador, como `iter(d.values())`. Los `map()`, `zip()`, `filter()` y generadores de Python sí se gastan igual que aquí.

## Salir antes: `return()`

Un iterador puede tener un tercer método, opcional: `return()`. El consumidor lo llama cuando deja de pedir valores **antes** de que el iterador termine: un `break`, un `return` dentro del bucle, un error que sale del cuerpo o una desestructuración que solo necesita los primeros elementos. Si el recorrido llega al final por sí solo, `return()` no se llama. Es el sitio para liberar lo que el iterador tenga abierto (un archivo, una conexión, un temporizador):

[[exercise:07-return-al-salir-antes.md-]]

```text
▶ recorrido completo: return() NO se llama
  📂 abro corto.csv
  📁 fin de corto.csv
▶ break
  📂 abro ventas.csv
  🧹 cierro ventas.csv (líneas leídas: 3)
▶ desestructuración parcial: solo necesita la cabecera
  📂 abro ventas.csv
  🧹 cierro ventas.csv (líneas leídas: 1)
  cabecera → fecha,producto,unidades
▶ un error dentro del bucle
  📂 abro ventas.csv
  🧹 cierro ventas.csv (líneas leídas: 3)
  ⛔ RangeError: cantidad sospechosa: 2026-10-01,pan,30
▶ return dentro de una función
  📂 abro ventas.csv
  🧹 cierro ventas.csv (líneas leídas: 2)
  primera venta de café → 2026-10-01,café,12
```

`return()` debe devolver un objeto (normalmente `{ value: undefined, done: true }`); si devuelve otra cosa, el bucle lanza un `TypeError`. Los iteradores de los arrays, de `Map` y de `Set` **no** tienen `return()`: no tienen nada que cerrar. Los generadores sí, y en la lección siguiente verás que su `return()` ejecuta los bloques `finally`.

> **Desde Python:** un iterador escrito a mano no tiene nada parecido; para cerrar recursos Python usa gestores de contexto (`with open(…) as f`). El `close()` de los generadores de Python es el equivalente del `return()` de los generadores de JavaScript.

## `Iterator.prototype` e `Iterator.from`

Todos los iteradores nativos heredan de un mismo prototipo, `Iterator.prototype`, que les da dos cosas: el `[Symbol.iterator]() { return this; }` que acabas de ver y una colección de métodos, los ***helpers* de iteradores** (`map`, `filter`, `take`, `drop`, `toArray`…), que son el tema central de la lección «Generadores». Un iterador escrito como objeto literal hereda de `Object.prototype` y no tiene nada de eso. Hay dos formas de dárselo: envolverlo con `Iterator.from(it)`, o escribirlo como una clase que **extiende** `Iterator` y solo define `next()`:

[[exercise:08-iterator-prototype-e-iterator-from.md-]]

```text
array.values() instanceof Iterator → true
map.keys() instanceof Iterator → true
set.entries() instanceof Iterator → true
string instanceof Iterator → true
helpers → (3) ['CAFÉ', 'TÉ', 'ATOLE']
literal → false | map → undefined
Iterator.from → (3) ['T-1', 'T-2', 'T-3']
¿iterable? → true
impares → (3) [5, 3, 1]
new Iterator() → TypeError | Abstract class Iterator not directly constructable
```

`Iterator` es una clase **abstracta**: `new Iterator()` lanza un error, solo sirve como base. Y es un global, como `Map` o `Array`: si declaras en un script una clase o una función llamada `Iterator`, tapas la de verdad para todo el código de la página y los *helpers* dejan de funcionar. Elige otro nombre (`Countdown`, `TicketIterator`).

`Iterator` y sus *helpers* son recientes: llegaron a Chrome en la versión 122 (2024) y hoy los tienen todos los navegadores actuales.

## Bestiario

- **El objeto que no se deja recorrer.**
  Síntoma: `TypeError: settings is not iterable` en un `for…of`, un spread o una desestructuración; o un `Array.from(obj)` que devuelve `[]` sin avisar.
  Causa: un objeto literal no tiene `[Symbol.iterator]`, y `Array.from` trata lo que no es iterable como un *array-like* de longitud 0.
  Solución: recorre `Object.entries(obj)`, `Object.keys(obj)` u `Object.values(obj)`, o guarda los datos en un `Map`.
  → [ver ejemplo](03-los-objetos-no-son-iterables.md)
- **El segundo recorrido vacío.**
  Síntoma: un bucle no hace ninguna vuelta, un spread da `[]` o un cálculo sale `NaN`, la segunda vez que se usa el mismo valor.
  Causa: era un **iterador** (`map.entries()`, `array.values()`, un generador), que se gasta al recorrerlo; solo los iterables entregan un iterador nuevo en cada recorrido.
  Solución: pasa el iterable y pide un iterador nuevo cada vez, o convierte el iterador a array una sola vez.
  → [ver ejemplo](06-los-iteradores-se-gastan.md)

## Resumen

- Un **iterable** tiene `[Symbol.iterator]()`, que devuelve un **iterador**; un iterador tiene `next()`, que devuelve `{ value, done }`.
- `for…of`, el spread, la desestructuración, `Array.from`, `new Map`, `new Set` y `Object.fromEntries` aceptan cualquier iterable.
- El final es `done: true`, no una excepción como el `StopIteration` de Python.
- Los objetos literales no son iterables: usa `Object.entries`, `keys` o `values`. `Array.from(obj)` devuelve `[]` sin avisar.
- Un iterador es iterable si `[Symbol.iterator]()` devuelve `this`; así son los nativos. Se gasta: solo se recorre una vez.
- `return()`, opcional, se llama cuando el consumidor sale antes (`break`, `return`, errores, desestructuración parcial): sirve para limpiar.
- Los iteradores nativos heredan de `Iterator.prototype`; `Iterator.from` y `extends Iterator` dan sus *helpers* a los tuyos.

## Para profundizar

- [MDN: protocolos de iteración](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Iteration_protocols)
- [javascript.info: iterables](https://es.javascript.info/iterable)
- [MDN: Iterator (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)
- [MDN: Iterator.from (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator/from)
