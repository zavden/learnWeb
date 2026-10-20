# Atributos y propiedades

## Por qué importa

En el HTML, un elemento tiene **atributos**: `id="qty"`, `value="1"`, `class="card"`. En JavaScript, el mismo elemento es un objeto con **propiedades**: `input.id`, `input.value`, `card.className`. Casi siempre se corresponden, y por eso es fácil creer que son lo mismo. No lo son, y la diferencia explica media docena de bugs clásicos: el campo que «no guarda» lo que escribió el usuario, el botón que `disabled="false"` desactiva, el `if` que entra con `'false'` o el estilo que `el.style` no encuentra.

## Atributos y propiedades

Los **atributos** son el texto que escribiste en el HTML. Se manejan con métodos y siempre son strings (o `null` si no existen):

| Método | Hace |
|--------|------|
| `getAttribute(nombre)` | devuelve el valor, o `null` si no está |
| `setAttribute(nombre, valor)` | lo crea o lo cambia (el valor se convierte a string) |
| `hasAttribute(nombre)` | `true` o `false` |
| `removeAttribute(nombre)` | lo quita |
| `toggleAttribute(nombre, forzar?)` | lo pone o lo quita (para los booleanos) |
| `getAttributeNames()` | la lista de nombres |

Las **propiedades** son las del objeto de JavaScript. Para cada atributo estándar, el navegador crea una propiedad **reflejada**: cambiar una cambia el otro. Casi siempre tienen el mismo nombre (`id`, `title`, `lang`, `href`), con dos excepciones heredadas de cuando `class` y `for` eran palabras reservadas: `className` y `htmlFor`. Los atributos inventados no tienen propiedad, y tampoco son HTML válido: para datos propios están los `data-*`.

[[exercise:01-atributos-y-propiedades.md-]]

```text
getAttribute('class') → recipe-link
getAttribute('target') → null
hasAttribute('target') → false
con title → <a href="/recetas/mole-poblano" class="recipe-link" sku="REC-118" title="Receta completa con fotos">Ver la receta</a>
getAttributeNames() → (3) ['href', 'class', 'sku']
getAttribute('HREF') → /recetas/mole-poblano
tras link.id = … → getAttribute('id'): main-recipe
tras className = … → getAttribute('class'): recipe-link featured
label.htmlFor → servings | getAttribute('for') → servings
link.sku → undefined | getAttribute('sku') → REC-118
```

La consola imprime los elementos con sus **atributos** (como el panel Elements de DevTools). Lo verás enseguida: una propiedad que no está reflejada en un atributo no aparece ahí.

## `value`: el valor inicial y el actual

La excepción más importante es `value` en los campos de formulario. El **atributo** `value` es el valor **inicial** del campo, y la propiedad que lo refleja es `defaultValue`. La **propiedad** `value` es el valor **actual**: lo que hay escrito ahora. Cuando el usuario escribe (o tu código asigna `input.value`), cambia la propiedad, no el atributo:

```text
<input value="1">           el usuario escribe 3
                            ┌──────────────────────────┐
  atributo  value="1"  ──►  │ getAttribute('value') "1"│  ← el valor inicial
                            │ defaultValue          "1"│
                            │ value                 "3"│  ← el valor actual
                            └──────────────────────────┘
```

[[exercise:02-value-no-es-el-atributo.md-]]

```text
qty.value → 3
🐛 getAttribute('value') → 1
defaultValue → 1
qty → <input id="qty" type="number" min="1" value="1">
🐛 tras setAttribute('value', '5') → value: 3 | defaultValue: 5
✅ qty.value = 2 → 2 (typeof: string)
gift.checked → true
🐛 hasAttribute('checked') → false
defaultChecked → false
```

Fíjate en la cuarta línea: la consola sigue enseñando `value="1"`, porque enseña atributos. Y en la quinta, el bug que de verdad se escapa: mientras nadie haya tocado el campo, cambiar el atributo cambia lo que se ve; en cuanto el valor cambia una vez, el atributo ya solo controla el valor inicial. Con `checked` y `defaultChecked` pasa exactamente lo mismo. La regla: **para leer o cambiar lo que hay en un campo, usa la propiedad**. Y recuerda que `value` siempre es un string, también en un `type="number"` (en el módulo de formularios verás `valueAsNumber`).

## Propiedades que transforman el valor

Otras propiedades reflejadas no devuelven el texto del atributo tal cual, sino su valor **interpretado**:

- `a.href` (y `img.src`, `form.action`…) devuelve la URL **absoluta**, resuelta contra la de la página, como hacía la API `URL` en la lección «Cómo funciona la web». El enlace también tiene las partes por separado: `pathname`, `hash`, `search`, `hostname`.
- `input.type` devuelve un tipo que el navegador conoce: un valor inventado se convierte en el de por defecto, `'text'`.
- Los atributos numéricos (`colSpan`, `start`, `maxLength`, `tabIndex`) son `number`.

[[exercise:03-propiedades-que-transforman.md-]]

```text
getAttribute('href') → /recetas/mole-poblano
🐛 link.href → http://localhost:3001/recetas/mole-poblano
link.pathname → /recetas/mole-poblano
🐛 link.href === '/recetas/mole-poblano' → false
✅ getAttribute('href') === '/recetas/mole-poblano' → true
getAttribute('type') → fecha
🐛 birthday.type → text
getAttribute('start') → "3" | steps.start → 3
colSpan + 1 → 3 | getAttribute('colspan') + 1 → 21
```

El origen de `link.href` depende de dónde se ejecute la página: en el editor de LearnWeb y en el diálogo «▶ Run» es `http://localhost:3001`, y en las tarjetas de la teoría (copias aisladas de la página, que resuelven las rutas desde la aplicación), `http://localhost:5174`. El bug típico es comparar `link.href` con una ruta relativa (para marcar el enlace de la página actual, por ejemplo) y no encontrar nunca coincidencia: compara con `getAttribute('href')` o con `link.pathname`.

## Atributos booleanos desde JavaScript

En la lección «Elementos y atributos» del capítulo de HTML viste que un atributo booleano (`disabled`, `checked`, `hidden`, `required`, `open`…) funciona por **presencia**: `disabled="false"` desactiva. Desde JavaScript, la trampa vuelve con `setAttribute`, porque el valor que le pasas no importa. La propiedad, en cambio, es un booleano de verdad: `button.disabled = false` **quita** el atributo. Y `toggleAttribute(nombre, condición)` lo pone o lo quita según una condición, sin `if`:

[[exercise:04-atributos-booleanos-desde-js.md]]

```text
🐛 tras setAttribute('disabled', 'false') → disabled: true
🐛 el botón → <button type="button" id="pay-bug" disabled="false">Pagar $487.20 (🐛)</button>
✅ disabled = true → <button type="button" id="pay" disabled>Pagar $487.20 (✅)</button>
✅ disabled = false → hasAttribute('disabled'): false
✅ toggleAttribute con el carrito vacío → disabled: true
✅ toggleAttribute con productos → disabled: false
aria-expanded → true
detailsButton.ariaExpanded → "true"
```

Ojo con generalizar: los atributos ARIA **no** son booleanos. `aria-expanded`, `aria-pressed` o `aria-hidden` valen el texto `"true"` o `"false"`, y quitar el atributo no significa «falso», sino «este control no tiene ese estado». Con ellos, `setAttribute('aria-expanded', 'false')` es lo correcto.

## `dataset`: los atributos `data-*`

Para guardar datos propios en un elemento (un id de producto, un precio, un estado), HTML reserva los atributos `data-*`. En JavaScript se leen y escriben en `el.dataset`, con el nombre **sin** `data-` y en **camelCase**: `data-product-id` es `dataset.productId`, y al revés. Y como son atributos, sus valores son **siempre strings**:

[[exercise:05-dataset.md]]

```text
dataset → DOMStringMap {productId: '42', inStock: 'false', priceCents: '21000'}
dataset.productId → 42
🐛 dataset['product-id'] → undefined
🐛 if (dataset.inStock) → entra, aunque vale 'false' (un string no vacío)
✅ dataset.inStock === 'true' → false
🐛 priceCents + 100 → 21000100
✅ Number(priceCents) + 100 → 21100
getAttribute('data-last-viewed') → 2026-10-14
hasAttribute('data-last-viewed') → false
🐛 veracruz.dataset → DOMStringMap {productid: '43'}
🐛 veracruz.dataset.productId → undefined
```

`'false'` es un string no vacío, así que es *truthy* (lección «Operadores y coerción»), y `'21000' + 100` concatena. Convierte al leer: `=== 'true'`, `Number(…)`, `JSON.parse(…)` si guardaste un JSON. La última trampa viene del parser: los nombres de atributo se pasan a minúsculas, así que `data-productId` en el HTML acaba siendo `dataset.productid`. Escribe los `data-*` siempre en minúsculas y con guiones.

## `classList`: las clases de una en una

El atributo `class` es una lista de nombres separados por espacios, y casi nunca quieres cambiarla entera: quieres añadir o quitar **una** clase. Para eso está `el.classList`, un `DOMTokenList` con métodos para cada operación:

| Método | Hace |
|--------|------|
| `add('a', 'b')` / `remove('a', 'b')` | añade o quita una o varias |
| `contains('a')` | `true` si la tiene |
| `toggle('a')` | la quita si está y la pone si no; devuelve si quedó puesta |
| `toggle('a', condición)` | la pone si la condición es verdadera y la quita si es falsa |
| `replace('a', 'b')` | cambia una por otra en su sitio |

[[exercise:06-classlist.md]]

```text
classList.value → card | length → 1
add → card featured compact
remove → card featured
contains('featured') → true
toggle('sold-out') → true
toggle('sold-out') → false
toggle forzado, stock 0 → true
otra vez → true
replace('featured', 'highlighted') → true
classList → DOMTokenList(3) ['card', 'highlighted', 'sold-out', value: 'card highlighted sold-out']
[...classList] → (3) ['card', 'highlighted', 'sold-out']
```

`toggle` con dos argumentos es el más útil: `card.classList.toggle('sold-out', stock === 0)` mantiene la clase sincronizada con un dato, sin `if`. Cambiar clases y dejar el aspecto al CSS es la forma recomendada de cambiar estilos desde JavaScript: el diseño se queda en la hoja de estilos.

### `className` sustituye todas las clases

`className` es la propiedad reflejada del atributo `class` **entero**. Asignarle un nombre borra todos los demás, y el elemento pierde de golpe su aspecto:

[[exercise:07-classname-sobrescribe.md]]

```text
🐛 className → sold-out
✅ className → card featured sold-out
🐛 className += sin espacio → card featuredsold-out
🐛 dos veces += → card featured sold-out sold-out
✅ classList.add → card featured sold-out
```

`className` sigue siendo útil para **leer** la lista como texto o para fijar todas las clases a propósito (al crear un elemento, por ejemplo). Para cambiar una, `classList`.

## `style` y `getComputedStyle`

`el.style` es la propiedad reflejada del atributo `style`: los estilos **inline** del elemento, y solo esos. Si el color de un precio está en una regla de tu hoja, `price.style.color` es `''`. Para saber qué estilo tiene **de verdad** un elemento, después de la cascada, la herencia y las unidades, se usa `getComputedStyle(el)`, que devuelve los valores **resueltos**: colores en `rgb(…)`, tamaños en `px`, porcentajes convertidos cuando dependen del layout:

[[exercise:08-style-y-getcomputedstyle.md]]

```text
🐛 price.style.color → ""
🐛 price.style.fontSize → ""
✅ color → rgb(185, 28, 28)
✅ fontSize → 20px
✅ getPropertyValue('font-size') → 20px
✅ ancho de la barra (50 % de 300px) → 150px
style.color → teal | atributo style → color: teal;
computed.color (el mismo objeto) → rgb(0, 128, 128)
tras style.color = '' → rgb(185, 28, 28)
--progress: 80% → ancho: 240px
```

Al **escribir**, `el.style.color = 'teal'` crea un estilo inline, que gana a cualquier regla de tu hoja salvo las `!important` (lección «Especificidad»). Por eso conviene usarlo poco: para valores que calcula JavaScript (una posición, un progreso), no para el diseño. Las propiedades con guion van en camelCase (`style.fontSize`) o con su nombre de CSS en `style.setProperty('font-size', …)`; las **variables CSS** solo con `setProperty('--progress', '80%')`. Pasar datos al CSS con una variable es la forma más limpia de combinar los dos mundos. Para volver a lo que diga la hoja, asigna `''` (o usa `removeProperty`).

Dos detalles más. El objeto de `getComputedStyle` está **vivo**: refleja los cambios aunque lo hayas pedido antes. Y leerlo puede obligar al navegador a recalcular estilos y layout en ese momento, igual que `innerText`; la lección siguiente explica por qué eso importa.

## `hidden` no siempre oculta

`el.hidden = true` pone el atributo `hidden`, que oculta gracias a una sola regla de la hoja del navegador: `[hidden] { display: none }`. En la lección «La propiedad display» del capítulo de CSS viste que cualquier `display` de tu hoja le gana. Desde JavaScript, el síntoma es desconcertante: la propiedad dice `true` y el elemento se sigue viendo:

[[exercise:09-hidden-pierde-contra-display.md]]

```text
🐛 bugToast.hidden → true
🐛 display → flex
✅ fixedToast.hidden → true
✅ display → none
```

La solución es la misma que en CSS: `[hidden] { display: none !important; }` al principio de tu hoja, para que `hidden` signifique «oculto» siempre. La alternativa es alternar una clase con `classList.toggle('is-hidden', …)`.

## Bestiario

- **El campo que no guarda lo escrito.**
  Síntoma: `getAttribute('value')` devuelve el valor viejo; `setAttribute('value', …)` no cambia lo que se ve.
  Causa: el atributo `value` es el valor inicial (`defaultValue`); lo escrito vive en la propiedad `value`.
  Solución: lee y escribe `input.value` (y `checked`, no `hasAttribute('checked')`).
  → [ver ejemplo](02-value-no-es-el-atributo.md)
- **El enlace que nunca coincide.**
  Síntoma: `link.href === '/recetas/mole-poblano'` es `false` aunque el HTML dice eso; un `type` inventado se lee como `'text'`.
  Causa: algunas propiedades devuelven el valor interpretado (URL absoluta, tipo válido, número), no el texto del atributo.
  Solución: `getAttribute` para el texto escrito; `link.pathname` para comparar rutas.
  → [ver ejemplo](03-propiedades-que-transforman.md)
- **`disabled="false"` desactiva.**
  Síntoma: después de `setAttribute('disabled', 'false')`, el botón sigue desactivado.
  Causa: los atributos booleanos funcionan por presencia; el valor no importa.
  Solución: la propiedad (`button.disabled = false`), `toggleAttribute('disabled', condición)` o `removeAttribute`. Los `aria-*` sí usan `"true"`/`"false"`.
  → [ver ejemplo](04-atributos-booleanos-desde-js.md)
- **El `if` que entra con `'false'`.**
  Síntoma: `if (el.dataset.inStock)` entra aunque el atributo vale `"false"`; una suma con un `data-*` concatena.
  Causa: `dataset` devuelve strings; además, el nombre pasa a camelCase y el parser pone el HTML en minúsculas.
  Solución: convierte al leer (`=== 'true'`, `Number()`); escribe `data-nombre-con-guiones` en minúsculas.
  → [ver ejemplo](05-dataset.md)
- **La tarjeta que pierde su estilo.**
  Síntoma: al marcar un elemento con una clase, pierde el resto de su aspecto.
  Causa: `className = 'x'` sustituye el atributo `class` entero.
  Solución: `classList.add`, `remove`, `toggle` y `replace`.
  → [ver ejemplo](07-classname-sobrescribe.md)
- **El estilo que `style` no encuentra.**
  Síntoma: `el.style.color` es `''` aunque el elemento es rojo.
  Causa: `el.style` solo contiene los estilos inline (el atributo `style`), no los de tus reglas.
  Solución: `getComputedStyle(el)` para leer el estilo final; clases o variables CSS para cambiarlo.
  → [ver ejemplo](08-style-y-getcomputedstyle.md)
- **`hidden` es `true` y se ve.**
  Síntoma: `el.hidden = true` no oculta el elemento.
  Causa: tu CSS le da un `display` que gana a la regla `[hidden] { display: none }` del navegador.
  Solución: `[hidden] { display: none !important; }` en tu hoja.
  → [ver ejemplo](09-hidden-pierde-contra-display.md)

## Resumen

- Atributos: el texto del HTML (`getAttribute`, `setAttribute`, `hasAttribute`, `removeAttribute`, `toggleAttribute`). Propiedades: el objeto JS. Los estándar están reflejados (`className` ↔ `class`, `htmlFor` ↔ `for`).
- En los campos, el atributo `value` es el valor inicial (`defaultValue`) y la propiedad `value`, el actual; igual con `checked`.
- `href`, `src`, `type` y los numéricos devuelven el valor interpretado; `getAttribute`, el texto escrito.
- Los booleanos se cambian con la propiedad o `toggleAttribute`, nunca con `setAttribute(…, 'false')`; los `aria-*` sí son texto.
- `dataset` traduce `data-nombre-largo` ↔ `nombreLargo` y siempre da strings.
- `classList` cambia clases de una en una (`toggle` con condición); `className =` las sustituye todas.
- `el.style` solo ve los estilos inline; `getComputedStyle` da los valores finales resueltos (y está vivo). Las variables CSS, con `setProperty`.
- `hidden` pierde contra cualquier `display` de tu hoja: añade `[hidden] { display: none !important; }`.

## Para profundizar

- [javascript.info: atributos y propiedades](https://es.javascript.info/dom-attributes-and-properties)
- [javascript.info: estilos y clases](https://es.javascript.info/styles-and-classes)
- [MDN: HTMLElement.dataset](https://developer.mozilla.org/es/docs/Web/API/HTMLElement/dataset)
- [MDN: Window.getComputedStyle()](https://developer.mozilla.org/es/docs/Web/API/Window/getComputedStyle)
- [HTML Standard: atributos reflejados (en inglés)](https://html.spec.whatwg.org/multipage/common-dom-interfaces.html#reflecting-content-attributes-in-idl-attributes)
