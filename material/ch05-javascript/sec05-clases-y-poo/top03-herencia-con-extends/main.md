# Herencia con extends

## Por qué importa

En la lección «Herencia prototípica» heredaste a mano en cuatro pasos: `Parent.call(this, …)` para los datos, `Object.create(Parent.prototype)` para los métodos, `constructor` restaurado y el método del padre llamado por su nombre con `call`. En la integración de aquel módulo añadiste un quinto, enlazar las constructoras para heredar los estáticos. `class Book extends MediaItem` hace todo eso en una línea, y `super` resuelve el problema que dejaste a medias: llamar a la versión del padre sin nombrarlo y sin caer en una recursión infinita.

Pero `extends` no es solo una abreviatura. En una clase hija, el objeto no lo crea `new` al empezar, sino el constructor de la clase base; de ahí sale el error más típico de la herencia con clases y un orden de inicialización que sorprende. Y `extends` puede hacer algo que las constructoras no podían: heredar de verdad de los tipos nativos, como `Error` y `Array`. Esta lección enseña la sintaxis, los dos enlaces que hay debajo y los errores que aparecen en las jerarquías reales.

## `extends` y `super`

`class Book extends MediaItem` declara que los libros heredan de `MediaItem`. Dentro de la clase hija, `super` tiene dos usos:

- `super(…)` en el constructor ejecuta el constructor del padre (lo que antes era `MediaItem.call(this, …)`).
- `super.metodo(…)` en cualquier método llama a la versión del padre (lo que antes era `MediaItem.prototype.metodo.call(this, …)`).

La jerarquía de la mediateca del módulo anterior queda así:

[[exercise:01-extends-y-super.md-]]

```text
novel → Book {title: 'Cien años de soledad', year: 1967, pages: 471}
📖 Cien años de soledad (1967), 471 págs.
age(2026) → 59
instanceof → true true
constructor → Book
```

Expande `novel` en la consola y recorre la cadena: es exactamente la que montaste a mano. `Book.prototype` tiene su `describe`; dentro, `MediaItem.prototype` tiene el `describe` original y `age`. Un método que la hija no define, como `age`, se busca un eslabón más arriba; uno que sí define, como `describe`, **sobrescribe** (sombrea) al del padre.

> **Desde Python:** `class Book(MediaItem):` se escribe `class Book extends MediaItem`. `super().__init__(title, year)` se escribe `super(title, year)`, y `super().describe()` se escribe `super.describe()`: sin paréntesis tras `super` cuando llamas a un método.

## Lo que hay debajo: dos enlaces

Un tipo tiene dos partes, la constructora y su `prototype`, así que heredar enlaza dos cadenas. `extends` crea las dos:

```text
CreditAccount ──[[Prototype]]──► Account ──► Function.prototype        (estáticos: open)
     │ .prototype                   │ .prototype
     ▼                              ▼
CreditAccount.prototype ──────► Account.prototype ──► Object.prototype  (métodos)
     ▲
card { owner, balanceCents, limitCents }
```

El enlace de abajo, entre los prototipos, es el de la lección «Herencia prototípica»: lo usan las instancias para encontrar los métodos. El de arriba, entre las propias clases, es el que el helper `extend` de la integración del módulo anterior hacía con `Object.setPrototypeOf(Child, Parent)`: gracias a él, la subclase hereda los **métodos estáticos**. Y como dentro de un estático `this` es la clase sobre la que se llama, `CreditAccount.open(…)` ejecuta el `open` de `Account` con `this = CreditAccount`, y `new this(…)` crea una cuenta de crédito:

[[exercise:02-extends-son-dos-enlaces.md-]]

```text
① CreditAccount.prototype → Account.prototype: true
② CreditAccount → Account: true
   y Account → Function.prototype: true
card → CreditAccount {owner: 'Diego Hernández', balanceCents: 0, limitCents: 500000}
¿instanceof CreditAccount? → true
available → 500000
¿'open' es propia de CreditAccount? → false
```

La tabla resume cómo se traduce cada paso del módulo anterior:

| A mano (módulo «Objetos y prototipos») | Con `class` |
|---|---|
| `MediaItem.call(this, title, year)` | `super(title, year)` |
| `Book.prototype = Object.create(MediaItem.prototype)` | `extends MediaItem` (enlace ①) |
| restaurar `Book.prototype.constructor` | automático |
| `Object.setPrototypeOf(Book, MediaItem)` | `extends MediaItem` (enlace ②) |
| `MediaItem.prototype.describe.call(this)` | `super.describe()` |
| guardia contra olvidar `new` | automática |

## `super()` va antes que `this`

En una clase hija, `this` no existe hasta que `super(…)` termina. Usarlo antes (u olvidar `super` del todo) lanza un `ReferenceError` con uno de los mensajes más largos de JavaScript:

[[exercise:03-this-antes-de-super.md-]]

```text
🐛 this antes de super → ReferenceError | Must call super constructor in derived class before accessing 'this' or returning from derived constructor
🐛 sin super → ReferenceError | Must call super constructor in derived class before accessing 'this' or returning from derived constructor
✅ Book → Book {title: 'Rayuela', year: 1963, pages: 600}
✅ Magazine → Magazine {title: 'National Geographic', year: 2026, issue: 1}
```

La razón está en quién crea el objeto. Con las constructoras del módulo anterior, `new Book(…)` creaba el objeto al empezar, y `MediaItem.call(this, …)` solo lo **rellenaba**. Con clases, `new` sobre una clase **derivada** no crea nada: el objeto lo crea el constructor de la clase **base**, al final de la cadena de llamadas `super(…)` (y lo crea ya enlazado con `Book.prototype`, porque `new.target` viaja con cada `super`), y vuelve hacia abajo. Hasta ese momento, `this` no tiene a qué apuntar. Ese diseño es el que permite heredar de `Array` y de `Error`, cuyos objetos tienen que crearse a la manera nativa, como verás al final de la lección.

Antes de `super` sí puedes calcular y validar los argumentos, siempre que no uses `this`. Y si la clase hija no necesita constructor propio, no lo escribas: JavaScript pone uno que pasa todos los argumentos, `constructor(...args) { super(...args); }`.

> **Desde Python:** en `__init__`, `self` ya existe desde la primera línea (lo creó `__new__`), así que puedes asignar atributos antes de `super().__init__()`. En JavaScript, no.

### El orden de inicialización

Con campos en el padre y en la hija, crear un objeto sigue este orden:

```text
new Badge('Nuevo')
  1. constructor de Badge, hasta super(…)
  2. campos de Widget, después el cuerpo del constructor de Widget
  3. campos de Badge (justo cuando super() vuelve)
  4. resto del constructor de Badge
```

El paso 2 esconde una trampa. Si el constructor del padre llama a un método que la hija sobrescribe (`this.render()`), se ejecuta la versión de la **hija** (la búsqueda empieza en el objeto, que ya es un `Badge`), pero los campos de la hija todavía no existen: valen `undefined`, y usarlos lanza un `TypeError`:

[[exercise:06-el-padre-llama-a-un-metodo-sobrescrito.md-]]

```text
1. constructor de Badge, antes de super
2. constructor de Widget
   render de Badge: color = undefined, items = undefined
   🐛 TypeError: Cannot read properties of undefined (reading 'push')
3. campos de Badge
4. constructor de Badge, después de super
después de new → Badge {label: 'Nuevo', items: Array(0), color: 'verde'}
✅ render de SafeBadge: color = verde, items = Nuevo
```

La regla: un constructor solo prepara el estado y no llama a métodos que se puedan sobrescribir. Si el objeto necesita «arrancar» (dibujarse, conectarse, cargar datos), que lo haga quien lo crea después de `new`, o un estático `create` que haga las dos cosas.

## `super.metodo()`

En la lección «Herencia prototípica» viste que los atajos para llamar a la versión del padre fallan: `this.describe()` se llama a sí mismo, y `Object.getPrototypeOf(this).describe` funciona en dos niveles pero entra en recursión en el tercero, porque `this` es siempre el objeto de más abajo. El problema era que hace falta saber **dónde está escrito** el método, no quién lo llama.

`super` resuelve exactamente eso. Cada método de una clase recuerda el objeto en el que se definió (para `Book.describe`, el objeto `Book.prototype`), y `super.describe()` busca a partir del **prototipo de ese objeto**, `MediaItem.prototype`, con el `this` actual. No depende de `this`, así que funciona en cualquier nivel. También funciona en los métodos estáticos, donde busca en la clase padre:

[[exercise:04-super-metodo.md-]]

```text
🎧 Pedro Páramo (1955), 124 págs., narrado por Daniel Giménez Cacho
¿super = padre nombrado? → true | Pedro Páramo (1955), 124 págs.
fromJSON → AudioBook {title: 'Aura', year: 1962, pages: 60, narrator: 'narrador desconocido'} | instanceof AudioBook → true
🎧 Aura (1962), 60 págs., narrado por narrador desconocido
```

Ese «objeto donde se definió» se fija al escribir el método y no cambia aunque copies el método a otro objeto. Lo notarás en la lección «Composición y mixins».

## Sobrescribir métodos

Sobrescribir es definir en la hija un método con el mismo nombre que uno del padre. Lo interesante aparece cuando es el **padre** el que llama a `this.metodo()`: como la búsqueda empieza en el objeto, se ejecuta la versión de la hija. Eso permite escribir el algoritmo una sola vez en la clase base y dejar que cada subclase cambie solo los pasos que le corresponden (el patrón *plantilla*):

[[exercise:05-sobrescribir-metodos.md-]]

```text
── CsvExporter
"city","units"
"Puebla","120"
"Mérida","85"
── MarkdownExporter
| city | units |
| --- | --- |
| Puebla | 120 |
| Mérida | 85 |

_2 columnas_
⛔ Exporter es abstracta: usa una subclase
⛔ JsonExporter debe implementar row()
```

JavaScript no tiene clases ni métodos abstractos. Se imitan con dos piezas: un método en la base que lanza un error explicando que hay que implementarlo, y `new.target` en el constructor. En una clase, `new.target` es la clase con la que se llamó a `new`, es decir, la hija cuando se crea una hija; si es la propia base, se lanza un error.

> **Desde Python:** `ABC` y `@abstractmethod` impiden crear la instancia si falta un método abstracto. En JavaScript el error solo aparece al **llamar** al método que falta. TypeScript (capítulo 7) añade `abstract`, comprobado por el compilador.

## Campos y accesores heredados

En las lecciones anteriores viste que un campo se **define** (como `Object.defineProperty`), no se **asigna**. Con herencia, esa diferencia decide qué pasa con dos cosas que la hija hereda, y en los dos casos el resultado es el contrario de una asignación:

| | `this.x = valor` (en el constructor) | campo `x = valor` |
|---|---|---|
| El padre tiene un `set x` | se ejecuta el setter | crea una propiedad propia que lo **tapa**; el setter no se ejecuta |
| El padre tiene `x` de solo lectura (p. ej., un prototipo congelado) | `TypeError` (el cuerpo de la clase es estricto) | crea la propiedad propia sin problemas |

La segunda fila es la excepción de la asignación de la lección «La cadena de prototipos»: una propiedad heredada de solo lectura impide crear la propia con `=`. En el módulo anterior fallaba en silencio; dentro de una clase lanza un error. Un campo no consulta la cadena, así que no le afecta:

[[exercise:07-campos-frente-a-accesores-del-padre.md-]]

```text
🐛 campo → "  ana.torres@example.com " | changes → 0
✅ asignación → "ana.torres@example.com" | changes → 2
🐛 this.mode = … → TypeError | Cannot assign to read only property 'mode' of object '#<AssignedDarkTheme>'
✅ campo → oscuro | fontSize heredado → 16 | base → claro
```

La regla práctica: para dar un valor inicial a algo que el padre controla con un setter, asígnalo en el constructor, después de `super()`. Para sombrear un valor por defecto de solo lectura, usa un campo.

## Estáticos heredados

El enlace ② hace que los estáticos se hereden por **delegación**, con las mismas reglas que las propiedades de cualquier objeto. Eso produce dos sorpresas. Un contador estático incrementado con `this.count += 1` **lee** el valor heredado del padre y **escribe** uno propio en la subclase (el sombreado de la lección «La cadena de prototipos»). Y un estático **privado** leído con `this.#x` falla cuando `this` es una subclase, porque los privados no se heredan: la subclase no tiene el campo:

[[exercise:08-estaticos-heredados.md-]]

```text
🐛 Vehicle.count → 1 | Bike.count → 3
🐛 ¿Bike tiene count propio? → true
✅ Car.count → 2 | Taxi.count (heredado) → 2
Ticket.next() → 1
🐛 VipTicket.next() → TypeError | Cannot read private member #nextNumber from an object whose class did not declare it
✅ números → 1 2 3
```

En los dos casos, la solución es nombrar la clase que guarda el dato (`Car.count`, `Order.#nextNumber`) en lugar de usar `this`. Usa `this` en un estático solo cuando quieras que cada subclase actúe por su cuenta, como en `new this(…)`.

## Los privados no se heredan de forma accesible

Un objeto de una clase hija **tiene** los campos privados del padre (los métodos del padre siguen funcionando con él), pero el código de la hija no puede nombrarlos: `this.#balance` dentro de la hija es un `SyntaxError`, porque `#balance` no está declarado en el cuerpo de la hija. Si la hija declara su propio `#balance`, es **otro** campo distinto, y el objeto tiene los dos.

```js
class Account {
  #balance = 0;
  deposit(cents) { this.#balance += cents; }
}
class Savings extends Account {
  addInterest() {
    this.#balance *= 1.01; // ❌ SyntaxError: '#balance' must be declared in an enclosing class
  }
}
```

JavaScript no tiene el `protected` de otros lenguajes (TypeScript sí, capítulo 7). Si una subclase necesita un dato, el padre lo expone con un getter o un método, o se usa la convención `_balance` cuando basta con un aviso.

## Heredar de los nativos

Con las funciones constructoras era imposible heredar bien de `Error` o de `Array`: `Error.call(this, msg)` y `Array.call(this)` no rellenan `this`, sino que crean y devuelven **otro** objeto. Con `extends` sí funciona, precisamente porque el objeto lo crea el constructor de la base (`Error`, `Array`) a su manera.

### Errores propios

En la lección «Errores y excepciones» quedó pendiente crear tus propios tipos de error, el equivalente de `class ValidationError(Exception)`. Con `extends Error`, `instanceof` funciona y el objeto tiene `message`, `stack` y `cause`. Pero hay un detalle que se olvida siempre: `name` se hereda de `Error.prototype`, así que vale `'Error'` hasta que lo cambias, y la consola, `String(error)` y la primera línea de `stack` dirían «Error: …»:

[[exercise:09-heredar-de-error.md-]]

```text
🐛 name → Error | String → Error: El correo no es válido
   instanceof → true true
⛔ ValidationError en «email»: El correo es obligatorio
⛔ NetworkError: El servidor respondió algo ilegible | causa: SyntaxError
✅ String → ValidationError: El correo es obligatorio
✅ stack, 1.ª línea → ValidationError: El correo es obligatorio
🐛 OldError: message → "" | stack → undefined
```

La base `AppError` del ejemplo resuelve el nombre para toda la jerarquía con `this.name = new.target.name` y pasa las opciones a `super(message, options)`, para que `{ cause }` (lección «Errores y excepciones») llegue a `Error`. Cada subclase añade los datos que necesite quien atrape el error, como `field`. Así, el `catch` puede distinguir con `instanceof` y relanzar lo que no sabe manejar.

### Arrays propios

`class Steps extends Array` crea arrays de verdad (con `length`, índices y `Array.isArray`) que tienen métodos propios, la alternativa limpia a añadir métodos a `Array.prototype` que se prometió en la lección «Prototipos nativos». Tiene una consecuencia poco conocida: `map`, `filter`, `slice` y compañía devuelven un objeto de la **subclase**, no un `Array`. Para crearlo llaman a `new` con la clase del array original, su «especie» (`Symbol.species`), pasándole una longitud. Si el constructor de la subclase tiene otra firma, el resultado sale mal:

[[exercise:10-heredar-de-array.md-]]

```text
checkout → Steps(3) ['carrito', 'envío', 'pago'] | last → pago
Array.isArray → true | JSON → ["carrito","envío","pago"]
map → Steps(3) ['CARRITO', 'ENVÍO', 'PAGO'] | ¿Steps? → true | last → PAGO
trip → 3 canciones | Viaje
🐛 filter → name: 0 | canciones: ['Bésame mucho']
🐛 map → name: 3 | ¿Playlist? → true
✅ filter → ['Bésame mucho'] | ¿SafePlaylist? → false
🐛 new Steps(3) → Steps(3) [empty × 3] | ✅ Steps.of(3) → Steps [3]
```

La salida es un getter estático `[Symbol.species]` que devuelve `Array`: los métodos que crean arrays nuevos usarán entonces arrays normales. Aun así, heredar de `Array` tiene más sorpresas (como `new Steps(3)`, que crea tres huecos), y JSON guarda solo los elementos. Si lo que quieres es una lista con unos cuantos métodos, una clase que **guarda** un array dentro suele ser mejor idea; es la composición de la lección «Composición y mixins».

## Bestiario

- **`this` antes de `super()`.**
  Síntoma: `ReferenceError: Must call super constructor in derived class before accessing 'this'…` al crear un objeto de una clase hija.
  Causa: en una clase derivada, el objeto lo crea el constructor de la base; `this` no existe hasta que `super(…)` vuelve.
  Solución: llama a `super(…)` antes de usar `this` (puedes validar antes sin `this`), o no escribas constructor si no lo necesitas.
  → [ver ejemplo](03-this-antes-de-super.md)
- **El método sobrescrito que se ejecuta demasiado pronto.**
  Síntoma: un método de la hija ve sus campos como `undefined` o lanza `Cannot read properties of undefined` al crear el objeto.
  Causa: el constructor del padre llama a un método que la hija sobrescribe, antes de que se creen los campos de la hija.
  Solución: no llames a métodos sobrescribibles desde el constructor; hazlo después de `new` o en un estático `create`.
  → [ver ejemplo](06-el-padre-llama-a-un-metodo-sobrescrito.md)
- **El campo que se salta el setter del padre.**
  Síntoma: un valor no se normaliza ni se cuenta, aunque el padre tiene un setter para esa propiedad.
  Causa: un campo de la hija define una propiedad propia que tapa el accesor heredado.
  Solución: asigna el valor inicial en el constructor, después de `super()`.
  → [ver ejemplo](07-campos-frente-a-accesores-del-padre.md)
- **El contador estático que se parte en dos.**
  Síntoma: el contador de la clase padre no cuenta los objetos de las subclases, o `this.#x` en un estático lanza `TypeError` al llamarlo sobre una subclase.
  Causa: `this.count += 1` sombrea el estático en la subclase; los estáticos privados no se heredan.
  Solución: nombra la clase que guarda el dato (`Car.count`, `Order.#nextNumber`).
  → [ver ejemplo](08-estaticos-heredados.md)
- **El error propio que se llama «Error».**
  Síntoma: la consola y los registros muestran `Error: …` en lugar del tipo real; o `cause` se pierde.
  Causa: `name` se hereda de `Error.prototype`; el constructor propio no pasó `options` a `super`.
  Solución: `this.name = 'ValidationError'` (o `new.target.name` en una base común) y `super(message, options)`.
  → [ver ejemplo](09-heredar-de-error.md)
- **El `filter` que devuelve una subclase rota.**
  Síntoma: `map` o `filter` sobre un array propio devuelven un objeto con datos absurdos (`name: 0`).
  Causa: esos métodos crean el resultado con `new Subclase(longitud)` (`Symbol.species`), y el constructor esperaba otros argumentos.
  Solución: `static get [Symbol.species]() { return Array; }`, o composición en lugar de herencia.
  → [ver ejemplo](10-heredar-de-array.md)

## Resumen

- `class Hija extends Padre` crea los dos enlaces que hacías a mano: entre los prototipos (métodos) y entre las clases (estáticos).
- `super(…)` ejecuta el constructor del padre y debe ir antes de cualquier uso de `this`; en una clase derivada, el objeto lo crea la base.
- Orden al crear un objeto: constructor de la hija hasta `super`, campos y constructor del padre, campos de la hija, resto del constructor.
- `super.metodo()` busca desde el padre de la clase donde está escrito el método: funciona en cualquier nivel y en los estáticos.
- El padre puede llamar a `this.metodo()` y ejecutar la versión de la hija (patrón plantilla); los métodos abstractos se imitan con un error y `new.target`.
- Un campo tapa el setter del padre y no lo frena una propiedad heredada de solo lectura; una asignación hace lo contrario.
- Los estáticos se heredan por delegación; los privados no son accesibles desde la hija (no hay `protected`).
- `extends Error` y `extends Array` funcionan; pon `name` a tus errores y cuidado con `Symbol.species` en los arrays.

## Para profundizar

- [MDN: extends](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes/extends)
- [MDN: super](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/super)
- [javascript.info: herencia de clase](https://es.javascript.info/class-inheritance)
- [javascript.info: extender clases nativas](https://es.javascript.info/extend-natives)
- [javascript.info: errores personalizados](https://es.javascript.info/custom-errors)
