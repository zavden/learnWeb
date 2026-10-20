# Ejemplos profesionales: el modelo de cajas

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML, el módulo de fundamentos y cascada y este módulo. No usan flexbox, grid, posicionamiento, transformaciones ni media queries, que llegan en módulos posteriores: todo se construye con el flujo normal, cajas de bloque e `inline-block`, márgenes (también `auto` y negativos), límites de tamaño y `overflow`. Es una limitación real, y verás que llega sorprendentemente lejos.

Todos comparten la arquitectura del módulo anterior: **capas** (`reset`, `tokens`, `base`, `components`), **tokens** en custom properties, estilos base con `:where()` y componentes de una sola clase. Y todos siguen las mismas reglas de caja: `box-sizing: border-box` en todo, **ningún estado cambia el tamaño de una caja** (bordes reservados, `outline` y `box-shadow`), límites en lugar de medidas fijas (`min()`, `max-width`, `min-height`, `aspect-ratio`) y componentes que se espacian por dentro con `padding`. Los colores de texto cumplen WCAG AA (4,5:1) y los bordes de los controles, 3:1. Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

> Dos propiedades de módulos posteriores aparecen de forma puntual, siempre con un comentario: `vertical-align`, para alinear cajas `inline-block` puestas en fila (módulo de flujo), y `overflow-wrap: anywhere`, para que una dirección de correo o una URL larguísima no desborde (módulo de tipografía).

## Sistema de botones

**Objetivo:** todos los botones de una aplicación a partir de una sola clase. **Técnicas:** la clase `.btn` define la caja (display, relleno en `em`, borde de 2px siempre presente, altura mínima de 44px para tocar con el dedo) y los modificadores solo cambian variables (`--btn-bg`, `--btn-border`, `--btn-shadow`); tamaños que solo cambian `font-size`; `:hover` que eleva con sombra y `:active` que hunde con `inset`; anillo de foco doble con `outline` y una sombra; iconos de fondo con su hueco reservado en el padding; botones solo icono cuadrados con `aspect-ratio`; un grupo con bordes compartidos mediante `margin-left: -2px`. **Fíjate en** el grupo: los botones están escritos sin espacios entre ellos en el HTML, porque entre cajas en línea un salto de línea sería un hueco visible.

[[exercise:01-sistema-de-botones.md]]

## Insignias y etiquetas

**Objetivo:** las piezas pequeñas que aparecen en cualquier interfaz: estados, contadores, etiquetas que se pueden quitar, versiones y teclas. **Técnicas:** cajas `inline-block` medidas en `em`; tonos como pares de variables con contraste medido; contadores con `min-width` y radio de píldora (círculo con una cifra, píldora con tres); un punto de estado hecho con `::before`, `aspect-ratio` y `border-radius: 50%`; un contador montado sobre su botón con un margen izquierdo negativo, sin posicionamiento; etiquetas largas recortadas con «…». **Fíjate en** el comentario de `.tag-label`: un `inline-block` con `overflow: hidden` cambia su línea base y se desalinea, una sorpresa que entenderás del todo en el módulo de flujo.

[[exercise:02-insignias-y-etiquetas.md]]

## Avisos y alertas

**Objetivo:** todos los mensajes que una aplicación muestra a quien la usa. **Técnicas:** un aviso de página con el fondo a todo el ancho y el texto en la columna; un componente `.alert` cuyos tonos son variables (incluido el icono, `--tone-icon: url(…)`), con el icono colocado como imagen de fondo dentro de un relleno reservado; márgenes en una sola dirección dentro de la alerta; un campo con error que solo cambia el color del borde; una pila de notificaciones pegadas a la derecha con `margin-inline-start: auto` y elevadas con sombra. **Fíjate en** los roles: `status` para confirmar algo y `alert` para un error que hay que atender ya.

[[exercise:03-avisos-y-alertas.md]]

## Caja de acceso

**Objetivo:** una pantalla de inicio de sesión cómoda en un móvil y en un monitor. **Técnicas:** la caja mide `min(100% - 2rem, 25rem)` y se centra con márgenes `auto`, con un margen superior fluido con `clamp()`; campos y botones al 100 % gracias a `border-box`; el foco con `outline` y un cambio de color de borde (un halo claro de `box-shadow` no tendría contraste suficiente); `:user-invalid` para marcar errores solo después de tocar el campo; el fondo del `body` (color y punteado) que se propaga a toda la ventana. **Fíjate en** el separador «o con tu contraseña»: una caja de media línea de alto con un borde inferior, y el texto desbordando por debajo con un fondo blanco que tapa la línea.

[[exercise:04-caja-de-acceso.md]]

## Tarjeta de perfil

**Objetivo:** tarjetas de personas que aguantan cualquier nombre. **Técnicas:** una franja 3:1 con dos capas de fondo y radios interiores que encajan en el borde; la foto montada sobre la franja con un margen superior negativo de la mitad de su tamaño; un punto de estado superpuesto a la foto con márgenes que suman cero, para que no ocupe sitio en la línea; cifras en tres cajas al 30 %; nombre recortado con «…», cargo limitado a tres líneas y correo que se puede partir. **Fíjate en** la segunda tarjeta: el nombre, el cargo y el correo son larguísimos y nada se sale de su sitio.

[[exercise:05-tarjeta-de-perfil.md]]

## Tarjetas de producto

**Objetivo:** un escaparate de tienda con tarjetas de la misma altura sin flexbox ni grid. **Técnicas:** tarjetas `inline-block` de `min(100%, 15rem)` centradas en filas con `text-align: center`; foto cuadrada con `aspect-ratio` y un color de fondo mientras carga; una franja de insignias de alto fijo subida sobre la foto con un margen negativo igual a su alto; títulos de exactamente dos líneas con `line-clamp` y `min-height: 2lh`; un único enlace por producto y el botón fuera de él. **Fíjate en** por qué las insignias quedan encima de la foto: las cajas en línea se pintan después de las imágenes que van antes en el HTML.

[[exercise:06-tarjetas-de-producto.md]]

## Tarjetas multimedia

**Objetivo:** contenidos de vídeo, pódcast y texto con su proporción reservada antes de cargar. **Técnicas:** `aspect-ratio` 16/9, 1/1 y 4/3; portadas como fondos con `background-size: cover` (y un icono de reproducir como segunda capa que crece con la tarjeta); la duración montada sobre la portada con un margen negativo; tema oscuro con `color-scheme: dark`; una tira de fotos con `white-space: nowrap`, cajas `inline-block` y `overflow-x: auto`, enfocable con el teclado. **Fíjate en** la tarjeta del artículo: es un `<img>` normal, y su proporción sale de sus atributos `width` y `height`.

[[exercise:07-tarjetas-multimedia.md]]

## Cajas de precios

**Objetivo:** una comparativa de planes en tres cajas que se colocan solas según el ancho. **Técnicas:** planes `inline-block` centrados en la fila y con el texto alineado al inicio dentro; todos con el mismo borde, y el destacado distinguido solo por el color y la sombra; una cinta que sobresale por arriba con un margen negativo calculado a partir del relleno; resúmenes con `min-height: 3lh` para que los precios queden a la misma altura; listas con iconos de fondo; un selector mensual/anual sin JavaScript con `:has(:checked)` y `display: none`. **Fíjate en** que un plan `inline-block` es un BFC: el margen negativo de la cinta no se escapa de él.

[[exercise:08-cajas-de-precios.md]]

## Artículo con medida legible

**Objetivo:** una página de lectura larga, cómoda en cualquier pantalla. **Técnicas:** una columna de `min(100% - 2rem, 65ch)` centrada; una imagen y una cita que **salen de la columna solo cuando hay sitio**, con un margen negativo de `clamp(0px, (100vw - 100%) / 2 - 1rem, máximo)`, donde `100%` es el ancho de la columna; ritmo vertical con márgenes en una sola dirección; un aviso que se espacia por dentro; una tabla con scroll horizontal; notas al pie resaltadas con `:target` y una sombra de extensión que agranda el resaltado sin mover el texto. **Fíjate en** la imagen al estrechar la vista previa: se va ajustando a la columna y nunca provoca scroll horizontal.

[[exercise:09-articulo-con-medida-legible.md]]

## Tabla de datos con scroll

**Objetivo:** la tabla de pedidos de un panel de administración. **Técnicas:** un contenedor con `overflow-x: auto`, enfocable y con nombre accesible, que además recorta la tabla con sus esquinas redondeadas; una barra de búsqueda con el icono de fondo dentro del relleno del campo; estados con insignias; filas resaltadas cambiando el fondo, nunca un borde; una paginación de cajas `inline-block` con `min-width` y borde reservado. **Fíjate en** la columna de productos: `max-width` no tiene efecto en las celdas de una tabla, así que el límite y el recorte con «…» van en un bloque dentro de la celda.

[[exercise:10-tabla-de-datos-con-scroll.md]]

## Panel de chat

**Objetivo:** una conversación con scroll, como la de cualquier aplicación de mensajería. **Técnicas:** tres cajas apiladas en las que solo el registro tiene scroll (alto fijo, `overflow-y: auto` y `scrollbar-gutter: stable`); burbujas con `width: fit-content` y `max-width`, las propias empujadas a la derecha con `margin-inline-start: auto`; radios asimétricos que marcan quién habla y que desaparecen en los mensajes seguidos (con `+` y `:has()`); un panel con `overflow: clip` que recorta las esquinas sin crear scroll; un avatar con margen inferior negativo para que el nombre suba a su lado; un indicador «escribiendo…» hecho con un único punto de fondo repetido. **Fíjate en** el enlace larguísimo del tercer mensaje: se parte en lugar de ensanchar la burbuja.

[[exercise:11-panel-de-chat.md]]

## Panel lateral con scroll

**Objetivo:** un panel de filtros de tienda con la cabecera y los botones siempre a la vista. **Técnicas:** el panel se pega a la derecha con `margin-inline-start: auto`; solo el cuerpo tiene scroll (`max-height` con `min()` y `overflow-y: auto`), así que no hace falta `position: sticky`; grupos plegables con `details`; dos campos de precio al 47 % con la cuenta del espacio en blanco comentada; muestras de color redondas con `aspect-ratio` y un anillo de selección hecho con dos sombras. **Fíjate en** el foco de los títulos de grupo: va hacia dentro (`outline-offset` negativo) para que el área de scroll no lo recorte.

[[exercise:12-panel-lateral-con-scroll.md]]

## Recibo de compra

**Objetivo:** el ticket de una tienda de barrio, con aspecto de papel. **Técnicas:** un papel centrado con dos sombras; un borde inferior dentado hecho con un `::after` de bloque que sale hasta los lados y cuelga por debajo con márgenes negativos, y cuyo fondo es un diente SVG repetido en horizontal; datos del ticket en dos columnas de cajas al 48 %; separadores `dashed` y un borde `double` para el total; un sello con marco doble hecho con borde y `outline-offset`. **Fíjate en** el `display: flow-root` del papel: sin él, el margen negativo del `::after` colapsaría con el del recibo y los dientes quedarían dentro del papel, invisibles.

[[exercise:13-recibo-de-compra.md]]
