# Animaciones modernas

## Por qué importa

Durante años, tres tipos de animación muy comunes exigían JavaScript y librerías: los efectos ligados al scroll (una barra de lectura, tarjetas que aparecen al llegar a ellas), las transiciones entre dos estados de una página en las que los elementos viajan a su nuevo sitio, y la salida animada de una ventana modal. Hoy las tres son CSS, con como mucho una línea de JavaScript:

- **Animaciones ligadas al scroll** (*scroll-driven animations*): una animación de `@keyframes` normal cuyo reloj, en lugar del tiempo, es la posición del scroll. En Chrome desde la versión 115.
- **View Transitions**: el navegador fotografía la página antes y después de un cambio y anima entre las dos fotos. Para cambios dentro de la misma página, en Chrome desde la 111.
- **Entrar y salir de la capa superior**: los popovers y los diálogos que viste en el capítulo de HTML, animados al abrirse y al cerrarse con `@starting-style`, `display` y `overlay`. En Chrome desde la 117.

Todas son **mejora progresiva**: en un navegador que no las conozca, las reglas se ignoran y la página funciona igual, sin la animación. Comprueba el soporte del resto de navegadores en [caniuse.com](https://caniuse.com) antes de que una función dependa de ellas.

## Animaciones ligadas al scroll

Una animación tiene una **línea de tiempo** (*timeline*) que le dice en qué punto está. Por defecto es el tiempo del documento. `animation-timeline` la cambia por otra, y la primera opción es `scroll()`: el progreso del scroll de un contenedor, del 0 % (arriba del todo) al 100 % (abajo del todo).

[[exercise:01-barra-de-lectura.md]]

Cuatro detalles del ejemplo:

- `scroll()` usa el **contenedor de scroll más cercano** del elemento animado. Los argumentos eligen otro y el eje: `scroll(root)` es la página, `scroll(self)` el propio elemento; `block`, `inline`, `x` o `y`, la dirección.
- La duración no significa nada: con `auto`, la animación ocupa todo el recorrido.
- `linear` es casi siempre la curva correcta: el usuario ya decide la velocidad con el dedo o la rueda.
- Si animan `transform` u `opacity`, Chrome las ejecuta en el compositor, como las de la lección de rendimiento: siguen pegadas al scroll aunque JavaScript esté ocupado.

### Sin recorrido no hay progreso

La línea de tiempo existe solo si el contenedor **de verdad se desplaza** y el elemento animado lo **puede ver**. Las dos condiciones fallan en silencio: la animación no se aplica y el elemento se queda en su estilo base.

[[exercise:02-sin-scroll-no-hay-progreso.md]]

Cuando el elemento animado no está dentro del contenedor (una barra en la cabecera de un artículo con scroll propio), hace falta una línea de tiempo **con nombre**: el contenedor la declara con `scroll-timeline: --nombre eje` y el elemento la usa con `animation-timeline: --nombre`. El nombre solo es visible para el contenedor y sus descendientes; `timeline-scope: --nombre` en un antepasado común lo hace visible para todo lo que cuelga de él.

### El atajo borra la línea de tiempo

El atajo `animation` reinicia todas sus propiedades, y `animation-timeline` es una de ellas. Es el bicho de la lección de keyframes, con su caso más frecuente:

[[exercise:03-el-atajo-borra-la-linea-de-tiempo.md]]

## Al entrar en la vista: `view()` y `animation-range`

`animation-timeline: view()` es una línea de tiempo de **vista**: su progreso es la posición del propio elemento dentro del área visible de su contenedor de scroll. Va del 0 %, cuando asoma su primer píxel por un borde, al 100 %, cuando sale el último por el otro. Es la que se usa para que algo aparezca al llegar a él:

[[exercise:04-aparecer-al-entrar.md]]

`animation-range` dice qué tramo de ese recorrido ocupa la animación. Los tramos con nombre se miden con la caja del elemento y el área visible:

```text
           área visible del contenedor
         ┌───────────────────────────┐
   exit  │ ▲ saliendo por arriba     │   exit: de empezar a salir a haber salido
         │                           │
contain  │ dentro entero             │   contain: mientras está dentro entero
         │                           │
  entry  │ ▲ entrando por abajo      │   entry: del primer píxel dentro a entero dentro
         └───────────────────────────┘
  cover = de entry 0 % a exit 100 %: todo el paso por la ventana (el tramo por defecto)
```

[[exercise:05-los-tramos-de-animation-range.md]]

Cada tramo admite porcentajes, y el principio y el final pueden ser de tramos distintos: `animation-range: entry 25% cover 50%` empieza cuando ha entrado un cuarto del elemento y termina cuando está en el centro. Con `view-timeline: --nombre`, el elemento ofrece su línea de tiempo con nombre a otros, como en el ejemplo de los medidores.

Dos cuidados. Con «reducir movimiento», lo que aparece al hacer scroll solo debe fundirse, y los efectos de parallax (fondos que se desplazan a otra velocidad que el texto) desaparecen: son de los que más marean. Y nada importante debe depender de la animación: si el navegador no la conoce, o alguien imprime la página, el contenido tiene que verse.

## View Transitions

Muchos cambios de una interfaz son cambios de **layout**: una lista que pasa a cuadrícula, una tarjeta que se expande, un paso de un formulario que deja sitio al siguiente. Animarlos con transiciones obliga a animar propiedades de layout (lección de rendimiento) y, a menudo, es imposible (de `display: flex` a `display: grid` no hay valores intermedios). Las View Transitions resuelven el problema de otra forma:

1. El navegador hace una **foto** de la página en el estado actual.
2. Tu código cambia el DOM (una clase, un atributo `hidden`, un elemento nuevo): el cambio ocurre de golpe, pero no se pinta todavía.
3. El navegador hace otra foto del estado nuevo.
4. Encima de la página, anima de una foto a otra con CSS: por defecto, un fundido.

El paso 2 necesita JavaScript, y es un adelanto del capítulo 6: `document.startViewTransition(función)`, donde la función hace el cambio. Si a un elemento le das un `view-transition-name`, el navegador lo fotografía aparte y lo hace **viajar** desde su posición y su tamaño de antes hasta los de después:

[[exercise:06-view-transition-basica.md]]

`view-transition-class` (Chrome 125+) agrupa elementos con nombres distintos bajo una clase común, para darles estilo de una vez: `::view-transition-group(*.product)` selecciona los grupos de todos los elementos con esa clase.

### Los pseudoelementos de la transición

Mientras dura, la transición es un árbol de pseudoelementos colgado de `:root`: un `::view-transition-group(nombre)` por cada nombre (más el de la página entera, `root`), y dentro, la foto de antes (`::view-transition-old`) y la de después (`::view-transition-new`). Son pseudoelementos normales, con animaciones de `@keyframes` normales: se cambian con CSS.

[[exercise:07-pseudoelementos-de-la-transicion.md]]

Para el movimiento reducido hay dos recetas: dar los nombres solo dentro de `@media (prefers-reduced-motion: no-preference)`, como en los ejemplos (sin nombres, la página entera se funde en su sitio), o quitar la animación de los grupos con `::view-transition-group(*) { animation-duration: 0s; }`.

### Un nombre, un elemento

El nombre es lo que empareja la foto de antes con la de después. Si dos elementos visibles comparten nombre, el navegador no sabe cuál es cuál y **cancela la transición entera**: el cambio del DOM se aplica, sin animación, y la promesa `ready` del objeto que devuelve `startViewTransition()` se rechaza con un `InvalidStateError`.

[[exercise:08-nombres-repetidos.md-]]

Al pulsar «Invertir el orden» sin marcar la casilla, la consola muestra:

```text
❌ Transición cancelada → InvalidStateError: Transition was aborted because of invalid state. Snapshot capture failed
```

En la consola de DevTools, Chrome añade su propio aviso con el nombre repetido. Las soluciones: un nombre por elemento (escrito a mano, desde una custom property o, en Chrome 137+, con `view-transition-name: match-element`, que da a cada elemento uno automático) y `view-transition-class` para lo común.

El objeto de la transición tiene más promesas (`updateCallbackDone`, `finished`) para coordinarla con tu código: las verás con la Web Animations API en el capítulo de gráficos y animación. Y existe una versión para la navegación entre páginas distintas de un mismo sitio, sin JavaScript (`@view-transition { navigation: auto; }`), que funciona con un servidor de verdad.

## Entrar y salir de la capa superior

Un popover cerrado y un diálogo cerrado tienen `display: none`, y al abrirse entran en la **capa superior**, por encima de toda la página. Para animarlos hacen falta las piezas de la lección de transiciones y una más:

- `@starting-style` con el estilo de partida, para la entrada.
- `display` en la transición con `allow-discrete`, para que siga visible durante la salida.
- **`overlay`** en la transición con `allow-discrete`. Es una propiedad que solo controla el navegador (no puedes darle valor) y que dice si el elemento está en la capa superior. En la transición, lo mantiene ahí hasta el final de la salida; sin ella, el elemento sale de la capa superior al primer fotograma y puede quedar tapado mientras se funde.

[[exercise:09-popover-que-entra-y-sale.md]]

En un diálogo modal, el fondo `::backdrop` es otro elemento de la capa superior, con su propia transición (y su propio `@starting-style`):

[[exercise:10-dialog-con-fondo.md]]

Los dos ejemplos funcionan sin JavaScript: `popovertarget` y los *invoker commands* (`commandfor` y `command="show-modal"`) de la lección de elementos interactivos. Y los dos siguen la convención del módulo: el fundido para todos y el desplazamiento o el crecimiento solo con `no-preference`.

## Cómo verlo en DevTools

- **View Transitions a cámara lenta.** En el panel **Animations**, baja la velocidad al 10 % y lanza la transición: aparecen sus animaciones, y en **Elements**, mientras dura, el árbol `::view-transition` colgado de `<html>`, que puedes inspeccionar como cualquier elemento.
- **Scroll y líneas de tiempo.** Si una barra no se mueve, selecciónala y mira en **Computed** el valor final de `animation-timeline`: si es `auto`, un atajo escrito después la ha reiniciado. Después, selecciona el contenedor: en **Elements** lleva la etiqueta `scroll` cuando de verdad es un contenedor que se desplaza.
- **Capa superior.** En **Elements**, junto a `<html>`, un nodo `#top-layer` lista los popovers y diálogos abiertos, en el orden en que se apilan.

## Bestiario

- **La barra de lectura no se mueve.** Síntoma: una animación con `animation-timeline` se queda en su estilo base. Causa: el contenedor no se desplaza (no tiene altura, o su contenido cabe) o el elemento no ve la línea de tiempo con nombre (no es descendiente del contenedor). Solución: altura y `overflow` en el contenedor; `timeline-scope` en un antepasado común. → [ver ejemplo](02-sin-scroll-no-hay-progreso.md)
- **La barra aparece llena y no sigue el scroll.** Síntoma: con `animation-timeline: scroll()`, la animación termina al instante. Causa: el atajo `animation`, escrito después, reinicia `animation-timeline` a `auto`. Solución: primero el atajo, después `animation-timeline` y `animation-range`. → [ver ejemplo](03-el-atajo-borra-la-linea-de-tiempo.md)
- **La View Transition no anima nada.** Síntoma: el cambio ocurre de golpe y `ready` se rechaza con `InvalidStateError`. Causa: dos elementos visibles con el mismo `view-transition-name`. Solución: un nombre por elemento (o `match-element`) y `view-transition-class` para el estilo común. → [ver ejemplo](08-nombres-repetidos.md)
- **El popover se esconde detrás de otro elemento al cerrarse.** Síntoma: durante la salida, un elemento con `z-index` lo tapa. Causa: sin `overlay` en la transición, el popover deja la capa superior al empezar la salida. Solución: `overlay … allow-discrete` junto a `display … allow-discrete`. → [ver ejemplo](09-popover-que-entra-y-sale.md)

## Resumen

- `animation-timeline: scroll()` cambia el reloj de una animación por el progreso del scroll; `view()`, por la posición del elemento en el área visible.
- Una línea de tiempo de scroll necesita un contenedor que se desplace y a su alcance; con nombre (`scroll-timeline`, `view-timeline`) y `timeline-scope`, la usan elementos de fuera.
- `animation-timeline` va siempre después del atajo `animation`; `animation-range` elige el tramo (`cover`, `contain`, `entry`, `exit`, con porcentajes).
- Una View Transition fotografía la página antes y después de un cambio del DOM (`document.startViewTransition`) y anima las fotos; con `view-transition-name`, cada elemento viaja a su nuevo sitio.
- Los pseudoelementos `::view-transition-group/old/new` se animan con CSS; los nombres deben ser únicos, y lo común va en `view-transition-class`.
- Popovers y diálogos se animan al entrar con `@starting-style` y al salir con `display` y `overlay` en `allow-discrete`.
- Con «reducir movimiento»: fundidos al aparecer, sin parallax y sin viajes.

## Para profundizar

- [Chrome for Developers: Animate elements on scroll with Scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
- [Bramus: Scroll-driven Animations (demos y herramientas)](https://scroll-driven-animations.style/)
- [Chrome for Developers: Smooth transitions with the View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions)
- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [Chrome for Developers: Four new CSS features for smooth entry and exit animations](https://developer.chrome.com/blog/entry-exit-animations)
