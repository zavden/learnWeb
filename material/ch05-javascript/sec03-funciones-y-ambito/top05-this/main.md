# La palabra clave this

## Por qué importa

En la lección «Objetos literales» viste que, dentro de un método, `this` es el objeto que está a la izquierda del punto, como el `self` de Python. Esa frase es cierta, pero incompleta. En Python, `self` es un **parámetro**: se declara, se recibe y no cambia. En JavaScript, `this` es una palabra clave **implícita** cuyo valor se decide **en cada llamada**, según **cómo** se llame a la función, no según dónde esté escrita.

De ahí sale uno de los errores más frecuentes del lenguaje: sacar un método de su objeto (para pasarlo como callback, guardarlo en una variable o dárselo a un temporizador) y que `this` deje de ser el objeto. Esta lección da las cuatro reglas que deciden `this`, la excepción de las flechas y el papel del modo estricto, para que puedas predecir su valor en cualquier línea.

## Cuatro reglas y una excepción

El valor de `this` dentro de una función depende de la forma de la **llamada**:

| Forma de la llamada | `this` vale | Regla |
|---------------------|-------------|-------|
| `f()` | `undefined` en modo estricto; `window` en modo no estricto | llamada simple |
| `obj.f()` | `obj` | método |
| `new F()` | el objeto recién creado | `new` |
| `f.call(x)`, `f.apply(x)`, `f.bind(x)()` | `x` | explícito |
| una flecha, se llame como se llame | el `this` del sitio donde está escrita | excepción |

Las secciones siguientes las ven una a una. Lo importante es la idea de fondo: **la misma función** puede recibir un `this` distinto en cada llamada.

## Regla 1: la llamada simple

Una llamada sin nada delante, `f()`, no aporta ningún objeto. Qué vale `this` entonces depende del **modo estricto**:

- En modo **no estricto** (los scripts clásicos, como los ejemplos de LearnWeb), `this` es el objeto global, `window`.
- En modo **estricto** (`'use strict'` al principio de un script o de una función; siempre en módulos y clases), `this` es `undefined`.

[[exercise:01-llamada-simple.md-]]

La versión estricta es la buena: si una función que usa `this` se llama por error sin objeto, el fallo aparece en el acto (`Cannot read properties of undefined`), en lugar de leer y escribir en silencio propiedades de `window`. En el código moderno, que se escribe en módulos, es lo que verás siempre.

## Regla 2: la llamada como método

En `obj.metodo()`, `this` es el objeto que hay **justo a la izquierda del punto** en esa llamada (o de los corchetes: `obj['metodo']()`). Si hay varios puntos, cuenta solo el último objeto: en `company.offices.main.describe()`, `this` es `company.offices.main`.

[[exercise:02-this-en-metodos.md-]]

Fíjate en lo que demuestra el ejemplo: la función `describeOffice` no pertenece a ningún objeto. Es un valor guardado en dos propiedades, y en cada llamada recibe el objeto que la invoca. Por eso un método puede usar otros métodos del mismo objeto con `this.otroMetodo()`.

### Perder `this` al separar el método

Aquí está la trampa. `cart.add` (sin paréntesis) es **la función a secas**: no lleva el objeto pegado. En cuanto la guardas en una variable, la pasas como callback o se la das a `setTimeout`, quien la llame lo hará como llamada simple, y `this` dejará de ser `cart`:

```js
const add = cart.add;
add('Plato');                       // llamada simple → this es window (o undefined)
['Vaso'].forEach(cart.add);         // forEach llama a la función sin objeto
setTimeout(user.greet, 100);        // el temporizador también
```

Según el método, el resultado es un `TypeError` (`Cannot read properties of undefined (reading 'push')`) o, peor, un fallo silencioso: `Hola, undefined`.

[[exercise:03-perder-this-en-un-callback.md-]]

Hay dos soluciones, y las dos son habituales:

- Una **flecha** que llama al método con su punto: `forEach((product) => cart.add(product))`.
- **`bind`**, que crea una copia de la función con `this` fijado: `setTimeout(user.greet.bind(user), 300)`.

> **Desde Python:** en Python, `f = obj.method` produce un *bound method*, un objeto que recuerda su `self`, así que `f()` funciona y puedes pasar `obj.method` como callback sin pensar. En JavaScript no existe ese enlace automático: el equivalente al *bound method* hay que crearlo a mano con `bind` o con una flecha.

## Regla 3: la llamada con `new`

`new F(…)` crea un objeto nuevo y vacío, llama a `F` con `this` apuntando a ese objeto y, si `F` no devuelve otro objeto, devuelve `this`. Una función pensada para usarse así se llama **función constructora**, y por convención su nombre empieza por mayúscula (`Product`, como `Date` o `Map`):

[[exercise:04-new-con-una-funcion-constructora.md-]]

Qué hace `new` paso a paso, el papel de `prototype` y cómo comparten métodos los objetos creados así se estudian en el módulo «Objetos y prototipos»; aquí solo importa que, con `new`, `this` es el objeto nuevo. Las flechas no pueden ser constructoras: `new` con una flecha lanza `TypeError: … is not a constructor`.

> **Desde Python:** `new Product('Lámpara', 2400)` es lo que hace Python al llamar a una clase: crea la instancia y ejecuta `__init__(self, …)` sobre ella. En JavaScript, el `self` se llama `this`, no se declara y hace falta escribir `new`.

### Olvidar `new`

Si llamas a una función constructora **sin** `new`, es una llamada simple. En modo no estricto, `this` es `window`: la función escribe sus propiedades como **variables globales** y devuelve `undefined`. El error real aparece mucho más tarde, al usar el resultado. En modo estricto, `this` es `undefined` y la primera asignación lanza un `TypeError` en la línea exacta:

[[exercise:08-olvidar-new.md-]]

Es el mejor ejemplo de por qué conviene el modo estricto. Las clases (módulo «Clases y POO») resuelven el problema de raíz: llamarlas sin `new` siempre lanza un error.

## Regla 4: `this` explícito con `call`, `apply` y `bind`

Toda función tiene tres métodos para elegir su `this`:

| Método | ¿Llama a la función? | Argumentos | Devuelve |
|--------|----------------------|------------|----------|
| `f.call(obj, a, b)` | sí, ahora | sueltos | el resultado |
| `f.apply(obj, [a, b])` | sí, ahora | en un array | el resultado |
| `f.bind(obj, a)` | no | los que fijes se añaden delante | una función nueva |

[[exercise:05-call-apply-y-bind.md-]]

Una función creada con `bind` queda atada **para siempre**: ni `call`, ni otro `bind`, ni llamarla como método cambian su `this`. Y `bind` puede fijar también los primeros argumentos, una técnica (la aplicación parcial) que verás en la lección siguiente.

## Las flechas no tienen `this`

Las funciones flecha no tienen `this` propio. Dentro de una flecha, `this` se busca como cualquier otra variable: en el ámbito donde la flecha está **escrita** (ámbito léxico). `call`, `apply` y `bind` no pueden cambiarlo.

Eso las convierte en el callback perfecto **dentro de un método**: la flecha ve el `this` del método, que es el objeto. Una `function` tradicional en el mismo sitio tiene su propio `this`, y como `forEach` la llama como llamada simple, lo pierde:

[[exercise:06-flechas-heredan-this.md-]]

```text
  ✅ PED-0042 · Café con leche: 180 cts
  ✅ PED-0042 · Tostada: 250 cts
  🐛 undefined · Café con leche: 180 cts
  🐛 undefined · Tostada: 250 cts
```

En código anterior a 2015 verás los apaños que había antes de las flechas: guardar `const self = this` antes del callback, o pasar `this` como segundo argumento de `forEach`.

### Una flecha como método

La otra cara de la misma regla: una flecha **no sirve como método**. Si escribes `increment: () => { this.count += 1; }` dentro de un objeto literal, `this` no es el objeto: las llaves de un objeto literal no crean ningún ámbito, así que la flecha toma el `this` de fuera (en el nivel superior de un script clásico, `window`). El método no toca el objeto y crea una variable global con `NaN`:

[[exercise:07-flecha-como-metodo.md-]]

La regla práctica que resume la lección cabe en dos líneas:

- **Métodos** de un objeto: sintaxis de método, `increment() { … }`. Su `this` es el objeto.
- **Callbacks dentro de un método**: flechas. Su `this` es el del método.

## Qué regla gana

Cuando se combinan varias formas, gana la más específica. Una flecha ignora todas; `new` gana incluso a `bind`; `bind` gana a la llamada como método. Para averiguar el `this` de una llamada cualquiera, hazte estas preguntas en orden:

```text
¿Es una flecha?                    → el this del sitio donde está escrita
¿Se llama con new?                 → el objeto recién creado
¿Es una función atada con bind,
 o se llama con call / apply?      → el objeto indicado
¿Se llama como obj.f()?            → obj
Si no                              → undefined (estricto) o window (no estricto)
```

[[exercise:09-que-regla-gana.md-]]

## Bestiario

- **El método que olvida su objeto.**
  Síntoma: `Cannot read properties of undefined` dentro de un método, o un `undefined` en el texto, solo cuando el método se pasa como callback o a `setTimeout`.
  Causa: `obj.metodo` sin llamar es la función a secas; quien la llama lo hace como llamada simple.
  Solución: una flecha `() => obj.metodo()` o `obj.metodo.bind(obj)`.
  → [ver ejemplo](03-perder-this-en-un-callback.md)
- **El contador que da `NaN` y no cuenta.**
  Síntoma: un método escrito como flecha no modifica el objeto, y aparece una variable global.
  Causa: las flechas no tienen `this` propio; toman el de fuera del objeto literal (`window`).
  Solución: sintaxis de método, `increment() { … }`.
  → [ver ejemplo](07-flecha-como-metodo.md)
- **El objeto que sale `undefined` y las globales que aparecen de la nada.**
  Síntoma: `const lamp = Product(…)` vale `undefined` y `window.title` existe.
  Causa: sin `new`, la función constructora se ejecuta como llamada simple y `this` es `window`.
  Solución: escribe `new`; con `'use strict'` el olvido lanza un error en esa misma línea.
  → [ver ejemplo](08-olvidar-new.md)

## Resumen

- `this` no depende de dónde está escrita la función, sino de cómo se la llama.
- Llamada simple: `undefined` en modo estricto, `window` en modo no estricto.
- `obj.f()`: `this` es `obj`. Al separar el método del objeto, se pierde; arréglalo con una flecha o `bind`.
- `new F()`: `this` es el objeto nuevo (detalles en el módulo «Objetos y prototipos»).
- `call` y `apply` llaman con el `this` que elijas; `bind` devuelve una función atada para siempre.
- Las flechas usan el `this` de fuera: ideales como callbacks dentro de métodos, inútiles como métodos.
- El modo estricto convierte los descuidos con `this` en errores inmediatos.

## Para profundizar

- [MDN: this](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/this)
- [MDN: Function.prototype.bind](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
- [javascript.info: métodos del objeto, «this»](https://es.javascript.info/object-methods)
- [javascript.info: enlazar funciones (bind)](https://es.javascript.info/bind)
- [MDN: modo estricto](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Strict_mode)
