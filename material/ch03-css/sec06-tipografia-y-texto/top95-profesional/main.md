# Ejemplos profesionales: tipografía y texto

Estos ejemplos están escritos como en un proyecto real: HTML semántico y accesible, contenido realista y un CSS organizado para que otra persona pueda mantenerlo. Usan todo lo visto hasta ahora en el curso: el capítulo de HTML y los seis primeros módulos de CSS. Siguen sin media queries y sin tipografía fluida: los tamaños de letra son fijos, en `rem`, y todo lo que se adapta al ancho lo hace con `auto-fit`, `minmax()`, `min()` y el `flex-wrap` del módulo de flexbox. Ábrelos con ↗ para verlos en una pestaña: allí, **Computed** → **Rendered Fonts** te dice qué fuente dibuja cada texto.

Comparten la arquitectura de los módulos anteriores: **capas** (`reset`, `tokens`, `base`, `components`), **tokens** en custom properties y componentes de una sola clase. Y añaden siete reglas de este módulo:

- Toda pila termina en una genérica, y la de código lleva otra fuente delante de `monospace`. Las fuentes web se declaran con un `@font-face` por estilo (recta y cursiva), con `font-display: swap`; las de un solo peso, con `font-synthesis: none` donde haga falta.
- `line-height` siempre sin unidad: más holgado en el texto, más apretado en los títulos.
- El texto de lectura no pasa de `65ch`; los títulos llevan `text-wrap: balance` y los párrafos, `pretty`; los guiones automáticos, solo con el `lang` correcto.
- El HTML dice el texto como se lee: las mayúsculas, las versalitas y el espaciado (`letter-spacing` en `em`) los pone el CSS.
- Cifras que se comparan, con `tabular-nums` y alineadas al final; unidades unidas a su cifra con `&nbsp;`; rangos con raya corta (–) y restas con el signo menos (−).
- El contenido que no controlas (correos, URL, códigos, nombres, comentarios) se protege con `overflow-wrap: anywhere`, `<wbr>`, `<bdi>` y `dir="auto"`.
- Propiedades lógicas por defecto: bordes, rellenos, posiciones y esquinas siguen la dirección del texto.

Lee primero el comentario de cabecera de cada CSS: explica las decisiones.

## Reportaje con notas

**Objetivo:** un reportaje de una revista cultural, con notas al pie. **Técnicas:** Literata con su cursiva; renglón de 25,5px fijado en la raíz y todos los márgenes en `rlh`; medida de `65ch`; letra capital con `initial-letter`; siglas en versalitas (`font-variant-caps: all-small-caps`) con su `abbr`; llamadas de nota con `line-height: 0` para que no agranden su línea; notas con enlaces de ida y vuelta y la nota de destino resaltada con `:target`. **Fíjate en** la llamada 1: pulsa en ella, se resalta su nota, y el «↩» te devuelve al texto.

[[exercise:01-reportaje-con-notas.md]]

## Receta

**Objetivo:** la receta del pan de muerto de una panadería, legible en la cocina. **Técnicas:** logotipo en Pacifico con `font-weight: 400` y `font-synthesis: none`; títulos en Literata y texto en la fuente del sistema; datos rápidos en `auto-fit`; cantidades en una columna fija alineada al final, con `tabular-nums diagonal-fractions`; `&nbsp;` entre cada cifra y su unidad; pasos con `::marker` a medida; el truco de la casa con borde y esquinas lógicas. **Fíjate en** «3 1/2» y «1/4»: el texto es una barra inclinada, pero se dibuja como una fracción de verdad, y todas las cantidades terminan en la misma vertical.

[[exercise:02-receta.md]]

## Planes de precios

**Objetivo:** los tres planes de una suscripción de pan a domicilio. **Técnicas:** planes en `auto-fit` que comparten cuatro filas con `subgrid`; importes con `tabular-nums` y la caja recortada con `text-box`; el precio anterior en `<s>`, con la raya de un color más claro; la etiqueta «Más elegido» en mayúsculas escritas con CSS; viñetas `✓` con texto alternativo vacío; botones con `text-box`, para que su padding se mida desde la letra. **Fíjate en** los importes con DevTools: su caja empieza en lo alto de las cifras y termina en la línea base, sin el hueco que deja normalmente la caja de una letra grande.

[[exercise:03-planes-de-precios.md]]

## Panel de cifras

**Objetivo:** el resumen mensual de una cadena de panaderías. **Técnicas:** `tabular-nums` en todo el panel; indicadores con el rótulo en mayúsculas espaciadas, el valor con `text-box` y la variación con su signo escrito (+ o −, el signo menos tipográfico), no solo con el color; lista de los más vendidos con el número del `<ol>` conservado y una fila flex dentro, donde el nombre se recorta con «…» gracias a `min-width: 0`; tabla con las cifras alineadas al final. **Fíjate en** el pan de muerto de la lista: su nombre larguísimo se recorta y la cifra sigue en su sitio.

[[exercise:04-panel-de-cifras.md]]

## Documentación técnica

**Objetivo:** la guía de instalación de una herramienta de línea de comandos. **Técnicas:** una pila monoespaciada de verdad (sin los 13px de `monospace` sola); `font-size-adjust` (Chrome 127) para que el código tenga la misma altura de x que el texto; bloques de código con `tab-size: 2` y scroll horizontal propio; el `$` de la terminal como contenido generado que no se lee ni se copia; identificadores largos con `<wbr>`; `kbd` con aspecto de tecla; un aviso con borde lógico. **Fíjate en** el código dentro de los párrafos: mide `1em`, pero Menlo tiene la x más alta que San Francisco, y `font-size-adjust` la iguala.

[[exercise:05-documentacion-tecnica.md]]

## Portada bilingüe

**Objetivo:** el anuncio de una semana cultural en español y en árabe. **Técnicas:** un solo componente para las dos versiones, sin propiedades físicas; la sección árabe con `lang="ar"` y `dir="rtl"`, su pila de fuentes y más interlineado; el programa en una rejilla de dos columnas compartidas con `subgrid`, que se invierte sola; nombres en el otro alfabeto aislados con `<bdi>`; la flecha del botón cambia con `:dir(rtl)`; y en árabe, ni mayúsculas ni `letter-spacing`. **Fíjate en** las horas del programa: en español van a la izquierda y en árabe, a la derecha, con el mismo CSS.

[[exercise:06-portada-bilingue.md]]

## Haikus en vertical

**Objetivo:** una pequeña antología de Matsuo Bashō. **Técnicas:** cada poema en `writing-mode: vertical-rl`, con los versos separados por `<br>`; su `inline-size` es el alto de las columnas; la línea de la derecha es un `border-block-start` (en vertical, el bloque empieza a la derecha); el sello del autor en vertical con `text-orientation: upright`; una pila de fuentes japonesas con remates y la traducción en horizontal debajo. **Fíjate en** el orden de lectura: el primer verso es la columna de la derecha.

[[exercise:07-haikus-en-vertical.md]]

## Glosario

**Objetivo:** el glosario de una escuela de panadería. **Técnicas:** definiciones justificadas en columnas estrechas con `hyphens: auto` y `hyphenate-limit-chars`; los términos extranjeros con su `lang` (`fr`), que cambia su pronunciación y sus guiones; abreviaturas gramaticales en la cursiva real de Literata, desarrolladas en su `title`; índice de letras; entradas enlazadas entre sí con la de destino resaltada con `:target`. **Fíjate en** las definiciones: sin guiones, la justificación abriría huecos grandes entre palabras; con ellos, el gris del texto es uniforme.

[[exercise:08-glosario.md]]

## Fuentes sin saltos

**Objetivo:** el documento completo de un artículo cuya fuente web no mueve la página al llegar. **Técnicas:** `<link rel="preload">` de la fuente del texto en el `<head>`; `font-display: swap`; una reserva ajustada (Georgia con `size-adjust: 107%`, `ascent-override: 110%` y `descent-override: 28.8%`) colocada justo detrás de Literata en la pila. El propio artículo explica de dónde salen los números. **Fíjate en** la tabla de medidas: Literata es un 7 % más ancha y su `line-height: normal` es un 30 % más alto que el de Georgia; sin ajustar la reserva, cada párrafo crecería al cambiar de fuente.

[[exercise:09-fuentes-sin-saltos.md]]

## Testimonios

**Objetivo:** las opiniones de quienes hicieron un curso de panadería. **Técnicas:** puntuación colgada a mano con un `text-indent` negativo del ancho de la comilla, porque Chrome no tiene `hanging-punctuation`; comillas anidadas automáticas de `<q>` según el idioma; nombres en `<bdi>` y en versalitas con la fuente del sistema, que las trae de verdad; la valoración escrita con texto y las estrellas como decoración. **Fíjate en** el borde izquierdo de cada cita: el «» queda fuera y las primeras letras de todas las líneas caen en la misma vertical.

[[exercise:10-testimonios.md]]

## Ficha de producto

**Objetivo:** la ficha de un electrodoméstico con un nombre y un código de modelo larguísimos. **Técnicas:** migas de pan en una línea, con el último elemento recortado (`min-width: 0` y `text-overflow`); título con `balance` y guiones; código de modelo con `<wbr>` detrás de cada guion y `overflow-wrap: anywhere`; precio con `tabular-nums` y el anterior tachado; especificaciones en columnas compartidas con `subgrid`, con raya corta en los rangos, el signo × en las medidas y `&nbsp;` en todas las unidades. **Fíjate en** el modelo: estrecha la vista previa y se parte siempre detrás de un guion, nunca en mitad de un bloque.

[[exercise:11-ficha-de-producto.md]]

## Portada con escala tipográfica

**Objetivo:** la portada de una escuela de panadería construida con una escala. **Técnicas:** escala modular de razón 1,25 en custom properties (`--step--1` a `--step-5`), cada paso con su interlineado sin unidad y su espaciado entre letras; títulos en Literata con el tamaño óptico automático; el título principal con `text-box`, para que el hueco con el rótulo de encima no crezca con el tamaño de la letra; cifras con `tabular-nums`; botones con `text-box`. **Fíjate en** cómo los siete tamaños bastan para toda la página, y en que cambiar la razón (1,2 o 1,333) cambiaría el carácter de la portada entera tocando solo los tokens.

[[exercise:12-portada-con-escala-tipografica.md]]
