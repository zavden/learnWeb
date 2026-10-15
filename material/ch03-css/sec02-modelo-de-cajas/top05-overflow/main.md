# Overflow

## Por qué importa

En la lección de tamaños viste que, cuando el contenido no cabe en una caja de altura fija, se **desborda**: se sale por abajo y se dibuja encima de lo que haya después. La propiedad `overflow` decide qué hacer con ese contenido sobrante: dejarlo salir, recortarlo o convertir la caja en un área con scroll. Es imprescindible para tablas anchas, paneles de chat, listas largas o títulos que deben caber en una línea.

También es una de las propiedades con más **efectos secundarios**: recorta sombras y menús desplegables, cambia cómo colapsan los márgenes y, combinada en dos ejes, produce barras de scroll que nadie pidió. Aquí verás cada valor y cada sorpresa.

## Los cinco valores

| Valor | Contenido sobrante | ¿Se puede desplazar? |
|---|---|---|
| `visible` (por defecto) | se sale de la caja y se dibuja encima de lo siguiente | no |
| `hidden` | se recorta en el borde de relleno (padding) | sí, por código o con el foco; sin barras |
| `clip` | se recorta | **no**: la caja no es un contenedor de scroll |
| `scroll` | se recorta y hay barras siempre | sí |
| `auto` | se recorta y hay barras **solo si hace falta** | sí |

[[exercise:01-valores-de-overflow.md]]

Para un área desplazable casi siempre quieres `auto`. `scroll` muestra barras vacías en sistemas con barras clásicas (Windows, Linux) aunque el contenido quepa. La diferencia entre `hidden` y `clip` es sutil pero importante: una caja `hidden` sigue siendo desplazable (con `element.scrollTop` desde JavaScript, o si un elemento interior recibe el foco), mientras que `clip` recorta y nada más.

## Dos ejes: `overflow-x` y `overflow-y`

`overflow` es el atajo de `overflow-x` (horizontal) y `overflow-y` (vertical), y se pueden usar por separado: `overflow-x: auto` es la forma estándar de que una tabla ancha se desplace en horizontal.

Hay una regla que sorprende a todo el mundo: **si un eje no es `visible`, el otro tampoco puede serlo**. Si escribes `overflow-x: hidden; overflow-y: visible`, el valor computado de `overflow-y` es `auto`, y aparece un scroll vertical inesperado. La excepción es `clip`: como no crea un contenedor de scroll, sí puede combinarse con `visible`.

[[exercise:02-overflow-x-arrastra-a-y.md]]

## Lo que `overflow` recorta sin que lo pidas

`overflow: hidden` se usa a menudo como «arreglo» rápido: para que un `border-radius` recorte una imagen, para contener márgenes o flotantes, para esconder un desbordamiento. Pero recorta **todo** lo que se sale del borde: también las **sombras** de los hijos, los **menús desplegables** y los **globos** que deberían sobresalir. Antes de añadirlo, pregúntate qué más puede querer salir de esa caja en el futuro.

[[exercise:03-overflow-recorta-sombras-y-menus.md]]

## `overflow` crea un contexto de formato

Cualquier valor de `overflow` que no sea `visible` ni `clip` convierte la caja en un nuevo **contexto de formato de bloque** (BFC), igual que `display: flow-root`, que viste en la lección de márgenes. Eso cambia el comportamiento de su contenido: los márgenes de los hijos dejan de colapsar con los del padre (y, como verás en el módulo de flujo, la caja pasa a contener sus flotantes). Si añades `overflow: auto` a un panel solo para tener scroll, su espaciado puede cambiar.

[[exercise:07-overflow-crea-un-bfc.md]]

## Recortar texto: `text-overflow` y `line-clamp`

Para que un título largo quepa en una línea terminando en «…» hacen falta **tres** propiedades a la vez:

```css
.title {
  white-space: nowrap;       /* no saltar de línea */
  overflow: hidden;          /* recortar lo que sobra */
  text-overflow: ellipsis;   /* marcar el recorte con … */
}
```

`text-overflow` sola no hace nada: solo indica cómo marcar un recorte que tienen que producir las otras dos (y la caja necesita un ancho limitado, aunque sea el de su contenedor). Para recortar después de **varias** líneas se usa `line-clamp`, que hoy los navegadores implementan con el prefijo `-webkit-` y `display: -webkit-box`.

[[exercise:04-text-overflow-ellipsis.md]]

Recortar texto oculta información: si lo usas, asegúrate de que el texto completo está disponible de otra forma (en la página de detalle o en un `title`).

## Barras de desplazamiento y `scrollbar-gutter`

En Windows y Linux, las barras de scroll clásicas **ocupan espacio**: cuando aparecen, el contenido se estrecha unos 15px y todo salta. `scrollbar-gutter: stable` reserva ese hueco desde el principio, aparezca o no la barra. En macOS las barras se superponen al contenido por defecto, así que no verás la diferencia salvo que configures el sistema para mostrarlas siempre: pruébalo, porque muchos de tus usuarios verán barras clásicas.

[[exercise:05-scrollbar-gutter.md]]

## Patrón: tabla con scroll horizontal

Una tabla ancha no debería ensanchar toda la página en un móvil. La solución es envolverla en un contenedor con `overflow-x: auto`. Para que funcione también con teclado, el contenedor necesita poder recibir el foco (`tabindex="0"`) y un nombre accesible (`role="region"` y `aria-label`), como viste en la lección de tablas.

[[exercise:06-tabla-con-scroll-horizontal.md]]

## Bestiario

- **Aparece un scroll vertical que no pedí.** Síntoma: con `overflow-x: hidden` sale una barra vertical. Causa: si un eje no es `visible`, el otro tampoco puede serlo y pasa a `auto`. Solución: `overflow-x: clip`, o revisa por qué hacía falta recortar. → [ver ejemplo](02-overflow-x-arrastra-a-y.md)
- **Mi menú desplegable (o mi sombra) aparece cortado.** Síntoma: lo que sobresale de una tarjeta desaparece en su borde. Causa: un `overflow: hidden` en un antepasado. Solución: quítalo, o mueve el recorte a un elemento interior que no contenga el menú. → [ver ejemplo](03-overflow-recorta-sombras-y-menus.md)
- **`text-overflow: ellipsis` no hace nada.** Síntoma: el texto salta de línea o se sale, pero no aparecen los puntos suspensivos. Causa: falta `white-space: nowrap` u `overflow: hidden`. Solución: usa las tres propiedades juntas. → [ver ejemplo](04-text-overflow-ellipsis.md)
- **Al añadir scroll a un panel, cambió su espaciado.** Síntoma: el panel crece por arriba o por abajo. Causa: `overflow: auto` crea un BFC y los márgenes de los hijos dejan de colapsar. Solución: cuenta con el efecto o compénsalo con el margen del hijo. → [ver ejemplo](07-overflow-crea-un-bfc.md)

## Resumen

- `overflow` decide qué pasa con el contenido que no cabe: `visible`, `hidden`, `clip`, `scroll` o `auto`.
- `auto` para áreas desplazables; `clip` para recortar sin crear un contenedor de scroll.
- Si un eje no es `visible`, el otro tampoco puede serlo (salvo con `clip`).
- `overflow: hidden` recorta también sombras, menús y globos.
- Los valores que crean scroll también crean un contexto de formato de bloque.
- Recortar con «…» necesita `white-space: nowrap`, `overflow: hidden` y `text-overflow: ellipsis`; varias líneas, `line-clamp`.
- `scrollbar-gutter: stable` evita el salto al aparecer la barra.

## Para profundizar

- [MDN: overflow](https://developer.mozilla.org/es/docs/Web/CSS/overflow)
- [MDN: Desbordamiento del contenido](https://developer.mozilla.org/es/docs/Learn/CSS/Building_blocks/Overflowing_content)
- [MDN: scrollbar-gutter](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-gutter)
- [web.dev: Overflow](https://web.dev/learn/css/overflow)
