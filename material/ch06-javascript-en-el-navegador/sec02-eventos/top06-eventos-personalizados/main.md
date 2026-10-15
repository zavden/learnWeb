# Eventos personalizados

## Por qué importa

Hasta aquí, los eventos los creaba el navegador: un clic, una tecla, un envío. Pero el mecanismo (un objeto que viaja, listeners que se apuntan y se quitan, burbuja y captura, acciones que se pueden cancelar) está disponible para **tu** código. Una tarjeta de producto puede anunciar «quieren añadir esto al carrito» sin saber quién lo escucha; unas pestañas pueden preguntar «¿puedo cambiar?» antes de hacerlo; un carrito que no es un elemento de la página puede avisar de cada cambio.

Es el patrón observador que escribiste a mano en el módulo «Clases y POO» (el `EventEmitter`), en la versión que trae el navegador. Esta lección enseña a usarlo y sus sorpresas: que tus eventos no burbujean si no lo pides, que `dispatchEvent` es **síncrono** (al contrario que los eventos del usuario), que un clic simulado no es un clic de verdad, y qué pasa con los errores de un listener, que nunca llegan a quien despachó el evento.

## Crear y despachar

Dos constructores y un método:

- **`new Event(tipo, opciones)`** crea un evento sin datos.
- **`new CustomEvent(tipo, opciones)`** crea uno con una propiedad más, **`detail`**, para lo que quieras enviar.
- **`elemento.dispatchEvent(evento)`** lo entrega en ese elemento: recorre el camino (captura, objetivo y, si burbujea, burbuja) y llama a los listeners, exactamente como con un clic.

| Opción | Por defecto | Qué hace |
|--------|-------------|----------|
| `bubbles` | `false` | si sube por los antepasados |
| `cancelable` | `false` | si `preventDefault()` tiene efecto |
| `composed` | `false` | si sale de un Shadow DOM (módulo «APIs modernas del navegador») |
| `detail` (solo `CustomEvent`) | `null` | los datos del aviso |

[[exercise:01-customevent-y-detail.md-(script.js)]]

```text
Listo: pulsa «Añadir» en los dos productos
// Tras pulsar «Añadir» en los dos:
cart:add · Café de Chiapas (CAF-500) · desde #card-caf · isTrusted: false
cart:add · Cacao de Tabasco (CAC-250) · desde #card-cac · isTrusted: false
```

El catálogo no sabe que existe un contador de carrito: solo anuncia lo que pasó, con los datos en `detail`. El contador escucha en `document` y no sabe cuántas tarjetas hay. Ese desacoplamiento es la razón de ser de los eventos propios. Para los nombres, usa minúsculas y un prefijo propio (`cart:add`, `cart-add`): un nombre como `change` o `click` se mezclaría con los eventos del navegador.

### Burbujear hay que pedirlo

Los eventos del navegador traen `bubbles` y `cancelable` ya decididos (un `click` burbujea; un `focus`, no). Los tuyos empiezan con **todo en `false`**: sin `bubbles: true`, el evento llega al elemento donde lo despachas y ahí se queda. Es el error más común con eventos propios, porque no hay ningún mensaje: el listener del antepasado simplemente no se ejecuta.

[[exercise:02-customevent-no-burbujea.md-(script.js)]]

```text
— simulado al cargar —
🐛 #fav-buggy · bubbles: false → ¿document lo oyó? false
✅ #fav-fixed · bubbles: true → ¿document lo oyó? true
Listo: pulsa los dos botones
// Al pulsar cada botón, se repite su línea.
```

## `dispatchEvent` es síncrono

Un clic del usuario es una **tarea**: espera en la cola del event loop y se atiende cuando la pila está vacía. `dispatchEvent`, en cambio, no encola nada. Es una llamada a función: recorre el camino, ejecuta **todos** los listeners y solo entonces devuelve. Si el código que despacha cambia el estado **después** del `dispatchEvent`, los listeners ven el estado viejo:

[[exercise:03-dispatchevent-es-sincrono.md-]]

```text
🐛 1. antes de dispatchEvent
   2. listener: el pedido P-2077 está → borrador
🐛 3. después de dispatchEvent (devolvió true) · ahora → pagado
✅ 1. estado actualizado; aviso
   2. listener: el pedido P-2077 está → pagado
✅ 3. fin de payFixed
```

La regla: **primero cambia, luego avisa**. Un evento describe algo que ya ha pasado. La otra cara de la misma moneda es que un listener lento frena a quien despacha: si un listener tarda 200 ms, `dispatchEvent` tarda 200 ms. Y el ejemplo despacha en un `new EventTarget()` suelto, sin página: cualquier `EventTarget` sirve (enseguida verás tu propia clase).

## Eventos simulados frente a eventos reales

`elemento.click()` es una forma corta de despachar un `click` simulado, con la ventaja de que también ejecuta la **acción por defecto**: marca una casilla, sigue un enlace, envía un formulario. Los ejemplos de esta sección los usan cuando el tema es el propio despacho. Pero un evento simulado no es idéntico a uno real, y hay dos diferencias que conviene conocer.

### Las microtareas entre listeners

La primera es un acertijo clásico sobre el event loop del módulo «Asincronía y event loop». Un botón tiene dos listeners; cada uno escribe una línea y programa una microtarea. ¿En qué orden sale todo?

[[exercise:04-microtareas-entre-listeners.md-(script.js)]]

```text
— simulado: payButton.click() —
listener 1 (isTrusted: false)
listener 2
script: después de click()
   microtarea 1
   microtarea 2
— Listo: ahora pulsa tú «Pagar» —
// Tras pulsar tú «Pagar» (en Chrome):
listener 1 (isTrusted: true)
   microtarea 1
listener 2
   microtarea 2
```

Las microtareas se ejecutan cuando la pila se queda **vacía**. Con un clic real, el navegador llama a cada listener desde el event loop: al terminar el listener 1, la pila está vacía y la microtarea 1 sale antes que el listener 2. Con `click()`, el script que lo llamó sigue en la pila durante todo el despacho, así que las microtareas esperan a que el script termine. No escribas código que dependa de este orden; pero si un test automático que usa `click()` ve otra cosa que el usuario, ya sabes por qué.

### `isTrusted` y el gesto del usuario

La segunda diferencia es de seguridad. `event.isTrusted` es `true` solo en los eventos que genera el navegador por una acción real, y es de solo lectura. Muchas APIs exigen además un **gesto del usuario** reciente (`navigator.userActivation.isActive`), para que una página no pueda abrir ventanas, poner sonido o pasar a pantalla completa por su cuenta. Un clic simulado no cuenta:

[[exercise:05-istrusted-y-gesto-del-usuario.md-(script.js)]]

```text
— simulado: fullscreenButton.click() —
click · isTrusted: false · gesto del usuario: false
🐛 requestFullscreen rechazado → TypeError
— Listo: ahora pulsa tú el botón —
// Tras pulsar tú el botón (Esc para salir de la pantalla completa):
click · isTrusted: true · gesto del usuario: true
✅ pantalla completa (Esc para salir)
```

Por eso un botón «Ver a pantalla completa» funciona cuando lo pulsas y falla cuando un script lo «pulsa» al cargar la página o tras un temporizador largo.

## Eventos cancelables: pedir permiso

Con `cancelable: true`, tu evento funciona como un enlace o un `submit`: se anuncia **antes** de actuar, y cualquier listener puede llamar a `preventDefault()`. `dispatchEvent` devuelve `false` si alguien lo hizo, y entonces quien despachó no actúa. Es la forma de que un componente pida permiso sin saber a quién:

[[exercise:06-eventos-cancelables.md-(script.js)]]

```text
Listo: pulsa «Direcciones»; luego marca la casilla y pulsa «Pagos»
// Tras pulsar «Direcciones»:
✅ tab:change → Direcciones: pestaña cambiada
// Tras marcar la casilla y pulsar «Pagos»:
   el formulario tiene cambios sin guardar → preventDefault()
⛔ tab:change → Pagos: cancelado (dispatchEvent devolvió false)
```

Fíjate en el orden de las líneas: el listener del formulario se ejecutó **dentro** del `dispatchEvent`, antes de que las pestañas decidieran. Es el mismo sincronismo de antes, ahora a tu favor.

## Tu propio `EventTarget`

`EventTarget` es una clase como cualquier otra, y se puede heredar. Un carrito, un reproductor, una conexión con el servidor: cualquier objeto de tu aplicación puede emitir eventos con `extends EventTarget`, sin estar en la página. A cambio de escribir `new CustomEvent(…)`, recibes gratis todo lo de la lección «Escuchar eventos»: `once`, `signal`, la protección contra duplicados y `handleEvent`:

[[exercise:07-eventtarget-propio.md-]]

```text
🛒 insignia → 1 · target === cart: true
🎁 primer producto: envío gratis
📊 analítica → CAF-500 × 1
🛒 insignia → 3 · target === cart: true
📊 analítica → CAC-250 × 2
🛒 insignia → 4 · target === cart: true
cart instanceof EventTarget → true
¿tiene on y emit? → false false
```

| `EventEmitter` del módulo «Clases y POO» | `EventTarget` |
|------------------------------------------|---------------|
| `on(nombre, fn)` | `addEventListener(tipo, fn, opciones)` |
| `off(nombre, fn)` (o la función de baja de `on`) | `removeEventListener(tipo, fn)` o `{ signal }` |
| `once(nombre, fn)` | `{ once: true }` |
| `emit(nombre, datos)` | `dispatchEvent(new CustomEvent(tipo, { detail: datos }))` |
| un error en un oyente corta a los demás | un error en un listener se informa y los demás siguen (ver abajo) |

En el módulo «Clases y POO» el carrito **tenía** un emisor en lugar de **ser** uno, para no mezclar su API con `on` y `emit`. Con `EventTarget` heredar es razonable porque es la interfaz estándar del navegador; si prefieres la composición, un campo `#events = new EventTarget()` y dos métodos que lo envuelvan funcionan igual.

> **Desde Python:** Tkinter tiene eventos virtuales: `widget.bind('<<CartAdd>>', on_add)` escucha y `widget.event_generate('<<CartAdd>>')` dispara, y por defecto se procesa en el acto, como `dispatchEvent`. Para objetos que no son widgets, en Python se usa una librería de señales (`blinker`, por ejemplo) o el observador hecho a mano; en el navegador, `EventTarget` ya viene de serie.

## Los errores de los listeners

¿Qué pasa si un listener lanza un error? `dispatchEvent` lo atrapa, lo **informa** como error no atrapado (el `Uncaught Error` de la consola y el evento `error` de `window`) y sigue con el siguiente listener. Dos consecuencias: un listener roto no deja sin ejecutar a los demás, y un `try/catch` alrededor de `dispatchEvent` no atrapa **nada**:

[[exercise:08-trycatch-no-atrapa-al-listener.md-(script.js)]]

```text
🛟 error global → analítica caída
Uncaught Error: analítica caída
🧾 factura emitida: el listener anterior falló, pero este se ejecuta
🐛 try: dispatchEvent terminó sin lanzar nada
```

El evento **`error` de `window`** es la red de seguridad global: recibe todos los errores que nadie atrapó, con `event.message`, `event.error` (el objeto `Error`), `event.filename` y `event.lineno`. Es donde un servicio de registro de errores escucha para enviarlos a un servidor. Fíjate en el orden: primero se ejecutan los listeners del evento `error` y después la consola escribe el `Uncaught Error`. Y si uno de esos listeners llama a `event.preventDefault()`, el error se da por atendido y el `Uncaught` ni siquiera aparece (así se comportan DevTools de Chrome y la consola de LearnWeb).

## Listeners `async`

Un listener puede ser una función `async`, pero el navegador **no espera** a su promesa: en el primer `await`, la función devuelve una promesa, el navegador da el listener por terminado y sigue con el resto del viaje y con la acción por defecto. Dos cosas fallan:

- Un `preventDefault()` después de un `await` llega **tarde**: la acción ya ocurrió. Peor aún, `defaultPrevented` pasa a `true`, así que el código parece correcto.
- Un error después de un `await` rechaza una promesa que nadie espera: es un **rechazo sin manejar**, que llega al evento **`unhandledrejection` de `window`**, la red de seguridad de las promesas que te anunciamos en la lección «Promesas».

[[exercise:09-listener-async.md-(script.js)]]

```text
Listo: pulsa los dos «Pagar»
// Tras pulsar «Pagar» en el formulario 🐛:
🐛 compruebo el cupón…
Form submitted (navigation blocked in preview): GET /pagar?coupon=VERANO10 {coupon: 'VERANO10'}
🐛 preventDefault() tras el await → defaultPrevented: true, pero el formulario ya se envió
🛟 unhandledrejection → tarjeta **** 0002 rechazada ($576.00)
Uncaught (in promise) Error: tarjeta **** 0002 rechazada ($576.00)
// Tras pulsar «Pagar» en el formulario ✅:
✅ atrapado → tarjeta **** 0002 rechazada ($576.00): lo muestro junto al formulario
```

La línea `Form submitted…` la escribe la vista previa de LearnWeb cuando un formulario se envía sin `preventDefault()`: es la prueba de que el envío ocurrió antes del `await`. En una página normal, el navegador habría cargado `/pagar` y el resto de la función ni se habría ejecutado. La regla: todo lo que dependa del evento (`preventDefault()`, `currentTarget`, `stopPropagation()`) va **antes** del primer `await`, y el trabajo asíncrono, dentro de un `try/catch`. Igual que con `error`, los listeners de `unhandledrejection` se ejecutan antes del mensaje `Uncaught (in promise)`, y `event.preventDefault()` en uno de ellos lo hace desaparecer.

## Componentes que se comunican

Con todo junto sale una arquitectura muy usada: cada componente es una función (o una clase) que recibe su elemento raíz, escucha y despacha eventos, y **no conoce** a los demás. La lista de productos avisa con `cart:add`; el minicarrito escucha ese aviso, actualiza su estado y avisa con `cart:change`; el aviso visual escucha `cart:change`. Un monitor en la fase de captura, en `document`, ve pasar todos los eventos, una técnica de depuración muy útil:

[[exercise:10-componentes-que-se-comunican.md]]

[[exercise:10-componentes-que-se-comunican.md-(script.js)]]

```text
Listo: añade el café y la vainilla; luego pulsa «Vaciar»
// Tras añadir el café:
📡 cart:add · desde #product-list · {"sku":"CAF-500","name":"Café de Chiapas","price":210}
📡 cart:change · desde #mini-cart · {"count":1,"total":210}
// Tras añadir la vainilla:
📡 cart:add · desde #product-list · {"sku":"VAI-001","name":"Vainilla de Papantla","price":98.5}
📡 cart:change · desde #mini-cart · {"count":2,"total":308.5}
// Tras pulsar «Vaciar»:
📡 cart:change · desde #mini-cart · {"count":0,"total":0}
```

La regla habitual en las librerías de componentes es **datos hacia abajo, eventos hacia arriba**: quien contiene a un componente le pasa datos (propiedades, llamadas a métodos), y el componente avisa de lo que pasa con eventos que suben, sin decidir quién reacciona. En el módulo «APIs modernas del navegador» verás los Web Components, que encapsulan su HTML en un Shadow DOM: allí, un evento propio solo sale del componente si lleva `composed: true`. Y en el capítulo de TypeScript aprenderás a declarar qué `detail` lleva cada evento para que el editor lo compruebe.

Un último evento global, para cuando lo necesites: `visibilitychange` en `document` avisa cuando la pestaña se oculta o vuelve a verse (lo verás en el módulo «APIs modernas del navegador»), y es la forma correcta de pausar animaciones y sondeos en segundo plano.

## Bestiario

- **El antepasado no recibe mi evento.**
  Síntoma: un listener en `document` (o en un contenedor) nunca recibe el evento propio que despacha un hijo.
  Causa: `new Event` y `new CustomEvent` crean eventos con `bubbles: false`.
  Solución: `new CustomEvent(tipo, { bubbles: true, detail })`.
  → [ver ejemplo](02-customevent-no-burbujea.md)
- **Los listeners ven el estado anterior.**
  Síntoma: los listeners de un evento propio leen datos que aún no se han actualizado.
  Causa: `dispatchEvent` es síncrono: ejecuta los listeners en el acto, antes de la línea siguiente.
  Solución: actualiza el estado y después despacha el evento.
  → [ver ejemplo](03-dispatchevent-es-sincrono.md)
- **El orden cambia entre un clic real y `click()`.**
  Síntoma: las microtareas programadas por los listeners salen intercaladas con un clic real y todas al final con `element.click()`.
  Causa: con un clic real, la pila se vacía después de cada listener; con `click()`, el script que llama sigue en la pila.
  Solución: no dependas de ese orden; en los tests, ten en cuenta que `click()` no reproduce el event loop real.
  → [ver ejemplo](04-microtareas-entre-listeners.md)
- **El clic simulado no puede abrir la pantalla completa.**
  Síntoma: una acción funciona al pulsar el botón, pero falla (promesa rechazada, ventana bloqueada) si un script lo «pulsa».
  Causa: un evento simulado tiene `isTrusted: false` y no es un gesto del usuario, que esas APIs exigen.
  Solución: llama a esas APIs dentro de un listener de un evento real; no las automatices al cargar.
  → [ver ejemplo](05-istrusted-y-gesto-del-usuario.md)
- **El `try/catch` no atrapa el error del listener.**
  Síntoma: un listener lanza un error, sale `Uncaught Error` en la consola y el `catch` que rodea a `dispatchEvent` no se ejecuta.
  Causa: `dispatchEvent` atrapa los errores de cada listener, los informa a `window` (`error`) y continúa.
  Solución: atrapa los errores dentro del propio listener; usa el evento `error` de `window` solo como registro global.
  → [ver ejemplo](08-trycatch-no-atrapa-al-listener.md)
- **`preventDefault()` no funciona en un listener `async`.**
  Síntoma: el formulario se envía (o el enlace navega) aunque el listener llama a `preventDefault()`; los errores salen como `Uncaught (in promise)`.
  Causa: el navegador no espera a la promesa del listener; tras el primer `await`, el evento ya terminó.
  Solución: `preventDefault()` (y todo lo que dependa del evento) antes del primer `await`; el trabajo asíncrono, en un `try/catch`.
  → [ver ejemplo](09-listener-async.md)

## Resumen

- `new CustomEvent(tipo, { bubbles, cancelable, detail })` + `dispatchEvent` usan el mismo mecanismo que los eventos del navegador.
- Tus eventos no burbujean ni se cancelan si no lo pides; usa nombres con prefijo propio.
- `dispatchEvent` es síncrono: primero cambia el estado, luego avisa.
- Los eventos simulados (`click()`, `dispatchEvent`) tienen `isTrusted: false`, no son un gesto del usuario y no reproducen el reparto de microtareas de un clic real.
- Con `cancelable: true`, `dispatchEvent` devuelve `false` si alguien canceló: así se pide permiso.
- `class X extends EventTarget` convierte cualquier objeto en emisor, con `once` y `signal` incluidos.
- Los errores de los listeners no llegan a quien despacha: van al evento `error` de `window`; los rechazos sin manejar, a `unhandledrejection`.
- En un listener `async`, todo lo que dependa del evento va antes del primer `await`.

## Para profundizar

- [MDN: crear y disparar eventos](https://developer.mozilla.org/es/docs/Web/Events/Creating_and_triggering_events)
- [javascript.info: eventos personalizados](https://es.javascript.info/dispatch-events)
- [MDN: EventTarget](https://developer.mozilla.org/es/docs/Web/API/EventTarget)
- [MDN: evento unhandledrejection](https://developer.mozilla.org/es/docs/Web/API/Window/unhandledrejection_event)
- [Jake Archibald: Tasks, microtasks, queues and schedules (en inglés)](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
