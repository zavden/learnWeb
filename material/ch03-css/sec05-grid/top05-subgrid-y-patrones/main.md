# Subgrid y patrones

## Por qué importa

Con las cuatro lecciones anteriores ya puedes construir casi cualquier layout. Queda un problema que grid tuvo durante años y que solo resolvió en 2023: las rejillas **anidadas** no se hablan entre sí. Una tarjeta es elemento de la rejilla de fuera y, a la vez, coloca su propio contenido; si los títulos de tres tarjetas tienen longitudes distintas, sus descripciones empiezan cada una a una altura. `subgrid` permite que la tarjeta use las filas de la rejilla de fuera, y todo queda alineado.

Después, esta lección es un recetario, como la de patrones de flexbox: el esqueleto de página clásico con cabecera, menú, contenido, barra lateral y pie; la galería que se adapta a cualquier ancho sin media queries; capas en la misma celda en lugar de `position: absolute`, y un criterio para elegir entre grid y flexbox.

## `subgrid`

### Rejillas anidadas que no se alinean

Cuando conviertes un elemento grid en contenedor (`display: grid` o `flex`), sus hijos se colocan en una rejilla **nueva**, que no sabe nada de la de fuera. En una fila de tarjetas, cada tarjeta decide sus propias filas según su propio contenido.

[[exercise:01-filas-que-no-se-alinean.md]]

La versión con flexbox es el patrón de «tarjetas de igual altura» del módulo anterior: la fila de la rejilla estira las tarjetas y `margin-top: auto` manda el precio al fondo. Alinea el principio y el final, pero no lo de en medio.

### `grid-template-rows: subgrid`

La solución tiene dos partes, las dos en la tarjeta:

```css
.card {
  grid-row: span 3;                /* 1. ocupa 3 filas de la rejilla de fuera */
  display: grid;
  grid-template-rows: subgrid;     /* 2. y las usa para sus propios hijos */
}
```

Con `subgrid`, la tarjeta no crea filas: sus hijos se colocan en las 3 filas que la tarjeta ocupa en la rejilla de fuera. Como esas filas son las mismas para las tres tarjetas, la fila 1 mide lo que el título más alto, la 2 lo que la descripción más alta y la 3 lo que el precio más alto. Si hubiera una segunda fila de tarjetas, ocuparía las filas 4 a 6, con sus propias alturas.

Lo que hereda una subrejilla:

- Las **pistas** de las filas o columnas que ocupa (en el eje en el que escribes `subgrid`; en el otro, puede tener las suyas).
- El **gap**, salvo que declare el suyo.
- Los **nombres de línea** de la rejilla de fuera, y puede añadir otros.

Y una limitación: en el eje de `subgrid` no hay rejilla implícita. La tarjeta no puede crear filas nuevas, así que un cuarto hijo en una tarjeta que ocupa tres filas no tendría fila propia y acabaría encima de otro. El `span` debe coincidir con el número de hijos.

`subgrid` funciona en todos los navegadores desde septiembre de 2023 (Chrome 117); Firefox lo tenía desde 2019.

### Columnas compartidas: `subgrid` o `display: contents`

Lo mismo funciona con columnas. Un resumen de pedido es una lista en la que cada fila tiene un nombre, una cantidad y un precio, y las cantidades y los precios deben quedar en columna aunque cada fila sea un `li` distinto. Hay tres formas de hacerlo:

[[exercise:02-subgrid-o-display-contents.md]]

La lección de `display` prometía que `display: contents` brillaría con flexbox y grid: borra la caja del `li` y sus hijos pasan a ser elementos de la rejilla del `ul`. Funciona, pero se lleva la caja: sin fondo, sin borde, sin padding y, en algunos navegadores, sin el significado de elemento de lista. `subgrid` consigue lo mismo y conserva el `li` entero. Hoy, para alinear con el abuelo, la herramienta es `subgrid`; `display: contents` queda para envoltorios sin estilo ni significado.

## El «santo grial»

En 2006, un artículo de *A List Apart* llamó así al layout que todo el mundo quería y nadie conseguía sin trucos: cabecera y pie a todo el ancho, tres columnas en medio (menú, contenido, barra lateral) **de la misma altura**, el contenido elástico y el pie siempre abajo, aunque la página tenga poco texto. Con floats necesitaba márgenes negativos y columnas falsas; con grid son cuatro líneas:

```css
.page {
  display: grid;
  grid-template:
    "header header header" auto
    "nav    main   aside"  1fr
    "footer footer footer" auto
    / 7rem minmax(0, 1fr) 7rem;
  min-height: 100dvh;
}
```

[[exercise:03-holy-grail.md]]

Cada decisión del ejemplo viene de una lección del módulo: las áreas dibujan el esqueleto; `auto 1fr auto` deja la cabecera y el pie a su medida y da el resto al centro (con un alto definido, que es lo que hace funcionar la `1fr`); `minmax(0, 1fr)` impide que un `<pre>` o una URL larga ensanchen el contenido. Y el HTML sigue en orden de lectura, sin importar dónde se vea cada pieza. En el módulo de responsive, una sola media query redibujará las áreas para apilarlo todo en una columna en pantallas estrechas.

## Una galería sin media queries

Es la línea de CSS más famosa de grid, y ya conoces todas sus piezas:

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
  gap: 12px;
}
```

- `repeat(auto-fit, …)`: tantas columnas como quepan (lección de pistas); si hay menos fotos que columnas, las vacías se colapsan y las fotos se reparten la fila. Con `auto-fill`, las fotos mantendrían el ancho de columna.
- `minmax(…, 1fr)`: cada columna mide al menos el mínimo y crece hasta repartir el ancho.
- `min(100%, 12rem)`: el mínimo es 12rem, salvo que el contenedor sea más estrecho.

[[exercise:04-galeria-sin-media-queries.md]]

### El mínimo que desborda

¿Por qué `min(100%, 12rem)` y no `12rem` a secas? Porque `auto-fit` siempre crea al menos una columna, quepa o no. Si el contenedor mide menos que el mínimo (una columna lateral, un móvil de 320px con un mínimo de 20rem), esa única columna se sale y la página gana un scroll horizontal. `min()`, que conociste en la lección de unidades, rebaja el mínimo al ancho del contenedor justo cuando hace falta.

[[exercise:05-el-minimo-que-desborda.md]]

## Capas en la misma celda

Nada impide que varios elementos ocupen la misma celda: en la lección de colocación lo viste como un error. Hecho a propósito, es la forma moderna de superponer capas, como un texto sobre una foto:

```css
.hero        { display: grid; }
.hero > *    { grid-area: 1 / 1; }       /* todos los hijos, en la fila 1, columna 1 */
.hero-text   { align-self: end; }        /* el texto, abajo */
```

[[exercise:06-capas-en-la-misma-celda.md]]

Comparado con `position: absolute`, tiene tres ventajas: las capas siguen en el flujo, así que la celda mide lo que la capa **más alta** (no hace falta adivinar un alto fijo); se colocan con la alineación de grid (`align-self`, `justify-self`, `place-self`) en lugar de con desplazamientos; y la que va después en el HTML se pinta encima, sin `z-index`. El problema clásico de la versión con `absolute` aparece en cuanto el texto crece:

[[exercise:07-absolute-o-capas.md]]

`position: absolute` sigue siendo la herramienta para lo que debe salir de su caja (un menú desplegable, un aviso que flota fuera de la tarjeta) o para lo que se coloca respecto a un antepasado lejano. Para capas que deben ocupar exactamente el mismo sitio, las capas grid son más robustas.

### Insignias y `z-index` sin `position`

Las capas se combinan con la alineación de la lección anterior: una insignia en la esquina de una foto es `justify-self: end` y `align-self: start` en la misma celda que la foto. Y aquí se cumple otra promesa del módulo de posicionamiento: los elementos grid, como los flex, aceptan `z-index` **sin** `position`. Si la insignia va antes en el HTML (y la foto la taparía), `z-index: 1` la sube, y como siempre con `z-index`, crea un contexto de apilamiento.

[[exercise:08-insignia-en-la-esquina.md]]

## ¿Grid o flexbox?

El módulo de flexbox terminaba con una regla práctica; ahora puedes comprobarla. Flexbox va **del contenido hacia fuera**: cada elemento dice cuánto mide y la línea se reparte entre ellos. Grid va **del layout hacia dentro**: primero las pistas, después el contenido, que se coloca en ellas.

| Pregunta | Si la respuesta es sí… |
|---|---|
| ¿Las cosas deben alinearse en filas **y** columnas a la vez? | grid |
| ¿Cada elemento debe medir lo que su contenido, y que se repartan lo que sobre? | flexbox |
| ¿Defines el esqueleto antes de saber qué irá dentro (una página, un panel)? | grid |
| ¿Es una fila o una columna de cosas (una barra, un grupo de botones, unas etiquetas)? | flexbox |
| ¿Necesitas superponer elementos o alinear con el abuelo? | grid (capas, `subgrid`) |

[[exercise:09-grid-o-flex.md]]

No compiten: casi todas las páginas usan los dos. Grid para el esqueleto y las rejillas de tarjetas; flexbox dentro de cada pieza (la cabecera, la fila de botones de una tarjeta, una etiqueta con su icono).

## Cómo verlo en DevTools

- En **Elements**, una subrejilla tiene su propia insignia `subgrid`. Al activar su overlay, sus líneas coinciden con las de la rejilla de fuera: es la forma más rápida de comprobar que de verdad comparte las pistas.
- En las capas, pasa el ratón por cada hijo en **Elements**: todos resaltan el mismo rectángulo. Si una capa no aparece, mira su orden en el HTML y su `z-index`.
- Para la galería, abre el ejemplo con ↗ y usa el modo de dispositivo (el icono del móvil) para probar anchos de 320px o 1440px sin cambiar la ventana.

## Bestiario

- **Las descripciones de las tarjetas no se alinean.** Síntoma: en una fila de tarjetas, cada título y cada descripción empiezan a una altura distinta. Causa: cada tarjeta es una rejilla (o un flex) independiente que dimensiona sus filas con su propio contenido. Solución: `grid-row: span N` y `grid-template-rows: subgrid` en cada tarjeta. → [ver ejemplo](01-filas-que-no-se-alinean.md)
- **La galería adaptable desborda en pantallas estrechas.** Síntoma: en un contenedor o un móvil estrecho, la única columna se sale y aparece scroll horizontal. Causa: el mínimo de `minmax(12rem, 1fr)` se respeta aunque no quepa. Solución: `minmax(min(100%, 12rem), 1fr)`. → [ver ejemplo](05-el-minimo-que-desborda.md)
- **El texto de la portada se sale por arriba.** Síntoma: un texto colocado con `position: absolute` sobre una imagen tapa lo que hay encima cuando es largo. Causa: un elemento `absolute` no aporta altura a su padre, que mide lo que le hayas fijado. Solución: capas grid en la misma celda (`grid-area: 1 / 1`) y un `min-height` en lugar de un `height`. → [ver ejemplo](07-absolute-o-capas.md)

## Resumen

- Las rejillas anidadas son independientes; `grid-template-rows: subgrid` (o `-columns`) hace que un elemento grid use las pistas que ocupa en la rejilla de fuera, con su gap y sus nombres de línea.
- Con `subgrid`, el `span` del elemento debe coincidir con las pistas que necesitan sus hijos: no hay pistas implícitas en ese eje.
- `display: contents` también alinea con el abuelo, pero borra la caja del elemento; `subgrid` la conserva.
- El «santo grial»: `grid-template` con áreas, `auto 1fr auto` en las filas, `minmax(0, 1fr)` en el contenido y un alto mínimo.
- Galería sin media queries: `repeat(auto-fit, minmax(min(100%, 12rem), 1fr))`; el `min(100%, …)` evita el desbordamiento en contenedores estrechos.
- Capas: `grid-area: 1 / 1` en todos los hijos; la celda crece con la capa más alta, se alinean con `*-self` y `z-index` funciona sin `position`.
- Grid para dos dimensiones y esqueletos; flexbox para filas o columnas de contenido; casi siempre, los dos juntos.

## Para profundizar

- [MDN: Subgrid](https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout/Subgrid)
- [web.dev: CSS subgrid](https://web.dev/articles/css-subgrid)
- [MDN: Realizing common layouts using grids](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Realizing_common_layouts_using_grids)
- [web.dev: Ten modern layouts in one line of CSS](https://web.dev/articles/one-line-layouts)
- [Every Layout: The Grid](https://every-layout.dev/layouts/grid/)
