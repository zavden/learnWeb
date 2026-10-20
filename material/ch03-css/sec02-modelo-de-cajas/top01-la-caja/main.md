# La caja

## Por qué importa

Para el navegador, una página no es texto con colores: es un montón de **rectángulos**. Cada elemento que se muestra genera una caja (a veces varias), y todo el trabajo de maquetar consiste en decidir cuánto mide cada caja y dónde va. Incluso un avatar redondo es una caja cuadrada con las esquinas recortadas.

Casi todos los «¿por qué esto se sale 28 píxeles?» o «¿de dónde sale este hueco?» se resuelven sabiendo qué partes tiene una caja y cuáles cuenta `width`. Este módulo va de eso: la caja (esta lección), cómo participa en el flujo (`display`), sus márgenes, sus tamaños, qué pasa cuando el contenido no cabe (`overflow`) y cómo se decora (bordes, sombras y fondos).

## Las cuatro áreas

Toda caja tiene cuatro áreas concéntricas. De dentro afuera:

```text
┌─────────────────────────── margin ───────────────────────────┐
│   ┌─────────────────────── border ───────────────────────┐   │
│   │   ┌─────────────────── padding ──────────────────┐   │   │
│   │   │   ┌─────────────── content ──────────────┐   │   │   │
│   │   │   │  texto, imágenes, elementos hijos    │   │   │   │
│   │   │   └──────────────────────────────────────┘   │   │   │
│   │   └──────────────────────────────────────────────┘   │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

| Área | Qué es | ¿Se pinta con el fondo de la caja? | Propiedades |
|---|---|---|---|
| **content** (contenido) | donde van el texto y los hijos | sí | `width`, `height` |
| **padding** (relleno) | espacio entre el contenido y el borde | sí | `padding`, `padding-top`… |
| **border** (borde) | la línea que rodea el relleno | tiene su propio color (el fondo sigue debajo) | `border`, `border-width`… |
| **margin** (margen) | espacio fuera del borde, que separa de las vecinas | **no**: siempre transparente | `margin`, `margin-top`… |

La diferencia práctica entre `padding` y `margin`: el padding está **dentro** de la caja (agranda la zona coloreada y la zona donde se puede hacer clic); el margen está **fuera** (deja ver lo que haya detrás, normalmente el fondo del padre).

En este ejemplo cada área tiene un color. Son los mismos que usa DevTools al inspeccionar: azul el contenido, verde el padding, amarillo el borde y naranja el margen.

[[exercise:01-las-cuatro-areas.md]]

### El diagrama de DevTools

No hace falta adivinar las medidas de ninguna caja. Haz clic derecho sobre un elemento → **Inspeccionar**, y en el panel **Elements** abre la pestaña **Computed**: arriba aparece el diagrama de la caja con los píxeles de cada área, y puedes hacer doble clic en un número para cambiarlo. Además, al pasar el ratón por un nodo del árbol de Elements, la página resalta sus cuatro áreas con esos mismos colores.

Si quieres DevTools solo para el ejemplo, sin el resto de LearnWeb alrededor, usa el botón ↗ de la barra de la vista previa: abre el ejemplo como una página normal en otra pestaña.

## Escribir los cuatro lados

`padding` y `margin` son **atajos** (*shorthands*) de cuatro propiedades: `padding-top`, `padding-right`, `padding-bottom` y `padding-left` (y lo mismo con `margin-`). Aceptan de uno a cuatro valores, que se reparten así:

| Valores | Ejemplo | Arriba | Derecha | Abajo | Izquierda |
|---|---|---|---|---|---|
| 1 | `padding: 16px` | 16 | 16 | 16 | 16 |
| 2 | `padding: 8px 48px` | 8 | 48 | 8 | 48 |
| 3 | `padding: 4px 48px 28px` | 4 | 48 | 28 | 48 |
| 4 | `padding: 4px 8px 28px 64px` | 4 | 8 | 28 | 64 |

Con cuatro valores se recorre la caja **en el sentido de las agujas del reloj** empezando por arriba (top, right, bottom, left). Con menos, cada lado que falta copia a su opuesto.

También existen las propiedades **lógicas** `padding-inline` (izquierda y derecha en un texto como este) y `padding-block` (arriba y abajo), con sus equivalentes `margin-inline` y `margin-block`. Son muy cómodas (`margin-inline: auto` centra una caja, lo verás en la lección de márgenes) y su nombre tiene una razón de ser que verás en la lección de modos de escritura.

[[exercise:02-atajos-de-cuatro-lados.md]]

Los porcentajes de `padding` y `margin` se calculan siempre sobre el **ancho** del contenedor, también los de arriba y abajo: lo viste en la lección de unidades.

## El borde

El atajo `border` reúne tres propiedades, en cualquier orden:

```css
.card {
  border: 2px solid #2563eb;   /* border-width  border-style  border-color */
}
```

Cada una tiene a su vez versiones por lado (`border-top`, `border-left-color`, `border-bottom-width`…) y admiten de uno a cuatro valores, igual que `padding`. Los estilos más usados son `solid`, `dashed`, `dotted` y `double`; el catálogo completo está en la lección de bordes, sombras y fondos.

De las tres, la única imprescindible es `border-style`: su valor inicial es `none`, y un borde sin estilo **no existe**, aunque le des ancho y color. Como los atajos ponen a su valor inicial todo lo que no escribes, `border: 4px #2563eb` deja el estilo en `none` y no dibuja nada:

[[exercise:03-borde-sin-estilo.md]]

## ¿Qué mide `width`? El modelo content-box

Esta es la pieza que más sorprende al principio: con los valores por defecto, `width` y `height` **no** son el tamaño de la caja que ves, sino el de su **área de contenido**. El padding y el borde se añaden por fuera:

```text
.box { width: 200px; padding: 20px; border: 5px solid; }

ancho en pantalla = border + padding + width + padding + border
                  =   5    +   20    +  200  +   20    +   5     = 250px
```

El margen tampoco cuenta en `width`, pero sí en el espacio que la caja ocupa en la página: en este caso, 250px de caja más los márgenes de cada lado.

Este comportamiento se llama `box-sizing: content-box` y es el valor inicial de la propiedad `box-sizing`. El ejemplo mide las cajas con una línea de JavaScript (lo verás en su capítulo; aquí solo escribe un número en pantalla) para que el resultado no dependa de tu vista:

[[exercise:04-width-es-el-contenido.md]]

### El clásico: `width: 100%` que se sale

Con content-box, `width: 100%` significa «el contenido de esta caja mide lo mismo que el contenido del padre». Si además tiene padding o borde, la caja entera es **más ancha que su padre** y asoma por un lado. El caso más típico es un campo de formulario, porque los campos de texto usan content-box en la hoja del navegador:

[[exercise:05-width-100-desborda.md]]

## box-sizing: border-box

Con `box-sizing: border-box`, `width` y `height` miden **de borde a borde**. Añadir padding o borde ya no agranda la caja: encoge el contenido.

```text
.box { box-sizing: border-box; width: 240px; padding: 0 70px; }

contenido = 240 − 70 − 70 = 100px        ancho en pantalla = 240px
```

[[exercise:06-border-box.md]]

Es tan cómodo que casi todas las hojas profesionales empiezan con este reset:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Los pseudoelementos no los elige `*`, por eso se nombran aparte. Con el reset, «este campo mide el 100%» y «esta tarjeta mide 300px» significan exactamente lo que dicen, aunque luego cambies el padding.

Dos detalles:

- Algunos controles ya usan `border-box` en la hoja del navegador (los botones, por ejemplo), pero los campos de texto y los `textarea`, no. Por eso el reset universal evita sorpresas.
- `border-box` tiene un límite: el contenido no puede medir menos de 0. Si padding más borde suman más que `width`, la caja crece lo justo para que quepan.

## outline: un borde que no ocupa sitio

`outline` dibuja una línea alrededor de la caja, por fuera del borde, pero **no forma parte del modelo de cajas**: no ocupa espacio, no empuja a nadie y no cambia ninguna medida.

| | `border` | `outline` |
|---|---|---|
| Ocupa espacio | sí (agranda la caja) | no (se dibuja encima de lo que haya) |
| Lados distintos | sí (`border-top`…) | no: los cuatro iguales |
| Separación | — | `outline-offset` (también negativa) |
| Esquinas redondeadas | sí | sí, sigue el `border-radius` en los navegadores actuales |
| Uso típico | decoración, separadores | indicador de foco, depuración |

Por eso el navegador usa `outline` para marcar el elemento con el foco del teclado (`:focus-visible`): puede aparecer y desaparecer sin mover la página. Si cambias el borde en `:hover` o `:focus`, en cambio, la caja crece y las vecinas saltan:

[[exercise:07-borde-en-hover-salta.md]]

No quites el `outline` de foco (`outline: none`) sin poner otro indicador igual de visible: quien navega con teclado se queda sin saber dónde está.

### El truco de depuración

Como no mueve nada, `outline` es perfecto para ver todas las cajas de una página de golpe. Con `border`, el propio truco cambiaría el layout que intentas observar:

```css
* { outline: 1px solid red; }
```

[[exercise:08-outline-para-depurar.md]]

## Medir una caja desde JavaScript

Cuando necesites una medida exacta, JavaScript ofrece varias lecturas y cada una mide un área distinta. Es un adelanto del capítulo de JavaScript; quédate con la tabla:

| Lectura | Mide | content-box (`200px` + 20 + 5) | border-box |
|---|---|---|---|
| `getComputedStyle(el).width` | el valor de la propiedad `width` | 200px | 200px |
| `el.clientWidth` | contenido + padding (sin borde ni barra de desplazamiento) | 240 | 190 |
| `el.offsetWidth` | de borde a borde, redondeado | 250 | 200 |
| `el.getBoundingClientRect().width` | de borde a borde, con decimales | 250 | 200 |

[[exercise:09-medir-la-caja-con-js.md-]]

Pulsa «▶ Run» para ver la tabla rellenada por el navegador. Ninguna lectura incluye el margen.

## Bestiario

- **El borde no aparece.** *Síntoma:* escribes `border: 4px #2563eb` (o `border-width` y `border-color`) y no se ve nada. *Causa:* falta `border-style`, cuyo valor inicial es `none`; un borde sin estilo no se dibuja y su ancho calculado es 0. *Solución:* incluye siempre el estilo: `border: 4px solid #2563eb`. [Ver ejemplo](03-borde-sin-estilo.md).
- **`width: 100%` se sale del contenedor.** *Síntoma:* un campo o una tarjeta al 100% asoma por la derecha de su padre. *Causa:* con `box-sizing: content-box`, el 100% es solo el contenido; el padding y el borde se suman por fuera. *Solución:* `box-sizing: border-box` (mejor, el reset universal al principio de la hoja). [Ver ejemplo](05-width-100-desborda.md).
- **Al pasar el ratón, todo da un salto.** *Síntoma:* un botón o un enlace se agranda en `:hover` y empuja a sus vecinos. *Causa:* cambiar el ancho del borde cambia el tamaño de la caja. *Solución:* usa `outline` (o `box-shadow`, lección 6), o reserva el borde desde el principio con color `transparent` y cambia solo el color. [Ver ejemplo](07-borde-en-hover-salta.md).

## Resumen

- Cada elemento genera una caja con cuatro áreas: contenido, padding, borde y margen. El fondo cubre contenido y padding; el margen es transparente.
- `padding` y `margin` admiten de 1 a 4 valores en el sentido de las agujas del reloj (arriba, derecha, abajo, izquierda); `-inline` y `-block` agrupan los lados horizontales y verticales.
- Un borde necesita `border-style`; sin él no existe.
- Con `content-box` (por defecto), `width` mide solo el contenido y padding y borde se suman; con `border-box`, `width` mide de borde a borde.
- Empieza tus hojas con `*, *::before, *::after { box-sizing: border-box; }`.
- `outline` no ocupa espacio: úsalo para el foco y para depurar, nunca lo quites sin alternativa.
- DevTools → Elements → **Computed** muestra el diagrama de la caja con sus medidas.

## Para profundizar

- [MDN: The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model)
- [web.dev: Box Model](https://web.dev/learn/css/box-model)
- [MDN: box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)
- [CSS-Tricks: Inheriting box-sizing Probably Slightly Better Best-Practice](https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice/)
- [Chrome DevTools: View and change CSS (Computed y el diagrama de cajas)](https://developer.chrome.com/docs/devtools/css)
