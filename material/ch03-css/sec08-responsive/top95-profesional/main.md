# Ejemplos profesionales: diseño responsive

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los ocho primeros módulos de CSS (sin Sass, que tiene su propio capítulo). Los estados son instantáneos hasta el módulo de animación; donde algo se mueve (un desplazamiento suave hasta un ancla), solo lo hace si el usuario no ha pedido reducir el movimiento.

Las vistas previas miden 480px, como un móvil grande. Cada párrafo dice qué ver ahí y qué cambia al ensanchar: hazlo en el editor o abre el ejemplo con ↗ y cambia el tamaño de la ventana (o usa el modo dispositivo de DevTools). Lo que depende de tu sistema (el tema oscuro, más contraste, menos movimiento) se prueba con DevTools → Rendering.

Comparten la arquitectura de los módulos anteriores: **capas** (`reset`, `tokens`, `base`, `components`, `layout` y, donde hay hoja de impresión, `print`), **tokens** en custom properties y componentes con una sola clase. Y añaden seis reglas de este módulo:

- **Mobile-first y pocas consultas.** La base es la versión estrecha, en el orden del HTML. Las media queries (en `rem`, con la sintaxis de rangos y después de las reglas base) solo cambian el esqueleto de la página; los componentes se adaptan a su hueco con container queries, y lo que basta con repartir en filas usa `auto-fit` sin ninguna consulta.
- **Tamaños fluidos y accesibles.** Letra y espacios con la recta del `clamp()` de la lección 3 (16px con 320px de ventana, 20px con 1200px; escala de 1,2 a 1,25): mínimo, corte y máximo en `rem`, la pendiente en `vw` (o en `cqi`, dentro de un componente). Crecen con el zoom y con la letra que elija el usuario.
- **El usuario manda.** Tema claro u oscuro con `color-scheme` y `light-dark()`; `prefers-contrast: more` cambia unos pocos tokens; los bordes transparentes reaparecen en `forced-colors`; objetivos de 44px con `any-pointer: coarse`; nada importante detrás de un `:hover`.
- **Los contenedores, en cajas que reciben su ancho de fuera.** Y lo que cambia con una consulta es siempre un descendiente: un contenedor no se consulta a sí mismo.
- **Imágenes con su caja.** El reset (`max-width: 100%`, `height: auto`, `display: block`), `width` y `height` en el HTML, cajas con `aspect-ratio` y `object-fit: cover` recortado por el punto de interés de cada obra (`--focus`); `srcset` y `sizes` que describen el layout; `image-set()` con una reserva para los fondos. Las obras llevan su crédito.
- **Lo nuevo, como mejora.** Las consultas de estado de scroll (solo en Chrome) y el cristal esmerilado (`@supports`) añaden algo a una página que ya funciona sin ellos.

Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

## Portada de periódico

**Objetivo:** la portada de un diario con tema claro u oscuro. **Técnicas:** escala tipográfica y espacios fluidos; todos los colores con `light-dark()`; esqueleto mobile-first con una sola media query (desde 48rem, la noticia principal y la columna de «Lo último» lado a lado, con áreas de grid); noticias secundarias en una rejilla `auto-fill` en la que cada noticia es un contenedor y pone la foto al lado cuando su hueco mide 24rem. **Fíjate en** las noticias secundarias a 480px: una sola columna, pero con la foto a un lado, porque su hueco es ancho. Al ensanchar hasta tres columnas, cada noticia vuelve a poner la foto arriba.

[[exercise:01-portada-de-periodico.md]]

## Receta imprimible

**Objetivo:** una receta que se usa en el móvil, en la cocina y en papel. **Técnicas:** casillas de ingredientes de 44px con `any-pointer: coarse`; desde 48rem, ingredientes pegados a la izquierda mientras se leen los pasos; una capa `print` al final de la cascada con una columna, letra en puntos, sin menús ni comentarios, sin cortar pasos entre hojas (`break-inside: avoid`) y márgenes de página con `@page`. **Fíjate en** la vista previa de impresión (↗ y <kbd>⌘</kbd> <kbd>P</kbd>): los ingredientes salen a dos columnas, en un recuadro, y la dirección de la receta al pie.

[[exercise:02-receta-imprimible.md]]

## Catálogo con filtros

**Objetivo:** el catálogo de una tienda de láminas. **Técnicas:** por debajo de 52rem, el formulario de filtros es un `popover` que abre el botón «Filtrar» (se cierra al pulsar fuera, con <kbd>Esc</kbd> o con «Cerrar»); desde 52rem, el mismo formulario es una columna lateral pegada, y una regla del autor gana a los estilos del popover cerrado; rejilla de productos `auto-fill` con fotos 4:3 recortadas por su punto de interés. **Fíjate en** que el `<select>` de ordenar, fuera del formulario, pertenece a él con el atributo `form`: los dos se envían juntos.

[[exercise:03-catalogo-con-filtros.md]]

## Planes de socio

**Objetivo:** los planes de los amigos de un museo, en la página y en una barra lateral. **Técnicas:** el componente es un contenedor con nombre; desde 26rem, tres columnas cuyas filas (nombre, precio, ventajas y botón) se alinean entre planes con `subgrid` y `grid-auto-flow: column`; cada plan es otro contenedor y su precio crece con `cqi`; los enlaces dicen «Elegir» a la vista y «Elegir el plan Amigo» a un lector de pantalla. **Fíjate en** las dos copias a 480px: la principal (unos 440px) en tres columnas y la de la barra lateral (18rem) apilada. Mismo HTML, mismo CSS.

[[exercise:04-tabla-de-precios.md]]

## Tabla de datos adaptable

**Objetivo:** la calidad del aire por alcaldía, en la página y en un widget. **Técnicas:** el contenedor es la región que envuelve la tabla; por debajo de 26rem, fichas (cada celda con su cabecera desde `attr(data-label)` y `subgrid`); desde 26rem, tabla con la primera columna pegada (`sticky`) dentro de una región con scroll horizontal que se puede desplazar con el teclado (`tabindex="0"`, `role="region"` y nombre); roles ARIA para no perder la semántica de tabla; el estado dicho con texto y apoyado con color. **Fíjate en** las dos copias a 480px: tabla en la principal y fichas en el widget de 17rem.

[[exercise:05-tabla-de-datos-adaptable.md]]

## Panel de visitas

**Objetivo:** el panel de un museo, con tema claro u oscuro. **Técnicas:** media query para el esqueleto (por debajo de 56rem, el menú es una barra arriba; desde ahí, una columna lateral); widgets en una rejilla `auto-fit`; el área principal es un contenedor que decide si el ranking ocupa dos columnas, y cada widget es otro contenedor que decide su layout interno; cifras con `cqi`; un medidor de aforo en un contenedor de tipo `size` con alto fijo, medido con `cqmin` para que el anillo siempre sea redondo y quepa. **Fíjate en** el umbral del ranking (25rem): con menos, no cabrían dos columnas de 12rem y `span 2` crearía una columna implícita.

[[exercise:06-panel-de-analitica.md]]

## Galería de arte

**Objetivo:** la obra del mes y cuatro obras de dominio público con una vista ampliada. **Técnicas:** la obra del mes usa **dirección de arte**: un `<picture>` cuyo `<source media="(width < 40rem)">` entrega otro archivo, un recorte vertical de 480 × 600 con el cerro, el águila y el valle (con sus propios `width` y `height`), y desde 40rem el cuadro apaisado en una franja 21:9 recortada con `object-position`. No es lo mismo que el **cambio de resolución** de `srcset`: allí el encuadre es el mismo y el navegador elige el tamaño del archivo; aquí eliges tú qué imagen se ve en cada ancho. Después, una rejilla de 1, 2 o 3 columnas (30rem y 60rem) con un `sizes` que la describe; miniaturas 4:3 con `object-fit: cover` y el punto de interés de cada obra; la vista ampliada es un `<figure popover>` centrado por el navegador, con su `::backdrop`, y la imagen de 960px con `loading="lazy"`: como el popover está oculto, no se descarga hasta que se abre. **Fíjate en** las miniaturas: son decorativas (`alt=""`), porque el título está justo debajo y la descripción completa de cada obra está en la vista ampliada. En las miniaturas basta con recortar la misma foto con CSS; la obra del mes necesita `<picture>` porque su versión estrecha es otra imagen.

[[exercise:07-galeria-de-arte.md]]

## Sistema de temas

**Objetivo:** la zona de préstamos de una biblioteca con cuatro temas. **Técnicas:** dos niveles de tokens (la paleta y los de significado, con `light-dark()`); el selector Sistema/Claro/Oscuro solo cambia `color-scheme` en la raíz con `:has()`; «Más contraste» y `prefers-contrast: more` cambian tres tokens; en `forced-colors`, los botones primarios recuperan su borde (transparente hasta entonces) y las muestras de color de las estanterías conservan su color con `forced-color-adjust: none`. **Fíjate en** que ningún componente sabe qué tema hay: todos usan los mismos tokens de significado.

[[exercise:08-sistema-de-temas.md]]

## Documentación con cabecera pegada

**Objetivo:** la guía de inicio de una API de datos abiertos. **Técnicas:** la cabecera es `sticky` y un contenedor de estado de scroll: al pegarse, su interior gana sombra y se compacta (`scroll-state(stuck: top)`, solo en Chrome; en los demás navegadores se pega igual); anclas con `scroll-margin-top` para que la sección no quede debajo de la cabecera; desplazamiento suave solo sin «reducir movimiento»; índice arriba en pantallas estrechas y columna lateral pegada desde 56rem; el bloque de código se desplaza en horizontal y con el teclado. **Fíjate en** la sombra: aparece al hacer scroll, no antes, porque al principio la cabecera está en su sitio.

[[exercise:09-documentacion-con-cabecera-pegada.md]]

## Boletín

**Objetivo:** la versión web del boletín mensual de un museo. **Técnicas:** una columna de lectura con `width: min(100% - 2rem, 36rem)`, sin media queries; letra y espacios fluidos; tema con `light-dark()`; cada noticia es un contenedor que pone su foto cuadrada a un lado desde 26rem; hoja de impresión sin la baja ni los botones y con las direcciones de los enlaces. **Fíjate en** las noticias: a 480px, la columna mide unos 400px de contenido y las fotos van arriba en 2:1; al ensanchar, la columna llega a 36rem y las fotos se ponen a un lado.

[[exercise:10-boletin.md]]

## Ficha de producto

**Objetivo:** la ficha de una lámina de *La gran ola*. **Técnicas:** cuatro miniaturas que son la misma foto recortada con `object-position` (ningún archivo extra); cuatro radios y `:has()` deciden qué detalle se amplía en la imagen principal, con `scale` desde el punto del detalle (`transform-origin`) dentro de un marco 3:2 con `overflow: clip`; la caja de compra es un contenedor que pone tamaño y cantidad en una fila desde 22rem; desde 48rem, galería y compra lado a lado, con la compra pegada. **Fíjate en** el teclado: <kbd>Tab</kbd> llega al grupo de detalles y las flechas cambian de uno a otro, como en cualquier grupo de radios.

[[exercise:11-ficha-de-producto.md]]

## Noche de las estrellas

**Objetivo:** la página de un evento nocturno en un planetario. **Técnicas:** siempre oscura con `color-scheme: dark` (un solo esquema: controles y `<details>` oscuros); cabecera pegada de cristal con una reserva `@supports not (backdrop-filter: …)`; portada con `image-set()`, un velo de al menos el 70 % y un alto mínimo `clamp(18rem, 80svh, 40rem)`; un programa que pasa de dos líneas por actividad a tres columnas alineadas con `subgrid` cuando su contenedor mide 32rem; actividades en una rejilla `auto-fit`. **Fíjate en** el programa a 480px (dos líneas por actividad) y en una ventana ancha (una tabla de tres columnas sin ser una tabla).

[[exercise:12-landing-de-evento.md]]
