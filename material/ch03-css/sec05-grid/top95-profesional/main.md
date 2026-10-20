# Ejemplos profesionales: CSS Grid

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los cinco primeros módulos de CSS. Siguen sin usar media queries, y aun así todos se adaptan al ancho: lo hacen con `auto-fill`/`auto-fit`, `minmax()`, `min()` y `clamp()`, y con el patrón de barra lateral que se apila del módulo de flexbox. Estrecha la vista previa, o ábrela en su pestaña con ↗ y cambia el ancho de la ventana, para ver cada uno en un móvil y en un monitor. Con la pestaña abierta, activa el overlay de grid en DevTools: la mayoría de las páginas tienen tres o cuatro rejillas anidadas.

Comparten la arquitectura de los módulos anteriores: **capas** (`reset`, `tokens`, `base`, `components`), **tokens** en custom properties y componentes de una sola clase. Y añaden seis reglas de este módulo:

- Las rejillas adaptables son `repeat(auto-fill, minmax(min(100%, <mínimo>), 1fr))`: `min()` impide que una columna sea más ancha que su contenedor. `auto-fit` solo cuando los elementos deben llenar la fila.
- Lo que debe medir lo mismo pase lo que pase lleva `minmax(0, 1fr)` (o `min-width: 0` si es un elemento flex).
- Las tarjetas cuyas partes deben alinearse entre columnas ocupan varias filas con `span` y las comparten con `subgrid`.
- Las superposiciones (texto sobre foto, insignias, puntos de estado) son capas en la misma celda (`grid-area: 1 / 1`), no `position: absolute`: la celda crece con la capa más alta.
- Las fotos que deben llenar una celda de cualquier proporción van como fondo, con `role="img"` y `aria-label` si son contenido. `object-fit`, que permite hacerlo con `<img>`, llega en el módulo de responsive.
- El orden del HTML es el orden de lectura. Donde `dense` cambia el orden visual de elementos que se recorren con el teclado, va acompañado de `reading-flow: grid-rows`.

Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

## Portada de periódico

**Objetivo:** la portada de un diario local. **Técnicas:** cabecera con `flex-wrap`; noticia principal con el titular sobre la foto (dos capas, la celda crece con el titular); noticias secundarias en `auto-fit` que comparten cuatro filas con `subgrid` (foto, sección, titular y entradilla); columnas de opinión con la foto a lo alto de dos filas; opinión y «Lo más leído» que se reparten la fila con flexbox. **Fíjate en** los titulares de «Más noticias»: tienen longitudes muy distintas y, aun así, las entradillas empiezan a la misma altura.

[[exercise:01-portada-de-periodico.md]]

## Catálogo con filtros

**Objetivo:** la página de una categoría de una tienda. **Técnicas:** filtros y resultados con la barra lateral que se apila (flexbox: no hay nada que alinear en dos dimensiones); cada opción de filtro es una rejilla de tres columnas con el recuento al final; productos en `auto-fill` (no `auto-fit`, para que pocos resultados no se estiren) con cinco filas compartidas por `subgrid`; la insignia de descuento como capa de la foto. **Fíjate en** el pothos: su nombre ocupa más líneas que los demás y su fila crece para todas las tarjetas de esa fila, así que valoraciones, precios y botones siguen alineados.

[[exercise:02-catalogo-con-filtros.md]]

## Portafolio fotográfico

**Objetivo:** un mosaico de fotos de distintos tamaños. **Técnicas:** columnas `auto-fill` de 7rem y filas implícitas de 7rem (`grid-auto-rows`); piezas de 2 × 2, 2 × 1 y 1 × 2 con `span`; `grid-auto-flow: dense` para rellenar los huecos; un `min-width` de dos columnas, porque `span 2` en una rejilla de una columna crearía una columna implícita; cada foto, un enlace con la imagen de fondo y el pie superpuesto siempre visible. **Fíjate en** el orden: con `dense`, algunas fotos se ven antes que otras que van delante en el HTML (en la vista previa estrecha, la 4 antes que la 3). Recorre las fotos con <kbd>Tab</kbd>: con `reading-flow: grid-rows` (Chrome 137+), el foco sigue el orden en que se ven.

[[exercise:03-portafolio-fotografico.md]]

## Carta de restaurante

**Objetivo:** la carta de una fonda. **Técnicas:** el platillo del día como capas (foto y caja de texto); secciones en columnas `auto-fit`; cada platillo es una rejilla de tres columnas (nombre a su medida pero partible con `minmax(0, max-content)`, puntos `1fr` y precio) alineada con `last baseline`; la descripción en una segunda fila a todo el ancho. **Fíjate en** «Huevos al gusto con salsa de molcajete»: estrecha la vista previa hasta que el nombre se parta, y verás los puntos y el precio apoyados en su última línea. El comentario explica por qué aquí **no** conviene `subgrid`.

[[exercise:04-menu-de-restaurante.md]]

## Programa de un congreso

**Objetivo:** un horario por salas. **Técnicas:** columnas con nombre (`[sala-a]`, `[sala-b]`…) y filas con nombre por cada media hora (`[t0930]`…); cada sesión se coloca con dos custom properties escritas en el HTML (`--start`, `--end`) que el CSS usa en `grid-row`; las pausas cruzan todas las salas con `sala-a / end`; las horas de la columna izquierda las coloca la colocación automática, una debajo de otra; scroll horizontal en pantallas estrechas en lugar de sesiones aplastadas. **Fíjate en** que el programa se edita como datos: mover una sesión es cambiar `--start` y `--end`, sin tocar el CSS.

[[exercise:05-programa-del-congreso.md]]

## Panel de administración

**Objetivo:** el resumen de una tienda. **Técnicas:** barra superior y menú lateral con flexbox; indicadores en `auto-fit` con tres filas compartidas por `subgrid`; una gráfica de barras hecha solo con grid: diez filas para los valores y una para los meses, y cada barra abarca `span var(--value)` filas hasta la línea `-2`; actividad reciente con hora y texto en columnas compartidas; tabla de pedidos con scroll horizontal propio. **Fíjate en** la gráfica: no hay alturas en píxeles ni porcentajes, solo filas; cambiar un dato es cambiar `--value`.

[[exercise:06-panel-de-administracion.md]]

## Página de presentación

**Objetivo:** vender un kit de riego en una sola página. **Técnicas:** portada en dos columnas `auto-fit` que se apilan; la insignia «−40 % de agua» como capa de la foto; ventajas y testimonios con `subgrid` (icono, título y texto; cita y autor); pasos con el número a lo alto de dos filas; la llamada final centrada con `place-items: center`; pie con columnas de enlaces en `auto-fit`. **Fíjate en** los testimonios: las citas miden distinto, pero los autores quedan en la misma línea.

[[exercise:07-landing-de-producto.md]]

## Documentación

**Objetivo:** una página de referencia de una API. **Técnicas:** cabecera en una rejilla de tres columnas (`auto minmax(0, 1fr) auto`); menú, artículo e índice con dos niveles de barra lateral que se apila; el índice «En esta página» es `sticky` con `align-self: flex-start`; dentro del artículo, un aviso con el icono a lo alto de dos filas, la tabla de parámetros con `subgrid` y anterior/siguiente en `auto-fit`. **Fíjate en** el bloque de código: su línea es larguísima y se desplaza dentro de su caja, porque el artículo tiene `min-width: 0` y la tarjeta de código, `overflow: hidden`.

[[exercise:08-documentacion.md]]

## Receta

**Objetivo:** una receta fácil de seguir en la cocina. **Técnicas:** título sobre la foto (capas); datos rápidos en `auto-fit`; ingredientes y preparación en dos columnas que se apilan; ingredientes con cantidad e ingrediente en columnas compartidas con `subgrid`, la cantidad alineada a la derecha; pasos con el número en su propia columna; un truco con el icono a lo alto de dos filas. **Fíjate en** las cantidades: «2 tazas» y «½ taza» tienen anchos distintos y todas terminan en la misma vertical.

[[exercise:09-receta.md]]

## Comparativa de planes

**Objetivo:** comparar tres suscripciones de un vistazo. **Técnicas:** cada plan ocupa nueve filas con `subgrid`, y su lista de ventajas es **otra** subrejilla de cinco de esas filas: `subgrid` anidado; nombre y etiqueta «Más elegido» en la misma celda; las ventajas que faltan se dicen con texto («Sin visitas»), no solo con un guion. **Fíjate en** «Chat con una experta todos los días»: si ocupa dos líneas, su fila crece en los tres planes y cada ventaja sigue a la altura de su equivalente.

[[exercise:10-comparativa-de-planes.md]]

## Directorio del equipo

**Objetivo:** el directorio de una empresa por departamentos. **Técnicas:** una sola rejilla `auto-fill` para todos los departamentos, con los títulos a todo el ancho (`grid-column: 1 / -1`) entre las tarjetas; tarjetas de cuatro filas con `subgrid`; el punto de estado como capa de la foto, abajo a la derecha, decorativo porque el estado también va escrito. **Fíjate en** cómo la colocación automática pone cada título de departamento en la primera fila libre después de las tarjetas anteriores, y las tarjetas siguientes debajo.

[[exercise:11-directorio-del-equipo.md]]

## Cartel de festival

**Objetivo:** el cartel de un festival de música. **Técnicas:** una rejilla de una sola celda con cuatro capas (cielo, sol, montañas en SVG y contenido), cada una colocada con la alineación de grid; cabezas de cartel en una fila flex que se parte; los tres días en columnas `auto-fit`; la compra centrada con `place-items`. **Fíjate en** que el cartel mide lo que su contenido: cuando los días se apilan, crece, y las capas de fondo crecen con él. El sol es de un naranja oscuro porque el título puede pasar por encima.

[[exercise:12-cartel-de-festival.md]]

## Rejilla «bento»

**Objetivo:** presentar las funciones de una aplicación en piezas de distintos tamaños. **Técnicas:** columnas `auto-fill` y filas implícitas con `minmax(8rem, auto)`; la pieza principal a todo el ancho con `1 / -1`; piezas anchas y altas con `span`; `dense` para no dejar huecos; cada pieza con un hueco elástico arriba y el texto abajo, y las cifras grandes como capa. **Fíjate en** el comentario sobre `dense`: aquí es seguro porque las piezas no son enlaces ni se leen en secuencia; en el portafolio, donde sí lo son, hizo falta `reading-flow`.

[[exercise:13-bento-de-funciones.md]]
