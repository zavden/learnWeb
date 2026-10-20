# Alineación

## Por qué importa

Durante casi veinte años, «centrar un `div` en vertical» fue el chiste más repetido de CSS. En el módulo anterior viste por qué: `vertical-align` solo coloca cajas dentro de una línea de texto, y en el flujo normal un `margin-top: auto` vale cero. Flexbox resolvió el problema con unas pocas propiedades que alinean en los dos ejes.

El precio es un vocabulario que confunde: `justify` y `align`, `-content`, `-items` y `-self`. En esta lección vas a construir un mapa de esas seis combinaciones que te servirá también en grid, porque las propiedades son las mismas. Y verás dos detalles que separan a quien «prueba valores hasta que sale» de quien sabe lo que hace: los márgenes automáticos y el centrado que corta el contenido.

## El mapa: dos ejes, tres niveles

El nombre de cada propiedad dice **en qué eje** actúa y **a quién** coloca:

- `justify-*` actúa en el **eje principal**; `align-*`, en el **eje cruzado** (los de la lección anterior).
- `*-content` reparte el espacio **sobrante** del contenedor entre lo que hay dentro; `*-items` coloca **cada elemento** dentro de su hueco; `*-self` hace lo mismo para **un solo elemento**.

| | Eje principal | Eje cruzado |
|---|---|---|
| Todos los elementos (se escribe en el contenedor) | `justify-content` | `align-items` |
| Un elemento (se escribe en el elemento) | no existe: se usa `margin: auto` | `align-self` |
| Las líneas, con `flex-wrap` (en el contenedor) | `justify-content` reparte dentro de cada línea | `align-content` |

En una fila, «principal» es horizontal y «cruzado», vertical. En una columna, al revés. Cuando una propiedad de alineación no hace lo que esperas, comprueba primero el `flex-direction`.

## `justify-content`: el espacio sobrante del eje principal

Cuando los elementos no llenan la línea, sobra espacio en el eje principal. `justify-content` decide dónde va:

| Valor | Qué hace con el espacio sobrante |
|---|---|
| `flex-start` (por defecto, `normal`) | todo al final: los elementos se agrupan al inicio |
| `center` | mitad y mitad: los elementos, juntos en el centro |
| `flex-end` | todo al principio: los elementos se agrupan al final |
| `space-between` | entre los elementos, a partes iguales; nada en los extremos |
| `space-around` | medio hueco a cada lado de cada elemento: los extremos reciben la mitad |
| `space-evenly` | huecos iguales, extremos incluidos |

Con tres elementos de 40px en 300px sobran 180px: `space-between` deja dos huecos de 90px, `space-around` deja 30, 60, 60 y 30, y `space-evenly` cuatro de 45.

> **Desde Python:** `"Ana".ljust(9)`, `"Ana".center(9)` y `"Ana".rjust(9)` hacen con caracteres lo que `flex-start`, `center` y `flex-end` hacen con píxeles: el texto no cambia de tamaño; solo se decide dónde van los seis caracteres que sobran.

[[exercise:01-justify-content.md]]

`gap` y `justify-content` se suman: el `gap` es la separación **mínima** entre elementos, y el espacio que sobre después de descontarlo es el que reparte `justify-content`. Con `space-between` y `gap: 8px`, dos elementos nunca estarán a menos de 8px aunque la fila se estreche.

Si los elementos ya llenan la línea (porque crecen, como verás en la próxima lección), no sobra nada y `justify-content` no tiene efecto. También existen `start` y `end`, que se refieren al sentido del texto en lugar de al eje flex: solo se distinguen de `flex-start` y `flex-end` con `row-reverse` o `column-reverse`.

## `align-items`: cada elemento en el eje cruzado

`align-items` coloca cada elemento dentro de su línea, en el eje cruzado:

- `stretch` (por defecto, `normal`): el elemento se **estira** hasta llenar la línea. Solo si su tamaño en ese eje es `auto`: un elemento con `height` fija (en una fila) no se estira.
- `flex-start`, `center`, `flex-end`: el elemento conserva el tamaño de su contenido y se pega al inicio, al centro o al final.
- `baseline`: alinea la **línea base** de la primera línea de texto de cada elemento.

[[exercise:02-align-items.md]]

El estiramiento por defecto es el responsable de que todas las tarjetas de una fila midan lo mismo sin hacer nada, y también de dos trampas que verás en la lección 4: imágenes deformadas y cabeceras `sticky` que no se pegan.

### Centrar, por fin

Con un único elemento dentro, `align-items: center` lo centra en el eje cruzado y `justify-content: center` en el principal. Es la promesa del módulo anterior: lo que `vertical-align: middle` no podía hacer en un bloque.

```css
.banner {
  display: flex;
  align-items: center;       /* eje cruzado (vertical en una fila) */
  justify-content: center;   /* eje principal (horizontal) */
}
```

[[exercise:03-centrar-de-verdad.md]]

Fíjate en que flexbox centra **la caja** del párrafo. Las líneas de texto de dentro siguen su flujo normal: para centrarlas a ellas sigue haciendo falta `text-align: center`.

### Alinear textos: `baseline`

`center` centra cajas, no letras. Si en una fila hay textos de distinto tamaño (un precio grande junto a «al mes» pequeño), cada caja queda centrada, pero sus letras «bailan» a distintas alturas. `baseline` mueve cada caja para que todas las letras se apoyen en la misma línea base, la misma que conociste en la lección del contexto inline. Si los elementos tienen varias líneas, `last baseline` alinea por la última.

[[exercise:04-alinear-por-la-linea-base.md]]

## `align-self`: un elemento distinto

`align-self` acepta los mismos valores que `align-items` y los aplica a un solo elemento; su valor por defecto, `auto`, significa «lo que diga el contenedor». En una conversación en columna, el eje cruzado es el horizontal: `align-self: flex-end` manda tus mensajes a la derecha.

[[exercise:05-align-self.md]]

## `align-content`: las líneas

Con `flex-wrap: wrap` hay varias líneas, y puede sobrar espacio en el eje cruzado **entre líneas**. `align-content` lo reparte, con los mismos valores que `justify-content` (`flex-start`, `center`, `space-between`…) más `stretch`.

Su valor por defecto, `normal`, se comporta como `stretch`: las líneas se reparten el alto sobrante y, como sus elementos también se estiran, crecen con ellas. Por eso un contenedor alto con `wrap` parece «separar» sus filas. Y un contenedor sin `wrap` tiene una sola línea que ocupa todo el alto: ahí `align-content` no hace nada.

[[exercise:06-align-content.md]]

## Márgenes automáticos

En la lección de márgenes viste que `margin: auto` centra en horizontal un bloque con ancho y que, en el flujo normal, `margin-top: auto` vale cero. En flexbox, un margen `auto` funciona en los **dos ejes** y tiene una regla especial: se queda con **todo el espacio libre** de su lado, **antes** de que `justify-content` y `align-self` repartan nada.

| Declaración | Efecto en una fila |
|---|---|
| `margin-left: auto` en un elemento | ese elemento y los siguientes van al final |
| `margin-right: auto` en un elemento | los siguientes van al final |
| `margin: auto` en el único elemento | centrado en los dos ejes |
| `margin-left: auto` y `margin-right: auto` | ese elemento, centrado entre sus vecinos |

[[exercise:07-margenes-auto.md]]

Es el patrón de casi todas las barras de navegación: el logo y los enlaces a la izquierda, el botón de «Entrar» empujado a la derecha con un solo `margin-left: auto`.

### No hay `justify-self` en flexbox

En el eje cruzado, cada elemento puede tener su propia alineación con `align-self`. En el principal no: los elementos van uno detrás de otro y comparten el espacio, así que `justify-self` (y `justify-items`) se ignoran en flexbox. Funcionan en grid, y por eso hay tanta gente que los prueba aquí. `float` tampoco hace nada en un elemento flex. Para mandar un elemento al otro extremo, margen automático.

[[exercise:08-justify-self-no-existe.md]]

## El centrado que se corta: `safe`

Centrar tiene un caso peligroso: cuando el elemento **no cabe**. `center` lo centra igualmente, y sobresale lo mismo por los dos lados. Si el contenedor tiene scroll, solo se puede desplazar hacia lo que se sale por abajo y por la derecha (el final del eje); lo que sobresale por arriba o por la izquierda queda **fuera del alcance para siempre**. Es lo que les pasa a muchas ventanas modales centradas en un móvil en horizontal: el título y el botón de cerrar desaparecen por arriba.

La palabra clave `safe` lo evita: `align-items: safe center` centra si cabe y, si no, alinea al inicio. Funciona en todas las propiedades de alineación (`justify-content: safe center`…). La alternativa clásica es `margin: auto` en el elemento: un margen automático nunca es negativo, así que cuando no sobra espacio vale cero y el elemento se queda al inicio.

[[exercise:09-centrado-que-se-corta.md]]

## Cómo verlo en DevTools

El editor de flexbox (el icono junto a `display: flex` en **Styles**) tiene botones con dibujos para `justify-content`, `align-items` y `align-content`: pruébalos sobre los ejemplos para ver cada valor sin escribir. En el overlay de flexbox (la insignia `flex` de **Elements**), el espacio libre aparece rayado: si no hay rayado, `justify-content` no tiene nada que repartir. Y en **Computed**, la posición final de un elemento con margen automático aparece en el diagrama de cajas como un margen enorme.

## Bestiario

- **`justify-self` (o `float`) no mueve mi elemento.** Síntoma: un botón con `justify-self: end` o `float: right` se queda en su sitio dentro de una fila flex. Causa: flexbox no tiene alineación individual en el eje principal y los elementos flex no flotan; las dos declaraciones se ignoran sin avisar. Solución: `margin-left: auto` (o `margin-inline-start: auto`) en ese elemento. → [ver ejemplo](08-justify-self-no-existe.md)
- **El contenido centrado se corta por arriba.** Síntoma: en un contenedor con scroll, un elemento centrado que no cabe pierde su parte superior y no hay forma de verla. Causa: `center` lo centra aunque no quepa y el desbordamiento hacia el inicio no es alcanzable con el scroll. Solución: `align-items: safe center` (o `justify-content: safe center`), o `margin: auto` en el elemento. → [ver ejemplo](09-centrado-que-se-corta.md)

## Resumen

- `justify-*` actúa en el eje principal y `align-*` en el cruzado; si cambias a `column`, cambian de dirección.
- `justify-content` reparte el espacio sobrante entre los elementos (`center`, `space-between`, `space-evenly`…); sin espacio sobrante, no hace nada.
- `align-items` coloca cada elemento en el eje cruzado; por defecto los estira, y `baseline` alinea sus textos.
- `align-items: center` + `justify-content: center` centran en los dos ejes.
- `align-self` cambia la alineación cruzada de un solo elemento; en el eje principal no existe `justify-self`: se usan márgenes automáticos.
- `align-content` reparte las líneas de un contenedor con `wrap`; por defecto las estira.
- Un margen `auto` se queda con todo el espacio libre de su lado antes que `justify-content`.
- `safe center` (o `margin: auto`) evita que un elemento centrado que no cabe se corte por el inicio.

## Para profundizar

- [MDN: Alinear elementos en un contenedor flex](https://developer.mozilla.org/es/docs/Web/CSS/CSS_flexible_box_layout/Aligning_items_in_a_flex_container)
- [MDN: Box alignment in flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_alignment/Box_alignment_in_flexbox)
- [web.dev: Flexbox, alignment (Learn CSS)](https://web.dev/learn/css/flexbox#alignment_and_space_distribution)
- [Rachel Andrew: Everything You Need To Know About Alignment In Flexbox](https://www.smashingmagazine.com/2018/08/flexbox-alignment/)
- [Especificación: CSS Box Alignment Module Level 3, overflow alignment](https://www.w3.org/TR/css-align-3/#overflow-values)
