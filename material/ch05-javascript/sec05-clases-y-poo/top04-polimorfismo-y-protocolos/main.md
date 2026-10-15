# Polimorfismo y protocolos

## Por qué importa

Polimorfismo significa que objetos distintos responden al mismo mensaje, cada uno a su manera, y que el código que los usa no necesita saber cuál es cuál. Es lo que permite añadir un medio de pago nuevo escribiendo una clase, sin tocar el resto del programa. En JavaScript hay dos formas de conseguirlo: la herencia de la lección anterior y el *duck typing*, que Python también usa.

La segunda parte de la lección trata de los **protocolos**: los métodos con nombres especiales que el propio lenguaje llama por ti. En Python son los métodos mágicos (`__iter__`, `__str__`, `__eq__`, `__add__`…). JavaScript tiene sus equivalentes, casi todos con **símbolos** como clave (`Symbol.iterator`, `Symbol.toPrimitive`), pero le faltan varios de los más usados en Python: no hay forma de redefinir `+` ni `==` para tus clases. Saber qué protocolos existen y cuáles no te evitará buscar algo que no está.

## Polimorfismo

Si cada clase de una jerarquía sabe hacer su parte (calcular su comisión, dibujarse, exportarse), el código que las usa puede tratarlas a todas igual: llama a `method.fee(cents)` y la búsqueda en la cadena de prototipos elige, en cada objeto, la versión de su clase. La alternativa es un `switch` que pregunta por el tipo, y que hay que ampliar (en todos los sitios donde se repita) cada vez que aparece un tipo nuevo:

[[exercise:01-polimorfismo.md-]]

```text
con switch → 4200
💳 Tarjeta: $1200.00 + comisión $42.00
🏦 Transferencia: $1200.00 + comisión $0.00
💵 Contra entrega: $1200.00 + comisión $45.00
más barato → 🏦 Transferencia
```

Fíjate en `describe`, escrito una sola vez en la clase base: llama a `this.fee(cents)` y obtiene la comisión de la subclase, como el patrón plantilla de la lección anterior. `Transfer` ni siquiera define `fee`: hereda la de la base.

## *Duck typing*

«Si camina como un pato y grazna como un pato, es un pato»: una función que solo usa `target.write(text)` acepta **cualquier** objeto con un método `write`, sea de la clase que sea, o un objeto literal. No hace falta heredar de nada ni declarar nada. Es la forma más habitual de polimorfismo en JavaScript, y la misma que en Python:

[[exercise:02-duck-typing.md-]]

```text
MemoryFile → "Ventas de octubre\nPuebla: 120\nMérida: 85"
  [log] 3 líneas: Ventas de octubre · Puebla: 120 · Mérida: 85
literal → caracteres: 38
⛔ TypeError: target.write is not a function
instanceof Writable → true true false
```

Dos herramientas completan el *duck typing*. Para las capacidades **opcionales**, el encadenamiento opcional de llamadas: `target.flush?.()` llama a `flush` solo si existe. Y para preguntar «¿tiene este objeto la forma que necesito?» con `instanceof`, una clase puede definir el método estático `[Symbol.hasInstance]`, que decide qué responde `x instanceof Clase`. Úsalo con moderación: un `instanceof` que no mira la cadena de prototipos sorprende a quien lee el código.

> **Desde Python:** el *duck typing* funciona igual. `Symbol.hasInstance` es el `__instancecheck__` (o el `__subclasshook__` de las ABC), y `typing.Protocol`, que describe la forma esperada para el comprobador de tipos, tiene su equivalente en las interfaces de TypeScript (capítulo 7).

## Los protocolos del lenguaje

Un protocolo es un método con un nombre acordado que el lenguaje llama en ciertas situaciones. Ya conoces dos: `toString`, que se llama al convertir un objeto en texto (lección «Prototipos nativos»), y `toJSON`, que llama `JSON.stringify` (lección «JSON y copias»). Los demás usan **símbolos bien conocidos** como clave: valores `symbol` que el lenguaje crea al arrancar y guarda como propiedades de `Symbol` (`Symbol.iterator`, `Symbol.toPrimitive`, `Symbol.toStringTag`, `Symbol.hasInstance`…). Al ser símbolos, no pueden chocar con ningún nombre de método tuyo. En una clase, un método con clave de símbolo se escribe con un **nombre calculado**, entre corchetes: `[Symbol.iterator]() { … }`.

### `Symbol.iterator`: recorrer con `for…of`

Un objeto es **iterable** si tiene un método `[Symbol.iterator]()` que devuelve un **iterador**: un objeto con un método `next()` que, en cada llamada, devuelve `{ value, done }`. Con eso, tu clase funciona en todos los sitios que consumen iterables: `for…of`, el spread `[...x]`, la desestructuración, `Array.from`, `new Set(x)` o `Math.max(...x)`:

```js
[Symbol.iterator]() {
  let current = this.start;
  const { end, step } = this;
  return {
    next() {
      if (current > end) return { value: undefined, done: true };
      const value = current;
      current += step;
      return { value, done: false };
    },
  };
}
```

[[exercise:03-symbol-iterator.md-]]

```text
for…of → 2
for…of → 4
…
spread → (5) [2, 4, 6, 8, 10]
desestructuración → 2 4 (3) [6, 8, 10]
Array.from → (5) [20, 40, 60, 80, 100]
Set → Set(5) {2, 4, 6, 8, 10} | Math.max → 10
next() → {value: 2, done: false} {value: 4, done: false}
objeto normal → TypeError | plainRange is not iterable
```

Cada `for…of` pide un iterador **nuevo** llamando a `[Symbol.iterator]()`, por eso el mismo rango se puede recorrer varias veces. El protocolo completo (iteradores que también son iterables, `return()` para cerrarlos, qué consume iterables) es el tema de la lección «Protocolo iterable» del módulo «Iteradores, generadores y metaprogramación»; allí verás también que un **generador** escribe este método en tres líneas.

> **Desde Python:** `[Symbol.iterator]()` es `__iter__` y `next()` es `__next__`. La diferencia está en el final: Python lanza `StopIteration`; JavaScript devuelve `{ done: true }`.

### `toString` y `valueOf`: texto y número

Cuando JavaScript necesita convertir un objeto en un primitivo (al concatenarlo, compararlo, operar con él o meterlo en una plantilla), llama a uno de dos métodos que todo objeto hereda de `Object.prototype`: `toString`, que debería dar el **texto**, y `valueOf`, que debería dar el **número** (el heredado devuelve el propio objeto, así que no sirve y se pasa al otro). El orden en que los prueba depende de lo que pida la operación, su «pista» (*hint*):

| Operación | Pista | Prueba primero |
|-----------|-------|----------------|
| `` `${x}` ``, `String(x)`, claves de objeto | `string` | `toString` |
| `+x`, `x * 2`, `x > y`, `Math.round(x)` | `number` | `valueOf` |
| `x + y`, `x == y` | `default` | `valueOf` |

La tercera fila es la trampa. Si tu clase define `valueOf`, la concatenación `'Total: ' + price` **no** usa `toString`: usa `valueOf`, y escribe el número. Y `sort()` sin comparador hace lo contrario de lo que esperarías: convierte cada elemento a **texto** y compara letras:

[[exercise:04-tostring-y-valueof.md-]]

```text
plantilla → Total: $19.99
String() → $19.99
🐛 concatenación → Total: 1999
aritmética → 3998 | comparar → true | +price → 1999
🐛 sort() → (3) ['$10.00', '$250.00', '$9.00']
✅ sort((a, b) => a - b) → (3) ['$9.00', '$10.00', '$250.00']
✅ plantilla → Total: $19.99
```

En la lección «Operadores y coerción» viste la versión corta de esta regla («primero `valueOf`, después `toString`»), que explicaba las conversiones de los arrays; la tabla añade el matiz que allí no hacía falta: las plantillas y `String()` empiezan por `toString`. La recomendación práctica: para obtener texto usa plantillas o `String(x)`, nunca `'…' + x`; y define `valueOf` solo en clases que de verdad representen un número.

### `Symbol.toPrimitive`: una sola puerta

Si una clase define `[Symbol.toPrimitive](hint)`, JavaScript lo llama para **todas** las conversiones a primitivo, con la pista como argumento (`'number'`, `'string'` o `'default'`), y ya no usa ni `valueOf` ni `toString` para convertir. Es la forma de controlar cada caso, incluido el `default` del `+`:

[[exercise:05-symbol-toprimitive.md-]]

```text
(index)               resultado        pista
`${today}`            '21.5 °C'        'string'
String(today)         '21.5 °C'        'string'
+today                21.5             'number'
today * 2             43               'number'
today > 20            true             'number'
Math.round(today)     22               'number'
'Hoy: ' + today       'Hoy: 21.5 °C'   'default'
today == '21.5 °C'    true             'default'
```

Así funcionan las fechas: `Date` tiene un `Symbol.toPrimitive` que con la pista `default` devuelve texto, por eso `date + 1` concatena y `date - 1` resta.

## No hay sobrecarga de operadores

Aquí está la diferencia más grande con Python. En Python, `a + b` llama a `a.__add__(b)` y `a == b` a `a.__eq__(b)`, así que tus clases pueden sumar vectores o comparar dinero por su contenido. En JavaScript **no existe nada parecido**:

- `a + b` con objetos convierte cada uno a primitivo (con los métodos de antes) y suma o concatena **esos primitivos**. Con `valueOf`, el resultado es un número, no un objeto de tu clase.
- `===` y `==` entre dos objetos comparan **identidad**: ¿son el mismo objeto? Dos objetos con el mismo contenido son distintos. Y como `<=` y `>=` sí convierten con `valueOf`, puede pasar que `x <= y && x >= y` sea `true` y `x == y` sea `false`.
- `Set`, `Map`, `includes` e `indexOf` también comparan por identidad: no hay `__eq__` ni `__hash__` que cambiar.

[[exercise:06-no-hay-sobrecarga-de-operadores.md-]]

```text
🐛 a + b → [object Object][object Object]
🐛 Money + Money → 750 | typeof → number
🐛 x === y → false | x == y → false
🐛 pero x <= y && x >= y → true
🐛 new Set([x, y]).size → 2 | [x].includes(y) → false
✅ p.add(q) → Vec(4, 6)
✅ p.add(q).equals(new Vec(4, 6)) → true
✅ únicos por contenido → (2) ['Vec(1, 2)', 'Vec(3, 4)']
```

La solución idiomática son **métodos con nombre**: `a.add(b)`, `a.equals(b)`, `Money.compare(a, b)` para ordenar. Para usar objetos como claves «por contenido» en un `Map` o un `Set`, se calcula una clave primitiva (un string como `'Vec(1, 2)'`). Lo verás aplicado a objetos de valor en la lección «Patrones de diseño».

## `Symbol.toStringTag`

El `toString` original de `Object.prototype`, prestado con `call`, devuelve una etiqueta como `[object Map]`; en la lección «Prototipos nativos» la usaste para distinguir tipos con más detalle que `typeof`. Para tus clases devuelve `[object Object]`, salvo que definan un getter `[Symbol.toStringTag]`, que elige la palabra de después de `object`:

[[exercise:07-symbol-tostringtag.md-]]

```text
sin etiqueta → [object Object]
con etiqueta → [object Shipment]
nativos → [object Map] [object Set] [object JSON] [object Math]
Map.prototype[Symbol.toStringTag] → Map
plantillas → [object Object] | [object Shipment]
describeValue → (4) ['Shipment (object)', 'Array (object)', 'Null (object)', 'Date (object)']
impostor → [object Shipment]
```

Es una etiqueta para mostrar y depurar, no una comprobación de tipo: cualquier objeto puede ponerse la que quiera. Para comprobar tipos, `instanceof` o, mejor, una comprobación de marca con `#x in obj` (lección «Encapsulación»).

## `toJSON` y `fromJSON`

`JSON.stringify` llama al método `toJSON()` de cada objeto, si existe, y serializa lo que devuelve. En una clase es el sitio natural para decidir qué se guarda, incluidos los campos privados, que `JSON.stringify` no vería. El camino de vuelta no tiene protocolo: `JSON.parse` devuelve objetos literales, sin prototipo ni métodos. La convención es un método estático `fromJSON` que crea una instancia de verdad, como el *reviver* de la lección «JSON y copias»:

[[exercise:08-tojson-y-fromjson.md-]]

```text
JSON → [{"type":"Task","title":"Pagar el predial","doneAt":"2026-10-02T16:30:00Z"},{"type":"Task","title":"Renovar el pasaporte","doneAt":null}]
🐛 sin reconstruir → undefined | instanceof → false
✅ reconstruidas → (2) ['Pagar el predial: hecha', 'Renovar el pasaporte: pendiente']
✅ instanceof → true | ida y vuelta igual → true
```

## Los métodos mágicos de Python, en JavaScript

Una clase que implementa los protocolos se comporta como un tipo nativo. El ejemplo construye una lista de la compra que se puede recorrer, convertir a texto y a JSON, y consultar con `size`, `has` y `at`, los nombres que usan `Map`, `Set` y los arrays:

[[exercise:09-una-coleccion-con-protocolos.md-]]

```text
size → 4
has('queso oaxaca') → true
at(0), at(-1) → Tortillas limones
for…of → 1. Tortillas 2. aguacates 3. Queso Oaxaca 4. limones
plantilla → 🛒 Tortillas, aguacates, Queso Oaxaca, limones
JSON → {"week":42,"list":["Tortillas","aguacates","Queso Oaxaca","limones"]}
etiqueta → [object ShoppingList]
list[0] → undefined
list.length → undefined
Boolean(lista vacía) → true
```

La tabla resume la correspondencia. Donde JavaScript no tiene protocolo, la columna dice qué se hace en su lugar:

| Python | JavaScript |
|--------|------------|
| `__init__` | `constructor` |
| `__str__`, `__format__` | `toString()`, o `Symbol.toPrimitive` con la pista `'string'` |
| `__repr__` | sin equivalente: la consola decide cómo mostrar el objeto |
| `__int__`, `__float__` | `valueOf()`, o `Symbol.toPrimitive` con la pista `'number'` |
| `__iter__`, `__next__` | `[Symbol.iterator]()` y `next()` |
| `__len__` | convención: `length` o `size` (no hay `len()`) |
| `__contains__` | convención: `has()` o `includes()` (`in` mira propiedades, no elementos) |
| `__getitem__` | convención: `get()` o `at()`; `obj[i]` propio solo con `Proxy` (módulo «Iteradores, generadores y metaprogramación») |
| `__eq__`, `__hash__` | sin equivalente: `===` es identidad; método `equals()` y claves primitivas |
| `__add__`, `__lt__`… | sin equivalente: métodos `add()`, `compare()` |
| `__bool__` | sin equivalente: todo objeto es *truthy* |
| `__call__` | sin equivalente: solo las funciones se pueden llamar |
| `__instancecheck__` | `static [Symbol.hasInstance]()` |
| `__class__.__name__` | `obj.constructor.name`, `Symbol.toStringTag` |
| `__getattr__`, `__setattr__` | `Proxy` (módulo «Iteradores, generadores y metaprogramación») |
| `__enter__`, `__exit__` | `try/finally` (los navegadores recientes añaden `using` y `Symbol.dispose`) |
| `to_dict()` + `json.dumps(default=…)` | `toJSON()` |

## Bestiario

- **El total que sale en centavos.**
  Síntoma: `'Total: ' + price` escribe `Total: 1999` aunque la plantilla `` `Total: ${price}` `` escribe `$19.99`; o `sort()` ordena `$10.00` antes que `$9.00`.
  Causa: `+` usa la pista `default`, que prueba `valueOf` antes que `toString`; `sort()` sin comparador compara textos.
  Solución: para texto, plantillas o `String(x)`; para ordenar, un comparador; o controla cada caso con `Symbol.toPrimitive`.
  → [ver ejemplo](04-tostring-y-valueof.md)
- **La suma de objetos que no es un objeto y la igualdad que nunca se cumple.**
  Síntoma: `a + b` da `'[object Object][object Object]'` o un número; dos objetos con el mismo contenido no son `===`, y un `Set` no elimina los duplicados.
  Causa: JavaScript no permite redefinir operadores: `+` trabaja con primitivos y `===`, `Set` e `includes` comparan identidad.
  Solución: métodos con nombre (`add`, `equals`, `compare`) y claves primitivas para agrupar por contenido.
  → [ver ejemplo](06-no-hay-sobrecarga-de-operadores.md)

## Resumen

- Polimorfismo: objetos distintos responden al mismo mensaje; con herencia (sobrescribir) o con *duck typing* (tener el método).
- `obj.metodo?.()` llama a una capacidad opcional; `static [Symbol.hasInstance]` cambia lo que responde `instanceof`.
- `[Symbol.iterator]()` que devuelve `{ next() }` hace iterable tu clase: `for…of`, spread, desestructuración, `Array.from`, `Set`.
- `toString` da el texto y `valueOf` el número; `+` y `==` prueban primero `valueOf`. `Symbol.toPrimitive` controla las tres pistas.
- No hay sobrecarga de operadores: `===` compara identidad, también en `Set` e `includes`; usa `add`, `equals` y `compare`.
- `Symbol.toStringTag` pone la etiqueta de `Object.prototype.toString`; `toJSON` decide qué se serializa y `fromJSON` reconstruye.
- Muchos métodos mágicos de Python son convenciones de nombres en JavaScript (`size`, `has`, `at`).

## Para profundizar

- [MDN: símbolos bien conocidos (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#well-known_symbols)
- [MDN: protocolos de iteración](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Iteration_protocols)
- [javascript.info: conversión de objeto a valor primitivo](https://es.javascript.info/object-toprimitive)
- [MDN: Symbol.toPrimitive (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive)
- [MDN: coerción de tipos (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#type_coercion)
