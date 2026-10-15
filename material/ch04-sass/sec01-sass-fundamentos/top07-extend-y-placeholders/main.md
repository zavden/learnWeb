# @extend y placeholders

## Por qué importa

Los mixins reutilizan declaraciones copiándolas. Sass tiene otra forma de reutilizar, `@extend`, que no copia nada: le dice a Sass «este selector también debe recibir todas las reglas de aquel otro», y Sass lo **añade a la lista de selectores** de esas reglas. El CSS generado es más corto, y durante años fue la técnica recomendada. Hoy se usa con mucha más cautela, porque `@extend` hace cosas que no se ven en el código fuente: genera selectores que no escribiste, mueve tus reglas de sitio en la cascada y no funciona dentro de media queries. Esta lección te enseña a usarlo y, sobre todo, a reconocer cuándo no hacerlo.

## `@extend`: «trátame también como…»

Dentro de una regla, `@extend .alert;` significa: «en cada regla donde aparezca `.alert`, añade también mi selector». Las declaraciones de `.alert` quedan escritas una sola vez, compartidas:

[[exercise:01-extend-una-clase.md-(styles.scss|compiled.css)]]

[[exercise:01-extend-una-clase.md]]

En el HTML, la segunda alerta solo tiene la clase `alert-error`, y aun así recibe todo lo de `.alert`. Es la idea original de `@extend`: expresar en el CSS que un error **es un tipo de** alerta, sin repetir clases en el HTML.

> **Desde Python:** recuerda a la herencia de clases (`class AlertError(Alert)`), y de ahí viene su nombre. Pero no te fíes demasiado de la comparación: Sass no hereda «el estilo de `.alert`», sino **cada regla** que menciona `.alert`, vengan de donde vengan. Es más parecido a un buscar y reemplazar sobre los selectores de todo el archivo.

## Placeholders: `%nombre`

Muchas veces la clase base solo existe para que otras la extiendan y nadie la usa en el HTML. Para eso están los **placeholders**: selectores que empiezan por `%` y que Sass **no escribe** en el CSS por sí solos. Solo aparecen, sustituidos, en los selectores que los extienden:

[[exercise:02-placeholders.md-(styles.scss|compiled.css)]]

[[exercise:02-placeholders.md]]

Un placeholder que nadie extiende no genera nada. Así, una librería puede ofrecer cien placeholders sin engordar el CSS de quien solo usa tres.

## `@extend` frente a mixin

Los dos reutilizan un bloque de estilos, pero generan CSS muy distinto. Compara las dos mitades de este ejemplo y sus `compiled.css`:

[[exercise:03-extend-frente-a-mixin.md-(styles.scss|compiled.css)]]

[[exercise:03-extend-frente-a-mixin.md]]

| | `@extend %card` | `@include card` |
|---|---|---|
| Qué hace | añade el selector a las reglas de `%card` | copia las declaraciones en la regla |
| CSS generado | una regla con una lista de selectores | las declaraciones repetidas en cada regla |
| Argumentos | no | sí |
| Dentro de `@media` | no, si lo extendido está fuera (error) | sí |
| Posición en la cascada | la de la regla extendida | la del `@include` |
| Selectores generados | pueden ser muchos e inesperados | exactamente los que escribes |

El CSS de `@extend` ocupa menos, pero la diferencia casi desaparece al publicar el CSS comprimido con gzip o brotli, que aprovechan muy bien el texto repetido. En cambio, los problemas de las secciones siguientes no desaparecen.

## Selectores inesperados

`@extend` no extiende «el aspecto» de un selector, sino **todas las reglas donde aparece**, incluidas las que lo usan en un contexto. Si en algún lugar del proyecto existe `.sidebar .title`, cualquier selector que extienda `.title` hereda también esa regla:

[[exercise:04-selectores-inesperados.md]]

[[exercise:04-selectores-inesperados.md-(styles.scss|compiled.css)]]

En un archivo pequeño lo descubres enseguida. En un proyecto con cincuenta archivos, la regla `.sidebar .title` puede estar en un sitio que nunca has abierto, y el título de tu tarjeta cambia de aspecto solo en una página concreta. Es el problema que llevó a muchos equipos a abandonar `@extend`: el resultado depende de reglas que no ves.

Cuando el selector que extiende tiene a su vez varios niveles (`.toolbar .item { @extend .link; }`), Sass tiene que **entrelazar** los dos contextos y genera combinaciones que nadie escribió:

```css
/* .footer .link + «.toolbar .item extiende .link» → */
.footer .link, .footer .toolbar .item, .toolbar .footer .item { … }
```

## La explosión de selectores

Cada `@extend` añade un selector a **cada** regla donde aparece el selector extendido. Con un selector que aparece en muchas reglas, y varias clases que lo extienden, el número de selectores se multiplica. Y en las reglas donde el selector aparece dos veces, como `.btn + .btn`, se generan **todas las combinaciones**:

[[exercise:05-explosion-de-selectores.md-(styles.scss|compiled.css)]]

```text
.btn + .btn  con 4 clases que extienden .btn  →  (1 + 4) × (1 + 4) = 25 selectores
```

[[exercise:05-explosion-de-selectores.md]]

No es un caso raro: así es como algunos proyectos llegaron a tener hojas de estilo de cientos de kilobytes, y reglas con miles de selectores que DevTools apenas puede mostrar.

## `@extend` no cruza media queries

Un `@extend` escrito dentro de una `@media` no puede extender un selector que está fuera de ella. Para cumplirlo, Sass tendría que añadir tu selector a la regla de fuera **solo cuando se cumple la media query**, y eso no se puede expresar con una lista de selectores. Así que se detiene:

[[exercise:06-extend-y-media-queries.md-(styles.scss|sass-output.txt)]]

El mensaje incluye un pequeño extracto de la línea donde está lo que intentabas extender (`From line 1, column 1`), y la línea del error, en `sass-output.txt`, es la del `@extend`. La solución es un mixin, que copia las declaraciones dentro de la media query sin problema.

[[exercise:06-extend-y-media-queries.md]]

## `@extend` cambia el orden de la cascada

En la cascada, a igual especificidad gana la regla que aparece **después**. Con un mixin, las declaraciones aparecen donde escribes el `@include`. Con `@extend`, tu selector aparece donde está la **regla extendida**, que puede estar mucho más abajo:

[[exercise:07-extend-cambia-el-orden.md]]

[[exercise:07-extend-cambia-el-orden.md-(styles.scss|compiled.css)]]

Esto se nota sobre todo en proyectos con muchos archivos, donde el orden de los `@use` decide qué regla aparece antes en el CSS final. Con placeholders definidos al principio de todo, el problema se invierte: tus reglas propias quedan después y ganan, que es lo que suele quererse.

## Otros detalles

- Extender un selector que no existe es un error («The target selector was not found»). Si es intencionado (por ejemplo, un placeholder de una librería que puede no estar cargada), añade `!optional`: `@extend %maybe !optional;`.
- Solo se pueden extender selectores simples (`.alert`, `%card`). `@extend .a.b` da error; Sass te propone `@extend .a, .b`.
- Con el sistema de módulos, `@extend` solo afecta a los módulos que el archivo carga (con `@use`), no a todo el proyecto. Eso limita las sorpresas, pero no las elimina.

## Cuándo usar cada herramienta

- **Varias clases en el HTML** (`class="btn btn-danger"`): la opción más simple y predecible. Es lo que hacen BEM y las utilidades.
- **Mixin**: cuando necesitas argumentos, cuando va dentro de media queries o cuando quieres saber exactamente qué CSS se genera.
- **Clase base + custom properties**: para variantes que solo cambian datos (lo viste en la lección de mixins).
- **Placeholder + `@extend`**: para pocos estilos base, sin contexto, definidos al principio del proyecto, y nunca dentro de `@media`. Si dudas, usa un mixin.

Si heredas un proyecto lleno de `@extend`, la migración es mecánica. Partiendo de esto:

```scss
%card-base {
  padding: 16px;
  border-radius: 8px;
}

.product-card { @extend %card-base; }
.event-card   { @extend %card-base; }
```

Tienes tres caminos, de menos a más cambio:

```scss
// 1) Mixin: mismo SCSS, solo cambia la palabra clave.
@mixin card-base { padding: 16px; border-radius: 8px; }
.product-card { @include card-base; }

// 2) Una clase base y varias clases en el HTML: <article class="card product-card">
.card { padding: 16px; border-radius: 8px; }

// 3) Lista de selectores escrita a mano: el CSS que generaba @extend, pero visible.
.product-card,
.event-card { padding: 16px; border-radius: 8px; }
```

En los tres casos el CSS generado es exactamente el que lees en el código, que es lo que se pierde con `@extend`.

> **Desde Python:** un placeholder se parece a una clase base abstracta (`class CardBase(ABC)`) que nadie instancia y que solo existe para que otras hereden de ella. La recomendación de los equipos que mantienen mucho Sass es la misma que la de muchos equipos de Python: **composición antes que herencia**. Varias clases pequeñas combinadas en el HTML, o mixins incluidos donde hacen falta, son más fáciles de seguir que una jerarquía de `@extend`.

## Bestiario

- **Un selector que extiende hereda reglas de contexto.** *Síntoma:* un elemento que hace `@extend .title` cambia de aspecto solo en ciertas zonas de la página (por ejemplo, en el lateral). *Causa:* `@extend` añade tu selector a **todas** las reglas que mencionan el selector extendido, incluidas las de contexto como `.sidebar .title`. *Solución:* usa un mixin, o un placeholder con solo el estilo base que nadie use en reglas de contexto. [Ver ejemplo](04-selectores-inesperados.md).
- **El CSS generado se dispara de tamaño.** *Síntoma:* una regla tiene decenas de selectores (`.search-go + .btn, .btn + .search-go, …`). *Causa:* cada `@extend` se suma a cada aparición del selector extendido, y en reglas con el selector repetido se generan todas las combinaciones. *Solución:* pon varias clases en el HTML o usa un mixin; reserva `@extend` para placeholders sencillos. [Ver ejemplo](05-explosion-de-selectores.md).
- **«You may not @extend selectors across media queries».** *Síntoma:* la compilación se detiene al usar `@extend` dentro de una `@media`. *Causa:* el selector extendido está fuera de la media query, y una lista de selectores no puede aplicarse solo «cuando se cumple la media query». *Solución:* un mixin, que copia las declaraciones dentro de la `@media`. [Ver ejemplo](06-extend-y-media-queries.md).
- **La variante pierde contra la regla base.** *Síntoma:* `.btn-danger { @extend .btn; background: red; }` sale con el fondo de `.btn`. *Causa:* `@extend` coloca tu selector en la posición de la regla extendida; si está después, gana por orden de aparición. *Solución:* define las reglas o placeholders extendidos antes, o usa un mixin. [Ver ejemplo](07-extend-cambia-el-orden.md).

## Resumen

- `@extend .x` añade el selector actual a todas las reglas que mencionan `.x`; no copia declaraciones.
- Los placeholders (`%x`) solo existen para ser extendidos: no se escriben en el CSS por sí solos.
- `@extend` genera menos CSS que un mixin, pero también selectores inesperados (contexto, entrelazado) y combinaciones que se multiplican.
- No funciona a través de media queries y coloca tu selector donde está la regla extendida, lo que puede invertir la cascada.
- Prefiere varias clases en el HTML, mixins o custom properties; si usas `@extend`, solo con placeholders sencillos definidos al principio.

## Para profundizar

- [Sass: @extend](https://sass-lang.com/documentation/at-rules/extend/)
- [Sass: Placeholder Selectors](https://sass-lang.com/documentation/style-rules/placeholder-selectors/)
- [CSS Wizardry: Mixins Better for Performance](https://csswizardry.com/2016/02/mixins-better-for-performance/)
- [Sass Guidelines: Extend](https://sass-guidelin.es/#extend)
