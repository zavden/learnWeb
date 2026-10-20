# Recursión y pila de llamadas

## Por qué importa

Cada vez que una función llama a otra, el motor tiene que recordar dónde estaba para poder volver. Lo apunta en la **pila de llamadas** (*call stack*), la misma que aparece en el *traceback* de cada error. Entender la pila explica por qué un error muestra una lista de funciones, cómo funciona la **recursión** (una función que se llama a sí misma) y de dónde sale uno de los errores más conocidos de la programación: `RangeError: Maximum call stack size exceeded`, el *stack overflow* que da nombre a la famosa web de preguntas.

La recursión funciona igual que en Python. Cambian los límites: Python corta a las 1000 llamadas con un número que puedes configurar, y JavaScript depende del motor y del tamaño de cada llamada, sin forma de ampliarlo. Además, en la web la recursión aparece constantemente con datos anidados: menús, carpetas, comentarios con respuestas, JSON, el propio árbol de la página (capítulo 6).

## La pila de llamadas

La pila de llamadas es una lista de **marcos** (*frames*). Cada vez que se llama a una función, se apila un marco encima con sus parámetros, sus variables locales y el punto al que debe volver; cuando la función termina, su marco se desapila y la ejecución sigue en la función de debajo. En cada momento solo se ejecuta la función de arriba; las demás esperan su resultado.

```text
checkout() llama a calculateTotal(), que llama a addTax():

  ┌────────────────┐
  │ addTax         │  ← cima: se ejecuta ahora
  ├────────────────┤
  │ calculateTotal │  ← espera el resultado de addTax
  ├────────────────┤
  │ checkout       │  ← espera el resultado de calculateTotal
  ├────────────────┤
  │ (script)       │
  └────────────────┘
```

El ejemplo lleva su propio registro para que veas cómo crece y se vacía la pila, y usa `console.trace()`, que imprime la pila **real** del motor en ese punto. Es la misma lista que acompaña a cada error (lo viste en la lección «Errores y excepciones» con `error.stack`).

[[exercise:01-la-pila-de-llamadas.md-]]

## Recursión: caso base y caso recursivo

Una función **recursiva** se llama a sí misma. Para que termine, necesita dos partes:

- El **caso base**: un problema tan pequeño que se resuelve sin volver a llamarse (`factorial(1)` es `1`).
- El **caso recursivo**: reduce el problema y se llama con la versión más pequeña (`n * factorial(n - 1)`), de modo que cada llamada esté más cerca del caso base.

Cada llamada recursiva es una llamada normal: apila su propio marco con su propio `n`. Primero se **baja** hasta el caso base, apilando marcos; después se **sube**, y cada marco usa el resultado del de arriba para calcular el suyo:

[[exercise:02-recursion-basica.md-]]

```text
factorial(4)
  factorial(3)
    factorial(2)
      factorial(1)
      = 1 (caso base)
    = 2 × factorial(1) = 2
  = 3 × factorial(2) = 6
= 4 × factorial(3) = 24
```

> **Desde Python:** el código es idéntico línea por línea, salvo las llaves. También es igual la forma de pensar: confía en que la llamada recursiva resuelve el problema pequeño y preocúpate solo de combinar su resultado.

## Donde brilla la recursión: datos anidados

Calcular un factorial con un bucle es más sencillo. La recursión gana cuando los datos tienen **forma de árbol** y no sabes cuántos niveles hay: una carpeta contiene archivos y carpetas, que contienen archivos y carpetas… La definición del problema ya es recursiva («el tamaño de una carpeta es la suma de lo que contiene»), y el código la copia casi palabra por palabra:

[[exercise:03-recorrer-un-arbol.md-]]

Con bucles normales tendrías que saber cuántos `for` anidar. La función recursiva, en cambio, se adapta a cualquier profundidad: la sangría del dibujo es, literalmente, la profundidad de la pila en cada llamada.

## `Maximum call stack size exceeded`

La pila tiene un tamaño fijo. Si las llamadas se apilan sin parar, se llena, y el motor lanza `RangeError: Maximum call stack size exceeded`. Hay dos formas de llegar ahí, y conviene distinguirlas porque se arreglan de forma distinta.

### Recursión sin fin

La primera es un error de lógica: la recursión **nunca llega al caso base**. Pasa cuando el caso base comprueba un valor exacto que el problema puede saltarse (`n === 0` con `countdown(2.5)`, que pasa de `0.5` a `-0.5`), o cuando una función se llama a sí misma **sin querer**, como un envoltorio `log` que debía llamar a `console.log`:

[[exercise:04-desbordar-la-pila.md-]]

La guarda de bucles de LearnWeb no interviene aquí, porque no hay ningún bucle: el que detiene la recursión infinita es el propio motor, y lo hace en milisegundos. Escribe el caso base de forma que cubra todo lo que «ya ha terminado» (`n <= 0`), no solo un valor exacto.

### Recursión correcta, datos demasiado grandes

La segunda forma es más traicionera: la función es **correcta**, pero los datos son tan grandes que necesitan más marcos de los que caben. Una suma recursiva que hace una llamada por elemento funciona con 1000 números y desborda con 100 000:

[[exercise:05-recursion-correcta-que-desborda.md-]]

¿Cuántas llamadas caben? No hay un número fijo: depende del navegador y de lo que ocupa cada marco (más parámetros y variables locales, menos marcos). En Chrome, una función mínima llega a unas 10 000 llamadas. Y no se puede ampliar desde la página.

| | Python | JavaScript (navegador) |
|---|---|---|
| Error | `RecursionError: maximum recursion depth exceeded` | `RangeError: Maximum call stack size exceeded` |
| Límite | 1000 llamadas por defecto | depende del motor y del tamaño de cada marco (≈ 10 000 en Chrome) |
| ¿Se puede cambiar? | `sys.setrecursionlimit(n)` | no desde la página |
| Optimización de llamadas en cola | no | en el estándar, pero solo la implementa Safari |

## Recursión frente a iteración

Todo lo que se hace con recursión se puede hacer con un bucle. Para datos anidados, el truco es llevar tu propia **pila explícita**: un array con lo que queda por visitar, al que añades (`push`) los hijos y del que sacas (`pop`) el siguiente. Esa pila vive en la memoria normal, que es mucho mayor que la pila de llamadas, así que aguanta cualquier profundidad. Es la técnica que usó el ejemplo profesional de diferencias entre JSON del módulo anterior:

[[exercise:06-recursion-frente-a-iteracion.md-]]

| | Recursión | Bucle con pila explícita |
|---|---|---|
| Claridad con datos anidados | muy alta: el código sigue la forma de los datos | menor: hay que gestionar la pila a mano |
| Profundidad máxima | unos miles de niveles | la que quepa en memoria |
| Cuándo usarla | menús, carpetas, JSON de tamaño razonable | profundidad controlada por el usuario o potencialmente enorme |

## Repetir trabajo: Fibonacci

Hay un tercer problema de la recursión que no tiene nada que ver con la pila: **repetir trabajo**. La definición de Fibonacci, `fib(n) = fib(n - 1) + fib(n - 2)`, escrita tal cual, calcula los mismos valores una y otra vez. Para `fib(25)` hace 242 785 llamadas, aunque la pila nunca pase de 25 marcos. La solución es la **memoización** de la lección anterior… con un matiz:

[[exercise:07-fibonacci-y-memoizacion.md-]]

```text
fib(25) → 75025 (242785 llamadas)
🐛 memoize(fib) → 242785 llamadas
✅ fibMemo(25) → 75025 (26 llamadas)
fibIterative(100) → 354224848179261915075n
```

Envolver `fib` con `memoize` no basta: dentro, `fib` se sigue llamando a sí misma, a la versión lenta, y solo se guarda en caché la llamada de fuera. Las llamadas recursivas tienen que pasar por la versión memoizada. Y, como casi siempre que la recursión es lineal, la versión iterativa es la más sencilla y la más rápida.

> **Desde Python:** con `@functools.cache` sobre `def fib` sí basta, porque el decorador **sustituye** el nombre `fib`, y las llamadas internas, que buscan `fib` en el ámbito global, encuentran la versión con caché. En JavaScript, `const fibWrapped = memoize(fib)` crea un nombre nuevo y deja `fib` como estaba.

## Un caso práctico: comparar en profundidad

En «JSON y copias» viste que JavaScript no tiene un operador para comparar el **contenido** de dos objetos: `===` compara referencias, y comparar sus JSON falla en cuanto las claves están en otro orden. Una función recursiva lo resuelve: dos valores son iguales si son el mismo primitivo, o si son objetos con las mismas claves y cada par de valores es, a su vez, igual en profundidad:

[[exercise:08-comparar-en-profundidad.md-]]

La versión del ejemplo tiene límites conocidos (`NaN`, fechas, `Map`, `Set`), y una **referencia circular** (un objeto que se contiene a sí mismo) la haría recurrir sin fin hasta desbordar la pila. Las librerías que hacen esto en producción llevan un registro de los objetos ya visitados para evitarlo.

## Bestiario

- **Recursión infinita por un caso base inalcanzable.**
  Síntoma: `RangeError: Maximum call stack size exceeded` con ciertos valores (decimales, negativos) y no con otros.
  Causa: el caso base comprueba un valor exacto (`n === 0`) que la recursión se salta.
  Solución: un caso base que cubra todo lo que ya terminó (`n <= 0`).
  → [ver ejemplo](04-desbordar-la-pila.md)
- **La función que se llama a sí misma sin querer.**
  Síntoma: `Maximum call stack size exceeded` en una función que no parece recursiva.
  Causa: dentro de un envoltorio se llama al propio envoltorio (`log(…)` en lugar de `console.log(…)`), o a un método con el mismo nombre.
  Solución: revisa la primera línea de la pila del error: la misma función aparece repetida miles de veces.
  → [ver ejemplo](04-desbordar-la-pila.md)
- **Funciona con datos de prueba y desborda con datos reales.**
  Síntoma: una función recursiva correcta lanza `RangeError` con listas largas o anidamientos muy profundos.
  Causa: hace falta un marco por elemento o por nivel, y la pila solo admite unos miles.
  Solución: un bucle, con una pila explícita si los datos están anidados.
  → [ver ejemplo](05-recursion-correcta-que-desborda.md)
- **`memoize(fib)` sigue siendo lento.**
  Síntoma: la primera llamada a la versión memoizada tarda lo mismo que la original.
  Causa: las llamadas recursivas internas usan la función original, sin caché.
  Solución: que la función recursiva se llame a través de la versión memoizada, o escribirla de forma iterativa.
  → [ver ejemplo](07-fibonacci-y-memoizacion.md)

## Resumen

- La pila de llamadas guarda un marco por cada llamada en curso; `console.trace()` y `error.stack` la muestran.
- Una función recursiva necesita un caso base y un caso recursivo que se acerque a él.
- La recursión encaja con datos anidados de profundidad desconocida (árboles, menús, JSON).
- La pila tiene un tamaño fijo (≈ 10 000 marcos en Chrome): recursión infinita o datos muy profundos lanzan `RangeError: Maximum call stack size exceeded`.
- La guarda de bucles de LearnWeb no afecta a la recursión: la detiene el propio motor.
- Un bucle con una pila explícita aguanta cualquier profundidad; la memoización evita repetir trabajo.

## Para profundizar

- [MDN: pila de llamadas (glosario)](https://developer.mozilla.org/es/docs/Glossary/Call_stack)
- [MDN: RangeError: Maximum call stack size exceeded](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Errors/Too_much_recursion)
- [javascript.info: recursión y pila](https://es.javascript.info/recursion)
- [MDN: recursión (glosario)](https://developer.mozilla.org/es/docs/Glossary/Recursion)
