# Ejes y contenedor

## Por qué importa

En los tres módulos anteriores has puesto cajas en fila de tres maneras, y las tres tenían letra pequeña: los `inline-block` dejan huecos por el espacio en blanco del HTML y se alinean por la línea base; los flotantes necesitan un *clearfix* y no igualan alturas; `position: absolute` saca las cajas del flujo y deja de repartir el sitio. Ninguna sabe responder a preguntas tan normales como «pon estos tres botones en fila, el último pegado a la derecha» o «que esta columna ocupe lo que sobre».

**Flexbox** es un sistema de layout pensado exactamente para eso: colocar una serie de cajas **en una dimensión** (una fila o una columna), repartir entre ellas el espacio disponible y alinearlas. Lo soportan todos los navegadores desde hace más de diez años y hoy es la herramienta por defecto para barras de navegación, botones con icono, tarjetas, formularios en línea y casi cualquier componente.

Este módulo tiene cinco lecciones: en esta verás el contenedor, sus elementos, los dos ejes, las varias líneas y el `gap`; después, la alineación, el algoritmo que calcula los tamaños, sus trampas más famosas y los patrones de uso.

## El contenedor y sus elementos

Flexbox se activa en el **padre**: `display: flex` lo convierte en un **contenedor flex** (*flex container*) y a sus hijos **directos**, en **elementos flex** (*flex items*). Solo los hijos: los nietos siguen colocándose dentro de su padre con las reglas de siempre.

```css
.week {
  display: flex;   /* el padre; los hijos no necesitan nada */
}
```

Sin añadir nada más, el contenedor ya cambia cuatro cosas:

- Los elementos se colocan **en fila**, uno detrás de otro, en el orden del HTML.
- Cada elemento mide **lo que su contenido**, aunque sea un `div`: ya no llena el ancho.
- Todos se **estiran** hasta la altura del más alto de la fila.
- Si no caben, **encogen**; no saltan a otra línea.

[[exercise:01-display-flex.md]]

Por fuera, el contenedor sigue siendo un bloque: ocupa su línea y todo el ancho. En la lección de `display` lo viste con las dos palabras: `display: flex` es `block flex` (exterior de bloque, interior flex).

### `inline-flex`

`display: inline-flex` (`inline flex`) coloca a sus hijos exactamente igual, pero la caja se queda **dentro de la línea de texto**, como un `inline-block`. Es lo que quieres para una etiqueta con icono en mitad de una frase o un botón que no debe ocupar todo el ancho. Fíjate en que, dentro, el icono y el texto quedan centrados sin los ajustes de `vertical-align` del módulo anterior.

[[exercise:02-inline-flex.md]]

## Los dos ejes

Todo en flexbox se describe con dos ejes:

- El **eje principal** (*main axis*) es la dirección en la que se colocan los elementos, uno tras otro.
- El **eje cruzado** (*cross axis*) es el perpendicular. En una fila, el principal es horizontal y el cruzado, vertical.

`flex-direction` elige el eje principal:

| Valor | Eje principal | Eje cruzado |
|---|---|---|
| `row` (por defecto) | horizontal, en el sentido del texto | vertical, de arriba abajo |
| `row-reverse` | horizontal, en sentido contrario | vertical |
| `column` | vertical, de arriba abajo | horizontal |
| `column-reverse` | vertical, de abajo arriba | horizontal |

```text
flex-direction: row                    flex-direction: column

  eje principal ─────────▶               eje cruzado ─────────▶
  ┌───┐┌───┐┌───┐                        ┌────────────────┐   │
  │ 1 ││ 2 ││ 3 │  │ eje                 │       1        │   │ eje
  └───┘└───┘└───┘  │ cruzado             ├────────────────┤   │ principal
                   ▼                     │       2        │   │
                                         ├────────────────┤   ▼
                                         │       3        │
                                         └────────────────┘
```

Dos detalles que conviene grabar desde ya:

- `row` no significa «de izquierda a derecha», sino **en el sentido del texto**. En una página en árabe o hebreo (`dir="rtl"`), la fila empieza a la derecha. Por eso flexbox habla de **inicio** y **fin** (*start*, *end*), no de izquierda y derecha.
- Todas las propiedades de alineación de la próxima lección se nombran por el eje: las `justify-*` actúan en el **principal** y las `align-*` en el **cruzado**. Al cambiar a `column`, los ejes giran y con ellos lo que hace cada propiedad. Es la confusión número uno de flexbox: si `justify-content: center` «centra en vertical», es que estás en una columna.

[[exercise:03-eje-principal-y-cruzado.md]]

Los valores `*-reverse` invierten solo lo que se **ve**. El primer elemento del HTML sigue siendo el primero para la tecla <kbd>Tab</kbd> y para un lector de pantalla; lo verás en la lección de trampas.

## Qué les pasa a los hijos

Un elemento flex no se comporta como una caja del flujo normal. Estas son las reglas que cambian:

| En el flujo normal… | En un elemento flex… |
|---|---|
| un `span` es `inline` e ignora `width` y `height` | se **bloquifica**: su `display` computado pasa a `block` y acepta tamaños |
| los márgenes verticales colapsan | **no colapsan** nunca, ni entre hermanos ni con el contenedor |
| `margin: auto` no centra en vertical | `margin: auto` funciona en los dos ejes (próxima lección) |
| `float`, `clear` y `vertical-align` actúan | se **ignoran** |
| `z-index` solo funciona con `position` | **funciona sin `position`** |
| el espacio en blanco entre `inline-block` se ve | el espacio en blanco entre elementos **no existe** |

[[exercise:04-los-hijos-son-elementos-flex.md]]

### El texto suelto también se convierte en elemento

Si el contenedor tiene texto directamente dentro, sin etiqueta, el navegador lo envuelve en un **elemento flex anónimo**: una caja que no está en el HTML y que no puedes seleccionar con CSS. Cada trozo de texto entre dos etiquetas es un elemento aparte, y los espacios de sus bordes desaparecen. Por eso poner `display: flex` en un párrafo de texto corrido lo destroza: «Total: **59,90 €** IVA incluido» se convierte en tres cajas pegadas.

[[exercise:05-texto-suelto-en-flex.md]]

La regla práctica: un contenedor flex debe tener **elementos** dentro, no texto suelto. Si necesitas que un texto sea una pieza del layout, ponlo en su propio `span`.

### `z-index` sin `position`

La lección de `z-index` adelantaba que los hijos de un contenedor flex aceptan `z-index` sin estar posicionados. Aquí lo tienes: una pila de avatares solapados con márgenes negativos en la que el primero queda encima. Recuerda la otra mitad de la regla: un `z-index` distinto de `auto` en un elemento flex **crea un contexto de apilamiento**, igual que en una caja posicionada.

[[exercise:06-z-index-sin-position.md]]

### `display: contents`: los nietos como hijos

Como solo los hijos directos son elementos flex, un envoltorio intermedio rompe el layout: sus hijos quedan dentro de él y no reciben el `gap` ni la alineación del contenedor. La lección de `display` prometía que aquí brillaría `display: contents`: borra la caja del envoltorio y sus hijos pasan a participar en el flex del abuelo. Úsalo en `div` y `span`, no en elementos con significado.

[[exercise:07-display-contents.md]]

## Varias líneas: `flex-wrap`

Por defecto, un contenedor flex es de **una sola línea** (`flex-wrap: nowrap`). Si los elementos no caben, encogen; y cuando ya no pueden encoger más, porque han llegado a su ancho mínimo (normalmente su palabra más larga), **se salen** del contenedor.

`flex-wrap: wrap` permite varias líneas: cuando el siguiente elemento no cabe, empieza una línea nueva. Cada línea es independiente: reparte su propio espacio sin mirar a las demás (por eso los elementos de dos líneas no quedan en columna; para eso existe grid, en el próximo módulo). `wrap-reverse` apila las líneas en sentido contrario.

```css
.tags {
  display: flex;
  flex-flow: row wrap;   /* atajo de flex-direction + flex-wrap */
}
```

[[exercise:08-flex-wrap.md]]

Fíjate en lo que acabas de conseguir: el número de etiquetas por línea depende del ancho disponible, **sin media queries**. Estrecha la vista previa y se recolocan solas. En la lección de patrones lo combinarás con el algoritmo de tamaños para hacer rejillas de tarjetas que se adaptan a cualquier pantalla.

## `gap`

`gap` pone espacio **entre** los elementos, nunca en los bordes del contenedor. Con varias líneas, también separa las líneas entre sí. Acepta uno o dos valores: `gap: 16px 4px` es `row-gap: 16px` (entre filas) y `column-gap: 4px` (entre columnas).

Antes de que flexbox tuviera `gap` (Chrome lo incorporó en 2020), se usaban márgenes en cada elemento, con dos problemas: sobra el margen del último de cada fila y, al envolver, ese margen sobrante ocupa sitio y cambia cuántos elementos caben. `gap` no colapsa, no se suma con los márgenes del contenedor y no hay que quitarlo en ningún sitio.

[[exercise:09-gap.md]]

Los márgenes de los elementos siguen funcionando y se suman al `gap`; úsalos para separar un elemento concreto, no para espaciar todos.

## Cómo verlo en DevTools

Chrome tiene herramientas específicas para flexbox:

- En **Elements**, junto a cada contenedor flex aparece una insignia `flex`. Al pulsarla, la página muestra un **overlay**: el contenedor con borde discontinuo, cada elemento con borde punteado, el espacio libre rayado y los `gap` sombreados.
- En **Styles**, junto a `display: flex` hay un icono que abre el **editor de flexbox**: botones para probar `flex-direction`, `flex-wrap` y la alineación sin escribir.
- La pestaña **Layout** lista todos los contenedores flex de la página, con casillas para activar sus overlays a la vez.
- En **Computed**, un `span` que es elemento flex muestra `display: block`: la bloquificación.

## Bestiario

- **El texto de mi contenedor flex sale pegado.** Síntoma: al poner `display: flex` en un párrafo, «Total: 59,90 € IVA incluido» se ve como «Total:59,90 €IVA incluido». Causa: cada trozo de texto suelto se convierte en un elemento flex anónimo y los espacios de sus bordes desaparecen. Solución: no conviertas en flex un texto corrido; envuelve cada pieza en su elemento y sepáralas con el layout. → [ver ejemplo](05-texto-suelto-en-flex.md)
- **Los elementos se salen del contenedor.** Síntoma: una fila de etiquetas o botones desborda por la derecha y aparece scroll horizontal. Causa: `flex-wrap: nowrap` (el valor por defecto) mantiene una sola línea; los elementos encogen hasta su ancho mínimo y después se salen. Solución: `flex-wrap: wrap`. → [ver ejemplo](08-flex-wrap.md)

## Resumen

- `display: flex` en el padre convierte a sus hijos directos en elementos flex; `inline-flex` hace lo mismo con una caja que va en la línea de texto.
- `flex-direction` elige el eje principal (`row`, `column` y sus `*-reverse`); el eje cruzado es el perpendicular. `row` sigue el sentido del texto.
- `justify-*` actúa en el eje principal y `align-*` en el cruzado: si cambias a `column`, cambian de dirección.
- Los elementos flex se bloquifican, no colapsan márgenes, ignoran `float` y `vertical-align`, aceptan `z-index` sin `position` y no ven el espacio en blanco del HTML.
- El texto suelto dentro de un contenedor flex forma elementos anónimos: pon cada pieza en su elemento.
- Por defecto todo va en una línea; `flex-wrap: wrap` permite varias y da layouts que se adaptan sin media queries.
- `gap` separa solo entre elementos y entre líneas; sustituye a los márgenes para espaciar.

## Para profundizar

- [MDN: Conceptos básicos de flexbox](https://developer.mozilla.org/es/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)
- [web.dev: Flexbox (Learn CSS)](https://web.dev/learn/css/flexbox)
- [CSS-Tricks: A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Chrome DevTools: Inspect and debug CSS flexbox](https://developer.chrome.com/docs/devtools/css/flexbox)
- [Especificación: CSS Flexible Box Layout Module Level 1](https://www.w3.org/TR/css-flexbox-1/)
