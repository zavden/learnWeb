# Integración: contenido y semántica

## Por qué importa

En las lecciones de este módulo has visto cada familia de elementos por separado: el texto, las listas, los enlaces, las imágenes, las tablas, la estructura y la accesibilidad. En una página real aparecen todas a la vez y se apoyan unas en otras: un menú es una lista de enlaces dentro de un `<nav>` con nombre; una tarjeta de producto es un `<article>` dentro de una lista, con una imagen cuyo `alt` depende de lo que hay a su lado y un botón cuyo nombre tiene que entenderse sin la tarjeta; el índice de un documento es una lista anidada que repite la jerarquía de los títulos.

La pregunta que guía todos estos ejemplos es la misma: **¿qué entiende una máquina de esta página sin verla?** Un lector de pantalla, un buscador o el modo lectura del navegador no ven colores ni tamaños; leen elementos, atributos y nombres. Por eso cada ejemplo trae un pequeño script (un adelanto de JavaScript) que imprime en la consola lo que una máquina puede sacar del HTML: el índice de títulos, la lista de regiones, el nombre de cada enlace y cada botón, lo que se anuncia en cada celda de una tabla.

Aquí tienes ocho ejemplos que combinan varias lecciones y cuatro ejercicios que se corrigen solos: su consola marca cada requisito con ✅ o ❌.

## Qué combina cada ejemplo

| Ejemplo | Texto | Listas | Enlaces | Imágenes | Tablas | Estructura | Accesibilidad |
|---|---|---|---|---|---|---|---|
| 01 Un artículo completo | ✔ | ✔ | ✔ | ✔ | | ✔ | ✔ |
| 02 Una página por regiones | ✔ | ✔ | ✔ | ✔ | | ✔ | ✔ |
| 03 Una tabla de datos accesible | ✔ | | ✔ | | ✔ | | ✔ |
| 04 El índice de un documento largo | ✔ | ✔ | ✔ | | | ✔ | |
| 05 Una lista de productos | ✔ | ✔ | ✔ | ✔ | | ✔ | ✔ |
| 06 Cada palabra en su etiqueta | ✔ | | | | | ✔ | |
| 07 Cinco papeles, cinco `alt` | ✔ | ✔ | ✔ | ✔ | | ✔ | ✔ |
| 08 Un hilo de comentarios | ✔ | ✔ | | | | ✔ | ✔ |

Las vistas previas de esta página no tienen consola. Pulsa cualquiera de ellas para abrirla en un diálogo con la consola debajo, o ábrela en el editor.

## Un artículo completo

Un artículo de divulgación con todas sus piezas en su sitio. El `<article>` tiene su propio `<header>` (título, autora, fecha y tiempo de lectura con `<time>`) y su propio `<footer>` (notas y `<address>` de la autora). El texto usa `<em>` y `<strong>` por lo que significan, `<dfn>` para el término que define, `<sub>` para una fórmula y una llamada a nota con `<sup>` que enlaza a su nota, y la nota enlaza de vuelta. Hay dos `<figure>`: una con una imagen (el `alt` describe la escala; el pie, que leen todos, la contextualiza) y otra con una cita en bloque, cuya fuente va en el atributo `cite` y cuya atribución visible va en el `<figcaption>`.

[[exercise:01-un-articulo-completo.md]]

```text
Índice de títulos
  h1 Por qué el agua del grifo sabe distinta en cada ciudad
    h2 Qué es la dureza
    h2 De dónde sale la cal
    h2 ¿Hay que filtrarla?
    h2 Notas
publicado (datetime) → 2026-09-14
fuente de la cita    → https://aguasderibera.example/entrevistas/laboratorio
figura 1, alt        → Escala de dureza: blanda de 0 a 60 mg/l, moderada de 60 a 120, dura de 120 a 180 y muy dura por encima de 180.
nota 1 → Clasificación del Servicio Geológico de Estados Unidos (USGS), la más usada en divulgación. ↩
```

Fíjate en el enlace «↩» de la nota: su texto no dice nada a un lector de pantalla, así que lleva `aria-label="Volver a la llamada 1"`.

## Una página por regiones

El esqueleto de cualquier web, completo: un enlace para saltar al contenido, un `<header>` con el logo (una imagen con texto, cuyo `alt` es ese texto) y un menú que es una `<ul>` de enlaces dentro de un `<nav aria-label="Principal">`, con `aria-current="page"` en la página actual. Dentro del `<main>`, una ruta de navegación (una `<ol>`, porque es una jerarquía, con el separador `›` oculto con `aria-hidden`) y la agenda del mes, que es una `<ol>` de artículos con su `<time>`. Fuera, un `<aside>` que toma su nombre de su título con `aria-labelledby` y un `<footer>` con la dirección de contacto.

[[exercise:02-una-pagina-por-regiones.md]]

```text
Regiones (lo que lista un lector de pantalla)
  banner
  navigation «Principal»
  main
  navigation «Ruta de navegación»
  complementary «Horario»
  contentinfo
página actual en el menú → Agenda
primer Tab → Saltar al contenido → #content
actividades → 4
```

Haz clic en la vista previa y pulsa <kbd>Tab</kbd>: lo primero que aparece es el enlace de salto. Mira también las fechas: las tres primeras llevan `+02:00` y la del día 31, `+01:00`, porque el domingo 25 de octubre se pasa al horario de invierno. El CSS lee el mismo `aria-current` que el lector de pantalla para poner en negrita la página actual, así que lo que se ve y lo que se anuncia nunca se contradicen.

## Una tabla de datos accesible

Una tabla de una memoria anual con todo lo de la lección de tablas: `<caption>`, `<thead>`, `<tbody>` y `<tfoot>` con los totales, `scope` en cada cabecera y `<colgroup>` para dar fondo a la columna de totales. De la lección de accesibilidad trae dos cosas: una descripción con `aria-describedby` (la nota sobre el bibliobús) y un contenedor con scroll horizontal para pantallas estrechas, que necesita `tabindex="0"` para poder desplazarse con el teclado y un nombre (`role="region"` + `aria-labelledby` apuntando al `<caption>`). Abajo, un enlace con `download` que dice su formato y su tamaño.

[[exercise:03-una-tabla-de-datos-accesible.md]]

```text
al entrar → tabla «Préstamos por sala y trimestre (2025)», 6 filas × 6 columnas
descripción → Los préstamos de julio a septiembre incluyen los del bibliobús de verano.
Sala juvenil, Jul–sep: 640
Sala general, Total: 8160
Total, Total: 18 440
```

Las vistas previas de la teoría no pueden descargar archivos: prueba el enlace en el editor.

## El índice de un documento largo

Un manual con índice. El índice es un `<nav>` cuyo nombre es su propio título (`aria-labelledby`), y sus listas anidadas reproducen la jerarquía de los títulos: cada `<h2>` es un elemento de la lista principal y cada `<h3>`, de una sublista **dentro** de su `<li>`. Cada entrada es un enlace a un fragmento (`#plot`, `#shifts`…), y cada sección termina con un enlace de vuelta al índice. Por el camino aparecen una lista de descripción (los turnos de riego) y un `<strong>` para la norma que no se puede olvidar.

[[exercise:04-el-indice-de-un-documento-largo.md]]

```text
✅ Antes de empezar → h2#start
✅   Tu parcela → h3#plot
✅   Herramientas → h3#tools
✅ El riego → h2#watering
✅   Turnos de riego → h3#shifts
✅   Cómo ahorrar agua → h3#saving
✅ Normas de convivencia → h2#rules
✅ Contacto → h2#contact
enlaces «Volver al índice» → 4
```

El script comprueba que el nivel de cada enlace en el índice coincide con el de su título. Si un día alguien convierte «Tu parcela» en `<h2>` y olvida el índice, esa línea saldrá con ❌.

## Una lista de productos

Tres tarjetas de producto hechas como se deben hacer. El listado es una `<ul>` y cada producto un `<article>`. El enlace va en el título, no envolviendo la tarjeta entera, porque un enlace no puede contener un botón. El `alt` de cada foto describe su aspecto sin repetir el nombre, que ya está en el título. El precio rebajado usa `<s>`, pero como el tachado no se anuncia, un texto oculto (`visually-hidden`) dice «Precio anterior» y «Precio actual». Los tres botones dicen «Añadir al carrito» en pantalla, pero su nombre completo incluye el producto; el tercero está `disabled`. Al pulsar uno, el mensaje aparece en una región viva (`role="status"`) que un lector de pantalla anuncia sin mover el foco.

[[exercise:05-una-lista-de-productos.md]]

```text
Enlaces
  🔗 Cafetera italiana, 6 tazas
  🔗 Cafetera de émbolo, 1 litro
  🔗 Molinillo manual de madera
Botones
  🔘 Añadir al carrito: Cafetera italiana, 6 tazas
  🔘 Añadir al carrito: Cafetera de émbolo, 1 litro
  🔘 Añadir al carrito: Molinillo manual de madera (desactivado)
```

Sin el texto oculto, la lista de botones diría tres veces «Añadir al carrito», y nadie sabría cuál es cuál.

## Cada palabra en su etiqueta

Una noticia breve con quince elementos de frase, cada uno elegido por lo que el texto **es**: `<time>` para una fecha, una fecha con hora y una duración; `<del>` e `<ins>` con su `datetime` para una corrección (la fecha del concierto cambió); `<cite>` para el título de la obra; `<i lang="it">` para un término italiano; `<q>` para una cita corta y `<mark>` para la parte de una cita que el texto comenta después; `<strong>`, `<em>`, `<abbr>`, `<sup>` y `<small>`. La consola los lista en una tabla con el dato que cada uno deja a las máquinas.

[[exercise:06-cada-palabra-en-su-etiqueta.md]]

```text
elemento  texto                               dato
<time>    5 de octubre de 2026                2026-10-05
<cite>    Nocturno del molino
<del>     sábado 24                           2026-10-07
<ins>     sábado 31 de octubre a las 20:30    2026-10-07
<time>    sábado 31 de octubre a las 20:30    2026-10-31T20:30+01:00
…
<i>       a cappella                          it
…
(15 filas en total)
```

Observa la pareja `<del>`/`<ins>`: el `datetime` de ambos no es la fecha del concierto, sino la del **cambio**. La del concierto la lleva el `<time>` de dentro.

## Cinco papeles, cinco `alt`

El texto alternativo depende de lo que la imagen **hace** en cada sitio, no de lo que muestra. El logo de la biblioteca es una imagen con texto (su `alt` es ese texto), y el mismo plano aparece en cuatro papeles: como icono decorativo junto a un enlace que ya dice «Cómo llegar» (`alt=""`), como imagen informativa dentro del texto (el `alt` da las indicaciones), dentro de un enlace (el `alt` es el nombre del enlace: dice a dónde lleva y que abre otra pestaña) y en una figura (el `alt` describe y el pie da el contexto y la autoría).

[[exercise:07-cinco-papeles-cinco-alt.md]]

```text
con texto     → imagen «Biblioteca Ribera Alta»
decorativa    → (se ignora) · enlace «Cómo llegar»
informativa   → imagen «Plano: al salir de la estación, sube hasta la calle principal, síguela hacia el oeste y entra en la plaza Mayor; la biblioteca está en la plaza.»
en un enlace  → enlace «Plano ampliado (SVG, se abre en una pestaña nueva)»
en una figura → imagen «Plano del centro: la plaza Mayor en el medio, la estación al sureste y la biblioteca en la plaza.» · pie «Figura 1. El centro de Ribera. Dibujo: Servicio de Cartografía municipal.»
```

## Un hilo de comentarios

Los comentarios de un artículo, como los recomienda la especificación de HTML: una sección **dentro** del `<article>` al que pertenecen, con una `<ol>` (van por orden de llegada) en la que cada comentario es otro `<article>`. Las respuestas son una sublista dentro del `<li>` del comentario al que responden, y sus títulos bajan un nivel con el hilo (`<h3>` → `<h4>` → `<h5>`), así que quien navega por títulos recorre la conversación con su estructura. Cada botón «Responder» completa su nombre con un texto oculto («Responder a Andrés»).

[[exercise:08-un-hilo-de-comentarios.md]]

```text
comentarios → 4
h3 Lucía M. · 2026-10-10T09:15+02:00
  h4 Andrés · 2026-10-10T11:40+02:00 → responde a Lucía M.
    h5 Lucía M. · 2026-10-10T12:05+02:00 → responde a Andrés
h3 Marta R. · 2026-10-11T18:20+02:00
```

El script reconstruye el hilo **solo** a partir del HTML: el nivel sale de cuántas listas rodean a cada comentario, y «a quién responde», del `<li>` que contiene su lista. Si una respuesta estuviera fuera de su `<li>` (el error de la lección de listas), perdería a su padre.

## Ejercicios

Los cuatro ejercicios incluyen un script de comprobación que no tienes que tocar (está bloqueado, igual que el CSS): tras cada cambio, la vista previa se vuelve a ejecutar y la consola marca cada requisito con ✅ o ❌. Ábrelos en el editor para trabajar con la consola a la vista y, cuando todo esté en verde, compara tu versión con la solución.

**De la sopa de `div` al HTML semántico.** Una página de blog hecha solo con `<div>` y `<span>`: cabecera, menú, artículo con título, fecha y apartados, barra lateral y pie. Cámbialos por los elementos que les corresponden sin tocar las clases: el CSS las usa, así que la página se verá exactamente igual. La diferencia estará en lo que entiende una máquina.

[[exercise:09-ej-de-divs-a-html-semantico.md]]

**Arregla la tabla del horario.** Un horario con el título fuera de la tabla, cabeceras falsas hechas con `<td><b>`, sin grupos de filas, una columna fantasma por una celda de más bajo un `rowspan` y un domingo al que le falta una posición. La consola imprime cuántas posiciones ocupa cada fila: todas deben ocupar 3.

[[exercise:10-ej-arregla-la-tabla.md]]

**Arregla los nombres accesibles.** La página de un pódcast con todos los errores de nombre de la lección de accesibilidad: botones de icono mudos (✕, 🔍, ▶), un campo de búsqueda con solo un `placeholder`, dos enlaces «Escuchar» que llevan a sitios distintos, imágenes sin `alt`, dos `<nav>` sin nombre y un `<div>` que hace de botón. La consola lista el nombre de cada control mientras lo arreglas.

[[exercise:11-ej-arregla-los-nombres-accesibles.md]]

**Marca el texto con los elementos correctos.** El anuncio de un taller escrito en texto plano. Pon a cada fragmento su etiqueta: una fecha con hora y una duración, un aviso importante, un énfasis, una sigla, una cita corta (cuidado con las comillas), el título de un libro, un término en inglés, una tecla, un exponente y la letra pequeña. El CSS resalta con un fondo cada elemento que vas marcando.

[[exercise:12-ej-marca-el-texto.md]]

## Resumen

- Cada elemento aporta significado a los demás: un menú es una lista de enlaces en un `<nav>` con nombre; un índice, listas anidadas que repiten la jerarquía de los títulos; un listado de productos, una lista de artículos.
- La prueba de una página semántica es lo que una máquina saca de ella sin verla: regiones con nombre, un índice de títulos sin saltos, enlaces y botones que se entienden fuera de contexto, tablas que anuncian sus cabeceras.
- El `alt` depende de la función de la imagen en ese sitio: texto, información, destino de un enlace o nada (`alt=""`) si es decoración.
- Cuando el texto visible es ambiguo («Añadir al carrito», «Escuchar», «Responder»), el nombre accesible lo completa con un texto oculto, `aria-label` o `aria-labelledby`.
- Los datos para máquinas viven en atributos: `datetime`, `cite`, `lang`, `scope`, `aria-current`, `aria-describedby`.
- Las clases son para el CSS; el significado lo dan los elementos. Cambiar un `<div>` por el elemento correcto no cambia el aspecto, pero sí todo lo demás.

## Para profundizar

- [W3C — Validador de HTML (Nu Html Checker)](https://validator.w3.org/nu/): detecta listas con hijos que no son `li`, tablas con columnas que no cuadran, imágenes sin `alt` e ids repetidos.
- [W3C WAI — Tutoriales de accesibilidad: estructura de página, imágenes y tablas](https://www.w3.org/WAI/tutorials/)
- [W3C WAI — ARIA Authoring Practices: patrón de ruta de navegación (breadcrumb)](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [WHATWG — El elemento `article` (con el ejemplo de los comentarios anidados)](https://html.spec.whatwg.org/multipage/sections.html#the-article-element)
