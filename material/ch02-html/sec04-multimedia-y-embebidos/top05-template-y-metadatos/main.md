# Template y metadatos

## Por qué importa

Esta lección cierra el módulo con dos ideas que no se dibujan pero sostienen media web.

La primera es `<template>`: un trozo de HTML que el navegador guarda en reserva, **inerte**, para que tu código lo copie tantas veces como haga falta. Es la base de casi todo lo que muestra listas (parcelas, productos, mensajes) sin pegar HTML a mano con texto. De ahí saltamos a `<slot>` y al *shadow DOM*, un adelanto de los Web Components del capítulo 6.

La segunda son los **metadatos**: las etiquetas del `<head>` que no ve quien entra en la página, pero sí Google, las redes sociales y el navegador. Decidir cómo aparece tu página en los resultados de búsqueda, qué tarjeta se ve al compartirla en un chat y qué icono sale en la pestaña es, casi todo, cuestión de `<meta>` y `<link>`.

Ya conoces varios de estos metadatos de la lección del documento (`charset`, `viewport`, `description`, `canonical`, Open Graph). Aquí los juntamos y añadimos el resto.

## El elemento `template`

Dentro de `<template>` puedes escribir cualquier HTML, pero el navegador lo trata distinto a todo lo demás: lo parsea y lo **recuerda**, sin dibujarlo. Su contenido está **inerte**.

[[exercise:01-template-inerte.md-]]

Inerte significa tres cosas, y las tres se comprueban en la consola: el template no se ve (la hoja de estilos del navegador le da `display: none`), sus imágenes **no se descargan** y sus scripts **no se ejecutan**. Además, su contenido no vive en el documento normal, sino en una bolsa aparte que se llama `template.content`:

```text
¿se ve el template en la página? → no (display:none)
nodos dentro de template.content → 1
¿cuántos <article> hay ya en la página? → 0
¿se ejecutó el <script> de dentro? → no
¿intentó cargar la imagen rota? → no (ni se pidió)
```

Para usar la plantilla, se **clona** su contenido con `template.content.cloneNode(true)` (el `true` copia también los hijos) y se inserta donde quieras. Una plantilla escrita una sola vez genera así todas las copias que necesites:

[[exercise:02-clonar-template.md]]

Es el patrón de siempre para pintar una lista a partir de datos: una plantilla con los huecos, un bucle que la clona, rellena cada copia y la inserta. Lo harás de verdad en el capítulo de JavaScript; aquí basta con quedarte con la pieza de HTML.

Como su contenido está inerte, un `<template>` puede colocarse donde normalmente no cabría ese HTML: es uno de los pocos elementos que el modelo de contenido admite como hijo directo de un `<ul>` o de un `<table>` (lo viste en la lección de listas). El navegador no lo dibuja, así que no rompe la estructura: guarda ahí la plantilla de la fila, al lado de donde se va a usar.

## El template se vacía

Hay un error que todo el mundo comete una vez. `template.content` es un **DocumentFragment**: al insertarlo en el documento, sus nodos **se mueven** de la bolsa al documento, no se copian. La primera vez funciona; la segunda, el template ya está vacío y no aparece nada.

[[exercise:03-template-se-vacia.md-]]

```text
❌ tras el 1.er append, el template tiene → 0 nodo(s)
❌ filas en la lista → 1 (esperabas 2)
✅ filas en la lista → 2
✅ el template sigue teniendo → 1 nodo(s)
```

La solución es la regla de antes: inserta siempre una **copia**, `template.content.cloneNode(true)`, no el `content` directamente. Así el original se queda intacto y lo puedes reutilizar.

## `slot` y shadow DOM: un adelanto

A veces no quieres copiar una plantilla desde JavaScript, sino crear un **elemento propio** (`<info-card>`, `<user-avatar>`) con su estructura y sus estilos encapsulados, de forma que nada de fuera los pise. Eso son los **Web Components**, y su lección completa es el capítulo 6. Aquí solo asomamos la pieza de HTML.

[[exercise:04-slot-y-shadow-dom.md]]

Un `<template shadowrootmode="open">` colocado dentro de un elemento crea su **shadow DOM** durante el propio parseo (es el *shadow DOM declarativo*, que Chrome admite). El shadow DOM es un pequeño árbol privado, con su propio CSS, que se dibuja en lugar del contenido del elemento. El `<slot>` es un **hueco** dentro de ese árbol donde se proyecta el contenido «de luz»: el HTML que escribes fuera del template pero dentro del elemento. En el ejemplo, el borde, el título verde y la caja vienen del shadow DOM; el texto de la parcela, de la página. El selector `::slotted(p)` da estilo, desde dentro, al contenido proyectado.

## `meta` para buscadores y redes

Un `<meta name="…" content="…">` es un dato suelto sobre la página. Los que importan para que te encuentren y para compartir bien:

[[exercise:05-meta-para-buscadores-y-redes.md-]]

- **`description`**: el resumen (unos 155 caracteres) que el buscador suele mostrar bajo el título. No posiciona, pero decide si alguien hace clic.
- **`robots`**: instrucciones para los buscadores, `index, follow` (lo normal) o `noindex` (no aparezcas en los resultados), `nofollow` (no sigas mis enlaces).
- **Open Graph** (`<meta property="og:…">`): el título, la descripción, la URL y sobre todo la **imagen** (`og:image`, 1200 × 630) que se ven cuando compartes el enlace en WhatsApp, LinkedIn o Facebook. Sin ellos, cada red improvisa como puede.
- **Twitter Cards** (`<meta name="twitter:…">`): lo mismo para X; `twitter:card="summary_large_image"` pide la tarjeta con foto grande. Lo que no pongas, lo completa con las `og:`.

El `title` y `og:title` no son lo mismo: el `<title>` va de lo concreto a lo general para la pestaña y el buscador (`Carrito (3) · Tienda`), y el `og:title` es el titular para compartir.

## `link rel`: conectar con otros recursos

`<link>` relaciona la página con otros archivos o direcciones; el atributo `rel` dice qué tipo de relación es:

[[exercise:06-link-rel.md-]]

| `rel` | Para qué |
|---|---|
| `icon` | el icono de la pestaña y los marcadores |
| `apple-touch-icon` | el icono al guardar la web en la pantalla de inicio del iPhone |
| `canonical` | «la dirección oficial de esta página», para que el buscador no trate como duplicados la misma página con distintos parámetros |
| `preload` | pide **ya** un recurso que hará falta enseguida; necesita `as=` (`image`, `font`, `style`, `script`) para darle la prioridad correcta |
| `preconnect` | adelanta la conexión (DNS + TCP + TLS) con un dominio del que pronto pedirás algo |
| `alternate` | otra versión de esta página: en otro idioma (`hreflang`), un feed RSS (`type="application/rss+xml"`), una versión para imprimir… |
| `stylesheet` | una hoja de estilos (capítulo de CSS) |

Un `preload` mal puesto molesta: si precargas algo que luego no usas, Chrome avisa en la consola de que lo descargaste para nada. Por eso en el ejemplo la portada precargada es justo la imagen que aparece en el `<body>`.

## Datos estructurados: JSON-LD y microdatos

Más allá de `description` y Open Graph, puedes describir **qué es** tu contenido (un evento, una receta, un producto, una empresa) con el vocabulario de [schema.org](https://schema.org), y el buscador lo convierte en resultados enriquecidos (la estrella de valoración, el precio, la fecha del evento). Hay dos formas.

La primera, la recomendada hoy, es **JSON-LD**: un bloque de datos en un `<script type="application/ld+json">`. Ese `type` **no** es un tipo de script ejecutable, así que el navegador **nunca** corre ese código: solo lo guarda como texto para quien lo quiera leer.

[[exercise:07-json-ld-y-microdatos.md-]]

```text
JSON-LD (dato, no código ejecutado) → tipo: Event · nombre: Taller de compostaje
microdato itemprop="name" → Taller de compostaje
microdato itemprop="startDate" → 2026-11-21T10:00:00-06:00
```

La segunda son los **microdatos**: los mismos datos, pero incrustados en el HTML que ya se ve, con atributos. `itemscope` abre un objeto, `itemtype` dice de qué tipo es (una URL de schema.org) e `itemprop` etiqueta cada dato. Su ventaja es que no duplican la información; su inconveniente, que ensucian el marcado. La mayoría de los sitios prefieren JSON-LD por lo limpio que queda.

| | JSON-LD | Microdatos |
|---|---|---|
| Dónde vive | en un `<script>` del `<head>` | en los atributos del HTML visible |
| ¿Duplica datos? | sí (el texto va aparte) | no (etiqueta el texto que ya está) |
| Legibilidad del marcado | intacta | más recargada |
| Recomendación de Google | la preferida | válida |

Para ver qué saca un buscador de todo esto sin mirar el texto de la página, este pequeño «rastreador» recorre el `<head>` e imprime lo que leería:

[[exercise:08-lo-que-lee-un-buscador.md-]]

```text
título → Café de especialidad Yirgacheffe · Tostadero Aroma
description → Café de Etiopía, tueste claro, notas de bergamota y melocotón. Envío en 24 h.
robots → index, follow
Open Graph
  og:type → product
  og:title → Café Yirgacheffe · Tostadero Aroma
  og:description → Tueste claro, notas de bergamota y melocotón.
  og:image → https://aroma.example/cafes/yirgacheffe.jpg
JSON-LD → Product: Café Yirgacheffe · 12.50 EUR
```

Google ofrece una [prueba de resultados enriquecidos](https://search.google.com/test/rich-results) que hace justo esto con tu página de verdad y te dice qué datos ha entendido.

## Bestiario

- **La segunda copia del template no aparece.** Síntoma: insertas el contenido de un `<template>` en un bucle y solo sale el primer elemento; el template se queda vacío. Causa: `template.content` es un DocumentFragment, y al insertarlo **mueve** sus nodos en vez de copiarlos, así que a la segunda vuelta ya no hay nada que mover. Solución: inserta siempre una copia, `template.content.cloneNode(true)`. → [ver ejemplo](03-template-se-vacia.md)

## Resumen

- `<template>` guarda HTML inerte: no se dibuja, no descarga imágenes y no ejecuta scripts; su contenido vive en `template.content`.
- Para usarlo, clónalo con `template.content.cloneNode(true)` e insértalo; una plantilla genera muchas copias.
- 🐛 insertar `template.content` directamente **mueve** sus nodos y vacía el template; clona siempre.
- `<template shadowrootmode="open">` crea un shadow DOM declarativo y `<slot>` proyecta en él el contenido de la página: es el adelanto de los Web Components (capítulo 6).
- `<meta>` para buscadores y redes: `description`, `robots`, Open Graph (`og:image` para compartir) y Twitter Cards.
- `<link rel>` conecta con recursos: `icon`, `apple-touch-icon`, `canonical`, `preload` (con `as`), `preconnect`, `alternate` (`hreflang`, feed).
- Datos estructurados con schema.org: JSON-LD en un `<script type="application/ld+json">` (que nunca se ejecuta) o microdatos con `itemscope`/`itemprop`.

## Para profundizar

- [MDN: `<template>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/template)
- [MDN: `<slot>` y shadow DOM declarativo](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)
- [MDN: metadatos del documento con `<meta>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/meta)
- [Open Graph protocol](https://ogp.me/)
- [Google Search Central: datos estructurados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
