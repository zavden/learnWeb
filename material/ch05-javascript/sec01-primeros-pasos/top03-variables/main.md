# Variables: let, const y var

## Por qué importa

En Python una variable nace la primera vez que le asignas algo y vive hasta el final de su función. En JavaScript hay **tres** formas de declarar variables y cada una tiene reglas distintas sobre dónde existe la variable, desde cuándo y si se puede reasignar. Dos de ellas (`let` y `const`) son las modernas; la tercera (`var`) es la original de 1995 y está llena de sorpresas que todavía encontrarás en código antiguo y en respuestas de internet. Entender las tres te ahorrará errores muy difíciles de ver.

## Declarar antes de usar

La diferencia más visible con Python: en JavaScript una variable se **declara** con una palabra clave la primera vez, y después solo se asigna.

```python
lives = 3        # crea la variable
lives = 2        # la reasigna
```

```js
let lives = 3;   // declara y asigna
lives = 2;       // reasigna (sin let)
```

Hay dos partes que conviene distinguir, porque las tres palabras clave las tratan distinto:

- **Declaración**: el motor registra el nombre en un ámbito (`let lives`).
- **Inicialización/asignación**: el nombre recibe un valor (`= 3`).

## `let`: variables que cambian

`let` declara una variable que puedes reasignar tantas veces como quieras. Si la declaras sin valor, vale `undefined` hasta que le asignes uno. Como en Python, la variable no tiene tipo: el tipo es del valor.

[[exercise:01-let-se-puede-reasignar.md-]]

## `const`: variables que no se reasignan

`const` declara una variable que **no se puede reasignar** después de crearla. Exige un valor inicial y cualquier reasignación (`=`, `+=`, `++`…) lanza un `TypeError`:

[[exercise:02-const-no-se-reasigna.md-]]

La convención moderna es **`const` por defecto y `let` solo cuando vas a reasignar**. No es manía: cuando lees `const` sabes que ese nombre apunta siempre a lo mismo, y cuando lees `let` sabes que debes buscar dónde cambia.

### `const` no congela el valor

Aquí está la primera trampa. `const` protege la **variable** (a qué valor apunta), no el valor en sí. Si el valor es un objeto o un array, puedes cambiar su contenido todo lo que quieras:

```text
const user ─────────► { name: 'Ada', role: 'admin' }
            esta flecha        el contenido de la caja
            no se mueve        sí se puede modificar
```

[[exercise:03-const-no-congela-objetos.md-]]

> **Desde Python:** el modelo es el mismo que ya conoces. Un nombre de Python apunta a un objeto, y `user["role"] = "guest"` modifica ese objeto sin cambiar el nombre. `const` solo añade una regla: el nombre no puede pasar a apuntar a otro objeto. Para un objeto realmente inmutable (como una tupla) hace falta `Object.freeze`, que verás en el módulo «Objetos y prototipos».

## Ámbito de bloque

`let` y `const` tienen **ámbito de bloque**: solo existen entre las llaves `{ }` donde se declaran, ya sean de un `if`, de un `for` o un bloque suelto. Desde dentro del bloque se ven las variables de fuera; desde fuera, las de dentro no existen.

[[exercise:04-ambito-de-bloque.md-]]

> **Desde Python:** Python no tiene ámbito de bloque. Una variable creada dentro de un `if` o de un `for` sigue viva después (la variable del bucle conserva su último valor). En JavaScript, con `let` y `const`, desaparece al cerrar la llave. Es más estricto que Python, y es intencionado: cuanto menor es el ámbito de una variable, menos sitios pueden estropearla.

## `var`, la forma antigua

Hasta 2015 solo existía `var`. Sigue funcionando (la web no puede romper el código antiguo), pero tiene tres comportamientos que `let` y `const` corrigieron: ignora los bloques, se puede usar antes de su línea (vale `undefined`) y, en el nivel superior, se cuelga de `window`.

### Ámbito de función

`var` **ignora los bloques**. Su ámbito es la función que la contiene, o el script entero si está fuera de cualquier función. Una `var` declarada dentro de un `if` o de un `for` se «escapa» del bloque:

[[exercise:05-var-ignora-los-bloques.md-]]

Curiosamente, así funciona Python. El problema es que en JavaScript las llaves *parecen* un límite y `var` no lo respeta, lo que produce errores difíciles de ver (en el módulo «Funciones y ámbito» verás el más famoso: `var` en un bucle con temporizadores).

### Hoisting: la declaración «sube»

Antes de ejecutar un ámbito, el motor lo recorre entero y registra todas sus declaraciones `var` con el valor `undefined`. Es como si las declaraciones «subieran» (*hoisting*, elevación) al principio. La asignación, en cambio, se queda en su línea:

```js
console.log(score); // undefined
var score = 100;

// …se ejecuta como si fuera:
var score;
console.log(score); // undefined
score = 100;
```

Así que leer una `var` antes de su línea no da error: da `undefined`, que se propaga en silencio. La declaración sube incluso si está dentro de un `if` que nunca se ejecuta:

[[exercise:06-var-y-el-hoisting.md-]]

## La zona muerta temporal

¿`let` y `const` no se elevan? Sí se elevan, pero de otra manera: el motor registra el nombre al principio del bloque **sin inicializarlo**. Desde el inicio del bloque hasta la línea de la declaración, la variable está en la **zona muerta temporal** (*Temporal Dead Zone*, TDZ), y cualquier acceso lanza un `ReferenceError`:

```text
{                                  ← empieza el bloque: «level» ya existe, sin valor
  console.log(level);   ❌ TDZ     ← ReferenceError
  let level = 3;                   ← aquí se inicializa
  console.log(level);   ✅ 3
}
```

La prueba de que el nombre existe desde el principio del bloque es que **tapa** a una variable exterior con el mismo nombre antes incluso de llegar a su declaración. Y `typeof`, que nunca falla con nombres que no existen, sí falla dentro de la TDZ:

[[exercise:07-zona-muerta-temporal.md-]]

El error es una ventaja: con `var` el mismo descuido daba un `undefined` silencioso; con `let` el motor te avisa en la línea exacta.

> **Desde Python:** ya conoces este error con otro nombre. Si dentro de una función lees `color` y más abajo haces `color = "rojo"`, Python lanza `UnboundLocalError`: la asignación convierte `color` en local para **toda** la función, también para las líneas anteriores. La TDZ es la misma idea aplicada a cada bloque.

## Variables globales y `window`

Una variable declarada fuera de cualquier función o bloque es **global**: todo el código de la página la ve. Pero no todas las globales son iguales. En un script clásico, `var` (y `function`) de nivel superior crean además una **propiedad del objeto `window`**; `let` y `const` no:

[[exercise:08-var-se-cuelga-de-window.md-]]

El caso de `var name` es un clásico: `window.name` ya existe y siempre convierte lo que le asignas a texto, así que tu número se transforma en string sin avisar. Con `let` o `const` no ocurre, porque no tocan `window`.

### Globales implícitas y modo estricto

Lo más peligroso es asignar a un nombre que **no existe**. En un script clásico eso no da error: crea una variable global nueva. Basta una errata para que tu código escriba en una variable que nadie lee:

[[exercise:09-globales-implicitas.md-]]

El **modo estricto** (`'use strict'`) convierte ese descuido en un `ReferenceError`, entre otras mejoras. Se activa con la línea `'use strict';` al principio de un script o de una función, y está siempre activo en los módulos y en las clases. Los ejemplos de LearnWeb son scripts clásicos, así que aquí el descuido pasa sin aviso.

## ¿Cuál uso?

| | `const` | `let` | `var` |
|---|---|---|---|
| Se puede reasignar | no | sí | sí |
| Ámbito | bloque | bloque | función |
| Leer antes de su línea | `ReferenceError` (TDZ) | `ReferenceError` (TDZ) | `undefined` |
| Redeclarar en el mismo ámbito | `SyntaxError` | `SyntaxError` | permitido |
| En el nivel superior, ¿propiedad de `window`? | no | no | sí |

Regla práctica: **`const` siempre que puedas, `let` cuando necesites reasignar, `var` nunca** en código nuevo. Aprende `var` para poder leer código antiguo, no para escribirlo.

## Bestiario

- **El objeto «constante» que cambia.**
  Síntoma: `const user = {…}` y aun así `user.role = 'guest'` funciona.
  Causa: `const` impide reasignar la variable, no modificar el objeto al que apunta.
  Solución: si necesitas inmutabilidad, `Object.freeze(obj)` (superficial).
  → [ver ejemplo](03-const-no-congela-objetos.md)
- **La variable que se escapa del bloque.**
  Síntoma: una variable del `if` o el contador del `for` siguen existiendo después.
  Causa: `var` tiene ámbito de función, no de bloque.
  Solución: `let` o `const`.
  → [ver ejemplo](05-var-ignora-los-bloques.md)
- **`undefined` antes de tiempo.**
  Síntoma: usar una variable antes de su línea da `undefined` en lugar de un error.
  Causa: *hoisting* de `var` (la declaración sube con valor `undefined`).
  Solución: `let`/`const`, que lanzan `ReferenceError` en la TDZ.
  → [ver ejemplo](06-var-y-el-hoisting.md)
- **`Cannot access 'x' before initialization`.**
  Síntoma: `ReferenceError` aunque la variable existe (a veces fuera del bloque, con el mismo nombre).
  Causa: acceso dentro de la zona muerta temporal; una declaración interior tapa a la exterior en todo su bloque.
  Solución: declara antes de usar, y evita reutilizar el nombre de una variable exterior.
  → [ver ejemplo](07-zona-muerta-temporal.md)
- **El número que se convierte en texto.**
  Síntoma: `var name = 42` y `typeof name` es `'string'`.
  Causa: `var` de nivel superior escribe en `window.name`, que solo guarda texto.
  Solución: `let`/`const`, que no tocan `window`.
  → [ver ejemplo](08-var-se-cuelga-de-window.md)
- **La errata que crea una variable.**
  Síntoma: el valor «no se guarda» y aparece una global con nombre parecido.
  Causa: asignar a un nombre sin declarar crea una global implícita.
  Solución: modo estricto (`'use strict'`), módulos, y un editor con linter.
  → [ver ejemplo](09-globales-implicitas.md)

## Resumen

- En JavaScript las variables se declaran: `const` (no reasignable) o `let` (reasignable).
- `const` protege la variable, no el contenido del objeto al que apunta.
- `let` y `const` tienen ámbito de bloque; Python no tiene ámbito de bloque.
- `var` tiene ámbito de función, se eleva con valor `undefined` y, en el nivel superior, se cuelga de `window`.
- `let` y `const` también se elevan, pero quedan en la zona muerta temporal hasta su línea: `ReferenceError`.
- Asignar a un nombre sin declarar crea una global implícita; el modo estricto lo impide.
- Regla: `const` > `let` > nunca `var`.

## Para profundizar

- [MDN: let](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/const)
- [MDN: hoisting (glosario)](https://developer.mozilla.org/es/docs/Glossary/Hoisting)
- [javascript.info: variables](https://es.javascript.info/variables) y [el viejo «var»](https://es.javascript.info/var)
- [MDN: modo estricto](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Strict_mode)
