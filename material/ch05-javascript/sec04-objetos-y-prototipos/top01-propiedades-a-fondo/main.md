# Propiedades a fondo

## Por qué importa

Hasta ahora has tratado una propiedad como un par clave → valor. Es una buena primera aproximación, pero deja sin explicar cosas que ya has visto: por qué `Math.PI = 3` no hace nada (y tampoco avisa), por qué `Object.keys` de un array no incluye `length`, por qué la consola enseña algunas propiedades como `(...)` y cómo funciona el `Object.freeze` que los módulos anteriores dejaron pendiente.

La respuesta es que cada propiedad lleva, además de su valor, unos **atributos** que deciden si se puede cambiar, si aparece al recorrer el objeto y si se puede borrar. Esta lección los estudia uno a uno, junto con las propiedades que no guardan un valor sino que lo calculan (*getters* y *setters*) y las tres formas de bloquear un objeto. Es la base del resto del módulo: los prototipos que vienen después son objetos normales, y los métodos que heredan todos los objetos son propiedades con atributos muy concretos.

## Dos clases de propiedades

Hay dos clases de propiedades, y cada una tiene cuatro atributos:

| Clase | Atributos propios | Atributos comunes |
|-------|-------------------|-------------------|
| **De datos** (*data property*): guarda un valor | `value`, `writable` | `enumerable`, `configurable` |
| **De acceso** (*accessor property*): ejecuta funciones | `get`, `set` | `enumerable`, `configurable` |

Qué controla cada atributo:

- `writable`: si una asignación (`obj.x = …`) puede cambiar el valor.
- `enumerable`: si la propiedad aparece al **recorrer** el objeto (`Object.keys`, `for…in`, `JSON.stringify`, el spread).
- `configurable`: si la propiedad se puede **borrar** con `delete` y si sus atributos se pueden cambiar.
- `get` y `set`: las funciones que se ejecutan al leer y al asignar una propiedad de acceso.

El conjunto de atributos de una propiedad se llama **descriptor**, y `Object.getOwnPropertyDescriptor(obj, clave)` lo devuelve como un objeto normal:

[[exercise:01-descriptores.md-]]

```text
book.title → {value: 'Rayuela', writable: true, enumerable: true, configurable: true}
Math.PI → {value: 3.141592653589793, writable: false, enumerable: false, configurable: false}
scores.length → {value: 3, writable: true, enumerable: false, configurable: false}
Object.keys(scores) → (3) ['0', '1', '2']
```

Las propiedades que creas tú con un literal o con una asignación tienen los tres atributos a `true`: se pueden cambiar, se ven y se pueden borrar. Las que trae el lenguaje suelen estar más cerradas. Fíjate también en las dos últimas líneas del ejemplo: una propiedad heredada, como `toString`, no tiene descriptor **propio**. De dónde sale lo verás en la lección siguiente.

> **Desde Python:** `vars(obj)` (o `obj.__dict__`) te da los valores de los atributos de una instancia, pero un atributo de Python no lleva interruptores propios. Lo «especial» (solo lectura, valores calculados) vive en la **clase**, con `@property` y otros descriptores. En JavaScript cada propiedad de cada objeto lleva sus propios atributos.

Una nota sobre la consola, que en este módulo usarás mucho: los objetos se **expanden** con un clic, tanto en el diálogo que abre «▶ Run» desde la teoría como en la consola del editor («Open in editor»). Al expandirlos verás en gris las propiedades no enumerables, los getters como `(...)` y, desde la lección siguiente, `[[Prototype]]`.

## Crear propiedades con `defineProperty`

`Object.defineProperty(obj, clave, descriptor)` crea una propiedad (o modifica una que ya existe) eligiendo sus atributos. `Object.defineProperties(obj, { clave: descriptor, … })` hace lo mismo con varias a la vez. La trampa está en los valores por defecto, que son los contrarios a los de un literal:

| Forma de crear la propiedad | `writable` | `enumerable` | `configurable` |
|-----------------------------|------------|--------------|----------------|
| `{ x: 1 }` u `obj.x = 1` | `true` | `true` | `true` |
| `Object.defineProperty(obj, 'x', { value: 1 })` | `false` | `false` | `false` |

Con `defineProperty`, todo lo que no indicas vale `false`. Una propiedad creada solo con `value` es de solo lectura, invisible al recorrer el objeto y no se puede borrar:

[[exercise:02-define-property.md-]]

Si la propiedad ya existe, `defineProperty` solo cambia los atributos que indicas y respeta los demás. Es la forma de convertir una propiedad normal en una de solo lectura: `Object.defineProperty(order, 'customer', { writable: false })`.

### Escrituras que fallan en silencio

¿Qué pasa si asignas a una propiedad con `writable: false`? Depende del modo. En un script clásico (modo no estricto, como los ejemplos de LearnWeb) la asignación **no hace nada y no avisa**. En modo estricto lanza un `TypeError` en esa misma línea:

[[exercise:03-asignaciones-que-fallan-en-silencio.md-]]

```text
🐛 invoice.number → F-2026-0187
🐛 Math.PI → 3.141592653589793
✅ estricto → TypeError | Cannot assign to read only property 'number' of object '#<Object>'
```

Es la misma idea que viste con `this` en la lección «La palabra clave this»: el modo estricto convierte los descuidos silenciosos en errores donde nacen. Ocurre con todas las escrituras prohibidas de esta lección (propiedades de solo lectura, getters sin setter, objetos congelados), y los módulos y las clases son siempre estrictos. En los ejemplos verás el comportamiento silencioso porque son scripts clásicos; en tu código moderno verás el error.

> **Desde Python:** Python nunca falla en silencio aquí: asignar a una `property` sin *setter* lanza `AttributeError`, y a un `@dataclass(frozen=True)`, `FrozenInstanceError`. JavaScript solo se comporta así en modo estricto.

## `enumerable`: lo que se recorre

Una propiedad con `enumerable: false` existe y se lee normalmente, pero **no aparece al recorrer** el objeto. Lo respetan todas las operaciones que recorren propiedades:

| Operación | ¿Incluye las no enumerables? |
|-----------|------------------------------|
| `obj.x`, `obj['x']`, `'x' in obj` | sí: la propiedad existe |
| `Object.keys/values/entries`, `for…in` | no |
| `JSON.stringify`, `{ ...obj }`, `Object.assign` | no |
| `Object.getOwnPropertyNames(obj)` | sí: lista todas las claves propias de texto |
| la vista previa de la consola | no; al expandir el objeto, aparecen en gris |

El ejemplo guarda un dato auxiliar de un usuario como no enumerable y lo busca con cada una de esas operaciones:

[[exercise:04-enumerable.md-]]

No es privacidad: cualquiera que conozca el nombre puede leer la propiedad. Sirve para que los recorridos, las copias y el JSON ignoren datos auxiliares. Así están hechas `length` en los arrays y todos los métodos que heredan los objetos (`toString`, `map`…): por eso un `for…in` sobre un array no recorre `map`.

## `configurable`: una puerta de un solo sentido

Con `configurable: false`, la propiedad ya no se puede borrar (`delete` devuelve `false`, o lanza `TypeError` en modo estricto) y sus atributos ya no se pueden cambiar, con una excepción: `writable` puede pasar de `true` a `false`, porque eso solo «cierra más». No hay vuelta atrás: una propiedad no configurable lo es para siempre.

[[exercise:05-configurable.md-]]

El final del ejemplo enlaza con la lección «Variables»: un `var` en el nivel superior de un script crea una propiedad de `window`, y la crea con `configurable: false`. Por eso `delete window.appVersion` no funciona. En la práctica rara vez necesitarás `configurable: false` en tu código, pero lo encontrarás en muchas propiedades del lenguaje.

## Getters y setters

Una propiedad de **acceso** no guarda un valor: ejecuta una función al leerla (`get`) y otra al asignarla (`set`). Desde fuera se usa como cualquier propiedad, sin paréntesis. Sirven para tres cosas: propiedades **calculadas** que siempre están al día (`fahrenheit` a partir de `celsius`), **validar** antes de guardar, y propiedades de **solo lectura** (un `get` sin `set`).

En un literal se escriben con `get` y `set` delante del nombre; con `defineProperty`, con las claves `get` y `set` del descriptor:

[[exercise:06-getters-y-setters.md-]]

La consola no ejecuta los getters por su cuenta, porque leer una propiedad de acceso ejecuta código (que podría tener efectos o lanzar un error). Los enseña como `(...)`: `thermostat → {_celsius: 23.5, celsius: (...), fahrenheit: (...)}`. En la consola, `(...)` es un botón; al pulsarlo se ejecuta el getter y aparece el valor. Es lo mismo que hace Chrome.

> **Desde Python:** es exactamente `@property` (y `@celsius.setter` para el `set`). La diferencia es dónde vive: en Python la `property` es un descriptor de la **clase**; en un objeto literal de JavaScript, el getter es una propiedad del propio objeto. Las clases de JavaScript (módulo «Clases y POO») los ponen en el prototipo, como Python en la clase.

```python
class Thermostat:
    def __init__(self):
        self._celsius = 21

    @property
    def fahrenheit(self):
        return self._celsius * 9 / 5 + 32
```

```js
const thermostat = {
  _celsius: 21,
  get fahrenheit() {
    return this._celsius * 9 / 5 + 32;
  },
};
```

### El setter que se llama a sí mismo

Un error clásico al escribir el primer setter: guardar el valor en la **misma** propiedad. `this.email = …` dentro de `set email` es otra asignación a `email`, que vuelve a llamar al setter, que vuelve a asignar… hasta que la pila se llena (lección «Recursión y pila de llamadas»):

[[exercise:07-setter-que-se-llama-a-si-mismo.md-]]

```text
🐛 set → RangeError | Maximum call stack size exceeded
🐛 get → RangeError | Maximum call stack size exceeded
✅ con _email → lucia.perez@example.com
✅ con closure → lucia.perez@example.com
```

El dato tiene que vivir en otro sitio: en otra propiedad (`_email`, por convención «interna») o en una variable de un closure, que además es privada de verdad. Las clases tienen una tercera opción, los campos `#privados`, que verás en el módulo «Clases y POO».

### Copiar un objeto que tiene getters

El spread, `Object.assign`, `structuredClone` y `JSON.stringify` **leen** cada propiedad. Al leer un getter, lo ejecutan, y lo que guardan en la copia es el **resultado**: un valor fijo que ya no se recalcula.

[[exercise:08-el-spread-ejecuta-los-getters.md-]]

Para copiar las propiedades con sus atributos (getters incluidos) hay que copiar los **descriptores**: `Object.defineProperties({}, Object.getOwnPropertyDescriptors(obj))`. En la práctica, esta situación aparece sobre todo con objetos que mezclan datos y lógica; si separas los datos (que se copian) de las funciones que los calculan, el problema desaparece.

## Bloquear objetos: `preventExtensions`, `seal` y `freeze`

Además de los atributos de cada propiedad, cada objeto tiene un interruptor propio: si **admite propiedades nuevas** (si es *extensible*). Sobre esas dos piezas se construyen tres niveles de bloqueo, cada uno más estricto que el anterior:

| Función | Añadir | Borrar | Cambiar valores | Qué hace por dentro | Comprobación |
|---------|--------|--------|-----------------|---------------------|--------------|
| `Object.preventExtensions(obj)` | ❌ | ✅ | ✅ | objeto no extensible | `Object.isExtensible` |
| `Object.seal(obj)` | ❌ | ❌ | ✅ | lo anterior + `configurable: false` en todas | `Object.isSealed` |
| `Object.freeze(obj)` | ❌ | ❌ | ❌ | lo anterior + `writable: false` en todas | `Object.isFrozen` |

El ejemplo prueba las tres operaciones sobre cada nivel y muestra el resultado en una tabla:

[[exercise:09-freeze-seal-y-preventextensions.md-]]

Los tres bloqueos son **definitivos** (no existe «descongelar») y devuelven el mismo objeto, así que se pueden aplicar al crearlo: `const ROLES = Object.freeze(['lector', 'editor', 'admin'])`. Fíjate en la última línea del ejemplo: una asignación prohibida falla en silencio en un script clásico, pero los métodos que mutan, como `push`, lanzan `TypeError` siempre, porque están definidos para fallar con error.

Recuerda la diferencia con `const`, de la lección «Variables»: `const` protege la **variable** (no puede apuntar a otro objeto); `freeze` protege el **objeto** (sus propiedades no cambian). Son independientes y se combinan.

> **Desde Python:** `freeze` se parece a `@dataclass(frozen=True)` o a convertir una `list` en `tuple`; `seal` recuerda a `__slots__`, que impide añadir atributos nuevos pero deja cambiar los existentes. `types.MappingProxyType` da una vista de solo lectura de un `dict`, sin equivalente directo en JavaScript.

### `freeze` es superficial

`Object.freeze` congela las propiedades **del objeto que recibe**, y nada más. Si una propiedad contiene otro objeto o un array, la propiedad ya no puede apuntar a otro sitio, pero el objeto interior es independiente y sigue abierto:

```text
settings (congelado) ─ theme: 'dark'
                     ├ notifications ──► { email: true, push: false }   (abierto)
                     └ languages ──────► ['es', 'en']                   (abierto)
```

El ejemplo lo comprueba y después congela un objeto entero con una función recursiva:

[[exercise:10-freeze-es-superficial.md-]]

```text
settings.theme → dark
🐛 settings.notifications → {email: true, push: true}
🐛 settings.languages → (3) ['es', 'en', 'pt']
isFrozen(settings) → true
isFrozen(settings.notifications) → false
```

Es la misma historia que la copia superficial del spread (lección «Objetos literales»): las operaciones sobre objetos trabajan en un nivel. Para congelar un árbol entero hace falta recorrerlo, y la función `deepFreeze` del ejemplo lo hace con recursión: congela el objeto y luego llama a `deepFreeze` sobre cada propiedad. Congela primero y recorre después, para que un objeto que se contiene a sí mismo no provoque una recursión infinita.

¿Cuándo congelar? Para **constantes** y configuraciones que no deben cambiar nunca (tablas de tarifas, listas de roles, textos de la interfaz), sobre todo si se comparten entre varias partes del programa. Para el estado que cambia con el tiempo, sigue valiendo la disciplina de la lección «Funciones de orden superior»: no mutar, crear versiones nuevas. Congelar en desarrollo es además una buena red de seguridad: si algo intenta mutar un dato «inmutable», el modo estricto te lo dirá.

> **Desde Python:** el problema es el mismo con una tupla que contiene una lista, `(1, [2, 3])`, o con un `@dataclass(frozen=True)` que tiene un campo `list`: el contenedor no cambia, pero la lista de dentro sí.

## Bestiario

- **La asignación que no hace nada.**
  Síntoma: `obj.x = valor` no da ningún error, pero `obj.x` conserva el valor anterior.
  Causa: la propiedad tiene `writable: false`, es un getter sin setter o el objeto está congelado; en modo no estricto, la escritura se ignora en silencio.
  Solución: modo estricto (`'use strict'`, módulos, clases) para que el error aparezca en esa línea; revisa el descriptor con `Object.getOwnPropertyDescriptor`.
  → [ver ejemplo](03-asignaciones-que-fallan-en-silencio.md)
- **El setter que llena la pila.**
  Síntoma: `RangeError: Maximum call stack size exceeded` al asignar o leer una propiedad con getter o setter.
  Causa: el setter asigna a su propia propiedad (o el getter la lee), y se llama a sí mismo sin fin.
  Solución: guarda el dato en otra propiedad (`_email`) o en una variable de un closure.
  → [ver ejemplo](07-setter-que-se-llama-a-si-mismo.md)
- **La copia cuyo total ya no se actualiza.**
  Síntoma: tras `{ ...obj }`, una propiedad calculada de la copia se queda con un valor fijo.
  Causa: el spread (y `Object.assign`, `structuredClone`, JSON) ejecuta el getter y copia su resultado.
  Solución: copia los descriptores con `Object.defineProperties({}, Object.getOwnPropertyDescriptors(obj))`.
  → [ver ejemplo](08-el-spread-ejecuta-los-getters.md)
- **El objeto congelado que sí cambia.**
  Síntoma: tras `Object.freeze(settings)`, `settings.notifications.push = true` funciona.
  Causa: `freeze` es superficial; los objetos y arrays anidados siguen abiertos.
  Solución: congela en profundidad con una función recursiva (`deepFreeze`).
  → [ver ejemplo](10-freeze-es-superficial.md)

## Resumen

- Cada propiedad tiene un descriptor: `value` y `writable` (de datos) o `get` y `set` (de acceso), más `enumerable` y `configurable`.
- Las propiedades de un literal tienen todo a `true`; las creadas con `defineProperty`, lo que no indiques a `false`.
- Las escrituras prohibidas fallan en silencio en modo no estricto y lanzan `TypeError` en modo estricto.
- `enumerable: false` oculta la propiedad de los recorridos, las copias y el JSON, pero no la hace privada.
- `configurable: false` impide borrar y reconfigurar, y es definitivo.
- Los getters calculan al leer y los setters validan al asignar; guarda el dato en otra propiedad o en un closure.
- `preventExtensions` ⊂ `seal` ⊂ `freeze`; los tres son definitivos y superficiales.

## Para profundizar

- [MDN: Object.defineProperty](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [javascript.info: indicadores y descriptores de propiedad](https://es.javascript.info/property-descriptors)
- [javascript.info: getters y setters](https://es.javascript.info/property-accessors)
- [MDN: Object.freeze](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
- [MDN: enumerabilidad y posesión de propiedades](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)
