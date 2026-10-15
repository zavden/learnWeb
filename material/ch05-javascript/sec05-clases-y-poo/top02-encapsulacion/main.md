# Encapsulación

## Por qué importa

Un objeto bien diseñado protege sus datos: una cuenta bancaria no debería permitir que cualquier línea del programa cambie su saldo sin pasar por `deposit` y `withdraw`, que validan y registran cada movimiento. Hasta ahora tenías dos herramientas para eso: la convención `_saldo` («no lo toques, por favor»), que no protege nada, y los closures de la lección «Closures», que protegen de verdad pero no encajan con los métodos compartidos del prototipo.

Las clases añaden una tercera, que Python no tiene: los campos **`#privados`**, inaccesibles desde fuera de la clase por regla del lenguaje. Esta lección los presenta junto con las otras piezas que deciden qué es la interfaz pública de una clase: los getters y setters, que validan al asignar y calculan al leer, y los miembros **estáticos**, que pertenecen a la clase y no a sus objetos.

## Campos privados

Un campo cuyo nombre empieza por `#` es **privado**: solo el código escrito dentro del cuerpo de la clase puede leerlo o escribirlo. El `#` forma parte del nombre (`#balanceCents` y `balanceCents` son dos cosas distintas, y pueden convivir), y todo campo privado tiene que **declararse** en el cuerpo de la clase antes de usarse, aunque sea sin valor (`#owner;`):

```js
class BankAccount {
  #balanceCents = 0;

  deposit(cents) {
    this.#balanceCents += cents;
  }
}
```

[[exercise:01-campos-privados.md-]]

```text
Valeria Ortiz: $1179.50 (2 movimientos)
account → BankAccount {owner: 'Valeria Ortiz'}
Object.keys → ['owner']
account['#balanceCents'] → undefined
tras «hackear» → Valeria Ortiz: $1179.50 (2 movimientos)
fuera de la clase → SyntaxError | Private field '#balanceCents' must be declared in an enclosing class
```

Fíjate en el tipo del último error. Escribir `account.#balanceCents` fuera de la clase no es un error al **ejecutar**, sino al **compilar**: el script entero no llegaría a ejecutarse, y el editor lo marca en rojo. Por eso el ejemplo lo comprueba compilando ese texto aparte con `new Function('account', 'return account.#balanceCents')`, que convierte un texto en el cuerpo de una función nueva (y, si el texto no compila, lanza el `SyntaxError` en ese momento, donde un `try/catch` puede atraparlo). Tampoco hay ninguna forma indirecta de llegar a un privado: `account['#balanceCents']` es una propiedad normal llamada así, y `account.balanceCents = …` crea una propiedad pública nueva, sin relación con el dato.

La privacidad es **por clase**, no por objeto: un método puede leer el `#balanceCents` de **otra** cuenta (`other.#balanceCents`), siempre que el código esté escrito dentro de la clase. Lo verás en el método `equals` del final de la lección.

Un detalle de la consola: la de LearnWeb no puede mostrar los campos privados, porque se escribe en JavaScript y ningún código JavaScript los ve desde fuera. Las DevTools de Chrome sí los enseñan, porque son una herramienta del navegador: abre el ejemplo con ↗ y pulsa F12 si quieres verlos.

### Métodos privados

Los métodos y los getters también pueden ser privados: `#lengthProblem(password) { … }`, `get #patterns() { … }`. Son los ayudantes internos de la clase, detalles de implementación que puedes cambiar o borrar sin romper el código de nadie, porque nadie más puede llamarlos. No se guardan en el prototipo, así que no aparecen en `Object.getOwnPropertyNames(Clase.prototype)` ni se pueden tomar prestados con `call`:

[[exercise:02-metodos-privados.md-]]

```text
gato123 → ⛔ mínimo 10 caracteres; mezcla minúsculas, mayúsculas, números o símbolos
margaritas-del-campo → ⛔ mezcla minúsculas, mayúsculas, números o símbolos
Margaritas-2026 → ✅ válida
PasswordPolicy.prototype → (2) ['constructor', 'check']
policy.lengthProblem → undefined
check con otro this → TypeError | Receiver must be an instance of class PasswordPolicy
```

### `_x`, `#x` y closures

Hasta que los campos privados entraron en el estándar (ES2022), el código JavaScript usaba la convención de Python, `_x`, o closures. Las tres opciones conviven hoy, y conviene saber qué protege cada una:

| | `this._items` | `this.#items` | closure (`const items` en una fábrica) |
|---|---|---|---|
| ¿Se puede leer y cambiar desde fuera? | sí | no | no |
| ¿Sale en `Object.keys`, JSON y spread? | sí | no | no |
| ¿Métodos compartidos en el prototipo? | sí | sí | no: una función por objeto |
| ¿Accesible desde una subclase? | sí | no | no |

[[exercise:03-guion-bajo-frente-a-almohadilla.md-]]

```text
_items  → claves ["_items"] · JSON {"_items":["Café de Chiapas"]} · count() tras vaciar _items: 0
#items  → claves [] · JSON {} · count() tras vaciar _items: 1
closure → claves ["add","count"] · JSON {} · count() tras vaciar _items: 1
```

Usa `#` para lo que de verdad es interno. La convención `_x` sigue teniendo sentido en un caso: cuando quieres que las subclases puedan usar el dato (los privados no se heredan de forma accesible, como verás en la lección siguiente) y te basta con un aviso.

> **Desde Python:** `self._items` es la misma convención. `self.__items` activa el *name mangling*: Python guarda el atributo como `_Cart__items`, para evitar choques de nombres con las subclases, pero sigue siendo accesible con ese nombre. `#items` es privado de verdad; no existe ningún nombre para llegar a él. TypeScript añade además la palabra `private` (capítulo 7), que solo comprueba el compilador: en el JavaScript generado, la propiedad es pública.

## Getters y setters

`get` y `set` funcionan en una clase igual que en los objetos literales de la lección «Propiedades a fondo»: un getter se ejecuta al **leer** la propiedad y un setter al **asignarla**, sin paréntesis. La diferencia es dónde viven. En un literal, el accesor es una propiedad del propio objeto; en una clase, se define una sola vez en `Clase.prototype`, como los métodos, y todos los objetos lo heredan.

El problema del setter que se llama a sí mismo (lección «Propiedades a fondo») tiene ahora la solución natural: el dato se guarda en un campo privado con otro nombre, `#celsius`, y el accesor público, `celsius`, valida antes de escribirlo:

[[exercise:04-getters-y-setters.md-]]

```text
celsius → 22.5 | fahrenheit → 72.5
⛔ RangeError: Fuera de rango (5-30 °C): 40
⛔ TypeError: Temperatura no válida: veinte
fahrenheit tras asignar → 72.5
descriptor → {get: ƒ, set: ƒ, enumerable: false, configurable: true}
¿'celsius' es propia? → false
```

Un getter sin setter es una propiedad de **solo lectura**: la asignación no hace nada (en un script clásico, en silencio; dentro del código de una clase, que es estricto, lanzaría un `TypeError`). Usa getters para lo que se **calcula** a partir de otros datos (`fahrenheit`, el total de un carrito, el nombre completo) y setters para lo que hay que **validar** o normalizar al guardar. Si un getter hace un trabajo costoso o tiene efectos, mejor un método: quien lee `obj.total` espera que sea barato y que no cambie nada.

> **Desde Python:** es `@property` con su `@celsius.setter`, y como en Python, la *property* vive en la clase y el dato en la instancia. La convención `self._celsius` de Python se traduce aquí por `#celsius`.

### Un campo que tapa al accesor

En la lección «Clases» viste que un campo no se asigna, sino que se **define**: es una propiedad propia que se crea antes del cuerpo del constructor. Si el campo tiene el **mismo nombre** que un accesor, la propiedad propia tapa al accesor del prototipo, y todas las asignaciones posteriores, incluida la del constructor, cambian esa propiedad sin pasar por el setter. La validación desaparece sin ningún aviso:

[[exercise:05-campo-que-tapa-un-accesor.md-]]

```text
🐛 sin normalizar → "  Ana.Torres@Example.COM "
🐛 sin validar → esto no es un correo
🐛 descriptor propio → {value: 'esto no es un correo', writable: true, enumerable: true, configurable: true}
✅ normalizado → ana.torres@example.com
✅ validado → TypeError | Correo no válido: «esto no es un correo»
✅ propias → []
```

La regla: cuando una propiedad tiene `get`/`set`, el dato se declara con **otro** nombre (`#email`), nunca con el mismo.

## Miembros estáticos

Un campo o un método marcado con `static` pertenece a la **clase**, no a sus objetos: se usa como `Temperature.fromFahrenheit(212)` o `Temperature.ABSOLUTE_ZERO`. Técnicamente es una propiedad de la función constructora, lo que en la lección «Funciones constructoras y new» escribías como `Product.applyDiscount = …` y que allí resultó no servir como método de las instancias. Los estáticos sirven para tres cosas:

- **Constructores alternativos**: `Temperature.fromFahrenheit(212)`, `Money.of('19.99')`. Dentro de un método estático, `this` es la clase sobre la que se llama, así que `new this(…)` crea un objeto de esa clase (y de la subclase, si se llama sobre una, como verás en la lección siguiente).
- **Utilidades** relacionadas con el tipo que no necesitan una instancia: `Temperature.compare(a, b)`, como `Array.isArray` u `Object.keys`.
- **Datos de la clase**: constantes y contadores compartidos, como `Temperature.ABSOLUTE_ZERO`.

[[exercise:06-miembros-estaticos.md-]]

```text
ordenadas → -3.0 °C < 24.5 °C < 100.0 °C
creadas → 3
cero absoluto → -273.15
first.ABSOLUTE_ZERO → undefined
first.constructor.ABSOLUTE_ZERO → -273.15
Object.keys(Temperature) → ['ABSOLUTE_ZERO']
⛔ RangeError: -300 °C es imposible
```

Fíjate en `first.ABSOLUTE_ZERO`: las instancias **no** ven los estáticos, porque están en la función `Temperature` y la cadena de una instancia pasa por `Temperature.prototype`, no por `Temperature`. Desde un método de instancia se llega a ellos con el nombre de la clase o con `this.constructor`. Y un detalle: los campos estáticos son enumerables, los métodos estáticos no.

> **Desde Python:** un método `static` que usa `this` es un `@classmethod` (`this` hace de `cls`); uno que no lo usa es un `@staticmethod`; y un campo `static` es un atributo de clase. La gran diferencia está en la búsqueda: en Python, `reading.ABSOLUTE_ZERO` funciona porque la instancia busca en su clase; en JavaScript, la cadena de la instancia no pasa por la clase.

```python
class Temperature:
    ABSOLUTE_ZERO = -273.15

    @classmethod
    def from_fahrenheit(cls, f):
        return cls((f - 32) * 5 / 9)

    @staticmethod
    def compare(a, b):
        return a.celsius - b.celsius
```

Lo que en Python son decoradores (`@property`, `@classmethod`, `@staticmethod`) en JavaScript son palabras clave (`get`, `set`, `static`). Hay una propuesta para añadir decoradores `@algo` a las clases de JavaScript, pero Chrome todavía no la incluye; los verás en código TypeScript y en algunos frameworks.

### Bloques `static`

Un campo estático se inicializa con una sola expresión. Cuando la preparación de la clase necesita más (un bucle que rellena una tabla, un `try/catch`, varias variables temporales), se escribe en un **bloque `static { … }`**, que se ejecuta **una vez**, al evaluar la clase, con `this` apuntando a la clase:

[[exercise:07-bloques-static.md-]]

```text
  bloque static: 3 monedas registradas
tras definir la clase
$1299.00 MXN
¥1500 JPY
¿la misma instancia? → true
auditoría → 3750
```

El segundo uso del ejemplo es más sutil. Un bloque `static` está **dentro** de la clase, así que una función creada en él puede leer los privados. Asignándola a una variable de fuera, das acceso a un privado a **una** función concreta (aquí, una auditoría) y a nadie más; es lo que otros lenguajes llaman una función «amiga».

> **Desde Python:** el cuerpo de una clase de Python ya es código que se ejecuta una vez: puedes escribir un `for` ahí. El cuerpo de una clase de JavaScript solo admite declaraciones (campos, métodos, accesores); `static { }` es el sitio para el código.

## Comprobar la marca: `#x in obj`

Leer `other.#cents` cuando `other` **no** tiene ese campo privado no devuelve `undefined`, como pasaría con una propiedad normal: lanza un `TypeError`. Ocurre con un objeto parecido (el *duck typing* de la lección «Polimorfismo y protocolos») y también con uno que pasa `instanceof`, porque `instanceof` solo mira la cadena de prototipos: un objeto creado con `Object.create(Money.prototype)` hereda los métodos, pero nunca pasó por el constructor y no tiene los privados.

La comprobación correcta es el operador `in` con un nombre privado: `#cents in value` es `true` solo si `value` tiene el campo `#cents` de **esta** clase. Se llama comprobación de **marca** (*brand check*), porque solo la pasan los objetos que creó el constructor. Como todo lo privado, solo se puede escribir dentro de la clase, y lanza un error con primitivos, así que se combina con `typeof`:

[[exercise:08-comprobar-la-marca-con-in.md-]]

```text
dos NaiveMoney → true
🐛 objeto parecido → TypeError | Cannot read private member #cents from an object whose class did not declare it
🐛 impostor instanceof NaiveMoney → true
🐛 impostor → TypeError | Cannot read private member #cents from an object whose class did not declare it
✅ dos Money → true
✅ objeto parecido → false
✅ impostor → false
✅ número → false
```

## Los privados no son propiedades

Los campos privados no son propiedades del objeto: viven en un espacio aparte al que solo llega el código de la clase. Eso tiene consecuencias que sorprenden. `Object.freeze` congela las propiedades, pero un método puede seguir cambiando los privados de un objeto congelado. El spread, `Object.assign`, `JSON.stringify` y `structuredClone` solo copian propiedades, así que pierden los privados. Y una «copia» hecha con `Object.create(Clase.prototype)` tiene los métodos, pero falla en cuanto un método toca un privado:

[[exercise:09-los-privados-no-son-propiedades.md-]]

```text
🐛 ¿congelado? → true | label → visitas | value → 2
🐛 spread → {label: 'visitas'} | ¿tiene increment? → undefined
🐛 JSON → {"label":"visitas"}
copia → Counter {label: 'visitas'} | instanceof → true
🐛 clone.increment() → TypeError | Cannot read private member #value from an object whose class did not declare it
✅ original y copia → {"label":"me gusta","value":41} {"label":"me gusta","value":42}
```

La solución es que la clase, que sí ve sus privados, se encargue: un método `clone()` que crea otro objeto con `new` y un `toJSON()` que decide qué se guarda (lo viste en la lección «JSON y copias»). Para que un objeto con privados sea inmutable, no basta con congelarlo: no le des métodos que los cambien (lección «Patrones de diseño»).

## Bestiario

- **La validación que desaparece.**
  Síntoma: un setter no se ejecuta nunca; los valores se guardan sin validar ni normalizar, y la propiedad aparece como propia en `Object.keys`.
  Causa: un campo con el mismo nombre que el accesor crea una propiedad propia, que tapa al `get`/`set` del prototipo.
  Solución: guarda el dato en un campo con otro nombre (`#email`) y deja el nombre público solo para el accesor.
  → [ver ejemplo](05-campo-que-tapa-un-accesor.md)
- **El `TypeError` al leer el privado de otro objeto.**
  Síntoma: `Cannot read private member #cents from an object whose class did not declare it` en un método como `equals(other)`.
  Causa: `other` no tiene el campo privado (es un objeto parecido o un `Object.create(Clase.prototype)`), y `instanceof` no lo detecta.
  Solución: comprueba la marca con `#cents in other` antes de leerlo (tras comprobar que es un objeto).
  → [ver ejemplo](08-comprobar-la-marca-con-in.md)
- **El objeto congelado que cambia y la copia que pierde datos.**
  Síntoma: un objeto con `Object.freeze` sigue cambiando su estado; una copia con spread o JSON no tiene los datos privados, o sus métodos lanzan `TypeError`.
  Causa: los campos privados no son propiedades: `freeze`, el spread, `Object.assign`, JSON y `structuredClone` no los ven.
  Solución: copia con un método de la propia clase (`clone()`), serializa con `toJSON()` y logra la inmutabilidad sin métodos que cambien el estado.
  → [ver ejemplo](09-los-privados-no-son-propiedades.md)

## Resumen

- `#campo`, `#metodo()` y `get #accesor()` son privados de verdad: fuera de la clase, usarlos es un `SyntaxError`; la privacidad es por clase, no por objeto.
- `_x` es solo una convención, como en Python; el *name mangling* de `__x` tampoco protege. Un closure sí protege, pero no comparte métodos.
- `get`/`set` en una clase viven en el prototipo; el dato va en un campo privado con **otro** nombre.
- Un campo con el nombre de un accesor lo tapa: el setter deja de ejecutarse.
- `static` pone campos y métodos en la clase: constructores alternativos (`new this(…)`), utilidades y datos compartidos. Las instancias no los ven.
- `static { }` ejecuta código una vez al definir la clase y puede dar acceso a los privados a una función de fuera.
- `#x in obj` comprueba que un objeto tiene los privados de la clase; `instanceof` no lo garantiza.
- `freeze`, spread, JSON y `structuredClone` no ven los privados: la clase debe copiarse y serializarse a sí misma.

## Para profundizar

- [MDN: propiedades privadas (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
- [MDN: static](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes/static)
- [MDN: bloques de inicialización estática (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks)
- [javascript.info: propiedades y métodos privados y protegidos](https://es.javascript.info/private-protected-properties-methods)
- [V8: comprobación de marca con #x in obj (en inglés)](https://v8.dev/features/private-brand-checks)
