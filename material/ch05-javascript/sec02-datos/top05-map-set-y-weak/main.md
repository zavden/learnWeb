# Map, Set y WeakMap

## Por qué importa

En la lección anterior usaste objetos literales para agrupar datos con nombres de campo fijos: `{ name: 'Ana', age: 31 }`. Muy pronto necesitarás otra cosa: un **diccionario** cuyas claves no conoces al escribir el código (ids de productos, palabras de un texto, usuarios conectados) y una **colección sin repetidos**. En Python usarías `dict` y `set`. JavaScript tiene sus equivalentes, `Map` y `Set`, y además dos versiones «débiles», `WeakMap` y `WeakSet`, que no existen en Python de forma tan directa y que sirven para no provocar fugas de memoria.

La gran trampa es que en JavaScript **un objeto también parece un diccionario**, y durante años se usó así. Funciona… hasta que deja de hacerlo de formas muy difíciles de ver. Esta lección te enseña cuándo usar cada estructura y por qué.

## Map: el dict de JavaScript

Un `Map` guarda pares clave → valor, recuerda el orden de inserción y tiene una API explícita:

| Python (`dict`) | JavaScript (`Map`) |
|---|---|
| `d = {}` | `const m = new Map()` |
| `d['a'] = 1` | `m.set('a', 1)` |
| `d['a']` | `m.get('a')` → `undefined` si no existe (no lanza error) |
| `'a' in d` | `m.has('a')` |
| `del d['a']` | `m.delete('a')` |
| `len(d)` | `m.size` (propiedad, no método) |
| `for k, v in d.items()` | `for (const [k, v] of m)` |
| `dict(pares)` | `new Map(pares)` |

[[exercise:01-map-basico.md-]]

Fíjate en `has` frente a `get`: como `get` devuelve `undefined` cuando la clave no existe, no sirve para distinguir «no está» de «está y vale `undefined`» (o `0`, o `''` si lo usas en un `if`). Para preguntar si existe, usa siempre `has`.

### Claves de cualquier tipo, sin conversiones

La diferencia esencial con un objeto: en un `Map` la clave puede ser **cualquier valor** (número, string, boolean, objeto, función, `NaN`…) y **no se convierte**. `1` y `'1'` son claves distintas. Un objeto es una clave válida y se compara por **identidad**: solo encuentra el valor si le pasas exactamente el mismo objeto.

[[exercise:02-claves-de-cualquier-tipo.md-]]

> **Desde Python:** un `dict` solo admite claves *hashables* y las compara con `==` (dos tuplas iguales son la misma clave). `Map` admite cualquier cosa, pero con los objetos compara la referencia, como si usara `is`. La comparación exacta se llama **SameValueZero**: es `===`, salvo que `NaN` es igual a `NaN` (y `0` igual a `-0`).

### ¿Por qué no usar simplemente un objeto?

Un objeto literal tiene dos problemas como diccionario:

1. **Sus claves siempre son strings** (o símbolos). `obj[1]` y `obj['1']` son la misma propiedad, y cualquier objeto usado como clave se convierte en el texto `'[object Object]'`: todos tus objetos acaban compartiendo una única clave.
2. **Ya trae claves «de serie»**: hereda de `Object.prototype` propiedades como `toString`, `constructor` o `__proto__`. Si las claves vienen de datos del usuario (palabras de un texto, nombres de campos), `obj['constructor']` parece existir aunque nunca lo hayas añadido.

[[exercise:03-objeto-como-diccionario.md-]]

La regla práctica:

- **Objeto** para *registros*: un conjunto fijo de campos con nombre conocido al escribir el código (`user.name`, `order.total`).
- **Map** para *diccionarios*: claves que llegan en tiempo de ejecución, muchas altas y bajas, claves que no son strings, o cuando necesitas `size` y un orden fiable.

En el módulo de objetos verás `Object.create(null)`, la forma antigua de crear un objeto «limpio» sin claves heredadas. Hoy, para diccionarios, `Map` es la opción clara.

### Map y JSON no se llevan

`JSON.stringify` solo entiende objetos, arrays, strings, números, booleanos y `null`. Un `Map` (y un `Set`) se serializa como `{}`, **sin error y sin datos**. Antes de guardarlo o enviarlo tienes que convertirlo: a objeto con `Object.fromEntries` (si las claves son strings) o a un array de pares con `[...map]` (funciona con cualquier clave).

[[exercise:04-map-y-json.md-]]

### Agrupar: Map.groupBy y Object.groupBy

Agrupar elementos por un criterio es tan habitual que existe una función para ello. `Object.groupBy(array, fn)` devuelve un objeto (las claves serán strings) y `Map.groupBy(array, fn)` devuelve un `Map` (la clave puede ser cualquier cosa, por ejemplo un boolean). La función recibe cada elemento y devuelve su grupo.

[[exercise:05-agrupar-con-groupby.md-]]

```text
Map(2) {
  true  => [ {id: 101…}, {id: 103…} ],
  false => [ {id: 102…}, {id: 104…} ]
}
```

> **Desde Python:** es lo que harías con `collections.defaultdict(list)` y un bucle, o con `itertools.groupby` (que además exige ordenar antes). El ejemplo incluye también la versión a mano con `has`/`get`/`set`. Un detalle: el objeto de `Object.groupBy` no tiene prototipo (la consola lo muestra como `[Object: null prototype]`), precisamente para evitar el problema de las claves heredadas.

## Set: valores sin repetir

Un `Set` guarda **valores únicos** en orden de inserción. `add` ignora los repetidos, `has` comprueba la pertenencia sin recorrer la colección y `size` cuenta los elementos. Su uso más frecuente cabe en una línea: `[...new Set(array)]` elimina los duplicados de un array conservando el orden de la primera aparición.

[[exercise:06-set-basico.md-]]

### Operaciones de conjuntos

Desde 2024 los `Set` tienen métodos para las operaciones clásicas. Todos devuelven un `Set` nuevo y no modifican los originales:

| Python | JavaScript |
|---|---|
| `a \| b` | `a.union(b)` |
| `a & b` | `a.intersection(b)` |
| `a - b` | `a.difference(b)` |
| `a ^ b` | `a.symmetricDifference(b)` |
| `a <= b` | `a.isSubsetOf(b)` |
| `a.isdisjoint(b)` | `a.isDisjointFrom(b)` |

[[exercise:07-operaciones-de-conjuntos.md-]]

No intentes usar operadores: `a | b` en JavaScript es el OR **de bits** entre dos números, así que convierte los dos `Set` a número (`NaN`, que pasa a `0`) y devuelve `0` sin ningún error.

### La igualdad de los Set (y de las claves de Map)

`Set` y `Map` usan la misma igualdad (SameValueZero). Con primitivos se comporta como esperas. Con objetos y arrays, no: `{ x: 1 }` y `{ x: 1 }` son dos objetos distintos, así que un `Set` los guarda a los dos. La solución habitual es calcular una **clave primitiva** que represente el contenido (por ejemplo, el string `'1,2'`) y usarla en un `Map`.

[[exercise:08-set-compara-por-referencia.md-]]

## WeakMap y WeakSet: referencias que no retienen

Cuando nada en tu programa apunta ya a un objeto, el **recolector de basura** (GC) puede liberar su memoria. Pero si ese objeto es una clave de un `Map`, el `Map` lo sigue apuntando: nunca se liberará mientras exista el `Map`. Si vas asociando datos a objetos que vienen y van (elementos del DOM que se crean y se eliminan, objetos de otra librería), un `Map` crece sin fin: es una **fuga de memoria**.

`WeakMap` resuelve exactamente eso: sus claves se guardan de forma **débil**. Si la única referencia que queda a un objeto es la del `WeakMap`, el GC puede liberarlo y la entrada desaparece sola. A cambio, tiene restricciones:

- Las claves deben ser **objetos** (o símbolos no registrados); un primitivo lanza `TypeError`.
- **No se puede recorrer** ni contar: no hay `size`, `keys()` ni `forEach`. Su contenido depende de cuándo pase el GC, algo que tu código no puede observar.
- Solo tiene `get`, `set`, `has` y `delete`.

`WeakSet` es lo mismo para conjuntos: sirve para «marcar» objetos (procesado, visto, válido) sin retenerlos.

[[exercise:09-weakmap-y-weakset.md-]]

> **Desde Python:** el módulo `weakref` tiene `WeakKeyDictionary` y `WeakSet`, con la misma idea. En JavaScript se usan más, porque los objetos del DOM se crean y destruyen constantemente.

## Bestiario

- **Mis claves numéricas y mis objetos se pisan entre sí.** Síntoma: `obj[1]` y `obj['1']` devuelven lo mismo; todos los objetos usados como clave comparten un único valor. Causa: las claves de un objeto se convierten en string (`'[object Object]'` para cualquier objeto). Solución: usa un `Map`. → [ver ejemplo](03-objeto-como-diccionario.md)
- **El diccionario dice que existe una palabra que nunca añadí.** Síntoma: `dict['constructor']` o `'toString' in dict` son verdaderos en un objeto «vacío». Causa: el objeto hereda propiedades de `Object.prototype`. Solución: `Map` (o un objeto sin prototipo, que verás en el módulo de objetos). → [ver ejemplo](03-objeto-como-diccionario.md)
- **Guardé un Map y al leerlo está vacío.** Síntoma: `JSON.stringify(map)` devuelve `'{}'`. Causa: JSON no conoce `Map` ni `Set` y no avisa. Solución: serializa `Object.fromEntries(map)` o `[...map]` y reconstruye con `new Map(...)`. → [ver ejemplo](04-map-y-json.md)
- **El Set no elimina mis objetos repetidos.** Síntoma: dos `{ x: 1, y: 2 }` cuentan como dos elementos; `has({ x: 1, y: 2 })` es `false`. Causa: los objetos se comparan por referencia. Solución: usa una clave primitiva calculada a partir del contenido. → [ver ejemplo](08-set-compara-por-referencia.md)

## Resumen

- `Map` es el diccionario de JavaScript: claves de cualquier tipo, sin conversiones, en orden de inserción; `get` devuelve `undefined` si no existe, así que pregunta con `has`.
- Objetos para registros con campos conocidos; `Map` para diccionarios dinámicos.
- `Map` y `Set` no sobreviven a `JSON.stringify`: conviértelos antes.
- `Map.groupBy` / `Object.groupBy` agrupan un array con una función.
- `Set` guarda valores únicos; `[...new Set(array)]` quita duplicados; `union`, `intersection`, `difference`… son métodos, no operadores.
- Con objetos, `Set` y `Map` comparan referencias, no contenido.
- `WeakMap`/`WeakSet` asocian datos a objetos sin impedir que se liberen; no se pueden recorrer.

## Para profundizar

- [MDN: Map](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN: Set y sus métodos de conjuntos](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Set)
- [MDN: WeakMap](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [javascript.info: Map and Set](https://javascript.info/map-set)
- [javascript.info: WeakMap and WeakSet](https://javascript.info/weakmap-weakset)
