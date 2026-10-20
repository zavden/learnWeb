# Anidamiento nativo

## Por qué importa

Los estilos de un componente suelen repartirse en muchas reglas que repiten el mismo principio: `.nav-link`, `.nav-link:hover`, `.nav-link:focus-visible`, `.nav-link::after`, `.sidebar .nav-link`. Desde 2023, CSS permite escribirlas **unas dentro de otras**, sin preprocesador: el navegador entiende el anidamiento tal cual. El código de un componente queda agrupado y se lee de un vistazo.

Este es el último módulo de CSS, y trata de **arquitectura**: cómo organizar una hoja de estilos para que un proyecto con cientos de componentes, varias personas y alguna librería ajena siga siendo predecible. Tiene cinco lecciones: el anidamiento nativo; las metodologías (BEM, componentes, utilidades y capas); `@scope`, los ámbitos de estilo; los *design tokens*; y los resets y estilos base. Muchas piezas ya han ido apareciendo: las capas en el módulo de fundamentos, los tokens en las custom properties y en los ejemplos profesionales del módulo responsive, el reset de imágenes… Aquí encajan.

Si has usado Sass, la idea te sonará: es la misma. La diferencia de fondo es **quién** resuelve el anidamiento. Sass lo resuelve al compilar y el navegador recibe CSS plano; el anidamiento nativo llega al navegador sin tocar, y el navegador lo interpreta con sus propias reglas. De ahí salen las tres diferencias del Bestiario.

Soporte: Chrome 112 (2023) y, con la sintaxis relajada que usa esta lección, Chrome 120; también todos los navegadores actuales.

## El selector padre: `&`

Dentro de una regla anidada, `&` representa **el selector de fuera, completo**. Pegado a otra cosa, sin espacio, habla del **mismo elemento**: `&:hover` dentro de `.nav-link` es `.nav-link:hover`.

```css
.nav-link {
  color: #334155;

  &:hover { color: #1d4ed8; }                /* .nav-link:hover */
  &[aria-current="page"] { color: #1d4ed8; } /* .nav-link[aria-current="page"] */
  &::after { content: ""; }                  /* .nav-link::after */
}
```

[[exercise:01-el-selector-padre.md]]

Así se escriben los estados (`:hover`, `:focus-visible`, `:checked`), los pseudoelementos (`::before`, `::after`, `::marker`), las clases de estado (`&.is-open`) y los atributos (`&[aria-expanded="true"]`) del propio componente.

## Anidar sin `&`

Un selector anidado que empieza por una etiqueta, una clase o un atributo es un **descendiente**: `h2` dentro de `.recipe` es `.recipe h2`, igual que `& h2`. Y si empieza por un combinador, se une con ese combinador: `> ul` es `.recipe > ul`, y `+ .note` es `.recipe + .note`.

[[exercise:02-anidar-sin-ampersand.md]]

Es la **sintaxis relajada**. La primera versión del anidamiento (Chrome 112) no permitía que un selector anidado empezara por una letra, y había que escribir `& h2`; lo verás en código de 2023. Desde Chrome 120 ya no hace falta.

Un detalle que conviene tener presente, y que es igual en Sass: el espacio importa. `&:hover` es el propio elemento con el ratón encima; `& :hover` (con espacio), o `:hover` a secas, es **cualquier descendiente** con el ratón encima. La regla es válida y el navegador no avisa: simplemente selecciona otra cosa.

## El padre en otro sitio

`&` no tiene por qué ir al principio. Al final, describe al componente en un **contexto**; repetido, relaciona dos copias del componente:

- `.sidebar &` → `.sidebar .alert`: la alerta cuando vive en una barra lateral.
- `& + &` → `.alert + .alert`: la alerta que sigue a otra.
- `.theme-dark &`, `:is(dialog, [popover]) &`: cualquier selector que contenga `&` vale.

[[exercise:04-el-contexto-detras.md]]

## Condiciones dentro de la regla

Las at-rules condicionales también se anidan: `@media`, `@container`, `@supports`, `@layer`, y además `@scope` (lección 3) y `@starting-style` (módulo de animación). Las declaraciones que van directamente dentro son del selector de fuera, y dentro puede haber más reglas anidadas.

```css
.product {
  display: grid;

  @container (width >= 20rem) {        /* = @container (…) { .product { … } } */
    grid-template-columns: 5rem 1fr;
  }

  @supports (text-wrap: balance) {
    .product-title { text-wrap: balance; }   /* .product .product-title */
  }
}
```

Es la mayor ventaja práctica del anidamiento: cada componente lleva consigo sus adaptaciones, en lugar de tenerlas repartidas en una `@media` al final del archivo.

[[exercise:03-reglas-condicionales-dentro.md]]

`@layer` dentro de una regla es raro, pero tiene su lógica: las declaraciones van a esa capa y, por tanto, pierden contra cualquier regla sin capa. En el ejemplo, la capa pone el borde (nadie más lo declara) pero no el fondo (la declaración sin capa le gana, aunque esté escrita antes).

## Cómo lo lee el navegador: `&` es `:is()`

Sass sustituye `&` por texto. El navegador, en cambio, guarda las reglas anidadas tal como las escribiste (en el CSSOM, una regla puede contener reglas) y trata `&` como si fuera **`:is(selector de fuera)`**:

| Escribes | El navegador lo trata como |
|---|---|
| `.card { & h2 {} }` o `.card { h2 {} }` | `:is(.card) h2` |
| `.card { &:hover {} }` | `:is(.card):hover` |
| `.card { .sidebar & {} }` | `.sidebar :is(.card)` |
| `.card, #promo { & h2 {} }` | `:is(.card, #promo) h2` |
| `.a .b { .c & {} }` | `.c :is(.a .b)` |

Para un selector de fuera sencillo, como `.card`, el resultado es idéntico al de Sass. Las sorpresas aparecen con selectores de fuera más complejos, por dos propiedades de `:is()`. La primera ya la conoces de la lección de especificidad; la segunda es más sutil:

- **Su especificidad es la de su argumento más específico.** Si la lista de fuera tiene un id, todo lo anidado pesa como si tuviera un id.
- **Compara el selector entero, no el texto.** `.c :is(.a .b)` pide un `.b` que esté dentro de un `.a` y también dentro de un `.c`, sin importar cuál de los dos está más arriba; el `.c .a .b` de Sass exige ese orden exacto, con `.c` por encima de `.a`. El nativo selecciona más elementos.

## Las diferencias con Sass

La tabla las reúne todas; las tres que causan errores difíciles de ver tienen su propio apartado y su ejemplo.


| | Sass | CSS nativo |
|---|---|---|
| Qué recibe el navegador | CSS plano: el anidamiento desaparece al compilar | las reglas anidadas tal cual |
| `&__title`, `&--featured`, `&-icon` | pega texto: `.card__title` | no pega texto: no selecciona nada |
| `.card, #promo { & h2 {} }` | `.card h2, #promo h2`: cada una con su especificidad | `:is(.card, #promo) h2`: todas pesan (1,0,1) |
| `.a .b { .c & {} }` | `.c .a .b` | `.c :is(.a .b)`: selecciona más |
| Declaraciones después de una regla anidada | se quedan en su sitio (Sass 1.98) | en su sitio desde Chrome 130; antes subían al principio |
| `@extend`, `@at-root`, propiedades anidadas (`font: { family: … }`) | sí | no existen |

### Los sufijos no se pegan

En Sass, `&__title` dentro de `.event-card` genera `.event-card__title`: es la forma habitual de escribir BEM, la metodología de la lección siguiente. El navegador no pega texto: `&` es un selector entero y `__title` se lee como el nombre de una **etiqueta**. La regla queda como `__title:is(.event-card)`, un elemento `<__title>` con la clase `event-card`, que no existe. No hay error: la regla es válida y no selecciona nada.

[[exercise:05-los-sufijos-no-se-pegan.md]]

En CSS nativo, los elementos y modificadores de BEM se escriben **enteros**, como reglas de una clase. Es lo primero que hay que reescribir al pasar un archivo de Sass a CSS nativo.

### Una lista de fuera con un id

Si el selector de fuera es una lista, el navegador la envuelve en `:is()` y la regla anidada pesa lo que el selector **más específico** de la lista, en **todos** los elementos. Con un id en la lista, una regla posterior de dos clases ya no consigue ganar, ni siquiera en los elementos que no tienen ese id:

[[exercise:06-lista-de-padres-y-especificidad.md]]

La solución es no mezclar selectores de peso distinto en la lista de fuera: dos reglas separadas, o el selector pesado rebajado con `:where()`, que pesa cero.

### Las declaraciones después de una regla anidada

Lo natural es escribir primero las declaraciones y después las reglas anidadas, pero nada impide mezclarlas. ¿Qué pasa con una declaración escrita **después** de una `@media` anidada? Hoy, lo que esperas: se queda en su sitio y, si compite con la `@media`, gana por orden de aparición. El navegador la guarda en un bloque propio, una regla de tipo `CSSNestedDeclarations`, detrás de la `@media`. Hasta Chrome 130 (finales de 2024) no era así: las declaraciones sueltas se subían al principio del bloque, y la `@media` ganaba.

[[exercise:07-declaraciones-despues-de-reglas.md-]]

Al ejecutarlo, el script lee las reglas de la hoja (un adelanto del capítulo 6) y el color calculado:

```text
Dentro de .badge → CSSMediaRule, CSSNestedDeclarations
Fondo calculado → rgb(187, 247, 208)
```

`rgb(187, 247, 208)` es `#bbf7d0`, el verde de la última declaración. Aunque los navegadores actuales ya lo hacen bien, el consejo sigue valiendo: declaraciones primero, reglas anidadas después. Es más fácil de leer, y así no dependes de la versión del navegador.

## Cuánto anidar

El anidamiento invita a copiar la estructura del HTML: la cabecera, dentro su `nav`, dentro su `ul`, dentro cada `li`, dentro cada enlace. Se ve ordenado, pero el selector resultante es `.site-header nav ul li a`, de especificidad **(0,1,4)**, y cualquier clase que quieras aplicar a uno de esos enlaces pierde:

[[exercise:08-sobre-anidar.md]]

Son los dos problemas de siempre, los mismos que en Sass: la especificidad crece con cada nivel, y los estilos quedan atados a una estructura concreta del HTML. Las reglas que funcionan:

- **Un nivel, dos como mucho.** Si necesitas un tercero, probablemente falta una clase.
- **Anida solo lo que pertenece al componente:** sus estados, sus pseudoelementos, sus modificadores de estado (`&.is-sold-out`), sus contextos (`.sidebar &`) y sus condiciones (`@media`, `@container`).
- **Los elementos del componente, como reglas planas de una clase** (`.event-card__title`). Anidarlos (`.event-card { .event-card__title {} }`) funciona, pero sube su especificidad a (0,2,0) sin necesidad.
- **Declaraciones primero, reglas anidadas después.**

Un componente escrito así:

[[exercise:09-un-componente-bien-anidado.md]]

## Cómo verlo en DevTools

- **Elements → Styles** muestra las reglas anidadas con su regla madre encima, tal como las escribiste. Las de una `@media` o una `@container` anidada aparecen bajo el encabezado de su condición.
- **La especificidad**: pasa el ratón por un selector en el panel Styles y Chrome muestra su especificidad, ya calculada como `:is()`. Es la forma rápida de descubrir que el `& h2` del ejemplo 6 pesa (1,0,1).
- **Computed** te dice qué declaración ganó y de qué regla viene; un clic en la flecha te lleva a ella.

## Bestiario

- **`&__title` no selecciona nada.** Síntoma: los elementos y modificadores BEM escritos con `&__x` o `&--y` no reciben estilos, y no hay ningún error. Causa: el anidamiento nativo no pega texto; `__title` se lee como el nombre de una etiqueta. Solución: escribe las clases BEM enteras, como reglas planas de una clase. → [ver ejemplo](05-los-sufijos-no-se-pegan.md)
- **Una regla anidada gana a todo, también donde no hay id.** Síntoma: con `.card, #promo { & h2 {} }`, una regla posterior como `.card .title` no consigue cambiar el título de ninguna tarjeta. Causa: la lista de fuera se trata como `:is(.card, #promo)`, que pesa lo que su selector más específico, en todos los elementos. Solución: reglas separadas, o `:where()` para el selector pesado. → [ver ejemplo](06-lista-de-padres-y-especificidad.md)
- **La declaración de después pierde contra la `@media` (en navegadores antiguos).** Síntoma: una declaración escrita detrás de una regla anidada no gana, aunque esté la última. Causa: antes de Chrome 130, las declaraciones sueltas se subían al principio del bloque. Solución: declaraciones primero, reglas anidadas después; los navegadores actuales ya respetan el orden. → [ver ejemplo](07-declaraciones-despues-de-reglas.md)
- **La clase de un enlace no se aplica dentro del menú.** Síntoma: `.button` funciona en toda la página menos dentro de la cabecera. Causa: anidar copiando el HTML genera selectores como `.site-header nav ul li a` (0,1,4). Solución: una clase por pieza y como mucho dos niveles de anidamiento. → [ver ejemplo](08-sobre-anidar.md)

## Resumen

- CSS anida reglas sin preprocesador: el navegador lee el anidamiento tal cual.
- `&` es el selector de fuera completo; pegado (`&:hover`, `&.is-open`, `&::after`) habla del mismo elemento; al final (`.sidebar &`) describe un contexto.
- Sin `&`, un selector anidado es un descendiente; si empieza por `>`, `+` o `~`, se une con ese combinador.
- `@media`, `@container`, `@supports` y `@layer` se anidan dentro de la regla, con declaraciones del selector de fuera.
- El navegador trata `&` como `:is()`: una lista de fuera pesa lo que su selector más específico, y no se puede pegar texto (`&__title` no funciona).
- Declaraciones primero y reglas anidadas después; uno o dos niveles; los elementos, como reglas planas de una clase.

## Para profundizar

- [MDN: Usar el anidamiento de CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting)
- [MDN: El selector de anidamiento &](https://developer.mozilla.org/en-US/docs/Web/CSS/Nesting_selector)
- [MDN: Anidamiento y especificidad](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Nesting_and_specificity)
- [Chrome for Developers: CSS nesting relaxed syntax update](https://developer.chrome.com/blog/css-nesting-relaxed-syntax-update)
- [Especificación: CSS Nesting Module](https://www.w3.org/TR/css-nesting-1/)
