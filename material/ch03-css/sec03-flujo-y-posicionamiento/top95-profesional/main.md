# Ejemplos profesionales: flujo y posicionamiento

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los tres primeros módulos de CSS (cascada, modelo de cajas y este). Siguen sin usar flexbox, grid ni media queries: las «columnas» salen de flotantes y BFC, las filas de `inline-block`, y todo lo que se superpone, de `position`. Los tamaños son fluidos (`min()`, `clamp()`), así que se adaptan sin una sola media query.

Comparten la arquitectura de los módulos anteriores: **capas** (`reset`, `tokens`, `base`, `components`), **tokens** en custom properties y componentes de una sola clase. Y añaden tres reglas de este módulo: las imágenes son de bloque desde el reset (adiós al hueco de la línea base), los `z-index` salen de una **escala** de tokens y nunca de números sueltos, y cada componente con capas propias lleva **`isolation: isolate`**. Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

> Tres propiedades de módulos posteriores aparecen de forma puntual, siempre con un comentario: `scroll-padding` (el hueco que el navegador deja al saltar a un ancla o al mover el foco, para que lo fijo no tape lo que se lee), `overflow-wrap` (módulo de tipografía) y `will-change` solo en la explicación de un error. Ninguna animación ni transformación.

## Reportaje de revista

**Objetivo:** una página de lectura larga con la maquetación de una revista impresa. **Técnicas:** una columna de lectura que es un `flow-root` y contiene sus flotantes; letra capitular con `::first-letter` flotante; un retrato redondo cuyo contorno sigue el texto gracias a `shape-outside: circle()` y `shape-margin`; una ficha de datos y una cita destacada que flotan a lados opuestos con anchos de `min(45%, 15rem)`; una sección que empieza por debajo de todos los flotantes con `clear: both`. **Fíjate en** la ficha: es un flotante, y un flotante ya es un BFC, así que el margen de su título queda dentro sin hacer nada.

[[exercise:01-reportaje-de-revista.md]]

## Ficha de producto

**Objetivo:** la página de un producto de una tienda, cómoda en un monitor y en un móvil. **Técnicas:** la caja de compra flota a la derecha y la galería es un BFC que se coloca a su lado sin meterse debajo; con `min-width`, si a su lado no caben 18rem, el navegador la baja debajo del flotante; miniaturas `inline-block` alineadas por arriba; la etiqueta «Nuevo color» en la esquina de la foto y el contador de la cesta en la esquina de su enlace; una **barra de compra rápida `sticky` con `bottom: 0`** que acompaña al lector mientras recorre la ficha y se queda en su sitio al terminar el artículo, con el botón centrado en vertical con `top: 0; bottom: 0; height: fit-content; margin-block: auto`. **Fíjate en** por qué la barra no es `fixed`: como `sticky` no sale de su padre, desaparece sola cuando acaba la ficha.

[[exercise:02-ficha-de-producto.md]]

## Documentación con índice

**Objetivo:** una página de documentación técnica fácil de recorrer. **Técnicas:** dos barras sticky apiladas, la cabecera (`top: 0`) y el índice «En esta página» (`top: var(--header-h)`), que es un `details` cuya lista se despliega con `position: absolute` por encima del contenido; `scroll-padding-top` para que las anclas queden debajo de las dos barras; el enlace `#` de cada título colocado en el margen izquierdo con `right: 100%`, transparente hasta que se pasa el ratón o recibe el foco; avisos con el icono en el hueco del relleno, centrado en la primera línea con `lh`; bloques de código con su etiqueta de lenguaje en la esquina y scroll horizontal propio. **Fíjate en** el índice: tiene recorrido para pegarse porque su padre es toda la página, no un envoltorio a su medida.

[[exercise:03-documentacion-con-indice.md]]

## Centro de notificaciones

**Objetivo:** el panel de notificaciones de una aplicación web. **Técnicas:** la campana es el `summary` de un `details`, con el contador en su esquina; el panel cuelga de ella (`top: calc(100% + 0.5rem); right: 0`) con un ancho que nunca pasa de la ventana (`min(22rem, 100vw - 2rem)`), altura máxima y scroll propio, y una cabecera sticky **dentro del panel**; cada notificación es un «media object» clásico: el avatar flota y el texto es un `flow-root` que se queda en su columna; puntos de presencia en la esquina de los avatares. **Fíjate en** la insignia «Urgente» con `z-index: 500`: no puede tapar el panel porque el contenido está aislado, y la cabecera, con su `z-index` de la escala, gana a todo el contenido de una vez.

[[exercise:04-centro-de-notificaciones.md]]

## Galería con pies superpuestos

**Objetivo:** la galería de finalistas de un concurso de fotografía. **Técnicas:** fotos `inline-block` de `min(100%, 16rem)` que pasan a la fila siguiente como palabras; cada figura es la referencia de sus piezas: el pie, una franja estirada con `left` y `right` a 0; el botón de voto y la cinta en las esquinas; la duración del vídeo y un botón de reproducir **centrado** con `inset: 0` y `margin: auto`; `overflow: clip` recorta las esquinas sin crear un contenedor de scroll. **Fíjate en** el anillo de foco: como la figura recorta lo que sale de ella, el anillo se dibuja en la figura entera con `:has(:focus-visible)` en lugar de en el enlace.

[[exercise:05-galeria-con-pies-superpuestos.md]]

## Tabla comparativa de planes

**Objetivo:** comparar tres planes de suscripción característica a característica. **Técnicas:** un único contenedor con `max-height` y `overflow: auto` en los dos ejes, enfocable y con nombre; la fila de planes sticky arriba y la columna de características sticky a la izquierda, con una escala de `z-index` para que la esquina quede encima de ambas; `border-collapse: separate`, porque los bordes colapsados no acompañan a las celdas sticky; la etiqueta «Recomendado» centrada en su celda con `left: 0; right: 0; width: fit-content; margin-inline: auto`; iconos con texto alternativo. **Fíjate en** que la celda de la etiqueta es su referencia aunque no tenga `position: relative`: una celda sticky ya es una caja posicionada.

[[exercise:06-tabla-comparativa-de-planes.md]]

## Chat con redactor fijo

**Objetivo:** una conversación de mensajería en una sola página. **Técnicas:** cabecera sticky; una etiqueta de día sticky por cada `section`, que la del día siguiente empuja al llegar; burbujas con `width: fit-content`, las propias empujadas a la derecha con `margin-left: auto`; el avatar del contacto colocado abajo a la izquierda de cada grupo, junto al último mensaje; un separador «Mensajes nuevos» con la raya a media altura y el texto posicionado encima; el redactor `fixed` abajo, con su hueco reservado en la conversación y `scroll-padding-bottom` para el foco. **Fíjate en** el botón «Enviar»: va encima del campo, a la derecha, y se centra en vertical con el patrón de `top`, `bottom`, `height: fit-content` y `margin-block: auto`.

[[exercise:07-chat-con-redactor-fijo.md]]

## Plano con marcadores

**Objetivo:** un plano de barrio con los sitios recomendados marcados. **Técnicas:** el lienzo del plano mide lo mismo que la imagen y es la referencia de los marcadores, colocados con `left` y `top` en porcentaje (siguen en su sitio a cualquier tamaño); cada marcador es un círculo con un triángulo de bordes, y sus márgenes negativos llevan la **punta** al punto exacto; el globo con el nombre se centra con desplazamientos simétricos y aparece con `:hover` y `:focus-visible`; el marcador activo sube de `z-index`; la lista de sitios se resalta con `:target`. **Fíjate en** la accesibilidad: el nombre de cada marcador está en su `aria-label`, así que el globo puede ser solo visual.

[[exercise:08-mapa-con-marcadores.md]]

## Cabecera con menús desplegables

**Objetivo:** la cabecera de un sitio con navegación de dos niveles. **Técnicas:** un enlace «Saltar al contenido» colocado con `position: absolute` fuera de la vista hasta que recibe el foco; cabecera sticky con un `z-index` de la escala; elementos de menú `inline-block` que bajan a otra línea en pantallas estrechas; submenús con `details` y una lista `absolute` colgada de su elemento; un hero con una veladura `::before` con `z-index: -1`, que queda delante de la foto y detrás del texto gracias a `isolation: isolate`. **Fíjate en** que el submenú abierto queda por encima del hero sin ningún `z-index` propio: compite la cabecera entera, con su 200, contra el hero aislado en la capa 0.

[[exercise:09-cabecera-con-menus.md]]

## Aviso de cookies

**Objetivo:** un aviso de consentimiento que se pueda leer y usar con teclado sin tapar la página. **Técnicas:** `position: sticky; bottom: 0` como último hijo del `body`, en lugar de `fixed`: mientras lees se queda pegado abajo y, al final de la página, ocupa su propio hueco; altura máxima con `min(60vh, 22rem)` y scroll propio; `scroll-padding-bottom` para que el foco nunca quede debajo del aviso; opciones plegables con `details`; casillas alineadas con su etiqueta con `vertical-align` y una sangría con margen negativo. **Fíjate en** los dos botones: «Rechazar» y «Aceptar todas» tienen exactamente el mismo aspecto, porque elegir debe costar lo mismo.

[[exercise:10-aviso-de-cookies.md]]

## Seguimiento de pedido

**Objetivo:** el estado de un envío como una línea de tiempo. **Técnicas:** cada paso es la referencia de su marcador (`::before`) y del tramo de raya que lo une con el siguiente (`::after`, de `height: 100%`); los marcadores se centran en la primera línea del título con un alto de línea fijo; el paso actual se marca con `aria-current="step"` y un anillo de `box-shadow` que no ocupa sitio. **Fíjate en** el orden de pintado: el tramo va después del marcador en el HTML y lo taparía; los marcadores llevan `z-index: 1` y la lista, `isolation`, para que ese 1 no salga de ella.

[[exercise:11-seguimiento-de-pedido.md]]

## Portada de perfil

**Objetivo:** la cabecera del perfil de una red social. **Técnicas:** la portada es la referencia de su botón «Cambiar portada»; el avatar sube la mitad de su tamaño con un `top` negativo y monta sobre la portada, mientras el relleno del bloque le reserva el hueco que ya no ocupa en el flujo; un punto de presencia en porcentajes, que sigue en su sitio cuando el avatar cambia de tamaño con `clamp()`; la insignia de verificada alineada con el nombre con `vertical-align` en `em`; cifras `inline-block` alineadas por arriba; la cabecera aislada y recortada con `overflow: clip`. **Fíjate en** el relleno derecho del nombre: el botón «Seguir» está fuera del flujo, así que un nombre largo pasaría por debajo si nadie le reservara su sitio.

[[exercise:12-portada-de-perfil.md]]
