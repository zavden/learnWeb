# Metodologías

## Por qué importa

En CSS todo es **global**: cada regla compite con todas las demás de la página, vengan del archivo que vengan. Con diez reglas no hay nada que organizar. Con cinco mil, tres personas y una librería ajena, aparecen los dos males clásicos: los **nombres que chocan** (dos componentes con su `.title`) y la **guerra de especificidad** (cada arreglo usa un selector más pesado que el anterior, hasta que alguien escribe `!important`, y luego otro `!important` para ganar a ese).

Las **metodologías** son convenciones para que eso no pase: cómo nombrar las clases (BEM), cómo repartir el CSS (componentes y utilidades), cuánto pesa cada selector (poco, y siempre lo mismo) y en qué orden gana cada grupo de reglas (capas). No las impone el navegador: las sigue el equipo. La lección siguiente añade una herramienta del propio lenguaje para el primer problema, `@scope`.

## Dos problemas de un CSS global

```css
.title { font-size: 2rem; }                  /* el título de la portada… */
.card .title { font-size: 1rem; }            /* …y el de las tarjetas: más peso para ganar */
.sidebar .card .title { font-size: 0.9rem; } /* más peso todavía */
#checkout .title { font-size: 1.1rem; }      /* un id: ya nadie le gana */
.promo-title { font-size: 1.5rem !important; } /* el último recurso */
```

Cada línea arregla un caso y empeora el siguiente. La salida no es un selector más fuerte, sino que **todos pesen lo mismo** y que el orden entre grupos lo decida algo que no sea la especificidad.

## BEM: bloque, elemento, modificador

**BEM** es la convención de nombres más extendida. Cada clase dice a qué componente pertenece:

- **Bloque**: un componente con sentido propio. `.product-card`.
- **Elemento**: una pieza que solo existe dentro de su bloque, con dos guiones bajos. `.product-card__title`, `.product-card__price`.
- **Modificador**: una variante o un estado, con dos guiones. `.product-card--featured`, `.product-card--sold-out`. Va **siempre junto** a la clase del bloque (`class="product-card product-card--sold-out"`): la base viene de una clase y el cambio, de la otra.

[[exercise:01-bem-en-una-tarjeta.md]]

Lo que hace funcionar a BEM no es la sintaxis, sino su consecuencia: **todos los selectores son de una clase**, (0,1,0). Nada pesa más que nada, y los nombres no chocan porque cada uno lleva el de su bloque. Tres reglas que se olvidan a menudo:

- **No hay elementos de elementos.** El título de la cabecera de la tarjeta es `.product-card__title`, no `.product-card__header__title`: el nombre dice a qué bloque pertenece, no dónde está en el HTML.
- **Si una pieza tiene sentido fuera del bloque, es otro bloque.** Un botón dentro de una tarjeta es `.button`, no `.product-card__button`.
- **Las reglas de dos clases, solo en dos casos**: un modificador que cambia un elemento (`.product-card--sold-out .product-card__price`) y una clase de estado pegada al bloque (`.product-card.is-loading`, en el apartado siguiente).

Si escribes el CSS con Sass, `&__title` y `&--featured` generan estos nombres solos. En CSS nativo se escriben enteros (lo viste en la lección anterior).

## Componentes y estados

La mayor parte del CSS de un proyecto son **clases de componente**: una por pieza de la interfaz, con sus elementos y modificadores. Lo que cambia con el tiempo (pulsado, abierto, con error, cargando) son **estados**, y tienen su propia convención:

- **Si el estado ya existe en el HTML, estila ese atributo.** `aria-pressed`, `aria-expanded`, `aria-current`, `aria-invalid`, `disabled`, `open`, `:checked`… El lector de pantalla los necesita de todos modos, y así hay una sola fuente de verdad: una clase `.is-active` al lado podría quedar desincronizada.
- **Si no existe, una clase con prefijo**: `is-` para estados (`.is-loading`, `.is-open`) y `has-` para «contiene algo» (`.has-error`). Hoy, muchas de estas últimas las resuelve `:has()`.

[[exercise:02-estados-con-atributos.md]]

## Utilidades

Una **utilidad** es una clase con un solo propósito que se puede poner en cualquier elemento. Las más útiles no son las de «un color» o «un margen», sino las que resuelven un problema que se repite:

| Utilidad | Para qué |
|---|---|
| `.visually-hidden` | texto que no se ve pero lee el lector de pantalla (botones de icono, etiquetas, avisos) |
| `.flow > * + *` | espacio vertical entre hermanos de un texto largo: cada elemento que sigue a otro recibe margen arriba |
| `.stack` | una columna con hueco uniforme (`flex-direction: column` y `gap`) |
| `.cluster` | una fila que se reparte en varias líneas: etiquetas, botones, iconos |

`.visually-hidden` merece una explicación línea a línea: `position: absolute` la saca del flujo, para que no empuje nada; `width` y `height` de 1px y `overflow: hidden` la reducen a un punto; `clip-path: inset(50%)` recorta ese punto hasta que no queda nada visible; y `white-space: nowrap` evita que el texto, apretado en 1px, se parta en una palabra por línea (algunos lectores de pantalla las leerían separadas). No sirve `display: none` ni `visibility: hidden`: esos ocultan el texto también al lector de pantalla.

[[exercise:03-utilidades.md]]

`* + *` es el **selector búho** (parece una cara): «cada elemento que va justo después de otro». El primero no recibe margen, así que no empuja a su contenedor. Y las tres utilidades de espacio leen una custom property con respaldo (`var(--flow-space, 1em)`), para ajustar el hueco sin crear otra clase.

Hay proyectos que llevan la idea al extremo, *utility-first*: casi todo el diseño son utilidades en el HTML (`class="flex gap-2 p-4 rounded bg-green-700"`), como hace la librería Tailwind. Es otra forma de equilibrar las cosas: menos CSS que mantener, HTML más cargado. Este curso usa componentes y un puñado de utilidades, pero las capas de esta lección valen para los dos estilos.

## La guerra de especificidad

Una utilidad debería ganar siempre: si alguien escribe `class="text-accent"`, quiere ese color. Pero si el componente usa un selector más pesado, como `.site-footer a` (0,1,1), la utilidad (0,1,0) pierde. Durante años, la respuesta fue escribir las utilidades con `!important`. Con capas no hace falta: entre capas **no cuenta la especificidad**, y lo de `utilities` gana a todo lo de `components`.

[[exercise:04-la-utilidad-que-pierde.md]]

## `:where()`: estilos base de especificidad cero

En el módulo de fundamentos viste que `:where()` no suma especificidad: `:where(.prose) a` pesa lo mismo que `a`, (0,0,1). Es la herramienta para los **estilos base**, los valores por defecto que cualquier componente debe poder pisar con una clase:

[[exercise:05-where-especificidad-cero.md]]

Úsalo para los estilos de un texto largo (`:where(.prose) a`, `:where(.prose) h2`), para los selectores de atributo de un reset (`:where(ul, ol)[role="list"]`) y, en general, para cualquier regla «de fondo» que lleve una clase solo para limitar dónde se aplica. Ya lo usaste en el ejercicio de la lista de precios del módulo de tipografía.

## Las capas del proyecto

En el módulo de fundamentos viste cómo funcionan las capas, y casi todos los ejemplos profesionales del curso las usan. Aquí está el esquema completo y el papel de cada una:

```css
@layer reset, vendor, tokens, base, layout, components, utilities, print;
```

| Capa | Qué va | Selectores típicos |
|---|---|---|
| `reset` | neutralizar la hoja del navegador (lección 5) | `*`, etiquetas |
| `vendor` | CSS de librerías ajenas | los suyos |
| `tokens` | las custom properties del diseño (lección 4) | `:root` |
| `base` | los valores por defecto de cada etiqueta | etiquetas, `:where()` |
| `layout` | el esqueleto de la página | una clase |
| `components` | los componentes | una clase (BEM) |
| `utilities` | las utilidades | una clase |
| `print` | la hoja de impresión (lección 5) | `@media print` dentro |

No hace falta usarlas todas: un proyecto pequeño vive bien con `reset, base, components, utilities`. Lo importante es declarar el orden **en una sola línea, al principio**, y que todo el CSS esté en alguna capa. A partir de ahí, el orden de los bloques en el archivo da igual:

[[exercise:06-capas-del-proyecto.md]]

Dentro de cada capa, los selectores pueden ser sencillos, porque solo compiten con los de su capa. Las capas resuelven el «quién gana a quién»; BEM y `:where()`, el «cuánto pesa cada regla» dentro de una capa.

## Lo que no tiene capa gana a todo

Las reglas sin capa forman una capa implícita que va la **última**, por encima de todas. Un parche pegado al final del archivo, o el CSS de un widget que se carga sin capa, gana a todos tus componentes aunque use selectores débiles:

[[exercise:07-el-parche-sin-capa.md]]

La solución es meter ese CSS en una capa baja: un bloque `@layer vendor { … }` o, si es un archivo, `@import url("widget.css") layer(vendor);`.

## `!important` invierte las capas

La otra regla de la lección de cascada que conviene tener presente: para las declaraciones `!important`, el orden de las capas **se invierte**. Gana la capa más temprana, y lo que no tiene capa es lo más débil.

```text
normales:    reset < vendor < base < components < utilities < (sin capa)
!important:  (sin capa) < utilities < components < base < vendor < reset
```

Por eso, al meter una librería en una capa baja, sus `!important` pasan a ser los más fuertes de todo el proyecto, y ningún `!important` tuyo en una capa posterior les gana:

[[exercise:08-important-al-reves.md]]

La inversión no es un error del diseño de las capas, sino su propósito: permite que una capa baja **proteja** algo que no debe romperse. Un reset puede asegurar con `!important` que `[hidden]` oculte siempre, o que el movimiento se reduzca cuando el usuario lo pide (lo verás en la lección 5), y ninguna capa posterior podrá deshacerlo por accidente. La consecuencia práctica: **las utilidades no llevan `!important`** (no lo necesitan: van en la última capa), y `!important` queda para esas pocas protecciones en las capas bajas.

## Convenciones de nombres

| Patrón | Significa | Ejemplo |
|---|---|---|
| `bloque__elemento--modificador` | BEM | `.product-card__price`, `.product-card--sold-out` |
| `is-…`, `has-…` | estado | `.is-loading`, `.has-error` |
| `u-…` | utilidad | `.u-center` |
| `l-…` | pieza del layout de la página | `.l-sidebar` |
| `js-…` | gancho para JavaScript: sin estilos nunca | `.js-open-cart` |
| `--categoría-propiedad-variante` | token (lección 4) | `--color-text-muted`, `--space-m` |

BEM no es la única metodología. **OOCSS** separó la estructura del aspecto; **SMACSS** clasificó las reglas en base, layout, módulos, estados y temas; **ITCSS** ordenó el CSS de lo más genérico a lo más específico, un triángulo que las capas convierten en una línea de CSS; **CUBE CSS** combina composición, utilidades, bloques y excepciones (con atributos `data-*`). Todas buscan lo mismo: especificidad baja y uniforme, y un orden predecible. Elige una, escríbela en el README del proyecto y respétala.

## Cómo verlo en DevTools

- **Elements → Styles** agrupa las reglas de cada capa bajo un encabezado `@layer nombre`, ordenadas de la que gana a la que pierde.
- El botón **de capas** del panel Styles (el icono de capas apiladas, junto a `:hov` y `.cls`) muestra el orden de todas las capas del documento.
- Pasa el ratón por un selector para ver su **especificidad**. Si una regla tachada pierde contra otra de menos especificidad, la razón está en las capas o en `!important`.

## Bestiario

- **La utilidad no se aplica.** Síntoma: `class="text-accent"` no cambia el color de un enlace. Causa: el componente usa un selector más pesado (`.site-footer a`, 0,1,1) y la utilidad (0,1,0) pierde. Solución: componentes y utilidades en capas, `utilities` la última; nada de `!important`. → [ver ejemplo](04-la-utilidad-que-pierde.md)
- **Un parche o un widget gana a todos tus componentes.** Síntoma: tras añadir el CSS de un widget, tus botones cambian de aspecto aunque los selectores del widget sean débiles. Causa: lo que no tiene capa va por encima de todas las capas. Solución: mete ese CSS en una capa baja (`@layer vendor`, `@import … layer(vendor)`). → [ver ejemplo](07-el-parche-sin-capa.md)
- **Tu `!important` pierde contra el de una librería.** Síntoma: con la librería en `@layer vendor`, ningún `!important` tuyo le gana. Causa: con `!important`, el orden de las capas se invierte y gana la más temprana. Solución: los arreglos, con `!important`, en una capa declarada antes de `vendor`; o mejor, configurar la librería sin pelear con ella. → [ver ejemplo](08-important-al-reves.md)

## Resumen

- CSS es global: sin convenciones, los nombres chocan y la especificidad crece hasta `!important`.
- BEM: `bloque__elemento--modificador`, todo en selectores de una clase; los modificadores van junto al bloque; no hay elementos de elementos.
- Estados: el atributo que ya existe (`aria-pressed`, `disabled`…) o una clase `is-`/`has-`.
- Utilidades de un solo propósito (`.visually-hidden`, `.flow`, `.stack`, `.cluster`), configurables con custom properties.
- `:where()` para estilos base de especificidad cero.
- Capas: el orden en una línea al principio, todo el CSS dentro de alguna; lo que no tiene capa gana a todo; con `!important`, el orden se invierte.

## Para profundizar

- [BEM: introducción oficial](https://getbem.com/introduction/)
- [CSS-Tricks: A Complete Guide to CSS Cascade Layers](https://css-tricks.com/css-cascade-layers/)
- [MDN: :where()](https://developer.mozilla.org/es/docs/Web/CSS/:where)
- [Every Layout: Stack y Cluster](https://every-layout.dev/layouts/stack/)
- [CUBE CSS](https://cube.fyi/)
