# Propagación: captura y burbuja

## Por qué importa

Cuando pulsas un botón que está dentro de una tarjeta, que está dentro de una columna, que está dentro de la página, ¿a quién le ha llegado el clic? A todos. Un evento no se queda en el elemento donde ocurre: **viaja** por el árbol del DOM, bajando desde `window` hasta el elemento y volviendo a subir. Cualquier antepasado puede escucharlo por el camino.

Ese viaje es lo que hace posibles los menús que se cierran al hacer clic fuera, los formularios que reaccionan a cualquiera de sus campos y la delegación de la lección siguiente. Y también explica varios errores clásicos: el `event.target` que de pronto es un `<span>`, el listener de `focus` que nunca se ejecuta y el menú que deja de cerrarse porque otro componente llamó a `stopPropagation()`.

## El viaje de un evento

Cuando el usuario pulsa «Archivar», el navegador calcula el **camino** del evento: el botón y todos sus antepasados, hasta `document` y `window`. Después lo recorre en tres fases:

1. **Captura** (*capture*): de `window` hacia abajo, hasta el padre del objetivo. Solo se ejecutan los listeners registrados con `{ capture: true }`.
2. **Objetivo** (*target*): en el propio elemento pulsado. Se ejecutan todos sus listeners (primero los de captura).
3. **Burbuja** (*bubble*): del padre del objetivo hacia arriba, hasta `window`. Se ejecutan los listeners normales, los registrados sin `capture`.

```text
  1. CAPTURA: baja                                 3. BURBUJA: sube
  (listeners con capture: true)                    (listeners normales)

  window     ──┐                                ┌──▶ window
  document   ──┤                                ├──▶ document
  html       ──┤                                ├──▶ html
  body       ──┤                                ├──▶ body
  #board     ──┤                                ├──▶ #board
  #card      ──┤                                ├──▶ #card
               │      ┌──────────────────────┐  │
               └────▶ │ #archive             │ ─┘
                      │ 2. OBJETIVO          │
                      └──────────────────────┘
```

El ejemplo pone dos listeners (uno de captura y uno normal) en cada nivel y los escribe en orden. Pulsa «Archivar» y después el título de la tarjeta:

[[exercise:01-captura-objetivo-y-burbuja.md]]

[[exercise:01-captura-objetivo-y-burbuja.md-(script.js)]]

```text
Listo: pulsa «Archivar»; luego, el título de la tarjeta
// Tras pulsar «Archivar»:
captura · window (fase 1)
captura · document (fase 1)
captura · #board (fase 1)
captura · #card (fase 1)
objetivo · #archive (fase 2)
objetivo · #archive (fase 2)
burbuja · #card (fase 3)
burbuja · #board (fase 3)
burbuja · document (fase 3)
burbuja · window (fase 3)
// Tras pulsar el título «Fotografiar la carta de otoño»: lo mismo, sin las dos líneas de «objetivo»
```

Con el título no hay líneas de fase 2: el objetivo es el `<h2>`, y nadie escucha en él. `event.eventPhase` dice en qué fase va el viaje (`1`, `2` o `3`; las constantes `Event.CAPTURING_PHASE`, `Event.AT_TARGET` y `Event.BUBBLING_PHASE`). En la práctica, el 99 % de los listeners son de burbuja: es el valor por defecto y el orden natural («primero el elemento, luego su contenedor»). La captura sirve cuando un antepasado necesita enterarse **antes** que nadie, como verás enseguida.

El camino se calcula **al empezar**: si un listener mueve o borra elementos durante el viaje, el evento sigue el camino que tenía.

## `target` y `currentTarget`

Con la propagación, un mismo listener recibe eventos que ocurrieron en muchos sitios. El objeto evento distingue dos cosas:

- **`event.target`**: el elemento donde **ocurrió** el evento, el más interno de todos. Es el mismo durante todo el viaje.
- **`event.currentTarget`**: el elemento cuyo listener se está ejecutando **ahora**. Cambia en cada parada del viaje. Con un listener `function`, `this` es este mismo elemento.

[[exercise:02-target-y-currenttarget.md-(script.js)]]

```text
Listo: pulsa el título, el año (1940) y el botón
// Tras pulsar el título, el año y el botón:
target → H1 · currentTarget → #track-card · this === currentTarget → true
target → EM · currentTarget → #track-card · this === currentTarget → true
target → BUTTON · currentTarget → #track-card · this === currentTarget → true
```

Los nodos de texto nunca son `target`: un clic sobre «Consuelo Velázquez» llega con `target` igual al `<p>` que contiene ese texto. Y `tagName` sale en mayúsculas en los elementos HTML.

### El `target` que no esperabas

Ahora el error. Un botón casi nunca es solo texto: lleva un icono SVG, un contador en un `<span>`, una imagen. Si el listener está en el botón pero lee `event.target`, el resultado depende de dónde cae exactamente el puntero:

[[exercise:03-target-es-el-mas-interno.md-(index.html|script.js)]]

```text
Listo: pulsa el icono del carrito, luego el número y luego «Añadir»
// Tras pulsar el icono del carrito (path, o svg si pulsas entre los trazos):
🐛 target → path · sku: undefined
✅ currentTarget → BUTTON · sku: CAF-500
✅ target.closest('button') → sku: CAF-500
// Tras pulsar el número:
🐛 target → SPAN · sku: undefined
✅ currentTarget → BUTTON · sku: CAF-500
✅ target.closest('button') → sku: CAF-500
// Tras pulsar la palabra «Añadir»: target → BUTTON · sku: CAF-500 (esta vez coincide)
```

El bug es traicionero porque **a veces funciona**: con la palabra «Añadir», `target` es el botón. En tus pruebas pulsas siempre en el centro y todo va bien; el usuario pulsa en el icono y el carrito recibe `undefined`. La regla: si te interesa el elemento que **escucha**, usa `currentTarget`; si escuchas en un contenedor y te interesa el elemento **pulsado**, sube desde `target` con `closest` (lección siguiente). Fíjate también en que los elementos SVG conservan su nombre en minúsculas (`path`, `svg`).

## Detener la propagación

`event.stopPropagation()` corta el viaje: el evento termina de entregarse al elemento actual y **no sigue** hacia los siguientes del camino. El caso típico es un elemento clicable que contiene otro: una tarjeta que abre su detalle y, dentro, una estrella para destacarla.

[[exercise:04-stoppropagation.md-(script.js)]]

```text
Listo: pulsa las dos estrellas
// Tras pulsar «⭐ Destacar (sin stopPropagation)»:
⭐ destacada: #card-a
📂 abro el detalle de #card-a
// Tras pulsar «⭐ Destacar (con stopPropagation)»:
⭐ destacada: #card-b
```

`stopPropagation` solo impide que el evento llegue a **otros elementos**. No cancela la acción por defecto (un enlace se sigue igual: eso es `preventDefault`, lección «Acciones por defecto») ni impide que se ejecuten los demás listeners del **mismo** elemento.

### Lo que rompe `stopPropagation`

El problema es que el evento no es solo tuyo. Hay código, a veces de otra persona o de una librería, que escucha en `document` precisamente porque quiere enterarse de **todos** los clics: el menú que se cierra al hacer clic fuera, el selector de fechas, la analítica. Un `stopPropagation()` en cualquier rincón de la página los deja ciegos:

[[exercise:05-stoppropagation-rompe-otros.md-(script.js)]]

```text
Listo: abre «Ordenar por», pulsa una estrella; marca la casilla y repite
// Tras abrir el menú y pulsar la 2.ª estrella:
▾ menú abierto
★ valoración: 2
🐛 el menú sigue abierto: el clic no llegó a document
// Tras marcar la casilla:
▴ clic fuera → menú cerrado
el menú escucha ahora en captura ✅
// Tras abrir el menú y pulsar la 3.ª estrella:
▾ menú abierto
▴ clic fuera → menú cerrado
★ valoración: 3
```

Dos arreglos, uno en cada lado:

- **En quien detiene:** no detengas. Si el padre no debe reaccionar a los clics de las estrellas, que el **padre** lo compruebe: `if (event.target.closest('.stars')) return;`. Así nadie más pierde el evento.
- **En quien escucha:** si tu componente necesita ver todos los clics pase lo que pase, escucha en la fase de **captura**. La captura baja desde `window` antes de que el evento llegue a nadie que pueda detenerlo.

### `stopImmediatePropagation`

Si un elemento tiene varios listeners para el mismo evento, se ejecutan en el orden en que se registraron, y `stopPropagation()` no frena a los que quedan en ese elemento. `stopImmediatePropagation()` sí: corta el viaje **y** los listeners restantes del elemento actual.

[[exercise:06-stopimmediatepropagation.md-(script.js)]]

```text
Listo: pulsa los dos botones
// Tras pulsar «Pagar (guardián con stopPropagation)»:
⛔ #pay-a: bloqueado, ya hay un pago en curso
🐛 #pay-a: 💳 cobro $1,280.00 otra vez (el guardián no lo frenó)
// Tras pulsar «Pagar (guardián con stopImmediatePropagation)»:
⛔ #pay-b: bloqueado, ya hay un pago en curso
```

Es un recurso para cuando no controlas el otro listener (una librería). Si el código es tuyo, la condición va dentro del propio listener de pago, o el botón se desactiva con `disabled`.

> **Desde Python:** Tkinter tiene una idea parecida a la burbuja: cada evento recorre las *bindtags* del widget (el propio widget, su clase, la ventana y `'all'`), y un manejador que devuelve `'break'` corta el recorrido, como `stopPropagation()`. La diferencia es que en el navegador el recorrido sigue el árbol del documento y existe además la fase de captura.

## Eventos que no burbujean

No todos los eventos hacen el viaje de vuelta. `event.bubbles` dice si un evento burbujea, y estos, muy usados, **no** lo hacen:

| No burbujea | Alternativa que sí burbujea | Notas |
|-------------|-----------------------------|-------|
| `focus`, `blur` | `focusin`, `focusout` | mismo momento, misma información |
| `mouseenter`, `mouseleave` | `mouseover`, `mouseout` | las de `over/out` avisan también al pasar a un hijo |
| `pointerenter`, `pointerleave` | `pointerover`, `pointerout` | igual que las de ratón |
| `load`, `error` de una imagen o un script | — | se capturan en `document` con `capture: true` |
| `scroll` de un elemento | — | `scroll` del documento sí llega a `window` |

El caso más común es querer que un formulario reaccione al campo que recibe el foco, para mostrar una ayuda o resaltar una sección. Un listener de `focus` en el formulario **nunca** se ejecuta, porque `focus` no sube desde el campo:

[[exercise:07-focus-no-burbujea.md-(script.js)]]

```text
Listo: haz clic en «Calle y número» y luego pulsa Tab
// Tras hacer clic en «Calle y número»:
✅ focus en captura → #street · bubbles: false
✅ focusin → #street · bubbles: true
// Tras pulsar Tab:
✅ focusout → #street
✅ focus en captura → #zip · bubbles: false
✅ focusin → #zip · bubbles: true
```

Fíjate en la tercera vía: un evento que no burbujea **sí** pasa por la fase de captura, así que `{ capture: true }` en el formulario también funciona. El orden de las líneas es el de Chrome: primero `focus` y luego `focusin` (y al salir, `blur` y luego `focusout`). Y si solo quieres **estilos**, no necesitas JavaScript: `:focus-within` marca el formulario que contiene el foco, como el borde azul del ejemplo.

Con el ratón pasa lo mismo. `mouseenter` está pensado para no burbujear: escuchado en un elemento, avisa una vez al entrar en él, sin el ruido de sus hijos. Pero si lo escuchas en una galería esperando un aviso por foto, solo recibirás uno, al entrar en la galería:

[[exercise:08-mouseenter-no-burbujea.md-(script.js)]]

```text
Listo: pasa el ratón por las tres obras; luego recórrelas con Tab
// Tras pasar el ratón de izquierda a derecha:
🐛 mouseenter → target: UL#gallery (una vez, al entrar)
✅ mouseover → La gran ola de Kanagawa (Hokusai, 1831)
✅ mouseover → El Fuji rojo (Hokusai, 1831)
✅ mouseover → Lluvia repentina en Ōhashi (Hiroshige, 1857)
// Tras pulsar Tab hasta la primera obra:
✅ focusin → La gran ola de Kanagawa (Hokusai, 1831)
```

El ejemplo usa también `focusin` con la misma función: una vista previa que solo aparece con el ratón deja fuera a quien navega con el teclado. Cada interacción de puntero de este módulo tiene su alternativa de teclado.

## El evento caduca

El viaje de un evento es **síncrono**: empieza, recorre el camino ejecutando listeners y termina, todo en la misma tarea. Al terminar, el navegador limpia el evento: `currentTarget` vuelve a `null`, `eventPhase` a `0` y `composedPath()` (el camino, como array) queda vacío. `target` se conserva.

Eso importa en cuanto un listener espera algo con `await`, `setTimeout` o `then`: cuando vuelve, el viaje terminó hace tiempo.

[[exercise:09-currenttarget-despues-de-await.md-(script.js)]]

```text
Listo: pulsa los dos botones
// Tras pulsar «Guardar (🐛)»:
antes del await → currentTarget: #save-buggy · camino: 7 nodos
después → currentTarget: null · camino: 0 nodos · target: #save-buggy
🐛 TypeError: Cannot set properties of null (setting 'textContent')
// Tras pulsar «Guardar (✅)» (el botón cambia a «✓ Guardado» 300 ms después):
✅ guardado: el botón se guardó en una variable antes del await
```

La regla: guarda en variables lo que necesites del evento **antes** del primer `await`. En la lección «Eventos personalizados» verás la otra cara del problema: un `preventDefault()` después de un `await` llega tarde.

Un apunte para más adelante: con Shadow DOM (módulo «APIs modernas del navegador»), un evento solo sale de un componente si es `composed`, y al salir, su `target` se «redirige» al componente; `composedPath()` es entonces la forma de ver el camino completo.

## Bestiario

- **`event.target` no es el botón.**
  Síntoma: el listener del botón lee `event.target.dataset` y a veces obtiene `undefined`, según dónde se pulse.
  Causa: `target` es el elemento más interno bajo el puntero: el icono, el `<span>` del contador, el `<path>` del SVG.
  Solución: usa `event.currentTarget` (el elemento que escucha) o `event.target.closest('button')`.
  → [ver ejemplo](03-target-es-el-mas-interno.md)
- **El menú ya no se cierra al hacer clic fuera.**
  Síntoma: un componente que escucha los clics en `document` deja de enterarse de los clics en cierta zona de la página.
  Causa: un listener de esa zona llama a `stopPropagation()` y el evento no llega a `document`.
  Solución: no detengas la propagación (que el padre compruebe `target`), o haz que el componente escuche en captura.
  → [ver ejemplo](05-stoppropagation-rompe-otros.md)
- **El listener de `focus` del formulario no se ejecuta.**
  Síntoma: `form.addEventListener('focus', …)` no reacciona al enfocar sus campos.
  Causa: `focus` y `blur` no burbujean.
  Solución: `focusin`/`focusout`, o `focus` con `{ capture: true }`; para estilos, `:focus-within`.
  → [ver ejemplo](07-focus-no-burbujea.md)
- **`mouseenter` solo avisa una vez.**
  Síntoma: escuchado en un contenedor, `mouseenter` no avisa de cada hijo, y su `target` es el contenedor.
  Causa: `mouseenter`/`mouseleave` no burbujean.
  Solución: `mouseover`/`mouseout` con `closest` (y `focusin` para el teclado).
  → [ver ejemplo](08-mouseenter-no-burbujea.md)
- **`currentTarget` es `null` después de un `await`.**
  Síntoma: `TypeError: Cannot set properties of null` al usar `event.currentTarget` tras esperar algo; `composedPath()` devuelve `[]`.
  Causa: el viaje del evento terminó antes de que volviera el `await`, y el navegador limpió el evento.
  Solución: guarda `const button = event.currentTarget` antes del primer `await`.
  → [ver ejemplo](09-currenttarget-despues-de-await.md)

## Resumen

- Un evento viaja en tres fases: captura (de `window` hacia abajo), objetivo y burbuja (de vuelta hacia arriba).
- Los listeners normales escuchan en la burbuja; con `{ capture: true }`, en la captura. `eventPhase` dice la fase.
- `target` es dónde ocurrió (el elemento más interno); `currentTarget`, quién escucha ahora (y `this` con `function`).
- `stopPropagation()` corta el viaje hacia otros elementos; `stopImmediatePropagation()`, también los listeners restantes del mismo elemento. Ninguno cancela la acción por defecto.
- Detener la propagación deja ciegos a los demás: compruébalo en el padre o escucha en captura.
- `focus`, `blur`, `mouseenter` y `mouseleave` no burbujean: usa `focusin`, `focusout`, `mouseover` y `mouseout`.
- Tras el viaje, `currentTarget` es `null` y `composedPath()` está vacío: guarda lo que necesites antes de un `await`.

## Para profundizar

- [MDN: propagación de eventos](https://developer.mozilla.org/es/docs/Learn_web_development/Core/Scripting/Event_bubbling)
- [javascript.info: propagación y captura](https://es.javascript.info/bubbling-and-capturing)
- [MDN: Event.composedPath()](https://developer.mozilla.org/es/docs/Web/API/Event/composedPath)
- [DOM Standard: dispatching events (en inglés)](https://dom.spec.whatwg.org/#dispatching-events)
