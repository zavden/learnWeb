# Transferibles

## Por qué importa

En la lección anterior viste el precio de hablar con un worker: cada mensaje se **copia**, y copiar cientos de miles de objetos congela al hilo que envía. Con los datos en un typed array la copia es mucho más barata, pero sigue siendo una copia: 32 MB de píxeles son 32 MB que se duplican en memoria y se recorren byte a byte, a la ida y a la vuelta.

Hay otra opción: **transferir**. En lugar de copiar los bytes, el navegador **cambia de dueño** el bloque de memoria: el worker recibe el búfer tal cual, al instante, y la página se queda sin él. Es lo que anunciaba la lección «ArrayBuffer y vistas» con `transfer()`, que deja el búfer viejo «desconectado». Aquí verás por qué existe esa idea: para que dos hilos nunca toquen los mismos bytes a la vez sin pagar una copia.

No solo se transfieren búferes. Un puerto de un `MessageChannel`, un stream, una imagen decodificada (`ImageBitmap`) y hasta un canvas entero (`OffscreenCanvas`) pueden cambiar de hilo. Con ese último se cumple otra promesa, la de la lección «Píxeles» del capítulo 6: sacar del hilo principal el dibujo y los filtros pesados, para que la página no se congele.

## Transferir un búfer

`postMessage` tiene un segundo argumento: la **lista de transferencia**, un array con los objetos que se deben **mover** en lugar de copiar. Todo lo que está en el mensaje y no en la lista se copia como siempre; lo que está en la lista viaja sin copia. También vale la forma con opciones, `postMessage(mensaje, { transfer: [búfer] })`.

[[exercise:01-transferir-un-buffer.md-]]

```text
antes → la página tiene 192000 bytes
después → la página tiene 0 bytes · detached: true
worker: recibió 192000 bytes · pico 0.80
```

Fíjate en el detalle de la llamada: el **mensaje** es la vista (`samples`, un `Float32Array`) y la **lista** lleva su búfer (`samples.buffer`). La vista se recrea al otro lado, sobre el búfer que llega; lo que se mueve es el búfer. Justo después de `postMessage`, el búfer de la página ya está **desconectado** (*detached*): `byteLength` 0 y `detached` `true`, igual que tras `transfer()`. Los bytes no se han copiado ni borrado: ahora son del worker.

```text
   copiar: postMessage(samples)                transferir: postMessage(samples, [samples.buffer])
 página          worker                         página            worker
 [■■■■■■] ─copia─► [■■■■■■]                      [      ] ──────► [■■■■■■]
 192 000 B        192 000 B                     0 B (detached)    192 000 B (los mismos)
```

### 🐛 El original queda vacío

La transferencia tiene una consecuencia que pilla a todo el mundo: después de enviar, **todas** las vistas de ese búfer quedan vacías, también las que creaste con `subarray` y que ni siquiera aparecían en el mensaje. Y el acceso por índice no da ningún error: leer da `undefined`, escribir se ignora y `length` vale 0, así que un bucle `for` clásico «funciona» y no hace nada. El fallo aparece después, lejos, como una imagen negra o un cálculo que da cero. Los métodos, en cambio, sí se quejan: `reduce` lanza `TypeError: Cannot perform %TypedArray%.prototype.reduce on a detached ArrayBuffer`, y `map`, `join` o `fill` lanzan el mismo error con su nombre y «detached or out-of-bounds». Un `for…of` y el spread también fallan, pero el mensaje nombra `values`, el iterador que usan por dentro.

[[exercise:02-el-original-queda-vacio.md-]]

```text
worker: recibió 16384 bytes
🐛 pixels.length → 0 | pixels[0] → undefined
🐛 tras pixels[0] = 255 → undefined
🐛 firstRow.length → 0 | byteLength del búfer → 0
🐛 DataCloneError: Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.
🐛 worker: recibió 1024 bytes (querías 16) · photo.length → 0
✅ worker: recibió 16 bytes · photo2.length → 1024
```

Tres reglas salen de aquí. Lo transferido ya no es tuyo: no lo vuelvas a usar (ni a transferir, que lanza `DataCloneError`) hasta que te lo devuelvan. La lista lleva **búferes**, no vistas: transferir el búfer de un `subarray` de 16 bytes se lleva los 1024 de la foto entera, porque `subarray` comparte memoria (lección «ArrayBuffer y vistas»). Y si solo quieres enviar un trozo, cópialo con `slice`, que crea un búfer propio, y transfiere esa copia.

## Copiar o transferir: lo que cuesta

¿Cuánto se gana? Copiar cuesta un tiempo proporcional al tamaño, porque hay que duplicar cada byte (y, en la página, mientras se copia, nada más ocurre). Transferir cuesta lo mismo con 1 KB que con 1 GB: solo cambia quién apunta a la memoria. El ejemplo mide el viaje completo, desde `postMessage` hasta que llega la respuesta del worker (un número), con un búfer de 32 MB, lo que ocupa una imagen de 4096 × 2048 píxeles en RGBA:

[[exercise:03-copiar-o-transferir.md]]

[[exercise:03-copiar-o-transferir.md-(script.js)]]

```text
1 MB copiado → el worker recibió 1048576 bytes · a la página le quedan 1048576
1 MB transferido → el worker recibió 1048576 bytes · a la página le quedan 0
Listo: pulsa «Medir con 32 MB»
// Tras pulsar «Medir con 32 MB». Los tiempos cambian en cada ejecución; en el M1 del curso:
32 MB copiados → ≈ 15 ms
32 MB transferidos → ≈ 3 ms
```

Lo que queda en la transferencia, unos pocos milisegundos, es el ir y venir de los dos mensajes (que el worker despierte, reciba y conteste), y no crece con el tamaño: con 1 KB sería lo mismo. Por eso la regla práctica es: **datos grandes en typed arrays, y transferidos**. Los datos pequeños (un número, una palabra, una configuración) se copian sin más; transferirlos no merece la pena y te obligaría a no volver a usarlos.

## Mover sin worker: `structuredClone` y `transfer()`

La lista de transferencia no es exclusiva de `postMessage`. `structuredClone(valor, { transfer: [búfer] })` hace lo mismo dentro del propio hilo: devuelve la copia del valor con el búfer **movido**, y deja el original desconectado. Y `buffer.transfer()`, que viste en el módulo anterior, es la versión directa: mueve los bytes a un búfer nuevo, y `transfer(n)` además cambia el tamaño.

[[exercise:04-structuredclone-y-transfer.md-]]

```text
structuredClone → nuevo Uint8Array(4) [10, 20, 30, 40] | viejo Uint8Array [] · detached: true
transfer() → nuevo 8 bytes | viejo 0
transfer(16) → Float32Array(4) [0.5, -0.25, 0, 0] | el anterior 0
aquí → tile 0 (transferido) · palette 3 (copiado)
allí → tile 1000000 · palette 3
```

Mover dentro de un mismo hilo sirve para **entregar** un búfer a otra parte del programa y asegurarte de que la referencia vieja ya no puede tocarlo: si una función se quedó con `frame` y la cambia más tarde, no estropeará los bytes que ahora usa otra. La última línea muestra la mezcla normal en un mensaje: el mosaico grande se transfiere y la paleta de tres bytes se copia.

## Ida y vuelta

Si el worker tiene que **devolver** los datos procesados, también los transfiere, en su propio `postMessage`. El búfer va y vuelve como una pelota de ping-pong: los mismos bytes, sin ninguna copia, y en cada momento con **un solo dueño**. Mientras el worker trabaja, la página no puede tocarlos (su vista está vacía), y cuando vuelven, el worker ya no puede.

[[exercise:05-ida-y-vuelta.md-]]

```text
al empezar: 19200 bytes en la página · pico 0.25
×2 → mientras el worker trabaja, la página tiene 0 bytes
   de vuelta: 19200 bytes · pico 0.50
×1.5 → mientras el worker trabaja, la página tiene 0 bytes
   de vuelta: 19200 bytes · pico 0.75
×2 → mientras el worker trabaja, la página tiene 0 bytes
   de vuelta: 19200 bytes · pico 1.00
```

Esta regla de un solo dueño es lo que hace seguros a los workers: como nunca hay dos hilos con acceso a los mismos bytes, no puede haber dos escribiendo a la vez. La lección siguiente explica qué pasa cuando sí lo hay (la memoria compartida) y por qué este ping-pong es, en la vista previa del curso, la forma de trabajar.

> **Desde Python:** `multiprocessing` no tiene transferencia: enviar un array de numpy a otro proceso lo serializa con `pickle`, es decir, lo copia entero, y para arrays grandes ese es el cuello de botella típico. La salida en Python es `multiprocessing.shared_memory`: un bloque de memoria compartida sobre el que cada proceso crea una vista de numpy (`np.ndarray(forma, dtype, buffer=shm.buf)`), igual que un typed array sobre un búfer. Eso se parece más a la memoria compartida de la lección siguiente que a una transferencia. Las vistas de numpy (`a[10:20]`) comparten memoria como `subarray`, y `a[10:20].copy()` es `slice`.

## Otros transferibles

Los búferes son lo más común, pero no lo único que se puede transferir. Todos los transferibles comparten la idea: el objeto representa algo que solo puede tener un dueño (un bloque de memoria, un extremo de un tubo, una imagen en la GPU), así que en lugar de copiarse, se muda.

| Transferible | Qué es | Para qué |
|--------------|--------|----------|
| `ArrayBuffer` | un bloque de bytes | datos binarios, píxeles, audio, mallas 3D |
| `MessagePort` | un extremo de un `MessageChannel` | conectar dos workers entre sí, o una respuesta por canal |
| `ReadableStream`, `WritableStream`, `TransformStream` | un flujo de datos | que un worker lea una descarga mientras llega |
| `ImageBitmap` | una imagen ya decodificada | filtros y procesado de imágenes en un worker |
| `OffscreenCanvas` | un canvas sin página | dibujar (2D, WebGL, WebGPU) desde un worker |
| `VideoFrame`, `AudioData` | un fotograma o un trozo de audio | procesar vídeo y audio con WebCodecs |

El cuerpo de una respuesta de `fetch` es un `ReadableStream` (lección «Streams y progreso»), así que se puede transferir a un worker: el worker lo lee **mientras llega**, y los bytes ni siquiera pasan por el hilo principal. El stream de la página queda **bloqueado** (`locked`), como cuando le pides un lector.

[[exercise:06-transferir-un-stream.md-]]

```text
¿el stream de la página está bloqueado? → true
worker: 1200 ventas leídas del stream
  Guadalajara → $340,200.00
  Monterrey → $273,120.00
  Puebla → $205,560.00
  Mérida → $137,520.00
  CDMX → $67,800.00
```

### Puertos: dos workers conectados

En la lección «El event loop» usaste un `MessageChannel` dentro de una misma página: un tubo con dos extremos, `port1` y `port2`. Su uso de verdad es este: la página crea el canal y **transfiere** un puerto a cada worker. A partir de ahí, los dos workers se hablan directamente, y la página solo recibe lo que le quieran contar. Un puerto no se puede copiar (no tendría sentido un tubo con tres extremos), por eso va siempre en la lista de transferencia.

[[exercise:07-messagechannel-entre-workers.md-]]

```text
página: lector y contable conectados con un MessageChannel
contable → 500 pedidos recibidos por el puerto · total $271,550.00
mensajes que recibió la página → 1
```

Es la forma de montar una cadena de procesado (*pipeline*) entre hilos sin que el principal haga de cartero. Y es la alternativa a los `id` de la lección anterior: crear un canal por petición, enviar uno de sus puertos con la petición y esperar la respuesta por el otro.

## `OffscreenCanvas`: dibujar desde un worker

Un worker no tiene DOM, así que no puede tener un `<canvas>`. Pero puede tener un **`OffscreenCanvas`**: un canvas sin elemento, con los mismos contextos (`'2d'`, `'webgl2'`…). Hay dos formas de usarlo:

- **Unido a un canvas de la página**: `canvas.transferControlToOffscreen()` devuelve un `OffscreenCanvas` que está **unido** a ese `<canvas>`. Se transfiere al worker, y todo lo que el worker dibuja aparece en la página. El `<canvas>` se queda como un simple marco (un *placeholder*).
- **Suelto**: `new OffscreenCanvas(ancho, alto)` crea un canvas en memoria, en la página o en un worker, para dibujar y leer píxeles sin mostrar nada (el ejemplo 10).

El ejemplo dibuja el conjunto de Mandelbrot, una figura que exige cientos de iteraciones por píxel. El worker dibuja por **bandas** de 16 filas y, entre una y otra, cede el turno con `setTimeout`. No lo hace por la página, que está libre de todos modos, sino por él mismo: un worker también es un hilo con su event loop, y si dibujara todo de un tirón, los mensajes «pausa» y «detener» esperarían en su cola hasta el final.

```js
// 08-fractal/fractal-worker.js (resumido)
self.onmessage = (event) => {
  if (event.data.type === 'init') ctx = event.data.canvas.getContext('2d'); // el contexto vive en el worker
  // …'draw', 'pause', 'resume', 'stop'
};
function drawBand() {
  // …calcula 16 filas en job.image (un ImageData)
  ctx.putImageData(job.image, 0, job.row); // al acabar esta tarea, la banda aparece en la página
  job.row += rows;
  if (job.row < height) job.timer = setTimeout(drawBand, 0); // cede el turno
}
```

[[exercise:08-offscreencanvas-en-un-worker.md]]

[[exercise:08-offscreencanvas-en-un-worker.md-(script.js)]]

```text
🖼️ vista previa: 40 iteraciones por píxel
Listo: pulsa «Dibujar con detalle» y, mientras dibuja, «+1», «Pausa» o «Detener»
// Tras pulsar «Dibujar con detalle». El tiempo cambia en cada ejecución; en el M1 del curso:
🖼️ 800 iteraciones por píxel en ≈ 585 ms, sin bloquear la página
// Tras pulsar «Dibujar con detalle» y enseguida «Detener»:
⏹ detenido: el dibujo se queda a medias
```

Mientras el worker dibuja, el reloj avanza y «+1» responde al instante: el hilo principal no hace nada más que recibir mensajes de progreso. Para animaciones, los workers dedicados tienen en Chrome su propio `requestAnimationFrame`, y el bucle de la lección «El bucle de animación» funciona igual dentro de un worker. Y el `OffscreenCanvas` también admite los contextos de WebGL y WebGPU, los de los módulos de la GPU de este capítulo.

### 🐛 El canvas ya no es de la página

Una vez transferido el control, el `<canvas>` de la página ya no es suyo: `getContext` lanza `InvalidStateError`, igual que intentar transferirlo una segunda vez (a otro worker, por ejemplo). Tampoco se le puede cambiar el tamaño desde la página: por eso los ejemplos fijan `width` y `height` **antes** de transferir. Si la página necesita cambiar el dibujo, se lo pide por mensaje a quien tiene el contexto.

[[exercise:09-getcontext-tras-transferir.md]]

[[exercise:09-getcontext-tras-transferir.md-(script.js)]]

```text
🐛 getContext → InvalidStateError: Failed to execute 'getContext' on 'HTMLCanvasElement': Cannot get context from a canvas that has transferred its control to offscreen.
🐛 transferir otra vez → InvalidStateError: Failed to execute 'transferControlToOffscreen' on 'HTMLCanvasElement': Cannot transfer control from a canvas for more than one time.
✅ el worker dibujó 6 barras: para cambiar el gráfico, se le envía un mensaje
```

Lo mismo vale al revés: si llamaste a `getContext` en el canvas **antes** de transferirlo, `transferControlToOffscreen` también falla. Decide al crear el canvas quién va a dibujar en él.

## Píxeles en un worker: `ImageBitmap`

Para procesar una imagen en un worker hacen falta sus píxeles, y un `<img>` no se puede enviar (es un nodo del DOM). La pieza es **`createImageBitmap(fuente)`**: convierte un `Blob`, una imagen, un canvas o un `ImageData` en un `ImageBitmap`, una imagen ya **decodificada** y lista para dibujar, que además es transferible. El worker la dibuja en un `OffscreenCanvas` suelto, lee sus píxeles con `getImageData`, aplica el filtro y devuelve el resultado con `transferToImageBitmap()`, otro `ImageBitmap`, transferido de vuelta.

El filtro es el núcleo «desenfocar» de la lección «Píxeles» (cada píxel, la media de sus nueve vecinos) repetido 60 veces, unos 0,3 s de cálculo. El mismo módulo `blur.js` lo usan la página y el worker, para comparar:

[[exercise:10-filtro-en-un-worker.md]]

[[exercise:10-filtro-en-un-worker.md-(script.js)]]

```text
📷 el «Valle de México» de José María Velasco: 480 × 330 px
   la copia enviada, en la página → 0 × 0
🔁 ida y vuelta: 1 pasada en el worker, y la foto (casi igual) de vuelta en el canvas
Listo: pulsa «Desenfocar en un worker» y luego «Desenfocar en el hilo principal»; mira el reloj
// Tras pulsar «Desenfocar en un worker». Los tiempos cambian en cada ejecución; en el M1 del curso:
   la copia enviada, en la página → 0 × 0
worker: 60 pasadas en ≈ 310 ms · ticks del reloj mientras tanto: ≈ 12
// Tras pulsar «Restaurar» y «Desenfocar en el hilo principal»:
hilo principal: 60 pasadas en ≈ 320 ms · ticks del reloj mientras tanto: 0
```

El cálculo cuesta lo mismo en los dos hilos; la diferencia es **quién espera**. En el worker, el reloj sigue andando y la página responde; en el hilo principal, el reloj se para y ningún clic se atiende hasta el final. Fíjate también en `0 × 0`: un `ImageBitmap` transferido queda desconectado, como un búfer, y por eso la página envía siempre una copia (`createImageBitmap(original)`) y conserva la suya. `bitmap.close()` libera la memoria de un `ImageBitmap` cuando ya no hace falta.

## Bestiario

- **Después de enviar al worker, el array está vacío.**
  Síntoma: tras un `postMessage`, un typed array tiene `length` 0, leer da `undefined` y escribir no hace nada (y sus métodos lanzan `TypeError: … on a detached ArrayBuffer`); o le pasa a otra vista del mismo búfer que ni siquiera enviaste.
  Causa: su búfer estaba en la lista de transferencia: ahora es del worker y el de la página quedó desconectado (*detached*).
  Solución: no uses lo transferido hasta que vuelva; para enviar solo un trozo, `slice` (copia) y transfiere la copia; para conservar los datos, no los transfieras.
  → [ver ejemplo](02-el-original-queda-vacio.md)
- **`DataCloneError: … ArrayBuffer at index 0 is already detached.`**
  Síntoma: el segundo `postMessage` con el mismo búfer lanza `DataCloneError`.
  Causa: ese búfer ya se transfirió una vez.
  Solución: espera a que el worker lo devuelva (ida y vuelta) y transfiere el que llega.
  → [ver ejemplo](02-el-original-queda-vacio.md)
- **`InvalidStateError: … Cannot get context from a canvas that has transferred its control to offscreen.`**
  Síntoma: `getContext` (o un segundo `transferControlToOffscreen`) lanza `InvalidStateError` en un canvas que funcionaba.
  Causa: el control del canvas se transfirió a un `OffscreenCanvas`, y solo él puede dibujar.
  Solución: decide quién dibuja en cada canvas; fija su tamaño antes de transferir y pide los cambios al worker por mensaje.
  → [ver ejemplo](09-getcontext-tras-transferir.md)

## Resumen

- `postMessage(mensaje, [transferibles])` mueve esos objetos en lugar de copiarlos: el worker los recibe al instante y la página se queda sin ellos.
- Un búfer transferido queda desconectado: `byteLength` 0, todas sus vistas vacías, sin error; transferirlo otra vez lanza `DataCloneError`.
- La lista lleva búferes, no vistas: el búfer de un `subarray` es el entero. Para enviar un trozo, `slice` y transfiere la copia.
- `structuredClone(v, { transfer })` y `buffer.transfer()` mueven dentro de un hilo; para devolver datos, el worker también transfiere (ida y vuelta, un dueño cada vez).
- Transferibles: `ArrayBuffer`, `MessagePort`, streams, `ImageBitmap`, `OffscreenCanvas`, `VideoFrame`… Un `MessageChannel` conecta dos workers directamente.
- `canvas.transferControlToOffscreen()` deja que un worker dibuje en un canvas de la página; después, la página no puede pedirle contexto.
- `createImageBitmap` + transferir + `OffscreenCanvas` en el worker: los filtros de imagen pesados, sin congelar la página.

## Para profundizar

- [MDN: Objetos transferibles (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)
- [MDN: OffscreenCanvas (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [web.dev: OffscreenCanvas, acelera tus operaciones de canvas con un web worker (en inglés)](https://web.dev/articles/offscreen-canvas)
- [MDN: Channel Messaging API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API)
- [Documentación de Python: multiprocessing.shared_memory](https://docs.python.org/es/3/library/multiprocessing.shared_memory.html)
