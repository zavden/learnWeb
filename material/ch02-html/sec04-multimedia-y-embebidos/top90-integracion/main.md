# Integración: multimedia y contenido embebido

## Por qué importa

En las lecciones de este módulo viste cada pieza por separado: el audio y el vídeo con sus subtítulos, el SVG, el canvas, los iframes y las plantillas con los metadatos. En una página real se usan juntas y se apoyan unas en otras: los capítulos de un vídeo se pintan con un `<template>`, un gráfico de canvas guarda su tabla de datos dentro, un reproductor se publica como página propia para que otros lo embeban en un iframe, y la página de ese vídeo describe todo lo anterior en su `<head>` para buscadores y redes.

Tres preguntas guían estos ejemplos: **¿qué percibe quien no ve o no oye?** (subtítulos, transcripciones, `title` y `desc`, tablas de datos), **¿qué se descarga y cuándo?** (`preload`, `loading="lazy"`, plantillas inertes) y **¿en qué confía la página?** (`sandbox`, `allow`, mismo origen). La consola responde a las tres en casi todos.

Aquí tienes siete ejemplos que combinan varias lecciones y tres ejercicios que se corrigen solos: su consola marca cada requisito con ✅ o ❌.

## Qué combina cada ejemplo

| Ejemplo | Audio y vídeo | SVG | Canvas | Iframes | Template y metadatos |
|---|---|---|---|---|---|
| 01 Ejercicio de oído | ✔ | ✔ | | | |
| 02 Lección en vídeo | ✔ | | | | ✔ |
| 03 Infografía del riego | | ✔ | | | ✔ |
| 04 Gráfico en canvas | | | ✔ | | ✔ |
| 05 Widget embebido | ✔ | | | ✔ | |
| 06 Fragmentos para practicar | ✔ | | | | ✔ |
| 07 Vídeo para buscadores | ✔ | | | ✔ | ✔ |

Las vistas previas de esta página no tienen consola: pulsa cualquiera de ellas para abrirla en un diálogo con la consola debajo, o ábrela en el editor.

## Ejercicio de oído

La página de una escuela de música: una melodía para escuchar y cantar antes de mirar la partitura. El audio va en dos formatos (Opus y MP3 de respaldo) con `preload="metadata"`, que solo pide la duración. Tres botones saltan a cada vuelta cambiando `currentTime`. La partitura es un SVG **informativo** (`role="img"` con `title` y `desc` enlazados) cuyas notas usan `currentColor`, y la transcripción, la alternativa accesible de todo audio, está en un `<details>`.

[[exercise:01-ejercicio-de-oido.md]]

```text
duración del audio → 12.0 s
▶ desde el segundo 4
```

La segunda línea aparece al pulsar «2.ª vuelta». Fíjate en que la `desc` del SVG y la transcripción dicen lo mismo con palabras distintas: una describe lo que se **ve** y la otra lo que se **oye**.

## Lección en vídeo

Una lección completa: `poster`, dos formatos, subtítulos para personas sordas (`captions`, con los sonidos entre corchetes) en español y en inglés, y un índice de capítulos. Los capítulos vienen de un `<track kind="chapters">`: Chrome no los dibuja, así que un script lee sus `cues` y clona un `<template>` por capítulo; cada botón salta con `currentTime`. Debajo, una descripción de lo que se ve, para quien no puede ver el vídeo.

[[exercise:02-leccion-en-video.md]]

```text
capítulos pintados → 3
```

El script clona la plantilla (`content.cloneNode(true)`) en cada vuelta del bucle: si insertara `template.content` directamente, solo aparecería el primer capítulo, el error de la lección de plantillas.

## Infografía del riego

Tres datos del verano en tarjetas y un gráfico de barras. Los iconos vienen de un **sprite** (`<symbol>` con su `viewBox`, reutilizado con `<use>`) y se pintan con `currentColor`, así que cada tarjeta decide su color con una sola propiedad. Las tarjetas salen de un `<template>`: el script cambia el `href` del `<use>` de cada copia para elegir el icono. Los iconos son **decorativos** (`aria-hidden="true"`), porque el texto de la tarjeta ya lo dice todo; el gráfico, en cambio, es **informativo**, con sus datos en la `desc`.

[[exercise:03-infografia-del-riego.md]]

```text
tarjetas → 3 · iconos usados → #icon-drop #icon-sun #icon-leaf
```

## Gráfico en canvas

La lluvia de seis meses en un `<canvas>`. Su caja mide 320 × 180 en el CSS y el script le da un mapa de bits de 320 × 180 **por `devicePixelRatio`**, con `ctx.scale`, para que se vea nítido en una pantalla Retina. Como es un gráfico con datos, el canvas no lleva `role`: dentro tiene una tabla de verdad, que leen los lectores de pantalla y que aparece si no hay JavaScript. Y la misma tabla, visible para todo el mundo dentro de un `<details>`, se construye clonando una fila de un `<template>` por mes.

[[exercise:04-grafico-en-canvas.md]]

```text
devicePixelRatio 2 → mapa de bits 640 × 360 para una caja de 320 × 180
filas de la tabla visible → 6
```

En una pantalla normal la primera línea dirá `devicePixelRatio 1 → mapa de bits 320 × 180`. Asignar `width` y `height` borra el canvas, por eso la función lo dibuja todo después de ajustar el tamaño.

## Widget embebido

Un boletín que embebe dos cosas con criterios opuestos. La primera es **su propio** reproductor, publicado como página aparte (`player.html`, ábrelo con «Assets»): es del mismo origen y de confianza, así que no lleva `sandbox`, pero sí `title`, `width` y `height`, `loading="lazy"` y los permisos que usa su vídeo, `allow="fullscreen; picture-in-picture"`. La segunda es el comentario de una lectora, HTML que la página no controla: va en un `srcdoc` con `sandbox=""`, y su script, que intenta cambiar el título de la página, no llega a ejecutarse.

[[exercise:05-widget-embebido.md]]

```text
«Reproductor: el juego de la vida» → sandbox: (ninguno) · allow: fullscreen; picture-in-picture · loading: lazy
«Comentario de Rosa Elena» → sandbox: "" · allow: (ninguno) · loading: eager
título de esta página → Boletín del huerto (el comentario no pudo cambiarlo)
```

Ese inventario es lo primero que mira cualquier revisión de seguridad: qué marcos hay, qué pueden hacer y por qué.

## Fragmentos para practicar

Cuatro trozos del mismo audio, cada uno con su transcripción, generados desde un `<template>`. Cada `<source>` apunta al archivo con un **fragmento de tiempo** (`melody.ogg#t=2,4`), así que el reproductor empieza y se detiene donde dice la URL. Con varios audios en la misma página, `preload="none"` evita que se descarguen todos al abrirla: ninguno pide nada hasta que pulsas ▶.

[[exercise:06-fragmentos-para-practicar.md]]

```text
La subida (0 – 2 s) → melody.mp3#t=0,2
La bajada (2 – 4 s) → melody.mp3#t=2,4
La melodía entera (0 – 4 s) → melody.mp3#t=0,4
Las tres vueltas (0 – 12 s) → melody.mp3#t=0,12
```

Un detalle de la plantilla: cambiar el `src` de un `<source>` que ya está dentro de un `<audio>` no hace que el audio lo vuelva a mirar; por eso el script llama a `load()` después.

## Vídeo para buscadores

La página de un vídeo preparada para que se encuentre y se comparta bien. Lleva `description` y `canonical`, Open Graph de vídeo (`og:type="video.other"`, `og:image` con la miniatura y `og:video` con el archivo), la tarjeta `player` de X y un JSON-LD `VideoObject` con la duración en formato ISO (`PT12S`). La tarjeta `player` cierra el círculo con la lección de iframes: la red social **embebe** tu reproductor en un iframe dentro del post, así que `twitter:player` apunta a una página de reproductor, como el `player.html` del ejemplo 05, y no al `.mp4`.

[[exercise:07-video-para-buscadores.md-]]

```text
título → El juego de la vida en 12 segundos · Lecciones del Club de Ciencia
description → Un autómata celular de 1970 explicado en un vídeo de 12 segundos: celdas que nacen y mueren según sus vecinas.
og:video → https://clubdeciencia.example/lecciones/juego-de-la-vida/life.mp4
tarjeta de X → player · reproductor: https://clubdeciencia.example/embed/juego-de-la-vida/
JSON-LD → VideoObject: El juego de la vida en 12 segundos · PT12S
```

## Ejercicios

Los tres ejercicios incluyen una comprobación que no tienes que tocar (el script y el CSS de los dos primeros están bloqueados; la del tercero está en `js/check-share.js`, en «Assets»): tras cada cambio, la vista previa se vuelve a ejecutar y la consola marca cada requisito con ✅ o ❌. Ábrelos en el editor para trabajar con la consola a la vista y, cuando todo esté en verde, compara tu versión con la solución.

**Haz accesible el vídeo de la lección.** Un `<video src="life.mp4" autoplay>` sin nada más: sin controles, sin tamaño, sin portada, sin subtítulos, en un solo formato y empeñado en sonar solo. Conviértelo en un vídeo que funcione con el teclado, que reserve su hueco, que tenga subtítulos para sordos en dos idiomas y que espere a que la persona pulse ▶.

[[exercise:08-ej-video-accesible.md]]

**Asegura los marcos del foro.** Una vista previa de mensajes con `sandbox="allow-scripts allow-same-origin"`: el «mensaje» de un usuario ha cambiado el título de la página. Además, ningún marco tiene nombre, el reproductor no puede ir a pantalla completa y el mapa del final se descarga aunque nadie llegue hasta él. Cuando lo arregles, el título volverá a ser «Foro del huerto».

[[exercise:09-ej-embebidos-seguros.md]]

**Prepara la página para compartir.** La página de unos talleres sin `description` ni `canonical`, con una `og:image` relativa que ninguna red sabrá resolver y un JSON-LD con un error de sintaxis que el navegador jamás te señalará, porque nunca lo ejecuta. Y su lista de talleres, hecha con un `<template>`, solo muestra uno: el último.

[[exercise:10-ej-prepara-la-pagina-para-compartir.md]]

## Resumen

- Todo audio lleva transcripción y todo vídeo con sonido, subtítulos `captions`; un SVG o un canvas con datos, sus datos en texto (`desc`, una tabla).
- Los capítulos, las tarjetas y las filas de una tabla salen de un `<template>` clonado con `content.cloneNode(true)`, nunca insertando `template.content`.
- Qué se descarga y cuándo: `preload="metadata"` o `"none"` en los medios, `loading="lazy"` en los iframes lejanos, y lo que está en un `<template>` no se descarga.
- Tu propio contenido embebido (del mismo origen) no necesita `sandbox`, pero sí `title` y los permisos de `allow` que use; el HTML ajeno, `sandbox` con el mínimo de tokens, y nunca `allow-scripts` junto con `allow-same-origin`.
- Un canvas nítido tiene un mapa de bits de su caja por `devicePixelRatio`, y se redibuja entero tras cambiar su tamaño.
- Para buscadores y redes: `description`, `canonical` y `og:image` absolutas, y JSON-LD válido (el navegador no te avisará si no lo es).
