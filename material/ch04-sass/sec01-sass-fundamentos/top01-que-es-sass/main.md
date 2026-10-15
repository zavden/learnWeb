# Qué es Sass

## Por qué importa

Has terminado el capítulo de CSS y ya sabes que el CSS moderno tiene variables, anidamiento y funciones de color. Aun así, una hoja de estilos real repite muchísimo: diez variantes de botón casi iguales, una escala de espacios con veinte clases de utilidad, seis tipos de alerta que solo cambian de color. **Sass** es el preprocesador de CSS más usado: un lenguaje que se parece a CSS, le añade variables, funciones, bucles y módulos, y se convierte en CSS normal **antes** de que el navegador lo vea.

Esa última idea, «antes del navegador», es la clave de todo el capítulo. Explica lo que Sass puede hacer, lo que no puede hacer y casi todos sus comportamientos sorprendentes.

## Un preprocesador: CSS antes del navegador

Un **preprocesador** es un programa que transforma un archivo en otro antes de usarlo. Sass lee archivos `.scss`, los **compila** y escribe archivos `.css`. Lo que publicas en tu web es el `.css`:

```text
 styles.scss  ──►  compilador Sass  ──►  styles.css  ──►  navegador
 (lo que tú        (en tu ordenador,      (lo que se        (solo entiende
  escribes)         al construir)          publica)          CSS)
```

El navegador **nunca** descarga ni ejecuta Sass. Cuando la página está abierta, Sass ya no existe: hizo su trabajo una vez, en tu ordenador o en el servidor que construye la web, y dejó como resultado un CSS normal y corriente.

> **Desde Python:** si has usado plantillas Jinja (o las de Django), ya conoces la idea. En una plantilla escribes `{{ price }}` y `{% for item in items %}`, el servidor la procesa y el navegador recibe HTML final, sin rastro de las llaves. Sass es lo mismo para CSS: `$brand` o `@each` se resuelven al compilar, y el navegador solo recibe el resultado.

## Tu primer archivo SCSS

Este es el aspecto de Sass: variables que empiezan por `$`, reglas anidadas unas dentro de otras y cuentas como `$space * 0.5`. El resultado en la página es una tarjeta normal:

[[exercise:01-primer-scss.md]]

Y este es su código. Las pestañas `index.html` y `styles.scss` son lo que escribes; la última, `compiled.css`, es lo que Sass genera y lo que de verdad recibe la página:

[[exercise:01-primer-scss.md-(index.html|styles.scss|compiled.css)]]

Fíjate en tres cosas del CSS generado: las variables han desaparecido (en su lugar está `#2563eb`), la regla anidada `h2` se ha convertido en `.card h2`, y `$space * 0.5` es ahora `8px`. Cada lección de este capítulo añade una herramienta, pero todas funcionan igual: se resuelven al compilar y dejan CSS.

## Ver el CSS generado en LearnWeb

Como el navegador solo ve el CSS generado, aprender Sass consiste en buena parte en **comparar** lo que escribes con lo que sale. LearnWeb lo muestra en tres sitios:

- En la teoría, el código de cada ejemplo Sass tiene una pestaña **`compiled.css`** justo después de `styles.scss`. Es de solo lectura y siempre coincide con lo que recibe la vista previa.
- Cuando el compilador dice algo (un aviso, un mensaje de depuración o un error), aparece además la pestaña **`sass-output.txt`**, con líneas como `styles.scss:32 Error: Undefined variable.`
- En el editor, el botón **«CSS»** de la barra de la vista previa muestra el CSS generado y esos mensajes encima de la página, y la barra de estado los lista bajo «Compile».

Acostúmbrate a abrir el CSS generado en cada ejemplo de este capítulo. Es la forma más rápida de entender qué hace cada cosa y, sobre todo, de descubrir cuándo Sass genera algo distinto de lo que esperabas.

En DevTools pasa lo mismo que en la página: **Elements → Styles** muestra el CSS generado (`.card h2`), no tu SCSS. En un proyecto real, Sass escribe además un **source map** (`styles.css.map`), un archivo que relaciona cada regla del CSS con su línea del `.scss`; con él, DevTools enlaza cada regla con su línea original. Los ejemplos de LearnWeb no lo necesitan, porque tienes la pestaña `compiled.css`.

## SCSS es CSS con extras

Sass tiene dos sintaxis, y la más usada, **SCSS** («Sassy CSS»), es un **superconjunto** de CSS: cualquier hoja CSS válida es también SCSS válido. El siguiente ejemplo no usa ninguna función de Sass, solo CSS moderno (capas, custom properties, `:has()`, `clamp()`, `color-mix()`), y Sass lo deja pasar tal cual:

[[exercise:02-css-es-scss-valido.md-(styles.scss|compiled.css)]]

Eso permite empezar a usar Sass sin reescribir nada: renombras `styles.css` a `styles.scss` y vas añadiendo variables, funciones o mixins donde te ayuden. Sass solo **reformatea** el resultado (sangrías, saltos de línea, `16 / 9` pasa a `16/9`) y quita los comentarios `//`.

[[exercise:02-css-es-scss-valido.md]]

## Comentarios

SCSS admite dos tipos de comentario, y no llegan igual al CSS:

| Comentario | En el CSS generado |
|---|---|
| `// una línea` | desaparece |
| `/* bloque */` | se copia (salvo en el modo comprimido) |
| `/*! importante */` | se copia siempre, incluso comprimido (avisos de licencia) |

[[exercise:03-comentarios.md-(styles.scss|compiled.css)]]

En CSS puro, `//` no es un comentario: es un error de sintaxis que puede llevarse por delante la regla siguiente. En SCSS es la forma normal de comentar, y es la que usan los ejemplos de este capítulo para que el CSS generado quede limpio.

## Dos sintaxis: SCSS y la indentada

La sintaxis original de Sass (2006), llamada **sintaxis indentada**, no tiene llaves ni punto y coma: la indentación marca qué va dentro de qué, como en Python. Se guarda en archivos `.sass`. La misma tarjeta del primer ejemplo:

[[exercise:04-sintaxis-indentada.md-(styles.sass|compiled.css)]]

| | SCSS (`.scss`) | Indentada (`.sass`) |
|---|---|---|
| Bloques | llaves `{ }` | indentación |
| Fin de declaración | `;` | salto de línea |
| CSS válido | sí, cualquier CSS | no: hay que convertirlo |
| Uso hoy | la gran mayoría de proyectos (Bootstrap, por ejemplo) | proyectos que prefieren la sintaxis corta |

Las dos son el **mismo lenguaje**, con las mismas funciones, y generan el mismo CSS; el nombre del lenguaje es Sass en ambos casos. En este curso se usa SCSS, porque es la que encontrarás en casi todos los proyectos y porque todo lo que sabes de CSS sigue valiendo.

[[exercise:04-sintaxis-indentada.md]]

## Sass calcula al compilar

Sass sabe hacer cuentas con números y unidades: `16px * 1.5` es `24px`. Las hace **una sola vez, al compilar**, y el CSS solo contiene el resultado. Cambia `$base` en este ejemplo y mira cómo cambian todos los tamaños de `compiled.css`:

[[exercise:05-sass-calcula-al-compilar.md-(styles.scss|compiled.css)]]

[[exercise:05-sass-calcula-al-compilar.md]]

Esto tiene una consecuencia directa: Sass solo puede calcular con lo que conoce **al compilar**. ¿Cuánto mide `100%`? Depende del ancho del elemento padre, que depende de la ventana, que solo existe en el navegador. Por eso Sass no puede restar `100% - 240px` y se detiene con un error:

[[exercise:06-porcentaje-menos-pixeles.md-(styles.scss|sass-output.txt)]]

La solución es dejar la cuenta para el navegador con `calc()`, la función de CSS que ya conoces. Sass entiende `calc()`: sustituye las variables que haya dentro y copia el resto al CSS, de modo que `calc(100% - $sidebar)` llega al navegador como `calc(100% - 240px)`. Esta frontera entre **lo que se sabe al compilar** y **lo que solo se sabe en el navegador** volverá a aparecer en la próxima lección, con las variables.

## Todo o nada: cuando Sass falla

En CSS, un valor inválido anula solo su declaración y el resto de la hoja sigue funcionando (lo viste en la primera lección de CSS). Sass, en cambio, es un **compilador**, como el de cualquier lenguaje de programación: si encuentra un error, se detiene y **no genera nada**. Una sola variable mal escrita deja la página entera sin estilos:

[[exercise:07-un-error-deja-sin-css.md]]

[[exercise:07-un-error-deja-sin-css.md-(styles.scss|sass-output.txt)]]

En LearnWeb, la vista previa muestra la página sin CSS y el error debajo; en `sass-output.txt` lo tienes con el formato de la línea de comandos: archivo, línea y mensaje (`styles.scss:32 Error: Undefined variable.`). Ve a esa línea y busca el fallo. En la última lección del módulo aprenderás a leer los errores más habituales y a lanzar los tuyos.

> **Desde Python:** es el mismo comportamiento que un `SyntaxError` o un `NameError` al importar un módulo: el programa no llega a ejecutarse a medias. La diferencia con el CSS que ya conoces es justo esa: el navegador perdona, el compilador no.

## Sass fuera de LearnWeb

En LearnWeb, la aplicación compila cada ejemplo por ti con **Dart Sass**, la implementación oficial (aquí, la versión 1.98). En un proyecto real lo instalas con npm y lo ejecutas desde la terminal:

```text
$ npm install --save-dev sass
$ npx sass src/main.scss dist/main.css --watch
Compiled src/main.scss to dist/main.css.
Sass is watching for changes. Press Ctrl-C to stop.
```

- `npx sass entrada.scss salida.css` compila una vez.
- `--watch` deja el compilador vigilando: cada vez que guardas un `.scss`, regenera el `.css`.
- `--style=compressed` genera CSS sin espacios ni comentarios, para publicar.
- Por defecto escribe también el source map (`main.css.map`); `--no-source-map` lo desactiva.
- Si hay un error, la terminal lo muestra con la línea y un extracto del código, y el CSS que escribe enseña el mensaje en la propia página (en un `body::before`), para que no pase desapercibido.

Las herramientas de construcción modernas, como Vite (la que usa la propia LearnWeb), compilan los `.scss` automáticamente en cuanto el paquete `sass` está instalado. Si en un proyecto antiguo ves `node-sass` o LibSass, son implementaciones abandonadas que no entienden el Sass moderno de este capítulo.

## ¿Sigue haciendo falta Sass?

Cuando nació Sass, CSS no tenía variables ni anidamiento. Hoy los tiene, así que conviene saber qué aporta cada uno:

| Necesidad | CSS moderno | Sass |
|---|---|---|
| Valores con nombre | custom properties (cambian en vivo, se heredan) | variables `$` (desaparecen al compilar) |
| Anidamiento | nativo, con algunas diferencias | sí, desde siempre |
| Derivar colores | `color-mix()`, colores relativos | módulo `sass:color` |
| Generar clases en bucle (`.mt-1` … `.mt-8`) | no | `@each`, `@for` |
| Funciones con lógica | no (solo `calc()` y compañía) | `@function`, `@if` |
| Reutilizar bloques de declaraciones | no | `@mixin` |
| Dividir en archivos con dependencias claras | `@import` (más peticiones) | módulos `@use`, un solo CSS final |
| Comprobar errores antes de publicar | no | `@error`, el compilador avisa |

Muchos equipos usan los dos: Sass para **generar** y organizar el CSS, y custom properties para lo que tiene que **cambiar en el navegador** (temas, estados). Al terminar el capítulo sabrás elegir en cada caso.

## Bestiario

- **Sass no sabe restar porcentajes y píxeles.** *Síntoma:* `width: 100% - $sidebar` detiene la compilación con «100% and 240px have incompatible units». *Causa:* Sass hace las cuentas al compilar, y el valor real de un porcentaje solo se conoce en el navegador, cuando hay un elemento padre con un ancho. *Solución:* deja la cuenta para el navegador con `calc(100% - $sidebar)`. [Ver ejemplo](06-porcentaje-menos-pixeles.md).
- **Un solo error deja la página sin ningún estilo.** *Síntoma:* toda la página aparece con los estilos por defecto del navegador, no solo el elemento que tocabas. *Causa:* Sass es un compilador: ante un error (aquí, una variable mal escrita) no genera CSS, ni siquiera el de las reglas correctas. *Solución:* lee el mensaje de `sass-output.txt` (archivo, línea y mensaje) y corrige esa línea. [Ver ejemplo](07-un-error-deja-sin-css.md).

## Resumen

- Sass es un preprocesador: compila archivos `.scss` a `.css` antes de publicar. El navegador solo recibe CSS.
- SCSS es un superconjunto de CSS: cualquier CSS válido es SCSS válido. La sintaxis indentada (`.sass`) es el mismo lenguaje sin llaves ni `;`.
- Variables, anidamiento y cuentas se resuelven al compilar; en el CSS generado solo quedan los resultados.
- Sass no puede calcular lo que depende de la página (porcentajes, viewport): para eso está `calc()`.
- Los comentarios `//` desaparecen; los `/* */` se copian; los `/*! */` sobreviven a la compresión.
- Un error de Sass deja la página sin CSS: lee el archivo, la línea y el mensaje.
- En LearnWeb, mira siempre la pestaña `compiled.css` (y `sass-output.txt`) o el botón «CSS» del editor.

## Para profundizar

- [Sass: Sass Basics (guía oficial)](https://sass-lang.com/guide/)
- [Sass: Syntax (SCSS e indentada)](https://sass-lang.com/documentation/syntax/)
- [Sass: Dart Sass Command-Line Interface](https://sass-lang.com/documentation/cli/dart-sass/)
- [MDN: CSS preprocessor](https://developer.mozilla.org/en-US/docs/Glossary/CSS_preprocessor)
- [Sass blog: LibSass is Deprecated](https://sass-lang.com/blog/libsass-is-deprecated/)
