# Módulos y declaraciones

## Por qué importa

Un proyecto real tiene decenas de archivos, usa paquetes de npm y convive con scripts que no escribiste tú: la analítica, el mapa de un proveedor, la configuración que deja el servidor en la página. Para comprobar tu código, TypeScript necesita conocer los tipos de **todo** lo que usas, y la mayoría de esas piezas son JavaScript sin anotaciones. La solución son los **archivos de declaraciones** (`.d.ts`) y la palabra `declare`: describir con tipos algo que existe en otro sitio.

Esta última lección de TypeScript junta los módulos del capítulo 5 con los tipos: qué cambia al importar y exportar, por qué existe `import type`, qué hay dentro de un `.d.ts` (incluido `lib.dom.d.ts`, que llevas usando todo el módulo) y las opciones de `tsconfig.json` que encontrarás en cualquier proyecto. También explica una limitación de LearnWeb que conviene conocer: cada ejemplo es un solo archivo TypeScript, y el verificador no lee los demás.

## Módulos en TypeScript

Los módulos de TypeScript son los módulos ES del capítulo 5 (`export`, `import`, `import * as`, `import()`), con una novedad: también se exportan e importan **tipos**. En un proyecto con dos archivos se vería así:

```ts
// precios.ts
export type Currency = 'MXN' | 'USD';
export function formatPrice(cents: number, currency: Currency = 'MXN'): string { /* … */ }

// carrito.ts
import { formatPrice, type Currency } from './precios.js';
```

Fíjate en el `.js` del `import`, aunque el archivo se llame `precios.ts`: el navegador cargará el JavaScript generado, y TypeScript sabe buscar el `.ts` que corresponde a ese `.js`. En LearnWeb cada ejemplo tiene un solo bloque TypeScript, así que no puedes importar otro archivo `.ts` (el navegador no ejecuta TypeScript: un `.ts` de `assets/` llega con el tipo `video/mp2t`, el de los vídeos de televisión, y Chrome no lo acepta como módulo). Lo que sí puedes es importar módulos **JavaScript** de la carpeta `assets/` del tema, como en el capítulo 5:

[[exercise:01-importar-un-modulo-js.md-]]

```text
2 × Mole negro · $165.00
1 × Café de Chiapas · $210.00
subtotal $540.00 · con IVA (16 %) $626.40
en dólares → USD 12.50
exporta → (3) ['VAT_RATE', 'formatPrice', 'withVat']
```

### En LearnWeb, un import no tiene tipos

El ejemplo funciona, pero el verificador no ha comprobado ni una de las llamadas a `formatPrice`. LearnWeb no lee los archivos de `assets/`; a cambio, declara que **cualquier** módulo existe y exporta valores de tipo `any`, con una sola línea, `declare module '*';`. Así ningún `import` da error… y ninguno tiene tipos:

[[exercise:02-imports-sin-tipos.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 24: TS2345: Argument of type '"nacional"' is not assignable to parameter of type 'Zone'.
// Consola:
🐛 formatPrice(«165.00») → $1.65
✅ formatPrice(16500) → $165.00
🐛 envío «nacional» → NaN
✅ envío national, 1.2 kg → 229
```

Un precio en texto y en pesos llega a una función que espera centavos, y la tienda muestra `$1.65` en vez de `$165.00`: el peor tipo de fallo, uno que parece correcto. Es exactamente lo que pasa en un proyecto real con un paquete de npm o un archivo `.js` sin declaraciones. Allí, `tsc` con `noImplicitAny` (incluido en `strict`) avisa en el `import`: `TS7016: Could not find a declaration file for module './precios.js'. '…/precios.js' implicitly has an 'any' type.` (lo verías en un proyecto real; LearnWeb no puede darlo). Un detalle más del verificador de LearnWeb: importar un **tipo** de un módulo sin declaraciones (`import type { Product } from './tienda/catalogo.js'`) da `TS2709: Cannot use namespace 'Product' as a type.`

La segunda mitad del ejemplo tiene la solución: las **declaraciones** del módulo. `shippingCost` tiene tipos, y la misma clase de error sale en rojo al escribirlo.

## Archivos de declaraciones (`.d.ts`)

Un archivo `.d.ts` contiene solo tipos: las firmas de lo que exporta un módulo JavaScript, sin ningún cuerpo. Abre con «Assets» el archivo `tienda/precios.d.ts` de esta lección:

```ts
export declare const VAT_RATE: number;
export type Currency = 'MXN' | 'USD';
export declare function formatPrice(cents: number, currency?: Currency): string;
export declare function withVat(cents: number): number;
```

`declare` significa «esto existe en ejecución, en otro sitio; este es su tipo». En un proyecto real, si `precios.d.ts` está junto a `precios.js`, TypeScript lo encuentra solo y el `import` del ejemplo anterior tendría tipos. Los `.d.ts` llegan a tu proyecto de tres formas:

- **Los genera TypeScript** a partir de tu código, con la opción `declaration: true`. Es lo que hace cualquier biblioteca escrita en TypeScript antes de publicarse: el `.js` para ejecutar y el `.d.ts` para quien la use.
- **Vienen con el paquete**: el `package.json` dice dónde están (`"types": "dist/index.d.ts"`).
- **Los escribe la comunidad**: para los paquetes sin tipos, el repositorio DefinitelyTyped publica paquetes `@types/…` (`npm install --save-dev @types/lodash`).

La carpeta `assets/carrito` tiene los tres archivos de una biblioteca pequeña: el código fuente (`carrito.ts`), y lo que generó `tsc` con `declaration: true` (`carrito.js` y `carrito.d.ts`). El ejemplo importa el JavaScript y copia las declaraciones:

[[exercise:03-un-archivo-d-ts.md-]]

```text
resumen → 4 productos · $705.00
unidades → 4 | total → $705.00
en dólares → 2 productos · USD 19.00
```

Compara los tres archivos. En el `.d.ts` no queda ningún cuerpo, los comentarios `/** … */` se conservan (el editor los enseña al pasar el ratón) y los miembros privados aparecen sin tipo: `#private;` dice que la clase tiene campos `#`, sin decir cuáles, y `private readonly currency;` existe para que TypeScript pueda rechazar `cart.currency` (`TS2341`) en el código de quien usa la biblioteca.

`lib.dom.d.ts` es un archivo de declaraciones como estos, de unas 39 000 líneas. Además de las interfaces que leíste en la lección 2, tiene las variables y funciones globales del navegador, declaradas igual:

```ts
declare var document: Document;
declare function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
```

> **Desde Python:** un `.d.ts` es un archivo de *stubs* `.pyi`: las firmas de un módulo sin el código. DefinitelyTyped es el equivalente de **typeshed** (y los paquetes `@types/…`, de los `types-requests` y compañía), y la línea `"types"` del `package.json` hace el papel del marcador `py.typed`.

### Darle tipos a un import en LearnWeb

Como el verificador de LearnWeb no lee `precios.d.ts`, los ejemplos de esta lección copian las declaraciones dentro de un bloque `declare module './tienda/envios.js' { … }`, en el mismo archivo. Aquí funciona porque ese bloque amplía la declaración `declare module '*'` de LearnWeb, y desde ese momento el módulo se comporta como si tuviera su `.d.ts`: lo que no está en el bloque deja de existir (`TS2305: Module … has no exported member …`). Pero es un apaño de LearnWeb. En un proyecto real, ese mismo bloque falla: dentro de un módulo es una *ampliación* de un módulo sin tipos, `TS2665: Invalid module name in augmentation. Module './precios.js' resolves to an untyped module at '…', which cannot be augmented.`, y en un `.d.ts` global, `TS2436: Ambient module declaration cannot specify relative module name.` (los dos, en un proyecto real). La herramienta correcta es el `.d.ts` junto al `.js`.

`declare module` sí tiene dos usos legítimos en proyectos reales. Con un nombre de paquete (sin `./`), en un `.d.ts` global, describe un paquete de npm que no trae tipos: `declare module 'confetti-lite' { export function launch(): void; }`, o solo `declare module 'confetti-lite';` para aceptarlo como `any`, que es lo que hace LearnWeb con todo. Y dentro de un módulo, **amplía** un paquete que sí tiene tipos, por ejemplo para añadir un campo a una interfaz de una biblioteca: se llama *module augmentation* y funciona igual que la fusión de interfaces de la lección 3 del módulo 1.

## `import type`

Un `import` que solo trae tipos no tiene nada que importar en ejecución. TypeScript permite decirlo de dos formas: `import type { Product } from …` para la línea entera, y `import { formatPrice, type Currency } from …` para un nombre suelto. Las dos se borran al compilar:

[[exercise:04-import-type-se-borra.md-(script.ts|compiled.js)]]

```text
Mole negro · $165.00
Mole negro · $165.00 | Café de Chiapas · $210.00 | Chocolate de metate · $95.00
```

En `compiled.js` quedan dos líneas de `import`, y `type Currency` ha desaparecido de la primera. Pero TypeScript va más allá: también borra un `import` **normal** si todos sus nombres se usan solo como tipos. Casi siempre es justo lo que quieres, salvo cuando cargar el módulo tiene un **efecto**, como registrar un elemento propio con `customElements.define`:

[[exercise:05-import-que-solo-trae-tipos.md-(script.ts|compiled.js)]]

```text
🐛 ¿definido? false | ¿tiene count? false
cart-badge.js: <cart-badge> definido
✅ tras cargar el módulo → ¿definido? true | texto: «🛒 3»
```

`CartBadge` solo aparece en posiciones de tipo (el mapa de etiquetas de la lección 2), así que TypeScript borra el `import`, el módulo no se carga y `<cart-badge>` se queda como un elemento sin definir, sin ningún error ni rojo. Es la promesa rota que anunciaba la lección 2: el tipo dice `CartBadge` y el elemento no lo es. La solución es un `import` solo por su efecto, que nunca se borra: `import './insignia/cart-badge.js';`, junto con `import type { CartBadge }` para el tipo.

Para que nada se borre «por sorpresa», los proyectos nuevos suelen activar la opción `verbatimModuleSyntax`: con ella, TypeScript borra **solo** lo marcado con `type`, deja todo lo demás tal cual, y exige el `type` en los imports que solo traen tipos (en un proyecto con esa opción: `TS1484: 'Product' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.`). También la necesitan las herramientas que compilan archivo por archivo sin mirar los demás (Vite, esbuild o Node.js al ejecutar `.ts`), porque sin ver el otro archivo no pueden saber si un nombre importado es un tipo.

> **Desde Python:** `import type` es el `if TYPE_CHECKING:` de `typing`: imports que solo existen para el verificador, y que se usan para evitar importaciones circulares o efectos al cargar un módulo. `from __future__ import annotations` resuelve un problema parecido, haciendo que las anotaciones no se evalúen en ejecución.

## `declare`: lo que existe sin que TypeScript lo vea

Las variables globales que crea otro script (un `<script>` del HTML, el código que pega una herramienta externa, una biblioteca cargada desde un CDN) existen en ejecución, pero TypeScript no las ve: para él son `TS2304: Cannot find name …`. `declare const`, `declare function` o `declare class` las describen sin generar ningún código. Y como todo `declare`, es una promesa que nadie comprueba:

[[exercise:06-declare-para-globales.md-]]

```text
// Errores de tipos (el código se ejecuta igual):
línea 14: TS2304: Cannot find name 'couponCode'.
// Consola:
MXN · Te faltan $150 para el envío gratis
📊 cart_view {"items":3,"total":84900}
🐛 cupón → OTONO26
🐛 ReferenceError: PROMO_BANNER is not defined
```

En un proyecto, estas declaraciones se reúnen en un archivo como `globals.d.ts`. Que sea un archivo sin `import` ni `export` importa: así es un *script* y todo lo que declara es global. Si fuera un módulo, sus declaraciones solo valdrían dentro de él.

## `declare global`

Dentro de un módulo, `declare global { … }` añade declaraciones al ámbito global. Lo usaste en la lección 2 para los eventos y las etiquetas propias, y sirve para cualquier interfaz global del navegador. El caso más habitual es `Window`: las herramientas de analítica usan una lista `window.dataLayer`, y muchos servidores dejan en la página un objeto con el estado inicial (`window.__SHOP_STATE__`). Sin ampliar `Window`, cada uso es `TS2339: Property 'dataLayer' does not exist on type 'Window & typeof globalThis'.`

[[exercise:07-declare-global.md-]]

```text
👤 Lucía Méndez (gold) · 2 en el carrito · eventos: 1
Listo: pulsa «Comprar ahora»
// Tras pulsar «Comprar ahora»:
📊 {"event":"purchase","value":1089} · eventos: 2
```

Funciona gracias a la **fusión de declaraciones** de la lección 3 del módulo 1, que allí se presentaba como la forma de ampliar los tipos del navegador «desde archivos de declaraciones»: tu `interface Window` se suma a la de `lib.dom.d.ts`. En LearnWeb cada ejemplo es un módulo para el verificador (aunque no tenga `import`), así que estas ampliaciones siempre van dentro de `declare global`. Y lo de siempre: el tipo `ShopState` describe lo que **esperas** del servidor; si los datos pueden venir mal, valídalos como en el módulo 2.

## Espacios de nombres

Antes de que existieran los módulos ES, TypeScript tenía su propia forma de agrupar código: los **espacios de nombres** (`namespace`), que meten varias declaraciones dentro de un objeto. Siguen existiendo, pero no se borran como los tipos, sino que generan código:

[[exercise:08-espacios-de-nombres.md-]]

```text
local, 800 g → 59
national, 2.5 kg → 269
Shipping → object ['cost']
```

`compiled.js` muestra una función que se ejecuta al momento y rellena una variable global `Shipping`: el patrón módulo de la lección «Patrones de diseño» del capítulo 5. En código nuevo, usa módulos: cada archivo ya es su propio espacio de nombres, y las herramientas que ejecutan TypeScript quitando los tipos (y la opción `erasableSyntaxOnly`) rechazan un `namespace` con código, igual que `enum` y las *parameter properties*. Los seguirás viendo en `.d.ts` antiguos que describen bibliotecas globales (`declare namespace google.maps { … }`), donde solo agrupan tipos y no generan nada.

## Tipos sin TypeScript: JSDoc y `// @ts-check`

TypeScript también sabe leer tipos escritos en comentarios JSDoc dentro de archivos `.js`. Con `// @ts-check` en la primera línea (o las opciones `allowJs` y `checkJs`), el editor y `tsc` comprueban ese JavaScript como si fuera TypeScript:

```js
// @ts-check
/**
 * @param {number} cents
 * @returns {string}
 */
export function formatPrice(cents) { return '$' + (cents / 100).toFixed(2); }

formatPrice('12'); // tsc: TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Algunos proyectos grandes eligen este camino para no tener un paso de compilación, y es una buena forma de añadir tipos poco a poco a un proyecto JavaScript. LearnWeb solo comprueba los bloques TypeScript, así que en sus ejemplos de JavaScript estos comentarios no tienen efecto. Y una última pieza que verás en código antiguo y en la primera línea de `lib.dom.d.ts`: las directivas de triple barra, como `/// <reference no-default-lib="true"/>` o `/// <reference types="node" />`, que enlazaban archivos de declaraciones antes de que los módulos y `tsconfig.json` lo hicieran.

## `tsconfig.json`: lo esencial

Cada proyecto TypeScript tiene un `tsconfig.json` con las opciones del compilador. Estas son las que más verás, con el valor que usa LearnWeb:

| Opción | Qué hace | En LearnWeb |
|---|---|---|
| `strict` | el paquete de comprobaciones de la lección 1 del módulo 1 | `true` |
| `target` | la versión de JavaScript que se genera | `ES2022` |
| `module` | el formato de los módulos generados | `ESNext` |
| `moduleResolution` | cómo encuentra el archivo de cada `import` (`bundler`, `nodenext`) | ninguna: todo import es `any` |
| `lib` | qué APIs existen para el verificador | `ES2023`, `DOM`, `DOM.Iterable` |
| `useDefineForClassFields` | campos de clase estándar (lección 1) | `true` |
| `moduleDetection` | qué archivos son módulos | `force`: todos |
| `noUncheckedIndexedAccess` | `lista[i]` y `registro[clave]` pueden ser `undefined` | no |
| `exactOptionalPropertyTypes` | `notes?: string` no admite `notes: undefined` | no |
| `noImplicitOverride` | `override` obligatorio (lección 1) | no |
| `verbatimModuleSyntax` | solo se borran los imports con `type` | no |
| `isolatedModules` | avisa de lo que no se puede compilar archivo por archivo | no |
| `declaration` | genera los `.d.ts` | no |
| `allowJs` / `checkJs` | incluye y comprueba archivos `.js` | no |
| `noEmit` | solo comprueba; otra herramienta genera el JavaScript | (LearnWeb comprueba y genera por separado) |

Un punto de partida razonable para un proyecto web nuevo, con un empaquetador como Vite, es este:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2023", "DOM", "DOM.Iterable", "DOM.AsyncIterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

`noUncheckedIndexedAccess` es la opción que más cambia el día a día: con ella, `CATALOG['MOL-01']` es `Product | undefined` y hay que comprobarlo, como en la lección 2 del módulo 1 con `querySelector`. `DOM.AsyncIterable` permite el `for await` sobre `response.body` que en la lección 3 daba `TS2504`.

> **Desde Python:** `tsconfig.json` es la sección `[tool.mypy]` de `pyproject.toml` (o `mypy.ini`): `strict = true` en mypy activa un paquete de comprobaciones parecido, y `python_version` hace el papel de `target` y `lib`.

## Bestiario

- **Un import que es `any`.**
  Síntoma: una llamada equivocada a una función importada (`formatPrice('165.00')`) compila sin ningún error y da un resultado absurdo (`$1.65`).
  Causa: el módulo no tiene declaraciones; en LearnWeb, `declare module '*'` hace que todo import sea `any` (en un proyecto real, `TS7016`).
  Solución: dale declaraciones: un `.d.ts` junto al `.js`, un paquete `@types/…` o, en LearnWeb, un bloque `declare module` en el ejemplo.
  → [ver ejemplo](02-imports-sin-tipos.md)
- **El import que desaparece con su efecto.**
  Síntoma: un elemento propio sin definir (o un módulo que no se inicializa), sin ningún error; en `compiled.js` falta el `import`.
  Causa: TypeScript borra un `import` cuyos nombres solo se usan como tipos, y con él la carga del módulo.
  Solución: `import './modulo.js';` para el efecto e `import type` para los tipos; en tus proyectos, `verbatimModuleSyntax`.
  → [ver ejemplo](05-import-que-solo-trae-tipos.md)
- **Globales que TypeScript no ve (o que no existen).**
  Síntoma: `TS2304: Cannot find name 'couponCode'.` con una variable que existe en la página; o, al revés, `ReferenceError: PROMO_BANNER is not defined` sin ningún error de tipos.
  Causa: TypeScript no ve los demás scripts; `declare` describe lo que existe fuera, y nadie comprueba que sea verdad.
  Solución: declara cada global que uses (en un `globals.d.ts` en tus proyectos) y comprueba que el script que la crea se carga antes.
  → [ver ejemplo](06-declare-para-globales.md)

## Resumen

- Los módulos de TypeScript son los módulos ES, con tipos que se exportan e importan; el `import` apunta al `.js` que cargará el navegador.
- En LearnWeb, un ejemplo puede importar `.js` de `assets/`, pero el verificador no lee esos archivos: todo import es `any` (`declare module '*'`).
- Un `.d.ts` describe un módulo JavaScript con tipos y sin cuerpos; lo genera `declaration: true`, viene en el paquete o en `@types/…`.
- `import type` y `{ type X }` se borran; un `import` normal usado solo como tipo, también, con su efecto. `verbatimModuleSyntax` evita sorpresas.
- `declare const/function/class` describe lo que existe fuera; `declare global` amplía interfaces globales como `Window` o `HTMLElementEventMap`.
- `namespace` es la organización anterior a los módulos y genera código; en código nuevo, módulos.
- JSDoc con `// @ts-check` comprueba archivos `.js`; `tsconfig.json` reúne las opciones (`strict`, `target`, `lib`, `moduleResolution`, `noUncheckedIndexedAccess`…).

## Para profundizar

- [Manual de TypeScript: módulos (en inglés)](https://www.typescriptlang.org/docs/handbook/modules/introduction.html)
- [Manual de TypeScript: archivos de declaraciones (en inglés)](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html)
- [Referencia de tsconfig: verbatimModuleSyntax (en inglés)](https://www.typescriptlang.org/tsconfig/#verbatimModuleSyntax)
- [DefinitelyTyped: los tipos de la comunidad (en inglés)](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [Manual de TypeScript: JSDoc en archivos JavaScript (en inglés)](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
