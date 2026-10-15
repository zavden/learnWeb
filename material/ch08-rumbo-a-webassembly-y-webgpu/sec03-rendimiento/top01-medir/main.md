# Medir antes de optimizar

## Por qué importa

Este módulo trata de que tus páginas vayan rápidas: que carguen pronto, que respondan al instante y que se muevan sin tirones. Y empieza por una regla que parece obvia y casi nadie cumple: **primero se mide, después se optimiza**. La intuición falla mucho más de lo que crees: el código que «parece lento» suele dar igual, y el que de verdad cuesta se esconde donde nadie mira. Optimizar sin medir es cambiar código legible por código raro sin saber si has ganado algo.

Ya tienes piezas sueltas: `performance.now()` en la lección «Frames de animación y tiempo», las tareas largas en «El event loop», el layout forzado en «Medidas y layout» y el compositor en «Rendimiento de las animaciones» del capítulo de CSS. Este módulo las junta en tres lecciones: **medir** (esta), **memoria y recolector de basura**, y **render y frames**, el presupuesto de cada fotograma.

Una advertencia antes de empezar: el Mac de este curso es rápido. Lo que aquí tarda 5 ms, en un móvil de gama media tarda 30. Por eso, además de medir, verás cómo hacer que DevTools simule una CPU más lenta.

## Un reloj con saltos

`performance.now()` es el cronómetro de la página: milisegundos con decimales desde que empezó a cargarse, sin retroceder nunca. Pero esos decimales engañan. Para que una página no pueda usar el reloj para espiar la memoria o la caché del procesador (los ataques de la familia Spectre miden diferencias de nanosegundos), los navegadores **recortan su resolución**. En Chrome, una página normal ve el reloj avanzar a saltos de **0,1 ms**; una página con **aislamiento cross-origin** (`crossOriginIsolated`, que se consigue con las cabeceras COOP y COEP del servidor, módulo «Workers y concurrencia») lo ve a saltos de 5 µs. La vista previa de LearnWeb no está aislada.

Consecuencia: una operación que tarda 50 nanosegundos medida una sola vez da `0` o `0.1`, según caiga dentro de un salto o cruce uno. Ninguno de los dos números dice nada. La solución es medir un **lote**: repetir la operación las veces necesarias para que el total dure bastante más que un salto (1 ms como mínimo) y dividir.

[[exercise:01-medir-un-lote.md-]]

```text
el reloj avanza a saltos de → 0.1 ms
crossOriginIsolated → false
🐛 20 medidas de una llamada → todas valen 0 o 0.1 ms: true
total del carrito → 1518.44
✅ ¿todas las llamadas dieron lo mismo? → true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
✅ 200000 llamadas en un lote: ≈ 6.5 ms
✅ una llamada: ≈ 33 ns (el lote ÷ 200000)
```

Fíjate en que el lote **usa** cada resultado (`sum += …`). Lo entenderás en el ejemplo 06: un cálculo cuyo resultado nadie lee puede desaparecer.

> **Desde Python:** `time.perf_counter()` es `performance.now()` en segundos y sin recorte (resolución de nanosegundos), porque un programa de Python no comparte proceso con páginas de desconocidos. Aun así, la regla de medir un lote es la misma: es lo que hace `timeit` por dentro.

### Medir dentro de LearnWeb

Medir cambia lo que mides. LearnWeb protege tu navegador de los bucles infinitos insertando una pequeña comprobación en **cada vuelta** de cada bucle; es barata, pero en un bucle de nanosegundos multiplica el tiempo por cuatro o cinco. Por eso los ejemplos que cronometran bucles llevan `loop_protect: false` en su cabecera, y todos sus bucles terminan. Pasa lo mismo con cualquier herramienta: la consola, un *profiler* o las extensiones del navegador añaden su propio coste. Para medir en serio, abre el ejemplo en su pestaña con el botón ↗.

## Marcas y medidas: User Timing

Restar dos `performance.now()` sirve para una prueba rápida. Para medir las fases de tu aplicación, el navegador tiene una API con nombre propio, **User Timing**: `performance.mark(nombre)` pone una **marca** en el reloj de la página, y `performance.measure(nombre, inicio, fin)` crea una **medida** que va de una marca a otra. Las dos son entradas de rendimiento (`PerformanceEntry`) con `name`, `entryType`, `startTime` y `duration`, y aceptan un `detail` con tus propios datos.

```js
performance.mark('catalogo:inicio');
// … trabajo …
performance.mark('catalogo:parseado');
performance.measure('catalogo:parsear', { start: 'catalogo:inicio', end: 'catalogo:parseado', detail: { discos: 2000 } });
performance.getEntriesByName('catalogo:parsear')[0].duration; // ms
```

Además de quedar guardadas (con su nombre y sus datos) para consultarlas u observarlas, **DevTools las dibuja**: en una grabación del panel Performance, cada medida aparece como una barra con su nombre en la pista **Timings**, encima de lo que hizo el hilo principal en ese momento. Ves a la vez «esto es parsear el catálogo» y «esto es lo que costó».

[[exercise:02-marcas-y-medidas.md]]

[[exercise:02-marcas-y-medidas.md-(script.js)]]

```text
marcas → catalogo:inicio, catalogo:parseado, catalogo:pintado
catalogo:parsear → entryType: measure · detail: {"discos":2000}
getEntriesByName('catalogo:parsear') → 1 entrada
¿la marca está en el reloj de la página? timeOrigin + startTime ≈ Date.now() → true
discos con existencias mostrados → 12
marcas del catálogo tras clearMarks → 0
Listo: abre el ejemplo con ↗, graba en DevTools › Performance y pulsa «Importar otra vez»
// Tras pulsar «Importar otra vez»:
importación 2 · discos mostrados → 12 · medidas guardadas → 2
// Los tiempos cambian en cada ejecución; en el M1 del curso:
importación 2 · catalogo:parsear: ≈ 1.6 ms · catalogo:construir-lista: ≈ 0.4 ms
```

Tres detalles. `startTime` cuenta desde `performance.timeOrigin`, el instante (en milisegundos desde 1970) en que empezó a cargarse la página, así que `timeOrigin + startTime` es la hora absoluta de la marca. Las marcas y medidas se acumulan en un búfer: si mides algo que se repite, bórralas tras leerlas con `clearMarks(nombre)` y `clearMeasures(nombre)`. Y la medida «construir-lista» solo cubre crear los nodos: el estilo, el layout y el pintado de esos nodos ocurren **después** de tu script, fuera de la medida (lo verás en «Render y frames»).

En Chrome, si el `detail` de una medida lleva un objeto `devtools` (`{ devtools: { dataType: 'track-entry', track: 'Catálogo' } }`), el panel Performance la dibuja en una pista propia con ese nombre. Es una extensión de Chrome, no del estándar: las demás herramientas ignoran ese campo.

## Observar en lugar de preguntar

`getEntriesByName` y `getEntriesByType` **preguntan** por las entradas que ya existen. Para enterarte de las que van llegando (las medidas de tu código, pero también las del navegador: recursos descargados, tareas largas, clics lentos), lo natural es un **observador**, como los `IntersectionObserver` y `ResizeObserver` del capítulo 6:

```js
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) console.log(entry.entryType, entry.name);
});
observer.observe({ type: 'measure', buffered: true });
```

Dos reglas. El callback **no** se ejecuta en el momento en que se crea la entrada, sino después, en otra tarea, con un lote de entradas acumuladas. Y con `buffered: true` recibe también las que se crearon antes de empezar a observar, así que da igual si tu código de medición se carga tarde.

[[exercise:03-observar-entradas.md-]]

```text
1. medida «panel:cargar-datos» creada; todavía no observa nadie
ventas del día 1 → 88821
¿observa los 8 tipos de esta lección? → true
2. fin del script: «panel:pintar» creada; el observador aún no ha recibido nada
3. el observador recibe 2 entradas → measure «panel:cargar-datos» y measure «panel:pintar»
4. disconnect(): no recibirá más entradas
```

Los tipos de entrada que usará este módulo:

| `entryType` | Quién la crea | Qué cuenta |
|---|---|---|
| `mark`, `measure` | tu código | marcas y medidas de User Timing |
| `resource`, `navigation` | el navegador | cada descarga y la carga de la página, por fases |
| `paint` | el navegador | `first-paint` y `first-contentful-paint` |
| `longtask` | el navegador | tareas de más de 50 ms (lección «Render y frames») |
| `long-animation-frame` | el navegador | fotogramas de más de 50 ms, con los scripts culpables |
| `event` | el navegador | eventos lentos, del input al siguiente pintado (INP) |
| `largest-contentful-paint` | el navegador | el elemento más grande pintado (LCP) |
| `layout-shift` | el navegador | movimientos inesperados del contenido (CLS) |

`PerformanceObserver.supportedEntryTypes` dice cuáles conoce el navegador. Chrome los tiene todos; otros navegadores no tienen algunos (Safari no tiene `longtask` ni `long-animation-frame`), así que pregunta antes de observar.

## Microbenchmarks honestos

Un **microbenchmark** mide una pieza pequeña de código aislada: ¿qué es más rápido, esto o aquello? Es fácil de escribir y facilísimo de hacer mal. Las reglas:

1. **Un lote por medida**, de 1 ms o más (el reloj tiene saltos de 0,1 ms).
2. **Calienta antes de medir**: las primeras ejecuciones son más lentas (ejemplo 05).
3. **Repite muchas veces** y quédate con la **mediana**, no con la media: una sola ejecución que sufre una pausa del recolector de basura o de otra tarea del navegador arrastra la media; la mediana ni se entera. El **mínimo** es el mejor caso, útil para comparar sin ruido.
4. **Da la dispersión** (el mínimo y el máximo): si el máximo es diez veces la mediana, algo interfiere.
5. **Usa el resultado** (ejemplo 06) y **mide con datos realistas** (ejemplo 07).
6. **Cuenta con el procesador**: tras un rato sin trabajo baja su frecuencia (o el sistema pasa la hebra a un núcleo de eficiencia) y tarda decenas de milisegundos en volver a toda velocidad. Despiértalo antes de medir y, si comparas variantes, **intercala** sus medidas para que les afecte a todas por igual (ejemplos 05 y 08).

Este ayudante se encarga de las reglas 2, 3 y 4 y de la mitad de la 5 (guarda cada resultado en `benchSink`); el lote y los datos realistas los pones tú. Los ejemplos siguientes lo copian tal cual:

[[exercise:04-bench-mediana-y-minimo.md-(script.js)]]

```text
media 3.9 · mediana 2.1 · mínimo 2.0 · máximo 14.8 (ms)
¿alguna ejecución tardó lo que dice la media? → false
Listo: pulsa «Medir» (unos 110 ms de trabajo)
// Tras pulsar «Medir»:
¿mismo texto? true · primer precio → $99.00
¿reutilizar el formateador es ≥ 5 veces más rápido? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
nuevo en cada precio: mediana ≈ 7.4 ms (mín 4.0 · máx 9.5) → ≈ 74 µs por precio
uno reutilizado: mediana ≈ 2.6 ms (mín 1.6 · máx 3.4) → ≈ 1.30 µs por precio
```

El resultado es útil por sí mismo: crear un `Intl.NumberFormat` cuesta decenas de microsegundos, y `price.toLocaleString('es-MX', opciones)` crea uno por dentro en cada llamada. En una tabla de 5000 filas que se redibuja, reutilizar el formateador es la diferencia entre más de un tercio de segundo y unos pocos milisegundos.

[[exercise:04-bench-mediana-y-minimo.md]]

> **Desde Python:** `bench` es `timeit.repeat(stmt, number=…, repeat=…)`: `number` es el lote, `repeat` las medidas, y la documentación de Python recomienda quedarse con el `min()`, el valor menos afectado por el resto del sistema.

### 🐛 El calentamiento del JIT

V8, el motor de JavaScript de Chrome, no compila tu función entera a código máquina optimizado al cargarla: sería lento y la mayoría del código se ejecuta pocas veces. La primera vez la **interpreta**; mientras se ejecuta, cuenta cuántas veces pasa por cada sitio y qué tipos ve, y cuando una función está «caliente» la recompila con compiladores cada vez más agresivos (Sparkplug, Maglev y TurboFan), incluso a mitad de un bucle largo. Eso es un compilador **JIT** (*just in time*). Las primeras ejecuciones pagan la interpretación y la compilación; las siguientes van mucho más rápido.

[[exercise:05-calentamiento-del-jit.md]]

```text
Listo: pulsa «Medir 12 tandas»; después, pulsa otra vez (y prueba a desmarcar «Despertar antes la CPU»)
// Tras pulsar «Medir 12 tandas»:
clic 1 · la ruta mide → 9828.6 km
clic 1 · ¿la primera tanda fue la más lenta? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
clic 1 · primera tanda ≈ 3.5 ms · mediana ≈ 0.6 ms
// Tras pulsar otra vez:
clic 2 · la ruta mide → 9828.6 km
// Los tiempos cambian en cada ejecución; en el M1 del curso:
clic 2 · primera tanda ≈ 0.6 ms · mediana ≈ 0.6 ms
// Tras desmarcar «Despertar antes la CPU», esperar unos segundos y pulsar otra vez:
clic 3 · la ruta mide → 9828.6 km
// Los tiempos cambian en cada ejecución; en el M1 del curso:
clic 3 (sin despertar la CPU) · primera tanda ≈ 2.0 ms · mediana ≈ 1.8 ms
```

Si hubieras medido una sola vez, sin calentar, habrías creído que la función es varias veces más lenta de lo que es. Al pulsar otra vez, la primera tanda ya no destaca: el calentamiento se paga una vez por función. Para tus usuarios, ese primer momento también existe (es la primera vez que usan una pantalla), y por eso hay quien mide aparte «en frío» y «en caliente».

El ejemplo esconde un segundo calentamiento, y no es del JIT. Antes de medir, `wakeCpu(150)` hace 150 ms de cálculo sin relación con la ruta. Desmarca la casilla, espera unos segundos y pulsa: todas las tandas salen más lentas que en la primera pulsación. El procesador, tras un rato sin trabajo, baja su frecuencia (o macOS pasa la hebra a un núcleo de eficiencia), y unos pocos milisegundos de medida no le dan tiempo a acelerar. En la primera pulsación lo despertaba la propia tanda lenta. Es la regla 6: despierta la CPU y, al comparar, intercala.

### 🐛 El código que nadie usa desaparece

El compilador optimizador también **borra trabajo inútil**. Si una función calcula algo y nadie lee el resultado, y ese cálculo no tiene efectos (no escribe en ningún sitio, no llama a nada que pueda tenerlos), TurboFan puede eliminarlo. En un benchmark, eso es una trampa: la versión «que no usa el resultado» sale decenas de veces más rápida, porque no hace nada.

[[exercise:06-codigo-muerto.md]]

```text
Listo: pulsa «Medir»
// Tras pulsar «Medir»:
✅ distancia total → 1038009.1 km
¿la versión 🐛 es ≥ 5 veces más rápida, con «el mismo» trabajo? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 resultado sin usar: mediana ≈ 0.30 ms
✅ resultado sumado: mediana ≈ 18.00 ms
```

Que ocurra o no depende del motor, de su versión y de lo que haga la función: con otro cálculo, la diferencia puede ser nula. La regla práctica no depende de eso: **consume siempre el resultado** (súmalo, devuélvelo, guárdalo como hace `benchSink`) y desconfía de cualquier variante que salga sospechosamente rápida.

### 🐛 Caché caliente, caché fría

Muchas cosas aceleran la segunda vez: una memoización con un `Map`, la caché HTTP del navegador (la segunda descarga de un archivo no va a la red), la caché de la CPU (los datos recién leídos están a mano) y el propio JIT. Un benchmark que repite **exactamente la misma entrada** mide esas cachés, no tu código. Tus usuarios piden cosas distintas.

[[exercise:07-cache-caliente.md]]

```text
Listo: 352 códigos postales distintos en los 2000 pedidos de muestra; pulsa «Medir»
// Tras pulsar «Medir»:
🐛 2000 cotizaciones del mismo código postal → cálculos: 1 · aciertos de caché: 1999
✅ 2000 pedidos de muestra → cálculos: 352 · aciertos de caché: 1648
¿la medida 🐛 sale ≥ 5 veces más rápida? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 el mismo código postal: mediana ≈ 0.10 ms
✅ pedidos de muestra: mediana ≈ 4.00 ms
```

Para la carga de una página pasa lo mismo: recargar con la caché llena no es lo que ve quien llega por primera vez. En DevTools, la casilla **Disable cache** del panel Network desactiva la caché HTTP mientras DevTools está abierto, y un clic largo en el botón de recargar ofrece **Empty Cache and Hard Reload**.

## Formas de objeto y cachés en línea

En la lección «Herencia prototípica» se adelantó que cada objeto tiene una «forma» interna y que el código memoriza dónde encontró cada propiedad. Aquí está el mecanismo. Para leer `item.price` deprisa, V8 no busca `"price"` en un diccionario cada vez. Agrupa los objetos por **forma** (en V8, *hidden class* o «mapa»): dos objetos con las mismas propiedades, añadidas en el mismo orden, comparten forma, y la forma dice en qué posición está cada propiedad. Cada sitio del código que lee una propiedad guarda una **caché en línea** (*inline cache*) con las formas que ha visto: «si el objeto tiene la forma A, `price` está en la posición 1».

- **Monomórfico**: el sitio solo ha visto una forma. Lo más rápido: una comprobación y una lectura.
- **Polimórfico**: hasta 4 formas. Unas pocas comprobaciones más.
- **Megamórfico**: más de 4. La caché se rinde y cada lectura consulta una tabla global: más lento, a menudo el doble o más.

[[exercise:08-formas-de-los-objetos.md]]

```text
formas distintas (nuestro recuento) → 1 · 8
¿el mismo total en las dos listas? → true ($137974)
Listo: pulsa «Medir»
// Tras pulsar «Medir»:
// Los tiempos cambian en cada ejecución; en el M1 del curso:
1 forma: mediana ≈ 0.6 ms · 8 formas: mediana ≈ 2.0 ms
```

El ejemplo tiene dos copias idénticas de la función porque cada copia tiene sus propias cachés: con una sola, la lista de 8 formas habría estropeado la medida de la otra. Y mide en **rondas intercaladas** (una medida de cada variante por ronda), porque es un efecto pequeño: si midiera primero una variante y luego la otra, la que fuera primero cargaría con el procesador aún «dormido». Aun así, la diferencia cambia de una ejecución a otra y entre motores. La lección práctica es modesta: crea los objetos de un mismo tipo **siempre igual** (una clase o una función fábrica que da valor a todos los campos, con `null` en los que no apliquen) y no añadas ni borres propiedades después (`delete` también cambia la forma). Solo importa en funciones muy calientes; no reescribas código legible por esto sin medir.

> **Desde Python:** CPython 3.11 hizo algo parecido con su intérprete especializado (PEP 659): cada instrucción que lee un atributo recuerda el tipo que vio y se especializa para él. Y `__slots__` fija los atributos de una clase, como una forma que no cambia.

## Antes que trucos, el algoritmo

Todo lo anterior son factores: 2 veces, 5 veces. Un cambio de algoritmo cambia **cómo crece** el coste con los datos. `array.includes(x)` recorre el array: llamarlo dentro de un `filter` sobre otro array son n × m comparaciones, O(n·m). Con 1000 pedidos y 1000 correos bloqueados, casi un millón; con el doble de datos, cuatro veces más. Un `Set` responde a `has(x)` en tiempo constante (una tabla hash, como los `set` de Python): n + m operaciones.

[[exercise:09-algoritmo-antes-que-trucos.md]]

```text
Listo: 1000 pedidos y 1000 correos bloqueados; pulsa «Medir»
// Tras pulsar «Medir»:
pedidos retenidos → 89 · ¿los mismos con los tres métodos? true
🐛 comparaciones de texto con la lista → 955,089
✅ con el Set → 1000 inserciones + 1000 búsquedas
¿el Set es ≥ 5 veces más rápido que includes? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 includes dentro de filter: mediana ≈ 30.0 ms
🐛 for a mano: mediana ≈ 28.0 ms
✅ Set: mediana ≈ 0.1 ms
```

El bucle escrito a mano, con su `===` y su longitud guardada en una variable, tarda prácticamente lo mismo que `includes` en Chrome (en otros motores gana un poco): sigue haciendo casi un millón de comparaciones, y con diez veces más datos haría cien millones. Antes de afinar un bucle, pregúntate cuántas veces se ejecuta su cuerpo, y si un `Map`, un `Set`, un índice o un orden previo pueden hacer que se ejecute menos.

## Métricas de usuarios reales: Core Web Vitals

Los microbenchmarks miden tu código. Lo que vive el usuario se mide de otra forma: en su dispositivo, con su red, mientras usa la página. Google resume esa experiencia en tres métricas, las **Core Web Vitals**, que se calculan con las entradas del navegador:

| Métrica | Qué mide | Bueno |
|---|---|---|
| **LCP** (*Largest Contentful Paint*) | cuándo se pintó el elemento más grande del primer vistazo (una imagen, un bloque de texto) | ≤ 2,5 s |
| **INP** (*Interaction to Next Paint*) | cuánto tarda la página en pintar la respuesta a un clic, un toque o una tecla; se queda con una de las peores de la visita | ≤ 200 ms |
| **CLS** (*Cumulative Layout Shift*) | cuánto se mueve el contenido sin que el usuario lo provoque (anuncios, imágenes sin tamaño, avisos que llegan tarde) | ≤ 0,1 |

Cada una se evalúa en el percentil 75 de las visitas reales: es «buena» si tres de cada cuatro usuarios la viven así. Este ejemplo las observa con tres `PerformanceObserver`. La vista previa es un iframe, así que todo lo que mide es del documento del ejemplo, no de LearnWeb, y como los valores cambian en cada carga, imprime hechos y no números:

[[exercise:10-web-vitals-en-el-iframe.md]]

[[exercise:10-web-vitals-en-el-iframe.md-(script.js)]]

```text
Listo: espera un segundo (llega un aviso) y pulsa «Añadir al carrito»
largest-contentful-paint · elemento: <h1>
layout-shift 1 · ¿justo tras un clic o una tecla? false · ¿movió algo? true
// Tras pulsar «Añadir al carrito»:
event · click · ¿tardó ≥ 100 ms en pintarse? true · ¿es una interacción? true
```

Fíjate en `hadRecentInput`: un movimiento que ocurre justo después de un clic o una tecla (500 ms) no cuenta para el CLS, porque el usuario lo espera (abrió un menú). El aviso que llega solo, sí. En una página real, el código de medición envía estas entradas a tu servidor (con `navigator.sendBeacon`, que funciona aunque la página se esté cerrando) y allí calculas los percentiles; la biblioteca `web-vitals` de Google hace los cálculos finos (ventanas de sesión del CLS, qué interacción cuenta para el INP). La lección «Render y frames» explica cómo arreglar un INP malo.

## El panel Performance en cuatro pasos

Las medidas desde el código dicen **cuánto**; el panel **Performance** de DevTools dice **por qué**. Abre el ejemplo con ↗ (la grabación no se mezcla con LearnWeb) y DevTools con <kbd>⌥</kbd><kbd>⌘</kbd><kbd>I</kbd>:

1. **Prepara**: en la pestaña **Performance**, el engranaje ⚙ ofrece **CPU throttling** (4× o 6× más lenta, como un móvil) y limitar la red. Chrome muestra además, antes de grabar, las métricas en vivo de la página (LCP, CLS e INP) mientras la usas.
2. **Graba**: ⏺ (o <kbd>⌘</kbd><kbd>E</kbd>), haz lo que quieras medir (pulsa el botón lento), y detén la grabación.
3. **Lee las pistas**: **Main** es lo que hizo el hilo principal, como un diagrama de llamas: cada barra es una función, debajo las que llamó. Las tareas de más de 50 ms llevan un triángulo rojo. **Timings** tiene tus marcas y medidas; **Interactions**, los clics y teclas con su duración; **Layout shifts**, los movimientos.
4. **Busca el culpable**: abajo, **Bottom-up** ordena las funciones por el tiempo que pasaron trabajando ellas mismas (*self time*) y **Call tree**, por el tiempo total con sus llamadas. Empieza por arriba de Bottom-up.

> **Desde Python:** el panel Performance es `cProfile` con gráficos: `tottime` es el *self time* de Bottom-up y `cumtime` el tiempo total de Call tree. La diferencia es que DevTools **muestrea** (mira la pila cada poco) en lugar de contar cada llamada, así que cuesta menos y las funciones muy cortas pueden no aparecer.

## Bestiario

- **«Esta función tarda 0 ms» (o 0,1).**
  Síntoma: una medida de algo rápido da `0` o `0.1`, y cambia entre ejecuciones sin motivo.
  Causa: el reloj avanza a saltos de 0,1 ms en una página sin aislamiento cross-origin; la operación cabe dentro de un salto.
  Solución: mide un lote que dure 1 ms o más y divide entre el número de repeticiones.
  → [ver ejemplo](01-medir-un-lote.md)
- **La primera medida es mucho peor que las demás.**
  Síntoma: la primera vez una función tarda varias veces más; si solo mides una vez, sacas conclusiones equivocadas.
  Causa: el JIT empieza interpretando y optimiza la función mientras se usa.
  Solución: calienta antes de medir (unas ejecuciones sin cronometrar) y repite muchas veces; si te importa el arranque, mídelo aparte.
  → [ver ejemplo](05-calentamiento-del-jit.md)
- **La versión «optimizada» es increíblemente rápida.**
  Síntoma: una variante sale decenas de veces más rápida haciendo, en teoría, el mismo trabajo.
  Causa: su resultado no se usa, y el compilador optimizador eliminó el cálculo (código muerto).
  Solución: consume el resultado (súmalo, devuélvelo, guárdalo) y comprueba que todas las variantes dan lo mismo.
  → [ver ejemplo](06-codigo-muerto.md)
- **En el benchmark vuela; con usuarios reales, no.**
  Síntoma: una función medida con la misma entrada una y otra vez parece instantánea.
  Causa: la entrada repetida solo mide la caché (la tuya, la del navegador o la de la CPU).
  Solución: mide con datos variados y realistas y con la caché vacía al empezar; para cargas, **Disable cache** en DevTools.
  → [ver ejemplo](07-cache-caliente.md)

## Resumen

- Primero se mide, después se optimiza; y se mide en condiciones parecidas a las del usuario (CPU ralentizada en DevTools, caché vacía).
- `performance.now()` avanza a saltos de 0,1 ms sin aislamiento cross-origin: mide lotes de 1 ms o más y divide.
- `performance.mark/measure` (con `detail`) nombran las fases de tu código y aparecen en la pista Timings de DevTools; bórralas con `clearMarks`/`clearMeasures`.
- `PerformanceObserver` con `{ type, buffered: true }` recibe las entradas por lotes, en una tarea posterior, también las anteriores.
- Un microbenchmark honesto calienta, repite, usa la mediana (y el mínimo y el máximo), consume el resultado y usa datos realistas.
- Objetos de un mismo tipo, siempre con los mismos campos en el mismo orden: más de 4 formas en un mismo sitio lo vuelven megamórfico.
- Un algoritmo mejor (un `Set` en lugar de `includes` en un bucle) gana a cualquier micro-optimización.
- Core Web Vitals: LCP ≤ 2,5 s, INP ≤ 200 ms y CLS ≤ 0,1, en el percentil 75 de los usuarios reales.

## Para profundizar

- [MDN: User Timing API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/User_timing)
- [MDN: PerformanceObserver](https://developer.mozilla.org/es/docs/Web/API/PerformanceObserver)
- [web.dev: Web Vitals (en inglés)](https://web.dev/articles/vitals)
- [Chrome for Developers: referencia del panel Performance (en inglés)](https://developer.chrome.com/docs/devtools/performance/reference)
- [Mathias Bynens: formas e inline caches en los motores de JavaScript (en inglés)](https://mathiasbynens.be/notes/shapes-ics)
