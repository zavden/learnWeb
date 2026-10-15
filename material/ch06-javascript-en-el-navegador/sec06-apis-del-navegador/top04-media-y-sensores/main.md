# Media queries en JavaScript, visibilidad y pantalla

## Por qué importa

Las media queries de CSS deciden el **aspecto**: columnas, tamaños, colores. Pero a veces es el **script** el que necesita saber: si el menú debe tener un botón que lo abra, si el desplazamiento que va a animar molesta a quien pidió menos movimiento, si alguien está mirando la página antes de pedir datos al servidor cada dos segundos, si puede ocupar la pantalla entera. Esta lección reúne las APIs que responden a esas preguntas: `matchMedia`, Page Visibility, Fullscreen y algunas del dispositivo (pantalla encendida, red, ubicación, compartir).

Cumple varias promesas: el `matchMedia` que usó el selector de tema de «Almacenamiento en el navegador», el `visibilitychange` anunciado en «Escuchar eventos» y «Eventos personalizados», y la pausa de animaciones y sondeos en segundo plano de «Frames de animación y tiempo». Las sorpresas, como siempre, en el bestiario: una media query leída una sola vez, un `removeListener` que no quita nada y un `blur` que no significa lo que parece.

## `matchMedia`: media queries desde JavaScript

`matchMedia(consulta)` evalúa una media query con la misma sintaxis que `@media` y devuelve un **`MediaQueryList`**: `media` es la consulta (normalizada) y `matches` dice si se cumple **ahora**. Es además un `EventTarget`: su evento **`change`** avisa cuando el resultado cambia, y solo entonces (no en cada píxel de un `resize`).

[[exercise:01-matchmedia.md]]

[[exercise:01-matchmedia.md-(script.js)]]

```text
(prefers-color-scheme: dark) → true
(prefers-reduced-motion: reduce) → false
(hover: hover) and (pointer: fine) → true
(width >= 40rem) → false
Listo: cambia el ancho de la vista previa (cruza los 640 px) o el tema del sistema
// Tras ensanchar la vista previa por encima de 640 px:
change → (width >= 40rem): true
// Tras pasar macOS a modo claro (Ajustes del Sistema › Apariencia):
change → (prefers-color-scheme: dark): false
```

Los resultados son los de tu Mac (modo oscuro, trackpad) y de una tarjeta de 480 px: el ancho es el del iframe de la vista previa, no el de la ventana. Cambia el ancho con los controles de tamaño de la vista previa del editor. Todo lo que aprendiste en «Viewport y media queries» y «Preferencias del usuario» vale aquí tal cual: rangos (`width >= 40rem`), `and`, `not`, las preferencias y las características del puntero.

### Una foto fija

`matches` es una **foto** del momento en que la lees. Un script que decide al cargar («si es estrecha, menú compacto») y no vuelve a mirar se queda con esa decisión aunque la ventana cambie de tamaño, el móvil gire o la persona active el modo oscuro con la página abierta:

[[exercise:02-matches-una-sola-vez.md]]

[[exercise:02-matches-una-sola-vez.md-(script.js)]]

```text
🐛 al cargar → (width < 36rem): true · modo compacto, para siempre
✅ al cargar → (width < 36rem): true · modo compacto
Listo: cambia el ancho de la vista previa (cruza los 576 px) y mira los dos menús
// Tras ensanchar la vista previa por encima de 576 px:
✅ change → (width < 36rem): false · paso a modo completo
```

Las dos primeras líneas son las de una tarjeta de 480 px; en el editor, con una vista previa ancha, las dos empiezan en `false` y modo completo. Fíjate en que el menú ✅ no solo cambia de aspecto: también pone `aria-expanded` y `hidden` en su sitio, que es justo lo que el CSS no puede hacer. Si lo único que cambia es el aspecto, no necesitas JavaScript: `@media` lo hace mejor.

### `addListener` y la lista que no es la misma

En código antiguo (y en muchos tutoriales) verás `list.addListener(fn)` y `list.removeListener(fn)`: la API original de `MediaQueryList`, de antes de que fuera un `EventTarget`. Siguen funcionando en Chrome, como alias de `addEventListener('change', fn)`, pero están **obsoletos** y no admiten opciones (`once`, `signal`). El error clásico que los acompaña no es suyo, sin embargo: cada llamada a `matchMedia` crea una lista **nueva**, y quitar el listener de otra lista no quita nada:

[[exercise:03-addlistener-y-otra-lista.md-(script.js)]]

```text
matchMedia(q) === matchMedia(q) → false (cada llamada crea una lista nueva)
typeof list.addListener → function (obsoleto: hoy es addEventListener('change', …))
— se montan los dos carruseles… y se desmontan (la persona cambia de página) —
— simulado: la persona activa «Reducir movimiento» (change en cada lista) —
🐛 el carrusel desmontado sigue escuchando: reduce → true, pause() sobre un elemento que ya no está
listas creadas: 3 · el carrusel ✅ no ha dicho nada: abort() quitó su listener
```

El ejemplo simula el cambio de preferencia despachando un `MediaQueryListEvent` en cada lista, que es lo que hace el navegador de verdad. La regla: **guarda la lista** en una variable (o en un campo del componente) y usa `addEventListener` con un `AbortController`, como en la lección de Web Components, para quitarlo todo de una vez.

## `prefers-reduced-motion` desde JavaScript

En el módulo «Diseño responsive» aprendiste a envolver transiciones y animaciones de CSS en `@media (prefers-reduced-motion: no-preference)`. Esa regla solo alcanza al movimiento que crea el CSS. El que crea un script (un `scrollTo` con `behavior: 'smooth'`, un carrusel que avanza solo, un bucle con `requestAnimationFrame`, las animaciones de `element.animate()` del módulo «Gráficos y animación») tiene que preguntar él mismo:

[[exercise:04-movimiento-reducido-en-js.md]]

[[exercise:04-movimiento-reducido-en-js.md-(script.js)]]

```text
(prefers-reduced-motion: reduce) → false · desplazamiento: smooth
Listo: pulsa «Paso 6» y «Paso 1»
// Tras pulsar «Paso 6»:
↕ panel.scrollTo({ behavior: 'smooth' }) → Paso 6
// Con «Reducir movimiento» activado (Ajustes del Sistema › Accesibilidad › Pantalla, o DevTools › Rendering):
change → reduce: true · desplazamiento: instant
```

Para probarlo sin tocar el sistema, el panel **Rendering** de DevTools (menú ⋮ › More tools) emula `prefers-reduced-motion` y `prefers-color-scheme` en la pestaña que inspeccionas; abre antes la vista previa con ↗ para que sea la página del ejemplo. Reducir no siempre es quitar: un fundido corto en lugar de un deslizamiento, un salto en lugar de un desplazamiento, un carrusel que no avanza solo.

## Page Visibility: ¿alguien está mirando?

`document.visibilityState` vale `'visible'` o `'hidden'` (y `document.hidden`, `false` o `true`), y el evento **`visibilitychange`** de `document` avisa en cada cambio. Una página se oculta cuando cambias de pestaña, minimizas la ventana o bloqueas la pantalla. Una vista previa (un iframe) sigue a su pestaña: visible si la pestaña lo es.

Lo que hace el navegador con una pestaña oculta ya lo viste en parte en «Frames de animación y tiempo»: `requestAnimationFrame` se detiene y los temporizadores se frenan (como mucho uno por segundo, y menos con el tiempo). Pero un `setInterval` que pide datos al servidor seguiría pidiéndolos, más despacio, para nadie. Lo correcto es pausar al ocultarse y, al volver, pedir **en el acto** (los datos pueden ser viejos) y reanudar:

[[exercise:05-page-visibility.md]]

[[exercise:05-page-visibility.md-(script.js)]]

```text
visibilityState → visible · hidden: false
Listo: llega un pedido cada 2 s; cambia de pestaña unos segundos y vuelve
// Tras cambiar de pestaña y volver unos 5 s después (el número varía):
⏸ hidden → pauso el sondeo
▶ visible (5 s oculta) → pido ya y reanudo
```

`visibilitychange` con `'hidden'` es además el **último momento fiable** de la página: en un móvil, la persona puede pasar a otra app y el sistema cerrar la pestaña sin más avisos (ni `beforeunload` ni `unload`). Es el sitio para guardar un borrador o enviar los datos pendientes.

### `blur` no es ocultar

El evento `blur` de `window` dice que la página ha perdido el **foco**, no que haya dejado de verse. El foco se va a otro iframe, a la barra de direcciones, a DevTools o, en LearnWeb, al editor, y la página sigue ahí delante. Al revés, la vista previa ni siquiera empieza con el foco:

[[exercise:06-blur-no-es-ocultar.md-(script.js)]]

```text
document.hasFocus() → false · visibilityState → visible
🐛 con focus/blur → arranca en pausa (la vista previa no tiene el foco)
✅ con visibilitychange → sonando
Listo: haz clic dentro de la vista previa, después en el editor; luego cambia de pestaña y vuelve
// Tras hacer clic dentro de la vista previa:
🐛 focus → reanudo
// Tras hacer clic en el editor:
🐛 blur → pauso, aunque la página se sigue viendo
// Tras cambiar de pestaña y volver:
✅ hidden → pauso
✅ visible → reanudo
```

Usa `focus`/`blur` para lo que significan (por ejemplo, dejar de escuchar atajos de teclado globales) y `visibilitychange` para pausar trabajo.

## Pantalla completa

`elemento.requestFullscreen()` pone un elemento a pantalla completa y devuelve una promesa. Necesita un **gesto del usuario** (lo viste con `isTrusted` en «Eventos personalizados») y, dentro de un iframe, el permiso `allow="fullscreen"` de quien lo contiene. `document.fullscreenElement` dice qué elemento la ocupa (o `null`), el evento **`fullscreenchange`** de `document` avisa al entrar y al salir, `document.exitFullscreen()` sale, y la tecla Esc también (la gestiona el navegador: no la puedes impedir). En CSS, **`:fullscreen`** da estilo al elemento mientras dura, y `::backdrop`, al fondo que hay detrás.

[[exercise:07-pantalla-completa.md]]

[[exercise:07-pantalla-completa.md-(script.js)]]

```text
document.fullscreenEnabled → true
Listo: pulsa «⛶ Ver a pantalla completa»; sal con Esc o con «✕ Salir»
// Tras pulsar «⛶ Ver a pantalla completa»:
fullscreenchange → fullscreenElement: figure#painting
// Tras pulsar Esc (o «✕ Salir de pantalla completa»):
fullscreenchange → fullscreenElement: null
// En la tarjeta de arriba (iframe sin allow="fullscreen"), tras pulsar el botón:
document.fullscreenEnabled → false
⚠️ TypeError: Disallowed by permissions policy
```

`document.fullscreenEnabled` responde antes de intentarlo; si es `false`, lo honesto es esconder o desactivar el botón. Fíjate también en el foco: al entrar va al botón «Salir» y al salir vuelve al que la abrió, para que quien usa el teclado no se pierda.

## Más APIs del dispositivo

El resto de APIs de esta lección tocan cosas de la persona: la pantalla, su red, su ubicación, sus apps. Todas siguen las mismas reglas de convivencia:

| API | Gesto del usuario | Aviso de permiso | En un iframe necesita |
|---|---|---|---|
| `navigator.wakeLock.request('screen')` | no | no (página visible) | `allow="screen-wake-lock"` |
| `navigator.onLine`, `online`/`offline` | no | no | nada |
| `navigator.geolocation` | no exigido, pero sí recomendable | sí, la primera vez | `allow="geolocation"` |
| `navigator.share()` | sí | no (abre el menú del sistema) | `allow="web-share"` |
| `navigator.permissions.query()` | no | **nunca**: solo consulta | nada |

La regla del curso, y de cualquier web respetuosa: **nada que pida permiso al cargar**. Cada una va detrás de un botón que explica para qué sirve, comprueba si existe (`'wakeLock' in navigator`) y trata el rechazo con un mensaje útil. La vista previa del editor y la de «▶ Run» tienen todos estos permisos en su `allow`; las tarjetas de la teoría, ninguno.

### Mantener la pantalla encendida

Una receta, un mapa, una partitura: páginas que se leen sin tocar, mientras la pantalla se apaga. **Screen Wake Lock** lo evita. El detalle importante es que el navegador **suelta** el bloqueo en cuanto la página se oculta, así que un modo que deba durar lo vuelve a pedir en `visibilitychange`:

[[exercise:08-modo-cocina.md]]

[[exercise:08-modo-cocina.md-(script.js)]]

```text
'wakeLock' in navigator → true
Listo: pulsa «Modo cocina»; después cambia de pestaña y vuelve
// Tras pulsar «🔆 Modo cocina» (con ▶ o en el editor):
🔆 wakeLock.request('screen') → released: false
// Tras cambiar de pestaña y volver:
💤 release → el navegador lo soltó al ocultarse la página
🔆 wakeLock.request('screen') → released: false
// Tras pulsar «🔆 Modo cocina» otra vez:
💤 release → lo has soltado tú
// En la tarjeta de arriba, tras pulsar el botón:
⚠️ NotAllowedError: esta tarjeta es un iframe aislado sin permiso; ábrela con ▶ o en el editor
```

### Sin conexión

`navigator.onLine` y los eventos `online` y `offline` de `window` avisan cuando el dispositivo pierde o recupera la red. Sirven para cambiar el comportamiento: guardar en una cola, avisar en la interfaz, reintentar al volver. Pero `onLine === true` solo significa «hay una red», no «el servidor contesta»: cada `fetch` sigue necesitando su `try/catch` (módulo «Red y almacenamiento»).

[[exercise:09-sin-conexion.md-(script.js)]]

```text
navigator.onLine → true
Listo: guarda una nota; después quita la red, guarda otra y vuelve a conectarte
// Tras pulsar «Guardar» (con ▶ o en el editor):
📨 enviada → 200 · «Sin cebolla en la mesa 4»
// Tras quitar la red (DevTools › Network › Offline, en la vista previa abierta con ↗):
📴 offline → navigator.onLine: false
// Tras guardar «Mesa 7 pide la cuenta»:
🗂 en cola (1): «Mesa 7 pide la cuenta»
// Tras volver a conectarte:
📶 online → envío la cola (1)
📨 enviada → 200 · «Mesa 7 pide la cuenta»
```

### Ubicación y compartir

La **Permissions API** permite preguntar por el estado de un permiso (`'granted'`, `'denied'` o `'prompt'`) **sin** mostrar ningún aviso: ideal para decidir qué botón enseñar. Pedir la posición con `navigator.geolocation.getCurrentPosition(éxito, error, opciones)` sí lo muestra la primera vez; es una API de callbacks, anterior a las promesas, con códigos de error numéricos. Y **Web Share** (`navigator.share`) abre el menú de compartir del sistema, donde exista; `navigator.canShare(datos)` pregunta antes:

[[exercise:10-ubicacion-y-compartir.md-(script.js)]]

```text
'share' in navigator → true
permissions.query('geolocation') → prompt
Listo: pulsa «Usar mi ubicación» y «Compartir la receta del día»
// Tras pulsar «📍 Usar mi ubicación» y permitirlo (la precisión varía):
📍 pido la posición…
permiso → granted
📍 posición recibida · precisión ±35 m
// Si en el aviso eliges «Bloquear» (estas dos líneas pueden llegar en otro orden):
📍 pido la posición…
permiso → denied
⚠️ error 1: PERMISSION_DENIED (permiso denegado)
// Tras pulsar «↗ Compartir la receta del día» y cerrar el menú sin elegir:
↗ menú cerrado sin compartir
```

Una posición es un dato personal: el ejemplo no la escribe en ningún sitio, solo su precisión. Si Chrome no tiene permiso de ubicación en macOS (Ajustes del Sistema › Privacidad y seguridad), el error será el 2, `POSITION_UNAVAILABLE`. Y si cambias el permiso desde el icono de la barra de direcciones, el evento `change` del `PermissionStatus` lo recoge al momento.

## Bestiario

- **El menú no cambia al girar el móvil o cambiar el tamaño.**
  Síntoma: el script decide un comportamiento según una media query y, si la ventana cambia, el comportamiento se queda como estaba.
  Causa: `matchMedia(…).matches` es una foto del momento en que se lee.
  Solución: guarda el `MediaQueryList` y escucha su evento `change`.
  → [ver ejemplo](02-matches-una-sola-vez.md)
- **El listener de la media query no se va.**
  Síntoma: después de «quitarlo» con `removeListener`, el listener se sigue ejecutando cuando cambia la preferencia.
  Causa: cada `matchMedia(q)` devuelve una lista nueva; añadir en una y quitar en otra no quita nada. `addListener`/`removeListener`, además, están obsoletos.
  Solución: una sola lista guardada y `addEventListener('change', fn, { signal })`.
  → [ver ejemplo](03-addlistener-y-otra-lista.md)
- **El reproductor se pausa aunque la página se ve.**
  Síntoma: una página que pausa con `blur` se detiene al hacer clic en otro iframe, en DevTools o en la barra de direcciones, y puede no volver; en un iframe, ni siquiera arranca.
  Causa: `blur` y `focus` hablan del foco, no de la visibilidad.
  Solución: `visibilitychange` y `document.visibilityState`.
  → [ver ejemplo](06-blur-no-es-ocultar.md)

## Resumen

- `matchMedia(q)` devuelve un `MediaQueryList` con `matches` y `media`; su evento `change` avisa cuando el resultado cambia. Guárdalo y escúchalo: `matches` es una foto.
- `addListener`/`removeListener` están obsoletos; cada `matchMedia` crea una lista nueva.
- El movimiento creado por JavaScript tiene que consultar `prefers-reduced-motion` él mismo.
- `document.visibilityState` y `visibilitychange` dicen si alguien puede ver la página: pausa sondeos y animaciones al ocultarse y actualiza al volver; `'hidden'` es el último momento fiable para guardar.
- `blur`/`focus` hablan del foco, no de la visibilidad.
- `requestFullscreen()` necesita un gesto y, en un iframe, `allow="fullscreen"`; `fullscreenchange`, `:fullscreen` y Esc completan la API.
- Wake Lock, `onLine`, geolocalización y Web Share: comprobar si existen, pedir solo tras un clic, tratar el rechazo; `permissions.query` consulta sin preguntar.

## Para profundizar

- [MDN: Window.matchMedia()](https://developer.mozilla.org/es/docs/Web/API/Window/matchMedia)
- [MDN: Page Visibility API](https://developer.mozilla.org/es/docs/Web/API/Page_Visibility_API)
- [MDN: Fullscreen API](https://developer.mozilla.org/es/docs/Web/API/Fullscreen_API)
- [MDN: Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- [web.dev: Page Lifecycle API (en inglés)](https://developer.chrome.com/docs/web-platform/page-lifecycle-api)
