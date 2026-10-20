# Píxeles

## Por qué importa

En la lección anterior pintaste con órdenes de alto nivel: un rectángulo, un arco, un texto. Pero lo que el canvas guarda de verdad es una **tabla de números**: cuatro por píxel, rojo, verde, azul y opacidad, de 0 a 255. Esta lección abre esa tabla. Con ella se hacen los filtros de un editor de fotos, el cuentagotas que lee un color, la detección de bordes de la visión por computador o el mapa de calor de un museo, píxel a píxel.

También es el **puente** a los dos últimos tramos del curso. Los píxeles llegan en un `Uint8ClampedArray`, el primer **array tipado** que vas a usar: memoria contigua de bytes, el idioma de WebAssembly (capítulo 8, «Datos binarios»). Y al final verás por qué un bucle de JavaScript que recorre 150 000 píxeles uno a uno pierde contra la GPU, que los procesa a miles a la vez: la idea de los shaders del capítulo 8.

## Leer píxeles: `getImageData`

`ctx.getImageData(x, y, ancho, alto)` devuelve una **copia** de los píxeles de ese rectángulo en un objeto `ImageData` con tres propiedades: `width`, `height` y `data`. `data` es una lista plana de números: los píxeles van **fila a fila**, de izquierda a derecha, y cada uno ocupa cuatro posiciones seguidas.

```text
data:  R  G  B  A  R  G  B  A  R  G  B  A  …  R  G  B  A  R  G  B  A  …
       └ (0, 0) ┘  └ (1, 0) ┘  └ (2, 0) ┘     └ (0, 1) ┘  └ (1, 1) ┘
                                              ↑ índice width × 4: empieza la fila 1
```

De ahí sale la fórmula que usarás en toda la lección: el píxel `(x, y)` empieza en el índice **`(y * width + x) * 4`**; su rojo está ahí, el verde en `+ 1`, el azul en `+ 2` y el alfa en `+ 3`.

[[exercise:01-imagedata-y-rgba.md-]]

```text
ImageData → 250 × 50, data con 50000 números
tipo de data → Uint8ClampedArray
píxel (25, 25) → índice 25100 → 225, 29, 72, 255
píxel (60, 10) → índice 10240 → 14, 116, 144, 255
píxel (225, 25) → índice 25900 → 0, 0, 0, 0
#e11d48 → e1 1d 48 → 225, 29, 72
```

La última línea es la promesa de la lección «Color» del capítulo de CSS: cada pareja de un color hexadecimal es un byte, y esos bytes son exactamente los números del píxel. El hueco sin pintar es `0, 0, 0, 0`: negro **transparente**, el valor inicial de todo canvas.

Dos detalles que confunden. `getImageData` trabaja en píxeles del **mapa de bits** y no le afecta la transformación: en un canvas × `devicePixelRatio`, el píxel CSS `(10, 5)` son los píxeles `(20, 10)` a `(21, 11)` en tu Mac, y la imagen completa tiene cuatro veces más números que píxeles CSS. Por eso este ejemplo usa un mapa de bits 1:1. Y la copia es una foto: si después dibujas en el canvas, el `ImageData` no cambia.

> **Desde Python:** con Pillow y NumPy, `np.array(imagen)` tiene forma `(alto, ancho, 4)` y escribes `a[y, x]`. `ImageData.data` es ese mismo bloque de memoria **aplanado** (`a.reshape(-1)`), sin índices de varias dimensiones: la fórmula `(y * width + x) * 4` es lo que NumPy calcula por ti.

## Escribir píxeles: `createImageData` y `putImageData`

`ctx.createImageData(ancho, alto)` crea un `ImageData` vacío (todos los números a 0) para rellenarlo a mano, y `ctx.putImageData(imagen, x, y)` copia sus números al canvas. El ejemplo calcula el color de cada píxel de un mapa de calor a partir de la distancia a dos zonas con mucho público:

[[exercise:02-escribir-pixeles.md]]

`putImageData` no es una orden de dibujo como `fillRect`: **copia los números tal cual**. No mezcla con lo que había (un bloque transparente deja un hueco), y no le afectan ni la transformación, ni `globalAlpha`, ni el recorte. Es lo que quieres cuando el `ImageData` es la imagen entera; para componer capas, dibuja con `drawImage`.

[[exercise:02-escribir-pixeles.md-(script.js)]]

```text
createImageData → 115200 números, ¿todos 0? true
píxel (60, 60), en la entrada → 220, 38, 38, 255
píxel (200, 90), tras poner un bloque transparente → 0, 0, 0, 0
[200, 100, 50, 128] puesto y leído → 199, 100, 50, 128
```

La última línea es una sorpresa pequeña. Por dentro, el navegador guarda cada color **premultiplicado** por su opacidad (rojo × alfa / 255), que es como la GPU mezcla las capas: 200 × 128 / 255 son 100,4, y se guarda 100. Al leerlo, 100 × 255 / 128 da 199,2: el rojo vuelve con una unidad menos. Con píxeles opacos (alfa 255) no pasa nunca; con semitransparentes, cuenta con una diferencia de una unidad.

## `Uint8ClampedArray`: bytes con tope

`data` no es un array normal sino un **array tipado**: una lista de longitud fija en la que cada elemento es un byte, un entero de 0 a 255. Lo que asignas se convierte al guardarse, y el adjetivo *clamped* («con tope») dice cómo: lo que pasa de 255 se queda en 255, lo que baja de 0 se queda en 0, y los decimales se redondean.

[[exercise:03-uint8clampedarray.md-]]

```text
valores → 1.5, 2.5, 0.5, 254.5, 300, -3
Uint8ClampedArray → 2, 2, 0, 254, 255, 0
Uint8Array → 1, 2, 0, 254, 44, 253
Array normal → 285, 89, 132 (285 no cabe en un byte)
Uint8ClampedArray → 255, 89, 132 ✅ el rojo se satura
Uint8Array → 29, 89, 132 🐛 285 da la vuelta a 29: el rojo se vuelve azul oscuro
data[0] += 60 y data[1] -= 40 → 255, 0, 72, 255
```

Fíjate en el redondeo de los empates: `0.5 → 0`, `1.5 → 2`, `2.5 → 2`. No es el `Math.round` de JavaScript (que da 1, 2 y 3) sino el redondeo «al par», el mismo que la función `round()` de Python. Para los píxeles, la consecuencia práctica es que no necesitas `Math.min(255, …)` ni `Math.round(…)`: escribe el resultado del cálculo y el array lo ajusta. Su primo `Uint8Array` trunca y da la vuelta (300 − 256 = 44), un error clásico al procesar imágenes con el tipo equivocado. El capítulo 8 estudia todos los arrays tipados, la memoria que hay debajo y por qué existen.

## Filtros píxel a píxel

El filtro más sencillo mira cada píxel **por separado**: lee su rojo, su verde y su azul y escribe otros. El esqueleto siempre es el mismo bucle, que avanza de 4 en 4 y deja el alfa (`i + 3`) como estaba:

```js
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = filter(data[i], data[i + 1], data[i + 2]);
  data[i] = r; data[i + 1] = g; data[i + 2] = b;
}
```

| Filtro | Cálculo | El rojo `225, 29, 72` queda… |
|---|---|---|
| escala de grises | `y = 0.2126 r + 0.7152 g + 0.0722 b`, y los tres canales a `y` | `74, 74, 74` |
| negativo | `255 − valor` en cada canal | `30, 226, 183` |
| umbral | blanco si `y ≥ 128`, negro si no | `0, 0, 0` |
| más brillo | `valor + 60` (el array satura) | `255, 89, 132` |

La escala de grises **no** es la media de los tres canales. El ojo es mucho más sensible al verde que al azul, y esos pesos (los de la **luminancia** de la norma Rec. 709, la de los monitores sRGB) hacen que un verde y un azul igual de «intensos» den grises distintos, como los vemos. Con la media, el cielo azul de una foto saldría tan claro como la hierba.

[[exercise:04-filtros-pixel-a-pixel.md]]

[[exercise:04-filtros-pixel-a-pixel.md-(script.js)]]

```text
Original: 225, 29, 72 → 225, 29, 72
Escala de grises: 225, 29, 72 → 74, 74, 74
Negativo: 225, 29, 72 → 30, 226, 183
Umbral: 225, 29, 72 → 0, 0, 0
Más brillo: 225, 29, 72 → 255, 89, 132
Listo: elige un filtro
// Tras pulsar «Escala de grises»:
Escala de grises: 158400 píxeles recalculados
```

Tres hábitos del ejemplo. Guarda el `ImageData` **original** y aplica cada filtro sobre una copia (`new ImageData(new Uint8ClampedArray(original.data), ancho, alto)`), para que los filtros no se acumulen y «Original» funcione. Espera a la imagen con `await img.decode()` antes de dibujarla. Y pone `img.crossOrigin = 'anonymous'` antes de `src`, por un motivo que verás al final de la lección.

Si una página lee píxeles a menudo (un cuentagotas que lee en cada `pointermove`, un juego que comprueba colisiones por color), pide el contexto con `canvas.getContext('2d', { willReadFrequently: true })`. Por defecto, Chrome guarda el canvas en la memoria de la GPU, y cada `getImageData` tiene que traerlo de vuelta; con esa opción lo guarda en la memoria normal. En Chrome, después de varias lecturas sin ella, la consola de DevTools muestra un aviso que lo recomienda (la de LearnWeb no lo recibe).

## Vecinos: la convolución 3×3

Hay filtros que no se pueden calcular mirando un píxel solo: desenfocar es mezclar cada píxel con sus vecinos, y un borde es justo un sitio donde un píxel se parece poco a los de al lado. La herramienta general es la **convolución**: para cada píxel, se toman él y sus 8 vecinos, se multiplica cada uno por un peso y se suma. Los 9 pesos forman el **núcleo** (*kernel*):

```text
desenfocar          enfocar             bordes
1/9 1/9 1/9         0  -1   0           -1  -1  -1
1/9 1/9 1/9        -1   5  -1           -1   8  -1
1/9 1/9 1/9         0  -1   0           -1  -1  -1
```

El desenfoque es la media de los 9. El de enfocar suma 1 (5 − 4): donde los vecinos son iguales que el centro deja el color como está, y donde hay diferencias las exagera. El de bordes suma 0: en una zona lisa da 0 (negro), y en un cambio brusco, un valor alto. En los **bordes de la imagen**, al píxel le faltan vecinos; la solución más común (la del ejemplo) es usar el píxel del borde más cercano.

[[exercise:05-convolucion-3x3.md]]

[[exercise:05-convolucion-3x3.md-(script.js)]]

```text
fila de prueba → 40, 40, 40, 200, 200
desenfocar → 40, 40, 93, 147, 200
enfocar → 40, 40, 0, 255, 200
bordes → 0, 0, 0, 255, 0
Listo: elige un núcleo
// Tras pulsar «Bordes»:
Bordes: 1395360 multiplicaciones por canal
```

En la fila de prueba se ve todo: el desenfoque suaviza el escalón (93, 147), el enfoque lo exagera hasta saturar (0 y 255: el «halo» de una foto demasiado enfocada) y el detector de bordes deja negro todo salvo el sitio del cambio. Casi un millón y medio de multiplicaciones por canal para una imagen pequeña: los desenfoques grandes (de 20 píxeles de radio) se hacen con trucos (dos pasadas de una dimensión) o en la GPU.

### La copia que falta

La convolución tiene una trampa: cada píxel nuevo se calcula con los vecinos **originales**. Si escribes el resultado en el mismo array del que lees, cuando llegas a un píxel, sus vecinos de arriba y de la izquierda ya están cambiados, y los mezclas otra vez:

[[exercise:06-convolucion-sin-copia.md]]

[[exercise:06-convolucion-sin-copia.md-(script.js)]]

```text
✅ con copia: un cuadrado de 3 × 3, simétrico
fila 0 →  0  0  0  0  0
fila 1 →  0 10 10 10  0
fila 2 →  0 10 10 10  0
fila 3 →  0 10 10 10  0
fila 4 →  0  0  0  0  0
🐛 en el mismo array: la mancha se arrastra abajo a la derecha
fila 0 →  0  0  0  0  0
fila 1 →  0 10 11 11  1
fila 2 →  1 12 15  4  2
fila 3 →  2  3  4  3  1
fila 4 →  1  1  1  1  1
```

El resultado ya no es simétrico, y llega más lejos que los vecinos inmediatos: cada valor arrastra los anteriores. En la imagen, las letras dejan una estela hacia abajo y a la derecha. La regla, para cualquier cálculo que mire vecinos (convoluciones, el Juego de la vida, simulaciones de calor): **lee de una copia, escribe en otra**.

## Histograma

Un **histograma** cuenta cuántos píxeles hay de cada luminancia: 256 contadores, uno por valor. Es la gráfica que muestran las cámaras y los editores de fotos para saber si una imagen está oscura (todo a la izquierda), quemada (un pico pegado a la derecha) o bien repartida. Calcularlo es un solo recorrido: `bins[Math.round(luma)] += 1`.

[[exercise:07-histograma.md]]

```text
158400 píxeles · sombras (0-63): 16 % · medios (64-191): 73 % · luces (192-255): 11 % · en 255: 0
Listo: pulsa «Más brillo (+60)» y mira cómo se mueve el histograma
// Tras pulsar «Más brillo (+60)»:
158400 píxeles · sombras (0-63): 0 % · medios (64-191): 39 % · luces (192-255): 61 % · en 255: 10911
```

Los porcentajes dependen de cómo el navegador decodifica el JPEG; los de arriba son los de Chrome 155. Con «Más brillo», todo el histograma se desplaza 60 a la derecha y los valores que pasarían de 255 se **amontonan** en 255: son los detalles de las nubes que se han perdido, porque muchos colores distintos son ya el mismo blanco. Las 256 barras se dibujan en un solo trazado (`rect` 256 veces y un `fill()`), y los números están también como texto, que es lo que lee un lector de pantalla.

[[exercise:07-histograma.md-(script.js)]]

## `filter` de CSS, `ctx.filter` y la GPU

No todo filtro necesita un bucle. Hay dos atajos, y no son equivalentes:

- **`filter` de CSS en el elemento** (`canvas { filter: grayscale(1) }`, módulo «Efectos visuales» del capítulo de CSS) cambia cómo se **ve** el canvas en la página. Lo aplica el compositor al pintar; el mapa de bits no cambia. Si el usuario descarga la imagen o tú lees sus píxeles, están en color.
- **`ctx.filter`** acepta las mismas funciones (`'grayscale(1)'`, `'blur(4px)'`, `'contrast(1.5)'`…) y se aplica a lo que **dibujas** después: los píxeles que quedan en el canvas ya están filtrados.

[[exercise:08-filter-de-css-o-del-contexto.md]]

[[exercise:08-filter-de-css-o-del-contexto.md-(script.js)]]

```text
🐛 filter de CSS: se ve gris, pero el píxel (20, 20) es 225, 29, 72
✅ ctx.filter: en el píxel (20, 20), R = G = B → true
```

Para filtrar lo que ya está en un canvas con `ctx.filter`, dibuja ese canvas en otro: `otro.filter = 'blur(3px)'; otro.drawImage(canvas, 0, 0)`. `ctx.filter` funciona en Chrome y Firefox; comprueba en [caniuse.com](https://caniuse.com/mdn-api_canvasrenderingcontext2d_filter) el resto antes de depender de él.

¿Por qué los filtros del navegador son tanto más rápidos que tus bucles? Tu bucle procesa los píxeles **de uno en uno**, en un solo núcleo del procesador. La GPU tiene miles de núcleos pequeños y ejecuta el mismo programa diminuto («dame el color de este píxel») para miles de píxeles **a la vez**. Ese programa se llama *shader*, y lo escribirás tú en el capítulo 8 («Gráficos en la GPU»). Hasta entonces: si existe como función de `filter`, úsala; si necesitas un cálculo propio sobre una imagen grande, el capítulo 8 enseña también a sacarlo del hilo principal con un worker y `OffscreenCanvas`, para que la página no se congele.

## Imágenes de otro origen: el canvas contaminado

En la lección «Orígenes y CORS» viste que una página puede **mostrar** una imagen de otro origen, pero no **leerla**. El canvas es el caso más claro: puedes dibujar con `drawImage` una imagen de cualquier sitio, pero desde ese momento el canvas queda **contaminado** (*tainted*) y `getImageData`, `toDataURL` y `toBlob` lanzan un `SecurityError`. Si no fuera así, cualquier web podría dibujar una imagen privada de otra (la foto de tu perfil en tu banco, que el navegador pide con tus cookies) y leer sus píxeles.

La salida es la misma que con `fetch`: que el servidor de la imagen dé permiso con CORS. En el lado de la página, `img.crossOrigin = 'anonymous'` **antes** de `src` hace que la imagen se pida en modo CORS (con la cabecera `Origin`, sin cookies); si la respuesta trae un `Access-Control-Allow-Origin` que encaja, el canvas no se contamina. Si no lo trae, la imagen ni siquiera carga.

[[exercise:09-canvas-contaminado.md-(script.js)]]

```text
página: http://localhost:3001 · otro origen: http://127.0.0.1:3001
mismo origen → leídos 53760 números
🐛 otro origen, sin crossOrigin → SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.
✅ otro origen, crossOrigin = anonymous → leídos 53760 números
```

Ábrelo con «▶ Run» o en el editor: en una tarjeta solo verás el aviso de que la tarjeta es un iframe aislado. Esas tarjetas tienen origen `null`, así que para ellas **todas** las imágenes son de otro origen. Por eso los ejemplos 04, 05, 07 y 08 ponen `crossOrigin = 'anonymous'` aunque la imagen esté en la carpeta del tema: sin él, funcionarían en el editor y fallarían en las tarjetas. La URL con `?cors` del último caso evita otra trampa real: si la caché guarda la respuesta que llegó sin CORS, una petición posterior con CORS a la misma URL puede reutilizarla y fallar.

## Bestiario

- **El desenfoque se arrastra hacia un lado.**
  Síntoma: un filtro que mira vecinos (desenfoque, bordes, Juego de la vida) da un resultado asimétrico, con estelas hacia abajo y a la derecha.
  Causa: el resultado se escribe en el mismo array que se lee; los vecinos de arriba y de la izquierda ya están cambiados.
  Solución: lee del `ImageData` original y escribe en uno nuevo (`new ImageData(ancho, alto)`).
  → [ver ejemplo](06-convolucion-sin-copia.md)
- **El canvas se ve gris, pero la descarga sale en color.**
  Síntoma: con `filter` de CSS en el canvas todo parece filtrado, pero `getImageData`, `toBlob` o la imagen descargada no lo están.
  Causa: el `filter` de CSS cambia cómo se pinta el elemento en la página, no su mapa de bits.
  Solución: `ctx.filter = '…'` antes de dibujar (o un bucle sobre los píxeles).
  → [ver ejemplo](08-filter-de-css-o-del-contexto.md)
- **`getImageData` lanza `SecurityError: … tainted by cross-origin data`.**
  Síntoma: la imagen se ve en el canvas, pero leer sus píxeles (o `toDataURL`/`toBlob`) lanza un error; a veces solo en producción, o solo en las tarjetas.
  Causa: la imagen es de otro origen y se pidió sin CORS: el canvas queda contaminado.
  Solución: `img.crossOrigin = 'anonymous'` antes de `src`, y un servidor que responda con `Access-Control-Allow-Origin`.
  → [ver ejemplo](09-canvas-contaminado.md)

## Resumen

- `getImageData` copia píxeles a un `ImageData`; `data` tiene 4 números por píxel (R, G, B, A), fila a fila: el píxel `(x, y)` empieza en `(y * width + x) * 4`.
- Trabaja en píxeles del mapa de bits, sin transformación; × `devicePixelRatio` en un canvas de alta densidad.
- `putImageData` copia los números tal cual: reemplaza, sin mezclar ni transformar. Un píxel semitransparente puede volver con una unidad de diferencia (alfa premultiplicado).
- `Uint8ClampedArray` redondea (al par) y satura entre 0 y 255; `Uint8Array` da la vuelta.
- Filtros por píxel (grises con los pesos de la luminancia, negativo, umbral, brillo) y por vecinos (convolución 3×3), siempre sobre una copia del original.
- El `filter` de CSS solo cambia la vista; `ctx.filter` cambia los píxeles y lo calcula el navegador, normalmente en la GPU.
- Una imagen de otro origen contamina el canvas; `crossOrigin = 'anonymous'` + CORS lo evita. En las tarjetas (origen `null`), siempre.

## Para profundizar

- [MDN: Manipulación de píxeles con canvas](https://developer.mozilla.org/es/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas)
- [MDN: ImageData (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)
- [MDN: Uint8ClampedArray (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray)
- [MDN: Allowing cross-origin use of images and canvas (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
- [Setosa: Image Kernels explained visually (en inglés)](https://setosa.io/ev/image-kernels/)
