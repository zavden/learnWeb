# Del HTML a los píxeles

## Por qué importa

Entre el HTML que escribes y los píxeles de la pantalla, el navegador recorre una cadena de pasos: construir el DOM, entender el CSS, decidir qué se dibuja, calcular dónde va cada caja, pintarla y montar el resultado. Conocer esa cadena explica cosas que de otro modo parecen magia: por qué un elemento con `display: none` sigue «existiendo», por qué un botón invisible puede recibir clics, o por qué una animación va fluida y otra a tirones.

Este es también el puente hacia todo lo que viene: el CSS decide la mitad de estos pasos, JavaScript puede disparar cualquiera de ellos, y la GPU (protagonista del final del curso) entra en escena en el último.

## La cadena de renderizado

```text
HTML ──parser──▶ DOM ───┐
                        ├──▶ ESTILO ──▶ ÁRBOL DE ──▶ LAYOUT ──▶ PAINT ──▶ COMPOSITE ──▶ píxeles
CSS ───parser──▶ CSSOM ─┘    (computar)  RENDER       (geometría) (pintar)  (montar capas)
```

| Fase | Qué produce | Pregunta que responde |
|---|---|---|
| **DOM** | árbol de nodos del documento | ¿qué hay? |
| **CSSOM** | árbol de reglas de estilo | ¿qué dice el CSS? |
| **Estilo** | el estilo computado de cada elemento | ¿qué valor final tiene cada propiedad? |
| **Árbol de render** | solo las cajas que se van a dibujar | ¿qué se ve? |
| **Layout** | posición y tamaño de cada caja | ¿dónde va y cuánto mide? |
| **Paint** | listas de operaciones de dibujo por capa | ¿de qué color es cada píxel? |
| **Composite** | la imagen final, montando las capas (en la GPU) | ¿cómo se superponen las capas? |

El navegador no hace todo esto una vez y ya: cada vez que algo cambia (pasas el ratón, se carga una fuente, JavaScript modifica el DOM), repite **desde la fase afectada en adelante**, idealmente 60 veces por segundo o más (un fotograma cada 16,7 ms).

> **Desde Python:** si has usado `pygame`, allí tú redibujas la escena en cada fotograma (*modo inmediato*). El navegador funciona en *modo retenido*: tú describes la escena (DOM + CSS) y él decide cuándo y qué recalcular. Por eso importa saber qué cambios son baratos y cuáles obligan a rehacer media cadena.

## DOM y CSSOM

El **DOM** ya lo conoces: el árbol que construye el parser de HTML (lección anterior). Con el CSS ocurre lo mismo: el navegador lo analiza y construye el **CSSOM** (*CSS Object Model*), un árbol de objetos con cada regla, su selector y sus declaraciones. Igual que el DOM no es tu HTML literal, el CSSOM no es tu CSS literal: es lo que el navegador **entendió** (los colores en hexadecimal pasan a `rgb()`, y lo que no entiende, desaparece).

Además de tus hojas de estilo, siempre hay una más: la **hoja de estilos del navegador** (*user agent stylesheet*). Es la que da 8 px de margen al `body`, tamaño grande a los `<h1>`, viñetas a las listas… y la que oculta el `<head>`.

Con DOM y CSSOM, el navegador calcula el **estilo computado** de cada elemento: el valor final de *todas* sus propiedades (más de 300), combinando tus reglas, las del navegador y la herencia, y convirtiendo unidades relativas (`2em` → `40px`). Es lo que enseña el panel **Computed** de DevTools.

[[exercise:01-cssom-y-estilo-computado.md-]]

```text
regla → .intro { color: rgb(29, 78, 216); font-size: 20px; margin-left: 2em; }
h1 font-size  (el navegador pone 2em) → 32px
.intro margin-left (2em × 20px)       → 40px
.intro color (#1d4ed8)                → rgb(29, 78, 216)
.intro display (nadie lo escribió)    → block
```

## El árbol de render: qué se dibuja

El **árbol de render** (o *layout tree*) contiene solo lo que se va a dibujar, y no coincide con el DOM:

- **Le faltan** los nodos que no generan caja: el `<head>` y todo lo que contiene, los `<script>`, y cualquier elemento con `display: none` (y sus descendientes).
- **Le sobran** cajas que no están en el DOM: los pseudoelementos `::before` y `::after`, los marcadores de las listas…

Que el `<head>` no se vea no es una regla especial de HTML: es una regla de CSS de la hoja del navegador (`head { display: none }`). Basta con contradecirla para verlo:

[[exercise:02-el-head-tambien-se-puede-ver.md]]

Y al revés: un elemento puede estar en el DOM sin estar en el árbol de render, y una caja puede dibujarse sin existir en el DOM.

[[exercise:03-dom-frente-a-render-tree.md]]

```text
texto de .note en el DOM → Lee esto con atención.
.secret en el DOM → Este párrafo está en el DOM, pero no en el árbol de render.
.secret alto en pantalla → 0 px
```

## Tres formas de ocultar

Ocultar un elemento parece una sola cosa, pero CSS ofrece tres, y cada una actúa en una fase distinta:

| | ¿Ocupa sitio? | ¿Se ve? | ¿Clic y foco? | ¿Lo anuncia un lector de pantalla? | Fase donde actúa |
|---|---|---|---|---|---|
| `display: none` | no | no | no | no | árbol de render (no entra) |
| `visibility: hidden` | **sí** | no | no | no | paint (no se pinta) |
| `opacity: 0` | **sí** | no | **sí** | **sí** | composite (se pinta transparente) |

`display: none` lo saca del árbol de render: no hay caja, así que no hay layout ni nada que clicar. `visibility: hidden` conserva su caja en el layout (deja el hueco) pero no la pinta. `opacity: 0` lo hace todo, incluso pintarlo, y al final lo monta con transparencia total: para el navegador el botón sigue ahí, así que recibe clics, entra en el orden de <kbd>Tab</kbd> y lo leen los lectores de pantalla.

[[exercise:04-display-visibility-opacity.md]]

El atributo `hidden` de la lección de atributos equivale a `display: none` (lo aplica la hoja del navegador), con la misma consecuencia: un CSS tuyo con otro `display` puede «des-ocultarlo».

## Layout, paint y composite

**Layout** (también llamado *reflow*) recorre el árbol de render y calcula la geometría: el ancho de cada caja según su contenedor, dónde se parte cada línea de texto, la altura que resulta… Es la fase más cara, porque una caja afecta a sus vecinas y a sus descendientes: cambiar el ancho de un elemento puede recolocar media página.

**Paint** convierte cada caja en operaciones de dibujo (fondo, borde, texto, sombra…) en el orden correcto, agrupadas en **capas**. Algunas capas se *rasterizan* (se convierten en píxeles) por separado.

**Composite** monta las capas, como hojas de acetato superpuestas, para formar la imagen final. Lo hace un hilo aparte, el **compositor**, normalmente con ayuda de la GPU. Mover, escalar, rotar o cambiar la transparencia de una capa que ya está pintada es baratísimo: no hay que recalcular nada, solo volver a montar.

```text
capa 2: botón flotante         ┐
capa 1: vídeo                  ├──▶ COMPOSITOR ──▶ pantalla
capa 0: el resto de la página  ┘    (superpone, mueve, escala y difumina
                                     las capas sin volver a pintarlas)
```

¿Qué recibe una capa propia? Lo decide el navegador, pero suelen tenerla los elementos con `will-change: transform` u `opacity`, los que tienen una animación de esas propiedades en marcha, los `<video>` y los `<canvas>` de WebGL. Las capas no son gratis: cada una ocupa memoria de la GPU. Por eso `will-change` se usa con cuentagotas, en lo que de verdad se va a animar, y no en todos los elementos «por si acaso».

## Fotogramas: el presupuesto de 16 ms

Una pantalla normal se refresca 60 veces por segundo: el navegador tiene unos **16,7 ms** para producir cada fotograma. En ese tiempo tiene que ejecutar el JavaScript pendiente, recalcular estilos, hacer layout, pintar y componer. Si se pasa, ese fotograma se pierde y el movimiento da un tirón (*jank*).

El navegador ahorra trabajo agrupando: si en un mismo fotograma cambias diez propiedades, no hace diez layouts, sino uno al final. Esa agrupación tiene una trampa que verás en el capítulo del DOM: si JavaScript *pregunta* por una medida (el ancho de un elemento, por ejemplo) justo después de cambiar algo, obliga al navegador a hacer el layout en ese mismo momento para poder contestar.

La cadena también explica algo que viste en la primera lección: el navegador no pinta nada hasta tener el CSS del `<head>`. Sin CSSOM no hay estilo computado, sin estilo no hay árbol de render, y sin árbol de render no hay nada que dibujar. Por eso el CSS bloquea el pintado y un CSS lento deja la página en blanco.

## Qué dispara cada fase

Cuando una propiedad cambia, el navegador rehace la cadena desde la primera fase afectada:

| Si cambias… | Por ejemplo | Fases que se repiten |
|---|---|---|
| la geometría | `width`, `height`, `margin`, `padding`, `font-size`, `top`/`left`, `display`, el texto, añadir o quitar elementos | estilo → **layout** → paint → composite |
| solo el aspecto | `color`, `background-color`, `box-shadow`, `border-color`, `visibility` | estilo → **paint** → composite |
| `transform` u `opacity` de un elemento con capa propia | `transform: translateX(…)`, `opacity: .5` | estilo → **composite** |

Pasa el ratón por cada fila de este ejemplo. Con **Paint flashing** activado en DevTools (<kbd>⋮</kbd> → *More tools* → *Rendering*), las dos primeras filas se iluminan en verde al repintarse; la tercera, no:

[[exercise:05-que-dispara-cada-fase.md]]

La diferencia importa sobre todo en las animaciones. Layout y paint ocurren en el **hilo principal**, el mismo que ejecuta tu JavaScript; el compositor tiene su propio hilo. Si el hilo principal está ocupado, todo lo que dependa de él se congela, pero el compositor puede seguir moviendo capas. Este ejemplo anima dos cajas, una cambiando `left` y otra cambiando `transform`, y tiene un botón que bloquea el hilo principal durante un segundo:

[[exercise:06-capas-y-hilo-principal.md]]

Al pulsarlo, la caja de `left` se queda congelada; la de `transform` sigue moviéndose como si nada. Por eso la regla de oro de las animaciones (capítulo de CSS) es animar `transform` y `opacity` siempre que se pueda. Y por eso un bucle largo de JavaScript «cuelga» la página: mientras se ejecuta no hay layout, ni paint, ni respuesta a los clics.

## Ver todo esto en DevTools

| Panel | Para qué |
|---|---|
| **Elements** | el DOM real (reparado por el parser), con el estilo de cada nodo |
| **Styles** (dentro de Elements) | las reglas que afectan al elemento, en orden, incluidas las del navegador y las que perdieron (tachadas) |
| **Computed** (dentro de Elements) | el estilo computado y el diagrama de cajas: contenido, relleno, borde y margen en píxeles |
| **Layout** (dentro de Elements) | dibuja las líneas de las rejillas (`grid`) y los contenedores flexibles (`flex`) |
| **Rendering** (<kbd>⋮</kbd> → *More tools*) | *Paint flashing*, *Layout Shift Regions*, *Layer borders*: hace visibles las fases |
| **Performance** | graba unos segundos y muestra cuánto tardó cada fase en cada fotograma |

La vista previa de LearnWeb es un iframe dentro de la aplicación, pero DevTools lo trata como cualquier página: el selector de elementos funciona dentro de ella. Si prefieres inspeccionar un ejemplo solo, sin la aplicación alrededor, ábrelo en su propia pestaña con el botón ↗ de la barra de la vista previa. Practica con esta:

[[exercise:07-inspeccionar-con-devtools.md]]

## Bestiario

**🐛 Un botón invisible recibe clics (o el foco, o lo lee un lector de pantalla).**
- *Síntoma:* al hacer clic en una zona aparentemente vacía ocurre algo; al pulsar <kbd>Tab</kbd> el foco «desaparece» en un elemento que no se ve; un lector de pantalla anuncia un botón que nadie ve.
- *Causa:* `opacity: 0` solo cambia cómo se monta la capa: el elemento sigue en el árbol de render, ocupa su sitio y es interactivo.
- *Solución:* para ocultar de verdad, `display: none` (o el atributo `hidden`); para ocultar conservando el hueco, `visibility: hidden`. Usa `opacity: 0` solo como paso intermedio de una animación. → [ver ejemplo](04-display-visibility-opacity.md)

## Resumen

- El navegador recorre una cadena: **DOM + CSSOM → estilo → árbol de render → layout → paint → composite**.
- El CSSOM es lo que el navegador entendió de tu CSS; el **estilo computado** combina tus reglas, las del navegador y la herencia (panel **Computed**).
- El **árbol de render** no es el DOM: le faltan `head`, `script` y lo que tiene `display: none`; le sobran `::before`/`::after`.
- `display: none` no crea caja; `visibility: hidden` deja el hueco sin pintar; `opacity: 0` pinta transparente y **sigue siendo interactivo**.
- Cambiar la geometría repite layout, paint y composite; cambiar solo el aspecto repite paint; `transform` y `opacity` en una capa propia solo repiten composite.
- Layout y paint ocurren en el hilo principal (el de JavaScript); el compositor trabaja en otro hilo y puede seguir animando aunque el principal esté bloqueado.

## Para profundizar

- [MDN — Cómo funcionan los navegadores](https://developer.mozilla.org/es/docs/Web/Performance/How_browsers_work)
- [web.dev — Rendering performance (la cadena de píxeles)](https://web.dev/articles/rendering-performance)
- [Chrome for Developers — Inside look at modern web browser, parte 3](https://developer.chrome.com/blog/inside-browser-part3)
- [Chrome for Developers — Ver y cambiar CSS con DevTools](https://developer.chrome.com/docs/devtools/css)
