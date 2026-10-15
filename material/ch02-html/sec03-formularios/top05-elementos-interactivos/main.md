# Elementos interactivos

## Por qué importa

Desplegables, ventanas modales, menús, explicaciones que aparecen al pulsar un botón: durante años se fabricaron con `<div>`, mucho JavaScript y atributos ARIA, y casi siempre con fallos. El foco se escapaba de la ventana modal, Escape no la cerraba, la página de detrás seguía respondiendo, el lector de pantalla no sabía qué estaba abierto.

Hoy HTML tiene elementos nativos para todo eso: `<details>` y `<summary>` para mostrar y ocultar, `<dialog>` para las ventanas modales, el atributo `popover` para lo que aparece por encima de la página e `inert` para desactivar una zona entera. Traen de serie el teclado, el foco, la capa superior y la accesibilidad. Es la primera regla de ARIA otra vez: si existe el elemento nativo, úsalo.

## `details` y `summary`

`<details>` es un desplegable: su primer hijo, `<summary>`, es el texto siempre visible que hace de botón, y el resto del contenido aparece al abrirlo. Funciona sin una línea de JavaScript:

- Se abre y se cierra con el ratón, con Enter o con Espacio.
- Un lector de pantalla anuncia el `summary` como un botón «contraído» o «expandido».
- El atributo booleano `open` lo hace empezar abierto y refleja su estado (el CSS puede leerlo: `details[open]`).
- El contenido oculto sigue en el documento: la búsqueda del navegador (⌘F o Ctrl+F) lo encuentra y **abre** el desplegable que lo contiene.

[[exercise:01-details-y-summary.md]]

Es el elemento adecuado para preguntas frecuentes, «más información», detalles técnicos opcionales o un índice plegable. Dentro del `<summary>` no pongas enlaces ni botones: todo el `summary` ya es un botón. Si quieres que el contenido cerrado de cualquier otro elemento también lo encuentre la búsqueda, existe `hidden="until-found"`.

### Un acordeón exclusivo: `name`

Varios `<details>` con el mismo atributo `name` forman un grupo en el que solo uno puede estar abierto, igual que los botones de opción con el mismo `name`. Al abrir uno, el navegador cierra el anterior. Cada cambio lanza un evento `toggle`:

[[exercise:02-acordeon-exclusivo.md-]]

```text
1. Elige el recipiente → abierto
2. Prepara el sustrato → abierto
1. Elige el recipiente → cerrado
```

La primera línea aparece nada más cargar: el `open` escrito en el HTML también cuenta como una apertura. Las otras dos, al abrir el segundo paso. Antes de abrir algo, piensa si de verdad debe cerrarse lo demás: a veces quien lee quiere comparar dos respuestas.

## `dialog`: ventanas modales

Un `<dialog>` es una ventana que se abre sobre la página. Está cerrado mientras no tenga el atributo `open`, y se abre de dos maneras muy distintas:

- `dialog.showModal()` lo abre **modal**: aparece en la **capa superior** (*top layer*), por encima de todo, sin importar el `z-index`; detrás se dibuja un fondo (`::backdrop`); el resto de la página queda **inerte** (no se puede pulsar ni alcanzar con Tab); el foco entra en el diálogo; Escape lo cierra; y al cerrarse, el foco **vuelve** al botón que lo abrió.
- `dialog.show()` lo abre **no modal**: una ventana que convive con la página, sin fondo ni bloqueo.

`dialog.close()` lo cierra. Al abrirse, el foco va al primer elemento enfocable del diálogo, o al que tenga el atributo `autofocus`. Dale un nombre accesible con `aria-labelledby` apuntando a su título.

[[exercise:03-dialog-modal.md]]

Abrir un diálogo requiere JavaScript (`showModal()`), o los **invoker commands**: un `<button>` con `commandfor="id-del-diálogo"` y `command="show-modal"` lo abre sin una línea de JavaScript, y `command="close"` lo cierra. Están disponibles en Chrome y Edge desde la versión 135 (2025); antes de depender de ellos, comprueba en [caniuse.com](https://caniuse.com/?search=commandfor) el soporte de los navegadores de tu público. Por eso el ejemplo muestra las dos formas.

Por defecto, un diálogo modal no se cierra al pulsar el fondo. El atributo `closedby="any"` (Chrome 134 y posteriores) lo permite, como en un popover.

### Cerrar con un formulario: `method="dialog"`

Un `<form method="dialog">` dentro de un diálogo no hace ninguna petición: al enviarse, **cierra** el diálogo, y `dialog.returnValue` guarda el `value` del botón que lo envió. Es la forma natural de hacer un diálogo de confirmación: un botón por respuesta. Si el diálogo contiene un formulario de verdad (que sí debe enviarse), su botón «Cancelar» puede llevar `formmethod="dialog"`: cierra sin enviar nada.

[[exercise:04-method-dialog.md-]]

```text
returnValue → cancel
returnValue → empty
🧺 Cesta vaciada
```

En la consola de la vista previa no aparece ningún «Form submitted»: un envío con `method="dialog"` no navega, así que no hay nada que bloquear.

### `close()` sin valor no cambia `returnValue`

Un detalle traicionero: `dialog.close()` **sin argumento** (y también `requestClose()` sin argumento) cierra el diálogo sin tocar `returnValue`, que conserva la respuesta de la vez anterior. Es justo lo que hace un botón ✕ «Cerrar» escrito deprisa. Si el código que se ejecuta al cerrar mira `returnValue`, repetirá la última acción sin que nadie la haya pedido. Hay dos soluciones, y conviene usar las dos: vaciar `returnValue` antes de abrir el diálogo y cerrar siempre con un valor explícito, `close('cancel')`. Con **Escape**, el Chrome actual deja `returnValue` vacío, pero navegadores anteriores conservaban el valor anterior: otra razón para vaciarlo siempre.

[[exercise:05-returnvalue-que-se-queda.md-]]

```text
🗑 Foto borrada (returnValue: 'delete'). Quedan 4.
🗑 Foto borrada (returnValue: 'delete'). Quedan 3.
Nada que borrar (returnValue: '')
```

La segunda línea es el bicho: el diálogo se cerró con la ✕ y aun así se borró una foto.

### El atributo `open` no hace un diálogo modal

Como `open` refleja si el diálogo está abierto, es tentador abrirlo escribiendo el atributo. Pero así (o con `show()`) el diálogo es **no modal**: no hay fondo, la página de detrás sigue activa, Tab sale del diálogo, Escape no lo cierra y aparece en su sitio del documento, no por encima de todo.

[[exercise:06-open-no-es-modal.md]]

| | Atributo `open` | `show()` | `showModal()` |
|---|---|---|---|
| Capa superior y `::backdrop` | no | no | sí |
| Resto de la página inerte | no | no | sí |
| Escape lo cierra | no | no | sí |
| Para | (nada: el atributo solo refleja el estado) | diálogos no modales | diálogos modales |

## La API `popover`

El atributo `popover` convierte cualquier elemento en contenido que se abre **por encima de la página**: menús, explicaciones, selectores, avisos. Un `<button popovertarget="id">` lo abre y lo cierra, sin JavaScript. Un popover:

- está oculto hasta que se abre y entonces se dibuja en la **capa superior**, como un diálogo modal;
- **no es modal**: la página sigue activa y el foco no se mueve solo (con Tab, el siguiente elemento tras el botón es el contenido del popover);
- con `popover` (o `popover="auto"`) se cierra al pulsar fuera, con Escape o al abrir otro popover auto: es el «*light dismiss*»;
- da al botón que lo abre el estado «expandido» o «contraído» para los lectores de pantalla, sin escribir `aria-expanded`.

[[exercise:07-popover.md]]

`popovertargetaction` elige qué hace el botón: `toggle` (por defecto), `show` o `hide`. Desde JavaScript existen `showPopover()`, `hidePopover()` y `togglePopover()`, y los invoker commands también sirven (`command="toggle-popover"`). Colocar el popover junto a su botón, en lugar de en el centro de la ventana, es cosa del CSS (*anchor positioning*), que verás en su capítulo.

Hay tres tipos de popover:

| `popover` | Se cierra al pulsar fuera o con Escape | Cierra a otros popovers | Uso |
|---|---|---|---|
| `auto` (o vacío) | sí | sí, a los `auto` | menús, explicaciones, selectores |
| `manual` | no | no | avisos que deben quedarse hasta que se cierren |
| `hint` | sí | no cierra los `auto` | pistas al pasar el ratón (Chrome 133 y posteriores) |

[[exercise:08-popover-manual.md]]

## `inert`

El atributo booleano `inert` deja una parte de la página a la vista pero **fuera de alcance**: no se puede enfocar, ni pulsar, ni seleccionar su texto, ni encontrarla con la búsqueda del navegador, y desaparece del árbol de accesibilidad. Es lo que `showModal()` hace con todo lo que no es el diálogo, disponible para cualquier zona: un panel lateral cerrado que sigue en el documento, las diapositivas ocultas de un carrusel o un formulario mientras se procesa.

[[exercise:09-inert.md]]

`inert` no cambia el aspecto. Si una zona no responde, quien la ve tiene que saberlo: el ejemplo la atenúa con `[inert]` en el CSS y lo dice con palabras en la casilla. En el editor, la consola demuestra que los botones dejan de funcionar.

## ¿Cuál uso?

| Necesitas… | Usa |
|---|---|
| mostrar u ocultar contenido dentro del flujo de la página | `<details>` y `<summary>` |
| interrumpir para pedir una decisión o unos datos | `<dialog>` con `showModal()` |
| un menú, una explicación o un aviso que no bloquea la página | `popover` |
| desactivar una zona entera sin ocultarla | `inert` |

## Bestiario

- **El diálogo repite la última acción.** Síntoma: cerrar una confirmación con la ✕ borra, envía o compra otra vez. Causa: `close()` sin argumento cierra el diálogo sin cambiar `returnValue`, que guarda la respuesta anterior (con Escape pasaba lo mismo en navegadores anteriores; el Chrome actual lo vacía). Solución: `dialog.returnValue = ''` antes de cada `showModal()` y `close('cancel')` con un valor explícito. → [ver ejemplo](05-returnvalue-que-se-queda.md)
- **La ventana «modal» deja usar la página.** Síntoma: sin fondo, Tab sale de la ventana, Escape no la cierra y otros elementos la tapan. Causa: el diálogo se abrió con el atributo `open` o con `show()`. Solución: `showModal()` (o `command="show-modal"`). → [ver ejemplo](06-open-no-es-modal.md)

## Resumen

- `<details>` + `<summary>` es un desplegable nativo y accesible; con el mismo `name`, un acordeón exclusivo.
- `showModal()` abre un `<dialog>` modal: capa superior, fondo, página inerte, foco dentro, Escape y foco de vuelta al cerrar. El atributo `open` y `show()` no son modales.
- `<form method="dialog">` cierra el diálogo y deja en `returnValue` el `value` del botón; vacíalo antes de abrir, porque `close()` sin argumento no lo cambia.
- Los invoker commands (`commandfor` + `command`) abren y cierran diálogos y popovers sin JavaScript; comprueba su soporte.
- `popover` + `popovertarget` muestran contenido no modal por encima de todo; `auto` se cierra solo, `manual` no.
- `inert` deja una zona visible pero fuera de alcance del teclado, el ratón y los lectores de pantalla.

## Para profundizar

- [MDN: `<details>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/details)
- [MDN: `<dialog>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/dialog)
- [MDN: Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [MDN: Invoker Commands API](https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API)
- [web.dev: Building a dialog component](https://web.dev/articles/building/a-dialog-component)
