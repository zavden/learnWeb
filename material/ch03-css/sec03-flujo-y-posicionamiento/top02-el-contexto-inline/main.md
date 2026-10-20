# El contexto de formato inline

## Por qué importa

Tres misterios han ido apareciendo a lo largo del curso sin una explicación completa. En la lección de imágenes del capítulo de HTML, un hueco de unos píxeles debajo de cada imagen, que «se arregla» con `display: block`. En el módulo anterior, cajas `inline-block` puestas en fila que no se alinean por arriba. Y en sus ejemplos profesionales, un `vertical-align` en casi cada botón, icono o insignia, siempre con un comentario que prometía explicarlo aquí.

Los tres tienen la misma causa: cómo construye el navegador las **líneas** de texto. Cualquier cosa que viva dentro de una línea (una palabra, un enlace, una imagen, un botón) se coloca según las mismas reglas: la **caja de línea**, el **`line-height`**, la **línea base** y `vertical-align`. Cuando las conozcas, esos misterios dejarán de serlo.

## Cajas de línea

En la lección anterior viste que un bloque cuyos hijos son todos en línea (texto incluido) crea un **contexto de formato inline**. Dentro de él, el navegador corta el contenido en líneas y cada línea es una **caja de línea** (*line box*):

- su **ancho** es el del contenido del bloque (menos lo que ocupen los flotantes, como verás en la próxima lección);
- su **alto** es el mínimo necesario para contener todas las cajas en línea que lleva dentro;
- se **apilan** una debajo de otra sin ningún hueco: el espacio entre renglones no es un margen, es parte de cada línea.

[[exercise:01-cajas-de-linea.md]]

Si una caja de la línea es más alta que las demás (un botón, una imagen, una palabra enorme), solo crece **esa** línea. Por eso un icono demasiado grande dentro de un párrafo deja un renglón más separado que los otros.

Las cajas de línea también explican una duda frecuente: `text-align` se pone en el **bloque**, no en el `span` que quieres centrar. Lo que alinea es el contenido dentro de cada caja de línea, y las cajas de línea son del bloque.

## `line-height` y el interlineado

Cada fuente define unas medidas: cuánto suben las letras más altas sobre la línea base (**ascendente**) y cuánto bajan los rabos de la g, la j o la p (**descendente**). Juntas forman el **área de contenido** de la letra, que mide algo más que el `font-size`: en torno a 1,2 veces, según la fuente. Es lo que pinta el fondo de un `<span>`.

`line-height` fija la altura de la caja de cada fragmento de texto. La diferencia entre `line-height` y el área de contenido es el **interlineado** (*leading*), y el navegador reparte la mitad arriba y la mitad abajo de la letra:

```text
 ┌───────────────────────────────┐ ─┐
 │      mitad del interlineado   │  │
 ├───────────────────────────────┤  │ ─┐
 │ Ágil  ← ascendente            │  │  │
 │ ──────── línea base ───────── │  │  │ área de contenido
 │  gjp  ← descendente           │  │  │ (depende de la fuente)
 ├───────────────────────────────┤  │ ─┘
 │      mitad del interlineado   │  │
 └───────────────────────────────┘ ─┘ line-height
```

Si `line-height` es más pequeño que el área de contenido, el interlineado es **negativo**: las letras de una línea invaden la de al lado (sin empujarla).

[[exercise:02-line-height-y-el-interlineado.md]]

Los valores de `line-height`:

| Valor | Significado |
|---|---|
| `normal` (por defecto) | lo que recomiende la fuente; suele rondar 1,2 |
| un número: `1.5` | 1,5 × el `font-size` del propio elemento (la forma recomendada) |
| una longitud: `24px`, `1.5rem` | una altura fija, sea cual sea el tamaño de letra |
| un porcentaje: `150%` | 150 % del `font-size`, calculado una sola vez |

Para leer con comodidad, el texto de los párrafos suele llevar entre 1,4 y 1,6; los títulos grandes, algo menos. Por qué es mejor un número sin unidad que `1.5em` o `150%` lo verás en el módulo de tipografía: tiene que ver con cómo se hereda.

## La línea base

Dentro de una línea, cada caja se coloca por defecto con su **línea base** sobre la línea base de su padre (`vertical-align: baseline`). Así, un texto grande y uno pequeño quedan apoyados en la misma raya, como en un cuaderno. Pero no todas las cajas tienen la línea base en el mismo sitio:

| Caja | Su línea base |
|---|---|
| texto y cajas `inline` | la de su fuente |
| imágenes y otros elementos reemplazados (`img`, `video`, `iframe`…) | su **borde inferior** (del margen) |
| `inline-block` con texto | la línea base de su **última** línea |
| `inline-block` vacío, o con `overflow` distinto de `visible` | su **borde inferior** (del margen) |

En los ejemplos de esta lección la línea base se marca con una raya roja discontinua. Es, a su vez, una caja `inline-block` vacía: se apoya en la línea base con su borde inferior, justo la regla de la cuarta fila.

[[exercise:03-la-linea-base.md]]

### El puntal

Falta una pieza para entender el hueco de las imágenes. Toda caja de línea empieza con un **puntal** (*strut*): una caja invisible, de ancho cero, con la fuente y el `line-height` del bloque. Es como si cada línea empezara con una letra transparente. Tiene dos consecuencias:

- Una línea nunca es más baja que el `line-height` del bloque, aunque solo contenga una imagen pequeña.
- Debajo de la línea base siempre queda reservado el sitio de los descendentes de esa fuente (más la mitad del interlineado), **aunque no haya ni una letra**.

## El hueco bajo la imagen

Ya tienes todas las piezas. Una `<img>` sola dentro de un `<div>` está en una caja de línea. Su línea base es su borde inferior, así que se apoya en la línea base. Y por debajo de la línea base, el puntal reserva el espacio de los descendentes del `div`. Ese espacio es el hueco: con letra de 16 px son unos 4 px. Si aumentas el `font-size` del contenedor, el hueco crece; si escribes «gjy» después de la imagen, los rabos de esas letras lo llenan exactamente.

[[exercise:04-hueco-bajo-la-imagen.md]]

| Solución | Por qué funciona | Cuándo usarla |
|---|---|---|
| `display: block` en la imagen | la imagen sale de la línea: ya no hay línea base ni puntal que la acompañen | imágenes que van solas (tarjetas, cabeceras, galerías) |
| `vertical-align: bottom`, `top` o `middle` | la imagen deja de apoyarse en la línea base y la caja de línea se ajusta a ella | imágenes o iconos que deben seguir dentro de una línea |
| `line-height: 0` o `font-size: 0` en el padre | el puntal no mide nada | evítala: rompe cualquier texto que añadas después |

Por eso muchos *resets* modernos empiezan con `img, svg, video { display: block; }`: en una página real, casi ninguna imagen va en mitad de un párrafo. Lo verás en el módulo de arquitectura CSS.

## `vertical-align`

`vertical-align` mueve una caja **dentro de su línea**. Sus valores se agrupan según la referencia que usan:

| Referencia | Valor | Qué alinea |
|---|---|---|
| la línea base del padre | `baseline` (por defecto) | su línea base con la del padre |
| | `middle` | su centro con la línea base del padre + media altura de la «x» |
| | `sub`, `super` | baja o sube su línea base como un subíndice o un exponente |
| | una longitud o un `%` | sube (positivo) o baja (negativo) su línea base; `%` es del propio `line-height` |
| el texto del padre | `text-top` | su borde superior con lo más alto de las letras del padre |
| | `text-bottom` | su borde inferior con lo más bajo de las letras del padre |
| la caja de línea | `top` | su borde superior con el de la línea |
| | `bottom` | su borde inferior con el de la línea |

[[exercise:05-valores-de-vertical-align.md]]

La trampa más común: `vertical-align` **no** sirve para centrar en vertical el contenido de un bloque. Solo se aplica a cajas en línea, que coloca dentro de su línea, y a celdas de tabla, en las que sí coloca el contenido dentro de la celda (y en `<td>` ya vale `middle` por defecto). En un `div`, la declaración es válida y no hace nada. Para centrar dentro de un bloque, en el flujo normal usa el mismo relleno arriba y abajo; en el módulo de flexbox tendrás `align-items: center`.

[[exercise:06-vertical-align-no-centra-bloques.md]]

### Iconos junto al texto

Un icono dentro de una línea es el caso de uso más habitual de `vertical-align`. Con `baseline`, el icono se apoya en la línea base y queda alto; con `middle` se centra con las minúsculas y queda algo bajo junto a mayúsculas y cifras. Muchas librerías de iconos usan un pequeño desplazamiento negativo en `em` (`vertical-align: -0.125em` para iconos de `1em`), que funciona con cualquier tamaño de letra. Las insignias de los ejemplos profesionales del módulo anterior usaban la misma idea con `0.1em` para subir un punto de estado.

[[exercise:07-iconos-alineados-con-el-texto.md]]

## Cajas `inline-block` en fila

Un `inline-block` vive en una línea, así que también se alinea por su línea base. Y su línea base, como viste en la tabla, depende de lo que tenga dentro:

[[exercise:08-la-linea-base-de-un-inline-block.md]]

La cuarta caja explica el comentario de las etiquetas recortadas con «…» de los ejemplos profesionales del módulo anterior: un `inline-block` con `overflow: hidden` ya no se apoya en la línea base de su texto, sino en su borde inferior, y se descoloca respecto a sus vecinos. Es una regla heredada de CSS 2 que se conserva por compatibilidad.

Cuando pones varias tarjetas `inline-block` en fila, cada una se alinea por la última línea de su texto. Si tienen distinto contenido, ni las partes de arriba ni las de abajo coinciden; si alguna tiene `overflow: hidden`, sube.

[[exercise:09-inline-blocks-desalineados.md]]

La solución es `vertical-align: top` en las tarjetas, y es la razón de todos los `vertical-align: top` del módulo anterior. Recuerda también la otra rareza de los `inline-block`: el espacio en blanco del HTML entre ellos se ve como un espacio, porque también es texto de la línea. Flexbox y grid, en los próximos módulos, colocan cajas en fila sin ninguno de estos dos problemas.

## Cómo verlo en DevTools

En **Elements → Computed** puedes ver el `line-height` y el `vertical-align` de cualquier elemento (busca con el filtro). Al pasar el ratón sobre un `<span>` en el panel Elements, la página resalta su área de contenido, no la línea entera: es la diferencia que viste en el ejemplo del interlineado. Y si un hueco no tiene ni margen ni relleno en el diagrama de cajas, sospecha de la línea base.

## Bestiario

- **Hay unos píxeles de más debajo de la imagen.** Síntoma: un hueco entre una imagen y el borde inferior de su contenedor, que crece si el contenedor tiene letra más grande. Causa: la imagen es inline y se apoya en la línea base; debajo, el puntal de la línea reserva el sitio de los descendentes. Solución: `display: block` si la imagen va sola; `vertical-align: bottom` o `middle` si debe seguir en la línea. → [ver ejemplo](04-hueco-bajo-la-imagen.md)
- **`vertical-align: middle` no centra mi texto.** Síntoma: un bloque con altura fija y `vertical-align: middle` sigue con el texto arriba. Causa: `vertical-align` solo se aplica a cajas en línea y a celdas de tabla. Solución: relleno simétrico sin altura fija (o flexbox, en el módulo 4). → [ver ejemplo](06-vertical-align-no-centra-bloques.md)
- **Mis tarjetas `inline-block` no se alinean por arriba.** Síntoma: en una fila de cajas, la que tiene más texto sobresale por arriba y la que tiene `overflow: hidden` sube. Causa: se alinean por la línea base de su última línea, o por su borde inferior si son contenedores de scroll. Solución: `vertical-align: top`. → [ver ejemplo](09-inline-blocks-desalineados.md)

## Resumen

- En un contexto inline, el contenido se reparte en cajas de línea que se apilan sin huecos; cada una mide lo necesario para contener sus cajas.
- `line-height` fija el alto de cada fragmento de texto; la diferencia con el área de contenido de la fuente es el interlineado, repartido mitad arriba y mitad abajo.
- Todo se alinea por defecto por la línea base: el texto por la de su fuente, las imágenes por su borde inferior, los `inline-block` por su última línea (o su borde inferior si están vacíos o recortan).
- Cada línea empieza con un puntal invisible con la fuente del bloque; reserva el sitio de los descendentes aunque no haya texto.
- El hueco bajo una imagen es ese sitio reservado: `display: block` o `vertical-align` lo eliminan.
- `vertical-align` coloca cajas en línea dentro de su línea (y contenido en celdas de tabla); no centra bloques.
- Para cajas `inline-block` en fila, `vertical-align: top`.

## Para profundizar

- [MDN: line-height](https://developer.mozilla.org/es/docs/Web/CSS/line-height)
- [MDN: vertical-align](https://developer.mozilla.org/es/docs/Web/CSS/vertical-align)
- [Vincent De Oliveira: Deep dive CSS: font metrics, line-height and vertical-align](https://iamvdo.me/en/blog/css-font-metrics-line-height-and-vertical-align)
- [CSS 2.2: Line height calculations (especificación)](https://www.w3.org/TR/CSS22/visudet.html#line-height)
- [CSS Inline Layout Module Level 3](https://www.w3.org/TR/css-inline-3/)
