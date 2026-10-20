# Recortes y máscaras

## Por qué importa

Toda caja de CSS es un rectángulo. `border-radius` le redondea las esquinas, pero no la convierte en un rombo, una flecha, un hexágono o una ola. Esta lección trata de dos herramientas que deciden **qué parte** de un elemento se ve:

- `clip-path` recorta con una **forma geométrica**: dentro se ve todo; fuera, nada. Un corte de tijera.
- `mask-image` usa una **imagen** como máscara: cada píxel puede verse entero, a medias o nada, según la transparencia de la máscara. Un fundido, un icono, una silueta.

También cumple una promesa del módulo de flujo y posicionamiento: en la lección de flotantes, `shape-outside: circle()` hacía que el texto rodeara un retrato redondo, y quedaron pendientes las demás formas (`ellipse()`, `polygon()`). Son las mismas que usa `clip-path`, y aquí trabajan juntas.

## `clip-path`: recortar con una forma

`clip-path` recibe una forma, y el navegador solo pinta lo que queda **dentro**. Las formas básicas se miden con la caja del elemento: los porcentajes son del ancho (en horizontal) y del alto (en vertical), con el origen en la esquina superior izquierda.

| Forma | Ejemplo | Qué dibuja |
|---|---|---|
| `inset()` | `inset(12px round 20px)` | un rectángulo metido hacia dentro (como `margin`), con radio opcional tras `round` |
| `circle()` | `circle(44% at 50% 50%)` | un círculo: radio y centro |
| `ellipse()` | `ellipse(30% 42% at 52% 36%)` | un óvalo: dos radios y centro |
| `polygon()` | `polygon(50% 0, 100% 50%, 50% 100%, 0 50%)` | puntos unidos con rectas |
| `path()` | `path("M0 0 H200 V96 C… Z")` | un trazado de SVG, en píxeles |
| `shape()` | `shape(from 0% 0%, hline to 100%, …)` | un trazado con porcentajes (Chrome 135) |
| `url(#id)` | `url(#wave)` | un `<clipPath>` de SVG definido en la página |

[[exercise:01-clip-path-formas-basicas.md]]

Un detalle de `circle()`: en una caja que no es cuadrada, el porcentaje del radio se mide sobre una media entre el ancho y el alto (la diagonal dividida entre √2), así que `circle(50%)` en una caja apaisada se sale por arriba y por abajo. Para un círculo que toque los lados, `circle(closest-side)`, igual que en los degradados radiales.

La forma se mide por defecto con la caja del **borde** (`border-box`). Se puede elegir otra detrás de la forma: `clip-path: circle(50%) content-box` recorta con la caja del contenido, sin el relleno ni el borde.

### `polygon()`

Un polígono es una lista de puntos `x y` que el navegador une **en orden** y cierra volviendo al primero. Con porcentajes, la forma se estira con la caja: el borde inclinado de una sección sigue siendo una diagonal a cualquier ancho. Para leer o escribir coordenadas, ayuda imaginarse la caja sobre una cuadrícula del 10 %:

[[exercise:02-poligonos.md]]

> **Desde Python:** los polígonos regulares y las estrellas se calculan, no se escriben a mano. Esta función reparte `n` puntas alrededor del centro de la caja, alternando un radio exterior y uno interior, y devuelve el `polygon()` listo para pegar:

```python
from math import cos, sin, pi

def star_polygon(points=5, outer=50, inner=20):
    coords = []
    for i in range(points * 2):
        radius = outer if i % 2 == 0 else inner
        angle = -pi / 2 + i * pi / points          # la primera punta, arriba
        x = 50 + radius * cos(angle)
        y = 50 + radius * sin(angle)
        coords.append(f"{x:.1f}% {y:.1f}%")
    return f"polygon({', '.join(coords)})"

print(star_polygon())
```

```text
polygon(50.0% 0.0%, 61.8% 33.8%, 97.6% 34.5%, 69.0% 56.2%, 79.4% 90.5%, 50.0% 70.0%, 20.6% 90.5%, 31.0% 56.2%, 2.4% 34.5%, 38.2% 33.8%)
```

### Curvas: `path()` y `shape()`

Un polígono solo tiene rectas. Para curvas existía `path()`, que acepta un trazado con la sintaxis del atributo `d` de SVG: `M` mueve, `L` traza una recta, `H` y `V` rectas horizontales y verticales, `C` una curva de Bézier y `Z` cierra. Su problema: los números son **píxeles**. La forma no se adapta a la caja.

[[exercise:03-path-no-se-adapta.md]]

`shape()` llegó en 2025 (Chrome 135, Safari 18.4) para resolverlo: los mismos comandos escritos con palabras (`from`, `line to`, `hline to`, `vline to`, `curve to … with …`, `arc to`, `close`) y con cualquier unidad de CSS, porcentajes y `calc()` incluidos. Si tienes un trazado de SVG diseñado en una herramienta, la otra vía es un `<clipPath clipPathUnits="objectBoundingBox">` en el HTML, con coordenadas de 0 a 1, y `clip-path: url(#id)`.

## Lo que `clip-path` no cambia

Recortar un elemento solo cambia lo que se **pinta**. Tres consecuencias que sorprenden:

- **El layout no cambia.** El elemento sigue ocupando su rectángulo completo, y sus vecinos no se acercan a la forma. (Si quieres que el texto la rodee, eso es `shape-outside`, más abajo.)
- **Lo recortado no recibe el ratón.** Las zonas fuera de la forma no disparan `:hover` ni clics: el clic pasa al elemento que haya debajo. Un botón redondo recortado de 44 × 44 pierde las esquinas, un 21 % de su área táctil.
- **Crea un contexto de apilamiento**, como cualquier efecto que pinta el elemento como un grupo (lección de filtros y mezclas).

[[exercise:04-el-recorte-no-cambia-la-caja.md]]

Y la cuarta, la más peligrosa: el recorte se aplica a **todo** lo que pinta el elemento, también a lo que se dibuja fuera de su caja. La `box-shadow` desaparece y, sobre todo, el `outline` del foco: un usuario de teclado ya no sabe en qué botón está.

[[exercise:05-el-recorte-se-come-el-foco.md]]

La solución es mover esos dibujos a un **envoltorio sin recortar**: la sombra con `filter: drop-shadow()` (que sigue la forma del hijo recortado) y el anillo de foco con `:has(:focus-visible)`. Añade además un indicador dentro de la forma, como un subrayado, por si el anillo rectangular queda lejos de una punta.

## Formas para el texto: `shape-outside`

En la lección de flotantes viste que `shape-outside` cambia la forma que el texto **rodea**, solo en elementos flotantes. Acepta las mismas formas básicas que `clip-path`: `circle()`, `ellipse()`, `polygon()`, `inset()`. Pero son propiedades independientes: `clip-path` decide qué se **ve** y `shape-outside` qué forma **esquiva el texto**. Para un retrato ovalado con el texto alrededor, se escribe la misma forma en las dos.

[[exercise:06-shape-outside-y-clip-path.md]]

Dos detalles para que las dos formas coincidan:

- **La caja de referencia.** `clip-path` se mide por defecto con la caja del borde y `shape-outside` con la del **margen**. Con un margen en el flotante, el mismo `ellipse(30% 40%)` sale de distinto tamaño en cada una. Escribe `border-box` detrás de la forma de `shape-outside` y usa `shape-margin` para separar el texto.
- **`shape-margin`** añade aire alrededor de la forma, sin salir nunca de la caja del margen.

`shape-outside` también acepta una imagen: `shape-outside: url("silueta.png")` hace que el texto rodee los píxeles opacos de un PNG con transparencia (`shape-image-threshold` decide a partir de qué alfa cuenta como opaco). La imagen tiene que venir del mismo origen o con permisos CORS; si no, el navegador la ignora en silencio y el texto rodea un rectángulo.

## `mask-image`: máscaras con imágenes

Una máscara es una imagen que se coloca encima del elemento y decide, píxel a píxel, cuánto se ve: donde la máscara es **opaca**, el elemento se ve; donde es **transparente**, desaparece; y donde es semitransparente, se ve a medias. A diferencia de `clip-path`, los bordes pueden ser suaves.

Cualquier imagen sirve como máscara, y los degradados de la primera lección son las más útiles: una foto que se funde con la página, una lista con scroll que se desvanece en los bordes para avisar de que hay más.

[[exercise:07-mask-image-con-degradados.md]]

Las propiedades de la máscara copian las del fondo: `mask-size`, `mask-position`, `mask-repeat`, `mask-origin` y `mask-clip`, con los mismos valores, y el atajo `mask`. Hasta Chrome 120 (diciembre de 2023) solo existían con prefijo: en código antiguo verás `-webkit-mask-image`.

### En la máscara cuenta la transparencia, no el color

Quien viene de Photoshop o GIMP piensa en las máscaras de capa: blanco muestra, negro oculta. En CSS, por defecto, una máscara de imagen se lee en modo **alfa**: solo importa su transparencia. Un degradado de blanco a negro es opaco de punta a punta, así que no oculta nada.

[[exercise:08-en-la-mascara-cuenta-la-transparencia.md]]

`mask-mode: luminance` cambia al modo de luz: blanco se ve, negro no, los grises a medias. Es el modo por defecto de los `<mask>` de SVG; para imágenes y degradados, el alfa. En la práctica, lo más claro es escribir las máscaras con `black` (opaco) y `transparent`.

### Iconos que siguen el color del texto

La aplicación más común de las máscaras: un icono SVG de una sola tinta como máscara de una caja vacía pintada con `background-color: currentColor`. El icono toma el color del texto que lo rodea, cambia con el `:hover` y con un tema oscuro, y el archivo SVG no se toca.

[[exercise:09-iconos-con-mask.md]]

Estos iconos son decorativos (`aria-hidden="true"`), porque el texto del enlace ya dice lo que hace. Si el icono va solo, sin texto, el enlace necesita un nombre accesible: un texto visualmente oculto o un `aria-label`. Y si el icono es contenido, un SVG en línea con `fill="currentColor"` consigue lo mismo y además se puede describir.

## ¿`clip-path` o `mask`?

| | `clip-path` | `mask-image` |
|---|---|---|
| Qué define la forma | geometría (formas, trazados) | los píxeles de una imagen o un degradado |
| Bordes | nítidos | nítidos o suaves |
| Zonas ocultas y el ratón | no reciben eventos | siguen recibiendo el ratón: la máscara no cambia los clics |
| Coste | bajo | algo mayor (hay que generar la imagen de la máscara) |
| Se usa para | formas, recortes de secciones, avatares | fundidos, iconos, siluetas complejas |

Las dos crean un contexto de apilamiento y ninguna cambia el layout.

## Cómo verlo en DevTools

- **La caja completa.** Desactiva `clip-path` o `mask-image` con su casilla en **Styles**: verás el rectángulo real del elemento, que es lo que ocupa en el layout.
- **Ajustar una forma.** Selecciona un porcentaje de `polygon()` o `circle()` y cámbialo con las flechas del teclado; el recorte se mueve en directo.
- **La forma que rodea el texto.** En **Elements**, al pasar el ratón por un flotante con `shape-outside`, el resaltado de la página dibuja también la forma y su `shape-margin`.

## Bestiario

- **La curva se queda pequeña en pantallas anchas.** Síntoma: un borde ondulado con `path()` corta la caja por la mitad cuando crece. Causa: las coordenadas de `path()` son píxeles. Solución: `shape()` con porcentajes, o un `<clipPath>` de SVG con `objectBoundingBox`. → [ver ejemplo](03-path-no-se-adapta.md)
- **El botón no reacciona en sus esquinas.** Síntoma: con un botón recortado, el puntero en las zonas vacías no hace nada, y los vecinos no se acercan a la forma. Causa: el recorte no cambia la caja del layout, y lo recortado no recibe eventos. Solución: es lo esperado; deja un área de pulsación suficiente (al menos 24 × 24 visibles, mejor 44 × 44). → [ver ejemplo](04-el-recorte-no-cambia-la-caja.md)
- **El foco del teclado desaparece.** Síntoma: un botón con `clip-path` no muestra su sombra ni su `outline` al recibir el foco. Causa: el recorte también se come lo que se pinta fuera de la caja. Solución: la sombra con `drop-shadow()` y el anillo con `:has(:focus-visible)` en un envoltorio sin recorte. → [ver ejemplo](05-el-recorte-se-come-el-foco.md)
- **La máscara no oculta nada.** Síntoma: `mask-image: linear-gradient(white, black)` deja el elemento igual. Causa: por defecto la máscara se lee en modo alfa, y el blanco y el negro son opacos. Solución: degradados hacia `transparent`, o `mask-mode: luminance`. → [ver ejemplo](08-en-la-mascara-cuenta-la-transparencia.md)
- **El texto no sigue la forma recortada.** Síntoma: la foto se ve ovalada, pero el texto rodea un rectángulo (o al revés). Causa: `clip-path` y `shape-outside` son independientes, y además usan cajas de referencia distintas. Solución: la misma forma en las dos, con `border-box` en `shape-outside`. → [ver ejemplo](06-shape-outside-y-clip-path.md)

## Resumen

- `clip-path` recorta con una forma (`inset`, `circle`, `ellipse`, `polygon`, `path`, `shape`); los porcentajes se miden con la caja del borde.
- `path()` trabaja en píxeles; `shape()` dibuja curvas con porcentajes y se adapta a la caja.
- Recortar no cambia el layout, quita la zona recortada al ratón y se come las sombras y el `outline`: los efectos de fuera van en un envoltorio.
- `shape-outside` usa las mismas formas para que el texto rodee un flotante; para que coincida con `clip-path`, `border-box` en las dos.
- `mask-image` usa la transparencia de una imagen o un degradado: opaco se ve, transparente no; `mask-mode: luminance` usa la luz.
- Un SVG como máscara de una caja con `background-color: currentColor` da iconos que siguen el color del texto.

## Para profundizar

- [MDN: clip-path](https://developer.mozilla.org/es/docs/Web/CSS/clip-path)
- [MDN: mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN: shape-outside](https://developer.mozilla.org/es/docs/Web/CSS/shape-outside)
- [Chrome for Developers: Use shape() for responsive clipping](https://developer.chrome.com/blog/css-shape)
- [Especificación: CSS Masking Level 1](https://www.w3.org/TR/css-masking-1/)
