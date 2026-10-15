# Anatomía de un documento

## Por qué importa

Un archivo HTML no es solo «lo que se ve». Sus primeras líneas le dicen al navegador qué reglas aplicar, cómo convertir los bytes en letras y en qué idioma está el texto. Si faltan, el navegador no da error: adivina. Y cuando adivina mal aparecen los fallos más desconcertantes de la web: CSS que funciona sin motivo y deja de funcionar al «arreglar» la página, o tildes convertidas en `Ã³`.

En esta lección usamos documentos completos (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`), que en LearnWeb se escriben en un bloque **HTML-FULL**.

## El esqueleto mínimo

Toda página HTML comparte esta estructura:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mi primera página</title>
  </head>
  <body>
    <h1>Hola, documento</h1>
  </body>
</html>
```

Visto como árbol, que es como lo guarda el navegador:

```text
documento
├── <!DOCTYPE html>          ← no es un elemento: es una instrucción para el navegador
└── html  (lang="es")        ← la raíz
    ├── head                 ← información SOBRE el documento: no se dibuja
    │   ├── meta charset
    │   ├── meta viewport
    │   └── title
    └── body                 ← el contenido: lo que se ve
        └── h1
```

| Pieza | Para qué sirve |
|---|---|
| `<!DOCTYPE html>` | activa el **modo estándar** del navegador |
| `<html lang="es">` | raíz del documento; `lang` declara el idioma del contenido |
| `<head>` | metadatos: codificación, título, hojas de estilo, scripts, descripción… |
| `<meta charset="utf-8">` | cómo convertir los bytes del archivo en caracteres |
| `<meta name="viewport">` | cómo se adapta la página a la pantalla de un móvil |
| `<title>` | el nombre del documento: pestaña, historial, marcadores, buscadores |
| `<body>` | todo el contenido visible |

Este ejemplo es ese esqueleto, con un comentario en cada pieza. Su script imprime lo que entendió el navegador: el nombre del DOCTYPE, el modo, la codificación, el idioma y el título.

[[exercise:01-documento-minimo.md]]

```text
DOCTYPE      → html
modo         → CSS1Compat
codificación → UTF-8
idioma       → es
título       → Mi primera página
```

## `<!DOCTYPE html>` y los modos del navegador

A finales de los 90 cada navegador interpretaba el CSS a su manera, con errores que miles de páginas daban por buenos. Cuando los navegadores empezaron a seguir el estándar, no podían romper esas páginas viejas. La solución fue el **doctype sniffing**: mirar la primera línea del documento para decidir qué reglas aplicar.

| Modo | Cuándo | `document.compatMode` |
|---|---|---|
| **estándar** (*no-quirks*) | `<!DOCTYPE html>` (o doctypes modernos) | `"CSS1Compat"` |
| **casi estándar** (*limited-quirks*) | algunos doctypes antiguos «Transitional» | `"CSS1Compat"` |
| **quirks** | sin DOCTYPE, o con uno antiguo o mal escrito | `"BackCompat"` |

En **quirks mode** el navegador imita deliberadamente los fallos de entonces: acepta números sin unidad (`width: 300` como si fuera `300px`), colores sin `#`, calcula de otra forma las alturas en porcentaje y la tipografía de las tablas, y decenas de rarezas más. `<!DOCTYPE html>` es la forma más corta de pedir el modo estándar; no distingue mayúsculas (`<!doctype html>` también vale) y debe ser lo primero del archivo.

Este documento no tiene DOCTYPE y usa CSS con dos errores. En quirks mode los acepta: la caja sale amarilla y de 300 px.

[[exercise:02-sin-doctype-quirks.md-]]

Ábrelo desde la galería del tema y verás la caja amarilla y estrecha, y `document.compatMode → BackCompat` en la consola (el botón ↗ de la barra de la vista previa lo abre además como página independiente, en su propia pestaña). Aquí se muestra como código por un motivo curioso: las tarjetas de vista previa de esta teoría son documentos `srcdoc` (incrustados como texto dentro de un iframe), y la especificación dice que un documento `srcdoc` **nunca** entra en quirks mode, tenga DOCTYPE o no.

El mismo documento con DOCTYPE pasa al modo estándar. El CSS roto se ignora (la caja ocupa todo el ancho y no tiene fondo) y la segunda caja enseña la solución real: escribir CSS válido.

[[exercise:03-con-doctype-estandar.md]]

Lo peligroso del quirks mode no es que la página se vea mal, sino que se ve *bien* por casualidad. El día que alguien añade el DOCTYPE (o copia el CSS a otro proyecto), todo se descoloca y nadie entiende por qué.

## Caracteres y bytes: `<meta charset>`

Un archivo no contiene letras, contiene **bytes** (números del 0 al 255). Una **codificación** es la tabla que dice qué bytes forman cada carácter:

| Codificación | `A` | `ó` | `€` | Notas |
|---|---|---|---|---|
| ASCII | `41` | — | — | solo 128 caracteres: inglés sin tildes |
| windows-1252 | `41` | `F3` | `80` | un byte por carácter; solo idiomas de Europa occidental |
| **UTF-8** | `41` | `C3 B3` | `E2 82 AC` | de 1 a 4 bytes; todo Unicode; compatible con ASCII |

Hoy casi toda la web usa UTF-8, y tu editor guarda los archivos en UTF-8. El problema es que el navegador recibe solo bytes y tiene que **saber** con qué tabla leerlos. Si usa la equivocada, aparece el *mojibake* (palabra japonesa para «caracteres transformados»): los dos bytes de `ó` leídos como windows-1252 son dos caracteres, `Ã` y `³`.

[[exercise:04-bytes-y-codificaciones.md-]]

```text
caracteres → 19
bytes      → 24
en hex     → 43 61 6e 63 69 c3 b3 6e 3a 20 c3 b1 61 6e 64 c3 ba 20 32 30 20 e2 82 ac
leído como UTF-8        → Canción: ñandú 20 €
leído como windows-1252 → CanciÃ³n: Ã±andÃº 20 â‚¬
windows-1252 leído como UTF-8 → Canci�n
```

¿Cómo decide el navegador? En este orden, se queda con lo primero que encuentra:

1. Una **marca BOM** al principio del archivo (unos bytes especiales que algunos editores añaden).
2. La cabecera HTTP `Content-Type: text/html; charset=utf-8` que envía el servidor.
3. Un `<meta charset="utf-8">` dentro de los **primeros 1024 bytes** del archivo (el navegador los examina antes de empezar a leer el documento en serio).
4. Si nada de lo anterior existe, **adivina**: normalmente usa la codificación antigua de tu idioma (windows-1252 en español). Los navegadores, además, evitan «adivinar» UTF-8 en páginas servidas por HTTP, precisamente para que nadie dependa de la suerte.

En la vista previa de LearnWeb no puedes provocar el fallo quitando la `<meta>`: su servidor ya envía `charset=utf-8` en la cabecera, y la cabecera manda. Por eso el ejemplo usa dos documentos `data:` dentro de iframes, que no traen cabecera. Los dos contienen exactamente los mismos bytes; solo el segundo declara su codificación:

[[exercise:05-mojibake-sin-charset.md]]

La receta es sencilla: guarda tus archivos en UTF-8 y escribe `<meta charset="utf-8">` como **primer** elemento del `<head>`, antes del `<title>` y de cualquier otro texto. Así cae siempre dentro de los primeros 1024 bytes.

> **Desde Python:** es exactamente lo que pasa con `bytes` y `str`. `'ó'.encode('utf-8')` da `b'\xc3\xb3'`, y `b'\xc3\xb3'.decode('cp1252')` da `'Ã³'`. `<meta charset>` cumple el papel del parámetro `encoding=` de `open(...)`: decir con qué tabla leer. La diferencia es que Python, si no puede decodificar, lanza `UnicodeDecodeError`; el navegador nunca falla: enseña basura.

## `head` y `body`: lo que se ve y lo que no

El `<head>` solo admite unos pocos elementos que describen el documento:

| Elemento | Para qué |
|---|---|
| `<meta>` | codificación, viewport, descripción, datos para redes sociales… |
| `<title>` | el título del documento |
| `<link>` | recursos enlazados: hojas de estilo, icono, precargas |
| `<style>` | CSS escrito en el propio documento |
| `<script>` | JavaScript (también puede ir en el `body`) |
| `<base>` | cambia la URL base contra la que se resuelven las rutas relativas |

Todo lo demás pertenece al `<body>`. Y aquí está la sorpresa: las etiquetas `<html>`, `<head>` y `<body>` son **opcionales** en el código, pero los tres elementos existen **siempre** en el documento. Si no los escribes, el parser los crea: abre `head` al ver el primer metadato y lo cierra en cuanto aparece algo que no puede ir en él (un párrafo, un texto, una imagen), momento en que abre `body`. Lo que llegue después, aunque sea una `<meta>`, ya va al `body`.

[[exercise:06-head-y-body-implicitos.md-]]

```text
raíz del documento      → HTML
padre de title          → HEAD
padre del primer p      → BODY
padre de la meta tardía → BODY
```

Que se *puedan* omitir no significa que convenga: escribir `<html>`, `<head>` y `<body>` deja claro dónde empieza cada parte y evita que un elemento colocado fuera de sitio cambie de lugar sin avisar. En la lección sobre el parser verás que esto no es un caso aislado: el navegador repara *todo* el HTML que le llega.

## `title`: el nombre del documento

El `<title>` es obligatorio en un documento válido y no se dibuja en la página. Aparece en la pestaña, en el historial, en los marcadores, como título del resultado en los buscadores, y es lo primero que anuncia un lector de pantalla al abrir la página. Un buen título va de lo concreto a lo general: `Carrito (3) · Tienda Ejemplo`, no `Tienda Ejemplo - Página`.

## `lang`: el idioma del contenido

`lang` declara el idioma con una etiqueta estándar (BCP 47): `es`, `es-MX`, `en`, `en-GB`, `pt-BR`… Puede ir en `<html>` para todo el documento y en cualquier elemento para cambiarlo en un fragmento (`<span lang="en">feedback</span>`). Parece un detalle, pero el navegador lo usa para muchas cosas:

- **lectores de pantalla**: eligen la voz y la pronunciación (sin `lang`, un lector configurado en inglés leerá tu español con acento inglés);
- **partir palabras con guion** (`hyphens: auto` en CSS): necesita saber el idioma;
- **mayúsculas y minúsculas**: en turco, la mayúscula de `i` es `İ`;
- **traducción automática**, **corrector ortográfico**, elección de fuente en chino/japonés y selectores CSS como `:lang(es)`.

[[exercise:07-title-y-lang.md]]

## `viewport`: la página en el móvil

Los primeros móviles con navegador «de verdad» tenían que mostrar webs pensadas para monitores de escritorio. Su truco: dibujar la página en un lienzo virtual de unos 980 px de ancho y encogerla hasta caber en la pantalla. Las páginas antiguas se veían enteras (y diminutas).

```text
sin meta viewport                         con width=device-width, initial-scale=1
┌──────────────────────────┐              ┌──────────┐
│ página maquetada a 980px │  → encogida  │ página a │  ← maquetada al ancho real
│ texto diminuto           │    al ancho  │ 390px,   │    de la pantalla
└──────────────────────────┘    del móvil │ legible  │
                                          └──────────┘
```

`<meta name="viewport" content="width=device-width, initial-scale=1">` le dice al móvil: «esta página sabe adaptarse; usa el ancho real de la pantalla». Sin ella, ningún diseño *responsive* (capítulo de CSS) funciona en el móvil. No añadas `maximum-scale=1` ni `user-scalable=no`: impiden hacer zoom a quien lo necesita para leer.

Dentro de la vista previa no lo verás: los navegadores solo aplican el viewport al documento principal de la pestaña, nunca a un iframe, y la vista previa de LearnWeb es un iframe. Para comprobarlo, abre `01-documento-minimo.md`, pulsa el botón ↗ de la barra de la vista previa (abre la página en su propia pestaña) y activa allí el modo dispositivo de DevTools (icono de móvil, o <kbd>⇧</kbd> <kbd>⌘</kbd> <kbd>M</kbd>). Después borra la línea del viewport, vuelve a pulsar ↗ y compara: sin ella, el texto se ve diminuto.

## Bestiario

**🐛 El CSS funciona, añades `<!DOCTYPE html>` y la página se descoloca.**
- *Síntoma:* medidas sin unidad o colores sin `#` que «funcionaban»; alturas en porcentaje que cambian; `document.compatMode` vale `"BackCompat"`.
- *Causa:* sin DOCTYPE el navegador entra en **quirks mode** e imita fallos antiguos, entre ellos aceptar ese CSS inválido.
- *Solución:* `<!DOCTYPE html>` como primera línea de **todo** documento y CSS válido (`300px`, `#ffd700`). → [ver ejemplo](02-sin-doctype-quirks.md) · [ver la versión corregida](03-con-doctype-estandar.md)

**🐛 Las tildes y la `ñ` salen como `Ã³`, `Ã±` o `�`.**
- *Síntoma:* *mojibake*: `CanciÃ³n` (bytes UTF-8 leídos como windows-1252) o `Canci�n` (bytes windows-1252 leídos como UTF-8).
- *Causa:* el navegador no sabe con qué codificación se guardó el archivo (no hay cabecera, ni BOM, ni `<meta charset>` en los primeros 1024 bytes) y adivina mal; o el archivo se guardó en una codificación y se declara otra.
- *Solución:* guardar en UTF-8 y poner `<meta charset="utf-8">` al principio del `<head>`; si controlas el servidor, enviar `charset=utf-8` en `Content-Type`. → [ver ejemplo](05-mojibake-sin-charset.md)

**🐛 El DOM no se parece a tu archivo: aparecen `head` y `body` que no escribiste, y una `<meta>` acaba en el `body`.**
- *Síntoma:* en DevTools aparecen `<html>`, `<head>` y `<body>` que no escribiste, y una `<meta>` (o un `<link>`) que escribiste «arriba» aparece dentro del `body`.
- *Causa:* el parser crea siempre los tres elementos; cierra el `head` en cuanto encuentra contenido visible, y lo que venga después va al `body`.
- *Solución:* escribe la estructura completa y pon todos los metadatos en el `<head>`, antes de cualquier contenido. → [ver ejemplo](06-head-y-body-implicitos.md)

## Resumen

- Todo documento empieza con `<!DOCTYPE html>`: sin él, el navegador entra en **quirks mode** (`document.compatMode === "BackCompat"`) e imita fallos de los años 90.
- `<html lang="…">` es la raíz; `lang` afecta a lectores de pantalla, guiones, mayúsculas, traducción y ortografía.
- `<head>` contiene metadatos que no se dibujan; `<body>`, el contenido visible.
- Un archivo son **bytes**; `<meta charset="utf-8">` (en los primeros 1024 bytes) o la cabecera HTTP dicen cómo leerlos. Si nadie lo dice, el navegador adivina y aparece el *mojibake*.
- `<title>` nombra el documento en la pestaña, el historial y los buscadores.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` hace que el móvil use su ancho real.
- El parser crea `html`, `head` y `body` aunque no los escribas, y mueve al `body` lo que llega tarde.

## Para profundizar

- [MDN — Modo quirks y modo estándar](https://developer.mozilla.org/es/docs/Web/HTML/Quirks_Mode_and_Standards_Mode)
- [MDN — El elemento `<meta>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/meta)
- [W3C — Declarar la codificación de caracteres en HTML](https://www.w3.org/International/questions/qa-html-encoding-declarations.es)
- [web.dev — Estructura de un documento HTML (Learn HTML)](https://web.dev/learn/html/document-structure)
- [Quirks Mode Standard (la lista exacta de rarezas)](https://quirks.spec.whatwg.org/)
