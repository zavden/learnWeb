# Escuchar eventos

## Por qué importa

Hasta ahora, tus scripts se ejecutaban de arriba abajo y terminaban. Una página de verdad, en cambio, pasa casi todo su tiempo **esperando**: a que el usuario pulse un botón, escriba en un campo, mueva el ratón o cambie el tamaño de la ventana. Los **eventos** son la forma en que el navegador avisa a tu código de que ha pasado algo, y `addEventListener` es la forma de decirle qué hacer cuando pase.

Llevas todo el capítulo 5 viendo `addEventListener` en los ejemplos con un comentario de «capítulo 6». Esta lección lo explica entero: qué recibe tu función, qué vale `this` dentro de ella, cómo dejar de escuchar (y por qué a veces no funciona), y por qué `onclick =` es una trampa. Son los errores que más tiempo hacen perder en las primeras páginas interactivas.

## Qué es un evento

Un **evento** es un objeto que el navegador crea cuando ocurre algo y que **entrega** (*dispatch*) a un **objetivo** (*target*): el botón que se pulsó, el campo donde se escribió, la ventana que cambió de tamaño. Si alguien está **escuchando** ese tipo de evento en ese objetivo, el navegador llama a su función, el **listener** (u *oyente*, o *manejador*).

Los eventos del usuario entran por el event loop que estudiaste en el módulo «Asincronía y event loop»: cada clic o pulsación es una **tarea** que espera en la cola hasta que la pila está vacía. Por eso un script largo deja los clics «en espera», y por eso tu listener nunca interrumpe a otro código a medias.

Hay cientos de tipos de evento. Los que más usarás, y dónde se estudian:

| Familia | Eventos | Dónde |
|---------|---------|-------|
| Ratón y puntero | `click`, `dblclick`, `contextmenu`, `pointerdown`, `pointermove`, `pointerup`, `mouseover` | «Teclado, ratón y puntero» |
| Teclado | `keydown`, `keyup` | «Teclado, ratón y puntero» |
| Foco | `focus`, `blur`, `focusin`, `focusout` | «Propagación» |
| Formularios | `input`, `change`, `submit`, `reset` | «Acciones por defecto» y el módulo «Formularios con JavaScript» |
| Documento y ventana | `DOMContentLoaded`, `load`, `resize`, `scroll`, `visibilitychange` | esta lección, «Acciones por defecto» y el módulo «APIs modernas del navegador» |
| Errores | `error`, `unhandledrejection` | «Eventos personalizados» |
| Los tuyos | `cart:add`, `tab:change`… | «Eventos personalizados» |

`DOMContentLoaded` (el HTML ya está leído) y `load` (también las imágenes y los estilos) los viste en la lección «El parser de HTML». En LearnWeb el script del ejemplo va al final del `<body>`, así que cuando se ejecuta el HTML ya existe y no necesitas esperar a ninguno de los dos.

## `addEventListener`

`elemento.addEventListener(tipo, listener, opciones)` apunta la función `listener` para que el navegador la llame **cada vez** que llegue un evento de ese `tipo` a ese elemento. El tipo es un string en minúsculas, sin el `on` delante: `'click'`, no `'onclick'` ni `'Click'`.

```js
const addButton = document.querySelector('#add-to-cart');
addButton.addEventListener('click', addToCart); // la función, sin paréntesis
```

Fíjate en lo que **no** pasa: `addToCart` no se ejecuta en esa línea. El script termina, y la función espera guardada hasta que alguien pulsa el botón. Pruébalo con el ratón y también con el teclado (Tab hasta el botón y Enter): un `<button>` convierte Enter y Espacio en un `click`, así que un solo listener sirve para los dos.

[[exercise:01-primer-listener.md]]

[[exercise:01-primer-listener.md-(script.js)]]

```text
Listo: pulsa «Añadir al carrito» (con el ratón, o con Tab y Enter)
// Tras hacer clic dos veces en «Añadir al carrito»:
🛒 clic → 1 en el carrito
🛒 clic → 2 en el carrito
```

Los ejemplos de este módulo escriben cada paso en la consola **y** en una lista de la propia página, para que veas el resultado también en las tarjetas. Cada uno imprime al cargar una línea `Listo: …` que te dice qué hacer; los bloques de salida muestran después lo que aparece tras cada interacción.

> **Desde Python:** en Tkinter, `button.bind('<Button-1>', add_to_cart)` es la misma idea: registras una función que el bucle de la interfaz llamará con un objeto evento. Y, como en Tkinter, tu programa no «espera» en ninguna línea: el bucle (`root.mainloop()` allí, el event loop del navegador aquí) es quien llama.

## El objeto evento

El navegador llama al listener con **un argumento**: el objeto evento, que describe lo que ha pasado. Por convención se llama `event` (verás también `e` o `evt`). Gracias a él, una misma función puede atender a muchos elementos:

[[exercise:02-el-objeto-evento.md-(script.js)]]

```text
Listo: pulsa «♥ Me gusta» o «🔖 Guardar»
// Tras pulsar «🔖 Guardar»:
type → click
target.id → save
currentTarget.id → save
isTrusted (lo hizo el usuario) → true
timeStamp ≤ performance.now() → true
instanceof MouseEvent → true
```

| Propiedad | Qué es |
|-----------|--------|
| `type` | el tipo: `'click'`, `'keydown'`… |
| `target` | el elemento donde **ocurrió** el evento (el más interno) |
| `currentTarget` | el elemento cuyo listener se está ejecutando **ahora** |
| `eventPhase` | en qué fase va el viaje del evento: 1 captura, 2 objetivo, 3 burbuja |
| `isTrusted` | `true` si lo generó el navegador por una acción real; `false` si lo creó un script |
| `timeStamp` | cuándo se creó, en ms desde que se abrió la página (el reloj de `performance.now()`) |
| `bubbles`, `cancelable` | si sube por los antepasados y si se puede cancelar su acción por defecto |

Aquí `target` y `currentTarget` coinciden porque el botón solo tiene texto. En la lección «Propagación» verás que no siempre es así, y por qué esa diferencia causa uno de los errores más comunes. Cada familia de eventos tiene su clase con propiedades propias: los clics son `MouseEvent` (en Chrome, su subclase `PointerEvent`) con la posición del ratón; las teclas, `KeyboardEvent` con `key` y `code`.

Un consejo para todo el módulo: nunca imprimas el evento entero para comprobar algo. Sus valores (posición, instante…) cambian en cada clic y en cada ordenador; imprime las propiedades que te interesan.

## Pasa la función, no la llames

El error más frecuente de las primeras páginas es escribir paréntesis donde no van. Con `addEventListener('click', addToCart('Café'))`, JavaScript evalúa primero los argumentos: **ejecuta** `addToCart('Café')` en ese momento, sin ningún clic, y le pasa a `addEventListener` lo que devuelve, `undefined`. Y el navegador ignora un listener `undefined` **sin avisar**: el botón se queda muerto y la consola, vacía.

[[exercise:06-llamar-en-vez-de-pasar.md-(script.js)]]

```text
Registrando los listeners…
🛒 añadido: Café de Chiapas (total: 1)
Listo: ya hay 1 en el carrito sin haber pulsado nada. Pulsa los dos botones
// Tras pulsar «Añadir café (🐛)»: nada
// Tras pulsar «Añadir mole (✅)»:
🛒 añadido: Mole poblano (total: 2)
```

Es el «llamar en vez de pasar» de la lección «Formas de función». Para pasar argumentos, registra una función que haga la llamada: `() => addToCart('Mole poblano')`.

## `this` dentro de un listener

Cuando el listener es una función normal (`function` o un método), el navegador la llama con `this` igual al elemento que escucha, `event.currentTarget`. Una flecha, en cambio, no tiene `this` propio y usa el de donde se escribió. Es la regla de la lección «La palabra clave this», y tiene la consecuencia que se anunció en la lección «Clases»: si pasas un **método** tal cual (`button.addEventListener('click', this.addLike)`), dentro de él `this` ya no es tu objeto, sino el botón.

[[exercise:07-this-en-un-listener.md-(script.js)]]

```text
Listo: pulsa cada ♥ dos veces
// Tras pulsar dos veces el ♥ de Tulum (🐛):
🐛 this → HTMLButtonElement · likes: NaN
🐛 this → HTMLButtonElement · likes: NaN
// Tras pulsar dos veces el ♥ del volcán (campo flecha):
✅ this → ArrowLikes · likes: 1
✅ this → ArrowLikes · likes: 2
// Tras pulsar dos veces el ♥ del cenote (handleEvent):
✅ this → HandlerLikes · likes: 1 · click
✅ this → HandlerLikes · likes: 2 · click
```

`this.likes += 1` sobre el botón crea una propiedad `likes` en el elemento: `undefined + 1` es `NaN`. No hay error, solo un contador roto. Las soluciones:

- Un **campo flecha** en la clase (`addLike = () => { … }`), como en el ejemplo.
- Una flecha que llama al método: `button.addEventListener('click', () => this.addLike())`.
- Un objeto con un método **`handleEvent`**: `addEventListener` acepta también un objeto, y entonces llama a `objeto.handleEvent(event)`, con `this` igual al objeto. Es poco conocido y muy útil para componentes que escuchan muchos eventos: un solo `handleEvent` con un `switch (event.type)`.
- `bind`, guardando el resultado en una propiedad si después vas a quitar el listener (enseguida verás por qué).

Si no necesitas `this`, no dependas de él: `event.currentTarget` es siempre el elemento que escucha, sea cual sea la forma de la función.

## Dejar de escuchar

Un listener vive mientras viva el elemento, o hasta que lo quites. Hay tres formas de quitarlo:

- **`removeEventListener(tipo, función)`**, con la **misma** función que registraste.
- La opción **`{ once: true }`**: el navegador lo quita solo después de la primera llamada.
- La opción **`{ signal }`**: lo quita cuando se aborta esa señal (lo verás al final de la sección).

[[exercise:03-dejar-de-escuchar.md-(script.js)]]

```text
Listo: pulsa cada botón DOS veces
// Tras pulsar «Aplicar cupón BIENVENIDA» dos veces:
🏷️ cupón aplicado: 10 %
   (clic en #coupon)
   (clic en #coupon)
// Tras pulsar «🎁 Reclamar muestra gratis» dos veces:
🎁 muestra añadida
   (clic en #gift)
   (clic en #gift)
```

El listener que hace de testigo demuestra que el segundo clic llega; lo que ya no existe es el listener del cupón. Ten en cuenta que `once` cuenta **llamadas**, no éxitos: si el cupón pudiera fallar y quisieras reintentarlo, `removeEventListener` tras el éxito es lo correcto.

### Una flecha nueva no quita nada

`removeEventListener` busca la función que registraste **por identidad** (`===`), igual que el `off` del `EventEmitter` de la lección «Patrones de diseño». Una flecha escrita en el sitio es una función nueva, aunque el texto sea idéntico, y `bind` crea una función nueva cada vez que se evalúa. `removeEventListener` no encuentra nada, no quita nada y no avisa:

[[exercise:04-quitar-una-funcion-anonima.md-(script.js)]]

```text
¿dos flechas iguales son la misma función? → false
¿dos bind son la misma función? → false
Listo: pulsa «Guardar borrador»
// Tras pulsar «Guardar borrador»:
🐛 flecha → sigo aquí
🐛 bind → «Carta a Lucía» guardado
```

Es el problema que te anunciamos en la lección «Closures» y en la de patrones: si vas a quitar un listener, guarda la función en una variable (o en una propiedad, como `this.onSave = this.save.bind(this)`) y usa **esa** para registrar y para quitar. O usa `signal`, que no necesita la función.

### Y tiene que coincidir la fase

La «clave» de un listener no es solo la función: es el trío **tipo + función + `capture`**. La opción `capture` (lección siguiente) decide en qué fase del viaje escucha. Si registras con `{ capture: true }` y quitas sin ella, `removeEventListener` busca un listener de la otra fase y, otra vez, no quita nada:

[[exercise:05-quitar-con-capture-distinto.md-(script.js)]]

```text
Listo: pulsa «Comprar» o «Ver la carta»
// Tras pulsar «Comprar»:
🐛 analítica A (no se quitó) → clic en #buy
```

`once` y `passive` no cuentan para encontrar el listener; solo `capture`. Por la misma razón, puedes registrar la misma función dos veces si es en fases distintas.

### Un solo `abort()` para muchos listeners

En el módulo «Asincronía y event loop» viste `AbortController` para cancelar operaciones, y se te prometió que `addEventListener` también acepta su señal. Con `{ signal }`, todos los listeners que comparten una señal se quitan con un solo `controller.abort()`, estén en el elemento que estén. Quien termina no necesita saber qué funciones se registraron ni con qué opciones:

[[exercise:10-signal-quita-varios.md-(script.js)]]

```text
➡️ paso 1
Listo: pulsa «Siguiente», luego «Terminar el tour» y vuelve a probar «Siguiente»
// Tras pulsar «Siguiente» (o la tecla →, con el foco en la vista previa):
➡️ paso 2
// Tras pulsar «Terminar el tour»:
⏹️ abort(): fuera los 3 listeners; «Siguiente» y → ya no hacen nada
// Tras pulsar «Repetir el tour»:
➡️ paso 1
```

Es el patrón de cualquier componente que se abre y se cierra (un tour, un modal, un menú, un modo de edición): al abrirse crea un `AbortController`, registra con su señal todo lo que necesita (también en `document` y `window`) y al cerrarse llama a `abort()`. Una señal abortada lo está para siempre: para volver a empezar hace falta un controlador nuevo. Y si pasas una señal **ya** abortada, `addEventListener` ni siquiera registra el listener.

## Registrar dos veces

Si registras **la misma** función, para el mismo tipo y la misma fase, dos veces, el navegador la guarda una sola vez: el segundo `addEventListener` no hace nada. Eso protege a las funciones con nombre, pero no a las flechas escritas dentro de una función que se ejecuta muchas veces, como la que vuelve a pintar una lista:

[[exercise:08-el-mismo-listener-dos-veces.md-(script.js)]]

```text
Listo: pulsa cada botón una vez
// Tras pulsar «Actualizar (🐛 flecha)»:
🐛 petición 1: precios de 3 productos
🐛 petición 2: precios de 3 productos
🐛 petición 3: precios de 3 productos
// Tras pulsar «Actualizar (✅ con nombre)»:
✅ petición 4: precios de 3 productos
```

El síntoma típico es «cada vez que abro el panel, el botón hace una cosa más»: dos peticiones, luego tres, luego cuatro. La solución de fondo es registrar los listeners **una vez**, fuera del código que pinta; en la lección «Delegación» verás cómo escuchar una lista entera desde su contenedor.

## `onclick` y los atributos `on…`

Antes de `addEventListener`, los manejadores se ponían de otras dos maneras que todavía verás en código antiguo y en tutoriales: el **atributo** `onclick="…"` del HTML y la **propiedad** `elemento.onclick = función`. Las dos comparten un único hueco por elemento y tipo, así que asignar uno **sustituye** al anterior sin avisar:

[[exercise:09-onclick-pisa-al-anterior.md-(index.html|script.js)]]

```text
typeof checkout.onclick → function
el atributo sigue en el HTML → logLine('1. atributo onclick del HTML')
Listo: pulsa «Pagar»
// Tras pulsar «Pagar»:
3. onclick = pago
✅ addEventListener: analítica
✅ addEventListener: pago
```

En una página con varias partes (tu código, un widget de chat, la analítica), cualquiera que asigne `onclick` borra el trabajo de los demás. `addEventListener` acumula: cada parte añade su listener, sin pisar a nadie. Además, el texto de un atributo `on…` se ejecuta en el ámbito global, así que no ve las funciones de un módulo: lo viste en la lección «Módulos ES» (ejemplo 05, «Un onclick no ve las funciones del módulo»), donde te prometimos esta lección. La regla: **`addEventListener` siempre**, y nada de JavaScript dentro del HTML.

Un matiz que quedó pendiente en la lección «El event loop»: en un `MessagePort`, asignar `port.onmessage` hace dos cosas, registrar el manejador y **activar** el puerto. Con `port.addEventListener('message', fn)` los mensajes no llegan hasta que llamas a `port.start()`. Es una rareza de esa API; en los elementos de la página no existe.

> **Desde Python:** Tkinter tiene las dos ideas. `tk.Button(command=pagar)` guarda **una** función, como `onclick`; y `button.bind('<Button-1>', f)` **sustituye** a lo que hubiera, salvo que pidas `add='+'`, que acumula como `addEventListener`. `bind` devuelve un identificador para `unbind`; en el navegador, la «clave» para quitar es la propia función.

```python
funcid = button.bind('<Button-1>', track_click)        # registra
button.bind('<Button-1>', go_to_checkout, add='+')      # acumula (como addEventListener)
button.bind('<Button-1>', go_to_checkout)               # sin add='+': sustituye (como onclick)
button.unbind('<Button-1>', funcid)                     # quita
```

## Las opciones, de un vistazo

El tercer argumento de `addEventListener` es un objeto de opciones (o, en código antiguo, un booleano que equivale a `{ capture: booleano }`):

| Opción | Qué hace | Dónde |
|--------|----------|-------|
| `capture: true` | escucha en la fase de captura, al bajar hacia el objetivo | «Propagación» |
| `once: true` | se quita sola después de la primera llamada | esta lección |
| `signal` | se quita cuando se aborta esa `AbortSignal` | esta lección |
| `passive: true` | promete que no llamará a `preventDefault()` (el navegador puede hacer *scroll* sin esperarla) | «Acciones por defecto» |

## Bestiario

- **El botón no hace nada (y se ejecutó al cargar).**
  Síntoma: el listener se ejecuta una vez al cargar la página y nunca más; la consola no muestra errores.
  Causa: `addEventListener('click', fn())` llama a `fn` en ese momento y registra lo que devuelve (`undefined`), que el navegador ignora en silencio.
  Solución: pasa la función sin paréntesis; para pasar argumentos, `() => fn(arg)`.
  → [ver ejemplo](06-llamar-en-vez-de-pasar.md)
- **`this` es el botón, no mi objeto.**
  Síntoma: dentro de un método usado como listener, `this.algo` es `undefined` y los contadores salen `NaN`.
  Causa: el navegador llama a los listeners con `this` igual a `event.currentTarget`; el método pierde su instancia.
  Solución: un campo flecha, una flecha que llame al método, un objeto con `handleEvent`, o `event.currentTarget` en vez de `this`.
  → [ver ejemplo](07-this-en-un-listener.md)
- **`removeEventListener` no quita nada.**
  Síntoma: tras quitar el listener, sigue respondiendo; al volver a añadirlo, responde dos veces.
  Causa: se quitó con una flecha escrita en el sitio o con otro `bind`, que son funciones distintas de la registrada.
  Solución: guarda la función en una variable y usa esa; o registra con `{ signal }` y llama a `abort()`.
  → [ver ejemplo](04-quitar-una-funcion-anonima.md)
- **`removeEventListener` no quita un listener de captura.**
  Síntoma: un listener registrado con `{ capture: true }` sigue respondiendo tras quitarlo.
  Causa: la clave de un listener incluye la fase; sin `capture`, se busca otro listener.
  Solución: quita con la misma opción, `removeEventListener(tipo, fn, { capture: true })` o `true`.
  → [ver ejemplo](05-quitar-con-capture-distinto.md)
- **Cada clic hace la acción varias veces.**
  Síntoma: un botón ejecuta su acción dos, tres, cuatro veces, y cada vez más.
  Causa: una función que se ejecuta muchas veces (un render) registra cada vez una flecha nueva.
  Solución: registra los listeners una sola vez, o con funciones con nombre (las repetidas se ignoran), o usa delegación.
  → [ver ejemplo](08-el-mismo-listener-dos-veces.md)
- **Mi `onclick` dejó de funcionar.**
  Síntoma: un manejador `onclick` (atributo o propiedad) ya no se ejecuta, sin ningún error.
  Causa: otra asignación a `onclick` lo sustituyó: solo hay un hueco por elemento y tipo.
  Solución: usa `addEventListener`, que acumula listeners independientes.
  → [ver ejemplo](09-onclick-pisa-al-anterior.md)

## Resumen

- Un evento es un objeto que el navegador entrega a un objetivo; los listeners registrados para ese tipo se ejecutan, cada uno como parte de una tarea del event loop.
- `addEventListener(tipo, función, opciones)`: pasa la función sin paréntesis; el tipo va sin `on`.
- El listener recibe el objeto evento: `type`, `target` (dónde ocurrió), `currentTarget` (quién escucha), `isTrusted`, `timeStamp`.
- Dentro de un listener `function`, `this` es `currentTarget`; las flechas usan el `this` de fuera; los métodos pasados tal cual pierden su instancia.
- Para quitar un listener hace falta la **misma** función y la **misma** fase; `once` y `signal` evitan tener que guardarla.
- La misma función registrada dos veces cuenta una; una flecha nueva en cada render se acumula.
- `onclick` (atributo o propiedad) guarda un único manejador y se pisa; usa `addEventListener`.

## Para profundizar

- [MDN: EventTarget.addEventListener()](https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener)
- [MDN: Introducción a los eventos](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Scripting/Events)
- [javascript.info: introducción a los eventos del navegador](https://es.javascript.info/introduction-browser-events)
- [DOM Standard: eventos (en inglés)](https://dom.spec.whatwg.org/#events)
