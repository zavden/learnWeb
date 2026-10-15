# El event loop

## Por qué importa

JavaScript ejecuta tu código en **una sola hebra**: hace una cosa cada vez. Y, sin embargo, una página espera respuestas del servidor, cuenta segundos, anima elementos y atiende clics, todo a la vez. El truco no está en el lenguaje, sino en el **event loop** (bucle de eventos): el mecanismo del navegador que decide qué trozo de código se ejecuta a continuación.

Entenderlo explica casi todas las sorpresas de este módulo: por qué un `console.log` dentro de un temporizador sale después de otro escrito más abajo, por qué `setTimeout(fn, 0)` no es inmediato, por qué una promesa resuelta «adelanta» a un temporizador y, sobre todo, lo que te prometimos en la lección «Control de flujo»: **por qué un script largo bloquea la página y cómo trocear el trabajo** para que no lo haga.

## Una hebra, una pila

La **pila de llamadas** (*call stack*) es la lista de funciones que se están ejecutando ahora mismo: cuando una función llama a otra, la nueva se apila encima; cuando termina, se desapila y el control vuelve a la de debajo. Es la misma pila que viste en la lección «Recursión y pila de llamadas», la que se desborda con `Maximum call stack size exceeded`.

La regla de oro del event loop es **ejecutar hasta completar** (*run to completion*): una vez que empieza un trozo de código, nadie lo interrumpe hasta que la pila se vacía. No hay otra hebra que pueda colarse a mitad de una función; lo que llega «mientras tanto» espera su turno en una cola.

```text
      pila de llamadas                       el navegador (otras hebras)
   ┌──────────────────────┐                ┌──────────────────────────────┐
   │ chargeCard           │                │ temporizadores, red, disco,  │
   │ checkout             │  setTimeout ─► │ clics del usuario…           │
   │ script               │                └──────────────┬───────────────┘
   └──────────▲───────────┘                               │ cuando algo está listo,
              │                                           │ encola su callback
              │  el event loop saca la siguiente   ┌──────▼───────────────────┐
              └──── tarea cuando la pila está ─────┤ cola de tareas           │
                    VACÍA                          │ [recordatorio] [clic] …  │
                                                   └──────────────────────────┘
```

Cuando llamas a `setTimeout(callback, 50)`, JavaScript no espera nada: le pasa el temporizador al **navegador**, que lleva la cuenta en otra parte, y sigue con la línea siguiente. Pasados los 50 ms, el navegador deja el callback en la **cola de tareas**. El event loop solo lo saca de ahí cuando la pila está vacía, es decir, cuando el script ha terminado. El ejemplo lleva una pila «a mano» para que lo veas: cuando el recordatorio se ejecuta, `checkout` y el script ya no están.

[[exercise:01-pila-y-cola.md-]]

```text
pila → script › checkout
pila → script › checkout › chargeCard
  💳 cobro $640 a Lucía
pila → script › checkout › scheduleReminder
  ⏲️ recordatorio programado… y seguimos
fin del script → pila vacía: true
pila → recordatorio
  ⏰ Lucía, tu pedido P-1042 sale mañana
```

Un «callback» es lo que viste en la lección «Formas de función»: una función que pasas a otra para que te llame cuando pase algo. Aquí, «algo» es que venza el temporizador; en el capítulo 6 será un clic, y en la lección «Promesas», una respuesta del servidor.

> **Desde Python:** es el mismo modelo que `asyncio`: una hebra, un bucle que va sacando trabajo de una cola, y nada que interrumpa al código que se está ejecutando. La diferencia es que en Python tú arrancas el bucle (`asyncio.run(main())`) y en el navegador el bucle **ya está en marcha** siempre: tu script es solo la primera tarea.

## Tareas y microtareas

Hay dos colas con reglas distintas:

- La **cola de tareas** (*task queue*, o *macrotareas*): el script inicial, los callbacks de `setTimeout` y `setInterval`, los eventos del usuario (clics, teclas), los mensajes de `MessageChannel` y de los workers. El event loop ejecuta **una** tarea por vuelta.
- La **cola de microtareas** (*microtask queue*): los callbacks de las promesas (`then`, `catch`, `finally`, y lo que viene tras un `await`) y los de `queueMicrotask(fn)`. Después de cada tarea, el event loop la **vacía entera**, incluidas las microtareas que se encolen mientras tanto.

Una vuelta del event loop, completa:

```text
┌─► 1. Saca UNA tarea de la cola y la ejecuta hasta que la pila se vacía.
│   2. Ejecuta TODAS las microtareas (también las que se añadan ahora).
│   3. ¿Toca pintar? (≈ cada 16,7 ms en una pantalla de 60 Hz)
│        callbacks de requestAnimationFrame → estilos → layout → pintado
└── 4. Vuelta a empezar.
```

El ejemplo numera cada línea por el orden en que **sale**, no por el orden en que está escrita. `Promise.resolve().then(fn)` es la forma más corta de programar una microtarea con una promesa (las promesas llegan en la lección 3):

[[exercise:02-microtareas-y-tareas.md-]]

```text
1. script: empieza el pago del pedido P-2077
2. script: termina
3. microtarea (then) → marco el pedido como pagado
4. microtarea (queueMicrotask) → actualizo el contador del carrito
5. microtarea anidada → todavía antes de cualquier tarea
6. tarea: setTimeout 0 → envío el email de confirmación
7. tarea encolada desde una microtarea → la última
```

`then` y `queueMicrotask` comparten la misma cola y se atienden por orden de llegada. La microtarea anidada (la 5) se encoló después que el temporizador (la 6), pero sale antes: mientras quede una microtarea, ninguna tarea entra.

### `setTimeout(fn, 0)` no es «ahora»

De ahí sale la primera sorpresa del módulo. `setTimeout(fn, 0)` no significa «ejecuta `fn` inmediatamente»: significa «encola `fn` como **tarea** cuando hayan pasado **al menos** 0 ms». Una tarea espera a que termine el código actual y a que se vacíen las microtareas. Y el retraso es un **mínimo**, no una cita: si el script sigue ocupado 150 ms, el temporizador de 0 ms se ejecuta 150 ms tarde.

[[exercise:03-settimeout-0-no-es-0.md-]]

```text
fin del script (150 ms de cálculo)
🐛 la microtarea, programada después, se ejecuta antes
✅ queueMicrotask → justo al terminar el script
🐛 setTimeout(…, 0) esperó ≥ 150 ms → true
   (esperó ≈ 151 ms; el número varía en cada ejecución)
```

`performance.now()` devuelve los milisegundos (con decimales) desde que se abrió la página: es el reloj para medir duraciones, y lo verás a fondo en la lección «Frames de animación y tiempo». Como el tiempo exacto depende del ordenador, los ejemplos imprimen comparaciones (`≥ 150 ms → true`) y, cuando dan un número, avisan de que varía. En la lección siguiente verás otra razón por la que `setTimeout(fn, 0)` tarda: los temporizadores anidados nunca bajan de 4 ms.

### `MessageChannel`: una tarea sin temporizador

Un `MessageChannel` es un tubo con dos extremos: lo que se envía con `port2.postMessage(dato)` llega a `port1.onmessage` como una **tarea** nueva. Se inventó para hablar con workers (capítulo 8) e iframes, pero es también la forma más directa de encolar una tarea sin pasar por un temporizador. El ejemplo lo usa para ver la regla del event loop en acción: las microtareas que crea un mensaje se ejecutan **antes** que el mensaje siguiente, aunque los tres mensajes ya estuvieran en la cola.

[[exercise:04-messagechannel-como-tarea.md-]]

```text
script: envío tres avisos de stock
script: termina
microtarea del script → antes que cualquier mensaje
📨 tarea 1: «café de Chiapas: quedan 3»
   microtarea creada en la tarea 1 → antes de la siguiente tarea
📨 tarea 2: «mole poblano: agotado»
   microtarea creada en la tarea 2 → antes de la siguiente tarea
📨 tarea 3: «cajeta: repuesto»
   microtarea creada en la tarea 3 → antes de la siguiente tarea
🔒 canal cerrado
```

Hay varias colas de tareas (temporizadores, mensajes, eventos del usuario…) y el navegador elige entre ellas con sus propias prioridades. Dentro de una misma fuente, el orden de llegada está garantizado; entre fuentes distintas (un mensaje frente a un `setTimeout`), no. Por eso ningún ejemplo de este módulo imprime ese orden.

### Las microtareas se vacían enteras

«Vaciar entera» la cola de microtareas tiene una consecuencia seria: una microtarea que encola otra, que encola otra… retrasa a **todas** las tareas, y también el pintado, hasta que la cadena termina. El ejemplo recalcula 100 000 precios con una cadena de microtareas; el temporizador, programado antes que nada, entra el último:

[[exercise:05-las-microtareas-se-vacian-enteras.md-]]

```text
script: cadena de microtareas lanzada
✅ microtareas → 100 000 productos recalculados
⏲️ setTimeout 0 → por fin entra
   productos procesados cuando entró → 100000
   ¿esperó a la cadena entera? → true
```

Una cadena **sin fin** de microtareas congela la pestaña exactamente igual que un `while (true)`, y la guarda de LearnWeb (que solo vigila bucles) no la detendría. Las microtareas sirven para «justo después del código actual»; para ceder el turno al navegador hacen falta **tareas**.

## Los pasos de renderizado

El navegador no pinta cada vez que cambias algo en la página: apunta los cambios y, cuando toca un frame (unas 60 veces por segundo en una pantalla de 60 Hz, 120 en una de 120 Hz), hace los **pasos de renderizado**: ejecuta los callbacks de `requestAnimationFrame`, recalcula estilos, hace el *layout* (posiciones y tamaños) y pinta. Esos pasos solo pueden ocurrir **entre tareas**, después de las microtareas.

`requestAnimationFrame(fn)` (rAF) pide «ejecuta `fn` justo antes del próximo pintado». Todos los rAF pedidos para el mismo frame reciben el **mismo instante**; uno pedido **dentro** de otro ya no entra en ese frame y espera al siguiente:

[[exercise:06-pasos-de-renderizado.md-]]

```text
1. script
2. microtarea → antes de cualquier pintado
3. rAF → paso de renderizado, justo antes de pintar
4. otro rAF del mismo frame → mismo instante: true
5. rAF anidado → frame siguiente: true
   entre frames ≈ 16.7 ms (≈ 16.7 a 60 Hz, ≈ 8.3 a 120 Hz; varía)
```

El orden entre un `setTimeout(fn, 0)` y un rAF no está garantizado: depende de cuánto falte para el siguiente frame. Las animaciones con rAF son el tema de la última lección del módulo.

## Una tarea larga congela la página

Junta las piezas: mientras una tarea ocupa la pila, el event loop no puede hacer **nada** más. No ejecuta temporizadores, no pinta y no atiende clics, que se quedan en la cola. El ejemplo genera un informe con 300 ms de cálculo síncrono. Ábrelo con «▶ Run», pulsa «Generar informe» y, enseguida, «Sumar 1» varias veces: el reloj se para, el texto «Calculando…» y la barra a medias nunca aparecen, y los clics se atienden todos de golpe al final.

[[exercise:07-tarea-larga-bloquea.md-(script.js)]]

```text
▶ informe generado de una vez
  🐛 la tarea duró ≥ 300 ms → true
  🐛 ticks del reloj durante la tarea → 0 (esperados ≈ 6)
  🐛 frames pintados durante la tarea → 0 (esperados ≈ 18 a 60 Hz)
  🐛 «Calculando…» y la barra a medias nunca llegaron a la pantalla
  ⏸️ reloj detenido
```

Chrome llama **tarea larga** (*long task*) a cualquiera que pase de 50 ms, y a partir de unos 100 ms la página se nota «trabada». Los bucles de la lección «Control de flujo» eran instantáneos; un bucle sobre cien mil pedidos, el análisis de un archivo grande o un algoritmo pesado no lo son.

### Trocear el trabajo

No puedes hacer que el cálculo dure menos, pero sí **repartirlo**: hacer un trozo pequeño (una *rebanada* de unos 10 ms), ceder el turno con un `setTimeout` y continuar en la tarea siguiente. Entre rebanada y rebanada, el event loop atiende el reloj, los clics y, cuando toca, pinta. Es el mismo informe, troceado:

[[exercise:08-trocear-el-trabajo.md-(script.js)]]

```text
▶ informe generado por rebanadas
  lotes procesados → 100
  ✅ rebanadas (tareas cortas) > 1 → true
  ✅ el reloj avanzó mientras tanto → true
  ✅ se pintaron frames mientras tanto → true
  el precio: tardó más de 300 ms en total → true
  ⏸️ reloj detenido
```

Fíjate en que la rebanada se mide por **tiempo** (un presupuesto de 12 ms), no por número de elementos: así funciona igual en un ordenador rápido y en un móvil lento. Y que ceder con una **microtarea** no serviría de nada: el event loop las vacía todas antes de pintar. En la lección «Frames de animación y tiempo» verás la versión moderna, `await scheduler.yield()`, que cede el turno dentro de un bucle normal; y en el capítulo 8, los *workers*, que ejecutan el cálculo en otra hebra.

## El mismo modelo que `asyncio`

El event loop no tiene magia. El ejemplo siguiente lo implementa en pequeño, con un reloj simulado: una cola de tareas, una de microtareas que se vacía entera tras cada tarea, frames cada 16 ms con sus rAF, y temporizadores que pasan a la cola de tareas cuando vencen.

[[exercise:09-event-loop-de-juguete.md-]]

```text
[t= 0 ms] 1. script: cobro el pedido P-3310
[t= 0 ms] 2. script: fin
[t= 0 ms] 3. microtarea → marco el pedido como pagado
[t= 0 ms] 4. microtarea anidada → actualizo el carrito
[t= 0 ms] 5. tarea: setTimeout 0 → email de confirmación
[t=16 ms] 6. rAF (frame de t=16) → muevo la barra de progreso
[t=16 ms] 🎨 estilos, layout y pintado
[t=20 ms] 7. tarea: setTimeout 20 → aviso al almacén
```

Si hiciste el módulo 6, este esqueleto te sonará: es el `CoopScheduler` de la cafetería simulada (top95, «planificador cooperativo»), con su cola de tareas listas, sus temporizadores ordenados por hora y su reloj que salta cuando nadie está listo. Allí, cada tarea era un generador que cedía el turno con `yield`; en el resto de este módulo verás que `await` es exactamente eso: un punto en el que una función se pausa y deja trabajar a las demás.

> **Desde Python:** el bucle de `asyncio` es el mismo esqueleto: `loop.call_soon` (cola de listos), `loop.call_later` (temporizadores) y el selector de entrada/salida. La diferencia es que **no hay microtareas con prioridad**: los callbacks de un `Future` resuelto van a la misma cola FIFO que `call_soon`.

```python
import asyncio

async def main():
    loop = asyncio.get_running_loop()
    print('1. script')
    loop.call_soon(lambda: print('3. call_soon (como una tarea)'))
    payment = loop.create_future()
    payment.add_done_callback(lambda f: print('4. callback del Future'))
    payment.set_result('pagado')
    print('2. script: fin')
    await asyncio.sleep(0)  # cede el turno al bucle

asyncio.run(main())
# 1, 2, 3, 4: el callback del Future espera detrás de call_soon.
# En JavaScript, el then de una promesa (microtarea) adelantaría al setTimeout.
```

## Bestiario

- **El temporizador de 0 ms que llega tarde.**
  Síntoma: el callback de `setTimeout(fn, 0)` se ejecuta después de código escrito más abajo, después de los `then` de las promesas, o con un retraso grande.
  Causa: `setTimeout` encola una **tarea**, que espera a que termine el código actual y a que se vacíen todas las microtareas; el retraso es un mínimo.
  Solución: no cuentes con el 0. Para «justo después del código actual», usa `queueMicrotask`; para ordenar pasos que dependen unos de otros, encadénalos (promesas, lección 3).
  → [ver ejemplo](03-settimeout-0-no-es-0.md)
- **La página congelada.**
  Síntoma: durante un cálculo, la página no responde: no se pinta («Cargando…» nunca aparece, las barras de progreso saltan de 0 a 100), los temporizadores se paran y los clics se atienden todos al final.
  Causa: una tarea larga ocupa la pila; el event loop no puede pintar ni sacar otras tareas hasta que termine.
  Solución: trocea el trabajo en rebanadas de unos 10 ms y cede el turno con una tarea entre una y otra (`setTimeout`; o `scheduler.yield()`, que atiende antes los clics pero pinta menos a menudo: lección «Frames de animación y tiempo»); para cálculos muy pesados, un worker (capítulo 8).
  → [ver ejemplo](07-tarea-larga-bloquea.md)

## Resumen

- JavaScript ejecuta tu código en una sola hebra; cada trozo se ejecuta hasta completar, sin interrupciones.
- El navegador lleva los temporizadores, la red y los eventos, y encola los callbacks como **tareas**.
- Cada vuelta del event loop: una tarea → **todas** las microtareas → (si toca) rAF, estilos, layout y pintado.
- Microtareas: `then`/`catch`/`finally`, lo que sigue a un `await` y `queueMicrotask`. Tareas: script, temporizadores, eventos, `MessageChannel`.
- `setTimeout(fn, 0)` encola una tarea: sale después de las microtareas y el retraso es un mínimo.
- Una tarea larga congela la página; trocéala en rebanadas medidas por tiempo y cede con una **tarea**, nunca con una microtarea.
- Es el modelo de `asyncio` y del planificador cooperativo del módulo 6, con una cola de microtareas prioritaria.

## Para profundizar

- [MDN: el modelo de concurrencia y el event loop](https://developer.mozilla.org/es/docs/Web/JavaScript/Event_loop)
- [javascript.info: event loop, microtareas y macrotareas](https://es.javascript.info/event-loop)
- [Jake Archibald: Tasks, microtasks, queues and schedules (en inglés)](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [web.dev: optimizar las tareas largas (en inglés)](https://web.dev/articles/optimize-long-tasks)
- [Python: el event loop de asyncio](https://docs.python.org/es/3/library/asyncio-eventloop.html)
