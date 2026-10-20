# Integración: el DOM

## Por qué importa

Las cinco lecciones de este módulo enseñan piezas sueltas: el árbol con sus nodos de texto, las búsquedas y sus colecciones, crear y mover nodos sin abrir agujeros, atributos frente a propiedades, y medir sin castigar al layout. En una página real aparecen todas a la vez: una lista que se pinta desde datos, se reordena, se resalta, reacciona a un cambio del estado y coloca un tooltip donde quepa.

Los ejemplos de esta página combinan varias lecciones en cada programa. Todos imprimen al cargar sus comprobaciones en la consola (ábrelos con «▶ Run» o en el editor) y casi todos tienen botones o un buscador para probarlos a mano; escuchan los clics y lo que escribes con `addEventListener`, que se estudia en el módulo siguiente. Los ejercicios te piden pintar un catálogo desde datos, cazar siete bugs del DOM y medir sin *layout thrashing*.

## Las decisiones que se repiten

| Necesitas… | Usa… | Lección |
|------------|------|---------|
| poner texto que viene de fuera | `textContent`, o strings en `append` | «Crear y modificar elementos» |
| generar mucho HTML con datos | la etiqueta `html` que escapa los valores, o `<template>` + `textContent` | «Crear y modificar elementos» |
| pintar una lista desde datos | copias de un `<template>` y `replaceChildren(...nodos)` | «Crear y modificar elementos» |
| añadir al final sin rehacer lo que hay | `append` o `insertAdjacentHTML('beforeend', …)`, nunca `innerHTML +=` | «Crear y modificar elementos» |
| reordenar sin perder estado | mover los mismos nodos con `append` | «Crear y modificar elementos» |
| recorrer y modificar a la vez | una lista estática: `querySelectorAll` o `[...colección]` | «Seleccionar elementos» |
| del elemento pulsado a su tarjeta | `closest('.card')` | «Seleccionar elementos» |
| los hijos directos | `children` o `':scope > li'` | «El árbol de nodos», «Seleccionar elementos» |
| guardar datos en un elemento | `dataset` (strings: convierte al leer) | «Atributos y propiedades» |
| cambiar el aspecto | `classList.toggle(clase, condición)`, o una variable CSS con `setProperty` | «Atributos y propiedades» |
| mostrar u ocultar | `hidden` (con `[hidden] { display: none !important; }`) y el atributo ARIA que corresponda | «Atributos y propiedades» |
| posición y tamaño en pantalla | `getBoundingClientRect()` (+ `scrollY` para el documento) | «Medidas y layout» |
| el espacio útil de una caja | `clientWidth`/`clientHeight`, sin la barra de scroll | «Medidas y layout» |
| medir muchos elementos | todas las lecturas primero, todas las escrituras después | «Medidas y layout» |

Dos reglas atraviesan la tabla. La primera: **los datos ajenos nunca se interpretan como HTML**; o se escriben como texto, o pasan por algo que los escapa. La segunda: **el DOM es caro de rehacer y de medir**; los nodos que ya existen se reutilizan o se mueven (conservan sus listeners y su estado), y las medidas se leen todas juntas antes de cambiar nada.

## Ejemplos combinados

### Un recetario desde los datos

Cuatro recetas en un array se convierten en tarjetas: una copia de la plantilla por receta, rellenada con `textContent`, con su id en `dataset` y la clase `is-vegetarian` puesta con `classList.toggle`. Las etiquetas se crean con `createElement`, todo se monta en un fragmento y entra en la página con un solo `replaceChildren`. Uno de los títulos trae `<casero>` escrito por quien lo publicó, y se ve como texto.

[[exercise:01-recetario-desde-datos.md]]

```text
recetas → 4
orden (data-recipe-id) → (4) ['r-esquites', 'r-lima', 'r-elote', 'r-mole']
vegetarianas → 2
etiquetas creadas → 10
¿«<casero>» es texto? → true
¿la plantilla sigue intacta? → true
```

### Un índice que se genera solo

El script recorre los `h2` y `h3` del artículo, le da a cada uno un `id` legible (sin tildes ni signos, con `-2` si el título se repite en la página) y construye una lista anidada de enlaces: cada `h3` cuelga del `<li>` del último `h2`, buscado con `':scope > ol'`. Para comprobarlo, una función recursiva recorre la lista generada y la imprime numerada.

[[exercise:02-indice-automatico.md-]]

```text
1. Ingredientes → #ingredientes
2. Preparación → #preparacion
  2.1. El piloncillo → #el-piloncillo
  2.2. La canela y el clavo → #la-canela-y-el-clavo
3. ¿Con o sin café? → #con-o-sin-cafe
4. Variantes del año → #variantes-del-ano
  4.1. Preparación → #preparacion-2
¿todos los id son únicos? → true
¿cada enlace lleva a un título? → true
```

Las tildes se quitan con `normalize('NFD')`, que separa cada letra de su tilde (lección «Strings»), y descartando después los caracteres de tilde sueltos.

### Resaltar sin `innerHTML`

Un buscador que envuelve en `<mark>` lo que escribes. La tentación es reemplazar el texto con `innerHTML`, pero eso borraría los listeners, convertiría lo que escribes en HTML y rompería las etiquetas que hay dentro de cada plato. El script hace lo contrario: reúne los **nodos de texto** con una recursión, parte cada uno que contiene la búsqueda en un fragmento (texto, `<mark>`, texto) y lo cambia con `replaceWith`. Para limpiar, cada `<mark>` se sustituye por su texto y `normalize()` vuelve a unir los textos vecinos. Escribe en el buscador con «▶ Run».

[[exercise:03-resaltar-coincidencias.md]]

```text
'chile' → marcas: 4
¿el texto visible es el mismo? → true
nodos en el primer plato → 2 → 4
'<img src=x onerror=alert(1)>' → marcas: 0 | <img> → 0
'' (vacío) → marcas: 0
nodos en el primer plato tras limpiar → 2
```

La coincidencia de «Chiles en nogada» está dentro del `<strong>`, y la de las enmoladas, dentro del `<em>`: el recorrido llega a los textos de cualquier profundidad, y los elementos que los contienen siguen intactos.

### El store reactivo, conectado al DOM

La promesa de la lección «Proxy y Reflect», cumplida. El *store* con `Proxy` avisa de cada cambio real de una clave, y el script sabe qué **vistas** dependen de cada clave: `items` repinta la lista, el contador y el total; `coupon`, la etiqueta del cupón y el total. Un cambio solo repinta lo que le afecta, y asignar el mismo valor no repinta nada. Las acciones asignan siempre un array nuevo, porque el proxy no ve un `push`. Prueba los botones con «▶ Run».

[[exercise:04-store-reactivo-en-el-dom.md-]]

```text
▶ añadir Café de Chiapas → pinta: list, count, total
▶ añadir Molinillo manual → pinta: list, count, total
▶ cupón BUENFIN → pinta: coupon, total
▶ el mismo cupón otra vez → pinta: (nada)
▶ quitar el cupón → pinta: coupon, total
en pantalla → 🛒 2 productos · $759.00
veces que se pintó cada vista → {list: 2, count: 2, total: 4, coupon: 2}
```

Es la idea de fondo de librerías como Vue o Svelte: el estado dice qué cambió y cada parte de la página sabe de qué depende. Aquí la lista se repinta entera con `replaceChildren`; en los ejemplos profesionales verás cómo reutilizar los nodos de cada producto.

### Progreso de lectura

Una barra fija arriba (`position: sticky`) que se llena al bajar, y un índice que marca con ✓ las secciones leídas. En cada scroll, `updateReading` hace primero **todas las lecturas** (`scrollY`, `scrollHeight`, `innerHeight` y el `getBoundingClientRect` de cada sección) y después **todas las escrituras**: la variable CSS `--progress` con `setProperty`, `aria-valuenow` para los lectores de pantalla y `classList.toggle('is-read', …)`. Desplázate por la página con «▶ Run».

[[exercise:05-progreso-de-lectura.md]]

```text
arriba → progreso: 0
abajo → progreso: 100 | secciones leídas: 4 de 4
aria-valuenow → 100
marcadas con ✓ → 4
otra vez arriba → progreso: 0 | leídas: 0 (varía con el alto de la vista previa)
```

### Opiniones seguras

Las opiniones se pintan con la etiqueta `html`, que escapa autor, texto y atributos, y cada botón «Útil» recibe su listener. Una opinión nueva entra con `insertAdjacentHTML('beforeend', …)`: aunque traiga un `<img onerror>`, se ve como texto, y los botones que ya estaban siguen siendo los mismos objetos, con su listener y su contador. Con `innerHTML +=`, el primer botón habría perdido las dos cosas.

[[exercise:06-opiniones-seguras.md-]]

```text
opiniones → 3
<img> en la lista → 0
texto de la nueva → <img src="x" onerror="document.body.style.background = 'crimson'">¡El mejor!
¿el primer botón es el mismo objeto? → true
votos del primer botón tras otro clic → Útil (2)
data-review-id → (3) ['1', '2', '3']
```

### Un tooltip que se coloca solo

Al pulsar un ⓘ, el tooltip recibe su texto y se muestra; después el script lee de una vez el rectángulo del botón, el tamaño del tooltip y el de la ventana (`clientWidth`, sin la barra de scroll), decide si cabe debajo o tiene que ir encima, lo limita para que no se salga por los lados y escribe la posición en coordenadas del documento (sumando `scrollY`). `aria-expanded` y `aria-describedby` cuentan a los lectores de pantalla qué está abierto y qué lo describe. El script lo prueba arriba y abajo de la página.

[[exercise:07-tooltip-que-se-coloca-solo.md]]

```text
precio → se coloca: below
¿debajo del botón? → true
garantía → se coloca: above
¿encima del botón? → true
¿cabe a lo ancho? → true
aria-expanded → true | aria-describedby → tooltip
```

### Una tabla que se ordena moviendo filas

Ordenar no es volver a crear la tabla: el script copia `tbody.rows` (una colección viva) en un array, lo ordena con los `data-*` (convertidos a número, o comparados con `localeCompare` para los nombres) y llama a `tbody.append(...filas)`, que **mueve** las mismas filas. Por eso los contadores de los botones «Añadir» sobreviven a cualquier orden. `aria-sort` en la cabecera dice a los lectores de pantalla cómo está ordenada la tabla, y el CSS lo usa para dibujar la flecha.

[[exercise:08-tabla-ordenable.md]]

```text
precio ▲ → FIL VER CHI PRE MOL
precio ▼ → MOL PRE CHI VER FIL
nombre ▲ → CHI VER FIL MOL PRE
¿las mismas filas (los mismos objetos)? → true
contador de Chiapas tras ordenar → Añadir (2)
aria-sort → (4) ['ascending', null, null, null]
```

## Ejercicios

Los tres ejercicios se corrigen solos, como los de los módulos anteriores: al final del código hay una función `check` que inspecciona la página después de que se ejecute tu código e imprime `✓` o, en rojo, `✗` con lo esperado y lo obtenido. Ninguna comprobación sale bien por casualidad al empezar.

### Un catálogo desde los datos

Pinta cuatro productos con la plantilla de la página: nombre y precio con `textContent`, el SKU en `data-sku`, la clase `sold-out` para los agotados, todo insertado de una vez y sin duplicar si se vuelve a pintar; y muestra el aviso de catálogo vacío solo cuando no hay productos. Uno de los nombres trae una etiqueta `<b>` que debe verse como texto. Las siete comprobaciones salen en rojo al empezar.

[[exercise:09-ej-lista-desde-datos.md]]

### Caza los bugs del DOM

Siete funciones, cada una con un bug del Bestiario de las lecciones: los textos en blanco de `childNodes`, la colección viva que se encoge en un bucle, `className =`, `setAttribute('disabled', 'false')`, el `'false'` de `dataset`, `innerHTML +=` con texto de un usuario y la plantilla que se vacía. Ninguno detiene el script; las siete comprobaciones salen en rojo.

[[exercise:10-ej-caza-los-bugs-del-dom.md]]

### Medir sin thrashing

Dos funciones que leen y escriben alternando y una que desplaza una lista con una medida relativa a la ventana. Las lecturas y escrituras pasan por unas funciones que apuntan cada operación, así que las comprobaciones ven el **orden** (`R×12 W×12`: doce lecturas seguidas, doce escrituras seguidas) además del resultado. Las tres salen en rojo al empezar, aunque el aspecto de la página ya sea correcto.

[[exercise:11-ej-medir-sin-thrashing.md]]

## Resumen

- Los datos ajenos se escriben como texto (`textContent`, strings en `append`) o pasan por algo que los escapa; nunca por `innerHTML` tal cual.
- Una lista desde datos: copias de un `<template>`, `dataset` y `classList` en cada copia, y un solo `replaceChildren`.
- Para modificar el texto sin rehacer elementos, trabaja con los nodos de texto (`replaceWith`, `normalize`).
- Reutiliza y mueve los nodos que ya existen: conservan sus listeners, su estado y sus referencias.
- Un estado observable (con `Proxy`) y una lista de qué vistas dependen de cada clave dan una página que se repinta solo donde hace falta.
- Mide con `getBoundingClientRect`, `clientWidth` y `scrollY`, todas las lecturas antes de las escrituras.
- Los estados de la interfaz viven a la vez en el DOM y en ARIA: `hidden`, `aria-expanded`, `aria-sort`, `aria-valuenow`.

## Para profundizar

- [javascript.info: el documento (capítulo completo)](https://es.javascript.info/document)
- [MDN: el elemento template](https://developer.mozilla.org/es/docs/Web/HTML/Element/template)
- [MDN: Node.normalize() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Node/normalize)
- [web.dev: evitar el layout thrashing (en inglés)](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)
- [W3C: patrón de tabla ordenable (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
