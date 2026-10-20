# Floats

## Por qué importa

`float` nació para algo muy concreto: que una imagen se coloque a un lado y el texto la rodee, como en una revista. Durante unos diez años, a falta de algo mejor, se usó para maquetar páginas enteras (columnas, menús, rejillas de productos), con trucos como el *clearfix* para esquivar sus efectos secundarios. Hoy, flexbox y grid hacen ese trabajo mucho mejor, pero `float` sigue siendo la **única** forma de que el texto rodee algo, y te lo encontrarás en muchísimo código.

En esta lección verás cómo funciona un flotante, por qué su contenedor «colapsa» (uno de los errores más famosos de CSS), cómo evitarlo con lo que aprendiste del BFC y qué usos tiene hoy: texto alrededor de imágenes, letras capitulares y formas con `shape-outside`.

## Cómo funciona `float`

`float: left` (o `right`) hace tres cosas con una caja:

1. La **saca del flujo** y la empuja hacia el borde izquierdo (o derecho) de su contenedor, a la altura en la que estaba.
2. La convierte en **bloque**, sea cual sea su `display`: un `<span>` flotante acepta `width` y `height`. Si no le das ancho, mide lo que su contenido (*shrink-to-fit*), como un `inline-block`.
3. Hace que las **líneas de texto** que vienen después se acorten para rodearla. Cuando el flotante termina, las líneas vuelven a ocupar todo el ancho.

[[exercise:01-texto-alrededor-de-una-imagen.md]]

Los valores son `left`, `right` y `none` (por defecto), y sus versiones lógicas `inline-start` e `inline-end`, que se adaptan a los idiomas que se escriben de derecha a izquierda. Los márgenes de un flotante **nunca colapsan**: el `margin-right` de la imagen es exactamente el hueco que queda entre ella y el texto.

## Las cajas pasan por debajo

La frase importante del punto 3 es «las **líneas** de texto». Un flotante no aparta a las **cajas** de los bloques siguientes: para ellas, el flotante no existe, así que empiezan en el borde izquierdo del contenedor y pasan **por debajo** de la imagen. Solo su texto se aparta.

Con párrafos sin fondo no se nota. Pero si un título tiene fondo o una cita tiene un borde izquierdo, verás que el fondo asoma junto a la imagen y que el borde desaparece debajo de ella.

```text
   ┌──────┐ ░░░░ Ingredientes ░░░░░░░░░░░  ← el fondo del título empieza bajo la foto
   │ foto │ «Pesa siempre el agua: una
   │      │ taza nunca mide lo mismo…»     ← el borde de la cita está tapado
   └──────┘
 ▌ dos veces.»                             ← y reaparece cuando la foto acaba
```

[[exercise:02-las-cajas-pasan-por-debajo.md]]

Aquí aparece el tercer efecto del BFC que anunció la primera lección: **un BFC no se mete debajo de los flotantes de fuera**. Si el título o la cita crean un BFC (`display: flow-root`), se colocan al lado de la imagen, más estrechos, con su fondo y su borde enteros.

## Varios flotantes

Cuando hay varios flotantes seguidos, cada uno se pega al borde de su lado **o al flotante anterior de ese lado**. Tres reglas lo resumen:

- Con `float: left` se colocan de izquierda a derecha en el orden del HTML.
- Con `float: right`, el primero llega antes al borde derecho y los siguientes se ponen a su izquierda: **se ven en orden inverso**.
- Si un flotante no cabe en el espacio que queda, **baja** hasta donde quepa. Un flotante nunca sube por encima de uno anterior.

[[exercise:03-varios-flotantes.md]]

El orden inverso de `float: right` es una trampa de accesibilidad: el lector de pantalla y la tecla <kbd>Tab</kbd> siguen el orden del HTML, no el visual.

## `clear`

`clear` es la propiedad complementaria: obliga a un bloque a colocarse **por debajo** de los flotantes anteriores, en lugar de a su lado. El navegador añade encima el espacio que haga falta (la «holgura», *clearance*).

| Valor | Se coloca por debajo de… |
|---|---|
| `left` | los flotantes de la izquierda |
| `right` | los flotantes de la derecha |
| `both` | todos los flotantes |
| `none` (por defecto) | nada: puede ir al lado |

[[exercise:04-clear.md]]

`clear` solo tiene en cuenta los flotantes del mismo BFC y solo funciona en cajas de bloque. Es la herramienta para que el siguiente apartado de un artículo no empiece al lado de la foto del anterior.

## El padre que colapsa

Ahora el error clásico. Los flotantes están fuera del flujo, así que **no cuentan para la altura de su contenedor**. Si un contenedor solo tiene hijos flotantes, la altura de su contenido es 0: su fondo desaparece, su borde se queda en una línea, los flotantes se salen por debajo y lo que venga después se mete a su lado.

```text
 lo que esperas                     lo que pasa
 ┌──────────────────────┐           ┌──────────────────────┐  ← el padre: solo relleno y borde
 │ ┌──────┐      4,20 € │           └──────────────────────┘
 │ │ foto │             │             ┌──────┐      4,20 €
 │ └──────┘             │             │ foto │ Envío gratis…  ← el texto siguiente sube
 └──────────────────────┘             └──────┘
 Envío gratis…
```

[[exercise:05-el-padre-que-colapsa.md]]

La solución es el segundo efecto del BFC: **un BFC contiene a sus flotantes**, es decir, su altura llega hasta el final del flotante más bajo. Es lo que anunciaba la lección de overflow cuando decía que, con `overflow: auto`, «la caja pasa a contener sus flotantes».

## Encerrar flotantes: clearfix, `overflow` y `flow-root`

Hay tres formas de que un contenedor encierre a sus flotantes, y las tres aparecen en código real:

| Técnica | Cómo funciona | Efecto secundario |
|---|---|---|
| *clearfix*: `.clearfix::after { content: ""; display: block; clear: both }` | un pseudoelemento al final se coloca debajo de los flotantes y estira al padre | ninguno visible, pero no crea un BFC: los márgenes de los hijos aún pueden escaparse |
| `overflow: hidden` o `auto` | crea un BFC | recorta todo lo que sobresalga (sombras, insignias, menús, anillos de foco) |
| `display: flow-root` | crea un BFC, y nada más | ninguno |

[[exercise:06-clearfix-y-flow-root.md]]

En código nuevo, usa `display: flow-root`. El clearfix fue la solución estándar durante una década (está en todos los frameworks antiguos) y `overflow: hidden` era el atajo: reconócelos cuando los veas.

## Usos legítimos hoy

### Texto alrededor de algo

Imágenes en artículos, citas destacadas a un lado del texto, una ficha técnica en una noticia. Es lo que ningún otro sistema de layout sabe hacer: flexbox y grid colocan cajas, pero no hacen que las líneas de un párrafo rodeen otra caja.

### Letras capitulares

Una letra capitular es la primera letra de un capítulo, grande y ocupando varias líneas. Se hace con `::first-letter` (lo viste en el módulo 1) y `float: left`: la letra sale de la primera línea y el texto la rodea. Como la letra sigue siendo parte del texto, un lector de pantalla lee la palabra entera.

[[exercise:07-letra-capitular.md]]

Existe una propiedad moderna, `initial-letter`, que encaja la letra exactamente en un número de líneas, pero todavía no funciona en todos los navegadores.

### Formas con `shape-outside`

Un flotante es siempre un rectángulo para el texto que lo rodea, aunque lo redondees con `border-radius`. `shape-outside` cambia la forma que el texto rodea: con `circle(50%)`, el texto sigue la curva de un retrato redondo. Solo funciona en flotantes. Verás más formas (`ellipse()`, `polygon()`) junto a `clip-path` en el módulo de efectos visuales.

[[exercise:08-shape-outside.md]]

## Floats para maquetar: cómo reconocerlos

Si abres el CSS de una web de hace unos años, verás columnas hechas con `float: left` y anchos en porcentaje, un `clearfix` en cada contenedor y, a menudo, problemas como estos: una columna que «cae» a la fila siguiente porque el relleno no cabía en el 100 % (el `box-sizing` del módulo anterior) y columnas de distinta altura que no hay forma limpia de igualar.

[[exercise:09-columnas-con-float.md]]

Flexbox y grid resuelven las dos cosas sin trucos. No uses `float` para maquetar en código nuevo; úsalo para lo que se inventó.

## Cómo verlo en DevTools

En **Elements → Computed**, busca `float` y `clear`. Al pasar el ratón sobre un contenedor que colapsa, el resaltado se queda en una franja fina mientras sus hijos se ven por debajo: es la pista visual más clara de que los flotantes no cuentan para su altura. Y en el diagrama de cajas verás un alto de contenido de 0.

## Bestiario

- **El fondo de un título (o el borde de una cita) pasa por debajo de una imagen flotante.** Síntoma: junto a una imagen con `float`, el fondo asoma en el hueco del margen y el borde izquierdo desaparece. Causa: el flotante solo aparta las líneas de texto; las cajas de los bloques siguientes pasan por debajo. Solución: `display: flow-root` en el bloque (un BFC no se mete debajo de los flotantes) o `clear` para que empiece debajo. → [ver ejemplo](02-las-cajas-pasan-por-debajo.md)
- **Mi contenedor no tiene altura y su fondo desaparece.** Síntoma: un contenedor con hijos flotantes se queda en una línea, los hijos se salen por debajo y el contenido siguiente se mete al lado. Causa: los flotantes no cuentan para la altura de su padre. Solución: `display: flow-root` en el contenedor. → [ver ejemplo](05-el-padre-que-colapsa.md)

## Resumen

- `float` saca una caja del flujo, la pega a un lado de su contenedor, la convierte en bloque y hace que las líneas siguientes la rodeen.
- Las cajas de los bloques siguientes pasan por debajo del flotante; solo su texto se aparta. Un BFC, en cambio, se coloca a su lado.
- Varios flotantes se colocan uno junto a otro; con `float: right` se ven en orden inverso, y el que no cabe baja.
- `clear` coloca un bloque por debajo de los flotantes anteriores.
- Un contenedor con solo flotantes mide 0 de alto; `display: flow-root` lo arregla porque un BFC contiene a sus flotantes.
- Hoy, `float` sirve para que el texto rodee algo (imágenes, capitulares, formas con `shape-outside`); para maquetar, flexbox y grid.

## Para profundizar

- [MDN: float](https://developer.mozilla.org/es/docs/Web/CSS/float)
- [MDN: clear](https://developer.mozilla.org/es/docs/Web/CSS/clear)
- [MDN: Floats (Learn)](https://developer.mozilla.org/es/docs/Learn/CSS/CSS_layout/Floats)
- [MDN: shape-outside](https://developer.mozilla.org/es/docs/Web/CSS/shape-outside)
- [CSS-Tricks: All About Floats](https://css-tricks.com/all-about-floats/)
