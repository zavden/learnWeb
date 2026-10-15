# Degradados

## Por qué importa

Hasta ahora, cada caja de este curso tenía un color de fondo liso o una imagen de un archivo. Los **degradados** son una tercera vía: imágenes que el navegador **genera** a partir de unos pocos colores, al tamaño exacto de la caja, sin descargar nada. Con ellos se dibujan fondos con profundidad, velos que hacen legible el texto sobre una foto, rayas, cuadrículas, gráficos de tarta y hasta tableros de ajedrez.

En la lección de fondos del módulo del modelo de cajas quedó una promesa pendiente: los degradados son imágenes y se apilan como cualquier otra capa de fondo. Esta lección la cumple, y explica tres sorpresas clásicas: la diagonal que no llega a la esquina, el gris sucio en el centro de un degradado y el fondo del `body` que se repite en franjas.

Este módulo tiene cinco lecciones: los degradados; los filtros y las mezclas de color; los recortes y las máscaras; las transformaciones (mover, girar, escalar) y las transformaciones en 3D. Todos los efectos son **estáticos**: las transiciones y las animaciones llegan en el módulo de animación. Cuando un ejemplo cambia algo al pasar el ratón, el cambio es instantáneo.

> Los ejemplos describen lo que ves en **Chrome para Mac**. Los efectos de este módulo funcionan igual en todos los navegadores actuales, salvo donde se indica.

## Un degradado es una imagen

Un degradado no es un color: es una **imagen** sin tamaño propio. El navegador la genera para la caja en la que se usa, así que va donde va una imagen (`background-image`, o el atajo `background`) y nunca en `background-color`, que solo acepta un color. Escribirlo ahí es una declaración inválida y, como cualquier CSS inválido, se ignora en silencio.

```css
.hero {
  background-image: linear-gradient(#1d4ed8, #f59e0b);   /* ✅ una imagen */
  background-color: linear-gradient(#1d4ed8, #f59e0b);   /* ❌ inválido: se ignora */
}
```

Hay tres familias, cada una con su versión que se repite:

| Función | Cómo avanzan los colores | Se usa para |
|---|---|---|
| `linear-gradient()` | a lo largo de una línea recta | fondos, velos, rayas, barras |
| `radial-gradient()` | desde un centro hacia fuera, en círculos o elipses | brillos, focos, lunares |
| `conic-gradient()` | alrededor de un centro, como las agujas de un reloj | gráficos de tarta, ruedas de color, tableros |
| `repeating-*-gradient()` | igual, pero repitiendo un tramo | rayas, anillos, rayos |

Como son imágenes, también sirven en cualquier otra propiedad que acepte una: en `mask-image` (lección de recortes y máscaras), en `border-image` o en `list-style-image`.

## `linear-gradient()`

La forma más simple recibe solo colores: el degradado baja de arriba abajo. Para cambiar la dirección, delante de los colores va una palabra clave (`to right`, `to top`, `to bottom left`) o un **ángulo**:

- `0deg` apunta **hacia arriba** y los grados crecen en el **sentido de las agujas del reloj**: `90deg` es hacia la derecha, `180deg` hacia abajo (el valor por defecto), `270deg` hacia la izquierda.
- Es el sentido de una brújula, no el de las matemáticas del colegio (donde 0° apunta a la derecha y se gira al revés). Si vienes de dibujar con Python y `matplotlib`, cuidado.
- También valen otras unidades de ángulo: `0.25turn` es `90deg`.

[[exercise:01-degradado-lineal.md]]

## Las paradas de color

Cada color de la lista es una **parada** (*color stop*), y puede llevar una posición a lo largo de la línea del degradado, en porcentaje o en una longitud:

```css
linear-gradient(to right, #1d4ed8 25%, #f59e0b 75%)
/*                         ↑ azul liso hasta el 25 %; de ahí al 75 %, la mezcla */
```

Las reglas que deciden dónde cae cada parada:

- Sin posición, la primera parada va al `0%`, la última al `100%` y las del medio se reparten a partes iguales entre sus vecinas.
- Antes de la primera parada y después de la última, el color es **liso**.
- Una posición suelta entre dos colores es una **pista** (*color hint*): marca dónde está la mezcla a partes iguales.
- Dos paradas en la misma posición hacen un borde nítido: una **parada dura** (*hard stop*). Un color con dos posiciones (`#f59e0b 40% 70%`) ocupa todo ese tramo.
- Si una parada tiene una posición **menor** que la anterior, se ajusta a la anterior. Por eso `0` significa «aquí mismo», y una barra de progreso se escribe `linear-gradient(to right, #16a34a 62%, #e2e8f0 0)`.

[[exercise:02-paradas-de-color.md]]

> **Desde Python:** el navegador «arregla» las posiciones de la lista antes de dibujar. Esta función reproduce las tres reglas (extremos, ajuste a la anterior y reparto de las que faltan):

```python
def fix_stops(stops):
    """stops: lista de (color, posición en % o None)."""
    positions = [pos for _, pos in stops]
    if positions[0] is None:
        positions[0] = 0
    if positions[-1] is None:
        positions[-1] = 100
    highest = positions[0]
    for i, pos in enumerate(positions):          # una posición menor se ajusta a la anterior
        if pos is not None:
            highest = max(highest, pos)
            positions[i] = highest
    i = 0
    while i < len(positions):                     # los huecos se reparten a partes iguales
        if positions[i] is None:
            start = i - 1
            end = i
            while positions[end] is None:
                end += 1
            step = (positions[end] - positions[start]) / (end - start)
            for k in range(start + 1, end):
                positions[k] = positions[start] + step * (k - start)
            i = end
        i += 1
    return [(color, pos) for (color, _), pos in zip(stops, positions)]

print(fix_stops([("azul", None), ("ámbar", None), ("rojo", None)]))
print(fix_stops([("verde", 62), ("gris", 0)]))
print(fix_stops([("azul", None), ("ámbar", 80), ("rojo", None), ("negro", None)]))
```

```text
[('azul', 0), ('ámbar', 50.0), ('rojo', 100)]
[('verde', 62), ('gris', 62)]
[('azul', 0), ('ámbar', 80), ('rojo', 90.0), ('negro', 100)]
```

### Ángulos y esquinas

¿Dónde están el `0%` y el `100%` de un degradado inclinado? La **línea del degradado** pasa por el centro de la caja con el ángulo pedido, y su longitud es la justa para que las líneas perpendiculares del `0%` y del `100%` toquen dos esquinas opuestas. Por eso las esquinas tienen siempre el primer y el último color exactos, sea cual sea el ángulo.

Lo que no hace un ángulo es adaptarse a la forma de la caja: `45deg` forma 45° con la pantalla. En una caja apaisada, la mitad del degradado ya no va de esquina a esquina. Las palabras clave de esquina (`to top right`) sí se adaptan: el navegador calcula el ángulo para que la línea del `50%` sea justo la diagonal entre las **otras** dos esquinas.

[[exercise:03-la-diagonal-que-no-llega-a-la-esquina.md]]

## `radial-gradient()`

Un degradado radial crece desde un centro. Antes de los colores admite tres datos, todos opcionales:

```css
radial-gradient(circle closest-side at 30% 35%, #ffffff, #1e3a8a)
/*              forma  tamaño        centro */
```

- **Forma**: `ellipse` (por defecto, con las proporciones de la caja) o `circle`.
- **Tamaño**: hasta dónde llega el `100%`. Con palabras clave: `closest-side`, `farthest-side`, `closest-corner` o `farthest-corner` (por defecto: la elipse que pasa por la esquina más lejana). O con longitudes: `circle 40px`, `ellipse 80px 40px`.
- **Centro**: `at` seguido de una posición, con la sintaxis de `background-position` (`at top left`, `at 30% 35%`).

[[exercise:04-radial-gradient.md]]

Un detalle útil: una parada dura al `100%` de `circle closest-side` dibuja un disco perfecto que toca los lados más cercanos de la caja, sin necesidad de `border-radius`.

## `conic-gradient()` y los gráficos de tarta

Un degradado cónico reparte los colores **alrededor** de un centro, como las horas de un reloj: empieza arriba y gira en sentido horario. `from` cambia el ángulo de salida (`from 90deg` empieza a la derecha) y `at`, el centro. Las posiciones pueden ser ángulos (`120deg`) o porcentajes de la vuelta (`25%` es un cuarto, `90deg`).

Con paradas duras, cada color ocupa una porción: un **gráfico de tarta** con una sola línea de CSS. El truco del `0` hace que el código se lea como una suma acumulada: cada parada dice dónde **acaba** su porción.

[[exercise:05-grafico-de-tarta-con-conic.md]]

Un gráfico hecho con un fondo es invisible para un lector de pantalla y no se puede seleccionar ni copiar. Tres reglas:

- Los datos van también en **texto**: una leyenda con los porcentajes, una tabla o, como mínimo, un `role="img"` con un `aria-label` que los diga. Si la leyenda ya los tiene, la tarta puede llevar `aria-hidden="true"` para que no se anuncie dos veces.
- El color nunca es la única pista: cada porción tiene su nombre en la leyenda.
- Dos porciones vecinas necesitan un contraste de al menos **3:1** entre sí (el mínimo para elementos gráficos). Alternar colores oscuros y claros lo consigue; compruébalo con `node scripts/contrast.mjs` o con el selector de color de DevTools.

## Degradados que se repiten

`repeating-linear-gradient()`, `repeating-radial-gradient()` y `repeating-conic-gradient()` toman el tramo que va de la **primera** a la **última** parada y lo repiten hasta llenar la caja. Con paradas duras, el tramo se convierte en rayas, anillos o rayos:

```css
repeating-linear-gradient(-45deg, #facc15 0 14px, #1e293b 14px 28px)
/*                                el tramo: de 0 a 28px, repetido */
```

[[exercise:06-degradados-repetidos.md]]

La trampa: sin posiciones, la primera parada está en `0%` y la última en `100%`, el tramo es la caja entera y no hay nada que repetir.

## Patrones con `background-size`

Hay otra forma de repetir, y es la más flexible: como un degradado es una imagen, `background-size` le da un tamaño de **baldosa**, y `background-repeat: repeat` (el valor inicial) la repite. Un punto en el centro de una baldosa de 20 × 20 se convierte en una tela de lunares; una línea de 1px arriba de cada baldosa, en un cuaderno de rayas; y dos de ellas apiladas, en papel cuadriculado.

[[exercise:07-patrones-con-background-size.md]]

Aquí se cumple la promesa del módulo del modelo de cajas: los degradados se apilan exactamente igual que las imágenes de un fondo multicapa. Cada propiedad `background-*` es una lista, la posición N de cada lista corresponde a la capa N, la **primera capa se pinta encima** y el color va siempre al fondo. Puedes mezclar en la misma lista degradados y archivos: `background-image: linear-gradient(…), url("foto.jpg")`.

Los patrones con degradados tienen un límite práctico: cada píxel se calcula al pintar, así que un patrón complicado de muchas capas sobre una caja enorme cuesta más que una imagen pequeña repetida. Para fondos decorativos normales, la diferencia no se nota.

## En qué espacio se mezclan los colores

Entre dos paradas, el navegador calcula los colores intermedios. En la lección de color del primer módulo viste que `color-mix(in oklch, …)` elige el **espacio de color** en el que se mezcla; los degradados aceptan lo mismo, con `in` delante de los colores: `linear-gradient(in oklch to right, blue, yellow)`.

¿Y si no escribes `in`? Depende de los colores:

- Si **todos** son colores «clásicos» (nombres, hexadecimal, `rgb()`, `hsl()`), se mezclan en **sRGB**, canal a canal, como han hecho los navegadores desde siempre. Cambiarlo habría alterado millones de páginas.
- Si alguno es moderno (`oklch()`, `oklab()`, `color()`…), el espacio por defecto es **Oklab**.

Mezclar en sRGB tiene un defecto visible: entre dos colores opuestos, el camino recto por el cubo RGB pasa por el centro, y el centro del cubo es **gris**. De azul `(0, 0, 255)` a amarillo `(255, 255, 0)`, la mitad es `(128, 128, 128)`.

[[exercise:08-el-gris-en-el-centro.md]]

| Espacio | Cómo mezcla | De azul a amarillo, la mitad es… |
|---|---|---|
| `srgb` (clásico) | canal a canal en RGB | gris puro, `#808080` |
| `oklab` | en un espacio perceptual, en línea recta | un azul grisáceo más claro |
| `oklch` | claridad, croma y tono por separado | turquesa intenso (el tono gira por el camino corto) |
| `oklch longer hue` | igual, por el camino largo del círculo de tonos | rosa intenso (pasa por magenta y rojo) |

Los espacios polares (`oklch`, `hsl`, `lch`) aceptan un **método de tono**: `shorter hue` (por defecto), `longer hue`, `increasing hue` o `decreasing hue`. Con `longer hue` y el mismo color al principio y al final, el degradado da la vuelta completa: `linear-gradient(in hsl longer hue to right, red, red)` es un arcoíris.

¿Cuál usar? `in oklch` cuando quieras colores vivos de principio a fin; `in oklab` para fundidos suaves entre colores parecidos (de un azul a otro), donde `oklch` puede desviarse por tonos intermedios. Y si un degradado de colores clásicos se ve sucio en el centro, prueba primero `in oklab` o `in oklch` antes de añadir paradas a mano.

## Texto sobre una foto: el velo

Un texto blanco sobre una foto se lee en las zonas oscuras y desaparece en las claras. La solución más común es un **velo** (*scrim*): un degradado oscuro entre la foto y el texto, como primera capa del mismo fondo. Para que el contraste no dependa de la foto, calcula el peor caso: el velo, sobre un píxel **blanco**, tiene que dar un color con el que el texto alcance 4.5:1. Con un azul noche (`#0f172a`), basta un 60 % de opacidad; el ejemplo usa al menos un 70 % bajo todo el texto.

[[exercise:10-texto-legible-sobre-una-foto.md]]

El velo se funde con `transparent`. En artículos antiguos verás que se desaconseja: `transparent` es `rgb(0 0 0 / 0)`, un **negro** transparente, y los navegadores de entonces mezclaban el color y el alfa por separado, así que el camino de blanco a `transparent` pasaba por un gris oscuro semitransparente. Hoy todos mezclan con el **alfa premultiplicado** (multiplican cada canal por su alfa antes de mezclar): un color con alfa 0 no aporta nada, y `transparent` funciona como esperas.

## El degradado del `body` que se repite en franjas

En la lección de fondos viste que el fondo del `<body>` se propaga al lienzo y pinta toda la ventana. Lo que no viste es la letra pequeña: las **imágenes** de ese fondo se miden y se colocan con la caja de `<html>`, que solo es tan alta como el contenido. En una página corta, el degradado mide 160px y se repite en franjas hasta abajo.

[[exercise:09-el-degradado-del-body-se-repite.md]]

La solución más limpia es `html { min-height: 100% }`: la caja de `<html>` mide al menos lo que la ventana. Si prefieres que el degradado no se mueva al hacer scroll, `background-attachment: fixed` lo mide con la ventana.

## Cómo verlo en DevTools

- **Los colores de un degradado.** En **Styles**, cada color del degradado tiene su muestra. Haz clic para cambiarlo con el selector, o <kbd>Shift</kbd> + clic en la muestra para pasar de una notación a otra (hexadecimal, `rgb()`, `hsl()`, `oklch()`…).
- **Probar posiciones.** Selecciona un porcentaje y cámbialo con las flechas del teclado (<kbd>Shift</kbd>, de 10 en 10): la parada se mueve en directo.
- **Gráficos y daltonismo.** En el menú ⋮ → **More tools** → **Rendering**, la opción **Emulate vision deficiencies** simula cómo ven la página las personas con distintos tipos de daltonismo o visión borrosa. Es la prueba rápida de un gráfico de tarta.

## Bestiario

- **El degradado no aparece.** Síntoma: la caja se queda sin fondo. Causa: el degradado está en `background-color`, que solo acepta colores; la declaración es inválida y se ignora. Solución: `background-image` o el atajo `background`. → [ver ejemplo](01-degradado-lineal.md)
- **La diagonal no llega a la esquina.** Síntoma: en una caja apaisada, un degradado de `45deg` con una parada dura corta la caja por el medio y deja las esquinas de un solo color. Causa: un ángulo se mide respecto a la pantalla, no a la caja. Solución: las palabras clave de esquina (`to top right`), que calculan el ángulo de la diagonal. → [ver ejemplo](03-la-diagonal-que-no-llega-a-la-esquina.md)
- **Un gris sucio en el centro del degradado.** Síntoma: entre dos colores vivos y opuestos, el centro se ve gris o marrón. Causa: con colores clásicos, la mezcla se hace en sRGB y el camino recto pasa por el gris. Solución: `in oklch` (o `in oklab`) delante de los colores. → [ver ejemplo](08-el-gris-en-el-centro.md)
- **El fondo de la página se repite en franjas.** Síntoma: un degradado en el `body` de una página corta se ve como una persiana. Causa: la imagen se mide con la caja de `<html>`, que mide lo que el contenido, y se repite. Solución: `html { min-height: 100% }` o `background-attachment: fixed`. → [ver ejemplo](09-el-degradado-del-body-se-repite.md)
- **El degradado repetido no se repite.** Síntoma: `repeating-linear-gradient(azul, blanco)` da un degradado normal. Causa: sin posiciones, el tramo que se repite va del 0 al 100 %. Solución: paradas con longitudes (`azul 0 10px, blanco 10px 20px`). → [ver ejemplo](06-degradados-repetidos.md)

## Resumen

- Un degradado es una imagen generada al tamaño de la caja: va en `background-image`, se apila con otras capas (la primera, encima) y sirve en cualquier propiedad que acepte imágenes.
- `linear-gradient()` avanza en línea recta (`0deg` arriba, en sentido horario); `radial-gradient()`, desde un centro; `conic-gradient()`, alrededor de un centro, empezando arriba.
- Las paradas sin posición se reparten solas; dos en el mismo punto hacen un borde nítido, y una posición menor que la anterior se ajusta a ella (`0`).
- Las versiones `repeating-*` repiten el tramo entre la primera y la última parada; `background-size` convierte cualquier degradado en una baldosa para patrones.
- Con colores clásicos, la mezcla es en sRGB y puede pasar por el gris; `in oklch` o `in oklab` eligen otro espacio, y `longer hue` da la vuelta larga al círculo de tonos.
- Un gráfico hecho con un degradado necesita sus datos en texto; un texto sobre una foto, un velo calculado para el peor caso.

## Para profundizar

- [MDN: Usar degradados CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_images/Using_CSS_gradients)
- [MDN: color-interpolation-method](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method)
- [web.dev: Gradients (Learn CSS)](https://web.dev/learn/css/gradients)
- [Josh W. Comeau: Make Beautiful Gradients in CSS](https://www.joshwcomeau.com/css/make-beautiful-gradients/)
- [Especificación: CSS Images Level 4](https://www.w3.org/TR/css-images-4/)
