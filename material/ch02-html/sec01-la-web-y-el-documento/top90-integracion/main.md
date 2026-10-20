# Integración: la web y el documento

## Por qué importa

En las lecciones viste cada pieza por separado: la URL y HTTP, la anatomía del documento, la sintaxis de elementos y atributos, el parser y la cadena de renderizado. En una página real todas actúan a la vez, y los fallos más difíciles aparecen justo en las costuras: un archivo que llega bien por HTTP pero el parser lo reorganiza, un atributo correcto que el CSS anula, una ruta que funciona en un documento y no en otro.

Aquí tienes siete ejemplos que combinan varias lecciones y tres ejercicios que se corrigen solos: su consola dice qué está bien (✅) y qué falta (❌).

## Qué combina cada ejemplo

| Ejemplo | La web | Documento | Elementos | Parser | Píxeles |
|---|---|---|---|---|---|
| 01 Radiografía de un documento | ✔ | ✔ | ✔ | ✔ | ✔ |
| 02 Del servidor al DOM | ✔ | ✔ | | ✔ | |
| 03 Una ruta, dos documentos | ✔ | ✔ | | | ✔ |
| 04 La vida de una página | ✔ | | | ✔ | ✔ |
| 05 `hidden` contra el CSS | | | ✔ | | ✔ |
| 06 Escribir código en HTML | ✔ | | ✔ | ✔ | ✔ |
| 07 El DOCTYPE cambia el parser | | ✔ | | ✔ | |

## Radiografía de un documento

Un documento completo y correcto que se examina a sí mismo, capa a capa: su URL y la de sus recursos, su modo y su codificación, sus elementos, el momento del parser en que se ejecuta el script y el estilo computado. Es el esqueleto que usarás a partir de ahora, con todas las piezas en su sitio y una nota de por qué está cada una.

[[exercise:01-radiografia-de-un-documento.md-]]

```text
— 1. La web —
URL del documento → http://localhost:3001/preview/ch02-html/…/top90-integracion/<id>/index.html
el logo se pidió a → http://localhost:3001/preview/ch02-html/…/top90-integracion/<id>/img/logo.svg
— 2. El documento —
modo / codificación / idioma → CSS1Compat / UTF-8 / es
título → Radiografía de un documento · Web a fondo
— 3. Elementos y atributos —
alt del logo → Web a fondo
elementos hijos del body → 5
— 4. El parser —
readyState → loading (el parser sigue leyendo: app.js aún espera)
— 5. Los píxeles —
display del head → none | font-size del h1 → 32px
js/app.js (defer) → readyState: interactive | imágenes en el DOM: 1
```

Fíjate en la última línea: `app.js` está en el `<head>`, pero con `defer` se ejecuta **después** del script del final del `body`.

## Del servidor al DOM

Este ejemplo recorre el camino completo de la primera lección a la cuarta. Descarga por HTTP una página antigua (`legacy-page.html`, en `assets/`), enseña que lo que llega es solo **texto**, y luego pasa ese texto por el parser del navegador con `DOMParser`. Sin DOCTYPE, el documento queda en quirks mode; sin etiquetas `head` ni `body`, el parser las crea; y los tres errores de la página (un `div` dentro de un `p`, una `meta` tardía y texto suelto en una tabla) se reparan con las reglas que ya conoces.

[[exercise:02-del-servidor-al-dom.md-]]

```text
1. HTTP → 200 OK | text/html; charset=UTF-8
2. Texto recibido →
<title>Tienda antigua</title>
<p class="intro">Bienvenido <div>a nuestra tienda</div></p>
<meta name="description" content="Una página escrita sin DOCTYPE y con errores">
<table><tr><td>Oferta</td></tr>¡Solo hoy!</table>
3. Modo → BackCompat (no tiene DOCTYPE)
   head → <title>Tienda antigua</title>
   body → <p class="intro">Bienvenido </p><div>a nuestra tienda</div><p></p>
<meta name="description" content="Una página escrita sin DOCTYPE y con errores">
¡Solo hoy!<table><tbody><tr><td>Oferta</td></tr></tbody></table>
```

## Una ruta, dos documentos

En la primera lección calculaste con `new URL` que una ruta relativa depende del documento. Aquí lo ves en píxeles: la página principal y el documento `docs/guide.html` (mostrado dentro de un iframe) usan la misma ruta `img/logo.svg`. En la página principal funciona; dentro de `docs/` apunta a `docs/img/logo.svg` y la imagen sale rota. La ruta correcta desde `docs/` es `../img/logo.svg`.

[[exercise:03-una-ruta-dos-documentos.md]]

## La vida de una página

Una línea de tiempo completa: un script en el `head`, scripts a mitad y al final del `body`, un script externo con `defer`, un `<script type="module">`, y los eventos `DOMContentLoaded` y `load`. Cada línea muestra el `readyState` del documento en ese instante: `loading` mientras el parser lee, `interactive` cuando ha terminado, `complete` cuando también han llegado imágenes y hojas de estilo.

[[exercise:04-la-vida-de-una-pagina.md-]]

```text
loading     · 1. script en el head: el body aún no existe
loading     · 2. a mitad del body: solo existe lo que hay encima
loading     · 3. último script del body: la imagen quizá siga descargándose
interactive · 4. script con defer (js/deferred.js)
interactive · 5. script type="module": se ejecuta como si tuviera defer
interactive · 6. DOMContentLoaded: DOM completo
complete    · 7. load: imágenes y hojas de estilo también descargadas
```

El orden de 4 y 5 no es casualidad: los scripts diferidos (con `defer` o de tipo módulo) se ejecutan en el orden en que aparecen en el documento.

## `hidden` contra el CSS

El atributo `hidden` (lección de atributos) funciona gracias a una regla de la hoja de estilos del navegador, `[hidden] { display: none }` (lección del render). Si tu CSS da otro `display` al mismo elemento, tu regla gana y el elemento oculto **reaparece**, aunque el atributo siga ahí. Es un error muy común en componentes con clases como `.badge` o `.card`.

[[exercise:05-hidden-contra-css.md]]

```text
⚠️ Sin conexión (no deberías verme) → hidden: true | display computado: inline-block
⚠️ Sin conexión (versión corregida) → hidden: true | display computado: none
```

## Escribir código en HTML

Mostrar código en una página mezcla tres lecciones. `<pre>` conserva los espacios y los saltos de línea (porque cambia cómo el CSS dibuja los espacios), pero **no** desactiva el parser: si escribes `<img>` dentro, el navegador crea una imagen de verdad y hasta la descarga. Para que el código se vea como texto hay que escapar `<` y `&` con entidades. Y en el texto normal, `&nbsp;` evita que una cantidad se separe de su unidad al final de una línea.

[[exercise:06-escribir-codigo-en-html.md]]

```text
❌ #raw, elementos → <code><p class="intro">Hola</p>
<img src="img/logo.svg" alt="Logo"></code>
❌ #raw, solo su texto → "Hola\n"
✅ #escaped, su texto → <p class="intro">Hola</p>
<img src="img/logo.svg" alt="Logo">
```

## El DOCTYPE también cambia el parser

En la lección del documento viste que el quirks mode cambia el CSS. También cambia una regla del parser: en modo estándar, una `<table>` cierra el párrafo abierto (como cualquier bloque); en quirks mode, por compatibilidad con las páginas de los 90, la tabla se queda **dentro** del párrafo. El mismo HTML produce dos árboles distintos según su primera línea.

[[exercise:07-quirks-cambia-el-parser.md-]]

```text
con DOCTYPE → CSS1Compat
<p>Texto antes de la tabla</p><table><tbody><tr><td>celda</td></tr></tbody></table>
sin DOCTYPE → BackCompat
<p>Texto antes de la tabla<table><tbody><tr><td>celda</td></tr></tbody></table></p>
```

## Ejercicios

Los tres ejercicios incluyen un script de comprobación que no tienes que tocar: tras cada cambio, la vista previa se vuelve a ejecutar y la consola marca cada requisito con ✅ o ❌. Cuando todo esté en verde, compara tu versión con la solución.

**Arregla el documento.** Un documento sin DOCTYPE, sin codificación, sin idioma ni título, con un script que se ejecuta demasiado pronto (y lanza un `TypeError` en la consola) y una `meta` fuera de sitio. Repasa la anatomía del documento y la carga de scripts.

[[exercise:08-ej-arregla-el-documento.md]]

**Arregla las rutas rotas.** Una hoja de estilos, un logo y un enlace que terminan en `404`. Empieza por la pestaña **Network** de DevTools: cada petición fallida te dice qué URL calculó el navegador. La comprobación del enlace usa una petición `HEAD`, como en la primera lección.

[[exercise:09-ej-rutas-rotas.md]]

**Consigue el DOM que esperabas.** Cinco trampas en un mismo fragmento: un bloque dentro de un párrafo, un atributo booleano con valor `"false"`, entidades antiguas sin punto y coma en una URL y un `<div />` que no se cierra. La consola imprime también el DOM real, para que veas qué construyó el parser.

[[exercise:10-ej-el-dom-que-esperabas.md]]

## Resumen

- Los fallos reales suelen estar en las costuras: entre HTTP y el parser, entre los atributos y el CSS, entre una ruta y el documento que la contiene.
- Lo que llega por HTTP es texto; el DOM es lo que el parser construye con él, y el DOCTYPE puede cambiar hasta las reglas del parser.
- Las rutas relativas se resuelven contra **cada** documento (o CSS) por separado.
- Los scripts diferidos (`defer`, `type="module"`) respetan su orden y se ejecutan antes de `DOMContentLoaded`; `load` espera también a imágenes y estilos.
- `hidden` depende de una regla de CSS del navegador que tu propio CSS puede anular.
- Dentro de `<pre>` las etiquetas siguen siendo etiquetas: escapa siempre `<` y `&`.

## Para profundizar

- [W3C — Validador de HTML (Nu Html Checker)](https://validator.w3.org/nu/): pega tu documento y te señala cada error que el parser repararía en silencio.
- [MDN — DOMParser](https://developer.mozilla.org/es/docs/Web/API/DOMParser)
- [MDN — Document.readyState](https://developer.mozilla.org/es/docs/Web/API/Document/readyState)
