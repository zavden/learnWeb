# Integración: Sass desde cero

## Qué vas a practicar

En las lecciones de este módulo viste cada herramienta de Sass por separado: variables y su ámbito, anidamiento y `&`, mixins con `@content`, funciones y módulos integrados, control de flujo, `@extend` y las herramientas de depuración. En un proyecto real aparecen juntas, y casi siempre con el mismo objetivo: **generar mucho CSS correcto a partir de poca configuración**, sin perder de vista lo que el navegador recibe.

Cada ejemplo de esta página combina varias de esas ideas. Antes de leer el código Sass, mira la vista previa y después la pestaña `compiled.css`: pregúntate **qué parte del CSS generado sale de cada línea de Sass** y qué ocurre al cambiar la configuración. Muchos ejemplos tienen una sección de configuración al principio, con mapas y valores `!default`: cámbialos en el editor y observa cómo cambia el resultado. Al final hay tres ejercicios con su solución.

Tres ideas recorren todos los ejemplos:

- **Sass decide, el navegador cambia.** Los valores se calculan al compilar, pero todo lo que debe cambiar con un tema o un estado se publica como custom property con `#{}`.
- **Datos separados de las reglas.** Las variantes, los tamaños y los breakpoints viven en mapas; los bucles los convierten en reglas.
- **Un CSS generado ajustado.** Las declaraciones comunes se escriben una vez; cada variante añade solo datos.

## Un sistema de botones

Cinco variantes de color y tres tamaños salen de dos **mapas**. Un **`@each`** genera cada variante; **`sass:color`** deriva el hover, el estado activo, el anillo de foco, el color del contorno y el fondo suave; una **función con `@if`** elige el color del texto según la luminosidad del fondo; y una función `tidy()` redondea los canales para que el CSS sea legible. La clave está en la arquitectura: la regla `.btn` tiene todas las declaraciones, y cada variante solo fija **custom properties**.

[[exercise:01-sistema-de-botones.md]]

[[exercise:01-sistema-de-botones.md-(styles.scss|compiled.css)]]

Fíjate en el botón ámbar: su texto es oscuro, no blanco, porque `text-on()` lo decide al compilar. Y en los contornos: el texto usa un tono más oscuro de la variante, calculado para que cumpla el contraste sobre blanco.

## Un generador de utilidades

El patrón de las librerías de utilidades. Unos mapas configurables con **`!default`** (espacios, propiedades y breakpoints), un **mixin que genera reglas completas** con dos **`@each`** anidados e **interpolación** en el selector y en el nombre de la propiedad, y el **mixin de breakpoints** con su guarda para generar las variantes `-md-`. Todo va dentro de **`@layer utilities`**, así que las utilidades ganan a los componentes sin subir la especificidad.

[[exercise:02-generador-de-utilidades.md]]

[[exercise:02-generador-de-utilidades.md-(styles.scss|compiled.css)]]

Mira el tamaño de `compiled.css`: 72 reglas para una página que usa 10. Los comentarios del final explican cómo se controla ese crecimiento, que es la gran desventaja de este patrón.

## Temas que cambian en el navegador

La combinación más importante del módulo. Los temas viven en un **mapa de mapas** de Sass; un **mixin** con **`@each`** los escribe como **custom properties** (con interpolación en el nombre y en el valor); y una regla con **`:has(:checked)`** por cada tema los activa en el navegador, sin una línea de JavaScript. Los componentes solo conocen `var(--color-…)`.

[[exercise:03-temas-con-custom-properties.md]]

[[exercise:03-temas-con-custom-properties.md-(styles.scss|compiled.css)]]

El tema por defecto se escribe en `:root` y no necesita su propia regla `:has()`: cuando ningún otro tema está marcado, se usan los valores de la raíz. También verás un detalle de Sass: `(dark,)`, con coma, es una lista de un solo elemento, igual que una tupla de Python.

## Breakpoints con guarda

Tres mixins con **`@content`** (`up`, `down` y `between`) escriben las media queries con la sintaxis de rangos, y todos pasan por una **función** que valida el nombre con **`@error`**. Los avisos de cada tramo comparten un **placeholder** extendido fuera de cualquier `@media`, el uso seguro de `@extend`.

[[exercise:04-breakpoints-con-guarda.md]]

[[exercise:04-breakpoints-con-guarda.md-(styles.scss|compiled.css)]]

## Una escala tipográfica fluida

**`math.pow`** calcula cada paso de la escala con un ratio distinto en móvil y en pantallas anchas; una **función** devuelve un **`clamp()`** que Sass completa hasta donde puede; **`@for`** publica cada paso como custom property (`--step--1` … `--step-4`); y **`@debug`** enseña en `sass-output.txt` los valores de cada paso.

[[exercise:05-escala-tipografica-fluida.md]]

[[exercise:05-escala-tipografica-fluida.md-(styles.scss|sass-output.txt|compiled.css)]]

## Una tarjeta BEM

Un componente completo escrito con **anidamiento**: elementos y modificadores con **`&__`** y **`&--`**, estados con **`&:has()`** y **`&.is-sold-out`**, un **mixin** de hover y foco y una **container query anidada** que pone la tarjeta en horizontal cuando ella misma es ancha. El enlace cubre toda la tarjeta, y el anillo de foco lo dibuja la tarjeta entera.

[[exercise:06-tarjeta-bem.md]]

[[exercise:06-tarjeta-bem.md-(styles.scss|compiled.css)]]

En el CSS generado, casi todos los selectores son de una sola clase. Es la razón de que BEM y el anidamiento de Sass se lleven tan bien, y también de que estos sufijos sean lo primero que se rompe al pasar a anidamiento nativo.

## Alertas de tres maneras

Las mismas alertas, escritas con un **placeholder + `@extend`**, con un **mixin** y con una **clase base + custom properties** generadas con **`@each`**. Compara las tres partes de `compiled.css` y los tamaños medidos en el comentario final: la tercera técnica genera casi tan poco CSS como `@extend`, sin ninguna de sus trampas.

[[exercise:07-alertas-tres-maneras.md-(styles.scss|compiled.css)]]

[[exercise:07-alertas-tres-maneras.md]]

## Un generador de rejilla

Una rejilla de 12 columnas con clases **`.span-N`** generadas con **`@for … through`** y sus versiones responsive con el **mixin de breakpoints**, todo configurable con **`!default`**. Un **`@debug`** cuenta las clases generadas, y un comentario explica por qué el orden del mapa de breakpoints decide qué clase gana.

[[exercise:08-generador-de-rejilla.md]]

[[exercise:08-generador-de-rejilla.md-(styles.scss|sass-output.txt|compiled.css)]]

## Ejercicios

Cada ejercicio tiene el HTML y un pequeño script bloqueados: solo se trabaja en el SCSS, en los puntos marcados con `TODO`. El script es un adelanto del capítulo de JavaScript: lee el CSS que ha generado tu Sass y marca cada objetivo con ✅ o ❌ en la propia página (y en la consola). Al empezar, todo está en ❌.

**Genera las variantes del botón.** Un `@each` sobre un mapa, custom properties interpoladas, `color.scale` y un estado de foco con `&`.

[[exercise:09-ej-variantes-de-boton.md]]

**Caza los cinco errores silenciosos.** Un archivo que compila sin errores ni avisos, pero con cinco fallos de los bestiarios del módulo. Cada uno se arregla con una línea.

[[exercise:10-ej-caza-de-errores.md]]

**Publica los temas de un mapa como custom properties.** Un mixin con `@each` e interpolación en el nombre y en el valor, y un tema oscuro activado con `:has(:checked)`.

[[exercise:11-ej-tema-desde-un-mapa.md]]

## Lo que conviene llevarse

- Configuración en mapas (con `!default` si otros van a usarla) y reglas generadas con bucles: añadir una variante es añadir una línea.
- Lo común se escribe una vez; las variantes, como custom properties. El CSS generado crece despacio y los valores se pueden cambiar en el navegador.
- Todo lo que cambia con un estado o un tema tiene que llegar al navegador como custom property, siempre con `#{}`.
- Valida los nombres que reciben tus mixins y funciones con `@error`: un error pronto y claro vale más que una media query rota en silencio.
- Mira siempre `compiled.css`: es la única forma de saber cuánto CSS generas y si es el que querías.
