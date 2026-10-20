# SVG con JavaScript

## Por qué importa

En la lección «SVG en HTML» del capítulo de HTML escribiste SVG a mano: `viewBox`, formas, `path` y sus comandos, `<title>` para la accesibilidad. Con JavaScript, ese mismo SVG se **genera** a partir de datos (un gráfico de ventas, un plano de mesas, una ruta) y se **modifica** mientras la página está abierta: colores que cambian con el estado, marcas donde el usuario hace clic, líneas que se dibujan solas.

A diferencia del canvas, cada forma de un SVG es un elemento del DOM: tiene sus eventos, su CSS (`:hover`, transiciones), su `<title>` y su lugar en el árbol de accesibilidad, y el navegador la redibuja nítida a cualquier tamaño. Pero no es HTML, y las herramientas del módulo «El DOM» tienen tres sorpresas con él: `createElement` no sirve, las propiedades no son lo que parecen, y las coordenadas del dibujo no son las de la pantalla.

## Crear elementos SVG: el espacio de nombres

Un documento HTML puede contener elementos de varios vocabularios: HTML, SVG y MathML. Cada uno tiene su **espacio de nombres** (*namespace*), una URL que funciona como apellido: `http://www.w3.org/1999/xhtml` para HTML y `http://www.w3.org/2000/svg` para SVG. Cuando el parser lee `<svg>` en el código, cambia de vocabulario solo, y todo lo que hay dentro se crea como SVG. Desde JavaScript, no hay parser: `document.createElement('circle')` crea siempre un elemento **HTML** llamado `circle`, que no existe en HTML, y el resultado es un `HTMLUnknownElement` que se queda en el DOM sin dibujar nada.

[[exercise:01-createelement-no-dibuja.md]]

[[exercise:01-createelement-no-dibuja.md-(script.js)]]

```text
🐛 createElement → HTMLUnknownElement · tagName CIRCLE · ¿SVGElement? false
ancho en pantalla: 0 px · espacio de nombres: http://www.w3.org/1999/xhtml
✅ createElementNS → SVGCircleElement · tagName circle · ¿SVGElement? true
ancho en pantalla: 24 px · espacio de nombres: http://www.w3.org/2000/svg
```

`document.createElementNS(espacio, nombre)` es la versión con apellido. Una pista para reconocer el error: `tagName` sale en mayúsculas en los elementos HTML (`CIRCLE`) y tal cual en los SVG (`circle`). Lo habitual es escribir una función de ayuda, como la de los ejemplos de gráficos:

```js
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attributes, parent) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  parent.append(element);
  return element;
}
```

Los atributos sí van con el `setAttribute` de siempre (sin espacio de nombres), y `append`, `remove`, `textContent`, `classList`, `addEventListener` o `querySelector` funcionan igual que con HTML.

## Atributos, no propiedades

En HTML, casi cada atributo tiene una propiedad que lo refleja: `input.value`, `img.src`, `a.href` (lección «Atributos y propiedades»). En SVG también, pero con otra forma: `circle.r` no es un número, sino un objeto `SVGAnimatedLength` con dos valores dentro, `baseVal` (el del atributo) y `animVal` (el que tiene ahora, si una animación SVG lo está cambiando). Y la propiedad es de **solo lectura**: asignarle un número no hace nada.

[[exercise:02-propiedades-animadas.md-(script.js)]]

```text
circle.r → SVGAnimatedLength · r.baseVal.value → 20
getAttribute('r') → 20 (string)
🐛 tras circle.r = 50 → r = 20
✅ tras setAttribute → r = 40 · baseVal 40
✅ tras r.baseVal.value = 50 → r = 50
className → SVGAnimatedString
🐛 tras className = 'zone express' → class = zone
✅ tras classList.add → class = zone express
```

Por dentro, `r` es un *getter* sin *setter* en el prototipo, y ya viste en la lección «Propiedades a fondo» del capítulo de JavaScript qué pasa al escribir en uno: en un script clásico, la asignación se ignora **en silencio**; en un módulo o con `'use strict'`, lanza un `TypeError`. La regla práctica: para escribir, `setAttribute`; para leer un número, `circle.r.baseVal.value` (o `Number(getAttribute('r'))`); para las clases, `classList`, porque `className` también es un objeto (`SVGAnimatedString`) y por eso el código antiguo que hace `el.className = '…'` no funciona en SVG.

[[exercise:02-propiedades-animadas.md]]

## Plantillas con `innerHTML`

Para muchos elementos a la vez, construir un string y asignarlo con `innerHTML` es más corto que una llamada por elemento. Con SVG funciona si el elemento que lo recibe **ya es SVG**: el parser usa ese elemento como contexto, sabe que está «dentro de un svg» y crea elementos SVG de verdad. En un `<div>`, las mismas etiquetas dan `HTMLUnknownElement`; salvo que la cadena empiece por `<svg>`, que vuelve a cambiar el vocabulario.

[[exercise:03-innerhtml-dentro-de-svg.md]]

```text
dentro de un <g> de SVG → SVGCircleElement · 5 mesas
dentro de un <div> → HTMLUnknownElement
<svg> dentro de un <div> → SVGCircleElement
```

Valen las advertencias de la lección «Crear y modificar elementos»: con datos que escribe un usuario, `innerHTML` abre la puerta a la inyección de código; escapa el texto o crea los elementos con `createElementNS` y `textContent`. Fíjate también en el plano: las mesas libres y las ocupadas no se distinguen solo por el color (unas están rellenas y otras tienen un borde discontinuo), y cada una tiene su `<title>`.

[[exercise:03-innerhtml-dentro-de-svg.md-(script.js)]]

## Gráficos de datos

Un gráfico es una **escala**: una función que convierte un dato (visitantes, grados, euros) en una coordenada del `viewBox`. Como el `viewBox` lo eliges tú, las cuentas pueden ser sencillas: el ejemplo reserva para las barras la zona de `y = 10` a `y = 170` y convierte de 0 a 2500 visitantes en esa altura. La única trampa es que la `y` crece hacia **abajo**, así que la escala se invierte: el 0 está abajo (`y = 170`) y el máximo arriba.

```js
const yFor = (value) => plot.bottom - (value / MAX) * (plot.bottom - plot.top);
```

[[exercise:04-grafico-de-barras.md]]

[[exercise:04-grafico-de-barras.md-(script.js)]]

```text
sábado → barra de 137.6 de alto, desde y = 32.4
creados → 6 rect · 6 line · 12 text
```

Tres piezas que todo gráfico necesita y que el ejemplo construye con los mismos datos: **marcas** en el eje (las líneas de referencia cada 500 visitantes, con su número), un **`<title>`** dentro de cada barra, que el navegador muestra como tooltip al pasar el ratón y que leen los lectores de pantalla, y una **tabla** con los datos, para quien no ve el gráfico o quiere los números exactos. El SVG se ajusta al ancho disponible con `max-width: 100%; height: auto`, y todo se escala con él.

Un gráfico de líneas es un solo `<path>` cuyo atributo `d` se construye con las coordenadas de cada dato: `M x y` para el primer punto («mueve el lápiz») y `L x y` para cada tramo (los comandos de la lección «SVG en HTML»):

[[exercise:05-grafico-de-lineas.md]]

```text
d → M 36 140 L 70 120 L 104 80 L 138 50 L 172 20 L 206 30 L 240 60 L 274 90 L 308 110
máxima → 23 °C a las 14:00, en y = 20
```

Elegir escalas «redondas» (17 unidades por hora, 10 por grado) deja coordenadas enteras y un `d` legible. Las librerías de gráficos como D3 se basan exactamente en estas piezas: funciones de escala, ejes con marcas y elementos SVG generados a partir de un array.

[[exercise:05-grafico-de-lineas.md-(script.js)]]

## Del puntero al `viewBox`

Un SVG con `viewBox` tiene su propio sistema de coordenadas, y la caja en la que se muestra puede medir otra cosa: un `viewBox` de 400 × 200 en una caja de 300 × 150 px dibuja cada unidad a 0,75 px. La posición del puntero (en px CSS, como en la lección «Canvas 2D») hay que convertirla.

La forma general es la matriz que usa el propio navegador: `svg.getScreenCTM()` devuelve el `DOMMatrix` que lleva del sistema del `viewBox` a la pantalla (CTM, *current transformation matrix*), y su inversa hace el camino contrario:

```js
const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
```

[[exercise:06-puntero-en-coordenadas-svg.md]]

[[exercise:06-puntero-en-coordenadas-svg.md-(script.js)]]

```text
viewBox 0 0 400 200 · caja 300 × 150 px → 1 unidad = 0.75 px
Listo: haz clic en el parque
// Tras hacer clic en el centro del estanque:
✅ (200, 100) · 🐛 sin convertir (150, 75)
// Sin hacer clic: Tab hasta el plano y la flecha →
⌨️ ArrowRight → (70, 50)
```

La marca gris del ejemplo cae donde caería con los px sin convertir: más cerca de la esquina. La regla de tres (`x = cssX * viewBox.width / caja.width`) funciona en este caso, pero `getScreenCTM()` también tiene en cuenta lo que la regla de tres olvida: el margen que deja `preserveAspectRatio` cuando la caja y el `viewBox` tienen otra proporción, y las transformaciones de los grupos (`<g transform="…">`). Llamando a `getScreenCTM()` de un elemento de dentro, obtienes sus coordenadas locales.

## Animar SVG

Hay tres maneras de animar un SVG, de la más barata a la más flexible:

- **CSS sobre `transform` y `opacity`**: una transición o una animación de `@keyframes`, como en HTML. La única diferencia es el origen de las transformaciones: en SVG se mide desde el `viewBox`, y `transform-box: fill-box` lo hace relativo a la propia forma (para que `transform-origin: bottom` sea el fondo del rectángulo y no el del dibujo).
- **CSS sobre la geometría**: en Chrome, los atributos `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, `width`, `height` (y hasta `d`) de las formas son también propiedades de CSS, y se pueden animar con una transición. Repintan en cada frame, como `width` en HTML (lección «Rendimiento de las animaciones» del capítulo de CSS).
- **JavaScript**: un bucle de `requestAnimationFrame` que reescribe cualquier atributo en cada frame (los `points` de un polígono, un texto, un `d` calculado). Sirve para todo, pero corre en el hilo principal.

[[exercise:07-animar-atributos.md]]

```text
a mitad de la animación → altura 81.75 de 120
Listo: pulsa «Llenar al 75 %»
// Tras pulsar «Llenar al 75 %»:
→ 75 %
```

Las dos versiones respetan «reducir movimiento»: la de CSS quita la transición en la media query, y la de JavaScript salta al final si `matchMedia` lo pide (módulo siguiente). SVG tiene además su propio sistema de animación, SMIL (`<animate>`), que todavía funciona pero no se recomienda para código nuevo; la lección siguiente presenta la herramienta moderna, la Web Animations API, que sirve igual para SVG que para HTML.

[[exercise:07-animar-atributos.md-(script.js)]]

### Un trazo que se dibuja

El efecto de una línea que se va dibujando sola (una firma, una ruta en un mapa, un gráfico que aparece) es un truco con dos propiedades del trazo. `stroke-dasharray` convierte el trazo en discontinuo: con un valor igual a la longitud del `path`, hay un solo «trazo» tan largo como el camino y un hueco igual de largo. `stroke-dashoffset` desplaza ese patrón: con la longitud entera, el trazo queda fuera y solo se ve el hueco; al llevarlo a 0 con una transición, el trazo entra desde el principio.

La longitud la da `path.getTotalLength()`, en unidades del `viewBox`, y `getPointAtLength(d)` da el punto que hay a una distancia `d` del principio:

[[exercise:08-trazo-que-se-dibuja.md]]

[[exercise:08-trazo-que-se-dibuja.md-(script.js)]]

```text
longitud de la ruta → 330
a mitad del recorrido → (140, 65)
Listo: pulsa «Dibujar la ruta»
// Tras pulsar «Dibujar la ruta»:
✏️ dibujando la ruta
```

Con rectas, la longitud es exacta (120 + 90 + 120). Con curvas, el navegador la calcula aproximando la curva por tramos pequeños, y el resultado puede variar en decimales de un navegador a otro. Una alternativa sin JavaScript: el atributo `pathLength="1"` le dice al navegador que trate la longitud del camino como 1, y entonces `stroke-dasharray: 1; stroke-dashoffset: 1` funciona en cualquier `path`.

## ¿SVG o canvas?

Con las dos lecciones vistas, la elección del capítulo de HTML se puede afinar:

| | SVG con JavaScript | Canvas |
|---|---|---|
| Cada forma | un elemento del DOM: eventos, CSS, `<title>` | píxeles: lo que guardes tú (`Path2D`) |
| Accesibilidad | buena con `<title>`, roles y texto real | hay que replicarla en HTML |
| Muchos elementos | lento a partir de unos miles (cada uno es un nodo) | decenas de miles por frame |
| Zoom e impresión | nítido a cualquier tamaño | se redibuja × `devicePixelRatio` |
| Animación | CSS, Web Animations, rAF sobre atributos | bucle de rAF que repinta todo |
| Ideal para | gráficos de datos, iconos, mapas e interfaces | juegos, partículas, imágenes, simulaciones |

## Bestiario

- **El elemento está en el DOM pero no se dibuja.**
  Síntoma: un `<circle>` (o `<rect>`, `<path>`…) creado con JavaScript aparece en Elements, con sus atributos, pero no se ve y mide 0 × 0.
  Causa: se creó con `document.createElement`, que crea un elemento HTML desconocido (`HTMLUnknownElement`); el SVG solo dibuja elementos de su espacio de nombres.
  Solución: `document.createElementNS('http://www.w3.org/2000/svg', 'circle')`, o `innerHTML` sobre un elemento que ya sea SVG.
  → [ver ejemplo](01-createelement-no-dibuja.md)
- **Asignar `circle.r` o `className` no hace nada.**
  Síntoma: `circle.r = 30` o `el.className = 'activo'` no cambian nada y no dan error (o, en un módulo, lanzan un `TypeError`).
  Causa: en SVG esas propiedades son objetos de solo lectura (`SVGAnimatedLength`, `SVGAnimatedString`), no el valor del atributo.
  Solución: `setAttribute('r', 30)` o `circle.r.baseVal.value = 30`; `classList` para las clases.
  → [ver ejemplo](02-propiedades-animadas.md)

## Resumen

- Los elementos SVG se crean con `createElementNS('http://www.w3.org/2000/svg', …)`; `createElement` da un `HTMLUnknownElement` que no se dibuja.
- Las propiedades de geometría son objetos de solo lectura (`circle.r.baseVal.value`); escribe con `setAttribute` y usa `classList`.
- `innerHTML` con etiquetas SVG funciona dentro de un elemento SVG (el parser conoce el contexto).
- Un gráfico es una escala de datos a coordenadas del `viewBox` (con la `y` invertida), marcas en los ejes, `<title>` en cada elemento y una tabla con los datos.
- `getScreenCTM().inverse()` y `DOMPoint` convierten la posición del puntero al sistema del `viewBox`.
- Anima con CSS (`transform` con `transform-box: fill-box`), con propiedades de geometría en Chrome o con rAF sobre los atributos; respeta «reducir movimiento».
- `getTotalLength()` + `stroke-dasharray`/`stroke-dashoffset` dibujan un trazo; `pathLength="1"` lo simplifica.

## Para profundizar

- [MDN: Document.createElementNS() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElementNS)
- [MDN: SVG y CSS (en inglés)](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/SVG_and_CSS)
- [MDN: SVGGraphicsElement.getScreenCTM() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getScreenCTM)
- [CSS-Tricks: How SVG Line Animation Works (en inglés)](https://css-tricks.com/svg-line-animation-works/)
- [Observable: D3 en la práctica (en inglés)](https://d3js.org/getting-started)
