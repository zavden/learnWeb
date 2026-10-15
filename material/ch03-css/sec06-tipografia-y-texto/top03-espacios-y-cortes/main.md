# Espacios y cortes de línea

## Por qué importa

Hasta ahora has dejado que el navegador decida dónde termina cada línea, y casi siempre acierta: corta en los espacios y junta los que sobran. Pero el contenido real no siempre colabora. Un poema necesita sus saltos de línea; un comentario escrito por un usuario trae los suyos; un correo o una URL no tienen espacios y desbordan su caja; una columna justificada se llena de huecos; y «100 km» puede acabar con el «km» solo al principio de la línea siguiente.

En esta lección verás las dos decisiones que toma el navegador con el texto: qué hace con el **espacio en blanco** del HTML (`white-space`) y **dónde puede partir** una línea (los espacios, los guiones, `overflow-wrap`, `word-break` y `hyphens`). Y cumplirás una promesa de los módulos de flexbox y grid: por qué `overflow-wrap: anywhere` y no `break-word`.

## El espacio en blanco: `white-space`

En el capítulo de HTML viste que los espacios seguidos y los saltos de línea del código se juntan en un solo espacio. No es el parser quien lo hace: el DOM conserva todos los espacios, y es el **CSS** quien decide cómo dibujarlos, con `white-space`. Decide tres cosas:

| Valor | Espacios seguidos | Saltos de línea del HTML | Parte las líneas al llegar al borde |
|---|---|---|---|
| `normal` (inicial) | se juntan | se convierten en espacios | sí |
| `nowrap` | se juntan | se convierten en espacios | **no** |
| `pre` | se conservan | se conservan | **no** |
| `pre-wrap` | se conservan | se conservan | sí |
| `pre-line` | se juntan | se conservan | sí |
| `break-spaces` | como `pre-wrap`, y los espacios del final de la línea ocupan sitio | | sí |

`<pre>` lleva `white-space: pre` en la hoja del navegador; por eso el código conserva su sangría y no se parte. Un poema muestra las diferencias de un vistazo:

[[exercise:01-white-space.md]]

> **Desde Python:** el espacio en blanco de `normal` es lo que hace `" ".join(texto.split())`, y el corte de líneas del navegador se parece mucho a `textwrap.fill`, que también es voraz. `textwrap` hasta tiene opciones para lo que verás en esta lección: `break_long_words` (partir lo que no cabe) y `break_on_hyphens` (partir después de un guion).

```python
import textwrap

verso = "¿Qué es poesía?, dices    mientras clavas\n    en mi pupila tu pupila azul."

print(" ".join(verso.split()))                                         # normal
print("\n".join(" ".join(line.split()) for line in verso.split("\n")))  # pre-line
print(textwrap.fill(" ".join(verso.split()), width=24))                # normal, en 24 caracteres
```

```text
¿Qué es poesía?, dices mientras clavas en mi pupila tu pupila azul.
¿Qué es poesía?, dices mientras clavas
en mi pupila tu pupila azul.
¿Qué es poesía?, dices
mientras clavas en mi
pupila tu pupila azul.
```

Desde 2023, `white-space` es un atajo de dos propiedades: `white-space-collapse` (si se juntan los espacios y los saltos: `collapse`, `preserve`, `preserve-breaks`…; Chrome 114) y `text-wrap-mode` (si se parten las líneas: `wrap` o `nowrap`; Chrome 130). `white-space: nowrap` es lo mismo que `white-space-collapse: collapse` más `text-wrap-mode: nowrap`. Los valores clásicos siguen funcionando y son los que verás en casi todo el código.

Dos usos frecuentes de `nowrap`: impedir que un fragmento corto se parta (un precio con su moneda, un botón) y el recorte de una línea con «…» que viste en la lección de `overflow`, que necesita `nowrap`, `overflow: hidden` y `text-overflow: ellipsis` juntos. Y para el código, `tab-size` decide cuántos espacios mide un tabulador (8 por defecto).

### El texto que escribe un usuario

Un comentario, una reseña o una dirección escritos en un `textarea` llegan con sus saltos de línea. Con `white-space: normal` se pierden; con `pre-line` se conservan. Pero cuidado con la plantilla que los mete en el HTML:

[[exercise:02-pre-wrap-y-la-sangria-del-html.md]]

Con `pre-wrap` y `pre-line`, el espacio en blanco del HTML pasa a ser contenido, y el navegador no sabe cuál es del usuario y cuál de la sangría de tu plantilla. El remedio es escribir la variable pegada a las etiquetas: `<p class="comment">{{ texto }}</p>`. Y elige `pre-line` salvo que los espacios del usuario importen (un poema con sangría, arte ASCII): entonces, `pre-wrap`.

## Dónde se puede partir una línea

Una línea solo se puede partir en una **oportunidad de corte**: después de un espacio, después de un guion, entre dos ideogramas chinos o japoneses y en unos pocos sitios más que define el estándar Unicode. Una palabra, por larga que sea, no tiene ninguna. En el capítulo de HTML conociste tres herramientas para marcarlas a mano:

| Escribes | Efecto |
|---|---|
| `&nbsp;` | un espacio que **no** deja partir: «100&nbsp;km», «Felipe&nbsp;II», «55&nbsp;1234&nbsp;5678» |
| `&shy;` | un guion invisible: deja partir la palabra ahí, y solo entonces se ve |
| `<wbr>` | deja partir ahí, sin guion: etiquetas, URL, identificadores de código |

[[exercise:03-donde-se-puede-partir.md]]

La ortografía española pide el espacio de no separación entre una cifra y su unidad o su símbolo (`25&nbsp;km`, `15&nbsp;%`, `20&nbsp;°C`, `150&nbsp;MXN`) y en los números romanos detrás de un nombre. Hay más caracteres de este tipo: el guion que no deja partir (U+2011, para números de teléfono con guiones) y el espacio estrecho de no separación (U+202F), que algunos idiomas usan entre las cifras de un número grande.

## Palabras que no caben: `overflow-wrap`

Si una palabra es más larga que la línea entera, no tiene dónde partirse y **desborda** su caja: es el caso de los correos, las URL y los códigos de seguimiento. `overflow-wrap` permite, como último recurso, partirla por cualquier letra:

| Valor | Qué hace |
|---|---|
| `normal` (inicial) | nunca parte una palabra: si no cabe, desborda |
| `break-word` | si una palabra no cabe en una línea vacía, la parte |
| `anywhere` | lo mismo… y además lo tiene en cuenta al calcular el ancho mínimo del contenido |

La diferencia entre los dos últimos parece un detalle y es la clave. En un bloque normal hacen exactamente lo mismo. Pero en la lección de trampas de flexbox viste que un elemento flex no encoge por debajo de su `min-content` (el `min-width: auto`), y en la de pistas de grid, que una pista `1fr` tampoco. Con `break-word`, el `min-content` sigue siendo el correo entero: la columna no encoge, el correo cabe en ella y no se parte nada. Con `anywhere`, el `min-content` es la letra más ancha, la columna encoge y el correo se parte.

[[exercise:04-break-word-o-anywhere.md]]

Por eso los módulos de flexbox y de grid usaban `overflow-wrap: anywhere`: es la versión que funciona también en elementos flex y grid, celdas de tabla y cajas `min-content` o `fit-content`. Tiene una contrapartida: al rebajar el `min-content`, una caja que se ajusta a su contenido (una celda de tabla, una columna `auto`) puede encoger hasta dejar una letra por línea si le falta sitio. Por eso muchos resets ponen `overflow-wrap: break-word` en párrafos y títulos (no cambia ningún tamaño) y reservan `anywhere` para las piezas que reciben correos o URL dentro de una fila flex o una rejilla.

### `word-break`

`word-break` cambia las reglas de corte para **todas** las palabras, no solo para las que no caben:

- `break-all`: se puede partir entre dos letras cualesquiera. El texto se llena hasta el borde y las palabras se parten sin guion donde caiga la línea.
- `keep-all`: lo contrario para el chino, el japonés y el coreano, que normalmente se pueden partir entre dos caracteres cualesquiera: solo se parte en los espacios. Se usa sobre todo en coreano, que separa las palabras con espacios. Para el japonés, Chrome 119 añadió `auto-phrase`, que parte por frases.
- `normal` (inicial): las reglas de siempre.

[[exercise:05-word-break-break-all.md]]

Es fácil confundirlo con `overflow-wrap` porque los dos «arreglan» el correo que desborda. La diferencia es lo que le hacen al resto del texto:

| Herramienta | ¿Parte el correo? | ¿Y las palabras normales? | ¿Con guion? |
|---|---|---|---|
| `overflow-wrap: anywhere` | sí, si no cabe | no | no |
| `word-break: break-all` | sí | sí, al final de cada línea | no |
| `hyphens: auto` | no | sí, por sílabas, si mejora el corte | sí |

## Guiones automáticos: `hyphens`

Los libros parten las palabras al final de la línea con un guion, por sílabas. En la web, eso lo hace `hyphens`:

- `none`: nunca, ni siquiera donde hay un `&shy;`.
- `manual` (inicial): solo donde el HTML tiene un `&shy;`.
- `auto`: el navegador busca los cortes con un diccionario del idioma.

Con texto justificado en columnas estrechas, la diferencia es enorme: sin guiones, una palabra larga que no cabe pasa entera a la línea siguiente y deja un hueco que el navegador reparte entre las demás palabras.

[[exercise:06-hyphens.md]]

Dos propiedades afinan el resultado: `hyphenate-limit-chars: 6 3 3` (Chrome 109) no parte palabras de menos de 6 letras ni deja menos de 3 a cada lado del guion, y `hyphenate-character` cambia el carácter que se dibuja (el guion, por defecto). Lo que no hay es un control fino de cuántas líneas seguidas pueden acabar en guion: si es importante, `text-wrap: pretty` ayuda en el final del párrafo.

### El idioma: `lang`

Para partir por sílabas, el navegador necesita saber en qué idioma está el texto, y eso lo dice el atributo `lang` del elemento o de su antepasado más cercano. Chrome trae diccionarios para muchos idiomas, entre ellos el español y el inglés; para un idioma sin diccionario, o sin `lang`, `hyphens: auto` no hace nada. Y con el idioma equivocado aplica reglas equivocadas: el inglés, por ejemplo, separa las dos erres («guer-rilleros», «car-retera»), algo que el español no hace nunca, porque «rr» y «ll» son un solo sonido («guerri-lleros», «carre-tera»).

[[exercise:07-guiones-y-lang.md]]

El error más habitual no es olvidar `lang`, sino heredarlo mal: muchas plantillas empiezan con `<html lang="en">`, también la que escribe Emmet en VS Code al teclear `!`. El mismo atributo decide más cosas de las que parece: la voz y la pronunciación del lector de pantalla, la corrección ortográfica de los campos de texto, las comillas de `<q>`, el traductor automático y las mayúsculas de `text-transform`. Revisa el `lang` de cada página y pon el suyo a cada fragmento en otro idioma.

## Texto a prueba de contenido real

Con lo de esta lección y la anterior, unas pocas líneas protegen el texto de casi cualquier contenido, sin cambiar nada mientras todo quepa:

```css
html {
  /* y <html lang="es"> en el HTML: guiones, lector de pantalla, traductor */
  line-height: 1.5;
}

h1, h2, h3, p, li, dd, figcaption, blockquote {
  overflow-wrap: break-word; /* lo que no cabe se parte, sin cambiar ningún tamaño */
}

.contact dd {
  overflow-wrap: anywhere;   /* correos dentro de flex o grid: también rebaja el mínimo */
}

h1, h2, h3 {
  text-wrap: balance;        /* títulos en líneas parecidas */
}

p {
  text-wrap: pretty;         /* sin palabras solas al final */
}

.prose {
  max-inline-size: 65ch;
  hyphens: auto;             /* sobre todo si el texto va justificado o en columnas */
}
```

Y en el HTML: `&nbsp;` entre las cifras y sus unidades, y `pre-line` (con el texto pegado a las etiquetas) para lo que escriban los usuarios.

## Cómo verlo en DevTools

- **El espacio en blanco del DOM.** En **Elements**, haz doble clic en un nodo de texto: verás los espacios y saltos que tiene de verdad, aunque en pantalla se hayan juntado.
- **El idioma de un elemento.** En **Computed**, escribe `locale` en el filtro: la propiedad `-webkit-locale` muestra el idioma que Chrome está usando para ese elemento (el heredado de `lang`). Si dice `auto`, no hay idioma.
- **El ancho mínimo.** Para saber si una caja no encoge por su `min-content`, prueba en **Styles** `overflow-wrap: anywhere` o `min-width: 0` en el elemento flex y mira si cambia.

## Bestiario

- **Aparecen líneas en blanco y sangrías que nadie escribió.** Síntoma: un texto con `white-space: pre-wrap` o `pre-line` empieza con una línea vacía o tiene sangría en cada línea. Causa: el espacio en blanco de la plantilla HTML pasa a ser contenido. Solución: el texto pegado a las etiquetas, y `pre-line` si los espacios del usuario no importan. → [ver ejemplo](02-pre-wrap-y-la-sangria-del-html.md)
- **`overflow-wrap: break-word` no evita que una columna se ensanche.** Síntoma: en una fila flex, una rejilla o una tabla, la columna con un correo largo sigue más ancha que las demás y el correo no se parte. Causa: `break-word` no rebaja el `min-content`, que es lo que mira el mínimo automático de flex y grid. Solución: `overflow-wrap: anywhere`. → [ver ejemplo](04-break-word-o-anywhere.md)
- **Todas las palabras se parten por cualquier letra.** Síntoma: el texto llega hasta el borde con palabras cortadas sin guion. Causa: `word-break: break-all`, usado para que no desborde un correo. Solución: `overflow-wrap: anywhere`, que solo parte lo que no cabe. → [ver ejemplo](05-word-break-break-all.md)
- **`hyphens: auto` no parte nada, o parte mal.** Síntoma: el texto justificado sigue con huecos, o los cortes no siguen las sílabas. Causa: el elemento no tiene idioma (`lang` ausente o vacío) o tiene otro (`lang="en"` de una plantilla). Solución: el `lang` correcto en `<html>` y en cada fragmento en otro idioma. → [ver ejemplo](07-guiones-y-lang.md)

## Resumen

- `white-space` decide si se juntan los espacios, si se conservan los saltos del HTML y si las líneas se parten: `pre-line` para el texto de los usuarios, `pre` para el código, `nowrap` para lo que no debe partirse.
- Con `pre-wrap` y `pre-line`, la sangría de la plantilla también se ve: escribe el contenido pegado a las etiquetas.
- Una línea solo se parte en oportunidades de corte; `&nbsp;` las quita, `&shy;` y `<wbr>` las añaden.
- `overflow-wrap: anywhere` parte lo que no cabe y rebaja el `min-content`: es el que funciona en flex, grid y tablas; `break-word` no.
- `word-break: break-all` parte todas las palabras: solo para texto sin palabras (códigos) o CJK.
- `hyphens: auto` parte por sílabas con el diccionario del idioma de `lang`; sin `lang`, o con el equivocado, no funciona o funciona mal.

## Para profundizar

- [MDN: white-space](https://developer.mozilla.org/es/docs/Web/CSS/white-space)
- [MDN: overflow-wrap](https://developer.mozilla.org/es/docs/Web/CSS/overflow-wrap)
- [CSS-Tricks: Handling Long Words and URLs](https://css-tricks.com/snippets/css/prevent-long-urls-from-breaking-out-of-container/)
- [MDN: hyphens](https://developer.mozilla.org/es/docs/Web/CSS/hyphens)
- [Especificación: CSS Text Level 3, line breaking](https://www.w3.org/TR/css-text-3/#line-breaking)
