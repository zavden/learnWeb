# Resets y estilos base

## Por qué importa

Antes de que llegue tu CSS, el navegador ya ha aplicado el suyo: la **hoja del user agent** de la primera lección del curso. Los 8px de margen del `body`, los márgenes de los títulos y los párrafos, los 40px de sangría de las listas, los controles de formulario con la letra del sistema a 13px, las imágenes en línea con su hueco de línea base… Algunos de esos valores son útiles (el centrado de un `<dialog>`, el anillo de foco), y otros estorban en cuanto la página tiene un diseño propio.

Un **reset** neutraliza lo que estorba. Una **base** pone tus valores por defecto: la letra y los colores de la página, el aspecto de los enlaces, el anillo de foco, el tema. Los dos van en las capas más bajas, para que cualquier componente les gane sin esfuerzo. Esta lección cumple varias promesas del curso: el reset línea a línea (lección de sintaxis, en el módulo de fundamentos), las imágenes de bloque (lección del contexto inline), la red de seguridad del movimiento reducido (lección de preferencias del usuario) y la capa de impresión (ejemplos profesionales del módulo responsive).

Un poco de historia ayuda a entender qué hace un reset moderno. El **reset de Eric Meyer** (2007) lo borraba casi todo: márgenes, tamaños, listas, hasta la negrita de los títulos. **normalize.css** (2012) hizo lo contrario: igualar los navegadores conservando los valores útiles. Los resets de hoy, como los de Josh Comeau o Andy Bell, son pequeños: los navegadores ya se parecen mucho, así que se limitan a arreglar los valores por defecto que incomodan en cualquier proyecto.

## Un reset moderno, línea a línea

[[exercise:01-un-reset-moderno.md]]

El CSS completo, con un comentario por regla:

[[exercise:01-un-reset-moderno.md-(styles.css)]]

| Regla | Qué arregla |
|---|---|
| `*, *::before, *::after { box-sizing: border-box }` | `width` y `height` incluyen relleno y borde (módulo de cajas) |
| `* { margin: 0 }` | los márgenes del navegador: el `body`, los títulos, los párrafos, `figure`… |
| `:where(dialog, [popover]) { margin: auto }` | devuelve el centrado que el navegador da a diálogos y popovers |
| `html { text-size-adjust: none }` | Safari en iPhone agranda la letra al girar a horizontal |
| `html { scrollbar-gutter: stable }` | reserva el hueco de la barra de scroll: la página no salta de lado al aparecer |
| `interpolate-size: allow-keywords` | se puede animar hasta `height: auto` (Chrome 129+), solo con movimiento permitido |
| `body { min-height: 100dvh; line-height: 1.5 }` | un interlineado legible y un `body` tan alto como la ventana |
| `img, video… { display: block; max-width: 100% }` | ni hueco de línea base ni imágenes más anchas que su caja |
| `img, video { height: auto }` | la proporción se mantiene al encoger |
| `input, button, textarea, select { font: inherit }` | los controles usan la letra de la página, no la del sistema a 13px |
| `h1, h2, h3 { text-wrap: balance }` | títulos repartidos en líneas parejas (Chrome 114+) |
| `p { text-wrap: pretty }` | párrafos sin una palabra sola en la última línea (Chrome 117+) |
| `overflow-wrap: break-word` | una URL o una palabra larguísima se parte antes que desbordar |
| `:where(ul, ol)[role="list"] { list-style: none; padding: 0 }` | sin viñetas, solo en las listas que lo piden |
| `:target { scroll-margin-block: 5ex }` | al saltar a un ancla, un poco de aire por encima |

Lo que **no** está también es una decisión. El reset no pone colores, ni tipografías, ni tamaños de título: eso es de la base. Y no quita el anillo de foco del navegador, que es lo último que debería desaparecer.

## Lo que el reset no debe romper

Un reset actúa sobre todos los elementos de la página, también los que no estabas mirando. Tres trampas clásicas.

### Los diálogos y los popovers

La hoja del navegador centra un `<dialog>` y un `[popover]` con `margin: auto` (y `inset` a cero, y `width: fit-content`). El `* { margin: 0 }` de casi todos los resets les quita ese margen, porque una regla del autor gana a cualquiera del navegador aunque pese cero: el diálogo se pega a la izquierda de su marco y el popover, a la esquina de la ventana.

[[exercise:04-margin-cero-y-dialog.md]]

Por eso el reset de esta lección tiene una línea más: `:where(dialog, [popover]) { margin: auto; }`.

### Los botones con `all: unset`

`all: unset` es tentador para «limpiar» un botón: borra el borde, el fondo y la letra del sistema de una vez. Pero borra **todas** las propiedades, también las que el navegador ponía a propósito: `box-sizing` vuelve a `content-box`, `text-align` deja de centrar, `display` pasa a `inline` y el anillo de foco desaparece. El botón sigue siendo un botón (se enfoca, se pulsa con el teclado, el lector de pantalla lo anuncia), pero ya no se ve dónde está el foco.

[[exercise:05-all-unset-en-botones.md-]]

El script del ejemplo lee los valores finales de los dos botones:

```text
❌ all: unset → display: inline · box-sizing: content-box · text-align: start
✅ reset dirigido → display: block · box-sizing: border-box · text-align: center
```

`display: inline` casi no se nota en un `<button>`, porque los botones se dibujan como `inline-block` aunque digan `inline`; pero en un `<summary>` (que el navegador muestra como `list-item`) o en un `<div>`, `all: unset` los vuelve `inline`, y `width` y `height` dejan de aplicarse. La alternativa es un reset **dirigido**: `padding: 0; border: 0; background: none; font: inherit; color: inherit;`, y un `:focus-visible` propio.

### La semántica de las listas

Muchos resets antiguos quitaban las viñetas a todas las listas. En Safari, una lista con `list-style: none` puede dejar de anunciarse como lista con VoiceOver: se pierde el «lista, 3 elementos» que ayuda a orientarse. Chrome y Firefox mantienen la semántica, así que en la vista previa no se nota nada.

[[exercise:06-list-style-none-y-safari.md]]

El reset moderno solo quita las viñetas a las listas que lo piden con `role="list"`. El atributo repone la semántica en Safari y deja escrito en el HTML que la lista sin viñetas es intencionada. Para comprobar el rol en Chrome: DevTools → **Elements** → pestaña **Accessibility** del elemento.

## La base: tus valores por defecto

Después del reset, la **base** dice cómo es cada elemento cuando nadie dice nada: la letra y los colores del `body`, el tamaño de los títulos (con los tokens de la lección anterior), los enlaces, el anillo de foco y el tema. Se escribe con selectores de etiqueta o con `:where()`, para que cualquier componente la pise con una clase.

Dos propiedades de la base cambian de golpe todos los controles de la página:

- **`color-scheme: light dark`** en `:root`: el navegador dibuja sus piezas (campos, desplegables, el calendario de una fecha, las barras de scroll) en el tema del sistema. Lo viste en el módulo responsive.
- **`accent-color`**: el color de las casillas, los radios, los deslizadores y las barras de progreso. Admite `light-dark()`, y el navegador elige solo un color de marca de verificación que contraste.

[[exercise:02-color-scheme-y-accent-color.md]]

Con tu Mac en oscuro, la vista previa se ve en oscuro. Para ver la versión clara, abre el ejemplo con ↗ y usa DevTools → **Rendering** → **Emulate CSS media feature prefers-color-scheme** → `light`.

Y el anillo de foco, una sola regla para toda la página: `:focus-visible` (no `:focus`), con `outline` (no `border`, que movería las cosas) y su color en un token que las zonas oscuras redefinen:

[[exercise:03-foco-visible-en-la-base.md]]

`:focus-visible` es el foco que el navegador cree que conviene ver: el que llega con el teclado y el de los campos de texto, también con un clic. Un clic de ratón en un botón o un enlace no lo muestra. Por eso ya no hace falta, ni conviene, quitar el anillo con `:focus { outline: none }`.

## El reset, en la capa más baja

Un reset compite con la base en igualdad de condiciones: los dos usan selectores de etiqueta, (0,0,1). Si el reset llega después (otro archivo que se carga más tarde, un bloque copiado al final), gana por orden de aparición y se lleva por delante los márgenes y las sangrías de la base:

[[exercise:07-el-reset-despues-gana.md]]

Con capas, la posición deja de importar: `@layer reset, base, components, utilities, print;` en la primera línea, y el reset pierde contra todo lo demás esté donde esté. Es el mismo esquema de la lección de metodologías, ahora con su primera capa explicada.

## La red de seguridad del movimiento reducido

En el módulo de animación, cada componente respetaba `prefers-reduced-motion` a su manera: el movimiento dentro de `no-preference`, los fundidos para todos. Es la forma correcta de diseñar. Pero en un proyecto grande siempre hay algo que se olvida su media query, o CSS de terceros que no la tiene. Para eso existe la **red de seguridad**, en la capa `reset`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

¿Por qué `0.01ms` y no `none` (o `0s`)? Porque con `0.01ms` la transición o la animación **sigue ocurriendo**, solo que en un instante: el elemento llega a su estado final, `animation-fill-mode` se respeta, y `transitionend` y `animationend` llegan. Con `transition: none` no hay transición y el evento no llega nunca; con `animation: none` tampoco llega `animationend`, y se pierde además el estado final que dejaba un `fill-mode: forwards`. Cualquier código que espere esos eventos (mover el foco cuando un panel termina de abrirse, quitar un aviso cuando acaba de salir) se queda esperando para siempre:

[[exercise:08-movimiento-reducido-global.md-]]

Al cargar y al pulsar con cada opción, la consola (y la lista de la página) muestran:

```text
Listo: elige una opción y pulsa «Mostrar u ocultar el aviso».
// Tras pulsar con «Sin reducir» (el aviso sube y aparece en 300 ms):
transitionend (opacity): el aviso ya se ve; el código que esperaba puede seguir.
// Tras marcar «Reducir: red de 0.01ms» y pulsar (desaparece al instante):
transitionend (opacity): el aviso ya se ocultó; el código que esperaba puede seguir.
// Tras marcar «Reducir: red con none» y pulsar (aparece al instante):
⚠️ 1 s después: no llegó ningún transitionend. El código que lo esperaba no se ejecutó.
```

Dos advertencias. La red es tosca: también apaga los **fundidos**, que según el módulo de animación deberían mantenerse; es una red, no el diseño. Y como sus declaraciones son `!important` en la capa más baja, por la inversión de `!important` que viste en la lección de metodologías son las más fuertes de toda la página: ningún componente puede saltársela, ni con `!important`. Si un componente necesita un fundido con «reducir movimiento» (un indicador de carga que late despacio), la excepción tiene que ir en la propia capa `reset`, o la red tiene que excluirlo (`*:not(.keeps-motion)`).

## La capa de impresión

La última capa de la lista es `print`: una `@media print` dentro de una capa que va después de todas. Así, sus reglas ganan a los componentes sin selectores más pesados ni `!important`. Es la base de papel que necesita cualquier página:

- márgenes de la hoja con `@page`;
- `color-scheme: light` en `:root`, para que `light-dark()` elija los valores claros aunque la pantalla esté en oscuro, y tinta negra sobre blanco;
- letra en puntos (`11pt`) y una tipografía de imprenta;
- fuera la navegación, los botones y los avisos de pantalla (`display: none`);
- la dirección de cada enlace después del texto, con `::after` y `attr(href)`;
- nada de cortar un bloque entre dos hojas (`break-inside: avoid`) ni dejar un título solo al pie (`break-after: avoid`), y `orphans`/`widows` para los párrafos.

[[exercise:09-la-capa-print.md]]

Para verlo, abre el ejemplo con ↗ y pulsa <kbd>⌘</kbd> <kbd>P</kbd>; o, sin imprimir, DevTools → **Rendering** → **Emulate CSS media type** → `print`. Con tu Mac en oscuro, la pantalla se ve oscura y el papel sale claro.

## Cómo verlo en DevTools

- **Elements → Styles** muestra al final las reglas de la hoja del navegador, marcadas como *user agent stylesheet*: es la forma de saber qué estás reseteando. Las que tu reset anula aparecen tachadas.
- **Rendering** emula `prefers-reduced-motion`, `prefers-color-scheme` y el medio `print`, sin tocar el sistema.
- La pestaña **Accessibility** de un elemento muestra su rol (`list`, `button`) y su nombre accesible: así compruebas que un reset no ha borrado nada que importe.

## Bestiario

- **El diálogo o el popover aparece en la esquina.** Síntoma: un `<dialog>` se pega a la izquierda y un popover sale arriba a la izquierda, en lugar de centrados. Causa: `* { margin: 0 }` les quita el `margin: auto` con el que los centra el navegador. Solución: `:where(dialog, [popover]) { margin: auto; }` en el reset. → [ver ejemplo](04-margin-cero-y-dialog.md)
- **El botón «limpio» se sale de su caja y no muestra el foco.** Síntoma: tras `all: unset`, el botón de ancho 100% desborda, el texto no está centrado y con <kbd>Tab</kbd> no se ve dónde está el foco. Causa: `all: unset` devuelve también `box-sizing`, `text-align`, `display` y `outline` a sus valores iniciales o heredados. Solución: un reset dirigido (`border: 0; background: none; padding: 0; font: inherit;`) y un `:focus-visible` propio. → [ver ejemplo](05-all-unset-en-botones.md)
- **La lista ya no es una lista (en Safari).** Síntoma: con VoiceOver en Safari, una lista sin viñetas no se anuncia como lista. Causa: WebKit retira la semántica a las listas con `list-style: none`. Solución: `role="list"` en el HTML, y el reset solo quita viñetas a `:where(ul, ol)[role="list"]`. → [ver ejemplo](06-list-style-none-y-safari.md)
- **El reset borra los márgenes de la base.** Síntoma: los títulos se pegan y las listas pierden la sangría aunque la base los define. Causa: el reset va después y, con la misma especificidad, gana por orden. Solución: el reset en la capa más baja (`@layer reset, base, …;` en la primera línea). → [ver ejemplo](07-el-reset-despues-gana.md)

## Resumen

- La hoja del navegador pone márgenes, sangrías, letra de sistema en los controles e imágenes en línea; un reset neutraliza lo que estorba y una base pone tus valores por defecto.
- El reset moderno es pequeño: `box-sizing`, márgenes (devolviendo `margin: auto` a diálogos y popovers), medios de bloque, `font: inherit` en los controles, `text-wrap`, `role="list"`, `scroll-margin`.
- Nada de `all: unset` en los botones ni de `list-style: none` en todas las listas.
- En la base: `color-scheme`, `accent-color`, la tipografía y un único `:focus-visible` con su color en un token.
- Capas: `reset` la primera y `print` la última; el orden de los bloques en el archivo deja de importar.
- La red de movimiento reducido usa `0.01ms` (los eventos siguen llegando) y, por ir con `!important` en la capa más baja, nadie puede saltársela.

## Para profundizar

- [Josh W. Comeau: A Modern CSS Reset](https://www.joshwcomeau.com/css/custom-css-reset/)
- [Andy Bell: A (more) Modern CSS Reset](https://piccalil.li/blog/a-more-modern-css-reset/)
- [Scott O'Hara: Lists and Safari (por qué role="list")](https://www.scottohara.me/blog/2019/01/12/lists-and-safari.html)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: @page](https://developer.mozilla.org/en-US/docs/Web/CSS/@page)
