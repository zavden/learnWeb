# Callbacks y temporizadores

## Por qué importa

Los temporizadores son la forma más sencilla de asincronía: «haz esto dentro de un rato» y «haz esto cada cierto tiempo». Ya los has usado sin explicación: `setTimeout` y `clearTimeout` hacían funcionar el *debounce* del buscador (lección «Funciones de orden superior») y el bug de `var` en un bucle (lección «Closures»). Ahora que conoces el event loop, puedes entenderlos de verdad, y también sus trampas: el mínimo de 4 ms, la cuenta atrás que se desajusta y el sondeo que se solapa.

Los temporizadores trabajan con **callbacks**, y durante años los callbacks fueron la única forma de escribir código asíncrono en JavaScript. Esta lección muestra sus límites (la pirámide de anidamiento, los errores que escapan del `try/catch`, el control que cedes a otro código), que son justo los problemas que resuelven las promesas de la lección siguiente.

## `setTimeout` y `clearTimeout`

`setTimeout(callback, ms, ...args)` pide al navegador que encole `callback` como tarea cuando hayan pasado **al menos** `ms` milisegundos, y devuelve enseguida un **identificador** (en el navegador, un número entero). Los argumentos que pongas después de `ms` se pasan al callback. `clearTimeout(id)` cancela el temporizador si todavía no se ha ejecutado; con uno que ya se ejecutó, o con un id que no existe, no hace nada.

El ejemplo es la bandeja de salida de un cliente de correo con «Deshacer envío»: cada email espera 300 ms antes de salir, y el segundo se cancela a tiempo.

[[exercise:01-settimeout-y-cleartimeout.md-]]

```text
⏳ «Factura de octubre» sale en 300 ms (puedes deshacerlo)
⏳ «Presupuesto con el adjunto equivocado» sale en 300 ms (puedes deshacerlo)
fin del script: los dos envíos están programados
↩️ deshecho: «Presupuesto con el adjunto equivocado»
📤 enviado a ana@example.com: «Factura de octubre»
clearTimeout tarde → sin efecto ni error
```

Dos recordatorios de lecciones anteriores: se pasa la **función** (`send`), no su resultado (`send(...)` la ejecutaría en ese momento, lección «Formas de función»); y un método pasado como callback pierde su `this` (lección «La palabra clave this»). El *debounce* de «Funciones de orden superior» es este mismo patrón: cada pulsación cancela el temporizador pendiente con `clearTimeout` y programa uno nuevo.

> **Desde Python:** `setTimeout(fn, ms, *args)` es `loop.call_later(segundos, fn, *args)` de `asyncio` (ojo: Python cuenta en segundos y JavaScript en milisegundos), y `clearTimeout(id)` es `handle.cancel()`.

## `setInterval` y `clearInterval`

`setInterval(callback, ms)` repite el callback cada `ms` milisegundos hasta que `clearInterval(id)` lo detiene. Un intervalo que nadie detiene sigue ejecutándose mientras la página esté abierta, así que guarda **siempre** su identificador y decide cuándo parar. La cuenta atrás de una oferta se detiene sola al llegar a cero:

[[exercise:02-setinterval.md-]]

```text
⚡ oferta: 2×1 en café de olla · termina en 5 s
   quedan 4 s
   quedan 3 s
   quedan 2 s
   quedan 1 s
⌛ oferta terminada
```

## Un temporizador no es un reloj

`ms` es un **mínimo**, no una cita. El navegador encola el callback cuando vence el plazo, pero el callback se ejecuta cuando el event loop llega a él, después del código en curso y de las microtareas. De ahí salen tres trampas.

### El mínimo de 4 ms

El estándar HTML dice que, a partir del quinto temporizador **anidado** (programado desde el callback de otro temporizador, que a su vez se programó desde otro…), un retraso menor de 4 ms se convierte en 4 ms. La regla nació para frenar páginas antiguas que hacían bucles con `setTimeout(fn, 0)` y quemaban la CPU. La consecuencia: una cadena de 100 `setTimeout(…, 0)` que no hacen nada tarda cientos de milisegundos. Una cadena de mensajes de `MessageChannel` (lección «El event loop») no tiene ese mínimo:

[[exercise:03-temporizadores-anidados-4-ms.md-]]

```text
🐛 100 setTimeout(…, 0) encadenados tardan ≥ 300 ms → true
   (≈ 420 ms; varía)
   los 4 primeros saltos, < 2 ms de media → true
   los 50 últimos, ≥ 3.5 ms de media → true
✅ 100 mensajes encadenados tardan < 100 ms → true
   (≈ 8.4 ms; varía)
```

Para trocear trabajo, como en la lección anterior, el mínimo apenas importa si cada rebanada dura unos 10 ms. Con rebanadas diminutas, el tiempo de espera se come al de trabajo. Por eso los planificadores de las librerías ceden con `MessageChannel`, y Chrome ofrece `scheduler.yield()` (lección «Frames de animación y tiempo»).

### La cuenta atrás que se retrasa

`setInterval` no garantiza que los ticks lleguen a su hora: si la página está ocupada cuando toca un tick, el tick espera, y cuando la pila se libera entra **uno** atrasado (los demás se pierden, no se acumulan). Una cuenta atrás que resta 100 ms en cada tick mide «cuántas veces me llamaron», no «cuánto tiempo pasó», y se queda atrás:

[[exercise:04-deriva-de-setinterval.md-]]

```text
📄 300 ms generando el PDF… (los ticks no pueden entrar)
⌛ el reloj dice que la sesión ha caducado
✅ por reloj quedan → 0 ms
🐛 por ticks aún quedan > 0 ms → true
   (quedan 200 ms según los ticks; ticks recibidos: 8 de 10; varía)
```

La regla: el temporizador solo decide **cuándo refrescar**; el valor se calcula siempre a partir del reloj (`performance.now()` o `Date.now()`) y de una hora límite guardada al principio.

### El sondeo que se solapa

`setInterval` mide el tiempo entre **comienzos**. Si cada ejecución lanza un trabajo asíncrono que tarda más que el intervalo (una petición a un servidor lento), las ejecuciones se solapan y las respuestas llegan en cualquier orden: una respuesta vieja puede pisar a una nueva. Un `setTimeout` **recursivo**, que programa la siguiente ejecución cuando la anterior termina, mide la **pausa** entre ejecuciones y nunca tiene dos a la vez:

[[exercise:05-setinterval-se-solapa.md-]]

```text
🐛 setInterval → peticiones a la vez (máximo): 2
   orden de llegada → 2, 1, 3, 4 (la 1 pisa a la 2 con datos más viejos)
✅ setTimeout recursivo → peticiones a la vez (máximo): 1
   orden de llegada → 1, 2, 3, 4
```

### Pestañas en segundo plano

Cuando una pestaña no se ve, Chrome ahorra batería: sus temporizadores se agrupan y se ejecutan como mucho **una vez por segundo**, y si la pestaña lleva oculta más de cinco minutos, las cadenas de temporizadores pueden esperar hasta un minuto. Es otra razón para no fiarse de los ticks y calcular siempre con el reloj. No se puede ver en un ejemplo automático: prueba a cambiar de pestaña mientras corre una cuenta atrás en una página real.

## Callbacks: «llámame cuando termines»

En la lección «Formas de función» viste que un callback sirve para decir «llámame cuando pase algo». Con operaciones asíncronas, ese «algo» es que la operación termine. Una función asíncrona basada en callbacks **vuelve enseguida**, sin resultado (su `return` no sirve: el dato aún no existe), y **entrega** el resultado más tarde llamando al callback que recibió. La convención más extendida, la de Node.js, es «error primero»: `callback(error)` si falló, `callback(null, resultado)` si funcionó.

[[exercise:06-llamame-cuando-termine.md-]]

```text
🤔 getOrderWrong("P-501") → undefined
fin del script: los dos pedidos están «en camino»
📦 P-501: Sofía Ríos, $890
⛔ Pedido P-999 no encontrado
```

### La pirámide de callbacks

Cuando cada paso necesita el resultado del anterior, cada callback va **dentro** del anterior. Un pago en cinco pasos (carrito, stock, cobro, envío, email) se convierte en una pirámide, el famoso ***callback hell***, con la misma comprobación de error repetida en cada nivel:

[[exercise:07-callback-hell.md-]]

```text
▶ cliente C-1
  1. carrito → 2 producto(s), $305.00
  2. stock reservado → R-202
  3. cobrado → PAY-C-1-30500
  4. envío creado → MX-C-1-77
  5. email enviado
  ✅ pedido completado (MX-C-1-77)
▶ cliente C-2
  1. carrito → 1 producto(s), $180.00
  ⛔ pago fallido: sin stock de «mole poblano»
```

La forma de pirámide es lo de menos (se puede aplanar con funciones con nombre). Lo grave es lo que no se ve: los errores se propagan a mano en cada nivel, y hacer dos pasos **en paralelo** obliga a llevar contadores. En la lección «Promesas» este mismo pago será una cadena plana.

### Los errores escapan del `try/catch`

Un `try/catch` solo atrapa lo que se lanza **mientras** se ejecuta su bloque. Alrededor de un `setTimeout`, el bloque solo programa el callback y termina; cuando el callback lanza, 50 ms después, se ejecuta en otra tarea, con la pila vacía, y no hay ningún `try` esperándolo. Es lo que anunciaba la lección «Errores y excepciones»: los errores que ocurren «más tarde».

[[exercise:08-errores-en-callbacks.md-]]

```text
🐛 try: setTimeout programado, ningún error a la vista
🐛 el try/catch ya terminó; el callback aún no ha empezado
Uncaught SyntaxError: Expected ',' or '}' after property value in JSON at position 32 (line 1 column 33)
✅ error entregado al callback → SyntaxError
✅ pedido → P-732 | total → 1250
```

El error no tumba la página: el navegador lo anuncia como `Uncaught` y aborta solo esa tarea. Pero quien esperaba el resultado nunca se entera. La solución es atrapar el error **dentro** del callback y entregarlo por el canal de errores.

### Ceder el control

Al pasar un callback le das a otro código el control de tu programa: él decide si te llama, cuándo, cuántas veces y con qué argumentos. Es la **inversión de control**. Si una librería de pagos tiene un bug y llama a tu `onSuccess` dos veces, creas dos pedidos; si no llama nunca, tu página espera para siempre. Hay que defenderse a mano, con el envoltorio `once` de «Funciones de orden superior» y con un plazo:

[[exercise:09-callback-dos-veces.md-]]

```text
  🧾 pedido creado para Ana (PAY-4444)
  🧾 pedido creado para Luis (PAY-8888)
  🧾 pedido creado para Ana (PAY-4444)
  ⏰ Sofía: la pasarela no respondió
pedidos creados → Ana, Luis, Ana
🐛 Ana tiene dos pedidos → true
```

Una promesa da la vuelta a esa relación: la operación te devuelve un objeto que se cumple o se rechaza **una sola vez**, y tú decides qué hacer con él.

> **Desde Python:** el estilo de callbacks existe en Python (`future.add_done_callback`, `loop.call_later`, las librerías anteriores a `asyncio` como Twisted), pero casi nadie lo escribe hoy, porque `async/await` llegó a la vez que el resto de `asyncio`. En JavaScript verás mucho código antiguo con callbacks, y APIs del navegador que todavía los usan (eventos, temporizadores).

## Bestiario

- **La cadena de temporizadores lenta.**
  Síntoma: un trabajo troceado con `setTimeout(…, 0)` encadenados tarda mucho más de lo que suman sus trozos.
  Causa: a partir del quinto temporizador anidado, el retraso mínimo es de 4 ms.
  Solución: rebanadas de unos 10 ms (el mínimo pesa poco), o ceder con `MessageChannel` o `scheduler.yield()`.
  → [ver ejemplo](03-temporizadores-anidados-4-ms.md)
- **La cuenta atrás que se retrasa.**
  Síntoma: un reloj o una cuenta atrás hecha con `setInterval` se queda atrás cuando la página se ocupa o la pestaña pasa a segundo plano.
  Causa: los ticks que no pudieron ejecutarse a tiempo se pierden; contar ticks no mide el tiempo.
  Solución: guarda una hora límite y calcula lo que queda con el reloj en cada tick.
  → [ver ejemplo](04-deriva-de-setinterval.md)
- **El sondeo que se pisa a sí mismo.**
  Síntoma: con `setInterval`, varias peticiones están en marcha a la vez y una respuesta vieja sobrescribe a una más nueva.
  Causa: `setInterval` lanza cada ejecución a su hora, sin esperar a que termine el trabajo asíncrono de la anterior.
  Solución: `setTimeout` recursivo: programa la siguiente ejecución cuando llegue la respuesta.
  → [ver ejemplo](05-setinterval-se-solapa.md)
- **El error que el `try/catch` no atrapa.**
  Síntoma: un `Uncaught …` en la consola aunque la llamada está dentro de un `try/catch`.
  Causa: el callback se ejecuta más tarde, en otra tarea; el `try` ya había terminado.
  Solución: `try/catch` dentro del callback, y entrega el error por el canal de errores (`callback(error)`); o usa promesas.
  → [ver ejemplo](08-errores-en-callbacks.md)
- **El callback que llega dos veces (o ninguna).**
  Síntoma: pedidos duplicados, o una pantalla que espera para siempre.
  Causa: el código que recibe tu callback tiene el control; si tiene un bug, lo sufres tú.
  Solución: envuelve el callback con `once` y añade un plazo con `setTimeout`; o, mejor, usa una API de promesas.
  → [ver ejemplo](09-callback-dos-veces.md)

## Resumen

- `setTimeout(fn, ms, ...args)` encola `fn` cuando pasan **al menos** `ms`; `clearTimeout(id)` lo cancela (y es inofensivo si ya se ejecutó).
- `setInterval(fn, ms)` repite hasta `clearInterval(id)`: guarda siempre el identificador.
- Los temporizadores anidados no bajan de 4 ms; en pestañas ocultas, de 1 s.
- Los ticks perdidos no se recuperan: calcula el tiempo con el reloj y una hora límite.
- Para repetir trabajo asíncrono, `setTimeout` recursivo, no `setInterval`.
- Una función asíncrona con callbacks vuelve enseguida y entrega el resultado después, con la convención `(error, resultado)`.
- Los errores lanzados en un callback no llegan al `try/catch` de fuera; los callbacks anidados forman pirámides y ceden el control a otro código.

## Para profundizar

- [MDN: setTimeout (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
- [MDN: setInterval (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
- [javascript.info: setTimeout y setInterval](https://es.javascript.info/settimeout-setinterval)
- [javascript.info: introducción a los callbacks](https://es.javascript.info/callbacks)
- [Chrome Developers: limitación de temporizadores en segundo plano (en inglés)](https://developer.chrome.com/blog/timer-throttling-in-chrome-88)
