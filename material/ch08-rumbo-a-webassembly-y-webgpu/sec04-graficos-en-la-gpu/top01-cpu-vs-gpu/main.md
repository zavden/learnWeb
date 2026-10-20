# CPU y GPU

## Por qué importa

En la lección «Píxeles» del capítulo anterior, un bucle de JavaScript recorría 158 400 píxeles uno detrás de otro para pasar un cuadro a escala de grises, y aquella lección terminaba con una promesa: la GPU ejecuta el mismo programa diminuto («dame el color de este píxel») para miles de píxeles **a la vez**, y ese programa se llama *shader*. Este módulo cumple la promesa: vas a escribir shaders, a hablar con la GPU desde JavaScript con WebGL y a subirle imágenes como texturas.

La GPU no es nueva para ti. El navegador ya la usa en cada fotograma para montar las capas de la página (lección «Del HTML a los píxeles»), para animar `transform` y `opacity` sin tocar el hilo principal («Rendimiento de las animaciones») y para aplicar `filter` y las transformaciones 3D. Lo nuevo es programarla tú. Y para eso llegan los `Float32Array` del módulo «Datos binarios»: los bytes que aprendiste a construir son exactamente lo que la GPU lee.

Esta primera lección es el mapa: qué tiene de distinto una GPU, por dónde pasa un dibujo (el *pipeline* gráfico), qué es un fragment shader y qué no puede hacer, cómo se escriben los shaders en LearnWeb y cómo se mide algo que ocurre en otro procesador.

## Qué hay en este módulo

1. **CPU y GPU** (esta lección): el paralelismo masivo, el pipeline, el primer shader y sus reglas.
2. **Tu primer fragment shader**: coordenadas, color, GLSL, uniforms, formas con funciones de distancia y patrones.
3. **WebGL desde JavaScript**: el contexto `webgl2`, compilar shaders, búferes, atributos, uniforms y dibujar triángulos.
4. **Texturas y framebuffers**: subir imágenes y bytes a la GPU, filtrarlas, procesarlas y dibujar en una textura.

Los ejemplos son de dos tipos. Los **shaders** de LearnWeb (`renderer: shader`) solo tienen GLSL, el lenguaje de los shaders, y se ven en la vista previa sin escribir ni una línea de JavaScript. Los ejemplos de **WebGL desde JavaScript** son páginas normales, con HTML, CSS y JavaScript, que piden la GPU a un `<canvas>`.

## Muchos núcleos sencillos

Una **CPU** tiene pocos núcleos (8 en el M1 de este curso), y cada uno es muy listo: predice saltos, ejecuta instrucciones fuera de orden y tiene memorias caché grandes. Está diseñada para que **una** tarea con muchas decisiones termine cuanto antes. Una **GPU** apuesta por lo contrario: miles de unidades de cálculo sencillas que hacen **la misma operación sobre datos distintos**. La del M1 tiene 8 núcleos gráficos con 1024 unidades de cálculo de float32 en total, y puede tener en marcha casi 25 000 hilos a la vez.

| | CPU | GPU |
|---|---|---|
| núcleos | pocos (4-16), complejos | miles de unidades sencillas |
| optimizada para | terminar pronto una tarea (latencia) | terminar muchas a la vez (rendimiento total) |
| bueno para | lógica con decisiones, estructuras de datos, el DOM | la misma cuenta sobre millones de datos: píxeles, vértices, matrices |
| números | float64 (`number`), enteros de 64 bits | float32 sobre todo (lección «Float32 y precisión») |

¿Cómo se coordinan tantas unidades? En grupos. La GPU agrupa las ejecuciones de 32 en 32 (Apple los llama *SIMD-groups*; NVIDIA, *warps*) y todas las de un grupo ejecutan **la misma instrucción a la vez**, cada una con sus datos: un director de orquesta y 32 músicos que tocan la misma partitura con su propio instrumento. Las siglas que verás son SIMD («una instrucción, muchos datos») y SIMT («una instrucción, muchos hilos»). La consecuencia práctica: si dentro de un grupo unos píxeles entran en un `if` y otros no, el grupo recorre las dos ramas y cada píxel ignora la que no le toca. Un `if` en un shader no es gratis.

El ejemplo hace el mismo desenfoque de 9 × 9 vecinos sobre el cuadro de Velasco de la lección «Píxeles»: primero con un bucle de JavaScript, después con un fragment shader. El shader está en `assets/gpu/blur.js` (léelo con «Assets»); cada una de sus líneas se explica en las lecciones 3 y 4. Pulsa «Comparar»:

[[exercise:01-cpu-contra-gpu.md]]

```text
imagen: 480 × 330 = 158400 píxeles · 81 vecinos por píxel
Listo: pulsa «Comparar»
// Tras pulsar «Comparar». Los tiempos cambian en cada ejecución; en el M1 del curso:
CPU, un bucle → ≈ 80-170 ms
GPU, subir + dibujar + leer → ≈ 3-7 ms
¿los mismos píxeles? (diferencia ≤ 1) → true
```

[[exercise:01-cpu-contra-gpu.md-(script.js)]]

Fíjate en lo que mide el tiempo de la GPU: **subir** los píxeles a su memoria, **dibujar** y **leer** el resultado. Copiar datos entre la CPU y la GPU cuesta, y para un filtro muy barato (la escala de grises, una multiplicación por píxel) ese viaje puede comerse toda la ventaja. La GPU gana cuando hay mucho cálculo por cada byte que viaja: 81 vecinos por píxel, o miles de partículas, o una escena 3D entera. Y las dos imágenes coinciden: la GPU calcula en float32 y la CPU en float64, pero redondeadas a bytes salen iguales (la tolerancia de una unidad es por si un caso cae justo en un empate).

## El pipeline gráfico

Una GPU no ejecuta «un programa»: ejecuta una cadena de etapas fijas, y en dos de ellas pone **tus** programas. Esa cadena es el *pipeline* gráfico, y es la misma en WebGL, en WebGPU, en los videojuegos y en el compositor del navegador:

```text
 vértices            los datos que sube tu JavaScript: posiciones, colores…
    │
    ▼
 vertex shader       una vez por VÉRTICE: ¿dónde cae en la pantalla?      ← lo escribes tú
    │
    ▼
 ensamblado          cada 3 vértices, un triángulo (o líneas, o puntos)
    │
    ▼
 rasterización       ¿qué píxeles cubre el triángulo? interpola los datos de sus vértices
    │
    ▼
 fragment shader     una vez por PÍXEL cubierto: ¿de qué color?             ← lo escribes tú
    │
    ▼
 pruebas y mezcla    profundidad, transparencia (blending)
    │
    ▼
 framebuffer         la imagen final: el lienzo, o una textura
```

| Etapa | Cuántas veces | Quién la controla |
|---|---|---|
| vertex shader | una por vértice (3 para un triángulo) | tú (GLSL) |
| rasterización | una por triángulo | la GPU; tú eliges el tipo de primitiva |
| fragment shader | una por píxel cubierto (miles o millones) | tú (GLSL) |
| mezcla | una por píxel escrito | se configura desde JavaScript |

Lo que el vertex shader escribe en una variable `varying` no llega igual a todos los píxeles: la rasterización lo **interpola**, mezclando los valores de los 3 vértices del triángulo según lo cerca que esté cada píxel de cada uno. En los shaders de LearnWeb, el «dibujo» es siempre un rectángulo que cubre el lienzo, hecho con dos triángulos y 4 vértices. Este ejemplo da un color a cada esquina en el vertex shader y deja que la GPU los interpole:

[[exercise:02-vertices-y-fragmentos.md]]

Mira la diagonal que va de abajo a la derecha hasta arriba a la izquierda: es el lado que comparten los dos triángulos. El de abajo solo conoce el rojo, el verde y el azul; el de arriba, el verde, el azul y el amarillo. Por eso el degradado cambia de dirección justo en esa línea. El vertex shader se ejecutó 4 veces; el fragment shader, 256 000.

## Un fragment shader es una función

La idea central del módulo cabe en una línea: un fragment shader es **una función de la posición de un píxel a su color**. La GPU la ejecuta para cada píxel, todas a la vez, y cada ejecución solo sabe tres cosas: dónde está su píxel (`gl_FragCoord`), los valores que le pasa JavaScript (los *uniforms*) y lo que llega interpolado de los vértices (los *varyings*). Escribe el resultado en `gl_FragColor`, con los canales de 0.0 a 1.0.

[[exercise:03-una-funcion-por-pixel.md]]

[[exercise:03-una-funcion-por-pixel.md-]]

Compáralo con el bucle de la lección «Píxeles»: el cuerpo del bucle es `main()`, y el bucle **desaparece**. No hay `for (let y…)` ni `for (let x…)`: el «para cada píxel» lo pone el hardware. GLSL se parece a C y a JavaScript (llaves, `if`, `for`, funciones), pero con tipos estrictos y vectores de serie: `vec2` para un punto, `vec3` para un color, y funciones como `mix` (mezclar) o `distance`. La lección siguiente lo cuenta con calma.

## Shaders en LearnWeb

Un ejemplo de shader es un archivo con `renderer: shader` en la cabecera, un bloque `# Vertex` y un bloque `# Fragment`, sin HTML ni JavaScript. Usa WebGL 1, así que su GLSL es el de la versión **GLSL ES 1.00** (`attribute`, `varying`, `gl_FragColor`). La cabecera fija el tamaño del lienzo y, si hace falta, controles y texturas:

```text
renderer: shader
resolution: 600x400                                   ← el lienzo mide 600 × 400 píxeles
shader_uniforms: "speed:float=1[0,4,0.1]|tint:vec3=0.9,0.2,0.3"   ← controles propios
shader_textures: u_image=valley-of-mexico.jpg          ← una imagen de assets/
```

LearnWeb rellena en cada fotograma unos uniforms con nombre fijo. Están disponibles en todos los shaders, pero **hay que declararlos** en el bloque `# Fragment` para usarlos (`uniform float u_time;`):

| Uniform | Tipo | Qué vale |
|---|---|---|
| `u_resolution` | `vec2` | el tamaño del lienzo en píxeles: el `resolution` de la cabecera, tal cual (no se multiplica por `devicePixelRatio`; el CSS lo escala para que quepa) |
| `u_time` | `float` | segundos desde que empezó la animación; no avanza en pausa |
| `u_delta` | `float` | segundos desde el fotograma anterior |
| `u_mouse` | `vec2` | el ratón, en píxeles del lienzo, con la y hacia arriba como `gl_FragCoord` |
| `u_mouse_pressed` | `float` | `1.0` con el botón pulsado, `0.0` si no |
| `u_frame` | `float` | el número de fotograma |

Dónde ves un shader cambia lo que ves. Las **tarjetas** de la galería y de la teoría muestran un fotograma quieto, con `u_time` a 0 y el ratón en `(0, 0)`: por eso todos los shaders de este módulo tienen un primer fotograma con sentido. En el **editor**, el tiempo empieza en pausa: el botón ▶ del panel Shader lo pone en marcha (y vuelve a pararlo, que la GPU también calienta). Ese panel tiene además los controles de `shader_uniforms` (deslizadores, selectores de color, casillas), el tamaño del lienzo y las texturas. En el diálogo que se abre al pulsar una tarjeta, el shader responde al ratón con el tiempo parado en 0.

Si el shader no compila, la vista previa no dibuja nada: muestra «Shader preview unavailable», «Fragment shader compile error» y el registro del compilador. El error más común al empezar es usar un uniform de LearnWeb sin declararlo:

[[exercise:04-uniform-sin-declarar.md-]]

```text
Shader preview unavailable
Fragment shader compile error
ERROR: 0:6: 'u_time' : undeclared identifier
```

Eso es lo que ves en las tarjetas y en el diálogo de la teoría. Cada línea del registro empieza por `ERROR: 0:N:`, donde `0` es el número de archivo (siempre 0) y `N` la línea **dentro del bloque** `# Fragment`, contando desde 1; LearnWeb no añade nada delante, así que el número coincide con lo que ves en el editor. En el **editor**, la vista previa comprueba el shader antes de dibujarlo y lo cuenta de otra forma: «Shader preview unavailable» con el mensaje sin prefijo (`'u_time' : undeclared identifier`), y el error marcado en la línea 6 del bloque como un error de compilación (`shader.frag:6`). Es el mismo error, contado dos veces. Las demás formas de romper un shader, y cómo leerlas, llegan en las dos lecciones siguientes.

## Sin estado compartido

Para que mil núcleos puedan calcular a la vez, ningún píxel puede depender de otro. Cada ejecución de `main()` es independiente: no ve los resultados de las demás, no puede escribir en sus variables y no sabe en qué orden se ejecutan. A cambio, la GPU puede repartirlas como quiera. Este ejemplo lo muestra en JavaScript: una función que depende solo de la posición da lo mismo en cualquier orden; un bucle que acumula, no.

[[exercise:05-el-orden-no-importa.md-]]

```text
función, en orden    → 0 36 73 109 146 182 219 255
función, desordenada → 0 36 73 109 146 182 219 255
acumulado, en orden    → 30 60 90 120 150 180 210 240
acumulado, desordenado → 120 210 60 150 240 30 180 90
Array.from, como np.vectorize → 0 36 73 109 146 182 219 255
```

> **Desde Python:** un fragment shader es lo que hace numpy con una operación vectorizada (`np.round(x / 7 * 255)` sobre un `np.arange(8)`): la misma cuenta en cada elemento, sin bucle escrito por ti. Es como un `np.vectorize` que de verdad corre en paralelo. Lo que no se puede escribir así es `np.cumsum`, donde cada elemento necesita el anterior. Y si quieres shaders desde Python, existen `moderngl` y `PyOpenGL`, que hablan el mismo OpenGL que hay debajo de WebGL, con el mismo GLSL.

Con la costumbre de la CPU es fácil escribir un shader que «acumula». GLSL deja declarar una variable global y modificarla, pero cada ejecución tiene **su propia copia**, que empieza con el valor inicial:

[[exercise:06-acumular-entre-pixeles.md]]

[[exercise:06-acumular-entre-pixeles.md-]]

La mitad de arriba sale plana, casi del color de partida: cada píxel sumó una sola vez sobre su copia. La de abajo hace lo correcto: calcula el valor **a partir de la posición** del píxel. Cuando un cálculo necesita de verdad a todos los píxeles (un total, la media de una imagen, un histograma), la GPU lo resuelve con otras técnicas: pasadas que reducen la imagen a la mitad una y otra vez, o los *compute shaders* del módulo «WebGPU».

## El bucle de píxeles, en la GPU

Ya tienes todo para reescribir los filtros de la lección «Píxeles». Aquel bucle leía `data[i]`, `data[i + 1]` y `data[i + 2]`, aplicaba una función al color y escribía el resultado; el shader lee el color de una **textura** (la imagen, subida a la memoria de la GPU) con `texture2D`, aplica la misma función y lo escribe en `gl_FragColor`. Los pesos de la luminancia son los mismos; solo cambia la escala, de 0-255 a 0.0-1.0:

[[exercise:07-filtros-en-la-gpu.md]]

[[exercise:07-filtros-en-la-gpu.md-]]

En la tarjeta, la mitad derecha sale en escala de grises. Ábrelo en el editor para mover los controles `filterMode` (0 original, 1 grises, 2 negativo, 3 umbral) y `split` (la línea): cada cambio redibuja los 158 400 píxeles sin que lo notes. LearnWeb sube la imagen ya girada para que `uv = (0, 0)` sea su esquina de abajo a la izquierda; por qué hace falta girarla, y qué pasa si no, lo verás en «Texturas y framebuffers».

## float32 en cada píxel

En GLSL, `float` es un decimal de 32 bits, con todo lo que viste en «Float32 y precisión»: 7 cifras, enteros exactos hasta 2²⁴ y errores que se acumulan. La línea `precision mediump float;` del principio de cada fragment shader pide una precisión **mínima**: `highp` garantiza float32; `mediump` admite float16 (unas 3 cifras) y `lowp` aún menos. Es una pista para el hardware, no una orden. En tu Mac (ANGLE sobre Metal), las tres son float32; en muchos móviles, `mediump` es float16 de verdad, y un shader que funciona en el portátil puede dar bandas o saltos en un teléfono.

[[exercise:08-precision-en-la-gpu.md-]]

```text
// En el Mac del curso:
highp   → hasta 2^127, 23 bits de mantisa
mediump → hasta 2^127, 23 bits de mantisa
lowp    → hasta 2^127, 23 bits de mantisa
// En cualquier GPU con float32:
16777216 + 1 === 16777216 → GPU: true · Math.fround: true · JavaScript: false
0.1 + 0.2 === 0.3 → GPU: true · Math.fround: true · JavaScript: false
```

La GPU suma como `Math.fround`, no como un `number`. Por eso `u_time` llega en segundos desde que empezó la animación y no en milisegundos desde 1970: una fecha en float32 avanza a saltos de dos minutos (lección «Float32 y precisión»). Si un shader necesita tiempos largos con decimales finos, se le pasa el resto `tiempo % periodo` calculado en JavaScript, en float64.

## Medir la GPU

La GPU trabaja **en paralelo con la CPU**, no solo dentro de sí misma. Cuando JavaScript llama a `drawArrays`, el navegador anota el encargo en una cola y la función vuelve enseguida; la GPU lo ejecuta cuando le llega el turno. JavaScript solo se para a esperar cuando necesita un resultado, por ejemplo al leer píxeles con `readPixels`. Por eso un cronómetro alrededor de los dibujos mide lo que cuesta **encargarlos**, no lo que cuesta hacerlos:

[[exercise:09-medir-la-gpu-con-performance-now.md-(script.js)]]

```text
Listo: pulsa «Medir»
// Tras pulsar «Medir». Los tiempos cambian en cada ejecución; en el M1 del curso:
🐛 encargar 10 dibujos → ≈ 0.1-0.5 ms
✅ encargarlos y esperar el resultado → ≈ 4.5 ms
¿la misma imagen las dos veces? → true
```

[[exercise:09-medir-la-gpu-con-performance-now.md]]

Leer un solo píxel basta para obligar a esperar: la GPU tiene que terminar todo lo encargado antes de poder contestar. Es una espera que en una aplicación real se evita (bloquea el hilo principal), así que úsala para medir, no en cada fotograma. Para medir el tiempo de la GPU sin bloquear existen las consultas de tiempo (`EXT_disjoint_timer_query_webgl2`), que muchos navegadores ocultan o redondean por seguridad. El módulo «Rendimiento» de este capítulo trata la medición en general: calentamiento, repeticiones y por qué el primer dibujo de un programa es más lento (el ejemplo lo hace al cargar, con `warmUp()`).

## WebGL 1, WebGL 2 y WebGPU

Una página tiene tres formas de hablar con la GPU. Las dos primeras salen de un `<canvas>`, como el contexto `'2d'` (lección «Canvas y gráficos» del capítulo de HTML); la tercera, de `navigator.gpu`:

| | WebGL 1 | WebGL 2 | WebGPU |
|---|---|---|---|
| se pide con | `canvas.getContext('webgl')` | `canvas.getContext('webgl2')` | `navigator.gpu.requestAdapter()` |
| basado en | OpenGL ES 2.0 | OpenGL ES 3.0 | Vulkan, Metal y Direct3D 12 |
| lenguaje | GLSL ES 1.00 | GLSL ES 3.00 | WGSL |
| en navegadores desde | 2011 | 2017 | 2023 (Chrome); 2025 (Safari, Firefox) |
| cálculo general | solo dibujando | solo dibujando | *compute shaders* |
| en este curso | los ejemplos de shader | las lecciones 3 y 4 | el módulo «WebGPU» |

WebGL 2 hace todo lo de WebGL 1 y más (texturas de cualquier tamaño, varios objetivos de dibujo, `texelFetch`, instancias), y lo tienen todos los navegadores actuales: es la opción por defecto. WebGPU es una API nueva, más cercana a cómo funcionan las GPU de hoy; el último módulo del capítulo la estudia con todo lo que aprendas aquí.

[[exercise:10-webgl-webgl2-y-webgpu.md-]]

```text
// En el Mac del curso:
webgl  → WebGL 1.0 (OpenGL ES 2.0 Chromium)
webgl2 → WebGL 2.0 (OpenGL ES 3.0 Chromium)
GLSL de webgl2 → WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.0 Chromium)
GPU → ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)
textura más grande → 16384 px de lado
WebGPU → apple · metal-3
```

**ANGLE** es la capa de Chrome que traduce WebGL a la API nativa de cada sistema: Metal en macOS, Direct3D en Windows, Vulkan u OpenGL en Linux y Android. Por eso los mensajes de error de este módulo dicen cosas como «ANGLE» y por eso un mismo shader se comporta igual en todos los sistemas (casi siempre). Los contextos WebGL son un recurso limitado: Chrome mantiene unos 16 a la vez por proceso y, si se piden más, descarta el más antiguo. Los ejemplos de este módulo liberan el suyo al cerrar la página (`WEBGL_lose_context`).

## Bestiario

- **«'u_time' : undeclared identifier» y la vista previa en blanco.**
  Síntoma: un shader de LearnWeb no dibuja nada y muestra «Shader preview unavailable» con un error de compilación.
  Causa: los uniforms de LearnWeb (`u_time`, `u_resolution`, `u_mouse`…) los rellena la aplicación, pero GLSL no conoce ningún nombre sin declarar.
  Solución: declara cada uno que uses, con su tipo: `uniform float u_time;`, `uniform vec2 u_resolution;`.
  → [ver ejemplo](04-uniform-sin-declarar.md)
- **Un shader que «acumula» da un color plano.**
  Síntoma: una variable global que se incrementa en cada píxel, pensando en un degradado o un contador, da el mismo valor en todos.
  Causa: cada ejecución de `main()` tiene su propia copia de las variables; no hay «píxel anterior» ni orden.
  Solución: calcula cada valor a partir de la posición del píxel (`gl_FragCoord`) y de los uniforms; para totales o medias, varias pasadas o compute shaders.
  → [ver ejemplo](06-acumular-entre-pixeles.md)
- **La GPU «tarda» medio milisegundo.**
  Síntoma: `performance.now()` alrededor de `drawArrays` da tiempos ridículamente pequeños que no cambian con el trabajo.
  Causa: las llamadas de WebGL solo encargan el trabajo; la GPU lo hace después, en paralelo.
  Solución: para medir, espera al resultado (un `readPixels` de un píxel) y mide hasta ahí; fuera de las mediciones, no lo hagas en cada fotograma.
  → [ver ejemplo](09-medir-la-gpu-con-performance-now.md)

## Resumen

- La CPU tiene pocos núcleos listos; la GPU, miles de unidades sencillas que ejecutan la misma instrucción sobre datos distintos, en grupos de 32.
- El pipeline: vértices → vertex shader → ensamblado → rasterización (interpola los varyings) → fragment shader → mezcla → framebuffer.
- Un fragment shader es una función de la posición de un píxel a su color: el cuerpo del bucle de la lección «Píxeles», sin el bucle.
- No hay estado compartido entre píxeles ni orden: todo se calcula desde `gl_FragCoord`, los uniforms y los varyings.
- En LearnWeb: `renderer: shader`, GLSL ES 1.00, uniforms de la aplicación que hay que declarar; tarjetas quietas con `u_time` a 0 y el tiempo en pausa en el editor hasta pulsar ▶.
- `float` es float32; `mediump` es solo una pista (float32 en tu Mac, float16 en muchos móviles).
- Las llamadas de WebGL encargan y vuelven: medir la GPU exige esperar al resultado.
- WebGL 1 y 2 salen de un canvas; WebGPU, de `navigator.gpu`. Chrome traduce WebGL con ANGLE.

## Para profundizar

- [The Book of Shaders, en español](https://thebookofshaders.com/?lan=es)
- [MDN: API de WebGL](https://developer.mozilla.org/es/docs/Web/API/WebGL_API)
- [WebGL2 Fundamentals: cómo funciona WebGL (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl-how-it-works.html)
- [MDN: getShaderPrecisionFormat (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getShaderPrecisionFormat)
- [Fabian Giesen: A trip through the Graphics Pipeline (en inglés)](https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/)
