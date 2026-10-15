# La cadena de prototipos

## Por qué importa

Desde el primer módulo has visto dos pistas sin explicación: al expandir un objeto en la consola aparece al final una línea `[[Prototype]]`, y un objeto vacío «tiene» métodos como `toString` que nadie le ha escrito. Las dos pistas llevan al mismo sitio: el mecanismo de **herencia** de JavaScript.

En Python, un objeto hereda de su **clase**, y la clase de sus clases base. En JavaScript no hace falta ninguna clase: un objeto hereda directamente de **otro objeto**, su prototipo, que a su vez puede heredar de otro, formando una **cadena**. Cuando lees una propiedad que el objeto no tiene, el motor la busca a lo largo de esa cadena. Las clases de JavaScript, que verás en el módulo siguiente, son una sintaxis cómoda construida exactamente sobre este mecanismo, así que entenderlo bien te ahorrará muchas sorpresas.

## El enlace `[[Prototype]]`

Todo objeto tiene un enlace interno, llamado `[[Prototype]]` en la especificación, que apunta a **otro objeto** o a `null`. Los dobles corchetes indican que es interno: no es una propiedad que puedas leer con un punto. Para leerlo se usa `Object.getPrototypeOf(obj)`.

Un objeto literal tiene como prototipo un objeto que el navegador crea al arrancar y que se llama `Object.prototype`. Ahí están `toString`, `hasOwnProperty`, `valueOf` y los demás métodos que tienen todos los objetos. El nombre `Object.prototype` (una propiedad de la función `Object`) se explica en la lección siguiente; de momento basta con saber que es un objeto normal.

La consola es la mejor herramienta para verlo. Ejecuta el ejemplo con «▶ Run» (o ábrelo en el editor), expande `book` y después su `[[Prototype]]`:

[[exercise:01-ver-el-prototipo.md-]]

```text
▼ book → {title: 'Rayuela', year: 1963}
    title: 'Rayuela'
    year: 1963
  ▼ [[Prototype]]: Object.prototype
      constructor: ƒ Object()
      …
      hasOwnProperty: ƒ hasOwnProperty()
      …
      toString: ƒ toString()
      …
```

Las propiedades de `Object.prototype` salen en gris: son **no enumerables** (lección «Propiedades a fondo»). La consola de LearnWeb rotula cada prototipo con su nombre (`Object.prototype`, `Array.prototype`); Chrome DevTools escribe `Object` o `Array(0)`, pero el contenido es el mismo. Un prototipo que no es el de ninguna constructora, como los que crearás con `Object.create`, aparece resumido como `{…}`: expándelo para ver qué hay dentro.

Verás también `obj.__proto__`, la forma antigua de leer y cambiar el prototipo. No es una propiedad del objeto, sino un getter/setter heredado de `Object.prototype`, y por eso no funciona en los objetos que no heredan de él. Usa `Object.getPrototypeOf`. La única forma de `__proto__` que sigue siendo recomendable es dentro de un literal, `{ __proto__: proto, … }`, que fija el prototipo al crear el objeto.

> **Desde Python:** `Object.getPrototypeOf(book)` cumple el papel de `book.__class__`, con una diferencia de fondo: el prototipo no es una clase ni un tipo, es un objeto como cualquier otro. Puedes crearlo con un literal, añadirle propiedades y usarlo como prototipo de otros.

## La cadena

El prototipo también es un objeto, así que también tiene su `[[Prototype]]`. Siguiendo los enlaces se forma la **cadena de prototipos**, que siempre termina en `null`:

```text
tags ──► Array.prototype ──────► Object.prototype ──────► null
         map, filter, push…      toString, hasOwnProperty…
```

Un array hereda de `Array.prototype` (que tiene los métodos de los arrays), y este de `Object.prototype`. Por eso un array tiene a la vez `map` y `hasOwnProperty`. La función `chainOf` del ejemplo sigue los enlaces con `Object.getPrototypeOf` hasta llegar a `null`:

[[exercise:02-recorrer-la-cadena.md-]]

```text
{ a: 1 }     → Object.prototype → null
[1, 2]       → Array.prototype → Object.prototype → null
function     → Function.prototype → Object.prototype → null
new Date()   → Date.prototype → Object.prototype → null
```

> **Desde Python:** es lo que ves en `type(x).__mro__` (por ejemplo, `bool.__mro__` es `(bool, int, object)`), con `Object.prototype` en el papel de `object`. La diferencia es que en Python la cadena es de **clases** y en JavaScript de **objetos**.

## Crear objetos con un prototipo: `Object.create`

`Object.create(proto)` crea un objeto **vacío** cuyo `[[Prototype]]` es `proto`. Con él puedes construir tus propias cadenas. El uso más directo: poner los métodos en un objeto y crear muchos objetos que lo tengan como prototipo. Cada uno guarda sus **datos**; los **métodos** existen una sola vez, en el prototipo común:

```text
anaAccount  { owner, balanceCents } ──┐
                                      ├──► accountMethods { deposit, describe } ──► Object.prototype ──► null
luisAccount { owner, balanceCents } ──┘
```

El ejemplo crea así dos cuentas bancarias que comparten sus métodos:

[[exercise:03-object-create.md-]]

A esto se le llama **delegación**: `anaAccount` no tiene un método `describe`, pero cuando se lo piden, delega en su prototipo. `Object.create` admite un segundo argumento con descriptores, como `Object.defineProperties`, y en un literal la clave especial `__proto__` hace lo mismo que `Object.create`: `{ __proto__: accountMethods, owner: 'Iker Sanz' }`.

## Leer: la búsqueda recorre la cadena

Cuando lees `obj.key` (o `obj[key]`), el motor hace esto:

1. Si `key` es una propiedad **propia** de `obj`, devuelve su valor (o ejecuta su getter).
2. Si no, pasa al prototipo de `obj` y repite el paso 1 con él.
3. Si llega a `null` sin encontrarla, el resultado es `undefined`.

```text
novel.currency

  novel { title, cents }         ¿currency? no
    └─► book { category, vatRate }   ¿currency? no
          └─► baseProduct { currency, describe }   ¿currency? sí → 'EUR'
```

La función `whereIs` del ejemplo repite esos pasos a mano y dice en qué eslabón aparece cada clave:

[[exercise:04-busqueda-de-propiedades.md-]]

```text
title    → novel ✔
vatRate  → novel → book ✔
currency → novel → book → baseProduct ✔
toString → novel → book → baseProduct → Object.prototype ✔
isbn     → novel → book → baseProduct → Object.prototype → null: undefined
novel.describe() → Rayuela: 21.90 EUR
```

Fíjate en la última línea, porque es la pieza que hace funcionar todo el sistema: `describe` se **encuentra** en `baseProduct`, pero se **llama** como `novel.describe()`, así que `this` es `novel` (la regla del método de la lección «La palabra clave this»). Un método heredado trabaja con los datos del objeto que lo llama, no con los del prototipo donde está guardado.

> **Desde Python:** `novel.describe()` busca primero en `novel.__dict__`, después en la clase y en su `__mro__`, y llama a la función encontrada con `self = novel`. Es el mismo algoritmo; solo cambia que aquí los eslabones son objetos.

## Escribir: la asignación crea una propiedad propia

Leer recorre la cadena; **asignar no**. `obj.key = valor` crea (o cambia) una propiedad **propia** de `obj`, aunque exista una con ese nombre más arriba. La heredada sigue ahí, pero queda tapada: se dice que la propia la **sombrea** (*shadowing*). `delete` también actúa solo sobre las propias, así que al borrar la propia la heredada vuelve a verse:

```text
userPrefs.theme = 'dark'

  userPrefs { theme: 'dark' } ──► defaults { theme: 'light', fontSize: 16, language: 'es' }
              ▲ se encuentra primero          ▲ tapada, pero intacta
```

El ejemplo sombrea una preferencia, cambia la base y borra, y muestra qué se ve en cada momento:

[[exercise:05-sombreado.md-]]

El enlace al prototipo está **vivo**: si cambias `defaults.fontSize`, todos los objetos que heredan de `defaults` y no tienen su propio `fontSize` ven el valor nuevo. No se copia nada al crear el objeto.

> **Desde Python:** es exactamente un atributo de instancia que tapa uno de clase: `p.theme = 'dark'` escribe en `p.__dict__` sin tocar `Prefs.theme`, y `del p.theme` lo destapa.

### Datos mutables en el prototipo

La regla «leer recorre la cadena» tiene una consecuencia peligrosa. `this.songs.push(song)` **no es una asignación** a `songs`: es una **lectura** de `songs` seguida de una llamada a `push`. Si `songs` está en el prototipo, la lectura encuentra ese array y `push` lo modifica… para todos los objetos que lo heredan:

[[exercise:06-estado-compartido-en-el-prototipo.md-]]

La regla práctica: en el prototipo van los **métodos** y, como mucho, valores por defecto **inmutables** (números, strings). Los datos que cambian (arrays, objetos, contadores) tienen que ser propios de cada objeto, creados uno nuevo por objeto. En la lección siguiente verás que es justo el reparto que hacen las funciones constructoras: los datos en `this`, los métodos en el prototipo.

> **Desde Python:** es el mismo bug que un atributo de clase mutable (`class Playlist: songs = []`), compartido por todas las instancias. Allí se arregla creando la lista en `__init__`; aquí, creando el array en cada objeto.

### Dos excepciones: setters y propiedades de solo lectura

Antes de crear la propiedad propia, la asignación mira la cadena, y hay dos casos en que **no** crea nada:

- Si encuentra un **setter** heredado, lo ejecuta (con `this` = el objeto de la asignación). Así funcionan los setters definidos en un prototipo.
- Si encuentra una propiedad heredada con `writable: false`, la asignación falla: en silencio en un script clásico, con `TypeError` en modo estricto. `Object.defineProperty` no mira la cadena y sí puede crear la propia.

El ejemplo muestra los dos casos:

[[exercise:07-asignar-tambien-consulta-la-cadena.md-]]

> **Desde Python:** la primera excepción es la precedencia de los descriptores de datos: una `property` de la clase gana al `__dict__` de la instancia, y `obj.email = x` llama a su *setter*.

## ¿Propia o heredada?

Varias operaciones preguntan por propiedades, y cada una mira un alcance distinto:

| Operación | Propias | Heredadas | No enumerables |
|-----------|---------|-----------|----------------|
| `obj.key`, `'key' in obj` | sí | sí | sí |
| `Object.hasOwn(obj, 'key')` | sí | no | sí |
| `for (const key in obj)` | sí | **sí** | no |
| `Object.keys/values/entries(obj)` | sí | no | no |
| `Object.getOwnPropertyNames(obj)` | sí | no | sí |

`in` responde «¿se encuentra esta clave en la cadena?»; `Object.hasOwn`, «¿es propia de este objeto?». Comprobar `obj.key !== undefined` no sirve para ninguna de las dos, porque falla con las propiedades que existen y valen `undefined`:

[[exercise:08-in-frente-a-hasown.md-]]

En código anterior a 2022 verás `obj.hasOwnProperty(key)`. Funciona casi siempre, pero es un método **heredado**: falla si el objeto tiene una propiedad propia llamada `hasOwnProperty` (algo posible si los datos vienen de un formulario o de un JSON) o si no hereda de `Object.prototype`. Por eso se añadió `Object.hasOwn`, una función que no depende de la cadena. La versión antigua segura es `Object.prototype.hasOwnProperty.call(obj, key)`.

### `for…in` recorre también lo heredado

De la tabla anterior, la fila que más sorprende es la de `for…in`: recorre las claves enumerables propias **y las heredadas**. Los métodos de `Object.prototype` no salen porque no son enumerables, pero cualquier propiedad que añadas tú a un prototipo con una asignación sí:

[[exercise:09-for-in-recorre-lo-heredado.md-]]

Para recorrer solo lo propio, usa `Object.keys`, `Object.values` u `Object.entries` con `for…of`, como recomendaba la lección «Objetos literales». El viejo guardia `if (!Object.hasOwn(obj, key)) continue;` dentro del `for…in` consigue lo mismo. Y si lo que quieres es justo lo contrario, la configuración efectiva con los valores por defecto incluidos, `for…in` es la herramienta.

## Objetos sin prototipo: `Object.create(null)`

`Object.create(null)` crea un objeto cuyo `[[Prototype]]` es `null`: no hereda **nada**. No tiene `toString`, ni `constructor`, ni `hasOwnProperty`, y la clave `__proto__` es una clave normal. Es un diccionario «limpio», sin claves fantasma:

[[exercise:10-object-create-null.md-]]

La consola lo marca como `[Object: null prototype] {…}` y, al expandirlo, no aparece ninguna línea `[[Prototype]]`. El precio es que tampoco tiene los métodos que convierten un objeto en texto, así que una plantilla como `` `${wordCount}` `` lanza `TypeError: Cannot convert object to primitive value`. Las funciones estáticas (`Object.keys`, `Object.entries`, `Object.hasOwn`) funcionan igual, porque no dependen de la cadena.

Ya conoces el problema que resuelve: la lección «Map, Set y Weak» mostró el diccionario que «ya tenía» la palabra `constructor`. Ahora sabes por qué: la búsqueda llega a `Object.prototype`. Para diccionarios nuevos, `Map` sigue siendo la opción clara, pero `Object.create(null)` aparece en mucho código y en el propio lenguaje (`Object.groupBy` devuelve objetos así).

## De Python a JavaScript

| Python | JavaScript |
|--------|------------|
| `type(obj)`, `obj.__class__` | `Object.getPrototypeOf(obj)` (un objeto, no una clase) |
| `type(obj).__mro__` | la cadena: `Object.getPrototypeOf` repetido hasta `null` |
| `vars(obj)`, `obj.__dict__` | propiedades propias: `Object.keys(obj)`, `Object.getOwnPropertyNames(obj)` |
| `getattr(obj, 'x')` | `obj.x`, `obj[key]` |
| `hasattr(obj, 'x')` | `'x' in obj` |
| `'x' in vars(obj)` | `Object.hasOwn(obj, 'x')` |
| `AttributeError` | `undefined` |
| atributo de instancia que tapa uno de clase | propiedad propia que sombrea una heredada |
| `object` | `Object.prototype` |

## Bestiario

- **El array que comparten todos los objetos.**
  Síntoma: añadir un elemento a la lista de un objeto lo añade a la de todos.
  Causa: el array está en el prototipo; `this.songs.push()` lee el heredado y lo muta.
  Solución: crea los datos mutables como propiedades propias de cada objeto; en el prototipo, solo métodos.
  → [ver ejemplo](06-estado-compartido-en-el-prototipo.md)
- **`hasOwnProperty is not a function`.**
  Síntoma: `obj.hasOwnProperty(key)` lanza `TypeError` con ciertos objetos.
  Causa: el objeto tiene una propiedad propia con ese nombre, o no hereda de `Object.prototype`.
  Solución: `Object.hasOwn(obj, key)`.
  → [ver ejemplo](08-in-frente-a-hasown.md)
- **El `for…in` que lista claves de más.**
  Síntoma: un recorrido incluye propiedades que el objeto no tiene como propias.
  Causa: `for…in` recorre también las propiedades enumerables heredadas.
  Solución: `Object.keys/entries` con `for…of`, o un guardia con `Object.hasOwn`.
  → [ver ejemplo](09-for-in-recorre-lo-heredado.md)

## Resumen

- Todo objeto tiene un enlace `[[Prototype]]` a otro objeto o a `null`; se lee con `Object.getPrototypeOf`.
- Los enlaces forman la cadena de prototipos, que termina en `Object.prototype` y luego en `null`.
- Leer una propiedad recorre la cadena hasta encontrarla; un método heredado recibe como `this` el objeto de la llamada.
- Asignar crea una propiedad propia que sombrea a la heredada (salvo setters y propiedades de solo lectura heredadas).
- En el prototipo van los métodos; los datos mutables, en cada objeto.
- `Object.create(proto)` crea un objeto con el prototipo que elijas; `Object.create(null)`, uno sin prototipo.
- `in` mira la cadena; `Object.hasOwn`, solo el objeto; `for…in` incluye lo heredado enumerable.

## Para profundizar

- [MDN: herencia y la cadena de prototipos](https://developer.mozilla.org/es/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [javascript.info: herencia prototípica](https://es.javascript.info/prototype-inheritance)
- [javascript.info: métodos prototipo, objetos sin __proto__](https://es.javascript.info/prototype-methods)
- [MDN: Object.create](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
- [MDN: Object.hasOwn](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
