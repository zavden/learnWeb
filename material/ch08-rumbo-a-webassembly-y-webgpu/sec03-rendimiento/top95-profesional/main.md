# Ejemplos profesionales: rendimiento

## Por qué importa

El rendimiento no se añade al final: se decide en cada pieza. Una tabla que solo crea las filas que se ven, un cliente que no pide dos veces lo mismo, una animación que no crea un objeto por frame, una vista que se lleva todo lo que puso en marcha al cerrarse. Esta página reúne doce herramientas y páginas completas escritas así, con todo lo que has visto en el curso (HTML, CSS, el lenguaje, el navegador, los datos binarios) y las tres lecciones de este módulo: **medir**, **la memoria** y **los frames**.

Nada pesado ocurre al cargar: cada ejemplo hace unos pocos milisegundos de trabajo y una prueba pequeña con resultado exacto. Las mediciones, las importaciones, las animaciones y las fugas de demostración empiezan con un botón, tienen un límite (300 ms de CPU por clic, 3 segundos de animación, un tope de fugas con su botón «Limpiar») y desactivan el botón mientras trabajan. Lee primero el bloque de comentarios del principio de cada script: explica las decisiones de diseño.

Los bloques de texto siguen la regla del módulo: primero lo que no cambia (conteos, resultados, tamaños de archivos, `true`/`false` con márgenes amplios) y, debajo de «Los tiempos cambian en cada ejecución», los tiempos con `≈`, medidos en el Mac del curso. Los ejemplos con observadores, frames o animaciones necesitan una vista previa visible: en una pestaña oculta no hay frames. Para ver las marcas, los frames y la memoria en DevTools, ábrelos con ↗.

## Qué tienen en común

- **Medir antes de cambiar, contar antes que cronometrar.** Cada ejemplo dice qué cuenta (filas en el DOM, renders, listeners vivos, chispas pisadas, recursos por tipo) y los tiempos solo confirman lo que los conteos ya explican. Los benchmarks comprueban primero que todas las variantes dan lo mismo, despiertan la CPU, calientan, miden lotes de 1 ms o más en rondas intercaladas y dan la mediana.
- **Memoria acotada y reservada una vez.** Typed arrays creados al empezar (columnas de datos, el anillo de chispas), pools y anillos con tope, cachés LRU con caducidad, listas de entradas con un máximo. Nada crece con el tiempo que la página pasa abierta.
- **Todo lo que se pone en marcha, se para.** Un `AbortController` (o un scope) por cada cosa que se abre; observadores desconectados al cerrar; bucles de `requestAnimationFrame` que se cancelan y se detienen al ocultar la pestaña.
- **El hilo principal, libre.** Rebanadas de trabajo medidas por tiempo que ceden el turno, `requestIdleCallback` con `timeout` para lo que puede esperar, los cambios del DOM en `requestAnimationFrame` y como mucho un render por frame.
- **Observar sin estorbar.** `PerformanceObserver` con `buffered: true` para no perder lo que llegó antes del script, `takeRecords()` antes de enviar un informe, y ningún observador encendido si nadie mira.
- **Accesibles.** Etiquetas, teclado, `role="status"` y registros `aria-live` para los resultados, rejillas ARIA con `aria-rowcount`, «reducir movimiento» respetado y botones que dicen lo que hacen.

## Banco de pruebas

**Objetivo:** comparar variantes de una tarea con un benchmark en el que se pueda confiar. **Técnicas:** cada batería define sus variantes y el banco no sabe nada de ellas; antes de medir comprueba que todas devuelven lo mismo (`JSON.stringify` de cada resultado); despierta la CPU 100 ms; calibra para cada variante un lote que dure 1 ms o más (doblando, como `timeit.autorange` de Python) y mide el tiempo **por llamada** en 9 rondas intercaladas tras 2 de calentamiento; guarda cada resultado en `benchSink` para que nada sea código muerto. Solo nombra una ganadora con un margen de 5 veces o más. La tabla tiene cabeceras de fila y columna y un `<details>` con la misma tabla en Markdown, lista para pegar en una revisión de código. **Fíjate en** la tercera batería: `+=` y `push` + `join` empatan, el mito de la lección «Memoria y recolector de basura» desmontado con un benchmark honesto.

[[exercise:01-banco-de-pruebas.md]]

```text
Listo: elige una batería y pulsa «Ejecutar» (cada una, como mucho unos 300 ms)
// Tras pulsar «Ejecutar» con «Quitar duplicados de 2000 SKU»:
Quitar duplicados de 2000 SKU · ¿mismo resultado en todas las variantes? true
ganadora con margen (≥ 5×): new Set
// Los tiempos cambian en cada ejecución; en el M1 del curso:
filter + indexOf: ≈ 1.10 ms · new Set: ≈ 25 µs
// Tras elegir «Dar formato a 80 fechas» y pulsar «Ejecutar»:
Dar formato a 80 fechas · ¿mismo resultado en todas las variantes? true
ganadora con margen (≥ 5×): un DateTimeFormat
// Los tiempos cambian en cada ejecución; en el M1 del curso:
toLocaleDateString: ≈ 2.50 ms · un DateTimeFormat: ≈ 40 µs
// Tras elegir «Construir un CSV de 5000 filas» y pulsar «Ejecutar»:
Construir un CSV de 5000 filas · ¿mismo resultado en todas las variantes? true
sin ganadora clara: menos de 5× de diferencia
// Los tiempos cambian en cada ejecución; en el M1 del curso:
+= en un bucle: ≈ 600 µs · push + join: ≈ 550 µs
```

## Monitor de rendimiento

**Objetivo:** un panel flotante (HUD) que enseña en vivo lo que el navegador sabe de tu página. **Técnicas:** un solo `PerformanceObserver` para cuatro tipos (`longtask`, `long-animation-frame`, `event` con `durationThreshold: 16` y `layout-shift`), los frames por segundo contados con `requestAnimationFrame`, y el panel repintado dos veces por segundo para no medirse a sí mismo. Nada se observa hasta abrirlo; al cerrarlo (botón o <kbd>Esc</kbd>) se desconecta todo, al ocultar la pestaña se para el bucle y se cierra solo a los dos minutos. Las interacciones guardadas tienen tope (50): un monitor no puede ser una fuga. **Fíjate en** el resumen de cada botón: dice qué cambió (tareas largas, frames largos, interacción lenta, desplazamientos), no cuánto tardó.

[[exercise:02-monitor-de-rendimiento.md]]

```text
Listo: pulsa «Abrir el monitor» y después cada uno de los tres botones, de uno en uno
// Tras pulsar «Abrir el monitor»:
📈 monitor abierto
// Tras pulsar «Tarea de 120 ms»:
Tarea de 120 ms → tareas largas: +1 · frames largos: +1 · interacción de 100 ms o más: true · desplazamientos: +0
// Tras pulsar «Aviso que llega tarde»:
Aviso que llega tarde → tareas largas: +0 · frames largos: +0 · interacción de 100 ms o más: false · desplazamientos: +1
// Tras pulsar «Clic lento (250 ms)»:
Clic lento → tareas largas: +1 · frames largos: +1 · interacción de 100 ms o más: true · desplazamientos: +0
// Tras pulsar Esc:
📉 monitor cerrado
```

## Tabla virtual de 100 000 filas

**Objetivo:** un inventario de 100 000 productos que se ordena, se filtra y se recorre con el teclado sin trabarse. **Técnicas:** los datos van por columnas en typed arrays (1,2 MB, ningún objeto por fila); ordenar y filtrar producen listas de índices en un `Uint32Array` que se reescribe, nunca se recrea, y cada orden se calcula una vez y se guarda; el filtro compara con los 20 nombres distintos, no con las 100 000 filas, y espera a que dejes de escribir (150 ms). Solo existen 16 filas en el DOM, que se reciclan con `translate` al desplazarte, con un render por frame como mucho. La rejilla ARIA declara `aria-rowcount` y cada fila su `aria-rowindex`, y el foco se queda en la rejilla mientras `aria-activedescendant` señala la fila activa. **Fíjate en** el resumen: «filas en el DOM: 16», ordenes por lo que ordenes.

[[exercise:03-tabla-virtual.md]]

```text
100000 filas en 1200000 bytes de typed arrays · filas en el DOM: 16
Listo: ordena por «Precio», filtra «rebozo» y recorre la tabla con el teclado (Tab y luego ↓ o Fin)
// Tras pulsar la cabecera «Precio»:
orden: Precio ↑ · primera fila → 1 · Alebrije · Oaxaca · $199 · 0
// Los tiempos cambian en cada ejecución; en el M1 del curso:
ordenar y redibujar ≈ 35.0 ms
// Tras escribir «rebozo» de corrido en el filtro:
filtro «rebozo» → 5000 productos
// Tras pulsar Tab hasta la tabla y ↓:
fila activa 2 → 8870 · Rebozo de seda · Guerrero · $210 · 189
// Tras pulsar Fin:
fila activa 5000 → 95290 · Rebozo de seda · Coahuila · $4,990 · 209
```

## Galería que carga lo que se ve

**Objetivo:** una galería de museo con 15 obras que pide solo las imágenes que se van a ver. **Técnicas:** `width` y `height` en cada `<img>` (el hueco se reserva antes de descargar: cero desplazamientos), la primera imagen con `fetchpriority="high"` porque es el LCP, las demás con `loading="lazy"`, todas con `decoding="async"` y con `srcset` de 480 y 960 px para pantallas de densidad 1 y 2; cada tarjeta lleva `content-visibility: auto` con `contain-intrinsic-size: auto 260px` (lección «Render y frames»). Un `PerformanceObserver` de `layout-shift` confirma que nada se movió. Las fotos son de dominio público, con su crédito en el pie. **Fíjate en** el contador «imágenes descargadas»: sube a medida que bajas, y depende mucho del tamaño de la ventana. En la tarjeta de la teoría (480 × 330) solo se descargan un par al principio; en una pestaña grande pueden ser las 15 de golpe, porque Chrome pide las imágenes perezosas con margen, antes de que lleguen a la pantalla.

[[exercise:04-galeria-perezosa.md]]

```text
15 obras · con width y height: 15 · loading=lazy: 14 · fetchpriority=high: 1 · decoding=async: 15
Listo: desplázate por la galería y mira cómo sube «imágenes descargadas»
a los 2 s · desplazamientos de layout: 0 · la primera imagen ¿cargada? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
a los 2 s · imágenes descargadas: ≈ 2 de 15 (las que el navegador ve cerca de la pantalla)
```

## Cliente con caché

**Objetivo:** un cliente HTTP para fichas de producto que no repite trabajo. **Técnicas:** la caché guarda la **promesa**, no el dato, así que dos peticiones simultáneas a la misma URL comparten una sola descarga (deduplicación); es una LRU con el orden de un `Map`, tope de 3 entradas y caducidad de 30 s; un error nunca se guarda y una petición que falla no expulsa a las buenas; `now` se puede inyectar para probar la caducidad sin esperar. Cada petición se mide con `performance.mark`/`measure`, que se borran después de leerlas. **Fíjate en** «agrupadas 1»: la segunda petición de `TAL-07` no llegó a la red.

[[exercise:05-cliente-con-cache.md]]

```text
1. TAL-07, TAL-07, REB-01 → peticiones 3 · red 2 · aciertos 0 · agrupadas 1 · expulsadas 0 · errores 0
2. TAL-07, ALE-12, REB-01 → peticiones 6 · red 3 · aciertos 2 · agrupadas 1 · expulsadas 0 · errores 0
3. intento 1 → HTTP 503 (no se guarda)
3. intento 2 → HTTP 503 (no se guarda)
total → peticiones 8 · red 5 · aciertos 2 · agrupadas 1 · expulsadas 0 · errores 2
fichas en caché (de la más antigua a la más reciente): TAL-07, ALE-12, REB-01
// Los tiempos cambian en cada ejecución; en el M1 del curso:
de la red ≈ 210 ms · de la caché ≈ 0.5 ms
Listo: pide fichas con los botones (la caché guarda 3) y vacíala para volver a la red
// Tras pulsar «Molcajete», «Jarrón de Talavera» y otra vez «Molcajete» (en menos de 30 s):
// Los tiempos cambian en cada ejecución; en el M1 del curso:
MOL-03 → peticiones 9 · red 6 · aciertos 2 · agrupadas 1 · expulsadas 1 · errores 2 · ≈ 205.0 ms
TAL-07 → peticiones 10 · red 7 · aciertos 2 · agrupadas 1 · expulsadas 2 · errores 2 · ≈ 205.0 ms
MOL-03 → peticiones 11 · red 7 · aciertos 3 · agrupadas 1 · expulsadas 2 · errores 2 · ≈ 0.1 ms
// Tras pulsar «Vaciar la caché»:
🧹 caché vacía: la próxima ficha irá a la red
```

## Importar un CSV por trozos

**Objetivo:** importar 50 000 movimientos bancarios sin congelar la página. **Técnicas:** generar y leer van en rebanadas de 8 ms medidas por tiempo que ceden el turno hasta el siguiente frame (`requestAnimationFrame` y luego `setTimeout`; con `scheduler.yield()`, la continuación pasaría delante del pintado y la barra no se movería), con barra de progreso y «Cancelar» (un `AbortController` comprobado entre rebanadas); el texto se recorre línea a línea con `indexOf`, sin partir el archivo entero en objetos; las filas van a columnas de typed arrays creadas con el tamaño justo, con el dinero en céntimos enteros (`Int32Array`); las líneas inválidas se cuentan con su número y no detienen nada. La API Long Tasks confirma el resultado, y las marcas `csv:…` se ven en la pista Timings de DevTools. También acepta un CSV tuyo (como mucho 20 MB), que nunca sale del navegador. **Fíjate en** «tareas largas durante la importación: 0»: unas décimas de segundo de trabajo, y ni una tarea de más de 50 ms.

[[exercise:06-importar-csv-por-trozos.md]]

```text
Listo: pulsa «Generar e importar 50 000 movimientos» (y prueba «Cancelar» a mitad)
// Tras pulsar «Generar e importar 50 000 movimientos»:
filas válidas: 49997 · inválidas: 3 (líneas 7, 16674, 33341)
comida -$9,469.46 · transporte -$3,500.00 · vivienda -$30.54 · salud $4,744.32 · ocio $4,494.32 · nómina $244.32
tareas largas durante la importación: 0
// Los tiempos cambian en cada ejecución; en el M1 del curso:
generar o leer ≈ 130 ms · importar ≈ 20 ms (en rebanadas de 8 ms)
// En el M1 todo dura unas décimas de segundo; para llegar a tiempo, ralentiza la CPU en DevTools (Performance › ⚙ › CPU: 6× slowdown), pulsa otra vez y, a mitad, «Cancelar»:
⏹ importación cancelada: no se guardó nada a medias
```

## Ciclo de vida con scopes

**Objetivo:** un panel de tres vistas (pedidos, reparto, chat) que no deja nada vivo al cambiar de vista. **Técnicas:** cada vista recibe un **scope** y registra a través de él sus listeners (con `{ signal }`), intervalos, temporizadores, frames, observadores, peticiones y sub-componentes (el mapa del reparto es un scope hijo); `scope.close()` lo para todo de una vez, cierra primero a los hijos, es idempotente y, en Chrome, el scope sirve también con `using` (`Symbol.dispose`). Un contador de modo desarrollo instrumenta `window`, `document` y `setInterval`, así que ve también lo que no pasa por un scope. La **auditoría** abre y cierra cada vista 5 veces en un contenedor fuera de la página y compara los recursos vivos antes y después: es la prueba que encuentra las fugas antes que tus usuarios. **Fíjate en** el chat antiguo, escrito sin scope: tras visitarlo, la vista «Pedidos» aparece con el doble de listeners, y la auditoría dice exactamente cuántos quedaron vivos.

[[exercise:07-ciclo-de-vida-con-scopes.md]]

```text
🧭 vista «Pedidos» · vivos → listeners 2 · intervalos 1 · observadores 0 · frames 0 · peticiones 1 · scopes 1
🔎 auditoría: abrir y cerrar cada vista 5 veces
🔎 Pedidos → ✅ no queda nada vivo
🔎 Reparto → ✅ no queda nada vivo
🔎 Chat → ✅ no queda nada vivo
Listo: cambia de vista con las pestañas; después marca «Usar el chat antiguo 🐛», pasa a «Pedidos» y pulsa «Auditar»
📦 Pedidos: 4 pedidos cargados de la API de prueba
// Tras pulsar «Reparto» y después «Chat»:
🧭 vista «Reparto» · vivos → listeners 2 · intervalos 0 · observadores 1 · frames 0 · peticiones 0 · scopes 2
🧭 vista «Chat» · vivos → listeners 2 · intervalos 1 · observadores 0 · frames 0 · peticiones 0 · scopes 1
// Tras marcar «Usar el chat antiguo 🐛» (con el chat en pantalla) y pulsar «Pedidos»:
🧭 vista «Chat 🐛» · vivos → listeners 2 · intervalos 1 · observadores 0 · frames 0 · peticiones 0 · scopes 1
🧭 vista «Pedidos» · vivos → listeners 4 · intervalos 2 · observadores 0 · frames 0 · peticiones 1 · scopes 1
📦 Pedidos: 4 pedidos cargados de la API de prueba
// Tras pulsar «Auditar»:
🔎 auditoría: abrir y cerrar cada vista 5 veces
🔎 Pedidos → ✅ no queda nada vivo
🔎 Reparto → ✅ no queda nada vivo
🔎 Chat 🐛 → ❌ quedan vivos: +10 listeners de window y document · +5 intervalos
// Tras pulsar «Limpiar lo que dejó el chat antiguo»:
🧹 quitados 12 listeners y 6 intervalos que nadie iba a parar · vivos → listeners 2 · intervalos 1 · observadores 0 · frames 0 · peticiones 0 · scopes 1
```

Con ↗ y DevTools › More tools › **Performance monitor**, el contador «JS event listeners» sube con cada visita al chat antiguo y no vuelve a bajar. El scope es la misma idea que `contextlib.ExitStack` de Python: un sitio donde apuntar cada limpieza, que se ejecutan todas, en orden inverso, al salir.

## Fuegos artificiales con un anillo de chispas

**Objetivo:** un espectáculo de fuegos artificiales sin un solo objeto nuevo por frame y con la memoria fija. **Técnicas:** las chispas viven en un **anillo** de 2048 casillas (siete typed arrays, 51 200 bytes reservados una vez): cada chispa nueva ocupa la casilla siguiente, y la vuelta al principio es un `& MASK` porque 2048 es potencia de 2; si el anillo está lleno, la nueva pisa a la más vieja, que es la que ya se apagaba. Es la otra cara del pool de «Integración» (que intercambia la muerta con la última y rechaza las nuevas cuando no cabe ninguna): aquí se sacrifican las viejas. Se dibuja por lotes, ordenando las chispas por color y brillo con una ordenación por conteo en un `Uint16Array` reutilizado (15 `fill()` por frame) y con mezcla aditiva. Empieza con un botón, dura 3 s o hasta «Parar», se para al ocultar la pestaña y con «reducir movimiento» enseña una imagen fija. **Fíjate en** la prueba de carga: el mismo espectáculo, simulado sin dibujar con paso fijo y semilla, pide 3200 chispas y nunca hay más de 2048 encendidas.

[[exercise:08-fuegos-con-anillo.md]]

```text
simulación de prueba (3 s a 60 Hz, sin dibujar): 12 cohetes · 3200 chispas en un anillo de 2048 casillas
casillas reutilizadas: 1152 · chispas pisadas aún encendidas: 497 · encendidas a la vez, como mucho: 2048
memoria de las chispas: 51200 bytes, reservada una vez y la misma al final
Listo: pulsa «Lanzar fuegos (3 s)»; «Parar» los detiene antes
// Tras pulsar «Lanzar fuegos (3 s)» y esperar:
▶ ¡empiezan los fuegos!
🎆 fin del espectáculo · cohetes: 12 · chispas: 3200 · encendidas a la vez, como mucho: 2048
// Los tiempos cambian en cada ejecución; en el M1 del curso:
frames: ≈ 180 · chispas pisadas aún encendidas: ≈ 497 · peor frame: ≈ 1.5 ms de trabajo
```

El gran final pisa unas 500 chispas encendidas, pero son las más viejas y casi no brillan: el ojo no lo nota y la memoria no crece. Elegir el tamaño del anillo es una cuenta: chispas por segundo por segundos de vida, con margen para los picos que estés dispuesto a sacrificar.

## Un almacén que pinta una vez por frame

**Objetivo:** la votación en vivo de un concurso de altares de Día de Muertos, con datos que llegan más deprisa que los frames. **Técnicas:** un **store** con un reductor puro: `dispatch` cambia el estado al momento, pero los suscriptores se avisan como mucho una vez por frame, en `requestAnimationFrame`; cada componente se suscribe con un **selector** y solo se repinta si su parte cambió (`Object.is`), lo que funciona porque el reductor crea objetos nuevos solo para lo que cambia y conserva las referencias del resto (el líder, si no cambia, es el mismo número). Los votos llegan de `/api/demo/stream?format=ndjson` (50 líneas, una cada 10 ms), leídos con `for await` y un generador que junta los trozos en líneas; «Desconectar» aborta la petición. Las barras se dibujan con `transform: scaleX()`, que no cambia el layout. **Fíjate en** los contadores: el marcador se pinta en cada frame con votos nuevos, y el letrero «Va ganando» solo cuando cambia el líder.

[[exercise:09-almacen-un-render-por-frame.md]]

```text
12 votos en la misma tarea → dispatches: 12 · renders hasta ahora: marcador 0 · líder 0 · último voto 0 · progreso 0
… en el siguiente frame (1 aviso): marcador 1 · líder 1 · último voto 1 · progreso 1
3 votos más, el líder no cambia → marcador 2 · líder 1 · último voto 2 · progreso 2 · avisos del store: 2
Listo: pulsa «Conectar a la votación» (50 votos en medio segundo)
// Tras pulsar «Conectar a la votación» y esperar un segundo:
📡 votos recibidos: 50 · 🏆 gana Juan Rulfo (2.º B) con 26 puntos
clasificación: Juan Rulfo 26 · La Catrina 23 · Pedro Infante 21 · Chavela Vargas 18 · Frida Kahlo 13
¿el marcador pintó como mucho una vez por frame? true · ¿el líder se pintó menos veces que el marcador? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
renders: ≈ marcador 35 · líder 5 · último voto 35 · progreso 35 · frames: ≈ 35 (para 50 votos)
// Tras pulsar otra vez «Conectar» y, enseguida, «Desconectar»:
⏹ desconectado a mitad · ¿el marcador enseña todos los votos que llegaron? true
```

Es el patrón de las bibliotecas de estado (Redux, Zustand, los *signals*) reducido a lo esencial: un estado, acciones, selectores y un único momento para pintar. Con la pestaña oculta no hay frames: el estado se sigue actualizando y se pinta una sola vez al volver.

## Presupuesto de recursos

**Objetivo:** que la ficha de un producto no engorde sin que nadie se dé cuenta. **Técnicas:** un **presupuesto** por tipo de recurso (cuántos archivos y cuántos KB de imágenes, hojas de estilo, peticiones, scripts y otros); Resource Timing da una entrada por archivo con su `initiatorType` y sus tamaños (`encodedBodySize` es el archivo tal como viaja, `transferSize` lo que pasó de verdad por la red: 0 desde la caché); un `PerformanceObserver` con `buffered: true` llena la tabla, también con lo que se cargó antes del script, y la auditoría lee la foto completa con `getEntriesByType('resource')`. El precio llega de `assets/budget/stock.json` y las reseñas de la API de prueba en `127.0.0.1`, otro origen que hace de servicio externo. **Fíjate en** la fila de las reseñas: «sin datos». De otro origen, el navegador oculta los tamaños y casi todos los tiempos salvo que el servidor envíe la cabecera `Timing-Allow-Origin`; los assets de LearnWeb la envían, la API de prueba no.

[[exercise:10-presupuesto-de-recursos.md]]

```text
Listo: espera a que cargue la ficha y pulsa «Añadir la galería en alta resolución»
📦 al cargar · recursos: 6 · img 3 · link 1 · fetch 2
✅ imágenes: 3 de 6 · 127.0 KB de 400 KB
✅ hojas de estilo: 1 de 2 · 1.0 KB de 30 KB
✅ peticiones fetch: 2 de 5 · 0.1 KB de 50 KB · sin datos de tamaño: 1 (otro origen sin Timing-Allow-Origin)
✅ total: 6 de 15 recursos · 128.0 KB de 600 KB
// Tras pulsar «Añadir la galería en alta resolución (5 imágenes)»:
📦 con la galería · recursos: 11 · img 8 · link 1 · fetch 2
❌ imágenes: 8 de 6 · 770.3 KB de 400 KB
✅ hojas de estilo: 1 de 2 · 1.0 KB de 30 KB
✅ peticiones fetch: 2 de 5 · 0.1 KB de 50 KB · sin datos de tamaño: 1 (otro origen sin Timing-Allow-Origin)
❌ total: 11 de 15 recursos · 771.4 KB de 600 KB
🏋️ las más pesadas: aldrin-apollo11-960.jpg 165.9 KB · hokusai-wave-960.jpg 155.4 KB · earth-apollo17-960.jpg 149.6 KB
```

En una tarjeta de la galería verás otros números: es una copia aislada, de origen `null`, para la que todos los archivos vienen de otro origen (más filas «sin datos de tamaño» y más entradas); ábrelo con ▶ para ver los de este bloque. En un proyecto real, el presupuesto se comprueba también antes de publicar: herramientas como Lighthouse CI fallan la integración continua si una página se pasa. Aquí se comprueba en la propia página, que es lo que ven tus usuarios.

## Informe de Web Vitals al ocultar la página

**Objetivo:** el código de medición de una página real (*RUM*, medición de usuarios reales): recoger LCP, CLS e INP de cada visita y enviarlos a tu servidor sin perder ninguno. **Técnicas:** tres observadores con `buffered: true` desde el principio; el LCP es la última candidata antes de la primera interacción o de ocultarse la página; el CLS agrupa los desplazamientos sin interacción reciente en ventanas de sesión (huecos de menos de 1 s, ventanas de 5 s como mucho) y vale la peor; el INP agrupa las entradas de `event` por `interactionId` y guarda solo las 10 peores. El momento de enviar es `visibilitychange` → `hidden`, el último aviso fiable (en el móvil, una pestaña se cierra desde el selector de apps sin `unload`); antes, `takeRecords()` recoge lo que el observador aún no había entregado. El informe sale con `navigator.sendBeacon` como texto plano (petición simple, sin preflight, y sale aunque la página se cierre) o, si no se puede, con `fetch` y `keepalive: true`, que sí devuelve la respuesta. Solo se envía lo que cambió desde el último informe, y una página restaurada desde la caché de atrás y adelante (bfcache) empieza una visita nueva. **Fíjate en** la consola: tipos y conteos de entradas, nunca valores; los valores cambian en cada visita y la página los enseña.

[[exercise:11-informe-de-web-vitals.md]]

```text
Listo: espera el aviso (1 s), pulsa «Guardar receta» y después «Simular el cierre de la pestaña» (o cambia de pestaña)
🔔 llegó el aviso de la panadería (sin hueco reservado: empuja la receta)
// Tras pulsar «Guardar receta»:
💾 receta guardada (120 ms de trabajo antes de pintar)
// Tras pulsar «Simular el cierre de la pestaña»:
📤 informe 1 · simulación · métricas: LCP, CLS, INP · entradas: largest-contentful-paint 1, layout-shift 1, interacciones lentas 1
📨 sendBeacon → en cola: true (no hay respuesta que leer)
// Tras pulsarlo otra vez:
📭 simulación: nada nuevo desde el informe 1; no se envía
// Tras elegir «fetch con keepalive», pulsar «Guardar receta» y después «Simular el cierre de la pestaña»:
💾 receta guardada (120 ms de trabajo antes de pintar)
📤 informe 2 · simulación · métricas: INP · entradas: interacciones lentas 2
📨 fetch con keepalive → el servidor recibió 1 métrica del informe 2 (estado 200)
// Tras cambiar de pestaña y volver:
📭 pestaña oculta: nada nuevo desde el informe 2; no se envía
```

En producción se envía solo una muestra de las visitas (un 10 %, por ejemplo) con la **atribución** de cada métrica (qué elemento fue el LCP, qué botón provocó el INP), y el servidor calcula el percentil 75. La biblioteca `web-vitals` de Google hace los detalles finos que este ejemplo simplifica.

## Editor con estadísticas en los ratos libres

**Objetivo:** un editor de artículos con estadísticas en vivo que nunca retrasa una tecla. **Técnicas:** el manejador de `input` solo apunta que el texto cambió; el análisis (palabras, palabras distintas, frases, párrafos, tiempo de lectura, frase más larga, palabras más repetidas) corre con `requestIdleCallback` y `{ timeout: 1000 }`, y es **reanudable**: los iteradores de `Intl.Segmenter` (primero frases, luego palabras) se guardan entre un rato libre y el siguiente, y cada rato avanza mientras `timeRemaining()` pase de 1 ms; si llega por `timeout`, hace 5 ms de todos modos. Teclear a mitad descarta el análisis viejo, y el DOM se escribe solo en `requestAnimationFrame`, nunca en el rato libre. La consola da un informe 700 ms después de la última tecla. **Fíjate en** la casilla 🐛: con el capítulo largo (unas 120 000 palabras), calcular en cada tecla convierte casi cada pulsación en una tarea larga, y la API Long Tasks las cuenta. Sin la casilla puede aparecer alguna suelta: pegar o editar un `<textarea>` de casi un megabyte ya le cuesta al navegador por sí mismo.

[[exercise:12-editor-con-estadisticas.md]]

```text
Listo: escribe al final del artículo « Sirve el mole caliente.» y espera; luego pega el capítulo largo y prueba a escribir con y sin 🐛
📊 148 palabras · 95 distintas · 11 frases · 3 párrafos · lectura: 1 min · frase más larga: 28 palabras
🔁 más repetidas: mole 3 · caldo 2 · chocolate 2 · coloradito 2 · lleva 2
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ en ratos libres: análisis ≈ 0.5 ms en ≈ 1 rato(s) libre(s), ≈ 0 por timeout · tareas largas desde el informe anterior: ≈ 0
// Tras escribir « Sirve el mole caliente.» al final del artículo y esperar:
📊 152 palabras · 96 distintas · 12 frases · 3 párrafos · lectura: 1 min · frase más larga: 28 palabras
🔁 más repetidas: mole 4 · caldo 2 · chocolate 2 · coloradito 2 · lleva 2
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ en ratos libres: análisis ≈ 0.5 ms en ≈ 1 rato(s) libre(s), ≈ 0 por timeout · tareas largas desde el informe anterior: ≈ 0
// Tras pulsar «Pegar un capítulo largo»:
📊 120780 palabras · 115 distintas · 7920 frases · 1320 párrafos · lectura: 604 min · frase más larga: 16 palabras
🔁 más repetidas: piedra 1320 · puesto 1320 · tierra 1320 · tuestan 1320 · abuela 660
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ en ratos libres: análisis ≈ 60 ms en ≈ 7 rato(s) libre(s), ≈ 0 por timeout · tareas largas desde el informe anterior: ≈ 1
// Tras marcar «Calcular en cada tecla 🐛» y escribir « Fin.» al final del texto:
📊 120780 palabras · 115 distintas · 7920 frases · 1320 párrafos · lectura: 604 min · frase más larga: 16 palabras
🔁 más repetidas: piedra 1320 · puesto 1320 · tierra 1320 · tuestan 1320 · abuela 660
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 en cada tecla: análisis ≈ 70 ms (la última tecla) · tareas largas desde el informe anterior: ≈ 0
📊 120781 palabras · 116 distintas · 7921 frases · 1320 párrafos · lectura: 604 min · frase más larga: 16 palabras
🔁 más repetidas: piedra 1320 · puesto 1320 · tierra 1320 · tuestan 1320 · abuela 660
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 en cada tecla: análisis ≈ 70 ms (la última tecla) · tareas largas desde el informe anterior: ≈ 3
// Tras desmarcar la casilla y escribir « Buen provecho.» al final:
📊 120781 palabras · 116 distintas · 7921 frases · 1320 párrafos · lectura: 604 min · frase más larga: 16 palabras
🔁 más repetidas: piedra 1320 · puesto 1320 · tierra 1320 · tuestan 1320 · abuela 660
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ en ratos libres: análisis ≈ 60 ms en ≈ 8 rato(s) libre(s), ≈ 0 por timeout · tareas largas desde el informe anterior: ≈ 0
📊 120783 palabras · 118 distintas · 7922 frases · 1320 párrafos · lectura: 604 min · frase más larga: 16 palabras
🔁 más repetidas: piedra 1320 · puesto 1320 · tierra 1320 · tuestan 1320 · abuela 660
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ en ratos libres: análisis ≈ 60 ms en ≈ 8 rato(s) libre(s), ≈ 0 por timeout · tareas largas desde el informe anterior: ≈ 1
```

Marcar o desmarcar la casilla también da un informe, porque el análisis se repite con el otro método. Lo mismo valdría para guardar un borrador, construir un índice de búsqueda o preparar la analítica: lo que puede esperar, en los ratos libres; lo que se ve, en el frame.

## Para profundizar

- [web.dev: presupuestos de rendimiento (en inglés)](https://web.dev/articles/performance-budgets-101)
- [MDN: Resource Timing (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Resource_timing)
- [GoogleChrome/web-vitals: la biblioteca de medición de Core Web Vitals (en inglés)](https://github.com/GoogleChrome/web-vitals)
- [Chrome for Developers: la API Page Lifecycle (en inglés)](https://developer.chrome.com/docs/web-platform/page-lifecycle-api)
- [MDN: requestIdleCallback](https://developer.mozilla.org/es/docs/Web/API/Window/requestIdleCallback)
