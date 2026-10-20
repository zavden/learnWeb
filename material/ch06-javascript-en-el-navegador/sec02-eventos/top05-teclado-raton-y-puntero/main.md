# Teclado, ratón y puntero

## Por qué importa

Las personas llegan a tu página con un ratón, un trackpad, un dedo, un lápiz, un teclado, un lector de pantalla o un programa de control por voz. Cada dispositivo produce sus eventos, con detalles que sorprenden: la tecla que escribe «W» con Bloq Mayús no es `'w'`, un doble clic empieza con dos clics, un arrastre se corta en cuanto el puntero se sale del elemento y, con el dedo, el navegador se queda el gesto para desplazar la página.

Esta lección recorre los eventos de entrada en tres bloques: el **teclado** (`keydown`, `keyup`, `key` frente a `code`, atajos que no estorban), el **ratón** (`click` como evento de activación universal, `dblclick`) y los **Pointer Events**, la API que unifica ratón, dedo y lápiz, con la técnica para arrastrar bien. En todos, la misma regla: cada interacción de puntero necesita su alternativa de teclado.

## El teclado

Una pulsación produce dos eventos: **`keydown`** al bajar la tecla y **`keyup`** al soltarla. Se disparan en el elemento que tiene el **foco** (un campo, un botón) o, si nadie lo tiene, en el `<body>`, y burbujean hasta `document`. Por eso los atajos globales se escuchan en `document`. Y por eso, en las vistas previas de esta lección, primero tienes que **hacer clic dentro**: si no, las teclas van a la página de LearnWeb y no a la del ejemplo.

### `key` y `code`

Cada evento de teclado trae dos nombres para la tecla, y la diferencia importa:

- **`event.key`**: lo que la tecla **significa** con la distribución de teclado actual y los modificadores: `'a'`, `'A'` (con Shift), `'ñ'`, `' '` (el espacio), `'Enter'`, `'ArrowUp'`, `'Shift'`.
- **`event.code`**: **dónde** está físicamente la tecla, con los nombres del teclado estadounidense: `'KeyA'`, `'Space'`, `'Enter'`, `'ArrowUp'`, `'ShiftLeft'`. No cambia con Shift ni con la distribución.

[[exercise:01-key-y-code.md]]

[[exercise:01-key-y-code.md-(script.js)]]

```text
Listo: haz clic en la vista previa y pulsa teclas
// Tras pulsar a, Shift + a y la ñ (con un teclado español o latinoamericano):
keydown · key: "a" · code: "KeyA"
keyup   · key: "a"
keydown · key: "Shift" · code: "ShiftLeft"
keydown · key: "A" · code: "KeyA"
keyup   · key: "A"
keyup   · key: "Shift"
keydown · key: "ñ" · code: "Semicolon"
keyup   · key: "ñ"
```

La `ñ` está donde el teclado estadounidense tiene el `;`, así que su `code` es `'Semicolon'`. Con una distribución estadounidense, esa misma tecla daría `key: ";"`. `JSON.stringify` muestra las comillas para que se vea el espacio (`" "`).

¿Cuál usar? Depende de qué te importa. Para un **significado** («deshacer» con Ctrl + Z, «ayuda» con `?`), `key`: el usuario busca la letra impresa en su teclado. Para una **posición** (las teclas WASD de un juego, que forman una cruz), `code`. El error típico es usar `key` para una posición:

[[exercise:02-key-depende-del-teclado.md-(script.js)]]

```text
Listo: haz clic en la vista previa y pulsa W, A, S, D; luego, con Bloq Mayús
// Tras pulsar W y D:
key "w" → movido · code KeyW → movido
key "d" → movido · code KeyD → movido
// Con Bloq Mayús activado, tras pulsar W:
🐛 key "W" → ignorada · ✅ code KeyW → movido
```

Con Bloq Mayús o Shift, `key` es `'W'`; en un teclado francés (AZERTY), la tecla de arriba a la izquierda escribe `'z'`. `code` es `'KeyW'` en todos los casos. Si comparas con `key`, normaliza con `toLowerCase()`.

### Modificadores, repetición y teclas obsoletas

Los modificadores llegan como booleanos en **todos** los eventos de teclado y de ratón: `shiftKey`, `altKey` (Option en macOS), `ctrlKey` y `metaKey` (⌘ en macOS, la tecla Windows en Windows). Un atajo «multiplataforma» suele aceptar `ctrlKey || metaKey`.

Si mantienes una tecla pulsada, el sistema operativo **repite** `keydown` con `event.repeat === true`, y al soltarla llega un solo `keyup`. Sirve para acciones que duran mientras se pulsa (avanzar una canción, acelerar en un juego) y para ignorar las repeticiones cuando no las quieres:

[[exercise:03-repeat-y-keyup.md-(script.js)]]

```text
Listo: haz clic en la vista previa y mantén pulsada la flecha → un par de segundos
// Tras mantenerla unos dos segundos y soltarla (los números varían):
⏩ keydown (repeat: false) → empieza el avance
⏹️ keyup → keydown: 1 + 22 repeticiones · keypress: 0 · posición 0:46
```

Verás en código antiguo el evento **`keypress`** y las propiedades `keyCode`, `which` y `charCode`. Están **obsoletos**: `keypress` solo llegaba con las teclas que escriben un carácter (por eso aquí cuenta 0) y los códigos numéricos dependían del navegador. Usa `keydown` con `key` o `code`.

### Componer caracteres: `isComposing`

Hay caracteres que se escriben en varios pasos: la `é` de un teclado español en macOS (la tecla de la tilde, que no escribe nada, y luego la `e`), o una palabra en japonés o chino, que se escribe en alfabeto latino y se convierte con un **IME**. Mientras dura la composición, `event.isComposing` es `true`, y Enter no significa «enviar», sino «confirma lo que estoy componiendo». Un chat que envía con Enter debe comprobarlo:

[[exercise:04-enter-para-enviar.md-(script.js)]]

```text
Listo: escribe «Hola», Shift + Enter, «¿Tienen cajeta?» y Enter
// Tras escribirlo y pulsar Enter:
📤 enviado: "Hola\n¿Tienen cajeta?"
// En macOS con teclado español, tras pulsar la tecla de la tilde (´) y Enter:
tecla muerta (key: "Dead") → empieza a componerse un carácter
⏸️ Enter durante una composición (isComposing: true) → no envío
```

La última parte depende del sistema: en macOS, la tecla muerta de la tilde inicia una composición en Chrome; en otros sistemas puede no hacerlo y no verás esas líneas. Para quien escribe en japonés, chino o coreano, sin esa comprobación cada palabra confirmada se enviaría a medias.

## Atajos de teclado que no estorban

En la lección «Acciones por defecto» viste el atajo que no deja escribir. Un buen atajo cumple, además, unas cuantas reglas de accesibilidad:

- **No robes teclas del navegador ni del sistema.** Cmd/Ctrl + T, W, N, L, R, F, P… son del navegador. Si usas una combinación con Ctrl o ⌘ (como Ctrl/⌘ + K para una paleta de comandos, muy extendida), que sea una que no tenga un uso importante, y llama a `preventDefault()` solo para ella.
- **Cuidado con los atajos de una sola tecla.** Quien usa control por voz «dicta» letras sueltas, y los lectores de pantalla usan letras para saltar entre encabezados o enlaces. Las pautas WCAG (criterio 2.1.4) piden que se puedan **desactivar** o cambiar, o que solo funcionen cuando el foco está en el componente. Y nunca mientras el usuario escribe en un campo.
- **Anúncialos.** `aria-keyshortcuts="/"` en el elemento que el atajo activa o enfoca se lo dice a las tecnologías de apoyo; un `<kbd>` visible, a todos los demás.
- **El atajo es un extra.** Todo lo que hace un atajo tiene que poder hacerse con un botón o un enlace.

[[exercise:05-atajos-accesibles.md-(index.html|script.js)]]

```text
Listo: haz clic en la vista previa (fuera del buscador) y pulsa «/»; luego Ctrl/⌘ + K
// Tras pulsar «/»:
🔎 «/» → foco en el buscador
// Tras pulsar ⌘ + K (macOS) o Ctrl + K:
🎛️ paleta de comandos abierta
```

En un teclado español la `/` se escribe con Shift + 7, y `key` sigue siendo `'/'`: por eso el atajo compara `key` y no `code`, y no exige que Shift esté suelta.

## El ratón

### `click`: el evento de activación

`click` es mucho más que «pulsar el botón izquierdo del ratón». Es el evento de **activación**: en un `<button>` llega con el ratón, con el dedo, con Enter y con Espacio, con el lápiz y con la orden «pulsar» de un lector de pantalla o de un programa de voz. Por eso, para que algo «se active», escucha `click` (no `mousedown` ni `pointerdown`) en un elemento interactivo de verdad. Un `<div>` con un listener de `click` solo funciona con el puntero:

[[exercise:06-click-desde-el-teclado.md-(script.js)]]

```text
Listo: pulsa los dos con el ratón; luego haz clic en el título «Reproductor» y usa Tab, Enter y Espacio
// Tras pulsar el div y el botón con el ratón:
▶ click en #div-play · detail: 1 (puntero)
foco → #button-play
▶ click en #button-play · detail: 1 (puntero)
// Tras hacer clic en el título y pulsar Tab, Enter y Espacio (el div no recibe el foco):
foco → #button-play
▶ click en #button-play · detail: 0 (teclado)
▶ click en #button-play · detail: 0 (teclado)
```

`event.detail` cuenta los clics seguidos y vale `0` cuando el `click` lo generó el teclado; en Chrome, es la forma más directa de distinguir los dos orígenes (no la necesitarás a menudo: lo normal es tratarlos igual). Los enlaces `<a href>` también se activan con Enter (pero no con Espacio), y las casillas con Espacio.

### `dblclick` empieza con dos clics

El navegador no puede saber, en el primer clic, si va a llegar un segundo. Así que un doble clic dispara **`click`** (`detail: 1`), otro **`click`** (`detail: 2`) y, al final, **`dblclick`**. Si el `click` hace algo que el segundo deshace (alternar una selección), el doble clic «parpadea»:

[[exercise:07-dblclick-tambien-hace-click.md-(script.js)]]

```text
Listo: haz doble clic en «informe-octubre.pdf» en cada lista
// Tras el doble clic en la lista 🐛:
click · detail: 1 → informe-octubre.pdf seleccionado
click · detail: 2 → 🐛 informe-octubre.pdf deseleccionado
dblclick → 📂 abro informe-octubre.pdf
// Tras el doble clic en la lista ✅:
click · detail: 1 → informe-octubre.pdf seleccionado
click · detail: 2 → ignorado (es parte de un doble clic)
dblclick → 📂 abro informe-octubre.pdf
```

`dblclick` no tiene equivalente en el teclado ni es cómodo en una pantalla táctil, así que lo que haga debe estar también en un botón visible («Abrir»). El resto de eventos de ratón: `mousedown`/`mouseup` (bajar y subir un botón), `contextmenu` (lección anterior), `auxclick` (un clic con el botón central o el derecho), `mousemove` y los `mouseover`/`mouseout`/`mouseenter`/`mouseleave` de la lección «Propagación». Hoy, para todos ellos, conviene usar los Pointer Events.

### Coordenadas

Los eventos de ratón y de puntero traen la posición en varios sistemas de referencia:

| Propiedad | Relativa a… |
|-----------|-------------|
| `clientX`, `clientY` | la ventana visible (no cambia al desplazar la página) |
| `pageX`, `pageY` | el documento entero (incluye lo desplazado) |
| `offsetX`, `offsetY` | el borde del relleno del `target` (cambia si el `target` es un hijo) |
| `screenX`, `screenY` | la pantalla |

La forma más fiable de saber la posición dentro de un elemento es `event.clientX - elemento.getBoundingClientRect().left`, con las medidas del módulo «El DOM»: no depende de qué hijo sea el `target`.

## Pointer Events

Los eventos de ratón nacieron antes que las pantallas táctiles, y los de toque (`touchstart`, `touchmove`, `touchend`) llegaron después con otra forma (listas de dedos). Los **Pointer Events** los unifican: los mismos eventos para ratón, dedo y lápiz, cada uno con un `pointerId` y un **`pointerType`** (`'mouse'`, `'touch'` o `'pen'`).

| Evento | Cuándo |
|--------|--------|
| `pointerdown` / `pointerup` | se pulsa / se suelta (un botón, el dedo, la punta del lápiz) |
| `pointermove` | el puntero se mueve (también sin pulsar, con ratón y lápiz) |
| `pointercancel` | el navegador se queda el gesto (para desplazar o hacer zoom) o el dispositivo desaparece |
| `pointerover` / `pointerout`, `pointerenter` / `pointerleave` | entra y sale, como sus versiones de ratón |
| `gotpointercapture` / `lostpointercapture` | empieza / termina una captura (ver abajo) |

[[exercise:08-pointer-events.md-(script.js)]]

```text
Listo: pulsa en la zona con el botón izquierdo y luego con el derecho
// Tras un clic izquierdo y un clic derecho con el ratón o el trackpad:
pointerdown · pointerType: mouse · button: 0 · buttons: 1 · isPrimary: true
pointerup · pointerType: mouse · button: 0 · buttons: 0 · isPrimary: true
pointerdown · pointerType: mouse · button: 2 · buttons: 2 · isPrimary: true
pointerup · pointerType: mouse · button: 2 · buttons: 0 · isPrimary: true
```

Un trackpad es un `'mouse'` (el clic con dos dedos es el botón derecho). Para ver `'touch'`, abre la vista previa con ↗ y activa el modo dispositivo de DevTools (Cmd + Shift + M en macOS, Ctrl + Shift + M en Windows), que simula un dedo. Dos propiedades se confunden a menudo: **`button`** dice qué botón **cambió** en este evento (0 izquierdo, 1 central, 2 derecho), y **`buttons`** dice cuáles están pulsados **ahora**, sumados como bits (1 izquierdo, 2 derecho, 4 central). Con varios dedos, cada uno tiene su `pointerId`, y solo el primero es `isPrimary`.

## Arrastrar

Arrastrar es un trío de eventos: `pointerdown` empieza, `pointermove` actualiza la posición y `pointerup` termina. Con el ratón, el problema aparece en cuanto el puntero se mueve más deprisa que lo que arrastras: sale del elemento, y los `pointermove` (y el `pointerup`) pasan a ir al elemento que haya debajo. La solución es **`elemento.setPointerCapture(event.pointerId)`** en el `pointerdown`: «todos los eventos de este puntero, a mí, hasta que se suelte», aunque salga del elemento o de la vista previa:

[[exercise:09-arrastrar-sin-setpointercapture.md-(script.js)]]

```text
Listo: arrastra los dos tiradores deprisa, saliéndote de ellos
// Tras arrastrar el tirador 🐛 hacia arriba, fuera de él:
🐛 el puntero salió del tirador: arrastre perdido
// Tras arrastrar igual el tirador ✅ y soltar (el número varía):
✅ con captura: soltado en 83
// Con el teclado (Tab hasta el primer tirador y la flecha →):
🐛 sin captura: ArrowRight → 55
```

Fíjate también en el síntoma más raro del 🐛: si sueltas el botón fuera del tirador, el `pointerup` nunca le llega, y al volver a pasar por encima el tirador te sigue sin que pulses nada. La captura termina sola al soltar (`lostpointercapture`). Y fíjate en la alternativa de teclado: un control deslizante propio necesita `role="slider"`, `aria-valuenow` y las flechas; si no necesitas un diseño especial, `<input type="range">` lo trae todo hecho.

### Con el dedo: `touch-action`

En una pantalla táctil hay otra trampa. Antes de enviar los `pointermove`, el navegador decide si el gesto es **suyo** (desplazar la página, hacer zoom) según la propiedad CSS `touch-action` del elemento, que por defecto es `auto`: «el gesto es mío». Si decide quedárselo, desplaza la página y envía **`pointercancel`**: se acabaron los eventos para tu script. Con ratón no pasa nada, así que el error suele descubrirse en el móvil:

[[exercise:10-arrastrar-en-pantallas-tactiles.md-(script.js)]]

```text
Listo: arrastra las dos pegatinas hacia abajo; para el dedo, abre la vista previa con ↗ y usa el modo dispositivo de DevTools
// En el modo dispositivo (dedo simulado), tras arrastrar hacia abajo A y después B:
#sticker-a · pointerdown · pointerType: touch
🐛 #sticker-a · pointercancel: el navegador usó el gesto para desplazar la página
#sticker-b · pointerdown · pointerType: touch
✅ #sticker-b · soltada
// Con el ratón, las dos funcionan (pointerType: mouse y «soltada»).
```

`touch-action: none` en el elemento que se arrastra le deja el gesto entero al script; `pan-y` le deja al navegador el desplazamiento vertical (útil para un carrusel horizontal). Ponlo solo en lo que se arrastra, nunca en toda la página: el usuario tiene que poder desplazarla. Con el dedo, por cierto, el navegador **ya** captura el puntero en el elemento del `pointerdown`; `setPointerCapture` es necesario para el ratón y el lápiz.

> **Desde Python:** en Tkinter, `<KeyPress>` trae `event.keysym` (el nombre de la tecla, como `key`) y `event.keycode` (un número que depende del sistema; `code` es la versión estandarizada). Y un arrastre con `<B1-Motion>` no tiene el problema del ejemplo 09: mientras el botón está pulsado, Tk envía el movimiento al widget donde empezó, como si siempre hubiera una captura. En el navegador, esa captura la pides tú.

## Bestiario

- **El atajo deja de funcionar con Bloq Mayús o en otro teclado.**
  Síntoma: controles por teclado que fallan con Shift, con Bloq Mayús o con distribuciones como AZERTY.
  Causa: se comparó `event.key` (el carácter, que cambia con los modificadores y la distribución) para una posición física.
  Solución: `event.code` para posiciones (juegos); `event.key`, normalizado, para significados (atajos).
  → [ver ejemplo](02-key-depende-del-teclado.md)
- **El «botón» no funciona con el teclado.**
  Síntoma: un elemento responde al ratón, pero Tab lo salta y Enter o Espacio no hacen nada.
  Causa: es un `<div>` (o un `<span>`, un `<li>`) con un listener de `click`; no es interactivo ni enfocable.
  Solución: usa `<button>` (o `<a href>` si navega); recibe el foco y convierte Enter y Espacio en `click`.
  → [ver ejemplo](06-click-desde-el-teclado.md)
- **El doble clic deshace lo que hizo el clic.**
  Síntoma: al hacer doble clic, la selección aparece y desaparece antes de abrir.
  Causa: un doble clic dispara dos `click` antes del `dblclick`.
  Solución: ignora los `click` con `event.detail > 1`, o que el clic solo seleccione (sin alternar); ofrece también un botón.
  → [ver ejemplo](07-dblclick-tambien-hace-click.md)
- **El arrastre se corta si el ratón va deprisa.**
  Síntoma: al arrastrar, el elemento se queda atrás; si sueltas fuera, sigue pegado al puntero.
  Causa: los `pointermove` y el `pointerup` van al elemento que hay bajo el puntero, que ya no es el que arrastras.
  Solución: `setPointerCapture(event.pointerId)` en el `pointerdown`.
  → [ver ejemplo](09-arrastrar-sin-setpointercapture.md)
- **Con el dedo, el arrastre se corta y la página se desplaza.**
  Síntoma: arrastrar funciona con el ratón, pero en el móvil la página se mueve y llega `pointercancel`.
  Causa: con `touch-action: auto`, el navegador se queda el gesto táctil para desplazar.
  Solución: `touch-action: none` (o `pan-y`, `pan-x`) en el elemento que se arrastra.
  → [ver ejemplo](10-arrastrar-en-pantallas-tactiles.md)

## Resumen

- `keydown`/`keyup` llegan al elemento con el foco y burbujean; los atajos globales se escuchan en `document`.
- `key` es el significado (cambia con Shift y la distribución); `code`, la posición física.
- `repeat` marca las repeticiones de una tecla mantenida; `keypress` y `keyCode` están obsoletos; `isComposing` protege a quien compone caracteres.
- Atajos: sin robar teclas del navegador, desactivables si son de una tecla, anunciados con `aria-keyshortcuts` y `<kbd>`, y siempre con alternativa.
- `click` es el evento de activación (ratón, teclado, voz): úsalo en elementos interactivos de verdad.
- Un doble clic son dos `click` y un `dblclick`; `detail` cuenta los clics (0 si vino del teclado).
- Los Pointer Events unifican ratón, dedo y lápiz (`pointerType`, `button`, `buttons`).
- Para arrastrar: `setPointerCapture` y `touch-action: none` en lo que se arrastra, y una alternativa con el teclado.

## Para profundizar

- [MDN: KeyboardEvent.key y KeyboardEvent.code](https://developer.mozilla.org/es/docs/Web/API/KeyboardEvent/key)
- [MDN: Pointer Events](https://developer.mozilla.org/es/docs/Web/API/Pointer_events)
- [javascript.info: eventos de puntero](https://es.javascript.info/pointer-events)
- [WCAG 2.2: criterio 2.1.4, atajos de una sola tecla (en inglés)](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html)
- [MDN: touch-action](https://developer.mozilla.org/es/docs/Web/CSS/touch-action)
