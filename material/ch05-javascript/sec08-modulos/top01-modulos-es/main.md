# Módulos ES

## Por qué importa

Hasta ahora, cada ejemplo del curso era un solo script. Una aplicación real tiene cientos de archivos: el carrito, los precios, la API, la interfaz… Sin módulos, todos los scripts de una página comparten el ámbito global: un `var` o una `function` de nivel superior acaba en `window` (lección «Variables»), dos archivos que usan el mismo nombre se pisan, y el orden de las etiquetas `<script>` decide qué existe cuándo. En la lección «Patrones de diseño» viste el apaño clásico: una IIFE que guarda lo privado en un closure y devuelve solo la API.

Los **módulos ES** (ECMAScript 2015, en todos los navegadores desde 2018) resuelven el problema en el propio lenguaje: **cada archivo es un módulo**, con su propio ámbito; dice qué **exporta** y qué **importa** de otros, y el navegador carga el grafo de dependencias entero antes de ejecutar nada. Si conoces los módulos de Python, la idea es la misma; las diferencias están en los detalles, y casi todas las sorpresas de esta lección salen de ahí: los imports son **enlaces vivos**, cada módulo se evalúa **una vez**, siempre en **modo estricto**, y los scripts de módulo son **diferidos**.

## Cómo funcionan los ejemplos de este módulo

Por primera vez en el curso, los ejemplos tienen varios archivos. El bloque de JavaScript de cada ejemplo es el script principal; los demás módulos son archivos `.js` de la carpeta `assets/` del tema, que puedes leer con el botón **«Assets»** de la cabecera de la galería. El script los importa con rutas relativas que empiezan por `./`, y esas rutas se resuelven dentro de `assets/`:

```js
import { formatPrice } from './01-precios/money.js'; // → assets/01-precios/money.js
```

Cada ejemplo dice en su primer comentario qué archivos usa, y esta página copia los más importantes junto a su ejemplo. En cuanto un script tiene `import` o `export`, LearnWeb lo carga como `<script type="module">`, igual que hizo con el *top-level await* en la lección «async/await».

## Exportar e importar con nombre

Un módulo decide qué sale de él escribiendo `export` delante de una declaración. Todo lo demás es privado del archivo: sin IIFE, sin closures, sin convenciones. Este es el módulo de dinero de la tienda:

```js
// assets/01-precios/money.js
const VAT_RATE = 0.16; // privado: no se exporta
const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function roundCents(value) { // privada
  return Math.round(value);
}

export const CURRENCY = 'MXN';
export function addVat(cents) { return roundCents(cents * (1 + VAT_RATE)); }
export function formatPrice(cents) { return formatter.format(cents / 100); }
```

Quien lo usa pide, entre llaves, las exportaciones que necesita, con su nombre exacto:

[[exercise:01-export-e-import-con-nombre.md-]]

```text
moneda → MXN
sin IVA → $210.00
con IVA → $243.60
typeof VAT_RATE → undefined
typeof roundCents → undefined
```

Se puede exportar cualquier declaración (`export const`, `export let`, `export function`, `export class`) o, al final del archivo, una lista: `export { addVat, formatPrice };`. Las dos formas son equivalentes; la lista al final tiene la ventaja de que la API del módulo se lee de un vistazo.

Fíjate en el comentario del final del ejemplo: pedir algo que el módulo no exporta no da `undefined`, sino un `SyntaxError` **antes de ejecutar ninguna línea**. Los `import` y `export` son **estáticos**: solo pueden ir en el nivel superior del archivo (nunca dentro de un `if` o de una función), y sus rutas son textos fijos. Gracias a eso, el navegador conoce el grafo de dependencias completo y comprueba que cada nombre importado existe antes de empezar.

> **Desde Python:** `from money import format_price` es `import { formatPrice } from './money.js'`. Pero en Python lo privado es una convención (`_round_cents` se puede importar igual) y `__all__` solo afecta a `from money import *`. En JavaScript, `export` es la única puerta: lo que no se exporta es inalcanzable desde fuera.

## La exportación por defecto

Además de las exportaciones con nombre, un módulo puede tener **una** exportación por defecto, con `export default`. Se importa **sin llaves** y con el nombre que elija quien importa. Es habitual en archivos que giran en torno a una sola cosa, como una clase:

```js
// assets/02-carrito/cart.js
export const MAX_ITEMS = 20;
export default class Cart { /* add(), count, totalCents */ }
```

[[exercise:02-export-default.md-]]

```text
productos → 3 | total en centavos → 96900
¿la misma clase con dos nombres? → true
su nombre de verdad → Cart
límite → 20
⛔ Máximo 20 productos por pedido
```

`export default` no es magia: exporta el valor con el nombre especial `default`, y `import Cart from …` es una forma corta de `import { default as Cart } from …`. Detrás de `export default` puede ir cualquier expresión (`export default 42`, `export default { … }`), no solo una declaración.

La libertad de nombre tiene un coste: el mismo módulo puede llamarse `Cart` en un archivo y `ShoppingCart` en otro, y buscar «Cart» en el proyecto no encuentra todos sus usos. Por eso muchas guías de estilo prefieren usar solo exportaciones con nombre; al final de la lección verás otra razón.

## Renombrar e importar el módulo entero

Las dos puntas de un import pueden renombrar con `as`: el módulo exporta `export { pickup as inStore }` y quien importa escribe `import { standard as standardShipping }`. Sirve para evitar choques de nombres entre dos módulos o para dar un nombre más claro en el contexto de quien importa.

Y con `import * as nombre` se importa el módulo **entero**: un objeto, el **espacio de nombres** del módulo (*module namespace object*), con una propiedad por exportación. Sus claves están ordenadas alfabéticamente, incluye `default` si existe y es de solo lectura:

[[exercise:03-renombrar-y-espacio-de-nombres.md-]]

```text
estándar para $845.00 → 14900
estándar para $1,200.00 → 0
recoger en tienda → 0
claves del módulo → (4) ['default', 'express', 'inStore', 'standard']
shipping.express() → 30900
¿default es standard? → true
etiqueta → Module
⛔ TypeError | Cannot assign to property 'express' of [object Module]
```

`import * as` no carga «más» que importar con nombre: el módulo se evalúa entero en los dos casos. Elige la forma que se lea mejor: `shipping.express()` deja claro de dónde viene cada función cuando un archivo usa muchas de un mismo módulo.

## Un ámbito por módulo, siempre en modo estricto

Cada módulo tiene su propio ámbito de nivel superior. Lo que declara ahí (con `var`, `let`, `const`, `function` o `class`) es de ese archivo: no se convierte en propiedad de `window` y no choca con lo que declaren otros módulos. Además, el código de un módulo está **siempre en modo estricto** (sin escribir `'use strict'`) y, en su nivel superior, `this` vale `undefined`:

[[exercise:04-ambito-de-modulo.md-]]

```text
Tienda: 1 visita(s)
Tienda: 2 visita(s)
Blog: 1 visita(s)
¿cartId en window? → false
¿greet en window? → false
¿visits en window? → false
this → undefined
⛔ ReferenceError | totl is not defined
total → 0
```

En un script clásico, la errata `totl = 100` habría creado en silencio una variable global nueva; en un módulo, es un `ReferenceError`. El modo estricto trae también lo que viste en la lección «La palabra clave this»: una función llamada sin objeto recibe `this === undefined`, no `window`.

### Un `onclick` no ve las funciones del módulo

Este cambio rompe un patrón que aparecía en los capítulos de HTML: `onclick="addToCart()"` en el HTML. El código de un atributo `on…` se ejecuta en el ámbito **global**, y las funciones de un módulo ya no son globales. El error no aparece al cargar la página, sino al pulsar el botón:

[[exercise:05-onclick-no-ve-el-modulo.md-]]

```text
typeof addToCart, dentro del módulo → function
typeof window.addToCart → undefined
Uncaught ReferenceError: addToCart is not defined
✅ estado → 1 × Café de Chiapas · $210.00
```

La solución es conectar los eventos **desde el módulo**, con `addEventListener` (capítulo 6), que recibe la función misma y no un texto que hay que buscar en el ámbito global. Con módulos, el HTML no nombra funciones de JavaScript.

## `type="module"`: un script diferido

En la lección «El parser de HTML» viste que un `<script>` normal detiene el parser y que `defer` lo deja para cuando el HTML está leído. Un `<script type="module">` se comporta **siempre** como `defer`: se descarga en paralelo (junto con todo su grafo de dependencias) y se ejecuta cuando el parser termina, en orden de aparición y antes de `DOMContentLoaded`. Y, a diferencia de `defer`, esto vale también para los módulos **inline**, sin `src`:

[[exercise:06-los-modulos-son-diferidos.md-]]

```text
1. clásico inline con defer del <head> → #total: null
2. clásico al final del <body> → #total: $487.20
3. módulo inline del <head> → #total: $487.20
4. DOMContentLoaded: llega después de los módulos
```

El orden de la consola no es el del código: el módulo está escrito primero y se ejecuta el tercero. Y el `defer` del script inline no sirvió de nada: el atributo solo funciona con `src`. Un módulo en el `<head>` puede usar el DOM sin esperar a ningún evento; si necesitas que un módulo se ejecute en cuanto esté listo, sin esperar al parser, existe `<script type="module" async>`.

Una nota práctica: los módulos se piden con las reglas de CORS (capítulo 6), y abrir un `.html` con doble clic (una dirección `file://`) hace que fallen. Hay que servir la página por HTTP, como hace LearnWeb con cada ejemplo.

## Cada módulo se evalúa una sola vez

Cuando un módulo se importa por primera vez, el navegador lo descarga, lo **evalúa** (ejecuta su código de nivel superior) y lo guarda en el **mapa de módulos** de la página, con su URL como clave. Las siguientes veces que alguien lo importe, desde el mismo archivo o desde otro, recibe el módulo que ya existe, **sin volver a ejecutarlo**. Por eso dos módulos que importan el mismo `store.js` comparten su estado:

```text
            este script
            ┌────┴──────┐
        header.js  product-page.js
            └────┬──────┘
              store.js          ← evaluado una vez, compartido
```

[[exercise:07-se-evalua-una-vez.md-]]

```text
  (evaluando store.js)
  (evaluando store.js?copia)
1. primera línea del script
cabecera → 🛒 0
cabecera tras comprar en la ficha → 🛒 2
store.items → (2) ['Café de Chiapas 500 g', 'Molinillo manual']
¿storeCopy es el mismo módulo? → false | sus productos → 0
```

Fíjate en el orden: los mensajes de `store.js` salen **antes** que la primera línea del script. Los `import` no se ejecutan donde están escritos; el navegador carga y evalúa todas las dependencias primero (la lección «Organizar el código» detalla el orden exacto). Y la clave del mapa es la **URL** completa: `./store.js` y `./store.js?copia` son dos módulos distintos, cada uno con su estado. Dos rutas que llevan a la misma URL (`./a/../store.js`) dan el mismo módulo.

> **Desde Python:** `sys.modules` es el mapa de módulos de Python, y por la misma razón un módulo de Python también se ejecuta una sola vez. La diferencia es la clave: Python usa el nombre del módulo (`"store"`); el navegador, la URL.

## Enlaces vivos

Un import no es una variable con una **copia** del valor exportado: es un **enlace vivo** (*live binding*), una ventana a la variable del módulo que la exporta. Si ese módulo reasigna su `let`, todos los que la importaron ven el valor nuevo. Lo que no se actualiza es lo que **tú** copiaste: una `const`, o un valor que otro módulo calculó en su nivel superior (que se ejecuta una sola vez):

```js
// assets/08-vivas/settings.js
export let currency = 'MXN';
export function setCurrency(code) { currency = code; }
```

[[exercise:08-enlaces-vivos.md-]]

```text
currency (el import) → USD
copy (una const local) → MXN
🐛 staleLabel() → Precios en MXN
✅ liveLabel() → Precios en USD
```

`staleLabel()` es el bug real: `price-tag.js` construyó su etiqueta al evaluarse, con la moneda de ese momento. Si un valor exportado puede cambiar, léelo cuando lo necesites (dentro de una función), no al cargar el módulo.

> **Desde Python:** es justo al revés. `from settings import currency` **copia** la referencia en el momento del import, y seguiría valiendo `'MXN'`; solo `import settings` y `settings.currency` ven el cambio. En JavaScript, las dos formas de importar son vivas.

### Un import no se puede reasignar

La otra cara del enlace vivo: solo el módulo que declara la variable puede reasignarla. Para quien importa, un import es como una `const`, aunque en el otro archivo sea un `let`, y asignarle algo lanza un `TypeError`. Si un módulo quiere permitir cambios, exporta una función que los haga:

[[exercise:09-no-se-puede-asignar-un-import.md-]]

```text
🐛 currency = …  → TypeError | Assignment to constant variable.
🐛 settings.currency = …  → TypeError | Cannot assign to property 'currency' of [object Module]
✅ setCurrency('EUR') → currency: EUR
```

Ojo con lo que esto protege: la **variable**, no su contenido. Si un módulo exporta un objeto o un array, cualquier importador puede cambiar sus propiedades, y todos los demás lo verán (lo verás en la lección «Organizar el código»).

## `export default` de un objeto no son nombres

Un error frecuente al pasar de otros sistemas de módulos: exportar por defecto un objeto con funciones (`export default { formatPrice, formatWeight }`) y luego importarlas entre llaves. Las llaves de `import` **no son desestructuración**: piden exportaciones con ese nombre, y el módulo solo tiene una, `default`. El error salta al **enlazar** los módulos, antes de ejecutar ninguna línea:

[[exercise:10-default-de-un-objeto.md-]]

```text
format.formatPrice(21000) → $210.00
desestructurando después → 0.5 kg
🐛 checkout.js → SyntaxError | The requested module './format.js' does not provide an export named 'formatPrice'
✅ formatPrice(21000) → $210.00 | formatWeight(500) → 0.5 kg
```

Hay una segunda razón para preferir las exportaciones con nombre. Un **empaquetador** (*bundler*, lección «Rutas, import maps y herramientas») analiza los `import` estáticos para saber qué exportaciones usa la aplicación y descarta las demás del archivo final (*tree-shaking*). Con un objeto por defecto no puede: lo que se importa es el objeto entero, con todas sus funciones.

TypeScript (capítulo 7) usa exactamente esta misma sintaxis de `import` y `export`; lo que aprendes aquí vale tal cual.

## De Python a JavaScript

| Python | JavaScript |
|--------|------------|
| cada `.py` es un módulo | cada archivo cargado como módulo (`type="module"` o `import`) |
| `import money` + `money.format_price()` | `import * as money from './money.js'` |
| `from money import format_price` | `import { formatPrice } from './money.js'` |
| `from money import format_price as fp` | `import { formatPrice as fp } from './money.js'` |
| todo es importable; `_privado` es convención | solo lo exportado; lo demás es inalcanzable |
| `__all__` (solo afecta a `import *`) | `export` (la única puerta) |
| no hay exportación por defecto | `export default` + `import Cualquiera from …` |
| `sys.modules`, clave: el nombre | el mapa de módulos, clave: la URL |
| `from x import y` copia la referencia | los imports son enlaces vivos |
| el módulo se puede modificar desde fuera | el espacio de nombres es de solo lectura |
| `import` es una instrucción que se ejecuta donde está | los `import` estáticos se cargan antes de ejecutar nada |

## Bestiario

- **El `onclick` que no encuentra la función.**
  Síntoma: al pulsar un botón, `Uncaught ReferenceError: addToCart is not defined`, aunque la función existe en el script.
  Causa: el script es un módulo; sus funciones no son globales, y el código de los atributos `on…` se busca en el ámbito global.
  Solución: conecta el evento desde el módulo con `addEventListener` (capítulo 6); no uses atributos `on…` con módulos.
  → [ver ejemplo](05-onclick-no-ve-el-modulo.md)
- **El script del `<head>` que no ve el HTML.**
  Síntoma: un script inline con `defer` en el `<head>` recibe `null` al buscar un elemento; el orden de los mensajes no coincide con el del código.
  Causa: `defer` solo afecta a scripts con `src`; los módulos, en cambio, siempre son diferidos, también los inline.
  Solución: `type="module"` (o un archivo externo con `defer`) para el código que usa el DOM; no cuentes con el orden de escritura entre scripts clásicos y módulos.
  → [ver ejemplo](06-los-modulos-son-diferidos.md)
- **El valor que no se actualiza.**
  Síntoma: después de cambiar un ajuste exportado, una parte del programa sigue usando el valor viejo.
  Causa: esa parte copió el valor (en una `const` o al evaluar su módulo); el import era vivo, la copia no.
  Solución: lee el import en el momento de usarlo, dentro de funciones; no guardes copias de valores que pueden cambiar.
  → [ver ejemplo](08-enlaces-vivos.md)
- **La asignación imposible.**
  Síntoma: `TypeError: Assignment to constant variable.` al asignar a una variable importada, aunque en su módulo es un `let`.
  Causa: los imports son de solo lectura; solo el módulo que declara la variable puede reasignarla.
  Solución: el módulo dueño exporta una función que hace el cambio (`setCurrency`).
  → [ver ejemplo](09-no-se-puede-asignar-un-import.md)
- **Las llaves que no desestructuran.**
  Síntoma: `SyntaxError: The requested module './format.js' does not provide an export named 'formatPrice'`, y no se ejecuta nada.
  Causa: el módulo exporta por defecto un objeto; las llaves de `import` piden exportaciones con nombre.
  Solución: exporta cada función con su nombre (`export function formatPrice…`), o importa el objeto y desestructúralo después.
  → [ver ejemplo](10-default-de-un-objeto.md)

## Resumen

- Cada archivo es un módulo con su propio ámbito: decide qué exporta y qué importa; lo que no exporta es privado.
- Exportaciones con nombre (`import { a, b }`), una por defecto (`import X`), renombres con `as` y el espacio de nombres (`import * as m`), de solo lectura.
- Los `import` y `export` son estáticos: en el nivel superior, con rutas fijas, comprobados antes de ejecutar nada.
- Los módulos están siempre en modo estricto, `this` vale `undefined` en su nivel superior y sus variables no van a `window`.
- `<script type="module">` es diferido como `defer`, también inline; se ejecuta antes de `DOMContentLoaded`.
- Un módulo se evalúa una vez por URL y todos sus importadores comparten su estado.
- Los imports son enlaces vivos y de solo lectura; para cambiar un valor, el módulo exporta una función.
- Prefiere las exportaciones con nombre a un objeto por defecto: se importan por separado y permiten el *tree-shaking*.

## Para profundizar

- [MDN: módulos de JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules)
- [javascript.info: módulos, introducción](https://es.javascript.info/modules-intro)
- [javascript.info: export e import](https://es.javascript.info/import-export)
- [V8: módulos de JavaScript (en inglés)](https://v8.dev/features/modules)
- [Python: el sistema de importación](https://docs.python.org/es/3/reference/import.html)
