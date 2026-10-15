# Transformaciones

## Por qué importa

`transform` mueve, gira, escala e inclina una caja **después** de colocarla: el layout la pone en su sitio, y la transformación solo cambia cómo se pinta. Por eso es la herramienta de los efectos que no deben empujar a nadie (una tarjeta que crece al pasar el ratón, una nota girada en un tablero, un menú que entra desde un lado) y la propiedad que mejor se anima, como verás en el módulo de animación.

Esta lección cierra tres cabos sueltos del curso. En el módulo de flujo y posicionamiento, `transform` aparecía como «la causa del problema» de un botón `fixed` que se iba con su panel y de un `z-index` atrapado; aquí verás el mecanismo completo. En la lección de modos de escritura quedó pendiente comparar `rotate()` con `writing-mode`. Y en esa misma lección, dar la vuelta a las flechas en las páginas en árabe. La siguiente lección añade la tercera dimensión.

## `transform`: mover, girar, escalar, inclinar

`transform` recibe una lista de funciones:

| Función | Qué hace | Ejemplo |
|---|---|---|
| `translate(x, y)`, `translateX()`, `translateY()` | mueve | `translate(30px, 20px)`; los `%` son del tamaño de la propia caja |
| `rotate(ángulo)` | gira; los ángulos positivos, en el sentido del reloj | `rotate(30deg)`, `rotate(0.25turn)` |
| `scale(x, y)`, `scaleX()`, `scaleY()` | agranda o encoge; con un factor negativo, refleja | `scale(1.4)`, `scale(-1, 1)` |
| `skew(x, y)`, `skewX()`, `skewY()` | inclina los lados | `skew(-20deg)` |
| `matrix(a, b, c, d, e, f)` | cualquier combinación de las anteriores | al final de la lección |

[[exercise:01-funciones-de-transform.md]]

Como viste en la tabla de porcentajes de la lección de unidades, los de `translate` se miden con la **propia** caja, no con su contenedor. `translate(-50%, -50%)` mueve una caja la mitad de su ancho y de su alto, sea cual sea su tamaño, y por eso fue durante años la forma de centrar un elemento posicionado (`top: 50%; left: 50%; transform: translate(-50%, -50%)`). Hoy, con flexbox y grid, casi nunca hace falta.

## `transform-origin`: el punto fijo

Toda transformación tiene un punto que no se mueve: el **origen**. Por defecto es el centro de la caja (`50% 50%`), así que `rotate()` gira alrededor del centro y `scale()` crece hacia todos los lados. `transform-origin` lo cambia, con palabras clave (`top left`), porcentajes o longitudes medidas sobre la propia caja.

[[exercise:02-transform-origin.md]]

Un caso aparte: los elementos de **dentro** de un SVG (un `<path>`, un `<circle>`). Para ellos, el origen por defecto es la esquina superior izquierda del lienzo del SVG, no el centro de la forma, y un `rotate()` los hace orbitar en lugar de girar. Se arregla con `transform-box: fill-box` (el origen se mide con la forma) y `transform-origin: center`.

## El orden importa

Las funciones de la lista se aplican **en orden**, y cada una cambia los ejes de la caja para las que vienen detrás. Hay dos formas equivalentes de leer una lista:

- **De izquierda a derecha, moviendo los ejes de la caja.** `rotate(45deg) translateX(120px)`: la caja gira, y su eje x con ella; después avanza 120px por ese eje inclinado, en diagonal.
- **De derecha a izquierda, moviendo la caja sobre los ejes fijos de la página.** La misma lista: primero se mueve 120px a la derecha y después gira 45° alrededor del origen original, como una piedra atada a una cuerda: acaba abajo a la derecha.

[[exercise:03-el-orden-importa.md]]

Con `scale()` pasa lo mismo: después de `scale(2)`, cada píxel del eje mide dos, y un `translateX(60px)` posterior mueve la caja 120px. La regla práctica para casi todo: **primero `translate`, después `rotate`, después `scale`**. Así cada una hace lo que dice: mover en la página, girar en su sitio y escalar en su sitio.

### Propiedades sueltas: `translate`, `rotate` y `scale`

Desde 2022 existen tres propiedades independientes con esos nombres. Tienen dos ventajas sobre `transform`:

- **No se pisan.** `transform` es una sola propiedad con una lista, y un `:hover` con `transform: scale(1.15)` borra el `rotate` que había (es lo mismo que pasaba con `filter` en la lección de filtros). Con `rotate: -4deg` en la regla base y `scale: 1.15` en el `:hover`, cada una conserva su valor.
- **Tienen un orden fijo, y es el razonable.** El navegador aplica siempre `translate`, después `rotate`, después `scale` y, por último, la lista de `transform` si la hay, **en ese orden, aunque las escribas al revés**.

[[exercise:04-propiedades-individuales.md]]

Su sintaxis no lleva comas ni paréntesis: `translate: 30px 20px`, `rotate: 45deg`, `scale: 1.2` o `scale: -1 1`. Úsalas por defecto; recurre a `transform` cuando necesites otro orden (girar antes de mover) o funciones que no tienen propiedad propia, como `skew()`.

## Transformar no cambia el layout

El layout se calcula con la caja **sin transformar**. La transformación llega después y solo cambia dónde se pinta. Por eso un `translateY(30px)` no empuja al elemento de abajo, sino que lo tapa; y por eso un rótulo girado 90° sigue reservando su caja horizontal.

[[exercise:05-la-caja-no-se-mueve.md]]

Esa es la diferencia con `writing-mode`, la promesa de la lección de modos de escritura: `writing-mode: sideways-lr` crea una caja **vertical de verdad**, que el layout coloca y mide como tal. Para el lomo de un libro, la cabecera estrecha de una tabla o el rótulo de un eje, `writing-mode`; para un efecto visual que no debe afectar a nada (una nota torcida, un sello), `transform`.

### Pero el scroll sí se entera

Hay una excepción importante. Una caja transformada no ocupa sitio, pero el **área de scroll** de su contenedor incluye hasta donde se pinta. Un menú escondido a la derecha con `translateX(100%)` hace que la página se pueda desplazar de lado. En un Mac con las barras de desplazamiento ocultas no se nota hasta que alguien desliza con el trackpad; en Windows aparece una barra horizontal.

[[exercise:06-transform-y-el-scroll.md]]

La solución es `overflow-x: clip` en el contenedor del menú (o en el `<body>`). Viste `clip` en la lección de `overflow`: recorta sin convertir la caja en un contenedor de scroll, así que no rompe `position: sticky`. Hacia la izquierda y hacia arriba no hay problema: no se puede desplazar a coordenadas negativas.

### Los elementos en línea no se transforman

`transform` solo se aplica a cajas **transformables**: bloques, elementos de flex y de grid, celdas de tabla y cajas atómicas en línea (`inline-block`, imágenes, SVG, controles de formulario). Un `<span>`, un `<a>` o un `<em>` normales no lo son, porque pueden partirse en varias líneas y no hay una caja única que girar. La declaración es válida, pero no hace nada.

[[exercise:10-transform-en-un-span.md]]

## Por qué `transform` aísla la caja

En la lección de filtros viste que un efecto que procesa el elemento entero obliga al navegador a pintarlo **aparte**, con todos sus descendientes, en una imagen propia. Con `transform` pasa lo mismo: el navegador pinta la caja y todo lo que contiene en una capa y después aplica la transformación a esa capa, como quien gira una foto impresa. Las dos sorpresas del módulo de flujo y posicionamiento salen de ahí:

- **Contexto de apilamiento.** Todo lo de dentro forma parte de la misma imagen. Un `z-index: 100` en un hijo solo lo ordena dentro de esa imagen; hacia fuera compite la caja transformada entera, como si tuviera `z-index: 0`. Por eso una nota que sobresale de una foto girada queda debajo de la foto vecina, si esta también está girada o posicionada y va después en el HTML.
- **Bloque contenedor de `fixed` y `absolute`.** Un hijo `position: fixed` tiene que estar dentro de la imagen que se gira, así que no puede colocarse respecto a la ventana: se coloca respecto a la caja transformada, gira con ella y se desplaza con ella al hacer scroll.

[[exercise:07-transform-aplana-la-caja.md]]

Basta con que `transform` sea distinto de `none`, aunque no mueva nada: `translateX(0)` y `rotate(0deg)` aíslan igual. Lo mismo hacen `translate`, `rotate`, `scale` y `perspective` (lección siguiente), y `will-change: transform`, que avisa al navegador de que algo se va a transformar y le pide preparar la capa de antemano (lo verás en el módulo de animación). La solución siempre pasa por lo mismo: que lo que debe escapar (un modal, un aviso, un menú desplegable, un botón flotante) no esté **dentro** del elemento transformado. Pon la transformación en un hijo, o saca lo fijo al final del `<body>`.

## Voltear iconos en una página de derecha a izquierda

En la lección de modos de escritura viste que un layout con flexbox, grid y propiedades lógicas se invierte solo en árabe o en hebreo, salvo los dibujos: una flecha de «siguiente» sigue apuntando a la derecha, hacia atrás en la lectura. Un reflejo horizontal la arregla: `scale: -1 1` (o `transform: scaleX(-1)`), solo cuando la dirección es `rtl`.

[[exercise:08-voltear-iconos-en-rtl.md]]

No todos los iconos se reflejan: solo los que indican **dirección** o avance (flechas, «responder», «deshacer», una barra de progreso). Una lupa, un reloj, una marca de verificación o un logotipo se quedan igual. Por eso la regla va en una clase (`.is-directional`) y no en todos los iconos.

## `matrix()`: lo que guarda el navegador

Todas las funciones 2D son casos particulares de una sola operación: una **matriz** de 3 × 3 de la que solo seis números son libres. `matrix(a, b, c, d, e, f)` los escribe en orden de columnas:

```text
| a  c  e |       x' = a·x + c·y + e
| b  d  f |  →    y' = b·x + d·y + f
| 0  0  1 |       (x, y medidos desde transform-origin)
```

- `a` y `d` escalan; `b` y `c` mezclan los ejes (giran o inclinan); `e` y `f` desplazan.
- Girar un ángulo θ es `matrix(cos θ, sin θ, −sin θ, cos θ, 0, 0)`. Para 30°: `matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0)`.
- Aplicar una lista de funciones es **multiplicar** sus matrices, de izquierda a derecha. Y la multiplicación de matrices no es conmutativa: esa es la explicación matemática de que el orden importe.

[[exercise:09-matrix-explicada.md]]

El navegador guarda cualquier `transform` 2D como una de estas matrices: es lo que devuelve `getComputedStyle()` y lo que verás en la pestaña **Computed** de DevTools, aunque hayas escrito `rotate(30deg)`.

> **Desde Python:** con listas de listas puedes componer transformaciones y comprobar los números del navegador. La matriz de `rotate(30deg) translateX(40px)` es el producto de las dos, y el orden decide adónde va el centro de la caja:

```python
from math import cos, sin, radians

def matmul(m, n):
    """Multiplica dos matrices 3 × 3 (listas de filas)."""
    return [[sum(m[i][k] * n[k][j] for k in range(3)) for j in range(3)] for i in range(3)]

def rotate(deg):
    a = radians(deg)
    return [[cos(a), -sin(a), 0], [sin(a), cos(a), 0], [0, 0, 1]]

def translate_x(px):
    return [[1, 0, px], [0, 1, 0], [0, 0, 1]]

def as_css(m):
    a, c, e = m[0]
    b, d, f = m[1]
    return "matrix(" + ", ".join(f"{v:.6g}" for v in (a, b, c, d, e, f)) + ")"

def apply(m, x, y):
    return (round(m[0][0] * x + m[0][1] * y + m[0][2], 2), round(m[1][0] * x + m[1][1] * y + m[1][2], 2))

move_then_turn = matmul(translate_x(120), rotate(45))   # translateX(120px) rotate(45deg)
turn_then_move = matmul(rotate(45), translate_x(120))   # rotate(45deg) translateX(120px)

print("rotate(30deg)                 →", as_css(rotate(30)))
print("rotate(30deg) translateX(40px) →", as_css(matmul(rotate(30), translate_x(40))))
print("centro con translateX(120px) rotate(45deg):", apply(move_then_turn, 0, 0))
print("centro con rotate(45deg) translateX(120px):", apply(turn_then_move, 0, 0))
```

```text
rotate(30deg)                 → matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0)
rotate(30deg) translateX(40px) → matrix(0.866025, 0.5, -0.5, 0.866025, 34.641, 20)
centro con translateX(120px) rotate(45deg): (120.0, 0.0)
centro con rotate(45deg) translateX(120px): (84.85, 84.85)
```

Las dos primeras líneas son exactamente lo que imprime Chrome en el ejemplo, con seis cifras significativas.

## Cómo verlo en DevTools

- **La caja transformada.** Al pasar el ratón por un elemento en **Elements**, el resaltado dibuja la forma transformada (girada, inclinada); el panel del modelo de cajas de **Computed** sigue mostrando la caja sin transformar, la que usa el layout.
- **Los ángulos.** Junto a cada ángulo de **Styles** (`30deg`) hay un pequeño reloj: haz clic y arrastra la aguja para girar la caja en directo.
- **La matriz.** En **Computed**, `transform` aparece siempre como `matrix(…)` (o `matrix3d(…)` en 3D).

## Bestiario

- **La caja va en diagonal en vez de a la derecha.** Síntoma: `rotate(45deg) translateX(120px)` no se mueve 120px a la derecha. Causa: cada función mueve los ejes de la caja para las siguientes; tras girar, el eje x está inclinado. Solución: primero `translate`, después `rotate`, después `scale` (o las propiedades sueltas, que siguen ese orden). → [ver ejemplo](03-el-orden-importa.md)
- **El `:hover` endereza la tarjeta.** Síntoma: una caja girada pierde el giro al crecer con `transform: scale()`. Causa: `transform` es una lista que se sustituye entera. Solución: las propiedades sueltas `rotate` y `scale`, que no se pisan. → [ver ejemplo](04-propiedades-individuales.md)
- **El rótulo girado se sale y deja huecos.** Síntoma: un texto con `rotate(-90deg)` tapa a sus vecinos o deja espacios enormes; un `translate` tapa al elemento de abajo en lugar de empujarlo. Causa: el layout usa la caja sin transformar. Solución: `writing-mode` para texto vertical; márgenes o `gap` para separar de verdad. → [ver ejemplo](05-la-caja-no-se-mueve.md)
- **La página se desplaza de lado.** Síntoma: en el móvil la página «baila» horizontalmente y aparece un menú escondido. Causa: las cajas transformadas cuentan para el área de scroll. Solución: `overflow-x: clip` en su contenedor. → [ver ejemplo](06-transform-y-el-scroll.md)
- **El `z-index` no sube y el `fixed` no se fija.** Síntoma: un hijo con `z-index: 100` queda debajo de un vecino, y un hijo `fixed` se coloca y gira con su padre. Causa: el padre transformado se pinta como una capa aparte: crea un contexto de apilamiento y es el bloque contenedor de sus descendientes `fixed`. Solución: la transformación en un hijo, o lo que debe escapar fuera del elemento transformado. → [ver ejemplo](07-transform-aplana-la-caja.md)
- **El `span` no gira.** Síntoma: `transform` en un elemento en línea no hace nada. Causa: solo se transforman las cajas transformables, y un elemento en línea puede partirse en varias líneas. Solución: `display: inline-block`. → [ver ejemplo](10-transform-en-un-span.md)

## Resumen

- `transform` mueve, gira, escala e inclina una caja después del layout: no empuja a nadie, pero sí cuenta para el área de scroll.
- El origen de todas las operaciones es `transform-origin`, el centro por defecto (salvo en los elementos de dentro de un SVG).
- Las funciones se aplican en orden y cada una mueve los ejes de la caja; el orden sensato es `translate`, `rotate`, `scale`.
- Las propiedades `translate`, `rotate` y `scale` no se pisan entre sí y se aplican siempre en ese orden.
- Un elemento transformado se pinta como una capa: crea un contexto de apilamiento y es el bloque contenedor de sus descendientes `fixed`.
- Para texto vertical, `writing-mode`; para reflejar iconos en `rtl`, `:dir(rtl)` con `scale: -1 1`.
- Toda transformación 2D es una `matrix(a, b, c, d, e, f)`, y componer es multiplicar matrices.

## Para profundizar

- [MDN: Usar transformaciones CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_transforms/Using_CSS_transforms)
- [MDN: transform-origin](https://developer.mozilla.org/es/docs/Web/CSS/transform-origin)
- [web.dev: Transforms (Learn CSS)](https://web.dev/learn/css/transforms)
- [Josh W. Comeau: The World of CSS Transforms](https://www.joshwcomeau.com/css/transforms/)
- [Especificación: CSS Transforms Level 2](https://www.w3.org/TR/css-transforms-2/)
