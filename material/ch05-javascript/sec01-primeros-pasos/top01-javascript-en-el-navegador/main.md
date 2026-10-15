# JavaScript en el navegador

## Por qué importa

En los capítulos de HTML y CSS describiste qué hay en la página y cómo se ve. JavaScript es lo que la hace *reaccionar*: es el único lenguaje de programación que todos los navegadores ejecutan de serie (WebAssembly llegará al final del curso). Antes de aprender el lenguaje necesitas saber **dónde** corre tu código, **cuándo** se ejecuta y **cómo** mirar lo que hace. Esa herramienta de mirar es la consola, y la vas a usar en todos los ejemplos de este capítulo.

## Dónde se ejecuta tu código

En Python escribes un archivo `.py` y se lo das al intérprete (CPython), que vive en tu terminal. En la web, el intérprete está **dentro del navegador**: cada pestaña tiene un motor de JavaScript que lee y ejecuta los scripts de esa página.

| Navegador | Motor de JavaScript |
|-----------|---------------------|
| Chrome, Edge, Opera | V8 (el mismo que usa Node.js) |
| Firefox | SpiderMonkey |
| Safari | JavaScriptCore |

Conviene separar dos cosas que en el día a día parecen una sola:

- **El lenguaje** (su nombre oficial es ECMAScript): variables, tipos, funciones, objetos, errores… Es lo que estudias en este capítulo y funciona igual en cualquier motor.
- **El entorno anfitrión** (*host*): lo que el navegador añade alrededor del lenguaje. `console`, `document`, `window`, `fetch` o `setTimeout` **no son parte de JavaScript**: los pone el navegador. Node.js es otro anfitrión, con otras piezas (archivos, red, procesos) y sin `document`.

> **Desde Python:** es como la diferencia entre el lenguaje Python y su biblioteca estándar, con un matiz: en el navegador no hay `import os` ni acceso a tus archivos. El código de una página vive encerrado en esa página por seguridad.

En el navegador existe además un **objeto global**, `window`, que representa la pestaña. Todo lo que el navegador te ofrece cuelga de él: `console` es en realidad `window.console`. Volverás a encontrártelo en la lección de variables.

### Qué hace LearnWeb con tus bloques

La vista previa es una página web de verdad (se sirve desde `localhost:3001`). LearnWeb construye ese documento con tus bloques y coloca tu JavaScript en un `<script>` **al final del `<body>`**, después de tu HTML:

```text
<!DOCTYPE html>
<html>
  <head>
    … consola de LearnWeb + tu bloque CSS …
  </head>
  <body>
    … tu bloque HTML …
    <script>
      … tu bloque JavaScript …   ← se ejecuta aquí, con todo el HTML ya leído
    </script>
  </body>
</html>
```

Tres consecuencias que verás en todo el curso:

1. El script se ejecuta **una vez, de arriba abajo**, cuando la página se carga. No hay `main()`: el código de nivel superior *es* el programa.
2. Cada vez que paras de escribir, LearnWeb **recarga la página desde cero**: la consola se vacía y todas las variables vuelven a su valor inicial. No hay estado guardado entre ejecuciones.
3. Muchos ejemplos de este módulo no tienen HTML: son solo JavaScript y su resultado está en la consola.

### Cómo usar los ejemplos de este módulo

Casi todos los ejemplos de este módulo escriben su resultado en la **consola**, el panel que hay debajo de la vista previa. En las páginas de teoría verás su código; para ejecutarlos, ábrelos desde la galería de ejemplos del tema (o con el botón *Open Exercise* de las tarjetas): se cargan en el editor y la consola muestra su salida. Muchos comentarios indican el resultado esperado (`// 'object'`): intenta predecirlo antes de ejecutar y compruébalo después. Y cámbialos: cada edición vuelve a ejecutar el ejemplo.

## La consola: tu `print()`

`console.log(...)` es el equivalente de `print(...)`: escribe sus argumentos separados por espacios. La costumbre más útil que puedes adquirir es **etiquetar** lo que imprimes, para saber qué estás mirando:

[[exercise:01-hola-consola.md-]]

Fíjate en cómo pinta la consola cada valor. Igual que en Chrome, un string suelto sale sin comillas y un número sale en otro color; dentro de un array o de un objeto, los strings sí llevan comillas. Cuando algo «parece un número» pero se comporta raro, esas comillas son la primera pista.

> **Desde Python:** `print(a, b)` llama a `str()` sobre cada argumento. `console.log(a, b)` no convierte nada: pasa los valores tal cual a la consola, que los dibuja según su tipo. Por eso los objetos se pueden expandir y el texto no.

### Niveles y filtros

No todos los mensajes pesan lo mismo. `console.info`, `console.warn` y `console.error` escriben con su propio nivel (y color), y los botones **All / Log / Info / Warn / Error** de la barra de la consola filtran por nivel. Ojo: `console.error` solo *escribe* en rojo; no detiene nada.

[[exercise:02-niveles-de-la-consola.md-]]

### Tablas y grupos

Cuando hay muchos datos, `console.table` los convierte en una tabla y `console.group` / `console.groupEnd` los agrupa con sangría. En este módulo usarás `console.table` para comparar resultados lado a lado (por ejemplo, la tabla de coerciones de `==`).

[[exercise:03-tablas-y-grupos.md-]]

Hay más métodos útiles que irás viendo: `console.count('etiqueta')` cuenta cuántas veces pasas por un punto, `console.time` / `console.timeEnd` miden tiempo y `console.assert(condición, mensaje)` solo escribe si la condición es falsa.

### Objetos que se expanden

Los objetos y arrays aparecen con un triángulo ▶. Al expandirlos ves cada propiedad y, al final, una entrada especial llamada `[[Prototype]]`: el objeto del que heredan sus métodos. Todavía no la necesitas, pero en el módulo «Objetos y prototipos» será tu mejor herramienta para entender cómo funciona JavaScript por dentro.

[[exercise:04-objetos-en-la-consola.md-]]

Hay una trampa que despista incluso a gente con experiencia: la consola guarda una **referencia** al objeto, no una copia. La línea resumida se escribe en el momento del `console.log`, pero cuando expandes el objeto se leen sus propiedades *en ese momento*, después de cualquier cambio posterior:

[[exercise:05-la-consola-es-en-vivo.md-]]

## El REPL: escribir código en la consola

Debajo de los mensajes hay una línea con el símbolo `>`. Lo que escribas ahí se ejecuta **dentro de la página de la vista previa** al pulsar Enter, y el resultado aparece debajo: es el `>>>` de Python. Las flechas ↑ y ↓ recorren el historial de órdenes.

Lo potente es que ese REPL ve las variables y funciones de nivel superior de tu ejemplo. Puedes ejecutar el ejemplo, y luego preguntarle cosas o cambiarlas a mano:

[[exercise:06-el-repl.md-]]

Recuerda la consecuencia 2 de antes: en cuanto editas el código, la página se recarga y todo lo que hiciste en el REPL desaparece.

## La etiqueta `<script>`

Fuera de LearnWeb, el JavaScript entra en una página con la etiqueta `<script>`, de dos formas:

```html
<!-- Código en línea -->
<script>
  console.log('Hola');
</script>

<!-- Código en un archivo aparte -->
<script src="app.js"></script>
```

En el capítulo de HTML viste que el parser lee el documento de arriba abajo y que un `<script>` normal **lo detiene**: el navegador ejecuta ese script en el acto y solo después sigue leyendo HTML. La consecuencia práctica es que un script solo «ve» los elementos que están *por encima* de él:

[[exercise:07-donde-se-ejecuta-el-script.md]]

Por eso LearnWeb pone tu bloque al final del `<body>`. En un proyecto real conseguirías lo mismo con `<script src="app.js" defer>` en el `<head>` (o con `type="module"`, que se comporta como `defer`): el script se descarga en paralelo y se ejecuta cuando el HTML ya está completo.

## Errores en rojo

Cuando algo falla y nadie lo atrapa, la consola muestra un mensaje rojo que empieza por `Uncaught` (no atrapado), con el tipo de error, una explicación y la línea donde ocurrió. LearnWeb además marca esa línea en el editor.

Hay dos momentos muy distintos en los que un script puede fallar:

| Tipo | Cuándo se detecta | Qué se ejecuta de ese script |
|------|-------------------|------------------------------|
| Error de sintaxis (`SyntaxError`) | Al leer el script, antes de ejecutarlo | Nada, ni la primera línea |
| Error de ejecución (`ReferenceError`, `TypeError`…) | Al llegar a la línea que falla | Todo lo anterior a esa línea |

En ambos casos solo se detiene **ese** script. Los demás `<script>` de la página se ejecutan con normalidad y la página sigue funcionando:

[[exercise:08-errores-en-rojo.md-]]

> **Desde Python:** una excepción no atrapada termina el programa entero e imprime el *traceback*. En el navegador no hay «programa entero»: cada script (y, más adelante, cada evento o temporizador) es una tarea independiente. La que falla se aborta; la página sigue viva y responde a lo siguiente que ocurra.

### Atrapar el error para seguir

Muchos ejemplos de este módulo provocan errores **a propósito** para que veas el mensaje exacto. Para que el resto del ejemplo siga ejecutándose, los envolveremos en `try { … } catch (error) { … }`, el equivalente de `try/except`. Lo estudiarás a fondo en la lección «Errores y excepciones»; de momento basta con este patrón:

[[exercise:09-atrapar-el-error-y-seguir.md-]]

Cuando el objetivo sea justamente ver el error rojo sin atrapar, el ejemplo lo dirá en un comentario y el error estará en la última línea.

## Bestiario

- **El objeto que «cambia solo» en la consola.**
  Síntoma: el resumen de un `console.log` dice `items: 1`, pero al expandirlo pone `items: 3`.
  Causa: la consola guarda una referencia; al expandir lee el estado actual del objeto.
  Solución: imprime una foto en texto (`JSON.stringify(obj)`) o imprime justo la propiedad que te interesa.
  → [ver ejemplo](05-la-consola-es-en-vivo.md)
- **`[object Object]` en lugar del objeto.**
  Síntoma: `console.log('user: ' + user)` imprime `user: [object Object]`.
  Causa: `+` con un string convierte el objeto en texto antes de llegar a la consola.
  Solución: pásalo como argumento aparte: `console.log('user:', user)`.
  → [ver ejemplo](04-objetos-en-la-consola.md)
- **Un script que «no encuentra» un elemento que sí existe.**
  Síntoma: `document.querySelector('p')` da `null` aunque el `<p>` está en el HTML.
  Causa: el script se ejecutó antes de que el parser llegara a ese elemento.
  Solución: script al final del `<body>`, o con `defer` / `type="module"`.
  → [ver ejemplo](07-donde-se-ejecuta-el-script.md)
- **Un script que no hace absolutamente nada.**
  Síntoma: ni siquiera aparece el primer `console.log` del script.
  Causa: un error de sintaxis impide compilar el script entero.
  Solución: lee el primer error rojo (`SyntaxError`) y corrige esa línea; LearnWeb la marca en el editor.
  → [ver ejemplo](08-errores-en-rojo.md)

## Resumen

- JavaScript lo ejecuta un motor dentro del navegador; `console`, `document` y `window` los aporta el navegador, no el lenguaje.
- LearnWeb pone tu bloque JavaScript al final del `<body>` y recarga la página entera en cada cambio.
- `console.log` es tu `print()`: etiqueta los valores y pásalos como argumentos separados.
- `info/warn/error`, `table` y `group` ordenan la salida; los objetos se expanden hasta `[[Prototype]]`.
- La línea `>` es un REPL que ve las variables globales del ejemplo.
- Un script solo ve el HTML que hay por encima de él.
- Un `SyntaxError` impide ejecutar el script entero; un error de ejecución lo corta en esa línea; los demás scripts siguen.

## Para profundizar

- [MDN: console](https://developer.mozilla.org/es/docs/Web/API/console)
- [Chrome DevTools: referencia de la consola](https://developer.chrome.com/docs/devtools/console/reference)
- [MDN: el elemento `<script>`](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/script)
- [javascript.info: herramientas de desarrollo](https://es.javascript.info/devtools)
