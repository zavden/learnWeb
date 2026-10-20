# Texto

## Por qué importa

Casi todo lo que hay en una página es texto, y HTML tiene una etiqueta para cada papel que puede jugar ese texto: título, párrafo, énfasis, cita, código, fecha, sigla… El navegador da a cada una un aspecto por defecto, pero lo que de verdad aportan es **significado**: un lector de pantalla salta de título en título, un buscador entiende de qué trata la página, el modo lectura del navegador sabe qué es el contenido principal, un traductor automático no traduce el código.

La regla de toda esta lección es una sola: **elige la etiqueta por lo que el texto *es*, no por cómo quieres que se vea**. El aspecto se cambia con CSS (capítulo 3); el significado, no. Y como siempre, hay letra pequeña: títulos que rompen el índice sin que nada se vea mal y un `<pre>` que se come un salto de línea.

## Títulos: `h1` a `h6`

HTML tiene seis niveles de título, de `<h1>` (el más importante) a `<h6>`. Juntos forman el **índice** del documento, como los capítulos y apartados de un libro: un `<h3>` es un apartado del `<h2>` que tiene encima.

Ese índice no es decorativo. Más de dos tercios de las personas que usan lector de pantalla dicen que lo primero que hacen en una página es recorrer sus títulos (tecla <kbd>H</kbd> en NVDA, el «rotor» en VoiceOver) para hacerse una idea de qué hay y saltar a lo que buscan. Los buscadores también los usan para entender la página.

Reglas prácticas:

- **Un `<h1>` por página**: el título de lo que se está viendo (suele coincidir con el `<title>` del documento, sin el nombre del sitio).
- **No te saltes niveles al bajar**: después de un `<h2>` viene un `<h3>`, no un `<h4>`. Al subir sí puedes saltar (de un `<h4>` a un `<h2>` que abre una sección nueva).
- **El nivel lo decide la estructura, nunca el tamaño.** Que un `<h3>` se vea demasiado grande se arregla con CSS.

El navegador da a cada nivel un tamaño (en relación con el texto normal, `1em` = 16 px) y negrita:

| Elemento | Tamaño por defecto | En píxeles |
|---|---|---|
| `<h1>` | `2em` | 32 px |
| `<h2>` | `1.5em` | 24 px |
| `<h3>` | `1.17em` | 18,72 px |
| `<h4>` | `1em` | 16 px |
| `<h5>` | `0.83em` | 13,28 px |
| `<h6>` | `0.67em` | 10,72 px |

Fíjate en los dos últimos: `<h5>` y `<h6>` son **más pequeños** que un párrafo. Es otra pista de que casi nunca hacen falta; si llegas a ellos, quizá esa página debería partirse en varias.

Este ejemplo es una guía de viaje con los seis niveles. Su script imprime el índice tal como lo recorre un lector de pantalla, con el tamaño que el navegador dio a cada título:

[[exercise:01-jerarquia-de-titulos.md]]

```text
h1 (32px) → Granada en un fin de semana
  h2 (24px) → Qué ver
    h3 (18.72px) → La Alhambra
    h3 (18.72px) → El Albaicín
  h2 (24px) → Cómo moverse
    h3 (18.72px) → Autobús
      h4 (16px) → Líneas al centro
        h5 (13.28px) → Línea C30
          h6 (10.72px) → Horario de invierno
```

> **Desde Python:** si has escrito un `README.md` o celdas de texto en Jupyter, ya conoces esta jerarquía: Markdown convierte `#` en `<h1>`, `##` en `<h2>` y así hasta `######`. Este mismo curso está escrito así.

El error más común con los títulos no se ve en pantalla. Alguien quiere «un título más pequeño» y escribe `<h4>` justo después del `<h1>`; luego quiere que un aviso se vea grande y lo convierte en `<h2>`. La página parece correcta, pero el índice queda roto: niveles que saltan, una oferta convertida en sección y las opiniones colgando de ella.

[[exercise:02-titulos-por-tamano.md-]]

```text
❌ #broken: salta de h1 a h4, y la oferta parece una sección
h1 → ❌ Cafetera italiana de acero
      h4 → Características
  h2 → ¡Envío gratis!
      h4 → Opiniones
✅ #fixed: dos secciones al mismo nivel
h1 → ✅ Cafetera italiana de acero
  h2 → Características
  h2 → Opiniones
```

## Párrafos

`<p>` es un párrafo: un bloque de texto que empieza en línea nueva y, por defecto, deja un margen de `1em` arriba y abajo. Como viste en la lección del parser, dentro de un párrafo los espacios y saltos de línea seguidos se dibujan como un solo espacio, y solo admite contenido de frase (texto, enlaces, énfasis…), nunca bloques.

Cada idea, un párrafo. No uses `<br>` para separar párrafos ni párrafos vacíos para dejar hueco: los márgenes son cosa del CSS.

## Énfasis e importancia: `em`, `strong`, `i` y `b`

Estos cuatro elementos se dibujan de solo dos maneras (cursiva y negrita), pero significan cosas distintas:

| Elemento | Significa | Aspecto por defecto | Úsalo para |
|---|---|---|---|
| `<em>` | **énfasis**: cambia el sentido de la frase | cursiva | la palabra que acentuarías al decirla en voz alta |
| `<strong>` | **importancia**, gravedad o urgencia | negrita | avisos, advertencias, lo que no hay que pasar por alto |
| `<i>` | otra **voz** o registro | cursiva | palabras de otro idioma, términos técnicos, nombres científicos, títulos de barcos, pensamientos |
| `<b>` | **llamar la atención** sin añadir importancia | negrita | palabras clave, nombres de producto en una reseña, la entradilla de una noticia |

`<em>` es el único que cambia lo que dice la frase: «*Yo* no he dicho que llegues tarde» y «Yo no he dicho que llegues *tarde*» no significan lo mismo. Anidados, `<em>` y `<strong>` suman: un `<strong>` dentro de otro es aún más importante.

[[exercise:03-enfasis-e-importancia.md]]

Con `<i>` añade `lang` cuando el texto está en otro idioma: el lector de pantalla cambiará de pronunciación y el traductor automático lo respetará. En cambio, la mayoría de lectores de pantalla **no** cambian de voz con `<em>` o `<strong>` en su configuración por defecto. Su significado lo aprovechan los buscadores, el modo lectura, las herramientas de traducción y quien mantiene tu código; y te dan un gancho para el CSS que no depende del aspecto.

Un poco de historia: en HTML 4, `<b>` e `<i>` eran puramente visuales («negrita», «cursiva»). HTML5 les dio el significado de la tabla en lugar de eliminarlos, porque estaban en millones de páginas. Si solo quieres cursiva o negrita sin ningún significado, eso es CSS.

## Saltos de línea: `br` y `wbr`

`<br>` (un elemento vacío) es un salto de línea **dentro** de un mismo texto, cuando el salto forma parte del contenido: los versos de un poema, las líneas de una dirección postal. No sirve para separar párrafos ni para dejar espacio: `<br><br>` deja un hueco que el CSS no puede ajustar y que un lector de pantalla puede anunciar como líneas en blanco.

`<wbr>` (*word break opportunity*) es lo contrario de un salto: un sitio donde la línea **puede** partirse si no cabe. No dibuja nada. Sirve para palabras muy largas sin espacios, como identificadores de código o rutas. La entidad `&shy;` (*soft hyphen*, guion opcional) hace lo mismo, pero si la palabra se parte añade un guion al final de la línea.

[[exercise:04-saltos-br-y-wbr.md]]

## Código: `code`, `pre`, `kbd` y `samp`

Para escribir sobre programación hay cuatro elementos:

- `<code>`: un fragmento de código dentro del texto (`len("hola")`). Se dibuja en fuente monoespaciada.
- `<pre>`: texto **preformateado**. Respeta todos los espacios y saltos de línea tal como los escribiste (lo contrario de lo que pasa en un `<p>`) y usa fuente monoespaciada. `<pre><code>…</code></pre>` es la forma estándar de un bloque de código.
- `<kbd>`: lo que el usuario **teclea**: <kbd>Ctrl</kbd> + <kbd>C</kbd>.
- `<samp>`: lo que un programa **responde** (un mensaje de error, la salida de un comando).

Dentro de `<pre>` y `<code>` el HTML sigue siendo HTML: `<` sigue abriendo etiquetas y `&` sigue abriendo entidades. Para mostrar código HTML, escápalo con `&lt;` y `&amp;`, como viste en la lección de elementos y atributos.

[[exercise:05-pre-code-kbd.md]]

`<pre>` tiene dos sorpresas. La primera viene del parser: un salto de línea **justo después** de `<pre>` se borra. Es una comodidad, para que puedas escribir `<pre>` en una línea y el contenido en la siguiente, pero solo se borra uno: si querías una línea en blanco arriba, necesitas dos. La segunda es la contraria: la **indentación** no se borra. Si sangras el contenido del `<pre>` para que cuadre con el resto de tu HTML, esos espacios se dibujan, y los que hay delante de `</pre>` crean una línea de más al final.

[[exercise:06-pre-salto-inicial.md]]

```text
#one       → "Sin línea en blanco encima (el salto se borró)"
#two       → "\nCon una línea en blanco encima (había dos saltos)"
#indented  → "      def greet(name):\n          return f\"Hola, {name}\"\n    "
#fixed     → "def greet(name):\n    return f\"Hola, {name}\"\n"
```

El texto de `#one` empieza directamente por «Sin»: el salto que escribiste tras `<pre>` no llegó al DOM. El de `#indented` arrastra seis espacios en cada línea y termina con cuatro más. La regla es escribir el contenido de un `<pre>` pegado al margen izquierdo del archivo, aunque rompa la indentación del resto. `<textarea>`, el campo de texto de varias líneas que verás en formularios, borra el primer salto de la misma manera.

> **Desde Python:** es el mismo problema que una cadena con triple comilla dentro de una función indentada: `"""` arrastra la sangría de cada línea, y por eso existe `textwrap.dedent`. HTML no tiene un `dedent`: la sangría que escribes es la que se dibuja.

## Citas: `blockquote`, `q` y `cite`

- `<blockquote>` es una cita **larga**, en bloque (el navegador la sangra a ambos lados). Su atributo `cite` guarda la URL de la fuente, pero **no se muestra**: es un dato para máquinas. La atribución visible (quién lo dijo) va fuera de la cita.
- `<q>` es una cita **corta** dentro de una frase. El navegador le pone comillas automáticamente, y elige cuáles según el idioma (`lang`) del propio elemento: « » en español, “ ” en inglés, „ “ en alemán. Si escribes tú las comillas además del `<q>`, saldrán dobles. Las comillas no forman parte del texto: las dibuja el CSS del navegador con `::before` y `::after` (pseudoelementos que verás en CSS).
- `<cite>` (el elemento, no el atributo) es el **título de una obra**: un libro, una película, una canción, un artículo. No es el nombre de una persona.

[[exercise:07-citas.md]]

```text
blockquote.cite → https://www.w3.org/WAI/fundamentals/accessibility-intro/
texto del q     → se hace camino al andar
su ::before     → open-quote
```

## Siglas, fechas y resaltado: `abbr`, `time` y `mark`

`<abbr>` marca una sigla o abreviatura. Con `title` muestra la forma completa en un globo al dejar el ratón encima, pero ese globo no aparece con teclado ni en el móvil, y muchos lectores de pantalla no leen el `title`. La forma más accesible es desarrollar la sigla en el propio texto la primera vez que aparece: «Organización Mundial de la Salud (OMS)».

`<time>` envuelve una fecha, una hora o una duración. El texto es para personas («el lunes que viene», «hora y media»); su atributo `datetime` repite el dato en un formato estándar que entienden las máquinas (buscadores, calendarios, JavaScript):

| Qué | `datetime` |
|---|---|
| fecha | `2026-11-02` |
| hora | `09:30` |
| fecha y hora con zona horaria | `2026-11-02T09:30+01:00` |
| duración (1 h 30 min) | `PT1H30M` |

`<mark>` resalta texto por su **relevancia en ese contexto**: las palabras que coinciden con una búsqueda, o la parte de una cita que quieres comentar. No es un rotulador para «lo importante»; para eso está `<strong>`.

[[exercise:08-abbr-time-mark.md]]

```text
abbr.title → Organización Mundial de la Salud
lunes 2 de noviembre → datetime: 2026-11-02
nueve y media        → datetime: 09:30
hora y media         → datetime: PT1H30M
```

> **Desde Python:** el formato de `datetime` es ISO 8601, el mismo que produce `date(2026, 11, 2).isoformat()` → `'2026-11-02'` y que lee `date.fromisoformat()`.

## Subíndices, superíndices y letra pequeña

`<sub>` y `<sup>` bajan o suben el texto cuando una convención lo exige: fórmulas químicas (H<sub>2</sub>O), exponentes (10<sup>8</sup>), llamadas a notas al pie. No los uses para los ordinales españoles: `1.º` y `2.ª` se escriben con los caracteres `º` y `ª`, que ya están diseñados para ir arriba.

`<small>` es la **letra pequeña**: avisos legales, condiciones, derechos de autor, aclaraciones al margen. Su significado es «comentario secundario», no «texto más pequeño».

[[exercise:09-sub-sup-small.md]]

## Otros elementos de texto

No hace falta memorizarlos, pero conviene saber que existen antes de inventar algo con `<span>` y CSS:

| Elemento | Para qué |
|---|---|
| `<del>` / `<ins>` | texto eliminado / añadido en una revisión (con `datetime` opcional) |
| `<s>` | algo que ya no es cierto o no aplica (un precio anterior tachado) |
| `<u>` | anotación no textual, como una falta de ortografía marcada; no lo uses para subrayar, se confunde con un enlace |
| `<dfn>` | el término que se está definiendo en esa frase |
| `<var>` | una variable matemática o de programación |
| `<bdi>` | texto cuya dirección (izquierda-derecha) no conoces, como un nombre de usuario en árabe |

## Bestiario

**🐛 El índice de títulos salta niveles o tiene «secciones» que no lo son.**
- *Síntoma:* la página se ve bien, pero al recorrer los títulos con un lector de pantalla (o con una extensión que muestre el índice) faltan niveles, y un aviso aparece como si fuera una sección con contenido debajo.
- *Causa:* el nivel de los títulos se eligió por su tamaño por defecto y no por su lugar en la estructura.
- *Solución:* elige el nivel por la estructura (sin saltar niveles al bajar) y cambia el tamaño con CSS; lo que solo debe destacar es un párrafo con una clase. → [ver ejemplo](02-titulos-por-tamano.md)

**🐛 Al `<pre>` le falta la línea en blanco del principio, o su contenido sale desplazado a la derecha.**
- *Síntoma:* una línea en blanco que escribiste justo después de `<pre>` no aparece; o el código sale sangrado y con una línea vacía de más al final.
- *Causa:* el parser borra un único salto de línea justo después de `<pre>`; todo lo demás (incluida la indentación de tu archivo) se conserva y se dibuja.
- *Solución:* escribe el contenido del `<pre>` pegado al margen izquierdo y el `</pre>` justo al final del texto (o al principio de la línea siguiente); si quieres una línea en blanco inicial, deja dos saltos. → [ver ejemplo](06-pre-salto-inicial.md)

## Resumen

- Elige cada etiqueta por lo que el texto **es**; el aspecto se cambia con CSS.
- `<h1>`…`<h6>` forman el índice del documento: un `<h1>` por página, sin saltar niveles al bajar, nivel elegido por estructura y no por tamaño.
- `<em>` cambia el sentido (énfasis), `<strong>` marca importancia; `<i>` es otra voz (con `lang` si es otro idioma) y `<b>` llama la atención sin añadir importancia.
- `<br>` solo para saltos que son parte del contenido; `<wbr>` y `&shy;` dicen dónde se puede partir una palabra larga.
- `<code>`, `<pre>`, `<kbd>` y `<samp>` para escribir sobre código; dentro, `<` y `&` se escapan igual.
- Un `<pre>` pierde el primer salto de línea, pero conserva toda la indentación que escribas.
- `<blockquote cite>`, `<q>` (comillas automáticas según `lang`) y `<cite>` (título de una obra); `<abbr>`, `<time datetime>`, `<mark>`, `<sub>`, `<sup>` y `<small>` completan el repertorio.

## Para profundizar

- [MDN — Fundamentos de texto en HTML](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/HTML_text_fundamentals)
- [MDN — Formato de texto avanzado (citas, siglas, código, fechas)](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/Advanced_text_formatting)
- [WHATWG — Text-level semantics (el significado oficial de cada elemento)](https://html.spec.whatwg.org/multipage/text-level-semantics.html)
- [WebAIM — Semantic Structure: Regions, Headings, and Lists](https://webaim.org/techniques/semanticstructure/)
