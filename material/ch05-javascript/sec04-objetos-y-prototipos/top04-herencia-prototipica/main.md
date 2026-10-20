# Herencia prototípica

## Por qué importa

Ya sabes que un objeto hereda de su prototipo y que `new` enlaza las instancias con `F.prototype`. **Heredar** entre tipos (que un `Book` sea un `MediaItem` con algo más) es solo dar un paso más: enlazar un prototipo con otro prototipo. No hay ninguna maquinaria especial; es la misma cadena de siempre, con un eslabón más.

Esta lección construye herencia a mano de dos formas: con objetos que delegan en otros y con funciones constructoras, el patrón que usó todo el código JavaScript hasta 2015 y que sigue apareciendo en librerías, en código antiguo y en lo que generan las herramientas que traducen código moderno a versiones viejas. Hacerlo a mano tiene otra ventaja: cuando en el módulo siguiente escribas `class Book extends MediaItem`, sabrás exactamente qué objetos y enlaces crea esa línea, y entenderás cada error que aparezca.

## Delegación entre objetos

La forma más directa de heredar no necesita constructoras: un objeto **delega** en otro con `Object.create`. El objeto hijo añade sus propios métodos, cambia los datos que quiera (sombreado) y puede **sobrescribir** un método heredado definiendo uno con el mismo nombre:

```text
httpLogger { prefix: 'http', request } ──┐
                                         ├──► logger { prefix: 'app', log } ──► Object.prototype ──► null
alertLogger { prefix: 'alerta', log } ───┘
```

El ejemplo monta esa cadena con un registro de mensajes (*logger*) y dos especializaciones:

[[exercise:01-delegacion-entre-objetos.md-]]

```text
[app] aplicación iniciada
[http] GET /api/orders → 200
[http] caché vaciada
[alerta] ⚠️ DISCO CASI LLENO
[api] POST /api/payments → 201
```

Fíjate en cómo `alertLogger.log` reutiliza el método que sobrescribe: `logger.log.call(this, …)`. No puede escribir `this.log(…)`, porque la búsqueda empezaría en `alertLogger` y se encontraría a sí mismo. Hay que **nombrar** el objeto del que se hereda y llamar a su método con `call`, pasando el `this` actual para que trabaje con los datos de este objeto. Es lo que en Python hace `super()`.

## Herencia con funciones constructoras

Con constructoras hay que conectar dos cosas, porque un tipo tiene dos partes: los **datos** (los crea la constructora en `this`) y los **métodos** (viven en `prototype`). El patrón clásico tiene cuatro pasos:

1. En la constructora hija, llama a la del padre sobre el objeto nuevo: `MediaItem.call(this, title, year)`. Así se crean los datos del padre.
2. Haz que el prototipo hijo herede del prototipo padre: `Book.prototype = Object.create(MediaItem.prototype)`.
3. Restaura `constructor`, que se perdió en el paso 2 (no enumerable, como el original).
4. Añade los métodos propios y sobrescribe los que quieras, llamando a la versión del padre con `MediaItem.prototype.metodo.call(this, …)`.

```text
MediaItem ── .prototype ──► MediaItem.prototype { constructor, describe, age } ──► Object.prototype ──► null
                                     ▲
Book ─────── .prototype ──► Book.prototype { constructor, describe }
                                     ▲
novel { title, year, pages } ────────┘
```

El ejemplo aplica los cuatro pasos a una mediateca:

[[exercise:02-herencia-con-constructoras.md-]]

Expande `novel` en la consola y recorre la cadena: `Book.prototype` tiene su `describe`; dentro, `MediaItem.prototype` tiene el `describe` original y `age`. Cuando llamas a `novel.age(2026)`, la búsqueda atraviesa `Book.prototype` sin encontrarlo y lo encuentra un eslabón más arriba. Y `instanceof` es `true` para `Book` y para `MediaItem`, porque los dos `prototype` están en la cadena.

> **Desde Python:** el paso 1 es `super().__init__(title, year)` y el paso 4, `super().describe()`. Los pasos 2 y 3 los hace por ti la línea `class Book(MediaItem):`. En JavaScript, `class Book extends MediaItem` (módulo «Clases y POO») también los hace por ti, y crea exactamente esta cadena.

```python
class Book(MediaItem):
    def __init__(self, title, year, pages):
        super().__init__(title, year)
        self.pages = pages

    def describe(self):
        return f"📖 {super().describe()}, {self.pages} págs."
```

### Llamar a la versión del padre

Nombrar al padre explícitamente (`MediaItem.prototype.describe.call(this)`) parece repetitivo, y es tentador buscar un atajo «genérico». Los dos atajos obvios provocan una recursión infinita. `this.describe()` se llama a sí mismo. Y `Object.getPrototypeOf(this).describe.call(this)` funciona mientras llames al método sobre el objeto que lo define, pero en cuanto otro objeto hereda de él, `this` es ese objeto de más abajo, `getPrototypeOf(this)` devuelve siempre el mismo eslabón y el método vuelve a llamarse a sí mismo:

[[exercise:03-llamar-al-metodo-del-padre.md-]]

```text
🐛 this.describe() → RangeError | Maximum call stack size exceeded
book.describe() → 📖 Plantilla de libro
🐛 getPrototypeOf(this) → RangeError | Maximum call stack size exceeded
✅ padre explícito → 📖 Rayuela
✅ super → 📖 Rayuela
```

El problema de fondo es que `this` depende de **quién llama**, y para encontrar al padre hace falta saber **dónde está escrito** el método. Eso es lo que resuelve `super`: un método abreviado de un literal (o de una clase) recuerda el objeto en el que se escribió, y `super.describe()` busca a partir del prototipo de **ese** objeto. Lo verás a fondo con las clases; aquí basta con saber que existe y por qué.

### Tres formas de encadenar mal

El patrón de cuatro pasos tiene variantes que parecen equivalentes y no lo son. `Child.prototype = Parent.prototype` no crea un eslabón nuevo: hace que los dos nombres apunten al **mismo** objeto, así que los métodos del hijo aparecen en el padre. `Child.prototype = new Parent()` ejecuta la constructora del padre una vez, sin argumentos, y deja sus datos en el prototipo, compartidos por todos los hijos (el bug del array compartido de la lección «La cadena de prototipos»). Y olvidar `Parent.call(this, …)` deja a los hijos sin los datos del padre:

[[exercise:04-errores-al-encadenar.md-]]

## `Object.setPrototypeOf`, y por qué evitarlo

`Object.setPrototypeOf(obj, proto)` cambia el `[[Prototype]]` de un objeto que **ya existe**. Tiene límites razonables (no permite crear ciclos ni tocar objetos no extensibles) y un problema serio: el rendimiento. Los motores como V8 optimizan el acceso a propiedades suponiendo que la cadena de un objeto no cambia; cada objeto tiene una «forma» interna y el código que lo usa memoriza dónde encontró cada propiedad. Cambiar el prototipo de un objeto en uso invalida esas optimizaciones. MDN lo resume en un aviso: es una operación lenta en todos los navegadores.

[[exercise:05-set-prototype-of.md-]]

La regla práctica: elige el prototipo **al crear** el objeto (`Object.create(proto)`, `new`, `{ __proto__: proto }`) y no lo cambies después. El uso aceptable de `setPrototypeOf` es al **preparar** una herencia, antes de crear ninguna instancia: `Object.setPrototypeOf(Book.prototype, MediaItem.prototype)` es una alternativa al paso 2 que además conserva `constructor`. El setter `obj.__proto__ = proto` hace lo mismo con los mismos problemas.

## Métodos compartidos y métodos propios

Un método puede vivir en el prototipo (compartido) o crearse en la constructora como propiedad de cada objeto (propio). No es solo una cuestión de memoria:

| | En el prototipo | Propio (creado en la constructora) |
|---|---|---|
| Funciones creadas | una para todos | una por objeto |
| Estado privado con closures | no | sí (`let elapsedMs` en la constructora) |
| `this` fijo con una flecha | no | sí (`this.report = () => …`) |
| Se puede cambiar para todos a la vez | sí (enlace en vivo) | no |
| Aparece en `Object.keys` y se copia con el spread | no | sí (son propiedades propias) |

El ejemplo usa las dos clases de método en un cronómetro:

[[exercise:06-metodos-compartidos-frente-a-propios.md-]]

Por defecto, los métodos van en el prototipo. Usa métodos propios cuando necesites lo que solo ellos dan: estado realmente privado o un `this` fijo para pasar el método como callback. Y un objeto concreto puede **sombrear** un método compartido con uno propio, por ejemplo para espiar sus llamadas mientras depuras, sin afectar a los demás.

## La herencia es un enlace en vivo

Como cada lectura recorre la cadena **en ese momento**, un método añadido a un prototipo después de crear los objetos aparece en todos ellos al instante, también en los de las «subclases». Y si un tipo hijo añade su versión, la sombrea solo para sus objetos:

[[exercise:07-cambiar-el-prototipo-en-vivo.md-]]

Esta es la base de los *polyfills*, que verás en la lección siguiente: código que añade a un prototipo nativo un método que el navegador todavía no tiene.

> **Desde Python:** igual que añadir un método a una clase en tiempo de ejecución (`MediaItem.describe = describe`): las instancias existentes lo ven, porque Python también busca en la clase en cada acceso.

## Delegar o copiar

Hay dos formas de que un objeto «tenga» lo de otro: **delegar** (`Object.create(base)`: el objeto guarda solo lo que cambia y busca el resto en la base) o **copiar** (`{ ...base }` u `Object.assign({}, base)`: el objeto recibe una foto de la base). La diferencia aparece cuando la base cambia, y cuando serializas:

[[exercise:08-delegacion-frente-a-copia.md-]]

| | Delegar (`Object.create`) | Copiar (spread, `Object.assign`) |
|---|---|---|
| Cambios posteriores de la base | se ven | no se ven |
| Memoria | solo lo que cambia | todo duplicado |
| `JSON.stringify`, `Object.keys`, spread | solo lo propio | todo |
| Independencia | depende de la base | total |

Las dos técnicas se combinan. En el módulo «Clases y POO» verás los *mixins*, que **copian** métodos de varios objetos en un prototipo con `Object.assign`: es la forma de reunir comportamiento de varias fuentes, porque la cadena solo admite un prototipo por objeto.

## Una jerarquía de tres niveles

Con un helper `inherit(Child, Parent)` que hace el paso 2, montar una jerarquía es mecánico. El ejemplo crea `MediaItem → Book → AudioBook`, imprime la cadena con el nombre de cada prototipo y una tabla que dice en qué eslabón se resuelve cada método, el equivalente al `__mro__` de Python:

[[exercise:09-tres-niveles-de-herencia.md-]]

```text
cadena → AudioBook.prototype → Book.prototype → MediaItem.prototype → Object.prototype → null
(tabla: describe → AudioBook.prototype · readingHours → AudioBook.prototype · age → MediaItem.prototype · toString → Object.prototype)
🎧 Pedro Páramo (1955), 124 págs., narrado por Daniel Giménez Cacho
```

`describe` combina los tres niveles: cada uno llama a la versión del anterior y añade lo suyo.

> **Desde Python:** `AudioBook.__mro__` sería `(AudioBook, Book, MediaItem, object)`, la misma lista. La diferencia es que Python admite herencia **múltiple** (`class C(A, B)`) y calcula el orden con el algoritmo C3; en JavaScript cada objeto tiene **un** prototipo, así que la cadena es siempre una línea recta. Para combinar comportamientos de varias fuentes se usan mixins o composición (módulo «Clases y POO»).

## Bestiario

- **El método que se llama a sí mismo al buscar al padre.**
  Síntoma: `RangeError: Maximum call stack size exceeded` al llamar a un método sobrescrito, a menudo solo con objetos de un nivel más abajo.
  Causa: `this.metodo()` u `Object.getPrototypeOf(this).metodo` buscan desde el objeto que llama, no desde donde está escrito el método.
  Solución: nombra al padre (`Parent.prototype.metodo.call(this, …)`) o usa `super` en métodos abreviados y clases.
  → [ver ejemplo](03-llamar-al-metodo-del-padre.md)
- **El hijo que contamina al padre.**
  Síntoma: un método añadido al hijo aparece en los objetos del padre, o `instanceof` da `true` donde no debe.
  Causa: `Child.prototype = Parent.prototype` hace que los dos nombres apunten al mismo objeto.
  Solución: `Child.prototype = Object.create(Parent.prototype)` (o `Object.setPrototypeOf(Child.prototype, Parent.prototype)`).
  → [ver ejemplo](04-errores-al-encadenar.md)
- **Los datos del padre que faltan o se comparten.**
  Síntoma: un hijo tiene `undefined` en los datos del padre, o varios hijos comparten el mismo array.
  Causa: falta `Parent.call(this, …)` en la constructora hija, o el prototipo se creó con `new Parent()` y guarda datos.
  Solución: llama a la constructora del padre sobre `this` y usa `Object.create(Parent.prototype)` para el prototipo.
  → [ver ejemplo](04-errores-al-encadenar.md)

## Resumen

- Heredar es enlazar prototipos: con objetos (`Object.create(base)`) o con constructoras (`Child.prototype` hereda de `Parent.prototype`).
- El patrón con constructoras: `Parent.call(this, …)`, `Object.create(Parent.prototype)`, restaurar `constructor`, sobrescribir llamando a `Parent.prototype.metodo.call(this, …)`.
- Para llamar al padre no sirven `this.metodo()` ni `Object.getPrototypeOf(this)`; nombra al padre o usa `super`.
- `Object.setPrototypeOf` cambia el prototipo de un objeto existente: lento y confuso; úsalo solo al preparar la herencia.
- Métodos en el prototipo por defecto; propios cuando necesites closures privados o un `this` fijo.
- La herencia es un enlace en vivo; copiar con spread hace una foto independiente.
- Cada objeto tiene un solo prototipo: la cadena es una línea recta, sin herencia múltiple.

## Para profundizar

- [MDN: herencia y la cadena de prototipos](https://developer.mozilla.org/es/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [MDN: Object.setPrototypeOf](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf)
- [MDN: super](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/super)
- [Mathias Bynens: cómo optimizan los motores los prototipos (en inglés)](https://mathiasbynens.be/notes/prototypes)
- [You Don't Know JS: delegación de comportamiento (en inglés)](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/this%20%26%20object%20prototypes/ch6.md)
