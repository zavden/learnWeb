# Pseudoclases

## Por qué importa

Los selectores de la lección anterior miran lo que está **escrito** en el HTML: etiquetas, clases y atributos. Pero muchas cosas que quieres usar para dar estilos no están escritas en ningún sitio: si el ratón está encima, si una casilla está marcada **ahora**, qué posición ocupa un elemento entre sus hermanos o si contiene a otro. Las **pseudoclases** seleccionan por estado, por posición y por relaciones lógicas, y se actualizan solas cuando la página cambia, sin tocar el HTML ni escribir JavaScript.

## Qué es una pseudoclase

Una pseudoclase se escribe con **dos puntos** y un nombre, y se pega a un selector como si fuera una clase más:

```css
a:hover { }                  /* un a con el puntero encima */
li:first-child { }           /* un li que es el primer hijo de su padre */
.tasks li:not(.done) { }     /* un li de .tasks que no tiene la clase done */
input:checked + label { }    /* el label que sigue a una casilla marcada */
```

- Es un selector simple, igual que `.clase`: forma parte de un selector compuesto y se puede encadenar (`li:first-child:hover`).
- Algunas reciben argumentos entre paréntesis: `:nth-child(2)`, `:not(.done)`, `:has(img)`.
- Sin nada delante, `:hover` equivale a `*:hover`: cualquier elemento.
- No confundas pseudoclase (`:`) con pseudoelemento (`::`), que selecciona una parte de un elemento o crea una caja nueva. Los pseudoelementos son la próxima lección.

## Estados de interacción

| Pseudoclase | Coincide cuando… |
|---|---|
| `:hover` | el puntero está encima del elemento o de un descendiente |
| `:active` | el elemento se está pulsando (entre pulsar y soltar) |
| `:focus` | el elemento tiene el foco (recibe el teclado) |
| `:focus-visible` | tiene el foco y el navegador considera que hay que mostrarlo |
| `:focus-within` | el elemento o alguno de sus descendientes tiene el foco |
| `:link` / `:visited` | enlace no visitado / visitado |

[[exercise:01-hover-y-active.md]]

El orden de esas reglas importa. Cuando pulsas un botón se cumplen a la vez `:hover` y `:active`, y las dos reglas tienen la misma especificidad; gana la que aparece **después** en la hoja. Para enlaces, el orden clásico es `:link`, `:visited`, `:hover`, `:active` (en inglés se recuerda como «LoVe HAte»).

En pantallas táctiles no hay puntero que «flote» encima: `:hover` se activa al tocar y a veces se queda pegado. Nunca escondas información importante detrás de un `:hover`; en el módulo de diseño responsive verás `@media (hover: hover)` para aplicarlo solo donde existe.

El **foco** indica qué elemento recibe lo que se escribe con el teclado. Quien navega sin ratón depende del indicador de foco para saber dónde está, así que nunca lo quites sin poner otro. `:focus-visible` existe para evitar el anillo cuando haces clic en un botón (no hace falta) sin perderlo al navegar con <kbd>Tab</kbd>:

[[exercise:02-foco-focus-visible-y-focus-within.md]]

## Estados de formularios

Ya viste algunas en el capítulo de HTML, al validar formularios. Reflejan el estado **actual** del control: si marcas una casilla o vacías un campo, la pseudoclase cambia al momento, aunque el HTML siga igual.

| Pseudoclase | Coincide con… |
|---|---|
| `:checked` | casillas y radios marcados, `<option>` elegidas |
| `:disabled` / `:enabled` | controles desactivados / activos |
| `:required` / `:optional` | controles con / sin `required` |
| `:valid` / `:invalid` | controles cuyo valor cumple / no cumple sus restricciones |
| `:user-invalid` | como `:invalid`, pero solo después de que el usuario lo haya tocado |
| `:placeholder-shown` | campos que muestran su `placeholder` (están vacíos) |
| `:indeterminate` | casillas en estado indeterminado, `<progress>` sin valor |

[[exercise:03-checked-y-disabled.md]]

## Pseudoclases estructurales: la posición entre hermanos

Seleccionan según el lugar que ocupa el elemento dentro de su padre. Solo cuentan los hermanos que son **elementos**: el texto y los comentarios intermedios no cuentan.

| Pseudoclase | Coincide con el elemento que… |
|---|---|
| `:first-child` / `:last-child` | es el primer / último hijo |
| `:only-child` | es el único hijo |
| `:nth-child(An+B)` | ocupa una posición de la fórmula, contando desde el principio |
| `:nth-last-child(An+B)` | igual, pero contando desde el final |
| `:first-of-type`, `:last-of-type`, `:nth-of-type()`, `:only-of-type` | lo mismo, pero contando solo hermanos con su misma etiqueta |
| `:empty` | no tiene ningún hijo, ni siquiera texto |

[[exercise:04-primero-ultimo-y-unico.md]]

La fórmula `An+B` se evalúa probando `n = 0, 1, 2, 3…`; el navegador se queda con los resultados que son posiciones válidas (1 o más):

| Fórmula | Valores para n = 0, 1, 2, 3… | Selecciona |
|---|---|---|
| `3` | 3 | solo el tercero |
| `2n` o `even` | 0, 2, 4, 6… | los pares |
| `2n+1` o `odd` | 1, 3, 5, 7… | los impares |
| `3n+1` | 1, 4, 7, 10… | uno de cada tres, desde el primero |
| `n+4` | 4, 5, 6… | del cuarto en adelante |
| `-n+3` | 3, 2, 1, 0… | los tres primeros |

> **Desde Python:** las posiciones de CSS empiezan en **1**, no en 0. `li:nth-child(odd)` (posiciones 1, 3, 5…) corresponde en Python a `items[0::2]` (índices 0, 2, 4…). Y `:nth-child(n+4)` sería `items[3:]`.

[[exercise:05-formulas-nth-child.md]]

Ahora, la trampa más famosa de esta familia. `p:nth-child(2)` **no** significa «el segundo párrafo», sino «un elemento que es el segundo hijo de su padre y que además es un `p`». Cuenta los hermanos de cualquier tipo:

[[exercise:06-nth-child-cuenta-todo.md]]

La sintaxis `:nth-child(2 of p)` es la más potente: primero filtra los hermanos con cualquier selector y después cuenta. `:nth-of-type()` solo puede filtrar por etiqueta.

`:empty` tiene otra sorpresa: los espacios en blanco cuentan como contenido.

[[exercise:07-empty-y-espacios.md]]

## Pseudoclases lógicas: :not, :is, :where y :has

Reciben selectores como argumento y los combinan con lógica:

| Pseudoclase | Coincide si el elemento… | Ejemplo |
|---|---|---|
| `:not(S)` | **no** coincide con ninguno de los selectores de `S` | `li:not(.done)` |
| `:is(S)` | coincide con **alguno** de los selectores de `S` | `:is(h2, h3) a` |
| `:where(S)` | igual que `:is()`, pero con especificidad cero | `:where(.card) p` |
| `:has(S)` | **contiene** (o tiene a continuación) algo que coincide con `S` | `.card:has(img)` |

`:is()` sirve sobre todo para abreviar: `:is(article, aside) :is(h2, h3)` sustituye a una lista de cuatro selectores. Además, como viste en la lección 1, su lista es «indulgente»: si uno de sus selectores es inválido, ignora solo ese. `:where()` selecciona exactamente lo mismo; su diferencia está en la especificidad y la verás en la lección 5.

[[exercise:08-not-is-y-where.md]]

`:has()` es la novedad más importante de los selectores en años (todos los navegadores principales la admiten desde finales de 2023). Antes no había forma de seleccionar un elemento por lo que contiene, ni un hermano **anterior**. Con `:has()` el sujeto sigue siendo el de fuera:

```css
.card:has(img) { }            /* la tarjeta que contiene una imagen */
form:has(:user-invalid) { }   /* el formulario con algún campo mal rellenado */
h2:has(+ p) { }               /* el h2 al que le sigue directamente un p */
```

[[exercise:09-has-selector-de-padre.md]]

## El documento y la URL: :root y :target

`:root` selecciona la raíz del documento; en una página HTML, el elemento `<html>`. Selecciona lo mismo que `html`, pero pesa como una clase y funciona también en documentos SVG. Su uso principal es declarar variables globales, que verás en la lección de custom properties:

```css
:root {
  --brand-color: #2563eb;   /* una custom property: lección 10 */
}
```

`:target` selecciona el elemento cuyo `id` coincide con el **fragmento** de la URL, la parte que va tras `#`. Un clic en un enlace a `#step-2` cambia la URL y ese elemento pasa a ser `:target`, sin una línea de JavaScript:

[[exercise:10-target.md]]

## Bestiario

- **`p:nth-child(2)` marca el párrafo equivocado.** *Síntoma:* querías el segundo párrafo y se marca el primero (o ninguno). *Causa:* `:nth-child` cuenta todos los hermanos, sean del tipo que sean; un título delante desplaza la cuenta. Lo mismo pasa con `p:first-child` cuando el primer hijo no es un `p`. *Solución:* `p:nth-of-type(2)` para contar por etiqueta, o `:nth-child(2 of p)` para contar por cualquier selector. [Ver ejemplo](06-nth-child-cuenta-todo.md).
- **`:empty` no coincide con un elemento que parece vacío.** *Síntoma:* una caja sin contenido visible no recibe el estilo de `:empty`. *Causa:* un espacio o un salto de línea entre las etiquetas es un nodo de texto, y para `:empty` eso es contenido (los comentarios, en cambio, no cuentan). *Solución:* escribe la etiqueta sin nada dentro, `<div></div>`; si el HTML lo genera otra herramienta, haz que no deje espacios. [Ver ejemplo](07-empty-y-espacios.md).

## Resumen

- Una pseudoclase (`:nombre`) selecciona por estado, posición o lógica, y se recalcula sola cuando la página cambia.
- Interacción: `:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`; cuando se solapan, decide el orden de las reglas.
- Formularios: `:checked`, `:disabled`, `:valid`, `:user-invalid`…, siempre con el estado actual.
- Estructurales: `:first-child`, `:last-child`, `:only-child`, `:nth-child(An+B)`, con posiciones que empiezan en 1. `:nth-child` cuenta todos los hermanos; `:nth-of-type` y `:nth-child(… of S)`, solo los que filtras.
- Lógicas: `:not()`, `:is()`, `:where()` (especificidad cero) y `:has()`, el selector de «padre» y de «hermano anterior».
- `:root` es `<html>`; `:target` es el elemento al que apunta el `#fragmento` de la URL.

## Para profundizar

- [MDN: Pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes)
- [MDN: :nth-child()](https://developer.mozilla.org/en-US/docs/Web/CSS/:nth-child)
- [MDN: :has()](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [web.dev: Pseudo-classes](https://web.dev/learn/css/pseudo-classes)
- [MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
