# Integración: gráficos en la GPU

## Por qué importa

Las cuatro lecciones del módulo enseñan las piezas por separado: qué hace la GPU y cómo se escribe un fragment shader, el GLSL de las formas y los patrones, la ceremonia de WebGL desde JavaScript (búferes, atributos, uniforms) y las texturas con sus framebuffers. Una página real las usa a la vez. Un editor de fotos es una textura, varios programas y unos controles de formulario convertidos en uniforms; un mapa de calor son datos en un `Float32Array` que acaban en una textura de un canal y una escala de color en un shader; un desenfoque rápido son dos pasadas, con un framebuffer en medio.

Los ejemplos de esta página combinan dos, tres o cuatro lecciones cada uno, y casi todos combinan también algo de los capítulos anteriores: formularios, eventos de teclado y puntero, `requestAnimationFrame`, accesibilidad. Usan los archivos de `assets/`: el cuadro de Velasco, el paisaje de 16 × 12 píxeles de la lección «Texturas y framebuffers» y `assets/webgl/utils.js`, con los ayudantes de las dos últimas lecciones juntos. Dibujan una vez al cargar y vuelven a dibujar solo cuando tocas algo; el único que se anima lo hace al pulsar un botón, durante 4 segundos.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| un cálculo por píxel sobre una imagen | una textura y un fragment shader; un píxel del lienzo por píxel de la imagen | «CPU y GPU», «Texturas y framebuffers» |
| varios efectos sobre lo mismo | un programa por efecto, el mismo VAO (`layout(location = 0)`) y la misma textura | «WebGL desde JavaScript» |
| que un control cambie el dibujo | un uniform; `useProgram` primero, y como mucho un dibujo por fotograma | «WebGL desde JavaScript» |
| datos numéricos en la GPU | un `Float32Array` en una textura `R16F` o `R32F`, o en un búfer | «Float32 y precisión», «Texturas y framebuffers» |
| saber qué ha dibujado la GPU | `readPixels` en la misma tarea que el dibujo | «WebGL desde JavaScript» |
| un efecto que necesita el resultado de otro | un framebuffer con una textura, y la textura como fuente del dibujo siguiente | «Texturas y framebuffers» |
| cambiar unos pocos píxeles de una textura | `texSubImage2D`, no volver a subirla entera | «Texturas y framebuffers» |
| miles de copias de una forma | instancias: `vertexAttribDivisor` y `drawArraysInstanced` | «WebGL desde JavaScript» |
| formas nítidas a cualquier tamaño | funciones de distancia y `smoothstep` en el ancho de un píxel | «Tu primer fragment shader» |

Dos reglas atraviesan la tabla. La primera: **la GPU trabaja por encargo**. Cada página prepara sus recursos una vez (programas, búferes, texturas) y después solo cambia uniforms y dibuja. Nada se compila ni se sube en cada fotograma, y nada se dibuja si no ha cambiado nada. La segunda: **lo que se ve se comprueba**. `readPixels` devuelve los bytes que la GPU escribió de verdad; los ejemplos lo usan para calcular un histograma, para comprobar que un color llegó a la pantalla o para comparar dos formas de hacer el mismo cálculo.

## Ejemplos combinados

### Un estudio de filtros

Una textura con el cuadro, tres fragment shaders (ajustes de brillo, contraste y saturación; duotono; pixelado) y un formulario: los botones de radio eligen el programa y cada control es un uniform. Tras cada dibujo, `readPixels` lee los 158 400 píxeles y JavaScript calcula el histograma de luminancia con el mismo bucle de la lección «Píxeles». El histograma se dibuja en un canvas 2D y se resume en texto, que es lo que lee un lector de pantalla.

[[exercise:01-estudio-de-filtros.md]]

```text
Original: 158400 píxeles · sombras (0-63): 16 % · medios (64-191): 73 % · luces (192-255): 11 % · en 255: 0
Listo: elige un filtro y mueve los controles
// Tras bajar «Contraste» hasta 0 (al soltar el deslizador):
Ajustes (brillo 0, contraste 0, saturación 1): 158400 píxeles · sombras (0-63): 0 % · medios (64-191): 100 % · luces (192-255): 0 % · en 255: 0
```

[[exercise:01-estudio-de-filtros.md-(index.html|script.js)]]

Los porcentajes del original son los de la lección «Píxeles»: la misma foto, decodificada igual por Chrome. Con el contraste a 0, todos los píxeles se vuelven el gris medio y el histograma es una sola barra. Mientras arrastras un deslizador, el evento `input` pide como mucho un dibujo por fotograma con `requestAnimationFrame`; al soltarlo, `change` escribe el resultado en la consola.

### Un mapa de calor

Las visitas a un museo, por día y por hora, del `Float32Array` a una textura de un solo canal en **float16** (`R16F`): 84 números, 168 bytes. El fragment shader convierte cada valor en un color con una escala de cinco paradas. Con `NEAREST` se ven las celdas; con `LINEAR` (los float16 se pueden filtrar), un degradado continuo. La celda elegida con el ratón o con las flechas lleva un marco blanco que dibuja el propio shader, y los números completos están en una tabla.

[[exercise:02-mapa-de-calor.md]]

```text
datos → 7 × 12 = 84 valores · 168 bytes en float16 en la GPU (336 en float32)
máximo → sábado 13:00, 360 visitas · color 254, 243, 199, 255
mínimo → lunes (cerrado), 0 visitas · color 30, 27, 75, 255
Listo: pasa el ratón por el mapa (haz clic para anotar una celda) o usa las flechas
// Tras entrar en el mapa con Tab y pulsar ↑ y ←:
viernes, 13:00 → 288 visitas
viernes, 12:00 → 210 visitas
```

[[exercise:02-mapa-de-calor.md-(index.html|script.js)]]

Fíjate en los dos sistemas de coordenadas: en la textura, la fila 0 es la de abajo (se sube el domingo primero para que el lunes quede arriba); en el puntero, la y de CSS crece hacia abajo. Y en que el máximo sale exactamente con el último color de la escala: 360 cabe exacto en float16 (lección «Float32 y precisión»), y 360 / 360 es exactamente 1.

### Un desenfoque en dos pasadas

Un desenfoque de caja de radio `r` lee (2r + 1)² vecinos por píxel. Pero se puede **separar**: una pasada horizontal escribe en una textura (un framebuffer) y una vertical lee de ella; son 2 · (2r + 1) lecturas, 62 en lugar de 961 con radio 15. Antes de usarlo, el ejemplo lo comprueba: con una imagen de prueba de 9 × 9 píxeles, las dos formas dan los mismos 81 bytes.

[[exercise:03-desenfoque-en-dos-pasadas.md]]

```text
prueba 9 × 9, radio 2 → centro: una pasada 10 · dos pasadas 10
¿los 81 píxeles iguales? true · píxeles no negros: 25
radio 6 → 26 lecturas por píxel en dos pasadas, en lugar de 169 en una
Listo: mueve el deslizador «Radio»
// Tras llevar «Radio» a 15 y soltarlo:
radio 15 → 62 lecturas por píxel en dos pasadas, en lugar de 961 en una
```

[[exercise:03-desenfoque-en-dos-pasadas.md-(script.js)]]

En la prueba, el centro vale 255 / 25 = 10,2, es decir, 10; en dos pasadas, 255 / 5 = 51 y después 51 / 5 = 10,2, otra vez 10. Con una foto, la textura intermedia guarda bytes y algún píxel puede diferir en una unidad; si eso importa, la textura intermedia puede ser de float16. Los desenfoques gaussianos de los editores de fotos y de `filter: blur()` se separan igual.

### Pixel art en la GPU

Un editor de 16 × 16 píxeles cuyo dibujo vive en una textura ampliada con `NEAREST`. La rejilla y el cursor no son píxeles del dibujo: los pinta el fragment shader con `fract`. Cada píxel pintado sube a la GPU con `texSubImage2D`: 4 bytes, no los 1024 de la imagen. Y `readPixels` comprueba que el color llegó a la pantalla. Se pinta con el ratón (o el dedo) y también con el teclado.

[[exercise:04-pixel-art-en-la-gpu.md]]

```text
Listo: 16 × 16 píxeles = 1024 bytes en la GPU; pinta con el ratón, o con las flechas y Espacio
// Tras entrar en el lienzo con Tab y pulsar Espacio:
(0, 0) → cempasúchil · texSubImage2D de 1 × 1 (4 bytes) · en pantalla: 255, 159, 28, 255 ✅
// Tras pulsar 6, → y Espacio:
color: rosa mexicano
(1, 0) → rosa mexicano · texSubImage2D de 1 × 1 (4 bytes) · en pantalla: 228, 0, 124, 255 ✅
```

[[exercise:04-pixel-art-en-la-gpu.md-(script.js)]]

### Confeti con instancias

Una reserva confirmada se celebra con 3000 papelitos. Hay un solo rectángulo de 4 vértices; lo que cambia de un papelito a otro (de dónde sale, su velocidad, su giro y su color) va en un segundo búfer, que avanza **una vez por instancia** gracias a `vertexAttribDivisor(location, 1)`. Un `drawArraysInstanced` por fotograma dibuja los 3000; el vertex shader gira, mueve y deja caer cada uno con `u_time`.

[[exercise:05-confeti-con-instancias.md]]

```text
Listo: 3000 instancias × 32 bytes = 96000 bytes, más 4 vértices de 8 bytes; pulsa «Celebrar»
// Tras pulsar «Celebrar» y esperar 4 s:
🎉 3000 papelitos · 1 drawArraysInstanced por fotograma
🏁 confeti terminado
```

[[exercise:05-confeti-con-instancias.md-(index.html|script.js)]]

Es el paso siguiente de las 10 000 partículas de «WebGL desde JavaScript»: allí cada partícula era un punto; aquí, una forma con varios vértices. La animación sigue las reglas de siempre: empieza con el botón, no se lanza dos veces, dura 4 segundos, se para si ocultas la página y, con «reducir movimiento», enseña un fotograma quieto.

### Una insignia con funciones de distancia

Un formulario para diseñar la insignia de un club: forma, color de relleno y de borde, grosor del borde y radio de las esquinas. Cada control es un uniform de un fragment shader que dibuja con las funciones de distancia de la lección «Tu primer fragment shader». El borde no es otra forma: es la misma distancia desplazada (`d + grosor`). Los `<input type="color">` dan colores hexadecimales que pasan a bytes y a `vec3`, y `readPixels` comprueba el centro y el borde.

[[exercise:06-insignia-sdf.md]]

```text
centro → 225, 29, 72, 255 = #e11d48 ✅ · borde → 254, 243, 199, 255 = #fef3c7 ✅
Listo: cambia la forma, los colores y los grosores
// Tras elegir «Hexágono» en «Forma»:
Hexágono · relleno #e11d48 · borde #fef3c7 (0.04) → centro ✅ · borde ✅
```

[[exercise:06-insignia-sdf.md-(index.html|script.js)]]

### Un cartel animado, solo con un shader

El mismo cuadro, ahora en un shader de LearnWeb (`renderer: shader`): dentro de una tarjeta de esquinas redondeadas con marco y sombra (funciones de distancia), con viñeta, un acercamiento muy lento y un brillo que cruza en diagonal cada 7 segundos (`u_time`), y un foco que sigue al ratón (`u_mouse`). En la tarjeta, el brillo pasa justo por el centro; en el editor, pulsa ▶ y prueba los controles `frameColor`, `corner` y `shine`.

[[exercise:07-cartel-del-museo.md]]

[[exercise:07-cartel-del-museo.md-]]

## Ejercicios

Los cuatro ejercicios se corrigen solos: al cargar, cada comprobación lee píxeles con `readPixels` o pregunta a `gl.getError()`, e imprime `✅` o, en rojo, `❌` con lo esperado y lo obtenido. Al abrirlos, casi todas salen en rojo; las que ya salen en verde comprueban algo que el código de partida hace bien y que tu cambio no debe romper.

### Un círculo que sea redondo

El logotipo de una cafetería sale como una elipse, porque el shader mide en uv sobre un lienzo el doble de ancho que de alto. El trabajo está en el fragment shader del HTML (el JavaScript está bloqueado). Seis comprobaciones; dos miden los radios horizontal y vertical, píxel a píxel.

[[exercise:08-ej-circulo-redondo.md]]

### El stride va en bytes

Dos banderines con posición y color intercalados no se dibujan: `vertexAttribPointer` recibe el stride y el offset contados en floats. Seis comprobaciones: los errores de WebGL, el color de cada banderín y el fondo.

[[exercise:09-ej-stride-en-bytes.md]]

### La textura, al derecho

La postal del pueblo sale con el cielo abajo. Dale la vuelta en JavaScript o en el shader (en uno de los dos). Seis comprobaciones buscan el cielo, la hierba, el sol, el tejado y la puerta donde deben estar.

[[exercise:10-ej-textura-al-derecho.md]]

### Que los uniforms lleguen

La medalla del torneo debería salir violeta, desplazada y ampliada, pero no llega ningún uniform: dos errores, uno en JavaScript y otro en el vertex shader. Seis comprobaciones, una de ellas sobre la location que devuelve `getUniformLocation`.

[[exercise:11-ej-uniforms-que-llegan.md]]
