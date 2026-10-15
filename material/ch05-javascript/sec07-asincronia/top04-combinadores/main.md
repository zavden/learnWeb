# Combinadores y cancelación

## Por qué importa

Una cadena de `then` ejecuta los pasos **uno detrás de otro**, que es lo correcto cuando cada paso necesita el resultado del anterior. Pero muchas veces las operaciones no dependen entre sí: el panel de una tienda pide los pedidos, el stock y los clientes nuevos, y no hay razón para esperar a uno antes de pedir el siguiente. Los **combinadores** (`Promise.all`, `allSettled`, `race` y `any`) reciben varias promesas en marcha y devuelven **una** que se asienta según una regla.

Lanzar cosas en paralelo trae una pregunta nueva: ¿qué pasa con las demás cuando una falla o cuando se agota el plazo? La respuesta sorprende (siguen funcionando, con sus efectos), y la herramienta para pararlas es `AbortController`, el mecanismo estándar de cancelación de la web.

## Los cuatro combinadores

| Combinador | Se cumple… | Se rechaza… | En Python |
|------------|-----------|-------------|-----------|
| `Promise.all(it)` | cuando **todas** se cumplen, con un array de valores en el orden de entrada | con el **primer** rechazo | `asyncio.gather(*aws)` |
| `Promise.allSettled(it)` | cuando todas se asientan, con un informe de cada una | nunca | `asyncio.gather(*aws, return_exceptions=True)` |
| `Promise.race(it)` | si la **primera** en asentarse se cumple | si la primera en asentarse se rechaza | `asyncio.wait(aws, return_when=FIRST_COMPLETED)` |
| `Promise.any(it)` | con el **primer éxito** | si **todas** se rechazan, con un `AggregateError` | (recorrer `as_completed` hasta el primer éxito) |

Los cuatro aceptan cualquier **iterable** (lección «Protocolo iterable»), y los elementos que no son promesas cuentan como promesas ya cumplidas.

### `Promise.all`: todas a la vez

`Promise.all` es el combinador de todos los días: las operaciones se lanzan a la vez y el total tarda lo que la **más lenta**, no la suma. Los resultados llegan en el orden de **entrada**, no en el de llegada, así que se pueden desestructurar. El patrón más habitual es `Promise.all(lista.map(funciónAsíncrona))`:

[[exercise:01-promise-all.md-]]

```text
pedidos de hoy → 42
stock bajo → (2) ['cajeta', 'mole poblano']
clientes nuevos → 7
tardó lo que la más lenta (< 300 ms, no 450) → true
   (≈ 202 ms; varía)
ids de un Set + un valor normal → (3) ['P-1001 ✓', 'P-1002 ✓', 'sin espera']
Promise.all([]) → []
```

Fíjate en dónde empiezan las peticiones: en `api.getOrdersToday()`, cuando se crea cada promesa, no al llamar a `Promise.all`. `Promise.all` no lanza nada; solo **espera**.

### Falla rápido… y lo demás sigue

`Promise.all` se rechaza en cuanto **una** operación falla, sin esperar a las demás. Es lo que quieres para avisar pronto al usuario, pero tiene una consecuencia que pocos esperan: las demás operaciones **no se detienen**. Una promesa es solo el aviso de un resultado, no la operación; rechazar el `Promise.all` no cancela nada. Las operaciones que quedaban terminan cuando nadie las escucha, y sus efectos (guardar, cobrar, enviar) ocurren igualmente:

[[exercise:02-all-falla-rapido.md-]]

```text
▶ sin cancelación
  ⛔ Promise.all → subir 12 fotos: formato HEIC no admitido (los demás siguen en marcha)
   ⚙️ traducir la ficha terminó (y guardó sus cambios)
   ⚙️ indexar en el buscador terminó (y guardó sus cambios)
  🐛 el producto quedó medio publicado: traducido e indexado, sin fotos
▶ con AbortController
   🛑 traducir la ficha cancelado
   🛑 indexar en el buscador cancelado
  ✅ Promise.all → subir 12 fotos: formato HEIC no admitido (y nada quedó a medias)
fin: nada más se ejecutó tras la cancelación
```

La solución tiene dos partes: cada operación acepta una **señal** de cancelación, y el primer fallo la activa. Lo verás con calma en la sección «Cancelar con `AbortController`».

> **Desde Python:** `asyncio.gather` hace lo mismo: el primer error se propaga y las demás tareas siguen. `asyncio.TaskGroup` (Python 3.11) cancela a las demás cuando una falla; en JavaScript, ese papel lo hacen `Promise.all` y un `AbortController` compartido.

### `Promise.allSettled`: el informe completo

Cuando cada operación es independiente y un fallo no debe tapar los éxitos (avisar a varios clientes, subir varias fotos), `Promise.allSettled` espera a todas y devuelve un objeto por cada una: `{ status: 'fulfilled', value }` o `{ status: 'rejected', reason }`. Nunca se rechaza.

[[exercise:03-allsettled.md-]]

```text
Promise.all → solo sabemos esto: Luis: número no válido
primer resultado → {status: 'fulfilled', value: 'Ana avisado por email'}
  ✅ Ana avisado por email
  ⛔ Luis: número no válido
  ⛔ Sofía: dominio sin punto
  ✅ Iván avisado por whatsapp
resumen → 2 enviados, 2 para revisar
```

### `Promise.race` y `Promise.any`: la primera

`race` se asienta con la primera operación que **termine**, para bien o para mal: si la más rápida falla, `race` falla. `any` espera al primer **éxito** e ignora los fallos, salvo que fallen todas, y entonces se rechaza con un `AggregateError`, un error que lleva la lista de errores en `.errors`. Las listas vacías tienen tres comportamientos distintos: `all([])` se cumple al instante, `any([])` se rechaza al instante y `race([])` no se asienta nunca.

[[exercise:04-race-y-any.md-]]

```text
race → falla, porque el primero en terminar falló: espejo de Monterrey caído
any → foto desde Guadalajara (50 ms)
any, todos caídos → AggregateError | All promises were rejected
   errores → (2) ['espejo de Monterrey caído', 'espejo de Mérida caído']
all([]) → se cumple al instante: []
any([]) → se rechaza al instante: AggregateError
race([]) 100 ms después → Promise {<pending>}
```

Para «el servidor que responda primero» quieres casi siempre `any`, no `race`.

## Plazos

La receta clásica para poner un plazo a una operación es una carrera contra un temporizador: `Promise.race([operación, timeout(80)])`. Funciona a medias. `race` decide quién **gana**, pero no detiene al que **pierde**: el usuario ve «tiempo agotado», reintenta… y la operación original sigue y termina después. Con un cobro, eso es pagar dos veces:

[[exercise:05-timeout-con-race.md-]]

```text
▶ plazo con race
  ⛔ al usuario: sin respuesta en 80 ms — «Inténtalo de nuevo»
   💳 la pasarela COBRÓ $640
  🐛 …y la tarjeta se cargó igualmente: si reintenta, paga dos veces
▶ plazo con AbortSignal.timeout
   💳 la pasarela canceló el cobro a tiempo
  ✅ al usuario: plazo agotado, no se cobró nada → TimeoutError
fin: no hubo cobros fantasma
```

Un plazo de verdad tiene que llegar **a la operación**, para que se detenga. Eso es lo que hace `AbortSignal.timeout(ms)`: una señal que se cancela sola pasado el plazo.

> **Desde Python:** `asyncio.wait_for(op(), timeout)` y `async with asyncio.timeout(s)` **cancelan** la tarea cuando vence el plazo. Son el equivalente de pasar un `AbortSignal.timeout`, no de `Promise.race`.

## Cancelar con `AbortController`

La cancelación en la web tiene dos piezas. Un **`AbortController`** es quien cancela: su método `abort(motivo)` activa la cancelación. Su propiedad `signal`, un **`AbortSignal`**, es lo que se reparte a las operaciones: pueden consultar `signal.aborted`, leer `signal.reason`, llamar a `signal.throwIfAborted()` (que lanza el motivo si ya está cancelada) o escuchar el evento `abort` (los eventos se estudian en el capítulo 6). Quien recibe la señal se entera de la cancelación, pero no puede provocarla.

```text
 AbortController ──abort(motivo)──►  signal.aborted = true
        │                            signal.reason  = motivo
        └── .signal ──► operación A  (escucha 'abort' → limpia y rechaza)
                    └─► operación B
```

El ejemplo sube un archivo en cinco partes y el usuario cancela a mitad de la cuarta. Fíjate en `wait(ms, { signal })`: es el `wait` de la lección anterior, ahora cancelable. Ese es el contrato que siguen las APIs del navegador (`fetch(url, { signal })`, `addEventListener(tipo, fn, { signal })`): un objeto de opciones con `signal`, y un rechazo con `signal.reason` al cancelar.

[[exercise:06-abortcontroller.md-]]

```text
¿cancelada al empezar? → false
  ⬆️ factura.pdf: parte 1 de 5
  ⬆️ factura.pdf: parte 2 de 5
  ⬆️ factura.pdf: parte 3 de 5
⛔ subida detenida → el usuario canceló la subida
   ¿cancelada? → true | ¿el motivo es el error? → true
abort() sin motivo → AbortError
wait con una señal ya cancelada → ni empieza: AbortError
```

Una señal cancelada lo está para siempre: para volver a empezar hace falta un controlador nuevo. Y si llamas a `abort()` sin motivo, el motivo es un `DOMException` llamado `AbortError`.

### `AbortSignal.timeout` y `AbortSignal.any`

Dos atajos estáticos ahorran casi todo el código de cancelación. `AbortSignal.timeout(ms)` (Chrome 103) devuelve una señal que se cancela sola con un `DOMException` llamado `TimeoutError`. `AbortSignal.any([s1, s2…])` (Chrome 116) combina varias señales en una que se cancela con la **primera** de ellas, y toma su motivo. Juntos resuelven el caso más común: «cancela si el usuario pulsa Cancelar **o** si se agota el plazo», y el nombre del motivo dice cuál de las dos pasó:

[[exercise:07-abortsignal-timeout-y-any.md-]]

```text
informe corto (40 ms) → ✅ informe listo
informe largo (250 ms) → ⏰ plazo agotado
el usuario cancela a los 30 ms → 🛑 cancelado por el usuario
```

Compara los motivos por `name` (`'TimeoutError'`, `'AbortError'`), nunca por `message`: el texto cambia de un navegador a otro.

> **Desde Python:** en `asyncio` se cancela la **tarea** desde fuera (`task.cancel()`), y la tarea recibe un `CancelledError` en el `await` donde estaba. En JavaScript no se puede cancelar una promesa: se cancela la **operación**, que recibe una señal y decide cómo parar. Es más trabajo para quien escribe la operación y más control para quien la usa.

## Bestiario

- **El fallo que deja trabajo a medias.**
  Síntoma: `Promise.all` se rechaza, pero las demás operaciones terminan después y dejan sus efectos (datos guardados, emails enviados).
  Causa: rechazar el combinador no cancela nada; las operaciones ya estaban en marcha.
  Solución: pasa la misma señal a todas las operaciones y llama a `controller.abort()` en cuanto una falle.
  → [ver ejemplo](02-all-falla-rapido.md)
- **El plazo que no detiene nada.**
  Síntoma: tras un «tiempo agotado» hecho con `Promise.race`, la operación se completa igualmente (un cobro, un pedido duplicado).
  Causa: `race` elige un ganador pero no cancela al perdedor.
  Solución: pasa a la operación `AbortSignal.timeout(ms)` (o `AbortSignal.any` con la señal del usuario) y haz que la operación se detenga al recibirla.
  → [ver ejemplo](05-timeout-con-race.md)

## Resumen

- `Promise.all`: todas a la vez, resultados en el orden de entrada; falla con el primer error.
- `Promise.allSettled`: espera a todas y describe cada una; nunca se rechaza.
- `Promise.race`: la primera que se asiente, éxito o fallo; `Promise.any`: el primer éxito (o `AggregateError`).
- Los combinadores esperan; no lanzan ni cancelan. Las operaciones empiezan al crear sus promesas.
- Cancelar es cosa de la operación: recibe `{ signal }`, escucha `abort` y rechaza con `signal.reason`.
- `AbortSignal.timeout(ms)` pone un plazo real; `AbortSignal.any([...])` combina el plazo con el botón «Cancelar».
- Distingue los motivos por `name`: `TimeoutError` o `AbortError`.

## Para profundizar

- [MDN: Promise.all (y los demás combinadores, en la misma sección)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [javascript.info: la API de promesas](https://es.javascript.info/promise-api)
- [MDN: AbortController (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN: AbortSignal.any (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
- [Python: tareas, gather, wait_for y TaskGroup](https://docs.python.org/es/3/library/asyncio-task.html)
