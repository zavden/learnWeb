# Integración: tipografía y texto

## Qué vas a practicar

Las cuatro lecciones de este módulo tratan el texto desde cuatro ángulos: qué **fuente** lo dibuja (pilas, `@font-face`, fuentes variables, estilos sintéticos), cómo se **compone** (interlineado, medida, alineación, mayúsculas, subrayados, cifras), dónde se **parte** (espacio en blanco, `overflow-wrap`, guiones) y en qué **dirección** se escribe (ejes inline y de bloque, propiedades lógicas, texto bidireccional y vertical). En una página real aparecen todos a la vez: un artículo necesita su fuente, su medida, sus cortes y sus enlaces; una ficha de contacto, su pila del sistema, sus correos que se parten y sus nombres en otros alfabetos.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira el texto y hazte cuatro preguntas: **¿qué fuente lo dibuja y de dónde sale?** (compruébalo con ↗ y **Computed** → **Rendered Fonts**), **¿cuánto mide cada línea y cuánto aire tiene?**, **¿qué pasaría con un contenido más largo o en otro idioma?** y **¿qué lee un lector de pantalla?** Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML y los seis primeros módulos de CSS. Los tamaños de letra son fijos: la tipografía que crece con la pantalla (`clamp()` con `vw`) llega en el módulo de diseño responsive. Las fuentes web están en la carpeta `assets/fonts/` del tema, con sus licencias.

## Un artículo de lectura larga

El sistema tipográfico completo de un texto para leer con calma. Literata con sus dos `@font-face`, recta y cursiva, así que los `em` y la cita usan letras cursivas de verdad. La raíz fija el renglón (17px × 1,5) y todos los márgenes se miden en `rlh`: los párrafos, los títulos y la cita caen sobre la misma pauta. El texto no pasa de `65ch`, los títulos van con `text-wrap: balance`, los párrafos con `pretty` y guiones automáticos, y la primera letra se hunde tres líneas con `initial-letter`. Abre el ejemplo con ↗ y ensancha la ventana: la columna se queda en su medida y se centra.

[[exercise:01-articulo-de-fondo.md]]

## Una tabla de ventas

Todo lo que necesita una tabla de cifras. Los números llevan `tabular-nums` y `text-align: end`, así que unidades, decimales y porcentajes caen en columna; el signo menos es el tipográfico (−, U+2212), que mide lo mismo que el +. Los nombres largos de las sucursales se recortan con «…» dentro de su enlace (las tres propiedades del recorte y `table-layout: fixed` para que la columna tenga ancho), y las cabeceras van en mayúsculas espaciadas escritas con normalidad en el HTML. Fíjate en la fila del total: la variación de +4.6&nbsp;% no se parte, porque lleva un espacio de no separación antes del signo.

[[exercise:02-tabla-de-ventas.md]]

## Fichas de un equipo

Fichas preparadas para el contenido que llega de una base de datos. Cada ficha es una fila flex (avatar y datos) y los datos son un elemento flex con `min-width: auto`: por eso los correos llevan `overflow-wrap: anywhere`, que los parte **y** rebaja el ancho mínimo; con `break-word` la ficha se desbordaría. Los cargos se parten con guiones según su idioma (el de Daniel lleva `lang="en"`), los nombres van en `<bdi>`, los teléfonos tienen espacios de no separación y la URL, `<wbr>` tras cada barra.

[[exercise:03-fichas-del-equipo.md]]

## Un aviso en dos idiomas

El mismo aviso de una biblioteca en español y en árabe, primero con propiedades físicas y después con lógicas. La fila del icono y el texto es flexbox, así que el icono cambia de lado en las dos versiones; todo lo demás depende de cómo esté escrito. Con `border-left`, `padding-right`, `right` y `text-align: left`, la versión árabe queda con la barra al final del texto y la etiqueta «جديد» (nuevo) donde empieza. Con `border-inline-start`, `padding-inline`, `inset-inline-end` y `text-align: start`, es un espejo exacto. La flecha del enlace cambia de sentido con `:dir(rtl)` y lleva un texto alternativo vacío para que el lector de pantalla no la lea.

[[exercise:04-aviso-bilingue.md]]

## La carta de un restaurante de ramen

Una carta japonesa escrita en vertical. Toda la carta es `writing-mode: vertical-rl`: cada platillo es una columna, a la izquierda de la anterior, y su `inline-size` es el alto. Dentro de cada columna, el platillo es una fila flex que corre de arriba abajo, con una línea de puntos que crece con `flex: 1` para que todos los precios terminen a la misma altura. La línea de puntos es una caja sin grosor con un borde en su lado `block-start`, que en vertical es una línea vertical. Los precios combinan sus cifras con `text-combine-upright`, y la traducción al español va en una tabla horizontal con cifras tabulares.

[[exercise:05-carta-vertical.md]]

## Versalitas y etiquetas

Una cabecera de sección con migas de pan, pestañas y una noticia con siglas. Todo el texto está escrito en el HTML como se lee; las mayúsculas y las versalitas las pone el CSS. Las etiquetas cortas van en mayúsculas con `letter-spacing: 0.08em`; las pestañas y las siglas del texto (AHC, BPC, CDMX), en **versalitas** con `font-variant-caps: all-small-caps`, otra de las propiedades `font-variant-*`: mayúsculas de la altura de las minúsculas, que no gritan en mitad de un párrafo. La página actual se marca con `aria-current` y un subrayado grueso y separado, no solo con el color.

[[exercise:06-versalitas-y-etiquetas.md]]

## Una ficha de fuente variable

La ficha de muestra de Roboto Flex, como las que publican las fundiciones. Un único `@font-face` con rangos y los ejes registrados manejados con sus propiedades: pesos del 100 al 1000, anchos del 25 al 151 % e inclinación. La «Aa» gigante usa el tamaño óptico automático. Y una aplicación práctica del eje propio `GRAD`: el texto claro sobre fondo oscuro se percibe más grueso, y un grado negativo lo adelgaza **sin cambiar el ancho de las letras** (compara el borde de las dos cajas oscuras). El grado va en `font-variation-settings` a través de una custom property, para que heredarlo no pise nada.

[[exercise:07-muestrario-variable.md]]

## Comentarios de los lectores

El texto más imprevisible de una página: el que escriben otros. Los saltos de línea se conservan con `white-space: pre-line`, con el texto pegado a las etiquetas; cada comentario y el `textarea` llevan `dir="auto"`, así que el de Sara, en árabe, se alinea a la derecha solo; los nombres van en `<bdi>`, y la URL larguísima de Jorge se parte con `overflow-wrap: anywhere` dentro de su fila flex. El formulario recuerda una regla del primer módulo: los controles no heredan la fuente sin `font: inherit`.

[[exercise:08-comentarios-de-lectores.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Un pequeño script, también bloqueado, lee los estilos calculados y mide las cajas en directo, y marca con ✅ lo que ya está bien (y lo repite en la consola). Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla el artículo.** Un título con las líneas montadas, una fuente web que no llega, un código más pequeño que el texto y un titular con mayúscula en cada palabra.

[[exercise:09-ej-arregla-el-articulo.md]]

**Arregla la página de contacto.** Unas fichas que no miden lo mismo por un correo largo, unos cargos sin guiones, un aviso en árabe con la barra en el lado equivocado y unos nombres que desordenan sus reseñas.

[[exercise:10-ej-arregla-la-pagina-de-contacto.md]]

**Construye la lista de precios.** Esta vez partes de una tabla sin estilos de texto: cifras que formen columnas, precios alineados al final, nombres largos recortados y cabeceras en mayúsculas espaciadas.

[[exercise:11-ej-construye-la-lista-de-precios.md]]

## Lo que conviene llevarse

- Toda pila termina en una genérica sin comillas; las fuentes web se declaran con un `@font-face` por estilo (recta y cursiva) y se comprueban en **Rendered Fonts**.
- `line-height` sin unidad; el texto de lectura, con una medida en `ch` y los espacios en renglones (`lh`, `rlh`).
- `text-wrap: balance` en los títulos y `pretty` en los párrafos; guiones automáticos donde la columna es estrecha, siempre con el `lang` correcto.
- El texto se escribe en el HTML como se lee: mayúsculas, versalitas y espaciado son cosa del CSS, con `letter-spacing` en `em`.
- Cifras que se comparan, con `tabular-nums` y alineadas al final; el recorte con «…» necesita sus tres propiedades y un bloque con ancho.
- El contenido de otros (correos, URL, comentarios, nombres) llega sin avisar: `overflow-wrap: anywhere`, `pre-line`, `<bdi>` y `dir="auto"`.
- Propiedades lógicas por defecto: un layout con ellas, flexbox y grid se invierte solo en árabe y gira en vertical.
