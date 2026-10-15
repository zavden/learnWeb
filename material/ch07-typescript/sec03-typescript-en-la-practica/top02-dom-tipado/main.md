# DOM tipado

## Por qué importa

El capítulo 6 entero trabajó con el DOM: seleccionar elementos, escuchar eventos, leer formularios, crear nodos y emitir eventos propios. Todo eso se escribe igual en TypeScript, pero cada valor que devuelve el navegador tiene ahora un tipo, y esos tipos explican muchas de las sorpresas de entonces: por qué `querySelector` puede dar `null`, por qué `event.target` no siempre es el botón o por qué `input.value + 1` concatena.

Los tipos del navegador no los escribe nadie en cada proyecto: vienen con TypeScript, en un archivo enorme llamado `lib.dom.d.ts`. Esta lección enseña a leer las piezas de ese archivo que más se usan, dónde se equivoca o miente (siempre por buenas razones) y las pocas funciones propias que convierten el DOM en código sin `null` inesperados ni aserciones ocultas. La lección 4 explica qué es un archivo `.d.ts`; aquí basta con saber que contiene solo tipos.

## `querySelector` y el mapa de etiquetas

En el módulo 1, `querySelector('#cart-count')` devolvía `Element | null`, un elemento genérico. Pero si el selector es **solo un nombre de etiqueta**, el resultado es mucho más preciso: `querySelector('input')` es un `HTMLInputElement | null`, con `valueAsNumber`, `checked` y todo lo propio de un `<input>`. El truco está en las sobrecargas (lección 6 del módulo 1) con que `lib.dom.d.ts` declara el método. Estas son las líneas reales de TypeScript 5.9:

```ts
interface ParentNode extends Node {
    // …
    querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    querySelector<K extends keyof MathMLElementTagNameMap>(selectors: K): MathMLElementTagNameMap[K] | null;
    /** @deprecated */
    querySelector<K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K): HTMLElementDeprecatedTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null;
}
```

La primera sobrecarga es `K extends keyof T` con `T[K]` de la lección «Operadores de tipo» del módulo 2. `HTMLElementTagNameMap` es una interfaz que asocia cada nombre de etiqueta con su tipo:

```ts
interface HTMLElementTagNameMap {
    "a": HTMLAnchorElement;
    "abbr": HTMLElement;
    // …
    "button": HTMLButtonElement;
    "canvas": HTMLCanvasElement;
    // …
    "input": HTMLInputElement;
    // …
}
```

Si el texto que pasas es una de sus claves, TypeScript elige esa sobrecarga y devuelve el tipo exacto; si no, cae en la última, que devuelve `Element`. El mismo mapa usan `querySelectorAll` (con `NodeListOf<…>`), `closest` y `createElement`, que además no devuelve `null` porque crear un elemento no puede fallar:

[[exercise:01-mapa-de-etiquetas.md-]]

```text
canvas → 160×40 | ¿contexto 2D? → true
Listo: cambia las bolsas o la molienda y pulsa «Añadir al carrito»
// Tras pulsar «Añadir al carrito»:
🛒 2 × Café de Chiapas (en grano) = $420
// Tras elegir «Para espresso», poner 3 bolsas y pulsar «Añadir al carrito»:
🛒 3 × Café de Chiapas (para espresso) = $630
```

Las comprobaciones `Expect<Equal<…>>` del módulo 2 muestran los tipos sin pasar el ratón por encima. El `null` no desaparece: aunque el tipo sea exacto, puede no haber ningún `<input>` en la página. Fíjate en cómo se descarta: un solo `if (!bags || …) throw` al principio, y a partir de ahí TypeScript sabe que las cuatro constantes existen, también dentro de las flechas creadas después. Una `function` declarada antes no conservaría ese estrechamiento, porque se podría llamar antes del `if`.

> **Desde Python:** el mapa de etiquetas es lo que en Python escribirías con sobrecargas y `Literal`: `@overload def query(tag: Literal["input"]) -> HTMLInputElement: ...`. TypeScript lo hace con un solo tipo indexado en vez de una sobrecarga por etiqueta.

### Selectores que TypeScript no entiende

TypeScript no interpreta CSS. `'input'` es una clave del mapa; `'.qty'`, `'#qty'` o `'input.qty'` son textos cualquiera, y dan `Element | null`. Y `Element` es el tipo más general: no tiene `value`, ni `dataset` (que es de `HTMLElement`), ni casi nada de lo que se usa a diario:

[[exercise:02-selector-sin-etiqueta.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 15: TS2339: Property 'value' does not exist on type 'Element'.
línea 16: TS2339: Property 'dataset' does not exist on type 'Element'.
// Consola:
🐛 value → 2
🐛 sku → CAF-01
✅ instanceof → bolsas: 2
✅ instanceof → sku: CAF-01
✅ por etiqueta → total: 420
```

En ejecución, las dos líneas rojas funcionan: los elementos **son** un `<input>` y un `<li>`. Pero TypeScript no puede saberlo, y tiene razón en no fiarse: mañana alguien pone la clase `qty` en un `<span>`. Las salidas honradas son dos. `instanceof HTMLInputElement` estrecha con una comprobación real (lección 4 del módulo 1). Y buscar **por etiqueta dentro de un contenedor** (`line.querySelector('input')`) vuelve a usar el mapa. El caso de `getElementById` es parecido: siempre devuelve `HTMLElement | null`, porque un `id` no dice nada de la etiqueta.

## Dos aserciones disfrazadas: `querySelector<T>` y `!`

La última sobrecarga, `querySelector<E extends Element = Element>(selectors: string): E | null`, tiene un parámetro de tipo que **solo aparece en el retorno**. La lección «Genéricos» del módulo 2 lo llamaba un genérico que no relaciona nada: escribir `querySelector<HTMLInputElement>('#tickets')` no comprueba nada, es un `as HTMLInputElement` con otra sintaxis. Se ve en muchísimo código TypeScript, y funciona hasta que el HTML cambia:

[[exercise:03-queryselector-generico-miente.md-]]

```text
🐛 <HTMLInputElement> → valueAsNumber: undefined | total: NaN
🐛 ! → TypeError: Cannot read properties of null (reading 'value')
✅ $ → TypeError: «#tickets» es un <select>, no un HTMLInputElement
✅ $ → Error: No hay ningún elemento «#ticket»
✅ 2 × $90 = $180
Listo: cambia el número de entradas
// Tras elegir 4 entradas:
✅ 4 × $90 = $360
```

Ni un error rojo, y un total `NaN`: un `<select>` no tiene `valueAsNumber`. El `!` del segundo caso es la misma mentira aplicada al `null` (lección 5 del módulo 1). La función `$` convierte las dos mentiras en errores claros en el momento de buscar el elemento: comprueba que existe y que es de la clase pedida con `instanceof`, y ese `instanceof` es también lo que estrecha `element` a `T`. Es el `byId` que llevas usando en los ejemplos profesionales de los módulos 1 y 2, ahora con cualquier selector y un contenedor opcional. Funciona porque `HTMLInputElement` es dos cosas a la vez en `lib.dom.d.ts`: una interfaz (el tipo) y un valor que existe en ejecución, declarado como `declare var HTMLInputElement: { prototype: HTMLInputElement; new(): HTMLInputElement; }`; ese `new()` encaja con el parámetro `type: new () => T`.

Resumen de las opciones ante un elemento que puede faltar:

| Escribes | Si el elemento falta | Si es de otro tipo | Úsalo para |
|---|---|---|---|
| `el?.textContent` / `if (el)` | `undefined` / no entra | (no se entera) | elementos opcionales |
| `querySelector<T>(…)!` | `TypeError` más adelante | errores silenciosos | nunca, si puedes evitarlo |
| `$(selector, Tipo)` | error claro al buscar | error claro al buscar | elementos obligatorios |

> **Desde Python:** `querySelector<T>` es `typing.cast(T, valor)`: el verificador lo acepta y en ejecución no hace nada. El `instanceof` de `$` es el `isinstance` que mypy usa para estrechar.

## Eventos tipados

`addEventListener('keydown', (event) => …)` da a `event` el tipo `KeyboardEvent` sin escribir nada; la lección 6 del módulo 1 lo llamaba tipado contextual y prometía explicarlo aquí. La firma de `lib.dom.d.ts` es la misma idea que el `querySelector`, con otro mapa:

```ts
addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
```

El nombre del evento fija `K`, y el parámetro del listener es `HTMLElementEventMap[K]`: el mismo `emit<E extends keyof ShopEvents>` que escribiste en la lección «Tipos de plantilla» del módulo 2. La segunda sobrecarga recoge cualquier otro nombre, con un `Event` sin más. Y el parámetro `this` (lección 6 del módulo 1) dice que, en una `function`, `this` es el elemento. Algunas entradas del mapa sorprenden:

| Evento | Tipo en el mapa | Para qué sirve |
|---|---|---|
| `'keydown'`, `'keyup'` | `KeyboardEvent` | `key`, `code`, `ctrlKey`, `repeat` |
| `'click'` | `PointerEvent` | `pointerType`, además de todo lo de `MouseEvent` |
| `'input'` | `Event` | nada propio: lee el valor del elemento |
| `'beforeinput'` | `InputEvent` | `inputType`, `data` |
| `'submit'` | `SubmitEvent` | `submitter`: el botón que envió |

[[exercise:04-eventos-tipados.md-]]

```text
Listo: escribe una receta y pulsa Enter, Escape o «Buscar»
// Tras escribir «mole» y pulsar Enter:
⌨️ keydown · key: Enter → 🔎 buscar «mole»
// Tras pulsar Escape:
⌨️ keydown · key: Escape → campo vacío
// Tras escribir «pozole» y pulsar «Buscar»:
🖱️ click · ¿PointerEvent? true → 🔎 buscar «pozole»
```

El clic como `PointerEvent` no es un capricho de los tipos: es lo que hace Chrome, que crea los clics como eventos de puntero, y la última línea lo confirma en ejecución. El `input` como `Event` es más discutible: Chrome lo crea como `InputEvent` cuando escribes, pero el mismo evento llega como `Event` desde otras fuentes, y los tipos eligen lo seguro. Por eso el ejemplo lee `this.value` en vez de algo del evento.

### `event.target` no es el elemento que escucha

En un listener delegado (lección «Delegación de eventos» del capítulo 6), `event.target` es el nodo **exacto** que se pulsó, y puede ser cualquier cosa: el botón, el texto de la línea o el icono que hay dentro del botón. Por eso `lib.dom.d.ts` lo declara como `readonly target: EventTarget | null;`, el tipo más pobre posible: `EventTarget` solo sabe escuchar y emitir eventos.

[[exercise:05-event-target.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS18047: 'event.target' is possibly 'null'.
línea 14: TS2339: Property 'dataset' does not exist on type 'EventTarget'.
// Consola:
Listo: pulsa «Quitar» en una línea; prueba también sobre el icono 🗑️
// Tras pulsar sobre el icono 🗑️ de Cacao de Tabasco:
🐛 target.dataset.action → undefined
✅ span → closest('button') → quitar CAC-03 · total $370
// Tras pulsar sobre el texto «Quitar» de Café de Chiapas:
🐛 target.dataset.action → remove
✅ button → closest('button') → quitar CAF-01 · total $160
```

Aquí el error de tipos tiene toda la razón: el código del 🐛 funciona al pulsar la palabra «Quitar», y falla en silencio al pulsar el icono, porque el `<span>` no tiene `data-action`. La solución de tipos y la del bug son la misma: `instanceof Element` y `closest('button')`, que con un nombre de etiqueta devuelve `HTMLButtonElement | null`. Con otro selector, `closest<E>` tiene el mismo genérico sin comprobación que `querySelector<E>`.

¿Y `event.currentTarget`, el elemento que escucha? También es `EventTarget | null` en los tipos, porque el objeto evento es el mismo para todos los listeners por los que pasa. Para el elemento que escucha, usa la variable que ya tienes (`cart`) o `this` dentro de una `function`.

## Los valores de un formulario

Un formulario es la frontera más cercana con «los datos de fuera» del módulo 2: todo lo que escribe el usuario llega como texto. Los tipos de `lib.dom.d.ts` lo dicen con bastante precisión, y una parte de los fallos sigue sin verse:

| Lees | Tipo | Cuidado con |
|---|---|---|
| `input.value` | `string`, siempre (también en `type="number"`) | `value + 1` concatena **sin error de tipos** |
| `input.valueAsNumber` | `number` | `NaN` si el campo está vacío o no es numérico |
| `element.dataset.price` | `string \| undefined` (un `DOMStringMap`) | una errata en el nombre da `undefined`, no un error |
| `formData.get('email')` | `FormDataEntryValue \| null`, es decir `string \| File \| null` | `null` si el nombre no existe; `File` en un `<input type="file">` |

[[exercise:06-valores-del-formulario.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 15: TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
línea 23: TS2531: Object is possibly 'null'.
línea 23: TS2339: Property 'trim' does not exist on type 'FormDataEntryValue'.
  Property 'trim' does not exist on type 'File'.
// Consola:
🐛 value + 1 → 21 | typeof value → string
✅ valueAsNumber + 1 → 3
🐛 data-price → NaN (el atributo se llama data-cost)
✅ data-cost → 210
🐛 get('mail') → TypeError: Cannot read properties of null (reading 'trim')
✅ get('email') → «ana.ruiz@example.com»
Listo: borra el número de bolsas y escribe otro
// Tras borrar el número de bolsas:
⚠️ value '' → valueAsNumber NaN: escribe un número
// Tras escribir 3:
✅ 3 bolsas → $630
```

El primer 🐛 es el más traicionero: `string + number` es una operación válida (da un `string`), así que TypeScript no protesta. Los otros dos sí tienen error: `dataset` es una firma de índice (lección 3 del módulo 1) que acepta cualquier nombre y devuelve `string | undefined`, y `FormData.get` avisa de que el campo puede no existir o ser un archivo. `TS2531: Object is possibly 'null'.` es la versión de `TS18047` para expresiones sin nombre, como el resultado de una llamada. En los dos casos el aviso acierta: hay una errata (`price`, `mail`) que en ejecución da `NaN` o un `TypeError`.

## Un estado de formulario tipado

En la lección «Tipos de utilidad» del módulo 2 escribiste el estado de un formulario como un tipo, con sus errores y sus cambios calculados a partir de él, y se prometía conectarlo con controles reales. La pieza que falta es la **unión** entre cada clave del estado y su control, en los dos sentidos: leer el formulario a un objeto tipado y escribir un objeto en el formulario. Un tipo mapeado lo expresa en una línea, `type Bindings<T> = { [K in keyof T]: Binding<T[K]> }`: para cada clave, un control que sabe leer y escribir exactamente el tipo de esa clave.

[[exercise:07-estado-de-formulario.md-]]

```text
estado → {"guest":"","seats":2,"menu":"traditional","newsletter":false}
Listo: cambia los campos, pulsa «Cargar la reserva de Lucía» o «Restablecer»
// Tras pulsar «Cargar la reserva de Lucía»:
📥 {"guest":"Lucía Méndez","seats":3,"menu":"vegetarian","newsletter":true}
// Tras subir las plazas a 4 con la flecha del campo:
✏️ seats → {"guest":"Lucía Méndez","seats":4,"menu":"vegetarian","newsletter":true}
// Tras pulsar «Restablecer»:
↩️ {"guest":"","seats":2,"menu":"traditional","newsletter":false}
```

Cada control es una función pequeña que traduce entre el DOM y un tipo: `value` para texto, `valueAsNumber` (con `NaN` convertido en 0) para números, `checked` para la casilla y un predicado para el `<select>`, cuyo `value` es un `string` cualquiera hasta que se comprueba que es un `Menu`. Si alguien une `seats` a un control de texto, o añade un campo a `BookingForm` sin su control, el objeto `bindings` sale en rojo. `readForm` y `writeForm` son genéricas y no saben nada de reservas: sirven para cualquier formulario. El único `as` está en la línea que crea el objeto vacío que se rellena justo debajo.

## Crear elementos y clonar plantillas

`document.createElement('canvas')` usa el mismo mapa que `querySelector` y devuelve un `HTMLCanvasElement`, como viste en el primer ejemplo. Con las plantillas `<template>` del capítulo 6 hay una trampa de tipos: `cloneNode` está declarado una sola vez, en `Node`, como `cloneNode(subtree?: boolean): Node;`, así que el clon de un `DocumentFragment` es, para TypeScript, un simple `Node`, sin `querySelector`:

[[exercise:08-plantillas.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 18: TS2339: Property 'querySelector' does not exist on type 'Node'.
// Consola:
🐛 cloneNode → #document-fragment | querySelector: object
✅ 3 productos: Pan de muerto, Calabaza en tacha, Atole de guayaba
✅ precios → 85 · 120 · 45
```

`document.importNode` es genérico, `importNode<T extends Node>(node: T, options?: boolean | ImportNodeOptions): T;`, y devuelve el mismo tipo que recibe: un `DocumentFragment`. La otra salida, `template.content.cloneNode(true) as DocumentFragment`, es una de las pocas aserciones seguras, porque clonar un fragmento siempre da un fragmento. Dentro del fragmento, el `$` con contenedor del ejemplo 3 encuentra cada pieza con su tipo (un `DocumentFragment` es un `ParentNode`).

## Eventos propios tipados

Con `new CustomEvent('cart:add', { detail })` emitías avisos propios en el capítulo 6, y en la lección «Tipos de plantilla» del módulo 2 se prometía tipar su `detail`. El problema: `'cart:add'` no está en `HTMLElementEventMap`, así que `addEventListener('cart:add', …)` cae en la segunda sobrecarga y `event.detail` es `TS2339`. La solución es **ampliar** el mapa del navegador. Las interfaces se fusionan (lección 3 del módulo 1), y `declare global { … }` permite añadir declaraciones al ámbito global desde un archivo que es un módulo:

```ts
declare global {
  interface HTMLElementEventMap extends ShopEventMap {} // para los elementos
  interface DocumentEventMap extends ShopEventMap {}    // para document
}
```

`document` usa otro mapa (`DocumentEventMap`), y por eso hay que ampliar los dos si escuchas en `document`. La lección 4 explica `declare` y `declare global` a fondo.

[[exercise:09-eventos-propios-tipados.md-]]

```text
Listo: pulsa «Añadir» en un producto o «Simular un evento mal formado»
// Tras pulsar «Añadir» en Café de Chiapas y en Vainilla de Papantla:
🛒 cart:add · Café de Chiapas ($210) · 1 en el carrito · total $210
🛒 cart:add · Vainilla de Papantla ($160) · 2 en el carrito · total $370
// Tras pulsar «Simular un evento mal formado»:
🛒 cart:add · undefined ($undefined) · 3 en el carrito · total $NaN
```

Todo sale de un solo tipo, `ShopEvents`, y un tipo mapeado construye a partir de él el mapa de `CustomEvent`. El último caso es la advertencia: el mapa tipa a quien **escucha**, pero `dispatchEvent` acepta cualquier `Event`, así que un `CustomEvent` con un `detail` equivocado se emite sin ningún error rojo. Por eso el ejemplo emite con `emit<K>`, que relaciona el nombre con sus datos, y nunca con `dispatchEvent` directamente. Y recuerda la lección «Guardas y validación» del módulo 2: los tipos no validan nada en ejecución; si el evento puede venir de código que no controlas, el listener debe comprobar `detail`.

## Web components con tipos

Los elementos propios del capítulo 6 son clases, así que en TypeScript tienen tipos sin hacer nada especial. Lo que falta es que `querySelector('rating-stars')` sepa que devuelve un `RatingStars`, y eso se consigue igual que con los eventos: ampliando `HTMLElementTagNameMap`.

[[exercise:10-componente-web-tipado.md-]]

```text
rating → RatingStars · valor 3
createElement → true · valor 0
Listo: usa «−» y «+» en la valoración
// Tras pulsar «+»:
⭐ rating:change → 4
// Tras pulsar «−» dos veces:
⭐ rating:change → 3
⭐ rating:change → 2
```

Es lo que hacen las bibliotecas de componentes escritas en TypeScript (Lit, Shoelace): cada componente amplía `HTMLElementTagNameMap` junto a su `customElements.define`. Pero la ampliación es una promesa: si el script que llama a `define` no se ha cargado, el elemento de la página es un `HTMLElement` sin mejorar y su `value` no existe, aunque el tipo diga `RatingStars`. La lección 4 enseña una forma muy realista de que pase.

## Bestiario

- **`Element` no tiene `value`.**
  Síntoma: `TS2339: Property 'value' does not exist on type 'Element'.` (o `'dataset'`) con un elemento que, en ejecución, sí es un `<input>`.
  Causa: con un selector que no es un nombre de etiqueta (`'.qty'`, `'#qty'`, `'input.qty'`), `querySelector` devuelve `Element`.
  Solución: estrecha con `instanceof HTMLInputElement`, busca por etiqueta dentro de un contenedor o usa una función `$(selector, Tipo)`.
  → [ver ejemplo](02-selector-sin-etiqueta.md)
- **`querySelector<T>` no comprueba nada.**
  Síntoma: un total `NaN` o un `undefined` sin ningún error de tipos, después de cambiar el HTML.
  Causa: el genérico de `querySelector<E>` es una aserción (`as`) con otra sintaxis; el `!` hace lo mismo con el `null`.
  Solución: comprueba en ejecución con `instanceof`, una vez, en una función como `$`.
  → [ver ejemplo](03-queryselector-generico-miente.md)
- **`event.target` es `EventTarget | null`.**
  Síntoma: `TS18047: 'event.target' is possibly 'null'.` y `TS2339: Property 'dataset' does not exist on type 'EventTarget'.`; sin tipos, un clic en el icono de un botón no hace nada.
  Causa: `target` es el nodo exacto que se pulsó, que puede ser cualquier cosa.
  Solución: `if (!(event.target instanceof Element)) return;` y `event.target.closest('button')`.
  → [ver ejemplo](05-event-target.md)
- **Los valores del formulario son texto o `undefined`.**
  Síntoma: `value + 1` da `'21'` sin ningún error; `TS2345` con `dataset.price`; `TS2531` y `TS2339` con `formData.get(…)`.
  Causa: `value` es siempre `string`; `dataset` devuelve `string | undefined` para cualquier nombre; `FormData.get` devuelve `string | File | null`.
  Solución: `valueAsNumber` (comprobando `NaN`), `??` o una comprobación para `dataset`, y `typeof x === 'string'` para `FormData`.
  → [ver ejemplo](06-valores-del-formulario.md)
- **El clon de una plantilla es un `Node`.**
  Síntoma: `TS2339: Property 'querySelector' does not exist on type 'Node'.` sobre `template.content.cloneNode(true)`.
  Causa: `cloneNode` está declarado en `Node` y devuelve `Node`.
  Solución: `document.importNode(template.content, true)`, que conserva el tipo `DocumentFragment`.
  → [ver ejemplo](08-plantillas.md)
- **El `detail` que nadie comprobó.**
  Síntoma: un listener de `'cart:add'` bien tipado recibe `undefined` y calcula `NaN`.
  Causa: ampliar `HTMLElementEventMap` tipa a quien escucha; `dispatchEvent` acepta cualquier `CustomEvent`.
  Solución: emite siempre con una función `emit<K>` tipada y, si el evento puede venir de fuera, valida `detail`.
  → [ver ejemplo](09-eventos-propios-tipados.md)

## Resumen

- `lib.dom.d.ts` trae los tipos del navegador; `HTMLElementTagNameMap` asocia cada etiqueta con su tipo, y lo usan `querySelector`, `querySelectorAll`, `closest` y `createElement`.
- Solo un nombre de etiqueta exacto da el tipo preciso; cualquier otro selector da `Element | null`, y `getElementById`, `HTMLElement | null`.
- `querySelector<T>` y `!` son aserciones; una función `$(selector, Tipo)` con `instanceof` comprueba de verdad y estrecha.
- `addEventListener` deduce el evento con `HTMLElementEventMap`: `KeyboardEvent`, `PointerEvent` para `click`, `Event` para `input`.
- `event.target` y `event.currentTarget` son `EventTarget | null`: `instanceof` y `closest` para el primero, la variable o `this` para el segundo.
- `value` es `string`, `valueAsNumber` puede ser `NaN`, `dataset` da `string | undefined` y `FormData.get`, `string | File | null`.
- Un tipo mapeado (`{ [K in keyof T]: Binding<T[K]> }`) une un estado tipado con sus controles.
- `declare global` amplía `HTMLElementEventMap`, `DocumentEventMap` y `HTMLElementTagNameMap` para tus eventos y componentes.

## Para profundizar

- [Manual de TypeScript: manipulación del DOM (en inglés)](https://www.typescriptlang.org/docs/handbook/dom-manipulation.html)
- [lib.dom.d.ts en el repositorio de TypeScript (en inglés)](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts)
- [MDN: HTMLElement: evento input (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Element/input_event)
- [MDN: Event.target y Event.currentTarget (en inglés)](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)
- [Lit: tipos de los elementos propios en TypeScript (en inglés)](https://lit.dev/docs/components/defining/#typescript-typings)
