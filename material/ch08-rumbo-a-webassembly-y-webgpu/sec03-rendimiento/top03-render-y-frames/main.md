# Render y frames

## Por qué importa

Una página se siente rápida por dos cosas distintas. **Fluidez**: cada fotograma llega a tiempo y el movimiento no da tirones. **Respuesta**: al hacer clic o pulsar una tecla, algo cambia en pantalla enseguida. Las dos dependen del mismo recurso, el **hilo principal**, donde se ejecutan tu JavaScript, el cálculo de estilos, el layout y el pintado. Todo lo que tu código tarde de más se le quita a los fotogramas y a las respuestas.

Ya conoces las piezas: el paso de renderizado del event loop y las tareas largas («El event loop»), `requestAnimationFrame` y el hallazgo de que `scheduler.yield()` deja pintar poco («Frames de animación y tiempo»), el layout forzado («Medidas y layout») y el compositor que mueve capas sin el hilo principal («Rendimiento de las animaciones», en el capítulo de CSS). Esta lección los junta con las herramientas de la lección «Medir antes de optimizar»: el presupuesto de cada frame, cómo se esconde el *layout thrashing* en los componentes, cómo se observan las tareas largas y la métrica INP, cómo trocear y priorizar el trabajo, qué hacer en los ratos libres y cómo mostrar listas enormes.

## El presupuesto de un frame

La pantalla se refresca un número fijo de veces por segundo, y el navegador intenta producir un fotograma para cada refresco. El tiempo entre dos refrescos es el **presupuesto**: 1000 ms entre los hercios de la pantalla. Depende de la tuya: el MacBook Air M1 de este curso refresca a 60 Hz (16,7 ms); los portátiles con pantalla ProMotion y muchos móviles, a 120 Hz (8,3 ms). No mires la tabla: mide la tuya.

[[exercise:01-presupuesto-del-frame.md-(script.js)]]

```text
60 Hz → 16.7 ms por frame
90 Hz → 11.1 ms por frame
120 Hz → 8.3 ms por frame
144 Hz → 6.9 ms por frame
Listo: pulsa «Medir mi pantalla» (tarda un segundo y no anima nada)
// Tras pulsar «Medir mi pantalla»:
intervalos medidos: 60
// Los tiempos cambian en cada ejecución; en el M1 del curso:
tu pantalla: ≈ 16.7 ms entre frames → ≈ 60 Hz · frames que llegaron tarde: 1
```

[[exercise:01-presupuesto-del-frame.md]]

Ese presupuesto no es todo para tu JavaScript. En cada frame, el navegador recorre la cadena que ya conoces, y sus pasos también cuestan:

```text
 tareas e input ─▶ rAF ─▶ estilo ─▶ layout ─▶ paint ─▶ composite ─▶ pantalla
   (tu JS)        (tu JS)  └──────── hilo principal ────────┘   (compositor, GPU)
```

Una guía habitual: a 60 Hz, deja tu trabajo de cada frame en unos **10 ms**, y el resto para el navegador. Si un frame se pasa, no se pierde «un poco»: se pierde entero, y en pantalla se repite el anterior.

## 🐛 Layout thrashing entre componentes

En «Medidas y layout» viste el *layout thrashing* en un bucle: leer una medida tras escribir un estilo obliga al navegador a calcular el layout en ese instante, y alternarlos lo obliga en cada vuelta. En una aplicación real rara vez está en un bucle tan visible: está repartido entre **componentes**. Cada tarjeta de producto tiene su `fit()`, que lee su ancho y escribe su alto; cada una, por separado, es correcta. Recorrerlas todas es el bucle maldito, y nadie lo escribió a propósito:

[[exercise:02-thrashing-entre-componentes.md]]

```text
Listo: pulsa «Ajustar 240 tarjetas»
// Tras pulsar «Ajustar 240 tarjetas»:
tarjetas ajustadas: 240 · lecturas que forzaron un layout: 🐛 240 · ✅ 1
¿el mismo resultado final? true
¿por fases es ≥ 5 veces más rápido? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 fit() en un bucle: ≈ 110.0 ms · ✅ por fases: ≈ 2.5 ms
```

Como los componentes no se conocen entre sí, la solución es un **planificador por fases**: cada componente pide «quiero leer» y «quiero escribir», y el planificador ejecuta, en el próximo frame, primero todas las lecturas y después todas las escrituras (es la idea de la biblioteca *fastdom*). Un solo layout para todas las lecturas, y el de las escrituras lo hace el navegador en su sitio, dentro del frame.

[[exercise:02-thrashing-entre-componentes.md-(script.js)]]

Y antes de escribir el planificador, pregúntate si el CSS puede hacerlo solo: `aspect-ratio: 4 / 3` en la foto ajusta su alto sin una línea de JavaScript, sin lecturas y sin escrituras.

## Tareas largas y la respuesta al usuario

Una **tarea larga** es la que ocupa el hilo principal más de **50 ms**. ¿Por qué 50? Porque una respuesta por debajo de 100 ms se percibe como inmediata: si ninguna tarea pasa de 50, un clic espera como mucho 50 ms a que termine la que está en marcha y quedan otros 50 para atenderlo. La métrica INP de la lección «Medir antes de optimizar» mide justo eso, interacción a interacción:

```text
 clic ─▶ [ espera: otra tarea ocupa el hilo ] ─▶ [ tus manejadores ] ─▶ [ estilo, layout, pintado ] ─▶ se ve
          retraso de entrada                      procesamiento          retraso de presentación
         └──────────────────────────── duración de la interacción (INP: una de las peores) ───────────┘
```

Chrome tiene dos tipos de entrada para encontrar a los culpables. `longtask` (la API Long Tasks) avisa de cada tarea de más de 50 ms, con su duración y poco más. `long-animation-frame` (LoAF, desde Chrome 123) avisa de cada **frame** que tardó más de 50 ms en producirse y cuánto bloqueó (`blockingDuration`):

[[exercise:03-tareas-largas-observadas.md]]

```text
Listo: pulsa «Tarea de 120 ms (clic)» y, cuando vuelva a estar activo, «Frame de 100 ms (rAF)»
// Tras pulsar «Tarea de 120 ms (clic)»:
— tarea de 120 ms (clic) —
longtask: 1 · name: self · ¿más de 50 ms? true
long-animation-frame: 1 · ¿más de 50 ms? true · ¿con tiempo de bloqueo? true
// Tras pulsar «Frame de 100 ms (rAF)»:
— frame de 100 ms (rAF) —
longtask: 1 · name: self · ¿más de 50 ms? true
long-animation-frame: 1 · ¿más de 50 ms? true · ¿con tiempo de bloqueo? true
```

El ejemplo necesita una vista previa visible (con ↗ o en el editor): sin frames que pintar, no hay frames largos. En una página normal, cada entrada LoAF trae además la lista `scripts` con los culpables: qué tipo de código fue (`invokerType`: `event-listener` para un manejador de eventos, `user-callback` para un rAF o un temporizador, `resolve-promise`, `classic-script`…), de qué archivo (`sourceURL`) y qué función (`sourceFunctionName`). Es lo que usan las herramientas de monitorización de sitios reales para señalar al culpable de un INP malo. En la vista previa de LearnWeb esa lista llega vacía, así que el ejemplo no la imprime. En una grabación del panel Performance, las tareas largas llevan un triángulo rojo, y la pista **Interactions** muestra cada clic con su duración partida en esas tres fases.

### 🐛 El clic que pinta tarde

El error más común que empeora el INP no es un algoritmo lento: es hacer el trabajo **antes** de enseñar la respuesta. El manejador escribe «Guardando…», sigue trabajando 200 ms en la misma tarea y, cuando el navegador por fin puede pintar, el texto ya dice «Guardado»: el usuario no vio ninguna reacción a su clic durante 200 ms.

[[exercise:04-clic-que-pinta-tarde.md]]

```text
Listo: pulsa «Guardar 🐛» y, cuando acabe, «Guardar ✅»
// Tras pulsar «Guardar 🐛»:
🐛 del clic al siguiente pintado: ¿más de 150 ms? true · ¿se vio «Guardando…»? false
// Tras pulsar «Guardar ✅»:
✅ del clic al siguiente pintado: ¿menos de 100 ms? true · ¿se vio «Guardando…»? true
```

La versión ✅ cambia el orden: escribe la respuesta visible, **cede hasta el próximo pintado** (`requestAnimationFrame` y, dentro, un `setTimeout`: el patrón de «Frames de animación y tiempo») y después trabaja. El trabajo sigue siendo una tarea larga; si mientras tanto el usuario vuelve a hacer clic, ese segundo clic esperará. Para eso está la sección siguiente.

[[exercise:04-clic-que-pinta-tarde.md-(script.js)]]

## Trocear y priorizar

En «El event loop» troceaste un cálculo con `setTimeout`; en «Frames de animación y tiempo», con `await scheduler.yield()` dentro de un bucle normal, y mediste que sus continuaciones tienen tanta prioridad que Chrome apenas pinta entre ellas. El resumen de lo que ya sabes:

| Cedes con… | Clics y teclas | Pintado | Nota |
|---|---|---|---|
| `setTimeout(fn, 0)` | entre trozos | sí | tras 5 anidados, mínimo de 4 ms |
| `await scheduler.yield()` | entre trozos | a saltos | Chrome 129+; la continuación va delante de las demás tareas |
| rAF + `setTimeout` | entre trozos | cada frame | el total tarda más |

Chrome tiene además una API completa de **prioridades**: `scheduler.postTask(fn, { priority })` encola una tarea en una de tres colas, `user-blocking` (lo que el usuario está esperando ya), `user-visible` (lo normal) y `background` (lo que puede esperar), y el navegador saca siempre de la más urgente. Un `TaskController` permite cancelar una tarea pendiente o cambiarle la prioridad. Y una continuación de `scheduler.yield()` dentro de una tarea de `postTask` conserva la prioridad de esa tarea.

[[exercise:05-prioridades-con-posttask.md-]]

```text
scheduler.postTask disponible → true
orden de ejecución →
  user-blocking: responder a la tecla
  user-visible: pintar los resultados
  background: enviar la analítica
precarga cancelada → AbortError
con setPriority('user-blocking') → B: decodificar la imagen visible · A: comprimir el historial
```

Lo que antes comprobabas a ojo (el reloj avanza, los clics responden), ahora se puede **medir**: la API Long Tasks cuenta las tareas de más de 50 ms. El mismo trabajo de 140 ms, de una vez y en rebanadas de 8 ms:

[[exercise:06-trocear-y-comprobarlo.md]]

```text
Listo: pulsa «Facturar» (unos 300 ms de trabajo en total)
// Tras pulsar «Facturar»:
🐛 de una vez → tareas largas: 1
✅ en rebanadas de 8 ms → tareas largas: 0
¿el mismo total? true · total facturado: $273,876.00
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ rebanadas: ≈ 20 · tiempo total ≈ 163 ms
```

Fíjate en que la rebanada se mide por **tiempo**, no por número de pedidos: 8 ms en el Mac del curso son muchos más pedidos que en un móvil, y la página responde igual en los dos.

[[exercise:06-trocear-y-comprobarlo.md-(script.js)]]

## Trabajo que puede esperar: `requestIdleCallback`

Hay trabajo que no corre ninguna prisa: preparar la analítica, precargar la página siguiente, construir un índice de búsqueda, guardar un borrador. `requestIdleCallback(fn, { timeout })` lo ejecuta en los **ratos libres** del navegador: después de pintar un frame, si no queda nada urgente antes del siguiente. Tu función recibe un `deadline`: `deadline.timeRemaining()` dice cuántos milisegundos quedan de ese rato (nunca más de 50, para que un clic que llegue espere poco) y `deadline.didTimeout` dice si te llama porque venció el `timeout` y no porque hubiera rato libre.

[[exercise:07-trabajo-en-ratos-libres.md]]

```text
Listo: pulsa «Registrar 300 vistas» (unos 45 ms de trabajo, repartidos)
// Tras pulsar «Registrar 300 vistas»:
procesadas: 300 de 300 · ¿timeRemaining() pasó alguna vez de 50 ms? false
// Los tiempos cambian en cada ejecución; en el M1 del curso:
ratos libres usados: ≈ 5 · llamadas por timeout: 0
```

El patrón es siempre el mismo: procesar de uno en uno **mientras quede tiempo** (`timeRemaining() > 1`) y, si queda trabajo, pedir otro rato libre. Con una animación en marcha, los ratos libres son los huecos entre frame y frame; con la página quieta, trozos de 50 ms.

[[exercise:07-trabajo-en-ratos-libres.md-(script.js)]]

### 🐛 El DOM no va en el rato libre

`timeRemaining()` es una promesa que haces al navegador: «termino antes de esa hora». Pero solo cuenta el tiempo de **tu** código. Si en el rato libre añades filas a una tabla y lees una medida (para bajar el scroll, por ejemplo), el estilo y el layout de esas filas se calculan en ese momento, y nadie los había contado: el rato libre se pasa de su plazo, y lo que llegue mientras tanto (un clic, el siguiente frame) espera.

[[exercise:08-dom-en-el-rato-libre.md]]

```text
Listo: pulsa «Indexar con 🐛 y con ✅»
// Tras pulsar «Indexar con 🐛 y con ✅»:
🐛 filas en la tabla: 2000 · ¿algún rato libre se pasó de su plazo (más de 1 ms)? true
✅ filas en la tabla: 2000 · ratos libres que se pasaron de su plazo: 0
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 ratos libres: ≈ 5 · el peor se pasó ≈ 90.0 ms
✅ ratos libres: ≈ 15 · el peor se pasó ≈ 0.0 ms
```

La regla: en el rato libre, **solo trabajo puro** (calcular, indexar, comprimir, preparar datos); los cambios del DOM, en `requestAnimationFrame`, justo antes del frame que los va a pintar.

## Listas largas

Mostrar 10 000 filas cuesta aunque solo se vean nueve: el navegador calcula el estilo, el layout y el pintado de todas. Hay dos remedios, de menos a más radical.

**`content-visibility: auto`** (una propiedad de CSS) le dice al navegador que puede **saltarse** el layout y el pintado del contenido de un elemento mientras esté fuera de la pantalla. Con `contain-intrinsic-size: auto 32px` le das un tamaño de reserva, para que la barra de scroll sea correcta sin calcular nada. Las filas siguen en el DOM: la búsqueda del navegador (<kbd>⌘</kbd><kbd>F</kbd>), los enlaces a un `#id` y los lectores de pantalla las encuentran.

La **virtualización** va más lejos: solo **existen** las filas que se ven (y unas pocas de margen). Un espaciador con la altura total da la barra de scroll, y cada vez que te desplazas se rehacen las filas visibles. La viste completa en el ejemplo profesional «Lista virtualizada» del módulo del DOM. Es la única que aguanta un millón de filas, pero tiene un precio: lo que no está en el DOM no lo encuentra la búsqueda del navegador ni un lector de pantalla, así que cada fila lleva `aria-setsize` y `aria-posinset`, y la aplicación necesita su propio buscador.

[[exercise:09-listas-largas.md]]

```text
filas en el DOM: 13 de 10000 · la primera es la 1
Listo: pulsa «Ir a la canción 5000» y después «Comparar las tres formas»
// Tras pulsar «Ir a la canción 5000»:
filas en el DOM: 17 de 10000 · la primera es la 4996
// Tras pulsar «Comparar las tres formas»:
filas en el DOM → todas: 10000 · content-visibility: 10000 · virtualizada: 17
// Los tiempos cambian en cada ejecución; en el M1 del curso:
primer layout → todas: ≈ 118.0 ms · content-visibility: ≈ 20.0 ms · virtualizada: ≈ 0.3 ms
```

[[exercise:09-listas-largas.md-(script.js)]]

Empieza por `content-visibility: auto` en las secciones de una página larga (un artículo con muchas secciones, un historial de pedidos): es una línea de CSS y no rompe nada. Virtualiza cuando las filas se cuenten por decenas de miles o cada una sea cara.

## Eventos en ráfaga: un render por frame

Algunos eventos llegan muchas veces por segundo. Chrome ya entrega los continuos del usuario (`pointermove`, `touchmove`, `scroll`, `resize`) como mucho una vez por frame. Lo que llega por la red, de un worker o de un temporizador, no: un teletipo de bolsa puede mandar cuatro precios entre frame y frame, y pintar cada uno es trabajo que nadie ve. El remedio es guardar **el último dato** y pedir **un solo** `requestAnimationFrame`:

[[exercise:10-un-render-por-frame.md]]

```text
20 mensajes en la misma tarea → 🐛 renders: 20
20 mensajes en la misma tarea → ✅ renders: 1 (en el siguiente frame, con el último precio: CERSUR $17.59)
Listo: pulsa «Conectar 3 segundos»
// Tras pulsar «Conectar 3 segundos» y esperar 3 s:
¿✅ pintó como mucho una vez por frame? true · ¿🐛 pintó más veces que frames hubo? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
mensajes: ≈ 750 · renders 🐛: ≈ 750 · ✅: ≈ 180 · frames: ≈ 180
```

[[exercise:10-un-render-por-frame.md-(script.js)]]

Es una tercera herramienta junto a las dos que escribiste en «Funciones de orden superior» y usaste con eventos reales en «Acciones por defecto»: **debounce** (espera a que paren: buscar mientras se escribe) y **throttle** (como mucho cada tanto: guardar la posición del scroll). Para trabajo visual, el mejor ritmo es el de la pantalla. Y en la misma lección viste el otro truco de los eventos en ráfaga: los listeners de `touchmove` y `wheel` con `{ passive: true }`, que dejan desplazar la página sin esperar a tu código.

## Fuera del hilo principal

Todo lo anterior reparte mejor el trabajo **en** el hilo principal. La otra salida es sacarlo de él. Las animaciones de CSS que solo cambian `transform` y `opacity` las mueve el compositor aunque JavaScript esté ocupado («Rendimiento de las animaciones»). Un cálculo pesado que no toca el DOM (procesar una imagen, comprimir un archivo, analizar un CSV de 100 MB) puede ir a un **worker**, otra hebra que habla con la página por mensajes: es el módulo «Workers y concurrencia». El módulo «WebAssembly» hará ese cálculo más rápido, y los de la GPU lo harán en miles de núcleos a la vez.

> **Desde Python:** Python no tiene un bucle de frames (lo tienen las bibliotecas gráficas, como el `mainloop` de tkinter), pero el event loop de `asyncio` funciona como el del navegador: una sola hebra, tareas cooperativas y nada en paralelo. Una corrutina que calcula sin hacer `await` bloquea todas las demás, igual que una tarea larga; `await asyncio.sleep(0)` es el `scheduler.yield()` de Python. Y en modo depuración (`asyncio.run(main(), debug=True)`), asyncio avisa de cada paso que tarda más de `loop.slow_callback_duration` (100 ms por defecto): su propia API de tareas largas.

## Bestiario

- **La página se congela al ajustar unos cientos de componentes.**
  Síntoma: un recorrido por componentes tarda decenas de milisegundos; Performance muestra muchas barras «Layout» con el aviso *Forced reflow*.
  Causa: cada componente lee una medida y escribe un estilo; en un bucle, cada lectura fuerza un layout (thrashing repartido entre componentes).
  Solución: todas las lecturas primero y después todas las escrituras (un planificador por fases en rAF), o CSS que no necesite medir (`aspect-ratio`).
  → [ver ejemplo](02-thrashing-entre-componentes.md)
- **El botón no reacciona al clic hasta que termina.**
  Síntoma: el texto «Guardando…» nunca aparece; la pista Interactions muestra un clic de cientos de milisegundos.
  Causa: el manejador escribe la respuesta y sigue trabajando en la misma tarea; el navegador no puede pintar hasta el final.
  Solución: escribe la respuesta, cede hasta el próximo pintado (rAF + `setTimeout`) y trabaja después, en trozos si es largo.
  → [ver ejemplo](04-clic-que-pinta-tarde.md)
- **El trabajo «en segundo plano» provoca tirones.**
  Síntoma: un `requestIdleCallback` que debería ser invisible retrasa clics o frames.
  Causa: el callback toca el DOM y lee medidas; el estilo y el layout que provoca no están en `timeRemaining()` y se pasa de su plazo.
  Solución: en el rato libre, solo trabajo puro; los cambios del DOM, en `requestAnimationFrame`.
  → [ver ejemplo](08-dom-en-el-rato-libre.md)

## Resumen

- El presupuesto de un frame es 1000 ms / Hz: 16,7 ms a 60 Hz, 8,3 ms a 120 Hz; tu JavaScript, unos 10 ms a 60 Hz.
- Lecturas y escrituras de layout separadas por fases, también entre componentes; mejor aún, CSS que no necesite medir.
- Una tarea larga pasa de 50 ms; `longtask` y `long-animation-frame` (que en una página normal nombra a los scripts culpables) se observan con `PerformanceObserver`.
- INP = retraso de entrada + procesamiento + presentación: enseña la respuesta primero y trabaja después.
- Trocea por tiempo y cede (`setTimeout`, `scheduler.yield()`, rAF + `setTimeout`); `scheduler.postTask` añade prioridades y cancelación.
- `requestIdleCallback` para lo que puede esperar, mirando `timeRemaining()`; nunca el DOM en el rato libre.
- Listas largas: `content-visibility: auto` primero; virtualización para decenas de miles de filas, con `aria-setsize`/`aria-posinset`.
- Datos más rápidos que la pantalla: guarda el último y pinta una vez por frame.

## Para profundizar

- [web.dev: optimizar las tareas largas (en inglés)](https://web.dev/articles/optimize-long-tasks)
- [web.dev: Interaction to Next Paint (INP) (en inglés)](https://web.dev/articles/inp)
- [Chrome for Developers: Long Animation Frames API (en inglés)](https://developer.chrome.com/docs/web-platform/long-animation-frames)
- [MDN: Prioritized Task Scheduling API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Prioritized_Task_Scheduling_API)
- [web.dev: content-visibility (en inglés)](https://web.dev/articles/content-visibility)
