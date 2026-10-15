# Ámbito y hoisting

## Por qué importa

Cada vez que escribes un nombre (`total`, `formatPrice`, `currency`), el motor tiene que averiguar **a qué variable se refiere**. Las reglas que usa para eso se llaman **ámbito** (*scope*), y casi siempre coinciden con tu intuición. Los problemas aparecen en los bordes: una función que lee la variable equivocada, una asignación que modifica algo de fuera sin querer, una variable que «tapa» a una función o una llamada que funciona antes de su línea con una forma de función y falla con otra.

En la lección «Variables» viste el ámbito de bloque, el `var` y la zona muerta temporal. Aquí se añaden las funciones: cada función crea un ámbito, las funciones anidadas forman una **cadena de ámbitos** y las declaraciones de función se **elevan** (*hoisting*) de una forma distinta a las variables. Todo esto es la base de la lección siguiente, los closures.

## Qué es un ámbito

Un **ámbito** es la zona del programa donde un nombre existe. En JavaScript hay cuatro tipos:

| Ámbito | Lo crea | Contiene |
|--------|---------|----------|
| Global | el script | lo declarado fuera de toda función y bloque |
| De módulo | cada archivo `type="module"` | lo declarado en el nivel superior del módulo (módulo «Módulos y organización») |
| De función | cada llamada a una función | parámetros, `var`, `let`, `const` y funciones declaradas dentro |
| De bloque | cada `{ }` (`if`, `for`, bloque suelto) | solo `let`, `const` y `class` |

Desde un ámbito se ven las variables de los ámbitos que lo **contienen**, nunca las de los que están dentro de él. Y cada **llamada** crea un ámbito nuevo: dos llamadas a la misma función no comparten sus variables locales.

## Ámbito léxico

¿Qué variables ve una función? Las del sitio donde está **escrita**, no las del sitio desde donde se **llama**. Por eso se llama ámbito **léxico** (de *léxico*, el texto del programa): mirando el código, sin ejecutarlo, ya sabes a qué variable se refiere cada nombre.

[[exercise:01-ambito-lexico.md-]]

En el ejemplo, `formatPrice` usa la `currency` global aunque se llame desde una función que tiene su propia `currency`. Si una función necesita un dato de quien la llama, la forma correcta de dárselo es un **parámetro**.

> **Desde Python:** es la misma regla. Python busca los nombres con la regla LEGB (*Local, Enclosing, Global, Built-in*), que es exactamente la cadena de ámbitos de la siguiente sección. La diferencia es que Python no tiene ámbito de bloque.

## La cadena de ámbitos

Las funciones se pueden anidar. Cuando el motor encuentra un nombre, lo busca en el ámbito actual; si no está, en el ámbito que lo contiene; y así, eslabón a eslabón, hasta el global. Si no aparece en ninguno, lanza `ReferenceError: x is not defined`.

```text
ámbito global ............ storeName
  └ createInvoice ........ customer, invoiceNumber
      └ formatLine ....... product, cents, price

Buscar storeName desde formatLine:    formatLine ✗ → createInvoice ✗ → global ✓
Buscar couponCents desde applyCoupon: applyCoupon ✗ → global ✗ → ReferenceError
```

La búsqueda va siempre **de dentro hacia fuera** y se detiene en el primer eslabón que tiene el nombre. Desde fuera no se ve nada de lo que hay dentro: `formatLine` e `invoiceNumber` no existen en el ámbito global.

[[exercise:02-cadena-de-ambitos.md-]]

## Asignar variables de fuera: sin `global` ni `nonlocal`

En Python, asignar una variable dentro de una función la convierte en **local**, y para modificar una de fuera hay que declararlo con `global` o `nonlocal`. JavaScript usa la regla contraria, y es puramente sintáctica:

- Con `let`, `const` o `var` delante, creas una variable **nueva** en el ámbito actual.
- Sin nada delante, asignas a la variable que encuentre la cadena de ámbitos.

[[exercise:03-sin-global-ni-nonlocal.md-]]

```python
visits = 0
def register_visit():
    global visits          # sin esto: UnboundLocalError
    visits += 1
```

```js
let visits = 0;
function registerVisit() {
  visits += 1;             // modifica la de fuera directamente
}
```

### El `let` olvidado

La regla de JavaScript tiene una cara peligrosa: si dentro de una función **olvidas** el `let` de una variable de trabajo, y fuera existe otra con el mismo nombre, no creas una local: **reasignas la de fuera**. El modo estricto no te salva, porque solo protege de asignar a nombres que no existen; aquí el nombre existe y la asignación es perfectamente legal.

[[exercise:04-olvidar-let-pisa-la-de-fuera.md-]]

```text
  A-1: 2850 → total del día 5700
  A-2: 3000 → total del día 6000
🐛 total del día → 6000 (esperado: 5850)
```

La defensa es una costumbre: declara **siempre** las variables de trabajo dentro de la función que las usa, y evita que las funciones dependan de variables globales que se modifican. Mejor aún, que reciban lo que necesitan por parámetro y devuelvan el resultado.

## Sombreado

Si declaras en un ámbito interior una variable con el **mismo nombre** que una exterior, la interior **tapa** (*shadows*) a la exterior dentro de su ámbito. La exterior sigue existiendo, intacta. Los parámetros también sombrean: en `function applyDiscount(price)`, `price` es el parámetro aunque fuera haya una constante `price`.

[[exercise:05-sombreado.md-]]

El sombreado es legal y a veces cómodo, pero obliga a quien lee a preguntarse cuál de las variables es cada una. Muchos equipos lo limitan con una regla de *linter* (`no-shadow`).

### La variable que tapa a la función

Hay un caso de sombreado que produce un error desconcertante. Una variable declarada con `const` o `let` existe **en todo su bloque**, desde la llave que lo abre, aunque no tenga valor hasta su línea (la zona muerta temporal de la lección «Variables»). Así que esta línea falla:

```js
function printReceipt(items) {
  const total = total(items); // ReferenceError: Cannot access 'total' before initialization
}
```

La `const total` tapa a la función `total` de fuera en todo el cuerpo de `printReceipt`, y en el momento de llamarla, la variable aún está en la zona muerta temporal. Con `var`, el error cambia a `total is not a function`, porque la variable local existe y vale `undefined`.

[[exercise:06-variable-que-tapa-la-funcion.md-]]

La solución es de nombres: un **verbo** para la función (`calculateTotal`) y un **sustantivo** para el dato (`total`).

> **Desde Python:** el mismo código en Python lanza `UnboundLocalError: cannot access local variable 'total' where it is not associated with a value`, por la misma razón: la asignación convierte `total` en local para toda la función.

## Hoisting: el motor lee antes de ejecutar

Antes de ejecutar un ámbito (el script, o cada llamada a una función), el motor lo recorre y **registra todas sus declaraciones**. Cada tipo de declaración se registra de una forma distinta, y eso decide qué pasa si usas el nombre antes de su línea:

| Declaración | Qué se registra al empezar el ámbito | Usarla antes de su línea |
|-------------|--------------------------------------|--------------------------|
| `function f() {}` | el nombre **y la función entera** | funciona |
| `var x = …` | el nombre, con `undefined` | `undefined` (y si la llamas, `x is not a function`) |
| `let x = …`, `const x = …` | el nombre, **sin inicializar** | `ReferenceError` (zona muerta temporal) |
| `class C {}` | el nombre, sin inicializar | `ReferenceError` (módulo «Clases y POO») |

A esto se le llama *hoisting* (elevación), porque el efecto es como si las declaraciones «subieran» al principio de su ámbito.

### Las declaraciones de función se elevan enteras

Como una declaración de función se registra con su cuerpo, puedes **llamarla antes de su línea**. Mucha gente aprovecha esto para organizar los scripts como un periódico: arriba, el código principal (`main()`) que cuenta la historia; abajo, las funciones auxiliares con los detalles.

[[exercise:07-hoisting-de-funciones.md-]]

> **Desde Python:** `def` es una sentencia que se ejecuta cuando el intérprete llega a ella, así que llamar a una función antes de su `def` lanza `NameError`. Por eso en Python el `main()` va al final del archivo. En JavaScript, con declaraciones, el orden no importa.

### Las expresiones de función no

Una expresión de función o una flecha guardada en una variable **es un valor**, y la variable sigue las reglas de su `const`, `let` o `var`. Antes de su línea, una flecha en una `const` lanza `ReferenceError`, y una expresión en una `var` lanza `TypeError: x is not a function` (la variable existe, pero vale `undefined`).

[[exercise:08-expresion-antes-de-su-linea.md-]]

Fíjate en la última parte del ejemplo: lo que importa es **cuándo se ejecuta** la llamada, no dónde está escrita. Una función puede usar una `const` que está más abajo en el texto, siempre que se llame después de que esa línea se haya ejecutado. Por eso los callbacks y los manejadores de eventos casi nunca tienen este problema.

Un consejo más: no declares funciones con `function` dentro de un `if` o de otro bloque. En modo no estricto, su comportamiento depende de reglas de compatibilidad antiguas que cambian según el caso. Si necesitas una función dentro de un bloque, usa `const f = (…) => …`.

## IIFE: una función para crear un ámbito

Hasta 2015 no existían `let` ni `const`, y `var` ignoraba los bloques. La única forma de tener variables privadas que no contaminaran el ámbito global era meterlas en una función… y llamarla en el acto. Es la **IIFE** (*Immediately Invoked Function Expression*):

```js
(function () {
  var widgetVersion = '2.4.1'; // privada: no llega a window
})();
```

Los paréntesis que envuelven la función la convierten en una **expresión** (una línea que empieza por `function` sería una declaración y no se podría llamar así), y el `()` final la ejecuta. Hoy, para crear un ámbito privado basta un bloque con `let`/`const` o un módulo, pero la IIFE sigue siendo útil para calcular el valor de una `const` con varias sentencias:

[[exercise:09-iife.md-]]

## Bestiario

- **El acumulador que se vuelve loco.**
  Síntoma: un total global da un resultado imposible después de llamar a una función auxiliar.
  Causa: la función asigna `total = 0` sin `let`, y eso reasigna la variable de fuera con ese nombre; el modo estricto no lo detecta.
  Solución: declara siempre las variables de trabajo dentro de la función (`let sum = 0`) y evita globales mutables.
  → [ver ejemplo](04-olvidar-let-pisa-la-de-fuera.md)
- **`Cannot access 'total' before initialization` al llamar a una función.**
  Síntoma: `const total = total(items)` lanza `ReferenceError` (o `total is not a function` con `var`).
  Causa: la variable local tapa a la función de fuera en todo el bloque y aún no está inicializada.
  Solución: nombres distintos: verbo para la función, sustantivo para el dato.
  → [ver ejemplo](06-variable-que-tapa-la-funcion.md)
- **La flecha que no se puede llamar antes de su línea.**
  Síntoma: al pasar de `function f()` a `const f = () =>`, una llamada que funcionaba lanza `ReferenceError`; con `var`, `f is not a function`.
  Causa: solo las declaraciones de función se elevan enteras; las expresiones son valores que llegan al ejecutar su línea.
  Solución: llama a la función después de su definición, o usa una declaración.
  → [ver ejemplo](08-expresion-antes-de-su-linea.md)

## Resumen

- Hay ámbito global, de módulo, de función (cada llamada crea uno) y de bloque (`let`/`const`).
- El ámbito es léxico: una función ve las variables del sitio donde está escrita, no las de quien la llama.
- Los nombres se buscan de dentro hacia fuera por la cadena de ámbitos; si no aparecen, `ReferenceError`.
- Sin `let`/`const`/`var`, una asignación modifica la variable de fuera: no hacen falta `global` ni `nonlocal`, y olvidar el `let` pisa variables ajenas.
- Una declaración interior con el mismo nombre sombrea a la exterior en todo su bloque.
- Las declaraciones de función se elevan enteras; `var` se eleva con `undefined`; `let`/`const` quedan en la zona muerta temporal.
- La IIFE `(function () { … })()` crea un ámbito al instante; hoy basta un bloque o un módulo.

## Para profundizar

- [MDN: ámbito (glosario)](https://developer.mozilla.org/es/docs/Glossary/Scope)
- [MDN: hoisting (glosario)](https://developer.mozilla.org/es/docs/Glossary/Hoisting)
- [javascript.info: ámbito de variable y closures](https://es.javascript.info/closure)
- [MDN: IIFE (glosario)](https://developer.mozilla.org/es/docs/Glossary/IIFE)
- [ESLint: regla no-shadow](https://eslint.org/docs/latest/rules/no-shadow)
