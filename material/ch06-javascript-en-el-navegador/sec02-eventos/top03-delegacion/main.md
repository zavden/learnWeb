# Delegación de eventos

## Por qué importa

Una lista de la compra con cinco productos, cada uno con su botón «Quitar». La primera idea es recorrer los botones y poner un listener en cada uno. Funciona… hasta que el usuario añade un sexto producto y su botón no hace nada. O hasta que la lista tiene dos mil filas y la página registra dos mil funciones idénticas.

La propagación de la lección anterior ofrece algo mejor: como el clic **sube** desde el botón hasta la lista, basta con **un** listener en la lista que mire de dónde viene cada clic. Es la **delegación de eventos**, el patrón con el que se escuchan las listas, tablas, tableros y menús de casi cualquier aplicación web.

## Un listener para muchos elementos

La receta tiene tres pasos, siempre los mismos:

1. Escucha en el **contenedor** que existe desde el principio (la lista, la tabla, el tablero).
2. Desde `event.target`, sube con **`closest(selector)`** hasta el elemento que te interesa (el botón, la fila). Si no hay ninguno, el clic no era para ti: `return`.
3. Desde ese elemento, sube o lee lo que necesites (`closest('li')`, `dataset`) y actúa.

```js
shopping.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="remove"]'); // 2
  if (!button) return;
  button.closest('li').remove();                                  // 3
});
```

[[exercise:01-un-listener-para-muchos.md]]

[[exercise:01-un-listener-para-muchos.md-(script.js)]]

```text
Listo: 5 productos y 1 listener. Pulsa «Quitar» en dos de ellos
// Tras quitar «Aguacates» y «Chiles»:
🗑️ quito «Aguacates» · quedan 4
🗑️ quito «Chiles» · quedan 3
```

¿Por qué `closest` y no `event.target` directamente? Por lo que viste en la lección «Propagación»: si mañana el botón lleva un icono dentro, `target` será el icono. `closest` empieza por el propio `target` y sube hasta encontrar un elemento que encaje con el selector (o devuelve `null`), así que funciona tanto si se pulsa el botón como si se pulsa algo que está dentro.

## Elementos que llegan después

La ventaja más importante de la delegación no es el ahorro: es que funciona con elementos que **todavía no existen**. Un listener por elemento solo se registra en los elementos que hay en el momento de registrarlo. Los que se crean después (una tarea nueva, un mensaje que llega, una fila que se carga del servidor) nacen sin listener:

[[exercise:02-elementos-dinamicos.md-(script.js)]]

```text
Listo: pulsa «Añadir…» y después el ✓ de la tarea nueva en cada lista
// Tras pulsar «Añadir una tarea a las dos listas»:
➕ «Abonar las calabazas» añadida a las dos listas
// Tras pulsar el ✓ de la tarea nueva en la lista 🐛: nada
// Tras pulsar el ✓ de la tarea nueva en la lista ✅:
✅ delegado: «Abonar las calabazas» hecha
```

Con listeners por elemento, cada función que crea elementos tendría que acordarse de registrarlos, y cada función que los borra, de quitarlos. Es el origen del error de la lección «Escuchar eventos» (listeners que se acumulan en cada render). Con delegación, el contenedor escucha una vez y los elementos pueden ir y venir.

## `closest` y `matches`

Los dos métodos que viste en el módulo «El DOM» son las herramientas de la delegación:

- **`elemento.closest(selector)`** sube desde el elemento (incluido) por sus antepasados y devuelve el primero que encaja con el selector, o `null`. Sirve para responder «¿dentro de qué está esto?».
- **`elemento.matches(selector)`** devuelve `true` o `false`: ¿encaja **este** elemento con el selector? No sube. Sirve para responder «¿qué es esto?».

En un tablero kanban, un solo listener en el tablero encuentra la tarjeta con `closest('.card')` y decide qué hacer según qué botón se pulsó:

[[exercise:03-closest-y-matches.md-(script.js)]]

```text
Listo: pulsa una etiqueta, «Mover →» dos veces y el título de una tarjeta
// Tras pulsar «urgente», dos veces «Mover →» en T-15 y el título «Fotos de los tuestes»:
🏷️ T-15: filtro por «urgente»
➡️ T-15: todo → doing
➡️ T-15: doing → done
📄 T-12: clic en la tarjeta (H3)
```

Fíjate en que la tarjeta movida a otra columna sigue respondiendo: no tiene listeners propios que perder. `matches` basta aquí porque los botones solo contienen texto; si llevaran iconos, `event.target.closest('.tag')` sería lo seguro.

## Acciones declarativas con `data-action`

Cuando cada elemento tiene varios botones (reproducir, me gusta, quitar…), un patrón muy limpio es que el HTML **diga** qué hace cada botón con un atributo `data-action`, y que el JavaScript tenga una tabla de acciones. El listener queda en cuatro líneas y no cambia aunque añadas acciones:

[[exercise:04-acciones-con-data-action.md-(script.js)]]

```text
Listo: reproduce una canción, dale ♥ a otra y quita la tercera
// Tras pulsar «▶ Reproducir» en la primera, ♥ en la segunda y ✕ en la tercera:
▶ play → t1
♥ like → t2: true
✕ remove → t3
```

La tabla es un `Map` y no un objeto literal por una razón de seguridad que viste en el módulo «Objetos y prototipos»: con `{}`, un `data-action="toString"` encontraría el método heredado de `Object.prototype` y lo ejecutaría. Con un `Map` (o con `Object.hasOwn`), solo existen las acciones que tú pusiste. Y el «me gusta» usa `aria-pressed`, que convierte un botón normal en un interruptor que los lectores de pantalla anuncian como «pulsado» o «no pulsado».

> **Desde Python:** es el despachador con un diccionario que usarías en lugar de una cadena de `if/elif`: `actions = {'play': play, 'like': like}` y después `actions[name](track)`. La diferencia es que en Python un `dict` no hereda claves, así que el problema de `toString` no existe.

## Los límites de `closest`

`closest` no sabe dónde está tu contenedor: sube por **todo** el documento hasta `<html>`. Si el contenedor que escucha está, a su vez, dentro de un elemento que encaja con el selector, un clic en una zona «vacía» del contenedor encuentra ese elemento de **fuera**. Pasa con frecuencia en interfaces hechas de componentes que reutilizan nombres de clase (`.item`, `.card`, `.row`):

[[exercise:05-closest-se-escapa-del-contenedor.md-(script.js)]]

```text
Listo: pulsa «Aguacates»; luego, el hueco entre dos productos (con y sin la casilla)
// Tras pulsar «Aguacates»:
🛒 comprado → «Aguacates»: true
// Tras pulsar el hueco entre dos productos (casilla sin marcar): el panel entero queda tachado
🐛 comprado → «Panel de la lista de la compra»: true
// Tras marcar la casilla y pulsar otra vez el hueco:
✅ clic en el hueco (target: UL#shopping): ignorado
```

La comprobación es una línea: `if (!item || !container.contains(item)) return;`. `contains` devuelve `true` si el nodo es el propio contenedor o uno de sus descendientes. Otra opción es un selector que no pueda escaparse, anclado al contenedor: `closest('#shopping > .item')`.

## Delegar otros eventos

Cualquier evento que **burbujea** se puede delegar, no solo `click`. Un formulario o una tabla pueden escuchar `input` y `change` de todos sus campos, `keydown` de todos sus botones, o `focusin` (que no `focus`, lección «Propagación») para saber qué campo tiene el foco:

[[exercise:06-delegar-input.md-(script.js)]]

```text
Listo: cambia las cantidades (escribe o usa las flechas del campo)
// Tras subir el café a 2 y la vainilla a 1 con las flechas de cada campo:
✏️ Café de Chiapas 500 g → 1 · total $210.00
✏️ Café de Chiapas 500 g → 2 · total $420.00
✏️ Vainilla de Papantla → 1 · total $518.50
```

El evento `input` llega en cada cambio del valor (cada tecla, cada clic en las flechas del campo); la diferencia con `change` y la lectura de los valores de cada tipo de control son tema del módulo «Formularios con JavaScript». El resaltado de la fila activa, otra vez, es CSS (`tr:focus-within`).

| Se puede delegar | No se puede delegar directamente |
|------------------|----------------------------------|
| `click`, `dblclick`, `contextmenu`, `auxclick` | `focus`, `blur` → usa `focusin`, `focusout` |
| `input`, `change`, `submit`, `reset` | `mouseenter`, `mouseleave` → usa `mouseover`, `mouseout` |
| `keydown`, `keyup` | `pointerenter`, `pointerleave` → usa `pointerover`, `pointerout` |
| `pointerdown`, `pointermove`, `pointerup`, `mouseover`, `mouseout` | `load`, `error` de imágenes → escucha en captura |
| `focusin`, `focusout` | `scroll` de un elemento |

## Un ejemplo completo: tabla ordenable

Juntando las piezas: una tabla cuyas cabeceras son botones (así funcionan con el teclado sin código extra), un listener en el `<thead>` que atiende a todas, `closest` para encontrar el botón y su `<th>`, y `append` de las filas existentes para reordenarlas. `append` de un nodo que ya está en la página lo **mueve**, como viste en el módulo «El DOM», así que las filas no se duplican:

[[exercise:07-tabla-ordenable.md]]

[[exercise:07-tabla-ordenable.md-(script.js)]]

```text
Listo: pulsa «Precio» dos veces y luego «Origen»
// Tras pulsar «Precio»:
↕ price (ascending) → Ánimas (Guerrero), Veracruz, Chiapas, Oaxaca
// Tras pulsar «Precio» otra vez:
↕ price (descending) → Oaxaca, Chiapas, Veracruz, Ánimas (Guerrero)
// Tras pulsar «Origen»:
↕ origin (ascending) → Ánimas (Guerrero), Chiapas, Oaxaca, Veracruz
```

`aria-sort` en el `<th>` ordenado le dice al lector de pantalla cómo está ordenada la tabla, y el CSS lo usa también para dibujar las flechas: un solo atributo para la vista y para la accesibilidad.

## Cuándo no delegar

La delegación es la opción por defecto para listas y colecciones, pero no para todo:

- Eventos muy frecuentes (`pointermove`, `scroll`, `wheel`): un listener en `document` que recibe **todos** los movimientos de la página y los filtra con `closest` hace mucho trabajo inútil. Escucha en el elemento concreto, y solo mientras haga falta (lección «Teclado, ratón y puntero»).
- Elementos únicos que no cambian (el botón «Pagar», el campo de búsqueda): un listener directo es más claro.
- Componentes independientes: un widget que escucha en `document` depende de que nadie corte la propagación por el camino (el `stopPropagation` de la lección anterior rompe también la delegación).

## Bestiario

- **Los elementos nuevos no responden.**
  Síntoma: los botones que estaban al cargar funcionan, pero los de los elementos añadidos después no hacen nada, sin errores.
  Causa: los listeners se registraron en cada elemento existente; los creados después nacieron sin listener.
  Solución: delega en el contenedor que existe desde el principio y usa `event.target.closest(...)`.
  → [ver ejemplo](02-elementos-dinamicos.md)
- **`closest` encuentra un elemento de fuera.**
  Síntoma: un clic en una zona vacía del contenedor actúa sobre un elemento que lo **envuelve** (un panel entero tachado, borrado o seleccionado).
  Causa: `closest` sube por todo el documento y encontró un antepasado del contenedor que encaja con el selector.
  Solución: comprueba `container.contains(item)` antes de actuar, o usa un selector anclado (`#lista > .item`).
  → [ver ejemplo](05-closest-se-escapa-del-contenedor.md)

## Resumen

- Delegar es escuchar en un contenedor y averiguar con `event.target.closest(selector)` qué elemento interior se pulsó.
- Funciona gracias a la burbuja: sirve para cualquier evento que burbujea (`click`, `input`, `keydown`, `focusin`…).
- Los elementos añadidos después funcionan sin registrar nada; los movidos o borrados no dejan listeners colgando.
- `closest` sube (incluido el propio elemento); `matches` solo comprueba el elemento.
- `data-action` + un `Map` de acciones separan el qué (HTML) del cómo (JS).
- `closest` puede escaparse del contenedor: comprueba `contains`.
- No delegues eventos muy frecuentes en `document` ni dependas de la delegación si alguien detiene la propagación.

## Para profundizar

- [javascript.info: delegación de eventos](https://es.javascript.info/event-delegation)
- [MDN: Element.closest()](https://developer.mozilla.org/es/docs/Web/API/Element/closest)
- [MDN: Node.contains()](https://developer.mozilla.org/es/docs/Web/API/Node/contains)
- [WAI-ARIA APG: tabla ordenable (en inglés)](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
