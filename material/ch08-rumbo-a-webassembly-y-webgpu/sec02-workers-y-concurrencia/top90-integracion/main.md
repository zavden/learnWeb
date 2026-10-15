# Integración: workers y concurrencia

## Por qué importa

Las tres lecciones del módulo dan piezas sueltas: crear un worker y hablar con él, el clonado estructurado, los errores y `terminate()`; transferir búferes, puertos, streams e imágenes; y la memoria compartida, con lo que se hace en su lugar cuando no está. Un programa de verdad las usa todas a la vez. Un analizador de archivos necesita un worker, un protocolo con ids, progreso y cancelación. Un filtro de imágenes necesita transferir los píxeles, quizá a dos workers seguidos, y devolverlos sin copias. Y cualquier cosa que dependa de una entrada del usuario necesita un plazo: un worker atascado no responde a nada.

Los ejemplos de esta página combinan dos o tres lecciones cada uno. Los que tienen página propia imprimen al cargar una línea `Listo: …` con lo que hay que hacer y llevan su registro en la página. Todos crean sus workers con archivos de módulo de `assets/` o con un Blob, y los cierran al terminar o al salir de la página; ningún botón ocupa la CPU más de unas décimas de segundo.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| que un cálculo no congele la página | un worker; la página solo pinta lo que recibe | «Web workers» |
| emparejar respuestas con peticiones | un `id` por mensaje y un `Map` de promesas pendientes | «Web workers» |
| ignorar respuestas que ya no importan | comparar el `id` de la respuesta con el de la última petición | «Web workers» |
| dar un archivo a un worker | enviar el `File` o el `Blob` tal cual: viaja como referencia, sin copiar sus bytes | «Web workers», «Transferibles» |
| enviar muchos números sin copiarlos | un typed array y su búfer en la lista de transferencia; el worker lo devuelve igual | «Transferibles» |
| conectar dos workers entre sí | un `MessageChannel`, un puerto transferido a cada uno | «Transferibles» |
| cancelar un trabajo largo | un mensaje `cancel` que el worker mira entre trozo y trozo, o `terminate()` si no puede mirarlo | «Web workers» |
| un plazo máximo | `AbortSignal.timeout(ms)`; si vence, `terminate()` y un worker nuevo | «Web workers», «Combinadores y cancelación» |
| compartir datos que cambian | no compartir: trozos y resultados, ida y vuelta, doble búfer | «Memoria compartida» |

Dos reglas atraviesan la tabla. La primera: **un dueño para cada cosa**. El worker es dueño de sus datos (un catálogo, un índice, una caché) y la página le hace preguntas; un búfer tiene un solo dueño cada vez y cambia de manos por transferencia. La segunda: **todo lo que se pide puede no llegar**. Un worker puede fallar al cargar, lanzar un error, quedarse atascado o ser sustituido por una petición más nueva, y la página tiene que seguir funcionando en todos los casos: escuchar `error`, poner plazos, descartar respuestas viejas y cerrar lo que ya no sirve.

## Ejemplos combinados

### Un analizador de CSV con progreso y cancelación

Un `File` (o un `Blob`) se envía al worker como referencia: no se copia ni un byte. El worker lo lee por trozos con `file.stream()` y un `TextDecoder` (lección «Texto y binario»), junta las líneas cortadas entre trozos, informa del progreso y, entre trozo y trozo, mira si le han pedido cancelar. Ojo con un detalle: el mensaje `cancel` es una tarea, y solo entra cuando el worker termina la suya; si los trozos ya están disponibles (un `Blob` en memoria), los `await` del bucle pueden resolverse como microtareas, una tras otra, sin dejarle sitio. Por eso, cada megabyte, el worker cede el turno a propósito con un `setTimeout(…, 0)` (lección «El event loop»). Cada análisis lleva un `id`, y la página ignora los mensajes de uno cancelado o sustituido por otro.

[[exercise:01-analizador-de-csv.md]]

[[exercise:01-analizador-de-csv.md-(script.js)]]

```text
📄 sales.csv → 1,200 ventas, 0 filas descartadas · más vendido: Vainilla de Papantla (663 u.)
🏙️ Guadalajara $218,681.00 · Monterrey $216,711.00 · Mérida $206,128.00 · CDMX $204,948.00 · Puebla $186,379.00
Listo: pulsa «Generar 300 000 ventas» y, mientras lee, «Cancelar»; o elige un CSV tuyo
// Tras pulsar «Generar 300 000 ventas». El tiempo cambia en cada ejecución; en el M1 del curso:
🧪 300,000 ventas generadas: 13,871,567 bytes en un Blob
📄 ventas-generadas.csv → 300,000 ventas, 0 filas descartadas · más vendido: Chocolate de Oaxaca (151,278 u.)
🏙️ Guadalajara $51,476,974.00 · CDMX $51,194,916.00 · Mérida $51,099,599.00 · Monterrey $51,090,891.00 · Puebla $51,006,815.00
⏱️ leído y resumido en ≈ 250 ms, sin bloquear la página
// Tras pulsar otra vez «Generar 300 000 ventas» y enseguida «Cancelar»:
🧪 300,000 ventas generadas: 13,871,567 bytes en un Blob
⏹ ventas-generadas.csv: cancelado a mitad de lectura
```

Generar el texto de 300 000 ventas sí ocupa la página unas décimas de segundo: es la parte que no se ha llevado al worker, a propósito, para que veas la diferencia. Con un CSV que no tiene las columnas esperadas, el worker no se cae: responde con un error y la página lo muestra.

### Un buscador que nunca frena el teclado

El catálogo y su índice viven en el worker: la página nunca tiene los 1200 productos, solo pregunta. Mientras se teclea, cada consulta se envía con un `id` creciente y la página pinta solo la respuesta de la **última**; las demás, aunque lleguen, se descartan. Además, la página espera 150 ms sin teclear antes de preguntar (*debounce*), para no enviar una consulta por cada letra. Al cargar, cuatro consultas seguidas, sin esperas, muestran el descarte: llegan las cuatro respuestas y solo se pinta una.

[[exercise:02-buscador-mientras-escribes.md]]

[[exercise:02-buscador-mientras-escribes.md-(script.js)]]

```text
📚 catálogo listo en el worker: 1200 productos
⌨️ 4 consultas seguidas (m, mo, mol, mole): 4 respuestas, 1 pintada, 3 descartadas por viejas
🔎 «mole» → 100 resultados
Listo: borra y escribe «cafe oax» (sin tildes) o «miel yucatan 1 kg»
// Tras escribir «cafe oax» en lugar de «mole», de corrido (si haces pausas, verás también las consultas intermedias):
🔎 «cafe oax» → 10 resultados · descartadas hasta ahora: 3
```

Con un solo worker las respuestas llegan en orden, así que el descarte es fácil de ver. Con varios workers, o con un servidor en lugar de un worker, una respuesta vieja puede llegar **después** de una nueva, y sin el `id` pintarías resultados de algo que ya no está escrito. La búsqueda sin tildes usa `normalize('NFD')` y quita las marcas de acento, como en la lección «Strings».

### Una cadena de filtros entre dos workers

Dos workers del mismo archivo, cada uno con su filtro, unidos por un `MessageChannel`: la salida del primero es la entrada del segundo. La página transfiere una copia de los píxeles al primero (blanco y negro), este los transfiere al segundo por su puerto (viñeta) y el segundo los devuelve a la página. El mismo búfer de 633 600 bytes pasa por cuatro manos y nadie lo copia.

[[exercise:03-cadena-de-filtros.md]]

[[exercise:03-cadena-de-filtros.md-(script.js)]]

```text
📤 enviado: a la página le quedan 0 bytes de esa copia
🔗 página → blanco y negro → viñeta → página · 633,600 bytes, sin copias por el camino
¿todos los píxeles grises? true
Listo: pulsa «Ver el original» y luego «Aplicar la cadena»
// Tras pulsar «Ver el original» y «Aplicar la cadena»:
↩️ original
📤 enviado: a la página le quedan 0 bytes de esa copia
🔗 página → blanco y negro → viñeta → página · 633,600 bytes, sin copias por el camino
¿todos los píxeles grises? true
```

Cada filtro trabaja **en su sitio**, sobre los mismos bytes, y por eso el búfer puede seguir su camino tal cual. Un filtro que necesite los píxeles vecinos (un desenfoque) necesitaría un segundo búfer para el resultado, como en la lección «Píxeles»; entonces se transfiere ese.

### Expresiones regulares con plazo

Una expresión regular mal escrita puede tardar segundos (o años) en fallar: `^(\w+\s?)+$` prueba todas las formas de repartir las letras de una palabra antes de rendirse, y cada letra más duplica el trabajo. Dentro de un worker, la página no se congela, pero el worker deja de atender: ni nuevas pruebas ni mensajes de cancelación. La única salida es un **plazo**: cada prueba lleva su `AbortSignal.timeout(300)` y, si vence sin respuesta, la página termina el worker, rechaza lo que estuviera pendiente con el `TimeoutError` de la señal y arranca un worker nuevo. Los errores de sintaxis, en cambio, vuelven como datos (`{ ok: false, error: { name, message } }`).

[[exercise:04-expresiones-con-plazo.md]]

[[exercise:04-expresiones-con-plazo.md-(script.js)]]

```text
⚠️ SyntaxError: Invalid regular expression: /(\d{4}-\d{2}/g: Unterminated group
✅ 2 coincidencias: ventas@cafe-chiapas.mx, soporte@ejemplo.com.mx
Listo: pulsa «Patrón catastrófico» y, después, «Correos»: el worker nuevo responde
// Tras pulsar «Patrón catastrófico» y luego «Correos»:
⏱️ TimeoutError: más de 300 ms sin respuesta → worker terminado y sustituido (reinicios: 1)
✅ 2 coincidencias: ventas@cafe-chiapas.mx, soporte@ejemplo.com.mx
```

Es la versión «a la fuerza» de la cancelación: sin plazo, el patrón catastrófico del ejemplo tendría el worker ocupado casi un segundo; con una letra más, el doble. Los servicios que dejan a sus usuarios escribir expresiones regulares (buscadores de código, validadores de formularios) hacen exactamente esto, en un worker o en un proceso aparte.

### Estadísticas en paralelo, con búferes que van y vuelven

Las lecturas de 24 estaciones meteorológicas, cada una en su `Float32Array`. Todas salen a la vez hacia el pool, repartidas por turnos y **transferidas**: la página se queda con 0 de 24 búferes. Cada worker resume las suyas (mínimo, máximo, media, desviación y lecturas de 30 °C o más) y **devuelve el búfer** transferido, así que al final la página vuelve a tener sus 24 búferes intactos, sin una sola copia. Los resúmenes se guardan por número de estación, no por orden de llegada.

[[exercise:05-estadisticas-en-paralelo.md]]

[[exercise:05-estadisticas-en-paralelo.md-(script.js)]]

```text
📦 24 estaciones × 10,000 lecturas: 24 búferes de 40,000 bytes
📤 enviadas: a la página le quedan 0 de 24 búferes con datos
🔙 de vuelta: 24 de 24 búferes, con sus 10,000 lecturas
🌡️ la más cálida: estación 2 (media 28.0 °C, 3,945 lecturas ≥ 30 °C) · la más fría: estación 15 (media 14.0 °C)
Listo: pulsa «Analizar 24 × 250 000 lecturas»
// Tras pulsar «Analizar 24 × 250 000 lecturas». El tiempo cambia en cada ejecución; en el M1 del curso:
📦 24 estaciones × 250,000 lecturas: 24 búferes de 1,000,000 bytes
📤 enviadas: a la página le quedan 0 de 24 búferes con datos
⏱️ resumidas en ≈ 15 ms
🔙 de vuelta: 24 de 24 búferes, con sus 250,000 lecturas
🌡️ la más cálida: estación 2 (media 28.0 °C, 97,744 lecturas ≥ 30 °C) · la más fría: estación 15 (media 14.0 °C)
```

Generar 6 millones de lecturas en la página tarda bastante más que resumirlas en cuatro workers: en un programa real, los datos llegarían de la red o de un archivo, y lo mejor sería que el worker los leyera él mismo (como en el primer ejemplo).

### Busca el error

Tres errores que aparecen en código real con workers, cada uno con su arreglo. El primero es una trampa del lenguaje (lección «Operadores y coerción»): en `onProgress?.(++finished)`, si `onProgress` no existe, el `?.` se salta **toda** la llamada, también la evaluación de sus argumentos, así que `finished` no avanza y el pool no termina nunca. El segundo, el array que se sigue usando después de transferirlo: un bucle `for` por índice suma 0 sin avisar, y los métodos lanzan `TypeError`. El tercero, crear un worker por llamada y olvidar `terminate()`: cada uno sigue vivo, con su motor de JavaScript y su memoria, aunque no vuelva a hacer nada.

[[exercise:06-busca-el-error.md-]]

```text
🐛 1. onProgress?.(++finished) sin onProgress → a los 300 ms: pendiente
✅ 1. finished += 1 fuera del ?. → total 6000
🐛 2. el worker suma 1625, pero la página, después, suma 0 sin ningún aviso
   y con reduce → TypeError: Cannot perform %TypedArray%.prototype.reduce on a detached ArrayBuffer
✅ 2. con una copia: el worker suma 1625 y la página sigue sumando 1625
🐛 3. tres llamadas sin terminate() → workers vivos: 3
✅ 3. con terminate() en finally → workers nuevos que siguen vivos: 0
🧹 al final, workers vivos → 0
```

El navegador no tiene ninguna lista de los workers vivos de una página, así que el ejemplo lleva la suya (`alive`). En una aplicación grande, un registro así, o un pool con un número fijo de workers, es la forma de saber que no se escapa ninguno.

## Ejercicios

Los tres ejercicios se corrigen solos: al cargar, cada comprobación imprime `✅` o, en rojo, `❌` con el valor esperado y el obtenido. Las que ya salen en verde al abrirlos comprueban algo que el código de partida hace bien y que tu cambio no debe romper. En los tres, el código del worker está en el bloque HTML, dentro de un `<script type="text/js-worker">`: un script con un tipo inventado no se ejecuta, y la página lee su texto para crear el worker con un Blob. Así puedes editar el worker y la página en el mismo ejemplo.

### Sugerencias en un worker

Una búsqueda de «¿quisiste decir…?» que compara lo escrito con cada producto por su distancia de edición. El cálculo ya está en el worker; faltan el protocolo de petición y respuesta en los dos lados: el worker contesta `{ id, ok, result }` o `{ id, ok: false, error }`, y la página convierte cada petición en una promesa. Cinco comprobaciones (dos ya salen en verde).

[[exercise:07-ej-sugerencias-en-un-worker.md]]

### El búfer desconectado

Una nota de voz se normaliza en un worker y la página se queda sin nada: ni la versión normalizada ni la original para «Deshacer», y la segunda vez, `DataCloneError`. Arregla la ida y la vuelta de la transferencia. Cuatro comprobaciones.

[[exercise:08-ej-bufer-desconectado.md]]

### Cancelar un pool

Un pool de workers que reparte ocho trabajos funciona, pero no se puede parar. Añádele un `AbortSignal`: una señal ya abortada no crea ningún worker, abortar a mitad cierra todos los workers sin empezar ningún trabajo más, y el motivo del rechazo es el de la señal (`AbortError` o `TimeoutError`). Los trabajos son temporizadores: no gastan CPU. Seis comprobaciones (dos ya salen en verde).

[[exercise:09-ej-cancelar-un-pool.md]]
