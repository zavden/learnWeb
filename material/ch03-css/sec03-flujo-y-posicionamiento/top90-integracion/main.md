# Integración: flujo normal y posicionamiento

## Qué vas a practicar

En las lecciones de este módulo viste cada pieza por separado: el flujo normal y el BFC, las cajas de línea y la línea base, los flotantes, `position` con sus bloques contenedores y el orden de pintado con sus contextos de apilamiento. En una página real aparecen todas a la vez, y los errores también: un menú que no se ve puede deberse a un `overflow` que lo recorta, a un contexto de apilamiento que lo atrapa o a un bloque contenedor equivocado.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira la vista previa y pregúntate tres cosas por cada caja que se sale de lo normal: **¿sigue en el flujo?**, **¿respecto a qué se coloca?** y **¿con quién compite para pintarse encima?** Si dudas, inspecciona la caja y sube por sus antepasados en **Elements → Computed** buscando `display`, `overflow`, `float`, `position`, `z-index`, `transform` e `isolation`. Al final hay cuatro ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: flujo normal, `inline-block`, flotantes y `position`. Flexbox, grid y las media queries llegan en los próximos módulos. Dos propiedades nuevas aparecen con un comentario que las explica: `scroll-padding` (el hueco que deja el navegador al saltar a un ancla) y `will-change` (como causa de un error).

## Un artículo con figuras flotantes

Un reportaje con **letra capitular** (`::first-letter` flotante), dos **figuras flotantes** a lados opuestos, una **cita destacada** que flota a la derecha y una sección que empieza por debajo de todo con **`clear: both`**. Las imágenes de las figuras son de **bloque**, para que el pie de foto no quede separado por el hueco de la línea base, y el artículo es un **`flow-root`** que contiene la última figura: el párrafo que viene después no se mete a su lado. Estrecha la vista previa: las figuras miden `min(45%, 15rem)` y nunca se comen el texto.

[[exercise:01-articulo-con-figuras-flotantes.md]]

## Tarjetas con insignia y cinta

Un escaparate de tarjetas **`inline-block` alineadas por arriba**. Cada tarjeta es **`relative`** y coloca en sus esquinas una insignia y un botón de favoritos; la foto también es `relative`, para que el sello de «Agotado» se **centre sobre ella** con `inset: 0`, `margin: auto` y `fit-content`, y no sobre la tarjeta. La cinta «Más vendido» sobresale con un desplazamiento negativo y dibuja su pliegue con un `::after` hecho de bordes. Los iconos de 1em bajan `0.125em` para centrarse con el texto, y cada tarjeta lleva **`isolation: isolate`**: el `z-index` de su cinta no puede salir a competir con el resto de la página.

[[exercise:02-tarjetas-con-insignia-y-cinta.md]]

## Un horario con cabecera y columna fijas

Un horario de autobuses ancho y largo dentro de **un solo contenedor de scroll** en los dos ejes. La fila de paradas es **`sticky` arriba**, la columna de servicios **`sticky` a la izquierda** y la esquina, sticky en las dos direcciones, tiene el **`z-index` más alto** para quedar encima de ambas. Dos detalles que suelen fallar: el contenedor necesita `max-height` para desplazarse en vertical (si no, la cabecera no tiene dónde pegarse), y la tabla usa `border-collapse: separate`, porque los bordes colapsados no viajan con las celdas sticky.

[[exercise:03-horario-con-cabecera-y-columna-fijas.md]]

## Un menú que no se recorta

Una lista de archivos con un menú de acciones en cada tarjeta. Las tarjetas llevan un adorno detrás del texto (`z-index: -1`), así que necesitan **`isolation: isolate`**, y lo recortan a sus esquinas con `overflow: hidden`. Resultado: el menú desplegado **queda recortado** y, además, la tarjeta siguiente (otro contexto de capa 0, posterior en el HTML) **se pinta encima**. La versión corregida mueve el recorte al elemento que lo necesita (el adorno) y sube la tarjeta que tiene el menú abierto con **`:has(details[open])`** y `:focus-within`.

[[exercise:04-menu-que-no-se-recorta.md]]

## Iconos en botones y listas

Botones con icono y texto, y un botón solo con icono, puestos en fila con **`vertical-align: top`** porque sus líneas base son distintas. Los iconos van **un poco por debajo de la línea base** para centrarse con mayúsculas y cifras. El contador de notificaciones sobresale por la esquina del botón con **desplazamientos negativos**. En la lista, el icono de cada elemento es un `::before` **absolute** en el hueco del relleno, centrado en la **primera línea** con `top: calc((1lh - 1em) / 2)`: las líneas siguientes quedan alineadas con el texto. Las teclas `kbd` son `inline-block` y se alinean solas por su línea base.

[[exercise:05-iconos-en-botones-y-listas.md]]

## Una ventana modal hecha a mano

Una página con una **cabecera `sticky`** y un enlace que abre una ventana modal con **`:target`**. La capa oscura es **`fixed` con `inset: 0`**; el panel se centra con `inset: 0`, `margin: auto` y `height: fit-content`, y tiene scroll propio si no cabe. Los `z-index` salen de una **escala en custom properties** (`--z-sticky`, `--z-modal`), y el contenido de la página es un contexto aislado. El enlace «Cerrar» apunta al enlace que la abrió, para que el teclado siga desde ahí. Es un ejercicio de posicionamiento: una modal de verdad se hace con `<dialog>` y `showModal()`, que va en la capa superior y atrapa el foco.

[[exercise:06-ventana-modal-con-target.md]]

## Una guía con cabecera y anclas

Una guía de etapas con **dos barras sticky apiladas**: la cabecera en `top: 0` y la navegación justo debajo, en `top: var(--header-h)`. La navegación tiene su propio scroll horizontal y aun así se pega, porque lo que estropea un sticky es el `overflow` de sus **antepasados**, no el suyo. Al saltar a una etapa, **`scroll-padding-top`** hace que el título quede debajo de las barras en lugar de tapado (lo mismo vale para el foco al navegar con <kbd>Tab</kbd>), y `:target` resalta la etapa elegida. El botón «Subir» es `fixed` y comparte el `z-index` de la escala.

[[exercise:07-guia-con-cabecera-y-anclas.md]]

## Depurar flujo y posicionamiento

El ejemplo más importante de la página. Una agenda cultural con **cinco errores**, uno por lección: un menú atrapado en el contexto de su cabecera, una insignia sin antepasado posicionado, un enlace inline que contiene bloques, el hueco bajo una imagen y un recuadro que solo contiene flotantes. Al lado está la misma agenda arreglada (cada arreglo es una sola línea de CSS) y debajo, una tabla con el síntoma, la causa y el arreglo de cada uno.

[[exercise:08-depurar-flujo-y-posicionamiento.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Tres de ellos incluyen un pequeño script, también bloqueado, que mide las cajas en directo y marca con ✅ lo que ya está bien. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Ordena la receta con flotantes.** Una receta con la foto flotando a la izquierda y cuatro problemas: el hueco bajo la imagen, una cita que pasa por debajo de la foto, una sección que empieza a su lado y un recuadro que colapsa.

[[exercise:09-ej-receta-con-flotantes.md]]

**Coloca las piezas de la tarjeta.** Una insignia `relative` que deja hueco, un botón `absolute` sin desplazamientos, un sello que cubre la tarjeta entera en lugar de la foto y el hueco de la línea base.

[[exercise:10-ej-coloca-las-piezas-de-la-tarjeta.md]]

**Arregla la cabecera que no se pega.** Una librería con una cabecera sticky que no se pega por un `overflow` del envoltorio, un menú atrapado bajo el cartel, un botón fijo que se desplaza por culpa de `will-change` y unas insignias sin referencia. Aquí no hay script: desplaza la vista previa para comprobarlo.

[[exercise:11-ej-cabecera-que-se-pega.md]]

**Alinea el panel de documentos.** Iconos que quedan altos, un botón cuadrado sin líneas de texto que se descoloca, fichas `inline-block` desalineadas y un aviso que intenta centrarse con `vertical-align`.

[[exercise:12-ej-alinea-el-panel.md]]

## Lo que conviene llevarse

- Ante una caja que se coloca, se recorta o se pinta donde no esperas, pregúntate qué frontera está en juego: el BFC (márgenes y flotantes), el bloque contenedor (desplazamientos y `%`) o el contexto de apilamiento (`z-index`).
- Encierra los flotantes con `display: flow-root`, y usa `clear` para que una sección empiece por debajo de ellos.
- Las imágenes que van solas, de bloque; los iconos dentro de una línea, con `vertical-align` en `em`; las cajas `inline-block` en fila, con `vertical-align: top`.
- Padre `relative`, hijo `absolute`. Y comprueba que ningún `transform`, `filter` o `will-change` de un antepasado se convierta en la referencia de tus elementos `fixed`.
- `sticky` necesita un umbral, un padre más alto que ella y ningún antepasado con `overflow` que no se desplace; `overflow: clip` recorta sin estropearlo.
- Una escala de `z-index` en custom properties y `isolation: isolate` en los componentes evitan la carrera de los nueves. Para lo que debe ir encima de todo, `<dialog>` y `popover`.
- Lo fijo no debe tapar lo que se lee ni lo que tiene el foco: reserva su hueco y usa `scroll-padding`.
