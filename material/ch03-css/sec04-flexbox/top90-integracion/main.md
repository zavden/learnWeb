# Integración: flexbox

## Qué vas a practicar

En las lecciones de este módulo viste flexbox por partes: el contenedor y sus ejes, la alineación, el algoritmo que reparte el espacio, sus trampas y los patrones más habituales. En un componente real aparecen todas a la vez, y casi siempre **anidadas**: una tarjeta es elemento flex de su fila y contenedor flex de su contenido; un enlace de una bandeja de correo es elemento flex de la fila y contenedor de su avatar, su remitente y su asunto.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira la vista previa y hazte tres preguntas por cada caja: **¿de qué contenedor flex es elemento, y en qué eje?**, **¿qué hace con el espacio que sobra o que falta?** (su `flex-grow`, su `flex-shrink` y su base) y **¿cuál es su mínimo?** Con el overlay de flexbox de DevTools (la insignia `flex` en **Elements**) verás los contenedores, los huecos y el espacio libre de cada uno. Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML y los cuatro primeros módulos de CSS. Siguen sin usar grid ni media queries: todo lo que se adapta al ancho lo hace con `flex-wrap` y `flex-basis`. Para verlo, estrecha la vista previa o ábrela en su pestaña con ↗.

## Cabecera de una tienda

Una barra con tres piezas y tres comportamientos distintos: el **logo es rígido** (`flex-shrink: 0`), el **buscador ocupa lo que sobra** (`flex: 1 1 10rem`) y la **cuenta y el carrito van al final** con `margin-left: auto`. El buscador es a la vez elemento flex de la barra y contenedor de su campo y su botón: el campo lleva `flex: 1` y `min-width: 0`, y el formulario también, para que ninguno de los dos niveles imponga su mínimo. Con `flex-wrap`, cuando falta sitio la cuenta baja a otra línea y sigue a la derecha. Debajo, una barra de categorías que se parte en líneas con «Ofertas» empujada al final.

[[exercise:01-cabecera-de-tienda.md]]

## Un hilo de comentarios

El **media object** anidado: cada respuesta es otro `.comment` dentro del cuerpo del anterior. La cabecera de cada comentario es una fila con el nombre, una insignia y la fecha empujada a la derecha; el nombre es directamente un elemento flex con `overflow: hidden`, así que se recorta con «…» sin necesidad de `min-width: 0` (un contenedor de scroll no tiene mínimo automático). Las acciones se reparten en líneas con `gap`, y el formulario de respuesta es el patrón de campo y botón con un avatar delante.

[[exercise:02-hilo-de-comentarios.md]]

## Un chat de soporte

Un panel de alto fijo con **tres niveles de columnas**. El cuerpo es el elemento intermedio de la lección de trampas: sin `min-height: 0`, la lista nunca tendría scroll. Dentro de la lista, que también es una columna, cada mensaje se alinea a su lado con `align-self`, y el separador «Hoy» dibuja sus dos rayas con pseudoelementos de `flex: 1`. Fíjate en lo que **no** pasa: los mensajes no se aplastan para caber en el alto de la lista, porque su `min-height: auto` (el alto de su texto) los protege. Aquí el mínimo automático trabaja a tu favor.

[[exercise:03-chat-de-soporte.md]]

## Tarjetas de producto

La rejilla sin media queries de la lección de patrones con todos sus complementos: tarjetas de `flex: 1 1 9rem` con un **techo** de 13rem para que la última no ocupe la fila entera, todas de la misma altura por el estiramiento, y cada una en columna con el **botón al fondo**. La imagen se estira a lo ancho (en una columna, el eje cruzado es el horizontal) y conserva su proporción con `height: auto`. El precio actual y el anterior tienen tamaños distintos y se alinean con `baseline`, igual que el título y el contador de la estantería.

[[exercise:04-tarjetas-de-producto.md]]

## Una barra de filtros

La cabecera de un listado, hecha casi solo con `flex-wrap`, `gap` y márgenes automáticos. Tres filas distintas: el título con su contador (alineados por la línea base) y el selector de orden empujado a la derecha; las fichas de filtro, que se reparten en tantas líneas como haga falta y se resaltan con `:has(:checked)`; y los filtros activos, cada uno con un botón «✕» centrado en su círculo, con «Borrar todo» al final de su línea.

[[exercise:05-barra-de-filtros.md]]

## El esqueleto de una aplicación

Una aplicación de alto fijo: una **columna** (barra superior y zona principal) que contiene una **fila** (menú lateral y contenido). La fila es el elemento intermedio y lleva `min-height: 0`; el contenido lleva `min-width: 0` y su propio scroll. El menú lateral se estira hasta el alto de la fila, y aquí el estiramiento es justo lo que queremos: gracias a él, «Ayuda» puede irse al fondo con `margin-top: auto`. El resumen del pedido es `sticky` y se pega porque lleva `align-self: flex-start`; sin él, sería tan alto como el pedido y no tendría recorrido.

[[exercise:06-panel-de-aplicacion.md]]

## Una bandeja de correo

Cada fila es un flex **dentro de otro flex**: la fila contiene un punto de «no leído» (un pseudoelemento `::before`, que también es un elemento flex), la casilla y el enlace; el enlace contiene el avatar, el remitente, el asunto y la fecha. El remitente es una «columna» de ancho fijo (`flex: 0 0 7rem`) para que todos los asuntos empiecen a la misma altura, y el asunto se queda con el resto. El enlace necesita su **propio** `min-width: 0`: si no, su mínimo sería el asunto entero en una línea y los «…» de dentro no aparecerían.

[[exercise:07-bandeja-de-entrada.md]]

## Depurar flexbox

El ejemplo más importante de la página. Un panel de pedidos con **cinco errores**, uno de cada tipo que has visto: texto suelto en un contenedor flex, `justify-self` donde no existe, pestañas con `flex-grow: 1`, un icono sin `flex-shrink: 0` y un «…» sin `min-width: 0`. Debajo, la versión arreglada (cada arreglo es una o dos declaraciones) y una tabla con el síntoma, la causa y el arreglo. Intenta encontrar los cinco en la primera versión antes de leer la tabla.

[[exercise:08-depurar-flexbox.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Un pequeño script, también bloqueado, mide las cajas en directo y marca con ✅ lo que ya está bien (y lo repite en la consola). Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla la cabecera del móvil.** Una cabecera de 340px que se desborda, un botón «Entrar» con `justify-self`, el icono de un aviso que encoge y un buscador cuyo botón se sale de su columna.

[[exercise:09-ej-arregla-la-cabecera.md]]

**Arregla el panel de mensajes.** Una lista que no se desplaza dentro de columnas anidadas, filas que se salen sin «…», avatares ovalados y un pie con el orden invertido por `row-reverse`.

[[exercise:10-ej-arregla-el-panel-de-mensajes.md]]

**Construye la tabla de planes.** Esta vez partes de un CSS sin layout: centra el encabezado, monta la fila de planes que se parte, convierte cada plan en una columna con el botón abajo y empuja la etiqueta «Popular» al final de su línea.

[[exercise:11-ej-construye-los-planes.md]]

## Lo que conviene llevarse

- Casi todo componente es un flex dentro de otro: decide para cada caja qué es como **elemento** (cuánto crece, cuánto encoge, cuál es su base) y qué es como **contenedor**.
- Lo que tiene un tamaño de diseño (logos, avatares, iconos, miniaturas, fechas) lleva `flex: none` o `flex-shrink: 0`; lo que debe ocupar el resto, `flex: 1` y `min-width: 0`.
- Cada nivel de anidamiento tiene su propio mínimo automático: un «…» o un scroll que no aparecen se arreglan en el elemento flex intermedio, no en el que tiene el texto o el `overflow`.
- `margin-left: auto` empuja al final de la línea, también después de partirse; `margin-top: auto` lleva un botón al fondo de su columna.
- El estiramiento iguala alturas y permite márgenes automáticos verticales, pero deforma imágenes y deja sin recorrido a los `sticky`: `align-self: flex-start` en esos casos.
- `flex-wrap` con `flex-basis` (y un `max-width` de techo) adapta los componentes a su contenedor sin media queries.
- El orden del HTML es el orden de lectura: para mover algo a la derecha, márgenes automáticos o `justify-content`, nunca `row-reverse` ni `order`.
