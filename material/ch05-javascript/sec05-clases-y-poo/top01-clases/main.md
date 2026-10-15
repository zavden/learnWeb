# Clases

## Por qué importa

En el módulo «Objetos y prototipos» montaste tipos a mano: una función constructora para los datos, su `prototype` para los métodos, `new` para unir las dos piezas y, al final, un helper `defineMethods` para que los métodos no salieran en los `for…in`. Funciona, pero hay que escribir mucho y es fácil equivocarse. La sintaxis `class`, que llegó al lenguaje en 2015, hace todo eso en un solo bloque que se lee como una clase de Python.

Lo importante de esta lección es que `class` **no** trae un modelo de objetos nuevo. Debajo de cada clase hay exactamente lo que ya conoces: una función, un objeto `prototype` con los métodos y objetos enlazados a él. Por eso se dice que las clases son *azúcar sintáctico*. Pero no son solo azúcar: corrigen varios descuidos de las constructoras (olvidar `new`, los métodos enumerables, el modo no estricto) y añaden piezas que antes no existían, como los campos. Esta lección enseña la sintaxis, lo que hay debajo y lo que cambia.

## La sintaxis `class`

Una clase agrupa en un bloque el `constructor` (lo que en el módulo anterior era la función constructora) y los métodos (lo que ibas añadiendo a `prototype`). Los métodos se escriben como los métodos abreviados de un objeto literal, pero **sin comas** entre ellos:

```js
class Product {
  constructor(title, cents) {
    this.title = title;
    this.cents = cents;
  }

  describe() {
    return `${this.title}: ${(this.cents / 100).toFixed(2)} €`;
  }
}

const lamp = new Product('Lámpara de mesa', 2400);
```

El ejemplo añade un método que devuelve `this` (para encadenar llamadas) y otro que recibe otro objeto del mismo tipo:

[[exercise:01-primera-clase.md-]]

```text
lamp → Product {title: 'Lámpara de mesa', cents: 2400}
Lámpara de mesa: 24.00 €
Lámpara de mesa: 21.60 €
Taza de cerámica: 8.50 €
¿la taza es más barata? → true
instanceof → true
```

Tres reglas de sintaxis que conviene fijar desde el principio, porque las tres dan un `SyntaxError` que el editor marca en rojo: entre los métodos no van comas, los métodos no llevan la palabra `function` y solo puede haber un `constructor`. Si una clase no lo necesita, puedes omitirlo: JavaScript pone uno vacío.

> **Desde Python:** el `constructor` es el `__init__`, y `this` es el `self`. La diferencia es que `this` no se declara como primer parámetro: está siempre disponible dentro de los métodos y su valor lo decide la llamada, con las reglas de la lección «La palabra clave this». Igual que en Python con `self.`, para usar un dato o llamar a otro método del objeto hay que escribir `this.`: `describe()` a secas buscaría una variable llamada `describe`.

```python
class Product:
    def __init__(self, title, cents):
        self.title = title
        self.cents = cents

    def describe(self):
        return f"{self.title}: {self.cents / 100:.2f} €"

lamp = Product("Lámpara de mesa", 2400)
```

## Una clase es una función

`typeof Product` es `'function'`. La clase **es** la función constructora, y los métodos del bloque terminan en `Product.prototype`, el mismo objeto que rellenabas a mano en el módulo anterior. Este es el diagrama de la lección «Funciones constructoras y new», y vale tal cual para la clase:

```text
Product (función) ──[[Prototype]]──► Function.prototype  (call, apply, bind…)
   │
   └── .prototype ──► Product.prototype { constructor, describe } ──► Object.prototype ──► null
                            ▲
lamp { title, cents } ──────┘ [[Prototype]]
```

El ejemplo escribe el mismo tipo con `class` y con una función constructora, y comprueba que las piezas son las mismas:

[[exercise:02-una-clase-es-una-funcion.md-]]

```text
typeof Product → function
¿describe es propia de Product.prototype? → true
Product.prototype.constructor === Product → true
Product.prototype → {constructor: class Product, describe: ƒ}
¿lamp → Product.prototype? → true
propias → (2) ['title', 'cents'] (2) ['title', 'cents']
¿un solo describe? → true
descriptor de describe → {value: ƒ, writable: true, enumerable: false, configurable: true}
for…in con class → (2) ['title', 'cents']
for…in con la función → (3) ['title', 'cents', 'describe']
```

La única diferencia visible está al final: `class` define los métodos como **no enumerables**, con los mismos atributos que los métodos nativos. Es lo que hacía el helper `defineMethods` de la integración del módulo anterior, y es la razón de que `for…in` liste solo los datos.

Todo lo que aprendiste en el módulo anterior sigue siendo cierto con clases: `instanceof` busca `Product.prototype` en la cadena, `lamp.constructor` es `Product` porque se hereda del prototipo, un método añadido después a `Product.prototype` aparece al instante en todos los objetos, y `Object.getPrototypeOf` recorre la misma cadena.

## Lo que `class` cambia

Que la clase sea una función no significa que sea igual que una función constructora. `class` cierra varias puertas que en el módulo anterior causaban errores:

| | Función constructora | `class` |
|---|---|---|
| Llamar sin `new` | se ejecuta como llamada simple (y escribe en `window`) | `TypeError` en el acto |
| Modo estricto | solo si el script lo activa | siempre, en todo el cuerpo |
| Métodos | enumerables si se añaden con `=` | no enumerables |
| `new obj.metodo()` | funciona (cualquier `function` es constructora) | `TypeError`: los métodos no son constructores |
| Reemplazar `F.prototype` | se puede (con los problemas que viste) | no: `prototype` es de solo lectura |
| Antes de su línea | se puede llamar (hoisting) | `ReferenceError` (zona muerta temporal) |
| En `window` (script clásico) | sí, como toda `function` global | no, como `let` y `const` |

[[exercise:03-lo-que-class-cambia.md-]]

```text
OldProduct sin new → undefined | window.title → Silla
Product sin new → TypeError | Class constructor Product cannot be invoked without 'new'
modo estricto → ReferenceError | lastDescribed is not defined
chair.describe.prototype → undefined
new con un método → TypeError | chair.describe is not a constructor
¿sigue el prototype original? → true
'OldProduct' in window → true
'Product' in window → false
```

El modo estricto merece una línea más. Los ejemplos de LearnWeb son scripts clásicos, no estrictos, pero el código **dentro** de una clase siempre lo es. Eso tiene dos consecuencias que verás en esta lección: asignar a una variable sin declarar lanza un `ReferenceError` (en lugar de crear una global por accidente, como en la lección «Variables»), y en una llamada simple `this` es `undefined`, no `window`.

## Campos de instancia

Las clases tienen una pieza que las constructoras no tenían: los **campos**. Un campo es una línea `nombre = valor;` dentro del cuerpo de la clase, fuera de los métodos. Cada objeto creado con `new` recibe ese campo como **propiedad propia**, y el inicializador (lo que va a la derecha del `=`) se evalúa de nuevo para **cada** objeto:

```js
class Playlist {
  songs = [];        // un array nuevo para cada lista
  owner = 'anónimo'; // valor por defecto
  durationSeconds;   // sin valor: undefined, pero la propiedad existe
}
```

Los campos se crean justo después de crear el objeto y **antes** de ejecutar el cuerpo del `constructor`, así que el constructor ya los encuentra y puede cambiarlos. Y como cada objeto tiene los suyos, el bug del array compartido en el prototipo, de la lección «La cadena de prototipos», no puede ocurrir con un campo:

[[exercise:04-campos-de-instancia.md-]]

```text
  constructor de «Viaje a Oaxaca»: ¿songs ya existe? → true
  constructor de «Para estudiar»: ¿songs ya existe? → true
roadTrip → Playlist {id: 1, songs: Array(2), owner: 'Lucía', durationSeconds: 425, name: 'Viaje a Oaxaca'}
study → Playlist {id: 2, songs: Array(0), owner: 'anónimo', durationSeconds: undefined, name: 'Para estudiar'}
¿comparten songs? → false
propias de study → (5) ['id', 'songs', 'owner', 'durationSeconds', 'name']
¿'songs' en el prototype? → false
```

Usa campos para los valores iniciales que no dependen de los argumentos (listas vacías, contadores, estados) y el `constructor` para lo que llega de fuera. Declarar todos los datos como campos, aunque sea sin valor, tiene además una ventaja de lectura: basta con mirar la cabecera de la clase para saber qué propiedades tienen sus objetos.

> **Desde Python:** aquí la misma sintaxis significa **lo contrario**. En Python, `songs = []` en el cuerpo de la clase crea un atributo **de clase**, compartido por todas las instancias (el bug del módulo anterior). En JavaScript crea un campo **de instancia**, uno por objeto: es el equivalente de `songs: list = field(default_factory=list)` en una *dataclass*. Lo que pertenece a la clase se marca con `static`, en la lección siguiente. Y a diferencia de una *dataclass*, los campos no generan ningún constructor: los argumentos hay que asignarlos a mano.

Hay un detalle técnico de los campos que importará cuando haya herencia: un campo no se **asigna** con `=`, sino que se **define**, como con `Object.defineProperty`. Casi siempre da igual, pero no cuando un prototipo tiene un setter o una propiedad de solo lectura con el mismo nombre. Lo verás en las lecciones «Encapsulación» y «Herencia con extends».

### Un constructor con opciones

JavaScript no tiene argumentos por nombre. Un constructor con cinco parámetros posicionales obliga a recordar su orden y produce llamadas ilegibles, como `new RawBooking('Carmen Vidal', 3, false, true)`. La solución habitual es recibir **un objeto de opciones** y desestructurarlo en los parámetros, con un valor por defecto para cada opción (lo viste en la lección «Parámetros»):

[[exercise:08-constructor-con-opciones.md-]]

El `= {}` final permite llamar a `new Booking()` sin argumentos: la desestructuración no falla y el constructor puede validar y dar un mensaje claro. Es el equivalente de los *keyword arguments* de Python, `Booking(guest="Carmen Vidal", pets=True, nights=3)`.

## Las clases no se elevan

Una declaración `function` se puede llamar antes de su línea, porque se eleva entera (lección «Ámbito y hoisting»). Una declaración `class` se comporta como `let` y `const`: el nombre existe desde el principio del bloque, pero no tiene valor hasta que se ejecuta su línea. Entre medias está en la **zona muerta temporal**, y cualquier uso lanza un `ReferenceError`, incluido `typeof` y el `extends` de otra clase:

[[exercise:05-las-clases-no-se-elevan.md-]]

```text
función antes de su línea → 24.00 €
🐛 new antes de la clase → ReferenceError | Cannot access 'Invoice' before initialization
🐛 typeof en la TDZ → ReferenceError | Cannot access 'Invoice' before initialization
typeof de un nombre que no existe → undefined
🐛 extends antes del padre → ReferenceError | Cannot access 'Receipt' before initialization
✅ después de la clase → Invoice {number: 'F-2026-002', lines: Array(0)}
```

Fíjate en `createInvoice`: una función escrita **antes** de la clase puede usarla sin problemas, porque lo que cuenta es cuándo se **ejecuta**, no dónde está escrita. La regla práctica es declarar las clases arriba, los padres antes que los hijos, y poner debajo el código que las usa.

## Métodos y `this`

Los métodos de una clase siguen las reglas de `this` de siempre: `this` es el objeto que está a la izquierda del punto **en la llamada**. Si sacas un método de su objeto (para pasarlo como callback o guardarlo en una variable), quien lo llame lo hará como llamada simple. Con las constructoras del módulo anterior eso daba `window`; con una clase, como su cuerpo es estricto, da `undefined` y el error salta en el acto:

[[exercise:06-metodo-separado-pierde-this.md-]]

```text
🐛 método separado → TypeError | Cannot read properties of undefined (reading 'count')
🐛 como callback → TypeError | Cannot read properties of undefined (reading 'count')
✅ clicks.count → 4
✅ likes.count → 3
likes → LikeCounter {count: 3, increment: ƒ}
¿increment compartido? → false
```

A las dos soluciones de la lección «La palabra clave this» (una flecha que llama al método y `bind`) las clases añaden una tercera: un **campo cuyo valor es una flecha**, `increment = () => { … }`. El inicializador del campo se ejecuta con `this` apuntando al objeto nuevo, y la flecha lo captura para siempre, así que el método funciona aunque se separe. Tiene un precio: ya no es un método del prototipo, sino una función **por objeto**, como los «métodos propios» de la lección «Herencia prototípica». Resérvalo para los métodos que de verdad vas a pasar como callbacks, como los manejadores de eventos del capítulo 6.

## Las clases son valores

Como una clase es una función, es un valor más: se puede escribir como expresión (`const Point = class { … }`), guardar en una variable o en un `Map`, pasar a una función y devolver desde otra. Un uso muy habitual es un **registro de tipos**: un dato que llega de fuera, como el campo `"type"` de un JSON, decide con qué clase se crea cada objeto:

[[exercise:07-las-clases-son-valores.md-]]

```text
Point.name → Point
new Point(3, 4) → Point {x: 3, y: 4}
Circle → área 12.57
Rectangle → área 12.00
⛔ Tipo de figura desconocido: «triangle»
createMany → (2) [Circle, Circle]
```

`new Type(data)` funciona con cualquier clase que guarde la variable `Type`. Esta idea de tratar las clases como valores reaparecerá en las fábricas de la lección «Patrones de diseño» y en los *mixins*, funciones que reciben una clase y devuelven otra.

## Bestiario

- **La clase que «no existe» todavía.**
  Síntoma: `ReferenceError: Cannot access 'Invoice' before initialization` al crear un objeto, al usar `typeof` o en el `extends` de otra clase.
  Causa: las declaraciones `class` no se elevan con su valor, como `let` y `const`; hasta su línea, el nombre está en la zona muerta temporal.
  Solución: declara las clases antes de usarlas (los padres antes que los hijos); las funciones que las usan pueden ir antes si se llaman después.
  → [ver ejemplo](05-las-clases-no-se-elevan.md)
- **El método que pierde su objeto.**
  Síntoma: `TypeError: Cannot read properties of undefined (reading 'count')` al pasar un método como callback.
  Causa: `obj.metodo` sin paréntesis es la función a secas; en la llamada simple, el cuerpo estricto de la clase da `this === undefined`.
  Solución: una flecha al llamar (`() => obj.metodo()`), `obj.metodo.bind(obj)` o, para callbacks frecuentes, un campo con una flecha.
  → [ver ejemplo](06-metodo-separado-pierde-this.md)

## Resumen

- `class` agrupa el `constructor` (los datos) y los métodos (sin comas ni `function`) en un bloque; `new` crea los objetos.
- Una clase **es** una función constructora: sus métodos viven en `Clase.prototype`, y la cadena de prototipos es la del módulo anterior.
- Lo que cambia: llamar sin `new` lanza un error, el cuerpo es siempre estricto, los métodos no son enumerables ni constructores y `prototype` no se puede reemplazar.
- Los campos (`songs = []`) son propiedades propias de cada objeto, creadas antes del cuerpo del constructor; en Python esa sintaxis crea un atributo de clase.
- Sin argumentos por nombre, un constructor con un objeto de opciones desestructurado da llamadas legibles y valores por defecto.
- Las clases no se pueden usar antes de su línea (zona muerta temporal).
- Un método separado de su objeto pierde `this`; un campo con una flecha lo fija, a costa de una función por objeto.
- Las clases son valores: se guardan, se pasan y se eligen en tiempo de ejecución.

## Para profundizar

- [MDN: clases](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes)
- [javascript.info: sintaxis básica de clases](https://es.javascript.info/class)
- [MDN: campos de clase públicos (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields)
- [MDN: constructor](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes/constructor)
