# Rutas, import maps y herramientas

## Por qué importa

Todo lo que va detrás de `from` en un `import` es un **especificador** (*module specifier*): el texto que el navegador convierte en una URL para descargar el módulo. Hasta ahora todos empezaban por `./` y terminaban en `.js`, y no era casualidad: el navegador no adivina extensiones, no busca `index.js` en las carpetas y no sabe qué es `'lodash'`. En cambio, casi todo el código que verás en proyectos reales escribe `import { debounce } from 'lodash-es'` o `import App from './App'`.

Esta lección explica cómo resuelve las rutas el navegador, qué pasa cuando un archivo no se encuentra, cómo un **import map** le enseña nombres de paquete, cómo se importan datos JSON, y qué hacen las **herramientas** (npm y los empaquetadores) para que el código de los proyectos reales funcione. Nada que instalar: basta con entender el mecanismo.

## Las rutas relativas son relativas al módulo

Un especificador que empieza por `./` o `../` se resuelve contra la URL del módulo **que lo escribe**, no contra la página. En `ui/receipt.js`, `'../shared/format.js'` sube de `ui/` a la carpeta de arriba y entra en `shared/`. Cada módulo conoce su propia URL en **`import.meta.url`**, y `new URL(ruta, import.meta.url)` da la URL de un recurso que vive junto a él:

[[exercise:01-rutas-relativas-al-modulo.md-]]

```text
'./01-rutas/app.js', escrito en este script → 01-rutas/app.js
'./ui/receipt.js', escrito en app.js → 01-rutas/ui/receipt.js
'../shared/format.js', escrito en receipt.js → 01-rutas/shared/format.js
plantilla del ticket → 01-rutas/ui/receipt-template.txt
Café de Chiapas 500 g: $210.00
```

Gracias a eso, una carpeta de módulos se puede mover entera sin tocar sus rutas internas. Los ejemplos recortan `import.meta.url` porque la URL completa depende de dónde se ejecute el ejemplo (la vista previa, el diálogo de la teoría o una pestaña con ↗).

Hay tres clases de especificador:

| Especificador | Ejemplo | Se resuelve… |
|---------------|---------|--------------|
| relativo | `'./money.js'`, `'../shared/format.js'` | contra la URL del módulo que lo escribe |
| absoluto (ruta) | `'/js/money.js'` | contra la raíz del servidor |
| URL completa | `'https://esm.sh/slugify@1.6.6'` | tal cual |
| «desnudo» (*bare*) | `'lodash'`, `'shop/catalog.js'` | solo con un import map |

Las rutas absolutas (`/js/…`) dependen de cómo está organizado el servidor; en LearnWeb, los ejemplos se sirven desde direcciones distintas según dónde se abran, así que el curso usa solo rutas relativas.

> **Desde Python:** `import.meta.url` es el `__file__` del módulo, en forma de URL, y `new URL('./x.txt', import.meta.url)` es `Path(__file__).parent / 'x.txt'`. Lo que no existe es `if __name__ == '__main__'`: un módulo de JavaScript no sabe si es el punto de entrada o si lo importó otro. Si un archivo tiene que «arrancar» algo, se separa en dos: un módulo que exporta y un script de entrada que lo usa.

## Sin `./` no es una ruta

El error más común al empezar: escribir `'format.js'` o `'utils/format.js'` como en Python, sin `./`. Para el navegador, un especificador que no empieza por `./`, `../`, `/` ni es una URL completa es un **nombre de paquete** (un especificador «desnudo»), y no sabe a qué URL lleva:

[[exercise:02-especificador-sin-punto.md-]]

```text
🐛 import('01-rutas/shared/format.js') → TypeError | Failed to resolve module specifier '01-rutas/shared/format.js'
🐛 import('lodash') → TypeError | Failed to resolve module specifier 'lodash'
✅ con ./ → $210.00
```

El mensaje es claro, y con un `import` estático aparece como error sin atrapar y el script no se ejecuta. Node.js y los empaquetadores sí entienden `'lodash'`: lo buscan en la carpeta `node_modules` del proyecto. El navegador no tiene esa carpeta; para él hace falta un import map (más abajo).

## Un archivo que falta rompe el grafo entero

Antes de evaluar nada, el navegador descarga el grafo **completo**. Si un solo archivo no se encuentra (un 404), el grafo entero falla: no se evalúa **ningún** módulo, ni siquiera los que se descargaron bien. Las dos causas típicas son olvidar la extensión (el navegador no prueba `.js`) e importar una carpeta esperando que encuentre su `index.js`:

[[exercise:03-un-archivo-que-falta.md-]]

```text
🐛 app.js → TypeError | Failed to fetch dynamically imported module
🐛 la carpeta 03-roto → TypeError | Failed to fetch dynamically imported module
  (evaluando analytics.js)
✅ 📊 checkout · $487.20
```

`analytics.js` solo se evalúa al final, cuando lo importa la versión arreglada: en el primer intento se descargó, pero el 404 de `./format` impidió evaluarlo. Fíjate también en que el mensaje no dice qué archivo faltaba. Para saberlo, abre el ejemplo con ↗ y mira la pestaña «Red» de DevTools: la petición de `format` aparece en rojo con un 404.

Con un `import` estático es peor: en la consola de DevTools aparece la petición fallida, pero no hay ninguna excepción que atrapar, y la página simplemente no hace nada. Si un módulo «no se ejecuta» y no hay error a la vista, mira la pestaña «Red».

## Import maps: nombres para tus módulos

Un **import map** es un JSON, dentro de un `<script type="importmap">`, que asocia especificadores con URLs. Con `"money": "./04-mapa/money.js"`, el especificador desnudo `'money'` pasa a ser válido; con un prefijo terminado en `/` (`"shop/": "./04-mapa/shop/"`), todo lo que empiece por `shop/` se traduce. El mapa vale para **todos** los módulos de la página:

```html
<script type="importmap">
{
  "imports": {
    "money": "./04-mapa/money.js",
    "shop/": "./04-mapa/shop/"
  }
}
</script>
```

[[exercise:04-import-map.md-]]

```text
formatPrice(21000) → $210.00
Molinillo manual · $549.00
'money' → 04-mapa/money.js
'shop/catalog.js' → 04-mapa/shop/catalog.js
```

El import map tiene que estar **antes** de los módulos que lo usan (en el ejemplo, el bloque HTML va antes del script). Es la forma de usar paquetes por nombre sin empaquetador: `"lodash": "https://esm.sh/lodash-es@4.17.21"` decide en un solo sitio de dónde sale cada paquete y en qué versión, y el resto del código escribe `import … from 'lodash'`, como en un proyecto con npm. Un import map también admite `"scopes"`, para que una carpeta concreta use otra versión de un paquete; lo verás en los ejemplos profesionales.

## Importar datos JSON

Un archivo JSON también puede ser un módulo: `import catalog from './catalog.json' with { type: 'json' }`. El navegador lo descarga, lo convierte en objeto con `JSON.parse` y lo entrega como exportación por defecto. Lo que va detrás de `with` es un **atributo de importación** (*import attribute*; Chrome 123, 2024), y con `import()` se pasa como segundo argumento:

[[exercise:05-modulos-json.md-]]

```text
actualizado → 2026-10-01
productos → (3) ['CAF-500', 'MOL-001', 'TAZ-002']
envío estándar → 14900 | gratis desde → 99900
¿el mismo objeto? → true
```

Es un módulo más: se carga una vez, y el objeto es **compartido** y modificable (el problema de los objetos exportados de la lección «Organizar el código»). Para datos que cambian mientras la página está abierta, se usa `fetch` (capítulo 6).

El atributo no es opcional, y un módulo JSON no tiene exportaciones con nombre:

[[exercise:06-json-sin-with.md-]]

```text
🐛 sin with → TypeError | no se cargó: el servidor lo envía como application/json
🐛 import { products } → SyntaxError | The requested module './catalog.json' does not provide an export named 'products'
✅ productos → 3
```

¿Por qué exigir `with { type: 'json' }` si el archivo ya se llama `.json`? Porque en la web manda el **tipo MIME** de la respuesta (`application/json`, `text/javascript`), no la extensión, y es el servidor quien lo decide. El atributo dice qué esperas: un servidor comprometido que devolviera JavaScript donde esperabas datos no conseguiría ejecutarlo. Por la misma razón, un archivo `.js` servido con un tipo MIME que no sea de JavaScript no carga como módulo.

## npm, empaquetadores y lo que hacen por ti

En un proyecto real, las librerías no se importan desde un CDN. **npm** (el gestor de paquetes de Node.js) las descarga a la carpeta `node_modules` y apunta en `package.json` cuáles usa el proyecto y en qué versión, como `pip` y `requirements.txt` (o `pyproject.toml`). Luego, un **empaquetador** (*bundler*: Vite, esbuild, Rollup, webpack) lee tus módulos y produce los archivos que de verdad se sirven al navegador. Por el camino:

- **Resuelve** los especificadores desnudos buscando en `node_modules`, y entiende `'./App'` sin extensión o una carpeta con `index.js`.
- **Une** muchos módulos en pocos archivos, para que el navegador haga menos peticiones.
- **Quita** el código que nadie importa (*tree-shaking*), gracias a que los `import` y `export` son estáticos.
- **Divide** el código en un archivo por cada `import()` (*code splitting*).
- **Transforma**: TypeScript (capítulo 7) a JavaScript, código moderno para navegadores viejos, archivos minimizados.

Este ejemplo muestra la idea central en pequeño: cada módulo se convierte en una **función** dentro de un solo archivo (otra vez el patrón módulo con IIFE), y una caché garantiza que cada una se ejecuta una sola vez:

[[exercise:07-un-empaquetador-a-mano.md-]]

```text
  ejecutando ./main.js
  ejecutando ./money.js
  ejecutando ./cart.js
total del carrito → $880.44
módulos ejecutados → (3) ['./main.js', './money.js', './cart.js']
```

El esquema de `require` y `exports` del ejemplo es **CommonJS**, el sistema de módulos que Node.js usó antes de los módulos ES. Lo encontrarás en código y documentación antiguos (`const fs = require('fs')`, `module.exports = …`): es síncrono, sus exportaciones son copias (no enlaces vivos) y un módulo empieza a ejecutarse antes que sus dependencias. Hoy, Node.js también usa módulos ES, con la extensión `.mjs` o con `"type": "module"` en `package.json`.

Con un empaquetador, en desarrollo se trabaja con módulos como los de este tema (Vite incluso se los sirve al navegador como módulos nativos, con las rutas ya traducidas). Lo que cambia es que puedes escribir `import { debounce } from 'lodash-es'` y la herramienta se encarga de convertirlo en una URL. Cuando llegues a eso, sabrás qué hace por ti.

## De Python a JavaScript

| Python | JavaScript en el navegador |
|--------|----------------------------|
| `sys.path` y `site-packages` | rutas relativas, URLs, import maps |
| `pip install`, `requirements.txt` | `npm install`, `package.json` (con empaquetador) |
| `import paquete` busca en `site-packages` | `'paquete'` solo funciona con import map o empaquetador |
| `__file__` | `import.meta.url` |
| `Path(__file__).parent / 'x.json'` | `new URL('./x.json', import.meta.url)` |
| `if __name__ == '__main__':` | no hay; un script de entrada aparte |
| `json.load(open('x.json'))` | `import x from './x.json' with { type: 'json' }` (una vez) o `fetch` |
| `import paquete` encuentra `paquete/__init__.py` | hay que escribir `./paquete/index.js` |

## Bestiario

- **La ruta sin `./`.**
  Síntoma: `TypeError: Failed to resolve module specifier "utils/format.js". Relative references must start with either "/", "./", or "../".`
  Causa: sin `./` delante, el navegador lo toma por un nombre de paquete (especificador desnudo) y no sabe a qué URL lleva.
  Solución: empieza las rutas relativas por `./` o `../`; para nombres de paquete, un import map o un empaquetador.
  → [ver ejemplo](02-especificador-sin-punto.md)
- **El grafo que no arranca.**
  Síntoma: un módulo (y todo lo que importa) no se ejecuta; con `import()`, `TypeError: Failed to fetch dynamically imported module`; en la pestaña «Red», un 404.
  Causa: un archivo del grafo no existe en esa URL: falta la extensión `.js`, se importó una carpeta esperando `index.js` o hay una errata en el nombre.
  Solución: rutas completas, con extensión y con el nombre exacto del archivo; revisa la pestaña «Red» de DevTools.
  → [ver ejemplo](03-un-archivo-que-falta.md)
- **El JSON que no carga.**
  Síntoma: importar un `.json` da un `TypeError` (DevTools añade «…the server responded with a MIME type of "application/json"»), o `SyntaxError: … does not provide an export named 'products'`.
  Causa: falta el atributo `with { type: 'json' }`, o se piden exportaciones con nombre a un módulo JSON, que solo tiene `default`.
  Solución: `import datos from './x.json' with { type: 'json' }` y desestructura después.
  → [ver ejemplo](06-json-sin-with.md)

## Resumen

- Un especificador relativo (`./`, `../`) se resuelve contra la URL del módulo que lo escribe; `import.meta.url` es esa URL.
- `new URL(ruta, import.meta.url)` localiza recursos junto al módulo; no hay `if __name__ == '__main__'`.
- Sin `./`, un especificador es un nombre de paquete, y el navegador solo lo entiende con un import map.
- El navegador no adivina extensiones ni busca `index.js`; un 404 en el grafo impide evaluar todos sus módulos.
- Un `<script type="importmap">` asocia nombres y prefijos con URLs para toda la página, antes de los módulos.
- Los JSON se importan con `with { type: 'json' }` y llegan como exportación por defecto, compartida.
- npm instala paquetes en `node_modules`; un empaquetador resuelve, une, recorta y divide los módulos para el navegador.
- CommonJS (`require`, `module.exports`) es el sistema antiguo de Node.js: síncrono y sin enlaces vivos.

## Para profundizar

- [MDN: import maps (en inglés)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap)
- [MDN: import.meta (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)
- [MDN: atributos de importación (en inglés)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with)
- [Vite: por qué Vite (en inglés)](https://vite.dev/guide/why)
- [Node.js: módulos ECMAScript (en inglés)](https://nodejs.org/api/esm.html)
