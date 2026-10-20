# Preferencias del usuario

## Por qué importa

Una página no se adapta solo a un tamaño de pantalla: también a la persona que la lee. Quien la abre ha configurado su sistema: un tema oscuro para leer de noche, «reducir movimiento» porque las animaciones le marean, más contraste porque ve mal, un tema de alto contraste de Windows, o simplemente usa el dedo en lugar de un ratón. Las media queries también pueden hacer esas preguntas, y responderlas bien es la diferencia entre una página que se puede usar y una que expulsa a parte de su público.

Esta lección cumple varias promesas del curso: `color-scheme` de la lección de color, `@media (hover: hover)` de la de pseudoclases, `prefers-reduced-motion` de la de transformaciones en 3D y `@supports`, que ya apareció en el módulo de flexbox y en el de efectos visuales.

> **Lo que ves depende de tu sistema.** Las vistas previas siguen la configuración de tu ordenador: si tu Mac está en modo oscuro, los ejemplos de tema se ven en oscuro. Para probar los otros valores sin tocar el sistema, abre el ejemplo con ↗ y en DevTools ve al menú ⋮ → **More tools** → **Rendering** → **Emulate CSS media feature**. Cada ejemplo enseña en una etiqueta qué valor está activo.

## Tema claro y oscuro

### `prefers-color-scheme`

`(prefers-color-scheme: dark)` se cumple cuando el sistema está en modo oscuro; `(prefers-color-scheme: light)`, en el claro. La forma limpia de usarla es la del módulo de fundamentos: los colores de toda la página viven en **custom properties**, y la media query solo cambia sus valores. Ningún componente se toca.

```css
:root { --surface: #ffffff; --text: #1e293b; }

@media (prefers-color-scheme: dark) {
  :root { --surface: #0f172a; --text: #e2e8f0; }
}
```

[[exercise:01-prefers-color-scheme.md]]

Fíjate en el buscador del ejemplo: en el tema oscuro sigue blanco. Lo dibuja el navegador, y tus variables no llegan a él.

### `color-scheme` y `light-dark()`

En la lección de color viste que `color-scheme` le dice al navegador qué esquemas admite un elemento. En la raíz, `color-scheme: light dark` significa «esta página admite los dos; usa el del sistema», y el navegador adapta **sus** piezas: el color del lienzo, el texto por defecto, los campos de formulario, las casillas y las barras de desplazamiento.

Y desde 2024 hay una función que aprovecha esa información: `light-dark(claro, oscuro)` devuelve el primer color si el elemento usa el esquema claro y el segundo si usa el oscuro. Los dos temas quedan juntos en cada línea, sin media query:

```css
:root {
  color-scheme: light dark;
  --surface: light-dark(#ffffff, #0f172a);
  --text: light-dark(#1e293b, #e2e8f0);
}
```

[[exercise:02-light-dark-y-color-scheme.md]]

El detalle que causa el error típico: `light-dark()` no mira la preferencia del sistema, sino el **`color-scheme` del elemento**. Con el valor inicial, `normal`, el esquema usado es el claro, y `light-dark()` elige siempre el primer color, esté el sistema como esté:

[[exercise:03-light-dark-necesita-color-scheme.md]]

| `color-scheme` del elemento | Esquema que usa | `light-dark(a, b)` |
|---|---|---|
| `normal` (inicial) | claro | `a`, siempre |
| `light dark` | el del sistema | `a` o `b` según el sistema |
| `light` | claro | `a` |
| `dark` | oscuro | `b` |

`color-scheme` se hereda, así que basta con ponerlo en `:root`. Para que el navegador lo sepa **antes** de que llegue el CSS (y no pinte un instante de blanco en una página oscura), añade también `<meta name="color-scheme" content="light dark">` en el `<head>`.

### Un selector de tema

Muchas webs ofrecen elegir: «Sistema», «Claro» u «Oscuro». Con `light-dark()`, cambiar de tema es cambiar **una** propiedad: `color-scheme: light` o `color-scheme: dark` en la raíz. Con `:has()`, que viste en el módulo de fundamentos, la raíz puede preguntar qué radio está marcado:

[[exercise:04-selector-de-tema.md]]

Sin `light-dark()`, el tema oscuro habría que escribirlo dos veces: una en la media query (para «Sistema») y otra en la regla del botón «Oscuro». La elección se pierde al recargar; recordarla con `localStorage` es trabajo de JavaScript (capítulo 6).

Unos consejos para el tema oscuro:

- No es invertir colores. Un negro puro con blanco puro cansa; mejor un azul noche (`#0f172a`) y un gris muy claro (`#e2e8f0`).
- Los colores de acento se aclaran y pierden saturación (`#1d4ed8` pasa a `#93c5fd`): sobre fondo oscuro, un azul intenso vibra y no alcanza el contraste.
- Las sombras apenas se ven sobre oscuro: la profundidad se marca con superficies algo más claras.
- Comprueba el contraste en **los dos** temas (con `node scripts/contrast.mjs` o con el selector de color de DevTools).

## Movimiento: `prefers-reduced-motion`

Para algunas personas, el movimiento en pantalla no es un adorno: los desplazamientos grandes, los zooms y los efectos de paralaje pueden provocar mareo, náuseas o migrañas (trastornos vestibulares), y distraen a quien tiene problemas de atención. Todos los sistemas tienen un ajuste para pedir menos movimiento: en macOS, **Accesibilidad → Pantalla → Reducir movimiento**; en iOS y Android, ajustes parecidos. La media query `prefers-reduced-motion` tiene dos valores: `no-preference` y `reduce`.

El patrón más seguro es **sin movimiento por defecto**: el movimiento se añade dentro de `(prefers-reduced-motion: no-preference)`. Así, si un navegador no entendiera la media query o alguien olvidara una regla, el resultado sería una página quieta, no una que marea.

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

Con el movimiento que ya conoces: `scroll-behavior: smooth` hace que los enlaces internos (`href="#paso-3"`) deslicen la página en lugar de saltar. Es agradable en una página corta y desorientador en una larga; con `reduce`, salta. El ejemplo añade también un pequeño adelanto del módulo siguiente, una transición, con la misma regla:

[[exercise:05-prefers-reduced-motion.md]]

Dos ideas para llevarse al módulo de animación, donde cada ejemplo con movimiento respetará esta preferencia:

- **`reduce` significa menos, no nada.** La información que daba el movimiento se tiene que seguir dando: en el ejemplo, el paso elegido se marca con color y borde en los dos casos. Cambiar un desplazamiento por un fundido suele ser suficiente.
- Muchas hojas de estilo incluyen el patrón contrario, en un reset: `@media (prefers-reduced-motion: reduce)` con duraciones casi nulas para todo. Funciona como red de seguridad; lo verás en el módulo de arquitectura CSS.

## Contraste: `prefers-contrast` y `forced-colors`

`prefers-contrast` dice si el usuario ha pedido más contraste (`more`; en macOS, **Accesibilidad → Pantalla → Aumentar contraste**), menos (`less`) o algo personalizado (`custom`). Con `more`, lo habitual es oscurecer los textos secundarios y engrosar los bordes de los campos: tus colores siguen siendo tuyos, solo más marcados.

`forced-colors: active` es más drástico. Se cumple con los **temas de contraste de Windows**: el navegador **sustituye** tus colores de texto, fondos y bordes por los de una paleta corta del sistema (las palabras clave `Canvas`, `CanvasText`, `LinkText`, `ButtonText`… de la lección de color) y quita las sombras. Tu trabajo no es pelear contra eso, sino que nada importante dependa solo del color:

- Un botón distinguido solo por su fondo se queda en texto suelto. Un `border: 2px solid transparent` no se ve normalmente, pero en `forced-colors` se pinta del color del sistema y el botón recupera su forma. Lo mismo vale para un `outline` transparente en los estados de foco.
- Si el color **es** la información (las muestras de color de un producto, un gráfico), `forced-color-adjust: none` en ese elemento conserva sus colores.
- Los iconos SVG con `fill: currentColor` siguen al texto y se adaptan solos.

[[exercise:06-contraste-y-colores-forzados.md]]

## El puntero: `hover` y `pointer`

Estas características describen cómo se maneja el dispositivo:

| Característica | Valores | Pregunta |
|---|---|---|
| `hover` | `hover`, `none` | ¿el puntero **principal** puede estar encima de algo sin pulsar? |
| `pointer` | `fine`, `coarse`, `none` | ¿cómo de preciso es el puntero principal? Ratón o lápiz: `fine`; dedo: `coarse` |
| `any-hover`, `any-pointer` | los mismos | lo mismo, pero de **cualquiera** de los dispositivos conectados |

Un Mac con trackpad es `hover` y `fine`; un teléfono, `none` y `coarse`; un portátil con pantalla táctil tiene un puntero principal `fine` y además `any-pointer: coarse`. Por eso, para el tamaño de los botones, `any-pointer: coarse` es la pregunta prudente: si existe un dedo, los objetivos deben medir al menos 44-48px.

[[exercise:07-hover-y-pointer.md]]

Ojo con usarlas para adivinar «es un móvil»: describen capacidades, no aparatos. Una tableta con teclado y ratón tiene `hover`; un monitor táctil de escritorio, `coarse`.

### La información no va detrás de un `:hover`

En la lección de pseudoclases quedó una regla: nunca escondas información importante detrás de `:hover`. Con el dedo no hay forma de «pasar por encima», y al tocar, el `:hover` se activa de forma imprevisible y a veces se queda pegado. Además, `opacity: 0` no saca un botón del orden de <kbd>Tab</kbd>: quien navega con el teclado lo enfoca sin verlo.

[[exercise:08-informacion-escondida-en-hover.md]]

La regla completa: la información y las acciones principales, siempre visibles. Lo que de verdad es accesorio (un atajo que repite algo que ya está en la página) puede revelarse al pasar el ratón, pero solo dentro de `@media (hover: hover) and (pointer: fine)` y también con `:focus-within`.

## Otras características

| Característica | Se cumple cuando… |
|---|---|
| `prefers-reduced-transparency: reduce` | el usuario pidió menos transparencias (en macOS, **Reducir transparencia**): un cristal esmerilado debería volverse opaco |
| `color-gamut: p3` | la pantalla muestra colores fuera de sRGB (la de un Mac reciente) |
| `dynamic-range: high` | la pantalla admite HDR |
| `scripting: none` | JavaScript está desactivado |
| `display-mode: standalone` | la web está instalada como aplicación |

## `@supports`: lo que el navegador entiende

Las media queries preguntan por el dispositivo y el usuario. `@supports` pregunta por el **navegador**: ¿entiende esta declaración?

```css
@supports (backdrop-filter: blur(1px)) { … }
@supports not (display: grid) { … }
@supports (display: grid) and (gap: 1rem) { … }
@supports selector(:has(+ p)) { … }          /* ¿entiende este selector? */
```

[[exercise:09-supports.md]]

### Dos formas de dar una alternativa

La primera no necesita `@supports`: la **cascada**. Desde la primera lección de CSS sabes que el navegador ignora en silencio lo que no entiende. Escribe primero el valor seguro y después el moderno: el navegador antiguo se queda con el primero y el moderno, con el último.

```css
.hero {
  min-height: 100vh;     /* para todos */
  min-height: 100svh;    /* lo pisa donde se entiende */
}
```

`@supports` hace falta cuando una mejora obliga a cambiar **varias** cosas a la vez. Es el caso del cristal esmerilado del módulo de efectos visuales: con `backdrop-filter`, el fondo puede ser blanco al 62 % porque el desenfoque borra lo de detrás; sin él, la foto nítida se vería a través y el texto sería ilegible, así que el fondo debe ser casi opaco:

```css
.glass-bar { background: rgb(255 255 255 / 0.62); backdrop-filter: blur(12px); }

@supports not (backdrop-filter: blur(1px)) {
  .glass-bar { background: rgb(255 255 255 / 0.95); }
}
```

Es lo que se llama **mejora progresiva**: una base que funciona en todas partes y mejoras que se añaden donde se puede. El aviso del ejemplo de `reading-flow`, en el módulo de flexbox, usaba la misma idea para mostrar un texto u otro.

### Lo que `@supports` no sabe

`@supports` comprueba que el navegador sabe **leer** una declaración, no que la implemente bien ni en todos los contextos. El caso famoso: Safari 14.0 entendía `gap` porque ya funcionaba en grid, así que `@supports (gap: 1rem)` decía «sí», pero `gap` todavía no funcionaba en flexbox. Y como la sintaxis de `@supports` es estricta, un error al escribirla no da ningún aviso: la condición vale «no» o la regla entera se ignora.

[[exercise:10-supports-mal-escrito.md]]

Para comprobar una condición sin adivinar, escribe en la consola de DevTools `CSS.supports("(display: grid) and (gap: 1rem)")`: devuelve `true` o `false`.

## Cómo verlo en DevTools

- **Rendering** (menú ⋮ → **More tools** → **Rendering**, o <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>P</kbd> y escribe «Rendering»): **Emulate CSS media feature** para `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`, `forced-colors`, `prefers-reduced-transparency` y `color-gamut`. Úsalo en una pestaña abierta con ↗.
- **Modo dispositivo** con un teléfono: además del ancho, emula el tacto, y `hover` y `pointer` pasan a `none` y `coarse`.
- **Styles**: las reglas de una media query llevan la condición encima; las de `@supports`, también.
- **Ajustes del sistema**: en macOS, **Apariencia** (claro u oscuro) y **Accesibilidad → Pantalla** (reducir movimiento, aumentar contraste, reducir transparencia) cambian las preferencias de verdad.

## Bestiario

- **El tema oscuro tiene manchas blancas.** Síntoma: en oscuro, los campos de formulario, las casillas o las barras de desplazamiento siguen claros. Causa: tus custom properties no llegan a las piezas que dibuja el navegador. Solución: `color-scheme: light dark` en `:root` (y la etiqueta `meta`). → [ver ejemplo](02-light-dark-y-color-scheme.md)
- **`light-dark()` siempre elige el color claro.** Síntoma: con el sistema en oscuro, los tokens con `light-dark()` dan los colores claros. Causa: la función mira el `color-scheme` del elemento, y su valor inicial (`normal`) usa el esquema claro. Solución: `color-scheme: light dark` en `:root`. → [ver ejemplo](03-light-dark-necesita-color-scheme.md)
- **En el móvil no aparece el precio, y con el teclado el foco desaparece.** Síntoma: información o botones que solo se ven al pasar el ratón; con <kbd>Tab</kbd>, el foco cae en algo invisible. Causa: un `:hover` como única forma de mostrarlos; `opacity: 0` no saca nada del orden de tabulación. Solución: lo importante, siempre visible; lo accesorio, dentro de `@media (hover: hover)` y también con `:focus-within`. → [ver ejemplo](08-informacion-escondida-en-hover.md)
- **El `@supports` no se aplica nunca.** Síntoma: el bloque no hace nada aunque el navegador entiende la propiedad. Causa: falta el paréntesis, falta el valor (`(backdrop-filter)` no es una declaración) o se mezclan `and` y `or` sin agrupar; la regla es inválida o la condición vale «no», sin avisos. Solución: declaraciones completas entre paréntesis y grupos con paréntesis; compruébalo con `CSS.supports()`. → [ver ejemplo](10-supports-mal-escrito.md)

## Resumen

- `prefers-color-scheme` dice qué tema prefiere el sistema; los colores van en custom properties y solo cambian sus valores.
- `color-scheme: light dark` en `:root` adapta las piezas del navegador; `light-dark(claro, oscuro)` escribe los dos temas en una línea y depende del `color-scheme` del elemento, no de la media query.
- Un selector de tema solo tiene que cambiar `color-scheme` en la raíz.
- `prefers-reduced-motion`: el movimiento se añade dentro de `no-preference`; `reduce` significa menos movimiento, no menos información.
- `prefers-contrast: more` pide más contraste; `forced-colors: active` sustituye tus colores: bordes transparentes de reserva y `forced-color-adjust: none` donde el color es contenido.
- `hover`, `pointer`, `any-hover` y `any-pointer` describen capacidades, no aparatos; nada importante detrás de un `:hover`.
- `@supports` pregunta si el navegador entiende una declaración o un selector; la cascada basta para un valor suelto, `@supports` para cambios que van juntos.

## Para profundizar

- [MDN: prefers-color-scheme](https://developer.mozilla.org/es/docs/Web/CSS/@media/prefers-color-scheme)
- [MDN: light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- [MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- [MDN: Usar feature queries (@supports)](https://developer.mozilla.org/es/docs/Web/CSS/CSS_conditional_rules/Using_feature_queries)
