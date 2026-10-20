# Ejemplos profesionales: efectos visuales

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los siete primeros módulos de CSS. Siguen sin media queries: lo que se adapta al ancho lo hace con `auto-fit`, `minmax()`, `min()` y `flex-wrap`. Los efectos son estáticos; donde hay un estado (`:hover`, `:focus-within`, una casilla marcada), el cambio es instantáneo hasta el módulo de animación. Ábrelos con ↗ para verlos en una pestaña y ensanchar la ventana.

Comparten la arquitectura de los módulos anteriores: **capas** (`reset`, `tokens`, `base`, `components`), **tokens** en custom properties y componentes con una sola clase. Y añaden seis reglas de este módulo:

- **El texto sobre una imagen se mide en el peor caso.** Un velo o un cristal tiene la opacidad necesaria para que el texto cumpla 4.5:1 aunque detrás haya un píxel blanco (o negro, si el texto es oscuro). El cálculo está en el comentario de cabecera de cada ejemplo.
- **Lo decorativo es decorativo.** Gráficos, ilustraciones, tramas y libros en 3D llevan `aria-hidden="true"` cuando sus datos ya están en el texto; las imágenes que informan, su `alt`; las obras, su crédito.
- **Las listas se escriben una vez.** Las recetas de `filter` y las sombras viven en custom properties; lo que cambia en un estado va en una variable o en las propiedades sueltas `translate`, `rotate` y `scale`.
- **Los recortes no se comen el foco ni las sombras.** Las sombras de lo recortado o enmascarado son `drop-shadow()` en un envoltorio; las cintas y las insignias recortadas son elementos propios.
- **Nada aplana el 3D sin querer.** Los contenedores con `preserve-3d` no llevan `overflow`, `opacity`, `filter` ni fondo; eso va en las caras o en el escenario.
- **Lo que no todos los navegadores entienden tiene una reserva.** El cristal esmerilado lleva un `@supports` que sube la opacidad del fondo (verás `@supports` con detalle en el módulo de responsive).

Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

## Exposición de museo

**Objetivo:** la página de una exposición que enfrenta a Velasco y a Hokusai. **Técnicas:** portada con tres capas de fondo (velo, brillo cálido y pintura) y un velo medido para que el texto tenga 6.6:1 en el peor caso; borde inferior en diagonal con `clip-path`; las obras con un fundido lateral de `mask-image` hacia el lado del texto, en una rejilla `auto-fit` que se apila sola; una cronología cuya línea y cuyas marcas son degradados. **Fíjate en** el fundido de las obras: es una máscara, no un degradado pintado encima, así que funciona sobre cualquier color de página.

[[exercise:01-exposicion-de-museo.md]]

## Fotografía espacial

**Objetivo:** la portada de una exposición del planetario. **Técnicas:** cabecera `sticky` de cristal (fondo al 60 % + `blur()`, 4.9:1 en el peor caso, con `@supports` de reserva); portada que sube por debajo de la cabecera para que el cristal tenga algo que desenfocar; un cielo de estrellas con cuatro capas de `radial-gradient` en baldosas de 97, 131, 173 y 211px, para que no se note la repetición; y un abanico de tarjetas en 3D con `preserve-3d` en la lista y cada tarjeta girada con `rotate`. **Fíjate en** la tarjeta activa (ratón o <kbd>Tab</kbd>): se adelanta con `translate` en z y queda delante de sus vecinas sin ningún `z-index`.

[[exercise:02-mision-espacial.md]]

## Ficha de producto

**Objetivo:** la página de una olla de barro de una tienda en línea. **Técnicas:** la olla es un SVG con el fondo transparente, con `drop-shadow()` sobre un foco radial; una cinta recortada con un polígono con muesca; estrellas de valoración hechas con una sola caja (un degradado con parada dura en el 86 %, la nota de 4.3 sobre 5, recortado por una máscara de estrella repetida); y el color del esmalte elegido con tres radios y `:has()`, que añade un `hue-rotate()` antes de la sombra en la lista de `filter`. **Fíjate en** la sombra al cambiar de esmalte: la olla cambia de color, la sombra no, porque va después en la lista.

[[exercise:03-pagina-de-producto.md]]

## Panel de indicadores

**Objetivo:** el resumen semanal de un museo. **Técnicas:** cada indicador recibe su valor en una custom property desde el HTML; el medidor es un `conic-gradient` desde `-90deg` con el centro abajo, en una caja 2:1 con las esquinas de arriba redondeadas, al que una máscara radial `farthest-side` le quita el centro; las barras diarias son degradados con parada dura en `--value %`. El estado se dice en palabras y con un símbolo, no solo con el color. **Fíjate en** el medidor de las entradas en línea: el mismo componente con otro color de relleno, pasado también como variable.

[[exercise:04-panel-de-indicadores.md]]

## Doble página de revista

**Objetivo:** un ensayo que une la ola de Hokusai con la foto de la Tierra del Apolo 17. **Técnicas:** dos páginas en una rejilla `auto-fit` que se apilan cuando no caben; la estampa recortada con un `polygon()` de lado diagonal y el texto siguiendo la diagonal con el mismo `shape-outside`; la Tierra en círculo con el texto alrededor; letra capital con `initial-letter`; guiones automáticos y `text-wrap: pretty`; y una cita con dos filetes que son capas de degradado. **Fíjate en** las primeras líneas junto a la estampa: cada renglón empieza un poco más a la izquierda que el anterior.

[[exercise:05-revista-doble-pagina.md]]

## Selector de filtros

**Objetivo:** el panel de filtros de un editor de fotos, sin JavaScript. **Técnicas:** seis radios de verdad, ocultos a la vista con la técnica «visualmente oculto» (`clip-path: inset(50%)`), cada uno con su miniatura ya filtrada; cada receta, en una custom property que comparten la miniatura y la foto grande; `:has()` para aplicar la receta elegida, marcar la opción, mostrar su anillo de foco y enseñar la línea de CSS correspondiente. **Fíjate en** el teclado: con <kbd>Tab</kbd> llegas al grupo y con las flechas cambias de filtro, como en cualquier grupo de radios.

[[exercise:06-selector-de-filtros.md]]

## Cupones y boletos

**Objetivo:** la cartera de cupones de una app. **Técnicas:** muescas hechas con una máscara de dos `radial-gradient`, una capa por mitad (a los lados en el cupón, arriba y abajo en el boleto); la línea de corte y el código de barras, con degradados repetidos (el código, decorativo y repetido en texto); la matriz con `writing-mode: sideways-lr`; y la sombra con `drop-shadow()` en un envoltorio. **Fíjate en** las muescas: la sombra entra en ellas, cosa que una `box-shadow` no podría hacer porque la máscara la recortaría.

[[exercise:07-cupones-y-boletos.md]]

## Esqueletos de carga

**Objetivo:** la vista de una red social mientras llegan las publicaciones. **Técnicas:** cada tarjeta de relleno es un solo `div` cuyos «huesos» (avatar, título, líneas) son capas de fondo colocadas con `background-size` y `background-position`; encima, un brillo en diagonal fijo (moverlo es una animación); fotos de relleno con un sol radial y dos montañas hechas con `conic-gradient`. La sección avisa de que está cargando con `aria-busy="true"` y un texto de estado oculto a la vista. **Fíjate en** que el esqueleto mide lo mismo que una tarjeta real: cuando lleguen los datos, la página no saltará.

[[exercise:08-esqueletos-de-carga.md]]

## Plano de un mercado

**Objetivo:** el plano de un mercado con sus puestos. **Técnicas:** el plano es una caja con cinco capas de fondo (jardín, canal, calles en las dos direcciones y suelo); los marcadores son enlaces de 32 × 32 colocados con `--x` y `--y` desde el HTML, con la gota dentro (un cuadrado con tres esquinas redondas girado −45°) y el número girado al revés; las insignias, un hexágono y una estrella recortados con `clip-path`. Todo el plano se repite en una lista con los mismos números. **Fíjate en** la sombra de los marcadores: va en el enlace, que no gira; en la gota, giraría con ella, porque un filtro se aplica antes que la transformación.

[[exercise:09-marcadores-de-mapa.md]]

## Cartel antiguo

**Objetivo:** el cartel de una exposición de estampas japonesas con aire de imprenta. **Técnicas:** la estampa en duotono (gris, una capa crema con `multiply` y una azul con `lighten`, aisladas con `isolation`); una trama de puntos que solo asoma en una esquina gracias a una capa enmascarada; grano de papel con un SVG de ruido (`feTurbulence`) escrito en una URL de datos y mezclado con `multiply`; y un título en una franja girada. **Fíjate en** el grano: oscurece texto y papel a la vez, y el contraste se ha medido también en los granos más oscuros.

[[exercise:10-cartel-vintage.md]]

## Planes de socio

**Objetivo:** la sección de precios de los amigos del museo. **Técnicas:** la pintura con un velo azul noche como fondo de la sección; tarjetas de cristal (blanco al 72 % y `blur()`, 9:1 en el peor caso) con `@supports` de reserva; el plan recomendado, opaco y con un borde degradado hecho con dos capas de fondo, una recortada a `padding-box` y otra a `border-box`; y una cinta recortada. **Fíjate en** por qué el plan destacado es opaco: con un relleno semitransparente, el degradado del borde se vería a través de toda la tarjeta.

[[exercise:11-precios-con-cristal.md]]

## Libro en 3D

**Objetivo:** el catálogo de la exposición presentado como un objeto. **Técnicas:** portada, lomo, cantos y contraportada colocados en un `preserve-3d`; la portada y la contraportada con las propiedades `translate` y `rotate` (que siempre mueven antes de girar) y el lomo y los cantos con `transform`, porque necesitan girar antes de avanzar; cantos de las páginas con un degradado repetido; y una casilla que da la vuelta al libro con `:has(:checked)`, accesible con el teclado. **Fíjate en** el lomo cuando giras el libro: está a la izquierda de la portada y desaparece tras ella, porque en 3D manda la profundidad.

[[exercise:12-libro-en-3d.md]]
