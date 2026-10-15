# Import dinámico

## Por qué importa

Los `import` de la lección anterior son **estáticos**: van en el nivel superior del archivo, con rutas fijas, y el navegador los carga todos antes de ejecutar la primera línea. Es justo lo que hace falta para el núcleo de una aplicación, pero no para todo: el generador de PDF que usa una persona de cada cien, el catálogo de textos de un idioma que no es el tuyo, el editor de imágenes que solo se abre desde un menú. Cargarlos al principio hace la página más lenta para todos.

`import(ruta)` es la versión **dinámica**: una expresión que se puede escribir en cualquier sitio (dentro de un `if`, de una función, de un manejador de clic), con una ruta calculada, y que devuelve una **promesa** del módulo. Con ella se carga código **bajo demanda**, se eligen módulos según los datos y se manejan los fallos de carga con `try/catch`. Y, como el módulo no tiene por qué ser un archivo, también sirve para crear módulos a partir de texto, que es como este tema simula «varios archivos» dentro de un solo ejemplo.

## `import()`: una promesa del módulo

`import('./ruta.js')` pide el módulo en el momento en que se ejecuta esa línea. Mientras se descarga (con sus dependencias) y se evalúa, el programa sigue; cuando está listo, la promesa se cumple con su **espacio de nombres**, el mismo objeto que daría `import * as`. Y, a diferencia del `import` estático, funciona también en scripts clásicos:

[[exercise:01-import-devuelve-una-promesa.md-]]

```text
1. el script empieza: invoice.js ni se ha pedido
2. import() devuelve → Promise {<pending>}
3. el script sigue sin esperar a la descarga
  (evaluando invoice.js)
4. módulo listo; sus exportaciones → ['createInvoice']
5. Factura P-1042 · Mariana Gómez · $487.20
```

Aunque se escriba con paréntesis, `import()` no es una función: es una sintaxis especial (no puedes guardarla en una variable ni pasarla como callback), porque necesita saber desde qué archivo se llama para resolver las rutas relativas. Todo lo demás es lo que ya sabes de las promesas: se espera con `await` o con `then`, y un fallo se atrapa con `try/catch` o con `catch`.

> **Desde Python:** `importlib.import_module('invoice')` también importa un módulo elegido en tiempo de ejecución, pero es **síncrono**: el programa espera hasta que el módulo está cargado. En el navegador, la carga es una petición de red, y por eso `import()` es asíncrono, como `fetch`.

## Cargar bajo demanda

El uso principal de `import()` es no cargar lo que todavía no hace falta. El botón «Descargar factura en PDF» de este pedido importa el módulo de PDF la primera vez que alguien lo pulsa. La segunda vez, el módulo ya está en el mapa de módulos: la promesa se cumple enseguida y el módulo **no se vuelve a evaluar**, porque las reglas de la lección anterior valen igual para los módulos dinámicos:

[[exercise:02-cargar-al-pulsar.md]]

```text
al abrir la página, pdf-export.js no se ha pedido
clic 1
  (evaluando pdf-export.js: solo la primera vez)
  📄 factura-P-1042.pdf · 2 páginas
clic 2
  📄 factura-P-1042.pdf · 2 páginas
¿import() devuelve siempre el mismo módulo? → true
```

Ábrelo con ↗ y mira la pestaña «Red» de DevTools mientras pulsas el botón: `pdf-export.js` no aparece hasta el primer clic. A esto se le llama **división del código** (*code splitting*): en un proyecto con empaquetador, cada `import()` se convierte en un archivo aparte que solo se descarga cuando se ejecuta esa línea.

Otro uso habitual, en un módulo con *top-level await*: cargar algo solo si hace falta, como un *polyfill* (código que añade una función que el navegador no tiene): `if (!('groupBy' in Object)) await import('./polyfills/group-by.js');`.

### Olvidar el `await`

`import()` se parece tanto a una función que devuelve el módulo que es fácil olvidar que devuelve una **promesa**. Sin `await`, la variable guarda la promesa, sus propiedades son `undefined` y la primera llamada falla:

[[exercise:03-olvidar-el-await.md-]]

```text
🐛 tax → Promise {<pending>}
🐛 tax.vatFor → undefined
🐛 TypeError | tax.vatFor is not a function
✅ IVA en México → 0.16
✅ con then → IVA en Colombia: 0.19
```

### La exportación por defecto está en `default`

La otra trampa: `import()` entrega **siempre** el espacio de nombres, nunca la exportación por defecto directamente. Con el `import` estático, `import slugify from './slugify.js'` daba la función; con `import()`, la función está en la clave `default` del objeto:

[[exercise:04-la-clave-default.md-]]

```text
🐛 typeof slugify → object
🐛 sus claves → ['default']
🐛 TypeError | slugify is not a function
✅ cafe-de-olla-500-g
✅ mole-poblano-en-pasta
```

La forma idiomática es desestructurar renombrando: `const { default: slugify } = await import('./slugify.js')`. Con las exportaciones con nombre no hay trampa: `const { renderPdf } = await import(…)`.

## Rutas calculadas y errores de carga

La ruta de un `import` estático tiene que ser un texto fijo; la de `import()` puede ser cualquier expresión. La tienda guarda un catálogo de textos por idioma y carga solo el que necesita. Si el archivo no existe (un 404), la promesa se **rechaza** con un `TypeError`, y el `catch` decide qué hacer: aquí, usar el español.

[[exercise:05-ruta-calculada.md-]]

```text
es → es-MX · Tu carrito: 3 productos
en → en-US · Your cart: 3 items
  ⚠️ no hay catálogo «fr» (TypeError: Failed to fetch dynamically imported module); uso «es»
fr → es-MX · Tu carrito: 3 productos
```

Dos consejos. Valida siempre el valor que va dentro de la ruta contra una lista de valores permitidos: una ruta construida con datos de fuera (la URL, un formulario) podría cargar un módulo que no esperabas. Y mantén fija una parte de la ruta (`./05-idiomas/${lang}.js`): los empaquetadores la usan para saber qué archivos pueden llegar a pedirse.

Un detalle del error: el mensaje dice qué módulo se pidió, pero si el que falta es una de **sus** dependencias, la promesa se rechaza igual y el mensaje puede nombrar al módulo que pediste, no al que falta. La pestaña «Red» de DevTools muestra la petición que dio 404 (lección «Rutas, import maps y herramientas»).

## Varios «archivos» en un solo ejemplo

Un módulo no tiene por qué ser un archivo de un servidor: basta con una **URL** que devuelva código JavaScript. Un `Blob` (datos en memoria con un tipo) y `URL.createObjectURL` convierten un texto en una URL `blob:…`, e `import()` la carga como cualquier otra. Así funcionan los *playgrounds* como LearnWeb o CodePen: el código que escribes es un texto, y el navegador necesita una URL para cargarlo.

[[exercise:06-modulos-desde-blobs.md-]]

```text
¿es una URL de blob? → true
total → 96900
después de revocar → 54900
```

Fíjate en cómo el carrito importa los precios: con la URL **completa** del otro blob, interpolada en el texto. Una ruta relativa no funcionaría, porque las rutas relativas se resuelven contra la URL del módulo que importa, y una URL `blob:` no tiene carpetas:

[[exercise:07-blob-con-ruta-relativa.md-]]

```text
🐛 TypeError | ¿«Failed to resolve module specifier…»? → true
✅ ruta resuelta → empieza por http: true | termina en: 07-blobs/prices.js
✅ precio del café desde el blob → 21000
```

`import.meta.resolve(ruta)` hace la resolución que haría un `import` desde el archivo en el que se escribe y devuelve la URL completa, sin cargar nada. Es la herramienta para pasar rutas a un sitio que no sabe resolverlas: un blob, un *worker* (capítulo 8) o una función de otro módulo.

La alternativa sin Blob es una URL `data:`, que lleva el contenido dentro. Es práctica para módulos diminutos y muestra bien que la **URL** es la clave del mapa de módulos: el mismo texto da el mismo módulo, y un solo espacio de diferencia da otro.

[[exercise:08-modulos-data-url.md-]]

```text
URL → data:text/javascript,export%20const%20FREE…
rules.default → reglas de envío v3 | envío gratis desde → 99900
¿el mismo texto, el mismo módulo? → true
¿con un espacio más? → false
```

## Importar desde un CDN

`import()` (y el `import` estático) aceptan también URLs completas de otros servidores. Un **CDN** como esm.sh, jsDelivr o unpkg sirve los paquetes de npm, el registro de librerías de JavaScript, convertidos en módulos ES. Es la forma más rápida de probar una librería sin instalar nada:

[[exercise:09-importar-de-un-cdn.md-]]

```text
✅ slugify 1.6.6 cargado desde esm.sh
Café de Olla 500 g → cafe-de-olla-500-g
Mole poblano (frasco) → mole-poblano-frasco
```

Sin conexión, el ejemplo imprime `⚠️ sin conexión: no se pudo cargar https://esm.sh/slugify@1.6.6 (TypeError: …)` y termina bien. Tres reglas si usas un CDN: **fija la versión** en la URL (`@1.6.6`; sin ella recibes la última, que puede romper tu código), prevé el fallo de red, y recuerda que tu página pasa a ejecutar código de un servidor ajeno. En un proyecto real, las dependencias se instalan con npm y se sirven desde tu propio servidor (lección «Rutas, import maps y herramientas»).

> **Desde Python:** Python no importa código desde URLs; `pip install` descarga el paquete una vez y lo deja en `site-packages`. En el navegador no hay `site-packages`: o se descarga cada vez desde una URL, o un empaquetador lo mete en tus archivos.

## `import()` frente a `import`

| | `import { x } from './m.js'` | `await import('./m.js')` |
|---|---|---|
| Dónde | solo en el nivel superior de un módulo | en cualquier expresión, también en scripts clásicos |
| Ruta | un texto fijo | cualquier expresión |
| Cuándo se carga | antes de ejecutar el archivo | cuando se ejecuta esa línea |
| Qué da | enlaces vivos a las exportaciones | una promesa del espacio de nombres (`default` incluido) |
| Si falla | no se ejecuta nada del archivo | la promesa se rechaza; el resto sigue |
| Empaquetadores | todo va en el mismo archivo | un archivo aparte (*code splitting*) |

Usa el estático por defecto: el navegador conoce el grafo desde el principio y descarga en paralelo, y las herramientas pueden analizarlo. Usa `import()` para lo que es opcional, pesado o depende de los datos.

## Bestiario

- **El módulo que es una promesa.**
  Síntoma: `TypeError: tax.vatFor is not a function`; al imprimir la variable sale `Promise {<pending>}`.
  Causa: `import()` devuelve una promesa del módulo, y faltó el `await` (o el `then`).
  Solución: `const tax = await import(…)`, o `import(…).then((tax) => …)`.
  → [ver ejemplo](03-olvidar-el-await.md)
- **La función por defecto que no es una función.**
  Síntoma: `TypeError: slugify is not a function` tras `const slugify = await import('./slugify.js')`; `typeof slugify` es `'object'`.
  Causa: `import()` entrega el espacio de nombres; la exportación por defecto está en su clave `default`.
  Solución: `const { default: slugify } = await import(…)`, o `módulo.default(…)`.
  → [ver ejemplo](04-la-clave-default.md)
- **La ruta relativa dentro de un blob.**
  Síntoma: `TypeError: Failed to resolve module specifier './prices.js'…` al importar un módulo creado desde un Blob (o una URL `data:`).
  Causa: las rutas relativas se resuelven contra la URL del módulo que importa, y una URL `blob:` o `data:` no tiene carpetas.
  Solución: resuelve la ruta antes, donde sí hay una URL con carpetas (`import.meta.resolve('./prices.js')`), y escribe la URL completa en el texto del módulo.
  → [ver ejemplo](07-blob-con-ruta-relativa.md)

## Resumen

- `import(ruta)` carga un módulo cuando se ejecuta esa línea y devuelve una promesa de su espacio de nombres.
- Funciona en cualquier parte, también en scripts clásicos, y su ruta puede calcularse (valídala).
- Los módulos cargados con `import()` siguen las mismas reglas: se evalúan una vez por URL y se comparten.
- Hace falta `await` (o `then`), y la exportación por defecto está en `default`.
- Un 404 rechaza la promesa con un `TypeError`: atrápalo y usa una alternativa.
- Un Blob o una URL `data:` convierten un texto en un módulo; dentro, solo funcionan URLs completas (`import.meta.resolve`).
- Desde un CDN como esm.sh se importa con la versión fijada y previendo el fallo de red.
- Estático por defecto; dinámico para lo opcional, lo pesado o lo que depende de los datos.

## Para profundizar

- [MDN: import() (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [javascript.info: importaciones dinámicas](https://es.javascript.info/modules-dynamic-imports)
- [web.dev: reducir el JavaScript con code splitting (en inglés)](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)
- [esm.sh: CDN de módulos ES (en inglés)](https://esm.sh/)
- [Python: importlib.import_module](https://docs.python.org/es/3/library/importlib.html#importlib.import_module)
