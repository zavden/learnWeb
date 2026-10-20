# Integración: rendimiento

## Por qué importa

Las tres lecciones del módulo enseñan a mirar el rendimiento desde tres sitios: **medir** (relojes, marcas, observadores, benchmarks honestos), **la memoria** (lo que cuesta asignar y lo que nunca se libera) y **los frames** (el presupuesto, el layout, las tareas largas, los ratos libres). En una página real los tres problemas llegan juntos: un informe que tarda en pintarse crea un formateador por fila, busca con `includes` y lee medidas entre escritura y escritura; un buscador que se traba tiene a la vez una tarea larga y un listener de más.

Los ejemplos de esta página combinan dos o tres lecciones cada uno. Los que miden lo hacen desde un botón, imprimen primero lo que no cambia (contadores, conteos, resultados) y después los tiempos, que en el texto aparecen bajo «Los tiempos cambian en cada ejecución». Los que animan duran unos segundos, se pausan y respetan «reducir movimiento». Para ver las medidas en DevTools, ábrelos con ↗.

## Las decisiones que se repiten

| Síntoma | Primero mide con… | Y luego… | Lección |
|---|---|---|---|
| «esto va lento» | `performance.mark/measure` alrededor de cada fase; el panel Performance | arregla la fase que más pesa | «Medir antes de optimizar» |
| una función caliente | `bench` (calentar, lotes, mediana, resultado usado) | cambia de algoritmo antes que de truco | «Medir antes de optimizar» |
| el mismo objeto caro, una y otra vez (`Intl`, expresiones, cálculos) | contar cuántos se crean | crear uno y reutilizarlo, o una caché con tope | «Medir antes de optimizar», «Memoria y recolector de basura» |
| tirones en una animación | el trabajo de cada frame; las barras «Minor GC» | typed arrays y pools: nada nuevo en el bucle | «Memoria y recolector de basura» |
| la memoria crece al usar la página | Performance monitor, heap snapshots | `AbortController`, `clearInterval`, cachés con tope | «Memoria y recolector de basura» |
| medidas y estilos que se alternan | contar lecturas con escrituras pendientes | todas las lecturas y luego todas las escrituras | «Render y frames» |
| la página no responde mientras calcula | `longtask` y `long-animation-frame` | trocear por tiempo y ceder; o un worker | «Render y frames» |
| más eventos que frames | contar eventos y renders | un render por frame con rAF | «Render y frames» |
| trabajo que puede esperar | — | `requestIdleCallback`, sin tocar el DOM | «Render y frames» |

Dos reglas atraviesan la tabla. **Contar antes que cronometrar**: los tiempos cambian con cada ejecución y cada ordenador, pero «150 formateadores creados», «240 layouts forzados» o «5 listeners vivos» son exactos, y casi siempre explican el tiempo. Y **el arreglo más rentable suele ser hacer menos**, no hacerlo más rápido: menos objetos, menos layouts, menos renders, menos datos guardados.

## Ejemplos combinados

### Un perfil antes y después

El informe de 150 ventas se pinta con tres errores clásicos a la vez: un `Intl.NumberFormat` por fila, `includes` para saber si el cliente es preferente y una lectura del ancho de la tabla después de añadir cada fila. Las marcas de User Timing envuelven cada versión (`informe 🐛` e `informe ✅` en la pista Timings de DevTools), y los contadores explican de dónde sale la diferencia. Las dos tablas dicen exactamente lo mismo.

[[exercise:01-perfil-antes-y-despues.md]]

```text
Listo: 150 ventas cargadas; pulsa «Pintar el informe 🐛 y ✅» (con ↗ y DevTools › Performance, verás las dos medidas en la pista Timings)
// Tras pulsar «Pintar el informe 🐛 y ✅»:
🐛 formateadores creados: 150 · comparaciones de clientes: 275 · lecturas que forzaron un layout: 150
✅ formateadores creados: 1 · búsquedas en el Set: 150 · lecturas que forzaron un layout: 1
¿las dos tablas dicen lo mismo? true · clientes preferentes: 50
¿la versión ✅ es ≥ 5 veces más rápida? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
medida «informe 🐛» ≈ 40.0 ms · «informe ✅» ≈ 2.0 ms
```

[[exercise:01-perfil-antes-y-despues.md-(script.js)]]

### Un buscador que no se traba

Veinte mil productos y una búsqueda que tolera una errata (`moel` encuentra `mole`): calcular la distancia de edición con cada palabra cuesta lo suficiente como para trabar la página si se hace de golpe. Se juntan cinco técnicas: el índice se construye en los **ratos libres** después de cargar; cada pulsación espera a que dejes de escribir (**debounce**); una búsqueda nueva **cancela** la anterior con `AbortController`; el filtrado va en **rebanadas** de 6 ms que ceden el turno; y la distancia se calcula con tres filas de `Int32Array` **reutilizadas**, sin crear arrays por palabra. Una marca mide cada búsqueda y la API Long Tasks confirma que no hubo ninguna tarea larga.

[[exercise:02-buscador-que-no-se-traba.md]]

```text
Listo: espera a que el índice esté preparado y escribe «mole» de corrido; prueba también «moel», con una errata
índice listo: 20000 productos, construido en los ratos libres
// Tras escribir «mole» de corrido:
⌨️ pulsaciones: 4 · búsquedas lanzadas: 1 · canceladas: 0
🔎 «mole» → 6667 productos (se muestran 20) · tareas largas durante la búsqueda: 0
// Los tiempos cambian en cada ejecución; en el M1 del curso:
búsqueda «mole» ≈ 80 ms en ≈ 14 rebanadas
// Tras seleccionar el texto y escribir «moel»:
⌨️ pulsaciones: 4 · búsquedas lanzadas: 1 · canceladas: 0
🔎 «moel» → 6667 productos (se muestran 20) · tareas largas durante la búsqueda: 0
búsqueda «moel» ≈ 80 ms en ≈ 14 rebanadas
```

[[exercise:02-buscador-que-no-se-traba.md-(script.js)]]

### Una animación que vigila su presupuesto

Confeti con un **pool en typed arrays**: las partículas vivas ocupan el principio de seis arrays, y cuando una muere, la última ocupa su hueco (así nunca hay huecos ni objetos nuevos). Se dibujan por lotes, un `fill()` por color. Un **controlador de calidad**, una función pura que se prueba sin pantalla, baja el número de partículas cuando el trabajo de un frame pasa de 8 ms tres veces seguidas y lo sube tras 60 frames holgados. La animación dura 3 segundos, se pausa, se detiene al ocultar la pestaña y, con «reducir movimiento», se queda en una imagen fija.

[[exercise:03-animacion-con-presupuesto.md]]

```text
frame 6: calidad 0 → 1 (1500 partículas)
frame 10: calidad 1 → 2 (750 partículas)
frame 70: calidad 2 → 1 (1500 partículas)
tras 120 pasos de prueba: 1500 partículas vivas, 710 retiradas y sustituidas, 0 objetos creados (6 typed arrays de 3000 casillas)
Listo: pulsa «Lanzar confeti (3 s)»
// Tras pulsar «Lanzar confeti (3 s)» y esperar:
▶ lanzado
🎉 fin del confeti
// Los tiempos cambian en cada ejecución; en el M1 del curso:
frames: ≈ 180 · cambios de calidad: ≈ 0 · peor frame: ≈ 4.0 ms de trabajo
```

En el Mac del curso, 3000 partículas caben de sobra en el presupuesto y la calidad no cambia. Para ver el controlador trabajar, ralentiza la CPU en DevTools (Performance › ⚙ › CPU: 6× slowdown) y lanza otra vez.

[[exercise:03-animacion-con-presupuesto.md-(script.js)]]

### Analítica en los ratos libres

Las vistas de producto se apuntan en una **cola con tope** (si nadie envía, se descartan las más viejas: la memoria no crece sin límite), se preparan en los **ratos libres** y salen por lotes de 50 hacia la API de prueba. Lo importante pasa al **ocultarse la pestaña**: puede que no haya un «después», así que lo pendiente se prepara y se envía en el acto con `fetch` y `keepalive: true`, que mantiene viva la petición aunque la página se cierre. La petición va como texto plano para ser una petición simple, sin preflight.

[[exercise:04-analitica-en-ratos-libres.md]]

```text
120 vistas registradas al cargar · en cola: 120
Listo: pulsa «Ver» en algún producto y cambia de pestaña (o pulsa «Enviar lo pendiente ahora»)
lote completo → lote 1: 50 eventos · el servidor recibió 50 (estado 200)
lote completo → lote 2: 50 eventos · el servidor recibió 50 (estado 200)
tras los lotes completos, preparados esperando: 20 · descartados: 0
// Tras pulsar «Ver» tres veces y cambiar de pestaña:
🙈 pestaña oculta, con keepalive → lote 3: 23 eventos · el servidor recibió 23 (estado 200)
```

`navigator.sendBeacon(url, datos)` hace lo mismo con una línea, pero no devuelve la respuesta. Las dos piden lo mismo: que el envío no dependa de que la página siga abierta.

[[exercise:04-analitica-en-ratos-libres.md-(script.js)]]

### Precios con descuento, sin trabajo de más

Una tabla de 400 precios que responde a un control deslizante. Arrastrar el control dispara decenas de eventos `input` por segundo; cada uno solo pide un render, y el render real ocurre **una vez por frame**. Cada moneda tiene **un único** `Intl.NumberFormat`, creado la primera vez que se usa, y los textos ya formateados salen de una **caché LRU** con tope de 2000 entradas: al volver a un descuento ya visto, todo son aciertos.

[[exercise:05-precios-con-descuento.md]]

```text
30 cambios del descuento en la misma tarea → renders hasta ahora: 0
… y en el siguiente frame: 1 render · primer precio con 30 %: $105.00
formateadores creados: 1 · caché de textos: 400 fallos, 0 aciertos
Listo: mueve el descuento adelante y atrás y cambia de moneda; mira los contadores
```

Al mover el control, la línea de contadores enseña más eventos que renders, y al cambiar de moneda, un formateador más (como mucho tres). La tabla se crea una sola vez: cada render cambia el texto de 400 celdas, no reconstruye las filas.

[[exercise:05-precios-con-descuento.md-(script.js)]]

### Un mapa de calor sin basura

Un mapa de calor del puntero: cada `pointermove` suma calor a una rejilla de 32 × 20 guardada en un `Float32Array`, y un único bucle de `requestAnimationFrame` la convierte en píxeles (un `ImageData` creado una vez), la enfría y se detiene solo cuando ya no queda calor. Chrome entrega como mucho un `pointermove` por frame, pero guarda los intermedios en `getCoalescedEvents()`: así un movimiento rápido no deja huecos. Con el teclado, un cursor propio recorre el mapa con las flechas.

[[exercise:06-mapa-de-calor.md]]

```text
100 puntos simulados → celdas con calor: 30 · la más caliente: columna 3, fila 4 (1)
estructuras creadas: 2 (un Float32Array de 640 casillas y un ImageData de 2560 bytes); por evento: 0
Listo: mueve el puntero por el escaparate (o entra con Tab y usa las flechas)
```

[[exercise:06-mapa-de-calor.md-(script.js)]]

## Ejercicios

Los tres ejercicios se corrigen solos y **no dependen de la velocidad de tu ordenador**: comprueban conteos (layouts forzados, llamadas, listeners vivos) y valores calculados con un reloj o un frame simulados. Al abrirlos, casi todas las comprobaciones salen en rojo; las que ya salen en verde comprueban algo que el código de partida hace bien y que tu cambio no debe romper.

### Arregla el thrashing con un planificador por fases

Treinta postales que se ajustan solas, y un planificador `frameTasks` que ejecuta cada tarea al momento. Hazlo de verdad: encolar, pedir un solo frame y, en él, primero todas las lecturas y después todas las escrituras. El frame lo simula la comprobación (por eso `requestFrame` es una propiedad que se puede sustituir), así que funciona también en una tarjeta. Seis comprobaciones (una ya sale en verde).

[[exercise:07-ej-planificador-por-fases.md]]

### Haz honesto este benchmark

El `bench` de partida mide una sola llamada, no calienta, tira el resultado y devuelve la media. Arréglalo con las reglas de la lección «Medir antes de optimizar». Las comprobaciones le pasan un reloj simulado con una medida «pausada» en medio, para que la mediana y la media den números distintos. Seis comprobaciones (dos ya salen en verde).

[[exercise:08-ej-benchmark-honesto.md]]

### Tapa las fugas del panel de chat

Un panel de chat con tres fugas: un listener de `resize` en `window`, un `setInterval` y un `Map` con los mensajes de cada sala. Una auditoría abre y cierra el panel cinco veces mientras cuenta listeners y temporizadores, y al final deja `window` como estaba. Cinco comprobaciones (una ya sale en verde).

[[exercise:09-ej-tapa-la-fuga.md]]

## Resumen

- Mide por fases con marcas y medidas; cuenta lo que se crea, se lee y se registra: los conteos explican los tiempos.
- Lo caro que se repite (formateadores, cálculos) se crea una vez o se guarda en una caché con tope.
- En los bucles calientes y en cada evento, nada nuevo: typed arrays y pools creados al empezar.
- Lecturas y escrituras de layout, por fases; los renders, uno por frame; el trabajo largo, en rebanadas que ceden.
- Lo que puede esperar, en los ratos libres; lo que no puede perderse, con `keepalive` al ocultarse la página.
- Cada apertura con su `AbortController`; cada temporizador con su `clearInterval`; cada caché con su límite.

## Para profundizar

- [web.dev: Optimiza el INP (en inglés)](https://web.dev/articles/optimize-inp)
- [Chrome for Developers: Performance monitor (en inglés)](https://developer.chrome.com/docs/devtools/performance-monitor)
- [MDN: fetch() y la opción keepalive (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#keepalive)
- [MDN: PointerEvent.getCoalescedEvents() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents)
