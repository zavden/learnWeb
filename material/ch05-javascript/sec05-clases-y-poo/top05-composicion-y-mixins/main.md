# Composición y mixins

## Por qué importa

La herencia es la herramienta más visible de la programación orientada a objetos, y por eso se usa de más. Una jerarquía funciona bien mientras cada hija sea de verdad una versión más concreta de su padre. Cuando aparecen capacidades que se combinan libremente (un aviso puede ir por correo o por SMS, con o sin reintentos, con o sin registro), la herencia obliga a crear una clase por combinación, y cuando una hija hereda algo que no le corresponde, la única salida es anularlo con un error.

En JavaScript el problema es más agudo que en Python, porque no hay herencia múltiple: cada objeto tiene **un** prototipo. Esta lección enseña las dos alternativas. La **composición**: un objeto que *tiene* otros objetos y delega en ellos. Y los **mixins**: paquetes de métodos que se añaden a varias clases sin relación, primero copiándolos con `Object.assign` (como al final del módulo anterior) y después con funciones que construyen subclases, la forma que conserva `super`.

## Cuando la herencia no encaja

Dos síntomas avisan de que una jerarquía está mal planteada. El primero: una subclase hereda un método que no tiene sentido para ella y lo sobrescribe para lanzar un error. El código que recorre una lista de documentos confiaba en que todos saben compartirse, y se rompe con el primero que no. La subclase ya no puede **sustituir** a su padre, que es la promesa básica de la herencia. El segundo: las opciones independientes se multiplican. Tres canales y tres opciones que se pueden activar o no son `3 × 2³ = 24` clases:

[[exercise:01-la-jerarquia-que-no-encaja.md-]]

```text
📤 «Factura F-118» compartido con gestoria@example.com
🐛 el bucle se corta → «Claves del banco» es privada: no se puede compartir
🐛 clases necesarias → 24, como LoggingEncryptedRetryingSmsNotifier
```

La regla de diseño que resume los dos casos se repite en casi todos los libros: **prefiere la composición a la herencia**. Hereda cuando la relación es de verdad «es un» y la hija puede hacer todo lo que hace el padre; para lo demás, compón.

## Composición

Componer es dar a un objeto **otros objetos** que hacen parte del trabajo, normalmente a través del constructor, y **delegar** en ellos: `this.channel.send(to, text)`. El `Notifier` del ejemplo *tiene* un canal y unas opciones, y con dos clases de canal y unas cuantas opciones cubre todas las combinaciones del ejemplo anterior. Además, la pieza se puede **cambiar** en tiempo de ejecución, algo imposible con herencia, donde la clase de un objeto se decide al crearlo:

[[exercise:02-composicion.md-]]

```text
📧 ana@example.com: Tu pedido 1042 ya salió
📱 +52 55 1234 5678: Tu pedido 1042 llega hoy entre 16:00 y 18:00
registro → (3) ['intento 1: red móvil no disponible', 'intento 2: red móvil no disponible', 'intento 3: ok']
⛔ no se pudo avisar a +52 33 8765 4321
📧 mateo@example.com: Tu pedido 1043 llega mañana
```

Fíjate en que los canales no heredan de nada: basta con que tengan un método `send` (el *duck typing* de la lección anterior). Las piezas compuestas solo necesitan cumplir un protocolo, no pertenecer a una jerarquía.

> **Desde Python:** es lo mismo que pasar objetos a `__init__` y guardarlos en `self`. Se suele resumir como «tiene un» (composición) frente a «es un» (herencia).

### Envolver en vez de heredar

Un caso concreto de composición aparece al extender tipos nativos. En la lección anterior viste que `extends Array` funciona, pero la subclase hereda **toda** la API de `Array`, también los métodos que rompen sus reglas. Un registro de auditoría en el que solo se puede añadir no puede impedir que alguien llame a `splice`, reescriba `log[0]` o haga `log.length = 0`. Una clase que **envuelve** un array privado decide exactamente qué ofrece, y delega en el array lo demás:

[[exercise:03-envolver-en-vez-de-heredar.md-]]

```text
🐛 heredado → (2) ['1. (reescrito)', '2. cambio de contraseña']
🐛 tras length = 0 → 0 entradas
✅ splice → undefined | tras length = 0 → 3 entradas
✅ for…of → (3) ['1. alta de Lucía Moreno', '2. cambio de contraseña', '3. baja de Pablo Ibáñez']
✅ filter → ['alta de Lucía Moreno']
```

Con `[Symbol.iterator]` (lección «Polimorfismo y protocolos») la clase envoltorio se puede recorrer con `for…of` y el spread, como el array que guarda. Y sus métodos devuelven arrays normales, así que tampoco hay sorpresas con `Symbol.species`.

## Sin herencia múltiple

`class Duck extends Swimmer, Flyer` no compila: `extends` admite **una** expresión. No es una limitación de la sintaxis, sino del modelo: un objeto tiene un único `[[Prototype]]`, así que la cadena es siempre una línea recta. Lo que sí admite `extends` es **cualquier expresión** que dé una clase: un operador ternario, una variable o la llamada a una función que devuelve una clase. Ese último caso abre la puerta a los mixins:

[[exercise:04-sin-herencia-multiple.md-]]

```text
extends A, B → SyntaxError | Unexpected token ','
Colibrí vuela
Pato vuela | Pato nada
cadena → Duck → (anónima) → Flyer
```

> **Desde Python:** `class Duck(Swimmer, Flyer)` es válido, y Python **linealiza** los padres con el algoritmo C3: `Duck.__mro__` es `(Duck, Swimmer, Flyer, object)`, una línea recta. En JavaScript, esa línea la construyes tú, encadenando clases.

## Mixins con `Object.assign`

Un **mixin** es un paquete de métodos pensado para añadirse a clases que no tienen relación entre sí: una receta y un artículo pueden necesitar los dos un `slug()` para su URL, sin compartir ningún padre. La forma más sencilla es un objeto con los métodos, copiado en el **prototipo** de cada clase con `Object.assign(Recipe.prototype, sluggable)`: las instancias los heredan como si estuvieran escritos en la clase.

Los problemas de copiar con `Object.assign` ya los conoces de la integración del módulo anterior: los métodos copiados quedan **enumerables** (al contrario que los de `class`, salen en `for…in`), los getters **se ejecutan** al copiar y se guarda su resultado fijo, y si dos fuentes tienen un método con el mismo nombre, gana la última sin avisar. El helper `mixin` del ejemplo copia **descriptores**, no enumerables, y avisa de los choques:

[[exercise:05-mixin-con-object-assign.md-]]

```text
Recipe «Mole poblano de la abuela» | mole-poblano-de-la-abuela
🐛 for…in → (4) ['title', 'describe', 'slug', 'words']
🐛 words → 0
✅ for…in → ['title']
✅ words → 5 | Article «Guía de cafés de Veracruz» | guia-de-cafes-de-veracruz
```

### `super` en un mixin copiado

Hay un cuarto problema, más sutil, que tiene que ver con `super`. En la lección «Herencia con extends» viste que cada método recuerda el objeto en el que se **escribió**, y que `super` busca a partir del prototipo de ese objeto. Copiar el método a otro sitio no cambia ese objeto. Un método de un mixin que use `super.describe()` buscará en el prototipo **del mixin** (casi siempre `Object.prototype`), no en el padre de la clase a la que lo copiaste:

[[exercise:06-super-en-un-mixin-copiado.md-]]

```text
🐛 super en un mixin copiado → TypeError | (intermediate value).describe is not a function
prototipo de featured → true
✅ subclase mixin → ⭐ Artes de México
```

`(intermediate value).describe is not a function` es la forma en que V8 dice «lo que devolvió `super` no tiene `describe`». La solución es la segunda forma de mixin.

## Mixins como subclases

Un mixin también puede ser una **función que recibe una clase y devuelve una subclase de ella**:

```js
const Taggable = (Base) =>
  class Taggable extends Base {
    tags = new Set();
    tag(...names) { … }
  };

class SmartNote extends Taggable(Timestamped(Note)) {}
```

Cada llamada crea una clase intermedia que hereda de la que recibe, y las llamadas se anidan en el `extends`. El resultado es una cadena de prototipos normal, con un eslabón por mixin, así que todo funciona como en cualquier herencia: los métodos del mixin son no enumerables, puede tener campos y privados, y `super` busca en el eslabón siguiente de la cadena, porque el método está escrito en una clase que de verdad hereda de `Base`:

[[exercise:07-mixins-como-subclases.md-]]

```text
📝 Receta de chiles en nogada #cocina #puebla
updatedAt → 2026-10-12T18:45:00Z
note → SmartNote {title: 'Receta de chiles en nogada', tags: Set(2)}
cadena → SmartNote → Taggable → Timestamped → Note → Object | instanceof Note → true
📷 cholula.jpg #viajes
```

Dale nombre a la clase que devuelve el mixin (`class Taggable extends Base`, no `class extends Base`): ese nombre es el que aparece en la consola y en la cadena. Sin él, cada eslabón sería una clase anónima.

> **Desde Python:** `class SmartNote(Taggable, Timestamped, Note)` tiene el MRO `SmartNote → Taggable → Timestamped → Note → object`. La cadena de JavaScript es la misma; la diferencia es que aquí la escribes tú, del mixin de más fuera al de más dentro.

### El orden importa

Como la cadena es una línea, el orden de los mixins decide qué pasa cuando dos definen el mismo método. Si los métodos **compiten** (cada uno devuelve su resultado sin llamar a `super`), gana el mixin de **más fuera**, el primero en la cadena. Si **cooperan** (cada uno llama a `super.metodo()` y añade lo suyo), se ejecutan todos, de la base hacia fuera:

[[exercise:08-orden-de-los-mixins.md-]]

```text
Contact.validate → (2) ['correo no válido', 'teléfono no válido']
Lead.validate    → (2) ['teléfono no válido', 'correo no válido']
Contact.label → con teléfono | Lead.label → con correo
cadena de Contact → Contact → WithPhone → WithEmail → Model
cadena de Lead    → Lead → WithEmail → WithPhone → Model
```

Para que la cooperación funcione, la clase base tiene que definir el método (aquí, `Model.validate` devuelve una lista vacía): el último `super.validate()` de la cadena necesita a alguien que responda. Es exactamente el patrón de «herencia múltiple cooperativa» de Python, donde cada clase llama a `super().validate()` y el MRO decide el orden.

### `instanceof` con mixins

`obj instanceof Taggable` no funciona con un mixin: `Taggable` es una función flecha, sin `prototype`, e `instanceof` lanza un `TypeError`. Además, cada llamada al mixin crea una clase nueva, así que no hay una única clase con la que comparar. Si necesitas la comprobación, el mixin puede definir un `Symbol.hasInstance` (lección «Polimorfismo y protocolos») que busque una marca. Y aquí reaparece una regla del módulo anterior: no se puede **asignar**, porque toda función hereda de `Function.prototype` un `Symbol.hasInstance` de solo lectura, y una propiedad heredada de solo lectura impide crear la propia con `=`. Hay que usar `defineProperty`:

[[exercise:09-instanceof-con-mixins.md-]]

```text
🐛 instanceof un mixin → TypeError | Function has non-object prototype 'undefined' in instanceof check
🐛 ¿se asignó? → false
✅ instanceof → true false
✅ duck typing → true
```

Muchas veces, la pregunta que de verdad te interesa no es «¿de qué tipo es?», sino «¿sabe hacer esto?»: `typeof obj.archive === 'function'`.

## Qué usar en cada caso

| Necesitas… | Usa… |
|------------|------|
| una versión más concreta de un tipo, que puede sustituirlo en todo | herencia (`extends`) |
| combinar capacidades independientes, o cambiarlas en tiempo de ejecución | composición: objetos que se pasan al constructor |
| limitar o adaptar la API de otro tipo (un nativo, una librería) | composición: envolver y delegar |
| los mismos métodos en varias clases sin relación | mixin como subclase; o copiar descriptores si no usan `super` ni estado |
| que varias piezas aporten cada una su parte a un método | mixins como subclases que cooperan con `super` |

## Bestiario

- **La subclase que no puede hacer lo que su padre promete.**
  Síntoma: una subclase sobrescribe un método heredado para lanzar «no se puede…», y el código que trata a todos los objetos por igual se rompe; o el número de subclases crece con cada opción nueva.
  Causa: se usó herencia para capacidades que no todos los objetos tienen, o que se combinan entre sí.
  Solución: composición: las capacidades son objetos que se pasan y se combinan; lo opcional se comprueba con *duck typing*.
  → [ver ejemplo](01-la-jerarquia-que-no-encaja.md)
- **El `super` que no encuentra al padre.**
  Síntoma: `TypeError: (intermediate value).describe is not a function` en un método copiado con `Object.assign`.
  Causa: un método recuerda el objeto donde se escribió; su `super` busca en el prototipo del mixin, no en el de la clase.
  Solución: mixins como subclases (`(Base) => class extends Base { … }`), donde `super` funciona.
  → [ver ejemplo](06-super-en-un-mixin-copiado.md)
- **El `instanceof` que lanza un error.**
  Síntoma: `TypeError: Function has non-object prototype 'undefined' in instanceof check` con un mixin; y `Mixin[Symbol.hasInstance] = …` no hace nada.
  Causa: el mixin es una flecha sin `prototype`; el `Symbol.hasInstance` heredado de `Function.prototype` es de solo lectura y bloquea la asignación.
  Solución: `Object.defineProperty(Mixin, Symbol.hasInstance, …)` con una marca, o *duck typing*.
  → [ver ejemplo](09-instanceof-con-mixins.md)

## Resumen

- Prefiere la composición a la herencia: hereda solo cuando la hija es de verdad un caso del padre y puede sustituirlo.
- Componer es recibir objetos (normalmente en el constructor) y delegar en ellos; las piezas se combinan y se cambian en tiempo de ejecución.
- Envolver un nativo en una clase con un campo privado da una API a medida, sin los métodos que rompen tus reglas.
- No hay herencia múltiple: un objeto tiene un prototipo; `extends` acepta una sola expresión, pero puede ser una llamada.
- `Object.assign(Clase.prototype, mixin)` copia métodos enumerables, ejecuta getters y rompe `super`; copiar descriptores arregla lo primero.
- Los mixins como subclases (`(Base) => class X extends Base {…}`) forman una cadena normal: `super` funciona, y el orden decide quién gana o en qué orden cooperan.
- `instanceof` no funciona con mixins sin un `Symbol.hasInstance` definido con `defineProperty`; a menudo basta con *duck typing*.

## Para profundizar

- [javascript.info: mixins](https://es.javascript.info/mixins)
- [MDN: mixins con clases (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends#mix-ins)
- [Justin Fagnani: mixins «reales» con clases de JavaScript (en inglés)](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
- [Wikipedia: composición sobre herencia (en inglés)](https://en.wikipedia.org/wiki/Composition_over_inheritance)
