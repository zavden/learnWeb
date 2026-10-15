# Integración: diseño responsive

## Qué vas a practicar

Las cinco lecciones del módulo responden a cinco preguntas distintas: **¿cuánto mide la ventana?** (media queries), **¿qué prefiere quien la usa?** (tema, movimiento, contraste, puntero, y qué entiende su navegador con `@supports`), **¿cómo crecen los tamaños entre dos anchos?** (`clamp()` fluido), **¿cuánto mide mi hueco?** (container queries) y **¿cómo encaja una foto en su caja?** (`object-fit`, `aspect-ratio`, `image-set()`). En una página real se hacen todas a la vez: una tarjeta de tienda pregunta por su hueco, tiene un título fluido y una foto recortada; un artículo sigue el tema del sistema, se imprime bien y no se desliza si alguien pidió menos movimiento.

Cada ejemplo combina varias de esas preguntas. Antes de leer el código, cambia el ancho de la vista previa (o ábrela con ↗) y hazte tres preguntas: **¿qué cambia al cambiar la ventana y qué al cambiar el hueco?**, **¿qué preferencias del usuario respeta?** y **¿qué pasaría en un móvil de 320px y en un monitor de 2560px?** Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML y los ocho primeros módulos de CSS. Los cambios de estado son instantáneos (las transiciones llegan en el módulo siguiente). Las tarjetas miden 480px; cada ejemplo dice en una etiqueta qué cambia y a partir de qué ancho. Lo que depende de tu sistema (el tema oscuro, por ejemplo) se prueba con DevTools → Rendering. Las imágenes son de dominio público y están en la carpeta `assets/` del tema.

## Una tarjeta de tienda en tres huecos

La tarjeta de una tienda de láminas, en huecos de 220, 340 y 460px. El hueco es el contenedor (con nombre, `slot`) y la tarjeta cambia de estructura a 20rem y a 26rem; el título usa la recta del `clamp()` con `cqi`, así que crece con el hueco y no con la ventana; y la foto vive en una caja 4:3 (cuadrada al lado del texto) con `object-fit: cover` y un punto de interés que cada tarjeta trae en una custom property.

[[exercise:01-tarjeta-de-lamina.md]]

## Una guía con tema, contraste e impresión

Una guía de jardinería con todos sus colores en `light-dark()` y `color-scheme: light dark` en la raíz. Con `prefers-contrast: more`, solo cambian los valores de dos tokens: los textos secundarios y los bordes se acercan al color del texto. El índice desliza la página solo dentro de `prefers-reduced-motion: no-preference`. Y la hoja de impresión fuerza el esquema claro (el papel es blanco, y `light-dark()` obedece a `color-scheme`), esconde el índice y los botones, muestra la dirección de los enlaces externos y evita cortar una sección entre dos páginas.

[[exercise:02-guia-con-tema-e-impresion.md]]

## Un menú que se pliega

La cabecera de un vivero, mobile-first. En pantallas estrechas, el menú es un elemento con el atributo `popover` que abre el botón «Menú», sin JavaScript: se cierra al pulsar fuera o con <kbd>Esc</kbd>, como viste en el capítulo de HTML. Desde 40rem, una media query muestra el mismo `<nav>` en la cabecera y esconde el botón; los estilos del navegador para el popover cerrado son de origen *user agent*, y cualquier regla del autor les gana. Con `any-pointer: coarse`, los enlaces miden al menos 44px de alto.

[[exercise:03-menu-que-se-pliega.md]]

## Un panel con contenedores con nombre

El panel de una tienda: una rejilla `auto-fit` (sin consultas) reparte los widgets en columnas. El panel es un contenedor llamado `dashboard` y decide si el widget de ventas ocupa dos columnas; cada widget es otro contenedor, `widget`, y decide su propio layout. Las cifras crecen con `cqi`. Fíjate en el umbral de 27rem: con menos, solo cabría una columna de 13rem y `span 2` crearía una columna implícita.

[[exercise:04-panel-con-contenedores.md]]

## Una portada con `image-set()`

La portada de una exposición: la pintura de Velasco como fondo con `image-set()` (480 o 960px según la densidad de la pantalla) y una línea de reserva con `url()`; un velo de al menos el 70 % en toda la portada, para que el blanco tenga 6.7:1 en el peor caso; un alto mínimo en `svh`, para que el botón se vea al cargar en un móvil; el título y los rellenos con los tokens fluidos de la lección 3; y otro encuadre del fondo desde 40rem.

[[exercise:05-portada-con-image-set.md]]

## Una tabla que se vuelve fichas

Una tabla de pedidos que, en contenedores estrechos, se convierte en fichas: cada fila es una rejilla de dos columnas, y cada celda, con `subgrid`, pone en la primera la cabecera de su columna (`attr(data-label)`) y en la segunda el dato. La cabecera de la tabla se esconde a la vista pero no a los lectores de pantalla. Como cambiar el `display` de las piezas de una tabla hace que algunos navegadores dejen de anunciarla como tabla, los roles ARIA (`table`, `row`, `cell`…) le devuelven la semántica.

[[exercise:06-tabla-que-se-vuelve-fichas.md]]

## Una galería con `srcset` y `sizes`

La conexión con la lección de imágenes de HTML: una galería de 1, 2 o 3 columnas según dos media queries, y en cada foto un `sizes` que cuenta exactamente lo mismo (`(width >= 50rem) 33vw, (width >= 28rem) 50vw, 100vw`), para que el navegador elija entre el archivo de 480 y el de 960px. Las miniaturas son iguales gracias a `aspect-ratio` y `object-fit`, con el punto de interés de cada obra. Un pequeño script escribe en cada pie el archivo elegido.

[[exercise:07-galeria-con-srcset-y-sizes.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Un pequeño script, también bloqueado, comprueba el resultado y marca con ✅ lo que ya está bien (y lo repite en la consola). Las comprobaciones no dependen del tamaño de la vista previa: el primero mide huecos de ancho fijo, el segundo lee los estilos calculados y las reglas de la hoja, y el tercero calcula lo que debería verse con el ancho actual. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla la tarjeta adaptable.** Un contenedor que se consulta a sí mismo, un título fluido que sigue a la ventana y un `object-fit: cover` sin caja que recortar.

[[exercise:08-ej-arregla-la-tarjeta-adaptable.md]]

**Tema del sistema, pie oscuro y movimiento reducido.** Tokens con `light-dark()` que no siguen al sistema, un pie que debe ser oscuro en los dos temas y un desplazamiento suave que no respeta la preferencia del usuario.

[[exercise:09-ej-tema-y-movimiento.md]]

**Media queries en orden y un título fluido.** Una media query que pierde en la cascada, dos breakpoints que se solapan y un título que tienes que hacer fluido calculando tú la recta.

[[exercise:10-ej-media-queries-y-clamp.md]]

## Lo que conviene llevarse

- Cada pregunta tiene su herramienta: la ventana, una media query; el hueco, una container query; el usuario, `prefers-*` y `hover`/`pointer`; el navegador, `@supports`; los tamaños intermedios, `clamp()`.
- Mobile-first: la base es la versión estrecha y las consultas solo añaden; las consultas van después de las reglas base.
- Los tokens (colores con `light-dark()`, escala y espacios fluidos) hacen que una preferencia o un tamaño se cambien en un solo sitio.
- Los contenedores van en cajas que reciben su ancho de fuera, y lo que cambia con la consulta es un descendiente.
- Las imágenes de contenido van en `<img>` con `srcset`, `sizes` (que describe el CSS) y una caja con proporción; las de fondo, con `image-set()` y una reserva.
- Lo que el usuario pide (menos movimiento, más contraste, otro tema, letra más grande, zoom) siempre gana.
