# Ejemplos profesionales: gráficos en la GPU

## Por qué importa

Las lecciones del módulo enseñan cada pieza con un ejemplo que dibuja una vez y lee un píxel. Una aplicación real hace lo mismo, pero durante horas, con el usuario tocándolo todo: cambia controles, arrastra, acerca, cambia de pestaña, deja el portátil dormido y vuelve. Esta página reúne once herramientas escritas como en un proyecto real con todo lo que has visto en el curso (HTML, CSS, el lenguaje JavaScript, el DOM y los eventos, los formularios, los observadores y los componentes web del capítulo 6) y este módulo: un editor de fotos, un gráfico de 10 000 puntos, una simulación, un visor de obras de arte, un componente reutilizable…

Todas usan una pequeña biblioteca propia, `assets/gl/kit.js`, y la escena 3D usa además `assets/gl/mat4.js`, matrices de 4 × 4 escritas desde cero. Léelas con «Assets»: no esconden WebGL, solo le quitan la ceremonia repetida y convierten sus fallos silenciosos en errores con nombre. Las imágenes son las del curso: el cuadro de Velasco (también a 960 × 660), la ola de Hokusai y los Pilares de la creación del Hubble. Todo lo demás (datos, mapas de normales, tableros) se genera en el navegador. Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño.

## Qué tienen en común

- **La GPU trabaja por encargo.** Programas, búferes y texturas se crean una vez; después solo cambian uniforms. Nada se dibuja si no ha cambiado nada, y como mucho una vez por fotograma (`view.invalidate()`). Ningún ejemplo tiene un bucle encendido al cargar: los que se animan lo hacen con un botón, durante un tiempo fijo, se paran al ocultar la página y, con «reducir movimiento», no arrancan.
- **Lo que se ve se comprueba.** Casi todos llevan una autocomprobación: el mismo cálculo en JavaScript (una cadena de filtros, la luz de un píxel, un paso del juego de la vida) y `readPixels` para leer lo que escribió la GPU. Es la forma profesional de probar código de gráficos: una referencia lenta y clara contra la versión rápida.
- **Los errores tienen nombre.** GLKit lanza `GLKitError` con la línea del shader y su código, avisa si un uniform no existe o tiene el tamaño equivocado, y comprueba los framebuffers.
- **El contexto es un recurso.** Chrome mantiene unos 16 contextos WebGL a la vez y puede quitarte el tuyo. Cada ejemplo usa uno (el del componente, uno por cartel), lo libera al cerrar la página y, si lo pierde, vuelve a crear todo al recuperarlo.
- **Píxeles nítidos y coordenadas claras.** El lienzo mide su tamaño CSS × `devicePixelRatio`, siempre al día con un `ResizeObserver`. El puntero (y hacia abajo, px CSS) se convierte en coordenadas de la escena (y hacia arriba) en una función con nombre.
- **Accesibles.** Todo lo que se hace con el ratón se puede hacer con el teclado; los lienzos tienen `role="img"` y una descripción, y los resultados se dicen en texto (regiones `role="status"`), no solo con color. Las regiones que cambian en cada fotograma no se anuncian: se anuncia el resultado al terminar el gesto.
- **Funcionan en las tarjetas.** Una tarjeta es un iframe de origen `null`: para ella, toda imagen es de otro origen, así que `loadImage` pone siempre `crossOrigin = 'anonymous'` antes de `src`.

## La biblioteca: GLKit

| Función | Qué hace | Lección |
|---|---|---|
| `createView(canvas, { setup, render, onStatus })` | contexto WebGL2, tamaño con `devicePixelRatio`, `renderNow()` e `invalidate()`, pérdida y recuperación del contexto, `destroy()` | «WebGL desde JavaScript» |
| `createProgram(gl, { vertex, fragment, name })` | compila y enlaza; errores con línea y código; `set({ u_x: … })` comprueba nombre y tamaño | «WebGL desde JavaScript» |
| `createQuad(gl)` | el rectángulo que cubre el viewport, en la location 0 | «WebGL desde JavaScript» |
| `createTexture(gl, opciones)` | desde una imagen (`source`, volteada) o desde bytes (`width`, `height`, `data`); filtro, repetición, mipmaps | «Texturas y framebuffers» |
| `createTarget(gl, w, h)` y `bindCanvas(gl)` | una textura con su framebuffer, comprobado; volver al lienzo | «Texturas y framebuffers» |
| `loadImage(url)` y `readPixel(gl, x, y)` | imágenes con `crossOrigin`; el color de un píxel | «Texturas y framebuffers» |
| `createAnimation({ frame, onStop })` | un bucle con botón, finito, que se para al ocultar la página y respeta «reducir movimiento» | «El bucle de animación» |

`setup(gl)` crea **todos** los recursos y los devuelve. GLKit lo vuelve a llamar si el navegador recupera un contexto perdido, porque entonces no queda ninguno: es la regla que hace robusta una aplicación WebGL, y la razón de que ningún ejemplo guarde objetos de WebGL fuera de lo que devuelve `setup`.

## Un cubo en 3D

**Objetivo:** una escena 3D completa, la que prometía la lección «WebGL desde JavaScript». **Técnicas:** perspectiva, cámara con `lookAt` y giros con matrices de 4 × 4 (`mat4.js`, por columnas como `matrix3d()` de CSS); un cubo de 24 vértices con posición, normal y color intercalados (36 bytes cada uno) y 36 índices; luz de Lambert; `DEPTH_TEST` y `CULL_FACE` con casillas para ver qué pasa sin ellos; arrastrar, teclado y un giro automático de 10 s. **Fíjate en:** el color del centro, leído con `readPixels`, coincide con el mismo cálculo de luz hecho en JavaScript.

[[exercise:01-cubo-en-3d.md]]

```text
cubo → 24 vértices × 36 bytes + 36 índices × 2 bytes · 1 drawElements
X 25° · Y -35° · centro → 123, 16, 39 (cara: delante · calculado: 123, 16, 39 ✅)
Listo: arrastra el cubo o usa las flechas; «Girar solo» lo hace girar 10 s
// Tras entrar en el cubo con Tab y pulsar →:
X 25° · Y -20° · centro → 140, 18, 45 (cara: delante · calculado: 140, 18, 45 ✅)
// Tras desmarcar «Prueba de profundidad» y después «Descartar caras traseras»:
X 25° · Y -20° · centro → 140, 18, 45 (cara: delante · calculado: 140, 18, 45 ✅)
X 25° · Y -20° · centro → 37, 17, 71 (cara: detrás)
```

Con una sola de las dos casillas el cubo se ve bien, porque es convexo: o se descartan las caras de atrás, o lo cercano tapa lo lejano. Sin ninguna, manda el orden de dibujo: la cara de detrás se dibuja después que la de delante y la tapa. Su color, 37, 17, 71, es el violeta con solo la luz ambiente (124, 58, 237 × 0.3), porque da la espalda a la luz. El giro automático para a los 10 s, o al pulsar otra vez, o al ocultar la página.

## Un editor de fotos

**Objetivo:** el núcleo de un editor de fotos: una cadena de filtros que se activan, se ajustan y se reordenan, con una comparación «antes | después». **Técnicas:** cada filtro es un objeto con un trozo de GLSL y su versión en JavaScript, y los seis fragment shaders salen de la misma plantilla; una pasada por filtro activo, que lee una textura y escribe en uno de dos framebuffers que se turnan (*ping-pong*); la cadena solo se recalcula cuando cambia un filtro, y la línea de la comparación solo repite la última pasada. **Fíjate en:** la autocomprobación pasa un color de prueba por la cadena en la GPU y en JavaScript, con el mismo redondeo a bytes entre pasadas (los destinos son RGBA8), y en el segundo cambio el número cambia sin tocar ningún control: solo el orden.

[[exercise:02-editor-de-fotos.md]]

```text
foto → 480 × 323 · 2 destinos de 480 × 323 (RGBA8) que se turnan
cadena → Exposición → Contraste → Saturación → Temperatura → Viñeta · 5 pasadas + 1 al lienzo · prueba #9f6c30 en (120, 80) → 217, 124, 15 ✅
Listo: ajusta los filtros, cambia su orden con ↑ ↓ y desliza «Antes | después»
// Tras desmarcar «Viñeta»:
cadena → Exposición → Contraste → Saturación → Temperatura · 4 pasadas + 1 al lienzo · prueba #9f6c30 en (120, 80) → 230, 131, 16 ✅
// Tras pulsar ↑ en «Contraste»:
cadena → Contraste → Exposición → Saturación → Temperatura · 4 pasadas + 1 al lienzo · prueba #9f6c30 en (120, 80) → 226, 126, 11 ✅
```

El orden importa porque los filtros no conmutan: subir la exposición y después el contraste no es lo mismo que al revés, igual que en Photoshop o en Lightroom el orden de las capas de ajuste. La prueba se hace en el píxel (120, 80), lejos del centro, para que la viñeta también cuente. Con destinos RGBA8, cada pasada redondea a bytes; un editor que encadena muchas pasadas usa texturas de float16 para no acumular esos redondeos (lección «Float32 y precisión»).

## Un gráfico de 10 000 puntos

**Objetivo:** un gráfico de dispersión que se mueve y se acerca con fluidez con miles de datos: 10 000 trayectos de bicicleta compartida (sintéticos, de un generador con semilla). **Técnicas:** los datos (distancia, duración y franja horaria, 12 bytes por trayecto) se suben una vez con `STATIC_DRAW`; mover o acercar solo cambia un uniform de 4 números; las franjas se filtran en el vertex shader con una máscara de bits y los puntos ocultos se mandan fuera del espacio de recorte; puntos redondos con `gl_PointSize` y `gl_PointCoord`; color premultiplicado sobre una rejilla de canvas 2D que queda debajo. Lo que no es dibujo (el punto más cercano, cuántos se ven) se calcula en la CPU. **Fíjate en:** la rueda sola desplaza la página, como en los mapas incrustados; para acercar, `Ctrl` + rueda o el pellizco del trackpad (Chrome lo envía así).

[[exercise:03-dispersion-de-10000-puntos.md]]

```text
10000 trayectos × 12 bytes = 120000 bytes en un búfer (STATIC_DRAW) · 1 drawArrays(POINTS) por dibujo
vista: distancia 0–12 km · duración 0–60 min · visibles 9923 (mañana 3522, tarde 4410, noche 1991)
Listo: arrastra, usa Ctrl + rueda o pellizca; con el teclado: flechas, + y −, 0 y Enter
// Tras entrar en el gráfico con Tab y pulsar +:
vista: distancia 3–9 km · duración 15–45 min · visibles 4239 (mañana 1590, tarde 1801, noche 848)
// Tras pulsar →:
vista: distancia 3.6–9.6 km · duración 15–45 min · visibles 3627 (mañana 1363, tarde 1502, noche 762)
// Tras desmarcar «Noche»:
vista: distancia 3.6–9.6 km · duración 15–45 min · visibles 2865 (mañana 1363, tarde 1502, noche: oculta)
// Tras volver al gráfico con Tab y pulsar Enter:
📍 trayecto 1745 · 6.59 km · 30.1 min · mañana · en pantalla: 255, 255, 255, 255 ✅
```

Los 77 trayectos que no se ven al cargar duran más de una hora. El trayecto elegido se vuelve a dibujar encima de todos con otro `drawArrays` de un solo vértice, en blanco, y `readPixels` en su centro lo confirma. Es la cara profesional de «Miles de partículas en un solo encargo»: allí los datos se movían en la GPU; aquí son fijos y lo que se mueve es la cámara.

## El juego de la vida

**Objetivo:** una simulación en la GPU, comprobada en la CPU. **Técnicas:** el tablero de 128 × 80 células son bytes (0 o 255) en dos texturas `R8` enganchadas a dos framebuffers: cada paso lee una y escribe la otra (el *ping-pong* que anunciaba la lección «Texturas y framebuffers»); el shader del paso lee las 8 vecinas con `texelFetch`, coordenadas enteras sin filtros, y `%` hace que los bordes den la vuelta; editar una célula sube 1 byte con `texSubImage2D`. **Fíjate en:** cada «Paso» lee el tablero antes y después con `readPixels` y compara las 10 240 células con el mismo paso hecho en JavaScript. Mientras se anima no se lee nada, porque `readPixels` obliga a esperar a la GPU: solo al terminar.

[[exercise:04-juego-de-la-vida.md]]

```text
tablero → 128 × 80 = 10240 células · 2 texturas R8 de 10240 bytes que se turnan
siembra 1 · generación 0 · 3073 vivas
Listo: pulsa «Paso», «+10» o «▶ 100 generaciones»; con Tab entras en el tablero (flechas y Espacio)
// Tras pulsar «Paso»:
generación 1 · 3451 vivas · la CPU calcula lo mismo en las 10240 células ✅
// Tras pulsar «+10»:
generación 11 · 2241 vivas · la CPU calcula lo mismo en 10 de 10 pasos ✅
// Tras pulsar «▶ 100 generaciones» y esperar unos 8 s:
▶ 12 generaciones por segundo, 1 dibujo por generación
⏹ 100 generaciones · generación 111 · 916 vivas
// Tras pulsar «Siembra nueva», entrar en el tablero con Tab y pulsar Espacio:
siembra 2 · generación 0 · 3088 vivas
(64, 40) → viva · 3089 vivas
```

Las reglas son deterministas: la misma siembra da siempre las mismas generaciones, en la GPU y en la CPU, en cualquier máquina. Por eso los números del cuadro son exactos. El vídeo de la lección «Audio y vídeo» del capítulo de HTML era este mismo juego, grabado; aquí se calcula en cada paso.

## Transiciones entre fotos

**Objetivo:** un carrusel con cinco transiciones hechas en la GPU: fundido, cortinilla, disolución, iris y píxeles. **Técnicas:** cada foto es una textura con su tamaño, y un trozo de GLSL común la encuadra como `object-fit: cover`; una transición es una función de GLSL que mezcla dos fotos según `u_progress`, una por programa; las tres «de máscara» comparten el mismo patrón (cada píxel tiene un umbral y cambia cuando el progreso lo alcanza); una curva lenta-rápida-lenta de 1,2 s. **Fíjate en:** la autocomprobación dibuja cada transición con progreso 0 y 1 y la compara, con `readPixels` en 5 puntos, con la foto sola: así se descubre el error clásico de las transiciones, un salto en el último fotograma.

[[exercise:05-transiciones-de-fotos.md]]

```text
3 fotos · 5 transiciones (fundido, cortinilla, disolución, iris, píxeles), 1 programa por transición
autocomprobación: cada transición empieza en la foto A y acaba en la B → 10 de 10 ✅
Listo: elige una transición y pulsa «Siguiente ▶» (o «◀ Anterior»)
// Tras pulsar «Siguiente ▶»:
▶ fundido: Valle de México → La gran ola de Kanagawa (1.2 s)
✅ La gran ola de Kanagawa (2 de 3)
// Tras elegir «Iris» y pulsar «◀ Anterior»:
▶ iris: La gran ola de Kanagawa → Valle de México (1.2 s)
✅ Valle de México (1 de 3)
```

El truco del patrón de máscara es `smoothstep(n, n + borde, progreso × (1 + borde))`: con progreso 0 vale 0 para cualquier umbral entre 0 y 1, y con progreso 1 vale 1. Sin el `× (1 + borde)`, los píxeles con umbral cerca de 1 no terminarían de cambiar nunca. Con «reducir movimiento», el cambio es directo; si ocultas la página a mitad, la transición se completa al volver.

## Relieve con un mapa de normales

**Objetivo:** una placa de latón con remaches, un medallón y marcas de martillo que no existen: la geometría es un rectángulo de 4 vértices. **Técnicas:** un mapa de alturas hecho con funciones (bisel, semiesferas, anillos y ruido), convertido en JavaScript en un mapa de normales con diferencias centrales (lo mismo que la convolución de bordes de la lección «Píxeles») y codificado en bytes; el canal alfa dice qué es latón y qué es madera; una luz puntual con la difusa de Lambert, el brillo de Blinn-Phong y atenuación por distancia. **Fíjate en:** desmarca «Mapa de normales» y el relieve desaparece; así se ven detallados los muros de los videojuegos sin millones de triángulos.

[[exercise:06-relieve-con-mapa-de-normales.md]]

```text
placa → 4 vértices · mapa de normales de 384 × 256 = 393216 bytes, calculado en JavaScript
normal del centro (plano) → bytes 128, 128, 255, 255 = (0, 0, 1)
autocomprobación: luz encima del centro (altura 0.5) → 244, 209, 155 (JavaScript) · GPU ✅
Listo: mueve el puntero o las flechas para mover la luz; desmarca «Mapa de normales»
// Sin pasar el puntero por la placa, tras entrar en ella con Tab y pulsar → dos veces:
💡 luz en (0.35, 0.70) · altura 0.5
💡 luz en (0.40, 0.70) · altura 0.5
// Tras llevar «Altura de la luz» a 0.8:
autocomprobación: luz encima del centro (altura 0.8) → 178, 152, 111 (JavaScript) · GPU ✅
// Tras desmarcar «Mapa de normales»:
mapa de normales: desactivado → la misma placa, plana: 4 vértices y ningún relieve
```

Una normal (x, y, z) de -1..1 se guarda como (n × 0.5 + 0.5) × 255: la superficie plana, (0, 0, 1), son los bytes 128, 128, 255, el azul lila que tienen todos los mapas de normales. La prueba pone la luz justo encima del píxel central para que el resultado no dependa del tamaño del lienzo; después la luz vuelve a su sitio, en la misma tarea, sin que se llegue a ver.

## Un cuentagotas en la GPU

**Objetivo:** el cuentagotas del capítulo 6, «Gráficos y animación», para una imagen que solo existe en la GPU: una carta de colores con ocho colores con nombre y un degradado HSL, dibujada por un shader. **Técnicas:** la carta se dibuja una vez en un framebuffer propio y el lienzo solo la muestra ampliada con el cursor encima, así que el cursor nunca ensucia lo que se lee; el paso de px CSS (y hacia abajo) a píxeles de la carta (y hacia arriba); una lupa de 11 × 11 píxeles con `readPixels` y las filas al revés para un `ImageData`; el contraste WCAG con blanco y con negro; teclado con flechas, `Mayús` y `Enter`. **Fíjate en:** cada lectura se compara con la misma fórmula del shader escrita en JavaScript.

[[exercise:07-cuentagotas-en-la-gpu.md]]

```text
carta → 320 × 200 píxeles en un framebuffer propio · 8 colores con nombre y un degradado HSL
Listo: mueve el puntero (clic para guardar) o entra con Tab: flechas (Mayús: de 10 en 10) y Enter
// Tras entrar en la carta con Tab y pulsar Enter:
💧 (20, 160) → #e4007c · rgb(228, 0, 124) · rosa mexicano · contraste: blanco 4.58, negro 4.59 ✅
// Tras pulsar Mayús + → cuatro veces y Enter:
💧 (60, 160) → #ff9f1c · rgb(255, 159, 28) · cempasúchil · contraste: blanco 2.05, negro 10.23 ✅
// Tras pulsar Mayús + ↓ siete veces y Enter:
💧 (60, 90) → #e0f367 · rgb(224, 243, 103) · degradado hsl(68°, 85 %, 68 %) · contraste: blanco 1.22, negro 17.19 ✅
// Tras pulsar «🐛 Leer del lienzo, no del framebuffer»:
🐛 lienzo, en otra tarea → 0, 0, 0, 0 · ✅ framebuffer de la carta → 224, 243, 103, 255
```

La última línea es el error clásico de los cuentagotas en WebGL. Un lienzo WebGL se crea con `preserveDrawingBuffer: false`: en cuanto el navegador lo presenta en pantalla, en Chrome su contenido se descarta, y un `readPixels` en otro evento (un clic, mucho después del último dibujo) lee ceros. Hay tres salidas: leer en la misma tarea que el dibujo (lo que hacen los demás ejemplos), pedir `preserveDrawingBuffer: true` (más lento: el navegador tiene que copiar el lienzo en cada fotograma) o, como aquí, guardar la imagen en un framebuffer propio. El rosa mexicano tiene casi el mismo contraste con blanco que con negro (4.58 y 4.59): los dos pasan el 4.5:1 de WCAG por muy poco.

## Errores con nombre

**Objetivo:** un taller de shaders que nunca se queda en negro, con todos los errores del módulo atrapados y explicados en la página. **Técnicas:** GLKit convierte cada fallo en un `GLKitError` con un tipo (`compile`, `link`, `uniform`, `context`) y, en los de compilación, una entrada por mensaje con su línea y el código de esa línea; la página los lista con un botón «Ir a la línea» que selecciona esa línea en el editor; un programa nuevo solo sustituye al anterior si compila, enlaza y acepta sus uniforms (si no, `deleteProgram` y se sigue viendo el último bueno). **Fíjate en:** nada llega a la consola como `Uncaught`; los avisos van con `console.warn`.

[[exercise:08-errores-con-nombre.md]]

```text
Sin errores → ✅ compilado y enlazado · uniforms activos: u_color, u_resolution · centro → 225, 29, 72, 255
Listo: elige un error en «Ejemplo», o edita el shader; la vista previa nunca se queda en negro
// Tras elegir, uno a uno, los errores de «Ejemplo»:
🐛 1 en lugar de 1.0 → ⚠️ taller · fragment shader, línea 8: '=' : cannot convert from 'const int' to 'highp float'
   8 │ float glow = 1; // GLSL no convierte int en float
🐛 un uniform mal escrito en GLSL → ⚠️ taller · fragment shader, línea 7: 'u_resolucion' : undeclared identifier
   7 │ vec2 uv = gl_FragCoord.xy / u_resolucion;
🐛 falta un punto y coma → ⚠️ taller · fragment shader, línea 9: 'glow' : syntax error
   9 │ glow -= distance(uv, vec2(0.5)); // más oscuro hacia los bordes
🐛 un vec2 donde va un vec3 → ⚠️ taller · fragment shader, línea 8: '=' : dimension mismatch
   8 │ vec3 glow = vec2(1.0, 0.8);
taller · fragment shader, línea 8: '=' : cannot convert from 'const 2-component vector of float' to 'highp 3-component vector of float'
   8 │ vec3 glow = vec2(1.0, 0.8);
🐛 un in sin su out (enlazado) → ⚠️ taller · al enlazar: FRAGMENT varying v_uv does not match any VERTEX varying
🐛 un uniform mal escrito en JavaScript → ⚠️ taller: el shader no usa el uniform «u_colour» (¿está mal escrito, o el compilador lo eliminó por no usarse?). Uniforms activos: u_color, u_resolution.
🐛 un vec3 con 4 números → ⚠️ taller: «u_color» es FLOAT_VEC3 y espera 3 números; ha recibido 4.
🐛 un uniform que el compilador elimina → ⚠️ taller: el shader no usa el uniform «u_time» (¿está mal escrito, o el compilador lo eliminó por no usarse?). Uniforms activos: u_color, u_resolution.
🐛 pedir WebGL2 a un lienzo que ya es 2D → ⚠️ No se pudo crear un contexto WebGL2 en este lienzo (¿el navegador no tiene WebGL2, o el lienzo ya tiene otro contexto, como '2d'?).
```

Son los errores del Bestiario de las lecciones «Tu primer fragment shader» y «WebGL desde JavaScript», ahora en una herramienta. Los tres de JavaScript son los peligrosos: WebGL no los señala (un `uniform*` con una location `null` no hace nada, sin error), y GLKit sí, porque al crear el programa pregunta a WebGL qué uniforms usa de verdad (`getActiveUniform`) y de qué tipo son. Ordena sus nombres porque el orden de WebGL depende del driver. El último es la regla de «un lienzo, un tipo de contexto»: `getContext('webgl2')` devuelve `null` en un lienzo que ya tiene uno 2D. Al editar el shader a mano, la página compila 500 ms después de la última tecla y tiene en cuenta las líneas en blanco del principio, que GLKit quita con `trim()` para que `#version` quede en la línea 1: el número de línea que ves es el de tu editor.

## Un componente con un shader

**Objetivo:** `<shader-banner>`, un componente web reutilizable con un fondo de shader detrás de su contenido, para los carteles de una agenda cultural. **Técnicas:** Shadow DOM con un `<slot>` (el texto es HTML normal, que se lee, se selecciona y se traduce), un atributo `colors` observado, un fotograma quieto al cargar y una animación de 20 s como máximo con su propio botón, que se para al salir de la vista (`IntersectionObserver` con `root: document`) o al ocultar la página. El contexto WebGL se trata como un recurso: se crea al conectar el elemento y se libera al desconectarlo (`view.destroy()`), y mientras está perdido se ve un degradado de CSS con los mismos colores. **Fíjate en:** «Simular pérdida del contexto» usa la extensión `WEBGL_lose_context`; al recuperarlo, `setup` crea todo de nuevo y `readPixels` confirma que el dibujo es el mismo de antes.

[[exercise:09-componente-shader-banner.md]]

```text
🎨 «Festival de jazz» → WebGL2 · 1 dibujo (fotograma quieto)
🎨 «Feria del libro» → WebGL2 · 1 dibujo (fotograma quieto)
Listo: pulsa ▶ en un cartel, cambia los colores, simula una pérdida del contexto o quita la feria
// Tras pulsar «Simular pérdida del contexto (jazz)»:
⚠️ «Festival de jazz»: contexto perdido → fondo de CSS
✅ «Festival de jazz»: contexto recuperado → programa y búfer creados de nuevo · ¿el mismo dibujo que antes? true
// Tras pulsar «Quitar la feria del libro» y después «Volver a poner la feria»:
🧹 «Feria del libro»: quitada → ¿contexto liberado? true
🎨 «Feria del libro» → WebGL2 · 1 dibujo (fotograma quieto)
// Tras pulsar «▶ Animar» en el cartel del jazz y esperar 20 s:
▶ «Festival de jazz»: animando (20 s como máximo)
⏸ «Festival de jazz»: 20 s, se para solo
```

Al soltar un selector de color, la consola anota los tres colores del cartel; mientras lo arrastras, el atributo cambia y el componente se redibuja una vez por fotograma. Un contexto se pierde de verdad cuando la GPU se reinicia, cuando el sistema la necesita para otra cosa o cuando una página pide demasiados: en ese último caso Chrome quita el más antiguo y puede no devolverlo nunca: el degradado de CSS se queda. Una página con muchos carteles iguales podría compartir un solo contexto y copiar cada dibujo a su lienzo; con dos, uno por cartel es más sencillo.

## Un visor de zoom profundo

**Objetivo:** recorrer el cuadro de Velasco a 960 × 660 como en el visor de un museo: acercar hasta 64 veces, moverse y ver los píxeles. **Técnicas:** la obra es una textura con mipmaps, la misma pirámide de niveles que guardan en disco los visores de imágenes gigantes; la cámara son 3 números (el píxel del centro y el zoom), y el fragment shader convierte cada píxel de la pantalla en uno de la obra; al acercar alrededor del puntero, el píxel de la obra que hay debajo no se mueve; `MAG_FILTER` en `NEAREST` y una rejilla desde 12 píxeles de pantalla por píxel; un minimapa, que es otra pasada del mismo programa en un `gl.viewport` más pequeño del mismo lienzo; una visita guiada que vuela 1 s (el zoom, en escala logarítmica). **Fíjate en:** «El ave»: a ×16, cada pincelada son unos pocos píxeles del archivo.

[[exercise:10-visor-de-zoom-profundo.md]]

```text
obra → 960 × 660 · 10 niveles de mipmap (960 × 660 … 1 × 1) · 2534400 bytes + 844368 de mipmaps (+33 %)
// En el Mac del curso:
MAX_TEXTURE_SIZE → 16384 px por lado: una imagen de 40000 × 30000 px necesitaría 3 × 2 texturas (o teselas)
vista: toda la obra · centro → píxel (480, 330) · zoom ×1
Listo: arrastra, usa Ctrl + rueda o pellizca, el teclado o la visita guiada
// Tras entrar en la obra con Tab y pulsar + dos veces:
vista: zoom ×2 · centro → píxel (480, 330) · se ven 480 × 330 píxeles de la obra
vista: zoom ×4 · centro → píxel (480, 330) · se ven 240 × 165 píxeles de la obra
// Tras pulsar →:
vista: zoom ×4 · centro → píxel (504, 330) · se ven 240 × 165 píxeles de la obra
// Tras pulsar «El ave» y esperar 1 s:
📍 El ave → zoom ×16 · centro → píxel (598, 514) · se ven 60 × 41 píxeles de la obra
```

Los visores de mapas y de escaneos de museo (con imágenes de cientos de megapíxeles) suelen cortar cada nivel en teselas de 256 × 256 y solo piden las que se ven: así ninguna textura pasa de `MAX_TEXTURE_SIZE` y no se descarga lo que no se mira. La idea es la de este visor, con la pirámide en el servidor en lugar de en la GPU. Cada flecha mueve la vista una décima parte de lo que se ve, así que a ×4 son 24 píxeles de la obra; el minimapa aparece en cuanto la vista no muestra la obra entera.

## Un cielo procedural

**Objetivo:** un paisaje que cambia con la hora, hecho solo con un shader de LearnWeb: sin imágenes, sin JavaScript. **Técnicas:** el control `hour` coloca el sol en su arco y mezcla tres degradados (noche, día y atardecer); nubes de ruido fractal (`fbm`, 5 octavas: cada una, el doble de detalle y la mitad de fuerza) que derivan con `u_time`; estrellas que titilan de noche (una celda de cada 300); las siluetas de dos volcanes, con nieve y bruma, como funciones de x; y la precisión elegida con `#ifdef GL_FRAGMENT_PRECISION_HIGH`, porque el ruido hecho con `sin()` necesita `highp`. **Fíjate en:** con ▶, el día avanza una hora cada 20 s (`speed`); prueba `hour` a las 13:00 y a las 22:00, y `clouds` de 0 a 1.

[[exercise:11-cielo-procedural.md]]

En la tarjeta, el fotograma quieto es el atardecer de las 18:30: el sol bajo, a la derecha, sobre la cresta, un cielo cálido cerca del horizonte que se vuelve violeta hacia arriba, y la nieve de las cumbres teñida por el sol. Es un shader barato a propósito: 5 vueltas de bucle por píxel y ninguna textura, para que pueda animarse en el editor sin calentar el portátil.

[[exercise:11-cielo-procedural.md-]]

## Para seguir

Todo lo de esta página está escrito con WebGL 2, que llegó a Chrome y Firefox en 2017 y a Safari en 2021. Sus límites ya han aparecido: un solo hilo que encarga el trabajo a la GPU, un estado global que hay que recordar (`useProgram`, `bindTexture`, el viewport…), errores que se descubren preguntando y nada de cálculo general fuera de los píxeles. El módulo «WebGPU» de este capítulo cambia ese modelo por otro con objetos explícitos, validación con mensajes claros y *compute shaders*, que calculan sin dibujar: el juego de la vida o la cadena de filtros sin fingir que son imágenes. Antes, el módulo «WebAssembly» enseña a llevar al navegador código de otros lenguajes, y a compartir con él la memoria de un `ArrayBuffer`, como ya haces aquí con los búferes de la GPU.

## Para profundizar

- [MDN: buenas prácticas de WebGL (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [MDN: el evento webglcontextlost (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)
- [WebGL2 Fundamentals: dibujar en una textura y procesar imágenes (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl-image-processing-continued.html)
- [The Book of Shaders: ruido fractal (en inglés)](https://thebookofshaders.com/13/)
- [LearnOpenGL: mapas de normales (en inglés)](https://learnopengl.com/Advanced-Lighting/Normal-Mapping)
