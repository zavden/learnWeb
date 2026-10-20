# Pseudoelementos

## Por qué importa

Las pseudoclases eligen elementos que **ya existen** según su estado. Los **pseudoelementos** van más allá: seleccionan una **parte** de un elemento que no es un elemento del DOM (su primera letra, su primera línea, la viñeta de una lista, el texto seleccionado) o **crean** cajas nuevas antes y después de su contenido. Con ellos se añaden adornos, iconos y detalles tipográficos sin ensuciar el HTML con elementos que solo sirven para decorar.

## Sintaxis: dos veces dos puntos

Un pseudoelemento se escribe con `::` y va **siempre al final** del selector:

```css
p::first-line { }        /* la primera línea de cada párrafo */
a:hover::after { }       /* el ::after de un enlace con el puntero encima */
a::after:hover { }       /* ❌ al revés no funciona: el pseudoelemento va al final */
```

Los cuatro pseudoelementos más antiguos (`::before`, `::after`, `::first-letter`, `::first-line`) también funcionan con un solo `:` por compatibilidad con CSS de los años 90. Los modernos solo con `::`. Escribe siempre `::` y sabrás de un vistazo qué es pseudoclase y qué pseudoelemento.

| Pseudoelemento | Selecciona o crea… |
|---|---|
| `::before` / `::after` | una caja nueva al principio / al final del contenido del elemento |
| `::first-letter` | la primera letra de un bloque (con la puntuación pegada) |
| `::first-line` | la primera línea de un bloque, tal como se dibuja |
| `::marker` | la viñeta o el número de un elemento de lista |
| `::selection` | el texto que el usuario ha seleccionado |
| `::placeholder` | el texto de ejemplo de un campo de formulario |
| `::backdrop` | la capa que cubre la página bajo un popover o un `<dialog>` modal |

## ::before y ::after: contenido generado

`::before` y `::after` crean dos cajas **dentro** del elemento: la primera antes de su contenido y la segunda después. Por defecto son cajas en línea, como un `<span>`:

```text
HTML:  <p class="price">19,99</p>

Lo que se dibuja:
┌─────────────── p.price ───────────────┐
│ [::before]  19,99  [::after → " €"]   │
└───────────────────────────────────────┘
```

Lo que contienen lo decide la propiedad `content`:

| Valor de `content` | Genera |
|---|---|
| `"texto"` | ese texto literal (sin interpretar HTML: `"<b>"` se ve tal cual) |
| `attr(href)` | el valor de un atributo del elemento, como texto |
| `""` | una caja vacía, para adornos que solo llevan color, borde o fondo |
| `"(" attr(href) ")"` | varias piezas seguidas, concatenadas |
| `none` o `normal` | nada: el pseudoelemento no se genera |

> **Desde Python:** en Python, dos literales de cadena seguidos se concatenan solos: `"(" "hola" ")"` es `"(hola)"`. En `content` pasa lo mismo y es la única forma de concatenar: no existe un operador `+`.

Ese contenido no existe en el DOM: no lo encontrarás en el HTML, no se puede seleccionar con el ratón y JavaScript no lo ve con `querySelector`. En DevTools aparece dentro del elemento como `::before` o `::after`. Pero **los lectores de pantalla sí lo leen**, así que no pongas información importante solo ahí, y marca como decorativo lo que no aporte nada con un texto alternativo vacío: `content: "💡" / "";`.

[[exercise:01-before-y-after.md]]

### El content no es opcional

Un `::before` o `::after` sin la propiedad `content` (o con `content: none`) **no se genera**. Da igual que la regla le dé tamaño, color y fondo: no existe ninguna caja a la que aplicarlos. Es el error más común con pseudoelementos, porque el adorno típico no lleva texto y olvidar el `content: ""` es facilísimo:

[[exercise:02-content-obligatorio.md]]

### No funcionan en elementos reemplazados

Como `::before` y `::after` se insertan dentro del elemento, el elemento necesita tener un contenido donde meterlos. Los **elementos reemplazados** (`<img>`, `<input>`, `<video>`, `<iframe>`…) no lo tienen: el navegador dibuja en su lugar algo externo al HTML. En ellos, `::before` y `::after` no se generan (la especificación no lo define y los navegadores no lo hacen; alguna excepción puntual, como ciertas casillas en Chrome, no es fiable).

[[exercise:03-after-en-elementos-reemplazados.md]]

### Heredan de su elemento

Un pseudoelemento se comporta como un hijo de su elemento, así que **hereda** de él lo heredable: si el párrafo es azul y usa Georgia, su `::after` también, salvo que le digas otra cosa. Por eso en `.price::after` del primer ejemplo basta con cambiar el color: la fuente y el tamaño ya vienen del párrafo. La herencia se estudia a fondo en la lección 7 de este módulo.

Para inspeccionarlos, abre DevTools → Elements: aparecen como `::before` y `::after` dentro del elemento. Al seleccionarlos, el panel Styles muestra sus reglas igual que las de cualquier elemento.

### Usos habituales

| Patrón | Cómo se hace |
|---|---|
| Icono o símbolo junto a un texto | `.tip::before { content: "💡 " / ""; }` |
| Comillas alrededor de una cita | `q::before { content: "«"; }` y `q::after { content: "»"; }` |
| Asterisco de campo obligatorio | `.required-label::after { content: " *"; }` |
| Adorno sin texto (barra, punto, línea) | `content: ""` + tamaño y fondo |
| Mostrar la URL de los enlaces al imprimir | `a::after { content: " (" attr(href) ")"; }` |
| Numeración automática | contadores: `counter-reset`, `counter-increment` y `counter()` |

Los **contadores** merecen un ejemplo propio: el navegador lleva la cuenta mientras recorre el documento y `counter()` la escribe dentro de `content`. Así numeran algunos sitios sus títulos, sin escribir un solo número en el HTML:

[[exercise:09-contadores-en-content.md]]

## ::first-letter y ::first-line

Estos dos seleccionan un trozo de texto que solo se conoce **después** de calcular el diseño: qué letra queda primera o qué palabras caben en la primera línea depende del ancho. Por eso, si estrechas la ventana, `::first-line` abarca menos palabras.

- Solo funcionan en contenedores de bloque (párrafos, `div`, celdas, elementos de lista…), no en elementos en línea como `<span>`.
- `::first-letter` incluye la puntuación que va pegada a la primera letra. En español eso afecta a `¿`, `¡` y `«`: la letra capital de `¿Sabías…?` es `¿S`.
- Solo admiten un subconjunto de propiedades: de fuente, de color, de fondo, de decoración de texto… No admiten, por ejemplo, `margin` en `::first-line`.

[[exercise:04-first-letter-y-first-line.md]]

## ::marker: viñetas y números

Cada `<li>` genera un marcador (la viñeta de un `ul`, el número de un `ol`). `::marker` le da estilo, pero solo acepta unas pocas propiedades: `color`, las de fuente, `content`, `white-space` y las de animación. Un `background` o un `padding` en `::marker` se ignoran en silencio.

[[exercise:05-marker.md]]

Si necesitas un marcador con fondo o con posición libre, la técnica clásica es quitar la viñeta (`list-style: none`) y dibujar la tuya con `li::before`.

## Pseudoelementos de la interfaz

Los últimos tres seleccionan piezas que pinta el propio navegador.

`::selection` es el resaltado del texto seleccionado. Admite pocas propiedades (`color`, `background-color`, `text-decoration`, `text-shadow`) y debe mantener un buen contraste:

[[exercise:06-selection.md]]

`::placeholder` es el texto de ejemplo de un campo. No lo confundas con la pseudoclase `:placeholder-shown`, que selecciona el **campo** mientras muestra ese texto:

[[exercise:07-placeholder.md]]

`::backdrop` es una caja del tamaño de la ventana que se coloca justo debajo de un elemento de la **capa superior** (*top layer*): un popover abierto o un `<dialog>` abierto con `showModal()`. Sirve para oscurecer o difuminar el resto de la página:

[[exercise:08-backdrop.md]]

## ¿Pseudoclase o pseudoelemento?

| Pregunta | Pseudoclase (`:`) | Pseudoelemento (`::`) |
|---|---|---|
| ¿Qué selecciona? | un elemento entero, según su estado o posición | una parte de un elemento, o una caja nueva |
| Ejemplo | `li:first-child` (el primer `li`) | `li::first-letter` (la primera letra de cada `li`) |
| Ejemplo | `input:placeholder-shown` (el campo) | `input::placeholder` (el texto de ejemplo) |
| ¿Dónde va? | en cualquier parte de un selector compuesto | siempre al final |

## Bestiario

- **El `::before` no aparece, aunque la regla esté bien.** *Síntoma:* un adorno hecho con `::before` o `::after` no se ve; DevTools ni siquiera muestra el pseudoelemento. *Causa:* falta la propiedad `content` (o vale `none`/`normal`), y sin ella no se genera la caja. *Solución:* añade `content: ""` para un adorno sin texto. [Ver ejemplo](02-content-obligatorio.md).
- **El `::after` de un `input` o de una `img` no hace nada.** *Síntoma:* el pseudoelemento funciona en un `label` o un `p`, pero no en un campo de formulario ni en una imagen. *Causa:* son elementos reemplazados: no tienen contenido dentro del que insertar `::before` y `::after`. *Solución:* ponlo en el `label`, o envuelve el elemento en un `span` y usa el pseudoelemento del envoltorio. [Ver ejemplo](03-after-en-elementos-reemplazados.md).

## Resumen

- Un pseudoelemento (`::nombre`) selecciona una parte de un elemento o crea una caja nueva; va siempre al final del selector.
- `::before` y `::after` crean el primer y el último hijo del elemento; sin `content` no existen.
- `content` acepta texto, `attr()`, `""` y piezas concatenadas; ese contenido no está en el DOM, pero los lectores de pantalla lo leen.
- No funcionan en elementos reemplazados como `<input>` o `<img>`.
- `::first-letter` y `::first-line` dependen del diseño y solo se aplican a bloques; `::marker`, `::selection` y `::placeholder` admiten pocas propiedades.
- `::backdrop` cubre la página bajo un popover o un `<dialog>` modal.
- Los contadores (`counter-reset`, `counter-increment`, `counter()`) numeran elementos desde el CSS.

## Para profundizar

- [MDN: Pseudo-elements](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements)
- [MDN: content](https://developer.mozilla.org/en-US/docs/Web/CSS/content)
- [web.dev: Pseudo-elements](https://web.dev/learn/css/pseudo-elements)
- [MDN: ::marker](https://developer.mozilla.org/en-US/docs/Web/CSS/::marker)
- [MDN: ::backdrop](https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop)
