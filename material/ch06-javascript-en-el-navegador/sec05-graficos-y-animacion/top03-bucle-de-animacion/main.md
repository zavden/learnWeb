# El bucle de animación

## Por qué importa

En la lección «Frames de animación y tiempo» del capítulo de JavaScript aprendiste las piezas: `requestAnimationFrame` llama a tu función antes de cada pintado, las posiciones se calculan con el tiempo (delta time) y no con el número de frames, y al volver de una pestaña oculta hay que limitar el delta. Aquella lección prometía «un bucle de animación completo con física y partículas en `canvas`». Es esta.

Un **bucle de animación** es el corazón de un juego, de una simulación o de una visualización que cambia sola: en cada frame, **actualiza** el estado del mundo según el tiempo que ha pasado y lo **dibuja**. La idea cabe en diez líneas, pero un bucle de verdad tiene que responder a más preguntas: cómo se para y se reanuda sin saltos, cómo hacer que la física dé lo mismo en una pantalla de 30 Hz y en una de 144, cómo mover cientos de partículas sin que el recolector de basura dé tirones, y cómo no lanzar dos bucles a la vez.

Una regla de este módulo, por respeto a quien lo lee en un portátil sin ventilador o con «reducir movimiento» activado: ningún bucle empieza solo. Todos arrancan con un botón, tienen pausa, se detienen solos cuando no queda nada que mover y se pausan cuando la pestaña se oculta.

## La anatomía de un bucle

Un bucle bien organizado separa tres cosas: el **estado** (los números que describen el mundo: un ángulo, posiciones, velocidades), **`update(dt)`**, que cambia el estado según el tiempo transcurrido, y **`draw()`**, que pinta el estado sin cambiarlo. La función que se pasa a `requestAnimationFrame` solo las coordina:

```js
function frame(now) {
  const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1); // segundos, con tope
  previous = now;
  update(dt);
  draw();
  frameId = requestAnimationFrame(frame);   // el bucle: pide el siguiente
}
```

Para parar, `cancelAnimationFrame(frameId)` cancela el frame que ya estaba pedido. Para reanudar, `previous = null`: si no, el primer `dt` contaría todo el tiempo en pausa y la animación saltaría. `frameId === null` sirve de paso para saber si el bucle está en marcha.

[[exercise:01-bucle-con-pausa.md]]

[[exercise:01-bucle-con-pausa.md-(script.js)]]

```text
tras 54 frames (0.9 s) → 180°
tras 108 frames (1.8 s) → 0°
Listo: pulsa «Reproducir»
// Tras pulsar «Reproducir» y luego «Pausa»:
▶ girando
⏸ en pausa (botón)
```

Separar `update` de `draw` tiene una ventaja que el ejemplo aprovecha: `advance` es una función pura, que se puede ejecutar sin pantalla, 54 veces seguidas con `dt = 1/60`, para comprobar que a 33⅓ vueltas por minuto el disco da media vuelta en 0,9 s. Así comprobarás la física de todos los ejemplos de esta lección: con números exactos en la consola, que no dependen de cuántos frames dibuje tu pantalla.

El ejemplo se pausa también cuando la pestaña se oculta, con el evento `visibilitychange` de `document` y la propiedad `document.hidden` (la API Page Visibility, en el módulo siguiente). rAF ya deja de llamar en una pestaña oculta, pero pausar a propósito deja el estado coherente (el botón dice «Reproducir») y evita el salto al volver.

## Paso fijo: que la física no dependa de la pantalla

Con delta time, un objeto que se mueve a velocidad constante recorre lo mismo a 60 que a 120 Hz: `x += velocidad * dt` es exacto se divida el tiempo como se divida. Con **aceleración** ya no: la gravedad cambia la velocidad en cada paso, y el resultado depende de cuántos pasos hayas dado. En una caída de un segundo, la diferencia entre una pantalla de 30 Hz y una de 144 Hz son 13 px; en un juego, es una pelota que salta por encima de un muro en un ordenador y no en otro, o una partida grabada que no se puede repetir.

La solución clásica es el **paso fijo** (*fixed timestep*): la física avanza siempre en pasos del mismo tamaño (aquí 10 ms), y cada frame aporta su tiempo a un **acumulador** del que se gastan tantos pasos como quepan. Un frame de 33 ms da 3 pasos y guarda 3 ms; uno de 7 ms no da ninguno y los guarda para el siguiente.

```js
accumulator += now - previous;           // ms de este frame
while (accumulator >= STEP_MS) {         // 0, 1, 2… pasos
  state = step(state, STEP_MS / 1000);
  accumulator -= STEP_MS;
}
draw(state);
```

[[exercise:02-paso-fijo.md-]]

```text
30 Hz → dt del frame: 506.3 px · ✅ paso fijo: 494.9 px
60 Hz → dt del frame: 498.2 px · ✅ paso fijo: 494.9 px
120 Hz → dt del frame: 494.1 px · ✅ paso fijo: 494.9 px
144 Hz → dt del frame: 493.4 px · ✅ paso fijo: 494.9 px
la fórmula de la física (½ · g · t²) → 490 px
```

El paso fijo no da el resultado «exacto» de la fórmula (con pasos de 10 ms, 494,9 px en lugar de 490), sino **el mismo** en cualquier pantalla. Con pasos más pequeños se acerca más, a cambio de más cálculo. El simulador lo hace con instantes en milisegundos enteros para que las cuentas den exactas; en el navegador, los instantes de rAF tienen decimales y a veces el acumulador se queda a una milésima de un paso, que se da en el frame siguiente.

Un detalle para animaciones muy suaves: lo que queda en el acumulador es una fracción de paso que todavía no se ha simulado. Los motores de juegos guardan el estado anterior y dibujan una mezcla de los dos, con `alpha = accumulator / STEP_MS`: es la **interpolación** del dibujo, que evita un ligero temblor cuando la frecuencia de la pantalla y la del paso no encajan.

### El salto al volver de otra pestaña

El acumulador tiene su propia versión del salto que viste en la lección de animation frames. Si la pestaña estuvo oculta 5 s, el primer frame al volver mete 5000 ms en el acumulador, y el bucle `while` da 500 pasos seguidos antes de pintar nada:

[[exercise:03-salto-tras-ocultar-la-pestana.md-]]

```text
🐛 sin tope → el frame más largo dio 500 pasos · la caja saltó 600 px
✅ como mucho 100 ms por frame → el frame más largo dio 10 pasos · la caja saltó 12 px
```

Con una física sencilla, 500 pasos son un instante y lo que ves es un salto: la caja aparece 600 px más allá. Con una física pesada, es peor: si dar los pasos de un frame tarda más que el propio frame, el siguiente trae aún más tiempo acumulado, y la página se hunde en la **espiral de la muerte**. Las dos defensas se combinan: un tope al tiempo de cada frame (`Math.min(now - previous, 100)`), y pausar el bucle con `visibilitychange` poniendo `previous = null` al reanudar.

## Física sencilla

Con el paso fijo resuelto, la física de un juego sencillo son cuatro reglas que se aplican en cada paso:

1. **La gravedad cambia la velocidad**: `vy += g * dt`.
2. **La velocidad cambia la posición**: `x += vx * dt; y += vy * dt`. En este orden (primero la velocidad, después la posición con la velocidad nueva) el método se llama Euler **semiimplícito**, y es mucho más estable que al revés.
3. **Colisiones**: si en este paso la pelota ha atravesado el suelo, se la devuelve encima y se invierte su velocidad vertical, multiplicada por un **coeficiente de restitución** (0,7: conserva el 70 %). Si el rebote es minúsculo, se deja en 0: si no, la pelota vibraría para siempre.
4. **Rozamiento**: en cada bote, la velocidad horizontal pierde una parte (se queda en el 80 %).

[[exercise:04-gravedad-y-rebote.md]]

[[exercise:04-gravedad-y-rebote.md-(script.js)]]

```text
alturas de los botes → 71, 35, 17, 8, 3, 1 px
se para a los 2.72 s, en x = 281 px
Listo: pulsa «Lanzar»
// Tras pulsar «Lanzar» y esperar unos 3 s:
🏁 la pelota se ha parado
```

Cada bote sube aproximadamente la mitad que el anterior: la altura depende del cuadrado de la velocidad, y 0,7² = 0,49. El bucle comprueba en cada frame si la pelota está quieta y, cuando lo está, **no pide otro frame**: la animación termina sola y la CPU descansa. Con «reducir movimiento» activado en el sistema, el botón no anima nada: dibuja la trayectoria entera, quieta, con la misma función `step`. `matchMedia` (la versión en JavaScript de `@media`) llega en el módulo siguiente; aquí basta con saber que `.matches` dice si la media query se cumple.

> **Desde Python:** es el bucle de `pygame` (`dt = clock.tick(60) / 1000`, actualizar, dibujar, `pygame.display.flip()`), con una diferencia: en el navegador no escribes el `while True`. El navegador llama a tu función en cada frame, y el bucle «existe» mientras tu función pida el siguiente.

## Partículas sin crear objetos

Un efecto de partículas (confeti, chispas, humo, nieve) son cientos de objetos pequeños con posición, velocidad y vida, que nacen, se mueven unos segundos y desaparecen. La forma ingenua es crear un objeto por partícula (`particles.push({ … })`) y quitar los muertos con `filter`. Funciona, pero cada frame crea y tira objetos, y el **recolector de basura** (el *garbage collector*, que libera la memoria que ya nadie usa) acaba parando el programa unos milisegundos para limpiar: un tirón visible en mitad de la animación.

La alternativa es un **pool** (una «reserva»): todos los objetos se crean una vez, al empezar, y una partícula que muere solo se marca como libre (`active = false`) para reutilizarla en la siguiente explosión. Durante la animación no se crea nada. El ejemplo añade dos técnicas más: un generador de números aleatorios **con semilla** (mulberry32), que da siempre la misma secuencia para la misma semilla y hace la simulación reproducible, y el **dibujo por lotes**: un trazado y un `fill()` por color, en lugar de uno por partícula.

[[exercise:05-particulas-con-pool.md]]

[[exercise:05-particulas-con-pool.md-(script.js)]]

```text
tras 0.5 s → 80 vivas
tras 1 s → 80 vivas
tras 1.5 s → 44 vivas
tras 2 s → 0 vivas
objetos creados: 200, todos al empezar (0 durante la animación)
Listo: pulsa «Confirmar pedido»
// Tras pulsar «Confirmar pedido» y esperar unos 2 s:
🎉 confeti terminado
```

`Math.random()` no admite semilla: cada recarga da otra secuencia, que está bien para el efecto en vivo pero no para comprobar números. Por eso la simulación usa `mulberry32(2026)` y el confeti real `mulberry32(Date.now())`. El dibujo por lotes cuenta porque cada `fill()` es un encargo al motor gráfico: con 200 partículas, 5 encargos por frame en lugar de 200. El capítulo 8 vuelve sobre la memoria y el recolector de basura («Rendimiento»), y lleva esta misma idea a la GPU, donde se dibujan miles de partículas en un solo encargo.

## Borrar o dejar estela

Cada frame empieza decidiendo qué hacer con el anterior. Lo normal es **borrarlo** con `clearRect` y pintar el mundo entero otra vez: el canvas no recuerda formas (lección «Canvas 2D»), así que repintarlo todo es lo esperado. Pero si en lugar de borrar pintas encima un rectángulo del color del fondo **con poca opacidad**, lo de los frames anteriores no desaparece: se va apagando, y los objetos dejan una **estela**.

[[exercise:06-borrar-o-dejar-estela.md]]

```text
hace 5 frames → queda un 44 %
hace 10 frames → queda un 20 %
hace 20 frames → queda un 4 %
Listo: pulsa «Empezar» y cambia el modo
// Tras pulsar «Empezar» y «Pausa»:
▶ en órbita
⏸ en pausa
```

Con un 15 % de fondo por frame, lo pintado hace 20 frames conserva un 4 %: la estela dura unos 20 frames, un tercio de segundo a 60 Hz (y la mitad de tiempo a 120 Hz: es un efecto por frame, no por tiempo). Lo que no forma parte de la estela, como el planeta, se repinta entero en cada frame. Por el redondeo a bytes de cada píxel, a veces queda un rastro muy tenue que no termina de irse: si molesta, un `clearRect` de vez en cuando lo limpia.

[[exercise:06-borrar-o-dejar-estela.md-(script.js)]]

## Detener el bucle

Hay tres formas de parar un bucle, y un bucle de verdad suele usar las tres:

- **No pedir el siguiente frame**: cuando la animación termina sola (la pelota quieta, sin partículas vivas).
- **`cancelAnimationFrame(frameId)`**: para cancelar desde fuera un frame ya pedido.
- **Una señal**: el mismo `AbortController` que cancela un `fetch` (lección «Combinadores y cancelación»). La ventaja es que una sola llamada a `abort()` cancela el frame pendiente **y** quita todos los listeners que el bucle registró con `{ signal }`, y que `AbortSignal.any([señal, AbortSignal.timeout(15000)])` le pone un plazo máximo sin más código.

[[exercise:07-detener-con-una-senal.md-(script.js)]]

```text
al abortar → aborted: true · motivo: AbortError
resize después de abortar → el listener se ejecutó 0 veces
Listo: pulsa «Empezar»
frames del bucle cancelado → 0
// Tras pulsar «Empezar» y «Parar»:
▶ sonando
⏹ detenido (AbortError)
// Tras pulsar «Empezar» y esperar 15 s sin tocar nada:
▶ sonando
⏹ detenido (TimeoutError)
```

El motivo dice quién lo paró: `AbortError` es el `abort()` del botón (o de ocultar la pestaña) y `TimeoutError`, el plazo. `AbortSignal.any` existe en Chrome desde la versión 116 (2023) y en los navegadores actuales.

[[exercise:07-detener-con-una-senal.md]]

### Dos bucles a la vez

El error más común con los bucles no está en el bucle, sino en el botón que lo arranca. Si «Empezar» no comprueba que ya hay uno en marcha, un segundo clic lanza **otra cadena** de frames: las dos actualizan el mismo estado (la animación va al doble de velocidad) y se pisan la variable `frameId`, así que «Parar» cancela una y la otra sigue.

[[exercise:08-dos-bucles-a-la-vez.md]]

[[exercise:08-dos-bucles-a-la-vez.md-(script.js)]]

```text
Listo: en cada descarga, pulsa «Empezar» dos veces y luego «Parar»
// Tras pulsar «Empezar» dos veces y «Parar» en la descarga 🐛 (la barra sigue, y termina sola):
🐛 ▶ Empezar → bucles en marcha: 1
🐛 ▶ Empezar → bucles en marcha: 2
🐛 ⏹ Parar → bucles en marcha: 1
🐛 🏁 descarga completa
// Lo mismo en la descarga ✅:
✅ ▶ Empezar → bucles en marcha: 1
✅ ▶ Empezar → ignorado: ya hay un bucle
✅ ⏹ Parar → bucles en marcha: 0
```

La solución es una línea: `if (frameId !== null) return;` al principio de la función que arranca, con `frameId = null` al parar y al terminar. Con una señal, el patrón equivalente es abortar la anterior antes de crear la nueva. Y en la interfaz, que el botón cambie: «Empezar» se convierte en «Parar» (ejemplos 01 y 07).

## Bestiario

- **La animación salta (o se congela) al volver de otra pestaña.**
  Síntoma: tras un rato en otra pestaña, los objetos aparecen de golpe en otra posición, la física «explota» o la página tarda en responder.
  Causa: rAF no llama mientras la pestaña está oculta, y el primer frame al volver trae todo ese tiempo; con un acumulador, son cientos de pasos seguidos.
  Solución: un tope al tiempo de cada frame (`Math.min(now - previous, 100)`) y pausar con `visibilitychange`, con `previous = null` al reanudar.
  → [ver ejemplo](03-salto-tras-ocultar-la-pestana.md)
- **La animación va el doble de rápido y «Parar» no la para.**
  Síntoma: tras pulsar dos veces «Empezar», todo se mueve más deprisa, y «Parar» no detiene la animación (o hay que pulsarlo dos veces).
  Causa: cada clic lanzó su propia cadena de `requestAnimationFrame`; las dos actualizan el estado y se pisan el número del frame pendiente.
  Solución: no arrancar si ya hay un bucle (`if (frameId !== null) return;`), o abortar la señal del anterior.
  → [ver ejemplo](08-dos-bucles-a-la-vez.md)

## Resumen

- Un bucle separa el estado, `update(dt)` (cambia el estado) y `draw()` (lo pinta); la función de rAF los coordina y pide el siguiente frame.
- Para parar, `cancelAnimationFrame`; para reanudar sin salto, `previous = null`. Pausa también con `visibilitychange`.
- Con aceleración, el delta time no basta: el paso fijo con acumulador da la misma física en cualquier pantalla. Pon un tope al tiempo de cada frame.
- Física por pasos: gravedad → velocidad → posición (Euler semiimplícito), rebote con restitución, rozamiento, y un umbral para quedarse quieto.
- Un pool reutiliza las partículas (ninguna asignación por frame); una semilla las hace reproducibles; el dibujo por lotes ahorra encargos al motor gráfico.
- Borrar con `clearRect` o pintar el fondo semitransparente para dejar estela.
- Una señal (`AbortController`) para el bucle y sus listeners de una vez; `AbortSignal.timeout` le pone plazo.
- Un bucle no empieza solo, tiene pausa, termina cuando no hay nada que mover y no se lanza dos veces.

## Para profundizar

- [Gaffer On Games: Fix Your Timestep! (en inglés)](https://gafferongames.com/post/fix_your_timestep/)
- [MDN: Anatomía de un videojuego (en inglés)](https://developer.mozilla.org/en-US/docs/Games/Anatomy)
- [Game Programming Patterns: Game Loop y Object Pool (en inglés)](https://gameprogrammingpatterns.com/game-loop.html)
- [MDN: AbortSignal.any() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static)
- [web.dev: prefers-reduced-motion (en inglés)](https://web.dev/articles/prefers-reduced-motion)
