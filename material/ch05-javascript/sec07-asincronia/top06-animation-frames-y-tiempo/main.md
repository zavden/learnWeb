# Frames de animación y tiempo

## Por qué importa

Una animación es una sucesión de imágenes fijas, y el navegador dibuja una por **frame**: unas 60 por segundo en la mayoría de pantallas, 120 o más en las de alta frecuencia. Para animar con JavaScript hay que cambiar la página **justo antes** de cada pintado, ni más ni menos veces, y calcular cada posición a partir del **tiempo** que ha pasado. Esa es la tarea de `requestAnimationFrame` y de `performance.now()`.

Esta lección cierra el módulo juntando todo lo anterior: el paso de renderizado del event loop, los temporizadores que no son relojes, las promesas y la cancelación. Y tiene sus propias sorpresas: animaciones que van el doble de rápido en un monitor de 120 Hz, objetos que saltan al volver de otra pestaña, y un cálculo pesado troceado con la herramienta más moderna, `scheduler.yield()`, que aun así deja la animación a saltos.

Una aclaración antes de empezar: para animaciones sencillas de interfaz (un menú que se despliega, un botón que cambia de color) lo normal es usar transiciones y animaciones de CSS (módulo «Transiciones y animaciones» del capítulo de CSS), que el navegador puede ejecutar sin pasar por JavaScript. `requestAnimationFrame` es para lo que CSS no puede hacer: juegos, gráficos en `canvas`, física, animaciones que dependen de datos.

## Dos relojes

JavaScript tiene dos relojes con propósitos distintos. `Date.now()` es la **hora del calendario**: milisegundos desde el 1 de enero de 1970 (UTC), la que viste en la lección «Fechas e Intl». Puede **saltar** hacia delante o hacia atrás cuando el sistema sincroniza la hora o el usuario la cambia. `performance.now()` es un **cronómetro**: milisegundos, con decimales, desde que se abrió la página, y nunca retrocede. Para medir duraciones, siempre `performance.now()`.

[[exercise:01-medir-con-performance-now.md-]]

```text
Date.now() es una fecha (> 1 700 000 000 000) → true
performance.now() empieza cerca de 0 (< 1 hora) → true
10 000 lecturas seguidas, ninguna retrocede → true
el más barato y el más caro → 0 99999
ordenar 200 000 precios tardó ≈ 21.3 ms (varía con el ordenador)
sumar con reduce: 1.2 ms
total → 9999900000
```

La precisión está recortada a propósito (en Chrome, a una décima de milisegundo, más o menos), para que nadie pueda usar el reloj para ataques que miden tiempos minúsculos. Para medir algo rápido, repítelo muchas veces y divide.

> **Desde Python:** `performance.now()` es `time.perf_counter()` (pero en milisegundos) y `Date.now()` es `time.time() * 1000`. La misma regla que en Python: duraciones con el contador monótono, nunca con la hora del sistema.

## `requestAnimationFrame`

En la lección «El event loop» viste que `requestAnimationFrame(fn)` ejecuta `fn` justo antes del próximo pintado. Un **bucle de animación** es un callback de rAF que hace su trabajo y pide el siguiente frame; para detenerlo, basta con no pedirlo más, o con `cancelAnimationFrame(id)` si ya estaba pedido. Cada callback recibe el **instante del frame**, en la misma escala que `performance.now()`.

[[exercise:02-requestanimationframe.md-]]

```text
el instante del frame ya pasó (≤ performance.now()) → true
⏹️ el bucle se detuvo solo
frames en medio segundo > 20 → true
≈ 60 frames por segundo (60 en la mayoría de pantallas, 120 en las de alta frecuencia; varía)
```

¿Por qué no `setInterval(fn, 16)`? Porque un temporizador no sabe cuándo pinta la pantalla: unos frames recibirían dos actualizaciones y otros ninguna (el movimiento «tartamudea»), los ticks derivan (lección «Callbacks y temporizadores»), y en una pantalla de 120 Hz desperdiciarías la mitad de los frames. rAF da exactamente un callback por frame, sincronizado con el pintado, y se pausa cuando la pestaña no se ve.

## Animar por tiempo

La regla de oro de las animaciones: la posición se calcula a partir del **tiempo transcurrido**, no del número de frames. Para una animación de duración fija, el **progreso** es `transcurrido / duración`, un número de 0 a 1 que se limita con `Math.min(…, 1)` para que el último frame caiga justo en el final. Una **curva de suavizado** (*easing*) transforma ese progreso para que el movimiento arranque o frene con naturalidad, como `easeOutCubic`, que frena al llegar.

[[exercise:03-animar-por-tiempo.md]]

```js
const progress = Math.min((frameTime - start) / DURATION_MS, 1); // 0 → 1
van.style.translate = `${easeOutCubic(progress) * distance}px 0`;
```

`style.translate` mueve el elemento sin afectar al resto de la página (el capítulo 6 explica `style`; el de CSS, por qué mover con `translate` es lo más barato para el navegador). Con 60 o con 120 frames por segundo, la furgoneta llega en un segundo; con más frames, el movimiento es más suave, no más rápido.

### Delta time

Las animaciones que no tienen una duración fija (un personaje que camina mientras se pulsa una tecla, una cinta transportadora, un juego) avanzan un poco en cada frame. La trampa clásica es escribir «avanza 2 px por frame»: la velocidad depende entonces de cuántos frames dibuje la pantalla, y en un monitor de 120 Hz todo va el doble de rápido que en uno de 60. La solución es el **delta time**: el tiempo transcurrido desde el frame anterior, multiplicado por una velocidad en unidades por segundo.

```text
🐛 x += 2                         → 60 Hz: 120 px/s   120 Hz: 240 px/s
✅ x += 120 * (dt / 1000)         → 60 Hz: 120 px/s   120 Hz: 120 px/s
```

[[exercise:04-sin-delta-time.md-]]

```text
🐛 2 px por frame → 60 Hz: 120 px | 120 Hz: 240 px
✅ 120 px/s × dt → 60 Hz: 120 px | 120 Hz: 120 px
en tu pantalla: 🐛 ≈ 122 px · ✅ ≈ 120 px (varía)
```

La simulación da números exactos; la carrera de abajo usa tu pantalla de verdad. Un móvil que baja a 30 Hz para ahorrar batería, o un portátil enchufado a un monitor de 144 Hz, dan otra frecuencia, y el delta time las iguala todas.

### Pestañas en segundo plano

Cuando la pestaña no se ve (otra pestaña, ventana minimizada), Chrome deja de pintarla y **no llama a los rAF**: la animación se congela sin gastar batería. Los temporizadores, en cambio, siguen, aunque espaciados a un segundo o más. El problema llega al volver: el primer frame trae como delta **todo** el tiempo que la pestaña estuvo oculta, y una animación con delta time da un salto enorme. Un objeto puede atravesar una pared, o un paquete pasar por el escáner sin que lo vea, porque en ningún frame estuvo dentro:

[[exercise:05-pestanas-en-segundo-plano.md-]]

```text
🐛 sin límite → ¿escaneado? false | mayor salto: 600 px
✅ dt ≤ 100 ms → ¿escaneado? true | mayor salto: 12 px
```

La defensa más sencilla es **limitar el delta**: `dt = Math.min(dt, 100)`. Al volver, la animación sigue donde estaba en vez de teletransportarse. La otra es pausar la animación cuando la página se oculta, con el evento `visibilitychange` (capítulo 6). El botón del ejemplo lo comprueba en tu navegador: ábrelo con «▶ Run», pulsa «Medir durante 10 s», cambia de pestaña unos segundos y vuelve.

## Cálculo pesado y animación a la vez

En la lección «El event loop» troceaste un cálculo largo con `setTimeout` para que la página siguiera viva. Con `async/await` el troceo se escribe dentro de un bucle normal: cada pocos milisegundos, `await` de algo que se cumpla en una **tarea nueva**. Qué ocurre entre una rebanada y la siguiente depende de cómo cedas el turno, y aquí hay una decisión de verdad.

`await scheduler.yield()` (Chrome 129, septiembre de 2024; no está en todos los navegadores, así que se usa con una comprobación y `setTimeout` como recambio) no sufre el mínimo de 4 ms de los temporizadores anidados, y su continuación tiene **prioridad** sobre las demás tareas: el trabajo no se queda al final de la cola, termina antes y los clics se atienden entre rebanada y rebanada. Pero esa prioridad también adelanta al pintado: Chrome solo pinta cuando lleva un rato sin hacerlo (unos 100 ms), así que una animación movida por JavaScript avanza a saltos, unas diez veces por segundo. Ceder **hasta el próximo frame** (esperar al rAF y salir justo después del pintado con un `setTimeout`) deja pintar cada frame, a cambio de que el total tarde más.

El ejemplo hace el mismo informe de 300 ms tres veces mientras gira un indicador animado con rAF: de una vez (0 frames), con `scheduler.yield()` y cediendo hasta el próximo frame. En Chrome 155, con 400 ms de trabajo en rebanadas de 8 ms, se midieron unos 4 frames con `scheduler.yield()` y unos 25 cediendo hasta el frame (varía con el ordenador y la pantalla); por eso el ejemplo solo compara.

[[exercise:06-ceder-con-scheduler-yield.md-(script.js)]]

```text
scheduler.yield disponible (Chrome 129+) → true
🐛 de una vez → frames durante el trabajo: 0
scheduler.yield() → hubo frames: true
hasta el próximo frame → hubo frames: true
hasta el próximo frame pinta más frames que scheduler.yield() → true
scheduler.yield() termina antes → true
```

| Cedes con… | Clics y teclas | Pintado | El cálculo termina |
|------------|----------------|---------|--------------------|
| nada (de una vez) | al final, de golpe | nunca durante el cálculo | lo antes posible, con la página congelada |
| `await scheduler.yield()` | entre rebanadas | a saltos (≈ 10 por segundo en Chrome) | antes |
| hasta el próximo frame (rAF + `setTimeout`) | entre rebanadas | cada frame | después |

Para tener las dos cosas, alterna: `scheduler.yield()` casi siempre y, cada ~16 ms, una espera hasta el próximo frame; es lo que hace el ejemplo profesional «Ventas sin bloquear la página». La otra salida es no depender de JavaScript para la animación: una animación de CSS que solo cambie `transform` u `opacity` puede seguir moviéndose aunque JavaScript esté ocupado, porque el navegador la ejecuta en otra hebra (el módulo «Transiciones y animaciones» lo explica). Y un detalle de nombres: en Chrome existe la variable global `scheduler`, así que no uses ese nombre para las tuyas en un script clásico.

## Animaciones que se pueden esperar

Un bucle de rAF se puede envolver en una promesa como cualquier otra operación asíncrona: `animate()` se cumple cuando el progreso llega a 1 y se rechaza si se cancela su señal. Con eso, encadenar animaciones es escribir líneas con `await`, y ponerles un plazo es pasar un `AbortSignal.timeout`, igual que con una petición:

[[exercise:07-animacion-como-promesa.md-]]

```text
1. el paquete sale del almacén
2. llegó al centro de reparto
3. escaneado: sale hacia el cliente
4. ⏰ tramo cortado a mitad (TimeoutError): el paquete se queda donde iba
```

En el capítulo 6 verás la Web Animations API (`element.animate()`), que trae esta promesa de serie (`animation.finished`), y un bucle de animación completo con física y partículas en `canvas`.

> **Desde Python:** no hay un equivalente en la biblioteca estándar, porque Python no pinta pantallas. Si has usado `pygame`, el patrón es el mismo: `dt = clock.tick(60) / 1000` devuelve el tiempo desde el frame anterior, y las posiciones se actualizan con `x += velocidad * dt`.

## Bestiario

- **La animación que va más rápido en otra pantalla.**
  Síntoma: un juego o animación va al doble de velocidad en un monitor de 120 Hz (o más lenta en un móvil en ahorro de energía).
  Causa: el bucle avanza una cantidad fija **por frame**, y el número de frames por segundo depende de la pantalla.
  Solución: delta time: `x += velocidad * (dt / 1000)`, con `dt` = instante del frame − instante del anterior; o progreso por tiempo en animaciones de duración fija.
  → [ver ejemplo](04-sin-delta-time.md)
- **El salto al volver de otra pestaña.**
  Síntoma: al volver a la pestaña, los objetos animados aparecen de golpe en otra posición, atraviesan paredes o la física «explota».
  Causa: rAF se pausa en segundo plano, y el primer frame al volver trae como delta todo el tiempo que estuvo oculta.
  Solución: limita el delta (`Math.min(dt, 100)`) o pausa la animación con `visibilitychange`.
  → [ver ejemplo](05-pestanas-en-segundo-plano.md)

## Resumen

- `performance.now()` mide duraciones (monótono, ms con decimales); `Date.now()` es la hora del calendario.
- `requestAnimationFrame(fn)` ejecuta `fn` antes de cada pintado y le pasa el instante del frame; un bucle pide el siguiente frame y para con una condición o `cancelAnimationFrame`.
- Calcula las posiciones con el tiempo: progreso = transcurrido / duración (limitado a 1), o delta time × velocidad.
- Avanzar «por frame» hace que la velocidad dependa de la pantalla (60, 120, 144 Hz…).
- rAF se pausa en pestañas ocultas: limita el delta al volver.
- Para trocear un cálculo, `await scheduler.yield()` (Chrome 129+) atiende antes los clics y termina antes, pero pinta a saltos; ceder hasta el próximo frame pinta cada frame. Altérnalos, o anima con CSS.
- Un bucle de rAF envuelto en una promesa se encadena con `await` y se cancela con una señal.

## Para profundizar

- [MDN: requestAnimationFrame (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN: performance.now()](https://developer.mozilla.org/es/docs/Web/API/Performance/now)
- [Chrome Developers: usar scheduler.yield() (en inglés)](https://developer.chrome.com/blog/use-scheduler-yield)
- [Gaffer On Games: Fix Your Timestep! (en inglés)](https://gafferongames.com/post/fix_your_timestep/)
- [javascript.info: animaciones con JavaScript](https://es.javascript.info/js-animation)
