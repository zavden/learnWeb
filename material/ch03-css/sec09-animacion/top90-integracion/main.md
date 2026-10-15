# Integración: transiciones y animaciones

## Qué vas a practicar

Las cinco lecciones de este módulo dan movimiento a la interfaz desde cinco ángulos: **transiciones** entre dos estados (también desde `display: none` y hasta `height: auto`), **curvas** que deciden cómo se reparte el cambio en el tiempo, **animaciones con `@keyframes`** que se reproducen solas, el **rendimiento** (qué cuesta cada propiedad y por qué `transform` y `opacity` van aparte) y las **animaciones modernas**: ligadas al scroll, View Transitions y la entrada y salida de la capa superior. En una interfaz real se mezclan: un aviso entra con `@starting-style`, deja un hueco que se cierra con `interpolate-size` y respeta el movimiento reducido; un menú es un popover con opciones escalonadas.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código, usa cada ejemplo y hazte cuatro preguntas: **¿qué propiedad se anima, y en qué fase de la cadena de pintado cae?**, **¿dónde está declarada la transición (estado base o estado de llegada) y qué pasa al volver?**, **¿cómo entra lo que antes no tenía caja?** y **¿qué ve quien pide reducir el movimiento?** Al final hay tres ejercicios con su solución.

> Todos los ejemplos usan solo lo visto hasta ahora: el capítulo de HTML y los nueve módulos de CSS. Las View Transitions necesitan una línea de JavaScript (`document.startViewTransition`), marcada como adelanto del capítulo 6. Para ver la versión con movimiento reducido, abre un ejemplo con ↗ y usa DevTools → **Rendering** → **Emulate CSS media feature prefers-reduced-motion**.

## Una pila de avisos

Tres avisos que entran y salen con casillas. Cada uno pasa de `display: none` a `block` con `@starting-style` (entrada) y `display … allow-discrete` (salida), y vive en un hueco cuya altura va de `0` a `auto` gracias a `interpolate-size`: cuando un aviso se va, los de al lado se recolocan con suavidad en lugar de saltar. Con «reducir movimiento», los avisos se funden y los huecos se abren y cierran sin animación.

[[exercise:01-pila-de-avisos.md]]

## Un acordeón de cuidados

Un grupo de `<details>` con el mismo `name`: solo uno abierto. La altura del pseudoelemento `::details-content` se anima de `0` a `auto`, `content-visibility` va en la transición con `allow-discrete` para que el texto no desaparezca antes de cerrar, la flecha gira con `rotate` y la pregunta abierta cambia de color (eso, también con movimiento reducido: es un fundido).

[[exercise:02-acordeon-de-cuidados.md]]

## Añadir a la cesta

La micro-interacción más repetida de una tienda, sin JavaScript. El botón es una casilla con su etiqueta; sus dos textos comparten celda de grid y se cruzan con `opacity` y `visibility`. El número de la cesta sube como un cuentakilómetros (dos cifras en la misma celda, con `translate`) y el globo da un salto con unos `@keyframes` de un solo fotograma, al 40 %, y una curva que se pasa. Con movimiento reducido, el salto se cambia por un destello de color: la señal sigue ahí.

[[exercise:03-anadir-a-la-cesta.md]]

## Del esqueleto al contenido

Mientras «carga», un brillo barre los esqueletos con un `::after` que se desplaza con `translate` (solo composite, y solo 6 pasadas). Al marcar «Datos recibidos», los esqueletos salen fundiéndose y las publicaciones entran una a una, con `@starting-style` y un `transition-delay` calculado con `--i`. Esqueletos y publicaciones ocupan la misma celda de grid: el cambio no mueve nada de alrededor.

[[exercise:04-del-esqueleto-al-contenido.md]]

## Una receta con progreso

Tres animaciones ligadas al scroll en la misma página, sin JavaScript: la barra de lectura (`scroll()` y `scale`), los pasos que aparecen al entrar (`view()` con el tramo `entry`) y un enlace «Volver arriba» que aparece pasados los 120px de scroll, con un `animation-range` en píxeles sobre la misma línea de tiempo de scroll. Fíjate en el destino del enlace: es el título, **dentro** del artículo, para que sea el artículo el que vuelva arriba.

[[exercise:05-lectura-con-progreso.md]]

## Información con View Transition

Tres botones (con `aria-pressed`) que cambian el panel visible de una ficha de producto. El cambio ocurre dentro de `startViewTransition`: el panel tiene un nombre, así que su grupo cambia de altura con suavidad mientras el texto viejo se va y el nuevo sube con keyframes propios; los botones se funden con la transición por defecto de la raíz. Los paneles ocultos con `hidden` no tienen caja, y por eso pueden compartir el nombre sin que se repita.

[[exercise:06-informacion-con-view-transition.md]]

## Un menú de cuenta escalonado

El menú es un popover, colocado bajo su botón. Entra con `@starting-style` y sale con `display` y `overlay` en `allow-discrete`, y cada opción espera `--i × 50 ms`. El retardo solo está en el estado abierto: al cerrar, las opciones se van a la vez que el menú. Un detalle: las opciones también aparecen «de la nada» cuando el popover se abre, así que necesitan su propio `@starting-style`.

[[exercise:07-menu-de-cuenta-escalonado.md]]

## Tareas con anillo de progreso

Cada casilla marcada pone a 1 una variable de la sección con `:has()`, y el anillo calcula `--progress` como la suma por 25 %. Como `--progress` está registrada con `@property`, su transición la interpola y el `conic-gradient` se llena poco a poco; sin registrar, saltaría de un cuarto a otro. El tachado de cada tarea es una línea que crece desde la izquierda con `scale`.

[[exercise:08-tareas-con-anillo.md]]

## Ejercicios

Cada ejercicio tiene el HTML y el script bloqueados: solo se trabaja en el CSS, en los puntos marcados con `TODO`. El script lee los estilos calculados, las reglas de la hoja de estilos (para saber qué está dentro de una media query o de un `@starting-style`) y, en el del anillo, las animaciones del elemento con `getAnimations()`; marca con ✅ lo que ya está bien y lo repite en la consola. Las comprobaciones de movimiento suponen que tu sistema no pide reducirlo. Las pistas orientan sin dar la respuesta; la solución está enlazada desde el propio ejercicio.

**Arregla el panel de filtros.** Un panel lateral que se cierra de golpe, se mueve con `left`, anima `all` y se desliza aunque el sistema pida reducir el movimiento.

[[exercise:09-ej-arregla-el-panel-de-filtros.md]]

**El diálogo que se esfuma.** Un diálogo de confirmación que aparece y desaparece de golpe: le faltan el punto de partida, la salida discreta, la transición del fondo y la media query del crecimiento.

[[exercise:10-ej-el-dialogo-que-se-esfuma.md]]

**El anillo de la descarga.** Un anillo que espera lo que debía durar, salta a la mitad y se vacía al terminar. El script congela una copia al 40 % para comprobar que se interpola.

[[exercise:11-ej-el-anillo-de-la-descarga.md]]

## Lo que conviene llevarse

- La transición va en la regla base; el estado de llegada solo la cambia cuando quieres otra curva o un retardo distinto al volver (escalonar al abrir, irse a la vez al cerrar).
- Lo que pasa de `display: none` a visible necesita `@starting-style` para entrar y `display … allow-discrete` para salir; si está en la capa superior, también `overlay`.
- `height: auto` se anima con `interpolate-size` (o `calc-size()`); un hueco que se cierra con suavidad evita que lo de alrededor salte.
- Anima `transform` y `opacity`; lo demás, solo si es pequeño o breve. Los brillos, las barras y los menús se hacen con `translate` y `scale`.
- Una animación de un solo fotograma (`40% { … }`) vuelve sola al estado de reposo; una custom property solo se interpola si está registrada.
- Las animaciones ligadas al scroll y las View Transitions sustituyen a mucho JavaScript: el atajo `animation` antes de `animation-timeline`, y nombres únicos en las transiciones.
- Con «reducir movimiento», los desplazamientos se convierten en fundidos y las señales se mantienen (un destello en lugar de un salto).
