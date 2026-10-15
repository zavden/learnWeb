# Imágenes responsive en CSS

## Por qué importa

Las imágenes son el contenido más pesado y más rígido de una página: tienen un tamaño en píxeles y una proporción propias, y no se reacomodan como un texto. En la lección de imágenes del capítulo de HTML aprendiste a elegir **el archivo**: `srcset` y `sizes` para que el navegador descargue la versión justa, `<picture>` para cambiar de encuadre o de formato. Esta lección es la otra mitad: lo que decide el CSS. Cuánto mide la **caja** de la imagen, con qué proporción, cómo encaja la foto dentro de esa caja y qué parte se ve.

Cumple varias promesas del curso: el reset de imágenes que apareció en el módulo de flexbox, `object-fit` (el arreglo de la foto estirada en una fila flex y de las celdas de foto del módulo de grid) y una forma de elegir la densidad de una imagen de fondo, `image-set()`.

## El reset de imágenes, línea a línea

Casi todos los proyectos empiezan con estas tres líneas:

```css
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

Cada una arregla un problema distinto, y la segunda solo se entiende si conoces un detalle de los atributos `width` y `height`:

[[exercise:01-el-reset-de-imagenes.md]]

- **`max-width: 100%`**: una imagen nunca es más ancha que su contenedor. Sin ella, una foto de 960px desborda cualquier móvil. No es `width: 100%`, que **agrandaría** las imágenes pequeñas hasta llenar el contenedor y las vería borrosas.
- **`height: auto`**: en la lección de HTML pusiste `width` y `height` a cada `<img>` para que el navegador reservara su hueco antes de descargarla. Esos atributos equivalen a un `width` y un `height` en CSS. Si `max-width` encoge el ancho, el alto se queda en el valor del atributo y la foto se deforma. Con `height: auto`, el alto sale del ancho y de la proporción. ¿Qué proporción, si la imagen no ha llegado? La de los atributos: el navegador los convierte en `aspect-ratio: auto 480 / 330`, y el hueco reservado es exacto.
- **`display: block`**: una imagen es un elemento en línea y se apoya en la línea base, como una letra, dejando debajo el sitio de los trazos que bajan (lo viste en el módulo de flujo). Como bloque, ese hueco desaparece. Si la imagen debe seguir en línea (un icono junto a un texto), `vertical-align: middle` es la alternativa.

## La caja y la imagen: `object-fit`

Un `<img>` tiene dos tamaños: el de su **caja**, que decide el CSS, y el de la **imagen** que contiene (su tamaño natural). Cuando la caja tiene otra proporción que la imagen, `object-fit` decide cómo encaja la segunda en la primera, como `background-size` con un fondo:

| Valor | La imagen… | Proporción |
|---|---|---|
| `fill` (inicial) | se estira hasta llenar la caja | se deforma |
| `contain` | cabe entera; sobran bandas | se conserva |
| `cover` | llena la caja; se recorta lo que sobra | se conserva |
| `none` | conserva su tamaño natural, centrada | se conserva |
| `scale-down` | como `none`, o como `contain` si no cabe | se conserva |

[[exercise:02-object-fit.md]]

`object-fit` funciona igual con los vídeos (y con su póster). Es lo que arreglaba la foto estirada del módulo de flexbox: la fila estira la caja del `<img>`, y con `cover` la foto la llena recortada en vez de deformada.

### `object-position`: qué parte se queda

Cuando `cover` recorta, por defecto se queda con el **centro**. `object-position` elige otra parte, con la misma sintaxis que `background-position`: palabras clave (`top`, `left`) o porcentajes, que alinean el punto de la imagen con el mismo punto de la caja. `50% 6%` deja la imagen centrada en horizontal y casi pegada arriba.

[[exercise:03-object-position.md]]

En una galería real, cada foto tiene su punto de interés: guárdalo en el HTML con una custom property (`style="--focus: 50% 20%"`) y usa `object-position: var(--focus, 50% 50%)`.

### `object-fit` necesita una caja

El error más común con `object-fit` es esperar que haga algo en una caja que ya tiene la proporción de la imagen. Con `width: 100%` y `height: auto`, la caja se calcula **a partir de** la imagen, y no hay nada que recortar. Para que `cover` actúe, la caja necesita un tamaño propio en los dos ejes: un `height`, o una proporción con `aspect-ratio`.

[[exercise:04-object-fit-necesita-una-caja.md]]

## `aspect-ratio` con imágenes

En la lección de tamaños viste `aspect-ratio` en cajas vacías. Con imágenes, la receta de las miniaturas uniformes es siempre la misma:

```css
.thumb img {
  width: 100%;
  height: auto;            /* deja el alto libre… */
  aspect-ratio: 4 / 3;     /* …para que lo calcule la proporción */
  object-fit: cover;       /* y la foto se recorta para llenar la caja */
}
```

Las tres partes hacen falta, y `aspect-ratio` tiene dos formas de no hacer nada, ninguna con aviso. Solo calcula un lado que sea `auto`: con `width` y `height` a la vez, se ignora, y en un `<img>` el `height` puede venir del **atributo** sin que lo veas en tu CSS. Y en una caja con contenido es un mínimo: si el texto no cabe, la caja crece, salvo que tenga un `overflow` distinto de `visible`.

[[exercise:05-cuando-aspect-ratio-no-manda.md]]

### Dirección de arte con CSS

En la lección de HTML, `<picture>` servía para la **dirección de arte**: un encuadre vertical para el móvil y uno apaisado para el escritorio. Cuando basta con recortar distinto **la misma foto**, CSS lo hace solo: `aspect-ratio`, `object-fit: cover` y `object-position` dentro de una media query o, como aquí, de una container query.

[[exercise:06-direccion-de-arte-con-css.md]]

¿Cuándo hace falta `<picture>`? Cuando cada encuadre es **otro archivo**: una foto hecha aparte, un recorte tan cerrado que con la foto entera se perdería detalle, o un archivo más ligero para el móvil. Recortar con CSS no ahorra ni un byte: el móvil descarga la foto entera.

## `image-set()`: el `srcset` de los fondos

Una imagen de fondo no tiene `srcset`. Su equivalente en CSS es `image-set()`: una lista de versiones con su **densidad**, de la que el navegador elige la que mejor encaja con la pantalla. En una pantalla Retina (densidad 2, como la de un Mac), la de `2x`:

```css
.hero {
  background-image: url("valle-480.jpg");                               /* reserva */
  background-image: image-set("valle-480.jpg" 1x, "valle-960.jpg" 2x);
}
```

[[exercise:07-image-set.md]]

También puede elegir por **formato**, con `type()`: `image-set("valle.avif" type("image/avif"), "valle.jpg" type("image/jpeg"))`. El navegador se salta los tipos que no sabe mostrar, como hacían los `<source type>` de `<picture>`.

Lo que **no** entiende es el descriptor `w` de `srcset`. Copiar `"valle-480.jpg" 480w` en un `image-set()` hace la función inválida, y la declaración entera se ignora en silencio. Por eso conviene la línea de reserva de arriba: si `image-set()` falla (por un error o por un navegador antiguo), la cascada se queda con el `url()` anterior.

[[exercise:08-image-set-sin-reserva.md]]

Para elegir un fondo por **ancho**, se usan media queries o container queries con distintos `background-image`. Y si la imagen es contenido, la herramienta es un `<img>` con `srcset` y `sizes`. Recuerda que `sizes` describe el **CSS**: si a partir de 40rem la rejilla tiene tres columnas, `sizes="(width >= 40rem) 33vw, 100vw"` (`sizes` acepta la misma sintaxis de rangos que las media queries). Si `sizes` no coincide con el layout real, el navegador descarga un archivo equivocado.

## ¿`<img>` o fondo?

En el módulo de grid, las fotos que debían llenar una celda de cualquier proporción iban como fondo, con `role="img"` y un `aria-label`, porque `object-fit` aún no había llegado al curso. Con `object-fit`, ya no hace falta:

[[exercise:09-de-fondo-a-img.md]]

| | `<img>` + `object-fit` | `background-image` |
|---|---|---|
| Texto alternativo | `alt`, de verdad | solo con `role="img"` y `aria-label` |
| Elegir archivo | `srcset` y `sizes`, `<picture>` | `image-set()` (solo densidad y formato) |
| Carga diferida | `loading="lazy"` | no |
| Al imprimir | se imprime | no, salvo que el usuario lo pida |
| Botón derecho → guardar | sí | no |
| Para | **contenido**: productos, fotos de una noticia, retratos | **decoración**: texturas, degradados, ilustraciones de fondo |

La regla: si quitar la imagen cambia lo que la página dice, es contenido y va en un `<img>`.

## Cómo verlo en DevTools

- En **Elements**, pasa el ratón por un `<img>`: un recuadro muestra su **tamaño renderizado** (la caja) y su **tamaño intrínseco** (la imagen), sus proporciones y el archivo que se cargó (**Current source**).
- En **Network**, con el filtro **Img**, ves qué archivo se descargó de verdad: útil para comprobar `image-set()` y `srcset`.
- El modo dispositivo, en **Responsive**, tiene un campo **DPR** (densidad). Con 1 y recargando, `image-set()` debería elegir la versión `1x`.
- En **Computed**, un `<img>` con atributos muestra `aspect-ratio: auto 480 / 330`: la proporción que salió de ellos.

## Bestiario

- **La foto encoge y se deforma.** Síntoma: con `max-width: 100%`, la imagen cabe de ancho pero queda estirada a lo alto. Causa: el atributo `height` sigue fijando el alto. Solución: `height: auto` junto a `max-width: 100%`. → [ver ejemplo](01-el-reset-de-imagenes.md)
- **`object-fit: cover` no recorta nada.** Síntoma: las miniaturas siguen midiendo cada una su alto. Causa: con `height: auto`, la caja tiene la proporción de la imagen y no hay nada que encajar. Solución: dar a la caja un tamaño propio en los dos ejes, con `aspect-ratio` o un `height`. → [ver ejemplo](04-object-fit-necesita-una-caja.md)
- **`aspect-ratio` no hace nada.** Síntoma: la caja no sale con la proporción pedida. Causa: `width` y `height` fijados a la vez (también desde los atributos de un `<img>`), o un contenido que estira la caja. Solución: `height: auto`; en cajas con texto, `overflow: auto` o `min-height: 0`. → [ver ejemplo](05-cuando-aspect-ratio-no-manda.md)
- **El fondo con `image-set()` no aparece.** Síntoma: la caja se queda con su color de fondo. Causa: `image-set()` no acepta descriptores `w`; la declaración es inválida y se ignora entera. Solución: densidades (`1x`, `2x`) y un `background-image: url()` de reserva antes. → [ver ejemplo](08-image-set-sin-reserva.md)

## Resumen

- El reset: `max-width: 100%` (nunca más ancha que su contenedor), `height: auto` (proporción, incluso antes de cargar) y `display: block` (sin hueco de línea base).
- Un `<img>` tiene una caja (CSS) y una imagen (natural); `object-fit` las encaja (`cover`, `contain`…) y `object-position` elige qué parte se ve.
- `object-fit` necesita una caja con tamaño propio: `width: 100%`, `height: auto` y `aspect-ratio`.
- `aspect-ratio` solo calcula un lado `auto`; con contenido es un mínimo, salvo con `overflow` distinto de `visible`.
- Mismo archivo con otro recorte: CSS. Otro archivo: `<picture>`.
- `image-set()` elige un fondo por densidad o formato, nunca por ancho; con una reserva `url()` antes.
- Contenido en `<img>`, decoración en fondos.

## Para profundizar

- [MDN: object-fit](https://developer.mozilla.org/es/docs/Web/CSS/object-fit)
- [MDN: image-set()](https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set)
- [web.dev: Responsive images (Learn Design)](https://web.dev/learn/design/responsive-images)
- [web.dev: Setting height and width on images is important again](https://web.dev/articles/optimize-cls#images-without-dimensions)
- [Especificación: CSS Images Level 4](https://www.w3.org/TR/css-images-4/)
