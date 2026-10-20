# Ejemplos profesionales

## Por qué importa

Casi todo lo que hace interactiva una aplicación web es un componente que escucha eventos: pestañas, menús, paletas de comandos, listas que se reordenan, carruseles, diálogos, asistentes por pasos. Las librerías de componentes (Radix, Headless UI, React Aria, Shoelace…) resuelven exactamente lo que verás aquí: el teclado completo que piden las pautas de WAI-ARIA, el foco que nunca se pierde, los arrastres que funcionan con ratón, dedo y teclado, y los eventos con los que esos componentes se comunican. Esta página reúne doce, escritos con todo lo que has visto hasta ahora en el curso: HTML, CSS, el lenguaje JavaScript, el DOM y este módulo.

Once tienen interfaz: úsalos en la tarjeta o ábrelos con «▶ Run» para ver también la consola. Uno, el bus de eventos, es un programa de consola. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **Teclado primero.** Cada interacción de puntero tiene su equivalente con teclas, siguiendo los patrones de WAI-ARIA (pestañas, menú, combobox, slider), y el estado se anuncia con atributos ARIA o con una región `aria-live`.
- **El foco no se pierde.** Cuando un componente vuelve a pintar, mueve o borra el elemento que tenía el foco, se lo devuelve a algo sensato: el mismo control, el vecino, el botón que abrió el diálogo.
- **Pocos listeners y bien quitados.** Delegación en el contenedor, objetos con `handleEvent`, y un `AbortController` (o la baja que devuelve `on`) para todo lo que vive solo mientras algo está abierto.
- **Comunicación por eventos.** Cada componente avisa de lo que pasa con un evento propio (`tabs:change`, `list:reorder`, `color:change`, `file:action`…) y, cuando alguien puede querer impedirlo, pregunta antes con uno cancelable (`tabs:beforechange`, `wizard:beforenext`).
- **Las acciones por defecto, a favor.** Se cancela solo lo necesario (la tecla que es nuestra, el `submit` que gestiona el script, el arrastre nativo de un enlace) y nunca con `stopPropagation`.
- **Una autocomprobación.** Al cargar, cada ejemplo prueba su propio componente con eventos simulados (`dispatchEvent`), sin mover el foco de la página ni ensuciar el registro, y deja todo como estaba. Las líneas `✓` de la consola son esa prueba.

Los cambios de estado son instantáneos: las transiciones y animaciones de CSS llegan en su módulo.

## Pestañas accesibles

El patrón de pestañas de WAI-ARIA con activación automática: *roving tabindex* (solo la pestaña activa está en el orden de Tab), flechas con vuelta al principio, Inicio y Fin. Un solo objeto `Tabs` con `handleEvent` atiende `click` y `keydown`. Lo interesante es el evento cancelable `tabs:beforechange`: el panel de notas lo usa para impedir el cambio si hay texto sin guardar y ofrecer guardar o descartar, sin que las pestañas sepan nada de notas. Fíjate también en cómo el foco solo se mueve si ya estaba en la lista.

[[exercise:01-pestanas-accesibles.md]]

```text
Autocomprobación (simulada):
  ✓ 3 pestañas, cada una con su panel (aria-controls ↔ aria-labelledby)
  ✓ solo la pestaña activa tiene tabindex 0
  ✓ → activa «Preparación» y muestra solo su panel
  ✓ Fin activa la última
  ✓ con notas sin guardar, el cambio se cancela
  ✓ tras descartar, Inicio vuelve a la primera
Listo: Tab hasta las pestañas y usa ← → Inicio Fin; escribe una nota y prueba a cambiar de pestaña
// Tras Tab hasta las pestañas, → y Fin:
📑 tab-ingredients → tab-steps (tecla ArrowRight)
📑 tab-steps → tab-notes (tecla End)
// Tras escribir una nota y pulsar la pestaña «Preparación»:
⛔ tab-steps: notas sin guardar (clic)
// Tras «Guardar» y pulsar otra vez «Preparación»:
💾 notas guardadas
📑 tab-notes → tab-steps (clic)
```

## Paleta de comandos

Ctrl/⌘ + K abre un `<dialog>` modal con un campo que filtra los comandos sin distinguir tildes ni mayúsculas (`normalize('NFD')` y fuera los signos diacríticos, sin expresiones regulares). Es un *combobox*: el foco se queda en el campo y la opción activa se comunica con `aria-activedescendant`, así que se puede seguir escribiendo mientras se elige con ↑ ↓. Enter o un clic ejecutan el comando, pero la paleta no sabe hacer nada: avisa con `command:run` y la aplicación decide. Escape y la vuelta del foco al botón los pone el `<dialog>`.

[[exercise:02-paleta-de-comandos.md]]

```text
Autocomprobación (simulada):
  ✓ 5 comandos al empezar, el primero activo
  ✓ «PEDÍDO» encuentra «Nuevo pedido» (sin tildes ni mayúsculas)
  ✓ busca también en las palabras clave («csv»)
  ✓ ↑ desde la primera da la vuelta hasta la última
  ✓ ↓ ↓ avanzan hasta la segunda
  ✓ Enter ejecuta la activa con un evento command:run
  ✓ sin coincidencias: 0 opciones y «Sin resultados»
Listo: pulsa Ctrl/⌘ + K, escribe «expo», pulsa Enter; ábrela otra vez, usa ↓ y cierra con Escape
// Tras Ctrl/⌘ + K, «expo» y Enter:
▾ paleta abierta (Ctrl/⌘ + K)
▶ Exportar ventas del mes → Exportando ventas de octubre…
▴ paleta cerrada
// Tras abrirla otra vez, ↓ y Escape:
▾ paleta abierta (Ctrl/⌘ + K)
▴ paleta cerrada
```

## Lista reordenable

La ruta de reparto se reordena arrastrando cada parada por su asa o con el teclado: Espacio la agarra, ↑ ↓ la mueven, Espacio la suelta y Escape la devuelve a su sitio. Con el puntero, la parada no se mueve en el DOM durante el arrastre: sigue al dedo con `translate` y una línea marca dónde caerá, de modo que las posiciones medidas al empezar (todas las lecturas juntas) valen hasta el final. Cada paso se anuncia en una región `aria-live`, y el resultado sale en `list:reorder` con el orden nuevo.

[[exercise:03-lista-reordenable.md]]

```text
Autocomprobación (simulada):
  ✓ 5 paradas, cada asa es un botón con nombre
  ✓ Espacio agarra la parada (y no se convierte en click)
  ✓ ↓ ↓ y Espacio: S1 pasa a la tercera posición
  ✓ Escape cancela y la devuelve a su sitio
  ✓ la región aria-live anunció la cancelación
Listo: arrastra «Panadería Rosetta» al principio; luego Tab hasta un asa, Espacio, ↓ y Espacio
// Tras arrastrar «Panadería Rosetta» al principio:
↕ S3: posición 3 → 1 · ruta S3 S1 S2 S4 S5
// Tras Tab hasta la primera asa (la de «Panadería Rosetta»), Espacio, ↓ y Espacio:
↕ S3: posición 1 → 2 · ruta S1 S3 S2 S4 S5
```

## Selector de color

Un selector HSL sin `canvas`: el plano de saturación y luminosidad es un degradado de CSS que depende de una variable (`--hue`), y los dos controles son `role="slider"` hechos con Pointer Events (captura y una medida al empezar) y con teclado (flechas; con Shift, de 10 en 10). El área es bidimensional, así que su `aria-valuetext` describe los dos valores con palabras. El selector avisa con `color:change`; la vista previa calcula el contraste WCAG con blanco y negro y elige el color del texto. El registro solo anota los valores confirmados, no cada `pointermove`.

[[exercise:04-selector-de-color.md]]

```text
Autocomprobación (simulada):
  ✓ hsl(0 100% 50%) → #ff0000
  ✓ el color inicial hsl(24 80% 45%) es #cf6017
  ✓ contraste de #1d4ed8 con blanco: 6.70:1
  ✓ Shift + → en el área sube la saturación de 10 en 10 (80 → 90)
  ✓ RePág en la tira suma 30° al tono (24 → 54)
  ✓ Fin lleva el tono a 360 y aria-valuenow lo refleja
Listo: arrastra en el área y en la tira de tonos; o Tab hasta ellas y usa las flechas (con Shift, de 10 en 10)
// Tras Tab hasta el área y Shift + ↑ (luminosidad 45 → 55):
🎨 #e87a30 · hsl(24 80% 55%) · texto negro (7.26:1)
```

## Diálogo con cambios sin guardar

Editar la dirección de envío en un `<dialog>` modal con `<form method="dialog">`: los botones de envío cierran el diálogo y dejan su `value` en `returnValue`, y un único listener de `close` decide qué hacer. Si hay cambios, Escape (el evento `cancel`) y «Cancelar» (un `submit`) se cancelan con `preventDefault()` y aparece una confirmación dentro del propio diálogo. Fíjate en el comentario sobre Chrome: si se pulsa Escape dos veces seguidas sin otra interacción, el segundo `cancel` ya no se puede cancelar y el diálogo se cierra; el listener de `close` lo trata como «descartar». El foco vuelve solo al botón que abrió el diálogo.

[[exercise:05-dialogo-con-cambios-sin-guardar.md]]

```text
Autocomprobación (simulada):
  ✓ escribir en un campo marca cambios sin guardar
  ✓ Escape (cancel) con cambios: se impide y aparece la confirmación
  ✓ «Cancelar» con cambios: también se impide
  ✓ guardar avisa con address:save y actualiza la vista
  ✓ tras guardar ya no hay cambios pendientes
Listo: pulsa «Editar dirección», cambia la calle y pulsa Escape; elige «Seguir editando», luego «Guardar»
// Tras «Editar dirección», cambiar la calle a «Calle Durango 45» y pulsar Escape:
▾ diálogo abierto
⚠️ Escape con cambios sin guardar → confirmación
// Tras «Seguir editando» y «Guardar»:
💾 guardada: Calle Durango 45, 06000
```

## Cargar más

Un catálogo por páginas con un botón «Cargar más», que es la vía principal (funciona con teclado y no aleja el pie de página), y una carga automática opcional al acercarse al final, con un listener de `scroll` pasivo y limitado con *throttle*. Solo hay una petición a la vez, con su `AbortController`; mientras carga, `aria-busy="true"` evita que el lector de pantalla lea una lista a medias. Cada página se pinta con una plantilla en un `DocumentFragment` (una inserción) y se anuncia con `feed:loaded`. La autocomprobación es asíncrona: tarda medio segundo en aparecer.

[[exercise:06-cargar-mas.md]]

```text
Autocomprobación (simulada):
  ✓ la primera página trae 6 cafés y aria-busy vuelve a false
  ✓ una carga cancelada no añade nada
  ✓ dos peticiones a la vez cargan UNA página (6 → 12)
  ✓ los precios salen formateados como texto
Listo: pulsa «Cargar más», o desplázate hasta el final de la lista; desmarca la casilla y prueba otra vez
// Tras «Cargar más»:
📦 página 2 (botón): +6 → 12 de 20
// Tras desplazarte hasta el final de la lista:
📦 página 3 (scroll): +6 → 18 de 20
```

## Gestor de atajos

Una clase `ShortcutManager` que extiende `EventTarget` y es su propio listener (`handleEvent`) en `document`. Las combinaciones se registran como texto normalizado (`mod+k`, `?`, `shift+e`), con un ámbito: los atajos de «lista» solo valen con el foco dentro de la lista. Cumple las reglas de la lección «Teclado, ratón y puntero»: nada de atajos de una tecla mientras se escribe ni con un diálogo abierto, y un interruptor para apagarlos (WCAG 2.1.4). Registrar un duplicado lanza un error, y la ayuda (`?`) se genera desde el propio registro con `Map.groupBy`, así que nunca se queda desactualizada.

[[exercise:07-gestor-de-atajos.md]]

```text
Autocomprobación (simulada):
  ✓ normaliza: Ctrl + Shift + K → «mod+shift+k»
  ✓ normaliza: Shift + ? → «?» (el Shift va implícito)
  ✓ rechaza un atajo duplicado
  ✓ «n» fuera de los campos crea un pedido
  ✓ «n» mientras se escribe en el buscador no hace nada
  ✓ con los atajos de una tecla desactivados, «n» no hace nada
  ✓ «e» en la lista archiva ese pedido (y cancela la tecla)
  ✓ «e» fuera de la lista no es un atajo
Listo: haz clic en la vista previa y pulsa «?»; ciérrala, pulsa «/», sal del buscador con Tab, entra en la lista y usa ↑ ↓ y «e»
// Tras «?»:
⌨️ ? (global) → Mostrar esta ayuda
// Tras cerrar la ayuda y pulsar «/»:
⌨️ / (global) → Ir al buscador
// Tras Tab (al primer pedido), ↓ y «e»:
⌨️ arrowdown (lista) → Pedido siguiente
⌨️ e (lista) → Archivar el pedido
```

## Bus de eventos

Un programa de consola: el bus de una tienda, sobre un `EventTarget` que no expone. `on` devuelve la función de baja y acepta `once` y `signal`; `emit` comprueba los datos contra el esquema de cada nombre (un evento desconocido o con un campo del tipo equivocado es un `TypeError` en quien emite) y despacha tres eventos, del más concreto al más general, para que funcionen los comodines `cart:*` y `*`. Un oyente que falla no corta a los demás ni sale como «Uncaught»: el bus lo atrapa y lo avisa con `bus:error`, que es un evento más (y por eso también lo ve el registro `*`).

[[exercise:08-bus-de-eventos.md-]]

```text
▶ emit cart:add (orden: exacto → cart:* → *)
  🛒 insignia → 2
  🎁 primera compra: envío gratis
  📊 analítica → cart:add CAF-500
  🔎 registro → cart:add
▶ emit cart:add otra vez (el aviso «once» ya no está)
  🛒 insignia → 3
  📊 analítica → cart:add CAC-250
  🔎 registro → cart:add
▶ emit cart:remove (solo comodines)
  📊 analítica → cart:remove CAF-500
  🔎 registro → cart:remove
▶ emit order:paid (un oyente falla; los demás siguen)
  ⚠️ bus:error en order:paid: la impresora de tickets no responde (P-2077)
  🔎 registro → bus:error
  🧾 factura de P-2077 por $640.00
  🔎 registro → order:paid
▶ datos que no encajan con el esquema
  ⛔ TypeError: cart:add: «quantity» debe ser number y es string
  ⛔ TypeError: evento desconocido: cart:empty
▶ bajas: la función de on y abort()
  🛒 insignia → 4
resumen → insignia: 4 · ¿es un EventTarget por dentro? sí, pero no lo expone: true
```

Fíjate en el orden del bloque de `order:paid`: el aviso de error y su registro salen **antes** que la factura. `dispatchEvent` es síncrono, así que el `bus:error` emitido dentro del primer oyente se reparte entero antes de que el segundo oyente de `order:paid` llegue a ejecutarse.

## Editor de tareas con deshacer

Un editor con el patrón «comando»: cada cambio (añadir, marcar, renombrar, quitar) es un objeto con `apply()` y `revert()`, y el historial guarda comandos, no copias del estado. El historial extiende `EventTarget` y avisa con `history:change`; los botones muestran qué van a deshacer. La lista se vuelve a pintar entera desde el estado, y `render()` recuerda qué control tenía el foco para devolvérselo; al quitar una tarea, el foco pasa a la vecina. Renombrar se hace en el sitio (botón «Editar», F2 o doble clic; Enter guarda y Escape cancela), y Ctrl/⌘ + Z no interfiere con el deshacer de los campos de texto.

[[exercise:09-editor-de-tareas-con-deshacer.md]]

```text
Autocomprobación (simulada):
  ✓ tres cambios con clics simulados y un comando
  ✓ el botón dice qué deshará
  ✓ Ctrl + Z tres veces vuelve al estado inicial (la tarea quitada, en su sitio)
  ✓ Ctrl + Shift + Z rehace el primero
  ✓ deshecho otra vez: se puede rehacer pero no deshacer
Listo: marca una tarea, renombra otra (Editar, F2 o doble clic) y quita la tercera; luego Ctrl/⌘ + Z tres veces
// Tras marcar la primera, renombrar la segunda («Etiquetar bolsas de 1 kg») y quitar la tercera:
✎ marcar «Tostar el lote 104»
✎ renombrar «Etiquetar bolsas de 500 g»
✎ quitar «Llamar al proveedor de vainilla»
// Tras Ctrl/⌘ + Z tres veces (con el foco fuera de los campos):
↶ deshecho: quitar «Llamar al proveedor de vainilla»
↶ deshecho: renombrar «Etiquetar bolsas de 500 g»
↶ deshecho: marcar «Tostar el lote 104»
```

## Carrusel deslizable

Un carrusel sin reproducción automática que se maneja con botones, indicadores y flechas, y que además se desliza con el dedo o el ratón. `touch-action: pan-y` deja al navegador el desplazamiento vertical de la página; el puntero se captura solo cuando el gesto ya es un deslizamiento (si se capturase en `pointerdown`, el clic de un simple toque iría a la ventana del carrusel y no al enlace). El cambio se decide por distancia o por velocidad. Dos trampas resueltas cancelando acciones por defecto: el arrastre nativo de los enlaces (`dragstart`) y el clic que llega al soltar tras deslizar. Las diapositivas ocultas son `inert`, para que Tab no entre en ellas. Y una trampa de CSS: un porcentaje en `translate` se mide sobre la caja del **propio** elemento, no sobre su contenido. La pista es un contenedor flex tan ancho como la ventana, con las diapositivas desbordándose, así que cada diapositiva es `-100%` (y no `-20%` «porque hay cinco»); por eso la autocomprobación mira también la posición real en pantalla, no solo el índice.

[[exercise:10-carrusel-deslizable.md]]

```text
Autocomprobación (simulada):
  ✓ 5 diapositivas con «n de 5»; solo la primera es accesible
  ✓ al empezar, «anterior» está desactivado
  ✓ «siguiente» lleva al producto 2
  ✓ el último indicador lleva al 5 y marca aria-current
  ✓ ← vuelve al 4
  ✓ el arrastre nativo de los enlaces está cancelado
  ✓ la diapositiva 4 está alineada con la ventana (±1 px)
Listo: desliza el carrusel (o arrástralo con el ratón); usa ‹ › y los puntos; o Tab hasta un botón y ← →
// Tras deslizar hacia la izquierda y pulsar «Ver producto»:
🎠 2/5 «Tamales de calabaza» (deslizar)
🔗 abriría /productos/tamales-de-calabaza
```

## Menú contextual de archivos

El clic derecho, la tecla de menú y Shift + F10 disparan `contextmenu` sobre el archivo; el botón «⋯» llama a la misma función. El menú es un popover con `role="menu"`, colocado junto al puntero y corregido si no cabe en la ventana (una escritura, una lectura del tamaño real y, si hace falta, otra escritura). Dentro, el patrón de WAI-ARIA: flechas, Inicio, Fin y la primera letra (repetida, salta a la siguiente opción con esa letra); Escape cierra y devuelve el foco. El menú no toca los archivos: avisa con `file:action`, y al eliminar uno el foco pasa al vecino.

[[exercise:11-menu-contextual-de-archivos.md]]

```text
Autocomprobación (simulada):
  ✓ contextmenu sobre un archivo: sin menú del navegador y con el nuestro abierto
  ✓ el menú dice de qué archivo es
  ✓ ↑ desde la primera opción da la vuelta hasta «Eliminar»
  ✓ «d» dos veces: «Duplicar» y luego «Descargar»
  ✓ elegir una opción cierra el menú y avisa con file:action
  ✓ fuera de los archivos se respeta el menú del navegador
Listo: clic derecho sobre «guia-de-envio.pdf»; recorre el menú con ↓ y elige «Duplicar»; luego pulsa un «⋯» y Escape
// Tras clic derecho sobre «guia-de-envio.pdf», ↓ ↓ y Enter:
📋 menú de guia-de-envio.pdf (contextmenu)
▶ duplicar → guia-de-envio.pdf
// Tras pulsar el «⋯» de «factura-P-2077.pdf» y Escape:
📋 menú de factura-P-2077.pdf (botón ⋯)
```

## Asistente por pasos

Una suscripción en cuatro pasos dentro de un solo formulario. «Siguiente» es un botón de envío, así que Enter también avanza y el código escucha un único `submit`, que cancela en su primera línea. El formulario lleva `novalidate` porque la validación nativa comprobaría también los pasos ocultos; cada paso se valida con `checkValidity()` y `reportValidity()`. Antes de avanzar, el asistente pregunta con `wizard:beforenext`, y la comprobación de la zona de reparto lo usa para vetar códigos postales de fuera de la ciudad. El foco va al título de cada paso y el progreso usa `aria-current="step"`. El resumen final se pinta con `FormData` y `textContent`.

[[exercise:12-asistente-por-pasos.md]]

```text
Autocomprobación (simulada):
  ✓ el paso 1 vacío no avanza
  ✓ con molienda y frecuencia, pasa al 2 y marca el progreso
  ✓ un código postal fuera de la zona veta el avance (wizard:beforenext)
  ✓ con 06000, pasa al paso 3
  ✓ «Atrás» vuelve al 2 conservando lo escrito
  ✓ el resumen muestra los datos como texto
  ✓ confirmar avisa con wizard:complete y los datos
Listo: elige café y frecuencia y pulsa Enter o «Siguiente»; prueba el código postal 97000 y luego 06000
// Tras elegir «Molido para cafetera» y «Cada 15 días» y pulsar Enter:
➡️ paso 2 (siguiente)
// Con el código postal 97000:
⛔ paso 2 vetado: código postal 97000 fuera de la zona
// Con 06000, el paso de pago y «Confirmar suscripción»:
➡️ paso 3 (siguiente)
➡️ paso 4 (siguiente)
✅ suscripción confirmada: café molido, quincenal, envío a 06000
```

## Para profundizar

- [WAI-ARIA Authoring Practices: patrones (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [MDN: el elemento dialog](https://developer.mozilla.org/es/docs/Web/HTML/Element/dialog)
- [MDN: Popover API](https://developer.mozilla.org/es/docs/Web/API/Popover_API)
- [web.dev: crear un carrusel accesible (en inglés)](https://web.dev/articles/carousel-best-practices)
