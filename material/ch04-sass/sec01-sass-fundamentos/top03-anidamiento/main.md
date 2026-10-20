# Anidamiento

## Por qué importa

En CSS plano, los estilos de un componente se reparten en muchas reglas que repiten el mismo principio: `.card`, `.card h2`, `.card a`, `.card a:hover`. El **anidamiento** de Sass permite escribir esas reglas unas dentro de otras, agrupadas bajo el componente al que pertenecen. Es la función de Sass que más se usa y la que más se abusa: bien usada, ordena el código; mal usada, genera selectores larguísimos que disparan la especificidad y atan el CSS a la estructura exacta del HTML.

Ya conoces el anidamiento nativo de CSS del módulo de arquitectura. El de Sass se parece mucho, pero tiene una diferencia importante: Sass lo **resuelve al compilar** y el navegador recibe CSS plano, sin ningún anidamiento. Eso le permite algunas cosas que el nativo no puede hacer, como pegar texto a un selector.

## Anidar reglas

Una regla escrita dentro de otra genera un **selector descendiente**: el selector de fuera, un espacio y el de dentro.

[[exercise:01-anidar-descendientes.md-(styles.scss|compiled.css)]]

[[exercise:01-anidar-descendientes.md]]

En el CSS generado no queda ningún anidamiento: hay cuatro reglas planas, `.post`, `.post h2`, `.post p` y `.post a`, cada una con sus declaraciones. Puedes anidar a varios niveles, y cada nivel añade un eslabón al selector.

## El selector padre: `&`

Dentro de una regla anidada, `&` representa **el selector completo de fuera**. Sirve para lo que no es un descendiente: estados, pseudoelementos y clases o atributos del **mismo** elemento. Pegado al estado, sin espacio, `&:hover` dentro de `.tab` genera `.tab:hover`.

[[exercise:02-el-selector-padre.md]]

[[exercise:02-el-selector-padre.md-(styles.scss|compiled.css)]]

La regla para recordarlo: sin `&`, Sass une los selectores con un **espacio** (descendiente); con `&`, pone el selector padre exactamente donde está el `&`. Olvidarlo es uno de los errores más comunes al empezar, porque el resultado compila sin quejarse pero selecciona otra cosa:

[[exercise:03-olvidar-el-ampersand.md-(styles.scss|compiled.css)]]

`.btn-bad :hover` (con espacio) significa «cualquier elemento con el ratón encima que esté **dentro** de `.btn-bad`». El botón no tiene elementos dentro, así que no se aplica nunca:

[[exercise:03-olvidar-el-ampersand.md]]

## Sufijos: `&__elemento` y `&--modificador`

En Sass, `&` seguido de texto **pega** ese texto al nombre del padre: dentro de `.card`, `&__title` genera `.card__title`. Es la forma habitual de escribir la metodología **BEM** (bloque, elemento, modificador), que viste en el módulo de arquitectura CSS: todo el componente queda agrupado en el código fuente, pero cada selector generado es una sola clase.

[[exercise:04-sufijos-bem.md-(styles.scss|compiled.css)]]

[[exercise:04-sufijos-bem.md]]

Fíjate en la especificidad del resultado: `.card__title` es (0,1,0), igual que `.card`. Anidar con sufijos no añade especificidad, porque no genera descendientes: genera clases nuevas.

## El padre en otro sitio

`&` no tiene por qué ir al principio. Puedes colocarlo al final para decir «este componente cuando está dentro de otra cosa», o repetirlo:

[[exercise:05-el-padre-en-otro-sitio.md]]

[[exercise:05-el-padre-en-otro-sitio.md-(styles.scss|compiled.css)]]

- `.theme-dark &` genera `.theme-dark .alert`: los estilos del componente en un contexto concreto (un tema, una barra lateral) se escriben junto a sus estilos normales.
- `& + &` genera `.alert + .alert`: el espacio entre dos alertas seguidas, sin tocar la primera.

## Combinadores y listas de selectores

Una regla anidada puede empezar por un combinador (`>`, `+`, `~`). Y si el selector de fuera o el de dentro son **listas** (separados por comas), Sass genera **todas las combinaciones**:

[[exercise:06-combinadores-y-listas.md-(styles.scss|compiled.css)]]

[[exercise:06-combinadores-y-listas.md]]

Resumen de lo que genera cada forma:

| Escribes | Sass genera |
|---|---|
| `.a { .b {} }` | `.a .b` |
| `.a { > .b {} }` | `.a > .b` |
| `.a { + .b {} }` | `.a + .b` |
| `.a { &:hover {} }` | `.a:hover` |
| `.a { &.b {} }` | `.a.b` |
| `.a { &__b {} }` | `.a__b` |
| `.a { .b & {} }` | `.b .a` |
| `.a { & + & {} }` | `.a + .a` |
| `.a, .b { .c, .d {} }` | `.a .c, .a .d, .b .c, .b .d` |

> **Desde Python:** las listas anidadas funcionan como `itertools.product`: `[f"{o} {i}" for o in [".a", ".b"] for i in [".c", ".d"]]` da las cuatro combinaciones. Con listas largas a varios niveles, el número de selectores generados crece muy deprisa.

## Media queries anidadas

Una `@media` se puede escribir **dentro** de una regla, junto a los estilos que modifica. Sass la saca hacia fuera («burbujea») y mete dentro el selector completo:

[[exercise:07-media-anidada.md-(styles.scss|compiled.css)]]

[[exercise:07-media-anidada.md]]

Cada `@media` anidada genera su propio bloque en el CSS, aunque se repita la misma condición. No es un problema: el navegador las evalúa igual de rápido y, al publicar comprimido, el texto repetido apenas ocupa. Lo importante es que cada componente lleva sus adaptaciones consigo. En la lección de mixins harás un atajo para no repetir la condición.

## Otras dos formas de anidar

Sass permite anidar **propiedades** que comparten prefijo, aunque se usa poco porque cuesta leerlo:

```scss
.title {
  font: {
    family: Georgia, serif;   // → font-family: Georgia, serif;
    weight: bold;             // → font-weight: bold;
  }
}
```

Y `@at-root` hace lo contrario que anidar: escribe una regla en la raíz aunque esté dentro de otra. Dentro de `.card`, `@at-root .card-list { … }` genera `.card-list`, sin el `.card` delante. Es útil en mixins avanzados; en el día a día, casi nunca.

## Cuánto anidar: la especificidad se dispara

Es tentador anidar copiando la estructura del HTML: `.page`, dentro `.content`, dentro `.card`, dentro `.card-footer`, dentro `.btn`. En el SCSS se ve ordenado, pero el CSS generado es `.page .content .card .card-footer .btn`, con especificidad **(0,5,0)**. Eso tiene dos consecuencias:

[[exercise:08-sobre-anidar.md]]

1. **Cuesta sobrescribirlo.** Un modificador como `.action-danger` (0,1,0) pierde, y acabas escribiendo selectores todavía más largos o `!important`.
2. **El CSS queda atado al HTML.** El botón solo tiene estilos si está exactamente dentro de esa cadena de elementos. Llévalo a la barra lateral y pierde todos sus estilos; cambia un `div` de sitio y se rompe.

[[exercise:08-sobre-anidar.md-(styles.scss|compiled.css)]]

Una regla práctica muy extendida: **no pases de tres niveles**, y anida solo lo que pertenece al propio componente:

- estados y pseudoelementos (`&:hover`, `&:focus-visible`, `&::before`),
- elementos y modificadores del componente (`&__title`, `&--featured`),
- media queries y contextos del componente (`@media`, `.theme-dark &`).

Todo lo demás, en reglas planas de una clase. Es lo mismo que proponen BEM y las capas del módulo de arquitectura: especificidad baja y uniforme.

## Anidamiento de Sass frente al nativo

El anidamiento nativo de CSS nació inspirado en el de Sass, y para estados (`&:hover`), descendientes y media queries funciona igual. Pero hay diferencias que importan si mezclas los dos mundos o migras un proyecto:

| | Sass | CSS nativo |
|---|---|---|
| Qué recibe el navegador | CSS plano (el anidamiento desaparece al compilar) | las reglas anidadas tal cual |
| `&__title`, `&--featured`, `&-icon` | pega texto: `.card__title` | no pega texto: no selecciona lo que esperas |
| `.a, #b { .c {} }` | `.a .c, #b .c`: cada selector con su especificidad | `:is(.a, #b) .c`: los dos con la especificidad de `#b` |
| Navegadores | todos, porque el resultado es CSS plano | los que soportan anidamiento (todos los actuales) |

El primer punto es el que más sorprende, porque los sufijos BEM son el uso más habitual del `&` en Sass:

[[exercise:09-sufijos-en-css-nativo.md]]

[[exercise:09-sufijos-en-css-nativo.md-(index.html|styles.scss|compiled.css)]]

Una curiosidad: si escribes anidamiento con la sintaxis nativa dentro de un archivo `.scss`, Sass lo trata como suyo y lo aplana. Solo llega al navegador sin aplanar el CSS que no pasa por Sass, como el `<style>` del ejemplo.

## Bestiario

- **El `:hover` anidado no hace nada.** *Síntoma:* `.btn { :hover { … } }` o `.card { .is-featured { … } }` compilan sin errores pero no se aplican. *Causa:* sin `&`, Sass une los selectores con un espacio (descendiente): `.btn :hover` busca un elemento con el ratón encima **dentro** del botón. *Solución:* pega el estado o la clase con `&`: `&:hover`, `&.is-featured`. [Ver ejemplo](03-olvidar-el-ampersand.md).
- **Un modificador no consigue ganar y el componente no funciona fuera de su sitio.** *Síntoma:* `.action-danger` no cambia el color, y el mismo botón en otra parte de la página sale sin estilos. *Causa:* anidar copiando el HTML genera selectores como `.page .content .card .card-footer .action`, con especificidad (0,5,0) y dependientes de esa estructura exacta. *Solución:* selectores planos de una clase; anida solo estados, elementos del componente y media queries, y no pases de tres niveles. [Ver ejemplo](08-sobre-anidar.md).
- **`&__title` no funciona en CSS nativo.** *Síntoma:* pasas un componente de Sass a CSS nativo y los elementos BEM pierden sus estilos. *Causa:* el anidamiento nativo no pega texto: lee `&__title` como el selector padre más un elemento llamado `__title`, que no existe. *Solución:* en CSS nativo, escribe las clases BEM enteras (`.card__title { … }`) fuera del bloque, o sigue usando Sass para ese componente. [Ver ejemplo](09-sufijos-en-css-nativo.md).

## Resumen

- Una regla anidada genera un selector descendiente; Sass entrega CSS plano.
- `&` es el selector padre completo: `&:hover`, `&::before`, `&.is-active` lo pegan sin espacio. Sin `&`, Sass pone un espacio.
- `&__elemento` y `&--modificador` pegan texto y generan clases BEM de especificidad (0,1,0). Solo en Sass, no en CSS nativo.
- `&` puede ir al final (`.theme-dark &`) o repetido (`& + &`).
- Las listas de selectores anidadas generan todas las combinaciones; las `@media` anidadas burbujean hacia fuera.
- No anides copiando el HTML: dispara la especificidad y ata el CSS al marcado. Máximo tres niveles y solo lo que pertenece al componente.

## Para profundizar

- [Sass: Style Rules (anidamiento)](https://sass-lang.com/documentation/style-rules/)
- [Sass: Parent Selector](https://sass-lang.com/documentation/style-rules/parent-selector/)
- [MDN: CSS nesting y sus diferencias con los preprocesadores](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting)
- [Chrome for Developers: CSS nesting relaxed syntax](https://developer.chrome.com/blog/css-nesting-relaxed-syntax-update)
- [BEM: Block, Element, Modifier](https://getbem.com/introduction/)
