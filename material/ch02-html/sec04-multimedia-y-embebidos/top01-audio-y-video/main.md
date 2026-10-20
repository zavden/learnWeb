# Audio y vídeo

## Por qué importa

Hasta hace unos años, ver un vídeo en una web exigía un plugin (Flash) que había que instalar, se colgaba y no funcionaba en los móviles. Desde HTML5, el navegador reproduce audio y vídeo por sí mismo con dos elementos, `<audio>` y `<video>`, que traen sus propios controles, funcionan con el teclado y admiten subtítulos.

Usarlos bien no es solo escribir la etiqueta. Hay que elegir formatos que todos los navegadores sepan reproducir, añadir subtítulos para quien no oye y transcripciones para quien no puede escuchar, decidir cuánto se descarga antes de que nadie pulse ▶ y conocer la regla que más sorprende: el navegador **no deja** que un vídeo con sonido empiece solo.

Todos los ejemplos de esta lección usan dos clips de la carpeta del tema (ábrela con el botón «Assets»): `life.webm`/`life.mp4`, doce segundos del «juego de la vida» de Conway con una melodía, y `counter.webm`/`counter.mp4`, una carta de ajuste muda con un contador de segundos a la derecha.

## El elemento `video`

El vídeo más sencillo es un `<video>` con la URL del archivo en `src` y el atributo booleano `controls`, que pide al navegador sus botones: reproducir, barra de tiempo, volumen, subtítulos, pantalla completa y un menú ⋮ con más opciones (velocidad, imagen en imagen, descargar). Sin `controls`, el vídeo se ve pero no hay forma de manejarlo.

[[exercise:01-video-con-controls.md]]

Tres detalles de ese ejemplo que conviene copiar siempre:

- **`width` y `height`**, igual que en `<img>`: reservan el hueco antes de que llegue el vídeo. Sin ellos, el navegador dibuja un recuadro de 300 × 150 píxeles y, cuando conoce el tamaño real, la página entera salta.
- **Un `<track>` con subtítulos** (lo verás enseguida).
- **Contenido alternativo** dentro del `<video>`: un párrafo con un enlace para descargar el archivo. Ojo: solo lo muestra un navegador que no conoce el elemento `<video>`. Si el navegador lo conoce pero no sabe reproducir el formato, no aparece: verás el reproductor vacío o con un icono de error.

Estos son los atributos más habituales de `<video>` (casi todos sirven también para `<audio>`):

| Atributo | Qué hace |
|---|---|
| `controls` | muestra los controles del navegador |
| `width`, `height` | tamaño en píxeles CSS; reserva el hueco |
| `poster` | imagen que se ve antes de reproducir (solo `<video>`) |
| `preload` | cuánto descargar antes de que se pulse ▶: `none`, `metadata`, `auto` |
| `autoplay` | intenta empezar solo (con condiciones: más abajo) |
| `muted` | empieza silenciado |
| `loop` | vuelve a empezar al terminar |
| `playsinline` | en el iPhone, se reproduce dentro de la página y no a pantalla completa |
| `crossorigin` | pide los archivos con CORS (necesario para subtítulos de otro origen) |

Chrome añade algunos propios, como `controlslist="nodownload"` (quita «Descargar» del menú) o `disablepictureinpicture`. No impiden que alguien guarde el vídeo: cualquiera puede copiar su URL desde DevTools.

## El elemento `audio`

`<audio>` funciona igual, pero sin imagen: con `controls` muestra una barra de reproducción. **Sin `controls` no se ve nada**: la hoja de estilos del navegador le da `display: none`, así que un `<audio>` sin controles solo sirve para sonidos que maneja JavaScript.

[[exercise:02-audio-y-transcripcion.md]]

Un audio no tiene pantalla donde mostrar subtítulos. Su alternativa accesible es una **transcripción**: el texto de lo que se oye (palabras, quién habla, sonidos relevantes), en la propia página o enlazada. Un `<details>` es un buen sitio para ponerla sin ocupar espacio. Las transcripciones ayudan también a quien está en un sitio donde no puede poner sonido, y los buscadores las leen.

## Formatos: contenedor y códec

Un archivo de vídeo es un **contenedor** (`.webm`, `.mp4`) que guarda pistas comprimidas, cada una con su **códec**: uno para la imagen y otro para el sonido. El navegador tiene que entender las dos cosas. Los formatos que debes conocer:

| Contenedor | Códecs habituales | Soporte |
|---|---|---|
| MP4 (`video/mp4`) | H.264 + AAC | todos los navegadores: el formato «seguro» |
| WebM (`video/webm`) | VP9 o AV1 + Opus | todos los navegadores actuales; archivos más pequeños |
| MP3 (`audio/mpeg`) | MP3 | todos |
| Ogg (`audio/ogg`) | Opus | Chrome, Edge y Firefox; Safari, solo en versiones recientes |

Para ofrecer varios formatos, en lugar de `src` se escriben varios `<source>` dentro del `<video>` o del `<audio>`. El navegador los recorre **en orden** y usa el primero que sabe reproducir; los demás ni se descargan. El atributo `type` le dice el formato **sin tener que descargarlo**: sin él, tendría que pedir el archivo para averiguarlo. Pon primero el formato más eficiente y al final el más compatible.

[[exercise:03-source-y-formatos.md-]]

```text
video/webm; codecs="vp9, opus" → probably
video/mp4; codecs="avc1.42E01E, mp4a.40.2" → probably
video/webm → maybe
video/x-msvideo → (vacío: no sabe reproducirlo)
Archivo elegido → life.webm
```

`canPlayType()` es la pregunta que se hace el navegador con cada `type`, y sus respuestas son curiosas: `probably` («casi seguro que sí»), `maybe` («conozco el contenedor, pero no sé qué códecs lleva dentro») o una cadena vacía («no»). Nunca responde «sí» del todo, porque un archivo puede estar mal codificado aunque su tipo sea correcto. AVI (`video/x-msvideo`) es un contenedor antiguo que ningún navegador reproduce.

## Subtítulos: `track` y WebVTT

Un `<track>` dentro del `<video>` añade una pista de texto sincronizada con el vídeo. Sus atributos: `src` (el archivo), `kind` (qué contiene), `srclang` (su idioma), `label` (el nombre que aparece en el menú del reproductor) y `default` (la pista que se activa al empezar; como mucho una por tipo).

| `kind` | Para qué | ¿La dibuja el navegador? |
|---|---|---|
| `subtitles` (por defecto) | traducir lo que se dice, para quien oye pero no entiende el idioma | sí |
| `captions` | transcribir lo que se dice **y** los sonidos (♪, [risas], [suena el teléfono]), para quien no oye | sí |
| `descriptions` | describir lo que se ve, para leerlo con un lector de pantalla | no |
| `chapters` | títulos de las partes del vídeo | no (Chrome) |
| `metadata` | datos para tu código | no |

Los archivos de subtítulos usan el formato **WebVTT** (`.vtt`): un texto que empieza obligatoriamente por la línea `WEBVTT` y sigue con bloques (*cues*) separados por una línea en blanco. Cada bloque tiene un identificador opcional, un intervalo de tiempo (con **punto** antes de los milisegundos) y el texto:

```text
WEBVTT

00:00:00.000 --> 00:00:01.000
Cero: empieza la cuenta.

00:00:03.000 --> 00:00:04.000 line:10%
Tres: vamos por la mitad.
```

Tras el tiempo se pueden añadir ajustes de posición (`line:10%` lo sube casi arriba del todo, `align:start` lo alinea a la izquierda), y en el texto se admiten `<b>`, `<i>` y `<v Nombre>` para indicar quién habla. Los archivos `.vtt` deben ir en UTF-8. En este ejemplo hay dos pistas de subtítulos, en español y en inglés; cambia de una a otra con el botón de subtítulos del reproductor:

[[exercise:04-subtitulos-con-track.md]]

El formato SRT, el que producen muchos programas de subtitulado, se parece mucho a WebVTT, pero no es lo mismo: no lleva la línea `WEBVTT` y separa los milisegundos con una **coma** (`00:00:01,000`). Renombrar `subtitulos.srt` a `subtitulos.vtt` no basta: el navegador rechaza el archivo entero y en la página no hay ningún aviso, solo faltan los subtítulos.

[[exercise:05-subtitulos-en-formato-srt.md-]]

```text
counter-subtitles-es.vtt → cargado (8 subtítulos)
counter-es-from-srt.vtt → error (0 subtítulos)
```

Las dos líneas pueden salir en cualquier orden: aparecen según termina cada archivo. El `<track>` lanza el evento `load` si ha podido leer el archivo y `error` si no; su propiedad `readyState` vale 2 (cargado) o 3 (error).

### Subtítulos de otro origen: `crossorigin`

Hay una segunda razón por la que los subtítulos pueden no aparecer, y es muy frecuente cuando los vídeos están en otro servidor (un CDN). Un `<track>` solo se carga si el `.vtt` viene del **mismo origen** que la página (mismo esquema, servidor y puerto, como viste en «Cómo funciona la web»), o si el `<video>` lleva el atributo `crossorigin` **y** el servidor del `.vtt` lo permite con la cabecera `Access-Control-Allow-Origin` (es CORS, que estudiarás en el capítulo de JavaScript en el navegador). Si no, el navegador lo bloquea y solo lo dice en la consola de DevTools.

Por eso los vídeos con subtítulos de este módulo llevan `crossorigin="anonymous"`. Las tarjetas de esta teoría, la galería y «▶ Run» ejecutan cada ejemplo en un iframe aislado que no tiene origen propio (lo entenderás en la lección de iframes): para él, cualquier archivo es «de otro origen». El servidor de LearnWeb permite CORS en los archivos de los temas, así que con `crossorigin` todo funciona. En tu web, si el vídeo y los subtítulos están en el mismo servidor, no hace falta; y si los pones en un CDN, ese servidor debe enviar las cabeceras CORS, porque con `crossorigin` y sin ellas **ni siquiera el vídeo** se carga.

## Reproducción automática

El atributo `autoplay` pide que el vídeo empiece solo. Pero los navegadores protegen a la gente de las páginas que se ponen a hablar sin permiso, y aplican una **política de autoplay**. En Chrome:

- Un vídeo **silenciado** (`muted`) puede empezar solo siempre.
- Un vídeo **con sonido** solo puede empezar solo si la persona ya ha **interactuado** con la página (un clic, una pulsación, una tecla), o si el navegador ha aprendido que suele ver vídeos con sonido en ese sitio (su *Media Engagement Index*, que puedes consultar en `chrome://media-engagement`).
- Si el vídeo con sonido está dentro de un iframe de **otro origen**, además la página que lo contiene debe darle permiso con `allow="autoplay"` (lección de iframes).

Si no se cumple, el navegador **no reproduce y no avisa**: el vídeo se queda quieto en su primer fotograma, sin ningún error en la página.

[[exercise:06-autoplay-solo-con-muted.md]]

En esta tarjeta, el vídeo de la izquierda se queda en «⏸ bloqueado» y el de la derecha se reproduce sin sonido. Si abres el ejemplo en el editor puede que arranquen los dos, y eso es justo lo que hace traicionero a este fallo: la vista previa del editor tiene permiso de autoplay y tú ya has pulsado en LearnWeb, igual que, mientras programas tu web, ya has hecho clic en ella mil veces. Quien llega a tu página desde un buscador no ha interactuado con nada.

Las reglas para usar `autoplay` bien:

- Si un vídeo debe empezar solo (un fondo animado, una demostración), ponle `muted`, y en el móvil también `playsinline`.
- Deja siempre `controls` (o un botón de pausa): si el autoplay falla, la persona puede pulsar ▶, y quien no quiere movimiento en la pantalla puede pararlo. Las pautas de accesibilidad (WCAG) piden poder pausar todo lo que se mueve solo más de 5 segundos y todo sonido automático de más de 3.
- Nunca dependas de que el sonido arranque solo: para el navegador es una molestia, no una función.

## `poster` y `preload`

`poster` es la imagen que se muestra antes de reproducir: una portada que tú eliges, en lugar del primer fotograma (que a menudo es negro). `preload` le dice al navegador cuánto descargar **antes** de que nadie pulse ▶:

| `preload` | Qué descarga antes de reproducir | Úsalo cuando… |
|---|---|---|
| `none` | nada; ni siquiera sabe cuánto dura | hay muchos vídeos en la página o es poco probable que se vean |
| `metadata` (lo que hace Chrome si no escribes nada) | el principio del archivo: duración, tamaño y primer fotograma | casi siempre |
| `auto` | lo que le parezca, quizá el archivo entero | el vídeo es lo principal de la página |

Es una **pista**, no una orden: el navegador puede descargar menos (en el móvil, con ahorro de datos) y `autoplay` la anula, porque reproducir obliga a descargar.

[[exercise:07-poster-y-preload.md]]

```text
preload="none" → duration: NaN (aún no lo sabe)
preload="metadata" → duration: 12.0 s
```

`duration` vale `NaN` («no es un número», como `float('nan')` en Python) mientras el vídeo no conoce sus metadatos. En DevTools → Network, con el filtro **Media**, verás que el primer vídeo no hace ninguna petición hasta que lo pulsas.

## Saltar a un momento

Para que un vídeo empiece en un segundo concreto no hace falta JavaScript: basta un **fragmento de tiempo** al final de su URL. `#t=30` empieza en el segundo 30; `#t=30,45` además se detiene en el 45; también sirve en un enlace (`<a href="charla.mp4#t=90">`) para compartir un momento exacto.

[[exercise:08-fragmentos-de-tiempo.md]]

Desde JavaScript, `currentTime` es la posición del vídeo en segundos: se lee para saber por dónde va y se cambia para saltar. Los capítulos de un `<track kind="chapters">` no los dibuja Chrome, pero un pequeño script puede leerlos (`track.cues`) y convertirlos en un índice:

[[exercise:09-capitulos-y-currenttime.md]]

El índice es una lista de botones dentro de un `<nav>`, con su nombre: se maneja con el teclado como cualquier otro botón. Bastan unas pocas líneas de JavaScript porque el navegador ya ha leído el `.vtt`: el reproductor que hay detrás (`play()`, `pause()`, `volume`, eventos como `timeupdate` o `ended`) lo estudiarás en el capítulo de JavaScript en el navegador.

## Multimedia accesible: lista de comprobación

- **Subtítulos** (`captions`, con los sonidos) en todo vídeo con sonido; **transcripción** en todo audio.
- **Audiodescripción** o una descripción en texto si el vídeo enseña algo que no se dice (un gráfico, un gesto importante).
- **Controles** siempre disponibles: los nativos funcionan con el teclado y con lectores de pantalla.
- **Nada de sonido automático**, y una forma de pausar lo que se mueve solo.
- Una frase de **contexto** junto al vídeo (qué es y cuánto dura) para quien decide si lo reproduce.

## Bestiario

- **El vídeo no empieza solo.** Síntoma: con `autoplay`, el vídeo se queda quieto en el primer fotograma, sin ningún error; en tu ordenador sí arrancaba. Causa: la política de autoplay bloquea el sonido hasta que la persona interactúa con la página (y tú ya habías hecho clic mientras programabas). Solución: `autoplay muted playsinline` y siempre `controls`; el sonido, solo cuando la persona lo pida. → [ver ejemplo](06-autoplay-solo-con-muted.md)
- **Los subtítulos no aparecen.** Síntoma: el vídeo funciona, pero el menú de subtítulos está vacío o no muestra nada. Causa: el archivo no es WebVTT (un SRT renombrado: sin `WEBVTT`, con comas en los tiempos), o viene de otro origen sin `crossorigin` y sin cabeceras CORS. Solución: convierte el SRT (añade `WEBVTT` y cambia las comas de los tiempos por puntos) y sirve el `.vtt` desde el mismo origen o con CORS; el evento `error` del `<track>` y la consola de DevTools te dicen cuál de las dos es. → [ver ejemplo](05-subtitulos-en-formato-srt.md)

## Resumen

- `<video>` y `<audio>` con `controls` reproducen sin plugins; un `<audio>` sin `controls` no se ve.
- `width` y `height` reservan el hueco del vídeo; el contenido de dentro solo lo ve un navegador sin `<video>`.
- Varios `<source>` con su `type`: el navegador usa el primero que sabe reproducir (WebM primero, MP4 de respaldo).
- `<track>` añade subtítulos en WebVTT (`subtitles`, `captions`, `chapters`…); de otro origen, solo con `crossorigin` y CORS.
- `autoplay` con sonido se bloquea hasta que la persona interactúa; `autoplay muted playsinline` sí arranca.
- `poster` pone la portada; `preload` (`none`, `metadata`, `auto`) decide cuánto se descarga antes de pulsar ▶.
- `#t=inicio,fin` en la URL salta a un momento; `currentTime` lo hace desde JavaScript.

## Para profundizar

- [MDN: `<video>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/video)
- [MDN: Formatos de medios en la web](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats)
- [MDN: WebVTT](https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API)
- [Chrome for Developers: Autoplay policy in Chrome](https://developer.chrome.com/blog/autoplay)
- [W3C WAI: Making Audio and Video Media Accessible](https://www.w3.org/WAI/media/av/)
