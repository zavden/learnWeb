# Iframes y contenido embebido

## Por qué importa

Un `<iframe>` («marco en línea») mete **otra página entera** dentro de la tuya: un vídeo de YouTube, un mapa, una pasarela de pago, un reproductor de Spotify, la vista previa de un editor como este. Es una ventana a un segundo documento, con su propio `<head>`, su CSS, su JavaScript y su propia dirección.

Esa potencia es también el peligro. Si embebes algo que no controlas (un anuncio, un comentario, un widget de otra empresa), le estás dando un trozo de tu página. Por eso los iframes vienen con dos cerrojos que esta lección explica hasta el final: `sandbox`, que le quita permisos al documento embebido, y la **política de permisos** (`allow`), que decide qué funciones del navegador puede usar. Y por eso los navegadores separan los documentos por **origen**: tu código no puede leer lo que hay dentro de un marco de otro sitio, ni él leer el tuyo.

Al terminar entenderás además por qué todo lo que ves en LearnWeb corre dentro de un iframe, y qué significaba aquel `about:srcdoc` que aparecía en la consola.

## El elemento `iframe`

El iframe más sencillo tiene un `src` con la URL del documento que quieres mostrar. Aquí embebemos `widget.html`, otra página HTML completa guardada en la carpeta `assets/` del tema (ábrela con el botón «Assets»): como está junto a la página, basta su nombre.

[[exercise:01-iframe-basico.md]]

Cuatro atributos que conviene poner siempre:

- **`title`** da nombre al marco. Es **obligatorio para la accesibilidad**: sin él, un lector de pantalla solo anuncia «marco», sin decir qué contiene. Escribe qué hay dentro: «Mapa de la sede», «Reproductor de vídeo».
- **`width` y `height`** fijan el tamaño en píxeles, igual que en `<img>` o `<video>`. Sin ellos, el marco mide 300 × 150 (como un `<canvas>` o un `<svg>` sin `viewBox`) y la página salta cuando llega el contenido.
- **`loading="lazy"`** retrasa la descarga del documento embebido hasta que está a punto de verse. Ideal para un mapa o un vídeo al final de una página larga: no gasta datos ni ralentiza el arranque si nadie baja hasta él.
- **`referrerpolicy`** controla cuánto de tu URL se le cuenta al sitio embebido en la cabecera `Referer` (por ejemplo `no-referrer` para no filtrar la dirección de tu página). Lo verás a fondo con las peticiones en el capítulo de JavaScript.

## `srcdoc`: el documento escrito dentro

En lugar de apuntar a un archivo con `src`, puedes escribir el documento entero en el atributo `srcdoc`. Es cómodo para aislar una porción de HTML sin crear un archivo: una previsualización, un comentario de usuario, una plantilla de correo.

[[exercise:02-srcdoc.md]]

Hay una trampa de comillas. El valor de `srcdoc` va entre comillas dobles, así que **dentro no puedes usar comillas dobles**: la primera cerraría el atributo y el resto del HTML se desparramaría por la página. Dos salidas: usar comillas simples dentro (`class='aviso'`) o escribir las dobles como la entidad `&quot;`. Es el mismo problema de escapado que viste con `&amp;` y `&lt;` en el módulo del documento, llevado a su extremo.

El documento de un `srcdoc` (o de un `src` a otro sitio) vive **aparte**: su CSS no afecta a tu página y el tuyo no le afecta a él. Son dos mundos. Esa es justo la idea.

## `sandbox`: poner en cuarentena lo que viene de fuera

El atributo `sandbox` mete el documento embebido en una «caja de arena»: le quita permisos. Vacío (`sandbox=""`) es el encierro máximo, y es un buen punto de partida mental: **todo prohibido**.

[[exercise:03-sandbox-vacio.md]]

Con el sandbox vacío, el script de dentro no corre (el texto se queda en «desactivados»), el formulario no se envía, no puede abrir ventanas y tiene un **origen opaco**: no es tu origen, así que no ve tus cookies ni tu almacenamiento. A partir de ahí, cada **token** que añades devuelve **un** permiso concreto:

| Token | Devuelve el permiso de… |
|---|---|
| `allow-scripts` | ejecutar JavaScript |
| `allow-forms` | enviar formularios |
| `allow-popups` | abrir ventanas o pestañas (`target="_blank"`, `window.open`) |
| `allow-same-origin` | conservar su origen real (y con él cookies y almacenamiento) |
| `allow-modals` | usar `alert`, `confirm`, `prompt` |
| `allow-downloads` | descargar archivos |
| `allow-popups-to-escape-sandbox` | que las ventanas que abra **no** hereden el sandbox |

[[exercise:04-sandbox-tokens.md-]]

Abre ese ejemplo en el editor para ver la diferencia (en las tarjetas de la teoría, como enseguida verás, todos los marcos tienen ya un origen opaco). Allí, cada marco imprime su origen y si puede usar `localStorage`:

```text
sandbox="allow-scripts"                  → origen: null · almacenamiento: no (origen opaco)
sandbox="allow-scripts allow-same-origin" → origen: http://localhost:3001 · almacenamiento: sí
sandbox="allow-scripts allow-popups"      → el botón abre una pestaña; sin el token, «bloqueado»
```

La regla práctica: concede **solo** lo que el contenido embebido necesita de verdad, y nada más.

## Un sandbox que no aísla

Hay una pareja de tokens que parece inofensiva y no lo es: `allow-scripts` **junto con** `allow-same-origin`, cuando el documento embebido es del **mismo origen** que tu página (y un `srcdoc` siempre hereda tu origen).

[[exercise:05-sandbox-allow-same-origin-trampa.md-]]

Con esos dos tokens a la vez, el marco vuelve a estar en **tu** origen y además ejecuta scripts: su código puede entrar en tu página (`parent.document`), leerla, cambiarla y hasta **quitarse su propio `sandbox`** con `frameElement.removeAttribute('sandbox')`. Es un sandbox solo de nombre. El ejemplo lo demuestra sin hacer daño: el marco de arriba lee un texto de la página y lo pinta de rojo; el de abajo, sin `allow-same-origin`, tiene un origen opaco de verdad y no puede tocar nada. Chrome, además, imprime un aviso en la consola de DevTools cuando detecta esa combinación. La consola del ejemplo (ábrelo en el editor) muestra:

```text
🐛 marco allow-same-origin → leí «Datos privados de la página anfitriona» y te lo cambié
   ¿se quitó su propio sandbox? → sí, ya no tiene
✅ marco solo allow-scripts → (aún nada)
```

La regla: nunca des `allow-scripts allow-same-origin` a la vez a HTML en el que no confías.

## Mismo origen y otro origen

Esa pared entre documentos es la **política del mismo origen**, el cerrojo central de la seguridad en el navegador (lo viste al estudiar cómo funciona la web: esquema + host + puerto forman el origen). Dos documentos del mismo origen pueden leerse; de orígenes distintos, no.

[[exercise:06-mismo-origen-vs-otro-origen.md-]]

Desde la página anfitriona, `iframe.contentDocument` es el documento de dentro del marco… **solo si es del mismo origen**. Si el marco es de otro sitio, el navegador devuelve `null`: tu código no ve nada de él, y el suyo no ve nada del tuyo. Por eso puedes embeber el vídeo de otra empresa sin que ese vídeo lea tu página, y por eso para comunicarte con un marco de otro origen hace falta un buzón especial, `postMessage` (capítulo de JavaScript).

```text
marco A (mismo origen) → contentDocument: lo leo
   su texto: Contenido del marco A
marco B (otro origen) → contentDocument: null
```

## `allow`: permisos para el marco

Aparte del sandbox, el navegador controla qué **funciones potentes** puede usar un marco (la cámara, el micrófono, la ubicación, la pantalla completa, la reproducción automática…) con la **política de permisos**. Por defecto, un marco de otro origen **no** las tiene: la página anfitriona debe concedérselas con el atributo `allow`.

En la lección de audio y vídeo quedó esto pendiente. Un vídeo **mudo** puede empezar solo siempre, también dentro de un iframe. Un vídeo **con sonido** necesita que la persona haya interactuado con la página y, si está en un marco de **otro origen**, además que la página anfitriona le pase ese permiso con `allow="autoplay"`; un marco del mismo origen lo hereda sin pedirlo (el permiso vale por defecto para `'self'`). Aquí se ve con dos marcos con `sandbox` (origen opaco, así que cuentan como de otro origen):

[[exercise:07-allow-autoplay.md]]

Ábrelo en el editor (después de haber pulsado en LearnWeb, que cuenta como interacción): el marco de la izquierda, sin `allow`, se queda en «⏸ bloqueado»; el de la derecha, con `allow="autoplay"`, suena solo (una melodía de 12 s; páralo con sus controles). En las tarjetas de la teoría los dos se quedan parados: la propia tarjeta no tiene permiso de autoplay que delegar. Varios permisos se separan con `;` y se puede acotar a qué orígenes se conceden: `allow="camera 'self'; fullscreen *"`.

| Valor de `allow` | Concede… |
|---|---|
| `autoplay` | reproducir audio o vídeo **con sonido** sin que la persona pulse ▶ |
| `fullscreen` | pantalla completa (`requestFullscreen`) |
| `camera`, `microphone` | la cámara y el micrófono |
| `geolocation` | la ubicación |
| `clipboard-read`, `clipboard-write` | leer y escribir el portapapeles |
| `picture-in-picture` | el vídeo en una ventanita flotante |

`allow` **concede** funciones; `sandbox` las **quita**. Un marco bien montado usa los dos: el mínimo de tokens de `sandbox` y solo los permisos de `allow` que necesite.

## Sitios que rechazan ser embebidos

No todo se puede embeber. Un sitio puede **prohibir** que otra página lo meta en un iframe, y muchos lo hacen: bancos, redes sociales, buscadores, paneles de administración. Lo consiguen enviando una cabecera `X-Frame-Options: DENY` o, mejor, una `Content-Security-Policy` con `frame-ancestors` (que dice **qué** orígenes pueden embeberlos).

[[exercise:08-sitio-que-rechaza-el-marco.md-]]

Cuando un sitio lo prohíbe, el navegador no carga la página: el marco se queda vacío y en la consola de DevTools aparece algo como «Refused to display … in a frame because it set X-Frame-Options to 'deny'». Es una defensa contra el *clickjacking*: una página maligna que embebe tu banco, lo tapa con botones falsos y te engaña para que pulses donde no crees. Este ejemplo necesita red (un sitio externo de verdad); ábrelo en el editor o con ↗, no en una tarjeta.

## Por qué la vista previa de LearnWeb es un iframe

Ya tienes todas las piezas para entender la propia aplicación. Todo lo que ves correr en LearnWeb está dentro de un `<iframe>`, y ese marco no es siempre el mismo:

[[exercise:09-por-que-la-vista-previa-es-un-iframe.md]]

Las **tarjetas** de la teoría, como la de arriba, son un `srcdoc` con `sandbox="allow-scripts"`: un documento sin `allow-same-origin`, es decir, con **origen opaco**. Por eso en ellas `location.href` es `about:srcdoc` y `location.origin` es `"null"`; y por eso (lo adelantó la lección de audio) un ejemplo que carga subtítulos o datos de `assets/` necesita `crossorigin` y CORS: para ese marco, hasta los archivos del propio tema son «de otro origen».

El **editor** y el **diálogo** que se abre al hacer clic en una tarjeta (o con «▶ Run»), en cambio, ejecutan el ejemplo como una **página de verdad**, servida en `http://localhost:3001`, un puerto distinto del `5174` de la aplicación. Así la vista previa es de **otro origen** que el editor —no puede tocarlo, igual que el marco B del ejemplo 06— pero tiene un origen real con el que funcionan el almacenamiento, las rutas a `assets/` y todo lo de una web normal. Compruébalo: haz clic en la tarjeta y compara sus valores con los del diálogo.

```text
En la tarjeta:             location.href → about:srcdoc   · location.origin → null
En el diálogo o el editor: location.href → http://localhost:3001/preview/…  · origin → http://localhost:3001
```

## Bestiario

- **Un «sandbox» que no aísla nada.** Síntoma: embebes HTML ajeno con `sandbox="allow-scripts allow-same-origin"` creyéndolo seguro, y su script entra en tu página, la lee y la cambia. Causa: sobre un documento del mismo origen (y un `srcdoc` hereda tu origen), esos dos tokens juntos devuelven el origen **y** los scripts, así que el marco puede alcanzar `parent.document` y hasta quitarse el `sandbox`. Solución: no concedas esa pareja a contenido en el que no confías; si necesitas scripts aislados, deja `allow-scripts` sin `allow-same-origin` (origen opaco). → [ver ejemplo](05-sandbox-allow-same-origin-trampa.md)
- **El marco se queda vacío.** Síntoma: embebes otra web y no aparece nada; en DevTools lees «Refused to display … X-Frame-Options» o un error de `frame-ancestors`. Causa: ese sitio prohíbe que lo embeban (defensa contra el clickjacking). Solución: no se puede saltar desde el cliente; usa lo que el sitio ofrezca para embeber (un reproductor, una API, un botón oficial) o enlázalo con un `<a>`. → [ver ejemplo](08-sitio-que-rechaza-el-marco.md)

## Resumen

- `<iframe src="…">` embebe otra página; pon siempre `title` (accesibilidad), `width`/`height` (reservan el hueco) y `loading="lazy"` si está más abajo.
- `srcdoc` lleva el documento dentro del atributo; escapa las comillas dobles de dentro con `&quot;` o usa comillas simples.
- `sandbox` quita permisos: vacío lo prohíbe todo y cada token (`allow-scripts`, `allow-forms`, `allow-popups`, `allow-same-origin`…) devuelve uno; concede lo mínimo.
- 🐛 `allow-scripts allow-same-origin` sobre un documento del mismo origen no aísla: el marco puede entrar en tu página y quitarse el sandbox.
- La política del mismo origen separa los documentos: `iframe.contentDocument` es `null` entre orígenes distintos; para hablar con un marco ajeno, `postMessage`.
- `allow` concede funciones potentes (`autoplay`, `fullscreen`, `camera`…); por eso un vídeo con sonido en un marco de otro origen necesita `allow="autoplay"` para arrancar solo (uno mudo arranca siempre).
- Muchos sitios prohíben ser embebidos con `X-Frame-Options` o `frame-ancestors`; el marco se queda vacío.
- La vista previa de LearnWeb es un iframe: `srcdoc` opaco (`about:srcdoc`) en las tarjetas, página real en `localhost:3001` en el diálogo «▶ Run» y en el editor.

## Para profundizar

- [MDN: `<iframe>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/iframe)
- [MDN: el atributo `sandbox`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#sandbox)
- [MDN: Política del mismo origen](https://developer.mozilla.org/es/docs/Web/Security/Same-origin_policy)
- [web.dev: La cabecera Permissions-Policy](https://developer.chrome.com/docs/privacy-security/permissions-policy)
- [MDN: `X-Frame-Options`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
