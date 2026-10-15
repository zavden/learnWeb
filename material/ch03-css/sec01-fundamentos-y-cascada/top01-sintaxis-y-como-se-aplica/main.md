# Sintaxis y cómo se aplica el CSS

## Por qué importa

El HTML dice **qué es** cada cosa; el CSS (*Cascading Style Sheets*, «hojas de estilo en cascada») dice **cómo se ve**. Antes de aprender propiedades conviene entender dos hechos que sorprenden a casi todo el mundo:

1. Una página sin una sola línea de CSS **ya tiene estilos**: los pone el navegador.
2. El CSS **nunca da errores**. Lo que el navegador no entiende lo descarta en silencio y sigue leyendo.

Casi todos los «mi CSS no hace nada» se explican con uno de esos dos hechos. En esta lección aprenderás a leer una hoja de estilos con los ojos del navegador.

## La regla: selector y declaraciones

Una hoja de estilos es una lista de **reglas**. Cada regla dice «a estos elementos, aplícales estas propiedades»:

```text
 selector          bloque de declaraciones
 ┌─┴─┐  ┌─────────────────────┴─────────────────────┐
 h1, p  {  color: #1e3a8a;   font-family: Georgia;  }
           └─┬─┘  └──┬──┘
         propiedad valor
           └──────┬──────┘
             declaración
```

| Pieza | Qué es | Ejemplo |
|---|---|---|
| Regla | un selector + un bloque entre llaves | `p { color: navy; }` |
| Selector | a qué elementos se aplica | `p`, `.lead`, `#menu a` |
| Declaración | un par `propiedad: valor` terminado en `;` | `color: navy;` |
| Propiedad | qué aspecto cambias | `color`, `background`, `padding` |
| Valor | cómo lo cambias | `navy`, `#fde68a`, `12px`, `Georgia, serif` |

Detalles de sintaxis que conviene saber desde el principio:

- Los espacios y saltos de línea entre las piezas no importan: `p{color:navy}` equivale a la versión con sangría.
- El `;` **separa** declaraciones. El último antes de `}` es opcional, pero ponlo siempre: así, añadir una línea nunca rompe la anterior.
- Los nombres de propiedad no distinguen mayúsculas (`COLOR` funciona), pero se escriben en minúsculas. Los nombres de clase e id **sí** las distinguen (lo verás en la lección de selectores).
- Varias reglas pueden aplicarse al mismo elemento y sus declaraciones **se suman**. Si dos chocan en la misma propiedad, decide la cascada (lecciones de especificidad y de cascada).

En este ejemplo, el párrafo con clase recibe declaraciones de las dos reglas:

[[exercise:01-anatomia-de-una-regla.md]]

Y este es su código, con cada pieza comentada:

[[exercise:01-anatomia-de-una-regla.md-]]

> **Propiedades que usaremos sin presentarlas.** Para que los ejemplos se vean, usaremos unas pocas propiedades sencillas: `color` (texto), `background` (fondo), `border` (borde), `padding` (relleno interior), `margin` (margen exterior), `outline` (contorno), `font-weight` (grosor de letra) y `font-family` (fuente). Cada una tiene su lección más adelante; por ahora basta con su efecto visual. Los colores se escriben con nombre (`navy`) o en hexadecimal (`#1e3a8a`); se explican en la lección de color.

## Comentarios

En CSS solo existe una forma de comentar: `/* … */`. Puede ocupar varias líneas y no se puede anidar: el primer `*/` cierra el comentario.

```css
/* Esto es un comentario.
   Puede ocupar varias líneas. */
p { color: navy; } /* también puede ir al final de una línea */
```

> **Desde Python:** en Python comentas con `#`. En CSS, `#` empieza un selector de id (`#menu`) o un color (`#ff0000`), y `//` **no** es un comentario: es texto inválido con efectos secundarios (lo verás en el Bestiario).

## Dónde se escribe el CSS

El navegador busca estilos en tres sitios:

| Forma | Cómo se escribe | Alcance | Cuándo usarla |
|---|---|---|---|
| Hoja externa | `<link rel="stylesheet" href="site.css">` en el `<head>` | todas las páginas que la enlacen | casi siempre: un archivo para muchas páginas, que se guarda en caché |
| Hoja interna | un elemento `<style>`, normalmente en el `<head>` | solo esa página | demos, pruebas, CSS crítico de una página |
| En línea | atributo `style="color: navy"` | solo ese elemento | casos puntuales o valores que pone JavaScript |

El estilo en línea no tiene selector, así que no admite `:hover`, `@media` ni nada que dependa de un selector. Además gana a casi cualquier regla de una hoja (lo verás en la lección de especificidad). Por eso se evita para el diseño general.

Desde una hoja también se pueden cargar otras con `@import url("otra.css");`, pero cada `@import` es una descarga que el navegador descubre tarde (primero tiene que descargar y leer la hoja que lo contiene). En producción se prefiere un `<link>` por hoja.

El navegador lee todas esas fuentes **en el orden en que aparecen en el documento** y con ellas construye el CSSOM (lo viste en «Del HTML a los píxeles»). Ese orden importa: cuando dos declaraciones empatan en todo lo demás, gana la que aparece después.

Este documento completo usa las tres formas a la vez:

[[exercise:02-tres-formas-de-incluir-css.md]]

> **En LearnWeb:** el bloque CSS de un ejemplo se inserta como un `<style>` dentro del `<head>`, y el bloque HTML va dentro del `<body>`. Los ejemplos `HTML-FULL`, como el anterior, son documentos completos escritos a mano. El archivo `site.css` vive en la carpeta `assets/` de este tema.

## La hoja de estilos del navegador

¿Por qué un `<h1>` sin CSS es grande y está en negrita? Porque el navegador trae su propia hoja de estilos: la **hoja del agente de usuario** (*user agent stylesheet*). La especificación de HTML describe cómo debe ser y todos los navegadores la siguen con pequeñas diferencias. Un extracto simplificado:

```css
html, body, p, h1, ul, section, div { display: block; }
head, script, style, [hidden] { display: none; }
body { margin: 8px; }
h1 { font-size: 2em; font-weight: bold; margin-block: 0.67em; }
p { margin-block: 1em; }
ul { list-style-type: disc; margin-block: 1em; padding-inline-start: 40px; }
a:link { color: #0000ee; text-decoration: underline; }
strong, b { font-weight: bold; }
em, i { font-style: italic; }
code, pre, kbd { font-family: monospace; }
```

(`margin-block` es el margen de arriba y abajo; `padding-inline-start`, el relleno del lado donde empieza el texto. Las propiedades lógicas se estudian en el módulo de tipografía.)

Este ejemplo no tiene ni una línea de CSS: todo lo que ves viene de esa hoja.

[[exercise:03-estilos-del-navegador.md]]

En DevTools (panel **Elements → Styles**) estas reglas aparecen marcadas como *user agent stylesheet*. Cuando una regla tuya declara la misma propiedad, gana a la del navegador por poco específica que sea: el **origen** autor (tú) va por delante del origen navegador. Es el primer criterio de la cascada y lo estudiarás, con sus raras excepciones, en la lección de cascada y capas.

La regla de esa hoja que más sorprende es `body { margin: 8px; }`: deja un marco alrededor de toda la página.

[[exercise:04-margen-del-body.md]]

Por eso casi todos los proyectos empiezan con un pequeño *reset* que pone a cero ese margen, entre otras cosas. Lo construirás línea a línea en el módulo de arquitectura CSS.

## CSS inválido: el navegador lo ignora y sigue

El CSS está diseñado para ser **compatible hacia delante**: un navegador de hace años tiene que poder leer una hoja escrita hoy, con propiedades que no conoce. Por eso su parser nunca se detiene ante un error: descarta el trozo más pequeño posible que contiene el error y continúa.

| Error | Qué se descarta |
|---|---|
| Propiedad desconocida o mal escrita (`backgroud`) | solo esa declaración |
| Valor inválido (`color: rojo`, `padding: 12`) | solo esa declaración (si es un atajo como `border`, el atajo entero) |
| Falta un `;` | esa declaración **y la siguiente**, que se fusionan en una sola inválida |
| Un selector inválido, aunque sea uno de una lista | **la regla completa** |
| At-rule desconocida (`@foo { … }`) | la at-rule entera, con su bloque |
| `@import` después de otras reglas | ese `@import` |
| `//` usado como comentario | la regla o la declaración siguiente |

> **Desde Python:** un error de sintaxis en Python detiene el programa con un `SyntaxError` que señala la línea. En CSS no hay excepción ni aviso en la consola: la línea, simplemente, no existe para el navegador. El único sitio donde lo verás es DevTools.

Cada declaración se valida por separado, así que un error no contamina a sus vecinas:

[[exercise:05-declaracion-invalida.md]]

Pero un `;` olvidado pega dos declaraciones en una sola, y se pierden las dos:

[[exercise:06-punto-y-coma-olvidado.md]]

Con los selectores la regla es más dura: una lista de selectores es **todo o nada**.

[[exercise:07-selector-invalido-en-lista.md]]

Y la trampa favorita de quien viene de JavaScript, C o Java: comentar con `//`.

[[exercise:08-comentarios-con-barras.md]]

**Cómo detectarlo.** En DevTools → Styles, las declaraciones descartadas aparecen **tachadas** con un icono de aviso («Invalid property value», «Unknown property name»). Las reglas con un selector inválido ni siquiera aparecen: si tu regla no está en la lista, revisa el selector.

Esta tolerancia también es una herramienta. El patrón clásico de *fallback* declara dos veces la misma propiedad: un navegador antiguo se queda con la primera porque no entiende la segunda; uno moderno se queda con la segunda porque es la última válida.

```css
.button {
  background: #2563eb;               /* para navegadores que no entienden oklch() */
  background: oklch(55% 0.2 260);    /* los modernos usan esta: es la última válida */
}
```

## At-rules: instrucciones que empiezan por @

Además de reglas normales, una hoja puede contener **at-rules**: instrucciones especiales que empiezan por `@`. Unas terminan en `;` y otras llevan un bloque con reglas dentro:

```css
@import url("tipografia.css");     /* sin bloque: termina en ; */

@media (width >= 500px) {          /* con bloque: sus reglas solo existen si se cumple la condición */
  body { background: #ecfccb; }
}
```

| At-rule | Para qué sirve | Dónde se estudia |
|---|---|---|
| `@media` | reglas que solo se aplican si el dispositivo cumple una condición | Diseño responsive |
| `@supports` | reglas que solo se aplican si el navegador entiende una propiedad | Diseño responsive |
| `@import` | cargar otra hoja (tiene que ir al principio) | esta lección |
| `@layer` | ordenar el CSS en capas | Cascada y capas |
| `@font-face` | cargar una fuente | Tipografía y texto |
| `@keyframes` | definir una animación | Transiciones y animaciones |
| `@container` | reglas según el tamaño del contenedor | Diseño responsive |
| `@property` | registrar una variable con tipo | Custom properties |

Este ejemplo usa `@media`; cambia el ancho de la vista previa para verla actuar:

[[exercise:09-una-at-rule-media.md]]

## Bestiario

- **El `body` tiene un margen que nadie ha escrito.** *Síntoma:* una cabecera con fondo de color no llega a los bordes; queda un marco alrededor de la página. *Causa:* la hoja del navegador aplica `body { margin: 8px; }`. *Solución:* `body { margin: 0; }`, normalmente dentro de un reset. [Ver ejemplo](04-margen-del-body.md).
- **Una declaración no hace nada y no hay ningún error.** *Síntoma:* la propiedad no se aplica, pero las demás de la regla sí. *Causa:* nombre mal escrito, valor que la propiedad no acepta o número sin unidad; el navegador la descarta en silencio. *Solución:* búscala tachada en DevTools → Styles y corrígela. [Ver ejemplo](05-declaracion-invalida.md).
- **Se pierden dos declaraciones seguidas.** *Síntoma:* fallan dos líneas contiguas aunque cada una parece correcta. *Causa:* falta el `;` de la primera y el navegador lee las dos como un solo valor inválido. *Solución:* termina siempre cada declaración con `;`, también la última. [Ver ejemplo](06-punto-y-coma-olvidado.md).
- **Una regla entera desaparece por culpa de un selector.** *Síntoma:* una regla con varios selectores no se aplica a ninguno, ni siquiera a los correctos. *Causa:* uno de los selectores de la lista es inválido (una errata, una pseudoclase que el navegador no conoce, un prefijo de otro navegador). *Solución:* separa en reglas distintas los selectores dudosos, o agrúpalos con `:is()`, que ignora los inválidos. [Ver ejemplo](07-selector-invalido-en-lista.md).
- **Un «comentario» con `//` se come lo que viene después.** *Síntoma:* fuera de un bloque desaparece la regla siguiente; dentro de un bloque, la declaración siguiente. *Causa:* `//` no es un comentario en CSS; es texto inválido que el parser descarta junto con lo que le sigue hasta el próximo `{…}` o `;`. *Solución:* comenta siempre con `/* … */`. [Ver ejemplo](08-comentarios-con-barras.md).

## Resumen

- Una regla es un **selector** más un **bloque** de declaraciones `propiedad: valor;`. Varias reglas pueden afectar al mismo elemento y sus declaraciones se suman.
- Solo hay un tipo de comentario: `/* … */`.
- El CSS llega por `<link>` (lo habitual), por `<style>` o por el atributo `style`; el navegador lo lee en orden de aparición.
- Sin CSS la página ya tiene estilos: la **hoja del navegador** (márgenes de `body`, `h1` y `p`, enlaces azules, viñetas…). Tus reglas le ganan.
- El CSS inválido se descarta **en silencio**: una declaración inválida se pierde sola; un selector inválido se lleva la regla entera.
- DevTools → Styles es tu consola de errores de CSS: busca las líneas tachadas.
- Las **at-rules** (`@media`, `@import`, `@layer`…) son instrucciones especiales; las irás conociendo a lo largo del curso.

## Para profundizar

- [MDN: CSS syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/Syntax)
- [MDN: CSS error handling](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_syntax/Error_handling)
- [MDN: At-rules](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule)
- [HTML Standard: Rendering (la hoja de estilos del navegador)](https://html.spec.whatwg.org/multipage/rendering.html)
- [web.dev: Learn CSS](https://web.dev/learn/css)
