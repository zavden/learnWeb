# Integración: eventos

## Por qué importa

Las seis lecciones de este módulo enseñan piezas sueltas: registrar y quitar listeners, el viaje del evento por el árbol, la delegación, las acciones por defecto, los dispositivos de entrada y los eventos propios. Un componente de verdad las usa todas a la vez. Un menú desplegable necesita teclado, foco, un clic fuera que nadie pueda tapar y listeners que existan solo mientras está abierto. Un tablero kanban necesita delegación, arrastre con puntero, una alternativa de teclado y una forma de avisar a quien le interese.

Los ejemplos de esta página combinan varias lecciones en cada programa. Todos imprimen al cargar una línea `Listo: …` con lo que hay que hacer; ábrelos con «▶ Run» o en el editor para ver la consola, o úsalos directamente en las tarjetas, que llevan su propio registro. Los tres ejercicios del final se corrigen solos: sus comprobaciones **simulan** los clics y las teclas con `dispatchEvent`, como un test automático.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| reaccionar a algo | `addEventListener(tipo, función)`, nunca `onclick =` | «Escuchar eventos» |
| listeners que viven mientras algo está abierto | un `AbortController` por apertura y `{ signal }` en todos | «Escuchar eventos» |
| muchos elementos, también los que llegarán | un listener en el contenedor y `closest` (+ `contains`) | «Delegación de eventos» |
| el elemento que escucha | `event.currentTarget` (guárdalo antes de un `await`) | «Propagación» |
| saber si el foco entra o sale de un componente | `focusin`/`focusout` y `relatedTarget` | «Propagación» |
| un «clic fuera» que nadie pueda tapar | un listener en `document` en la fase de captura | «Propagación» |
| enviar un formulario con JavaScript | `submit` en el formulario y `preventDefault()` antes de cualquier `await` | «Acciones por defecto» |
| eventos en ráfaga | `debounce` (al final) o `throttle`/`requestAnimationFrame` (mientras dura) | «Acciones por defecto» |
| atajos de teclado | `key`, sin modificadores, fuera de los campos, desactivables si son de una tecla | «Teclado, ratón y puntero» |
| activar algo | `click` en un `<button>` (vale para ratón, teclado y voz) | «Teclado, ratón y puntero» |
| arrastrar | Pointer Events, `setPointerCapture`, `touch-action: none` y una alternativa con teclas | «Teclado, ratón y puntero» |
| avisar sin conocer a quien escucha | `CustomEvent` con `bubbles: true` y `detail`, después de cambiar el estado | «Eventos personalizados» |
| un objeto que emite eventos | `class X extends EventTarget` | «Eventos personalizados» |

Dos reglas atraviesan la tabla. La primera: **cada interacción de puntero tiene su alternativa de teclado**, y el estado se anuncia también a quien no ve la pantalla (`aria-expanded`, `aria-pressed`, `aria-valuenow`, una región `aria-live`). La segunda: **los componentes se comunican con eventos, no llamándose entre sí**; así se pueden quitar, duplicar o probar por separado.

## Ejemplos combinados

### Un tablero kanban arrastrable

Las tarjetas se arrastran por su asa (un `<button>`, así que también recibe el foco). Un único listener de cada tipo en el tablero atiende todas las tarjetas: `pointerdown` captura el puntero y **mide las columnas una sola vez**, `pointermove` mueve la tarjeta con `translate` y resalta la columna de destino, y `pointerup` la mueve en el DOM con `append`. Con el teclado, las flechas ← → desde el asa hacen lo mismo. Al mover un nodo con el foco dentro, el foco se pierde: el código lo devuelve al asa. Cada movimiento se anuncia con un evento `card:move`, que aquí escuchan el anunciador `aria-live` y el registro.

[[exercise:01-kanban-arrastrable.md]]

[[exercise:01-kanban-arrastrable.md-(script.js)]]

```text
Listo: arrastra una tarjeta por su asa ⠿, o Tab hasta un asa y ← →
// Tras Tab hasta el asa de «Fotos de los tuestes» y la flecha →:
➡️ T-12: Por hacer → En curso (teclado)
// Tras arrastrar «Página de suscripción» hasta la columna «Hecho»:
➡️ T-15: Por hacer → Hecho (arrastre)
```

### Un carrito con un store de eventos

El estado del carrito vive en una clase `CartStore extends EventTarget`, que avisa con `change` cada vez que cambia. Tres componentes se suscriben sin conocerse: las líneas del carrito (pintadas con una plantilla y `replaceChildren`), el total y un registro de depuración, registrado el último para leer el total ya actualizado (los listeners se ejecutan en orden de registro). Cada componente recibe una señal al montarse; «Desmontar el total» llama a `abort()` y el total deja de actualizarse sin que nadie más se entere.

[[exercise:02-carrito-con-store.md-(script.js)]]

```text
Listo: añade dos cafés y un cacao, quita un café; luego desmonta el total y añade otro
// Tras añadir dos cafés y un cacao y quitar un café:
➕ CAF-500 · total $210.00
➕ CAF-500 · total $420.00
➕ CAC-250 · total $565.00
➖ CAF-500 · total $355.00
// Tras «Desmontar el total» y añadir una vainilla:
⏏️ total desmontado: ya no se actualiza (las líneas sí)
➕ VAI-001 · total $355.00
```

### Un menú desplegable accesible

Dos menús independientes con el patrón de WAI-ARIA: el botón (`aria-haspopup`, `aria-expanded`) abre con un clic, con Enter o con ↓ (que enfoca la primera opción) o ↑ (la última); dentro, las flechas, Inicio y Fin mueven el foco, y Escape cierra y lo devuelve al botón. Se cierra también si el foco sale del componente (`focusout` con `relatedTarget`) o con un clic fuera escuchado **en captura**: el widget de ayuda de abajo, que llama a `stopPropagation()`, no consigue dejarlo abierto. Todos los listeners de «abierto» comparten la señal de un `AbortController` que se aborta al cerrar.

[[exercise:03-menu-desplegable-accesible.md]]

```text
Listo: abre «Ordenar por» y pulsa «Exportar»; abre uno con ↓, usa las flechas y Escape; abre uno y pulsa el widget 💬
// Tras abrir «Ordenar por» con un clic y pulsar «Exportar»:
▾ «Ordenar por» abierto
▴ «Ordenar por» cerrado: el foco salió
▾ «Exportar» abierto
// Tras ↓ y Escape:
▴ «Exportar» cerrado: Escape (el foco vuelve al botón)
// Tras abrir «Ordenar por» y pulsar el widget 💬:
▾ «Ordenar por» abierto
▴ «Ordenar por» cerrado: clic fuera
💬 el widget de ayuda detuvo la propagación
```

Fíjate en el segundo bloque: al pulsar «Exportar», el foco pasa a ese botón **antes** del clic, así que el primer menú se cierra por `focusout`. El widget de ayuda no recibe el foco (es un párrafo), y ahí es la captura la que hace el trabajo.

[[exercise:03-menu-desplegable-accesible.md-(script.js)]]

### Un buscador con sugerencias

Cada pulsación lanza, con *debounce*, una petición de sugerencias a un servidor simulado en el que las consultas cortas tardan más; antes de cada petición, la anterior se cancela con su `AbortController`, así que una respuesta lenta nunca pisa a una nueva. Enter (o «Buscar») dispara `submit`, que se cancela en la primera línea y busca de verdad; Escape cierra las sugerencias sin borrar el campo, y un listener delegado atiende la lista de sugerencias. El *debounce* tiene un `cancel()`, para que una sugerencia pendiente no aparezca encima de los resultados.

[[exercise:04-buscador-con-sugerencias.md-(script.js)]]

```text
Listo: escribe «pozole» seguido y pulsa Enter; luego escribe «mo» y elige una sugerencia
// Tras escribir «pozole» y pulsar Enter (los contadores dependen de tu ritmo):
🔎 «pozole» → 2 resultado(s) · input: 6, peticiones de sugerencias: 1, canceladas: 0
// Tras borrar, escribir «mo» y pulsar la sugerencia «Mole poblano» (contadores acumulados; varían):
🔎 «Mole poblano» → 1 resultado(s) · input: 14, peticiones de sugerencias: 3, canceladas: 1
```

### Una galería con atajos que no estorban

Un visor de grabados con miniaturas creadas desde los datos y un listener delegado. Los atajos siguen las reglas de la lección «Teclado, ratón y puntero»: nada con Ctrl, ⌘ o Alt (son del navegador), nada mientras se escribe en la nota ni con la ayuda abierta, los de una sola tecla (`i`, `?`) se pueden desactivar, cada uno se anuncia con `aria-keyshortcuts` y todo tiene su botón visible. La ayuda es un `<dialog>` modal, que ya trae el cierre con Escape.

[[exercise:05-galeria-con-atajos.md]]

```text
Listo: haz clic en la vista previa y pulsa → → i ?; luego escribe una «i» en la nota (no debe ocultar la ficha)
// Tras → → i ?:
🖼️ 2/4 «El Fuji rojo» (tecla ArrowRight)
🖼️ 3/4 «Lluvia repentina en Ōhashi» (tecla ArrowRight)
ℹ️ ficha oculta (tecla i)
❓ ayuda abierta (tecla ?)
// Tras cerrar la ayuda y escribir «i» en la nota: ninguna línea nueva
```

### Deshacer y rehacer con eventos

Cada cambio de la lista de tareas se hace y se **anuncia** con un evento `todo:change` que lleva en `detail` cómo deshacerlo y rehacerlo. Un historial, que no sabe nada de tareas, apila esos avisos y atiende los botones y los atajos (Ctrl/⌘ + Z y Ctrl/⌘ + Shift + Z, con `key` normalizado a minúsculas porque Shift lo vuelve `'Z'`), salvo dentro de los campos, donde deshacer es cosa del texto. «Pausar el historial» aborta su señal: fuera los cuatro listeners a la vez.

[[exercise:06-deshacer-con-eventos.md-(script.js)]]

```text
Listo: añade «Abonar las calabazas», quita «Atar las judías», pulsa Ctrl/⌘ + Z dos veces y Ctrl/⌘ + Shift + Z
// Tras añadir y quitar:
✎ añadir «Abonar las calabazas»
✎ quitar «Atar las judías»
// Tras Ctrl/⌘ + Z dos veces y Ctrl/⌘ + Shift + Z (con el foco fuera del campo):
↶ deshecho: quitar «Atar las judías»
↶ deshecho: añadir «Abonar las calabazas»
↷ rehecho: añadir «Abonar las calabazas»
```

### Un monitor de eventos

Una herramienta como el panel de eventos de DevTools: **un** objeto con `handleEvent` se registra en `window`, en captura, para una docena de tipos, y anota cada evento que ocurre en el formulario de prueba con su `target` e `isTrusted`. Para saber si alguien lo canceló, lee `defaultPrevented` con un `setTimeout`, cuando el viaje ya terminó; una microtarea no valdría, porque con un evento real se ejecuta justo después del listener que la creó, antes que los demás (el acertijo de la lección «Eventos personalizados»).

[[exercise:07-monitor-de-eventos.md]]

```text
Listo: pulsa «Condiciones», la casilla de «Novedades» y «Enviar»; luego escribe en el correo
// Tras pulsar «Condiciones»:
pointerdown → #terms · trusted: true
pointerup → #terms · trusted: true
click → #terms · trusted: true · cancelado
// Tras pulsar la casilla de «Novedades»:
pointerdown → input[name=news] · trusted: true
pointerup → input[name=news] · trusted: true
click → input[name=news] · trusted: true
input → input[name=news] · trusted: true
change → input[name=news] · trusted: true
// Tras pulsar «Enviar»:
pointerdown → button · trusted: true
pointerup → button · trusted: true
click → button · trusted: true
submit → #demo · trusted: true · cancelado
```

[[exercise:07-monitor-de-eventos.md-(script.js)]]

### Un filtro de precio con dos tiradores

Un control con dos tiradores (`role="slider"`), cada uno limitado por el otro, que avisa con `range:change`. Mientras se arrastra, los avisos se agrupan **uno por frame** con `requestAnimationFrame`; al soltar, o con el teclado, el aviso lleva `committed: true`. La lista de cafés escucha ese evento y se filtra: el componente no sabe que existe. Teclado completo según el patrón de WAI-ARIA: flechas, RePág/AvPág (pasos grandes; Fn + ↑/↓ en un Mac), Inicio y Fin.

[[exercise:08-filtro-de-precio-con-dos-tiradores.md]]

```text
Listo: arrastra los tiradores; o Tab hasta uno y usa las flechas, RePág/AvPág, Inicio y Fin
// Tras Tab hasta el tirador mínimo y RePág dos veces:
💲 $150 – $400 → 6 cafés
💲 $200 – $400 → 4 cafés
// Tras arrastrar el tirador máximo hasta $300 y soltar:
💲 $200 – $300 → 3 cafés
```

[[exercise:08-filtro-de-precio-con-dos-tiradores.md-(script.js)]]

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Como no puedes pulsar nada mientras se ejecutan, las comprobaciones **simulan** los clics, las teclas y los demás eventos con `dispatchEvent` (`new MouseEvent('click', { bubbles: true })`, `new KeyboardEvent('keydown', { key })`…) y después miran el DOM y el estado. Al abrirlos, todas salen en rojo.

### Delega la lista de la compra

Una lista con un listener en cada botón, que además lee `event.target`: pulsar el icono de un botón no hace nada, y los productos añadidos después no responden. Sustituye los listeners por uno solo, delegado en la lista. Cinco comprobaciones.

[[exercise:09-ej-delega-la-lista.md]]

### Listeners que de verdad se quitan

Un visor de fotos registra al abrirse tres listeners (teclado, clic fuera en captura, `resize`) que `closeViewer` intenta quitar con flechas nuevas y sin `capture`. Tras abrir y cerrar varias veces, una flecha avanza varias fotos. Arréglalo con un `AbortController` por apertura. Cuatro comprobaciones.

[[exercise:10-ej-listeners-que-se-quitan.md]]

### Caza los seis bugs de eventos

La ficha de un producto tiene seis bugs, uno por bloque, todos del Bestiario de este módulo: un evento propio que no burbujea y no lleva datos, un aviso anterior al cambio de estado, un `onclick` pisado, un listener de `focus` en el formulario, una rueda pasiva y un `preventDefault()` después de un `await`. El `submit` simulado de la comprobación no burbujea, para que la vista previa de LearnWeb no lo intercepte en `window`. Seis comprobaciones.

[[exercise:11-ej-caza-los-bugs-de-eventos.md]]

## Resumen

- Un componente que se abre crea un `AbortController` y registra con su señal todo lo que necesita; cerrar es un `abort()`.
- La delegación con `closest` (y `contains`) atiende a todos los elementos, también a los que se crean después.
- El «clic fuera» se escucha en captura; el foco que sale, con `focusout` y `relatedTarget`.
- Arrastrar: captura del puntero, medidas al empezar, `touch-action: none` en el asa y siempre una alternativa con teclas.
- Los avisos de alta frecuencia se agrupan por frame; los de búsqueda, con *debounce* y cancelación de lo anterior.
- Los componentes avisan con eventos propios que burbujean y llevan `detail`; un store que extiende `EventTarget` los une.
- Los atajos no estorban: sin modificadores, fuera de los campos, desactivables, anunciados y con botón.
- Los eventos simulados con `dispatchEvent` permiten probar los componentes sin ratón ni teclado.

## Para profundizar

- [WAI-ARIA APG: botón de menú (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [WAI-ARIA APG: slider de dos tiradores (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/)
- [MDN: Pointer Events](https://developer.mozilla.org/es/docs/Web/API/Pointer_events)
- [javascript.info: drag and drop con eventos del ratón](https://es.javascript.info/mouse-drag-and-drop)
