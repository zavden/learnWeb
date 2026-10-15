# Elementos y atributos

## Por qué importa

HTML es un lenguaje de **marcado**: no da órdenes, *etiqueta* trozos de texto para decir qué es cada uno (un título, un párrafo, un enlace, un botón). Las reglas para escribir esas etiquetas son pocas, pero tienen letra pequeña: una barra que no cierra nada, un `disabled="false"` que desactiva, un `&` que se convierte en `®`. Conocerlas te ahorra horas mirando código que «está bien» y no funciona.

## La sintaxis de una etiqueta

Un **elemento** se escribe normalmente con una **etiqueta de apertura**, un **contenido** y una **etiqueta de cierre**:

```html
<a href="https://developer.mozilla.org/es/" title="Documentación">un enlace</a>
```

- `a` es el **nombre** del elemento (aquí, un enlace: *anchor*).
- `href="…"` y `title="…"` son **atributos**: pares `nombre="valor"` separados por espacios que configuran el elemento. Van siempre en la etiqueta de apertura.
- `un enlace` es el **contenido**, que puede incluir texto y otros elementos.
- `</a>` es la **etiqueta de cierre**: el mismo nombre precedido de `/`.

Algunas reglas que el navegador aplica al leer:

- Ni los nombres de elemento ni los de atributo distinguen mayúsculas: `<P CLASS="x">` es lo mismo que `<p class="x">`. La convención universal es escribirlo todo en minúsculas.
- Los valores de atributo pueden ir entre comillas dobles, simples o sin comillas (si no tienen espacios ni caracteres como `"`, `'`, `=`, `<`, `>` o `` ` ``). Usa siempre comillas dobles: es lo que esperan todas las herramientas y nunca falla.
- Un atributo repetido en la misma etiqueta se ignora: gana el primero.
- Un nombre de elemento desconocido (`<caja>`) no da error: el navegador crea un elemento genérico sin significado. Los nombres con guion (`<mi-tarjeta>`) están reservados para los componentes que definirás con JavaScript (*custom elements*).

En el DOM no queda rastro de cómo lo escribiste: el parser normaliza nombres a minúsculas y valores a comillas dobles.

[[exercise:01-anatomia-de-un-elemento.md]]

```text
<p class="note">Párrafo escrito con etiquetas en MAYÚSCULAS.</p>
<p id="more" title="Final">Comillas simples y valor sin comillas.</p>
```

## Elementos vacíos

Algunos elementos no pueden tener contenido, así que tampoco tienen etiqueta de cierre. Son los **elementos vacíos** (*void elements*), y la lista es cerrada:

```text
area  base  br  col  embed  hr  img  input  link  meta  source  track  wbr
```

`<br>` es un salto de línea, `<hr>` una separación temática, `<img>` una imagen, `<input>` un campo de formulario… Todo lo que necesitan va en sus atributos.

[[exercise:02-elementos-vacios.md]]

Quizá hayas visto `<br />` o `<img … />`. Esa barra final viene de XHTML, una versión de HTML con reglas de XML que se usó hacia el año 2000. En HTML se permite en los elementos vacíos y **no hace nada**: `<br>` y `<br />` producen exactamente el mismo DOM. Muchos formateadores de código la añaden por costumbre; no es ni más ni menos correcta.

El problema aparece cuando alguien acostumbrado a XML (o a JSX, el HTML de React) escribe `<div />` esperando un div vacío. En HTML esa barra se ignora en *cualquier* elemento, así que el div se queda **abierto** y se traga todo lo que viene detrás:

[[exercise:03-div-autocerrado.md]]

```text
❌ #broken →
  <div class="spacer">
  <p>❌ Este párrafo debía ir DESPUÉS de la caja vacía… y ha acabado DENTRO.</p>
</div>
✅ #fixed  →
  <div class="spacer"></div>
  <p>✅ Este párrafo sí va después de la caja.</p>
```

Fíjate en que el div del primer bloque termina justo antes de `</section>`: el parser lo cierra cuando cierra su contenedor. No hay error en ninguna parte; solo una estructura distinta de la que creías haber escrito.

## Anidamiento: el documento es un árbol

Los elementos se meten unos dentro de otros como cajas: el último que se abre es el primero que se cierra. Así se forma un **árbol** en el que cada elemento tiene un *padre* y puede tener *hijos*. Lo de dentro **hereda** parte del aspecto de lo de fuera: un `<strong>` dentro de un `<em>` sale en negrita y en cursiva a la vez.

```html
<p>Texto normal, <em>texto con énfasis y <strong>además importante</strong></em>.</p>
```

```text
p
├── "Texto normal, "
├── em
│   ├── "texto con énfasis y "
│   └── strong
│       └── "además importante"
└── "."
```

[[exercise:04-anidamiento.md]]

```text
camino hasta la raíz → strong → em → p → body → html
```

No todo puede ir dentro de todo. Cada elemento tiene un **modelo de contenido**, y el más importante a estas alturas es la diferencia entre:

- **contenido de flujo** (*flow content*): casi todo lo que va en el `body`: párrafos, listas, `<div>`, tablas, secciones…
- **contenido de frase** (*phrasing content*): el texto y los elementos que viven *dentro* de una línea de texto: `<a>`, `<em>`, `<strong>`, `<span>`, `<img>`, `<code>`…

Un `<p>` solo admite contenido de frase. En la próxima lección verás qué hace el parser cuando metes un `<div>` dentro de un `<p>` (spoiler: no lo deja ahí).

Si cruzas etiquetas (`<b><i>texto</b></i>`) el navegador tampoco protesta: reconstruye un árbol válido a su manera. También lo verás en la lección del parser.

## Atributos booleanos

Algunos atributos no tienen un valor útil: **funcionan por presencia**. Si el atributo está escrito, la opción está activada; si no está, desactivada. Son los **atributos booleanos**: `disabled`, `checked`, `hidden`, `required`, `readonly`, `multiple`, `selected`, `open`, `autofocus`…

```html
<button disabled>Enviar</button>             <!-- desactivado -->
<button disabled="disabled">Enviar</button>  <!-- desactivado (forma larga, válida) -->
<button>Enviar</button>                      <!-- activo -->
```

La trampa: el valor **no se lee**. `disabled="false"`, `disabled="no"` o `disabled="0"` siguen desactivando el botón, porque el atributo está ahí.

[[exercise:05-atributos-booleanos.md]]

```text
disabled            → disabled: true
disabled="disabled" → disabled: true
disabled="false"    → disabled: true
disabled="no"       → disabled: true
sin atributo        → disabled: false
checkbox con checked="false" → checked: true
```

Los únicos valores válidos de un booleano son el vacío (`disabled` o `disabled=""`) y su propio nombre (`disabled="disabled"`). Para «quitarlo» hay que borrarlo del HTML (o, desde JavaScript, con `removeAttribute` o poniendo la propiedad a `false`).

> **Desde Python:** es la misma trampa que `bool("False")`, que vale `True`: una cadena no vacía es verdadera, diga lo que diga. En HTML ni siquiera hace falta que el valor sea no vacío: basta con que el atributo exista.

Ojo: no todos los atributos con aspecto de «sí/no» son booleanos. `contenteditable`, `draggable` y `spellcheck` son **enumerados**: aceptan `"true"` y `"false"` como texto, y ahí `"false"` sí desactiva.

## Atributos globales

La mayoría de atributos pertenecen a un elemento concreto (`href` al enlace, `src` a la imagen), pero los **atributos globales** valen en cualquier elemento:

| Atributo | Para qué |
|---|---|
| `id` | nombre **único** en el documento: destino de enlaces (`#id`), CSS y JavaScript |
| `class` | una o varias clases separadas por espacios para agrupar elementos (CSS, JavaScript) |
| `title` | información extra en un globo al pasar el ratón (invisible con teclado y en móvil) |
| `lang` | idioma de ese fragmento |
| `dir` | dirección del texto: `ltr`, `rtl` (árabe, hebreo) o `auto` |
| `data-*` | datos propios (`data-user-id="42"`) que el navegador no interpreta |
| `hidden` | oculta el elemento (sigue en el DOM) |
| `tabindex` | si el elemento recibe el foco del teclado y en qué orden |
| `contenteditable` | permite editar el contenido directamente en la página |
| `style` | CSS en línea para ese elemento (lo verás en el capítulo de CSS) |

`id` debe ser único: si repites uno, el navegador no se queja, pero los enlaces `#id` y JavaScript solo encontrarán el primero. Los `data-*` sirven para guardar información en el propio HTML sin inventar atributos: JavaScript los lee en `element.dataset` (`data-user-id` pasa a `dataset.userId`).

[[exercise:06-atributos-globales.md]]

`hidden`, `tabindex` y `contenteditable` cambian cómo se comporta el elemento sin una línea de JavaScript:

- `hidden` lo oculta de la vista y de los lectores de pantalla, pero sigue en el DOM.
- `tabindex="0"` hace que un elemento que normalmente no recibe el foco (un `<div>`) entre en el orden de <kbd>Tab</kbd>; `tabindex="-1"` lo deja fuera del orden de <kbd>Tab</kbd>, pero se puede enfocar con un clic o desde JavaScript. Evita valores positivos (`tabindex="3"`): alteran el orden natural y desorientan a quien navega con teclado. Y si algo se pulsa, usa un `<button>`, que ya es enfocable de serie.
- `contenteditable="true"` convierte el contenido en un pequeño editor de texto.

[[exercise:07-hidden-tabindex-contenteditable.md]]

## Comentarios

Un comentario empieza con `<!--` y termina con `-->`. El navegador no lo dibuja, pero no lo borra: queda en el DOM como un *nodo de comentario* y cualquiera lo lee con «Ver código fuente» o en DevTools. Sirve para notas del autor, nunca para secretos.

Los comentarios **no se anidan**. Si comentas un bloque que ya contenía un comentario, el primer `-->` que aparece (el del comentario interior) cierra el exterior, y el resto del bloque vuelve a ser HTML visible, incluido un `-->` suelto que aparece como texto en la página:

[[exercise:08-comentarios.md]]

```text
comentario → " inicio del bloque comentado\n  <!-- comentario interior "
```

Los editores de código (atajo <kbd>⌘</kbd> <kbd>/</kbd> o <kbd>Ctrl</kbd> <kbd>/</kbd>) comentan cada línea por separado, lo que evita el problema.

## Referencias de carácter (entidades)

`<` abre una etiqueta y `&` abre una **referencia de carácter**, así que para escribirlos como texto hay que «escaparlos». Una referencia empieza con `&` y termina con `;`:

| Escribes | Obtienes | Cuándo hace falta |
|---|---|---|
| `&lt;` | `<` | siempre que quieras mostrar una etiqueta como texto |
| `&gt;` | `>` | por simetría (casi nunca es obligatorio) |
| `&amp;` | `&` | **siempre** que quieras un `&` literal |
| `&quot;` | `"` | dentro de un atributo entre comillas dobles |
| `&nbsp;` | espacio que no se parte | `100&nbsp;km`, `Sr.&nbsp;López` |
| `&#233;`, `&#xE9;` | `é` | cualquier carácter Unicode, por número (decimal o hexadecimal) |
| `&copy;`, `&euro;`, `&rarr;` | `©`, `€`, `→` | hay más de 2000 nombres |

Con `<meta charset="utf-8">` puedes escribir `é`, `ñ`, `€` o `→` directamente; las entidades solo son imprescindibles para `<`, `&`, las comillas dentro de atributos y los caracteres invisibles como `&nbsp;`. En el DOM ya no queda ninguna entidad: el parser las sustituye por el carácter correspondiente.

[[exercise:09-entidades.md]]

Y ahora la letra pequeña. Por compatibilidad con páginas de los 90, unas cien entidades antiguas funcionan **sin** punto y coma: `&reg`, `&copy`, `&curren`, `&para`, `&not`, `&amp`, `&lt`… Si escribes un `&` sin escapar y lo que le sigue empieza como una de ellas, el navegador la decodifica. Una URL escrita como texto es la víctima perfecta: `&region=es` se convierte en `®ion=es`, y `&currency=eur` en `¤cy=eur`.

[[exercise:10-ampersand-sin-escapar.md]]

```text
❌ texto → ❌ https://tienda.ejemplo.com/buscar?q=zapatos®ion=es¤cy=eur
✅ texto → ✅ https://tienda.ejemplo.com/buscar?q=zapatos&region=es&currency=eur
href del enlace → ?q=zapatos&region=es&currency=eur
```

Dentro de un atributo hay una excepción histórica (si a la entidad le sigue una letra, un número o `=`, no se decodifica), y por eso el enlace funciona. No te fíes de ella: escribe `&amp;` siempre, también en los `href`.

> **Desde Python:** el módulo `html` aplica las mismas reglas que el navegador. `html.escape('<p>Tom & "Jerry"</p>')` devuelve `'&lt;p&gt;Tom &amp; &quot;Jerry&quot;&lt;/p&gt;'`, y `html.unescape('?q=zapatos&region=es')` devuelve `'?q=zapatos®ion=es'`: el mismo «error» del navegador, reproducido fielmente.

## Bestiario

**🐛 Un `<div />` se traga el contenido que viene después.**
- *Síntoma:* lo que escribiste *después* de un elemento «autocerrado» aparece *dentro* de él (hereda sus estilos, su borde, su fondo).
- *Causa:* en HTML, `/>` solo se tolera en los elementos vacíos y no hace nada; en un `<div>`, `<span>`, `<p>`… se ignora y el elemento queda abierto hasta que se cierre su contenedor.
- *Solución:* cierra los elementos normales con su etiqueta de cierre (`<div></div>`). → [ver ejemplo](03-div-autocerrado.md)

**🐛 `disabled="false"` sigue desactivado.**
- *Síntoma:* un botón o campo sigue desactivado (o una casilla marcada, o un elemento oculto) aunque el atributo diga `"false"`.
- *Causa:* los atributos booleanos funcionan por presencia; el valor no se lee.
- *Solución:* borra el atributo para desactivar la opción. → [ver ejemplo](05-atributos-booleanos.md)

**🐛 Al comentar un bloque, parte de él sigue viéndose (y aparece un `-->` suelto).**
- *Síntoma:* texto o elementos que deberían estar comentados se ven en la página.
- *Causa:* los comentarios no se anidan: el primer `-->` cierra el comentario, aunque se abrieran dos.
- *Solución:* elimina los comentarios interiores antes de comentar un bloque, o usa el atajo de comentar del editor. → [ver ejemplo](08-comentarios.md)

**🐛 Una URL escrita como texto muestra `®ion`, `©=` o `¤cy`.**
- *Síntoma:* símbolos extraños en mitad de una URL o de un texto con `&`.
- *Causa:* un `&` sin escapar seguido de un nombre de entidad antigua (`reg`, `copy`, `curren`…) se decodifica aunque no lleve `;`.
- *Solución:* escribe siempre `&amp;` para un `&` literal, en el texto y en los atributos. → [ver ejemplo](10-ampersand-sin-escapar.md)

## Resumen

- Un elemento es `<nombre atributos>contenido</nombre>`; nombres y atributos no distinguen mayúsculas, y la convención es escribirlos en minúsculas con valores entre comillas dobles.
- Los **elementos vacíos** (`br`, `img`, `input`, `meta`…) no tienen contenido ni cierre; la barra de `<br />` se ignora, y en un elemento normal (`<div />`) **no** lo cierra.
- Los elementos anidados forman un **árbol**; cada elemento admite solo cierto contenido (un `<p>` solo admite contenido de frase).
- Los **atributos booleanos** funcionan por presencia: `disabled="false"` desactiva.
- Los **atributos globales** (`id`, `class`, `title`, `lang`, `dir`, `data-*`, `hidden`, `tabindex`, `contenteditable`) valen en cualquier elemento; `id` debe ser único.
- Los comentarios quedan en el DOM, son públicos y **no se anidan**.
- `&lt;` y `&amp;` son las entidades imprescindibles; un `&` sin escapar puede convertirse en otro carácter.

## Para profundizar

- [MDN — Introducción a HTML: anatomía de un elemento](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/Getting_started)
- [MDN — Atributos globales](https://developer.mozilla.org/es/docs/Web/HTML/Global_attributes)
- [MDN — Elementos vacíos](https://developer.mozilla.org/es/docs/Glossary/Void_element)
- [WHATWG — Lista completa de referencias de carácter con nombre](https://html.spec.whatwg.org/multipage/named-characters.html)
