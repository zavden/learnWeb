# El parser de HTML

## Por qué importa

Si escribes mal una línea de Python, el programa no arranca: `SyntaxError`. Si escribes mal una etiqueta HTML, la página se ve igual… o casi. El navegador **nunca** rechaza un documento: lo repara, siguiendo unas reglas fijas, y construye un árbol que puede ser bastante distinto del que creías haber escrito. Casi todos los «mi CSS no se aplica» y «este hueco no sé de dónde sale» de un principiante vienen de aquí.

En esta lección vas a ver esas reglas en acción. Cada ejemplo imprime el **DOM resultante** con `console.log(elemento.innerHTML)`, que enseña lo que el navegador construyó, no lo que tú escribiste. Imprimimos el contenido de un contenedor (como `#demo`) en lugar de `document.body.innerHTML` porque el `body` de la vista previa también contiene el `<script>` del propio ejemplo.

## Del texto al árbol

El parser trabaja en dos fases que avanzan a la vez, carácter a carácter, mientras el HTML llega por la red:

```text
bytes ──▶ caracteres ──▶ TOKENIZADOR ──────────────▶ CONSTRUCTOR DEL ÁRBOL ──▶ DOM
          (charset)      <p>  "Hola "  <b>  "mundo"   pila de elementos abiertos
                         </b>  </p>  …                + «modo de inserción» actual
```

- El **tokenizador** trocea el texto en *tokens*: etiqueta de apertura, etiqueta de cierre, texto, comentario, DOCTYPE.
- El **constructor del árbol** decide dónde va cada token. Para ello mantiene una **pila de elementos abiertos** (como los paréntesis que aún no has cerrado) y un **modo de inserción** que cambia según dónde está («en el head», «en el body», «en una tabla», «en una fila»…).

Para cada token y cada modo, el estándar HTML dice exactamente qué hacer, también cuando el token no tiene sentido ahí. Antes de HTML5 cada navegador reparaba los errores a su manera y la misma página daba árboles distintos en cada uno; desde entonces el algoritmo de recuperación está escrito en la especificación y Chrome, Firefox y Safari producen el **mismo DOM** para el mismo HTML roto.

Siempre hay dos versiones de tu página: el HTML tal como lo escribiste (el editor; en una web cualquiera, «Ver código fuente» con <kbd>⌥</kbd> <kbd>⌘</kbd> <kbd>U</kbd>) y el DOM reparado, que es lo que enseña el panel **Elements** de DevTools. Cuando algo no cuadra, mira siempre **Elements**.

Este ejemplo comete tres errores: etiquetas cruzadas, un párrafo sin cerrar con un elemento inventado y una celda de tabla fuera de una tabla. No sale ningún error; sale esto:

[[exercise:01-el-html-nunca-falla.md]]

```text
  <p><b>negrita <i>negrita y cursiva</i></b><i> solo cursiva</i></p>
  <p>Párrafo sin cerrar con un <caja>elemento desconocido</caja>
  celda huérfana
</p>
<caja> es un → HTMLUnknownElement
```

Fíjate en cada reparación: el `<i>` cruzado se **partió en dos** (uno dentro del `<b>` y otro fuera, con el resto del texto); el párrafo se cerró solo al cerrarse su contenedor; y las etiquetas `<td>` y `</td>` desaparecieron, aunque su texto se quedó. El elemento inventado sobrevive como un elemento genérico, sin significado.

> **Desde Python:** el intérprete de Python es estricto: ante un error, se para. El parser de HTML es lo contrario, a propósito: la web tenía millones de páginas mal escritas y los navegadores competían por mostrarlas. Si algún día procesas HTML desde Python, `html.parser.HTMLParser` solo tokeniza (no repara el árbol), mientras que la librería `html5lib` (usada por BeautifulSoup con `features="html5lib"`) implementa este mismo algoritmo y obtiene el mismo DOM que el navegador.

## Cierres implícitos que son válidos

No todo lo que se cierra solo es un error. El estándar permite **omitir** algunas etiquetas de cierre porque el parser sabe deducirlas: un `<li>` termina cuando empieza el siguiente `<li>` o se cierra la lista; un `<p>` termina cuando empieza otro `<p>` o un elemento de bloque; lo mismo con `<td>`, `<tr>`, `<option>`, `<dt>`/`<dd>`…

[[exercise:02-cierres-implicitos.md]]

```text
<ul>
  <li>Uno
  </li><li>Dos
  </li><li>Tres
</li></ul>
<p>Primer párrafo
</p><p>Segundo párrafo
</p>
```

Es HTML válido, y muchas guías de estilo lo usan. Aun así, mientras aprendes, cierra siempre: el siguiente apartado muestra que «cerrarse solo» también ocurre donde no lo esperas.

## Cuando el parser cambia tu estructura

### Un `<p>` no puede contener un `<div>`

En la lección anterior viste que un `<p>` solo admite **contenido de frase** (texto, `<a>`, `<em>`, `<span>`…). Cuando el parser, dentro de un párrafo, encuentra un elemento de bloque (`<div>`, `<ul>`, `<table>`, `<h2>`, otro `<p>`…), no lo mete dentro: **cierra el párrafo** justo antes. El texto que sigue al bloque se queda suelto, y el `</p>` del final, que ya no tiene párrafo que cerrar, provoca el siguiente bicho.

[[exercise:03-p-no-puede-contener-div.md]]

```text
❌ #broken →
  <p class="note">❌ Nota: </p><div>este bloque iba dentro del párrafo</div> y esto también.<p></p>
✅ #fixed  →
  <div class="note">✅ Nota: <div>este bloque sí queda dentro</div> y esto también.</div>
```

El síntoma típico es CSS que «no se aplica»: el fondo, el color o el borde del párrafo no llegan al bloque, porque el bloque **no está** dentro del párrafo. Un selector como `.note div` no encuentra nada.

### Un `</p>` huérfano crea un párrafo

Casi cualquier etiqueta de cierre que no corresponde a nada se ignora en silencio. `</p>` es la excepción histórica: el parser crea un **párrafo vacío** en ese punto. Un `<p>` vacío no tiene altura, pero si tus párrafos tienen borde, relleno o fondo, aparece como un hueco o una raya que no está en tu código.

[[exercise:04-cierre-p-suelto.md]]

```text
❌ #broken →
  <h2>❌ Con un &lt;/p&gt; huérfano</h2>
  <p></p>
  <p>Texto del artículo.</p>
✅ #fixed  →
  <h2>✅ Sin él</h2>
  <p>Texto del artículo.</p>
```

Suele aparecer al borrar la apertura de un párrafo y olvidar el cierre, o como efecto secundario del caso anterior (`<p>` + `<div>` + `</p>`).

### Foster parenting: lo que sobra en una tabla sale fuera

Una tabla es la estructura más rígida de HTML: entre `<table>` y las celdas solo pueden ir partes de tabla (`<caption>`, `<thead>`, `<tbody>`, `<tr>`…). Si el parser encuentra texto u otro elemento suelto entre las filas, lo **saca** y lo coloca justo **delante** de la tabla. La especificación lo llama *foster parenting* (acogida): la tabla no puede ser su madre, así que el elemento pasa a su padre adoptivo.

[[exercise:05-foster-parenting.md]]

```text
  <p>❌ Este párrafo lo escribí entre la fila 1 y la fila 2…</p><table>
    <tbody><tr><td>Fila 1</td></tr>
    
    <tr><td>Fila 2</td></tr>
  </tbody></table>
```

De paso, fíjate en el `<tbody>`: no lo escribiste, pero toda fila que no está dentro de un `<thead>`, `<tbody>` o `<tfoot>` acaba dentro de un `<tbody>` creado por el parser. Lo verás de nuevo en el módulo de tablas, porque rompe selectores como `table > tr`.

## Los espacios en blanco

El parser guarda **todos** los espacios, tabuladores y saltos de línea en el DOM como texto. Es al **dibujar** cuando el CSS (con su valor por defecto, `white-space: normal`) aplica dos reglas:

1. Cualquier secuencia de espacios, tabuladores y saltos de línea se dibuja como **un único espacio**.
2. Los espacios al principio y al final de cada línea **desaparecen**.

Por eso puedes indentar tu HTML como quieras sin que se note… y por eso no puedes separar dos palabras pulsando la barra espaciadora cinco veces.

[[exercise:06-espacios-colapsados.md]]

```text
texto en el DOM → "\n    Hola,          mundo.\n    Estas    líneas    están\n          llenas de espacios.\n"
```

Para espaciar a propósito usa `&nbsp;` (un espacio que no se junta con los demás ni parte la línea), `<br>` para un salto de línea o `<pre>` para texto preformateado. Para separar *elementos*, la herramienta correcta es el CSS (márgenes y `gap`), no los espacios.

Hay un efecto secundario de la regla 1 que sorprende a todo el mundo. Entre dos elementos que se colocan **en línea** como si fueran letras (botones, imágenes, campos de formulario o cajas con `display: inline-block`), el salto de línea de tu código es un espacio de texto, y se dibuja: unos 4 px, el ancho de un espacio de la fuente. Tres cajas de un tercio de ancho más dos espacios suman más del 100 %, y la tercera baja a la línea siguiente:

[[exercise:07-hueco-entre-inline-blocks.md]]

Quitar el espacio del código lo arregla, pero empeora la legibilidad. La solución moderna llegará en el capítulo de CSS: dentro de un contenedor `flex` o `grid`, los espacios entre elementos se ignoran.

## Scripts: el parser se detiene

Cuando el parser encuentra un `<script>` normal, **se detiene**: si el script es externo (`<script src="…">`), espera a descargarlo; después lo ejecuta, y solo entonces sigue leyendo el HTML. Hay una buena razón: un script puede modificar el documento mientras se está construyendo (por ejemplo, con `document.write`), así que el parser no puede adelantarse.

Dos consecuencias:

- **Un script solo ve lo que hay por encima de él.** Desde el `<head>`, el `<body>` todavía no existe: `document.body` es `null` y cualquier búsqueda de un elemento del cuerpo devuelve `null`.
- **Un script lento en el `<head>` deja la página en blanco**: mientras se descarga y ejecuta, el parser no avanza y no hay nada que dibujar.

[[exercise:08-script-bloquea-el-parser.md-]]

```text
1. en el head → readyState: loading | body: null
1. en el head → #greeting: null
Uncaught TypeError: Cannot set properties of null (setting 'textContent')
2. a mitad del body → párrafos: 1
3. al final del body → párrafos: 2 | #greeting: <h1 id="greeting">Hola</h1>
```

Ese `TypeError` es probablemente el error más repetido de la historia de JavaScript en el navegador. Durante años la solución fue poner los `<script>` al final del `<body>`. Hoy hay atributos para eso:

| Atributo | ¿Detiene el parser? | ¿Cuándo se ejecuta? | ¿Orden garantizado? |
|---|---|---|---|
| (ninguno) | sí, para descargar y ejecutar | en cuanto el parser llega a él | sí |
| `defer` | no, se descarga en paralelo | al terminar de leer el HTML, antes de `DOMContentLoaded` | sí, el del documento |
| `async` | no, se descarga en paralelo | en cuanto termina de descargarse | **no** |
| `type="module"` | no (se comporta como `defer`) | al terminar de leer el HTML | sí |

`defer` y `async` solo tienen efecto en scripts externos (con `src`); en un script escrito dentro del HTML se ignoran. Regla práctica: `defer` para el código de tu página (necesita el DOM completo y que el orden se respete) y `async` para scripts independientes, como una analítica que no depende de nada.

Este documento carga tres scripts externos desde la carpeta `assets/js/` del tema, dos con `defer` y uno con `async`, y anuncia el evento `DOMContentLoaded`:

[[exercise:09-defer-y-async.md-]]

```text
inline     → readyState: loading | párrafos: 2
defer-1.js → readyState: interactive | párrafos: 2
defer-2.js → readyState: interactive | párrafos: 2
— DOMContentLoaded —
async.js   → readyState: interactive | párrafos: 2
```

El script normal del final del `body` se ejecuta mientras el documento aún está `loading`; los `defer` esperan a que esté `interactive` (HTML leído entero) y respetan su orden; `async.js` aparece donde le toca según lo que tarde en llegar. Pulsa ⟳ varias veces en la vista previa: su posición puede cambiar.

## Bestiario

**🐛 El fondo (o el estilo) de un párrafo no llega a lo que tiene dentro.**
- *Síntoma:* un `<div>`, lista o tabla que escribiste dentro de un `<p>` sale fuera de él; un `.note div` no encuentra nada.
- *Causa:* un `<p>` solo admite contenido de frase; el parser lo cierra al encontrar un bloque.
- *Solución:* usa `<div>` (u otro contenedor de bloque) cuando necesites bloques dentro. → [ver ejemplo](03-p-no-puede-contener-div.md)

**🐛 Un hueco o una raya que no está en el código.**
- *Síntoma:* un espacio vertical extra o un párrafo vacío que aparece en **Elements** pero no en tu HTML.
- *Causa:* un `</p>` sin su apertura crea un `<p></p>` vacío.
- *Solución:* busca el `</p>` huérfano (los validadores lo marcan). → [ver ejemplo](04-cierre-p-suelto.md)

**🐛 Un elemento escrito dentro de una tabla aparece encima de ella.**
- *Síntoma:* un texto, párrafo o formulario que estaba entre las filas se dibuja antes de la tabla.
- *Causa:* *foster parenting*: lo que no es parte de una tabla se saca y se coloca delante.
- *Solución:* mete el contenido en una celda (`<td>`), en un `<caption>` o fuera de la tabla. → [ver ejemplo](05-foster-parenting.md)

**🐛 Los espacios que escribo no se ven.**
- *Síntoma:* varios espacios o saltos de línea se ven como uno solo.
- *Causa:* el CSS por defecto (`white-space: normal`) colapsa los espacios al dibujar; en el DOM siguen ahí.
- *Solución:* `&nbsp;`, `<br>` o `<pre>` para el texto; márgenes y `gap` de CSS para separar elementos. → [ver ejemplo](06-espacios-colapsados.md)

**🐛 Tres columnas de un tercio no caben en una fila.**
- *Síntoma:* elementos `inline-block` con huecos de ~4 px entre ellos; el último salta a la línea siguiente.
- *Causa:* el salto de línea entre las etiquetas es un espacio de texto que se dibuja.
- *Solución:* quitar el espacio entre etiquetas o, mejor, usar flexbox o grid (capítulo de CSS). → [ver ejemplo](07-hueco-entre-inline-blocks.md)

**🐛 `Cannot read/set properties of null` al acceder a un elemento.**
- *Síntoma:* `TypeError` al usar un elemento que sí está en tu HTML.
- *Causa:* el script se ejecutó antes de que el parser llegara a ese elemento (un script en el `<head>` no ve el `<body>`).
- *Solución:* `<script defer src="…">` en el `<head>` (o `type="module"`), o el script al final del `<body>`. → [ver ejemplo](08-script-bloquea-el-parser.md)

## Resumen

- El parser de HTML **nunca falla**: repara cualquier error con reglas fijas del estándar, idénticas en todos los navegadores. El DOM puede no parecerse a tu archivo: compruébalo en **Elements**, no en el código fuente.
- Algunas etiquetas de cierre son opcionales (`</li>`, `</p>`, `</td>`…): el parser las deduce.
- Un bloque dentro de un `<p>` cierra el párrafo; un `</p>` huérfano crea un `<p>` vacío; lo que sobra dentro de una tabla sale delante de ella (*foster parenting*).
- Los espacios se guardan en el DOM pero se **dibujan** colapsados; entre elementos `inline-block` se ven como huecos.
- Un `<script>` normal **detiene el parser** y solo ve lo que hay encima. `defer` lo ejecuta al terminar el HTML, en orden; `async`, en cuanto llega, sin orden.

## Para profundizar

- [WHATWG — Parsing HTML documents (el algoritmo completo, con todos sus modos)](https://html.spec.whatwg.org/multipage/parsing.html)
- [MDN — El elemento `<script>`: `defer`, `async` y módulos](https://developer.mozilla.org/es/docs/Web/HTML/Element/script)
- [javascript.info — Scripts: async, defer](https://es.javascript.info/script-async-defer)
- [MDN — Cómo se gestionan los espacios en blanco en HTML, CSS y el DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Whitespace)
