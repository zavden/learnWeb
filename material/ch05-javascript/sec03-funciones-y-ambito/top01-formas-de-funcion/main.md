# Formas de función

## Por qué importa

Llevas dos módulos usando funciones «de prestado»: la sintaxis básica `function nombre() { … }` y las flechas de los callbacks de `map`. En JavaScript las funciones son el material con el que se construye todo lo demás: los callbacks, los manejadores de eventos, los closures y, por debajo, también las clases. Y hay **tres formas** de escribirlas, con diferencias reales entre ellas.

En Python tienes `def` para casi todo y `lambda` para funciones de una línea. En JavaScript, la forma más corta (la flecha) puede tener varias líneas, y eso trae dos errores clásicos: olvidar el `return` dentro de unas llaves y querer devolver un objeto que el motor confunde con un bloque. Esta lección enseña las tres formas, cuándo usar cada una y esos dos errores.

## Declaración de función

La **declaración de función** es la forma clásica y el equivalente directo de `def`: la palabra `function`, un nombre, los parámetros entre paréntesis y el cuerpo entre llaves.

```python
def shipping_cents(total_cents):
    if total_cents >= 5000:
        return 0
    return 495
```

```js
function shippingCents(totalCents) {
  if (totalCents >= 5000) return 0;
  return 495;
}
```

`return` termina la función y devuelve un valor. Si la función acaba sin `return`, o con un `return;` a secas, devuelve `undefined`, el `None` de JavaScript. Toda función es además un valor con propiedades: `name` (su nombre) y `length` (cuántos parámetros declara).

[[exercise:01-declaracion-de-funcion.md-]]

> **Desde Python:** no hay indentación significativa ni `:`; el cuerpo va entre llaves. Y recuerda la trampa de la lección «Sintaxis frente a Python»: si partes la línea justo después de `return`, la inserción automática de `;` hace que la función devuelva `undefined`.

## Expresión de función

La palabra `function` también puede aparecer donde se espera un **valor**: a la derecha de un `=`, como argumento de otra función, dentro de un array… Eso es una **expresión de función**. Normalmente no lleva nombre (es *anónima*) y se guarda en una variable:

```js
const toCelsius = function (fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
};
```

Aunque sea anónima, el motor le pone como `name` el nombre de la variable, que es lo que verás en los mensajes de error. Si le das un nombre propio (`function digits(n) { … }`), ese nombre solo existe **dentro** de la función: sirve para que se llame a sí misma y para que las trazas de error sean más claras.

[[exercise:02-expresion-de-funcion.md-]]

Hay una diferencia práctica con la declaración: una declaración se puede llamar **antes** de su línea, y una expresión guardada en una `const` no. La razón es el *hoisting*, que tiene su propia lección («Ámbito y hoisting»).

## Funciones flecha

Las **funciones flecha** (*arrow functions*, 2015) son la forma corta de escribir una expresión de función: `(parámetros) => cuerpo`. Tienen dos variantes, y la diferencia entre ellas es la fuente de los errores de esta lección:

| Variante | Ejemplo | ¿Qué devuelve? |
|----------|---------|----------------|
| Cuerpo de **expresión** (sin llaves) | `(a, b) => a + b` | el valor de la expresión: *return implícito* |
| Cuerpo de **bloque** (con llaves) | `(a, b) => { const sum = a + b; return sum; }` | lo que diga `return`; sin `return`, `undefined` |
| Sin parámetros | `() => 'Hola'` | `'Hola'` |
| Un parámetro | `(x) => x * 2` (o `x => x * 2`) | el doble |

Con cuerpo de expresión, una flecha es una `lambda` de Python. Con cuerpo de bloque es mucho más: admite varias sentencias, variables y bucles, todo lo que admite un `def`. En el curso escribimos siempre los paréntesis del parámetro, aunque sea uno solo, porque así todas las flechas se leen igual.

[[exercise:03-funciones-flecha.md-]]

### Llaves significan bloque: hace falta `return`

En cuanto pones llaves después de `=>`, el return implícito desaparece. Es el error más frecuente al pasar de una flecha de una línea a una de varias: añades las llaves para meter un `console.log`, olvidas el `return` y el `map` empieza a devolver `undefined`. Con `filter` es todavía peor, porque `undefined` es *falsy* y se descartan todos los elementos sin ningún mensaje:

[[exercise:04-flecha-con-llaves-sin-return.md-]]

```text
🐛 map sin return → [undefined, undefined, undefined]
🐛 filter sin return → []
✅ con return → [1452, 545, 3630]
```

### Devolver un objeto: entre paréntesis

El segundo error viene del mismo sitio. Si quieres que una flecha devuelva un objeto literal y escribes `(city) => { label: city }`, el motor ve una llave después de `=>` y la interpreta como el **inicio de un bloque**, no como un objeto. Dentro de ese bloque, `label:` es una *etiqueta* (las de `break` y `continue` que viste en «Control de flujo») y `city` una expresión que se evalúa y se tira. La función devuelve `undefined`:

```text
(city) => { label: city }        ← bloque { etiqueta label: + expresión city } → undefined
(city) => ({ label: city })      ← los paréntesis obligan a leer un objeto → { label: 'Lima' }
```

La solución es envolver el objeto entre **paréntesis**, `(x) => ({ … })`, o usar un cuerpo de bloque con `return`. Con dos o más propiedades, la versión sin paréntesis ni siquiera llega a ejecutarse: es un `SyntaxError`.

[[exercise:05-flecha-que-devuelve-un-objeto.md-]]

> **Desde Python:** `lambda city: {"label": city}` funciona porque en Python las llaves siempre crean un `dict` (o un `set`). En JavaScript, las llaves después de `=>` significan bloque salvo que las protejas con paréntesis.

### Lo que las flechas no tienen

Las flechas no son solo una abreviatura. Les faltan tres cosas que tienen las funciones con `function`, y cada una tiene su lección:

| | `function` | flecha |
|---|---|---|
| `this` propio | sí: depende de cómo se llama | no: usa el de fuera («La palabra clave this») |
| `arguments` | sí | no: usa el de fuera («Parámetros») |
| Se puede usar con `new` | sí | no: `TypeError` («La palabra clave this») |

Esas carencias son, casi siempre, una ventaja: hacen que las flechas sean perfectas como callbacks dentro de métodos. Lo verás en la lección «La palabra clave this».

## Funciones como valores

En JavaScript, como en Python, las funciones son **valores de primera clase**: se asignan a variables, se guardan en objetos y arrays, se pasan como argumentos y se devuelven desde otras funciones. El nombre de una función sin paréntesis es la función; con paréntesis, es el **resultado** de llamarla.

Un uso muy práctico es la **tabla de despacho**: un objeto cuyas propiedades son funciones, que sustituye a un `switch` largo. Otro es una lista de reglas, donde cada regla es una función que se aplica en orden:

[[exercise:06-funciones-como-valores.md-]]

> **Desde Python:** es exactamente un `dict` de funciones (`{"add": operator.add, …}`) o una lista de funciones. La única diferencia es sintáctica: en JavaScript accedes con `operations[name]` o `operations.add`.

## Callbacks

Un **callback** es una función que pasas a otra para que **ella** la llame cuando toque. Ya los usas: el comparador de `toSorted` o la función de `map` son callbacks. Puedes escribir tus propias funciones que reciban callbacks; quien recibe el callback decide **cuándo** se llama y **con qué argumentos** (por eso `forEach` te da el elemento, el índice y el array).

[[exercise:07-callbacks.md-]]

El mismo mecanismo sirve para decir «llámame cuando pase algo»: cuando el usuario haga clic (capítulo 6), cuando venza un temporizador o cuando llegue una respuesta del servidor (módulo «Asincronía y event loop»).

### Pasa la función, no su resultado

Un callback se pasa **sin paréntesis**. Con paréntesis, la función se ejecuta en ese momento y lo que pasas es su resultado. Según lo que devuelva, obtendrás un error que apunta al sitio equivocado (dentro de la función, llamada sin argumentos), un `TypeError` del tipo `… is not a function` o, con `setTimeout`, ningún error en absoluto: la función se ejecuta antes de tiempo y el temporizador no hace nada.

[[exercise:08-llamar-en-vez-de-pasar.md-]]

Si necesitas pasar argumentos fijos, envuelve la llamada en una flecha: `words.map((word) => shout(word + '!'))`.

## ¿Qué forma uso?

| Situación | Forma recomendada |
|-----------|-------------------|
| Funciones con nombre del programa (`calculateTotal`, `renderList`) | declaración `function` |
| Callbacks cortos (`map`, `filter`, `toSorted`, eventos) | flecha con cuerpo de expresión |
| Callbacks de varias líneas | flecha con cuerpo de bloque (y `return`) |
| Métodos de un objeto | sintaxis de método `name() { … }` (lección «La palabra clave this») |
| Una función que se llama a sí misma desde una variable | expresión de función con nombre |

En el código moderno verás muchas veces `const calculateTotal = (items) => { … }` en lugar de una declaración. Funciona, y es cuestión de estilo; lo importante es saber qué cambia (el *hoisting* y `this`), que es lo que estudian las próximas lecciones.

## Bestiario

- **El `map` que devuelve `[undefined, undefined, …]`.**
  Síntoma: después de añadir llaves a una flecha, `map` devuelve `undefined` y `filter` un array vacío.
  Causa: con llaves, el cuerpo es un bloque y no hay return implícito.
  Solución: escribe `return`, o quita las llaves si el cuerpo es una sola expresión.
  → [ver ejemplo](04-flecha-con-llaves-sin-return.md)
- **La flecha que debía devolver un objeto devuelve `undefined`.**
  Síntoma: `(city) => { label: city }` da `undefined`; con dos propiedades, `SyntaxError`.
  Causa: la llave tras `=>` abre un bloque, y `label:` se lee como una etiqueta.
  Solución: envuelve el objeto entre paréntesis: `(city) => ({ label: city })`.
  → [ver ejemplo](05-flecha-que-devuelve-un-objeto.md)
- **El callback que se ejecuta antes de tiempo.**
  Síntoma: `map(f())` lanza un error dentro de `f` o `… is not a function`; `setTimeout(f(), 300)` ejecuta `f` al instante y no hace nada después.
  Causa: con paréntesis se pasa el resultado de la llamada, no la función.
  Solución: pasa `f` sin paréntesis, o una flecha `() => f(argumento)`.
  → [ver ejemplo](08-llamar-en-vez-de-pasar.md)

## Resumen

- Declaración (`function f() {}`), expresión (`const f = function () {}`) y flecha (`const f = () => …`) crean funciones; sin `return`, devuelven `undefined`.
- Las expresiones toman el `name` de su variable; el nombre propio de una expresión solo existe dentro de ella.
- Flecha sin llaves: devuelve la expresión (como `lambda`). Con llaves: es un bloque y necesita `return`.
- Para devolver un objeto desde una flecha: `(x) => ({ … })`.
- Las flechas no tienen `this` ni `arguments` propios y no se usan con `new`.
- Las funciones son valores: se guardan en variables, objetos y arrays, y se pasan como callbacks sin paréntesis.

## Para profundizar

- [MDN: funciones](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Functions)
- [MDN: funciones flecha](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [javascript.info: expresiones de función](https://es.javascript.info/function-expressions)
- [javascript.info: funciones flecha, lo básico](https://es.javascript.info/arrow-functions-basics)
