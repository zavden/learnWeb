# Acciones por defecto

## Por qué importa

Muchos eventos llegan con un trabajo ya asignado. Un clic en un enlace navega, un formulario enviado recarga la página, la tecla Espacio desplaza la pantalla, el clic derecho abre un menú. Es la **acción por defecto** del navegador, y casi siempre es justo lo que quieres: por eso la web funciona sin una línea de JavaScript.

A veces no lo es. Quieres enviar un formulario sin recargar, mostrar la ficha de un producto sin salir de la página o usar la rueda para hacer zoom en un mapa. Para eso existe `event.preventDefault()`. Esta lección enseña cuándo usarlo, qué acciones se pueden cancelar y cuáles no, y los errores que aparecen al cancelar demasiado (atajos que no te dejan escribir), demasiado tarde (una casilla que se desmarca sola) o donde no se puede (el *scroll* y los listeners pasivos).

## Qué es una acción por defecto

Cuando termina el viaje del evento (captura, objetivo y burbuja), el navegador mira si algún listener llamó a `preventDefault()`. Si nadie lo hizo, ejecuta la acción. Las más comunes:

| Evento | Acción por defecto | ¿Se puede cancelar? |
|--------|--------------------|---------------------|
| `click` en un enlace | navegar al `href` | sí |
| `submit` de un formulario | enviar los datos y cargar la respuesta | sí |
| `click` en una casilla o un radio | cambiar `checked` | sí (y se deshace, ver abajo) |
| `keydown` | escribir el carácter, mover el foco con Tab, activar con Enter, desplazar con Espacio o flechas, atajos del navegador | sí, la mayoría |
| `contextmenu` | abrir el menú contextual del navegador | sí |
| `wheel`, `touchmove` | desplazar la página | sí, salvo en listeners pasivos |
| `mousedown` | dar el foco al elemento y empezar a seleccionar texto | sí |
| `dragstart` en una imagen o un enlace | arrastrar una copia | sí |
| `command` (botones con `commandfor`) | abrir o cerrar el diálogo o el popover | sí |
| `scroll` | ninguna: avisa de que **ya** se desplazó | no |
| `input` | ninguna: avisa de que el valor **ya** cambió | no |

Dos propiedades del evento lo describen: `event.cancelable` dice si tiene una acción que se pueda cancelar, y `event.defaultPrevented` dice si alguien ya llamó a `preventDefault()`. Llamarlo en un evento que no es cancelable no hace nada y no da error.

## Cancelar la navegación de un enlace

El caso clásico: un enlace de verdad (con un `href` que funciona sin JavaScript) que, con JavaScript, muestra el contenido en la misma página. El enlace sigue siendo un enlace: se puede copiar, abrir en otra pestaña y lo entienden los buscadores. El script solo **mejora** la experiencia:

[[exercise:01-preventdefault-en-un-enlace.md-(script.js)]]

```text
Listo: pulsa «Café de Chiapas» (con el ratón o con Tab y Enter)
// Tras pulsar «Café de Chiapas»:
cancelable → true · defaultPrevented → false
tras preventDefault() → defaultPrevented: true
📦 ficha de «Café de Chiapas» sin salir de la página
// Tras Cmd + clic (macOS) o Ctrl + clic (Windows, Linux) en «Cacao de Tabasco»:
↗ con tecla modificadora: dejo actuar al navegador
```

Fíjate en la comprobación de las teclas modificadoras: Cmd/Ctrl + clic significa «ábrelo en otra pestaña», y es una decisión del usuario que tu código no debe anular. Para que la dirección de la barra también cambie, como en una aplicación de una sola página, falta `history.pushState`, que verás en el módulo «Red y almacenamiento».

## Formularios: el evento `submit`

Para enviar un formulario con JavaScript, escucha **`submit` en el formulario**, no `click` en el botón. `submit` llega pulse el usuario el botón o Enter dentro de un campo, y solo después de que la validación nativa (`required`, `type="email"`…) haya dado el visto bueno. Después, `preventDefault()` evita la navegación y tu código envía los datos como quiera:

[[exercise:02-enviar-un-formulario.md-(index.html|script.js)]]

```text
Listo: pulsa los dos «Suscribirme» (o Enter dentro de cada campo)
// Tras enviar el formulario «Con JavaScript»:
📨 submit → defaultPrevented: true
✅ suscrita lucia@example.com, sin recargar la página
// Tras enviar el formulario «Sin JavaScript» (esta línea la escribe LearnWeb):
Form submitted (navigation blocked in preview): GET /boletin?email=lucia%40example.com {email: 'lucia@example.com'}
```

El segundo formulario no tiene listener, así que el navegador haría la navegación de verdad. La vista previa de LearnWeb la bloquea y la describe en la consola, como en el capítulo de HTML. Es tu red de seguridad para todo el módulo: si ves esa línea, es que tu `preventDefault()` no se ejecutó. Leer los campos con `FormData`, `requestSubmit()` y la validación con JavaScript son el tema del módulo «Formularios con JavaScript».

## Casillas: el valor cambia antes

Las casillas tienen una sorpresa. Para que el listener de `click` pueda leer el estado nuevo, el navegador cambia `checked` **antes** de llamar a los listeners. Si alguien cancela el evento, lo devuelve a su valor **al terminar**. Durante el listener, por tanto, `checked` dice algo que quizá no llegue a ocurrir:

[[exercise:03-checkbox-y-preventdefault.md-(script.js)]]

```text
Listo: marca las dos casillas
// Tras pulsar la casilla 🐛:
🐛 dentro del click: checked → true
🐛 después: checked → false, pero el total dice $260.00
// Tras pulsar la casilla ✅:
✅ click cancelado: no se dispara change y el total no se toca
```

La regla: calcula a partir del valor en **`change`**, que solo llega cuando el valor ha cambiado de verdad. Y, desde el punto de vista del usuario, una casilla que se desmarca sola es confusa: si una opción no está disponible, desactívala (`disabled`) y explica por qué junto a ella.

## Teclas: cancelar solo lo tuyo

Cancelar un `keydown` cancela lo que esa tecla iba a hacer: escribir, mover el foco con Tab, activar un botón con Enter, desplazar la página con Espacio y muchos atajos del navegador. Un listener de atajos en `document` que llama a `preventDefault()` para **todas** las teclas convierte la página en una trampa:

[[exercise:04-preventdefault-en-keydown.md-(script.js)]]

```text
✉️ Tostaduría La Ceiba · Tu pedido salió hoy
Listo: haz clic en «Buscar correo» y escribe; pulsa Tab; desmarca la casilla y repite
// Con la casilla marcada, tras escribir «ca» en el buscador y pulsar Tab
// (el campo sigue vacío y el foco no se mueve):
🐛 «c» bloqueada
🐛 «a» bloqueada
🐛 «Tab» bloqueada
// Con la casilla desmarcada: «ca» se escribe y Tab mueve el foco; fuera del campo, j:
✉️ Lucía Méndez · Fotos del taller de barismo
```

Las cuatro comprobaciones de la versión correcta valen para cualquier atajo: ¿ya lo atendió otro (`defaultPrevented`)?, ¿lleva Cmd, Ctrl o Alt (atajos del sistema y del navegador)?, ¿está el usuario escribiendo en un campo?, ¿es una de **mis** teclas? Solo si todo cuadra, `preventDefault()`. En la lección siguiente verás cómo elegir teclas que no choquen con los lectores de pantalla y cómo anunciarlas con `aria-keyshortcuts`.

> **Desde Python:** en Tkinter, el comportamiento de serie de un widget (escribir en un `Entry`, por ejemplo) son *bindings* de su clase, que se ejecutan después de los tuyos. Si tu manejador devuelve `'break'`, cancela a la vez el resto del recorrido y ese comportamiento. En el navegador son dos decisiones separadas: `stopPropagation()` corta el viaje y `preventDefault()` cancela la acción; una no implica la otra.

## Un menú contextual propio

El clic derecho (o Ctrl + clic en macOS) dispara `contextmenu`, cuya acción por defecto es el menú del navegador. Cancelarlo permite mostrar uno propio, por ejemplo con las acciones de una foto. El ejemplo usa un **popover** (capítulo de HTML), que ya trae el cierre con Escape y con un clic fuera, y lo coloca en la posición del puntero (`event.clientX`, `event.clientY`):

[[exercise:05-menu-contextual-propio.md-(script.js)]]

```text
Listo: haz clic derecho en una foto, o pulsa su botón «⋯»
// Tras hacer clic derecho en «Monte Albán al amanecer» y elegir «Descargar»:
📋 menú propio para «Monte Albán al amanecer»
descargar → «Monte Albán al amanecer»
```

El clic derecho no existe en el teclado ni, en la práctica, en una pantalla táctil (allí es una pulsación larga). Por eso cada foto tiene también un botón «⋯» visible que abre el mismo menú. Y sustituye el menú del navegador solo donde el tuyo aporta algo: fuera de esas fotos, el usuario espera poder copiar o inspeccionar.

## Comandos de botón cancelables

En el capítulo de HTML abriste diálogos sin JavaScript con los *invoker commands*: un botón con `commandfor="id"` y `command="show-modal"`. Antes de actuar, ese botón dispara un evento **`command`** en el elemento objetivo (el diálogo), con `event.command` (qué orden) y `event.source` (qué botón). Es cancelable: `preventDefault()` impide que el diálogo se abra. Y los comandos que empiezan por `--` no tienen acción integrada, así que existen solo para tu listener:

[[exercise:06-command-y-commandfor.md-(index.html|script.js)]]

```text
¿el navegador conoce command? → true
Listo: pulsa «Ver carrito»; luego «Añadir…», «Ver carrito» y «Vaciar»
// Tras pulsar «Ver carrito» con el carrito vacío:
command → show-modal · source: #open-cart
⛔ carrito vacío → preventDefault(): el diálogo no se abre
// Tras «Añadir café de Chiapas», «Ver carrito» y «Vaciar»:
command → show-modal · source: #open-cart
command → --clear-cart · source: #clear-cart
🧹 carrito vaciado
```

Los invoker commands funcionan en Chrome desde la versión 135; antes de depender de ellos en un proyecto, comprueba el soporte en los navegadores de tu público.

## Lo que no se puede cancelar

Algunos eventos avisan de algo que **ya ha pasado**, y no tienen acción que cancelar. El más engañoso es `scroll`: cuando llega, la página ya se ha desplazado. `cancelable` es `false` y `preventDefault()` no hace nada, ni siquiera avisa:

[[exercise:07-scroll-no-se-puede-cancelar.md-(script.js)]]

```text
Listo: marca la primera casilla y desplaza la página; luego, prueba la segunda
// Tras marcar la primera casilla y desplazar la página:
🐛 scroll · cancelable: false · defaultPrevented: false · la página se movió igual
// Tras marcar la segunda casilla:
✅ overflow: hidden activado: la página ya no se desplaza
```

Para impedir que la página se desplace mientras hay un panel abierto, la herramienta es CSS: `overflow: hidden` en `<html>` mientras dure. Cancelar la rueda (`wheel`) no basta, porque el usuario también se desplaza con el teclado, con la barra o arrastrando en una pantalla táctil. Lo mismo vale para `input`: llega con el valor ya cambiado; para filtrar lo que se escribe existe `beforeinput`, que sí es cancelable (módulo «Formularios con JavaScript»).

## Listeners pasivos

Para desplazar la página con la rueda o con el dedo, el navegador tendría que esperar a que terminen todos los listeners de `wheel` o `touchmove`, por si alguno llama a `preventDefault()`. Si un listener tarda 50 ms, el *scroll* se traba 50 ms en cada movimiento. La opción **`{ passive: true }`** es una promesa: «este listener no va a cancelar nada». Con ella, el navegador desplaza la página sin esperar y ejecuta el listener aparte.

La promesa se hace cumplir: dentro de un listener pasivo, `preventDefault()` **se ignora**. Y los navegadores (Chrome fue el primero) hacen pasivos **por defecto** los listeners de `wheel`, `touchstart` y `touchmove` registrados en `window`, `document` o `<body>`, que es donde los ponían las librerías antiguas. Si quieres cancelar ahí, tienes que pedir `{ passive: false }` expresamente:

[[exercise:08-listener-pasivo-no-previene.md-(script.js)]]

```text
simulado · passive: true → defaultPrevented: false
simulado · wheel en document sin opciones → defaultPrevented: false
simulado · wheel en document con passive: false → defaultPrevented: true
Listo: gira la rueda sobre cada mapa; con el A, la página también se desplaza
// Tras girar la rueda sobre el mapa A y después sobre el B:
#map-a · passive: true → defaultPrevented: false
#map-b · passive: false → defaultPrevented: true
```

Las tres primeras líneas usan eventos **simulados** con `dispatchEvent` (lección «Eventos personalizados») para que el resultado no dependa de tu ratón. En Chrome, cada `preventDefault()` ignorado imprime en la consola de DevTools un aviso que empieza por «Unable to preventDefault inside passive event listener»; la consola de LearnWeb no recibe esos avisos del navegador, así que aquí solo lo verás en `defaultPrevented`. La regla práctica: los listeners de `wheel`, `touchmove` y `touchstart` que no cancelan nada, siempre con `{ passive: true }`; los que sí, en el elemento concreto (el mapa) y con `{ passive: false }`.

## Eventos que llegan en ráfaga

`scroll`, `wheel`, `pointermove`, `resize` e `input` pueden llegar decenas de veces por segundo. Que el listener sea pasivo evita frenar el *scroll*, pero si cada evento lanza un trabajo caro (una búsqueda en el servidor, recolocar media página), el problema sigue. En la lección «Funciones de orden superior» escribiste dos herramientas para esto y te prometimos usarlas con eventos de verdad: **debounce** (espera a que los eventos paren) y **throttle** (como mucho una vez cada cierto tiempo, con una llamada final para no perder el último):

[[exercise:09-eventos-en-rafaga.md]]

```text
Listo: escribe «tueste» seguido; desplaza el artículo hasta el final; cambia el ancho de la vista previa
// Tras escribir «tueste» sin pausas:
🔎 búsqueda 1: «tueste» (tras 6 eventos input)
// Tras desplazar el artículo hasta el final (los números varían):
📜 lectura 100 % (38 eventos scroll, 9 actualizaciones)
// Tras cambiar el ancho de la vista previa con sus controles (los números varían):
↔️ recoloco para 420 px (tras 17 eventos resize)
```

Debounce para lo que solo importa al final (buscar, validar, recolocar tras un `resize`); throttle para lo que debe verse mientras ocurre (una barra de progreso de lectura, la posición al arrastrar). Para trabajo visual, otra opción es agrupar los eventos de cada frame con `requestAnimationFrame`, que viste en el módulo «Asincronía y event loop». Y antes de escuchar `scroll` para saber si algo es visible, piensa en `IntersectionObserver` (módulo «APIs modernas del navegador»), que lo hace sin escuchar cada píxel.

[[exercise:09-eventos-en-rafaga.md-(script.js)]]

## Bestiario

- **La casilla se desmarca sola y el total queda mal.**
  Síntoma: el listener de `click` de una casilla ve `checked → true`, calcula con ese valor, y la casilla aparece desmarcada.
  Causa: el navegador cambia `checked` antes de los listeners y lo restaura al terminar si alguien llamó a `preventDefault()`.
  Solución: calcula en `change`; para impedir el cambio, desactiva la casilla en lugar de cancelar el clic.
  → [ver ejemplo](03-checkbox-y-preventdefault.md)
- **No se puede escribir en ningún campo.**
  Síntoma: tras añadir atajos de teclado, los campos no admiten texto, Tab no mueve el foco y algunos atajos del navegador dejan de funcionar.
  Causa: un listener de `keydown` en `document` llama a `preventDefault()` para todas las teclas.
  Solución: cancela solo tus teclas, sin modificadores, fuera de los campos de texto y si nadie lo hizo antes.
  → [ver ejemplo](04-preventdefault-en-keydown.md)
- **`preventDefault()` en `scroll` no hace nada.**
  Síntoma: la página se desplaza aunque el listener de `scroll` llame a `preventDefault()`.
  Causa: `scroll` avisa de un desplazamiento que ya ocurrió; no es cancelable (`cancelable: false`).
  Solución: bloquea el desplazamiento con CSS (`overflow: hidden` en `<html>` mientras haga falta).
  → [ver ejemplo](07-scroll-no-se-puede-cancelar.md)
- **El listener pasivo no cancela la rueda.**
  Síntoma: `preventDefault()` en un listener de `wheel` o `touchmove` no evita el desplazamiento; `defaultPrevented` sigue en `false`.
  Causa: el listener es pasivo, porque se pidió `{ passive: true }` o porque está en `window`, `document` o `<body>`, donde Chrome los hace pasivos por defecto.
  Solución: registra el listener en el elemento concreto y con `{ passive: false }`.
  → [ver ejemplo](08-listener-pasivo-no-previene.md)

## Resumen

- Muchos eventos tienen una acción por defecto que el navegador ejecuta al terminar el viaje del evento; `preventDefault()` la cancela.
- `cancelable` dice si se puede cancelar; `defaultPrevented`, si alguien lo hizo.
- Para formularios, escucha `submit` en el formulario; para enlaces, respeta Cmd/Ctrl + clic.
- En una casilla, `checked` cambia antes de los listeners: calcula en `change`.
- Cancela solo tus teclas, fuera de los campos y sin modificadores.
- `scroll` e `input` no se pueden cancelar; para bloquear el desplazamiento, CSS.
- Los listeners pasivos (los pedidos y los de `wheel`/`touch` en `window`, `document` y `<body>`) ignoran `preventDefault()`.
- Para eventos en ráfaga: listeners pasivos si no cancelan, y debounce o throttle para el trabajo caro.

## Para profundizar

- [MDN: Event.preventDefault()](https://developer.mozilla.org/es/docs/Web/API/Event/preventDefault)
- [javascript.info: acciones predeterminadas del navegador](https://es.javascript.info/default-browser-action)
- [Chrome Developers: listeners pasivos para mejorar el scroll (en inglés)](https://developer.chrome.com/docs/lighthouse/best-practices/uses-passive-event-listeners)
- [MDN: Invoker Commands API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
