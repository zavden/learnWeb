# Web workers

## Por qué importa

Una página tiene un **hilo principal** (en el módulo de asincronía lo llamamos «hebra»: es lo mismo), y en él pasa casi todo: tu JavaScript, los eventos del usuario, los callbacks de `requestAnimationFrame`, el cálculo de estilos, el layout y el pintado. En la lección «El event loop» viste la consecuencia: una tarea de 300 ms congela la página entera, el reloj se para, el texto «Calculando…» nunca llega a la pantalla y los clics esperan en la cola. Trocear el trabajo en rebanadas ayuda a que la página respire, pero el trabajo sigue siendo el mismo, y sigue en el mismo hilo.

Un **web worker** es la salida de verdad: un script que el navegador ejecuta en **otro hilo**, con su propio event loop, en paralelo con la página. Mientras el worker cuenta primos, filtra una imagen o analiza un archivo de 50 MB, el hilo principal queda libre para pintar y responder. Es la puerta de entrada al resto del capítulo: el código de WebAssembly pesado y el trabajo con la GPU se suelen preparar en un worker, y los búferes del módulo anterior son lo que viaja entre hilos.

El precio es que un worker **no comparte nada** con la página: ni variables, ni objetos, ni el DOM. Se hablan por **mensajes**, y cada mensaje se copia. Esta lección cuenta cómo crear un worker, cómo hablar con él, qué se puede enviar y qué no, cómo manejar sus errores y cómo repartir un cálculo entre varios. La lección siguiente enseña a enviar búferes sin copiarlos, y la tercera, por qué la memoria compartida casi nunca está disponible. Para medir con rigor (tareas largas, microbenchmarks) está el módulo «Rendimiento», el siguiente de este capítulo.

## El primer worker

Un worker se crea con `new Worker(url)`, donde `url` es un archivo de JavaScript. En LearnWeb, igual que con `fetch`, las URL relativas apuntan a la carpeta `assets/` del tema: los workers de esta lección están ahí, y los puedes leer con el botón «Assets». Este es el del primer ejemplo:

```js
// 01-recipe/recipe-worker.js
self.onmessage = (event) => {
  const { recipe, people } = event.data; // una COPIA de lo que envió la página
  const factor = people / recipe.people;
  const ingredients = recipe.ingredients.map(({ item, amount, unit }) => ({
    item, amount: Math.round(amount * factor * 10) / 10, unit,
  }));
  self.postMessage({ name: recipe.name, people, ingredients, scope: self.constructor.name });
};
```

Los dos lados usan las mismas dos piezas: `postMessage(datos)` para enviar y el evento `message` para recibir, con los datos en `event.data`. En la página, los dos métodos son del objeto `Worker`; dentro del worker, del objeto global, que se llama **`self`** (un `DedicatedWorkerGlobalScope`, el equivalente de `window`). `onmessage = …` y `addEventListener('message', …)` funcionan igual en los dos lados.

[[exercise:01-primer-worker.md-]]

```text
página: envío la receta al worker
página: sigo con lo mío; la respuesta llegará en una tarea posterior
página: recibo «Pozole rojo» para 10 personas
  2.5 kg de maíz pozolero
  3 kg de carne de cerdo
  15 piezas de chile guajillo
  10 dientes de ajo
  2.5 cucharadas de orégano
el worker se ejecutó en → DedicatedWorkerGlobalScope
```

Fíjate en el orden. `new Worker` no espera a que el archivo se descargue, y `postMessage` no espera respuesta: el script sigue hasta el final, y la respuesta llega después como una **tarea** del event loop de la página (lección «El event loop»: los mensajes de los workers están entre las fuentes de tareas). Si envías un mensaje antes de que el worker haya cargado, espera en su cola; no se pierde. Al terminar, `worker.terminate()` cierra el hilo y libera su memoria.

```text
   hilo principal (la página)                         hilo del worker
 ┌────────────────────────────────┐               ┌──────────────────────────────┐
 │ tu script, eventos, rAF,       │  postMessage  │ recipe-worker.js             │
 │ estilos, layout y pintado      │ ────────────► │ su propio event loop         │
 │ un event loop                  │ ◄──────────── │ sin DOM: self, fetch, timers │
 └────────────────────────────────┘    message    └──────────────────────────────┘
          cada mensaje es una COPIA y llega como una tarea del otro lado
```

Cada lado sigue la regla de «ejecutar hasta completar»: el worker atiende un mensaje cada vez, y si se queda calculando dentro de un bucle, los mensajes que le lleguen esperan, igual que los clics en una página bloqueada. Un worker también es un solo hilo; lo que gana la página es que ese hilo **no es el suyo**.

> **Desde Python:** en Python, `threading` crea hilos que comparten los objetos del programa, pero el GIL (*global interpreter lock*) deja que solo uno ejecute código Python a la vez, así que para usar varios núcleos hay que ir a `multiprocessing`: procesos con su propia memoria que se pasan datos copiados con `pickle`. Un worker se parece mucho más a un **proceso** de `multiprocessing` que a un hilo de `threading`: memoria separada, nada compartido, mensajes copiados. Y sin GIL: cada worker usa su propio núcleo de verdad.

## 🐛 El `console.log` del worker no sale aquí

El primer tropiezo con los workers en LearnWeb: un `console.log` escrito **dentro** del worker se ejecuta, pero no aparece en la consola del ejemplo. Cada worker tiene su propia consola, y la de LearnWeb solo recoge la de la página. La solución es la de cualquier comunicación con un worker, un mensaje: el worker envía sus líneas de registro con un campo `type` que las distingue del resultado, y la página las imprime.

[[exercise:02-el-console-del-worker.md-]]

```text
página: inventario enviado
📨 del worker: 5 productos recibidos
📨 del worker: 3 con menos de 5 unidades
poco stock → Café de Chiapas, Vainilla de Papantla, Chocolate de Oaxaca
```

Para depurar de verdad, abre la vista previa en su propia pestaña con el botón ↗ y usa Chrome DevTools (F12): su consola muestra los mensajes de la página **y** los de cada worker, con el nombre del archivo del worker a la derecha, y en el panel *Sources* (Fuentes) cada worker aparece como un hilo más (*Threads*), donde puedes poner puntos de ruptura. Si creas el worker con un nombre, `new Worker(url, { name: 'precios' })`, ese nombre es el que verás en DevTools (y `self.name` dentro del worker).

## Tres formas de crear un worker

| Forma | Cómo se crea | Para cargar más código | Cuándo |
|-------|--------------|------------------------|--------|
| Clásico | `new Worker('w.js')` | `importScripts('a.js', 'b.js')`: síncrono, deja funciones globales | código antiguo o sin dependencias |
| De módulo | `new Worker('w.js', { type: 'module' })` | `import` (rutas relativas al archivo del worker) | lo normal hoy |
| Blob | `new Worker(URL.createObjectURL(blob))` | — | demos pequeñas con el código en la página |

Un worker de **módulo** es un módulo de ES como los del módulo «Módulos y organización»: usa `import`, está en modo estricto y puede compartir archivos con la página (cada lado los evalúa por su cuenta). Ya viste uno en el ejemplo profesional «Un worker de módulo» de aquel módulo, donde la URL del worker se calculaba con `new URL('./ruta.js', import.meta.url)`, relativa al módulo y no al documento (`import.meta.resolve('./ruta.js')`, de la lección «Import dinámico», da la misma URL). Un **Blob** (lección «Texto y binario») convierte un texto en un archivo en memoria, y `URL.createObjectURL` le da una URL `blob:` que `new Worker` acepta. En cuanto el worker existe, `URL.revokeObjectURL` libera esa URL: el worker ya tiene su código.

[[exercise:03-tres-formas-de-crear-un-worker.md-]]

```text
clásico (archivo) → $1,045.50
módulo (archivo, con import) → $1,045.50
blob (texto en la página) → $1,045.50
módulo creado como clásico → 🐛 Uncaught SyntaxError: Cannot use import statement outside a module
```

El último caso es un error típico: un archivo con `import` creado sin `{ type: 'module' }` se interpreta como script clásico y el worker no llega a arrancar. El error no se lanza en la página: llega como un evento `error` del worker (lo verás a fondo en «Errores y cierre»). Fíjate también en `self.close()` dentro del worker Blob: un worker puede cerrarse a sí mismo cuando termina su trabajo.

Un detalle de LearnWeb: las tarjetas de la teoría y de la galería son iframes aislados (origen `null`), y desde ahí el navegador no deja crear un worker a partir de una URL `http`. LearnWeb lo resuelve creando por ti un worker Blob que carga tu archivo. Funciona igual, con una diferencia: dentro de un worker **clásico**, `self.location` pasa a ser una URL `blob:`, así que un `importScripts('util.js')` o un `fetch('datos.json')` relativos no encontrarían el archivo. Por eso los ejemplos que importan algo usan workers de módulo, cuyos `import` se resuelven contra la URL del propio archivo. En una web normal, sin iframes aislados, esto no pasa.

## 🐛 Un worker no tiene DOM

Un worker no puede tocar la página. No hay `document`, ni `window`, ni elementos, ni `localStorage`, ni `alert`. La razón es de diseño: si dos hilos pudieran cambiar el mismo elemento a la vez, la página podría quedar a medias (un nodo movido por uno y borrado por otro), y proteger cada nodo con cerrojos haría lento todo el DOM. Los navegadores eligieron la regla más simple: **solo el hilo principal toca la página**, y los demás hilos le envían datos.

Lo que sí hay es casi todo lo que no es la página: `fetch`, los temporizadores, `indexedDB`, `crypto`, `TextEncoder`, `Blob`, `URL`, `structuredClone`, `WebSocket`, `navigator` (una versión reducida) y `location` (la URL del worker, de solo lectura). Y algo importante para la lección siguiente: `OffscreenCanvas`, un canvas que no está en la página y en el que un worker puede dibujar. En Chrome, los workers dedicados también tienen `requestAnimationFrame`, pensado justo para animar ese canvas.

[[exercise:04-sin-dom.md-(script.js)]]

```text
en el worker hay → fetch, setTimeout, indexedDB, crypto, TextEncoder, OffscreenCanvas
en el worker NO hay → document, window, localStorage, alert
🐛 error en el worker → Uncaught ReferenceError: document is not defined
   en cart-worker.js, línea 17
Uncaught ReferenceError: document is not defined
✅ total escrito por la página → $1,385.00
```

El `ReferenceError` ocurre dentro del worker, pero lo ves en la página por dos caminos: primero como un evento `error` en el objeto `Worker` (con `message`, `filename` y `lineno`) y, como nadie lo da por manejado con `event.preventDefault()`, también como un error sin atrapar de la página, la línea `Uncaught ReferenceError…` de la consola. El worker no muere por el error: sigue atendiendo mensajes, y el segundo, que solo pide el número, funciona. El reparto correcto de papeles es siempre ese: **el worker calcula, la página pinta**.

## Mensajes: el clonado estructurado

Cada mensaje se **copia** con el **clonado estructurado** (*structured clone*), el mismo algoritmo de `structuredClone` que viste en la lección «JSON y copias». Por eso, a diferencia de JSON, llegan intactos los `Date`, `Map`, `Set`, los typed arrays, los errores y hasta las referencias circulares. Y por eso lo que el worker cambia en su copia no cambia el original: al volver, la respuesta es **otra** copia.

[[exercise:05-clonado-estructurado.md-]]

```text
worker: Date → true · 2026-11-02T17:00:00.000Z
worker: Map → adulto: 2, estudiante: 1
worker: Set → Día de Muertos, visita guiada
worker: Uint8Array → [12, 13, 14]
worker: RangeError → la sala 3 está llena a las 11:00
worker: ¿referencia circular? → true
worker: getter people → valor 3, ¿sigue siendo getter? false
página: adultos en el original → 2
página: adultos en la copia que devolvió → 99
¿la copia es el mismo objeto? → false
```

Los getters se ejecutan una vez, al enviar, y llegan como un valor fijo (lección «Propiedades a fondo»). Las claves symbol, las propiedades no enumerables y los campos privados `#x` no viajan.

| Llega copiado | No llega |
|---------------|----------|
| primitivos (salvo `Symbol`), objetos planos y arrays | funciones y métodos → `DataCloneError` |
| `Date`, `RegExp`, `Map`, `Set`, errores | `Symbol` como valor → `DataCloneError` |
| `ArrayBuffer`, typed arrays, `DataView`, `Blob`, `File`, `ImageData` | nodos del DOM y proxies → `DataCloneError` |
| referencias circulares y objetos repetidos | el prototipo: una instancia llega como objeto plano |
| el **valor** de los getters | claves symbol, campos privados, propiedades no enumerables |

> **Desde Python:** `multiprocessing` hace lo mismo con `pickle`: el proceso hijo recibe una copia. Hay una diferencia: `pickle` guarda **de qué clase** es cada objeto (su módulo y su nombre) y el otro proceso la importa para reconstruirlo. El clonado estructurado solo copia datos: la clase se queda por el camino.

### 🐛 Funciones, clases y nodos no viajan

Si el mensaje contiene algo que no se puede clonar, `postMessage` lanza un `DataCloneError` **en la página**, en la propia llamada, y no envía nada. Pasa con una función (también un método de un objeto literal), con un `Symbol` y con cualquier nodo del DOM. Las instancias de una clase son el caso traicionero: no lanzan nada, pero llegan **aplanadas**, sin prototipo, sin métodos y sin getters del prototipo.

[[exercise:06-funciones-y-clases-no-viajan.md-]]

```text
🐛 una función → DataCloneError: Failed to execute 'postMessage' on 'Worker': () => {} could not be cloned.
🐛 un symbol → DataCloneError: Failed to execute 'postMessage' on 'Worker': Symbol(urgente) could not be cloned.
🐛 un elemento del DOM → DataCloneError: Failed to execute 'postMessage' on 'Worker': HTMLDivElement object could not be cloned.
en la página → total: 860 · pagado: true
🐛 instancia → prototipo: Object.prototype · instanceof Order: false
   claves → code, lines · total: undefined · typeof pay: undefined
✅ datos + Order.fromData → instanceof Order: true · total: 860 · pagado: true
```

La solución es separar **código** y **datos**. El código viaja con `import`: la página y el worker de módulo importan el mismo `order.js`. Los datos viajan por mensajes, como objeto plano (`toData()`), y al otro lado se reconstruye la instancia (`Order.fromData()`), igual que hacías con JSON en el ejemplo profesional «Guardar y restaurar tipos» del módulo «Objetos y prototipos».

### 🐛 Copiar cuesta

El clonado no es gratis, y ocurre en un sitio que sorprende: el objeto se **serializa dentro de `postMessage`**, en el hilo que envía, antes de que el mensaje salga; el otro hilo lo reconstruye después. Para un objeto pequeño son microsegundos. Para cientos de miles de objetos, la propia página se queda congelada mientras copia: justo lo que querías evitar al usar un worker.

[[exercise:07-copiar-cuesta.md]]

[[exercise:07-copiar-cuesta.md-(script.js)]]

```text
1,000 ventas copiadas → el worker recibió 1000 · el original sigue aquí: 1000
Listo: pulsa «Medir»
// Tras pulsar «Medir». Los tiempos cambian en cada ejecución; en el M1 del curso:
10,000 objetos → postMessage ocupó la página ≈ 3 ms · respuesta en ≈ 8 ms (10,000 recibidos)
100,000 objetos → postMessage ocupó la página ≈ 25 ms · respuesta en ≈ 55 ms (100,000 recibidos)
300,000 objetos → postMessage ocupó la página ≈ 40 ms · respuesta en ≈ 105 ms (300,000 recibidos)
300,000 ventas en un Float64Array (7 MB) → postMessage ocupó la página ≈ 1 ms · respuesta en ≈ 5 ms (900,000 recibidos)
```

El coste crece con el **número de objetos**, no con los bytes: cada objeto, cada clave y cada texto se recorre y se reconstruye uno a uno. Un typed array es un solo bloque de memoria, y copiarlo es copiar bytes seguidos, decenas de veces más rápido. Por eso los datos que van y vienen de un worker suelen viajar en typed arrays, y por eso la lección siguiente va más allá: **transferir** el búfer, sin copiar ni un byte.

## Errores y cierre

Una excepción que nadie atrapa dentro del worker no rompe la página. Llega como un evento `error` en el objeto `Worker`, un `ErrorEvent` con `message` (`'Uncaught RangeError: …'`), `filename` y `lineno`. Si el listener llama a `event.preventDefault()`, el error queda manejado; si no, la página lo trata como un error sin atrapar suyo, como viste en el ejemplo 04. El worker sobrevive y atiende el mensaje siguiente.

[[exercise:08-errores-del-worker.md-]]

```text
✅ Café de Chiapas: $150 por unidad
⚠️ error en el worker → Uncaught RangeError: unidades no válidas para Miel de Yucatán: 0
   en price-worker.js, línea 4
✅ Chocolate de Oaxaca: $45 por unidad
404 → evento Event · ¿trae message? false
```

Un archivo que no existe es otro caso: `new Worker('no-existe.js')` no lanza nada, y poco después llega un evento `error` **sencillo** (un `Event`, no un `ErrorEvent`), sin mensaje ni línea, porque ningún código ha fallado: el archivo no llegó. Escucha siempre `error` en tus workers, o un 404 pasará en silencio. Hay un tercer evento, `messageerror`, para un mensaje que llegó pero no se pudo reconstruir al otro lado; es muy raro y casi nunca lo verás.

Para cerrar un worker hay dos caminos. `worker.terminate()`, desde la página, lo detiene **en el acto**, aunque esté a mitad de un cálculo: no termina el trabajo ni responde a lo pendiente. `self.close()`, desde dentro, es la despedida ordenada: termina la tarea en curso y los mensajes que ya había enviado llegan. Un worker que no se cierra sigue ocupando memoria (cada uno tiene su propio motor de JavaScript) aunque no haga nada; los ejemplos de esta lección los cierran todos al terminar.

## Peticiones y respuestas

Con un solo mensaje de ida y uno de vuelta, `onmessage` basta. Cuando la página hace varias peticiones a la vez, hace falta saber **qué respuesta corresponde a qué petición**, porque el worker puede responder en otro orden: una consulta lenta acaba después que una rápida enviada más tarde. La solución clásica es un **protocolo** con un `id` por petición: `{ id, type, payload }` de ida y `{ id, ok, result }` o `{ id, ok: false, error }` de vuelta. La página guarda la promesa de cada `id` en un `Map` y la cumple (o rechaza) cuando llega su respuesta.

[[exercise:09-peticiones-con-id.md-]]

```text
envío a Yucatán (3 kg) → $210.00
envío a Puebla (3 kg) → $120.00
IVA de $1,385.00 → $221.60
⚠️ shipping → no enviamos a Sonora
⚠️ discount → tipo de petición desconocido: discount
peticiones pendientes → 0
```

Con `callWorker` el worker se usa como una función asíncrona más, y sus errores llegan como rechazos normales que atrapas con `try/catch`. Fíjate en que el worker **atrapa sus propios errores** y los devuelve como respuesta: así nunca deja una petición sin contestar. Es el mismo cliente que viste en el ejemplo profesional «Un worker de módulo». Hay otra forma de emparejar respuestas, sin ids: crear un `MessageChannel` por petición y enviarle al worker uno de sus extremos para que conteste por él; la verás en la lección siguiente, porque enviar un puerto es **transferirlo**.

> **Desde Python:** es lo que hace `concurrent.futures` por ti: `executor.submit(fn, datos)` devuelve un `Future` por tarea, y el ejecutor empareja cada resultado con su `Future`. Aquí, la promesa es el `Future` y el `id` es la etiqueta que los empareja.

## Un pool de workers

Un worker usa un núcleo del procesador. Para usar varios, se crean varios workers y se reparte el trabajo: un **pool**. `navigator.hardwareConcurrency` dice cuántos núcleos lógicos tiene el equipo (en el Mac del curso, 8; en el tuyo puede ser otro número). No conviene crear uno por núcleo: cada worker cuesta memoria y unos milisegundos de arranque, la página y el resto del sistema también necesitan núcleos y, en un portátil sin ventilador o en un móvil, todos los núcleos al 100 % significan calor y batería. Los ejemplos del curso usan como mucho `Math.min(4, navigator.hardwareConcurrency)`.

El reparto tiene dos trucos. El trabajo se divide en **más trozos que workers** (aquí 16 trozos para 4 workers) y cada worker pide el siguiente cuando acaba el suyo: los trozos no cuestan lo mismo (contar los primos entre 3 y 4 millones cuesta más del doble que entre 0 y 1 millón) y así ningún worker se queda parado mientras otro trabaja. Y los resultados se guardan **por índice**, no por orden de llegada, que cambia en cada ejecución.

[[exercise:10-pool-de-workers.md]]

[[exercise:10-pool-de-workers.md-(script.js)]]

```text
primos menores que 100,000 → 9,592 (16 trozos) · ¿igual que en un solo hilo? true
Listo: pulsa «Contar con workers» y luego «Contar en el hilo principal»; mira el reloj
// Tras pulsar «Contar con workers». Los tiempos cambian en cada ejecución; en el M1 del curso:
workers: 283,146 primos en ≈ 130 ms · ticks del reloj mientras tanto: ≈ 5
// Tras pulsar «Contar en el hilo principal»:
hilo principal: 283,146 primos en ≈ 340 ms · ticks del reloj mientras tanto: 0
```

```text
// En el Mac del curso (en el tuyo puede ser otro número), la página muestra:
Núcleos lógicos: 8 → pool de 4 workers
```

Con el pool, el reloj sigue andando y la cuenta termina antes; en el hilo principal, el reloj se queda clavado y ningún clic se atiende hasta el final. Con cuatro workers, la cuenta no tarda la cuarta parte: crear los workers, cargar sus módulos y los mensajes cuestan su tiempo, y no todos los núcleos de un M1 son iguales (cuatro son de alto rendimiento y cuatro de bajo consumo). «Detener» llama a `terminate()` en todos los workers y el trabajo a medias se pierde, que es justo lo que se quiere. El `AbortController` es el mismo de la lección «Combinadores y cancelación».

> **Desde Python:** `ProcessPoolExecutor(max_workers=4).map(count_primes, chunks)` es este ejemplo en una línea: un pool de procesos, trozos de trabajo y resultados **en el orden de los trozos**, aunque terminen en otro orden. Y una `multiprocessing.Queue` o un `queue.Queue` entre hilos son lo más parecido a los mensajes: un canal por el que pasan datos copiados (o, entre hilos, referencias).

## Otros workers: compartidos y de servicio

Todo lo anterior son workers **dedicados**: cada uno pertenece a la página que lo creó y muere con ella. Hay dos familias más, con otros usos:

- Un **worker compartido** (`new SharedWorker(url)`) es uno solo para todas las pestañas e iframes del mismo origen que lo pidan: cada uno habla con él por un puerto (`sharedWorker.port`). Sirve, por ejemplo, para que diez pestañas de una aplicación compartan una sola conexión con el servidor. No está disponible en todos los navegadores móviles, y en los iframes aislados de LearnWeb no tiene sentido: no lo verás en el curso.
- Un **service worker** es otra cosa: un intermediario entre la página y la red. Intercepta las peticiones de la página, puede responderlas desde una caché propia (y así la aplicación funciona sin conexión), recibe notificaciones *push* y sigue existiendo cuando la página se cierra. Es la base de las aplicaciones web instalables (PWA). Tiene sus propias reglas (HTTPS, registro, ciclo de vida) y queda fuera de este curso.

## Bestiario

- **El `console.log` del worker no aparece.**
  Síntoma: los mensajes que el worker escribe con `console.log` no salen en la consola de LearnWeb.
  Causa: cada worker tiene su propia consola; LearnWeb solo recoge la de la página.
  Solución: envía las líneas a la página como mensajes `{ type: 'log', text }`, o abre la vista previa con ↗ y mira la consola de Chrome DevTools, que muestra las de los workers.
  → [ver ejemplo](02-el-console-del-worker.md)
- **El worker no arranca: `Cannot use import statement outside a module`.**
  Síntoma: un worker que usa `import` no responde, y llega un evento `error` con un `SyntaxError`.
  Causa: se creó como worker clásico, que no admite `import`.
  Solución: `new Worker(url, { type: 'module' })`.
  → [ver ejemplo](03-tres-formas-de-crear-un-worker.md)
- **`ReferenceError: document is not defined` en un worker.**
  Síntoma: el worker deja de responder a una petición y la consola muestra `Uncaught ReferenceError: document is not defined` (o `window`, o `localStorage`).
  Causa: un worker no tiene DOM ni las API de la ventana.
  Solución: el worker calcula y devuelve datos con `postMessage`; la página los escribe en el DOM.
  → [ver ejemplo](04-sin-dom.md)
- **`DataCloneError: … could not be cloned` o una instancia que llega sin métodos.**
  Síntoma: `postMessage` lanza `DataCloneError` y no envía nada, o el worker recibe un objeto sin prototipo (`instanceof` es `false`, los métodos son `undefined`).
  Causa: el clonado estructurado no copia funciones, `Symbol`, nodos del DOM ni proxies, y de una instancia solo copia sus propiedades propias.
  Solución: envía datos planos (`toData()`) y reconstruye la instancia al otro lado con una clase que ambos lados importan.
  → [ver ejemplo](06-funciones-y-clases-no-viajan.md)
- **La página se congela al enviar datos al worker.**
  Síntoma: el cálculo va en un worker, pero la página se traba justo al enviarle los datos (o al recibir la respuesta).
  Causa: `postMessage` clona el mensaje entero en el hilo que envía; con cientos de miles de objetos, eso son decenas de milisegundos.
  Solución: envía números en typed arrays en lugar de objetos, envía solo lo necesario, o transfiere el búfer (lección siguiente).
  → [ver ejemplo](07-copiar-cuesta.md)
- **Un worker que no existe falla en silencio.**
  Síntoma: el worker nunca responde y no hay ningún error en la consola.
  Causa: un 404 no lanza nada; solo dispara un evento `error` simple en el objeto `Worker`.
  Solución: escucha siempre `error` y rechaza las peticiones pendientes cuando llegue.
  → [ver ejemplo](08-errores-del-worker.md)

## Resumen

- Un worker ejecuta un script en otro hilo, con su propio event loop: el cálculo pesado no congela la página.
- `new Worker(url)` (clásico), `new Worker(url, { type: 'module' })` (con `import`) o un Blob con `URL.createObjectURL`.
- Se hablan con `postMessage` y el evento `message` (`event.data`); dentro del worker, el global es `self`.
- Un worker no tiene DOM: calcula y envía datos; la página los pinta. Sí tiene `fetch`, temporizadores, `indexedDB`, `crypto`, `OffscreenCanvas`…
- Los mensajes se copian con el clonado estructurado: funciones, `Symbol` y nodos lanzan `DataCloneError`; las instancias llegan como objetos planos; copiar muchos objetos bloquea al que envía.
- Errores: evento `error` (con `preventDefault()` para manejarlo); un 404 es un `error` sin mensaje. `terminate()` corta en seco; `self.close()` se despide.
- Varias peticiones a la vez: un `id` por mensaje y una promesa por `id`. Varios núcleos: un pool de `Math.min(4, navigator.hardwareConcurrency)` workers y resultados por índice.

## Para profundizar

- [MDN: Usar web workers (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [MDN: El algoritmo de clonado estructurado (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
- [web.dev: Usar web workers para sacar JavaScript del hilo principal (en inglés)](https://web.dev/articles/off-main-thread)
- [HTML Living Standard: Web workers (en inglés)](https://html.spec.whatwg.org/multipage/workers.html)
- [Documentación de Python: concurrent.futures](https://docs.python.org/es/3/library/concurrent.futures.html)
