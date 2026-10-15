# Web Components: elementos propios y Shadow DOM

## Por qué importa

HTML trae elementos con comportamiento y estructura propios: `<details>` se abre y se cierra, `<dialog>` atrapa el foco, `<input type="date">` dibuja un calendario que tu CSS no puede romper. Los **Web Components** te dejan crear los tuyos: un `<price-tag>` que formatea su precio, un `<rating-stars>` que avisa cuando cambia, un `<rating-field>` que se envía con el formulario. Funcionan en cualquier página, con cualquier framework o sin ninguno, porque son HTML del navegador.

Son tres piezas que se usan juntas o por separado: los **custom elements** (una clase de JavaScript asociada a un nombre de etiqueta, con un ciclo de vida), el **Shadow DOM** (un árbol privado con su propio CSS, que ya asomó en la lección de `<template>` del capítulo de HTML) y los **slots** (huecos donde se proyecta el contenido de la página). Esta lección cumple varias promesas: el `composed` de los eventos propios, la frontera de Shadow DOM en la cascada de CSS y los controles de formulario hechos a mano. Y tiene su bestiario: nombres que el registro rechaza, callbacks que se repiten y un constructor que llega demasiado pronto.

## Custom elements

Un elemento propio es una **clase que hereda de `HTMLElement`**, registrada con un nombre en `customElements`, el registro de la ventana. Desde ese momento, cada etiqueta con ese nombre es una instancia de la clase: tiene sus métodos y propiedades, y el navegador llama a sus *callbacks* cuando le pasan cosas. El más usado es `connectedCallback`, que se ejecuta cuando el elemento entra en la página:

[[exercise:01-elemento-propio.md]]

[[exercise:01-elemento-propio.md-(script.js)]]

```text
antes de define → definidos: 0 de 3 · instanceof PriceTag: false
connectedCallback → $210.00
connectedCallback → $185.50
connectedCallback → $120.00 (antes $140.00)
después de define → definidos: 3 de 3 · instanceof PriceTag: true
customElements.get('price-tag') === PriceTag → true
connectedCallback → $95.00
whenDefined('price-tag') → resuelta
```

Las tres etiquetas ya estaban en la página antes del registro. El parser las creó como `HTMLElement` corrientes, «sin definir», y `customElements.define` las **mejora** (*upgrade*) en el acto: les cambia el prototipo, ejecuta el constructor y, como ya están en la página, `connectedCallback`. Es lo normal cuando el script va al final, o es un módulo, o llega más tarde. Mientras tanto, la pseudoclase **`:defined`** distingue unas de otras: `price-tag:not(:defined)` reserva el hueco sin enseñar nada a medias. Y `customElements.whenDefined(nombre)` devuelve una promesa que se cumple cuando el nombre se registra, para el código que necesita esperar.

| Método de `customElements` | Para qué |
|---|---|
| `define(nombre, clase)` | registra; mejora las etiquetas que ya existen |
| `get(nombre)` | la clase registrada, o `undefined` |
| `whenDefined(nombre)` | promesa que se cumple al registrarse |
| `upgrade(raíz)` | mejora ya los elementos de un árbol que aún no está en la página |

### Las reglas del nombre

El nombre de un elemento propio **tiene que llevar un guion**, empezar por una letra minúscula y no tener mayúsculas. No es capricho: HTML promete que ninguna etiqueta estándar tendrá guion, así que `<recipe-card>` nunca chocará con una etiqueta futura, y el parser sabe de un vistazo que es un elemento propio:

[[exercise:02-nombre-sin-guion.md-(script.js)]]

```text
<card> → HTMLUnknownElement
<recipe-card> → HTMLElement (esperando su definición)
🐛 define('card') → SyntaxError: Failed to execute 'define' on 'CustomElementRegistry': "card" is not a valid custom element name
🐛 define('recipeCard') → SyntaxError: Failed to execute 'define' on 'CustomElementRegistry': "recipeCard" is not a valid custom element name
✅ define('recipe-card') → RecipeCard
```

Fíjate en las dos primeras líneas: el parser ya distingue entre `<card>`, un elemento desconocido para siempre, y `<recipe-card>`, un candidato que espera su clase.

### Registrar dos veces

Un nombre se registra **una sola vez** por página, y una clase solo puede tener un nombre. El error típico aparece cuando el script de un componente se carga dos veces: dos paquetes de scripts que lo incluyen, o un widget pegado dos veces en la misma página:

[[exercise:03-definir-dos-veces.md-(script.js)]]

```text
✅ primera carga → define('star-rating') ok
🐛 segunda carga → NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry': the name "star-rating" has already been used with this registry
🐛 misma clase, otro nombre → NotSupportedError: Failed to execute 'define' on 'CustomElementRegistry': this constructor has already been used with this registry
✅ carga con guarda → ya estaba registrado: no hago nada
✅ subclase → define('rating-stars') ok · ¿definido? true
```

No se puede «desregistrar» ni reemplazar una definición. La guarda `if (!customElements.get(nombre))` delante de `define` hace el script inofensivo si se carga dos veces; LearnWeb no tiene este problema porque cada ejecución es una página nueva.

Existe una segunda clase de elementos propios, los *customized built-ins* (`class extends HTMLButtonElement` y `<button is="mi-boton">`), que amplían una etiqueta estándar. Chrome y Firefox los admiten, pero Safari no, así que el curso no los usa.

## El ciclo de vida

| Callback | Cuándo |
|---|---|
| `constructor()` | al crear el elemento o al mejorarlo; empieza siempre con `super()` |
| `connectedCallback()` | cada vez que entra en la página |
| `disconnectedCallback()` | cada vez que sale de la página |
| `attributeChangedCallback(nombre, antes, ahora)` | cuando cambia un atributo de `static observedAttributes` |
| `adoptedCallback()` | cuando pasa a otro documento (raro: hacia un iframe, por ejemplo) |

Un componente bien hecho se usa igual desde HTML (atributos) que desde JavaScript (propiedades). La técnica habitual es **reflejar**: la propiedad `status` lee y escribe el atributo `status`, y todo el trabajo se hace en `attributeChangedCallback`. Así hay una sola fuente de verdad, y el CSS puede engancharse al atributo (`order-status[status="entregado"]`):

[[exercise:04-ciclo-de-vida.md]]

[[exercise:04-ciclo-de-vida.md-(script.js)]]

```text
— customElements.define('order-status', …) —
constructor → el elemento existe; aún no se toca nada
attributeChangedCallback → status: null → recibido
connectedCallback → está en la página
— order.status = 'preparando' —
attributeChangedCallback → status: recibido → preparando
— order.setAttribute('data-note', 'sin azúcar'): no está en observedAttributes —
— order.remove() —
disconnectedCallback → ha salido de la página
— row.append(order) —
connectedCallback → está en la página
Listo: pulsa los botones de estado
// Tras pulsar «En camino»:
attributeChangedCallback → status: preparando → en-camino
// Tras pulsar «En camino» otra vez:
attributeChangedCallback → status: en-camino → en-camino
```

Tres detalles del registro. Al mejorar una etiqueta que ya tiene atributos, `attributeChangedCallback` llega **antes** que `connectedCallback`, con `null` como valor anterior: tu código no puede suponer que el elemento ya está en la página. Los atributos que no están en `observedAttributes` no avisan (así no pagas por cada `class` o `aria-*`). Y el aviso llega aunque el valor nuevo sea igual al anterior: compáralos si te importa.

### `connectedCallback` se repite

«Entra en la página» no ocurre una sola vez. Mover un elemento con `append` o `insertBefore` lo saca (`disconnectedCallback`) y lo vuelve a meter (`connectedCallback`). Una cabecera que pasa sus botones al menú móvil, una lista que se reordena o una pestaña que se cambia de panel mueven elementos sin parar. Lo que se prepara en `connectedCallback` se deshace en `disconnectedCallback`, o se acumula:

[[exercise:05-connectedcallback-se-repite.md-(script.js)]]

```text
— la cabecera se monta —
🐛 conexiones: 1 · listeners vivos: 1
✅ conexiones: 1 · listeners vivos: 1
— pantalla estrecha: las insignias pasan al menú móvil —
🐛 conexiones: 2 · listeners vivos: 2
✅ conexiones: 2 · listeners vivos: 1
— pantalla ancha otra vez: vuelven a la barra —
🐛 conexiones: 3 · listeners vivos: 3
✅ conexiones: 3 · listeners vivos: 1
🛒 +1 producto → insignia 🐛: 3 · insignia ✅: 1
Listo: pulsa «Añadir al carrito» y «Mover las insignias»
// Tras pulsar «Añadir al carrito»:
🛒 +1 producto → insignia 🐛: 6 · insignia ✅: 2
```

El `AbortController` de la lección «Escuchar eventos» es la herramienta perfecta: uno nuevo en cada conexión, y `abort()` en la desconexión quita de una vez todos los listeners que usaron su `signal`. Lo mismo vale para temporizadores, observers y conexiones con el servidor. En Chrome existe además `parent.moveBefore(nodo, referencia)`, que mueve un elemento sin sacarlo de la página si su clase define `connectedMoveCallback()`; aun así, limpia en `disconnectedCallback`, porque también llega cuando el elemento se elimina de verdad.

### El constructor llega demasiado pronto

El constructor se ejecuta en momentos distintos según cómo nace el elemento. Si estaba en el HTML antes del registro, al mejorarlo ya tiene sus atributos y sus hijos. Pero `document.createElement('drink-price')` ejecuta el constructor **en el acto**, antes de que tu código le ponga ningún atributo. Un componente que lee atributos en el constructor funciona en tus pruebas con HTML y falla en cuanto alguien lo crea desde JavaScript:

[[exercise:06-constructor-demasiado-pronto.md-(script.js)]]

```text
🐛 desde el HTML → $45.00 (al mejorarla, ya tenía amount)
🐛 con createElement → $0.00 (el constructor leyó null)
✅ con createElement → $35.00
⛔ error en window → NotSupportedError: Failed to execute 'createElement' on 'Document': The result must not have children
Uncaught NotSupportedError: Failed to execute 'createElement' on 'Document': The result must not have children
⛔ createElement('eager-price') devolvió → HTMLUnknownElement
```

La última parte es la regla que el navegador hace cumplir: un elemento recién construido con `createElement` (o `new`) no puede traer hijos ni atributos. Si los trae, no lanza el error a quien llamó: lo **informa** como no atrapado y devuelve un `HTMLUnknownElement` en su lugar. Así que el constructor solo prepara: `super()`, campos privados, el shadow root, listeners sobre el propio elemento. Leer atributos y pintar va en `connectedCallback` y `attributeChangedCallback`.

## Shadow DOM

`this.attachShadow({ mode: 'open' })` crea un **shadow root**: un árbol de nodos que cuelga del elemento (el *host*) y que el navegador dibuja **en lugar de** sus hijos normales, el *light DOM*. Lo que hay dentro no se ve desde fuera: `document.querySelector` no lo encuentra y los estilos de la página no le llegan. Con `mode: 'open'`, `elemento.shadowRoot` da acceso desde JavaScript (para depurar y para tests); con `'closed'` es `null`, aunque eso no es seguridad: es una señal de «no toques».

La estructura de dentro suele venir de un `<template>`, como en la lección «Crear y modificar elementos» del módulo «El DOM»: una copia por instancia con `template.content.cloneNode(true)`. La diferencia con `document.importNode(template.content, true)` que te prometimos allí: `cloneNode` crea la copia en el documento inerte de la plantilla, donde no hay elementos propios registrados, y los que contenga se mejoran al entrar en la página; `importNode` la crea ya en tu documento, así que se construyen en el acto.

El ejemplo es una tarjeta de producto con Shadow DOM. Mira qué estilos cruzan la frontera y cuáles no:

[[exercise:07-shadow-dom-y-estilos.md]]

[[exercise:07-shadow-dom-y-estilos.md-(script.js)]]

```text
shadowRoot.mode → open · card.children.length → 0
— lo que NO cruza —
h2 de la página → rgb(185, 28, 28) · h2 del componente → rgb(29, 78, 216)
text-transform del h2 de dentro → none
document.querySelector('.price') → null
— lo que SÍ cruza —
font-family heredada → Georgia, serif
--accent → borde superior rgb(21, 128, 61)
::part(price) → rgb(146, 64, 14) · $210.00
— :host frente a la página —
:host(.featured) → fondo rgb(254, 243, 199)
border-radius: :host dice 8px, la página 0 → 0px
```

| Desde la página hacia dentro | ¿Cruza? |
|---|---|
| selectores (`h2`, `.price`) | no |
| propiedades **heredadas** (`color`, `font-*`, `line-height`) | sí, por herencia desde el host |
| variables CSS (`--accent`) | sí: es la forma de tematizar un componente |
| `::part(nombre)`, sobre los elementos con `part="nombre"` | sí: la puerta que abre el componente |

Desde dentro, **`:host`** da estilo al propio elemento y **`:host(.featured)`**, al elemento cuando cumple un selector. Pero son estilos «por defecto»: la última línea es el criterio **contexto** de la cascada, el número 2 de la tabla de la lección «Cascada y capas» de CSS. Entre una regla de fuera y una de dentro del shadow DOM, gana la de **fuera**; con `!important` es al revés. Así el autor del componente pone valores razonables y quien lo usa siempre tiene la última palabra.

Si un componente contiene a otro, sus partes no se ven desde la página salvo que el de fuera las reexporte: `<product-card exportparts="price">` dentro de su shadow DOM deja que `::part(price)` llegue al precio del componente interior. Existe también `:host-context(selector)`, que mira a los antepasados del host, pero Firefox y Safari no lo admiten.

## Slots y shadow DOM declarativo

Un **`<slot>`** es un hueco en el shadow DOM donde se dibujan los hijos del host. Los hijos con `slot="title"` van al `<slot name="title">`, el resto al slot sin nombre, y si nadie ocupa un slot se ve su contenido **de reserva**. Los nodos no se mueven: siguen siendo hijos del host (tus estilos de página les llegan) y solo se **proyectan** dentro.

El ejemplo usa además el **shadow DOM declarativo** del adelanto de HTML: un `<template shadowrootmode="open">` que el parser convierte en el shadow root del elemento mientras lee la página, sin JavaScript. Es la forma de que un servidor envíe componentes ya dibujados:

[[exercise:08-slots.md]]

[[exercise:08-slots.md-(script.js)]]

```text
shadowRoot → open (lo creó el parser: shadow DOM declarativo)
¿queda el <template> en el DOM? → false
slot «title» → h2
slot «meta» → vacío: se ve su contenido de reserva
slot por defecto → ul, p
::slotted(ul) → rgb(21, 128, 61)
::slotted(li) → no se aplica: el li sale rgb(21, 128, 61), heredado del ul
Listo: pulsa «Añadir tiempo y porciones»
// Tras pulsar «Añadir tiempo y porciones»:
slotchange → slot «meta» → p
// Tras pulsar «Quitar tiempo y porciones»:
slotchange → slot «meta» → vacío: se ve su contenido de reserva
```

`slot.assignedElements()` (o `assignedNodes()`, con los textos) dice qué hay en cada hueco, y el evento **`slotchange`** avisa cuando cambia. `::slotted(selector)` da estilo desde dentro a lo proyectado, pero solo a los **hijos directos** del host: el `<li>` dentro del `<ul>` queda fuera de su alcance. Dos avisos sobre el shadow DOM declarativo: un `innerHTML` con `<template shadowrootmode>` **no** lo crea (se queda como plantilla normal; para eso existe `setHTMLUnsafe()`), y si la clase de un elemento con shadow root declarativo llama a `attachShadow`, recibe ese mismo shadow root **vaciado**: comprueba antes `this.shadowRoot`.

## Eventos que cruzan la frontera

En el módulo «Eventos» quedaron dos promesas: que un evento solo sale de un componente si es `composed`, y que al salir su `target` se «redirige». Este es el ejemplo. Las estrellas son botones dentro del shadow root, y cada componente despacha `rating:change` desde el botón pulsado:

[[exercise:09-eventos-y-composed.md-(script.js)]]

```text
— simulado: clic en la 4.ª estrella de cada componente —
🐛 #buggy-rating · composed: false → ¿lo oyó document? false
   click en document → target: rating-stars#buggy-rating · composed: true
   document → target: rating-stars#fixed-rating · valor 4
   composedPath() → button, div, #shadow-root, rating-stars, p, main, body, html, #document, window
✅ #fixed-rating · composed: true → ¿lo oyó document? true
Listo: pulsa las estrellas de los dos cafés
```

- **`composed: false`** (lo que tiene `new CustomEvent` por defecto): el evento burbujea hasta el shadow root y ahí termina. La página nunca se entera.
- **`composed: true`**: cruza al host y sigue su camino por la página.
- **Retargeting**: fuera del componente, `event.target` es el **host**, no el botón; el interior sigue siendo privado. `composedPath()` da el camino completo, con los nodos de dentro si el shadow root es `open`.
- Los eventos nativos de interacción (`click`, `keydown`, `input`, `focus`…) son `composed`; `change`, `submit` y `slotchange`, no.

La alternativa más usada evita el problema: despachar desde el propio host, `this.dispatchEvent(new CustomEvent('rating:change', { bubbles: true, detail }))`. El evento nace ya fuera del shadow root y no necesita `composed`; es el «datos hacia abajo, eventos hacia arriba» de la lección «Eventos personalizados».

## Formularios y accesibilidad

Un elemento propio no es un control de formulario: no aparece en `form.elements`, no viaja en `FormData` y no participa en la validación. Y los `<input>` de su shadow DOM tampoco cuentan para el formulario de fuera, porque la frontera los separa. La solución completa que se anunció en «FormData y envío» son los **custom elements asociados a formularios**: `static formAssociated = true` y `this.attachInternals()`, que devuelve un objeto `ElementInternals` para hablar con el formulario:

[[exercise:10-control-de-formulario.md]]

[[exercise:10-control-de-formulario.md-(script.js)]]

```text
form.elements → rating-field, textarea, button (los radios del shadow DOM no cuentan)
rating.form === form → true
sin valoración → checkValidity(): false · «Elige de 1 a 5 estrellas»
FormData → comment=Muy aromático, con notas de cacao.
— simulado: rating.value = 4 —
FormData → rating=4 · comment=Muy aromático, con notas de cacao.
checkValidity(): true
Listo: elige estrellas (con el ratón o con Tab y las flechas) y pulsa «Enviar reseña»
// Tras pulsar «Enviar reseña» sin elegir: la burbuja «Elige de 1 a 5 estrellas» señala la primera estrella
// Tras elegir 5 ★ y pulsar «Enviar reseña»:
📨 envío → rating=5 · comment=Muy aromático, con notas de cacao.
```

`internals.setFormValue(valor)` decide qué se envía (`null`: nada), `internals.setValidity(estados, mensaje, ancla)` conecta con la Constraint Validation API del módulo de formularios (los mismos `valueMissing`, `customError`…) y `internals.form` es el formulario. El navegador avisa además con `formResetCallback()` al pulsar «reset», `formDisabledCallback(desactivado)` cuando un `<fieldset disabled>` lo desactiva y `formStateRestoreCallback()` al restaurar la página. En una tarjeta de la teoría el formulario no se envía (es un iframe aislado): ábrelo con «▶ Run».

La otra mitad es la accesibilidad. Para el lector de pantalla, un elemento propio vacío es como un `<span>`: sin rol, sin foco y sin teclado. Un «botón» hecho con un `<div>` necesitaría `role="button"`, `tabindex="0"`, Enter y Espacio a mano, el estado `disabled`… La vía corta es **componer elementos de verdad**: el ejemplo usa radios reales dentro de un `<fieldset>`, con su `<legend>`, y obtiene gratis las flechas, el foco visible y lo que anuncia el lector. Si lo que quieres es ampliar un botón, envuélvelo: `<confirm-button><button>Borrar</button></confirm-button>`, y que la clase añada el comportamiento al botón de dentro.

## Bestiario

- **`define` lanza `SyntaxError: … is not a valid custom element name`.**
  Síntoma: el componente no se registra y la etiqueta se queda como un elemento desconocido.
  Causa: el nombre no tiene guion, tiene mayúsculas o es un nombre reservado (`font-face`).
  Solución: minúsculas y al menos un guion, con un prefijo propio: `shop-price`, `recipe-card`.
  → [ver ejemplo](02-nombre-sin-guion.md)
- **`NotSupportedError: … has already been used with this registry`.**
  Síntoma: el segundo `define` de un componente rompe el script donde está.
  Causa: el mismo nombre (o la misma clase) se registra dos veces, casi siempre porque el script se carga dos veces.
  Solución: `if (!customElements.get(nombre)) customElements.define(…)`; para un segundo nombre, una subclase.
  → [ver ejemplo](03-definir-dos-veces.md)
- **El componente hace las cosas dos o tres veces.**
  Síntoma: tras mover el elemento, cada evento cuenta doble (o triple), y sigue reaccionando después de quitarlo.
  Causa: `connectedCallback` se ejecuta en cada inserción, también al moverlo, y lo que añade no se quita al salir.
  Solución: deshaz en `disconnectedCallback` lo que hiciste al conectar; un `AbortController` por conexión.
  → [ver ejemplo](05-connectedcallback-se-repite.md)
- **Funciona en el HTML pero no con `createElement`.**
  Síntoma: el componente sale bien en la página, pero creado desde JavaScript muestra valores vacíos o `$0.00`; o `createElement` informa `NotSupportedError: The result must not have children`.
  Causa: el constructor lee atributos (o añade hijos) antes de que existan; solo los elementos mejorados los tienen ya.
  Solución: en el constructor, solo `super()`, campos y el shadow root; lee atributos y pinta en `connectedCallback` y `attributeChangedCallback`.
  → [ver ejemplo](06-constructor-demasiado-pronto.md)
- **La página no oye el evento del componente.**
  Síntoma: un `CustomEvent` con `bubbles: true` despachado dentro del shadow DOM no llega a los listeners de la página.
  Causa: sin `composed: true`, un evento no sale de su shadow root.
  Solución: `composed: true`, o despacha el evento desde el propio host (`this.dispatchEvent`).
  → [ver ejemplo](09-eventos-y-composed.md)

## Resumen

- Un custom element es una clase que hereda de `HTMLElement`, registrada con `customElements.define('con-guion', Clase)`; las etiquetas que ya existían se mejoran al registrarla (`:defined`, `whenDefined`).
- Cada nombre y cada clase se registran una vez: protege `define` con `customElements.get`.
- Ciclo de vida: `constructor`, `connectedCallback`/`disconnectedCallback` (en cada entrada y salida, también al mover), `attributeChangedCallback` (solo con `observedAttributes`) y `adoptedCallback`. Refleja propiedades en atributos.
- El constructor no lee atributos ni añade hijos: eso va en los callbacks.
- `attachShadow` crea un árbol privado: los selectores no cruzan, las propiedades heredadas, las variables CSS y `::part` sí; `:host` da estilo al elemento y la página le gana.
- Los slots proyectan los hijos del host; `<template shadowrootmode>` crea el shadow root desde el HTML.
- Un evento sale del shadow DOM solo si es `composed` (o si se despacha desde el host); fuera, `target` es el host.
- `formAssociated` + `attachInternals()` convierten un componente en un control de formulario; para la accesibilidad, compón elementos nativos.

## Para profundizar

- [MDN: Web Components](https://developer.mozilla.org/es/docs/Web/API/Web_components)
- [MDN: Usar custom elements](https://developer.mozilla.org/es/docs/Web/API/Web_components/Using_custom_elements)
- [MDN: Usar Shadow DOM](https://developer.mozilla.org/es/docs/Web/API/Web_components/Using_shadow_DOM)
- [web.dev: More capable form controls (en inglés)](https://web.dev/articles/more-capable-form-controls)
- [HTML Standard: requisitos de los constructores de custom elements (en inglés)](https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance)
