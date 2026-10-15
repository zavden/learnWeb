# Errores y excepciones

## Por qué importa

Los errores son información: te dicen qué falló, dónde y por qué. JavaScript tiene el mismo mecanismo de excepciones que Python (lanzar, atrapar, limpiar), pero con diferencias importantes: un solo `catch` sin filtro por tipo, la posibilidad de lanzar cualquier valor (no solo errores) y, sobre todo, la costumbre del lenguaje de **no lanzar** en muchas situaciones en las que Python sí lo haría. Esta lección te enseña a manejar los errores y, a la vez, a sospechar de los silencios.

## `try`, `catch`, `finally`

La estructura es la de Python con otros nombres: `try` agrupa el código que puede fallar, `catch` (el `except`) se ejecuta solo si algo falla y `finally` se ejecuta siempre, haya error o no.

[[exercise:01-try-catch-finally.md-]]

```python
try:
    result = divide(10, 0)
except Exception as error:
    print("except:", error)
finally:
    print("finally")
```

```js
try {
  const result = divide(10, 0);
} catch (error) {
  console.log('catch:', error.message);
} finally {
  console.log('finally');
}
```

Si no necesitas el objeto del error, puedes omitirlo: `catch { … }`. Y recuerda el ámbito de bloque de la lección 3: una `const` declarada dentro del `try` no existe ni en el `catch` ni después.

## Lanzar errores con `throw`

`throw` es el `raise` de Python. Interrumpe la función en el acto y salta al `catch` más cercano en la pila de llamadas; si no hay ninguno, el error llega a la consola en rojo. Lo habitual es lanzar un objeto de la familia `Error` con un mensaje que explique el problema:

[[exercise:02-lanzar-errores.md-]]

Elige el tipo que mejor describe el fallo. `TypeError` y `RangeError` cubren la mayoría de las validaciones; para el resto, `Error`. En el módulo «Clases y POO» aprenderás a crear tus propios tipos (`class ValidationError extends Error`), el equivalente de definir tus propias excepciones en Python.

## Los errores que lanza el motor

El motor lanza por su cuenta unos pocos tipos de error. Todos heredan de `Error`:

| Tipo | Cuándo aparece | Lo más parecido en Python |
|------|----------------|---------------------------|
| `ReferenceError` | Usar un nombre que no existe, o una variable en su TDZ | `NameError`, `UnboundLocalError` |
| `TypeError` | Leer una propiedad de `null`/`undefined`, llamar a algo que no es una función, reasignar una `const` | `TypeError`, `AttributeError` |
| `RangeError` | Un valor numérico fuera del rango permitido; recursión demasiado profunda | `ValueError`, `RecursionError` |
| `SyntaxError` | Código mal escrito; texto mal formado en `JSON.parse` | `SyntaxError`, `json.JSONDecodeError` |
| `URIError` | `decodeURIComponent` con un texto mal codificado | — |

[[exercise:03-tipos-de-error-nativos.md-]]

Fíjate en que un `SyntaxError` de tu propio código no se puede atrapar con `try/catch`: el motor lo detecta al leer el script, antes de ejecutar nada (lo viste en la lección 1). Los `SyntaxError` que sí se atrapan son los que se producen al interpretar texto en tiempo de ejecución, como `JSON.parse`.

## Un solo `catch`: distinguir y relanzar

Python permite un `except` por tipo. JavaScript tiene **un solo `catch`**, que recibe cualquier error; para reaccionar según el tipo, se pregunta dentro con `instanceof`: `error instanceof RangeError` es `true` si el error es un `RangeError` (o de un tipo que herede de él), igual que `isinstance(error, ValueError)` en Python. Y lo que no sepas manejar, **relánzalo** con `throw error`, para que siga subiendo hasta alguien que sí sepa:

[[exercise:04-un-solo-catch.md-]]

> **Desde Python:** en Python, una excepción que no coincide con ningún `except` sigue subiendo sola. En JavaScript, el `catch` atrapa **todo**, incluidos los errores que no esperabas (una errata, un `null` inesperado). Un `catch` que imprime un mensaje genérico y sigue adelante esconde errores de verdad. Atrapa solo lo que sepas manejar y relanza el resto.

## Anatomía de un `Error`

Un error es un objeto con tres propiedades útiles: `name` (el tipo), `message` (la explicación) y `stack` (la pila de llamadas en el momento de crearlo, como texto). `stack` no es estándar: cada navegador la formatea a su manera, así que sirve para leerla, no para analizarla con código.

[[exercise:05-name-message-y-stack.md-]]

> **Desde Python:** el *traceback* de Python pone la llamada más reciente **al final** («most recent call last»). La pila de JavaScript la pone **al principio**: la primera línea tras el mensaje es donde se creó el error.

Cuando pasas el error entero a `console.log` (o cuando nadie lo atrapa), la consola de LearnWeb lo muestra como en Chrome: el mensaje en rojo y la pila con enlaces a las líneas del editor.

### Encadenar errores con `cause`

Cuando atrapas un error de bajo nivel y lanzas otro con más sentido para tu programa («la configuración no es válida» en lugar de «coma inesperada en la posición 19»), guarda el original en la opción `cause`. Así no pierdes la información de qué falló de verdad:

[[exercise:06-error-cause.md-]]

Es el `raise ConfigError(...) from error` de Python: el error nuevo lleva dentro el original.

## Lanzar cualquier cosa

En Python solo se pueden lanzar excepciones: `raise "texto"` es en sí mismo un `TypeError`. En JavaScript, `throw` acepta **cualquier valor**: un string, un número, un objeto cualquiera. Funciona, pero lo que llega al `catch` no tiene `message`, ni `name`, ni sobre todo `stack`: no hay forma de saber de dónde vino.

[[exercise:07-throw-de-cualquier-cosa.md-]]

La regla es sencilla: lanza siempre `new Error(…)` o un subtipo. Y, como un `catch` puede recibir cualquier cosa, el código defensivo comprueba `error instanceof Error` antes de leer `error.message`.

## `finally` y `return`

`finally` se ejecuta siempre, también cuando el `try` termina con un `return` (se ejecuta justo antes de salir de la función). Eso tiene una consecuencia peligrosa: si el propio `finally` hace `return`, ese valor **sustituye** al del `try`… y si había un error en vuelo, **lo descarta** sin dejar rastro:

[[exercise:08-return-en-finally.md-]]

`finally` es para limpiar: cerrar un recurso, quitar un indicador de «Cargando…», liberar un bloqueo. Nunca pongas `return`, `break`, `continue` ni `throw` dentro de él.

> **Desde Python:** Python se comporta exactamente igual con `return` en un `finally`, y desde la versión 3.14 lo señala con un `SyntaxWarning` (PEP 765). JavaScript no avisa de ninguna manera.

## Donde Python lanza y JavaScript sigue

Ya lo has visto a lo largo del módulo: leer una propiedad que no existe da `undefined`, un índice fuera de rango da `undefined`, dividir entre cero da `Infinity` y una operación numérica sin sentido da `NaN`. Ninguna lanza un error. El problema es que ese valor especial **viaja** por el programa y el error acaba apareciendo lejos de su origen, con un mensaje que no menciona la causa real:

[[exercise:09-donde-python-lanza-y-javascript-sigue.md-]]

La defensa es **validar en la frontera**: comprobar los datos en el momento en que entran en tu código (de un formulario, de una petición, de un archivo) y lanzar tú mismo un error claro si algo no cuadra. Un error temprano con un buen mensaje vale más que diez `undefined` silenciosos.

## Errores sin atrapar

Cuando ningún `catch` atrapa un error, el navegador lo anuncia en la consola como `Uncaught …`, aborta el script (o la tarea) en curso y sigue funcionando: la página no muere, como viste en la lección 1. Más adelante encontrarás errores que no se pueden atrapar con un `try` normal, porque ocurren «más tarde»: dentro de temporizadores, eventos o promesas. Los verás en el módulo «Asincronía y event loop».

## Chuleta: de Python a JavaScript

| Python | JavaScript |
|--------|------------|
| `raise ValueError("…")` | `throw new RangeError('…');` (o `TypeError`, o `Error`) |
| `except ValueError as e:` | `catch (e) { if (e instanceof RangeError) { … } else { throw e; } }` |
| `except Exception as e:` | `catch (e) { … }` |
| `except Exception:` (sin variable) | `catch { … }` |
| `raise` (relanzar) | `throw e;` |
| `raise NewError("…") from e` | `throw new Error('…', { cause: e });` |
| `else:` del `try` | — (pon ese código al final del bloque `try`) |
| `finally:` | `finally { … }` (sin `return` dentro) |
| `traceback.format_exc()` | `e.stack` |
| `class MyError(Exception):` | `class MyError extends Error {}` (módulo «Clases y POO») |
| `assert x > 0, "mensaje"` | `if (!(x > 0)) throw new Error('mensaje');` |

Cuidado con la última fila: existe `console.assert(condición, mensaje)`, pero **no lanza nada**. Solo escribe el mensaje en la consola si la condición es falsa, y el programa sigue. Sirve para depurar, no para proteger tu código.

## Bestiario

- **El error sin pila.**
  Síntoma: `catch (error)` recibe un string; `error.message` y `error.stack` son `undefined`, y la consola muestra `Uncaught "…"` sin línea de origen.
  Causa: `throw` acepta cualquier valor, y solo los objetos `Error` capturan la pila.
  Solución: lanza siempre `new Error(…)` o un subtipo.
  → [ver ejemplo](07-throw-de-cualquier-cosa.md)
- **El error que desaparece.**
  Síntoma: una función que debería fallar devuelve un valor normal; el `catch` nunca se ejecuta.
  Causa: un `return` dentro de `finally` sustituye al resultado y descarta la excepción en vuelo.
  Solución: `finally` solo para limpiar; sin `return`, `break`, `continue` ni `throw`.
  → [ver ejemplo](08-return-en-finally.md)
- **El error que aparece lejos de su causa.**
  Síntoma: `Cannot read properties of undefined (reading 'toLowerCase')` en una línea que parece correcta.
  Causa: un `undefined` (o `NaN`) producido mucho antes, sin error, por una errata o un dato que falta.
  Solución: valida los datos al recibirlos y lanza un error claro; busca el origen del `undefined`.
  → [ver ejemplo](09-donde-python-lanza-y-javascript-sigue.md)

## Resumen

- `try/catch/finally` funciona como `try/except/finally`; `throw` es `raise`.
- Lanza `new Error(mensaje)` o un subtipo (`TypeError`, `RangeError`…), nunca strings ni objetos sueltos.
- El motor lanza `ReferenceError`, `TypeError`, `RangeError`, `SyntaxError` y `URIError`; un `SyntaxError` de tu propio código impide ejecutar el script y no se puede atrapar.
- Un solo `catch` atrapa todo: distingue con `instanceof` y relanza lo que no sepas manejar.
- `error.name`, `error.message`, `error.stack`; `{ cause }` encadena errores como `raise … from …`.
- `return` dentro de `finally` pisa el resultado y se traga los errores.
- JavaScript devuelve `undefined`, `Infinity` o `NaN` donde Python lanzaría: valida en la frontera.

## Para profundizar

- [MDN: control de flujo y manejo de errores](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN: Error](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error: cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause)
- [javascript.info: manejo de errores, «try...catch»](https://es.javascript.info/try-catch)
- [PEP 765: return/break/continue en finally (Python)](https://peps.python.org/pep-0765/)
