# Seleccionar elementos

## Por qué importa

Casi todo código que toca la página empieza igual: encontrar el elemento. El navegador te deja buscar con el mismo lenguaje que ya dominas, los **selectores CSS**, y eso hace que seleccionar parezca trivial. Las sorpresas están en lo que devuelve cada método: a veces un elemento, a veces `null`, a veces una lista que no es un array, y a veces una lista **viva** que cambia mientras la recorres.

## `getElementById` y `querySelector`

Hay dos formas de buscar **un** elemento:

- `document.getElementById('cart-count')` busca por `id`, que se escribe **sin** almohadilla. Solo existe en `document`, porque un `id` es único en toda la página.
- `querySelector('#cart-count')` acepta **cualquier selector CSS**: clases, atributos, combinadores, pseudoclases como `:last-child` o `:has()`. Devuelve el **primer** elemento que encaja, en el orden del documento.

`querySelector` existe también en cada elemento: `card.querySelector('.price')` busca solo entre los descendientes de `card`. Es la forma habitual de trabajar con un componente sin mirar el resto de la página:

[[exercise:01-getelementbyid-y-queryselector.md-]]

```text
getElementById → <span id="cart-count">0</span>
'#cart-count' → true
'.price' → $210.00
'[data-category="tools"] h2' → Molinillo manual
'.product:last-child .price' → $549.00
'.sold-out' → null
dentro del molinillo → $549.00
typeof grinder.getElementById → undefined
⛔ SyntaxError | Failed to execute 'querySelector' on 'Document': '#2026' is not a valid selector.
```

Un selector que no es CSS válido no devuelve `null`: lanza un `SyntaxError` (técnicamente, una `DOMException` con ese nombre). Pasa con los `id` que empiezan por un número, que en CSS necesitan escaparse; con ellos, `getElementById` es más cómodo.

¿Cuál usar? `querySelector` por su flexibilidad, y `getElementById` cuando ya tienes el `id`; la diferencia de velocidad no se nota salvo en bucles de miles de búsquedas. Lo que sí importa es no buscar lo mismo una y otra vez: guarda el elemento en una variable.

> **Desde Python:** si has usado BeautifulSoup, `soup.select_one('.price')` es `querySelector` y `soup.select('.price')` es `querySelectorAll`. La diferencia es que aquí no trabajas sobre una copia del HTML: el resultado es el elemento vivo de la página.

## Cuando no encuentra nada: `null`

Si ningún elemento encaja, `querySelector` y `getElementById` devuelven `null`, sin quejarse. El error aparece una línea más abajo, al usar el resultado: `Cannot read properties of null (reading 'textContent')`, el error más repetido de JavaScript en el navegador. Las dos causas habituales son una errata en el selector y un script que se ejecuta **antes** de que el parser llegue al elemento:

[[exercise:02-queryselector-devuelve-null.md-]]

```text
Uncaught TypeError: Cannot set properties of null (setting 'textContent')
🐛 #card-count → null
⛔ TypeError | Cannot read properties of null (reading 'textContent')
✅ con ?. → undefined
⛔ No hay ningún elemento para el selector "#card-count"
✅ #cart-count → <span id="cart-count">2</span>
```

Hay dos respuestas, según el caso. Si el elemento es **opcional** (un banner que no siempre está), el encadenamiento opcional `?.` corta en `null` y da `undefined`; no sirve para asignar (`el?.textContent = '2'` es un `SyntaxError`), así que para escribir usa un `if`. Si el elemento es **obligatorio**, lo mejor es fallar pronto y con un mensaje que diga qué falta, como hace `requireElement`: el error sale en la línea del problema y nombra el selector. En el capítulo 7, TypeScript te obligará a decidir qué hacer con ese `null` antes de usar el elemento.

## Muchos elementos: `querySelectorAll`

`querySelectorAll` devuelve **todos** los elementos que encajan, en el orden del documento, dentro de una `NodeList`. Tiene `length`, índices (`list[0]` o `list.item(0)`) y `forEach`. Y es **iterable**: en el módulo «Iteradores, generadores y metaprogramación» viste que las listas de nodos tienen `Symbol.iterator`, así que funcionan con `for…of`, el spread y la desestructuración:

[[exercise:03-queryselectorall.md-]]

```text
products → NodeList(3) [li.product, li.product.sold-out, li.product]
length → 3
[0] → Café de Chiapas
item(1) → Café de Nayarit
forEach 0 → Café de Chiapas
forEach 1 → Café de Nayarit
forEach 2 → Café de Veracruz
typeof products[Symbol.iterator] → function
desestructurando → Café de Chiapas + 2 más
.offer → length 0
```

Dentro de una lista, la consola abrevia cada elemento como `etiqueta#id.clases` (`li.product.sold-out`). Y cuando no encaja nada, el resultado es una lista **vacía**, nunca `null`: un bucle sobre ella simplemente no hace nada. Es la diferencia más útil entre los dos métodos: `querySelector` puede darte `null`; `querySelectorAll`, nunca.

### Una `NodeList` no es un array

`forEach` despista: una `NodeList` se parece a un array, pero no tiene `map`, `filter`, `reduce`, `find` ni `includes`. Y una `HTMLCollection` (lo que devuelven `children` o `getElementsByClassName`) ni siquiera tiene `forEach`:

[[exercise:04-nodelist-no-es-un-array.md]]

```text
⛔ TypeError | prices.map is not a function
Array.isArray(prices) → false
typeof prices.forEach → function
typeof prices.map → undefined
✅ [...prices].map → (3) [210, 185, 549]
✅ Array.from + reduce → 944
⛔ TypeError | items.forEach is not a function
for…of → Café de Chiapas · $210
for…of → Café de Veracruz · $185
for…of → Molinillo manual · $549
```

Las dos son iterables, así que la conversión es inmediata: `[...lista]` o `Array.from(lista)`. `Array.from(lista, fn)` convierte y mapea a la vez, sin crear un array intermedio. Para recorrer sin transformar, `for…of` funciona con las dos.

## Colecciones vivas y estáticas

Hay una diferencia menos visible entre los métodos de búsqueda: algunos devuelven una **foto** del momento de la consulta y otros, una colección **viva**, que se actualiza sola cada vez que la lees:

| Método | Devuelve | ¿Viva? |
|--------|----------|--------|
| `getElementById`, `querySelector` | un elemento o `null` | — |
| `querySelectorAll` | `NodeList` | **no**: estática |
| `getElementsByClassName`, `getElementsByTagName` | `HTMLCollection` | **sí** |
| `children` | `HTMLCollection` | **sí** |
| `childNodes` | `NodeList` | **sí** (la excepción entre las `NodeList`) |

Una colección viva es cómoda para preguntar «¿cuántos quedan ahora?», pero peligrosa en un bucle que cambia justo lo que la define. Si recorres los elementos con la clase `pending` y les quitas esa clase, cada uno **sale** de la colección al cambiarlo; el siguiente ocupa su índice y el `i++` se lo salta:

```text
i = 0   [A B C D E]  → A sale     [B C D E]
i = 1   [B C D E]    → C sale     [B D E]
i = 2   [B D E]      → E sale     [B D]
i = 3   3 < 2 → fin: B y D se quedan pendientes
```

[[exercise:05-colecciones-vivas.md]]

```text
🐛 pendientes antes → 5
🐛 pendientes después → 2
🐛 se saltó → (2) ['Preparar el relleno', 'Hacer las gorditas']
✅ pendientes después → 0
✅ la foto sigue teniendo → 5 elementos
```

La regla práctica: busca con `querySelectorAll` cuando vas a modificar lo que encuentras. Si ya tienes una colección viva, cópiala antes del bucle (`[...collection]`) o recórrela de atrás hacia delante.

## Buscar hacia arriba: `closest` y `matches`

`querySelector` busca hacia **abajo**. Muchas veces necesitas lo contrario: desde un botón, encontrar la tarjeta de producto que lo contiene. Para eso está `el.closest(selector)`, que sube por los antepasados, **empezando por el propio elemento**, y devuelve el primero que encaja (o `null` si llega a la raíz sin encontrarlo). Su pareja es `el.matches(selector)`, que solo responde `true` o `false`: ¿este elemento encaja con el selector?

[[exercise:06-closest-y-matches.md]]

```text
closest('.product') → p-chiapas
closest('ul') → products
closest('button') es el propio botón → true
closest('form') → null
#p-chiapas matches('.sold-out') → false
#p-nayarit matches('.sold-out') → true
#p-nayarit matches(':has(button:disabled)') → true
clic en → Café de Chiapas
```

El ejemplo escucha los clics con `addEventListener`, que se estudia en el módulo siguiente. Ahí verás que `closest` es la pieza central de la **delegación de eventos**: un solo oyente en la lista que, desde el elemento pulsado, sube con `closest` hasta la tarjeta que le interesa.

> **Desde Python:** en BeautifulSoup, `find_parent('li')` es casi `closest('li')`, con una diferencia: `closest` empieza por el propio elemento.

## `:scope`: el selector anclado al elemento

Buscar dentro de un elemento tiene una sorpresa. En `menu.querySelectorAll('nav li')`, el navegador comprueba el selector contra el **documento entero** y después se queda con los resultados que están dentro de `menu`. Si el `<nav>` está **fuera**, rodeando al menú, el selector encaja igualmente:

[[exercise:07-scope-en-queryselectorall.md-]]

```text
🐛 menu.querySelectorAll('nav li') → 5
✅ menu.querySelectorAll(':scope nav li') → 0
menu.querySelectorAll('li') → 5
✅ ':scope > li' → 3 (3) ['Inicio', 'Recetas', 'Contacto']
⛔ SyntaxError | Failed to execute 'querySelectorAll' on 'Element': '> li' is not a valid selector.
```

La pseudoclase `:scope` representa el elemento sobre el que buscas, y ancla el selector a él. Su uso más frecuente es `':scope > li'`: solo los hijos directos, sin los de las listas anidadas. Un selector no puede empezar por `>` sin nada delante; `:scope` es lo que va delante.

## Los `id` como variables globales

Hay una forma de «seleccionar» que no deberías usar, pero que verás en código antiguo y en respuestas de foros: escribir el `id` directamente, sin buscar nada. El estándar HTML conserva, por compatibilidad con los años noventa, el **acceso por nombre** en `window`: cada elemento con `id` aparece como una propiedad global con ese nombre. Funciona… hasta que el `id` coincide con algo que `window` ya tiene:

[[exercise:08-ids-globales.md-]]

```text
total → <output id="total">$487.20</output>
¿es el mismo que getElementById('total')? → true
window['past-orders'] → <ul id="past-orders">…</ul>
🐛 typeof status → string
🐛 status → ""
🐛 history.nodeName → undefined
🐛 ¿history es el historial del navegador? → true
✅ status → <p id="status">Pedido en preparación</p>
✅ history → SECTION Pedidos anteriores
```

`status`, `history`, `name`, `top`, `open`, `close`, `length`… `window` tiene cientos de propiedades, y cualquiera de ellas tapa a tu elemento. Además, una variable tuya con el mismo nombre también lo tapa, quien lee el código no sabe de dónde sale `total`, y si dos elementos comparten `id`, la «variable» es una colección. Busca siempre los elementos de forma explícita. Es la misma trampa que el `var name = 42` de la lección «Variables: let, const y var»: `window` ya tiene ese nombre, y gana.

## Bestiario

- **Cannot read properties of null.**
  Síntoma: `TypeError: Cannot read properties of null (reading 'textContent')` (o `setting`), en la línea que usa el elemento.
  Causa: `querySelector` no encontró nada y devolvió `null`: una errata en el selector, o el script se ejecutó antes de que existiera el elemento.
  Solución: revisa el selector; script al final del `<body>`, con `defer` o módulo; `?.` para elementos opcionales y un error claro para los obligatorios.
  → [ver ejemplo](02-queryselector-devuelve-null.md)
- **`map is not a function`.**
  Síntoma: `TypeError: lista.map is not a function` (o `forEach` en una `HTMLCollection`).
  Causa: `NodeList` y `HTMLCollection` no son arrays; solo comparten `length`, índices y (la `NodeList`) `forEach`.
  Solución: `[...lista]` o `Array.from(lista, fn)`; `for…of` para recorrer.
  → [ver ejemplo](04-nodelist-no-es-un-array.md)
- **El bucle que se salta uno de cada dos.**
  Síntoma: al cambiar o quitar elementos en un bucle, la mitad se quedan sin cambiar.
  Causa: la colección es viva (`getElementsByClassName`, `children`, `childNodes`): cada cambio la reordena mientras la recorres.
  Solución: `querySelectorAll` (estática), una copia con `[...colección]` o recorrer de atrás hacia delante.
  → [ver ejemplo](05-colecciones-vivas.md)
- **El selector que encuentra cosas que no están dentro.**
  Síntoma: `el.querySelectorAll('nav li')` devuelve resultados aunque dentro de `el` no hay ningún `nav`.
  Causa: el selector se comprueba contra todo el documento; solo los resultados se limitan a los descendientes de `el`.
  Solución: ancla el selector con `:scope` (`':scope nav li'`, `':scope > li'`).
  → [ver ejemplo](07-scope-en-queryselectorall.md)
- **La «variable» que no es el elemento.**
  Síntoma: un elemento con `id="status"` o `id="history"`, usado como variable global, resulta ser un texto u otro objeto.
  Causa: el acceso por nombre en `window` solo funciona si `window` no tiene ya una propiedad con ese nombre.
  Solución: no uses los `id` como variables; busca con `getElementById` o `querySelector`.
  → [ver ejemplo](08-ids-globales.md)

## Resumen

- `getElementById(id)` (sin `#`) y `querySelector(selector)` devuelven un elemento o `null`; `querySelector` también funciona dentro de un elemento.
- Un selector CSS no válido lanza un `SyntaxError`; un selector válido que no encaja da `null`.
- Ante `null`: `?.` si el elemento es opcional, un error claro si es obligatorio.
- `querySelectorAll` devuelve una `NodeList` estática, iterable, con `forEach` pero sin `map`; vacía si no encaja nada.
- `[...lista]` y `Array.from(lista, fn)` convierten cualquier lista de nodos en un array.
- `getElementsByClassName`, `children` y `childNodes` son vivas: no las modifiques mientras las recorres.
- `closest` sube hasta el primer antepasado que encaja (empezando por el propio elemento); `matches` comprueba un elemento.
- `:scope` ancla un selector al elemento sobre el que buscas; `':scope > li'` da los hijos directos.
- No uses los `id` como variables globales.

## Para profundizar

- [MDN: Document.querySelector()](https://developer.mozilla.org/es/docs/Web/API/Document/querySelector)
- [MDN: Element.closest()](https://developer.mozilla.org/es/docs/Web/API/Element/closest)
- [javascript.info: buscar con getElement* y querySelector*](https://es.javascript.info/searching-elements-dom)
- [MDN: :scope (en inglés)](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope)
- [HTML Standard: acceso por nombre en Window (en inglés)](https://html.spec.whatwg.org/multipage/nav-history-apis.html#named-access-on-the-window-object)
