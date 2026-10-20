# Documentos profesionales

## Por qué importa

Con lo que sabes del módulo ya puedes construir algo que muchas webs reales hacen mal: un **documento** impecable. Que el navegador lo lea en modo estándar y con la codificación correcta, que los buscadores y las redes sociales lo entiendan, que cada ruta apunte a donde debe, que los scripts no bloqueen nada y que el parser no tenga que reparar ni una etiqueta. Sobre esa base se construye todo lo demás (el diseño, la interacción, el rendimiento).

Estos doce documentos son de calidad de producción, con contenido realista. Todavía no usan CSS de verdad (llega en el capítulo 3) ni JavaScript propio (salvo el imprescindible para que veas lo que pasa), y aparecen elementos de estructura (`header`, `main`, `footer`, listas, `figure`…) que estudiarás a fondo en el módulo 2: aquí basta con leerlos como nombres de cada zona.

## Cómo estudiarlos

- **Lee el `<head>` línea a línea.** Es donde están casi todas las decisiones del módulo: DOCTYPE, `lang`, `charset`, viewport, título, descripción, URL canónica, iconos, metadatos para redes, hojas de estilo y scripts.
- **Mira la consola.** Cada documento carga con `defer` la herramienta del curso [js/audit.js](js/audit.js), que revisa el documento con lo aprendido (modo estándar, `charset` primero, `lang`, viewport, título, ids únicos, enlaces `#` con destino, imágenes con `alt`, `width` y `height`, ningún párrafo vacío, URLs absolutas donde deben serlo…) y escribe un ✅ o un ❌ por comprobación. No forma parte de la página: es tu inspector.
- **Ábrelos como páginas de verdad.** El botón ↗ de la barra de la vista previa abre el documento en su propia pestaña: allí verás el icono y el título en la pestaña, y podrás probar el modo dispositivo de DevTools (<kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>M</kbd>), que dentro de la vista previa no se aplica.
- **Valídalos.** Copia el código en el [validador de HTML del W3C](https://validator.w3.org/nu/#textarea): te señala cualquier cosa que el parser tendría que reparar en silencio.

## 01 · La plantilla base

El punto de partida de cualquier página: el `<head>` completo en el orden recomendado, con un comentario numerado que explica cada línea. Primero lo que el navegador necesita antes que nada (DOCTYPE, `lang`, `charset` en los primeros bytes, viewport), después lo que describe el documento (título, descripción, URL canónica, iconos, color del navegador, Open Graph) y al final los recursos (la hoja de estilos, que bloquea el pintado, y los scripts con `defer`). Fíjate en que las URLs que leen *otros* servidores (canónica, `og:url`, `og:image`) son absolutas, mientras que los recursos propios usan rutas relativas, y en el enlace del logo, `./`, que significa «la portada de esta carpeta» esté donde esté publicada la web.

[[exercise:01-plantilla-base.md]]

## 02 · Un artículo de blog

Un artículo con sus metadatos de autoría (`author`), su tipo para redes (`og:type="article"`) y su fecha de publicación, una fecha legible con `<time datetime>` y una figura con su imagen y su pie. Mira cómo se escriben `<div>` y `<p>` dentro del texto: con `&lt;` y `&gt;`, porque si no el parser los convertiría en elementos. Las cantidades (`200&nbsp;ms`, `6&nbsp;min`) usan `&nbsp;` para no partirse al final de una línea.

[[exercise:02-articulo-de-blog.md]]

## 03 · La ficha de un producto

Una página de tienda. El precio y el peso llevan `&nbsp;` entre la cifra y la unidad; el `main` guarda el código del producto en atributos `data-*` (datos para el código de la tienda, que el navegador ignora); la variante agotada usa `disabled` sin valor, porque es un atributo booleano. En el `head` hay un `<script type="application/ld+json">`: como su `type` no es JavaScript, el navegador no lo ejecuta y lo guarda como un bloque de datos que leen los buscadores.

[[exercise:03-ficha-de-producto.md]]

## 04 · Un panel de estado: tres estrategias de carga

La página de estado de un servicio, pensada para funcionar **sin** JavaScript (el HTML ya trae el estado de las 09:00) y mejorar con él. Carga tres scripts con tres estrategias: `defer` para el código de la página, que escribe la hora de la última comprobación; `type="module"` para un módulo que importa otro y descarga `status.json` para actualizar el estado; y `async` para una analítica independiente. Abre la consola y pulsa ⟳ varias veces: `defer` y el módulo respetan su orden, `async` aparece donde le toca. Lee el comentario de [js/widgets.js](js/widgets.js): su `import` se resuelve contra la URL del propio módulo, pero `fetch` lo hace contra la del documento.

[[exercise:04-panel-de-estado.md]]

## 05 · La página de error 404

Una página especial: el servidor la envía en **cualquier** dirección que no exista, así que una ruta relativa se resolvería distinto en cada caso. Por eso lleva los estilos dentro, el icono desde la raíz (`/favicon.svg`) y los enlaces con URL absoluta; su script muestra en la consola adónde iría `css/base.css` en dos direcciones distintas. También lleva `<meta name="robots" content="noindex">` y un recordatorio para el servidor: debe responder con el código `404`, no con `200`.

[[exercise:05-pagina-404.md]]

## 06 · Una receta

Contenido cotidiano escrito con precisión: cantidades unidas a su unidad con `&nbsp;` (`600&nbsp;g`), una fracción con su entidad (`&frac12;`) y las duraciones con `<time datetime="PT15M">`, un formato estándar que entienden los buscadores y los asistentes de voz. Mira también el texto alternativo de la foto: describe lo que se ve, no repite el título.

[[exercise:06-receta.md]]

## 07 · Documentación técnica

Una guía con índice: cada enlace `#fragmento` apunta al `id` de una sección (el fragmento no viaja al servidor; solo hace que el navegador salte). Los bloques de código usan `<pre><code>` con todas las etiquetas escapadas, los atajos de teclado `<kbd>` y la abreviatura HTTP un `<abbr title>`. El contenido, por cierto, te enseña a servir tus propias páginas en local con Python.

[[exercise:07-documentacion-tecnica.md]]

## 08 · Una landing optimizada

La portada de una tienda pensada para cargar rápido. La imagen principal se pide antes que nada con `<link rel="preload" … fetchpriority="high">`; tiene `width` y `height` para que el navegador reserve su hueco antes de recibirla; y las imágenes de más abajo llevan `loading="lazy"`, así que no se descargan hasta que te acercas a ellas. La consola lo demuestra al terminar la carga: las imágenes perezosas salen como «aún no». Baja con el scroll y pulsa ⟳ para comparar. Un comentario muestra también cómo `preconnect` adelantaría el DNS, TCP y TLS de un dominio ajeno.

[[exercise:08-landing-optimizada.md]]

## 09 · La página de un evento

Fechas y horas que una máquina puede entender sin ambigüedad: `<time datetime="2026-11-21T09:30+01:00">` lleva hasta la zona horaria, y cada punto del programa su hora. El `head` añade `theme-color` (el color de la barra del navegador en el móvil), el icono para la pantalla de inicio y una tarjeta grande para redes (`twitter:card`). El enlace de inscripción es un `mailto:` con el asunto ya escrito, codificado con `%C3%B3` y `%20` como viste en la lección de URLs.

[[exercise:09-pagina-de-evento.md]]

## 10 · Un texto largo: la política de privacidad

Cómo se organiza un documento largo para que se pueda leer, enlazar y recorrer: una fecha de revisión, un índice con enlaces a cada sección, títulos con `id` estables (se pueden compartir como `…/privacidad/#rights`), abreviaturas explicadas con `<abbr title>` y `&nbsp;` donde un salto de línea separaría lo que va junto («S.&nbsp;L.», «apartado&nbsp;1»).

[[exercise:10-politica-de-privacidad.md]]

## 11 · Un glosario en varios idiomas

El atributo `lang` a fondo: el documento está en español, pero cada término en inglés, japonés o árabe lleva su propio `lang` (y el árabe, `dir="rtl"`, para escribirse de derecha a izquierda). Los nombres de marca llevan `translate="no"` para que el traductor automático no los toque, y el `head` enlaza las versiones en otros idiomas con `<link rel="alternate" hreflang>`. Ábrelo con ↗ y prueba a traducir la página con el navegador.

[[exercise:11-glosario-multilingue.md]]

## 12 · Un portafolio personal

Una página personal pequeña y cuidada: `og:type="profile"`, un retrato con un `alt` que presenta a la persona sin repetir el título, enlaces a otros sitios siempre con URL absoluta y `https://`, y `rel="me"`, que permite a algunas redes mostrar tu perfil como verificado cuando enlaza de vuelta a esta página. El pie promete algo que el código cumple: no hay ningún script de terceros.

[[exercise:12-portafolio-personal.md]]

## Lista de comprobación de un documento profesional

- `<!DOCTYPE html>` en la primera línea y `<html lang="…">` con el idioma real del contenido.
- `<meta charset="utf-8">` como primer elemento del `<head>`, y el archivo guardado en UTF-8.
- `<meta name="viewport" content="width=device-width, initial-scale=1">`, sin bloquear el zoom.
- Un `<title>` de lo concreto a lo general y una `<meta name="description">` propia de cada página.
- Todos los metadatos dentro del `<head>`, antes de cualquier contenido.
- URLs absolutas para lo que leen otros (canónica, Open Graph, `hreflang`, enlaces externos); rutas relativas al documento para los recursos propios; rutas desde la raíz solo cuando el documento puede servirse en cualquier dirección (como una 404).
- Hojas de estilo en el `<head>`; scripts con `defer`, `async` o `type="module"` según lo que necesiten.
- Marcado que el parser no tenga que reparar: nada de bloques dentro de `<p>`, `<div />`, `</p>` huérfanos ni `&` sin escapar; ids únicos y enlaces `#` con destino.
- Imágenes con `alt`, `width` y `height`.

## Para profundizar

- [W3C — Validador de HTML (Nu Html Checker)](https://validator.w3.org/nu/)
- [Open Graph protocol](https://ogp.me/)
- [MDN — Metadatos en HTML: el `<head>`](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML)
- [web.dev — Learn HTML: metadatos](https://web.dev/learn/html/metadata)
