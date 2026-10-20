# Medidas y layout

## Por qué importa

Colocar un tooltip junto a un botón, saber si un elemento se ve en pantalla, hacer que una lista se desplace hasta el producto elegido, ajustar una miniatura al espacio que le da el grid: para todo eso, JavaScript necesita **medir** lo que el navegador ha colocado. Las medidas existen después del **layout**, la fase en la que el navegador calcula la posición y el tamaño de cada caja (lo viste en «Del HTML a los píxeles»).

Hay muchas propiedades de medida, con nombres parecidos y diferencias pequeñas: unas redondean, otras ignoran las transformaciones, otras no cuentan la barra de scroll. Y medir tiene un coste escondido: si acabas de cambiar algo, leer una medida obliga al navegador a recalcular el layout en ese instante. Hecho en un bucle, es una de las causas más comunes de páginas lentas.

Los ejemplos de esta lección usan cajas con tamaños explícitos en px para que los números sean exactos. Las medidas de lo que depende del texto o del ancho de la ventana cambian de un ordenador a otro, y los ejemplos lo marcan con «varía».

## Dónde está y cuánto mide: `getBoundingClientRect`

`el.getBoundingClientRect()` devuelve un `DOMRect` con la **caja de borde** del elemento (contenido + padding + borde): su posición (`x`/`left`, `y`/`top`), su tamaño (`width`, `height`) y sus bordes derecho e inferior (`right`, `bottom`). Las coordenadas son relativas a la **ventana** (la parte visible de la página), no al documento: si haces scroll, `top` cambia. Para la posición en el documento, suma lo desplazado, `window.scrollY`:

```text
documento ─────────────────────────────
   ↑ scrollY (30)
┌─ ventana ────────────────────────────┐
│ ↑ rect.top (−22: la tarjeta ya se    │
│   salió por arriba)                  │
│                                      │
└──────────────────────────────────────┘
posición en el documento = rect.top + scrollY = 8
```

[[exercise:01-getboundingclientrect.md-]]

```text
rect → DOMRect {x: 8, y: 8, width: 224, height: 74, top: 8, right: 232, bottom: 82, left: 8}
ancho = 200 + 2×10 + 2×2 → 224
right = left + width → true
scrollY → 30
top tras bajar 30 px → -22
top en el documento = top + scrollY → 8
el rect de antes sigue diciendo top → 8
```

La tarjeta empieza en (8, 8) por el margen por defecto del `<body>`. El `DOMRect` es una **foto**: si la página se mueve, hay que volver a pedirlo. Un elemento con `display: none` no tiene caja, y todas sus medidas son 0. Para un elemento en línea partido en varias líneas, `getClientRects()` da un rectángulo por cada trozo.

## Tres familias de medidas: `offset*`, `client*` y `scroll*`

Además del `DOMRect`, cada elemento tiene tres familias de propiedades de medida, más antiguas, que devuelven números enteros:

```text
┌──────────────────── offsetWidth ─────────────────────┐
│ borde (clientLeft)                                   │
│  ┌────────────── clientWidth ───────────────┐ ┌───┐  │
│  │ padding                                  │ │ ▓ │  │ ← barra de
│  │    contenido visible                     │ │   │  │   scroll
│  └──────────────────────────────────────────┘ └───┘  │
└──────────────────────────────────────────────────────┘
scrollHeight: el contenido entero, también lo que está fuera de la vista
scrollTop: cuánto se ha desplazado
```

| Propiedad | Qué mide |
|-----------|----------|
| `offsetWidth`, `offsetHeight` | la caja de borde: contenido + padding + borde (+ barra de scroll) |
| `offsetTop`, `offsetLeft` | la posición respecto a su `offsetParent` (el antepasado posicionado más cercano, o el `<body>`) |
| `clientWidth`, `clientHeight` | el interior visible: contenido + padding, **sin** borde ni barra |
| `clientTop`, `clientLeft` | el grosor del borde superior e izquierdo |
| `scrollWidth`, `scrollHeight` | todo el contenido, también lo que no se ve, con su padding |
| `scrollTop`, `scrollLeft` | cuánto se ha desplazado; **se pueden escribir** |

[[exercise:02-offset-client-scroll.md-]]

```text
offsetWidth → 224 | offsetHeight → 144
clientHeight → 140 | clientTop (el borde) → 2
scrollHeight = 10 + 6 × 40 + 10 → 260
scrollTop → 0
scrollTop = 50 → 50
scrollTop = 999 → 120 = scrollHeight − clientHeight: 120
¿offsetParent es la caja? → true
offsetTop del paso 4 = 10 + 3 × 40 → 130
```

El desplazamiento máximo es `scrollHeight − clientHeight`, y un valor mayor se limita a él sin error. Con esa resta se calcula si una caja «ha llegado al final» o cuánto le falta.

### `offsetWidth` redondea y no ve las transformaciones

`offsetWidth` es un entero: una caja de 120.75 px mide 121. Y mide la caja de **layout**, antes de aplicar `transform`, así que una caja con `scale(2)` sigue midiendo lo mismo. `getBoundingClientRect()` da el tamaño en pantalla, con decimales y con las transformaciones aplicadas:

[[exercise:03-offsetwidth-redondea.md]]

```text
🐛 offsetWidth → 121
✅ getBoundingClientRect().width → 120.75
🐛 4 × offsetWidth → 484 px
✅ 4 × rect.width → 483 px
🐛 offsetWidth con scale(2) → 121
✅ rect con scale(2) → 241.5 × 60
```

Un píxel de error parece poco hasta que se acumula: cuatro columnas calculadas con `offsetWidth` no caben en el contenedor, o un tooltip colocado junto a un elemento ampliado con `scale` sale encima de él. Usa `getBoundingClientRect()` para posicionar cosas en pantalla y `offsetWidth` cuando quieras el tamaño de layout, sin transformar.

### `clientWidth` no incluye la barra de scroll

La barra de scroll vertical ocupa sitio **dentro** de la caja, entre el borde y el padding. `offsetWidth` la incluye y `clientWidth` no, así que el ancho útil de una caja con scroll es `clientWidth − padding`. Calcularlo a partir de `offsetWidth` deja el contenido unos píxeles más ancho de lo que cabe, y aparece un scroll horizontal:

[[exercise:04-clientwidth-sin-barra.md]]

```text
offsetWidth → 224
clientWidth → 208
barra de scroll → 12 px
🐛 banner de 200px → ¿scroll horizontal? → true
✅ banner de 188px → ¿scroll horizontal? → false
barra del sistema (varía) → 0 px
barra de la ventana (varía) → 0 px
```

El ejemplo fuerza una barra de 12 px con `::-webkit-scrollbar` para que el efecto se vea en cualquier ordenador, porque el ancho de la barra del sistema **varía**: en macOS con trackpad las barras son superpuestas (aparecen al desplazar, encima del contenido) y ocupan 0 px; en Windows, o en macOS con un ratón conectado, unos 15 px. Es un bug que no ves en tu Mac y sí ven tus usuarios. Con la ventana pasa lo mismo: `window.innerWidth` incluye la barra y `document.documentElement.clientWidth`, no.

## Desplazar desde JavaScript

Los elementos con scroll, y la ventana, tienen tres métodos para desplazarse:

- `el.scrollTo({ top, left, behavior })` va a una posición; `window.scrollTo(…)` hace lo mismo con la página.
- `el.scrollBy({ top, left, behavior })` se desplaza **relativamente** a la posición actual.
- `target.scrollIntoView({ behavior, block, inline })` desplaza **todos** los contenedores con scroll que hagan falta, también la página, hasta que `target` se vea. `block: 'start'` lo alinea arriba, `'center'` en el centro y `'nearest'` desplaza lo mínimo.

`behavior` es `'auto'` (instantáneo, salvo que el CSS diga `scroll-behavior: smooth`) o `'smooth'`, que anima el desplazamiento durante los frames siguientes. Por eso, justo después de un desplazamiento suave, `scrollTop` todavía tiene el valor viejo:

[[exercise:05-scroll-programatico.md]]

```text
scrollTo({ top: 80 }) → 80
scrollBy({ top: 40 }) → 120
justo después de un scrollTo 'smooth' → 120
offsetTop del capítulo 6 → 200
```

Pulsa los dos botones del ejemplo con «▶ Run». `scrollTo` del contenedor solo mueve la lista; `scrollIntoView` mueve la lista **y** la página si la lista no se ve entera. Es lo que quieres para «ir al producto elegido», pero sorprende cuando un componente pequeño hace saltar la página entera. En el módulo de eventos verás el evento `scrollend`, que avisa cuando termina un desplazamiento suave.

## Cuándo calcula el navegador el layout

Para entender el coste de medir, recuerda el trabajo que hace el navegador en cada frame (lecciones «Del HTML a los píxeles» y «Frames de animación y tiempo»):

```text
 tu JavaScript ──► estilos ──► layout ──► pintado ──► composición
 (cambia el DOM)   (qué CSS     (posición   (píxeles)   (capas en
                   le toca)     y tamaño)               pantalla)
```

Cuando tu código **escribe** (un estilo, una clase, un nodo nuevo), el navegador no recalcula nada en ese momento: apunta que el layout está pendiente y lo calcula una sola vez, antes de pintar el siguiente frame. Pero si después tu código **lee** una medida, el navegador no puede darte un número viejo: tiene que calcular el layout **en ese instante**, a mitad de tu script. Es un **layout forzado** (*forced reflow*):

[[exercise:06-leer-fuerza-el-layout.md-]]

```text
altura → 40
altura justo después de cambiarla → 120
tras tres escrituras → 80
300 lecturas sin cambios → 0.10 ms (varía)
300 lecturas tras un cambio → 3.40 ms (varía)
¿leer tras escribir es más caro? → true
```

Fuerzan el layout todas las propiedades de medida (`offset*`, `client*`, `scroll*`), `getBoundingClientRect()`, los valores de `getComputedStyle` que dependen del layout, `innerText` (lección «Crear y modificar elementos»), `scrollTo`, `scrollIntoView` y `focus()`. Un layout forzado no es un error: a veces necesitas la medida. El problema es forzar muchos seguidos.

## Layout thrashing

Si un bucle **lee** una medida y **escribe** un estilo en cada vuelta, cada lectura llega con el layout pendiente por la escritura anterior: el navegador recalcula el layout **en cada vuelta**. Es el *layout thrashing* (literalmente, «apalear el layout»), y su coste crece con el tamaño de la página:

```text
🐛 alternando:  leer escribir │ leer escribir │ leer escribir …   → un layout por vuelta
                 ▲ layout       ▲ layout        ▲ layout
✅ por lotes:   leer leer leer … │ escribir escribir escribir …   → un layout en total
                 ▲ layout
```

[[exercise:07-layout-thrashing.md]]

```text
🐛 alternando → 48.3 ms (varía)
✅ por lotes → 0.9 ms (varía)
¿por lotes es más rápido? → true
alto de una miniatura → 19px (varía con el ancho de la vista previa)
```

Los números cambian de un ordenador a otro, pero la diferencia es siempre grande: decenas de veces, que en un móvil lento son la diferencia entre una interfaz fluida y una que se congela. Las soluciones:

- **Agrupa**: primero todas las lecturas (guárdalas en un array), después todas las escrituras.
- **Guarda** las medidas que no cambian en una variable, en lugar de leerlas en cada vuelta.
- Si las lecturas y las escrituras vienen de partes distintas del código, deja las escrituras para el siguiente frame con `requestAnimationFrame` (módulo «Asincronía y event loop»): así nunca se intercalan con lecturas.
- Mejor aún, deja que el CSS haga el trabajo cuando pueda: `aspect-ratio`, flexbox o grid colocan y dimensionan sin una línea de JavaScript.

En DevTools, el panel **Performance** marca estos casos con barras moradas de «Layout» y el aviso *Forced reflow is a likely performance bottleneck*.

## Bestiario

- **El píxel que falta (o sobra).**
  Síntoma: columnas calculadas con `offsetWidth` que no caben; un tooltip mal colocado junto a un elemento con `transform`.
  Causa: `offsetWidth` redondea a enteros y mide la caja sin transformaciones.
  Solución: `getBoundingClientRect()` para el tamaño y la posición en pantalla.
  → [ver ejemplo](03-offsetwidth-redondea.md)
- **El scroll horizontal que solo ven otros.**
  Síntoma: un contenido calculado para llenar una caja con scroll se sale unos píxeles; en tu Mac no pasa.
  Causa: `offsetWidth` incluye la barra de scroll; en macOS con trackpad las barras ocupan 0 px y en otros sistemas unos 15.
  Solución: calcula el espacio útil con `clientWidth` (o `documentElement.clientWidth` para la ventana) y prueba con barras clásicas.
  → [ver ejemplo](04-clientwidth-sin-barra.md)
- **El bucle que congela la página.**
  Síntoma: un bucle sobre unos cientos de elementos tarda decenas de milisegundos; Performance muestra muchas barras de «Layout» seguidas.
  Causa: layout thrashing: cada lectura de una medida tras una escritura fuerza un layout completo.
  Solución: lee todo primero y escribe después; guarda las medidas fijas; escribe en `requestAnimationFrame`; usa CSS cuando se pueda.
  → [ver ejemplo](07-layout-thrashing.md)

## Resumen

- `getBoundingClientRect()` da la caja de borde en pantalla, con decimales y transformaciones, relativa a la ventana; `+ scrollY` la pasa al documento.
- `offset*`: caja de borde en enteros (sin transformaciones) y posición respecto al `offsetParent`.
- `client*`: el interior visible, sin borde ni barra de scroll; `scroll*`: todo el contenido y lo desplazado (`scrollTop` se escribe).
- La barra de scroll ocupa sitio dentro de la caja, y su ancho varía según el sistema (0 px en macOS con trackpad).
- `scrollTo`, `scrollBy` y `scrollIntoView` desplazan; con `behavior: 'smooth'`, el valor cambia en los frames siguientes.
- Escribir deja el layout pendiente; leer una medida lo fuerza en ese instante.
- Leer y escribir alternando en un bucle es layout thrashing: agrupa las lecturas y después las escrituras.

## Para profundizar

- [MDN: Element.getBoundingClientRect()](https://developer.mozilla.org/es/docs/Web/API/Element/getBoundingClientRect)
- [javascript.info: tamaño de los elementos y scroll](https://es.javascript.info/size-and-scroll)
- [javascript.info: coordenadas](https://es.javascript.info/coordinates)
- [web.dev: evitar layouts grandes y complejos y el layout thrashing (en inglés)](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- [Paul Irish: qué fuerza el layout (en inglés)](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)
