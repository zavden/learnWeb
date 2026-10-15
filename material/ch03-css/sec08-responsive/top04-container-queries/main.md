# Container queries

## Por qué importa

Un componente no sabe dónde lo van a poner. La misma tarjeta de producto aparece en una rejilla de tres columnas, en una barra lateral estrecha, a todo el ancho en una portada y dentro de un carrusel. Una media query pregunta por la **ventana**, y la ventana no dice nada del hueco: en un monitor ancho, la tarjeta de la barra lateral recibiría las reglas «anchas» aunque su hueco mida 200px.

Durante años, las respuestas fueron los layouts intrínsecos (`flex-wrap`, `auto-fit`), trucos como el interruptor `(40rem - 100%) * 999` de la ficha de producto del módulo de flujo y posicionamiento, o JavaScript que medía cada caja. Desde 2023, todos los navegadores tienen **container queries**: un componente pregunta por el tamaño de su **contenedor** y se adapta a él, esté donde esté.

Esta lección cumple una promesa del módulo de flujo y posicionamiento, la versión moderna de aquel interruptor, y responde a la pregunta pendiente desde los módulos de flexbox y grid: ¿cuándo basta con una rejilla sin consultas y cuándo hace falta una?

## Dos pasos: un contenedor y una consulta

1. Un antepasado se declara **contenedor** con `container-type`.
2. Una regla `@container` pregunta por él: «si mi contenedor mide al menos 18rem…».

```css
.slot { container-type: inline-size; }

@container (width >= 18rem) {
  .print-card { grid-template-columns: 7rem 1fr; }
}
```

[[exercise:01-una-tarjeta-tres-huecos.md]]

`container-type` admite estos valores:

| Valor | Se puede preguntar por… | Coste |
|---|---|---|
| `normal` (inicial) | solo su estilo (consultas de estilo, al final de la lección) | ninguno |
| `inline-size` | su tamaño en línea: el **ancho**, en un texto horizontal | su ancho no puede depender del contenido |
| `size` | su ancho y su alto | ni el ancho ni el alto pueden depender del contenido |
| `scroll-state` | su estado de scroll (al final de la lección) | ninguno |

Casi siempre, `inline-size`. Las condiciones de `@container` usan la misma sintaxis que las media queries: rangos (`width >= 18rem`, `20rem <= width < 40rem`), `and`, `or`, `not`, y las características `width`, `height`, `inline-size`, `block-size`, `aspect-ratio` y `orientation`. Las medidas son las de la **caja de contenido** del contenedor, sin su relleno ni su borde. Y como en una media query, `rem` y `em` valen la letra inicial del navegador.

La regla importante: una `@container` pregunta por el contenedor más cercano **entre los antepasados del elemento al que da estilo**. En el ejemplo, la tarjeta pregunta a su hueco. Si hubiera otro contenedor entre los dos, preguntaría a ese.

## Contenedores con nombre

Cuando hay contenedores anidados (una columna que es contenedor, y dentro una tarjeta que también lo es), a veces una pieza necesita preguntar por uno que no es el más cercano. Para eso, los contenedores llevan nombre: `container-name: column`, o el atajo `container: column / inline-size`. Una consulta con nombre, `@container column (width >= 30rem)`, se salta los contenedores que se llaman de otra forma.

[[exercise:02-contenedores-con-nombre.md]]

Un uso típico: la tarjeta cambia de estructura según el ancho de la **columna** en la que está, y sus piezas internas (una fila de botones, una ficha técnica) según el ancho de la propia **tarjeta**. Ponles nombres por su papel (`sidebar`, `card`, `main`), no por su aspecto.

## Unidades de contenedor

Igual que `vw` es el 1 % de la ventana, las unidades de contenedor son el 1 % del contenedor más cercano:

| Unidad | El 1 % de… |
|---|---|
| `cqi` | el tamaño en línea del contenedor (el ancho, en horizontal) |
| `cqb` | su tamaño en bloque (el alto); necesita `container-type: size` |
| `cqw`, `cqh` | su ancho y su alto, sea cual sea el modo de escritura |
| `cqmin`, `cqmax` | el menor y el mayor de los dos |

Con ellas, la tipografía fluida de la lección anterior pasa a ser **de componente**: la misma recta, pero contra el ancho del contenedor. `clamp(1rem, 0.5rem + 6cqi, 2rem)` da 20px en un contenedor de 200px y 32px en uno de 400px, con la misma ventana.

[[exercise:03-unidades-de-contenedor.md]]

La lección anterior terminaba con un problema: un título en `vw` mide lo mismo en la columna principal que en una barra lateral. `cqi` lo resuelve… si hay un contenedor. Si no lo hay, las unidades de contenedor no fallan ni avisan: recurren a las del **viewport pequeño** (`cqi` vale lo que `svi`, `cqb` lo que `svb`), que en un escritorio es lo mismo que `vw`. Lo mismo pasa con `cqb` si el contenedor más cercano es solo `inline-size`.

[[exercise:04-vw-o-cqi.md]]

## Lo que cuesta un contenedor: la contención

¿Por qué hay que declarar los contenedores, en lugar de poder preguntar por cualquier caja? Por un círculo. Una consulta cambia los estilos de lo de dentro según el ancho del contenedor; si ese ancho dependiera de lo de dentro, cambiarlo cambiaría el ancho, que cambiaría la consulta… Para romper el círculo, `container-type: inline-size` aplica **contención de tamaño** en el eje en línea: el navegador calcula el ancho del contenedor **como si estuviera vacío**.

Para una caja de bloque normal no cambia nada: su ancho ya venía del padre, no del contenido. Pero todo lo que se ajusta a su contenido (`inline-block`, un `float`, `width: fit-content`, un elemento flex o grid que no se estira) pierde la fuente de su ancho y se encoge hasta su relleno:

[[exercise:05-el-contenedor-que-se-encoge.md]]

Con `size`, la contención es en los dos ejes, y el alto también se calcula como si no hubiera contenido. Sin un alto fijado desde fuera, el contenedor mide 0px de alto:

[[exercise:06-container-type-size-sin-altura.md]]

Y del círculo sale la tercera regla: un contenedor **no puede consultarse a sí mismo**. Una regla `@container` que da estilo al propio contenedor busca la respuesta en sus antepasados, no en él. Lo que cambia con la consulta tiene que ser un descendiente; por eso los componentes con container queries suelen tener un envoltorio interior.

[[exercise:07-no-se-puede-consultar-a-si-mismo.md]]

Hay otros efectos, más discretos:

- Un contenedor crea un **contexto de formato independiente**, como `display: flow-root`: contiene sus `float` y sus márgenes no colapsan con los de sus hijos.
- Aplica **contención de estilo**: los contadores CSS de dentro no afectan a los de fuera.
- Y lo que **no** hace: no crea un contexto de apilamiento ni es el bloque contenedor de sus descendientes `absolute` o `fixed`. Un `fixed` dentro de un contenedor sigue colocándose respecto a la ventana, y un `z-index` negativo se va detrás del fondo del contenedor como siempre. Ojo con artículos de 2022: las primeras versiones de la especificación (y de los navegadores) sí lo hacían.

La regla práctica: declara contenedores en cajas que reciben su ancho de fuera (una celda de una rejilla, la columna principal, un `<li>` de una lista de tarjetas) y no en cada elemento de la página.

## Adiós al interruptor ×999

En la ficha de producto del módulo de flujo y posicionamiento, una caja de compra flotante pasaba a ocupar todo el ancho cuando su contenedor era estrecho, sin media queries, con un truco: `(40rem - 100%) * 999` dentro de `clamp()` es enorme si el contenedor mide menos de 40rem y negativo si mide más, así que `clamp()` lo convierte en un interruptor. Funciona en cualquier navegador desde 2020, pero hay que pararse a descifrarlo. Con una container query, la misma decisión se escribe como se piensa:

[[exercise:08-el-interruptor-999.md]]

## ¿Media query, container query o nada?

En los módulos de flexbox y grid construiste rejillas y barras laterales que se adaptan **sin ninguna consulta**: `flex-wrap` con `flex-basis`, `repeat(auto-fit, minmax(min(100%, 12rem), 1fr))`. Siguen siendo la primera opción: se adaptan a su contenedor sin que tengas que elegir un número, y funcionan a cualquier ancho. Pero solo saben hacer una cosa: pasar elementos a la línea siguiente. Cuando el cambio es otro (una tarjeta que pasa de foto arriba a foto al lado, una tabla que se convierte en fichas, un título que cambia de tamaño), hace falta una consulta.

| Si lo que cambia es… | Usa |
|---|---|
| el número de elementos por fila, según el sitio | nada: `flex-wrap` o `auto-fit` (layout intrínseco) |
| el tamaño de letras y espacios, poco a poco | `clamp()`: con `vw` para la página, con `cqi` para un componente |
| la estructura de un **componente** que vive en huecos distintos | container query |
| el esqueleto de la **página** (columnas, cabecera, menú) | media query |
| algo según el usuario o el dispositivo (tema, movimiento, puntero) | media query (`prefers-*`, `hover`, `pointer`) |

Las tres herramientas conviven: una media query para el esqueleto, container queries en los componentes y layouts intrínsecos dentro de ellos.

## Consultas de estilo

Las container queries también pueden preguntar por el **valor de una custom property** del contenedor más cercano: `@container style(--tone: sale)`. Para estas consultas, todos los elementos son contenedores (vale `container-type: normal`), así que no hay que declarar nada. Funcionan en Chrome (desde 2023) y en Safari, y solo con custom properties; antes de depender de ellas en otros navegadores, compruébalo.

[[exercise:09-style-queries.md]]

Parecen una clase con otro nombre, pero tienen una ventaja: la variable se **hereda**. Una sección entera puede poner `--tone: sale` y todas las tarjetas de dentro cambian, y una sola variable puede mover muchas piezas de un componente a la vez.

## Consultas de estado de scroll

La última familia, **solo en Chrome** (desde 2025): con `container-type: scroll-state`, los descendientes pueden preguntar por el estado de scroll del contenedor. `stuck: top` se cumple mientras una caja `sticky` está pegada arriba; `scrollable: bottom`, si aún se puede desplazar hacia abajo; `snapped`, si ha encajado en un punto de *scroll snap*. Antes había que vigilar el scroll con JavaScript para algo tan común como dar sombra a una cabecera pegada.

[[exercise:10-scroll-state.md]]

Como solo funciona en Chrome, úsalo como **mejora progresiva**: la cabecera se pega en todos los navegadores, y la sombra es un extra. `@supports (container-type: scroll-state)` permite saber si está disponible.

## Cómo verlo en DevTools

- En **Elements**, cada contenedor lleva una insignia **container**. Al hacer clic, DevTools resalta su caja y muestra su tamaño.
- En **Styles**, las reglas de una `@container` muestran la condición y el contenedor al que preguntan (`@container card (width >= 18rem)`, con un enlace a `div.slot`). Pasa el ratón por el enlace para ver qué caja responde.
- En **Computed**, las unidades `cqi` aparecen ya resueltas en píxeles.
- Para probar anchos, cambia el `width` del contenedor en **Styles** con las flechas del teclado, o dale `resize: horizontal` y `overflow: auto` como al hueco del primer ejemplo.

## Bestiario

- **El título fluido es igual de grande en la barra lateral.** Síntoma: un título con `vw`, o con `cqi` sin contenedor, mide lo mismo en todas las columnas. Causa: `vw` mide la ventana, y sin contenedor `cqi` recurre al viewport pequeño (`svi`). Solución: `container-type: inline-size` en cada columna y `cqi` en el título. → [ver ejemplo](04-vw-o-cqi.md)
- **El contenedor se encoge hasta desaparecer.** Síntoma: con `container-type`, un `inline-block`, un elemento flex o un `fit-content` mide solo su relleno y su texto se sale palabra a palabra. Causa: la contención de tamaño calcula su ancho como si estuviera vacío. Solución: el contenedor, en una caja que recibe su ancho de fuera. → [ver ejemplo](05-el-contenedor-que-se-encoge.md)
- **La sección mide 0px de alto.** Síntoma: con `container-type: size`, el contenido se derrama sobre lo que viene después. Causa: `size` contiene también el alto. Solución: `inline-size`, o un alto fijado si de verdad necesitas consultar el alto. → [ver ejemplo](06-container-type-size-sin-altura.md)
- **La tarjeta no cambia aunque su consulta se cumple.** Síntoma: `@container (width >= 20rem) { .card { … } }` no hace nada en una tarjeta de 440px que es contenedor. Causa: un contenedor no puede consultarse a sí mismo; la regla pregunta a sus antepasados. Solución: dar estilo a un envoltorio interior. → [ver ejemplo](07-no-se-puede-consultar-a-si-mismo.md)

## Resumen

- `container-type: inline-size` convierte una caja en contenedor; `@container (width >= …)` da estilo a sus descendientes según su ancho de contenido.
- La consulta pregunta al contenedor más cercano entre los antepasados del elemento; con nombre (`container: card / inline-size`), al que se llama así.
- `cqi`, `cqb`, `cqw`, `cqh`, `cqmin` y `cqmax` miden el contenedor; sin contenedor, recurren al viewport pequeño.
- La contención de tamaño evita el círculo: el contenido no da tamaño al contenedor. Contenedores en cajas que reciben su ancho de fuera; `size` solo con alto fijado; nunca se consultan a sí mismos.
- Layout intrínseco para repartir en filas, container queries para componentes, media queries para el esqueleto de la página y las preferencias.
- Consultas de estilo (`style(--x: y)`, Chrome y Safari) y de estado de scroll (`scroll-state(stuck: top)`, solo Chrome) como mejora progresiva.

## Para profundizar

- [MDN: CSS container queries](https://developer.mozilla.org/es/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN: Container size and style queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries)
- [web.dev: Container queries (Learn CSS)](https://web.dev/learn/css/container-queries)
- [Chrome for Developers: CSS scroll-state queries](https://developer.chrome.com/blog/css-scroll-state-queries)
- [Ahmad Shadeed: An Interactive Guide to CSS Container Queries](https://ishadeed.com/article/css-container-query-guide/)
