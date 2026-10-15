# Animaciones con @keyframes

## Por qué importa

Una transición necesita un cambio de estado y solo conoce dos puntos: el de antes y el de después. Muchas animaciones no encajan ahí: un aviso que entra al cargar la página, una sacudida de cinco movimientos cuando un código no es válido, un corazón que late una vez, un indicador de carga que gira mientras dura la espera, un aviso que se va solo a los 4 segundos. Para eso están las **animaciones**: un recorrido con nombre, descrito fotograma a fotograma con `@keyframes`, que se aplica a un elemento con `animation` y se reproduce solo.

Esta lección explica las ocho propiedades de `animation` y sus sorpresas: el elemento que vuelve a su sitio al terminar, el atajo que confunde la duración con el retardo, el `transform` que borra el giro de la nota y la custom property que salta a mitad de camino. También presenta una técnica que se usa en todo el módulo: **congelar** una animación en un instante exacto.

## `@keyframes` y `animation`

`@keyframes` define un recorrido y le da un nombre; `animation` lo aplica a un elemento, con su duración y el resto de opciones:

```css
@keyframes drop-in {
  from { opacity: 0; translate: 0 -16px; }   /* 0 % del tiempo */
  to   { opacity: 1; translate: 0 0; }       /* 100 % del tiempo */
}

.banner {
  animation: drop-in 600ms ease-out;         /* nombre, duración, curva */
}
```

La animación empieza en cuanto la regla se aplica al elemento: al cargar la página si está en la regla base, o al cumplirse el selector (`:hover`, una clase, una casilla marcada). Si el selector deja de cumplirse, la animación desaparece; si vuelve a cumplirse, empieza de cero. Es la forma de «repetirla» sin JavaScript que usan los ejemplos con la casilla «Reproducir».

[[exercise:01-primera-animacion.md]]

El ejemplo muestra también cómo se aplica aquí la convención del movimiento reducido: dos `@keyframes`, uno con desplazamiento y otro que solo funde, y la media query cambia **solo el nombre** (`animation-name`).

| Propiedad | Qué dice | Por defecto |
|---|---|---|
| `animation-name` | qué `@keyframes` usar | `none` |
| `animation-duration` | cuánto dura una vuelta | `0s` |
| `animation-timing-function` | la curva (lección anterior) | `ease` |
| `animation-delay` | cuánto espera; negativo = empieza ya avanzada | `0s` |
| `animation-iteration-count` | cuántas vueltas: un número o `infinite` | `1` |
| `animation-direction` | hacia dónde va cada vuelta | `normal` |
| `animation-fill-mode` | qué se ve antes de empezar y después de terminar | `none` |
| `animation-play-state` | `running` o `paused` | `running` |
| `animation-composition` | si sustituye al valor de la regla o se suma | `replace` |

## Fotogramas con porcentajes

`from` y `to` son atajos de `0%` y `100%`. Entre medias puedes poner todos los fotogramas que quieras, y los que comparten valores se agrupan con comas (`20%, 60% { … }`). Cada fotograma solo lista las propiedades que cambian; una propiedad se interpola entre los fotogramas en los que aparece.

[[exercise:02-porcentajes-y-fotogramas.md]]

Tres reglas que conviene saber:

- **Si falta `from` o `to`**, el navegador usa el valor que el elemento tiene sin animación. `@keyframes beat { 50% { scale: 1.35; } }` va de la escala normal a 1.35 y vuelve, sin repetir el estado de reposo.
- **La curva se aplica a cada tramo**, no a la animación entera: con `ease-in-out` y cinco fotogramas, cada tramo arranca y frena. Un fotograma puede llevar su propia `animation-timing-function`, que vale para el tramo que empieza en él.
- **`!important` dentro de un fotograma se ignora.**

La sacudida enseña además una regla de accesibilidad de todo el módulo: el movimiento nunca es la única pista. Con «reducir movimiento», o para quien no ve la pantalla, el error se entiende por el texto, el borde y `aria-invalid`.

## Congelar un fotograma

Con `animation-play-state: paused`, el reloj de la animación no avanza. Con un `animation-delay` **negativo**, la animación empieza «ya avanzada»: con `-0.25s`, el primer fotograma que se pinta es el del instante 0,25 s. Juntas, dejan el elemento quieto exactamente en el instante que quieras:

```css
.frame {
  animation: drive 1s linear both paused;
  animation-delay: calc(var(--t) * -1s);     /* --t: 0.25 → instante 0,25 s */
}
```

[[exercise:03-congelar-un-fotograma.md]]

Con varias copias congeladas en instantes distintos se hacen las «tiras de fotogramas» de este módulo: permiten comprobar una curva o un fallo sin seguir el movimiento con la vista, y siguen ahí para quien tiene el movimiento reducido. Fíjate en la última fila: con un retardo igual a toda la duración, la animación ya ha terminado, y sin `both` el camión vuelve a la salida. Es el siguiente bicho.

## `animation-fill-mode`: antes y después

Por defecto, una animación **solo se aplica mientras corre**. Durante el retardo y después de terminar, el elemento tiene su estilo sin animar. Eso produce dos fallos clásicos:

- Una animación de **salida** (fundir hasta `opacity: 0`) termina y el elemento **reaparece** de golpe.
- Una animación de **entrada con retardo** (desde `opacity: 0`) enseña el elemento durante la espera, lo hace desaparecer al empezar y luego lo funde.

[[exercise:04-fill-mode.md]]

| `animation-fill-mode` | Durante el retardo | Al terminar |
|---|---|---|
| `none` | estilo sin animar | estilo sin animar |
| `forwards` | estilo sin animar | el último fotograma |
| `backwards` | el primer fotograma | estilo sin animar |
| `both` | el primer fotograma | el último fotograma |

`both` es casi siempre lo que quieres. Con `forwards`, recuerda que el último fotograma **sigue ganando en la cascada** mientras la animación exista: si después cambias esa propiedad en un `:hover`, no pasará nada.

## El atajo `animation`

El atajo reconoce cada valor por su tipo (un nombre, una curva, un número de vueltas, `alternate`, `both`…), así que el orden casi no importa, con una excepción: hay dos valores del mismo tipo. **El primer tiempo es la duración y el segundo, el retardo.** `animation: toast-in 2s 300ms` dura 2 s y espera 0,3 s.

[[exercise:05-el-atajo-y-sus-tiempos.md]]

Dos trampas más del atajo, comentadas en el ejemplo: reinicia todas las propiedades que no escribes (un longhand escrito **antes** del atajo se pierde; en la lección de animaciones modernas le pasará a `animation-timeline`), y un nombre de `@keyframes` que coincide con una palabra clave (`ease`, `linear`, `infinite`, `none`…) se lee como esa palabra.

## Dirección y repeticiones

`animation-iteration-count` dice cuántas vueltas da la animación: un número (también decimal: `1.5` es vuelta y media) o `infinite`. `animation-direction` dice hacia dónde va cada vuelta: `normal`, `reverse`, `alternate` (ida y vuelta: las pares, al revés) o `alternate-reverse`.

[[exercise:06-direccion-y-repeticiones.md]]

Con `alternate`, la curva también se invierte en las vueltas de regreso: un `ease-in` de ida es un `ease-out` a la vuelta, y el movimiento se ve simétrico.

## Pausar: `animation-play-state`

`paused` congela la animación donde está, y `running` la reanuda desde ese punto (no desde el principio). Es la forma de dar control a quien mira: la norma de accesibilidad WCAG (criterio 2.2.2) pide que todo lo que se mueve solo durante más de 5 segundos se pueda pausar, detener u ocultar. Pausar al pasar el ratón ayuda, pero no basta: hace falta un control que funcione con el teclado y en una pantalla táctil.

[[exercise:07-pausar-con-play-state.md]]

Es la única animación infinita de esta lección, y solo mueve `translate`. Las animaciones infinitas cuestan batería mientras se ven (la lección de rendimiento lo explica) y cansan: resérvalas para lo que de verdad no acaba, como un indicador de carga, y para su duración.

## Varias animaciones a la vez

`animation` acepta una lista separada por comas, y cada longhand también: los valores se emparejan por posición, y una lista más corta se repite. Así, un aviso puede entrar con una animación y irse solo con otra que espera 4 s:

[[exercise:08-varias-animaciones.md]]

Cuando dos animaciones tocan la misma propiedad a la vez, **gana la que va después en la lista**. Y frente a la cascada, recuerda la tabla de la lección de cascada y capas: los valores de una animación ganan a todas las declaraciones normales (también a un `style` en línea), pero pierden contra cualquier `!important`, y una transición en curso gana a todo.

## Un `transform` en los keyframes lo sustituye entero

En la lección de transformaciones viste que un `:hover` con `transform: scale()` borraba el `rotate()` de la regla, porque `transform` es una sola propiedad con una lista. En una animación pasa lo mismo, y es más difícil de ver porque dura medio segundo: la nota se ve recta mientras crece y se tuerce de golpe al terminar.

[[exercise:09-transform-en-keyframes-pisa-todo.md]]

Las dos soluciones:

- **Las propiedades sueltas** `translate`, `rotate` y `scale`: la regla gira con `rotate` y la animación toca solo `scale`. Es la que conviene por defecto.
- **`animation-composition: add`** (Chrome 112 y todos los navegadores actuales): la animación **se suma** al valor de la regla en lugar de sustituirlo; en una lista de `transform`, sumar es añadir las funciones detrás. Con `accumulate`, en cambio, se suman los argumentos de las funciones iguales.

## Animar custom properties

Para el navegador, una custom property sin registrar es solo texto: entre `0%` y `75%` no sabe qué hay. En una animación, se anima de forma **discreta**: el primer valor hasta la mitad del tiempo y el segundo desde la mitad. Registrada con `@property` (lo viste en la lección de custom properties) y con un tipo en `syntax`, se interpola como cualquier porcentaje.

[[exercise:10-animar-custom-properties.md]]

Vale la pena porque una variable puede alimentar propiedades que no se pueden animar directamente por partes: la parada de un `conic-gradient`, el ángulo de un degradado, un color dentro de una sombra. Registra cada variable una sola vez, al principio de la hoja, con un `initial-value` válido: es el valor que tendrá cuando nadie le dé otro, y el punto de partida de la animación si falta `from`.

## Cómo verlo en DevTools

- **Panel Animations** (<kbd>⋮</kbd> → **More tools** → **Animations**): cada animación aparece como una barra con sus fotogramas marcados. Puedes pausarla, arrastrar la línea de tiempo para verla en cualquier instante (es la técnica de congelar, pero a mano), cambiar la velocidad y alargar o mover la barra para probar otra duración u otro retardo.
- **Styles**: el nombre de la animación en la declaración es un enlace que lleva a su regla `@keyframes`, y cada fotograma se puede editar en directo.
- **Computed**: con la animación congelada en el panel, muestra el valor animado de cada propiedad en ese instante.

## Bestiario

- **El aviso reaparece al terminar, o se ve antes de empezar.** Síntoma: una animación de salida acaba y el elemento vuelve; una de entrada con retardo enseña el elemento durante la espera. Causa: con `fill-mode: none`, la animación solo se aplica mientras corre. Solución: `both` (o `forwards` y `backwards`). → [ver ejemplo](04-fill-mode.md)
- **La animación tarda lo que debía esperar.** Síntoma: el aviso aparece despacio y enseguida, en vez de esperar y aparecer rápido. Causa: en el atajo, el primer tiempo es la duración y el segundo el retardo. Solución: duración primero; si dudas, longhands. → [ver ejemplo](05-el-atajo-y-sus-tiempos.md)
- **La nota se endereza mientras se anima.** Síntoma: un elemento girado con `transform` pierde el giro durante una animación de `transform` y lo recupera de golpe al final. Causa: el `transform` de los keyframes sustituye la lista entera. Solución: `rotate`, `scale` y `translate` sueltas, o `animation-composition: add`. → [ver ejemplo](09-transform-en-keyframes-pisa-todo.md)
- **La variable salta a mitad de la animación.** Síntoma: un anillo de progreso con `conic-gradient(… var(--plain) …)` se queda quieto y salta al final a mitad de tiempo. Causa: una custom property sin registrar se anima de forma discreta. Solución: registrarla con `@property` y un `syntax`. → [ver ejemplo](10-animar-custom-properties.md)

## Resumen

- `@keyframes` describe un recorrido con nombre; `animation` lo aplica, y empieza en cuanto la regla se aplica (también al cargar la página).
- Sin `from` o `to`, se usa el valor del propio elemento; la curva se aplica a cada tramo entre fotogramas.
- `paused` + un retardo negativo congela una animación en un instante exacto.
- Sin `fill-mode`, la animación no existe antes de empezar ni después de terminar: casi siempre quieres `both`.
- En el atajo, el primer tiempo es la duración y el segundo el retardo, y lo que no escribes se reinicia.
- `iteration-count`, `direction` y `play-state` controlan vueltas, sentido y pausa; lo que se mueve más de 5 s necesita un control para pararlo.
- Varias animaciones se separan con comas y la última de la lista gana; un `transform` en los keyframes sustituye la lista entera (propiedades sueltas o `animation-composition: add`).
- Una custom property solo se interpola si está registrada con `@property`.

## Para profundizar

- [MDN: Usar animaciones CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [MDN: animation-fill-mode](https://developer.mozilla.org/es/docs/Web/CSS/animation-fill-mode)
- [MDN: animation-composition](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-composition)
- [web.dev: Animations (Learn CSS)](https://web.dev/learn/css/animations)
- [W3C: Entender el criterio 2.2.2, Pausar, detener, ocultar](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
