# Arrays

## Por qué importa

El array es la colección que más vas a usar: la lista de productos de un carrito, las filas de una tabla, los resultados de una búsqueda. Es el `list` de Python (ordenado, mutable, con elementos de cualquier tipo) y casi todo lo que sabes de las listas se traslada. Pero hay tres diferencias que causan errores reales: unos métodos cambian el array y otros devuelven uno nuevo sin que el nombre lo diga, `sort()` ordena los números como si fueran texto, y un array puede tener **huecos**. Además, en lugar de listas por comprensión, JavaScript usa `map`, `filter` y `reduce`, que vas a ver en todo el código que leas.

## Crear y leer

Un array se escribe entre corchetes, se lee por índice desde `0` y sabe su longitud con `length`. Igual que en Python, puede mezclar tipos, aunque en la práctica un array guarda elementos del mismo tipo:

[[exercise:01-crear-y-leer.md-]]

> **Desde Python:** `lista[-1]` no funciona con corchetes (busca una propiedad llamada `"-1"` y da `undefined`): usa `array.at(-1)`. Un índice fuera de rango no lanza `IndexError`, devuelve `undefined`. Y no hay listas por comprensión: `[x * 2 for x in nums]` se escribe `nums.map((x) => x * 2)`.

### Un apunte sobre las funciones flecha

Muchos métodos de array reciben una **función** que se ejecuta con cada elemento. Las funciones se estudian en el módulo 3 («Funciones y ámbito»); de momento basta con saber leer las **funciones flecha**, que son las `lambda` de JavaScript:

| JavaScript | Python |
|------------|--------|
| `(x) => x * 2` | `lambda x: x * 2` |
| `(a, b) => a - b` | `lambda a, b: a - b` |
| `(p) => p.price > 50` | `lambda p: p["price"] > 50` |
| `() => 0` | `lambda: 0` |

Los paréntesis alrededor de un único parámetro son opcionales (`x => x * 2`); en el curso los escribimos siempre.

## Añadir y quitar elementos

Los métodos que añaden y quitan elementos **modifican el array** en el sitio, como `append` o `pop` en Python. `splice` es la navaja suiza: borra e inserta en cualquier posición, y devuelve lo que ha borrado.

[[exercise:02-anadir-y-quitar.md-]]

| Python | JavaScript | Devuelve |
|--------|------------|----------|
| `lista.append(x)` | `array.push(x)` | la nueva longitud |
| `lista.pop()` | `array.pop()` | el elemento quitado |
| `lista.insert(0, x)` | `array.unshift(x)` | la nueva longitud |
| `lista.pop(0)` | `array.shift()` | el elemento quitado |
| `del lista[i:j]` | `array.splice(i, j - i)` | array con lo borrado |
| `lista[i:i] = [a, b]` | `array.splice(i, 0, a, b)` | `[]` |
| `x in lista` | `array.includes(x)` | booleano |
| `lista.index(x)` | `array.indexOf(x)` | `-1` si no está (no lanza) |
| `lista.clear()` | `array.length = 0` | |
| `lista[i:j]` (copia de un trozo) | `array.slice(i, j)` | array nuevo |

## Métodos que mutan y métodos que no

Aquí está la primera trampa. En Python la convención es clara: `lista.sort()` modifica la lista y devuelve `None`; `sorted(lista)` devuelve una lista nueva. En JavaScript, `sort()` y `reverse()` modifican el array **y además lo devuelven**, así que `const sorted = items.sort()` parece crear una copia, pero ha desordenado (u ordenado) el original:

[[exercise:03-mutan-o-no-mutan.md-]]

Desde 2023, cada método que muta tiene una versión que devuelve una copia: `toSorted`, `toReversed`, `toSpliced` y `with` (que cambia un elemento). Úsalas siempre que el array original deba quedarse como estaba (por ejemplo, porque viene de otra parte del programa).

| Mutan el array | Devuelven uno nuevo |
|----------------|---------------------|
| `push`, `pop`, `shift`, `unshift` | `concat`, `[...a, x]` |
| `splice` | `slice`, `toSpliced` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `array[i] = x` | `with(i, x)` |
| `fill`, `copyWithin` | `map`, `filter`, `flat`, `flatMap` |

## `sort()` ordena como texto

La segunda trampa es todavía más famosa. Sin argumentos, `sort()` convierte cada elemento en **string** y compara los textos. Con palabras funciona más o menos (aunque con el orden de códigos que viste en «Strings»); con números da resultados absurdos, porque `'100'` va antes que `'9'`:

[[exercise:04-sort-ordena-como-texto.md-]]

La solución es pasar una **función de comparación** `(a, b) => …` que devuelva un número negativo si `a` va antes, positivo si `b` va antes y `0` si da igual. Para números, `(a, b) => a - b` ordena de menor a mayor y `(a, b) => b - a` de mayor a menor; para texto, `(a, b) => a.localeCompare(b, 'es')`.

> **Desde Python:** `sorted(items, key=lambda p: p["price"])` dice **qué comparar**; el comparador de JavaScript dice **cómo comparar dos elementos** (como el antiguo `cmp` de Python 2, hoy `functools.cmp_to_key`). Para varios criterios, encadena con `||`: si el primero empata, devuelve `0`, que es *falsy*, y se evalúa el segundo. El orden es estable, como en Python.

## Huecos: arrays con agujeros

Un array de JavaScript es, por dentro, un objeto con claves `'0'`, `'1'`, `'2'`… y una propiedad `length`. Por eso puede tener **huecos** (*sparse arrays*): posiciones dentro de la longitud que no existen, ni siquiera como `undefined`. Aparecen con `new Array(n)`, al asignar más allá del final y con `delete`:

[[exercise:05-huecos.md-]]

La consola los muestra como `empty × n`. Lo peligroso es que cada herramienta los trata a su manera: `map`, `filter` y `forEach` se los saltan, `for…of` y `join` los tratan como `undefined`, y `length` los cuenta. No los crees a propósito: para «n posiciones con un valor» usa `new Array(n).fill(valor)` o `Array.from({ length: n }, () => valor)`, y para quitar elementos usa `splice`, nunca `delete`.

## `map`, `filter` y `reduce`

Son la forma idiomática de transformar arrays en JavaScript, el equivalente de las listas por comprensión y de `functools.reduce`. Ninguno modifica el array original, y como `map` y `filter` devuelven arrays, se pueden **encadenar**:

[[exercise:06-map-filter-reduce.md-]]

| Python | JavaScript |
|--------|------------|
| `[f(x) for x in xs]` | `xs.map((x) => f(x))` |
| `[x for x in xs if cond(x)]` | `xs.filter((x) => cond(x))` |
| `[f(x) for x in xs if cond(x)]` | `xs.filter((x) => cond(x)).map((x) => f(x))` |
| `sum(xs)` | `xs.reduce((total, x) => total + x, 0)` |
| `functools.reduce(f, xs, init)` | `xs.reduce(f, init)` |
| `for i, x in enumerate(xs): …` | `xs.forEach((x, i) => …)` |

Dos detalles: pon **siempre** el valor inicial de `reduce` (sin él, un array vacío lanza `TypeError`), y recuerda que `map` llama a la función con tres argumentos (elemento, índice y array). Por eso `['1', '2', '3'].map(parseInt)` da `[1, NaN, NaN]`: `parseInt` recibe el índice como base.

## Buscar: `find`, `some` y `every`

Para preguntar por una **condición** (no por un valor concreto) están `find` (el primer elemento que cumple), `findIndex` (su posición), `findLast` (empezando por el final), `some` (el `any` de Python) y `every` (el `all`):

[[exercise:07-find-some-every.md-]]

`every` con un array vacío es `true`, como `all([])` en Python: no hay ningún elemento que lo incumpla. Si tu pregunta es «¿están todas las tareas hechas?» y un proyecto sin tareas no cuenta como terminado, compruébalo aparte con `length > 0`.

## Aplanar: `flat` y `flatMap`

`flat(n)` aplana `n` niveles de arrays anidados (`flat(Infinity)` los aplana todos). `flatMap` es un `map` seguido de `flat(1)`: cada elemento puede producir cero, uno o varios resultados, así que sirve a la vez para expandir y para filtrar.

[[exercise:08-flat-y-flatmap.md-]]

## Desestructuración

La **desestructuración** saca los elementos de un array a variables en una sola línea, como el *unpacking* de Python. Admite huecos para saltar posiciones, `...resto` para recoger lo que queda y valores por defecto:

[[exercise:09-desestructuracion.md-]]

```python
lat, lng = coords
first, *rest = podium
for i, name in enumerate(podium): ...
```

```js
const [lat, lng] = coords;
const [first, ...rest] = podium;
for (const [i, name] of podium.entries()) { … }
```

A diferencia de Python, si faltan o sobran elementos no hay error: las variables que no reciben nada valen `undefined` (o su valor por defecto).

## Spread y copias

El operador **spread** `...` «desparrama» los elementos de un array: dentro de otro array (`[...a, ...b]` es `a + b` en Python) o como argumentos de una llamada (`Math.max(...nums)`). También es la forma habitual de **copiar** un array:

[[exercise:10-spread-y-copias.md-]]

Recuerda lo que viste en «Tipos primitivos»: asignar un array a otra variable no lo copia. `[...array]` crea un array nuevo, pero la copia es **superficial**: si los elementos son objetos, la copia y el original comparten esos objetos. Lo mismo pasa en Python con `lista[:]` y `list(lista)`. Las copias profundas tienen su propia lección («JSON y copias»).

## Bestiario

- **El `sort()` que cambia el original.**
  Síntoma: después de `const sorted = items.sort()`, `items` también está ordenado.
  Causa: `sort` y `reverse` mutan el array y devuelven ese mismo array.
  Solución: `toSorted()` y `toReversed()`, o copiar antes: `[...items].sort()`.
  → [ver ejemplo](03-mutan-o-no-mutan.md)
- **`[10, 9, 1, 100].sort()` da `[1, 10, 100, 9]`.**
  Síntoma: los números se ordenan «por el primer dígito».
  Causa: sin comparador, `sort` convierte los elementos a string y compara texto.
  Solución: `sort((a, b) => a - b)`; para texto de personas, `localeCompare`.
  → [ver ejemplo](04-sort-ordena-como-texto.md)
- **El array con huecos.**
  Síntoma: `new Array(3).map(() => 0)` no hace nada; `forEach` visita menos elementos que `length`; `delete` no acorta el array.
  Causa: los huecos son posiciones que no existen, y cada método los trata a su manera.
  Solución: `fill` o `Array.from({ length: n }, …)` para crear; `splice` para quitar.
  → [ver ejemplo](05-huecos.md)
- **`['1', '2', '3'].map(parseInt)` da `[1, NaN, NaN]`.**
  Síntoma: un `map` con una función ya existente da resultados raros.
  Causa: `map` pasa tres argumentos (elemento, índice, array), y `parseInt` usa el segundo como base.
  Solución: `map(Number)` o `map((s) => parseInt(s, 10))`.
  → [ver ejemplo](06-map-filter-reduce.md)
- **`[1, 2] + [3]` da `'1,23'`.**
  Síntoma: «sumar» dos arrays produce un string.
  Causa: `+` convierte los arrays a texto y concatena.
  Solución: `[...a, ...b]` o `a.concat(b)`.
  → [ver ejemplo](10-spread-y-copias.md)

## Resumen

- Un array es el `list` de Python: índices desde 0, `length`, `at(-1)`; fuera de rango da `undefined`.
- `push`/`pop`, `unshift`/`shift` y `splice` modifican el array; `slice` copia un trozo.
- `sort` y `reverse` mutan y devuelven el mismo array; `toSorted`, `toReversed`, `toSpliced` y `with` devuelven copias.
- `sort()` sin comparador ordena como texto: usa `(a, b) => a - b` o `localeCompare`.
- Evita los huecos: `fill` o `Array.from` para crear, `splice` para quitar.
- `map`, `filter` y `reduce` (con valor inicial) sustituyen a las listas por comprensión; `find`, `some` y `every` buscan por condición.
- Desestructuración (`const [a, ...rest] = xs`) y spread (`[...a, ...b]`); las copias con spread son superficiales.

## Para profundizar

- [MDN: Array](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [javascript.info: arrays](https://es.javascript.info/array)
- [javascript.info: métodos de arrays](https://es.javascript.info/array-methods)
- [MDN: asignación desestructurante](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [MDN: arrays dispersos (sparse)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections#sparse_arrays)
