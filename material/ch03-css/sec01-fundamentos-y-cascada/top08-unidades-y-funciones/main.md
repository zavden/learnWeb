# Unidades y funciones

## Por qué importa

Casi cada valor de CSS es una medida: un tamaño de letra, un margen, un ancho. Elegir la unidad es elegir **de qué depende** esa medida: de nada (`px`), de la letra de la página (`rem`), de la letra del propio elemento (`em`), del contenedor (`%`) o de la ventana (`vw`). Una buena elección hace que el diseño se adapte solo a pantallas distintas y a las preferencias de quien lee; una mala produce textos que se disparan de tamaño o cajas que se salen de la pantalla. Las funciones `calc()`, `min()`, `max()` y `clamp()` permiten además combinar unidades y poner límites.

## El mapa de las unidades

| Unidad | Relativa a… | Uso típico |
|---|---|---|
| `px` | nada: unidad fija | bordes finos, sombras, detalles |
| `rem` | el `font-size` del elemento raíz (`<html>`) | tamaños de letra y espaciados generales |
| `em` | el `font-size` del padre (en `font-size`) o del propio elemento (en el resto) | relleno de componentes que escalan con su texto |
| `%` | depende de la propiedad (ver más abajo) | anchos relativos al contenedor |
| `vw` / `vh` | el 1 % del ancho / alto de la ventana | secciones a pantalla completa, tipografía fluida |
| `svh` / `lvh` / `dvh` | el 1 % del alto de la ventana pequeña / grande / dinámica | alturas en móviles |
| `ch` | el ancho del carácter «0» | longitud de línea de un texto |
| `ex` | la altura de la «x» minúscula | ajustes finos junto al texto |
| `lh` | el `line-height` del elemento | medir en líneas de texto |

También existen unidades físicas (`cm`, `mm`, `in`, `pt`), pero en pantalla no miden lo que dicen; solo tienen sentido en hojas para imprimir.

## px: el píxel de CSS

Un `px` de CSS no es un píxel físico de la pantalla. Es una unidad de referencia: en una pantalla de alta densidad (como la de un portátil moderno o un móvil), un `px` de CSS ocupa 2 o 3 píxeles físicos. La relación es `devicePixelRatio` y la verás en el capítulo de canvas. Para ti, `1px` es simplemente «la medida pequeña de referencia, siempre igual».

## rem: relativo a la raíz

`1rem` es el `font-size` del elemento `<html>`. Por defecto, el navegador lo fija en 16px **o en lo que el usuario haya configurado**. Esa es la gran ventaja: si alguien con baja visión sube el tamaño de letra de su navegador, todo lo que mediste en `rem` crece con él. Lo medido en `px`, no.

[[exercise:01-px-y-rem.md]]

Por eso no es buena idea escribir `html { font-size: 16px; }`: anula la preferencia del usuario. Si quieres cambiar la escala, usa un porcentaje (`html { font-size: 112.5%; }` = 18px con la configuración por defecto).

## em: relativo a la fuente

`em` tiene dos significados según dónde se use:

- En `font-size`, `1em` es el tamaño de letra del **padre**.
- En cualquier otra propiedad (`padding`, `margin`, `border-radius`…), `1em` es el tamaño de letra del **propio** elemento.

El primero tiene una trampa: como cada hijo mide contra su padre, los factores **se multiplican** al anidar.

[[exercise:02-em-se-encadena.md]]

El segundo es una virtud: un componente medido en `em` escala entero cuando cambias su tamaño de letra.

[[exercise:03-em-en-otras-propiedades.md]]

Regla práctica: `rem` para los tamaños de letra; `em` para el espaciado interno de componentes que deben crecer con su texto.

## %: ¿porcentaje de qué?

Un porcentaje siempre es «de algo», y ese algo depende de la propiedad:

| Propiedad | `%` se calcula sobre… |
|---|---|
| `width`, `left`, `right` | el ancho del bloque contenedor |
| `height`, `top`, `bottom` | el alto del bloque contenedor (si ese alto está definido; si no, no funciona) |
| `padding` y `margin`, **los cuatro lados** | el **ancho** del bloque contenedor |
| `font-size` | el `font-size` del padre |
| `line-height` | el `font-size` del propio elemento |
| `translate` en `transform` | el tamaño del propio elemento |

El «bloque contenedor» suele ser el padre; las excepciones llegarán con el posicionamiento. La fila que más sorprende es la de `padding` y `margin`:

[[exercise:04-porcentaje-de-que.md]]

## Unidades de ventana: vw, vh y compañía

`vw` y `vh` miden la **ventana** (el *viewport*), no el contenedor. En la vista previa de LearnWeb, la ventana es el propio marco de la vista previa: si cambias su tamaño, cambian.

[[exercise:05-unidades-de-viewport.md]]

Dos detalles prácticos:

- `100vw` incluye el ancho de la barra de desplazamiento vertical, si la hay. En sistemas con barras que ocupan espacio (Windows, Linux), `width: 100vw` provoca una barra horizontal. En macOS, con barras superpuestas, no se nota. Para ocupar todo el ancho disponible, `width: 100%` suele ser lo correcto.
- En los móviles, la barra de direcciones aparece y desaparece y cambia el alto de la ventana. `svh` usa el alto más pequeño, `lvh` el más grande y `dvh` el actual. Para una sección «a pantalla completa» en el móvil, `min-height: 100dvh` evita que el contenido quede escondido bajo la barra.

## Unidades tipográficas: ch, ex y lh

Miden según la fuente actual. La más útil es `ch`: un texto se lee bien con 45-75 caracteres por línea, y `max-width: 65ch` lo garantiza con cualquier fuente.

[[exercise:06-ch-ex-y-lh.md]]

## calc(): cuentas con unidades mezcladas

`calc()` hace operaciones (`+`, `-`, `*`, `/`) en el momento del diseño, cuando el navegador ya sabe cuánto vale cada unidad. Por eso puede mezclar lo que tú no puedes sumar a mano: «todo el ancho menos 4rem».

[[exercise:07-calc.md]]

Reglas de sintaxis:

- `+` y `-` necesitan un espacio **a cada lado**.
- En `*`, al menos uno de los dos lados debe ser un número sin unidad; en `/`, el divisor. (La especificación más reciente permite operar entre unidades, como `calc(100vw / 1px)`, pero todavía no funciona en todos los navegadores.)
- Se pueden anidar paréntesis: `calc((100% - 2rem) / 3)`.

La primera regla provoca un error silencioso clásico:

[[exercise:08-calc-sin-espacios.md]]

## min(), max() y clamp()

Eligen un valor entre varios, recalculándolo cuando cambia el espacio:

| Función | Devuelve | Úsala como… |
|---|---|---|
| `min(a, b, …)` | el menor | un **tope**: `width: min(100%, 360px)` nunca pasa de 360px |
| `max(a, b, …)` | el mayor | un **suelo**: `width: max(50%, 220px)` nunca baja de 220px |
| `clamp(mín, preferido, máx)` | el preferido, sin salirse de los límites | tipografía fluida: `clamp(1.25rem, 6vw, 2.5rem)` |

> **Desde Python:** son las mismas `min()` y `max()` de Python, y `clamp(a, x, b)` equivale a `max(a, min(x, b))`. Lo que despista es el nombre: `min()` **limita por arriba** (porque elige el menor de los valores) y `max()` limita por abajo.

[[exercise:09-min-max-y-clamp.md]]

## Qué unidad elegir

No hay una unidad «buena»: cada una responde a una pregunta distinta. Una guía de partida:

| Para… | Usa | Por qué |
|---|---|---|
| tamaños de letra | `rem` (o `clamp()` con `rem` y `vw`) | respeta la preferencia del usuario y no se encadena |
| relleno y esquinas de botones o etiquetas | `em` | escala con el texto del componente |
| el ancho máximo de un texto | `ch` | limita los caracteres por línea |
| bordes finos y sombras | `px` | son detalles que no deben crecer con la letra |
| anchos relativos al contenedor | `%` | se adaptan al espacio disponible |
| secciones a pantalla completa | `dvh` | sigue el alto real de la ventana en el móvil |
| separación entre secciones | `rem` | mantiene un ritmo coherente en toda la página |

Cuando una medida tiene que adaptarse **y** tener límites, combina unidades con `min()`, `max()` o `clamp()`.

## Bestiario

- **El texto crece sin control en las listas anidadas.** *Síntoma:* cada nivel de una lista o de un componente anidado tiene la letra más grande (o más pequeña) que el anterior. *Causa:* `font-size` en `em` se multiplica por el tamaño del padre, y el padre ya venía multiplicado. *Solución:* usa `rem` para los tamaños de letra. [Ver ejemplo](02-em-se-encadena.md).
- **Un `padding-top` en porcentaje no sigue al alto.** *Síntoma:* `padding-top: 25%` da un relleno distinto en cajas de la misma altura. *Causa:* los porcentajes de `padding` y `margin` se calculan siempre sobre el **ancho** del contenedor, también los verticales. *Solución:* usa unidades absolutas o relativas a la fuente para el relleno vertical, y `aspect-ratio` si lo que buscas es una proporción. [Ver ejemplo](04-porcentaje-de-que.md).
- **`calc()` no hace nada.** *Síntoma:* una propiedad con `calc()` se comporta como si no existiera. *Causa:* falta el espacio alrededor de un `+` o un `-` (`calc(100%-4rem)`); la función es inválida y el navegador descarta la declaración en silencio. *Solución:* escribe siempre `calc(100% - 4rem)`. [Ver ejemplo](08-calc-sin-espacios.md).

## Resumen

- `px` es fijo; `rem` sigue a la raíz y a la preferencia del usuario; `em` sigue a la fuente del padre (en `font-size`) o del propio elemento (en lo demás).
- `font-size` en `em` se multiplica al anidar: para tamaños de letra, `rem`.
- Un `%` depende de la propiedad; `padding` y `margin` usan siempre el ancho del contenedor.
- `vw`/`vh` miden la ventana; `dvh`/`svh`/`lvh` resuelven el alto cambiante de los móviles.
- `ch`, `ex` y `lh` miden según la fuente; `max-width: 65ch` da líneas cómodas de leer.
- `calc()` mezcla unidades (con espacios alrededor de `+` y `-`); `min()` pone un tope, `max()` un suelo y `clamp()` ambos.

## Para profundizar

- [MDN: CSS values and units](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
- [web.dev: Sizing units](https://web.dev/learn/css/sizing)
- [MDN: calc()](https://developer.mozilla.org/en-US/docs/Web/CSS/calc)
- [MDN: clamp()](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [web.dev: The large, small, and dynamic viewport units](https://web.dev/blog/viewport-units)
