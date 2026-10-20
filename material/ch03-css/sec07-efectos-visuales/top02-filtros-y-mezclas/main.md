# Filtros y mezclas

## Por qué importa

Hasta aquí, CSS decidía **qué** se pintaba: colores, bordes, fondos, texto. Esta lección trata de lo que pasa **después** de pintar: el navegador puede tomar la imagen ya dibujada de un elemento y procesarla como un programa de retoque. Desenfocarla, pasarla a blanco y negro, darle una sombra que siga su silueta, o mezclar sus colores con lo que hay debajo, como las capas de Photoshop o GIMP.

También cumple dos promesas. En la lección de sombras del módulo del modelo de cajas viste que `filter: drop-shadow()` sigue la forma real del contenido y no la caja; aquí lo verás funcionar. Y en la lección de `z-index`, la tabla de lo que crea un contexto de apilamiento incluía `opacity`, `filter`, `backdrop-filter` y `mix-blend-mode` sin explicar por qué. La razón es la misma para todos, y está en la sección «Por qué un efecto aísla al elemento».

## `filter`: procesar los píxeles ya pintados

`filter` recibe una lista de funciones y las aplica a la imagen **completa** del elemento: su fondo, sus bordes, su texto y todos sus descendientes. No cambia el tamaño de la caja ni mueve nada en el layout; solo cambia cómo se ve.

| Función | Qué hace | Valores |
|---|---|---|
| `blur(3px)` | desenfoca | un radio; `0` no hace nada |
| `brightness(1.5)` | más o menos luz | `1` igual, `0` negro, más de `1` más claro |
| `contrast(1.8)` | más o menos contraste | `1` igual, `0` gris uniforme |
| `saturate(3)` | más o menos color | `1` igual, `0` gris |
| `grayscale(1)` | a escala de grises | de `0` (nada) a `1` (todo); también `%` |
| `sepia(1)` | tono de foto antigua | de `0` a `1` |
| `invert(1)` | negativo | de `0` a `1` |
| `hue-rotate(180deg)` | gira todos los tonos | un ángulo |
| `opacity(0.35)` | transparencia | como la propiedad `opacity` |
| `drop-shadow(…)` | sombra con la silueta | la sintaxis de `box-shadow`, sin `inset` ni extensión |
| `url(#id)` | un filtro SVG definido en la página | lo que permita SVG (`<filter>`) |

Los filtros de CSS trabajan en el espacio sRGB, canal a canal: `brightness(0.4)` convierte un blanco (255) en un gris de 102. Ese dato es útil para calcular contrastes.

[[exercise:01-funciones-de-filter.md]]

### Una lista que se aplica en orden

Las funciones de la lista se aplican de **izquierda a derecha**, cada una sobre el resultado de la anterior. El orden importa: `sepia(1) grayscale(1)` acaba en gris (el gris llega el último y borra el sepia), y `grayscale(1) sepia(1)` acaba en sepia.

[[exercise:02-el-orden-de-los-filtros.md]]

> **Desde Python:** una lista de filtros es una composición de funciones. `filter: a() b() c()` equivale a `c(b(a(imagen)))`, o a `functools.reduce(lambda img, f: f(img), [a, b, c], imagen)`. Como en matemáticas, componer no es conmutativo: `grayscale(sepia(x))` no es `sepia(grayscale(x))`.

### Una sola propiedad: la lista se sustituye entera

`filter` es **una** propiedad cuyo valor es una lista. Si otra regla gana en la cascada (un `:hover`, una clase de estado), su lista sustituye a la anterior **completa**: no se suman. Es el mismo comportamiento que viste con `font-variation-settings` en el módulo de tipografía, y lo verás otra vez con `transform`.

[[exercise:03-un-filter-sustituye-al-otro.md]]

Dos soluciones: repetir la lista entera en cada estado (`filter: grayscale(1) brightness(1.3)`) o escribirla una vez con una custom property por función (`filter: grayscale(1) brightness(var(--photo-brightness, 1))`) y cambiar solo la variable. La segunda escala mejor cuando hay varios estados.

## `drop-shadow()` frente a `box-shadow`

`box-shadow` dibuja la sombra de la **caja**: un rectángulo, con el `border-radius` si lo hay. Le da igual lo que haya pintado dentro. `drop-shadow()` es un filtro: toma la imagen ya pintada, usa su **transparencia** como silueta, la desplaza, la difumina y la pone debajo. La sombra sigue la forma real de lo que se ve: un logotipo con el fondo transparente (un PNG o un SVG), el contorno de un texto o una caja con una flecha que sobresale.

[[exercise:04-drop-shadow-sigue-la-forma.md]]

| | `box-shadow` | `filter: drop-shadow()` |
|---|---|---|
| Forma | la caja (con `border-radius`) | la silueta de lo pintado (canal alfa) |
| Extensión (*spread*) e `inset` | sí | no |
| Varias sombras | separadas por comas, independientes | varias funciones en la lista; cada una hace sombra también de las anteriores |
| Incluye a los hijos y `::before`/`::after` | no | sí, todo lo pintado |
| Coste | bajo | un filtro: algo más caro, aunque lo hace la GPU |

Regla práctica: `box-shadow` para tarjetas, botones y cajas; `drop-shadow()` para iconos, recortes, bocadillos y cualquier cosa que no sea un rectángulo. Y si la forma la hace un `clip-path` (lección siguiente), solo funciona la segunda, aplicada a un elemento padre.

## Un filtro afecta a todo el elemento

Como un filtro procesa la imagen completa del elemento, el texto que tiene dentro también se desenfoca, se oscurece o se vuelve gris, y ningún hijo puede «quitarse» el filtro: es lo mismo que pasaba con `opacity` en la lección de color. Cuando solo quieres filtrar el fondo (una foto desenfocada detrás de un título), la foto tiene que ser una capa aparte: un `::before` o un `<img>` colocado detrás del contenido.

[[exercise:05-el-filtro-afecta-a-los-hijos.md]]

El patrón tiene tres piezas que ya conoces del módulo de flujo y posicionamiento: el `::before` con `position: absolute` e `inset`, un `z-index: -1` para mandarlo detrás del texto e `isolation: isolate` en el padre para que ese `-1` no se vaya detrás del fondo de la página. Con `blur()` hay un detalle más: el desenfoque aclara los bordes de la capa, así que la capa se hace algo más grande que la caja (`inset: -12px`) y el padre recorta lo que sobra con `overflow: hidden`.

### Por qué un efecto aísla al elemento

Para aplicar un filtro, el navegador no puede pintar el elemento directamente en la página. Primero lo pinta **aparte**, con todos sus descendientes, en una imagen propia (una capa); después procesa esa imagen, y solo entonces la coloca en la página. Esa forma de trabajar tiene dos consecuencias que ya habías visto como sorpresas:

- **Crea un contexto de apilamiento.** Los descendientes están dentro de la imagen aplanada: ningún elemento de fuera puede colarse entre ellos, y su `z-index` solo ordena dentro de la capa. Es el «`z-index: 9999` que no sube» de la lección de `z-index`.
- **Crea un bloque contenedor para los descendientes `fixed` y `absolute`** (solo `filter` y `backdrop-filter`). Un hijo `fixed` tiene que estar dentro de la imagen que se filtra, así que se coloca respecto al elemento y se desplaza con él. Es el botón de «Ayuda» que se iba con su panel en la lección de `position`.

`opacity`, `mix-blend-mode` y, en la lección siguiente, `clip-path` y `mask` también pintan el elemento como un grupo, así que también crean un contexto de apilamiento; en cambio, la especificación no les pide ser el bloque contenedor de los descendientes `fixed`. `transform` hace las dos cosas, y lo verás con todo detalle en la lección de transformaciones.

| Propiedad | Contexto de apilamiento | Bloque contenedor de `fixed` |
|---|---|---|
| `opacity` menor que `1` | sí | no |
| `filter` distinto de `none` | sí | sí |
| `backdrop-filter` distinto de `none` | sí | sí |
| `mix-blend-mode` distinto de `normal` | sí | no |
| `isolation: isolate` | sí | no |

## `backdrop-filter`: filtrar lo que hay detrás

`backdrop-filter` no filtra el elemento, sino **lo que se ve a través de él**: todo lo pintado antes en la página, recortado a la forma de su caja. El resultado se pone debajo de su propio fondo. Con un fondo semitransparente sale el famoso **cristal esmerilado** de las cabeceras fijas y los paneles de macOS e iOS. Con un fondo opaco no se ve nada: el desenfoque está ahí, pero el fondo lo tapa.

[[exercise:06-backdrop-filter.md]]

Dos consejos:

- **Calcula el contraste para el peor caso.** Lo que hay detrás cambia (al hacer scroll, con otra foto), así que el fondo semitransparente tiene que bastar sobre un píxel blanco. Con un azul noche al 65 %, el texto blanco queda por encima de 5:1 pase lo que pase detrás. El desenfoque ayuda a leer, porque borra los detalles pequeños, pero no sube el contraste.
- **Con moderación.** El navegador vuelve a desenfocar lo de detrás cada vez que cambia (en cada paso del scroll). Para una cabecera o un menú, bien; para veinte tarjetas grandes, no.

## `mix-blend-mode`: mezclar con lo que hay debajo

Normalmente, un elemento opaco **tapa** lo que tiene debajo. Con `mix-blend-mode`, cada píxel del elemento (la **fuente**) se combina con el píxel que ya estaba pintado (el **fondo**) mediante una fórmula, la misma de los modos de capa de cualquier programa de retoque:

| Modo | Fórmula (canal a canal, de 0 a 1) | Efecto |
|---|---|---|
| `multiply` | fuente × fondo | solo oscurece; el blanco no cambia nada |
| `screen` | 1 − (1 − fuente) × (1 − fondo) | solo aclara; el negro no cambia nada |
| `overlay` | `multiply` en los oscuros del fondo, `screen` en los claros | tiñe y aumenta el contraste |
| `darken` / `lighten` | el menor / el mayor | se queda con el más oscuro / claro |
| `difference` | \|fuente − fondo\| | invierte donde la fuente es clara |
| `hue`, `saturation`, `color`, `luminosity` | combinan tono, saturación y luz | `color`: el tono de la fuente con la luz del fondo |

[[exercise:07-mix-blend-mode.md]]

> **Desde Python:** con los canales normalizados a 0-1, `multiply` y `screen` son una línea cada uno. Mezclar un ámbar `(0.96, 0.62, 0.04)` sobre un azul de la ola `(0.15, 0.30, 0.55)`:

```python
amber = (0.96, 0.62, 0.04)
wave_blue = (0.15, 0.30, 0.55)

multiply = tuple(round(f * b, 2) for f, b in zip(amber, wave_blue))
screen = tuple(round(1 - (1 - f) * (1 - b), 2) for f, b in zip(amber, wave_blue))
print("multiply:", multiply)   # más oscuro que los dos
print("screen:", screen)       # más claro que los dos
```

```text
multiply: (0.14, 0.19, 0.02)
screen: (0.97, 0.73, 0.57)
```

### `isolation`: con qué se mezcla

¿Qué es exactamente «lo que hay debajo»? **Todo** lo pintado antes que el elemento dentro de su **contexto de apilamiento**: el fondo de su padre, pero también el de su abuelo, el de la página y cualquier cosa que asome por detrás. Si los círculos de un diagrama se mezclan entre sí con `multiply`, también se mezclan con las rayas del fondo de la página.

[[exercise:08-isolation.md]]

Las fórmulas de la tabla son las de sRGB, pero el resultado exacto depende de la pantalla: en una de gama amplia (Display P3, como la de un Mac), Chrome mezcla en el espacio de color de la pantalla, y en el ejemplo el cian por el magenta sale azul violáceo y el centro, granate oscuro en vez de negro. Usa los modos de mezcla para efectos, nunca para obtener un color exacto.

`isolation: isolate` crea un contexto de apilamiento en el contenedor sin ningún otro efecto. Dentro, los hijos se mezclan sobre un lienzo transparente (entre sí); después, el grupo entero se pinta encima de la página de forma normal. Es la misma propiedad que usaste en la lección de `z-index` para que un `z-index: -1` no se escapara.

Un aviso de accesibilidad: un texto con `mix-blend-mode` cambia de color según lo que tenga debajo, así que su contraste no se puede garantizar. Úsalo en decoraciones; el texto que hay que leer, con colores normales.

## `background-blend-mode`: mezclar las capas del fondo

`background-blend-mode` acepta los mismos modos, pero solo mezcla las **capas de fondo** de un elemento entre sí: cada imagen o degradado se mezcla con las capas que tiene debajo en la lista, y la última, con el `background-color`. Ni el contenido ni lo que hay detrás del elemento participan, así que no necesita `isolation`.

[[exercise:09-background-blend-mode.md]]

Es la forma más sencilla de teñir una foto con el color de una marca (`multiply`) o de convertirla en un monocromo (`luminosity` sobre un color). Como en cualquier fondo, la foto es decorativa: si transmite información, va en un `<img>` con su `alt`.

## Cómo verlo en DevTools

- **Antes y después.** En **Styles**, la casilla de cada declaración la activa y desactiva: la forma más rápida de comparar un `filter` o un `mix-blend-mode` con el original.
- **Ajustar valores.** Selecciona un número dentro de `blur(3px)` o `brightness(1.5)` y cámbialo con las flechas del teclado: el efecto se actualiza en directo.
- **Quién crea el contexto.** Si un `z-index` o un `mix-blend-mode` no se comporta como esperas, recorre los antepasados en **Elements** y busca en **Computed** `filter`, `opacity`, `isolation`, `mix-blend-mode` y `transform` con valores distintos de los iniciales.

## Bestiario

- **La foto recupera el color al pasar el ratón.** Síntoma: una galería en gris con un `:hover` que solo debía aclarar sale en color. Causa: `filter` es una sola propiedad; la lista del `:hover` sustituye a la anterior entera. Solución: repetir la lista completa o una custom property por función. → [ver ejemplo](03-un-filter-sustituye-al-otro.md)
- **La sombra es un rectángulo alrededor del logotipo.** Síntoma: un PNG o SVG con fondo transparente, o un bocadillo con flecha, tienen una sombra cuadrada o incompleta. Causa: `box-shadow` sigue la caja, no lo pintado. Solución: `filter: drop-shadow()`. → [ver ejemplo](04-drop-shadow-sigue-la-forma.md)
- **El título se desenfoca con la foto.** Síntoma: un `filter` en una cabecera con imagen de fondo emborrona y oscurece también su texto. Causa: el filtro procesa la imagen completa del elemento, hijos incluidos. Solución: la foto en un `::before` detrás del contenido, con el filtro solo en esa capa. → [ver ejemplo](05-el-filtro-afecta-a-los-hijos.md)
- **`backdrop-filter` no hace nada.** Síntoma: el panel se ve igual con y sin el efecto. Causa: el fondo del panel es opaco y tapa el resultado. Solución: un fondo semitransparente (`rgb(15 23 42 / 0.65)`), con el contraste calculado para el peor caso. → [ver ejemplo](06-backdrop-filter.md)
- **Las rayas de la página atraviesan los círculos.** Síntoma: elementos con `mix-blend-mode` se mezclan con fondos lejanos que no deberían tocar. Causa: se mezclan con todo lo pintado antes en su contexto de apilamiento. Solución: `isolation: isolate` en el contenedor. → [ver ejemplo](08-isolation.md)

## Resumen

- `filter` procesa la imagen ya pintada de un elemento y de todos sus hijos, sin tocar el layout; sus funciones se aplican en orden, y la lista se sustituye entera si otra regla gana.
- `drop-shadow()` sigue la silueta de lo pintado; `box-shadow`, la caja.
- Para filtrar solo un fondo, ponlo en una capa aparte (`::before` o `<img>`) detrás del contenido.
- Un efecto que pinta el elemento como grupo (`filter`, `opacity`, `mix-blend-mode`, `backdrop-filter`) crea un contexto de apilamiento; `filter` y `backdrop-filter` son además el bloque contenedor de sus descendientes `fixed`.
- `backdrop-filter` filtra lo que se ve a través del elemento, y solo se nota con un fondo semitransparente.
- `mix-blend-mode` mezcla con todo lo de debajo en el contexto de apilamiento; `isolation: isolate` lo limita. `background-blend-mode` mezcla solo las capas del fondo de un elemento.

## Para profundizar

- [MDN: filter](https://developer.mozilla.org/es/docs/Web/CSS/filter)
- [MDN: backdrop-filter](https://developer.mozilla.org/es/docs/Web/CSS/backdrop-filter)
- [web.dev: Filters (Learn CSS)](https://web.dev/learn/css/filters)
- [web.dev: Blend modes (Learn CSS)](https://web.dev/learn/css/blend-modes)
- [Especificación: Compositing and Blending Level 1](https://www.w3.org/TR/compositing-1/)
