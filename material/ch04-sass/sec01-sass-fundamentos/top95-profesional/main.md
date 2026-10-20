# Ejemplos profesionales: Sass

Estos ejemplos son piezas de un sistema de diseño escritas como en un proyecto real: SCSS organizado y comentado, HTML semántico y accesible, contenido realista y, sobre todo, **un CSS generado ajustado**. Usan todo lo visto hasta ahora en el curso: los capítulos de HTML y CSS y este módulo de Sass. Cada uno es un solo bloque de SCSS porque LearnWeb no carga otros archivos; el comentario de cabecera dice cómo se repartiría en parciales (`_tokens.scss`, `_mixins.scss`…) en un proyecto de verdad.

En todos ellos, la pestaña `compiled.css` es parte de la lección. Léela junto al SCSS y fíjate en tres decisiones que se repiten:

- **La configuración arriba, con `!default`**: mapas de colores, tamaños, breakpoints o variantes que cualquiera puede cambiar al cargar el módulo con `@use … with (…)`.
- **Sass calcula, el navegador cambia**: los valores derivados (tonos, escalas, contrastes) se calculan al compilar, pero todo lo que depende de un tema o de un estado llega al navegador como custom property.
- **Lo común, una vez**: las declaraciones de un componente se escriben en una sola regla, y cada variante solo cambia datos. Los colores calculados se redondean para que el CSS sea legible.

Lee primero el comentario de cabecera de cada SCSS: explica las decisiones.

## Tokens y temas

**Objetivo:** la base de un sistema de diseño: una paleta, los tokens semánticos de los temas claro y oscuro y las escalas de espacio y radios. **Técnicas:** dos niveles de tokens (la paleta con nombres de color; los temas con nombres de función que eligen colores de la paleta); un mixin que comprueba con `@error` que los dos temas definen los mismos tokens y escribe cada uno una sola vez con `light-dark()`; `color-scheme` para seguir al sistema o forzar un tema con `:has()` sobre radios reales. **Fíjate en** el CSS: el tema oscuro no aparece duplicado en una `@media` y en un `:has()`; cambiar de tema es cambiar una sola propiedad, `color-scheme`. Y en las comillas de `"white"`: sin ellas, Sass lo trataría como un color y no como un nombre.

[[exercise:01-tokens-y-temas.md]]

[[exercise:01-tokens-y-temas.md-(styles.scss|compiled.css)]]

## Librería de botones

**Objetivo:** un componente de botón completo y configurable. **Técnicas:** tres ejes independientes (intención, apariencia y tamaño), cada uno con sus modificadores, que solo fijan custom properties; colores de hover, activo, anillo, contorno y fondo suave derivados con `sass:color` y redondeados; texto elegido por luminosidad; estado de carga con `aria-busy` que mantiene el texto para los lectores de pantalla; grupo de botones con bordes solapados y `aria-pressed`. **Fíjate en** que 36 combinaciones salen de siete modificadores pequeños, y en que los valores por defecto (neutral, sólido, mediano) están en la propia `.button`: un botón sin modificadores ya está completo.

[[exercise:02-libreria-de-botones.md]]

[[exercise:02-libreria-de-botones.md-(styles.scss|compiled.css)]]

## Insignias, alertas y avisos

**Objetivo:** todos los componentes de estado de una aplicación con un solo sistema de tonos. **Técnicas:** un mapa de tonos que genera reglas `[data-tone="…"]` con cinco custom properties, compartidas por insignias, alertas, banner y avisos emergentes; una función `contrast()` que implementa la fórmula de WCAG con `sass:math`; un `@warn` que avisa si algún tono no llega a 4,5:1. **Fíjate en** `sass-output.txt`: está vacío porque todos los tonos cumplen. Cambia `info` a `#38bdf8` en el editor y aparecerá el aviso, con la pila de llamadas que dice qué mixin lo lanzó.

[[exercise:03-insignias-alertas-y-avisos.md]]

[[exercise:03-insignias-alertas-y-avisos.md-(styles.scss|compiled.css)]]

## Sistema de layout

**Objetivo:** las piezas de maquetación de un sitio, independientes del contenido. **Técnicas:** primitivas (`.container`, `.stack`, `.cluster`, `.with-sidebar`, `.auto-grid`) que se adaptan sin media queries gracias a `flex-wrap` y `auto-fit`; una rejilla de 12 columnas con clases `.span-N` generadas con `@for` solo para los breakpoints que se piden; mixins `up`, `down` y `between` validados con `@error`. **Fíjate en** la barra lateral de filtros: se coloca encima del contenido cuando no cabe, sin ninguna media query. Las media queries quedan para lo que de verdad depende de la pantalla.

[[exercise:04-sistema-de-layout.md]]

[[exercise:04-sistema-de-layout.md-(styles.scss|compiled.css)]]

## Escala tipográfica

**Objetivo:** un sistema tipográfico completo para textos largos. **Técnicas:** escala modular fluida (`math.pow` con un ratio en móvil y otro en pantallas anchas, `clamp()` redondeado a tres decimales); pasos publicados como custom properties; títulos asignados a pasos con un mapa y `@each`; ritmo vertical con `--flow-space`; pilas de fuentes con `meta.inspect` para conservar las comillas de `"Segoe UI"`. **Fíjate en** las custom properties de las fuentes en el CSS: con `#{…}` a secas, las comillas desaparecerían.

[[exercise:05-escala-tipografica.md]]

[[exercise:05-escala-tipografica.md-(styles.scss|compiled.css)]]

## Controles de formulario

**Objetivo:** la piel de un formulario real de envío. **Técnicas:** un mixin de anillo de foco común a todos los controles; campos, `select` y `textarea` en una regla compartida; la flecha del `select` como SVG en una data URI que construye una función con `sass:string`; `@at-root` para no subir la especificidad; errores con `:user-invalid` y su mensaje mostrado con `:has()`; casillas nativas con `accent-color` y un interruptor accesible con `role="switch"`. **Fíjate en** el contraste de los bordes (4,8:1: los bordes de un control necesitan al menos 3:1) y en que el error no depende solo del color: aparece un texto. Escribe un correo sin @ y sal del campo.

[[exercise:06-controles-de-formulario.md]]

[[exercise:06-controles-de-formulario.md-(styles.scss|compiled.css)]]

## Familia de tarjetas

**Objetivo:** varios tipos de tarjeta con un mismo bloque BEM. **Técnicas:** elementos y modificadores con `&__` y `&--`; una variante por categoría generada desde un mapa que solo fija `--card-accent`; cada tarjeta es un contenedor y se pone en horizontal con una container query anidada; enlace «estirado» con el anillo de foco en la tarjeta; un bloque `.media` reutilizable para el autor. **Fíjate en** `.card__layout`: una container query no puede cambiar al propio contenedor, así que la dirección del flex la lleva un hijo. Cambia el ancho de la vista previa (↗) y mira cómo cada tarjeta decide por su cuenta.

[[exercise:07-familia-de-tarjetas.md]]

[[exercise:07-familia-de-tarjetas.md-(styles.scss|compiled.css)]]

## Utilidades configurables

**Objetivo:** una librería de clases de utilidad como las de los frameworks, en pequeño. **Técnicas:** un mapa describe cada utilidad (propiedad, nombre, valores en lista o mapa, si es responsive) y un mixin con `meta.type-of` genera las clases; opciones con `!default`, un prefijo `u-` para no chocar con los componentes, una lista de utilidades activas y todo en `@layer utilities`; un contador con `!global` que `@debug` muestra al final. **Fíjate en** `sass-output.txt` (64 clases) y en cómo solo las utilidades marcadas como responsive se repiten dentro de la media query: es el control principal del tamaño.

[[exercise:08-utilidades-configurables.md]]

[[exercise:08-utilidades-configurables.md-(styles.scss|sass-output.txt|compiled.css)]]

## Generador de paleta

**Objetivo:** una página de documentación de la paleta para el equipo de diseño. **Técnicas:** nueve tonos por color de marca mezclados con `color.mix` según una receta en un mapa; tonos publicados como custom properties; contraste WCAG calculado al compilar y escrito en cada muestra con su nivel (AAA, AA, AA grande); texto blanco o tinta elegido por contraste. **Fíjate en** dos cosas: las claves del mapa van entre comillas (`"green"`), porque sin ellas Sass avisa de que está interpolando un color; y en `sass-output.txt`, donde un `@warn` señala que `amber-600` solo sirve para texto grande. Es exactamente la información que el equipo necesita.

[[exercise:09-generador-de-paleta.md]]

[[exercise:09-generador-de-paleta.md-(styles.scss|sass-output.txt|compiled.css)]]

## Tabla de datos

**Objetivo:** una tabla de pedidos legible en cualquier pantalla. **Técnicas:** contenedor desplazable con nombre accesible y foco de teclado; cabecera fija con `position: sticky` dentro del contenedor; bandas y hover; columnas numéricas con `tabular-nums` alineadas a la derecha; estados generados desde un mapa con un punto de color además del texto; dos densidades que solo cambian dos custom properties. **Fíjate en** el `min-width` de la tabla: por debajo de 40rem, la página no la aprieta, la desplaza dentro de su contenedor.

[[exercise:10-tabla-de-datos.md]]

[[exercise:10-tabla-de-datos.md-(styles.scss|compiled.css)]]

## Barra de navegación

**Objetivo:** la navegación principal de un sitio, de móvil a escritorio. **Técnicas:** rejilla con áreas que cambia de dos filas a una; en móvil, una fila de enlaces desplazable con `scroll-snap`; submenú con `details`/`summary`, en el flujo en móvil y flotante en escritorio; estados anidados con mixins (`interactive`, `focus-ring`); página actual con `aria-current`; enlace para saltar al contenido. **Fíjate en** el submenú en una ventana estrecha: dentro de una fila con `overflow`, un elemento absoluto quedaría recortado, por eso solo flota desde el breakpoint `md`.

[[exercise:11-barra-de-navegacion.md]]

[[exercise:11-barra-de-navegacion.md-(styles.scss|compiled.css)]]

## Tokens de movimiento

**Objetivo:** que todas las animaciones de un producto compartan duraciones y curvas, y respeten la preferencia de movimiento reducido. **Técnicas:** duraciones y curvas en mapas publicadas como custom properties; funciones `duration()` y `ease()` que validan el nombre; `@keyframes` generados desde un mapa de mapas; con `prefers-reduced-motion: reduce`, todas las duraciones pasan a `1ms` desde un solo sitio y la animación infinita del esqueleto se detiene. **Fíjate en** los `@keyframes` del CSS generado: tres niveles de `@each` (animación, paso, propiedad) producen CSS idéntico al escrito a mano.

[[exercise:12-tokens-de-movimiento.md]]

[[exercise:12-tokens-de-movimiento.md-(styles.scss|compiled.css)]]

## Hoja de impresión

**Objetivo:** una receta que se imprime bien. **Técnicas:** un mixin `print()` con `@content` que deja los estilos de papel junto a los de pantalla de cada componente; `.screen-only` para botones y navegación; la URL de cada enlace escrita detrás en papel (completando las rutas relativas con `$site-url`); `break-inside` y `break-after` para controlar los saltos de página; `@page` para los márgenes; ingredientes en dos columnas. **Fíjate en** cómo verlo: abre la vista previa en una pestaña (↗) y usa ⌘P, o emula el medio `print` en DevTools (**Rendering → Emulate CSS media type**). En el CSS generado, cada componente tiene su propio bloque `@media print`.

[[exercise:13-hoja-de-impresion.md]]

[[exercise:13-hoja-de-impresion.md-(styles.scss|compiled.css)]]
