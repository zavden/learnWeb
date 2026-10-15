# Ejemplos profesionales: gráficos y animación

## Por qué importa

Los gráficos y el movimiento son lo primero que se nota de una interfaz, y también donde más fácil es hacerlo mal: un panel cuyos gráficos no tienen texto, un editor que congela la página con cada deslizador, una animación que no se puede parar o que marea, un canvas que se ve borroso en la pantalla de quien lo usa. Esta página reúne doce piezas escritas como en un proyecto real, con todo lo que has visto hasta ahora en el curso: HTML, CSS, el lenguaje JavaScript, el DOM, los eventos, los formularios, la red y el almacenamiento, y este módulo.

Lee primero el bloque de comentarios del principio de cada script: explica las decisiones de diseño. Las imágenes son obras de dominio público de la carpeta `assets/` del tema, y los datos del panel de ventas, `assets/sales.json` (botón «Assets» de la galería). Los ejemplos que guardan algo usan claves que empiezan por `lw-gfx-` y tienen un botón para borrarlas. El de la compra habla con el servidor de prueba y necesita la página de verdad: ábrelo con «▶ Run» o en el editor.

## Qué tienen en común

- **Nada se mueve sin que lo pidas.** Ningún bucle ni animación empieza al cargar. Todo lo que se mueve tiene pausa, termina solo (al quedarse quieto, tras unas vueltas o tras un límite de tiempo) y se pausa cuando la pestaña se oculta. Con «reducir movimiento», los desplazamientos se convierten en fundidos o en imágenes quietas.
- **Los datos mandan; el dibujo se rehace.** Firmas, pelotas, butacas, ventas y fotogramas se guardan como datos y se dibujan a partir de ellos. Por eso un canvas puede cambiar de tamaño (mapa de bits × `devicePixelRatio`, `setTransform`) y volver a pintarse sin perder nada.
- **Cada gráfico tiene su texto.** Un `aria-label` que se actualiza, una tabla, una leyenda con valores o una región `role="status"`. El color nunca es la única pista: las butacas vendidas tienen borde discontinuo y las muestras de color dicen su contraste.
- **Todo lo del puntero, también con el teclado.** Tabindex itinerante en el plano de butacas, flechas en las pestañas, en el cuentagotas y en el radar, Enter para lanzar o guardar, y una firma escrita para quien no puede dibujar.
- **Animaciones que se pueden interrumpir.** Las secuencias cancelan las anteriores y esperan con `Promise.allSettled` o capturan el `AbortError`; el estado final va en el estilo, sin `fill`, para que cancelar nunca deje algo a medias.
- **Números comprobables.** Cada ejemplo imprime al cargar resultados que no dependen de tu pantalla: cálculos puros, simulaciones con paso fijo y semilla, fotogramas congelados.

## Panel de ventas

**Objetivo:** el resumen de un mes de tres cafeterías: tarjetas con ventas, tickets y ticket promedio, cada una con su minigráfico, barras por tienda y la tabla de datos. **Técnicas:** `fetch` de un JSON con su validación; una función que calcula todo el periodo y varios dibujos que la usan; minigráficos en canvas que se redibujan al cambiar el ancho (un recálculo por frame); barras en SVG con `<title>`; `Intl` para moneda y fechas; el periodo recordado en `localStorage`. **Fíjate en:** cambia el ancho de la ventana o abre el ejemplo con ↗ y estréchalo: los minigráficos siguen nítidos.

[[exercise:01-panel-de-ventas.md]]

```text
📦 30 días cargados · 3 tiendas · periodo guardado: 7 días
📊 Últimos 7 días: $103,870 en 1,070 tickets · mejor tienda: Centro
Listo: cambia a «30 días» y vuelve a «7 días»; recarga con ⟳ para ver que lo recuerda
// Tras «30 días»:
📊 Últimos 30 días: $450,050 en 4,603 tickets · mejor tienda: Centro
// Tras «Olvidar el periodo elegido»:
🧹 periodo olvidado: la próxima visita empieza en 7 días
```

## Editor de láminas

**Objetivo:** recortar y ajustar una lámina (brillo, contraste, saturación) y descargarla. **Técnicas:** el `ImageData` original se guarda y nunca se toca; cada render copia, recorta y ajusta píxel a píxel con las cuentas de `filter`; un render por frame como mucho; histograma de luminancia; `willReadFrequently`; `toBlob` y una URL de objeto para la descarga. **Fíjate en:** el histograma se aprieta hacia el centro al bajar el contraste y se reparte al subirlo.

[[exercise:02-editor-de-fotos.md]]

```text
225, 29, 72 con saturación 0 → 74, 74, 74
225, 29, 72 con brillo 1.1, contraste 1.2, saturación 1.5 → 255, 0, 70
recorte cuadrado de 480 × 323 → 323 × 323 desde (78, 0)
recorte 16:9 de 480 × 323 → 480 × 270 desde (0, 26)
🖼️ 480 × 323 px · brillo 1 · contraste 1 · saturación 1
Listo: elige «Cuadrado», sube la saturación y pulsa «Exportar PNG»
// Tras «Cuadrado», la saturación al máximo y «Exportar PNG»:
💾 great-wave-editada.png: 323 × 323 px, image/png
```

## Panel de firma

**Objetivo:** que el cliente firme la entrega de un pedido con el ratón, el dedo o un lápiz. **Técnicas:** Pointer Events con `setPointerCapture` y `touch-action: none`; los trazos como datos, suavizados con curvas cuadráticas por los puntos medios y convertidos en `Path2D` desde un texto de path de SVG; grosor según la presión del lápiz; deshacer con botón y con Ctrl/⌘ + Z; exportar con fondo blanco. **Fíjate en:** si cambias el ancho de la ventana, la firma se redibuja nítida en el mapa de bits nuevo; con píxeles guardados, se habría estirado.

[[exercise:03-firma-digital.md]]

```text
suavizado de 4 puntos → M 0 0 Q 10 0 15 5 Q 20 10 25 10 L 30 10
Listo: firma en el recuadro, prueba ↶ Deshacer y «Descargar PNG»
// Tras dos trazos, «↶ Deshacer» y «Descargar PNG»:
✍️ trazo 1 guardado
✍️ trazo 2 guardado
↶ deshecho: quedan 1 trazo(s)
💾 firma-P-4120.png (image/png) con 1 trazo(s)
// Tras escribir «Ana Torres» y pulsar «Usar como firma»:
⌨️ firma escrita: Ana Torres
```

## Plano de butacas

**Objetivo:** elegir butacas en una sala de cine con el ratón o con el teclado. **Técnicas:** SVG generado desde datos con `innerHTML` dentro de cada `<g>`; cada butaca es un botón (`role`, `aria-pressed`, `aria-disabled`, un `aria-label` completo); tabindex itinerante con flechas, Inicio y Fin; selección validada y guardada en `localStorage`. **Fíjate en:** con Tab entras en el plano y con otro Tab sales de él, sin recorrer las sesenta butacas.

[[exercise:04-plano-de-butacas.md]]

```text
🎟️ 60 butacas · 9 vendidas · 51 libres · guardadas: 0
Listo: elige C3 y C4 (clic, o Tab, flechas y Enter) y prueba a elegir C5
// Tras elegir C3 y C4 y pulsar C5:
➕ C3 · total $95
➕ C4 · total $190
⛔ C5 está vendida
// Tras «Borrar la selección»:
🧹 selección borrada
```

## Caja de pelotas

**Objetivo:** un pequeño simulador físico: pelotas con gravedad que rebotan y chocan entre sí. **Técnicas:** paso fijo de 10 ms con acumulador y tope; choques entre pelotas con separación e impulso a lo largo de la normal; un mundo de 320 × 200 unidades escalado a la caja con `setTransform`; semilla para reiniciar siempre igual; «Paso a paso» para estudiarlo. **Fíjate en:** la energía baja con cada choque (restitución 0,9) y nunca sube: si subiera, la física tendría un error.

[[exercise:05-juguete-de-fisica.md]]

```text
choque elástico de frente → A: 0 · B: 100 (se intercambian las velocidades)
con restitución 0.9 → A: 5 · B: 95 · cantidad de movimiento: 100
energía tras 5 s simulados < al empezar → true
Listo: 6 pelota(s) · energía 316230
Pulsa «Paso a paso» dos veces, luego «Empezar»; haz clic en la caja para añadir pelotas
// Tras «Paso a paso» dos veces:
⏭️ +100 ms: 6 pelota(s) · energía 315524
⏭️ +100 ms: 6 pelota(s) · energía 315044
```

## Confeti de compra

**Objetivo:** confirmar un pedido y celebrarlo solo cuando el servidor lo confirma. **Técnicas:** validación con `checkValidity`, envío JSON al servidor de prueba con plazo, botón desactivado mientras tanto; un pool de 160 piezas de confeti en un canvas superpuesto con `pointer-events: none`, que sale del botón y se detiene solo; sin confeti con «reducir movimiento». **Fíjate en:** el mensaje de la región `role="status"` es la confirmación; el confeti solo la adorna.

[[exercise:06-confeti-de-compra.md]]

```text
2 bolsas → $480 (envío $60) · 3 bolsas → $630 (envío gratis)
confeti simulado (120 piezas) → vivas a 0.83 s, 1.67 s y 2.5 s: 120, 84, 0
Listo: escribe tu nombre y correo y pulsa «Confirmar pedido»; luego marca «Simular un error del servidor»
// Tras escribir «Ana» y «ana@example.com» y pulsar «Confirmar pedido»:
🎉 ¡Gracias, Ana! Pedido de 2 bolsa(s) confirmado: $480.
// Tras marcar «Simular un error del servidor» y volver a confirmar:
No se pudo confirmar el pedido (el servidor respondió 503). Inténtalo de nuevo.
```

## Anillo de la colecta

**Objetivo:** un gráfico de anillo para lo recaudado en una colecta, por categorías. **Técnicas:** `pathLength="100"` para que cada porcentaje sea directamente su `stroke-dasharray`, y `stroke-dashoffset` negativo para colocarlo; una secuencia de `element.animate()` y `await finished`; el estado final en el estilo; cancelar la secuencia anterior capturando el `AbortError`. **Fíjate en:** pulsa «Animar el anillo» dos veces seguidas: la primera secuencia se cancela limpiamente y la segunda empieza de cero.

[[exercise:07-anillo-de-la-colecta.md]]

```text
recaudado $42,500 de $50,000 (85 %)
Despensa: del 0 % al 45 %
Medicinas: del 45 % al 70 %
Útiles escolares: del 70 % al 85 %
Despensa a mitad → 22.5 de 45
Listo: pulsa «Animar el anillo» (y otra vez a mitad, para ver la cancelación)
// Tras «Animar el anillo» (unos 3 s):
✔️ Despensa · 45 % de la meta
✔️ Medicinas · 70 % de la meta
✔️ Útiles escolares · 85 % de la meta
```

## Galería que se filtra y se ordena

**Objetivo:** una colección de obras que se filtra por tipo y se ordena por año o por título. **Técnicas:** una función que calcula la vista; tres fases animadas (salen con un fundido y se ocultan al terminar, las que se quedan viajan con FLIP, las que entran aparecen); `Promise.allSettled` y un número de versión para que un clic a mitad no deje la galería en un estado raro. **Fíjate en:** pulsa «Pinturas» y «Espacio» muy seguidos: la segunda orden gana y no queda ninguna obra a medio desvanecer.

[[exercise:08-galeria-flip.md]]

```text
espacio, por año → aldrin, earth, pillars
todas, por título → aldrin, wave, earth, pillars, valley
Listo: pulsa «Espacio», cambia el orden a «título» y vuelve a «Todas»
// Tras «Espacio»:
🖼️ Mostrando 3 de 5: Buzz Aldrin en la Luna, La Tierra desde el Apolo 17, Pilares de la creación
// Tras ordenar por «título»:
🖼️ Mostrando 3 de 5: Buzz Aldrin en la Luna, La Tierra desde el Apolo 17, Pilares de la creación
// Tras «Todas»:
🖼️ Mostrando 5 de 5: Buzz Aldrin en la Luna, La gran ola de Kanagawa, La Tierra desde el Apolo 17, Pilares de la creación, Valle de México
```

## Pestañas con View Transitions

**Objetivo:** las secciones de una receta en pestañas, con un deslizamiento que indica la dirección. **Técnicas:** el patrón de pestañas de ARIA (roles, `aria-selected`, tabindex itinerante, flechas, Inicio y Fin); `startViewTransition` alrededor de la función que cambia de panel, con la dirección en un atributo de `<html>` que eligen los `::view-transition-old/new`; `skipTransition()` cuando llega otro cambio; sin soporte, el mismo cambio sin animar. **Fíjate en:** con las flechas, el panel se desliza en el sentido de la tecla.

[[exercise:09-pestanas-con-view-transition.md]]

```text
¿View Transitions? → true
Listo: pulsa «Preparación» y «Historia», o Tab hasta las pestañas y las flechas
// Tras pulsar «Preparación» y, cuando termine, «Historia»:
📑 Preparación (→)
📑 Historia (→)
// Tras pulsar «Ingredientes» y enseguida «Historia»:
📑 Ingredientes (←)
⏭️ transición anterior saltada
📑 Historia (→)
```

## Radar de lluvia

**Objetivo:** reproducir tres horas de radar sobre la Ciudad de México. **Técnicas:** 12 fotogramas precalculados en canvas aparte (degradados radiales de celdas generadas con semilla) y un mapa base, combinados con `drawImage`; un bucle con acumulador que avanza un fotograma cada 500 ms (o 250) y se detiene tras tres vueltas; un `<input type="range">` con la hora en `aria-valuetext`; horas con `Intl` en `America/Mexico_City`. **Fíjate en:** reproducir no calcula nada: solo copia dos imágenes por fotograma.

[[exercise:10-radar-de-lluvia.md]]

```text
12 fotogramas, de 14:00 a 16:45 (hora de Ciudad de México)
7 celdas de lluvia, 5 fuerte(s)
Listo: pulsa «Reproducir», o mueve la barra (con el teclado: Tab y las flechas)
// Tras Tab hasta la barra y la tecla Fin:
🕒 16:45
// Tras volver al principio (tecla Inicio), «Reproducir» y esperar unos 18 s:
🕒 14:00
▶ reproduciendo
⏸ En pausa a las 14:00 (tres vueltas)
```

## Cuentagotas

**Objetivo:** sacar los colores de un grabado y guardarlos en una paleta. **Técnicas:** la imagen con `crossOrigin`; `getImageData` de un píxel en cada `pointermove` con `willReadFrequently`; una lupa de 11 × 11 píxeles ampliada con `image-rendering: pixelated`; luminancia y contraste de WCAG para decidir el color del texto; paleta validada en `localStorage`; mira movible con las flechas. **Fíjate en:** la muestra se escribe en blanco o en negro según cuál tenga más contraste con ella.

[[exercise:11-cuentagotas.md]]

```text
14, 116, 144 → #0e7490 · contraste con blanco 5.36 · con negro 3.92
texto sobre #fde68a → negro
🖼️ 480 × 323 px · mira en (240, 161) · paleta guardada: 0
Listo: haz clic en la ola para guardar un color, o Tab, flechas y Enter
// Tras Tab hasta la imagen y Enter (el color depende de la imagen decodificada):
💧 guardado #f8edd7 · paleta: 1 color(es)
// Tras «Vaciar la paleta»:
🧹 paleta vacía
```

## Temporizador de pausas

**Objetivo:** alternar trabajo y pausas con un anillo que se vacía. **Técnicas:** el reloj es la animación: `stroke-dashoffset` de 0 a 100 durante la fase, tiempo restante desde `currentTime`, `pause()` y `play()`; fases encadenadas con `await finished`; «Reiniciar» cancela y captura el `AbortError`; la región `role="status"` solo anuncia los cambios de fase. **Fíjate en:** como no hay un contador aparte, la pausa congela el anillo y el número a la vez.

[[exercise:12-temporizador-de-pausas.md]]

```text
a los 5 s de 20 s → quedan 0:15 · anillo vaciado 25 %
Listo: pulsa «Empezar», luego «Pausa», «Seguir» y «Reiniciar»
// Tras «Empezar», «Pausa», «Seguir» y «Reiniciar»:
⏱️ Trabajo (ciclo 1) · 0:20
⏸ paused · Trabajo · ciclo 1 de 2
▶ running · Trabajo · ciclo 1 de 2
↩️ reiniciado (AbortError capturado)
```
