# Expresiones regulares

## Por qué importa

Muchas tareas con texto son, en el fondo, preguntas sobre su **forma**: ¿es esto un código postal de cinco cifras?, ¿dónde están las fechas de este mensaje?, ¿cómo convierto «2026-10-14» en «14/10/2026»?, ¿cómo separo una lista escrita a mano con comas, puntos y comas y espacios de más? Con los métodos de la lección «Strings» se puede, pero cada pregunta pide un bucle y varios `indexOf`. Una **expresión regular** (*regex*) describe la forma del texto en una línea, y el motor del navegador hace la búsqueda.

Ya las has visto de pasada: el `/\s+/` de la lección «Strings», el `\p{M}` que borraba tildes y el atributo `pattern` del capítulo de HTML. Si conoces el módulo `re` de Python, la sintaxis te resultará familiar; las diferencias están en los métodos, en los flags y en unas cuantas trampas que esta lección enseña una a una: patrones que aceptan un trozo del valor, clases que no conocen la ñ, regex que recuerdan dónde se quedaron y regex que congelan la página.

## Escribir una regex y buscar con ella

Una regex se escribe entre barras, `/CAF-\d{3}/`, igual que un string se escribe entre comillas. Detrás de la última barra van los **flags** (`/café/gi`), letras que cambian cómo busca. Es un objeto (`typeof` da `'object'`) que guarda su texto en `source` y sus flags en `flags`. Dentro, casi todos los caracteres se representan a sí mismos; los que tienen un significado especial (`\ ^ $ . | ? * + ( ) [ ] { } /`) se escapan con una barra invertida: `\.` es un punto de verdad y `\/` una barra.

Para buscar hay métodos en la regex y en los strings:

| Método | Pregunta | Devuelve |
|--------|----------|----------|
| `regex.test(s)` | ¿aparece? | `true` o `false` |
| `s.search(regex)` | ¿dónde aparece por primera vez? | el índice, o `-1` |
| `s.match(regex)` sin `g`, `regex.exec(s)` | la primera, con detalles | un array con `index` y los grupos, o `null` |
| `s.match(regex)` con `g` | todas | un array de strings, o `null` |
| `s.matchAll(regex)` (exige `g`) | todas, con detalles | un iterador de arrays como el de `match` |

[[exercise:01-buscar-con-una-regex.md-]]

```text
typeof → object | source → CAF-\d{3}
test → true
search → 8
match → ['CAF-500', index: 8, input: 'Pedido: CAF-500 x2, CAC-250 x1, CAF-120 x3', groups: undefined]
first[0] → CAF-500 | index → 8
exec → CAF-500
flags → g
match g → (3) ['CAF-500', 'CAC-250', 'CAF-120']
sin coincidencias → null
cuántas → 0
matchAll → (3) ['CAF-500 en 8', 'CAC-250 en 20', 'CAF-120 en 32']
sin i → false | con i → true
```

Fíjate en que `match` con `g` devuelve `null`, no un array vacío, cuando no encuentra nada: `(texto.match(regex) ?? []).length` cuenta sin riesgo. `matchAll` devuelve un **iterador**, un objeto que entrega los resultados de uno en uno; lo estudiarás en el módulo «Iteradores, generadores y metaprogramación». De momento, `[...]` lo convierte en un array, igual que convertías un string en un array de caracteres.

> **Desde Python:** `regex.test(s)` es `re.search(p, s) is not None`; `s.match(regex)` sin `g` es `re.search` (la primera coincidencia, en cualquier parte); con `g`, `re.findall`; y `s.matchAll(regex)`, `re.finditer`. Ojo con el nombre: el `match` de JavaScript busca en todo el texto, no solo al principio como `re.match`. Tampoco hace falta `re.compile`: una regex literal se prepara una sola vez.

## Construir una regex a partir de un string

Cuando el patrón depende de datos (un prefijo que se elige en un menú, lo que busca el usuario), se construye con `new RegExp(texto, flags)`. La trampa está en que el texto pasa **antes** por las reglas de los strings, y para un string `'\d'` es un escape que no existe y se queda en `'d'`. Hay que doblar cada barra: `'\\d'`.

El texto que escribe un usuario tiene otra trampa: el punto, el `+` o un paréntesis son metacaracteres, así que buscar «1.5 kg» encuentra «125 kg», y buscar «mole (500 g» ni siquiera es una regex válida. `RegExp.escape(texto)` los escapa todos. Es reciente: en Chrome desde la versión 136 (y en Node 24).

[[exercise:02-barras-dobles-en-new-regexp.md-]]

```text
🐛 source → CAF-d{3} | test → false
✅ source → CAF-\d{3} | test → true
🐛 busca «1.5 kg» → true
🐛 SyntaxError | Invalid regular expression: /mole (500 g/: Unterminated group
escape → \x31\.5\x20kg
✅ busca «1.5 kg» → false true
✅ sin error → true
```

Un patrón mal formado lanza un `SyntaxError` con un mensaje de V8 (el motor de Chrome y de Node) que incluye la regex y el motivo. Con `new RegExp`, el error ocurre al ejecutar esa línea y se atrapa con `try/catch`, que es lo que necesitas si el patrón viene de fuera. Con una regex **literal** mal escrita, el error es de sintaxis del script entero: no se ejecuta ni una línea. Los mensajes que más verás:

| Patrón | Mensaje (tras `Invalid regular expression:`) |
|--------|----------------------------------------------|
| `(` | `/(/: Unterminated group` |
| `a)` | `/a)/: Unmatched ')'` |
| `[abc` | `/[abc/: Unterminated character class` |
| `*a` | `/*a/: Nothing to repeat` |
| `[z-a]` | `/[z-a]/: Range out of order in character class` |
| `(?P<year>\d{4})` (sintaxis de Python) | `/(?P<year>\d{4})/: Invalid group` |
| `[a-z0-9_-]` con el flag `v` | `/[a-z0-9_-]/v: Invalid character in character class` |

> **Desde Python:** en Python escribes `r'\d+'` para que la barra llegue intacta al módulo `re`. En JavaScript, el literal `/\d+/` ya es «crudo»; el problema solo aparece con `new RegExp('…')`, y lo que equivale a `r'…'` es `String.raw`, que verás en la lección «Plantillas etiquetadas». `RegExp.escape` es `re.escape`.

## Clases de caracteres

Una **clase** encaja con **un** carácter de un conjunto:

| Clase | Encaja con | Contraria |
|-------|-----------|-----------|
| `\d` | una cifra `0-9` | `\D` |
| `\w` | una letra ASCII, una cifra o `_` | `\W` |
| `\s` | un espacio en blanco (espacio, tabulador, salto de línea…) | `\S` |
| `.` | cualquier carácter salvo el salto de línea | — |
| `[aeiou]`, `[a-z]` | uno de la lista o del rango | `[^aeiou]`, `[^a-z]` |
| `\p{L}`, `\p{Lu}`, `\p{N}` | una letra, una mayúscula, un número de cualquier alfabeto (con `u` o `v`) | `\P{L}`… |

Dentro de los corchetes casi nada es especial: `[.]` es un punto, y `^` solo niega si va el primero. El guion marca un rango entre dos caracteres; al principio o al final es un guion literal, salvo en el modo `v`, como verás enseguida.

La trampa es `\w`. Su definición viene de los años 80 y es solo ASCII: `[A-Za-z0-9_]`. Una tilde, una diéresis o una ñ no son «caracteres de palabra», y `\b`, la **frontera de palabra** (el punto entre un `\w` y algo que no lo es), usa la misma definición. Para escribir en español, la solución es `\p{L}`, una **propiedad Unicode** que significa «cualquier letra» y que solo funciona con el flag `u` o `v`:

[[exercise:03-w-no-conoce-la-n.md-]]

```text
CP → true | correo → true
🐛 /^[\w-]+$/ → (5) [true, false, false, false, false]
🐛 palabras → (8) ['El', 'a', 'o', 'pasado', 'vendimos', 'm', 's', 'caf']
🐛 /\bcafé\b/ → false
✅ /^[\p{L}-]+$/u → (5) [true, true, true, true, true]
✅ palabras → (6) ['El', 'año', 'pasado', 'vendimos', 'más', 'café']
🐛 /\p{L}/ sin u → false true
. con un emoji → false true
v: letra no ASCII → true false
🐛 con v → Invalid regular expression: /^[\p{L}-]+$/v: Invalid character class
✅ con v y \- → (5) [true, true, true, true, true]
```

El flag `u` (*unicode*) hace además que `.` y las clases trabajen por **code points**, como `for…of` en la lección «Strings»: sin él, un emoji son dos «caracteres». El flag `v` (*unicode sets*, de 2023) es su sucesor: todo lo de `u`, más operaciones de conjuntos dentro de los corchetes (`--` para restar, `&&` para la intersección) y propiedades de secuencias como `\p{RGI_Emoji}`. A cambio es más estricto: dentro de `[ ]` hay que escapar `( ) [ ] { } / - \ |`.

Es el modo con el que el navegador compila el atributo `pattern`, y por eso el `[a-z0-9_-]` de la lección «Validación nativa» dejó de funcionar: allí el navegador ignoraba el patrón en silencio; en JavaScript ves el `SyntaxError`. `u` y `v` no se pueden combinar: para código nuevo, elige `v`.

> **Desde Python:** en Python 3, `\w`, `\d` y `\b` son Unicode por defecto: `re.fullmatch(r'\w+', 'Begoña')` encaja. En JavaScript son ASCII siempre, también con `u`, así que el hábito de Python falla sin avisar. `\p{L}` no existe en el `re` de Python (sí en el módulo externo `regex`).

## Cuantificadores: codiciosos y perezosos

`*` (cero o más), `+` (una o más), `?` (cero o una), `{5}`, `{2,4}` y `{2,}` repiten lo que tienen **justo delante**: un carácter, una clase o un grupo. Por defecto son **codiciosos**: se quedan con todo lo que pueden y, si lo que viene detrás no encaja, devuelven caracteres de uno en uno (*backtracking*, «dar marcha atrás») hasta que encaja. Con `<.+>` sobre un párrafo, `.+` llega al final de la línea y retrocede solo hasta el **último** `>`:

[[exercise:04-codicioso-y-perezoso.md-]]

```text
{5} → true | u? → true true
🐛 <.+> → <p>Envío <b>gratis</b> desde <b>$500</b></p>
🐛 <b>.+<\/b> → ['<b>gratis</b> desde <b>$500</b>']
✅ <.+?> → (6) ['<p>', '<b>', '</b>', '<b>', '</b>', '</p>']
✅ <b>.+?<\/b> → (2) ['<b>gratis</b>', '<b>$500</b>']
✅ <[^>]+> → (6) ['<p>', '<b>', '</b>', '<b>', '</b>', '</p>']
✅ en negrita → (2) ['<b>gratis</b>', '<b>$500</b>']
```

Un `?` detrás del cuantificador lo vuelve **perezoso** (`+?`, `*?`, `{2,5}?`): toma lo mínimo y crece solo si hace falta. A menudo es aún mejor una **clase negada**, `<[^>]+>`, que dice exactamente lo que quieres («todo lo que no sea `>`») y no tiene que retroceder. Y para analizar HTML de verdad no uses regex: el navegador trae su propio analizador, el DOM, que verás en el capítulo 6.

## Anclas: el valor entero

`^` encaja con el principio del texto y `$` con el final. No consumen caracteres: marcan **posiciones**. Sin ellas, `test` responde a «¿aparece el patrón en algún sitio?», y un control de «solo cifras» acepta `'12345abc'`:

[[exercise:05-sin-anclas-acepta-un-trozo.md-]]

```text
🐛 /\d+/ → (5) [true, true, true, true, false]
✅ /^\d+$/ → (5) [true, false, false, false, false]
sin m → null
con m → (2) ['CAF-500', 'CAC-250']
🐛 /^\d{5}$/m → true
✅ /^\d{5}$/ → false
```

Con el flag `m` (*multiline*), `^` y `$` encajan también al principio y al final de cada línea. Es útil para recorrer un texto línea a línea, pero en un validador abre una puerta: basta con que una de las líneas sea buena.

> **Desde Python:** para validar usas `re.fullmatch`. JavaScript no lo tiene: escribe tú `^…$` (y `^(?:…)$` si hay una alternancia, como verás ahora). El atributo `pattern` de HTML lo hace por ti.

## Alternancia y grupos

`|` separa alternativas: `/MXN|USD/` encaja con cualquiera de las dos. Pero tiene la **prioridad más baja** de todos los operadores, así que parte la regex entera, anclas incluidas. `/^MXN|USD$/` no significa «MXN o USD, y nada más», sino «empieza por MXN» o «termina en USD»:

[[exercise:06-alternancia-sin-grupo.md-]]

```text
MXN       🐛 true · ✅ true
USD       🐛 true · ✅ true
MXN-viejo 🐛 true · ✅ false
AUSD      🐛 true · ✅ false
EUR       🐛 false · ✅ false
foto.jpg        🐛 true · ✅ true
logo.PNG        🐛 true · ✅ true
factura.jpg.exe 🐛 true · ✅ false
diseño-png      🐛 true · ✅ false
plano.svg       🐛 false · ✅ false
```

Los paréntesis limitan el alcance de `|` y de los cuantificadores. Hay tres clases de grupo:

- `( … )` **captura**: lo que encaja dentro queda en `match[1]`, `match[2]`…, numerados por el orden de sus paréntesis de apertura.
- `(?<nombre> … )` captura **con nombre**: además queda en `match.groups.nombre`. Es más legible y no se descoloca si añades otro grupo delante.
- `(?: … )` agrupa **sin capturar**: solo sirve para aplicar `|` o un cuantificador a un trozo.

Dentro de la misma regex, `\1` o `\k<nombre>` repiten lo que capturó un grupo: `/(\p{L})\1/u` encuentra letras dobles, como la «rr» de «arroz». Y desde 2024 (en Chrome, desde la versión 125) un grupo puede cambiar los flags `i`, `m` o `s` solo para su trozo: `/(?i:mole) poblano/` acepta «MOLE poblano» pero no «mole POBLANO».

## Reemplazar y dividir

`replace` acepta una regex como primer argumento: sin `g` cambia la primera coincidencia; con `g`, todas. En el texto de reemplazo, `$1`, `$2`… insertan los grupos, `$<nombre>` los grupos con nombre y `$&` la coincidencia entera. Si en lugar de texto pasas una **función**, se llama con cada coincidencia (y sus grupos detrás), y lo que devuelve la sustituye. `split` también acepta una regex, como el `/\s+/` que copiaste en la lección «Strings»:

[[exercise:07-grupos-reemplazos-y-split.md-]]

```text
grupos → 2026 10 14 | todo → 2026-10-14
groups → 2026 10 14
teléfono → (3) ['55', '1234', '5678']
$<…> → 14/10/2026
$1 → Tel. 55 1234 5678
$& → Envío «gratis» desde $500
×2 → Harina 1000g, azúcar 500g y mantequilla 250g
split → (4) ['harina', 'azúcar', 'huevos', 'leche']
con grupo → (5) ['12', '+', '3', '*', '4']
```

`match.groups` es un objeto sin prototipo (la consola lo marca como `[Object: null prototype]`, como el de `Object.groupBy`); por eso el ejemplo lo desestructura en lugar de imprimirlo.

Un detalle de los textos de reemplazo: `$` es especial **también** cuando el primer argumento es un string. `'Total: X'.replace('X', 'US$&')` no escribe «US$&», sino «USX», y `$$` escribe un solo `$`. Si el texto de reemplazo viene de datos (un precio, un nombre), pásalo con una función, que no interpreta nada: `texto.replace('X', () => price)`.

> **Desde Python:** `re.sub(r'(\d+)g', r'\1 g', s)` es `s.replace(/(\d+)g/g, '$1 g')`: en el reemplazo, `\1` y `\g<nombre>` se escriben `$1` y `$<nombre>`. Sin `g`, JavaScript cambia solo la primera (como `re.sub(…, count=1)`). La función de reemplazo no recibe un objeto *match*, sino strings sueltos: `(match, grupo1, grupo2…)`. Y en la regex, `(?P<nombre>…)` se escribe `(?<nombre>…)` y `(?P=nombre)`, `\k<nombre>`.

## Mirar sin avanzar: lookahead y lookbehind

Los **lookarounds** comprueban lo que hay delante o detrás de una posición **sin consumirlo**: lo que miran no entra en la coincidencia. Son cuatro: `(?=…)` (detrás viene…), `(?!…)` (detrás no viene…), `(?<=…)` (antes hay…) y `(?<!…)` (antes no hay…).

[[exercise:08-lookahead-y-lookbehind.md-]]

```text
(?<=\$) → (2) ['210.00', '50']
una regex → false true
falta → (2) ['una cifra', 'una mayúscula']
miles → (3) ['1,234,567', '1,000', '999']
palabra «café» → true false
```

La contraseña muestra una técnica y un consejo. La técnica: varios `(?=.*X)` seguidos desde `^` comprueban condiciones independientes sobre el mismo texto, porque ninguno avanza. El consejo: una sola regex solo dice «sí» o «no», y el usuario necesita saber **qué** le falta; una regex por regla da los mensajes que escribirás en el módulo «Formularios con JavaScript». La última línea arregla, con dos lookarounds, la frontera de palabra que `\b` no sabía trazar en español.

## Los flags

| Flag | Nombre | Qué cambia |
|------|--------|------------|
| `g` | *global* | `match` devuelve todas y `replace` las cambia todas; `matchAll` y `replaceAll` lo exigen; `test` y `exec` recuerdan `lastIndex` |
| `i` | *ignoreCase* | no distingue mayúsculas: `/café/i` encaja con «CAFÉ» |
| `m` | *multiline* | `^` y `$` encajan al principio y al final de cada línea |
| `s` | *dotAll* | `.` encaja también con el salto de línea |
| `u` | *unicode* | trabaja por code points, admite `\p{…}` y rechaza escapes sin sentido |
| `v` | *unicodeSets* | todo lo de `u`, más operaciones de conjuntos; más estricto dentro de `[ ]` |
| `y` | *sticky* | solo encaja exactamente en `lastIndex`: para analizar un texto pieza a pieza |
| `d` | *hasIndices* | añade `match.indices`, con dónde empieza y acaba cada grupo |

Los dos últimos son de uso especializado:

```js
const sticky = /\d+/y;
sticky.lastIndex = 3;
console.log(sticky.exec('ab 12 34')[0], sticky.lastIndex); // 12 5: encaja justo en la posición 3
const withIndices = /(?<price>\d+)/d.exec('Total: 250 MXN');
console.log(withIndices.indices.groups.price);              // [7, 10]: dónde empieza y acaba el grupo
```

## El flag g tiene memoria

Una regex con `g` (o con `y`) guarda en `lastIndex` la posición donde terminó la última coincidencia, y `test` y `exec` empiezan a buscar **desde ahí**. Es lo que permite recorrer todas las coincidencias con `exec` en un bucle, pero convierte una regex guardada en una constante en una trampa: el mismo `test` sobre el mismo texto alterna `true` y `false`. Y al revés: `replaceAll` y `matchAll` lanzan `TypeError` si la regex **no** tiene `g`, para que nadie crea que se cambian todas cuando no es así.

[[exercise:09-el-flag-g-tiene-memoria.md-]]

```text
🐛 1.º → true | lastIndex → 4
🐛 2.º → false | lastIndex → 0
🐛 3.º → true | lastIndex → 4
🐛 filter → (2) ['Café de Chiapas', 'Café de Veracruz']
✅ filter → (3) ['Café de Chiapas', 'Café de olla', 'Café de Veracruz']
🐛 TypeError | String.prototype.replaceAll called with a non-global RegExp argument
🐛 TypeError | String.prototype.matchAll called with a non-global RegExp argument
✅ replaceAll → café · cacao · vainilla
✅ matchAll → (3) ['café', 'cacao', 'vainilla']
```

La regla: `g` solo cuando quieres **todas** las coincidencias (`match`, `matchAll`, `replace`, `replaceAll`); para `test`, y en especial para validar, sin `g`.

## Cuando una regex congela la página

El motor de regex de JavaScript, como el de Python, prueba un camino y, si falla, retrocede y prueba el siguiente. Casi siempre son pocos caminos. Pero cuando dos cuantificadores anidados pueden repartirse los mismos caracteres, como en `/^(a+)+$/`, el número de repartos posibles crece exponencialmente, y con un texto que **casi** encaja («aaaa…b») el motor los prueba todos antes de rendirse: cada carácter más duplica el tiempo. Se llama **backtracking catastrófico**. En un servidor es un ataque conocido (ReDoS: basta con enviar un texto preparado); en la página, congela la pestaña entera. Mientras `test` trabaja no se pinta nada ni responde ningún botón, y la guarda de bucles de LearnWeb no lo detiene, porque no hay bucle: es una sola llamada.

[[exercise:10-backtracking-catastrofico.md-]]

```text
válidas → true true
🐛 14 letras + «!» → false · 0.3 ms
🐛 18 letras + «!» → false · 3.9 ms
🐛 20 letras + «!» → false · 12.9 ms
🐛 22 letras + «!» → false · 38.9 ms
¿22 letras tardan más de 20 veces lo que 14? → true
✅ 104001 caracteres → false | menos de 5 ms → true
```

Los milisegundos dependen del ordenador; lo que se repite es que se multiplican por tres o cuatro cada dos letras. Para evitarlo: no anides cuantificadores sobre lo mismo (`(a+)+`, `(\w+\s?)+`, `(.*,)*`); escribe cada regla de forma que solo haya una manera de encajar (`palabra(?: palabra)*`); limita la longitud de lo que validas (`maxlength` en el campo, o comprueba `length` antes); y prueba tus regex con textos que **casi** encajan, no solo con los buenos.

## Desde Python, de un vistazo

| Python (`re`) | JavaScript |
|---------------|------------|
| `re.search(r'\d+', s)` | `/\d+/.test(s)` o `s.match(/\d+/)` |
| `re.fullmatch(r'\d+', s)` | `/^\d+$/.test(s)`; con alternancia, `/^(?:a\|b)$/` |
| `re.findall(r'\d+', s)` | `s.match(/\d+/g) ?? []` |
| `re.finditer(r'\d+', s)` | `[...s.matchAll(/\d+/g)]` |
| `re.sub(r'(\d+)', r'<\1>', s)` | `s.replace(/(\d+)/g, '<$1>')` |
| `re.split(r'\s*,\s*', s)` | `s.split(/\s*,\s*/)` |
| `re.escape(s)` | `RegExp.escape(s)` |
| `r'\d'` (cadena cruda) | `/\d/` literal, o `String.raw` con `new RegExp` |
| `(?P<year>…)`, `m['year']`, `(?P=year)` | `(?<year>…)`, `m.groups.year`, `\k<year>` |
| `re.IGNORECASE`, `re.MULTILINE`, `re.DOTALL` | flags `i`, `m`, `s` |
| `\w` y `\b` Unicode por defecto | ASCII: usa `\p{L}` con `u` o `v` |
| `re.VERBOSE` (espacios y comentarios) | no existe: compón la regex por trozos |

Sin `re.VERBOSE`, una regex larga se vuelve ilegible. La alternativa es construirla con trozos con nombre, usando el `source` de regex más pequeñas (así no hay que doblar ninguna barra):

```js
const year = /(?<year>\d{4})/.source;
const month = /(?<month>0[1-9]|1[0-2])/.source;
const day = /(?<day>0[1-9]|[12]\d|3[01])/.source;
const isoDate = new RegExp(`^${year}-${month}-${day}$`);
console.log(isoDate.test('2026-10-14'), isoDate.test('2026-13-01')); // true false
```

## Bestiario

- **`new RegExp` no encuentra lo que la literal sí.**
  Síntoma: `new RegExp('CAF-\d{3}')` no encaja con «CAF-500»; su `source` es `CAF-d{3}`.
  Causa: el string procesa los escapes antes que la regex, y `'\d'` se queda en `'d'`.
  Solución: dobla las barras (`'\\d'`) o usa una literal; para texto del usuario, `RegExp.escape`.
  → [ver ejemplo](02-barras-dobles-en-new-regexp.md)
- **«Begoña» no es un nombre válido.**
  Síntoma: `\w`, `[a-zA-Z]` o `\b` fallan con tildes, ñ y diéresis; «año» se parte en «a» y «o».
  Causa: `\w` y `\b` son solo ASCII, también con el flag `u`.
  Solución: `\p{L}` con el flag `u` o `v` (sin flag, `\p{L}` significa «p{L}»); para fronteras, `(?<!\p{L})` y `(?!\p{L})`.
  → [ver ejemplo](03-w-no-conoce-la-n.md)
- **Con el flag `v`, la regex de siempre lanza `SyntaxError`.**
  Síntoma: `Invalid character class` o `Invalid character in character class` con `[\p{L}-]` o `[a-z0-9_-]`; en un `pattern` de HTML, el patrón se ignora.
  Causa: el modo `v` exige escapar el guion y otros signos dentro de `[ ]`.
  Solución: escribe `\-` (y `\(`, `\[`, `\{`, `\/`, `\|`) dentro de los corchetes.
  → [ver ejemplo](03-w-no-conoce-la-n.md)
- **`<.+>` se come el párrafo entero.**
  Síntoma: la coincidencia va de la primera etiqueta a la última.
  Causa: los cuantificadores son codiciosos y ceden solo lo justo.
  Solución: `+?` (perezoso) o, mejor, una clase negada como `<[^>]+>`.
  → [ver ejemplo](04-codicioso-y-perezoso.md)
- **«12345abc» pasa el control de «solo cifras».**
  Síntoma: `/\d+/.test(valor)` acepta valores con basura delante o detrás.
  Causa: sin anclas, basta con que el patrón aparezca en algún sitio; con el flag `m`, basta con una línea.
  Solución: `^…$` y nunca `m` en un validador.
  → [ver ejemplo](05-sin-anclas-acepta-un-trozo.md)
- **`/^MXN|USD$/` acepta «MXN-viejo».**
  Síntoma: una lista de opciones ancladas acepta valores que empiezan o acaban por una de ellas.
  Causa: `|` tiene la prioridad más baja y deja cada ancla en una mitad.
  Solución: `^(?:MXN|USD)$`.
  → [ver ejemplo](06-alternancia-sin-grupo.md)
- **El mismo `test` da `true` y luego `false`.**
  Síntoma: un filtro con una regex guardada pierde elementos; el resultado alterna.
  Causa: con `g`, `test` empieza en `lastIndex` y lo actualiza.
  Solución: quita `g` cuando solo preguntas si aparece.
  → [ver ejemplo](09-el-flag-g-tiene-memoria.md)
- **`replaceAll` lanza `TypeError`.**
  Síntoma: `String.prototype.replaceAll called with a non-global RegExp argument` (y lo mismo con `matchAll`).
  Causa: esos métodos exigen una regex con `g`.
  Solución: añade `g`.
  → [ver ejemplo](09-el-flag-g-tiene-memoria.md)
- **La página se congela al validar.**
  Síntoma: un campo con cierto texto bloquea la pestaña segundos o minutos.
  Causa: cuantificadores anidados (`(a+)+`) y un texto que casi encaja: backtracking exponencial.
  Solución: reglas sin ambigüedad (`palabra(?: palabra)*`), límite de longitud y pruebas con textos casi válidos.
  → [ver ejemplo](10-backtracking-catastrofico.md)

## Resumen

- Una regex literal es `/patrón/flags`; `new RegExp(texto, flags)` la construye desde un string (con las barras dobladas) y `RegExp.escape` protege el texto del usuario.
- `test` pregunta, `match` sin `g` da la primera con detalles, con `g` todas (o `null`), `matchAll` todas con detalles.
- `\w` y `\b` son ASCII: para letras de cualquier idioma, `\p{L}` con `u` o, mejor, `v` (que exige escapar el guion dentro de `[ ]`).
- Los cuantificadores son codiciosos; `?` los hace perezosos, y una clase negada suele ser lo más claro.
- Para validar, `^…$` sin `m`; con alternancias, `^(?:a|b)$`.
- Grupos: `( )` captura, `(?<nombre>…)` con nombre, `(?:…)` sin capturar; en `replace`, `$1`, `$<nombre>`, `$&` o una función.
- Los lookarounds miran sin consumir: reglas de contraseña, importes, fronteras de palabra.
- `g` guarda `lastIndex`: nunca en `test`; `replaceAll` y `matchAll` lo exigen.
- Evita los cuantificadores anidados: una regex ambigua puede congelar la página.

## Para profundizar

- [MDN: Expresiones regulares (guía)](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Regular_expressions)
- [javascript.info: Expresiones regulares](https://es.javascript.info/regular-expressions)
- [V8: el flag `v` y las operaciones de conjuntos (en inglés)](https://v8.dev/features/regexp-v-flag)
- [MDN: RegExp.escape() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape)
- [Documentación de Python: el módulo `re`](https://docs.python.org/es/3/library/re.html)
