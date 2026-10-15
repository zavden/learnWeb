# Integración: efectos visuales

## Qué vas a practicar

Las cinco lecciones de este módulo añaden una capa nueva a cada caja: **degradados** que se generan en vez de descargarse, **filtros y mezclas** que procesan lo ya pintado, **recortes y máscaras** que deciden qué parte se ve, y **transformaciones** en 2D y 3D que mueven, giran y proyectan sin tocar el layout. En una interfaz real casi nunca aparecen solos: una portada combina capas de fondo con un recorte, una tarjeta de producto une una sombra con forma, una cinta recortada y un estado que la levanta, y un gráfico mezcla un degradado cónico con una máscara y una tabla.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, mira el resultado y hazte cuatro preguntas: **¿qué capas hay y en qué orden se pintan?**, **¿qué crea un contexto de apilamiento o aplana el 3D sin que se note?**, **¿qué pasa con el texto que hay encima (su contraste en el peor caso)?** y **¿qué es decoración y qué es información?** Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML y los siete primeros módulos de CSS. Los estados de `:hover` cambian al instante (las transiciones llegan en el módulo de animación), y cada uno tiene al lado una copia fija para que veas el resultado sin mover el ratón. Las imágenes son de dominio público y están en la carpeta `assets/` del tema.

## La portada de una exposición

Tres capas de fondo en una sola lista: un velo oscuro de abajo arriba, un brillo cálido arriba a la derecha y la pintura de Velasco. El velo tiene al menos un 70 % de opacidad bajo todo el texto, así que el blanco conserva un contraste de 6.6:1 aunque detrás hubiera un píxel blanco. El borde inferior se corta en diagonal con `clip-path`, y la banda de información se mete por debajo con un margen negativo: en el triángulo recortado asoman sus lunares. El sello «Entrada libre» es un `repeating-conic-gradient` con un centro liso, girado con la propiedad `rotate`.

[[exercise:01-portada-de-exposicion.md]]

## Una tarjeta de producto

La planta es un SVG con el fondo transparente, así que su sombra es un `drop-shadow()` que sigue la maceta y las pencas, sobre un foco de luz radial. La cinta «Nuevo» es un elemento aparte recortado con un `polygon()` con muesca: si el recorte fuera de la tarjeta, se comería su sombra y su anillo de foco. Al pasar el ratón o al llegar con el teclado (`:focus-within`), la tarjeta sube con `translate` y la planta crece con `scale` desde la base; la sombra se alarga cambiando solo una custom property, sin reescribir la lista de `filter`. Todo el área de la tarjeta es pulsable gracias al `::after` del enlace.

[[exercise:02-tarjeta-de-producto.md]]

## Una galería con filtros

Cuatro versiones de *La gran ola*: original, blanco y negro, «antigua» y un duotono. Las dos recetas de filtros son listas completas. El duotono es la técnica clásica de las imprentas digitales: la foto en gris, una capa ámbar con `multiply` (las luces se tiñen de ámbar) y una azul con `lighten` (las sombras se vuelven azules). Las dos capas son pseudoelementos con `z-index: 1`, porque la foto, con su `filter`, también es una capa; e `isolation: isolate` en la figura evita que se mezclen con el fondo de la página. En una pantalla de gama amplia los tonos exactos cambian un poco: la mezcla se hace en el espacio de color de la pantalla.

[[exercise:03-galeria-con-filtros.md]]

## Una barra de cristal

Una barra `sticky` con `backdrop-filter: blur() saturate()` sobre la foto de los Pilares de la creación, dentro de una ventana con scroll. Su fondo blanco al 62 % está calculado para el peor caso (un píxel negro detrás): el texto mantiene 6.7:1. La línea inferior es un degradado de 1px como primera capa del fondo. Y un `@supports not (backdrop-filter: …)` (verás `@supports` en el módulo de responsive) vuelve la barra casi opaca en los navegadores que no entienden el efecto, porque sin desenfoque la foto nítida molestaría al leer.

[[exercise:04-barra-de-cristal.md]]

## Un gráfico de dona con su tabla

El anillo es un `conic-gradient` con paradas duras, con el agujero hecho con una máscara radial; el total va en un elemento hermano superpuesto en la misma celda de grid, porque dentro de la dona la máscara lo haría transparente. Los colores alternan oscuro y claro para que dos porciones vecinas contrasten al menos 3.7:1. Los datos de verdad están en una tabla con `caption`, cabeceras con `scope`, cifras tabulares y una fila de total; el gráfico lleva `aria-hidden="true"` para no repetirlos.

[[exercise:05-grafico-de-dona.md]]

## Una receta que se voltea

Una tarjeta en 3D: el frente es un banderín de papel picado (un `repeating-conic-gradient` en baldosas y un borde en zigzag hecho con un `polygon()` de dientes) y el reverso, los ingredientes. La tarjeta tiene `preserve-3d` y nada que la aplane: el `overflow: hidden` y las esquinas redondeadas están en las caras. Se voltea con `:hover` y también al llegar con <kbd>Tab</kbd> al enlace del reverso, que recibe el foco aunque esté de espaldas: `:focus-within` la gira para enseñarlo.

[[exercise:06-receta-que-se-voltea.md]]

## Estados vacíos

Las pantallas de «no hay nada aquí» son el sitio ideal para ilustraciones hechas solo con CSS: pesan cero bytes y siguen el color del tema. Cada ilustración es un círculo con un patrón (lunares o rayas) y piezas superpuestas en la misma celda de grid: un icono SVG usado como máscara de una caja `currentColor`, confeti girado con `translate` y `rotate`, y un anillo discontinuo hecho con un `repeating-conic-gradient` al que una máscara radial le quita el centro. Todo lleva `aria-hidden="true"`: el mensaje y la acción están en el texto.

[[exercise:07-estados-vacios.md]]

## Un artículo con fundido

Una página de revista: la foto de la Tierra recortada con `circle(44%)` (el radio del planeta en la foto) y el texto rodeándola con el mismo `shape-outside`, las dos formas medidas con `border-box`; la letra capital de tres líneas del módulo de tipografía, y el texto cortado a 250px con un fundido de `mask-image` antes del enlace «Seguir leyendo». El fundido avisa de que el texto sigue sin un corte en seco a mitad de línea.

[[exercise:08-articulo-con-fundido.md]]

## Ejercicios

Cada ejercicio tiene el HTML bloqueado: solo se trabaja en el CSS, en los puntos marcados con `TODO`. Un pequeño script, también bloqueado, lee los estilos calculados (y, en el de la caja, mide dónde se pintan las caras) y marca con ✅ lo que ya está bien; lo repite en la consola. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla la galería.** Un `:hover` que devuelve el color a una foto en gris, un cristal esmerilado que no esmerila, un sello que no gira y la sombra rectangular de un logotipo transparente.

[[exercise:09-ej-arregla-la-galeria.md]]

**Arregla la caja en 3D.** Una caja de producto que se ve plana: la perspectiva en el sitio equivocado, un `overflow` que aplana el 3D y una cara con sus funciones en el orden equivocado.

[[exercise:10-ej-arregla-la-caja-3d.md]]

**Construye el boleto.** Esta vez partes de un boleto liso: rayas en la matriz, dos muescas con una máscara, una sombra que entre en las muescas y un sello girado.

[[exercise:11-ej-construye-el-boleto.md]]

## Lo que conviene llevarse

- Un fondo puede tener muchas capas: velos, brillos, patrones y fotos en la misma lista, la primera encima; el texto sobre una foto necesita un velo calculado para el peor caso.
- Las listas (`filter`, `transform`, `background`) se sustituyen enteras: lo que cambia en un estado, mejor en una custom property o en las propiedades sueltas `translate`, `rotate` y `scale`.
- Un recorte o una máscara se comen las sombras y el `outline`: la sombra va con `drop-shadow()` en un envoltorio, y el recorte, en un elemento aparte si la caja tiene que conservar su foco.
- `filter`, `opacity`, `mix-blend-mode`, `transform`, `clip-path` y `mask` pintan el elemento como un grupo: crean contextos de apilamiento y aplanan el 3D. Ponlos donde no estorben (en una capa, en una cara).
- Las ilustraciones, los gráficos y los fondos hechos con CSS son decoración: los datos y los mensajes van en el HTML.
- Los modos de mezcla sirven para efectos, no para colores exactos: el resultado depende del espacio de color de la pantalla.
