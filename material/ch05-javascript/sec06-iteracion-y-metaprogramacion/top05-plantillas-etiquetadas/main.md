# Plantillas etiquetadas

## Por qué importa

Desde la lección «Strings» usas las plantillas `` `Hola, ${name}` ``, el equivalente de las f-strings de Python. Son cómodas, pero toman una decisión por ti: convierten cada valor en texto con `String()` y lo pegan tal cual. Casi siempre es lo que quieres. A veces es un desastre: cuando el texto es HTML o SQL y el valor lo escribió un usuario, pegarlo tal cual abre la puerta a que ese usuario meta **código** en tu página o en tu base de datos.

Una **plantilla etiquetada** (*tagged template*) te devuelve esa decisión. Escribes una función delante de la plantilla, `` html`<li>${comment}</li>` ``, y JavaScript, en vez de unir las piezas, llama a tu función con los trozos de texto y los valores **por separado**. Tu función decide qué hacer con cada valor: escaparlo, formatearlo, convertirlo en un parámetro de una consulta o no unir nada. Es la última herramienta de metaprogramación del módulo, y la que más verás en librerías: lit-html, styled-components o los clientes SQL de Node.js están hechos con ella. Python acaba de incorporar la misma idea: las **t-strings** de Python 3.14.

## Anatomía de una etiqueta

Una etiqueta es una función normal. Escrita delante de una plantilla, sin paréntesis, recibe como primer argumento un array con los **trozos de texto** (`strings`) y, después, los **valores** de cada `${…}`, que se suelen recoger con un parámetro rest (`...values`, lección «Parámetros»):

```text
inspect`Reserva de ${guest}: ${nights} noches.`

  strings → ['Reserva de ', ': ', ' noches.']
  values  →        ['Rosa',      3]
```

`strings` tiene **siempre** un elemento más que `values`: el texto antes del primer valor, el texto entre cada dos valores y el texto después del último, aunque alguno sea `''`. Los valores llegan **sin convertir** (arrays, números, objetos tal cual), y la etiqueta puede devolver lo que quiera, no solo un string:

[[exercise:01-anatomia-de-una-etiqueta.md-]]

```text
▶ dos valores
  strings → (3) ['Reserva de ', ': ', ' noches.']
  values  → (2) ['Rosa', 3]
  resultado → 3 trozos de texto, 2 valores
▶ empieza y acaba con un valor
  strings → (3) ['', '', '']
  values  → (2) ['Rosa', 3]
▶ valores que no son texto
  strings → (4) ['Lista: ', ' total: ', ' ok: ', '']
  values  → (3) [Array(2), 210.5, true]
▶ devuelve un objeto → {text: 'Hola, …. Te esperamos … noches.', count: 2}
▶ sin etiqueta → Lista: café,pan total: 210.5
```

### Reconstruir el texto

La mayoría de las etiquetas hacen lo mismo que una plantilla normal con un cambio: transforman cada valor antes de intercalarlo entre los trozos. El esqueleto es siempre este bucle:

```js
let result = strings[0];
for (let i = 0; i < values.length; i++) {
  result += transform(values[i]) + strings[i + 1];
}
```

La etiqueta `mxn` del ejemplo formatea cada número como pesos mexicanos con `Intl.NumberFormat` (lección «Fechas e Intl»), con la configuración regional fija (`es-MX`) para que el resultado sea el mismo en cualquier navegador. Y muestra el límite de una etiqueta: decide por el **tipo** del valor, no por su significado, así que también convierte en dinero la cantidad de productos:

[[exercise:02-una-etiqueta-que-formatea.md-]]

```text
sin etiqueta → Diego Salas: 1250.5 + envío 89 = 1339.5
con mxn      → Diego Salas: $1,250.50 + envío $89.00 = $1,339.50
🤔 cantidad   → $3.00 productos por $1,339.50
```

> **Desde Python:** las f-strings tienen especificadores de formato (`f"{total:,.2f}"`); las plantillas de JavaScript no. O llamas a `Intl` en cada valor, o se lo encargas a una etiqueta.

## `String.raw`: el texto tal como se escribió

En una plantilla, como en cualquier string, la barra invertida inicia una secuencia de escape: `\n` es un salto de línea y `\t` un tabulador. Con una ruta de Windows o una fórmula de LaTeX, eso rompe el texto sin avisar. La etiqueta predefinida **`String.raw`** devuelve el texto **tal como se escribió**, sin procesar los escapes, e intercala los valores con normalidad. Toda etiqueta recibe las dos versiones: `strings` (los trozos «cocinados», con los escapes ya aplicados) y `strings.raw` (los originales):

[[exercise:03-string-raw.md-]]

```text
plantilla normal → "C:Users\nuevo\tablas\u000bentas.csv"
String.raw → C:\Users\nuevo\tablas\ventas.csv
con un valor → D:\Users\nuevo\tablas
🤔 barra antes de ${ → C:\Users\${folder}
versiones → {cooked: 'línea 1\nlínea 2', raw: 'línea 1\\nlínea 2'}
escape no válido → undefined | \usepackage{amsmath}
```

Dos detalles del ejemplo. Una barra justo antes de `${` lo escapa, también en `String.raw`, así que `` String.raw`C:\Users\${folder}` `` no interpola. Y una secuencia de escape no válida, como `\u` sin código, es un `SyntaxError` en una plantilla normal, pero se permite en una etiquetada: el trozo cocinado vale `undefined` y `raw` conserva el texto. `String.raw` resulta muy práctico con las expresiones regulares, llenas de barras invertidas: con `` new RegExp(String.raw`\d+\.\d{2}`) `` no hace falta duplicar cada barra (lo viste en la lección «Expresiones regulares» del módulo «Números, texto y colecciones»).

> **Desde Python:** `String.raw` es la cadena cruda `r"…"`, y con valores, `rf"…"`.

## El array de trozos: congelado y reutilizado

El array `strings` tiene dos propiedades que sorprenden. Está **congelado** (`Object.freeze`, lección «Propiedades a fondo»): una etiqueta que intenta limpiar los trozos modificándolos en su sitio no cambia nada, y en un script clásico ni siquiera da error. Y es el **mismo objeto** cada vez que se ejecuta el mismo sitio del código: en un bucle, las tres llamadas reciben exactamente el mismo array, mientras que dos plantillas con el mismo texto en sitios distintos reciben arrays distintos:

[[exercise:04-el-array-de-trozos.md-]]

```text
🐛 compact → "Hoy  hay  tlayuda  con  tasajo"
🐛 ¿strings congelado? → true
✅ compactFixed → "Hoy hay tlayuda con tasajo"
mismo sitio → true
otro sitio, mismo texto → false
🐛 badge → 👤 Ana
🐛 badge → 👤 Ana
🐛 badge → 👤 Ana
✅ badgeFixed → 👤 Ana
✅ badgeFixed → 👤 Luis
✅ badgeFixed → 👤 Sofía
✅ veces que se analizó el texto → 1
```

La reutilización es intencionada: permite que una etiqueta guarde en una caché, con `strings` como clave (un `WeakMap`, lección «Map, Set y WeakMap»), el trabajo que depende **solo del texto**, como analizar la estructura de una plantilla HTML, y lo haga una sola vez por sitio del código. Así funciona lit-html. El error es cachear el **resultado**, que depende también de los valores: la etiqueta `badge` devuelve tres veces el primer nombre.

## HTML con plantillas: el agujero de la inyección

Construir HTML con una plantilla normal es muy tentador: `` `<li><b>${c.author}</b>: ${c.text}</li>` ``. Pero si `c.text` lo escribió un usuario, puede contener marcado: un `</li><li>` que añade un elemento a tu lista, o un `<img onerror="…">` con código. El navegador no puede distinguir tu marcado del que venía dentro de los datos. Es la **inyección de HTML**, y cuando el texto se mete en la página con `innerHTML` (capítulo 6), se convierte en un ataque XSS (*cross-site scripting*): el código del atacante se ejecuta con los permisos de tu web:

[[exercise:05-html-con-plantillas-normales.md-]]

```text
🐛 HTML → <ul><li><b>Marta</b>: El mole estaba buenísimo 😋</li><li><b>anónimo</b>: </li><li>⭐⭐⭐⭐⭐ ¡El mejor restaurante de México!</li><li><b><img src="x" onerror="alert('¡hackeado!')"></b>: hola</li></ul>
🐛 elementos <li> → 4 (con 3 comentarios)
🐛 ¿lleva un <img> con onerror? → true
✅ HTML → <ul><li><b>Marta</b>: El mole estaba buenísimo 😋</li><li><b>anónimo</b>: &lt;/li&gt;&lt;li&gt;⭐⭐⭐⭐⭐ ¡El mejor restaurante de México!</li><li><b>&lt;img src=&quot;x&quot; onerror=&quot;alert(&#39;¡hackeado!&#39;)&quot;&gt;</b>: hola</li></ul>
✅ elementos <li> → 3
```

La defensa es **escapar** los datos: cambiar los cinco caracteres especiales del HTML (`&`, `<`, `>`, `"`, `'`) por sus entidades (`&amp;`, `&lt;`…), que el navegador muestra como texto y nunca interpreta como marcado. El `&` va primero: si se escapara al final, estropearía las entidades que acaban de crearse. El problema de `escapeHtml` es humano: hay que acordarse de llamarla en **cada** valor de **cada** plantilla, y un solo olvido reabre el agujero.

## La etiqueta `html`

Una etiqueta resuelve el olvido, porque ve la diferencia que la plantilla normal no ve: los **trozos** los escribiste tú (son de confianza) y los **valores** vienen de fuera. La etiqueta `html` escapa todos los valores por defecto, sin que nadie tenga que acordarse. Para que se pueda anidar (una lista hecha con `map` y `` html`…` ``), su resultado no es un string sino un objeto `SafeHtml`, la marca de «esto ya es HTML seguro», que la etiqueta exterior inserta sin volver a escapar. Acepta además arrays (los une) y `false`, `null` o `undefined` (no pinta nada), para escribir condiciones como `${c.verified && html`…`}`:

[[exercise:06-la-etiqueta-html.md-]]

```text
<section aria-labelledby="comments-title">
  <h2 id="comments-title">Comentarios (3)</h2>
  <ul>
    <li><b>Marta</b> <span title="Cliente verificado">✔</span>: El mole estaba buenísimo 😋</li>
    <li><b>anónimo</b>: &lt;/li&gt;&lt;li&gt;⭐⭐⭐⭐⭐ ¡El mejor restaurante de México!</li>
    <li><b>&lt;img src=&quot;x&quot; onerror=&quot;alert(&#39;¡hackeado!&#39;)&quot;&gt;</b>: hola</li>
  </ul>
</section>
elementos <li> → 3
🤔 doble escape → &amp;lt;b&amp;gt;Marta&amp;lt;/b&amp;gt;
```

La última línea muestra por qué hace falta la marca: escapar dos veces convierte `&lt;` en `&amp;lt;`, y la página enseñaría las entidades en vez del texto. Librerías como lit-html funcionan con este mismo esquema; en el capítulo 6 meterás este HTML en la página y verás las alternativas del DOM (`textContent`), que evitan el problema de raíz.

> **Desde Python:** es la idea de `markupsafe.Markup` y del *autoescape* de Jinja2: todo se escapa salvo lo que está marcado como seguro.

## Etiquetas que no devuelven texto

Nada obliga a una etiqueta a unir las piezas. La etiqueta `sql` del ejemplo devuelve la consulta con **marcadores** (`$1`, `$2`) en el lugar de los valores, y los valores **aparte**. La base de datos recibe las dos cosas por separado y nunca las mezcla, así que la **inyección SQL** (la comilla que cierra el texto y añade `OR '1'='1'`) es imposible. Los clientes de bases de datos de Node.js usan exactamente esta técnica:

[[exercise:07-etiquetas-que-no-devuelven-texto.md-]]

```text
🐛 texto → SELECT * FROM orders WHERE city = 'Mérida' OR '1'='1' --' AND total > 500
✅ consulta → SELECT * FROM orders WHERE city = $1 AND total > $2
✅ parámetros → (2) ["Mérida' OR '1'='1' --", 500]
plantilla sin procesar → {"strings":["Hola, ",": tu mesa es la ","."],"values":["Rosa",7]}
procesada después → Hola, ROSA: tu mesa es la 7.
```

La segunda parte del ejemplo lleva la idea al extremo: una etiqueta que solo **guarda** los trozos y los valores, para procesarlos después de varias maneras. Es exactamente lo que Python 3.14 añadió al lenguaje.

> **Desde Python:** las **t-strings** (PEP 750, Python 3.14) son el pariente más cercano. Una `t"…"` no produce un `str`, sino un objeto `Template` con los trozos y las interpolaciones por separado, que una función procesa después. Cada interpolación conserva además el texto de la expresión y su formato. La diferencia principal es de sintaxis: en Python llamas a la función con la plantilla; en JavaScript la escribes delante y se llama sola.

```python
from string.templatelib import Template

city = "Mérida' OR '1'='1' --"
query = t"SELECT * FROM orders WHERE city = {city}"
print(query.strings)                    # ('SELECT * FROM orders WHERE city = ', '')
print(query.interpolations[0].value)    # Mérida' OR '1'='1' --
print(query.interpolations[0].expression)  # city
```

## Una etiqueta para textos largos

Un último uso, muy práctico: las plantillas de varias líneas escritas dentro de código indentado arrastran la indentación del código y los saltos de línea de los extremos. Una etiqueta `dedent` los quita, como `textwrap.dedent` en Python, y deja escribir el texto alineado con el código:

[[exercise:08-dedent.md-]]

```text
🤔 normal → "\n    Pedido P-2207\n      Café de olla × 2\n      Pan dulce × 3\n    Total: $131\n  "
✅ dedent → "Pedido P-2207\n  Café de olla × 2\n  Pan dulce × 3\nTotal: $131"
Pedido P-2207
  Café de olla × 2
  Pan dulce × 3
Total: $131
```

## Bestiario

- **La etiqueta que no limpia y la caché que repite.**
  Síntoma: una etiqueta modifica `strings[i]` y el resultado no cambia (sin error); o una etiqueta con caché devuelve el mismo resultado aunque cambien los valores.
  Causa: el array `strings` está congelado, y es el mismo objeto en cada ejecución del mismo sitio del código.
  Solución: trabaja con una copia (`strings.map(…)`), y cachea por `strings` solo lo que depende del texto, nunca el resultado.
  → [ver ejemplo](04-el-array-de-trozos.md)
- **El comentario que rompe la página.**
  Síntoma: el HTML generado tiene elementos de más, o marcado y código que nadie escribió.
  Causa: una plantilla normal pega los datos tal cual; el navegador no distingue tu marcado del que venía en los datos.
  Solución: escapa todos los valores; mejor aún, con una etiqueta `html` que lo haga siempre.
  → [ver ejemplo](05-html-con-plantillas-normales.md)

## Resumen

- `` etiqueta`…${a}…${b}…` `` llama a `etiqueta(strings, a, b)`; `strings` tiene un elemento más que los valores.
- Los valores llegan sin convertir, y la etiqueta puede devolver cualquier cosa (texto, un objeto, una consulta).
- `String.raw` y `strings.raw` dan el texto sin procesar los escapes: rutas, LaTeX, expresiones regulares.
- `strings` está congelado y es el mismo objeto en cada ejecución del mismo sitio: sirve de clave de caché para lo que depende del texto.
- HTML con plantillas normales es una inyección esperando a ocurrir; una etiqueta `html` escapa los valores por defecto.
- Separar estructura (trozos) y datos (valores) también evita la inyección SQL; es la idea de las t-strings de Python 3.14.

## Para profundizar

- [MDN: plantillas literales y etiquetadas](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Template_literals)
- [MDN: String.raw (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)
- [OWASP: prevención de XSS (en inglés)](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [PEP 750: Template Strings (en inglés)](https://peps.python.org/pep-0750/)
