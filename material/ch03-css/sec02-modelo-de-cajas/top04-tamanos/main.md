# Tamaños

## Por qué importa

Darle a una caja `width: 300px; height: 200px` parece la forma natural de controlar el diseño, y es la fuente de los diseños más frágiles: el texto se sale de las tarjetas al traducir la página, las columnas desbordan en el móvil, un `height: 50%` no hace nada. CSS ya calcula muy bien los tamaños por sí solo; tu trabajo es casi siempre **poner límites** (como mucho, como poco, con esta proporción) en lugar de fijar números.

En esta lección verás qué significa realmente `auto`, por qué los porcentajes de altura fallan, cómo usar `min-*` y `max-*`, los tamaños calculados a partir del contenido y `aspect-ratio`.

## `auto` no es un número

`width` y `height` valen `auto` por defecto, y `auto` significa «calcúlalo tú según el tipo de caja»:

| Caja | `width: auto` | `height: auto` |
|---|---|---|
| bloque (`div`, `p`, `section`…) | **llena** el ancho disponible del contenedor | la altura de su contenido |
| `inline-block`, flotante, posicionada | se **ajusta** a su contenido (*shrink-to-fit*) | la altura de su contenido |
| inline (`span`, `a`) | no se puede fijar: la decide el texto | no se puede fijar: la decide la línea |

Por eso un `<div>` sin ancho ocupa toda la línea y un botón (que es `inline-block`) mide lo que su texto. Recuerda que, con `box-sizing: content-box`, ese ancho calculado es el del **contenido**: padding y borde se suman por fuera (lo viste en la primera lección del módulo).

[[exercise:01-auto-segun-el-tipo-de-caja.md]]

## Porcentajes: ancho sí, alto casi nunca

Un porcentaje se calcula sobre el **bloque contenedor** (normalmente el padre):

- `width: 50%` funciona siempre, porque el ancho del padre no depende de sus hijos.
- `height: 50%` solo funciona si el padre tiene una **altura definida** (`height` en una unidad, o la del viewport…). Si la altura del padre es `auto`, depende del contenido, que a su vez depende del hijo: el cálculo sería circular, así que el navegador trata el porcentaje como `auto`.

[[exercise:02-altura-en-porcentaje.md]]

Es el origen del clásico «`height: 100%` no hace nada». Antes se arreglaba encadenando `height: 100%` desde `html` y `body`; hoy hay soluciones mejores: unidades de viewport (`min-height: 100dvh`, de la lección de unidades) y, más adelante, flexbox y grid, que estiran los hijos sin porcentajes.

Recuerda también la rareza que viste en la lección de unidades: los **márgenes y paddings verticales** en porcentaje se calculan sobre el **ancho** del contenedor, no sobre su alto.

## `min-*` y `max-*`: límites en lugar de números

Las propiedades `min-width`, `max-width`, `min-height` y `max-height` no fijan un tamaño: lo **acotan**. El navegador calcula el tamaño normal y luego lo encaja entre los límites, en este orden:

1. Calcula `width` (o `height`).
2. Si supera `max-width`, usa `max-width`.
3. Si queda por debajo de `min-width`, usa `min-width`. Si `min` y `max` chocan, **gana `min`**.

Los dos patrones más útiles de todo CSS salen de aquí:

```css
.reading { max-width: 60ch; }     /* columna legible que nunca desborda */
.hero    { min-height: 60vh; }    /* al menos esta altura, pero crece con el contenido */
img      { max-width: 100%; height: auto; }   /* imágenes que nunca se salen */
```

[[exercise:03-min-y-max.md]]

### Una altura fija es una promesa que el contenido no conoce

Fijar `height` en una caja con texto casi siempre es un error: otro idioma, el zoom del usuario o una frase más larga hacen que el contenido no quepa. Ese contenido no se recorta: se **desborda** por debajo y se monta sobre lo que viene después. Usa `min-height` para garantizar un tamaño mínimo y deja que la caja crezca. Qué hacer con lo que se desborda (recortarlo, añadir scroll) es el tema de la lección de overflow.

[[exercise:04-altura-fija-y-desbordamiento.md]]

## Tamaños intrínsecos: `min-content`, `max-content`, `fit-content`

Además de longitudes y porcentajes, `width` acepta palabras clave que calculan el tamaño **a partir del contenido**:

- `min-content`: lo más estrecha posible sin desbordar; el texto se corta en todas las oportunidades y la caja mide lo que su palabra más larga.
- `max-content`: lo más ancha que pide el contenido; el texto no se corta nunca, aunque se salga del contenedor.
- `fit-content`: como `max-content`, pero sin pasar del ancho disponible. Es el comportamiento de un `inline-block`, aplicado a un bloque: perfecto para etiquetas, títulos con fondo o botones.

[[exercise:05-tamanos-intrinsecos.md]]

Estos conceptos reaparecerán en flexbox y grid, donde el navegador usa los tamaños `min-content` y `max-content` de los elementos para repartir el espacio.

## `aspect-ratio`

`aspect-ratio: 16 / 9` le da a una caja una **proporción**: si conoces un lado (normalmente el ancho), el otro se calcula. Sirve para reservar el hueco de vídeos, mapas o imágenes antes de que carguen, para tarjetas cuadradas o para miniaturas uniformes.

Funciona como un mínimo: si el contenido no cabe en la proporción, la caja **crece** en alto en lugar de desbordar (salvo que fijes `height` u `overflow`). Es la misma idea que en la lección de imágenes: allí los atributos `width` y `height` le daban al navegador la proporción de la foto.

[[exercise:06-aspect-ratio.md]]

## Cómo verlo en DevTools

En **Elements → Computed**, el diagrama de cajas muestra el tamaño final del contenido y, en la lista de propiedades, `width` y `height` aparecen ya resueltos en píxeles. Si una propiedad aparece tachada en **Styles** o su valor computado no es el que escribiste (por ejemplo, `height: 50%` resuelto a la altura del contenido), busca a quién le falta una altura definida.

## Bestiario

- **`height: 50%` (o `100%`) no hace nada.** Síntoma: la caja mide lo mismo que su contenido. Causa: el padre tiene `height: auto`, así que no hay altura de la que calcular el porcentaje. Solución: da una altura definida al padre, o usa `min-height` con unidades de viewport (y, más adelante, flexbox o grid). → [ver ejemplo](02-altura-en-porcentaje.md)
- **El texto se sale de la tarjeta y pisa lo siguiente.** Síntoma: con otro idioma o más zoom, el contenido desborda por abajo. Causa: una `height` fija que el contenido supera. Solución: `min-height` en lugar de `height`. → [ver ejemplo](04-altura-fija-y-desbordamiento.md)

## Resumen

- `auto` llena el ancho en los bloques y se ajusta al contenido en `inline-block`; `height: auto` es la altura del contenido.
- Los porcentajes de ancho funcionan siempre; los de alto necesitan un padre con altura definida.
- Prefiere límites: `max-width` para columnas e imágenes, `min-height` para cajas con contenido; si `min` y `max` chocan, gana `min`.
- `min-content`, `max-content` y `fit-content` calculan el ancho a partir del contenido.
- `aspect-ratio` fija una proporción y crece si el contenido no cabe.

## Para profundizar

- [MDN: Dimensionar elementos en CSS](https://developer.mozilla.org/es/docs/Learn/CSS/Building_blocks/Sizing_items_in_CSS)
- [MDN: aspect-ratio](https://developer.mozilla.org/es/docs/Web/CSS/aspect-ratio)
- [web.dev: Sizing units e intrinsic sizing](https://web.dev/learn/css/sizing)
- [CSS Box Sizing Level 3 (especificación)](https://www.w3.org/TR/css-sizing-3/)
