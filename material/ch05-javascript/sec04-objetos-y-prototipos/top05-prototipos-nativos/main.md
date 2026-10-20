# Prototipos nativos

## Por qué importa

Desde el primer módulo usas métodos que no has escrito: `map` en los arrays, `toUpperCase` en los strings, `bind` en las funciones, `toFixed` en los números. Ahora que conoces la cadena de prototipos puedes ver de dónde salen: el lenguaje usa para sus propios tipos **exactamente** el mecanismo que has construido a mano en las lecciones anteriores. `Array` es una función constructora, `Array.prototype` guarda los métodos y cada array hereda de él.

Entenderlo resuelve varias preguntas de golpe: por qué MDN titula sus páginas `Array.prototype.map()`, por qué unos métodos se llaman sobre el valor (`scores.map(…)`) y otros sobre la constructora (`Array.from(…)`, `Object.keys(…)`), cómo funciona `'a'.toUpperCase()` si los strings no son objetos, y por qué «no modifiques los prototipos nativos» es una de las reglas más famosas de JavaScript.

## Dónde viven los métodos

Un array solo tiene como propiedades **propias** sus posiciones y `length`. Todo lo demás lo encuentra la búsqueda en su prototipo:

```text
scores { 0: 7, 1: 9.5, 2: 10, length: 3 }
   └──► Array.prototype { map, filter, push, at, toSorted, … }     ← todos los arrays
          └──► Object.prototype { toString, hasOwnProperty, … }   ← todos los objetos
                 └──► null
```

El ejemplo lo comprueba y toma prestado `map` con `call`:

[[exercise:01-donde-viven-los-metodos.md-]]

`scores.map === Array.prototype.map` es `true`: hay **una** función `map` para todos los arrays de la página, y la regla del método le da como `this` el array de la izquierda. Es el mismo reparto que hiciste con `Product.prototype`: datos propios, métodos compartidos. Y los métodos nativos son **no enumerables**, por eso un `for…in` sobre un array no recorre `map` ni `push`. Ejecuta el ejemplo y expande el `[[Prototype]]` del array en la consola para verlos todos.

> **Desde Python:** `scores.append(4)` es azúcar para `list.append(scores, 4)`: el método vive en la clase `list`. En JavaScript, `scores.push(4)` equivale a `Array.prototype.push.call(scores, 4)`.

## El mapa de los prototipos nativos

Cada tipo nativo tiene su constructora y su prototipo, y casi todas las cadenas terminan en `Object.prototype`:

```text
                                     Object.prototype ──► null
        ┌───────────────┬───────────────┬──────┴─────────┬───────────────┬──────────────┐
 Array.prototype  String.prototype  Number.prototype  Function.prototype  Date.prototype  Error.prototype
        ▲               ▲               ▲                  ▲                ▲              ▲
     [1, 2]          'texto'*           42*          cualquier función   new Date()   TypeError.prototype
                                                                                          ▲
                                                                                  new TypeError('…')
 * a través de un envoltorio temporal (más abajo)
```

El ejemplo imprime la cadena de un valor de cada tipo, incluido un elemento de la página:

[[exercise:02-mapa-de-prototipos-nativos.md-]]

```text
[1, 2]          → Array.prototype → Object.prototype → null
'texto'         → String.prototype → Object.prototype → null
() => {}        → Function.prototype → Object.prototype → null
new TypeError() → TypeError.prototype → Error.prototype → Object.prototype → null
<p>             → HTMLParagraphElement.prototype → HTMLElement.prototype → Element.prototype → Node.prototype → EventTarget.prototype → Object.prototype → null
```

La última línea es un adelanto del capítulo 6: los elementos de la página son objetos con una cadena larga, y cada eslabón aporta su parte (los métodos de cualquier nodo, los de los elementos, los de los elementos HTML, los de los párrafos). Cuando estudies el DOM, esa cadena te dirá dónde buscar cada método en MDN.

El ejemplo termina con una curiosidad que confunde a mucha gente: `Object` y `Function` son **funciones**, así que su `[[Prototype]]` es `Function.prototype`; y `Function.prototype`, como todo objeto, hereda de `Object.prototype`. Por eso `Object instanceof Function` y `Function instanceof Object` son los dos `true`. No es un ciclo en la cadena (ninguna cadena vuelve sobre sí misma), sino dos cadenas que se cruzan.

> **Desde Python:** compara con `type(42).__mro__`, que es `(int, object)`, o con `TypeError.__mro__`, que es `(TypeError, Exception, BaseException, object)`. En Python también hay un cruce parecido: `type` es una instancia de sí mismo y `object` es una instancia de `type`.

## Métodos de prototipo y métodos estáticos

Hay dos sitios donde un tipo nativo guarda funciones, y la diferencia se nota en cómo se llaman:

| | Dónde vive | Cómo se llama | Ejemplos |
|---|---|---|---|
| Método de prototipo | `Array.prototype` | sobre un valor | `scores.map(fn)`, `title.toUpperCase()` |
| Método estático | la constructora, `Array` | sobre la constructora | `Array.from(x)`, `Array.isArray(x)`, `Object.keys(obj)` |

Los estáticos sirven para lo que todavía no es un valor del tipo (`Array.from('café')`) o para preguntar por un valor cualquiera (`Array.isArray`). Y hay una razón de diseño para que `Object.keys(obj)` no sea `obj.keys()`: si estuviera en `Object.prototype`, cualquier objeto con un dato llamado `keys` lo taparía, y los objetos sin prototipo no lo tendrían. Una función estática no depende de la cadena del objeto, así que funciona siempre:

[[exercise:03-metodos-estaticos-y-de-prototipo.md-]]

> **Desde Python:** los métodos de prototipo son métodos normales (`lst.append`); los estáticos son como `@staticmethod` o `@classmethod` (`dict.fromkeys(…)`, `int.from_bytes(…)`).

## Métodos genéricos: tomarlos prestados

Muchos métodos de `Array.prototype` no comprueban que `this` sea un array: les basta con que tenga `length` y posiciones `0`, `1`, `2`… Se llaman **genéricos**, y con `call` se pueden usar sobre cualquier objeto parecido a un array (*array-like*), como `arguments` o un string:

[[exercise:04-tomar-prestados-metodos.md-]]

En código antiguo verás mucho `Array.prototype.slice.call(arguments)`. Hoy lo habitual es convertir primero con `Array.from` (o con el spread, si el valor es iterable) y usar los métodos con normalidad. Pero el préstamo sigue siendo útil, y el más famoso de todos es el siguiente.

## Lo que heredan todos los objetos

`Object.prototype` es el final de casi todas las cadenas, así que sus propiedades las tiene cualquier objeto: `toString`, `valueOf`, `hasOwnProperty`, `isPrototypeOf`, `propertyIsEnumerable`, `toLocaleString`, `constructor` y el getter/setter `__proto__` (más cuatro métodos antiguos con guiones bajos que no deberías usar).

De todos, `toString` es el que más se nota: es lo que usa JavaScript cuando necesita convertir un objeto en texto, en una plantilla, en `String(obj)` o al concatenar con `+`. El heredado devuelve el famoso `'[object Object]'`, pero un `toString` en tu prototipo lo **sombrea**, como cualquier propiedad:

[[exercise:05-object-prototype-y-tostring.md-]]

El `toString` original, prestado con `call`, tiene un segundo uso: devuelve una etiqueta de tipo mucho más precisa que `typeof`, que distingue arrays, `null`, fechas, expresiones regulares y mapas. Para tus propios tipos, esa etiqueta se elige con `Symbol.toStringTag`, y la conversión a número o a texto se controla con `valueOf` y `Symbol.toPrimitive`; los verás en el módulo «Clases y POO».

> **Desde Python:** `Money.prototype.toString` es el `__str__` de la clase, y `Object.prototype` es `object`, el tipo del que todo hereda `__str__`, `__repr__` o `__eq__`.

## Primitivos «envueltos»

Los primitivos (strings, números, booleanos, `bigint`, `symbol`) **no son objetos**: no tienen propiedades ni `[[Prototype]]`. Y sin embargo `'oaxaca'.toUpperCase()` funciona. Al leer una propiedad de un primitivo, el motor lo trata un instante como un objeto **envoltorio** (*wrapper*) de su tipo, un `String` en este caso, busca la propiedad en `String.prototype` y llama al método con el string como `this`. Después, el envoltorio desaparece (en la práctica, los motores lo optimizan para no llegar a crearlo).

| Primitivo | Envoltorio | Los métodos están en |
|-----------|------------|----------------------|
| `'texto'` | `String` | `String.prototype` (`toUpperCase`, `slice`, `at`…) |
| `42` | `Number` | `Number.prototype` (`toFixed`, `toLocaleString`…) |
| `true` | `Boolean` | `Boolean.prototype` (`toString`, `valueOf`) |
| `10n` | `BigInt` | `BigInt.prototype` |
| `Symbol('id')` | `Symbol` | `Symbol.prototype` |
| `null`, `undefined` | ninguno | ninguno: leer una propiedad lanza `TypeError` |

El ejemplo sigue a un string, un número y un booleano, y prueba a guardar una propiedad en un primitivo:

[[exercise:06-primitivos-envueltos.md-]]

La consecuencia más curiosa: asignar una propiedad a un primitivo no hace nada. Se asigna al envoltorio temporal, que se tira en el acto (y en modo estricto, lanza `TypeError: Cannot create property … on string …`). Un primitivo no puede guardar datos extra; si los necesitas, usa un objeto.

> **Desde Python:** en Python, `5` **es** un objeto de la clase `int` y `(5).bit_length()` no envuelve nada. En JavaScript, los primitivos solo se «disfrazan» de objeto el tiempo justo de llamar al método.

### Los envoltorios como objetos

Las constructoras `String`, `Number` y `Boolean` también se pueden llamar con `new`, y entonces crean un envoltorio **permanente**: un objeto, no un primitivo. Es una fuente de errores sin ninguna ventaja: `typeof` da `'object'`, `===` con el primitivo da `false`, dos envoltorios iguales son distintos, y `new Boolean(false)` es verdadero en un `if`, porque todo objeto es *truthy*:

[[exercise:07-objetos-envoltorio.md-]]

Llamadas **sin** `new`, las mismas funciones convierten y devuelven un primitivo: `String(42)`, `Number('42.5')`, `Boolean('')`. Esa es la única forma en que deberías usarlas.

## Extender los prototipos nativos

Como `Array.prototype` es un objeto normal, nada impide añadirle métodos: `Array.prototype.last = function () {…}` y todos los arrays de la página tendrán `last()`. Es tentador, y es uno de los errores más conocidos del lenguaje, por tres motivos:

1. Lo que añades con una asignación es **enumerable**, así que aparece en todos los `for…in` de la página (y si lo añades a `Object.prototype`, en los de **todos** los objetos).
2. Dos librerías pueden añadir el mismo nombre con comportamientos distintos: gana la última en cargarse, y el código que dependía de la otra falla en silencio.
3. El estándar puede añadir mañana un método con ese nombre y otro comportamiento.

El ejemplo provoca los dos primeros (en los arrays, en todos los objetos y entre dos «librerías») y después deshace los cambios:

[[exercise:08-extender-prototipos-nativos.md-]]

El tercer motivo ha pasado de verdad. Hace años, librerías muy usadas como MooTools añadían sus propios métodos a los prototipos nativos. Cuando el estándar quiso incorporar `Array.prototype.contains`, y después `Array.prototype.flatten`, se descubrió que romperían miles de webs que usaban las versiones de MooTools, y hubo que llamarlos `includes` y `flat`. El episodio de `flatten` se conoce como *SmooshGate*. La regla que se sacó: **no modifiques objetos que no son tuyos**.

Las alternativas son sencillas: funciones normales que reciben el valor (`last(steps)`), tus propios tipos que heredan de los nativos (`class Steps extends Array`, en el módulo «Clases y POO») o claves `symbol`, que no pueden chocar con nada (módulo «Iteradores, generadores y metaprogramación»).

> **Desde Python:** Python no te deja: `list.last = …` lanza `TypeError: cannot set 'last' attribute of immutable type 'list'`. JavaScript sí, así que la regla es de disciplina.

## Polyfills: la excepción

Hay un caso en que sí se toca un prototipo nativo: un ***polyfill***, el código que añade a un navegador antiguo un método **estándar** que todavía no tiene, para que el código moderno funcione en todas partes. Un polyfill bien hecho toma dos precauciones: comprueba primero si el método ya existe (y si existe, no lo toca) y lo instala con `Object.defineProperty`, con los mismos atributos que los métodos nativos (`enumerable: false`):

[[exercise:09-polyfill-con-guarda.md-]]

En la práctica no se escriben a mano: herramientas como `core-js` añaden solo los que faltan según los navegadores que quieras soportar. Lo importante es reconocer el patrón cuando lo veas, y saber que es seguro precisamente porque implementa un estándar que ya existe, no un nombre inventado.

## De Python a JavaScript

| Python | JavaScript |
|--------|------------|
| `list.append(lst, 4)` | `Array.prototype.push.call(arr, 4)` |
| `type(42).__mro__` → `(int, object)` | `Number.prototype` → `Object.prototype` → `null` |
| `dict.fromkeys(…)`, `@staticmethod` | `Array.from(…)`, `Object.keys(…)`: métodos estáticos |
| `str.upper('a')` | `String.prototype.toUpperCase.call('a')` |
| `(5).bit_length()`: 5 es un objeto | `(5).toFixed(2)`: envoltorio temporal |
| `str(obj)` llama a `__str__` | `String(obj)` llama a `toString` |
| `list.last = …` → `TypeError` | `Array.prototype.last = …` → permitido (no lo hagas) |

## Lo que viene

Con esta lección tienes el mecanismo completo: propiedades con atributos, cadenas de prototipos, constructoras con `new`, herencia entre prototipos y los prototipos nativos. El módulo siguiente, «Clases y POO», presenta la sintaxis `class`, que es una forma más cómoda y más segura de escribir exactamente esto: una función constructora, un objeto `prototype` con los métodos y, con `extends`, un prototipo enlazado con otro. Cuando veas `class Book extends MediaItem`, sabrás qué objetos y enlaces hay detrás.

## Bestiario

- **El método «útil» que aparece en todos los bucles.**
  Síntoma: `for…in` sobre arrays u objetos lista una clave como `last` o `isEmpty` que nadie puso en ellos; o un método de una librería cambia de comportamiento al cargar otra.
  Causa: alguien añadió métodos a `Array.prototype`, `Object.prototype` o `String.prototype` con una asignación.
  Solución: no extiendas prototipos nativos; usa funciones normales o tus propios tipos. Solo los polyfills de métodos estándar, con detección y `defineProperty` no enumerable.
  → [ver ejemplo](08-extender-prototipos-nativos.md)
- **El `false` que entra en el `if`.**
  Síntoma: `if (flag)` entra aunque `flag` «sea» `false`; `===` con un string igual da `false`; `typeof` da `'object'`.
  Causa: el valor es un envoltorio creado con `new Boolean`, `new String` o `new Number`, que es un objeto.
  Solución: no uses `new` con esas funciones; para convertir, `Boolean(x)`, `String(x)`, `Number(x)`, y para desenvolver, `valueOf()`.
  → [ver ejemplo](07-objetos-envoltorio.md)

## Resumen

- Los tipos nativos usan el mismo mecanismo que tus constructoras: `Array.prototype`, `String.prototype`, `Function.prototype`… guardan los métodos.
- Casi todas las cadenas terminan en `Object.prototype`, de donde salen `toString`, `hasOwnProperty` y compañía.
- Los métodos de prototipo se llaman sobre un valor; los estáticos (`Array.from`, `Object.keys`), sobre la constructora.
- Muchos métodos nativos son genéricos y se pueden tomar prestados con `call`.
- Un `toString` en tu prototipo controla cómo se convierte a texto; `Object.prototype.toString.call(x)` da una etiqueta de tipo precisa.
- Los primitivos se envuelven un instante para usar los métodos de su prototipo; no guardan propiedades. Nunca uses `new String/Number/Boolean`.
- No extiendas los prototipos nativos; la excepción son los polyfills de métodos estándar, con detección y no enumerables.

## Para profundizar

- [javascript.info: prototipos nativos](https://es.javascript.info/native-prototypes)
- [MDN: Object.prototype.toString](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
- [MDN: primitivo (glosario)](https://developer.mozilla.org/es/docs/Glossary/Primitive)
- [MDN: polyfill (glosario)](https://developer.mozilla.org/es/docs/Glossary/Polyfill)
- [Chrome for Developers: SmooshGate FAQ (en inglés)](https://developer.chrome.com/blog/smooshgate)
