# Bordes, sombras y fondos

## Por qué importa

Con lo visto en el módulo ya sabes **dónde** está cada caja y cuánto mide. Esta lección trata de **cómo se pinta**: esquinas redondeadas, sombras que dan profundidad, imágenes y colores de fondo. Son las propiedades que convierten un rectángulo en una tarjeta, un botón o una cabecera, y las que más se usan en cualquier diseño.

También cierran tres cabos sueltos del módulo: la sombra que no ocupa espacio (prometida en la primera lección), el fondo que se ve debajo del borde y la regla que hace que el fondo del `<body>` pinte toda la ventana.

## `border-radius`: esquinas redondeadas

`border-radius` redondea las esquinas del **borde** (y recorta el fondo con la misma forma). Acepta de 1 a 4 valores, empezando por la esquina superior izquierda y en sentido horario, y radios **elípticos** separados por `/` (radios horizontales / verticales).

| Truco | Valor |
|---|---|
| círculo | caja cuadrada + `border-radius: 50%` |
| píldora (botón redondeado) | `border-radius: 999px` (un radio enorme se limita a la mitad del lado corto) |
| una sola esquina | `border-top-left-radius: 16px` |
| propiedades lógicas | `border-start-start-radius`, `border-end-end-radius`… |

[[exercise:01-border-radius.md]]

## `box-shadow`: sombras

```css
box-shadow: [inset] desplazamiento-x desplazamiento-y desenfoque extensión color;
```

- El **desplazamiento** mueve la sombra; el **desenfoque** la difumina; la **extensión** (*spread*) la agranda o encoge antes de difuminarla.
- `inset` la dibuja **dentro** de la caja, como si estuviera hundida.
- Se pueden apilar varias, separadas por comas: la primera queda encima. Las sombras más realistas combinan una cercana y nítida con otra lejana y difusa.
- Siguen el `border-radius` de la caja.

La propiedad clave: las sombras **no ocupan espacio**. No empujan a nada, no cambian el tamaño de la caja y no afectan al diseño. Por eso una sombra sin desplazamiento ni desenfoque, solo con extensión (`0 0 0 4px`), es una forma habitual de dibujar un anillo alrededor de un elemento.

[[exercise:02-box-shadow.md]]

Para la sombra de un texto existe `text-shadow`, con la misma sintaxis salvo `inset` y la extensión. Y `filter: drop-shadow()` sigue la forma real del contenido (por ejemplo, un PNG con transparencia), no la caja: lo verás en el módulo de efectos visuales.

## Anillos de foco que no mueven el diseño

Un error frecuente es marcar el foco engordando el borde: el borde forma parte de la caja, así que todo lo de alrededor salta. Las dos alternativas no ocupan espacio: `outline` (que viste en la primera lección, con `outline-offset` para separarlo) y una `box-shadow` de extensión. `outline` tiene una ventaja: sigue visible en el modo de alto contraste de Windows, donde las sombras desaparecen.

[[exercise:07-anillo-de-foco-con-sombra.md]]

## El fondo de una caja

Un fondo tiene dos partes: un **color** (`background-color`) y una o varias **imágenes** (`background-image`). El color se pinta siempre debajo de las imágenes.

### Dónde empieza y dónde acaba el fondo

Por defecto, el fondo cubre también el área del **borde** (`background-clip: border-box`). No se nota con un borde sólido y opaco, pero sí con uno punteado, discontinuo o semitransparente: el color del fondo asoma por los huecos. `background-clip` decide hasta dónde llega el fondo (`border-box`, `padding-box` o `content-box`) y `background-origin` desde dónde se coloca la imagen.

[[exercise:03-el-fondo-pasa-bajo-el-borde.md]]

### El fondo del `body` pinta toda la ventana

En la primera lección del capítulo viste el margen de `8px` del `<body>`. Si le pones un color de fondo, sin embargo, ese color llena **toda** la ventana, márgenes incluidos, aunque el `<body>` mida solo lo que su contenido. Es una regla especial: si `<html>` no tiene fondo, el navegador usa el del `<body>` para pintar todo el **lienzo** (*canvas*). Si das un fondo propio a `<html>`, el del `<body>` vuelve a pintar solo su caja.

[[exercise:04-el-fondo-del-body-pinta-todo.md]]

### Imágenes de fondo

`background-image: url("archivo")` pone una imagen detrás del contenido. Se controla con:

| Propiedad | Para qué | Valores típicos |
|---|---|---|
| `background-repeat` | repetir en mosaico o no | `repeat` (defecto), `no-repeat`, `repeat-x`, `space`, `round` |
| `background-position` | dónde colocarla | `center`, `right 12px center`, `0 0`, `50% 50%` |
| `background-size` | qué tamaño darle | `auto`, `48px`, `cover` (llena y recorta), `contain` (cabe entera) |
| `background-attachment` | qué pasa al hacer scroll | `scroll` (defecto), `fixed`, `local` |

Una imagen de fondo es **decoración**: no tiene texto alternativo y un lector de pantalla no la anuncia. Si la imagen transmite información, va en el HTML con `<img>` y su `alt` (lección de imágenes del capítulo de HTML). Recuerda también comprobar el contraste del texto que pongas encima: la imagen puede hacerlo ilegible en algunas zonas.

[[exercise:05-imagenes-de-fondo.md]]

### Fondos de varias capas

Todas las propiedades `background-*` aceptan **listas** separadas por comas: cada posición de la lista es una capa, y la **primera capa se pinta encima**. El color, si lo hay, solo puede ir en la última capa (siempre al fondo). Así se combinan un icono, un patrón y un color sin añadir elementos al HTML. Los degradados (`linear-gradient()`…) también son imágenes y se apilan igual: llegarán en el módulo de efectos visuales.

[[exercise:06-fondos-multicapa.md]]

## Bestiario

- **El color de fondo asoma entre los puntos del borde.** Síntoma: un borde punteado o semitransparente se ve teñido del color del fondo. Causa: el fondo cubre el área del borde (`background-clip: border-box`). Solución: `background-clip: padding-box`. → [ver ejemplo](03-el-fondo-pasa-bajo-el-borde.md)
- **El fondo del `body` llena toda la ventana.** Síntoma: el color sale fuera de la caja del `<body>`, márgenes incluidos. Causa: si `<html>` no tiene fondo, el del `<body>` se propaga al lienzo. Solución: es lo esperado para el fondo de la página; si quieres una caja de fondo limitada, da un fondo propio a `<html>` o pinta un contenedor interior. → [ver ejemplo](04-el-fondo-del-body-pinta-todo.md)

## Resumen

- `border-radius` redondea esquinas (hasta radios elípticos); `50%` en una caja cuadrada da un círculo.
- `box-shadow` admite desplazamiento, desenfoque, extensión, `inset` y varias capas; las sombras no ocupan espacio.
- Para el foco usa `outline` (o una sombra de extensión), nunca un borde más grueso.
- El fondo cubre por defecto el área del borde; `background-clip` lo limita.
- El fondo del `<body>` se propaga a todo el lienzo si `<html>` no tiene fondo.
- `background-repeat`, `-position`, `-size` (`cover`, `contain`) y `-attachment` controlan las imágenes de fondo, que son decorativas.
- Las listas separadas por comas crean fondos de varias capas; la primera queda encima.

## Para profundizar

- [MDN: border-radius](https://developer.mozilla.org/es/docs/Web/CSS/border-radius)
- [MDN: box-shadow](https://developer.mozilla.org/es/docs/Web/CSS/box-shadow)
- [MDN: Fondos y bordes](https://developer.mozilla.org/es/docs/Learn/CSS/Building_blocks/Backgrounds_and_borders)
- [Josh W. Comeau: Designing Beautiful Shadows in CSS](https://www.joshwcomeau.com/css/designing-shadows/)
