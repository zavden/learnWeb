# Tu primer fragment shader

## Por qué importa

En la lección anterior viste qué es un fragment shader: una función de la posición de un píxel a su color, que la GPU ejecuta para todos los píxeles a la vez. En esta la escribes tú, y con ella aprendes las piezas de GLSL que usarás en el resto del capítulo: coordenadas, colores, vectores, las funciones de serie, los uniforms que llegan de fuera, y una forma de dibujar que no existe en el canvas 2D: las **funciones de distancia**, con las que una forma es una fórmula.

Por el camino aparecen las trampas que todo el mundo pisa al empezar, y que no se parecen a las de JavaScript: el eje y que sube, los círculos que salen ovalados, el `1` que no es `1.0`, los bordes en escalera y las cuentas que no dan error sino un píxel negro.

Todos los ejemplos son shaders de LearnWeb (`renderer: shader`). Las tarjetas muestran su primer fotograma, quieto; para verlos moverse o tocar sus controles, ábrelos en el editor y pulsa ▶ en el panel Shader (lección «CPU y GPU»).

## Coordenadas: de píxeles a uv

Cada ejecución de `main()` sabe dónde está su píxel por `gl_FragCoord.xy`: la posición del **centro** del píxel, en píxeles, con el origen en la esquina de **abajo a la izquierda**. En un lienzo de 600 × 400, el primer píxel es `(0.5, 0.5)` y el último `(599.5, 399.5)`. Dividida entre `u_resolution` (el tamaño del lienzo), la posición se convierte en **uv**, que va de 0.0 a 1.0 en los dos ejes sea cual sea el tamaño:

```glsl
vec2 uv = gl_FragCoord.xy / u_resolution; // (0, 0) abajo a la izquierda, (1, 1) arriba a la derecha
```

El ejemplo pinta uv como color (rojo según x, verde según y), traza una cuadrícula cada 0.1 y marca el origen con un cuarto de círculo blanco:

[[exercise:01-coordenadas-y-uv.md]]

[[exercise:01-coordenadas-y-uv.md-]]

La cuadrícula usa `fract`, que se queda con la parte decimal de un número: `fract(uv * 10.0)` va de 0 a 1 diez veces en cada eje. Repetir algo es eso, quedarse con la parte decimal, y lo usarás en todos los patrones de esta lección.

> **Desde Python:** con numpy harías `x, y = np.meshgrid(np.arange(600) + 0.5, np.arange(400) + 0.5)` y `uv = x / 600, y / 400`: dos arrays con la coordenada de cada píxel. Un shader recibe ese mismo dato, pero de un píxel cada vez. Y si lo dibujas con `plt.imshow`, recuerda que por defecto pone la fila 0 arriba; `origin='lower'` la pone abajo, como GLSL.

### 🐛 La y crece hacia arriba

En el canvas 2D, el SVG, el CSS y los `ImageData`, la y crece **hacia abajo**: la fila 0 está arriba. En WebGL crece **hacia arriba**, como en los ejes de matemáticas. Un dibujo pensado «a lo canvas» sale cabeza abajo sin ningún error:

[[exercise:02-el-eje-y-sube.md]]

La mitad izquierda usa `gl_FragCoord` tal cual: el cielo y el sol salen abajo. La derecha da la vuelta a la y antes de usarla, con `u_resolution.y - p.y` (o `1.0 - uv.y` en coordenadas uv). Lo mismo vale para `u_mouse` en LearnWeb, que también tiene la y hacia arriba. La lección «Texturas y framebuffers» vuelve sobre esto, porque las imágenes llegan con la fila 0 arriba y la GPU las lee con la fila 0 abajo.

[[exercise:02-el-eje-y-sube.md-]]

### 🐛 La proporción del lienzo

uv es cómodo, pero sus unidades no son cuadradas: en un lienzo de 800 × 400, una unidad de x mide 800 píxeles y una de y, 400. Cualquier distancia medida en uv sale estirada, y un círculo se vuelve una elipse:

[[exercise:03-la-proporcion-de-aspecto.md]]

La solución es medir los dos ejes con la misma vara: restar el centro y dividir entre la **altura**. Es la primera línea de casi todos los shaders que dibujan formas:

```glsl
vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y; // origen en el centro, unidad = alto
```

[[exercise:03-la-proporcion-de-aspecto.md-]]

## Color: canales de 0.0 a 1.0

Un color de GLSL es un `vec3` (rojo, verde, azul) o un `vec4` (con la opacidad), con cada canal de **0.0 a 1.0**. Es el mismo color que el `#e11d48` de CSS, en otra escala: cada pareja hexadecimal es un byte (lección «Color» del capítulo de CSS y «Bits y bytes» de este capítulo), y para pasarlo a GLSL se divide entre 255. Al escribir el píxel, la GPU hace el viaje de vuelta: multiplica por 255, redondea y recorta lo que se salga de 0-255.

| CSS | bytes | GLSL |
|---|---|---|
| `#e11d48` | `225, 29, 72` | `vec3(225.0, 29.0, 72.0) / 255.0` ≈ `vec3(0.882, 0.114, 0.282)` |
| `#ffffff` | `255, 255, 255` | `vec3(1.0)` |
| `rgb(0 0 0 / 50%)` | `0, 0, 0, 128` | `vec4(0.0, 0.0, 0.0, 0.5)` |

[[exercise:04-colores-y-swizzle.md]]

Las cinco franjas son el color escrito a mano, el mismo llegado como uniform `brand` (las dos primeras son idénticas: por eso parecen una sola franja ancha), sus canales reordenados (`brand.bgr`), aclarado y oscurecido con `mix`. En el editor, el control `brand` del panel Shader es un selector de color: elige otro y las cuatro franjas de la derecha cambian con él.

[[exercise:04-colores-y-swizzle.md-]]

## GLSL en diez minutos

GLSL se parece a C: llaves, punto y coma, `if`, `for`, funciones con tipos. Lo nuevo son los tipos vectoriales, que vienen de serie:

| Tipo | Qué guarda | Ejemplo |
|---|---|---|
| `float` | un decimal de 32 bits | `1.0`, `0.5`, `3.14159` |
| `int` | un entero | `3`, `-1` |
| `bool` | `true` o `false` | `uv.x > 0.5` |
| `vec2`, `vec3`, `vec4` | 2, 3 o 4 `float` | `vec2(0.5)`, `vec3(1.0, 0.5, 0.0)` |
| `mat2`, `mat3`, `mat4` | matrices de 2 × 2, 3 × 3, 4 × 4 | lección «WebGL desde JavaScript» |
| `sampler2D` | una textura | lección «Texturas y framebuffers» |

Las operaciones entre vectores van **componente a componente**: `vec3(1.0, 2.0, 3.0) * 2.0` es `vec3(2.0, 4.0, 6.0)`, y `a * b` multiplica cada componente de `a` por la de `b`. Los componentes se leen con tres juegos de nombres equivalentes (`.xyzw`, `.rgba`, `.stpq`) que se pueden repetir y reordenar: es el **swizzling**. `color.rgb` son los tres primeros, `p.yx` cambia los ejes de sitio, `color.bgr` da la vuelta al color y `uv.xxx` repite x tres veces.

### 🐛 `1` no es `1.0`

En GLSL ES 1.00 los tipos no se convierten solos: `1` es un `int` y `1.0` un `float`, y no se pueden mezclar ni al asignar ni al operar. Para JavaScript todo es `number`, y Python convierte el entero en decimal al sumar; GLSL se niega a compilar:

[[exercise:05-enteros-y-decimales.md-]]

```text
Shader preview unavailable
Fragment shader compile error
ERROR: 0:6: '=' : cannot convert from 'const int' to 'mediump float'
```

Así lo muestran las tarjetas y el diálogo de la teoría; en el editor verás el mismo mensaje sin el prefijo `ERROR: 0:6:` y marcado en la línea 6 del bloque (`shader.frag:6`). Los **constructores** sí convierten: `float(3)`, `vec2(1, 2)` e `int(2.7)` (que trunca a 2) son válidos. La regla práctica: escribe todos los decimales con punto (`2.0`, no `2`). WebGL 2 (GLSL ES 3.00) es igual de estricto.

### Las funciones de serie

GLSL trae las funciones que necesitas para dibujar, todas sobre `float` y sobre vectores (componente a componente):

| Función | Qué devuelve | Para qué |
|---|---|---|
| `mix(a, b, t)` | `a + (b - a) * t` | degradados, mezclar colores |
| `step(edge, x)` | `0.0` si `x < edge`, si no `1.0` | cortes duros |
| `smoothstep(e0, e1, x)` | de 0 a 1 con suavidad entre `e0` y `e1` | bordes suaves |
| `clamp(x, lo, hi)` | `x` recortado al intervalo | proteger valores |
| `fract(x)`, `floor(x)` | parte decimal, parte entera | repetir, numerar casillas |
| `mod(x, y)` | el resto, positivo si `y > 0` | alternar |
| `length(v)`, `distance(a, b)` | longitud, distancia | círculos |
| `dot(a, b)` | producto escalar | luminancia, luz |
| `sin`, `cos`, `atan(y, x)` | trigonometría (radianes) | ondas, ángulos |
| `abs`, `min`, `max`, `pow`, `sqrt` | lo de siempre | |

> **Desde Python:** `mod` de GLSL es el `%` de Python: `mod(-1.0, 4.0)` es `3.0`, como `-1 % 4`. El `%` de JavaScript conserva el signo y da `-1`. GLSL ES 1.00 tampoco tiene `%` para enteros: se usa `mod` con `float`.

Dos límites de GLSL ES 1.00 que te encontrarás: los bucles `for` necesitan un número de vueltas que el compilador conozca (`for (int i = 0; i < 8; i++)`, no `i < n` con un uniform), y no hay recursividad. Las funciones se declaran antes de usarlas, como en C.

## Uniforms: el tiempo, el ratón y los controles

Un **uniform** es un valor que llega de fuera y es el mismo para todos los píxeles de un dibujo: por eso se llama así. En LearnWeb los pone la aplicación (`u_time`, `u_mouse`…) o salen de `shader_uniforms`; en la lección siguiente los pondrás tú desde JavaScript. Con `u_time`, un shader se anima solo: el cálculo es el mismo, y el tiempo, otro en cada fotograma.

[[exercise:06-tiempo-y-raton.md]]

[[exercise:06-tiempo-y-raton.md-]]

En la tarjeta, el anillo está quieto en el centro: `u_time` vale 0 y el ratón `(0, 0)`, y el shader trata ese `(0, 0)` como «sin ratón». En el editor, con ▶, las franjas avanzan, el anillo late y sigue al puntero, y se vuelve turquesa mientras mantienes pulsado el botón. La cabecera `shader_uniforms: "speed:float=1[0,4,0.1]"` crea el uniform `speed` (valor inicial 1, de 0 a 4, en pasos de 0.1) con un deslizador en el panel Shader. Los demás tipos tienen su control: `int` con intervalo, otro deslizador; `bool`, una casilla; `vec3` y `vec4`, un selector de color.

## Formas con funciones de distancia

En el canvas 2D, un círculo es una orden (`arc`). En un shader no hay órdenes de dibujo: cada píxel tiene que **decidir** si está dentro. La herramienta para decidirlo es una **función de distancia con signo** (SDF, *signed distance function*): devuelve la distancia del punto al borde de la forma, **negativa dentro**, cero en el borde y positiva fuera. La del círculo es la definición de círculo: `length(p) - radio`.

| Forma u operación | Función de distancia |
|---|---|
| círculo de radio `r` | `length(p) - r` |
| caja de semilados `b` | `d = abs(p) - b;` → `length(max(d, 0.0)) + min(max(d.x, d.y), 0.0)` |
| caja redondeada | la caja de `b - r`, menos `r` |
| unión de A y B | `min(a, b)` |
| intersección | `max(a, b)` |
| A menos B | `max(a, -b)` |

Lo bonito es que las formas se combinan con `min` y `max`, y que la distancia sirve para mucho más que para decidir dentro o fuera: bordes, sombras, contornos o brillos son funciones de `d`. Para pasar de distancia a color, `smoothstep` en el ancho de un píxel hace que los píxeles del borde queden a medias:

[[exercise:07-formas-con-sdf.md]]

[[exercise:07-formas-con-sdf.md-]]

En el editor, `corner` redondea la tercera forma y `combineMode` cambia la cuarta entre unión (0), intersección (1) y resta (2). Las SDF son la base del texto nítido a cualquier tamaño en muchos motores de juegos, de las interfaces que se dibujan en la GPU y de los renderizadores 3D por «raymarching».

### 🐛 `step` dibuja escaleras

Con `step`, cada píxel está dentro o fuera, sin término medio, y un borde curvo se convierte en una escalera de píxeles. A tamaño normal se ve como un borde áspero que «tiembla» cuando la forma se mueve. Con una lupa se ve claro:

[[exercise:08-step-contra-smoothstep.md]]

[[exercise:08-step-contra-smoothstep.md-]]

A la izquierda, cada cuadrado es ámbar o azul noche; a la derecha, los cuadrados del borde toman un color intermedio según cuánto de ellos cae dentro del círculo, y el borde parece liso al alejarse. Es lo mismo que hace el canvas 2D cuando dibuja un `arc` (el *antialiasing*), solo que aquí lo decides tú.

## Patrones

Con `fract`, `floor` y `mod` las coordenadas se repiten, y con `atan` y `length` se vuelven **polares**: un ángulo y una distancia al centro. Casi todos los fondos generados (franjas, tableros, anillos, ruedas de color) salen de combinar esas cuatro funciones:

[[exercise:09-patrones-y-polares.md]]

[[exercise:09-patrones-y-polares.md-]]

`floor((p + 0.5) * 8.0)` numera las casillas de un tablero de 8 × 8, y `mod(columna + fila, 2.0)` alterna entre 0 y 1. En la rueda, `atan(p.y, p.x)` da el ángulo (de -π a π) y se convierte en tono; la distancia al centro, en saturación. Con el tiempo en marcha, las franjas avanzan y la rueda gira.

## 🐛 Cuentas sin definir

En JavaScript, `Math.sqrt(-1)` es `NaN` y `1 / 0` es `Infinity`: resultados raros, pero definidos. En GLSL, varias funciones **no tienen resultado definido** para algunas entradas, y la especificación deja que cada GPU haga lo que quiera. No hay error, ni excepción, ni mensaje en ninguna consola.

| Cuenta | Indefinida cuando |
|---|---|
| `pow(x, y)` | `x < 0`, o `x == 0` con `y <= 0` |
| `sqrt(x)`, `log(x)` | `x < 0`; `x <= 0` para `log` |
| `atan(y, x)` | `x` e `y` valen 0 a la vez |
| `normalize(v)` | `v` es el vector cero |
| `x / 0.0` | casi siempre infinito; `0.0 / 0.0` es NaN |

[[exercise:10-cuentas-sin-definir.md]]

[[exercise:10-cuentas-sin-definir.md-]]

En la mitad izquierda de la franja de arriba, `pow` recibe valores negativos y el resultado depende de la GPU. Lo más común es **NaN** (*Not a Number*, el mismo valor especial de la lección «Float32 y precisión»), que contagia a todo lo que lo toca y acaba pintado de negro. En otra GPU puede salir otro color, o cambiar con una versión del driver: por eso se protegen las entradas (`max(x, 0.0)`, `abs`, `clamp`) en lugar de confiar en lo que se ve en tu máquina.

## Bestiario

- **El dibujo sale cabeza abajo.**
  Síntoma: lo que debía estar arriba (el cielo, un título, el sol) sale abajo, sin ningún error.
  Causa: en `gl_FragCoord` (y en `u_mouse` de LearnWeb) la y crece hacia arriba; en el canvas 2D, el SVG y el CSS, hacia abajo.
  Solución: da la vuelta a la y (`u_resolution.y - p.y`, `1.0 - uv.y`) o piensa el dibujo con el origen abajo.
  → [ver ejemplo](02-el-eje-y-sube.md)
- **Los círculos salen ovalados.**
  Síntoma: un círculo medido en uv sale como elipse, y se deforma al cambiar el tamaño del lienzo.
  Causa: en uv, una unidad de x es el ancho del lienzo y una de y, el alto.
  Solución: `p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y`: origen en el centro y la misma unidad en los dos ejes.
  → [ver ejemplo](03-la-proporcion-de-aspecto.md)
- **«cannot convert from 'const int' to 'mediump float'».**
  Síntoma: el shader no compila por una línea que en JavaScript sería normal: `float r = 1;`, `p * 2`, `x + 1`.
  Causa: GLSL ES 1.00 no convierte entre `int` y `float` por su cuenta.
  Solución: escribe los decimales con punto (`1.0`, `2.0`) o convierte con un constructor (`float(n)`).
  → [ver ejemplo](05-enteros-y-decimales.md)
- **Bordes en escalera que tiemblan.**
  Síntoma: los bordes curvos o inclinados se ven dentados y vibran cuando la forma se mueve.
  Causa: `step` (o un `if`) decide dentro o fuera sin término medio.
  Solución: `1.0 - smoothstep(-0.5 * pixel, 0.5 * pixel, d)` con la distancia de una SDF, donde `pixel` es lo que mide un píxel en tus unidades.
  → [ver ejemplo](08-step-contra-smoothstep.md)
- **Zonas negras (u otro color) sin ningún error.**
  Síntoma: una parte del dibujo sale negra, o de un color distinto en otra máquina.
  Causa: una cuenta sin resultado definido (`pow` o `sqrt` de un negativo, `atan(0.0, 0.0)`, `normalize` del vector cero, `0.0 / 0.0`); la GPU devuelve lo que quiere, a menudo NaN.
  Solución: protege las entradas con `max`, `abs` o `clamp`, o trata el caso especial antes de la cuenta.
  → [ver ejemplo](10-cuentas-sin-definir.md)

## Resumen

- `gl_FragCoord.xy` es el centro del píxel en píxeles, con el origen abajo a la izquierda; `uv = gl_FragCoord.xy / u_resolution` va de 0 a 1.
- Para formas, `(gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y`: origen en el centro y unidades cuadradas.
- Un color es un `vec3`/`vec4` de 0.0 a 1.0: el byte de CSS entre 255.
- Tipos estrictos (`1` no es `1.0`), vectores con swizzling (`.rgb`, `.yx`) y operaciones componente a componente.
- `mix`, `step`, `smoothstep`, `fract`, `floor`, `mod`, `length`, `atan`: casi todo dibujo es una combinación de ellas.
- Los uniforms son iguales para todos los píxeles: `u_time` anima, `u_mouse` interactúa y `shader_uniforms` crea controles.
- Una SDF da la distancia al borde (negativa dentro); `min`/`max` combinan formas y `smoothstep` en un píxel suaviza el borde.
- Algunas cuentas no están definidas (`pow` de un negativo, `atan(0.0, 0.0)`): protege las entradas.

## Para profundizar

- [The Book of Shaders: funciones de forma, color, formas y patrones (en español)](https://thebookofshaders.com/05/?lan=es)
- [Inigo Quilez: funciones de distancia 2D (en inglés)](https://iquilezles.org/articles/distfunctions2d/)
- [Khronos: tarjeta de referencia de WebGL 1.0 y GLSL ES 1.00 (PDF, en inglés)](https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf)
- [Shadertoy (en inglés)](https://www.shadertoy.com/): miles de shaders con las mismas ideas; allí los uniforms se llaman `iTime`, `iResolution` e `iMouse`.
