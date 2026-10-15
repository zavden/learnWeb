# Ejemplos profesionales

## Por qué importa

Las piezas de interfaz que usas a diario en cualquier web (una tabla que se filtra, un árbol de categorías, unas pestañas, una lista de miles de filas que no se atasca, un carrito que se actualiza solo) son, por dentro, código del DOM como el de este módulo. Las librerías de componentes como React o Vue lo esconden, pero hacen exactamente esto: crear nodos, reutilizarlos, moverlos, medirlos y mantener los atributos ARIA de acuerdo con lo que se ve. Esta página reúne doce programas de ese tipo, escritos con todo lo que has visto hasta ahora en el curso.

Lee primero el bloque de comentarios del principio de cada script, que explica las decisiones de diseño. Todos imprimen al cargar sus comprobaciones en la consola (ábrelos con «▶ Run» o en el editor) y todos se pueden usar: escuchan clics, cambios y lo que escribes con `addEventListener`, que se estudia en el módulo siguiente. Dos importan sus datos de un módulo de la carpeta `assets/` del tema (botón «Assets» de la galería).

## Qué tienen en común

- **El DOM se crea con nodos, no con strings.** `createElement`, `textContent` y copias de `<template>`; ni un `innerHTML` con datos. El HTML ajeno pasa por `setHTML()` o se muestra como texto.
- **Los nodos se reutilizan.** Filtrar es ocultar, ordenar es mover, actualizar es cambiar el texto de un nodo que ya existe. Lo que el usuario hizo en la página (lo que escribió, el foco) sobrevive a cada repintado.
- **El estado manda y el DOM lo refleja.** Un objeto (o un *store* con `Proxy`) dice cómo está la interfaz, y una función lo lleva a la página. Las comprobaciones cambian el estado y miran el DOM resultante.
- **Lecturas antes que escrituras.** Cada función que mide lee todo primero y escribe después: un layout por actualización, nunca uno por elemento.
- **ARIA dice la verdad.** `aria-sort`, `aria-current`, `aria-selected`, `aria-expanded` y `hidden` cambian a la vez que el aspecto; el CSS se engancha a esos atributos para que no puedan separarse.
- **Layouts intrínsecos.** Flex con `flex-wrap`, grid con `auto-fill` y tablas que se desplazan dentro de su caja: se adaptan al ancho sin media queries.

## Datos en pantalla

### Inventario filtrable y ordenable

Una tabla de 16 productos importados de `assets/01-catalogo/products.js`. Se filtra por texto (sin tildes ni mayúsculas: «cafe» encuentra «Café»), por categoría y por existencias, y se ordena pulsando las cabeceras (la segunda vez, al revés), con `aria-sort` en la columna activa. Las filas se crean una sola vez y se guardan en un `Map` por SKU; después, filtrar es poner `hidden` y ordenar es moverlas con `append`. Fíjate en `visibleProducts`: una función pura que no toca el DOM, fácil de probar por separado.

[[exercise:01-tabla-de-productos.md]]

```text
✅ sin filtros → 16 filas · primera CAF-CHI-1K
✅ buscar 'chiapas' → 3
✅ buscar 'cafe' (sin tilde) → 8
✅ accesorios con existencias → FIL-100 MOL-MAN MOL-ELE PRE-1L TAZ-TAL
✅ precio de mayor a menor → MOL-ELE … PIL-500
✅ aria-sort en Precio → descending
✅ sin resultados: se ve el aviso → 0 filas · aviso visible
✅ las filas son siempre las mismas → true
✅ recuento visible → 16 de 16 productos
```

### Árbol de categorías

Categorías anidadas convertidas en un árbol de `<details>` por una función recursiva, que devuelve a la vez el nodo y el total de productos de cada rama, sumado desde las hojas. Las ramas se abren con el teclado y los lectores de pantalla anuncian su estado sin una línea de JavaScript; las hojas son enlaces con rutas legibles. «Mostrar «Moka»» sube con `closest('details')` desde el enlace y abre cada antepasado, y marca el enlace con `aria-current="page"`.

[[exercise:02-arbol-de-categorias.md]]

```text
✅ ramas (<details>) → 7
✅ categorías finales (enlaces) → 15
✅ productos en total → 37
✅ totales de primer nivel → (14) (16) (7)
✅ niveles → 3
✅ ruta de un enlace → /tienda/cafe/en-grano/chiapas
✅ revelar «Moka» abre → Accesorios › Cafeteras
✅ ramas abiertas → 2
✅ enlace actual → Moka
✅ cerrar todo → 0
```

### Lista virtualizada

Diez mil pedidos en una lista con scroll, con solo unas quince filas en el DOM: las visibles y cuatro de margen por arriba y por abajo. El `<ol>` mide lo que medirían todas, así que la barra de scroll es la de verdad, y en cada scroll un grupo fijo de `<li>` cambia su texto y su `top`. El alto de fila se mide una vez con una fila de prueba. `aria-setsize` y `aria-posinset` dicen a los lectores de pantalla en qué posición de los 10 000 está cada fila. Prueba «Ir al pedido» y desplázate deprisa: el número de nodos no cambia.

[[exercise:04-lista-virtualizada.md]]

```text
✅ alto de fila medido → 36
✅ alto total del scroll → 360000
✅ filas en el DOM al empezar → 13
✅ arriba tras ir al 5000 → #5000 · 08/09 · Gabriela Soto · Entregado · $880.00
✅ filas en el DOM en mitad de la lista → 17
✅ las 13 primeras filas se reutilizan → true
✅ el último pedido → 10000
✅ filas visibles al final → 13
```

### Comandas con claves

Un tablero de cocina que se actualiza con «fotos» del estado, como las que mandaría un servidor. `reconcile()` compara la lista nueva con los `<li>` existentes por su clave: quita los servidos, crea los nuevos, reutiliza el resto y los coloca en orden moviéndolos, con `moveBefore` en Chrome (que conserva el foco) o `insertBefore`. Escribe una nota en una comanda, marca «Actualizar sola cada 3 s» y sigue escribiendo: la nota no se pierde, y en Chrome el cursor tampoco. Es el corazón de los renderizadores de React o Vue (que además minimizan los movimientos).

[[exercise:06-comandas-con-claves.md]]

```text
cómo se mueven los nodos → moveBefore (conserva el foco)
✅ actualización 1 → P-101 P-102 P-103 | +3 =0 ↕0 −0
✅ actualización 2 → P-102 P-104 P-101 P-103 | +1 =3 ↕1 −0
✅ actualización 3 → P-104 P-102 P-103 | +0 =3 ↕1 −1
✅ el pozole es el mismo <li> de siempre → true
✅ su nota sigue escrita → sin rábano
✅ estado del pozole → listo
```

## Medir y colocar

### ¿En qué sección estoy?

Una guía larga con una barra fija que muestra las migas (título › sección › apartado) y un índice que marca la sección actual con `aria-current`. En cada scroll, `updateCurrent` mide la barra y todos los títulos con `getBoundingClientRect`, y solo escribe en el DOM si la sección ha cambiado, así que casi todos los eventos de scroll no tocan la página. `scroll-margin-top` evita que la barra tape el título al saltar con un enlace del índice.

[[exercise:03-seccion-actual.md]]

```text
✅ arriba del todo: sin sección → Café de olla
✅ en «El piloncillo» → Café de olla › Preparación › El piloncillo
✅ enlace marcado en el índice → El piloncillo
✅ en «Variantes del año» → Café de olla › Variantes del año
✅ un solo aria-current en el índice → 1
✅ la última miga es la ubicación → location
```

### Mosaico de recetas

Un *masonry* calculado en JavaScript: el número de columnas sale del `clientWidth` del contenedor y cada tarjeta va a la columna más baja. Las alturas dependen del ancho (la foto tiene `aspect-ratio` y el texto se parte en líneas), así que el trabajo se hace en tres pasadas sin intercalar: escribir los anchos, leer todas las alturas y escribir todas las posiciones. Cambia el número de columnas con el selector. Las comprobaciones miden las tarjetas colocadas: ninguna se pisa con otra y el contenedor mide lo que la columna más alta.

[[exercise:05-mosaico-de-recetas.md]]

```text
automático → 2 columna(s) (varía con el ancho de la vista previa)
✅ 2 columna(s): ninguna tarjeta se pisa con otra
✅ todas dentro del contenedor
✅ el contenedor mide lo que la columna más alta
✅ columnas equilibradas (diferencia ≤ la tarjeta más alta + el hueco)
✅ 1 columna(s): ninguna tarjeta se pisa con otra
…
✅ 3 columna(s): ninguna tarjeta se pisa con otra
…
```

Las tres configuraciones imprimen las mismas cuatro comprobaciones.

### Inspector de cajas

El panel de modelo de caja de DevTools, hecho con lo que sabes: elige un elemento y el inspector dibuja sus capas (margin, border, padding y contenido) con los valores resueltos de `getComputedStyle`, lista sus medidas `offset*`, `client*` y `scroll*`, y lo resalta en la página con dos capas colocadas con `getBoundingClientRect` más el scroll. Compara los números con los del panel **Computed** de DevTools (botón ↗).

[[exercise:09-inspector-de-cajas.md]]

```text
✅ contenido → 200 × 50
✅ padding · border · margin → 12 · 3 · 16
✅ offset = contenido + padding + borde → 230 × 80
✅ client = contenido + padding → 224 × 74
✅ el resaltado cubre la tarjeta → true
✅ el resaltado del margen mide 16 px más por lado → 32
✅ capas del diagrama → margin › border › padding
✅ la caja con scroll tiene más contenido del que se ve → true
barra de scroll de la caja (varía) → 0 px
```

### Panel de elementos

Un panel **Elements** en miniatura: una recursión sobre `childNodes` dibuja el árbol de un trozo de página, con cada elemento como lo imprime la consola, los textos entre comillas y los comentarios, y una casilla para ver los textos en blanco (siete de diecisiete nodos). Al elegir un nodo, se resalta en la página y el panel muestra su tipo, sus hijos y sus atributos; en el campo de cantidad, el atributo `value` frente a la propiedad. Escribe un número en el campo y vuelve a elegirlo en el árbol.

[[exercise:11-panel-de-elementos.md]]

```text
✅ elementos · textos · comentarios → 6 · 3 · 1
✅ con los textos en blanco → 10
✅ cómo se ve el campo en el árbol → <input id="qty" type="number" min="1" value="1">
✅ atributo value frente a propiedad → "1" / "3"
✅ hijos del campo → 0 elementos · 0 nodos
✅ el resaltado cubre el campo → true
✅ un solo nodo marcado en el árbol → 1 · <input
✅ elegir la tarjeta → ARTICLE
```

## Componentes

### Componentes con plantillas

Un sistema de componentes de cuarenta líneas: unos atributos `data-*` en la plantilla dicen qué dato va en cada sitio (`data-text`, `data-attr`, `data-class`, `data-show`, `data-list`), y `render()` clona la plantilla y aplica cada enlace con `textContent`, `setAttribute`, `classList` y `hidden`. `data-list` anida otra plantilla por cada elemento de un array. Al terminar, quita los atributos de enlace, y un dato que falta es un `TemplateDataError` con el campo y la plantilla, no un hueco silencioso.

[[exercise:07-componentes-con-plantillas.md]]

```text
✅ tarjetas → 3
✅ enlaces → /tienda/cafe-de-chiapas /tienda/cafe-de-veracruz /tienda/molinillo-manual
✅ etiquetas por tarjeta → 2 1 3
✅ «Agotado» visible solo en Veracruz → false true false
✅ clase sold-out → false true false
✅ el nombre con < > es texto → true
✅ no quedan atributos de enlace → 0
✅ title de una etiqueta → Ver más productos con «tueste medio»
✅ un dato que falta lanza un error → TemplateDataError: Falta el dato «price» para #product-card
✅ la plantilla sigue intacta → 2
```

### Pestañas y acordeón

Pestañas y preguntas frecuentes cuyo estado vive en los atributos: `aria-selected` y `hidden` en las pestañas, `aria-expanded` y `hidden` en el acordeón, enlazados con `aria-controls` y `aria-labelledby`. El CSS da el aspecto a partir de esos mismos atributos. Una auditoría genérica recorre los roles de la página y comprueba que cada control apunta a lo que controla y que lo visible coincide con lo anunciado; se ejecuta al cargar y después de unos clics simulados. Las flechas del teclado entre pestañas llegarán con el módulo de eventos.

[[exercise:10-pestanas-y-acordeon.md]]

```text
— al cargar —
✅ cada pestaña controla un panel que existe → 3
✅ cada panel apunta a su pestaña → 3
✅ una sola pestaña seleccionada → Descripción
✅ solo se ve su panel → panel-desc
✅ aria-expanded coincide con hidden → 3 de 3
— tras elegir «Preparación» y abrir la pregunta 2 —
✅ cada pestaña controla un panel que existe → 3
✅ cada panel apunta a su pestaña → 3
✅ una sola pestaña seleccionada → Preparación
✅ solo se ve su panel → panel-prep
✅ aria-expanded coincide con hidden → 3 de 3
preguntas abiertas → 1
— tras «Abrir todas» —
✅ aria-expanded coincide con hidden → 3 de 3
preguntas abiertas → 3
```

### Vista previa de reseñas

Un editor con un formato mínimo (`**negrita**`, `_cursiva_`, listas con guion y párrafos) que se convierte en nodos: un recorrido carácter a carácter abre y cierra `<strong>` y `<em>` con una pila, y el texto entra siempre como nodos de texto, así que un `<script>` escrito se ve tal cual. El segundo panel limpia HTML pegado de otra web con `setHTML()` en Chrome (sin `<script>`, atributos `on…` ni enlaces `javascript:`), o lo muestra como texto donde no existe. Escribe en los dos cuadros.

[[exercise:08-vista-previa-de-resenas.md]]

```text
✅ bloques → p ul p
✅ negritas, cursivas, saltos → 1 1 1
✅ elementos de la lista → 2
✅ <script> e <img> creados → 0
✅ se lee como texto → true
✅ formato anidado → <strong>negrita y <em>cursiva</em></strong>
HTML pegado → setHTML()
✅ pegado: scripts, atributos on… y javascript: → 0 0 0
✅ pegado: el formato inofensivo se queda → 1
```

### Carrito reactivo

Todo junto: el catálogo del primer ejemplo, un *store* con `Proxy` cuyas claves deciden qué vistas se repintan, líneas de carrito creadas desde un `<template>` y reconciliadas por SKU (el `<li>` de cada producto se reutiliza y su campo de cantidad no se pisa mientras escribes), botones que se desactivan al agotar las existencias y totales con cupón. Las comprobaciones narran cada acción y lo que repinta; después, cambia cantidades, quita productos y aplica el cupón.

[[exercise:12-carrito-reactivo.md]]

```text
✅ el botón de un agotado está desactivado → true
▶ añadir Café de Chiapas → pinta: lines, count, buttons, totals
▶ otro Café de Chiapas → pinta: lines, count, buttons, totals
▶ añadir el molinillo → pinta: lines, count, buttons, totals
▶ 5 cafés de Chiapas → pinta: lines, count, buttons, totals
▶ intentar añadir uno agotado → pinta: (nada)
▶ aplicar el cupón → pinta: coupon, totals
▶ quitar el molinillo → pinta: lines, count, buttons, totals
✅ líneas → CAF-CHI-500×5
✅ la línea de Chiapas es el mismo <li> desde el principio → true
✅ contador → 5
✅ subtotal · descuento · total → $1,050.00 · −$105.00 · $945.00
✅ pedir más de lo que hay se limita a las existencias → 4
✅ con todas las existencias, el botón se desactiva → true
```

## Resumen

- Crea el DOM con nodos y `textContent`; el HTML ajeno, con `setHTML()` o como texto.
- Guarda los nodos que creas (un `Map` por clave) y reutilízalos: ocultar, mover y cambiar texto es más barato y conserva el estado del usuario.
- Separa el cálculo (funciones puras sobre datos) de la escritura en el DOM.
- Mide en bloque: lecturas primero, escrituras después; y solo escribe si algo cambió.
- Virtualiza las listas enormes: el DOM solo necesita lo que se ve.
- Mantén ARIA y el aspecto unidos enganchando el CSS a los atributos.

## Para profundizar

- [W3C: patrones de diseño ARIA (APG), en inglés](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [web.dev: renderizar listas grandes con virtualización (en inglés)](https://web.dev/articles/virtualize-long-lists-react-window)
- [Chrome Developers: moveBefore() (en inglés)](https://developer.chrome.com/blog/movebefore-api)
- [MDN: HTML Sanitizer API (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
- [React: preservar y reiniciar el estado (en inglés)](https://react.dev/learn/preserving-and-resetting-state)
