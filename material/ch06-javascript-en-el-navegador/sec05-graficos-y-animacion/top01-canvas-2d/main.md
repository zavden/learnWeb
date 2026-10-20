# Canvas 2D

## Por qué importa

En el capítulo de HTML conociste el elemento `<canvas>`: un rectángulo de píxeles con dos tamaños (el mapa de bits y la caja), borroso en una pantalla Retina si no multiplicas por `devicePixelRatio`, y vacío hasta que un script pinta en él. Aquellos scripts eran un adelanto de cinco líneas. Esta lección es la API de verdad: el **contexto 2D**, el objeto con el que se dibujan los gráficos de datos, los editores de imagen, los mapas, los juegos y las visualizaciones con miles de puntos que el DOM no aguantaría.

La API es pequeña y muy antigua, y tiene la forma de una máquina de dibujar con **estado**: eliges color, grosor y transformación, y cada orden usa lo que esté elegido en ese momento. De ahí salen casi todas sus sorpresas: líneas que cambian de color al dibujar la siguiente, dibujos que salen girados porque una función olvidó dejar el estado como estaba, o clics que caen lejos del puntero. Las tres tienen su ejemplo en el Bestiario.

## El contexto y los rectángulos

`canvas.getContext('2d')` devuelve el **contexto**, un `CanvasRenderingContext2D`. Siempre el mismo objeto para el mismo canvas: pedirlo dos veces no crea otro. Las órdenes más sencillas son las de rectángulos, que pintan en el momento:

| Método | Qué hace |
|---|---|
| `fillRect(x, y, ancho, alto)` | rellena con `fillStyle` |
| `strokeRect(x, y, ancho, alto)` | pinta el contorno con `strokeStyle` y `lineWidth` |
| `clearRect(x, y, ancho, alto)` | deja los píxeles **transparentes** (no blancos) |

`fillStyle` y `strokeStyle` aceptan cualquier color de CSS (y, como verás, degradados y patrones). El contexto los guarda ya interpretados: si le das `'goldenrod'`, al leerlo devuelve `'#daa520'`.

[[exercise:01-rectangulos-y-contexto.md]]

El ejemplo empieza con la receta de alta densidad del capítulo de HTML, con una mejora: `setTransform(dpr, 0, 0, dpr, 0, 0)` en lugar de `scale(dpr, dpr)`. Hacen lo mismo la primera vez, pero `setTransform` **fija** la escala y `scale` la **multiplica** por la que ya hubiera (más abajo, en «Transformaciones»). Y como la caja mide el 100 % del ancho, cuando cambia la ventana el ejemplo calcula un mapa de bits nuevo y vuelve a dibujar: asignar `canvas.width` borra el dibujo y reinicia todo el contexto, transformación incluida, como viste en aquella lección. Para reaccionar al tamaño de un elemento (y no de la ventana) existe `ResizeObserver`, en el módulo siguiente.

[[exercise:01-rectangulos-y-contexto.md-(script.js)]]

```text
devicePixelRatio → 2
mapa de bits = caja × devicePixelRatio → true
centro del agujero → rgba(0, 0, 0, 0): transparente, se ve la página
fillStyle = 'goldenrod' → #daa520
```

En tu Mac, `devicePixelRatio` es 2; en una pantalla normal, 1. A partir de aquí, todos los ejemplos dibujan en píxeles CSS sobre un mapa de bits × `devicePixelRatio`, con una función `hiDPI()` de diez líneas o con las mismas líneas sueltas.

## Trazados

Todo lo que no es un rectángulo se dibuja con un **trazado** (*path*): una lista de **subtrazados**, cada uno una sucesión de puntos. Se describe primero y se pinta después:

```js
ctx.beginPath();          // vacía el trazado actual
ctx.moveTo(20, 30);       // levanta el lápiz y empieza un subtrazado en (20, 30)
ctx.lineTo(190, 30);      // una recta hasta (190, 30)
ctx.lineTo(190, 90);
ctx.closePath();          // vuelve en línea recta al primer punto del subtrazado
ctx.stroke();             // pinta el contorno de TODO el trazado actual
ctx.fill();               // y/o lo rellena
```

La palabra clave es «todo». `stroke()` y `fill()` no consumen el trazado: lo pintan y lo dejan ahí. Solo `beginPath()` lo vacía. Si te lo saltas, cada línea nueva se **añade** a las anteriores, y cada `stroke()` las vuelve a pintar todas con el color de ese momento:

[[exercise:02-sin-beginpath.md]]

[[exercise:02-sin-beginpath.md-(script.js)]]

```text
🐛 color de la línea 1 → #7c3aed (el de la línea 3)
✅ color de la línea 1 → #dc2626
```

La línea 1 se pintó tres veces: roja, verde y, al final, morada. Además del color, el error cuesta tiempo: con 1000 líneas, el último `stroke()` pinta 1000, y el total crece con el cuadrado. La regla: un `beginPath()` antes de cada forma que tenga su propio estilo.

## Arcos y radianes

`arc(x, y, radio, inicio, fin, antihorario)` añade un arco de circunferencia al trazado. Tres detalles que hay que tener presentes:

- Los ángulos van en **radianes**: una vuelta entera son `2 * Math.PI` (unos 6,28), y de grados a radianes se pasa con `grados * Math.PI / 180`. Pasar `90` en lugar de `Math.PI / 2` pide 90 radianes, más de catorce vueltas, y el arco sale como un círculo completo.
- El ángulo 0 está a las **3 en punto**, y como la `y` crece hacia abajo, los ángulos positivos giran en el **sentido de las agujas del reloj**. Las 12 en punto son `-Math.PI / 2`.
- Si el trazado ya tiene un punto, `arc` traza una recta desde él hasta el principio del arco. Para un sector («quesito»), eso es justo lo que quieres: `moveTo(centro)`, `arc(…)`, `closePath()`.

[[exercise:03-arcos-y-radianes.md]]

[[exercise:03-arcos-y-radianes.md-(script.js)]]

```text
Conchas: de -90° a 72°
Bolillos: de 72° a 180°
Pan de muerto: de 180° a 270°
90° en radianes → 1.5707963267948966
```

El último argumento, `true`, recorre el arco al revés: de 0 a 90° en sentido antihorario son los otros tres cuartos de vuelta. Fíjate también en la lista junto al gráfico: el canvas solo tiene píxeles, y los datos tienen que estar como texto para quien no ve la imagen (lección «Canvas y gráficos» del capítulo de HTML). `aria-labelledby` toma el nombre del canvas de esa lista.

> **Desde Python:** es el mismo convenio que `math.sin` y `math.cos` (radianes) y que Matplotlib con el eje `y` invertido. `math.radians(90)` es `90 * Math.PI / 180`; JavaScript no tiene la función, se escribe la cuenta.

## Texto

`fillText(texto, x, y)` pinta texto con la fuente de `ctx.font` (la sintaxis del atajo `font` de CSS: `'bold 18px system-ui, sans-serif'`). El punto `(x, y)` es un **ancla**, y dos propiedades deciden dónde cae el texto respecto a ella:

- `textAlign`: `'left'`, `'right'`, `'center'`, `'start'` (por defecto: la izquierda en español, la derecha en árabe) o `'end'`.
- `textBaseline`: la línea horizontal que pasa por `y`. Por defecto `'alphabetic'`, la línea en la que se apoyan las letras (la «g» baja de ella); `'middle'` es el centro de las letras, `'top'` y `'bottom'`, sus bordes.

`measureText(texto)` devuelve un objeto `TextMetrics` con el ancho (`width`) que ocuparía el texto con la fuente actual: sirve para dibujar un fondo a la medida, centrar a mano o cortar con «…». El ancho depende de la fuente que haya instalada, así que el ejemplo no lo imprime: solo compara.

[[exercise:04-texto-y-medidas.md]]

[[exercise:04-texto-y-medidas.md-(script.js)]]

```text
por defecto → start · alphabetic
la etiqueta larga es más ancha → true
```

Dos avisos. El texto de un canvas no se puede seleccionar, ni traducir, ni lo lee un lector de pantalla: para interfaces, texto HTML encima del canvas. Y si usas una fuente web, espera a que cargue antes de dibujar o medir (`await document.fonts.load('18px Inter')`), o el canvas usará la de reserva y no se repintará solo cuando llegue la buena.

## Grosor de línea y píxeles

`lineWidth` es el grosor del trazo, y el trazo se **centra** en la línea matemática: una línea de 1 px en `y = 6` va de `5.5` a `6.5`. En un mapa de bits 1:1, eso es medio píxel de la fila 5 y medio de la fila 6, y el suavizado (*antialiasing*) pinta las dos filas a medio gris. La línea sale borrosa y más ancha de lo que pediste.

[[exercise:05-lineas-de-medio-pixel.md]]

[[exercise:05-lineas-de-medio-pixel.md-(script.js)]]

```text
1:1, y = 6 → filas tocadas: 2 · opacas: 0
1:1, y = 14.5 → filas tocadas: 1 · opacas: 1
× 2, y = 6 → filas tocadas: 2 · opacas: 2
```

El viejo truco de sumar `0.5` a las coordenadas de las líneas impares (1, 3, 5 px) solo funciona en un mapa de bits 1:1. Con el mapa de bits × `devicePixelRatio` (la última línea, en tu Mac), 1 px CSS son 2 filas enteras y la línea sale nítida sin trucos; en una pantalla con `devicePixelRatio` 1,5 ninguna receta es perfecta. Las líneas pares (2, 4 px) en coordenadas enteras caen en filas enteras de un mapa de bits 1:1 y de uno × 2.

## Degradados y patrones

`fillStyle` y `strokeStyle` aceptan también un **degradado** o un **patrón**, objetos que crea el contexto:

| Método | Crea… |
|---|---|
| `createLinearGradient(x0, y0, x1, y1)` | a lo largo de la línea entre dos puntos |
| `createRadialGradient(x0, y0, r0, x1, y1, r1)` | entre dos círculos |
| `createConicGradient(ángulo, x, y)` | alrededor de un centro, como `conic-gradient()` de CSS |
| `createPattern(imagen, 'repeat')` | una imagen o un canvas repetido en mosaico |

Los colores se añaden con `addColorStop(posición, color)`, con posiciones de 0 a 1, como las paradas de los degradados de CSS. Hay una diferencia importante con CSS: las coordenadas del degradado son las **del canvas**, no las de la forma que rellenas. Un degradado de `x = 10` a `x = 140` pinta igual cualquier forma que esté en ese tramo; una forma que esté más allá recibe solo el color final.

[[exercise:06-degradados-y-patrones.md]]

```text
centro de la 2.ª barra → rgb(220, 38, 38): el color final, #dc2626
un degradado es un objeto → CanvasGradient
```

Para que cada barra tenga su degradado completo, crea uno por barra con sus coordenadas, o dibújalas con `translate` (más abajo) para que el mismo degradado caiga en el mismo sitio de cada una.

[[exercise:06-degradados-y-patrones.md-(script.js)]]

## El estado: `save()` y `restore()`

Todo lo que eliges en el contexto forma su **estado**: `fillStyle`, `strokeStyle`, `lineWidth`, `font`, `textAlign`, `globalAlpha`, la transformación, el recorte (`clip()`)… `save()` guarda una copia del estado en una **pila** y `restore()` recupera la última. El patrón de cualquier función que dibuja algo con su propio estilo:

```js
function drawSticker(ctx, x, y) {
  ctx.save();          // apila el estado de quien me llamó
  ctx.translate(x, y);
  ctx.fillStyle = '#b91c1c';
  // … dibujar …
  ctx.restore();       // y se lo devuelvo tal cual
}
```

La pila no es mágica: cada `save()` necesita **su** `restore()`. Si una función tiene varias salidas y una se salta el `restore()`, el estado de esa función se queda puesto, y todo lo que se dibuja después sale movido, girado y del color equivocado:

[[exercise:07-save-sin-restore.md]]

[[exercise:07-save-sin-restore.md-(script.js)]]

```text
🐛 al terminar: ¿transformación como al empezar? false · fillStyle #b91c1c
✅ al terminar: ¿transformación como al empezar? true · fillStyle #000000
```

Una forma robusta de no olvidarlo es `try { … } finally { ctx.restore(); }`, que se ejecuta salga como salga la función (lección «Errores y excepciones» del capítulo de JavaScript). `restore()` de más, sin un `save()` pendiente, no hace nada; un `save()` de más va dejando estados en la pila.

## Transformaciones

`translate(dx, dy)`, `rotate(radianes)` y `scale(sx, sy)` no mueven lo ya dibujado: cambian el **sistema de coordenadas** para lo que dibujes después. Por dentro, el contexto guarda una matriz (la `matrix()` que viste en las transformaciones de CSS) y cada llamada la **multiplica**. Por eso:

- **El orden importa.** `translate` y luego `rotate` gira la forma en su sitio; `rotate` y luego `translate` gira primero los ejes, y «200 a la derecha» pasa a ser una diagonal.
- **Se acumulan.** `ctx.scale(2, 2)` dos veces es una escala de 4. El error típico: llamar a `scale(dpr, dpr)` en una función de dibujo que se ejecuta muchas veces, y ver el dibujo duplicar su tamaño en cada redibujado.
- **Para girar alrededor de un punto**: `translate(centro)`, `rotate(ángulo)`, y dibujar alrededor del nuevo origen. Así se dibujan las marcas de un reloj sin trigonometría.

[[exercise:08-orden-de-las-transformaciones.md]]

[[exercise:08-orden-de-las-transformaciones.md-(script.js)]]

```text
translate(100, 0) y luego rotate 90° → (100, 10)
rotate 90° y luego translate(100, 0) → (0, 110)
al empezar → a = 2
tras otro scale(dpr) → a = 4
tras setTransform → a = 2
tras resetTransform → a = 1
```

`getTransform()` devuelve la matriz como un `DOMMatrix` (`a` y `d` son las escalas; `e` y `f`, el desplazamiento), el mismo tipo que usa el resto de la plataforma; ojo, que su método `rotate()` usa grados, y el del canvas, radianes. `setTransform(a, b, c, d, e, f)` **reemplaza** la matriz entera, y `resetTransform()` la deja en la identidad, lo que en un canvas de alta densidad también borra la escala × `devicePixelRatio`: para «volver al principio», `setTransform(dpr, 0, 0, dpr, 0, 0)`.

## Formas que se pueden tocar: `Path2D`

Un canvas no recuerda formas, solo píxeles. Si quieres saber qué hay bajo el puntero, tienes que guardarlas tú. `Path2D` es un trazado en un objeto: tiene los mismos métodos (`moveTo`, `lineTo`, `arc`, `rect`, `roundRect`…), se pinta con `ctx.fill(path)` y `ctx.stroke(path)` sin volver a describirlo, y se puede preguntar con `ctx.isPointInPath(path, x, y)` si un punto cae dentro (o `isPointInStroke`, sobre el contorno).

[[exercise:09-path2d-y-clics.md]]

Un detalle que el ejemplo enseña en la consola: `isPointInPath` aplica la transformación actual a la **forma**, pero el punto lo toma tal cual, en píxeles del **mapa de bits**. Con la escala × `devicePixelRatio`, un punto en píxeles CSS hay que multiplicarlo antes:

[[exercise:09-path2d-y-clics.md-(script.js)]]

```text
centro de Tacos (70, 135) sin × dpr → false
centro de Tacos × dpr → true
Listo: haz clic en un puesto del plano (o usa los botones)
// Tras hacer clic en el círculo de los tacos y pulsar el botón «Café»:
clic en (70, 135) → Tacos
botón → Café
```

En tu Mac, el primer resultado es `false`: el punto (70, 135) del mapa de bits es el `(35, 67.5)` en píxeles CSS, fuera del círculo. Y fíjate en los botones: un plano en el que solo se puede elegir con el ratón no es accesible. Cada acción del canvas necesita su control HTML de verdad.

## Del puntero al canvas

Los eventos de puntero dan la posición en píxeles CSS (`clientX` menos el borde izquierdo de `getBoundingClientRect()`, lección «Teclado, ratón y puntero»). Que eso sirva o no como coordenada del canvas depende de cómo dibujes:

- Si dibujas en píxeles CSS (con `setTransform(dpr, …)`, como en esta lección), la posición CSS **es** tu coordenada.
- Si dibujas en las coordenadas del mapa de bits (un juego con resolución fija de 800 × 400, mostrado al tamaño que dé el CSS), hay que **convertir**: `x = cssX * canvas.width / caja.width`.

Olvidar la conversión es un error muy frecuente, porque mientras la caja mide lo mismo que el mapa de bits todo funciona. En cuanto el CSS lo cambia, el clic cae lejos:

[[exercise:10-puntero-sin-escalar.md]]

[[exercise:10-puntero-sin-escalar.md-(script.js)]]

```text
mapa de bits 800 × 400 · caja 320 × 160 px CSS → × 2.5
Listo: haz clic en una plaza de cada plano
// Tras hacer clic en el centro de la plaza B6 de cada plano (los números varían un poco):
🐛 clic en (220, 130) px CSS → marca en (220, 130) del mapa de bits
✅ clic en (220, 130) px CSS → marca en (550, 325) del mapa de bits
```

En el plano 🐛, la marca aparece a 2,5 veces menos distancia de la esquina: en A3 en lugar de B6. `event.offsetX` tiene el mismo problema (también va en píxeles CSS), y además se mide desde el borde del relleno, así que con un borde en el canvas se desvía unos píxeles más.

## Bestiario

- **Todas las líneas salen del color de la última.**
  Síntoma: dibujas varias formas con colores distintos y todas acaban del último color; con muchas, el dibujo se vuelve lento.
  Causa: sin `beginPath()`, cada forma se añade al trazado actual y cada `stroke()`/`fill()` repinta todos los subtrazados con el estilo de ese momento.
  Solución: `beginPath()` antes de cada forma con estilo propio (o un `Path2D` por forma).
  → [ver ejemplo](02-sin-beginpath.md)
- **Después de una función, todo sale girado, movido o de otro color.**
  Síntoma: lo que se dibuja tras llamar a cierta función aparece desplazado, inclinado o con el color de esa función; a veces, fuera del canvas.
  Causa: la función hizo `save()` y salió (un `return` temprano, una excepción) sin su `restore()`: su estado se quedó puesto.
  Solución: un `restore()` por cada salida, o `try { … } finally { ctx.restore(); }`.
  → [ver ejemplo](07-save-sin-restore.md)
- **El clic cae lejos del puntero.**
  Síntoma: al hacer clic, la marca o la selección aparece desplazada hacia la esquina (o más lejos), y el error crece con la distancia al origen.
  Causa: la posición del puntero (en px CSS) se usó como coordenada del mapa de bits, que tiene otro tamaño.
  Solución: multiplica por `canvas.width / caja.width` (y lo mismo en vertical), o dibuja en píxeles CSS con `setTransform(dpr, …)`.
  → [ver ejemplo](10-puntero-sin-escalar.md)

## Resumen

- `getContext('2d')` da el contexto: rectángulos (`fillRect`, `strokeRect`, `clearRect`) y trazados (`beginPath`, `moveTo`, `lineTo`, `arc`, `closePath`, `fill`, `stroke`).
- `beginPath()` vacía el trazado; sin él, cada `stroke()` repinta todo lo anterior.
- `arc` usa radianes, desde las 3 en punto y en el sentido de las agujas del reloj.
- `fillText` se ancla con `textAlign` y `textBaseline`; `measureText` mide con la fuente actual.
- El trazo se centra en la línea: 1 px en coordenadas enteras se reparte en dos filas de un mapa de bits 1:1.
- Degradados y patrones van en `fillStyle`; sus coordenadas son las del canvas.
- `save()`/`restore()` forman una pila: siempre a pares. Las transformaciones se acumulan y su orden importa; `setTransform` las fija.
- `Path2D` + `isPointInPath` (con el punto en píxeles del mapa de bits) para saber qué hay bajo el puntero; la posición del puntero se convierte con la proporción entre el mapa de bits y la caja.

## Para profundizar

- [MDN: Tutorial de Canvas](https://developer.mozilla.org/es/docs/Web/API/Canvas_API/Tutorial)
- [MDN: CanvasRenderingContext2D (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [MDN: Path2D (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Path2D)
- [web.dev: Optimizing canvas (en inglés)](https://web.dev/articles/canvas-performance)
- [HTML Living Standard: el elemento canvas (en inglés)](https://html.spec.whatwg.org/multipage/canvas.html)
