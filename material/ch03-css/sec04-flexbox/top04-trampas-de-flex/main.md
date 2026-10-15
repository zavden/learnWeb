# Trampas de flexbox

## Por qué importa

Flexbox hace lo que esperas casi siempre. El resto de las veces, las quejas se repiten en todos los proyectos: un bloque de código que ensancha la página entera, unos puntos suspensivos que no aparecen, columnas «iguales» que no lo son, una lista que no se desplaza, avatares ovalados, fotos deformadas, una cabecera `sticky` que no se pega y un teclado que salta de un lado a otro.

No son errores del navegador. Casi todas salen de tres valores por defecto pensados para el caso normal, más una propiedad que solo cambia lo que se ve. Cuando los conoces, cada síntoma te lleva directo a su causa:

| Valor por defecto | Para qué está | Su trampa |
|---|---|---|
| `min-width: auto` (`min-height` en columnas) | que el contenido no se aplaste ni se monte | bloques de código, `ellipsis`, columnas desiguales, scroll anidado |
| `flex-shrink: 1` | que todo quepa en la línea | avatares e iconos aplastados |
| `align-items: stretch` | que todos midan lo mismo de alto | imágenes deformadas, `sticky` que no se pega |
| `order` y `*-reverse` | reordenar sin tocar el HTML | el teclado y el lector de pantalla no se enteran |

## El suelo invisible: `min-width: auto`

La lección anterior terminaba con una promesa: los elementos flex no tienen `min-width: 0`, sino `min-width: auto`. Es el valor inicial de todas las cajas, pero significa cosas distintas según el layout:

- En el flujo normal, `auto` vale **0**: una caja puede estrecharse todo lo que quieras y su contenido se desborda.
- En un elemento flex, `auto` es el **tamaño mínimo automático**: el ancho mínimo de su **contenido** (`min-content`), es decir, su palabra más larga, su imagen más ancha o la línea más larga de un `<pre>`. Si el elemento tiene un `width`, se usa el menor de los dos.
- Si el elemento es un **contenedor de scroll** (`overflow: hidden`, `auto` o `scroll`), el mínimo automático vale 0: su contenido ya no se puede salir. `overflow: clip` no cuenta, porque no crea un contenedor de scroll.
- En una columna (`flex-direction: column`) todo esto se aplica al alto, con `min-height: auto`.

La idea es buena: ante la duda, flexbox prefiere desbordar el contenedor antes que aplastar el texto o montar un elemento encima de otro. Y ese mínimo es un `min-width` de verdad: en el paso 4 del algoritmo, el elemento que choca con él se congela y los demás se reparten lo que queda. Aquí tienes las mismas cuentas de la lección anterior, con un logo de 160px dentro de C:

[[exercise:01-el-minimo-automatico.md]]

Hay dos maneras de quitar el suelo, y no hacen lo mismo con el contenido que no cabe:

| Declaración en el elemento flex | El elemento… | El contenido que no cabe… |
|---|---|---|
| `min-width: 0` | encoge hasta lo que le toque | se desborda; lo gestiona el propio contenido (scroll, `ellipsis`, cortes) |
| `overflow: hidden` | encoge hasta lo que le toque | se recorta en el borde del elemento |

Casi siempre quieres la primera: `min-width: 0` en el elemento flex y que el contenido decida qué hacer con lo que no cabe. `overflow: hidden` también recorta lo que debería sobresalir, como los anillos de foco o las sombras.

### Un bloque de código que ensancha la página

Una página de documentación: índice a la izquierda y el artículo con `flex: 1`. Dentro del artículo, un `<pre>` con `overflow-x: auto` para que los comandos largos se desplacen. No se desplaza nunca: una línea de código no se puede partir, así que el ancho mínimo del artículo es esa línea, y el artículo se congela en ella. Todo el layout se sale del contenedor y la página gana un scroll horizontal.

[[exercise:02-pre-que-no-encoge.md]]

Fíjate en **dónde** va el arreglo: en el elemento flex (el artículo), no en el `<pre>`. El `<pre>` ya tenía su `overflow`; lo que le faltaba era un padre más estrecho que él.

### Los puntos suspensivos que no aparecen

En el módulo del modelo de cajas viste el recorte de una línea: `white-space: nowrap`, `overflow: hidden` y `text-overflow: ellipsis`. En una lista de conversaciones, el texto recortado suele ir dentro de un bloque con el nombre y el último mensaje, y ese bloque es el elemento flex. Con `nowrap`, el ancho mínimo de su contenido es la frase entera: el bloque no encoge, el párrafo nunca es más estrecho que su texto y no hay nada que recortar.

[[exercise:03-ellipsis-que-no-aparece.md]]

La tercera lista muestra la otra cara de la regla: si el texto recortado es **directamente** el elemento flex, funciona sin más, porque su propio `overflow: hidden` quita el suelo.

### `flex: 1` y un correo largo

La lección anterior advertía que `flex: 1` iguala el espacio repartido, no el tamaño final. Aquí está el caso más habitual: tres columnas con `flex: 1`, una de ellas con una dirección de correo. Un correo como `facturacion@distribuidoranorte.mx` no tiene espacios ni guiones donde partirse, así que su columna no baja de su ancho y las otras dos se reparten lo que sobra. Mide cada columna con la regla: deberían ser de 133,33px.

[[exercise:04-flex-1-y-el-correo-largo.md]]

`min-width: 0` devuelve la igualdad, pero el correo sigue sin caber y se sale de su columna. Para que se parta hace falta además `overflow-wrap: anywhere`, una propiedad del módulo de tipografía que permite cortar una palabra en cualquier letra cuando no cabe. En columnas que deben medir lo mismo pase lo que pase, pon `min-width: 0` de serie.

### Un scroll dentro de columnas anidadas: `min-height: 0`

El caso más difícil de ver, porque el elemento que falla no es el que tiene el scroll. Un panel de chat de alto fijo es una columna flex: cabecera arriba y, debajo, una conversación con `flex: 1`. La conversación es a su vez otra columna: la lista de mensajes (`flex: 1` y `overflow-y: auto`) y el formulario para escribir.

```text
.chat               columna, height: 210px
├── header
└── .conversation   elemento flex (flex: 1) y columna    ← aquí va min-height: 0
    ├── ol.messages flex: 1; overflow-y: auto           ← aquí debería salir el scroll
    └── form
```

La lista tiene `overflow`, así que su mínimo ya es 0. Pero su padre, `.conversation`, es un elemento flex **sin** `overflow`: su `min-height: auto` vale el alto de todos los mensajes más el formulario. No encoge, se sale del panel, y la lista, que mide lo mismo que su contenido, no necesita su scroll.

[[exercise:05-scroll-anidado-y-min-height.md]]

La regla para encontrarlo: recorre los antepasados desde la zona que debería desplazarse hasta el contenedor de alto fijo. Cada elemento flex de ese camino que no tenga `overflow` necesita `min-height: 0`. Con un solo nivel (la lista como hija directa del panel) no hace falta nada, y por eso el error aparece justo cuando el diseño se complica.

## `flex-shrink: 1`: lo que no debería encoger

En un elemento flex, `width` no es una garantía: es la **base** de la que parte el algoritmo. Con `flex-shrink: 1`, el valor inicial, todos los elementos pierden su parte cuando falta sitio, también el avatar de 40px que hay junto a un texto largo. Como el encogimiento se pondera por la base, el avatar pierde poco… pero un círculo que pierde unos píxeles de ancho ya es un óvalo. Y un icono pintado con `background-image` no tiene contenido, así que su mínimo automático es 0 y puede estrecharse todavía más.

[[exercise:06-avatar-aplastado.md]]

Pon `flex-shrink: 0` (o `flex: none`) en todo lo que tenga un tamaño de diseño: avatares, iconos, miniaturas, insignias, interruptores. El texto de al lado sí puede partir sus líneas, así que absorbe todo el exceso.

## `align-items: stretch`: lo que no debería estirarse

El estiramiento por defecto es el que da tarjetas de la misma altura sin hacer nada. Pero se aplica a **todo** elemento cuyo tamaño en el eje cruzado sea `auto`, y hay elementos a los que estirar les sienta mal.

### Imágenes deformadas

Las fotos con los atributos `width` y `height` tienen un alto fijo… hasta que llega el reset de imágenes que lleva casi cualquier proyecto, `img { max-width: 100%; height: auto }`, que deja el alto en `auto`. En una fila flex, una foto con `height: auto` se estira hasta el alto del texto de al lado y se deforma.

[[exercise:07-imagen-estirada.md]]

Dos arreglos según lo que quieras: `align-self: flex-start` en la foto (o `align-items: flex-start` en el contenedor) si debe conservar su tamaño, u `object-fit: cover` si debe ocupar todo el alto, recortada en lugar de deformada. `object-fit` se estudia en el módulo de responsive.

### El `sticky` que no se pega, cuarta causa

La lección de `position` dejaba pendiente una cuarta causa de un `sticky` que no se pega. Una caja `sticky` nunca sale de su padre. En una fila flex con un índice lateral y un artículo largo, el padre del índice es la fila, que mide lo que el artículo. Y `align-items: stretch` estira el índice hasta ese mismo alto: mide lo que su padre y no tiene recorrido.

[[exercise:08-sticky-en-una-fila-flex.md]]

Es el mismo caso que el título dentro de una cabecera a su medida de aquella lección, provocado esta vez por el estiramiento. `align-self: flex-start` devuelve al índice su altura natural y, con ella, todo el recorrido del artículo. En grid, en el próximo módulo, pasa exactamente lo mismo, con el mismo arreglo.

## `order`, `*-reverse` y el orden de lectura

La propiedad `order` cambia la posición de un elemento flex en la línea. Vale `0` por defecto; los elementos se colocan de menor a mayor `order` y, a igualdad, en el orden del HTML. `order: -1` manda un elemento al principio, `order: 1` al final.

```css
.deals {
  order: -1;   /* se ve el primero, aunque en el HTML es el tercero */
}
```

`order`, `row-reverse`, `column-reverse` y `wrap-reverse` cambian dónde se **ve** cada elemento, pero no dónde **está** en el documento. La tecla <kbd>Tab</kbd> recorre los enlaces y botones en el orden del HTML, el lector de pantalla los lee en ese orden y la selección de texto con el ratón también lo sigue. Si los dos órdenes no coinciden, quien navega con teclado ve el foco saltar de un lado a otro, y quien usa un lector de pantalla oye «Siguiente» antes que «Anterior». Las pautas de accesibilidad WCAG lo recogen en dos criterios: *Orden del foco* (2.4.3) y *Secuencia con significado* (1.3.2).

En el ejemplo, haz clic en el texto gris que hay encima de cada caja (así el navegador empieza a contar desde ahí) y pulsa <kbd>Tab</kbd> varias veces; <kbd>Shift</kbd> + <kbd>Tab</kbd> va hacia atrás.

[[exercise:09-order-y-el-tabulador.md]]

El segundo caso es muy común: para pegar unos enlaces a la derecha se usa `row-reverse` y, como así salen al revés, se escribe el HTML al revés. Para alinear a la derecha basta `justify-content: flex-end` (o un margen automático), sin invertir nada.

`order` no está prohibido: es correcto cuando el orden visual no cambia el sentido de lo que se lee. El caso típico es una tarjeta que muestra la foto arriba mientras el título va primero en el HTML: la foto no recibe el foco y el lector de pantalla empieza por el título, que es lo importante.

```css
.card {
  display: flex;
  flex-direction: column;
}

.card img {
  order: -1;   /* arriba en pantalla; en el HTML, después del título */
}
```

### La solución moderna: `reading-flow`

A veces el orden visual tiene que cambiar de verdad, por ejemplo según el ancho de la pantalla, y no hay un único HTML que sirva para todos los casos. Para eso existe `reading-flow`, que se escribe en el **contenedor** y hace que el tabulador y los lectores de pantalla sigan otro orden para sus hijos directos, sin mover nada en pantalla:

| Valor | Orden de lectura de los hijos |
|---|---|
| `normal` (inicial) | el del HTML |
| `flex-visual` | el que se ve, en el sentido de lectura de la página (en español, de izquierda a derecha) |
| `flex-flow` | el del eje flex: con `row-reverse`, de derecha a izquierda |

Llegó en Chrome 137, en 2025; el aviso de arriba del ejemplo te dice si tu navegador lo entiende. Repite la prueba del tabulador:

[[exercise:10-reading-flow.md]]

`reading-flow` es una red de seguridad, no una excusa para descuidar el HTML: un navegador que no lo entienda lo ignora sin avisar y vuelve al orden del documento. Escribe siempre el HTML en el orden en que se lee, y usa `reading-flow` solo cuando el layout reordene los elementos por una buena razón. Grid tiene sus propios valores (`grid-rows`, `grid-columns`, `grid-order`), que verás en el próximo módulo.

## Cómo verlo en DevTools

- **Un elemento que no encoge.** Selecciónalo y busca en **Computed** su `min-width`: si dice `auto` y su ancho coincide con el de su contenido, es el suelo. Escribe `min-width: 0` en **Styles** y míralo encoger en directo.
- **Un scroll que no aparece.** En **Elements**, sube por los antepasados de la zona desplazable. Al pasar el ratón, cada uno muestra su alto: el elemento flex que sea más alto que el espacio que le deja su contenedor es el que necesita `min-height: 0`.
- **Algo estirado.** Con el overlay de flexbox activado (la insignia `flex`), compara el alto de cada elemento con el de su contenido. En **Computed**, `align-self: auto` significa que manda el `align-items` del contenedor.
- **El orden del foco.** En **Elements**, pestaña **Accessibility**, la casilla *Show source order* numera los elementos en el orden del HTML directamente sobre la página: si los números no van de izquierda a derecha, el teclado tampoco.

## Bestiario

- **Un bloque de código ensancha la página.** Síntoma: el contenido se sale del contenedor y aparece un scroll horizontal en toda la página, aunque el `<pre>` tiene `overflow-x: auto`. Causa: el elemento flex que contiene el `<pre>` tiene `min-width: auto` y no baja del ancho de la línea más larga. Solución: `min-width: 0` en ese elemento flex. → [ver ejemplo](02-pre-que-no-encoge.md)
- **`text-overflow: ellipsis` no aparece en una fila flex.** Síntoma: el texto con `nowrap`, `overflow: hidden` y `ellipsis` se sale de la fila sin puntos suspensivos. Causa: su padre es un elemento flex cuyo mínimo es la frase entera. Solución: `min-width: 0` en el elemento flex que contiene el texto. → [ver ejemplo](03-ellipsis-que-no-aparece.md)
- **Las columnas con `flex: 1` no son iguales.** Síntoma: una columna con un correo o una URL es mucho más ancha que las demás. Causa: el mínimo automático de esa columna es su palabra imposible de partir. Solución: `min-width: 0` en las columnas, y `overflow-wrap: anywhere` en el texto largo. → [ver ejemplo](04-flex-1-y-el-correo-largo.md)
- **La zona con `overflow: auto` no se desplaza.** Síntoma: en columnas flex anidadas, la lista no muestra scroll y lo que hay debajo se sale del panel. Causa: un elemento flex intermedio sin `overflow` tiene `min-height: auto` y mide lo que todo su contenido. Solución: `min-height: 0` en cada elemento flex intermedio sin `overflow`. → [ver ejemplo](05-scroll-anidado-y-min-height.md)
- **El avatar redondo sale ovalado.** Síntoma: un avatar, un icono o una miniatura con ancho fijo se estrecha junto a un texto largo. Causa: `flex-shrink: 1` lo hace encoger como a todos, y `width` solo es su base. Solución: `flex-shrink: 0` (o `flex: none`). → [ver ejemplo](06-avatar-aplastado.md)
- **La foto se deforma en una fila flex.** Síntoma: una imagen se estira en vertical hasta el alto del texto de al lado. Causa: con `height: auto`, `align-items: stretch` la estira. Solución: `align-self: flex-start` en la imagen, u `object-fit: cover` si debe ocupar el alto. → [ver ejemplo](07-imagen-estirada.md)
- **El índice `sticky` de una fila flex no se pega.** Síntoma: el índice lateral sube con el artículo. Causa: `align-items: stretch` lo hace tan alto como la fila, su padre, y no tiene recorrido. Solución: `align-self: flex-start`. → [ver ejemplo](08-sticky-en-una-fila-flex.md)
- **El foco salta de un lado a otro.** Síntoma: al pulsar <kbd>Tab</kbd>, el foco no sigue el orden en que se ven los enlaces. Causa: `order` o un `*-reverse` cambian el orden visual, pero el teclado y el lector de pantalla siguen el HTML. Solución: escribe el HTML en el orden de lectura; si el orden visual debe cambiar, `reading-flow: flex-visual` en el contenedor. → [ver ejemplo](09-order-y-el-tabulador.md)

## Resumen

- En un elemento flex, `min-width: auto` es el ancho mínimo de su contenido (`min-height: auto` en columnas); en el flujo normal vale 0.
- Ese suelo explica los bloques de código que ensanchan la página, los `ellipsis` que no salen y las columnas `flex: 1` desiguales: `min-width: 0` en el elemento flex lo quita.
- Un contenedor de scroll (`overflow` distinto de `visible` y `clip`) no tiene mínimo automático; en columnas anidadas, cada elemento flex intermedio sin `overflow` necesita `min-height: 0`.
- `width` es solo la base: lo que no debe encoger lleva `flex-shrink: 0` o `flex: none`.
- `align-items: stretch` deforma las imágenes con `height: auto` y deja sin recorrido a un `sticky`: `align-self: flex-start`.
- `order` y `*-reverse` solo cambian lo que se ve; el teclado y los lectores de pantalla siguen el HTML.
- `reading-flow: flex-visual` (Chrome 137+) hace que la lectura siga el orden visual, pero el HTML debe seguir en el orden correcto.

## Para profundizar

- [Especificación: Automatic Minimum Size of Flex Items](https://www.w3.org/TR/css-flexbox-1/#min-size-auto)
- [Ahmad Shadeed: The Minimum Content Size In CSS Flexbox](https://ishadeed.com/article/min-content-size-css-flexbox/)
- [CSS-Tricks: Flexbox and Truncated Text](https://css-tricks.com/flexbox-truncated-text/)
- [MDN: order](https://developer.mozilla.org/es/docs/Web/CSS/order)
- [Chrome for Developers: reading-flow y reading-order](https://developer.chrome.com/blog/reading-flow)
