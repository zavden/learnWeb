# Integración: el modelo de cajas

## Qué vas a practicar

En las lecciones de este módulo viste cada pieza de la caja por separado: sus cuatro áreas y `box-sizing`, el `display`, los márgenes y su colapso, los tamaños, el `overflow` y la decoración con bordes, sombras y fondos. En un componente real aparecen todas a la vez. Una tarjeta mezcla `border-box`, relleno, márgenes negativos y radios; un «¿por qué se sale esto?» puede deberse al modelo de cajas, a un `display` en línea, a un margen que colapsa o a una altura fija.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira la vista previa y pregúntate **cuánto mide cada caja y de dónde sale cada hueco**. Si dudas, haz clic derecho → **Inspeccionar** y mira el diagrama de cajas de la pestaña **Computed**, o abre el ejemplo en su propia pestaña con el botón ↗. Al final hay cuatro ejercicios con su solución.

> Todos los ejemplos usan solo el flujo normal: bloques, cajas en línea, `inline-block`, márgenes y anchos. Flexbox, grid y el posicionamiento llegan en los próximos módulos. La única propiedad que se adelanta es `vertical-align`, para alinear por arriba cajas `inline-block` puestas en fila; siempre lleva un comentario que lo indica.

## Una tarjeta medida de borde a borde

Dos tarjetas de 18rem con distinto relleno. Combina el reset de **`box-sizing: border-box`** (el ancho no cambia al cambiar el padding), una **custom property** como interfaz del componente (`--card-pad`), **márgenes negativos** que llevan la imagen hasta el borde (un bloque con `width: auto` mide «contenedor − márgenes», así que con márgenes negativos crece) y la regla de los **radios anidados**: radio interior = radio exterior − grosor del borde. Fíjate también en el botón: un bloque ya llena el ancho, así que no necesita `width: 100%`.

[[exercise:01-tarjeta-con-border-box.md]]

## Una columna de lectura

El patrón más usado de toda la web: una columna centrada con **`width: min(100% - 2rem, 65ch)`** y **`margin-inline: auto`**. Combina tamaños, márgenes `auto` y funciones del módulo anterior. La cabecera pinta su fondo a todo el ancho y usa **`display: flow-root`** para que el margen del título no se escape por arriba. El texto se espacia con **márgenes en una sola dirección** (`.flow > * + *`), de modo que nunca hay dos márgenes enfrentados. Y la cita sobresale 1rem por cada lado con un **margen negativo** que nunca desborda, porque la columna siempre deja ese rem libre.

[[exercise:02-columna-de-lectura.md]]

## Una bandeja con scroll

Dos bandejas de mensajes. El área de la lista tiene un **`max-height`** calculado con `min()`, **`overflow-y: auto`** y **`scrollbar-gutter: stable`**, así que la bandeja con pocos mensajes reserva el mismo hueco para la barra que la que tiene scroll. Los asuntos se recortan con la receta de tres propiedades de **`text-overflow: ellipsis`**. El detalle importante está en el foco: un contenedor de scroll recorta todo lo que sale de él, también los `outline` de sus hijos, por eso el anillo se dibuja hacia dentro con **`outline-offset` negativo**. Recorre la lista con <kbd>Tab</kbd> para verlo.

[[exercise:03-bandeja-con-scroll.md]]

## Filtros con inline-block

Chips de filtro hechos con etiquetas `label`. Con su `display` por defecto (`inline`), su relleno vertical invadiría la línea de arriba; con **`inline-block`** se colocan en fila, saltan de línea como palabras y respetan su relleno. El estado marcado (con `:has(:checked)`) solo cambia **colores**: el borde tiene el mismo grosor en todos los estados, así que nada salta. Los contadores combinan **`min-width`** y un radio de píldora: con un dígito son un círculo y con tres, una píldora. Y el `fieldset` pierde el `min-inline-size: min-content` que le da el navegador, que podría estirarlo fuera de la página.

[[exercise:04-filtros-con-inline-block.md]]

## Botones con fondos y sombras

Un sistema de botones donde ningún estado mueve nada. El `:hover` agranda la **sombra** y el `:active` la cambia por una **sombra `inset`**, que hunde el botón sin desplazarlo. El botón «fantasma» conserva un **borde transparente** para medir lo mismo que los demás. Los iconos son **imágenes de fondo** colocadas en un hueco que reserva el padding. Y los tamaños solo cambian `font-size`: relleno, radio, icono e insignia están en `em` y escalan solos.

[[exercise:05-botones-con-fondos-y-sombras.md]]

## Proporciones con aspect-ratio

La ficha de un pódcast con **`aspect-ratio`** en cada pieza. La fachada del vídeo reserva un hueco 16/9 antes de que cargue nada, con el icono de reproducir como **fondo** centrado. Las miniaturas son cajas 4/3 con una imagen cuadrada en **`background-size: cover`**, que la recorta para llenarlas. El avatar es un cuadrado redondeado al **50 %** con un doble aro de **dos sombras**. Y las citas cuadradas demuestran que `aspect-ratio` es un mínimo: la segunda tiene más texto y crece en alto en lugar de desbordar.

[[exercise:06-proporciones-con-aspect-ratio.md]]

## Depurar el modelo de cajas de principio a fin

El ejemplo más importante de la página. Una caja de suscripción con **cinco errores**, uno por lección: un margen que colapsa y se escapa, una etiqueta `inline` que ignora su ancho, un texto recortado por una altura fija con `overflow: hidden`, un campo al 100 % con `content-box` y un botón que engorda su borde en `:hover`. Debajo está la misma caja arreglada y una tabla con el síntoma, la causa y el arreglo de cada error. Marca la casilla para ver todas las cajas con el truco del `outline`.

[[exercise:07-depurar-el-modelo-de-cajas.md]]

## Una página con capas de fondo

Una página con aspecto de folio. Como `<html>` tiene fondo propio, el del `<body>` ya no se **propaga al lienzo** y pinta solo su caja, centrada con márgenes `auto`. La cabecera apila **tres capas de fondo** (la hoja, el punteado y el color), con un relleno y un tamaño de hoja fluidos gracias a **`clamp()`**, y dibuja su línea inferior con una **sombra `inset`** que no suma altura. Las entradas de los talleres usan un borde discontinuo con **`background-clip: padding-box`**, para que el fondo no asome entre los trazos.

[[exercise:08-pagina-con-capas-de-fondo.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla la tarjeta que desborda.** Una tarjeta de evento con cuatro desbordamientos: un botón al 100 %, una imagen enorme, un título demasiado largo y un texto con altura fija.

[[exercise:09-ej-arregla-la-tarjeta-que-desborda.md]]

**Evita el colapso de márgenes.** Una cabecera, un aviso, un separador vacío y dos tarjetas, cada uno con su colapso. Un pequeño script mide las distancias en directo y marca con ✅ las que ya están bien.

[[exercise:10-ej-evita-el-colapso-de-margenes.md]]

**Arregla los anillos de foco que mueven el diseño.** Pestañas que empujan a sus vecinas, un foco eliminado, un campo que engorda su borde, anillos recortados por un `overflow` y un botón que se hunde con un margen. Todo se arregla con `outline`, `box-shadow` y bordes reservados.

[[exercise:11-ej-anillos-de-foco-sin-saltos.md]]

**Construye la tarjeta de perfil solo con el modelo de cajas.** Partes de un HTML sin estilos y de una lista de medidas: ancho máximo, una franja con proporción fija, un avatar redondo montado sobre ella, una fila de cifras y un botón.

[[exercise:12-ej-construye-la-tarjeta-de-perfil.md]]

## Lo que conviene llevarse

- Empieza siempre con `box-sizing: border-box`: los anchos significan lo que dicen y cambiar el relleno no rompe nada.
- Un bloque con `width: auto` ya llena su contenedor (menos sus márgenes): casi nunca necesitas `width: 100%`, y los márgenes negativos lo agrandan.
- Pon límites en lugar de medidas fijas: `max-width`, `min()`, `min-height`, `aspect-ratio`.
- Espacia los componentes por dentro con `padding` y entre sí con márgenes en una sola dirección; cuando un margen deba quedarse dentro, `display: flow-root`.
- Ningún estado debería cambiar el tamaño de una caja: reserva los bordes, cambia colores y usa `outline` y `box-shadow`, que no ocupan espacio.
- `overflow` recorta todo lo que sale de la caja, también los anillos de foco: dibújalos hacia dentro o quita el recorte.
- Ante una medida inesperada, mira el diagrama de cajas de DevTools o activa el truco del `outline`.
