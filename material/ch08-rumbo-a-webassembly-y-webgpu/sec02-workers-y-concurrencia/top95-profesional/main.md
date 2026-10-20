# Ejemplos profesionales: workers y concurrencia

## Por qué importa

Las tres lecciones del módulo y la integración han dado las piezas: crear workers y hablar con ellos con peticiones numeradas, los límites del clonado estructurado, transferir búferes, imágenes y canvas, y trabajar sin memoria compartida. Esta página reúne doce programas que las usan a la vez, escritos como en un proyecto real con todo lo que has visto en el curso: un cliente RPC, un editor de fotos, la huella de un archivo, el juego de la vida, un visor de registros, una cola de trabajos, un búfer circular para audio, un medidor de fluidez, una tabla de 200 000 filas, un generador de miniaturas, un compresor y una hoja de cálculo.

Usan los archivos de `assets/` (`valley-of-mexico.jpg`, el «Valle de México» de José María Velasco; `great-wave.jpg`, «La gran ola de Kanagawa» de Hokusai; y `sales.csv`) y, cuando tiene sentido, un archivo tuyo, que **nunca sale de tu navegador**. El código de cada worker está en su carpeta de «Assets» (`assets/01-rpc/`, `assets/02-photo/`…): todos son workers de módulo, importan los mismos archivos que la página y funcionan también en las tarjetas de la teoría. Recuerda que el `console.log` de un worker no llega a la consola de LearnWeb: todos envían sus resultados a la página, y es la página la que imprime. Para ver lo que pasa dentro de un worker, abre el ejemplo con ↗ y usa las DevTools de Chrome.

Al cargar, ninguno ocupa la CPU más de una décima de segundo. El trabajo pesado empieza con un botón y, con los archivos del curso, ocupa como mucho alrededor de un segundo de CPU, casi todo en un worker; todos los workers se terminan al salir de la página. Los tiempos se ven en la página; en los bloques de abajo aparecen con «≈», porque en tu máquina serán otros. Las descargas solo funcionan con «▶ Run» o en el editor. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **Un dueño para cada dato.** El worker es dueño de lo pesado (el catálogo, el registro, el tablero, la hoja) y la página le pregunta: nunca recibe 200 000 filas ni 40 000 líneas, solo lo que pinta. Un búfer, un `ImageBitmap` o un canvas tienen un solo dueño cada vez y cambian de manos por transferencia.
- **Un protocolo con forma fija.** Cada mensaje lleva `{ id, type, … }`; la página guarda las promesas pendientes en un `Map` y las resuelve por su `id`. Qué hacer con una respuesta vieja depende del programa: un buscador la descarta; una hoja de cálculo aplica todos los parches, en orden.
- **Nada se copia sin motivo.** Los `File` y los `Blob` viajan como referencias; los píxeles, transferidos a la ida y a la vuelta; los errores, como datos que la página reconstruye.
- **Todo se puede parar.** Mensajes `cancel` que el worker mira entre trozo y trozo (cediendo el turno con `setTimeout`, como en la integración), plazos con `AbortSignal`, `terminate()` y un worker nuevo para el que se atasca, y `pagehide` para cerrarlo todo.
- **Pools pequeños, resultados en su sitio.** Como mucho `Math.min(4, navigator.hardwareConcurrency)` workers; cada resultado va a su hueco (su franja, su foto, su trabajo), no al orden de llegada, y la consola imprime al final y en un orden fijo.
- **Accesibles.** Progreso con `<progress>` y `role="status"`, regiones `aria-live` que no cambian quince veces por segundo, tableros y rejillas que se manejan con el teclado (un solo elemento en el orden de Tab y las flechas para moverse) y `prefers-reduced-motion` en todo lo que se mueve.

## Un cliente RPC con plazos y cancelación

**Objetivo:** llamar a las funciones de un worker como si fueran métodos asíncronos de un objeto: `await api.quote('Jalisco', 2.5)`. **Técnicas:** `01-rpc/rpc.js` tiene las dos mitades del protocolo: `exposeWorkerApi(api)` en el worker, que convierte cada `{ id, method, args }` en una llamada, y `createWorkerClient(worker)` en la página, un `Proxy` (lección «Proxy y Reflect») cuyo `get` devuelve, para cualquier nombre, una función que envía el mensaje y devuelve una promesa. Cada llamada tiene un plazo con `AbortSignal.timeout`, combinado con la señal de quien llama mediante `AbortSignal.any` (lección «Combinadores y cancelación»); al abortar, la promesa se rechaza al momento, el worker recibe `{ id, cancel: true }` y el método remoto ve su señal en `this.signal`. Los errores viajan como datos (nombre, mensaje y campos propios) y la página los reconstruye. **Fíjate en** la primera línea: el clonado estructurado convierte un `ValidationError` en un `Error` a secas, sin su campo `field`, y por eso el protocolo no le confía los errores. Y en `then`: el `Proxy` devuelve `undefined` para ese nombre a propósito, porque si no, `await api` tomaría el cliente por una promesa. Bibliotecas como Comlink hacen exactamente esto.

[[exercise:01-cliente-rpc-con-proxy.md]]

```text
🧪 structuredClone de un ValidationError → llega como «Error» y con field undefined
🚚 Jalisco, 2.5 kg (CP 44100, zona resto del país) → $176.00
⚠️ Sonora, 1 kg → ValidationError en «state»: no enviamos a Sonora
⚠️ Jalisco, 45 kg → RangeError (instanceof RangeError: true): el peso debe estar entre 0 y 30 kg
Listo: cotiza otro envío, o pide el informe con plazo de 1 s (vence) o de 3 s (y prueba «Cancelar»)
// Tras elegir «Ciudad de México», escribir 06600 en «Código postal» y pulsar «Cotizar»:
🚚 Ciudad de México, 2.5 kg (CP 06600, zona centro) → $144.00
// Tras pulsar «Pedir con plazo de 1 s» (y esperar 1 s):
⏱️ informe de octubre → TimeoutError: el informe tarda 1,5 s y el plazo era 1 s
// Tras pulsar «Pedir con plazo de 3 s» (y esperar 1,5 s):
📊 informe de octubre: 1,284 envíos · $214,380.00
// Tras pulsar «Pedir con plazo de 3 s» y, antes de 1,5 s, «Cancelar»:
⏹ informe de octubre → AbortError: cancelado por ti
```

## Retoque de fotos con un pool de workers

**Objetivo:** un editor de fotos cuyos filtros nunca congelan la página. **Técnicas:** la imagen se parte en 8 franjas horizontales; cada una es una copia de sus filas (`slice`) que viaja **transferida** al primer worker libre de un pool de `min(4, núcleos)`, vuelve transferida y se pinta en cuanto llega, con un `putImageData` limitado a su rectángulo. Los filtros que miran a los vecinos (desenfocar y enfocar, los núcleos 3 × 3 de la lección «Píxeles») necesitan filas de más alrededor de cada franja, el **halo**: una por pasada. «Cancelar» vacía la cola y deja terminar las franjas que ya están en un worker, porque son cortas: sus respuestas llevan el número de un trabajo anterior y se ignoran. «Deshacer» guarda hasta 10 estados, y los filtros (`02-photo/filters.js`) los importan la página y los workers: el mismo código en los dos lados. **Fíjate en** la comprobación de la carga: desenfocar dos veces por franjas da exactamente los mismos bytes que desenfocar la imagen entera en la página. Sin el halo, cada franja tendría una costura en sus bordes.

[[exercise:02-retoque-de-fotos.md]]

```text
🖼️ «Valle de México» (José María Velasco, 1877): 480 × 330 px en 8 franjas
✅ desenfoque ×2 por franjas = desenfoque ×2 de la imagen entera: true
Listo: elige un filtro y pulsa «Aplicar»; luego «Deshacer». Con una foto tuya grande y «Desenfocar» al 10, prueba «Cancelar»
// Tras pulsar «Aplicar» (Desenfocar, 3), «Deshacer» y «Original». Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ Desenfocar (3): 8 franjas en ≈ 30 ms
↩️ deshecho
🔄 original
// Tras elegir «La gran ola» en «Foto»:
🖼️ «La gran ola de Kanagawa» (Hokusai, hacia 1831): 480 × 323 px en 8 franjas
```

## La huella de un archivo

**Objetivo:** comprobar que una descarga llegó intacta comparando su SHA-256 con el que publica su autor. **Técnicas:** `crypto.subtle.digest` necesita el archivo entero en memoria y no dice nada hasta el final, así que el worker usa una implementación propia e incremental (`03-hash/sha256.js`: la norma FIPS 180-4 con los operadores de bits y el `>>> 0` de la lección «Bits y bytes») y la alimenta con los trozos de `file.stream()`: memoria constante, progreso cada megabyte y, entre megabyte y megabyte, un `setTimeout` que deja entrar el mensaje de cancelar. El resultado se comprueba contra `crypto.subtle` en los archivos de hasta 64 MB. La huella publicada se normaliza (minúsculas, sin espacios ni «:»), y también vale una línea de un archivo `SHA256SUMS` («huella  nombre»). **Fíjate en** «32 MB de prueba»: los bytes salen de un generador con semilla, así que son siempre los mismos y su huella también; crearlos sí ocupa la página unas décimas de segundo, calcular la huella no. Y compara la línea de `valley-of-mexico.jpg` con `sales.csv` cargado: además de ❌, te avisa de que la línea es de otro archivo.

[[exercise:03-huella-de-un-archivo.md]]

```text
🔐 valley-of-mexico.jpg · 31,727 bytes → 7f2911b033f4c85a6ac4d3bf884a0adf0817cd3e5b05a59639c08e03c4e0d481 · ✅ igual que crypto.subtle.digest
Listo: copia la huella de arriba en «Huella publicada» y pulsa «Comparar»; cambia una cifra y compara otra vez. Después, «32 MB de prueba» (y «Cancelar»)
// Tras copiar la huella en «Huella publicada» y pulsar «Comparar»; luego, tras cambiar su última cifra por un 0 y comparar otra vez:
✅ Coincide: valley-of-mexico.jpg está intacto.
❌ No coincide.
// Tras pulsar «sales.csv», escribir «7f2911b033f4c85a6ac4d3bf884a0adf0817cd3e5b05a59639c08e03c4e0d481  valley-of-mexico.jpg» y pulsar «Comparar»:
🔐 sales.csv · 55,609 bytes → 5c048b6bfb00341f3eb54c9baff29f3fc5875d7f077ac477aa9ec2a623cbd5e3 · ✅ igual que crypto.subtle.digest
❌ No coincide (y esa línea es de valley-of-mexico.jpg, no de sales.csv).
// Tras pulsar «32 MB de prueba». Los tiempos cambian en cada ejecución; en el M1 del curso:
🔐 prueba-32mb.bin · 33,554,432 bytes → 8ff98e8c966792ddd61f5577ca789ff78dbb0f9ff3c34f1003e6f040a30e35b4 · ✅ igual que crypto.subtle.digest
⏱️ ≈ 0.95 s · ≈ 35 MB/s, sin bloquear la página
// Tras pulsar otra vez «32 MB de prueba» y, mientras lee, «Cancelar»:
⏹ prueba-32mb.bin: cancelado a mitad de lectura
```

## El juego de la vida en un `OffscreenCanvas`

**Objetivo:** una simulación con su bucle de animación entero fuera del hilo principal. **Técnicas:** la página fija el tamaño del canvas (64 × 40 células de 7 px, multiplicado por `devicePixelRatio`), lo transfiere con `transferControlToOffscreen()` y ya no dibuja nada. El worker (`04-life/life-worker.js`) tiene el tablero (un `Uint8Array`), las reglas (`04-life/life.js`), el bucle con paso fijo de la lección «El bucle de animación» y su propio `requestAnimationFrame`, que en Chrome existe también en los workers dedicados; la página envía órdenes (reproducir, paso, velocidad, cambiar una célula) y recibe un resumen. El tablero es enfocable: las flechas mueven un cursor que dibuja el worker, Espacio cambia la célula y una región `aria-live` dice su estado; los contadores no son `aria-live`, porque cambiarían quince veces por segundo. **Fíjate en** la segunda línea: el worker simula 120 generaciones sobre una copia del tablero, sin dibujar, antes de que pulses nada. Y en los límites: una reproducción se para sola a las 300 generaciones, se pausa al ocultar la pestaña y, con «reducir movimiento», no hay reproducción: se avanza con «Paso» o con la tecla N.

[[exercise:04-juego-de-la-vida.md]]

```text
🧬 cañón de planeadores de Gosper: generación 0 · 36 células vivas
🔮 simulado en el worker, sin dibujar: 41 vivas tras 30 generaciones · 56 tras 120
Listo: pulsa «Reproducir» (se para sola a las 300 generaciones) o haz clic en el tablero para cambiar células
// Tras pulsar «Reproducir» y esperar 20 s (300 generaciones a 15 por segundo), sin tocar el tablero:
⏸ se paró sola en la generación 300 · 87 células vivas
```

## Un visor de registros

**Objetivo:** buscar en el registro de un servidor (40 000 líneas inventadas o el archivo que abras) sin que la página lo tenga nunca entero. **Técnicas:** las líneas viven en el worker (`05-logs/log-worker.js`, con las funciones puras de `05-logs/logs.js`). La página envía cada consulta con un `id`, espera 150 ms sin teclear (*debounce*) y pinta solo la respuesta de la última: el total y las 200 primeras líneas, cada una con sus «fichas» `[inicio, fin, tipo]` para resaltarla con nodos de texto y `<span>`, nunca con `innerHTML`, porque un registro puede contener cualquier cosa, también `<script>`. Una `/expresión/` escrita por el usuario puede tardar muchísimo en fallar: si una consulta no responde en 1 s, la página termina el worker y crea otro, que vuelve a cargar el archivo abierto. Los errores de sintaxis vuelven como datos. **Fíjate en** un detalle del worker: su `onmessage` es una función `async`, y mientras `file.text()` lee un archivo nuevo, ya entran los mensajes siguientes. Por eso cada consulta espera a que termine la lectura (`await loading`); sin esa línea, la búsqueda que la página envía justo detrás del archivo miraría todavía el registro anterior.

[[exercise:05-visor-de-registros.md]]

```text
📜 tienda-2026-10-13.log: 40,000 líneas · ERROR 1,991 · WARN 1,214 · INFO 36,795 · p95 255 ms
🚨 la IP con más errores: 189.203.44.12 (834)
🔎 «error 503» → 1,202 líneas (se muestran 200)
Listo: escribe otro filtro (prueba «post carrito» o /pagos.*[2-9]\d{3}ms/), marca «Solo lentas» o abre un registro tuyo
// Tras borrar el filtro y escribir «post carrito» de corrido (con pausas, verás también las búsquedas intermedias):
🔎 «post carrito» → 1,325 líneas (se muestran 200)
// Tras marcar «Solo lentas (≥ 500 ms)»:
🔎 «post carrito» → 50 líneas
// Tras escribir /pagos.*[2-9]\d{3}ms/ en el filtro:
🔎 «/pagos.*[2-9]\d{3}ms/» → 119 líneas
// Tras escribir /(pagos/ (le falta un paréntesis):
⚠️ SyntaxError: Invalid regular expression: /(pagos/: Unterminated group
```

## Una cola de trabajos

**Objetivo:** las exportaciones de una tienda (facturas, inventario, catálogo, respaldo…), dos a la vez, con prioridades, cancelación y reintentos. **Técnicas:** un pool fijo de 2 workers (`06-queue/job-worker.js`) y una cola ordenada por prioridad y, dentro de cada prioridad, por orden de llegada. Los estados de un trabajo (en cola, en marcha, esperando reintento, hecho, falló, cancelado) solo los cambia la página; el worker informa. Los fallos se reintentan hasta 3 veces con espera exponencial (300 ms, 600 ms), porque un servicio saturado necesita aire, no una lluvia de reintentos. Cancelar depende del estado: un trabajo en cola o esperando reintento se quita sin más; uno en marcha recibe `{ type: 'cancel' }` y el worker para en el siguiente paso. Los pasos son esperas, así que no gastan CPU. **Fíjate en** la consola: como los trabajos terminan en un orden que cambia de una vez a otra, no se imprime nada al acabar cada uno; al final, un resumen y una línea por trabajo, en el orden en que se crearon. Y en «Añadir uno urgente»: se pone delante de los que esperan, pero no interrumpe a los que ya están en marcha.

[[exercise:06-cola-de-trabajos.md]]

```text
📋 6 trabajos en cola, en este orden: Facturas de octubre (alta) · Inventario de la bodega (normal) · Catálogo de temporada (normal) · Reporte de ventas por estado (normal) · Respaldo de pedidos (baja) · Fotos del catálogo (baja)
Listo: pulsa «Empezar»; mientras tanto, «Añadir uno urgente» o el «Cancelar» de algún trabajo
// Tras pulsar «Empezar» y esperar unos 4 s:
▶ en marcha: 2 trabajos a la vez
📊 6 de 6 terminados: ✅ 5 hechos · ❌ 1 falló · ⏹ 0 cancelados · 🔁 5 reintentos
   #1 Facturas de octubre (PDF) → hecho al intento 2
   #2 Inventario de la bodega (CSV) → hecho
   #3 Catálogo de temporada (PDF) → hecho
   #4 Reporte de ventas por estado → hecho al intento 3
   #5 Respaldo de pedidos → falló 3 veces: no hay espacio en el disco de respaldo
   #6 Fotos del catálogo (ZIP) → hecho
// Tras volver a ejecutar el ejemplo, pulsar «Empezar» y, antes de que termine, «Añadir uno urgente»:
▶ en marcha: 2 trabajos a la vez
➕ #7 Devolución urgente (PDF): se pone delante de los que esperan
📊 7 de 7 terminados: ✅ 6 hechos · ❌ 1 falló · ⏹ 0 cancelados · 🔁 5 reintentos
   #1 Facturas de octubre (PDF) → hecho al intento 2
   #2 Inventario de la bodega (CSV) → hecho
   #3 Catálogo de temporada (PDF) → hecho
   #4 Reporte de ventas por estado → hecho al intento 3
   #5 Respaldo de pedidos → falló 3 veces: no hay espacio en el disco de respaldo
   #6 Fotos del catálogo (ZIP) → hecho
   #7 Devolución urgente (PDF) → hecho
```

Los fallos de este lote están decididos de antemano (cada trabajo sabe en qué intento falla), así que el resumen es siempre el mismo aunque el orden en que terminan cambie. Con «Cancelar», en cambio, el resultado depende de en qué estado esté cada trabajo cuando lo pulses.

## Un búfer circular para audio

**Objetivo:** la estructura con la que el hilo del audio (un `AudioWorklet`) y un worker se pasan muestras sin mensajes, y cómo elegir su tamaño. **Técnicas:** `07-ring/ring-buffer.js` es un búfer de un productor y un consumidor, sin cerrojos: dos contadores que solo crecen, leídos y publicados con `Atomics.load` y `Atomics.store`, y publicados **después** de tocar los datos (lección «Memoria compartida»); la posición es `contador & (capacidad − 1)`, porque la capacidad es una potencia de 2. La memoria es la compartible de WebAssembly (`new WebAssembly.Memory({ …, shared: true })`, que en Chrome da un `SharedArrayBuffer` aunque la página no esté aislada), o un `ArrayBuffer` si no se pudiera crear. Pero no se comparte con nadie: sin las cabeceras COOP y COEP, productor y consumidor se turnan en el hilo principal, un paso por fotograma, y los tropiezos del productor salen de un generador con semilla. Un anillo SVG de 32 segmentos enseña lo lleno que está. **Fíjate en** la tabla de la carga: con 256 muestras hay 132 cortes en 1000 pasos; con 2048, uno solo, a cambio de 36 ms de retraso. No hay una capacidad «correcta»: es un compromiso entre cortes y latencia, el mismo que eliges al configurar el búfer de una aplicación de audio.

[[exercise:07-bufer-circular.md]]

```text
🧠 memoria: [object SharedArrayBuffer] de 65,536 bytes; el búfer usa 8 + 4 × capacidad
📏 1000 pasos con los mismos tropiezos del productor:
    256 muestras → 132 cortes · retraso medio 2.2 ms
    512 muestras →  79 cortes · retraso medio 6.7 ms
   1024 muestras →  22 cortes · retraso medio 15.9 ms
   2048 muestras →    1 corte · retraso medio 36.3 ms
Listo: pulsa «Simular 600 pasos» (unos 10 s) o «+100 pasos de golpe»; cambia la capacidad y compara
// Tras pulsar «Simular 600 pasos» y esperar unos 10 s (un paso por fotograma):
⏹ 600 pasos con 1,024 muestras: 12 cortes · retraso medio 16.1 ms
// Tras elegir «256 muestras» en «Capacidad» y pulsar «+100 pasos de golpe»:
🔄 capacidad: 256 muestras (1,032 bytes)
⏭️ 100 pasos con 256 muestras: 14 cortes · retraso medio 2.2 ms
```

## Un medidor de fluidez

**Objetivo:** ver con números qué le pasa a la página mientras corre un cálculo de unas décimas de segundo, según dónde y cómo se haga. **Técnicas:** el mismo cálculo (contar los primos menores que 3 000 000 con el código de `08-meter/primes.js`) de cuatro formas: de una vez en el hilo principal, troceado en rebanadas de 8 ms que ceden el turno con `setTimeout`, troceado con `scheduler.yield()` y en un worker. Mientras dura, dos sondas toman nota, y solo durante la prueba: una cadena de `setTimeout` de 10 ms que mide cuánto se retrasa cada vuelta (el bloqueo más largo del bucle de eventos, lo que esperaría cualquier otra tarea) y un bucle de `requestAnimationFrame` que cuenta los fotogramas que tardan más de 50 ms (lo que se ve a tirones). Con «reducir movimiento» el punto no se mueve, pero las medidas son las mismas. **Fíjate en** la tabla: troceando con `setTimeout`, el total crece, pero el bloqueo baja a unos 15 ms; `scheduler.yield()` cede el turno con una continuación que pasa delante de las demás tareas (lección «Frames de animación y tiempo»), así que la sonda, que es otro `setTimeout`, espera casi tanto como sin trocear, y algún fotograma llega tarde; y el worker es el único que deja libre el hilo principal sin tocar el cálculo. Para medir con más rigor, con `performance.mark` y las tareas largas, está el módulo «Rendimiento».

[[exercise:08-medidor-de-fluidez.md]]

```text
📏 cada prueba cuenta los primos menores que 3,000,000 (216,816); comprobación rápida: 168 primos menores que 1,000
Listo: pulsa las cuatro pruebas, una tras otra, y compara la tabla; mueve el ratón o pulsa Tab mientras corren
// Tras pulsar las cuatro pruebas, una tras otra. Los tiempos cambian en cada ejecución; en el M1 del curso:
🧪 hilo principal, de una vez: ≈ 235 ms · bloqueo más largo ≈ 225 ms · fotogramas de más de 50 ms: 1 (el peor, ≈ 220 ms)
🧪 troceado con setTimeout: ≈ 430 ms · bloqueo más largo ≈ 15 ms · fotogramas de más de 50 ms: 0 (el peor, ≈ 20 ms)
🧪 troceado con scheduler.yield(): ≈ 240 ms · bloqueo más largo ≈ 230 ms · fotogramas de más de 50 ms: ≈ 2 (el peor, ≈ 100 ms)
🧪 en un worker: ≈ 240 ms · bloqueo más largo ≈ 5 ms · fotogramas de más de 50 ms: 0 (el peor, ≈ 20 ms)
```

## Una tabla de 200 000 filas

**Objetivo:** un catálogo de 200 000 productos que se filtra, se ordena y se recorre sin pesar. **Técnicas:** el catálogo vive en el worker **por columnas**, un typed array por campo (`09-table/catalog.js`: producto y variante en `Uint8Array`, precio en centavos en `Uint32Array`, existencias en `Uint16Array`), y una vista (filtro más orden) es una permutación de índices en un `Uint32Array`. La página pide la vista y después solo los tramos de filas que se ven, como mucho una vez por fotograma: la tabla es **virtual**, con las filas visibles, unas pocas de margen y dos filas vacías que ocupan el alto del resto. `aria-rowcount` y `aria-rowindex` dicen a un lector de pantalla cuántas filas hay y cuál es cada una; las cabeceras ordenan con un botón y llevan `aria-sort`. Cada petición lleva un `id`, y las respuestas viejas (de una vista o de un tramo que ya no se ven) se descartan. **Fíjate en** el orden de la carga: primero una búsqueda (8 537 filas que ordenar) y después la vista por defecto, la única vez que se ordenan las 200 000, porque ordenar es lo caro (unas decenas de milisegundos en el worker; la línea de estado dice cuánto tardó cada vista). Las listas enormes en el hilo principal, con sus trucos de medida y de render, son cosa del módulo «Rendimiento».

[[exercise:09-tabla-de-200000-filas.md]]

```text
🗂️ 200,000 productos generados en el worker, por columnas en typed arrays
🔢 por precio, de mayor a menor: 1.º «Huaraches mediano» (#148788) $1,241.85
🔎 «mole» en Despensa, con existencias → 8,537 productos; el más barato: «Mole negro chico» $108.00
Listo: desplázate por la tabla (con la rueda o con Tab y AvPág), ordena por una columna o escribe «cafe regalo»
// Tras escribir «cafe regalo» de corrido (con pausas, verás también las vistas intermedias):
🔎 «cafe regalo» · por precio ↓ → 1,260 productos
// Tras marcar «Solo con existencias» y pulsar la cabecera «Producto»:
🔎 «cafe regalo» con existencias · por precio ↓ → 1,049 productos
🔎 «cafe regalo» con existencias · por nombre ↑ → 1,049 productos
```

## Miniaturas

**Objetivo:** reducir muchas fotos a la vez, las tuyas o las dos del curso, sin bloquear la página. **Técnicas:** cada foto es un trabajo para un pool de `min(4, núcleos)` workers (`10-thumbs/thumb-worker.js`). El `File` llega al worker como referencia, sin copiar sus bytes; el worker lo decodifica con `createImageBitmap`, lo reduce en un `OffscreenCanvas` suelto con `imageSmoothingQuality = 'high'` y lo codifica a WebP con `convertToBlob`; el `Blob` vuelve, también como referencia. La galería reserva un hueco por foto en el orden en que las elegiste, y cada miniatura ocupa el suyo cuando llega, termine antes o después. Las URL de objeto se liberan al vaciar la galería o al salir. **Fíjate en** la consola: solo imprime cuando han terminado todas, en el orden de la galería, y solo las medidas, porque los bytes de un WebP dependen del codificador del navegador (la página sí los enseña).

[[exercise:10-miniaturas.md]]

```text
🖼️ valley-of-mexico.jpg: 480 × 330 → 240 × 165
🖼️ great-wave.jpg: 480 × 323 → 240 × 162
Listo: elige varias fotos tuyas (o cambia el ancho y pulsa «Las dos fotos del curso»)
// Tras elegir «160 px» en «Ancho» y pulsar «Las dos fotos del curso»:
🖼️ valley-of-mexico.jpg: 480 × 330 → 160 × 110
🖼️ great-wave.jpg: 480 × 323 → 160 × 108
// Tras pulsar «Vaciar»:
🧹 galería vacía: URL de objeto liberadas
```

## Un compresor gzip

**Objetivo:** comprimir un archivo sin tenerlo dos veces entero en memoria y sin bloquear la página. **Técnicas:** en el worker (`11-gzip/gzip-worker.js`) todo es un stream: `file.stream()` pasa por un `TransformStream` que cuenta los bytes (el progreso) y por `CompressionStream('gzip')` (lección «Streams y progreso»). Antes de ofrecer el resultado, se comprueba: se descomprime con `DecompressionStream` y se compara byte a byte con el original, leído con `Blob.bytes()` (en Chrome). El `File` entra y el `Blob` comprimido sale como referencias; la página solo crea la URL de descarga y libera la anterior. **Fíjate en** las dos líneas de la carga: el CSV queda en menos de una cuarta parte y el JPEG casi igual, porque ya venía comprimido. La consola lo dice con palabras porque el tamaño exacto depende de la versión de zlib del navegador; la página da los bytes. El registro de 4,6 MB es el del visor de registros (el mismo `05-logs/logs.js`): generarlo ocupa la página una décima de segundo; comprimirlo, nada.

[[exercise:11-compresor-gzip.md]]

```text
📦 sales.csv: 55,609 bytes → a menos de una cuarta parte · ¿la ida y vuelta da los mismos bytes? true
📦 valley-of-mexico.jpg: 31,727 bytes → casi igual: ya venía comprimido · ¿la ida y vuelta da los mismos bytes? true
Listo: pulsa «Un registro de 4,6 MB» o elige un archivo tuyo; prueba con algo ya comprimido (un .zip, una foto)
// Tras pulsar «Un registro de 4,6 MB». Los tiempos cambian en cada ejecución; en el M1 del curso:
📦 tienda.log: 4,597,851 bytes → a menos de una cuarta parte · ¿la ida y vuelta da los mismos bytes? true
⏱️ comprimido y comprobado en ≈ 80 ms, sin bloquear la página
```

## Una hoja de cálculo

**Objetivo:** una hoja de cálculo que calcula sus fórmulas fuera del hilo principal y que, al cambiar una celda, solo recalcula lo que depende de ella. **Técnicas:** el motor entero está en el worker. `12-sheet/formula.js` analiza cada fórmula una sola vez con un analizador descendente recursivo (sumas, productos, potencias, signos, celdas, rangos y funciones como `SUMA`, `MIN` o `PAGO`, con las prioridades de Excel) y la convierte en un árbol que luego evalúa; los errores son valores (`#¡DIV/0!`, `#¡REF!`, `#¿NOMBRE?`…) que pasan a las celdas que los leen. `12-sheet/sheet.js` guarda, para cada celda, las que lee y, al revés, las que la leen: un **grafo de dependencias**. Al cambiar una celda se buscan todas sus dependientes y se ordenan para que cada una se calcule después de las que lee (un orden topológico, con el algoritmo de Kahn: primero las que no esperan a nadie). Las que no se pueden ordenar están en un ciclo y dan `#¡CICLO!`, en lugar de colgar la hoja. La página recibe un **parche** con las celdas recalculadas y las resalta; aquí ninguna respuesta se descarta, porque cada parche trae celdas distintas y todos llegan en orden. La rejilla se maneja como una hoja de cálculo: una sola celda en el orden de Tab, flechas, Intro o F2 para editar, y escribir directamente para reemplazar. **Fíjate en** la tercera línea: cambiar la tasa (B5) obliga a recalcular 962 de las 964 fórmulas; el pago del mes 13 (D24), 911; el título (A1), ninguna. Tras cada cambio, el amarillo enseña cuáles. Y «¿Cuánto extra…?» es la herramienta «Buscar objetivo» de las hojas de cálculo: una bisección que prueba 42 valores de B8 (40 320 fórmulas) en unas decenas de milisegundos, sin que la página lo note.

[[exercise:12-hoja-de-calculo.md]]

```text
📗 hoja abierta en el worker: 1,225 celdas, 964 con fórmula
💰 pago mensual $19,967.60 · intereses totales $2,792,222.17 · saldo tras 240 meses $0.00
🕸️ fórmulas que dependen de B5 (la tasa): 962 · de B8 (el pago extra): 960 · de D24 (el pago del mes 13): 911 · de A1 (el título): 0
Listo: Tab hasta la hoja (empieza en B8), escribe 2000 e Intro; luego pon 50000 en D24, =B9/100000 en B5 (un ciclo) y 10.5 en B5
// Tras pulsar Tab hasta la hoja (B8), escribir 2000 y pulsar Intro:
✏️ B8 = 2000 → 960 de 964 fórmulas recalculadas · intereses totales $2,016,131.52
// Tras hacer clic en D24 (el pago del mes 13: un aguinaldo), escribir 50000 y pulsar Intro:
✏️ D24 = 50000 → 911 de 963 fórmulas recalculadas · intereses totales $1,923,489.14
// Tras hacer clic en B5, escribir =B9/100000 y pulsar Intro (la tasa depende de los intereses, que dependen de la tasa):
⛔ B5 = =B9/100000 → referencia circular: 962 fórmula(s) en #¡CICLO!
// Tras escribir 10.5 en B5 y pulsar Intro:
✏️ B5 = 10.5 → 961 de 963 fórmulas recalculadas · intereses totales $1,923,489.14
// Tras pulsar «Restaurar la hoja» y luego «¿Cuánto extra al mes para liquidar en 15 años?»:
🔄 hoja restaurada: 1,225 celdas, 964 con fórmula
🎯 liquidar en 180 meses: pago extra de $2,140.38 al mes · 42 pruebas con B8 (40,320 fórmulas recalculadas) · intereses totales $1,979,435.74
// Tras pulsar «Recalcular todo»:
🔁 recalcular todo: 964 de 964 fórmulas (lo que costaría cada cambio sin el grafo)
```

Con D24 = 50000 la hoja tiene una fórmula menos (963): esa celda es ahora un número escrito a mano, como se hace en una hoja de verdad para apuntar un pago extraordinario. Y fíjate en el ciclo: B4 y B12 conservan su valor, porque no dependen de B5; las fórmulas que sí dependen de ella quedan en `#¡CICLO!` hasta que la tasa vuelve a ser un número. Pasa el ratón por una celda con error (o selecciónala) para leer el motivo.

## Para profundizar

- [Comlink, de Google Chrome Labs: RPC para workers con un Proxy (en inglés)](https://github.com/GoogleChromeLabs/comlink)
- [web.dev: Usar web workers para sacar JavaScript del hilo principal (en inglés)](https://web.dev/articles/off-main-thread)
- [MDN: OffscreenCanvas (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [MDN: Compression Streams API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)
- [Wikipedia: Ordenamiento topológico](https://es.wikipedia.org/wiki/Ordenamiento_topol%C3%B3gico)
