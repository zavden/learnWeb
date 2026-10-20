# La Web Animations API

## Por qué importa

Hasta aquí tenías dos maneras de animar. Las **animaciones y transiciones de CSS** (módulo «Transiciones y animaciones» del capítulo de CSS) son declarativas y eficientes: el navegador puede llevarlas en el compositor, aunque JavaScript esté ocupado. Pero desde JavaScript son casi opacas: para pausarlas o saber cuándo terminan hay que cambiar clases y escuchar eventos. Los **bucles de `requestAnimationFrame`** (lección anterior) lo controlan todo, pero corren en el hilo principal y hay que escribirlo todo.

La **Web Animations API** es el motor que hay debajo de las animaciones de CSS, abierto a JavaScript. `element.animate()` crea una animación con los mismos fotogramas que un `@keyframes`, que el navegador ejecuta igual que una de CSS (en el compositor, si anima `transform` u `opacity`), y te devuelve un objeto para controlarla como un reproductor: pausar, saltar a un instante, cambiar la velocidad, esperar a que termine con una promesa. Esta lección cumple varias promesas del curso: la promesa `animation.finished` de la lección de animation frames, `getAnimations()` del ejercicio del anillo de descarga, la técnica FLIP de la lección de rendimiento y las promesas de las View Transitions de la lección «Animaciones modernas».

## `element.animate()`

`element.animate(fotogramas, opciones)` tiene las dos partes de una animación de CSS: los fotogramas del `@keyframes` y las propiedades `animation-*`. Los fotogramas se escriben como una lista de objetos (un estado por fotograma, repartidos a partes iguales salvo que les des un `offset` entre 0 y 1) o, más corto, como un objeto con una lista por propiedad:

```js
// Lo mismo, de dos formas
el.animate([{ opacity: 0, translate: '0 20px' }, { opacity: 1, translate: '0 0' }], 300);
el.animate({ opacity: [0, 1], translate: ['0 20px', '0 0'] }, 300);
```

Las opciones se parecen a las de CSS, con algunas diferencias que conviene memorizar:

| CSS | `animate()` | Ojo |
|---|---|---|
| `animation-duration: 1s` | `duration: 1000` | en **milisegundos** (un número solo como segundo argumento es la duración) |
| `animation-timing-function` | `easing` | por defecto **`'linear'`**, no `ease` |
| `animation-iteration-count: infinite` | `iterations: Infinity` | |
| `animation-delay`, `-direction`, `-fill-mode` | `delay`, `direction`, `fill` | `fill` por defecto `'none'` |
| `background-color` en los fotogramas | `backgroundColor` | camelCase, como en `element.style` |

La animación empieza en el momento y `animate()` devuelve un objeto `Animation`. Como con las animaciones de CSS, los valores intermedios se pueden comprobar **congelando** un fotograma: en lugar del retardo negativo de la lección de keyframes, `pause()` y `currentTime`.

[[exercise:01-element-animate.md]]

[[exercise:01-element-animate.md-(script.js)]]

```text
animate() devuelve → Animation · playState: running
congelado en 500 ms → translate: 120px · opacity: 0.5
progreso → 0.5
Listo: pulsa «Reproducir»
// Tras pulsar «Reproducir»:
▶ reproduciendo
```

Con `easing: 'linear'`, a la mitad del tiempo hay la mitad del recorrido: 120 de 240 px. Con otra curva, el valor sería otro (por ejemplo, con `ease`, más de la mitad), igual que en las animaciones de CSS.

## Un reproductor: el objeto `Animation`

El objeto `Animation` tiene los controles de un reproductor y dice en qué estado está con `playState`:

| `playState` | Cuándo |
|---|---|
| `'running'` | en marcha (también justo después de `animate()` o `play()`) |
| `'paused'` | tras `pause()`, o tras darle un `currentTime` a una animación parada |
| `'finished'` | llegó al final (o al principio, si va al revés) |
| `'idle'` | cancelada, o creada sin arrancar: sin efecto sobre el elemento y `currentTime` `null` |

`play()`, `pause()`, `finish()` (salta al final) y `cancel()` (quita la animación y su efecto) cambian el estado; `reverse()` invierte el sentido. `currentTime` lee y escribe el instante, en milisegundos: con él, una barra de tipo `range` se convierte en el control de una animación. La velocidad es `playbackRate` (2 = el doble, −1 = al revés).

[[exercise:02-controlar-la-reproduccion.md]]

[[exercise:02-controlar-la-reproduccion.md-(script.js)]]

```text
pause() → paused · currentTime 0 ms · ×1
finish() → finished · currentTime 8000 ms · ×1
cancel() → idle · currentTime null · ×1
currentTime = 0 → paused · currentTime 0 ms · ×1
Listo: pulsa ▶ Play y prueba los demás botones
// Tras pulsar ▶ Play, ×2 y ⏸ Pausa (los milisegundos varían):
▶ Play → running · currentTime 0 ms · ×1
×2 → running · currentTime 1500 ms · ×1
⏸ Pausa → paused · currentTime 2600 ms · ×2
```

Para cambiar la velocidad de una animación en marcha, usa `updatePlaybackRate(2)` y no `playbackRate = 2`. La asignación cambia la velocidad de golpe y puede dar un pequeño salto si la animación corre en el compositor (que va un frame por delante). `updatePlaybackRate` se coordina con él y aplica la velocidad nueva en el siguiente frame: por eso, justo después de pulsar «×2», `playbackRate` todavía dice 1.

## Esperar a que termine: `finished`

`animation.finished` es una **promesa** que se cumple cuando la animación termina, con la propia animación como valor. Es lo que la lección «Frames de animación y tiempo» construyó a mano alrededor de un bucle de rAF, ya de serie: una secuencia de animaciones se escribe como una función `async` con un `await` por paso.

[[exercise:03-esperar-finished.md]]

[[exercise:03-esperar-finished.md-(script.js)]]

```text
justo después de finish() → la promesa aún no ha avisado (microtarea)
Listo: pulsa «Añadir al carrito»
finished se cumple con la animación → true · finished
// Tras pulsar «Añadir al carrito»:
1. la taza vuela al carrito
2. el contador sube
3. listo: la taza está en el carrito
```

Para esperar a todas las animaciones de un elemento, sean de CSS o de JavaScript: `await Promise.all(el.getAnimations().map((a) => a.finished))`. Con «reducir movimiento», el ejemplo cambia el vuelo por un parpadeo: la secuencia y sus esperas son las mismas, y por eso conviene que las animaciones «reducidas» sigan existiendo (cortas, sin desplazamiento) en lugar de desaparecer.

### `cancel()` rechaza la promesa

Si la animación se **cancela** (con `cancel()`, o porque el elemento se quita de la página, o porque otra parte del código cancela todas las animaciones), `finished` no se cumple: se **rechaza** con un `DOMException` llamado `AbortError`. Un `await` sin `try/catch` convierte ese rechazo en una excepción que corta la función (lo que venía después no se ejecuta) y acaba en la consola como error sin capturar:

[[exercise:04-cancel-rechaza-finished.md]]

[[exercise:04-cancel-rechaza-finished.md-(script.js)]]

```text
¿finished es otra promesa tras cancel()? → true
✅ capturado → AbortError: The user aborted a request.
✅ aviso oculto
Uncaught (in promise) AbortError: The user aborted a request.
```

El mensaje es genérico (el mismo que el de un `fetch` cancelado); lo que importa es el nombre, `AbortError`. La solución es la de la lección «Combinadores y cancelación»: capturar el error, dejar pasar el `AbortError` (cancelar es algo esperado) y volver a lanzar cualquier otro. Y fíjate en la primera línea: tras `cancel()`, `finished` es una promesa **nueva**, que se cumplirá si la animación se vuelve a reproducir; la anterior se queda rechazada.

## Lo que queda al terminar: `fill`

En la lección de keyframes viste que, con `animation-fill-mode: forwards`, el último fotograma «sigue ganando en la cascada mientras la animación exista». Con `animate()` pasa lo mismo, y es más fácil caer: una animación con `fill: 'forwards'` no desaparece al terminar. Se queda en estado `finished`, aplicando su último fotograma por encima de los estilos del elemento, incluido el atributo `style`. Cualquier cambio posterior de esa propiedad desde JavaScript no se ve:

[[exercise:05-fill-forwards-se-queda.md]]

[[exercise:05-fill-forwards-se-queda.md-(script.js)]]

```text
🐛 style.opacity = 1 → se ve 0.2 · la animación sigue: finished, 1 en el elemento
✅ estilo final → al terminar se ve 0.2
✅ style.opacity = 1 → se ve 1
✅ commitStyles() → style.opacity = 0.2 · animaciones: 0
✅ style.opacity = 1 → se ve 1
```

Dos soluciones. La más limpia: el **estado final va en el estilo** (una clase o `style`) y la animación, sin `fill`, solo dibuja el camino hasta él; cuando termina, desaparece y deja el estilo, que ya tenía el valor final. La otra, cuando el valor final se calcula durante la animación: `commitStyles()` escribe en el atributo `style` los valores actuales de la animación, y `cancel()` la quita.

## Animaciones que se apilan

Un elemento puede tener varias animaciones a la vez, también de la misma propiedad. Se aplican en orden (las de CSS debajo, las de `animate()` encima, en el orden en que se crearon), y la opción **`composite`** decide cómo se combina cada una con lo que tiene debajo: `'replace'` (por defecto) la sustituye, `'add'` se suma y `'accumulate'` acumula (la diferencia se nota con `transform`: sobre `scale(2)`, una animación de `scale(1.5)` con `add` encadena las dos funciones, `scale(2) scale(1.5)`, ×3; con `accumulate` las combina en una, `scale(2.5)`). Con `'add'`, una pequeña sacudida se puede sumar a un movimiento que ya está en marcha sin interrumpirlo.

La otra cara del apilamiento es la memoria. Si cada clic crea una animación con `fill: 'forwards'` (mover una ficha, por ejemplo), las animaciones terminadas se irían acumulando para siempre. Para evitarlo, el navegador **elimina solo** las que han terminado, rellenan con `fill` y han quedado completamente tapadas por otras más nuevas: su `replaceState` pasa de `'active'` a `'removed'`. Si necesitas conservar una, `animation.persist()` la marca como `'persisted'`.

[[exercise:06-animaciones-que-se-apilan.md]]

[[exercise:06-animaciones-que-se-apilan.md-(script.js)]]

```text
composite 'replace' (por defecto) → translate 20px
composite 'add' → translate 120px
replaceState al crearla → active
Listo: pulsa «Mover la ficha» varias veces
// Tras pulsar «Mover la ficha» dos veces (sin marcar persist()):
casilla 1 → animaciones en la ficha: 1 · la primera: removed
casilla 2 → animaciones en la ficha: 1 · la primera: removed
// Tras marcar persist() y pulsar dos veces más:
casilla 3 → animaciones en la ficha: 1 · la primera: removed
casilla 4 → animaciones en la ficha: 2 · la primera: removed
```

La limpieza ocurre en el paso de animaciones de un frame, por eso el ejemplo espera un `requestAnimationFrame` antes de contar. Con `persist()`, cada movimiento persistente se queda: la ficha acumula una animación por clic (la de la casilla 2 no estaba marcada y sí se eliminó).

## Líneas de tiempo de scroll desde JavaScript

En la lección «Animaciones modernas» del capítulo de CSS, una animación cambiaba su reloj por el scroll con `animation-timeline: scroll()` o `view()`. Desde JavaScript, esas líneas de tiempo son objetos que se pasan en la opción `timeline` de `animate()` (en Chrome desde la versión 115; comprueba el resto de navegadores en caniuse.com):

- `new ScrollTimeline({ source: contenedor, axis: 'block' })`: el progreso del scroll de un contenedor.
- `new ViewTimeline({ subject: elemento, axis: 'block' })`: la posición de un elemento en el área visible de su contenedor de scroll. Los tramos de `animation-range` son las opciones `rangeStart` y `rangeEnd` (`'entry 0%'`, `'cover 50%'`…).

Sin la opción `duration`, la animación ocupa todo el recorrido (`'auto'`). Y el `currentTime` de una línea de tiempo de scroll no está en milisegundos: es un porcentaje, como objeto `CSSUnitValue` (`timeline.currentTime.value`).

[[exercise:07-scroll-timeline-desde-js.md]]

[[exercise:07-scroll-timeline-desde-js.md-(script.js)]]

```text
¿ScrollTimeline existe? → true
la barra usa el scroll → true · duración: auto
animaciones en la página → 7
Listo: desplaza el artículo (con la rueda o, tras Tab, con las flechas)
// Tras desplazar el artículo hasta el final:
scrollend → 100 %
```

¿Cuándo usar la versión de JavaScript? Cuando los elementos o los tramos se calculan en tiempo de ejecución, o cuando quieres controlar la animación (pausarla, leer su progreso). Para lo fijo, el CSS de aquella lección es más corto. El evento `scrollend` (Chrome 114+) avisa cuando el scroll se detiene.

## Todas las animaciones: `getAnimations()`

`document.getAnimations()` devuelve todas las animaciones activas de la página, y `element.getAnimations()` las de un elemento (con `{ subtree: true }`, también las de sus descendientes). Incluye las de CSS: cada `@keyframes` en marcha es un `CSSAnimation`, con su `animationName`, y cada transición un `CSSTransition`, con su `transitionProperty`. Son objetos `Animation` como los de `animate()`: se pueden pausar, saltar y esperar igual. El ejercicio del anillo de descarga del capítulo de CSS los usaba para leer la duración y congelar un fotograma.

[[exercise:08-getanimations.md]]

[[exercise:08-getanimations.md-(script.js)]]

```text
CSSTransition · transitionProperty: color
CSSAnimation · animationName: pulse
Animation · id: destello
Listo: pulsa «Pausar las animaciones»
// Tras pulsar «Pausar las animaciones» en los primeros segundos:
⏸ pausadas: paused, paused, paused
```

El orden es el de composición: primero las transiciones, después las animaciones de CSS y al final las de JavaScript. Un botón que pausa todo el movimiento de la página es una forma sencilla de cumplir la pauta WCAG 2.2.2 («Pausar, detener, ocultar»), que lo exige para cualquier movimiento automático que dure más de cinco segundos.

## FLIP: animar un cambio de layout

En la lección «Rendimiento de las animaciones» viste que animar la posición con `top` o `left` rehace el layout en cada frame. Pero ¿cómo se anima un cambio que **es** de layout, como reordenar una lista? La técnica **FLIP** lo convierte en una animación de `translate`:

1. **First**: mide dónde está cada elemento (`getBoundingClientRect()`).
2. **Last**: cambia el DOM de golpe (reordena) y mide dónde ha quedado. El layout se recalcula una sola vez.
3. **Invert**: calcula la diferencia: cuánto habría que desplazarlo para que pareciera seguir en su sitio de antes.
4. **Play**: anima `translate` de esa diferencia a `0`. El elemento «viaja» de su posición antigua a la nueva, y el navegador solo mueve capas.

[[exercise:09-flip.md]]

[[exercise:09-flip.md-(script.js)]]

```text
Listo: pulsa «Por precio» y luego «Por nombre»
// Tras pulsar «Por precio» y «Por nombre»:
Por precio: Echeveria, Biznaga, Nopal en maceta, Helecho de Boston, Limonero enano
Por nombre: Biznaga, Echeveria, Helecho de Boston, Limonero enano, Nopal en maceta
```

Pulsa los dos botones seguidos, sin esperar: la medida «First» incluye el `translate` de la animación que sigue en marcha, así que la nueva arranca desde donde se ve el elemento, sin saltos. Las View Transitions hacen lo mismo de forma automática (y con fotos, así que también funcionan cuando cambia el tamaño o el contenido); FLIP sigue siendo útil cuando quieres control fino o animar solo unos elementos.

## Las promesas de las View Transitions

`document.startViewTransition(callback)` (lección «Animaciones modernas») devuelve un objeto `ViewTransition` con tres promesas, en el orden en que se cumplen:

| Promesa | Se cumple cuando… | Para… |
|---|---|---|
| `updateCallbackDone` | tu función ya cambió el DOM | seguir con el estado nuevo (enfocar, anunciar) |
| `ready` | las fotos están hechas y los pseudoelementos `::view-transition-*` existen | animarlos tú con `animate()` (opción `pseudoElement`) |
| `finished` | la animación terminó y los pseudoelementos desaparecieron | lo que deba esperar al final |

`transition.skipTransition()` aplica el cambio sin fotos ni animación (por ejemplo, si el usuario pulsa otra vez antes de que termine): `ready` se **rechaza** con un `AbortError`, y `updateCallbackDone` y `finished` se cumplen igual. Es la otra cara del error de los nombres repetidos de aquella lección: si `ready` se rechaza, el cambio del DOM se ha hecho de todos modos.

[[exercise:10-promesas-de-view-transition.md]]

[[exercise:10-promesas-de-view-transition.md-(script.js)]]

```text
¿startViewTransition existe? → true
Listo: pulsa «Cambiar la vista»
// Tras pulsar «Cambiar la vista»:
1. callback: el DOM cambia
2. updateCallbackDone: el DOM ya cambió
3. ready: fotos hechas, empieza la animación
4. finished: la transición terminó
// Tras pulsar «Cambiar sin animación (skipTransition)»:
3. ready rechazada → AbortError: Transition was skipped. skipTransition() called
1. callback: el DOM cambia
2. updateCallbackDone: el DOM ya cambió
4. finished: la transición terminó
```

La función que cambia el DOM no se ejecuta al momento: el navegador espera a hacer la foto del estado actual (en el siguiente frame). Por eso «1. callback» llega después de que `ready` se rechace. Y si la página está oculta, la transición se salta sola: el ejemplo solo la lanza desde los botones.

```js
// Con ready, una animación propia sobre la foto nueva de toda la página
transition.ready.then(() => {
  document.documentElement.animate({ clipPath: ['circle(0% at 50% 50%)', 'circle(75% at 50% 50%)'] },
    { duration: 500, pseudoElement: '::view-transition-new(root)' });
});
```

## ¿CSS, Web Animations o `requestAnimationFrame`?

| Necesitas… | Usa |
|---|---|
| un estado de la interfaz que cambia (hover, abierto/cerrado, tema) | transiciones de CSS |
| una animación fija y declarativa (un cargador, una entrada) | `@keyframes` |
| controlarla desde JavaScript: pausar, saltar, velocidad, esperar el final | `element.animate()` |
| valores calculados en el momento (FLIP, posiciones medidas) | `element.animate()` |
| física, colisiones, partículas, canvas | un bucle de `requestAnimationFrame` |
| animar un cambio de layout o de página | View Transitions (o FLIP) |

## Bestiario

- **El código de después de la animación no se ejecuta, y aparece `Uncaught (in promise) … aborted`.**
  Síntoma: una secuencia con `await animation.finished` se queda a medias cuando el usuario cierra o cambia algo, y la consola muestra un error sin capturar.
  Causa: `cancel()` (o quitar el elemento) rechaza `finished` con un `AbortError`, y el `await` lo lanza como excepción.
  Solución: `try/catch` alrededor del `await`, dejando pasar solo el `AbortError`; haz el trabajo de limpieza también en ese caso.
  → [ver ejemplo](04-cancel-rechaza-finished.md)
- **Después de una animación, cambiar el estilo no tiene efecto.**
  Síntoma: tras animar con `fill: 'forwards'`, `el.style.opacity = '1'` (o cambiar una clase) no cambia lo que se ve.
  Causa: la animación sigue existiendo, en estado `finished`, y su último fotograma gana en la cascada a cualquier estilo.
  Solución: pon el estado final en el estilo y anima sin `fill`; o `commitStyles()` y `cancel()` al terminar.
  → [ver ejemplo](05-fill-forwards-se-queda.md)

## Resumen

- `element.animate(fotogramas, opciones)` crea una animación como un `@keyframes`: duración en ms, `easing` lineal por defecto, `fill` `'none'` por defecto.
- El objeto `Animation` es un reproductor: `play`, `pause`, `reverse`, `finish`, `cancel`, `currentTime`, `updatePlaybackRate` y `playState`.
- `finished` es una promesa: encadena con `await`; `cancel()` la rechaza con `AbortError` (captúralo).
- `fill: 'forwards'` mantiene viva la animación y gana a los estilos; mejor estado final en el estilo, o `commitStyles()` + `cancel()`.
- Las animaciones de una propiedad se apilan (`composite`); las de `fill` tapadas por otras se eliminan solas (`replaceState`), salvo `persist()`.
- `ScrollTimeline` y `ViewTimeline` llevan las líneas de tiempo de scroll a `animate()` (en Chrome).
- `getAnimations()` devuelve también las de CSS (`CSSAnimation`, `CSSTransition`): sirve para pausarlo todo.
- FLIP anima un reordenamiento con `translate`; las promesas de `startViewTransition` (`updateCallbackDone`, `ready`, `finished`) coordinan tu código con la transición.

## Para profundizar

- [MDN: Usar la Web Animations API](https://developer.mozilla.org/es/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API)
- [MDN: Animation (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Animation)
- [Paul Lewis: FLIP Your Animations (en inglés)](https://aerotwist.com/blog/flip-your-animations/)
- [Chrome for Developers: View Transition API, ViewTransition y sus promesas (en inglés)](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)
- [Chrome for Developers: Scroll-driven animations desde JavaScript (en inglés)](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
