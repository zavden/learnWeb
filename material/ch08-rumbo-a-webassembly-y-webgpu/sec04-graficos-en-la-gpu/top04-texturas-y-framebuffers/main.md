# Texturas y framebuffers

## Por qué importa

Hasta ahora, los colores de tus dibujos salían de una fórmula o de los vértices. Una **textura** es la otra fuente: una imagen (o cualquier tabla de números) guardada en la memoria de la GPU, que el fragment shader lee con `texture()`. Con texturas se pinta una foto sobre un rectángulo, se hacen los filtros de un editor de imágenes, se guardan paletas, mapas de alturas o los datos de una simulación. Y con un **framebuffer**, la GPU puede dibujar **en** una textura, en lugar de en la pantalla, para usar el resultado en el dibujo siguiente.

Esta lección cierra varias promesas. La de la lección «Píxeles»: la convolución que recorría la imagen con un bucle de JavaScript, ahora en un fragment shader, con los mismos números. La de «Bits y bytes»: por qué WebGL 1 quería texturas con lados potencia de 2. Y la de «ArrayBuffer y vistas»: una textura se puede construir byte a byte con un `Uint8Array`.

Como en la lección anterior, los ejemplos usan WebGL 2 (uno compara con WebGL 1) y comprueban el resultado con `readPixels`.

## Una textura, byte a byte

Una textura se crea como un búfer: `createTexture`, `bindTexture` para que sea «la textura actual», y `texImage2D` para subirle los píxeles. Desde un `Uint8Array`, los bytes van como en un `ImageData` (lección «Píxeles»): 4 por píxel, rojo, verde, azul y alfa, fila a fila. Con una diferencia que conviene grabarse: la **primera fila** de bytes es la de **abajo** de la textura.

[[exercise:01-textura-desde-bytes.md]]

[[exercise:01-textura-desde-bytes.md-(script.js)]]

```text
textura → 8 × 8 píxeles × 4 bytes = 256 bytes
centro → 225, 29, 72, 255 (rojo: el corazón)
esquina de abajo a la izquierda → 15, 23, 42, 255 (el fondo)
```

En el shader, la textura es un `uniform sampler2D`, y `texture(u_texture, uv)` devuelve el color en la posición `uv`, de `(0, 0)` (abajo a la izquierda) a `(1, 1)` (arriba a la derecha), sea cual sea el tamaño de la imagen. Con `texParameteri` se elige **cómo** se lee: qué filtro usar entre píxeles y qué hacer fuera de 0..1. Esos ajustes son de la textura, no del shader:

| Parámetro | Valores | Qué decide |
|---|---|---|
| `TEXTURE_MAG_FILTER` | `NEAREST`, `LINEAR` | el color entre píxeles al **ampliar** |
| `TEXTURE_MIN_FILTER` | lo mismo, o `…_MIPMAP_…` | al **reducir** (el valor por defecto usa mipmaps) |
| `TEXTURE_WRAP_S`, `_T` | `REPEAT`, `MIRRORED_REPEAT`, `CLAMP_TO_EDGE` | qué se lee fuera de 0..1, en horizontal (S) y en vertical (T) |

`texImage2D` acepta muchas fuentes además de bytes: un `ImageData`, un `<img>`, otro `<canvas>`, un fotograma de un `<video>` o un `ImageBitmap` (`createImageBitmap`, que decodifica la imagen fuera del hilo principal y también existe en los workers del módulo siguiente). Con bytes RGB (3 por píxel) hay un detalle que ya conoces: WebGL espera por defecto que cada fila empiece en un múltiplo de 4 bytes, como las filas de un BMP (lección «DataView y endianness»); `gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)` lo desactiva.

> **Desde Python:** una textura es lo que Pillow y numpy llaman una imagen: `np.asarray(Image.open('foto.png').convert('RGBA'))` es un array de forma `(alto, ancho, 4)` y tipo `uint8`, y sus `.tobytes()` son exactamente lo que recibe `texImage2D`. En `moderngl`, `ctx.texture((ancho, alto), 4, datos)` hace la subida. Ojo con la fila 0: numpy la pone arriba, la textura abajo (`np.flipud` las alinea).

## Filtrar: `NEAREST` o `LINEAR`

Cuando una textura se amplía, cada píxel de la pantalla cae entre píxeles de la textura (los *texels*). `NEAREST` toma el más cercano: cuadrados nítidos, lo que quiere el *pixel art*. `LINEAR` mezcla los cuatro vecinos según la distancia (interpolación bilineal): degradados suaves, lo que quiere una foto. El hardware hace esa media ponderada en cada lectura, sin coste extra:

[[exercise:02-nearest-contra-linear.md]]

```text
centro → NEAREST: 225, 29, 72, 255 · LINEAR: 225, 29, 72, 255
borde (u = 0.125) → ¿color intermedio? NEAREST: false · LINEAR: true
```

[[exercise:02-nearest-contra-linear.md-(script.js)]]

Dentro de una zona del mismo color, los dos filtros coinciden; solo en los bordes `LINEAR` inventa colores intermedios. Es lo mismo que decide `image-rendering: pixelated` en CSS, y que `ctx.imageSmoothingEnabled` en el canvas 2D.

## 🐛 Imágenes cabeza abajo

Una imagen guarda su fila de **arriba** la primera; una textura pone su primera fila en `v = 0`, **abajo**. Subida tal cual, una foto sale cabeza abajo. Es la misma historia de la y que sube de la lección «Tu primer fragment shader», ahora con imágenes:

[[exercise:03-imagen-al-reves.md]]

```text
imagen → 16 × 12 píxeles
🐛 sin FLIP_Y, arriba → 22, 163, 74, 255 (hierba)
✅ con FLIP_Y, arriba → 125, 211, 252, 255 (cielo)
```

[[exercise:03-imagen-al-reves.md-(script.js)]]

Hay dos arreglos. `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)` le da la vuelta al subirla (es un ajuste global, que vale para todas las subidas siguientes: devuélvelo a `false` si no lo quieres para las demás). O se invierte `v` al leer, en el shader: `texture(u_texture, vec2(v_uv.x, 1.0 - v_uv.y))`. Elige uno: los dos a la vez la vuelven a dejar cabeza abajo. `createImageBitmap(imagen, { imageOrientation: 'flipY' })` es una tercera forma, al decodificar.

## Fuera de 0..1: repetir, en espejo o estirar

Las coordenadas uv pueden salirse de 0..1: es la forma de repetir un azulejo por una pared o un patrón por un suelo. Lo que se lee fuera lo decide el modo de repetición (*wrap*), uno por cada eje:

[[exercise:04-repetir-espejo-o-borde.md]]

```text
REPEAT          → en u = 1.06: columna 0 · en u = 2.06: columna 0
MIRRORED_REPEAT → en u = 1.06: columna 7 · en u = 2.06: columna 0
CLAMP_TO_EDGE   → en u = 1.06: columna 7 · en u = 2.06: columna 7
```

[[exercise:04-repetir-espejo-o-borde.md-(script.js)]]

`REPEAT` vuelve a empezar, como `fract(uv)`; `MIRRORED_REPEAT` va y viene, y las copias encajan sin costura; `CLAMP_TO_EDGE` repite para siempre el píxel del borde. `REPEAT` es el valor por defecto, y eso tiene consecuencias en WebGL 1, como verás ahora.

> **Desde Python:** son los modos de `np.pad` con los que rellenaste bordes al hacer convoluciones: `mode='wrap'` es `REPEAT`, `'symmetric'` es `MIRRORED_REPEAT` y `'edge'` es `CLAMP_TO_EDGE`.

## 🐛 Texturas que no son potencia de 2

En la lección «Bits y bytes» calculaste la siguiente potencia de 2 de un tamaño de imagen, con una nota: en WebGL 1, las texturas necesitaban lados potencia de 2 (1, 2, 4… 256, 512, 1024) para poder repetirse y tener mipmaps. Aquí está el porqué de aquella nota. Una textura que no cumple lo que su configuración pide está **incompleta**, y una textura incompleta no da ningún error: se lee como negro, `(0, 0, 0, 1)`.

[[exercise:05-potencias-de-dos.md]]

```text
WebGL 1.0, textura de 6 × 5:
  filtro por defecto (pide mipmaps) → 0, 0, 0, 255
  LINEAR + REPEAT → 0, 0, 0, 255
  LINEAR + CLAMP_TO_EDGE → 245, 158, 11, 255
  generateMipmap → INVALID_OPERATION
WebGL 2.0, textura de 6 × 5:
  filtro por defecto (pide mipmaps) → 0, 0, 0, 255
  LINEAR + REPEAT → 245, 158, 11, 255
  LINEAR + CLAMP_TO_EDGE → 245, 158, 11, 255
  generateMipmap → NO_ERROR
```

[[exercise:05-potencias-de-dos.md-(script.js)]]

Hay dos trampas en una. La primera, en **los dos** WebGL: el filtro de reducción por defecto es `NEAREST_MIPMAP_LINEAR`, que necesita mipmaps; si no los generas ni cambias el filtro, la textura sale negra, sea del tamaño que sea. La segunda, solo en **WebGL 1**: una textura que no es potencia de 2 no puede usar `REPEAT` ni mipmaps; con `CLAMP_TO_EDGE` y un filtro sin mipmaps, sí funciona. WebGL 2 quitó esa restricción. Si necesitas WebGL 1 (o quieres mipmaps en cualquier caso con imágenes antiguas), la salida clásica es dibujar la imagen en un canvas del tamaño potencia de 2 siguiente (el `nextPowerOfTwo` de «Bits y bytes») y subir ese canvas.

Los shaders de LearnWeb usan WebGL 1, y por eso sus texturas (`shader_textures`) se suben con `CLAMP_TO_EDGE`, `LINEAR` y sin mipmaps: así funciona cualquier imagen, sea del tamaño que sea, también al revés de lo normal (se suben con `UNPACK_FLIP_Y_WEBGL`, para que `uv = (0, 0)` sea la esquina de abajo a la izquierda de la imagen). Para repetir una imagen en uno de esos shaders, usa `fract(uv)`.

## Mipmaps

Al **reducir** una textura pasa lo contrario que al ampliarla: cada píxel de la pantalla cubre muchos píxeles de la textura, y la GPU solo lee uno (o cuatro, con `LINEAR`). Si la textura tiene detalle fino, el resultado es ruido: dibujos de muaré que no están en la imagen y que parpadean en cuanto algo se mueve. Los **mipmaps** son la solución: copias de la textura a la mitad, a la cuarta parte… hasta 1 × 1 píxel, cada una con la media de la anterior. `gl.generateMipmap` las calcula, y con un filtro `…_MIPMAP_…` la GPU lee de la copia del tamaño adecuado.

[[exercise:06-mipmaps.md]]

```text
textura → 64 × 64 · 7 niveles (64, 32, 16, 8, 4, 2, 1)
memoria → 16384 bytes + 5460 de mipmaps (+33 %)
al fondo, sin mipmaps → ¿píxeles casi crema o casi pizarra? true
al fondo, con mipmaps → ¿píxeles casi crema o casi pizarra? false
```

[[exercise:06-mipmaps.md-(index.html|script.js)]]

Al fondo del suelo de la derecha, las casillas se funden en el gris que sale de mezclar crema y pizarra, que es lo que vería un ojo; en el de la izquierda queda ruido. El precio es un tercio más de memoria: 1/4 + 1/16 + 1/64… se acerca a 1/3. El suelo sale en perspectiva porque el vertex shader da un `w` mayor a los vértices lejanos y la GPU divide entre él, la misma división entre la distancia que viste en «Transformaciones 3D» del capítulo de CSS.

## Varias texturas: las unidades

Un shader puede leer varias texturas a la vez. Cada una se enlaza en una **unidad de textura** (`gl.activeTexture(gl.TEXTURE0 + n)` y después `bindTexture`), y el uniform `sampler2D` no recibe la textura, sino el **número de la unidad**, con `uniform1i`. El ejemplo usa dos: el cuadro de Velasco en la unidad 0 y una paleta de 256 × 1 colores en la unidad 1, para un «mapa de degradado» como el de los editores de fotos:

[[exercise:07-unidades-de-textura.md]]

```text
// En el Mac del curso:
unidades de textura en un fragment shader → 16
u_image → unidad 0 · u_palette → unidad 1 · paleta: 256 × 1 = 1024 bytes
Listo: paleta «noche y cempasúchil»; pulsa «Cambiar paleta»
// Tras pulsar «Cambiar paleta» dos veces:
paleta «océano»
paleta «sepia»
```

[[exercise:07-unidades-de-textura.md-(index.html|script.js)]]

Si te olvidas de los `uniform1i`, los dos samplers valen 0 y leen la misma textura: el dibujo sale raro y no hay ningún error. El botón cambia la paleta con `texSubImage2D`, que reescribe una parte de una textura que ya existe: 1024 bytes, sin volver a subir el cuadro. Es lo que se hace en cada fotograma con un vídeo o con datos que cambian.

## Procesar imágenes en la GPU

Este es el ejemplo para el que se preparaba todo el módulo. La convolución 3 × 3 de la lección «Píxeles» tomaba cada píxel y sus 8 vecinos, los multiplicaba por 9 pesos y los sumaba, con un bucle que recorría la imagen. En la GPU, el fragment shader es ese cálculo para **un** píxel: lee los vecinos desplazando `uv` un píxel de la textura (`1.0 / textureSize(u_image, 0)`; en un shader de LearnWeb, `1.0 / u_resolution` si el lienzo mide lo mismo que la imagen) y los pesos llegan en un uniform `float[9]`. La fila de prueba de aquella lección da los mismos números:

[[exercise:08-convolucion-en-la-gpu.md-(index.html|script.js)]]

```text
fila de prueba → 40, 40, 40, 200, 200
Desenfocar → 40, 40, 93, 147, 200
Enfocar → 40, 40, 0, 255, 200
Bordes → 0, 0, 0, 255, 0
Listo: elige un núcleo
// Tras pulsar «Bordes»:
Bordes: 158400 píxeles × 9 lecturas, en un solo dibujo
```

[[exercise:08-convolucion-en-la-gpu.md]]

Fíjate en lo que **no** hace falta. No hay copia del original (la trampa de «La copia que falta» en «Píxeles»): el shader lee de una textura y escribe en otro sitio, y no puede escribir donde lee. No hay `Math.min`/`Math.max` para los bordes: `CLAMP_TO_EDGE` repite el píxel del borde. Y no hay que recortar a 0-255: la GPU lo hace al escribir, como un `Uint8ClampedArray`.

> **Desde Python:** es `cv2.filter2D(imagen, -1, nucleo)` de OpenCV, o `scipy.ndimage.convolve`: una pasada de un filtro sobre toda la imagen. Cada filtro de OpenCV (`GaussianBlur`, `Sobel`, `resize` con `INTER_NEAREST` o `INTER_LINEAR`, `pyrDown`, que es un nivel de mipmap) es, en la GPU, una pasada de un shader.

## Dibujar en una textura: framebuffers

Un **framebuffer** es un destino de dibujo. El lienzo tiene el suyo; con `createFramebuffer` y `framebufferTexture2D` se crea otro cuyo destino es una textura. Mientras está enlazado (`bindFramebuffer`), todo lo que dibujas va a esa textura, y `readPixels` lee de ella; `bindFramebuffer(gl.FRAMEBUFFER, null)` vuelve al lienzo. `checkFramebufferStatus` dice si la combinación es válida. Después, la textura se usa como cualquier otra en el dibujo siguiente:

[[exercise:09-renderizar-a-una-textura.md]]

```text
framebuffer → FRAMEBUFFER_COMPLETE
1.ª pasada, en la textura de 32 × 32 → centro: 245, 158, 11, 255
dibujar con la misma textura como fuente → INVALID_OPERATION
2.ª pasada, en el lienzo → centro: 245, 158, 11, 255
```

[[exercise:09-renderizar-a-una-textura.md-(index.html|script.js)]]

Dibujar en una textura pequeña y ampliarla con `NEAREST` es el efecto retro del ejemplo, pero la técnica sirve para mucho más: un retrovisor o una cámara de seguridad dentro de un juego (una escena dibujada en una textura que luego se pega en otra), las sombras, y sobre todo las **cadenas de filtros**. Una textura no puede ser a la vez destino y fuente en el mismo dibujo (`INVALID_OPERATION`), así que para encadenar pasadas (desenfocar diez veces, simular calor o un juego de la vida) se usan dos texturas que se turnan: se lee de una y se escribe en la otra, y en la pasada siguiente se cambian los papeles. Es el *ping-pong*. Los shaders de LearnWeb son de una sola pasada; las cadenas de pasadas necesitan JavaScript, como aquí.

## 🐛 Imágenes de otro origen

En la lección «Píxeles», una imagen de otro origen se podía dibujar en un canvas 2D, pero el canvas quedaba «contaminado» y leer sus píxeles lanzaba un `SecurityError`. WebGL es más estricto: ni siquiera deja **subirla**, porque un shader podría leer sus píxeles de mil maneras (y medir cuánto tarda en hacerlo). `texImage2D` lanza el error al instante. La salida es la misma: `crossOrigin = 'anonymous'` antes de `src`, y un servidor que responda con CORS.

[[exercise:10-cors-en-las-texturas.md-(script.js)]]

```text
página: http://localhost:3001 · otro origen: http://127.0.0.1:3001
mismo origen, sin crossOrigin → textura de 16 × 12 subida
🐛 otro origen, sin crossOrigin → SecurityError: Failed to execute 'texImage2D' on 'WebGL2RenderingContext': The image element contains cross-origin data, and may not be loaded.
✅ otro origen, crossOrigin = anonymous → textura de 16 × 12 subida
```

[[exercise:10-cors-en-las-texturas.md]]

Ábrelo con «▶ Run» o en el editor para ver esas tres líneas. En una tarjeta, la página tiene origen `null` y para ella **toda** imagen es de otro origen, también las de la carpeta `assets/`: verás el error con la imagen de la propia lección, y cómo `crossOrigin` lo arregla. Por eso `loadImage` de `assets/webgl/utils.js` pone siempre `crossOrigin = 'anonymous'`: sin él, los ejemplos funcionarían en el editor y fallarían en las tarjetas, igual que una web que funciona en tu máquina y falla cuando las imágenes pasan a un CDN.

## Bestiario

- **La imagen sale cabeza abajo.**
  Síntoma: una foto subida como textura aparece invertida verticalmente.
  Causa: la imagen guarda primero su fila de arriba y la textura la pone en `v = 0`, abajo.
  Solución: `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)` antes de `texImage2D`, o `1.0 - v` en el shader (no los dos).
  → [ver ejemplo](03-imagen-al-reves.md)
- **Una textura que sale negra, sin errores.**
  Síntoma: el dibujo con textura sale negro, `readPixels` da `0, 0, 0, 255`, y la consola no dice nada (DevTools avisa de que la textura «no es renderizable»).
  Causa: la textura está incompleta: el filtro por defecto pide mipmaps que no existen, o, en WebGL 1, una textura que no es potencia de 2 usa `REPEAT` o mipmaps.
  Solución: `TEXTURE_MIN_FILTER` a `LINEAR` (o `generateMipmap`); en WebGL 1 con tamaños cualquiera, además `CLAMP_TO_EDGE`; o redimensiona a potencia de 2.
  → [ver ejemplo](05-potencias-de-dos.md)
- **`INVALID_OPERATION` al dibujar con un framebuffer.**
  Síntoma: el dibujo no aparece y `getError()` da `INVALID_OPERATION` (DevTools habla de un *feedback loop*).
  Causa: la textura en la que se dibuja está también enlazada como fuente del shader.
  Solución: lee de una textura y escribe en otra; para encadenar pasadas, dos texturas que se turnan (ping-pong).
  → [ver ejemplo](09-renderizar-a-una-textura.md)
- **`SecurityError` en `texImage2D`.**
  Síntoma: subir una imagen lanza `The image element contains cross-origin data, and may not be loaded`; a veces solo en producción, o solo en las tarjetas.
  Causa: la imagen es de otro origen y se pidió sin CORS; WebGL no acepta imágenes que el script no podría leer.
  Solución: `img.crossOrigin = 'anonymous'` antes de `src`, y un servidor que responda con `Access-Control-Allow-Origin`.
  → [ver ejemplo](10-cors-en-las-texturas.md)

## Resumen

- Una textura es una imagen en la memoria de la GPU: `texImage2D` desde bytes, un `<img>`, un canvas, un vídeo o un `ImageBitmap`; se lee con `texture(sampler, uv)`, de `(0, 0)` abajo a la izquierda a `(1, 1)`.
- La primera fila subida es la de abajo: `UNPACK_FLIP_Y_WEBGL` (o `1.0 - v`) para las imágenes.
- Filtros: `NEAREST` (nítido) o `LINEAR` (suave) al ampliar; mipmaps (`generateMipmap` + `…_MIPMAP_…`) al reducir, por un 33 % más de memoria.
- Repetición: `REPEAT`, `MIRRORED_REPEAT`, `CLAMP_TO_EDGE`. En WebGL 1, una textura que no es potencia de 2 solo con `CLAMP_TO_EDGE` y sin mipmaps; una textura incompleta se lee negra.
- Varias texturas: una por unidad (`activeTexture`), y cada sampler recibe el número de la unidad con `uniform1i`; `texSubImage2D` actualiza una parte.
- La convolución en la GPU: vecinos a `1 / tamaño` en uv, pesos en un uniform; mismos números que el bucle de la CPU.
- Un framebuffer dibuja en una textura; nunca en la misma que se lee: dos texturas en ping-pong para encadenar pasadas.
- Imágenes de otro origen: `crossOrigin = 'anonymous'` siempre (en las tarjetas, todas lo son).

## Para profundizar

- [MDN: usar texturas en WebGL](https://developer.mozilla.org/es/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL)
- [WebGL2 Fundamentals: texturas (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-textures.html)
- [WebGL2 Fundamentals: procesar imágenes (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl-image-processing.html)
- [WebGL2 Fundamentals: dibujar en una textura (en inglés)](https://webgl2fundamentals.org/webgl/lessons/webgl-render-to-texture.html)
- [MDN: imágenes de otro origen en canvas y WebGL (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
