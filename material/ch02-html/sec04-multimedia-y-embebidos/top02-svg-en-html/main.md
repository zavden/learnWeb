# SVG en HTML

## Por qué importa

Iconos, logotipos, gráficos, mapas, ilustraciones: buena parte de lo que se dibuja en una web no es una foto, sino **formas**. SVG (*Scalable Vector Graphics*) describe esas formas con texto: «un círculo aquí, de este radio y este color». El navegador las vuelve a dibujar a cualquier tamaño, así que se ven nítidas en un móvil, en una pantalla Retina y en un cartel, y suelen pesar menos que una imagen equivalente.

En la lección de imágenes usaste un SVG como cualquier otra imagen, con `<img src="logo.svg">`. Aquí lo escribirás **dentro del HTML**. Así, cada forma es un elemento del documento: el CSS la alcanza (colores, estados, temas oscuros), JavaScript puede cambiarla y el texto que contiene es texto de verdad, que se selecciona, se traduce y se lee en voz alta.

## SVG dentro del HTML

Un elemento `<svg>` escrito en un documento HTML abre un pequeño mundo con sus propias etiquetas (`<circle>`, `<rect>`, `<path>`…). No necesita el atributo `xmlns` ni un archivo aparte: el parser de HTML sabe que todo lo que hay dentro es SVG.

[[exercise:01-svg-inline.md]]

Los dos soles son el mismo dibujo con distinto `width` y `height`: el grande no se ve borroso, porque el navegador no estira píxeles, sino que vuelve a dibujar las formas. Y la regla `.sun:hover` del CSS de la página cambia el color del círculo: eso no se puede hacer con un SVG cargado con `<img>`.

| | `<img src="dibujo.svg">` | SVG dentro del HTML |
|---|---|---|
| El CSS de la página llega a sus formas | no | sí |
| JavaScript puede cambiarlo | no | sí |
| El navegador lo guarda en caché y lo reutiliza entre páginas | sí | no (viaja con cada página) |
| Texto alternativo | `alt` | `role="img"` + `<title>` (al final de la lección) |
| Úsalo para | ilustraciones y logos que no cambian | iconos que siguen al texto, gráficos, dibujos interactivos |

## Coordenadas y `viewBox`

Dentro de un SVG, cada forma se coloca con **coordenadas**: el origen `(0, 0)` está **arriba a la izquierda**, `x` crece hacia la derecha e `y` crece **hacia abajo**, al revés que en los ejes de matemáticas o en una gráfica de `matplotlib`. Un punto con `y = 30` está 30 unidades por debajo del borde superior.

El atributo `viewBox="x y ancho alto"` decide **qué parte** de ese plano infinito se muestra, y el navegador ajusta esa parte al tamaño del `<svg>` en la página (`width` y `height`). Con `viewBox="0 0 100 100"` dibujas en un lienzo de 100 × 100 unidades, sin pensar en píxeles: a 150 px, cada unidad mide 1,5 px; a 300 px, mide 3.

[[exercise:02-viewbox-y-coordenadas.md]]

Cambiar el `viewBox` sin tocar el dibujo es una cámara: `viewBox="50 0 50 50"` encuadra solo el cuarto de arriba a la derecha y lo amplía al tamaño del `<svg>` (un zoom ×2). Moviendo los dos primeros números, la cámara se desplaza; así se programan zooms y desplazamientos en mapas y gráficos.

Si la caja del `<svg>` y su `viewBox` no tienen la misma proporción, el dibujo **no se deforma**: se escala hasta caber entero y se centra, con espacio a los lados (como una película panorámica en una tele cuadrada). Lo controla el atributo `preserveAspectRatio`: `xMidYMid meet` es el valor por defecto, `slice` recorta en lugar de dejar espacio y `none` estira y deforma. Y si no escribes `width` ni `height`: sin `viewBox`, el `<svg>` mide 300 × 150 píxeles, como un `<canvas>` o un `<iframe>`; con `viewBox`, ocupa todo el ancho disponible y calcula el alto con la proporción del `viewBox`.

Sin `viewBox`, en cambio, **1 unidad es siempre 1 píxel**: `width` y `height` solo cambian el tamaño de la ventana por la que se mira el dibujo, que se recorta o se queda pequeño en una esquina. Es el fallo más común al copiar un icono:

[[exercise:03-sin-viewbox-no-escala.md]]

## Formas básicas

SVG tiene seis formas con atributos propios. Todas se colocan en coordenadas del `viewBox` y se escriben como elementos vacíos que se cierran con `/>` (dentro de un SVG la barra sí significa algo: es la sintaxis de XML).

| Elemento | Atributos | Dibuja |
|---|---|---|
| `<rect>` | `x`, `y`, `width`, `height`, `rx`, `ry` | un rectángulo desde su esquina superior izquierda; `rx` redondea las esquinas |
| `<circle>` | `cx`, `cy`, `r` | un círculo desde su centro |
| `<ellipse>` | `cx`, `cy`, `rx`, `ry` | una elipse con dos radios |
| `<line>` | `x1`, `y1`, `x2`, `y2` | un segmento (solo borde) |
| `<polyline>` | `points="x,y x,y …"` | una línea quebrada abierta |
| `<polygon>` | `points="x,y x,y …"` | una figura cerrada |

[[exercise:04-formas-basicas.md]]

`<text x y>` escribe texto con su línea base en `(x, y)`; `text-anchor="middle"` lo centra en ese punto. Es texto real: se puede seleccionar y buscar con ⌘F.

## `path`: el trazado universal

`<path>` dibuja cualquier forma, y es lo que exportan los programas de diseño (Figma, Illustrator, Inkscape): casi todos los iconos son un `<path>` con un atributo `d` lleno de números. Ese `d` es una lista de **comandos** de una letra, cada uno con sus coordenadas, como las órdenes que darías a un lápiz:

| Comando | Significado | Ejemplo |
|---|---|---|
| `M x y` | mueve el lápiz sin pintar (*move*) | `M 20 140` |
| `L x y` | recta hasta (x, y) (*line*) | `L 60 40` |
| `H x`, `V y` | recta horizontal o vertical | `V 80` |
| `C x1 y1, x2 y2, x y` | curva de Bézier cúbica con dos puntos de control | `C 250 40, 350 40, 350 140` |
| `S x2 y2, x y` | curva cúbica que continúa suave la anterior | `S 400 200, 450 140` |
| `Q x1 y1, x y` | curva de Bézier cuadrática, un punto de control | `Q 50 0, 100 50` |
| `A rx ry giro arco-grande sentido x y` | arco de elipse hasta (x, y) | `A 40 40 0 0 1 460 140` |
| `Z` | cierra la figura | `Z` |

En **mayúscula**, las coordenadas son absolutas (posiciones del `viewBox`); en **minúscula**, relativas al punto anterior (`l 40 -40`: 40 a la derecha y 40 hacia arriba). Las dos casas del ejemplo son el mismo trazado escrito de las dos maneras:

[[exercise:05-path-comandos.md]]

Los puntos de control de una curva de Bézier no están en la curva: tiran de ella, como imanes. No hace falta escribir trazados complejos a mano (para eso están los editores), pero sí saber leerlos para retocar un icono, entender por qué se ve cortado o animarlo.

## Relleno y borde: `fill` y `stroke`

Cada forma tiene un **relleno** (`fill`) y un **borde** (`stroke`). Se escriben como atributos (`fill="#bae6fd"`) o en el CSS (`fill: #bae6fd`); si hay las dos cosas, **gana el CSS**, porque los atributos de presentación de SVG tienen la prioridad más baja de todas.

| Propiedad | Qué controla | Valor por defecto |
|---|---|---|
| `fill` | color de relleno (`none` = sin relleno) | `black` |
| `stroke` | color del borde | `none` (sin borde) |
| `stroke-width` | grosor del borde | `1` |
| `stroke-linecap` | final de las líneas: `butt`, `round`, `square` | `butt` |
| `stroke-linejoin` | esquinas: `miter`, `round`, `bevel` | `miter` |
| `stroke-dasharray` | trazos y huecos: `12 6` | sin discontinuidad |
| `fill-opacity`, `stroke-opacity`, `opacity` | transparencias de 0 a 1 | `1` |

[[exercise:06-fill-y-stroke.md]]

Fíjate en el rectángulo de abajo: el borde va **centrado** sobre el contorno, la mitad por dentro y la mitad por fuera. Si una forma toca el borde del `viewBox`, la mitad de su `stroke` queda fuera y se recorta. Por eso muchos iconos dejan un margen de una o dos unidades.

Los valores por defecto de la tabla esconden dos sorpresas: una línea sin `stroke` es invisible, y una línea quebrada sin `fill="none"` se rellena de negro, aunque esté abierta.

[[exercise:07-linea-invisible.md]]

## `currentColor`: iconos que siguen al texto

`currentColor` es un color especial que vale «el color del texto de este elemento», la propiedad `color` del CSS, que se hereda de los elementos que lo contienen. Un icono con `fill="currentColor"` (o `stroke`) se pinta del color del texto que lo rodea: si el enlace cambia de color al pasar el ratón, o el botón al recibir el foco, o la página pasa a un tema oscuro, el icono cambia con él sin tocar el SVG.

[[exercise:08-currentcolor.md]]

Es la forma estándar de hacer iconos: se dibujan una vez, con `currentColor`, y su color lo decide el CSS del sitio donde se usan.

## Reutilizar: `symbol` y `use`

Copiar el mismo `<path>` en cada sitio donde aparece un icono engorda el HTML y obliga a cambiarlo en todas partes. La solución es un **sprite**: un `<svg>` oculto que define cada icono una sola vez como `<symbol>`, con su `id` y su propio `viewBox`. Un `<symbol>` no se dibuja: es un molde. Cada uso es un `<svg>` pequeño con `<use href="#id">`, que dibuja una copia del molde al tamaño de ese `<svg>`.

```html
<svg class="sprite"><symbol id="icon-drop" viewBox="0 0 24 24">…</symbol></svg>
…
<svg class="icon" aria-hidden="true"><use href="#icon-drop"/></svg>
```

[[exercise:09-sprite-con-symbol-y-use.md]]

La copia vive en un árbol aparte (un *shadow tree*): el CSS de la página no puede seleccionar sus formas una a una, pero sí les llegan las propiedades heredadas, como `color`. Por eso el sprite usa `currentColor`, y cada `<li>` decide de qué color son sus copias. Un sprite también puede estar en un archivo aparte (`<use href="icons.svg#icon-drop">`), con una condición: debe venir del **mismo origen** que la página, porque `<use>` no carga dibujos de otros sitios.

## SVG accesible

Un `<svg>` dentro del HTML no tiene `alt`. Según lo que sea, se trata de una de estas tres maneras:

- **Informativo** (un gráfico, un mapa, un logotipo con nombre): `role="img"` para que se anuncie como una sola imagen, un `<title>` como primer hijo con su nombre y, si hace falta, un `<desc>` con una descripción más larga (en un gráfico, los datos). Enlázalos con `aria-labelledby` y `aria-describedby`: así los leen todos los lectores de pantalla. El `<title>` es además el *tooltip* que aparece al dejar el ratón encima.
- **Decorativo** (un icono junto a un texto que ya lo dice todo): `aria-hidden="true"`, para que no se anuncie «imagen» sin más.
- **Icono dentro de un botón o enlace sin texto**: el **nombre va en el botón** (`aria-label` o un texto oculto visualmente, como en la lección de accesibilidad) y el icono lleva `aria-hidden="true"`.

[[exercise:10-svg-accesible.md]]

Para comprobarlo, selecciona cada elemento en DevTools → Elements y abre la pestaña **Accessibility**: muestra su rol y su nombre accesible. Cuida también el contraste: las formas que transmiten información (las barras de un gráfico, el contorno de un icono) necesitan al menos 3:1 con el fondo.

## ¿Cuándo usar cada cosa?

| Necesitas… | Usa |
|---|---|
| una ilustración o un logotipo que no cambia | `<img src="dibujo.svg" alt="…">` |
| iconos que siguen el color del texto | SVG en el HTML con `currentColor`, mejor en un sprite |
| un gráfico, un mapa o un dibujo que el CSS o JavaScript cambian | SVG en el HTML |
| miles de puntos o una animación píxel a píxel | `<canvas>` (siguiente lección) |

## Bestiario

- **El icono se ve recortado o diminuto.** Síntoma: al cambiar `width` y `height`, el dibujo no crece ni encoge: se corta o se queda en una esquina. Causa: el `<svg>` no tiene `viewBox`, así que 1 unidad es siempre 1 píxel. Solución: añade el `viewBox` del lienzo en el que se dibujó (`viewBox="0 0 24 24"` en la mayoría de iconos). → [ver ejemplo](03-sin-viewbox-no-escala.md)
- **La línea no aparece y el gráfico sale negro.** Síntoma: un `<line>` invisible; un `<polyline>` convertido en una mancha negra. Causa: los valores por defecto, `stroke: none` y `fill: black`. Solución: `stroke` en las líneas y `fill="none"` en las líneas quebradas y los trazados abiertos. → [ver ejemplo](07-linea-invisible.md)

## Resumen

- Un `<svg>` dentro del HTML forma parte del documento: el CSS y JavaScript llegan a sus formas, y se ve nítido a cualquier tamaño.
- Coordenadas desde arriba a la izquierda, con `y` hacia abajo; `viewBox` elige qué parte se ve y la ajusta a `width` × `height`. Sin `viewBox`, no escala.
- Formas básicas: `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`; `path` dibuja cualquier forma con comandos (mayúsculas absolutas, minúsculas relativas).
- `fill` rellena (negro por defecto) y `stroke` dibuja el borde, centrado sobre el contorno (ninguno por defecto); el CSS gana a los atributos.
- `currentColor` pinta los iconos del color del texto; `symbol` + `use` los reutiliza desde un sprite.
- Accesible: `role="img"` + `<title>` (y `<desc>`) si informa; `aria-hidden="true"` si decora; en un botón de solo icono, el nombre va en el botón.

## Para profundizar

- [MDN: Tutorial de SVG](https://developer.mozilla.org/es/docs/Web/SVG/Tutorial)
- [MDN: el atributo `d` y los comandos de `path`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d)
- [MDN: `viewBox`](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox)
- [CSS-Tricks: Accessible SVGs](https://css-tricks.com/accessible-svgs/)
- [MDN: Añadir gráficos vectoriales a la web](https://developer.mozilla.org/es/docs/Learn/HTML/Multimedia_and_embedding/Adding_vector_graphics_to_the_Web)
