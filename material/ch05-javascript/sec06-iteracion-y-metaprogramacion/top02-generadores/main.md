# Generadores

## Por qué importa

En la lección anterior escribiste iteradores a mano: un objeto con `next()`, variables en un closure para recordar por dónde iba, `{ value, done }` en cada salida y, si hacía falta, `[Symbol.iterator]()` y `return()`. Funciona, pero el código no se parece al recorrido que describe: el bucle está repartido entre llamadas a `next()`.

Un **generador** es una función que puede **pausarse**. Escribes el recorrido como un bucle normal y, en cada `yield`, la función entrega un valor y se detiene, con sus variables intactas, hasta que alguien pida el siguiente. JavaScript construye el iterador por ti. Si conoces los generadores de Python, ya sabes casi todo; esta lección se centra en lo que cambia: el asterisco, el `return` que se pierde, el `break` que cierra el generador y los *helpers* de iteradores, el `itertools` de JavaScript.

## `function*` y `yield`

Una función con asterisco, `function*`, es una **función generadora**. Llamarla no ejecuta su cuerpo: devuelve un objeto **generador**, pausado al principio. Cada `next()` reanuda la función hasta el siguiente `yield`, que entrega su valor como `{ value, done: false }`. Cuando la función termina, `next()` devuelve `{ value: undefined, done: true }`:

[[exercise:01-primer-generador.md-]]

```text
tipo → [object Generator]
  ☕ muelo 30 g de café
next() → {value: 'molido', done: false}
  🔥 caliento el agua a 92 °C
next() → {value: 'agua lista', done: false}
  ⏳ filtro durante 4 minutos
next() → {value: 'filtrado', done: false}
  ✅ la función llega a su final
next() → {value: undefined, done: true}
next() → {value: undefined, done: true}
  ☕ muelo 15 g de café
estado → molido
…
¿iterable de sí mismo? → true
```

Fíjate en el orden de los mensajes: el cuerpo del generador y el código de fuera **se turnan**. No hay hilos ni nada en paralelo; el generador simplemente guarda su punto de ejecución entre una llamada y otra. El objeto generador es un iterador que también es iterable (su `[Symbol.iterator]()` devuelve `this`), así que entra en todos los consumidores de la lección anterior.

Si imprimes un generador en la consola de LearnWeb verás `Generator {}`; Chrome DevTools muestra además su estado, `brewCoffee {<suspended>}` o `{<closed>}`. Por eso los ejemplos imprimen su tipo con `Object.prototype.toString.call(gen)`.

> **Desde Python:** en Python basta con que el cuerpo tenga un `yield` para que la función sea generadora; en JavaScript lo marca el asterisco. `next(gen)` se escribe `gen.next()`, y el final es `done: true` en vez de `StopIteration`.

## Llamar no ejecuta nada

Esa primera regla, «llamar no ejecuta el cuerpo», tiene una consecuencia que sorprende la primera vez. Si el generador valida sus argumentos al principio, la validación **no** salta al llamarlo, sino en el primer `next()`, que puede estar en otra parte del programa, mucho después. El error aparece lejos del código culpable:

[[exercise:02-llamar-no-ejecuta.md-]]

```text
🐛 paginate(chores, 0) → ningún error; devuelve [object Generator]
— mucho después, en otra parte del programa —
  ⚙️ empieza el cuerpo de paginate (size = 0)
🐛 al recorrer → RangeError | Tamaño de página no válido: 0
✅ en la llamada → RangeError | Tamaño de página no válido: 0
✅ páginas de 2 → [["regar","barrer"],["lavar","planchar"],["cocinar"]]
```

La solución es separar las dos partes: una función **normal** que valida en el momento de la llamada y devuelve el generador interno, que ya recibe argumentos correctos.

## El rango en tres líneas

Un generador es la forma natural de escribir `[Symbol.iterator]()`. Como el método solo tiene que devolver un iterador nuevo, y una función generadora devuelve un generador nuevo cada vez que se llama, basta con convertir el método en **método generador**, con el asterisco delante del nombre. El `NumberRange` de la lección «Polimorfismo y protocolos» pasa de un iterador de diez líneas a esto:

```js
*[Symbol.iterator]() {
  for (let n = this.start; n <= this.end; n += this.step) yield n;
}
```

El ejemplo pone las dos versiones una al lado de la otra. Dan los mismos valores, pero la del generador trae gratis lo que la versión a mano no tenía: su iterador es iterable, tiene `return()` y tiene los *helpers*:

[[exercise:03-el-rango-en-tres-lineas.md-]]

```text
a mano → (5) [2, 4, 6, 8, 10]
generador → (5) [2, 4, 6, 8, 10]
¿se recorre dos veces? → 5 5
¿el iterador es iterable? → undefined | true
¿tiene return()? → undefined | function
¿tiene helpers? → undefined | (5) [200, 400, 600, 800, 1000]
literal → (3) ['🍽️ sopa de lima', '🍽️ cochinita pibil', '🍽️ marquesitas']
expresión → (2) ['HOLA', 'ADIÓS']
```

Dentro de un método generador, `this` es el objeto sobre el que se llamó el método, como en cualquier método, porque el cuerpo se ejecuta con el `this` de la llamada que creó el generador. Hay tres formas de escribir un generador: la declaración `function* name()`, la expresión `function* () {}` y el método `*name()` en clases y objetos literales. No existen funciones flecha generadoras.

Puedes aplicar lo mismo a la cola de pedidos de la lección anterior: `*[Symbol.iterator]() { for (let node = this.#head; node; node = node.following) yield node.order; }`, y aquí `this.#head` funciona porque el generador se ejecuta como método de la cola.

## Infinitos y perezosos

Un generador calcula cada valor **cuando se le pide**, ni antes ni después. Eso permite algo imposible con arrays: secuencias **infinitas**. Un `while (true)` con un `yield` dentro no cuelga nada, porque cada `yield` pausa la función hasta el próximo `next()`. El consumidor decide cuántos valores quiere: con `next()`, con un `break` o con una desestructuración que toma los primeros:

[[exercise:04-infinitos-y-perezosos.md-]]

```text
pedidos → PED-0001 PED-0002 PED-0003
primeros seis → 0 1 1 2 3 5 | calculados → 6
menores que 100 → 0 1 1 2 3 5 8 13 21 34 55 89 | calculados → 13
turnos → lun: Ana · mar: Luis · mié: Sofía · jue: Ana · vie: Luis · sáb: Sofía
```

El contador `calculados` lo demuestra: la desestructuración de seis variables calcula exactamente seis números, y el `for…of` calcula uno más que los que guarda (el `144`, que dispara el `break`). La regla de oro con un generador infinito: nunca pidas **todos** sus valores. `[...fibonacci()]`, `Array.from(fibonacci())` o un `for…of` sin `break` no terminarían (en LearnWeb, la guarda contra bucles infinitos lo cortaría a los 1,2 s; en una página normal, la pestaña se quedaría colgada).

## Los *helpers* de iteradores

Los métodos de los arrays (`map`, `filter`…) no sirven para un generador infinito, y con uno finito obligan a convertirlo antes en array. Desde 2024, `Iterator.prototype` (la base de todos los iteradores nativos y de todos los generadores) tiene sus propios métodos, los ***helpers* de iteradores**. Los que **transforman** (`map`, `filter`, `take`, `drop`, `flatMap`) devuelven otro iterador **perezoso**: montar la cadena no ejecuta nada, y cada valor atraviesa la cadena entera antes de que se genere el siguiente:

[[exercise:05-helpers-perezosos.md-]]

```text
tubería montada: no se ha generado ningún número
  · genero 1
  · genero 2
  · genero 3
  · genero 4
  · genero 5
resultado → (3) [1, 9, 25]
array   → filter 1 · filter 2 · filter 3 · map 1 · map 2 · map 3
helpers → filter 1 · map 1 · filter 2 · map 2 · filter 3 · map 3
contador → (3) ['1.º oro', '2.º plata', '3.º bronce']
```

Con arrays, cada método procesa **todo** el array y crea uno nuevo antes de pasar al siguiente método; con *helpers*, se procesa **un valor** de principio a fin. Por eso `naturals().filter(…).map(…).take(3)` funciona sobre una secuencia infinita y genera solo los cinco números que necesita. Los *callbacks* reciben `(valor, contador)`: no hay array del que hablar.

Los que **consumen** (`toArray`, `reduce`, `forEach`, `some`, `every`, `find`) recorren el iterador y devuelven un resultado. `some`, `every` y `find` se detienen en cuanto conocen la respuesta, y cierran el generador; `toArray`, `reduce` y `forEach` llegan hasta el final, así que en uno infinito hay que poner `take(n)` antes. `Iterator.from(iterable)` da los *helpers* a cualquier iterable, como un `Set`:

[[exercise:06-helpers-que-consumen.md-]]

```text
reduce (máxima) → 27.8
some (¿alguna > 27?) → true
every (¿todas > 15?) → true
find (primera > 25) → 26.1
forEach → lectura 0: 18.5 °C
forEach → lectura 1: 19.2 °C
drop(2).take(3) → (3) [21, 23.4, 26.1]
flatMap → (3) ['Ana', 'Luis', 'Sofía']
find en un infinito → 1024
suma de las 10 primeras → 1023
Iterator.from(set) → ['sin gluten']
set.values() → (3) [6, 7, 10]
```

Los *helpers* llegaron a Chrome en la versión 122 (febrero de 2024) y hoy están en todos los navegadores actuales.

> **Desde Python:** los *helpers* son la parte de `itertools` y de las expresiones generadoras que más se usa, encadenada de izquierda a derecha:

| Python | JavaScript |
|--------|------------|
| `(f(x) for x in it)`, `map(f, it)` | `it.map(f)` |
| `(x for x in it if p(x))`, `filter(p, it)` | `it.filter(p)` |
| `islice(it, n)` | `it.take(n)` |
| `islice(it, n, None)` | `it.drop(n)` |
| `chain.from_iterable(map(f, it))` | `it.flatMap(f)` |
| `functools.reduce(f, it, inicial)` | `it.reduce(f, inicial)` |
| `any(…)`, `all(…)` | `it.some(p)`, `it.every(p)` |
| `next((x for x in it if p(x)), None)` | `it.find(p)` (`undefined` si no hay) |
| `list(it)` | `it.toArray()` o `[...it]` |
| `count()`, `cycle()`, `enumerate()`, `zip()`, `takewhile()` | no existen: un generador de tres líneas |

```python
from itertools import count, islice

squares_of_odds = list(islice((n * n for n in count(1) if n % 2 == 1), 3))  # [1, 9, 25]
```

## Delegar con `yield*`

`yield* iterable` entrega, uno a uno, todos los valores de **otro** iterable: un array, un string, un `Set` u otro generador. Es la herramienta para los generadores **recursivos**, como el que recorre un árbol: cada nodo entrega su propia ruta y delega en la llamada recursiva de cada hijo. Sin el asterisco, `yield paths(child)` entregaría el generador entero como **un** valor:

[[exercise:07-yield-estrella.md-]]

```text
ruta → /tienda
ruta → /tienda/café
ruta → /tienda/café/chiapas
ruta → /tienda/café/veracruz
ruta → /tienda/pan
ruta → /tienda/pan/conchas
ruta → /tienda/pan/orejas
ruta → /tienda/contacto
con yield → (4) ['[object String]', '[object Generator]', '[object Generator]', '[object Generator]']
primera ruta de pan → /tienda/pan/conchas
concat → (6) ['a', 'b', 'x', 'y', 1, 2]
```

La recursión sigue siendo perezosa: `find` recorre el árbol solo hasta la primera coincidencia, y al cerrarse cierra toda la cadena de generadores anidados.

> **Desde Python:** `yield*` es `yield from`, con el mismo comportamiento, incluido el valor que devuelve (lo verás en la sección siguiente).

## El valor del `return` se pierde

Un generador puede terminar con `return valor`. Ese valor viaja en el **último** resultado, el que tiene `done: true`: justo el que `for…of`, el spread y `Array.from` usan como señal de fin y **descartan**. El resumen que el generador calculó con tanto cuidado desaparece sin aviso:

[[exercise:08-el-return-se-pierde.md-]]

```text
🐛 spread → (2) ['café', 'queso'] | el resumen se perdió
🐛 for…of → café
🐛 for…of → queso
último next() → done: true | value: {rejected: 2}
✅ yield* → (3) ['café', 'queso', 'resumen: 2 filas rechazadas']
✅ stats → 2 válidas, 2 rechazadas
```

Solo dos cosas leen ese valor: un bucle con `next()` a mano y la expresión `yield*`, cuyo resultado es el `return` del generador delegado. En la práctica, si el dato importa, no lo devuelvas con `return`: entrégalo con un `yield` más o guárdalo en un objeto que reciba el generador.

> **Desde Python:** idéntico. El `return` de un generador viaja en `StopIteration.value`; el `for` lo descarta y `resumen = yield from otro()` lo recoge.

## `break` cierra el generador

En la lección anterior viste que, si el consumidor sale antes de tiempo, `for…of` llama al método `return()` del iterador. En un generador, `return()` **termina la función en el `yield` donde estaba pausada**, como si ahí hubiera un `return`, y por eso ejecuta los bloques `finally` que lo rodean. Ese es el sitio para la limpieza (cerrar una conexión, soltar un recurso). El código escrito **después** del bucle, en cambio, nunca llega a ejecutarse:

[[exercise:09-break-cierra-el-generador.md-]]

```text
▶ 🐛 break con el cierre después del bucle
  🔌 abro la conexión
  (la conexión quedó abierta: «cierro» no apareció)
▶ ✅ break con finally
  🔌 abro la conexión
  🔌 cierro la conexión
▶ ✅ desestructuración parcial con finally
  🔌 abro la conexión
  🔌 cierro la conexión
  primero → P-101
▶ 🐛 seguir donde lo dejé
  🔌 abro la conexión
  atiendo → P-101
  🔌 cierro la conexión
  el resto → []
▶ iterador de array tras break → (3) ['P-102', 'P-103', 'P-104']
▶ ✅ por tandas
  🔌 abro la conexión
  primera tanda → P-101 P-102
  …más tarde → P-103
  🔌 cierro la conexión
```

La segunda mitad del ejemplo es la otra cara de la misma regla: después de un `break`, el generador está **cerrado** para siempre, y un segundo `for…of` no recibe nada. Los iteradores de arrays, `Map` y `Set` no tienen `return()`, así que esos sí se pueden continuar. Si necesitas consumir un generador por tandas, pide los valores con `next()` en vez de `for…of`, y ciérralo con `gen.return()` cuando termines.

> **Desde Python:** aquí sí hay una diferencia importante. El `for` de Python **no** cierra el generador al salir con `break`: puedes seguir con otro `for` donde lo dejaste, y el `finally` se ejecuta cuando se agota, con `gen.close()` o cuando el recolector de basura lo destruye. JavaScript lo cierra en el acto, siempre: la limpieza es inmediata, pero no hay pausa.

## Hablar con el generador: `next(valor)`, `throw` y `return`

`yield` no solo entrega: también **recibe**. El argumento de `next(x)` se convierte en el resultado de la expresión `yield` en la que el generador estaba pausado. Así, un generador puede funcionar como una corrutina que acumula estado, como la media móvil del ejemplo. El primer `next()` solo arranca la función hasta el primer `yield`, así que su argumento no lo recibe nadie. Además, `gen.throw(error)` lanza un error **dentro** del generador, en el `yield` donde está pausado (si el generador lo atrapa, sigue), y `gen.return(valor)` lo termina desde fuera:

[[exercise:10-next-con-valor-throw-y-return.md-]]

```text
arranque → null
next(21) → 21
next(23) → 22
next(26) → 23.3
🖨️ imprimiendo factura.pdf
  ⚠️ factura.pdf cancelado: atasco de papel
⏭️ salto factura.pdf
🖨️ imprimiendo menú.pdf
return() → {value: 'apagada', done: true} | después → {value: undefined, done: true}
```

Este uso bidireccional es poco frecuente en código de aplicación. Su gran momento fue histórico: antes de que existiera `async/await`, algunas librerías lo usaban para escribir código asíncrono que parecía secuencial. En el módulo de asincronía verás `async/await`, que es la versión oficial de esa idea, y los **generadores asíncronos** (`async function*` con `for await…of`), que entregan valores que llegan con el tiempo.

> **Desde Python:** `gen.next(x)` es `gen.send(x)`, `gen.throw(error)` es `gen.throw(exc)` y `gen.return()` es `gen.close()`. Dos diferencias: Python lanza `TypeError` si el primer `send` lleva un valor distinto de `None`, y JavaScript lo ignora en silencio; y `return(v)` devuelve `{ value: v, done: true }`, mientras que `close()` no devuelve nada.

## Bestiario

- **El error que salta lejos de su causa.**
  Síntoma: una llamada con argumentos incorrectos a una función generadora no lanza nada; el error aparece después, en el bucle que la recorre.
  Causa: llamar a una función generadora solo crea el generador; el cuerpo, con su validación, empieza en el primer `next()`.
  Solución: valida en una función normal que devuelve el generador interno.
  → [ver ejemplo](02-llamar-no-ejecuta.md)
- **El resumen que nunca llega.**
  Síntoma: el valor que un generador devuelve con `return` no aparece en el `for…of`, el spread ni `Array.from`.
  Causa: ese valor viaja en el resultado con `done: true`, que los consumidores descartan.
  Solución: recógelo con `const x = yield* gen()`, o entrégalo con `yield` o en un objeto aparte.
  → [ver ejemplo](08-el-return-se-pierde.md)
- **La conexión que se queda abierta y el generador que no continúa.**
  Síntoma: la limpieza escrita al final de un generador no se ejecuta cuando el bucle sale con `break`; y tras el `break`, un segundo `for…of` sobre el mismo generador no recibe nada.
  Causa: `break` llama a `return()`, que termina el generador en el `yield` pausado: solo se ejecutan los `finally`, y el generador queda cerrado.
  Solución: pon la limpieza en `try/finally`; para consumir por tandas, usa `next()` en vez de `for…of` y cierra con `return()`.
  → [ver ejemplo](09-break-cierra-el-generador.md)

## Resumen

- `function*` crea funciones generadoras; llamarlas devuelve un generador pausado, sin ejecutar nada del cuerpo.
- Cada `next()` reanuda hasta el siguiente `yield`; el generador es un iterador iterable con `return()` y *helpers*.
- `*[Symbol.iterator]() { … yield … }` hace iterable una clase en tres líneas.
- Los generadores son perezosos y pueden ser infinitos: consume con `take`, `find`, `break` o desestructuración, nunca entero.
- Los *helpers* (`map`, `filter`, `take`, `drop`, `flatMap`, `reduce`, `some`, `every`, `find`, `toArray`) son el `itertools` de JavaScript.
- `yield*` delega en otro iterable (generadores recursivos) y devuelve su `return`; `for…of` lo descarta.
- `break` cierra el generador y ejecuta sus `finally`; a diferencia de Python, no se puede continuar después.
- `next(valor)`, `throw()` y `return()` son el `send()`, `throw()` y `close()` de Python.

## Para profundizar

- [MDN: function* (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
- [javascript.info: generadores](https://es.javascript.info/generators)
- [MDN: Iterator helpers (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator#iterator_helpers)
- [V8: Iterator helpers (en inglés)](https://v8.dev/features/iterator-helpers)
- [Python: itertools](https://docs.python.org/es/3/library/itertools.html)
