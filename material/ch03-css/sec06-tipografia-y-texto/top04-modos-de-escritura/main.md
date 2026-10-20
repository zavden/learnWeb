# Modos de escritura

## Por qué importa

Desde el módulo del modelo de cajas has escrito `margin-inline: auto`, `padding-block` o `inline-size` con una promesa pendiente: por qué se llaman así. Y los módulos de flexbox y grid repetían que una fila no va «hacia la derecha» sino «en el sentido del texto». Esta lección cumple las dos promesas, porque tienen la misma respuesta: CSS no piensa en izquierda, derecha, arriba y abajo, sino en la **dirección en que se escribe**.

El español se escribe en líneas horizontales de izquierda a derecha, y las líneas se apilan de arriba abajo. El árabe y el hebreo, de derecha a izquierda. El japonés y el chino tradicionales, en columnas que bajan y se colocan de derecha a izquierda. Una página bien hecha con propiedades lógicas sirve para todos ellos sin cambiar una línea de CSS, y entender los ejes te explica de paso misterios antiguos, como por qué `margin: auto` no centra en vertical.

## Dos ejes: inline y bloque

Todo el layout del flujo normal se organiza en dos ejes:

- El eje **inline** es el de una línea de texto: hacia donde avanzan las letras. En español, de izquierda a derecha.
- El eje de **bloque** es hacia donde se apilan las líneas y los bloques (párrafos, títulos, `div`). En español, de arriba abajo.

`writing-mode` decide cómo se colocan esos ejes en la pantalla:

| Valor | Eje inline | Eje de bloque | Se usa en |
|---|---|---|---|
| `horizontal-tb` (inicial) | horizontal | de arriba abajo | casi todos los idiomas |
| `vertical-rl` | de arriba abajo | de derecha a izquierda | japonés, chino y coreano tradicionales |
| `vertical-lr` | de arriba abajo | de izquierda a derecha | mongol tradicional |
| `sideways-rl`, `sideways-lr` | vertical, con la línea girada | | rótulos (Chrome 132) |

```text
horizontal-tb (español)           vertical-rl (japonés)

 inline ───────────▶              ◀───────── bloque
┌──────────────────┐ │            ┌────┬────┬────┐ │
│ línea 1 ........ │ │            │ 3  │ 2  │ 1  │ │
│ línea 2 ........ │ │ bloque     │ ↓  │ ↓  │ ↓  │ │ inline
│ línea 3 ...      │ ▼            │    │    │    │ ▼
└──────────────────┘              └────┴────┴────┘
                                  1, 2, 3: líneas (columnas)
```

Y dentro del eje inline, el atributo `dir` decide el sentido: `ltr` (de izquierda a derecha) o `rtl` (de derecha a izquierda).

[[exercise:01-ejes-inline-y-bloque.md]]

Fíjate en las medidas del ejemplo: las tres cajas tienen `inline-size: 150px` y `block-size: 110px`, y la horizontal sale apaisada mientras las verticales salen alargadas. `inline-size` es el tamaño en el eje inline y `block-size`, en el de bloque: en horizontal son el ancho y el alto; en vertical, el alto y el ancho.

Dos detalles de las cajas verticales:

- Cada elemento resuelve sus propiedades lógicas con **su propio** `writing-mode`, no con el de su padre. En la caja con `vertical-rl`, `inline-size` es el alto, aunque esté dentro de una página horizontal.
- Una caja vertical dentro de una página horizontal necesita un tamaño en su eje inline (su alto). El alto de su padre casi nunca está definido, y sin él el navegador toma como límite el alto de la ventana: la columna de texto puede salir altísima.

## Propiedades lógicas

Cada propiedad física (`left`, `top`, `width`…) tiene su versión **lógica**, que se nombra por los ejes. Cada eje tiene un **principio** (`start`) y un **final** (`end`):

| Física (en español) | Lógica | Qué es |
|---|---|---|
| `width` / `height` | `inline-size` / `block-size` | el tamaño en cada eje |
| `max-width` | `max-inline-size` | la medida de un texto: `max-inline-size: 65ch` |
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` | donde empieza / acaba la línea |
| `margin-top` / `margin-bottom` | `margin-block-start` / `margin-block-end` | antes / después del bloque |
| `margin-left` + `margin-right` | `margin-inline` | los dos lados del eje inline |
| `padding-top` + `padding-bottom` | `padding-block` | los dos lados del eje de bloque |
| `border-left` | `border-inline-start` | el borde donde empieza la línea |
| `top`, `right`, `bottom`, `left` | `inset-block-start`, `inset-inline-end`, `inset-block-end`, `inset-inline-start` | desplazamientos de `position` |
| `text-align: left` | `text-align: start` | alinear al principio de la línea |
| `float: left` | `float: inline-start` | flotar al principio de la línea |

En un texto en español con `horizontal-tb`, cada propiedad lógica hace exactamente lo mismo que su equivalente física. La diferencia aparece cuando cambia la dirección: las físicas se quedan pegadas a la pantalla y las lógicas giran con el texto.

[[exercise:02-propiedades-fisicas-no-giran.md]]

> **Desde Python:** el navegador resuelve cada propiedad lógica a un lado de la pantalla con una tabla como esta. La función reproduce las reglas para los tres modos más comunes.

```python
def physical_side(logical, writing_mode="horizontal-tb", direction="ltr"):
    """A qué lado de la pantalla va a parar 'inline-start', 'block-end'…"""
    if writing_mode == "horizontal-tb":
        inline, block = ("left", "right"), ("top", "bottom")
    elif writing_mode == "vertical-rl":
        inline, block = ("top", "bottom"), ("right", "left")
    else:                                   # vertical-lr
        inline, block = ("top", "bottom"), ("left", "right")
    if direction == "rtl":
        inline = inline[::-1]               # rtl invierte solo el eje inline
    axis, edge = logical.split("-")
    start, end = inline if axis == "inline" else block
    return start if edge == "start" else end

for mode, direction in [("horizontal-tb", "ltr"), ("horizontal-tb", "rtl"), ("vertical-rl", "ltr")]:
    print(f"{mode} {direction}: inline-start → {physical_side('inline-start', mode, direction)},"
          f" block-start → {physical_side('block-start', mode, direction)}")
```

```text
horizontal-tb ltr: inline-start → left, block-start → top
horizontal-tb rtl: inline-start → right, block-start → top
vertical-rl ltr: inline-start → top, block-start → right
```

¿Significa esto que hay que olvidar las físicas? No: elige según de qué depende lo que haces. La barra de una cita, la sangría de una lista, la separación entre párrafos o el icono que va delante de un texto dependen del **texto**: lógicas. Una sombra que imita una luz que viene de arriba a la izquierda, o una barra fija al borde inferior de la pantalla del móvil, dependen de la **pantalla**: físicas. Cada vez es más común usar lógicas por defecto, aunque el sitio solo exista en español: no cuestan nada y el día que haya una versión en árabe el CSS ya está listo.

### `margin: auto` y el eje inline

En la lección de márgenes viste que `margin-inline: auto` centra una caja a lo ancho, pero `margin-block: auto` no la centra a lo alto. No es una cuestión de horizontal o vertical, sino de ejes. En el flujo normal, una caja de bloque ocupa todo el eje **inline** de su padre (hay un espacio que repartir, y `auto` se queda con lo que sobra), pero en el eje de **bloque** mide lo que su contenido, y ahí los márgenes `auto` valen 0. Pon el mismo hijo en una caja vertical y lo verás centrarse a lo alto:

[[exercise:03-margin-inline-auto.md]]

En flexbox y grid, en cambio, los márgenes `auto` funcionan en los dos ejes: por eso ahí sí centran en vertical.

## Flexbox y grid giran con el texto

Los ejes de flexbox y de grid son los del modo de escritura. Una fila flex (`flex-direction: row`) va en el eje **inline**: de izquierda a derecha en español, de derecha a izquierda en árabe y de arriba abajo en japonés vertical. Las columnas de grid también están en el eje inline, y las filas, en el de bloque. Por eso flexbox habla de `flex-start` y `flex-end`, grid de `start` y `end`, y las propiedades se dividen en `justify-*` (eje inline en grid) y `align-*` (eje de bloque): son nombres de ejes, no de direcciones de la pantalla.

[[exercise:04-flex-y-grid-giran-con-el-texto.md]]

Esto tiene una consecuencia práctica: un layout hecho con flexbox, grid y propiedades lógicas se invierte solo en una página en árabe o en hebreo. El menú empieza a la derecha, la barra lateral cambia de lado y las flechas de «siguiente» apuntan hacia donde avanza la lectura (eso último, si los iconos también lo tienen en cuenta, por ejemplo con `:dir(rtl)`).

## Derecha a izquierda: `dir` y el texto bidireccional

La dirección del texto se escribe en el **HTML**, con el atributo `dir`: `<html lang="ar" dir="rtl">` para una página en árabe, o en el elemento que contiene un fragmento en otro idioma. Existe la propiedad CSS `direction: rtl`, pero la especificación pide a los autores que no la usen: la dirección es parte del contenido (como el idioma), y debe estar ahí aunque el CSS no llegue a cargarse, para el lector de pantalla, para el campo de un formulario o para un buscador. En CSS se pregunta por ella con la pseudoclase `:dir(rtl)` (Chrome 120).

Dentro de una misma línea se pueden mezclar las dos direcciones: un nombre en hebreo dentro de una frase en español, o una palabra inglesa dentro de un texto en árabe. El navegador las ordena con el **algoritmo bidireccional** de Unicode, que funciona bien con palabras, pero hace cosas raras con los números y los signos de puntuación que quedan entre las dos direcciones: los «arrastra» hacia el lado del texto que tienen al lado.

[[exercise:05-texto-bidireccional.md]]

Tres herramientas, de más a menos frecuente:

- `<bdi>` alrededor de cualquier texto cuya dirección no conoces: nombres de usuario, títulos que escriben otros, resultados de una búsqueda. Ya lo viste en la lección de elementos de texto del capítulo de HTML.
- `dir="auto"` en los campos y en los bloques de texto escrito por usuarios: el navegador mira la primera letra con dirección y se orienta según ella.
- En CSS, `unicode-bidi: isolate` hace lo mismo que `<bdi>` con cualquier elemento.

### Una página en árabe o en hebreo

Si algún día traduces un sitio a un idioma que se escribe de derecha a izquierda, esto es lo que hace falta:

- `<html lang="ar" dir="rtl">` (o `he`). Todo lo demás se hereda.
- Propiedades lógicas para todo lo que depende del texto, y flexbox y grid para el layout: se invierten solos.
- Los iconos con dirección (flechas de «siguiente», el icono de «responder») se dan la vuelta con `:dir(rtl)`; los que no la tienen (una lupa, un reloj), no.
- Nada de `letter-spacing` en árabe: su escritura une las letras de cada palabra, y espaciarlas las separa.
- Los números, los correos y los fragmentos en otro idioma, aislados con `<bdi>` o con su propio `dir`.

## Texto vertical

### Japonés y chino

En `vertical-rl`, los caracteres japoneses y chinos se escriben de pie, pero las letras latinas y las cifras se **tumban** 90°: es lo que hace `text-orientation: mixed`, el valor inicial. Dos propiedades ajustan esos casos:

- `text-orientation: upright` pone de pie cada carácter, también los latinos: para siglas cortas.
- `text-combine-upright: all` comprime el contenido del elemento en el ancho de un solo carácter: es el *tate-chū-yoko* («horizontal dentro de vertical») de los números de dos cifras en las fechas.

[[exercise:06-texto-vertical-japones.md]]

### Rótulos en español

El texto vertical también sirve en un diseño en español, para rótulos: el lomo de un libro, la cabecera estrecha de una columna de tabla o el rótulo del eje de una gráfica. Antes se hacía con `transform: rotate()` (lo verás en el módulo de efectos visuales), pero un elemento girado sigue ocupando su caja horizontal y hay que recolocarlo a mano. Con `writing-mode`, la caja es vertical de verdad y el layout la respeta.

[[exercise:07-rotulos-verticales.md]]

La trampa está en el sentido de lectura: tanto `vertical-rl` como `vertical-lr` se leen **de arriba abajo**, porque solo se diferencian en hacia dónde van las líneas siguientes. Para leer de abajo arriba, `sideways-lr`, que gira la línea entera en sentido contrario. Llegó en Chrome 132, en enero de 2025.

## Cómo verlo en DevTools

- **El modo de escritura y la dirección.** En **Computed**, `writing-mode` y `direction` muestran los valores heredados. Si un elemento sale al revés, busca de qué antepasado vienen.
- **Las propiedades lógicas.** El panel del modelo de cajas de **Computed** siempre dibuja los márgenes y rellenos en físico (arriba, derecha, abajo, izquierda): así ves a qué lado de la pantalla ha ido a parar cada `margin-inline-start`.
- **Los ejes de flex y grid.** El overlay de flexbox y el de grid (las insignias `flex` y `grid` de **Elements**) dibujan las líneas y los números de pista ya girados: en una página `rtl`, la línea 1 de grid está a la derecha.

## Bestiario

- **En la versión en árabe, todo está del lado equivocado.** Síntoma: con `dir="rtl"`, las barras, sangrías, iconos y botones de cierre siguen en el lado de siempre y el texto empieza pegado a ellos. Causa: `left`, `right`, `margin-left`, `border-left`… son lados de la pantalla, no del texto. Solución: las propiedades lógicas (`margin-inline-start`, `border-inline-start`, `inset-inline-end`, `text-align: start`). → [ver ejemplo](02-propiedades-fisicas-no-giran.md)
- **Un número salta delante de un nombre.** Síntoma: «سارة: 5 reseñas» se ve como «5 :سارة reseñas». Causa: el algoritmo bidireccional une los números y los signos neutros a la dirección del texto que tienen al lado. Solución: `<bdi>` alrededor del nombre (o `unicode-bidi: isolate`), y `dir="auto"` en los campos. → [ver ejemplo](05-texto-bidireccional.md)

## Resumen

- El eje **inline** es el de las líneas de texto; el de **bloque**, el del apilamiento de líneas y bloques. `writing-mode` los coloca en la pantalla y `dir` decide el sentido del eje inline.
- Las propiedades lógicas (`inline-size`, `margin-inline`, `padding-block`, `border-inline-start`, `inset-inline-end`, `text-align: start`…) se nombran por esos ejes y giran con el texto; las físicas se quedan pegadas a la pantalla.
- `margin: auto` centra en el eje inline del flujo normal, sea horizontal o vertical; en el de bloque vale 0.
- Las filas de flexbox y las columnas de grid van en el eje inline: un layout con flex, grid y propiedades lógicas se invierte solo en árabe o en hebreo.
- La dirección va en el HTML (`dir`), no en CSS; `<bdi>` y `dir="auto"` aíslan el texto de dirección desconocida.
- En vertical, `text-orientation` y `text-combine-upright` colocan las letras latinas y las cifras; `sideways-lr` hace rótulos que se leen de abajo arriba.

## Para profundizar

- [MDN: Conceptos básicos de propiedades y valores lógicos](https://developer.mozilla.org/es/docs/Web/CSS/CSS_logical_properties_and_values/Basic_concepts_of_logical_properties_and_values)
- [MDN: writing-mode](https://developer.mozilla.org/es/docs/Web/CSS/writing-mode)
- [W3C: Inline markup and bidirectional text in HTML](https://www.w3.org/International/articles/inline-bidi-markup/)
- [web.dev: Logical properties (Learn CSS)](https://web.dev/learn/css/logical-properties)
- [Jen Simmons: CSS Writing Modes](https://24ways.org/2016/css-writing-modes/)
