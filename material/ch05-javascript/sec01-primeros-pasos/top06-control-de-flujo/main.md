# Control de flujo

## Por qué importa

Las estructuras de control (condiciones y bucles) son las mismas ideas que en Python, con otra ropa: paréntesis alrededor de la condición, llaves en lugar de indentación y un `for` de tres partes en lugar de `range()`. Pero hay tres trampas que Python no te deja cometer y que todo el mundo pisa alguna vez: el `=` que asigna dentro de un `if`, el `switch` que sigue ejecutando casos que no coinciden y el `for…in`, que con arrays no hace lo que su nombre sugiere.

## `if`, `else if`, `else`

La estructura es la de Python con tres cambios de forma: la condición va entre paréntesis, el bloque va entre llaves y `elif` se escribe `else if`. La condición se convierte a booleano con las reglas de truthy y falsy de la lección anterior.

[[exercise:01-if-else-if.md-]]

Si el bloque no debe hacer nada, se deja vacío: `{}` es el `pass` de Python.

### `=` en lugar de `===`

Un error de tecleo con consecuencias: escribir `=` (asignar) donde querías `===` (comparar). En JavaScript una asignación es una **expresión** que devuelve el valor asignado, así que `if (attempts = 3)` asigna `3` y después evalúa `3`, que es truthy: el `if` entra siempre. Con un valor falsy (`if (level = 0)`) no entra nunca. En ambos casos, además, la variable queda machacada:

[[exercise:02-asignacion-en-la-condicion.md-]]

> **Desde Python:** Python convierte este descuido en un `SyntaxError` (`Maybe you meant '==' or ':='`). Para asignar dentro de una condición a propósito exige el operador morsa `:=`. JavaScript no distingue los dos casos; solo un linter (ESLint, regla `no-cond-assign`) te avisa.

## `switch`

`switch` compara un valor con una lista de casos. Cuando encuentra uno que coincide, empieza a ejecutar a partir de ese `case`; `break` termina el `switch`, y `default` se ejecuta si ningún caso coincide. La comparación es **estricta** (`===`): un `'1'` que llega de un formulario no coincide con `case 1`.

[[exercise:03-switch.md-]]

> **Desde Python:** el `match` de Python 3.10 se parece en la forma, pero es mucho más potente (desestructura listas, diccionarios y clases) y cada `case` termina solo. El `switch` de JavaScript solo compara con `===` y, como verás ahora, no termina solo.

### El `case` que no termina: *fallthrough*

`switch` no es una lista de alternativas, sino una lista de **puntos de entrada**. Cuando un `case` coincide, la ejecución entra en ese punto y sigue hacia abajo, atravesando los `case` siguientes **sin volver a comprobarlos**, hasta encontrar un `break` (o el final del `switch`):

```text
switch (level)        level = 'plata'
  case 'oro':          ✗ no coincide, se salta
  case 'plata':   ←── entra aquí
    …10 %              ✓ se ejecuta
  case 'bronce':       (no se comprueba)
    …envío gratis      ✓ se ejecuta también   🐛
  default:
    …puntos            ✓ y esto               🐛
```

[[exercise:04-switch-fallthrough.md-]]

Este comportamiento viene de C, de 1972. Su único uso legítimo frecuente es **agrupar** varios casos vacíos seguidos que comparten código (`case 'sábado': case 'domingo':`). Si alguna vez lo usas a propósito con código entre medias, deja un comentario `// sigue al siguiente case` para que nadie lo «arregle».

## Bucles

### El `for` de tres partes

El `for` clásico tiene tres partes separadas por `;`: **inicio** (una vez, antes de empezar), **condición** (antes de cada vuelta) y **actualización** (después de cada vuelta). Es el equivalente directo de `for i in range(…)`:

| Python | JavaScript |
|--------|------------|
| `for i in range(5):` | `for (let i = 0; i < 5; i++) {` |
| `for i in range(2, 10, 3):` | `for (let i = 2; i < 10; i += 3) {` |
| `for i in range(3, 0, -1):` | `for (let i = 3; i > 0; i--) {` |
| `for i in range(len(items)):` | `for (let i = 0; i < items.length; i++) {` |

[[exercise:05-for-clasico.md-]]

Usa `let` para el contador. Con `let`, cada vuelta tiene su propia copia de `i` (esto será importante en la lección de *closures*); con `var`, el contador se escapa del bucle, como viste en la lección de variables.

### `while` y `do…while`

`while` es idéntico al de Python. `do…while` es nuevo: comprueba la condición **al final** de cada vuelta, así que el cuerpo se ejecuta al menos una vez, aunque la condición sea falsa desde el principio:

[[exercise:06-while-y-do-while.md-]]

### `for…of` y `for…in`

Para recorrer los elementos de un array (o de un string, un `Map`, un `Set`…) usa **`for…of`**: es el `for x in lista` de Python. Existe otro bucle con un nombre engañosamente parecido, **`for…in`**, que recorre los **nombres de las propiedades** de un objeto:

[[exercise:07-for-of-frente-a-for-in.md-]]

Con un array, `for…in` te da los índices **como strings** (`'0'`, `'1'`…, así que `key + 1` concatena), incluye cualquier propiedad extra que tenga el array y, en código antiguo, hasta métodos añadidos a `Array.prototype`. Regla: **`for…of` para arrays; `for…in` solo para objetos** (y aun así, en el módulo «Números, texto y colecciones» verás `Object.entries`, que suele ser mejor).

> **Desde Python:** la palabra `in` te juega una mala pasada. En Python, `for x in lista` da valores y `for k in dict` da claves. En JavaScript, `for…of` da valores y `for…in` da claves, sea cual sea el objeto. ¿Y el `enumerate` de Python? Se escribe así: `for (const [i, item] of items.entries()) { … }` (la sintaxis `[i, item]` es *desestructuración* y la verás con los arrays).

### `break`, `continue` y etiquetas

`break` sale del bucle y `continue` salta a la vuelta siguiente, igual que en Python. Ambos afectan solo al bucle **más interno**. Para salir de dos bucles anidados a la vez, JavaScript permite poner una **etiqueta** al bucle exterior (`search: for (…)`) y escribir `break search` o `continue search`:

[[exercise:08-break-continue-y-etiquetas.md-]]

Python no tiene etiquetas (ni `do…while`); a cambio tiene `for…else`, que JavaScript no tiene. Las etiquetas son poco frecuentes: si necesitas una, a menudo el código queda más claro extrayendo los bucles a una función y usando `return`.

## Bucles infinitos y la guarda de LearnWeb

Un bucle cuya condición nunca se vuelve falsa no termina jamás. En Python lo cortarías con Ctrl+C. En el navegador es peor: JavaScript se ejecuta en **un solo hilo** compartido con el dibujado de la página, y un script no se interrumpe hasta que termina. Mientras el bucle gira, la pestaña no puede pintar, ni responder a clics, ni ejecutar ningún otro código. Al cabo de unos segundos, Chrome ofrece cerrar la página.

LearnWeb vuelve a ejecutar tu código cada vez que paras de escribir, así que un bucle a medio escribir (`while (true) {` sin terminar la condición, por ejemplo) podría congelar la aplicación entera. Para evitarlo, **LearnWeb** inserta una guarda en cada bucle: si un bucle tiene la página ocupada más de ~1,2 segundos, lo detiene con un `RangeError: Possible infinite loop at line N` y marca la línea en el editor.

[[exercise:09-bucle-infinito-y-la-guarda.md-]]

Ten claras tres cosas sobre la guarda:

- **No es JavaScript.** Fuera de LearnWeb, ese bucle congela la pestaña y no aparece ningún error.
- Como es un `RangeError` normal, un `try/catch` alrededor del bucle lo atraparía.
- Si un ejemplo necesita de verdad un cálculo largo, se puede desactivar con `loop_protect: false` en la cabecera del ejemplo (y entonces la responsabilidad vuelve a ser tuya).

En el módulo «Asincronía y event loop» entenderás por qué un script largo bloquea la página y cómo trocear el trabajo para que no lo haga.

## Chuleta: de Python a JavaScript

| Python | JavaScript |
|--------|------------|
| `if c:` / `elif c:` / `else:` | `if (c) {` / `} else if (c) {` / `} else {` |
| `pass` | `{}` (bloque vacío) |
| `match x:` / `case 1:` | `switch (x) {` / `case 1: … break;` |
| `for x in items:` | `for (const x of items) {` |
| `for k in d:` | `for (const k in obj) {` (o `Object.keys(obj)`) |
| `for i, x in enumerate(items):` | `for (const [i, x] of items.entries()) {` |
| `for i in range(n):` | `for (let i = 0; i < n; i++) {` |
| `while c:` | `while (c) {` |
| — | `do { … } while (c);` |
| `for … else:` | — (variable auxiliar o función con `return`) |
| `break` / `continue` | `break` / `continue` (y con etiqueta: `break outer`) |
| `if (n := len(a)) > 3:` | `const n = a.length; if (n > 3) {` |

## Bestiario

- **El `if` que siempre (o nunca) entra.**
  Síntoma: un `if` entra aunque la condición «debería» ser falsa, y la variable comparada cambia de valor.
  Causa: `=` asigna; la asignación devuelve el valor asignado, que se evalúa como truthy o falsy.
  Solución: compara con `===`; activa un linter que avise de asignaciones en condiciones.
  → [ver ejemplo](02-asignacion-en-la-condicion.md)
- **El `switch` que ejecuta de más.**
  Síntoma: además del caso correcto, se ejecutan los de debajo.
  Causa: *fallthrough*: sin `break`, la ejecución atraviesa los `case` siguientes sin comprobarlos.
  Solución: `break` al final de cada `case` (o `return` si el `switch` está en una función).
  → [ver ejemplo](04-switch-fallthrough.md)
- **El `case` que nunca coincide.**
  Síntoma: `switch ('1')` cae en `default` aunque existe `case 1`.
  Causa: `switch` compara con `===`.
  Solución: convierte antes: `switch (Number(choice))`.
  → [ver ejemplo](03-switch.md)
- **`for…in` con arrays.**
  Síntoma: los índices son strings (`'0' + 1` → `'01'`) y aparecen propiedades que no son elementos.
  Causa: `for…in` recorre nombres de propiedades enumerables, no valores.
  Solución: `for…of` (y `entries()` si necesitas el índice).
  → [ver ejemplo](07-for-of-frente-a-for-in.md)
- **La página congelada.**
  Síntoma: el ejemplo tarda ~1,2 s y aparece `RangeError: Possible infinite loop`.
  Causa: un bucle cuya condición nunca se vuelve falsa; LearnWeb lo detiene (un navegador normal no).
  Solución: revisa la condición y la actualización del contador.
  → [ver ejemplo](09-bucle-infinito-y-la-guarda.md)

## Resumen

- `if (condición) { … } else if (…) { … } else { … }`; la condición se convierte a booleano.
- `=` asigna y `===` compara: un `=` dentro de un `if` no da error, pero rompe la lógica.
- `switch` compara con `===` y, sin `break`, sigue ejecutando los `case` siguientes.
- `for (inicio; condición; actualización)` sustituye a `range()`; usa `let` para el contador.
- `do…while` se ejecuta al menos una vez.
- `for…of` recorre valores; `for…in` recorre claves (como strings): no lo uses con arrays.
- `break` y `continue` afectan al bucle más interno; con etiquetas, a uno exterior.
- La guarda de bucles infinitos es una ayuda de LearnWeb, no de JavaScript.

## Para profundizar

- [MDN: control de flujo y manejo de errores](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN: bucles e iteración](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Loops_and_iteration)
- [MDN: switch](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/switch)
- [javascript.info: bucles while y for](https://es.javascript.info/while-for)
