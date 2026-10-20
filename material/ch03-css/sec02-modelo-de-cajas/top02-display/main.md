# La propiedad display

## Por qué importa

En la lección anterior viste qué partes tiene una caja. Pero no todas las cajas se comportan igual: un párrafo empieza en una línea nueva y ocupa todo el ancho, mientras que un enlace se queda dentro de la línea de texto, y si le pones `width` lo ignora. Esa diferencia la decide una sola propiedad, `display`. Entenderla explica la mitad de los «¿por qué no me hace caso?» de CSS, y es la puerta de entrada a flexbox y grid, que también son valores de `display`.

## Cada elemento trae su display

Ningún elemento «es» de bloque o en línea por naturaleza: lo es porque la hoja de estilos del navegador le da un `display`. Por ejemplo, `div, p, h1, ul { display: block }`, `li { display: list-item }` o `head, script { display: none }`. Los elementos que no aparecen en esa hoja (`span`, `a`, `strong`…) se quedan con el valor inicial de la propiedad, que es `inline`.

[[exercise:01-display-por-defecto.md]]

| display | Elementos que lo traen por defecto |
|---|---|
| `block` | `div`, `p`, `h1`…`h6`, `ul`, `ol`, `section`, `article`, `header`, `form`… |
| `list-item` | `li` (un bloque que además genera el marcador `::marker`) |
| `inline` | `span`, `a`, `strong`, `em`, `code`, `label`, **`img`**… |
| `inline-block` | `button`, `input`, `select`, `textarea` |
| `table`, `table-row`, `table-cell`… | los elementos de las tablas |
| `none` | `head`, `script`, `style`, `template`, cualquiera con el atributo `hidden` |

Que `img` sea `inline` y aun así acepte `width` y `height` no es una contradicción: las imágenes son elementos **reemplazados** (su contenido viene de fuera del CSS), y los reemplazados en línea se comportan como un `inline-block`.

## Cajas de bloque

Una caja de bloque (`display: block`):

- empieza en una **línea nueva** y la siguiente caja va debajo, aunque quepa al lado;
- con `width: auto`, ocupa **todo el ancho** de su contenedor (lo verás en detalle en la lección de tamaños);
- respeta `width`, `height`, `padding`, `border` y `margin` en las cuatro direcciones.

## Cajas en línea

Una caja en línea (`display: inline`) forma parte del texto:

- se coloca a continuación de lo anterior, dentro de la misma línea;
- mide lo que mide su contenido y, si no cabe, **se parte** entre varias líneas (y entonces ya no es un rectángulo, sino varios fragmentos);
- la altura de las líneas la decide el texto, no la caja.

[[exercise:02-bloque-y-en-linea.md]]

De ahí sale la sorpresa más frecuente de esta lección. En una caja en línea:

| Propiedad | ¿Tiene efecto? |
|---|---|
| `width`, `height` | **no**: se ignoran |
| `margin-left`, `margin-right` | sí: separan horizontalmente |
| `margin-top`, `margin-bottom` | **no**: no apartan nada |
| `padding` y `border` horizontales | sí |
| `padding` y `border` verticales | se **pintan**, pero no empujan las líneas: invaden las de arriba y abajo |

Ninguna de esas declaraciones es inválida, así que el navegador no avisa. DevTools sí da una pista: en **Elements → Styles**, junto a `width` en un elemento inline, aparece un icono de información que explica que la propiedad no tiene efecto con ese `display`.

[[exercise:03-inline-ignora-width-y-margin.md]]

## inline-block: lo mejor de los dos

`display: inline-block` genera una caja que **hacia fuera** se comporta como en línea (se coloca en la línea, junto al texto, y salta a la siguiente como una palabra) y **hacia dentro** es un bloque: respeta `width`, `height`, márgenes y relleno en todas las direcciones. Es el display de los botones y los campos de formulario.

[[exercise:04-inline-block.md]]

Dos efectos secundarios de vivir dentro de una línea de texto:

- El espacio en blanco del HTML entre dos `inline-block` (un salto de línea, por ejemplo) se ve como un espacio. Lo viste en la lección del parser de HTML.
- Se alinean por la **línea base** del texto, lo que a veces deja huecos o desniveles. Lo verás a fondo en el módulo de flujo y posicionamiento (lección del contexto inline).

## El display es solo presentación

Cambiar el `display` de un elemento no cambia lo que **es**: una lista sigue siendo una lista y un enlace, un enlace. Por eso se elige el elemento por su significado y después se le da la caja que convenga. Dos casos clásicos:

- Un menú horizontal: los `li` pasan a `inline` (y, al dejar de ser `list-item`, pierden la viñeta).
- Un menú vertical cómodo: los `a` pasan a `block`, para que la zona de clic sea la fila entera y no solo las letras.

[[exercise:05-cambiar-el-display.md]]

## display: none y el atributo hidden

`display: none` elimina la caja por completo: no ocupa espacio, no se pinta, no recibe clics y desaparece para los lectores de pantalla. Sus hijos tampoco generan caja, digan lo que digan. Lo comparaste con `visibility: hidden` y `opacity: 0` en la lección «Del HTML a los píxeles».

El atributo `hidden` funciona gracias a una regla de la hoja del navegador, `[hidden] { display: none }`. Y como cualquier declaración de tu hoja gana a las del navegador, basta con darle otro `display` al elemento, aunque sea con una simple clase, para que `hidden` deje de ocultar:

[[exercise:06-hidden-pierde-contra-display.md]]

La solución habitual es añadir al principio de la hoja:

```css
[hidden] {
  display: none !important;
}
```

Es uno de los pocos usos razonables de `!important`: no gana una pelea de especificidad, sino que garantiza el significado de un atributo.

## display: contents

`display: contents` hace que el elemento **no genere caja**, pero sus hijos sí: se colocan como si estuvieran directamente dentro del abuelo. Desaparece todo lo que es de la caja (borde, relleno, fondo, márgenes, tamaño); se conserva lo que es del elemento (los selectores lo siguen eligiendo y sus propiedades heredadas siguen llegando a los hijos).

[[exercise:07-display-contents.md]]

En el flujo normal tiene poca utilidad. Brillará con flexbox y grid, cuando quieras que los hijos de un envoltorio participen en el layout de su abuelo. Úsalo en `div` y `span`; en elementos con significado (`button`, `ul`, `table`…) algunos navegadores han tenido fallos que también los borraban para los lectores de pantalla.

## display: flow-root

`display: flow-root` crea una caja de bloque, igual que `block` por fuera, pero por dentro establece un **contexto de formateo de bloque** (*block formatting context*, BFC): una frontera que los márgenes de los hijos no atraviesan y que, más adelante, también encerrará a los elementos flotantes.

```text
display: block                          display: flow-root
                                         
   ↑ 24px (el margen del h3 sale)        ┌──────────────────────┐
┌──────────────────────┐                 │  ↑ 24px              │
│ Título               │                 │  Título              │
│ texto…               │                 │  texto…              │
└──────────────────────┘                 └──────────────────────┘
```

[[exercise:08-flow-root.md]]

Ese «margen que se escapa del padre» es el **colapso de márgenes**, la estrella de la próxima lección. Qué es exactamente un BFC y qué otras cosas lo crean lo verás en el módulo de flujo y posicionamiento; de momento, quédate con que `flow-root` es la forma limpia de pedirlo.

## Tipo exterior y tipo interior

Desde hace poco, `display` puede escribirse con **dos palabras**, que separan las dos preguntas que siempre ha respondido:

- **Tipo exterior**: cómo se comporta la caja entre sus hermanos. `block` (línea propia) o `inline` (dentro de una línea).
- **Tipo interior**: cómo coloca a sus hijos. `flow` (flujo normal), `flow-root` (flujo normal con su propio BFC), `flex`, `grid`, `table`…

Las palabras de siempre son atajos de esas parejas:

| Una palabra | Dos palabras | Exterior | Interior |
|---|---|---|---|
| `block` | `block flow` | bloque | flujo normal |
| `inline` | `inline flow` | en línea | flujo normal |
| `inline-block` | `inline flow-root` | en línea | flujo con BFC propio |
| `flow-root` | `block flow-root` | bloque | flujo con BFC propio |
| `list-item` | `block flow list-item` | bloque | flujo normal + marcador |
| `flex` / `inline-flex` | `block flex` / `inline flex` | bloque / en línea | flexbox |
| `grid` / `inline-grid` | `block grid` / `inline grid` | bloque / en línea | grid |

`none` y `contents` son aparte: deciden si hay caja, no cómo es. En la práctica seguirás escribiendo la forma corta (DevTools y JavaScript también la muestran así), pero pensar en «exterior + interior» te servirá para entender por qué `inline-flex` existe y qué significa.

[[exercise:09-tipo-exterior-e-interior.md]]

## Bestiario

- **`width`, `height` o `margin-top` no hacen nada.** *Síntoma:* le das tamaño o margen vertical a un `span`, un `a` o un `strong` y no cambia nada; el padding vertical se monta sobre las líneas vecinas. *Causa:* son cajas `inline`: su tamaño lo decide el texto y la altura de las líneas no depende de ellas. *Solución:* `display: inline-block` si debe seguir en la línea, o `block` si debe ocupar la suya. [Ver ejemplo](03-inline-ignora-width-y-margin.md).
- **Un elemento con `hidden` se sigue viendo.** *Síntoma:* el atributo `hidden` no oculta un componente. *Causa:* `hidden` solo es la regla `[hidden] { display: none }` de la hoja del navegador, y cualquier `display` de tu hoja le gana. *Solución:* `[hidden] { display: none !important; }` al principio de la hoja. [Ver ejemplo](06-hidden-pierde-contra-display.md).

## Resumen

- `display` decide el tipo de caja; cada elemento recibe el suyo de la hoja del navegador y el valor inicial es `inline`.
- Bloque: línea propia, todo el ancho, respeta todas las medidas. En línea: fluye con el texto, se parte entre líneas e ignora `width`, `height` y los márgenes verticales.
- `inline-block`: en la línea por fuera, bloque por dentro. Es el display de botones y campos.
- Cambiar `display` no cambia el significado del elemento: elige el HTML por semántica y la caja con CSS.
- `display: none` elimina la caja; `hidden` es solo `display: none` de la hoja del navegador y cualquier `display` tuyo lo anula.
- `contents` quita la caja y deja a los hijos; `flow-root` es un bloque que encierra los márgenes de sus hijos (crea un BFC).
- `display` combina un tipo exterior (`block`/`inline`) y uno interior (`flow`, `flow-root`, `flex`, `grid`…).

## Para profundizar

- [MDN: display](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
- [MDN: Block and inline layout in normal flow](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_and_inline_layout_in_normal_flow)
- [web.dev: Layout (display y tipos de caja)](https://web.dev/learn/css/layout)
- [MDN: The multi-keyword syntax of CSS display](https://developer.mozilla.org/en-US/docs/Web/CSS/display/multi-keyword_syntax_of_display)
- [Adrian Roselli: display: contents is strong medicine](https://adrianroselli.com/2018/05/display-contents-is-strong-medicine.html)
