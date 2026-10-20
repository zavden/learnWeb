# Memoria y recolector de basura

## Por qué importa

En JavaScript nunca liberas memoria a mano: creas objetos y, cuando ya nadie los usa, el **recolector de basura** (*garbage collector*, GC) los libera por ti. Eso es automático, pero no gratis, y falla de dos maneras que se notan:

- **Pausas.** El recolector trabaja en el mismo proceso que tu página. Si tu código crea objetos sin parar (cientos de miles por segundo en una animación), el recolector también trabaja sin parar, y alguna de sus pausas cae en mitad de un fotograma: un tirón.
- **Fugas.** Si algo que vive mucho (`window`, un `Map` global, la lista de temporizadores) sigue apuntando a lo que ya no sirve (un panel cerrado, un informe de 5 MB), el recolector no puede liberarlo. La memoria crece cada vez que alguien usa la página, y una aplicación que pasa horas abierta (un correo, un panel de control) se vuelve lenta hasta que la pestaña muere.

Esta lección explica cómo decide el recolector qué es basura, qué cuesta asignar memoria en un bucle caliente, y las cinco fugas más comunes del navegador con su remedio. En la lección «El bucle de animación» del capítulo 6 viste un *pool* de partículas para no dar trabajo al recolector; aquí verás por qué funciona y cómo hacer uno general.

## Basura es lo que no se alcanza

El recolector no sabe qué objetos «vas a usar»: sabe cuáles **puedes alcanzar**. Parte de unas **raíces** que siempre están vivas, sigue cada referencia y marca todo lo que encuentra. Lo que queda sin marcar es basura, aunque esos objetos se apunten entre sí:

```text
RAÍCES                          ALCANZABLE                      BASURA
window ──────────────▶ app ──▶ cart ──▶ line1 ──▶ coffee        oldCart ──▶ line3 ──▶ bread
pila de llamadas                  └──▶ user                      menuPopup ⇄ menuItems (un ciclo)
listeners registrados ──▶ onResize ──▶ salesReport
temporizadores pendientes
```

Las raíces de una página son el objeto global (y todo lo que cuelga de él, también el árbol del DOM desde `document`), las variables locales de las funciones que se están ejecutando, y todo lo que el navegador tiene apuntado para llamarte más tarde: listeners registrados, temporizadores, callbacks de promesas, observadores. Fíjate en esa última raíz: **un listener mantiene vivo su closure, y el closure, todo lo que capturó**. Es el origen de casi todas las fugas.

[[exercise:01-alcanzable-o-basura.md-]]

```text
vivos → app, cart, coffee, line1, line2, listeners, mole, onResize, salesReport, user, window
basura → oldCart, line3, bread, menuPopup, menuItems
referencias a menuPopup → 1 · a menuItems → 1
¿el ciclo es basura para un recolector que marca desde las raíces? → true
tras enviar el pedido, basura → cart, line1, line2, coffee, mole, oldCart, line3, bread, menuPopup, menuItems
tras quitar el listener, ¿salesReport es basura? → true
```

> **Desde Python:** CPython libera la mayoría de los objetos por **conteo de referencias**: cada objeto sabe cuántas referencias tiene y se libera en cuanto llega a 0 (`sys.getrefcount` lo muestra). Los ciclos nunca llegan a 0, así que CPython tiene además un recolector de ciclos, el módulo `gc`, que marca desde fuera como V8. V8 no cuenta referencias: solo marca. Por eso en JavaScript un objeto no se libera «en cuanto deja de usarse», sino cuando pasa el recolector.

## Generaciones: casi todo muere joven

Marcar todo el montón (*heap*) cada vez sería lento. Los recolectores modernos aprovechan una observación: **la mayoría de los objetos muere muy joven** (el objeto temporal de un cálculo, el array de un `map` intermedio, el string de un mensaje). V8 divide el montón en dos generaciones:

```text
nuevo objeto ──▶ [ GENERACIÓN JOVEN · unos MB ] ──sobrevive a 2 limpiezas──▶ [ GENERACIÓN VIEJA · el resto ]
                 minor GC (scavenge): frecuente;                              major GC (mark-compact): raro;
                 copia solo los vivos, así que cuesta                         recorre todo el montón; casi todo
                 según lo que sobrevive (poco): ~1 ms                         en paralelo y por trozos, con pausas
```

Crear un objeto es baratísimo: el motor solo avanza un puntero en la generación joven. Cuando esa zona se llena, un **minor GC** copia los pocos supervivientes y da el resto por libre de golpe. Los que sobreviven dos veces pasan a la generación vieja, que se limpia con un **major GC**, mucho más caro. V8 hace casi todo ese trabajo en otros hilos mientras tu código sigue, pero siempre hay pausas cortas en el hilo principal. La regla práctica: **crear objetos de vida corta es barato; crearlos a cientos de miles por segundo, no**, y los que viven un rato (lo justo para sobrevivir) son los más caros.

> **Desde Python:** el recolector de ciclos de CPython también es generacional (generaciones 0, 1 y 2; `gc.get_threshold()` dice cada cuántas asignaciones pasa por cada una). La idea es la misma: revisar a menudo lo nuevo y pocas veces lo viejo.

## 🐛 Asignar en el bucle caliente

Un **bucle caliente** es el código que se ejecuta muchísimas veces: el cuerpo de un bucle de animación, el manejador de `pointermove`, el procesado de cada píxel. Un estilo de programación limpio en otras partes (vectores inmutables, `map` y `filter` encadenados, `{...objeto, x}` para «actualizar») crea objetos nuevos en cada vuelta. Con 2000 gotas de lluvia y vectores `{x, y}` inmutables, son 8000 objetos por frame: casi medio millón por segundo.

[[exercise:02-objetos-en-cada-frame.md]]

```text
🐛 objetos {x, y} pedidos en un frame → 8000 (480000 por segundo a 60 Hz)
✅ objetos pedidos en un frame → 0 (2 Float32Array de 16000 bytes, creados al empezar)
Listo: pulsa «Simular»
// Tras pulsar «Simular»:
¿las mismas posiciones tras 30 frames (±0.01 px)? true
¿el Float32Array es ≥ 3 veces más rápido por frame? true
// Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 objetos {x, y}: ≈ 55 µs por frame · ✅ Float32Array: ≈ 7.5 µs por frame
```

La versión ✅ guarda todas las posiciones en un `Float32Array` (x0, y0, x1, y1…) creado una sola vez y lo reescribe en cada frame. Gana dos veces: no asigna nada, y los datos están seguidos en memoria (lección «ArrayBuffer y vistas»), así que la CPU los lee de corrido. Es además el formato que espera la GPU: en el módulo «Gráficos en la GPU» enviarás un array así con una sola llamada. Las reglas para un bucle caliente:

- Reutiliza: un array o un typed array creados fuera del bucle, que se vacían (`length = 0`) o se reescriben.
- Modifica en el sitio (`p.x += vx * dt`) en lugar de crear un objeto nuevo por paso.
- Evita en el bucle lo que crea objetos sin que se vea: `map`/`filter`/`slice` intermedios, `[...array]`, `{...objeto}`, funciones flecha nuevas, plantillas de texto que nadie lee.
- Fuera del bucle caliente, escribe el código más claro. V8 incluso se ahorra algunos objetos que no salen de la función (*análisis de escape*); los que se guardan en otro objeto, no.

## Pools de objetos

Cuando no puedes evitar los objetos (cada partícula, proyectil o mensaje tiene varios campos y una vida), puedes **reciclarlos**: un *pool* guarda los objetos libres y los presta. El del confeti del capítulo 6 buscaba uno libre recorriendo el array; este es general, con una pila de libres (sacar y devolver cuestan lo mismo con 10 o con 10 000), un tope para no guardar de más y una defensa contra devolver dos veces el mismo objeto:

[[exercise:03-pool-generico.md-]]

```text
tormenta 1 → objetos creados en total: 300 · libres: 300 · en uso: 0
tormenta 2 → objetos creados en total: 300 · libres: 300 · en uso: 0
tormenta 3 → objetos creados en total: 300 · libres: 300 · en uso: 0
sin pool → 900 objetos · con pool → 300
release doble → este objeto no estaba en uso (¿release doble?)
```

Un pool no es gratis: los objetos reciclados viven mucho, así que acaban en la generación vieja, y el código se complica. Úsalo cuando midas que el recolector molesta (en DevTools › Performance, las barras «Minor GC» frecuentes durante la animación), no por costumbre. Y tiene su propio error clásico: un objeto prestado conserva todo lo que le escribió su usuario anterior.

[[exercise:04-pool-sin-limpiar.md-]]

```text
🐛 comanda 1 → mesa 3 · tacos al pastor, agua de jamaica · alergia: cacahuate · notas: sin cebolla
🐛 comanda 2 → mesa 7 · tacos al pastor, agua de jamaica, pozole · alergia: cacahuate · notas: sin cebolla
🐛 ¿es el mismo objeto que la comanda de la mesa 3? → true
✅ comanda 2 → mesa 7 · pozole · alergia: ninguna · notas: —
✅ ¿mismo objeto y mismo array de platos, reutilizados? → true
✅ ¿una comanda usada y limpiada es igual a una nueva? → true
```

La limpieza va en el pool (en `release`, o en `acquire` si prefieres limpiar al prestar), nunca en cada sitio que usa el objeto: así no se olvida. Vacía los arrays con `length = 0`, que conserva el mismo array; `= []` crearía otro, justo lo que el pool quería evitar.

## Texto: `+=` no es el problema

Un consejo que circula desde los tiempos de Java dice que concatenar texto con `+=` en un bucle es lento y que hay que meter los trozos en un array y unirlos con `join`. En V8 no es así: `a + b` crea un **rope** (una «cuerda»: un objeto pequeño que recuerda «a seguido de b» sin copiar nada) y solo lo aplana en un string seguido cuando alguien lo lee carácter a carácter. Construir un CSV de 20 000 filas con `+=` o con `push` + `join` cuesta lo mismo en orden de magnitud: unos milisegundos.

```js
let csv = 'id,ciudad,total\n';
for (const row of rows) csv += `${row.id},${row.city},${row.total.toFixed(2)}\n`; // ✅ legible y rápido en V8
```

Escribe la versión más clara. Si un perfil de DevTools señala la concatenación (es raro), entonces mide la alternativa. Este es el tipo de mito que la lección anterior te enseñó a desmontar: con un benchmark honesto.

> **Desde Python:** ahí sí se recomienda `''.join(trozos)`: los `str` de Python no son ropes, y `+=` puede copiar el texto entero en cada vuelta (CPython lo evita a veces, solo cuando nadie más apunta al string).

## Fugas de memoria

Una **fuga** es memoria que sigue siendo alcanzable pero que tu programa ya no usará nunca. El recolector no puede saber que «ya no la usarás»: solo ve que alguien la apunta. Casi todas las fugas del navegador tienen la misma forma: **algo que vive mucho apunta a algo que debería vivir poco**. Lo de larga vida suele ser `window`, `document`, un `Map` o array de nivel de módulo, la lista de temporizadores o un servicio global; lo de vida corta, un panel cerrado, un elemento quitado, los datos de una pantalla que ya no se ve.

### Cómo encontrarlas con DevTools

Abre el ejemplo con ↗ y DevTools:

1. **More tools › Performance monitor**: gráficas en vivo de *JS heap size*, *DOM Nodes* y *JS event listeners*. Repite la acción sospechosa (abrir y cerrar un panel) diez veces: si la gráfica sube en escalera y nunca baja, hay fuga. Si sube y baja en dientes de sierra, es el recolector haciendo su trabajo.
2. **Memory › Heap snapshot**: una foto de todos los objetos vivos (antes de tomarla, DevTools fuerza una recolección). Haz una foto, repite la acción, haz otra y elige la vista **Comparison**: verás qué se creó y no se liberó. Filtra por el nombre del constructor (`Float64Array`, `Detached`, el nombre de tu clase).
3. Selecciona un objeto y mira **Retainers**: la cadena de referencias que lo mantiene vivo, desde él hasta una raíz. Ahí aparece el culpable: un listener, un `Map`, un `system / Context` (las variables de un closure).

Desde el código hay poco: Chrome tiene `performance.memory` (no estándar y obsoleto), con valores redondeados a propósito que se actualizan de tarde en tarde; no sirve para medir lo que cuesta un clic. Su sustituto estándar, `performance.measureUserAgentSpecificMemory()`, solo existe en páginas con aislamiento cross-origin (aquí, `undefined`).

> **Desde Python:** `tracemalloc.take_snapshot()` y `snapshot.compare_to(anterior, 'lineno')` son la vista Comparison, y `gc.get_referrers(objeto)` es una versión rudimentaria de Retainers.

### 🐛 Un closure que retiene demasiado

En la lección «Closures» viste un detalle de V8: todas las funciones creadas en una misma llamada comparten **un único** objeto con las variables capturadas (el *contexto*). Si una de ellas usa un array enorme, el array entra en ese contexto, y cualquier otra función de la misma llamada lo mantiene vivo, aunque no lo use. Combinado con un listener de `window` que nadie quita, cerrar la tarjeta de un informe no libera nada:

[[exercise:05-closure-que-retiene.md]]

```text
Listo: abre dos informes 🐛 y ciérralos; después, dos ✅ y ciérralos
// Tras abrir dos informes 🐛 y cerrar los dos:
🐛 informe 1 abierto · tarjetas abiertas: 1 · listeners de resize vivos: 1 · ventas en memoria: 5 MB
🐛 informe 2 abierto · tarjetas abiertas: 2 · listeners de resize vivos: 2 · ventas en memoria: 10 MB
🐛 informe 1 cerrado · tarjetas abiertas: 1 · listeners de resize vivos: 2 · ventas en memoria: 10 MB
🐛 informe 2 cerrado · tarjetas abiertas: 0 · listeners de resize vivos: 2 · ventas en memoria: 10 MB
// Tras abrir dos informes ✅ y cerrar los dos:
✅ informe 3 abierto · tarjetas abiertas: 1 · listeners de resize vivos: 1 · ventas en memoria: 0 MB
✅ informe 4 abierto · tarjetas abiertas: 2 · listeners de resize vivos: 2 · ventas en memoria: 0 MB
✅ informe 3 cerrado · tarjetas abiertas: 1 · listeners de resize vivos: 1 · ventas en memoria: 0 MB
✅ informe 4 cerrado · tarjetas abiertas: 0 · listeners de resize vivos: 0 · ventas en memoria: 0 MB
```

Los contadores son el registro del propio ejemplo; la prueba de verdad está en DevTools. Tras cerrar los dos informes 🐛, un *heap snapshot* filtrado por `Float64Array` muestra dos arrays de 5 MB, y sus *Retainers* llevan a un contexto y de ahí al listener de `resize`. Con los ✅, ninguno: el array solo existe dentro de `summarize(loadSales(id))`, y un `AbortController` por tarjeta quita sus tres listeners al cerrar.

[[exercise:05-closure-que-retiene.md-(script.js)]]

### 🐛 Listeners que nadie quita

El caso más común: cada vez que se abre algo, se registra un listener en `document` o `window` (para cerrar con Escape, para recolocarse al cambiar el tamaño) y nadie lo quita al cerrar. Cada apertura añade otro, y cada uno retiene su closure:

[[exercise:06-listeners-que-se-acumulan.md]]

```text
— 🐛 el panel se abre y se cierra con «Cerrar» tres veces; a la cuarta, Escape —
🐛 Escape → cerrando el pedido P-101
🐛 Escape → cerrando el pedido P-102
🐛 Escape → cerrando el pedido P-103
🐛 Escape → cerrando el pedido P-104
🐛 una pulsación → 4 manejadores · listeners de keydown en document: 4
— ✅ lo mismo con un AbortController por apertura —
✅ Escape → cerrando el pedido P-108
✅ una pulsación → 1 manejador · listeners de keydown en document: 0
Listo: pulsa «Ver pedido 🐛», «Cerrar», otra vez «Ver pedido 🐛» y Escape
// Tras pulsar «Ver pedido 🐛», «Cerrar», otra vez «Ver pedido 🐛» y Escape:
🐛 Escape → cerrando el pedido P-109
🐛 Escape → cerrando el pedido P-110
```

El síntoma visible (un manejador que se ejecuta cuatro veces con pedidos viejos) es solo la punta: cada uno de esos closures retiene el pedido, y en una aplicación real, el panel entero con sus datos. Viste el remedio en la lección «Escuchar eventos» y en los web components del capítulo 6: un `AbortController` por apertura y `{ signal }` en todos sus listeners; un solo `abort()` los quita todos.

### 🐛 Temporizadores que nadie para

La lista de temporizadores pendientes es una raíz. Un `setInterval` que nadie para sigue llamando a su función para siempre, y esa función retiene todo lo que usa: el widget que ya no está en la página, sus datos, sus nodos. Además gasta CPU (y batería) actualizando cosas que nadie ve.

[[exercise:07-temporizador-sin-parar.md]]

```text
dos widgets montados: 🐛 y ✅
los dos widgets, quitados de la página
🐛 ¿su temporizador siguió después de quitarlo? true · ¿el widget está en la página? false
✅ ¿su temporizador siguió después de quitarlo? false
Listo: pulsa «Montar y quitar un widget 🐛» y mira el contador de huérfanos
// Tras pulsar «Montar y quitar un widget 🐛» y, unos segundos después, «Parar los temporizadores huérfanos»:
🐛 widget 1 montado y quitado · su temporizador sigue
🧹 temporizadores parados: 1
```

Lo mismo vale para todo lo que «sigue funcionando» por su cuenta: observadores (`IntersectionObserver`, `ResizeObserver`), bucles de `requestAnimationFrame`, suscripciones a un `EventSource` o a un `WebSocket`. Quien lo pone en marcha guarda cómo pararlo y lo para al desmontar (en un web component, en `disconnectedCallback`).

### 🐛 Nodos desconectados

`el.remove()` saca un elemento del árbol, pero no lo destruye: si una variable, un array o un `Map` lo siguen apuntando, el elemento sigue en memoria (un nodo **desconectado**, *detached*), y con él todos sus hijos y sus listeners.

[[exercise:08-nodos-desconectados.md]]

```text
tras 200 notificaciones:
🐛 elementos en el Map: 200 · en la página: 5 · desconectados: 195
✅ elementos en el Map: 5 · en la página: 5 · desconectados: 0
Listo: pulsa «Llegan 50 más» y después «Limpiar el Map 🐛»
// Tras pulsar «Llegan 50 más»:
tras 250 notificaciones:
🐛 elementos en el Map: 250 · en la página: 5 · desconectados: 245
✅ elementos en el Map: 5 · en la página: 5 · desconectados: 0
// Tras pulsar «Limpiar el Map 🐛»:
🧹 borradas del Map las entradas de elementos que ya no están en la página:
🐛 elementos en el Map: 5 · en la página: 5 · desconectados: 0
✅ elementos en el Map: 5 · en la página: 5 · desconectados: 0
```

En un *heap snapshot*, escribe `Detached` en el filtro: cada nodo desconectado aparece con ese prefijo. Tres remedios, de más a menos habitual: borra la referencia cuando quites el nodo; guarda **datos** (un id) en lugar de elementos y búscalos con `querySelector` cuando hagan falta; o, para asociar datos a elementos, un `WeakMap` (lección «Map, Set y WeakMap»), que no retiene sus claves.

### 🐛 Cachés sin límite

Una caché es memoria que se guarda a propósito, y por eso es la fuga más fácil de justificar. Un `Map` que guarda cada resultado «por si acaso» crece con cada consulta distinta, durante toda la vida de la página. Toda caché necesita un límite (por número de entradas) o una caducidad (por tiempo). La política más usada es **LRU** (*least recently used*): al llenarse, se tira la entrada que lleva más tiempo sin usarse. Un `Map` la hace casi gratis, porque recuerda el orden de inserción:

[[exercise:09-cache-sin-limite.md-]]

```text
3000 búsquedas → 🐛 entradas: 907 (aciertos 70 %) · ✅ LRU: 50 entradas (aciertos 70 %)
30000 búsquedas → 🐛 entradas: 9007 (aciertos 70 %) · ✅ LRU: 50 entradas (aciertos 70 %)
```

Los mismos aciertos con 50 entradas que con 9007: lo que se repite siempre está entre lo más reciente. Antes de añadir una caché, pregúntate cuánto puede crecer y quién la vacía.

> **Desde Python:** `functools.lru_cache(maxsize=128)` es esta misma caché en un decorador. Con `maxsize=None` crece sin límite: la misma fuga.

## Herramientas de limpieza

| Lo que pones en marcha | Cómo se deshace | Dónde lo viste |
|---|---|---|
| listeners mientras algo está abierto | un `AbortController` por apertura y `{ signal }` en todos; `abort()` al cerrar | «Escuchar eventos» |
| datos asociados a elementos u objetos ajenos | un `WeakMap` con el objeto como clave | «Map, Set y WeakMap» |
| temporizadores, observadores, bucles de rAF | guardar el id o el objeto y pararlo al desmontar | «Observers», «El bucle de animación» |
| cachés | un tamaño máximo (LRU) o una caducidad | ejemplo 09 |
| conexiones, archivos, recursos externos | un `close()` explícito, con `try/finally` | ejemplo 10 |

¿Y `WeakRef` y `FinalizationRegistry`? Parecen hechos para esto, y no lo son. Un `WeakRef` apunta a un objeto sin mantenerlo vivo (`deref()` lo devuelve, o `undefined` si el recolector ya lo liberó), y un `FinalizationRegistry` llama a una función cuando un objeto registrado se libera. El problema es **cuándo**: el estándar no promete ni el momento ni que ocurra (si la pestaña se cierra antes, nunca ocurre). Sirven para optimizar (una caché de cosas que se pueden recalcular), nunca para algo que **tiene** que pasar:

[[exercise:10-weakref-no-es-limpieza.md-]]

```text
🐛 sesión soltada · salas con conexión abierta → soporte
🐛 ¿supportRef.deref() la sigue viendo en este mismo turno? → true
✅ mensaje enviado a ventas
✅ error manejado → el servidor rechazó el mensaje
✅ salas con conexión abierta → soporte (solo la 🐛)
miniatura → 16384 bytes (con deref() === undefined siempre previsto)
```

El ejemplo no imprime nada cuando llega el finalizador, a propósito: puede ser en un segundo o no llegar, y una salida que depende del recolector no se puede comprobar. En Chrome (desde la versión 134) existe además `using`: `{ using session = openSession(); … }` llama a `session[Symbol.dispose]()` al salir del bloque, pase lo que pase, como el `with` de Python.

## Bestiario

- **Tirones periódicos en una animación que «no hace nada raro».**
  Síntoma: la animación da un tirón cada pocos segundos; en DevTools › Performance aparecen muchas barras «Minor GC».
  Causa: el bucle caliente crea objetos nuevos en cada vuelta (vectores inmutables, `map`/`filter`, `{...obj}`), y el recolector trabaja sin parar.
  Solución: reutiliza estructuras creadas fuera del bucle (typed arrays, objetos que se modifican en el sitio) o un pool.
  → [ver ejemplo](02-objetos-en-cada-frame.md)
- **Un objeto reciclado trae datos de otro.**
  Síntoma: la comanda de una mesa sale con la alergia y las notas de otra; una partícula nace con la velocidad de la anterior.
  Causa: el pool devuelve el objeto tal como lo dejó su usuario anterior.
  Solución: limpia cada campo dentro del pool, al devolver o al prestar; vacía los arrays con `length = 0`.
  → [ver ejemplo](04-pool-sin-limpiar.md)
- **Cerrar no libera memoria.**
  Síntoma: tras cerrar un panel o una tarjeta, la memoria no baja; un heap snapshot muestra sus datos retenidos por un *Context*.
  Causa: un listener de `window`/`document` sigue registrado; su closure comparte contexto con funciones que usaban los datos grandes.
  Solución: `AbortController` por apertura con `{ signal }`; no captures datos grandes en funciones que viven mucho.
  → [ver ejemplo](05-closure-que-retiene.md)
- **El manejador se ejecuta varias veces, con datos viejos.**
  Síntoma: una tecla o un evento global ejecuta el manejador tantas veces como se abrió el panel.
  Causa: cada apertura añade un listener nuevo y nadie lo quita.
  Solución: un `AbortController` por apertura y `abort()` al cerrar.
  → [ver ejemplo](06-listeners-que-se-acumulan.md)
- **Algo sigue trabajando después de quitarlo.**
  Síntoma: un reloj o un sondeo sigue ejecutándose (y gastando CPU) con el componente fuera de la página.
  Causa: un `setInterval` (u observador, o bucle de rAF) que nadie para; la lista de temporizadores es una raíz.
  Solución: guarda el id y llama a `clearInterval` al desmontar.
  → [ver ejemplo](07-temporizador-sin-parar.md)
- **Cientos de nodos «Detached» en el heap snapshot.**
  Síntoma: la memoria crece con cada actualización de una lista; el snapshot muestra elementos desconectados.
  Causa: un array o `Map` sigue apuntando a elementos que ya se quitaron del DOM.
  Solución: borra la referencia al quitar el nodo, guarda ids en lugar de elementos, o usa un `WeakMap`.
  → [ver ejemplo](08-nodos-desconectados.md)
- **La memoria crece mientras la página se usa.**
  Síntoma: tras horas de uso, la pestaña ocupa cientos de MB; el snapshot muestra un `Map` enorme.
  Causa: una caché sin límite guarda cada consulta distinta para siempre.
  Solución: un tamaño máximo (LRU con el orden de `Map`) o una caducidad.
  → [ver ejemplo](09-cache-sin-limite.md)
- **«El finalizador ya la cerrará.»**
  Síntoma: conexiones o recursos que siguen abiertos un tiempo impredecible tras soltar el objeto.
  Causa: `FinalizationRegistry` (y `WeakRef`) dependen del recolector, que no promete cuándo ni si pasará.
  Solución: cierra a mano con `try/finally` (o `using` en Chrome); `WeakRef` solo para cachés recalculables.
  → [ver ejemplo](10-weakref-no-es-limpieza.md)

## Resumen

- El recolector libera lo que no se alcanza desde las raíces (globales, pila, listeners, temporizadores); los ciclos inalcanzables también.
- La generación joven se limpia a menudo y barato; lo que sobrevive pasa a la vieja, cuya limpieza cuesta más.
- En los bucles calientes, reutiliza: typed arrays creados una vez, objetos modificados en el sitio, pools que limpian lo que prestan.
- `+=` con texto es rápido en V8 (ropes): escribe lo más claro.
- Una fuga es algo de larga vida apuntando a algo de vida corta: listeners, closures, temporizadores, nodos desconectados y cachés sin límite.
- DevTools: Performance monitor para ver la tendencia; heap snapshots con Comparison y Retainers para encontrar al culpable.
- Limpieza explícita: `AbortController`, `clearInterval`, `WeakMap`, LRU, `close()` con `try/finally`; nunca `FinalizationRegistry` para lo que tiene que pasar.

## Para profundizar

- [MDN: Gestión de memoria](https://developer.mozilla.org/es/docs/Web/JavaScript/Memory_management)
- [V8: Trash talk, el recolector Orinoco (en inglés)](https://v8.dev/blog/trash-talk)
- [Chrome for Developers: solucionar problemas de memoria (en inglés)](https://developer.chrome.com/docs/devtools/memory-problems)
- [Chrome for Developers: heap snapshots (en inglés)](https://developer.chrome.com/docs/devtools/memory-problems/heap-snapshots)
- [Documentación de Python: el módulo gc](https://docs.python.org/es/3/library/gc.html)
