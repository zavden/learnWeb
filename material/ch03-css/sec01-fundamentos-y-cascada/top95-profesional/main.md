# Ejemplos profesionales: fundamentos y cascada

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML completo y este módulo de CSS. No usan Flexbox, Grid, posicionamiento ni media queries, que llegan en módulos posteriores; todo el diseño se apoya en el flujo normal, márgenes y anchos sencillos. Es una limitación real, y verás que llega muy lejos cuando la cascada está bien organizada.

Todos comparten la misma arquitectura: **capas** (`@layer`) con un papel cada una, **tokens** en custom properties, estilos base con **`:where()`** (especificidad cero) y componentes de **una sola clase**, sin ids ni `!important`. Los colores están en `oklch()` y su contraste se ha medido: el texto cumple WCAG AA (4,5:1) y los bordes de los controles, 3:1. Lee primero el comentario de cabecera de cada CSS: explica las decisiones de arquitectura.

> Las propiedades de caja (`margin`, `padding`, `border`, `max-width`…) y de texto (`line-height`, `letter-spacing`…) aparecen de forma básica. Se estudian en los módulos del modelo de cajas y de tipografía.

## Hoja de tokens de diseño

**Objetivo:** documentar los valores básicos de un sistema de diseño (colores, espacios, escala tipográfica) en una página que los muestra en uso. **Técnicas:** una capa `tokens` donde se definen todas las custom properties; colores derivados de un `--brand-hue`; escala de espacios en `rem` y pasos tipográficos fluidos con `clamp()`; muestras que reciben su valor por una custom property en el atributo `style` (`style="--chip: var(--color-brand)"`), un uso legítimo del estilo en línea. **Fíjate en** que ninguna regla de componente escribe un color o una medida a mano: todas leen tokens.

[[exercise:01-hoja-de-tokens.md]]

## Reset y capa base

**Objetivo:** el punto de partida de cualquier proyecto: neutralizar lo que estorba de la hoja del navegador y dar a cada elemento de HTML un estilo coherente. **Técnicas:** capas `reset` y `base`; reset comentado declaración a declaración; `font: inherit` en los controles; base escrita entera con `:where()` para que cualquier componente la sobrescriba sin pelear; un único estilo de `:focus-visible` para todo lo enfocable; ritmo vertical con un solo margen inferior. **Fíjate en** que el muestrario no tiene ni una clase y aun así se ve terminado.

[[exercise:02-reset-y-base.md]]

## Sistema tipográfico

**Objetivo:** un artículo largo que se lee con comodidad en cualquier ancho. **Técnicas:** tokens tipográficos (familias, escala de razón 1,25 con `clamp()`, interlineado sin unidad, medida de `65ch`); ritmo vertical en `lh`; letra capital con `::first-letter` sobre `h2:first-of-type + p`; comillas españolas generadas con `::before` y `::after`; marcadores de lista con `::marker`; `::selection` con un color derivado por `color-mix()`. **Fíjate en** cómo cambian los títulos al estrechar la vista previa sin pasar de sus límites.

[[exercise:03-sistema-tipografico.md]]

## Sistema de color

**Objetivo:** una paleta completa a partir de un solo tono, con el contraste documentado. **Técnicas:** escala tonal en `oklch()` con luminosidad fija y croma que se reduce en los extremos; la tabla indica qué color de texto cumple WCAG sobre cada paso y con qué contraste; alertas y botones que reciben un único color (`--tone`) y derivan fondo, texto y estado `:hover` con `color-mix()`; borde con `currentColor`. **Fíjate en** el salto entre `--brand-60` y `--brand-50`: ahí cambia el color de texto que cumple. Prueba a cambiar `--brand-hue`.

[[exercise:04-sistema-de-color.md]]

## Formulario de contacto accesible

**Objetivo:** un formulario de producción con validación nativa y mensajes claros, sin JavaScript. **Técnicas:** `fieldset`/`legend`, etiquetas explícitas, pistas enlazadas con `aria-describedby`; asteriscos de obligatorio generados desde `required` con `.field:has(:required) > label::after` y texto alternativo vacío; `:user-invalid` para marcar errores solo después de tocar el campo; `:has()` para mostrar el mensaje de error y colorear la etiqueta; bordes de los controles con contraste 3:1; `:active` escrito después de `:hover`. **Fíjate en** que el HTML no repite información: el CSS deduce qué es obligatorio. Al enviar, la consola muestra los datos.

[[exercise:05-formulario-de-contacto.md]]

## Artículo de blog

**Objetivo:** una página de artículo completa: cabecera del sitio, metadatos, figura, cita, notas al pie y etiquetas. **Técnicas:** navegación con `aria-current="page"` estilizada mediante un selector de atributo; ilustración SVG accesible (`role="img"` y `aria-label`) que usa `currentColor`; letra capital; notas al pie con enlaces de ida y vuelta resaltados con `:target`; etiquetas con `#` generado. **Fíjate en** la especificidad: un componente por clase, selectores de elemento dentro y ninguna regla por encima de (0,2,2).

[[exercise:06-articulo-de-blog.md]]

## Página de documentación

**Objetivo:** documentación técnica fácil de recorrer y de enlazar. **Técnicas:** secciones numeradas con contadores, en el mismo orden que el índice; `:target` resalta la sección a la que lleva un enlace; anclas por título que se colorean con `:hover` y `:focus-visible`; enlaces externos con flecha accesible (`content: " ↗" / " (sitio externo)"`); avisos con un único componente cuyo tipo (`data-type`) solo cambia `--tone`; código en línea frente a bloques de código con `:where(:not(pre) > code)`. **Fíjate en** el enlace interno del último aviso: lleva a la sección de comandos y la resalta.

[[exercise:07-pagina-de-documentacion.md]]

## Tabla de precios

**Objetivo:** una comparativa de planes clara y accesible. **Técnicas:** una tabla de datos de verdad, con `scope` en filas y columnas; columna destacada con el fondo de `<col>` (y por qué eso descarta las bandas en las filas); valores sí/no en `data-value` con un símbolo decorativo en `::before` que no sustituye al texto; enlaces con aspecto de botón y modificador que solo cambia colores; contenedor con desplazamiento horizontal accesible por teclado (`tabindex="0"`, `role="region"`). **Fíjate en** el comentario de especificidad de la cabecera: cómo se decide qué va en clases, en atributos y en variables.

[[exercise:08-tabla-de-precios.md]]

## Preferencias de tema

**Objetivo:** que cada persona elija tema (claro, oscuro o sepia), color de acento y tamaño de letra, sin JavaScript. **Técnicas:** tres ejes independientes, cada uno con su variable; `:root:has(#… :checked)` en una capa `themes` que solo cambia variables; acento calculado con `oklch()` y `--accent-hue`, de modo que las doce combinaciones de tema y acento mantienen el contraste (mínimo 4,9:1); tamaño de letra como porcentaje en la raíz para respetar la configuración del navegador; `color-scheme` para los controles nativos. **Fíjate en** que los componentes no saben que existen temas: solo leen variables.

[[exercise:09-preferencias-de-tema.md]]

## Biblioteca de componentes

**Objetivo:** el catálogo de componentes de un sistema de diseño: botones, insignias, alertas, tarjeta, acordeón y ventana emergente. **Técnicas:** cinco capas (`reset`, `tokens`, `base`, `components`, `utilities`); cada componente expone variables como interfaz (`--btn-bg`, `--tone`) y sus variantes solo las cambian; tamaños en `em` que escalan con `font-size`; el orden de las reglas de estado (`:hover` de cada variante y `:disabled` al final) resuelve los empates; acordeón exclusivo con `details name`; popover con `::backdrop`; utilidades que ganan por capa, sin `!important`. **Fíjate en** las reglas `:hover` de las variantes: sin ellas, el `:hover` genérico pondría un fondo oscuro bajo el texto azul del botón secundario.

[[exercise:10-biblioteca-de-componentes.md]]

## Preguntas frecuentes

**Objetivo:** una página de ayuda con respuestas plegables, agrupadas y enlazables. **Técnicas:** `details`/`summary`, que aportan el comportamiento y la accesibilidad de teclado; marcador propio con `summary::marker` que combina un contador por categoría y un signo que cambia con `[open]`; el anillo de foco trasladado del `summary` al bloque entero con `:has(> summary:focus-visible)`; categorías resaltadas con `:target` desde el índice. **Fíjate en** que el número de cada pregunta se reinicia en cada categoría gracias a `counter-reset` en el grupo.

[[exercise:11-preguntas-frecuentes.md]]
