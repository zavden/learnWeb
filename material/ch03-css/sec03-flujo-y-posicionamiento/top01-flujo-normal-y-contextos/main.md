# Flujo normal y contextos de formato

## Por qué importa

Hasta ahora no le has dicho al navegador **dónde** colocar ninguna caja, y aun así cada párrafo, título e imagen ha acabado en un sitio concreto. Lo ha decidido el **flujo normal**, el algoritmo de layout que se aplica a todo lo que no pide otra cosa. Flexbox, grid, los flotantes y `position` existen para cambiar ese comportamiento, así que conviene saber con precisión qué es lo que cambian.

Esta lección pone nombre a lo que ya has visto en los dos módulos anteriores: las dos direcciones del flujo, los **contextos de formato** que deciden cómo se colocan los hijos de una caja, las cajas que el navegador crea sin que existan en el HTML y, sobre todo, el **contexto de formato de bloque** (BFC). En el módulo anterior apareció varias veces como «la frontera que los márgenes no atraviesan»; aquí verás qué es, qué lo crea y para qué sirve.

## El flujo normal

El flujo normal coloca las cajas en **dos direcciones**:

- **Dirección de bloque**: los bloques se apilan uno debajo de otro, en el orden del HTML. En español es de arriba abajo.
- **Dirección inline** (en línea): dentro de un bloque, el texto y las cajas en línea avanzan de izquierda a derecha y, cuando no caben, saltan a la línea siguiente.

```text
 dirección inline →
┌──────────────────────────────────────┐
│ <h2> Ruta por la sierra              │  ↓ dirección de bloque
├──────────────────────────────────────┤
│ <p> Salimos de Cercedilla a las ocho │
│ y subimos por la Calzada Romana…     │  ← las líneas se llenan → y saltan
├──────────────────────────────────────┤
│ <p> La vuelta, por el camino Schmid… │
└──────────────────────────────────────┘
```

Son los mismos ejes que ya usas con las propiedades lógicas: `margin-block` actúa en la dirección de bloque y `margin-inline`, en la dirección inline. En un idioma que se escribe de derecha a izquierda (con `dir="rtl"`), la dirección inline se invierte; en escritura vertical, los dos ejes giran. Las propiedades lógicas cambian con ellos; lo verás en el módulo de tipografía (modos de escritura).

En el flujo normal hay tres garantías que conviene tener presentes, porque son justo las que rompen las demás técnicas del módulo:

- Cada caja ocupa **su propio sitio**: nada se superpone (salvo que lo fuerces con márgenes negativos).
- El **orden visual** es el orden del HTML.
- Las cajas se **empujan** entre sí: si una crece, las siguientes bajan.

[[exercise:01-el-flujo-normal.md]]

## Contextos de formato

Un **contexto de formato** es el conjunto de reglas con el que una caja coloca a sus hijos. Lo decide el tipo interior del `display` que viste en el módulo anterior (`flow`, `flow-root`, `flex`, `grid`…). En el flujo normal hay dos:

| | Contexto de bloque (BFC) | Contexto inline (IFC) |
|---|---|---|
| Quién participa | cajas de bloque (`div`, `p`, `h1`, `ul`…) | texto, cajas en línea, `inline-block`, imágenes |
| Cómo se colocan | se apilan en la dirección de bloque | avanzan en la dirección inline y forman **líneas** |
| Separación | márgenes verticales (que colapsan) | márgenes, relleno y bordes horizontales; espacio en blanco |
| Ancho con `auto` | llenan el ancho del contenedor | miden su contenido y se parten entre líneas |
| Alineación | `margin-inline: auto` | `text-align`, `vertical-align` |

La regla de reparto es sencilla: si **todos** los hijos de un bloque son de bloque, los coloca en un contexto de bloque; si **todos** son en línea (texto incluido), crea un contexto inline y los reparte en líneas. Un `<p>` con texto y un `<strong>` dentro es el caso típico de contexto inline, y es el tema de la próxima lección.

Flexbox y grid son otros dos contextos de formato, con sus propias reglas. Los verás en sus módulos; de momento basta con saber que, al poner `display: flex` en una caja, sus hijos dejan de participar en el flujo normal de esa caja.

## Cajas anónimas

¿Y si un bloque mezcla las dos cosas, texto suelto y párrafos? El navegador no puede colocar en el mismo contexto bloques y líneas, así que **envuelve cada tramo de texto suelto en una caja de bloque anónima**. Ahora todos los hijos son bloques.

Esas cajas no corresponden a ningún elemento: ocupan su propia línea como si fueran párrafos, heredan las propiedades del padre (color, fuente…), pero **ningún selector puede alcanzarlas**. Ni `.padre > *` ni `:first-child` las cuentan.

[[exercise:02-cajas-anonimas.md]]

La solución es de HTML, no de CSS: no dejes texto suelto junto a bloques. Si es un título, `<h3>`; si es texto, `<p>`.

### Un bloque dentro de una caja en línea

El caso contrario es más traicionero. Desde HTML5, un enlace puede envolver una tarjeta entera, con su título y su párrafo. Pero el `<a>` sigue siendo una caja **en línea**, y una caja en línea no puede contener un bloque. El navegador la **parte en dos trozos**, uno antes del bloque y otro después, cada uno en su línea, y deja los bloques entre medias, fuera de ella. El borde y el fondo del enlace solo se dibujan en esos dos trozos.

[[exercise:03-bloque-dentro-de-un-inline.md]]

El enlace sigue funcionando (el clic llega igual, porque en el DOM el título sigue dentro del `<a>`), pero cualquier decoración de la tarjeta se rompe. La regla práctica: **si un elemento contiene bloques, dale un `display` de bloque**.

## Dentro y fuera del flujo

Las técnicas del resto del módulo se distinguen por lo que hacen con el flujo:

| Técnica | ¿Sigue en el flujo? | Qué pasa con las cajas siguientes |
|---|---|---|
| `position: static` (por defecto) | sí | se colocan después, como siempre |
| `position: relative` | sí | no se enteran: el hueco original se conserva aunque la caja se dibuje desplazada |
| `position: sticky` | sí | igual que `relative` hasta que la caja «se pega» al hacer scroll |
| `float` | **no**, a medias | sus cajas pasan por debajo, pero sus **líneas** de texto se apartan y lo rodean |
| `position: absolute` y `fixed` | **no** | ocupan su hueco como si la caja no existiera |

Una caja **fuera del flujo** no empuja a nadie ni es empujada: rompe las tres garantías del flujo normal. Por eso se usan para cosas concretas (una insignia en una esquina, un menú desplegable, una imagen con texto alrededor) y no para colocar la página entera.

[[exercise:04-dentro-y-fuera-del-flujo.md]]

Fíjate en una consecuencia importante: `position` y `float` cambian **dónde se ve** una caja, no **dónde está** en el HTML. Un lector de pantalla y la tecla <kbd>Tab</kbd> siguen el orden del documento. Si el orden visual y el del HTML no coinciden, quien navega con teclado salta de un lado a otro de la pantalla.

## El contexto de formato de bloque (BFC)

El elemento `<html>` crea el contexto de formato de bloque inicial, el de toda la página. Dentro de él, ciertas cajas crean un **nuevo BFC**: una región independiente que coloca a sus hijos con las mismas reglas de bloque, pero **aislada** de lo que hay fuera. Lo de dentro no se escapa y lo de fuera no entra.

Ese aislamiento tiene tres efectos, y los tres son la razón por la que «añadir `overflow: hidden` lo arregla» aparece en tantos foros:

1. **Contiene los márgenes de sus hijos.** El margen del primer o del último hijo no colapsa con el del BFC: no se escapa. Lo viste en la lección de márgenes.
2. **Contiene a sus flotantes.** La altura de un BFC incluye los elementos flotantes que tenga dentro. Sin él, un contenedor con solo flotantes mide 0 de alto. Lo verás en la lección de floats.
3. **No se mete debajo de los flotantes de fuera.** Un bloque normal pasa por debajo de un flotante vecino; un BFC se estrecha y se coloca a su lado. También en la lección de floats.

```text
 sin BFC                                  con BFC (display: flow-root)

    ↑ el margen del h3 sale fuera          ┌────────────────────────┐
 ┌────────────────────────┐                │  ↑ margen del h3       │
 │ Título                 │                │  Título                │
 │ ┌──────┐               │                │  ┌──────┐              │
 └─│float │───────────────┘ ← mide solo    │  │float │              │
   │      │  el flotante sale por debajo   │  │      │              │
   └──────┘                                │  └──────┘              │
                                           └────────────────────────┘
```

### Qué crea un BFC

Casi todo lo que crea un BFC lo hace **como efecto secundario** de otra cosa:

| Causa | Ejemplo | Dónde se estudia |
|---|---|---|
| el elemento raíz | `<html>` | — |
| `display: flow-root` | `.panel { display: flow-root }` | módulo anterior |
| `overflow` distinto de `visible` y de `clip` | `overflow: auto` | módulo anterior |
| `display: inline-block` | botones, campos | módulo anterior |
| celdas y títulos de tabla | `<td>`, `<caption>`, `display: table-cell` | capítulo de HTML |
| los flotantes | `float: left` | lección 3 |
| las cajas con `position: absolute` o `fixed` | | lección 4 |
| `contain: layout`, `paint` o `content` | `contain: content` | — |
| los hijos de un contenedor flex o grid | | módulos de flexbox y grid |
| los contenedores multicolumna | `column-count: 2` | — |

Dos detalles que sorprenden: `overflow: clip` **no** crea un BFC (recorta, pero no es un contenedor de scroll), y `position: relative` tampoco (la caja sigue en el flujo). La prueba visual del ejemplo distingue unas causas de otras por un único síntoma: si el margen del título se escapa de la caja, esa caja no crea un BFC.

[[exercise:05-que-crea-un-bfc.md]]

### `flow-root`: pedirlo sin efectos secundarios

Durante años, la forma de crear un BFC fue usar una de esas causas y aguantar su efecto secundario: `overflow: hidden` recorta sombras, menús y anillos de foco; `inline-block` hace que la caja deje de llenar el ancho; `float` la manda a un lado. Por eso en 2017 se añadió `display: flow-root`, cuyo único efecto es ese: crear un BFC sin cambiar nada más.

[[exercise:06-flow-root-frente-a-overflow.md]]

Cuando necesites un BFC (y en las próximas lecciones lo necesitarás para encerrar flotantes), usa `display: flow-root`. Si ves `overflow: hidden` en un código antiguo sin ningún recorte que justificarlo, probablemente era un BFC disfrazado.

## Cómo verlo en DevTools

DevTools no marca qué cajas crean un BFC. Para averiguarlo, selecciona la caja en **Elements** y busca en **Computed** su `display`, `overflow`, `float`, `position` y `contain`: si alguno está en la tabla anterior, hay BFC. Las cajas anónimas tampoco aparecen: en el árbol de **Elements** solo verás el texto suelto entre comillas, sin etiqueta, porque no es un elemento.

## Bestiario

- **El fondo o el borde de mi tarjeta-enlace sale roto.** Síntoma: un `<a>` que envuelve un título y un párrafo dibuja su borde como dos trocitos sueltos, uno arriba y otro abajo, y el fondo no cubre la tarjeta. Causa: el `<a>` es una caja en línea y el navegador la parte en dos alrededor de los bloques que contiene. Solución: `display: block` (o `inline-block`) en el enlace. → [ver ejemplo](03-bloque-dentro-de-un-inline.md)

## Resumen

- El flujo normal apila los bloques en la dirección de bloque y reparte el contenido en línea en líneas que avanzan en la dirección inline.
- En el flujo normal nada se superpone, el orden visual es el del HTML y las cajas se empujan entre sí.
- Un contexto de formato decide cómo se colocan los hijos de una caja: de bloque (BFC) o inline (IFC) en el flujo normal; flex y grid son otros dos.
- El texto suelto junto a bloques va en cajas anónimas, que ningún selector alcanza; un bloque dentro de una caja en línea la parte en dos.
- `float`, `absolute` y `fixed` sacan la caja del flujo; `relative` y `sticky` la mantienen en él.
- Un BFC contiene los márgenes de sus hijos, contiene a sus flotantes y no se mete debajo de los flotantes de fuera.
- `display: flow-root` crea un BFC sin efectos secundarios; `overflow`, `inline-block` y `float` lo crean de rebote.

## Para profundizar

- [MDN: Introducción a los contextos de formato](https://developer.mozilla.org/es/docs/Web/CSS/CSS_display/Introduction_to_formatting_contexts)
- [MDN: Block formatting context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context)
- [MDN: Flujo normal (Learn)](https://developer.mozilla.org/es/docs/Learn/CSS/CSS_layout/Normal_Flow)
- [CSS 2.2: Visual formatting model (cajas anónimas y contextos)](https://www.w3.org/TR/CSS22/visuren.html)
- [Rachel Andrew: The end of the clearfix hack? (display: flow-root)](https://rachelandrew.co.uk/archives/2017/01/24/the-end-of-the-clearfix-hack/)
