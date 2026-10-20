# Sintaxis frente a Python

## Por qué importa

JavaScript y Python se parecen más de lo que aparentan: los dos son dinámicos, interpretados, con funciones como valores y con listas y diccionarios (arrays y objetos) a mano. La mayor parte de lo que ya sabes se traslada casi palabra por palabra. Lo que cambia es la **forma**: llaves en lugar de indentación, punto y coma, otras convenciones de nombres… y un puñado de detalles que, si los traes de Python, fallan en silencio. Esta lección es el mapa de esas diferencias.

## Un programa pequeño, lado a lado

Antes de entrar en reglas, mira un programa completo. Cada línea lleva al lado su equivalente en Python:

[[exercise:01-python-lado-a-lado.md-]]

No te preocupes por los detalles: `const`/`let`, las funciones, los arrays, los objetos, `for…of` y las plantillas `` `${}` `` tienen sus propias lecciones. Desde ahora los usaremos en los ejemplos con este nivel básico. La tabla resume las equivalencias más frecuentes:

| Python | JavaScript | Dónde se estudia |
|--------|------------|------------------|
| `print(x)` | `console.log(x)` | lección 1 |
| `# comentario` | `// comentario` | esta lección |
| `x = 5` | `let x = 5;` o `const x = 5;` | lección 3 |
| `True`, `False`, `None` | `true`, `false`, `null` (y `undefined`) | lección 4 |
| `and`, `or`, `not` | `&&`, `\|\|`, `!` | lección 5 |
| `x if c else y` | `c ? x : y` | lección 5 |
| `elif` | `else if` | lección 6 |
| `for x in items:` | `for (const x of items) { … }` | lección 6 |
| `for i in range(5):` | `for (let i = 0; i < 5; i++) { … }` | lección 6 |
| `raise` / `except` | `throw` / `catch` | lección 7 |
| `f"Hola {name}"` | `` `Hola ${name}` `` | módulo «Números, texto y colecciones» |
| `len(s)` | `s.length` | módulo «Números, texto y colecciones» |
| `[1, 2]` (lista) | `[1, 2]` (array) | módulo «Números, texto y colecciones» |
| `{"a": 1}` (dict) | `{ a: 1 }` (objeto) | módulo «Números, texto y colecciones» |
| `def f(x):` | `function f(x) { … }` | módulo «Funciones y ámbito» |
| `7 // 2` | `Math.floor(7 / 2)` | esta lección |

## Bloques: llaves, no indentación

En Python la indentación **es** la sintaxis: el bloque de un `if` termina cuando vuelves a la columna anterior. En JavaScript los bloques se delimitan con llaves `{ }` y la indentación es solo una cortesía para quien lee. Además, la condición de `if`, `while` o `for` va siempre entre paréntesis.

```python
if temperature > 30:
    print("Hace calor")
else:
    print("Temperatura agradable")
```

```js
if (temperature > 30) {
  console.log('Hace calor');
} else {
  console.log('Temperatura agradable');
}
```

El ejemplo lo comprueba, incluso con una indentación desastrosa:

[[exercise:02-bloques-con-llaves.md-]]

El último caso del ejemplo es una trampa clásica: un `if` sin llaves controla **una sola** sentencia, y la indentación de la siguiente no significa nada. Escribe siempre las llaves.

> **Desde Python:** los dos puntos `:` del final de línea desaparecen. `if x > 3:` se convierte en `if (x > 3) {`, y el bloque termina con `}` en lugar de con una línea menos indentada.

## Sentencias y punto y coma

Una **sentencia** es una orden completa: declarar una variable, llamar a una función, un `if`… En Python cada línea es una sentencia salvo que haya un paréntesis abierto. En JavaScript las sentencias terminan con `;`, y los saltos de línea son, en principio, espacio en blanco.

[[exercise:03-punto-y-coma-y-asi.md-]]

### ASI: el punto y coma automático

Si omites el `;`, el motor aplica la **inserción automática de punto y coma** (*Automatic Semicolon Insertion*, ASI). Sus reglas, simplificadas:

1. Al encontrar un salto de línea, el motor intenta **continuar** la sentencia con la línea siguiente. Solo inserta `;` si la continuación sería un error de sintaxis.
2. Excepción: después de `return`, `break`, `continue`, `throw` y `yield`, un salto de línea **siempre** termina la sentencia.
3. También se inserta antes de `}` y al final del archivo.

> **Desde Python:** Python une líneas solo cuando hay un paréntesis abierto. JavaScript las une **siempre que puede**. Esa diferencia explica los dos fallos siguientes.

### Un `return` que devuelve `undefined`

La regla 2 provoca el error más famoso de ASI. Si pones la llave del objeto en la línea siguiente al `return` (un estilo frecuente en otros lenguajes), la función termina en el `return` vacío:

[[exercise:04-return-y-salto-de-linea.md-]]

Lo peor es que no hay error: el objeto de abajo se interpreta como un bloque de código inalcanzable. La función simplemente devuelve `undefined`.

### Una línea que se pega a la anterior

La regla 1 provoca el fallo contrario: una línea que empieza por `(` o `[` puede continuar la anterior, así que el motor **no** inserta el `;`. El resultado puede ser un `TypeError` desconcertante… o un valor equivocado sin ningún aviso:

[[exercise:05-linea-que-empieza-por-parentesis.md-]]

Las líneas que empiezan por `` ` `` (plantilla), `+`, `-` o `/` tienen el mismo riesgo. En este curso escribimos siempre `;` y los editores con formateador (Prettier, por ejemplo) lo hacen por ti.

## Comentarios

JavaScript tiene comentarios de línea (`//`), de bloque (`/* … */`) y de documentación (`/** … */`, formato JSDoc), que cumplen el papel de los docstrings:

[[exercise:06-comentarios.md-]]

> **Desde Python:** un docstring es un string de verdad que existe en tiempo de ejecución (`f.__doc__`). Un comentario JSDoc lo leen el editor y las herramientas, pero el motor lo descarta.

### `//` no es la división entera

Para quien viene de Python hay una trampa cruel: `//` es la división entera en Python y el **inicio de un comentario** en JavaScript. `7 // 2` no da error: vale `7`, porque `// 2` se ignora.

[[exercise:07-division-entera-es-un-comentario.md-]]

JavaScript no tiene operador de división entera. Para imitar el `//` de Python usa `Math.floor(a / b)`, que redondea hacia abajo también con negativos. `Math.trunc` corta los decimales y con negativos da otro resultado.

## Nombres

Las reglas para nombrar variables son casi las de Python (letras, dígitos, `_`, sin empezar por dígito), con dos añadidos: `$` también cuenta como letra y hay más palabras reservadas (`let`, `const`, `var`, `function`, `new`, `delete`, `typeof`, `switch`…). Lo que cambia de verdad es la **convención**:

| Qué | Python | JavaScript |
|-----|--------|------------|
| Variables y funciones | `first_name`, `calculate_total` | `firstName`, `calculateTotal` |
| Clases | `ShoppingCart` | `ShoppingCart` |
| Constantes de configuración | `MAX_RETRIES` | `MAX_RETRIES` |
| «Privado» por convención | `_internal` | `_internal` (y `#privado` real en clases) |

[[exercise:08-nombres-y-camelcase.md-]]

Como en Python, los nombres distinguen mayúsculas: `total` y `Total` son dos variables distintas.

## Hábitos de Python que fallan

Al principio escribirás Python sin darte cuenta. Algunos hábitos dan un `ReferenceError` claro, pero otros hacen algo inesperado: `print` existe en el navegador y abre el diálogo de impresión.

[[exercise:09-habitos-de-python.md-]]

Otros hábitos (`elif`, `a and b`, `def`, los dos puntos al final del `if`) son errores de sintaxis. Recuerda la lección anterior: un `SyntaxError` impide ejecutar el script entero, así que verás el error rojo y ni un solo `console.log`.

## Bestiario

- **La función que devuelve `undefined` sin motivo aparente.**
  Síntoma: `return` seguido de un salto de línea y el valor en la línea siguiente; la función devuelve `undefined` y no hay error.
  Causa: ASI inserta `;` justo después de `return`.
  Solución: empieza la expresión (o su llave `{`) en la misma línea que `return`.
  → [ver ejemplo](04-return-y-salto-de-linea.md)
- **`"Total" is not a function` o una variable con un valor absurdo.**
  Síntoma: una línea que empieza por `(` o `[` provoca un `TypeError` raro o cambia el valor de la variable de la línea anterior.
  Causa: sin `;`, el motor une las dos líneas en una sola expresión.
  Solución: termina las sentencias con `;`.
  → [ver ejemplo](05-linea-que-empieza-por-parentesis.md)
- **`7 // 2` vale 7.**
  Síntoma: la «división entera» no divide.
  Causa: `//` empieza un comentario.
  Solución: `Math.floor(7 / 2)`.
  → [ver ejemplo](07-division-entera-es-un-comentario.md)
- **El `if` sin llaves que controla menos de lo que parece.**
  Síntoma: una línea indentada bajo el `if` se ejecuta siempre.
  Causa: sin llaves, el `if` solo controla la primera sentencia; la indentación no cuenta.
  Solución: escribe siempre las llaves.
  → [ver ejemplo](02-bloques-con-llaves.md)
- **`True is not defined` y `print()` que abre la impresora.**
  Síntoma: `ReferenceError` con nombres de Python, o un diálogo de impresión inesperado.
  Causa: `True`, `None` y `len` no existen en JavaScript; `print` es `window.print()`.
  Solución: `true`, `null`, `.length` y `console.log`.
  → [ver ejemplo](09-habitos-de-python.md)

## Resumen

- Los bloques se marcan con `{ }`; las condiciones van entre paréntesis; la indentación no cuenta.
- Las sentencias terminan en `;`. Si falta, ASI lo inserta solo cuando la línea siguiente no puede continuar.
- Nunca dejes un salto de línea justo después de `return`.
- Una línea que empieza por `(`, `[` o `` ` `` puede pegarse a la anterior: escribe siempre `;`.
- Comentarios: `//`, `/* */` y `/** */` (JSDoc). `//` no es la división entera: usa `Math.floor(a / b)`.
- Convenciones: `camelCase` para variables y funciones, `PascalCase` para clases, `MAYÚSCULAS` para constantes de configuración.
- `true`, `false`, `null`, `&&`, `||`, `!`, `else if` y `.length` sustituyen a sus equivalentes de Python.

## Para profundizar

- [MDN: gramática léxica (comentarios, palabras reservadas, ASI)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Lexical_grammar)
- [javascript.info: estructura del código](https://es.javascript.info/structure)
- [MDN: JavaScript para quien ya programa](https://developer.mozilla.org/es/docs/Web/JavaScript/Language_overview)
- [Especificación ECMAScript: reglas de ASI](https://tc39.es/ecma262/#sec-automatic-semicolon-insertion)
