# Crear y modificar elementos

## Por qué importa

Una página con JavaScript cambia sin recargarse: aparece un producto en el carrito, llega un comentario, una lista se ordena. Todo eso es crear nodos, colocarlos en el árbol, cambiarlos y quitarlos. Hay muchas formas de hacerlo y casi todas «funcionan» en la primera prueba; las diferencias aparecen después: un comentario que ejecuta código ajeno, un botón que deja de responder, un texto escrito que desaparece o una plantilla que solo sirve una vez.

## Crear e insertar

`document.createElement('li')` crea un elemento **suelto**: existe como objeto, pero no está en el árbol, así que no se ve (`isConnected` vale `false`). Le pones su contenido con `textContent` y después lo colocas con uno de estos cuatro métodos, que se llaman sobre el elemento de referencia:

```text
            list.before(x)      ← hermano anterior
<ul id="list">
            list.prepend(x)     ← primer hijo
  <li>Tortillas de maíz</li>
            list.append(x)      ← último hijo
</ul>
            list.after(x)       ← hermano siguiente
```

Los cuatro aceptan **varios** argumentos, y los strings se convierten en nodos de texto: `item.append('Queso ', strong, ' (500 g)')` crea un texto, coloca el `<strong>` y crea otro texto, en ese orden.

[[exercise:01-crear-e-insertar.md-]]

```text
creado → <li>Frijoles negros</li>
¿está en la página? → false
¿y ahora? → true
lista → (4) ['Aguacates', 'Tortillas de maíz', 'Frijoles negros', 'Queso Oaxaca (500 g)']
el queso → <li>Queso <strong>Oaxaca</strong> (500 g)</li>
#app → (4) ['H1', 'H2', 'UL', 'P']
```

`outerHTML` es el HTML del elemento incluido él mismo; `innerHTML`, solo el de su contenido. En código antiguo verás `appendChild(nodo)` e `insertBefore(nodo, referencia)`: hacen lo mismo con un solo nodo y sin strings. Los métodos nuevos son más cómodos; los antiguos siguen funcionando.

> **Desde Python:** con `xml.etree.ElementTree`, `ET.SubElement(lista, 'li').text = 'Frijoles'` crea, rellena y engancha en una línea. En el DOM son tres pasos: `createElement`, `textContent` y `append`.

## Quitar y reemplazar

`el.remove()` saca el elemento del árbol. No lo destruye: si una variable lo sigue apuntando, puedes volver a insertarlo (el recolector de basura solo lo libera cuando nadie lo apunta). `old.replaceWith(nuevo)` pone otro nodo (u otros) en su lugar. Y `el.replaceChildren(...nodos)` cambia **todos** los hijos de una vez; sin argumentos, vacía el elemento:

[[exercise:02-quitar-y-reemplazar.md-]]

```text
¿la promo está en la página? → false
la promo sigue en memoria → 🎁 Envío gratis en pedidos de más de $500
estado → Estado: Enviado 🚚
productos tras vaciar → 0
productos ahora → 1 | 3 productos entregados al repartidor
¿la promo ha vuelto? → true
```

`replaceChildren()` es la forma moderna de vaciar un elemento. En código antiguo verás `el.innerHTML = ''` (que obliga al parser a trabajar para nada) o un bucle con `removeChild`.

## Texto o HTML: `textContent` e `innerHTML`

Hay dos propiedades para cambiar el contenido de un elemento, y la diferencia es de seguridad:

- `el.textContent = texto` borra los hijos y pone **un nodo de texto**. Lo que haya en el string se ve tal cual, con sus `<` y `>`: nunca se interpreta.
- `el.innerHTML = html` borra los hijos y **parsea** el string como HTML: las etiquetas se convierten en elementos.

En el módulo «Iteradores, generadores y metaprogramación» viste que construir HTML con plantillas abre un agujero cuando los valores vienen de un usuario: el navegador no distingue tu marcado del que venía dentro de los datos. Allí solo imprimías el string. Aquí lo metes en la página con `innerHTML`, y el agujero se convierte en un ataque **XSS** (*cross-site scripting*): el código del atacante se ejecuta con los permisos de tu web.

[[exercise:03-innerhtml-y-xss.md]]

```text
🐛 <img> creados → 1
🐛 <script> creados → 1
✅ <img> creados → 0
✅ ¿se lee «<img» como texto? → true
💥 se ejecutó el código de una opinión
```

Fíjate en dos detalles. El `<script>` insertado con `innerHTML` **no se ejecuta**: el estándar lo marca como inerte. Eso no protege de nada, porque cualquier atributo `on…` sí se ejecuta, y `<img src="x" onerror="…">` es el ataque clásico: la imagen no existe, falla al cargar y dispara su `onerror`. Y el aviso sale el último, cuando falla la descarga, después de que el script termine.

La regla es simple: **el texto de los usuarios va con `textContent`** (o en strings dentro de `append`), nunca con `innerHTML`. `createElement` + `textContent` es más largo, pero no tiene agujeros.

### HTML seguro

A veces necesitas generar mucho HTML con datos dentro, y crear cada nodo a mano es pesado. La lección «Plantillas etiquetadas» te dejó la solución preparada: la etiqueta `html`, que escapa **todos** los valores y deja intacto solo el texto de la plantilla, que escribiste tú. Con ella, lo que llega a `innerHTML` es marcado tuyo con los datos convertidos en texto. Y si lo que tienes que mostrar es HTML ajeno con formato (un comentario con negritas), Chrome trae **`setHTML()`**, que lo pasa antes por el *Sanitizer* del navegador: quita los `<script>`, los atributos `on…` y las URL `javascript:`:

[[exercise:04-html-seguro.md]]

```text
elementos <li> → 3
<img> creados → 0
el tercer autor, como texto → <img src="x" onerror="document.body.style.background = 'crimson'">
setHTML deja → <b>¡Me encantó!</b>
```

`setHTML()` es muy reciente y no todos los navegadores lo tienen todavía, así que el ejemplo comprueba que existe antes de usarlo (y si no, muestra el comentario como texto). Librerías como lit-html funcionan con el esquema de la etiqueta `html`; para limpiar HTML en navegadores sin `setHTML`, la librería de referencia es DOMPurify.

### `innerHTML +=` lo reconstruye todo

Hay un segundo problema con `innerHTML`, sin atacantes de por medio. `el.innerHTML += nuevo` parece «añadir al final», pero es `el.innerHTML = el.innerHTML + nuevo`: el navegador **serializa** todo el contenido a texto, le pega lo nuevo y lo **parsea entero** otra vez. Cada elemento que había se sustituye por una copia recién creada, que solo conserva lo que se puede escribir en HTML: etiquetas, atributos y texto.

[[exercise:05-innerhtml-mas-igual.md]]

```text
🐛 tras innerHTML +=
  me gusta → 1
  respuesta → ""
  ¿el mismo botón? → false
✅ tras insertAdjacentHTML
  me gusta → 2
  respuesta → "Yo le pondría más chile"
  ¿el mismo botón? → true
```

Las copias no tienen los listeners (no son atributos), los campos pierden lo escrito (el texto vive en la propiedad `value`, no en el HTML) y, si el foco estaba en un campo, se pierde. Además, tus variables siguen apuntando a los elementos viejos, que ya no están en la página.

Para añadir HTML sin tocar lo que hay, usa `insertAdjacentHTML(posición, html)`, que parsea **solo** el texto nuevo. Sus cuatro posiciones son las de `before`, `prepend`, `append` y `after`:

```text
<!-- beforebegin -->
<section>
  <!-- afterbegin -->
  …contenido…
  <!-- beforeend -->
</section>
<!-- afterend -->
```

Tiene dos hermanos con las mismas posiciones: `insertAdjacentElement(posición, el)` e `insertAdjacentText(posición, texto)`. El último es seguro con texto de usuarios; `insertAdjacentHTML` interpreta HTML, con el mismo riesgo de XSS que `innerHTML`.

### `textContent` e `innerText`

Para **leer** texto hay otra propiedad que se parece a `textContent` y no es igual. `textContent` concatena los nodos de texto del árbol, tal cual. `innerText` devuelve el texto **como se ve**: aplica el CSS, así que respeta `text-transform`, omite lo que está oculto y convierte los bloques en saltos de línea.

[[exercise:06-textcontent-e-innertext.md-]]

```text
textContent → "\n  Mole poblano\n  Tiempo: 2 h\n  Nota interna: subir el precio en diciembre\n"
innerText → "MOLE POBLANO\n\nTiempo: 2 h"
🐛 title.innerText → MOLE POBLANO
✅ title.textContent → Mole poblano
🐛 ¿recipe.innerText incluye la nota? → false
🐛 note.innerText → Nota interna: subir el precio en diciembre
textContent = … → "Tuesta los chiles.\nNo los quemes."
innerText = … → "Tuesta los chiles.<br>No los quemes."
```

El título «cambia» según el CSS, el texto oculto desaparece… salvo cuando el oculto es el propio elemento (entonces no hay nada «visible» que calcular y devuelve su `textContent`). Y hay un coste escondido: para saber qué se ve, el navegador tiene que calcular los estilos y el layout en ese momento, algo que la lección «Medidas y layout» explica. Usa `textContent` para leer y escribir texto, e `innerText` solo cuando necesites exactamente lo que ve el usuario.

## Un nodo vive en un solo sitio

Un nodo tiene **un** padre. Si haces `append` de un elemento que ya está en la página, no se copia: se **mueve**. Es la causa de un bug muy repetido (el producto que desaparece del catálogo al ponerlo en «Destacados») y también de una técnica útil: reordenar una lista moviendo sus elementos, sin crearlos de nuevo.

[[exercise:07-append-mueve.md]]

```text
🐛 destacados → 1 | catálogo → 2
🐛 padre de Chiapas → featured
✅ destacados → 1 | catálogo → 3
reordenado → (3) ['Molinillo manual', 'Café de Chiapas', 'Café de Veracruz']
🐛 before → ¿el iframe conserva su página? → false
✅ moveBefore → ¿conserva su página? → true
```

Mover con `append` (o `before`, `prepend`…) es, por dentro, **sacar** el nodo y **volver a meterlo**. Para casi todo da igual, pero no para los elementos con estado: un `<iframe>` se recarga, un vídeo se detiene y un campo pierde el foco. En Chrome, `padre.moveBefore(nodo, referencia)` hace un movimiento **atómico**, sin sacar el nodo del documento, y conserva ese estado (con `null` como referencia, lo deja al final, como `append`).

## Copiar: `cloneNode`

Para tener el mismo nodo en dos sitios, cópialo. `el.cloneNode()` copia el elemento y sus atributos, **sin hijos**; `el.cloneNode(true)` lo copia con todo su contenido. La copia es fiel… demasiado en un caso y poco en otro:

[[exercise:08-clonenode.md-]]

```text
cloneNode() → <li class="product" id="first-product"></li>
🐛 elementos con ese id → 2
🐛 getElementById da el primero → Café de Chiapas
🐛 tras un clic en la copia → 0
tras un clic en el original → 1
✅ tras un clic en la copia → 2
✅ elementos con ese id → 1
```

Copia **todos** los atributos, también el `id`, y dos elementos con el mismo `id` rompen `getElementById`, las etiquetas `<label for>` y los enlaces `#ancla`. Y **no** copia los listeners: se añadieron con JavaScript y no forman parte del HTML. Quita o cambia el `id` de la copia y vuelve a conectar sus botones (en el módulo de eventos verás la **delegación**, que lo evita).

## Muchos nodos de una vez: `DocumentFragment`

Un `DocumentFragment` es un nodo contenedor que no tiene padre ni se dibuja: un sitio donde montar varios nodos fuera de la página. Al insertarlo en el árbol entran **sus hijos**, todos en una sola operación, y el fragmento se queda vacío:

[[exercise:09-documentfragment.md-]]

```text
fragment → #document-fragment
nodeType → 11 | hijos → 3
<li> en la lista → 3
primer hijo de la lista → LI
hijos del fragmento → 0
métodos de pago → 3
```

Durante años, el fragmento fue la forma de insertar cien filas sin cien actualizaciones de la página. Hoy `append(...nodos)` hace lo mismo con un array, y el navegador agrupa los cambios hasta que alguien lee una medida (lo verás en la lección «Medidas y layout»). Los fragmentos siguen importando por una razón: el contenido de un `<template>` es uno.

## Plantillas: `<template>`

En la lección «Template y metadatos» del capítulo de HTML viste que `<template>` guarda un trozo de HTML inerte en `template.content`, un `DocumentFragment` que no forma parte del documento, y que hay que clonarlo antes de usarlo. Ahora es cuando ese aviso muerde. El patrón para pintar una lista a partir de datos es: clonar el contenido, rellenar los huecos de la copia con `querySelector` y `textContent`, insertar la copia. Si te saltas el primer paso, la plantilla funciona **una vez**:

[[exercise:10-template-se-vacia.md]]

```text
template.content → #document-fragment
document.querySelector('.dish') → null
🐛 insertado → Sopa de lima | nodos que quedan en la plantilla → 0
⛔ TypeError | Cannot set properties of null (setting 'textContent')
✅ platos → 3
✅ nodos que quedan en la plantilla → 3
```

Como cualquier fragmento, `template.content` se vacía al insertarlo: sus nodos se mueven a la lista. En la segunda vuelta, `querySelector('.name')` ya no encuentra nada y devuelve `null`. `template.content.cloneNode(true)` y `document.importNode(template.content, true)` crean la copia; para HTML normal son equivalentes (la diferencia aparece con los Web Components del último módulo del capítulo).

Plantilla + datos + `textContent` es la base de cualquier interfaz que se pinta desde datos: una función que recibe el estado y llama a `replaceChildren` con los nodos nuevos. En la integración de este módulo conectarás con el DOM el *store* reactivo con `Proxy` del módulo «Iteradores, generadores y metaprogramación», para que cada cambio redibuje la parte de la página que depende de él.

## Bestiario

- **El comentario que ejecuta código.**
  Síntoma: un texto escrito por un usuario crea elementos en tu página o ejecuta JavaScript (un `<img onerror>`, un enlace `javascript:`).
  Causa: `innerHTML` (o `insertAdjacentHTML`) interpreta el string como HTML, datos incluidos: es un XSS.
  Solución: `textContent` o `createElement` + `append` para el texto ajeno; la etiqueta `html` que escapa los valores; `setHTML()` en Chrome si necesitas HTML ajeno con formato.
  → [ver ejemplo](03-innerhtml-y-xss.md)
- **El botón que deja de funcionar al añadir algo.**
  Síntoma: después de `el.innerHTML += …`, los botones no responden, los campos se vacían y el foco se pierde.
  Causa: `+=` serializa y vuelve a parsear todo el contenido: los elementos de antes se sustituyen por copias sin listeners ni estado.
  Solución: `insertAdjacentHTML('beforeend', …)` o `append` de nodos creados con `createElement`.
  → [ver ejemplo](05-innerhtml-mas-igual.md)
- **El texto que cambia según el CSS.**
  Síntoma: `innerText` devuelve mayúsculas que no están en el HTML, le falta texto oculto o es lento en un bucle.
  Causa: `innerText` calcula el texto tal como se ve (aplicando el CSS, con layout); `textContent` lee el árbol.
  Solución: `textContent` salvo que necesites exactamente el texto visible.
  → [ver ejemplo](06-textcontent-e-innertext.md)
- **El elemento que desaparece de su sitio.**
  Síntoma: al añadir a otra lista un elemento que ya estaba en la página, desaparece de la primera; un iframe movido se recarga.
  Causa: un nodo solo puede estar en un sitio; `append` lo mueve (lo saca y lo vuelve a meter).
  Solución: `cloneNode(true)` para copiar; `moveBefore()` en Chrome para mover sin perder el estado.
  → [ver ejemplo](07-append-mueve.md)
- **La copia que no responde.**
  Síntoma: el botón de un elemento clonado no hace nada; `getElementById` devuelve el elemento equivocado.
  Causa: `cloneNode` copia los atributos (también el `id`) pero no los listeners.
  Solución: quita o cambia el `id` de la copia y conecta sus listeners (o usa delegación de eventos).
  → [ver ejemplo](08-clonenode.md)
- **La plantilla que sirve una sola vez.**
  Síntoma: el primer elemento se pinta bien y en el segundo salta `Cannot set properties of null (setting 'textContent')`.
  Causa: `template.content` es un fragmento: al insertarlo, sus nodos se mueven y la plantilla queda vacía.
  Solución: inserta siempre una copia: `template.content.cloneNode(true)` o `document.importNode(template.content, true)`.
  → [ver ejemplo](10-template-se-vacia.md)

## Resumen

- `createElement` crea un elemento suelto; `append`, `prepend`, `before` y `after` lo colocan, y aceptan varios nodos y strings.
- `remove` saca un nodo (sin destruirlo), `replaceWith` lo sustituye y `replaceChildren` cambia o vacía todos los hijos.
- `textContent` pone texto; `innerHTML` parsea HTML. El texto de los usuarios, siempre como texto: lo contrario es un XSS.
- Para HTML con datos, escapa los valores (la etiqueta `html`); para HTML ajeno, `setHTML()` en Chrome.
- `innerHTML +=` reconstruye todo el contenido; `insertAdjacentHTML` añade sin tocar lo demás.
- `innerText` es el texto visible (CSS, layout); `textContent`, el del árbol.
- Un nodo vive en un solo sitio: `append` mueve; `cloneNode(true)` copia (atributos sí, listeners no); `moveBefore` mueve conservando el estado.
- Un `DocumentFragment` inserta sus hijos de una vez y se vacía; `template.content` es uno, así que se clona antes de usarlo.

## Para profundizar

- [MDN: Element.append()](https://developer.mozilla.org/es/docs/Web/API/Element/append)
- [javascript.info: modificando el documento](https://es.javascript.info/modifying-document)
- [OWASP: prevención de XSS (en inglés)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Element.setHTML() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)
- [MDN: Element.moveBefore() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore)
