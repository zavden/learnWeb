# Portapapeles, arrastrar y soltar, y archivos

## Por qué importa

Además de los formularios y la red, los datos entran y salen de una página por tres puertas que la persona usa a diario: el **portapapeles** (copiar un cupón, pegar filas de una hoja de cálculo), **arrastrar y soltar** (mover una tarjeta de columna, soltar una factura desde el escritorio) y los **archivos** del disco (importar recetas, ver una foto antes de subirla). Las tres tienen algo en común: dan acceso a cosas que no son de la página. Lo que hay en el portapapeles puede ser una contraseña; lo que arrastras por encima de una web puede no ser para ella; un archivo es parte del disco de alguien.

Por eso las tres están **protegidas**, y casi todas sus sorpresas vienen de ahí: permisos, foco, gestos del usuario, datos que no se pueden leer hasta el momento justo. Esta lección cumple las promesas del módulo de formularios: qué hay dentro de los `File` de `input.files`, cómo se leen y cómo se relaciona el evento `paste` con el `beforeinput` que filtraba lo pegado.

## El portapapeles

`navigator.clipboard` es la API moderna: todos sus métodos devuelven **promesas**, porque el sistema operativo copia y pega aparte, y porque el navegador puede tener que preguntar.

| Método | Qué hace | Requisitos en Chrome |
|---|---|---|
| `writeText(texto)` | copia texto | página con el **foco**; permiso de escritura (concedido a la pestaña activa) |
| `write([ClipboardItem])` | copia en varios formatos | lo mismo |
| `readText()` | lee texto | foco y permiso de **lectura**: la primera vez, Chrome pregunta |
| `read()` | lee todos los formatos | lo mismo |

Todo exige además un contexto seguro (HTTPS o `localhost`) y, dentro de un iframe, que la página que lo contiene lo permita con `allow="clipboard-read; clipboard-write"`. La vista previa del editor y la de «▶ Run» lo tienen; las tarjetas de la teoría no, así que ahí el portapapeles siempre se rechaza con `NotAllowedError`:

[[exercise:01-copiar-y-leer.md]]

[[exercise:01-copiar-y-leer.md-(script.js)]]

```text
Listo: pulsa «Copiar código» y pégalo donde quieras; luego pulsa «Leer el portapapeles»
// Tras pulsar «Copiar código» (con ▶ o en el editor):
✅ copiado → OTONO-CAFE-15
// Tras pulsar «Leer el portapapeles» y permitirlo en el aviso de Chrome:
📋 el portapapeles tiene → OTONO-CAFE-15
// En la tarjeta de arriba, cualquiera de los dos botones:
⚠️ NotAllowedError: la tarjeta no tiene permiso para el portapapeles; ábrela con ▶ o en el editor
```

Escribir es casi libre; leer, no. Por eso `readText()` va siempre detrás de un botón que la persona pulsa sabiendo lo que hace, nunca al cargar.

### Sin foco no hay copia

El error más común con `writeText` es llamarlo cuando la página no tiene el foco: al cargar, o un rato después de un clic, cuando la persona ya está en otra ventana. Chrome comprueba el **foco** en el momento de copiar; Safari y Firefox exigen además que la llamada venga de un **gesto del usuario** reciente, como el `isTrusted` de la lección «Eventos personalizados»:

[[exercise:02-copiar-sin-gesto.md-(script.js)]]

```text
Listo: pulsa «Copiar ya»; luego «Copiar dentro de 3 s» y haz clic fuera de la vista previa
🐛 al cargar → NotAllowedError: Failed to execute 'writeText' on 'Clipboard': Document is not focused.
// Tras pulsar «Copiar ya»:
✅ clic → copiado MX-4471-2093-OAX
// Tras pulsar «Copiar dentro de 3 s» y hacer clic en el editor antes de que pasen:
⏳ copiaré dentro de 3 s…
🐛 3 s después → NotAllowedError: Failed to execute 'writeText' on 'Clipboard': Document is not focused.
// (si te quedas en la vista previa, sale «✅ 3 s después → copiado MX-4471-2093-OAX»)
```

La vista previa es un iframe: al hacer clic en el editor, el foco se va a la aplicación y la página de ejemplo lo pierde, igual que una pestaña cuando cambias de ventana. La regla: copia **dentro** del listener del clic, y trata siempre el rechazo (con un mensaje como «Selecciona el código y cópialo tú»).

### Los eventos `copy`, `cut` y `paste`

La otra mitad del portapapeles no necesita permisos: los eventos **`copy`**, **`cut`** y **`paste`** se disparan cuando la persona copia, corta o pega (con el teclado o con el menú), y su `event.clipboardData` es un `DataTransfer` que se puede leer (en `paste`) o escribir (en `copy` y `cut`, con `preventDefault()`), solo durante ese evento. La página no puede espiar el portapapeles: solo ve lo que la persona decide pegar en ella.

[[exercise:03-eventos-copy-y-paste.md]]

[[exercise:03-eventos-copy-y-paste.md-(script.js)]]

```text
Listo: selecciona un ingrediente y cópialo; luego pega filas de una hoja de cálculo
// Tras seleccionar «2 kg de maíz pozolero» y copiarlo (Cmd + C):
📋 copy → 1 línea(s) + la fuente
// Tras copiar tres filas en una hoja de cálculo y pegarlas en el cuadro:
📋 paste → tipos: text/html, text/plain · 3 fila(s) importadas
// Tras pegar una palabra suelta, sin tabuladores:
📋 paste → tipos: text/plain · sin tabuladores: lo pego como texto normal
```

Los tipos que llegan dependen de quién copió: una hoja de cálculo pone la tabla en `text/html` y las filas, separadas por tabuladores, en `text/plain`; algunas aplicaciones añaden más formatos. Pega en un editor de texto lo que has copiado de la receta y verás la fuente debajo. Úsalo con mesura: a nadie le gusta que una web cambie lo que copia.

En la lección «Validación con JavaScript» filtraste lo pegado con `beforeinput` (su `inputType` era `insertFromPaste`). Las dos herramientas conviven: `paste` llega primero, a cualquier elemento, con todos los formatos; `beforeinput` llega después, solo a un campo editable, con el texto que se va a insertar.

### Copiar con formato

`navigator.clipboard.write()` copia un **`ClipboardItem`** con varias versiones del mismo contenido, cada una un `Blob` con su tipo. Quien pegue elige: un correo o un documento toman `text/html`; un editor de texto o un campo de contraseña, `text/plain`:

[[exercise:04-copiar-con-formato.md-(script.js)]]

```text
¿ClipboardItem admite image/png? true · ¿image/webp? false
Listo: pulsa «Copiar receta con formato» y pega en el cuadro (y en un correo)
// Tras pulsar «Copiar receta con formato» y pegar en el cuadro:
✅ copiado en dos tipos: text/html y text/plain (5 líneas)
📋 paste → tipos: text/html, text/plain
   ¿el HTML trae <strong>? true · texto: Café de olla…
```

Los formatos garantizados son `text/plain`, `text/html` e `image/png`; `ClipboardItem.supports(tipo)` lo pregunta (en Chrome). El navegador **limpia** el HTML al copiar y al pegar (sin scripts ni atributos peligrosos), así que una web no puede colar código en otra a través del portapapeles. Como con `writeText`, en una tarjeta de la teoría el botón se rechaza.

## Arrastrar y soltar

El arrastre nativo de HTML funciona entre partes de la página, entre ventanas y desde el escritorio. Un elemento se vuelve arrastrable con `draggable="true"` (los enlaces, las imágenes y el texto seleccionado ya lo son), y el arrastre es una conversación de eventos entre el **origen** y el **destino**, con un objeto `DataTransfer` que viaja entre los dos:

| Evento | Dónde | Para qué |
|---|---|---|
| `dragstart` | origen | guardar los datos (`setData(tipo, valor)`), `effectAllowed`, imagen (`setDragImage`) |
| `dragenter`, `dragover` | destino, sin parar | decidir si se acepta: `preventDefault()` y `dropEffect` |
| `dragleave` | destino | quitar el resaltado |
| `drop` | destino | leer los datos (`getData(tipo)`, `files`) y actuar |
| `dragend` | origen | limpiar; `dropEffect` dice si se soltó (`'none'` si se canceló) |

`effectAllowed` (en el origen: `'move'`, `'copy'`, `'link'`, `'copyMove'`…) y `dropEffect` (en el destino) deciden el cursor que ve la persona. Y `setDragImage(elemento, x, y)` cambia la imagen fantasma que sigue al puntero. En el ejemplo, cada comanda viaja con su `id` como `text/plain`:

[[exercise:05-arrastrar-y-soltar.md]]

[[exercise:05-arrastrar-y-soltar.md-(script.js)]]

```text
Listo: arrastra una comanda a otra columna, o usa sus botones ◀ ▶
// Tras arrastrar «Mesa 2 · Pozole rojo» a «En cocina»:
dragstart → Mesa 2 · Pozole rojo · effectAllowed: move
drop en «En cocina» → getData: order-2
✅ Mesa 2 · Pozole rojo → En cocina (arrastre)
dragend → dropEffect: move
// Tras pulsar ▶ en «Mesa 3 · Tacos al pastor»:
✅ Mesa 3 · Tacos al pastor → En cocina (botón)
```

El arrastre nativo solo funciona con el ratón (en pantallas táctiles, a medias), así que **cada movimiento tiene también su botón**, y los dos caminos llaman a la misma función `moveOrder`. ¿Y el arrastre con Pointer Events de la lección «Teclado, ratón y puntero»? Úsalo para **mover cosas dentro de tu interfaz** con control total (un control deslizante, un mapa, una lista que se reordena con animación, el dedo); el arrastre nativo, para **llevar datos** de un sitio a otro, sobre todo desde fuera de la página: archivos, enlaces, texto de otra ventana.

### `dragover` sin `preventDefault`

Por defecto, ningún elemento admite que le suelten nada. Una zona dice «aquí sí» **cancelando `dragover`**, el evento que llega sin parar mientras el puntero está encima. Si no lo cancela, el cursor muestra 🚫 y, al soltar, el navegador no dispara `drop`. El código de la zona puede ser perfecto y no ejecutarse nunca:

[[exercise:06-dragover-sin-preventdefault.md-(script.js)]]

```text
— simulado: arrastrar «Café de Chiapas» a cada zona —
🐛 dragover sin preventDefault → la zona no acepta: no habrá drop
✅ drop → Café de Chiapas añadido al pedido
Listo: arrastra los productos a las dos zonas (o usa «Añadir»)
// Tras arrastrar «Pan de muerto» hasta la zona 🐛 y soltar (cursor 🚫):
🐛 dragover sin preventDefault → la zona no acepta: no habrá drop
// Tras arrastrarlo hasta la zona ✅ y soltar:
✅ drop → Pan de muerto añadido al pedido
```

La función `simulateDrag` del ejemplo hace lo que el navegador: dispara `dragover` y solo dispara `drop` si alguien lo canceló (`dispatchEvent` devuelve `false`). Arrastra tú para comprobarlo. El `preventDefault()` de `drop` es distinto: impide la acción por defecto de soltar, que para un enlace o un archivo es **abrirlo**. MDN recomienda cancelar también `dragenter`, como dice la especificación; en Chrome y Firefox basta con `dragover`.

### Los datos están protegidos mientras arrastras

Mientras arrastras algo por encima de una página, esa página no puede leerlo: podrías estar llevando un texto de tu banco a otra ventana, y la web que queda en medio no tiene por qué verlo. Durante `dragenter` y `dragover`, el `DataTransfer` está en **modo protegido**: `getData()` devuelve `''`, y solo se pueden leer los **tipos** (`types`). Los datos se leen en `drop`, cuando la persona ya ha decidido soltar ahí:

[[exercise:07-getdata-en-dragover.md-(script.js)]]

```text
Listo: arrastra un ingrediente a cada olla, y después el enlace «Receta completa»
// Tras arrastrar «Epazote» hasta la olla 🐛 y soltar (no lo acepta):
🐛 dragover → getData: '' · ¿types incluye application/x-ingredient? true → no acepto
// Tras arrastrarlo hasta la olla ✅ y soltar:
✅ dragover → types incluye application/x-ingredient → acepto
✅ drop → getData: Epazote
// Tras arrastrar el enlace «Receta completa» hasta la olla ✅:
✅ dragover → no es un ingrediente → no acepto
```

Un **tipo propio** como `application/x-ingredient` es la forma limpia de reconocer tus arrastres: ningún otro programa lo usa, y aparece en `types` aunque el valor esté protegido. Este bicho solo se ve con un arrastre de verdad: un `DragEvent` creado desde JavaScript con `new DataTransfer()` no está protegido, así que los tests automáticos no lo detectan.

### Soltar archivos

Cuando se arrastran archivos desde el escritorio, `types` incluye `'Files'` y, en `drop`, **`dataTransfer.files`** es una `FileList`: la misma clase que `input.files`, con un objeto `File` por archivo. El `<input type="file">` es además la alternativa de teclado (y la única en muchos móviles):

[[exercise:08-soltar-archivos.md]]

[[exercise:08-soltar-archivos.md-(script.js)]]

```text
Listo: arrastra archivos desde el escritorio hasta la zona, o elígelos con el botón
// Tras soltar factura-octubre.pdf (24 KB) y caja-golpeada.jpg (1.2 MB):
drop → 2 archivo(s)
   📎 factura-octubre.pdf · 24 kB · application/pdf
   📎 caja-golpeada.jpg · 1.2 MB · image/jpeg
```

Las dos líneas de `window` del ejemplo evitan una sorpresa clásica: si sueltas un archivo **fuera** de la zona, la acción por defecto del navegador es abrirlo en la pestaña, y tu página (con todo lo que la persona había escrito) desaparece. Para carpetas y archivos enormes existe además `dataTransfer.items`, con un `DataTransferItem` por elemento (`kind` es `'file'` o `'string'`).

## Leer archivos: la File API

Un **`File`** es un `Blob` (bytes con un tipo MIME, como el de `response.blob()` del módulo «Red y almacenamiento») con un nombre: `name`, `size` (en **bytes**), `type` (el que deduce el sistema por la extensión, o `''`) y `lastModified`. Crearlo no lee nada: es una referencia al archivo. Leerlo es asíncrono:

| Método | Devuelve |
|---|---|
| `file.text()` | `Promise<string>`, el contenido decodificado como UTF-8 |
| `file.arrayBuffer()` | `Promise<ArrayBuffer>`, los bytes (capítulo 8) |
| `file.stream()` | un `ReadableStream`, para leer por trozos (lección «Streams y progreso») |
| `file.slice(inicio, fin)` | otro `Blob` con un trozo, sin leer nada todavía |

[[exercise:09-leer-un-archivo.md]]

[[exercise:09-leer-un-archivo.md-(script.js)]]

```text
Listo: elige recipes.csv o recipes.json (descárgalos antes con los enlaces)
// Tras elegir recipes.csv (3 recetas):
📄 recipes.csv · 81 bytes · text/csv
primeros 4 bytes → 6e 61 6d 65
texto → 81 caracteres
✅ 3 recetas → Sopa de lima, Pozole rojo, Chiles en nogada
// Tras elegir recipes.json (2 recetas):
📄 recipes.json · 128 bytes · application/json
primeros 4 bytes → 5b 0a 20 20
texto → 127 caracteres
✅ 2 recetas → Café de olla, Atole de guayaba
// Tras elegir una foto, foto.jpg:
⛔ foto.jpg: solo se admiten archivos .csv o .json
```

Fíjate en el JSON: 128 bytes pero 127 caracteres. La «é» de «Café» ocupa dos bytes en UTF-8; el capítulo 8 lo explica a fondo. Y como en «Soporte con archivos adjuntos», el ejemplo profesional del módulo de formularios, `accept` solo filtra el diálogo: el tipo y el tamaño se comprueban en `change`, y el resultado va a `setCustomValidity`. Los enlaces de descarga funcionan con «▶ Run» y en el editor; en una tarjeta, el iframe aislado no permite descargas.

### Vistas previas con `URL.createObjectURL`

Para enseñar una foto antes de subirla no hace falta leerla: **`URL.createObjectURL(file)`** devuelve una URL `blob:` que apunta al archivo, y sirve como `src` de un `<img>`, un `<video>` o un enlace de descarga. El precio es que el navegador **guarda el archivo en memoria** mientras la URL exista, y existe hasta que llamas a **`URL.revokeObjectURL(url)`** o se cierra la página:

[[exercise:10-vista-previa-y-revokeobjecturl.md-(script.js)]]

```text
— simulado: una foto en memoria (taza.svg, 277 bytes) —
🐛 sin revocar, quitada → fetch(url) → 200 · 277 bytes siguen en memoria
✅ revocada, quitada → fetch(url) → TypeError: Failed to fetch
FileReader → data URL de 398 caracteres para 277 bytes (data:image/svg+xml;base64,…)
URLs blob vivas: 1 · Listo: elige fotos; desmarca la casilla para ver cómo se acumulan
```

Con una foto de 277 bytes no pasa nada; con una galería de fotos de 5 MB que se eligen, se quitan y se vuelven a elegir, la pestaña crece cientos de megas. Revoca en cuanto la imagen ha cargado (ya decodificada, no necesita la URL) o cuando quitas la vista previa. La alternativa antigua es `FileReader`, una API con eventos (`load`, `error`) de antes de las promesas: `readAsDataURL` convierte el archivo en una URL `data:` con los bytes en base64, que no hay que revocar pero ocupa un tercio más y es un texto enorme en memoria. Hoy, `file.text()`, `file.arrayBuffer()` y las URLs `blob:` la sustituyen.

> **Desde Python:** `file.text()` es como `open(ruta, encoding='utf-8').read()` y `file.arrayBuffer()`, como abrir en modo `'rb'`. La diferencia es que el navegador nunca te deja abrir una ruta: solo los archivos que la persona elige o suelta, y siempre de forma asíncrona.

## Bestiario

- **`writeText` falla con `Document is not focused`.**
  Síntoma: copiar funciona al pulsar el botón, pero falla al cargar la página o en un temporizador (`NotAllowedError`).
  Causa: Chrome exige que la página tenga el foco al copiar; otros navegadores, un gesto reciente del usuario. En un iframe sin `allow="clipboard-write"`, se rechaza siempre.
  Solución: copia dentro del listener del clic y trata el rechazo con un mensaje alternativo.
  → [ver ejemplo](02-copiar-sin-gesto.md)
- **El `drop` no se dispara nunca.**
  Síntoma: el cursor muestra 🚫 sobre la zona y, al soltar, no pasa nada, aunque hay un listener de `drop`.
  Causa: nadie cancela `dragover`, así que la zona no admite soltar.
  Solución: `event.preventDefault()` en `dragover` (y en `drop`, para que no se abra lo soltado).
  → [ver ejemplo](06-dragover-sin-preventdefault.md)
- **`getData` devuelve una cadena vacía en `dragover`.**
  Síntoma: una zona que decide si acepta según los datos arrastrados no acepta nunca.
  Causa: durante `dragenter` y `dragover` el `DataTransfer` está protegido: solo se leen los tipos.
  Solución: decide con `dataTransfer.types` (mejor con un tipo propio) y lee los datos en `drop`.
  → [ver ejemplo](07-getdata-en-dragover.md)
- **La pestaña ocupa cada vez más memoria con las vistas previas.**
  Síntoma: después de elegir y quitar muchas fotos, la página consume cientos de megas; la URL `blob:` de una foto quitada sigue respondiendo.
  Causa: cada `URL.createObjectURL` retiene su archivo hasta que se revoca o se cierra la página.
  Solución: `URL.revokeObjectURL(url)` cuando la imagen ha cargado o al quitar la vista previa.
  → [ver ejemplo](10-vista-previa-y-revokeobjecturl.md)

## Resumen

- `navigator.clipboard` copia (`writeText`, `write` con `ClipboardItem`) y lee (`readText`, `read`, con permiso) con promesas; exige foco, contexto seguro y, en un iframe, el atributo `allow`.
- Los eventos `copy`, `cut` y `paste` dan `clipboardData` sin permisos, solo durante el evento.
- Arrastrar y soltar: `draggable`, `setData` en `dragstart`, `preventDefault` en `dragover` para aceptar, `getData` en `drop`. Mientras se arrastra, solo se leen los `types`.
- Cada arrastre necesita su alternativa de teclado; para mover cosas dentro de tu interfaz, Pointer Events.
- Los archivos soltados llegan en `dataTransfer.files`, como los de `input.files`; cancela `dragover` y `drop` en `window` para que no se abran.
- Un `File` es un `Blob` con nombre: `text()`, `arrayBuffer()`, `slice()`, `stream()`. Valida tipo y tamaño tú: `accept` solo filtra el diálogo.
- `URL.createObjectURL` muestra un archivo sin leerlo, pero lo retiene hasta `URL.revokeObjectURL`.

## Para profundizar

- [MDN: Clipboard API](https://developer.mozilla.org/es/docs/Web/API/Clipboard_API)
- [MDN: API de arrastrar y soltar de HTML](https://developer.mozilla.org/es/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN: Usar archivos desde aplicaciones web](https://developer.mozilla.org/es/docs/Web/API/File_API/Using_files_from_web_applications)
- [web.dev: Unblocking clipboard access (en inglés)](https://web.dev/articles/async-clipboard)
- [javascript.info: File y FileReader](https://es.javascript.info/file)
