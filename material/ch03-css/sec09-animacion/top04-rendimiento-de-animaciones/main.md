# Rendimiento de las animaciones

## Por qué importa

Una animación es una sucesión de fotogramas, y en una pantalla de 60 Hz el navegador tiene 16,7 ms para fabricar cada uno. Si no llega, el fotograma se pierde y el movimiento da un tirón. Lo que decide cuánto trabajo cuesta cada fotograma no es la duración ni la curva, sino **qué propiedad animas**: algunas obligan a recalcular la geometría de media página sesenta veces por segundo, y otras solo a mover una imagen ya pintada.

En el Mac de este curso casi todo parece fluido, porque es rápido. En un móvil de gama media, con la batería baja o con JavaScript trabajando, la diferencia se ve. Esta lección explica qué cuesta cada propiedad, por qué una animación de CSS puede seguir moviéndose aunque JavaScript esté ocupado (la promesa de la lección de animation frames del capítulo de JavaScript), qué hace `will-change` y por qué no hay que ponerlo en todas partes. Y termina con el otro coste del movimiento: el que pagan las personas a las que marea.

## Layout, paint y composite

En la lección «Del HTML a los píxeles» del capítulo de HTML viste la cadena que recorre el navegador para dibujar la página, y que cada cambio la repite **desde la primera fase afectada**. Una animación es ese cambio repetido en cada fotograma:

```text
estilo ──▶ LAYOUT ──▶ PAINT ──▶ COMPOSITE
           geometría   píxeles   montar las capas (otro hilo, en la GPU)
```

| Si animas… | Por ejemplo | Fases en cada fotograma |
|---|---|---|
| la geometría | `width`, `height`, `padding`, `margin`, `top`/`left`, `font-size`, `font-weight`, `border-width`, `grid-template-rows` | layout → paint → composite |
| solo el aspecto | `color`, `background-color`, `background-position`, `box-shadow`, `border-color`, `outline` | paint → composite |
| `transform` (y `translate`, `rotate`, `scale`) u `opacity` | `translate: 80px 0`, `opacity: 0.5` | composite |

[[exercise:01-lo-que-cuesta-cada-propiedad.md]]

Con **Paint flashing** (DevTools → <kbd>⋮</kbd> → **More tools** → **Rendering**), lo que se repinta parpadea en verde. Las dos primeras filas se iluminan durante toda la animación; la tercera, como mucho al empezar, cuando el navegador crea su capa. Por eso la regla de oro, que ya leíste en el capítulo de HTML: **anima `transform` y `opacity`** siempre que puedas, y el resto solo cuando sea pequeño o breve.

## Mover y escalar en lugar de cambiar el tamaño

Casi todo efecto de tamaño o de posición tiene una versión con `transform`. Una barra de progreso no necesita cambiar su `width`: puede medir siempre el 100 % y escalarse desde la izquierda, como prometía la lección de transformaciones.

[[exercise:02-barra-de-progreso-con-scalex.md]]

La versión con `scale` tiene un precio: escala **todo** lo que se pinta, también el radio de las esquinas y el texto. El remedio habitual es dejar en el elemento escalado solo un rectángulo de color, y poner el radio, el recorte y el texto en otro elemento que no se escala.

Con los elementos grandes, la diferencia se ve a simple vista. Un menú que se abre animando su ancho obliga a partir de nuevo las líneas del menú y del contenido en cada fotograma:

[[exercise:03-animar-width-recoloca-todo.md]]

Ese parpadeo del texto es el layout trabajando sesenta veces por segundo. La alternativa es que el menú tenga siempre su ancho y entre deslizándose por encima. Si el diseño exige que el contenido se aparte, hay dos caminos: que el cambio de layout ocurra una sola vez, sin animarlo, o animarlo con View Transitions, que hacen una foto de cada estado y animan las fotos (lección siguiente). En el capítulo de gráficos y animación con JavaScript verás la técnica FLIP, que hace lo mismo a mano.

Las sustituciones más habituales:

| En lugar de animar… | Anima… | Cómo |
|---|---|---|
| `left`, `top`, `margin` | `translate` | el elemento en su posición final y desplazado con `translate` |
| `width`, `height` de una barra | `scale` | `transform-origin` en un lado; el radio y el texto, fuera |
| `box-shadow` (la tarjeta que «se levanta») | `opacity` de un `::after` | la sombra grande ya pintada en un pseudoelemento, que pasa de `opacity: 0` a `1` |
| `background-color` de una zona grande | `opacity` de una capa | dos capas apiladas, y la de encima se funde |
| `background-position` (un brillo que barre) | `translate` de un pseudoelemento | el último ejemplo de esta lección |
| `height: auto` de un panel | (no hay sustituto exacto) | en paneles pequeños, el layout es asumible; para cambios grandes, View Transitions |

> **Desde Python:** el presupuesto de un fotograma y la memoria de una capa son dos cuentas sencillas, y explican por qué en una pantalla de 120 Hz (como la de muchos móviles y portátiles recientes) el margen es la mitad, y por qué las capas no son gratis:

```python
for hz in (60, 90, 120):
    print(f"{hz:>3} Hz → {1000 / hz:4.1f} ms por fotograma")

def layer_mb(css_width, css_height, device_pixel_ratio=2, bytes_per_pixel=4):
    pixels = (css_width * device_pixel_ratio) * (css_height * device_pixel_ratio)
    return pixels * bytes_per_pixel / 1_000_000

print(f"una tarjeta de 300 × 400: {layer_mb(300, 400):.2f} MB")
print(f"60 tarjetas con will-change: {60 * layer_mb(300, 400):.0f} MB")
```

```text
 60 Hz → 16.7 ms por fotograma
 90 Hz → 11.1 ms por fotograma
120 Hz →  8.3 ms por fotograma
una tarjeta de 300 × 400: 1.92 MB
60 tarjetas con will-change: 115 MB
```

## El hilo principal y el compositor

El layout y el paint ocurren en el **hilo principal** del navegador, el mismo que ejecuta tu JavaScript. El composite ocurre en otro, el del **compositor**. Si JavaScript tarda 300 ms en hacer un cálculo, durante esos 300 ms no hay layout ni paint: todo lo que dependa del hilo principal se congela. Pero una animación de CSS que solo cambia `transform` u `opacity` la puede llevar el compositor por su cuenta, sin preguntar al hilo principal.

[[exercise:04-javascript-ocupado.md]]

Es lo que prometía la lección de animation frames del capítulo de JavaScript: una animación de CSS de `transform` sigue moviéndose con el hilo principal ocupado, y una hecha con `requestAnimationFrame` (o una de CSS que cambia `left`) se congela. Lo que no se libra: los clics. Mientras el bucle corre, ni la casilla ni el botón responden; los clics esperan en la cola del event loop.

## `will-change`

Para que el compositor pueda mover un elemento, el elemento tiene que tener su **capa** propia: una imagen suya, ya pintada, en la memoria de la GPU. Cuando una animación de `transform` u `opacity` empieza, el navegador la crea; crearla (pintar y subir esa imagen) cuesta un poco, y a veces el primer fotograma llega tarde.

`will-change: transform` (o `opacity`) avisa de antemano: «esta propiedad va a cambiar», y el navegador prepara la capa antes de que haga falta. Tiene dos costes:

- **Memoria.** La capa existe todo el tiempo, se anime o no. Una tarjeta de 300 × 400 px en una pantalla Retina (×2) son 600 × 800 píxeles de 4 bytes: casi 2 MB de GPU. Sesenta tarjetas, unos 115 MB.
- **Efectos secundarios.** `will-change` hace lo mismo que haría el valor que anuncia. `will-change: transform` crea un contexto de apilamiento y un bloque contenedor para los descendientes `fixed` y `absolute`, igual que un `transform` (lo viste en las lecciones de `position`, de `z-index` y de transformaciones). `will-change: opacity` crea el contexto de apilamiento.

[[exercise:05-will-change-en-todo.md]]

Cuándo usarlo, entonces:

- **Casi nunca para un `:hover`**: la animación ya crea la capa, y en un elemento pequeño no se nota.
- **Sí, en un elemento grande que se va a animar a menudo** y cuyo primer fotograma da un tirón (un panel lateral, una hoja que sube desde abajo): en ese elemento, no en sus vecinos.
- **Mejor justo antes y quitándolo después**: en un `:hover` del contenedor (el ratón se acerca, la capa se prepara) o desde JavaScript, añadiendo una clase antes de animar y quitándola al terminar (capítulo 6).
- Siempre con el nombre exacto de la propiedad que vas a animar: `will-change: translate` si animas `translate`.

## Medirlo en DevTools

En un Mac rápido, los problemas de rendimiento no se ven: hay que medirlos o simular un dispositivo más lento. Abre el ejemplo en su pestaña con ↗ para que la aplicación no se mezcle en las mediciones.

- **Rendering** (<kbd>⋮</kbd> → **More tools** → **Rendering**): **Paint flashing** (verde = repintado), **Layer borders** (bordes de las capas que monta el compositor), **Frame Rendering Stats** (fotogramas por segundo en una esquina) y **Emulate CSS media feature prefers-reduced-motion**.
- **Layers** (<kbd>⋮</kbd> → **More tools** → **Layers**): la lista de capas, la memoria que ocupa cada una y el motivo por el que existe (*compositing reasons*: una pista de `will-change`, una animación acelerada en marcha, una transformación 3D…). Con el catálogo del ejemplo de `will-change`, cuenta las capas del primero y del segundo.
- **Performance**: graba unos segundos con el botón ⏺ mientras se anima. En la pista **Main**, cada fotograma con layout tiene su barra morada (*Layout*) y cada repintado, la verde (*Paint*); una animación compuesta deja la pista casi vacía. En el engranaje de la grabación, **CPU: 4× slowdown** simula un móvil, y los tirones aparecen.

## El otro coste: el movimiento y las personas

Un rebote alegre, una tarjeta que gira o un fondo que se desplaza más despacio que el texto (*parallax*) pueden provocar mareo, náuseas o migraña a personas con trastornos vestibulares, y distraen a quien tiene problemas de atención. Para eso existe la preferencia «reducir movimiento» del sistema, y la media feature `prefers-reduced-motion` que viste en el módulo anterior.

**Reducir no es quitar.** Una interfaz sin ninguna animación pierde información: de dónde sale un panel, qué ha cambiado, que algo está cargando. Lo que marea es el **desplazamiento**, no el cambio. La receta de este módulo:

| Tipo de movimiento | Con `reduce` |
|---|---|
| desplazamientos (paneles, avisos que entran deslizándose) | un fundido en su sitio |
| giros, volteos 3D, zooms | un fundido entre los dos estados |
| parallax y efectos ligados al scroll | sin efecto |
| rebotes y muelles | sin rebote, o un fundido |
| cambios de color y de opacidad | igual |
| barras de progreso | igual: informan de algo |
| animaciones infinitas (indicadores de carga, cintas, brillos) | un pulso lento de opacidad, o quietas con un texto |

La tarjeta que se voltea del módulo de efectos visuales, con las dos versiones:

[[exercise:06-movimiento-reducido-no-es-sin-animacion.md]]

Y el brillo de los esqueletos de carga, que el ejemplo profesional del módulo de efectos visuales dejó quieto: une las dos mitades de esta lección. El barrido con `background-position` repinta en cada fotograma; con un pseudoelemento que se desplaza con `translate`, solo se compone. Y con «reducir movimiento», en lugar del barrido, un pulso lento.

[[exercise:07-el-brillo-del-esqueleto.md]]

Un último coste, el de la batería: una animación infinita, aunque sea compuesta, mantiene a la GPU fabricando 60 fotogramas por segundo mientras se ve. Que dure lo que dure la espera, y ni un segundo más.

## Bestiario

- **El texto parpadea mientras se abre el menú.** Síntoma: durante la animación, las líneas del menú y del contenido se parten de otra forma en cada fotograma; en un móvil, además, va a tirones. Causa: animar `width` (o `left`, `height`, `padding`…) obliga a rehacer el layout en cada fotograma, en el hilo principal. Solución: que el elemento tenga su tamaño final y se mueva con `translate` (o se escale con `scale`). → [ver ejemplo](03-animar-width-recoloca-todo.md)
- **El desplegable queda debajo de la tarjeta vecina.** Síntoma: un menú con `z-index: 10` queda tapado, y DevTools → Layers muestra una capa por tarjeta. Causa: `will-change: transform` crea, como `transform`, un contexto de apilamiento (y un bloque contenedor), y además reserva memoria de la GPU para cada elemento todo el tiempo. Solución: quitarlo; usarlo solo en el elemento grande que lo necesite y, a ser posible, solo antes de animar. → [ver ejemplo](05-will-change-en-todo.md)
- **La barra de progreso pierde la forma.** Síntoma: al escalar con `scale` un relleno redondeado, las esquinas se aplastan. Causa: `scale` escala todo lo que se pinta. Solución: el radio y el recorte en la pista, que no se escala. → [ver ejemplo](02-barra-de-progreso-con-scalex.md)

## Resumen

- Cada propiedad animada repite la cadena desde su fase: la geometría desde el layout, el aspecto desde el paint, `transform` y `opacity` solo el composite.
- Las animaciones de `transform` y `opacity` las lleva el compositor en otro hilo: siguen fluidas aunque JavaScript ocupe el hilo principal.
- En lugar de `width` o `left`, el tamaño final con `scale` o `translate`; ojo con lo que `scale` deforma.
- `will-change` prepara una capa de antemano: cuesta memoria y crea un contexto de apilamiento y un bloque contenedor. Solo donde haga falta, y con la propiedad exacta.
- DevTools: Paint flashing y Layer borders en Rendering, el panel Layers y una grabación de Performance con la CPU ralentizada.
- «Reducir movimiento» no es «sin animación»: los desplazamientos, giros y zooms se convierten en fundidos; el color, la opacidad y las barras de progreso se quedan.

## Para profundizar

- [web.dev: How to create high-performance CSS animations](https://web.dev/articles/animations-guide)
- [web.dev: Stick to compositor-only properties and manage layer count](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)
- [MDN: will-change](https://developer.mozilla.org/es/docs/Web/CSS/will-change)
- [Chrome for Developers: Analyze rendering performance (Performance panel)](https://developer.chrome.com/docs/devtools/performance)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
