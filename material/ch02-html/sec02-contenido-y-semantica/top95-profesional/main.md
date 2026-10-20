# Páginas profesionales: contenido y semántica

## Por qué importa

Con los dos módulos de HTML que llevas ya puedes construir algo que muchas webs reales hacen mal: páginas que **se entienden sin verlas**. Un lector de pantalla puede saltar de región en región y de título en título, cada enlace dice a dónde lleva, cada imagen tiene el texto que le corresponde, cada tabla anuncia sus cabeceras, y las fechas, las siglas y las citas llevan su dato para máquinas. Sobre esa base se construye todo lo demás: el diseño, la interacción y el rendimiento.

Estas trece páginas son de calidad de producción y con contenido realista: un blog, un periódico, una documentación técnica, un informe con tablas, la carta de un restaurante, el programa de unas jornadas, un glosario, una empresa, una comparativa, una asignatura universitaria, una línea de tiempo, unos resultados de búsqueda y una declaración de accesibilidad. Usan todo lo visto en el capítulo de HTML hasta aquí. Todavía no usan CSS de verdad (llega en el capítulo 3): una hoja común, [css/base.css](css/base.css), y unas pocas reglas en cada página las hacen legibles, con un comentario de una línea cuando aparece algo que estudiarás más adelante (`flex`, `grid`, `position`). Si quitas todo el CSS, las páginas pierden el aspecto, pero no el significado.

## Cómo estudiarlas

- **Lee el HTML de arriba abajo, como lo haría un lector de pantalla.** Primero el enlace para saltar al contenido; luego el `<header>` con su `<nav>`; después el `<main>` con su `<h1>`, y al final el `<footer>`. Los comentarios numerados explican cada decisión.
- **Mira la consola.** Cada página carga con `defer` la herramienta del curso [js/audit.js](js/audit.js), que revisa el documento con lo aprendido en el módulo y escribe tres informes: una lista de comprobaciones con ✅ o ❌ (un solo `<h1>`, títulos sin saltos, un solo `<main>`, regiones con nombre, enlace de salto, imágenes con `alt` y dimensiones, enlaces y botones con nombre, listas y tablas bien formadas, `<time>` con `datetime`, referencias ARIA que existen…), la **lista de regiones** tal como la ofrece un lector de pantalla y el **índice de títulos**. No forma parte de las páginas: es tu inspector. Las vistas previas de esta teoría no tienen consola; púlsalas para abrirlas en un diálogo con la consola debajo.
- **Recórrelas con el teclado.** Haz clic en la vista previa y pulsa <kbd>Tab</kbd>: lo primero que aparece es «Saltar al contenido». Sigue pulsando: el foco siempre se ve y avanza en el orden en que se lee.
- **Ábrelas como páginas de verdad.** El botón ↗ de la barra de la vista previa abre cada documento en su propia pestaña. Allí, en DevTools, el panel **Elements** tiene la pestaña **Accessibility**, que enseña el rol y el nombre de cada elemento, y la opción de ver el árbol de accesibilidad completo. Con VoiceOver (<kbd>⌘</kbd>&nbsp;<kbd>F5</kbd>) o NVDA puedes escucharlas.
- **Valídalas.** Copia el código en el [validador de HTML del W3C](https://validator.w3.org/nu/#textarea): no debería encontrar ningún error.

Todas las páginas comparten el mismo esqueleto: `<a class="skip-link">`, `<header>` con un `<nav aria-label="Principal">` cuyo menú es una `<ul>`, un `<main id="content" tabindex="-1">` al que salta el enlace, y un `<footer>`. Los enlaces a otras páginas del sitio usan direcciones absolutas de dominios de ejemplo (`.example`): al pulsarlos se abren en una pestaña nueva y la vista previa se queda donde estaba.

## 01 · Una entrada de blog

**Objetivo:** un artículo largo de un blog personal, con todo lo que rodea al texto. **Técnicas:** ruta de navegación en una `<ol>` con `aria-current="page"` y separadores ocultos con `aria-hidden`; un `<article>` con su propio `<header>` (autora, fecha de publicación y de actualización, tiempo de lectura con `<time datetime="PT8M">`) y su propio `<footer>` (notas y etiquetas); un índice del artículo en un `<nav aria-labelledby>`; una tabla de gastos con `<caption>`, `scope` y totales en `<tfoot>` dentro de un contenedor con scroll que tiene nombre y foco; llamadas a notas con `<sup>` y enlaces de vuelta con `aria-label`; una caja «Sobre la autora» en un `<aside>` con nombre. **Fíjate en** el retrato de la autora: `alt=""`, porque su nombre está en el título de al lado, y en los artículos relacionados, que son una lista de `<article>` con el enlace en el título.

[[exercise:01-articulo-de-blog.md]]

## 02 · La portada de un periódico

**Objetivo:** la página de inicio de un diario local, la más densa de todas. **Técnicas:** el nombre del periódico como `<h1>` (en la portada es el título de la página); «Última hora» como una `<section>` con nombre y horas exactas con zona horaria; una noticia principal con su figura y su crédito; secciones temáticas con `<h2>` y sus noticias como listas de `<article>` con `<h3>`; dos `<aside>` fuera del `<main>`, cada uno con su nombre: «Lo más leído» (una `<ol>`, porque es un ranking) y «El tiempo» (una tabla con cabeceras de fila y de columna); un segundo `<nav>` en el pie con otro nombre. **Fíjate en** que una misma noticia aparece en la portada y en «Lo más leído» con **el mismo texto y la misma dirección**: dos enlaces iguales que llevaran a sitios distintos confundirían a quien recorre la lista de enlaces.

[[exercise:02-portada-de-noticias.md]]

## 03 · La documentación de una herramienta

**Objetivo:** una página de documentación técnica (de una herramienta que genera las imágenes de un `srcset`, como las de la lección de imágenes). **Técnicas:** cinco navegaciones con nombres distintos (principal, menú de la documentación, ruta, índice de la página y paginación «anterior/siguiente» con `rel="prev"` y `rel="next"`); un menú lateral de listas anidadas con los nombres de grupo como texto, para no llenar de títulos el índice; bloques `<pre><code>` con las etiquetas escapadas; `<samp>` para lo que responde el programa y `<kbd>` para lo que tecleas; una tabla de opciones; los problemas frecuentes como lista de descripción; un aviso con `<strong>`. **Fíjate en** el aviso final, que conecta con la lección de imágenes: una herramienta no puede escribir un buen `alt` por ti.

[[exercise:03-documentacion-de-producto.md]]

## 04 · Un informe con tablas

**Objetivo:** la memoria anual de una red de bibliotecas, con los datos accesibles para cualquiera. **Técnicas:** cifras clave en una `<dl>` con un `<div>` por pareja; un gráfico de barras cuyo `alt` resume los datos y remite a la tabla; una tabla con cabeceras de dos niveles (`scope="colgroup"` con sus `<colgroup>`, y `rowspan` en «Biblioteca» y «Total»); otra con varios `<tbody>` cuyas filas de grupo llevan `scope="rowgroup"`; una nota enlazada con `aria-describedby`; un enlace `download` que dice formato y tamaño. **Fíjate en** las cifras: las de cinco dígitos llevan un espacio duro (`29&nbsp;820`) y las de cuatro no, como recomienda la ortografía española, y en las secciones, que **no** llevan nombre para no llenar de regiones la página.

[[exercise:04-informe-con-tablas.md]]

## 05 · La carta de un restaurante

**Objetivo:** una carta que se lee igual de bien en el móvil del cliente que con un lector de pantalla. **Técnicas:** un índice de la carta con enlaces a fragmentos; cada plato como una pareja de una lista de descripción, con varios `<dd>` (descripción, alérgenos y precio); `<small>` para la letra pequeña de un plato; los vinos en una tabla, porque cada precio se lee cruzando vino y formato; el menú del día con sus `<h3>`; los catorce alérgenos en una `<ul>` con una fórmula en `<sub>`; el horario en una tabla con `colspan` y horas en `<time>`. **Fíjate en** cuándo se usa cada estructura: los platos no son una tabla (no se cruzan dos dimensiones) y los vinos sí.

[[exercise:05-carta-de-restaurante.md]]

## 06 · El programa de unas jornadas

**Objetivo:** la web de un evento de dos días con dos salas en paralelo. **Técnicas:** datos clave en una `<dl>` con fechas en `<time>`; el programa de cada día en una tabla cuyas horas son cabeceras de fila con `datetime` y zona horaria; `rowspan` para los talleres de dos horas y `colspan` para las sesiones comunes; los nombres de los ponentes enlazan a su tarjeta; las tarjetas de ponentes en una lista de `<article>` con retratos de `alt=""`; las indicaciones para llegar en una `<ol>`; un `mailto:` con el asunto codificado. **Fíjate en** el comentario de «Cómo llegar»: la dirección del lugar **no** va en `<address>`, que es solo para el contacto de quien firma la página (está en el pie).

[[exercise:06-programa-de-un-evento.md]]

## 07 · Un glosario con preguntas frecuentes

**Objetivo:** un glosario de accesibilidad que sirve, de paso, de repaso de la lección. **Técnicas:** un índice alfabético que solo enlaza a las letras que existen; una `<dl>` por letra, con `<dfn>` para el término que se define y un `id` en cada `<dt>` para poder enlazarlo; referencias cruzadas entre definiciones; siglas con `<abbr>` y su forma completa en inglés con `<i lang="en">`; dos `<dt>` seguidos para dos nombres de un mismo concepto; preguntas frecuentes con `<details>` y `<summary>`, el desplegable nativo que verás a fondo en el módulo de formularios. **Fíjate en** que cada término tiene su propia dirección (`…/glosario/#accessible-name`), que puede compartirse.

[[exercise:07-glosario-y-preguntas-frecuentes.md]]

## 08 · La página de una empresa

**Objetivo:** la página «Quiénes somos» de un estudio pequeño. **Técnicas:** una foto de grupo cuyo `alt` describe la escena y cuyo pie nombra a cada persona de izquierda a derecha; la historia del estudio como una `<ol>` con fechas de mes (`datetime="2016-03"`); el equipo como una lista de `<article>` con enlaces de contacto que llevan el nombre de cada persona («Escribir a Nerea»); cifras en una `<dl>`; un testimonio en una `<blockquote>` dentro de una `<figure>`; una oferta de empleo en un `<aside>` fuera del `<main>`. **Fíjate en** el `<address>` del pie: es el contacto del estudio, responsable de la página, y ese es justo su uso correcto.

[[exercise:08-pagina-de-empresa.md]]

## 09 · Una comparativa de productos

**Objetivo:** una comparativa de tres lectores de libros electrónicos que se entiende sin ver la tabla. **Técnicas:** la respuesta corta en una `<dl>` («si lees cada noche → Folio 7»); tarjetas cuyos enlaces dicen qué ficha abren; una tabla con cabeceras en las dos direcciones, la columna recomendada destacada con `<col>`, unidades unidas con `&nbsp;`, `<abbr>` para «ppp» y «GB», duraciones en `<time datetime="P42D">` y los precios en `<tfoot>`; una nota de fuentes enlazada con `aria-describedby`. **Fíjate en** los «sí» y «no» de la tabla: van escritos con palabras; el icono ✓/✗ está oculto con `aria-hidden` y el color es solo un extra, porque la información nunca debe depender solo del color o de un símbolo.

[[exercise:09-comparativa-de-productos.md]]

## 10 · La página de una asignatura

**Objetivo:** la ficha de una asignatura universitaria, con todo lo que un estudiante busca a principio de curso. **Técnicas:** la ficha en una `<dl>` con las siglas desarrolladas en el texto; un enlace a un PDF que dice formato y tamaño; profesorado con correo y teléfono; horario y evaluación en tablas (con el total en `<tfoot>` y el porcentaje con su espacio duro: `40&nbsp;%`); el temario en listas ordenadas anidadas; un calendario con fechas exactas; la bibliografía con `<cite lang="en">` para los títulos en inglés. **Fíjate en** las fechas del calendario: el examen del 2 de junio lleva `+02:00`, porque en junio rige el horario de verano.

[[exercise:10-pagina-de-una-asignatura.md]]

## 11 · Una línea de tiempo

**Objetivo:** dieciséis momentos de la historia de la web, de la propuesta de Tim Berners-Lee en 1989 a WebGPU. **Técnicas:** cada etapa es una `<section>` con su `<h2>`, y sus hitos una `<ol>` en la que cada elemento es un `<article>` con un `<h3>` que contiene la fecha en `<time>` (año y mes, `datetime="1989-03"`, o fecha completa cuando se conoce); `start` para que la numeración continúe de una lista a otra (1–5, 6–10, 11–12, 13–16); siglas desarrolladas en el texto o con `title`; una cita en inglés con `<q lang="en">`, que el navegador pone entre comillas inglesas. **Fíjate en** los números de los hitos: los dibuja el navegador gracias a `start`, no están escritos en el texto.

[[exercise:11-linea-de-tiempo.md]]

## 12 · Resultados de búsqueda

**Objetivo:** la segunda página de resultados del catálogo de una biblioteca. **Técnicas:** el buscador dentro de `<search>` (la región de búsqueda) con su `<label>`; el número de resultados en una región viva (`role="status"`); filtros en un `<nav>` con `aria-current`; los resultados en una `<ol start="11">`, porque es la segunda página; las coincidencias marcadas con `<mark>` (relevantes en **este** contexto: lo que se ha buscado); la disponibilidad de cada ejemplar con su fecha; una paginación con nombre en la que cada número tiene un `aria-label` («Página 2») y el `&` de las direcciones se escribe `&amp;`. **Fíjate en** que el formulario es un adelanto: lo estudiarás en el módulo siguiente.

[[exercise:12-resultados-de-busqueda.md]]

## 13 · Una declaración de accesibilidad

**Objetivo:** la página que la ley exige a las webs del sector público en España, con la estructura del modelo oficial. **Técnicas:** un texto legal largo cuyo índice son sus títulos `<h2>` y `<h3>`; cada incumplimiento con el requisito de la norma europea y el criterio de las WCAG que no se cumple; fechas de preparación, revisión y corrección en `<time>`; una tabla de resultados por principio con totales; el contacto en un `<address>` que contiene una lista. **Fíjate en** que los tres problemas declarados son exactamente los que has aprendido a evitar en este módulo: imágenes sin `alt`, poco contraste y un foco que no se ve.

[[exercise:13-declaracion-de-accesibilidad.md]]

## Lista de comprobación de una página semántica y accesible

- `<html lang>` con el idioma real, y `lang` en cada fragmento escrito en otro idioma.
- Un enlace «Saltar al contenido» como primer elemento enfocable, que lleva al `<main>`.
- Un `<header>`, un `<nav>` con nombre, un único `<main>` y un `<footer>`; si una región se repite (dos `<nav>`, dos `<aside>`), cada una con un nombre distinto.
- Un único `<h1>` y títulos que bajan de nivel de uno en uno; el nivel lo decide la estructura, no el tamaño.
- Listas para todo lo que es una lista (menús, tarjetas, resultados, pasos); `<ol>` cuando el orden importa, con `start` si continúa; `<dl>` para parejas nombre → valor.
- Enlaces que dicen a dónde llevan, también fuera de contexto; mismo texto, mismo destino; botones para las acciones.
- Imágenes con `alt` según su función (vacío si son decorativas), `width` y `height`; pies de figura que dan contexto.
- Tablas solo para datos, con `<caption>`, `<thead>`, `scope` en cada `<th>` y totales en `<tfoot>`.
- Fechas en `<time datetime>`, siglas desarrolladas, citas con `<q>`, `<blockquote cite>` y `<cite>`.
- Nada que dependa solo del color o de un icono; el foco siempre visible; ningún `tabindex` positivo.

## Para profundizar

- [W3C — Validador de HTML (Nu Html Checker)](https://validator.w3.org/nu/)
- [W3C WAI — Tutoriales: estructura de página, imágenes y tablas](https://www.w3.org/WAI/tutorials/)
- [W3C WAI — Modelo de declaración de accesibilidad y generador](https://www.w3.org/WAI/planning/statements/)
- [web.dev — Learn Accessibility](https://web.dev/learn/accessibility)
- [The A11Y Project — Checklist](https://www.a11yproject.com/checklist/)
