# Estructura semántica

## Por qué importa

Una página bien hecha tiene partes reconocibles: una cabecera con el logo y el menú, un contenido principal, quizá una barra lateral y un pie. Con HTML puedes construir todo eso usando solo `<div>`, y con CSS se verá idéntico. La diferencia no está en el aspecto: está en lo que **entienden las máquinas**. Un lector de pantalla ofrece a sus usuarios atajos para «saltar al contenido principal» o «ir al menú»; un buscador distingue el artículo de la publicidad; el modo lectura del navegador sabe qué texto mostrar. Todo eso funciona gracias a los elementos **semánticos** de estructura.

En esta lección verás qué elemento usar para cada parte de una página, cómo se convierten en **regiones** (*landmarks*) navegables y por qué los títulos `h1`–`h6` son el verdadero índice del documento.

## El esqueleto de una página

| Elemento | Qué contiene | Región (rol implícito) |
|---|---|---|
| `<header>` | la cabecera: logo, nombre del sitio, a menudo el menú | `banner` (si es de la página) |
| `<nav>` | un bloque de navegación importante | `navigation` |
| `<main>` | el contenido principal, **único** en la página | `main` |
| `<aside>` | contenido relacionado pero secundario (barra lateral, notas) | `complementary` |
| `<footer>` | el pie: autoría, enlaces legales, contacto | `contentinfo` (si es de la página) |

Cada elemento tiene un **rol implícito**: el navegador lo comunica a las tecnologías de asistencia sin que escribas nada más. Un usuario de lector de pantalla puede pedir la lista de regiones y saltar directamente a cualquiera de ellas.

[[exercise:01-esqueleto-de-una-pagina.md]]

## `article` y `section`

Dentro del contenido aparecen dos elementos que se confunden a menudo:

- `<article>`: un contenido **autónomo**, que tendría sentido fuera de la página (una entrada de blog, una noticia, un producto, un comentario). La prueba: ¿podrías publicarlo tal cual en otro sitio o en un lector RSS?
- `<section>`: una **parte temática** de algo mayor, normalmente con su propio título (los apartados de un artículo, los bloques de una página de inicio).

Y si solo necesitas un contenedor para aplicar estilos, sin significado, `<div>` sigue siendo la respuesta correcta. Para un fragmento de texto, `<span>`.

[[exercise:02-article-y-section.md]]

### `header` y `footer` dentro de otros elementos

`<header>` y `<footer>` no son exclusivos de la página: un `<article>` o una `<section>` pueden tener los suyos, con el título, la fecha o el autor. Dentro de esos elementos dejan de ser el `banner` y el `contentinfo` de la página y pasan a pertenecer a su bloque. Dos elementos que suelen acompañarlos:

- `<time datetime="2026-04-18">`: una fecha o una hora, legible para personas en el contenido y exacta para las máquinas en el atributo.
- `<address>`: los datos de contacto del **autor** del artículo o de la página (no cualquier dirección postal).

[[exercise:03-header-y-footer-de-un-articulo.md]]

## `nav` solo para la navegación importante

No todo grupo de enlaces es un `<nav>`: resérvalo para los bloques de navegación **principales** (el menú, la ruta de migas de pan, el índice de un documento largo). Los enlaces legales del pie no lo necesitan. Cuando una página tiene varios `<nav>`, dale a cada uno un nombre con `aria-label` («Principal», «Ruta de navegación»): sin él, la lista de regiones mostraría dos «navegación» imposibles de distinguir. Verás `aria-label` a fondo en la siguiente lección.

[[exercise:04-varios-nav-con-nombre.md]]

## La sopa de `div`

Una página construida solo con `<div class="header">`, `<div class="main">`… se ve igual con CSS, pero en el árbol de accesibilidad no tiene **ninguna región** ni **ningún título**: para un usuario de lector de pantalla es un único bloque de texto sin atajos. Las clases son para el CSS; el significado lo dan los elementos.

[[exercise:05-sopa-de-divs.md]]

## Un solo `main`

El contenido principal es único por definición, así que solo puede haber **un** `<main>` visible por página (puede haber otros con el atributo `hidden`, por ejemplo en una aplicación con pestañas). Además, `<main>` no puede estar dentro de `<article>`, `<aside>`, `<header>`, `<footer>` ni `<nav>`. El contenido secundario va en un `<aside>`, o en una `<section>` dentro del único `<main>`.

[[exercise:06-un-solo-main.md]]

## Los títulos son el índice

La otra forma de navegar una página con lector de pantalla es saltar de título en título, como si fuera un índice. Ese índice lo forman **únicamente** los `<h1>`–`<h6>`, y el nivel de cada título es el número de su etiqueta.

Durante años se propuso un «algoritmo de esquema» por el que un `<h1>` dentro de una `<section>` valdría como `<h2>`. Muchos tutoriales lo recomendaron, pero **ningún navegador lo implementó** y la especificación lo retiró. Por tanto:

- Usa un `<h1>` por página para el título principal.
- Baja de nivel de uno en uno (`h1` → `h2` → `h3`) sin saltarte niveles.
- Elige el nivel por la **jerarquía**, no por el tamaño: el tamaño se cambia con CSS.

[[exercise:07-titulos-y-esquema.md]]

## Cómo verlo en DevTools

En Chrome, el panel **Elements** tiene una pestaña **Accessibility** que muestra el rol y el nombre accesible del elemento seleccionado, y una opción para ver el **árbol de accesibilidad** completo en lugar del DOM. Es la forma más directa de comprobar qué «ve» un lector de pantalla. Las extensiones de accesibilidad (como las de auditoría de Lighthouse, integradas en DevTools) también listan las regiones y los saltos de nivel en los títulos.

## Bestiario

- **El lector de pantalla no encuentra el menú ni el contenido.** Síntoma: la lista de regiones está vacía y no hay atajos. Causa: la página está hecha solo con `<div>`. Solución: `<header>`, `<nav>`, `<main>`, `<aside>` y `<footer>`, y títulos `h1`–`h6`. → [ver ejemplo](05-sopa-de-divs.md)
- **Dos `main` en la misma página.** Síntoma: el validador da error y «saltar al contenido principal» no sabe a dónde ir. Causa: `<main>` debe ser único. Solución: el contenido secundario en `<aside>` o en secciones dentro del único `<main>`. → [ver ejemplo](06-un-solo-main.md)
- **El índice de títulos está desordenado.** Síntoma: varios `h1` al mismo nivel o saltos de `h1` a `h4`. Causa: se confía en que `section` rebaje el nivel (no lo hace) o se elige el nivel por el tamaño. Solución: niveles consecutivos según la jerarquía; el tamaño, con CSS. → [ver ejemplo](07-titulos-y-esquema.md)

## Resumen

- `<header>`, `<nav>`, `<main>`, `<aside>` y `<footer>` forman el esqueleto y crean regiones navegables.
- `<article>` para contenido autónomo, `<section>` para partes temáticas con título, `<div>` para lo que no tiene significado.
- `<header>` y `<footer>` también existen dentro de artículos y secciones; `<time>` y `<address>` los acompañan.
- `<nav>` solo para la navegación importante; con varios, nómbralos con `aria-label`.
- Un único `<main>` visible por página.
- Los títulos `h1`–`h6` son el índice del documento: un `h1` y niveles consecutivos.

## Para profundizar

- [MDN: Estructura del documento y del sitio web](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/Document_and_website_structure)
- [W3C WAI: Page Regions](https://www.w3.org/WAI/tutorials/page-structure/regions/)
- [W3C WAI: Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)
- [Adrian Roselli: There Is No Document Outline Algorithm](https://adrianroselli.com/2016/08/there-is-no-document-outline-algorithm.html)
