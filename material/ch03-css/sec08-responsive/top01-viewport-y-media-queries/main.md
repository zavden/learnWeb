# Viewport y media queries

## Por qué importa

La misma página se abre en un móvil de 320px, en un portátil de 1440px, en un monitor de 2560px y en un portátil con el zoom al 200 %. Hasta ahora has construido diseños que se adaptan **sin condiciones**: `flex-wrap` con `flex-basis`, `repeat(auto-fit, minmax(min(100%, 12rem), 1fr))`, anchos con `min()`. Funcionan en muchísimos casos, y siguen siendo la primera opción.

Pero a veces el diseño tiene que cambiar de **estructura**: una página de tres columnas que se apila en una, un menú que pasa de fila a columna, una tabla que se convierte en tarjetas. Para eso, CSS necesita hacer preguntas: «¿cuánto mide la ventana?», «¿el usuario prefiere el tema oscuro?», «¿hay un ratón?». Las **media queries** preguntan por la ventana y el dispositivo; las **container queries** (lección 4), por la caja en la que vive un componente.

Este módulo tiene cinco lecciones: el viewport y las media queries; las preferencias del usuario (tema, movimiento, contraste, tipo de puntero) y `@supports`; la tipografía y los espacios fluidos; las container queries, y las imágenes responsive desde CSS. Cumple tres promesas de la primera lección del curso de CSS, la de las at-rules: `@media`, `@supports` y `@container`.

> **Cómo probar los ejemplos.** En LearnWeb, la ventana de cada ejemplo es su vista previa: las tarjetas de esta página miden **480px** de ancho. Cada ejemplo dice qué cambia y a partir de qué ancho. Para probar otros anchos, ensancha o estrecha la vista previa en el editor, o pulsa ↗ (abre la página en su propia pestaña) y cambia el tamaño de la ventana o usa el **modo dispositivo** de DevTools (<kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>M</kbd>).

## El viewport: lo que mide el CSS

El **viewport** es el rectángulo en el que se dibuja la página: en un escritorio, el interior de la ventana del navegador; en LearnWeb, el marco de la vista previa (un `iframe`). Todo lo que en CSS depende «de la pantalla» depende en realidad del viewport: las unidades `vw` y `vh`, el bloque contenedor inicial y las media queries de ancho y alto.

### La etiqueta `meta viewport`

En la lección de anatomía de un documento viste el truco de los primeros móviles: maquetar la página en un lienzo virtual de **980px** y encogerla hasta caber en la pantalla. Sin `<meta name="viewport" content="width=device-width, initial-scale=1">`, un móvil sigue haciéndolo, y eso tiene una consecuencia que entonces no podías ver: las media queries **también ven 980px**. Tus estilos para pantallas estrechas no se aplican nunca, y la página de escritorio aparece diminuta.

La vista previa no puede enseñarlo: un `iframe` ignora la etiqueta (solo cuenta en el documento principal de la pestaña). Este ejemplo es un documento completo; ábrelo en el editor, pulsa ↗, activa el modo dispositivo y elige un móvil. El indicador dirá «escritorio». Quita el comentario de la línea del viewport, vuelve a pulsar ↗ y dirá «móvil».

[[exercise:01-sin-meta-viewport.md-]]

### Zoom: el viewport se encoge

Al hacer zoom con <kbd>⌘</kbd> <kbd>+</kbd>, cada píxel CSS ocupa más píxeles de la pantalla, así que en la ventana caben **menos** píxeles CSS: a 200 % en una ventana de 1280px, el viewport mide 640px. Las media queries se recalculan y la página pasa a su diseño estrecho. Es justo lo que necesita quien amplía para leer, y lo que pide el criterio 1.4.10 de las pautas de accesibilidad WCAG (*Reflow*): a 400 % de zoom en una ventana de 1280px (320px de viewport), la página debe leerse sin scroll horizontal.

El zoom con dos dedos en un móvil (o en el trackpad) es otra cosa: amplía la imagen ya dibujada, como una lupa, sin cambiar el viewport ni las media queries.

### Ventana pequeña, grande y dinámica

En un móvil, la barra de direcciones se esconde al hacer scroll hacia abajo y reaparece al subir: el alto de la ventana cambia constantemente. En la lección de unidades viste las tres respuestas de CSS; aquí está el dibujo:

```text
  barra visible                    barra escondida
┌───────────────┐                ┌───────────────┐  ┐
│ huerto.mx     │                │               │  │
├───────────────┤  ┐             │               │  │
│               │  │             │               │  │
│    ventana    │  │ 100svh      │    ventana    │  │ 100lvh
│    pequeña    │  │             │    grande     │  │
│               │  │             │               │  │
└───────────────┘  ┘             └───────────────┘  ┘
       100dvh = el alto de la ventana en cada momento
```

- `svh`: el viewport **pequeño** (*small*), con todas las barras visibles. Lo que siempre se ve.
- `lvh`: el viewport **grande** (*large*), sin barras. En los móviles actuales, `vh` vale lo mismo que `lvh`, para que la página no salte cada vez que la barra se esconde.
- `dvh`: el viewport **dinámico**, el de cada momento. Sigue a la barra, así que lo que se mide con `dvh` cambia de tamaño mientras se hace scroll.
- Hay versiones para el ancho (`svw`, `lvw`, `dvw`) y para los ejes lógicos (`svi`, `svb`…). En un escritorio, todas coinciden con `vh` y `vw`.

[[exercise:02-100vh-en-el-movil.md]]

El dibujo es una simulación con píxeles, porque en el escritorio no hay barra que se esconda, ni siquiera en el modo dispositivo (DevTools no simula la barra que se esconde, así que allí `svh`, `lvh` y `dvh` valen lo mismo): para ver la diferencia hace falta un móvil de verdad. La regla práctica: `min-height: 100svh` cuando algo debe verse entero al cargar (una portada con su botón), `min-height: 100dvh` cuando debe ocupar al menos la pantalla (el pie pegado abajo del módulo de flexbox) y nunca `height: 100vh` en un móvil.

El ancho tiene su propia trampa, que ya viste en la lección de unidades: `100vw` incluye la barra de desplazamiento vertical. Con las barras que ocupan sitio (Windows, Linux, o macOS con un ratón conectado), `width: 100vw` es un poco más ancho que la página y aparece scroll horizontal. Para «todo el ancho», `width: 100%`.

## `@media`: preguntas sobre el viewport

Una media query es una condición que envuelve reglas normales:

```css
@media (width >= 40rem) {
  .products { grid-template-columns: repeat(2, 1fr); }
}
```

Mientras la condición se cumple, las reglas de dentro participan en la cascada; cuando deja de cumplirse, desaparecen. El navegador vuelve a evaluar la condición cada vez que cambia el viewport, sin recargar nada.

[[exercise:03-primera-media-query.md]]

### Tipos de medio y características

Una media query tiene dos partes, las dos opcionales:

- El **tipo de medio**: `screen` (pantallas), `print` (al imprimir o guardar como PDF) o `all` (todos, el valor por defecto). Los demás tipos que verás en código antiguo (`handheld`, `tv`…) ya no se usan.
- Las **características** (*media features*), entre paréntesis: preguntas sobre el viewport o el dispositivo.

| Característica | Pregunta | Ejemplo |
|---|---|---|
| `width`, `height` | el tamaño del viewport | `(width >= 40rem)` |
| `orientation` | `portrait` (alto ≥ ancho) o `landscape` | `(orientation: landscape)` |
| `aspect-ratio` | la proporción ancho / alto del viewport | `(aspect-ratio >= 16 / 9)` |
| `resolution` | la densidad de píxeles | `(resolution >= 2dppx)` |
| `hover`, `pointer` | el tipo de puntero | lección siguiente |
| `prefers-*` | las preferencias del usuario | lección siguiente |

`orientation` habla del **viewport**, no del aparato: una ventana de escritorio estrecha y alta es `portrait`, y la tarjeta de un ejemplo, más ancha que alta, es `landscape`. Por eso casi nunca es la pregunta correcta para elegir un layout: lo que importa es si el contenido cabe, y eso lo dice el ancho.

### La sintaxis de rangos

Durante veinte años, el ancho se preguntaba con `min-width` y `max-width`. Desde 2023 todos los navegadores entienden la sintaxis de **rangos**, que se lee como matemáticas:

| Antes | Con rangos | Significa |
|---|---|---|
| `(min-width: 40rem)` | `(width >= 40rem)` | 40rem o más |
| `(max-width: 40rem)` | `(width <= 40rem)` | 40rem o menos |
| no existe | `(width < 40rem)` | menos de 40rem |
| `(min-width: 25rem) and (max-width: 40rem)` | `(25rem <= width <= 40rem)` | entre los dos, ambos incluidos |

Las dos sintaxis son equivalentes donde coinciden, pero `<` y `>` no tenían equivalente, y eso provocaba el error de los breakpoints que se solapan (más abajo). En este curso, rangos.

### Combinar condiciones: `and`, `or`, `not` y comas

- `and`: se cumplen todas. `(width >= 40rem) and (orientation: landscape)`.
- `or` o una **coma**: basta con una. La coma separa consultas independientes (`print, (width >= 40rem)`); `or` combina condiciones dentro de una.
- `not`: niega una condición entre paréntesis, `not (width >= 40rem)`. Con un tipo de medio, niega la consulta entera: `not print and (color)` significa «cualquier cosa menos una impresora en color».
- No se pueden mezclar `and` y `or` sin paréntesis: `(a) and (b) or (c)` es **inválida**, y el navegador la convierte en `not all`, que no se cumple nunca. Escribe `(a) and ((b) or (c))`.
- `only screen and …` aparece en hojas antiguas: servía para esconder la consulta a navegadores de 2009. Hoy sobra.

[[exercise:04-rangos-y-operadores.md]]

## Las media queries y la cascada

Una media query **no suma especificidad**. Es una condición, nada más: si se cumple, sus reglas entran en la cascada con su especificidad de siempre y compiten como cualquier otra. Con empate, gana la que va después en la hoja. Por eso el orden habitual es: las reglas base de un componente primero y sus media queries después, de menor a mayor ancho.

[[exercise:05-la-media-query-no-suma-especificidad.md]]

En DevTools lo verás enseguida: en **Styles**, la declaración de la media query aparece **tachada**, con la regla que la vence encima. Si una media query «no funciona», mira primero si se cumple (el panel solo muestra las reglas de las consultas que se cumplen) y después quién le gana.

### `rem` y `em` dentro de una media query

Dentro de la página, `1rem` es el `font-size` de `<html>`. Dentro de una media query no hay ningún elemento del que tomar la letra, así que `rem` y `em` valen el tamaño **inicial**: el que tiene configurado el navegador, 16px por defecto. Si la página usa el viejo truco de `html { font-size: 62.5% }` (1rem = 10px), un `40rem` de la página mide 400px, pero un `40rem` de una media query mide 640px.

[[exercise:06-rem-en-media-queries.md]]

Que sigan a la configuración del navegador es justo su ventaja. Si alguien sube su letra a 24px, una media query de `40rem` se cumple a partir de 960px en lugar de 640px: la página se queda en su diseño estrecho más tiempo y el texto grande tiene sitio. Con `640px` fijos, ese texto acabaría en columnas apretadas. Por eso los breakpoints se escriben en `rem` (`em` daría lo mismo).

## Mobile-first

Hay dos formas de organizar una hoja responsive:

- **Desktop-first**: las reglas base son las del escritorio, y las media queries con `width <` **deshacen** lo que sobra en pantallas estrechas.
- **Mobile-first**: las reglas base son las de la pantalla más estrecha, y las media queries con `width >=` **añaden** lo que hace falta cuando hay sitio.

El diseño estrecho suele ser el más simple: una columna, en el orden del HTML, a menudo el flujo normal sin más. Empezar por él significa que las media queries solo añaden. Empezar por el escritorio significa que cada decisión del escritorio (una columna fija, un `sticky`, un `grid-column`) necesita otra línea que la deshaga, y olvidar una no da ningún error:

[[exercise:07-desktop-first-que-se-deshace.md]]

## ¿Dónde van los breakpoints?

Un **breakpoint** (punto de ruptura) es el ancho al que cambia el diseño. La tentación es copiar los anchos de los aparatos de moda (375px, 390px, 768px, 1024px…), pero cada año salen otros, y entre medias hay miles de ventanas de escritorio de cualquier tamaño. La pregunta útil es otra: **¿a qué ancho se rompe este contenido?**

El método: empieza con la versión estrecha y ensancha la ventana poco a poco. Cuando el diseño empiece a verse mal (líneas de texto demasiado largas, huecos vacíos, una imagen enorme), ahí va un breakpoint. O al revés: estrecha la versión ancha hasta que se rompa. En DevTools, el modo dispositivo con la opción **Responsive** tiene tiradores para arrastrar el ancho y una regla en la parte de arriba.

[[exercise:08-breakpoint-por-contenido.md]]

Y no hacen falta muchos. Los componentes que ya se adaptan solos (una rejilla con `auto-fit`, unas etiquetas con `flex-wrap`) no necesitan ninguno. Las media queries quedan para lo que de verdad cambia de estructura, como el esqueleto de la página. En el módulo de grid se prometió que una sola media query redibujaría el «santo grial» para apilarlo en pantallas estrechas; aquí está, escrito mobile-first:

[[exercise:09-el-santo-grial-se-apila.md]]

## Breakpoints que se solapan

`min-width` y `max-width` **incluyen** su valor: `(max-width: 320px)` se cumple a 320px, y `(min-width: 320px)` también. A ese ancho exacto se aplican las dos media queries, y se mezclan sus reglas. Para comprobarlo hacen falta anchos exactos, así que este ejemplo usa tres `iframe` como «mini viewports»: cada uno es una ventana con el ancho que dice su rótulo.

[[exercise:10-breakpoints-que-se-solapan.md]]

El parche clásico era restar un píxel, `(max-width: 319px)`, pero eso abre un hueco: con zoom o en pantallas de alta densidad, el viewport puede medir 319.5px, y entonces no se cumple ninguna de las dos. Por eso en hojas antiguas verás cosas como `max-width: 319.98px`. La sintaxis de rangos lo resuelve sin trucos: `(width < 320px)` y `(width >= 320px)` reparten todos los anchos posibles, sin solaparse y sin huecos.

## Imprimir: `@media print`

El tipo `print` se aplica al imprimir o al guardar como PDF. Unas pocas reglas mejoran mucho una página impresa:

```css
@media print {
  nav, .cart-button, video { display: none; }        /* lo que en papel no sirve */
  body { color: #000000; background: #ffffff; }
  a[href^="http"]::after { content: " (" attr(href) ")"; }   /* la dirección, a la vista */
  h2, figure, tr { break-inside: avoid; }             /* que no se partan entre páginas */
}
```

Para verlas sin gastar papel: en DevTools, menú ⋮ → **More tools** → **Rendering** → **Emulate CSS media type** → `print`. Los fondos no se imprimen por defecto (el navegador los quita para ahorrar tinta), así que nada importante debe depender de un `background`.

## Cómo verlo en DevTools

- **Modo dispositivo** (<kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>M</kbd>): elige un móvil de la lista o **Responsive** para arrastrar el ancho. En el menú ⋮ de esa barra, **Show media queries** dibuja una franja por cada media query de la página; al hacer clic en una, la ventana salta a ese ancho.
- **Styles**: cada regla que está dentro de una media query lleva la condición encima (`@media (width >= 40rem)`). Las de las consultas que no se cumplen no aparecen.
- **Rendering** → **Emulate CSS media type**: `print` o `screen`.
- **Zoom**: pulsa <kbd>⌘</kbd> <kbd>+</kbd> en una pestaña abierta con ↗ y mira cómo cambia el diseño al estrecharse el viewport.

## Bestiario

- **En el móvil se ve la versión de escritorio, diminuta.** Síntoma: los estilos para pantallas estrechas no se aplican en ningún móvil. Causa: falta `<meta name="viewport" content="width=device-width, initial-scale=1">`; el móvil maqueta a 980px y las media queries ven 980px. Solución: la etiqueta en el `<head>` de cada página. → [ver ejemplo](01-sin-meta-viewport.md)
- **A un ancho exacto se ven dos versiones a la vez.** Síntoma: a 320px aparecen el botón de menú y los enlaces. Causa: `max-width: 320px` y `min-width: 320px` incluyen el 320 y se cumplen las dos; restar un píxel deja un hueco con zoom. Solución: la sintaxis de rangos, `width < 320px` y `width >= 320px`. → [ver ejemplo](10-breakpoints-que-se-solapan.md)
- **La media query se cumple pero no hace nada.** Síntoma: el indicador dice que la condición se cumple y la propiedad no cambia; en DevTools aparece tachada. Causa: una media query no suma especificidad, y una regla igual de específica que va después en la hoja gana. Solución: las reglas base primero y las media queries después. → [ver ejemplo](05-la-media-query-no-suma-especificidad.md)
- **El breakpoint en `rem` salta donde no esperabas.** Síntoma: con `html { font-size: 62.5% }`, `(width >= 40rem)` no se cumple a 400px sino a 640px. Causa: en una media query, `rem` y `em` valen el tamaño de letra inicial del navegador, no el de `<html>`. Solución: piensa los breakpoints con 1rem = 16px (o el tamaño que el usuario elija). → [ver ejemplo](06-rem-en-media-queries.md)
- **El móvil hereda trozos del escritorio.** Síntoma: en pantallas estrechas, un elemento sigue en una columna lateral o con un ancho fijo. Causa: desktop-first obliga a deshacer cada decisión del escritorio, y una se olvidó. Solución: mobile-first, con media queries `width >=` que solo añaden. → [ver ejemplo](07-desktop-first-que-se-deshace.md)
- **La portada esconde su botón en el móvil.** Síntoma: con `height: 100vh`, lo que va al final de la portada queda bajo el borde de la pantalla al cargar. Causa: en los móviles, `vh` mide el viewport grande, sin la barra de direcciones. Solución: `100svh` para lo que debe verse entero; `min-height: 100dvh` para «al menos la pantalla». → [ver ejemplo](02-100vh-en-el-movil.md)

## Resumen

- El viewport es el rectángulo donde se dibuja la página (en LearnWeb, la vista previa); sin `meta viewport`, un móvil lo hace de 980px y las media queries no ven el móvil.
- `@media (condición) { … }` aplica reglas mientras la condición se cumple; el navegador la reevalúa al cambiar el viewport, también con el zoom.
- Usa la sintaxis de rangos (`width >= 40rem`, `25rem <= width < 40rem`): no deja solapes ni huecos. `and`, `or`, `not` y comas combinan condiciones; `and` y `or` mezclados necesitan paréntesis.
- Una media query no suma especificidad: las reglas base van primero y las media queries después.
- En una media query, `rem` y `em` valen la letra inicial del navegador (16px por defecto, o la que elija el usuario), por eso los breakpoints van en `rem`.
- Mobile-first: lo estrecho como base y `width >=` para añadir. Los breakpoints los decide el contenido, y muchos componentes no necesitan ninguno.
- En el móvil, `svh` es la ventana con barras, `lvh` (y `vh`) sin ellas y `dvh` la de cada momento.

## Para profundizar

- [MDN: Usar media queries](https://developer.mozilla.org/es/docs/Web/CSS/CSS_media_queries/Using_media_queries)
- [web.dev: Media queries (Learn Design)](https://web.dev/learn/design/media-queries)
- [web.dev: The large, small, and dynamic viewport units](https://web.dev/blog/viewport-units)
- [WCAG 2.2: 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Especificación: Media Queries Level 4](https://www.w3.org/TR/mediaqueries-4/)
