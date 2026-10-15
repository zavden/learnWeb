# Clases en TypeScript

## Por qué importa

En el módulo «Clases y POO» del capítulo 5 escribiste clases de JavaScript: campos, privados con `#`, getters y setters, `static`, herencia con `extends` y `super`, y hasta clases «abstractas» imitadas con `new.target`. Todo eso sigue valiendo en TypeScript, que añade encima una capa de comprobaciones: campos con tipo, modificadores de visibilidad (`private`, `protected`), `readonly`, `abstract`, `implements` y `override`.

Esa capa tiene una trampa que esta lección repite una y otra vez: casi todo lo que añade TypeScript a las clases **se borra** al compilar, igual que los tipos. `private` no esconde nada en ejecución, `readonly` no impide nada y una clase `abstract` se puede instanciar. Solo una pieza genera código de verdad, las *parameter properties*. Saber qué protege al escribir y qué protege al ejecutar es la diferencia entre una clase segura y una que solo lo parece. Los bloques de código de esta lección tienen la pestaña `compiled.js`: úsala en cada ejemplo.

## Declarar los campos

En JavaScript, el constructor puede crear cualquier propiedad con `this.algo = valor`. TypeScript necesita conocer la forma de los objetos de una clase **antes** de ejecutar nada, así que cada propiedad se **declara** en el cuerpo de la clase, con su tipo. Es la misma sintaxis de los campos del capítulo 5 (`songs = []`), con una anotación, y el valor inicial pasa a ser opcional:

```ts
class Reservation {
  guest: string;          // sin valor: lo asigna el constructor
  extras: string[] = [];  // con valor inicial
  notes?: string;         // opcional: string | undefined
}
```

Sin la declaración, `this.guest = guest` en el constructor es un error (`TS2339: Property 'guest' does not exist on type 'Reservation'.`). La ventaja es que una errata como `this.nigths = 4` deja de crear en silencio una propiedad nueva:

[[exercise:01-campos-declarados.md-]]

```text
Lucía Méndez: 3 noches + desayuno (llegada tarde)
propias → (4) ['guest', 'nights', 'extras', 'notes']
notes → undefined
```

Mira `compiled.js`: las declaraciones se convierten en campos de JavaScript (`guest;`, `notes;`), así que el objeto tiene la propiedad `notes` aunque valga `undefined`, igual que el `durationSeconds;` del capítulo 5. Es el comportamiento de la opción `useDefineForClassFields`, activa por defecto cuando el JavaScript generado es ES2022 o posterior, como en LearnWeb. Con configuraciones antiguas, una declaración sin valor no generaba nada; lo verás de nuevo más abajo, en el orden de inicialización.

> **Desde Python:** las anotaciones en el cuerpo de la clase (`guest: str`) son lo que lee una *dataclass* para generar su `__init__`. En TypeScript no se genera ningún constructor a partir de los campos: el constructor lo escribes tú (o usas las *parameter properties*, más abajo).

### Campos sin valor: `strictPropertyInitialization`

Si declaras `guest: string`, TypeScript se lo cree en todo el programa. Por eso, con `strict`, comprueba que el constructor le dé valor en **todos** los caminos; si no, sale `TS2564`. Es la opción `strictPropertyInitialization` que la tabla de `strict` de la lección 1 del módulo 1 dejaba para este módulo. Hay una forma de callarlo, el `!` de **asignación definitiva** (`room!: Room`), que es una aserción como la de la lección 5 del módulo 1: no asigna nada y no comprueba nada.

[[exercise:02-campo-sin-inicializar.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 4: TS2564: Property 'guest' has no initializer and is not definitely assigned in the constructor.
// Consola:
guest → undefined
🐛 TypeError: Cannot read properties of undefined (reading 'number')
✅ Lucía Méndez · sin habitación asignada
✅ Lucía Méndez · hab. 204, piso 2
```

`room!` no tiene error rojo y es el que revienta, en `badge()`, lejos de la causa (nadie llamó a `assignRoom`). Las soluciones honradas son tres: darle valor en el constructor, darle un valor inicial, o decir en el tipo que puede faltar (`room: Room | null = null`, o `notes?: string`) y comprobarlo antes de usarlo. El `!` solo tiene sentido cuando algo que TypeScript no ve asigna el campo, como un *framework* que lo rellena antes de llamar a tu código, y aun así es una promesa sin comprobar.

## `private` y `protected` frente a `#`

TypeScript tiene tres modificadores de visibilidad, que se escriben delante de un campo o un método:

| Modificador | Desde dónde se puede usar | En ejecución |
|---|---|---|
| `public` (por defecto) | desde cualquier sitio | propiedad normal |
| `protected` | dentro de la clase y de sus subclases | propiedad normal |
| `private` | solo dentro de la clase | propiedad normal |
| `#campo` (JavaScript) | solo dentro de la clase | **inaccesible** desde fuera |

La última columna es la importante. `private` es una comprobación del verificador (`TS2341`), y después se borra: el campo es una propiedad más del objeto, visible para todo el código que no pase por el verificador.

[[exercise:03-private-frente-a-almohadilla.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 23: TS2341: Property 'pin' is private and only accessible within class 'GiftCard'.
// Consola:
⛔ PIN incorrecto
✅ cobrados $120, quedan $380
pin → 4821
🐛 JSON → {"code":"REGALO-2026","pin":"4821"}
🐛 claves → (2) ['code', 'pin']
🐛 as any → 4821
🐛 corchetes → 4821
✅ as any → undefined | ¿saldo (380) en el JSON? → false
```

El PIN «privado» sale en el JSON que mandarías al servidor, en `Object.keys`, en la consola y en cualquier `as any`. Hasta TypeScript deja leerlo con corchetes (`card['pin']`), una vía de escape intencionada. El saldo, con `#`, no aparece en ningún sitio: es el privado de verdad que viste en la lección «Encapsulación» del capítulo 5. Escribir `card.#balance` fuera de la clase ni siquiera llega a ejecutarse, porque es un `SyntaxError` de JavaScript; TypeScript lo marca con `TS18013: Property '#balance' is not accessible outside class 'GiftCard' because it has a private identifier.`

¿Cuál usar? Para datos que de verdad no deben salir del objeto (un PIN, un *token*, un estado interno que otros podrían romper), `#`. `private` sigue apareciendo mucho en código TypeScript, sobre todo en el escrito antes de que JavaScript tuviera `#`, y es cómodo para indicar «esto no es parte de la API», pero no es una protección. `protected` no tiene equivalente con `#`: un `#campo` no es accesible desde las subclases, como viste en «Herencia con extends».

> **Desde Python:** `private` se parece a la convención `_pin`: un aviso que respetan las herramientas (mypy, el editor) y que cualquiera puede saltarse. `__pin` (con *name mangling*) tampoco es privado de verdad. El `#` de JavaScript no tiene equivalente en Python.

## `readonly`

`readonly` delante de un campo impide asignarlo fuera del constructor (`TS2540`). Es la misma palabra que en los tipos de objeto del módulo 1, y se borra igual. Si necesitas que el valor no cambie **en ejecución**, hay dos herramientas de JavaScript: un getter sin setter (capítulo 5) y `Object.freeze`, que en modo estricto lanzan un `TypeError` al asignar:

[[exercise:04-readonly-frente-a-freeze.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 23: TS2540: Cannot assign to 'price' because it is a read-only property.
línea 27: TS2540: Cannot assign to 'label' because it is a read-only property.
línea 34: TS2540: Cannot assign to 'price' because it is a read-only property.
// Consola:
🐛 readonly → MUNAL · $0
✅ getter → TypeError: Cannot set property label of #<Ticket> which has only a getter
✅ freeze → TypeError: Cannot assign to read only property 'price' of object '#<FrozenTicket>'
precio → 85
```

| | ¿Lo comprueba TypeScript? | ¿Y en ejecución? |
|---|---|---|
| `readonly price` | sí, `TS2540` | no: la asignación funciona |
| `get label()` sin `set` | sí, `TS2540` | `TypeError` en modo estricto |
| `Object.freeze(this)` | solo si el campo es `readonly` | `TypeError` en modo estricto |

Recuerda que el JavaScript generado empieza con `"use strict";` (lección 1 del módulo 1): sin modo estricto, las dos últimas filas fallarían en silencio. En la práctica, `readonly` basta en código que siempre pasa por el verificador; los datos que se comparten con código que no controlas (una biblioteca, la consola, otro script) merecen la protección en ejecución.

> **Desde Python:** un `@property` sin *setter* es el getter de la segunda fila (Python lanza `AttributeError`), y `@dataclass(frozen=True)` es lo más parecido a congelar el objeto.

## *Parameter properties*

Muchas clases empiezan igual: declarar un campo, recibir un parámetro con el mismo nombre y asignarlo. TypeScript tiene un atajo: un modificador (`public`, `private`, `protected` o `readonly`) delante de un parámetro del constructor lo convierte a la vez en campo y en asignación. Se llaman *parameter properties*:

```ts
class Song {
  constructor(readonly id: number, public title: string, private plays = 0) {}
}
```

[[exercise:05-propiedades-de-parametro.md-]]

```text
▶ Cucurrucucú paloma (Lola Beltrán) · 1 reproducciones
▶ Cucurrucucú paloma (Lola Beltrán) · 2 reproducciones
larga → (3) ['id', 'title', 'plays']
corta → (3) ['id', 'title', 'plays']
JSON → {"id":7,"title":"Cucurrucucú paloma (Lola Beltrán)","plays":2}
```

Es la excepción que anunciaba la lección 1 del módulo 1: en `compiled.js` aparecen los campos (`id; title; plays;`) y las asignaciones (`this.id = id;`) que TypeScript escribe por ti. Por eso las *parameter properties* son, con los `enum`, lo que no admiten las herramientas que ejecutan TypeScript quitando los tipos sin transformar nada (Node.js con sus archivos `.ts`, o la opción `erasableSyntaxOnly` de la lección 5 del módulo 1). Un parámetro **sin** modificador sigue siendo un parámetro normal (`artist` no es un campo), y un `#privado` no se puede declarar así: se declara en el cuerpo.

> **Desde Python:** es lo que hace una *dataclass*: `@dataclass class Song: id: int; title: str; plays: int = 0` genera el `__init__` con sus asignaciones. La diferencia es que en TypeScript el constructor sigue siendo tuyo y puede tener más código.

### El orden de inicialización

El atajo esconde un detalle de orden. En el capítulo 5 viste que los campos se crean **antes** de ejecutar el cuerpo del constructor. Las asignaciones que generan las *parameter properties* van **dentro** del constructor, así que un campo con valor inicial que lea uno de esos parámetros llega antes que ellos:

[[exercise:06-inicializador-antes-del-constructor.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 2: TS2729: Property 'nights' is used before its initialization.
línea 2: TS2729: Property 'nightlyRate' is used before its initialization.
// Consola:
🐛 total → NaN | nights → 3
✅ constructor → 4350
✅ getter → 5800
```

`compiled.js` lo enseña tal cual: `total = this.nights * this.nightlyRate;` está entre los campos, y `this.nights = nights;` dentro del constructor, que se ejecuta después. Este código funcionaba con la configuración antigua (`useDefineForClassFields: false`), que movía todo al constructor y asignaba primero los parámetros, y por eso se encuentra en proyectos viejos; con los campos estándar de ES2022, TypeScript lo marca con `TS2729`. Las soluciones: calcular el valor en el cuerpo del constructor, o un getter si debe seguir al día.

La misma regla tiene otra consecuencia. Si una subclase vuelve a declarar un campo del padre solo para afinar su tipo (`sound!: 'guau'`), esa declaración crea un campo `sound;` que pisa con `undefined` el valor que había puesto el constructor del padre. TypeScript lo avisa con `TS2612` («Property 'sound' will overwrite the base property in 'Animal'…») y propone escribir `declare sound: 'guau';`, que cambia el tipo sin generar ningún campo.

## Clases abstractas

En «Herencia con extends» imitaste una clase abstracta con `new.target` y un método que lanzaba «debe implementar…». TypeScript tiene la palabra `abstract`: una clase `abstract` no se puede instanciar (`TS2511`), y un método `abstract` no tiene cuerpo y **obliga** a cada subclase a escribirlo (`TS2515`), con el error en la declaración de la subclase, no al usarla:

[[exercise:07-clases-abstractas.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 29: TS2515: Non-abstract class 'JsonExporter' does not implement inherited abstract member line from class 'Exporter'.
línea 35: TS2511: Cannot create an instance of an abstract class.
// Consola:
city;units
Puebla;120
Mérida;85
🐛 ¿se creó? → true
🐛 TypeError: this.header is not a function
🐛 TypeError: this.line is not a function
```

Es el patrón plantilla del capítulo 5 sin escribir ninguna comprobación a mano. Pero `abstract` también se borra: en `compiled.js`, `Exporter` es una clase normal y los métodos abstractos no existen, así que `new Exporter()` funciona y el fallo aparece al llamar al paso que falta. Con los errores de tipos corregidos no hay forma de llegar a eso, que es lo que importa; si la clase base se publica para código JavaScript que no pasa por el verificador, la comprobación con `new.target` del capítulo 5 sigue teniendo sentido.

> **Desde Python:** es `abc.ABC` con `@abstractmethod`. La diferencia es el momento: Python impide crear la instancia **en ejecución** (`TypeError: Can't instantiate abstract class…`), y TypeScript lo impide **al verificar**, sin dejar rastro en ejecución.

## Herencia: `protected` y `override`

`protected` es el término medio que el capítulo 5 echaba de menos: un campo o método que las subclases pueden usar y el código de fuera no (`TS2445`). Como `private`, se borra.

`override` delante de un método dice «este método sustituye a uno del padre». TypeScript comprueba que ese método exista en la clase base: si escribes mal el nombre, avisa con `TS4113`. Sin `override`, la errata crearía un método **nuevo** que nadie llama, y la clase seguiría usando el del padre sin ningún error:

[[exercise:08-override-y-protected.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 18: TS4113: This member cannot have an 'override' modifier because it is not declared in the base class 'Notifier'.
línea 35: TS2445: Property 'sent' is protected and only accessible within class 'Notifier' and its subclasses.
// Consola:
🐛 📨 #1 a 55 1234 5678: Tu pedido P-1042 salió del almacén de Guadalajara
✅ 📨 #1 a 55 1234 5678: Tu pedido P-1042 salió …
enviados → 1
```

`override` es opcional en LearnWeb, y eso deja un hueco: si olvidas escribirlo, no hay comprobación. La opción `noImplicitOverride` lo cierra haciéndolo obligatorio en todo método que sustituya a otro; en un proyecto con esa opción, un método sin `override` que tape a uno del padre da `TS4114: This member must have an 'override' modifier because it overrides a member in the base class 'Notifier'.` Es una de las primeras opciones que se añaden a `strict` en proyectos con mucha herencia.

## `implements`

`class CardPayment implements PaymentMethod` pide a TypeScript que compruebe que la clase encaja con una interfaz: si le falta algo, `TS2420`. Lo que **no** hace es dar tipos a la clase. Los parámetros de sus métodos siguen necesitando anotación, y uno sin anotar es un `any` implícito (`TS7006`), aunque la interfaz diga claramente que es un `number`:

[[exercise:09-implements-no-tipa.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 10: TS7006: Parameter 'amount' implicitly has an 'any' type.
línea 20: TS2420: Class 'CashPayment' incorrectly implements interface 'PaymentMethod'.
  Property 'accepts' is missing in type 'CashPayment' but required in type 'PaymentMethod'.
// Consola:
✅ total de 500 → 517.5
🐛 total de «500» → 50017.5 | string
Tarjeta → $1242.00
efectivo → 1200
```

Esto sorprende porque en otros sitios TypeScript sí deduce los tipos por el contexto: en un *callback* como `items.map((item) => …)`, `item` recibe su tipo del array (tipado contextual, lección 6 del módulo 1). `implements` no funciona así; es solo una comprobación. Fíjate también en que quien usa la clase **a través de la interfaz** (`const method: PaymentMethod = card`) sí está protegido: `method.total('500')` sería un error.

¿Hace falta `implements`? No para que funcione: con el tipado estructural del módulo 1, cualquier objeto con la forma correcta encaja en `PaymentMethod`, lo diga o no. `implements` sirve para que el error aparezca en la clase, al escribirla, y no lejos, donde alguien la usa.

> **Desde Python:** `implements` está a medio camino entre un `typing.Protocol` (estructural: encaja quien tenga la forma, como en TypeScript) y heredar de un `ABC` (nominal: hay que declararlo). Como con un `Protocol`, declararlo es opcional y solo sirve al verificador.

## El tipo `this` y los miembros `static`

Un método que devuelve el propio objeto permite encadenar llamadas (`.where(…).limit(5)`), como hacías en el capítulo 5. Si lo anotas como `: this`, TypeScript entiende «el tipo del objeto sobre el que se llamó», que en una subclase es la subclase. Así, un método heredado no le hace perder a la cadena los métodos propios de la hija:

[[exercise:10-this-como-tipo.md-]]

```text
/api/demo/echo?category=caf%C3%A9&limit=5&stock=available
¿ProductSearch? → true | URLs creadas → 1
```

`limit` está escrito en `SearchUrl` y devuelve `this`, así que, llamado sobre un `ProductSearch`, devuelve un `ProductSearch` y `.inStock()` sigue disponible. Los miembros `static` funcionan como en el capítulo 5 (`static forCategory`, un *getter* estático, un `static #created` privado), con sus tipos. Un detalle: los `static` no pueden usar el parámetro de tipo de una clase genérica (`T`), porque pertenecen a la clase y no a cada instancia.

Los getters y setters también son los del capítulo 5, con tipo: `get total(): number`. Existe además una palabra nueva, `accessor`, que crea a la vez un campo privado y su pareja `get`/`set`. Es parte de la propuesta de decoradores, así que TypeScript la traduce para Chrome:

```ts
class Counter {
  accessor count = 0;
}
// compiled.js → #count_accessor_storage = 0;
//               get count() { return this.#count_accessor_storage; }
//               set count(value) { this.#count_accessor_storage = value; }
```

### Clases genéricas

Las clases admiten parámetros de tipo como las funciones: `Repository<T extends { id: number }>`, de la lección «Genéricos» del módulo 2, es una clase genérica con su restricción, y todo lo de esta lección vale igual para ella (`#items`, `readonly`, *parameter properties*). Cada instancia fija su `T` al crearse.

## ¿Clase, interfaz u objeto?

Con TypeScript tienes tres formas de modelar algo, y no siempre gana la clase:

| Necesitas… | Usa | Por qué |
|---|---|---|
| describir datos (un JSON de la API, un formulario) | `type` / `interface` | se borra; no hay que convertir nada con `new` |
| transformar datos | funciones sobre esos tipos | fáciles de probar y de componer |
| estado que cambia + reglas que lo protegen | `class` con `#privados` | el estado solo cambia a través de sus métodos |
| saber «de qué clase es» en ejecución | `class` | `instanceof` necesita algo que exista en ejecución |
| varias implementaciones intercambiables | `interface` + clases o objetos | el código depende de la forma, no de una clase concreta |

Un ejemplo: un `Product` que llega por `fetch` es un **dato**, y lo natural es un `type` y un validador (módulo 2). Un carrito que valida cantidades, recalcula totales y avisa de cambios es **estado con reglas**, y ahí una clase con `#lines` evita que nadie lo deje en un estado imposible.

> **Desde Python:** el reparto es parecido: `TypedDict` para datos sueltos, `@dataclass` para datos con algo de comportamiento y clases normales para estado con reglas. La diferencia es que en TypeScript un `type` no existe en ejecución, así que no se puede usar con `instanceof`.

## Decoradores

En código TypeScript (Angular, NestJS, Lit) verás `@algo` encima de clases y métodos. Son **decoradores**: funciones que reciben un método o una clase y pueden envolverlo o registrarlo. TypeScript 5 implementa los decoradores estándar de la propuesta de JavaScript, que Chrome todavía no ejecuta de forma nativa, así que TypeScript los traduce a JavaScript normal con unas funciones auxiliares bastante largas. Muchos proyectos antiguos usan otra versión, incompatible, que se activa con `experimentalDecorators`. En este curso no los usarás; basta con saber leerlos.

## Bestiario

- **El campo que nadie inicializa.**
  Síntoma: `TS2564: Property 'guest' has no initializer and is not definitely assigned in the constructor.`; o, con `room!: Room`, un `TypeError: Cannot read properties of undefined` lejos de la clase.
  Causa: con `strictPropertyInitialization`, cada campo debe recibir valor en el constructor; el `!` calla el aviso sin asignar nada.
  Solución: asígnalo en el constructor o dale un valor inicial; si puede faltar, dilo en el tipo (`Room | null`, `notes?`) y compruébalo antes de usarlo.
  → [ver ejemplo](02-campo-sin-inicializar.md)
- **El `private` que se ve en el JSON.**
  Síntoma: un campo `private` aparece en `JSON.stringify`, en `Object.keys`, en la consola y con `(obj as any).pin`.
  Causa: `private` es una comprobación del verificador (`TS2341`) y se borra; en ejecución es una propiedad normal.
  Solución: `#pin` para lo que no debe salir del objeto; `private` solo como aviso de «no es parte de la API».
  → [ver ejemplo](03-private-frente-a-almohadilla.md)
- **El `readonly` que se puede cambiar.**
  Síntoma: `TS2540: Cannot assign to 'price' because it is a read-only property.`, y al ejecutar el precio cambia igual.
  Causa: `readonly` se borra.
  Solución: corrige el error de tipos; si necesitas protección en ejecución, un getter sin setter u `Object.freeze` (con modo estricto, lanzan un `TypeError`).
  → [ver ejemplo](04-readonly-frente-a-freeze.md)
- **Un total que da `NaN` con *parameter properties*.**
  Síntoma: `TS2729: Property 'nights' is used before its initialization.` y un campo calculado que vale `NaN`.
  Causa: los inicializadores de los campos se ejecutan antes que el cuerpo del constructor, donde se asignan las *parameter properties*.
  Solución: calcula el valor en el constructor o con un getter.
  → [ver ejemplo](06-inicializador-antes-del-constructor.md)
- **La clase abstracta que se instancia igual.**
  Síntoma: `TS2511: Cannot create an instance of an abstract class.` o `TS2515` en una subclase incompleta; al ejecutar, `TypeError: this.header is not a function`.
  Causa: `abstract` se borra: en ejecución la clase es normal y los métodos abstractos no existen.
  Solución: corrige los errores (implementa los métodos que faltan); si la clase la usará código sin verificar, añade la comprobación con `new.target` del capítulo 5.
  → [ver ejemplo](07-clases-abstractas.md)
- **El método que no sustituye a nada.**
  Síntoma: `TS4113: This member cannot have an 'override' modifier because it is not declared in the base class 'Notifier'.`; sin `override`, la clase usa en silencio el método del padre.
  Causa: una errata en el nombre crea un método nuevo en vez de sustituir el del padre.
  Solución: escribe `override` en cada método que sustituya a otro (y activa `noImplicitOverride` en tus proyectos para que sea obligatorio).
  → [ver ejemplo](08-override-y-protected.md)
- **`implements` no tipa los parámetros.**
  Síntoma: `TS7006: Parameter 'amount' implicitly has an 'any' type.` en un método de una clase que implementa una interfaz; sin el error, `total('500')` concatena.
  Causa: `implements` solo comprueba que la clase encaje (`TS2420` si falta algo); no da tipos por contexto.
  Solución: anota los parámetros de cada método, aunque la interfaz ya los tenga.
  → [ver ejemplo](09-implements-no-tipa.md)

## Resumen

- Cada propiedad de una clase se declara en su cuerpo con su tipo; con `strict`, el constructor debe darle valor (`TS2564`), y el `!` solo calla el aviso.
- `public`, `private`, `protected`, `readonly`, `abstract`, `implements` y `override` son comprobaciones del verificador y se borran al compilar.
- Para privacidad y solo lectura **en ejecución**: `#campo`, getters sin setter y `Object.freeze`.
- Las *parameter properties* (`constructor(readonly id: number)`) declaran y asignan a la vez; generan código, y sus asignaciones van después de los inicializadores de los campos (`TS2729`).
- `override` detecta erratas en los métodos que sustituyen a los del padre; `noImplicitOverride` lo hace obligatorio.
- `abstract` impide instanciar la base y obliga a las hijas a implementar los métodos; `implements` comprueba la forma, pero no da tipos a los parámetros.
- Un método que devuelve `this` mantiene el tipo de la subclase en las cadenas de llamadas.
- Usa `type` para datos, funciones para transformarlos y clases para estado con reglas.

## Para profundizar

- [Manual de TypeScript: clases (en inglés)](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Referencia de tsconfig: useDefineForClassFields (en inglés)](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields)
- [Referencia de tsconfig: noImplicitOverride (en inglés)](https://www.typescriptlang.org/tsconfig/#noImplicitOverride)
- [Notas de TypeScript 5.0: decoradores estándar (en inglés)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators)
- [MDN: propiedades privadas con # (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
