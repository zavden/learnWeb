# Integración: CSS Grid

## Qué vas a practicar

En las lecciones de este módulo viste grid por partes: las pistas y la unidad `fr`, la colocación con líneas, nombres y áreas, el grid implícito, la alineación en dos niveles y, por último, `subgrid` y las capas. En un componente real aparecen todas a la vez, y muchas veces **anidadas**: una tarjeta es elemento de la rejilla de fuera y, a la vez, rejilla de su propio contenido (o subrejilla que comparte las pistas de fuera).

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira la vista previa y hazte tres preguntas por cada caja: **¿de qué rejilla es elemento, y en qué celdas cae?** (por colocación automática, por líneas o por área), **¿cuánto miden sus pistas?** (fijas, `fr`, de contenido, con `minmax()`) y **¿cómo se alinea dentro de su celda?** Abre los ejemplos con ↗ y activa el overlay de grid de DevTools (la insignia `grid` en **Elements**, con *Show line numbers* o *Show area names*): verás las pistas, los huecos y las áreas de cada rejilla. Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML y los cinco primeros módulos de CSS. Siguen sin media queries: todo lo que se adapta al ancho lo hace con `auto-fill`/`auto-fit`, `minmax()` y `min()`, o con el `flex-wrap` del módulo anterior. Para verlo, estrecha la vista previa o ábrela en su pestaña con ↗.

## Portada de una revista

El esqueleto de una portada dibujado con `grid-template-areas`: la cabecera, el reportaje y los breves ocupan toda la fila; la columna de opinión se extiende a lo alto de dos filas, junto a las dos noticias secundarias. Las dos columnas son `minmax(0, 2fr)` y `minmax(0, 1fr)`, para que ningún titular largo las desequilibre. El reportaje principal apila la foto y el titular en la misma celda, y los breves son una rejilla interior con `auto-fill` y el mínimo protegido con `min()`. Fíjate en la cabecera: nombre y número en una sola línea es trabajo de flexbox, no de grid.

[[exercise:01-portada-de-revista.md]]

## Un escaparate de productos

La rejilla adaptable de la lección de patrones con todos sus complementos. Las columnas salen de `repeat(auto-fill, minmax(min(100%, 9rem), 1fr))`; cada tarjeta ocupa **cuatro filas** de la rejilla (foto, nombre, precio y botón) y las comparte con `subgrid`, así que un nombre de tres líneas agranda su fila para todas las tarjetas de esa fila y los precios quedan alineados. La insignia de descuento va en la misma celda que la foto, en la esquina. Y una decisión de la lección de pistas: `auto-fill` y no `auto-fit`, para que dos resultados de búsqueda no se estiren.

[[exercise:02-galeria-de-productos.md]]

## Un panel de control

Widgets en columnas `auto-fill` y filas **implícitas** con `grid-auto-rows: minmax(5.5rem, auto)`. La gráfica abarca dos columnas y dos filas, los envíos dos columnas y el stock dos filas; sin más, esas piezas grandes dejarían huecos, y `grid-auto-flow: dense` los rellena. El precio de `dense` es el orden: «Clientes nuevos» se ve en la primera fila aunque en el HTML va después de la gráfica, y `reading-flow: grid-rows` hace que el teclado siga lo que se ve (Chrome 137+). La gráfica de barras es otra rejilla de siete columnas dentro del widget. Y un aviso que está en el comentario: `span 2` en una rejilla que se quede en una sola columna crearía una columna implícita, por eso el panel tiene un ancho mínimo.

[[exercise:03-panel-de-control.md]]

## Una tabla de precios

Tres planes con la misma estructura que las tarjetas del escaparate: cada plan ocupa cuatro filas compartidas con `subgrid`, de modo que precios y botones quedan a la misma altura aunque las listas de ventajas midan distinto. La etiqueta «Más elegido» comparte celda con el nombre del plan; el comentario explica por qué hay que darle fila **y** columna (`grid-area: 1 / 1`): con solo `grid-row: 1`, la colocación automática buscaría otra columna libre en esa fila y crearía una implícita.

[[exercise:04-tabla-de-precios.md]]

## Un formulario de envío

El formulario en dos columnas de la lección de alineación, completo: etiquetas en una columna `max-content` pegadas a su campo con `justify-self: end`, campos en `minmax(0, 1fr)`, `align-items: baseline` para que cada etiqueta se apoye en la línea del texto de su campo y `grid-column: 1 / -1` para lo que va a todo el ancho. Dentro hay dos rejillas más: el teléfono (prefijo a su medida y número) y las formas de envío, tres tarjetas en columnas `auto-fit` que se apilan solas y se resaltan con `:has(:checked)`.

[[exercise:05-formulario-de-envio.md]]

## Rutas con pie de foto

Tres capas en la misma celda: la foto (un fondo decorativo que se estira), la dificultad arriba a la izquierda y el pie abajo, cada una colocada con `justify-self` y `align-self`. Compara la segunda tarjeta con las otras: su pie es más largo, la celda crece y la foto crece con ella. Con `position: absolute`, ese texto se habría salido de la tarjeta. Como las tarjetas de una fila miden lo mismo (la fila las estira), las tres quedan igual de altas.

[[exercise:06-rutas-con-pie-de-foto.md]]

## El calendario del mes

El ejemplo más técnico de la página. `.month` define siete columnas y seis filas **explícitas**: tienen que serlo para que `grid-row: 2 / -1` llegue hasta abajo. La lista de días y la lista de actividades ocupan las mismas celdas, como dos capas, y las dos usan las pistas de `.month` con `subgrid` en filas y columnas. En la capa de los días, el 1 de octubre de 2026 se coloca en la columna del jueves y los demás siguen solos; en la de actividades, cada una va en su semana y su día, con `span` si dura varios. Como las dos capas comparten pistas, una actividad de tres líneas agranda su semana también para la capa de los días.

[[exercise:07-calendario-del-mes.md]]

## Documentación con índice

Una página de documentación dentro de una «ventana» con scroll. El índice va en una columna `fit-content(9rem)`, es `sticky` y lleva `align-self: start`: sin él, la fila lo estiraría hasta el alto del artículo y no tendría recorrido. El contenido es `minmax(0, 1fr)`, así que el bloque de código con una línea larguísima se desplaza dentro de su caja en lugar de ensanchar la página. La tabla de parámetros es un `dl` de tres columnas en el que cada fila hereda las columnas con `subgrid`.

[[exercise:08-documentacion-con-indice.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Un pequeño script, también bloqueado, mide las cajas en directo y marca con ✅ lo que ya está bien (y lo repite en la consola). Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla el escaparate.** Cuatro columnas `1fr` que no miden lo mismo, una tarjeta destacada que no abarca las dos columnas que debía, filas implícitas sin tamaño y unas novedades que se estiran por culpa de `auto-fit`.

[[exercise:09-ej-arregla-el-escaparate.md]]

**Arregla la página del taller.** Una cabecera que no llega al final, una columna implícita que aparece de la nada, una barra lateral `sticky` que no se pega y una tarjeta de alto fijo cuyas filas crecen sin motivo.

[[exercise:10-ej-arregla-la-pagina-del-taller.md]]

**Construye las tarjetas de talleres.** Esta vez partes de un CSS sin layout: una rejilla adaptable que no se desborde en una columna estrecha, tarjetas cuyas filas se alinean con `subgrid` y una insignia superpuesta a la foto.

[[exercise:11-ej-construye-las-tarjetas.md]]

## Lo que conviene llevarse

- Grid para el esqueleto y las rejillas de tarjetas; flexbox dentro de cada pieza cuando es una sola fila o columna (una cabecera, un precio con su «antes», una barra de acciones).
- Las columnas que deben medir lo mismo pase lo que pase llevan `minmax(0, 1fr)`; las rejillas adaptables, `repeat(auto-fill, minmax(min(100%, …), 1fr))`, con `auto-fit` solo si los elementos deben llenar la fila.
- Las filas casi siempre son implícitas: dales tamaño con `grid-auto-rows`, y si algo debe llegar «hasta la última fila» con `-1`, declara esas filas.
- Para colocar, elige la herramienta que mejor se lea: áreas para el esqueleto, `1 / -1` para «toda la fila», `span` para los tamaños. Y si colocas solo en un eje, recuerda que la colocación automática decide el otro.
- Tarjetas cuyas partes deben alinearse entre columnas: `grid-row: span N` y `grid-template-rows: subgrid`.
- Capas en la misma celda (`grid-area: 1 / 1`) en lugar de `position: absolute`: la celda crece con la capa más alta y nada se sale.
- `align-self: start` en todo lo que sea `sticky` dentro de una rejilla; y en contenedores con alto fijo, di qué fila se queda con el sobrante.
- El orden del HTML sigue siendo el de lectura: `dense` y la colocación cambian lo que se ve; si el orden visual debe mandar, `reading-flow`.
