# Integración: asincronía y event loop

## Por qué importa

Las seis lecciones de este módulo enseñan piezas sueltas: el event loop decide el orden, los temporizadores esperan (al menos) un rato, las promesas representan resultados futuros, los combinadores esperan a varias a la vez, `async/await` lo escribe todo de arriba abajo y `requestAnimationFrame` sincroniza el código con el pintado. En un programa real aparecen juntas, y sus sorpresas también: un reintento que debe respetar la cancelación del usuario, un buscador donde la respuesta más lenta pisa a la buena, una cola donde el productor tiene que esperar al consumidor.

Los ejemplos de esta página combinan varias lecciones en cada programa. Los ejercicios te piden escribir las utilidades que usa cualquier proyecto (un `wait` cancelable, un `retry`, los combinadores) y cazar los bugs típicos del módulo.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| esperar un tiempo | `await wait(ms)`, con `{ signal }` si se puede cancelar | «Promesas», «Combinadores y cancelación» |
| pasos que dependen unos de otros | `await` en fila (o una cadena de `then` con `return`) | «async/await» |
| varias operaciones independientes | lanzarlas todas y `await Promise.all(...)` | «Combinadores y cancelación» |
| que un fallo no tape los demás resultados | `Promise.allSettled` | «Combinadores y cancelación» |
| no saturar un servidor | un límite de concurrencia (N trabajadores) | este módulo, ejemplo 2 |
| un plazo de verdad | `AbortSignal.timeout(ms)` pasado a la operación; nunca solo `Promise.race` | «Combinadores y cancelación» |
| cancelar si el usuario pulsa «Cancelar» o vence el plazo | `AbortSignal.any([usuario, AbortSignal.timeout(ms)])` | «Combinadores y cancelación» |
| reintentar fallos pasajeros | un `for` con `try { return await … }` y espera exponencial con *jitter* | «async/await» |
| repetir trabajo asíncrono cada cierto tiempo | `setTimeout` recursivo, no `setInterval` | «Callbacks y temporizadores» |
| una cuenta atrás o un reloj | una hora límite y el reloj (`performance.now()`) en cada tick | «Callbacks y temporizadores» |
| datos que llegan por partes | un generador asíncrono y `for await…of` | «async/await» |
| animar | `requestAnimationFrame` y posiciones calculadas con el tiempo | «Frames de animación y tiempo» |
| un cálculo largo sin congelar la página | rebanadas de ~10 ms y una tarea entre ellas: `await scheduler.yield()` (responde antes, pinta a saltos) o ceder hasta el próximo frame (pinta cada frame) | «El event loop», «Frames de animación y tiempo» |

Dos reglas atraviesan la tabla. La primera: una promesa **ya está en marcha** cuando la tienes; `await` y los combinadores solo esperan, y cancelar es cosa de la operación, que recibe una señal. La segunda: el tiempo se **mide** con el reloj, nunca se **cuenta** con ticks o frames.

## Ejemplos combinados

### Un cliente de API resiliente

Una petición a la API de pedidos sobre una red simulada con un guion de respuestas por intento. Cada intento tiene su propio plazo, `AbortSignal.timeout(100)`, unido a la señal del usuario con `AbortSignal.any`; los fallos transitorios (un 503, un plazo agotado) se reintentan con espera exponencial y *jitter* con semilla; un 404 no se reintenta; y si el usuario cancela, se detiene también la espera entre intentos. Fíjate en el último caso: la cancelación llega durante el segundo intento y no hay tercero.

[[exercise:01-cliente-api-resiliente.md-]]

```text
▶ GET /orders/P-1001
  ✓ P-1001: enviado
▶ GET /orders/P-1002
  ✗ intento 1: 503 en /orders/P-1002 · reintento en 32 ms
  ✗ intento 2: sin respuesta en 100 ms · reintento en 93 ms
  ✓ P-1002: enviado
▶ GET /orders/P-404
  ⛔ 404 en /orders/P-404
▶ GET /orders/P-1003
  ✗ intento 1: sin respuesta en 100 ms · reintento en 37 ms
  ⛔ cancelado por el usuario
intentos por ruta → {'/orders/P-1001': 1, '/orders/P-1002': 3, '/orders/P-404': 1, '/orders/P-1003': 2}
```

### Un límite de concurrencia

En la lección «async/await» quedó una promesa: ni todo en fila ni todo a la vez, sino **por tandas**. `mapWithLimit(items, 3, fn)` crea tres «trabajadores» que se reparten un índice compartido: cada uno toma el siguiente elemento libre en cuanto termina el anterior. Los resultados se guardan en su posición, así que salen en el orden de entrada aunque terminen en otro. El `nextIndex++` no necesita protección: entre leerlo y sumarlo no hay ningún `await`, y con una sola hebra nadie puede colarse.

[[exercise:02-limite-de-concurrencia.md-]]

```text
▶ mapWithLimit(fotos, 3)
  nunca más de 3 a la vez → true
  terminaron en otro orden → mole-poblano.jpg … true
  resultados en el orden de entrada → cafe-chiapas-200px.webp mole-poblano-200px.webp … 10
▶ Promise.all → a la vez: 10
▶ for…of + await → a la vez: 1
```

### Buscar mientras se escribe

El bug de carrera más común de la web. Cada pulsación lanza una búsqueda, y las búsquedas cortas («c») tardan más que las largas («café»), así que las respuestas llegan al revés: la última en llegar, la de «c», pinta resultados que el usuario ya no quiere. Cancelar la petición anterior con un `AbortController` en cada pulsación lo arregla; añadir un *debounce* (lección «Funciones de orden superior») ahorra además las peticiones intermedias. El ejemplo simula el tecleo para medir las tres versiones, y el campo de la página usa la buena: pruébalo con «▶ Run».

[[exercise:03-busqueda-mientras-escribes.md-(script.js)]]

```text
🐛 sin cancelar → peticiones: 4, canceladas: 0, en pantalla: «c»
✅ con AbortController → peticiones: 4, canceladas: 3, en pantalla: «café»
✅ con debounce + AbortController → peticiones: 1, canceladas: 0, en pantalla: «café»
```

### Subidas en paralelo

Cinco fotos de una fonda se suben a la vez, por partes, con su progreso. `Promise.allSettled` da el informe completo: con `Promise.all`, el 413 de la carta (demasiado grande) habría rechazado todo a los 10 ms. Con el informe se decide qué reintentar: solo los errores transitorios (el 502 de la terraza), una vez. El resumen final es una tabla de `console.table`.

[[exercise:04-subidas-en-paralelo.md-]]

```text
▶ subiendo 5 fotos a la vez
▶ progreso al terminar la primera ronda
  fachada.jpg   ██████████ 100 %
  terraza.jpg   ███░░░░░░░ 25 %
  barra.jpg     ██████████ 100 %
  menu.tif      ░░░░░░░░░░ 0 %
  platillo.jpg  ██████████ 100 %
  ↻ reintento terraza.jpg (502)
(tabla: 4 fotos subidas, terraza.jpg en el segundo intento; menu.tif con «413 archivo demasiado grande»)
resumen → 4 de 5 subidas; revisa las que quedan en rojo
```

### Un rompecabezas del event loop

Un programa corto mezcla código síncrono, dos `then` encadenados, `queueMicrotask`, una función `async` con un `await` y dos temporizadores, uno de los cuales crea una microtarea. Antes de ejecutarlo, escribe en un papel el orden que esperas. El ejemplo compara una predicción con el orden real, línea a línea, y cada línea lleva la regla que la explica. Después, cambia el programa y ajusta la predicción hasta volver a acertar todas.

[[exercise:05-rompecabezas-del-event-loop.md-]]

```text
✓  1. script: empieza  ← código síncrono
✓  2. async: antes del await  ← una función async se ejecuta en el acto hasta su primer await
✓  3. script: termina  ← el script entero es UNA tarea: termina antes que cualquier callback
✓  4. then 1  ← primera microtarea encolada (la promesa ya estaba cumplida)
✓  5. queueMicrotask  ← segunda microtarea, por orden de llegada
✓  6. async: tras el await  ← el await encoló su continuación como tercera microtarea
✓  7. then 2  ← se encoló al terminar «then 1»: va detrás de las que ya esperaban
✓  8. timeout A  ← primera TAREA, solo cuando la cola de microtareas está vacía
✓  9. microtarea creada en timeout A  ← las microtareas de una tarea van antes de la tarea siguiente
✓ 10. timeout B  ← segunda tarea
aciertos → 10 de 10
```

### Una cola productor-consumidor

La cocina de una fonda: un camarero deja comandas en una barra con sitio para dos, y dos cocineros las recogen. La cola es una clase con `put` (que espera con `await` si la barra está llena: **contrapresión**), `take` (que espera si está vacía) y `close`, y es recorrible con `for await…of` gracias a un `async *[Symbol.asyncIterator]()`. Cerrar la cola termina los bucles de los cocineros cuando ya no queda nada. Todo se coordina con promesas pendientes guardadas en arrays: los `resolve` de quien espera.

[[exercise:06-cola-productor-consumidor.md-]]

```text
platos cocinados → 8 de 8
en orden de llegada → C-1 C-2 C-3 C-4 C-5 C-6 C-7 C-8
cada comanda una sola vez → true
la barra nunca pasó de 2 → true
el camarero tuvo que esperar a que hubiera hueco → true
los dos cocineros trabajaron → true
al cerrar la cola, los for await terminaron (si no, no veríamos esto)
```

### Una cuenta atrás que no deriva

La reserva de unas entradas caduca en diez «segundos» (de 100 ms). La versión ingenua resta 1 en cada tick de `setInterval`; la corregida calcula lo que queda con el reloj y programa el siguiente `setTimeout` justo para cuando cambie el número. A mitad de la cuenta, la página se bloquea 250 ms: la corregida se salta los números perdidos y llega a 0 a tiempo; la ingenua todavía no ha terminado.

[[exercise:07-cuenta-atras-sin-deriva.md-]]

```text
mostrado → 10 9 8 7 4 3 2 1 0 (los números saltados dependen de cuándo cae el bloqueo; varía)
✅ llegó a 0 a tiempo (menos de 40 ms tarde) → true
✅ nunca volvió a subir → true
✅ tras el bloqueo se saltó números en vez de quedarse atrás → true
🐛 la cuenta por ticks aún no había llegado a 0 → true
```

### Un total que cuenta

El total de un carrito cuenta hasta su nuevo valor con una interpolación de `requestAnimationFrame` y suavizado, envuelta en una promesa. Si llega otro cambio a mitad, el `AbortController` de la animación en curso la cancela y la nueva arranca desde el valor que se estaba viendo, sin saltos hacia atrás. El número animado lleva `aria-hidden` y una región `aria-live` invisible anuncia solo el valor final. Pulsa los botones con «▶ Run» varias veces seguidas.

[[exercise:08-total-animado.md-(script.js)]]

```text
▶ añadir un café
  animación → terminada | se muestra $210.00
▶ dos productos casi a la vez
  la primera → interrumpida
  se interrumpió en un valor intermedio → true
  la segunda → terminada | se muestra $515.00
  sin saltos hacia atrás: arrancó desde el valor que se veía
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que espera a cada resultado (con un límite de tiempo, para que un ejercicio a medias nunca se quede colgado) y lo compara con lo esperado. Imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Las comprobaciones miden órdenes, contadores y resultados, nunca milisegundos, así que dan lo mismo en cualquier ordenador.

### Utilidades con promesas

Cuatro herramientas de cualquier proyecto: `wait` cancelable con una señal (antes de empezar y a mitad), `withTimeout` con `AbortSignal.timeout`, `retry`, que solo reintenta los errores transitorios, y `promisify`. Al abrirlo, ocho comprobaciones salen en rojo; las otras tres ya salen ✓ y deben seguir así.

[[exercise:09-ej-utilidades-con-promesas.md]]

### Combinadores a mano

Escribe `all`, `allSettled` y `any` con `new Promise` y `then`, sin usar los de `Promise`, y un `mapWithLimit` que respete el límite de concurrencia y el orden de entrada. Es la mejor forma de entender de verdad qué esperan, cuándo fallan y por qué el orden de los resultados no depende del orden de llegada. Nueve comprobaciones salen en rojo al empezar.

[[exercise:10-ej-combinadores-a-mano.md]]

### Caza los seis bugs asíncronos

El código de una tienda de café tiene seis bugs, uno por función, y todos son del Bestiario de este módulo: un `then` sin `return`, un `forEach` con `async`, un bucle en fila que debía ir en paralelo, un `return` sin `await` dentro de un `try`, un plazo con `race` que no cancela el cobro y un sondeo con `setInterval` que se solapa. Ninguno detiene el script; dos comprobaciones ya salen ✓ y deben seguir así.

[[exercise:11-ej-caza-los-bugs-asincronos.md]]

## Resumen

- Plazos por intento con `AbortSignal.timeout`, unidos a la cancelación del usuario con `AbortSignal.any`; tras una cancelación, no se reintenta.
- Un límite de concurrencia son N trabajadores que se reparten un índice; los resultados van a su posición.
- En las búsquedas mientras se escribe, cancela la petición anterior: si no, la respuesta más lenta pisa a la buena.
- `allSettled` informa de todo; con ese informe se decide qué reintentar.
- Una cola asíncrona coordina productores y consumidores guardando los `resolve` de quien espera; con capacidad, el productor espera (contrapresión).
- Los relojes y las cuentas atrás calculan con una hora límite y se reprograman hasta la siguiente frontera.
- Una animación es una promesa más: se espera con `await` y se cancela con una señal.

## Para profundizar

- [web.dev: optimizar las tareas largas (en inglés)](https://web.dev/articles/optimize-long-tasks)
- [MDN: AbortSignal (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [AWS Architecture Blog: espera exponencial y jitter (en inglés)](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Python: colas de asyncio](https://docs.python.org/es/3/library/asyncio-queue.html)
