# Mixins

## Por qué importa

Hay grupos de declaraciones que se repiten juntas por todo un proyecto: las tres propiedades del texto cortado con «…», el anillo de foco accesible, la media query de los móviles, las variantes de color de un botón. Copiarlas a mano es la receta para que un día una copia se quede sin actualizar. Un **mixin** les da un nombre y te deja incluirlas donde haga falta, con argumentos para las partes que cambian. Es la herramienta de Sass que más se parece a una función, y también la que más CSS genera si no sabes cómo funciona por dentro.

## Definir e incluir un mixin

Un mixin se define con `@mixin nombre { … }` y se usa con `@include nombre;` dentro de una regla. Al compilar, Sass **copia** las declaraciones del mixin en el lugar del `@include`:

[[exercise:01-mixin-sin-argumentos.md-(styles.scss|compiled.css)]]

[[exercise:01-mixin-sin-argumentos.md]]

El mixin no aparece en el CSS generado: es una plantilla que solo existe para Sass. Cada regla que lo incluye recibe su propia copia de las tres declaraciones.

> **Desde Python:** un mixin se parece a una función que **devuelve declaraciones** en lugar de un valor, y `@include` a una llamada cuyo resultado se pega en ese sitio. Si conoces las macros de las plantillas Jinja (`{% macro %}`), es todavía más parecido: un trozo de plantilla con nombre que se expande donde lo llamas.

Igual que con las variables, un mixin tiene que estar definido **antes** del `@include` que lo usa: Sass recorre el archivo de arriba abajo. Por eso los mixins suelen ir al principio del archivo o, en un proyecto real, en un archivo propio que se carga con `@use` (lo verás en la próxima lección).

## Argumentos

Un mixin puede recibir **argumentos**, que dentro funcionan como variables locales. Así, un solo mixin genera todas las variantes de color de un botón:

[[exercise:02-argumentos.md]]

[[exercise:02-argumentos.md-(styles.scss|compiled.css)]]

Fíjate en que el mixin lleva reglas anidadas (`&:hover`, `&:focus-visible`). Dentro de un mixin, `&` es el selector de la regla donde se hace el `@include`: en `.btn-danger` genera `.btn-danger:hover`.

## Valores por defecto y argumentos por nombre

Los argumentos pueden tener **valor por defecto**, y al incluir el mixin puedes pasarlos **por nombre**. Igual que en Python, los posicionales van primero y los nombrados después, y puedes saltarte los que tienen un buen valor por defecto:

[[exercise:03-defaults-y-nombrados.md-(styles.scss|compiled.css)]]

[[exercise:03-defaults-y-nombrados.md]]

Dos detalles útiles: un valor por defecto `null` hace que la declaración desaparezca si nadie pasa ese argumento (lo viste en la lección de variables), y un valor por defecto puede usar los argumentos anteriores: `@mixin button-variant($bg, $bg-hover: $bg)`.

> **Desde Python:** `@mixin card($padding: 12px 16px, $radius: 8px)` es `def card(padding="12px 16px", radius="8px")`, y `@include card($radius: 0)` es `card(radius=0)`. La sintaxis cambia (`$` y `:` en lugar de `=`), pero las reglas son las mismas.

## Argumentos variables

Si un mixin debe aceptar **cualquier número** de valores, el último parámetro se declara con tres puntos: `$props...`. Dentro del mixin, `$props` es una lista con todos los argumentos sobrantes:

[[exercise:04-argumentos-variables.md-(styles.scss|compiled.css)]]

[[exercise:04-argumentos-variables.md]]

Este mixin tiene además una ventaja que va más allá de ahorrar líneas: incluye siempre la media query `prefers-reduced-motion`. Quien lo use no puede olvidarse de ella. Encapsular buenas prácticas para que sean el camino fácil es uno de los mejores usos de los mixins.

> **Desde Python:** `$props...` es `*props`. Y al revés también funciona: si tienes una lista en una variable, `@include transition($my-list...)` la «desempaqueta» en argumentos, como `f(*my_list)`.

## `@content`: pasar un bloque al mixin

A veces lo que cambia no es un valor, sino un **bloque entero** de declaraciones. `@content` es un hueco dentro del mixin: el bloque que escribas entre llaves al hacer el `@include` se coloca ahí.

[[exercise:05-content.md-(styles.scss|compiled.css)]]

[[exercise:05-content.md]]

El mixin decide **dónde** van las declaraciones (dentro de `&:hover, &:focus-visible`), y quien lo usa decide **cuáles**. Es la forma de garantizar que el estilo del ratón también llega a quien navega con el teclado.

> **Desde Python:** es parecido a pasar una función como argumento (un *callback*) para que otra la llame en el momento adecuado, o al cuerpo de un bloque `with`, que el gestor de contexto envuelve con lo que haga falta antes y después.

El mixin también puede pasarle valores a su bloque con `@content(valor)`, y el bloque los recibe con `using`:

```scss
@mixin theme($name) {
  .theme-#{$name} & {
    @content($name);
  }
}

.logo {
  @include theme(dark) using ($theme) {
    background-image: url("logo-#{$theme}.svg");   // → .theme-dark .logo { … "logo-dark.svg" }
  }
}
```

## Mixins de media queries

El uso más extendido de `@content`: un mixin que escribe la media query por ti. Los breakpoints del proyecto se definen una vez, y cada componente escribe sus adaptaciones en su sitio:

[[exercise:06-mixin-de-media-queries.md-(styles.scss|compiled.css)]]

[[exercise:06-mixin-de-media-queries.md]]

En la próxima lección guardarás los breakpoints en un **mapa** (`(md: 30rem, lg: 48rem)`) para escribir `@include from(md)`, y en la de depuración harás que el mixin avise con un error si alguien pide un breakpoint que no existe.

## Mixins que generan reglas completas

Un mixin no tiene por qué incluirse dentro de una regla. Si contiene selectores, se puede incluir en la raíz del archivo y genera reglas enteras:

```scss
@mixin alert-variant($name, $bg, $fg) {
  .alert--#{$name} {
    background: $bg;
    color: $fg;
  }
}

@include alert-variant(info, #e0f2fe, #0c4a6e);   // → .alert--info { … }
@include alert-variant(danger, #fee2e2, #7f1d1d); // → .alert--danger { … }
```

Lo que no se puede es incluir en la raíz un mixin que solo tiene declaraciones: Sass se detiene con «Declarations may only be used within style rules», porque una declaración tiene que pertenecer a algún selector.

## Errores al llamar a un mixin

Si a un mixin le falta un argumento obligatorio, Sass no se lo inventa: detiene la compilación y la página se queda sin CSS, como viste en la primera lección.

[[exercise:07-falta-un-argumento.md-(styles.scss|sass-output.txt)]]

Los tres mensajes que verás más a menudo con mixins:

| Mensaje | Qué ha pasado |
|---|---|
| `Missing argument $bg-hover.` | falta un argumento sin valor por defecto |
| `No parameter named $hover.` | un argumento por nombre que el mixin no tiene (una errata) |
| `Undefined mixin.` | el mixin no existe o está definido **después** del `@include` |

La línea que indica `sass-output.txt` es la del `@include`, que es donde tienes que corregir. Las dos líneas sangradas de debajo son la **pila de llamadas** (el mixin y desde dónde se llamó); aprenderás a leerla en la lección de depuración.

[[exercise:07-falta-un-argumento.md]]

## Cada `@include` es una copia

Un mixin no se «llama» en el navegador: cada `@include` **copia** todas sus declaraciones en el CSS generado. Con mixins pequeños no importa; con un componente entero y veinte variantes, el CSS crece mucho. Compara un mixin de insignia con la alternativa de una clase base más custom properties:

[[exercise:08-cada-include-copia.md]]

[[exercise:08-cada-include-copia.md-(styles.scss|compiled.css)]]

Se ven idénticas, pero la versión con mixin repite las ocho declaraciones en cada variante. Algunas pautas para elegir:

- **Mixin** cuando lo que cambia es la **lógica** o la **estructura**: media queries, estados, argumentos que deciden qué se escribe, buenas prácticas que quieres encapsular.
- **Clase base + custom properties** cuando las variantes solo cambian **datos** (colores, tamaños). Además, esos datos se pueden cambiar en el navegador.
- **`@extend`**, que reutiliza reglas sin copiar declaraciones, tiene sus propias trampas; lo verás en la lección 7.

## Bestiario

- **«Missing argument» al incluir un mixin.** *Síntoma:* la página entera se queda sin estilos y `sass-output.txt` dice `Missing argument $bg-hover.` en la línea de un `@include`. *Causa:* el mixin tiene un parámetro sin valor por defecto y el `@include` no lo pasa; Sass no compila nada. *Solución:* pasa el argumento o dale un valor por defecto en el `@mixin` (puede usar los anteriores: `$bg-hover: $bg`). Si el mensaje es `No parameter named …`, revisa el nombre; si es `Undefined mixin.`, comprueba que el `@mixin` esté escrito antes. [Ver ejemplo](07-falta-un-argumento.md).

## Resumen

- `@mixin nombre { … }` define un bloque reutilizable; `@include nombre;` copia sus declaraciones (y sus reglas anidadas) en ese sitio.
- Los argumentos funcionan como en Python: posicionales, por nombre, con valor por defecto (que puede ser `null` o usar argumentos anteriores) y variables con `$args...`.
- `@content` deja un hueco para un bloque que escribe quien usa el mixin; es la base de los mixins de media queries y de estados.
- Un mixin con selectores se puede incluir en la raíz y generar reglas completas.
- Los errores de argumentos detienen la compilación: lee el mensaje y la línea del `@include`.
- Cada `@include` es una copia: para variantes que solo cambian datos, una clase base con custom properties genera menos CSS.

## Para profundizar

- [Sass: @mixin and @include](https://sass-lang.com/documentation/at-rules/mixin/)
- [Sass: Passing arguments to content blocks](https://sass-lang.com/documentation/at-rules/mixin/#passing-arguments-to-content-blocks)
- [CSS-Tricks: Approaches to Media Queries in Sass](https://css-tricks.com/approaches-media-queries-sass/)
- [web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
