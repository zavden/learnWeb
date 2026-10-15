# Objetos literales

## Por qué importa

En JavaScript, el objeto es la estructura de datos universal: la configuración de una aplicación, un usuario que llega de una API, las opciones que pasas a una función, un registro de una tabla. El **objeto literal** (`{ clave: valor }`) es la forma más directa de crearlo y, a primera vista, es un `dict` de Python con otra sintaxis. Pero no es exactamente un diccionario: sus claves siempre son texto, algunas se reordenan solas, hereda propiedades que no escribiste y las copias rápidas comparten lo que llevan dentro. Esta lección te enseña a usarlo con soltura y a saber cuándo no es la herramienta adecuada.

## Pares clave → valor

Un objeto literal se escribe entre llaves, con las claves sin comillas cuando son nombres válidos. Se lee con **punto** (`book.title`) cuando el nombre es fijo y con **corchetes** (`book[field]`) cuando la clave está en una variable o no es un nombre válido (`book['reading-list']`):

[[exercise:01-propiedades.md-]]

| Python (`dict`) | JavaScript (objeto) |
|-----------------|---------------------|
| `d = {"title": "Rayuela"}` | `const d = { title: 'Rayuela' };` |
| `d["title"]` | `d.title` o `d['title']` |
| `d[field]` | `d[field]` |
| `d["isbn"]` → `KeyError` | `d.isbn` → `undefined` |
| `d.get("isbn", "sin ISBN")` | `d.isbn ?? 'sin ISBN'` |
| `d["isbn"] = "…"` | `d.isbn = '…'` |
| `del d["isbn"]` | `delete d.isbn` |
| `"title" in d` | `Object.hasOwn(d, 'title')` |
| `len(d)` | `Object.keys(d).length` |

Fíjate en la última comprobación. El operador `in` de JavaScript existe, pero pregunta también por las propiedades **heredadas**: todo objeto literal hereda de `Object.prototype` métodos como `toString`, así que `'toString' in book` es `true`. `Object.hasOwn(obj, clave)` solo mira las propiedades propias, que es lo que quieres casi siempre. De dónde salen esas propiedades heredadas lo verás en el módulo «Objetos y prototipos».

## Las claves siempre son strings

En un `dict` de Python, `1` y `'1'` son claves distintas, y puedes usar tuplas como claves. En un objeto, toda clave que no sea un string (o un `symbol`) se **convierte a string** al guardarla. Con números parece inofensivo; con objetos es un desastre silencioso, porque todos se convierten en el mismo texto, `'[object Object]'`:

[[exercise:02-las-claves-son-strings.md-]]

Si necesitas claves que no son texto (objetos, números que deben seguir siendo números, fechas), la estructura correcta es `Map`, que verás en la lección siguiente. Si las claves son texto, el objeto va perfecto.

## Atajos al crear objetos

Dos atajos que verás en todo el código moderno. Las **propiedades abreviadas** (*shorthand*): si una variable se llama igual que la clave, `{ name, email }` equivale a `{ name: name, email: email }`. Y las **claves calculadas**: `{ [expresión]: valor }` usa el resultado de la expresión como clave.

[[exercise:03-shorthand-y-claves-computadas.md-]]

> **Desde Python:** en un `dict`, la clave siempre es una expresión: `{field: "x"}` usa el **valor** de `field`. En un objeto literal, `{ field: 'x' }` usa el **texto** `'field'`; para usar el valor hacen falta corchetes: `{ [field]: 'x' }`. Es un error frecuente al pasar de un lenguaje al otro.

## Métodos

Una propiedad puede guardar una función: entonces se llama **método**. Dentro de un método, `this` es el objeto a la izquierda del punto en la llamada (`cart.addItem(…)` → `this` es `cart`). Es el `self` de Python, con una diferencia: no se declara como parámetro, aparece solo.

[[exercise:04-metodos.md-]]

Un objeto literal con métodos es suficiente cuando solo necesitas **un** objeto de ese tipo. Cuando necesites muchos (cien carritos, mil usuarios), usarás clases, que llegan en el módulo «Clases y POO». Y `this` tiene reglas que sorprenden (por ejemplo, se pierde al pasar el método como argumento): las verás en «Funciones y ámbito».

## Desestructuración

Como con los arrays, la desestructuración saca propiedades a variables en una línea. Con objetos se busca **por nombre**, no por posición, y se puede renombrar (`{ id: userId }`), dar valores por defecto (`{ role = 'lector' }`), entrar en objetos anidados y recoger el resto con `...`:

[[exercise:05-desestructuracion.md-]]

El patrón `const { password, ...publicProfile } = user` es muy habitual: crea un objeto nuevo sin las propiedades que no quieres enviar o mostrar, sin modificar el original. Python no tiene nada equivalente para diccionarios; lo más parecido es `{k: v for k, v in user.items() if k != "password"}`.

Un detalle de sintaxis: si desestructuras en variables que ya existen, la sentencia debe ir entre paréntesis (`({ total, currency } = data);`), porque una línea que empieza por `{` se interpreta como un bloque.

## Spread: combinar y copiar (en superficie)

El spread también funciona con objetos: `{ ...a, ...b }` crea un objeto nuevo con las propiedades de `a` y de `b`; si una clave se repite, **gana la última**. Es el `{**a, **b}` (o `a | b`) de Python, y la forma habitual de aplicar preferencias sobre unos valores por defecto.

Pero, igual que con arrays, la copia es **superficial**: solo copia el primer nivel. Si una propiedad contiene otro objeto, la copia y el original apuntan al mismo objeto interior:

```text
defaults ─► { theme, language, notifications: ─┐ }
                                               ├──► { email: true, push: false }
settings ─► { theme, language, notifications: ─┘ }      (un solo objeto compartido)
```

[[exercise:06-spread-copia-superficial.md-]]

Hay dos consecuencias. Modificar un objeto anidado de la «copia» modifica también el original (y, en el ejemplo, las preferencias por defecto de todos los usuarios). Y al combinar, un objeto anidado de `b` **sustituye entero** al de `a`, no se mezclan sus claves. La solución es copiar también los niveles que vayas a modificar, o hacer una copia profunda con `structuredClone`, que verás en «JSON y copias».

## Recorrer un objeto

`Object.keys(obj)`, `Object.values(obj)` y `Object.entries(obj)` devuelven **arrays** con las claves, los valores y los pares `[clave, valor]`: son el `keys()`, `values()` e `items()` de Python. Como son arrays, se combinan con todo lo que viste en la lección anterior. Y `Object.fromEntries` hace el camino inverso, de pares a objeto:

[[exercise:07-recorrer-un-objeto.md-]]

La combinación `Object.entries` → `map` o `filter` → `Object.fromEntries` es la **comprensión de diccionario** de JavaScript:

```python
with_vat = {drink: round(price * 1.1, 2) for drink, price in prices.items()}
```

```js
const withVat = Object.fromEntries(
  Object.entries(prices).map(([drink, price]) => [drink, Math.round(price * 110) / 100]),
);
```

En el módulo anterior viste `for…in`, que también recorre claves. Prefiere `Object.entries` con `for…of`: te da la clave y el valor a la vez, y no incluye propiedades heredadas.

## El orden de las claves

Desde Python 3.7, un `dict` conserva el orden de inserción de todas sus claves. Un objeto de JavaScript **casi** también: las claves de texto se recorren en orden de inserción, pero las que parecen **índices de array** (enteros no negativos escritos sin ceros a la izquierda: `'0'`, `'7'`, `'2026'`) van siempre primero y ordenadas de menor a mayor:

[[exercise:08-orden-de-las-claves.md-]]

La regla completa, que siguen `Object.keys`, `Object.entries`, `for…in`, `JSON.stringify` y la consola:

1. Primero, las claves que son índices de array, en orden numérico ascendente.
2. Después, el resto de claves de texto, en orden de inserción.
3. Por último, las claves `symbol`, en orden de inserción (solo para las funciones que las incluyen).

Es una herencia del diseño de los arrays (que, por dentro, son objetos con claves `'0'`, `'1'`…). Cuando el orden forma parte del dato, usa un `Map` o un array de objetos.

## Agrupar

Una tarea muy común con datos es agrupar una lista por una propiedad: los gastos por categoría, los pedidos por estado, los alumnos por curso. `Object.groupBy(array, función)` (2024) lo hace en una línea y devuelve un objeto con un array por grupo:

[[exercise:09-agrupar-con-object-groupby.md-]]

El objeto que devuelve `Object.groupBy` no hereda de `Object.prototype` (tiene prototipo `null`), así que no tiene `toString` ni ninguna otra propiedad heredada que pueda chocar con el nombre de un grupo. La consola lo marca como `[Object: null prototype]` o con un prototipo vacío.

## Bestiario

- **El objeto como clave que pisa a los demás.**
  Síntoma: `cache[userA] = …` y `cache[userB] = …` comparten valor; `Object.keys` muestra `'[object Object]'`.
  Causa: las claves de un objeto se convierten a string, y todos los objetos dan el mismo texto.
  Solución: `Map` para claves que no son texto, o una clave de texto propia (`cache[user.id]`).
  → [ver ejemplo](02-las-claves-son-strings.md)
- **La copia que modifica el original.**
  Síntoma: tras `const copy = { ...original }`, cambiar `copy.nested.x` cambia también `original.nested.x`; al combinar, se pierden claves anidadas.
  Causa: el spread copia solo el primer nivel; los objetos anidados se comparten y se sustituyen enteros.
  Solución: copia también los niveles que modificas (`{ ...a, nested: { ...a.nested, x } }`) o usa `structuredClone`.
  → [ver ejemplo](06-spread-copia-superficial.md)
- **Las claves que se reordenan solas.**
  Síntoma: años, identificadores o códigos postales aparecen en orden numérico y no en el de inserción.
  Causa: las claves con forma de índice de array van primero y ordenadas.
  Solución: `Map` o un array de objetos cuando el orden importa.
  → [ver ejemplo](08-orden-de-las-claves.md)

## Resumen

- Un objeto literal es un conjunto de pares clave → valor; se lee con `.clave` o `[expresión]`; lo que no existe da `undefined`.
- `Object.hasOwn(obj, clave)` comprueba propiedades propias; `in` incluye las heredadas.
- Las claves se convierten a string: para otras claves, `Map`.
- Atajos: `{ name, email }` y claves calculadas `{ [expr]: valor }`; métodos con `nombre() { … }` y `this`.
- Desestructuración con renombre, valores por defecto, anidamiento y `...resto`.
- `{ ...a, ...b }` combina (gana la última clave) pero copia solo el primer nivel.
- `Object.keys/values/entries` devuelven arrays; `Object.fromEntries` cierra el círculo.
- Las claves con forma de entero van primero y ordenadas; `Object.groupBy` agrupa por una propiedad.

## Para profundizar

- [MDN: trabajando con objetos](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Working_with_objects)
- [javascript.info: objetos](https://es.javascript.info/object)
- [javascript.info: Object.keys, values, entries](https://es.javascript.info/keys-values-entries)
- [MDN: sintaxis extendida (spread)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [MDN: Object.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy)
