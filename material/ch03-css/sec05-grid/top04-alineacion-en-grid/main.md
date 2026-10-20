# Alineación en grid

## Por qué importa

En el módulo de flexbox aprendiste un vocabulario de seis palabras: `justify` y `align`, combinadas con `-content`, `-items` y `-self`. Te decía que te serviría también en grid, y así es: las propiedades son las mismas. Pero en grid significan algo un poco distinto, por dos razones.

La primera: cada elemento grid tiene su **celda** (su área), y se alinea dentro de ella, no dentro de una línea compartida con sus vecinos. Por eso en grid existe `justify-self`, que en flexbox se ignoraba. La segunda: los ejes **no giran**. En flexbox, `justify` seguía al eje principal, que cambiaba con `flex-direction`; en grid, `justify` es siempre la dirección del texto (horizontal en español) y `align`, la de los bloques (vertical).

En esta lección verás los dos niveles de alineación (los elementos dentro de sus celdas y las pistas dentro del contenedor), la forma más corta de centrar en CSS y dos trampas que vienen del estiramiento por defecto: filas que crecen sin que nadie se lo pida y un índice `sticky` que no se pega, la promesa pendiente de los módulos de `position` y flexbox.

## El mapa

| | Eje en línea (`justify-*`) | Eje de bloque (`align-*`) |
|---|---|---|
| Cada elemento dentro de su celda (en el contenedor) | `justify-items` | `align-items` |
| Un elemento dentro de su celda (en el elemento) | `justify-self` | `align-self` |
| Las pistas dentro del contenedor (en el contenedor) | `justify-content` | `align-content` |

En español, el eje en línea es el horizontal: el de las palabras de una línea. El eje de bloque es el vertical: el de los párrafos uno debajo de otro. Si alguna vez cambias el modo de escritura (lo verás en el módulo de tipografía), los ejes giran con el texto, no con el layout.

Los tres niveles, de fuera hacia dentro:

```text
contenedor ┌──────────────────────────────────────────────┐
           │  pista      pista      pista      sobrante   │  ← *-content mueve las pistas
           │ ┌────────┐ ┌────────┐ ┌────────┐  ░░░░░░░░░░ │     dentro del contenedor
           │ │ celda  │ │ ┌────┐ │ │        │  ░░░░░░░░░░ │
           │ │        │ │ │ el │ │ │        │  ░░░░░░░░░░ │  ← *-items / *-self mueven
           │ │        │ │ └────┘ │ │        │  ░░░░░░░░░░ │     cada elemento dentro
           │ └────────┘ └────────┘ └────────┘  ░░░░░░░░░░ │     de su celda
           └──────────────────────────────────────────────┘
```

Cada pareja tiene un atajo `place-*` que escribe **primero** el valor de `align` y después el de `justify`: `place-items: start end` es `align-items: start` + `justify-items: end`. Con un solo valor, los dos ejes: `place-items: center`.

## Dentro de la celda: `justify-items` y `align-items`

Las dos propiedades se escriben en el contenedor y deciden dónde va cada elemento **dentro de su celda**:

- `stretch`: el elemento llena la celda en ese eje. Es lo que hace el valor inicial, `normal`, con casi todos los elementos.
- `start`, `center`, `end`: el elemento mide lo que su contenido (como `fit-content`) y se coloca al principio, en el centro o al final de la celda.
- `baseline`: alinea la línea base del texto de los elementos de la misma fila (o columna).

[[exercise:01-alinear-en-la-celda.md]]

La celda no cambia de tamaño: lo que cambia es el elemento dentro de ella. Es la diferencia con `justify-content` de flexbox, que movía los elementos entre sí; aquí cada uno se mueve en su propio recinto.

Hay una excepción a «`normal` se comporta como `stretch`»: los elementos con proporción propia, como las imágenes. Con `normal`, una imagen grid **no se estira**: mide su tamaño (o el que le dé tu CSS) y se coloca al principio de la celda. Por eso en grid no te encontrarás las fotos deformadas de la lección de trampas de flexbox, salvo que escribas `stretch` a propósito.

### La caja, no el texto

`justify-items: center` centra la **caja** del elemento dentro de su celda; las líneas de texto de dentro siguen su flujo normal, alineadas a la izquierda. Si la caja se estira (el valor por defecto), centrarla no cambia nada visible: para centrar el texto dentro de una caja estirada sigue haciendo falta `text-align: center`. Es la misma distinción que viste en flexbox entre centrar el párrafo y centrar sus letras.

> **Desde Python:** `"Ana".center(9)` coloca tres caracteres en un hueco de nueve sin cambiarlos, como `justify-self: center` coloca una caja en su celda. Pero si la cadena ya ocupa los nueve caracteres (la caja estirada), no hay nada que centrar: tendrías que centrar lo que hay **dentro** de ella.

## Un elemento distinto: `justify-self` y `align-self`

Lo mismo para un solo elemento, escrito en él. Su valor inicial, `auto`, significa «lo que diga el `*-items` del contenedor». A diferencia de flexbox, aquí `justify-self` funciona: el elemento no comparte su línea con nadie, así que puede ir a cualquier lado de su celda.

[[exercise:02-un-elemento-distinto.md]]

En flexbox, para mandar un elemento al final de la línea usabas un margen automático. En grid también funcionan, y con el mismo sentido: un margen `auto` se queda con el espacio libre de su lado **dentro de la celda**. `margin-left: auto` equivale a `justify-self: end`.

## Centrar en dos líneas

Con un único hijo, un contenedor grid tiene una sola celda que ocupa todo su interior (la fila y la columna `auto` se estiran, como verás enseguida). Centrar al hijo en esa celda es centrarlo en el contenedor:

```css
.empty {
  display: grid;
  place-items: center;   /* align-items + justify-items */
}
```

Es la forma más corta de centrar algo en CSS. La lección de márgenes prometía la otra: `margin: auto` en el hijo, que en el flujo normal no centraba en vertical y en una celda grid sí, porque los márgenes automáticos absorben el espacio libre en los dos ejes.

[[exercise:03-centrar-con-place-items.md]]

Los dos métodos tienen la misma letra pequeña que en flexbox: si el hijo no cabe, `center` lo desborda por los dos lados y lo de arriba queda inalcanzable con el scroll. `place-items: safe center` o `margin: auto` lo evitan.

## Las pistas dentro del contenedor: `justify-content` y `align-content`

Si las pistas no llenan el contenedor (porque son fijas o miden su contenido), sobra espacio. `justify-content` y `align-content` deciden dónde va, moviendo **las pistas enteras**, con los valores de flexbox: `start`, `center`, `end`, `space-between`, `space-around` y `space-evenly`. Con alguna pista `fr` no sobra nada, y estas propiedades no hacen nada.

[[exercise:04-las-pistas-en-el-contenedor.md]]

Fíjate en el último caso: `space-between` agranda los huecos entre pistas, y un elemento que abarca dos columnas incluye el hueco que hay entre ellas. Si las tarjetas deben medir lo mismo, deja que las pistas llenen el contenedor con `fr` en lugar de repartir el sobrante.

### Las filas `auto` se estiran

El valor inicial de `justify-content` y `align-content` es `normal`, y en grid se comporta como `stretch`: si sobra espacio, las pistas de tamaño `auto` **crecen** a partes iguales hasta llenar el contenedor. En las columnas lo viste en la lección de pistas (`auto auto` llena el ancho). En las filas sorprende más, porque solo pasa cuando el contenedor tiene un alto definido: un panel de 260px con tres filas implícitas reparte el sobrante entre las tres, y la cabecera se vuelve enorme.

[[exercise:05-filas-que-se-estiran.md]]

Hay dos arreglos, según lo que quieras:

- `grid-template-rows: auto auto 1fr`: una fila concreta se queda con el espacio y las demás miden su contenido. Es lo habitual en paneles y páginas.
- `align-content: start`: las filas a su medida, arriba, y el sobrante debajo de todas.

El mismo estiramiento explica otra sorpresa: un contenedor alto con **dos** hijos y `place-items: center` no los junta en el centro, sino que los separa, cada uno centrado en su mitad. Para centrarlos juntos, mueve las pistas: `place-content: center`.

## `stretch` y el `sticky` que no se pega

La lección de `position` dejaba pendiente una cuarta causa de un `sticky` que no se pega, y la de trampas de flexbox la mostró con una fila flex. En grid pasa exactamente lo mismo: el bloque contenedor de un elemento grid es su celda, y una caja `sticky` nunca sale de él. Con `align-self: normal` (que estira), el índice mide lo mismo que la celda, la celda mide lo que el artículo de al lado, y al índice no le queda recorrido.

[[exercise:06-sticky-en-una-celda.md]]

El arreglo también es el mismo, con el nombre de valor de grid: `align-self: start` en el índice.

## Un formulario alineado

Un ejemplo real que usa casi todo lo anterior: un formulario en dos columnas. Las etiquetas van en una columna `max-content` y se pegan a su campo con `justify-self: end`; los campos se estiran (el valor por defecto); la casilla y el botón van en la segunda columna, cada uno a su tamaño. `align-items: baseline` apoya cada etiqueta en la misma línea que el texto de su campo, también junto a un `textarea` de varias filas.

[[exercise:07-formulario-alineado.md]]

## `normal`, `start`, `flex-start`…

En grid, los valores de flexbox `flex-start` y `flex-end` funcionan como `start` y `end`, pero son nombres de flexbox: usa `start` y `end`. Y `left`/`right` solo existen para `justify-*`; evítalos, porque no giran con el sentido del texto.

| Propiedad | Valor inicial | En grid se comporta como… |
|---|---|---|
| `justify-items`, `align-items` | `normal` (`legacy` en `justify-items`) | `stretch` (y `start` en imágenes) |
| `justify-self`, `align-self` | `auto` | lo que diga el `*-items` del contenedor |
| `justify-content`, `align-content` | `normal` | `stretch` para las pistas `auto` |

## Cómo verlo en DevTools

- En **Styles**, junto a `display: grid` hay un icono que abre el **editor de grid**: botones con dibujos para `justify-content`, `align-content`, `justify-items` y `align-items`. Pruébalos sobre los ejemplos para ver cada valor.
- Con el overlay de grid activado, las celdas aparecen dibujadas aunque el elemento no las llene: si un elemento es más pequeño que su celda, es que alguna propiedad `*-items` o `*-self` ha quitado el `stretch`.
- *Show track sizes* delata las filas estiradas: una fila `auto` que mide mucho más que su contenido está recibiendo el sobrante de `align-content`.

## Bestiario

- **Las filas crecen sin motivo.** Síntoma: en un contenedor grid con altura fija, la cabecera o el buscador miden mucho más que su contenido. Causa: `align-content: normal` estira las filas `auto` para llenar el contenedor. Solución: di qué fila se queda con el espacio (`grid-template-rows: auto auto 1fr`) o `align-content: start`. → [ver ejemplo](05-filas-que-se-estiran.md)
- **El índice `sticky` de una rejilla no se pega.** Síntoma: el índice lateral sube con el artículo. Causa: su bloque contenedor es su celda, y el estiramiento por defecto lo hace igual de alto que ella. Solución: `align-self: start`. → [ver ejemplo](06-sticky-en-una-celda.md)

## Resumen

- `justify-*` actúa siempre en el eje en línea (horizontal en español) y `align-*` en el de bloque (vertical); en grid los ejes no giran con el layout.
- `*-items` (en el contenedor) y `*-self` (en el elemento) colocan cada elemento dentro de su celda; por defecto lo estiran, salvo a las imágenes.
- `justify-self` existe en grid; los márgenes automáticos también reparten el espacio de la celda.
- `display: grid; place-items: center` centra un hijo en los dos ejes; `place-*` escribe primero `align` y después `justify`.
- `*-content` mueve las pistas cuando no llenan el contenedor; `space-*` agranda los huecos y los elementos que los abarcan.
- `align-content: normal` estira las filas `auto` de un contenedor con altura: decide qué fila es `1fr` o usa `align-content: start`.
- Un `sticky` dentro de una celda necesita `align-self: start` para tener recorrido.

## Para profundizar

- [MDN: Alineación de cajas en grid layout](https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout/Box_alignment_in_grid_layout)
- [web.dev: Grid, alignment (Learn CSS)](https://web.dev/learn/css/grid#alignment)
- [Rachel Andrew: Box Alignment Cheatsheet](https://rachelandrew.co.uk/css/cheatsheets/box-alignment)
- [Chrome DevTools: Inspect CSS grid (editor de grid)](https://developer.chrome.com/docs/devtools/css/grid)
- [Especificación: CSS Box Alignment Module Level 3](https://www.w3.org/TR/css-align-3/)
