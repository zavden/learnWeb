# Plan del curso «Web a fondo: HTML, CSS, Sass, JavaScript y TypeScript»

Objetivo: que alguien que sabe Python básico y nada de web entienda **qué hace el navegador y por qué**,
domine HTML, CSS (+Sass/SCSS), JavaScript (+prototipos y POO) y TypeScript, y llegue preparado para
estudiar WebAssembly y WebGPU (datos binarios, memoria, workers, GPU).

Convenciones de carpetas: `material/chNN-slug/secNN-slug/topNN-slug/` (slugs ASCII). Cada capítulo y sección
tiene `label.txt` con su nombre con tildes. Cada tema tiene `main.md` (su primer `# ` es el nombre visible).

Cada **sección = módulo**. Estructura de un módulo:

- `top01..topNN` — lecciones. Cada una: `main.md` + **5-10 ejemplos atómicos** (un concepto por ejemplo).
- `top90-integracion` — **5-10 ejemplos combinados** (varios conceptos del módulo a la vez) + 2-4 ejercicios con solución.
- `top95-profesional` — **10-15 ejemplos de nivel profesional** que usan todo lo aprendido hasta ese punto del curso
  (no solo del módulo). Calidad de producción: accesibles, responsive, código limpio, sin hacks.

El orden de los capítulos importa: un ejemplo nunca usa algo que se enseña más adelante, salvo que lo
avise («esto lo veremos en el módulo X; aquí basta con saber que…»). En HTML y CSS se usa JS mínimo o nada.

Leyenda: «🐛» = comportamiento raro que DEBE tener ejemplo propio y entrada en la sección «Bestiario» del `main.md`.

---

## ch02-html — HTML

### sec01-la-web-y-el-documento — La web y el documento
- top01-como-funciona-la-web — cliente/servidor, HTTP (petición, respuesta, métodos, códigos de estado, cabeceras),
  URL (esquema, host, puerto, ruta, query, fragmento), DNS a grandes rasgos, qué descarga el navegador y en qué orden.
  Ejemplos: inspeccionar `location`, `fetch` de un asset y leer `status`/`headers`, `URL` y `URLSearchParams` (avisando de que JS llega luego), rutas relativas vs absolutas. 🐛 una ruta relativa se resuelve contra la URL del documento.
- top02-anatomia-de-un-documento — `<!DOCTYPE html>`, `html/head/body`, `meta charset`, `viewport`, `title`, `lang`.
  🐛 sin DOCTYPE → quirks mode (`document.compatMode`), 🐛 mojibake sin charset, 🐛 el navegador crea `head`/`body` aunque no los escribas.
- top03-elementos-y-atributos — sintaxis de etiquetas, elementos vacíos (void), anidamiento, atributos booleanos
  (`disabled="false"` sigue desactivado 🐛), atributos globales (`id`, `class`, `data-*`, `hidden`, `lang`, `dir`, `title`, `tabindex`, `contenteditable`), comentarios, entidades (`&lt;`, `&amp;`, `&nbsp;`).
- top04-el-parser-de-html — el HTML nunca «falla»: recuperación de errores. 🐛 `<p>` no puede contener `<div>` (cierre implícito),
  🐛 `</p>` suelto crea un `<p>` vacío, 🐛 foster parenting en tablas, 🐛 espacios en blanco colapsados y el hueco entre inline-blocks,
  🐛 `<script>` bloquea el parser, `defer` vs `async`. Mostrar siempre el DOM resultante con `console.log(document.body.innerHTML)` o DevTools.
- top05-del-html-a-los-pixeles — DOM, CSSOM, render tree, layout, paint, composite; qué dispara cada fase;
  `display:none` vs `visibility:hidden` vs `opacity:0`; cómo usar DevTools (Elements, Computed, Layout).

### sec02-contenido-y-semantica — Contenido y semántica
- top01-texto — títulos `h1-h6`, párrafos, `em/strong` vs `i/b`, `br`, `wbr`, `pre`, `code`, `kbd`, `blockquote/q/cite`, `abbr`, `time`, `mark`, `sub/sup`, `small`. 🐛 `pre` y el salto de línea inicial.
- top02-listas — `ul/ol/li` (`start`, `reversed`, `type`), listas anidadas, `dl/dt/dd`. 🐛 solo `li` puede ser hijo directo de `ul`.
- top03-enlaces — `href` absoluto/relativo/fragmento, `target="_blank"` + `rel="noopener"`, `download`, `mailto:`/`tel:`, enlaces vs botones (cuándo cada uno).
- top04-imagenes — `img` (`alt` obligatorio, `width/height` contra el layout shift, `loading="lazy"`, `decoding`), `srcset`+`sizes`, `picture`/`source`, `figure/figcaption`, SVG como imagen. 🐛 el hueco bajo las imágenes (baseline) — se explica de verdad en CSS.
- top05-tablas — `table/caption/thead/tbody/tfoot/tr/th/td`, `scope`, `colspan/rowspan`, `colgroup`. 🐛 `tbody` implícito. Tablas para datos, nunca para layout.
- top06-estructura-semantica — `header/nav/main/article/section/aside/footer`, `address`, landmarks, outline. Cuándo `div`/`span`.
- top07-accesibilidad — nombre accesible, `alt`, `label`, roles implícitos, ARIA (`aria-label`, `aria-labelledby`, `aria-describedby`, `aria-live`, `aria-expanded`), primera regla de ARIA, foco y `tabindex`, skip link, contraste.

### sec03-formularios — Formularios
- top01-form-y-envio — `form`, `action`, `method` GET/POST, `name`, qué se envía (pares nombre/valor), `enctype`, `FormData`
  (en la vista previa el envío se intercepta y se muestra en la consola). 🐛 un control sin `name` no se envía.
- top02-controles — todos los `input type` útiles (text, email, url, tel, number, range, date, time, color, checkbox, radio, file, hidden, search, password), `label` (implícito/explícito), `textarea`, `select/option/optgroup`, `datalist`, `fieldset/legend`, `output`, `button` (`submit` por defecto 🐛, `reset`, `button`).
- top03-validacion-nativa — `required`, `pattern`, `min/max/step`, `minlength/maxlength`, `type=email`, `:valid/:invalid/:user-invalid`, `novalidate`, `setCustomValidity`, `reportValidity`, `validity` (adelanto de JS).
- top04-ux-de-formularios — `autocomplete`, `inputmode`, `enterkeyhint`, `placeholder` ≠ `label`, mensajes de error accesibles, agrupación.
- top05-elementos-interactivos — `details/summary`, `dialog` (`showModal`, `method="dialog"`), API `popover`, `inert`.

### sec04-multimedia-y-embebidos — Multimedia y contenido embebido
- top01-audio-y-video — `audio/video`, `controls`, `source`, `track`/subtítulos, `autoplay` (solo con `muted`) 🐛, `poster`, `preload`.
- top02-svg-en-html — SVG inline: `viewBox`, coordenadas, formas básicas, `path` (comandos), `fill/stroke`, `currentColor`, `use/symbol` (sprite), SVG accesible.
- top03-canvas-y-graficos — el elemento `canvas` (tamaño del bitmap vs tamaño CSS 🐛 borroso, `devicePixelRatio`), adelanto de la API 2D.
- top04-iframes-y-embebidos — `iframe`, `sandbox`, `allow`, `srcdoc`, `loading`, mismo origen vs otro origen (por qué la vista previa de LearnWeb es un iframe).
- top05-template-y-metadatos — `template`, `slot` (adelanto de Web Components), `meta` sociales/SEO, `link rel` (preload, icon), microdatos/JSON-LD a grandes rasgos.

---

## ch03-css — CSS

### sec01-fundamentos-y-cascada — Fundamentos y cascada
- top01-sintaxis-y-como-se-aplica — regla, selector, declaración, at-rules, comentarios; `style` inline, `<style>`, `<link>`; hoja de estilos del navegador (user agent) 🐛 márgenes por defecto del `body`. CSS inválido se ignora en silencio 🐛 (una declaración, o toda la regla si el selector es inválido).
- top02-selectores — tipo, clase, id, universal, atributo (`[a]`, `[a=v]`, `^=`, `$=`, `*=`, `~=`, `|=`, `i`), listas de selectores, combinadores (descendiente, `>`, `+`, `~`).
- top03-pseudoclases — estado (`:hover`, `:active`, `:focus`, `:focus-visible`, `:focus-within`, `:checked`, `:disabled`), estructurales (`:first-child`, `:nth-child(An+B of S)`, `:nth-of-type`, `:only-child`, `:empty`), lógicas (`:not`, `:is`, `:where`, `:has`), `:root`, `:target`. 🐛 `:nth-child` cuenta hermanos de cualquier tipo.
- top04-pseudoelementos — `::before/::after` (`content` obligatorio 🐛), `::first-letter`, `::first-line`, `::marker`, `::selection`, `::placeholder`, `::backdrop`.
- top05-especificidad — cálculo (a,b,c), `:is` vs `:where`, `!important`, estilos inline. 🐛 un id gana a 100 clases.
- top06-cascada-y-capas — orígenes, importancia, `@layer`, orden de aparición, `revert-layer`. 🐛 `!important` invierte el orden de las capas.
- top07-herencia-y-valores — propiedades heredadas vs no heredadas, `inherit/initial/unset/revert`, valor especificado → computado → usado → real; `all`.
- top08-unidades-y-funciones — `px`, `em` (🐛 se encadena), `rem`, `%` (¿de qué?), `vw/vh/dvh/svh`, `ch`, `ex`, `lh`, `calc()`, `min()/max()/clamp()`.
- top09-color — nombres, hex, `rgb()`, `hsl()`, `oklch()`, alfa, `currentColor`, `color-mix()`, `transparent`, `color-scheme`.
- top10-custom-properties — `--var`, `var()` con fallback, herencia y ámbito, cambiar variables con JS (adelanto), `@property` (tipadas y animables). 🐛 valor inválido en tiempo de cómputo → `unset`.

### sec02-modelo-de-cajas — El modelo de cajas
- top01-la-caja — content/padding/border/margin, `box-sizing` (🐛 `width:100%` + padding desborda), `outline` vs `border`.
- top02-display — `block`, `inline` (🐛 `width`/`margin-top` no afectan a inline), `inline-block`, `none`, `contents`, `flow-root`; tipo exterior/interior.
- top03-margenes — márgenes negativos, `auto` para centrar, 🐛 colapso de márgenes (hermanos, padre-hijo, vacíos) y cómo evitarlo.
- top04-tamanos — `width/height: auto`, `%` de altura 🐛 (necesita altura definida en el padre), `min/max-*`, `min-content/max-content/fit-content`, `aspect-ratio`.
- top05-overflow — `visible/hidden/clip/scroll/auto`, 🐛 `overflow` crea un BFC, `text-overflow: ellipsis` (requiere 3 propiedades), scrollbars y `scrollbar-gutter`.
- top06-bordes-sombras-y-fondos — `border-radius` (elíptico), `box-shadow` (múltiples, inset), fondos multicapa, `background-size/position/repeat/clip/origin/attachment`.

### sec03-flujo-y-posicionamiento — Flujo normal y posicionamiento
- top01-flujo-normal-y-contextos — bloque vs inline formatting context, BFC (qué lo crea, para qué sirve).
- top02-el-contexto-inline — line boxes, `line-height`, `vertical-align`, baseline: 🐛 el hueco bajo una imagen, 🐛 inline-blocks desalineados.
- top03-floats — `float`, `clear`, 🐛 el padre que colapsa, clearfix vs `display: flow-root`; uso legítimo hoy (texto alrededor, `shape-outside`).
- top04-position — `static/relative/absolute/fixed/sticky`, offsets, bloque contenedor (🐛 `transform` en un ancestro cambia el bloque contenedor de `fixed`), 🐛 `sticky` que no se pega (overflow del ancestro, altura del padre), `inset`.
- top05-z-index-y-contextos-de-apilamiento — orden de pintado, qué crea un stacking context (opacity<1, transform, filter, `isolation`…), 🐛 `z-index: 9999` que no sube.

### sec04-flexbox — Flexbox
- top01-ejes-y-contenedor — `display:flex`, eje principal/cruzado, `flex-direction`, `flex-wrap`, `gap`.
- top02-alineacion — `justify-content`, `align-items`, `align-self`, `align-content`, márgenes `auto` en flex.
- top03-el-algoritmo-de-flex — `flex-basis`, `flex-grow`, `flex-shrink` (cálculo numérico real, mostrado paso a paso), `flex` shorthand (🐛 `flex:1` = `1 1 0%`).
- top04-trampas-de-flex — 🐛 `min-width:auto` que impide encoger (texto largo, overflow), 🐛 imágenes estiradas, `order` y accesibilidad.
- top05-patrones-flex — navbar, media object, footer pegado abajo, centrado, tarjetas de igual altura.

### sec05-grid — CSS Grid
- top01-pistas-y-unidades — `grid-template-columns/rows`, `fr`, `repeat()`, `minmax()`, `auto-fill` vs `auto-fit` 🐛.
- top02-colocacion — líneas, `span`, líneas negativas, nombres de líneas, áreas (`grid-template-areas`).
- top03-grid-implicito — `grid-auto-rows/columns`, `grid-auto-flow` (`dense`), qué pasa con los elementos sobrantes.
- top04-alineacion-en-grid — `justify/align-items/content/self`, `place-*`.
- top05-subgrid-y-patrones — `subgrid`, layout holy grail, galería responsive sin media queries, superposición de capas en la misma celda.

### sec06-tipografia-y-texto — Tipografía y texto
- top01-fuentes — `font-family` y pilas, fuentes del sistema, `@font-face`, `font-display`, fuentes variables (`font-variation-settings`), `font-weight` sintético 🐛.
- top02-texto — `line-height` sin unidad (🐛 con unidad se hereda el valor calculado), `letter-spacing`, `text-align`, `text-indent`, `text-transform`, `text-decoration` moderna, `text-wrap: balance/pretty`.
- top03-espacios-y-cortes — `white-space`, `overflow-wrap`, `word-break`, `hyphens`, guiones y `lang` 🐛.
- top04-modos-de-escritura — `writing-mode`, `direction`, propiedades lógicas (`margin-inline`, `inset-block`…).

### sec07-efectos-visuales — Efectos visuales
- top01-degradados — `linear/radial/conic-gradient`, paradas duras, repetidos, interpolación de color, patrones solo con CSS.
- top02-filtros-y-mezclas — `filter`, `backdrop-filter`, `mix-blend-mode`, `background-blend-mode`, `isolation`.
- top03-recortes-y-mascaras — `clip-path` (formas, `path()`), `mask-image`, formas con `shape-outside`.
- top04-transformaciones — `translate/rotate/scale/skew`, `transform-origin`, orden de las transformaciones 🐛, 3D (`perspective`, `preserve-3d`, `backface-visibility`), `matrix()` explicada.

### sec08-responsive — Diseño responsive
- top01-viewport-y-media-queries — meta viewport, `@media` (ancho, rangos `width >= 600px`, orientación), mobile-first, breakpoints por contenido.
- top02-preferencias-del-usuario — `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast`, `hover/pointer`, tema claro/oscuro con custom properties y `light-dark()`.
- top03-tipografia-y-espacios-fluidos — `clamp()` con `vw`, escalas modulares.
- top04-container-queries — `container-type`, `@container`, unidades `cqi/cqw`, componentes que se adaptan a su contenedor.
- top05-imagenes-responsive-en-css — `object-fit/object-position`, `image-set()`, `aspect-ratio`.

### sec09-animacion — Transiciones y animaciones
- top01-transiciones — `transition-*`, qué propiedades son animables, 🐛 `display`/`height:auto` no transicionan (y `interpolate-size`/`@starting-style`), `transitionend`.
- top02-easing — curvas `cubic-bezier`, `steps()`, `linear()` para muelles.
- top03-keyframes — `@keyframes`, `animation-*` (`fill-mode` 🐛, `direction`, `iteration-count`, `play-state`), animar custom properties con `@property`.
- top04-rendimiento-de-animaciones — layout vs paint vs composite, animar solo `transform`/`opacity`, `will-change` (y su abuso), capas en DevTools.
- top05-animaciones-modernas — scroll-driven animations (`animation-timeline: scroll()/view()`), View Transitions (mismo documento).

### sec10-arquitectura-css — Arquitectura y CSS moderno
- top01-anidamiento-nativo — CSS nesting, `&`, 🐛 diferencias con Sass.
- top02-metodologias — BEM, utilidades, componentes; `:where()` para especificidad cero; capas para orden.
- top03-scope — `@scope` (raíz, límite «donut», proximidad, 🐛 la especificidad gana a la proximidad). (Separada de top02 en la sexta sesión.)
- top04-design-tokens — tokens con custom properties, temas, escalas de espacio/tipografía.
- top05-resets-y-bases — reset moderno comentado línea a línea, `accent-color`, `color-scheme`.

---

## ch04-sass — Sass / SCSS

### sec01-sass-fundamentos — Sass desde cero
- top01-que-es-sass — preprocesador (compila a CSS antes del navegador), SCSS vs sintaxis indentada (SASS), ver el CSS generado.
- top02-variables-y-ambito — `$var`, ámbito de bloque, `!default`, `!global`, 🐛 variables Sass ≠ custom properties (tiempo de compilación vs ejecución), interpolación `#{}`.
- top03-anidamiento — anidamiento, `&` (sufijos `&__elem`, `&:hover`, `.tema &`), 🐛 sobre-anidar dispara la especificidad.
- top04-mixins — `@mixin`, `@include`, argumentos con defaults y nombrados, `@content`, mixins de media queries.
- top05-funciones-y-modulos — `@function/@return`, módulos `sass:math` (🐛 `/` ya no divide: `math.div`), `sass:color`, `sass:list`, `sass:map`, `sass:string`.
- top06-control-de-flujo — `@if/@else`, `@each` (listas y mapas), `@for` (`through` vs `to` 🐛), `@while` (la guarda de LearnWeb), generar utilidades.
- top07-extend-y-placeholders — `%placeholder`, `@extend`, 🐛 selectores inesperados al extender; cuándo preferir mixins.
- top08-depuracion — `@debug`, `@warn`, `@error`, leer los errores del compilador.

---

## ch05-javascript — JavaScript: el lenguaje

### sec01-primeros-pasos — Primeros pasos (desde Python)
- top01-javascript-en-el-navegador — dónde corre el JS de la vista previa, `console.log` y la consola de LearnWeb, REPL, `<script>`, errores en rojo.
- top02-sintaxis-frente-a-python — llaves vs indentación, `;` y ASI (🐛 `return` + salto de línea), comentarios, `camelCase`, comparación lado a lado con Python.
- top03-variables — `let`, `const` (🐛 const no congela objetos), `var` (🐛 hoisting, ámbito de función, se cuelga de `window`), TDZ 🐛.
- top04-tipos-primitivos — number, bigint, string, boolean, null, undefined, symbol; `typeof` (🐛 `typeof null === "object"`); primitivo vs objeto; inmutabilidad de los strings.
- top05-operadores-y-coercion — aritmética, `+` con strings 🐛, `==` vs `===` (tabla de coerción), truthy/falsy (🐛 `[]` y `"0"` son truthy), `&&`, `||`, `??`, `?.`, ternario, asignación lógica.
- top06-control-de-flujo — `if`, `switch` (🐛 fallthrough), `for`, `while`, `do…while`, `for…of` vs `for…in` 🐛, `break/continue` con etiquetas.
- top07-errores — `try/catch/finally` (🐛 `return` en finally), `throw` de cualquier cosa, tipos de Error, `error.cause`, stack.

### sec02-datos — Números, texto y colecciones
- top01-numeros — IEEE-754 (🐛 `0.1 + 0.2`), `Number.EPSILON`, enteros seguros, `NaN` (🐛 `NaN !== NaN`, `Number.isNaN` vs `isNaN`), `Infinity`, `-0` 🐛, `parseInt` (🐛 `parseInt(0.0000005)`), `toFixed`, `Math`, `BigInt`.
- top02-strings — UTF-16 (🐛 `"😀".length === 2`), iterar por code points, plantillas, métodos, `normalize` 🐛, comparar (`localeCompare`), `Intl` básico.
- top03-arrays — crear, métodos que mutan vs que no (`toSorted`, `toReversed`, `with`), 🐛 `sort()` ordena como texto, huecos (sparse), `map/filter/reduce/find/some/every/flat/flatMap/at`, desestructuración, spread.
- top04-objetos-literales — propiedades, claves computadas, shorthand, métodos, desestructuración con defaults y renombre, spread (🐛 copia superficial), `Object.keys/values/entries/fromEntries`, orden de las claves 🐛.
- top05-map-set-y-weak — `Map` vs objeto (claves de cualquier tipo), `Set`, operaciones de conjuntos, `WeakMap/WeakSet` y el GC.
- top06-json-y-copias — `JSON.stringify/parse` (🐛 `undefined`, fechas, `NaN`), reviver/replacer, `structuredClone`, copia superficial vs profunda, igualdad por referencia.
- top07-fechas-e-intl — `Date` (🐛 meses desde 0, zonas horarias), `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Temporal` (mención).
- top08-expresiones-regulares — literales y `new RegExp`, `test/match/matchAll/replace/split`, clases (🐛 `\w` solo ASCII → `\p{L}` con `u`/`v`), cuantificadores (🐛 voraces), anclas (🐛 sin `^…$` acepta subcadenas), grupos con nombre, lookaround, banderas (🐛 `lastIndex` con `g`), el modo `v` de `pattern`, `RegExp.escape`, 🐛 backtracking catastrófico. (Añadida en la sexta sesión: la necesitan los formularios con JS.)

### sec03-funciones-y-ambito — Funciones y ámbito
- top01-formas-de-funcion — declaración, expresión, flecha (🐛 retorno implícito de objetos con `({})`), funciones como valores, callbacks.
- top02-parametros — defaults, rest, `arguments` 🐛, desestructuración de parámetros, paso por valor de la referencia (vs Python: igual modelo).
- top03-ambito-y-hoisting — ámbito léxico, cadena de ámbitos, hoisting de funciones vs `let/const/var`, sombreado.
- top04-closures — qué captura un closure (la variable, no el valor), contadores, fábricas, 🐛 `var` en bucles + `setTimeout`, memoria.
- top05-this — las 4 reglas (llamada simple, método, `new`, `call/apply/bind`) + flechas, 🐛 perder `this` al pasar un método como callback, modo estricto.
- top06-funciones-de-orden-superior — composición, currying, `bind` parcial, memoización, debounce/throttle.
- top07-recursion-y-pila — pila de llamadas, 🐛 `Maximum call stack size exceeded`, recursión vs iteración.

### sec04-objetos-y-prototipos — Objetos y prototipos
- top01-propiedades-a-fondo — descriptores (`writable`, `enumerable`, `configurable`), `defineProperty`, getters/setters, `Object.freeze/seal/preventExtensions` (🐛 freeze superficial).
- top02-la-cadena-de-prototipos — `[[Prototype]]`, `Object.getPrototypeOf`, búsqueda de propiedades, sombreado, `Object.create`, `Object.create(null)`, `hasOwn` vs `in`. Usar la consola expandible para ver `[[Prototype]]`.
- top03-funciones-constructoras-y-new — qué hace `new` paso a paso (implementar `miNew`), `F.prototype` vs `[[Prototype]]` 🐛, `constructor`, `instanceof` (cómo funciona por dentro).
- top04-herencia-prototipica — encadenar prototipos a mano, `Object.setPrototypeOf` (y por qué evitarlo), métodos compartidos vs propios, delegación.
- top05-prototipos-nativos — `Array.prototype`, `Object.prototype`, por qué `[].map` existe, 🐛 extender prototipos nativos, primitivos «envueltos» (`"a".toUpperCase()`).

### sec05-clases-y-poo — Clases y POO
- top01-clases — sintaxis, `constructor`, métodos (en el prototipo), campos de instancia, 🐛 las clases no se elevan (TDZ), comparación con Python (`self` implícito, sin `__init__`).
- top02-encapsulacion — `#privados`, `static`, bloques `static {}`, getters/setters, 🐛 `#x in obj`, convenciones `_x`.
- top03-herencia-con-extends — `extends`, `super()` (🐛 usar `this` antes de `super`), `super.metodo()`, sobrescritura, heredar de nativos (`Array`, `Error`).
- top04-polimorfismo-y-protocolos — duck typing, `Symbol.iterator`, `Symbol.toPrimitive`, `toString/valueOf`, `Symbol.toStringTag`; equivalentes de los métodos mágicos de Python.
- top05-composicion-y-mixins — composición frente a herencia, mixins con `Object.assign` y con funciones que extienden clases, sin herencia múltiple.
- top06-patrones-de-diseno — módulo, fábrica, observador (EventEmitter propio), estrategia, singleton (y por qué evitarlo), inmutabilidad.

### sec06-iteracion-y-metaprogramacion — Iteradores, generadores y metaprogramación
- top01-protocolo-iterable — `Symbol.iterator`, `next()`, iterables propios, qué consume iterables (`for…of`, spread, desestructuración, `Array.from`).
- top02-generadores — `function*`, `yield`, generadores infinitos y perezosos, `return/throw`, `yield*`, comparación con Python.
- top03-symbol — símbolos como claves, símbolos bien conocidos, `Symbol.for`.
- top04-proxy-y-reflect — trampas `get/set/has/deleteProperty`, validación, objetos reactivos (mini store), `Reflect`.
- top05-plantillas-etiquetadas — tagged templates (`html\`\``, escapar HTML), `String.raw`.

### sec07-asincronia — Asincronía y event loop
- top01-el-event-loop — pila, cola de tareas, microtareas, pasos de renderizado; 🐛 `setTimeout(fn, 0)` no es 0; orden de ejecución mostrado con logs.
- top02-callbacks-y-timers — `setTimeout`, `setInterval` (🐛 deriva), callback hell, errores en callbacks.
- top03-promesas — estados, `then/catch/finally`, encadenar (devolver vs no devolver 🐛), errores, `Promise.resolve/reject`, crear promesas (`new Promise`), promisificar.
- top04-combinadores — `Promise.all/allSettled/race/any`, timeouts con `race`, `AbortController`.
- top05-async-await — `async` siempre devuelve promesa, `await`, `try/catch`, 🐛 `await` en bucle secuencial vs paralelo, 🐛 `forEach` + async, top-level await (en módulos).
- top06-animation-frames-y-tiempo — `requestAnimationFrame`, `performance.now()`, bucles de animación con delta time.

### sec08-modulos — Módulos y organización
- top01-modulos-es — `import/export` (named/default), ámbito de módulo, modo estricto, `type="module"`, módulos se evalúan una vez, live bindings 🐛.
- top02-import-dinamico — `import()`, carga diferida, importar desde un CDN (esm.sh) y desde blobs (simular varios archivos en un ejemplo).
- top03-organizar-codigo — dependencias circulares 🐛, barrel files, separación por responsabilidades.
- top04-rutas-import-maps-y-herramientas — cómo se resuelven las rutas, especificadores desnudos 🐛, un 404 rompe el grafo entero 🐛, import maps, módulos JSON (`with { type: 'json' }`), npm y empaquetadores (concepto).

---

## ch06-javascript-en-el-navegador — JavaScript en el navegador

### sec01-el-dom — El DOM
- top01-arbol-de-nodos — `document`, nodos vs elementos, `childNodes` vs `children` 🐛 (nodos de texto con espacios), `nodeType`.
- top02-seleccionar — `getElementById`, `querySelector(All)`, colecciones vivas vs estáticas 🐛, `closest`, `matches`.
- top03-crear-y-modificar — `createElement`, `append/prepend/before/after/replaceWith/remove`, `textContent` vs `innerHTML` (🐛 XSS), `insertAdjacentHTML`, `cloneNode`, `DocumentFragment`, `template`.
- top04-atributos-y-propiedades — atributo vs propiedad (🐛 `input.value` vs `getAttribute('value')`), `dataset`, `classList`, `style` y `getComputedStyle`, `hidden`.
- top05-medidas-y-layout — `getBoundingClientRect`, `offset*/client*/scroll*`, scroll programático, 🐛 layout thrashing (leer/escribir alternando) y cómo agrupar.

### sec02-eventos — Eventos
- top01-escuchar-eventos — `addEventListener`, objeto evento, `removeEventListener` (🐛 con funciones anónimas), opciones `once/passive/signal`.
- top02-propagacion — captura, objetivo, burbuja; `target` vs `currentTarget`; `stopPropagation`; 🐛 eventos que no burbujean (`focus`, usar `focusin`).
- top03-delegacion — un listener para muchos elementos, elementos dinámicos, `closest`.
- top04-acciones-por-defecto — `preventDefault`, enlaces, formularios, teclas, 🐛 listeners pasivos no pueden prevenir.
- top05-teclado-raton-y-puntero — `keydown/keyup` (`key` vs `code`), `click/dblclick/contextmenu`, Pointer Events (unificados), arrastrar con `setPointerCapture`.
- top06-eventos-personalizados — `CustomEvent`, `dispatchEvent`, `EventTarget` propio, comunicación entre componentes.

### sec03-formularios-con-js — Formularios con JavaScript
- top01-leer-y-escribir-controles — `value`, `checked`, `selectedOptions`, `valueAsNumber/valueAsDate`, eventos `input` vs `change`.
- top02-formdata-y-envio — `FormData`, `submit` + `preventDefault`, `requestSubmit` vs `submit` 🐛, serializar a JSON.
- top03-validacion-con-js — Constraint Validation API, mensajes propios, validación en vivo accesible.

### sec04-red-y-almacenamiento — Red y almacenamiento
- top01-fetch — `fetch`, `Response` (`ok`, `status`, `json()`, `text()`, `blob()`), 🐛 fetch no rechaza en 404, errores de red, cabeceras, POST con JSON.
- top02-cors-y-origenes — mismo origen, CORS (por qué falla una petición), qué ve el JS y qué no.
- top03-url-e-historial — `URL`, `URLSearchParams`, `history.pushState`, `popstate`, router mínimo.
- top04-almacenamiento — `localStorage/sessionStorage` (🐛 solo strings), JSON, cookies (a grandes rasgos), IndexedDB (intro), cuotas.
- top05-streams-y-progreso — `ReadableStream`, leer por trozos, progreso de descarga.

### sec05-graficos-y-animacion — Gráficos y animación
- top01-canvas-2d — contexto 2D, rectángulos, paths, arcos, texto, estilos, estado (`save/restore`), transformaciones, alta densidad (`devicePixelRatio`).
- top02-pixeles — `ImageData`, `Uint8ClampedArray`, filtros píxel a píxel (puente a datos binarios y a GPU).
- top03-bucle-de-animacion — rAF, delta time, física simple, partículas.
- top04-svg-con-js — crear SVG con `createElementNS` 🐛, animar atributos, gráficos de datos.
- top05-web-animations-api — `element.animate`, control de reproducción, FLIP.

### sec06-apis-del-navegador — APIs modernas del navegador
- top01-observers — `IntersectionObserver` (lazy load, scroll reveal), `ResizeObserver`, `MutationObserver`.
- top02-web-components — Custom Elements (ciclo de vida), Shadow DOM (encapsulación de estilos, `::part`, `:host`), slots.
- top03-portapapeles-y-arrastre — Clipboard API (permisos), drag and drop nativo, File API (leer archivos).
- top04-media-y-sensores — `matchMedia` en JS, `prefers-reduced-motion` desde JS, Page Visibility, Fullscreen (si la vista previa lo permite).

---

## ch07-typescript — TypeScript

### sec01-fundamentos-de-typescript — Fundamentos
- top01-que-es-typescript — superconjunto de JS, borrado de tipos (🐛 los tipos no existen en ejecución), errores del verificador en LearnWeb (en rojo, pero el código corre igual), `strict`.
- top02-tipos-basicos-e-inferencia — anotaciones, inferencia, primitivos, arrays, tuplas, `any` vs `unknown`, `void`, `never`, `null/undefined` con `strictNullChecks`.
- top03-tipos-de-objeto — tipos literales de objeto, opcionales, `readonly`, `type` vs `interface` (declaration merging), comprobación de propiedades extra 🐛 (solo en literales frescos), tipado estructural.
- top04-uniones-y-estrechamiento — uniones, narrowing (`typeof`, `in`, `instanceof`, igualdad, truthiness), uniones discriminadas, `never` y exhaustividad.
- top05-literales-y-const — tipos literales, `as const`, enums (y alternativas), aserciones (`as`, `!`) y por qué son peligrosas.
- top06-funciones-tipadas — parámetros, retornos, opcionales, sobrecargas, `this`, tipos de función, callbacks.

### sec02-tipos-avanzados — Tipos avanzados
- top01-genericos — funciones/clases genéricas, restricciones (`extends`), defaults, inferencia de genéricos.
- top02-operadores-de-tipo — `keyof`, `typeof` (de tipos), tipos indexados, `satisfies`.
- top03-tipos-mapeados-y-condicionales — mapped types, modificadores, condicionales, `infer`, distributividad 🐛.
- top04-tipos-de-utilidad — `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters`, `Awaited`, `NonNullable`; implementarlos a mano.
- top05-template-literal-types — tipos de plantilla, rutas tipadas, eventos tipados.
- top06-guardas-y-validacion — type predicates (`x is T`), assertion functions, validar `unknown` (JSON) en tiempo de ejecución, tipos con marca (branded).

### sec03-typescript-en-la-practica — TypeScript en la práctica
- top01-clases-en-typescript — modificadores (`public/private/protected` vs `#`), parameter properties, `abstract`, `implements`, `override`.
- top02-dom-tipado — `querySelector<T>`, `HTMLElementTagNameMap`, eventos tipados, `null` del DOM.
- top03-asincronia-tipada — `Promise<T>`, `fetch` + validación, errores tipados (`unknown` en catch).
- top04-modulos-y-declaraciones — módulos en TS, `import type`, archivos `.d.ts` (conceptual), `declare`.

---

## ch08-rumbo-a-webassembly-y-webgpu — Rumbo a WebAssembly y WebGPU

### sec01-datos-binarios — Datos binarios
- top01-bits-y-bytes — binario/hex, operadores bit a bit (🐛 los operandos se convierten a int32), `>>>`, máscaras.
- top02-arraybuffer-y-vistas — `ArrayBuffer`, typed arrays (`Uint8Array`, `Float32Array`…), varias vistas sobre la misma memoria, 🐛 desbordamiento (wrap) vs `Uint8ClampedArray` (satura).
- top03-dataview-y-endianness — `DataView`, little/big endian, leer un formato binario (cabecera BMP/PNG).
- top04-texto-y-binario — `TextEncoder/TextDecoder`, UTF-8 en bytes, `Blob`, `File`, base64.
- top05-float32-y-precision — 🐛 precisión de `Float32Array` vs number, `Math.fround`, por qué la GPU usa float32.

### sec02-workers-y-concurrencia — Workers y concurrencia
- top01-web-workers — crear un worker (desde Blob/asset), `postMessage`, clonado estructurado, 🐛 sin acceso al DOM.
- top02-transferibles — transferir `ArrayBuffer` (🐛 el original queda vacío), `OffscreenCanvas`.
- top03-memoria-compartida — `SharedArrayBuffer` y `Atomics` (concepto; requiere aislamiento cross-origin, se explica por qué).

### sec03-rendimiento — Rendimiento
- top01-medir — `performance.now/mark/measure`, microbenchmarks honestos, JIT y calentamiento 🐛.
- top02-memoria-y-gc — asignaciones en bucles calientes, reutilizar buffers, fugas (listeners, closures, timers).
- top03-render-y-frames — presupuesto de 16,6 ms, long tasks, trocear trabajo, `requestIdleCallback`.

### sec04-graficos-en-la-gpu — Gráficos en la GPU (WebGL y shaders)
- top01-cpu-vs-gpu — paralelismo masivo, pipeline gráfico, qué hace un fragment shader (usar ejemplos `renderer: shader`).
- top02-primer-fragment-shader — coordenadas, uniforms (`u_time`, `u_resolution`, `u_mouse`), formas con SDF, color.
- top03-webgl-desde-js — contexto WebGL2 en un ejemplo normal, buffers (Float32Array → GPU), atributos, uniforms, dibujar un triángulo.
- top04-texturas-y-framebuffers — subir píxeles a la GPU, muestreo, render a textura (intro).

### sec05-webassembly — WebAssembly
- top01-que-es-wasm — formato binario, máquina de pila, módulos/instancias, importaciones/exportaciones, cuándo conviene.
- top02-wasm-a-mano — construir un módulo byte a byte en un `Uint8Array` (cabecera, secciones), `WebAssembly.instantiate`, llamar a `add`.
- top03-memoria-lineal — `WebAssembly.Memory`, leer/escribir la memoria desde JS con typed arrays, pasar strings y arrays.
- top04-js-y-wasm-juntos — importar funciones JS desde wasm, `instantiateStreaming` con un `.wasm` de assets, comparar rendimiento con JS.

### sec06-webgpu — WebGPU
- top01-que-es-webgpu — adaptador, dispositivo, colas, comprobar soporte (`navigator.gpu`), diferencias con WebGL.
- top02-buffers-y-compute — crear buffers, WGSL básico, un compute shader que duplica un array, leer el resultado (`mapAsync`).
- top03-pipeline-de-render — el triángulo en WebGPU: shader de vértices/fragmentos en WGSL, pipeline, render pass.
- top04-mapa-del-siguiente-paso — qué estudiar después (Rust/C → wasm, Emscripten, wgpu, libros/recursos).

---

## Ritmo y tamaños orientativos
- Lección: `main.md` de 150-400 líneas + 5-10 ejemplos atómicos.
- `top90-integracion`: 5-10 ejemplos + 2-4 ejercicios (con su `-solucion.md`).
- `top95-profesional`: 10-15 ejemplos grandes.
