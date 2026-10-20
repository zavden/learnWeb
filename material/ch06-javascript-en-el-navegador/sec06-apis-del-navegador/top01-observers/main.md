# Observers: visibilidad, tamaño y cambios del DOM

## Por qué importa

Hay tres preguntas que una interfaz se hace todo el rato: **¿se ve este elemento?** (para cargar una imagen, contar una impresión o marcar la sección actual), **¿ha cambiado de tamaño?** (para recolocar un mosaico o redibujar una gráfica) y **¿alguien ha tocado el DOM?** (un widget ajeno, un editor de texto, una librería). En el módulo «El DOM» respondiste a la primera midiendo todos los títulos con `getBoundingClientRect` en cada evento de `scroll`, y a la segunda con un `<select>`, porque `resize` de `window` solo avisa cuando cambia la ventana, no una caja.

Los **observers** dan la vuelta al problema: en lugar de preguntar una y otra vez, le dices al navegador qué vigilar y él te avisa, en lotes y en el momento adecuado del frame, solo cuando algo cambia. Son tres APIs con el mismo patrón. Esta lección las recorre con sus sorpresas: la llamada que llega nada más empezar a observar, el error de bucle de `ResizeObserver` y el `MutationObserver` que se llama a sí mismo hasta congelar la página.

## Un patrón, tres observadores

Los tres se usan igual: creas el observador con un callback, le pides que observe uno o varios elementos y, cuando ya no te interesan, los sueltas.

```js
const observer = new IntersectionObserver(callback, options); // o ResizeObserver, MutationObserver
observer.observe(element);    // empieza a vigilar (puedes observar muchos elementos)
observer.unobserve(element);  // deja de vigilar uno (MutationObserver no lo tiene)
observer.disconnect();        // deja de vigilarlos todos

function callback(entries, observer) {
  // entries: un array con lo que ha cambiado desde la última llamada
}
```

| | `IntersectionObserver` | `ResizeObserver` | `MutationObserver` |
|---|---|---|---|
| Pregunta | ¿cuánto se ve, dentro de una raíz? | ¿qué tamaño tiene? | ¿qué ha cambiado en el DOM? |
| Cada entrada | `IntersectionObserverEntry` | `ResizeObserverEntry` | `MutationRecord` |
| Cuándo llama | al preparar un frame, si la intersección cambió | al preparar un frame, después del layout y antes de pintar | en una microtarea, después del script que hizo los cambios |
| Al empezar a observar | llama una vez con el estado actual | llama una vez con el tamaño actual | no llama |

Lo importante es lo que **no** hay: ni listeners de `scroll` o `resize`, ni medidas en tu código, ni temporizadores. El navegador ya calcula el layout de cada frame; los observers te dejan leer el resultado sin provocar layouts de más.

> **Desde Python:** la librería `watchdog` sigue el mismo esquema para el sistema de archivos: un `Observer`, un manejador con un método por tipo de cambio y `observer.schedule(handler, path)`. Y en Tkinter, el evento `<Configure>` de un widget avisa de su tamaño nuevo, como `ResizeObserver`.

## `IntersectionObserver`: ¿se ve?

Un `IntersectionObserver` compara la caja de cada elemento observado (el **objetivo**) con la de una **raíz**, y avisa cuando la intersección cambia. Tres opciones lo configuran:

| Opción | Por defecto | Qué hace |
|--------|-------------|----------|
| `root` | `null`: la ventana | el elemento con scroll que hace de «vista»; `document`, la ventana del propio documento |
| `rootMargin` | `'0px'` | agranda (positivo) o encoge (negativo) la raíz, como un `margin`: `'0px 0px 100px 0px'` |
| `threshold` | `0` | a partir de qué fracción visible avisar; un número o una lista (`[0, 0.5, 1]`) |

Cada entrada trae `target` (el elemento), `isIntersecting` (si toca la raíz), `intersectionRatio` (qué fracción de él se ve, de 0 a 1), `boundingClientRect` (su caja), `intersectionRect` (la parte visible), `rootBounds` (la caja de la raíz) y `time`.

Una advertencia propia de LearnWeb. Con la raíz implícita (sin `root`), la intersección se calcula contra la ventana de la **pestaña**, y la vista previa es un iframe de otro origen dentro de la aplicación. Por privacidad, el navegador no le cuenta a un iframe así dónde está colocado: `rootBounds` llega como `null` y `rootMargin` se ignora. Por eso los ejemplos usan como raíz un panel con scroll dentro de la propia página, que da números exactos y repetibles. En tu web, que es la página principal de su pestaña, la raíz implícita es la más habitual; en un iframe, `root: document` usa la ventana del propio iframe.

El primer ejemplo observa las doce salas de un museo dentro de un panel de 192 px de alto. Desplaza el panel despacio y mira cómo entran y salen; los botones saltan de golpe, para que el resultado se pueda repetir:

[[exercise:01-intersection-observer.md]]

[[exercise:01-intersection-observer.md-(script.js)]]

```text
Listo: desplaza el panel o usa «Ir al final»
primera llamada → 12 entradas · rootBounds: 192 px de alto (el panel)
a la vista → 1, 2, 3
raíz implícita → rootBounds: null (la vista previa es un iframe de otro origen)
// Tras pulsar «Ir al final»:
sale → Sala 1
sale → Sala 2
sale → Sala 3
entra → Sala 10
entra → Sala 11
entra → Sala 12
a la vista → 10, 11, 12
```

Fíjate en dos cosas. Las salas 4 a 9 no aparecen al saltar: pasaron de no verse a no verse, y el observer solo informa de **cambios**. Si desplazas poco a poco, en cambio, verás entrar y salir cada una. Y las entradas de una misma llamada vienen en el orden en que empezaste a observar los elementos.

### La primera llamada

Ahora la sorpresa. El callback no espera a que algo entre o salga: se ejecuta **en cuanto empiezas a observar**, con una entrada por elemento que describe su estado actual. La mayoría llegan con `isIntersecting: false`. El código que da por hecho que «si me llaman, es que se ve» cuenta de más, y además vuelve a contar cada vez que un elemento **sale**:

[[exercise:02-primera-llamada.md-(script.js)]]

```text
Listo: desplaza las ofertas o usa «Ir al final» y «Volver al inicio»
llamada 1 · 8 entradas
   🐛 sumando entradas → impresiones: 8
   ✅ con isIntersecting → impresiones: 2 (Café de olla, Concha de vainilla)
// Tras pulsar «Ir al final»:
llamada 2 · 4 entradas
   🐛 sumando entradas → impresiones: 12
   ✅ con isIntersecting → impresiones: 4 (+ Pan de elote, Tamal de dulce)
// Tras pulsar «Volver al inicio»:
llamada 3 · 4 entradas
   🐛 sumando entradas → impresiones: 16
   ✅ con isIntersecting → impresiones: 4
```

La regla: en el callback, **mira siempre `isIntersecting`** (o `intersectionRatio`) de cada entrada. La primera llamada es útil precisamente porque te da el estado inicial sin medir nada.

### Revelar al desplazar

El uso más vistoso: que cada bloque aparezca con una transición al llegar a él. Con `threshold: 0.25`, el observer avisa cuando un paso cruza el 25 % visible. Pero ojo: también avisa cuando asoma su **primer píxel**, porque `isIntersecting` cambia de `false` a `true`; por eso el callback comprueba `intersectionRatio`. Una vez revelado, `unobserve` lo suelta: no hay nada más que vigilar.

[[exercise:03-revelar-al-desplazar.md]]

[[exercise:03-revelar-al-desplazar.md-(script.js)]]

```text
Listo: desplaza el panel poco a poco o usa «Ir al final»
✨ revelo → 1. Cosecha
✨ revelo → 2. Despulpado
reveladas: 2 de 8 · sigo observando 6
// Tras pulsar «Ir al final»:
✨ revelo → 7. Molienda
✨ revelo → 8. En la taza
reveladas: 4 de 8 · sigo observando 4
```

Dos decisiones del CSS que valen para cualquier efecto así. El estado oculto solo existe cuando JavaScript ha marcado la página con `.js-reveal`: si el script falla, el contenido se ve igual. Y todo va dentro de `@media (prefers-reduced-motion: no-preference)`: a quien pidió menos movimiento no se le esconde ni se le mueve nada. Si el efecto es solo visual, `animation-timeline: view()` (lección «Animaciones modernas» de CSS) lo hace sin JavaScript; el observer es para cuando quieres hacer algo más al llegar: cargar, contar, avisar.

### Carga diferida con `rootMargin`

Un `rootMargin` positivo agranda la raíz: con `'0px 0px 100px 0px'`, un elemento cuenta como visible cuando le faltan 100 px para asomar. Es la base de la **carga diferida**: cada imagen guarda su archivo en `data-src` y solo recibe un `src` cuando está a punto de verse.

[[exercise:04-carga-diferida.md]]

[[exercise:04-carga-diferida.md-(script.js)]]

```text
Listo: desplaza el panel o usa «Ir al final»
⬇️ pido tile-01.svg
⬇️ pido tile-02.svg
⬇️ pido tile-03.svg
⬇️ pido tile-04.svg
// Tras pulsar «Ir al final»:
⬇️ pido tile-07.svg
⬇️ pido tile-08.svg
⬇️ pido tile-09.svg
```

La cuarta imagen se pide al cargar aunque está fuera del panel: está a menos de 100 px. Y la quinta y la sexta no se piden nunca si saltas al final; aparecen si vuelves arriba y bajas despacio. En la pestaña Network de DevTools (abre la vista previa con ↗) verás las peticiones llegar a la vez que las líneas. Para un `<img>` o un `<iframe>` normales, hoy no hace falta nada de esto: `loading="lazy"` (lección de imágenes de HTML) hace lo mismo sin JavaScript. El patrón sirve para todo lo demás: pedir datos, montar un mapa o un reproductor, inicializar un componente pesado.

### La sección actual

Un `rootMargin` **negativo** encoge la raíz. Con `'0px 0px -75% 0px'`, la raíz se queda en una franja con el 25 % de arriba del panel, y la sección que pasa por esa franja es «la actual». Es la versión con observer de «Sección actual», del módulo «El DOM», que medía todos los títulos en cada evento de scroll:

[[exercise:05-seccion-actual.md]]

[[exercise:05-seccion-actual.md-(script.js)]]

```text
Listo: desplaza la receta o usa el índice
📍 sección actual → Ingredientes
// Tras pulsar «Cocción» en el índice:
📍 sección actual → Cocción
// Tras pulsar «Servir»:
📍 sección actual → Servir
```

Dos detalles. Cuando el final de una sección y el principio de la siguiente tocan a la vez la franja (y al saltar con un ancla pasa siempre, porque un borde que solo **roza** la raíz también cuenta como `isIntersecting`), manda la última en el orden del documento. Y el último apartado necesita altura suficiente para llegar arriba; si no, nunca sería el actual. El callback solo escribe en el DOM cuando la sección cambia.

### Cargar más con un centinela

El «scroll infinito» es un observer sobre un **centinela**: un elemento al final de la lista que, cuando entra en la vista (con un margen de 120 px), pide la página siguiente. Es la promesa de «Cargar más», del módulo «Eventos», que medía el contenedor en cada evento de scroll:

[[exercise:06-cargar-mas-con-centinela.md]]

[[exercise:06-cargar-mas-con-centinela.md-(script.js)]]

```text
Listo: 10 de 30 recetas · baja hasta el final del panel o pulsa «Cargar más recetas»
centinela → fuera de la vista: no cargo nada
// Tras pulsar «Ir al final»:
centinela → a la vista: cargo la página 2
📥 página 2 → 20 de 30 recetas
// Tras pulsar «Ir al final» otra vez:
centinela → a la vista: cargo la página 3
📥 página 3 → 30 de 30 recetas
✅ no hay más: disconnect()
```

El botón sigue siendo la vía principal: funciona con el teclado y con un lector de pantalla, y es el propio centinela. Un detalle que da sustos: el observer avisa de **cambios**, no de estados. Si la página nueva es tan corta que el centinela sigue a la vista, no habrá otra llamada y la carga se detiene. Si te puede pasar, vuelve a observarlo después de cada carga (`unobserve` y `observe`): una observación nueva siempre empieza con su primera llamada.

## `ResizeObserver`: ¿qué tamaño tiene?

El evento `resize` de `window` solo avisa cuando cambia la ventana. Pero una caja cambia de tamaño por muchas otras razones: se abre una barra lateral, llega una fuente, cambia el texto, la persona arrastra un divisor. `ResizeObserver` avisa de todas, para cualquier elemento.

Cada entrada trae `contentBoxSize` y `borderBoxSize` (arrays con un objeto `{ inlineSize, blockSize }`: ancho y alto en texto horizontal; son arrays porque una caja partida en columnas tiene varios trozos) y `contentRect`, la forma antigua, un `DOMRect` de la caja de contenido. Como `IntersectionObserver`, llama una vez **nada más observar**, con el tamaño actual.

El ejemplo resume los asistentes a una cata en una fila de avatares: cuántos caben depende del ancho de la caja, y los que no caben se cuentan en «+N». Cambia el ancho arrastrando la esquina:

[[exercise:07-resize-observer.md]]

[[exercise:07-resize-observer.md-(script.js)]]

```text
Listo: cambia el ancho del recuadro desde su esquina
llamada 1 (al observar) → contenido 300 px · borde 322 px · contentRect.width 300
caben 6 → muestro 5 + «+4»
// Tras estrecharlo hasta 222 px de borde a borde (los números dependen de dónde sueltes):
llamada 2 → contenido 200 px · borde 222 px · contentRect.width 200
caben 4 → muestro 3 + «+6»
```

¿Y las container queries del módulo «Diseño responsive»? Si lo que cambia según el ancho es solo el **aspecto**, son la herramienta: CSS puro, sin JavaScript. `ResizeObserver` es para cuando el script necesita el **número**: cuántos elementos caben, el tamaño en píxeles de un `<canvas>`, las filas de una lista virtualizada, las columnas del mosaico de recetas del módulo «El DOM», que ahora se recalcularía solo al cambiar su ancho.

### El error de bucle

Un callback de `ResizeObserver` puede cambiar el DOM, y eso puede cambiar tamaños observados. Para no entrar en un bucle infinito dentro de un frame, el navegador procesa los avisos por **profundidad** en el árbol: después de cada ronda, solo entrega los cambios de elementos más profundos que los de la ronda anterior. Si un elemento ya avisado cambia otra vez de tamaño, su aviso se queda para el frame siguiente y el navegador dispara un evento `error` en `window` con un mensaje muy conocido:

[[exercise:08-bucle-de-resize-observer.md-(script.js)]]

```text
Listo: el plano 🐛 calcula su alto en el callback; el ✅, con aspect-ratio
🐛 #map-js, vuelta 1 → 200 px de ancho: pongo el alto a 100 px
✅ #map-css → 200 × 100: lo da el CSS, solo leo
🛟 error en window → ResizeObserver loop completed with undelivered notifications.
🐛 #map-js, vuelta 2 → 200 × 100: ya es 2:1, no toco nada
```

Lo traicionero es que aquí el cálculo es **correcto** y se estabiliza en la segunda vuelta, y aun así hay error. Además es un error silencioso: la consola de Chrome no lo muestra (el ejemplo lo ve porque escucha `error` en `window`), así que lo descubren los manejadores de errores y los servicios de registro de errores de producción. Si el callback cambiara el tamaño en cada vuelta, el error saldría en cada frame, sin fin. Las salidas, por orden de preferencia: que lo resuelva el CSS (`aspect-ratio`, `min-height`, grid); que el callback cambie solo cosas que no alteran la caja observada (el tamaño interno de un `<canvas>`, el texto de una etiqueta con tamaño fijo); o, si no hay más remedio, que espere al frame siguiente con `requestAnimationFrame`, sabiendo que funciona solo si el cálculo converge.

## `MutationObserver`: ¿qué ha cambiado en el DOM?

Si el DOM lo cambia tu propio código, no necesitas observarlo: llama a la función que toque o despacha un evento propio. `MutationObserver` es para los cambios que **no controlas**: un widget de terceros, un `contenteditable`, una librería que pinta por su cuenta, o para reaccionar igual venga de donde venga el cambio. `observe(nodo, opciones)` necesita al menos uno de estos tres tipos:

| Opción | Registros de tipo | Con valor anterior |
|--------|-------------------|--------------------|
| `childList: true` | `childList`: nodos añadidos (`addedNodes`) o quitados (`removedNodes`) | — |
| `attributes: true` (o `attributeFilter: ['…']`) | `attributes`: `attributeName` | `attributeOldValue: true` |
| `characterData: true` | `characterData`: el texto de un nodo de texto | `characterDataOldValue: true` |

Y `subtree: true` extiende la vigilancia a todos los descendientes, no solo al nodo y sus hijos directos. Lo más importante de esta API es **cuándo** llama: no en el acto, sino en una **microtarea**, con todos los cambios acumulados mientras tanto. El ejemplo hace tres cambios seguidos y escribe una línea después de cada uno:

[[exercise:09-mutation-observer.md]]

[[exercise:09-mutation-observer.md-(script.js)]]

```text
1. añado la comanda de la mesa 4
2. la mesa 2 pasa a «en-cocina»
3. corrijo la errata de la mesa 3
Listo: el script terminó y el callback aún no se ha ejecutado; pulsa los botones
— callback (microtarea) · 3 registros —
childList → + 1 nodo: «Mesa 4 · Enchiladas suizas»
attributes → Mesa 2 · data-status: nueva → en-cocina
characterData → «Mesa 3 · Tacos al pastr» → «Mesa 3 · Tacos al pastor»
// Tras pulsar «＋ Nueva comanda» y después «✓ Todas listas»:
— callback (microtarea) · 1 registro —
childList → + 1 nodo: «Mesa 5 · Sopa de lima»
— callback (microtarea) · 5 registros —
attributes → Mesa 1 · data-status: en-cocina → lista
attributes → Mesa 2 · data-status: en-cocina → lista
attributes → Mesa 3 · data-status: nueva → lista
attributes → Mesa 4 · data-status: nueva → lista
attributes → Mesa 5 · data-status: nueva → lista
```

Es el mismo reparto del módulo «Asincronía y event loop»: el script entero va primero y la microtarea después. Por eso un `MutationObserver` no frena cada cambio (cien `append` seguidos producen una sola llamada con cien registros) y por eso nunca ves estados intermedios a medias. Fíjate también en que el atributo puesto **antes** de añadir la comanda 4 a la lista no generó registro: el nodo aún no estaba en la parte observada.

Dos métodos completan la API. `disconnect()` deja de observar y **descarta** los registros pendientes. `takeRecords()` te los entrega en el acto, vacía la cola y el callback ya no los recibirá: sirve para procesar lo pendiente antes de desconectar, y para lo que viene ahora.

### El observador que se llama a sí mismo

Si el callback escribe en el mismo DOM que observa, su escritura genera un registro nuevo, que provoca otra llamada, que vuelve a escribir… Y como son microtareas, el navegador no llega nunca a pintar ni a atender un clic: la página se **congela**. El ejemplo lo frena a las cinco vueltas:

[[exercise:10-mutation-observer-en-bucle.md-(script.js)]]

```text
🐛 vuelta 1 → $210
🐛 vuelta 2 → $$210
🐛 vuelta 3 → $$$210
🐛 vuelta 4 → $$$$210
🐛 vuelta 5 → $$$$$210
🐛 vuelta 6: paro el observador (sin este freno, la página se congela)
✅ vuelta 1 → $96.50 · takeRecords() descartó 1
Listo: pulsa el botón para que llegue otro precio
// Tras pulsar el botón:
✅ vuelta 2 → $99.90 · takeRecords() descartó 1
```

La versión ✅ escribe y después llama a `takeRecords()`: el registro de su propia escritura se descarta y no hay segunda vuelta. Otras dos salidas: `disconnect()`, escribir y volver a `observe()`, o un callback **idempotente**, que antes de escribir comprueba si el texto ya tiene el formato y, si lo tiene, no lo toca.

## Bestiario

- **El observer cuenta elementos que no se ven.**
  Síntoma: al cargar, un `IntersectionObserver` marca como vistos (o revela, o carga) todos los elementos, y vuelve a contarlos al salir de la vista.
  Causa: el callback se ejecuta al empezar a observar, con el estado actual de cada elemento (casi todos `isIntersecting: false`), y también cuando un elemento sale.
  Solución: comprueba `entry.isIntersecting` (o `intersectionRatio`) en cada entrada; para acciones de una vez, `unobserve` después.
  → [ver ejemplo](02-primera-llamada.md)
- **«ResizeObserver loop completed with undelivered notifications.»**
  Síntoma: ese error aparece en `window` (y en los servicios de registro de errores) cuando un `ResizeObserver` ajusta tamaños.
  Causa: el callback cambia el tamaño de un elemento observado (o de uno menos profundo); ese cambio no se puede entregar en el mismo frame.
  Solución: deja la proporción o el tamaño al CSS (`aspect-ratio`), cambia solo lo que no altera la caja observada, o pasa la escritura a `requestAnimationFrame` si el cálculo converge.
  → [ver ejemplo](08-bucle-de-resize-observer.md)
- **La página se congela con un `MutationObserver`.**
  Síntoma: tras un cambio en el DOM, la pestaña deja de responder (o un texto crece sin parar: `$$$$210`).
  Causa: el callback escribe en lo que observa; cada escritura es un registro nuevo y otra llamada, en microtareas que nunca dejan pintar.
  Solución: `takeRecords()` después de escribir, `disconnect()`/`observe()` alrededor de la escritura, o un callback idempotente.
  → [ver ejemplo](10-mutation-observer-en-bucle.md)

## Resumen

- Los tres observers siguen el mismo patrón: `new X(callback, opciones)`, `observe`, `unobserve` (salvo `MutationObserver`) y `disconnect`; el callback recibe un array con lo que cambió.
- `IntersectionObserver` compara cada objetivo con una raíz (`root`), agrandada o encogida con `rootMargin`, y avisa al cruzar los `threshold`. En la vista previa de LearnWeb, que es un iframe de otro origen, usa una raíz explícita.
- `IntersectionObserver` y `ResizeObserver` llaman nada más observar: mira siempre `isIntersecting` y no cuentes llamadas.
- Usos típicos: revelar al desplazar, carga diferida (`rootMargin` positivo), sección actual (`rootMargin` negativo) y «cargar más» con un centinela. Observa cambios, no estados.
- `ResizeObserver` avisa del tamaño de cualquier elemento (`contentBoxSize`, `borderBoxSize`); para cambios solo visuales, container queries. Cambiar en su callback el tamaño de lo observado produce el error de bucle.
- `MutationObserver` entrega registros `childList`, `attributes` y `characterData` en una microtarea, juntos; `takeRecords()` los recoge en el acto. Si su callback escribe en lo que observa, se llama a sí mismo sin fin.

## Para profundizar

- [MDN: Intersection Observer API](https://developer.mozilla.org/es/docs/Web/API/Intersection_Observer_API)
- [MDN: ResizeObserver](https://developer.mozilla.org/es/docs/Web/API/ResizeObserver)
- [MDN: MutationObserver](https://developer.mozilla.org/es/docs/Web/API/MutationObserver)
- [javascript.info: MutationObserver](https://es.javascript.info/mutation-observer)
- [web.dev: ResizeObserver, como `resize` para elementos (en inglés)](https://web.dev/articles/resize-observer)
