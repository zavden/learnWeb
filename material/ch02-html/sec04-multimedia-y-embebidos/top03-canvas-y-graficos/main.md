# Canvas y gráficos

## Por qué importa

En la lección anterior dibujaste con **formas**: cada círculo de un SVG es un elemento que el navegador recuerda y vuelve a dibujar. `<canvas>` funciona al revés: es un rectángulo de **píxeles** en el que un script pinta, y el navegador no recuerda nada más que el color de cada píxel. Así se hacen los juegos, los editores de imagen, los gráficos con miles de puntos, los visores de mapas y, con WebGL y WebGPU, los gráficos 3D.

La API para pintar (`getContext('2d')`) es JavaScript y la estudiarás a fondo en el capítulo 6. Esta lección trata del **elemento**: qué tamaño tiene de verdad, por qué un canvas se ve borroso en una pantalla Retina, qué pasa con su contenido cuando no hay JavaScript y cómo hacerlo accesible. Los scripts de los ejemplos son un adelanto: unas pocas líneas comentadas para que haya algo que ver.

## Un lienzo vacío

Un `<canvas>` en el HTML no muestra nada: es un rectángulo transparente hasta que un script pinta en él. Sus atributos `width` y `height`, **sin unidades**, fijan el tamaño de su **mapa de bits** (*bitmap*), la cuadrícula de píxeles en la que se dibuja. Si faltan, mide 300 × 150. Lo que hay entre `<canvas>` y `</canvas>` es su **contenido alternativo** (más abajo).

[[exercise:01-canvas-minimo.md]]

Para dibujar, el script pide al canvas un **contexto**, el objeto con las órdenes de pintura, y le da instrucciones como a un plóter. Las tres del ejemplo:

```js
const ctx = canvas.getContext('2d');
ctx.fillRect(0, 0, 320, 160);                         // rectángulo relleno: x, y, ancho, alto
ctx.beginPath(); ctx.moveTo(20, 95); ctx.lineTo(300, 95); ctx.stroke(); // una línea
ctx.fillText('Huerto abierto', 20, 70);               // texto con su línea base en (20, 70)
```

Las coordenadas son las mismas que en SVG: el origen `(0, 0)` está arriba a la izquierda y la `y` crece hacia abajo. `'2d'` no es el único contexto posible: `'webgl'`, `'webgl2'` y `'webgpu'` convierten el mismo elemento en una ventana a la tarjeta gráfica, que usarás al final del curso.

## Píxeles, no formas

Una vez pintado, el canvas **olvida** lo que dibujaste: no hay un elemento `circle` al que el CSS pueda dar `:hover` ni que JavaScript pueda mover. Si algo cambia, se borra y se vuelve a pintar todo. Lo único que se puede preguntar es el color de un píxel.

[[exercise:02-canvas-frente-a-svg.md-]]

```text
circle en el SVG → 3
elementos dentro del canvas → 0
píxel (40, 50) del canvas → (4) [14, 116, 144, 255]
```

`[14, 116, 144, 255]` es `#0e7490` en rojo, verde, azul y opacidad, de 0 a 255.

> **Desde Python:** un canvas se parece a una imagen de Pillow o a un array de NumPy de forma `(alto, ancho, 4)`: una matriz de números que pintas y lees, sin objetos dentro. Un SVG se parece más a una lista de objetos `Circle(...)` que alguien redibuja por ti.

| | SVG | Canvas |
|---|---|---|
| Qué guarda | formas (elementos del DOM) | píxeles |
| Al cambiar de tamaño | se redibuja nítido | se estira (borroso) salvo que lo redibujes |
| CSS y eventos por forma | sí | no: un solo elemento |
| Accesibilidad | `<title>`, texto real | hay que añadirla (más abajo) |
| Mejor para | iconos, gráficos con pocos elementos, interfaces | miles de objetos, animación, edición de imagen, juegos, 3D |

## Dos tamaños: el mapa de bits y la caja

Un canvas tiene **dos tamaños** independientes, y esta es la clave de toda la lección:

- **El mapa de bits**: `width` y `height` del HTML (o `canvas.width` y `canvas.height` en JavaScript). Cuántos píxeles hay para pintar.
- **La caja**: el tamaño con el que se muestra en la página, en píxeles CSS. Si el CSS no dice nada, coincide con el mapa de bits.

Cuando no coinciden, el navegador **estira** el mapa de bits para llenar la caja, igual que una foto pequeña ampliada. Por eso dar tamaño a un canvas solo con CSS no funciona: el mapa de bits sigue midiendo 300 × 150 y se deforma para ocupar la caja.

[[exercise:03-canvas-estirado-con-css.md]]

```text
#stretched → mapa de bits 300 × 150, caja 240 × 240
#exact → mapa de bits 240 × 240, caja 240 × 240
```

El círculo de la izquierda sale alargado, porque el mapa de bits se estira 0,8 veces en horizontal y 1,6 en vertical, y la palabra, borrosa y deformada.

## Pantallas Retina y `devicePixelRatio`

Aunque el mapa de bits y la caja midan lo mismo en píxeles CSS, en una pantalla Retina el canvas se ve borroso. Un **píxel CSS** no es un píxel de la pantalla: `window.devicePixelRatio` dice cuántos píxeles físicos hay por cada píxel CSS (1 en una pantalla normal, 2 en una Retina, 3 en muchos móviles). Una caja de 260 × 120 píxeles CSS ocupa 520 × 240 píxeles físicos en una Retina; si su mapa de bits solo tiene 260 × 120, cada píxel del canvas se estira sobre 2 × 2 píxeles de la pantalla.

La solución tiene tres pasos: la caja se fija en CSS, el mapa de bits se multiplica por `devicePixelRatio` y `ctx.scale(ratio, ratio)` permite seguir dibujando en unidades CSS.

```js
const ratio = window.devicePixelRatio;
canvas.width = Math.round(260 * ratio);   // mapa de bits: 520 × 240 en una Retina
canvas.height = Math.round(120 * ratio);
canvas.getContext('2d').scale(ratio, ratio); // el dibujo sigue usando 260 × 120
```

[[exercise:04-borroso-en-retina.md]]

En tu pantalla (Retina, `devicePixelRatio` 2), la etiqueta de la izquierda tiene el texto y las rayas borrosos, y la de la derecha, nítidos. El zoom del navegador también cambia `devicePixelRatio` (al 200 %, una pantalla normal pasa a 2): una aplicación seria vuelve a calcular el mapa de bits cuando cambia. Las imágenes tienen el mismo problema, y por eso existe `srcset` con `2x` (lección de imágenes); el SVG no lo tiene, porque se redibuja.

## Cambiar el tamaño lo borra

Asignar `canvas.width` o `canvas.height` crea un mapa de bits **nuevo**, transparente, y reinicia el contexto: el dibujo desaparece y propiedades como `fillStyle` vuelven a sus valores iniciales. Pasa incluso con el mismo valor (`canvas.width = canvas.width`, un viejo truco para borrar).

[[exercise:05-cambiar-el-tamano-lo-borra.md-]]

```text
Al empezar → fillStyle: #ffffff
❌ width = 300 → dibujo borrado; fillStyle: #000000
✅ width = 240 → redibujado; fillStyle: #ffffff
```

Por eso todo código de canvas que se adapta al tamaño de la ventana tiene la misma estructura: una función que lo dibuja todo, y que se llama de nuevo después de cada cambio de tamaño.

## Contenido alternativo

Lo que escribes dentro de `<canvas>` no se muestra mientras el canvas funciona, pero no es inútil:

- Se muestra si el documento **no puede ejecutar JavaScript** (scripts desactivados, un iframe con `sandbox`) o en un navegador sin `<canvas>`.
- Sigue en el árbol de accesibilidad: un lector de pantalla puede leerlo, y sus enlaces y botones se pueden enfocar con Tab.

[[exercise:06-contenido-alternativo.md]]

El segundo gráfico está dentro de un `<iframe>` con el atributo `sandbox`, que prohíbe los scripts al documento de dentro (lo estudiarás en la lección siguiente). Sin JavaScript, el canvas deja de ser un lienzo y el navegador muestra el párrafo.

## Canvas accesible

Para un lector de pantalla, un canvas sin más es un hueco vacío: sus píxeles no tienen texto. Hay dos maneras de darle uno:

- **Una imagen sencilla** (un logotipo, una ilustración): `role="img"` y un `aria-label` que diga lo que se ve, como el `alt` de una imagen. Con `role="img"`, lo que haya dentro del canvas ya no se lee.
- **Un gráfico con datos**: sin `role`, con los datos en una tabla (o una lista) **dentro** del canvas. No se ve, pero se puede recorrer celda a celda. Aún mejor, si el diseño lo permite: la tabla visible junto al gráfico, para todo el mundo.

[[exercise:07-canvas-accesible.md]]

Compruébalo en DevTools → Elements → pestaña **Accessibility**: el primer canvas aparece como una imagen con su nombre, y el segundo contiene la tabla. Si el canvas es interactivo (un juego, un editor), la accesibilidad es mucho más trabajo: hay que replicar cada control con elementos HTML de verdad. Por eso, para interfaces, se prefiere HTML o SVG.

## Bestiario

- **El dibujo sale deformado y borroso.** Síntoma: los círculos son óvalos y el texto está estirado. Causa: el tamaño del canvas solo está en el CSS; el mapa de bits sigue midiendo 300 × 150 (o lo que digan `width` y `height`) y se estira para llenar la caja. Solución: `width` y `height` del canvas iguales al tamaño de su caja (por `devicePixelRatio`). → [ver ejemplo](03-canvas-estirado-con-css.md)
- **El canvas se ve borroso en una pantalla Retina.** Síntoma: el texto y las líneas finas se ven difuminados en un portátil moderno o un móvil, pero bien en una pantalla antigua. Causa: el mapa de bits mide lo mismo que la caja en píxeles CSS, y cada píxel CSS son 2 × 2 píxeles físicos. Solución: mapa de bits = tamaño CSS × `devicePixelRatio`, y `ctx.scale(ratio, ratio)`. → [ver ejemplo](04-borroso-en-retina.md)
- **El dibujo desaparece al cambiar el tamaño.** Síntoma: tras ajustar `canvas.width` a la ventana, el canvas queda en blanco y los colores vuelven a negro. Causa: asignar `width` o `height` crea un mapa de bits nuevo y reinicia el contexto. Solución: vuelve a dibujarlo todo (y a configurar el contexto) después de cada cambio de tamaño. → [ver ejemplo](05-cambiar-el-tamano-lo-borra.md)

## Resumen

- `<canvas>` es un rectángulo de píxeles vacío; un script lo pinta con un contexto (`getContext('2d')`, adelanto del capítulo 6).
- El canvas solo recuerda píxeles: no hay formas a las que dar CSS o eventos; si algo cambia, se repinta.
- Tiene dos tamaños: el mapa de bits (`width`/`height`, 300 × 150 por defecto) y la caja (CSS). Si no coinciden, se estira.
- En pantallas con `devicePixelRatio` 2, el mapa de bits debe tener el doble de píxeles que la caja, con `ctx.scale(ratio, ratio)`.
- Asignar `width` o `height` borra el dibujo y reinicia el contexto.
- El contenido de dentro se muestra sin JavaScript y lo leen los lectores de pantalla; `role="img"` + `aria-label` para imágenes sencillas, una tabla con los datos para gráficos.

## Para profundizar

- [MDN: `<canvas>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/canvas)
- [MDN: Tutorial de Canvas](https://developer.mozilla.org/es/docs/Web/API/Canvas_API/Tutorial)
- [MDN: `Window.devicePixelRatio`](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
- [web.dev: High DPI Canvas](https://web.dev/articles/canvas-hidipi)
