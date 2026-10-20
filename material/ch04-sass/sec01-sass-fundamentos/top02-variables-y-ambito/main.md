# Variables y ámbito

## Por qué importa

Las variables fueron la primera razón para usar Sass: dar nombre al color de marca, al radio de las esquinas o al espaciado base, y escribirlos una sola vez. Hoy CSS también tiene variables, las custom properties, y aquí está la trampa: se parecen mucho, pero funcionan en **momentos distintos**. Las variables de Sass existen solo mientras se compila; las custom properties viven en el navegador. Entender esa diferencia te evitará el error más habitual de quien empieza con Sass: intentar cambiar una variable `$` con un tema o con un `:hover`.

## Declarar y usar

Una variable de Sass empieza por `$` y se declara con la misma forma que una propiedad: nombre, dos puntos, valor y punto y coma. Se usa escribiendo su nombre donde iría el valor:

```scss
$brand: #15803d;

.plan-cta {
  background: $brand;   // en el CSS generado: background: #15803d;
}
```

[[exercise:01-declarar-y-usar.md]]

[[exercise:01-declarar-y-usar.md-(styles.scss|compiled.css)]]

Al compilar, Sass sustituye cada variable por su valor y la variable desaparece: en el CSS generado no queda ni rastro de `$brand`. Sass distingue estos tipos de valor:

| Tipo | Ejemplos | Notas |
|---|---|---|
| Número | `12px`, `1.5`, `50%`, `2rem` | con o sin unidad; Sass opera con ellos |
| Cadena | `"Versión 2.3"`, `bold`, `sans-serif` | con comillas o sin ellas |
| Color | `#15803d`, `rgb(21 128 61)`, `oklch(55% 0.15 150)` | |
| Lista | `system-ui, sans-serif`, `8px 16px` | separada por comas o por espacios |
| Mapa | `(sm: 4px, md: 8px)` | lo verás en la lección de funciones y módulos |
| Booleano | `true`, `false` | para `@if` (lección de control de flujo) |
| Nulo | `null` | el valor «nada» |

Un detalle curioso: para Sass, el guion y el guion bajo son el mismo carácter en los nombres. `$line-height` y `$line_height` son **la misma** variable (es una herencia de los primeros tiempos de Sass).

> **Desde Python:** `$brand: #15803d;` es como `brand = "#15803d"`, con `$` en el nombre y `:` en lugar de `=`. Puedes reasignar una variable cuantas veces quieras; cada uso toma el valor que tenga **en ese punto del archivo**, porque Sass lo recorre de arriba abajo, igual que el intérprete de Python recorre un script.

## Ámbito: global y local

Una variable declarada fuera de cualquier bloque es **global**: se puede usar en todo el archivo a partir de esa línea. Una variable declarada dentro de unas llaves (una regla, un mixin, una función) es **local**: solo existe dentro de esas llaves. Si una local se llama igual que una global, la **tapa** dentro del bloque sin modificarla (se dice que la *sombrea*):

[[exercise:02-ambito-de-bloque.md-(styles.scss|compiled.css)]]

[[exercise:02-ambito-de-bloque.md]]

> **Desde Python:** en Python solo las funciones crean un ámbito nuevo; un `if` o un `for` no. En Sass, **cualquier regla** con llaves crea un ámbito, como en JavaScript con `let` (lo verás en su capítulo). La excepción son los bloques de control de flujo (`@if`, `@each`, `@for`): una asignación dentro de ellos a una variable que ya existe fuera **cambia** la de fuera. Lo verás en la lección de control de flujo.

### `!global`

Para cambiar una variable global desde dentro de un bloque, se añade la marca `!global` a la asignación:

[[exercise:03-global.md-(styles.scss|compiled.css)]]

[[exercise:03-global.md]]

Fíjate en que `.before` no cambia: Sass recorre el archivo de arriba abajo **una sola vez**, y cuando llega al bloque con `!global` ya ha generado las reglas anteriores. Es el equivalente a la sentencia `global` de Python, y tiene la misma mala fama: si cualquier bloque puede cambiar una variable global, para saber cuánto vale tienes que leer todo el archivo. Úsala poco.

## Valores por defecto: `!default`

La marca `!default` asigna un valor **solo si la variable no existe todavía o vale `null`**. Es la forma en que las librerías de Sass (Bootstrap, por ejemplo) ofrecen valores configurables: la librería declara `$btn-bg: #2563eb !default;` y tú, si quieres otro color, declaras `$btn-bg` **antes** de cargarla.

[[exercise:04-default.md-(styles.scss|compiled.css)]]

[[exercise:04-default.md]]

> **Desde Python:** `$x: valor !default;` equivale a `if globals().get("x") is None: x = valor`, o, si piensas en diccionarios, a `config.setdefault("x", valor)`: solo escribe si no había nada.

En un proyecto real, la librería está en su propio archivo y se configura al cargarla con `@use "buttons" with ($btn-bg: #7c3aed);`. Lo verás en la lección de funciones y módulos; el mecanismo que hay debajo es este `!default`.

## Interpolación: `#{}`

Una variable se puede usar directamente como **valor** de una propiedad. Pero si quieres meterla **dentro de un nombre** (de una clase, de una propiedad) o de una cadena de texto, Sass necesita que se lo indiques con la **interpolación** `#{…}`: evalúa lo que hay dentro y pega el resultado como texto.

[[exercise:05-interpolacion.md-(styles.scss|compiled.css)]]

| Dónde | Ejemplo | Resultado |
|---|---|---|
| Selector | `.tag-#{$name}` | `.tag-new` |
| Nombre de propiedad | `padding-#{$side}: 12px` | `padding-left: 12px` |
| Dentro de una cadena | `"versión #{$version}"` | `"versión 2.3"` |
| Media query | `(width >= #{$bp})` | `(width >= 30rem)`; aquí `$bp` sin interpolar también funciona |
| Custom property | `--brand: #{$brand}` | `--brand: #15803d` (obligatoria; ver más abajo) |

> **Desde Python:** `#{}` es el `{}` de las f-strings: `f"tag-{name}"` es `tag-#{$name}`. Y, como en Python, dentro de las llaves puede ir cualquier expresión: `#{$space * 2}`.

[[exercise:05-interpolacion.md]]

En valores normales no hace falta: `padding: $space` funciona sin `#{}`. Tampoco dentro de `calc()`, porque Sass entiende `calc()` y sustituye las variables que encuentre: `calc(100% - $sidebar)` es correcto.

## Variables Sass frente a custom properties

Esta es la idea más importante de la lección. Las dos clases de variables se parecen, pero existen en momentos distintos:

| | Variable Sass (`$brand`) | Custom property (`--brand`) |
|---|---|---|
| Cuándo existe | solo al compilar | en el navegador, mientras la página está abierta |
| En el CSS generado | no aparece: se sustituye por su valor | aparece tal cual |
| Ámbito | léxico: el bloque donde se declara | el elemento y sus descendientes (herencia) |
| Puede cambiar con `:hover`, un tema o `:has()` | no | sí |
| Puede cambiar con JavaScript | no | sí |
| Sirve en una condición de `@media` | sí | no |
| Sirve para nombres de clases o propiedades | sí, con `#{}` | no |

El error típico es querer un tema oscuro o un estado `:hover` cambiando variables Sass. Parece razonable, pero cuando el navegador marca la casilla o detecta el ratón, Sass terminó hace mucho y no queda ninguna variable que cambiar:

[[exercise:06-sass-no-cambia-en-el-navegador.md]]

[[exercise:06-sass-no-cambia-en-el-navegador.md-(styles.scss|compiled.css)]]

Mira el CSS generado: las reglas que solo declaraban variables Sass (`body:has(#dark-theme:checked) .sass-card` y `.sass-card .btn:hover`) **no existen**. Una regla que no tiene ninguna declaración CSS no produce nada. Las de la tarjeta con custom properties sí están, y son las que el navegador aplica en cuanto cambia el estado.

> **Desde Python:** es la misma diferencia que hay entre una plantilla Jinja y el JavaScript de la página. Si en la plantilla escribes `{% set color = "azul" %}`, el HTML sale con «azul», y ningún clic posterior en el navegador puede volver a ejecutar la plantilla.

## Pasar un valor de Sass a una custom property

Lo normal es combinarlas: guardas los valores de diseño en Sass y los publicas como custom properties para que el navegador pueda cambiarlos. Pero hay una trampa. Como el valor de una custom property puede ser casi cualquier secuencia de texto, Sass **no lo interpreta**: lo copia tal cual. `--brand: $brand;` llega al navegador como el texto `$brand`, no como un color:

[[exercise:07-pasar-sass-a-custom-property.md-(styles.scss|compiled.css)]]

[[exercise:07-pasar-sass-a-custom-property.md]]

La solución es la interpolación: `--brand: #{$brand};`. Con ella, Sass evalúa la expresión y pega el resultado. Sirve también para cálculos: `--gap-lg: #{$gap * 2};`.

## Cuál usar en cada caso

- **Variable Sass** para lo que se decide al compilar y no cambia con la página abierta: breakpoints de las media queries, valores que alimentan cálculos y funciones de Sass, nombres que se usan para generar clases.
- **Custom property** para lo que tiene que cambiar en el navegador: temas claro y oscuro, estados (`:hover`, `:checked`), valores que ajusta JavaScript, valores que un componente hereda de su contenedor.
- **Las dos a la vez**, muy a menudo: los valores de diseño viven en Sass y se publican como custom properties con `#{}`.

El caso de las media queries merece verse: una condición de `@media` se evalúa para toda la página, no para un elemento, así que no tiene de dónde leer una custom property y CSS no admite `var()` en ella. Con la variable Sass, el CSS generado contiene un número y funciona:

[[exercise:08-cuando-usar-cada-una.md]]

[[exercise:08-cuando-usar-cada-una.md-(styles.scss|compiled.css)]]

## `null`: la declaración que no se escribe

Si una propiedad recibe el valor `null`, Sass **no escribe** la declaración en el CSS. Parece un detalle, pero es muy útil para valores opcionales: «si no hay sombra, no pongas `box-shadow`».

[[exercise:09-null-omite-la-declaracion.md-(styles.scss|compiled.css)]]

[[exercise:09-null-omite-la-declaracion.md]]

## Bestiario

- **El tema oscuro (o el `:hover`) no cambia una variable Sass.** *Síntoma:* escribes `.dark .card { $bg: #0f172a; }` o `.btn:hover { $brand: …; }` y no pasa nada; en el CSS generado esas reglas ni siquiera aparecen. *Causa:* las variables Sass se sustituyen al compilar y no existen en el navegador; una regla que solo declara variables Sass no genera CSS. *Solución:* usa custom properties para todo lo que cambie con un estado o un tema, y cámbialas con selectores. [Ver ejemplo](06-sass-no-cambia-en-el-navegador.md).
- **Una custom property vale literalmente `$brand`.** *Síntoma:* `--brand: $brand;` y luego `var(--brand)` no aplica el color; la propiedad se comporta como `unset`. *Causa:* Sass no interpreta los valores de las custom properties (pueden ser casi cualquier texto) y copia `$brand` sin sustituirla. *Solución:* interpola: `--brand: #{$brand};`. [Ver ejemplo](07-pasar-sass-a-custom-property.md).

## Resumen

- `$nombre: valor;` declara una variable Sass; al compilar se sustituye por su valor y desaparece. `-` y `_` son intercambiables en los nombres.
- Las variables declaradas dentro de unas llaves son locales y tapan a las globales; `!global` asigna a la global desde dentro de un bloque.
- `!default` asigna solo si la variable no existe o es `null`: es el mecanismo de configuración de las librerías.
- `#{}` interpola: obligatoria en selectores, nombres de propiedades, cadenas y custom properties; innecesaria en valores normales y en `calc()`.
- Las variables Sass existen al compilar; las custom properties, en el navegador. Para temas y estados, custom properties; para media queries y cálculos de Sass, variables Sass.
- Pasa valores de Sass al navegador con `--x: #{$y};`.
- Una propiedad con valor `null` no se escribe en el CSS.

## Para profundizar

- [Sass: Variables](https://sass-lang.com/documentation/variables/)
- [Sass: Interpolation](https://sass-lang.com/documentation/interpolation/)
- [Sass: Property Declarations (custom properties)](https://sass-lang.com/documentation/style-rules/declarations/#custom-properties)
- [CSS-Tricks: Difference Between Types of CSS Variables](https://css-tricks.com/difference-between-types-of-css-variables/)
- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
