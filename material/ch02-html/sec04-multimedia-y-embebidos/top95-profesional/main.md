# Multimedia y contenido embebido: páginas profesionales

## Por qué importa

Vídeos, audios, ilustraciones, gráficos, mapas y widgets de otras empresas: casi todo lo que hace atractiva una página se mete en ella desde fuera o se dibuja encima, y casi todo es justo lo que más a menudo se hace mal. Un vídeo sin subtítulos deja fuera a quien no oye; un gráfico sin texto, a quien no ve; un iframe sin `sandbox`, a la propia página a merced de un desconocido; una página sin metadatos aparece en los buscadores y en los chats como un enlace pelado.

Estas doce páginas son de calidad de producción y con contenido realista: la lección de un curso en línea, un episodio de podcast, una receta, un evento, la ficha de un producto, un informe con gráficos, un tablón que embebe contenido ajeno, el archivo de un boletín, la portada de una tienda, una herramienta de subtitulado, una biblioteca de iconos y un catálogo dibujado en canvas. Todavía no usan CSS de verdad (llega en el capítulo 3): una hoja común, [css/base.css](css/base.css), las hace legibles y cómodas, con un comentario de una línea cuando aparece algo que estudiarás más adelante (`flex`, `grid`, `position`). El JavaScript que aparece es siempre un adelanto corto y comentado; varias páginas no lo necesitan.

## Cómo estudiarlas

- **Lee el HTML de arriba abajo.** Los comentarios numerados explican cada decisión: por qué un icono es decorativo y otro no, por qué un marco lleva `sandbox` y otro no, por qué una fecha del JSON-LD lleva `+01:00`.
- **Mira la consola.** Cada página carga con `defer` la herramienta del curso [js/media-audit.js](js/media-audit.js), que revisa la página con lo aprendido en el módulo y escribe dos informes: una lista de comprobaciones con ✅ o ❌ (el documento; la descripción, las URL absolutas y el JSON-LD del `<head>`; controles, subtítulos, transcripciones y autoplay de los medios; `title` y `sandbox` de los iframes; texto alternativo de los SVG y los canvas) y un **inventario** desplegable de cada elemento multimedia o embebido y de lo que «dice». Las vistas previas de esta teoría no tienen consola; púlsalas para abrirlas en un diálogo con la consola debajo.
- **Escucha y mira con los ojos cerrados.** Activa los subtítulos, abre las transcripciones y, en DevTools → Elements → **Accessibility**, comprueba el nombre de cada SVG, cada canvas y cada iframe.
- **Ábrelas cuando haya marcos.** Las tarjetas de la teoría son iframes con `sandbox="allow-scripts"` y origen opaco, y un marco nunca tiene más permisos que su padre: la encuesta del tablón solo se puede votar al abrir la página (clic en la tarjeta, o en el editor), donde la vista previa es una página real en `localhost:3001`.
- **Ábrelas como páginas de verdad.** El botón ↗ abre cada una en su propia pestaña: allí verás el icono de la pestaña (`rel="icon"`), el color de `theme-color` en el móvil (modo dispositivo de DevTools) y, en la pestaña Network, qué se descarga y cuándo (`preload`, `loading="lazy"`, `preload="none"`).

Todas comparten el esqueleto de los módulos anteriores: enlace para saltar al contenido, `<header>` con su `<nav aria-label="Principal">`, un `<main id="content" tabindex="-1">` y un `<footer>`. Los archivos multimedia están en la carpeta `media/` (los mismos clips de la lección de audio y vídeo) y las páginas que se embeben, en `embed/`: ábrelas con el botón «Assets». Los enlaces a otros sitios usan dominios de ejemplo (`.example`) y se abren en una pestaña nueva.

## 01 · La lección de un curso en línea

**Objetivo:** una lección en vídeo que pueda seguir cualquiera. **Técnicas:** `<video>` con `poster`, `preload="metadata"`, dos formatos y subtítulos para sordos (`captions`) en español e inglés; una pista `chapters` que el script lee para clonar un `<template>` por capítulo, con botones que saltan con `currentTime`; una descripción del vídeo en `<details>` para quien no lo ve; una ruta de migas con `aria-current="page"`; el planeador como SVG informativo con `title` y `desc`; y un JSON-LD `VideoObject` con `isPartOf` apuntando al curso. **Fíjate en** que la descripción del vídeo y los subtítulos cuentan cosas distintas: unos lo que se oye, la otra lo que se ve.

[[exercise:01-leccion-de-un-curso.md]]

## 02 · Un episodio de podcast

**Objetivo:** la página de un episodio que se escucha, se descarga y se encuentra en las aplicaciones de podcasts. **Técnicas:** `<audio>` con Opus y MP3 de respaldo y `preload="none"`; su transcripción en un `<details>`; las partes del episodio con `<time datetime="PT11M5S">`, una duración que las máquinas entienden; el feed RSS en un `<link rel="alternate" type="application/rss+xml">`; iconos de un sprite (`<symbol>` + `<use>`) decorativos junto a cada enlace; y un JSON-LD `PodcastEpisode` con su serie. **Fíjate en** que el reproductor solo contiene el avance (la sintonía): el episodio completo, de 38 MB, es un enlace de descarga, y su transcripción completa tiene página propia.

[[exercise:02-episodio-de-podcast.md]]

## 03 · Una receta

**Objetivo:** una receta que el buscador entienda y muestre con su tiempo y sus raciones. **Técnicas:** JSON-LD `Recipe` con los ingredientes, cada paso como `HowToStep` y los tiempos en ISO 8601 (`PT15M`, `PT35M`, `PT50M`); los mismos tiempos en `<time datetime>` dentro de los pasos; tres iconos de un sprite que toman el color del texto con `currentColor`; una ilustración SVG con `role="img"` y `aria-label`; y Open Graph `article` para compartirla. **Fíjate en** que los datos del JSON-LD repiten lo que se ve en la página: los buscadores penalizan los datos estructurados que dicen algo distinto que el contenido visible.

[[exercise:03-receta.md]]

## 04 · La página de un evento

**Objetivo:** que nadie se quede sin saber cuándo, dónde y cuánto. **Técnicas:** JSON-LD `Event` con fechas que llevan su zona horaria (`+01:00`), lugar con dirección postal, organizador y precio 0; un archivo `.ics` para añadir el evento al calendario (con las horas en UTC, para que funcione en cualquier zona); el programa en una tabla con `<caption>` y `<time>`; y el mapa como página propia (`embed/map.html`) embebida con `title`, `width`, `height` y `loading="lazy"`, sin `sandbox` porque es nuestra. **Fíjate en** «(hora de Madrid)» junto a la hora: quien la lea desde otra zona horaria sabe a qué atenerse.

[[exercise:04-pagina-de-un-evento.md]]

## 05 · La ficha de un producto

**Objetivo:** una ficha clara y lista para aparecer con su precio en los buscadores. **Técnicas:** la ilustración del producto como SVG informativo, con un `<title>` enlazado por `aria-labelledby` que describe lo que se ve; las ventajas con iconos decorativos de un sprite, del color de la lista con `currentColor`; la ficha técnica en una tabla con encabezados de fila (`scope="row"`); y JSON-LD `Product` con marca, referencia, precio con punto decimal (`"89.00"`) y disponibilidad. **Fíjate en** que el precio visible se escribe a la española (`89,00 €`) y el del JSON-LD como un número: uno es para personas, el otro para máquinas.

[[exercise:05-ficha-de-producto.md]]

## 06 · Un informe de datos

**Objetivo:** gráficos que informan a todo el mundo, también a quien no los ve. **Técnicas:** un gráfico de barras y otro de línea en SVG, con `viewBox`, `role="img"`, `title` y una `desc` con los datos; la línea con `fill="none"` (si no, se rellenaría de negro) y una referencia discontinua con `stroke-dasharray`; los datos completos en una tabla dentro de un `<details>`; y una minigráfica en `<canvas>` nítida en pantallas Retina (mapa de bits × `devicePixelRatio` y `ctx.scale`) con su tabla de datos como contenido alternativo. **Fíjate en** que el canvas va en un `<figure>` y no en un `<p>`: una `<table>` dentro de un párrafo lo cerraría y saldría fuera del canvas.

[[exercise:06-informe-de-datos.md]]

## 07 · Un tablón con contenido ajeno

**Objetivo:** mostrar HTML que escriben otros sin poner en riesgo la página. **Técnicas:** cada anuncio de un vecino en un `srcdoc` con `sandbox=""` (uno intenta cambiar el título de la página y otro abrir una ventana: ninguno lo consigue); la encuesta de otra empresa con `sandbox="allow-scripts allow-forms"`, justo lo que necesita y nunca `allow-same-origin` junto a `allow-scripts`; nuestro reproductor sin `sandbox` pero solo con los permisos de `allow` que usa; y una tabla que resume quién escribe cada marco y qué puede hacer. **Fíjate en** la consola: el script comprueba al final que el título sigue intacto. Para votar en la encuesta, ábrela en el editor.

[[exercise:07-tablon-con-contenido-ajeno.md]]

## 08 · El archivo de un boletín

**Objetivo:** listar todos los números de un boletín a partir de datos. **Técnicas:** una tarjeta en un `<template>` que el script clona con `content.cloneNode(true)` una vez por número y coloca en la sección de su año; `<time datetime>` en cada fecha; enlaces con contexto («Leer el n.º 42», no «Leer más»); secciones con `aria-labelledby` hacia su encabezado; el feed RSS en el `<head>`; y un `<noscript>` con el índice en texto para quien no tiene JavaScript. **Fíjate en** la última línea de la consola: después de seis copias, la plantilla sigue intacta.

[[exercise:08-archivo-del-boletin.md]]

## 09 · Una portada con el `<head>` completo

**Objetivo:** el `<head>` de producción de una tienda, comentado línea a línea y en el orden recomendado. **Técnicas:** `charset` y `viewport` primero; título y descripción; `canonical` y las versiones en otros idiomas con `hreflang` (y `x-default`); icono SVG, `apple-touch-icon` PNG de 180 × 180 y `theme-color`; `preload` de la imagen principal con `as="image"` y `fetchpriority="high"` (la misma URL que usa el `<img>` de la portada, para no desperdiciarla); Open Graph con `og:image:alt` e idiomas, la tarjeta grande de X; y JSON-LD `Organization` con logo, redes y contacto. **Fíjate en** el `preconnect` comentado: solo merece la pena si la página va a pedir algo pronto a ese dominio.

[[exercise:09-landing-con-cabecera-completa.md]]

## 10 · Un comprobador de subtítulos

**Objetivo:** una herramienta interna para revisar que las pistas WebVTT de un vídeo cargan y van a tiempo. **Técnicas:** el vídeo de prueba con dos pistas `subtitles`; una tabla de estado con una fila clonada de un `<template>` por pista, actualizada con sus eventos `load` y `error` y su número de subtítulos; la pista sin `default` pasada a `mode = 'hidden'` para que se descargue sin verse; el subtítulo activo con el evento `cuechange`; un grupo de radio con su `<legend>` que cambia la pista visible; y `meta robots="noindex, nofollow"`, porque es una página interna. **Fíjate en** que el subtítulo activo no es una región viva: se actualiza cada segundo y un lector de pantalla no pararía de hablar.

[[exercise:10-comprobador-de-subtitulos.md]]

## 11 · Una biblioteca de iconos

**Objetivo:** la página de iconos de un sistema de diseño, que enseña a usarlos bien. **Técnicas:** un sprite con ocho `<symbol>` de 24 × 24; una tarjeta por icono clonada de un `<template>` que cambia el `href` del `<use>` y escribe su propio código de ejemplo; los tamaños (16, 24 y 32 px) sin perder nitidez gracias al `viewBox`; `currentColor` en un panel claro y otro oscuro; y los tres usos accesibles de la lección de SVG: decorativo con `aria-hidden`, informativo con `role="img"` y `aria-label`, y botón de solo icono con el nombre en el botón. **Fíjate en** los nombres de los botones: dicen qué hacen y sobre qué («Borrar la tarea «Regar los tomates»»), no solo «Borrar».

[[exercise:11-biblioteca-de-iconos.md]]

## 12 · Un catálogo dibujado en canvas

**Objetivo:** los patrones del juego de la vida, dibujados desde datos. **Técnicas:** un `<canvas>` por patrón con su caja en CSS y su mapa de bits × `devicePixelRatio`; cada canvas es una imagen sencilla, así que lleva `role="img"` y un `aria-label` que describe la figura; en los osciladores, un botón dibuja la generación siguiente, **cambia el `aria-label`** y lo anuncia en una región `role="status"`; contenido alternativo dentro de cada canvas para quien no tiene JavaScript; y, arriba, el vídeo con subtítulos. **Fíjate en** que la función de dibujo vuelve a asignar `width` y `height` en cada generación: eso borra el canvas, así que lo pinta entero otra vez.

[[exercise:12-catalogo-de-patrones.md]]

## Resumen

- Todo vídeo con sonido lleva subtítulos `captions`, todo audio una transcripción, y el vídeo una descripción cuando enseña algo que no se dice.
- Lo que se descarga, solo cuando hace falta: `preload="metadata"` o `"none"`, `loading="lazy"` en los marcos lejanos, `preload` solo para lo que se ve primero.
- Iconos de un sprite con `currentColor`: decorativos con `aria-hidden`; los SVG y los canvas que informan, con nombre (`role="img"`) o con sus datos en una tabla.
- Lo propio se embebe sin `sandbox` pero con `title` y los permisos justos de `allow`; lo ajeno, en `sandbox` con el mínimo de tokens.
- Las listas que salen de datos se pintan clonando un `<template>`, con una alternativa sin JavaScript.
- Para buscadores y redes: descripción, `canonical`, Open Graph con URL absolutas y el JSON-LD que corresponda (`VideoObject`, `PodcastEpisode`, `Recipe`, `Event`, `Product`, `Organization`), siempre diciendo lo mismo que la página.
