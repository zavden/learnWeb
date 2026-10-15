# Funciones y módulos

## Por qué importa

Los mixins reutilizan bloques de declaraciones; las **funciones** reutilizan cálculos: convertir píxeles a `rem`, sacar el color de hover a partir del de marca, leer un valor de una escala. Sass trae además una biblioteca de funciones organizada en **módulos** (`sass:math`, `sass:color`, `sass:list`, `sass:map`, `sass:string`), que se cargan con `@use`. Esta lección te enseña a escribir funciones, a usar los módulos y a esquivar tres sorpresas: la barra `/` que ya no divide, los índices que empiezan en 1 y las funciones «de toda la vida» que Dart Sass marca como obsoletas.

## Escribir funciones: `@function` y `@return`

Una función se define con `@function`, recibe argumentos y devuelve **un valor** con `@return`. Se usa donde iría cualquier valor:

[[exercise:01-function-y-return.md-(styles.scss|compiled.css)]]

[[exercise:01-function-y-return.md]]

> **Desde Python:** `@function space($step) { @return $step * 4px; }` es `def space(step): return step * 4`, con la unidad incluida. Los argumentos admiten lo mismo que en los mixins: valores por defecto, argumentos por nombre y `$args...`.

| | `@mixin` | `@function` |
|---|---|---|
| Qué produce | declaraciones (y reglas) | un valor |
| Cómo se usa | `@include nombre(…);` | `propiedad: nombre(…);` |
| Ejemplo típico | `@include truncate;` | `padding: space(4);` |

## El sistema de módulos: `@use`

Las funciones integradas de Sass viven en **módulos**. Para usar uno, se carga con `@use` al principio del archivo, y sus funciones se llaman con el nombre del módulo delante (su **espacio de nombres**):

```scss
@use "sass:math";

.meter__fill {
  width: math.percentage(math.div(3, 8));   // → 37.5%
}
```

[[exercise:02-modulo-math.md-(styles.scss|compiled.css)]]

[[exercise:02-modulo-math.md]]

Tres reglas del sistema de módulos:

- `@use` tiene que ir **antes** que cualquier otra regla del archivo (solo pueden ir antes variables y comentarios). Si no, Sass se detiene con «@use rules must be written before any other rules».
- El espacio de nombres se puede cambiar: `@use "sass:math" as m;` permite escribir `m.div(…)`. Con `as *` las funciones se usan sin prefijo (`div(…)`), pero entonces ya no se sabe de dónde viene cada una; úsalo poco.
- Cada módulo se carga una vez aunque lo uses en muchos sitios.

Los módulos integrados que más usarás:

| Módulo | Para qué | Funciones habituales |
|---|---|---|
| `sass:math` | números y unidades | `div`, `percentage`, `round`, `floor`, `ceil`, `clamp`, `max`, `min`, `pow`, `unit` |
| `sass:color` | derivar colores | `adjust`, `scale`, `mix`, `change`, `channel` |
| `sass:list` | listas | `nth`, `length`, `append`, `join`, `index` |
| `sass:map` | mapas | `get`, `merge`, `has-key`, `keys`, `values`, `set`, `remove` |
| `sass:string` | cadenas | `slice`, `index`, `length`, `unquote`, `to-upper-case` |
| `sass:meta` | inspeccionar valores | `type-of`, `inspect` (lección de depuración) |

> **Desde Python:** `@use "sass:math";` es `import math`, y `math.div(…)` es `math.something(…)`. `@use "sass:math" as m;` es `import math as m`, y `as *` es `from math import *`, con los mismos inconvenientes.

## La barra ya no divide

En las primeras versiones de Sass, `/` dividía. Pero en CSS la barra es un **separador**: `font: 16px/1.5`, `grid-area: 1 / 3`, `aspect-ratio: 16 / 9`, `rgb(0 0 0 / 0.2)`. Esa doble vida daba resultados imprevisibles, así que Sass la está retirando como operador de división:

[[exercise:03-la-barra-no-divide.md-(styles.scss|compiled.css|sass-output.txt)]]

[[exercise:03-la-barra-no-divide.md]]

- Con dos números escritos a mano (`32px/2`), Sass deja la barra como separador de CSS. El resultado, `padding: 32px/2`, es inválido y el navegador lo descarta **en silencio**.
- Con variables (`$width / 3`), Sass todavía divide, pero imprime un aviso de deprecación: dejará de hacerlo en Dart Sass 2.0.
- La solución: `math.div($a, $b)` para dividir en Sass, o `calc($a / $b)` si prefieres que lo haga el navegador (Sass simplifica el `calc()` cuando puede).

## Números y unidades

Sass lleva la cuenta de las unidades en cada operación. Suma las compatibles (y convierte entre unidades absolutas, como `in` y `px`), cancela las que se dividen entre sí y se niega a mezclar unidades cuyo valor depende de la página, como `rem` y `px`:

[[exercise:04-unidades.md-(styles.scss|sass-output.txt|compiled.css)]]

```text
styles.scss:6 @debug: 32px
styles.scss:7 @debug: 20px
styles.scss:8 @debug: 102px
styles.scss:9 @debug: 1.2s
styles.scss:10 @debug: 1.5
styles.scss:11 @debug: 1.5px
styles.scss:12 @debug: rem
styles.scss:13 @debug: false
```

`@debug` imprime un valor en `sass-output.txt`, con el archivo y la línea, como un `print()`. Lo verás a fondo en la lección de depuración, pero ya puedes usarlo para comprobar cualquier cuenta. La conversión más útil es la de la última regla: `math.div(24px, 16px)` da `1.5`, **sin unidad**, justo lo que pide un buen `line-height`.

[[exercise:04-unidades.md]]

## Colores: `sass:color`

El módulo `sass:color` deriva colores nuevos a partir de uno, al compilar. Así, el color del hover, el fondo suave de un aviso o un borde semitransparente salen todos del color de marca:

[[exercise:05-modulo-color.md]]

[[exercise:05-modulo-color.md-(styles.scss|compiled.css)]]

| Función | Qué hace | Ejemplo |
|---|---|---|
| `color.scale($c, $lightness: -25%)` | acerca un canal a su límite en un porcentaje de lo que le queda | un hover más oscuro |
| `color.adjust($c, $lightness: -10%)` | suma o resta una cantidad fija a un canal | el antiguo `darken()` |
| `color.mix($a, $b, 20%)` | mezcla dos colores | un fondo suave |
| `color.change($c, $alpha: 0.15)` | fija un canal a un valor | una versión transparente |
| `color.channel($c, "lightness", $space: hsl)` | lee un canal | decisiones con `@if` |

`color.scale` suele dar mejores resultados que `color.adjust`: oscurecer un 25 % «de lo que queda» funciona igual con un color claro que con uno oscuro, mientras que restar un 10 % fijo a un color ya oscuro lo deja casi negro. Recuerda que todo esto ocurre **al compilar**: para un color que deba cambiar en el navegador, `color-mix()` de CSS hace lo mismo en vivo.

## Funciones globales deprecadas

En tutoriales y proyectos antiguos verás `darken($c, 10%)`, `lighten()`, `map-get()` o `percentage()`, sin `@use` y sin espacio de nombres. Son las **funciones globales** del Sass anterior a los módulos. Todavía funcionan, pero Dart Sass imprime un aviso por cada uso: se eliminarán en Dart Sass 3.0.

[[exercise:06-funciones-globales-deprecadas.md-(styles.scss|sass-output.txt)]]

La equivalencia es directa: `darken($c, 10%)` es `color.adjust($c, $lightness: -10%)`, `map-get($m, k)` es `map.get($m, k)`, `percentage(x)` es `math.percentage(x)`. El equipo de Sass mantiene un programa que hace la migración automáticamente (`npx sass-migrator module`), y el propio aviso enlaza su documentación.

[[exercise:06-funciones-globales-deprecadas.md]]

Con `@import` pasa lo mismo: era la forma antigua de cargar otros archivos de Sass y también está deprecado. La sustituye `@use`, que verás al final de esta lección.

## Listas y cadenas: se cuenta desde 1

Una **lista** de Sass es una secuencia de valores separados por espacios o por comas: `4px 8px 16px`, o `system-ui, sans-serif`. Muchos valores de CSS ya son listas (`margin: 0 auto`). El módulo `sass:list` las recorre y las modifica, y aquí está la sorpresa para quien viene de Python: **el primer elemento es el 1**.

[[exercise:07-listas-desde-1.md]]

[[exercise:07-listas-desde-1.md-(styles.scss|compiled.css)]]

| | Python | Sass |
|---|---|---|
| Primer elemento | `steps[0]` | `list.nth($steps, 1)` |
| Último | `steps[-1]` | `list.nth($steps, -1)` |
| Índice 0 | el primero | error: «List index may not be 0» |
| Trozo de cadena | `"Huerta"[1:3]` → `"ue"` | `string.slice("Huerta", 1, 3)` → `"Hue"` (incluye los dos extremos) |
| Posición de un elemento | `steps.index(8)` → `1` | `list.index($steps, 8px)` → `2` |

Las listas y los mapas de Sass son **inmutables**: `list.append($l, 64px)` no cambia `$l`, sino que devuelve una lista nueva. Para «modificarla», reasigna: `$l: list.append($l, 64px);`.

## Mapas

Un **mapa** es una colección de pares clave–valor entre paréntesis: el diccionario de Sass. Es la estructura ideal para paletas, escalas y breakpoints:

[[exercise:08-mapas.md-(styles.scss|compiled.css)]]

[[exercise:08-mapas.md]]

> **Desde Python:** `(brand: #15803d, text: #1e293b)` es `{"brand": "#15803d", "text": "#1e293b"}`. `map.get($m, brand)` es `m.get("brand")`, y como él devuelve «nada» (`null`) si la clave no existe, sin error. `map.merge($a, $b)` es `{**a, **b}`, y `map.get($theme, radius, lg)` es `theme["radius"]["lg"]`.

Fíjate en el mixin `from(md)`: con el mapa de breakpoints, los componentes piden un tamaño **por nombre**. Si alguien escribe `from(xl)` y esa clave no existe, `map.get` devuelve `null` y la media query sale mal sin ningún error; en la lección de depuración harás que el mixin lo detecte y avise.

En la próxima lección, de control de flujo, recorrerás listas y mapas con `@each` para generar clases.

## Tus propios módulos: parciales, `@use` y `@forward`

En un proyecto real, el código Sass se reparte en muchos archivos: los tokens de diseño, los mixins, un archivo por componente. Los ejemplos de LearnWeb son de un solo bloque y no pueden cargar otros archivos (un `@use "tokens"` daría «Can't find stylesheet to import»), pero así es como se organiza un proyecto:

```text
scss/
├── abstracts/
│   ├── _tokens.scss      ← variables y mapas ($brand, $breakpoints…)
│   ├── _mixins.scss      ← mixins y funciones
│   └── _index.scss       ← @forward de los dos anteriores
├── components/
│   ├── _button.scss
│   └── _card.scss
└── main.scss             ← el único que se compila
```

- Un archivo cuyo nombre empieza por `_` es un **parcial**: no se compila por separado, solo existe para que otros lo carguen. Al cargarlo no se escribe ni el `_` ni la extensión.
- `@use "abstracts/tokens";` carga el módulo. Sus miembros se usan con el nombre del archivo como espacio de nombres: `tokens.$brand`, `tokens.space(4)`, `@include tokens.from(md)`.
- `@use "abstracts/tokens" with ($brand: #7c3aed);` **configura** el módulo al cargarlo: sustituye los valores de sus variables `!default` (lo viste en la lección de variables).
- Las variables, funciones y mixins cuyo nombre empieza por `-` o `_` son **privados**: no se pueden usar desde fuera del módulo.
- `@forward "tokens";` reexporta lo de otro módulo. Un `_index.scss` con varios `@forward` permite cargar toda una carpeta con un solo `@use "abstracts";`.
- Si un módulo genera CSS (reglas), ese CSS aparece **una sola vez** en el resultado, aunque lo carguen veinte archivos.

```scss
// components/_button.scss
@use "../abstracts" as a;

.btn {
  padding: a.space(2) a.space(4);
  background: a.$brand;

  @include a.from(md) {
    padding-inline: a.space(6);
  }
}
```

```scss
// main.scss: el punto de entrada
@use "components/button";
@use "components/card";
```

Y en la terminal se compila solo el punto de entrada: `npx sass scss/main.scss dist/main.css --watch`.

> **Desde Python:** el sistema es casi idéntico al de los paquetes de Python. `@use "tokens"` es `import tokens` (y luego `tokens.brand`), `as a` es `import … as a`, un `_index.scss` con `@forward` es un `__init__.py` que reexporta, y los nombres con `_` delante son privados por convención… salvo que en Sass la privacidad es real.

¿Por qué se abandonó `@import`? Porque metía todas las variables, mixins y funciones en **un único espacio global** (dos librerías con un `$primary` se pisaban), cargaba varias veces el mismo archivo si varios lo importaban (y duplicaba su CSS) y no dejaba claro de dónde venía cada cosa. `@use` resuelve los tres problemas.

## Bestiario

- **`/` no divide (o divide con aviso).** *Síntoma:* `padding: 32px/2` no aplica ningún padding, o `$width / 3` llena `sass-output.txt` de avisos «Using / for division … is deprecated». *Causa:* en CSS la barra es un separador (`font: 16px/1.5`); Sass la deja como tal entre números literales y la está retirando como división. *Solución:* `math.div($a, $b)` (con `@use "sass:math"`) o `calc($a / $b)`. [Ver ejemplo](03-la-barra-no-divide.md).
- **`darken()`, `map-get()` y compañía llenan la salida de avisos.** *Síntoma:* el CSS se genera bien, pero cada uso imprime «Global built-in functions are deprecated and will be removed in Dart Sass 3.0.0». *Causa:* son las funciones globales anteriores al sistema de módulos; desaparecerán. *Solución:* carga los módulos con `@use` y usa `color.adjust`/`color.scale`, `map.get`, `math.percentage`; para proyectos grandes, `npx sass-migrator module`. [Ver ejemplo](06-funciones-globales-deprecadas.md).
- **`list.nth($l, 1)` devuelve el primero, no el segundo.** *Síntoma:* recibes el valor anterior al que esperabas, o un error «List index may not be 0». *Causa:* en Sass, listas y cadenas empiezan en 1, y `string.slice` incluye los dos extremos. *Solución:* cuenta desde 1; para el último, `-1`, como en Python. [Ver ejemplo](07-listas-desde-1.md).

## Resumen

- `@function` + `@return` devuelven un valor; se usan dentro de las declaraciones. Los mixins devuelven declaraciones.
- `@use "sass:modulo";` carga un módulo integrado; sus funciones se llaman con el espacio de nombres (`math.div`). `@use` va antes que cualquier regla.
- Para dividir, `math.div()` o `calc()`: la barra es un separador de CSS.
- Sass opera con unidades: suma las compatibles, cancela `px ÷ px` y no mezcla `rem` con `px`.
- `sass:color` deriva colores al compilar (`scale`, `adjust`, `mix`, `change`); `color-mix()` lo hace en el navegador.
- Las funciones globales (`darken`, `map-get`…) y `@import` están deprecadas: módulos y `@use`.
- Listas y cadenas empiezan en 1; los mapas son diccionarios inmutables (`map.get`, `map.merge`).
- En proyectos reales: parciales `_archivo.scss`, `@use` con espacio de nombres, `with (…)` para configurar y `@forward` para reexportar.

## Para profundizar

- [Sass: @function](https://sass-lang.com/documentation/at-rules/function/)
- [Sass: Built-In Modules](https://sass-lang.com/documentation/modules/)
- [Sass: Breaking Change: Slash as Division](https://sass-lang.com/documentation/breaking-changes/slash-div/)
- [Sass: @use](https://sass-lang.com/documentation/at-rules/use/) y [@forward](https://sass-lang.com/documentation/at-rules/forward/)
- [Sass blog: The Module System is Launched](https://sass-lang.com/blog/the-module-system-is-launched/)
