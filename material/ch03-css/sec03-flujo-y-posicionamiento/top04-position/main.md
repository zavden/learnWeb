# Posicionamiento con position

## Por qué importa

Una insignia «−20 %» en la esquina de una tarjeta, el texto encima de una foto, un menú que se despliega sobre el contenido, una cabecera que se queda arriba al hacer scroll, un botón de «Subir» siempre visible. Nada de eso se puede hacer con el flujo normal, porque en el flujo normal nada se superpone y todo se empuja. Para esto existe `position`.

En el módulo anterior, las tarjetas profesionales montaban insignias y puntos de estado con márgenes negativos, «sin posicionamiento». Funcionaba, pero dependía de medidas exactas. Con `position` lo harás de la forma habitual. Y conocerás sus dos sorpresas más famosas: el `fixed` que deja de estar fijo y el `sticky` que no se pega.

## Los cinco valores

| Valor | ¿En el flujo? | Los desplazamientos (`top`…) se miden desde… | ¿Se mueve con el scroll? |
|---|---|---|---|
| `static` (por defecto) | sí | no tienen efecto | sí |
| `relative` | sí, conserva su hueco | su propia posición normal | sí |
| `absolute` | **no** | el borde de relleno de su **bloque contenedor** | sí, con su bloque contenedor |
| `fixed` | **no** | la **ventana** (viewport) | **no** |
| `sticky` | sí, conserva su hueco | el contenedor de scroll más cercano, al cruzar el umbral | hasta que se «pega» |

Cualquier valor distinto de `static` hace que la caja esté **posicionada**. Solo las cajas posicionadas aceptan los desplazamientos y `z-index` (que verás en la próxima lección).

## Los desplazamientos: `top`, `right`, `bottom`, `left` e `inset`

Los cuatro desplazamientos (*offsets*) indican la distancia desde un lado de la referencia. Un valor positivo **aleja** la caja de ese lado hacia dentro: `top: 10px` la baja, `left: 10px` la lleva a la derecha. Admiten longitudes, porcentajes (del bloque contenedor) y `auto`.

`inset` es su atajo, con el mismo orden que `margin` (arriba, derecha, abajo, izquierda): `inset: 0` es `top: 0; right: 0; bottom: 0; left: 0`. También tiene versiones lógicas, `inset-block` e `inset-inline`, que se adaptan al sentido de escritura.

## `static` y `relative`

En una caja `static`, los desplazamientos se ignoran sin avisar: es el primer «no me hace caso» de `position`. Con `relative`, la caja se coloca en el flujo como siempre, ocupa su sitio y **después** se dibuja desplazada. Nadie se entera del desplazamiento: los vecinos no se mueven y el hueco original sigue reservado.

[[exercise:01-static-y-relative.md]]

Desplazar cajas con `relative` es poco frecuente. Su uso principal es otro: una caja `relative`, aunque no se mueva, se convierte en la **referencia** de sus descendientes `absolute`.

## `absolute`

`position: absolute` saca la caja del flujo por completo: no ocupa sitio, sus vecinos se comportan como si no existiera y ella se coloca con los desplazamientos respecto a su **bloque contenedor**.

### El bloque contenedor

En la lección de unidades del primer módulo viste que los porcentajes se calculan sobre el «bloque contenedor», que «suele ser el padre». Estas son las excepciones que se anunciaban:

| La caja es… | Su bloque contenedor es… |
|---|---|
| `static`, `relative`, `sticky` o flotante | el área de contenido del antepasado de bloque más cercano (normalmente, el padre) |
| `absolute` | el área de **relleno** (*padding box*) del antepasado **posicionado** más cercano; si no hay ninguno, el **bloque contenedor inicial**: un rectángulo del tamaño de la ventana en lo alto de la página |
| `fixed` | la **ventana**, salvo que un antepasado tenga `transform`, `filter` y algunas propiedades más (lo verás enseguida) |

Por eso la pareja más usada de CSS es «padre `relative`, hijo `absolute`»: el `relative` sin desplazamientos no cambia nada del padre, pero lo convierte en la referencia del hijo. Si se te olvida, la insignia de la tarjeta se va a la esquina de la página.

[[exercise:02-absolute-y-su-bloque-contenedor.md]]

### Esquinas, franjas, capas y centrado

Con los desplazamientos se consiguen los cuatro patrones más habituales:

- **Una esquina**: dos desplazamientos (`top` y `right`). La caja mide lo que su contenido (*shrink-to-fit*), como un `inline-block`; una caja `absolute` siempre se convierte en bloque, así que un `<span>` acepta `width` y `height`.
- **Una franja estirada**: dos desplazamientos opuestos (`left: 0; right: 0`) con `width: auto` estiran la caja de un lado a otro.
- **Una capa que lo cubre todo**: `inset: 0`.
- **Una caja centrada**: `inset: 0` + un ancho y un alto + `margin: auto`. Es el único caso en el que `margin: auto` centra también en vertical sin flexbox ni grid.

[[exercise:03-offsets-e-inset.md]]

Los porcentajes de `width`, `height` y de los desplazamientos se calculan sobre el bloque contenedor. Y, a diferencia del flujo normal, en una caja `absolute` el `height` en porcentaje funciona aunque el bloque contenedor tenga altura `auto`: cuando se coloca la caja absoluta, la altura de su referencia ya se conoce.

### Sin desplazamientos: la posición estática

Si no le das ningún desplazamiento (todos en `auto`), una caja `absolute` se queda en su **posición estática**: justo donde estaría en el flujo. La diferencia es que ya no ocupa sitio, así que lo siguiente sube y ella queda encima. Es la base de un menú desplegable: aparece debajo de su botón sin empujar el contenido de la página.

[[exercise:04-absolute-sin-desplazamientos.md]]

## `fixed`

`position: fixed` es como `absolute`, pero su referencia es la **ventana**: al desplazar la página, la ventana no se mueve, así que la caja tampoco. Se usa para barras de navegación, avisos de cookies, botones de chat o de «Subir». En LearnWeb, la ventana es el marco de la vista previa: para ver el efecto, desplaza la vista previa (o ábrela en su pestaña con ↗).

[[exercise:05-fixed.md]]

Como una caja `fixed` no ocupa sitio, tapa lo que tenga debajo: hay que reservarle el hueco (un `padding-top` en la página igual a la altura de la barra). Y con medida, porque cada píxel fijo es un píxel menos de contenido, sobre todo en un móvil en horizontal.

### `transform` en un antepasado

Aquí está la primera sorpresa. Una caja `fixed` se coloca respecto a la ventana **solo si ningún antepasado lo impide**. Si un antepasado tiene `transform` (aunque sea `translateX(0)`, que no mueve nada), ese antepasado pasa a ser su bloque contenedor: la caja fija se coloca en las esquinas del antepasado y se desplaza con él. `transform` se estudia en el módulo de efectos visuales; aquí solo importa como causa del problema.

[[exercise:06-transform-y-fixed.md]]

| Propiedad en un antepasado | Valor que lo provoca |
|---|---|
| `transform`, `translate`, `rotate`, `scale`, `perspective` | cualquiera distinto de `none` |
| `filter`, `backdrop-filter` | cualquiera distinto de `none` |
| `will-change` | `transform`, `filter` o `perspective` |
| `contain` | `layout`, `paint`, `strict` o `content` |

Las mismas propiedades convierten al antepasado en el bloque contenedor de los descendientes `absolute`. Suele aparecer cuando una librería de animaciones añade un `transform` a un contenedor o alguien pone `will-change: transform` «por rendimiento». La solución es sacar el elemento fijo de ese antepasado: los modales, avisos y botones flotantes suelen ir al final del `<body>`.

## `sticky`

`position: sticky` es un híbrido: la caja se comporta como `relative` (en el flujo, ocupando su sitio) hasta que el scroll la llevaría más allá de un **umbral**, por ejemplo `top: 0`; a partir de ahí se queda «pegada» en ese punto. Dos reglas lo controlan todo:

- Se pega dentro de su **contenedor de scroll más cercano**: el antepasado más próximo con `overflow` distinto de `visible` y de `clip`, o la ventana si no hay ninguno.
- **Nunca sale de su padre** (su bloque contenedor). Cuando el padre termina, la caja se va con él. Así, en una agenda, la cabecera de cada letra se queda arriba mientras dura su grupo y la siguiente la empuja.

[[exercise:07-sticky.md]]

Una caja `sticky` necesita un fondo: si no, se ve el contenido que pasa por debajo.

### El `sticky` que no se pega

Es la queja más frecuente sobre `position`. Casi siempre es una de estas causas:

1. **Falta el umbral.** Sin `top` (o `bottom`, `left`, `right`), `sticky` se comporta como `relative`.
2. **Un antepasado con `overflow`.** Si entre la caja y el contenedor que se desplaza de verdad hay un antepasado con `overflow: hidden`, `auto` o `scroll`, ese antepasado es su contenedor de scroll… y como no se desplaza nunca, la caja no se pega. Pasa mucho con `overflow: hidden` puesto para recortar unas esquinas redondeadas, y con `html, body { overflow-x: hidden }`, que convierte el `<body>` en un contenedor de scroll. Si solo querías recortar, `overflow: clip` recorta sin crear un contenedor de scroll.
3. **El padre mide lo mismo que la caja.** Como `sticky` no sale de su padre, si el padre es un envoltorio a su medida, no hay recorrido. Pon `sticky` en el componente entero, no en el título que lleva dentro.

[[exercise:08-sticky-y-el-overflow.md]]

[[exercise:09-sticky-y-su-padre.md]]

En los módulos de flexbox y grid verás una cuarta causa: un hijo de flex o grid se estira hasta la altura de su fila y tampoco tiene recorrido.

## `position` y accesibilidad

`position` cambia dónde se **ve** una caja, no dónde **está** en el documento. Un lector de pantalla y la tecla <kbd>Tab</kbd> siguen el orden del HTML. Escribe el HTML en el orden lógico de lectura y usa `position` para decorar, no para reordenar. Y vigila que una barra `fixed` o `sticky` no tape el elemento que recibe el foco al navegar con <kbd>Tab</kbd>.

## Cómo verlo en DevTools

Si una caja `absolute` o `fixed` aparece donde no esperas, selecciónala en **Elements** y sube por sus antepasados mirando en **Computed** su `position`, `transform`, `filter` y `contain`: el primero que no sea el valor por defecto es su referencia. Para un `sticky` que no se pega, busca en los antepasados un `overflow` distinto de `visible` y `clip`, y comprueba que su padre sea más alto que ella.

## Bestiario

- **Mi elemento `absolute` se va a la esquina de la página.** Síntoma: una insignia con `top: 8px; right: 8px` aparece arriba a la derecha de la página, no de su tarjeta. Causa: ningún antepasado está posicionado, así que su bloque contenedor es el inicial. Solución: `position: relative` en la tarjeta. → [ver ejemplo](02-absolute-y-su-bloque-contenedor.md)
- **Mi elemento `fixed` se desplaza con la página.** Síntoma: un botón o un aviso `fixed` aparece en la esquina de un panel y se va al hacer scroll. Causa: un antepasado tiene `transform`, `filter`, `will-change` o `contain`, y se convierte en su bloque contenedor. Solución: saca el elemento fijo de ese antepasado (al final del `body`). → [ver ejemplo](06-transform-y-fixed.md)
- **Mi cabecera `sticky` no se pega (por un `overflow`).** Síntoma: la cabecera se va con el contenido. Causa: un antepasado con `overflow: hidden` o `auto` es su contenedor de scroll y no se desplaza. Solución: quita ese `overflow` o cámbialo por `overflow: clip`. → [ver ejemplo](08-sticky-y-el-overflow.md)
- **Mi cabecera `sticky` no se pega (por su padre o por el umbral).** Síntoma: igual que el anterior, sin ningún `overflow` a la vista. Causa: su padre mide lo mismo que ella y no le deja recorrido, o falta `top`. Solución: pon `sticky` en el elemento cuyo padre es el contenedor largo, con un umbral. → [ver ejemplo](09-sticky-y-su-padre.md)

## Resumen

- `position` distinto de `static` hace la caja posicionada: acepta `top`, `right`, `bottom`, `left` (o `inset`) y `z-index`.
- `relative` dibuja la caja desplazada sin moverla del flujo; sobre todo sirve de referencia a sus hijos `absolute`.
- `absolute` sale del flujo y se coloca respecto al borde de relleno del antepasado posicionado más cercano (o del bloque contenedor inicial). Sin desplazamientos, se queda en su posición estática.
- Dos desplazamientos opuestos estiran la caja; `inset: 0` + tamaño + `margin: auto` la centra.
- `fixed` se coloca respecto a la ventana, salvo que un antepasado con `transform`, `filter`, `contain`… se convierta en su referencia.
- `sticky` se pega en su contenedor de scroll más cercano al cruzar un umbral y nunca sale de su padre.
- `position` no cambia el orden de lectura: el HTML debe estar en orden lógico.

## Para profundizar

- [MDN: position](https://developer.mozilla.org/es/docs/Web/CSS/position)
- [MDN: Layout and the containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block)
- [MDN: inset](https://developer.mozilla.org/es/docs/Web/CSS/inset)
- [web.dev: Positioning (Learn CSS)](https://web.dev/learn/css/positioning)
- [Polypane: All the ways position: sticky can fail](https://polypane.app/blog/getting-stuck-all-the-ways-position-sticky-can-fail/)
