# Integración: gráficos y animación

## Por qué importa

Las cinco lecciones del módulo enseñan herramientas que en un proyecto real aparecen juntas. Un gráfico de datos se dibuja en canvas o en SVG según lo que necesite, pero siempre con la misma escala y con su tabla al lado. Un editor de fotos lee píxeles **y** responde a deslizadores sin congelar la página. Un efecto de partículas necesita la posición del puntero, un pool y un bucle que se apague solo. Una lista que se reordena necesita FLIP, el foco en su sitio **y** un anuncio que espere a que acabe la animación.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno. Los interactivos imprimen al cargar una línea `Listo: …` con lo que hay que hacer y llevan su propio registro en la página; los que se mueven solo lo hacen después de un clic, tienen pausa y respetan «reducir movimiento». Los que leen una foto la piden con `crossOrigin = 'anonymous'`, así que funcionan también en las tarjetas.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|---|---|---|
| un canvas nítido en pantallas × 2 | mapa de bits = caja × `devicePixelRatio` y `setTransform(dpr, 0, 0, dpr, 0, 0)` | «Canvas 2D» |
| varias formas con su propio color | `beginPath()` antes de cada una; `save()`/`restore()` a pares | «Canvas 2D» |
| saber qué hay bajo el puntero | px CSS × (mapa de bits / caja), y `Path2D` + `isPointInPath` | «Canvas 2D» |
| cambiar una imagen | un bucle sobre una **copia** del `ImageData` original; el original no se toca | «Píxeles» |
| un recálculo caro con un deslizador | uno por frame como mucho: `pending ??= requestAnimationFrame(render)` | «El bucle de animación» |
| movimiento que dé igual en cualquier pantalla | paso fijo con acumulador y tope por frame | «El bucle de animación» |
| muchas partículas sin tirones | un pool, dibujo por lotes y un bucle que se para solo | «El bucle de animación» |
| un gráfico con elementos y tooltips | SVG con `createElementNS`, `<title>` y `getScreenCTM().inverse()` | «SVG con JavaScript» |
| una animación que se controla o se espera | `element.animate()` y `await animation.finished` | «La Web Animations API» |
| animar un cambio de orden | FLIP, cancelando antes las animaciones a medias | «La Web Animations API» |

Y una regla para todo el módulo: lo que se ve en un canvas tiene que existir también como texto (una tabla, una lista, una región `aria-live`), y todo lo que hace el puntero tiene su alternativa con el teclado.

## Ejemplos combinados

### Ventas en canvas y en SVG

Las ventas de una cafetería, dibujadas dos veces a partir del mismo array de barras: una función de escala calcula `x`, `width` y `height` una vez, y dos funciones de dibujo los convierten en órdenes de canvas (con alta densidad) y en elementos SVG (con un `<title>` por barra). La tabla de debajo sale de los mismos datos. Así, cuando cambie el diseño, los dos gráficos no pueden contradecirse.

[[exercise:01-ventas-en-canvas-y-svg.md]]

[[exercise:01-ventas-en-canvas-y-svg.md-(script.js)]]

```text
sábado → $9,200 · barra de 110.4 de alto, en x = 242
canvas: centro de la barra del sábado → rgb(14, 116, 144) = #0e7490
svg: barra del sábado → height 110.4 · sábado: $9,200
```

### Ajustes de foto con deslizadores

Brillo, contraste y escala de grises sobre un cuadro de Velasco, en dos versiones. A la izquierda, un bucle de píxeles que hace las mismas cuentas que las funciones `brightness()`, `contrast()` y `grayscale()` de CSS, en el mismo orden y con tope en cada paso; a la derecha, `filter` de CSS sobre una `<img>`, que solo cambia la vista. Un deslizador manda decenas de eventos `input` por segundo: el ejemplo recalcula la imagen una vez por frame como mucho.

[[exercise:02-ajustes-de-foto.md]]

[[exercise:02-ajustes-de-foto.md-(script.js)]]

```text
225, 29, 72 con brillo 1.2 → 255, 35, 86
… y contraste 1.5 → 255, 0, 66
… y en grises → 59, 59, 59
filtro inicial → brightness(1) contrast(1) grayscale(0)
Listo: mueve los deslizadores y marca «Escala de grises»
```

Al marcar «Escala de grises», la línea de estado dice `brightness(1) contrast(1) grayscale(1)` y las dos versiones se ven iguales. Solo la de la izquierda tiene esos píxeles de verdad: es la que podrías exportar.

### Un estallido donde haces clic

Fuegos artificiales en un canvas: la posición del clic, en px CSS (el canvas dibuja con `setTransform(dpr, …)`), es el centro de un estallido de 60 chispas que salen de un pool de 300 objetos. El bucle arranca con el primer clic y se detiene solo cuando no queda ninguna chispa viva; con «reducir movimiento», cada clic dibuja una imagen quieta del estallido. El canvas recibe el foco con Tab, y Enter lanza un cohete en el centro.

[[exercise:03-estallido-al-hacer-clic.md]]

[[exercise:03-estallido-al-hacer-clic.md-(script.js)]]

```text
tras 0.5 s → 60 chispas vivas
tras 1 s → 45 chispas vivas
tras 1.5 s → 0 chispas vivas
Listo: haz clic en el cielo (o Tab y Enter)
// Tras Tab hasta el cielo y Enter, y esperar a que se apague:
🎆 cohete en (160, 90) · 60 chispas
✨ el cielo vuelve a estar oscuro
```

### Un gráfico de líneas que se dibuja solo

El gráfico de visitantes de un museo, en SVG. «Animar el gráfico» dibuja la línea con la Web Animations API (de `stroke-dashoffset` igual a `getTotalLength()` a 0) y, cuando su promesa `finished` se cumple, hace aparecer los puntos uno tras otro con `delay`. Al pasar el puntero, su posición se convierte al `viewBox` con `getScreenCTM().inverse()` para elegir el mes más cercano; las flechas del teclado hacen lo mismo, y el valor se anuncia en una región `aria-live`.

[[exercise:04-lineas-animadas-con-tooltip.md]]

[[exercise:04-lineas-animadas-con-tooltip.md-(script.js)]]

```text
getTotalLength() coincide con la suma de los tramos → true (337.01)
a mitad → dashoffset = la mitad de la longitud: true
x = 197 en el viewBox → el mes más cercano: julio
Listo: pulsa «Animar el gráfico» y pasa el puntero por la línea
// Tras «Animar el gráfico»:
✅ gráfico animado
// Tras Tab hasta el gráfico y la flecha →:
⌨️ septiembre: 58 mil visitantes
```

`fill: 'backwards'` es el detalle que hace falta en una animación escalonada: durante su `delay`, cada punto ya aplica su primer fotograma (invisible) en lugar de verse quieto hasta que le toque.

### Una lista que se reordena con FLIP

Una lista de reproducción con botones ↑/↓ en cada canción y «Ordenar por duración». FLIP anima cada cambio; antes de medir se cancelan las animaciones que sigan a medias, para que un segundo clic arranque desde donde se ve cada elemento. Mover un elemento del DOM le quita el foco, así que el código lo devuelve al botón pulsado. Y el anuncio para lectores de pantalla espera a que terminen las animaciones con `Promise.allSettled`: si un clic rápido las cancela, su `finished` se rechaza con `AbortError`, y `allSettled` espera igual sin lanzar nada.

[[exercise:05-lista-con-flip.md]]

[[exercise:05-lista-con-flip.md-(script.js)]]

```text
Orden inicial: La Bamba, El Cascabel, Cielito lindo, La Llorona
Listo: sube «Cielito lindo» con ↑ y luego pulsa «Ordenar por duración»
// Tras ↑ en «Cielito lindo»:
«Cielito lindo» ahora es la 2.ª de 4
// Tras «Ordenar por duración»:
Ordenada por duración: La Llorona, El Cascabel, La Bamba, Cielito lindo
```

### Un sprite con paso fijo

Un colibrí animado con una **hoja de sprites**: seis fotogramas dibujados una vez en un canvas aparte (al doble de resolución), de los que `drawImage(hoja, origen…, destino…)` recorta el que toca en cada momento. El estado es solo el tiempo, en milisegundos enteros que avanzan de 10 en 10; el fotograma (10 por segundo) y la posición se deducen de él. Por eso «Paso a paso», la simulación de la consola y el vuelo en vivo dan exactamente lo mismo.

[[exercise:06-sprite-con-paso-fijo.md]]

[[exercise:06-sprite-con-paso-fijo.md-(script.js)]]

```text
hoja de sprites → 576 × 96 px (6 fotogramas de 96)
centro del cuerpo, fotograma 0 → rgb(15, 118, 110)
t = 0.25 s → fotograma 2, x = 40
t = 1 s → fotograma 4, x = 100
t = 4 s → fotograma 4, x = 40
Listo: pulsa «Paso a paso» varias veces, o «Volar»
// Tras pulsar «Paso a paso» tres veces:
t = 0.1 s → fotograma 1, x = 28
t = 0.2 s → fotograma 2, x = 36
t = 0.3 s → fotograma 3, x = 44
```

Las hojas de sprites son la forma clásica de animar personajes en los juegos 2D: una sola imagen que se carga una vez, y un rectángulo de origen que cambia. En un juego de verdad, la hoja sería un PNG de `assets/` dibujado por un artista.

## Ejercicios

Los cuatro ejercicios se corrigen solos: al cargar, cada comprobación imprime `✓` o, en rojo, `✗` con el valor esperado y el obtenido. Al abrirlos, salen casi todas en rojo. Las comprobaciones miran resultados que no dependen de tu pantalla: el color del centro de una línea gruesa, coordenadas calculadas con la caja real del canvas, el estilo calculado de un elemento o los números de un `ImageData` hecho a mano.

### Cuatro rutas, cuatro colores

Un mapa de rutas de autobús en canvas con los dos errores clásicos del contexto: falta `beginPath()` (cada `stroke()` repinta las rutas anteriores con el color nuevo) y la etiqueta girada de cada ruta hace `save()` sin `restore()` (todo lo que viene después se dibuja movido y girado). Cinco comprobaciones.

[[exercise:07-ej-rutas-de-colores.md]]

### ¿Qué atracción hay bajo el puntero?

El plano de una feria dibuja en un mapa de bits de 640 × 320 que se muestra a la mitad. Hay que escribir la conversión de la posición del puntero a píxeles del mapa de bits y la búsqueda de la atracción con `isPointInPath`. Cinco comprobaciones, con posiciones calculadas a partir de la caja real del canvas.

[[exercise:08-ej-del-puntero-al-canvas.md]]

### El aviso que no vuelve

Un aviso se oculta con una animación con `fill: 'forwards'` y, después, no hay forma de volver a mostrarlo. Al terminar la animación hay que pasar su valor final al estilo con `commitStyles()` y quitarla con `cancel()`. Cuatro comprobaciones, que terminan la animación con `finish()` para no esperar.

[[exercise:09-ej-el-aviso-que-no-vuelve.md]]

### Gris y umbral, píxel a píxel

Dos filtros comprobados con píxeles conocidos: la escala de grises de partida usa la media de los canales y modifica la imagen original, y el umbral no hace nada. Seis comprobaciones; las tres versiones del cuadro de Velasco se dibujan con tus funciones.

[[exercise:10-ej-gris-y-umbral.md]]
