# Ejemplos profesionales

## Por qué importa

Casi todo el código de una aplicación web real es asíncrono: hablar con servidores que fallan o tardan, repartir trabajo sin congelar la interfaz, coordinar varias operaciones que compiten por lo mismo, animar sin tirones. Las librerías que usarás para eso (clientes HTTP como ky o axios, colas como p-queue, cachés como las de TanStack Query, *pools* de bases de datos, motores de animación) están hechas con las piezas de este módulo. Esta página reúne doce programas de ese tipo, escritos con todo lo que has visto hasta ahora en el curso.

Ocho son programas de consola: ábrelos con «▶ Run» o en el editor, y lee primero el bloque de comentarios del principio, que explica las decisiones de diseño. Los otros cuatro tienen interfaz y usan un mínimo de DOM y eventos (capítulo 6), avisado en cada uno.

## Qué tienen en común

- **Cancelables de punta a punta.** Las operaciones aceptan `{ signal }` y se detienen de verdad: plazos con `AbortSignal.timeout`, el botón del usuario con `AbortController`, ambos unidos con `AbortSignal.any`. Nunca un plazo hecho solo con `Promise.race`.
- **Ningún trabajo olvidado.** Las promesas se esperan o se escuchan en el acto (nada de rechazos «sin manejar»), los recursos se devuelven con `using`/`await using` y los bucles de temporizadores y de `requestAnimationFrame` se detienen solos cuando no queda nada que hacer.
- **El tiempo, del reloj.** Las cuentas atrás calculan con una hora límite, las animaciones con el tiempo transcurrido (limitado al volver de otra pestaña) y los ritmos con cubos de tokens.
- **Salida reproducible.** Las redes y los servidores son guiones o azar con semilla, la caché usa un reloj falso y las comprobaciones imprimen órdenes, contadores y verdaderos o falsos, nunca milisegundos. Lo que puede variar lo dice el propio mensaje.
- **Errores con nombre.** Cada fallo es una subclase de `Error` con lo que hace falta para decidir (`status`, `retryable`), y los motivos de cancelación se distinguen por `name` (`TimeoutError`, `AbortError`).

## Programas de consola

### Capa HTTP resiliente

El cliente HTTP de una tienda sobre una red simulada con un guion por ruta. Cada intento tiene su plazo, unido a la cancelación del usuario; se reintentan los plazos agotados, los 5xx y los 429 (estos, esperando lo que dice `Retry-After`), con espera exponencial y *jitter* con semilla. Un `POST` solo se reintenta con clave de idempotencia: fíjate en el pedido con clave, cuyo primer intento creó el pedido en el servidor pero perdió la respuesta; el reintento recibe ese mismo pedido y el servidor sigue teniendo uno solo. El cortacircuitos de «pagos» se abre al tercer fallo, rechaza al momento las llamadas siguientes y, pasado el descanso, deja pasar una prueba que lo vuelve a cerrar.

[[exercise:01-capa-http-resiliente.md-]]

```text
▶ stock: GET /inventario/cafe-de-olla
  ↻ intento 1: 503 GET /inventario/cafe-de-olla · reintento en 15 ms
  ↻ intento 2: sin respuesta en 80 ms · reintento en 45 ms
  ✓ {"units":12}
▶ pedido sin clave: POST /pedidos/nuevo
  ⛔ HttpError: 503 POST /pedidos/nuevo
▶ pedido con clave: POST /pedidos/nuevo
  ↻ intento 1: sin respuesta en 80 ms · reintento en 28 ms
  ✓ {"id":"P-4401"}
…
▶ pagos (servicio caído): GET /pagos/estado
  ↻ intento 1: 500 GET /pagos/estado · reintento en 18 ms
  ↻ intento 2: 500 GET /pagos/estado · reintento en 42 ms
  ⚡ pagos: cerrado → abierto
  ⛔ CircuitOpenError: circuito abierto para «pagos»: ni se intenta
…
▶ pagos, tras el descanso: GET /pagos/estado
  ⚡ pagos: abierto → semiabierto
  ⚡ pagos: semiabierto → cerrado
  ✓ {"ok":true}
▶ informe (el usuario cancela): GET /informes/ventas
  ⛔ AbortError: el usuario cerró el informe
(tabla: una fila por petición, con su resultado y sus intentos)
pedidos creados en el servidor → 1 (el reintento con clave no duplicó el pedido)
```

### Cola de tareas con prioridades

La cola de envíos de email de una tienda: tres prioridades, como mucho dos envíos a la vez y un **cubo de tokens** que permite una ráfaga de tres y después un envío cada 50 ms. `add()` devuelve la promesa de esa tarea con `Promise.withResolvers`, y el reparto se programa en **una microtarea**, para que todo lo que se encola en el mismo trozo de código compita por prioridad (sin ese detalle, el primer boletín añadido saldría antes que una contraseña urgente añadida una línea más abajo). La urgencia que llega a los 70 ms adelanta a todo lo que aún no ha empezado.

[[exercise:02-cola-de-tareas-con-prioridades.md-]]

```text
orden de inicio → A1 A2 N1 N2 A3 N3 B1 B2 B3
  B1: 📧 Boletín de octubre → ana@example.com
  N1: 📧 Pedido P-1042 confirmado → luis@example.com
  A1: 📧 Restablece tu contraseña → sofia@example.com
  B2: ⛔ dirección rechazada: ivan@example
  …
  A3: 📧 Restablece tu contraseña → carla@example.com
nunca más de 2 a la vez → true
las altas iniciales, antes que ninguna normal o baja → true
la urgente tardía adelantó a las que esperaban → true
tras la ráfaga de 3, como mucho un inicio por recarga → true
```

### Tubería de pedidos asíncrona

El paginador del módulo 6, ya mayor: una tubería de generadores asíncronos (`pages → flatten → filter → mapConcurrent → batch → take`) exporta a contabilidad tres lotes de pedidos pagados de más de $1,000. `mapConcurrent` enriquece hasta tres pedidos a la vez con los datos del cliente, pero los entrega en orden; una caché de **promesas** hace que dos pedidos del mismo cliente compartan una sola consulta. Al completar el tercer lote, `take` sale de su bucle y `return()` cierra toda la cadena hasta el paginador, que lo registra en su `finally`: se leyeron 4 páginas de 6.

[[exercise:03-tuberia-de-pedidos-asincrona.md-]]

```text
▶ 3 lotes de 4 pedidos pagados de más de $1,000
  ↻ 503 Servicio no disponible: reintento
  📤 lote 1: P-2003 Carla Vidal $1,980.00 · P-2006 Sofía Ríos $1,150.00 · P-2007 Marta Gil $1,940.00 · P-2009 Jorge Lara $1,920.00
  📤 lote 2: …
  📤 lote 3: …
  (exportación: 4 página(s) leída(s), paginador cerrado)
  peticiones a la lista → 5 (una falló y se reintentó); la API tiene 6 páginas
  clientes consultados → 6 para 12 pedidos (caché de promesas)
  en el orden de la API → true
▶ totales por estado (recorrido completo)
  (informe: 6 página(s) leída(s), paginador cerrado)
  pagado: $40,990.00 · cancelado: $9,200.00 · pendiente: $8,370.00 · enviado: $15,480.00
  peticiones → 6
```

### Sondeo con espera creciente

Una exportación de ventas tarda en prepararse, y el cliente pregunta por su estado con una espera que crece (20 ms, ×1.6, como mucho 120 ms). Es un bucle con `await`, así que nunca hay dos consultas a la vez; un 429 cambia la espera por la que pide el servidor. Una sola señal lo detiene todo: el plazo total y el botón «Cerrar» del panel, unidos con `AbortSignal.any`. En una página real se pausaría también con la pestaña oculta (evento `visibilitychange`, capítulo 6).

[[exercise:05-sondeo-con-espera.md-]]

```text
▶ exportar «ventas-septiembre»
  consulta 1 (tras 20 ms): en cola
  consulta 2 (tras 32 ms): procesando 20 %
  consulta 3 (tras 51 ms): 429 demasiadas consultas · el servidor pide esperar 80 ms
  consulta 4 (tras 80 ms): procesando 60 %
  consulta 5 (tras 120 ms): procesando 90 %
  consulta 6 (tras 120 ms): listo
  ✅ lista → https://exportaciones.example.com/ventas-septiembre.csv
  consultas hechas → 6
▶ exportar «clientes-2026»
  consulta 1 (tras 20 ms): en cola
  …
  consulta 4 (tras 82 ms): en cola
  ⏰ plazo total de 300 ms agotado: se avisará por email
  consultas hechas → 4
▶ exportar «inventario-octubre»
  consulta 1 (tras 20 ms): en cola
  🛑 el usuario cerró el panel: se deja de preguntar
  consultas hechas → 1
```

### Mutex y saldo compartido

La prueba de que una sola hebra no evita las carreras de datos. Cinco compras de $150.00 contra un monedero con $500.00 leen el saldo, cobran y escriben, con `await` entre medias: las cinco leen $500.00 antes de que ninguna escriba, se aprueban todas y el saldo final es $350.00. Un **mutex** asíncrono (una cola FIFO de promesas) hace de la sección crítica algo de uno en uno, y se libera con `using lock = await mutex.acquire()` y `[Symbol.dispose]`, también ante un `return` temprano. El mismo mecanismo con dos permisos, un **semáforo**, limita las conexiones a la base de datos.

[[exercise:08-mutex-y-saldo-compartido.md-]]

```text
▶ 🐛 sin cerrojo: 5 compras de $150.00 a la vez con $500.00 de saldo
  ✅ café de Chiapas · ✅ mole poblano · ✅ cajeta · ✅ vainilla · ✅ chocolate
  aprobadas → 5 ($750.00 cobrados) | saldo final → $350.00
  ¿cuadran las cuentas? → false
▶ ✅ con mutex: 5 compras de $150.00 a la vez con $500.00 de saldo
  ✅ café de Chiapas · ✅ mole poblano · ✅ cajeta · ⛔ vainilla: saldo insuficiente · ⛔ chocolate: saldo insuficiente
  aprobadas → 3 ($450.00 cobrados) | saldo final → $50.00
  ¿cuadran las cuentas? → true
conexiones a la vez (máximo) → 2 | nunca más de 2 → true
```

### Caché asíncrona

Una caché de precios que guarda **promesas**: cinco componentes que piden el mismo precio a la vez generan una sola petición. Cada entrada caduca con un TTL; durante un rato más se sirve el valor viejo al momento mientras se recarga en segundo plano (*stale-while-revalidate*); los errores no se guardan; y un `Map`, que recuerda el orden de inserción, expulsa la entrada menos usada. El reloj se inyecta: el ejemplo avanza un reloj falso y por eso puede hablar de «un minuto después» sin esperar un minuto.

[[exercise:09-cache-asincrona.md-]]

```text
▶ cinco componentes piden el precio del café a la vez
  precios → $210.00 $210.00 $210.00 $210.00 $210.00 | peticiones al servidor → 1
▶ un minuto después, el precio sube a $230.00
  respuesta inmediata (valor viejo) → $210.00 | recargando en segundo plano
  siguiente consulta → $230.00 | peticiones → 2
▶ dos minutos sin consultas: ya no se sirve lo viejo
  espera a la recarga → $240.00 | peticiones → 3
▶ un error no se guarda
  ⛔ 502 al consultar pozole
  segundo intento → $180.00
▶ como mucho 3 entradas (se va la menos usada)
  claves → cajeta, café de olla, tamales
estadísticas → {loads: 7, hits: 2, shared: 4, stale: 1, evicted: 1}
```

### Saga de pedido

Crear un pedido toca tres servicios (stock, pagos, paquetería) y no hay una transacción que los abarque. Una **saga** ejecuta los pasos en orden, cada uno con su plazo, y si uno falla, ejecuta las compensaciones de los ya hechos en orden inverso: liberar el stock, reembolsar el cobro. Las compensaciones se reintentan, y si una falla del todo no se esconde: queda en una lista de revisión manual. Al final, un libro de cuentas comprueba que solo quedaron vivos el pedido bueno y el cobro que necesita una persona.

[[exercise:10-saga-de-pedido.md-]]

```text
▶ P-701: todo va bien
  ✓ reservar stock → R-P-701
  ✓ cobrar → PAY-P-701
  ✓ crear envío → MX-P-701
  → ✅ pedido creado
▶ P-702: la tarjeta se rechaza
  ✓ reservar stock → R-P-702
  ✗ cobrar: pagos: tarjeta rechazada · compensando 1 paso(s)
    ↩️ Stock liberado
  → ⛔ pedido no creado (pagos: tarjeta rechazada)
▶ P-703: la paquetería no responde; el reembolso falla una vez
  …
  ✗ crear envío: sin respuesta en 100 ms · compensando 2 paso(s)
    ↻ pagos: 503 al reembolsar: reintento 1
    ↩️ Cobro reembolsado
    ↩️ Stock liberado
  → ⛔ pedido no creado (sin respuesta en 100 ms)
▶ P-704: la paquetería no responde; el reembolso falla siempre
  …
    ⚠️ no se pudo reembolsar el cobro: pagos: 503 al reembolsar → revisión manual
    ↩️ Stock liberado
  → ⛔ pedido no creado (sin respuesta en 100 ms)
▼ comprobación del libro de cuentas
  stock reservado → P-701
  cobros vigentes → P-701, P-704
  envíos vigentes → P-701
  revisión manual → P-704 (cobrar)
```

### Pool de conexiones

Un *pool* presta como mucho dos conexiones a una base de datos simulada; quien no cabe espera en una cola FIFO, y quien no puede esperar pasa un `AbortSignal.timeout` y sale de la cola al vencer. El préstamo es «async disposable»: con `await using` vuelve al pool al salir del bloque, también cuando la consulta lanza, y antes de prestarse otra vez deshace las transacciones abiertas. Una conexión que el servidor cortó no vuelve: se cierra y se abre otra. Y el propio pool se cierra con `await using` al terminar el bloque de `main`.

[[exercise:11-pool-de-conexiones.md-]]

```text
  SELECT ventas por estado → ✅ SELECT ok en conn-1
  SELECT consulta pesada de devoluciones → ⛔ conexión perdida (conn-2)
  SELECT clientes nuevos → ✅ SELECT ok en conn-1
  SELECT * FROM ventas_2019 → ⛔ la tabla ventas_2019 no existe (conn-3)
  SELECT productos agotados → ✅ SELECT ok en conn-1
  SELECT informe urgente → ⛔ TimeoutError: ninguna conexión libre en 30 ms
nunca más de 2 conexiones prestadas a la vez → true
todas devueltas, también las de consultas que fallaron → true
conexiones abiertas → 3 (una se rompió y se reemplazó)
conexiones cerradas (la rota y, al salir del bloque, las del pool) → 3 de 3
```

## Pequeñas aplicaciones con interfaz

Los cuatro ejemplos siguientes tienen página: controles con su texto o su `aria-label`, regiones `role="status"` para anunciar lo importante, foco visible y un diseño que se adapta al ancho. La lógica asíncrona está separada de la interfaz, y cada demostración automática imprime en la consola lo que comprueba. Ábrelos con «▶ Run» (página y consola) o en su propia pestaña con ↗.

### Gestor de subidas

Tres fotos de una fonda se suben por partes, como mucho dos a la vez. Pausar crea una **compuerta**, una promesa pendiente (`Promise.withResolvers`) que la subida espera antes de cada parte; reanudar la cumple. Cancelar usa un `AbortController`, que corta incluso la parte en curso. La demostración automática no usa relojes: espera a eventos de progreso (`upload.reached(40)`) y por eso su salida es siempre la misma; después, los botones de cada fila funcionan con «Repetir la demostración».

[[exercise:04-gestor-de-subidas.md]]

```text
▶ 3 archivos: suben fachada y terraza; la carta espera su turno
⏸️ fachada.jpg: pausa pedida al 40 % (termina la parte en curso)
✅ terraza.jpg completada: la carta toma su hueco
▶️ fachada.jpg reanudada (se detuvo al 50 %)
🛑 carta.pdf cancelada al 80 %
✅ fachada.jpg completada
estados → fachada.jpg: completada · terraza.jpg: completada · carta.pdf: cancelada
nunca más de 2 subiendo a la vez → true
```

### Ventas sin bloquear la página

Trescientas mil ventas, generadas con semilla por un generador (nunca están todas en memoria), se agregan por estado en un bucle normal que cede el turno cada 8 ms. `await scheduler.yield()` sola no basta para una animación movida por JavaScript: su continuación tiene prioridad hasta sobre el pintado, y Chrome solo pinta cuando lleva unos 100 ms sin hacerlo, así que el indicador iría a saltos (lección «Frames de animación y tiempo»). Por eso el bucle alterna: casi siempre `scheduler.yield()` (o `setTimeout` si no existe), que atiende los clics y avanza rápido, y cada ~16 ms una espera hasta el próximo frame (rAF y, tras el pintado, `setTimeout`). La barra avanza, el indicador gira fluido y el botón «Cancelar» responde: la segunda pasada de la demostración se cancela al pasar del 30 % y la tabla conserva el último resultado completo.

[[exercise:06-procesar-ventas-sin-bloquear.md]]

```text
scheduler.yield disponible (Chrome 129+) → true
▶ procesar las 300 000 ventas
  ventas procesadas → 300000
  rebanadas (tareas cortas) > 1 → true
  el indicador se animó durante el cálculo (≥ 5 frames) → true
  top 3 → Ciudad de México, Jalisco, Nuevo León
  ingresos totales → $130,776,690.00
▶ otra vez, cancelando al pasar del 30 %
  cancelado → true | al 30 % o más → true
  la tabla conserva el resultado anterior → true
```

### Motor de animaciones

La tarjeta de seguimiento de un pedido se anima con un motor mínimo: un solo bucle de `requestAnimationFrame` mueve todas las animaciones activas y se detiene en cuanto no queda ninguna. Cada animación es una promesa que avanza con *delta time* limitado y termina exactamente en su valor final; se encadenan con `await`, van a la vez con `Promise.all`, y la que late («En camino») se repite hasta que vence su `AbortSignal.timeout`.

[[exercise:07-motor-de-animaciones.md]]

```text
1. la tarjeta entra
2. la barra y la distancia avanzan a la vez
3. «En camino» late hasta que se agota su plazo
4. aparece «Entregado»
los km terminaron exactamente en 0 → true
dos animaciones en el mismo frame (un solo bucle de rAF) → true
el bucle se detuvo solo al quedarse sin animaciones → true
frames dibujados ≈ 80 (≈ 80 a 60 Hz; varía)
```

### Temporizadores de cocina

Un tablero con tres tickets de cocina en cámara rápida y la hora de Ciudad de México (con `Intl` y una zona horaria fija). Cada cuenta atrás se calcula con su hora límite, y un **solo** `setTimeout` despierta al tablero justo cuando cambia el primer número visible de cualquiera de los relojes; el de pared se alinea con el cambio de segundo. Cuando el último plato está listo, el tablero se detiene: ningún temporizador queda vivo.

[[exercise:12-temporizadores-de-cocina.md]]

```text
orden en que terminaron → Para llevar · tamales, Mesa 4 · enchiladas, Mesa 7 · pozole
ninguno terminó antes de su hora → true
ninguno terminó más de 50 ms tarde → true
los números nunca subieron → true
despertares del tablero ≤ 25 (y no 3 relojes × 20 ticks) → true
```

## Resumen

- Una capa HTTP seria combina plazos por intento, reintentos selectivos (idempotencia, `Retry-After`), *jitter* y un cortacircuitos.
- Colas, *pools*, semáforos y mutex son variaciones de una idea: guardar los `resolve` de quien espera y llamarlos cuando le toca.
- Los generadores asíncronos forman tuberías perezosas; cortar una etapa cierra todas las de arriba.
- Guardar promesas (no valores) deduplica peticiones en vuelo; los errores no se guardan.
- Las sagas sustituyen a las transacciones entre servicios: compensaciones en orden inverso y revisión manual cuando no hay manera.
- La interfaz sigue viva si el trabajo cede el turno: `scheduler.yield()` para responder rápido y, cada ~16 ms, una espera hasta el próximo frame para pintar; las animaciones comparten un bucle de rAF y los relojes calculan con una hora límite.
- `using` y `await using` garantizan que cerrojos, conexiones y *pools* se devuelven pase lo que pase.

## Para profundizar

- [Google SRE: manejar la sobrecarga (en inglés)](https://sre.google/sre-book/handling-overload/)
- [Martin Fowler: Circuit Breaker (en inglés)](https://martinfowler.com/bliki/CircuitBreaker.html)
- [microservices.io: el patrón Saga (en inglés)](https://microservices.io/patterns/data/saga.html)
- [MDN: cabecera Cache-Control y stale-while-revalidate (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Chrome Developers: usar scheduler.yield() (en inglés)](https://developer.chrome.com/blog/use-scheduler-yield)
