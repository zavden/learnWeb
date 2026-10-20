# Texto

## Por qué importa

Con la fuente elegida, queda decidir cómo se coloca el texto: cuánto aire hay entre líneas, cómo de largas son, cómo se alinean, cuándo van en mayúsculas, cómo se subrayan los enlaces y cómo se alinean las cifras de una tabla. Son decisiones pequeñas que, juntas, separan un texto cómodo de leer de uno que cansa.

Esta lección recorre las propiedades de texto de CSS con un criterio práctico. Empieza por la trampa que te anunciaba la lección de herencia: un `line-height` escrito con unidades se hereda mal. Y termina con tres novedades de los últimos años que resuelven problemas antiguos: los cortes de línea equilibrados, el recorte del interlineado y la letra capital.

## `line-height` sin unidad

En la lección del contexto inline viste qué es `line-height`: la altura de cada caja de línea, con la letra centrada y el sobrante (el interlineado) repartido arriba y abajo. Allí quedó pendiente por qué se recomienda escribirlo **sin unidad**. La respuesta está en la lección de herencia: lo que se hereda es el **valor computado**, no lo que escribiste.

| Escribes | Se calcula en el elemento | Hereda el hijo |
|---|---|---|
| `line-height: 1.5` | 1,5 × su `font-size` | el número `1.5` |
| `line-height: 1.5em` | 1,5 × su `font-size`, en px | esos px |
| `line-height: 150%` | 150 % de su `font-size`, en px | esos px |
| `line-height: 24px` | 24px | 24px |
| `line-height: normal` | lo que diga la fuente (unas 1,2 veces) | `normal` |

Con unidades, el padre convierte el valor en píxeles y los hijos reciben esos píxeles. Una receta con `font-size: 16px` y `line-height: 1.5em` calcula 16 × 1,5 = **24px**. Su título de 32px no recalcula nada: hereda 24px para una letra de 32. El interlineado es negativo y las líneas del título se montan.

[[exercise:01-line-height-con-unidades.md]]

Con un número sin unidad, se hereda el **factor**: cada elemento lo multiplica por su propio tamaño de letra. La receta calcula 16 × 1,5 = 24px, y el título, 32 × 1,5 = 48px. Por eso la regla es sencilla: `line-height` siempre sin unidad, en el `body` para el texto (entre 1,4 y 1,6) y en los títulos con un factor más pequeño (1,1 o 1,2), porque las letras grandes ya tienen mucho aire.

## Medir con el texto: `ch`, `lh` y `rlh`

### La medida

Un texto se lee mal si las líneas son muy largas (el ojo se pierde al volver al principio de la siguiente) o muy cortas (el ritmo se rompe cada pocas palabras). La medida cómoda está entre 45 y 75 caracteres por línea, y en la lección de unidades viste la forma de conseguirla: la unidad `ch`, el ancho del «0» de la fuente.

```css
.article {
  max-inline-size: 65ch;   /* max-width, con el nombre lógico (última lección) */
  margin-inline: auto;
}
```

Como la mayoría de las letras son más estrechas que el «0», en 65ch caben más de 65 caracteres: unos 80 con Literata y hasta 90 con Georgia o con San Francisco, porque su «0» mide bastante más que la letra media de un texto (en Georgia, 0,61 em frente a 0,44 em). Si quieres afinar, baja a 55-60ch. Ponlo en el contenedor del texto, no en la página: las tablas y las imágenes pueden ser más anchas. Y si el tamaño de letra también debe crecer con la pantalla (la tipografía fluida, con `clamp()` y `vw`), lo verás en el módulo de diseño responsive.

### El ritmo vertical

`lh` mide el `line-height` del propio elemento, y `rlh`, el del elemento raíz (`<html>`). Con ellas puedes medir los espacios **en renglones**: un margen de `1rlh` entre párrafos es exactamente un renglón en blanco, y si los títulos también ocupan renglones enteros, todo el texto cae sobre la misma pauta, como en un cuaderno. Es el **ritmo vertical** de los libros bien compuestos.

[[exercise:02-ritmo-con-lh-y-rlh.md]]

`lh` funciona en Chrome desde la versión 109, y `rlh`, desde la 111. Para que `rlh` sirva de algo, la raíz necesita un `line-height`: `:root { line-height: 1.5 }`. Hay una unidad más de esta familia, `cap`, la altura de las mayúsculas (Chrome 118): un icono de `inline-size: 1cap` mide lo mismo que una H del texto que tiene al lado.

## Alineación y sangría

`text-align` se escribe en el **bloque** y alinea cada una de sus cajas de línea, como viste en la lección del contexto inline:

| Valor | Alinea las líneas… |
|---|---|
| `start` (inicial) | al lado donde empieza el texto: la izquierda en español, la derecha en árabe |
| `end` | al lado donde termina |
| `left`, `right` | a la izquierda o a la derecha, sea cual sea el idioma |
| `center` | al centro: para títulos cortos, nunca para párrafos |
| `justify` | a los dos bordes, estirando los espacios (salvo la última línea) |

Prefiere `start` y `end` a `left` y `right`: dicen lo que quieres decir (el principio y el final de la línea) y funcionan igual en un idioma que se escribe de derecha a izquierda. `text-align-last` decide cómo se alinea la última línea de un texto justificado.

`text-indent` sangra la **primera línea** de un bloque. Los libros no separan los párrafos con un espacio, sino con una sangría a partir del segundo (`p + p`); la web suele hacer lo contrario. Y con un valor negativo, más un `padding` del mismo tamaño, se consigue la sangría francesa de las bibliografías.

[[exercise:03-alineacion-y-sangria.md]]

Cuidado con `justify` en columnas estrechas: para llegar a los dos bordes, el navegador abre huecos enormes entre palabras, que se alinean de una línea a otra formando «ríos» blancos. Los libros lo evitan partiendo palabras con guiones; en la web también se puede, y lo verás en la próxima lección. Las pautas de accesibilidad recomiendan no justificar el texto largo: los huecos irregulares dificultan la lectura a muchas personas con dislexia.

## Cortes de línea mejores: `text-wrap`

El navegador corta las líneas de forma **voraz**: mete en cada línea todas las palabras que caben y pasa a la siguiente. Es rápido, pero no mira el conjunto. Dos valores de `text-wrap` le piden que lo mire:

- `text-wrap: balance` busca el ancho más estrecho que mantiene el mismo número de líneas, para que todas midan parecido. Es caro de calcular, así que Chrome solo lo aplica a bloques de 6 líneas o menos: para títulos, pies de foto y citas (Chrome 114).
- `text-wrap: pretty` revisa el final de los párrafos para que la última línea no quede con una palabra sola, una **huérfana** (Chrome 117). Es más lento que el corte normal, pero sirve para cualquier texto.

[[exercise:04-text-wrap-balance-y-pretty.md]]

Las dos son mejoras progresivas: un navegador que no las entiende corta como siempre y no se rompe nada. Si ves `text-wrap: nowrap`, es otra cara de la misma propiedad: `text-wrap` es un atajo que agrupa `text-wrap-mode` (si se corta o no la línea) y `text-wrap-style` (cómo), y en la próxima lección lo verás junto a `white-space`.

## Mayúsculas y espaciado

### `text-transform`

`text-transform: uppercase` muestra el texto en mayúsculas, `lowercase` en minúsculas y `capitalize` pone en mayúscula la primera letra de cada palabra. Lo importante es lo que **no** hace: no cambia el texto. El DOM sigue teniendo «Envío rápido», y eso es lo que ven el buscador de la página, el traductor y JavaScript.

[[exercise:05-mayusculas-con-css.md]]

Tres consecuencias:

- Escribe el texto en el HTML como debe leerse y usa `text-transform` solo para el estilo. Un titular en mayúsculas escrito así en el HTML no tiene vuelta atrás si el diseño cambia, y algunos lectores de pantalla deletrean las palabras cortas en mayúsculas como si fueran siglas.
- `capitalize` es una norma del inglés. En español, los títulos llevan mayúscula solo en la primera palabra y en los nombres propios.
- La transformación sigue las reglas del idioma (`lang`): en turco, `uppercase` convierte la «i» en «İ». Las tildes se conservan en mayúscula, como pide la ortografía.

Tampoco cambia lo que se copia: si seleccionas «ENVÍO RÁPIDO» y lo pegas en otro sitio, llega «Envío rápido», el texto del HTML (Chrome y Firefox coinciden, como pide la especificación). Otra razón para escribir bien el texto de origen: es el que se llevan quienes copian, traducen o leen la página con un lector de pantalla.

### `letter-spacing` y `word-spacing`

`letter-spacing` añade (o quita, con valores negativos) espacio después de cada letra, y `word-spacing`, en cada espacio entre palabras. Escríbelos en `em`, para que se ajusten si cambia el tamaño.

[[exercise:06-letter-spacing.md]]

Tres usos razonables: un poco de aire (0,05-0,1em) en etiquetas cortas en mayúsculas; un poco menos (-0,01 a -0,03em) en títulos muy grandes; y nada en el texto corrido. Y una regla de accesibilidad (WCAG 1.4.12): hay personas que fuerzan con una extensión del navegador un espaciado mayor (letras a 0,12em, palabras a 0,16em, interlineado a 1,5). Tu diseño debe aguantarlo sin cortar texto: evita las cajas de texto con alto fijo.

## Subrayados a medida

El subrayado es la forma más clara de decir «esto es un enlace» dentro de un párrafo, y hoy se puede ajustar sin trucos. `text-decoration` es un atajo de cuatro propiedades: la línea (`underline`, `overline`, `line-through`), el estilo (`solid`, `dotted`, `dashed`, `wavy`, `double`), el color y el grosor; aparte van la distancia y el comportamiento con los rabos de las letras.

| Propiedad | Para qué |
|---|---|
| `text-decoration-thickness` | el grosor de la línea (en em, crece con la letra) |
| `text-underline-offset` | la distancia del subrayado a la línea base |
| `text-decoration-color` | un color distinto del texto |
| `text-decoration-skip-ink` | `auto` (inicial): la línea se interrumpe donde bajan la g, la j o la p |
| `text-underline-position: under` | el subrayado por debajo de los rabos, para fórmulas químicas o texto con muchos |

[[exercise:07-subrayados-modernos.md]]

No quites el subrayado a los enlaces que van dentro del texto: si solo se distinguen por el color, quien no distinga bien los colores no los encuentra. En los menús y los botones, donde la forma ya dice que son enlaces, sí se puede.

## Las cifras: `font-variant-numeric`

Las fuentes guardan más de un dibujo para muchos caracteres, y las propiedades `font-variant-*` eligen cuál usar. La más útil es `font-variant-numeric`: muchas fuentes de texto tienen cifras **proporcionales** (el 1 más estrecho que el 0), que quedan bien en una frase pero no forman columnas. Con `tabular-nums` todas miden lo mismo.

[[exercise:08-cifras-tabulares.md]]

Otros valores: `oldstyle-nums` (cifras que suben y bajan como las minúsculas, las de Georgia), `lining-nums` (todas de la altura de las mayúsculas), `diagonal-fractions` y `slashed-zero`. Solo funcionan si la fuente trae esas variantes; si no, no pasa nada. Para las características que no tienen propiedad propia existe `font-feature-settings: "ss01" 1`, la versión de bajo nivel, con las mismas trampas que `font-variation-settings` en la lección anterior.

## Recortar el interlineado: `text-box`

En la lección del contexto inline viste que el interlineado se reparte por la mitad arriba y abajo de la letra, y que la fuente reserva además sitio para las tildes y los rabos. El resultado es que la caja de un texto nunca empieza donde empiezan las letras: encima de las mayúsculas y debajo de la línea base siempre queda un hueco, distinto en cada fuente. Durante años se compensó con márgenes negativos a ojo.

`text-box` recorta ese hueco: `text-box-trim` dice qué lados (`trim-start`, `trim-end`, `trim-both`) y `text-box-edge` hasta dónde (`cap`, la altura de las mayúsculas, o `ex`, la de las minúsculas, arriba; `alphabetic`, la línea base, abajo). Llegó en Chrome 133 (2025).

[[exercise:09-text-box.md]]

Úsalo en botones, etiquetas y tarjetas, donde quieres que el padding se mida desde la letra. Lo que sobresale del recorte (tildes, rabos) se sigue pintando, así que no lo combines con un padding cero.

## Letra capital: `initial-letter`

La lección de pseudoelementos usaba `::first-letter` para agrandar la primera letra de un párrafo. Para una letra capital de verdad, la que se hunde varias líneas como en los libros antiguos, el método clásico era un `float` con un tamaño a ojo, que nunca encajaba. `initial-letter: 3` (Chrome 110) calcula el tamaño exacto para que la letra vaya de la altura de las mayúsculas de la primera línea a la línea base de la tercera.

[[exercise:10-letra-capital.md]]

## Cómo verlo en DevTools

- **El interlineado heredado.** Selecciona el elemento en **Elements** y busca `line-height` en **Computed**: verás los píxeles calculados. Con la casilla *Show all* y el triángulo de la propiedad, DevTools dice de qué regla viene; si es heredada, aparece el antepasado.
- **Las cajas de línea.** Al pasar el ratón por un párrafo en **Elements**, la página resalta su caja; compárala con las letras para ver el interlineado, y con `text-box` activado, el recorte.
- **El texto real.** En **Elements** se ve el texto tal como está en el HTML, sin `text-transform`: «Envío rápido», no «ENVÍO RÁPIDO».

## Bestiario

- **Las líneas de un título se montan.** Síntoma: un título dentro de un artículo tiene las líneas apretadas o superpuestas. Causa: el artículo tiene `line-height` con unidades (`1.5em`, `150%`), que se calcula en px y se hereda así, sin recalcular para la letra grande. Solución: `line-height` sin unidad (`1.5`). → [ver ejemplo](01-line-height-con-unidades.md)
- **Los titulares salen «Con Mayúscula En Cada Palabra».** Síntoma: el texto, escrito bien en el HTML o en minúsculas, aparece con cada palabra en mayúscula. Causa: `text-transform: capitalize`, que sigue la norma del inglés. Solución: escribe el texto como debe leerse y quita la transformación; es también el texto que se copia y se pega. → [ver ejemplo](05-mayusculas-con-css.md)

## Resumen

- `line-height` siempre sin unidad: se hereda el factor y cada elemento lo multiplica por su tamaño; con `em` o `%` se heredan los píxeles del padre.
- La medida cómoda es de 45 a 75 caracteres: `max-inline-size: 65ch`. `lh` y `rlh` miden en renglones y dan ritmo vertical.
- `text-align: start` y `end` siguen la dirección del texto; `justify` en columnas estrechas necesita guiones; `text-indent` sangra la primera línea.
- `text-wrap: balance` para títulos y `pretty` para párrafos: mejoras que no rompen nada donde no existen.
- `text-transform` solo cambia lo que se ve; `capitalize` no sirve para el español, y la transformación depende de `lang`. `letter-spacing` en `em`, con mesura.
- Los enlaces del texto, subrayados: grosor, distancia y color se ajustan con `text-decoration-*`.
- `font-variant-numeric: tabular-nums` alinea las cifras; `text-box` recorta el hueco de la caja de texto; `initial-letter` hace letras capitales exactas.

## Para profundizar

- [MDN: line-height](https://developer.mozilla.org/es/docs/Web/CSS/line-height)
- [web.dev: Typography (Learn CSS)](https://web.dev/learn/css/typography)
- [Chrome for Developers: CSS text-wrap: pretty](https://developer.chrome.com/blog/css-text-wrap-pretty)
- [Chrome for Developers: CSS text-box-trim](https://developer.chrome.com/blog/css-text-box-trim)
- [W3C: Understanding WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
