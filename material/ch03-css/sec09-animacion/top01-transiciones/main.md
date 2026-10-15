# Transiciones

## Por qué importa

En el módulo de efectos visuales, todos los cambios de estado eran instantáneos: la tarjeta que se voltea, las notas adhesivas que crecen, la foto en gris que recupera el color, la tarjeta del vivero que se levanta. Cada ejemplo lo avisaba: «las transiciones llegan en el módulo de animación». Ya están aquí.

Una **transición** le pide al navegador que, cuando una propiedad cambie de valor, no salte: que recorra los valores intermedios durante un tiempo. Es la animación más sencilla y la más usada de la web, porque no hay que describir el movimiento: basta con los dos estados que ya tenías (el normal y el `:hover`, el cerrado y el abierto) y una línea que diga cuánto tarda el viaje. Bien usada, explica qué ha cambiado y de dónde viene; mal usada, se nota (lo que vuelve de golpe, lo que se anima sin querer, lo que no hay forma de animar).

Este módulo tiene cinco lecciones: las transiciones; las curvas de aceleración (*easing*); las animaciones con `@keyframes`; el rendimiento (qué cuesta animar cada propiedad y por qué una animación de CSS sigue moviéndose aunque JavaScript esté ocupado); y las animaciones modernas: ligadas al scroll, View Transitions y las entradas y salidas de diálogos y popovers.

### Una convención para todo el módulo: el movimiento reducido

En el módulo anterior viste la media feature `prefers-reduced-motion`: algunas personas piden a su sistema menos movimiento, porque los desplazamientos, los giros y los zooms les causan mareo o distracción. Todos los ejemplos de este módulo la respetan con la misma receta:

- Los **fundidos** (color, opacidad, sombra) se animan siempre.
- El **movimiento** (`translate`, `rotate`, `scale`, cambios de tamaño) se anima solo dentro de `@media (prefers-reduced-motion: no-preference)`. Con `reduce`, el elemento llega a su sitio sin viajar.

```css
.card {
  transition: box-shadow 200ms;                 /* para todo el mundo */
}

@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: box-shadow 200ms, translate 200ms;   /* y además, el movimiento */
  }
}
```

En el Chrome de este curso, la preferencia está en `no-preference`, así que verás todo el movimiento. Para probar la otra versión, abre el ejemplo en su pestaña con el botón ↗ y usa DevTools → <kbd>⋮</kbd> → **More tools** → **Rendering** → **Emulate CSS media feature prefers-reduced-motion** → `reduce`; o actívalo en todo el Mac: **System Settings** (Ajustes del Sistema) → **Accessibility** → **Display** → **Reduce motion**. La lección de rendimiento dedica un ejemplo entero a qué significa «reducir» (no es «quitar todas las animaciones»).

## Una transición

Una transición empieza cuando el **valor calculado** de una propiedad cambia: porque se cumple `:hover` o `:focus-visible`, porque se marca una casilla, porque JavaScript añade una clase o porque cambia una media query. El navegador anota el valor de antes y el de después, y durante la duración pinta en cada fotograma un valor intermedio.

[[exercise:01-primera-transicion.md]]

Tres detalles del ejemplo que valen para todas las transiciones:

- `transition` va en la regla **base**, no en la del estado: así vale para ir y para volver.
- Si interrumpes una transición a mitad (sales del botón antes de que termine), el navegador no salta: da la vuelta desde donde está, y la vuelta dura proporcionalmente menos.
- Al cargar la página no hay transición: un elemento recién creado no tiene «valor de antes». Lo aprovecharás (y lo sufrirás) con `display: none` más abajo.

## Las propiedades de una transición

| Propiedad | Qué dice | Por defecto |
|---|---|---|
| `transition-property` | qué propiedades se animan (`all`, un nombre o una lista) | `all` |
| `transition-duration` | cuánto tarda, en `s` o `ms` | `0s`: no hay transición |
| `transition-timing-function` | con qué curva de velocidad (lección siguiente) | `ease` |
| `transition-delay` | cuánto espera antes de empezar; negativo = empieza ya avanzada | `0s` |
| `transition-behavior` | si las propiedades discretas entran en la transición | `normal` |

El atajo `transition` las reúne, y admite una lista separada por comas, una entrada por propiedad. Dentro de cada entrada el orden casi da igual, salvo en los tiempos: **el primer tiempo es la duración y el segundo, el retardo**. `transition: translate 400ms 600ms` dura 0,4 s y espera 0,6 s.

[[exercise:02-duracion-y-retardo.md]]

Como `transition-duration` vale `0s` por defecto, nada se anima hasta que lo pides. Duraciones orientativas para interfaces: entre 100 y 200 ms para cambios de color o un botón; entre 200 y 400 ms para algo que se mueve o cambia de tamaño; más de 500 ms solo para movimientos grandes, y nunca para algo que la persona espera a diario (cada animación lenta se paga cien veces).

## ¿Qué se puede animar?

Para recorrer «los valores intermedios», tiene que haberlos. Según eso, cada propiedad es de uno de tres tipos:

| Tipo | Ejemplos | Qué hace en una transición |
|---|---|---|
| **Interpolable** | longitudes (`width`, `padding`, `translate`), números (`opacity`, `font-weight`), colores, ángulos, `transform`, `filter`, `box-shadow`, `border-radius`, `fr` en grid | pasa por todos los valores intermedios |
| **Discreta** | `display`, `justify-content`, `font-style`, `visibility`, `content-visibility`, palabras clave en general | sin más, salta al principio; con `allow-discrete`, salta a la mitad |
| **No animable** | `transition-*` y `animation-*` | nunca |

Interpolar es lo que harías a mano: valor = inicio + (fin − inicio) × progreso. Con colores se hace canal a canal; con sombras y filtros, función a función.

> **Desde Python:** una interpolación es un `lerp`, y una propiedad discreta es una que solo sabe elegir uno de los dos extremos:

```python
def lerp(start, end, progress):        # interpolable: width, opacity, colores…
    return start + (end - start) * progress

def discrete(start, end, progress):    # discreta con allow-discrete: justify-content…
    return start if progress < 0.5 else end

for progress in (0, 0.25, 0.5, 0.75, 1):
    print(f"{progress:>4} → width {lerp(30, 120, progress):5.1f}px · justify-content {discrete('flex-start', 'flex-end', progress)}")
```

```text
   0 → width  30.0px · justify-content flex-start
0.25 → width  52.5px · justify-content flex-start
 0.5 → width  75.0px · justify-content flex-end
0.75 → width  97.5px · justify-content flex-end
   1 → width 120.0px · justify-content flex-end
```

En el ejemplo, todas las muestras tienen `transition: all 1.5s linear` y cambian a la vez:

[[exercise:03-que-se-puede-animar.md]]

`visibility` es un caso especial que conviene recordar: aunque es discreta, se anima de forma que el elemento es **visible durante toda la transición** si uno de los dos extremos es `visible`. Por eso `opacity` + `visibility` es la pareja clásica para ocultar algo con fundido sin que siga recibiendo clics ni el foco al terminar.

## La transición vive en el estado de llegada

Cuando un valor cambia, el navegador usa la transición del estilo **nuevo**, el de llegada. Si `transition` solo está en la regla de `:hover`, al entrar se anima (el estado nuevo la tiene) y al salir no (el estado nuevo es el base, con `0s`). Es el error más común con las transiciones: el efecto entra con suavidad y vuelve de golpe.

[[exercise:04-transicion-solo-en-hover.md]]

Las notas son las de la lección de transformaciones, con `rotate` y `scale` sueltas para que el `:hover` no borre el giro. Esa misma regla, usada a propósito, permite curvas o retardos distintos para entrar y para salir: lo verás en el ejemplo escalonado de esta lección y en la lección de curvas.

## `transition: all`, o animar lo que no querías

`all` es el valor por defecto de `transition-property`, y es cómodo: `transition: 300ms` anima cualquier cambio. Pero anima **todo** lo que cambie, también lo que no tenías en mente: una negrita en `:hover` (`font-weight` es un número), un `padding`, el contorno del foco, el cambio a un tema oscuro o un tamaño que cambia con una media query.

[[exercise:05-transition-all.md]]

Hay un segundo coste, menos visible: animar `font-weight` o `padding` obliga a rehacer el layout en cada fotograma (la lección de rendimiento lo mide). Escribe siempre la lista de propiedades que de verdad quieres animar.

## Aparecer y desaparecer: `display: none`

Ocultar con `display: none` y mostrar con `display: block` es lo más habitual, y no se puede fundir sin ayuda, por dos razones: `display` es discreta, y un elemento con `display: none` no tiene caja, así que al aparecer no tiene «valor de antes» desde el que animar. Hacen falta dos piezas (Chrome 117 y posteriores):

- **`transition-behavior: allow-discrete`** (o la palabra `allow-discrete` dentro del atajo) con `display` en la lista. Al ocultar, el navegador mantiene `display: block` durante toda la transición y lo cambia a `none` al final: la salida se anima.
- **`@starting-style`**, una regla con el estilo «de antes» para el primer fotograma en que el elemento tiene caja: la entrada se anima.

[[exercise:06-display-none-no-transiciona.md]]

Fíjate en la trampa del comentario final: `@starting-style` compite en la cascada como cualquier regla. Si va antes que la regla que pone `opacity: 1`, con la misma especificidad, pierde, y el aviso entra sin fundido. Pon siempre `@starting-style` después.

La misma pareja anima la entrada y la salida de los diálogos y los popovers, que además necesitan la propiedad `overlay`: lo verás en la lección de animaciones modernas.

## `height: auto`

El otro clásico: un panel que se abre pasando de `height: 0` a `height: auto`. `auto` no es un número, sino «lo que mida el contenido», así que no hay valores intermedios y la transición no ocurre. Hay tres soluciones:

| Solución | Cómo | Soporte |
|---|---|---|
| `interpolate-size: allow-keywords` | una línea en `:root`, y `height: auto` ya se anima | Chrome 129+ |
| `calc-size(auto, size)` | `height: calc-size(auto, size)` en lugar de `auto`, solo para esa propiedad | Chrome 129+ |
| una fila de grid de `0fr` a `1fr` | el contenedor es un grid de una fila; el hijo, con `min-height: 0` y `overflow: hidden` | todos los navegadores |

[[exercise:07-height-auto-no-transiciona.md]]

El viejo truco de `max-height: 0` → `max-height: 1000px` también «funciona», pero con un tiempo falso: la transición recorre los 1000px aunque el contenido mida 80, así que al cerrar hay una espera muerta antes de que se vea moverse. Y un detalle de accesibilidad: un panel cerrado con `height: 0` sigue en el documento, y un lector de pantalla lee su contenido. Añade `visibility: hidden` en el estado cerrado (con su transición, como en el ejemplo escalonado) o usa un elemento que ya oculta de verdad, como `<details>`.

Con `interpolate-size` y el pseudoelemento `::details-content` (Chrome 131+), el acordeón de `<details>` de la lección de elementos interactivos se anima sin JavaScript:

[[exercise:08-acordeon-con-details.md]]

## Escalonar con `transition-delay`

Un retardo distinto para cada elemento de una lista crea un efecto de cascada. La forma limpia es una custom property con la posición de cada elemento y un `calc()`: `transition-delay: calc(var(--i) * 80ms)`.

[[exercise:09-escalonado-con-transition-delay.md]]

El retardo solo está en el estado abierto. Como manda la transición del estado de llegada, los pasos aparecen en cascada y se van todos a la vez, que es lo que se espera al cerrar. Ojo con las listas largas: con 20 elementos, el último espera 1,6 s.

## Saber cuándo termina: `transitionend`

Cuando una transición termina, el elemento recibe el evento `transitionend`. Escucharlo es cosa de JavaScript (los eventos llegan en el capítulo 6), pero sus dos sorpresas son de CSS y conviene conocerlas ya:

- Llega **una vez por propiedad**, y los atajos cuentan como varias: `padding` son cuatro (`padding-top`, `padding-right`, `padding-bottom`, `padding-left`).
- Si la transición **se interrumpe** (el estado cambia antes de que acabe) o el elemento pasa a `display: none`, no llega `transitionend`, sino `transitioncancel`. Si la duración es `0s`, no hay transición y no llega ninguno: por eso los tokens de movimiento del módulo de Sass, con «reducir movimiento», bajaban las duraciones a `1ms` y no a `0s`.

[[exercise:10-transitionend.md-]]

Al marcar «Ampliar la tarjeta» y esperar, la consola muestra cinco líneas, una por propiedad. Cuando varias transiciones acaban a la vez, sus eventos llegan en orden alfabético del nombre de la propiedad (así lo pide la especificación, y así lo hace Chrome):

```text
transitionend nº 1 → background-color
transitionend nº 2 → padding-bottom
transitionend nº 3 → padding-left
transitionend nº 4 → padding-right
transitionend nº 5 → padding-top
```

Al ocultar la tarjeta a mitad, en cambio, aparecen cinco `transitioncancel` y ningún `transitionend`. Si un código espera a «cuando acabe la transición» para quitar un elemento o cargar algo, comprueba `event.propertyName` y prevé que el evento no llegue nunca.

## Cómo verlo en DevTools

- **Forzar el estado.** En **Elements** → **Styles**, el botón **:hov** fuerza `:hover`, `:focus-visible` o `:active` en el elemento seleccionado, para estudiar la regla del estado sin mantener el ratón encima.
- **A cámara lenta.** <kbd>⋮</kbd> → **More tools** → **Animations** abre un panel que graba cada transición y animación de la página: puedes reproducirla al 25 % o al 10 % de velocidad y arrastrar la línea de tiempo para verla fotograma a fotograma.
- **Movimiento reducido.** **Rendering** → **Emulate CSS media feature prefers-reduced-motion**, como se explicó al principio.

## Bestiario

- **Entra con suavidad y vuelve de golpe.** Síntoma: el `:hover` se anima al entrar y salta al salir. Causa: la transición que se usa es la del estado de llegada, y solo la regla de `:hover` tenía `transition`. Solución: `transition` en la regla base. → [ver ejemplo](04-transicion-solo-en-hover.md)
- **Se anima lo que no debía.** Síntoma: la negrita engorda poco a poco, las vecinas se deslizan, un cambio de tema se arrastra medio segundo. Causa: `transition: all` anima cualquier propiedad que cambie. Solución: la lista de las propiedades que quieres animar. → [ver ejemplo](05-transition-all.md)
- **El aviso aparece y desaparece de golpe.** Síntoma: con `display: none` ↔ `block`, la transición de `opacity` no se ve. Causa: `display` es discreta y un elemento sin caja no tiene valor de partida. Solución: `display` con `allow-discrete` en la transición y `@starting-style` (después de la regla del estado visible). → [ver ejemplo](06-display-none-no-transiciona.md)
- **El panel no se despliega, salta.** Síntoma: `height: 0` → `auto` se abre y se cierra de golpe. Causa: `auto` no es un número que se pueda interpolar. Solución: `interpolate-size: allow-keywords` en `:root`, `calc-size(auto, size)` o una fila de grid de `0fr` a `1fr`. → [ver ejemplo](07-height-auto-no-transiciona.md)
- **«Cuando acabe la transición» ocurre cinco veces, o nunca.** Síntoma: el código de `transitionend` se ejecuta varias veces, o no se ejecuta. Causa: llega uno por propiedad (y un atajo son varias), y si la transición se interrumpe o el elemento se oculta, llega `transitioncancel`. Solución: filtrar por `event.propertyName` y no depender de que el evento llegue. → [ver ejemplo](10-transitionend.md)

## Resumen

- Una transición anima el cambio de valor de una propiedad entre dos estados: `transition: propiedad duración curva retardo`, con el primer tiempo como duración y el segundo como retardo.
- La transición que se usa es la del estado de llegada: en la regla base vale para ir y volver; en la regla del estado, solo para ir.
- Las propiedades interpolables pasan por valores intermedios; las discretas saltan al principio, o a la mitad con `allow-discrete`.
- Lista las propiedades: `all` anima también las que no esperabas, y algunas obligan a rehacer el layout en cada fotograma.
- `display: none` se anima con `display … allow-discrete` (la salida) y `@starting-style` (la entrada); `height: auto`, con `interpolate-size`, `calc-size()` o `0fr` → `1fr`.
- `transitionend` llega una vez por propiedad, y no llega si la transición se interrumpe o el elemento se oculta.
- El movimiento, dentro de `@media (prefers-reduced-motion: no-preference)`; los fundidos, para todos.

## Para profundizar

- [MDN: Usar transiciones CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [MDN: @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)
- [Chrome for Developers: Animate to height: auto (interpolate-size)](https://developer.chrome.com/docs/css-ui/animate-to-height-auto)
- [Chrome for Developers: Four new CSS features for smooth entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations)
- [Especificación: CSS Transitions Level 2](https://www.w3.org/TR/css-transitions-2/)
