# Color

## Por qué importa

El color transmite marca, jerarquía y estado (un error en rojo, un éxito en verde), pero también decide si un texto **se puede leer**. CSS ofrece muchas formas de escribir un color, y no son equivalentes: unas son cómodas para copiar de un diseño, otras para crear variaciones y otras para que dos colores *parezcan* igual de claros. En esta lección verás todas las notaciones, la diferencia entre transparencia y opacidad, y las herramientas modernas: `oklch()`, `color-mix()`, `currentColor` y `color-scheme`.

## Cómo se forma un color en pantalla

Cada píxel de una pantalla tiene tres luces: **roja, verde y azul**. Mezclando sus intensidades se obtienen todos los colores (es una mezcla de luz, aditiva: las tres al máximo dan blanco). En el modelo clásico, cada canal va de 0 a 255, es decir, un byte por canal. Casi todas las notaciones de CSS son formas distintas de llegar a esos tres números, más un cuarto opcional, el **alfa** (la opacidad: de 0, transparente, a 1, opaco).

## Nombres y hexadecimal

CSS reconoce 148 **nombres** de color (`tomato`, `navy`, `rebeccapurple`…), además de `transparent` y `currentColor`. Son cómodos para pruebas, pero pocos sirven para un diseño real.

La notación **hexadecimal** escribe los tres canales en base 16, dos cifras por canal:

| Forma | Ejemplo | Equivale a |
|---|---|---|
| `#RRGGBB` | `#1e40af` | rojo 30, verde 64, azul 175 |
| `#RGB` | `#f80` | `#ff8800` (cada cifra se duplica) |
| `#RRGGBBAA` | `#1e40af80` | el mismo azul con alfa 128/255 ≈ 50 % |
| `#RGBA` | `#f808` | `#ff880088` |

> **Desde Python:** cada pareja hexadecimal es un byte. `int("af", 16)` da `175`, y `f"#{30:02x}{64:02x}{175:02x}"` construye `"#1e40af"`. Volverás a ver estos bytes cuando trabajes con píxeles en el canvas y en la GPU.

[[exercise:01-nombres-y-hexadecimal.md]]

## rgb() y hsl()

`rgb()` escribe los mismos canales en decimal. `hsl()` describe el color de una forma más humana:

- **h**ue (tono): un ángulo en la rueda de color. 0 es rojo; 120, verde; 240, azul.
- **s**aturation (saturación): de 0 % (gris) a 100 % (color puro).
- **l**ightness (luminosidad): de 0 % (negro) a 100 % (blanco).

```css
color: rgb(30 64 175);            /* sintaxis moderna: separado por espacios */
color: rgb(30 64 175 / 0.5);      /* el alfa va tras una barra */
color: hsl(225 70% 40%);
color: rgba(30, 64, 175, 0.5);    /* sintaxis antigua, con comas: sigue siendo válida */
```

Con `hsl()` es fácil crear una familia de colores: mantienes el tono y la saturación y solo mueves la luminosidad.

[[exercise:02-rgb-y-hsl.md]]

## Transparencia: alfa frente a opacity

Hay dos formas de hacer algo translúcido, y no son equivalentes:

- El **alfa** de un color (`rgb(… / 0.5)`, `#…80`) afecta solo a la propiedad que usa ese color: el fondo, el borde o el texto.
- La propiedad **`opacity`** afecta al elemento **entero**: fondo, bordes, texto y todos sus descendientes.

[[exercise:03-opacity-frente-a-alfa.md]]

## oklch(): un color pensado para el ojo

HSL es una fórmula geométrica sobre RGB, y su «luminosidad» no coincide con lo que percibimos: con la misma `l`, un amarillo se ve muchísimo más claro que un azul. `oklch()` usa un espacio de color diseñado a partir de la percepción humana:

- **L**: luminosidad percibida, de `0%` a `100%`.
- **C**: croma (la intensidad del color), de `0` (gris) a algo menos de `0.4`.
- **H**: tono, en grados, como en `hsl()`.

```css
background: oklch(75% 0.14 255);    /* un azul claro */
```

Con la misma `L`, dos colores de `oklch()` parecen igual de claros, así que puedes cambiar el tono de un tema sin romper el contraste del texto. Además, `oklch()` puede expresar colores más intensos que las pantallas modernas (P3) muestran y que `rgb()` no alcanza.

[[exercise:04-oklch-luminosidad-perceptual.md]]

### Espacios de color y gama

`rgb()`, `hsl()` y el hexadecimal solo pueden describir los colores del espacio **sRGB**, el estándar de las pantallas de hace veinte años. Muchas pantallas actuales muestran una gama (*gamut*) más amplia, llamada **Display P3**, con rojos y verdes más intensos. `oklch()` y la función `color()` llegan a ellos:

```css
color: color(display-p3 1 0 0);      /* el rojo más intenso de una pantalla P3 */
color: oklch(63% 0.26 29);           /* un rojo con más croma del que cabe en sRGB */
```

Si la pantalla no puede mostrar un color, el navegador lo ajusta al más parecido que sí puede (*gamut mapping*). No hay error: simplemente lo ves algo menos intenso.

## currentColor

La palabra clave `currentColor` vale lo mismo que la propiedad `color` del elemento. Sirve para que bordes, sombras o iconos SVG sigan automáticamente al color del texto:

[[exercise:05-currentcolor.md]]

## color-mix(): mezclar colores

`color-mix(in espacio, colorA porcentaje, colorB)` mezcla dos colores en el espacio de color que elijas. Es la forma moderna de obtener versiones más claras, más oscuras o translúcidas de un color base sin calcularlas a mano. Mezclar en `oklch` da pasos visualmente más regulares que mezclar en `srgb`.

[[exercise:06-color-mix.md]]

## color-scheme: claro u oscuro

Tus reglas no alcanzan a todo: los campos de formulario, las casillas, los `select` y las barras de desplazamiento los dibuja el navegador con sus propios colores. La propiedad `color-scheme` le dice qué esquemas admite un elemento (`light`, `dark` o ambos), y el navegador elige la versión de sus piezas nativas que encaja:

[[exercise:07-color-scheme.md]]

En la raíz, `:root { color-scheme: light dark; }` hace que la página siga el tema del sistema operativo. Lo combinarás con `prefers-color-scheme` y `light-dark()` en el módulo de diseño responsive.

## transparent y los colores del sistema

`transparent` es un color más: negro con alfa 0, `rgb(0 0 0 / 0)`. Es el valor inicial de `background-color`, y por eso los elementos dejan ver lo que tienen detrás.

Los **colores del sistema** son palabras clave que toman el color de los ajustes del sistema y del tema claro u oscuro. Los más útiles: `Canvas` (fondo de la página), `CanvasText` (su texto), `LinkText` (enlaces) y `AccentColor` (el color de acento del sistema). Se usan sobre todo para respetar el modo de alto contraste.

## Qué notación usar

| Situación | Notación recomendada |
|---|---|
| Copiar un color de una herramienta de diseño | hexadecimal o `rgb()` |
| Crear variaciones claras y oscuras de un color | `oklch()` o `color-mix(in oklch, …)` |
| Un tema donde todos los colores deben verse igual de claros | `oklch()` con la misma `L` |
| Colores muy intensos en pantallas modernas | `oklch()` o `color(display-p3 …)` |
| Que un borde o un icono siga al texto | `currentColor` |
| Pruebas rápidas | nombres (`tomato`) |

En la lección de custom properties verás cómo guardar estos colores en variables para no repetirlos.

## Errores silenciosos con el color

Como cualquier valor inválido (lección 1), un color mal escrito hace que se descarte la declaración entera, sin aviso. Los más habituales: mezclar las dos sintaxis de `rgb()` y escribir un hexadecimal con un número de cifras imposible.

[[exercise:08-sintaxis-de-color-invalida.md]]

## Contraste: que se pueda leer

Las pautas de accesibilidad (WCAG) piden un contraste mínimo de **4,5:1** entre el texto normal y su fondo, y de **3:1** para el texto grande (unos 24px, o 19px en negrita). DevTools te ayuda: al hacer clic en la muestra de color de una declaración en **Styles**, el selector de color muestra la relación de contraste y marca si cumple. Un texto gris claro sobre blanco que «queda elegante» suele suspender.

## Bestiario

- **El texto también se vuelve transparente.** *Síntoma:* querías un fondo translúcido y el texto (y todo lo de dentro) se ve desvaído. *Causa:* `opacity` se aplica al elemento entero con todos sus descendientes. *Solución:* da alfa solo al color del fondo: `background: rgb(96 165 250 / 0.5)`. [Ver ejemplo](03-opacity-frente-a-alfa.md).
- **Un color no se aplica y no hay error.** *Síntoma:* el fondo o el texto se quedan con su valor anterior. *Causa:* el color es inválido, por ejemplo `rgb(37, 99, 235 / 0.5)` (comas y barra mezcladas) o `#2563eb8` (siete cifras), y el navegador descarta la declaración. *Solución:* usa una sola sintaxis por función y hexadecimales de 3, 4, 6 u 8 cifras; búscala tachada en DevTools. [Ver ejemplo](08-sintaxis-de-color-invalida.md).

## Resumen

- Un color son tres canales (rojo, verde, azul) más un alfa opcional.
- Notaciones: nombres, hexadecimal (`#RGB`, `#RRGGBB`, `#RRGGBBAA`), `rgb()`, `hsl()` y `oklch()`; las funciones modernas separan con espacios y ponen el alfa tras una barra.
- El alfa de un color afecta a una propiedad; `opacity`, al elemento entero.
- `oklch()` es perceptual: la misma luminosidad se ve igual de clara en cualquier tono.
- `currentColor` reutiliza el color del texto; `color-mix()` mezcla colores; `color-scheme` adapta los controles nativos al tema claro u oscuro.
- Un color inválido descarta la declaración en silencio; comprueba el contraste en DevTools.

## Para profundizar

- [MDN: Applying color to HTML elements using CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Applying_color)
- [web.dev: Color](https://web.dev/learn/css/color)
- [Evil Martians: OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [MDN: color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix)
- [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
