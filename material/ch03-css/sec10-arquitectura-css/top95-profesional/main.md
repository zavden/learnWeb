# Ejemplos profesionales: arquitectura y CSS moderno

Estos ejemplos son pequeños sistemas de diseño completos, cada uno en una página: un reset, una base, tokens, componentes y, donde hace falta, utilidades y una hoja de impresión, todo ordenado en capas. Usan todo lo visto en el curso hasta ahora: el capítulo de HTML, los diez módulos de CSS y las preferencias del usuario, las container queries, las transiciones y las animaciones de los módulos anteriores. Están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS que otra persona puede mantener. Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

> **Lo que ves depende de tu sistema.** Todos siguen el tema del sistema con `color-scheme: light dark`, así que en tu Mac, en modo oscuro, se ven oscuros, y cada uno dice en la página qué tema está activo. Para ver el claro, usa el selector de tema de los que lo tienen (1 y 8), o abre el ejemplo con ↗ y DevTools → **Rendering** → **Emulate CSS media feature prefers-color-scheme** → `light`. Ahí mismo se emulan `prefers-reduced-motion` y el medio `print` (o pulsa <kbd>⌘</kbd> <kbd>P</kbd>). Dos ejemplos tienen además una zona que es oscura en los dos temas: el pie del boletín (7) y la franja nocturna de la agenda (11).

Comparten la arquitectura de este módulo, con siete reglas:

- **El orden, primero.** La primera línea del CSS declara las capas (`@layer reset, tokens, base, layout, components, utilities, print;` o las que use cada página). Todo el CSS está en alguna capa; las librerías ajenas, en `vendor`, y sus arreglos, en `vendor-fixes`, declarada antes. Ningún `!important`, salvo la red de movimiento reducido del reset y los arreglos a una librería.
- **Un reset pequeño.** `box-sizing`, márgenes a cero devolviendo el `margin: auto` de diálogos y popovers, `font: inherit` en los controles, medios de bloque, `text-wrap`, listas sin viñetas solo con `role="list"`, y la red de seguridad de `prefers-reduced-motion` con `0.01ms`.
- **Tres niveles de tokens.** Los componentes no leen primitivos. Los semánticos llevan sus dos valores con `light-dark()`; los derivados (fondos suaves con `color-mix(in oklab, …)`, barras, anillos) se declaran allí donde se redefine su base, o se componen donde se usan.
- **Especificidad baja y pareja.** Componentes en BEM con una clase; bases con etiquetas o `:where()`; reglas con ámbito (`@scope`), que no suman la especificidad de la raíz. Anidamiento a uno o dos niveles: estados, modificadores, contextos y condiciones.
- **Ámbitos donde ayudan.** `@scope` para los componentes que envuelven contenido ajeno (`to (.not-prose)`, `to (.event__description)`) y para los bloques con nombres cortos (el resumen de una compra); el agujero declara lo que no debe heredar.
- **El usuario manda.** Tema del sistema (o elegido), anillo de foco con `:focus-visible` en un token, objetivos cómodos, movimiento solo con `no-preference` y la red del reset como respaldo.
- **El papel, en su capa.** Donde tiene sentido, una capa `print` la última: `color-scheme: light`, letra en puntos, sin navegación ni botones, las direcciones de los enlaces y nada partido entre dos hojas.

## Ajustes de cuenta

**Objetivo:** la página de ajustes de una app de citas para consultorios. **Técnicas:** capas declaradas primero; tokens en tres niveles con un selector de tema (Sistema, Claro, Oscuro) que solo cambia `color-scheme` con `:has()`; campos, botones e interruptores (casillas reales con `role="switch"`) como componentes anidados; desde 48rem, el menú es una columna lateral. **Fíjate en** la zona de peligro: solo redefine `--color-accent`, y su botón, su casilla y su anillo de foco se vuelven rojos. Funciona porque `accent-color` y el color del foco se declaran en cada control, no en `:root`: si se declararan en la raíz, se calcularían allí y llegarían ya resueltos (el token derivado congelado de la lección de tokens).

[[exercise:01-ajustes-de-cuenta.md]]

## Compra de entradas

**Objetivo:** el paso «Entradas» de la compra en un museo. **Técnicas:** los pasos son una lista ordenada con un contador de CSS, `aria-current="step"` para el actual y `content: "✓" / "Hecho:"` para los terminados (el texto tras la barra es el que oye el lector de pantalla); tipos de entrada con campos numéricos; el resumen escrito con `@scope (.summary)`, con nombres cortos (`dl`, `.total`, `.note`) que no salen de él; el formulario es un contenedor y, con 36rem, pone el resumen al lado y pegado. **Fíjate en** las cifras: `font-variant-numeric: tabular-nums` alinea los importes aunque cambien los dígitos. El resumen es estático; calcularlo es trabajo de JavaScript.

[[exercise:02-compra-de-entradas.md]]

## Artículo de revista

**Objetivo:** el sistema de estilos de los artículos de una revista de arte. **Técnicas:** los estilos de texto largo (títulos, listas, citas, figuras) viven en `@scope (.prose) to (.not-prose)`; escala fluida; lista con marcadores de color (`::marker`); una nota destacada; tema con `light-dark()`; capa `print` con las direcciones de los enlaces. **Fíjate en** dos cosas. La nota destacada pisa los estilos del texto con una sola clase, sin `:where()`: las reglas del ámbito pesan lo que una etiqueta. Y el recuadro del boletín, marcado con `.not-prose`, es el agujero: sus títulos y párrafos no reciben nada del texto largo (por eso declara su propio margen).

[[exercise:03-articulo-de-revista.md]]

## Panel de widgets

**Objetivo:** el panel diario de una biblioteca. **Técnicas:** cada widget elige su color con `data-accent`, que solo redefine dos tokens; los derivados (el fondo de la tendencia y el color de las barras) se declaran en `:where(:root, [data-accent])` y se recalculan en cada widget; cada widget es un contenedor; un `<meter>` con `low`, `high` y `optimum`, que el navegador colorea solo; las barras miden `--value` y escriben su cifra. **Fíjate en** las mezclas: `in oklab` da un tinte del color del acento; `in oklch` giraría el tono hacia el del fondo.

[[exercise:04-panel-de-widgets.md]]

## Documentación de una API

**Objetivo:** la guía de primeros pasos de una API de citas. **Técnicas:** avisos de tres tipos que son un solo componente: sus propiedades leen tokens propios (`--callout-bg`, `--callout-text`, `--callout-icon`) y `data-kind` solo elige cuáles; el icono, decorativo, con `content: var(--callout-icon) / ""`; un bloque de código desplazable que se enfoca con <kbd>Tab</kbd> (`tabindex="0"`, `role="region"` y un nombre); código en línea y teclas en la base; índice pegado desde 56rem. **Fíjate en** el título al que lleva cada enlace del índice: `:target` lo colorea y le deja aire por encima.

[[exercise:05-documentacion-de-api.md]]

## Catálogo con una librería ajena

**Objetivo:** las láminas de la tienda de un museo, con una librería de tienda que no es tuya. **Técnicas:** la librería, en `@layer vendor`; se configura redefiniendo sus custom properties (`--vt-accent`, `--vt-radius`, `--vt-star`) desde la tarjeta, en la capa `components`; su `!important` de las ofertas se gana en `vendor-fixes`, declarada antes que `vendor`; los detalles son la misma foto recortada con `object-position`. **Fíjate en** que ninguna regla tuya pesa más que las de la librería: gana por capa, no por especificidad.

[[exercise:06-catalogo-con-libreria.md]]

## Boletín de una cooperativa

**Objetivo:** la versión web del boletín mensual de una cooperativa de café. **Técnicas:** una columna de lectura sin media queries (`width: min(100% - 2rem, 36rem)` y escala fluida); la edición de cosecha como `data-edition`, que redefine dos tokens; textos con `:where()`; capa `print`. **Fíjate en** el pie: es oscuro en los dos temas solo con `color-scheme: dark`. Usa los mismos tokens que el resto de la página, y `light-dark()` elige allí su valor oscuro.

[[exercise:07-boletin-de-cooperativa.md]]

## Guía de estilo

**Objetivo:** la página que documenta el sistema de diseño de la app de citas, pintada con sus propios tokens. **Técnicas:** la paleta de primitivos (cada muestra es `background: var(--swatch)`); las escalas de letra y de espacio; un selector de tema para la página. **Fíjate en** las dos muestras centrales: son los mismos componentes con los mismos tokens, una con `color-scheme: light` y otra con `color-scheme: dark`. No siguen al selector de tema porque declaran su propio esquema: así se revisan los dos temas a la vez.

[[exercise:08-guia-de-estilo.md]]

## Reservas en una fonda

**Objetivo:** el formulario de reservas de un restaurante. **Técnicas:** `font: inherit` en el reset; `color-scheme` y `accent-color` en la base; opciones de radio con aspecto de tarjeta (`:has(:checked)` y el foco en la tarjeta con `:has(:focus-visible)`); fecha y hora en una fila cuando el formulario, un contenedor, mide 30rem. **Fíjate en** los errores: escribe tres cifras en el teléfono y sal del campo. `:user-invalid` solo se cumple después de interactuar, así que al cargar no hay nada en rojo, y el mensaje, enlazado con `aria-describedby`, aparece con `:has()`. Si envías el formulario, la vista previa lo intercepta y escribe en la consola lo que se enviaría.

[[exercise:09-reservas-de-restaurante.md]]

## Centro de ayuda

**Objetivo:** las preguntas frecuentes de un servicio de bicicletas públicas. **Técnicas:** un buscador con su etiqueta oculta con `.visually-hidden`; los temas en una fila `.cluster`; un acordeón exclusivo con `<details name>` cuyo contenido (`::details-content`) se abre hasta `height: auto` gracias al `interpolate-size` del reset, que solo se activa con movimiento permitido; capa `print`. **Fíjate en** la vista de impresión: salen todas las respuestas, también las de las preguntas cerradas, porque la capa `print` pone `content-visibility: visible` en `::details-content`.

[[exercise:10-centro-de-ayuda.md]]

## Agenda cultural

**Objetivo:** la agenda cultural de una ciudad, con una franja especial para la Noche de Museos. **Técnicas:** temas anidados solo con `color-scheme` (la franja es `dark`, el pase de dentro es `light`) y tokens `light-dark()`; la tarjeta de evento escrita con `@scope (.event) to (.event__description)`. **Fíjate en** los enlaces: los de la tarjeta (el título) usan el color del texto con un subrayado del acento, y ganan a la regla `a` de la base por proximidad; los de la descripción, que viene del gestor de contenidos, conservan el estilo de la base. La descripción declara su color y su tamaño, porque el límite no frena la herencia.

[[exercise:11-agenda-cultural.md]]
