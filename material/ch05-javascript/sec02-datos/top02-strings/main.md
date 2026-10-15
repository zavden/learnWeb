# Strings

## Por qué importa

Casi todo lo que entra y sale de una página es texto: lo que escribe el usuario, las URL, los datos de una API, lo que pintas en pantalla. Los strings de JavaScript se parecen mucho a los de Python (inmutables, con métodos parecidos y plantillas como las f-strings), pero por dentro se guardan de otra manera. Esa diferencia hace que `'😀'.length` sea `2`, que dos «é» idénticas no sean iguales y que una lista de nombres se ordene con «Álvaro» detrás de «Zoe». Esta lección te da los métodos del día a día y, sobre todo, el modelo para entender esas sorpresas.

## Escribir strings y plantillas

Hay tres tipos de comillas. Las simples y las dobles son equivalentes: elige unas y sé coherente (en este curso usamos simples). Las invertidas crean **plantillas** (*template literals*): admiten `${expresión}` dentro y pueden ocupar varias líneas.

[[exercise:01-plantillas.md-]]

> **Desde Python:** una plantilla es una f-string sin la `f`: `` `Hola ${name}` `` es `f"Hola {name}"`. Lo que no existe es el mini-lenguaje de formato (`{x:.2f}`, `{x:>8}`, `{x:,}`): en su lugar usas métodos (`toFixed`, `padStart`) o, para números y fechas pensados para personas, `Intl` (lección «Fechas e Intl»). Las comillas normales nunca interpolan, como un string de Python sin `f`.

Los escapes son los de Python: `\n`, `\t`, `\\`, `\'`, `\"`, y `\u{1F44B}` para escribir cualquier carácter por su código (en Python, `\U0001F44B`).

## Los métodos de cada día

Los strings son inmutables (lo viste en el módulo anterior), así que ningún método los modifica: todos devuelven un valor nuevo. La mayoría tiene un equivalente directo en Python, a menudo con otro nombre:

[[exercise:02-metodos-de-python-a-javascript.md-]]

| Python | JavaScript | Nota |
|--------|------------|------|
| `len(s)` | `s.length` | propiedad, no función (y cuenta unidades UTF-16: ver más abajo) |
| `s.strip()`, `s.lstrip()`, `s.rstrip()` | `s.trim()`, `s.trimStart()`, `s.trimEnd()` | solo espacios en blanco |
| `s.upper()`, `s.lower()` | `s.toUpperCase()`, `s.toLowerCase()` | |
| `x in s` | `s.includes(x)` | `in` no sirve con strings |
| `s.startswith(x)`, `s.endswith(x)` | `s.startsWith(x)`, `s.endsWith(x)` | |
| `s.find(x)` | `s.indexOf(x)` | `-1` si no está; `lastIndexOf` busca desde el final |
| `s[i]`, `s[-1]` | `s[i]`, `s.at(-1)` | `s[-1]` es `undefined` |
| `s[a:b]`, `s[-3:]` | `s.slice(a, b)`, `s.slice(-3)` | |
| `s.split(sep)` | `s.split(sep)` | devuelve un array |
| `sep.join(lista)` | `array.join(sep)` | el método es del array |
| `s.replace(a, b)` | `s.replaceAll(a, b)` | `replace` solo cambia la primera |
| `s * 3` | `s.repeat(3)` | |
| `s.rjust(n)`, `s.zfill(n)`, `s.ljust(n)` | `s.padStart(n)`, `s.padStart(n, '0')`, `s.padEnd(n)` | |

Verás también `substring` y `substr` en código antiguo. `substr` está obsoleto y `substring` tiene reglas raras (intercambia los argumentos si van al revés y no admite negativos): usa siempre `slice`.

## Hábitos de Python que fallan

Algunos de esos métodos tienen el mismo nombre en los dos lenguajes pero no hacen lo mismo. Son los errores que cometerás la primera semana, y ninguno lanza una excepción: devuelven un resultado distinto del que esperabas.

[[exercise:03-habitos-de-python-que-fallan.md-]]

Fíjate sobre todo en `replace` y en `split()` sin argumentos. En Python, `s.replace('a', 'b')` cambia todas las apariciones y `s.split()` separa por cualquier cantidad de espacios. En JavaScript, `replace` con un string cambia solo la primera, y `split()` sin argumentos devuelve un array con el texto entero. La alternativa a `s.split()` usa una expresión regular (`/\s+/`): son patrones de búsqueda de texto, como el módulo `re` de Python, y aquí basta con copiar ese patrón.

## Qué hay dentro de un string: UTF-16

Para entender el resto de la lección hay que separar tres ideas que en el día a día llamamos «carácter»:

- Un **code point** es el número que Unicode asigna a cada símbolo: `U+0041` es la «A», `U+1F44D` es 👍.
- Una **unidad de código** es cómo se guarda ese número en memoria. JavaScript usa **UTF-16**: unidades de 16 bits. Los code points hasta `U+FFFF` caben en una; los de más arriba (emojis, muchos símbolos) ocupan **dos**, llamadas **par sustituto** (*surrogate pair*).
- Un **grafema** es lo que una persona ve como un carácter. Puede estar formado por varios code points.

```text
texto         S        í        ␠        👍
code point    U+0053   U+00ED   U+0020   U+1F44D
UTF-16        0053     00ED     0020     D83D DC4D   ← dos unidades
índice        0        1        2        3    4
```

Y aquí está la sorpresa: `length`, los corchetes, `slice`, `charCodeAt` y `split('')` trabajan con **unidades UTF-16**, no con caracteres:

[[exercise:04-length-y-utf-16.md-]]

> **Desde Python:** un `str` de Python 3 es una secuencia de **code points**, así que `len('😀')` es `1` y `'😀'[0]` es el emoji completo. JavaScript (como Java y C#) nació cuando Unicode cabía en 16 bits; cuando Unicode creció, los strings se quedaron en UTF-16 por compatibilidad. Por eso un emoji «mide» 2.

Los pares sustitutos solo tienen sentido juntos. Si cortas entre los dos, te queda un sustituto suelto, que no es texto válido y se pinta como �. `isWellFormed()` detecta ese caso.

## Recorrer por code points

Por suerte, todo lo que se añadió al lenguaje después de 2015 trabaja con code points: `for…of`, el spread `[...texto]`, `Array.from(texto)`, `codePointAt` y `String.fromCodePoint`. Para recorrer o contar caracteres, usa esas herramientas en lugar del índice numérico:

[[exercise:05-recorrer-por-code-points.md-]]

| Herramienta | Trabaja con |
|-------------|-------------|
| `s.length`, `s[i]`, `slice`, `charCodeAt`, `split('')`, `for (let i…)` | unidades UTF-16 |
| `for…of`, `[...s]`, `Array.from(s)`, `codePointAt`, `String.fromCodePoint` | code points |
| `Intl.Segmenter` con `granularity: 'grapheme'` | grafemas |

## Grafemas: lo que ve una persona

Un code point tampoco es siempre «un carácter». Un pulgar con tono de piel son dos code points (el pulgar y el modificador de color). Una familia son cinco (tres personas unidas por un carácter invisible, el *zero width joiner*). Una bandera son dos «letras regionales». Una «é» puede ser una `e` seguida de una tilde combinable. Para contar lo que la persona ve, hay que dividir el texto en **grafemas**, y eso lo hace `Intl.Segmenter`:

[[exercise:06-grafemas-con-intl-segmenter.md-]]

¿Cuándo importa? Cuando un límite de caracteres se muestra al usuario (una bio, un SMS, un nombre de usuario), cuando cortas un texto para un resumen («Leer más…») y cuando colocas el cursor en un editor. Para la mayoría de los textos sin emojis, `length` y los grafemas coinciden; con emojis, solo `Intl.Segmenter` da la respuesta correcta.

## Normalización: dos «é» distintas

Unicode permite escribir algunas letras de dos maneras: como un solo code point (`é`, `U+00E9`, forma **NFC**) o como la letra base seguida de una marca combinable (`e` + `U+0301`, forma **NFD**). Se ven idénticas, pero son strings distintos para `===`, `includes` e `indexOf`:

[[exercise:07-normalize.md-]]

El texto tecleado suele llegar en NFC, pero los nombres de archivo de macOS, algunos PDF y algunos teclados producen NFD. La regla es **normalizar al recibir el texto** (`texto.normalize()`, que equivale a `normalize('NFC')`) y no en cada comparación. El mismo mecanismo, al revés, sirve para buscar sin tildes: `normalize('NFD')` separa las letras de sus marcas y luego las borras. Ojo: también convierte la «ñ» en «n», así que úsalo para buscar, nunca para guardar.

> **Desde Python:** el problema es idéntico (`'é' == 'é'` puede ser `False`) y la solución también: `unicodedata.normalize('NFC', s)`.

## Comparar y ordenar texto

`<`, `>` y el `sort()` por defecto comparan los strings unidad a unidad por su código numérico, como Python. En ese orden, `'Z'` (90) va antes que `'a'` (97), y `'Á'` (193) y `'ñ'` (241) van después de la `z`. Para personas, ese orden está mal. `localeCompare` compara como el diccionario de un idioma, e `Intl.Collator` hace lo mismo con un objeto reutilizable:

[[exercise:08-comparar-y-ordenar.md-]]

Las opciones más útiles son `sensitivity: 'base'` (ignora mayúsculas y tildes: «Óscar» y «oscar» son equivalentes) y `numeric: true` (ordena `tema2` antes que `tema10`). Para ordenar se pasa una **función de comparación** a `sort` o `toSorted`; lo verás con detalle en la lección «Arrays». Las funciones flecha se estudian en el módulo 3: aquí basta con leer `(a, b) => a.localeCompare(b, 'es')` como `lambda a, b: …`.

## `Intl`: el texto según el idioma

`Intl` es la API de internacionalización del navegador. Trae las reglas de cientos de idiomas (los datos de Unicode CLDR) para no tener que programarlas: cómo se enumera una lista («manzanas, peras y uvas» frente a «apples, pears, and grapes»), qué forma del plural toca para un número, cómo se pasan a mayúsculas las letras de cada idioma o cómo se llama Japón en español:

[[exercise:09-intl-para-texto.md-]]

Cada constructor de `Intl` recibe una **etiqueta de idioma** BCP 47: `'es'` (español), `'es-ES'` (español de España), `'es-MX'`, `'en-US'`… Si no pasas ninguna, se usa el idioma del navegador, y entonces el resultado cambia según quién abra la página. En los ejemplos del curso siempre la escribimos para que la salida sea la misma para todos. En la lección «Fechas e Intl» verás los dos formateadores más usados: `Intl.DateTimeFormat` e `Intl.NumberFormat`.

## Bestiario

- **Hábitos de Python con strings.**
  Síntoma: `s[-1]` da `undefined`; `replace` cambia solo la primera aparición; `split()` devuelve el texto entero; `split(sep, n)` pierde el resto; `'x' in s` lanza `TypeError`; `'ab' * 3` da `NaN`.
  Causa: mismos nombres, distinto comportamiento.
  Solución: `at(-1)`, `replaceAll`, `trim().split(/\s+/)`, `indexOf` + `slice`, `includes`, `repeat`.
  → [ver ejemplo](03-habitos-de-python-que-fallan.md)
- **`'😀'.length === 2`.**
  Síntoma: un emoji cuenta como dos caracteres; `slice` lo parte y aparece �.
  Causa: los strings son unidades UTF-16 y los caracteres por encima de `U+FFFF` ocupan dos.
  Solución: `[...texto]`, `for…of` y `codePointAt` para code points; `Intl.Segmenter` para grafemas.
  → [ver ejemplo](04-length-y-utf-16.md)
- **El emoji partido al recorrer o invertir.**
  Síntoma: `for (let i…)`, `split('')` o `split('').reverse().join('')` producen �.
  Causa: trabajan por unidades UTF-16.
  Solución: `for…of` y `[...texto]`, que trabajan por code points.
  → [ver ejemplo](05-recorrer-por-code-points.md)
- **Dos textos idénticos que no son iguales.**
  Síntoma: dos «José» que se ven iguales dan `false` con `===`; una búsqueda no encuentra un nombre que está.
  Causa: uno está en forma NFC y otro en NFD.
  Solución: `normalize()` al recibir el texto.
  → [ver ejemplo](07-normalize.md)
- **«Álvaro» detrás de «Zoe».**
  Síntoma: `sort()` pone las mayúsculas primero y las tildes y la ñ al final; `tema10` va antes que `tema2`.
  Causa: el orden por defecto compara códigos numéricos de las unidades.
  Solución: `localeCompare(b, 'es')` o `new Intl.Collator('es', { numeric: true }).compare`.
  → [ver ejemplo](08-comparar-y-ordenar.md)

## Resumen

- Plantillas con comillas invertidas y `${}`: f-strings sin formato; para formatear, métodos o `Intl`.
- Los métodos devuelven strings nuevos; usa `slice`, `at`, `includes`, `replaceAll`, `padStart`, `repeat`.
- Los strings son unidades UTF-16: `length`, índices y `slice` cuentan unidades, y un emoji ocupa dos.
- `for…of`, `[...s]` y `codePointAt` trabajan con code points; `Intl.Segmenter`, con grafemas.
- Normaliza con `normalize()` al recibir texto; NFD + borrar marcas sirve para buscar sin tildes.
- Para ordenar texto de personas, `localeCompare` o `Intl.Collator` con el idioma explícito.
- `Intl` conoce las reglas de cada idioma: listas, plurales, mayúsculas, nombres de países.

## Para profundizar

- [MDN: String](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String)
- [javascript.info: strings](https://es.javascript.info/string)
- [MDN: Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- [Mathias Bynens: JavaScript has a Unicode problem](https://mathiasbynens.be/notes/javascript-unicode)
- [Documentación de Python: Unicode HOWTO](https://docs.python.org/es/3/howto/unicode.html)
