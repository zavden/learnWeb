# Ejemplos profesionales: flexbox

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los cuatro primeros módulos de CSS. Siguen sin usar grid ni media queries, y aun así todos se adaptan al ancho: lo hacen con `flex-wrap`, `flex-basis` y unos pocos `min()` y `clamp()`. Estrecha la vista previa, o ábrela en su pestaña con ↗ y cambia el ancho de la ventana, para ver cada uno en un móvil y en un monitor.

Comparten la arquitectura de los módulos anteriores: **capas** (`reset`, `tokens`, `base`, `components`), **tokens** en custom properties y componentes de una sola clase. Y añaden cuatro reglas de este módulo:

- Los iconos `svg` llevan `flex: none` desde el reset: nunca encogen.
- Todo lo que debe ocupar «lo que sobra» lleva `flex: 1` y `min-width: 0` (o `min-height: 0` en columnas); todo lo que tiene un tamaño de diseño, `flex: none`.
- El reset deja las imágenes con `height: auto`, así que las filas con imágenes se alinean con `align-items: flex-start` o `center`: nunca se estiran.
- El orden del HTML es el orden visual. Nada de `order` ni `row-reverse`: lo que va a la derecha va con márgenes automáticos o `justify-content`.

Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

## Cabecera de tienda

**Objetivo:** la cabecera completa de una tienda en línea. **Técnicas:** tres filas flex con `flex-wrap`: el aviso de envío centrado, la cabecera principal y la barra de categorías; un logo rígido, un buscador que ocupa lo que sobra con `flex: 1 1 14rem` y `min-width: 0` en sus dos niveles, y los accesos de cuenta empujados al final con `margin-left: auto`; el contador del carrito centrado en un círculo que crece con la cifra; un enlace «Saltar al contenido» que solo aparece con el foco; migas de pan con el separador en un `::before`. **Fíjate en** qué pasa al estrechar la ventana: la cuenta baja a su propia línea y sigue a la derecha, porque el margen automático actúa dentro de la línea en la que cae.

[[exercise:01-cabecera-de-tienda.md]]

## Listado con filtros

**Objetivo:** la página de una categoría de productos con sus filtros. **Técnicas:** el patrón de barra lateral que se apila (filtros con base de 13rem; resultados con base de 20rem y `flex-grow: 999`); grupos de filtros plegables con `details`; opciones con el recuento empujado a la derecha; dos campos de precio que se reparten el ancho; tarjetas de igual altura con un techo de `max-width` y el botón al fondo; paginación centrada con cada número en el centro exacto de su caja. **Fíjate en** el orden: los filtros van antes que los productos en el HTML y en pantalla, así que con el teclado se llega a ellos sin recorrer toda la lista. En una pantalla estrecha se colocan encima, y los grupos cerrados ocupan una sola línea.

[[exercise:02-listado-con-filtros.md]]

## Página de precios

**Objetivo:** convencer de una suscripción sin esconder nada. **Técnicas:** encabezado en columna centrada; un selector mensual/anual hecho con dos radios de verdad dentro de etiquetas con forma de botón (`:has(:checked)` marca el estado y `:has(:focus-visible)` el foco); los dos importes en el HTML y `:has()` en la página para elegir cuál se ve; planes de igual altura con el botón al fondo y la etiqueta «Más elegido» empujada a la derecha del nombre; ventajas con el icono centrado en la primera línea del texto con `lh`; preguntas frecuentes con `summary` flex. **Fíjate en** el `summary`: al darle `display: flex` deja de ser un elemento de lista, pierde el triángulo y su signo «+» se va al final con `justify-content: space-between`.

[[exercise:03-pagina-de-precios.md]]

## Chat de soporte

**Objetivo:** una aplicación de chat a pantalla completa. **Técnicas:** la aplicación es una columna de `100dvh` y la conversación, con `flex: 1` y `overflow-y: auto`, se queda exactamente con el alto que dejan la cabecera, las respuestas rápidas y el redactor; grupos de mensajes en columna, los propios alineados al final del eje cruzado; un separador «Hoy» con rayas de `flex: 1`; una ficha de pedido y un archivo adjunto como media objects dentro de una burbuja, con el nombre del archivo recortado. **Fíjate en** lo que no hace falta respecto al chat del módulo de posicionamiento: nada es `fixed` ni `sticky`, no hay huecos que reservar y el redactor nunca tapa el último mensaje.

[[exercise:04-chat-de-soporte.md]]

## Bandeja de correo

**Objetivo:** la vista principal de una aplicación de correo. **Técnicas:** barra lateral de carpetas que se apila; cabecera con el contador de mensajes empujado a la derecha; barra de herramientas que se parte en líneas; filas con un flex dentro de otro (casilla, estrella y enlace; y dentro del enlace, remitente de ancho fijo con `flex: 0 0 8rem`, asunto con etiqueta que se recorta y fecha rígida); `min-width: 0` en los dos niveles. **Fíjate en** las carpetas: cada una tiene una base de 9rem en una fila con `flex-wrap`. En la columna lateral solo cabe una por línea y parece una lista vertical; cuando la barra se apila arriba, caben varias por línea. El mismo CSS da las dos formas.

[[exercise:05-bandeja-de-correo.md]]

## Página de un podcast

**Objetivo:** la página de un programa con su lista de episodios y el reproductor. **Técnicas:** la ficha del programa es un media object que se apila; cada episodio, un media object con el botón de reproducir rígido a la derecha y el resumen recortado a dos líneas con `line-clamp`; la página es una columna de `100dvh` como mínimo y la barra de reproducción es `sticky` abajo; dentro de la barra, lo que suena (con el título recortado), los controles rígidos y el progreso se reparten en líneas. **Fíjate en** la barra en una pantalla estrecha: el progreso baja a su propia línea y el control deslizante se estira con `flex: 1` entre los dos tiempos.

[[exercise:06-reproductor-de-podcast.md]]

## Panel de control

**Objetivo:** el resumen del panel de administración de una tienda. **Técnicas:** menú lateral que se apila, con el usuario al fondo gracias a `margin-top: auto` (el estiramiento hace que el menú mida todo el alto); el truco de las bases en la lista del menú; tarjetas de indicadores con una línea de tendencia SVG estirada a lo ancho; dos paneles que se reparten el ancho 2 a 1 con `flex-grow: 2` y `1`; pedidos con el cliente recortado; un gráfico de barras en el que cada barra es un `::after` con el ancho de la custom property `--value`. **Fíjate en** cómo cada barra va siempre a su propia línea: su margen derecho completa el 100 %, así que su tamaño exterior es la línea entera.

[[exercise:07-panel-de-control.md]]

## Portada de un blog

**Objetivo:** la página de inicio de un blog con un artículo destacado. **Técnicas:** el destacado es un media object que se apila (imagen con base de 12rem y techo de 20rem, texto con `flex-grow: 999`); tarjetas en columna con las etiquetas al fondo, para que las líneas de autor queden alineadas entre tarjetas; línea de autor con avatar rígido; un cuadro de suscripción con dos piezas que se apilan y el patrón de campo y botón. **Fíjate en** el orden del destacado: la imagen va primero en el HTML porque es decorativa (`alt=""`), así que lo primero que se lee sigue siendo el título.

[[exercise:08-indice-de-blog.md]]

## Pasos del checkout

**Objetivo:** el paso de envío de una compra. **Técnicas:** un indicador de pasos en el que cada paso (salvo el último) lleva un conector `::after` con `flex: 1` que ocupa el espacio hasta el siguiente; filas de campos que se reparten el ancho y bajan si no caben (el nombre con el doble de `flex-grow`, el código postal con menos base); opciones de envío con el precio a la derecha y la marcada resaltada con `:has(:checked)`; un resumen del pedido que se coloca debajo si no cabe, `sticky` arriba y con `align-self: flex-start` para que tenga recorrido. **Fíjate en** el resumen en una pantalla ancha: se queda a la vista mientras rellenas el formulario. Sin `align-self`, sería tan alto como el formulario y no se pegaría.

[[exercise:09-pasos-del-checkout.md]]

## Página de ajustes

**Objetivo:** las preferencias de notificaciones de una cuenta. **Técnicas:** pestañas que se parten en líneas; cada ajuste es una fila con `flex-wrap` en la que el texto tiene base de 14rem y `flex-grow: 999`, y el control mide lo suyo; interruptores accesibles hechos con una casilla real con `role="switch"` que cubre la pista con `opacity: 0`, y la bola, un `::before` que pasa de un extremo a otro con `justify-content`; una zona de peligro; una barra de acciones `sticky` abajo. **Fíjate en** las filas al estrechar la ventana: cuando el texto ya no cabe junto al control, el control baja debajo, alineado a la izquierda, sin ninguna media query.

[[exercise:10-pagina-de-ajustes.md]]

## Pie de página

**Objetivo:** el pie completo de una tienda. **Técnicas:** el patrón del pie pegado abajo (columna de `100dvh` como mínimo y `main` con `flex: 1`); un boletín con texto y formulario que se apilan; columnas de enlaces con base de 9rem que se reparten 4, 2 o 1 por línea; iconos sociales centrados en círculos; una franja legal con los enlaces empujados al final. **Fíjate en** la página: tiene muy poco contenido y aun así el pie empieza abajo, no a media pantalla.

[[exercise:11-pie-de-pagina.md]]

## Centro de notificaciones

**Objetivo:** la lista de notificaciones de una comunidad. **Técnicas:** cabecera con el título y el contador por la línea base y la acción empujada a la derecha; filtros con contadores centrados; notificaciones como media objects de tres piezas (figura rígida, cuerpo con `min-width: 0` y punto de «sin leer» rígido), con el icono de tipo colocado en la esquina del avatar con `position`; acciones que se reparten en líneas. **Fíjate en** el punto de «sin leer»: está alineado arriba y bajado lo justo para quedar centrado en la primera línea, igual que los iconos de la página de precios.

[[exercise:12-centro-de-notificaciones.md]]

## Tarjetas de perfil

**Objetivo:** perfiles de una comunidad de personas que cultivan. **Técnicas:** rejilla de tarjetas con base de 16rem; cada tarjeta en columna, con la portada estirada a lo ancho y recortada a las esquinas con `overflow: clip`; el avatar sube sobre la portada con un margen negativo que también anula el `gap`; nombre, usuario y enlace recortados con «…»; tres cifras iguales con `flex: 1`; botones que se reparten la fila junto a uno rígido. **Fíjate en** las dos tarjetas: tienen contenidos distintos (una lleva enlace y la otra no), pero sus botones quedan a la misma altura gracias a `margin-top: auto`.

[[exercise:13-tarjetas-de-perfil.md]]
